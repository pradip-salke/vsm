const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:4000' : '');
export function publicAssetUrl(path: string): string {
  return path.startsWith('/cms-media/') ? `${API_BASE}${path}` : path;
}
type ApiError = { error?: { message?: string; code?: string; details?: { path: (string | number)[]; message: string }[] } };

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}/api/v1${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiError;
    const details = body.error?.details?.slice(0, 3).map(item => `${item.path.join('.')}: ${item.message}`).join('; ');
    throw new Error(details || body.error?.message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
