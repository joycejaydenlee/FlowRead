import { Modal, View, Text, Pressable } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/constants/translations';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.overlay }}
      >
        <View
          className="w-full rounded-3xl p-8 items-center"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-4xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-center mb-3" style={{ color: colors.text }}>
            {t(lang, 'scanLimitTitle')}
          </Text>
          <Text
            className="text-base text-center mb-8 leading-6"
            style={{ color: colors.textSecondary }}
          >
            {t(lang, 'scanLimitBody')}
          </Text>

          <Pressable
            onPress={onClose}
            className="w-full py-4 rounded-xl items-center mb-3"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-white text-base font-semibold">
              {t(lang, 'upgradePro')}
            </Text>
          </Pressable>

          <Pressable onPress={onClose} className="py-2">
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              {t(lang, 'maybeLater')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
