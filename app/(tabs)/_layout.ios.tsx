
import React from 'react';
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';
import { AppProvider } from '@/contexts/AppContext';

export default function TabLayout() {
  return (
    <AppProvider>
      <NativeTabs>
        <NativeTabs.Trigger key="home" name="(home)">
          <Icon sf="house.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="stats" name="stats">
          <Icon sf="chart.bar.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="settings" name="settings">
          <Icon sf="gearshape.fill" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </AppProvider>
  );
}
