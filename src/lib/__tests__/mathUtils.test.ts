import { generateProblem, checkAnswer, generateProblems, getOperationSymbol, getHints, formatNumber } from '../mathUtils'
import { DifficultyLevel, OperationType } from '../types'

describe('generateProblem', () => {
  describe('Addition', () => {
    test('beginner addition produces single-digit numbers', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('beginner', 'addition')
        expect(problem.operand1).toBeGreaterThanOrEqual(1)
        expect(problem.operand1).toBeLessThanOrEqual(10)
        expect(problem.operand2).toBeGreaterThanOrEqual(1)
        expect(problem.operand2).toBeLessThanOrEqual(10)
        expect(problem.operation).toBe('addition')
        expect(problem.correctAnswer).toBe(problem.operand1 + problem.operand2)
      }
    })

    test('intermediate addition produces double-digit numbers', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('intermediate', 'addition')
        expect(problem.operand1).toBeGreaterThanOrEqual(10)
        expect(problem.operand1).toBeLessThanOrEqual(99)
        expect(problem.operand2).toBeGreaterThanOrEqual(10)
        expect(problem.operand2).toBeLessThanOrEqual(99)
        expect(problem.correctAnswer).toBe(problem.operand1 + problem.operand2)
      }
    })
  })

  describe('Subtraction', () => {
    test('beginner subtraction never produces negative results', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('beginner', 'subtraction')
        expect(problem.correctAnswer).toBeGreaterThanOrEqual(0)
      }
    })

    test('intermediate subtraction can produce negative results', () => {
      // Intermediate allows negative results
      const problem = generateProblem('intermediate', 'subtraction')
      // Just verify it's a valid subtraction
      expect(problem.correctAnswer).toBe(problem.operand1 - problem.operand2)
    })
  })

  describe('Multiplication', () => {
    test('beginner multiplication uses numbers 1-12', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('beginner', 'multiplication')
        expect(problem.operand1).toBeGreaterThanOrEqual(1)
        expect(problem.operand1).toBeLessThanOrEqual(12)
        expect(problem.operand2).toBeGreaterThanOrEqual(1)
        expect(problem.operand2).toBeLessThanOrEqual(12)
        expect(problem.correctAnswer).toBe(problem.operand1 * problem.operand2)
      }
    })

    test('intermediate multiplication uses numbers 2-20', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('intermediate', 'multiplication')
        expect(problem.operand1).toBeGreaterThanOrEqual(2)
        expect(problem.operand1).toBeLessThanOrEqual(20)
        expect(problem.operand2).toBeGreaterThanOrEqual(2)
        expect(problem.operand2).toBeLessThanOrEqual(20)
      }
    })
  })

  describe('Division', () => {
    test('division never has divisor of zero', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('advanced', 'division')
        expect(problem.operand2).not.toBe(0)
      }
    })

    test('beginner division produces whole numbers', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('beginner', 'division')
        expect(problem.correctAnswer).toBeGreaterThanOrEqual(1)
        expect(problem.correctAnswer).toBeLessThanOrEqual(12)
        expect(Number.isInteger(problem.correctAnswer)).toBe(true)
      }
    })

    test('advanced division can produce decimal results', () => {
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem('advanced', 'division')
        // Check that the result has at most 2 decimal places
        const decimalPlaces = problem.correctAnswer.toString().split('.')[1]?.length || 0
        expect(decimalPlaces).toBeLessThanOrEqual(2)
      }
    })
  })
})

describe('generateProblems', () => {
  test('generates correct number of problems', () => {
    const problems = generateProblems(20, 'beginner', 'addition')
    expect(problems.length).toBe(20)
  })

  test('generates unique problems for mixed mode', () => {
    const problems = generateProblems(50, 'beginner', 'mixed')
    const problemKeys = problems.map(p => `${p.operand1}-${p.operand2}-${p.operation}`)
    const uniqueKeys = new Set(problemKeys)
    expect(uniqueKeys.size).toBe(problems.length)
  })

  test('generates unique problems for single operation', () => {
    const problems = generateProblems(30, 'intermediate', 'addition')
    const problemKeys = problems.map(p => `${p.operand1}-${p.operand2}-${p.operation}`)
    const uniqueKeys = new Set(problemKeys)
    expect(uniqueKeys.size).toBe(problems.length)
  })

  test('includes all operation types in mixed mode', () => {
    const problems = generateProblems(100, 'beginner', 'mixed')
    const operations = new Set(problems.map(p => p.operation))
    expect(operations.has('addition')).toBe(true)
    expect(operations.has('subtraction')).toBe(true)
    expect(operations.has('multiplication')).toBe(true)
    expect(operations.has('division')).toBe(true)
  })
})

describe('checkAnswer', () => {
  test('correctly checks addition answers', () => {
    const problem = { operand1: 5, operand2: 7, operation: 'addition' as const, correctAnswer: 12, id: '1' }
    expect(checkAnswer(problem, 12)).toBe(true)
    expect(checkAnswer(problem, 13)).toBe(false)
  })

  test('correctly checks division answers with decimals', () => {
    const problem = { operand1: 10, operand2: 3, operation: 'division' as const, correctAnswer: 3.33, id: '1' }
    expect(checkAnswer(problem, 3.33)).toBe(true)
    expect(checkAnswer(problem, 3.333)).toBe(true) // Within 0.01 tolerance
    expect(checkAnswer(problem, 3.34)).toBe(true) // Within 0.01 tolerance
    expect(checkAnswer(problem, 3.4)).toBe(false) // Outside 0.01 tolerance
  })

  test('correctly checks division answers with whole numbers', () => {
    const problem = { operand1: 10, operand2: 2, operation: 'division' as const, correctAnswer: 5, id: '1' }
    expect(checkAnswer(problem, 5)).toBe(true)
    expect(checkAnswer(problem, 5.0)).toBe(true)
    expect(checkAnswer(problem, 4)).toBe(false)
  })
})

describe('getOperationSymbol', () => {
  test('returns correct symbols for all operations', () => {
    expect(getOperationSymbol('addition')).toBe('+')
    expect(getOperationSymbol('subtraction')).toBe('\u2212')
    expect(getOperationSymbol('multiplication')).toBe('\u00d7')
    expect(getOperationSymbol('division')).toBe('\u00f7')
  })
})

describe('getHints', () => {
  test('returns correct number of hints based on step', () => {
    const problem = { operand1: 15, operand2: 7, operation: 'addition' as const, correctAnswer: 22, id: '1' }
    const hints1 = getHints(problem, 1)
    const hints2 = getHints(problem, 2)
    const hints3 = getHints(problem, 3)
    
    expect(hints1.length).toBe(1)
    expect(hints2.length).toBe(2)
    expect(hints3.length).toBe(3)
  })

  test('hints contain relevant information', () => {
    const problem = { operand1: 15, operand2: 7, operation: 'addition' as const, correctAnswer: 22, id: '1' }
    const hints = getHints(problem, 1)
    expect(hints[0]).toContain('5')
    expect(hints[0]).toContain('7')
  })
})

describe('formatNumber', () => {
  test('formats numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  test('does not format small numbers', () => {
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(50)).toBe('50')
  })
})
