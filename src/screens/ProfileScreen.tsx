import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
  TextInput,
  Share,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useMyProfile, useMyXpHistory, useAllLevels, useMyRank } from '../hooks/useApi';
import api from '../lib/api';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import { XpTransaction } from '../types';

// QR Code - conditionally import (won't render on web if SVG not supported)
let QRCode: any = null;
try {
  QRCode = require('react-native-qrcode-svg').default;
} catch (e) {
  // QR code lib not available
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t, isRTL, lang, setLang } = useLang();
  const { data: profile } = useMyProfile();
  const { data: history } = useMyXpHistory();
  const { data: allLevels } = useAllLevels();
  const { data: rankData } = useMyRank();

  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const shareCardRef = useRef<any>(null);

  const currentUser = profile || user;

  const handleShare = async () => {
    const rankStr = rankData ? `#${rankData.rank}/${rankData.total}` : '';
    const textMessage = lang === 'ar'
      ? `🏆 IKIGAI Quest - ${currentUser?.name}\n⚡ ${currentUser?.totalXp || 0} XP\n🎖️ المستوى: ${currentUser?.level?.name || '-'}\n👥 الفريق: ${currentUser?.tribe?.name || '-'}${rankStr ? `\n📊 الترتيب: ${rankStr}` : ''}`
      : `🏆 IKIGAI Quest - ${currentUser?.name}\n⚡ ${currentUser?.totalXp || 0} XP\n🎖️ Level: ${currentUser?.level?.name || '-'}\n👥 Team: ${currentUser?.tribe?.name || '-'}${rankStr ? `\n📊 Rank: ${rankStr}` : ''}`;

    // On native, try to capture card as image
    if (Platform.OS !== 'web' && shareCardRef.current) {
      try {
        const uri = await shareCardRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: lang === 'ar' ? 'شارك تقدمك' : 'Share your progress',
          });
          return;
        }
      } catch {
        // Fall through to text share
      }
    }

    // Text share (works on web and as fallback)
    try {
      await Share.share({ message: textMessage });
    } catch {
      // Share cancelled or unavailable
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t('logoutConfirm'));
      if (confirmed) {
        logout();
      }
    } else {
      Alert.alert(t('logout'), t('logoutConfirm'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  // XP breakdown by source
  const breakdown = (history || []).reduce(
    (acc, tx) => {
      if (tx.sourceType === 'SESSION') acc.attendance += tx.amount;
      else if (tx.sourceType === 'QUIZ') acc.quiz += tx.amount;
      else if (tx.sourceType === 'BONUS_QR' || tx.sourceType === 'STAFF_AWARD') acc.bonus += tx.amount;
      else if (tx.sourceType === 'SPORTS' || tx.sourceType === 'FOOTBALL') acc.sports += tx.amount;
      else if (tx.sourceType === 'ADMIN') {
        if (tx.amount >= 0) acc.rewards += tx.amount;
        else acc.deducted += tx.amount;
      }
      else acc.other += tx.amount;
      return acc;
    },
    { attendance: 0, quiz: 0, bonus: 0, sports: 0, rewards: 0, deducted: 0, other: 0 }
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar & Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{currentUser?.name}</Text>
        <Text style={styles.email}>{currentUser?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{currentUser?.role}</Text>
        </View>
      </View>

      {/* User QR Code - Staff scans this */}
      {currentUser?.userQrToken && (
        <View style={styles.qrSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {lang === 'ar' ? '📱 رمز QR الخاص بك' : '📱 Your QR Code'}
          </Text>
          <Text style={[styles.qrHint, isRTL && styles.textRTL]}>
            {lang === 'ar' ? 'اعرضه للخادم ليمنحك النقاط' : 'Show this to staff to earn points'}
          </Text>
          <View style={styles.qrContainer}>
            {QRCode ? (
              <QRCode
                value={currentUser.userQrToken}
                size={180}
                backgroundColor={COLORS.surface}
                color={COLORS.text}
              />
            ) : (
              <View style={styles.qrFallback}>
                <Ionicons name="qr-code" size={80} color={COLORS.primary} />
                <Text style={styles.qrTokenText}>{currentUser.userQrToken}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Language Switcher */}
      <View style={styles.langSection}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('language')}</Text>
        <View style={styles.langButtons}>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'ar' && styles.langBtnActive]}
            onPress={() => setLang('ar')}
          >
            <Text style={[styles.langBtnText, lang === 'ar' && styles.langBtnTextActive]}>
              العربية
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
            onPress={() => setLang('en')}
          >
            <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard label={t('totalXpLabel')} value={currentUser?.totalXp || 0} icon="flash" color={COLORS.accent} />
        <StatCard label={t('level')} value={currentUser?.level?.name || t('none')} icon="shield" color={COLORS.primary} />
        <StatCard label={t('tribe')} value={currentUser?.tribe?.name || t('none')} icon="people" color={COLORS.success} />
      </View>

      {/* Share Progress Card (captured as image) */}
      <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 1 }}>
        <LinearGradient
          colors={['#1e1b4b', '#0F172A', '#1e1b4b']}
          style={styles.shareCard}
        >
          <View style={styles.shareCardHeader}>
            <View style={styles.shareCardLogos}>
              <Image source={require('../../assets/logo-lagna.png')} style={styles.shareCardLogo} resizeMode="contain" />
              <Image source={require('../../assets/logo-oskofia.png')} style={styles.shareCardLogo} resizeMode="contain" />
            </View>
            <Text style={styles.shareCardBrand}>IKIGAI Quest 🏆</Text>
            <Text style={styles.shareCardJp}>生き甲斐</Text>
          </View>
          <View style={styles.shareCardBody}>
            <Text style={styles.shareCardName}>{currentUser?.name}</Text>
            {rankData && (
              <View style={styles.shareCardRank}>
                <Text style={styles.shareCardRankText}>
                  #{rankData.rank} / {rankData.total}
                </Text>
              </View>
            )}
            <View style={styles.shareCardStats}>
              <View style={styles.shareCardStat}>
                <Text style={styles.shareCardStatValue}>{currentUser?.totalXp || 0}</Text>
                <Text style={styles.shareCardStatLabel}>XP</Text>
              </View>
              <View style={[styles.shareCardStat, styles.shareCardStatCenter]}>
                <Text style={styles.shareCardStatValue}>{currentUser?.level?.badgeEmoji || '⭐'}</Text>
                <Text style={styles.shareCardStatLabel}>{currentUser?.level?.name || '-'}</Text>
              </View>
              <View style={styles.shareCardStat}>
                <Text style={styles.shareCardStatValue}>{currentUser?.tribe?.name || '-'}</Text>
                <Text style={styles.shareCardStatLabel}>{lang === 'ar' ? 'الفريق' : 'Team'}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.shareCardFooter}>
            {lang === 'ar' ? 'مؤتمر لجنة خدمة ثانوى • أسقفية الشباب' : 'Youth Service Conference 2026'}
          </Text>
        </LinearGradient>
      </ViewShot>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.secondary, '#0891B2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareGradient}
        >
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>
            {lang === 'ar' ? 'شارك تقدمك' : 'Share Progress'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Levels Roadmap */}
      {allLevels && allLevels.length > 0 && (
        <View style={styles.levelsSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {lang === 'ar' ? '🏆 مستويات الرحلة' : '🏆 Level Roadmap'}
          </Text>
          <View style={styles.levelsCard}>
            {allLevels.map((lvl: any, idx: number) => {
              const isCurrentLevel = currentUser?.level?.id === lvl.id;
              const isPassed = (currentUser?.totalXp || 0) >= lvl.minXp && !isCurrentLevel && (lvl.maxXp ? (currentUser?.totalXp || 0) > lvl.maxXp : false);
              const progress = isCurrentLevel && lvl.maxXp
                ? Math.min(1, ((currentUser?.totalXp || 0) - lvl.minXp) / (lvl.maxXp - lvl.minXp))
                : isPassed ? 1 : 0;

              return (
                <View key={lvl.id} style={styles.levelRow}>
                  <View style={styles.levelTrack}>
                    <View style={[
                      styles.levelDot,
                      isCurrentLevel && styles.levelDotCurrent,
                      isPassed && styles.levelDotPassed,
                    ]}>
                      <Text style={styles.levelEmoji}>{lvl.badgeEmoji || '⭐'}</Text>
                    </View>
                    {idx < allLevels.length - 1 && (
                      <View style={[styles.levelLine, isPassed && styles.levelLinePassed]} />
                    )}
                  </View>
                  <View style={[styles.levelInfo, isCurrentLevel && styles.levelInfoCurrent]}>
                    <View style={styles.levelHeader}>
                      <Text style={[styles.levelName, isCurrentLevel && styles.levelNameCurrent]}>
                        {lvl.name}
                      </Text>
                      {isCurrentLevel && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>{lang === 'ar' ? 'أنت هنا' : 'You'}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.levelXpRange}>
                      {lvl.minXp} - {lvl.maxXp || '∞'} XP
                    </Text>
                    {isCurrentLevel && lvl.maxXp && (
                      <View style={styles.levelProgressTrack}>
                        <View style={[styles.levelProgressFill, { width: `${progress * 100}%` }]} />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* XP Breakdown & History - Collapsible */}
      <TouchableOpacity
        style={styles.collapseHeader}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setHistoryExpanded(!historyExpanded);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.collapseHeaderRow}>
          <Ionicons name="stats-chart" size={18} color={COLORS.primary} />
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            {lang === 'ar' ? 'سجل النقاط' : 'Points Record'}
          </Text>
          <View style={styles.collapseCount}>
            <Text style={styles.collapseCountText}>{(history || []).length}</Text>
          </View>
        </View>
        <Ionicons name={historyExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {historyExpanded && (
        <View style={styles.collapseContent}>
          {/* XP Breakdown */}
          <View style={styles.breakdownCard}>
            <BreakdownRow label={t('attendanceXp')} value={breakdown.attendance} color={COLORS.primary} isRTL={isRTL} />
            <BreakdownRow label={t('quizXp')} value={breakdown.quiz} color={COLORS.success} isRTL={isRTL} />
            <BreakdownRow label={t('bonusAwards')} value={breakdown.bonus} color={COLORS.accent} isRTL={isRTL} />
            <BreakdownRow label={t('sports')} value={breakdown.sports} color={COLORS.secondary} isRTL={isRTL} />
            {breakdown.rewards !== 0 && (
              <BreakdownRow label={lang === 'ar' ? 'مكافآت' : 'Rewards'} value={breakdown.rewards} color="#10B981" isRTL={isRTL} />
            )}
            {breakdown.deducted !== 0 && (
              <BreakdownRow label={lang === 'ar' ? 'خصم' : 'Deducted'} value={breakdown.deducted} color="#EF4444" isRTL={isRTL} />
            )}
            {breakdown.other !== 0 && (
              <BreakdownRow label={t('other')} value={breakdown.other} color={COLORS.textMuted} isRTL={isRTL} />
            )}
          </View>

          {/* Recent Transactions */}
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('xpHistory')}</Text>
          {(history || []).slice(0, 10).map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} isRTL={isRTL} />
          ))}
          {(!history || history.length === 0) && (
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
          )}
        </View>
      )}

      {/* Change Password */}
      <TouchableOpacity
        style={styles.changePasswordBtn}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShowChangePassword(!showChangePassword);
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="key-outline" size={18} color={COLORS.primary} />
        <Text style={styles.changePasswordBtnText}>
          {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
        </Text>
        <Ionicons name={showChangePassword ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
      {showChangePassword && (
        <View style={styles.changePasswordForm}>
          <TextInput
            style={styles.passwordInput}
            placeholder={lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.passwordInput}
            placeholder={lang === 'ar' ? 'كلمة المرور الجديدة (8+ أحرف)' : 'New Password (8+ chars)'}
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={[styles.savePasswordBtn, changingPassword && { opacity: 0.6 }]}
            disabled={changingPassword}
            onPress={async () => {
              if (!currentPassword || !newPassword) {
                Alert.alert(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'اكتب كلمتي المرور' : 'Fill in both fields');
                return;
              }
              if (newPassword.length < 8) {
                Alert.alert(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' : 'New password must be at least 8 characters');
                return;
              }
              setChangingPassword(true);
              try {
                await api.post('/auth/change-password', { currentPassword, newPassword });
                Alert.alert(lang === 'ar' ? 'تم' : 'Done', lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setShowChangePassword(false);
              } catch (err: any) {
                const msg = err?.response?.data?.error?.message || (lang === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
                Alert.alert(lang === 'ar' ? 'خطأ' : 'Error', msg);
              } finally {
                setChangingPassword(false);
              }
            }}
          >
            <Text style={styles.savePasswordBtnText}>
              {changingPassword ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BreakdownRow({ label, value, color, isRTL }: { label: string; value: number; color: string; isRTL: boolean }) {
  return (
    <View style={[styles.breakdownRow, isRTL && styles.rowRTL]}>
      <View style={[styles.breakdownDot, { backgroundColor: color }]} />
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{value} XP</Text>
    </View>
  );
}

function TransactionRow({ transaction, isRTL }: { transaction: XpTransaction; isRTL: boolean }) {
  return (
    <View style={[styles.txRow, isRTL && styles.rowRTL]}>
      <View style={styles.txContent}>
        <Text style={[styles.txDescription, isRTL && styles.textRTL]}>
          {transaction.description || transaction.sourceType}
        </Text>
        <Text style={[styles.txDate, isRTL && styles.textRTL]}>
          {new Date(transaction.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          { color: transaction.amount > 0 ? COLORS.success : COLORS.error },
        ]}
      >
        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txContent: {
    flex: 1,
  },
  txDescription: {
    fontSize: 14,
    color: COLORS.text,
  },
  txDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '500',
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  changePasswordBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  changePasswordForm: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  savePasswordBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  savePasswordBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  langSection: {
    marginBottom: SPACING.lg,
  },
  langButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  langBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  langBtnTextActive: {
    color: '#fff',
  },
  qrSection: { marginBottom: SPACING.lg, alignItems: 'center' },
  qrHint: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
  qrContainer: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  qrFallback: { alignItems: 'center', gap: SPACING.sm },
  qrTokenText: { fontSize: 10, color: COLORS.textMuted, marginTop: SPACING.sm, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  collapseHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  collapseCount: { backgroundColor: COLORS.primary + '20', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  collapseCountText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  collapseContent: { marginBottom: SPACING.md },
  // Levels roadmap
  levelsSection: { marginBottom: SPACING.lg },
  levelsCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  levelRow: { flexDirection: 'row', alignItems: 'flex-start' },
  levelTrack: { alignItems: 'center', width: 36 },
  levelDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  levelDotCurrent: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20', transform: [{ scale: 1.1 }] },
  levelDotPassed: { borderColor: COLORS.success, backgroundColor: COLORS.success + '20' },
  levelEmoji: { fontSize: 12 },
  levelLine: { width: 2, height: 24, backgroundColor: COLORS.border, marginVertical: 2 },
  levelLinePassed: { backgroundColor: COLORS.success },
  levelInfo: { flex: 1, marginLeft: SPACING.sm, paddingBottom: SPACING.md },
  levelInfoCurrent: { backgroundColor: COLORS.primary + '08', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginBottom: 4 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelName: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  levelNameCurrent: { color: COLORS.primary, fontWeight: '700' },
  currentBadge: { backgroundColor: COLORS.primary + '20', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
  currentBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.primary },
  levelXpRange: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  levelProgressTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 6 },
  levelProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  // Share card
  shareCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  shareCardHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  shareCardLogos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  shareCardLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
  },
  shareCardBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  shareCardJp: {
    fontSize: 12,
    color: COLORS.accent,
    letterSpacing: 3,
    marginTop: 2,
  },
  shareCardBody: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  shareCardName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  shareCardRank: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  shareCardRankText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accent,
  },
  shareCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  shareCardStat: {
    alignItems: 'center',
    flex: 1,
  },
  shareCardStatCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  shareCardStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  shareCardStatLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  shareCardFooter: {
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  shareButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
