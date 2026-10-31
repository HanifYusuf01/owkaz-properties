type MapLocation = { lat: number; lng: number } | (string | undefined | null)[];

function buildQuery(location: MapLocation): string {
  if (Array.isArray(location)) {
    return `${location.filter(Boolean).join(', ')}, Nigeria`;
  }
  return `${location.lat},${location.lng}`;
}

export function googleMapsSearchUrl(location: MapLocation): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildQuery(location))}`;
}

export function googleMapsEmbedUrl(location: MapLocation): string {
  const zoom = Array.isArray(location) ? 13 : 17;
  return `https://maps.google.com/maps?q=${encodeURIComponent(buildQuery(location))}&z=${zoom}&output=embed`;
}
