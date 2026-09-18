type MapLocation = { lat: number; lng: number } | (string | undefined | null)[];

function buildQuery(location: MapLocation): string {
  if (Array.isArray(location)) {
    // Address text — append the country to disambiguate free-text geocoding.
    return `${location.filter(Boolean).join(', ')}, Nigeria`;
  }
  // Exact coordinates — must stay as a clean "lat,lng" pair, nothing appended,
  // or Google's geocoder fails to parse it as a point and falls back to a world view.
  return `${location.lat},${location.lng}`;
}

/** Builds a Google Maps URL that opens in Google Maps (web or app) — no API key needed. */
export function googleMapsSearchUrl(location: MapLocation): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildQuery(location))}`;
}

/**
 * Builds a classic Google Maps iframe embed URL — the legacy `output=embed` format,
 * which (unlike the JS API or the official Embed API) needs no API key and no billing.
 * Exact coordinates get a close, street-level zoom; free-text addresses stay a bit
 * wider since the geocoded point is only approximate.
 */
export function googleMapsEmbedUrl(location: MapLocation): string {
  const zoom = Array.isArray(location) ? 13 : 17;
  return `https://maps.google.com/maps?q=${encodeURIComponent(buildQuery(location))}&z=${zoom}&output=embed`;
}
