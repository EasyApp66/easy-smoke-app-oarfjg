
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { AppProvider } from '@/contexts/AppContext';

export default function TabLayout() {
  return (
    <AppProvider>
      <NativeTabs>
        <NativeTabs.Trigger key="home" name="(home)">
          <Icon sf="house.fill" />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="stats" name="stats">
          <Icon sf="chart.bar.fill" />
          <Label>Statistik</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="settings" name="settings">
          <Icon sf="gearshape.fill" />
          <Label>Einstellungen</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </AppProvider>
  );
}
