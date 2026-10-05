import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    ShieldCheck, Phone, CheckCircle2, ArrowLeft,
    Sparkles, AlertCircle, Check, BadgeCheck,
} from "lucide-react-native";
import { apiFetch, getStoredUser, setStoredUser } from "../../constants/api";

const C = {
    primary:   "#6366F1",
    primaryL:  "#EEF2FF",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    red:       "#EF4444",
    redL:      "#FEE2E2",
    amber:     "#F59E0B",
    amberL:    "#FEF3C7",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

export default function PhoneVerificationScreen() {
    const [phone, setPhone] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [verifiedPhone, setVerifiedPhone] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const cached = await getStoredUser();
                if (cached) {
                    if (cached.phone) setPhone(cached.phone);
                    if (cached.phone_verified || cached.is_verified) {
                        setIsVerified(true);
                        setVerifiedPhone(cached.phone || "");
                    }
                }

                const res = await apiFetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    const u = data.user;
                    if (u) {
                        if (u.phone) setPhone(u.phone);
                        if (u.phone_verified || u.is_verified) {
                            setIsVerified(true);
                            setVerifiedPhone(u.phone || "");
                        }
                        await setStoredUser(u);
                    }
                }
            } catch {} finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleVerify = async () => {
        setErrorMsg("");
        setSuccessMsg("");

        const cleanPhone = phone.trim().replace(/\s+/g, "");
        if (cleanPhone.length < 8) {
            setErrorMsg("Please enter a valid phone number (e.g. +233 50 123 4567)");
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiFetch("/api/auth/verify-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone }),
            });

            const data = await res.json();
            if (res.ok) {
                setIsVerified(true);
                setVerifiedPhone(cleanPhone);
                setSuccessMsg("Phone number verified successfully! Verified Seller badge activated.");
                const cached = await getStoredUser();
                if (cached) {
                    await setStoredUser({ ...cached, phone: cleanPhone, phone_verified: true, is_verified: true });
                }
            } else {
                setErrorMsg(data.error || "Verification failed. Please check your number.");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Phone & Identity</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            {loading ? (
                <View style={s.centerBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.loadingTxt}>Checking verification status...</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1, backgroundColor: C.bg }}
                    contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 16 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Status Card */}
                    <View style={s.statusCard}>
                        <View style={[s.badgeCircle, { backgroundColor: isVerified ? C.greenL : C.amberL }]}>
                            {isVerified ? (
                                <BadgeCheck size={36} color={C.green} />
                            ) : (
                                <ShieldCheck size={36} color={C.amber} />
                            )}
                        </View>
                        <Text style={s.statusTitle}>
                            {isVerified ? "Verified Member" : "Verification Pending"}
                        </Text>
                        <Text style={s.statusSub}>
                            {isVerified
                                ? "Your phone number is verified. You have earned the Verified badge on all your listings."
                                : "Verify your phone number to earn the trust badge and unlock instant buyer inquiries."}
                        </Text>
                    </View>

                    {/* Messages */}
                    {Boolean(errorMsg) && (
                        <View style={s.errorBox}>
                            <AlertCircle size={16} color={C.red} />
                            <Text style={s.errorTxt}>{errorMsg}</Text>
                        </View>
                    )}
                    {Boolean(successMsg) && (
                        <View style={s.successBox}>
                            <Check size={16} color={C.green} />
                            <Text style={s.successTxt}>{successMsg}</Text>
                        </View>
                    )}

                    {/* Form Card */}
                    <View style={s.card}>
                        <Text style={s.cardHeading}>Phone Number Details</Text>

                        {isVerified ? (
                            <View style={s.verifiedRow}>
                                <View style={s.verifiedIcon}>
                                    <Phone size={18} color={C.green} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.verifiedLabel}>Verified Number</Text>
                                    <Text style={s.verifiedNumber}>{verifiedPhone || phone}</Text>
                                </View>
                                <View style={s.verifiedPill}>
                                    <CheckCircle2 size={12} color={C.green} />
                                    <Text style={s.verifiedPillTxt}>Active</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={{ gap: 12 }}>
                                <View style={s.fieldWrap}>
                                    <Text style={s.label}>Mobile Phone Number</Text>
                                    <View style={s.inputRow}>
                                        <Phone size={18} color={C.textM} style={{ marginRight: 10 }} />
                                        <TextInput
                                            style={s.input}
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                            placeholder="+233 50 123 4567"
                                            placeholderTextColor={C.textM}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[s.verifyBtn, submitting && s.btnDisabled]}
                                    onPress={handleVerify}
                                    disabled={submitting}
                                    activeOpacity={0.88}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <ShieldCheck size={18} color="#fff" />
                                            <Text style={s.verifyBtnTxt}>Verify Phone Number</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Trust Perks Card */}
                    <View style={s.perksCard}>
                        <Text style={s.perksTitle}>Verified Member Benefits</Text>
                        {[
                            { title: "Verified Seller Badge", desc: "Gain instant credibility and buyer confidence on all your posts." },
                            { title: "Priority Search Placement", desc: "Listings from verified sellers are prioritized in search results." },
                            { title: "Ryte Rewards Bonus", desc: "Receive complimentary bonus points deposited to your wallet." },
                        ].map((p, i) => (
                            <View key={i} style={s.perkRow}>
                                <View style={s.checkDot}>
                                    <Check size={12} color={C.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.perkHeading}>{p.title}</Text>
                                    <Text style={s.perkDesc}>{p.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    centerBox:   { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: C.bg },
    loadingTxt:  { fontSize: 14, color: C.textS },
    statusCard:  { backgroundColor: C.surface, borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1, borderColor: C.border },
    badgeCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    statusTitle: { fontSize: 18, fontWeight: "800", color: C.textP },
    statusSub:   { fontSize: 13, color: C.textS, textAlign: "center", marginTop: 6, lineHeight: 19 },
    errorBox:    { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.redL, borderRadius: 12, padding: 12 },
    errorTxt:    { fontSize: 13, color: C.red, fontWeight: "600", flex: 1 },
    successBox:  { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.greenL, borderRadius: 12, padding: 12 },
    successTxt:  { fontSize: 13, color: C.green, fontWeight: "600", flex: 1 },
    card:        { backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, gap: 12 },
    cardHeading: { fontSize: 15, fontWeight: "800", color: C.textP },
    fieldWrap:   { gap: 6 },
    label:       { fontSize: 12, fontWeight: "700", color: C.textS, textTransform: "uppercase" },
    inputRow:    { flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
    input:       { flex: 1, height: 48, fontSize: 15, color: C.textP, fontWeight: "500" },
    verifyBtn:   { backgroundColor: C.primary, height: 48, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
    verifyBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
    btnDisabled: { opacity: 0.7 },
    verifiedRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
    verifiedIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.greenL, alignItems: "center", justifyContent: "center" },
    verifiedLabel: { fontSize: 12, color: C.textS },
    verifiedNumber: { fontSize: 16, fontWeight: "800", color: C.textP, marginTop: 2 },
    verifiedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.greenL, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    verifiedPillTxt: { fontSize: 11, fontWeight: "800", color: C.green },
    perksCard:   { backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, gap: 14 },
    perksTitle:  { fontSize: 15, fontWeight: "800", color: C.textP },
    perkRow:     { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    checkDot:    { width: 22, height: 22, borderRadius: 11, backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center", marginTop: 2 },
    perkHeading: { fontSize: 14, fontWeight: "700", color: C.textP },
    perkDesc:    { fontSize: 12, color: C.textS, marginTop: 2, lineHeight: 16 },
});
