import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';

declare global {
  interface Window {
    google?: { translate?: { TranslateElement?: unknown } };
    googleTranslateElementInit?: () => void;
  }
}

// Google Translate's widget mutates text nodes directly, which can clash with React's own
// reconciliation (removeChild/insertBefore on nodes GT has already rearranged). This patches
// both to fail softly instead of throwing, which is the standard mitigation for this combo.
function patchDomForGoogleTranslate() {
  if ((window as { __gtDomPatched?: boolean }).__gtDomPatched) return;
  (window as { __gtDomPatched?: boolean }).__gtDomPatched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Node.prototype.removeChild = function (child: any) {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as any;
  } as any;

  const originalInsertBefore = Node.prototype.insertBefore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Node.prototype.insertBefore = function (newNode: any, referenceNode: any) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as any;
  } as any;
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', label: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'pcm', label: 'Pidgin', flag: '🇳🇬' },
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
  const ref = useRef<HTMLDivElement>(null);

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
      {/* Hidden Google widget the custom UI below drives */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      <div ref={ref} className="fixed bottom-5 right-5 z-[100] notranslate" translate="no">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={!ready}
          aria-label="Change language"
          className="flex items-center gap-2 pl-3 pr-2.5 py-2.5 rounded-full bg-navy text-white shadow-xl border border-white/10 hover:bg-navy-mid transition-colors disabled:opacity-60"
        >
          <Languages size={16} />
          <span className="text-xs font-semibold">{active.flag} {active.label}</span>
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
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
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
