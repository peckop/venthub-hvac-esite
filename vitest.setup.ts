import '@testing-library/jest-dom/vitest'

import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'

expect.extend(matchers)

// Recep sözü defteri (REC-554): `board-brief.cjs` kancasını spawn eden testler GERÇEK ~/.claude/recep-sozu-defteri.jsonl'a
// sahte "Recep sözü" yazmasın. Her testin kancası bu ortamı miras alır; defter geçici dizine yönlenir.
process.env.VENTHUB_RECEP_DEFTER ??= join(tmpdir(), 'vitest-recep-sozu-defteri.jsonl')

// Log unhandled rejections to help diagnose silent exits
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection in tests:', reason)
})

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UncaughtException in tests:', err)
})
