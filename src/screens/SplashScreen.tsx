import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const slideTitle = useRef(new Animated.Value(50)).current;
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeTagline = useRef(new Animated.Value(0)).current;
  const petal1 = useRef(new Animated.Value(0)).current;
  const petal2 = useRef(new Animated.Value(0)).current;
  const petal3 = useRef(new Animated.Value(0)).current;
  const petal4 = useRef(new Animated.Value(0)).current;
  const petal1X = useRef(new Animated.Value(-60)).current;
  const petal2X = useRef(new Animated.Value(width + 60)).current;
  const petal3X = useRef(new Animated.Value(-40)).current;
  const petal4X = useRef(new Animated.Value(width + 40)).current;
  const petal1Y = useRef(new Animated.Value(-60)).current;
  const petal2Y = useRef(new Animated.Value(-100)).current;
  const petal3Y = useRef(new Animated.Value(-50)).current;
  const petal4Y = useRef(new Animated.Value(-80)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Background fade in
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulsing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Logo scale and appear
    Animated.sequence([
      Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Title slides up
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(slideTitle, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeTitle, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtitle fades in
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(fadeSubtitle, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline fades in
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(fadeTagline, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating petals
    const animatePetal = (x: Animated.Value, y: Animated.Value, opacity: Animated.Value, delay: number, duration: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.timing(y, {
              toValue: height + 100,
              duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(opacity, { toValue: 0.6, duration: duration - 300, useNativeDriver: true }),
            ]),
            Animated.timing(x, {
              toValue: x._value + (Math.random() > 0.5 ? 100 : -100),
              duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    animatePetal(petal1X, petal1Y, petal1, 500, 4000);
    animatePetal(petal2X, petal2Y, petal2, 800, 4500);
    animatePetal(petal3X, petal3Y, petal3, 1100, 5000);
    animatePetal(petal4X, petal4Y, petal4, 1400, 4800);

    // Fade out and finish
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 3800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <LinearGradient
        colors={['#0F172A', '#1e1b4b', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
          {/* Glowing background circles */}
          <Animated.View style={[styles.glowCircle1, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.glowCircle2, { opacity: glowOpacity }]} />

          {/* Floating Cherry blossom petals */}
          <Animated.Text
            style={[
              styles.petal,
              {
                opacity: petal1,
                transform: [
                  { translateX: petal1X },
                  { translateY: petal1Y },
                ],
              },
            ]}
          >
            🌸
          </Animated.Text>
          <Animated.Text
            style={[
              styles.petal,
              {
                opacity: petal2,
                transform: [
                  { translateX: petal2X },
                  { translateY: petal2Y },
                ],
              },
            ]}
          >
            🌸
          </Animated.Text>
          <Animated.Text
            style={[
              styles.petal,
              {
                opacity: petal3,
                transform: [
                  { translateX: petal3X },
                  { translateY: petal3Y },
                ],
              },
            ]}
          >
            🌺
          </Animated.Text>
          <Animated.Text
            style={[
              styles.petal,
              {
                opacity: petal4,
                transform: [
                  { translateX: petal4X },
                  { translateY: petal4Y },
                ],
              },
            ]}
          >
            🌸
          </Animated.Text>

          {/* Logo with animation */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                opacity: fadeIn,
              },
            ]}
          >
            <Text style={styles.logo}>⛩️</Text>
          </Animated.View>

          {/* Main Title */}
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: fadeTitle,
                transform: [{ translateY: slideTitle }],
              },
            ]}
          >
            IKIGAI
          </Animated.Text>

          {/* Japanese Character */}
          <Animated.Text
            style={[
              styles.japanese,
              {
                opacity: fadeSubtitle,
              },
            ]}
          >
            生き甲斐
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: fadeSubtitle,
              },
            ]}
          >
            Quest
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: fadeTagline,
              },
            ]}
          >
            Learn. Compete. Grow.
          </Animated.Text>

          {/* Arabic tagline */}
          <Animated.Text
            style={[
              styles.arabicTagline,
              {
                opacity: fadeTagline,
              },
            ]}
          >
            اكتشف هدفك
          </Animated.Text>

          {/* Decorative dots */}
          <Animated.Text
            style={[
              styles.decorDots,
              {
                opacity: fadeTagline,
              },
            ]}
          >
            • • •
          </Animated.Text>
        </Animated.View>
      </LinearGradient>
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
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  glowCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#9333EA',
    opacity: 0.1,
    top: -100,
    left: -100,
  },
  glowCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#3B82F6',
    opacity: 0.1,
    bottom: -50,
    right: -50,
  },
  petal: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#E879F9',
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: 'center',
  },
  japanese: {
    fontSize: 28,
    color: '#C084FC',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    color: '#A78BFA',
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 8,
  },
  arabicTagline: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 4,
  },
  decorDots: {
    fontSize: 20,
    color: '#A78BFA',
    letterSpacing: 8,
    marginTop: 20,
    fontWeight: 'bold',
  },
});
