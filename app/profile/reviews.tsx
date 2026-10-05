import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../../constants/api";

const C = {
    primary: "#4F46E5", primaryL: "#EEF2FF",
    star: "#F59E0B", starL: "#FFFBEB",
    bg: "#F8FAFC", surface: "#FFFFFF",
    border: "#E2E8F0", textP: "#0F172A",
    textS: "#64748B", textM: "#94A3B8"
};

interface Reviewer {
    id: number | string;
    name: string;
    avatar_url?: string | null;
    initials: string;
}

interface Review {
    id: number | string;
    rating: number;
    comment: string;
    reply?: string | null;
    replied_at?: string | null;
    timeAgo: string;
    reviewer: Reviewer;
}

export default function ReviewsScreen() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStar, setSelectedStar] = useState<number | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await apiFetch("/api/reviews/my");
            if (res.ok) {
                const data = await res.json();
                if (data?.reviews) {
                    setReviews(data.reviews);
                } else if (Array.isArray(data)) {
                    setReviews(data);
                }
            }
        } catch (err: any) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReviews();
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : "5.0";

    const starCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    const filteredReviews = selectedStar
        ? reviews.filter(r => r.rating === selectedStar)
        : reviews;

    const renderStars = (rating: number) => {
        return (
            <View style={s.starsRow}>
                {[1, 2, 3, 4, 5].map(i => (
                    <Text key={i} style={[s.starIcon, i <= rating ? s.starFilled : s.starEmpty]}>
                        ★
                    </Text>
                ))}
            </View>
        );
    };

    const renderReviewItem = ({ item }: { item: Review }) => (
        <View style={s.reviewCard}>
            <View style={s.reviewHeader}>
                <View style={s.reviewerInfo}>
                    {item.reviewer?.avatar_url ? (
                        <Image source={{ uri: item.reviewer.avatar_url }} style={s.avatar} />
                    ) : (
                        <View style={s.avatarFallback}>
                            <Text style={s.avatarInitials}>{item.reviewer?.initials || "U"}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={s.reviewerName}>{item.reviewer?.name || "Rytok User"}</Text>
                        <Text style={s.reviewTime}>{item.timeAgo}</Text>
                    </View>
                </View>
                {renderStars(item.rating)}
            </View>

            <Text style={s.commentText}>{item.comment}</Text>

            {item.reply ? (
                <View style={s.replyBox}>
                    <Text style={s.replyLabel}>Your Response</Text>
                    <Text style={s.replyText}>{item.reply}</Text>
                </View>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <Text style={s.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Ratings & Reviews</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            <View style={{ flex: 1, backgroundColor: C.bg }}>
                {loading ? (
                    <View style={s.centerLoading}>
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text style={s.loadingText}>Fetching buyer reviews...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredReviews}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderReviewItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <View style={{ gap: 14, marginBottom: 4 }}>
                                {/* Overall Summary Card */}
                                <View style={s.summaryCard}>
                                    <View style={s.scoreCol}>
                                        <Text style={s.scoreBig}>{avgRating}</Text>
                                        {renderStars(Math.round(Number(avgRating)))}
                                        <Text style={s.reviewTotalText}>{reviews.length} total reviews</Text>
                                    </View>

                                    <View style={s.dividerVert} />

                                    <View style={s.barsCol}>
                                        {starCounts.map(item => (
                                            <TouchableOpacity
                                                key={item.star}
                                                style={s.starBarRow}
                                                activeOpacity={0.7}
                                                onPress={() => setSelectedStar(selectedStar === item.star ? null : item.star)}
                                            >
                                                <Text style={s.starBarLabel}>{item.star}★</Text>
                                                <View style={s.starBarTrack}>
                                                    <View style={[s.starBarFill, { width: `${item.pct}%` }]} />
                                                </View>
                                                <Text style={s.starBarCount}>{item.count}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Filter Pills */}
                                <View style={s.filterRow}>
                                    <TouchableOpacity
                                        style={[s.filterChip, selectedStar === null && s.filterChipActive]}
                                        onPress={() => setSelectedStar(null)}
                                    >
                                        <Text style={[s.filterChipText, selectedStar === null && s.filterChipTextActive]}>
                                            All ({reviews.length})
                                        </Text>
                                    </TouchableOpacity>

                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = reviews.filter(r => r.rating === star).length;
                                        if (count === 0 && selectedStar !== star) return null;
                                        return (
                                            <TouchableOpacity
                                                key={star}
                                                style={[s.filterChip, selectedStar === star && s.filterChipActive]}
                                                onPress={() => setSelectedStar(selectedStar === star ? null : star)}
                                            >
                                                <Text style={[s.filterChipText, selectedStar === star && s.filterChipTextActive]}>
                                                    {star}★ ({count})
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={s.emptyContainer}>
                                <Text style={s.emptyIcon}>⭐</Text>
                                <Text style={s.emptyTitle}>No reviews yet</Text>
                                <Text style={s.emptySub}>
                                    Buyers you deal with on Rytok will leave verified feedback here after completing trades.
                                </Text>
                            </View>
                        }
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
    centerLoading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { fontSize: 14, color: C.textS },
    summaryCard: { flexDirection: "row", backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    scoreCol: { alignItems: "center", justifyContent: "center", paddingRight: 16 },
    scoreBig: { fontSize: 36, fontWeight: "900", color: C.textP },
    reviewTotalText: { fontSize: 12, color: C.textM, marginTop: 4 },
    dividerVert: { width: 1, backgroundColor: C.border, marginVertical: 4 },
    barsCol: { flex: 1, paddingLeft: 16, justifyContent: "center", gap: 6 },
    starBarRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    starBarLabel: { fontSize: 11, fontWeight: "700", color: C.textS, width: 22 },
    starBarTrack: { flex: 1, height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
    starBarFill: { height: 6, backgroundColor: C.star, borderRadius: 3 },
    starBarCount: { fontSize: 11, color: C.textM, width: 20, textAlign: "right" },
    starsRow: { flexDirection: "row", gap: 2 },
    starIcon: { fontSize: 14 },
    starFilled: { color: C.star },
    starEmpty: { color: "#CBD5E1" },
    filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    filterChipActive: { backgroundColor: C.primaryL, borderColor: C.primary },
    filterChipText: { fontSize: 12, fontWeight: "600", color: C.textS },
    filterChipTextActive: { color: C.primary, fontWeight: "800" },
    reviewCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    reviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    reviewerInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    avatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center" },
    avatarInitials: { fontSize: 13, fontWeight: "800", color: C.primary },
    reviewerName: { fontSize: 14, fontWeight: "700", color: C.textP },
    reviewTime: { fontSize: 11, color: C.textM, marginTop: 1 },
    commentText: { fontSize: 14, color: C.textP, lineHeight: 21 },
    replyBox: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, marginTop: 10, borderLeftWidth: 3, borderLeftColor: C.primary },
    replyLabel: { fontSize: 11, fontWeight: "800", color: C.primary, marginBottom: 2 },
    replyText: { fontSize: 13, color: C.textS, lineHeight: 18 },
    emptyContainer: { alignItems: "center", justifyContent: "center", padding: 36, gap: 10 },
    emptyIcon: { fontSize: 48, marginBottom: 6 },
    emptyTitle: { fontSize: 17, fontWeight: "800", color: C.textP },
    emptySub: { fontSize: 13, color: C.textS, textAlign: "center", lineHeight: 20 }
});
