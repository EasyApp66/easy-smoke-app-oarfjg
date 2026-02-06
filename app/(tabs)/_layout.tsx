
import React from 'react';
import { Tabs } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';
import { AppProvider } from '@/contexts/AppContext';

export default function TabLayout() {
  return (
    <AppProvider>
      <Tabs
        tabBar={(props) => (
          <FloatingTabBar
            {...props}
            tabs={[
              {
                name: '(home)',
                label: 'Home',
                icon: 'home',
                route: '/(tabs)/(home)',
              },
              {
                name: 'stats',
                label: 'Statistik',
                icon: 'bar-chart',
                route: '/(tabs)/stats',
              },
              {
                name: 'settings',
                label: 'Einstellungen',
                icon: 'settings',
                route: '/(tabs)/settings',
              },
            ]}
            containerWidth={240}
            borderRadius={30}
            bottomMargin={20}
          />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="stats" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </AppProvider>
  );
}
