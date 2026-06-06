import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useMyProfile, useLeaderboard } from '../hooks/useApi';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { t, lang, isRTL } = useLang();
  const { data: profile, refetch } = useMyProfile();
  const { data: leaderboard } = useLeaderboard();

  const [refreshing, setRefreshing] = React.useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const currentUser = profile || user;
  const userRank = leaderboard?.findIndex((e) => e.id === currentUser?.id);
  const rank = userRank !== undefined && userRank >= 0 ? userRank + 1 : null;

  const totalXp = currentUser?.totalXp || 0;
  const sportsXp = (currentUser as any)?.sportsXp || 0;
  const conferenceXp = (currentUser as any)?.conferenceXp || 0;
  const level = (currentUser as any)?.level;
  const xpProgress = level?.maxXp
    ? ((totalXp - (level.minXp || 0)) / (level.maxXp - (level.minXp || 0)))
    : 1;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.timing(progressAnim, { toValue: xpProgress, duration: 1200, useNativeDriver: false }).start();

    // Pulse for rank badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [xpProgress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getLevelEmoji = () => {
    if (!level?.name) return '🌱';
    const n = level.name.toLowerCase();
    if (n.includes('newcomer') || n.includes('beginner')) return '🌱';
    if (n.includes('explorer')) return '🗺️';
    if (n.includes('warrior') || n.includes('fighter')) return '⚔️';
    if (n.includes('master') || n.includes('champion')) return '👑';
    return '⭐';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <ConferenceHeader />

      {/* XP Hero Card */}
      <Animated.View style={[styles.xpCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={[COLORS.surface, '#1e1b4b']}
          style={styles.xpCardGradient}
        >
          {/* User info row */}
          <View style={styles.userRow}>
            <View style={styles.avatarRing}>
              <Text style={styles.avatarEmoji}>{getLevelEmoji()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, isRTL && { textAlign: 'right' }]}>
                {currentUser?.name || 'Explorer'}
              </Text>
              <Text style={[styles.levelName, isRTL && { textAlign: 'right' }]}>
                {level?.name || 'Newcomer'}
              </Text>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.xpCurrent}>{totalXp} XP</Text>
              <View style={styles.progressRight}>
                {rank && (
                  <Animated.View style={[styles.rankBadge, { transform: [{ scale: pulseAnim }] }]}>
                    <Text style={styles.rankText}>#{rank}</Text>
                  </Animated.View>
                )}
                {level?.maxXp && <Text style={styles.xpMax}>{level.maxXp} XP</Text>}
              </View>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth as any }]}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.indigo + '20' }]}>
                <Ionicons name="book" size={18} color={COLORS.indigo} />
              </View>
              <Text style={styles.statValue}>{conferenceXp}</Text>
              <Text style={styles.statLabel}>{lang === 'ar' ? 'المؤتمر' : 'Conference'}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="football" size={18} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>{sportsXp}</Text>
              <Text style={styles.statLabel}>{lang === 'ar' ? 'الرياضة' : 'Sports'}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.accent + '20' }]}>
                <Ionicons name="star" size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>{totalXp}</Text>
              <Text style={styles.statLabel}>{lang === 'ar' ? 'الإجمالي' : 'Total'}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Slogan */}
      <Animated.View style={[styles.sloganCard, { opacity: fadeAnim }]}>
        <Text style={styles.sloganEmoji}>🌸</Text>
        <Text style={styles.sloganText}>
          {lang === 'ar'
            ? 'اكتشف هدفك • عِش شغفك • حقق رسالتك'
            : 'Discover your purpose • Live your passion • Fulfill your mission'}
        </Text>
        <Text style={styles.sloganEmoji}>🌸</Text>
      </Animated.View>

      {/* About */}
      <Animated.View style={[styles.aboutCard, { opacity: fadeAnim }]}>
        <View style={styles.aboutHeader}>
          <Text style={styles.aboutIcon}>⛩️</Text>
          <Text style={styles.aboutTitle}>
            {lang === 'ar' ? 'عن المؤتمر' : 'About the Conference'}
          </Text>
        </View>
        <Text style={[styles.aboutText, { textAlign: 'center' }]}>
          {lang === 'ar'
            ? 'إيكيغاي هي رحلة لاكتشاف الذات والهدف من الحياة من خلال أنشطة تفاعلية، مسابقات، رياضة، وعبادة. اكتسب نقاط الخبرة وارتقِ بمستواك!'
            : 'IKIGAI Quest is a journey of self-discovery through interactive activities, quizzes, sports, and worship. Earn XP and level up!'}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },
  xpCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xpCardGradient: { padding: SPACING.lg },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
  },
  avatarEmoji: { fontSize: 26 },
  userInfo: { flex: 1, marginLeft: SPACING.md },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  levelName: { fontSize: 13, color: COLORS.secondary, marginTop: 2 },
  rankBadge: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accent + '50',
  },
  rankText: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  progressSection: { marginBottom: SPACING.lg },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpCurrent: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  xpMax: { fontSize: 11, color: COLORS.textSecondary },
  progressTrack: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5, overflow: 'hidden' },
  progressGradient: { flex: 1 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textSecondary },
  sloganCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    gap: SPACING.sm,
  },
  sloganEmoji: { fontSize: 18 },
  sloganText: { fontSize: 12, color: COLORS.text, textAlign: 'center', flex: 1, lineHeight: 18 },
  aboutCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  aboutIcon: { fontSize: 20 },
  aboutTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  aboutText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});
