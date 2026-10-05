import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../../constants/api";

const { width } = Dimensions.get("window");

const C = {
    primary: "#4F46E5", primaryL: "#EEF2FF",
    success: "#10B981", successL: "#ECFDF5",
    warning: "#F59E0B", warningL: "#FFFBEB",
    info: "#0EA5E9", infoL: "#F0F9FF",
    bg: "#F8FAFC", surface: "#FFFFFF",
    border: "#E2E8F0", textP: "#0F172A",
    textS: "#64748B", textM: "#94A3B8"
};

interface AnalyticsSummary {
    total_views: number;
    total_saves: number;
    conversion_rate: number;
    active_count: number;
    boosted_count: number;
    total_listings: number;
    period_days: number;
}

interface DailyViewItem {
    date: string;
    views: number;
    unique_visitors?: number;
}

interface ListingStat {
    id: number | string;
    title: string;
    price: number | string;
    views: number;
    saves: number;
    status: string;
    category_name?: string;
    price_position?: "below_avg" | "above_avg" | null;
    competitor?: { avg: number; min: number; max: number };
}

export default function PerformanceScreen() {
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [dailyViews, setDailyViews] = useState<DailyViewItem[]>([]);
    const [topListings, setTopListings] = useState<ListingStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async (p: "7d" | "30d" | "90d") => {
        try {
            const res = await apiFetch(`/api/seller/analytics?period=${p}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    if (data.summary) setSummary(data.summary);
                    if (data.daily_views) setDailyViews(data.daily_views);
                    if (data.listings) setTopListings(data.listings);
                }
            }
        } catch (err: any) {
            console.error("Failed to load seller analytics:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchAnalytics(period);
    }, [period, fetchAnalytics]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics(period);
    };

    // Calculate max views for simple mini-bar scaling
    const maxDailyView = Math.max(...dailyViews.map(d => d.views || 0), 1);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <Text style={s.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Seller Insights</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: C.bg }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Period Selector Tabs */}
                <View style={s.periodTabs}>
                    {(["7d", "30d", "90d"] as const).map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[s.periodBtn, period === p && s.periodBtnActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[s.periodBtnText, period === p && s.periodBtnTextActive]}>
                                {p === "7d" ? "Past 7 Days" : p === "30d" ? "Past 30 Days" : "Past 3 Months"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <View style={s.centerLoading}>
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text style={s.loadingText}>Analyzing your marketplace performance...</Text>
                    </View>
                ) : (
                    <>
                        {/* Summary Metrics Grid */}
                        <View style={s.metricsGrid}>
                            <View style={s.metricCard}>
                                <View style={[s.metricIconBg, { backgroundColor: "#EEF2FF" }]}>
                                    <Text style={s.metricIcon}>👁️</Text>
                                </View>
                                <Text style={s.metricValue}>{(summary?.total_views ?? 0).toLocaleString()}</Text>
                                <Text style={s.metricLabel}>Total Views</Text>
                            </View>

                            <View style={s.metricCard}>
                                <View style={[s.metricIconBg, { backgroundColor: "#ECFDF5" }]}>
                                    <Text style={s.metricIcon}>❤️</Text>
                                </View>
                                <Text style={s.metricValue}>{(summary?.total_saves ?? 0).toLocaleString()}</Text>
                                <Text style={s.metricLabel}>Buyer Saves</Text>
                            </View>

                            <View style={s.metricCard}>
                                <View style={[s.metricIconBg, { backgroundColor: "#F0F9FF" }]}>
                                    <Text style={s.metricIcon}>📈</Text>
                                </View>
                                <Text style={s.metricValue}>{(summary?.conversion_rate ?? 0).toFixed(1)}%</Text>
                                <Text style={s.metricLabel}>Engagement Rate</Text>
                            </View>

                            <View style={s.metricCard}>
                                <View style={[s.metricIconBg, { backgroundColor: "#FFFBEB" }]}>
                                    <Text style={s.metricIcon}>🏷️</Text>
                                </View>
                                <Text style={s.metricValue}>{summary?.active_count ?? 0}</Text>
                                <Text style={s.metricLabel}>Active Listings</Text>
                            </View>
                        </View>

                        {/* Views Trend Chart */}
                        <View style={s.sectionCard}>
                            <View style={s.sectionHeader}>
                                <Text style={s.sectionTitle}>Views Trend</Text>
                                <Text style={s.sectionSub}>Recent activity over time</Text>
                            </View>

                            {dailyViews.length === 0 ? (
                                <Text style={s.emptyChartText}>No view history recorded for this period yet.</Text>
                            ) : (
                                <View style={s.barChartContainer}>
                                    <View style={s.barsRow}>
                                        {dailyViews.slice(-14).map((item, idx) => {
                                            const heightPct = Math.max(12, Math.min(100, ((item.views || 0) / maxDailyView) * 100));
                                            return (
                                                <View key={idx} style={s.barCol}>
                                                    <View style={[s.barPill, { height: `${heightPct}%` }]} />
                                                    <Text style={s.barDate} numberOfLines={1}>
                                                        {item.date ? item.date.slice(5) : ""}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Top Listings Breakdown */}
                        <View style={s.sectionCard}>
                            <View style={s.sectionHeader}>
                                <Text style={s.sectionTitle}>Item Engagement</Text>
                                <Text style={s.sectionSub}>Breakdown by product listing</Text>
                            </View>

                            {topListings.length === 0 ? (
                                <Text style={s.emptyChartText}>You have not posted any listings yet.</Text>
                            ) : (
                                topListings.slice(0, 10).map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={s.listingStatRow}
                                        activeOpacity={0.8}
                                        onPress={() => router.push(`/item/${item.id}` as any)}
                                    >
                                        <View style={{ flex: 1, gap: 2 }}>
                                            <Text style={s.listingTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={s.listingCategory}>{item.category_name || "General"}</Text>
                                        </View>
                                        <View style={s.listingStatBadges}>
                                            <View style={s.badgePill}>
                                                <Text style={s.badgePillText}>👁️ {item.views || 0}</Text>
                                            </View>
                                            <View style={[s.badgePill, { backgroundColor: "#ECFDF5" }]}>
                                                <Text style={[s.badgePillText, { color: C.success }]}>❤️ {item.saves || 0}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>

                        {/* Action Banner */}
                        <LinearGradient colors={["#1E1B4B", "#312E81"]} style={s.promoBanner}>
                            <Text style={s.promoTitle}>🚀 Boost Your Visibility</Text>
                            <Text style={s.promoSub}>
                                Feature your ads at the top of category searches and get up to 5x more buyer inquiries.
                            </Text>
                            <TouchableOpacity
                                style={s.promoBtn}
                                activeOpacity={0.85}
                                onPress={() => router.push("/profile/listings" as any)}
                            >
                                <Text style={s.promoBtnText}>Manage Listings</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff", flex: 1, textAlign: "center" },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    backArrow: { fontSize: 18, color: "#fff", fontWeight: "700" },
    periodTabs: { flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 12, padding: 4, gap: 4 },
    periodBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
    periodBtnActive: { backgroundColor: C.surface, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    periodBtnText: { fontSize: 13, fontWeight: "600", color: C.textS },
    periodBtnTextActive: { color: C.primary, fontWeight: "800" },
    centerLoading: { padding: 40, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { fontSize: 14, color: C.textS },
    metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    metricCard: { width: (width - 44) / 2, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    metricIconBg: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    metricIcon: { fontSize: 18 },
    metricValue: { fontSize: 22, fontWeight: "900", color: C.textP },
    metricLabel: { fontSize: 12, color: C.textS, fontWeight: "600", marginTop: 2 },
    sectionCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    sectionHeader: { marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: C.textP },
    sectionSub: { fontSize: 12, color: C.textM, marginTop: 2 },
    emptyChartText: { textAlign: "center", paddingVertical: 20, color: C.textM, fontSize: 13 },
    barChartContainer: { height: 140, paddingTop: 10 },
    barsRow: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 4 },
    barCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
    barPill: { width: 14, backgroundColor: C.primary, borderRadius: 7 },
    barDate: { fontSize: 9, color: C.textM, marginTop: 6 },
    listingStatRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
    listingTitle: { fontSize: 14, fontWeight: "700", color: C.textP },
    listingCategory: { fontSize: 11, color: C.textM },
    listingStatBadges: { flexDirection: "row", gap: 6 },
    badgePill: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgePillText: { fontSize: 11, fontWeight: "700", color: C.textS },
    promoBanner: { borderRadius: 16, padding: 18, gap: 8 },
    promoTitle: { fontSize: 16, fontWeight: "900", color: "#fff" },
    promoSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 19 },
    promoBtn: { backgroundColor: "#fff", alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 6 },
    promoBtnText: { color: C.primary, fontWeight: "800", fontSize: 13 }
});
