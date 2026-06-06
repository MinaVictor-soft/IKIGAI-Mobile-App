/**
 * Navigation Config Utility for Mobile App
 * Reads nav visibility config from storage (set by admin dashboard on web)
 * Works on both web and native platforms
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NavConfig {
  dashboard?: boolean;  // maps to 'Home' in mobile
  profile?: boolean;
  leaderboard?: boolean;
  events?: boolean;
  quizzes?: boolean;
  library?: boolean;
  sports?: boolean;
  scanQr?: boolean;
  info?: boolean;
}

const DEFAULT_NAV_CONFIG: NavConfig = {
  dashboard: true,      // Home
  profile: true,
  leaderboard: true,
  events: true,
  quizzes: true,
  library: true,
  sports: true,
  scanQr: true,
  info: true,
};

const NAV_CONFIG_KEY = 'admin-nav-config';

/**
 * Get nav config from web localStorage (web platform)
 */
function webGetNavConfig(): NavConfig {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(NAV_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_NAV_CONFIG, ...parsed };
      }
    }
  } catch (error) {
    console.error('Failed to parse nav config from web storage:', error);
  }
  return DEFAULT_NAV_CONFIG;
}

/**
 * Get nav config from AsyncStorage (native platform)
 */
async function nativeGetNavConfig(): Promise<NavConfig> {
  try {
    const stored = await AsyncStorage.getItem(NAV_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_NAV_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Failed to parse nav config from AsyncStorage:', error);
  }
  return DEFAULT_NAV_CONFIG;
}

/**
 * Get the current nav config
 * Falls back to DEFAULT_NAV_CONFIG if not set or invalid
 */
export function getNavConfig(): NavConfig {
  if (Platform.OS === 'web') {
    return webGetNavConfig();
  } else {
    // For native, this is async, but we can't return Promise here
    // Use getNavConfigAsync instead
    return DEFAULT_NAV_CONFIG;
  }
}

/**
 * Async version for native platforms
 */
export async function getNavConfigAsync(): Promise<NavConfig> {
  if (Platform.OS === 'web') {
    return webGetNavConfig();
  } else {
    return nativeGetNavConfig();
  }
}

/**
 * Check if a nav item should be visible
 */
export function isNavItemVisible(key: keyof NavConfig): boolean {
  const config = getNavConfig();
  return config[key] !== false;
}

/**
 * Async version to check nav item visibility
 */
export async function isNavItemVisibleAsync(key: keyof NavConfig): Promise<boolean> {
  const config = await getNavConfigAsync();
  return config[key] !== false;
}

/**
 * Listen for nav config changes
 * Useful for real-time updates when admin changes settings on web
 */
export function onNavConfigChange(callback: (config: NavConfig) => void): () => void {
  if (Platform.OS === 'web') {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NAV_CONFIG_KEY && e.newValue) {
        try {
          const config = JSON.parse(e.newValue);
          callback({ ...DEFAULT_NAV_CONFIG, ...config });
        } catch (error) {
          console.error('Failed to parse nav config change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  } else {
    // Native platform: no real-time storage change events
    // Could implement polling if needed
    return () => {};
  }
}

/**
 * Reset nav config to defaults
 */
export async function resetNavConfig(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(NAV_CONFIG_KEY);
    }
  } else {
    await AsyncStorage.removeItem(NAV_CONFIG_KEY);
  }
}

/**
 * Save nav config (usually called by admin dashboard)
 */
export async function saveNavConfig(config: NavConfig): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(NAV_CONFIG_KEY, JSON.stringify(config));
    }
  } else {
    await AsyncStorage.setItem(NAV_CONFIG_KEY, JSON.stringify(config));
  }
}
