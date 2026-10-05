import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    Shield, Lock, Eye, EyeOff, AlertTriangle, Check,
    AlertCircle, ArrowLeft, KeyRound, Smartphone, Trash2,
} from "lucide-react-native";
import { apiFetch, getStoredUser, clearAuth } from "../../constants/api";

const C = {
    primary:   "#6366F1",
    primaryD:  "#4F46E5",
    primaryL:  "#EEF2FF",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    amber:     "#F59E0B",
    amberL:    "#FEF3C7",
    red:       "#EF4444",
    redL:      "#FEE2E2",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

export default function SecurityScreen() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [twoFactor, setTwoFactor] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [updating2FA, setUpdating2FA] = useState(false);

    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    const sec = data?.user?.metadata?.security || {};
                    setTwoFactor(Boolean(sec.twoFactor));
                }
            } catch {} finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleChangePassword = async () => {
        setPwError("");
        setPwSuccess("");

        if (!currentPassword) {
            setPwError("Please enter your current password.");
            return;
        }
        if (newPassword.length < 6) {
            setPwError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError("New passwords do not match.");
            return;
        }

        setUpdatingPassword(true);
        try {
            const res = await apiFetch("/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setPwSuccess("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPwError(data.error || "Failed to update password.");
            }
        } catch {
            setPwError("Network error. Please try again.");
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleToggle2FA = async (val: boolean) => {
        setTwoFactor(val);
        setUpdating2FA(true);
        try {
            await apiFetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    securitySettings: { twoFactor: val },
                }),
            });
        } catch {
            setTwoFactor(!val);
            Alert.alert("Error", "Could not update 2FA setting.");
        } finally {
            setUpdating2FA(false);
        }
    };

    const handleDeactivate = () => {
        Alert.alert(
            "Deactivate Account",
            "Are you sure you want to deactivate your account? Your listings will be hidden, and you will be logged out.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Deactivate",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await apiFetch("/api/auth/account", { method: "PATCH" });
                            if (res.ok) {
                                await clearAuth();
                                router.replace("/auth/login" as any);
                            } else {
                                Alert.alert("Error", "Could not deactivate account.");
                            }
                        } catch {
                            Alert.alert("Error", "Server error. Please try again.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Password & Security</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: C.bg }}
                contentContainerStyle={{ padding: 18, paddingBottom: 48, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Change Password Card */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <View style={[s.iconCircle, { backgroundColor: C.primaryL }]}>
                            <KeyRound size={20} color={C.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>Change Password</Text>
                            <Text style={s.cardSub}>Update your password regularly for better security</Text>
                        </View>
                    </View>

                    {Boolean(pwError) && (
                        <View style={s.errorBox}>
                            <AlertCircle size={16} color={C.red} />
                            <Text style={s.errorTxt}>{pwError}</Text>
                        </View>
                    )}
                    {Boolean(pwSuccess) && (
                        <View style={s.successBox}>
                            <Check size={16} color={C.green} />
                            <Text style={s.successTxt}>{pwSuccess}</Text>
                        </View>
                    )}

                    {/* Current Password */}
                    <View style={s.fieldWrap}>
                        <Text style={s.label}>Current Password</Text>
                        <View style={s.inputRow}>
                            <Lock size={18} color={C.textM} style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrent}
                                placeholder="Enter current password"
                                placeholderTextColor={C.textM}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={s.eyeBtn}>
                                {showCurrent ? <EyeOff size={18} color={C.textS} /> : <Eye size={18} color={C.textS} />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View style={s.fieldWrap}>
                        <Text style={s.label}>New Password</Text>
                        <View style={s.inputRow}>
                            <Lock size={18} color={C.textM} style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                                placeholder="Min 6 characters"
                                placeholderTextColor={C.textM}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={s.eyeBtn}>
                                {showNew ? <EyeOff size={18} color={C.textS} /> : <Eye size={18} color={C.textS} />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={s.fieldWrap}>
                        <Text style={s.label}>Confirm New Password</Text>
                        <View style={s.inputRow}>
                            <Lock size={18} color={C.textM} style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                                placeholder="Re-enter new password"
                                placeholderTextColor={C.textM}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={s.eyeBtn}>
                                {showConfirm ? <EyeOff size={18} color={C.textS} /> : <Eye size={18} color={C.textS} />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[s.primaryBtn, updatingPassword && s.btnDisabled]}
                        onPress={handleChangePassword}
                        disabled={updatingPassword}
                        activeOpacity={0.88}
                    >
                        {updatingPassword ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={s.primaryBtnText}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* 2FA Card */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <View style={[s.iconCircle, { backgroundColor: C.greenL }]}>
                            <Smartphone size={20} color={C.green} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.cardTitle}>Two-Factor Authentication</Text>
                            <Text style={s.cardSub}>Add an extra layer of protection when signing in</Text>
                        </View>
                        <Switch
                            value={twoFactor}
                            onValueChange={handleToggle2FA}
                            trackColor={{ false: "#CBD5E1", true: C.primary }}
                            thumbColor="#fff"
                            disabled={updating2FA}
                        />
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={[s.card, s.dangerCard]}>
                    <View style={s.cardHeader}>
                        <View style={[s.iconCircle, { backgroundColor: C.redL }]}>
                            <AlertTriangle size={20} color={C.red} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.cardTitle, { color: C.red }]}>Deactivate Account</Text>
                            <Text style={s.cardSub}>Temporarily disable your profile and active listings</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={s.dangerBtn} onPress={handleDeactivate} activeOpacity={0.85}>
                        <Trash2 size={16} color={C.red} />
                        <Text style={s.dangerBtnText}>Deactivate My Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    card:        { backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, gap: 14 },
    dangerCard:  { borderColor: "#FCA5A5" },
    cardHeader:  { flexDirection: "row", alignItems: "center", gap: 14 },
    iconCircle:  { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    cardTitle:   { fontSize: 16, fontWeight: "800", color: C.textP },
    cardSub:     { fontSize: 12, color: C.textS, marginTop: 2, lineHeight: 16 },
    fieldWrap:   { gap: 6 },
    label:       { fontSize: 12, fontWeight: "700", color: C.textS, textTransform: "uppercase", letterSpacing: 0.5 },
    inputRow:    { flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
    inputIcon:   { marginRight: 10 },
    input:       { flex: 1, height: 48, fontSize: 15, color: C.textP, fontWeight: "500" },
    eyeBtn:      { padding: 8 },
    errorBox:    { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.redL, borderRadius: 12, padding: 12 },
    errorTxt:    { fontSize: 13, color: C.red, fontWeight: "600", flex: 1 },
    successBox:  { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.greenL, borderRadius: 12, padding: 12 },
    successTxt:  { fontSize: 13, color: C.green, fontWeight: "600", flex: 1 },
    primaryBtn:  { backgroundColor: C.primary, borderRadius: 14, height: 48, alignItems: "center", justifyContent: "center", marginTop: 4 },
    btnDisabled: { opacity: 0.7 },
    primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    dangerBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 14, backgroundColor: C.redL, borderWidth: 1, borderColor: "#FCA5A5" },
    dangerBtnText: { color: C.red, fontSize: 14, fontWeight: "700" },
});
