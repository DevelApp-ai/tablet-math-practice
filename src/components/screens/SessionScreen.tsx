import { DifficultyLevel, OperationType, PracticeSession, Problem, UserProfile } from '@/lib/types'
import { ProblemCard } from '@/components/ProblemCard'
import { StatsDashboard } from '@/components/StatsDashboard'
import { PrintWorksheet } from '@/components/PrintWorksheet'
import { Separator } from '@/components/ui/separator'
import { StrokeSession } from '@/lib/ink/strokeStore'
import { AnimatePresence } from 'framer-motion'

interface SessionScreenProps {
  session: PracticeSession
  currentProblem: Problem
  difficulty: DifficultyLevel | null
  operationType: OperationType
  history: PracticeSession[]
  profile: UserProfile
  onSubmit: (answer: number, hintsUsed: number) => void
  onNext: () => void
  onStrokeSession: (session: StrokeSession) => void
  onGenerateWorksheet: (count: number) => void
}

export function SessionScreen({
  session,
  currentProblem,
  difficulty,
  operationType,
  history,
  profile,
  onSubmit,
  onNext,
  onStrokeSession,
  onGenerateWorksheet,
}: SessionScreenProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center no-print">
        <StatsDashboard stats={session.stats} history={history} />
      </div>

      <Separator className="no-print" />

      <AnimatePresence mode="wait">
        <ProblemCard
          key={currentProblem.id}
          problem={currentProblem}
          problemNumber={session.currentProblemIndex + 1}
          totalProblems={session.problems.length}
          guidedMode={session.guidedMode}
          presentationMode={profile.settings.presentationMode}
          canvasBackground={profile.settings.canvasBackground}
          scratchpadEnabled={profile.settings.scratchpadEnabled}
          palmRejection={profile.settings.palmRejection}
          manipulativesEnabled={profile.settings.manipulativesEnabled}
          onSubmit={onSubmit}
          onNext={onNext}
          onStrokeSession={onStrokeSession}
        />
      </AnimatePresence>

      <div className="flex justify-center no-print">
        <PrintWorksheet
          problems={session.problems}
          difficulty={difficulty}
          operation={operationType}
          onGenerate={onGenerateWorksheet}
        />
      </div>
    </div>
  )
}
