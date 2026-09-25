import { useState, useEffect, useRef } from 'react'
import {
  DifficultyLevel,
  OperationType,
  Problem,
  PracticeSession,
  UserProfile,
  PresentationMode,
  SessionMode,
  StoredMistake,
} from '@/lib/types'
import { generateProblems, generateProblem, withUnknownPosition, getExpectedAnswer } from '@/lib/mathUtils'
import { generateWordProblem } from '@/lib/wordProblems'
import {
  recordMistake,
  reviewMistake,
  removeMistake as removeMistakeFromVault,
  getDueMistakes,
  buildRemediationProblems,
  loadMistakeVault,
  saveMistakeVault,
  clearMistakeVault,
} from '@/lib/repetition/spacedRepetition'
import { StrokeSession } from '@/lib/ink/strokeStore'
import { toast } from 'sonner'
import {
  loadUserProfile,
  saveUserProfile,
  calculateXPForProblem,
  addXPToProfile,
  calculateNewStreak,
  updateDailyStreak,
  getReturnBonus,
  claimReturnBonus,
  checkBadges,
  addBadgesToProfile,
  updatePracticeCounters,
  calculatePerfectSessionBonus,
} from '@/lib/scoring'

export type SettingsPatch = Partial<
  Pick<
    UserProfile['settings'],
    'canvasBackground' | 'scratchpadEnabled' | 'palmRejection' | 'manipulativesEnabled' | 'wordProblemsEnabled'
  >
>

function loadSessionHistory(): PracticeSession[] {
  try {
    const saved = localStorage.getItem('session-history')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function loadCurrentSession(): PracticeSession | null {
  try {
    const saved = localStorage.getItem('current-session')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

/**
 * Owns all practice-session state and logic: the current session, session
 * history, the mistake vault, the user (gamification) profile, and the
 * answer → XP → streak → vault pipeline. Extracted from the App god
 * component (issue #69); rendering lives in the screen components.
 */
export function usePracticeSession() {
  const [sessionHistory, setSessionHistory] = useState<PracticeSession[]>(loadSessionHistory)
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(loadCurrentSession)
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null)
  const [operationType, setOperationType] = useState<OperationType>('addition')
  const [sessionMode, setSessionMode] = useState<SessionMode>('mastery')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [mistakeVault, setMistakeVault] = useState<StoredMistake[]>(() => loadMistakeVault())
  // Phase 5: captured ink per problem, for educator stroke replay.
  const [strokeSessions, setStrokeSessions] = useState<Record<string, StrokeSession>>({})
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile())
  // Mirror of userProfile for use inside callbacks/timeouts. Session
  // completion runs ~800ms after the final submit (post success animation)
  // and previously read the possibly-stale userProfile closure, silently
  // overwriting the final answer's XP (found by the #71 integration tests).
  const profileRef = useRef(userProfile)
  const applyProfile = (next: UserProfile) => {
    profileRef.current = next
    setUserProfile(next)
  }

  // Save user profile when it changes
  useEffect(() => {
    saveUserProfile(userProfile)
  }, [userProfile])

  // Save session history and current session to localStorage
  useEffect(() => {
    localStorage.setItem('session-history', JSON.stringify(sessionHistory))
  }, [sessionHistory])

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('current-session', JSON.stringify(currentSession))
    } else {
      localStorage.removeItem('current-session')
    }
  }, [currentSession])

  // Persist the Mistake Vault.
  useEffect(() => {
    saveMistakeVault(mistakeVault)
  }, [mistakeVault])

  // Start timer when problem changes
  useEffect(() => {
    if (currentSession && currentSession.problems[currentSession.currentProblemIndex]) {
      setStartTime(Date.now())
    }
  }, [currentSession?.currentProblemIndex])

  // Phase 6: build a problem set honoring the word-problems / missing-operand
  // toggles, falling back to plain generation otherwise.
  const buildProblems = (count: number, diff: DifficultyLevel, op: OperationType): Problem[] => {
    const wordEnabled = profileRef.current.settings.wordProblemsEnabled
    const operations: Exclude<OperationType, 'mixed'>[] =
      op === 'mixed' ? ['addition', 'subtraction', 'multiplication', 'division'] : [op as Exclude<OperationType, 'mixed'>]
    const problems: Problem[] = []
    for (let i = 0; i < count; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)]
      if (wordEnabled) {
        problems.push(generateWordProblem(diff, operation))
      } else {
        problems.push(withUnknownPosition(generateProblem(diff, operation), diff))
      }
    }
    return problems
  }

  const startSession = (selectedDifficulty: DifficultyLevel, problemCount: number = 20) => {
    setDifficulty(selectedDifficulty)
    const problems = buildProblems(problemCount, selectedDifficulty, operationType)

    // Update daily streak when starting a new session
    const updatedDailyStreak = updateDailyStreak(profileRef.current.dailyStreak, new Date().toISOString().split('T')[0])
    const updatedProfile = { ...profileRef.current, dailyStreak: updatedDailyStreak }
    applyProfile(updatedProfile)

    // Check for return bonus
    const returnBonus = getReturnBonus(updatedProfile.dailyStreak)
    if (returnBonus > 0) {
      const profileWithBonus = addXPToProfile(updatedProfile, returnBonus)
      applyProfile({ ...profileWithBonus, dailyStreak: claimReturnBonus(profileWithBonus.dailyStreak) })
      toast.success(`+${returnBonus} XP Return Bonus!`, {
        description: 'Welcome back! Here is your return bonus.',
      })
    }

    const guidedMode = sessionMode === 'mastery'
    const session: PracticeSession = {
      id: crypto.randomUUID(),
      difficulty: selectedDifficulty,
      operationType,
      problems,
      currentProblemIndex: 0,
      stats: {
        totalProblems: problems.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        totalTime: 0,
        averageTime: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      startTime: Date.now(),
      guidedMode,
      sessionMode,
    }

    setCurrentSession(session)
    setStartTime(Date.now())
  }

  const startRemediationSession = () => {
    const due = getDueMistakes(mistakeVault)
    if (due.length === 0) {
      toast.info('No mistakes due for review right now.')
      return
    }
    const problems = buildRemediationProblems(mistakeVault, 20, (n) =>
      generateProblems(n, 'intermediate', 'mixed')
    )
    const session: PracticeSession = {
      id: crypto.randomUUID(),
      difficulty: 'intermediate',
      operationType: 'mixed',
      problems,
      currentProblemIndex: 0,
      stats: {
        totalProblems: problems.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        totalTime: 0,
        averageTime: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      startTime: Date.now(),
      guidedMode: true,
      sessionMode: 'mastery',
      isRemediation: true,
    }
    setDifficulty('intermediate')
    setOperationType('mixed')
    setShowStats(false)
    setCurrentSession(session)
    setStartTime(Date.now())
  }

  const handleSubmitAnswer = (answer: number, hintsUsed: number) => {
    if (!currentSession) return

    const currentProblem = currentSession.problems[currentSession.currentProblemIndex]
    // startTime may be null if the learner skips before focusing the answer
    // field (the timer is started on focus or problem change). Fall back to
    // "now" so the submit/skip always proceeds instead of being silently
    // dropped (issue #61: skip did nothing when startTime was null).
    const timeSpent = startTime === null ? 0 : Math.floor((Date.now() - startTime) / 1000)
    const expected = getExpectedAnswer(currentProblem)
    const isCorrect = Math.abs(answer - expected) < 0.01

    const updatedProblem = {
      ...currentProblem,
      userAnswer: answer,
      isCorrect,
      timeSpent,
      hintsUsed,
    }

    // Phase 4: Mistake Vault.
    if (currentSession.isRemediation) {
      const matching = mistakeVault.find(
        (m) =>
          m.num1 === currentProblem.operand1 &&
          m.num2 === currentProblem.operand2 &&
          m.operation === currentProblem.operation
      )
      if (matching) {
        setMistakeVault((prev) => reviewMistake(prev, matching.id, isCorrect))
      }
    } else if (!isCorrect) {
      setMistakeVault((prev) => recordMistake(prev, currentProblem, answer))
    }

    const updatedProblems = [...currentSession.problems]
    updatedProblems[currentSession.currentProblemIndex] = updatedProblem

    const correctAnswers = updatedProblems.filter((p) => p.isCorrect === true).length
    const incorrectAnswers = updatedProblems.filter((p) => p.isCorrect === false).length
    const totalAnswered = correctAnswers + incorrectAnswers
    const totalTime = updatedProblems.reduce((sum, p) => sum + (p.timeSpent || 0), 0)

    // Calculate streak
    const previousProblem = currentSession.problems[currentSession.currentProblemIndex - 1]
    const previousWasCorrect = previousProblem ? previousProblem.isCorrect === true : false
    const currentStreak = currentSession.stats.currentStreak || 0
    const newStreak = calculateNewStreak(isCorrect, previousWasCorrect, currentStreak)
    const longestStreak = Math.max(currentSession.stats.longestStreak || 0, newStreak)

    // Calculate XP for this problem
    const xpEarned = calculateXPForProblem(isCorrect, timeSpent * 1000, currentStreak)

    const updatedSession: PracticeSession = {
      ...currentSession,
      problems: updatedProblems,
      stats: {
        ...currentSession.stats,
        correctAnswers,
        incorrectAnswers,
        accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
        totalTime,
        averageTime: totalAnswered > 0 ? Math.round(totalTime / totalAnswered) : 0,
        currentStreak: newStreak,
        longestStreak,
      },
    }

    setCurrentSession(updatedSession)

    // Update user profile with XP
    if (isCorrect && xpEarned > 0) {
      const updatedProfile = addXPToProfile(profileRef.current, xpEarned)
      applyProfile(updatedProfile)

      // Show XP earned toast
      toast.success(`+${xpEarned} XP!`, {
        description: isCorrect ? 'Correct answer!' : undefined,
      })
    }

    if (isCorrect) {
      setShowSuccess(true)
      // Advance using the freshly-computed session so the recorded answer
      // (correctAnswers, streak, XP, etc.) is preserved. Earlier this used a
      // bare handleNextProblem() whose closure captured the pre-update
      // currentSession, which discarded the just-recorded correct answer.
      setTimeout(() => {
        setShowSuccess(false)
        advanceFromSession(updatedSession)
      }, 800)
    }
  }

  const handleNextProblem = () => {
    if (!currentSession) return
    advanceFromSession(currentSession)
  }

  const advanceFromSession = (session: PracticeSession) => {
    if (session.currentProblemIndex < session.problems.length - 1) {
      setCurrentSession({
        ...session,
        currentProblemIndex: session.currentProblemIndex + 1,
      })
    } else {
      // Session complete - update cumulative counters, award any perfect
      // bonus, then check badges. A single updated profile is threaded
      // through the whole chain: previously the perfect-bonus XP update
      // and the badge update both started from the same stale userProfile,
      // so the perfect-bonus XP was silently lost whenever badges were
      // earned in the same session.
      let updatedProfile = updatePracticeCounters(profileRef.current, session.problems)

      if (session.stats.accuracy === 100) {
        const perfectBonus = calculatePerfectSessionBonus(session.stats)
        if (perfectBonus > 0) {
          updatedProfile = addXPToProfile(updatedProfile, perfectBonus)
          toast.success(`+${perfectBonus} XP Perfect Session Bonus!`, {
            description: 'All answers correct!',
          })
        }
      }

      // Check for newly earned badges. The counters updated above already
      // include this session's problems, so mastery / marathon / streak
      // badges accumulate across sessions (issue #66).
      const newBadges = checkBadges(session.stats, updatedProfile, session.problems)
      if (newBadges.length > 0) {
        updatedProfile = addBadgesToProfile(updatedProfile, newBadges)

        newBadges.forEach((badge) => {
          toast.success(`Badge Earned: ${badge.name}!`, {
            description: badge.description,
            duration: 5000,
          })
        })
      }

      applyProfile(updatedProfile)

      // Per-problem XP is already awarded in handleSubmitAnswer; do not add
      // calculateSessionXP again here (it re-sums the same per-problem XP and
      // the perfect-session bonus, which would double-count).
      setSessionHistory((prev) => [...(prev || []), session])
      setShowStats(true)
      toast.success('Session Complete!', {
        description: `You scored ${session.stats.accuracy}%`,
      })
    }
  }

  const handleRestart = () => {
    if (currentSession) {
      const unanswered = currentSession.problems.filter((p) => p.userAnswer === undefined).length
      if (unanswered > 3) {
        if (!window.confirm(`You have ${unanswered} unanswered problems. Exit anyway?`)) {
          return
        }
      }
    }
    setCurrentSession(null)
    setDifficulty(null)
    setShowStats(false)
    setStrokeSessions({})
    localStorage.removeItem('current-session')
  }

  const handleNewSession = () => {
    if (difficulty) {
      startSession(difficulty)
      setShowStats(false)
    }
  }

  const handleGenerateWorksheet = (count: number) => {
    if (difficulty) {
      const problems = buildProblems(count, difficulty, operationType)
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          problems,
          currentProblemIndex: 0,
          stats: {
            ...currentSession.stats,
            totalProblems: problems.length,
            correctAnswers: 0,
            incorrectAnswers: 0,
            accuracy: 0,
            totalTime: 0,
            averageTime: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
        })
      }
    }
  }

  const handleSessionModeChange = (mode: SessionMode) => {
    setSessionMode(mode)
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        sessionMode: mode,
        guidedMode: mode === 'mastery',
      })
    }
  }

  const handleRemoveMistake = (mistakeId: string) => {
    setMistakeVault((prev) => removeMistakeFromVault(prev, mistakeId))
  }

  const handleClearVault = () => {
    setMistakeVault(clearMistakeVault())
  }

  const handleStrokeSession = (session: StrokeSession) => {
    if (!currentSession) return
    const problemId = currentSession.problems[currentSession.currentProblemIndex]?.id
    if (!problemId) return
    setStrokeSessions((prev) => ({ ...prev, [problemId]: session }))
  }

  const handlePresentationModeChange = (mode: PresentationMode) => {
    applyProfile({
      ...profileRef.current,
      settings: { ...profileRef.current.settings, presentationMode: mode },
    })
  }

  const handleSettingsChange = (patch: SettingsPatch) => {
    applyProfile({
      ...profileRef.current,
      settings: { ...profileRef.current.settings, ...patch },
    })
  }

  const currentProblem = currentSession?.problems[currentSession.currentProblemIndex]

  return {
    // state
    sessionHistory,
    currentSession,
    currentProblem,
    difficulty,
    operationType,
    sessionMode,
    showSuccess,
    showStats,
    mistakeVault,
    strokeSessions,
    userProfile,
    // actions
    startSession,
    startRemediationSession,
    submitAnswer: handleSubmitAnswer,
    nextProblem: handleNextProblem,
    restart: handleRestart,
    newSession: handleNewSession,
    generateWorksheet: handleGenerateWorksheet,
    changeSessionMode: handleSessionModeChange,
    setOperationType,
    removeMistake: handleRemoveMistake,
    clearVault: handleClearVault,
    addStrokeSession: handleStrokeSession,
    changePresentationMode: handlePresentationModeChange,
    changeSettings: handleSettingsChange,
    setShowStats,
  }
}

export type PracticeSessionApi = ReturnType<typeof usePracticeSession>
