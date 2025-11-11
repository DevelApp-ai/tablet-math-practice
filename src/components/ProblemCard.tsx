import { useState, useEffect } from 'react'
import { Problem } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getOperationSymbol, checkAnswer, getHints } from '@/lib/mathUtils'
import { Lightbulb, Check, X as XIcon, ArrowRight } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProblemCardProps {
  problem: Problem
  problemNumber: number
  totalProblems: number
  guidedMode: boolean
  onSubmit: (answer: number, hintsUsed: number) => void
  onNext: () => void
}

export function ProblemCard({
  problem,
  problemNumber,
  totalProblems,
  guidedMode,
  onSubmit,
  onNext
}: ProblemCardProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [hintStep, setHintStep] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)

  useEffect(() => {
    setAnswer('')
    setSubmitted(false)
    setIsCorrect(null)
    setShowHints(false)
    setHintStep(0)
    setHintsUsed(0)
  }, [problem])

  const handleSubmit = () => {
    if (!answer.trim()) return

    const userAnswer = parseFloat(answer)
    if (isNaN(userAnswer)) return

    const correct = checkAnswer(problem, userAnswer)
    setIsCorrect(correct)
    setSubmitted(true)
    onSubmit(userAnswer, hintsUsed)
  }

  const handleNext = () => {
    onNext()
  }

  const handleShowHint = () => {
    setShowHints(true)
    if (hintStep < 3) {
      setHintStep(hintStep + 1)
      setHintsUsed(hintsUsed + 1)
    }
  }

  const hints = getHints(problem, hintStep)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 space-y-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-base px-4 py-1">
            Problem {problemNumber} of {totalProblems}
          </Badge>
          {guidedMode && !submitted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowHint}
              className="gap-2"
              disabled={hintStep >= 3}
            >
              <Lightbulb size={20} weight="duotone" className="text-accent" />
              {hintStep === 0 ? 'Show Hint' : 'Next Hint'}
            </Button>
          )}
        </div>

        <div className="text-center space-y-8">
          <div className="flex items-center justify-center gap-6 text-5xl md:text-6xl font-bold tracking-wide">
            <span>{problem.operand1}</span>
            <span className="text-primary">{getOperationSymbol(problem.operation)}</span>
            <span>{problem.operand2}</span>
            <span>=</span>
            <span className="text-muted-foreground">?</span>
          </div>

          <AnimatePresence>
            {showHints && hints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-secondary/30 rounded-lg p-4 space-y-2"
              >
                {hints.map((hint, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-sm text-left"
                  >
                    💡 {hint}
                  </motion.p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="flex gap-4 items-center justify-center">
              <Input
                id="answer"
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !submitted) {
                    handleSubmit()
                  } else if (e.key === 'Enter' && submitted) {
                    handleNext()
                  }
                }}
                placeholder="Your answer"
                disabled={submitted}
                className={cn(
                  'text-center text-3xl h-20 max-w-xs font-medium',
                  submitted && isCorrect && 'border-success border-2 bg-success/10',
                  submitted && !isCorrect && 'border-destructive border-2 bg-destructive/10'
                )}
              />
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="h-20 px-8 text-lg"
                  disabled={!answer.trim()}
                >
                  <Check size={24} weight="bold" />
                  Check
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="h-20 px-8 text-lg"
                >
                  Next
                  <ArrowRight size={24} weight="bold" />
                </Button>
              )}
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'p-4 rounded-lg flex items-center justify-center gap-3 text-lg font-medium',
                    isCorrect ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  )}
                >
                  {isCorrect ? (
                    <>
                      <Check size={32} weight="bold" />
                      <span>Correct! Well done!</span>
                    </>
                  ) : (
                    <>
                      <XIcon size={32} weight="bold" />
                      <span>Not quite. The answer is {problem.correctAnswer}</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
