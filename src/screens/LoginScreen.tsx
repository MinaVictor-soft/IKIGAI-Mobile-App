import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const { t, isRTL, lang, setLang } = useLang();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
    ]).start();

    // Pulsing glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('error'), t('enterCredentials'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error: any) {
      const message = error?.response?.data?.message || t('invalidCredentials');
      Alert.alert(t('loginFailed'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0F172A', '#1e1b4b', '#0F172A']}
        style={styles.gradient}
      >
        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        >
          <Ionicons name="globe-outline" size={16} color={COLORS.secondary} />
          <Text style={styles.langToggleText}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </Text>
        </TouchableOpacity>

        {/* Logos with animation */}
        <Animated.View style={[styles.logosContainer, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoWrapper}>
            <Image source={require('../../assets/logo-lagna.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.logoWrapper}>
            <Image source={require('../../assets/logo-oskofia.png')} style={styles.logo} resizeMode="contain" />
          </View>
        </Animated.View>

        {/* Animated Title */}
        <Animated.View style={[styles.titleContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>IKIGAI Quest</Text>
          <Text style={styles.japaneseTitle}>生き甲斐</Text>
          <View style={styles.taglineRow}>
            <View style={styles.sakuraLine} />
            <Text style={styles.tagline}>
              {lang === 'ar' ? 'رحلة المؤتمر التفاعلية' : 'Interactive Conference Journey'}
            </Text>
            <View style={styles.sakuraLine} />
          </View>
        </Animated.View>

        {/* Conference name */}
        <Animated.View style={[styles.conferenceBox, { opacity: fadeAnim }]}>
          <Text style={styles.conferenceText}>
            {lang === 'ar' ? 'مؤتمر لجنة خدمة ثانوى • أسقفية الشباب' : 'Youth Service Conference • Youth Diocese'}
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={[
            styles.inputContainer,
            isRTL && styles.inputRTL,
            focusedField === 'email' && styles.inputFocused,
          ]}>
            <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? COLORS.primary : COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              placeholder={t('email')}
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={[
            styles.inputContainer,
            isRTL && styles.inputRTL,
            focusedField === 'password' && styles.inputFocused,
          ]}>
            <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? COLORS.primary : COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isRTL && { textAlign: 'right' }]}
              placeholder={t('password')}
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>{t('signIn')}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerText}>{t('useConferenceCredentials')}</Text>

        {/* Register link */}
        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLinkText}>
            {lang === 'ar' ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xl },
  langToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  langToggleText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  logosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    padding: 6,
  },
  logo: { width: 66, height: 66, borderRadius: 33 },
  titleContainer: { alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: 34, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  japaneseTitle: { fontSize: 16, color: COLORS.accent, letterSpacing: 4, marginTop: 4 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  sakuraLine: { width: 30, height: 1.5, backgroundColor: COLORS.primary + '60' },
  tagline: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 0.5 },
  conferenceBox: {
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  conferenceText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  form: { gap: SPACING.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 52,
    paddingHorizontal: SPACING.xs,
  },
  inputFocused: {
    borderBottomColor: COLORS.primary,
    borderBottomWidth: 2,
  },
  inputIcon: { marginHorizontal: 8 },
  inputRTL: { flexDirection: 'row-reverse' },
  input: { flex: 1, color: COLORS.text, fontSize: 15, paddingHorizontal: SPACING.sm },
  eyeButton: { padding: 10 },
  loginButton: { marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  loginGradient: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: 12,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  registerLinkText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
