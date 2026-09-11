import { Problem } from './types'

export type Column = 'ones' | 'tens' | 'hundreds' | 'thousands'

export const COLUMNS: Column[] = ['ones', 'tens', 'hundreds', 'thousands']

export const COLUMN_PLACE_VALUE: Record<Column, number> = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1000,
}

export const COLUMN_INDEX: Record<Column, number> = {
  ones: 0,
  tens: 1,
  hundreds: 2,
  thousands: 3,
}

export type VerticalOperation = 'addition' | 'subtraction' | 'multiplication' | 'division'

export interface ColumnDigit {
  column: Column
  operand1Digit: number
  operand2Digit: number
}

export interface ColumnStep {
  column: Column
  top: number
  bottom: number
  carryIn: number
  borrowFrom: number
  resultDigit: number
  carryOut: number
}

export interface VerticalSolution {
  operation: VerticalOperation
  operand1: number
  operand2: number
  answer: number
  steps: ColumnStep[]
  carryRow: Record<Column, number>
  borrowRow: Record<Column, 0 | 1>
}

function toDigits(value: number, count: number): number[] {
  const padded = String(Math.abs(value)).padStart(count, '0')
  return padded
    .split('')
    .reverse()
    .slice(0, count)
    .map((d) => parseInt(d, 10))
}

function requiredColumns(operand1: number, operand2: number): Column[] {
  const maxDigits = Math.max(
    String(Math.abs(operand1)).length,
    String(Math.abs(operand2)).length
  )
  return COLUMNS.slice(0, Math.min(COLUMNS.length, maxDigits))
}

export function supportsVerticalLayout(problem: Problem): boolean {
  return ['addition', 'subtraction', 'multiplication'].includes(problem.operation)
}

export function solveVertical(problem: Problem): VerticalSolution | null {
  if (!supportsVerticalLayout(problem)) return null

  const { operand1, operand2, operation, correctAnswer } = problem
  const columns = requiredColumns(operand1, operand2)

  if (operation === 'addition' || operation === 'subtraction') {
    const answerDigits = Math.max(
      String(Math.abs(correctAnswer)).length,
      String(Math.abs(operand1)).length,
      String(Math.abs(operand2)).length
    )
    const totalCols = Math.min(COLUMNS.length, answerDigits + 1)
    const top = toDigits(operand1, totalCols)
    const bottom = toDigits(operand2, totalCols)
    const steps: ColumnStep[] = []
    const carryRow: Record<Column, number> = { ones: 0, tens: 0, hundreds: 0, thousands: 0 }
    const borrowRow: Record<Column, 0 | 1> = { ones: 0, tens: 0, hundreds: 0, thousands: 0 }

    let carry = 0
    for (let i = 0; i < totalCols; i++) {
      const column = COLUMNS[i]
      const topDigit = top[i]
      const bottomDigit = bottom[i]

      if (operation === 'addition') {
        const sum = topDigit + bottomDigit + carry
        const resultDigit = sum % 10
        const carryOut = Math.floor(sum / 10)
        steps.push({ column, top: topDigit, bottom: bottomDigit, carryIn: carry, borrowFrom: 0, resultDigit, carryOut })
        // The carry digit is written above the column it is added into.
        if (i + 1 < totalCols && carryOut > 0) {
          carryRow[COLUMNS[i + 1]] = carryOut
        }
        carry = carryOut
      } else {
        let working = topDigit - bottomDigit - carry
        let borrow: 0 | 1 = 0
        if (working < 0) {
          working += 10
          borrow = 1
        }
        const resultDigit = working % 10
        steps.push({ column, top: topDigit, bottom: bottomDigit, carryIn: carry, borrowFrom: borrow, resultDigit, carryOut: 0 })
        // The borrow mark is written above the column borrowed from.
        if (i + 1 < totalCols && borrow > 0) {
          borrowRow[COLUMNS[i + 1]] = 1
        }
        carry = borrow
      }
    }

    return {
      operation: operation as VerticalOperation,
      operand1,
      operand2,
      answer: correctAnswer,
      steps,
      carryRow,
      borrowRow,
    }
  }

  return {
    operation: operation as VerticalOperation,
    operand1,
    operand2,
    answer: correctAnswer,
    steps: [],
    carryRow: { ones: 0, tens: 0, hundreds: 0, thousands: 0 },
    borrowRow: { ones: 0, tens: 0, hundreds: 0, thousands: 0 },
  }
}

export function getColumnDigits(problem: Problem): ColumnDigit[] {
  const columns = requiredColumns(problem.operand1, problem.operand2)
  const totalCols = Math.min(COLUMNS.length, columns.length + 1)
  const top = toDigits(problem.operand1, totalCols)
  const bottom = toDigits(problem.operand2, totalCols)
  return COLUMNS.slice(0, totalCols).map((column, i) => ({
    column,
    operand1Digit: top[i],
    operand2Digit: bottom[i],
  }))
}

export function columnStepFor(problem: Problem, column: Column): ColumnStep | undefined {
  const solution = solveVertical(problem)
  if (!solution) return undefined
  return solution.steps.find((s) => s.column === column)
}
