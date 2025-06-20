export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${API_URL}${normalizedPath}`, options);
}
