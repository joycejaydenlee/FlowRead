import { Pressable, Text } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

interface SentenceItemProps {
  text: string;
  isActive: boolean;
  onPress: () => void;
  onLayout?: (y: number) => void;
}

export function SentenceItem({
  text,
  isActive,
  onPress,
  onLayout,
}: SentenceItemProps) {
  const colors = useSettingsStore((s) => s.colors);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const lineHeightMultiplier = useSettingsStore((s) => s.lineHeightMultiplier);
  const letterSpacing = useSettingsStore((s) => s.letterSpacing);

  return (
    <Pressable
      onPress={onPress}
      onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}
      className="mb-4 py-1 px-2 rounded-lg"
      style={({ pressed }) => ({
        backgroundColor: isActive
          ? `${colors.accent}15`
          : pressed
            ? `${colors.accent}08`
            : 'transparent',
      })}
    >
      <Text
        style={{
          fontSize,
          lineHeight: fontSize * lineHeightMultiplier,
          letterSpacing,
          color: colors.text,
          opacity: isActive ? 1 : 0.3,
          fontWeight: isActive ? '700' : '400',
        }}
      >
        {text}
      </Text>
    </Pressable>
  );
}
