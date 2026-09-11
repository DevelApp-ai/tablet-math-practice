import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface TenFrameProps {
  /** Total count to represent (0–20). For addition, the two operands are
   * shown as filled counters; the result row is the running total. */
  value: number
  /** Optional second operand highlighted in a distinct color (addition). */
  highlight?: number
  className?: string
}

const FRAME_ROWS = 2
const FRAME_COLS = 5
const FRAME_CAPACITY = FRAME_ROWS * FRAME_COLS

/**
 * A CPA "concrete → pictorial" ten-frame: a 2×5 grid of cells the learner
 * taps to fill. For values > 10 a second frame is rendered so the structure
 * of ten is always visible (plan section 2.1, beginner addition/subtraction).
 */
export function TenFrame({ value, highlight, className }: TenFrameProps) {
  const frames = useMemo(
    () => Math.max(1, Math.ceil(Math.max(value, 1) / FRAME_CAPACITY)),
    [value]
  )

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} aria-label={`Ten frame showing ${value}`}>
      <div className="flex gap-4">
        {Array.from({ length: frames }, (_, frameIndex) => {
          const base = frameIndex * FRAME_CAPACITY
          return (
            <div
              key={frameIndex}
              className="grid grid-cols-5 grid-rows-2 gap-1 p-2 rounded-md border-2 border-border bg-background"
              role="group"
              aria-label={`Frame ${frameIndex + 1}`}
            >
              {Array.from({ length: FRAME_CAPACITY }, (_, cellIndex) => {
                const absoluteIndex = base + cellIndex
                const filled = absoluteIndex < value
                const isHighlight = highlight !== undefined && absoluteIndex >= value - highlight && absoluteIndex < value
                return (
                  <div
                    key={cellIndex}
                    className={cn(
                      'w-9 h-9 md:w-11 md:h-11 rounded-full border flex items-center justify-center transition-colors',
                      filled
                        ? isHighlight
                          ? 'bg-primary/80 border-primary'
                          : 'bg-primary border-primary'
                        : 'bg-transparent border-border'
                    )}
                    aria-hidden="true"
                  />
                )
              })}
            </div>
          )
        })}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {value} counter{value === 1 ? '' : 's'}
      </span>
    </div>
  )
}
