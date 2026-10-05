import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Briefcase, CheckCircle2, TrendingUp, Sparkles,
    ArrowLeft, Shield, Store, Zap, Check, AlertCircle,
} from "lucide-react-native";
import { apiFetch, getStoredUser, setStoredUser } from "../../constants/api";

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
    red:       "#EF4444",
    redL:      "#FEE2E2",
};

export default function UpgradeToBusinessScreen() {
    const [accountType, setAccountType] = useState<string>("personal");
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const cached = await getStoredUser();
                if (cached?.account_type) setAccountType(cached.account_type);

                const res = await apiFetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user?.account_type) {
                        setAccountType(data.user.account_type);
                        await setStoredUser(data.user);
                    }
                }
            } catch {} finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleUpgrade = async () => {
        setUpgrading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await apiFetch("/api/auth/upgrade-to-business", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payWithRyte: false }),
            });

            const data = await res.json();
            if (res.ok) {
                setAccountType("business");
                setSuccessMsg("Account successfully upgraded to Business!");
                const cached = await getStoredUser();
                if (cached) {
                    await setStoredUser({ ...cached, account_type: "business" });
                }
            } else {
                setErrorMsg(data.error || "Upgrade request failed. Please try again.");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
        } finally {
            setUpgrading(false);
        }
    };

    const isBusiness = accountType === "business" || accountType === "creator";

    const perks = [
        {
            title: "Custom Storefront & Branding",
            desc: "Add your shop logo, custom banner, and business hours to your public storefront.",
            icon: Store,
        },
        {
            title: "Verified Business Badge",
            desc: "Display a verified corporate badge to give buyers 100% confidence.",
            icon: Shield,
        },
        {
            title: "Priority Listing Ranking",
            desc: "Your products appear ahead of personal listings in search results and category feeds.",
            icon: TrendingUp,
        },
        {
            title: "Advanced Seller Analytics",
            desc: "Track listing views, chat conversions, and customer inquiries with real-time graphs.",
            icon: Zap,
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Upgrade to Business</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            {loading ? (
                <View style={s.centerBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.loadingTxt}>Checking account status...</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1, backgroundColor: C.bg }}
                    contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 16 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Status Hero Card */}
                    <LinearGradient
                        colors={isBusiness ? ["#065F46", "#047857"] : ["#1E1B4B", "#312E81"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.heroCard}
                    >
                        <View style={s.heroIconWrap}>
                            <Briefcase size={28} color="#fff" />
                        </View>
                        <Text style={s.heroTitle}>
                            {isBusiness ? "Business Account Active" : "Professional Seller Tools"}
                        </Text>
                        <Text style={s.heroSub}>
                            {isBusiness
                                ? "You have access to all commercial marketplace features, storefront branding, and priority rankings."
                                : "Turn your account into a verified commercial store to increase sales and unlock analytics."}
                        </Text>
                    </LinearGradient>

                    {Boolean(errorMsg) && (
                        <View style={s.errorBox}>
                            <AlertCircle size={16} color={C.red} />
                            <Text style={s.errorTxt}>{errorMsg}</Text>
                        </View>
                    )}
                    {Boolean(successMsg) && (
                        <View style={s.successBox}>
                            <Check size={16} color={C.green} />
                            <Text style={s.successTxt}>{successMsg}</Text>
                        </View>
                    )}

                    {/* Features List */}
                    <View style={s.card}>
                        <Text style={s.cardHeading}>Business Benefits</Text>
                        {perks.map((p, i) => {
                            const Icon = p.icon;
                            return (
                                <View key={i} style={s.perkRow}>
                                    <View style={s.perkIcon}>
                                        <Icon size={18} color={C.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.perkTitle}>{p.title}</Text>
                                        <Text style={s.perkDesc}>{p.desc}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Actions */}
                    {isBusiness ? (
                        <TouchableOpacity
                            style={s.storefrontBtn}
                            onPress={() => router.push("/shop/dashboard" as any)}
                            activeOpacity={0.88}
                        >
                            <Store size={18} color="#fff" />
                            <Text style={s.storefrontBtnTxt}>Open Shop Dashboard</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[s.upgradeBtn, upgrading && s.btnDisabled]}
                            onPress={handleUpgrade}
                            disabled={upgrading}
                            activeOpacity={0.88}
                        >
                            {upgrading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Sparkles size={18} color="#fff" />
                                    <Text style={s.upgradeBtnTxt}>Upgrade to Business Now</Text>
                                </>
                            )}
                        </TouchableOpacity>
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
    heroCard:    { borderRadius: 20, padding: 24, alignItems: "center" },
    heroIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
    heroTitle:   { fontSize: 20, fontWeight: "900", color: "#fff", textAlign: "center" },
    heroSub:     { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 8, lineHeight: 19 },
    errorBox:    { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.redL, borderRadius: 12, padding: 12 },
    errorTxt:    { fontSize: 13, color: C.red, fontWeight: "600", flex: 1 },
    successBox:  { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.greenL, borderRadius: 12, padding: 12 },
    successTxt:  { fontSize: 13, color: C.green, fontWeight: "600", flex: 1 },
    card:        { backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, gap: 16 },
    cardHeading: { fontSize: 16, fontWeight: "800", color: C.textP },
    perkRow:     { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    perkIcon:    { width: 38, height: 38, borderRadius: 12, backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center", marginTop: 2 },
    perkTitle:   { fontSize: 14, fontWeight: "700", color: C.textP },
    perkDesc:    { fontSize: 12, color: C.textS, marginTop: 3, lineHeight: 17 },
    upgradeBtn:  { backgroundColor: C.primary, height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    upgradeBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
    storefrontBtn: { backgroundColor: C.green, height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
    storefrontBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
    btnDisabled: { opacity: 0.7 },
});
