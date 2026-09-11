// Phase 5: ink-capture data model. Strokes are timestamped point sequences
// captured from the Scratchpad canvas so they can be replayed for educators
// (plan section 7.2) and stored per problem for review.

export interface InkPoint {
  x: number
  y: number
  /** Monotonic timestamp (ms) relative to the stroke session start. */
  t: number
}

export interface Stroke {
  id: string
  points: InkPoint[]
  /** Pointer type that produced the stroke ('pen' | 'touch' | 'mouse'). */
  pointerType: string
  /** Session-relative timestamp at which the stroke began. */
  startedAt: number
  /** Session-relative timestamp at which the stroke ended. */
  endedAt: number
}

export interface StrokeSession {
  id: string
  strokes: Stroke[]
  startedAt: number
  duration: number
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Mutable recorder that accumulates strokes with session-relative timestamps.
 * Call `beginStroke` on pointer down, `appendPoint` on move, `endStroke` on up,
 * and `toSession` to snapshot the captured strokes.
 */
export class StrokeRecorder {
  private strokes: Stroke[] = []
  private current: Stroke | null = null
  private readonly origin: number

  constructor(now: number = Date.now()) {
    this.origin = now
  }

  beginStroke(pointerType: string, now: number = Date.now()): void {
    const t = now - this.origin
    this.current = {
      id: generateId(),
      points: [],
      pointerType,
      startedAt: t,
      endedAt: t,
    }
  }

  appendPoint(x: number, y: number, now: number = Date.now()): void {
    if (!this.current) return
    const t = now - this.origin
    this.current.points.push({ x, y, t })
    this.current.endedAt = t
  }

  endStroke(now: number = Date.now()): Stroke | null {
    if (!this.current) return null
    this.current.endedAt = now - this.origin
    const stroke = this.current
    this.strokes.push(stroke)
    this.current = null
    return stroke
  }

  clear(): void {
    this.strokes = []
    this.current = null
  }

  getStrokes(): Stroke[] {
    return this.strokes
  }

  getStrokeCount(): number {
    return this.strokes.length
  }

  toSession(now: number = Date.now()): StrokeSession {
    return {
      id: generateId(),
      strokes: [...this.strokes],
      startedAt: 0,
      duration: now - this.origin,
    }
  }
}

/**
 * Total number of points across all strokes in a session.
 */
export function getTotalPoints(session: StrokeSession): number {
  return session.strokes.reduce((sum, s) => sum + s.points.length, 0)
}

/**
 * Maximum stroke duration (ms) — used to cap replay speed.
 */
export function getMaxStrokeDuration(session: StrokeSession): number {
  return session.strokes.reduce(
    (max, s) => Math.max(max, s.endedAt - s.startedAt),
    0
  )
}

/**
 * Filter a session down to strokes produced by a given pointer type
 * (e.g. drop 'touch' when reviewing stylus-only ink).
 */
export function filterByPointerType(
  session: StrokeSession,
  pointerType: string
): StrokeSession {
  return {
    ...session,
    strokes: session.strokes.filter((s) => s.pointerType === pointerType),
  }
}

/**
 * A scaled replay schedule: maps each stroke to a normalized start time in
 * [0, totalDuration] so the viewer can play back at an arbitrary speed.
 */
export interface ReplaySchedule {
  totalDuration: number
  strokes: { stroke: Stroke; startOffset: number; duration: number }[]
}

export function buildReplaySchedule(session: StrokeSession): ReplaySchedule {
  const totalDuration = session.duration || 1
  const strokes = session.strokes.map((stroke) => ({
    stroke,
    startOffset: stroke.startedAt,
    duration: Math.max(1, stroke.endedAt - stroke.startedAt),
  }))
  return { totalDuration, strokes }
}
