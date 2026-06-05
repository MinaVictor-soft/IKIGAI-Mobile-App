import { Platform } from 'react-native';
import { AuthTokens } from '../types';

const ACCESS_TOKEN_KEY = 'ikigai_access_token';
const REFRESH_TOKEN_KEY = 'ikigai_refresh_token';

// Web-safe storage helpers
function webGet(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
}
function webSet(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
}
function webRemove(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  }
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  if (Platform.OS === 'web') {
    webSet(ACCESS_TOKEN_KEY, tokens.accessToken);
    webSet(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webGet(ACCESS_TOKEN_KEY);
  }
  const SecureStore = require('expo-secure-store');
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webGet(REFRESH_TOKEN_KEY);
  }
  const SecureStore = require('expo-secure-store');
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    webRemove(ACCESS_TOKEN_KEY);
    webRemove(REFRESH_TOKEN_KEY);
  } else {
    const SecureStore = require('expo-secure-store');
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}
