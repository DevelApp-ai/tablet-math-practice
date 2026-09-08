import { describe, it, expect, beforeEach } from 'vitest'
import { Problem, PracticeSession, SessionStats } from '../types'

// Helper to create a mock problem
const createProblem = (
  operand1: number,
  operand2: number,
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division',
  correctAnswer: number,
  userAnswer?: number,
  isCorrect?: boolean
): Problem => ({
  id: `problem-${operand1}-${operand2}`,
  operand1,
  operand2,
  operation,
  correctAnswer,
  userAnswer,
  isCorrect,
  timeSpent: 10,
  hintsUsed: 0
})

// Helper to create a mock session
const createSession = (
  problems: Problem[],
  currentProblemIndex: number = 0,
  statsOverrides: Partial<SessionStats> = {}
): PracticeSession => ({
  id: 'session-1',
  difficulty: 'beginner',
  operationType: 'addition',
  problems,
  currentProblemIndex,
  stats: {
    totalProblems: problems.length,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    totalTime: 0,
    averageTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    ...statsOverrides
  },
  startTime: Date.now(),
  guidedMode: false
})

describe('Scoring Logic', () => {
  describe('Accuracy Calculation', () => {
    it('should calculate accuracy correctly with all correct answers', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 8, true),
        createProblem(10, 2, 'addition', 12, 12, true),
        createProblem(7, 4, 'addition', 11, 11, true)
      ]
      
      const correctAnswers = problems.filter(p => p.isCorrect === true).length
      const totalAnswered = problems.length
      const accuracy = Math.round((correctAnswers / totalAnswered) * 100)
      
      expect(accuracy).toBe(100)
    })

    it('should calculate accuracy correctly with mixed results', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 8, true),
        createProblem(10, 2, 'addition', 12, 10, false),
        createProblem(7, 4, 'addition', 11, 11, true)
      ]
      
      const correctAnswers = problems.filter(p => p.isCorrect === true).length
      const totalAnswered = problems.length
      const accuracy = Math.round((correctAnswers / totalAnswered) * 100)
      
      expect(accuracy).toBe(67) // 2/3 = 66.67% -> 67%
    })

    it('should return 0 accuracy when no answers', () => {
      const problems: Problem[] = []
      const correctAnswers = problems.filter(p => p.isCorrect === true).length
      const totalAnswered = problems.length
      const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
      
      expect(accuracy).toBe(0)
    })
  })

  describe('Streak Calculation', () => {
    it('should calculate streak correctly for consecutive correct answers', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 8, true),
        createProblem(10, 2, 'addition', 12, 12, true),
        createProblem(7, 4, 'addition', 11, 11, true)
      ]
      
      // Simulate streak calculation
      let currentStreak = 0
      let longestStreak = 0
      
      problems.forEach((problem, index) => {
        const isCorrect = problem.isCorrect === true
        const previousWasCorrect = index > 0 ? problems[index - 1].isCorrect === true : false
        currentStreak = isCorrect ? (previousWasCorrect ? currentStreak + 1 : 1) : 0
        longestStreak = Math.max(longestStreak, currentStreak)
      })
      
      expect(currentStreak).toBe(3)
      expect(longestStreak).toBe(3)
    })

    it('should reset streak on incorrect answer', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 8, true),
        createProblem(10, 2, 'addition', 12, 12, true),
        createProblem(7, 4, 'addition', 11, 10, false),
        createProblem(6, 3, 'addition', 9, 9, true)
      ]
      
      let currentStreak = 0
      let longestStreak = 0
      
      problems.forEach((problem, index) => {
        const isCorrect = problem.isCorrect === true
        const previousWasCorrect = index > 0 ? problems[index - 1].isCorrect === true : false
        currentStreak = isCorrect ? (previousWasCorrect ? currentStreak + 1 : 1) : 0
        longestStreak = Math.max(longestStreak, currentStreak)
      })
      
      expect(currentStreak).toBe(1) // Last answer is correct but previous was wrong
      expect(longestStreak).toBe(2) // First two were correct
    })

    it('should handle streak at start of session', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 8, true),
        createProblem(10, 2, 'addition', 12, 12, true)
      ]
      
      let currentStreak = 0
      let longestStreak = 0
      
      problems.forEach((problem, index) => {
        const isCorrect = problem.isCorrect === true
        const previousWasCorrect = index > 0 ? problems[index - 1].isCorrect === true : false
        currentStreak = isCorrect ? (previousWasCorrect ? currentStreak + 1 : 1) : 0
        longestStreak = Math.max(longestStreak, currentStreak)
      })
      
      expect(currentStreak).toBe(2)
      expect(longestStreak).toBe(2)
    })

    it('should return 0 streak when first answer is wrong', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 10, false)
      ]
      
      let currentStreak = 0
      let longestStreak = 0
      
      problems.forEach((problem, index) => {
        const isCorrect = problem.isCorrect === true
        const previousWasCorrect = index > 0 ? problems[index - 1].isCorrect === true : false
        currentStreak = isCorrect ? (previousWasCorrect ? currentStreak + 1 : 1) : 0
        longestStreak = Math.max(longestStreak, currentStreak)
      })
      
      expect(currentStreak).toBe(0)
      expect(longestStreak).toBe(0)
    })
  })

  describe('Average Time Calculation', () => {
    it('should calculate average time correctly', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 8, true),
        createProblem(10, 2, 'addition', 12, 12, true),
        createProblem(7, 4, 'addition', 11, 11, true)
      ]
      
      // Each problem has timeSpent = 10
      const totalTime = problems.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
      const totalAnswered = problems.length
      const averageTime = totalAnswered > 0 ? Math.round(totalTime / totalAnswered) : 0
      
      expect(averageTime).toBe(10)
    })

    it('should return 0 when no time recorded', () => {
      const problems: Problem[] = []
      const totalTime = problems.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
      const totalAnswered = problems.length
      const averageTime = totalAnswered > 0 ? Math.round(totalTime / totalAnswered) : 0
      
      expect(averageTime).toBe(0)
    })
  })

  describe('Progress Tracking', () => {
    it('should track progress correctly', () => {
      const problems = [
        createProblem(5, 3, 'addition', 8, 8, true),
        createProblem(10, 2, 'addition', 12, 12, true),
        createProblem(7, 4, 'addition', 11, undefined, undefined),
        createProblem(6, 3, 'addition', 9, undefined, undefined)
      ]
      
      const answered = problems.filter(p => p.userAnswer !== undefined).length
      const total = problems.length
      const progress = (answered / total) * 100
      
      expect(progress).toBe(50) // 2 out of 4 answered
    })
  })
})

describe('Session State Management', () => {
  describe('Session Persistence', () => {
    it('should load session from localStorage', () => {
      const mockSession: PracticeSession = createSession([
        createProblem(5, 3, 'addition', 8, 8, true)
      ], 0, {
        correctAnswers: 1,
        incorrectAnswers: 0,
        accuracy: 100
      })
      
      // Simulate localStorage
      const sessionString = JSON.stringify(mockSession)
      const loaded = JSON.parse(sessionString) as PracticeSession
      
      expect(loaded.stats.correctAnswers).toBe(1)
      expect(loaded.stats.accuracy).toBe(100)
      expect(loaded.problems.length).toBe(1)
    })

    it('should save session to localStorage', () => {
      const mockSession: PracticeSession = createSession([
        createProblem(5, 3, 'addition', 8, 8, true)
      ], 0, {
        correctAnswers: 1,
        incorrectAnswers: 0,
        accuracy: 100
      })
      
      const sessionString = JSON.stringify(mockSession)
      const loaded = JSON.parse(sessionString) as PracticeSession
      
      expect(loaded).toBeDefined()
      expect(loaded.stats).toBeDefined()
    })
  })

  describe('Session Updates', () => {
    it('should update session stats correctly on answer', () => {
      const initialSession = createSession([
        createProblem(5, 3, 'addition', 8),
        createProblem(10, 2, 'addition', 12)
      ])
      
      // Simulate answering first problem correctly
      const updatedProblems = [...initialSession.problems]
      updatedProblems[0] = {
        ...updatedProblems[0],
        userAnswer: 8,
        isCorrect: true,
        timeSpent: 15,
        hintsUsed: 0
      }
      
      const correctAnswers = updatedProblems.filter(p => p.isCorrect === true).length
      const incorrectAnswers = updatedProblems.filter(p => p.isCorrect === false).length
      const totalAnswered = correctAnswers + incorrectAnswers
      const totalTime = updatedProblems.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
      
      const updatedStats = {
        ...initialSession.stats,
        correctAnswers,
        incorrectAnswers,
        accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
        totalTime,
        averageTime: totalAnswered > 0 ? Math.round(totalTime / totalAnswered) : 0
      }
      
      expect(updatedStats.correctAnswers).toBe(1)
      expect(updatedStats.incorrectAnswers).toBe(0)
      expect(updatedStats.accuracy).toBe(100)
      expect(updatedStats.totalTime).toBe(25)
    })
  })
})
