
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface AppSettings {
  deviceId: string;
  wakeTime: string;
  sleepTime: string;
  dailyCigaretteGoal: number;
  language: 'de' | 'en';
  backgroundColor: 'gray' | 'black';
  accentColor: 'green' | 'neonYellow' | 'neonGreen' | 'lightBlue';
  premiumEnabled: boolean;
  premiumType?: 'monthly' | 'lifetime';
  premiumExpiry?: string;
  promoCode?: string;
}

interface SmokingLog {
  date: string;
  cigarettesSmoked: number;
  cigarettesGoal: number;
}

interface AppContextType {
  settings: AppSettings | null;
  currentLog: SmokingLog | null;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  incrementCigarettes: () => Promise<void>;
  setupDay: (wakeTime: string, sleepTime: string, goal: number) => Promise<void>;
  validatePromoCode: (code: string) => Promise<boolean>;
  getDeviceId: () => Promise<string>;
  getLogForSpecificDate: (date: string) => Promise<SmokingLog | null>;
  saveLogForDate: (date: string, wakeTime: string, sleepTime: string, goal: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web-compatible storage wrapper
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentLog, setCurrentLog] = useState<SmokingLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate or retrieve device ID
  const getDeviceId = async (): Promise<string> => {
    try {
      let deviceId = await storage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await storage.setItem('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  // Load settings from local storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const deviceId = await getDeviceId();
      
      // Try to load from local storage first (offline support)
      const storedSettings = await storage.getItem('appSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...parsed, deviceId, accentColor: parsed.accentColor || 'green' });
      }

      // Fetch settings from server to sync
      try {
        const { getSettings, getLogForDate } = await import('@/utils/api');
        const serverSettings = await getSettings(deviceId);
        
        if (serverSettings) {
          const settingsData: AppSettings = {
            deviceId: serverSettings.deviceId,
            wakeTime: serverSettings.wakeTime,
            sleepTime: serverSettings.sleepTime,
            dailyCigaretteGoal: serverSettings.dailyCigaretteGoal,
            language: serverSettings.language as 'de' | 'en',
            backgroundColor: serverSettings.backgroundColor as 'gray' | 'black',
            accentColor: (serverSettings.accentColor as 'green' | 'neonYellow' | 'neonGreen' | 'lightBlue') || 'green',
            premiumEnabled: serverSettings.premiumEnabled,
            premiumType: serverSettings.premiumType as 'monthly' | 'lifetime' | undefined,
            premiumExpiry: serverSettings.premiumExpiry,
            promoCode: serverSettings.promoCode || undefined,
          };
          
          setSettings(settingsData);
          await storage.setItem('appSettings', JSON.stringify(settingsData));
          console.log('[AppContext] Settings synced from server');
        }
      } catch (error) {
        console.log('[AppContext] Could not fetch settings from server, using local cache');
      }
      
      // Load today's log
      const today = new Date().toISOString().split('T')[0];
      const storedLog = await storage.getItem(`log_${today}`);
      if (storedLog) {
        setCurrentLog(JSON.parse(storedLog));
      }

      // Fetch today's log from server
      try {
        const { getLogForDate } = await import('@/utils/api');
        const serverLog = await getLogForDate(deviceId, today);
        
        if (serverLog) {
          const logData: SmokingLog = {
            date: serverLog.date,
            cigarettesSmoked: serverLog.cigarettesSmoked,
            cigarettesGoal: serverLog.cigarettesGoal,
          };
          
          setCurrentLog(logData);
          await storage.setItem(`log_${today}`, JSON.stringify(logData));
          console.log('[AppContext] Log synced from server');
        }
      } catch (error) {
        console.log('[AppContext] Could not fetch log from server, using local cache');
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const deviceId = await getDeviceId();
      
      // If settings don't exist yet, create them with defaults
      const currentSettings = settings || {
        deviceId,
        wakeTime: '06:00',
        sleepTime: '22:00',
        dailyCigaretteGoal: 25,
        language: 'de' as 'de' | 'en',
        backgroundColor: 'gray' as 'gray' | 'black',
        accentColor: 'green' as 'green' | 'neonYellow' | 'neonGreen' | 'lightBlue',
        premiumEnabled: false,
      };
      
      const updated = { ...currentSettings, ...newSettings, deviceId } as AppSettings;
      
      // Save locally first (offline support)
      await storage.setItem('appSettings', JSON.stringify(updated));
      setSettings(updated);

      // Update settings on server
      try {
        const { updateSettings: updateServerSettings, createOrUpdateSettings } = await import('@/utils/api');
        
        // If settings exist, update them; otherwise create them
        if (settings) {
          await updateServerSettings(deviceId, newSettings);
        } else {
          await createOrUpdateSettings({
            deviceId,
            wakeTime: updated.wakeTime,
            sleepTime: updated.sleepTime,
            dailyCigaretteGoal: updated.dailyCigaretteGoal,
            language: updated.language,
            backgroundColor: updated.backgroundColor,
            premiumEnabled: updated.premiumEnabled,
            promoCode: updated.promoCode,
          });
        }
        console.log('[AppContext] Settings updated on server');
      } catch (error) {
        console.error('[AppContext] Failed to update settings on server:', error);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const setupDay = async (wakeTime: string, sleepTime: string, goal: number) => {
    try {
      const deviceId = await getDeviceId();
      const today = new Date().toISOString().split('T')[0];
      
      // First, ensure settings exist on the server
      try {
        const { createOrUpdateSettings } = await import('@/utils/api');
        await createOrUpdateSettings({
          deviceId,
          wakeTime,
          sleepTime,
          dailyCigaretteGoal: goal,
          language: settings?.language || 'de',
          backgroundColor: settings?.backgroundColor || 'gray',
          premiumEnabled: settings?.premiumEnabled || false,
          promoCode: settings?.promoCode,
        });
        console.log('[AppContext] Settings created/updated on server');
      } catch (error) {
        console.error('[AppContext] Failed to create/update settings on server:', error);
      }
      
      // Update local settings
      await updateSettings({ wakeTime, sleepTime, dailyCigaretteGoal: goal });
      
      // Create today's log
      const newLog: SmokingLog = {
        date: today,
        cigarettesSmoked: 0,
        cigarettesGoal: goal,
      };
      
      await storage.setItem(`log_${today}`, JSON.stringify(newLog));
      setCurrentLog(newLog);

      // Create log on server
      try {
        const { createOrUpdateLog } = await import('@/utils/api');
        await createOrUpdateLog({
          deviceId,
          date: today,
          cigarettesSmoked: 0,
          cigarettesGoal: goal,
        });
        console.log('[AppContext] Log created on server');
      } catch (error) {
        console.error('[AppContext] Failed to create log on server:', error);
      }
      
      // Calculate and save alarm times
      const alarmTimes = calculateAlarmTimes(wakeTime, sleepTime, goal);
      await storage.setItem(`alarms_${today}`, JSON.stringify(alarmTimes));
      
      // Save alarms on server
      try {
        const { saveAlarms } = await import('@/utils/api');
        await saveAlarms({
          deviceId,
          date: today,
          alarmTimes,
        });
        console.log('[AppContext] Alarms saved on server');
      } catch (error) {
        console.error('[AppContext] Failed to save alarms on server:', error);
      }
      
      console.log('Day setup complete. Alarm times:', alarmTimes);
    } catch (error) {
      console.error('Error setting up day:', error);
      throw error;
    }
  };

  const getLogForSpecificDate = async (date: string): Promise<SmokingLog | null> => {
    try {
      // Try local storage first
      const storedLog = await storage.getItem(`log_${date}`);
      if (storedLog) {
        return JSON.parse(storedLog);
      }

      // Try server
      try {
        const deviceId = await getDeviceId();
        const { getLogForDate } = await import('@/utils/api');
        const serverLog = await getLogForDate(deviceId, date);
        
        if (serverLog) {
          const logData: SmokingLog = {
            date: serverLog.date,
            cigarettesSmoked: serverLog.cigarettesSmoked,
            cigarettesGoal: serverLog.cigarettesGoal,
          };
          
          // Cache it locally
          await storage.setItem(`log_${date}`, JSON.stringify(logData));
          return logData;
        }
      } catch (error) {
        console.log('[AppContext] Could not fetch log for date from server:', date);
      }

      return null;
    } catch (error) {
      console.error('Error getting log for specific date:', error);
      return null;
    }
  };

  const saveLogForDate = async (date: string, wakeTime: string, sleepTime: string, goal: number) => {
    try {
      const deviceId = await getDeviceId();
      
      // Update settings if needed
      await updateSettings({ wakeTime, sleepTime, dailyCigaretteGoal: goal });
      
      // Create log for the specific date
      const newLog: SmokingLog = {
        date,
        cigarettesSmoked: 0,
        cigarettesGoal: goal,
      };
      
      await storage.setItem(`log_${date}`, JSON.stringify(newLog));
      
      // If it's today, update currentLog
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        setCurrentLog(newLog);
      }

      // Create log on server
      try {
        const { createOrUpdateLog } = await import('@/utils/api');
        await createOrUpdateLog({
          deviceId,
          date,
          cigarettesSmoked: 0,
          cigarettesGoal: goal,
        });
        console.log('[AppContext] Log created on server for date:', date);
      } catch (error) {
        console.error('[AppContext] Failed to create log on server:', error);
      }
      
      // Calculate and save alarm times
      const alarmTimes = calculateAlarmTimes(wakeTime, sleepTime, goal);
      await storage.setItem(`alarms_${date}`, JSON.stringify(alarmTimes));
      
      // Save alarms on server
      try {
        const { saveAlarms } = await import('@/utils/api');
        await saveAlarms({
          deviceId,
          date,
          alarmTimes,
        });
        console.log('[AppContext] Alarms saved on server for date:', date);
      } catch (error) {
        console.error('[AppContext] Failed to save alarms on server:', error);
      }
      
      console.log('Day setup complete for date:', date);
    } catch (error) {
      console.error('Error saving log for date:', error);
      throw error;
    }
  };

  const incrementCigarettes = async () => {
    if (!currentLog) return;
    
    try {
      const updated = {
        ...currentLog,
        cigarettesSmoked: currentLog.cigarettesSmoked + 1,
      };
      
      const today = new Date().toISOString().split('T')[0];
      await storage.setItem(`log_${today}`, JSON.stringify(updated));
      setCurrentLog(updated);

      // Increment on server
      try {
        const deviceId = await getDeviceId();
        const { incrementCigarettes: incrementOnServer } = await import('@/utils/api');
        const serverLog = await incrementOnServer(deviceId, today);
        console.log('[AppContext] Cigarette count incremented on server:', serverLog.cigarettesSmoked);
      } catch (error) {
        console.error('[AppContext] Failed to increment on server:', error);
      }
      
      console.log('Cigarette count incremented:', updated.cigarettesSmoked);
    } catch (error) {
      console.error('Error incrementing cigarettes:', error);
    }
  };

  const validatePromoCode = async (code: string): Promise<boolean> => {
    try {
      const deviceId = await getDeviceId();
      const trimmedCode = code.trim();
      
      // Offline promo code validation
      let premiumEnabled = false;
      let premiumType: 'monthly' | 'lifetime' | undefined;
      let premiumExpiry: string | undefined;
      
      if (trimmedCode === 'EASY EASY') {
        premiumEnabled = true;
        premiumType = 'monthly';
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        premiumExpiry = expiryDate.toISOString();
        console.log('[AppContext] Promo code "EASY EASY" activated - 1 month premium');
      } else if (trimmedCode === 'Easy22') {
        premiumEnabled = true;
        premiumType = 'lifetime';
        premiumExpiry = undefined;
        console.log('[AppContext] Promo code "Easy22" activated - lifetime premium');
      }
      
      if (premiumEnabled) {
        // Save locally
        await updateSettings({ 
          promoCode: trimmedCode, 
          premiumEnabled: true,
          premiumType,
          premiumExpiry,
        });
        
        // Try to validate on server as well
        try {
          const { validatePromoCode: validateOnServer } = await import('@/utils/api');
          await validateOnServer(trimmedCode, deviceId);
          console.log('[AppContext] Promo code also validated on server');
        } catch (error) {
          console.log('[AppContext] Could not validate on server, but local activation successful');
        }
        
        return true;
      }
      
      // If not a known offline code, try server validation
      try {
        const { validatePromoCode: validateOnServer } = await import('@/utils/api');
        const result = await validateOnServer(trimmedCode, deviceId);
        
        if (result.valid && result.premiumEnabled) {
          await updateSettings({ promoCode: trimmedCode, premiumEnabled: true });
          console.log('[AppContext] Promo code validated successfully on server:', trimmedCode);
          return true;
        } else {
          console.log('[AppContext] Invalid promo code:', result.message);
          return false;
        }
      } catch (error) {
        console.error('Error validating promo code on server:', error);
        return false;
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      return false;
    }
  };

  // Helper function to calculate alarm times
  const calculateAlarmTimes = (wakeTime: string, sleepTime: string, cigaretteCount: number): string[] => {
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);
    
    const wakeMinutes = wakeHour * 60 + wakeMin;
    const sleepMinutes = sleepHour * 60 + sleepMin;
    
    const totalMinutes = sleepMinutes > wakeMinutes 
      ? sleepMinutes - wakeMinutes 
      : (24 * 60 - wakeMinutes) + sleepMinutes;
    
    const interval = totalMinutes / cigaretteCount;
    
    const alarms: string[] = [];
    for (let i = 0; i < cigaretteCount; i++) {
      const alarmMinutes = wakeMinutes + (interval * i);
      const hour = Math.floor(alarmMinutes / 60) % 24;
      const min = Math.floor(alarmMinutes % 60);
      alarms.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
    
    return alarms;
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        currentLog,
        isLoading,
        updateSettings,
        incrementCigarettes,
        setupDay,
        validatePromoCode,
        getDeviceId,
        getLogForSpecificDate,
        saveLogForDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
