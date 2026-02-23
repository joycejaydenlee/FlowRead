import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/stores/settingsStore';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'ghost';
  disabled?: boolean;
}

const sizes = {
  sm: { container: 40, icon: 18 },
  md: { container: 52, icon: 24 },
  lg: { container: 64, icon: 30 },
};

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  disabled = false,
}: IconButtonProps) {
  const colors = useSettingsStore((s) => s.colors);
  const s = sizes[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="items-center justify-center rounded-2xl"
      style={{
        width: s.container,
        height: s.container,
        backgroundColor:
          variant === 'filled' ? colors.accent : colors.controlBg,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Ionicons
        name={icon}
        size={s.icon}
        color={variant === 'filled' ? '#FFFFFF' : colors.controlText}
      />
    </Pressable>
  );
}
