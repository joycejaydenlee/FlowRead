import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/constants/translations';
import { LIMITS } from '@/constants/config';
import { ThemePicker } from '@/components/settings/ThemePicker';
import { LanguagePicker } from '@/components/settings/LanguagePicker';
import { StepperRow } from '@/components/ui/StepperRow';

export default function SettingsScreen() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const lineHeightMultiplier = useSettingsStore((s) => s.lineHeightMultiplier);
  const letterSpacing = useSettingsStore((s) => s.letterSpacing);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setLineHeight = useSettingsStore((s) => s.setLineHeightMultiplier);
  const setLetterSpacing = useSettingsStore((s) => s.setLetterSpacing);
  const setSpeechRate = useSettingsStore((s) => s.setSpeechRate);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-2xl font-bold mb-6"
          style={{ color: colors.text }}
        >
          {t(lang, 'settingsTitle')}
        </Text>

        {/* Theme */}
        <ThemePicker />

        {/* Divider */}
        <View className="h-px my-2" style={{ backgroundColor: colors.border }} />

        {/* Interface Language */}
        <LanguagePicker type="interface" />

        {/* Voice Language */}
        <LanguagePicker type="voice" />

        {/* Divider */}
        <View className="h-px my-2" style={{ backgroundColor: colors.border }} />

        {/* Reading Settings */}
        <Text
          className="text-sm font-bold mt-4 mb-1 uppercase tracking-wider"
          style={{ color: colors.textSecondary }}
        >
          {lang === 'en-US' ? 'Reading Preferences' : '閱讀偏好'}
        </Text>

        <StepperRow
          label={t(lang, 'fontSize')}
          value={fontSize}
          onIncrement={() =>
            setFontSize(Math.min(LIMITS.MAX_FONT_SIZE, fontSize + LIMITS.FONT_SIZE_STEP))
          }
          onDecrement={() =>
            setFontSize(Math.max(LIMITS.MIN_FONT_SIZE, fontSize - LIMITS.FONT_SIZE_STEP))
          }
          minValue={LIMITS.MIN_FONT_SIZE}
          maxValue={LIMITS.MAX_FONT_SIZE}
        />

        <StepperRow
          label={t(lang, 'lineHeight')}
          value={lineHeightMultiplier.toFixed(1)}
          onIncrement={() =>
            setLineHeight(
              Math.min(
                LIMITS.MAX_LINE_HEIGHT,
                +(lineHeightMultiplier + LIMITS.LINE_HEIGHT_STEP).toFixed(1)
              )
            )
          }
          onDecrement={() =>
            setLineHeight(
              Math.max(
                LIMITS.MIN_LINE_HEIGHT,
                +(lineHeightMultiplier - LIMITS.LINE_HEIGHT_STEP).toFixed(1)
              )
            )
          }
          minValue={LIMITS.MIN_LINE_HEIGHT}
          maxValue={LIMITS.MAX_LINE_HEIGHT}
        />

        <StepperRow
          label={t(lang, 'letterSpacing')}
          value={letterSpacing}
          onIncrement={() =>
            setLetterSpacing(
              Math.min(LIMITS.MAX_LETTER_SPACING, letterSpacing + LIMITS.LETTER_SPACING_STEP)
            )
          }
          onDecrement={() =>
            setLetterSpacing(
              Math.max(LIMITS.MIN_LETTER_SPACING, letterSpacing - LIMITS.LETTER_SPACING_STEP)
            )
          }
          minValue={LIMITS.MIN_LETTER_SPACING}
          maxValue={LIMITS.MAX_LETTER_SPACING}
        />

        <StepperRow
          label={t(lang, 'speechRate')}
          value={speechRate.toFixed(1)}
          onIncrement={() =>
            setSpeechRate(
              Math.min(
                LIMITS.MAX_SPEECH_RATE,
                +(speechRate + LIMITS.SPEECH_RATE_STEP).toFixed(1)
              )
            )
          }
          onDecrement={() =>
            setSpeechRate(
              Math.max(
                LIMITS.MIN_SPEECH_RATE,
                +(speechRate - LIMITS.SPEECH_RATE_STEP).toFixed(1)
              )
            )
          }
          minValue={LIMITS.MIN_SPEECH_RATE}
          maxValue={LIMITS.MAX_SPEECH_RATE}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
