import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {
    User, Mail, Phone, FileText, Camera, Check,
    AlertCircle, ArrowLeft, Globe,
} from "lucide-react-native";
import { apiFetch, getStoredUser, setStoredUser } from "../../constants/api";

const C = {
    primary:   "#6366F1",
    primaryD:  "#4F46E5",
    primaryL:  "#EEF2FF",
    green:     "#10B981",
    greenL:    "#D1FAE5",
    red:       "#EF4444",
    redL:      "#FEE2E2",
    bg:        "#F8FAFC",
    surface:   "#FFFFFF",
    border:    "#E2E8F0",
    textP:     "#0F172A",
    textS:     "#64748B",
    textM:     "#94A3B8",
};

export default function EditProfileScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [countryCode, setCountryCode] = useState("gh");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const loadProfile = useCallback(async () => {
        try {
            const cached = await getStoredUser();
            if (cached) {
                setName(cached.name || cached.full_name || "");
                setEmail(cached.email || "");
                setPhone(cached.phone || "");
                setBio(cached.bio || "");
                setCountryCode(cached.country_code || "gh");
                setAvatarUrl(cached.avatar_url || null);
            }

            const res = await apiFetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    const u = data.user;
                    setName(u.name || u.full_name || "");
                    setEmail(u.email || "");
                    setPhone(u.phone || "");
                    setBio(u.bio || "");
                    setCountryCode(u.country_code || "gh");
                    setAvatarUrl(u.avatar_url || null);
                    await setStoredUser(u);
                }
            }
        } catch {
            setErrorMsg("Could not load latest profile details.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleAvatarPick = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permission Needed", "Please grant photo library access to change your profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });

        if (result.canceled || !result.assets?.[0]) return;

        setAvatarUploading(true);
        try {
            const fd = new FormData();
            (fd as any).append("file", {
                uri: result.assets[0].uri,
                name: "avatar.jpg",
                type: "image/jpeg",
            });

            const res = await apiFetch("/api/auth/profile/avatar", {
                method: "POST",
                body: fd as any,
            });

            if (res.ok) {
                const d = await res.json();
                if (d.avatar_url) {
                    setAvatarUrl(d.avatar_url);
                    const cached = await getStoredUser();
                    if (cached) await setStoredUser({ ...cached, avatar_url: d.avatar_url });
                    setSuccessMsg("Profile photo updated!");
                }
            } else {
                setErrorMsg("Failed to upload photo.");
            }
        } catch {
            setErrorMsg("Upload error. Please try again.");
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setErrorMsg("Name cannot be empty.");
            return;
        }

        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await apiFetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    bio: bio.trim(),
                    country_code: countryCode,
                }),
            });

            const data = await res.json();
            if (res.ok && data.user) {
                await setStoredUser(data.user);
                setSuccessMsg("Profile updated successfully!");
                setTimeout(() => setSuccessMsg(""), 3500);
            } else {
                setErrorMsg(data.error || "Failed to update profile.");
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            {/* Header */}
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Personal Information</Text>
                <View style={{ width: 36 }} />
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1, backgroundColor: C.bg }}
            >
                {loading ? (
                    <View style={s.centerBox}>
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text style={s.loadingTxt}>Loading profile details...</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Avatar Card */}
                        <View style={s.avatarCard}>
                            <TouchableOpacity style={s.avatarWrap} onPress={handleAvatarPick} activeOpacity={0.85}>
                                {avatarUrl ? (
                                    <Image source={{ uri: avatarUrl }} style={s.avatar} />
                                ) : (
                                    <View style={[s.avatar, s.avatarFallback]}>
                                        <User size={40} color={C.textM} />
                                    </View>
                                )}
                                <View style={s.cameraBadge}>
                                    {avatarUploading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Camera size={14} color="#fff" />
                                    )}
                                </View>
                            </TouchableOpacity>
                            <Text style={s.avatarTitle}>Profile Picture</Text>
                            <Text style={s.avatarSub}>Tap photo to choose a new image</Text>
                        </View>

                        {/* Status Messages */}
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

                        {/* Form Fields Card */}
                        <View style={s.card}>
                            <Text style={s.sectionTitle}>Basic Details</Text>

                            {/* Full Name */}
                            <View style={s.fieldWrap}>
                                <Text style={s.label}>Full Name</Text>
                                <View style={s.inputRow}>
                                    <User size={18} color={C.textM} style={s.inputIcon} />
                                    <TextInput
                                        style={s.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="e.g. John Doe"
                                        placeholderTextColor={C.textM}
                                    />
                                </View>
                            </View>

                            {/* Email */}
                            <View style={s.fieldWrap}>
                                <Text style={s.label}>Email Address</Text>
                                <View style={s.inputRow}>
                                    <Mail size={18} color={C.textM} style={s.inputIcon} />
                                    <TextInput
                                        style={s.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholder="user@example.com"
                                        placeholderTextColor={C.textM}
                                    />
                                </View>
                            </View>

                            {/* Phone */}
                            <View style={s.fieldWrap}>
                                <Text style={s.label}>Phone Number</Text>
                                <View style={s.inputRow}>
                                    <Phone size={18} color={C.textM} style={s.inputIcon} />
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

                            {/* Country / Marketplace */}
                            <View style={s.fieldWrap}>
                                <Text style={s.label}>Marketplace Country</Text>
                                <View style={s.inputRow}>
                                    <Globe size={18} color={C.textM} style={s.inputIcon} />
                                    <Text style={[s.input, { paddingTop: 14 }]}>
                                        {countryCode === "gh" ? "Ghana (GH)" : countryCode === "ng" ? "Nigeria (NG)" : countryCode.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Bio Card */}
                        <View style={s.card}>
                            <Text style={s.sectionTitle}>About You</Text>
                            <View style={s.fieldWrap}>
                                <Text style={s.label}>Bio / Introduction</Text>
                                <View style={[s.inputRow, { alignItems: "flex-start", paddingTop: 12 }]}>
                                    <FileText size={18} color={C.textM} style={[s.inputIcon, { marginTop: 2 }]} />
                                    <TextInput
                                        style={[s.input, s.bioInput]}
                                        value={bio}
                                        onChangeText={setBio}
                                        multiline
                                        numberOfLines={4}
                                        placeholder="Write a brief introduction for buyers and sellers..."
                                        placeholderTextColor={C.textM}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[s.saveBtn, saving && s.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                            activeOpacity={0.88}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Check size={18} color="#fff" />
                                    <Text style={s.saveBtnText}>Save Profile Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    centerBox:   { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingTxt:  { fontSize: 14, color: C.textS },
    avatarCard:  { backgroundColor: C.surface, borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 1, borderColor: C.border },
    avatarWrap:  { position: "relative", marginBottom: 12 },
    avatar:      { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: C.primaryL },
    avatarFallback: { backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
    cameraBadge: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
    avatarTitle: { fontSize: 16, fontWeight: "700", color: C.textP },
    avatarSub:   { fontSize: 12, color: C.textS, marginTop: 2 },
    card:        { backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, gap: 14 },
    sectionTitle: { fontSize: 15, fontWeight: "800", color: C.textP, marginBottom: 2 },
    fieldWrap:   { gap: 6 },
    label:       { fontSize: 12, fontWeight: "700", color: C.textS, textTransform: "uppercase", letterSpacing: 0.5 },
    inputRow:    { flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
    inputIcon:   { marginRight: 10 },
    input:       { flex: 1, height: 48, fontSize: 15, color: C.textP, fontWeight: "500" },
    bioInput:    { height: 96, paddingTop: 10 },
    errorBox:    { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.redL, borderRadius: 12, padding: 12 },
    errorTxt:    { fontSize: 13, color: C.red, fontWeight: "600", flex: 1 },
    successBox:  { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.greenL, borderRadius: 12, padding: 12 },
    successTxt:  { fontSize: 13, color: C.green, fontWeight: "600", flex: 1 },
    saveBtn:     { backgroundColor: C.primary, borderRadius: 16, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
