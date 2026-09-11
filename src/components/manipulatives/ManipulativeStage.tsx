import { Problem } from '@/lib/types'
import { TenFrame } from './TenFrame'
import { NumberLine } from './NumberLine'
import { ArrayGrid } from './ArrayGrid'

/**
 * Phase 5: picks the CPA "concrete → pictorial" manipulative best suited to a
 * problem. Beginner addition/subtraction get a ten-frame; beginner subtraction
 * additionally gets a number-line jump; beginner/intermediate multiplication
 * and division get an array grid. Problems outside these ranges render nothing
 * (the abstract-only path is preserved).
 */
export function ManipulativeStage({ problem }: { problem: Problem }) {
  const { operation, operand1, operand2 } = problem

  if (operation === 'addition') {
    if (operand1 + operand2 <= 20) {
      return <TenFrame value={operand1} highlight={operand2} />
    }
    return null
  }

  if (operation === 'subtraction') {
    const range = Math.max(operand1, operand2)
    if (range <= 20) {
      return (
        <div className="flex flex-col items-center gap-4">
          <TenFrame value={operand1} />
          <NumberLine from={0} to={range} jumpFrom={operand1} jumpSize={-operand2} />
        </div>
      )
    }
    return null
  }

  if (operation === 'multiplication') {
    if (operand1 <= 12 && operand2 <= 12) {
      return <ArrayGrid rows={operand1} cols={operand2} />
    }
    return null
  }

  if (operation === 'division') {
    // operand1 = operand2 * quotient; show quotient groups of the divisor.
    const quotient = problem.correctAnswer
    if (Number.isInteger(quotient) && quotient <= 12 && operand2 <= 12) {
      return <ArrayGrid rows={quotient} cols={operand2} groupSize={operand2} />
    }
    return null
  }

  return null
}
