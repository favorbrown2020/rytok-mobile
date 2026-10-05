import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Store, ExternalLink, ChevronRight, ShoppingBag } from "lucide-react-native";
import { router } from "expo-router";

const C = {
    primary: "#6366F1", primaryD: "#4F46E5", primaryL: "#eef2ff",
    bg: "#F8F9FA", surface: "#ffffff", border: "#E5E7EB",
    textP: "#111827", textS: "#6B7280", textM: "#9CA3AF",
};

export default function ShopScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                    <Text style={s.headerTitle}>Shop</Text>
                </LinearGradient>

                {/* Hero */}
                <LinearGradient colors={["#4F46E5", "#6366F1"]} style={s.hero}>
                    <View style={s.heroIcon}>
                        <Store size={40} color="#fff" />
                    </View>
                    <Text style={s.heroTitle}>Rytok Shops</Text>
                    <Text style={s.heroSub}>Browse verified seller shops and find great deals from trusted businesses</Text>
                </LinearGradient>

                {/* CTA cards */}
                <View style={s.cardsWrap}>
                    <TouchableOpacity style={s.card} onPress={() => router.push("/shops" as any)} activeOpacity={0.85}>
                        <View style={[s.cardIcon, { backgroundColor: "#eef2ff" }]}>
                            <ShoppingBag size={24} color={C.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>Browse Shops</Text>
                            <Text style={s.cardSub}>Discover verified seller shops</Text>
                        </View>
                        <ChevronRight size={18} color={C.textM} />
                    </TouchableOpacity>

                    <TouchableOpacity style={s.card} onPress={() => router.push("/shop/create" as any)} activeOpacity={0.85}>
                        <View style={[s.cardIcon, { backgroundColor: "#d1fae5" }]}>
                            <Store size={24} color="#10B981" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>Open Your Shop</Text>
                            <Text style={s.cardSub}>Start selling with a dedicated shop page</Text>
                        </View>
                        <ChevronRight size={18} color={C.textM} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
    hero:      { padding: 32, alignItems: "center", gap: 12 },
    heroIcon:  { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    heroTitle: { fontSize: 24, fontWeight: "900", color: "#fff" },
    heroSub:   { fontSize: 13, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 20 },
    cardsWrap: { padding: 16, gap: 12 },
    card:      { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
    cardIcon:  { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    cardTitle: { fontSize: 15, fontWeight: "700", color: C.textP },
    cardSub:   { fontSize: 12, color: C.textS, marginTop: 2 },
});
