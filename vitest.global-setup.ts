import { createRequire } from 'node:module'

// ARC-21: Recep sözü defteri koşum başına benzersiz geçici dizine yönlenir, koşum bitince silinir.
// globalSetup ana süreçte koşar; ortamı worker'lar başlamadan ayarlar, kapanışı vitest çağırır
// (`threads` havuzunda worker'daki process.on('exit') güvenilir değil).
const require = createRequire(import.meta.url)

export default function setup() {
  const { hazirla } = require('./scripts/board/vitest-defter-ortami.cjs') as {
    hazirla: () => { temizle: () => void }
  }
  const ortam = hazirla()
  return () => ortam.temizle()
}
