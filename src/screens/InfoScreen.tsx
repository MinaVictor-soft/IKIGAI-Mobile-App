import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../config/constants';
import { useLang } from '../contexts/LangContext';

const APP_LINKS = [
  {
    platform: 'Google Play',
    icon: 'logo-google-playstore' as const,
    color: '#34A853',
    url: 'https://play.google.com/store/apps/details?id=com.youthbishopric.anbamousa',
  },
  {
    platform: 'App Store',
    icon: 'logo-apple' as const,
    color: '#000000',
    url: 'https://apps.apple.com/us/app/%D8%A7%D9%84%D8%A3%D9%86%D8%A8%D8%A7-%D9%85%D9%88%D8%B3%D9%89-anba-mousa/id6763527736',
  },
  {
    platform: 'AppGallery',
    icon: 'phone-portrait' as const,
    color: '#C71A32',
    url: 'https://appgallery.huawei.com/app/C117775627',
  },
];

export default function InfoScreen() {
  const { lang } = useLang();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Header */}
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#0F172A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >

       {/* Conference Logo */}
        <Image
          source={require('../../assets/logo-40years.png')}
          style={styles.heroLogo}
          resizeMode="contain"
        />
        {/* Conference Title */}
        <Text style={styles.headerTitle}>
          {lang === 'ar' ? '٤٠ عامًا' : '40 Years'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'ar' ? 'مؤتمرات أسقفية الشباب' : 'Youth Bishopric Conferences'}
        </Text>
        <View style={styles.yearPill}>
          <Text style={styles.yearText}>1986 – 2026</Text>
        </View>

       
      </LinearGradient>

      {/* Organization Info */}
      <View style={styles.card}>
        <LinearGradient
          colors={[COLORS.primary + '15', 'transparent']}
          style={styles.cardAccent}
        />
        <View style={styles.cardIconRow}>
          <View style={[styles.cardIconBg, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="information-circle" size={22} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.cardTitle}>
          {lang === 'ar' ? 'عن المؤتمر' : 'About the Conference'}
        </Text>
        <Text style={styles.cardText}>
          {lang === 'ar'
            ? 'مؤتمر لجنة خدمة ثانوي - أسقفية الشباب، يجمع الشباب من جميع أنحاء الكنيسة القبطية الأرثوذكسية في مؤتمر سنوي يهدف إلى النمو الروحي والتعليمي والاجتماعي.'
            : 'Youth Service Committee Conference - Youth Bishopric, gathering young people from across the Coptic Orthodox Church in an annual conference aimed at spiritual, educational, and social growth.'}
        </Text>
      </View>

      {/* Anba Mousa App */}
      <View style={styles.card}>
        <LinearGradient
          colors={[COLORS.secondary + '15', 'transparent']}
          style={styles.cardAccent}
        />
        <View style={styles.cardIconRow}>
          <View style={[styles.cardIconBg, { backgroundColor: COLORS.secondary + '20' }]}>
            <Ionicons name="phone-portrait" size={22} color={COLORS.secondary} />
          </View>
        </View>
        <Text style={styles.cardTitle}>
          {lang === 'ar' ? 'تطبيق الأنبا موسى' : 'Anba Mousa App'}
        </Text>
        <Text style={styles.cardText}>
          {lang === 'ar'
            ? 'إهداء إلى شعب كنيستنا القبطية المقدسة\nنطلق اليوم تطبيق الأنبا موسى'
            : 'A gift to the people of our Holy Coptic Church\nWe launch the Anba Mousa App'}
        </Text>

        {/* App Store Links */}
        <View style={styles.linksContainer}>
          {APP_LINKS.map((link) => (
            <TouchableOpacity
              key={link.platform}
              style={styles.linkButton}
              onPress={() => openLink(link.url)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[link.color, link.color + 'DD']}
                style={styles.linkGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name={link.icon} size={24} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkLabel}>
                    {lang === 'ar' ? 'متاح على' : 'Available on'}
                  </Text>
                  <Text style={styles.linkPlatform}>{link.platform}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contact / Social */}
      <View style={styles.card}>
        <LinearGradient
          colors={[COLORS.accent + '15', 'transparent']}
          style={styles.cardAccent}
        />
        <View style={styles.cardIconRow}>
          <View style={[styles.cardIconBg, { backgroundColor: COLORS.accent + '20' }]}>
            <Ionicons name="globe" size={22} color={COLORS.accent} />
          </View>
        </View>
        <Text style={styles.cardTitle}>
          {lang === 'ar' ? 'تابعونا' : 'Follow Us'}
        </Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2' + '15' }]} onPress={() => openLink('https://www.facebook.com/youthbishopric')}>
            <Ionicons name="logo-facebook" size={26} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#FF0000' + '15' }]} onPress={() => openLink('https://www.youtube.com/@youthbishopric')}>
            <Ionicons name="logo-youtube" size={26} color="#FF0000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#E4405F' + '15' }]} onPress={() => openLink('https://www.instagram.com/youthbishopric')}>
            <Ionicons name="logo-instagram" size={26} color="#E4405F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Powered By */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>IKIGAI Quest © 2026</Text>
        <Text style={styles.footerSub}>
          {lang === 'ar' ? 'لجنة خدمة ثانوي • أسقفية الشباب' : 'Youth Service Committee • Youth Bishopric'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  yearPill: {
    marginTop: 14,
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  yearText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroLogo: {
    width: 200,
    height: 200,
    marginBottom: 8,
    borderRadius: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardIconRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  linksContainer: {
    marginTop: 16,
    gap: 10,
  },
  linkButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  linkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  linkLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkPlatform: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 8,
  },
  footerDivider: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.primary + '30',
    borderRadius: 2,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  footerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
