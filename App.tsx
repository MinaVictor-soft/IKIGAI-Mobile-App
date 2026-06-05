import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { LangProvider } from './src/contexts/LangContext';
import { ViewedProvider } from './src/contexts/ViewedContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import OfflineBanner from './src/components/OfflineBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <AuthProvider>
          <ViewedProvider>
            <StatusBar style="light" />
            <OfflineBanner />
            <AppNavigator />
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          </ViewedProvider>
        </AuthProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}
