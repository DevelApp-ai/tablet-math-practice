import {
  solveVertical,
  supportsVerticalLayout,
  getColumnDigits,
  columnStepFor,
  COLUMNS,
} from '../verticalMath'
import { Problem } from '../types'

function makeProblem(
  operand1: number,
  operand2: number,
  operation: Problem['operation'],
  correctAnswer: number
): Problem {
  return { id: 'test', operand1, operand2, operation, correctAnswer }
}

describe('supportsVerticalLayout', () => {
  test('addition, subtraction, and multiplication are supported', () => {
    expect(supportsVerticalLayout(makeProblem(12, 5, 'addition', 17))).toBe(true)
    expect(supportsVerticalLayout(makeProblem(12, 5, 'subtraction', 7))).toBe(true)
    expect(supportsVerticalLayout(makeProblem(12, 5, 'multiplication', 60))).toBe(true)
  })

  test('division is not supported', () => {
    expect(supportsVerticalLayout(makeProblem(12, 3, 'division', 4))).toBe(false)
  })
})

describe('solveVertical - addition', () => {
  test('addition without carry', () => {
    const solution = solveVertical(makeProblem(12, 15, 'addition', 27))!
    expect(solution).not.toBeNull()
    const ones = columnStepFor(makeProblem(12, 15, 'addition', 27), 'ones')!
    const tens = columnStepFor(makeProblem(12, 15, 'addition', 27), 'tens')!
    expect(ones.resultDigit).toBe(7)
    expect(ones.carryOut).toBe(0)
    expect(tens.resultDigit).toBe(2)
    expect(tens.carryOut).toBe(0)
    expect(solution.answer).toBe(27)
  })

  test('addition with carry from ones to tens', () => {
    const solution = solveVertical(makeProblem(18, 7, 'addition', 25))!
    const ones = solution.steps.find((s) => s.column === 'ones')!
    const tens = solution.steps.find((s) => s.column === 'tens')!
    expect(ones.top).toBe(8)
    expect(ones.bottom).toBe(7)
    expect(ones.resultDigit).toBe(5)
    expect(ones.carryOut).toBe(1)
    expect(solution.carryRow.tens).toBe(1)
    expect(tens.carryIn).toBe(1)
    expect(tens.resultDigit).toBe(2)
  })

  test('addition producing a new highest column', () => {
    const solution = solveVertical(makeProblem(95, 8, 'addition', 103))!
    const ones = solution.steps.find((s) => s.column === 'ones')!
    const tens = solution.steps.find((s) => s.column === 'tens')!
    const hundreds = solution.steps.find((s) => s.column === 'hundreds')!
    expect(ones.resultDigit).toBe(3)
    expect(ones.carryOut).toBe(1)
    expect(tens.carryIn).toBe(1)
    expect(tens.resultDigit).toBe(0)
    expect(tens.carryOut).toBe(1)
    expect(hundreds).toBeDefined()
    expect(hundreds!.resultDigit).toBe(1)
  })
})

describe('solveVertical - subtraction', () => {
  test('subtraction without borrow', () => {
    const solution = solveVertical(makeProblem(58, 23, 'subtraction', 35))!
    const ones = solution.steps.find((s) => s.column === 'ones')!
    const tens = solution.steps.find((s) => s.column === 'tens')!
    expect(ones.resultDigit).toBe(5)
    expect(ones.borrowFrom).toBe(0)
    expect(tens.resultDigit).toBe(3)
    expect(tens.borrowFrom).toBe(0)
  })

  test('subtraction with borrow from tens to ones', () => {
    const solution = solveVertical(makeProblem(42, 7, 'subtraction', 35))!
    const ones = solution.steps.find((s) => s.column === 'ones')!
    const tens = solution.steps.find((s) => s.column === 'tens')!
    expect(ones.top).toBe(2)
    expect(ones.bottom).toBe(7)
    expect(ones.borrowFrom).toBe(1)
    expect(ones.resultDigit).toBe(5)
    expect(solution.borrowRow.tens).toBe(1)
    expect(tens.carryIn).toBe(1)
    expect(tens.resultDigit).toBe(3)
  })

  test('answer equals correctAnswer for both operations', () => {
    expect(solveVertical(makeProblem(123, 89, 'addition', 212))!.answer).toBe(212)
    expect(solveVertical(makeProblem(123, 89, 'subtraction', 34))!.answer).toBe(34)
  })
})

describe('getColumnDigits', () => {
  test('returns per-column digits padded to the needed width', () => {
    const digits = getColumnDigits(makeProblem(5, 13, 'addition', 18))
    const ones = digits.find((d) => d.column === 'ones')!
    const tens = digits.find((d) => d.column === 'tens')!
    expect(ones.operand1Digit).toBe(5)
    expect(ones.operand2Digit).toBe(3)
    expect(tens.operand1Digit).toBe(0)
    expect(tens.operand2Digit).toBe(1)
  })
})

describe('COLUMNS ordering', () => {
  test('columns are ordered least to most significant', () => {
    expect(COLUMNS).toEqual(['ones', 'tens', 'hundreds', 'thousands'])
  })
})
