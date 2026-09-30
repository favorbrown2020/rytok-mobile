import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    User, LogOut, Wallet, ShieldCheck, PlusCircle,
    ChevronRight, Flame, HelpCircle, Lock, ShoppingBag,
    Coins, Sparkles, LogIn, UserPlus,
} from "lucide-react-native";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import {
    apiFetch, getStoredUser, clearAuth, getAuthToken,
    formatGHS,
} from "../../constants/api";

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProfile = async () => {
        try {
            const token = await getAuthToken();
            if (!token) {
                setUser(null);
                setWallet(null);
                setLoading(false);
                return;
            }

            // Fetch live user from /api/auth/me
            const userRes = await apiFetch("/api/auth/me");
            if (userRes.ok) {
                const userData = await userRes.json();
                if (userData.user) {
                    setUser(userData.user);
                } else {
                    const fallbackUser = await getStoredUser();
                    setUser(fallbackUser);
                }
            } else {
                const fallbackUser = await getStoredUser();
                setUser(fallbackUser);
            }

            // Fetch wallet balance
            const walletRes = await apiFetch("/api/wallet/balance");
            if (walletRes.ok) {
                const walletData = await walletRes.json();
                setWallet(walletData.wallet || null);
            }
        } catch (e) {
            console.error("Profile load error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadProfile();
    };

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to sign out of your Rytok account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await clearAuth();
                        setUser(null);
                        setWallet(null);
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={s.centerPage}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    // ─────────────────────────────────────────────────────────
    //  LOGGED OUT STATE
    // ─────────────────────────────────────────────────────────
    if (!user) {
        return (
            <SafeAreaView style={s.page} edges={["top"]}>
                <ScrollView
                    contentContainerStyle={s.loggedOutContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                    }
                >
                    <View style={s.logoHero}>
                        <View style={s.heroIconWrap}>
                            <ShoppingBag size={40} color="#3b82f6" />
                        </View>
                        <Text style={s.heroTitle}>Welcome to Rytok</Text>
                        <Text style={s.heroSub}>
                            Ghana's premier marketplace for electronics, fashion, vehicles, and verified daily deals.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={s.authBtnWrap}>
                        <TouchableOpacity
                            onPress={() => router.push("/auth/login")}
                            activeOpacity={0.85}
                            style={{ width: "100%", marginBottom: 12 }}
                        >
                            <LinearGradient
                                colors={["#3b82f6", "#1d4ed8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.primaryBtn}
                            >
                                <LogIn size={18} color="#fff" />
                                <Text style={s.primaryBtnText}>Sign In to Account</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/auth/register")}
                            activeOpacity={0.85}
                            style={s.outlineBtn}
                        >
                            <UserPlus size={18} color="#93c5fd" />
                            <Text style={s.outlineBtnText}>Create Free Account</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Features grid */}
                    <View style={s.perksContainer}>
                        <Text style={s.perksTitle}>Why create an account?</Text>

                        <View style={s.perkCard}>
                            <View style={[s.perkIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                                <PlusCircle size={20} color="#60a5fa" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.perkHeading}>Post Listings for Free</Text>
                                <Text style={s.perkBody}>Reach thousands of active verified buyers across Ghana.</Text>
                            </View>
                        </View>

                        <View style={s.perkCard}>
                            <View style={[s.perkIconWrap, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                                <Coins size={20} color="#fbbf24" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.perkHeading}>Earn Ryte Rewards</Text>
                                <Text style={s.perkBody}>Get points for signing in, daily spins, and successful deals.</Text>
                            </View>
                        </View>

                        <View style={s.perkCard}>
                            <View style={[s.perkIconWrap, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                                <ShieldCheck size={20} color="#34d399" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.perkHeading}>Verified Seller Badge</Text>
                                <Text style={s.perkBody}>Build reputation and get top placement on all search queries.</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ─────────────────────────────────────────────────────────
    //  LOGGED IN STATE
    // ─────────────────────────────────────────────────────────
    const isBusiness = user.account_type === "business";

    return (
        <SafeAreaView style={s.page} edges={["top"]}>
            <ScrollView
                contentContainerStyle={s.loggedInContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                {/* User Header Card */}
                <View style={s.userCard}>
                    <View style={s.userAvatarWrap}>
                        {user.avatar_url || user.avatar ? (
                            <Image source={{ uri: user.avatar_url || user.avatar }} style={s.userAvatar} />
                        ) : (
                            <View style={s.userAvatarFallback}>
                                <Text style={s.avatarInitial}>
                                    {(user.full_name || user.name || "U")[0].toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text style={s.userName}>{user.full_name || user.name || "Rytok Member"}</Text>
                            {isBusiness && <ShieldCheck size={16} color="#a855f7" />}
                        </View>
                        <Text style={s.userEmail}>{user.email}</Text>
                        {user.phone ? <Text style={s.userPhone}>{user.phone}</Text> : null}

                        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                            <View style={[s.badge, isBusiness ? s.badgeBusiness : s.badgePersonal]}>
                                <Text style={[s.badgeText, { color: isBusiness ? "#c084fc" : "#60a5fa" }]}>
                                    {isBusiness ? "Business Seller" : "Personal Account"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Wallet / Ryte Balance Card */}
                <LinearGradient
                    colors={["#1e293b", "#0f172a"]}
                    style={s.walletCard}
                >
                    <View style={s.walletTopRow}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Wallet size={20} color="#60a5fa" />
                            <Text style={s.walletTitle}>Rytok Wallet</Text>
                        </View>
                        <View style={s.rytePill}>
                            <Sparkles size={12} color="#fbbf24" />
                            <Text style={s.rytePillText}>
                                {wallet?.ryte_balance ?? 0} RYTE
                            </Text>
                        </View>
                    </View>

                    <View style={s.walletBalanceRow}>
                        <View>
                            <Text style={s.balanceLabel}>Available Balance</Text>
                            <Text style={s.balanceAmount}>
                                {formatGHS(wallet?.balance ?? 0)}
                            </Text>
                        </View>
                        {wallet?.escrow_balance > 0 && (
                            <View style={{ alignItems: "flex-end" }}>
                                <Text style={s.balanceLabel}>In Escrow</Text>
                                <Text style={[s.balanceAmount, { fontSize: 16, color: "#94a3b8" }]}>
                                    {formatGHS(wallet.escrow_balance)}
                                </Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <Text style={s.menuSectionTitle}>Quick Actions</Text>
                <View style={s.menuGroup}>
                    <TouchableOpacity
                        style={s.menuItem}
                        onPress={() => router.push("/(tabs)/sell")}
                        activeOpacity={0.7}
                    >
                        <View style={[s.menuIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                            <PlusCircle size={20} color="#60a5fa" />
                        </View>
                        <Text style={s.menuItemText}>Sell an Item</Text>
                        <ChevronRight size={18} color={colors.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.menuItem}
                        onPress={() => router.push("/(tabs)/deals")}
                        activeOpacity={0.7}
                    >
                        <View style={[s.menuIconWrap, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
                            <Flame size={20} color="#f87171" />
                        </View>
                        <Text style={s.menuItemText}>Browse Hot Deals</Text>
                        <ChevronRight size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Account Settings */}
                <Text style={s.menuSectionTitle}>Preferences</Text>
                <View style={s.menuGroup}>
                    <TouchableOpacity
                        style={s.menuItem}
                        onPress={() => Alert.alert("Support", "Need help? Email us at support@rytok.com or WhatsApp +233 50 000 0000")}
                        activeOpacity={0.7}
                    >
                        <View style={[s.menuIconWrap, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                            <HelpCircle size={20} color="#34d399" />
                        </View>
                        <Text style={s.menuItemText}>Help & Customer Support</Text>
                        <ChevronRight size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Log Out Button */}
                <TouchableOpacity
                    style={s.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text style={s.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={s.appVersion}>Rytok Mobile v1.0.0 • Made for Ghana 🇬🇭</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.bg },
    centerPage: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
    loggedOutContainer: { paddingHorizontal: spacing.lg, paddingVertical: 40 },
    loggedInContainer: { paddingHorizontal: spacing.lg, paddingVertical: 24, paddingBottom: 60 },
    logoHero: { alignItems: "center", marginBottom: 32 },
    heroIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(59, 130, 246, 0.12)", alignItems: "center", justifyContent: "center", marginBottom: 18 },
    heroTitle: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
    heroSub: { fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 22, paddingHorizontal: 16 },
    authBtnWrap: { marginBottom: 36 },
    primaryBtn: { borderRadius: radius.md, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    outlineBtn: { borderRadius: radius.md, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1.5, borderColor: "rgba(59, 130, 246, 0.4)" },
    outlineBtnText: { color: "#93c5fd", fontSize: 15, fontWeight: "600" },
    perksContainer: { gap: 12 },
    perksTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
    perkCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.06)", padding: 14 },
    perkIconWrap: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    perkHeading: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
    perkBody: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
    userCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: radius.lg, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", padding: 16, marginBottom: 18 },
    userAvatarWrap: { width: 60, height: 60, borderRadius: 30, overflow: "hidden" },
    userAvatar: { width: 60, height: 60 },
    userAvatarFallback: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center" },
    avatarInitial: { color: "#fff", fontSize: 24, fontWeight: "700" },
    userName: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
    userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    userPhone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
    badgePersonal: { backgroundColor: "rgba(59, 130, 246, 0.15)" },
    badgeBusiness: { backgroundColor: "rgba(168, 85, 247, 0.15)" },
    badgeText: { fontSize: 11, fontWeight: "700" },
    walletCard: { borderRadius: radius.lg, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", padding: 18, marginBottom: 24 },
    walletTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    walletTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
    rytePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(245, 158, 11, 0.15)", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    rytePillText: { color: "#fbbf24", fontSize: 12, fontWeight: "700" },
    walletBalanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    balanceLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
    balanceAmount: { fontSize: 24, fontWeight: "800", color: "#60a5fa" },
    menuSectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 4 },
    menuGroup: { backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.06)", overflow: "hidden", marginBottom: 20 },
    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.04)" },
    menuIconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 14 },
    menuItemText: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textPrimary },
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.25)", paddingVertical: 14, marginBottom: 24 },
    logoutBtnText: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
    appVersion: { textAlign: "center", fontSize: 12, color: colors.textMuted, paddingBottom: 20 },
});
