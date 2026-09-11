import { CanvasBackground } from './types'

export interface CanvasGridStyle {
  backgroundImage: string
  backgroundSize: string
  label: string
}

const GRID_SIZE = '24px 24px'
const LINE_SIZE = '28px 100%'

export const CANVAS_GRID_STYLES: Record<CanvasBackground, CanvasGridStyle> = {
  plain: {
    backgroundImage: 'none',
    backgroundSize: 'auto',
    label: 'Plain',
  },
  grid: {
    backgroundImage:
      'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
    backgroundSize: `${GRID_SIZE} ${GRID_SIZE}`,
    label: 'Graph paper',
  },
  dotted: {
    backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
    backgroundSize: GRID_SIZE,
    label: 'Dotted grid',
  },
  lined: {
    backgroundImage: `linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
    backgroundSize: LINE_SIZE,
    label: 'Lined notebook',
  },
}

export const CANVAS_BACKGROUNDS: CanvasBackground[] = ['plain', 'grid', 'dotted', 'lined']

export function getCanvasGridStyle(background: CanvasBackground): CanvasGridStyle {
  return CANVAS_GRID_STYLES[background]
}

export function shouldAcceptPointer(
  pointerType: string,
  palmRejection: boolean
): boolean {
  if (!palmRejection) return true
  // When palm rejection is on, ignore broad capacitive touch contacts while
  // accepting pen and mouse/trackpad input.
  return pointerType !== 'touch'
}
