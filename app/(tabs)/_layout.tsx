import { Tabs } from "expo-router";
import { Home, Tag, PlusSquare, User } from "lucide-react-native";
import { colors } from "../../constants/theme";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBg,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 72,
                    paddingBottom: 12,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.tabActive,
                tabBarInactiveTintColor: colors.tabInactive,
                tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ title: "Home", tabBarIcon: ({ color }) => <Home size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="deals"
                options={{ title: "Deals", tabBarIcon: ({ color }) => <Tag size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="sell"
                options={{ title: "Sell", tabBarIcon: ({ color }) => <PlusSquare size={22} color={color} /> }}
            />
            <Tabs.Screen
                name="profile"
                options={{ title: "Profile", tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
            />
        </Tabs>
    );
}
