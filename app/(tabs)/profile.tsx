import React, { useState, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, Alert, RefreshControl, Dimensions, Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
    Settings, Camera, LogOut, Wallet, ChevronRight,
    Star, Package, Heart, Bell, BadgeCheck,
    Edit3, BarChart3, Store, HelpCircle,
    Shield, ShieldCheck, User, Globe, Eye,
    Coins, Gift, TrendingUp, CheckCircle,
} from "lucide-react-native";
import { apiFetch, getStoredUser, clearAuth, formatGHS } from "../../constants/api";

const { width: W } = Dimensions.get("window");

/* ── Theme ──────────────────────────────────────────────────────── */
const C = {
    primary:   "#6366F1",
    primaryD:  "#4F46E5",
    primaryL:  "#eef2ff",
    green:     "#10B981",
    greenL:    "#d1fae5",
    amber:     "#f59e0b",
    amberL:    "#fef3c7",
    red:       "#EF4444",
    gold:      "#F59E0B",
    silver:    "#94A3B8",
    bronze:    "#C97A4B",
    bg:        "#F2F2F2",      // light grey — matches the image
    surface:   "#FFFFFF",
    border:    "#E8E8E8",
    textP:     "#1A1A1A",
    textS:     "#666666",
    textM:     "#AAAAAA",
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function getCompletion(user: any) {
    if (!user) return { pct: 0, next: "Log in" };
    let score = 0;
    if (user.name)        score++;
    if (user.email)       score++;
    if (user.phone)       score++;
    if (user.avatar_url)  score++;
    if (user.bio)         score++;
    if (user.is_verified) score++;
    const pct = Math.round((score / 6) * 100);
    let next = "Profile complete!";
    if (!user.avatar_url)      next = "Add a profile photo";
    else if (!user.phone)      next = "Add your phone number";
    else if (!user.bio)        next = "Write a short bio";
    else if (!user.is_verified) next = "Verify your identity";
    return { pct, next };
}

function getTrust(user: any) {
    if (!user) return { level: "Bronze", color: C.bronze };
    let s = 0;
    if (user.name)        s++;
    if (user.phone)       s++;
    if (user.avatar_url)  s++;
    if (user.is_verified) s += 2;
    if (s >= 4) return { level: "Gold",   color: C.gold   };
    if (s >= 2) return { level: "Silver", color: C.silver };
    return           { level: "Bronze", color: C.bronze };
}

/* ══════════════════════════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════════════════════════ */
export default function ProfileScreen() {
    const insets = useSafeAreaInsets();

    const [user,            setUser]           = useState<any>(null);
    const [loading,         setLoading]        = useState(true);
    const [refreshing,      setRefreshing]     = useState(false);
    const [walletBalance,   setWalletBalance]  = useState<number | null>(null);
    const [listingCount,    setListingCount]   = useState(0);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    /* ── Load ──────────────────────────────────────────────────── */
    const loadUser = useCallback(async () => {
        try {
            const cached = await getStoredUser();
            if (cached) setUser(cached);
            const res = await apiFetch("/api/auth/me");
            if (res.ok) { const d = await res.json(); if (d.user) setUser(d.user); }
        } catch {} finally { setLoading(false); }
    }, []);

    const loadExtras = useCallback(async () => {
        try {
            const [wRes, lRes] = await Promise.all([
                apiFetch("/api/wallet/balance"),
                apiFetch("/api/listings/my"),
            ]);
            if (wRes.ok) { const d = await wRes.json(); setWalletBalance(parseFloat(d.wallet?.available || 0)); }
            if (lRes.ok) { const d = await lRes.json(); setListingCount((d.listings || []).length); }
        } catch {}
    }, []);

    useFocusEffect(useCallback(() => {
        loadUser();
        loadExtras();
    }, [loadUser, loadExtras]));

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadUser(), loadExtras()]);
        setRefreshing(false);
    };

    /* ── Avatar ────────────────────────────────────────────────── */
    const handleAvatarChange = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { Alert.alert("Permission needed"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.85, allowsEditing: true, aspect: [1, 1],
        });
        if (result.canceled || !result.assets?.[0]) return;
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            (fd as any).append("file", { uri: result.assets[0].uri, name: "avatar.jpg", type: "image/jpeg" });
            const res = await apiFetch("/api/auth/profile/avatar", { method: "POST", body: fd as any });
            if (res.ok) {
                const d = await res.json();
                if (d.avatar_url) setUser((u: any) => ({ ...u, avatar_url: d.avatar_url }));
            }
        } catch {} finally { setAvatarUploading(false); }
    };

    /* ── Logout ────────────────────────────────────────────────── */
    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: async () => {
                try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch {}
                await clearAuth();
                router.replace("/auth/login" as any);
            }},
        ]);
    };

    const completion = getCompletion(user);
    const trust      = getTrust(user);

    // Redirect to auth if not logged in — must be in useEffect, not render body
    React.useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth/login" as any);
        }
    }, [loading, user]);

    if (loading) return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg }}>
            <ActivityIndicator size="large" color={C.primary} />
        </View>
    );

    if (!user) return null;



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>

            {/* ── TOP BAR ─────────────────────────────────────── */}
            <View style={s.topBar}>
                <TouchableOpacity style={s.topBtn} onPress={() => router.back()}>
                    {/* Empty left side — mirroring the image layout */}
                    <View style={{ width: 36 }} />
                </TouchableOpacity>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity style={s.topBtn} onPress={() => router.push("/notifications" as any)}>
                        <Bell size={20} color={C.textP} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.topBtn} onPress={() => setShowSettings(true)}>
                        <Settings size={20} color={C.textP} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
            >
                {/* ── AVATAR + NAME (centred, like image) ─────── */}
                <View style={s.heroSection}>
                    <TouchableOpacity style={s.avatarWrap} onPress={handleAvatarChange} activeOpacity={0.85}>
                        {user.avatar_url
                            ? <Image source={{ uri: user.avatar_url }} style={s.avatar} />
                            : <View style={[s.avatar, s.avatarFallback]}>
                                <User size={48} color="#bbb" />
                              </View>
                        }
                        <View style={s.cameraBtn}>
                            {avatarUploading
                                ? <ActivityIndicator size="small" color={C.primary} />
                                : <Camera size={14} color={C.primary} />
                            }
                        </View>
                    </TouchableOpacity>

                    <Text style={s.heroName}>{user.name || "My Account"}</Text>
                    <Text style={s.heroEmail}>{user.email}</Text>

                    {/* Badges row */}
                    <View style={s.badgesRow}>
                        {user.is_verified && (
                            <View style={[s.badge, { backgroundColor: C.greenL }]}>
                                <BadgeCheck size={12} color={C.green} />
                                <Text style={[s.badgeTxt, { color: C.green }]}>Verified</Text>
                            </View>
                        )}
                        <View style={[s.badge, { backgroundColor: trust.color + "20" }]}>
                            <Star size={11} color={trust.color} />
                            <Text style={[s.badgeTxt, { color: trust.color }]}>{trust.level} Member</Text>
                        </View>
                    </View>

                    {/* Profile completion */}
                    {completion.pct < 100 && (
                        <View style={s.completionCard}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: C.textP }}>
                                    Profile {completion.pct}% complete
                                </Text>
                                <Text style={{ fontSize: 12, color: C.primary, fontWeight: "600" }}>{completion.next}</Text>
                            </View>
                            <View style={s.completionTrack}>
                                <View style={[s.completionFill, { width: `${completion.pct}%` as any }]} />
                            </View>
                        </View>
                    )}
                </View>

                {/* ── QUICK STATS ──────────────────────────────── */}
                <View style={s.statsRow}>
                    {[
                        { label: "Listings", value: listingCount },
                        { label: "Views",    value: "—" },
                        { label: "Reviews",  value: "—" },
                    ].map(({ label, value }, i) => (
                        <View key={label} style={[s.statCell, i < 2 && { borderRightWidth: 1, borderRightColor: C.border }]}>
                            <Text style={s.statValue}>{value}</Text>
                            <Text style={s.statLabel}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── RYTOK EARN CARD (replacing Invite Friends) ── */}
                <TouchableOpacity style={s.earnCard} onPress={() => router.push("/earn" as any)} activeOpacity={0.88}>
                    <View style={s.earnIconWrap}>
                        <Coins size={22} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.earnTitle}>Rytok Earn</Text>
                        <Text style={s.earnSub}>Earn rewards, cashback & bonuses</Text>
                    </View>
                    <ChevronRight size={18} color={C.textM} />
                </TouchableOpacity>

                {/* ── RYTOK WALLET (replacing Payment Methods) ─── */}
                <View style={s.card}>
                    <View style={s.cardHeaderRow}>
                        <Text style={s.cardTitle}>Rytok Wallet</Text>
                        <TouchableOpacity onPress={() => router.push("/wallet" as any)}>
                            <Text style={s.viewAll}>View all</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Balance */}
                    <View style={s.walletBalanceRow}>
                        <View style={s.walletIconCircle}>
                            <Wallet size={22} color={C.primary} />
                        </View>
                        <View>
                            <Text style={s.walletBalanceLabel}>Available Balance</Text>
                            <Text style={s.walletBalanceAmt}>
                                {walletBalance !== null ? formatGHS(walletBalance) : "GH₵ 0.00"}
                            </Text>
                        </View>
                    </View>

                    {/* Wallet actions */}
                    <View style={s.walletActions}>
                        {[
                            { label: "Top Up",   color: C.primary, onPress: () => router.push("/wallet/topup" as any) },
                            { label: "Withdraw", color: C.green,   onPress: () => router.push("/wallet/withdraw" as any) },
                            { label: "History",  color: C.amber,   onPress: () => router.push("/wallet/history" as any) },
                        ].map(({ label, color, onPress }) => (
                            <TouchableOpacity key={label} style={[s.walletAction, { borderColor: color + "30" }]} onPress={onPress} activeOpacity={0.85}>
                                <Text style={[s.walletActionTxt, { color }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── MENU LIST ────────────────────────────────── */}
                <View style={s.menuCard}>
                    {[
                        { label: "My Listings",    icon: Package,   color: C.primary, path: "/profile/listings" },
                        { label: "Insights",       icon: TrendingUp, color: "#7c3aed", path: "/profile/performance" },
                        { label: "Orders",         icon: Eye,        color: C.amber,   path: "/orders" },
                        { label: "Ratings & Reviews", icon: Star,   color: C.gold,    path: "/profile/reviews" },
                        { label: "Saved Listings", icon: Heart,      color: "#EF4444", path: "/saved" },
                        { label: "Help & Support", icon: HelpCircle, color: C.textS,   path: "/support" },
                    ].map(({ label, icon: Icon, color, path }, i, arr) => (
                        <TouchableOpacity
                            key={label}
                            style={[s.menuRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                            onPress={() => router.push(path as any)}
                            activeOpacity={0.8}
                        >
                            <View style={[s.menuIconWrap, { backgroundColor: color + "15" }]}>
                                <Icon size={18} color={color} />
                            </View>
                            <Text style={s.menuLabel}>{label}</Text>
                            <ChevronRight size={16} color="#CCCCCC" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── LOG OUT ───────────────────────────────────── */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                    <LogOut size={16} color="#888" />
                    <Text style={s.logoutTxt}>Log out</Text>
                </TouchableOpacity>

                <Text style={s.versionTxt}>Rytok Mobile v1.0.0</Text>
            </ScrollView>

            {/* ══ SETTINGS BOTTOM SHEET ════════════════════════════ */}
            <Modal visible={showSettings} transparent={false} animationType="slide" onRequestClose={() => setShowSettings(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
                    {/* Full-screen header */}
                    <View style={ss.fullHeader}>
                        <TouchableOpacity style={ss.backBtn} onPress={() => setShowSettings(false)} activeOpacity={0.8}>
                            <Text style={ss.backArrow}>←</Text>
                        </TouchableOpacity>
                        <Text style={ss.sheetTitle}>Settings</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

                        {/* ── ACCOUNT ── */}
                        <Text style={ss.groupLabel}>ACCOUNT</Text>
                        <View style={ss.group}>
                            {[
                                {
                                    label: "Personal Information",
                                    sub: "Name, email, phone, bio",
                                    icon: User, color: C.primary,
                                    onPress: () => { setShowSettings(false); router.push("/profile/edit" as any); }
                                },
                                {
                                    label: "Verify Identity",
                                    sub: "Phone & ID verification",
                                    icon: ShieldCheck, color: C.green,
                                    onPress: () => { setShowSettings(false); router.push("/verification/phone" as any); }
                                },
                                {
                                    label: "Password & Security",
                                    sub: "Change password, 2FA, active sessions",
                                    icon: Shield, color: "#EF4444",
                                    onPress: () => { setShowSettings(false); router.push("/profile/security" as any); }
                                },
                                {
                                    label: "Connected Accounts",
                                    sub: "Google, Apple, Facebook login",
                                    icon: Globe, color: "#7c3aed",
                                    onPress: () => { setShowSettings(false); router.push("/profile/connected" as any); }
                                },
                            ].map(({ label, sub, icon: Icon, color, onPress }, i, arr) => (
                                <TouchableOpacity
                                    key={label}
                                    style={[ss.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                    onPress={onPress}
                                    activeOpacity={0.8}
                                >
                                    <View style={[ss.rowIcon, { backgroundColor: color + "18" }]}>
                                        <Icon size={20} color={color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={ss.rowLabel}>{label}</Text>
                                        <Text style={ss.rowSub}>{sub}</Text>
                                    </View>
                                    <ChevronRight size={18} color="#CCCCCC" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* ── PREFERENCES ── */}
                        <Text style={ss.groupLabel}>PREFERENCES</Text>
                        <View style={ss.group}>
                            {[
                                {
                                    label: "Notifications",
                                    sub: "Email, push notifications, SMS alerts",
                                    icon: Bell, color: C.amber,
                                    onPress: () => { setShowSettings(false); router.push("/profile/notifications" as any); }
                                },
                                {
                                    label: "Privacy & Safety",
                                    sub: "Profile visibility, blocked users",
                                    icon: Eye, color: C.textS,
                                    onPress: () => { setShowSettings(false); router.push("/profile/privacy" as any); }
                                },
                                {
                                    label: "Language & Currency",
                                    sub: "App language, display currency",
                                    icon: Settings, color: C.textS,
                                    onPress: () => { setShowSettings(false); router.push("/profile/preferences" as any); }
                                },
                                {
                                    label: "Meetup Locations",
                                    sub: "Your saved meetup & handoff spots",
                                    icon: CheckCircle, color: C.green,
                                    onPress: () => { setShowSettings(false); router.push("/profile/locations" as any); }
                                },
                            ].map(({ label, sub, icon: Icon, color, onPress }, i, arr) => (
                                <TouchableOpacity
                                    key={label}
                                    style={[ss.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                    onPress={onPress}
                                    activeOpacity={0.8}
                                >
                                    <View style={[ss.rowIcon, { backgroundColor: color + "18" }]}>
                                        <Icon size={20} color={color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={ss.rowLabel}>{label}</Text>
                                        <Text style={ss.rowSub}>{sub}</Text>
                                    </View>
                                    <ChevronRight size={18} color="#CCCCCC" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* ── MY SHOP & BUSINESS ── */}
                        <Text style={ss.groupLabel}>SHOP & BUSINESS</Text>
                        <View style={ss.group}>
                            {[
                                {
                                    label: "My Shop",
                                    sub: "Manage your shop, products & hours",
                                    icon: Store, color: "#7c3aed",
                                    onPress: () => { setShowSettings(false); router.push("/shop/dashboard" as any); }
                                },
                                {
                                    label: "Upgrade to Business",
                                    sub: "Access premium seller features",
                                    icon: TrendingUp, color: C.primary,
                                    onPress: () => { setShowSettings(false); router.push("/shop/upgrade" as any); }
                                },
                            ].map(({ label, sub, icon: Icon, color, onPress }, i, arr) => (
                                <TouchableOpacity
                                    key={label}
                                    style={[ss.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                    onPress={onPress}
                                    activeOpacity={0.8}
                                >
                                    <View style={[ss.rowIcon, { backgroundColor: color + "18" }]}>
                                        <Icon size={20} color={color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={ss.rowLabel}>{label}</Text>
                                        <Text style={ss.rowSub}>{sub}</Text>
                                    </View>
                                    <ChevronRight size={18} color="#CCCCCC" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* ── DATA & ACTIVITY ── */}
                        <Text style={ss.groupLabel}>DATA & ACTIVITY</Text>
                        <View style={ss.group}>
                            {[
                                {
                                    label: "Account Activity",
                                    sub: "Login history and active sessions",
                                    icon: Eye, color: C.textS,
                                    onPress: () => { setShowSettings(false); router.push("/profile/activity" as any); }
                                },
                                {
                                    label: "Export My Data",
                                    sub: "Download your listings and data",
                                    icon: CheckCircle, color: C.textS,
                                    onPress: () => { setShowSettings(false); router.push("/profile/export" as any); }
                                },
                            ].map(({ label, sub, icon: Icon, color, onPress }, i, arr) => (
                                <TouchableOpacity
                                    key={label}
                                    style={[ss.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                    onPress={onPress}
                                    activeOpacity={0.8}
                                >
                                    <View style={[ss.rowIcon, { backgroundColor: color + "18" }]}>
                                        <Icon size={20} color={color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={ss.rowLabel}>{label}</Text>
                                        <Text style={ss.rowSub}>{sub}</Text>
                                    </View>
                                    <ChevronRight size={18} color="#CCCCCC" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* ── DANGER ZONE ── */}
                        <Text style={ss.groupLabel}>ACCOUNT ACTIONS</Text>
                        <View style={ss.group}>
                            <TouchableOpacity
                                style={[ss.row, { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                onPress={() => { setShowSettings(false); handleLogout(); }}
                                activeOpacity={0.8}
                            >
                                <View style={[ss.rowIcon, { backgroundColor: "#fee2e2" }]}>
                                    <LogOut size={20} color="#EF4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[ss.rowLabel, { color: "#EF4444" }]}>Log Out</Text>
                                    <Text style={ss.rowSub}>Sign out of your account</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={ss.row}
                                onPress={() => Alert.alert("Delete Account", "Contact support to permanently delete your account.", [{ text: "OK" }])}
                                activeOpacity={0.8}
                            >
                                <View style={[ss.rowIcon, { backgroundColor: "#fee2e2" }]}>
                                    <Shield size={20} color="#EF4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[ss.rowLabel, { color: "#EF4444" }]}>Delete Account</Text>
                                    <Text style={ss.rowSub}>Permanently remove your account</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const s = StyleSheet.create({
    /* Top bar */
    topBar:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.bg },
    topBtn:  { flexDirection: "row", gap: 10 },

    /* Hero (centred) */
    heroSection:   { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16, gap: 8, backgroundColor: C.bg },
    avatarWrap:    { position: "relative", marginBottom: 4 },
    avatar:        { width: 100, height: 100, borderRadius: 50, backgroundColor: "#E8E8E8" },
    avatarFallback: { alignItems: "center", justifyContent: "center" },
    cameraBtn:     { position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: C.surface, borderWidth: 2, borderColor: C.border, alignItems: "center", justifyContent: "center" },
    heroName:      { fontSize: 24, fontWeight: "900", color: C.textP, marginTop: 4 },
    heroEmail:     { fontSize: 13, color: C.textS },
    badgesRow:     { flexDirection: "row", gap: 8, marginTop: 4 },
    badge:         { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
    badgeTxt:      { fontSize: 11, fontWeight: "700" },

    /* Completion */
    completionCard:  { width: "100%", backgroundColor: C.surface, borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: C.border },
    completionTrack: { height: 5, backgroundColor: C.border, borderRadius: 3 },
    completionFill:  { height: 5, backgroundColor: C.primary, borderRadius: 3 },

    /* Stats */
    statsRow:   { flexDirection: "row", backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 16, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: C.border },
    statCell:   { flex: 1, alignItems: "center", paddingVertical: 16 },
    statValue:  { fontSize: 20, fontWeight: "900", color: C.textP },
    statLabel:  { fontSize: 11, color: C.textS, fontWeight: "600", marginTop: 2 },

    /* Earn card */
    earnCard:    { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 14, borderWidth: 1, borderColor: C.border },
    earnIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
    earnTitle:   { fontSize: 15, fontWeight: "800", color: C.textP },
    earnSub:     { fontSize: 12, color: C.textS, marginTop: 1 },

    /* Wallet card */
    card:           { backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    cardHeaderRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    cardTitle:      { fontSize: 16, fontWeight: "800", color: C.textP },
    viewAll:        { fontSize: 13, fontWeight: "700", color: C.primary },
    walletBalanceRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
    walletIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center" },
    walletBalanceLabel: { fontSize: 11, fontWeight: "600", color: C.textS },
    walletBalanceAmt: { fontSize: 24, fontWeight: "900", color: C.textP, marginTop: 2 },
    walletActions:  { flexDirection: "row", gap: 8 },
    walletAction:   { flex: 1, borderRadius: 10, borderWidth: 1.5, paddingVertical: 10, alignItems: "center", backgroundColor: C.bg },
    walletActionTxt: { fontSize: 12, fontWeight: "800" },

    /* Menu list */
    menuCard:    { backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.border, marginBottom: 12 },
    menuRow:     { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
    menuIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    menuLabel:   { flex: 1, fontSize: 15, color: C.textP, fontWeight: "500" },

    /* Log out */
    logoutBtn:  { marginHorizontal: 16, borderRadius: 14, paddingVertical: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
    logoutTxt:  { fontSize: 15, fontWeight: "600", color: "#888888" },
    versionTxt: { textAlign: "center", fontSize: 11, color: C.textM },
});

/* ── Settings sheet styles (full-screen) ─────────────────────── */
const ss = StyleSheet.create({
    fullHeader:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
    backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
    backArrow:   { fontSize: 20, color: C.textP, fontWeight: "700" },
    sheetTitle:  { flex: 1, fontSize: 22, fontWeight: "900", color: C.textP, textAlign: "center" },
    /* Legacy aliases (not used but kept to avoid ref errors) */
    sheet:       { flex: 1, backgroundColor: C.bg },
    handle:      { width: 0, height: 0 },
    closeBtn:    { width: 0, height: 0 },
    closeTxt:    { fontSize: 0 },
    /* Content */
    groupLabel:  { fontSize: 12, fontWeight: "800", color: C.textM, letterSpacing: 1.2, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8 },
    group:       { backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.border, marginBottom: 4 },
    row:         { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 16 },
    rowIcon:     { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    rowLabel:    { fontSize: 17, fontWeight: "700", color: C.textP },
    rowSub:      { fontSize: 13, color: C.textM, marginTop: 2, lineHeight: 18 },
});
