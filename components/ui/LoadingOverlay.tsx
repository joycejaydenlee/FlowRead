import { View, Text, ActivityIndicator } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const colors = useSettingsStore((s) => s.colors);

  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 items-center justify-center z-50"
      style={{ backgroundColor: colors.overlay }}
    >
      <View
        className="rounded-3xl p-8 items-center min-w-[200px]"
        style={{ backgroundColor: colors.surface }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        {message && (
          <Text
            className="mt-4 text-base font-medium text-center"
            style={{ color: colors.text }}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}
