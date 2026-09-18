/** Normalizes a Nigerian state name for loose matching between the map's GeoJSON labels
 * (e.g. "Abuja Federal Capital Territory") and free-text values saved on properties
 * (e.g. "FCT", "FCT - Abuja", "Abuja"). */
export function normalizeStateName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/federal capital territory/g, 'fct')
    .replace(/[^a-z]/g, '');

  if (cleaned.includes('fct') || cleaned.includes('abuja')) return 'fct';
  return cleaned;
}
