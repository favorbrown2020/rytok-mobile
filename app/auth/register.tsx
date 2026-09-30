import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
    ArrowLeft, Eye, EyeOff, User, Store, ShieldCheck, Zap,
    TrendingUp, Award, Mail, Phone, Lock,
} from "lucide-react-native";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import { API_BASE_URL, setAuthToken, setStoredUser } from "../../constants/api";

type AccountType = "personal" | "business";

export default function RegisterScreen() {
    const [step, setStep]                 = useState<"choose" | "form">("choose");
    const [accountType, setAccountType]   = useState<AccountType>("personal");
    const [form, setForm]                 = useState({
        fullName: "",
        businessName: "",
        email: "",
        phone: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");

    const isBusiness = accountType === "business";

    const handleSubmit = async () => {
        if (!form.fullName.trim() || !form.email.trim() || !form.password) {
            setError("Please fill in your name, email and password.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: isBusiness && form.businessName.trim() ? `${form.businessName.trim()} (${form.fullName.trim()})` : form.fullName.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.trim(),
                    password: form.password,
                    accountType: accountType,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed.");
                return;
            }

            if (data.token) {
                await setAuthToken(data.token);
            }
            if (data.user) {
                await setStoredUser(data.user);
            }

            router.replace("/(tabs)/profile");
        } catch {
            setError("Could not connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (step === "choose") {
        return (
            <SafeAreaView style={s.page}>
                <TouchableOpacity style={s.backArrow} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ArrowLeft size={22} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={s.chooseContainer}>
                    <Text style={s.brandTag}>GET STARTED</Text>
                    <Text style={s.chooseTitle}>Choose account type</Text>
                    <Text style={s.chooseSub}>Select how you want to use Rytok today</Text>

                    {/* Account Type Card: Personal */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setAccountType("personal")}
                        style={[s.typeCard, accountType === "personal" && s.typeCardSelected]}
                    >
                        <View style={s.cardHeader}>
                            <View style={[s.cardIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                                <User size={24} color="#3b82f6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={s.rowBetween}>
                                    <Text style={s.cardTitle}>Personal Account</Text>
                                    <View style={[s.badge, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
                                        <Text style={[s.badgeText, { color: "#60a5fa" }]}>FREE</Text>
                                    </View>
                                </View>
                                <Text style={s.cardTagline}>Buy, discover deals, and sell personal items</Text>
                            </View>
                        </View>
                        <View style={s.featuresList}>
                            <View style={s.featureItem}>
                                <Zap size={14} color="#60a5fa" />
                                <Text style={s.featureText}>Post free listings across all categories</Text>
                            </View>
                            <View style={s.featureItem}>
                                <ShieldCheck size={14} color="#60a5fa" />
                                <Text style={s.featureText}>Earn Ryte reward points on activity</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Account Type Card: Business */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setAccountType("business")}
                        style={[s.typeCard, accountType === "business" && s.typeCardSelectedBusiness]}
                    >
                        <View style={s.cardHeader}>
                            <View style={[s.cardIconWrap, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
                                <Store size={24} color="#a855f7" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={s.rowBetween}>
                                    <Text style={s.cardTitle}>Business Account</Text>
                                    <View style={[s.badge, { backgroundColor: "rgba(168, 85, 247, 0.2)" }]}>
                                        <Text style={[s.badgeText, { color: "#c084fc" }]}>PRO</Text>
                                    </View>
                                </View>
                                <Text style={s.cardTagline}>For registered shops, vendors, & dealers</Text>
                            </View>
                        </View>
                        <View style={s.featuresList}>
                            <View style={s.featureItem}>
                                <Award size={14} color="#c084fc" />
                                <Text style={s.featureText}>Verified business badge & custom shop page</Text>
                            </View>
                            <View style={s.featureItem}>
                                <TrendingUp size={14} color="#c084fc" />
                                <Text style={s.featureText}>Priority search placement & deal analytics</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setStep("form")} activeOpacity={0.85} style={{ marginTop: 12 }}>
                        <LinearGradient
                            colors={isBusiness ? ["#9333ea", "#7c3aed"] : ["#3b82f6", "#1d4ed8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.continueBtn}
                        >
                            <Text style={s.continueBtnText}>Continue as {isBusiness ? "Business" : "Personal"}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push("/auth/login")} style={{ paddingVertical: 14, alignItems: "center" }}>
                        <Text style={s.loginLink}>
                            Already have an account? <Text style={{ color: "#3b82f6", fontWeight: "700" }}>Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.page}>
            <TouchableOpacity style={s.backArrow} onPress={() => setStep("choose")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ArrowLeft size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={s.formContainer} keyboardShouldPersistTaps="handled">
                    <Text style={s.brandTag}>{accountType.toUpperCase()} REGISTRATION</Text>
                    <Text style={s.formTitle}>Create your account</Text>

                    {error ? (
                        <View style={s.errorBox}>
                            <Text style={s.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {isBusiness && (
                        <View style={s.inputWrap}>
                            <Store size={18} color={colors.textMuted} style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                placeholder="Business / Shop Name"
                                placeholderTextColor={colors.textMuted}
                                value={form.businessName}
                                onChangeText={(v) => { setForm((f) => ({ ...f, businessName: v })); setError(""); }}
                            />
                        </View>
                    )}

                    <View style={s.inputWrap}>
                        <User size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={s.input}
                            placeholder="Full Name"
                            placeholderTextColor={colors.textMuted}
                            value={form.fullName}
                            onChangeText={(v) => { setForm((f) => ({ ...f, fullName: v })); setError(""); }}
                        />
                    </View>

                    <View style={s.inputWrap}>
                        <Mail size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={s.input}
                            placeholder="Email address"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={form.email}
                            onChangeText={(v) => { setForm((f) => ({ ...f, email: v })); setError(""); }}
                        />
                    </View>

                    <View style={s.inputWrap}>
                        <Phone size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={s.input}
                            placeholder="Phone number (e.g. 0244123456)"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={(v) => { setForm((f) => ({ ...f, phone: v })); setError(""); }}
                        />
                    </View>

                    <View style={s.inputWrap}>
                        <Lock size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={[s.input, { paddingRight: 48 }]}
                            placeholder="Password (min 8 characters)"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            value={form.password}
                            onChangeText={(v) => { setForm((f) => ({ ...f, password: v })); setError(""); }}
                        />
                        <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
                            {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
                        <LinearGradient
                            colors={isBusiness ? ["#9333ea", "#7c3aed"] : ["#3b82f6", "#1d4ed8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.continueBtn}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={s.continueBtnText}>Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.bg },
    backArrow: { position: "absolute", top: 52, left: 18, zIndex: 10, padding: 8 },
    chooseContainer: { paddingTop: 100, paddingHorizontal: spacing.lg, paddingBottom: 40 },
    formContainer: { paddingTop: 100, paddingHorizontal: spacing.lg, paddingBottom: 40 },
    brandTag: { fontSize: 12, fontWeight: "800", color: "#3b82f6", letterSpacing: 2, marginBottom: 8 },
    chooseTitle: { fontSize: 28, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
    chooseSub: { fontSize: 14, color: colors.textSecondary, marginBottom: 28 },
    formTitle: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: 24 },
    typeCard: {
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.08)",
        marginBottom: 18,
        overflow: "hidden",
    },
    typeCardSelected: {
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.06)",
    },
    typeCardSelectedBusiness: {
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.06)",
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 14, padding: spacing.lg },
    cardIconWrap: { width: 50, height: 50, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
    rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    cardTagline: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
    featuresList: { backgroundColor: "rgba(0, 0, 0, 0.25)", paddingHorizontal: spacing.lg, paddingVertical: 12, gap: 8 },
    featureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
    featureText: { fontSize: 13, color: "rgba(255, 255, 255, 0.75)" },
    continueBtn: { borderRadius: radius.md, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    continueBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    loginLink: { fontSize: 14, color: colors.textMuted },
    errorBox: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderRadius: radius.md, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
    errorText: { color: "#f87171", fontSize: 13, fontWeight: "500" },
    inputWrap: { position: "relative", marginBottom: 14 },
    inputIcon: { position: "absolute", left: 16, top: 16, zIndex: 1 },
    input: { backgroundColor: colors.bgInput, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingLeft: 46, paddingRight: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15 },
    eyeBtn: { position: "absolute", right: 16, top: 16 },
});
