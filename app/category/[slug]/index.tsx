/**
 * Rytok Mobile - Category Page  (app/category/[slug]/index.tsx)
 *
 * Root cause fix: The web has only GET /api/categories (returns full tree with
 * nested subcategories). There is NO /api/categories/[slug] endpoint.
 * Previous versions incorrectly called a non-existent endpoint, so category
 * data never loaded, hasSubcats was always false, and the subcategory directory
 * view was never shown.
 *
 * Fix: fetch /api/categories and find the matching category by slug in the tree.
 *
 * Flow:
 *   Home screen taps category  ->  /category/[slug]
 *   Category HAS subcategories ->  Subcategory directory (image 1 - this page)
 *   User taps a subcategory    ->  Listings grid with filters (image 2)
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, TextInput, FlatList, Dimensions, Modal, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
    ArrowLeft, Search, X, ChevronRight, SlidersHorizontal,
    Package, Plus, Sparkles, Tag, LayoutGrid, Check, ShoppingBag, MapPin,
    Filter, ChevronDown,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../../../constants/api";

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 32 - 12) / 2;  /* 16px side padding + 12px column gap */

const C = {
    bg:            "#f8f9fa",
    surface:       "#ffffff",
    surface2:      "#f1f3f5",
    border:        "#e9ecef",
    textPrimary:   "#1a1a2e",
    textSecondary: "#6c757d",
    textMuted:     "#9ca3af",
    primary:       "#6366F1",
    primarySubtle: "rgba(99,102,241,0.09)",
    primaryLight:  "#eef2ff",
    red:           "#ef4444",
    amber:         "#f59e0b",
};

const SORT_OPTIONS = [
    { value: "newest",     label: "Newest first",       icon: "🕐" },
    { value: "price-asc",  label: "Price: Low to High",  icon: "📈" },
    { value: "price-desc", label: "Price: High to Low",  icon: "📉" },
];

const CONDITIONS = [
    { value: "",         label: "All" },
    { value: "new",      label: "Brand New" },
    { value: "like_new", label: "Like New" },
    { value: "good",     label: "Good" },
    { value: "used",     label: "Used" },
];

const GRADIENTS: Record<string, [string, string]> = {
    "electronics":         ["#4F46E5", "#6366F1"],
    "mobile-phones":       ["#4F46E5", "#818CF8"],
    "home-garden":         ["#065f46", "#10b981"],
    "fashion":             ["#7c2d8e", "#d946ef"],
    "vehicles":            ["#92400e", "#f59e0b"],
    "property":            ["#1e3a5f", "#0ea5e9"],
    "real-estate":         ["#1e3a5f", "#0ea5e9"],
    "sports-outdoors":     ["#065f46", "#22c55e"],
    "sports-hobbies":      ["#065f46", "#22c55e"],
    "jobs":                ["#3730a3", "#8b5cf6"],
    "kids-baby":           ["#9d174d", "#f472b6"],
    "pets-care":           ["#14532d", "#86efac"],
    "pets":                ["#14532d", "#86efac"],
    "health-beauty":       ["#7c1d6f", "#ec4899"],
    "food-beverages":      ["#7c2d12", "#fb923c"],
    "books-music":         ["#1e1b4b", "#6366f1"],
    "community-events":    ["#064e3b", "#34d399"],
    "business-industrial": ["#1c1917", "#78716c"],
    "services":            ["#1e3a5f", "#38bdf8"],
    "other":               ["#374151", "#9ca3af"],
};

function getGrad(slug: string): [string, string] {
    return GRADIENTS[slug] || ["#4F46E5", "#6366F1"];
}

function formatPrice(p: any): string {
    if (!p) return "Free";
    const n = Number(p);
    return isNaN(n) ? "Free" : `GHS ${n.toLocaleString()}`;
}

function Skel({ w, h, r = 12, style }: { w: number | string; h: number; r?: number; style?: any }) {
    return <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: "#e5e7eb" }, style]} />;
}

interface Listing {
    id: string; title: string; price?: any;
    images?: string[]; location?: string; condition?: string;
    is_boosted?: boolean; is_featured?: boolean; boost_type?: string;
}

function ListingCard({ item }: { item: Listing }) {
    const img = item.images?.[0];
    const price = formatPrice(item.price);
    const boost = (() => {
        if (!item.is_boosted && !item.is_featured) return null;
        const bt = (item.boost_type || "").toLowerCase();
        if (bt.includes("urgent"))    return "🔥 Urgent";
        if (bt.includes("spotlight")) return "✨ Spot";
        return "⚡ Featured";
    })();
    const loc = (() => {
        const parts = (item.location || "").split("/").map((p: string) => p.trim()).filter(Boolean);
        return parts.length >= 2 ? `${parts[0]} / ${parts[parts.length - 1]}` : (item.location || "");
    })();
    return (
        <TouchableOpacity style={lc.card} onPress={() => router.push(`/listings/${item.id}` as any)} activeOpacity={0.85}>
            <View style={lc.imgWrap}>
                {img
                    ? <Image source={{ uri: img }} style={lc.img} resizeMode="cover" />
                    : <View style={[lc.img, lc.imgPh]}><ShoppingBag size={26} color={C.textMuted} /></View>
                }
                {boost && <View style={lc.boostBadge}><Text style={lc.boostTxt}>{boost}</Text></View>}
            </View>
            <View style={lc.body}>
                <Text style={lc.price}>{price}</Text>
                <Text style={lc.title} numberOfLines={2}>{item.title}</Text>
                {loc ? (
                    <View style={lc.locRow}>
                        <MapPin size={9} color={C.textMuted} />
                        <Text style={lc.locTxt} numberOfLines={1}>{loc}</Text>
                    </View>
                ) : null}
                {item.condition && (
                    <View style={lc.cond}>
                        <Text style={lc.condTxt}>
                            {item.condition === "new" ? "New" : item.condition === "like_new" ? "Like New" : item.condition}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
const lc = StyleSheet.create({
    card:      { width: CARD_W, backgroundColor: C.surface, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    imgWrap:   { position: "relative", aspectRatio: 1, backgroundColor: "#f5f6fa" },
    img:       { width: "100%", height: "100%" },
    imgPh:     { alignItems: "center", justifyContent: "center" },
    boostBadge: { position: "absolute", top: 6, left: 6, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
    boostTxt:  { fontSize: 8, fontWeight: "700", color: "#fff" },
    body:      { padding: 9 },
    price:     { fontSize: 14, fontWeight: "800", color: C.primary, marginBottom: 2 },
    title:     { fontSize: 11, fontWeight: "600", color: C.textPrimary, lineHeight: 15, marginBottom: 5 },
    locRow:    { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 4 },
    locTxt:    { fontSize: 9, color: C.textMuted, flex: 1 },
    cond:      { alignSelf: "flex-start", backgroundColor: C.primaryLight, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
    condTxt:   { fontSize: 8, fontWeight: "700", color: C.primary, textTransform: "uppercase" },
});


interface Subcategory { id?: string; slug: string; name: string; icon?: string; image_url?: string | null; }

function SubcatRow({ sub, count, catIcon, gradient, onPress }: {
    sub: Subcategory; count: number; catIcon?: string; gradient: [string, string]; onPress: () => void;
}) {
    return (
        <TouchableOpacity style={sr.row} onPress={onPress} activeOpacity={0.7}>
            <View style={sr.media}>
                {sub.image_url
                    ? <Image source={{ uri: sub.image_url }} style={sr.img} resizeMode="cover" />
                    : (
                        <LinearGradient colors={[gradient[0] + "30", gradient[1] + "20"]} style={sr.emojiWrap}>
                            <Text style={sr.emoji}>{(sub.icon && sub.icon !== "📁") ? sub.icon : (catIcon || "📦")}</Text>
                        </LinearGradient>
                    )
                }
            </View>
            <View style={sr.text}>
                <Text style={sr.name}>{sub.name}</Text>
                <Text style={sr.count}>{count.toLocaleString()} {count === 1 ? "ad" : "ads"}</Text>
            </View>
            <ChevronRight size={18} color={C.textMuted} />
        </TouchableOpacity>
    );
}
const sr = StyleSheet.create({
    row:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, gap: 14 },
    media:    { width: 52, height: 52, borderRadius: 12, overflow: "hidden", backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    img:      { width: "100%", height: "100%" },
    emojiWrap: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
    emoji:    { fontSize: 26 },
    text:     { flex: 1 },
    name:     { fontSize: 14, fontWeight: "700", color: C.textPrimary, marginBottom: 2 },
    count:    { fontSize: 12, color: C.textSecondary },
});

function SortSheet({ visible, current, onSelect, onClose }: {
    visible: boolean; current: string; onSelect: (v: string) => void; onClose: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={ss.backdrop} onPress={onClose} activeOpacity={1}>
                <View style={ss.sheet} onStartShouldSetResponder={() => true}>
                    <View style={ss.handle} />
                    <View style={ss.header}>
                        <SlidersHorizontal size={18} color={C.primary} />
                        <Text style={ss.title}>Sort Listings</Text>
                    </View>
                    {SORT_OPTIONS.map(opt => {
                        const active = current === opt.value;
                        return (
                            <TouchableOpacity key={opt.value} style={[ss.option, active && ss.optActive]} onPress={() => onSelect(opt.value)} activeOpacity={0.7}>
                                <Text style={ss.optEmoji}>{opt.icon}</Text>
                                <Text style={[ss.optLabel, active && ss.optLabelActive]}>{opt.label}</Text>
                                {active && <Check size={18} color={C.primary} />}
                            </TouchableOpacity>
                        );
                    })}
                    <View style={{ height: 28 }} />
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
const ss = StyleSheet.create({
    backdrop:    { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
    sheet:       { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20 },
    handle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 18 },
    header:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
    title:       { fontSize: 17, fontWeight: "800", color: C.textPrimary },
    option:      { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
    optActive:   { backgroundColor: C.primarySubtle, borderRadius: 12, paddingHorizontal: 10, marginHorizontal: -10, borderBottomWidth: 0 },
    optEmoji:    { fontSize: 18 },
    optLabel:    { flex: 1, fontSize: 15, fontWeight: "600", color: C.textPrimary },
    optLabelActive: { color: C.primary, fontWeight: "700" },
});

interface FiltersState { condition: string; minPrice: string; maxPrice: string; }

function AdvancedFiltersPanel({ filters, onChange, activeCount }: {
    filters: FiltersState; onChange: (f: FiltersState) => void; activeCount: number;
}) {
    const [expanded, setExpanded] = useState(false);
    return (
        <View style={af.wrap}>
            <TouchableOpacity style={af.toggleRow} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
                <View style={af.toggleLeft}>
                    <Filter size={14} color={C.primary} />
                    <Text style={af.toggleLabel}>Advanced Filters</Text>
                    {activeCount > 0 && (
                        <View style={af.badge}>
                            <Text style={af.badgeTxt}>{activeCount}</Text>
                        </View>
                    )}
                </View>
                <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
                    <ChevronDown size={16} color={C.primary} />
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={af.body}>
                    <Text style={af.sectionLabel}>Condition</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={af.chipScroll}>
                        {CONDITIONS.map(c => {
                            const active = filters.condition === c.value;
                            return (
                                <TouchableOpacity
                                    key={c.value}
                                    style={[af.chip, active && af.chipActive]}
                                    onPress={() => onChange({ ...filters, condition: active ? "" : c.value })}
                                    activeOpacity={0.75}
                                >
                                    {active && <Check size={11} color="#fff" />}
                                    <Text style={[af.chipTxt, active && af.chipTxtActive]}>{c.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <Text style={[af.sectionLabel, { marginTop: 14 }]}>Price Range (GHS)</Text>
                    <View style={af.priceRow}>
                        <View style={af.priceInput}>
                            <Text style={af.pricePrefix}>Min</Text>
                            <TextInput
                                style={af.priceField}
                                placeholder="0"
                                placeholderTextColor={C.textMuted}
                                keyboardType="numeric"
                                value={filters.minPrice}
                                onChangeText={v => onChange({ ...filters, minPrice: v })}
                            />
                        </View>
                        <View style={af.priceDash} />
                        <View style={af.priceInput}>
                            <Text style={af.pricePrefix}>Max</Text>
                            <TextInput
                                style={af.priceField}
                                placeholder="Any"
                                placeholderTextColor={C.textMuted}
                                keyboardType="numeric"
                                value={filters.maxPrice}
                                onChangeText={v => onChange({ ...filters, maxPrice: v })}
                            />
                        </View>
                    </View>

                    {activeCount > 0 && (
                        <TouchableOpacity
                            style={af.clearBtn}
                            onPress={() => onChange({ condition: "", minPrice: "", maxPrice: "" })}
                            activeOpacity={0.8}
                        >
                            <X size={13} color={C.red} />
                            <Text style={af.clearTxt}>Clear Filters</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}
const af = StyleSheet.create({
    wrap:         { backgroundColor: C.surface },
    toggleRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
    toggleLeft:   { flexDirection: "row", alignItems: "center", gap: 7 },
    toggleLabel:  { fontSize: 13, fontWeight: "700", color: C.primary },
    badge:        { backgroundColor: C.primary, borderRadius: 50, width: 18, height: 18, alignItems: "center", justifyContent: "center" },
    badgeTxt:     { fontSize: 10, fontWeight: "800", color: "#fff" },
    body:         { paddingHorizontal: 14, paddingBottom: 16 },
    sectionLabel: { fontSize: 11, fontWeight: "700", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
    chipScroll:   { gap: 8, paddingBottom: 2 },
    chip:         { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 50, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface2 },
    chipActive:   { backgroundColor: C.primary, borderColor: C.primary },
    chipTxt:      { fontSize: 12, fontWeight: "600", color: C.textPrimary },
    chipTxtActive: { color: "#fff", fontWeight: "700" },
    priceRow:     { flexDirection: "row", alignItems: "center", gap: 12 },
    priceInput:   { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: C.surface2, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
    pricePrefix:  { fontSize: 11, fontWeight: "700", color: C.textMuted },
    priceField:   { flex: 1, fontSize: 13, color: C.textPrimary },
    priceDash:    { width: 14, height: 2, backgroundColor: C.border, borderRadius: 1 },
    clearBtn:     { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 14, alignSelf: "flex-start", backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 50, paddingHorizontal: 12, paddingVertical: 6 },
    clearTxt:     { fontSize: 12, fontWeight: "700", color: C.red },
});

function EmptyState({ catName, slug, searchQuery, otherCats }: {
    catName: string; slug: string; searchQuery: string; otherCats: any[];
}) {
    return (
        <ScrollView contentContainerStyle={em.wrap} showsVerticalScrollIndicator={false}>
            <View style={em.card}>
                <View style={em.iconCircle}>
                    <Package size={44} color={C.primary} strokeWidth={1.5} />
                </View>
                <Text style={em.title}>
                    {searchQuery ? `No results for "${searchQuery}"` : `No listings in ${catName} yet`}
                </Text>
                <Text style={em.sub}>
                    {searchQuery
                        ? "Try adjusting your search or clear it to browse all items."
                        : `Be the first to sell in ${catName}! Reach thousands of verified buyers with zero listing fees.`
                    }
                </Text>
                <TouchableOpacity style={em.btn} onPress={() => router.push(`/sell?category=${slug}` as any)} activeOpacity={0.85}>
                    <LinearGradient colors={[C.primary, "#1d4ed8"]} style={em.btnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Plus size={16} color="#fff" />
                        <Text style={em.btnTxt}>Post in {catName}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            {otherCats.length > 0 && (
                <View style={em.section}>
                    <View style={em.sectionRow}>
                        <Sparkles size={16} color={C.amber} />
                        <Text style={em.sectionTitle}>Explore Other Categories</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={em.hScroll}>
                        {otherCats.map((cat: any) => (
                            <TouchableOpacity key={cat.slug} style={em.catCard} onPress={() => router.replace(`/category/${cat.slug}` as any)} activeOpacity={0.8}>
                                <View style={em.catMedia}>
                                    {cat.image_url
                                        ? <Image source={{ uri: cat.image_url }} style={em.catImg} resizeMode="cover" />
                                        : <Text style={em.catEmoji}>{cat.icon || "📦"}</Text>
                                    }
                                </View>
                                <Text style={em.catName} numberOfLines={2}>{cat.name}</Text>
                                <View style={em.catCta}>
                                    <Text style={em.catCtaTxt}>Explore</Text>
                                    <ChevronRight size={10} color={C.primary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}
const em = StyleSheet.create({
    wrap:       { paddingTop: 20, alignItems: "center", paddingHorizontal: 16 },
    card:       { width: "100%", backgroundColor: C.surface, borderRadius: 20, padding: 28, alignItems: "center", borderWidth: 1, borderColor: C.border, marginBottom: 24, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
    iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: C.primarySubtle, alignItems: "center", justifyContent: "center", marginBottom: 18 },
    title:      { fontSize: 17, fontWeight: "800", color: C.textPrimary, textAlign: "center", marginBottom: 10 },
    sub:        { fontSize: 13, color: C.textSecondary, textAlign: "center", lineHeight: 19, marginBottom: 22 },
    btn:        { borderRadius: 50, overflow: "hidden", width: "100%" },
    btnInner:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
    btnTxt:     { fontSize: 14, fontWeight: "800", color: "#fff" },
    section:    { width: "100%", marginBottom: 12 },
    sectionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    sectionTitle: { fontSize: 15, fontWeight: "800", color: C.textPrimary },
    hScroll:    { gap: 12, paddingBottom: 4 },
    catCard:    { width: 110, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden", elevation: 2 },
    catMedia:   { width: "100%", height: 80, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" },
    catImg:     { width: "100%", height: "100%" },
    catEmoji:   { fontSize: 32 },
    catName:    { fontSize: 11, fontWeight: "700", color: C.textPrimary, padding: 8, paddingBottom: 4, textAlign: "center" },
    catCta:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, paddingBottom: 8 },
    catCtaTxt:  { fontSize: 10, fontWeight: "700", color: C.primary },
});


export default function CategoryScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();

    const [category,    setCategory]    = useState<any>(null);
    const [allListings, setAllListings] = useState<Listing[]>([]);
    const [otherCats,   setOtherCats]   = useState<any[]>([]);
    const [loadingCat,  setLoadingCat]  = useState(true);
    const [loadingList, setLoadingList] = useState(true);
    const [refreshing,  setRefreshing]  = useState(false);
    const [selectedSub, setSelectedSub] = useState<string | null>(null);
    const [sort,        setSort]        = useState("newest");
    const [query,       setQuery]       = useState("");
    const [showSort,    setShowSort]    = useState(false);
    const [advFilters,  setAdvFilters]  = useState<FiltersState>({ condition: "", minPrice: "", maxPrice: "" });

    const fetchData = useCallback(async () => {
        if (!slug) return;
        try {
            /**
             * The web only has ONE categories endpoint: GET /api/categories
             * It returns a tree: { categories: [ { ...cat, subcategories: [...] } ] }
             * There is NO /api/categories/[slug] endpoint.
             * So we fetch the full tree and find our category by slug.
             */
            const [catsRes, listRes] = await Promise.allSettled([
                apiFetch("/api/categories"),
                apiFetch(`/api/listings?category=${slug}&limit=40`),
            ]);

            if (catsRes.status === "fulfilled" && catsRes.value.ok) {
                const d = await catsRes.value.json();
                const allCats: any[] = d?.categories || [];

                // Search top-level categories first
                let found: any = allCats.find((c: any) => c.slug === slug);

                // If not found at top-level, search inside each category's subcategories
                if (!found) {
                    for (const parent of allCats) {
                        const sub = (parent.subcategories || []).find((s: any) => s.slug === slug);
                        if (sub) { found = sub; break; }
                    }
                }

                if (found) {
                    setCategory(found);
                    // Only auto-skip to listings if the category has NO subcategories
                    if (!found.subcategories || found.subcategories.length === 0) {
                        setSelectedSub("__all__");
                    }
                    // subcategory directory view is shown automatically when selectedSub === null
                } else {
                    // Fallback: minimal category object from slug
                    const fallbackName = slug
                        .split("-")
                        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");
                    setCategory({ slug, name: fallbackName, subcategories: [] });
                    setSelectedSub("__all__");
                }

                setLoadingCat(false);

                // Other categories for empty state (top-level only)
                setOtherCats(allCats.filter((c: any) => c.slug !== slug).slice(0, 8));
            } else {
                setLoadingCat(false);
            }

            if (listRes.status === "fulfilled" && listRes.value.ok) {
                const d = await listRes.value.json();
                setAllListings(d?.listings || []);
            }
            setLoadingList(false);

        } catch {
            setLoadingCat(false);
            setLoadingList(false);
        } finally {
            setRefreshing(false);
        }
    }, [slug]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const subcategories: Subcategory[] = category?.subcategories || [];
    const hasSubcats = subcategories.length > 0;
    const gradient = getGrad(slug || "");

    const subcatCounts = useMemo(() => {
        const m: Record<string, number> = {};
        allListings.forEach((l: any) => {
            if (l.subcategory) m[l.subcategory] = (m[l.subcategory] || 0) + 1;
        });
        return m;
    }, [allListings]);

    const advActiveCount = useMemo(() => {
        let n = 0;
        if (advFilters.condition) n++;
        if (advFilters.minPrice)  n++;
        if (advFilters.maxPrice)  n++;
        return n;
    }, [advFilters]);

    const filteredListings = useMemo(() => {
        let list = (selectedSub && selectedSub !== "__all__")
            ? allListings.filter((l: any) => l.subcategory === selectedSub)
            : allListings;
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(l => l.title?.toLowerCase().includes(q));
        }
        if (advFilters.condition) {
            list = list.filter(l => l.condition === advFilters.condition);
        }
        if (advFilters.minPrice) {
            const mn = Number(advFilters.minPrice);
            list = list.filter(l => Number(l.price) >= mn);
        }
        if (advFilters.maxPrice) {
            const mx = Number(advFilters.maxPrice);
            list = list.filter(l => !l.price || Number(l.price) <= mx);
        }
        if (sort === "price-asc")  return [...list].sort((a, b) => Number(a.price) - Number(b.price));
        if (sort === "price-desc") return [...list].sort((a, b) => Number(b.price) - Number(a.price));
        return list;
    }, [allListings, selectedSub, query, advFilters, sort]);

    const filteredSubcats = useMemo(() => {
        if (!query.trim()) return subcategories;
        const q = query.toLowerCase();
        return subcategories.filter(s => s.name?.toLowerCase().includes(q) || s.slug?.includes(q));
    }, [subcategories, query]);

    // isSubcatDir: true when the category HAS subcategories and none is selected yet
    // This is the FIRST page the user sees after tapping a category on home screen
    const isSubcatDir = hasSubcats && selectedSub === null;

    const activeSubLabel = (selectedSub && selectedSub !== "__all__")
        ? (subcategories.find(s => s.slug === selectedSub)?.name || selectedSub)
        : `All ${category?.name || ""}`;
    const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Newest first";

    const handleBack = () => {
        if (selectedSub !== null && hasSubcats) {
            // Go back to subcategory directory
            setSelectedSub(null);
        } else {
            router.back();
        }
    };

    /* Skeleton while category data loads */
    if (loadingCat) {
        return (
            <SafeAreaView style={pg.page} edges={["top"]}>
                <LinearGradient colors={gradient} style={pg.subHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={pg.backBtn}>
                        <ArrowLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={pg.subSearchBox}>
                        <Skel w="100%" h={16} r={8} />
                    </View>
                </LinearGradient>
                <View style={{ padding: 16, gap: 14 }}>
                    {[0,1,2,3,4].map(i => (
                        <View key={i} style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                            <Skel w={52} h={52} r={12} />
                            <View style={{ gap: 7, flex: 1 }}>
                                <Skel w="60%" h={14} />
                                <Skel w="35%" h={11} />
                            </View>
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={pg.page} edges={["top"]}>

            {/* ═══ SUBCATEGORY DIRECTORY VIEW ══════════════════════════════
                Shows when user first taps a category on home screen.
                Lists: "All [Category]" + each subcategory with image + count.
            ════════════════════════════════════════════════════════════════ */}
            {isSubcatDir ? (
                <>
                    {/* Thin gradient bar: back button + search — matches web image 1 */}
                    <LinearGradient colors={gradient} style={pg.subHeader}>
                        <TouchableOpacity onPress={handleBack} style={pg.backBtn} activeOpacity={0.8}>
                            <ArrowLeft size={22} color="#fff" />
                        </TouchableOpacity>
                        <View style={pg.subSearchBox}>
                            <Search size={15} color={C.textMuted} />
                            <TextInput
                                style={pg.subSearchInput}
                                placeholder="I am looking for..."
                                placeholderTextColor={C.textMuted}
                                value={query}
                                onChangeText={setQuery}
                                returnKeyType="search"
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery("")}>
                                    <X size={14} color={C.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </LinearGradient>

                    <ScrollView
                        style={pg.scroll}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => { setRefreshing(true); fetchData(); }}
                                tintColor={C.primary}
                                colors={[C.primary]}
                            />
                        }
                    >
                        {/* "All [Category]" — highlighted row, taps into full listings */}
                        <TouchableOpacity
                            style={[sr.row, pg.allRow]}
                            onPress={() => setSelectedSub("__all__")}
                            activeOpacity={0.7}
                        >
                            <View style={[sr.media, { overflow: "hidden" }]}>
                                {category?.image_url
                                    ? <Image source={{ uri: category.image_url }} style={sr.img} resizeMode="cover" />
                                    : (
                                        <LinearGradient colors={[gradient[0] + "30", gradient[1] + "20"]} style={sr.emojiWrap}>
                                            <Text style={sr.emoji}>{category?.icon || "📦"}</Text>
                                        </LinearGradient>
                                    )
                                }
                            </View>
                            <View style={sr.text}>
                                <Text style={pg.allRowName}>All {category?.name}</Text>
                                <Text style={sr.count}>{allListings.length.toLocaleString()} ads</Text>
                            </View>
                            <ChevronRight size={18} color={gradient[0]} />
                        </TouchableOpacity>

                        {/* Subcategory rows */}
                        {filteredSubcats.map(sub => (
                            <SubcatRow
                                key={sub.id || sub.slug}
                                sub={sub}
                                count={subcatCounts[sub.slug] || 0}
                                catIcon={category?.icon}
                                gradient={gradient}
                                onPress={() => setSelectedSub(sub.slug)}
                            />
                        ))}

                        {(filteredSubcats.length === 0 && query) && (
                            <View style={pg.noResults}>
                                <Text style={pg.noResultsTxt}>No subcategories match "{query}"</Text>
                            </View>
                        )}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </>
            ) : (
                /* ═══ LISTINGS VIEW ════════════════════════════════════════════
                   Shows when user selects a subcategory OR "All [Category]".
                   Gradient header (no icon/subtitle) + filters + 2-col grid.
                ═══════════════════════════════════════════════════════════════ */
                <>
                    {/* Gradient header: back + title + post btn + search. No icon/subtitle. */}
                    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={pg.listHeader}>
                        <View style={pg.topBar}>
                            <TouchableOpacity onPress={handleBack} style={pg.backBtn} activeOpacity={0.8}>
                                <ArrowLeft size={22} color="#fff" />
                            </TouchableOpacity>
                            <Text style={pg.heroTitle} numberOfLines={1}>
                                {(selectedSub && selectedSub !== "__all__") ? activeSubLabel : (category?.name || "")}
                            </Text>
                            <TouchableOpacity style={pg.postBtn} onPress={() => router.push(`/sell?category=${slug}` as any)} activeOpacity={0.85}>
                                <Plus size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={pg.searchRow}>
                            <View style={pg.searchBox}>
                                <Search size={15} color={C.textMuted} />
                                <TextInput
                                    style={pg.searchInput}
                                    placeholder={`Search in ${activeSubLabel}...`}
                                    placeholderTextColor={C.textMuted}
                                    value={query}
                                    onChangeText={setQuery}
                                    returnKeyType="search"
                                />
                                {query.length > 0 && (
                                    <TouchableOpacity onPress={() => setQuery("")}>
                                        <X size={15} color={C.textMuted} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Controls bar: subcategory pills + sort + advanced filters */}
                    <View style={pg.controlsBar}>
                        {hasSubcats && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pg.pillsScroll} style={pg.pillsRow}>
                                <TouchableOpacity
                                    style={[pg.pill, selectedSub === "__all__" && pg.pillActive]}
                                    onPress={() => setSelectedSub("__all__")}
                                    activeOpacity={0.75}
                                >
                                    <LayoutGrid size={12} color={selectedSub === "__all__" ? "#fff" : C.primary} />
                                    <Text style={[pg.pillTxt, selectedSub === "__all__" && pg.pillTxtActive]}>All</Text>
                                    <Text style={[pg.pillBadge, selectedSub === "__all__" && pg.pillBadgeActive]}>{allListings.length}</Text>
                                </TouchableOpacity>
                                {subcategories.map(sub => {
                                    const active = selectedSub === sub.slug;
                                    const cnt = subcatCounts[sub.slug] || 0;
                                    return (
                                        <TouchableOpacity
                                            key={sub.slug}
                                            style={[pg.pill, active && pg.pillActive]}
                                            onPress={() => setSelectedSub(sub.slug)}
                                            activeOpacity={0.75}
                                        >
                                            <Text>{(sub.icon && sub.icon !== "📁") ? sub.icon : "•"}</Text>
                                            <Text style={[pg.pillTxt, active && pg.pillTxtActive]}>{sub.name}</Text>
                                            {cnt > 0 && <Text style={[pg.pillBadge, active && pg.pillBadgeActive]}>{cnt}</Text>}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}

                        <View style={pg.sortRow}>
                            <Text style={pg.countTxt}>
                                <Text style={{ fontWeight: "800", color: C.textPrimary }}>{filteredListings.length}</Text>
                                {"  "}{filteredListings.length === 1 ? "ad" : "ads"} in {activeSubLabel}
                            </Text>
                            <TouchableOpacity style={pg.sortBtn} onPress={() => setShowSort(true)} activeOpacity={0.8}>
                                <SlidersHorizontal size={13} color={C.primary} />
                                <Text style={pg.sortTxt}>{sortLabel}</Text>
                            </TouchableOpacity>
                        </View>

                        <AdvancedFiltersPanel
                            filters={advFilters}
                            onChange={setAdvFilters}
                            activeCount={advActiveCount}
                        />
                    </View>

                    {/* Listings grid */}
                    {loadingList ? (
                        <ScrollView contentContainerStyle={pg.skelGrid}>
                            {[0,1,2,3,4,5].map(i => (
                                <View key={i} style={{ width: CARD_W, gap: 8 }}>
                                    <Skel w="100%" h={CARD_W} r={14} />
                                    <Skel w="65%" h={13} />
                                    <Skel w="90%" h={10} />
                                </View>
                            ))}
                        </ScrollView>
                    ) : filteredListings.length > 0 ? (
                        <FlatList
                            data={filteredListings}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            columnWrapperStyle={pg.gridRow}
                            contentContainerStyle={pg.grid}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => <ListingCard item={item} />}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={() => { setRefreshing(true); fetchData(); }}
                                    tintColor={C.primary}
                                    colors={[C.primary]}
                                />
                            }
                        />
                    ) : (
                        <EmptyState
                            catName={activeSubLabel}
                            slug={slug || ""}
                            searchQuery={query}
                            otherCats={otherCats}
                        />
                    )}
                </>
            )}

            <SortSheet
                visible={showSort}
                current={sort}
                onSelect={(v) => { setSort(v); setShowSort(false); }}
                onClose={() => setShowSort(false)}
            />
        </SafeAreaView>
    );
}

const pg = StyleSheet.create({
    page:          { flex: 1, backgroundColor: C.bg },
    /* Subcategory directory header — thin gradient bar, matches web image */
    subHeader:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
    subSearchBox:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 50, paddingHorizontal: 14, paddingVertical: 10, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
    subSearchInput: { flex: 1, fontSize: 13, color: C.textPrimary },
    allRow:        { backgroundColor: "#eef2ff" },
    allRowName:    { fontSize: 14, fontWeight: "800", color: C.primary, marginBottom: 2 },
    /* Listings view header */
    listHeader:    { paddingBottom: 12 },
    topBar:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
    backBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.22)", alignItems: "center", justifyContent: "center" },
    heroTitle:     { flex: 1, fontSize: 17, fontWeight: "800", color: "#fff", textAlign: "center", marginHorizontal: 8 },
    postBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
    searchRow:     { paddingHorizontal: 14, paddingBottom: 4 },
    searchBox:     { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 50, paddingHorizontal: 16, paddingVertical: 11, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    searchInput:   { flex: 1, fontSize: 13, color: C.textPrimary },
    /* Shared */
    scroll:        { flex: 1 },
    noResults:     { alignItems: "center", padding: 40 },
    noResultsTxt:  { fontSize: 14, color: C.textMuted },
    controlsBar:   { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
    pillsRow:      { borderBottomWidth: 1, borderBottomColor: C.border },
    pillsScroll:   { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    pill:          { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.primarySubtle, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: "transparent" },
    pillActive:    { backgroundColor: C.primary, borderColor: C.primary },
    pillTxt:       { fontSize: 12, fontWeight: "700", color: C.primary },
    pillTxtActive: { color: "#fff" },
    pillBadge:     { fontSize: 10, fontWeight: "800", color: C.primary, backgroundColor: "rgba(99,102,241,0.12)", borderRadius: 50, paddingHorizontal: 6, paddingVertical: 1 },
    pillBadgeActive: { color: C.primary, backgroundColor: "rgba(255,255,255,0.9)" },
    sortRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
    countTxt:      { fontSize: 12, color: C.textSecondary, flex: 1 },
    sortBtn:       { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.primarySubtle, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7 },
    sortTxt:       { fontSize: 11, fontWeight: "700", color: C.primary },
    grid:          { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120, rowGap: 12 },
    gridRow:       { justifyContent: "space-between", gap: 12 },
    skelGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120 },
});
