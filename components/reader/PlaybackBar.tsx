import { IconButton } from '@/components/ui/IconButton';
import { useReadingStore } from '@/stores/readingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlaybackBarProps {
  onPlayPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PlaybackBar({
  onPlayPause,
  onStop,
  onNext,
  onPrev,
}: PlaybackBarProps) {
  const colors = useSettingsStore((s) => s.colors);
  const playbackState = useReadingStore((s) => s.playbackState);
  const activeIndex = useReadingStore((s) => s.activeIndex);
  const sentences = useReadingStore((s) => s.sentences);
  const insets = useSafeAreaInsets();

  const isPlaying = playbackState === 'playing';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 16,
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom, 20),
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <Text
        className="text-xs text-center mb-3 font-medium"
        style={{ color: colors.textSecondary }}
      >
        {activeIndex + 1} / {sentences.length}
      </Text>
      <View className="flex-row justify-center items-center gap-4">
        <IconButton
          icon="play-skip-back"
          onPress={onPrev}
          size="md"
          disabled={activeIndex === 0}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          onPress={onPlayPause}
          size="lg"
          variant="filled"
        />
        <IconButton icon="stop" onPress={onStop} size="md" />
        <IconButton
          icon="play-skip-forward"
          onPress={onNext}
          size="md"
          disabled={activeIndex >= sentences.length - 1}
        />
      </View>
    </View>
  );
}
