import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Switch, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Bell, Mail, MessageSquare, Tag, ShoppingBag,
    Shield, Sparkles, ArrowLeft, Check,
} from "lucide-react-native";
import { apiFetch, getStoredUser, setStoredUser } from "../../constants/api";

const C = {
    primary:   "#6366F1",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

export default function NotificationPreferencesScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        pushMessages: true,
        pushPriceDrops: true,
        pushOrders: true,
        emailDigest: false,
        emailSecurity: true,
        smsAlerts: true,
        marketingOffers: false,
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    const notifs = data?.user?.metadata?.notifications;
                    if (notifs) {
                        setSettings(prev => ({ ...prev, ...notifs }));
                    }
                }
            } catch {} finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleToggle = async (key: string, value: boolean) => {
        const next = { ...settings, [key]: value };
        setSettings(next);
        setSaving(true);
        try {
            const res = await apiFetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationSettings: next }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) await setStoredUser(data.user);
            }
        } catch {
            setSettings(settings); // revert
            Alert.alert("Error", "Could not save preference.");
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        {
            title: "PUSH NOTIFICATIONS",
            items: [
                {
                    key: "pushMessages",
                    label: "Chat Messages",
                    sub: "Instant alerts when buyers or sellers message you",
                    icon: MessageSquare,
                    color: C.primary,
                },
                {
                    key: "pushPriceDrops",
                    label: "Price Drops & Deals",
                    sub: "Get notified when prices drop on your saved listings",
                    icon: Tag,
                    color: "#F59E0B",
                },
                {
                    key: "pushOrders",
                    label: "Orders & Delivery Updates",
                    sub: "Real-time updates on active deals and orders",
                    icon: ShoppingBag,
                    color: C.green,
                },
            ],
        },
        {
            title: "EMAIL NOTIFICATIONS",
            items: [
                {
                    key: "emailDigest",
                    label: "Weekly Marketplace Digest",
                    sub: "Summary of popular listings and deals in your area",
                    icon: Mail,
                    color: "#3B82F6",
                },
                {
                    key: "emailSecurity",
                    label: "Security & Login Alerts",
                    sub: "Critical notifications regarding logins and password changes",
                    icon: Shield,
                    color: "#EF4444",
                    disabled: true,
                },
            ],
        },
        {
            title: "SMS & PROMOTIONS",
            items: [
                {
                    key: "smsAlerts",
                    label: "SMS Verification Alerts",
                    sub: "Phone code verifications and critical safety updates",
                    icon: Bell,
                    color: "#8B5CF6",
                },
                {
                    key: "marketingOffers",
                    label: "Special Offers & Ryte Rewards",
                    sub: "Exclusive promo vouchers and bonus points announcements",
                    icon: Sparkles,
                    color: "#EC4899",
                },
            ],
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Notifications</Text>
                <View style={{ width: 36, alignItems: "center" }}>
                    {saving && <ActivityIndicator size="small" color="#fff" />}
                </View>
            </LinearGradient>

            {loading ? (
                <View style={s.centerBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.loadingTxt}>Loading preferences...</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1, backgroundColor: C.bg }}
                    contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {sections.map((sec) => (
                        <View key={sec.title} style={{ gap: 8 }}>
                            <Text style={s.groupHeader}>{sec.title}</Text>
                            <View style={s.card}>
                                {sec.items.map((item, i) => {
                                    const Icon = item.icon;
                                    const isLast = i === sec.items.length - 1;
                                    const val = (settings as any)[item.key] ?? false;

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
                                                disabled={item.disabled}
                                                trackColor={{ false: "#CBD5E1", true: C.primary }}
                                                thumbColor="#fff"
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
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
    groupHeader: { fontSize: 12, fontWeight: "800", color: C.textS, letterSpacing: 0.8, paddingHorizontal: 4 },
    card:        { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
    row:         { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
    iconBox:     { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    rowLabel:    { fontSize: 15, fontWeight: "700", color: C.textP },
    rowSub:      { fontSize: 12, color: C.textS, marginTop: 2, lineHeight: 16 },
});
