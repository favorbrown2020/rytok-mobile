import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, Image, ActivityIndicator, RefreshControl, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Bell, ShoppingBag, MapPin, Tag, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import { API_BASE_URL } from "../../constants/api";

type Listing = {
    id: string;
    title: string;
    price: string;
    images: string[];
    location: string;
    condition: string;
    category_name: string;
    category_icon: string;
    seller_name: string;
    is_boosted: boolean;
    is_negotiable: boolean;
};

const CURRENCY = "GH₵";

function ListingCard({ item }: { item: Listing }) {
    const img = item.images?.[0];
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
                    <View style={[s.cardImg, s.cardImgPlaceholder]}>
                        <ShoppingBag size={28} color={colors.textMuted} />
                    </View>
                )}
                {item.is_boosted && (
                    <View style={s.boostBadge}><Text style={s.boostBadgeText}>⚡ Boosted</Text></View>
                )}
                {item.is_negotiable && (
                    <View style={s.negoBadge}><Text style={s.negoBadgeText}>Nego</Text></View>
                )}
            </View>
            <View style={s.cardBody}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.cardPrice}>{CURRENCY} {parseFloat(item.price).toLocaleString()}</Text>
                <View style={s.cardMeta}>
                    <MapPin size={11} color={colors.textMuted} />
                    <Text style={s.cardMetaText} numberOfLines={1}>{item.location}</Text>
                </View>
                <View style={s.cardCondRow}>
                    <View style={s.condPill}><Text style={s.condPillText}>{item.condition}</Text></View>
                    <Text style={s.catIcon}>{item.category_icon}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const [listings, setListings]     = useState<Listing[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch]         = useState("");

    const fetchListings = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/listings?limit=20&sort=newest`);
            const data = await res.json();
            setListings(data.listings || []);
        } catch (e) {
            console.warn("Listings fetch error", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchListings(); }, [fetchListings]);

    const onRefresh = () => { setRefreshing(true); fetchListings(); };

    const filtered = search.trim()
        ? listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
        : listings;

    return (
        <SafeAreaView style={s.page}>
            {/* ── Header ── */}
            <View style={s.header}>
                <View style={s.logoRow}>
                    <ShoppingBag size={22} color={colors.personal.accent} />
                    <Text style={s.logoText}>rytok</Text>
                </View>
                <TouchableOpacity style={s.notifBtn}>
                    <Bell size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* ── Hero ── */}
            <View style={s.hero}>
                <Text style={s.heroTitle}>Buy, sell & discover</Text>
                <Text style={s.heroAccent}>amazing deals.</Text>
            </View>

            {/* ── Search ── */}
            <View style={s.searchBar}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search listings, deals, shops..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                />
            </View>

            {/* ── Quick Actions ── */}
            <View style={s.quickActions}>
                <TouchableOpacity
                    style={s.quickBtn}
                    onPress={() => router.push("/deals" as any)}
                    activeOpacity={0.8}
                >
                    <Tag size={16} color={colors.personal.accent} />
                    <Text style={s.quickBtnText}>Hot Deals</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={s.quickBtn}
                    onPress={() => router.push("/sell" as any)}
                    activeOpacity={0.8}
                >
                    <ShoppingBag size={16} color={colors.personal.accent} />
                    <Text style={s.quickBtnText}>Sell Item</Text>
                </TouchableOpacity>
            </View>

            {/* ── Section Header ── */}
            <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>Recent Listings</Text>
                <TouchableOpacity style={s.seeAll}>
                    <Text style={s.seeAllText}>See all</Text>
                    <ChevronRight size={14} color={colors.personal.accent} />
                </TouchableOpacity>
            </View>

            {/* ── Listings Grid ── */}
            {loading ? (
                <ActivityIndicator
                    style={{ marginTop: 60 }}
                    color={colors.personal.accent}
                    size="large"
                />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={i => i.id}
                    numColumns={2}
                    columnWrapperStyle={s.gridRow}
                    contentContainerStyle={s.gridContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => <ListingCard item={item} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.personal.accent}
                        />
                    }
                    ListEmptyComponent={
                        <View style={s.emptyBox}>
                            <Text style={s.emptyText}>No listings found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const CARD_W = "48%";

const s = StyleSheet.create({
    page:           { flex: 1, backgroundColor: colors.bg },
    header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 4 },
    logoRow:        { flexDirection: "row", alignItems: "center", gap: 8 },
    logoText:       { fontSize: 22, fontWeight: "900", color: colors.textPrimary, letterSpacing: -0.5 },
    notifBtn:       { width: 38, height: 38, borderRadius: radius.full, backgroundColor: colors.bgInput, alignItems: "center", justifyContent: "center" },
    hero:           { paddingHorizontal: spacing.md, marginBottom: 10, marginTop: 4 },
    heroTitle:      { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
    heroAccent:     { fontSize: 22, fontWeight: "800", color: colors.personal.accent },
    searchBar:      { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: spacing.md, backgroundColor: colors.bgInput, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
    searchInput:    { flex: 1, color: colors.textPrimary, fontSize: fontSize.sm },
    quickActions:   { flexDirection: "row", gap: 10, paddingHorizontal: spacing.md, marginBottom: spacing.md },
    quickBtn:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.bgCard, borderRadius: radius.md, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
    quickBtnText:   { color: colors.textPrimary, fontWeight: "700", fontSize: fontSize.sm },
    sectionRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, marginBottom: 8 },
    sectionTitle:   { fontSize: fontSize.md, fontWeight: "700", color: colors.textPrimary },
    seeAll:         { flexDirection: "row", alignItems: "center", gap: 2 },
    seeAllText:     { fontSize: fontSize.xs, color: colors.personal.accent, fontWeight: "600" },
    gridContent:    { paddingHorizontal: spacing.md, paddingBottom: 100 },
    gridRow:        { justifyContent: "space-between", marginBottom: 12 },
    card:           { width: CARD_W, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    cardImgWrap:    { position: "relative" },
    cardImg:        { width: "100%", height: 120 },
    cardImgPlaceholder: { backgroundColor: colors.bgMuted, alignItems: "center", justifyContent: "center" },
    boostBadge:     { position: "absolute", top: 6, left: 6, backgroundColor: "rgba(255,184,0,0.15)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(255,184,0,0.4)" },
    boostBadgeText: { color: "#FFB800", fontSize: 9, fontWeight: "700" },
    negoBadge:      { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(99,102,241,0.15)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    negoBadgeText:  { color: colors.personal.accent, fontSize: 9, fontWeight: "700" },
    cardBody:       { padding: 8 },
    cardTitle:      { fontSize: 12, fontWeight: "600", color: colors.textPrimary, marginBottom: 4, lineHeight: 16 },
    cardPrice:      { fontSize: 14, fontWeight: "800", color: colors.personal.accent, marginBottom: 4 },
    cardMeta:       { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 6 },
    cardMetaText:   { fontSize: 10, color: colors.textMuted, flex: 1 },
    cardCondRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    condPill:       { backgroundColor: colors.bgMuted, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    condPillText:   { fontSize: 9, color: colors.textSecondary, fontWeight: "600" },
    catIcon:        { fontSize: 14 },
    emptyBox:       { alignItems: "center", marginTop: 60 },
    emptyText:      { color: colors.textMuted, fontSize: fontSize.sm },
});