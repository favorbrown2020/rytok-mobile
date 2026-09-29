import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
    ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, MapPin, Tag, Flame, Zap } from "lucide-react-native";
import { router } from "expo-router";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import { API_BASE_URL } from "../../constants/api";

type Deal = {
    id: string;
    title: string;
    price: string;
    sale_price: string | null;
    original_price: string | null;
    discount_pct: string | null;
    images: string[];
    location: string;
    condition: string;
    is_hot_deal: boolean;
    deal_badge: string | null;
    seller_name: string;
    seller_account_type: string;
    is_verified: boolean;
    category_name: string;
    promo_type: string | null;
    promo_title: string | null;
    shop_name: string | null;
};

const CURRENCY = "GH₵";

function DealCard({ item }: { item: Deal }) {
    const img = item.images?.[0];
    const hasDiscount = item.sale_price && item.original_price;
    const pct = item.discount_pct ? Math.round(parseFloat(item.discount_pct)) : null;

    return (
        <TouchableOpacity
            style={s.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/listings/${item.id}` as any)}
        >
            <View style={s.cardImgWrap}>
                {img ? (
                    <Image source={{ uri: img }} style={s.cardImg} resizeMode="cover" />
                ) : (
                    <View style={[s.cardImg, s.cardImgFallback]}>
                        <Tag size={28} color={colors.textMuted} />
                    </View>
                )}
                {item.is_hot_deal && (
                    <View style={[s.badge, s.badgeHot]}>
                        <Text style={s.badgeText}>🔥 HOT</Text>
                    </View>
                )}
                {item.deal_badge && !item.is_hot_deal && (
                    <View style={[s.badge, s.badgeFlash]}>
                        <Text style={s.badgeText}>⚡ {item.deal_badge}</Text>
                    </View>
                )}
                {pct && (
                    <View style={s.discBubble}>
                        <Text style={s.discBubbleText}>-{pct}%</Text>
                    </View>
                )}
            </View>
            <View style={s.cardBody}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>

                {/* Prices */}
                <View style={s.priceRow}>
                    <Text style={s.priceMain}>
                        {CURRENCY} {parseFloat(item.sale_price || item.price).toLocaleString()}
                    </Text>
                    {hasDiscount && (
                        <Text style={s.priceOld}>
                            {CURRENCY} {parseFloat(item.original_price!).toLocaleString()}
                        </Text>
                    )}
                </View>

                {/* Promo tag */}
                {item.promo_title && (
                    <View style={s.promoPill}>
                        <Zap size={10} color="#fff" />
                        <Text style={s.promoText} numberOfLines={1}>{item.promo_title}</Text>
                    </View>
                )}

                {/* Location */}
                <View style={s.metaRow}>
                    <MapPin size={11} color={colors.textMuted} />
                    <Text style={s.metaText}>{item.location}</Text>
                </View>

                {/* Seller */}
                <View style={s.sellerRow}>
                    <Text style={s.sellerText}>
                        {item.shop_name || item.seller_name}
                        {item.is_verified ? " ✓" : ""}
                    </Text>
                    {item.seller_account_type === "business" && (
                        <View style={s.bizPill}><Text style={s.bizText}>Biz</Text></View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const SORTS = [
    { key: "discount",  label: "Best Discount" },
    { key: "newest",    label: "Newest" },
    { key: "price_asc", label: "Price ↑" },
];

export default function DealsScreen() {
    const [deals, setDeals]         = useState<Deal[]>([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sort, setSort]           = useState("discount");
    const [search, setSearch]       = useState("");

    const fetchDeals = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/deals?limit=40&sort=${sort}`);
            const data = await res.json();
            setDeals(data.deals || []);
        } catch (e) {
            console.warn("Deals fetch error", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [sort]);

    useEffect(() => {
        setLoading(true);
        fetchDeals();
    }, [fetchDeals]);

    const onRefresh = () => { setRefreshing(true); fetchDeals(); };

    const filtered = search.trim()
        ? deals.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
        : deals;

    return (
        <SafeAreaView style={s.page}>
            {/* ── Header ── */}
            <View style={s.header}>
                <View style={s.titleRow}>
                    <Flame size={22} color="#FF4444" />
                    <Text style={s.pageTitle}>Hot Deals</Text>
                </View>
                <Text style={s.subtitle}>{deals.length} deals available</Text>
            </View>

            {/* ── Search ── */}
            <View style={s.searchBar}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search deals..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* ── Sort tabs ── */}
            <View style={s.sortRow}>
                {SORTS.map(opt => (
                    <TouchableOpacity
                        key={opt.key}
                        style={[s.sortBtn, sort === opt.key && s.sortBtnActive]}
                        onPress={() => setSort(opt.key)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.sortBtnText, sort === opt.key && s.sortBtnTextActive]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Deals Grid ── */}
            {loading ? (
                <ActivityIndicator style={{ marginTop: 60 }} color={colors.personal.accent} size="large" />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={i => i.id}
                    numColumns={2}
                    columnWrapperStyle={s.gridRow}
                    contentContainerStyle={s.gridContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => <DealCard item={item} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.personal.accent} />
                    }
                    ListEmptyComponent={
                        <View style={s.emptyBox}>
                            <Text style={s.emptyIcon}>🏷️</Text>
                            <Text style={s.emptyTitle}>No deals found</Text>
                            <Text style={s.emptyText}>Check back soon for new deals</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page:           { flex: 1, backgroundColor: colors.bg },
    header:         { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 6 },
    titleRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
    pageTitle:      { fontSize: 22, fontWeight: "900", color: colors.textPrimary },
    subtitle:       { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
    searchBar:      { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: spacing.md, backgroundColor: colors.bgInput, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 11, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    searchInput:    { flex: 1, color: colors.textPrimary, fontSize: fontSize.sm },
    sortRow:        { flexDirection: "row", gap: 8, paddingHorizontal: spacing.md, marginBottom: spacing.md },
    sortBtn:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border },
    sortBtnActive:  { backgroundColor: colors.personal.accent, borderColor: colors.personal.accent },
    sortBtnText:    { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: "600" },
    sortBtnTextActive: { color: "#fff" },
    gridContent:    { paddingHorizontal: spacing.md, paddingBottom: 100 },
    gridRow:        { justifyContent: "space-between", marginBottom: 12 },
    card:           { width: "48%", backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    cardImgWrap:    { position: "relative" },
    cardImg:        { width: "100%", height: 120 },
    cardImgFallback:{ backgroundColor: colors.bgMuted, alignItems: "center", justifyContent: "center" },
    badge:          { position: "absolute", top: 6, left: 6, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
    badgeHot:       { backgroundColor: "rgba(255,68,68,0.85)" },
    badgeFlash:     { backgroundColor: "rgba(255,184,0,0.85)" },
    badgeText:      { color: "#fff", fontSize: 9, fontWeight: "800" },
    discBubble:     { position: "absolute", bottom: 6, right: 6, backgroundColor: colors.personal.accent, borderRadius: radius.full, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    discBubbleText: { color: "#fff", fontSize: 9, fontWeight: "900" },
    cardBody:       { padding: 8 },
    cardTitle:      { fontSize: 12, fontWeight: "600", color: colors.textPrimary, marginBottom: 5, lineHeight: 16 },
    priceRow:       { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 4 },
    priceMain:      { fontSize: 14, fontWeight: "800", color: "#22C55E" },
    priceOld:       { fontSize: 10, color: colors.textMuted, textDecorationLine: "line-through" },
    promoPill:      { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(99,102,241,0.15)", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, marginBottom: 5, alignSelf: "flex-start" },
    promoText:      { fontSize: 9, color: colors.personal.accent, fontWeight: "700", maxWidth: 100 },
    metaRow:        { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 4 },
    metaText:       { fontSize: 10, color: colors.textMuted },
    sellerRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sellerText:     { fontSize: 10, color: colors.textSecondary, fontWeight: "600" },
    bizPill:        { backgroundColor: "rgba(99,102,241,0.15)", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
    bizText:        { fontSize: 8, color: colors.personal.accent, fontWeight: "700" },
    emptyBox:       { alignItems: "center", marginTop: 80 },
    emptyIcon:      { fontSize: 48, marginBottom: 12 },
    emptyTitle:     { fontSize: fontSize.lg, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
    emptyText:      { fontSize: fontSize.sm, color: colors.textSecondary },
});