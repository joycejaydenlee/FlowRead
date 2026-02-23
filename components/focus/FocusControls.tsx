import { View } from 'react-native';
import { IconButton } from '@/components/ui/IconButton';
import { useReadingStore } from '@/stores/readingStore';

interface FocusControlsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FocusControls({
  onPlayPause,
  onNext,
  onPrev,
}: FocusControlsProps) {
  const playbackState = useReadingStore((s) => s.playbackState);
  const activeIndex = useReadingStore((s) => s.activeIndex);
  const sentences = useReadingStore((s) => s.sentences);
  const isPlaying = playbackState === 'playing';

  return (
    <View className="flex-row justify-center items-center gap-6 pb-12 px-6">
      <IconButton
        icon="play-skip-back"
        onPress={onPrev}
        size="lg"
        disabled={activeIndex === 0}
      />
      <IconButton
        icon={isPlaying ? 'pause' : 'play'}
        onPress={onPlayPause}
        size="lg"
        variant="filled"
      />
      <IconButton
        icon="play-skip-forward"
        onPress={onNext}
        size="lg"
        disabled={activeIndex >= sentences.length - 1}
      />
    </View>
  );
}
