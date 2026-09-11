import { ProblemDiagnostic } from '@/lib/types'
import { getErrorExplanation } from '@/lib/diagnostics/errorPatterns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Warning } from '@phosphor-icons/react'

interface BugFeedbackBannerProps {
  diagnostic: ProblemDiagnostic
  expectedAnswer: number
}

export function BugFeedbackBanner({
  diagnostic,
  expectedAnswer,
}: BugFeedbackBannerProps) {
  const explanation = getErrorExplanation(diagnostic.category)

  return (
    <Alert variant="destructive" role="alert">
      <Warning size={20} weight="duotone" />
      <AlertTitle className="font-semibold">
        {explanation.title}
      </AlertTitle>
      <AlertDescription className="space-y-1">
        <p>{explanation.description}</p>
        <p className="text-muted-foreground">
          The correct answer is {expectedAnswer}.
        </p>
      </AlertDescription>
    </Alert>
  )
}
