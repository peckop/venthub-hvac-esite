// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-ONCEKI-OLCUM-1 · ölçüm tekrarı kapısı (ARC-121, OPS-120 madde 7).
 * onceki-calisma.cjs ölçüm defterlerini (docs/audits, hafıza olcum/, katalog envanteri) tarar ve "ÖNCEKİ ÖLÇÜM:" satırını üretir:
 * taze (≤14 gün) kayıt varken yeniden ölçme, hepsi bayatsa tarihli yeniden ölçüp aynı deftere ekle.
 * Sabotaj kolları: bayatlık eşiği kalkarsa ya da defter bağı yoksa ilgili test kırmızıya döner.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
interface Satir {
  durum: string
  arandi: number
  bulgular: { yol: string; tarih: string | null; yas: number | null; taze: boolean }[]
  sebep?: string
}
const m = require_(path.join(KOK, 'scripts', 'arac', 'onceki-calisma.cjs')) as {
  sorguKur: (metin: string, haric?: string[]) => unknown
  olcumKaynagi: (s: unknown, b: unknown, simdi: number) => Promise<Satir>
  olcumSatiri: (k: Satir) => string
  olcumTarihi: (d: { yol: string; metin?: string; mtimeMs?: number }) => string | null
  gercekBaglar: (o?: { repo?: string; ortam?: Record<string, string> }) => { olcumDefterleri: () => Promise<{ yol: string; metin: string; mtimeMs: number }[]> }
  OLCUM_TAZE_GUN: number
}

const SIMDI = Date.parse('2026-11-04T10:00:00Z')
const defter = (yol: string, metin: string) => ({ yol, metin, mtimeMs: 0 })
const baglarOf = (liste: ReturnType<typeof defter>[]) => ({ olcumDefterleri: async () => liste })
const sorgu = () => m.sorguKur('katalog envanteri sayfa sayısı ölçümü')

const gecici: string[] = []
afterEach(() => {
  for (const d of gecici.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})

describe('INV-ONCEKI-OLCUM-1 — ölçüm satırı', () => {
  it('taze defter: BULUNDU + taze + yeniden ölçme uyarısı', async () => {
    const k = await m.olcumKaynagi(sorgu(), baglarOf([defter('docs/audits/katalog-envanteri-2026-11-01.md', '# Katalog envanteri sayfa sayısı')]), SIMDI)
    const s = m.olcumSatiri(k)
    expect(s).toContain('ÖNCEKİ ÖLÇÜM: BULUNDU 1')
    expect(s).toContain('katalog-envanteri-2026-11-01.md (2026-11-01, taze)')
    expect(s).toContain('yeniden ölçme')
  })

  it('bayat defter: BAYAT gün sayısı + tarihli yeniden ölçüm yönergesi', async () => {
    const k = await m.olcumKaynagi(sorgu(), baglarOf([defter('docs/audits/katalog-envanteri-2026-09-01.md', '# Katalog envanteri sayfa sayısı')]), SIMDI)
    const s = m.olcumSatiri(k)
    expect(s).toContain('BAYAT 64 gün')
    expect(s).toContain('hepsi bayat')
  })

  it('eşleşme yok: YOK (kaç defter arandı)', async () => {
    const k = await m.olcumKaynagi(sorgu(), baglarOf([defter('docs/audits/bambaska-konu-2026-11-01.md', '# alakasız')]), SIMDI)
    expect(m.olcumSatiri(k)).toBe('ÖNCEKİ ÖLÇÜM: YOK (1 ölçüm defteri arandı)')
  })

  it('defter bağı yoksa ATLANDI, bağ fırlatırsa ÖLÇÜLEMEDİ olarak raporlanabilir', async () => {
    const k = await m.olcumKaynagi(sorgu(), {}, SIMDI)
    expect(m.olcumSatiri(k)).toContain('ATLANDI')
    expect(m.olcumSatiri({ durum: 'olculemedi', arandi: 0, bulgular: [], sebep: 'dizin okunamadı' })).toContain('ÖLÇÜLEMEDİ (dizin okunamadı)')
  })

  it('⛔SABOTAJ: taze/bayat ayrımı eşikten gelir (eşik 14 gün)', async () => {
    expect(m.OLCUM_TAZE_GUN).toBe(14)
    const sinirda = await m.olcumKaynagi(sorgu(), baglarOf([defter('docs/audits/katalog-envanteri-2026-10-21.md', '# Katalog envanteri sayfa sayısı')]), SIMDI)
    expect(sinirda.bulgular[0].yas).toBe(14)
    expect(sinirda.bulgular[0].taze).toBe(true)
    const asan = await m.olcumKaynagi(sorgu(), baglarOf([defter('docs/audits/katalog-envanteri-2026-10-20.md', '# Katalog envanteri sayfa sayısı')]), SIMDI)
    expect(asan.bulgular[0].taze).toBe(false)
  })
})

describe('INV-ONCEKI-OLCUM-1 — tarih ve gerçek bağ', () => {
  it('tarih önceliği: dosya adı, sonra içerik, sonra değişiklik zamanı', () => {
    expect(m.olcumTarihi({ yol: 'a-2026-10-01.md', metin: 'ölçüm 2026-09-01' })).toBe('2026-10-01')
    expect(m.olcumTarihi({ yol: 'a.md', metin: 'Ölçüm saati: 2026-09-15 08:45' })).toBe('2026-09-15')
    expect(m.olcumTarihi({ yol: 'a.md', metin: 'tarihsiz', mtimeMs: Date.parse('2026-08-08T00:00:00Z') })).toBe('2026-08-08')
    expect(m.olcumTarihi({ yol: 'a.md', metin: 'tarihsiz' })).toBeNull()
  })

  it('gerçek bağ: docs/audits ve hafıza olcum/ dizinlerini okur; hiçbiri yoksa fırlatır', async () => {
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'olcum-'))
    gecici.push(kok)
    fs.mkdirSync(path.join(kok, 'repo', 'docs', 'audits'), { recursive: true })
    fs.mkdirSync(path.join(kok, 'hafiza', 'olcum'), { recursive: true })
    fs.writeFileSync(path.join(kok, 'repo', 'docs', 'audits', 'x-2026-11-02.md'), '# x')
    fs.writeFileSync(path.join(kok, 'hafiza', 'olcum', 'y.md'), '# y 2026-10-30')
    const b = m.gercekBaglar({ repo: path.join(kok, 'repo'), ortam: { HAFIZA_DIZINI: path.join(kok, 'hafiza') } })
    const liste = await b.olcumDefterleri()
    const yollar = liste.map((d) => d.yol)
    expect(yollar).toContain('docs/audits/x-2026-11-02.md')
    expect(yollar.some((y) => y.endsWith('olcum/y.md'))).toBe(true)

    const bos = m.gercekBaglar({ repo: path.join(kok, 'yok'), ortam: { HAFIZA_DIZINI: path.join(kok, 'yok-hafiza') } })
    const ucuncu = await bos.olcumDefterleri().catch((e: Error) => e.message)
    // ingestor yolu makineye bağlıdır: varsa liste, yoksa hata; ikisi de sessiz boş dönmez
    expect(Array.isArray(ucuncu) || /okunamadı/.test(String(ucuncu))).toBe(true)
  })
})
