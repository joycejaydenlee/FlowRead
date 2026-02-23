import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, Platform } from 'react-native';

interface RenameDialogProps {
  visible: boolean;
  initialValue: string;
  lang: string;
  colors: any;
  onCancel: () => void;
  onSave: (newTitle: string) => void;
}

export function RenameDialog({
  visible,
  initialValue,
  lang,
  colors,
  onCancel,
  onSave,
}: RenameDialogProps) {
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      onShow={() => setValue(initialValue)}
    >
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 320,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              },
              android: { elevation: 8 },
            }),
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 16,
            }}
          >
            {lang === 'en-US' ? 'Rename' : lang === 'zh-HK' ? '重新命名' : '重命名'}
          </Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            selectTextOnFocus
            style={{
              color: colors.text,
              backgroundColor: colors.controlBg,
              borderRadius: 10,
              padding: 12,
              fontSize: 15,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={onCancel}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>
                {lang === 'en-US' ? 'Cancel' : '取消'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                backgroundColor: colors.accent,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {lang === 'en-US' ? 'Save' : lang === 'zh-HK' ? '儲存' : '保存'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
