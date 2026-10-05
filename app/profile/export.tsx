import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    DownloadCloud, FileText, CheckCircle2, ArrowLeft,
    Shield, Mail, Package, MessageSquare, Wallet, Check,
} from "lucide-react-native";
import { getStoredUser } from "../../constants/api";

const C = {
    primary:   "#6366F1",
    primaryD:  "#4F46E5",
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

export default function ExportDataScreen() {
    const [userEmail, setUserEmail] = useState("");
    const [requesting, setRequesting] = useState(false);
    const [requested, setRequested] = useState(false);

    useEffect(() => {
        (async () => {
            const user = await getStoredUser();
            if (user?.email) setUserEmail(user.email);
        })();
    }, []);

    const handleRequestExport = () => {
        setRequesting(true);
        setTimeout(() => {
            setRequesting(false);
            setRequested(true);
            Alert.alert(
                "Export Request Received",
                `We are compiling your marketplace archive. A secure download link will be emailed to ${userEmail || "your registered email"} within 24 hours.`
            );
        }, 1200);
    };

    const dataItems = [
        {
            title: "Profile & Identity Records",
            desc: "Full name, email, phone number, bio, trust level, and verification logs.",
            icon: FileText,
        },
        {
            title: "Listings & Product History",
            desc: "All active, sold, and archived listings including descriptions, images, and prices.",
            icon: Package,
        },
        {
            title: "Message & Chat Transcripts",
            desc: "Record of buyer and seller conversations and inquiries.",
            icon: MessageSquare,
        },
        {
            title: "Wallet & Transaction Records",
            desc: "History of payments, top-ups, payouts, and Ryte reward transactions.",
            icon: Wallet,
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Export My Data</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: C.bg }}
                contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Header Card */}
                <View style={s.heroCard}>
                    <View style={s.heroIconWrap}>
                        <DownloadCloud size={28} color={C.primary} />
                    </View>
                    <Text style={s.heroTitle}>Download Your Data Archive</Text>
                    <Text style={s.heroSub}>
                        In accordance with privacy and GDPR compliance, you can download a complete JSON archive of all your personal and marketplace data.
                    </Text>
                </View>

                {/* What's Included */}
                <View style={s.card}>
                    <Text style={s.cardHeading}>What is included in the export:</Text>
                    {dataItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <View key={i} style={s.itemRow}>
                                <View style={s.itemIcon}>
                                    <Icon size={18} color={C.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.itemTitle}>{item.title}</Text>
                                    <Text style={s.itemDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Email Confirmation Card */}
                <View style={s.emailCard}>
                    <Mail size={18} color={C.textS} />
                    <View style={{ flex: 1 }}>
                        <Text style={s.emailLabel}>Archive Delivery Address</Text>
                        <Text style={s.emailVal}>{userEmail || "Registered Account Email"}</Text>
                    </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={[s.requestBtn, (requesting || requested) && s.btnDisabled]}
                    onPress={handleRequestExport}
                    disabled={requesting || requested}
                    activeOpacity={0.88}
                >
                    {requesting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : requested ? (
                        <>
                            <Check size={18} color="#fff" />
                            <Text style={s.requestBtnTxt}>Export Requested</Text>
                        </>
                    ) : (
                        <>
                            <DownloadCloud size={18} color="#fff" />
                            <Text style={s.requestBtnTxt}>Request Data Archive</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    heroCard:    { backgroundColor: C.surface, borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1, borderColor: C.border },
    heroIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    heroTitle:   { fontSize: 18, fontWeight: "800", color: C.textP, textAlign: "center" },
    heroSub:     { fontSize: 13, color: C.textS, textAlign: "center", marginTop: 6, lineHeight: 19 },
    card:        { backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, gap: 16 },
    cardHeading: { fontSize: 15, fontWeight: "800", color: C.textP },
    itemRow:     { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    itemIcon:    { width: 38, height: 38, borderRadius: 12, backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center", marginTop: 2 },
    itemTitle:   { fontSize: 14, fontWeight: "700", color: C.textP },
    itemDesc:    { fontSize: 12, color: C.textS, marginTop: 2, lineHeight: 17 },
    emailCard:   { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F1F5F9", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
    emailLabel:  { fontSize: 11, color: C.textS, fontWeight: "600" },
    emailVal:    { fontSize: 14, fontWeight: "700", color: C.textP, marginTop: 2 },
    requestBtn:  { backgroundColor: C.primary, height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    requestBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
    btnDisabled: { opacity: 0.7 },
});
