import { useState, useEffect, useRef, useMemo } from 'react'
import { Problem, PresentationMode, CanvasBackground, ProblemDiagnostic } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getOperationSymbol, checkAnswer, formatNumber } from '@/lib/mathUtils'
import { supportsVerticalLayout } from '@/lib/verticalMath'
import { VerticalAlgorithm } from '@/components/workflow/VerticalAlgorithm'
import { Scratchpad } from '@/components/canvas/Scratchpad'
import { StrokeSession } from '@/lib/ink/strokeStore'
import { ManipulativeStage } from '@/components/manipulatives/ManipulativeStage'
import { BalanceScale } from '@/components/manipulatives/BalanceScale'
import { getWordProblemSpeech, isWordProblem } from '@/lib/wordProblems'
import { getExpectedAnswer } from '@/lib/mathUtils'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { BugFeedbackBanner } from '@/components/diagnostics/BugFeedbackBanner'
import { HintAccordion } from '@/components/diagnostics/HintAccordion'
import { classifyError } from '@/lib/diagnostics/errorPatterns'
import { getStructuredHints } from '@/lib/diagnostics/hintsEngine'
import { Lightbulb, Check, X as XIcon, ArrowRight, SkipForward, SpeakerSimpleHigh, Stop } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PenInput } from './PenInput'

interface ProblemCardProps {
  problem: Problem
  problemNumber: number
  totalProblems: number
  guidedMode: boolean
  presentationMode: PresentationMode
  canvasBackground: CanvasBackground
  scratchpadEnabled: boolean
  palmRejection: boolean
  manipulativesEnabled: boolean
  onSubmit: (answer: number, hintsUsed: number) => void
  onNext: () => void
  onStrokeSession?: (session: StrokeSession) => void
}

export function ProblemCard({
  problem,
  problemNumber,
  totalProblems,
  guidedMode,
  presentationMode,
  canvasBackground,
  scratchpadEnabled,
  palmRejection,
  manipulativesEnabled,
  onSubmit,
  onNext,
  onStrokeSession,
}: ProblemCardProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [hintStep, setHintStep] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [diagnostic, setDiagnostic] = useState<ProblemDiagnostic | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const { supported: ttsSupported, speaking, speak, stop } = useSpeechSynthesis()

  useEffect(() => {
    setAnswer('')
    setSubmitted(false)
    setIsCorrect(null)
    setShowHints(false)
    setHintStep(0)
    setHintsUsed(0)
    setDiagnostic(null)
    startTimeRef.current = null
  }, [problem])

  const handleSubmit = () => {
    if (!answer.trim()) return

    const userAnswer = parseFloat(answer)
    if (isNaN(userAnswer)) return

    const correct = checkAnswer(problem, userAnswer)
    setIsCorrect(correct)
    setSubmitted(true)
    if (!correct) {
      setDiagnostic(classifyError(problem, userAnswer))
    }
    onSubmit(userAnswer, hintsUsed)
  }

  const handleNext = () => {
    onNext()
  }

  const handleSkip = () => {
    setSubmitted(true)
    setIsCorrect(false)
    setDiagnostic(classifyError(problem, 0))
    onSubmit(0, hintsUsed)
  }

  const handleShowHint = () => {
    setShowHints(true)
    if (hintStep < 3) {
      setHintStep(hintStep + 1)
      setHintsUsed(hintsUsed + 1)
    }
  }

  const structuredHints = useMemo(
    () => getStructuredHints(problem, hintStep, diagnostic ?? undefined),
    [problem, hintStep, diagnostic]
  )

  const useVerticalLayout =
    presentationMode === 'vertical' && supportsVerticalLayout(problem)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 md:p-8 space-y-4 md:space-y-6 w-full md:max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-sm md:text-base px-3 md:px-4 py-1">
            Problem {problemNumber} of {totalProblems}
          </Badge>
          <div className="flex items-center gap-1">
            {isWordProblem(problem) && ttsSupported && !submitted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={speaking ? stop : () => speak(getWordProblemSpeech(problem))}
                className="gap-1.5"
                aria-label={speaking ? 'Stop reading aloud' : 'Read problem aloud'}
              >
                {speaking ? <Stop size={18} /> : <SpeakerSimpleHigh size={18} weight="duotone" className="text-accent" />}
                {speaking ? 'Stop' : 'Read aloud'}
              </Button>
            )}
            {guidedMode && !submitted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowHint}
              className="gap-2"
              disabled={hintStep >= 3}
              aria-label={hintStep === 0 ? 'Show hint' : 'Next hint'}
            >
              <Lightbulb size={20} weight="duotone" className="text-accent" />
              {hintStep === 0 ? 'Show Hint' : 'Next Hint'}
            </Button>
            )}
          </div>
        </div>

        <div className="text-center space-y-6 md:space-y-8">
          {isWordProblem(problem) ? (
            <div className="max-w-xl mx-auto space-y-3">
              <p className="text-lg md:text-xl font-medium leading-relaxed">
                {problem.wordProblem}
              </p>
            </div>
          ) : useVerticalLayout ? (
            <div className="flex flex-col items-center gap-3">
              <VerticalAlgorithm
                problem={problem}
                submitted={submitted}
                isCorrect={isCorrect}
              />
              <p className="text-sm text-muted-foreground">
                {submitted
                  ? `Answer: ${formatNumber(problem.correctAnswer)}`
                  : 'Enter your answer below'}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 md:gap-6 text-4xl md:text-6xl font-bold tracking-wide">
              <span className={problem.unknownPosition === 'operand1' ? 'text-primary' : ''}>
                {problem.unknownPosition === 'operand1' && !submitted ? '?' : formatNumber(problem.operand1)}
              </span>
              <span className="text-primary">{getOperationSymbol(problem.operation)}</span>
              <span className={problem.unknownPosition === 'operand2' ? 'text-primary' : ''}>
                {problem.unknownPosition === 'operand2' && !submitted ? '?' : formatNumber(problem.operand2)}
              </span>
              <span>=</span>
              <span className={problem.unknownPosition === 'result' || !problem.unknownPosition ? 'text-primary' : ''}>
                {(problem.unknownPosition === 'result' || !problem.unknownPosition) && !submitted ? '?' : formatNumber(problem.correctAnswer)}
              </span>
            </div>
          )}

          {manipulativesEnabled && !submitted && problem.unknownPosition && problem.unknownPosition !== 'result' && !isWordProblem(problem) && (
            <div className="flex justify-center py-2">
              <BalanceScale
                left={problem.unknownPosition === 'operand1' ? null : problem.operand1}
                right={problem.unknownPosition === 'operand2' ? null : problem.operand2}
              />
            </div>
          )}

          {manipulativesEnabled && !submitted && (problem.unknownPosition === 'result' || !problem.unknownPosition) && (
            <div className="flex justify-center py-2">
              <ManipulativeStage problem={problem} />
            </div>
          )}

          <AnimatePresence>
            {showHints && structuredHints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <HintAccordion hints={structuredHints} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="flex gap-4 items-center justify-center">
              <PenInput
                id="answer"
                value={answer}
                palmRejection={palmRejection}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !submitted) {
                    handleSubmit()
                  } else if (e.key === 'Enter' && submitted) {
                    handleNext()
                  }
                }}
                onFocus={() => {
                  if (!startTimeRef.current) {
                    startTimeRef.current = Date.now()
                  }
                }}
                placeholder="Your answer"
                disabled={submitted}
                aria-label={`Answer for problem ${problemNumber}`}
                className={cn(
                  'max-w-xs md:max-w-sm',
                  submitted && isCorrect && 'border-success border-2 bg-success/10',
                  submitted && !isCorrect && 'border-destructive border-2 bg-destructive/10'
                )}
              />
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="h-20 px-6 md:px-8 text-lg"
                  disabled={!answer.trim()}
                  aria-label="Submit answer"
                >
                  <Check size={24} weight="bold" />
                  <span className="ml-2">Check</span>
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="h-20 px-6 md:px-8 text-lg"
                  aria-label="Next problem"
                >
                  <span className="mr-2">Next</span>
                  <ArrowRight size={24} weight="bold" />
                </Button>
              )}
            </div>

            {!submitted && (
              <div className="flex justify-center">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  aria-label="Skip this problem"
                >
                  <SkipForward size={20} />
                  Skip this problem
                </Button>
              </div>
            )}

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'p-4 rounded-lg flex items-center justify-center gap-3 text-lg font-medium',
                    isCorrect ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  )}
                  role="alert"
                  aria-live="assertive"
                >
                  {isCorrect ? (
                    <>
                      <Check size={32} weight="bold" />
                      <span>Correct! Well done!</span>
                    </>
                  ) : (
                    <>
                      <XIcon size={32} weight="bold" />
                      <span>Not quite. The answer is {formatNumber(getExpectedAnswer(problem))}</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {submitted && !isCorrect && diagnostic && diagnostic.category !== 'unknown' && (
          <BugFeedbackBanner
            diagnostic={diagnostic}
            expectedAnswer={getExpectedAnswer(problem)}
          />
        )}

        {scratchpadEnabled && !submitted && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Scratchpad
            </p>
            <Scratchpad
              canvasBackground={canvasBackground}
              palmRejection={palmRejection}
              onStrokeSession={onStrokeSession}
              className="h-48 md:h-56"
            />
          </div>
        )}
      </Card>
    </motion.div>
  )
}
