import { ConfigOptions } from '../types/api';

export async function fetchBackendConfig(): Promise<ConfigOptions | null> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
