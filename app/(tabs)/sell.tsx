import React, { useState, useCallback } from "react";
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    ActivityIndicator, Image, Alert, KeyboardAvoidingView, Platform, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {
    PlusCircle, Tag, DollarSign, MapPin,
    Image as ImageIcon, Sparkles, LogIn, Camera, X,
} from "lucide-react-native";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import { API_BASE_URL, apiFetch, getAuthToken } from "../../constants/api";

const CATEGORIES = [
    { id: "11111111-1111-1111-1111-111111111103", name: "Electronics" },
    { id: "ed71e69f-97ff-4437-ba64-c1ff015dc15c", name: "Phones" },
    { id: "11111111-1111-1111-1111-111111111101", name: "Vehicles" },
    { id: "11111111-1111-1111-1111-111111111104", name: "Fashion" },
    { id: "11111111-1111-1111-1111-111111111105", name: "Home & Garden" },
    { id: "7f67269b-2cd5-4351-886f-cb7db04183a3", name: "Property" },
    { id: "11111111-1111-1111-1111-111111111107", name: "Services" },
    { id: "11111111-1111-1111-1111-111111111112", name: "Other" },
];

const CONDITIONS = ["Brand New", "Like New", "Used", "Refurbished"];

export default function SellScreen() {
    const [token, setToken] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
    const [price, setPrice] = useState("");
    const [isNegotiable, setIsNegotiable] = useState(true);
    const [condition, setCondition] = useState("Brand New");
    const [location, setLocation] = useState("Greater Accra • East Legon");
    const [imageUrl, setImageUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [description, setDescription] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const checkAuth = async () => {
        setAuthLoading(true);
        const t = await getAuthToken();
        setToken(t);
        setAuthLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            checkAuth();
        }, [])
    );

    const pickAndUploadImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission needed", "Please grant photo library permission to upload item photos.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]?.uri) {
                const localUri = result.assets[0].uri;
                setUploadingImage(true);

                const filename = localUri.split("/").pop() || "upload.jpg";
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                const formData = new FormData();
                formData.append("file", {
                    uri: localUri,
                    name: filename,
                    type: type,
                } as any);

                const t = await getAuthToken();
                const res = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: "POST",
                    headers: {
                        ...(t ? { Authorization: `Bearer ${t}` } : {}),
                    },
                    body: formData,
                });

                const data = await res.json();
                if (data.url) {
                    setImageUrl(data.url);
                } else {
                    setImageUrl(localUri);
                }
            }
        } catch (err) {
            console.error("Image pick error:", err);
            Alert.alert("Upload error", "Could not upload image. You can also paste an image web link below.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || title.trim().length < 5) {
            setError("Title must be at least 5 characters long.");
            return;
        }

        if (!price || isNaN(Number(price)) || Number(price) < 0) {
            setError("Please enter a valid price in GH₵.");
            return;
        }

        if (!description.trim() || description.trim().length < 20) {
            setError("Description must be at least 20 characters long.");
            return;
        }

        if (!location.trim()) {
            setError("Please enter your location in Ghana.");
            return;
        }

        const validImages = imageUrl.trim()
            ? [imageUrl.trim()]
            : ["https://ik.imagekit.io/rytok/placeholder.webp"];

        setSubmitting(true);
        setError("");

        try {
            const res = await apiFetch("/api/listings", {
                method: "POST",
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    price: Number(price),
                    category_id: categoryId,
                    condition: condition,
                    location: location.trim(),
                    images: validImages,
                    is_negotiable: isNegotiable,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create listing. Please try again.");
                return;
            }

            Alert.alert(
                "Success! 🎉",
                "Your listing has been published to Rytok!",
                [
                    {
                        text: "View Home",
                        onPress: () => {
                            setTitle("");
                            setPrice("");
                            setDescription("");
                            setImageUrl("");
                            router.push("/(tabs)");
                        },
                    },
                ]
            );
        } catch {
            setError("Network error while publishing. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <SafeAreaView style={s.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (!token) {
        return (
            <SafeAreaView style={s.page} edges={["top"]}>
                <View style={s.unauthContainer}>
                    <View style={s.unauthIconWrap}>
                        <PlusCircle size={48} color="#3b82f6" />
                    </View>
                    <Text style={s.unauthTitle}>Sell on Rytok Ghana</Text>
                    <Text style={s.unauthSub}>
                        Join thousands of verified Ghanaian sellers. Please sign in or create an account to start listing items.
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push("/auth/login")}
                        activeOpacity={0.85}
                        style={{ width: "100%", marginBottom: 12 }}
                    >
                        <LinearGradient colors={["#3b82f6", "#1d4ed8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitBtn}>
                            <LogIn size={18} color="#fff" />
                            <Text style={s.submitBtnText}>Sign In to Sell</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/auth/register")}
                        activeOpacity={0.85}
                        style={s.outlineBtn}
                    >
                        <Text style={s.outlineBtnText}>Create Free Account</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.page} edges={["top"]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={s.header}>
                        <Text style={s.headerTag}>NEW LISTING</Text>
                        <Text style={s.headerTitle}>Post an item for sale</Text>
                        <Text style={s.headerSub}>Fill in details to reach buyers across Ghana</Text>
                    </View>

                    {error ? (
                        <View style={s.errorBox}>
                            <Text style={s.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Title */}
                    <Text style={s.label}>Listing Title *</Text>
                    <View style={s.inputWrap}>
                        <Tag size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={s.input}
                            placeholder="e.g. Apple iPhone 15 Pro 128GB"
                            placeholderTextColor={colors.textMuted}
                            value={title}
                            onChangeText={(v) => { setTitle(v); setError(""); }}
                        />
                    </View>

                    {/* Category Selector */}
                    <Text style={s.label}>Category *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                        {CATEGORIES.map((cat) => {
                            const isSelected = categoryId === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[s.chip, isSelected && s.chipSelected]}
                                    onPress={() => setCategoryId(cat.id)}
                                >
                                    <Text style={[s.chipText, isSelected && s.chipTextSelected]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Price and Negotiable */}
                    <View style={s.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.label}>Price (GH₵) *</Text>
                            <View style={s.inputWrap}>
                                <DollarSign size={18} color={colors.textMuted} style={s.inputIcon} />
                                <TextInput
                                    style={s.input}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={(v) => { setPrice(v); setError(""); }}
                                />
                            </View>
                        </View>

                        <View style={s.switchWrap}>
                            <Text style={s.label}>Negotiable?</Text>
                            <View style={s.switchRow}>
                                <Text style={{ color: isNegotiable ? "#34d399" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>
                                    {isNegotiable ? "Yes" : "Fixed"}
                                </Text>
                                <Switch
                                    value={isNegotiable}
                                    onValueChange={setIsNegotiable}
                                    thumbColor={isNegotiable ? "#3b82f6" : "#f4f3f4"}
                                    trackColor={{ false: "#334155", true: "rgba(59, 130, 246, 0.4)" }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Condition */}
                    <Text style={s.label}>Condition *</Text>
                    <View style={s.conditionGrid}>
                        {CONDITIONS.map((c) => {
                            const isSelected = condition === c;
                            return (
                                <TouchableOpacity
                                    key={c}
                                    style={[s.conditionBtn, isSelected && s.conditionBtnSelected]}
                                    onPress={() => setCondition(c)}
                                >
                                    <Text style={[s.conditionText, isSelected && s.conditionTextSelected]}>
                                        {c}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Location */}
                    <Text style={s.label}>Location in Ghana *</Text>
                    <View style={s.inputWrap}>
                        <MapPin size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={s.input}
                            placeholder="e.g. Greater Accra • East Legon"
                            placeholderTextColor={colors.textMuted}
                            value={location}
                            onChangeText={(v) => { setLocation(v); setError(""); }}
                        />
                    </View>

                    {/* Photo Upload Section */}
                    <Text style={s.label}>Item Photo</Text>
                    {imageUrl ? (
                        <View style={s.imagePreviewWrap}>
                            <Image source={{ uri: imageUrl }} style={s.imagePreview} resizeMode="cover" />
                            <TouchableOpacity
                                style={s.removeImageBtn}
                                onPress={() => setImageUrl("")}
                            >
                                <X size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={s.uploadBox}
                            onPress={pickAndUploadImage}
                            disabled={uploadingImage}
                            activeOpacity={0.8}
                        >
                            {uploadingImage ? (
                                <ActivityIndicator size="small" color="#3b82f6" />
                            ) : (
                                <>
                                    <View style={s.uploadCircle}>
                                        <Camera size={24} color="#3b82f6" />
                                    </View>
                                    <Text style={s.uploadTitle}>Choose Photo from Phone</Text>
                                    <Text style={s.uploadSub}>PNG, JPG up to 10MB</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Fallback image URL */}
                    <View style={[s.inputWrap, { marginTop: 10 }]}>
                        <ImageIcon size={18} color={colors.textMuted} style={s.inputIcon} />
                        <TextInput
                            style={s.input}
                            placeholder="Or paste direct image URL"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            value={imageUrl}
                            onChangeText={setImageUrl}
                        />
                    </View>

                    {/* Description */}
                    <Text style={s.label}>Item Description (min 20 characters) *</Text>
                    <View style={s.textAreaWrap}>
                        <TextInput
                            style={s.textArea}
                            placeholder="Describe condition, specifications, warranty, reason for selling..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={(v) => { setDescription(v); setError(""); }}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity onPress={handleSubmit} disabled={submitting} activeOpacity={0.85} style={{ marginTop: 12 }}>
                        <LinearGradient colors={["#3b82f6", "#1d4ed8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitBtn}>
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <Sparkles size={18} color="#fff" />
                                    <Text style={s.submitBtnText}>Publish Listing</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.bg },
    centerContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
    unauthContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg, paddingBottom: 60 },
    unauthIconWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(59, 130, 246, 0.12)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
    unauthTitle: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, marginBottom: 8, textAlign: "center" },
    unauthSub: { fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 32, paddingHorizontal: 12 },
    scrollContent: { paddingHorizontal: spacing.lg, paddingVertical: 20, paddingBottom: 60 },
    header: { marginBottom: 24 },
    headerTag: { fontSize: 12, fontWeight: "800", color: "#3b82f6", letterSpacing: 2, marginBottom: 4 },
    headerTitle: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: 4 },
    headerSub: { fontSize: 14, color: colors.textSecondary },
    errorBox: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderRadius: radius.md, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
    errorText: { color: "#f87171", fontSize: 13, fontWeight: "500" },
    label: { fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: 8, marginTop: 12 },
    inputWrap: { position: "relative", marginBottom: 8 },
    inputIcon: { position: "absolute", left: 16, top: 16, zIndex: 1 },
    input: { backgroundColor: colors.bgInput, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingLeft: 46, paddingRight: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15 },
    chipRow: { gap: 8, paddingBottom: 4 },
    chip: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
    chipSelected: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
    chipText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    chipTextSelected: { color: "#fff", fontWeight: "700" },
    row: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
    switchWrap: { width: 110, alignItems: "center" },
    switchRow: { flexDirection: "row", alignItems: "center", gap: 8, height: 48, justifyContent: "center" },
    conditionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    conditionBtn: { flex: 1, minWidth: "45%", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: radius.md, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)" },
    conditionBtnSelected: { backgroundColor: "rgba(59, 130, 246, 0.2)", borderColor: "#3b82f6" },
    conditionText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    conditionTextSelected: { color: "#60a5fa", fontWeight: "700" },
    uploadBox: { backgroundColor: "rgba(255, 255, 255, 0.03)", borderWidth: 1.5, borderColor: "rgba(59, 130, 246, 0.3)", borderStyle: "dashed", borderRadius: radius.md, paddingVertical: 28, alignItems: "center", justifyContent: "center" },
    uploadCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(59, 130, 246, 0.15)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
    uploadTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
    uploadSub: { fontSize: 12, color: colors.textMuted },
    imagePreviewWrap: { width: "100%", height: 180, borderRadius: radius.md, overflow: "hidden", position: "relative", backgroundColor: "#0f172a" },
    imagePreview: { width: "100%", height: 180 },
    removeImageBtn: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.6)", width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    textAreaWrap: { marginBottom: 16 },
    textArea: { backgroundColor: colors.bgInput, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 16, color: colors.textPrimary, fontSize: 15, minHeight: 110 },
    submitBtn: { borderRadius: radius.md, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
    submitBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    outlineBtn: { borderRadius: radius.md, paddingVertical: 15, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(59, 130, 246, 0.4)", width: "100%" },
    outlineBtnText: { color: "#93c5fd", fontSize: 15, fontWeight: "600" },
});
