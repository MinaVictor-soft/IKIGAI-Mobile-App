import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { LeaderboardEntry, Tribe, XpTransaction, Quiz, Session, FootballMatch, User, Publication, PublicationCategoryObj } from '../types';

// XP & Profile
export function useMyProfile() {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
    refetchInterval: 30000,
  });
}

export function useMyXpHistory() {
  return useQuery<XpTransaction[]>({
    queryKey: ['xp-history'],
    queryFn: async () => {
      const { data } = await api.get('/xp/history/me');
      return data.data;
    },
  });
}

// Leaderboard
export function useMyRank() {
  return useQuery<{ rank: number; total: number }>({
    queryKey: ['myRank'],
    queryFn: async () => {
      const { data } = await api.get('/xp/rank/me');
      return data.data;
    },
    refetchInterval: 30000,
  });
}

export function useLeaderboard(limit = 50) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data } = await api.get(`/xp/leaderboard?limit=${limit}`);
      return data.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useTribeLeaderboard() {
  return useQuery<Tribe[]>({
    queryKey: ['tribe-leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/xp/tribes');
      return data.data;
    },
    refetchInterval: 30000,
  });
}

export function useAllLevels() {
  return useQuery<any[]>({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data } = await api.get('/xp/levels');
      return data.data || [];
    },
  });
}

// Quizzes
export function useAvailableQuizzes() {
  return useQuery<Quiz[]>({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data } = await api.get('/quizzes/active');
      return (data.data || []).map((q: any) => ({ ...q, timeLimit: q.timeLimitSeconds || q.timeLimit }));
    },
    refetchInterval: 10000,
  });
}

export function useQuizDetail(quizId: string) {
  return useQuery<Quiz>({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const { data } = await api.get(`/quizzes/${quizId}`);
      const quiz = data.data;
      return {
        ...quiz,
        timeLimit: quiz.timeLimitSeconds || quiz.timeLimit || 0,
        questions: (quiz.questions || []).map((q: any) => {
          // For TRUE_FALSE questions, generate options if not provided
          let options: string[] = [];
          let optionIds: string[] = [];
          
          if (q.questionType === 'TRUE_FALSE') {
            options = ['True', 'False'];
            optionIds = ['true', 'false'];
          } else if (Array.isArray(q.options)) {
            options = q.options.map((o: any) => (typeof o === 'string' ? o : o.text));
            optionIds = q.options.map((o: any) => (typeof o === 'string' ? o : o.id));
          }
          
          return {
            id: q.id,
            text: q.questionText || q.text,
            options,
            optionIds,
            order: q.displayOrder || q.order || 0,
            questionType: q.questionType,
          };
        }),
      };
    },
    enabled: !!quizId,
  });
}

export function useMyQuizSubmissions() {
  return useQuery<any[]>({
    queryKey: ['myQuizSubmissions'],
    queryFn: async () => {
      const { data } = await api.get('/quizzes/my-submissions');
      return data.data || [];
    },
  });
}

export function useMyQuizResult(quizId: string) {
  return useQuery<any>({
    queryKey: ['myQuizResult', quizId],
    queryFn: async () => {
      const { data } = await api.get(`/quizzes/${quizId}/my-result`);
      return data.data;
    },
    enabled: !!quizId,
  });
}

// Sessions (Attendance)
export function useActiveSessions() {
  return useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await api.get('/attendance/sessions');
      return data.data;
    },
    refetchInterval: 10000,
  });
}

// Football / Sports
export function useFootballMatches() {
  return useQuery<FootballMatch[]>({
    queryKey: ['football-matches'],
    queryFn: async () => {
      const { data } = await api.get('/sports/matches');
      return data.data;
    },
    refetchInterval: 30000,
  });
}

export function useFootballLeaderboard() {
  return useQuery({
    queryKey: ['football-leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/sports/standings');
      return data.data;
    },
    refetchInterval: 30000,
  });
}

export function useMyTeam() {
  return useQuery<{ id: string; name: string; color: string } | null>({
    queryKey: ['my-team'],
    queryFn: async () => {
      const { data } = await api.get('/sports/my-team');
      return data.data || null;
    },
  });
}

// Publications
export function usePublicationCategories() {
  return useQuery<PublicationCategoryObj[]>({
    queryKey: ['publication-categories'],
    queryFn: async () => {
      const { data } = await api.get('/publications/categories');
      return data.data;
    },
  });
}

export function usePublications(categoryId?: string) {
  return useQuery<Publication[]>({
    queryKey: ['publications', categoryId],
    queryFn: async () => {
      const url = categoryId ? `/publications?categoryId=${categoryId}` : '/publications';
      const { data } = await api.get(url);
      return data.data;
    },
    refetchInterval: 10000,
  });
}
