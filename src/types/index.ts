export type Role = 'ATTENDEE' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tribeId: string | null;
  tribe: Tribe | null;
  totalXp: number;
  conferenceXp: number;
  sportsXp: number;
  level: Level | null;
  userQrToken: string;
  createdAt: string;
}

export interface Tribe {
  id: string;
  name: string;
  color: string;
  totalXp: number;
  memberCount?: number;
}

export interface Level {
  id: string;
  name: string;
  minXp: number;
  maxXp: number | null;
  badgeEmoji: string;
  color: string;
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'ATTENDANCE' | 'QUIZ' | 'BONUS' | 'MANUAL' | 'PENALTY' | 'SPORTS' | 'REWARD';
  sourceType: 'SESSION' | 'QUIZ' | 'BONUS_QR' | 'STAFF_AWARD' | 'ADMIN' | 'FOOTBALL' | 'SPORTS';
  sourceId: string | null;
  description: string | null;
  awardedBy: string | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  totalXp: number;
  conferenceXp: number;
  sportsXp: number;
  tribe: Tribe | null;
  level: Level | null;
  rank: number;
}

export interface Session {
  id: string;
  title: string;
  speaker: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  xpReward: number;
  qrCode: string;
  isActive: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  sessionId: string | null;
  timeLimit: number;
  xpReward: number;
  isActive: boolean;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  optionIds?: string[];
  order: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  answers: Record<string, string>;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FootballMatch {
  id: string;
  homeTeam: { id: string; name: string; color: string };
  awayTeam: { id: string; name: string; color: string };
  homeScore: number;
  awayScore: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  scheduledAt: string;
  winXp: number;
  drawXp: number;
  lossXp: number;
}

export interface PublicationCategoryObj {
  id: string;
  name: string;
  labelEn: string;
  labelAr: string;
  color: string;
  order: number;
}

export type PublicationCategory = string;

export interface Publication {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  category: PublicationCategoryObj;
  contentUrl: string;
  coverUrl: string | null;
  fileSize: number | null;
  publishedAt: string;
}
