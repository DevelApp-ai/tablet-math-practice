export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'

// Presentation: how the arithmetic is laid out for the learner.
export type PresentationMode = 'horizontal' | 'vertical'

// Canvas background rendered behind the workspace / scratchpad.
export type CanvasBackground = 'plain' | 'grid' | 'dotted' | 'lined'

// Session mode: mastery = untimed with hints + manipulatives,
// fluency = timed sprint with no hints (reuses timer + speed-bonus XP).
export type SessionMode = 'mastery' | 'fluency'

// A mistake persisted to the Mistake Vault for spaced-repetition review.
export interface StoredMistake {
  id: string
  problemId: string
  num1: number
  num2: number
  operation: Exclude<OperationType, 'mixed'>
  incorrectAnswers: number[]
  // Leitner box: 0 = failed (due next session), 1..3 = graduated after 3 correct.
  repetitionLevel: number
  consecutiveCorrect: number
  nextReviewTimestamp: number
  lastReviewedAt: number | null
  addedAt: number
}

// Diagnostic error classification (the "bug library").
export type ErrorCategory =
  | 'borrow_reversal'
  | 'missing_carry'
  | 'operation_swap'
  | 'off_by_one'
  | 'place_value_shift'
  | 'sign_confusion'
  | 'unknown'

export interface ProblemDiagnostic {
  expectedAnswer: number
  providedAnswer: number
  category: ErrorCategory
  remedialHintKey: string
}

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
  presentationMode: PresentationMode
  canvasBackground: CanvasBackground
  scratchpadEnabled: boolean
  palmRejection: boolean
  // Phase 5: CPA visual manipulatives (ten-frames, number lines, array grids).
  manipulativesEnabled: boolean
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
  diagnostic?: ProblemDiagnostic
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
  // Phase 4: typed session mode + remediation flag (mastery/fluency split).
  sessionMode?: SessionMode
  isRemediation?: boolean
}