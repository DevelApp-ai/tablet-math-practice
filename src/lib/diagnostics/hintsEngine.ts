import { Problem, ProblemDiagnostic, ErrorCategory } from '../types'
import { getHints } from '../mathUtils'

export type HintTier = 1 | 2 | 3
export type HintType = 'nudge' | 'pictorial' | 'walkthrough'

export interface StructuredHint {
  tier: HintTier
  type: HintType
  content: string
  /** Which column the hint highlights (for vertical layouts). */
  focusColumn?: 'ones' | 'tens' | 'hundreds' | 'thousands'
}

const REGROUPING_HINTS: Record<string, string> = {
  addition: 'Check the ones column: does it sum to 10 or more? If so, carry the extra to the next column.',
  subtraction:
    'Check the ones column: is the top digit smaller than the bottom? If so, borrow 1 from the tens.',
  multiplication:
    'Break the problem into smaller parts you already know, then add the partial products.',
  division:
    'Ask: how many groups of the divisor fit into the dividend?',
}

function tier3Walkthrough(problem: Problem): string {
  const { operand1, operand2, operation, correctAnswer } = problem
  switch (operation) {
    case 'addition': {
      const ones1 = operand1 % 10
      const ones2 = operand2 % 10
      const onesSum = ones1 + ones2
      const carry = Math.floor(onesSum / 10)
      const onesDigit = onesSum % 10
      const tens1 = Math.floor(operand1 / 10)
      const tens2 = Math.floor(operand2 / 10)
      const tensSum = tens1 + tens2 + carry
      return carry > 0
        ? `Step 1: ${ones1} + ${ones2} = ${onesSum}, write ${onesDigit} and carry ${carry}. Step 2: ${tens1} + ${tens2} + ${carry} = ${tensSum}. Answer: ${correctAnswer}.`
        : `Step 1: ${ones1} + ${ones2} = ${onesSum}. Step 2: ${tens1} + ${tens2} = ${tensSum}. Answer: ${correctAnswer}.`
    }
    case 'subtraction': {
      const ones1 = operand1 % 10
      const ones2 = operand2 % 10
      const needBorrow = ones1 < ones2
      if (needBorrow) {
        const borrowed = ones1 + 10 - ones2
        const tens1 = Math.floor(operand1 / 10)
        const tens2 = Math.floor(operand2 / 10)
        return `Step 1: ${ones1} < ${ones2}, so borrow 1 from the tens: (${ones1} + 10) − ${ones2} = ${borrowed}. Step 2: ${(tens1 - 1)} − ${tens2} = ${tens1 - 1 - tens2}. Answer: ${correctAnswer}.`
      }
      return `Step 1: ${ones1} − ${ones2} = ${ones1 - ones2}. Now subtract the tens. Answer: ${correctAnswer}.`
    }
    case 'multiplication': {
      const part = Math.floor(operand2 / 2)
      return `Step 1: ${operand1} × ${part} = ${operand1 * part}. Step 2: add the remaining ${operand2 - part} × ${operand1}. Answer: ${correctAnswer}.`
    }
    case 'division': {
      return `Step 1: how many times does ${operand2} fit into ${operand1}? ${operand1} ÷ ${operand2} = ${correctAnswer}.`
    }
  }
}

export function getStructuredHints(
  problem: Problem,
  step: number,
  diagnostic?: ProblemDiagnostic
): StructuredHint[] {
  const textHints = getHints(problem, 3)
  const hints: StructuredHint[] = []

  // Tier 1 — nudge (reuses the first text hint, optionally sharpened by the diagnostic).
  if (step >= 1 && textHints.length > 0) {
    const nudge =
      diagnostic && diagnostic.category !== 'unknown'
        ? REGROUPING_HINTS[problem.operation] ?? textHints[0]
        : textHints[0]
    hints.push({ tier: 1, type: 'nudge', content: nudge })
  }

  // Tier 2 — pictorial aid (a pointer to render a manipulative; text until Phase 5 lands the visuals).
  if (step >= 2) {
    hints.push({
      tier: 2,
      type: 'pictorial',
      content: pictorialContent(problem, diagnostic),
    })
  }

  // Tier 3 — step-by-step walkthrough.
  if (step >= 3) {
    hints.push({ tier: 3, type: 'walkthrough', content: tier3Walkthrough(problem) })
  }

  return hints.slice(0, step)
}

function pictorialContent(problem: Problem, diagnostic?: ProblemDiagnostic): string {
  const base: Record<string, string> = {
    addition: 'Picture the ones as blocks: group ten of them into a new ten, then count what remains.',
    subtraction:
      'Picture the top number as blocks: to subtract, you may need to break one ten into ten ones first.',
    multiplication:
      'Picture rows and columns: an array of the two factors shows the total as a grid of blocks.',
    division:
      'Picture the dividend as a set of blocks and split it into equal groups of the divisor.',
  }
  if (diagnostic && diagnostic.category === 'borrow_reversal') {
    return 'Picture the top number as blocks. When the top digit is smaller, trade one ten for ten ones before subtracting.'
  }
  if (diagnostic && diagnostic.category === 'missing_carry') {
    return 'Picture the ones column as blocks. When it overflows past ten, move a block to the tens column.'
  }
  return base[problem.operation]
}

export function getDiagnosticHintKey(category: ErrorCategory): string {
  return `diagnostics.${category}`
}
