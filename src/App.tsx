import { useState, useEffect, useMemo } from 'react'
import { DifficultyLevel, OperationType, Problem, PracticeSession, UserProfile, PresentationMode, CanvasBackground, SessionMode, StoredMistake } from '@/lib/types'
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
import { DifficultySelect } from '@/components/DifficultySelect'
import { OperationSelect } from '@/components/OperationSelect'
import { ProblemCard } from '@/components/ProblemCard'
import { StatsDashboard } from '@/components/StatsDashboard'
import { PrintWorksheet } from '@/components/PrintWorksheet'
import { SuccessAnimation } from '@/components/SuccessAnimation'
import { XPProgressBar } from '@/components/gamification/XPProgressBar'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { BadgeDisplay } from '@/components/gamification/BadgeDisplay'
import { StreakDisplay } from '@/components/gamification/StreakDisplay'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CanvasGridSelector } from '@/components/canvas/CanvasGridSelector'
import { StrokeReplayViewer } from '@/components/canvas/StrokeReplayViewer'
import { MistakeVaultModal } from '@/components/workflow/MistakeVaultModal'
import { StrokeSession } from '@/lib/ink/strokeStore'
import { ArrowLeft, GraduationCap, ChartBar, Trophy, Flame, Vault, Target, Gauge } from '@phosphor-icons/react'
import { AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import {
  initializeUserProfile,
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
  calculatePerfectSessionBonus,
} from '@/lib/scoring'

function App() {
  // Load session history and current session from localStorage
  const [sessionHistory, setSessionHistory] = useState<PracticeSession[]>(() => {
    const saved = localStorage.getItem('session-history')
    return saved ? JSON.parse(saved) : []
  })
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(() => {
    const saved = localStorage.getItem('current-session')
    return saved ? JSON.parse(saved) : null
  })
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null)
  const [operationType, setOperationType] = useState<OperationType>('addition')
  const [sessionMode, setSessionMode] = useState<SessionMode>('mastery')
  const [showSuccess, setShowSuccess] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [showVault, setShowVault] = useState(false)
  const [mistakeVault, setMistakeVault] = useState<StoredMistake[]>(() => loadMistakeVault())
  // Phase 5: captured ink per problem, for educator stroke replay.
  const [strokeSessions, setStrokeSessions] = useState<Record<string, StrokeSession>>({})
  const [replayProblemId, setReplayProblemId] = useState<string | null>(null)
  
  // Load user profile for gamification
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return loadUserProfile()
  })

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
  const buildProblems = (
    count: number,
    diff: DifficultyLevel,
    op: OperationType
  ): Problem[] => {
    const wordEnabled = userProfile.settings.wordProblemsEnabled
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

  // Memoize problem generation
  const memoizedProblems = useMemo(() => {
    if (difficulty) {
      return buildProblems(10, difficulty, operationType)
    }
    return []
  }, [difficulty, operationType])

  const startSession = (selectedDifficulty: DifficultyLevel, problemCount: number = 20) => {
    setDifficulty(selectedDifficulty)
    const problems = buildProblems(problemCount, selectedDifficulty, operationType)
    
    // Update daily streak when starting a new session
    const updatedDailyStreak = updateDailyStreak(userProfile.dailyStreak, new Date().toISOString().split('T')[0])
    const updatedProfile = { ...userProfile, dailyStreak: updatedDailyStreak }
    setUserProfile(updatedProfile)
    
    // Check for return bonus
    const returnBonus = getReturnBonus(updatedProfile.dailyStreak)
    if (returnBonus > 0) {
      const profileWithBonus = addXPToProfile(updatedProfile, returnBonus)
      setUserProfile(claimReturnBonus(profileWithBonus.dailyStreak))
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
        longestStreak: 0
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
    const problems = buildRemediationProblems(
      mistakeVault,
      20,
      (n) => generateProblems(n, 'intermediate', 'mixed')
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
    setShowVault(false)
    setShowStats(false)
    setCurrentSession(session)
    setStartTime(Date.now())
  }

  const handleSubmitAnswer = (answer: number, hintsUsed: number) => {
    if (!currentSession || startTime === null) return

    const currentProblem = currentSession.problems[currentSession.currentProblemIndex]
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    const expected = getExpectedAnswer(currentProblem)
    const isCorrect = Math.abs(answer - expected) < 0.01

    const updatedProblem = {
      ...currentProblem,
      userAnswer: answer,
      isCorrect,
      timeSpent,
      hintsUsed
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

    const correctAnswers = updatedProblems.filter(p => p.isCorrect === true).length
    const incorrectAnswers = updatedProblems.filter(p => p.isCorrect === false).length
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
        longestStreak: longestStreak
      }
    }

    setCurrentSession(updatedSession)

    // Update user profile with XP
    if (isCorrect && xpEarned > 0) {
      const updatedProfile = addXPToProfile(userProfile, xpEarned)
      setUserProfile(updatedProfile)
      
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
        currentProblemIndex: session.currentProblemIndex + 1
      })
    } else {
      // Session complete - check for badges and add XP
      if (session.stats.accuracy === 100) {
        const perfectBonus = calculatePerfectSessionBonus(session.stats)
        if (perfectBonus > 0) {
          const updatedProfile = addXPToProfile(userProfile, perfectBonus)
          setUserProfile(updatedProfile)
          toast.success(`+${perfectBonus} XP Perfect Session Bonus!`, {
            description: 'All answers correct!',
          })
        }
      }
      
      // Check for newly earned badges
      const newBadges = checkBadges(session.stats, userProfile, session.problems)
      if (newBadges.length > 0) {
        const profileWithBadges = addBadgesToProfile(userProfile, newBadges)
        setUserProfile(profileWithBadges)
        
        newBadges.forEach((badge) => {
          toast.success(`Badge Earned: ${badge.name}!`, {
            description: badge.description,
            duration: 5000,
          })
        })
      }
      
      // Per-problem XP is already awarded in handleSubmitAnswer; do not add
      // calculateSessionXP again here (it re-sums the same per-problem XP and
      // the perfect-session bonus, which would double-count).
      setSessionHistory((prev) => [...(prev || []), session])
      setShowStats(true)
      toast.success('Session Complete!', {
        description: `You scored ${session.stats.accuracy}%`
      })
    }
  }

  const handleRestart = () => {
    if (currentSession) {
      const unanswered = currentSession.problems.filter(p => p.userAnswer === undefined).length
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
    setReplayProblemId(null)
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
            longestStreak: 0
          }
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
    setUserProfile({
      ...userProfile,
      settings: { ...userProfile.settings, presentationMode: mode },
    })
  }

  const handleSettingsChange = (
    patch: Partial<Pick<UserProfile['settings'], 'canvasBackground' | 'scratchpadEnabled' | 'palmRejection' | 'manipulativesEnabled' | 'wordProblemsEnabled'>>
  ) => {
    setUserProfile({
      ...userProfile,
      settings: { ...userProfile.settings, ...patch },
    })
  }

  const currentProblem = currentSession?.problems[currentSession.currentProblemIndex]

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      <header className="border-b bg-card/50 backdrop-blur no-print">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap size={32} weight="duotone" className="text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Math Practice</h1>
            </div>
            
            {currentSession && !showStats && (
              <div className="flex items-center gap-4">
                <UIBadge variant="secondary" className="text-sm px-3 py-1">
                  {difficulty?.charAt(0).toUpperCase()}{difficulty?.slice(1)}
                </UIBadge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGamification(!showGamification)}
                  className="flex items-center gap-1"
                >
                  <Trophy size={18} />
                  Gamification
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRestart}>
                  <ArrowLeft size={20} />
                  Exit
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Gamification Sidebar (Slide-in Panel) */}
      {showGamification && currentSession && (
        <div className="fixed top-0 right-0 z-50 w-80 h-full bg-white dark:bg-gray-900 shadow-2xl transform translate-x-0 transition-transform duration-300 ease-in-out no-print">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Gamification
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGamification(false)}
                className="p-1"
              >
                <span className="text-xl">×</span>
              </Button>
            </div>
            
            {/* User Profile Summary */}
            <div className="space-y-4">
              <LevelBadge profile={userProfile} showLabel={false} />
              <XPProgressBar profile={userProfile} />
              <StreakDisplay profile={userProfile} sessionStats={currentSession.stats} />
              <BadgeDisplay profile={userProfile} showOnlyEarned={true} />
            </div>
          </div>
        </div>
      )}

      {/* Overlay for gamification panel */}
      {showGamification && (
        <div
          className="fixed inset-0 bg-black/50 z-40 no-print"
          onClick={() => setShowGamification(false)}
        />
      )}

      <main className="container mx-auto px-4 py-8 md:py-12">
        {!difficulty ? (
          <div className="space-y-8">
            <DifficultySelect onSelect={startSession} />
            
            <Separator className="my-8" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Practice Settings</h3>
              <OperationSelect selected={operationType} onSelect={setOperationType} />
              
              <div className="flex flex-col items-center gap-2 pt-4">
                <Label className="text-base font-medium">Session Mode</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={sessionMode === 'mastery' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSessionModeChange('mastery')}
                    className="gap-1"
                  >
                    <Target size={16} />
                    Mastery
                  </Button>
                  <Button
                    variant={sessionMode === 'fluency' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSessionModeChange('fluency')}
                    className="gap-1"
                  >
                    <Gauge size={16} />
                    Fluency (timed sprint)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-md">
                  Mastery: untimed with hints and manipulatives. Fluency: timed sprint, no hints — speed earns bonus XP.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Switch
                  id="vertical-mode"
                  checked={userProfile.settings.presentationMode === 'vertical'}
                  onCheckedChange={(checked) =>
                    handlePresentationModeChange(checked ? 'vertical' : 'horizontal')
                  }
                />
                <Label htmlFor="vertical-mode" className="text-base cursor-pointer">
                  Vertical Layout (column math with carry/borrow)
                </Label>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Switch
                  id="manipulatives-mode"
                  checked={userProfile.settings.manipulativesEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingsChange({ manipulativesEnabled: checked })
                  }
                />
                <Label htmlFor="manipulatives-mode" className="text-base cursor-pointer">
                  Show Visual Manipulatives (ten-frames, number lines, arrays)
                </Label>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Switch
                  id="word-problems-mode"
                  checked={userProfile.settings.wordProblemsEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingsChange({ wordProblemsEnabled: checked })
                  }
                />
                <Label htmlFor="word-problems-mode" className="text-base cursor-pointer">
                  Word Problems (story problems with read-aloud)
                </Label>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Switch
                  id="scratchpad-mode"
                  checked={userProfile.settings.scratchpadEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingsChange({ scratchpadEnabled: checked })
                  }
                />
                <Label htmlFor="scratchpad-mode" className="text-base cursor-pointer">
                  Show Scratchpad (rough-work zone)
                </Label>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Switch
                  id="palm-rejection"
                  checked={userProfile.settings.palmRejection}
                  onCheckedChange={(checked) =>
                    handleSettingsChange({ palmRejection: checked })
                  }
                />
                <Label htmlFor="palm-rejection" className="text-base cursor-pointer">
                  Palm Rejection (ignore touch while using stylus)
                </Label>
              </div>

              <div className="pt-4 flex justify-center">
                <CanvasGridSelector
                  value={userProfile.settings.canvasBackground}
                  onChange={(background) =>
                    handleSettingsChange({ canvasBackground: background })
                  }
                />
              </div>
            </div>

            <Separator className="my-8" />
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowVault(true)}
                className="gap-2"
              >
                <Vault size={20} />
                Mistake Vault
                {mistakeVault.length > 0 && (
                  <UIBadge variant="destructive" className="ml-1">
                    {mistakeVault.length}
                  </UIBadge>
                )}
              </Button>
            </div>

            {sessionHistory && sessionHistory.length > 0 && (
              <>
                <Separator className="my-8" />
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowStats(true)}
                    className="gap-2"
                  >
                    <ChartBar size={20} />
                    View Previous Sessions
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : showStats ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Session Complete! \ud83c\udf89</h2>
              <p className="text-muted-foreground">Here's how you did:</p>
            </div>
            
            {currentSession && <StatsDashboard stats={currentSession.stats} history={sessionHistory} />}

            {currentSession && Object.keys(strokeSessions).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-center">Stroke Replay (Educator)</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentSession.problems
                    .filter((p) => strokeSessions[p.id])
                    .map((p, idx) => (
                      <Button
                        key={p.id}
                        variant={replayProblemId === p.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setReplayProblemId(p.id)}
                      >
                        Problem {idx + 1}
                      </Button>
                    ))}
                </div>
                {replayProblemId && strokeSessions[replayProblemId] && (
                  <div className="max-w-2xl mx-auto">
                    <StrokeReplayViewer session={strokeSessions[replayProblemId]} />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={handleNewSession} size="lg" className="gap-2">
                Practice Again
              </Button>
              <Button onClick={handleRestart} variant="outline" size="lg">
                Change Settings
              </Button>
            </div>
          </div>
        ) : currentSession && currentProblem ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center no-print">
              <StatsDashboard stats={currentSession.stats} history={sessionHistory} />
            </div>
            
            <Separator className="no-print" />
            
            <AnimatePresence mode="wait">
              <ProblemCard
                key={currentProblem.id}
                problem={currentProblem}
                problemNumber={currentSession.currentProblemIndex + 1}
                totalProblems={currentSession.problems.length}
                guidedMode={currentSession.guidedMode}
                presentationMode={userProfile.settings.presentationMode}
                canvasBackground={userProfile.settings.canvasBackground}
                scratchpadEnabled={userProfile.settings.scratchpadEnabled}
                palmRejection={userProfile.settings.palmRejection}
                manipulativesEnabled={userProfile.settings.manipulativesEnabled}
                onSubmit={handleSubmitAnswer}
                onNext={handleNextProblem}
                onStrokeSession={handleStrokeSession}
              />
            </AnimatePresence>

            <div className="flex justify-center no-print">
              <PrintWorksheet
                problems={currentSession.problems}
                difficulty={difficulty}
                operation={operationType}
                onGenerate={handleGenerateWorksheet}
              />
            </div>
          </div>
        ) : null}
      </main>

      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>
      
      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {showSuccess && 'Correct! Well done!'}
        {currentSession && currentProblem && `Problem ${currentSession.currentProblemIndex + 1} of ${currentSession.problems.length}`}
      </div>

      <MistakeVaultModal
        open={showVault}
        onOpenChange={setShowVault}
        vault={mistakeVault}
        onRemove={handleRemoveMistake}
        onClearAll={handleClearVault}
        onStartRemediation={startRemediationSession}
      />
    </div>
  )
}

export default App
