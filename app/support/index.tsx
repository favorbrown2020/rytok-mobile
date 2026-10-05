import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";


const C = {
    primary: "#6366F1", primaryD: "#4F46E5", primaryL: "#eef2ff",
    bg: "#F2F2F2", surface: "#ffffff", border: "#E8E8E8",
    textP: "#1A1A1A", textS: "#666666", textM: "#AAAAAA",
};

export default function Screen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#4F46E5" }} edges={["top"]}>
            <LinearGradient colors={["#4F46E5","#6366F1","#818CF8"]} start={{ x:0,y:0 }} end={{ x:1,y:0 }} style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <Text style={s.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView style={{ flex:1, backgroundColor: C.bg }} contentContainerStyle={{ padding:16, gap:12 }} showsVerticalScrollIndicator={false}>

                <View style={s.card}>
                    {["Chat with Support","FAQs","Report a Problem","Terms of Service","Privacy Policy"].map((item, i, arr) => (
                        <View key={item} style={[s.row, i === arr.length-1 && {borderBottomWidth:0}]}>
                            <Text style={s.rowLabel}>{item}</Text>
                            <Text style={{fontSize:18, color:"#CCCCCC"}}>›</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:14 },
    headerTitle: { fontSize:18, fontWeight:"900", color:"#fff", flex:1, textAlign:"center" },
    backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:"rgba(255,255,255,0.2)", alignItems:"center", justifyContent:"center" },
    backArrow:   { fontSize:18, color:"#fff", fontWeight:"700" },
    card:        { backgroundColor:C.surface, borderRadius:16, padding:16, borderWidth:1, borderColor:C.border },
    label:       { fontSize:13, fontWeight:"700", color:C.textM, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 },
    field:       { fontSize:16, fontWeight:"500", color:C.textP, paddingVertical:12, paddingHorizontal:14, backgroundColor:C.bg, borderRadius:10, borderWidth:1, borderColor:C.border },
    row:         { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:14, borderBottomWidth:1, borderBottomColor:C.border },
    rowLabel:    { flex:1, fontSize:16, fontWeight:"600", color:C.textP },
    comingSoon:  { alignItems:"center", padding:40, gap:12 },
    comingIcon:  { fontSize:48 },
    comingTitle: { fontSize:20, fontWeight:"900", color:C.textP },
    comingSub:   { fontSize:14, color:C.textS, textAlign:"center", lineHeight:22 },
});
