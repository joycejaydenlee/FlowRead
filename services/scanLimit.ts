import AsyncStorage from '@react-native-async-storage/async-storage';

export const SCAN_LIMIT = 3;
export const AD_BONUS_PER_WATCH = 3;
export const AD_WATCH_LIMIT = 5;

const STORAGE_KEY_DATE = 'scanLimit_date';
const STORAGE_KEY_COUNT = 'scanLimit_count';
const STORAGE_KEY_BONUS = 'scanLimit_bonus';
const STORAGE_KEY_AD_COUNT = 'scanLimit_adWatchCount';

export interface ScanLimitValues {
  today: string;
  count: number;
  bonus: number;
  adCount: number;
}

export async function getTodayValues(): Promise<ScanLimitValues> {
  const today = new Date().toISOString().slice(0, 10);
  const results = await AsyncStorage.multiGet([
    STORAGE_KEY_DATE,
    STORAGE_KEY_COUNT,
    STORAGE_KEY_BONUS,
    STORAGE_KEY_AD_COUNT,
  ]);
  const date = results[0][1];
  const isToday = date === today;
  const values = {
    today,
    count: isToday ? parseInt(results[1][1] ?? '0', 10) : 0,
    bonus: isToday ? parseInt(results[2][1] ?? '0', 10) : 0,
    adCount: isToday ? parseInt(results[3][1] ?? '0', 10) : 0,
  };
  console.log('[ScanLimit] date:', date, 'isToday:', isToday, 'values:', values, 'SCAN_LIMIT:', SCAN_LIMIT);
  return values;
}

export async function incrementScanCount(): Promise<number> {
  const { today, count } = await getTodayValues();
  const newCount = count + 1;
  await AsyncStorage.multiSet([
    [STORAGE_KEY_DATE, today],
    [STORAGE_KEY_COUNT, String(newCount)],
  ]);
  return newCount;
}

export async function addAdBonus(
  currentBonus: number,
  currentAdCount: number,
): Promise<{ newBonus: number; newAdCount: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const newBonus = currentBonus + AD_BONUS_PER_WATCH;
  const newAdCount = currentAdCount + 1;
  await AsyncStorage.multiSet([
    [STORAGE_KEY_DATE, today],
    [STORAGE_KEY_BONUS, String(newBonus)],
    [STORAGE_KEY_AD_COUNT, String(newAdCount)],
  ]);
  return { newBonus, newAdCount };
}

export function isLimitReached(count: number, bonus: number): boolean {
  const reached = count >= SCAN_LIMIT + bonus;
  console.log('[ScanLimit] isLimitReached:', reached, `(${count} >= ${SCAN_LIMIT} + ${bonus})`);
  return reached;
}

export function remainingScans(count: number, bonus: number): number {
  return Math.max(0, SCAN_LIMIT + bonus - count);
}

export async function incrementScanCountBy(amount: number): Promise<number> {
  const { today, count } = await getTodayValues();
  const newCount = count + amount;
  await AsyncStorage.multiSet([
    [STORAGE_KEY_DATE, today],
    [STORAGE_KEY_COUNT, String(newCount)],
  ]);
  return newCount;
}
