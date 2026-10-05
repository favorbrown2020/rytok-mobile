import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, Dimensions, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Store, Plus, Package, Eye, Star, ArrowLeft,
    TrendingUp, ChevronRight, Settings, ExternalLink,
} from "lucide-react-native";
import { apiFetch, getStoredUser, formatGHS } from "../../constants/api";

const { width: W } = Dimensions.get("window");

const C = {
    primary:   "#6366F1",
    primaryD:  "#4F46E5",
    primaryL:  "#EEF2FF",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    amber:     "#F59E0B",
    amberL:    "#FEF3C7",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

export default function ShopDashboardScreen() {
    const [user, setUser] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadShopData = useCallback(async () => {
        try {
            const cached = await getStoredUser();
            if (cached) setUser(cached);

            const [userRes, listRes] = await Promise.all([
                apiFetch("/api/auth/me"),
                apiFetch("/api/listings/my"),
            ]);

            if (userRes.ok) {
                const ud = await userRes.json();
                if (ud.user) setUser(ud.user);
            }
            if (listRes.ok) {
                const ld = await listRes.json();
                setListings(ld.listings || []);
            }
        } catch {} finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadShopData();
    }, [loadShopData]);

    const activeCount = listings.filter((l) => l.status === "active").length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Shop Dashboard</Text>
                <TouchableOpacity style={s.backBtn} onPress={() => router.push("/profile/edit" as any)} activeOpacity={0.8}>
                    <Settings size={18} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {loading ? (
                <View style={s.centerBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.loadingTxt}>Loading store details...</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1, backgroundColor: C.bg }}
                    contentContainerStyle={{ padding: 18, paddingBottom: 48, gap: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadShopData(); }}
                            tintColor={C.primary}
                        />
                    }
                >
                    {/* Store Card */}
                    <View style={s.storeCard}>
                        <View style={s.storeHeader}>
                            {user?.avatar_url ? (
                                <Image source={{ uri: user.avatar_url }} style={s.storeAvatar} />
                            ) : (
                                <View style={[s.storeAvatar, s.avatarFallback]}>
                                    <Store size={28} color={C.primary} />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <View style={s.titleBadgeRow}>
                                    <Text style={s.storeName}>{user?.name || "My Store"}</Text>
                                    <View style={s.verifiedBadge}>
                                        <Text style={s.verifiedBadgeTxt}>Store</Text>
                                    </View>
                                </View>
                                <Text style={s.storeSub}>{user?.email || ""}</Text>
                            </View>
                        </View>
                        {Boolean(user?.bio) && (
                            <Text style={s.storeBio}>{user.bio}</Text>
                        )}
                    </View>

                    {/* Stats Grid */}
                    <View style={s.statsGrid}>
                        <View style={s.statBox}>
                            <Text style={s.statNum}>{listings.length}</Text>
                            <Text style={s.statLabel}>Total Listings</Text>
                        </View>
                        <View style={s.statBox}>
                            <Text style={[s.statNum, { color: C.green }]}>{activeCount}</Text>
                            <Text style={s.statLabel}>Active For Sale</Text>
                        </View>
                        <View style={s.statBox}>
                            <Text style={[s.statNum, { color: C.amber }]}>5.0 ★</Text>
                            <Text style={s.statLabel}>Seller Rating</Text>
                        </View>
                    </View>

                    {/* Create New Listing CTA */}
                    <TouchableOpacity
                        style={s.createBtn}
                        onPress={() => router.push("/sell" as any)}
                        activeOpacity={0.88}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={s.createBtnTxt}>Post a New Listing</Text>
                    </TouchableOpacity>

                    {/* Products Preview */}
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>My Products ({listings.length})</Text>
                        <TouchableOpacity onPress={() => router.push("/profile/listings" as any)}>
                            <Text style={s.viewAllTxt}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {listings.length === 0 ? (
                        <View style={s.emptyCard}>
                            <Package size={40} color={C.textM} />
                            <Text style={s.emptyTitle}>No products listed yet</Text>
                            <Text style={s.emptySub}>Start selling by posting your first item to your storefront.</Text>
                        </View>
                    ) : (
                        listings.slice(0, 5).map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={s.itemCard}
                                onPress={() => router.push(`/listings/${item.id}` as any)}
                                activeOpacity={0.8}
                            >
                                {item.images?.[0] ? (
                                    <Image source={{ uri: item.images[0] }} style={s.itemThumb} />
                                ) : (
                                    <View style={[s.itemThumb, s.thumbFallback]}>
                                        <Package size={20} color={C.textM} />
                                    </View>
                                )}
                                <View style={{ flex: 1, gap: 3 }}>
                                    <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={s.itemPrice}>{formatGHS(item.price)}</Text>
                                    <Text style={s.itemStatus}>Status: {item.status || "active"}</Text>
                                </View>
                                <ChevronRight size={18} color="#CCCCCC" />
                            </TouchableOpacity>
                        ))
                    )}
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
    storeCard:   { backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, gap: 12 },
    storeHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
    storeAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: C.primaryL },
    avatarFallback: { backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center" },
    titleBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    storeName:   { fontSize: 17, fontWeight: "800", color: C.textP },
    verifiedBadge: { backgroundColor: C.primaryL, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    verifiedBadgeTxt: { fontSize: 10, fontWeight: "800", color: C.primary },
    storeSub:    { fontSize: 13, color: C.textS, marginTop: 2 },
    storeBio:    { fontSize: 13, color: C.textS, lineHeight: 19 },
    statsGrid:   { flexDirection: "row", gap: 10 },
    statBox:     { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: C.border },
    statNum:     { fontSize: 20, fontWeight: "900", color: C.textP },
    statLabel:   { fontSize: 11, fontWeight: "700", color: C.textS, marginTop: 4 },
    createBtn:   { backgroundColor: C.primary, height: 50, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    createBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: C.textP },
    viewAllTxt:  { fontSize: 13, fontWeight: "700", color: C.primary },
    emptyCard:   { backgroundColor: C.surface, borderRadius: 20, padding: 32, alignItems: "center", borderWidth: 1, borderColor: C.border, gap: 10 },
    emptyTitle:  { fontSize: 15, fontWeight: "800", color: C.textP },
    emptySub:    { fontSize: 13, color: C.textS, textAlign: "center" },
    itemCard:    { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: C.border },
    itemThumb:   { width: 56, height: 56, borderRadius: 12 },
    thumbFallback: { backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    itemTitle:   { fontSize: 14, fontWeight: "700", color: C.textP },
    itemPrice:   { fontSize: 14, fontWeight: "800", color: C.primary },
    itemStatus:  { fontSize: 11, color: C.textM, textTransform: "capitalize" },
});
