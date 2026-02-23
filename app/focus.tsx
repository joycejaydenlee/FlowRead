import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSettingsStore } from '@/stores/settingsStore';
import { useReadingStore } from '@/stores/readingStore';
import { useAutoPlay } from '@/hooks/useAutoPlay';
import { stopSpeech } from '@/services/tts';
import { t } from '@/constants/translations';
import { FocusCard } from '@/components/focus/FocusCard';
import { FocusControls } from '@/components/focus/FocusControls';

export default function FocusScreen() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const sentences = useReadingStore((s) => s.sentences);
  const activeIndex = useReadingStore((s) => s.activeIndex);
  const insets = useSafeAreaInsets();

  const { handlePlayPause, handleNext, handlePrev } = useAutoPlay();

  const handleClose = () => {
    stopSpeech();
    router.back();
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.background,
        paddingTop: Math.max(insets.top, 20),
        paddingBottom: insets.bottom,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-2">
        <Text
          className="text-xl font-bold"
          style={{ color: colors.text }}
        >
          {t(lang, 'focusMode')}
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.controlBg }}
          >
            <Ionicons name="settings-outline" size={18} color={colors.controlText} />
          </Pressable>
          <Pressable
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="py-3 px-6 rounded-full"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-sm font-semibold text-white">
              {t(lang, 'done')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Progress */}
      <View className="items-center mt-2">
        <Text
          className="text-sm font-medium"
          style={{ color: colors.textSecondary }}
        >
          {activeIndex + 1} / {sentences.length}
        </Text>
      </View>

      {/* Focus Card */}
      <FocusCard text={sentences[activeIndex] || '...'} />

      {/* Controls */}
      <FocusControls
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </View>
  );
}
