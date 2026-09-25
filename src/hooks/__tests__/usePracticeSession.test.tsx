/**
 * Integration tests for the usePracticeSession hook — the answer → XP →
 * streak → mistake-vault pipeline extracted from App.tsx (issues #69/#71).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { getExpectedAnswer } from '@/lib/mathUtils'
import { StoredMistake, XP_REWARDS } from '@/lib/types'

// jsdom does not implement crypto.randomUUID.
if (!('randomUUID' in globalThis.crypto)) {
  let counter = 0
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () => `test-uuid-${++counter}`,
  })
}

type HookApi = ReturnType<typeof usePracticeSession>
interface RenderedHook {
  current: HookApi
}

/** Answer the current problem correctly and let the advance timeout run. */
function answerCorrectly(result: RenderedHook) {
  const problem = result.current.currentProblem!
  act(() => {
    result.current.submitAnswer(getExpectedAnswer(problem), 0)
  })
  act(() => {
    vi.advanceTimersByTime(900)
  })
}

/** Answer the current problem incorrectly. */
function answerIncorrectly(result: RenderedHook) {
  const problem = result.current.currentProblem!
  act(() => {
    result.current.submitAnswer(getExpectedAnswer(problem) + 1, 0)
  })
  // Wrong answers advance immediately (no success animation), but the
  // ProblemCard calls onNext; simulate it the same way the UI does.
  act(() => {
    result.current.nextProblem()
  })
}

describe('usePracticeSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  describe('startSession', () => {
    it('creates a session with the requested number of problems and zeroed stats', () => {
      const { result } = renderHook(() => usePracticeSession())

      act(() => {
        result.current.startSession('beginner', 3)
      })

      expect(result.current.currentSession).not.toBeNull()
      expect(result.current.difficulty).toBe('beginner')
      expect(result.current.currentSession!.problems).toHaveLength(3)
      expect(result.current.currentSession!.currentProblemIndex).toBe(0)
      expect(result.current.currentSession!.stats.correctAnswers).toBe(0)
      expect(result.current.currentSession!.stats.incorrectAnswers).toBe(0)
      expect(result.current.showStats).toBe(false)
    })

    it('persists the current session to localStorage', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })

      const saved = localStorage.getItem('current-session')
      expect(saved).not.toBeNull()
      expect(JSON.parse(saved!).id).toBe(result.current.currentSession!.id)
    })

    it('updates the daily streak but grants no return bonus on a brand-new profile', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })

      // Fresh profile: longestStreak is 0, so getReturnBonus stays 0 and XP is untouched.
      expect(result.current.userProfile.dailyStreak.currentStreak).toBe(1)
      expect(result.current.userProfile.xp).toBe(0)
    })
  })

  describe('answer → XP → streak pipeline', () => {
    it('awards base + speed XP for a correct answer and advances to the next problem', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })
      const xpBefore = result.current.userProfile.xp

      answerCorrectly(result)

      // Fake timers freeze the clock: timeSpent is 0s → speed bonus applies.
      const expectedXP = XP_REWARDS.correctAnswer + XP_REWARDS.speedBonus
      expect(result.current.userProfile.xp).toBe(xpBefore + expectedXP)
      expect(result.current.currentSession!.currentProblemIndex).toBe(1)
      expect(result.current.currentSession!.stats.correctAnswers).toBe(1)
      expect(result.current.currentSession!.stats.currentStreak).toBe(1)
      // The recorded problem keeps the user's answer and result.
      const answered = result.current.currentSession!.problems[0]
      expect(answered.isCorrect).toBe(true)
      expect(answered.userAnswer).toBe(getExpectedAnswer(answered))
    })

    it('builds a streak across consecutive correct answers and adds the streak bonus', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 4)
      })

      answerCorrectly(result) // streak 1 → XP 25
      answerCorrectly(result) // streak 2 → XP 25 (streak bonus uses pre-answer streak of 1)
      const xpAfterTwo = result.current.userProfile.xp

      answerCorrectly(result) // streak 3 → pre-answer streak 2 → +5 streak bonus

      const session = result.current.currentSession!
      expect(session.stats.currentStreak).toBe(3)
      expect(session.stats.longestStreak).toBe(3)
      expect(result.current.userProfile.xp).toBe(
        xpAfterTwo + XP_REWARDS.correctAnswer + XP_REWARDS.speedBonus + XP_REWARDS.streakBonus
      )
    })

    it('resets the streak on a wrong answer, awards no XP, and records the mistake in the vault', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 4)
      })

      answerCorrectly(result)
      answerCorrectly(result)
      const xpBefore = result.current.userProfile.xp

      answerIncorrectly(result)

      const session = result.current.currentSession!
      expect(session.stats.currentStreak).toBe(0)
      expect(session.stats.incorrectAnswers).toBe(1)
      expect(result.current.userProfile.xp).toBe(xpBefore)

      // Mistake vault: one entry, matching the problem operands, and persisted.
      const vault = result.current.mistakeVault
      expect(vault).toHaveLength(1)
      const missed = session.problems[2]
      expect(vault[0].num1).toBe(missed.operand1)
      expect(vault[0].num2).toBe(missed.operand2)
      expect(vault[0].operation).toBe(missed.operation)
      const stored = JSON.parse(localStorage.getItem('mistake-vault')!)
      expect(stored).toHaveLength(1)
    })

    it('does not record a correct answer as a mistake', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })

      answerCorrectly(result)

      expect(result.current.mistakeVault).toHaveLength(0)
    })
  })

  describe('session completion', () => {
    it('completes a perfect session: history saved, stats shown, perfect bonus + badge awarded, no XP double-counting', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })

      // 3 correct answers: 25 + 25 + 30 per-problem XP = 80.
      answerCorrectly(result)
      answerCorrectly(result)
      answerCorrectly(result)

      const session = result.current.currentSession!
      expect(result.current.showStats).toBe(true)
      expect(session.stats.accuracy).toBe(100)
      expect(session.stats.correctAnswers).toBe(3)

      // +50 perfect-session bonus on top of the per-problem XP, and nothing more
      // (the old bug re-summed per-problem XP at completion — PR #53).
      expect(result.current.userProfile.xp).toBe(
        25 + 25 + (25 + XP_REWARDS.streakBonus) + XP_REWARDS.perfectSession
      )

      // First correct answer earns the first_blood badge.
      const firstBlood = result.current.userProfile.badges.find(b => b.id === 'first_blood')
      expect(firstBlood?.earned).toBe(true)

      // Session is appended to history and persisted.
      expect(result.current.sessionHistory).toHaveLength(1)
      const storedHistory = JSON.parse(localStorage.getItem('session-history')!)
      expect(storedHistory).toHaveLength(1)
      expect(storedHistory[0].id).toBe(session.id)

      // Cumulative counters updated with the answered problems.
      expect(result.current.userProfile.counters.totalProblemsSolved).toBe(3)
    })

    it('does not award the perfect-session bonus when the session was imperfect', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })

      answerCorrectly(result)
      answerIncorrectly(result)
      answerCorrectly(result)

      expect(result.current.showStats).toBe(true)
      expect(result.current.currentSession!.stats.accuracy).toBeLessThan(100)
      // Two correct answers only (25 + 25), no 50 XP perfect bonus.
      expect(result.current.userProfile.xp).toBe(50)
    })
  })

  describe('restart', () => {
    it('clears the session and removes the persisted current-session', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })
      expect(localStorage.getItem('current-session')).not.toBeNull()

      act(() => {
        result.current.restart()
      })

      expect(result.current.currentSession).toBeNull()
      expect(result.current.difficulty).toBeNull()
      expect(result.current.showStats).toBe(false)
      expect(localStorage.getItem('current-session')).toBeNull()
    })
  })

  describe('mistake vault remediation', () => {
    const seededMistake: StoredMistake = {
      id: 'mistake-1',
      problemId: 'problem-1',
      num1: 7,
      num2: 4,
      operation: 'addition',
      incorrectAnswers: [12],
      repetitionLevel: 0,
      consecutiveCorrect: 0,
      nextReviewTimestamp: 0,
      lastReviewedAt: null,
      addedAt: 0,
    }

    it('starts a remediation session from due mistakes and reviews them on correct answers', () => {
      localStorage.setItem('mistake-vault', JSON.stringify([seededMistake]))
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startRemediationSession()
      })

      const session = result.current.currentSession!
      expect(session.isRemediation).toBe(true)
      expect(result.current.showStats).toBe(false)
      // The due mistake is the first remediation problem.
      expect(session.problems[0].operand1).toBe(7)
      expect(session.problems[0].operand2).toBe(4)
      expect(session.problems[0].correctAnswer).toBe(11)

      answerCorrectly(result)

      // The vault entry is reviewed: repetition level advances, not graduated yet.
      const vault = result.current.mistakeVault
      expect(vault).toHaveLength(1)
      expect(vault[0].repetitionLevel).toBe(1)
      expect(vault[0].consecutiveCorrect).toBe(1)
    })

    it('resets the repetition level when a remediation answer is wrong', () => {
      localStorage.setItem('mistake-vault', JSON.stringify([seededMistake]))
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startRemediationSession()
      })

      answerIncorrectly(result)

      const vault = result.current.mistakeVault
      expect(vault).toHaveLength(1)
      expect(vault[0].repetitionLevel).toBe(0)
      expect(vault[0].consecutiveCorrect).toBe(0)
    })

    it('is a no-op toast when no mistakes are due', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startRemediationSession()
      })
      expect(result.current.currentSession).toBeNull()
    })
  })

  describe('settings and profile updates', () => {
    it('patches settings and the presentation mode on the profile', () => {
      const { result } = renderHook(() => usePracticeSession())

      act(() => {
        result.current.changeSettings({ scratchpadEnabled: true, wordProblemsEnabled: true })
      })
      expect(result.current.userProfile.settings.scratchpadEnabled).toBe(true)
      expect(result.current.userProfile.settings.wordProblemsEnabled).toBe(true)

      act(() => {
        result.current.changePresentationMode('vertical')
      })
      expect(result.current.userProfile.settings.presentationMode).toBe('vertical')

      // Profile persisted for the next mount.
      const saved = JSON.parse(localStorage.getItem('userProfile')!)
      expect(saved.settings.presentationMode).toBe('vertical')
    })

    it('applies the session mode to an in-flight session', () => {
      const { result } = renderHook(() => usePracticeSession())
      act(() => {
        result.current.startSession('beginner', 3)
      })

      act(() => {
        result.current.changeSessionMode('fluency')
      })

      expect(result.current.sessionMode).toBe('fluency')
      expect(result.current.currentSession!.sessionMode).toBe('fluency')
      expect(result.current.currentSession!.guidedMode).toBe(false)
    })
  })
})
