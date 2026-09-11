import { useState, useEffect, useMemo } from 'react'
import { DifficultyLevel, OperationType, Problem, PracticeSession, UserProfile, PresentationMode, CanvasBackground } from '@/lib/types'
import { generateProblems } from '@/lib/mathUtils'
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
import { ArrowLeft, GraduationCap, ChartBar, Trophy, Flame } from '@phosphor-icons/react'
import { AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import {
  initializeUserProfile,
  loadUserProfile,
  saveUserProfile,
  calculateXPForProblem,
  calculateSessionXP,
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
  const [guidedMode, setGuidedMode] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  
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

  // Start timer when problem changes
  useEffect(() => {
    if (currentSession && currentSession.problems[currentSession.currentProblemIndex]) {
      setStartTime(Date.now())
    }
  }, [currentSession?.currentProblemIndex])

  // Memoize problem generation
  const memoizedProblems = useMemo(() => {
    if (difficulty) {
      return generateProblems(10, difficulty, operationType)
    }
    return []
  }, [difficulty, operationType])

  const startSession = (selectedDifficulty: DifficultyLevel, problemCount: number = 20) => {
    setDifficulty(selectedDifficulty)
    const problems = generateProblems(problemCount, selectedDifficulty, operationType)
    
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
      guidedMode
    }
    
    setCurrentSession(session)
    setStartTime(Date.now())
  }

  const handleSubmitAnswer = (answer: number, hintsUsed: number) => {
    if (!currentSession || startTime === null) return

    const currentProblem = currentSession.problems[currentSession.currentProblemIndex]
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    const isCorrect = Math.abs(answer - currentProblem.correctAnswer) < 0.01

    const updatedProblem = {
      ...currentProblem,
      userAnswer: answer,
      isCorrect,
      timeSpent,
      hintsUsed
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
      setTimeout(() => {
        setShowSuccess(false)
        handleNextProblem()
      }, 800)
    }
  }

  const handleNextProblem = () => {
    if (!currentSession) return

    if (currentSession.currentProblemIndex < currentSession.problems.length - 1) {
      setCurrentSession({
        ...currentSession,
        currentProblemIndex: currentSession.currentProblemIndex + 1
      })
    } else {
      // Session complete - check for badges and add XP
      if (currentSession.stats.accuracy === 100) {
        const perfectBonus = calculatePerfectSessionBonus(currentSession.stats)
        if (perfectBonus > 0) {
          const updatedProfile = addXPToProfile(userProfile, perfectBonus)
          setUserProfile(updatedProfile)
          toast.success(`+${perfectBonus} XP Perfect Session Bonus!`, {
            description: 'All answers correct!',
          })
        }
      }
      
      // Check for newly earned badges
      const newBadges = checkBadges(currentSession.stats, userProfile, currentSession.problems)
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
      
      // Add session XP to profile
      const sessionXP = calculateSessionXP(currentSession.stats, currentSession.problems)
      if (sessionXP > 0) {
        const updatedProfile = addXPToProfile(userProfile, sessionXP)
        setUserProfile(updatedProfile)
      }
      
      setSessionHistory((prev) => [...(prev || []), currentSession])
      setShowStats(true)
      toast.success('Session Complete!', {
        description: `You scored ${currentSession.stats.accuracy}%`
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
      const problems = generateProblems(count, difficulty, operationType)
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

  const handleGuidedModeChange = (checked: boolean) => {
    setGuidedMode(checked)
    if (currentSession) {
      setCurrentSession({ ...currentSession, guidedMode: checked })
    }
  }

  const handlePresentationModeChange = (mode: PresentationMode) => {
    setUserProfile({
      ...userProfile,
      settings: { ...userProfile.settings, presentationMode: mode },
    })
  }

  const handleSettingsChange = (
    patch: Partial<Pick<UserProfile['settings'], 'canvasBackground' | 'scratchpadEnabled' | 'palmRejection'>>
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
              
              <div className="flex items-center justify-center gap-3 pt-4">
                <Switch
                  id="guided-mode"
                  checked={guidedMode}
                  onCheckedChange={handleGuidedModeChange}
                />
                <Label htmlFor="guided-mode" className="text-base cursor-pointer">
                  Enable Guided Mode (with hints)
                </Label>
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
                onSubmit={handleSubmitAnswer}
                onNext={handleNextProblem}
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
    </div>
  )
}

export default App
