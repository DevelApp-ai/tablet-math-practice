import { useState, useEffect, useMemo } from 'react'
import { DifficultyLevel, OperationType, Problem, PracticeSession } from '@/lib/types'
import { generateProblems } from '@/lib/mathUtils'
import { DifficultySelect } from '@/components/DifficultySelect'
import { OperationSelect } from '@/components/OperationSelect'
import { ProblemCard } from '@/components/ProblemCard'
import { StatsDashboard } from '@/components/StatsDashboard'
import { PrintWorksheet } from '@/components/PrintWorksheet'
import { SuccessAnimation } from '@/components/SuccessAnimation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, GraduationCap, ChartBar } from '@phosphor-icons/react'
import { AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'sonner'

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
    const newStreak = isCorrect ? (previousWasCorrect ? (currentSession.stats.currentStreak || 0) + 1 : 1) : 0
    const longestStreak = Math.max(currentSession.stats.longestStreak || 0, newStreak)

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
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {difficulty?.charAt(0).toUpperCase()}{difficulty?.slice(1)}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleRestart}>
                  <ArrowLeft size={20} />
                  Exit
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

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
