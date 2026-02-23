import { router } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HistoryList } from '@/components/home/HistoryList';
import { t } from '@/constants/translations';
import { segmentText } from '@/services/textProcessor';
import { useReadingStore } from '@/stores/readingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { HistoryItem } from '@/types';

export default function HistoryScreen() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const setSentences = useReadingStore((s) => s.setSentences);
  const setActiveIndex = useReadingStore((s) => s.setActiveIndex);
  const addToHistory = useReadingStore((s) => s.addToHistory);

  const handleHistorySelect = (item: HistoryItem) => {
    const sentences = segmentText(item.text);
    if (sentences.length === 0) {
      Alert.alert('Error', t(lang, 'ocrFailed'));
      return;
    }
    setSentences(sentences, item.text);
    addToHistory(item.text, sentences.length);
    // Resume from saved progress
    const resumeIndex = Math.min(item.lastReadIndex, sentences.length - 1);
    if (resumeIndex > 0) {
      setActiveIndex(resumeIndex);
    }
    router.push('/reader');
  };

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
          {t(lang, 'history')}
        </Text>

        <HistoryList onSelectItem={handleHistorySelect} />
      </ScrollView>
    </SafeAreaView>
  );
}
