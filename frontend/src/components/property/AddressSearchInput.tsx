import { useEffect, useRef, useState } from 'react';
import { Search, CheckCircle2, LocateFixed, Loader2 } from 'lucide-react';
import { loadGoogleMaps } from '../../utils/googleMaps';
import { googleMapsSearchUrl, googleMapsEmbedUrl } from '../../utils/googleMapsLink';

interface AddressSearchInputProps {
  latitude: number | null;
  longitude: number | null;
  onSelect: (loc: { lat: number; lng: number; displayName: string }) => void;
}

// Address search via Google Places Autocomplete — needs a billing-enabled Google Cloud project
// (VITE_GOOGLE_MAPS_API_KEY), but gives far better Nigerian address coverage than free alternatives.
export const AddressSearchInput = ({ latitude, longitude, onSelect }: AddressSearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [confirmedName, setConfirmedName] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !inputRef.current) return;

        const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'ng' },
          fields: ['geometry', 'formatted_address', 'name'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const loc = place.geometry?.location;
          if (!loc) return;
          const displayName = place.formatted_address ?? place.name ?? '';
          setConfirmedName(displayName);
          onSelectRef.current({ lat: loc.lat(), lng: loc.lng(), displayName });
        });

        setStatus('ready');
      })
      .catch(() => setStatus('error'));

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPin = latitude != null && longitude != null;

  // Uses the browser's built-in Geolocation API — free, no key, works for brand-new areas
  // that Google's address search hasn't indexed yet, as long as the device shares its GPS/network location.
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support geolocation.");
      return;
    }
    setLocationError('');
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let displayName = 'Current location';

        try {
          const g = await loadGoogleMaps();
          const geocoder = new g.maps.Geocoder();
          const { results } = await geocoder.geocode({ location: { lat, lng } });
          if (results[0]) displayName = results[0].formatted_address;
        } catch {
          // Reverse geocoding is a nice-to-have label; the coordinates themselves are already accurate.
        }

        setConfirmedName(displayName);
        if (inputRef.current) inputRef.current.value = displayName;
        onSelectRef.current({ lat, lng, displayName });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. You can still search for the address instead.'
            : "Couldn't get your current location. You can still search for the address instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">
        Pinpoint Exact Location <span className="text-muted normal-case font-normal">(optional, but recommended)</span>
      </label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          disabled={status !== 'ready'}
          placeholder="Search for the property's address…"
          className="w-full pl-8 pr-3 py-2.5 border border-border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal disabled:opacity-60"
        />
      </div>

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={isLocating}
        className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline disabled:opacity-60 disabled:no-underline"
      >
        {isLocating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
        {isLocating ? 'Getting your location…' : "Can't find it? Use your current GPS location"}
      </button>
      <p className="text-[11px] text-muted mt-0.5">Best if you're physically at the property — works even for brand-new areas not yet on the map.</p>

      {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}

      {status === 'error' && (
        <p className="text-xs text-red-500 mt-1.5">Couldn't load address search. You can still submit without pinning a location.</p>
      )}

      {hasPin && (
        <div className="mt-2">
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-teal/5 border border-teal/20 rounded-lg rounded-b-none">
            <span className="flex items-center gap-1.5 text-xs text-navy min-w-0">
              <CheckCircle2 size={13} className="text-teal flex-shrink-0" />
              <span className="truncate">{confirmedName || 'Location pinned'}</span>
            </span>
            <a
              href={googleMapsSearchUrl({ lat: latitude!, lng: longitude! })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-teal hover:underline flex-shrink-0"
            >
              Open in Google Maps
            </a>
          </div>
          <iframe
            title="Location preview"
            src={googleMapsEmbedUrl({ lat: latitude!, lng: longitude! })}
            className="w-full h-48 border border-t-0 border-teal/20 rounded-b-lg"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};
