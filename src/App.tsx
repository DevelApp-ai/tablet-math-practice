import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge as UIBadge } from '@/components/ui/badge'
import { LanguageSelector } from '@/components/LanguageSelector'
import { MistakeVaultModal } from '@/components/workflow/MistakeVaultModal'
import { SuccessAnimation } from '@/components/SuccessAnimation'
import { LandingScreen } from '@/components/screens/LandingScreen'
import { SessionScreen } from '@/components/screens/SessionScreen'
import { StatsScreen } from '@/components/screens/StatsScreen'
import { GamificationSidebar } from '@/components/gamification/GamificationSidebar'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { ArrowLeft, GraduationCap, Trophy } from '@phosphor-icons/react'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'sonner'

function App() {
  const { t } = useTranslation()
  const session = usePracticeSession()
  const [showGamification, setShowGamification] = useState(false)
  const [showVault, setShowVault] = useState(false)
  const [replayProblemId, setReplayProblemId] = useState<string | null>(null)

  const handleRestart = () => {
    session.restart()
    setReplayProblemId(null)
  }

  const handleStartRemediation = () => {
    session.startRemediationSession()
    setShowVault(false)
  }

  const {
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
  } = session

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      <header className="border-b bg-card/50 backdrop-blur no-print">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap size={32} weight="duotone" className="text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('app.header')}</h1>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              {currentSession && !showStats && (
                <div className="flex items-center gap-4">
                  <UIBadge variant="secondary" className="text-sm px-3 py-1">
                    {difficulty ? t(`difficulty.${difficulty}`) : ''}
                  </UIBadge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGamification(!showGamification)}
                    className="flex items-center gap-1"
                  >
                    <Trophy size={18} />
                    {t('gamification.title')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRestart}>
                    <ArrowLeft size={20} />
                    {t('session.exit')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Gamification Sidebar (Slide-in Panel) */}
      {showGamification && currentSession && (
        <GamificationSidebar
          profile={userProfile}
          sessionStats={currentSession.stats}
          onClose={() => setShowGamification(false)}
        />
      )}

      <main className="container mx-auto px-4 py-8 md:py-12">
        {!difficulty ? (
          <LandingScreen
            profile={userProfile}
            operationType={operationType}
            sessionMode={sessionMode}
            vaultCount={mistakeVault.length}
            hasHistory={sessionHistory.length > 0}
            onStartSession={session.startSession}
            onSelectOperation={session.setOperationType}
            onChangeSessionMode={session.changeSessionMode}
            onChangeSettings={session.changeSettings}
            onChangePresentationMode={session.changePresentationMode}
            onOpenVault={() => setShowVault(true)}
            onViewStats={() => session.setShowStats(true)}
          />
        ) : showStats && currentSession ? (
          <StatsScreen
            session={currentSession}
            history={sessionHistory}
            strokeSessions={strokeSessions}
            replayProblemId={replayProblemId}
            onSelectReplay={setReplayProblemId}
            onNewSession={session.newSession}
            onRestart={handleRestart}
          />
        ) : currentSession && currentProblem ? (
          <SessionScreen
            session={currentSession}
            currentProblem={currentProblem}
            difficulty={difficulty}
            operationType={operationType}
            history={sessionHistory}
            profile={userProfile}
            onSubmit={session.submitAnswer}
            onNext={session.nextProblem}
            onStrokeSession={session.addStrokeSession}
            onGenerateWorksheet={session.generateWorksheet}
          />
        ) : null}
      </main>

      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {showSuccess && t('common.correctWellDone')}
        {currentSession &&
          currentProblem &&
          t('session.problem', {
            current: currentSession.currentProblemIndex + 1,
            total: currentSession.problems.length,
          })}
      </div>

      <MistakeVaultModal
        open={showVault}
        onOpenChange={setShowVault}
        vault={mistakeVault}
        onRemove={session.removeMistake}
        onClearAll={session.clearVault}
        onStartRemediation={handleStartRemediation}
      />
    </div>
  )
}

export default App
