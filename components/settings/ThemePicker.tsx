import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/stores/settingsStore';
import { ThemeMode } from '@/types';
import { t } from '@/constants/translations';

const themes: { value: ThemeMode; color: string; darkBorder: boolean }[] = [
  { value: 'light', color: '#FFFFFF', darkBorder: false },
  { value: 'warm', color: '#F5F5DC', darkBorder: false },
  { value: 'dark', color: '#1A1A2E', darkBorder: true },
];

export function ThemePicker() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const currentTheme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const labelKeys: Record<ThemeMode, string> = {
    light: 'themeLight',
    warm: 'themeWarm',
    dark: 'themeDark',
  };

  return (
    <View className="py-4">
      <Text
        className="text-base font-medium mb-4"
        style={{ color: colors.text }}
      >
        {t(lang, 'theme')}
      </Text>
      <View className="flex-row gap-4">
        {themes.map((theme) => {
          const isSelected = theme.value === currentTheme;
          return (
            <Pressable
              key={theme.value}
              onPress={() => setTheme(theme.value)}
              className="flex-1 items-center py-4 rounded-xl"
              style={{
                backgroundColor: colors.controlBg,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected
                  ? colors.accent
                  : colors.border,
              }}
            >
              <View
                className="w-10 h-10 rounded-full mb-2"
                style={{
                  backgroundColor: theme.color,
                  borderWidth: 1,
                  borderColor: theme.darkBorder ? '#555' : '#DDD',
                }}
              >
                {isSelected && (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.darkBorder ? '#FFF' : '#5D4037'}
                    />
                  </View>
                )}
              </View>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.text }}
              >
                {t(lang, labelKeys[theme.value])}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
