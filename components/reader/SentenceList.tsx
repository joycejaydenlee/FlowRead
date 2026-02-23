import { useReadingStore } from '@/stores/readingStore';
import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { SentenceItem } from './SentenceItem';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface SentenceListProps {
  onTapSentence: (index: number) => void;
}

export function SentenceList({ onTapSentence }: SentenceListProps) {
  const sentences = useReadingStore((s) => s.sentences);
  const activeIndex = useReadingStore((s) => s.activeIndex);
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<Record<number, number>>({});
  const hasScrolledOnMount = useRef(false);

  const scrollToActive = useCallback((index: number) => {
    const y = layouts.current[index];
    if (y !== undefined && scrollRef.current) {
      const targetY = Math.max(0, y - SCREEN_HEIGHT / 2 + 170);
      scrollRef.current.scrollTo({ y: targetY, animated: true });
    }
  }, []);

  // Scroll on activeIndex change (playback navigation)
  useEffect(() => {
    scrollToActive(activeIndex);
  }, [activeIndex, scrollToActive]);

  // Delayed scroll on mount for resume case
  useEffect(() => {
    if (activeIndex > 0 && !hasScrolledOnMount.current) {
      const timer = setTimeout(() => {
        scrollToActive(activeIndex);
        hasScrolledOnMount.current = true;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, scrollToActive]);

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      {sentences.map((sentence, index) => (
        <SentenceItem
          key={index}
          text={sentence}
          isActive={index === activeIndex}
          onPress={() => onTapSentence(index)}
          onLayout={(y) => {
            layouts.current[index] = y;
          }}
        />
      ))}
      <View className="h-20" />
    </ScrollView>
  );
}
