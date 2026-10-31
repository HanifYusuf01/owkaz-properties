export function normalizeStateName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/federal capital territory/g, 'fct')
    .replace(/[^a-z]/g, '');

  if (cleaned.includes('fct') || cleaned.includes('abuja')) return 'fct';
  return cleaned;
}
