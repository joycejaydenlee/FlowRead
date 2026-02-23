import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/stores/settingsStore';

interface InputMethodCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}

export function InputMethodCard({
  icon,
  title,
  description,
  onPress,
}: InputMethodCardProps) {
  const colors = useSettingsStore((s) => s.colors);

  return (
    <Pressable
      onPress={onPress}
      className="w-full rounded-2xl p-5 mb-4 flex-row items-center"
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        className="w-14 h-14 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: colors.controlBg }}
      >
        <Ionicons name={icon} size={26} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text
          className="text-lg font-semibold mb-1"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
        <Text
          className="text-sm"
          style={{ color: colors.textSecondary }}
        >
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}
