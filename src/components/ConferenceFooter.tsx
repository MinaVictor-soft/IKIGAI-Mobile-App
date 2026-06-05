import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../config/constants';

export default function ConferenceFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.logosRow}>
        <Image source={require('../../assets/logo-lagna.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.footerText}>لجنة خدمة ثانوى • أسقفية الشباب</Text>
        <Image source={require('../../assets/logo-oskofia.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.footerSubtext}>IKIGAI Quest 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
