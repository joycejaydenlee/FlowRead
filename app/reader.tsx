import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSettingsStore } from '@/stores/settingsStore';
import { useAutoPlay } from '@/hooks/useAutoPlay';
import { stopSpeech } from '@/services/tts';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
import { SentenceList } from '@/components/reader/SentenceList';
import { PlaybackBar } from '@/components/reader/PlaybackBar';

export default function ReaderScreen() {
  const colors = useSettingsStore((s) => s.colors);
  const {
    handlePlayPause,
    handleStop,
    handleNext,
    handlePrev,
    handleTapSentence,
    toggleAutoPlay,
  } = useAutoPlay();

  const handleBack = () => {
    stopSpeech();
    router.back();
  };

  const handleFocusMode = () => {
    router.push('/focus');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background }}>
      <ReaderHeader
        onBack={handleBack}
        onToggleAutoPlay={toggleAutoPlay}
        onFocusMode={handleFocusMode}
        onSettings={handleSettings}
      />
      <View className="flex-1">
        <SentenceList onTapSentence={handleTapSentence} />
        <PlaybackBar
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </View>
    </SafeAreaView>
  );
}
