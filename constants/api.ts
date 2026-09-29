// ─────────────────────────────────────────────────────────
//  API Config — connects Rytok mobile to your Next.js backend
// ─────────────────────────────────────────────────────────
//  Your laptop IP on the tethered network: 192.168.0.110
//  If your IP changes, update DEV_IP below.
// ─────────────────────────────────────────────────────────

const DEV_IP = '192.168.0.110';

export const API_BASE_URL = __DEV__
    ? `http://${DEV_IP}:3000`
    : 'https://rytok.com';

export async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    return res;
}