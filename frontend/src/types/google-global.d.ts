export {};

interface GoogleCredentialResponse {
  credential: string;
}

// The `google` global is shared by three unrelated integrations (Sign-In, Maps, Translate),
// so all of it must be declared in one place — TypeScript's declaration merging requires every
// `Window.google` augmentation across the codebase to agree on the exact same type.
declare global {
  interface Window {
    google?: typeof google & {
      accounts?: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
      translate?: { TranslateElement?: unknown };
    };
    __onGoogleMapsLoaded?: () => void;
    googleTranslateElementInit?: () => void;
  }
}
