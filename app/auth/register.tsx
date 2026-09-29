import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
    ArrowLeft, ShoppingBag, Briefcase, Eye, EyeOff,
    Tag, Users, Bell, Shield, Star, Headphones,
    Package, TrendingUp, Zap, Globe, BarChart2, Award,
} from "lucide-react-native";
import { colors, spacing, radius, fontSize } from "@/constants/theme";
import { API_BASE_URL } from "@/constants/api";

const ACCOUNT_TYPES = {
    personal: {
        id: "personal",
        label: "Personal",
        badge: "FREE FOREVER",
        headerBg: "#1a3a6e",
        headerText: "#ffffff",
        tagline: "Perfect for individuals buying & selling",
        Icon: ShoppingBag,
        accentColor: "#4f6af5",
        gradient: ["#4f6af5", "#7c3aed"] as [string, string],
        featureIconColor: "#4f6af5",
        features: [
            { Icon: Tag,        text: "Buy & sell items easily" },
            { Icon: Users,      text: "Contact buyers & sellers directly" },
            { Icon: Bell,       text: "Saved searches & price alerts" },
            { Icon: Shield,     text: "Verified buyer protection" },
            { Icon: Star,       text: "Personalised recommendations" },
            { Icon: Headphones, text: "Community support" },
        ],
    },
    business: {
        id: "business",
        label: "Business",
        badge: "MOST POPULAR",
        headerBg: "#0d3d3a",
        headerText: "#f0c060",
        tagline: "Built for stores, brands & power sellers",
        Icon: Briefcase,
        accentColor: "#0e8c82",
        gradient: ["#0e8c82", "#0ea5e9"] as [string, string],
        featureIconColor: "#6ed4c8",
        features: [
            { Icon: Package,    text: "Unlimited listings with bulk upload" },
            { Icon: TrendingUp, text: "Advanced analytics dashboard" },
            { Icon: Zap,        text: "Priority placement in search" },
            { Icon: Globe,      text: "Branded storefront page" },
            { Icon: BarChart2,  text: "Promotions & ad campaign tools" },
            { Icon: Award,      text: "Verified business badge" },
        ],
    },
};

const PASSWORD_RULES = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
    { label: "One number",            test: (p: string) => /\d/.test(p) },
];

export default function RegisterScreen() {
    const [step, setStep]               = useState<"choose" | "form">("choose");
    const [accountType, setAccountType] = useState<"personal" | "business">("personal");
    const [form, setForm]               = useState({ fullName: "", email: "", phone: "", password: "", businessName: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");

    const type = ACCOUNT_TYPES[accountType];
    const passwordStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length;

    const handleSubmit = async () => {
        if (passwordStrength < 3) { setError("Please meet all password requirements."); return; }
        setLoading(true); setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, accountType }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Registration failed"); return; }
            router.replace("/(tabs)");
        } catch { setError("Network error. Please try again."); }
        finally { setLoading(false); }
    };

    // ── STEP 1: Choose account type ──
    if (step === "choose") {
        return (
            <SafeAreaView style={s.page}>
                <TouchableOpacity style={s.backArrow} onPress={() => router.back()}>
                    <ArrowLeft size={22} color="rgba(255,255,255,0.65)" />
                </TouchableOpacity>
                <ScrollView contentContainerStyle={s.chooseContainer} showsVerticalScrollIndicator={false}>
                    <Text style={s.chooseTitle}>Choose your account</Text>
                    <Text style={s.chooseSub}>You can always switch or upgrade later.</Text>

                    {/* Tab strip */}
                    <View style={s.tabStrip}>
                        {Object.values(ACCOUNT_TYPES).map(t => {
                            const isActive = accountType === t.id;
                            return (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[s.tabBtn, { borderColor: isActive ? t.accentColor : colors.border }]}
                                    onPress={() => setAccountType(t.id as any)}
                                    activeOpacity={0.8}
                                >
                                    {isActive ? (
                                        <LinearGradient colors={t.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.tabBtnInner}>
                                            <t.Icon size={15} color="#fff" />
                                            <Text style={[s.tabLabel, { color: "#fff" }]}>{t.label}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={s.tabBtnInner}>
                                            <t.Icon size={15} color={colors.textMuted} />
                                            <Text style={s.tabLabel}>{t.label}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Feature card */}
                    <View style={[s.typeCard, { borderColor: type.accentColor + "40" }]}>
                        <View style={[s.cardHeader, { backgroundColor: type.headerBg }]}>
                            <View style={[s.cardIconWrap, { borderColor: type.accentColor + "80" }]}>
                                <type.Icon size={22} color={type.headerText} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.cardTitle, { color: type.headerText }]}>{type.label} Account</Text>
                                <Text style={s.cardTagline}>{type.tagline}</Text>
                            </View>
                            <View style={[s.cardBadge, { borderColor: type.accentColor }]}>
                                <Text style={[s.cardBadgeText, { color: type.accentColor }]}>{type.badge}</Text>
                            </View>
                        </View>
                        <View style={s.featuresList}>
                            {type.features.map((f, i) => (
                                <View key={i} style={s.featureItem}>
                                    <View style={[s.featureIcon, { backgroundColor: type.accentColor + "18" }]}>
                                        <f.Icon size={14} color={type.featureIconColor} />
                                    </View>
                                    <Text style={s.featureText}>{f.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Continue button */}
                    <TouchableOpacity onPress={() => setStep("form")} activeOpacity={0.85}>
                        <LinearGradient colors={type.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.continueBtn}>
                            <Text style={s.continueBtnText}>Continue as {type.label}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push("/auth/login")}>
                        <Text style={s.loginLink}>
                            Already have an account? <Text style={{ color: type.accentColor }}>Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ── STEP 2: Registration form ──
    return (
        <SafeAreaView style={s.page}>
            <TouchableOpacity style={s.backArrow} onPress={() => setStep("choose")}>
                <ArrowLeft size={22} color="rgba(255,255,255,0.65)" />
            </TouchableOpacity>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={s.formContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Text style={s.formTitle}>Create your {type.label} account</Text>

                    {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

                    {accountType === "business" && (
                        <TextInput style={s.input} placeholder="Business Name" placeholderTextColor={colors.textMuted}
                            value={form.businessName} onChangeText={v => setForm(f => ({ ...f, businessName: v }))} />
                    )}
                    <TextInput style={s.input} placeholder="Full Name" placeholderTextColor={colors.textMuted}
                        value={form.fullName} onChangeText={v => setForm(f => ({ ...f, fullName: v }))} />
                    <TextInput style={s.input} placeholder="Email address" placeholderTextColor={colors.textMuted}
                        keyboardType="email-address" autoCapitalize="none"
                        value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} />
                    <TextInput style={s.input} placeholder="Phone number" placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                        value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} />

                    <View>
                        <TextInput style={s.input} placeholder="Password" placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} />
                        <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(p => !p)}>
                            {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                        </TouchableOpacity>
                    </View>

                    <View style={s.rulesContainer}>
                        {PASSWORD_RULES.map((r, i) => (
                            <View key={i} style={s.ruleRow}>
                                <View style={[s.ruleDot, { backgroundColor: r.test(form.password) ? colors.success : colors.border }]} />
                                <Text style={[s.ruleText, r.test(form.password) && { color: colors.success }]}>{r.label}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                        <LinearGradient colors={type.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.continueBtn}>
                            <Text style={s.continueBtnText}>{loading ? "Creating account…" : "Create Account"}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page:            { flex: 1, backgroundColor: colors.bg },
    backArrow:       { position: "absolute", top: 52, left: 18, zIndex: 10, padding: 8 },
    chooseContainer: { paddingTop: 100, paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    chooseTitle:     { fontSize: fontSize.xxl, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
    chooseSub:       { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 28 },
    tabStrip:        { flexDirection: "row", gap: 10, marginBottom: 24 },
    tabBtn:          { flex: 1, borderRadius: radius.md, borderWidth: 1.5, overflow: "hidden" },
    tabBtnInner:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
    tabLabel:        { fontSize: 14, fontWeight: "600", color: colors.textMuted },
    typeCard:        { borderRadius: radius.lg, borderWidth: 1.5, overflow: "hidden", marginBottom: 24 },
    cardHeader:      { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md },
    cardIconWrap:    { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1.5, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
    cardTitle:       { fontSize: 15, fontWeight: "700" },
    cardTagline:     { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 },
    cardBadge:       { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
    cardBadgeText:   { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
    featuresList:    { backgroundColor: "rgba(255,255,255,0.04)", padding: spacing.md, gap: 10 },
    featureItem:     { flexDirection: "row", alignItems: "center", gap: 12 },
    featureIcon:     { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    featureText:     { fontSize: 14, color: "rgba(255,255,255,0.8)", flex: 1 },
    continueBtn:     { borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginBottom: 18 },
    continueBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    loginLink:       { textAlign: "center", fontSize: 13, color: colors.textMuted },
    formContainer:   { paddingTop: 110, paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    formTitle:       { fontSize: fontSize.xl, fontWeight: "700", color: colors.textPrimary, marginBottom: 24 },
    errorBox:        { backgroundColor: "rgba(255,71,87,0.15)", borderRadius: radius.md, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,71,87,0.3)" },
    errorText:       { color: colors.danger, fontSize: 13 },
    input:           { backgroundColor: colors.bgInput, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15, marginBottom: 14 },
    eyeBtn:          { position: "absolute", right: 16, top: 16 },
    rulesContainer:  { gap: 6, marginBottom: 24 },
    ruleRow:         { flexDirection: "row", alignItems: "center", gap: 8 },
    ruleDot:         { width: 8, height: 8, borderRadius: 4 },
    ruleText:        { fontSize: 12, color: colors.textMuted },
});
