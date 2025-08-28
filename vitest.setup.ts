import '@testing-library/jest-dom/vitest'

// Log unhandled rejections to help diagnose silent exits
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection in tests:', reason)
})

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UncaughtException in tests:', err)
})
