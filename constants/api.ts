// ─────────────────────────────────────────────────────────
//  API Config & Secure Storage — Rytok Mobile
// ─────────────────────────────────────────────────────────
import * as SecureStore from 'expo-secure-store';

// Phone hotspot IP (laptop connected to phone hotspot)
const DEV_IP = '10.231.174.64';

export const API_BASE_URL = __DEV__
    ? `http://${DEV_IP}:3000`
    : 'https://rytok.com';

const TOKEN_KEY = 'rytok_auth_token';
const USER_KEY = 'rytok_auth_user';

// In-memory cache for fast synchronous access
let cachedToken: string | null = null;
let cachedUser: any = null;

export async function getAuthToken(): Promise<string | null> {
    if (cachedToken) return cachedToken;
    try {
        cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        return cachedToken;
    } catch {
        return null;
    }
}

export async function setAuthToken(token: string): Promise<void> {
    cachedToken = token;
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (e) {
        console.error('Failed to save auth token:', e);
    }
}

export async function removeAuthToken(): Promise<void> {
    cachedToken = null;
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
}

export async function getStoredUser(): Promise<any> {
    if (cachedUser) return cachedUser;
    try {
        const raw = await SecureStore.getItemAsync(USER_KEY);
        if (raw) {
            cachedUser = JSON.parse(raw);
            return cachedUser;
        }
    } catch {}
    return null;
}

export async function setStoredUser(user: any): Promise<void> {
    cachedUser = user;
    try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.error('Failed to save user:', e);
    }
}

export async function clearAuth(): Promise<void> {
    cachedToken = null;
    cachedUser = null;
    await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(USER_KEY).catch(() => {}),
    ]);
}

export async function apiFetch(path: string, options?: RequestInit) {
    const token = await getAuthToken();

    // Detect FormData / multipart body — must NOT set Content-Type so the
    // browser/RN can auto-generate the multipart boundary.
    const isFormData =
        options?.body instanceof FormData ||
        (typeof options?.body === 'object' && options?.body !== null &&
         Object.prototype.toString.call(options?.body) === '[object FormData]');

    const callerHeaders = (options?.headers as Record<string, string>) || {};
    const hasContentType = 'Content-Type' in callerHeaders || 'content-type' in callerHeaders;

    const headers: Record<string, string> = {
        // Only add JSON content-type when NOT a FormData upload and caller didn't specify
        ...(!isFormData && !hasContentType ? { 'Content-Type': 'application/json' } : {}),
        ...callerHeaders,
    };

    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Remove Content-Type entirely for FormData (let fetch set it with boundary)
    if (isFormData) {
        delete headers['Content-Type'];
        delete headers['content-type'];
    }

    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    return fetch(url, {
        ...options,
        headers,
    });
}

export function formatGHS(amount: number | string | null | undefined): string {
    const num = Number(amount) || 0;
    return `GH₵ ${num.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
