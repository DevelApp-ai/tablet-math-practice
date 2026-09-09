export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'

// Gamification Types
export type BadgeId =
  | 'first_blood'
  | 'perfect_10'
  | 'perfect_25'
  | 'perfect_50'
  | 'speed_demon'
  | 'marathon'
  | 'weekend_warrior'
  | 'month_streak'
  | 'addition_master'
  | 'subtraction_master'
  | 'multiplication_master'
  | 'division_master'

export interface Badge {
  id: BadgeId
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt: Date | null
}

export interface DailyStreak {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  returnBonusClaimed: boolean
}

export interface UserSettings {
  soundEnabled: boolean
  animationsEnabled: boolean
  theme: string
}

export interface UserProfile {
  xp: number
  level: number
  xpToNextLevel: number
  badges: Badge[]
  dailyStreak: DailyStreak
  settings: UserSettings
}

// XP Rewards Configuration
export const XP_REWARDS = {
  correctAnswer: 10,
  streakBonus: 5,
  speedBonus: 15,
  perfectSession: 50,
  dailyLogin: 20,
} as const

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000] as const

export interface Problem {
  id: string
  operand1: number
  operand2: number
  operation: Exclude<OperationType, 'mixed'>
  correctAnswer: number
  userAnswer?: number
  isCorrect?: boolean
  timeSpent?: number
  hintsUsed?: number
}

export interface SessionStats {
  totalProblems: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  totalTime: number
  averageTime: number
  currentStreak?: number
  longestStreak?: number
}

export interface PracticeSession {
  id: string
  difficulty: DifficultyLevel
  operationType: OperationType
  problems: Problem[]
  currentProblemIndex: number
  stats: SessionStats
  startTime: number
  guidedMode: boolean
}