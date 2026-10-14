import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * INV-OPS-ADRES-1 (ARC-122) — açılış kancası OPS adresini ÇIPLAK ad olarak yazar.
 *
 * Neden: Geo-SEO pencere hafızasına ListAgents `[ref]` ve `local_…` kimliğini yazdı; ref her resume'da değişir,
 * rapor eski OPS'a gitti (12 Ekim). Çıplak `to="OPS"` tek canlı satırla eşleşirse doğrudan gider.
 * Koruma söküldüğünde (filo satırından "OPS ADRESI" çıkarıldığında) test kırmızıdır.
 */
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'session-board.cjs')

describe('INV-OPS-ADRES-1 · açılış satırında OPS adresi çıplak adla yazılı', () => {
  it('startup açılışında filo bölümü to="OPS" der ve ref/local_ kimliğini hafızaya yazmayı yasaklar', () => {
    const tmp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'arc122-'))
    try {
      const r = spawnSync(process.execPath, [KANCA], {
        input: JSON.stringify({
          session_id: '5a1c0122-0000-4000-8000-000000000122',
          cwd: tmp,
          source: 'startup',
          hook_event_name: 'SessionStart',
        }),
        env: process.env,
        encoding: 'utf8',
        windowsHide: true,
        timeout: 60_000,
      })
      expect(r.status, r.stderr).toBe(0)
      const cikti = String(r.stdout)
      expect(cikti, 'filo bölümünde OPS ADRESI satırı yok').toContain('OPS ADRESI')
      expect(cikti).toContain('to=\\"OPS\\"')
      expect(cikti).toMatch(/\[ref\]/)
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })
})
