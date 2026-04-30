
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import {
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments, usePathname, Redirect } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { isOnboardingComplete } from "@/utils/onboardingStorage";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    isOnboardingComplete().then((complete) => {
      setOnboardingComplete(complete);
    });
  }, [pathname]);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        let seen = 'false';
        if (Platform.OS === 'web') {
          seen = localStorage.getItem('hasSeenOnboarding') || 'false';
        } else {
          seen = await SecureStore.getItemAsync('hasSeenOnboarding') || 'false';
        }
        
        const hasSeen = seen === 'true';
        setHasSeenOnboarding(hasSeen);
        console.log('Has seen onboarding:', hasSeen);
        
        // If user has seen onboarding and is on index, redirect to home
        if (hasSeen && segments[0] === 'index') {
          console.log('Redirecting to home (onboarding already seen)');
          router.replace('/(tabs)/(home)');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasSeenOnboarding(false);
      }
    }
    
    checkOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  return (
    <SubscriptionProvider>
      {onboardingComplete === false && pathname !== "/auth" && pathname !== "/paywall" && pathname !== "/auth-popup" && pathname !== "/auth-callback" && (
        <Redirect href="/onboarding" />
      )}
      <SubscriptionRedirect />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SubscriptionProvider>
  );
}


function SubscriptionRedirect() {
  const { isSubscribed, loading } = useSubscription();
  const { settings } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  // If the user has premium enabled via AppContext (e.g. promo code or previous purchase),
  // treat them as subscribed so they are not redirected to the paywall.
  const hasPremium = isSubscribed || settings?.premiumEnabled === true;

  useEffect(() => {
    if (loading) return;
    const onOnboarding = pathname.startsWith("/onboarding");
    if (onOnboarding) return;

    let cancelled = false;
    isOnboardingComplete().then((done) => {
      if (cancelled) return;
      if (!done) return;
      const onPaywall = pathname === "/paywall";
      if (onPaywall) return;
      if (!hasPremium) {
        router.replace("/paywall");
      }
    }).catch(() => {
      if (cancelled) return;
      const onPaywall = pathname === "/paywall";
      if (onPaywall) return;
      if (!hasPremium) {
        router.replace("/paywall");
      }
    });
    return () => { cancelled = true; };
  }, [hasPremium, loading, pathname]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <WidgetProvider>
          <ThemeProvider value={DarkTheme}>
            <SystemBars style="light" />
            <RootLayoutNav />
            <StatusBar style="light" />
          </ThemeProvider>
        </WidgetProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
