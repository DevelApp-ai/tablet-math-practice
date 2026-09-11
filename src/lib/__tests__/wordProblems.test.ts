import {
  generateWordProblem,
  isWordProblem,
  getWordProblemSpeech,
  wordProblemExpectedAnswer,
} from '../wordProblems'
import { getExpectedAnswer, withUnknownPosition, checkAnswer } from '../mathUtils'
import { Problem } from '../types'

function makeProblem(
  operand1: number,
  operand2: number,
  operation: Problem['operation'],
  correctAnswer: number,
  unknownPosition: Problem['unknownPosition'] = 'result'
): Problem {
  return { id: 'test', operand1, operand2, operation, correctAnswer, unknownPosition }
}

describe('generateWordProblem', () => {
  test('produces a problem with a non-empty wordProblem stem', () => {
    const problem = generateWordProblem('beginner', 'addition')
    expect(problem.wordProblem).toBeTruthy()
    expect(problem.wordProblem!.length).toBeGreaterThan(10)
  })

  test('arithmetic stays consistent with the generated operands', () => {
    const problem = generateWordProblem('beginner', 'multiplication')
    expect(problem.correctAnswer).toBe(problem.operand1 * problem.operand2)
  })

  test('isWordProblem is true for generated word problems', () => {
    expect(isWordProblem(generateWordProblem('intermediate', 'subtraction'))).toBe(true)
  })

  test('uses the requested unknownPosition when provided', () => {
    const problem = generateWordProblem('beginner', 'addition', {
      unknownPosition: 'operand2',
    })
    expect(problem.unknownPosition).toBe('operand2')
  })

  test('rewrites the stem for missing-operand problems', () => {
    const problem = generateWordProblem('beginner', 'addition', {
      unknownPosition: 'operand1',
    })
    expect(problem.unknownPosition).toBe('operand1')
    expect(problem.wordProblem).toContain('How many')
  })
})

describe('getWordProblemSpeech', () => {
  test('returns the stem text', () => {
    const problem = generateWordProblem('beginner', 'addition', {
      unknownPosition: 'result',
    })
    expect(getWordProblemSpeech(problem)).toBe(problem.wordProblem)
  })

  test('returns empty string when there is no stem', () => {
    expect(getWordProblemSpeech(makeProblem(2, 3, 'addition', 5))).toBe('')
  })
})

describe('wordProblemExpectedAnswer', () => {
  test('returns the result for the default position', () => {
    const problem = generateWordProblem('beginner', 'addition', {
      unknownPosition: 'result',
    })
    expect(wordProblemExpectedAnswer(problem)).toBe(problem.correctAnswer)
  })

  test('returns operand1 when it is the unknown', () => {
    const problem = generateWordProblem('beginner', 'addition', {
      unknownPosition: 'operand1',
    })
    expect(wordProblemExpectedAnswer(problem)).toBe(problem.operand1)
  })

  test('returns operand2 when it is the unknown', () => {
    const problem = generateWordProblem('beginner', 'subtraction', {
      unknownPosition: 'operand2',
    })
    expect(wordProblemExpectedAnswer(problem)).toBe(problem.operand2)
  })
})

describe('getExpectedAnswer (mathUtils)', () => {
  test('defaults to the result when unknownPosition is absent', () => {
    expect(getExpectedAnswer(makeProblem(4, 3, 'addition', 7, undefined))).toBe(7)
  })

  test('returns the corresponding operand for each missing slot', () => {
    expect(getExpectedAnswer(makeProblem(4, 3, 'addition', 7, 'operand1'))).toBe(4)
    expect(getExpectedAnswer(makeProblem(4, 3, 'addition', 7, 'operand2'))).toBe(3)
  })
})

describe('withUnknownPosition', () => {
  test('always sets a valid unknownPosition', () => {
    for (let i = 0; i < 50; i++) {
      const problem = withUnknownPosition(
        makeProblem(4, 3, 'addition', 7, undefined),
        'intermediate'
      )
      expect(['result', 'operand1', 'operand2']).toContain(problem.unknownPosition)
    }
  })

  test('beginner favors the result position more often', () => {
    let resultCount = 0
    for (let i = 0; i < 100; i++) {
      const problem = withUnknownPosition(
        makeProblem(4, 3, 'addition', 7, undefined),
        'beginner'
      )
      if (problem.unknownPosition === 'result') resultCount++
    }
    expect(resultCount).toBeGreaterThan(40)
  })
})

describe('checkAnswer with unknown positions', () => {
  test('accepts the missing operand value', () => {
    const problem = makeProblem(4, 3, 'addition', 7, 'operand2')
    expect(checkAnswer(problem, 3)).toBe(true)
    expect(checkAnswer(problem, 5)).toBe(false)
  })

  test('still accepts the result for the default position', () => {
    const problem = makeProblem(4, 3, 'addition', 7)
    expect(checkAnswer(problem, 7)).toBe(true)
  })
})
