import { useEffect, useState } from "react";
import { useRouter, usePathname } from "expo-router";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useApp } from "@/contexts/AppContext";
import { isOnboardingComplete } from "@/utils/onboardingStorage";

export function useSubscriptionGuard() {
  const { isSubscribed, loading } = useSubscription();
  const { settings } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  // Treat users with premiumEnabled in AppContext as subscribed
  const hasPremium = isSubscribed || settings?.premiumEnabled === true;

  useEffect(() => {
    isOnboardingComplete()
      .then(setOnboardingDone)
      .catch(() => setOnboardingDone(true));
  }, [pathname]);

  useEffect(() => {
    if (!loading && onboardingDone !== null && !hasPremium) {
      if (onboardingDone) {
        router.replace("/paywall");
      }
    }
  }, [hasPremium, loading, onboardingDone, router]);
}
