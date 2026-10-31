export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiUrl = (import.meta.env.VITE_API_URL as string) || '';
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return origin ? `${origin}${path}` : path;
}
