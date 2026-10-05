/**
 * PowerImageViewer.tsx  — Rytok Mobile (v2)
 *
 * Fixes:
 *  1. Pinch-to-zoom + double-tap zoom via PanResponder + Animated
 *  2. Image fills full available space — no black bars top/bottom
 *  3. Bottom bar uses useSafeAreaInsets so AI Inspect btn is above phone nav
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, FlatList,
    Image, Dimensions, ActivityIndicator, ScrollView,
    PanResponder, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    X, ChevronLeft, ChevronRight, Scan, ShieldCheck,
    AlertTriangle, HelpCircle, Camera,
} from "lucide-react-native";
import { apiFetch } from "../constants/api";

const { width: W, height: H } = Dimensions.get("window");

/* ── Theme ──────────────────────────────────────────────────────── */
const C = {
    primary:  "#6366F1",
    green:    "#10B981",
    greenL:   "#d1fae5",
    amber:    "#f59e0b",
    red:      "#EF4444",
    orange:   "#f97316",
    surface:  "#1c1c2e",
    border:   "rgba(255,255,255,0.12)",
    textP:    "#ffffff",
    textS:    "rgba(255,255,255,0.65)",
};

function scoreColor(score: number) {
    if (score >= 8) return C.green;
    if (score >= 6) return C.amber;
    if (score >= 4) return C.orange;
    return C.red;
}

/* ── Score Ring ─────────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
    const color = scoreColor(score);
    const SIZE = 64, THICK = 6;
    return (
        <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
            <View style={{ position: "absolute", width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: THICK, borderColor: "rgba(255,255,255,0.12)" }} />
            <View style={{
                position: "absolute", width: SIZE, height: SIZE, borderRadius: SIZE / 2,
                borderWidth: THICK, borderColor: color,
                borderTopColor:    score < 2  ? "transparent" : color,
                borderRightColor:  score < 5  ? "transparent" : color,
                borderBottomColor: score < 7  ? "transparent" : color,
                borderLeftColor:   score < 9  ? "transparent" : color,
                transform: [{ rotate: "-90deg" }],
            }} />
            <Text style={{ fontSize: 20, fontWeight: "900", color }}>{score}</Text>
        </View>
    );
}

/* ── Zoomable Image (pinch + double-tap) ─────────────────────────── */
function ZoomableImage({ uri }: { uri: string }) {
    const scale        = useRef(new Animated.Value(1)).current;
    const translateX   = useRef(new Animated.Value(0)).current;
    const translateY   = useRef(new Animated.Value(0)).current;

    const scaleVal     = useRef(1);
    const lastTap      = useRef(0);
    const pinchDist    = useRef<number | null>(null);
    const initScale    = useRef(1);
    const panBase      = useRef({ x: 0, y: 0 });
    const panStart     = useRef({ x: 0, y: 0 });
    const isPanning    = useRef(false);

    const resetZoom = useCallback(() => {
        scaleVal.current = 1;
        Animated.parallel([
            Animated.spring(scale,      { toValue: 1,    useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0,    useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0,    useNativeDriver: true }),
        ]).start();
    }, [scale, translateX, translateY]);

    const dist = (t1: any, t2: any) =>
        Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder:  () => true,

            onPanResponderGrant: (e) => {
                const touches = e.nativeEvent.touches;
                if (touches.length === 2) {
                    pinchDist.current = dist(touches[0], touches[1]);
                    initScale.current = scaleVal.current;
                    isPanning.current = false;
                } else if (touches.length === 1) {
                    const now = Date.now();
                    if (now - lastTap.current < 300) {
                        // Double-tap: toggle 2.5× zoom
                        if (scaleVal.current > 1.2) {
                            resetZoom();
                        } else {
                            scaleVal.current = 2.5;
                            Animated.spring(scale, { toValue: 2.5, useNativeDriver: true }).start();
                        }
                        lastTap.current = 0;
                        return;
                    }
                    lastTap.current = now;
                    if (scaleVal.current > 1) {
                        isPanning.current = true;
                        panStart.current = {
                            x: touches[0].pageX - panBase.current.x,
                            y: touches[0].pageY - panBase.current.y,
                        };
                    }
                }
            },

            onPanResponderMove: (e) => {
                const touches = e.nativeEvent.touches;
                if (touches.length === 2 && pinchDist.current !== null) {
                    // Pinch-to-zoom
                    const newDist = dist(touches[0], touches[1]);
                    const ratio   = newDist / pinchDist.current;
                    const next    = Math.max(1, Math.min(4, initScale.current * ratio));
                    scaleVal.current = next;
                    scale.setValue(next);
                    if (next <= 1) {
                        translateX.setValue(0);
                        translateY.setValue(0);
                        panBase.current = { x: 0, y: 0 };
                    }
                } else if (touches.length === 1 && isPanning.current && scaleVal.current > 1) {
                    // Pan when zoomed
                    const maxX = (scaleVal.current - 1) * W * 0.5;
                    const maxY = (scaleVal.current - 1) * H * 0.3;
                    const nx = touches[0].pageX - panStart.current.x;
                    const ny = touches[0].pageY - panStart.current.y;
                    const cx = Math.max(-maxX, Math.min(maxX, nx));
                    const cy = Math.max(-maxY, Math.min(maxY, ny));
                    panBase.current = { x: cx, y: cy };
                    translateX.setValue(cx);
                    translateY.setValue(cy);
                }
            },

            onPanResponderRelease: (e) => {
                pinchDist.current = null;
                isPanning.current = false;
                if (scaleVal.current < 1.05) resetZoom();
            },
        })
    ).current;

    return (
        <Animated.View
            style={{
                flex: 1,
                transform: [{ scale }, { translateX }, { translateY }],
            }}
            {...panResponder.panHandlers}
        >
            <Image
                source={{ uri }}
                style={{ width: W, flex: 1 }}
                resizeMode="contain"
            />
        </Animated.View>
    );
}

/* ── AI Inspect Panel ────────────────────────────────────────────── */
function InspectPanel({ loading, result, error, imagesCount, onRetry, onClose }: {
    loading: boolean; result: any; error?: string;
    imagesCount: number; onRetry: () => void; onClose: () => void;
}) {
    if (loading) {
        return (
            <View style={ip.wrap}>
                <View style={ip.handle} />
                <TouchableOpacity style={ip.closeRow} onPress={onClose} activeOpacity={0.8}>
                    <X size={20} color={C.textS} />
                </TouchableOpacity>
                <View style={{ alignItems: "center", padding: 24, gap: 14 }}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={ip.loadTitle}>
                        {imagesCount > 1
                            ? `AI is inspecting all ${imagesCount} listing photos…`
                            : "AI is inspecting this image…"}
                    </Text>
                    <Text style={ip.loadSub}>
                        {imagesCount > 1
                            ? "Synthesizing all angles, exterior, interior & condition"
                            : "Analysing condition, value & authenticity"}
                    </Text>
                    <View style={ip.loadBar}><View style={ip.loadBarFill} /></View>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={ip.wrap}>
                <View style={ip.handle} />
                <View style={{ alignItems: "center", padding: 24, gap: 12 }}>
                    <Text style={{ fontSize: 32 }}>⚠️</Text>
                    <Text style={[ip.loadTitle, { color: C.red }]}>Inspection failed</Text>
                    <Text style={ip.loadSub}>{error}</Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity style={ip.retryBtn} onPress={onRetry} activeOpacity={0.8}>
                            <Text style={ip.retryTxt}>Try Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[ip.retryBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]} onPress={onClose} activeOpacity={0.8}>
                            <Text style={[ip.retryTxt, { color: C.textS }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (!result) return null;

    const {
        condition, conditionScore = 5, conditionNotes,
        detectedItems = [], brand, model: productModel,
        highlights = [], concerns = [],
        estimatedValue, authenticity, authenticityNote,
        buyerTip, confidence = 0.8, imagesScanned,
    } = result;

    const itemLabel = [brand, productModel].filter(Boolean).join(" ") || (detectedItems[0] ?? "Item");
    const AuthIcon  = authenticity === "Appears genuine"      ? ShieldCheck
                    : authenticity === "Possibly counterfeit"  ? AlertTriangle
                    : HelpCircle;
    const authColor = authenticity === "Appears genuine"      ? C.green
                    : authenticity === "Possibly counterfeit"  ? C.red
                    : C.amber;

    return (
        <ScrollView style={ip.wrap} showsVerticalScrollIndicator={false} bounces={false}>
            <View style={ip.handle} />
            {/* Header */}
            <View style={ip.header}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Scan size={18} color={C.primary} />
                    <Text style={ip.headerTitle}>AI Inspection Report</Text>
                    <View style={ip.aiBadge}><Text style={ip.aiBadgeTxt}>AI</Text></View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {(imagesScanned ?? imagesCount) > 1 && (
                        <View style={ip.photoBadge}>
                            <Text style={ip.photoBadgeTxt}>📸 {imagesScanned ?? imagesCount} photos</Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={onClose} activeOpacity={0.8}><X size={20} color={C.textS} /></TouchableOpacity>
                </View>
            </View>
            {/* Score */}
            <View style={ip.scoreRow}>
                <ScoreRing score={conditionScore} />
                <View style={{ flex: 1 }}>
                    <Text style={ip.conditionLabel}>{condition}</Text>
                    {conditionNotes ? <Text style={ip.conditionNotes}>{conditionNotes}</Text> : null}
                </View>
            </View>
            {/* Chips */}
            <View style={ip.metaRow}>
                <View style={ip.metaChip}><Text style={ip.metaChipTxt}>🔍 {itemLabel}</Text></View>
                {estimatedValue && (
                    <View style={[ip.metaChip, { backgroundColor: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.3)" }]}>
                        <Text style={[ip.metaChipTxt, { color: C.green }]}>💰 {estimatedValue}</Text>
                    </View>
                )}
            </View>
            {/* Authenticity */}
            <View style={ip.authRow}>
                <AuthIcon size={16} color={authColor} />
                <View style={[ip.authBadge, { backgroundColor: authColor + "22", borderColor: authColor + "44" }]}>
                    <Text style={[ip.authBadgeTxt, { color: authColor }]}>{authenticity}</Text>
                </View>
                {authenticityNote && <Text style={ip.authNote}>{authenticityNote}</Text>}
            </View>
            {highlights.length > 0 && (
                <View style={ip.section}>
                    <Text style={[ip.sectionTitle, { color: C.green }]}>✦ Highlights</Text>
                    <View style={ip.chips}>
                        {highlights.map((h: string, i: number) => (
                            <View key={i} style={ip.hlChip}><Text style={ip.hlChipTxt}>✓ {h}</Text></View>
                        ))}
                    </View>
                </View>
            )}
            {concerns.length > 0 && (
                <View style={ip.section}>
                    <Text style={[ip.sectionTitle, { color: C.red }]}>⚠ Buyer Concerns</Text>
                    <View style={ip.chips}>
                        {concerns.map((c: string, i: number) => (
                            <View key={i} style={ip.cnChip}><Text style={ip.cnChipTxt}>⚡ {c}</Text></View>
                        ))}
                    </View>
                </View>
            )}
            {buyerTip && (
                <View style={ip.tipWrap}>
                    <Text style={{ fontSize: 18 }}>💡</Text>
                    <Text style={ip.tipTxt}><Text style={{ fontWeight: "800" }}>Buyer tip: </Text>{buyerTip}</Text>
                </View>
            )}
            <View style={ip.confWrap}>
                <Text style={ip.confLabel}>Confidence</Text>
                <View style={ip.confBar}>
                    <View style={[ip.confFill, { width: `${Math.round(confidence * 100)}%` as any }]} />
                </View>
                <Text style={ip.confPct}>{Math.round(confidence * 100)}%</Text>
            </View>
            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

const ip = StyleSheet.create({
    wrap:       { maxHeight: H * 0.70, backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16 },
    handle:     { width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 6 },
    closeRow:   { alignItems: "flex-end", paddingBottom: 4 },
    loadTitle:  { fontSize: 15, fontWeight: "700", color: C.textP, textAlign: "center" },
    loadSub:    { fontSize: 12, color: C.textS, textAlign: "center" },
    loadBar:    { width: "80%", height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" },
    loadBarFill: { width: "60%", height: "100%", backgroundColor: C.primary, borderRadius: 2 },
    retryBtn:   { backgroundColor: C.primary, borderRadius: 50, paddingHorizontal: 20, paddingVertical: 10 },
    retryTxt:   { fontSize: 13, fontWeight: "700", color: "#fff" },
    header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    headerTitle: { fontSize: 15, fontWeight: "800", color: C.textP },
    aiBadge:    { backgroundColor: C.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
    aiBadgeTxt: { fontSize: 10, fontWeight: "900", color: "#fff" },
    photoBadge: { backgroundColor: "rgba(99,102,241,0.2)", borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
    photoBadgeTxt: { fontSize: 11, fontWeight: "700", color: C.primary },
    scoreRow:   { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
    conditionLabel: { fontSize: 17, fontWeight: "900", color: C.textP, marginBottom: 4 },
    conditionNotes: { fontSize: 12, color: C.textS, lineHeight: 18 },
    metaRow:    { flexDirection: "row", gap: 8, paddingVertical: 12, flexWrap: "wrap", borderBottomWidth: 1, borderBottomColor: C.border },
    metaChip:   { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 50, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
    metaChipTxt: { fontSize: 12, fontWeight: "600", color: C.textP },
    authRow:    { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, flexWrap: "wrap" },
    authBadge:  { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
    authBadgeTxt: { fontSize: 12, fontWeight: "700" },
    authNote:   { fontSize: 11, color: C.textS, flex: 1, lineHeight: 16 },
    section:    { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 8 },
    chips:      { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    hlChip:     { backgroundColor: "rgba(16,185,129,0.15)", borderRadius: 50, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" },
    hlChipTxt:  { fontSize: 11, fontWeight: "600", color: C.green },
    cnChip:     { backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 50, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
    cnChipTxt:  { fontSize: 11, fontWeight: "600", color: C.red },
    tipWrap:    { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 12, padding: 12, marginVertical: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)" },
    tipTxt:     { fontSize: 13, color: C.textP, flex: 1, lineHeight: 19 },
    confWrap:   { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
    confLabel:  { fontSize: 12, color: C.textS, width: 70 },
    confBar:    { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" },
    confFill:   { height: "100%", backgroundColor: C.primary, borderRadius: 3 },
    confPct:    { fontSize: 12, color: C.textS, width: 36, textAlign: "right" },
});

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
interface Props {
    images: string[];
    initialIndex?: number;
    title?: string;
    open: boolean;
    onClose: () => void;
}

export default function PowerImageViewer({
    images, initialIndex = 0, title = "", open, onClose,
}: Props) {
    const insets = useSafeAreaInsets();

    const [imgIdx,     setImgIdx]     = useState(initialIndex);
    const [inspecting, setInspecting] = useState(false);
    const [aiLoading,  setAiLoading]  = useState(false);
    const [aiResult,   setAiResult]   = useState<any>(null);
    const [aiError,    setAiError]    = useState("");
    const flatRef = useRef<FlatList>(null);

    useEffect(() => {
        if (open) {
            setImgIdx(initialIndex);
            setInspecting(false);
            setAiResult(null);
            setAiError("");
            setAiLoading(false);
        }
    }, [open, initialIndex]);

    const runAiInspect = useCallback(async () => {
        if (aiLoading) return;
        setInspecting(true);
        setAiLoading(true);
        setAiResult(null);
        setAiError("");
        try {
            const res = await apiFetch("/api/ai/inspect-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: images.slice(0, 6), listingTitle: title }),
            });
            const data = await res.json();
            if (res.ok && data.inspection) {
                setAiResult(data.inspection);
            } else {
                setAiError(data.error || "AI inspection failed. Please try again.");
            }
        } catch {
            setAiError("Network error. Check your connection and try again.");
        } finally {
            setAiLoading(false);
        }
    }, [images, title, aiLoading]);

    const goTo = (idx: number) => {
        const next = Math.max(0, Math.min(images.length - 1, idx));
        setImgIdx(next);
        flatRef.current?.scrollToIndex({ index: next, animated: true });
    };

    if (!open) return null;

    /* Safe area heights */
    const topBarH    = insets.top + 52;       // status bar + top controls
    const thumbH     = images.length > 1 ? 72 : 0;   // thumbnail strip
    const bottomBarH = insets.bottom + 62;    // AI btn + phone nav

    return (
        <Modal
            visible={open}
            transparent={false}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: "#000" }}>

                {/* ── TOP BAR ────────────────────────────────────────────── */}
                <View style={[lv.topBar, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity style={lv.navBtn} onPress={onClose} activeOpacity={0.8}>
                        <X size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={lv.topTitle} numberOfLines={1}>{title}</Text>
                    {/* placeholder to center title */}
                    <View style={lv.navBtn} />
                </View>

                {/* ── IMAGES (fill remaining space) ──────────────────────── */}
                <FlatList
                    ref={flatRef}
                    data={images.length > 0 ? images : ["placeholder"]}
                    keyExtractor={(_, i) => String(i)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={initialIndex}
                    getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
                    style={{ flex: 1 }}
                    onMomentumScrollEnd={e => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / W);
                        setImgIdx(idx);
                    }}
                    renderItem={({ item }) => (
                        <View style={{ width: W, flex: 1, overflow: "hidden" }}>
                            {item === "placeholder" ? (
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 48 }}>📦</Text>
                                </View>
                            ) : (
                                <ZoomableImage uri={item} />
                            )}
                            {/* Watermark */}
                            <View style={lv.watermark}>
                                <View style={lv.watermarkDot} />
                                <Text style={lv.watermarkTxt}>POSTED ON{"\n"}RYTOK</Text>
                            </View>
                        </View>
                    )}
                />

                {/* Prev / Next arrows — float over images */}
                {images.length > 1 && (
                    <>
                        <TouchableOpacity style={[lv.arrow, { left: 12 }]} onPress={() => goTo(imgIdx - 1)} activeOpacity={0.8}>
                            <ChevronLeft size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[lv.arrow, { right: 12 }]} onPress={() => goTo(imgIdx + 1)} activeOpacity={0.8}>
                            <ChevronRight size={22} color="#fff" />
                        </TouchableOpacity>
                    </>
                )}

                {/* Counter */}
                {images.length > 1 && (
                    <View style={lv.counter}>
                        <Text style={lv.counterTxt}>{imgIdx + 1} / {images.length}</Text>
                    </View>
                )}

                {/* Pinch hint — shows briefly */}
                <View style={lv.hint} pointerEvents="none">
                    <Text style={lv.hintTxt}>Pinch to zoom · Double-tap to toggle</Text>
                </View>

                {/* ── THUMBNAIL STRIP ────────────────────────────────────── */}
                {images.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={lv.thumbStrip}
                        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
                    >
                        {images.map((src, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => goTo(i)}
                                activeOpacity={0.8}
                                style={[lv.thumb, i === imgIdx && lv.thumbActive]}
                            >
                                <Image source={{ uri: src }} style={lv.thumbImg} resizeMode="cover" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* ── AI INSPECT BUTTON ──────────────────────────────────── */}
                {/* paddingBottom uses insets.bottom so it sits above phone nav */}
                <View style={[lv.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
                    <TouchableOpacity
                        style={[lv.inspectBtn, aiLoading && { opacity: 0.7 }]}
                        onPress={() => {
                            if (inspecting && !aiLoading) {
                                setInspecting(false);
                            } else {
                                runAiInspect();
                            }
                        }}
                        activeOpacity={0.85}
                    >
                        <Scan size={18} color="#fff" />
                        <Text style={lv.inspectBtnTxt}>
                            {aiLoading        ? "Analyzing…"
                             : aiResult       ? "View AI Report"
                             : images.length > 1
                                 ? `AI Inspect (${Math.min(images.length, 6)} photos)`
                                 : "AI Inspect"}
                        </Text>
                        {images.length > 1 && !aiResult && (
                            <View style={lv.multiBadge}>
                                <Camera size={10} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── AI INSPECT PANEL (slides up from bottom) ────────────── */}
                {inspecting && (
                    <View style={StyleSheet.absoluteFill}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setInspecting(false)} activeOpacity={1} />
                        <View style={{ paddingBottom: insets.bottom }}>
                            <InspectPanel
                                loading={aiLoading}
                                result={aiResult}
                                error={aiError}
                                imagesCount={Math.min(images.length, 6)}
                                onRetry={runAiInspect}
                                onClose={() => setInspecting(false)}
                            />
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const lv = StyleSheet.create({
    topBar:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingBottom: 10, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 10 },
    navBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
    topTitle:    { flex: 1, fontSize: 13, fontWeight: "700", color: "#fff", textAlign: "center", paddingHorizontal: 8 },
    watermark:   { position: "absolute", bottom: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    watermarkDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6366F1" },
    watermarkTxt: { fontSize: 8, fontWeight: "800", color: "#fff", lineHeight: 11 },
    arrow:       { position: "absolute", top: "50%", marginTop: -20, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
    counter:     { position: "absolute", top: 60, right: 12, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
    counterTxt:  { fontSize: 12, fontWeight: "700", color: "#fff" },
    hint:        { position: "absolute", bottom: 150, left: 0, right: 0, alignItems: "center" },
    hintTxt:     { fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
    thumbStrip:  { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    thumb:       { width: 52, height: 52, borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "transparent", opacity: 0.55 },
    thumbActive: { borderColor: "#6366F1", opacity: 1 },
    thumbImg:    { width: "100%", height: "100%" },
    bottomBar:   { backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 14, paddingTop: 12 },
    inspectBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#6366F1", borderRadius: 14, paddingVertical: 14 },
    inspectBtnTxt: { fontSize: 14, fontWeight: "800", color: "#fff" },
    multiBadge:  { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 50, padding: 4 },
});
