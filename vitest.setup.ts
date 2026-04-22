import '@testing-library/jest-dom/vitest'
import * as matchers from 'vitest-axe/matchers'
import { expect } from 'vitest'

expect.extend(matchers)

// Log unhandled rejections to help diagnose silent exits
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection in tests:', reason)
})

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UncaughtException in tests:', err)
})
