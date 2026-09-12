export const ISSUE_REPO_OWNER = 'DevelApp-ai'
export const ISSUE_REPO_NAME = 'tablet-math-practice'

const MAX_CONSOLE_ERRORS = 50
const MAX_ERROR_PREVIEW_LENGTH = 500

export interface CapturedError {
  message: string
  stack?: string
  timestamp: number
}

export interface ConsoleEntry {
  level: 'error' | 'warn'
  args: unknown[]
  timestamp: number
}

const consoleBuffer: ConsoleEntry[] = []

let capturing = false
let originalError: (...args: unknown[]) => void
let originalWarn: (...args: unknown[]) => void

function capture(
  level: 'error' | 'warn',
  args: unknown[],
  original: (...args: unknown[]) => void
): void {
  try {
    consoleBuffer.push({
      level,
      args: args.map((a) => serializeArg(a)),
      timestamp: Date.now(),
    })
    if (consoleBuffer.length > MAX_CONSOLE_ERRORS) {
      consoleBuffer.shift()
    }
  } catch {
    // never let capture itself throw
  }
  original.apply(console, args as unknown[])
}

export function startConsoleCapture(): void {
  if (capturing) return
  originalError = console.error
  originalWarn = console.warn
  capturing = true
  console.error = (...args: unknown[]) => capture('error', args, originalError)
  console.warn = (...args: unknown[]) => capture('warn', args, originalWarn)
}

export function stopConsoleCapture(): void {
  if (!capturing) return
  capturing = false
  console.error = originalError
  console.warn = originalWarn
}

export function getCapturedConsole(): ConsoleEntry[] {
  return [...consoleBuffer]
}

export function clearCapturedConsole(): void {
  consoleBuffer.length = 0
}

function serializeArg(arg: unknown): string {
  if (typeof arg === 'string') return arg
  if (arg instanceof Error) return arg.stack || arg.message
  try {
    return JSON.stringify(arg)
  } catch {
    return String(arg)
  }
}

function formatConsoleEntries(entries: ConsoleEntry[]): string {
  if (entries.length === 0) return 'No console errors captured.'
  return entries
    .map((entry) => {
      const time = new Date(entry.timestamp).toISOString()
      const body = entry.args.join(' ')
      return `[${time}] [${entry.level}] ${body}`
    })
    .join('\n')
}

function getEnvironmentInfo(): string {
  const info: Record<string, string> = {
    url: typeof location !== 'undefined' ? location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    timestamp: new Date().toISOString(),
  }
  return Object.entries(info)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')
}

export function buildErrorReport(
  error: { message: string; stack?: string },
  consoleEntries: ConsoleEntry[] = getCapturedConsole()
): { title: string; body: string; url: string } {
  const title = `Runtime error: ${truncate(error.message, 80)}`
  const sections = [
    '## Error',
    `**Message:** ${error.message}`,
    '',
    '### Stack trace',
    '```',
    truncate(error.stack || error.message, MAX_ERROR_PREVIEW_LENGTH),
    '```',
    '',
    '## Environment',
    getEnvironmentInfo(),
    '',
    '## Console output',
    '```',
    formatConsoleEntries(consoleEntries),
    '```',
    '',
    '## Steps to reproduce',
    '<!-- What were you doing when this happened? -->',
  ]
  const body = sections.join('\n')
  const url = `https://github.com/${ISSUE_REPO_OWNER}/${ISSUE_REPO_NAME}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
  return { title, body, url }
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value
  return `${value.slice(0, max)}…`
}

export function openErrorReport(error: { message: string; stack?: string }): void {
  const { url } = buildErrorReport(error)
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
