import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const colors = useSettingsStore((s) => s.colors);

  const bgColor =
    variant === 'primary'
      ? colors.accent
      : variant === 'secondary'
        ? colors.controlBg
        : 'transparent';

  const textColor =
    variant === 'primary' ? '#FFFFFF' : colors.controlText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-2xl items-center justify-center py-4 px-6 ${className}`}
      style={[
        { backgroundColor: bgColor, opacity: disabled ? 0.4 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          className="text-base font-semibold"
          style={{ color: textColor }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
