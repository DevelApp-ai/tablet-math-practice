import { useEffect, useRef, useState, useCallback } from 'react'
import { StrokeSession, buildReplaySchedule, ReplaySchedule } from '@/lib/ink/strokeStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Play, Pause, Rewind } from '@phosphor-icons/react'

interface StrokeReplayViewerProps {
  session: StrokeSession
  className?: string
  /** Multiplier applied to the captured timing (1 = real time). */
  speed?: number
}

const DEFAULT_SPEED = 1

export function StrokeReplayViewer({
  session,
  className,
  speed = DEFAULT_SPEED,
}: StrokeReplayViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const schedule: ReplaySchedule = buildReplaySchedule(session)
  const totalMs = schedule.totalDuration / speed

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const { width, height } = container.getBoundingClientRect()
    canvas.width = Math.max(1, Math.floor(width * dpr))
    canvas.height = Math.max(1, Math.floor(height * dpr))
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.5
    ctx.strokeStyle = 'var(--color-foreground, #000)'
  }, [])

  useEffect(() => {
    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [resizeCanvas])

  const drawUpTo = useCallback(
    (playbackMs: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const replayTime = playbackMs * speed
      for (const { stroke, startOffset } of schedule.strokes) {
        const strokeElapsed = replayTime - startOffset
        if (strokeElapsed <= 0) continue
        const visiblePoints = stroke.points.filter((p) => p.t <= strokeElapsed)
        if (visiblePoints.length === 0) continue
        ctx.beginPath()
        ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y)
        for (let i = 1; i < visiblePoints.length; i++) {
          ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y)
        }
        ctx.stroke()
      }
    },
    [schedule, speed]
  )

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return
    const now = performance.now()
    const e = now - startTimeRef.current
    setElapsed(e)
    if (e >= totalMs) {
      drawUpTo(totalMs)
      stop()
      return
    }
    drawUpTo(e)
    rafRef.current = requestAnimationFrame(tick)
  }, [drawUpTo, totalMs, stop])

  const play = useCallback(() => {
    if (schedule.strokes.length === 0) return
    if (elapsed >= totalMs) {
      setElapsed(0)
      startTimeRef.current = performance.now()
    } else {
      startTimeRef.current = performance.now() - elapsed
    }
    setIsPlaying(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [schedule.strokes.length, elapsed, totalMs, tick])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) stop()
  }, [isPlaying, stop])

  const restart = useCallback(() => {
    stop()
    setElapsed(0)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [stop])

  const progress = totalMs > 0 ? Math.min(1, elapsed / totalMs) : 0

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={cn(
          'relative w-full h-48 md:h-56 rounded-md border border-input bg-background overflow-hidden',
          className
        )}
      >
        <canvas ref={canvasRef} className="absolute inset-0 touch-none" aria-label="Stroke replay" role="img" />
        {schedule.strokes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground/50">
            No strokes to replay
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={isPlaying ? stop : play}
          disabled={schedule.strokes.length === 0}
          className="gap-1.5"
          aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={restart}
          disabled={schedule.strokes.length === 0}
          className="gap-1.5"
          aria-label="Restart replay"
        >
          <Rewind size={16} />
          Restart
        </Button>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-primary transition-[width] duration-75" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
