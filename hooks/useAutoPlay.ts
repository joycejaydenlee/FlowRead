import { useRef, useCallback, useEffect } from 'react';
import { useReadingStore } from '@/stores/readingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { speakSentence, detectLanguageForSpeech, stopSpeech, pauseSpeech, resumeSpeech } from '@/services/tts';

export function useAutoPlay() {
  const sentences = useReadingStore((s) => s.sentences);
  const activeIndex = useReadingStore((s) => s.activeIndex);
  const isAutoPlay = useReadingStore((s) => s.isAutoPlay);
  const playbackState = useReadingStore((s) => s.playbackState);
  const setActiveIndex = useReadingStore((s) => s.setActiveIndex);
  const setPlaybackState = useReadingStore((s) => s.setPlaybackState);
  const setAutoPlay = useReadingStore((s) => s.setAutoPlay);
  const nextSentence = useReadingStore((s) => s.nextSentence);

  const voiceLanguage = useSettingsStore((s) => s.voiceLanguage);
  const speechRate = useSettingsStore((s) => s.speechRate);

  const autoPlayRef = useRef(isAutoPlay);
  const activeIndexRef = useRef(activeIndex);
  const isChangingRef = useRef(false);

  useEffect(() => {
    autoPlayRef.current = isAutoPlay;
  }, [isAutoPlay]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const speak = useCallback(
    (index: number, autoChain: boolean = isAutoPlay) => {
      if (index < 0 || index >= sentences.length) {
        setAutoPlay(false);
        setPlaybackState('stopped');
        return;
      }

      const sentence = sentences[index];
      const lang = detectLanguageForSpeech(sentence, voiceLanguage);

      setActiveIndex(index);
      setPlaybackState('playing');

      speakSentence(sentence, {
        language: lang,
        rate: speechRate,
        onDone: () => {
          if (
            !isChangingRef.current &&
            autoChain &&
            autoPlayRef.current &&
            activeIndexRef.current === index
          ) {
            // Auto-advance to next sentence
            const next = index + 1;
            if (next < sentences.length) {
              speak(next, true);
            } else {
              setPlaybackState('stopped');
              setAutoPlay(false);
            }
          }
        },
      });
    },
    [sentences, voiceLanguage, speechRate, isAutoPlay, setActiveIndex, setPlaybackState, setAutoPlay]
  );

  const handlePlayPause = useCallback(async () => {
    if (playbackState === 'playing') {
      await pauseSpeech();
      setPlaybackState('paused');
    } else if (playbackState === 'paused') {
      await resumeSpeech();
      setPlaybackState('playing');
    } else {
      setAutoPlay(true);
      speak(activeIndex, true);
    }
  }, [playbackState, activeIndex, speak, setPlaybackState, setAutoPlay]);

  const handleStop = useCallback(() => {
    stopSpeech();
    setAutoPlay(false);
    setPlaybackState('stopped');
  }, [setAutoPlay, setPlaybackState]);

  const handleNext = useCallback(() => {
    const next = activeIndex + 1;
    if (next < sentences.length) {
      speak(next, isAutoPlay);
    }
  }, [activeIndex, sentences.length, isAutoPlay, speak]);

  const handlePrev = useCallback(() => {
    const prev = activeIndex - 1;
    if (prev >= 0) {
      speak(prev, isAutoPlay);
    }
  }, [activeIndex, isAutoPlay, speak]);

  const handleTapSentence = useCallback(
    (index: number) => {
      speak(index, isAutoPlay);
    },
    [isAutoPlay, speak]
  );

  const toggleAutoPlay = useCallback(() => {
    const newAuto = !isAutoPlay;
    setAutoPlay(newAuto);
    if (newAuto && playbackState !== 'playing') {
      speak(activeIndex, true);
    }
  }, [isAutoPlay, playbackState, activeIndex, speak, setAutoPlay]);

  return {
    speak,
    handlePlayPause,
    handleStop,
    handleNext,
    handlePrev,
    handleTapSentence,
    toggleAutoPlay,
  };
}
