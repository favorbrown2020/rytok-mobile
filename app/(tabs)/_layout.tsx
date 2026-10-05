import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Home, Store, MessageCircle, User, Plus
} from "lucide-react-native";

/* ── Theme (matches web globals.css) ──────────────────────────── */
const PRIMARY   = "#6366F1";
const PRIMARY_D = "#4F46E5";
const INACTIVE  = "#94A3B8";
const TAB_BG    = "#1E1B4B";   // deep indigo — matches web mobile dark nav
const BORDER    = "transparent";

/* ── Elevated centre "Sell" button ─────────────────────────────── */
function SellTabIcon({ focused }: { focused: boolean }) {
    return (
        <View style={styles.sellWrap}>
            <View style={[styles.sellCircle, focused && styles.sellCircleFocused]}>
                <Plus size={26} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={styles.sellLabel}>Sell</Text>
        </View>
    );
}

/* ── Normal tab icon ────────────────────────────────────────────── */
function TabIcon({
    Icon, label, focused,
}: {
    Icon: any; label: string; focused: boolean;
}) {
    return (
        <View style={styles.tabItem}>
            <Icon
                size={22}
                color={focused ? PRIMARY : INACTIVE}
                strokeWidth={focused ? 2.2 : 1.8}
            />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {label}
            </Text>
        </View>
    );
}

/* ══════════════════════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════════════════════ */
export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const barHeight = 60 + insets.bottom;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: TAB_BG,
                    borderTopColor:  BORDER,
                    borderTopWidth:  0,
                    height:          barHeight,
                    paddingBottom:   insets.bottom,
                    paddingTop:      0,
                    elevation:       20,
                    shadowColor:     "#000",
                    shadowOffset:    { width: 0, height: -4 },
                    shadowOpacity:   0.25,
                    shadowRadius:    12,
                },
                tabBarActiveTintColor:   PRIMARY,
                tabBarInactiveTintColor: INACTIVE,
                // hide default label — we render our own inside the icon
                tabBarShowLabel: false,
            }}
        >
            {/* 1 — Home */}
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon Icon={Home} label="Home" focused={focused} />
                    ),
                }}
            />

            {/* 2 — Shop */}
            <Tabs.Screen
                name="shop"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon Icon={Store} label="Shop" focused={focused} />
                    ),
                }}
            />

            {/* 3 — Sell (centre elevated) */}
            <Tabs.Screen
                name="sell"
                options={{
                    tabBarIcon: ({ focused }) => <SellTabIcon focused={focused} />,
                    tabBarItemStyle: {
                        // lift the button above the bar
                        marginBottom: Platform.OS === "ios" ? 20 : 26,
                    },
                    tabBarStyle: { display: "none" },
                }}
            />

            {/* 4 — Messages */}
            <Tabs.Screen
                name="messages"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon Icon={MessageCircle} label="Messages" focused={focused} />
                    ),
                }}
            />

            {/* 5 — Account (Profile) */}
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon Icon={User} label="Account" focused={focused} />
                    ),
                }}
            />

            {/* Hidden screens (not in nav bar) */}
            <Tabs.Screen name="deals"  options={{ href: null }} />
        </Tabs>
    );
}

/* ── Styles ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
    /* Normal tab item */
    tabItem:       { alignItems: "center", justifyContent: "center", gap: 3, paddingTop: 8 },
    tabLabel:      { fontSize: 10, fontWeight: "600", color: INACTIVE },
    tabLabelActive: { color: PRIMARY, fontWeight: "700" },

    /* Sell button */
    sellWrap:         { alignItems: "center", justifyContent: "center", gap: 4 },
    sellCircle:       {
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: PRIMARY,
        alignItems: "center", justifyContent: "center",
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.55,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 3,
        borderColor: "#312e81",
    },
    sellCircleFocused: {
        backgroundColor: PRIMARY_D,
        shadowOpacity: 0.7,
    },
    sellLabel: { fontSize: 10, fontWeight: "700", color: "#fff" },
});
