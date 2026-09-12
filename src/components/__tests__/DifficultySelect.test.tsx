import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DifficultySelect } from '@/components/DifficultySelect'

describe('DifficultySelect', () => {
  it('renders all three difficulty levels', () => {
    render(<DifficultySelect onSelect={vi.fn()} />)
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
    expect(screen.getByText('Choose Your Level')).toBeInTheDocument()
  })

  it('calls onSelect with the chosen difficulty level', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DifficultySelect onSelect={onSelect} />)

    await user.click(screen.getByText('Intermediate'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('intermediate', 10)
  })

  it('calls onSelect for each level when tapped', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DifficultySelect onSelect={onSelect} />)

    for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
      await user.click(screen.getByText(level))
    }

    expect(onSelect).toHaveBeenCalledTimes(3)
    expect(onSelect).toHaveBeenNthCalledWith(1, 'beginner', 10)
    expect(onSelect).toHaveBeenNthCalledWith(2, 'intermediate', 10)
    expect(onSelect).toHaveBeenNthCalledWith(3, 'advanced', 10)
  })
})
