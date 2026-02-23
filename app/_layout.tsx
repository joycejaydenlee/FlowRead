import "../global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSettingsStore } from "@/stores/settingsStore";
import { useReadingStore } from "@/stores/readingStore";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);
  const loadHistory = useReadingStore((s) => s.loadHistory);
  const loadProgress = useReadingStore((s) => s.loadProgress);

  useEffect(() => {
    Promise.all([loadSettings(), loadHistory(), loadProgress()]).then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-100">
        <ActivityIndicator size="large" color="#5D4037" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="reader" />
      <Stack.Screen name="settings" />
      <Stack.Screen
        name="focus"
        options={{ presentation: "fullScreenModal", animation: "fade" }}
      />
      <Stack.Screen
        name="camera"
        options={{ presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}
