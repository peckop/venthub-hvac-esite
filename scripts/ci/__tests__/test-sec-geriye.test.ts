import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-SEC-GERIYE-1 · geriye dönük doğrulamanın SAYIM MANTIĞI (scripts/ci/test-sec-geriye.cjs, karar 308 B4).
 *
 * Bu betik "kaçırılan = 0" iddiasını üretir; sayımı yanlışsa iddia boştur. Ölçülen: bir koşu TEK kategoriye girer (öncelik sabit); yalnız ASIL kategorideki
 * `KACIRILDI` kaçırma sayısına girer (ayrı kategoriler AYRI sayılır ve kaçırma sayısına KARIŞMAZ); özet kaçırılanları adlarıyla verir; B4 girdi biçimi
 * (kırılan test dizgesi, değişen dosya dizgesi ya da { filename, status, previous_filename } kaydı) doğru çözülür; PR türü sınıflaması belge-yalnız,
 * küresel, kod ve diğerini ayırır. `gh`/`git`/`vitest` çağrısı yoktur (saf yardımcılar).
 */

type Satir = { kategori: string; durum?: string; kacirilan?: string[]; runId?: number; attempt?: number; prNo?: number | null; dal?: string; tur?: string }
type Ozet = {
  tur: string
  kosu: number
  asil: { toplam: number; secildi: number; tam: number; kacirildi: number; olculemedi: number }
  ayri: Record<string, { toplam: number; kacirildi: number }>
  kacirilanlar: Array<{ runId?: number; kacirilan?: string[] }>
  ayriKacirilanlar: Array<{ kategori: string; kacirilan?: string[] }>
}
type Kayit = { event?: string; testAyiklanamadi?: boolean; dalDeneme?: boolean; sonradanYesilAyniCommit?: boolean; kirilanTestDosyalari?: unknown[] }
type Geriye = {
  kategori: (k: Kayit) => string
  kirilanTestler: (k: Kayit) => string[]
  ozetKur: (satirlar: Satir[]) => Ozet
  dosyaKumeleri: (kayitlar: unknown[]) => { degisen: string[]; silinen: Set<string> }
  prTuru: (degisen: string[]) => string
}

const require_ = createRequire(import.meta.url)
const G = require_(path.resolve(__dirname, '../test-sec-geriye.cjs')) as Geriye

const TEST = 'src/__tests__/conformance/x.test.ts'

describe('INV-TEST-SEC-GERIYE-1 · kategori önceliği (bir koşu TEK kategoriye girer)', () => {
  it('normal PR koşusu ASIL', () => {
    expect(G.kategori({ event: 'pull_request', kirilanTestDosyalari: [TEST] })).toBe('ASIL')
    expect(G.kategori({ kirilanTestDosyalari: [TEST] })).toBe('ASIL')
  })
  it.each([
    ['test dosyası ayıklanamadı', { testAyiklanamadi: true, kirilanTestDosyalari: [] }, 'TEST-AYIKLANAMADI'],
    ['kırılan test listesi boş (kırmızı adım Test değil)', { event: 'pull_request', kirilanTestDosyalari: [] }, 'TEST-YOK'],
    ['dal denemesi', { event: 'pull_request', dalDeneme: true, kirilanTestDosyalari: [TEST] }, 'DAL-DENEME'],
    ['aynı commit sonradan yeşile döndü', { event: 'pull_request', sonradanYesilAyniCommit: true, kirilanTestDosyalari: [TEST] }, 'SONRADAN-YESIL'],
    ['PR olmayan olay (push)', { event: 'push', kirilanTestDosyalari: [TEST] }, 'PR-DISI'],
    ['PR olmayan olay (workflow_dispatch)', { event: 'workflow_dispatch', kirilanTestDosyalari: [TEST] }, 'PR-DISI'],
  ] as const)('%s → %s', (_ad, kayit, beklenen) => {
    expect(G.kategori(kayit as Kayit)).toBe(beklenen)
  })
  it('öncelik: ayıklanamadı > test yok > PR dışı > dal denemesi > sonradan yeşil', () => {
    expect(G.kategori({ testAyiklanamadi: true, dalDeneme: true, sonradanYesilAyniCommit: true, event: 'push' })).toBe('TEST-AYIKLANAMADI')
    expect(G.kategori({ dalDeneme: true, sonradanYesilAyniCommit: true, event: 'push', kirilanTestDosyalari: [TEST] })).toBe('PR-DISI')
    expect(G.kategori({ dalDeneme: true, sonradanYesilAyniCommit: true, event: 'pull_request', kirilanTestDosyalari: [TEST] })).toBe('DAL-DENEME')
  })
  it('kırılan test dosyaları: dizge, { dosya | file } kaydı, ters bölü, yinelenen ve boş eleman temizlenir, sıralanır', () => {
    expect(G.kirilanTestler({ kirilanTestDosyalari: ['b.test.ts', { dosya: 'a.test.ts' }, { file: 'c\\d.test.ts' }, 'b.test.ts', '', null, 5] })).toEqual(['a.test.ts', 'b.test.ts', 'c/d.test.ts'])
    expect(G.kirilanTestler({})).toEqual([])
  })
})

describe('INV-TEST-SEC-GERIYE-1 · özet: kaçırma yalnız ASIL kategoriden; ayrı kategoriler AYRI sayılır', () => {
  const satirlar: Satir[] = [
    { kategori: 'ASIL', durum: 'SECILDI', runId: 1, kacirilan: [] },
    { kategori: 'ASIL', durum: 'TAM', runId: 2, kacirilan: [] },
    { kategori: 'ASIL', durum: 'KACIRILDI', runId: 3, attempt: 1, prNo: 77, dal: 'x/y', kacirilan: [TEST] },
    { kategori: 'ASIL', durum: 'OLCULEMEDI', runId: 4, kacirilan: [] },
    { kategori: 'DAL-DENEME', durum: 'KACIRILDI', runId: 5, kacirilan: [TEST] },
    { kategori: 'SONRADAN-YESIL', durum: 'SECILDI', runId: 6, kacirilan: [] },
    { kategori: 'TEST-AYIKLANAMADI', runId: 7 },
    { kategori: 'TEST-YOK', runId: 8 },
    { kategori: 'PR-DISI', durum: 'KACIRILDI', runId: 9, kacirilan: [TEST, 'b.test.ts'] },
  ]
  it('ASIL sayıları ve kaçırılan listesi', () => {
    const o = G.ozetKur(satirlar)
    expect(o.tur).toBe('OZET')
    expect(o.kosu).toBe(9)
    expect(o.asil).toEqual({ toplam: 4, secildi: 1, tam: 1, kacirildi: 1, olculemedi: 1 })
    expect(o.kacirilanlar).toEqual([{ runId: 3, attempt: 1, prNo: 77, dal: 'x/y', kacirilan: [TEST] }])
  })
  it('ayrı kategorilerin kaçırmaları kaçırma sayısına KARIŞMAZ; ayrı listede bilgi olarak görünür', () => {
    const o = G.ozetKur(satirlar)
    expect(o.ayri['DAL-DENEME']).toEqual({ toplam: 1, kacirildi: 1 })
    expect(o.ayri['PR-DISI']).toEqual({ toplam: 1, kacirildi: 1 })
    expect(o.ayri['SONRADAN-YESIL']).toEqual({ toplam: 1, kacirildi: 0 })
    expect(o.ayri['TEST-AYIKLANAMADI']).toEqual({ toplam: 1, kacirildi: 0 })
    expect(o.ayri['TEST-YOK']).toEqual({ toplam: 1, kacirildi: 0 })
    expect(o.ayriKacirilanlar.map((x) => x.kategori).sort()).toEqual(['DAL-DENEME', 'PR-DISI'])
    expect(o.asil.kacirildi).toBe(1)
  })
  it('hiç kaçırma yoksa kacirilanlar boş, asil.kacirildi 0', () => {
    const o = G.ozetKur([{ kategori: 'ASIL', durum: 'SECILDI', kacirilan: [] }, { kategori: 'DAL-DENEME', durum: 'KACIRILDI', kacirilan: [TEST] }])
    expect(o.asil.kacirildi).toBe(0)
    expect(o.kacirilanlar).toEqual([])
  })
  it('OZET satırının kendisi ve boş girdi sayıma girmez', () => {
    const o = G.ozetKur([{ kategori: 'ASIL', durum: 'KACIRILDI', kacirilan: [TEST] }, { kategori: 'OZET', tur: 'OZET' }])
    expect(o.kosu).toBe(1)
    expect(o.asil.kacirildi).toBe(1)
    expect(G.ozetKur([]).kosu).toBe(0)
  })
})

describe('INV-TEST-SEC-GERIYE-1 · değişen dosya kayıtları ve PR türü', () => {
  it('dizge, { filename | dosya | yol | path } kaydı, durum (removed | silindi | deleted) ve taşıma (eski yol silinmiş sayılır)', () => {
    const k = G.dosyaKumeleri([
      'docs/a.md',
      'docs\\b.md',
      { filename: 'src/x.ts', status: 'modified' },
      { filename: 'src/y.ts', status: 'removed' },
      { dosya: 'src/z.ts', durum: 'silindi' },
      { filename: 'src/yeni.ts', status: 'renamed', previous_filename: 'src/eski.ts' },
      { path: 'p/q.ts' },
      null,
      7,
      { filename: 5 },
    ])
    expect(k.degisen).toEqual(['docs/a.md', 'docs/b.md', 'p/q.ts', 'src/eski.ts', 'src/x.ts', 'src/y.ts', 'src/yeni.ts', 'src/z.ts'])
    expect([...k.silinen].sort()).toEqual(['src/eski.ts', 'src/y.ts', 'src/z.ts'])
    expect(G.dosyaKumeleri([]).degisen).toEqual([])
  })
  it.each([
    [['docs/a.md', 'docs/b/c.md', 'README.md', '.claude/skills/x/SKILL.md'], 'belge'],
    [['docs/a.md', 'src/lib/x.ts'], 'kod'],
    [['src/lib/x.ts'], 'kod'],
    [['package.json', 'src/x.ts'], 'kuresel'],
    [['supabase/migrations/20260101000000_x.sql', 'docs/a.md'], 'kuresel'],
    [['scripts/ci/a.cjs'], 'kuresel'],
    [['scripts/seo/a.cjs'], 'diger'],
    [['supabase/functions/x/index.ts'], 'diger'],
    [['LICENSE'], 'diger'],
  ] as const)('%j → %s', (degisen, beklenen) => {
    expect(G.prTuru([...degisen])).toBe(beklenen)
  })
})
