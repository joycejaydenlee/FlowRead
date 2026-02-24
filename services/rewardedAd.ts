import { Platform } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Use Google's official test ad unit IDs
const AD_UNIT_ID = Platform.select({
  ios: TestIds.REWARDED,
  android: TestIds.REWARDED,
}) as string;

/**
 * Load and show a rewarded ad.
 * Resolves `true` if the user earned the reward, `false` if dismissed without reward.
 * Rejects on load errors (no fill, network, etc).
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const rewarded = RewardedAd.createForAdRequest(AD_UNIT_ID);

    const onLoaded = () => {
      cleanup();
      // Ad loaded — now show it and listen for reward/close
      const showCleanup = setupShowListeners();

      function setupShowListeners() {
        let rewarded_ = false;

        const earnedUnsub = rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            rewarded_ = true;
          },
        );

        const closedUnsub = rewarded.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            earnedUnsub();
            closedUnsub();
            resolve(rewarded_);
          },
        );

        return () => {
          earnedUnsub();
          closedUnsub();
        };
      }

      rewarded.show();
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const loadedUnsub = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      onLoaded,
    );

    const errorUnsub = rewarded.addAdEventListener(
      AdEventType.ERROR,
      onError,
    );

    function cleanup() {
      loadedUnsub();
      errorUnsub();
    }

    rewarded.load();
  });
}
