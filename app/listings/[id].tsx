import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    ActivityIndicator, Linking, Share, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    ArrowLeft, Share2, MapPin, Tag, ShieldCheck, Phone,
    MessageCircle, Calendar, Sparkles, CheckCircle2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import { API_BASE_URL, formatGHS } from "../../constants/api";

const { width } = Dimensions.get("window");

export default function ListingDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const fetchListing = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/listings/${id}`);
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to load listing details");
                return;
            }
            setListing(data.listing);
        } catch {
            setError("Could not connect to server. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchListing();
        }
    }, [id]);

    const handleShare = async () => {
        if (!listing) return;
        try {
            await Share.share({
                title: listing.title,
                message: `Check out "${listing.title}" on Rytok for ${formatGHS(listing.price)}!\nhttps://rytok.com/listings/${listing.id}`,
            });
        } catch {}
    };

    const handleCall = () => {
        const phone = listing?.seller_phone;
        if (!phone) return;
        Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
    };

    const handleWhatsApp = () => {
        const rawPhone = listing?.seller_phone;
        if (!rawPhone) return;
        let cleanPhone = rawPhone.replace(/[^\d]/g, "");
        if (cleanPhone.startsWith("0")) {
            cleanPhone = "233" + cleanPhone.substring(1);
        }
        const text = encodeURIComponent(`Hello! I saw your listing "${listing.title}" on Rytok and I'm interested.`);
        Linking.openURL(`https://wa.me/${cleanPhone}?text=${text}`);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading listing details...</Text>
            </SafeAreaView>
        );
    }

    if (error || !listing) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.errorTitle}>Listing Not Found</Text>
                <Text style={styles.errorSub}>{error || "This listing may have been removed or sold."}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchListing}>
                    <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.back()}>
                    <Text style={{ color: "#3b82f6", fontWeight: "600" }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const images: string[] = Array.isArray(listing.images) && listing.images.length > 0
        ? listing.images
        : [];

    const isBusiness = listing.seller_account_type === "business";

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ArrowLeft size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Share2 size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <View style={styles.imageGalleryWrap}>
                    {images.length > 0 ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const offset = e.nativeEvent.contentOffset.x;
                                const index = Math.round(offset / width);
                                setActiveImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                        >
                            {images.map((img, i) => (
                                <Image
                                    key={i}
                                    source={{ uri: img }}
                                    style={styles.galleryImage}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={[styles.galleryImage, styles.noImagePlaceholder]}>
                            <Tag size={48} color={colors.textMuted} />
                            <Text style={{ color: colors.textMuted, marginTop: 8 }}>No photo provided</Text>
                        </View>
                    )}

                    {images.length > 1 && (
                        <View style={styles.paginationDots}>
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        activeImageIndex === i ? styles.activeDot : null,
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Main Details */}
                <View style={styles.detailsContainer}>
                    {/* Price and Badges */}
                    <View style={styles.priceRow}>
                        <Text style={styles.priceText}>{formatGHS(listing.price)}</Text>
                        <View style={styles.badgeRow}>
                            {listing.is_negotiable && (
                                <View style={styles.negoBadge}>
                                    <Text style={styles.negoBadgeText}>Negotiable</Text>
                                </View>
                            )}
                            {listing.is_boosted && (
                                <View style={styles.boostBadge}>
                                    <Sparkles size={12} color="#fbbf24" />
                                    <Text style={styles.boostBadgeText}>Boosted</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.titleText}>{listing.title}</Text>

                    {/* Quick Meta Tags */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MapPin size={14} color={colors.textMuted} />
                            <Text style={styles.metaText}>{listing.location || "Ghana"}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Tag size={14} color={colors.textMuted} />
                            <Text style={styles.metaText}>{listing.condition || "Used"}</Text>
                        </View>
                        {listing.category_name && (
                            <View style={styles.metaItem}>
                                <CheckCircle2 size={14} color="#3b82f6" />
                                <Text style={styles.metaText}>{listing.category_name}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Description Section */}
                    <Text style={styles.sectionHeader}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {listing.description || "No description provided by the seller."}
                    </Text>

                    <View style={styles.divider} />

                    {/* Seller Card */}
                    <Text style={styles.sectionHeader}>Seller Information</Text>
                    <View style={styles.sellerCard}>
                        <View style={styles.sellerAvatarWrap}>
                            {listing.seller_avatar ? (
                                <Image source={{ uri: listing.seller_avatar }} style={styles.sellerAvatar} />
                            ) : (
                                <View style={styles.sellerAvatarFallback}>
                                    <Text style={styles.avatarInitial}>
                                        {(listing.seller_name || "S")[0].toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Text style={styles.sellerName}>{listing.seller_name || "Rytok Member"}</Text>
                                {isBusiness && <ShieldCheck size={16} color="#a855f7" />}
                            </View>
                            <Text style={styles.sellerRole}>
                                {isBusiness ? "Verified Business Seller" : "Community Member"}
                            </Text>
                            {listing.seller_joined_at && (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                                    <Calendar size={12} color={colors.textMuted} />
                                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                                        Member since {new Date(listing.seller_joined_at).getFullYear()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Safety Notice */}
                    <View style={styles.safetyBox}>
                        <ShieldCheck size={18} color="#10b981" />
                        <Text style={styles.safetyText}>
                            Always meet in a safe, public place. Do not make wire transfers before inspecting the item in person.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Floating Contact Bar */}
            <View style={styles.bottomBar}>
                {listing.seller_phone ? (
                    <>
                        <TouchableOpacity onPress={handleWhatsApp} style={styles.waBtn} activeOpacity={0.85}>
                            <MessageCircle size={20} color="#fff" />
                            <Text style={styles.btnText}>WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleCall} style={styles.callBtn} activeOpacity={0.85}>
                            <LinearGradient colors={["#3b82f6", "#1d4ed8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.callBtnGrad}>
                                <Phone size={20} color="#fff" />
                                <Text style={styles.btnText}>Call Seller</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.noContactWrap}>
                        <Text style={{ color: colors.textMuted, fontSize: 14 }}>Seller contact not available</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    centerContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 20 },
    loadingText: { color: colors.textMuted, marginTop: 12, fontSize: 14 },
    errorTitle: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
    errorSub: { fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 20 },
    retryBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.md },
    retryBtnText: { color: "#fff", fontWeight: "700" },
    navBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: 10 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255, 255, 255, 0.08)", alignItems: "center", justifyContent: "center" },
    scrollContent: { paddingBottom: 110 },
    imageGalleryWrap: { width: width, height: 320, backgroundColor: "#131726", position: "relative" },
    galleryImage: { width: width, height: 320 },
    noImagePlaceholder: { alignItems: "center", justifyContent: "center" },
    paginationDots: { position: "absolute", bottom: 12, alignSelf: "center", flexDirection: "row", gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255, 255, 255, 0.4)" },
    activeDot: { width: 22, backgroundColor: "#3b82f6" },
    detailsContainer: { padding: spacing.lg },
    priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    priceText: { fontSize: 28, fontWeight: "800", color: "#60a5fa" },
    badgeRow: { flexDirection: "row", gap: 8 },
    negoBadge: { backgroundColor: "rgba(16, 185, 129, 0.15)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
    negoBadgeText: { color: "#34d399", fontSize: 12, fontWeight: "700" },
    boostBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(245, 158, 11, 0.15)", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
    boostBadgeText: { color: "#fbbf24", fontSize: 12, fontWeight: "700" },
    titleText: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, lineHeight: 28, marginBottom: 12 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 16 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    metaText: { fontSize: 13, color: colors.textMuted },
    divider: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.08)", marginVertical: 18 },
    sectionHeader: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 10 },
    descriptionText: { fontSize: 15, color: "rgba(255, 255, 255, 0.8)", lineHeight: 24 },
    sellerCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", padding: 14, marginTop: 4 },
    sellerAvatarWrap: { width: 50, height: 50, borderRadius: 25, overflow: "hidden" },
    sellerAvatar: { width: 50, height: 50 },
    sellerAvatarFallback: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center" },
    avatarInitial: { color: "#fff", fontSize: 20, fontWeight: "700" },
    sellerName: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    sellerRole: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    safetyBox: { flexDirection: "row", gap: 10, backgroundColor: "rgba(16, 185, 129, 0.08)", borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.2)", padding: 12, marginTop: 20, alignItems: "center" },
    safetyText: { fontSize: 12, color: "rgba(255, 255, 255, 0.7)", flex: 1, lineHeight: 18 },
    bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#0e1220", borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.1)", paddingHorizontal: spacing.lg, paddingVertical: 14, flexDirection: "row", gap: 12 },
    waBtn: { flex: 1, backgroundColor: "#25D366", borderRadius: radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
    callBtn: { flex: 1, borderRadius: radius.md, overflow: "hidden" },
    callBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    noContactWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
});
