import { View, Text, Pressable } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function SegmentedControl({
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps) {
  const colors = useSettingsStore((s) => s.colors);

  return (
    <View
      className="flex-row rounded-xl overflow-hidden"
      style={{ backgroundColor: colors.controlBg }}
    >
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            className="flex-1 py-3 px-4 items-center justify-center"
            style={{
              backgroundColor: isSelected ? colors.accent : 'transparent',
              borderRadius: isSelected ? 10 : 0,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: isSelected ? '#FFFFFF' : colors.controlText,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
