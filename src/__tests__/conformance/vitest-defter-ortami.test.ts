import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-VITEST-DEFTER-1..3 · vitest'in Recep sözü defteri ortamı (ARC-21 / ARC-12b).
 *
 * KUSUR (2026-10-02 ölçüldü): vitest.setup.ts defteri SABİT adlı tek dosyaya yönlendiriyordu
 * (`tmpdir()/vitest-recep-sozu-defteri.jsonl`); dosya koşumlar arası kalıyordu (682 bayt, 4 satır) ve paralel koşular
 * (worktree'ler, ikinci vitest) aynı dosyayı paylaşıyordu. Bu kapı: dizin koşum başına BENZERSİZ, dışarıdan verilen yol
 * EZİLMEZ ve silinmez, temizlik gerçekten siler.
 */

interface Ortam {
  yol: string
  sahip: boolean
  temizle: () => void
}
interface Modul {
  hazirla: (env?: Record<string, string | undefined>, tmp?: string) => Ortam
  DIZIN_ON_EKI: string
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const { hazirla, DIZIN_ON_EKI } = require_(path.join(KOK, 'scripts/board/vitest-defter-ortami.cjs')) as Modul

function temizTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'vitest-defter-test-'))
}

describe('INV-VITEST-DEFTER-1 · koşum başına benzersiz dizin', () => {
  it('iki hazırlık iki FARKLI dizin açar ve yol env\'e yazılır', () => {
    const tmp = temizTmp()
    const env1: Record<string, string | undefined> = {}
    const env2: Record<string, string | undefined> = {}
    const a = hazirla(env1, tmp)
    const b = hazirla(env2, tmp)
    try {
      expect(a.yol).not.toBe(b.yol)
      expect(path.dirname(a.yol)).not.toBe(path.dirname(b.yol))
      expect(env1.VENTHUB_RECEP_DEFTER).toBe(a.yol)
      expect(path.basename(path.dirname(a.yol)).startsWith(DIZIN_ON_EKI)).toBe(true)
      expect(fs.statSync(path.dirname(a.yol)).isDirectory()).toBe(true)
      expect(a.sahip).toBe(true)
    } finally {
      a.temizle()
      b.temizle()
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })

  it('bu vitest koşumunun kendi defteri SABİT eski ada işaret etmez', () => {
    const yol = process.env.VENTHUB_RECEP_DEFTER ?? ''
    expect(yol).not.toBe('')
    expect(path.basename(yol)).not.toBe('vitest-recep-sozu-defteri.jsonl')
    expect(yol.startsWith(os.tmpdir()) || yol.includes('vitest')).toBe(true)
  })
})

describe('INV-VITEST-DEFTER-2 · dışarıdan verilen yol ezilmez ve silinmez', () => {
  it('env\'de yol varsa aynen döner, dizin açılmaz, temizle hiçbir şey silmez', () => {
    const tmp = temizTmp()
    const dosya = path.join(tmp, 'kendi-defterim.jsonl')
    fs.writeFileSync(dosya, 'x\n')
    const env: Record<string, string | undefined> = { VENTHUB_RECEP_DEFTER: dosya }
    const once = fs.readdirSync(tmp)
    const o = hazirla(env, tmp)
    try {
      expect(o.yol).toBe(dosya)
      expect(o.sahip).toBe(false)
      expect(env.VENTHUB_RECEP_DEFTER).toBe(dosya)
      expect(fs.readdirSync(tmp)).toEqual(once)
      o.temizle()
      expect(fs.existsSync(dosya)).toBe(true)
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })
})

describe('INV-VITEST-DEFTER-3 · temizlik', () => {
  it('temizle dizini içindeki dosyayla birlikte siler; ikinci çağrı ve olmayan dizin hata vermez', () => {
    const tmp = temizTmp()
    const o = hazirla({}, tmp)
    try {
      fs.writeFileSync(o.yol, '{"a":1}\n')
      expect(fs.existsSync(o.yol)).toBe(true)
      o.temizle()
      expect(fs.existsSync(path.dirname(o.yol))).toBe(false)
      expect(() => o.temizle()).not.toThrow()
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })

  it('vitest.setup.ts ve global kurulum: sabit ad kalmadı, globalSetup config\'de ve helper\'ı çağırıyor', () => {
    const setup = fs.readFileSync(path.join(KOK, 'vitest.setup.ts'), 'utf8')
    const global = fs.readFileSync(path.join(KOK, 'vitest.global-setup.ts'), 'utf8')
    const config = fs.readFileSync(path.join(KOK, 'vitest.config.ts'), 'utf8')
    expect(setup).not.toMatch(/vitest-recep-sozu-defteri\.jsonl'\)/)
    expect(setup).toMatch(/randomUUID\(\)/)
    expect(global).toMatch(/vitest-defter-ortami\.cjs/)
    expect(global).toMatch(/temizle\(\)/)
    expect(config).toMatch(/globalSetup:\s*\[\s*'vitest\.global-setup\.ts'\s*\]/)
  })
})
