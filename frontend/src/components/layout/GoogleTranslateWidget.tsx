import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';

function patchDomForGoogleTranslate() {
  if ((window as { __gtDomPatched?: boolean }).__gtDomPatched) return;
  (window as { __gtDomPatched?: boolean }).__gtDomPatched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Node.prototype.removeChild = function (this: Node, child: any) {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as any;
  } as any;

  const originalInsertBefore = Node.prototype.insertBefore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Node.prototype.insertBefore = function (this: Node, newNode: any, referenceNode: any) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as any;
  } as any;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ig', label: 'Igbo' },
  { code: 'pcm', label: 'Pidgin' },
];

const COOKIE_NAME = 'googtrans';

function getCookieLang(): string {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-z-]+)/);
  return match ? match[1] : 'en';
}

function setCookieLang(code: string) {
  const value = `/en/${code}`;
  document.cookie = `${COOKIE_NAME}=${value}; path=/`;
  document.cookie = `${COOKIE_NAME}=${value}; path=/; domain=${window.location.hostname}`;
}

export const GoogleTranslateWidget = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(getCookieLang);
  const [ready, setReady] = useState(false);
  const [tucked, setTucked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // On phones the button tucks away while scrolling down so it never sits on top of content, and returns when scrolling up.
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 639px)');
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (phone.matches && Math.abs(y - last) > 8) {
        setTucked(y > last && y > 120);
        if (y > last) setOpen(false);
        last = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    patchDomForGoogleTranslate();

    if (document.getElementById('google-translate-script')) {
      setReady(true);
      return;
    }

    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window.google!.translate as any).TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element',
      );
      setReady(true);
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectLanguage = (code: string) => {
    setCurrent(code);
    setOpen(false);
    setCookieLang(code);

    const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} />

      <div
        ref={ref}
        className={`fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[100] notranslate transition-transform duration-300 ${tucked ? 'translate-y-24 sm:translate-y-0' : ''}`}
        translate="no"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={!ready}
          aria-label="Change language"
          className="flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:pl-3 sm:pr-2.5 sm:py-2.5 rounded-full bg-navy text-white shadow-xl border border-white/10 hover:bg-navy-mid transition-colors disabled:opacity-60"
        >
          <Languages size={18} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-xs font-semibold">{active.label}</span>
          <ChevronDown size={13} className={`hidden sm:block transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute bottom-full right-0 mb-2 w-44 bg-white border border-border rounded-xl shadow-2xl overflow-hidden">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => selectLanguage(l.code)}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-left transition-colors ${
                  l.code === current ? 'bg-cream text-navy font-semibold' : 'text-ink hover:bg-cream'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
