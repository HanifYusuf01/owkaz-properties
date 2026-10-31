export {};

interface GoogleCredentialResponse {
  credential: string;
}

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
