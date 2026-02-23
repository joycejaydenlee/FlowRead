import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputMethodCard } from '@/components/home/InputMethodCard';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { t } from '@/constants/translations';
import { recognizeImage } from '@/services/ocr';
import { extractPdfText } from '@/services/pdf';
import { segmentText } from '@/services/textProcessor';
import { useReadingStore } from '@/stores/readingStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function HomeScreen() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const setSentences = useReadingStore((s) => s.setSentences);
  const addToHistory = useReadingStore((s) => s.addToHistory);
  const savedSentences = useReadingStore((s) => s.sentences);
  const savedActiveIndex = useReadingStore((s) => s.activeIndex);
  const hasSavedProgress = savedSentences.length > 0;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const processAndNavigate = (text: string) => {
    const sentences = segmentText(text);
    if (sentences.length === 0) {
      Alert.alert('Error', t(lang, 'ocrFailed'));
      return;
    }
    setSentences(sentences, text);
    addToHistory(text, sentences.length);
    router.push('/reader');
  };

  const handleCamera = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument();

      if (scannedImages && scannedImages.length > 0) {
        setIsLoading(true);
        setLoadingMessage(t(lang, 'loading'));
        const detectedText = await recognizeImage(scannedImages[0]);
        processAndNavigate(detectedText);
      }
    } catch (e: any) {
      console.error('Document scanner error:', e);
      Alert.alert('Error', e.message || t(lang, 'ocrFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Photo library access is needed.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setIsLoading(true);
        setLoadingMessage(t(lang, 'loading'));
        const imageUri = result.assets[0].uri;
        const detectedText = await recognizeImage(imageUri);
        processAndNavigate(detectedText);
      }
    } catch (e: any) {
      console.error('Gallery OCR error:', e);
      Alert.alert('Error', e.message || t(lang, 'ocrFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setIsLoading(true);
        setLoadingMessage(t(lang, 'loading'));
        const { uri, name } = result.assets[0];
        const safeUri = FileSystem.cacheDirectory + name;
        await FileSystem.copyAsync({ from: uri, to: safeUri });

        const text = await extractPdfText(safeUri, (current, total) => {
          setLoadingMessage(t(lang, 'processing', { current, total }));
        });
        processAndNavigate(text);
      }
    } catch (e) {
      console.error('PDF error:', e);
      Alert.alert('Error', t(lang, 'pdfFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View className="items-center mt-8 mb-10">
          <Text
            className="text-4xl font-bold tracking-tight"
            style={{ color: colors.accent }}
          >
            FlowRead
          </Text>
          <Text
            className="text-base mt-2"
            style={{ color: colors.textSecondary }}
          >
            {lang === 'en-US'
              ? 'Read with focus and ease'
              : lang === 'zh-HK'
                ? '輕鬆專注閱讀'
                : '轻松专注阅读'}
          </Text>
        </View>

        {/* Resume Reading */}
        {hasSavedProgress && (
          <InputMethodCard
            icon="book-outline"
            title={lang === 'en-US' ? 'Resume Reading' : lang === 'zh-HK' ? '繼續閱讀' : '继续阅读'}
            description={
              lang === 'en-US'
                ? `${savedActiveIndex + 1} / ${savedSentences.length} sentences`
                : `${savedActiveIndex + 1} / ${savedSentences.length} 句`
            }
            onPress={() => router.push('/reader')}
          />
        )}

        {/* Input Methods */}
        <InputMethodCard
          icon="camera-outline"
          title={t(lang, 'camera')}
          description={t(lang, 'cameraDesc')}
          onPress={handleCamera}
        />
        <InputMethodCard
          icon="images-outline"
          title={t(lang, 'gallery')}
          description={t(lang, 'galleryDesc')}
          onPress={handleGallery}
        />
        <InputMethodCard
          icon="document-text-outline"
          title={t(lang, 'pdf')}
          description={t(lang, 'pdfDesc')}
          onPress={handlePdf}
        />

      </ScrollView>

      <LoadingOverlay visible={isLoading} message={loadingMessage} />
    </SafeAreaView>
  );
}
