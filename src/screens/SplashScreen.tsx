import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { COLORS } from '../config/constants';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleTorii = useRef(new Animated.Value(0.3)).current;
  const slideTitle = useRef(new Animated.Value(30)).current;
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const petal1 = useRef(new Animated.Value(0)).current;
  const petal2 = useRef(new Animated.Value(0)).current;
  const petal3 = useRef(new Animated.Value(0)).current;
  const petal1X = useRef(new Animated.Value(-50)).current;
  const petal2X = useRef(new Animated.Value(width + 50)).current;
  const petal3X = useRef(new Animated.Value(width / 2)).current;
  const petal1Y = useRef(new Animated.Value(-50)).current;
  const petal2Y = useRef(new Animated.Value(-80)).current;
  const petal3Y = useRef(new Animated.Value(-30)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // 1. Fade in background
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 2. Torii gate appears with scale
      Animated.spring(scaleTorii, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      // 3. Title slides up
      Animated.parallel([
        Animated.timing(slideTitle, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeTitle, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 4. Subtitle fades in
      Animated.timing(fadeSubtitle, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Cherry blossom petals floating animation
    const animatePetal = (x: Animated.Value, y: Animated.Value, opacity: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.timing(y, {
              toValue: height + 50,
              duration: 3000 + Math.random() * 2000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(opacity, { toValue: 0.6, duration: 2500, useNativeDriver: true }),
            ]),
            Animated.timing(x, {
              toValue: Math.random() * width,
              duration: 3000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    animatePetal(petal1X, petal1Y, petal1, 800);
    animatePetal(petal2X, petal2Y, petal2, 1200);
    animatePetal(petal3X, petal3Y, petal3, 1600);

    // Finish after animation
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
        {/* Cherry blossom petals */}
        <Animated.Text style={[styles.petal, { opacity: petal1, transform: [{ translateX: petal1X }, { translateY: petal1Y }] }]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.petal, { opacity: petal2, transform: [{ translateX: petal2X }, { translateY: petal2Y }] }]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.petal, { opacity: petal3, transform: [{ translateX: petal3X }, { translateY: petal3Y }] }]}>
          🌺
        </Animated.Text>

        {/* Torii Gate */}
        <Animated.Text style={[styles.torii, { transform: [{ scale: scaleTorii }] }]}>
          ⛩️
        </Animated.Text>

        {/* App Name */}
        <Animated.Text style={[styles.title, { opacity: fadeTitle, transform: [{ translateY: slideTitle }] }]}>
          IKIGAI Quest
        </Animated.Text>

        {/* Japanese subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: fadeSubtitle }]}>
          生き甲斐 • اكتشف هدفك
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: fadeSubtitle }]}>
          رحلة الاكتشاف تبدأ هنا
        </Animated.Text>

        {/* Decorative line */}
        <Animated.View style={[styles.decorLine, { opacity: fadeSubtitle }]}>
          <Text style={styles.decorDots}>• • •</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  inner: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petal: {
    position: 'absolute',
    fontSize: 20,
  },
  torii: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  decorLine: {
    marginTop: 24,
  },
  decorDots: {
    color: COLORS.primary,
    fontSize: 18,
    letterSpacing: 8,
  },
});
