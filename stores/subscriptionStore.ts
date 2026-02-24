import { create } from 'zustand';
import { Platform } from 'react-native';
import Purchases, {
  type PurchasesOfferings,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'pro';

interface SubscriptionStore {
  isPro: boolean;
  isLoaded: boolean;
  initialize: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<'restored' | 'none' | 'error'>;
  checkStatus: () => Promise<void>;
}

function hasProEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPro: false,
  isLoaded: false,

  initialize: async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey || apiKey === 'your_revenuecat_api_key_here') {
        console.warn('RevenueCat API key not configured');
        set({ isLoaded: true });
        return;
      }

      Purchases.configure({ apiKey });
      const info = await Purchases.getCustomerInfo();
      set({ isPro: hasProEntitlement(info), isLoaded: true });
    } catch (e) {
      console.error('RevenueCat init error:', e);
      set({ isLoaded: true });
    }
  },

  purchase: async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPro = hasProEntitlement(customerInfo);
      set({ isPro });
      return isPro;
    } catch (e: any) {
      if (e.userCancelled) return false;
      console.error('Purchase error:', e);
      throw e;
    }
  },

  restore: async () => {
    try {
      const info = await Purchases.restorePurchases();
      const isPro = hasProEntitlement(info);
      set({ isPro });
      return isPro ? 'restored' : 'none';
    } catch (e) {
      console.error('Restore error:', e);
      return 'error';
    }
  },

  checkStatus: async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      set({ isPro: hasProEntitlement(info) });
    } catch (e) {
      console.error('Check status error:', e);
    }
  },
}));
