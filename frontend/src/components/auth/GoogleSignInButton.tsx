import { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

export const GoogleSignInButton = ({ onCredential }: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !window.google?.accounts || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredentialRef.current(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '320',
        text: 'continue_with',
      });
    };

    if (window.google) {
      renderButton();
      return () => { cancelled = true; };
    }

    const existing = document.getElementById('google-identity-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', renderButton);
      return () => { cancelled = true; existing.removeEventListener('load', renderButton); };
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = renderButton;
    document.body.appendChild(script);
    return () => { cancelled = true; };
  }, [clientId]);

  if (!clientId) return null;

  return <div ref={buttonRef} className="w-full flex justify-center" />;
};
