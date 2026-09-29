import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import { API_BASE_URL } from "../../constants/api";

export default function LoginScreen() {
    const [form, setForm]             = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");

    const handleLogin = async () => {
        setLoading(true); setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Login failed"); return; }
            router.replace("/(tabs)");
        } catch { setError("Network error. Please try again."); }
        finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={s.page}>
            <TouchableOpacity style={s.backArrow} onPress={() => router.back()}>
                <ArrowLeft size={22} color="rgba(255,255,255,0.65)" />
            </TouchableOpacity>
            <View style={s.container}>
                <Text style={s.title}>Welcome back</Text>
                <Text style={s.sub}>Sign in to your Rytok account</Text>

                {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

                <TextInput style={s.input} placeholder="Email address" placeholderTextColor={colors.textMuted}
                    keyboardType="email-address" autoCapitalize="none"
                    value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} />

                <View>
                    <TextInput style={s.input} placeholder="Password" placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} />
                    <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(p => !p)}>
                        {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={["#4f6af5", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.loginBtn}>
                        <Text style={s.loginBtnText}>{loading ? "Signing in…" : "Sign In"}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/auth/register")}>
                    <Text style={s.registerLink}>
                        New to Rytok? <Text style={{ color: "#4f6af5" }}>Create account</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page:        { flex: 1, backgroundColor: colors.bg },
    backArrow:   { position: "absolute", top: 52, left: 18, zIndex: 10, padding: 8 },
    container:   { flex: 1, paddingTop: 110, paddingHorizontal: spacing.md },
    title:       { fontSize: fontSize.xxl, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
    sub:         { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 32 },
    errorBox:    { backgroundColor: "rgba(255,71,87,0.15)", borderRadius: radius.md, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,71,87,0.3)" },
    errorText:   { color: colors.danger, fontSize: 13 },
    input:       { backgroundColor: colors.bgInput, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15, marginBottom: 14 },
    eyeBtn:      { position: "absolute", right: 16, top: 16 },
    loginBtn:    { borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginBottom: 18, marginTop: 8 },
    loginBtnText:{ fontSize: 16, fontWeight: "700", color: "#fff" },
    registerLink:{ textAlign: "center", fontSize: 13, color: colors.textMuted },
});
