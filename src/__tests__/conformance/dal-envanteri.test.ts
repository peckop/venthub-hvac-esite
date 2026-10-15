// @vitest-environment node
//
// Betik saf Node'dur; DOM ortamı yalnız maliyettir.
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-DAL-ENVANTER-1 — `scripts/hijyen/dal-envanteri.cjs` sınıflayıcısı
 * Kart: ALT-62 (OPS-104 K-488). Betik SALT OKUMA: dal silmez, itmez, fetch etmez.
 *
 * NİÇİN VAR: "uzak dallar neden birikiyor" sorusu 10 Ekim'de bayat izleme referanslarıyla
 * (1136 --no-merged, yerelde 1199 ref) cevaplanmaya çalışıldı; canlı baş sayısı 558'di.
 * Sınıflayıcı yanlış çalışırsa silme kararı yanlış sayıya dayanır. Bu test sınıflayıcının
 * öncelik sırasını (açık PR > uç eşleşen birleşmiş > uç farklı birleşmiş > PR'sız) ve
 * "toplam = sınıf toplamı" kimliğini sentetik veriyle sabitler; gerçek depo verisine bağlanmaz.
 */

type Dal = { ad: string; sha: string }
type Pr = {
  number: number
  state: string
  headRefName: string
  headRefOid?: string
  isCrossRepository?: boolean
}
type Satir = {
  ad: string
  sha: string
  sinif: string
  prNo: number | null
  kapaliPr: boolean
  masterAtasi: boolean | null
}
type Sonuc = {
  satirlar: Satir[]
  sayim: Record<string, number>
  toplam: number
  tutarli: boolean
}
type Modul = {
  lsRemoteAyristir: (metin: string) => Dal[]
  dallariSinifla: (
    dallar: Dal[],
    prler: Pr[],
    secenek?: { master?: string; atasi?: (sha: string) => boolean | null },
  ) => Sonuc
  SINIFLAR: string[]
}

const require = createRequire(import.meta.url)
const { lsRemoteAyristir, dallariSinifla, SINIFLAR } = require(
  path.join(process.cwd(), 'scripts', 'hijyen', 'dal-envanteri.cjs'),
) as Modul

const sha = (n: number): string => n.toString(16).padStart(40, '0')

describe('INV-DAL-ENVANTER-1 — dal sınıflayıcı', () => {
  it('lsRemoteAyristir: yalnız refs/heads satırlarını alır, gürültüyü atlar', () => {
    const metin = [
      `${sha(1)}\trefs/heads/master`,
      `${sha(2)}\trefs/heads/altyapi/alt-62-x`,
      `${sha(3)}\trefs/tags/v1`,
      'uyarı: bir şey',
      '',
    ].join('\n')
    expect(lsRemoteAyristir(metin)).toEqual([
      { ad: 'master', sha: sha(1) },
      { ad: 'altyapi/alt-62-x', sha: sha(2) },
    ])
  })

  it('sınıf önceliği: açık PR > uç eşleşen birleşmiş > uç farklı birleşmiş > PR\'sız; master hariç', () => {
    const dallar: Dal[] = [
      { ad: 'master', sha: sha(1) },
      { ad: 'acik', sha: sha(10) },
      { ad: 'esler', sha: sha(11) },
      { ad: 'farkli', sha: sha(12) },
      { ad: 'prsiz', sha: sha(13) },
      { ad: 'kapali-pr', sha: sha(14) },
      { ad: 'hem-acik-hem-birlesmis', sha: sha(15) },
    ]
    const prler: Pr[] = [
      { number: 1, state: 'OPEN', headRefName: 'acik', headRefOid: sha(10) },
      { number: 2, state: 'MERGED', headRefName: 'esler', headRefOid: sha(11) },
      { number: 3, state: 'MERGED', headRefName: 'farkli', headRefOid: sha(99) },
      { number: 4, state: 'CLOSED', headRefName: 'kapali-pr', headRefOid: sha(14) },
      { number: 5, state: 'MERGED', headRefName: 'hem-acik-hem-birlesmis', headRefOid: sha(15) },
      { number: 6, state: 'OPEN', headRefName: 'hem-acik-hem-birlesmis', headRefOid: sha(15) },
    ]
    const sonuc = dallariSinifla(dallar, prler)
    const sinif = Object.fromEntries(sonuc.satirlar.map((s) => [s.ad, s.sinif]))
    expect(sinif).toEqual({
      acik: 'ACIK_PR',
      esler: 'BIRLESMIS_UC_ESLESIR',
      farkli: 'BIRLESMIS_UC_FARKLI',
      prsiz: 'PRSIZ',
      'kapali-pr': 'PRSIZ',
      'hem-acik-hem-birlesmis': 'ACIK_PR',
    })
    expect(sonuc.toplam).toBe(6)
    expect(sonuc.tutarli).toBe(true)
    expect(sonuc.sayim).toEqual({ ACIK_PR: 2, BIRLESMIS_UC_ESLESIR: 1, BIRLESMIS_UC_FARKLI: 1, PRSIZ: 2 })
    // Kapatılmış-birleşmemiş PR'lı dal PR'sız sayılır ama işaretlenir.
    expect(sonuc.satirlar.find((s) => s.ad === 'kapali-pr')?.kapaliPr).toBe(true)
    expect(sonuc.satirlar.find((s) => s.ad === 'prsiz')?.kapaliPr).toBe(false)
  })

  it('fork PR\'ı aynı adı taşısa da bu dalın PR\'ı sayılmaz', () => {
    const sonuc = dallariSinifla(
      [{ ad: 'ortak-ad', sha: sha(20) }],
      [{ number: 7, state: 'MERGED', headRefName: 'ortak-ad', headRefOid: sha(20), isCrossRepository: true }],
    )
    expect(sonuc.satirlar[0].sinif).toBe('PRSIZ')
  })

  it('sınıf toplamı her zaman dal sayısına eşit ve master\'ın atası bilgisi sınıfı değiştirmez', () => {
    const dallar: Dal[] = Array.from({ length: 25 }, (_, i) => ({ ad: `d${i}`, sha: sha(100 + i) }))
    const prler: Pr[] = dallar
      .filter((_, i) => i % 3 === 0)
      .map((d, i) => ({ number: 100 + i, state: i % 2 === 0 ? 'MERGED' : 'OPEN', headRefName: d.ad, headRefOid: d.sha }))
    const atasiOlmadan = dallariSinifla(dallar, prler)
    const atasiIle = dallariSinifla(dallar, prler, { atasi: (s) => s.endsWith('0') })
    expect(atasiOlmadan.toplam).toBe(25)
    expect(SINIFLAR.reduce((a, s) => a + atasiOlmadan.sayim[s], 0)).toBe(25)
    expect(atasiIle.satirlar.map((s) => s.sinif)).toEqual(atasiOlmadan.satirlar.map((s) => s.sinif))
    expect(atasiOlmadan.satirlar.every((s) => s.masterAtasi === null)).toBe(true)
    expect(atasiIle.satirlar.some((s) => s.masterAtasi === true)).toBe(true)
  })
})
