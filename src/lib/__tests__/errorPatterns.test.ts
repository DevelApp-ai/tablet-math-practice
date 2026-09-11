import { classifyError, getErrorExplanation, ERROR_EXPLANATIONS } from '../diagnostics/errorPatterns'
import { Problem, ErrorCategory } from '../types'

function makeProblem(
  operand1: number,
  operand2: number,
  operation: Problem['operation'],
  correctAnswer: number
): Problem {
  return { id: 'test', operand1, operand2, operation, correctAnswer }
}

describe('classifyError', () => {
  describe('correct answers', () => {
    test('returns unknown category when the answer is correct', () => {
      const d = classifyError(makeProblem(5, 3, 'addition', 8), 8)
      expect(d.category).toBe('unknown')
      expect(d.providedAnswer).toBe(8)
      expect(d.expectedAnswer).toBe(8)
    })
  })

  describe('borrow reversal (subtraction)', () => {
    test('detects reversing a borrow in the ones column', () => {
      // 42 - 7 = 35; a borrow reversal does 7 - 2 = 5 and keeps the tens -> 45
      const d = classifyError(makeProblem(42, 7, 'subtraction', 35), 45)
      expect(d.category).toBe('borrow_reversal')
    })

    test('does not flag a correct subtraction as a reversal', () => {
      const d = classifyError(makeProblem(42, 7, 'subtraction', 35), 35)
      expect(d.category).toBe('unknown')
    })
  })

  describe('missing carry (addition)', () => {
    test('detects dropping a carried digit', () => {
      // 18 + 7 = 25; forgetting the carry gives 15 (ones correct, tens dropped)
      const d = classifyError(makeProblem(18, 7, 'addition', 25), 15)
      expect(d.category).toBe('missing_carry')
    })
  })

  describe('operation swap', () => {
    test('detects adding instead of subtracting', () => {
      // 10 - 4 = 6; student added -> 14
      const d = classifyError(makeProblem(10, 4, 'subtraction', 6), 14)
      expect(d.category).toBe('operation_swap')
    })

    test('detects multiplying instead of adding', () => {
      const d = classifyError(makeProblem(3, 4, 'addition', 7), 12)
      expect(d.category).toBe('operation_swap')
    })
  })

  describe('off by one', () => {
    test('detects an answer off by exactly 1', () => {
      const d = classifyError(makeProblem(20, 30, 'addition', 50), 49)
      expect(d.category).toBe('off_by_one')
    })

    test('does not flag a larger error as off-by-one', () => {
      const d = classifyError(makeProblem(20, 30, 'addition', 50), 45)
      expect(d.category).not.toBe('off_by_one')
    })
  })

  describe('place value shift', () => {
    test('detects an answer off by a power of 10', () => {
      const d = classifyError(makeProblem(5, 5, 'addition', 10), 100)
      expect(d.category).toBe('place_value_shift')
    })
  })

  describe('sign confusion', () => {
    test('detects a flipped sign', () => {
      const d = classifyError(makeProblem(5, 8, 'subtraction', -3), 3)
      expect(d.category).toBe('sign_confusion')
    })
  })

  describe('remedial hint key', () => {
    test('the hint key mirrors the category', () => {
      const d = classifyError(makeProblem(18, 7, 'addition', 25), 15)
      expect(d.remedialHintKey).toBe('diagnostics.missing_carry')
    })
  })
})

describe('getErrorExplanation', () => {
  test('returns an explanation for each category', () => {
    const categories: ErrorCategory[] = [
      'borrow_reversal',
      'missing_carry',
      'operation_swap',
      'off_by_one',
      'place_value_shift',
      'sign_confusion',
      'unknown',
    ]
    categories.forEach((c) => {
      const exp = getErrorExplanation(c)
      expect(exp.category).toBe(c)
      expect(exp.title).toBeTruthy()
      expect(exp.description).toBeTruthy()
    })
  })

  test('falls back to unknown for an unknown category', () => {
    const exp = getErrorExplanation('unknown')
    expect(exp).toBe(ERROR_EXPLANATIONS.unknown)
  })
})
