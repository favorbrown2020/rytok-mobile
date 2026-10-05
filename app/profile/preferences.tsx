import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Languages, Coins, Check, ArrowLeft, Globe,
} from "lucide-react-native";
import { apiFetch, getStoredUser, setStoredUser } from "../../constants/api";

const C = {
    primary:   "#6366F1",
    primaryL:  "#EEF2FF",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

const LANGUAGES = [
    { code: "en", name: "English", local: "English (US/UK)" },
    { code: "fr", name: "Français", local: "French" },
    { code: "tw", name: "Twi", local: "Akan / Ghana" },
    { code: "ha", name: "Hausa", local: "Hausa" },
    { code: "sw", name: "Kiswahili", local: "Swahili" },
];

const CURRENCIES = [
    { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", country: "Ghana" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "Nigeria" },
    { code: "USD", symbol: "$", name: "US Dollar", country: "International" },
    { code: "AED", symbol: "AED", name: "UAE Dirham", country: "United Arab Emirates" },
];

export default function PreferencesScreen() {
    const [selectedLang, setSelectedLang] = useState("en");
    const [selectedCurrency, setSelectedCurrency] = useState("GHS");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const user = await getStoredUser();
            if (user?.country_code === "ng") {
                setSelectedCurrency("NGN");
            } else if (user?.country_code === "ae") {
                setSelectedCurrency("AED");
            } else {
                setSelectedCurrency("GHS");
            }
        })();
    }, []);

    const handleSelectCurrency = async (curr: string) => {
        setSelectedCurrency(curr);
        setSaving(true);
        try {
            const country = curr === "NGN" ? "ng" : curr === "AED" ? "ae" : "gh";
            const res = await apiFetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country_code: country }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) await setStoredUser(data.user);
            }
        } catch {} finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Language & Currency</Text>
                <View style={{ width: 36, alignItems: "center" }}>
                    {saving && <ActivityIndicator size="small" color="#fff" />}
                </View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: C.bg }}
                contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Currency Section */}
                <View style={{ gap: 8 }}>
                    <Text style={s.groupHeader}>DEFAULT MARKETPLACE CURRENCY</Text>
                    <View style={s.card}>
                        {CURRENCIES.map((c, i) => {
                            const isSelected = selectedCurrency === c.code;
                            const isLast = i === CURRENCIES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                    onPress={() => handleSelectCurrency(c.code)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[s.currCircle, isSelected && { backgroundColor: C.primaryL }]}>
                                        <Text style={[s.currSymbol, isSelected && { color: C.primary }]}>{c.symbol}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.rowLabel}>{c.name} ({c.code})</Text>
                                        <Text style={s.rowSub}>{c.country}</Text>
                                    </View>
                                    {isSelected && (
                                        <View style={s.checkWrap}>
                                            <Check size={16} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Language Section */}
                <View style={{ gap: 8 }}>
                    <Text style={s.groupHeader}>DISPLAY LANGUAGE</Text>
                    <View style={s.card}>
                        {LANGUAGES.map((l, i) => {
                            const isSelected = selectedLang === l.code;
                            const isLast = i === LANGUAGES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={l.code}
                                    style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                                    onPress={() => setSelectedLang(l.code)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[s.currCircle, isSelected && { backgroundColor: C.primaryL }]}>
                                        <Languages size={18} color={isSelected ? C.primary : C.textS} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.rowLabel}>{l.name}</Text>
                                        <Text style={s.rowSub}>{l.local}</Text>
                                    </View>
                                    {isSelected && (
                                        <View style={s.checkWrap}>
                                            <Check size={16} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    groupHeader: { fontSize: 12, fontWeight: "800", color: C.textS, letterSpacing: 0.8, paddingHorizontal: 4 },
    card:        { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
    row:         { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
    currCircle:  { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    currSymbol:  { fontSize: 16, fontWeight: "900", color: C.textP },
    rowLabel:    { fontSize: 15, fontWeight: "700", color: C.textP },
    rowSub:      { fontSize: 12, color: C.textS, marginTop: 2 },
    checkWrap:   { width: 26, height: 26, borderRadius: 13, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
});
