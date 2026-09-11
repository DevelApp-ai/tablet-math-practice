import {
  StrokeRecorder,
  getTotalPoints,
  getMaxStrokeDuration,
  filterByPointerType,
  buildReplaySchedule,
} from '../ink/strokeStore'

describe('StrokeRecorder', () => {
  test('records a single stroke with session-relative timestamps', () => {
    const rec = new StrokeRecorder(1000)
    rec.beginStroke('pen', 1000)
    rec.appendPoint(0, 0, 1000)
    rec.appendPoint(10, 10, 1050)
    const stroke = rec.endStroke(1050)

    expect(stroke).not.toBeNull()
    expect(stroke!.pointerType).toBe('pen')
    expect(stroke!.points).toHaveLength(2)
    expect(stroke!.points[0]).toEqual({ x: 0, y: 0, t: 0 })
    expect(stroke!.points[1]).toEqual({ x: 10, y: 10, t: 50 })
    expect(stroke!.startedAt).toBe(0)
    expect(stroke!.endedAt).toBe(50)
  })

  test('accumulates multiple strokes and counts them', () => {
    const rec = new StrokeRecorder(0)
    rec.beginStroke('pen', 0)
    rec.appendPoint(1, 1, 10)
    rec.endStroke(10)
    rec.beginStroke('pen', 20)
    rec.appendPoint(2, 2, 30)
    rec.endStroke(30)

    expect(rec.getStrokeCount()).toBe(2)
    expect(rec.getStrokes()[1].startedAt).toBe(20)
  })

  test('ignores appendPoint when no stroke is active', () => {
    const rec = new StrokeRecorder(0)
    rec.appendPoint(5, 5, 10)
    expect(rec.getStrokeCount()).toBe(0)
    expect(rec.endStroke()).toBeNull()
  })

  test('clear resets the recorder', () => {
    const rec = new StrokeRecorder(0)
    rec.beginStroke('pen', 0)
    rec.appendPoint(1, 1, 10)
    rec.endStroke(10)
    rec.clear()
    expect(rec.getStrokeCount()).toBe(0)
  })

  test('toSession snapshots strokes with a duration', () => {
    const rec = new StrokeRecorder(0)
    rec.beginStroke('pen', 0)
    rec.appendPoint(1, 1, 10)
    rec.endStroke(10)
    const session = rec.toSession(100)

    expect(session.strokes).toHaveLength(1)
    expect(session.duration).toBe(100)
    expect(session.startedAt).toBe(0)
  })
})

describe('session helpers', () => {
  function twoStrokeSession() {
    const rec = new StrokeRecorder(0)
    rec.beginStroke('pen', 0)
    rec.appendPoint(0, 0, 0)
    rec.appendPoint(5, 5, 100)
    rec.endStroke(100)
    rec.beginStroke('touch', 200)
    rec.appendPoint(1, 1, 200)
    rec.appendPoint(2, 2, 260)
    rec.endStroke(260)
    return rec.toSession(300)
  }

  test('getTotalPoints sums points across strokes', () => {
    expect(getTotalPoints(twoStrokeSession())).toBe(4)
  })

  test('getMaxStrokeDuration returns the longest stroke', () => {
    expect(getMaxStrokeDuration(twoStrokeSession())).toBe(100)
  })

  test('filterByPointerType keeps only matching strokes', () => {
    const filtered = filterByPointerType(twoStrokeSession(), 'pen')
    expect(filtered.strokes).toHaveLength(1)
    expect(filtered.strokes[0].pointerType).toBe('pen')
  })
})

describe('buildReplaySchedule', () => {
  test('maps strokes to offsets and durations within totalDuration', () => {
    const rec = new StrokeRecorder(0)
    rec.beginStroke('pen', 0)
    rec.appendPoint(0, 0, 0)
    rec.endStroke(50)
    rec.beginStroke('pen', 100)
    rec.appendPoint(1, 1, 100)
    rec.endStroke(150)
    const session = rec.toSession(200)

    const schedule = buildReplaySchedule(session)
    expect(schedule.totalDuration).toBe(200)
    expect(schedule.strokes).toHaveLength(2)
    expect(schedule.strokes[0].startOffset).toBe(0)
    expect(schedule.strokes[0].duration).toBe(50)
    expect(schedule.strokes[1].startOffset).toBe(100)
  })

  test('handles an empty session without dividing by zero', () => {
    const rec = new StrokeRecorder(0)
    const session = rec.toSession(0)
    const schedule = buildReplaySchedule(session)
    expect(schedule.totalDuration).toBe(1)
    expect(schedule.strokes).toHaveLength(0)
  })
})
