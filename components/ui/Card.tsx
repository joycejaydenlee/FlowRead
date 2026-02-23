import { View } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  const colors = useSettingsStore((s) => s.colors);

  return (
    <View
      className={`rounded-2xl p-5 ${className}`}
      style={{
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}
