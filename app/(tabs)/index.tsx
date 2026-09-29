import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Bell, ShoppingBag } from "lucide-react-native";
import { router } from "expo-router";
import { colors, spacing, radius, fontSize } from "@/constants/theme";

export default function HomeScreen() {
    return (
        <SafeAreaView style={s.page}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={s.header}>
                    <View style={s.logoRow}>
                        <ShoppingBag size={24} color={colors.personal.accent} />
                        <Text style={s.logoText}>rytok</Text>
                    </View>
                    <TouchableOpacity style={s.notifBtn}>
                        <Bell size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Hero text */}
                <View style={s.hero}>
                    <Text style={s.heroTitle}>Buy, sell & discover</Text>
                    <Text style={s.heroAccent}>amazing deals.</Text>
                    <Text style={s.heroSub}>Millions of items across all categories</Text>
                </View>

                {/* Search bar */}
                <View style={s.searchBar}>
                    <Search size={17} color={colors.textMuted} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search listings, deals, shops..."
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                {/* Quick actions */}
                <View style={s.quickActions}>
                    {[
                        { label: "Hot Deals 🔥", route: "/deals" },
                        { label: "Sell Item", route: "/sell" },
                    ].map((a) => (
                        <TouchableOpacity
                            key={a.label}
                            style={s.quickBtn}
                            onPress={() => router.push(a.route as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={s.quickBtnText}>{a.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Placeholder listings coming soon */}
                <View style={s.comingSoon}>
                    <Text style={s.comingSoonText}>🚀 Listings loading soon...</Text>
                    <Text style={s.comingSoonSub}>Connect to your API to show live listings</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page:          { flex: 1, backgroundColor: colors.bg },
    header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
    logoRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
    logoText:      { fontSize: 22, fontWeight: "900", color: colors.textPrimary, letterSpacing: -0.5 },
    notifBtn:      { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.bgInput, alignItems: "center", justifyContent: "center" },
    hero:          { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
    heroTitle:     { fontSize: fontSize.xxl, fontWeight: "800", color: colors.textPrimary },
    heroAccent:    { fontSize: fontSize.xxl, fontWeight: "800", color: colors.personal.accent, marginBottom: 8 },
    heroSub:       { fontSize: fontSize.sm, color: colors.textSecondary },
    searchBar:     { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: spacing.md, backgroundColor: colors.bgInput, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
    searchInput:   { flex: 1, color: colors.textPrimary, fontSize: fontSize.md },
    quickActions:  { flexDirection: "row", gap: 12, paddingHorizontal: spacing.md, marginBottom: spacing.xl },
    quickBtn:      { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border },
    quickBtnText:  { color: colors.textPrimary, fontWeight: "700", fontSize: fontSize.sm },
    comingSoon:    { margin: spacing.md, padding: spacing.xl, backgroundColor: colors.bgCard, borderRadius: radius.lg, alignItems: "center", borderWidth: 1, borderColor: colors.border },
    comingSoonText:{ fontSize: fontSize.lg, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
    comingSoonSub: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
});
