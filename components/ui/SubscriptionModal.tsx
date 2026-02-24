import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Tv } from 'lucide-react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { t } from '@/constants/translations';
import { showRewardedAd } from '@/services/rewardedAd';

const COLORS = {
  bg: '#121212',
  card: '#1E1E1E',
  cardSelected: '#2A2318',
  accent: '#D2B48C',
  text: '#F5F5F5',
  textSecondary: '#A0A0A0',
  border: '#333333',
  borderSelected: '#D2B48C',
};

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdReward?: () => void;
  adWatchCount?: number;
  adWatchLimit?: number;
}

const FEATURES = [
  'featureUnlimitedScans',
  'featureBatchProcessing',
  'featurePremiumVoices',
  'featureAdFree',
] as const;

export function SubscriptionModal({
  visible,
  onClose,
  onAdReward,
  adWatchCount = 0,
  adWatchLimit = 5,
}: SubscriptionModalProps) {
  const lang = useSettingsStore((s) => s.interfaceLanguage);
  const purchase = useSubscriptionStore((s) => s.purchase);
  const restore = useSubscriptionStore((s) => s.restore);

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);

  const adLimitReached = adWatchCount >= adWatchLimit;
  const adsRemaining = adWatchLimit - adWatchCount;
  const showAdSection = onAdReward !== undefined;

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    Purchases.getOfferings()
      .then((offerings) => {
        const current = offerings.current;
        if (current) {
          setAnnualPkg(current.annual ?? null);
          setMonthlyPkg(current.monthly ?? null);
        }
      })
      .catch((e) => {
        console.error('Failed to fetch offerings:', e);
      })
      .finally(() => setIsLoading(false));
  }, [visible]);

  const selectedPkg = selectedPlan === 'annual' ? annualPkg : monthlyPkg;

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    setIsPurchasing(true);
    try {
      const success = await purchase(selectedPkg);
      if (success) onClose();
    } catch {
      Alert.alert('Error', t(lang, 'purchaseError'));
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    try {
      const result = await restore();
      if (result === 'restored') {
        Alert.alert('', t(lang, 'restoreSuccess'));
        onClose();
      } else if (result === 'none') {
        Alert.alert('', t(lang, 'restoreNone'));
      } else {
        Alert.alert('Error', t(lang, 'purchaseError'));
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleWatchAd = async () => {
    setIsAdLoading(true);
    try {
      const rewarded = await showRewardedAd();
      if (rewarded && onAdReward) {
        onAdReward();
      }
    } catch {
      Alert.alert('', t(lang, 'adLoadError'));
    } finally {
      setIsAdLoading(false);
    }
  };

  const annualMonthlyPrice = annualPkg
    ? `${annualPkg.product.currencyCode} ${(annualPkg.product.price / 12).toFixed(1)}`
    : '';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={{ alignSelf: 'flex-end', padding: 4, marginTop: 8 }}
          >
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 32 }}>
            <MaterialCommunityIcons name="crown" size={56} color={COLORS.accent} />
            <Text
              style={{
                color: COLORS.text,
                fontSize: 24,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 32,
              }}
            >
              {t(lang, 'unlockTitle')}
            </Text>
          </View>

          {/* Features List */}
          <View style={{ marginBottom: 32 }}>
            {FEATURES.map((key) => (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.accent}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '500' }}>
                  {t(lang, key)}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Cards or Loading */}
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                {/* Annual Card */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlan('annual')}
                  style={{
                    flex: 1,
                    backgroundColor: selectedPlan === 'annual' ? COLORS.cardSelected : COLORS.card,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: selectedPlan === 'annual' ? COLORS.borderSelected : COLORS.border,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: COLORS.accent,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      alignSelf: 'flex-start',
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ color: COLORS.bg, fontSize: 11, fontWeight: '700' }}>
                      {t(lang, 'bestValue')}
                    </Text>
                  </View>
                  <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 6 }}>
                    {t(lang, 'annual')}
                  </Text>
                  <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700' }}>
                    {annualPkg?.product.priceString ?? '—'}
                  </Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>
                    ≈ {annualMonthlyPrice}{t(lang, 'perMonth')}
                  </Text>
                </TouchableOpacity>

                {/* Monthly Card */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlan('monthly')}
                  style={{
                    flex: 1,
                    backgroundColor: selectedPlan === 'monthly' ? COLORS.cardSelected : COLORS.card,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: selectedPlan === 'monthly' ? COLORS.borderSelected : COLORS.border,
                  }}
                >
                  <View style={{ height: 25, marginBottom: 10 }} />
                  <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 6 }}>
                    {t(lang, 'monthly')}
                  </Text>
                  <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700' }}>
                    {monthlyPkg?.product.priceString ?? '—'}
                  </Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>
                    {t(lang, 'perMonth')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePurchase}
                disabled={isPurchasing || !selectedPkg}
                style={{
                  backgroundColor: isPurchasing ? COLORS.border : COLORS.accent,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color={COLORS.bg} />
                ) : (
                  <Text style={{ color: COLORS.bg, fontSize: 17, fontWeight: '700' }}>
                    {t(lang, 'upgradePro')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Trial Disclaimer */}
              {annualPkg && (
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                    textAlign: 'center',
                    lineHeight: 18,
                    marginBottom: 20,
                  }}
                >
                  {t(lang, 'freeTrial', { price: annualPkg.product.priceString })}
                </Text>
              )}

              {/* Watch Ad Section */}
              {showAdSection && (
                <>
                  {/* Divider with "or" */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginHorizontal: 16 }}>
                      {t(lang, 'orDivider')}
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
                  </View>

                  {/* Watch Ad Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleWatchAd}
                    disabled={isAdLoading || adLimitReached}
                    style={{
                      backgroundColor: COLORS.card,
                      borderRadius: 14,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderWidth: 1.5,
                      borderColor: adLimitReached ? COLORS.border : COLORS.accent,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      marginBottom: 8,
                      opacity: adLimitReached ? 0.5 : 1,
                    }}
                  >
                    {isAdLoading ? (
                      <ActivityIndicator size="small" color={COLORS.accent} />
                    ) : (
                      <>
                        <Tv size={20} color={COLORS.accent} />
                        <Text style={{ color: COLORS.accent, fontSize: 15, fontWeight: '600' }}>
                          {adLimitReached
                            ? t(lang, 'adLimitReached')
                            : t(lang, 'watchAdButton')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Ads remaining counter */}
                  {!adLimitReached && (
                    <Text
                      style={{
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textAlign: 'center',
                        marginBottom: 16,
                      }}
                    >
                      {t(lang, 'adsAvailable', { remaining: adsRemaining, total: adWatchLimit })}
                    </Text>
                  )}
                </>
              )}

              {/* Restore Purchase */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRestore}
                disabled={isPurchasing}
                style={{ alignItems: 'center', paddingVertical: 8 }}
              >
                <Text
                  style={{
                    color: COLORS.accent,
                    fontSize: 14,
                    fontWeight: '500',
                    textDecorationLine: 'underline',
                  }}
                >
                  {t(lang, 'restorePurchase')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
