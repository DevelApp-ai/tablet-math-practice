import { cn } from '@/lib/utils'

interface BalanceScaleProps {
  /** Value on the left tray. */
  left: number
  /** Value on the right tray. */
  right: number
  className?: string
}

/**
 * Phase 6 (plan §6.2): a balance-scale manipulative for missing-operand
 * problems. The beam tilts toward the heavier side; when balanced the beam
 * is level and a "balanced" label appears. Pure SVG, no new dependency.
 */
export function BalanceScale({ left, right, className }: BalanceScaleProps) {
  const diff = right - left
  // Tilt angle in degrees: clamp to ±18° for a visible but gentle tilt.
  const tilt = Math.max(-18, Math.min(18, diff * 1.5))
  const balanced = Math.abs(diff) < 0.01

  return (
    <div className={cn('flex flex-col items-center gap-2', className)} aria-label={`Balance scale: left ${left}, right ${right}, ${balanced ? 'balanced' : 'tilted'}`}>
      <svg width="100%" viewBox="0 0 240 150" className="max-w-xs" role="img">
        {/* Stand */}
        <line x1="120" y1="60" x2="120" y2="130" className="stroke-foreground" strokeWidth={4} />
        <line x1="95" y1="130" x2="145" y2="130" className="stroke-foreground" strokeWidth={4} />
        {/* Beam (tilts) */}
        <g transform={`rotate(${tilt} 120 60)`}>
          <line x1="40" y1="60" x2="200" y2="60" className="stroke-foreground" strokeWidth={3} />
          {/* Left tray string + pan */}
          <line x1="40" y1="60" x2="40" y2="80" className="stroke-foreground" strokeWidth={1.5} />
          <ellipse cx="40" cy="84" rx="22" ry="6" className="fill-primary/20 stroke-foreground" strokeWidth={1.5} />
          <text x="40" y="78" textAnchor="middle" className="fill-foreground text-[11px] font-medium">
            {left}
          </text>
          {/* Right tray string + pan */}
          <line x1="200" y1="60" x2="200" y2="80" className="stroke-foreground" strokeWidth={1.5} />
          <ellipse cx="200" cy="84" rx="22" ry="6" className="fill-primary/20 stroke-foreground" strokeWidth={1.5} />
          <text x="200" y="78" textAnchor="middle" className="fill-foreground text-[11px] font-medium">
            {right}
          </text>
        </g>
        {/* Fulcrum */}
        <polygon points="120,55 112,60 128,60" className="fill-foreground" />
      </svg>
      <span className={cn('text-sm font-medium', balanced ? 'text-success' : 'text-muted-foreground')}>
        {balanced ? 'Balanced!' : 'Find the missing number to balance'}
      </span>
    </div>
  )
}
