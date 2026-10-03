import '@testing-library/jest-dom/vitest'

import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'

expect.extend(matchers)

// Recep sözü defteri (REC-554): `board-brief.cjs` kancasını spawn eden testler GERÇEK ~/.claude/recep-sozu-defteri.jsonl'a
// sahte "Recep sözü" yazmasın. Her testin kancası bu ortamı miras alır; defter geçici dizine yönlenir.
// Yönlendirmeyi ve temizliği koşum başına `vitest.global-setup.ts` yapar (ARC-21). Aşağıdaki satır yalnız
// o çalışmadıysa (tek dosya, farklı koşucu) güvenlik ağıdır: BENZERSİZ ad, sabit ad değil.
// Bu yolda oluşan dosya TEMİZLENMEZ (silecek ana süreç kapanışı yok); yalnız istisnai yolda kalır, işletim sistemi geçici dizini siler.
process.env.VENTHUB_RECEP_DEFTER ??= join(tmpdir(), `vitest-recep-defter-${process.pid}-${randomUUID()}.jsonl`)

// Log unhandled rejections to help diagnose silent exits
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection in tests:', reason)
})

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UncaughtException in tests:', err)
})
