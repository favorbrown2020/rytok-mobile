import React from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ImageBackground, Dimensions, StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width: W, height: H } = Dimensions.get("window");

const HERO = require("../../assets/images/auth_hero.jpg");

export default function LoginSplashScreen() {
    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Full-screen hero image ───────────────────────── */}
            <ImageBackground source={HERO} style={s.bg} resizeMode="cover">

                {/* Dark gradient overlay — darker at bottom for text legibility */}
                <LinearGradient
                    colors={[
                        "rgba(0,0,0,0.05)",
                        "rgba(0,0,0,0.15)",
                        "rgba(15,14,23,0.72)",
                        "rgba(15,14,23,0.95)",
                        "#0F0E17",
                    ]}
                    locations={[0, 0.3, 0.55, 0.78, 1]}
                    style={s.overlay}
                >
                    <SafeAreaView style={s.safe}>
                        {/* ── Bottom content ─────────────────────── */}
                        <View style={s.bottom}>
                            {/* Brand text */}
                            <Text style={s.brand}>Rytok.</Text>
                            <Text style={s.tagline}>Find what you need,{"\n"}wherever you are</Text>

                            {/* Buttons */}
                            <View style={s.btnGroup}>
                                <TouchableOpacity
                                    style={s.signupBtn}
                                    onPress={() => router.push("/auth/register" as any)}
                                    activeOpacity={0.88}
                                >
                                    <LinearGradient
                                        colors={["#7C6FEB", "#6366F1", "#4F46E5"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={s.signupGrad}
                                    >
                                        <Text style={s.signupTxt}>Sign up</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={s.loginBtn}
                                    onPress={() => router.push("/auth/login-form" as any)}
                                    activeOpacity={0.88}
                                >
                                    <Text style={s.loginTxt}>Log in</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={s.terms}>
                                By continuing you agree to our{" "}
                                <Text style={s.termsLink}>Terms</Text>
                                {" "}and{" "}
                                <Text style={s.termsLink}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const s = StyleSheet.create({
    bg:      { flex: 1, width: W, height: H },
    overlay: { flex: 1 },
    safe:    { flex: 1, justifyContent: "flex-end" },
    bottom:  { paddingHorizontal: 24, paddingBottom: 36, gap: 14 },
    /* Brand */
    brand:   { fontSize: 48, fontWeight: "900", color: "#7C6FEB", letterSpacing: -1 },
    tagline: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", lineHeight: 30 },
    /* Buttons */
    btnGroup:   { gap: 12, marginTop: 6 },
    signupBtn:  { borderRadius: 14, overflow: "hidden" },
    signupGrad: { paddingVertical: 17, alignItems: "center" },
    signupTxt:  { fontSize: 17, fontWeight: "800", color: "#fff" },
    loginBtn:   { borderRadius: 14, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)", paddingVertical: 16, alignItems: "center", backgroundColor: "rgba(255,255,255,0.07)" },
    loginTxt:   { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
    /* Terms */
    terms:     { fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 17 },
    termsLink: { color: "rgba(255,255,255,0.7)", textDecorationLine: "underline" },
});
