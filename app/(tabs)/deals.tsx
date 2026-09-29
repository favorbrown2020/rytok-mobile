import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, fontSize } from "@/constants/theme";

export default function DealsScreen() {
    return (
        <SafeAreaView style={s.page}>
            <View style={s.center}>
                <Text style={s.emoji}>🔥</Text>
                <Text style={s.title}>Hot Deals</Text>
                <Text style={s.sub}>Live deals will appear here once connected to your API</Text>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page:  { flex: 1, backgroundColor: colors.bg },
    center:{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
    emoji: { fontSize: 48, marginBottom: 16 },
    title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
    sub:   { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
});
