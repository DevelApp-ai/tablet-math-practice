import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatsDashboard } from '@/components/StatsDashboard'
import type { SessionStats, PracticeSession } from '@/lib/types'

const baseStats: SessionStats = {
  totalProblems: 10, correctAnswers: 8, incorrectAnswers: 2, accuracy: 80,
  totalTime: 120, averageTime: 12, currentStreak: 3, longestStreak: 5,
}

function makeSession(accuracy: number): PracticeSession {
  return {
    id: 's', difficulty: 'beginner', operationType: 'addition',
    problems: [], currentProblemIndex: 0, stats: { ...baseStats, accuracy },
    startTime: 0, guidedMode: true,
  }
}

describe('StatsDashboard', () => {
  it('renders without crashing when history has multiple sessions (#62)', () => {
    const { container, getByText } = render(
      <StatsDashboard stats={baseStats} history={[makeSession(70), makeSession(80), makeSession(90)]} />
    )
    expect(container).toBeTruthy()
    // BarChart section renders when history.length > 0
    expect(getByText('Overall Performance')).toBeInTheDocument()
    // TrendingUp section renders when history.length > 1
    expect(getByText('Accuracy Over Time')).toBeInTheDocument()
  })
})
