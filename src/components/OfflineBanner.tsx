import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { useLang } from '../contexts/LangContext';

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const { lang } = useLang();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected !== false) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={18} color="#fff" />
      <Text style={styles.text}>
        {lang === 'ar' ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    borderRadius: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
