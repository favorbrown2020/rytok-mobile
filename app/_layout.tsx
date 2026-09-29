import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0b0e1a" } }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth/register" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="listings/[id]" />
            </Stack>
        </>
    );
}
