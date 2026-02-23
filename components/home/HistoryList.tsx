import { t } from '@/constants/translations';
import { useReadingStore } from '@/stores/readingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { HistoryItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import { RenameDialog } from './RenameDialog';

interface HistoryListProps {
  onSelectItem: (item: HistoryItem) => void;
}

function HistoryRow({
  item,
  colors,
  isEditing,
  isSelected,
  onPress,
  onRename,
}: {
  item: HistoryItem;
  colors: any;
  isEditing: boolean;
  isSelected: boolean;
  onPress: () => void;
  onRename: () => void;
}) {
  const progress =
    item.totalSentences > 0
      ? Math.round((item.lastReadIndex / item.totalSentences) * 100)
      : 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={isEditing ? undefined : onRename}
      delayLongPress={500}
      style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 5,
      }}
    >
      {/* Left side: checkbox (editing) + icon + title */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
        {isEditing && (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: isSelected ? colors.accent : colors.textSecondary,
              backgroundColor: isSelected ? colors.accent : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
        )}
        <Ionicons
          name="document-text-outline"
          size={24}
          color={colors.accent}
          style={{ marginRight: 12 }}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 16,
          }}
        >
          {item.title}
        </Text>
      </View>

      {/* Right side: percentage + arrow */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.totalSentences > 0 && (
          <Text
            style={{
              color: colors.accent,
              fontSize: 14,
              fontWeight: 'bold',
            }}
          >
            {progress}%
          </Text>
        )}
        {!isEditing && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </Pressable>
  );
}

export function HistoryList({ onSelectItem }: HistoryListProps) {
  const colors = useSettingsStore((s) => s.colors);
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const history = useReadingStore((s) => s.history);
  const deleteMultipleHistory = useReadingStore((s) => s.deleteMultipleHistory);
  const renameHistory = useReadingStore((s) => s.renameHistory);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [renameItem, setRenameItem] = useState<HistoryItem | null>(null);

  if (history.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="time-outline" size={40} color={colors.textSecondary} />
        <Text
          className="mt-3 text-base"
          style={{ color: colors.textSecondary }}
        >
          {t(lang, 'noHistory')}
        </Text>
      </View>
    );
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;

    Alert.alert(
      t(lang, 'deleteConfirmTitle'),
      t(lang, 'deleteConfirmMsg', { count }),
      [
        { text: t(lang, 'cancel'), style: 'cancel' },
        {
          text: t(lang, 'delete'),
          style: 'destructive',
          onPress: () => {
            deleteMultipleHistory(Array.from(selectedIds));
            setSelectedIds(new Set());
            setIsEditing(false);
          },
        },
      ]
    );
  };

  const exitEditing = () => {
    setIsEditing(false);
    setSelectedIds(new Set());
  };

  return (
    <View style={{ width: '100%' }}>
      {/* Header with Edit/Done button */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 10 }}>
        <Pressable
          onPress={isEditing ? exitEditing : () => setIsEditing(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>
            {isEditing ? t(lang, 'done') : t(lang, 'edit')}
          </Text>
        </Pressable>
      </View>

      {/* List */}
      {history.map((item) => (
        <HistoryRow
          key={item.id}
          item={item}
          colors={colors}
          isEditing={isEditing}
          isSelected={selectedIds.has(item.id)}
          onPress={
            isEditing
              ? () => toggleSelect(item.id)
              : () => onSelectItem(item)
          }
          onRename={() => setRenameItem(item)}
        />
      ))}

      {/* Delete bar */}
      {isEditing && selectedIds.size > 0 && (
        <Pressable
          onPress={handleDeleteSelected}
          style={{
            marginTop: 12,
            backgroundColor: '#EF4444',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
            {t(lang, 'deleteCount', { count: selectedIds.size })}
          </Text>
        </Pressable>
      )}

      <RenameDialog
        visible={renameItem !== null}
        initialValue={renameItem?.title ?? ''}
        lang={lang}
        colors={colors}
        onCancel={() => setRenameItem(null)}
        onSave={(newTitle) => {
          if (renameItem) {
            renameHistory(renameItem.id, newTitle);
          }
          setRenameItem(null);
        }}
      />
    </View>
  );
}
