import { describe, it, expect } from 'vitest'
import { Problem, PracticeCounters, PracticeSession, SessionStats, XP_REWARDS } from '../types'
import {
  calculateXPForProblem,
  calculateSessionXP,
  calculatePerfectSessionBonus,
  addXPToProfile,
  initializeUserProfile,
  checkBadges,
  addBadgesToProfile,
  updatePracticeCounters,
} from '../scoring'

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

describe('XP Accounting (no double-count)', () => {
  // Reproduces the invariant for the XP double-count fix:
  // per-problem XP is awarded once (immediately, in handleSubmitAnswer),
  // so calculateSessionXP must NOT be added to the profile again at session
  // end. calculateSessionXP re-sums the same per-problem XP plus the perfect
  // bonus, which would double the awarded XP if added on top.

  const fastProblem = (correct: boolean, _timeSpent: number = 1000): Problem =>
    createProblem(5, 3, 'addition', 8, correct ? 8 : 9, correct)

  it('sum of per-problem XP equals session XP minus the perfect bonus (counted once)', () => {
    const problems = [
      fastProblem(true, 1000),
      fastProblem(true, 1000),
      fastProblem(true, 1000),
    ]
    const stats: SessionStats = {
      totalProblems: problems.length,
      correctAnswers: 3,
      incorrectAnswers: 0,
      accuracy: 100,
      totalTime: 3,
      averageTime: 1,
      currentStreak: 3,
      longestStreak: 3,
    }

    let perProblemXP = 0
    let streak = 0
    problems.forEach((p) => {
      const xp = calculateXPForProblem(p.isCorrect === true, p.timeSpent || 0, streak)
      perProblemXP += xp
      if (p.isCorrect) streak += 1
    })

    const sessionXP = calculateSessionXP(stats, problems)
    const perfectBonus = calculatePerfectSessionBonus(stats)

    expect(perProblemXP).toBeGreaterThan(0)
    // The per-problem work is counted exactly once: session XP is the same
    // per-problem sum plus the (separately-awarded) perfect bonus.
    expect(sessionXP - perfectBonus).toBe(perProblemXP)
  })

  it('awarding per-problem XP then adding session XP would double the profile XP', () => {
    const problems = [
      fastProblem(true, 1000),
      fastProblem(true, 1000),
    ]
    const stats: SessionStats = {
      totalProblems: problems.length,
      correctAnswers: 2,
      incorrectAnswers: 0,
      accuracy: 100,
      totalTime: 2,
      averageTime: 1,
      currentStreak: 2,
      longestStreak: 2,
    }

    // Correct (single) accounting: per-problem XP + perfect bonus only.
    let perProblemXP = 0
    let streak = 0
    problems.forEach((p) => {
      perProblemXP += calculateXPForProblem(p.isCorrect === true, p.timeSpent || 0, streak)
      if (p.isCorrect) streak += 1
    })
    const correctTotal = perProblemXP + calculatePerfectSessionBonus(stats)

    const singleProfile = addXPToProfile(initializeUserProfile(), correctTotal)

    // Buggy (double) accounting: per-problem XP + full session XP.
    const buggyTotal = perProblemXP + calculateSessionXP(stats, problems)
    const buggyProfile = addXPToProfile(initializeUserProfile(), buggyTotal)

    expect(singleProfile.xp).toBe(correctTotal)
    expect(buggyProfile.xp).toBeGreaterThan(singleProfile.xp)
    expect(buggyProfile.xp).toBe(correctTotal + perProblemXP) // the re-summed duplicate
  })

  it('a single fast correct answer earns exactly the correctAnswer + speedBonus XP once', () => {
    const xp = calculateXPForProblem(true, 1000, 0)
    expect(xp).toBe(XP_REWARDS.correctAnswer + XP_REWARDS.speedBonus)
    const profile = addXPToProfile(initializeUserProfile(), xp)
    expect(profile.xp).toBe(xp)
  })
})

describe('Cumulative practice counters (issue #66)', () => {
  it('accumulates totals, per-operation counts and streaks across sessions', () => {
    let profile = initializeUserProfile()
    for (let session = 0; session < 4; session++) {
      profile = updatePracticeCounters(profile, [
        createProblem(1, 1, 'addition', 2, 2, true),
        createProblem(2, 2, 'addition', 4, 4, true),
        createProblem(3, 3, 'addition', 6, 5, false),
      ])
    }
    expect(profile.counters.totalProblemsSolved).toBe(12)
    expect(profile.counters.correctByOperation.addition).toBe(8)
    expect(profile.counters.bestAnswerStreak).toBe(2)
    expect(profile.counters.currentAnswerStreak).toBe(0)
  })

  it('carries the answer streak across sessions', () => {
    let profile = initializeUserProfile()
    profile = updatePracticeCounters(profile, [
      createProblem(1, 1, 'addition', 2, 2, true),
      createProblem(2, 2, 'addition', 4, 4, true),
    ])
    profile = updatePracticeCounters(profile, [
      createProblem(3, 3, 'addition', 6, 6, true),
    ])
    expect(profile.counters.currentAnswerStreak).toBe(3)
    expect(profile.counters.bestAnswerStreak).toBe(3)
  })

  it('skips problems that were never answered', () => {
    const profile = updatePracticeCounters(initializeUserProfile(), [
      createProblem(1, 1, 'addition', 2, 2, true),
      createProblem(5, 5, 'addition', 10),
    ])
    expect(profile.counters.totalProblemsSolved).toBe(1)
    expect(profile.counters.correctByOperation.addition).toBe(1)
  })

  it('earns addition_master from cumulative counts across sessions', () => {
    let profile = initializeUserProfile()
    const problems = Array.from({ length: 25 }, (_, i) =>
      createProblem(i, 1, 'addition', i + 1, i + 1, true)
    )
    const stats = createSession(problems).stats
    for (let session = 0; session < 4; session++) {
      profile = updatePracticeCounters(profile, problems)
      const newBadges = checkBadges(stats, profile, problems)
      profile = addBadgesToProfile(profile, newBadges)
      const earnedMaster = newBadges.some((b) => b.id === 'addition_master')
      expect(earnedMaster).toBe(session === 3)
    }
  })

  it('earns marathon from the cumulative problem total across sessions', () => {
    let profile = initializeUserProfile()
    const problems = Array.from({ length: 30 }, (_, i) =>
      createProblem(i, 1, 'addition', i + 1, i + 1, true)
    )
    const stats = createSession(problems).stats
    for (let session = 0; session < 4; session++) {
      profile = updatePracticeCounters(profile, problems)
      profile = addBadgesToProfile(profile, checkBadges(stats, profile, problems))
    }
    expect(profile.badges.find((b) => b.id === 'marathon')?.earned).toBe(true)
  })

  it('earns perfect_50 from a streak carried across two sessions', () => {
    let profile = initializeUserProfile()
    const problems = Array.from({ length: 30 }, (_, i) =>
      createProblem(i, 1, 'addition', i + 1, i + 1, true)
    )
    const stats = { ...createSession(problems).stats, longestStreak: 30 }

    profile = updatePracticeCounters(profile, problems)
    expect(
      checkBadges(stats, profile, problems).some((b) => b.id === 'perfect_50')
    ).toBe(false)
    profile = addBadgesToProfile(profile, checkBadges(stats, profile, problems))

    profile = updatePracticeCounters(profile, problems)
    expect(
      checkBadges(stats, profile, problems).some((b) => b.id === 'perfect_50')
    ).toBe(true)
  })

  it('falls back to session counts for legacy profiles without counters', () => {
    const legacyProfile = initializeUserProfile()
    delete (legacyProfile as { counters?: PracticeCounters }).counters
    const problems = Array.from({ length: 100 }, (_, i) =>
      createProblem(i, 1, 'addition', i + 1, i + 1, true)
    )
    const stats = createSession(problems).stats
    expect(
      checkBadges(stats, legacyProfile, problems).some(
        (b) => b.id === 'addition_master'
      )
    ).toBe(true)
  })
})
