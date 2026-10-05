import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    MapPin, Plus, Trash2, ArrowLeft, ShieldCheck,
    Check, X, Navigation,
} from "lucide-react-native";
import { apiFetch, setStoredUser } from "../../constants/api";

const C = {
    primary:   "#6366F1",
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

export default function MeetupLocationsScreen() {
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [spotName, setSpotName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("Accra");

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    const spots = data?.user?.metadata?.meetupLocations;
                    if (Array.isArray(spots)) {
                        setLocations(spots);
                    }
                }
            } catch {} finally {
                setLoading(false);
            }
        })();
    }, []);

    const saveLocations = async (newList: any[]) => {
        setLocations(newList);
        setSaving(true);
        try {
            const res = await apiFetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    metadata: { meetupLocations: newList },
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) await setStoredUser(data.user);
            }
        } catch {
            Alert.alert("Error", "Could not save meetup locations.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSpot = () => {
        if (!spotName.trim()) {
            Alert.alert("Required", "Please provide a name for this meetup location.");
            return;
        }

        const newSpot = {
            id: Date.now().toString(),
            name: spotName.trim(),
            address: address.trim() || spotName.trim(),
            city: city.trim(),
        };

        const updated = [...locations, newSpot];
        saveLocations(updated);
        setSpotName("");
        setAddress("");
        setModalVisible(false);
    };

    const handleDeleteSpot = (id: string) => {
        Alert.alert("Remove Location", "Remove this meetup spot from your saved locations?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: () => {
                    const filtered = locations.filter(l => l.id !== id);
                    saveLocations(filtered);
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Meetup Locations</Text>
                <TouchableOpacity style={s.backBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: C.bg }}
                contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.infoBanner}>
                    <ShieldCheck size={22} color={C.green} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={s.infoTitle}>Safe Trade Zones</Text>
                        <Text style={s.infoSub}>
                            Save trusted public locations (e.g. shopping malls, police station lobbies, bank plazas) to share with buyers for in-person handoffs.
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View style={s.loadingBox}>
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text style={s.loadingTxt}>Loading locations...</Text>
                    </View>
                ) : locations.length === 0 ? (
                    <View style={s.emptyCard}>
                        <MapPin size={40} color={C.textM} />
                        <Text style={s.emptyTitle}>No Meetup Spots Saved</Text>
                        <Text style={s.emptySub}>
                            Add your preferred public spots so buyers know where to meet you safely.
                        </Text>
                        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.88}>
                            <Plus size={16} color="#fff" />
                            <Text style={s.addBtnTxt}>Add Safe Meetup Spot</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    locations.map((loc) => (
                        <View key={loc.id} style={s.spotCard}>
                            <View style={s.spotIconWrap}>
                                <MapPin size={20} color={C.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.spotName}>{loc.name}</Text>
                                <Text style={s.spotAddr}>{loc.address}</Text>
                                <Text style={s.spotCity}>{loc.city}</Text>
                            </View>
                            <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteSpot(loc.id)} activeOpacity={0.8}>
                                <Trash2 size={16} color={C.red} />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add Location Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={s.modalOverlay}>
                    <View style={s.modalCard}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Add Safe Meetup Spot</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={s.closeBtn}>
                                <X size={20} color={C.textP} />
                            </TouchableOpacity>
                        </View>

                        <View style={s.fieldWrap}>
                            <Text style={s.fieldLabel}>Location Name</Text>
                            <TextInput
                                style={s.modalInput}
                                value={spotName}
                                onChangeText={setSpotName}
                                placeholder="e.g. Accra Mall Food Court"
                                placeholderTextColor={C.textM}
                            />
                        </View>

                        <View style={s.fieldWrap}>
                            <Text style={s.fieldLabel}>Street / Landmark</Text>
                            <TextInput
                                style={s.modalInput}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="e.g. Tetteh Quarshie Interchange"
                                placeholderTextColor={C.textM}
                            />
                        </View>

                        <View style={s.fieldWrap}>
                            <Text style={s.fieldLabel}>City / Region</Text>
                            <TextInput
                                style={s.modalInput}
                                value={city}
                                onChangeText={setCity}
                                placeholder="e.g. Accra"
                                placeholderTextColor={C.textM}
                            />
                        </View>

                        <TouchableOpacity style={s.modalSaveBtn} onPress={handleAddSpot} activeOpacity={0.88}>
                            <Check size={18} color="#fff" />
                            <Text style={s.modalSaveTxt}>Save Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
    backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    infoBanner:  { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#ECFDF5", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#A7F3D0" },
    infoTitle:   { fontSize: 14, fontWeight: "700", color: "#065F46" },
    infoSub:     { fontSize: 12, color: "#047857", marginTop: 2, lineHeight: 18 },
    loadingBox:  { padding: 40, alignItems: "center", gap: 12 },
    loadingTxt:  { fontSize: 14, color: C.textS },
    emptyCard:   { backgroundColor: C.surface, borderRadius: 20, padding: 32, alignItems: "center", borderWidth: 1, borderColor: C.border, gap: 10, marginTop: 12 },
    emptyTitle:  { fontSize: 16, fontWeight: "800", color: C.textP },
    emptySub:    { fontSize: 13, color: C.textS, textAlign: "center", lineHeight: 20 },
    addBtn:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
    addBtnTxt:   { color: "#fff", fontSize: 14, fontWeight: "700" },
    spotCard:    { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border },
    spotIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center" },
    spotName:    { fontSize: 15, fontWeight: "800", color: C.textP },
    spotAddr:    { fontSize: 13, color: C.textS, marginTop: 2 },
    spotCity:    { fontSize: 12, color: C.textM, marginTop: 2 },
    deleteBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: C.redL, alignItems: "center", justifyContent: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalCard:   { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    modalTitle:  { fontSize: 18, fontWeight: "800", color: C.textP },
    closeBtn:    { padding: 4 },
    fieldWrap:   { gap: 6 },
    fieldLabel:  { fontSize: 12, fontWeight: "700", color: C.textS, textTransform: "uppercase" },
    modalInput:  { height: 48, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, fontSize: 15, color: C.textP, backgroundColor: C.bg },
    modalSaveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, backgroundColor: C.primary, marginTop: 8 },
    modalSaveTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
