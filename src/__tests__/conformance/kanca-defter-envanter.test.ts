// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-DEFTER-ENVANTER-1 · "2 Envanter" bloğu kaynak izine göre ölçülür (ARC-291 PR 2).
 * Sabotaj kolları: iz üretilemedi ≠ değişmedi; iz değişti + yeni sonuç yok = bekliyor; aynı güne ait belge tarihi yeni ölçüm sayılmaz.
 */
const req = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const E = req(path.join(KOK, 'scripts/hijyen/defter-envanter.cjs')) as {
  degerlendir: (k: unknown, onceki: unknown, simdi?: string) => { durum: string; ozet: string; tarih: string; yeniKayit: unknown }
  blok: (s: { ad: string; ozet: string; tarih: string; durum: string }[], t: string) => string
  metniYaz: (m: string, y: string) => string | null
  olc: (k: unknown[], onceki: Record<string, unknown>) => { satirlar: { durum: string }[]; yeni: Record<string, unknown> | null }
  durumOku: (yol: string) => Record<string, unknown>
  durumYaz: (d: unknown, yol: string) => void
}

const SONUC = { ozet: '1165 üründe fark 0', tarih: '2026-11-05T10:00:00.000Z' }
const kaynak = (iz: string | null, sonuc: { ozet: string; tarih: string } | null = SONUC) => ({ ad: 'k', iz: () => iz, sonuc: () => sonuc })
const SIMDI = '2026-11-09T12:00:00.000Z'

describe('INV-DEFTER-ENVANTER-1 · değerlendirme', () => {
  it('ilk koşu: iz kaydedilir, ölçüldü', () => {
    const r = E.degerlendir(kaynak('aaa'), undefined, SIMDI)
    expect(r.durum).toBe('olculdu')
    expect(r.yeniKayit).toEqual({ iz: 'aaa', izZamani: SIMDI })
  })
  it('iz aynı → kaynak değişmedi, ölçüm koşmaz, kayıt değişmez (bayat sayılmaz)', () => {
    const onceki = { iz: 'aaa', izZamani: '2026-11-05T09:00:00.000Z' }
    const r = E.degerlendir(kaynak('aaa'), onceki, SIMDI)
    expect(r.durum).toBe('degismedi')
    expect(r.yeniKayit).toBe(onceki)
    expect(E.blok([{ ad: 'k', ...r }], '2026-11-09')).toContain('kaynak değişmedi — son ölçüm 2026-11-05')
  })
  it('sabotaj: iz ÜRETİLEMEDİ asla "değişmedi" olmaz', () => {
    const onceki = { iz: 'aaa', izZamani: '2026-11-05T09:00:00.000Z' }
    const r = E.degerlendir(kaynak(null), onceki, SIMDI)
    expect(r.durum).toBe('olculemedi')
    expect(r.yeniKayit).toBe(onceki)
    expect(E.blok([{ ad: 'k', ...r }], '2026-11-09')).toContain('ölçülemedi')
  })
  it('sabotaj (E2): DEĞİŞİMDEN ÖNCE üretilmiş sonuç yeni ölçüm sayılmaz; değişim anı ilk görülünce kaydedilir', () => {
    const onceki = { iz: 'aaa', izZamani: '2026-11-05T09:00:00.000Z' }
    const r = E.degerlendir(kaynak('bbb', { ozet: 'eski', tarih: '2026-11-07T10:00:00.000Z' }), onceki, SIMDI)
    expect(r.durum).toBe('degisti-bekliyor')
    expect(r.yeniKayit).toEqual({ ...onceki, gorulenIz: 'bbb', degisimZamani: SIMDI })
  })
  it('değişim anı aynı iz sürdükçe SABİT kalır (her koşuda ileri kaymaz)', () => {
    const onceki = { iz: 'aaa', izZamani: '2026-11-01T09:00:00.000Z', gorulenIz: 'bbb', degisimZamani: '2026-11-06T09:00:00.000Z' }
    const r = E.degerlendir(kaynak('bbb', { ozet: 'eski', tarih: '2026-11-05T10:00:00.000Z' }), onceki, SIMDI)
    expect(r.durum).toBe('degisti-bekliyor')
    expect((r.yeniKayit as { degisimZamani: string }).degisimZamani).toBe('2026-11-06T09:00:00.000Z')
  })
  it('değişimden SONRA üretilmiş sonuç var → ölçüldü, kayıt ilerler ve değişim izi temizlenir', () => {
    const onceki = { iz: 'aaa', izZamani: '2026-11-01T09:00:00.000Z', gorulenIz: 'bbb', degisimZamani: '2026-11-06T09:00:00.000Z' }
    const r = E.degerlendir(kaynak('bbb', { ozet: 'fark 3', tarih: '2026-11-08T10:00:00.000Z' }), onceki, SIMDI)
    expect(r.durum).toBe('olculdu')
    expect(r.yeniKayit).toEqual({ iz: 'bbb', izZamani: SIMDI })
  })
  it('sabotaj: değişimle AYNI güne ait belge tarihi (yalnız gün) yeni ölçüm sayılmaz', () => {
    const onceki = { iz: 'aaa', izZamani: '2026-11-01T09:00:00.000Z', gorulenIz: 'bbb', degisimZamani: '2026-11-09T08:00:00.000Z' }
    expect(E.degerlendir(kaynak('bbb', { ozet: 'x', tarih: '2026-11-09' }), onceki, SIMDI).durum).toBe('degisti-bekliyor')
    expect(E.degerlendir(kaynak('bbb', { ozet: 'x', tarih: '2026-11-10' }), onceki, SIMDI).durum).toBe('olculdu')
  })
  it('sonuç okunamazsa uydurma yok', () => {
    const r = E.degerlendir(kaynak('aaa', null), undefined, SIMDI)
    expect(r.durum).toBe('olculemedi')
    expect(r.ozet).toContain('ölçülemedi')
  })
  it('izsiz kaynak (dizin) her koşuda sonucu okur', () => {
    const k = { ad: 'd', iz: null, sonuc: () => ({ ozet: 'TUTARLI', tarih: '2026-11-09' }) }
    expect(E.degerlendir(k, undefined, SIMDI).durum).toBe('olculdu')
  })
})

describe('INV-DEFTER-ENVANTER-1 · yazma', () => {
  const metin = '# D\n\n## 1 Ne yaptık\n\nx\n\n## 2 Envanter\n\nelle satır\n\n## 3 Sırada\n'
  const y = E.blok([{ ad: 'a', ozet: 'o', tarih: '2026-11-09', durum: 'olculdu' }], '2026-11-09')
  it('başlığın altına ekler, elle satıra dokunmaz, ikinci yazım çoğaltmaz, CRLF korunur', () => {
    const bir = E.metniYaz(metin.replace(/\n/g, '\r\n'), y) as string
    expect(bir).toContain('elle satır')
    expect(bir.match(/DEFTER-OLCUM:envanter BASLA/g)).toHaveLength(1)
    expect(E.metniYaz(bir, y)).toBe(bir)
    expect(bir.replace(/\r\n/g, '').includes('\n')).toBe(false)
  })
  it('"2 Envanter" başlığı yoksa yazmaz (null)', () => {
    expect(E.metniYaz('# boş\n', y)).toBeNull()
  })
  it('sabotaj (U1): bozuk durum dosyası sahte "ölçüldü" üretmez; yok olan dosya ilk koşudur', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'de-durum-'))
    try {
      const yol = path.join(dizin, 'durum.json')
      expect(E.durumOku(yol)).toEqual({})
      fs.writeFileSync(yol, '{yarım')
      const bozuk = E.durumOku(yol)
      expect(bozuk.__bozuk).toBe(true)
      const r = E.olc([kaynak('aaa'), { ad: 'dizin', iz: null, sonuc: () => SONUC }], bozuk)
      expect(r.satirlar.map((s) => s.durum)).toEqual(['olculemedi', 'olculdu'])
      expect(r.yeni).toBeNull()
      fs.writeFileSync(yol, '[1,2]')
      expect(E.durumOku(yol).__bozuk).toBe(true)
    } finally {
      fs.rmSync(dizin, { recursive: true, force: true })
    }
  })
  it('durum yazımı atomik: geçici dosya kalmaz, geri okunur', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'de-durum-'))
    try {
      const yol = path.join(dizin, 'alt', 'durum.json')
      E.durumYaz({ k: { iz: 'aaa' } }, yol)
      expect(E.durumOku(yol)).toEqual({ k: { iz: 'aaa' } })
      expect(fs.readdirSync(path.dirname(yol))).toEqual(['durum.json'])
    } finally {
      fs.rmSync(dizin, { recursive: true, force: true })
    }
  })
  it('olc: ölçülemeyen kaynak durumu bozmaz', () => {
    const r = E.olc([kaynak(null)], { k: { iz: 'aaa', izZamani: '2026-11-05T00:00:00.000Z' } })
    expect(r.satirlar[0].durum).toBe('olculemedi')
    expect(r.yeni?.k).toEqual({ iz: 'aaa', izZamani: '2026-11-05T00:00:00.000Z' })
  })
})
