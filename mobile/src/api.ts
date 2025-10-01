import * as SecureStore from 'expo-secure-store';

const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? 'http://localhost:4000' : 'http://localhost:4000');

function buildUrl(path: string, base: string) {
  // Construct URL safely without mutating properties like protocol/host
  try {
    return new URL(path, base).toString();
  } catch {
    // Fallback to string concat if base is already full URL
    if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1);
    if (!base.endsWith('/') && !path.startsWith('/')) return `${base}/${path}`;
    return base + path;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch (e) {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  if (!token) return;
  await SecureStore.setItemAsync('auth_token', token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync('auth_token');
}

export async function apiRequest<T = any>(path: string, { method = 'GET', body, baseUrl }: { method?: string; body?: unknown; baseUrl?: string } = {}): Promise<T> {
  const token = await getToken();
  const url = buildUrl(path, baseUrl || DEFAULT_BASE_URL);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json as any)?.message || 'Request failed';
    const err: any = new Error(message);
    err.status = res.status;
    throw err;
  }
  return json as T;
}

export const api = {
  register: (payload: { email: string; password: string; role?: 'admin' | 'user' }, opts?: any) => apiRequest('/api/auth/register', { method: 'POST', body: payload, ...opts }),
  login: (payload: { email: string; password: string }, opts?: any) => apiRequest('/api/auth/login', { method: 'POST', body: payload, ...opts }),
  me: (opts?: any) => apiRequest('/api/me', { method: 'GET', ...opts }),
  listUsers: (opts?: any) => apiRequest('/api/admin/users', { method: 'GET', ...opts }),
};


