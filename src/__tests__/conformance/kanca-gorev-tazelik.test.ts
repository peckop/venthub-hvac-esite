/**
 * INV-KANCA-GOREV-TAZELIK-1 — düzenli görevin tazelik satırı: rol-gorevleri.json'daki "istem-tazelik" görevleri
 * eşiği aşınca TEK "⚠GÖREV" satırı verir, damga sayacı sıfırlar (ARC-216 A kolu, HRT-74).
 *
 * Çekirdek: scripts/hijyen/gorev-tazelik.cjs · damga: scripts/hijyen/gorev-damga.cjs · kanca: .claude/hooks/gorev-tazelik-satiri.cjs
 * SABOTAJ: eşik altı görev satır üretmez; damga sayacı sıfırlar; başka rolün damgası bu rolü kurtarmaz;
 * rol-gorevleri.json'daki kalıp bozulursa görev kaybolur (kalıp testle kilitli).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const ZMOD = path.join(KOK, 'scripts', 'hijyen', 'gorev-tazelik.cjs')
const DAMGA = path.join(KOK, 'scripts', 'hijyen', 'gorev-damga.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'gorev-tazelik-satiri.cjs')

interface Gorev {
  ad: string
  esik: number
}
interface Sonuc {
  ad: string
  esik: number
  gun: number
  baslangic: boolean
  bayat: boolean
}
interface Modul {
  gorevleriOku: (v: unknown) => Record<string, Gorev[]>
  degerlendir: (g: { gorevler: Gorev[]; rol: string; damgalar: Record<string, { ts: number; ilk?: boolean }>; simdi: number; dosyalar?: string[] }) => Sonuc[]
  satir: (rol: string, s: Sonuc[]) => string
  rolSatiri: (
    rol: string,
    kok: string,
    k?: { veri?: unknown; damgalar?: Record<string, { ts: number }>; simdi?: number; dosyalar?: string[]; yaz?: (ad: string) => void },
  ) => string
  damgaYaz: (ad: string, rol: string, simdi: number, dosya: string, ilk?: boolean) => void
  damgaOku: (dosya: string) => Record<string, { ts: number; ilk?: boolean }>
  artefaktZamani: (ad: string, d: string[]) => number | null
}
const z = gerek(ZMOD) as Modul
const GUN = 86400000
const T0 = Date.parse('2026-11-05T00:00:00Z')

const veri = {
  roller: {
    ARAC: {
      gorevler: [
        { gorev: 'Haftalık öz-değerlendirme', tetik: 'istem-tazelik', siklik: 'haftalik', tetikAyrinti: 'istem satırında "öz-değerlendirme: N gün" (7 gün eşik); satırı ARAÇ kuruyor' },
        { gorev: 'Olay görevi', tetik: 'istem-tazelik', siklik: 'olay', tetikAyrinti: 'Claude Code için istem satırı yok' },
        { gorev: 'Actions görevi', tetik: 'actions', siklik: 'aylik', tetikAyrinti: 'iş akışı' },
      ],
    },
    'GEO-SEO': {
      gorevler: [
        { gorev: 'Haftalık veri incelemesi', tetik: 'istem-tazelik', siklik: 'haftalik', tetikAyrinti: 'istem satırında "SEO haftalık: N gün" (7 gün eşik); satırı ARAÇ kuruyor' },
        { gorev: 'Haftalık öz-değerlendirme', tetik: 'istem-tazelik', siklik: 'haftalik', tetikAyrinti: 'istem satırında "öz-değerlendirme: N gün" (7 gün eşik)' },
      ],
    },
  },
}

let gecici = ''
beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'arc216-'))
})
afterAll(() => {
  fs.rmSync(gecici, { recursive: true, force: true })
})

describe('görev verisi ayrıştırma', () => {
  it('yalnız istem-tazelik + "N gün" kalıbı olan görev alınır (olay ve actions alınmaz)', () => {
    const g = z.gorevleriOku(veri)
    expect(g.ARAC).toEqual([{ ad: 'öz-değerlendirme', esik: 7 }])
    expect(g['GEO-SEO']).toEqual([
      { ad: 'SEO haftalık', esik: 7 },
      { ad: 'öz-değerlendirme', esik: 7 },
    ])
  })

  it('gerçek rol-gorevleri.json: 12 rolde öz-değerlendirme + SEO haftalık, katalog baskı, filo raporu, skill ölçümü', () => {
    const gercek = gerek(path.join(KOK, 'scripts', 'belge', 'rol-gorevleri.json'))
    const g = z.gorevleriOku(gercek)
    const adlar = Object.values(g).flat().map((x) => x.ad)
    expect(adlar.filter((a) => a === 'öz-değerlendirme').length).toBe(12)
    for (const a of ['SEO haftalık', 'katalog baskı', 'filo raporu', 'skill ölçümü']) expect(adlar).toContain(a)
    expect(g.KATALOG?.find((x) => x.ad === 'katalog baskı')?.esik).toBe(30)
  })
})

describe('değerlendirme ve satır', () => {
  const gorevler = [{ ad: 'öz-değerlendirme', esik: 7 }]
  const damga = (gun: number) => ({ 'öz-değerlendirme|ARAC': { ts: T0 - gun * GUN } })

  it('eşik altı sessiz, eşikte ve üstünde tek satır', () => {
    expect(z.satir('ARAC', z.degerlendir({ gorevler, rol: 'ARAC', damgalar: damga(6), simdi: T0 }))).toBe('')
    const s = z.satir('ARAC', z.degerlendir({ gorevler, rol: 'ARAC', damgalar: damga(7), simdi: T0 }))
    expect(s).toContain('⚠GÖREV (ARAC): öz-değerlendirme: 7 gün (eşik 7)')
    expect(s).toContain('gorev-damga.cjs "öz-değerlendirme" --rol ARAC')
  })

  it('SABOTAJ: başka rolün damgası bu rolü kurtarmaz', () => {
    const baskasi = { 'öz-değerlendirme|OPS': { ts: T0 } }
    const s = z.degerlendir({ gorevler, rol: 'ARAC', damgalar: baskasi, simdi: T0 + 30 * GUN })
    expect(s[0]?.bayat).toBe(false) // damgasız → ilk görülme sayılır (sayaç şimdi başlar), bayat değil
    expect(s[0]?.baslangic).toBe(true)
    const arac = z.degerlendir({ gorevler, rol: 'ARAC', damgalar: { 'öz-değerlendirme|ARAC': { ts: T0 - 20 * GUN } }, simdi: T0 })
    expect(arac[0]?.bayat).toBe(true)
  })

  it('artefakt tarihi damgadan yeniyse o geçerli (SEO haftalık: docs/audits/seo-haftalik-<tarih>.md)', () => {
    const g = [{ ad: 'SEO haftalık', esik: 7 }]
    const dosyalar = ['docs/audits/seo-haftalik-2026-10-20.md', 'docs/audits/seo-haftalik-2026-11-02.md', 'docs/audits/baska.md']
    expect(z.artefaktZamani('SEO haftalık', dosyalar)).toBe(Date.parse('2026-11-02T00:00:00Z'))
    const taze = z.degerlendir({ gorevler: g, rol: 'GEO-SEO', damgalar: { 'SEO haftalık|GEO-SEO': { ts: T0 - 30 * GUN } }, simdi: T0, dosyalar })
    expect(taze[0]?.bayat).toBe(false)
    expect(z.artefaktZamani('öz-değerlendirme', dosyalar)).toBeNull()
  })

  it('birden çok bayat görev tek satırda', () => {
    const g = [
      { ad: 'SEO haftalık', esik: 7 },
      { ad: 'öz-değerlendirme', esik: 7 },
    ]
    const damgalar = { 'SEO haftalık|GEO-SEO': { ts: T0 - 9 * GUN }, 'öz-değerlendirme|GEO-SEO': { ts: T0 - 8 * GUN } }
    const s = z.satir('GEO-SEO', z.degerlendir({ gorevler: g, rol: 'GEO-SEO', damgalar, simdi: T0 }))
    expect(s.split('\n').length).toBe(1)
    expect(s).toContain('SEO haftalık: 9 gün')
    expect(s).toContain('öz-değerlendirme: 8 gün')
  })
})

describe('rolSatiri', () => {
  it('rolü olmayan ya da görevi olmayan oturum: sessiz', () => {
    expect(z.rolSatiri('', KOK, { veri })).toBe('')
    expect(z.rolSatiri('URUN', KOK, { veri })).toBe('')
  })

  it('ilk görülen görev için başlangıç damgası yazılır, satır sessiz', () => {
    const yazilan: string[] = []
    const s = z.rolSatiri('ARAC', KOK, { veri, damgalar: {}, simdi: T0, dosyalar: [], yaz: (ad) => yazilan.push(ad) })
    expect(s).toBe('')
    expect(yazilan).toEqual(['öz-değerlendirme'])
  })

  it('bayat görev için damga yeniden yazılmaz (sayaç kendiliğinden sıfırlanmaz)', () => {
    const yazilan: string[] = []
    const s = z.rolSatiri('ARAC', KOK, {
      veri,
      damgalar: { 'öz-değerlendirme|ARAC': { ts: T0 - 10 * GUN } },
      simdi: T0,
      dosyalar: [],
      yaz: (ad) => yazilan.push(ad),
    })
    expect(s).toContain('10 gün')
    expect(yazilan).toEqual([])
  })
})

describe('damga dosyası ve CLI', () => {
  it('damgaYaz/damgaOku gidiş-dönüş; bozuk dosya boş sayılır', () => {
    const d = path.join(gecici, 'a', 'damga.json')
    z.damgaYaz('öz-değerlendirme', 'ARAC', T0, d)
    expect(z.damgaOku(d)['öz-değerlendirme|ARAC']?.ts).toBe(T0)
    fs.writeFileSync(d, '{bozuk')
    expect(z.damgaOku(d)).toEqual({})
    expect(z.damgaOku(path.join(gecici, 'yok.json'))).toEqual({})
  })

  const cli = (...a: string[]) => spawnSync(process.execPath, [DAMGA, ...a], { encoding: 'utf8', timeout: 20000, env: { ...process.env, HOME: gecici, USERPROFILE: gecici } })

  it('bilinmeyen görev ve rolsüz çağrı hata verir, hata yazılmaz; --liste çalışır', () => {
    const bilinmeyen = cli('olmayan görev', '--rol', 'ARAC')
    expect(bilinmeyen.status).toBe(1)
    expect(bilinmeyen.stderr).toContain('Görev bulunamadı')
    const liste = cli('--liste', '--rol', 'ARAC')
    expect(liste.status).toBe(0)
    expect(liste.stdout).toContain('öz-değerlendirme')
    expect(fs.existsSync(path.join(gecici, '.claude', 'mod-durum', 'gorev-damga.json'))).toBe(false)
  })

  it('geçerli görev damgalanır (kullanıcı klasörü geçici dizine yönlendirildi)', () => {
    const r = cli('öz-değerlendirme', '--rol', 'ARAC')
    expect(r.status).toBe(0)
    const dosya = path.join(gecici, '.claude', 'mod-durum', 'gorev-damga.json')
    expect(JSON.parse(fs.readFileSync(dosya, 'utf8'))['öz-değerlendirme|ARAC'].ts).toBeGreaterThan(Date.now() - 60000)
  })
})

describe('kanca (süreç)', () => {
  it('bozuk girdi, boş girdi ve rolsüz oturum: çıkış 0, çıktı yok', () => {
    for (const g of ['{bozuk', '', JSON.stringify({ cwd: gecici })]) {
      const r = spawnSync(process.execPath, [KANCA], { input: g, encoding: 'utf8', timeout: 20000, env: { ...process.env, VENTHUB_PENCERE_AGENT: '', HOME: gecici, USERPROFILE: gecici } })
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
  })
})
