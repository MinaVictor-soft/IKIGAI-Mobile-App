import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLeaderboard, useTribeLeaderboard } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';
import { LeaderboardEntry, Tribe } from '../types';

type Tab = 'individual' | 'tribes';

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<Tab>('individual');
  const { user } = useAuth();
  const { t, isRTL } = useLang();
  const { data: leaderboard, refetch: refetchLb, isLoading: lbLoading } = useLeaderboard();
  const { data: tribes, refetch: refetchTribes, isLoading: tribesLoading } = useTribeLeaderboard();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLb(), refetchTribes()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ConferenceHeader />
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>{t('leaderboard')}</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'individual' && styles.tabActive]}
            onPress={() => setTab('individual')}
          >
            <Text style={[styles.tabText, tab === 'individual' && styles.tabTextActive]}>
              {t('individual')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'tribes' && styles.tabActive]}
            onPress={() => setTab('tribes')}
          >
            <Text style={[styles.tabText, tab === 'tribes' && styles.tabTextActive]}>
              {t('tribes')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'individual' ? (
        <FlatList
          data={leaderboard || []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <LeaderboardRow entry={item} rank={index + 1} isMe={item.id === user?.id} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No entries yet</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={tribes || []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <TribeRow tribe={item} rank={index + 1} isMyTribe={item.id === (user?.tribeId || user?.tribe?.id)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No tribes yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function LeaderboardRow({ entry, rank, isMe }: { entry: LeaderboardEntry; rank: number; isMe: boolean }) {
  const rankColor = rank === 1 ? COLORS.gold : rank === 2 ? COLORS.silver : rank === 3 ? COLORS.bronze : COLORS.textMuted;

  return (
    <View style={[styles.row, isMe && styles.rowHighlight]}>
      <View style={styles.rankContainer}>
        {rank <= 3 ? (
          <Text style={[styles.rankMedal, { color: rankColor }]}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </Text>
        ) : (
          <Text style={styles.rankNumber}>{rank}</Text>
        )}
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowNameContainer}>
          <Text style={styles.rowName} numberOfLines={1}>{entry.name}</Text>
          {entry.level && (
            <Text style={styles.rowLevel}>{entry.level.badgeEmoji || '⭐'} {entry.level.name}</Text>
          )}
        </View>
        {entry.tribe && (
          <View style={[styles.tribeBadge, { backgroundColor: entry.tribe.color + '20' }]}>
            <Text style={[styles.tribeBadgeText, { color: entry.tribe.color }]}>
              {entry.tribe.name}
            </Text>
          </View>
        )}
        <View style={styles.xpDetails}>
          <Text style={styles.xpDetailItem}>📖 {entry.conferenceXp || 0}</Text>
          <Text style={styles.xpDetailItem}>⚽ {entry.sportsXp || 0}</Text>
        </View>
      </View>
      <View style={styles.xpColumn}>
        <Text style={styles.rowXp}>{entry.totalXp}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
}

function TribeRow({ tribe, rank, isMyTribe }: { tribe: Tribe; rank: number; isMyTribe: boolean }) {
  return (
    <View style={[styles.row, isMyTribe && styles.tribeHighlight]}>
      <View style={[styles.tribeAvatar, { backgroundColor: tribe.color || COLORS.primary }]}>
        <Text style={styles.tribeAvatarText}>{rank}</Text>
      </View>
      <View style={styles.rowContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.rowName}>{tribe.name}</Text>
          {isMyTribe && (
            <View style={styles.myTeamBadge}>
              <Text style={styles.myTeamText}>⭐ You</Text>
            </View>
          )}
        </View>
        <Text style={styles.tribeMembers}>{tribe.memberCount || 0} members</Text>
      </View>
      <View style={styles.xpColumn}>
        <Text style={styles.rowXp}>{tribe.totalXp}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowHighlight: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  tribeHighlight: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '12',
    borderWidth: 2,
  },
  myTeamBadge: {
    backgroundColor: COLORS.accent + '25',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  myTeamText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankMedal: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  rowContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  rowNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    flexShrink: 1,
  },
  rowLevel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  tribeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  tribeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  rowXp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  xpLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  xpColumn: {
    alignItems: 'center',
    minWidth: 50,
  },
  xpDetails: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  xpDetailItem: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  tribeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tribeAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  tribeMembers: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  textRTL: {
    textAlign: 'right',
  },
});
