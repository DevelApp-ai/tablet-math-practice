import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BalanceScale } from '@/components/manipulatives/BalanceScale'

describe('BalanceScale', () => {
  it('renders both values when both sides are known', () => {
    const { getByText } = render(<BalanceScale left={3} right={5} />)
    expect(getByText('3')).toBeInTheDocument()
    expect(getByText('5')).toBeInTheDocument()
  })

  // Regression for issue #59: '63 + ? = 108' must not reveal the answer on the
  // balance. The unknown side must show '?' instead of its actual value; the
  // known side still shows its value.
  it('shows the known value and masks the unknown right side with a question mark', () => {
    const { getAllByText, getByText } = render(<BalanceScale left={63} right={null} />)
    expect(getByText('?')).toBeInTheDocument()
    expect(getAllByText('63').length).toBe(1)
  })

  it('does not show a balanced label while a side is unknown', () => {
    const { queryByText } = render(<BalanceScale left={63} right={null} />)
    expect(queryByText('Balanced!')).not.toBeInTheDocument()
  })

  it('masks the unknown left side with a question mark', () => {
    const { getAllByText, getByText } = render(<BalanceScale left={null} right={63} />)
    expect(getByText('?')).toBeInTheDocument()
    expect(getAllByText('63').length).toBe(1)
  })
})
