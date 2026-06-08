import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import { reportError } from '../errorReporter'

describe('reportError', () => {
  let consoleWarnMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('should warn in development mode if window is defined', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubGlobal('window', {})

    const error = new Error('Test error')
    const context = { userId: '123' }

    reportError(error, context)

    expect(consoleWarnMock).toHaveBeenCalledWith(
      '[errorReporter] reportError called before install:',
      error,
      context
    )
  })

  it('should not warn in production mode even if window is defined', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubGlobal('window', {})

    const error = new Error('Test error')

    reportError(error)

    expect(consoleWarnMock).not.toHaveBeenCalled()
  })

  it('should not warn if window is undefined', () => {
    vi.stubEnv('NODE_ENV', 'development')
    // We don't stub window, so it's undefined in Node environment by default unless jsdom/happy-dom is used,
    // let's explicitly remove it just in case vitest is running in happy-dom
    vi.stubGlobal('window', undefined)

    const error = new Error('Test error')

    reportError(error)

    expect(consoleWarnMock).not.toHaveBeenCalled()
  })

  it('should handle unknown errors without throwing', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubGlobal('window', {})

    expect(() => reportError('Just a string', { id: 1 })).not.toThrow()
    expect(consoleWarnMock).toHaveBeenCalledWith(
      '[errorReporter] reportError called before install:',
      'Just a string',
      { id: 1 }
    )
  })
})
