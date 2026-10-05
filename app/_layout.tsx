import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Root layout.
 * SafeAreaProvider MUST wrap everything so SafeAreaView
 * correctly reads device top (status bar) and bottom (gesture nav) insets.
 * Without this, SafeAreaView edges={['top']} has no effect:
 *  - Headers overlap status bar icons (battery, network)
 *  - Bottom tab bar overlaps phone navigation buttons
 */
export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth/register" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="listings/[id]" />
                <Stack.Screen name="category/[slug]" />
            </Stack>
        </SafeAreaProvider>
    );
}
