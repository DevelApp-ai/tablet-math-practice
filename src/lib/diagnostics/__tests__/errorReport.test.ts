import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  buildErrorReport,
  startConsoleCapture,
  stopConsoleCapture,
  getCapturedConsole,
  clearCapturedConsole,
  ISSUE_REPO_OWNER,
  ISSUE_REPO_NAME,
} from '../errorReport'

describe('errorReport', () => {
  beforeEach(() => {
    stopConsoleCapture()
    clearCapturedConsole()
  })

  afterEach(() => {
    stopConsoleCapture()
    clearCapturedConsole()
  })

  describe('buildErrorReport', () => {
    it('builds a title prefixed with the error message', () => {
      const { title } = buildErrorReport({ message: 'Something broke' })
      expect(title).toBe('Runtime error: Something broke')
    })

    it('truncates long error messages in the title', () => {
      const long = 'x'.repeat(120)
      const { title } = buildErrorReport({ message: long })
      expect(title.length).toBeLessThanOrEqual(80 + 'Runtime error: '.length + 1)
      expect(title).toContain('…')
    })

    it('includes the message and stack trace in the body', () => {
      const { body } = buildErrorReport({ message: 'Boom', stack: 'at foo (bar.ts:1:1)' })
      expect(body).toContain('**Message:** Boom')
      expect(body).toContain('at foo (bar.ts:1:1)')
    })

    it('uses the message as the stack when no stack is provided', () => {
      const { body } = buildErrorReport({ message: 'No stack here' })
      expect(body).toContain('No stack here')
    })

    it('builds a GitHub issue URL pointing to the repo', () => {
      const { url } = buildErrorReport({ message: 'Boom' })
      expect(url).toContain(
        `https://github.com/${ISSUE_REPO_OWNER}/${ISSUE_REPO_NAME}/issues/new`
      )
      expect(url).toContain('title=')
      expect(url).toContain('body=')
    })

    it('URL-encodes the title and body', () => {
      const { url } = buildErrorReport({ message: 'Error & "quotes"' })
      const decoded = decodeURIComponent(url)
      expect(decoded).toContain('Error & "quotes"')
    })

    it('includes captured console entries in the body', () => {
      const entries = [
        { level: 'error' as const, args: ['failed to load'], timestamp: 1700000000000 },
      ]
      const { body } = buildErrorReport({ message: 'Boom' }, entries)
      expect(body).toContain('failed to load')
      expect(body).toContain('[error]')
    })

    it('notes when no console errors were captured', () => {
      const { body } = buildErrorReport({ message: 'Boom' }, [])
      expect(body).toContain('No console errors captured.')
    })
  })

  describe('console capture', () => {
    it('records console.error calls while capturing', () => {
      startConsoleCapture()
      console.error('a problem', { code: 1 })
      const captured = getCapturedConsole()
      expect(captured).toHaveLength(1)
      expect(captured[0].level).toBe('error')
      expect(captured[0].args).toContain('a problem')
    })

    it('records console.warn calls while capturing', () => {
      startConsoleCapture()
      console.warn('careful')
      const captured = getCapturedConsole()
      expect(captured).toHaveLength(1)
      expect(captured[0].level).toBe('warn')
    })

    it('does not capture before startConsoleCapture is called', () => {
      console.error('ignored')
      expect(getCapturedConsole()).toHaveLength(0)
    })

    it('stops capturing after stopConsoleCapture', () => {
      startConsoleCapture()
      console.error('captured')
      stopConsoleCapture()
      console.error('not captured')
      expect(getCapturedConsole()).toHaveLength(1)
    })

    it('still forwards captured logs to the original console', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      startConsoleCapture()
      console.error('forwarded')
      expect(spy).toHaveBeenCalled()
      stopConsoleCapture()
      spy.mockRestore()
    })

    it('limits the buffer to the most recent entries', () => {
      startConsoleCapture()
      for (let i = 0; i < 60; i++) {
        console.error(`entry ${i}`)
      }
      expect(getCapturedConsole().length).toBeLessThanOrEqual(50)
    })
  })
})
