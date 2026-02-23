import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/stores/settingsStore';

interface StepperRowProps {
  label: string;
  value: string | number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
  maxValue?: number;
}

export function StepperRow({
  label,
  value,
  onIncrement,
  onDecrement,
  minValue = -Infinity,
  maxValue = Infinity,
}: StepperRowProps) {
  const colors = useSettingsStore((s) => s.colors);
  const numValue = Number(value);
  const isMin = numValue <= minValue;
  const isMax = numValue >= maxValue;

  return (
    <View className="flex-row items-center py-4">
      <Text
        className="flex-1 text-base font-medium"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onDecrement}
          disabled={isMin}
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{
            backgroundColor: colors.controlBg,
            opacity: isMin ? 0.3 : 1,
          }}
        >
          <Ionicons name="remove" size={20} color={colors.controlText} />
        </Pressable>
        <Text
          className="text-base font-bold w-14 text-center"
          style={{ color: colors.text }}
        >
          {value}
        </Text>
        <Pressable
          onPress={onIncrement}
          disabled={isMax}
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{
            backgroundColor: colors.controlBg,
            opacity: isMax ? 0.3 : 1,
          }}
        >
          <Ionicons name="add" size={20} color={colors.controlText} />
        </Pressable>
      </View>
    </View>
  );
}
