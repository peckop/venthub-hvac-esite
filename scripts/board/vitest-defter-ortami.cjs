'use strict'

/**
 * vitest için Recep sözü defteri ortamı (ARC-21 / ARC-12b).
 *
 * Eskiden vitest.setup.ts defteri SABİT adlı tek dosyaya yönlendiriyordu
 * (`os.tmpdir()/vitest-recep-sozu-defteri.jsonl`): dosya koşumlar arası kalıyor, paralel koşular
 * (worktree'ler, ikinci vitest) aynı dosyayı paylaşıyordu — 10 sn tekrar koruması ve satır sayan
 * testler başka koşumun kaydından etkilenebilirdi, temizlik yoktu.
 *
 * `hazirla()` koşum başına BENZERSİZ bir dizin açar, `VENTHUB_RECEP_DEFTER`'i oraya yönlendirir ve
 * `temizle()` ile dizini siler. Ortamda yol ZATEN verilmişse (geliştirici kendi yolunu verdi) ona
 * dokunmaz ve `temizle()` hiçbir şey silmez.
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const DIZIN_ON_EKI = 'vitest-recep-defter-'

function hazirla(env = process.env, tmp = os.tmpdir()) {
  if (env.VENTHUB_RECEP_DEFTER) {
    return { yol: env.VENTHUB_RECEP_DEFTER, sahip: false, temizle() {} }
  }
  const dizin = fs.mkdtempSync(path.join(tmp, DIZIN_ON_EKI))
  const yol = path.join(dizin, 'defter.jsonl')
  env.VENTHUB_RECEP_DEFTER = yol
  return {
    yol,
    sahip: true,
    temizle() {
      // Silinemezse (başka süreç tutuyor, zaten yok) sessiz geçilir: temizlik testi düşürmemeli.
      try {
        fs.rmSync(dizin, { recursive: true, force: true })
      } catch {
        /* en iyi çaba */
      }
    },
  }
}

module.exports = { hazirla, DIZIN_ON_EKI }
