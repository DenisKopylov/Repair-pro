export function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('idToken') : null;
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return fetch(base + endpoint, { ...options, headers });
}
