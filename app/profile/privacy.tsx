import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Switch, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Eye, EyeOff, Phone, UserCheck, MessageSquare,
    Shield, Ban, ArrowLeft, ChevronRight,
} from "lucide-react-native";
import { apiFetch, setStoredUser } from "../../constants/api";

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

export default function PrivacyScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [privacy, setPrivacy] = useState({
        showPhone: true,
        publicProfile: true,
        allowMessages: true,
        showOnline: true,
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    const priv = data?.user?.metadata?.privacy;
                    if (priv) setPrivacy(prev => ({ ...prev, ...priv }));
                }
            } catch {} finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleToggle = async (key: string, value: boolean) => {
        const next = { ...privacy, [key]: value };
        setPrivacy(next);
        setSaving(true);
        try {
            const res = await apiFetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privacySettings: next }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) await setStoredUser(data.user);
            }
        } catch {
            setPrivacy(privacy);
            Alert.alert("Error", "Could not save privacy preference.");
        } finally {
            setSaving(false);
        }
    };

    const items = [
        {
            key: "showPhone",
            label: "Show Phone on Listings",
            sub: "Allow buyers to see your phone number and call directly",
            icon: Phone,
            color: C.primary,
        },
        {
            key: "publicProfile",
            label: "Public Profile Visibility",
            sub: "Allow marketplace buyers to view your seller profile and items",
            icon: Eye,
            color: C.green,
        },
        {
            key: "allowMessages",
            label: "Allow Direct Chat",
            sub: "Receive in-app messages and offers from other users",
            icon: MessageSquare,
            color: "#3B82F6",
        },
        {
            key: "showOnline",
            label: "Show Online Status",
            sub: "Display an active badge when you are browsing Rytok",
            icon: UserCheck,
            color: "#8B5CF6",
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Privacy & Safety</Text>
                <View style={{ width: 36, alignItems: "center" }}>
                    {saving && <ActivityIndicator size="small" color="#fff" />}
                </View>
            </LinearGradient>

            {loading ? (
                <View style={s.centerBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.loadingTxt}>Loading privacy settings...</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1, backgroundColor: C.bg }}
                    contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 18 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={s.infoBanner}>
                        <Shield size={20} color={C.primary} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={s.infoTitle}>Control Your Information</Text>
                            <Text style={s.infoSub}>
                                Choose what details other buyers and sellers can see when browsing your listings or messaging you.
                            </Text>
                        </View>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text style={s.groupHeader}>VISIBILITY PREFERENCES</Text>
                        <View style={s.card}>
                            {items.map((item, i) => {
                                const Icon = item.icon;
                                const isLast = i === items.length - 1;
                                const val = (privacy as any)[item.key] ?? false;

                                return (
                                    <View
                                        key={item.key}
                                        style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                    >
                                        <View style={[s.iconBox, { backgroundColor: item.color + "15" }]}>
                                            <Icon size={18} color={item.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.rowLabel}>{item.label}</Text>
                                            <Text style={s.rowSub}>{item.sub}</Text>
                                        </View>
                                        <Switch
                                            value={val}
                                            onValueChange={(v) => handleToggle(item.key, v)}
                                            trackColor={{ false: "#CBD5E1", true: C.primary }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text style={s.groupHeader}>SAFETY & BLOCKING</Text>
                        <View style={s.card}>
                            <TouchableOpacity
                                style={s.row}
                                onPress={() => Alert.alert("Blocked Users", "You have not blocked any users on Rytok.")}
                                activeOpacity={0.8}
                            >
                                <View style={[s.iconBox, { backgroundColor: C.redL }]}>
                                    <Ban size={18} color={C.red} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.rowLabel}>Blocked Accounts</Text>
                                    <Text style={s.rowSub}>0 users blocked</Text>
                                </View>
                                <ChevronRight size={18} color={C.textM} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    centerBox:   { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: C.bg },
    loadingTxt:  { fontSize: 14, color: C.textS },
    infoBanner:  { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#EEF2FF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#C7D2FE" },
    infoTitle:   { fontSize: 14, fontWeight: "700", color: "#312E81" },
    infoSub:     { fontSize: 12, color: "#4338CA", marginTop: 2, lineHeight: 18 },
    groupHeader: { fontSize: 12, fontWeight: "800", color: C.textS, letterSpacing: 0.8, paddingHorizontal: 4 },
    card:        { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
    row:         { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
    iconBox:     { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    rowLabel:    { fontSize: 15, fontWeight: "700", color: C.textP },
    rowSub:      { fontSize: 12, color: C.textS, marginTop: 2, lineHeight: 16 },
});
