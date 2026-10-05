import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Image, TextInput, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../../constants/api";

const C = {
    primary: "#4F46E5", primaryL: "#EEF2FF",
    success: "#10B981", successL: "#ECFDF5",
    warning: "#F59E0B", warningL: "#FFFBEB",
    danger: "#EF4444", dangerL: "#FEF2F2",
    bg: "#F8FAFC", surface: "#FFFFFF",
    border: "#E2E8F0", textP: "#0F172A",
    textS: "#64748B", textM: "#94A3B8"
};

interface Listing {
    id: string | number;
    title: string;
    price: number | string;
    currency?: string;
    status: string;
    views_count?: number;
    views?: number;
    saves_count?: number;
    saves?: number;
    created_at: string;
    category_name?: string;
    images?: any;
    location?: string;
}

export default function MyListingsScreen() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<"all" | "active" | "pending" | "sold">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchListings = useCallback(async () => {
        try {
            const res = await apiFetch("/api/listings/my");
            if (res.ok) {
                const data = await res.json();
                if (data?.listings) {
                    setListings(data.listings);
                } else if (Array.isArray(data)) {
                    setListings(data);
                }
            }
        } catch (err: any) {
            console.error("Failed to fetch user listings:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const getImageUri = (item: Listing): string | null => {
        if (!item.images) return null;
        let imgList = item.images;
        if (typeof imgList === "string") {
            try {
                imgList = JSON.parse(imgList);
            } catch {
                if (imgList.startsWith("http")) return imgList;
                return null;
            }
        }
        if (Array.isArray(imgList) && imgList.length > 0) {
            const first = imgList[0];
            return typeof first === "string" ? first : first?.url || null;
        }
        return null;
    };

    const filteredListings = listings.filter(item => {
        const itemStatus = (item.status || "active").toLowerCase();
        const matchesFilter = filter === "all" || itemStatus === filter;
        const matchesSearch = searchQuery.trim() === "" ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.category_name && item.category_name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const activeCount = listings.filter(l => (l.status || "active").toLowerCase() === "active").length;
    const pendingCount = listings.filter(l => (l.status || "").toLowerCase() === "pending").length;
    const soldCount = listings.filter(l => (l.status || "").toLowerCase() === "sold").length;

    const renderListingItem = ({ item }: { item: Listing }) => {
        const imgUri = getImageUri(item);
        const status = (item.status || "active").toLowerCase();
        const viewCount = item.views_count ?? item.views ?? 0;
        const saveCount = item.saves_count ?? item.saves ?? 0;

        return (
            <TouchableOpacity
                style={s.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/item/${item.id}` as any)}
            >
                <View style={s.cardRow}>
                    {imgUri ? (
                        <Image source={{ uri: imgUri }} style={s.thumb} resizeMode="cover" />
                    ) : (
                        <View style={s.thumbPlaceholder}>
                            <Text style={s.thumbPlaceholderText}>📦</Text>
                        </View>
                    )}

                    <View style={s.cardContent}>
                        <View style={s.titleRow}>
                            <Text style={s.itemTitle} numberOfLines={2}>{item.title}</Text>
                            <View style={[
                                s.statusBadge,
                                status === "active" ? { backgroundColor: C.successL } :
                                status === "pending" ? { backgroundColor: C.warningL } :
                                { backgroundColor: "#F1F5F9" }
                            ]}>
                                <Text style={[
                                    s.statusBadgeText,
                                    status === "active" ? { color: C.success } :
                                    status === "pending" ? { color: C.warning } :
                                    { color: C.textS }
                                ]}>
                                    {status.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        <Text style={s.itemPrice}>
                            {item.currency || "AED"} {typeof item.price === "number" ? item.price.toLocaleString() : item.price}
                        </Text>

                        {item.category_name && (
                            <Text style={s.itemCategory} numberOfLines={1}>{item.category_name}</Text>
                        )}

                        <View style={s.statsRow}>
                            <View style={s.statItem}>
                                <Text style={s.statIcon}>👁️</Text>
                                <Text style={s.statValue}>{viewCount} views</Text>
                            </View>
                            <View style={s.statDot} />
                            <View style={s.statItem}>
                                <Text style={s.statIcon}>❤️</Text>
                                <Text style={s.statValue}>{saveCount} saves</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={s.cardActions}>
                    <TouchableOpacity
                        style={s.actionBtn}
                        onPress={() => router.push(`/item/${item.id}` as any)}
                    >
                        <Text style={s.actionBtnText}>View Listing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.actionBtn, s.actionBtnSecondary]}
                        onPress={() => router.push("/profile/performance" as any)}
                    >
                        <Text style={s.actionBtnSecondaryText}>Insights</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <Text style={s.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>My Listings</Text>
                <TouchableOpacity style={s.postBtn} onPress={() => router.push("/sell" as any)} activeOpacity={0.85}>
                    <Text style={s.postBtnText}>+ Sell</Text>
                </TouchableOpacity>
            </LinearGradient>

            <View style={{ flex: 1, backgroundColor: C.bg }}>
                {/* Search Bar */}
                <View style={s.searchContainer}>
                    <Text style={s.searchIcon}>🔍</Text>
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search your listings..."
                        placeholderTextColor={C.textM}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>

                {/* Filter Tabs */}
                <View style={s.tabRow}>
                    <TouchableOpacity
                        style={[s.tab, filter === "all" && s.tabActive]}
                        onPress={() => setFilter("all")}
                    >
                        <Text style={[s.tabText, filter === "all" && s.tabTextActive]}>
                            All ({listings.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.tab, filter === "active" && s.tabActive]}
                        onPress={() => setFilter("active")}
                    >
                        <Text style={[s.tabText, filter === "active" && s.tabTextActive]}>
                            Active ({activeCount})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.tab, filter === "pending" && s.tabActive]}
                        onPress={() => setFilter("pending")}
                    >
                        <Text style={[s.tabText, filter === "pending" && s.tabTextActive]}>
                            Pending ({pendingCount})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.tab, filter === "sold" && s.tabActive]}
                        onPress={() => setFilter("sold")}
                    >
                        <Text style={[s.tabText, filter === "sold" && s.tabTextActive]}>
                            Sold ({soldCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={s.centerState}>
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text style={s.loadingText}>Fetching your listings from Rytok...</Text>
                    </View>
                ) : filteredListings.length === 0 ? (
                    <View style={s.emptyContainer}>
                        <Text style={s.emptyIcon}>📦</Text>
                        <Text style={s.emptyTitle}>
                            {searchQuery ? "No matching listings" : "No listings found"}
                        </Text>
                        <Text style={s.emptySub}>
                            {searchQuery
                                ? "Try adjusting your search keywords."
                                : "Items you post on Rytok will appear here with live views and engagement analytics."}
                        </Text>
                        <TouchableOpacity
                            style={s.emptyBtn}
                            activeOpacity={0.85}
                            onPress={() => router.push("/sell" as any)}
                        >
                            <LinearGradient colors={["#4F46E5", "#6366F1"]} style={s.emptyBtnGradient}>
                                <Text style={s.emptyBtnText}>+ Post New Listing</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredListings}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderListingItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff", flex: 1, textAlign: "center" },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    backArrow: { fontSize: 18, color: "#fff", fontWeight: "700" },
    postBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    postBtnText: { color: "#4F46E5", fontWeight: "800", fontSize: 13 },
    searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, marginHorizontal: 16, marginTop: 12, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border },
    searchIcon: { fontSize: 15, marginRight: 8 },
    searchInput: { flex: 1, height: 42, fontSize: 14, color: C.textP },
    tabRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8, gap: 8 },
    tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    tabActive: { backgroundColor: C.primaryL, borderColor: C.primary },
    tabText: { fontSize: 13, fontWeight: "600", color: C.textS },
    tabTextActive: { color: C.primary, fontWeight: "800" },
    centerState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { fontSize: 14, color: C.textS, fontWeight: "500" },
    card: { backgroundColor: C.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    cardRow: { flexDirection: "row", gap: 12 },
    thumb: { width: 88, height: 88, borderRadius: 12, backgroundColor: "#E2E8F0" },
    thumbPlaceholder: { width: 88, height: 88, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    thumbPlaceholderText: { fontSize: 32 },
    cardContent: { flex: 1, justifyContent: "space-between" },
    titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 6 },
    itemTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: C.textP, lineHeight: 20 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    statusBadgeText: { fontSize: 10, fontWeight: "800" },
    itemPrice: { fontSize: 16, fontWeight: "900", color: C.primary, marginTop: 4 },
    itemCategory: { fontSize: 12, color: C.textM, marginTop: 2 },
    statsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    statIcon: { fontSize: 11 },
    statValue: { fontSize: 11, color: C.textS, fontWeight: "600" },
    statDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.textM },
    cardActions: { flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
    actionBtn: { flex: 1, height: 36, backgroundColor: C.primaryL, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    actionBtnText: { fontSize: 13, fontWeight: "700", color: C.primary },
    actionBtnSecondary: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: C.border },
    actionBtnSecondaryText: { fontSize: 13, fontWeight: "600", color: C.textS },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
    emptyIcon: { fontSize: 52, marginBottom: 8 },
    emptyTitle: { fontSize: 18, fontWeight: "800", color: C.textP },
    emptySub: { fontSize: 13, color: C.textS, textAlign: "center", lineHeight: 20 },
    emptyBtn: { marginTop: 16, borderRadius: 12, overflow: "hidden" },
    emptyBtnGradient: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    emptyBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 }
});
