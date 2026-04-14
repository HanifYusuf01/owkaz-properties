/**
 * Resolves a stored image path to a fully qualified URL.
 * Stored paths are relative (e.g. /uploads/filename.jpg).
 * In production VITE_API_URL = https://api.owkaz.neonwave.com.ng/api,
 * so we strip the /api suffix to get the origin.
 * In local dev Vite proxies /uploads → http://localhost:3000.
 */
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiUrl = (import.meta.env.VITE_API_URL as string) || '';
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return origin ? `${origin}${path}` : path;
}
