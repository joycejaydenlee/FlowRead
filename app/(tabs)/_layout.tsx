import { useState } from "react";
import { Pressable } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSettingsStore } from "@/stores/settingsStore";
import { t } from "@/constants/translations";
import { SubscriptionModal } from "@/components/ui/SubscriptionModal";

const CROWN_COLOR = "#D2B48C";

export default function TabLayout() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const [isSubscriptionVisible, setIsSubscriptionVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 88,
            paddingBottom: 30,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t(lang, 'home'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t(lang, 'history'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t(lang, 'settings'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="subscription"
          options={{
            title: "Pro",
            tabBarIcon: () => <MaterialCommunityIcons name="crown" size={24} color={CROWN_COLOR} />,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
              color: CROWN_COLOR,
            },
            tabBarButton: (props) => (
              <Pressable
                style={props.style}
                onPress={() => setIsSubscriptionVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro"
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
      </Tabs>

      <SubscriptionModal
        visible={isSubscriptionVisible}
        onClose={() => setIsSubscriptionVisible(false)}
      />
    </>
  );
}
