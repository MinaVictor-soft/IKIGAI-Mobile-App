import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // Text fade in
    Animated.timing(textFade, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }).start();

    // Pulsing glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Rotating circle
    Animated.loop(
      Animated.timing(circleAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
  }, []);

  const rotation = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <LinearGradient
      colors={['#0a0a1a', '#1e1b4b', '#0F172A']}
      style={styles.container}
    >
      {/* Japanese decorative circle - Enso */}
      <Animated.View style={[styles.ensoContainer, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.ensoRing} />
      </Animated.View>

      {/* Glow effect behind logo */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoWrapper}>
          <Image source={require('../../assets/logo-lagna.png')} style={styles.logo} resizeMode="contain" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleBlock, { opacity: textFade }]}>
        <Text style={styles.title}>IKIGAI Quest</Text>
        <Text style={styles.japanese}>生き甲斐</Text>
        <Text style={styles.subtitle}>Find your purpose</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingRow, { opacity: textFade }]}>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingDot, { opacity: glowOpacity }]} />
        </View>
      </Animated.View>

      {/* Bottom branding */}
      <Animated.View style={[styles.bottomSection, { opacity: textFade }]}>
        <Text style={styles.bottomText}>⛪ مؤتمر لجنة خدمة ثانوى • أسقفية الشباب ⛪</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ensoContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ensoRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderTopColor: COLORS.accent + '80',
    borderRightColor: COLORS.secondary + '50',
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  japanese: {
    fontSize: 16,
    color: COLORS.accent,
    letterSpacing: 8,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loadingRow: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  loadingTrack: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary + '30',
    overflow: 'hidden',
  },
  loadingDot: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 12,
    color: COLORS.accent + 'AA',
    fontWeight: '500',
  },
});
