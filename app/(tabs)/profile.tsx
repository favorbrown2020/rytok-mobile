import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, spacing, fontSize, radius } from "../../constants/theme";

export default function ProfileScreen() {
    return (
        <SafeAreaView style={s.page}>
            <View style={s.center}>
                <Text style={s.emoji}>??</Text>
                <Text style={s.title}>My Account</Text>
                <TouchableOpacity style={s.btn} onPress={() => router.push("/auth/register")}>
                    <Text style={s.btnText}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnOutline} onPress={() => router.push("/auth/login")}>
                    <Text style={s.btnOutlineText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page:         { flex: 1, backgroundColor: colors.bg },
    center:       { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
    emoji:        { fontSize: 48, marginBottom: 16 },
    title:        { fontSize: fontSize.xl, fontWeight: "800", color: colors.textPrimary, marginBottom: 28 },
    btn:          { width: "100%", backgroundColor: colors.personal.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
    btnText:      { color: "#fff", fontWeight: "700", fontSize: fontSize.md },
    btnOutline:   { width: "100%", borderRadius: radius.md, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: colors.border },
    btnOutlineText:{ color: colors.textSecondary, fontWeight: "600", fontSize: fontSize.md },
});
