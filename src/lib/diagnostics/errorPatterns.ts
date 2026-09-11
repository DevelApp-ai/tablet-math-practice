import { Problem, ProblemDiagnostic, ErrorCategory } from '../types'

export interface ErrorExplanation {
  category: ErrorCategory
  title: string
  description: string
}

export const ERROR_EXPLANATIONS: Record<ErrorCategory, ErrorExplanation> = {
  borrow_reversal: {
    category: 'borrow_reversal',
    title: 'Borrow reversal',
    description:
      'The smaller digit was subtracted from the larger one instead of borrowing. Remember: when the top digit is smaller, borrow 1 from the next column.',
  },
  missing_carry: {
    category: 'missing_carry',
    title: 'Missing carry',
    description:
      'A carried digit was dropped. When a column sums to 10 or more, write the extra digit above the next column and add it in.',
  },
  operation_swap: {
    category: 'operation_swap',
    title: 'Operation mix-up',
    description: 'It looks like the wrong operation was used. Double-check the +, −, ×, or ÷ sign.',
  },
  off_by_one: {
    category: 'off_by_one',
    title: 'Off by one',
    description: 'The answer is off by exactly 1 — a small counting slip. Recheck the last step.',
  },
  place_value_shift: {
    category: 'place_value_shift',
    title: 'Place-value shift',
    description:
      'The answer is off by a power of 10. Check that each digit landed in the correct column (ones, tens, hundreds).',
  },
  sign_confusion: {
    category: 'sign_confusion',
    title: 'Sign confusion',
    description: 'The sign of the answer is flipped. Watch for positive vs negative results.',
  },
  unknown: {
    category: 'unknown',
    title: 'Try again',
    description: 'That answer is not correct. Re-read the problem and check each step.',
  },
}

function toDigitArray(value: number): number[] {
  return String(Math.abs(value)).split('').map((d) => parseInt(d, 10)).reverse()
}

function hasBorrowReversal(problem: Problem, provided: number): boolean {
  if (problem.operation !== 'subtraction') return false
  // Borrow reversal only makes sense for non-negative results (actual regrouping).
  if (problem.correctAnswer < 0) return false
  const top = toDigitArray(problem.operand1)
  const bottom = toDigitArray(problem.operand2)
  const providedDigits = toDigitArray(provided)
  const expectedDigits = toDigitArray(problem.correctAnswer)
  for (let i = 0; i < Math.min(top.length, bottom.length); i++) {
    // A borrow was needed in this column...
    if (top[i] < bottom[i]) {
      // ...but the next column was not decremented (the borrow was skipped).
      const providedNext = providedDigits[i + 1] ?? 0
      const expectedNext = expectedDigits[i + 1] ?? 0
      if (providedNext > expectedNext) {
        return true
      }
    }
  }
  return false
}

function hasMissingCarry(problem: Problem, provided: number): boolean {
  if (problem.operation !== 'addition') return false
  const top = toDigitArray(problem.operand1)
  const bottom = toDigitArray(problem.operand2)
  const expected = toDigitArray(problem.correctAnswer)
  const providedDigits = toDigitArray(provided)
  let carry = 0
  for (let i = 0; i < Math.max(top.length, bottom.length, expected.length); i++) {
    const sum = (top[i] || 0) + (bottom[i] || 0) + carry
    const expectedDigit = sum % 10
    const carryOut = Math.floor(sum / 10)
    if (carryOut > 0 && providedDigits[i] === expectedDigit) {
      return true
    }
    carry = carryOut
  }
  return false
}

function hasOperationSwap(problem: Problem, provided: number): boolean {
  const { operand1, operand2, operation } = problem
  const candidates: number[] = []
  if (operation !== 'addition') candidates.push(operand1 + operand2)
  if (operation !== 'subtraction') candidates.push(operand1 - operand2)
  if (operation !== 'multiplication') candidates.push(operand1 * operand2)
  if (operation !== 'division' && operand2 !== 0) {
    candidates.push(Number((operand1 / operand2).toFixed(2)))
  }
  return candidates.some((c) => Math.abs(c - provided) < 0.01)
}

function hasOffByOne(expected: number, provided: number): boolean {
  return Math.abs(expected - provided) === 1
}

function hasPlaceValueShift(expected: number, provided: number): boolean {
  if (expected === 0 || provided === 0) return false
  const ratio = provided / expected
  return [10, 100, 1000, 0.1, 0.01, 0.001].some((r) => Math.abs(ratio - r) < 0.01)
}

function hasSignConfusion(expected: number, provided: number): boolean {
  if (expected === 0 || provided === 0) return false
  return Math.abs(provided - -expected) < 0.01 && expected < 0 !== provided < 0
}

export function classifyError(
  problem: Problem,
  providedAnswer: number
): ProblemDiagnostic {
  const expected = problem.correctAnswer

  if (Math.abs(providedAnswer - expected) < 0.01) {
    return {
      expectedAnswer: expected,
      providedAnswer,
      category: 'unknown',
      remedialHintKey: 'diagnostics.unknown',
    }
  }

  let category: ErrorCategory = 'unknown'

  if (hasOperationSwap(problem, providedAnswer)) {
    category = 'operation_swap'
  } else if (hasSignConfusion(expected, providedAnswer)) {
    category = 'sign_confusion'
  } else if (hasPlaceValueShift(expected, providedAnswer)) {
    category = 'place_value_shift'
  } else if (hasBorrowReversal(problem, providedAnswer)) {
    category = 'borrow_reversal'
  } else if (hasMissingCarry(problem, providedAnswer)) {
    category = 'missing_carry'
  } else if (hasOffByOne(expected, providedAnswer)) {
    category = 'off_by_one'
  }

  return {
    expectedAnswer: expected,
    providedAnswer,
    category,
    remedialHintKey: `diagnostics.${category}`,
  }
}

export function getErrorExplanation(category: ErrorCategory): ErrorExplanation {
  return ERROR_EXPLANATIONS[category] ?? ERROR_EXPLANATIONS.unknown
}
