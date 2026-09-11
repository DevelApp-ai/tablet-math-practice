import { useEffect, useRef, useCallback, useState } from 'react'
import { CanvasBackground } from '@/lib/types'
import { getCanvasGridStyle, shouldAcceptPointer } from '@/lib/canvasBackground'
import { StrokeRecorder, StrokeSession } from '@/lib/ink/strokeStore'
import { cn } from '@/lib/utils'
import { Eraser, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface ScratchpadProps {
  canvasBackground: CanvasBackground
  palmRejection: boolean
  className?: string
  /** When provided, the scratchpad emits a captured stroke session on clear/unmount. */
  onStrokeSession?: (session: StrokeSession) => void
}

interface Point {
  x: number
  y: number
}

export interface ScratchpadHandle {
  clear: () => void
}

export function Scratchpad({
  canvasBackground,
  palmRejection,
  className,
  onStrokeSession,
}: ScratchpadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)
  const recorderRef = useRef<StrokeRecorder | null>(null)
  const [hasInk, setHasInk] = useState(false)

  if (onStrokeSession && !recorderRef.current) {
    recorderRef.current = new StrokeRecorder()
  }

  const style = getCanvasGridStyle(canvasBackground)

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const { width, height } = container.getBoundingClientRect()
    const snapshot = canvas.toDataURL()
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
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, width, height)
    img.src = snapshot
  }, [])

  useEffect(() => {
    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [resizeCanvas])

  const getPoint = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const drawSegment = (from: Point, to: Point) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!shouldAcceptPointer(e.pointerType, palmRejection)) return
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    drawingRef.current = true
    lastPointRef.current = getPoint(e)
    recorderRef.current?.beginStroke(e.pointerType)
    recorderRef.current?.appendPoint(lastPointRef.current.x, lastPointRef.current.y)
    setHasInk(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return
    if (!shouldAcceptPointer(e.pointerType, palmRejection)) return
    e.preventDefault()
    const point = getPoint(e)
    const last = lastPointRef.current
    if (last) drawSegment(last, point)
    recorderRef.current?.appendPoint(point.x, point.y)
    lastPointRef.current = point
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    drawingRef.current = false
    lastPointRef.current = null
    recorderRef.current?.endStroke()
    canvasRef.current?.releasePointerCapture?.(e.pointerId)
  }

  const emitSession = useCallback(() => {
    if (!onStrokeSession || !recorderRef.current) return
    if (recorderRef.current.getStrokeCount() === 0) return
    onStrokeSession(recorderRef.current.toSession())
  }, [onStrokeSession])

  useEffect(() => {
    return () => emitSession()
  }, [emitSession])

  const clear = () => {
    emitSession()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    recorderRef.current?.clear()
    setHasInk(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full min-h-[180px] rounded-md border border-input bg-background overflow-hidden',
        className
      )}
      style={{
        backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Scratchpad for rough work"
        role="img"
      />
      {hasInk && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          className="absolute top-2 right-2 gap-1.5 bg-background/80 backdrop-blur"
          aria-label="Clear scratchpad"
        >
          <Trash size={16} />
          Clear
        </Button>
      )}
      {!hasInk && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="flex items-center gap-2 text-sm text-muted-foreground/50">
            <Eraser size={16} />
            Scratchpad
          </span>
        </div>
      )}
    </div>
  )
}
