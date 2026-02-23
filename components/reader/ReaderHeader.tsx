import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/stores/settingsStore';
import { useReadingStore } from '@/stores/readingStore';
import { t } from '@/constants/translations';

interface ReaderHeaderProps {
  onBack: () => void;
  onToggleAutoPlay: () => void;
  onFocusMode: () => void;
  onSettings: () => void;
}

export function ReaderHeader({
  onBack,
  onToggleAutoPlay,
  onFocusMode,
  onSettings,
}: ReaderHeaderProps) {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const isAutoPlay = useReadingStore((s) => s.isAutoPlay);

  return (
    <View
      className="flex-row items-center justify-between px-5 pt-2 pb-3"
      style={{
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable onPress={onBack} className="flex-row items-center py-2 pr-4">
        <Ionicons name="chevron-back" size={22} color={colors.accent} />
        <Text className="text-base ml-1" style={{ color: colors.accent }}>
          {t(lang, 'back')}
        </Text>
      </Pressable>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onToggleAutoPlay}
          className="flex-row items-center py-2 px-4 rounded-xl"
          style={{
            backgroundColor: isAutoPlay ? colors.accent : colors.controlBg,
          }}
        >
          <Ionicons
            name={isAutoPlay ? 'sync' : 'stop-circle-outline'}
            size={16}
            color={isAutoPlay ? '#FFFFFF' : colors.controlText}
          />
          <Text
            className="ml-2 text-sm font-semibold"
            style={{
              color: isAutoPlay ? '#FFFFFF' : colors.controlText,
            }}
          >
            {isAutoPlay ? t(lang, 'autoPlay') : t(lang, 'singlePlay')}
          </Text>
        </Pressable>

        <Pressable
          onPress={onFocusMode}
          className="py-2 px-4 rounded-xl"
          style={{ backgroundColor: colors.controlBg }}
        >
          <Ionicons name="eye-outline" size={18} color={colors.controlText} />
        </Pressable>

        <Pressable
          onPress={onSettings}
          className="py-2 px-4 rounded-xl"
          style={{ backgroundColor: colors.controlBg }}
        >
          <Ionicons name="settings-outline" size={18} color={colors.controlText} />
        </Pressable>
      </View>
    </View>
  );
}
