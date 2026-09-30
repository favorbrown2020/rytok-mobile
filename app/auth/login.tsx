import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import { API_BASE_URL, setAuthToken, setStoredUser } from "../../constants/api";

export default function LoginScreen() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword]     = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");

    const handleLogin = async () => {
        if (!identifier.trim() || !password) {
            setError("Please enter your email or phone and password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: identifier.trim(),
                    password: password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed. Please check your credentials.");
                return;
            }

            if (data.token) {
                await setAuthToken(data.token);
            }
            if (data.user) {
                await setStoredUser(data.user);
            }

            router.replace("/(tabs)/profile");
        } catch (err: any) {
            setError("Could not connect to server. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.page}>
            <TouchableOpacity style={s.backArrow} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ArrowLeft size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
                    <View style={s.header}>
                        <Text style={s.brandTag}>RYTOK</Text>
                        <Text style={s.title}>Welcome back</Text>
                        <Text style={s.sub}>Sign in to your Rytok account to manage listings and wallet</Text>
                    </View>

                    {error ? (
                        <View style={s.errorBox}>
                            <Text style={s.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={s.inputWrap}>
                        <Mail size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={s.input}
                            placeholder="Email address or Phone"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={identifier}
                            onChangeText={(v) => { setIdentifier(v); setError(""); }}
                        />
                    </View>

                    <View style={s.inputWrap}>
                        <Lock size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={[s.input, { paddingRight: 48 }]}
                            placeholder="Password"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(v) => { setPassword(v); setError(""); }}
                        />
                        <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
                            {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
                        <LinearGradient colors={["#3b82f6", "#1d4ed8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.loginBtn}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={s.loginBtnText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push("/auth/register")} style={s.registerLinkWrap}>
                        <Text style={s.registerLink}>
                            Don't have an account? <Text style={{ color: "#3b82f6", fontWeight: "700" }}>Create one</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.bg },
    backArrow: { position: "absolute", top: 52, left: 18, zIndex: 10, padding: 8 },
    container: { flexGrow: 1, paddingTop: 100, paddingHorizontal: spacing.lg, paddingBottom: 40 },
    header: { marginBottom: 28 },
    brandTag: { fontSize: 12, fontWeight: "800", color: "#3b82f6", letterSpacing: 2, marginBottom: 8 },
    title: { fontSize: 28, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
    sub: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    errorBox: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderRadius: radius.md, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
    errorText: { color: "#f87171", fontSize: 13, fontWeight: "500" },
    inputWrap: { position: "relative", marginBottom: 14 },
    inputIcon: { position: "absolute", left: 16, top: 16, zIndex: 1 },
    input: { backgroundColor: colors.bgInput, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingLeft: 46, paddingRight: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15 },
    eyeBtn: { position: "absolute", right: 16, top: 16 },
    loginBtn: { borderRadius: radius.md, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    loginBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    registerLinkWrap: { paddingVertical: 12, alignItems: "center" },
    registerLink: { fontSize: 14, color: colors.textMuted },
});
