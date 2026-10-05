import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MessageCircle, User, ChevronRight } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { apiFetch } from "../../constants/api";

const C = {
    primary: "#6366F1", primaryD: "#4F46E5", primaryL: "#eef2ff",
    bg: "#F8F9FA", surface: "#ffffff", border: "#E5E7EB",
    textP: "#111827", textS: "#6B7280", textM: "#9CA3AF",
    green: "#10B981",
};

export default function MessagesScreen() {
    const [chats, setChats]     = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(() => {
        apiFetch("/api/messages/conversations")
            .then(r => r.ok ? r.json() : { conversations: [] })
            .then(d => setChats(d.conversations || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []));

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <View style={{ flex: 1, backgroundColor: C.bg }}>
                {/* Header */}
                <LinearGradient colors={["#4F46E5", "#6366F1", "#818CF8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.header}>
                    <Text style={s.headerTitle}>Messages</Text>
                    {chats.length > 0 && (
                        <View style={s.headerBadge}>
                            <Text style={s.headerBadgeTxt}>{chats.length}</Text>
                        </View>
                    )}
                </LinearGradient>

                {loading
                    ? <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
                    : chats.length === 0
                        ? <View style={s.emptyWrap}>
                            <MessageCircle size={52} color={C.textM} />
                            <Text style={s.emptyTitle}>No Messages Yet</Text>
                            <Text style={s.emptySub}>When you contact a seller or get inquiries about your listings, conversations will appear here.</Text>
                            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push("/(tabs)" as any)}>
                                <Text style={s.emptyBtnTxt}>Browse Listings</Text>
                            </TouchableOpacity>
                          </View>
                        : <FlatList
                            data={chats}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <ChatRow chat={item} />}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.border, marginLeft: 76 }} />}
                          />
                }
            </View>
        </SafeAreaView>
    );
}

function ChatRow({ chat }: { chat: any }) {
    const other = chat.other_user || {};
    const unread = chat.unread_count || 0;
    return (
        <TouchableOpacity style={s.chatRow} onPress={() => router.push(`/messages/${chat.id}` as any)} activeOpacity={0.85}>
            {other.avatar_url
                ? <Image source={{ uri: other.avatar_url }} style={s.chatAvatar} />
                : <View style={[s.chatAvatar, s.chatAvatarFallback]}>
                    <Text style={s.chatAvatarTxt}>{(other.name || "?")[0].toUpperCase()}</Text>
                  </View>
            }
            <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[s.chatName, unread > 0 && { color: C.primary }]}>{other.name || "Unknown"}</Text>
                    <Text style={s.chatTime}>{chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</Text>
                </View>
                <Text style={[s.chatPreview, unread > 0 && { fontWeight: "700", color: C.textP }]} numberOfLines={1}>
                    {chat.last_message || "Tap to view conversation"}
                </Text>
            </View>
            {unread > 0 && (
                <View style={s.unreadBadge}>
                    <Text style={s.unreadTxt}>{unread}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    header:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    headerTitle:    { fontSize: 18, fontWeight: "900", color: "#fff", flex: 1 },
    headerBadge:    { backgroundColor: "#EF4444", borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 },
    headerBadgeTxt: { fontSize: 11, fontWeight: "800", color: "#fff" },
    emptyWrap:   { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
    emptyTitle:  { fontSize: 20, fontWeight: "800", color: C.textP },
    emptySub:    { fontSize: 13, color: C.textS, textAlign: "center", lineHeight: 20 },
    emptyBtn:    { backgroundColor: C.primary, borderRadius: 50, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
    emptyBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
    chatRow:          { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff" },
    chatAvatar:       { width: 48, height: 48, borderRadius: 24 },
    chatAvatarFallback: { backgroundColor: C.primaryL, alignItems: "center", justifyContent: "center" },
    chatAvatarTxt:    { fontSize: 18, fontWeight: "800", color: C.primary },
    chatName:         { fontSize: 15, fontWeight: "700", color: C.textP },
    chatTime:         { fontSize: 11, color: C.textM },
    chatPreview:      { fontSize: 13, color: C.textS },
    unreadBadge:      { backgroundColor: C.primary, borderRadius: 50, width: 20, height: 20, alignItems: "center", justifyContent: "center" },
    unreadTxt:        { fontSize: 10, fontWeight: "800", color: "#fff" },
});
