import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ArrayGridProps {
  rows: number
  cols: number
  /** Highlighted cells for division "grouping" mode: how many groups of `cols` fit. */
  groupSize?: number
  className?: string
}

/**
 * An area/array model for × and ÷ (plan section 2.3). Renders a `rows × cols`
 * grid so the learner sees multiplication as repeated addition. For division,
 * `groupSize` highlights groups of the divisor.
 */
export function ArrayGrid({ rows, cols, groupSize, className }: ArrayGridProps) {
  const total = useMemo(() => Math.max(0, rows * cols), [rows, cols])

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} aria-label={`Array grid ${rows} by ${cols}`}>
      <div
        className="inline-grid gap-0.5 p-2 rounded-md border-2 border-border bg-background"
        style={{ gridTemplateColumns: `repeat(${Math.min(cols, 12)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const index = r * cols + c
            const inGroup = groupSize !== undefined && Math.floor(index / groupSize) < (rows * cols) / groupSize
            return (
              <div
                key={`${r}-${c}`}
                className={cn(
                  'w-6 h-6 md:w-7 md:h-7 rounded-sm border transition-colors',
                  groupSize !== undefined
                    ? inGroup
                      ? 'bg-primary border-primary'
                      : 'bg-transparent border-border'
                    : 'bg-primary/80 border-primary'
                )}
                aria-hidden="true"
              />
            )
          })
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {rows} × {cols} = {total}
      </span>
    </div>
  )
}
