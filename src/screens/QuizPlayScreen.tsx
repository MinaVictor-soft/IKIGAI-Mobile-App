import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useQuizDetail, useMyQuizResult } from '../hooks/useApi';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useQueryClient } from '@tanstack/react-query';

type QuizPlayRoute = RouteProp<RootStackParamList, 'QuizPlay'>;

export default function QuizPlayScreen() {
  const route = useRoute<QuizPlayRoute>();
  const navigation = useNavigation();
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { quizId, title } = route.params;
  const { data: quiz, isLoading, error } = useQuizDetail(quizId);
  const { data: previousResult, isLoading: resultLoading } = useMyQuizResult(quizId);
  const { t } = useLang();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; xpEarned: number; correctAnswers?: any[] } | null>(null);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [title, navigation]);

  // Timer
  useEffect(() => {
    if (quiz?.timeLimit && quiz.timeLimit > 0 && !result && !previousResult) {
      setTimeLeft(quiz.timeLimit);
    }
  }, [quiz, result, previousResult]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers: formattedAnswers });
      setResult({
        score: data.data.score,
        total: data.data.maxScore || quiz?.questions?.length || 0,
        xpEarned: data.data.xpAwarded || data.data.xpEarned || 0,
        correctAnswers: data.data.correctAnswers,
      });
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['myQuizSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['myQuizResult', quizId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit quiz';
      if (error?.response?.status === 409) {
        Alert.alert('Already Submitted', 'You have already completed this quiz.');
        queryClient.invalidateQueries({ queryKey: ['myQuizResult', quizId] });
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || resultLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !quiz?.questions?.length) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{t('failedToLoad')}</Text>
      </View>
    );
  }

  // Show previous result if already submitted
  if (previousResult && !result) {
    const percentage = Math.round(Number(previousResult.percentage));
    const userAnswers = previousResult.answers || [];
    const questions = previousResult.quiz?.questions || [];

    return (
      <View style={styles.container}>
        {/* Results Header */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultEmoji}>
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '😅'}
          </Text>
          <Text style={styles.resultHeaderTitle}>Quiz Completed!</Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{previousResult.score}/{previousResult.maxScore}</Text>
              <Text style={styles.resultStatLabel}>Score</Text>
            </View>
            <View style={[styles.resultStat, styles.resultStatBorder]}>
              <Text style={styles.resultStatValue}>{percentage}%</Text>
              <Text style={styles.resultStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatValue, { color: COLORS.accent }]}>+{previousResult.xpAwarded}</Text>
              <Text style={styles.resultStatLabel}>XP Earned</Text>
            </View>
          </View>
          {previousResult.passed ? (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={[styles.statusText, { color: COLORS.success }]}>Passed</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.error + '20' }]}>
              <Ionicons name="close-circle" size={16} color={COLORS.error} />
              <Text style={[styles.statusText, { color: COLORS.error }]}>Not Passed</Text>
            </View>
          )}
        </View>

        {/* Answers Review */}
        <ScrollView style={styles.reviewContainer} contentContainerStyle={styles.reviewContent}>
          <Text style={styles.reviewTitle}>📋 Your Answers</Text>
          {questions.map((q: any, idx: number) => {
            const userAnswer = userAnswers.find((a: any) => a.questionId === q.id);
            const isCorrect = userAnswer?.answer === q.correctAnswer;
            const options = Array.isArray(q.options)
              ? q.options.map((o: any) => (typeof o === 'string' ? o : o.text))
              : [];
            const optionIds = Array.isArray(q.options)
              ? q.options.map((o: any) => (typeof o === 'string' ? o : o.id))
              : [];

            return (
              <View key={q.id} style={[styles.reviewQuestion, isCorrect ? styles.reviewCorrect : styles.reviewWrong]}>
                <View style={styles.reviewQHeader}>
                  <Text style={styles.reviewQNum}>Q{idx + 1}</Text>
                  {isCorrect ? (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  ) : (
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  )}
                </View>
                <Text style={styles.reviewQText}>{q.questionText}</Text>
                {options.map((opt: string, i: number) => {
                  const optId = optionIds[i] || opt;
                  const isUserAnswer = userAnswer?.answer === optId;
                  const isCorrectAnswer = q.correctAnswer === optId;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.reviewOption,
                        isCorrectAnswer && styles.reviewOptionCorrect,
                        isUserAnswer && !isCorrectAnswer && styles.reviewOptionWrong,
                      ]}
                    >
                      <Text style={[
                        styles.reviewOptionText,
                        isCorrectAnswer && { color: COLORS.success, fontWeight: '600' },
                        isUserAnswer && !isCorrectAnswer && { color: COLORS.error },
                      ]}>
                        {isCorrectAnswer ? '✓ ' : isUserAnswer ? '✗ ' : '  '}{opt}
                      </Text>
                    </View>
                  );
                })}
                {q.explanation && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>💡 {q.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.navBar}>
          <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.navButtonTextPrimary}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show results after just submitting
  if (result) {
    const percentage = Math.round((result.score / (result.total || 1)) * 100);
    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '😅'}
          </Text>
          <Text style={styles.resultTitle}>{t('quizComplete')}</Text>
          <Text style={styles.resultScore}>
            {result.score}/{result.total} correct ({percentage}%)
          </Text>
          <View style={styles.xpEarned}>
            <Ionicons name="star" size={20} color={COLORS.accent} />
            <Text style={styles.xpEarnedText}>+{result.xpEarned} XP</Text>
          </View>
          {result.correctAnswers && result.correctAnswers.length > 0 && (
            <Text style={styles.resultHint}>Tap "View Answers" to see correct answers</Text>
          )}
          <View style={styles.resultButtons}>
            <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
              <Text style={styles.doneButtonText}>{t('done')}</Text>
            </TouchableOpacity>
            {result.correctAnswers && (
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: COLORS.secondary }]}
                onPress={() => {
                  // Trigger refetch to load full review
                  queryClient.invalidateQueries({ queryKey: ['myQuizResult', quizId] });
                  setResult(null);
                }}
              >
                <Text style={styles.doneButtonText}>View Answers</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  const questions = quiz.questions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress & Timer */}
      <View style={styles.topBar}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.topBarInfo}>
          <Text style={styles.questionCounter}>
            {currentQuestion + 1}/{questions.length}
          </Text>
          {timeLeft !== null && (
            <Text style={[styles.timer, timeLeft < 10 && styles.timerDanger]}>
              ⏱ {timeLeft}s
            </Text>
          )}
        </View>
      </View>

      {/* Question */}
      <ScrollView style={styles.questionContainer} contentContainerStyle={styles.questionContent}>
        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.options}>
          {question.options.map((option: string, index: number) => {
            const optionId = (question as any).optionIds?.[index] || option;
            const isSelected = answers[question.id] === optionId;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, isSelected && styles.optionSelected]}
                onPress={() => handleAnswer(question.id, optionId)}
              >
                <View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
                  {isSelected && <View style={styles.optionDot} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navBar}>
        {currentQuestion > 0 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentQuestion((c) => c - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {currentQuestion < questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => setCurrentQuestion((c) => c + 1)}
          >
            <Text style={styles.navButtonTextPrimary}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonSubmit]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.navButtonTextPrimary}>Submit</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  topBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  topBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  questionCounter: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  timer: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  timerDanger: {
    color: COLORS.error,
  },
  questionContainer: {
    flex: 1,
  },
  questionContent: {
    padding: SPACING.lg,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: SPACING.lg,
  },
  options: {
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  optionCircleSelected: {
    borderColor: COLORS.primary,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  navBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  navButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  navButtonSubmit: {
    backgroundColor: COLORS.success,
  },
  navButtonText: {
    color: COLORS.text,
    fontSize: 14,
  },
  navButtonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  resultScore: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  xpEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  xpEarnedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  resultHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Previous result review styles
  resultHeader: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  resultStats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  resultStat: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  resultStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  resultStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resultStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewContainer: {
    flex: 1,
  },
  reviewContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  reviewQuestion: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderColor: COLORS.border,
  },
  reviewCorrect: {
    borderLeftColor: COLORS.success,
  },
  reviewWrong: {
    borderLeftColor: COLORS.error,
  },
  reviewQHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewQNum: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  reviewQText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  reviewOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 2,
    borderRadius: 6,
  },
  reviewOptionCorrect: {
    backgroundColor: COLORS.success + '15',
  },
  reviewOptionWrong: {
    backgroundColor: COLORS.error + '15',
  },
  reviewOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  explanationBox: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 6,
  },
  explanationText: {
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 18,
  },
});
