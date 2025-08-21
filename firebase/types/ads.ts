// Types for the ads system

export interface AdQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct answer
  reward: number; // FOG coins earned for correct answer (1 FOG = $0.10)
  type?: 'multiple-choice' | 'feedback'; // Type of question
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Local path or Firebase Storage URL
  previewImage: string; // Preview thumbnail
  questions: AdQuestion[];
  totalReward: number; // Total FOG coins reward for completing all questions (1 FOG = $0.10)
  rewardPerQuestion: number; // FOG coins per question (calculated: totalReward / questions.length)
  isActive: boolean;
  isPaused: boolean;
  isOneTimePerUser: boolean; // If true, user can only watch once
  maxDailyViews: number; // Max times a user can watch per day (if not one-time)
  createdBy: string; // Admin ID
  createdAt: Date;
  updatedAt: Date;
  totalViews: number;
  totalCompletions: number;
}

export interface AdCreationData {
  title: string;
  description: string;
  videoFile?: File; // For upload
  previewImageFile?: File; // For upload
  questions: Omit<AdQuestion, 'id' | 'reward' | 'type'>[]; // Only 3 custom questions
  feedbackQuestionTitle: string; // Title for the 4th feedback question
  totalReward: number; // FOG coins reward for completing the ad (1 FOG = $0.10)
  isOneTimePerUser: boolean;
  maxDailyViews: number;
}

export interface UserAdInteraction {
  id: string;
  userId: string;
  adId: string;
  watchedAt: Date;
  completedAt?: Date;
  questionsAnswered: {
    questionId: string;
    selectedAnswer: number;
    textAnswer?: string; // For feedback question
    isCorrect: boolean;
    earnedReward: number; // FOG coins earned for this question (1 FOG = $0.10)
  }[];
  totalEarned: number; // Total FOG coins earned from this ad (1 FOG = $0.10)
  isCompleted: boolean;
}

export interface UserAdStats {
  userId: string;
  totalAdsWatched: number;
  totalEarnings: number; // Total FOG coins earned (1 FOG = $0.10)
  totalEarned: number; // Alias for compatibility - FOG coins
  dailyWatchCount: number; // Resets daily
  todaysCount: number; // Alias for compatibility
  lastWatchDate: string; // ISO date string
  availableBalance: number; // Available FOG coins balance (1 FOG = $0.10)
  withdrawnAmount: number; // FOG coins already withdrawn
}

export interface UserDailyActivity {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  adsWatched: number;
  earningsToday: number; // FOG coins earned today (1 FOG = $0.10)
  questionsAnswered: number;
  correctAnswers: number;
}

// Admin interfaces
export interface AdminAdStats {
  totalAds: number;
  activeAds: number;
  pausedAds: number;
  totalViews: number;
  totalRewardsPaid: number; // Total FOG coins paid out (1 FOG = $0.10)
  averageCompletionRate: number;
}

// Form interfaces
export interface AdFormState {
  title: string;
  description: string;
  videoFile: File | null;
  videoUrl?: string; // For editing existing ads
  previewImageFile: File | null;
  previewImageUrl?: string; // For editing existing ads
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[]; // Only 3 custom questions
  feedbackQuestion: {
    title: string;
    question: string;
  }; // The 4th feedback question
  totalReward: number;
  isOneTimePerUser: boolean;
  maxDailyViews: number;
}

export type AdFormErrors = Partial<Record<keyof AdFormState, string>> & {
  questions?: string[];
  general?: string;
  feedbackQuestion?: string;
};

// Watch ads page interfaces
export interface WatchAdsState {
  availableAds: Ad[];
  currentAd: Ad | null;
  isWatching: boolean;
  currentQuestion: number;
  userAnswers: number[];
  earnedReward: number;
  isVideoCompleted: boolean;
  showQuestions: boolean;
  userStats: UserAdStats | null;
  dailyWatchLimit: number;
  canWatchMore: boolean;
}

export interface WatchAdsActions {
  loadAvailableAds: () => Promise<void>;
  startWatching: (ad: Ad) => void;
  completeVideo: () => void;
  answerQuestion: (questionIndex: number, answer: number) => void;
  completeAd: () => Promise<void>;
  loadUserStats: () => Promise<void>;
}

// Constants
export const AD_CONFIG = {
  MAX_QUESTIONS_PER_AD: 10,
  MIN_QUESTIONS_PER_AD: 1,
  MAX_DAILY_WATCH_LIMIT: 50, // Default max ads per day
  MIN_REWARD_AMOUNT: 1,
  MAX_REWARD_AMOUNT: 1000,
  VIDEO_FORMATS: ['mp4', 'webm', 'ogg'],
  IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;
