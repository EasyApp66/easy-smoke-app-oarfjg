
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AppProvider } from "@/contexts/AppContext";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

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
  }, [segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
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
