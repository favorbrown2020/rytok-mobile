/**
 * Rytok Mobile - Listing Detail Screen
 * Full redesign to match the web mobile ListingDetailClient.jsx exactly.
 *
 * Features:
 *  - Top nav: back + home + ••• menu (save / share / report)
 *  - Swipeable full-width image carousel with prev/next arrows
 *  - "POSTED ON RYTOK" watermark badge on each image
 *  - Thumbnail strip + image counter (1/N)
 *  - Condition badge (colored pill)
 *  - Price row: price + Negotiable tag + strikethrough if on sale
 *  - Title + location + time ago
 *  - "Make an Offer" amber button (if negotiable)
 *  - Summary chips (Year / Mileage / Body / Fuel for vehicles)
 *  - Listing Overview table (collapsible, from metadata)
 *  - Highlights (check chips, collapsible)
 *  - Description (collapsible)
 *  - Seller card: avatar + name + verified + stars + member since + profile link
 *  - Seller feedback banner
 *  - Safety tip
 *  - Report Ad row
 *  - Fixed bottom bar: Chat + Call (or Edit + Promote for owner, Sold notice if sold)
 */

import React, {
    useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import {
    View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
    Image, TextInput, Dimensions, Modal, Linking, Share,
    ActivityIndicator, Animated, PanResponder,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
    ArrowLeft, Home, MoreHorizontal, ChevronLeft, ChevronRight,
    MapPin, Clock, Tag, Shield, MessageCircle, Phone, PhoneOff,
    Heart, Share2, Flag, Check, Star, BadgeCheck, Building2,
    Smile, Edit3, TrendingUp, AlertCircle, Package, ChevronDown,
    CheckCircle, Store,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../../constants/api";
import PowerImageViewer from "../../components/PowerImageViewer";

const { width: W } = Dimensions.get("window");

/* ── Theme (matches web globals.css) ────────────────────────────── */
const C = {
    primary:       "#6366F1",
    primaryDark:   "#4F46E5",
    primarySubtle: "rgba(99,102,241,0.09)",
    primaryLight:  "#eef2ff",
    secondary:     "#FF6B35",
    amber:         "#f59e0b",
    amberLight:    "#fef3c7",
    green:         "#10B981",
    greenLight:    "#d1fae5",
    red:           "#EF4444",
    redLight:      "#fee2e2",
    bg:            "#F8F9FA",
    surface:       "#ffffff",
    surface2:      "#F1F3F5",
    border:        "#E5E7EB",
    textPrimary:   "#111827",
    textSecondary: "#6B7280",
    textMuted:     "#9CA3AF",
};

/* ── Condition palette (matches web) ─────────────────────────────── */
const CONDITIONS: Record<string, { label: string; color: string; bg: string }> = {
    new:       { label: "New",         color: "#065f46", bg: "#d1fae5" },
    like_new:  { label: "Like New",    color: "#1e40af", bg: "#dbeafe" },
    good:      { label: "Good",        color: "#92400e", bg: "#fef3c7" },
    fair:      { label: "Fair",        color: "#78350f", bg: "#fef9c3" },
    used:      { label: "Used",        color: "#6b7280", bg: "#f3f4f6" },
    poor:      { label: "Poor",        color: "#991b1b", bg: "#fee2e2" },
    for_parts: { label: "For Parts",   color: "#991b1b", bg: "#fee2e2" },
    refurb:    { label: "Refurbished", color: "#1e40af", bg: "#ede9fe" },
};

function resolveCondition(raw: string | undefined | null) {
    if (!raw) return null;
    if (CONDITIONS[raw]) return CONDITIONS[raw];
    const n = raw.toLowerCase().trim();
    if (n === "new" || n.includes("brand new") || n.includes("sealed")) return CONDITIONS.new;
    if (n === "like_new" || n.includes("like new")) return CONDITIONS.like_new;
    if (n === "good" || n.includes("fairly used") || n.includes("excellent")) return CONDITIONS.good;
    if (n === "fair") return CONDITIONS.fair;
    if (n.includes("refurb")) return CONDITIONS.refurb;
    if (n === "poor") return CONDITIONS.poor;
    if (n.includes("for parts") || n.includes("not working") || n.includes("parts only")) return CONDITIONS.for_parts;
    if (n.includes("used") || n.includes("foreign used") || n.includes("pre-owned")) return CONDITIONS.used;
    return null;
}

function formatPrice(p: any, symbol = "GHS") {
    if (!p) return "Free";
    const n = Number(p);
    return isNaN(n) ? "Free" : `${symbol} ${n.toLocaleString()}`;
}

function formatRelativeTime(dateStr: string) {
    if (!dateStr) return "Recently";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    if (mins < 2)   return "Just now";
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    if (weeks < 4)  return `${weeks}w ago`;
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Skeleton placeholder ────────────────────────────────────────── */
function Skel({ w, h, r = 10, style }: { w: number | string; h: number; r?: number; style?: any }) {
    return <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: "#e5e7eb" }, style]} />;
}

/* ── Collapsible text (description) ─────────────────────────────── */
function CollapsibleText({ text, maxLength = 200 }: { text?: string; maxLength?: number }) {
    const [expanded, setExpanded] = useState(false);
    if (!text) return <Text style={tx.desc}>No description provided.</Text>;
    const long = text.length > maxLength;
    const displayed = long && !expanded ? text.slice(0, maxLength) + "..." : text;
    return (
        <View>
            <Text style={tx.desc}>{displayed}</Text>
            {long && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)} style={tx.seeMoreBtn} activeOpacity={0.7}>
                    <Text style={tx.seeMoreTxt}>{expanded ? "Read Less" : "Read More"}</Text>
                    <ChevronDown size={14} color={C.primary} style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
                </TouchableOpacity>
            )}
        </View>
    );
}
const tx = StyleSheet.create({
    desc:       { fontSize: 14, color: C.textSecondary, lineHeight: 22 },
    seeMoreBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
    seeMoreTxt: { fontSize: 13, fontWeight: "700", color: C.primary },
});

/* ── Overview section (metadata key-value table) ─────────────────── */
const HIDDEN_KEYS = new Set([
    "features", "highlights", "amenities", "accessories", "specifications",
    "ghost_name", "Ghost_name", "claim_phone", "status", "ghost_account_type", "ghost_shop",
    "year", "mileage", "bodyType", "fuelType", // shown as chips separately
]);

function OverviewSection({ metadata, categorySlug }: { metadata: any; categorySlug?: string }) {
    const [expanded, setExpanded] = useState(false);
    if (!metadata || Object.keys(metadata).length === 0) return null;

    const validEntries = Object.entries(metadata).filter(([key, value]) => {
        if (HIDDEN_KEYS.has(key)) return false;
        if (!value || Array.isArray(value)) return false;
        return true;
    }) as [string, any][];

    if (validEntries.length === 0) return null;

    const title = categorySlug === "vehicles"    ? "Car Overview"
                : categorySlug === "real-estate" ? "Property Overview"
                : "Listing Overview";

    const collapse = validEntries.length > 4;
    const shown = collapse && !expanded ? validEntries.slice(0, 4) : validEntries;

    return (
        <View style={ov.wrap}>
            <Text style={ov.title}>{title}</Text>
            {shown.map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase());
                return (
                    <View key={key} style={ov.row}>
                        <Text style={ov.key}>{label}</Text>
                        <Text style={ov.val}>{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</Text>
                    </View>
                );
            })}
            {collapse && (
                <TouchableOpacity style={ov.moreBtn} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
                    <Text style={ov.moreTxt}>{expanded ? "See Less" : `See All ${validEntries.length} Specs`}</Text>
                    <ChevronDown size={14} color={C.primary} style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
                </TouchableOpacity>
            )}
        </View>
    );
}
const ov = StyleSheet.create({
    wrap:    { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    title:   { fontSize: 16, fontWeight: "800", color: C.textPrimary, marginBottom: 14 },
    row:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
    key:     { fontSize: 13, color: C.textSecondary, flex: 1 },
    val:     { fontSize: 13, fontWeight: "700", color: C.textPrimary, flex: 1.2, textAlign: "right" },
    moreBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12, justifyContent: "center" },
    moreTxt: { fontSize: 13, fontWeight: "700", color: C.primary },
});

/* ── Collapsible list section (Highlights / Features) ────────────── */
function CollapsibleSection({ title, items, type = "chips" }: {
    title: string; items: string[]; type?: "chips" | "grid";
}) {
    const [expanded, setExpanded] = useState(false);
    const collapse = items.length > 6;
    const shown = collapse && !expanded ? items.slice(0, 6) : items;

    return (
        <View style={cs.wrap}>
            <Text style={cs.title}>{title}</Text>
            <View style={cs.list}>
                {shown.map((item, i) => (
                    <View key={i} style={type === "chips" ? cs.chipItem : cs.gridItem}>
                        {type === "chips"
                            ? <Check size={13} color={C.green} />
                            : <View style={cs.dot} />
                        }
                        <Text style={cs.itemTxt}>{item}</Text>
                    </View>
                ))}
            </View>
            {collapse && (
                <TouchableOpacity style={cs.moreBtn} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
                    <Text style={cs.moreTxt}>{expanded ? "Show Less" : `See All ${items.length} ${title}`}</Text>
                    <ChevronDown size={14} color={C.primary} style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
                </TouchableOpacity>
            )}
        </View>
    );
}
const cs = StyleSheet.create({
    wrap:     { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    title:    { fontSize: 16, fontWeight: "800", color: C.textPrimary, marginBottom: 12 },
    list:     { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chipItem: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.greenLight, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 6 },
    gridItem: { flexDirection: "row", alignItems: "center", gap: 6, width: "47%" },
    dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary },
    itemTxt:  { fontSize: 13, color: C.textPrimary, fontWeight: "500", flexShrink: 1 },
    moreBtn:  { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12, justifyContent: "center" },
    moreTxt:  { fontSize: 13, fontWeight: "700", color: C.primary },
});


/* ── More Menu dropdown ──────────────────────────────────────────── */
function MoreMenu({ saved, onSave, onShare, onReport, onClose }: {
    saved: boolean; onSave: () => void; onShare: () => void;
    onReport: () => void; onClose: () => void;
}) {
    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={mm.backdrop} onPress={onClose} activeOpacity={1}>
                <View style={mm.menu}>
                    <TouchableOpacity style={mm.item} onPress={() => { onClose(); onSave(); }} activeOpacity={0.7}>
                        <Heart size={18} color={saved ? C.red : C.textPrimary} fill={saved ? C.red : "none"} />
                        <Text style={mm.itemTxt}>{saved ? "Unsave Listing" : "Save Listing"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={mm.item} onPress={() => { onClose(); onShare(); }} activeOpacity={0.7}>
                        <Share2 size={18} color={C.textPrimary} />
                        <Text style={mm.itemTxt}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[mm.item, { borderBottomWidth: 0 }]} onPress={() => { onClose(); onReport(); }} activeOpacity={0.7}>
                        <Flag size={18} color={C.red} />
                        <Text style={[mm.itemTxt, { color: C.red }]}>Report</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
const mm = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
    menu:     { position: "absolute", top: 60, right: 16, backgroundColor: C.surface, borderRadius: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10, minWidth: 180 },
    item:     { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    itemTxt:  { fontSize: 14, fontWeight: "600", color: C.textPrimary },
});

/* ── Star row ─────────────────────────────────────────────────────── */
function StarRow({ rating, count }: { rating: number; count: number }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} color={s <= Math.floor(rating) ? C.amber : C.border} fill={s <= Math.floor(rating) ? C.amber : "none"} />
            ))}
            <Text style={{ fontSize: 12, color: C.textSecondary, marginLeft: 4 }}>
                {count > 0 ? `${Number(rating).toFixed(1)} (${count})` : "No rating"}
            </Text>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════════════════ */
export default function ListingDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    const [listing,   setListing]   = useState<any>(null);
    const [similar,   setSimilar]   = useState<any[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState("");
    const [imgIndex,  setImgIndex]  = useState(0);
    const [saved,     setSaved]     = useState(false);
    const [showMenu,  setShowMenu]  = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [showOffer, setShowOffer] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const scrollRef  = useRef<ScrollView>(null);
    const flatRef    = useRef<FlatList>(null);

    /* Fetch listing */
    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            const [listRes, simRes] = await Promise.allSettled([
                apiFetch(`/api/listings/${id}`),
                apiFetch(`/api/listings/recommendations?listingId=${id}`),
            ]);
            if (listRes.status === "fulfilled" && listRes.value.ok) {
                const d = await listRes.value.json();
                setListing(d?.listing || d);
            } else {
                setError("Listing not found.");
            }
            if (simRes.status === "fulfilled" && simRes.value.ok) {
                const d = await simRes.value.json();
                setSimilar(d?.recommendations || []);
            }
        } catch {
            setError("Could not load listing.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* Track view */
    useEffect(() => {
        if (id) {
            apiFetch(`/api/listings/${id}/track`, { method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: "view" }),
            }).catch(() => {});
        }
    }, [id]);

    /* Save / unsave */
    const handleSave = async () => {
        const next = !saved;
        setSaved(next);
        try {
            await apiFetch(`/api/listings/${id}/save`, { method: next ? "POST" : "DELETE" });
        } catch { setSaved(!next); }
    };

    /* Share */
    const handleShare = () => {
        Share.share({ title: listing?.title || "Check this on Rytok", message: `https://rytok.com/gh/listings/${id}` });
    };

    /* Carousel navigation */
    const goToImage = (idx: number) => {
        setImgIndex(idx);
        flatRef.current?.scrollToIndex({ index: idx, animated: true });
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
                <View style={sk.topNav}>
                    <TouchableOpacity onPress={() => router.back()} style={sk.navBtn}>
                        <ArrowLeft size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ backgroundColor: C.bg, flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
                    <Skel w="100%" h={300} r={0} />
                    <View style={{ gap: 10 }}>
                        <Skel w="30%" h={22} />
                        <Skel w="55%" h={32} />
                        <Skel w="80%" h={24} />
                        <Skel w="60%" h={16} />
                    </View>
                    <Skel w="100%" h={52} r={14} />
                    <Skel w="100%" h={180} r={16} />
                    <Skel w="100%" h={120} r={16} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (error || !listing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }} edges={["top"]}>
                <Package size={52} color={C.textMuted} strokeWidth={1.5} />
                <Text style={{ fontSize: 16, color: C.textMuted, marginTop: 12 }}>{error || "Listing not found"}</Text>
                <TouchableOpacity style={{ marginTop: 20, backgroundColor: C.primary, borderRadius: 50, paddingHorizontal: 24, paddingVertical: 12 }} onPress={() => router.back()}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    /* Resolve data */
    const images: string[] = (listing.images && listing.images.length > 0) ? listing.images : [];
    const condition = resolveCondition(listing.condition) || resolveCondition(listing.metadata?.condition);
    const timeAgo   = listing.created_at ? formatRelativeTime(listing.created_at) : "Recently";
    const sellerName = listing.seller_name || "Seller";
    const sellerPhone = listing.seller_phone;
    const isNegotiable = listing.is_negotiable;

    /* Price resolution (handles flash sales) */
    const hasSale     = listing.sale_price && listing.original_price;
    const displayPrice = hasSale
        ? formatPrice(listing.sale_price)
        : formatPrice(listing.price);
    const origPrice    = hasSale ? formatPrice(listing.original_price) : null;

    /* Metadata summary chips (vehicles) */
    const summaryChips = [
        listing.metadata?.year      && { label: "Year",    value: listing.metadata.year },
        listing.metadata?.mileage   && { label: "km",      value: Number(listing.metadata.mileage).toLocaleString() },
        listing.metadata?.bodyType  && { label: "Body",    value: listing.metadata.bodyType },
        listing.metadata?.fuelType  && { label: "Fuel",    value: listing.metadata.fuelType },
    ].filter(Boolean) as { label: string; value: string }[];

    /* Feature arrays from metadata */
    const metaArrays = Object.entries(listing.metadata || {}).filter(([k, v]) =>
        Array.isArray(v) && (v as any[]).length > 0 && k !== "highlights"
    ) as [string, string[]][];

    const bottomBarHeight = 76 + insets.bottom;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
            {/* ─── TOP NAV BAR — indigo gradient (matches web mobile) ────── */}
            <LinearGradient
                colors={["#4F46E5", "#6366F1", "#818CF8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={pg.topNav}
            >
                <View style={pg.topNavLeft}>
                    <TouchableOpacity style={pg.navBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <ArrowLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={pg.navBtn} onPress={() => router.push("/" as any)} activeOpacity={0.8}>
                        <Home size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={pg.navBtn} onPress={() => setShowMenu(true)} activeOpacity={0.8}>
                    <MoreHorizontal size={22} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: C.bg, flex: 1 }}
                contentContainerStyle={{ paddingBottom: bottomBarHeight + 12 }}
            >
                {/* ─── IMAGE CAROUSEL ──────────────────────────────────────── */}
                <View style={pg.carouselWrap}>
                    <FlatList
                        ref={flatRef}
                        data={images.length > 0 ? images : ["placeholder"]}
                        keyExtractor={(_, i) => String(i)}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={e => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / W);
                            setImgIndex(idx);
                        }}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                activeOpacity={0.95}
                                onPress={() => {
                                    setLightboxIndex(index);
                                    setLightboxOpen(true);
                                }}
                                style={{ width: W, height: 300, backgroundColor: "#1a1a2e" }}
                            >
                                {item === "placeholder"
                                    ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                        <Package size={60} color="#ffffff40" />
                                      </View>
                                    : <Image source={{ uri: item }} style={{ width: W, height: 300 }} resizeMode="cover" />
                                }
                                {/* POSTED ON RYTOK watermark */}
                                <View style={pg.watermark}>
                                    <View style={pg.watermarkDot} />
                                    <Text style={pg.watermarkTxt}>POSTED ON{"\n"}RYTOK</Text>
                                </View>
                                {/* Tap hint */}
                                <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                                    <Text style={{ fontSize: 10, color: "#fff", fontWeight: "700" }}>Tap to expand</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                    {/* Prev / Next arrows */}
                    {images.length > 1 && (
                        <>
                            <TouchableOpacity
                                style={[pg.arrow, pg.arrowLeft]}
                                onPress={() => goToImage(imgIndex === 0 ? images.length - 1 : imgIndex - 1)}
                                activeOpacity={0.8}
                            >
                                <ChevronLeft size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[pg.arrow, pg.arrowRight]}
                                onPress={() => goToImage((imgIndex + 1) % images.length)}
                                activeOpacity={0.8}
                            >
                                <ChevronRight size={20} color="#fff" />
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Image counter */}
                    {images.length > 1 && (
                        <View style={pg.counter}>
                            <Text style={pg.counterTxt}>{imgIndex + 1} / {images.length}</Text>
                        </View>
                    )}

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={pg.thumbStrip}
                        >
                            {images.map((src, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => goToImage(i)}
                                    activeOpacity={0.8}
                                    style={[pg.thumb, i === imgIndex && pg.thumbActive]}
                                >
                                    <Image source={{ uri: src }} style={pg.thumbImg} resizeMode="cover" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
                <View style={{ paddingHorizontal: 14, paddingTop: 14, gap: 12 }}>

                    {/* Title Section */}
                    <View style={pg.titleCard}>
                        {/* Condition + promo badges */}
                        <View style={pg.badgeRow}>
                            {condition && (
                                <View style={[pg.condBadge, { backgroundColor: condition.bg }]}>
                                    <Text style={[pg.condBadgeTxt, { color: condition.color }]}>{condition.label}</Text>
                                </View>
                            )}
                            {listing.is_featured && (
                                <View style={pg.featBadge}>
                                    <Text style={pg.featBadgeTxt}>⭐ Featured</Text>
                                </View>
                            )}
                        </View>

                        {/* Price row */}
                        <View style={pg.priceRow}>
                            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                                <Text style={[pg.price, hasSale && { color: "#ea580c" }]}>{displayPrice}</Text>
                                {origPrice && (
                                    <Text style={pg.origPrice}>{origPrice}</Text>
                                )}
                            </View>
                            {isNegotiable && listing.status !== "sold" && (
                                <View style={pg.negBadge}>
                                    <Text style={pg.negTxt}>Negotiable</Text>
                                </View>
                            )}
                            {listing.status === "sold" && (
                                <View style={[pg.negBadge, { backgroundColor: C.redLight }]}>
                                    <Text style={[pg.negTxt, { color: C.red }]}>SOLD</Text>
                                </View>
                            )}
                        </View>

                        <Text style={pg.title}>{listing.title}</Text>

                        {/* Meta: location + time */}
                        <View style={pg.metaRow}>
                            <MapPin size={13} color={C.textMuted} />
                            <Text style={pg.metaTxt} numberOfLines={1}>{listing.location}</Text>
                            <Text style={pg.metaDot}>·</Text>
                            <Clock size={13} color={C.textMuted} />
                            <Text style={pg.metaTxt}>{timeAgo}</Text>
                        </View>

                        {/* Summary chips (Year / Mileage / etc.) */}
                        {summaryChips.length > 0 && (
                            <View style={pg.chipRow}>
                                {summaryChips.map((c, i) => (
                                    <View key={i} style={pg.chip}>
                                        <Text style={pg.chipVal}>{c.value}</Text>
                                        <Text style={pg.chipLbl}>{c.label}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Make an Offer button */}
                    {isNegotiable && listing.status !== "sold" && (
                        <TouchableOpacity
                            style={pg.offerBtn}
                            onPress={() => setShowOffer(true)}
                            activeOpacity={0.85}
                        >
                            <Tag size={18} color={C.amber} />
                            <Text style={pg.offerBtnTxt}>Make an Offer</Text>
                        </TouchableOpacity>
                    )}

                    {/* Overview (metadata key-value) */}
                    <OverviewSection metadata={listing.metadata} categorySlug={listing.category_slug} />

                    {/* Highlights */}
                    {listing.metadata?.highlights?.length > 0 && (
                        <CollapsibleSection title="Highlights" items={listing.metadata.highlights} type="chips" />
                    )}

                    {/* Dynamic feature arrays */}
                    {metaArrays.map(([key, items]) => {
                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase());
                        return <CollapsibleSection key={key} title={label} items={items} type="grid" />;
                    })}

                    {/* Description */}
                    <View style={pg.section}>
                        <Text style={pg.sectionTitle}>Description</Text>
                        <CollapsibleText text={listing.description} maxLength={200} />
                    </View>

                    {/* Seller Card */}
                    <View style={pg.sellerCard}>
                        <View style={[pg.avatar, listing.seller_account_type === "business" && pg.avatarBusiness]}>
                            <Text style={pg.avatarTxt}>{(sellerName?.[0] || "U").toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={pg.sellerName}>{sellerName}</Text>
                            {listing.seller_account_type === "business" && (
                                <View style={pg.bizBadge}>
                                    <Building2 size={10} color={C.primary} />
                                    <Text style={pg.bizTxt}>Business</Text>
                                </View>
                            )}
                            {listing.seller_is_verified && (
                                <View style={pg.verifiedRow}>
                                    <BadgeCheck size={13} color={C.green} />
                                    <Text style={pg.verifiedTxt}>Verified Seller</Text>
                                </View>
                            )}
                            <StarRow rating={Number(listing.seller_reputation || 0)} count={listing.seller_total_reviews || 0} />
                            <Text style={pg.memberSince}>
                                Member since {listing.seller_joined_at ? new Date(listing.seller_joined_at).getFullYear() : "2024"}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={pg.profileBtn}
                            onPress={() => router.push(`/seller/${listing.user_id}` as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={pg.profileBtnTxt}>
                                {listing.seller_account_type === "business" && listing.shop_slug ? "Visit Shop" : "View Profile"}
                            </Text>
                            <ChevronRight size={13} color={C.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Seller feedback banner */}
                    {listing.seller_total_reviews > 0 && (
                        <TouchableOpacity style={pg.feedbackBanner} activeOpacity={0.8}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Smile size={16} color={C.amber} />
                                <Text style={pg.feedbackTxt}>
                                    {Number(listing.seller_reputation || 0).toFixed(1)} ★ · {listing.seller_total_reviews} Feedback
                                </Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Text style={pg.feedbackView}>view all</Text>
                                <ChevronRight size={14} color={C.primary} />
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Safety tip */}
                    <View style={pg.safetyTip}>
                        <Shield size={14} color={C.green} />
                        <Text style={pg.safetyTxt}>
                            Meet in a public place. Never pay in advance. Report suspicious listings.
                        </Text>
                    </View>

                    {/* Report row */}
                    <View style={pg.reportRow}>
                        <Text style={pg.reportNote}>Help us keep Rytok safe. See something suspicious?</Text>
                        <TouchableOpacity style={pg.reportBtn} activeOpacity={0.8}>
                            <Flag size={13} color={C.red} />
                            <Text style={pg.reportBtnTxt}>Report Ad</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Similar listings */}
                    {similar.length > 0 && (
                        <View>
                            <Text style={[pg.sectionTitle, { marginBottom: 12 }]}>Similar Listings</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {similar.map((item: any) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={sim.card}
                                        onPress={() => router.push(`/listings/${item.id}` as any)}
                                        activeOpacity={0.85}
                                    >
                                        {item.images?.[0]
                                            ? <Image source={{ uri: item.images[0] }} style={sim.img} resizeMode="cover" />
                                            : <View style={[sim.img, { backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" }]}>
                                                <Package size={24} color={C.textMuted} />
                                              </View>
                                        }
                                        <View style={{ padding: 10 }}>
                                            <Text style={sim.price}>{formatPrice(item.price)}</Text>
                                            <Text style={sim.title} numberOfLines={2}>{item.title}</Text>
                                            {item.location && (
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 }}>
                                                    <MapPin size={9} color={C.textMuted} />
                                                    <Text style={sim.loc} numberOfLines={1}>{item.location}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ─── BOTTOM ACTION BAR ─────────────────────────────────────── */}
            <View style={[pg.actionBar, { paddingBottom: insets.bottom + 8 }]}>
                {listing.status === "sold" ? (
                    <View style={pg.soldNotice}>
                        <AlertCircle size={18} color={C.red} />
                        <Text style={pg.soldNoticeTxt}>This item has been sold and is no longer available.</Text>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity
                            style={pg.chatBtn}
                            onPress={() => router.push(`/messages/${listing.user_id}?listingId=${id}` as any)}
                            activeOpacity={0.85}
                        >
                            <MessageCircle size={18} color="#fff" />
                            <Text style={pg.chatBtnTxt}>Chat with Seller</Text>
                        </TouchableOpacity>
                        {sellerPhone ? (
                            <TouchableOpacity
                                style={pg.callBtn}
                                onPress={() => Linking.openURL(`tel:${sellerPhone}`)}
                                activeOpacity={0.85}
                            >
                                <Phone size={18} color="#fff" />
                                <Text style={pg.callBtnTxt}>Call</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={[pg.callBtn, { opacity: 0.4 }]}>
                                <PhoneOff size={18} color="#fff" />
                                <Text style={pg.callBtnTxt}>Private</Text>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* More Menu */}
            {showMenu && (
                <MoreMenu
                    saved={saved}
                    onSave={handleSave}
                    onShare={handleShare}
                    onReport={() => {}}
                    onClose={() => setShowMenu(false)}
                />
            )}

            {/* ─── FULLSCREEN LIGHTBOX WITH AI INSPECT ──── */}
            <PowerImageViewer
                images={listing?.images && listing.images.length > 0 ? listing.images : []}
                initialIndex={lightboxIndex}
                title={listing?.title || ""}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </SafeAreaView>
    );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const sk = StyleSheet.create({
    topNav: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#4F46E5" },
    navBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)" },
});
const sim = StyleSheet.create({
    card:  { width: 160, backgroundColor: C.surface, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: C.border, elevation: 2 },
    img:   { width: "100%", height: 120 },
    price: { fontSize: 13, fontWeight: "800", color: C.primary },
    title: { fontSize: 11, color: C.textPrimary, fontWeight: "600", lineHeight: 15, marginTop: 2 },
    loc:   { fontSize: 9, color: C.textMuted },
});
const pg = StyleSheet.create({
    /* Top nav */
    topNav:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
    topNavLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    navBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    /* Carousel */
    carouselWrap: { backgroundColor: "#1a1a2e" },
    watermark:  { position: "absolute", bottom: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    watermarkDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary },
    watermarkTxt: { fontSize: 8, fontWeight: "800", color: "#fff", lineHeight: 11 },
    arrow:      { position: "absolute", top: "50%", marginTop: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
    arrowLeft:  { left: 10 },
    arrowRight: { right: 10 },
    counter:    { position: "absolute", bottom: 10, right: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
    counterTxt: { fontSize: 12, fontWeight: "700", color: "#fff" },
    thumbStrip: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    thumb:      { width: 52, height: 52, borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "transparent", opacity: 0.6 },
    thumbActive: { borderColor: C.primary, opacity: 1 },
    thumbImg:   { width: "100%", height: "100%" },
    /* Title card */
    titleCard:  { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
    badgeRow:   { flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" },
    condBadge:  { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
    condBadgeTxt: { fontSize: 12, fontWeight: "700" },
    featBadge:  { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: "#fef3c7" },
    featBadgeTxt: { fontSize: 12, fontWeight: "700", color: "#92400e" },
    priceRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    price:      { fontSize: 26, fontWeight: "900", color: C.primary },
    origPrice:  { fontSize: 14, color: C.textMuted, textDecorationLine: "line-through", fontWeight: "500" },
    negBadge:   { backgroundColor: C.primaryLight, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
    negTxt:     { fontSize: 11, fontWeight: "700", color: C.primary },
    title:      { fontSize: 18, fontWeight: "800", color: C.textPrimary, lineHeight: 26, marginBottom: 10 },
    metaRow:    { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
    metaTxt:    { fontSize: 12, color: C.textSecondary },
    metaDot:    { fontSize: 12, color: C.textMuted },
    chipRow:    { flexDirection: "row", gap: 10, marginTop: 14, flexWrap: "wrap" },
    chip:       { backgroundColor: C.surface2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: C.border },
    chipVal:    { fontSize: 14, fontWeight: "800", color: C.textPrimary },
    chipLbl:    { fontSize: 10, color: C.textMuted, marginTop: 2 },
    /* Make an offer */
    offerBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.amberLight, borderRadius: 14, paddingVertical: 16, borderWidth: 1.5, borderColor: C.amber },
    offerBtnTxt: { fontSize: 15, fontWeight: "800", color: C.amber },
    /* Sections */
    section:    { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: C.textPrimary, marginBottom: 12 },
    /* Seller card */
    sellerCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, flexDirection: "row", gap: 14, alignItems: "flex-start", borderWidth: 1, borderColor: C.border },
    avatar:     { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primarySubtle, alignItems: "center", justifyContent: "center" },
    avatarBusiness: { backgroundColor: "#fef3c7" },
    avatarTxt:  { fontSize: 20, fontWeight: "800", color: C.primary },
    sellerName: { fontSize: 15, fontWeight: "800", color: C.textPrimary, marginBottom: 3 },
    bizBadge:   { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.primaryLight, borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 4 },
    bizTxt:     { fontSize: 10, fontWeight: "700", color: C.primary },
    verifiedRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
    verifiedTxt: { fontSize: 12, color: C.green, fontWeight: "600" },
    memberSince: { fontSize: 11, color: C.textMuted, marginTop: 4 },
    profileBtn:  { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.primaryLight, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start", marginTop: 8 },
    profileBtnTxt: { fontSize: 11, fontWeight: "700", color: C.primary },
    /* Feedback banner */
    feedbackBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
    feedbackTxt:    { fontSize: 13, fontWeight: "700", color: C.textPrimary },
    feedbackView:   { fontSize: 12, color: C.primary, fontWeight: "600" },
    /* Safety */
    safetyTip:  { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: C.greenLight, borderRadius: 12, padding: 12 },
    safetyTxt:  { fontSize: 12, color: "#065f46", lineHeight: 18, flex: 1, fontWeight: "500" },
    /* Report */
    reportRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
    reportNote: { fontSize: 12, color: C.textSecondary, flex: 1, marginRight: 12 },
    reportBtn:  { flexDirection: "row", alignItems: "center", gap: 5 },
    reportBtnTxt: { fontSize: 12, fontWeight: "700", color: C.red },
    /* Bottom action bar */
    actionBar:  { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingTop: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, elevation: 12, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    chatBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15 },
    chatBtnTxt: { fontSize: 14, fontWeight: "800", color: "#fff" },
    callBtn:    { width: 90, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.green, borderRadius: 14, paddingVertical: 15 },
    callBtnTxt: { fontSize: 14, fontWeight: "800", color: "#fff" },
    soldNotice: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.redLight, borderRadius: 14, padding: 14 },
    soldNoticeTxt: { fontSize: 13, fontWeight: "600", color: C.red, flex: 1 },
});
