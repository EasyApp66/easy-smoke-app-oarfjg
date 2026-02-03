
import Constants from 'expo-constants';

// Get backend URL from app.json configuration
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'https://9f23ybvc8f3nr3s67x5y46mr626vpaqn.app.specular.dev';

console.log('[API] Backend URL:', BACKEND_URL);

// Generic API call wrapper with error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Error] ${response.status} ${response.statusText}:`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API Success] ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

// Settings API
export interface UserSettings {
  id: string;
  deviceId: string;
  wakeTime: string;
  sleepTime: string;
  dailyCigaretteGoal: number;
  language: string;
  backgroundColor: string;
  premiumEnabled: boolean;
  promoCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getSettings(deviceId: string): Promise<UserSettings | null> {
  try {
    return await apiCall<UserSettings>(`/api/settings/${deviceId}`);
  } catch (error) {
    // Return null if settings don't exist yet (404)
    return null;
  }
}

export async function createOrUpdateSettings(data: {
  deviceId: string;
  wakeTime: string;
  sleepTime: string;
  dailyCigaretteGoal: number;
  language?: string;
  backgroundColor?: string;
  premiumEnabled?: boolean;
  promoCode?: string;
}): Promise<UserSettings> {
  return await apiCall<UserSettings>('/api/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSettings(
  deviceId: string,
  data: {
    wakeTime?: string;
    sleepTime?: string;
    dailyCigaretteGoal?: number;
    language?: string;
    backgroundColor?: string;
    premiumEnabled?: boolean;
    promoCode?: string;
  }
): Promise<UserSettings> {
  return await apiCall<UserSettings>(`/api/settings/${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Smoking Logs API
export interface SmokingLog {
  id: string;
  deviceId: string;
  date: string;
  cigarettesSmoked: number;
  cigarettesGoal: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAllLogs(deviceId: string): Promise<SmokingLog[]> {
  return await apiCall<SmokingLog[]>(`/api/logs/${deviceId}`);
}

export async function getLogForDate(deviceId: string, date: string): Promise<SmokingLog> {
  return await apiCall<SmokingLog>(`/api/logs/${deviceId}/${date}`);
}

export async function createOrUpdateLog(data: {
  deviceId: string;
  date: string;
  cigarettesSmoked: number;
  cigarettesGoal: number;
}): Promise<SmokingLog> {
  return await apiCall<SmokingLog>('/api/logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function incrementCigarettes(deviceId: string, date: string): Promise<SmokingLog> {
  return await apiCall<SmokingLog>(`/api/logs/${deviceId}/${date}/increment`, {
    method: 'PUT',
  });
}

// Alarms API
export interface AlarmSchedule {
  id: string;
  deviceId: string;
  date: string;
  alarmTimes: string[];
  createdAt: string;
}

export async function getAlarms(deviceId: string, date: string): Promise<{ alarmTimes: string[] }> {
  return await apiCall<{ alarmTimes: string[] }>(`/api/alarms/${deviceId}/${date}`);
}

export async function saveAlarms(data: {
  deviceId: string;
  date: string;
  alarmTimes: string[];
}): Promise<AlarmSchedule> {
  return await apiCall<AlarmSchedule>('/api/alarms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Statistics API
export interface Statistics {
  totalSmoked: number;
  averagePerDay: number;
  bestDay: {
    date: string;
    count: number;
  };
  weeklyData: Array<{
    date: string;
    smoked: number;
    goal: number;
  }>;
  trend: 'stable' | 'improving' | 'worsening';
}

export async function getStatistics(deviceId: string): Promise<Statistics> {
  return await apiCall<Statistics>(`/api/stats/${deviceId}`);
}

// Promo Code API
export interface PromoValidationResponse {
  valid: boolean;
  message: string;
  premiumEnabled?: boolean;
}

export async function validatePromoCode(code: string, deviceId: string): Promise<PromoValidationResponse> {
  return await apiCall<PromoValidationResponse>('/api/promo/validate', {
    method: 'POST',
    body: JSON.stringify({ code, deviceId }),
  });
}
