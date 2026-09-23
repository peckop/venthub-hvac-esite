/**
 * INV-PIM-YEDEK-1 (REC-357 §7, karar 36 şartı): UnoPim yedek betiğinin ölçülmüş güvenceleri geri gitmesin.
 * Docker isteyen asıl koşum (al + dene) elle yapılır; burada betiğin kendini koruyan üç sözleşmesi kilitlenir:
 *   1. Yedek sır taşır → hedef bir git deposunun içindeyse reddedilir (repo PUBLIC).
 *   2. Şifreleme anahtarı (`.app_key`) tarda yoksa `al` durur (2026-09-23 sabotajı: anahtarsız yedek
 *      geri kurulunca anahtar YENİDEN ÜRETİLDİ, ürünler yine 12/12 göründü — sayı kontrolü bunu görmez).
 *   3. `down -v` (birim silme) yalnız sabit deneme projesine uygulanır, asıl kuruluma asla.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const BETIK = path.resolve(__dirname, '../../../scripts/pim/unopim-yedek.cjs')
const { hedefDepoIcindeMi, DENEME_PROJE, KAYNAK_PROJE } = require(BETIK) as {
  hedefDepoIcindeMi: (d: string) => boolean
  DENEME_PROJE: string
  KAYNAK_PROJE: string
}
const kaynak = fs.readFileSync(BETIK, 'utf8')

describe('INV-PIM-YEDEK-1 yedek betiği', () => {
  it('depo içindeki hedef reddedilir, depo dışı kabul edilir', () => {
    expect(hedefDepoIcindeMi(path.resolve(__dirname, 'yedek-buraya'))).toBe(true)
    const dis = fs.mkdtempSync(path.join(os.tmpdir(), 'pim-yedek-test-'))
    expect(hedefDepoIcindeMi(dis)).toBe(false)
    // sabotaj kolu: dış dizine .git konunca aynı dizin reddedilir
    fs.mkdirSync(path.join(dis, '.git'))
    expect(hedefDepoIcindeMi(path.join(dis, 'alt'))).toBe(true)
    fs.rmSync(dis, { recursive: true, force: true })
  })

  it('al: .app_key tarda yoksa durur', () => {
    expect(kaynak).toMatch(/ANAHTAR_TAR_YOLU = '\.\/app\/private\/\.app_key'/)
    expect(kaynak).toMatch(/if \(!icerik\.includes\(ANAHTAR_TAR_YOLU\)\) throw/)
  })

  it('dene: anahtar yeniden üretildiyse KIRMIZI (sayı eşitliği yetmez)', () => {
    expect(kaynak).toMatch(/APP_KEY not set/)
    expect(kaynak).toMatch(/const tamam = [^\n]*&& !yeniAnahtar/)
  })

  it('makine dışına giden paket şifreli (AES-256-GCM, etiket doğrulamalı) ve anahtar yedeğin içinde olamaz', () => {
    expect(kaynak).toMatch(/createCipheriv\('aes-256-gcm'/)
    expect(kaynak).toMatch(/setAuthTag\(/)
    expect(kaynak).toMatch(/şifre anahtarı yedek dizininin içinde olamaz/)
    // anahtar kontrolü yedek BAŞLAMADAN koşar (al'ın ilk işlerinden)
    const al = kaynak.slice(kaynak.indexOf('function al()'), kaynak.indexOf('function al()') + 600)
    expect(al.indexOf('sifreAnahtari(kok)')).toBeGreaterThan(-1)
    expect(al.indexOf('sifreAnahtari(kok)')).toBeLessThan(al.indexOf('pg_dump'))
  })

  it('down -v yalnız sabit deneme projesine — asıl kurulum adı hiçbir down komutunda geçmez', () => {
    expect(DENEME_PROJE).toBe('pim-geri')
    expect(DENEME_PROJE).not.toBe(KAYNAK_PROJE)
    const downSatirlari = kaynak.split('\n').filter((s) => s.includes("'down'"))
    expect(downSatirlari.length).toBeGreaterThan(0)
    for (const s of downSatirlari) {
      expect(s).toContain('DENEME_PROJE')
      expect(s).not.toContain('KAYNAK_PROJE')
    }
  })
})
