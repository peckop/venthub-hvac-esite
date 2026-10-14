import { createRequire } from 'node:module'

// ARC-21: Recep sözü defteri koşum başına benzersiz geçici dizine yönlenir, koşum bitince silinir.
// ARC-129: HOME/USERPROFILE de koşum başına geçici dizine yönlenir; testler gerçek ~/.claude altına yazamaz.
// globalSetup ana süreçte koşar; ortamı worker'lar başlamadan ayarlar, kapanışı vitest çağırır
// (`threads` havuzunda worker'daki process.on('exit') güvenilir değil).
const require = createRequire(import.meta.url)

export default function setup() {
  const { hazirla } = require('./scripts/board/vitest-defter-ortami.cjs') as {
    hazirla: () => { temizle: () => void }
  }
  const { hazirla: homeHazirla } = require('./scripts/board/vitest-home-ortami.cjs') as {
    hazirla: () => { temizle: () => void }
  }
  // Sıra önemli değil ama GERÇEK HOME'u ilk yakalayan homeHazirla'dır; defter yolu tmpdir'den türer, HOME'dan değil.
  const home = homeHazirla()
  const ortam = hazirla()
  return () => {
    ortam.temizle()
    home.temizle()
  }
}
