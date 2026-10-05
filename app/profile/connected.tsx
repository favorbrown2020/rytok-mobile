import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Globe, CheckCircle2, XCircle, ArrowLeft,
    Shield, RefreshCw,
} from "lucide-react-native";
import { apiFetch } from "../../constants/api";
import { signInWithGoogle } from "../../constants/useGoogleAuth";

const C = {
    primary:   "#6366F1",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    red:       "#EF4444",
    redL:      "#FEE2E2",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

export default function ConnectedAccountsScreen() {
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState<{ google?: any; facebook?: any; apple?: any }>({});
    const [unlinking, setUnlinking] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const loadAccounts = useCallback(async () => {
        try {
            const res = await apiFetch("/api/auth/connected-accounts");
            if (res.ok) {
                const data = await res.json();
                setConnected(data.connected || {});
            }
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const handleUnlink = (provider: string) => {
        Alert.alert(
            "Unlink Account",
            `Are you sure you want to disconnect ${provider.charAt(0).toUpperCase() + provider.slice(1)}? You will not be able to log in with it until reconnected.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Disconnect",
                    style: "destructive",
                    onPress: async () => {
                        setUnlinking(provider);
                        try {
                            const res = await apiFetch(`/api/auth/connected-accounts?provider=${provider}`, {
                                method: "DELETE",
                            });
                            const data = await res.json();
                            if (res.ok && data.success) {
                                setConnected(prev => ({ ...prev, [provider]: undefined }));
                                Alert.alert("Success", `${provider} account unlinked successfully.`);
                            } else {
                                Alert.alert("Cannot Unlink", data.error || "Failed to disconnect account.");
                            }
                        } catch {
                            Alert.alert("Error", "Could not reach server.");
                        } finally {
                            setUnlinking(null);
                        }
                    },
                },
            ]
        );
    };

    const handleConnectGoogle = () => {
        signInWithGoogle(
            (msg) => Alert.alert("Google Error", msg),
            setGoogleLoading
        ).then(() => {
            loadAccounts();
        });
    };

    const providers = [
        {
            id: "google",
            name: "Google",
            iconText: "G",
            iconColor: "#4285F4",
            bgIcon: "#E8F0FE",
            data: connected.google,
            onConnect: handleConnectGoogle,
        },
        {
            id: "apple",
            name: "Apple ID",
            iconText: "",
            iconColor: "#000000",
            bgIcon: "#F1F5F9",
            data: connected.apple,
            onConnect: () => Alert.alert("Apple Sign-In", "Apple sign-in configuration will be available in the next release."),
        },
        {
            id: "facebook",
            name: "Facebook",
            iconText: "f",
            iconColor: "#1877F2",
            bgIcon: "#E7F3FF",
            data: connected.facebook,
            onConnect: () => Alert.alert("Facebook Login", "Facebook login is currently being updated."),
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Connected Accounts</Text>
                <TouchableOpacity style={s.backBtn} onPress={loadAccounts} activeOpacity={0.8}>
                    <RefreshCw size={16} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: C.bg }}
                contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.infoBanner}>
                    <Shield size={20} color={C.primary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={s.infoTitle}>Social Sign-In Links</Text>
                        <Text style={s.infoSub}>
                            Connect social accounts to sign in with one tap. Ensure you always maintain at least one valid sign-in method.
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View style={s.loadingBox}>
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text style={s.loadingTxt}>Checking connected accounts...</Text>
                    </View>
                ) : (
                    providers.map((p) => {
                        const isConnected = Boolean(p.data);
                        return (
                            <View key={p.id} style={s.card}>
                                <View style={s.row}>
                                    <View style={[s.providerIconWrap, { backgroundColor: p.bgIcon }]}>
                                        <Text style={[s.providerIcon, { color: p.iconColor }]}>{p.iconText}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.providerName}>{p.name}</Text>
                                        <Text style={s.providerEmail}>
                                            {isConnected ? (p.data.email || "Connected") : "Not connected"}
                                        </Text>
                                    </View>
                                    <View style={[s.statusBadge, isConnected ? s.badgeConnected : s.badgeNotConnected]}>
                                        {isConnected ? (
                                            <>
                                                <CheckCircle2 size={12} color={C.green} />
                                                <Text style={[s.statusTxt, { color: C.green }]}>Connected</Text>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={12} color={C.textM} />
                                                <Text style={[s.statusTxt, { color: C.textM }]}>Linked: No</Text>
                                            </>
                                        )}
                                    </View>
                                </View>

                                <View style={s.cardDivider} />

                                <View style={s.cardActions}>
                                    {isConnected ? (
                                        <TouchableOpacity
                                            style={s.disconnectBtn}
                                            onPress={() => handleUnlink(p.id)}
                                            disabled={unlinking === p.id}
                                            activeOpacity={0.8}
                                        >
                                            {unlinking === p.id ? (
                                                <ActivityIndicator size="small" color={C.red} />
                                            ) : (
                                                <Text style={s.disconnectBtnText}>Disconnect</Text>
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={s.connectBtn}
                                            onPress={p.onConnect}
                                            disabled={googleLoading && p.id === "google"}
                                            activeOpacity={0.88}
                                        >
                                            {googleLoading && p.id === "google" ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={s.connectBtnText}>Connect Account</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    infoBanner:  { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#EEF2FF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#C7D2FE" },
    infoTitle:   { fontSize: 14, fontWeight: "700", color: "#312E81" },
    infoSub:     { fontSize: 12, color: "#4338CA", marginTop: 2, lineHeight: 18 },
    loadingBox:  { padding: 40, alignItems: "center", gap: 12 },
    loadingTxt:  { fontSize: 14, color: C.textS },
    card:        { backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border },
    row:         { flexDirection: "row", alignItems: "center", gap: 12 },
    providerIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    providerIcon: { fontSize: 22, fontWeight: "900" },
    providerName: { fontSize: 16, fontWeight: "800", color: C.textP },
    providerEmail: { fontSize: 13, color: C.textS, marginTop: 2 },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    badgeConnected: { backgroundColor: C.greenL },
    badgeNotConnected: { backgroundColor: "#F1F5F9" },
    statusTxt:   { fontSize: 11, fontWeight: "700" },
    cardDivider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
    cardActions: { flexDirection: "row", justifyContent: "flex-end" },
    disconnectBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: C.redL },
    disconnectBtnText: { color: C.red, fontSize: 13, fontWeight: "700" },
    connectBtn:  { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 12, backgroundColor: C.primary },
    connectBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
