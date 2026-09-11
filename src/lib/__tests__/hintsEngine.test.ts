import { getStructuredHints } from '../diagnostics/hintsEngine'
import { Problem, ProblemDiagnostic } from '../types'

function makeProblem(
  operand1: number,
  operand2: number,
  operation: Problem['operation'],
  correctAnswer: number
): Problem {
  return { id: 'test', operand1, operand2, operation, correctAnswer }
}

describe('getStructuredHints', () => {
  test('returns one tier-1 nudge at step 1', () => {
    const hints = getStructuredHints(makeProblem(15, 7, 'addition', 22), 1)
    expect(hints).toHaveLength(1)
    expect(hints[0].tier).toBe(1)
    expect(hints[0].type).toBe('nudge')
  })

  test('returns a tier-2 pictorial hint at step 2', () => {
    const hints = getStructuredHints(makeProblem(15, 7, 'addition', 22), 2)
    expect(hints).toHaveLength(2)
    expect(hints[1].tier).toBe(2)
    expect(hints[1].type).toBe('pictorial')
  })

  test('returns a tier-3 walkthrough at step 3', () => {
    const hints = getStructuredHints(makeProblem(15, 7, 'addition', 22), 3)
    expect(hints).toHaveLength(3)
    expect(hints[2].tier).toBe(3)
    expect(hints[2].type).toBe('walkthrough')
    expect(hints[2].content).toContain('Answer: 22')
  })

  test('walkthrough mentions the carry for an addition that needs regrouping', () => {
    const hints = getStructuredHints(makeProblem(18, 7, 'addition', 25), 3)
    const walkthrough = hints[2]
    expect(walkthrough.content).toContain('carry')
  })

  test('walkthrough mentions borrowing for a subtraction that needs it', () => {
    const hints = getStructuredHints(makeProblem(42, 7, 'subtraction', 35), 3)
    const walkthrough = hints[2]
    expect(walkthrough.content).toContain('borrow')
  })

  test('the tier-1 nudge is sharpened by a borrow_reversal diagnostic', () => {
    const diagnostic: ProblemDiagnostic = {
      expectedAnswer: 35,
      providedAnswer: 45,
      category: 'borrow_reversal',
      remedialHintKey: 'diagnostics.borrow_reversal',
    }
    const hints = getStructuredHints(makeProblem(42, 7, 'subtraction', 35), 1, diagnostic)
    expect(hints[0].content).toContain('borrow 1')
  })

  test('the tier-2 pictorial hint references the diagnostic for missing_carry', () => {
    const diagnostic: ProblemDiagnostic = {
      expectedAnswer: 25,
      providedAnswer: 15,
      category: 'missing_carry',
      remedialHintKey: 'diagnostics.missing_carry',
    }
    const hints = getStructuredHints(makeProblem(18, 7, 'addition', 25), 2, diagnostic)
    expect(hints[1].content).toContain('tens column')
  })
})
