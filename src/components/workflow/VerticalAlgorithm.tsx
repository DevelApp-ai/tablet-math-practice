import { useMemo } from 'react'
import { Problem } from '@/lib/types'
import {
  solveVertical,
  getColumnDigits,
  columnStepFor,
  COLUMNS,
  Column,
  ColumnStep,
} from '@/lib/verticalMath'
import { getOperationSymbol } from '@/lib/mathUtils'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X as XIcon } from '@phosphor-icons/react'

interface VerticalAlgorithmProps {
  problem: Problem
  submitted: boolean
  isCorrect: boolean | null
  /** When provided, the entry for the focused column is highlighted. */
  focusedColumn?: Column | null
}

interface CellProps {
  digit: number
  isResult?: boolean
  isBlank?: boolean
  highlight?: boolean
}

function Cell({ digit, isResult, isBlank, highlight }: CellProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-12 h-14 md:w-14 md:h-16 text-3xl md:text-4xl font-bold tabular-nums rounded',
        isBlank && 'text-muted-foreground/30',
        isResult && 'text-primary',
        highlight && 'ring-2 ring-accent bg-accent/10'
      )}
      aria-hidden={isBlank}
    >
      {isBlank ? '·' : digit}
    </span>
  )
}

export function VerticalAlgorithm({
  problem,
  submitted,
  isCorrect,
  focusedColumn = null,
}: VerticalAlgorithmProps) {
  const solution = useMemo(() => solveVertical(problem), [problem])
  const digits = useMemo(() => getColumnDigits(problem), [problem])
  const answerDigits = useMemo(() => {
    const str = String(Math.abs(problem.correctAnswer))
    return str.split('').map((d) => parseInt(d, 10))
  }, [problem])

  if (!solution) return null

  const visibleColumns = digits.map((d) => d.column)
  const operand1Str = String(Math.abs(problem.operand1))
  const operand2Str = String(Math.abs(problem.operand2))
  const width = Math.max(operand1Str.length, operand2Str.length, answerDigits.length)

  const stepForColumn = (column: Column): ColumnStep | undefined =>
    columnStepFor(problem, column)

  return (
    <div
      className="inline-flex flex-col items-end gap-1 font-mono select-none"
      role="group"
      aria-label={`Vertical ${problem.operation} problem ${problem.operand1} ${getOperationSymbol(problem.operation)} ${problem.operand2}`}
    >
      {/* Carry / borrow row */}
      <div className="flex items-end gap-1">
        {Array.from({ length: width }).map((_, i) => {
          const column = COLUMNS[width - 1 - i]
          if (!visibleColumns.includes(column)) {
            return <span key={column} className="w-12 md:w-14 h-6" />
          }
          const carry = solution.carryRow[column]
          const borrow = solution.borrowRow[column]
          const showMark = problem.operation === 'addition' ? carry > 0 : borrow > 0
          return (
            <span
              key={column}
              className="w-12 md:w-14 h-6 flex items-center justify-center text-base text-accent font-semibold"
              aria-label={
                problem.operation === 'addition'
                  ? carry > 0
                    ? `Carry ${carry} in ${column} column`
                    : undefined
                  : borrow > 0
                    ? `Borrow from ${column} column`
                    : undefined
              }
            >
              {showMark ? (problem.operation === 'addition' ? carry : '−') : ''}
            </span>
          )
        })}
      </div>

      {/* Operand 1 */}
      <div className="flex items-end gap-1">
        {Array.from({ length: width }).map((_, i) => {
          const column = COLUMNS[width - 1 - i]
          if (!visibleColumns.includes(column)) {
            return <span key={column} className="w-12 md:w-14 h-14 md:h-16" />
          }
          const d = digits.find((x) => x.column === column)!
          const isLeadingBlank =
            i < width - String(Math.abs(problem.operand1)).length
          return (
            <Cell
              key={column}
              digit={d.operand1Digit}
              isBlank={isLeadingBlank}
              highlight={focusedColumn === column}
            />
          )
        })}
      </div>

      {/* Operand 2 with operator */}
      <div className="flex items-end gap-1">
        <span className="text-3xl md:text-4xl font-bold text-primary w-8 md:w-10 flex items-end justify-center pb-1">
          {getOperationSymbol(problem.operation)}
        </span>
        {Array.from({ length: width }).map((_, i) => {
          const column = COLUMNS[width - 1 - i]
          if (!visibleColumns.includes(column)) {
            return <span key={column} className="w-12 md:w-14 h-14 md:h-16" />
          }
          const d = digits.find((x) => x.column === column)!
          const isLeadingBlank =
            i < width - String(Math.abs(problem.operand2)).length
          return (
            <Cell
              key={column}
              digit={d.operand2Digit}
              isBlank={isLeadingBlank}
              highlight={focusedColumn === column}
            />
          )
        })}
      </div>

      {/* Divider line */}
      <div className="w-full border-t-2 border-foreground" />

      {/* Result row */}
      <div className="flex items-end gap-1 pt-1">
        {Array.from({ length: width }).map((_, i) => {
          const column = COLUMNS[width - 1 - i]
          const step = stepForColumn(column)
          const resultDigit = step?.resultDigit ?? 0
          const isLeadingBlank = i < width - answerDigits.length
          return (
            <div key={column} className="relative">
              <Cell digit={resultDigit} isResult isBlank={isLeadingBlank} />
              <AnimatePresence>
                {submitted && step && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -right-1 -top-1"
                  >
                    {isCorrect ? (
                      <Check size={16} weight="bold" className="text-green-600" />
                    ) : (
                      <XIcon size={16} weight="bold" className="text-destructive" />
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
