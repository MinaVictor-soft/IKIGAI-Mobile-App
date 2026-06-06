import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
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
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
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
            <LeaderboardRow 
              entry={item} 
              rank={index + 1} 
              isMe={item.id === user?.id} 
              onPress={() => setSelectedUser(item)}
            />
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

      {/* User Details Modal */}
      <Modal 
        visible={!!selectedUser} 
        transparent 
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setSelectedUser(null)}
            >
              <Ionicons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {selectedUser && (
                <>
                  <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                    {selectedUser.name}
                  </Text>

                  {/* Church & Diocese */}
                  {(selectedUser.church || selectedUser.diocese) && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionLabel, isRTL && styles.textRTL]}>
                        🏛️ {t('church')}
                      </Text>
                      <Text style={[styles.modalSectionText, isRTL && styles.textRTL]}>
                        {selectedUser.church}
                        {selectedUser.diocese ? ` • ${selectedUser.diocese}` : ''}
                      </Text>
                    </View>
                  )}

                  {/* XP Stats */}
                  <View style={styles.xpGrid}>
                    <View style={styles.xpCard}>
                      <Text style={styles.xpCardLabel}>📖 {t('conferenceXp')}</Text>
                      <Text style={styles.xpCardValue}>{selectedUser.conferenceXp || 0}</Text>
                    </View>
                    <View style={styles.xpCard}>
                      <Text style={styles.xpCardLabel}>⚽ {t('sportsXp')}</Text>
                      <Text style={styles.xpCardValue}>{selectedUser.sportsXp || 0}</Text>
                    </View>
                  </View>

                  {/* Total XP */}
                  <View style={[styles.modalSection, { backgroundColor: COLORS.primary + '20' }]}>
                    <Text style={[styles.modalSectionLabel, { color: COLORS.primary }, isRTL && styles.textRTL]}>
                      {t('totalXp')}
                    </Text>
                    <Text style={[styles.totalXpValue, { color: COLORS.primary }]}>
                      {selectedUser.totalXp}
                    </Text>
                  </View>

                  {/* Level */}
                  {selectedUser.level && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionLabel, isRTL && styles.textRTL]}>
                        ⭐ {t('level')}
                      </Text>
                      <Text style={[styles.modalSectionText, isRTL && styles.textRTL]}>
                        {selectedUser.level.name}
                      </Text>
                    </View>
                  )}

                  {/* Tribe */}
                  {selectedUser.tribe && (
                    <View style={[
                      styles.modalSection, 
                      { 
                        backgroundColor: selectedUser.tribe.color + '20',
                        flexDirection: isRTL ? 'row-reverse' : 'row'
                      }
                    ]}>
                      <View 
                        style={[
                          styles.tribeDot, 
                          { backgroundColor: selectedUser.tribe.color }
                        ]}
                      />
                      <View>
                        <Text style={[styles.modalSectionLabel, isRTL && styles.textRTL]}>
                          {t('tribe')}
                        </Text>
                        <Text style={[
                          styles.modalSectionText, 
                          { color: selectedUser.tribe.color },
                          isRTL && styles.textRTL
                        ]}>
                          {selectedUser.tribe.name}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LeaderboardRow({ entry, rank, isMe, onPress }: { entry: LeaderboardEntry; rank: number; isMe: boolean; onPress: () => void }) {
  const rankColor = rank === 1 ? COLORS.gold : rank === 2 ? COLORS.silver : rank === 3 ? COLORS.bronze : COLORS.textMuted;

  return (
    <TouchableOpacity style={[styles.row, isMe && styles.rowHighlight]} onPress={onPress}>
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
        {(entry.church || entry.diocese) && (
          <Text style={styles.churchText} numberOfLines={1}>
            🏛️ {entry.church}{entry.diocese ? ` • ${entry.diocese}` : ''}
          </Text>
        )}
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
    </TouchableOpacity>
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
  churchText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
    minHeight: '50%',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalScroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.sm,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  modalSection: {
    backgroundColor: COLORS.bg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSectionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  modalSectionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  totalXpValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  xpGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  xpCard: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  xpCardLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  xpCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tribeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
});
