declare global {
  interface Window {
    google?: typeof google;
    __onGoogleMapsLoaded?: () => void;
  }
}

let loadPromise: Promise<typeof google> | null = null;

/**
 * Loads the Google Maps JS API (Places library only — used for address autocomplete).
 * Uses the official `callback` param rather than `<script>.onload`, because with
 * `loading=async` the outer script can finish loading before the `places` library
 * itself has finished attaching to `window.google.maps` — checking onload alone races that.
 */
export function loadGoogleMaps(): Promise<typeof google> {
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) {
      reject(new Error('Google Maps API key is not configured (VITE_GOOGLE_MAPS_API_KEY).'));
      return;
    }

    window.__onGoogleMapsLoaded = () => {
      if (window.google?.maps?.places) resolve(window.google);
      else reject(new Error('Google Maps failed to initialize.'));
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=__onGoogleMapsLoaded`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load the Google Maps script.'));
    document.head.appendChild(script);
  });

  return loadPromise;
}
