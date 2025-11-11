export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'

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