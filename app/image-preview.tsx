import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { useSettingsStore } from '@/stores/settingsStore';
import { useReadingStore } from '@/stores/readingStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { t } from '@/constants/translations';
import { recognizeImage } from '@/services/ocr';
import { segmentText } from '@/services/textProcessor';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { SubscriptionModal } from '@/components/ui/SubscriptionModal';
import { ImageCropEditor } from '@/components/ImageCropEditor';

const SCAN_LIMIT = 3;
const AD_BONUS_PER_WATCH = 3;
const AD_WATCH_LIMIT = 5;
const STORAGE_KEY_DATE = 'scanLimit_date';
const STORAGE_KEY_COUNT = 'scanLimit_count';
const STORAGE_KEY_BONUS = 'scanLimit_bonus';
const STORAGE_KEY_AD_COUNT = 'scanLimit_adWatchCount';

const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMB_SIZE = 80;

interface ImageItem {
  id: string;
  uri: string;
}

let nextId = 0;
function makeId(): string {
  return `img_${Date.now()}_${nextId++}`;
}

export default function ImagePreviewScreen() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const setSentences = useReadingStore((s) => s.setSentences);
  const addToHistory = useReadingStore((s) => s.addToHistory);

  const params = useLocalSearchParams<{ uris: string }>();
  const initialUris: string[] = params.uris ? JSON.parse(params.uris) : [];

  const [images, setImages] = useState<ImageItem[]>(() =>
    initialUris.map((uri) => ({ id: makeId(), uri })),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [bonusScans, setBonusScans] = useState(0);
  const [adWatchCount, setAdWatchCount] = useState(0);
  const [isSubscriptionVisible, setIsSubscriptionVisible] = useState(false);

  const isPro = useSubscriptionStore((s) => s.isPro);

  const getTodayValues = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const results = await AsyncStorage.multiGet([
      STORAGE_KEY_DATE,
      STORAGE_KEY_COUNT,
      STORAGE_KEY_BONUS,
      STORAGE_KEY_AD_COUNT,
    ]);
    const date = results[0][1];
    const isToday = date === today;
    return {
      today,
      count: isToday ? parseInt(results[1][1] ?? '0', 10) : 0,
      bonus: isToday ? parseInt(results[2][1] ?? '0', 10) : 0,
      adCount: isToday ? parseInt(results[3][1] ?? '0', 10) : 0,
    };
  };

  const checkScanLimit = async (): Promise<boolean> => {
    if (isPro) return true;

    const { count, bonus, adCount } = await getTodayValues();
    setScanCount(count);
    setBonusScans(bonus);
    setAdWatchCount(adCount);

    if (count >= SCAN_LIMIT + bonus) {
      setIsSubscriptionVisible(true);
      return false;
    }
    return true;
  };

  const incrementScanCount = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const newCount = scanCount + 1;
    await AsyncStorage.multiSet([
      [STORAGE_KEY_DATE, today],
      [STORAGE_KEY_COUNT, String(newCount)],
    ]);
    setScanCount(newCount);
  };

  const handleAdReward = async () => {
    const { today, bonus, adCount } = await getTodayValues();
    const newBonus = bonus + AD_BONUS_PER_WATCH;
    const newAdCount = adCount + 1;
    await AsyncStorage.multiSet([
      [STORAGE_KEY_DATE, today],
      [STORAGE_KEY_BONUS, String(newBonus)],
      [STORAGE_KEY_AD_COUNT, String(newAdCount)],
    ]);
    setBonusScans(newBonus);
    setAdWatchCount(newAdCount);

    const remaining = SCAN_LIMIT + newBonus - scanCount;
    Alert.alert('', t(lang, 'adRewardSuccess', { remaining }));
    setIsSubscriptionVisible(false);
  };

  const activeImage = images[activeIndex];

  const handleAddMore = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map((a) => ({ id: makeId(), uri: a.uri }));
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (e: any) {
      console.error('Add more images error:', e);
    }
  };

  const handleDelete = useCallback(
    (id: string) => {
      setImages((prev) => {
        const next = prev.filter((img) => img.id !== id);
        if (next.length === 0) {
          router.back();
          return prev;
        }
        // Adjust activeIndex if needed
        setActiveIndex((idx) => Math.min(idx, next.length - 1));
        return next;
      });
    },
    [],
  );

  const handleRotate = async () => {
    if (!activeImage) return;
    try {
      const result = await ImageManipulator.manipulateAsync(activeImage.uri, [{ rotate: 90 }]);
      setImages((prev) =>
        prev.map((img) => (img.id === activeImage.id ? { ...img, uri: result.uri } : img)),
      );
    } catch (e) {
      console.error('Rotate error:', e);
    }
  };

  const handleCropConfirm = (croppedUri: string) => {
    if (!activeImage) return;
    setImages((prev) =>
      prev.map((img) => (img.id === activeImage.id ? { ...img, uri: croppedUri } : img)),
    );
    setIsCropping(false);
  };

  const handleScanAll = async () => {
    if (images.length === 0) return;

    const allowed = await checkScanLimit();
    if (!allowed) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: images.length });

    const textParts: string[] = [];
    const failures: number[] = [];

    for (let i = 0; i < images.length; i++) {
      setProgress({ current: i + 1, total: images.length });
      try {
        const text = await recognizeImage(images[i].uri);
        textParts.push(text);
      } catch (e) {
        console.error(`OCR failed for image ${i + 1}:`, e);
        failures.push(i + 1);
      }
    }

    setIsProcessing(false);

    const combinedText = textParts.join('\n\n');
    if (combinedText.trim().length === 0) {
      Alert.alert('Error', t(lang, 'ocrFailed'));
      return;
    }

    const sentences = segmentText(combinedText);
    if (sentences.length === 0) {
      Alert.alert('Error', t(lang, 'ocrFailed'));
      return;
    }

    if (failures.length > 0) {
      Alert.alert(
        'Warning',
        lang === 'en-US'
          ? `${failures.length} image(s) failed OCR. Results from other images are shown.`
          : lang === 'zh-HK'
            ? `${failures.length} 張圖片辨識失敗，已顯示其餘結果。`
            : `${failures.length} 张图片识别失败，已显示其余结果。`,
      );
    }

    await incrementScanCount();
    setSentences(sentences, combinedText);
    addToHistory(combinedText, sentences.length);
    router.replace('/reader');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={handleBack} className="flex-row items-center">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
            <Text className="text-base ml-1" style={{ color: colors.text }}>
              {t(lang, 'back')}
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {t(lang, 'selectedImages', { count: images.length })}
          </Text>
          <Pressable onPress={handleAddMore} className="flex-row items-center">
            <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
            <Text className="text-sm ml-1" style={{ color: colors.accent }}>
              {t(lang, 'addMore')}
            </Text>
          </Pressable>
        </View>

        {/* Large Preview */}
        <View className="flex-1 items-center justify-center px-4">
          {activeImage && (
            <Image
              source={{ uri: activeImage.uri }}
              style={{ width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH - 32 }}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Action Row */}
        <View className="flex-row items-center justify-center gap-6 py-3">
          <Pressable onPress={handleRotate} className="items-center">
            <Ionicons name="refresh-outline" size={24} color={colors.text} />
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              {t(lang, 'rotate')}
            </Text>
          </Pressable>
          <Pressable onPress={() => setIsCropping(true)} className="items-center">
            <Ionicons name="crop-outline" size={24} color={colors.text} />
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              {t(lang, 'crop')}
            </Text>
          </Pressable>
        </View>

        {/* Thumbnail Strip */}
        <View className="py-3 px-4">
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item, index }) => (
              <Pressable onPress={() => setActiveIndex(index)}>
                <View
                  style={{
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: 8,
                    borderWidth: index === activeIndex ? 3 : 1,
                    borderColor: index === activeIndex ? colors.accent : colors.border,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                {/* Delete button */}
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={14} color="white" />
                </Pressable>
              </Pressable>
            )}
          />
        </View>

        {/* Scan All Button */}
        <View className="px-6 pb-4">
          <Pressable
            onPress={handleScanAll}
            disabled={isProcessing || images.length === 0}
            className="py-4 rounded-xl items-center"
            style={{
              backgroundColor: isProcessing ? colors.border : colors.accent,
            }}
          >
            <Text className="text-white text-lg font-semibold">
              {t(lang, 'scanAll')} ({images.length})
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isProcessing}
        message={t(lang, 'processingImage', { current: progress.current, total: progress.total })}
      />

      {/* Crop Editor */}
      {activeImage && (
        <ImageCropEditor
          visible={isCropping}
          imageUri={activeImage.uri}
          onCancel={() => setIsCropping(false)}
          onConfirm={handleCropConfirm}
        />
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={isSubscriptionVisible}
        onClose={() => setIsSubscriptionVisible(false)}
        onAdReward={handleAdReward}
        adWatchCount={adWatchCount}
        adWatchLimit={AD_WATCH_LIMIT}
      />
    </View>
  );
}
