import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface NumberLineProps {
  /** Start of the number line. */
  from: number
  /** End of the number line (inclusive). */
  to: number
  /** Value to mark as the starting point of a jump. */
  jumpFrom?: number
  /** Distance/size of the jump to draw as an arc. */
  jumpSize?: number
  className?: string
}

/**
 * A pictorial number line with an optional jump arc (plan section 2.2).
 * Used for beginner subtraction (jump backward) and number sense; the arc
 * visualizes the magnitude of the operation between two points.
 */
export function NumberLine({ from, to, jumpFrom, jumpSize, className }: NumberLineProps) {
  const width = 320
  const height = 80
  const padding = 24
  const usableWidth = width - padding * 2
  const span = Math.max(1, to - from)

  const xFor = useMemo(
    () => (value: number) => padding + ((value - from) / span) * usableWidth,
    [from, span, usableWidth]
  )

  const ticks = useMemo(() => {
    const count = to - from
    const step = count > 20 ? Math.ceil(count / 10) : 1
    const arr: number[] = []
    for (let v = from; v <= to; v += step) arr.push(v)
    return arr
  }, [from, to])

  const jumpTo = jumpFrom !== undefined && jumpSize !== undefined ? jumpFrom + jumpSize : undefined
  const hasJump = jumpFrom !== undefined && jumpTo !== undefined
  const arcRadius = hasJump ? Math.max(12, Math.min(40, Math.abs(jumpSize!) * 3)) : 0

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-md"
        role="img"
        aria-label={`Number line from ${from} to ${to}${hasJump ? `, jump from ${jumpFrom} to ${jumpTo}` : ''}`}
      >
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          className="stroke-foreground"
          strokeWidth={2}
        />
        {ticks.map((tick) => {
          const x = xFor(tick)
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={height / 2 - 6}
                x2={x}
                y2={height / 2 + 6}
                className="stroke-foreground"
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={height / 2 + 22}
                textAnchor="middle"
                className="fill-foreground text-[10px]"
              >
                {tick}
              </text>
            </g>
          )
        })}
        {hasJump && (
          <>
            <circle cx={xFor(jumpFrom!)} cy={height / 2} r={4} className="fill-primary" />
            <path
              d={`M ${xFor(jumpFrom!)} ${height / 2} A ${arcRadius} ${arcRadius} 0 0 1 ${xFor(jumpTo!)} ${height / 2}`}
              className="stroke-primary"
              strokeWidth={2}
              fill="none"
            />
            <circle cx={xFor(jumpTo!)} cy={height / 2} r={4} className="fill-primary" />
            <text
              x={(xFor(jumpFrom!) + xFor(jumpTo!)) / 2}
              y={height / 2 - arcRadius - 4}
              textAnchor="middle"
              className="fill-primary text-[11px] font-medium"
            >
              {jumpSize! > 0 ? `+${jumpSize!}` : jumpSize}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
