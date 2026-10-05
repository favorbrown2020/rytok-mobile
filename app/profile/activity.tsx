import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Clock, Shield, Edit3, Lock, AlertTriangle,
    ArrowLeft, CheckCircle, RefreshCw, KeyRound,
    User,
} from "lucide-react-native";
import { apiFetch } from "../../constants/api";

const C = {
    primary:   "#6366F1",
    primaryL:  "#EEF2FF",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    amber:     "#F59E0B",
    amberL:    "#FEF3C7",
    red:       "#EF4444",
    redL:      "#FEE2E2",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

function formatTime(isoStr: string): string {
    if (!isoStr) return "";
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return isoStr;
    }
}

function getActionMeta(actionType?: string, actionText?: string) {
    const text = (actionText || "").toLowerCase();
    if (text.includes("password") || text.includes("security")) {
        return { icon: Lock, color: C.red, bg: C.redL };
    }
    if (text.includes("login") || text.includes("sign")) {
        return { icon: KeyRound, color: C.green, bg: C.greenL };
    }
    if (text.includes("profile") || text.includes("avatar")) {
        return { icon: User, color: C.primary, bg: C.primaryL };
    }
    if (text.includes("deactivat")) {
        return { icon: AlertTriangle, color: C.amber, bg: C.amberL };
    }
    return { icon: Clock, color: C.primary, bg: C.primaryL };
}

export default function AccountActivityScreen() {
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadActivity = useCallback(async () => {
        try {
            const res = await apiFetch("/api/auth/activity");
            if (res.ok) {
                const data = await res.json();
                setActivity(data.activity || []);
            }
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadActivity();
    }, [loadActivity]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Account Activity</Text>
                <TouchableOpacity style={s.backBtn} onPress={() => { setRefreshing(true); loadActivity(); }} activeOpacity={0.8}>
                    <RefreshCw size={16} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: C.bg }}
                contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 14 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); loadActivity(); }}
                        tintColor={C.primary}
                        colors={[C.primary]}
                    />
                }
            >
                <View style={s.infoBanner}>
                    <Shield size={20} color={C.primary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={s.infoTitle}>Audit Trail & Logins</Text>
                        <Text style={s.infoSub}>
                            Review your recent profile edits, password updates, and session logins for security compliance.
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View style={s.loadingBox}>
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text style={s.loadingTxt}>Fetching activity logs...</Text>
                    </View>
                ) : activity.length === 0 ? (
                    <View style={s.emptyCard}>
                        <Clock size={44} color={C.textM} />
                        <Text style={s.emptyTitle}>No Activity Logs Yet</Text>
                        <Text style={s.emptySub}>
                            Your recent account activities, updates, and logins will appear here automatically.
                        </Text>
                    </View>
                ) : (
                    <View style={s.card}>
                        {activity.map((item, i) => {
                            const meta = getActionMeta(item.action_type, item.action_text);
                            const Icon = meta.icon;
                            const isLast = i === activity.length - 1;

                            return (
                                <View
                                    key={item.id || i}
                                    style={[s.itemRow, !isLast && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                >
                                    <View style={[s.iconBox, { backgroundColor: meta.bg }]}>
                                        <Icon size={18} color={meta.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.actionText}>{item.action_text || "Account action"}</Text>
                                        <Text style={s.timeText}>{formatTime(item.created_at)}</Text>
                                    </View>
                                    <View style={s.badge}>
                                        <Text style={s.badgeText}>{item.action_type || "log"}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
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
    emptyCard:   { backgroundColor: C.surface, borderRadius: 20, padding: 36, alignItems: "center", borderWidth: 1, borderColor: C.border, gap: 10, marginTop: 12 },
    emptyTitle:  { fontSize: 16, fontWeight: "800", color: C.textP },
    emptySub:    { fontSize: 13, color: C.textS, textAlign: "center", lineHeight: 20 },
    card:        { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
    itemRow:     { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
    iconBox:     { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actionText:  { fontSize: 15, fontWeight: "700", color: C.textP },
    timeText:    { fontSize: 12, color: C.textM, marginTop: 3 },
    badge:       { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#F1F5F9" },
    badgeText:   { fontSize: 10, fontWeight: "800", color: C.textS, textTransform: "uppercase" },
});
