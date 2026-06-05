import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../config/constants';
import { useLang } from '../contexts/LangContext';

export default function ConferenceHeader() {
  const { lang } = useLang();
  return (
    <LinearGradient
      colors={['#1e1b4b', '#0F172A']}
      style={styles.wrapper}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo-lagna.png')} style={styles.logoImg} resizeMode="contain" />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>IKIGAI Quest</Text>
          <Text style={styles.japanese}>生き甲斐</Text>
        </View>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo-oskofia.png')} style={styles.logoImg} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {lang === 'ar' ? '⛪ مؤتمر لجنة خدمة ثانوى • أسقفية الشباب ⛪' : '⛪ Youth Service Committee • Youth Diocese ⛪'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.lg,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  logoImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  titleBlock: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  japanese: {
    fontSize: 11,
    color: COLORS.accent,
    letterSpacing: 6,
    marginTop: 2,
  },
  banner: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    textAlign: 'center',
  },
});
