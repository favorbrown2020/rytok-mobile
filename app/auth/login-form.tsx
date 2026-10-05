import React, { useState, useRef } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView, Dimensions, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react-native";
import { API_BASE_URL, setAuthToken, setStoredUser } from "../../constants/api";
import * as WebBrowser from "expo-web-browser";
import { signInWithGoogle } from "../../constants/useGoogleAuth";

const C = {
    primary:  "#6366F1", primaryD: "#4F46E5",
    bg:       "#0F0E17", card: "#1C1B29", border: "#2E2D3E",
    inputBg:  "#17162A", textP: "#FFFFFF", textS: "#A0A0B8", textM: "#5C5C7A",
};

export default function LoginFormScreen() {
    const [identifier,    setIdentifier]    = useState("");
    const [password,      setPassword]      = useState("");
    const [showPassword,  setShowPassword]  = useState(false);
    const [loading,       setLoading]       = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error,         setError]         = useState("");
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();

    const handleLogin = async () => {
        if (!identifier.trim() || !password) { setError("Please enter your email and password."); shake(); return; }
        setLoading(true); setError("");
        try {
            const res  = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: identifier.trim(), password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Login failed."); shake(); return; }
            if (data.token) await setAuthToken(data.token);
            if (data.user)  await setStoredUser(data.user);
            router.replace("/(tabs)" as any);
        } catch { setError("Could not connect. Check your connection."); shake(); }
        finally { setLoading(false); }
    };

    const handleGoogle = () => signInWithGoogle(setError, setGoogleLoading);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top", "bottom"]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Back */}
                    <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <ArrowLeft size={20} color={C.textS} />
                    </TouchableOpacity>

                    {/* Heading */}
                    <View style={s.heading}>
                        <Text style={s.title}>Welcome back</Text>
                        <Text style={s.sub}>Sign in to your Rytok account</Text>
                    </View>

                    {/* Google */}
                    <TouchableOpacity style={s.googleBtn} onPress={handleGoogle} disabled={googleLoading} activeOpacity={0.88}>
                        {googleLoading
                            ? <ActivityIndicator color={C.textP} size="small" />
                            : <><Text style={s.googleG}>G</Text><Text style={s.googleTxt}>Continue with Google</Text></>
                        }
                    </TouchableOpacity>

                    <View style={s.divider}>
                        <View style={s.divLine} /><Text style={s.divTxt}>or continue with email</Text><View style={s.divLine} />
                    </View>

                    {/* Form */}
                    <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>
                        {!!error && <View style={s.errBox}><Text style={s.errTxt}>{error}</Text></View>}

                        <View style={s.field}>
                            <Text style={s.label}>Email or Phone</Text>
                            <View style={s.row}>
                                <Mail size={16} color={C.textM} style={{ marginRight: 10 }} />
                                <TextInput style={s.input} value={identifier} onChangeText={setIdentifier}
                                    placeholder="your@email.com" placeholderTextColor={C.textM}
                                    autoCapitalize="none" keyboardType="email-address" returnKeyType="next" />
                            </View>
                        </View>

                        <View style={s.field}>
                            <Text style={s.label}>Password</Text>
                            <View style={s.row}>
                                <Lock size={16} color={C.textM} style={{ marginRight: 10 }} />
                                <TextInput style={[s.input, { flex: 1 }]} value={password} onChangeText={setPassword}
                                    placeholder="Enter your password" placeholderTextColor={C.textM}
                                    secureTextEntry={!showPassword} returnKeyType="done" onSubmitEditing={handleLogin} />
                                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    {showPassword ? <EyeOff size={18} color={C.textM} /> : <Eye size={18} color={C.textM} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={s.forgot} onPress={() => router.push("/auth/forgot-password" as any)}>
                            <Text style={s.forgotTxt}>Forgot password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.88}>
                            <LinearGradient colors={["#6366F1","#4F46E5"]} style={s.btn} start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
                                {loading ? <ActivityIndicator color="#fff" />
                                    : <><Text style={s.btnTxt}>Sign In</Text><ArrowRight size={18} color="#fff" /></>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={s.footer}>
                        <Text style={s.footTxt}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/auth/register" as any)}>
                            <Text style={s.footLink}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={s.trust}><ShieldCheck size={11} color={C.textM} /><Text style={s.trustTxt}>Secured with end-to-end encryption</Text></View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    scroll:    { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
    backBtn:   { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1C1B29", alignItems: "center", justifyContent: "center", marginTop: 12, borderWidth: 1, borderColor: "#2E2D3E" },
    heading:   { marginTop: 24, marginBottom: 24, gap: 6 },
    title:     { fontSize: 28, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
    sub:       { fontSize: 14, color: "#A0A0B8" },
    googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 14, paddingVertical: 15, backgroundColor: "#1C1B29", borderWidth: 1, borderColor: "#2E2D3E" },
    googleG:   { fontSize: 18, fontWeight: "900", color: "#4285F4" },
    googleTxt: { fontSize: 15, fontWeight: "700", color: "#fff" },
    divider:   { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 16 },
    divLine:   { flex: 1, height: 1, backgroundColor: "#2E2D3E" },
    divTxt:    { fontSize: 12, color: "#5C5C7A", fontWeight: "600" },
    card:      { gap: 14 },
    errBox:    { backgroundColor: "#2D1515", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#5C2020" },
    errTxt:    { fontSize: 13, color: "#FF8080", fontWeight: "600", textAlign: "center" },
    field:     { gap: 8 },
    label:     { fontSize: 13, fontWeight: "700", color: "#A0A0B8" },
    row:       { flexDirection: "row", alignItems: "center", backgroundColor: "#17162A", borderRadius: 12, borderWidth: 1, borderColor: "#2E2D3E", paddingHorizontal: 14, paddingVertical: 13 },
    input:     { flex: 1, fontSize: 15, color: "#fff", padding: 0 },
    forgot:    { alignItems: "flex-end" },
    forgotTxt: { fontSize: 13, color: "#6366F1", fontWeight: "600" },
    btn:       { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    btnTxt:    { fontSize: 16, fontWeight: "800", color: "#fff" },
    footer:    { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 28 },
    footTxt:   { fontSize: 14, color: "#A0A0B8" },
    footLink:  { fontSize: 14, color: "#6366F1", fontWeight: "800" },
    trust:     { flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", marginTop: 14 },
    trustTxt:  { fontSize: 11, color: "#5C5C7A" },
});
