import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  Pressable,
  Text,
  PanResponder,
  Modal,
  type LayoutChangeEvent,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/constants/translations';

const HANDLE_SIZE = 28;
const CORNER_THRESHOLD = 30;
const MIN_CROP_SIZE = 50;

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropEditorProps {
  visible: boolean;
  imageUri: string;
  onCancel: () => void;
  onConfirm: (croppedUri: string) => void;
}

function getHandle(touchX: number, touchY: number, c: CropRect): string {
  const corners = [
    { key: 'tl', x: c.x, y: c.y },
    { key: 'tr', x: c.x + c.width, y: c.y },
    { key: 'bl', x: c.x, y: c.y + c.height },
    { key: 'br', x: c.x + c.width, y: c.y + c.height },
  ];
  for (const corner of corners) {
    if (Math.abs(touchX - corner.x) < CORNER_THRESHOLD && Math.abs(touchY - corner.y) < CORNER_THRESHOLD) {
      return corner.key;
    }
  }
  // Check if inside crop rect for moving
  if (touchX >= c.x && touchX <= c.x + c.width && touchY >= c.y && touchY <= c.y + c.height) {
    return 'move';
  }
  return 'none';
}

function clampCrop(c: CropRect, maxW: number, maxH: number): CropRect {
  let { x, y, width, height } = c;
  width = Math.max(MIN_CROP_SIZE, width);
  height = Math.max(MIN_CROP_SIZE, height);
  x = Math.max(0, Math.min(x, maxW - width));
  y = Math.max(0, Math.min(y, maxH - height));
  width = Math.min(width, maxW - x);
  height = Math.min(height, maxH - y);
  return { x, y, width, height };
}

export function ImageCropEditor({ visible, imageUri, onCancel, onConfirm }: ImageCropEditorProps) {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);

  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [isApplying, setIsApplying] = useState(false);

  // Refs for PanResponder (avoids stale closures)
  const cropRef = useRef(crop);
  cropRef.current = crop;
  const layoutRef = useRef(imageLayout);
  layoutRef.current = imageLayout;
  const cropAtGrant = useRef<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const activeHandle = useRef('none');

  useEffect(() => {
    if (!imageUri || !visible) return;
    Image.getSize(imageUri, (w, h) => {
      setImageNaturalSize({ width: w, height: h });
    });
  }, [imageUri, visible]);

  const onImageLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setImageLayout({ width, height });
    layoutRef.current = { width, height };
    const margin = Math.min(width, height) * 0.1;
    const initial = { x: margin, y: margin, width: width - margin * 2, height: height - margin * 2 };
    setCrop(initial);
    cropRef.current = initial;
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          cropAtGrant.current = { ...cropRef.current };
          const { locationX, locationY } = e.nativeEvent;
          activeHandle.current = getHandle(locationX, locationY, cropRef.current);
        },
        onPanResponderMove: (_, g) => {
          const s = cropAtGrant.current;
          const h = activeHandle.current;
          const { width: maxW, height: maxH } = layoutRef.current;
          if (h === 'none' || maxW === 0) return;

          let next: CropRect;
          switch (h) {
            case 'tl':
              next = { x: s.x + g.dx, y: s.y + g.dy, width: s.width - g.dx, height: s.height - g.dy };
              break;
            case 'tr':
              next = { x: s.x, y: s.y + g.dy, width: s.width + g.dx, height: s.height - g.dy };
              break;
            case 'bl':
              next = { x: s.x + g.dx, y: s.y, width: s.width - g.dx, height: s.height + g.dy };
              break;
            case 'br':
              next = { x: s.x, y: s.y, width: s.width + g.dx, height: s.height + g.dy };
              break;
            default: // move
              next = { x: s.x + g.dx, y: s.y + g.dy, width: s.width, height: s.height };
              break;
          }
          const clamped = clampCrop(next, maxW, maxH);
          cropRef.current = clamped;
          setCrop(clamped);
        },
        onPanResponderRelease: () => {
          activeHandle.current = 'none';
        },
      }),
    [],
  );

  const handleApply = async () => {
    if (imageLayout.width === 0 || imageNaturalSize.width === 0) return;
    setIsApplying(true);
    try {
      const scaleX = imageNaturalSize.width / imageLayout.width;
      const scaleY = imageNaturalSize.height / imageLayout.height;
      const result = await ImageManipulator.manipulateAsync(imageUri, [
        {
          crop: {
            originX: Math.max(0, Math.round(crop.x * scaleX)),
            originY: Math.max(0, Math.round(crop.y * scaleY)),
            width: Math.max(1, Math.round(crop.width * scaleX)),
            height: Math.max(1, Math.round(crop.height * scaleY)),
          },
        },
      ]);
      onConfirm(result.uri);
    } catch (e) {
      console.error('Crop error:', e);
    } finally {
      setIsApplying(false);
    }
  };

  if (!visible) return null;

  const aspectRatio = imageNaturalSize.width / imageNaturalSize.height;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
          <Pressable onPress={onCancel} className="py-2 px-3">
            <Text className="text-white text-base">{t(lang, 'cancel')}</Text>
          </Pressable>
          <Text className="text-white text-lg font-semibold">{t(lang, 'cropTitle')}</Text>
          <Pressable onPress={handleApply} disabled={isApplying} className="py-2 px-3">
            <Text style={{ color: isApplying ? '#666' : colors.accent }} className="text-base font-semibold">
              {t(lang, 'cropConfirm')}
            </Text>
          </Pressable>
        </View>

        {/* Image + Crop Overlay */}
        <View className="flex-1 items-center justify-center px-4">
          <View style={{ width: '100%', aspectRatio, maxHeight: '80%' }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
              onLayout={onImageLayout}
            />

            {imageLayout.width > 0 && (
              <View
                {...panResponder.panHandlers}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              >
                {/* Dark overlays (4 rectangles around crop) */}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: crop.y, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                <View style={{ position: 'absolute', top: crop.y + crop.height, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                <View style={{ position: 'absolute', top: crop.y, left: 0, width: crop.x, height: crop.height, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                <View style={{ position: 'absolute', top: crop.y, left: crop.x + crop.width, right: 0, height: crop.height, backgroundColor: 'rgba(0,0,0,0.5)' }} />

                {/* Crop border with rule-of-thirds grid */}
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: crop.y,
                    left: crop.x,
                    width: crop.width,
                    height: crop.height,
                    borderWidth: 2,
                    borderColor: 'white',
                  }}
                >
                  <View style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <View style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <View style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <View style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                </View>

                {/* Corner handles (visual only — touch is handled by the overlay PanResponder) */}
                <CornerHandle x={crop.x} y={crop.y} />
                <CornerHandle x={crop.x + crop.width} y={crop.y} />
                <CornerHandle x={crop.x} y={crop.y + crop.height} />
                <CornerHandle x={crop.x + crop.width} y={crop.y + crop.height} />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CornerHandle({ x, y }: { x: number; y: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: y - HANDLE_SIZE / 2,
        left: x - HANDLE_SIZE / 2,
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        backgroundColor: 'white',
        borderRadius: HANDLE_SIZE / 2,
      }}
    />
  );
}
