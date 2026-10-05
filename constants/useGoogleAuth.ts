/**
 * useGoogleAuth.ts
 * Google Authentication for Rytok Mobile.
 * 
 * 1. Primary: Native Google Sign-In via Google Play Services (@react-native-google-signin/google-signin).
 *    Opens the in-app bottom sheet ("Choose an account to continue to...") directly,
 *    without opening Chrome.
 * 2. Fallback: In-app WebBrowser auth session with package=com.rytok.mobile guarantee
 *    so it never launches another app.
 */
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { API_BASE_URL, setAuthToken, setStoredUser } from "./api";

WebBrowser.maybeCompleteAuthSession();

// Safely require native GoogleSignin so it never crashes if running in Expo Go
let GoogleSignin: any = null;
let statusCodes: any = null;
try {
    const gModule = require("@react-native-google-signin/google-signin");
    GoogleSignin = gModule.GoogleSignin;
    statusCodes = gModule.statusCodes;
    if (GoogleSignin && typeof GoogleSignin.configure === "function") {
        GoogleSignin.configure({
            webClientId: "309478865217-416a4tjfig7f94ek8dha425svfoktohs.apps.googleusercontent.com",
            offlineAccess: true,
            forceCodeForRefreshToken: false,
        });
    }
} catch {
    // Native module unavailable in current environment (e.g. Expo Go)
    GoogleSignin = null;
}

interface GoogleAuthOptions {
    accountType?: "personal" | "business";
}

const GOOGLE_AUTH_BASE = "https://rytok.com";

export async function signInWithGoogle(
    setError: (msg: string) => void,
    setLoading: (v: boolean) => void,
    options: GoogleAuthOptions = {}
) {
    setLoading(true);
    setError("");

    // ── Method A: Native Google Play Services Sheet (No Chrome) ─────
    if (GoogleSignin && typeof GoogleSignin.signIn === "function") {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const response = await GoogleSignin.signIn();

            // Support both v13+ response structure ({ data: { idToken, user } }) and legacy ({ idToken, user })
            const data = response && response.data ? response.data : response;
            const idToken = data?.idToken;
            const googleUser = data?.user;

            if (idToken || googleUser) {
                // Exchange with backend native auth endpoint
                const serverUrl = `${API_BASE_URL}/api/auth/google/native`;
                let res = await fetch(serverUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idToken,
                        accountType: options.accountType || "personal",
                        user: googleUser,
                    }),
                });

                // Fallback to production if local server is unreachable
                if (!res.ok && API_BASE_URL !== GOOGLE_AUTH_BASE) {
                    res = await fetch(`${GOOGLE_AUTH_BASE}/api/auth/google/native`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            idToken,
                            accountType: options.accountType || "personal",
                            user: googleUser,
                        }),
                    });
                }

                if (res.ok) {
                    const result = await res.json();
                    if (result.token) {
                        await setAuthToken(result.token);
                        if (result.user) await setStoredUser(result.user);
                        router.replace("/(tabs)" as any);
                        setLoading(false);
                        return;
                    }
                }
            }
        } catch (nativeErr: any) {
            // If user simply cancelled the native picker, stop loading without error
            if (statusCodes && nativeErr?.code === statusCodes.SIGN_IN_CANCELLED) {
                setLoading(false);
                return;
            }
            if (nativeErr?.code === "12501" || nativeErr?.message?.includes("cancelled")) {
                setLoading(false);
                return;
            }
            console.log("Native Google Sign-In not handled natively, trying in-app auth session:", nativeErr?.message || nativeErr);
            // Fall through to in-app WebBrowser session below
        }
    }

    // ── Method B: In-App Auth Session (Guaranteed to return to com.rytok.mobile) ──
    try {
        const params = new URLSearchParams({
            app: "true",
            mobile: "true",
            package: "com.rytok.mobile",
            redirect_scheme: "rytok",
        });
        if (options.accountType) params.set("account_type", options.accountType);

        const authUrl = `${GOOGLE_AUTH_BASE}/api/auth/google/login?${params.toString()}`;

        const result = await WebBrowser.openAuthSessionAsync(
            authUrl,
            "rytok://auth/callback"
        );

        if (result.type !== "success" || !result.url) {
            setLoading(false);
            return;
        }

        let token: string | null = null;
        let userParam: string | null = null;

        try {
            const callbackUrl = new URL(result.url);
            token = callbackUrl.searchParams.get("token");
            userParam = callbackUrl.searchParams.get("user");
        } catch {
            const tokenMatch = result.url.match(/[?&]token=([^&]+)/);
            const userMatch = result.url.match(/[?&]user=([^&]+)/);
            if (tokenMatch) token = decodeURIComponent(tokenMatch[1]);
            if (userMatch) userParam = decodeURIComponent(userMatch[1]);
        }

        if (!token) {
            setError("Google sign-in failed. Please try again.");
            setLoading(false);
            return;
        }

        await setAuthToken(token);

        if (userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                await setStoredUser(user);
            } catch {
                try {
                    const parsed = JSON.parse(userParam);
                    await setStoredUser(parsed);
                } catch {
                    try {
                        const meRes = await fetch(`${GOOGLE_AUTH_BASE}/api/auth/me`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (meRes.ok) {
                            const d = await meRes.json();
                            if (d.user) await setStoredUser(d.user);
                        }
                    } catch {}
                }
            }
        }

        router.replace("/(tabs)" as any);
    } catch (err: any) {
        console.error("Google auth error:", err);
        setError("Google sign-in is not available right now.");
    } finally {
        setLoading(false);
    }
}
