import '@testing-library/jest-dom/vitest'

// Log unhandled rejections to help diagnose silent exits
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('UnhandledRejection in tests:', reason)
})

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('UncaughtException in tests:', err)
})
