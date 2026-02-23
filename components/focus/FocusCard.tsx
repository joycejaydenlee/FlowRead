import { View, Text } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

interface FocusCardProps {
  text: string;
}

export function FocusCard({ text }: FocusCardProps) {
  const colors = useSettingsStore((s) => s.colors);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const lineHeightMultiplier = useSettingsStore((s) => s.lineHeightMultiplier);
  const letterSpacing = useSettingsStore((s) => s.letterSpacing);

  const focusFontSize = fontSize * 1.3;

  return (
    <View
      className="flex-1 mx-6 my-8 rounded-3xl items-center justify-center p-10"
      style={{
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      <Text
        className="text-center"
        style={{
          fontSize: focusFontSize,
          lineHeight: focusFontSize * lineHeightMultiplier,
          letterSpacing,
          color: colors.text,
          fontWeight: '600',
        }}
      >
        {text || '...'}
      </Text>
    </View>
  );
}
