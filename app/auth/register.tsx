import React, { useState, useRef } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView, Dimensions, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
    Eye, EyeOff, Mail, Lock, User, Phone,
    ArrowRight, ShieldCheck, ArrowLeft,
    ShoppingBag, Bell, Star, Users, Shield, Briefcase, CheckCircle,
} from "lucide-react-native";
import { API_BASE_URL, setAuthToken, setStoredUser } from "../../constants/api";
import * as WebBrowser from "expo-web-browser";
import { signInWithGoogle } from "../../constants/useGoogleAuth";

const { width: W } = Dimensions.get("window");

const C = {
    primary: "#6366F1", primaryD: "#4F46E5", primaryL: "#eef2ff",
    green: "#10B981", bg: "#F8F9FA", dark: "#0F0E17",
    card: "#1C1B29", border: "#E8E8E8", darkBorder: "#2E2D3E",
    inputBg: "#17162A", surface: "#FFFFFF",
    textP: "#1A1A1A", textS: "#666666", textM: "#AAAAAA",
    textPD: "#FFFFFF", textSD: "#A0A0B8", textMD: "#5C5C7A",
};

const PERSONAL_FEATURES = [
    { icon: ShoppingBag, label: "Buy & sell items\neasily" },
    { icon: Users,       label: "Contact buyers\n& sellers directly" },
    { icon: Bell,        label: "Saved searches &\nprice alerts" },
    { icon: Shield,      label: "Verified buyer\nprotection" },
    { icon: Star,        label: "Personalised\nrecommendations" },
    { icon: Users,       label: "Community\nsupport" },
];
const BUSINESS_FEATURES = [
    { icon: Briefcase,   label: "Dedicated shop\npage" },
    { icon: Star,        label: "Priority listing\nplacement" },
    { icon: Users,       label: "Seller analytics\n& insights" },
    { icon: Shield,      label: "Business\nverification badge" },
    { icon: Bell,        label: "Advanced product\nlisting tools" },
    { icon: ShoppingBag, label: "Premium support\n& account manager" },
];

function getStrength(pw: string) {
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return { score: s, label: ["","Weak","Fair","Good","Strong"][s]||"", color: ["","#EF4444","#f59e0b","#6366F1","#10B981"][s]||"" };
}

export default function RegisterScreen() {
    const [step,         setStep]         = useState<"type"|"form">("type");
    const [accountType,  setAccountType]  = useState<"personal"|"business">("personal");
    const [name,         setName]         = useState("");
    const [email,        setEmail]        = useState("");
    const [phone,        setPhone]        = useState("");
    const [password,     setPassword]     = useState("");
    const [showPw,       setShowPw]       = useState(false);
    const [agreed,       setAgreed]       = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error,        setError]        = useState("");
    const [success,      setSuccess]      = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const strength = getStrength(password);

    const shake = () => Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password) { setError("Please fill in your name, email and password."); shake(); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters."); shake(); return; }
        if (!agreed) { setError("Please agree to the Terms of Service."); shake(); return; }
        setLoading(true); setError("");
        try {
            const res  = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim()||undefined, password, account_type: accountType }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Registration failed."); shake(); return; }
            if (data.token) await setAuthToken(data.token);
            if (data.user)  await setStoredUser(data.user);
            setSuccess(true);
            setTimeout(() => router.replace("/(tabs)" as any), 1200);
        } catch { setError("Could not connect. Check your connection."); shake(); }
        finally { setLoading(false); }
    };

    const handleGoogle = () => signInWithGoogle(setError, setGoogleLoading, { accountType });

    /* ── Success ─────────────────────────────────────────────── */
    if (success) return (
        <SafeAreaView style={{ flex:1, backgroundColor: C.dark, alignItems:"center", justifyContent:"center", gap:16, padding:32 }}>
            <LinearGradient colors={["#6366F1","#4F46E5"]} style={{ width:80, height:80, borderRadius:40, alignItems:"center", justifyContent:"center" }}>
                <CheckCircle size={40} color="#fff" />
            </LinearGradient>
            <Text style={{ fontSize:24, fontWeight:"900", color:"#fff" }}>Account Created!</Text>
            <Text style={{ fontSize:14, color:"#A0A0B8", textAlign:"center" }}>Welcome to Rytok. Taking you to the app…</Text>
            <ActivityIndicator color={C.primary} style={{ marginTop:8 }} />
        </SafeAreaView>
    );

    /* ── STEP 1: Account type ─────────────────────────────────── */
    if (step === "type") {
        const features = accountType === "personal" ? PERSONAL_FEATURES : BUSINESS_FEATURES;
        const badge     = accountType === "personal" ? "FREE FOREVER" : "PREMIUM";
        const subtitle  = accountType === "personal"
            ? "Perfect for individuals buying & selling"
            : "For shops, dealers & businesses";

        return (
            <SafeAreaView style={{ flex:1, backgroundColor: "#F5F5F7" }} edges={["top","bottom"]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={t.scroll}>

                    {/* Back */}
                    <TouchableOpacity style={t.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <ArrowLeft size={20} color="#555" />
                    </TouchableOpacity>

                    {/* Title */}
                    <View style={t.titleWrap}>
                        <Text style={t.title}>Choose your account</Text>
                        <Text style={t.sub}>You can always switch or upgrade later.</Text>
                    </View>

                    {/* Pill Tab Switcher */}
                    <View style={t.tabWrap}>
                        {(["personal","business"] as const).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={t.tabBtn}
                                onPress={() => setAccountType(type)}
                                activeOpacity={0.85}
                            >
                                {accountType === type ? (
                                    <LinearGradient
                                        colors={["#7C6FEB","#6366F1","#4F46E5"]}
                                        style={t.tabActive}
                                        start={{x:0,y:0}} end={{x:1,y:0}}
                                    >
                                        <Text style={t.tabActiveTxt}>{type.charAt(0).toUpperCase()+type.slice(1)}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={t.tabInactive}>
                                        <Text style={t.tabInactiveTxt}>{type.charAt(0).toUpperCase()+type.slice(1)}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Feature Card — dark navy */}
                    <View style={t.card}>
                        {/* Card header */}
                        <View style={t.cardHeader}>
                            <LinearGradient colors={["#7C6FEB","#6366F1"]} style={t.cardIconWrap}>
                                <ShoppingBag size={24} color="#fff" />
                            </LinearGradient>
                            <View style={{ flex:1 }}>
                                <View style={{ flexDirection:"row", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                                    <Text style={t.cardTitle}>{accountType === "personal" ? "Personal" : "Business"}</Text>
                                    <View style={[t.badge, accountType==="business" && {backgroundColor:"#78350f"}]}>
                                        <Text style={[t.badgeTxt, accountType==="business" && {color:"#fcd34d"}]}>{badge}</Text>
                                    </View>
                                </View>
                                <Text style={t.cardSub}>{subtitle}</Text>
                            </View>
                        </View>

                        {/* Thin divider */}
                        <View style={t.divider} />

                        {/* Vertical feature list */}
                        {features.map(({ icon: Icon, label }, i) => (
                            <View
                                key={label}
                                style={[t.featureRow, i < features.length-1 && t.featureRowBorder]}
                            >
                                <Icon size={18} color="#818CF8" />
                                <Text style={t.featureLabel}>{label}</Text>
                                <CheckCircle size={18} color="#10B981" />
                            </View>
                        ))}
                    </View>

                    {/* Continue button */}
                    <TouchableOpacity onPress={() => setStep("form")} activeOpacity={0.88} style={{ marginTop: 20 }}>
                        <LinearGradient colors={["#7C6FEB","#6366F1","#4F46E5"]} style={t.continueBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
                            <Text style={t.continueTxt}>Continue with {accountType === "personal" ? "Personal" : "Business"}</Text>
                            <ArrowRight size={18} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ flexDirection:"row", justifyContent:"center", marginTop:18, marginBottom:8 }}>
                        <Text style={t.footTxt}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/auth/login-form" as any)}>
                            <Text style={t.footLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        );
    }

    /* ── STEP 2: Registration form ────────────────────────────── */
    return (
        <SafeAreaView style={{ flex:1, backgroundColor: C.dark }} edges={["top","bottom"]}>
            <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={f.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Back */}
                    <TouchableOpacity style={f.backBtn} onPress={() => setStep("type")} activeOpacity={0.8}>
                        <ArrowLeft size={20} color="#A0A0B8" />
                    </TouchableOpacity>

                    {/* Heading */}
                    <View style={f.heading}>
                        <Text style={f.title}>Create account</Text>
                        <Text style={f.sub}>Join thousands of buyers and sellers on Rytok</Text>
                    </View>

                    {/* Google */}
                    <TouchableOpacity style={f.googleBtn} onPress={handleGoogle} disabled={googleLoading} activeOpacity={0.88}>
                        {googleLoading ? <ActivityIndicator color="#fff" size="small" />
                            : <><Text style={f.googleG}>G</Text><Text style={f.googleTxt}>Continue with Google</Text></>
                        }
                    </TouchableOpacity>

                    <View style={f.divider}>
                        <View style={f.divLine} /><Text style={f.divTxt}>or sign up with email</Text><View style={f.divLine} />
                    </View>

                    {/* Form */}
                    <Animated.View style={[{ gap:14 }, { transform:[{ translateX: shakeAnim }] }]}>
                        {!!error && <View style={f.errBox}><Text style={f.errTxt}>{error}</Text></View>}

                        {[
                            { label:"Full Name",      state:name,     set:setName,     ph:"Your full name",    icon:User,  type:"default"  as const, kbType:undefined },
                            { label:"Email Address",  state:email,    set:setEmail,    ph:"your@email.com",    icon:Mail,  type:"default"  as const, kbType:"email-address" as const },
                            { label:"Phone",          state:phone,    set:setPhone,    ph:"+233 XX XXX XXXX",  icon:Phone, type:"default"  as const, kbType:"phone-pad"    as const, optional:true },
                        ].map(({ label, state, set, ph, icon:Icon, kbType, optional }) => (
                            <View key={label} style={f.field}>
                                <View style={{ flexDirection:"row", justifyContent:"space-between" }}>
                                    <Text style={f.label}>{label}</Text>
                                    {optional && <Text style={{ fontSize:11, color:"#5C5C7A", fontWeight:"600" }}>Optional</Text>}
                                </View>
                                <View style={f.row}>
                                    <Icon size={16} color="#5C5C7A" style={{ marginRight:10 }} />
                                    <TextInput style={f.input} value={state} onChangeText={set} placeholder={ph}
                                        placeholderTextColor="#5C5C7A" autoCapitalize={label==="Full Name" ? "words" : "none"}
                                        keyboardType={kbType} returnKeyType="next" />
                                </View>
                            </View>
                        ))}

                        {/* Password */}
                        <View style={f.field}>
                            <Text style={f.label}>Password</Text>
                            <View style={f.row}>
                                <Lock size={16} color="#5C5C7A" style={{ marginRight:10 }} />
                                <TextInput style={[f.input,{flex:1}]} value={password} onChangeText={setPassword}
                                    placeholder="Min. 8 characters" placeholderTextColor="#5C5C7A"
                                    secureTextEntry={!showPw} returnKeyType="done" />
                                <TouchableOpacity onPress={() => setShowPw(v=>!v)} hitSlop={{ top:8,bottom:8,left:8,right:8 }}>
                                    {showPw ? <EyeOff size={18} color="#5C5C7A" /> : <Eye size={18} color="#5C5C7A" />}
                                </TouchableOpacity>
                            </View>
                            {password.length > 0 && (
                                <View style={{ gap:4 }}>
                                    <View style={{ flexDirection:"row", gap:4 }}>
                                        {[1,2,3,4].map(i => (
                                            <View key={i} style={{ flex:1, height:3, borderRadius:2, backgroundColor: i<=strength.score ? strength.color : "#2E2D3E" }} />
                                        ))}
                                    </View>
                                    <Text style={{ fontSize:11, fontWeight:"700", color:strength.color }}>{strength.label}</Text>
                                </View>
                            )}
                        </View>

                        {/* Terms */}
                        <TouchableOpacity style={f.terms} onPress={() => setAgreed(v=>!v)} activeOpacity={0.8}>
                            <View style={[f.checkbox, agreed && { backgroundColor:C.primary, borderColor:C.primary }]}>
                                {agreed && <Text style={{ color:"#fff", fontSize:11, fontWeight:"900" }}>✓</Text>}
                            </View>
                            <Text style={f.termsTxt}>
                                I agree to the <Text style={{ color:C.primary, fontWeight:"700" }}>Terms of Service</Text> and <Text style={{ color:C.primary, fontWeight:"700" }}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.88}>
                            <LinearGradient colors={["#7C6FEB","#6366F1","#4F46E5"]} style={f.btn} start={{x:0,y:0}} end={{x:1,y:0}}>
                                {loading ? <ActivityIndicator color="#fff" />
                                    : <><Text style={f.btnTxt}>Create Account</Text><ArrowRight size={18} color="#fff" /></>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"center", marginTop:24 }}>
                        <Text style={{ fontSize:14, color:"#A0A0B8" }}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/auth/login-form" as any)}>
                            <Text style={{ fontSize:14, color:C.primary, fontWeight:"800" }}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection:"row", alignItems:"center", gap:5, justifyContent:"center", marginTop:14 }}>
                        <ShieldCheck size={11} color="#5C5C7A" /><Text style={{ fontSize:11, color:"#5C5C7A" }}>Secured with end-to-end encryption</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* ── Account type step styles (matches approved mockup) ──────── */
const t = StyleSheet.create({
    scroll:         { flexGrow:1, paddingHorizontal:20, paddingBottom:40 },
    backBtn:        { width:36, height:36, borderRadius:18, alignItems:"center", justifyContent:"center", marginTop:10 },
    titleWrap:      { marginTop:12, marginBottom:22 },
    title:          { fontSize:30, fontWeight:"900", color:"#111111", letterSpacing:-0.5 },
    sub:            { fontSize:15, color:"#777777", marginTop:5 },
    /* Pill tab */
    tabWrap:        { flexDirection:"row", backgroundColor:"#E5E5EA", borderRadius:50, padding:4, marginBottom:22 },
    tabBtn:         { flex:1, borderRadius:50, overflow:"hidden" },
    tabActive:      { paddingVertical:13, alignItems:"center", borderRadius:50 },
    tabActiveTxt:   { fontSize:15, fontWeight:"800", color:"#fff" },
    tabInactive:    { paddingVertical:13, alignItems:"center" },
    tabInactiveTxt: { fontSize:15, fontWeight:"600", color:"#888" },
    /* Dark navy card */
    card:           { backgroundColor:"#1A1D35", borderRadius:20, overflow:"hidden", borderWidth:1.5, borderColor:"#6366F180", shadowColor:"#6366F1", shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:16, elevation:8 },
    cardHeader:     { flexDirection:"row", alignItems:"center", gap:14, padding:18, paddingBottom:14 },
    cardIconWrap:   { width:52, height:52, borderRadius:14, alignItems:"center", justifyContent:"center" },
    cardTitle:      { fontSize:20, fontWeight:"900", color:"#fff" },
    badge:          { backgroundColor:"#312e81", borderRadius:6, paddingHorizontal:8, paddingVertical:3 },
    badgeTxt:       { fontSize:9, fontWeight:"900", color:"#a5b4fc", letterSpacing:0.6 },
    cardSub:        { fontSize:13, color:"#94A3B8", marginTop:3 },
    divider:        { height:1, backgroundColor:"rgba(255,255,255,0.08)", marginHorizontal:18 },
    /* Vertical feature list */
    featureRow:     { flexDirection:"row", alignItems:"center", gap:14, paddingHorizontal:18, paddingVertical:15 },
    featureRowBorder: { borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.07)" },
    featureLabel:   { flex:1, fontSize:15, fontWeight:"500", color:"#E2E8F0" },
    /* Continue */
    continueBtn:    { borderRadius:14, paddingVertical:17, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8 },
    continueTxt:    { fontSize:16, fontWeight:"800", color:"#fff" },
    footTxt:        { fontSize:14, color:"#666" },
    footLink:       { fontSize:14, color:"#6366F1", fontWeight:"800" },
});

/* ── Form step styles ─────────────────────────────────────────── */
const f = StyleSheet.create({
    scroll:    { flexGrow:1, paddingHorizontal:24, paddingBottom:40 },
    backBtn:   { width:38, height:38, borderRadius:19, backgroundColor:"#1C1B29", alignItems:"center", justifyContent:"center", marginTop:12, borderWidth:1, borderColor:"#2E2D3E" },
    heading:   { marginTop:22, marginBottom:22, gap:6 },
    title:     { fontSize:26, fontWeight:"900", color:"#fff", letterSpacing:-0.5 },
    sub:       { fontSize:13, color:"#A0A0B8" },
    googleBtn: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:12, borderRadius:14, paddingVertical:15, backgroundColor:"#1C1B29", borderWidth:1, borderColor:"#2E2D3E" },
    googleG:   { fontSize:18, fontWeight:"900", color:"#4285F4" },
    googleTxt: { fontSize:15, fontWeight:"700", color:"#fff" },
    divider:   { flexDirection:"row", alignItems:"center", gap:10, marginVertical:16 },
    divLine:   { flex:1, height:1, backgroundColor:"#2E2D3E" },
    divTxt:    { fontSize:12, color:"#5C5C7A", fontWeight:"600" },
    errBox:    { backgroundColor:"#2D1515", borderRadius:10, padding:12, borderWidth:1, borderColor:"#5C2020" },
    errTxt:    { fontSize:13, color:"#FF8080", fontWeight:"600", textAlign:"center" },
    field:     { gap:8 },
    label:     { fontSize:13, fontWeight:"700", color:"#A0A0B8" },
    row:       { flexDirection:"row", alignItems:"center", backgroundColor:"#17162A", borderRadius:12, borderWidth:1, borderColor:"#2E2D3E", paddingHorizontal:14, paddingVertical:13 },
    input:     { flex:1, fontSize:15, color:"#fff", padding:0 },
    terms:     { flexDirection:"row", alignItems:"flex-start", gap:10 },
    checkbox:  { width:20, height:20, borderRadius:6, borderWidth:2, borderColor:"#2E2D3E", alignItems:"center", justifyContent:"center", marginTop:1 },
    termsTxt:  { flex:1, fontSize:13, color:"#A0A0B8", lineHeight:20 },
    btn:       { borderRadius:14, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8 },
    btnTxt:    { fontSize:16, fontWeight:"800", color:"#fff" },
});
