import React, { useState, useRef, useEffect } from 'react';
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
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';

interface Props {
  onBack: () => void;
}

export default function RegisterScreen({ onBack }: Props) {
  const { login } = useAuth();
  const { t, isRTL, lang } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [church, setChurch] = useState('');
  const [diocese, setDiocese] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !church.trim() || !diocese.trim() || !phone.trim()) {
      Alert.alert(
        lang === 'ar' ? 'خطأ' : 'Error',
        lang === 'ar' ? 'جميع الحقول المطلوبة يجب ملؤها' : 'All required fields must be filled'
      );
      return;
    }
    if (password.length < 8) {
      Alert.alert(
        lang === 'ar' ? 'خطأ' : 'Error',
        lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        lang === 'ar' ? 'خطأ' : 'Error',
        lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'
      );
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        church: church.trim(),
        diocese: diocese.trim(),
        phone: phone.trim(),
        languagePreference: lang,
      });
      // Auto-login after successful registration
      await login(email.trim().toLowerCase(), password);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || (lang === 'ar' ? 'فشل التسجيل' : 'Registration failed');
      Alert.alert(lang === 'ar' ? 'خطأ' : 'Error', message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    field: string,
    icon: keyof typeof Ionicons.glyphMap,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: { secure?: boolean; keyboard?: any; autoCapitalize?: any }
  ) => (
    <View style={[styles.inputRow, isRTL && styles.inputRTL, focusedField === field && styles.inputRowFocused]}>
      <Ionicons name={icon} size={18} color={focusedField === field ? COLORS.primary : COLORS.textMuted} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, isRTL && { textAlign: 'right' }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={options?.secure && !showPassword}
        keyboardType={options?.keyboard || 'default'}
        autoCapitalize={options?.autoCapitalize || 'none'}
        autoCorrect={false}
        onFocus={() => setFocusedField(field)}
        onBlur={() => setFocusedField(null)}
      />
      {options?.secure && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0F172A', '#1e1b4b', '#0F172A']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>
              {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {lang === 'ar' ? 'انضم إلى رحلة IKIGAI Quest' : 'Join the IKIGAI Quest journey'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {renderInput('name', 'person-outline', lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *', name, setName, { autoCapitalize: 'words' })}
            {renderInput('email', 'mail-outline', lang === 'ar' ? 'البريد الإلكتروني *' : 'Email *', email, setEmail, { keyboard: 'email-address' })}
            {renderInput('password', 'lock-closed-outline', lang === 'ar' ? 'كلمة المرور * (8+ أحرف)' : 'Password * (8+ chars)', password, setPassword, { secure: true })}
            {renderInput('confirm', 'lock-closed-outline', lang === 'ar' ? 'تأكيد كلمة المرور *' : 'Confirm Password *', confirmPassword, setConfirmPassword, { secure: true })}
            {renderInput('church', 'home-outline', lang === 'ar' ? 'الكنيسة *' : 'Church *', church, setChurch, { autoCapitalize: 'words' })}
            {renderInput('diocese', 'business-outline', lang === 'ar' ? 'الإيبارشية *' : 'Diocese *', diocese, setDiocese, { autoCapitalize: 'words' })}
            {renderInput('phone', 'call-outline', lang === 'ar' ? 'رقم الموبايل *' : 'Phone *', phone, setPhone, { keyboard: 'phone-pad' })}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>
                      {lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Back to login */}
          <TouchableOpacity style={styles.loginLink} onPress={onBack}>
            <Text style={styles.loginLinkText}>
              {lang === 'ar' ? 'لديك حساب بالفعل؟ سجل دخول' : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 0,
    padding: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  form: { gap: SPACING.sm + 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 50,
    paddingHorizontal: SPACING.xs,
  },
  inputRowFocused: {
    borderBottomColor: COLORS.primary,
    borderBottomWidth: 2,
  },
  inputRTL: { flexDirection: 'row-reverse' },
  inputIcon: { marginHorizontal: 8 },
  input: { flex: 1, color: COLORS.text, fontSize: 15 },
  eyeBtn: { padding: 8 },
  registerButton: { marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  registerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  registerButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginLink: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  loginLinkText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
