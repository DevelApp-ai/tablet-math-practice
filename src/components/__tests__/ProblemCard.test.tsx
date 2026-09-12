import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProblemCard } from '@/components/ProblemCard'
import type { Problem } from '@/lib/types'

const baseProps = {
  problemNumber: 1,
  totalProblems: 5,
  guidedMode: true,
  presentationMode: 'horizontal' as const,
  canvasBackground: 'plain' as const,
  scratchpadEnabled: false,
  palmRejection: true,
  manipulativesEnabled: false,
  onNext: () => {},
}

// '? + 3 = 7' is the issue #57 repro: the expected answer is the missing
// operand 4, while correctAnswer (the result) is 7.
const missingOperand1: Problem = {
  id: '1',
  operand1: 4,
  operand2: 3,
  operation: 'addition',
  correctAnswer: 7,
  unknownPosition: 'operand1',
}

describe('ProblemCard missing-addend feedback (#57)', () => {
  it('inline feedback reveals the missing operand, not the result', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProblemCard {...baseProps} problem={missingOperand1} onSubmit={onSubmit} />)

    // Entering the result 7 must be rejected (expected answer is 4).
    await user.type(screen.getByLabelText('Answer for problem 1'), '7')
    await user.click(screen.getByLabelText('Submit answer'))

    expect(screen.getByText(/Not quite/)).toBeInTheDocument()
    expect(screen.getByText(/The answer is 4/i)).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith(7, 0)
  })

  it('diagnostic banner shows the missing operand as the correct answer', async () => {
    // Entering 12 (4*3) triggers an operation_swap diagnostic so the banner
    // renders. Before the fix the banner said "7" (the result); it must now
    // say "4" (the missing operand the learner must enter).
    const user = userEvent.setup()
    render(<ProblemCard {...baseProps} problem={missingOperand1} onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText('Answer for problem 1'), '12')
    await user.click(screen.getByLabelText('Submit answer'))

    expect(screen.getByText(/The correct answer is 4/i)).toBeInTheDocument()
    expect(screen.queryByText(/The correct answer is 7/i)).not.toBeInTheDocument()
  })

  it('accepts the correct missing operand and calls onSubmit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProblemCard {...baseProps} problem={missingOperand1} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Answer for problem 1'), '4')
    await user.click(screen.getByLabelText('Submit answer'))

    expect(screen.getByText('Correct! Well done!')).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith(4, 0)
  })
})
