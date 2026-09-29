import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors, spacing, fontSize } from "../../constants/theme";

export default function ListingDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Listing Details</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.bodyText}>Listing ID: {id}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { marginRight: spacing.md },
    title: { fontSize: fontSize.lg, fontWeight: "700", color: colors.textPrimary },
    content: { flex: 1, padding: spacing.lg, justifyContent: "center", alignItems: "center" },
    bodyText: { color: colors.textMuted, fontSize: fontSize.md },
});