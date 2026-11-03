import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KAYNAKSIZ-HUKUM-1 · Kaynaksız hüküm uyarısı (ARC-112, OPS-120 madde 1).
 *
 * Ölçülmüş vaka (12 Ekim, 4 kez): Recep'e giden metinde ölçülmemiş olgu hükmü verildi, sonradan
 * yanlış çıktı. Kanca v1 bloklamaz; kaynaksız hükümde oturum başına bir kez systemMessage basar.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kaynaksiz-hukum-uyarisi.cjs')
const motor = require_(KANCA) as { kaynaksizHukumler: (m: string) => string[] }

describe('INV-KAYNAKSIZ-HUKUM-1 karar çekirdeği', () => {
  it('kaynaksız olgu hükmü yakalanır', () => {
    expect(motor.kaynaksizHukumler('Katalogda 3 model yok, Lineo yanlış.')).toHaveLength(1)
    expect(motor.kaynaksizHukumler('PR #2061 çalışmıyor.')).toHaveLength(1)
  })

  it('kaynaklı hüküm geçer: dosya:satır, komut, ölçüm fiili, saat, bilinmezlik', () => {
    expect(motor.kaynaksizHukumler('src/a.ts:42 satırında 3 model yok.')).toEqual([])
    expect(motor.kaynaksizHukumler('`gh pr view 2061` çıktısına göre PR çalışmıyor.')).toEqual([])
    expect(motor.kaynaksizHukumler('Ölçtüm: katalogda 3 model yok.')).toEqual([])
    expect(motor.kaynaksizHukumler('18:20 itibarıyla 2 PR çakışmada değil.')).toEqual([])
    expect(motor.kaynaksizHukumler('Bilmiyorum, bakıyorum: 3 model yok gibi.')).toEqual([])
  })

  it('bir önceki satırdaki kaynak sonraki satırı da kapsar', () => {
    expect(motor.kaynaksizHukumler('Ölçüm (`git grep`):\n3 dosyada satır yok.')).toEqual([])
  })

  it('somut izi olmayan, soru olan, liste numarası taşıyan ya da kod bloğundaki cümle hüküm sayılmaz', () => {
    expect(motor.kaynaksizHukumler('Bu yaklaşım doğru değil bence.')).toEqual([])
    expect(motor.kaynaksizHukumler('PR #12 bozuk mu?')).toEqual([])
    expect(motor.kaynaksizHukumler('**1.** Marka yazısının altı çizgisi sabit değil.')).toEqual([])
    expect(motor.kaynaksizHukumler('```\n3 dosya yok\n```')).toEqual([])
  })
})

function koş(metin: string, oturum: string, env: Record<string, string> = {}) {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'khu-'))
  const tp = path.join(dizin, 't.jsonl')
  const satirlar = [
    { type: 'user', message: { content: 'durum ne?' } },
    { type: 'assistant', message: { content: [{ type: 'text', text: metin }] } },
  ]
  fs.writeFileSync(tp, satirlar.map((s) => JSON.stringify(s)).join('\n') + '\n')
  const r = spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ transcript_path: tp, session_id: oturum }),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
  fs.rmSync(dizin, { recursive: true, force: true })
  return r
}

describe('INV-KAYNAKSIZ-HUKUM-1 süreç', () => {
  it('kaynaksız hükümde systemMessage basar, çıkış 0 (bloklamaz); aynı oturumda ikinci kez basmaz', () => {
    const oturum = 'khu-' + process.pid + '-' + Date.now()
    const r1 = koş('Katalogda 3 model yok.', oturum)
    expect(r1.status).toBe(0)
    expect(JSON.parse(r1.stdout).systemMessage).toContain('Kaynaksız olgu hükmü')
    const r2 = koş('Katalogda 3 model yok.', oturum)
    expect(r2.status).toBe(0)
    expect(r2.stdout).toBe('')
    fs.rmSync(path.join(os.tmpdir(), 'kaynaksiz-hukum-' + oturum), { force: true })
  })

  it('kaynaklı metinde sessiz; vana kapalıyken sessiz; bozuk stdin fail-open', () => {
    expect(koş('`gh pr list` çıktısı: 3 PR yok.', 'khu-k-' + Date.now()).stdout).toBe('')
    expect(koş('Katalogda 3 model yok.', 'khu-v-' + Date.now(), { KAYNAKSIZ_HUKUM_KAPALI: '1' }).stdout).toBe('')
    const r = spawnSync(process.execPath, [KANCA], { input: '{bozuk', encoding: 'utf8' })
    expect(r.status).toBe(0)
    expect(r.stderr).toContain('stdin okunamadi')
  })
})
