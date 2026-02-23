import { useState, useRef } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSettingsStore } from '@/stores/settingsStore';
import { useReadingStore } from '@/stores/readingStore';
import { t } from '@/constants/translations';
import { recognizeImage } from '@/services/ocr';
import { segmentText } from '@/services/textProcessor';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function CameraScreen() {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const setSentences = useReadingStore((s) => s.setSentences);
  const addToHistory = useReadingStore((s) => s.addToHistory);

  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      const detectedText = await recognizeImage(photo.uri);
      const sentences = segmentText(detectedText);

      if (sentences.length === 0) {
        Alert.alert('Error', t(lang, 'ocrFailed'));
        setIsProcessing(false);
        return;
      }

      setSentences(sentences, detectedText);
      addToHistory(detectedText, sentences.length);
      router.replace('/reader');
    } catch (e: any) {
      console.error('Camera OCR error:', e);
      Alert.alert('Error', e.message || t(lang, 'ocrFailed'));
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (!permission) {
    return <View className="flex-1" style={{ backgroundColor: colors.background }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
        <Text className="text-lg mt-4 mb-6 text-center px-8" style={{ color: colors.text }}>
          Camera permission is required to scan text.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="py-3 px-8 rounded-xl"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-white font-semibold text-base">Grant Permission</Text>
        </Pressable>
        <Pressable onPress={handleClose} className="mt-4 py-2 px-6">
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            {t(lang, 'cancel')}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        className="flex-1"
        facing="back"
      >
        {/* Close Button */}
        <SafeAreaView>
          <Pressable
            onPress={handleClose}
            className="self-start ml-5 mt-2 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
        </SafeAreaView>

        {/* Guide Frame */}
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="w-full aspect-[4/3] rounded-2xl"
            style={{
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.6)',
              borderStyle: 'dashed',
            }}
          />
          <Text className="text-white text-base mt-4 font-medium text-center">
            {t(lang, 'cameraGuide')}
          </Text>
        </View>

        {/* Capture Button */}
        <SafeAreaView>
          <View className="items-center pb-8">
            <Pressable
              onPress={handleCapture}
              disabled={isProcessing}
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderWidth: 4,
                borderColor: 'white',
              }}
            >
              <View
                className="w-16 h-16 rounded-full"
                style={{ backgroundColor: 'white' }}
              />
            </Pressable>
          </View>
        </SafeAreaView>
      </CameraView>

      <LoadingOverlay visible={isProcessing} message={t(lang, 'loading')} />
    </View>
  );
}
