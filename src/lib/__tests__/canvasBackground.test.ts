import {
  CANVAS_GRID_STYLES,
  CANVAS_BACKGROUNDS,
  getCanvasGridStyle,
  shouldAcceptPointer,
} from '../canvasBackground'
import { CanvasBackground } from '../types'

describe('CANVAS_GRID_STYLES', () => {
  test('defines a style for every canvas background option', () => {
    CANVAS_BACKGROUNDS.forEach((bg) => {
      expect(CANVAS_GRID_STYLES[bg]).toBeDefined()
      expect(CANVAS_GRID_STYLES[bg].label).toBeTruthy()
    })
  })

  test('plain background has no background image', () => {
    expect(CANVAS_GRID_STYLES.plain.backgroundImage).toBe('none')
  })

  test('non-plain backgrounds define a CSS gradient', () => {
    const nonPlain: CanvasBackground[] = ['grid', 'dotted', 'lined']
    nonPlain.forEach((bg) => {
      expect(CANVAS_GRID_STYLES[bg].backgroundImage).toContain('gradient')
    })
  })
})

describe('getCanvasGridStyle', () => {
  test('returns the matching style object', () => {
    expect(getCanvasGridStyle('grid')).toBe(CANVAS_GRID_STYLES.grid)
    expect(getCanvasGridStyle('plain')).toBe(CANVAS_GRID_STYLES.plain)
  })
})

describe('shouldAcceptPointer', () => {
  test('accepts pen and mouse when palm rejection is on', () => {
    expect(shouldAcceptPointer('pen', true)).toBe(true)
    expect(shouldAcceptPointer('mouse', true)).toBe(true)
  })

  test('rejects touch when palm rejection is on', () => {
    expect(shouldAcceptPointer('touch', true)).toBe(false)
  })

  test('accepts all pointer types when palm rejection is off', () => {
    expect(shouldAcceptPointer('touch', false)).toBe(true)
    expect(shouldAcceptPointer('pen', false)).toBe(true)
    expect(shouldAcceptPointer('mouse', false)).toBe(true)
  })
})
