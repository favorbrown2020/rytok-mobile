// ─────────────────────────────────────────
//  API Config — connects to your Next.js backend (rytokgh)
// ─────────────────────────────────────────
//  HOW TO FIND YOUR LOCAL IP:
//  Open PowerShell → run: ipconfig
//  Look for "IPv4 Address" under your Wi-Fi adapter
//  e.g. 192.168.1.45 → replace XX below with that number
// ─────────────────────────────────────────

const DEV_IP = '192.168.1.XX'; // ← Replace with your actual local IP

export const API_BASE_URL = __DEV__
    ? `http://${DEV_IP}:3000`   // Local dev — points to rytokgh Next.js server
    : 'https://rytok.com';       // Production — your live domain

export async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    return res;
}
