import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useMyXpHistory, useAvailableQuizzes, useActiveSessions, useFootballMatches, useMyQuizSubmissions } from '../hooks/useApi';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EventsScreen() {
  const { user } = useAuth();
  const { isRTL, lang } = useLang();
  const { data: history } = useMyXpHistory();
  const { data: quizzes } = useAvailableQuizzes();
  const { data: sessions } = useActiveSessions();
  const { data: matches } = useFootballMatches();
  const { data: submissions } = useMyQuizSubmissions();

  const [expanded, setExpanded] = useState<'upcoming' | 'completed' | null>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const now = new Date();

  const attendedSessionIds = new Set(
    (history || []).filter(tx => tx.sourceType === 'SESSION' && tx.sourceId).map(tx => tx.sourceId)
  );

  const allSessions = sessions || [];
  const upcomingSessions = allSessions.filter(s => !attendedSessionIds.has(s.id) && new Date(s.endTime) > now);
  const completedSessions = allSessions.filter(s => attendedSessionIds.has(s.id) || new Date(s.endTime) <= now);

  const upcomingMatches = (matches || []).filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
  const completedMatches = (matches || []).filter(m => m.status === 'COMPLETED');

  const availableQuizzes = quizzes || [];
  const submittedQuizIds = new Set((submissions || []).map((s: any) => s.quizId));
  const unsubmittedQuizzes = availableQuizzes.filter(q => !submittedQuizIds.has(q.id));
  const completedQuizzes = availableQuizzes.filter(q => submittedQuizIds.has(q.id));

  const upcomingCount = upcomingSessions.length + unsubmittedQuizzes.length + upcomingMatches.length;
  const completedCount = completedMatches.length + completedQuizzes.length + completedSessions.length;

  const toggleSection = (section: 'upcoming' | 'completed') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === section ? null : section);
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const openSession = (s: any, status: string) => setSelectedEvent({ ...s, _type: 'session', _status: status });
  const openQuiz = (q: any, status: string) => setSelectedEvent({ ...q, _type: 'quiz', _status: status });
  const openMatch = (m: any, status: string) => setSelectedEvent({ ...m, _type: 'match', _status: status });

  return (
    <View style={styles.container}>
      <ConferenceHeader />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.screenHeader}>
          <Text style={[styles.screenTitle, isRTL && styles.textRTL]}>
            {lang === 'ar' ? '📋 الأحداث والمهام' : '📋 Events & Missions'}
          </Text>
          <Text style={[styles.screenSubtitle, isRTL && styles.textRTL]}>
            {lang === 'ar' ? 'اضغط على أي حدث لمعرفة التفاصيل' : 'Tap any event for full details'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: COLORS.primary + '40' }]}>
            <Ionicons name="time-outline" size={22} color={COLORS.primary} />
            <Text style={styles.summaryCount}>{upcomingCount}</Text>
            <Text style={styles.summaryLabel}>{lang === 'ar' ? 'قادمة' : 'Upcoming'}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: COLORS.success + '40' }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />
            <Text style={styles.summaryCount}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>{lang === 'ar' ? 'مكتملة' : 'Done'}</Text>
          </View>
        </View>

        {/* Upcoming */}
        {upcomingCount > 0 && (
          <View style={styles.accordionBlock}>
            <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('upcoming')} activeOpacity={0.7}>
              <View style={styles.accordionTitleRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                <Text style={styles.accordionTitle}>{lang === 'ar' ? 'القادمة' : 'Upcoming'}</Text>
                <View style={styles.accordionCount}><Text style={styles.accordionCountText}>{upcomingCount}</Text></View>
              </View>
              <Ionicons name={expanded === 'upcoming' ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expanded === 'upcoming' && (
              <View style={styles.accordionContent}>
                {upcomingSessions.map((s: any) => (
                  <TouchableOpacity key={s.id} style={styles.eventRow} onPress={() => openSession(s, 'upcoming')} activeOpacity={0.7}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: COLORS.primary + '20' }]}><Ionicons name="calendar" size={14} color={COLORS.primary} /></View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventText} numberOfLines={1}>{s.title}</Text>
                      <Text style={styles.eventType}>{lang === 'ar' ? 'جلسة' : 'Session'}{s.startTime ? ` • ${formatTime(s.startTime)}` : ''}</Text>
                    </View>
                    <View style={styles.xpChip}><Text style={styles.xpChipText}>+{s.xpReward}</Text></View>
                    <Ionicons name="eye-outline" size={16} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
                {unsubmittedQuizzes.map((q: any) => (
                  <TouchableOpacity key={q.id} style={styles.eventRow} onPress={() => openQuiz(q, 'upcoming')} activeOpacity={0.7}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: COLORS.success + '20' }]}><Ionicons name="help-circle" size={14} color={COLORS.success} /></View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventText} numberOfLines={1}>{q.title}</Text>
                      <Text style={styles.eventType}>{lang === 'ar' ? 'مسابقة' : 'Quiz'}{q.timeLimitSeconds ? ` • ${Math.floor(q.timeLimitSeconds / 60)}m` : ''}</Text>
                    </View>
                    <View style={styles.xpChip}><Text style={styles.xpChipText}>+{q.xpReward}</Text></View>
                    <Ionicons name="eye-outline" size={16} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
                {upcomingMatches.map((m: any) => (
                  <TouchableOpacity key={m.id} style={styles.eventRow} onPress={() => openMatch(m, 'upcoming')} activeOpacity={0.7}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: COLORS.accent + '20' }]}><Ionicons name="football" size={14} color={COLORS.accent} /></View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventText} numberOfLines={1}>{m.homeTeam.name} vs {m.awayTeam.name}</Text>
                      <Text style={styles.eventType}>{m.status === 'LIVE' ? '🔴 Live' : (lang === 'ar' ? 'مباراة' : 'Match')}</Text>
                    </View>
                    <View style={[styles.xpChip, m.status === 'LIVE' && { backgroundColor: '#EF4444' + '20' }]}>
                      <Text style={[styles.xpChipText, m.status === 'LIVE' && { color: '#EF4444' }]}>{m.status === 'LIVE' ? '🔴' : `+${m.winXp}`}</Text>
                    </View>
                    <Ionicons name="eye-outline" size={16} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Completed */}
        {completedCount > 0 && (
          <View style={styles.accordionBlock}>
            <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('completed')} activeOpacity={0.7}>
              <View style={styles.accordionTitleRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
                <Text style={styles.accordionTitle}>{lang === 'ar' ? 'مكتملة' : 'Completed'}</Text>
                <View style={[styles.accordionCount, { backgroundColor: COLORS.success + '20' }]}><Text style={[styles.accordionCountText, { color: COLORS.success }]}>{completedCount}</Text></View>
              </View>
              <Ionicons name={expanded === 'completed' ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expanded === 'completed' && (
              <View style={styles.accordionContent}>
                {completedSessions.map((s: any) => (
                  <TouchableOpacity key={s.id} style={styles.eventRow} onPress={() => openSession(s, 'completed')} activeOpacity={0.7}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: COLORS.success + '15' }]}><Ionicons name="checkmark" size={14} color={COLORS.success} /></View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventText, { color: COLORS.textSecondary }]} numberOfLines={1}>{s.title}</Text>
                      <Text style={styles.eventType}>{attendedSessionIds.has(s.id) ? '✓ Attended' : 'Ended'}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  </TouchableOpacity>
                ))}
                {completedQuizzes.map((q: any) => (
                  <TouchableOpacity key={q.id} style={styles.eventRow} onPress={() => openQuiz(q, 'completed')} activeOpacity={0.7}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: COLORS.success + '15' }]}><Ionicons name="checkmark" size={14} color={COLORS.success} /></View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventText, { color: COLORS.textSecondary }]} numberOfLines={1}>{q.title}</Text>
                      <Text style={styles.eventType}>Quiz done</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  </TouchableOpacity>
                ))}
                {completedMatches.map((m: any) => (
                  <TouchableOpacity key={m.id} style={styles.eventRow} onPress={() => openMatch(m, 'completed')} activeOpacity={0.7}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: COLORS.success + '15' }]}><Ionicons name="checkmark" size={14} color={COLORS.success} /></View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventText, { color: COLORS.textSecondary }]} numberOfLines={1}>{m.homeTeam.name} {m.homeScore}-{m.awayScore} {m.awayTeam.name}</Text>
                      <Text style={styles.eventType}>Finished</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {upcomingCount === 0 && completedCount === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{lang === 'ar' ? 'لا توجد أحداث حالياً' : 'No events yet'}</Text>
            <Text style={styles.emptySubtitle}>{lang === 'ar' ? 'سيتم عرض الأحداث والمهام هنا' : 'Events and tasks will appear here'}</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedEvent} transparent animationType="fade" onRequestClose={() => setSelectedEvent(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedEvent(null)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            {selectedEvent && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIcon, {
                    backgroundColor: selectedEvent._type === 'session' ? COLORS.primary + '20' :
                      selectedEvent._type === 'quiz' ? COLORS.success + '20' : COLORS.accent + '20'
                  }]}>
                    <Ionicons
                      name={selectedEvent._type === 'session' ? 'calendar' : selectedEvent._type === 'quiz' ? 'help-circle' : 'football'}
                      size={26}
                      color={selectedEvent._type === 'session' ? COLORS.primary : selectedEvent._type === 'quiz' ? COLORS.success : COLORS.accent}
                    />
                  </View>
                  <TouchableOpacity onPress={() => setSelectedEvent(null)} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>
                  {selectedEvent._type === 'match' ? `${selectedEvent.homeTeam.name} vs ${selectedEvent.awayTeam.name}` : selectedEvent.title}
                </Text>

                <View style={[styles.modalBadge, { backgroundColor: selectedEvent._status === 'upcoming' ? COLORS.primary + '15' : COLORS.success + '15' }]}>
                  <Ionicons name={selectedEvent._status === 'upcoming' ? 'time-outline' : 'checkmark-circle'} size={13} color={selectedEvent._status === 'upcoming' ? COLORS.primary : COLORS.success} />
                  <Text style={[styles.modalBadgeText, { color: selectedEvent._status === 'upcoming' ? COLORS.primary : COLORS.success }]}>
                    {selectedEvent._status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </Text>
                </View>

                <View style={styles.modalDivider} />

                {/* Session details */}
                {selectedEvent._type === 'session' && (
                  <View style={styles.detailsList}>
                    {selectedEvent.speaker && <DetailItem icon="person" label="Speaker" value={selectedEvent.speaker} />}
                    {selectedEvent.location && <DetailItem icon="location" label="Location" value={selectedEvent.location} />}
                    {selectedEvent.startTime && (
                      <DetailItem icon="time" label="Time" value={`${formatDate(selectedEvent.startTime)} • ${formatTime(selectedEvent.startTime)}${selectedEvent.endTime ? ' - ' + formatTime(selectedEvent.endTime) : ''}`} />
                    )}
                    {selectedEvent.description && <DetailItem icon="document-text" label="About" value={selectedEvent.description} />}
                    <DetailItem icon="star" label="XP Reward" value={`+${selectedEvent.xpReward} XP`} highlight />
                  </View>
                )}

                {/* Quiz details */}
                {selectedEvent._type === 'quiz' && (
                  <View style={styles.detailsList}>
                    {selectedEvent.timeLimitSeconds && <DetailItem icon="timer" label="Time Limit" value={`${Math.floor(selectedEvent.timeLimitSeconds / 60)} minutes`} />}
                    {selectedEvent.description && <DetailItem icon="document-text" label="About" value={selectedEvent.description} />}
                    <DetailItem icon="star" label="XP Reward" value={`+${selectedEvent.xpReward} XP`} highlight />
                  </View>
                )}

                {/* Match details */}
                {selectedEvent._type === 'match' && (
                  <View style={styles.detailsList}>
                    {selectedEvent.status === 'COMPLETED' && (
                      <View style={styles.matchScore}>
                        <View style={styles.matchTeam}>
                          <View style={[styles.teamDot, { backgroundColor: selectedEvent.homeTeam.color }]} />
                          <Text style={styles.matchTeamName}>{selectedEvent.homeTeam.name}</Text>
                        </View>
                        <Text style={styles.matchScoreText}>{selectedEvent.homeScore} - {selectedEvent.awayScore}</Text>
                        <View style={[styles.matchTeam, { justifyContent: 'flex-end' }]}>
                          <Text style={styles.matchTeamName}>{selectedEvent.awayTeam.name}</Text>
                          <View style={[styles.teamDot, { backgroundColor: selectedEvent.awayTeam.color }]} />
                        </View>
                      </View>
                    )}
                    {selectedEvent.status === 'LIVE' && (
                      <View style={styles.liveIndicator}><Text style={styles.liveText}>🔴 LIVE NOW</Text></View>
                    )}
                    {selectedEvent.scheduledAt && <DetailItem icon="time" label="Scheduled" value={`${formatDate(selectedEvent.scheduledAt)} • ${formatTime(selectedEvent.scheduledAt)}`} />}
                    <DetailItem icon="star" label="Win XP" value={`+${selectedEvent.winXp} XP`} highlight />
                  </View>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DetailItem({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[detailStyles.row, highlight && detailStyles.highlightRow]}>
      <Ionicons name={icon as any} size={16} color={highlight ? COLORS.accent : COLORS.textMuted} />
      <View style={detailStyles.textCol}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={[detailStyles.value, highlight && { color: COLORS.accent, fontWeight: '700' }]}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  highlightRow: { backgroundColor: COLORS.accent + '10', marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 10, marginTop: 4 },
  textCol: { flex: 1 },
  label: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  value: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl, paddingTop: SPACING.sm },
  screenHeader: { marginBottom: SPACING.xl, paddingTop: SPACING.md },
  screenTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  screenSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 4, borderWidth: 1 },
  summaryCount: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary },
  accordionBlock: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md },
  accordionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accordionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  accordionCount: { backgroundColor: COLORS.primary + '20', borderRadius: 10, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  accordionCountText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  accordionContent: { paddingHorizontal: SPACING.sm, paddingBottom: SPACING.sm },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: BORDER_RADIUS.sm, marginBottom: 2 },
  eventTypeBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  eventInfo: { flex: 1 },
  eventText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  eventType: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  xpChip: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  xpChipText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted },
  textRTL: { textAlign: 'right' },
  rowRTL: { flexDirection: 'row-reverse' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 380, borderWidth: 1, borderColor: COLORS.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 19, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  modalBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginBottom: 14 },
  modalBadgeText: { fontSize: 12, fontWeight: '600' },
  modalDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 14 },
  detailsList: { gap: 4 },
  matchScore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.background, borderRadius: 12, padding: 16, marginBottom: 10 },
  matchTeam: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  matchTeamName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  matchScoreText: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  liveIndicator: { backgroundColor: '#EF4444' + '15', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 8 },
  liveText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
});
