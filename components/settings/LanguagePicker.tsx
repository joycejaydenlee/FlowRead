import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { t } from '@/constants/translations';
import { useSettingsStore } from '@/stores/settingsStore';
import { InterfaceLanguage, VoiceLanguage } from '@/types';
import { Text, View } from 'react-native';

interface LanguagePickerProps {
  type: 'interface' | 'voice';
}

const interfaceOptions = [
  { label: '简体', value: 'zh-CN' },
  { label: '繁體', value: 'zh-HK' },
  { label: 'English', value: 'en-US' },
];

const voiceOptions = [
  { label: '普通話', value: 'zh-CN' },
  { label: '粵語', value: 'zh-HK' },
  { label: 'English', value: 'en-US' },
];

export function LanguagePicker({ type }: LanguagePickerProps) {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const voiceLang = useSettingsStore((s) => s.voiceLanguage);
  const setInterfaceLanguage = useSettingsStore((s) => s.setInterfaceLanguage);
  const setVoiceLanguage = useSettingsStore((s) => s.setVoiceLanguage);

  const isInterface = type === 'interface';
  const label = t(lang, isInterface ? 'interfaceLang' : 'voiceLang');
  const options = isInterface ? interfaceOptions : voiceOptions;
  const selectedValue = isInterface ? lang : voiceLang;
  const onSelect = isInterface
    ? (v: string) => setInterfaceLanguage(v as InterfaceLanguage)
    : (v: string) => setVoiceLanguage(v as VoiceLanguage);

  return (
    <View className="py-4">
      <Text
        className="text-base font-medium mb-3"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
      <SegmentedControl
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
      />
    </View>
  );
}
