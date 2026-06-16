import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTournaments, useTournament, useTournamentBracket } from '../hooks/useApi';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';

export default function TournamentScreen() {
  const { data: tournaments, refetch } = useTournaments();
  const { lang, isRTL } = useLang();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ConferenceHeader />
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {lang === 'ar' ? '🏆 البطولات' : '🏆 Tournaments'}
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {lang === 'ar' ? 'عرض جميع البطولات والأقواس' : 'View all tournaments & brackets'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {!tournaments || tournaments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{lang === 'ar' ? 'لا توجد بطولات' : 'No Tournaments'}</Text>
            <Text style={styles.emptyText}>{lang === 'ar' ? 'ستظهر البطولات هنا' : 'Tournaments will appear here'}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {tournaments.map((tournament: any) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                isSelected={selectedTournament === tournament.id}
                onPress={() => setSelectedTournament(selectedTournament === tournament.id ? null : tournament.id)}
                lang={lang}
                isRTL={isRTL}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TournamentCard({ tournament, isSelected, onPress, lang, isRTL }: any) {
  const { data: bracket } = useTournamentBracket(isSelected ? tournament.id : '');

  const statusColor = tournament.status === 'PLANNING' ? COLORS.accent
    : tournament.status === 'GROUP_STAGE' ? COLORS.warning
    : tournament.status === 'KNOCKOUT' ? COLORS.primary
    : COLORS.success;

  const statusLabel = tournament.status === 'PLANNING' ? (lang === 'ar' ? '📋 قيد التخطيط' : '📋 Planning')
    : tournament.status === 'GROUP_STAGE' ? (lang === 'ar' ? '📊 المرحلة الجماعية' : '📊 Group Stage')
    : tournament.status === 'KNOCKOUT' ? (lang === 'ar' ? '🔥 مرحلة خروج المغلوب' : '🔥 Knockout')
    : (lang === 'ar' ? '🎉 مكتملة' : '🎉 Completed');

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.tournamentName, isRTL && styles.textRTL]} numberOfLines={1}>
            {tournament.name || tournament.nameAr || 'Tournament'}
          </Text>
          <MaterialIcons
            name={isSelected ? 'expand-less' : 'expand-more'}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={[styles.statusRow, isRTL && styles.rowRTL]}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          {tournament.winner && (
            <View style={styles.championBadge}>
              <Text style={styles.championText}>👑 {tournament.winner.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isSelected && (
        <View style={styles.expandedContent}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isRTL && styles.textRTL]}>
              {lang === 'ar' ? 'عدد الفرق:' : 'Teams:'}
            </Text>
            <Text style={styles.infoValue}>{tournament.numberOfGroups * tournament.teamsPerGroup}</Text>
          </View>

          {tournament.status === 'GROUP_STAGE' && tournament.groups && tournament.groups.length > 0 && (
            <View style={styles.groupsSection}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {lang === 'ar' ? '📊 ترتيب المجموعات' : '📊 Group Standings'}
              </Text>
              {tournament.groups.map((group: any) => (
                <GroupStandings
                  key={group.id}
                  group={group}
                  lang={lang}
                  isRTL={isRTL}
                />
              ))}
            </View>
          )}

          {tournament.status === 'KNOCKOUT' && (
            <CupLevelsDisplay tournament={tournament} lang={lang} isRTL={isRTL} />
          )}

          {tournament.tournamentMatches && tournament.tournamentMatches.length > 0 && (
            <View style={styles.matchesSection}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {lang === 'ar' ? '⚽ آخر المباريات' : '⚽ Matches'}
              </Text>
              {tournament.tournamentMatches.slice(0, 5).map((match: any) => (
                <MatchRow key={match.id} match={match} lang={lang} isRTL={isRTL} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function GroupStandings({ group, lang, isRTL }: any) {
  return (
    <View style={styles.groupCard}>
      <Text style={[styles.groupName, isRTL && styles.textRTL]}>
        {group.groupName}
      </Text>
      <View style={[styles.standingRow, styles.headerRow, isRTL && styles.rowRTL]}>
        <Text style={styles.teamCol}>{lang === 'ar' ? 'الفريق' : 'Team'}</Text>
        <Text style={styles.statCol}>P</Text>
        <Text style={styles.statCol}>W</Text>
        <Text style={styles.statCol}>D</Text>
        <Text style={styles.statCol}>L</Text>
        <Text style={styles.statCol}>Pts</Text>
      </View>
      {group.teams && group.teams.map((teamRecord: any, idx: number) => (
        <View key={teamRecord.id} style={[styles.standingRow, isRTL && styles.rowRTL]}>
          <Text style={[styles.teamCol, styles.teamName, isRTL && styles.textRTL]}>
            {idx + 1}. {teamRecord.team?.name}
          </Text>
          <Text style={styles.statCol}>{teamRecord.played}</Text>
          <Text style={styles.statCol}>{teamRecord.won}</Text>
          <Text style={styles.statCol}>{teamRecord.drawn}</Text>
          <Text style={styles.statCol}>{teamRecord.lost}</Text>
          <Text style={[styles.statCol, styles.pointsCol]}>{teamRecord.points}</Text>
        </View>
      ))}
    </View>
  );
}

function ProfessionalMatchCard({ match, lang, isRTL, isFinal }: any) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';
  
  return (
    <View style={[
      styles.professionalMatchCard,
      isCompleted && styles.matchCompleted,
      isLive && styles.matchLive,
      isFinal && styles.matchFinal
    ]}>
      {/* First Team */}
      <View style={styles.profTeamContainer}>
        <View style={styles.profTeamContent}>
          <Text style={[styles.profTeamName, isRTL && styles.textRTL]} numberOfLines={1}>
            {match.team1?.name || (lang === 'ar' ? 'قريباً' : 'TBD')}
          </Text>
        </View>
        {isCompleted && (
          <Text style={[styles.profScore, styles.scoreWon]}>
            {match.team1Goals ?? '-'}
          </Text>
        )}
      </View>

      {/* vs / status */}
      <View style={styles.profVsContainer}>
        {isCompleted ? (
          <Text style={styles.profVsText}>
            {match.team1Goals === match.team2Goals ? (
              lang === 'ar' ? 'تعادل' : 'Draw'
            ) : (
              lang === 'ar' ? 'مكتملة' : 'Done'
            )}
          </Text>
        ) : isLive ? (
          <Text style={styles.profLiveIndicator}>🔴 LIVE</Text>
        ) : (
          <Text style={styles.profVsText}>vs</Text>
        )}
      </View>

      {/* Second Team */}
      <View style={styles.profTeamContainer}>
        {isCompleted && (
          <Text style={[styles.profScore, styles.scoreWon]}>
            {match.team2Goals ?? '-'}
          </Text>
        )}
        <View style={styles.profTeamContent}>
          <Text style={[styles.profTeamName, isRTL && styles.textRTL]} numberOfLines={1}>
            {match.team2?.name || (lang === 'ar' ? 'قريباً' : 'TBD')}
          </Text>
        </View>
      </View>
    </View>
  );
}

function BracketMatchCard({ match, lang, isRTL }: any) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';
  const isPending = !isCompleted && !isLive;
  const winner = match.winner;
  const team1Won = match.team1Id === match.winnerId;
  const team2Won = match.team2Id === match.winnerId;

  return (
    <View style={[
      styles.bracketMatchCard,
      isCompleted && styles.bracketMatchCompleted,
      isLive && styles.bracketMatchLive
    ]}>
      {/* Match Status Badge */}
      <View style={[styles.statusBadgeSmall, isCompleted && styles.statusCompleted, isLive && styles.statusLive]}>
        <Text style={styles.statusText}>
          {isLive ? '🔴' : isCompleted ? '✓' : '⏳'}
        </Text>
      </View>

      {/* Team 1 */}
      <View style={[styles.bracketTeamRow, team1Won && styles.winnerRow]}>
        <Text style={[styles.bracketTeamName, isRTL && styles.textRTL, team1Won && styles.winnerText]} numberOfLines={1}>
          {match.team1?.name || 'TBD'}
        </Text>
        {isCompleted && (
          <Text style={[styles.bracketScore, team1Won && styles.winnerScore]}>
            {match.team1Goals ?? '-'}
          </Text>
        )}
      </View>

      {/* vs / Divider */}
      <Text style={styles.bracketVs}>vs</Text>

      {/* Team 2 */}
      <View style={[styles.bracketTeamRow, team2Won && styles.winnerRow]}>
        <Text style={[styles.bracketTeamName, isRTL && styles.textRTL, team2Won && styles.winnerText]} numberOfLines={1}>
          {match.team2?.name || 'TBD'}
        </Text>
        {isCompleted && (
          <Text style={[styles.bracketScore, team2Won && styles.winnerScore]}>
            {match.team2Goals ?? '-'}
          </Text>
        )}
      </View>

      {/* Status Text */}
      {isCompleted && (
        <Text style={[styles.statusTextSmall, { marginTop: 8 }]}>
          {lang === 'ar' ? 'مكتملة' : 'Completed'}
        </Text>
      )}
      {isPending && (
        <Text style={[styles.statusTextSmall, styles.pendingText, { marginTop: 8 }]}>
          {lang === 'ar' ? 'قادمة' : 'Pending'}
        </Text>
      )}
      {isLive && (
        <Text style={[styles.statusTextSmall, styles.liveText, { marginTop: 8 }]}>
          {lang === 'ar' ? 'مباشر' : 'LIVE'}
        </Text>
      )}
    </View>
  );
}

function CupLevelsDisplay({ tournament, lang, isRTL }: any) {
  const knockoutStagesOrder = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
  const stageLabels: any = {
    ROUND_OF_32: { ar: '🏆 دور الـ32', en: '🏆 Round of 32' },
    ROUND_OF_16: { ar: '🥇 دور الـ16', en: '🥇 Round of 16' },
    QUARTER_FINAL: { ar: '🥈 ربع النهائي', en: '🥈 Quarter-Finals' },
    SEMI_FINAL: { ar: '🥉 نصف النهائي', en: '🥉 Semifinals' },
    FINAL: { ar: '🏆 النهائي', en: '🏆 Final' }
  };

  // Get all unique stages present in matches
  const availableStages = Array.from(
    new Set(tournament.tournamentMatches?.map((m: any) => m.stage) || [])
  ).filter((stage: any) => knockoutStagesOrder.includes(stage));

  return (
    <View style={styles.verticalBracketContainer}>
      <Text style={[styles.bracketTitle, isRTL && styles.textRTL]}>
        {lang === 'ar' ? '🎯 شجرة خروج المغلوب' : '🎯 Knockout Bracket'}
      </Text>
      
      {tournament.tournamentMatches && availableStages.length > 0 ? (
        <>
          {/* Render knockout stages - only show upcoming stages if previous stage has completed matches */}
          {knockoutStagesOrder.map((stage: string, stageIndex: number) => {
            let stageMatches = tournament.tournamentMatches?.filter((m: any) => m.stage === stage) || [];
            
            // If no matches exist for this stage, check if we should generate placeholders
            if (stageMatches.length === 0) {
              // Only generate placeholders if previous stage has COMPLETED matches
              if (stageIndex > 0) {
                const prevStage = knockoutStagesOrder[stageIndex - 1];
                const prevMatches = tournament.tournamentMatches?.filter((m: any) => m.stage === prevStage) || [];
                
                // Only generate placeholders if previous stage has at least one COMPLETED match
                const completedPrevMatches = prevMatches.filter((m: any) => m.status === 'COMPLETED');
                
                if (completedPrevMatches.length > 0) {
                  // Calculate expected number of matches in this stage (half of previous stage)
                  const placeholderCount = Math.ceil(prevMatches.length / 2);
                  
                  // Generate placeholder matches using actual winners
                  for (let i = 0; i < placeholderCount; i++) {
                    const match1 = prevMatches[i * 2];
                    const match2 = prevMatches[i * 2 + 1];
                    
                    // Get winner from match1 (or TBD if not completed yet)
                    let team1Name = lang === 'ar' ? 'قريباً' : 'TBD';
                    let team1Id = null;
                    if (match1?.status === 'COMPLETED' && match1?.winnerId) {
                      const winner = match1.team1Id === match1.winnerId ? match1.team1 : match1.team2;
                      team1Name = winner?.name || team1Name;
                      team1Id = winner?.id;
                    }
                    
                    // Get winner from match2 (or TBD if not completed yet)
                    let team2Name = lang === 'ar' ? 'قريباً' : 'TBD';
                    let team2Id = null;
                    if (match2?.status === 'COMPLETED' && match2?.winnerId) {
                      const winner = match2.team1Id === match2.winnerId ? match2.team1 : match2.team2;
                      team2Name = winner?.name || team2Name;
                      team2Id = winner?.id;
                    }
                    
                    stageMatches.push({
                      id: `placeholder-${stage}-${i}`,
                      stage: stage,
                      status: 'SCHEDULED',
                      team1: { id: team1Id || 'placeholder-1', name: team1Name },
                      team2: { id: team2Id || 'placeholder-2', name: team2Name },
                      team1Id: team1Id,
                      team2Id: team2Id,
                      winnerId: null,
                      team1Goals: null,
                      team2Goals: null
                    });
                  }
                }
              }
            }
            
            // Skip rendering if still no matches (upcoming stage with no completed previous matches)
            if (stageMatches.length === 0) return null;

            return (
              <View key={stage} style={{ marginTop: SPACING.lg }}>
                <Text style={[styles.roundTitle, isRTL && styles.textRTL]}>
                  {lang === 'ar' ? stageLabels[stage]?.ar : stageLabels[stage]?.en}
                </Text>
                <View style={[styles.bracketRoundContainer, stage === 'FINAL' && { justifyContent: 'center' }]}>
                  {stageMatches.map((match: any) => (
                    <BracketMatchCard key={match.id} match={match} lang={lang} isRTL={isRTL} />
                  ))}
                </View>
              </View>
            );
          })}

          {/* Winner */}
          {tournament.winner && (
            <View style={[styles.winnerBox, { marginTop: SPACING.lg }]}>
              <Text style={styles.winnerIcon}>🏆</Text>
              <Text style={[styles.winnerName, isRTL && styles.textRTL]}>
                {lang === 'ar' ? 'البطل: ' : 'Champion: '}{tournament.winner.name}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.bracketStage}>
          <Text style={[styles.noDataText, isRTL && styles.textRTL]}>
            {lang === 'ar' ? 'لا توجد مباريات بعد' : 'No matches yet'}
          </Text>
        </View>
      )}
    </View>
  );
}

function BracketView({ bracket, lang, isRTL }: any) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.bracketScroll}>
      <View style={styles.bracketContainer}>
        {bracket && bracket.stages && bracket.stages.map((stage: any, idx: number) => (
          <View key={idx} style={styles.stageColumn}>
            <Text style={[styles.stageName, isRTL && styles.textRTL]}>
              {stage.name}
            </Text>
            {stage.matches && stage.matches.map((match: any) => (
              <View key={match.id} style={styles.bracketMatch}>
                <Text style={styles.bracketTeam} numberOfLines={1}>
                  {match.team1?.name || 'TBD'}
                </Text>
                <Text style={styles.bracketScore}>
                  {match.team1Goals ?? '-'} - {match.team2Goals ?? '-'}
                </Text>
                <Text style={styles.bracketTeam} numberOfLines={1}>
                  {match.team2?.name || 'TBD'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function MatchRow({ match, lang, isRTL }: any) {
  return (
    <View style={[styles.matchRow, isRTL && styles.rowRTL]}>
      <View style={styles.matchTeam}>
        <Text style={[styles.matchTeamName, isRTL && styles.textRTL]} numberOfLines={1}>
          {match.team1?.name}
        </Text>
      </View>
      <Text style={styles.matchScore}>
        {match.team1Goals ?? '-'} - {match.team2Goals ?? '-'}
      </Text>
      <View style={styles.matchTeam}>
        <Text style={[styles.matchTeamName, isRTL && styles.textRTL]} numberOfLines={1}>
          {match.team2?.name}
        </Text>
      </View>
    </View>
  );
}

// Responsive helpers for mobile/tablet
const windowWidth = Dimensions.get('window').width;
const isMobile = windowWidth < 768;
const isTablet = windowWidth >= 768 && windowWidth < 1024;

const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  championBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  championText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  expandedContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  groupsSection: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.md,
  },
  groupCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  groupName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  standingRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  teamCol: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  teamName: {
    color: COLORS.text,
    fontWeight: '500',
  },
  statCol: {
    width: 32,
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: '500',
  },
  pointsCol: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bracketSection: {
    marginVertical: SPACING.md,
  },
  bracketScroll: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  bracketContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  stageColumn: {
    minWidth: 160,
    gap: SPACING.md,
  },
  stageName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  bracketMatch: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    minWidth: 140,
  },
  bracketTeam: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
  },
  bracketScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  matchesSection: {
    marginVertical: SPACING.md,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  matchTeam: {
    flex: 1,
  },
  matchTeamName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  matchScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    minWidth: 50,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  // Vertical Bracket Styles
  verticalBracketContainer: {
    gap: SPACING.md,
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  bracketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  bracketStage: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  stageTitleBox: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  stageCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  bracketMatches: {
    gap: SPACING.md,
  },
  // Professional Match Card
  professionalMatchCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  matchCompleted: {
    borderColor: '#10b98130',
    backgroundColor: '#10b98108',
  },
  matchLive: {
    borderColor: '#EF444430',
    backgroundColor: '#EF444408',
    borderWidth: 2,
  },
  matchFinal: {
    borderColor: COLORS.secondary + '50',
    borderWidth: 2,
    backgroundColor: COLORS.secondary + '15',
  },
  profTeamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  profTeamContent: {
    flex: 1,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    minHeight: 36,
  },
  profTeamName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  profScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    minWidth: 28,
    textAlign: 'center',
  },
  scoreWon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profVsContainer: {
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profVsText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  profLiveIndicator: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EF4444',
    backgroundColor: '#EF444420',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  arrowDown: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  arrowText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  finalCard: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '15',
  },
  championBox: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  championIcon: {
    fontSize: 36,
  },
  championName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.warning,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  // Bracket Styles - Simplified & Responsive
  roundTitle: {
    fontSize: isMobile ? 11 : 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: isMobile ? SPACING.sm : SPACING.md,
    marginBottom: isMobile ? SPACING.sm : SPACING.md,
    paddingHorizontal: isMobile ? SPACING.sm : SPACING.md,
  },
  bracketRoundContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobile ? SPACING.sm : SPACING.md,
    paddingHorizontal: isMobile ? SPACING.sm : SPACING.md,
    justifyContent: isMobile ? 'center' : 'space-around',
    alignItems: 'flex-start',
  },
  simpleMatchCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS,
    padding: isMobile ? SPACING.sm : SPACING.md,
    width: isMobile ? '100%' : '45%',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  finalMatchCard: {
    width: '60%',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '10',
  },
  teamNameSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  teamNameFinal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  vs: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  winnerBox: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  winnerIcon: {
    fontSize: 32,
  },
  winnerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.warning,
    textAlign: 'center',
  },
  bracketMatchCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS,
    padding: isMobile ? SPACING.sm : SPACING.md,
    width: isMobile ? '100%' : isTablet ? '45%' : '48%',
    gap: SPACING.xs,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bracketMatchCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  bracketMatchLive: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444410',
  },
  statusBadgeSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 12,
  },
  statusCompleted: {
    backgroundColor: '#10b98130',
  },
  statusLive: {
    backgroundColor: '#ef444430',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bracketTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isMobile ? SPACING.xs / 2 : SPACING.xs,
    paddingHorizontal: isMobile ? SPACING.xs : SPACING.sm,
  },
  winnerRow: {
    backgroundColor: '#10b98120',
    borderRadius: BORDER_RADIUS,
  },
  bracketTeamName: {
    fontSize: isMobile ? 10 : 12,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  winnerText: {
    fontWeight: '800',
    color: '#10b981',
  },
  bracketScore: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '800',
    color: COLORS.secondary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: isMobile ? SPACING.xs : SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    minWidth: isMobile ? 28 : 32,
    textAlign: 'center',
  },
  winnerScore: {
    backgroundColor: '#10b98140',
    color: '#10b981',
    fontWeight: '900',
  },
  bracketVs: {
    fontSize: isMobile ? 9 : 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  statusTextSmall: {
    fontSize: isMobile ? 9 : 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  pendingText: {
    color: COLORS.warning,
  },
  liveText: {
    color: '#ef4444',
    fontWeight: '900',
  },
});
