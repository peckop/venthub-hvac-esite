/**
 * INV-ROL-1 — departman rol kartları (REC-426, tek plan REC-433 Faz 3 girdisi).
 *
 * NİÇİN VAR: her departmanın görevi, dosyaları, yetkisi ve Recep kapıları dağınıktı; yeni açılan
 * pencere rolünü yeniden öğreniyordu. Kartlar `scripts/belge/rol-karti-uret.cjs` ile üretilir;
 * ortak bloklar (Recep kapıları, iletişim, çalışma düzeni) tek yerde sabittir.
 *
 * Bu paket iki şeyi ölçer:
 *   1. AYIRT EDİCİLİK — `sorunlar()` bilerek bozulmuş kartlarda (kapı satırı silinmiş, boyut aşılmış,
 *      başlık eksik) SORUN bulur; bulmazsa kapı kördür.
 *   2. MANDAL — diskteki docs/roller/*.md üreticinin çıktısıyla bire bir aynı, her kart sınırın altında,
 *      ortak bloklar bütün kartlarda bire bir aynı.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Uretici = {
  uret: () => Record<string, string>
  sorunlar: (k: Record<string, string>) => string[]
  ROLLER: Record<string, unknown>
  KART_BAYT_SINIRI: number
  dosyaAdi: (ad: string) => string
}

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const uretici = require(path.join(KOK, 'scripts', 'belge', 'rol-karti-uret.cjs')) as Uretici
const BEKLENEN_ROLLER = ['OPS', 'ARAC', 'ALTYAPI', 'HARITA', 'URUN', 'ADMIN', 'KATALOG', 'GEO-SEO', 'BLOG', 'MARKA']

describe('INV-ROL-1 — rol kartı üreticisi ayırt edici', () => {
  const temiz = uretici.uret()

  it('temiz kart kümesinde sorun yok', () => {
    expect(uretici.sorunlar(temiz)).toEqual([])
  })

  it('Recep kapısı satırı silinen kartı yakalar', () => {
    const bozuk = { ...temiz, OPS: temiz.OPS.replace('2. Sır, anahtar ya da parola yazmak.\n', '') }
    expect(uretici.sorunlar(bozuk).some((s) => s.startsWith('OPS: ortak blok'))).toBe(true)
  })

  it('bayt sınırını aşan kartı yakalar', () => {
    const bozuk = { ...temiz, URUN: temiz.URUN + 'x'.repeat(uretici.KART_BAYT_SINIRI) }
    expect(uretici.sorunlar(bozuk).some((s) => s.includes('bayt'))).toBe(true)
  })

  it('başlığı eksik kartı yakalar', () => {
    const bozuk = { ...temiz, ADMIN: temiz.ADMIN.replace('## Yetki', '## Baska') }
    expect(uretici.sorunlar(bozuk).some((s) => s.includes('başlık eksik'))).toBe(true)
  })
})

describe('INV-ROL-1 — gerçek depoda mandal', () => {
  const uretilen = uretici.uret()

  it('beklenen on rolün hepsi var, fazlası yok', () => {
    expect(Object.keys(uretilen).sort()).toEqual([...BEKLENEN_ROLLER].sort())
  })

  it('docs/roller/*.md üreticinin çıktısıyla bire bir aynı (elle düzenleme yok)', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      const yol = path.join(KOK, 'docs', 'roller', uretici.dosyaAdi(ad))
      expect(fs.existsSync(yol), `${yol} yok — node scripts/belge/rol-karti-uret.cjs --yaz`).toBe(true)
      // Windows'ta git satır sonunu CRLF'ye çevirebilir; içerik karşılaştırması satır sonundan bağımsız.
      expect(fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n'), `${ad} kartı üreticiden sapmış`).toBe(metin)
    }
  })

  it('docs/roller/ içinde üreticinin bilmediği kart yok', () => {
    const disk = fs.readdirSync(path.join(KOK, 'docs', 'roller')).filter((f) => f.endsWith('.md'))
    const beklenen = Object.keys(uretilen).map((ad) => uretici.dosyaAdi(ad))
    expect(disk.sort()).toEqual(beklenen.sort())
  })

  it('her kart bayt sınırının altında', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(Buffer.byteLength(metin, 'utf8'), `${ad}`).toBeLessThanOrEqual(uretici.KART_BAYT_SINIRI)
    }
  })

  it('beş Recep kapısı her kartta bire bir aynı', () => {
    const blok = (m: string) => m.slice(m.indexOf('## Recep kapıları'), m.indexOf('## İletişim'))
    const ilki = blok(Object.values(uretilen)[0])
    expect(ilki.split('\n').filter((s) => /^[1-5]\. /.test(s))).toHaveLength(5)
    for (const [ad, metin] of Object.entries(uretilen)) expect(blok(metin), ad).toBe(ilki)
  })
})
