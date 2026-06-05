import React from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFootballMatches, useFootballLeaderboard, useMyTeam } from '../hooks/useApi';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';
import { FootballMatch } from '../types';

export default function SportsScreen() {
  const { data: matches, refetch } = useFootballMatches();
  const { data: standings } = useFootballLeaderboard();
  const { data: myTeam } = useMyTeam();
  const { lang, isRTL } = useLang();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const upcoming = (matches || []).filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
  const completed = (matches || []).filter(m => m.status === 'COMPLETED');

  const sections = [
    ...(upcoming.length > 0 ? [{ title: lang === 'ar' ? '📅 المباريات القادمة' : '📅 Upcoming Matches', data: upcoming }] : []),
    ...(completed.length > 0 ? [{ title: lang === 'ar' ? '✅ المباريات المنتهية' : '✅ Completed Matches', data: completed }] : []),
  ];

  return (
    <View style={styles.container}>
      <ConferenceHeader />
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {lang === 'ar' ? '⚽ الرياضة' : '⚽ Sports'}
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {lang === 'ar' ? 'المباريات والنتائج' : 'Matches & Results'}
        </Text>
      </View>

      {/* Standings */}
      {standings && (standings as any[]).length > 0 && (
        <View style={styles.standingsCard}>
          <Text style={[styles.standingsTitle, isRTL && styles.textRTL]}>
            {lang === 'ar' ? '🏆 ترتيب الفرق' : '🏆 Standings'}
          </Text>
          {/* Table Header */}
          <View style={[styles.standingRow, styles.standingHeaderRow, isRTL && styles.rowRTL]}>
            <Text style={[styles.standingRank, styles.tableHeader]}>#</Text>
            <View style={{ width: 10 }} />
            <Text style={[styles.standingName, styles.tableHeader, isRTL && styles.textRTL]}>{lang === 'ar' ? 'الفريق' : 'Team'}</Text>
            <Text style={[styles.tableHeaderCol, { width: 24 }]}>P</Text>
            <Text style={[styles.tableHeaderCol, { width: 24 }]}>W</Text>
            <Text style={[styles.tableHeaderCol, { width: 24 }]}>D</Text>
            <Text style={[styles.tableHeaderCol, { width: 24 }]}>L</Text>
            <Text style={[styles.tableHeaderCol, { width: 28 }]}>GD</Text>
            <Text style={[styles.tableHeaderCol, { width: 32 }]}>Pts</Text>
          </View>
          {(standings as any[]).map((team: any, idx: number) => {
            const isMyTeam = myTeam?.id === team.id;
            return (
            <View key={team.id} style={[styles.standingRow, isRTL && styles.rowRTL, isMyTeam && styles.standingRowHighlight]}>
              <Text style={styles.standingRank}>{idx + 1}</Text>
              <View style={[styles.teamDot, { backgroundColor: team.color || COLORS.primary }]} />
              <Text style={[styles.standingName, isRTL && styles.textRTL]} numberOfLines={1}>{team.name}</Text>
              {isMyTeam && <View style={styles.myTeamBadge}><Text style={styles.myTeamText}>⭐</Text></View>}
              <Text style={styles.standingCol}>{team.played || 0}</Text>
              <Text style={styles.standingCol}>{team.wins}</Text>
              <Text style={styles.standingCol}>{team.draws}</Text>
              <Text style={styles.standingCol}>{team.losses}</Text>
              <Text style={[styles.standingCol, { width: 28, color: (team.goalDifference || 0) >= 0 ? COLORS.success : COLORS.error }]}>
                {(team.goalDifference || 0) > 0 ? '+' : ''}{team.goalDifference || 0}
              </Text>
              <Text style={[styles.standingPoints]}>{team.points}</Text>
            </View>
            );
          })}
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, isRTL && styles.textRTL]}>{section.title}</Text>
        )}
        renderItem={({ item }) => <MatchCard match={item} lang={lang} isRTL={isRTL} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="football-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{lang === 'ar' ? 'لا توجد مباريات' : 'No Matches Yet'}</Text>
            <Text style={styles.emptyText}>{lang === 'ar' ? 'ستظهر المباريات هنا' : 'Football matches will appear here'}</Text>
          </View>
        }
        ListFooterComponent={null}
      />
    </View>
  );
}

function MatchCard({ match, lang, isRTL }: { match: FootballMatch; lang: string; isRTL: boolean }) {
  const statusColor = match.status === 'LIVE' ? COLORS.error : match.status === 'COMPLETED' ? COLORS.success : COLORS.accent;
  const statusLabel = match.status === 'LIVE' ? (lang === 'ar' ? '🔴 مباشر' : '🔴 LIVE')
    : match.status === 'COMPLETED' ? (lang === 'ar' ? 'انتهت' : 'Finished')
    : (lang === 'ar' ? 'قادمة' : 'Upcoming');

  return (
    <View style={styles.matchCard}>
      <View style={[styles.matchStatus, isRTL && styles.rowRTL]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        <Text style={styles.matchDate}>
          {new Date(match.scheduledAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={styles.matchTeams}>
        <View style={styles.team}>
          <View style={[styles.teamColorStrip, { backgroundColor: match.homeTeam.color || COLORS.primary }]} />
          <Text style={styles.teamName}>{match.homeTeam.name}</Text>
        </View>
        <View style={styles.scoreContainer}>
          {match.status !== 'SCHEDULED' ? (
            <>
              <Text style={styles.score}>{match.homeScore}</Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.score}>{match.awayScore}</Text>
            </>
          ) : (
            <Text style={styles.vsText}>VS</Text>
          )}
        </View>
        <View style={[styles.team, { justifyContent: 'flex-end' }]}>
          <Text style={[styles.teamName, { textAlign: 'right' }]}>{match.awayTeam.name}</Text>
          <View style={[styles.teamColorStrip, { backgroundColor: match.awayTeam.color || COLORS.secondary }]} />
        </View>
      </View>

      {/* XP Rewards */}
      <View style={styles.xpRewards}>
        <View style={styles.xpRewardItem}>
          <Text style={styles.xpRewardLabel}>🏆 {lang === 'ar' ? 'فوز' : 'Win'}</Text>
          <Text style={styles.xpRewardValue}>+{match.winXp}</Text>
        </View>
        <View style={styles.xpRewardItem}>
          <Text style={styles.xpRewardLabel}>🤝 {lang === 'ar' ? 'تعادل' : 'Draw'}</Text>
          <Text style={styles.xpRewardValue}>+{match.drawXp}</Text>
        </View>
        <View style={styles.xpRewardItem}>
          <Text style={styles.xpRewardLabel}>💪 {lang === 'ar' ? 'خسارة' : 'Loss'}</Text>
          <Text style={styles.xpRewardValue}>+{match.lossXp}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: SPACING.xs, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  standingsCard: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  standingsTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  standingHeaderRow: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6, marginBottom: 4 },
  tableHeader: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  tableHeaderCol: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
  standingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: SPACING.xs },
  standingRowHighlight: { backgroundColor: COLORS.accent + '12', borderRadius: BORDER_RADIUS.sm, marginHorizontal: -4, paddingHorizontal: 4, borderWidth: 1, borderColor: COLORS.accent + '40' },
  myTeamBadge: { marginRight: 2 },
  myTeamText: { fontSize: 10 },
  standingRank: { fontSize: 13, fontWeight: 'bold', color: COLORS.textSecondary, width: 20, textAlign: 'center' },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  standingName: { flex: 1, fontSize: 13, color: COLORS.text },
  standingCol: { fontSize: 12, color: COLORS.textSecondary, width: 24, textAlign: 'center' },
  standingPoints: { fontSize: 13, fontWeight: '700', color: COLORS.primary, width: 32, textAlign: 'center' },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  sectionHeader: { fontSize: 15, fontWeight: '600', color: COLORS.text, paddingVertical: SPACING.sm, marginTop: SPACING.sm },
  matchCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  matchStatus: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  matchTeams: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  team: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamColorStrip: { width: 4, height: 24, borderRadius: 2 },
  teamName: { fontSize: 15, fontWeight: '600', color: COLORS.text, flexShrink: 1 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md },
  score: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  scoreSeparator: { fontSize: 18, color: COLORS.textMuted },
  vsText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  matchDate: { fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto' },
  xpRewards: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.xs },
  xpRewardItem: { flex: 1, alignItems: 'center' },
  xpRewardLabel: { fontSize: 11, color: COLORS.textSecondary },
  xpRewardValue: { fontSize: 13, fontWeight: '700', color: COLORS.success, marginTop: 2 },
  empty: { alignItems: 'center', padding: SPACING.xxl, gap: SPACING.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  textRTL: { textAlign: 'right' },
  rowRTL: { flexDirection: 'row-reverse' },
});
