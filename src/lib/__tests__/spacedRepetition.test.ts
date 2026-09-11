import {
  recordMistake,
  reviewMistake,
  removeMistake,
  getDueMistakes,
  getDueCount,
  getVaultSize,
  mistakeToProblem,
  buildRemediationProblems,
  GRADUATION_CONSECUTIVE_CORRECT,
} from '../repetition/spacedRepetition'
import { Problem, StoredMistake } from '../types'

function makeProblem(
  operand1: number,
  operand2: number,
  operation: Problem['operation'],
  correctAnswer: number,
  id = 'test'
): Problem {
  return { id, operand1, operand2, operation, correctAnswer }
}

function makeMistake(overrides: Partial<StoredMistake> = {}): StoredMistake {
  return {
    id: 'm1',
    problemId: 'test',
    num1: 5,
    num2: 3,
    operation: 'addition',
    incorrectAnswers: [7],
    repetitionLevel: 0,
    consecutiveCorrect: 0,
    nextReviewTimestamp: 0,
    lastReviewedAt: null,
    addedAt: 1000,
    ...overrides,
  }
}

describe('recordMistake', () => {
  test('adds a new mistake to an empty vault', () => {
    const vault = recordMistake([], makeProblem(5, 3, 'addition', 8), 7)
    expect(vault).toHaveLength(1)
    expect(vault[0].num1).toBe(5)
    expect(vault[0].incorrectAnswers).toEqual([7])
    expect(vault[0].repetitionLevel).toBe(0)
    expect(vault[0].nextReviewTimestamp).toBe(0)
  })

  test('dedupes by operand/operation and appends the new wrong answer', () => {
    const existing = makeMistake({ incorrectAnswers: [7], repetitionLevel: 2, nextReviewTimestamp: 9999 })
    const vault = recordMistake([existing], makeProblem(5, 3, 'addition', 8), 9)
    expect(vault).toHaveLength(1)
    expect(vault[0].incorrectAnswers).toEqual([7, 9])
    expect(vault[0].repetitionLevel).toBe(0)
    expect(vault[0].nextReviewTimestamp).toBe(0)
  })

  test('does not duplicate an already-recorded wrong answer', () => {
    const existing = makeMistake({ incorrectAnswers: [7] })
    const vault = recordMistake([existing], makeProblem(5, 3, 'addition', 8), 7)
    expect(vault[0].incorrectAnswers).toEqual([7])
  })

  test('keeps separate entries for distinct problems', () => {
    const first = recordMistake([], makeProblem(5, 3, 'addition', 8), 7)
    const second = recordMistake(first, makeProblem(4, 2, 'addition', 6), 5)
    expect(second).toHaveLength(2)
  })
})

describe('reviewMistake', () => {
  test('increments consecutiveCorrect on a correct answer', () => {
    const vault = reviewMistake([makeMistake()], 'm1', true)
    expect(vault[0].consecutiveCorrect).toBe(1)
    expect(vault[0].repetitionLevel).toBe(1)
  })

  test('resets to box 0 on an incorrect answer', () => {
    const vault = reviewMistake([makeMistake({ repetitionLevel: 2, consecutiveCorrect: 2 })], 'm1', false)
    expect(vault[0].consecutiveCorrect).toBe(0)
    expect(vault[0].repetitionLevel).toBe(0)
    expect(vault[0].nextReviewTimestamp).toBe(0)
  })

  test('graduates (removes) a mistake after 3 consecutive correct answers', () => {
    let vault: StoredMistake[] = [makeMistake()]
    for (let i = 0; i < GRADUATION_CONSECUTIVE_CORRECT; i++) {
      vault = reviewMistake(vault, 'm1', true)
    }
    expect(vault).toHaveLength(0)
  })

  test('leaves unrelated mistakes untouched', () => {
    const other = makeMistake({ id: 'm2', consecutiveCorrect: 1 })
    const vault = reviewMistake([makeMistake(), other], 'm1', true)
    const otherResult = vault.find((m) => m.id === 'm2')
    expect(otherResult?.consecutiveCorrect).toBe(1)
  })
})

describe('getDueMistakes / getDueCount', () => {
  test('level-0 mistakes are always due', () => {
    const vault = [makeMistake({ repetitionLevel: 0, nextReviewTimestamp: 0 })]
    expect(getDueMistakes(vault)).toHaveLength(1)
    expect(getDueCount(vault)).toBe(1)
  })

  test('mistakes scheduled for the future are not due yet', () => {
    const future = Date.now() + 1000 * 60 * 60
    const vault = [makeMistake({ nextReviewTimestamp: future })]
    expect(getDueMistakes(vault)).toHaveLength(0)
  })

  test('respects an explicit timestamp', () => {
    const vault = [makeMistake({ nextReviewTimestamp: 5000 })]
    expect(getDueMistakes(vault, 4000)).toHaveLength(0)
    expect(getDueMistakes(vault, 5000)).toHaveLength(1)
  })
})

describe('removeMistake', () => {
  test('filters the matching id out of the vault', () => {
    const vault = [makeMistake({ id: 'm1' }), makeMistake({ id: 'm2' })]
    const result = removeMistake(vault, 'm1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('m2')
  })
})

describe('mistakeToProblem', () => {
  test('computes the correct answer for each operation', () => {
    expect(mistakeToProblem(makeMistake({ operation: 'addition', num1: 5, num2: 3 })).correctAnswer).toBe(8)
    expect(mistakeToProblem(makeMistake({ operation: 'subtraction', num1: 10, num2: 4 })).correctAnswer).toBe(6)
    expect(mistakeToProblem(makeMistake({ operation: 'multiplication', num1: 6, num2: 7 })).correctAnswer).toBe(42)
    expect(mistakeToProblem(makeMistake({ operation: 'division', num1: 20, num2: 5 })).correctAnswer).toBe(4)
  })
})

describe('buildRemediationProblems', () => {
  test('returns due mistakes converted to problems', () => {
    const vault = [makeMistake({ id: 'm1' }), makeMistake({ id: 'm2', num1: 4, num2: 2 })]
    const problems = buildRemediationProblems(vault, 10)
    expect(problems).toHaveLength(2)
    expect(problems[0].operand1).toBe(5)
  })

  test('pads with fallback problems when the vault is short', () => {
    const vault = [makeMistake()]
    const fallback = (n: number) =>
      Array.from({ length: n }, (_, i) => makeProblem(1, 1, 'addition', 2, `f${i}`))
    const problems = buildRemediationProblems(vault, 3, fallback)
    expect(problems).toHaveLength(3)
    expect(problems[1].id).toBe('f0')
  })
})

describe('getVaultSize', () => {
  test('counts non-graduated mistakes', () => {
    expect(getVaultSize([])).toBe(0)
    expect(getVaultSize([makeMistake()])).toBe(1)
  })
})
