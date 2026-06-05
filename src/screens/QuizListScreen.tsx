import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAvailableQuizzes, useMyQuizSubmissions } from '../hooks/useApi';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';
import { Quiz } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function QuizListScreen() {
  const { data: quizzes, refetch, isLoading } = useAvailableQuizzes();
  const { data: submissions } = useMyQuizSubmissions();
  const navigation = useNavigation<NavProp>();
  const { t, isRTL } = useLang();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getSubmission = (quizId: string) => {
    return submissions?.find((s: any) => s.quizId === quizId);
  };

  const completedCount = quizzes?.filter(q => getSubmission(q.id))?.length || 0;
  const totalCount = quizzes?.length || 0;

  return (
    <View style={styles.container}>
      <ConferenceHeader />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('quizzes')}</Text>
            <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('testKnowledge')}</Text>
          </View>
          {totalCount > 0 && (
            <View style={styles.progressBadge}>
              <Ionicons name="checkmark-done" size={16} color={COLORS.success} />
              <Text style={styles.progressText}>{completedCount}/{totalCount}</Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={quizzes || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <QuizCard
            quiz={item}
            submission={getSubmission(item.id)}
            onPress={() => navigation.navigate('QuizPlay', { quizId: item.id, title: item.title })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="help-circle-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{t('noQuizzes')}</Text>
            <Text style={styles.emptyText}>{t('checkLater')}</Text>
          </View>
        }
        ListFooterComponent={null}
      />
    </View>
  );
}

function QuizCard({ quiz, submission, onPress }: { quiz: Quiz; submission?: any; onPress: () => void }) {
  const isCompleted = !!submission;
  const percentage = submission ? Math.round(Number(submission.percentage)) : null;

  return (
    <TouchableOpacity style={[styles.card, isCompleted && styles.cardCompleted]} onPress={onPress} activeOpacity={0.7}>
      {/* Left accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: isCompleted ? COLORS.success : COLORS.primary }]} />

      <View style={styles.cardBody}>
        {/* Top row: badges */}
        <View style={styles.cardHeader}>
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={12} color={COLORS.accent} />
            <Text style={styles.xpBadgeText}>{quiz.xpReward} XP</Text>
          </View>
          {quiz.timeLimit > 0 && (
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.timeBadgeText}>{Math.floor(quiz.timeLimit / 60)}:{String(quiz.timeLimit % 60).padStart(2, '0')}</Text>
            </View>
          )}
          {(quiz as any).questionCount > 0 && (
            <View style={styles.questionBadge}>
              <Ionicons name="help-circle-outline" size={12} color={COLORS.secondary} />
              <Text style={styles.questionBadgeText}>{(quiz as any).questionCount} Q</Text>
            </View>
          )}
        </View>

        {/* Title & description */}
        <Text style={styles.cardTitle}>{quiz.title}</Text>
        {quiz.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>{quiz.description}</Text>
        )}

        {/* Completion status */}
        {isCompleted && (
          <View style={styles.completionRow}>
            <View style={styles.completionBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.completionText}>
                Completed • {percentage}% • +{submission.xpAwarded} XP
              </Text>
            </View>
            <Text style={styles.viewResults}>View Results →</Text>
          </View>
        )}
      </View>

      {/* Right icon */}
      <View style={styles.cardAction}>
        {isCompleted ? (
          <View style={[styles.actionCircle, { backgroundColor: COLORS.success + '20' }]}>
            <Ionicons name="eye" size={18} color={COLORS.success} />
          </View>
        ) : (
          <View style={[styles.actionCircle, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="play" size={18} color={COLORS.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardCompleted: {
    borderColor: COLORS.success + '40',
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  questionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  questionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  viewResults: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: SPACING.md,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  textRTL: {
    textAlign: 'right',
  },
});
