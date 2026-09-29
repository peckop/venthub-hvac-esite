/**
 * INV-BELGE-1 — belge kapısı (`docs/standards/belge-yonetimi-standard.md` B7).
 *
 * NİÇİN VAR: kod tarafında bozulunca kırmızı yanan kontrol vardı, belge tarafında yoktu.
 * CLAUDE.md ve belge haritası var olmayan dosyayı gösterebiliyordu, yeni cetvel sahipsiz
 * yazılabiliyordu ve hiçbir kontrol bunu görmüyordu (REC-400 ölçümü, 2026-09-27).
 *
 * Bu paket iki şeyi ölçer:
 *   1. AYIRT EDİCİLİK — ayıklayıcı kırık yolu yakalıyor, yer tutucu / glob / URL / depo dışı yol /
 *      kısa ad için SESSİZ kalıyor (fikstürle; sabotaj yeşil kalırsa kapı kördür).
 *   2. MANDAL — gerçek depoda taban dışı yeni kırık yol yok, yeni cetvel başlık alanlarını taşıyor,
 *      taban bayat değil (düzeltilen kalem tabandan çıkarılmış).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Siniflar = { yol: string[]; yerTutucu: string[]; glob: string[]; disYol: string[]; url: string[] }
type KirikRapor = { belge: string; kirik: string[]; yolSayisi: number; atlanan: number; eksikBelge?: boolean }
type Olcum = {
  cekirdek: { belge: string; tarih: string | null; kaynak: string; gun: number | null; yok?: boolean }[]
  kirikYol: KirikRapor[]
  kirikYeni: { belge: string; yol: string }[]
  cetvel: { toplam: number; alanEksik: string[]; sahipEksik: string[]; dogrulamaEksik: string[] }
  hafizaIndeksi: { satir: number; bayt: number; durum: string; yol: string } | null
  olculmedi: string[]
}
type Modul = {
  yollariAyikla: (m: string) => Siniflar
  kirikYollar: (kok: string, belgeler?: string[]) => KirikRapor[]
  sonDogrulama: (m: string) => string | null
  basliktaSahipVar: (m: string) => boolean
  tabanOku: (kok: string) => {
    kirikYol: Record<string, string[]>
    cetvelAlanEksik: string[]
    cetvelSahipEksik: string[]
    cetvelDogrulamaEksik: string[]
  }
  olc: (kok?: string, simdi?: number) => Olcum
  hafizaSay: (m: string) => { satir: number; bayt: number }
  hafizaDurumu: (s: { satir: number; bayt: number }) => 'tamam' | 'yumusak' | 'sert'
  hafizaIndeksYolu: (kok: string, ortam?: Record<string, string>, home?: string) => string | null
  hafizaIndeksi: (
    kok: string,
    ortam?: Record<string, string>,
    home?: string,
  ) => { satir: number; bayt: number; durum: string; yol: string } | null
}

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const B = require(path.join(KOK, 'scripts/belge/belge-tazelik.cjs')) as Modul

describe('INV-BELGE-1 · hafıza indeksi satır/bayt (REC-433 1.9: 200 satır YA DA ~25.000 bayt)', () => {
  it('satır sayımı: sondaki satır sonu sayılmaz, boş dosya 0, bayt UTF-8', () => {
    expect(B.hafizaSay('')).toEqual({ satir: 0, bayt: 0 })
    expect(B.hafizaSay('a\nb\n')).toEqual({ satir: 2, bayt: 4 })
    expect(B.hafizaSay('a\nb')).toEqual({ satir: 2, bayt: 3 })
    expect(B.hafizaSay('ş\n').bayt).toBe(3)
  })

  it('eşik: satır VEYA bayt, hangisi önce dolarsa (ayırt edici: her kol tek başına tetikler)', () => {
    expect(B.hafizaDurumu({ satir: 126, bayt: 15746 })).toBe('tamam')
    expect(B.hafizaDurumu({ satir: 160, bayt: 1000 })).toBe('yumusak')
    expect(B.hafizaDurumu({ satir: 10, bayt: 20000 })).toBe('yumusak')
    expect(B.hafizaDurumu({ satir: 200, bayt: 1000 })).toBe('sert')
    expect(B.hafizaDurumu({ satir: 10, bayt: 25000 })).toBe('sert')
    expect(B.hafizaDurumu({ satir: 10, bayt: 16615 })).toBe('tamam') // eski 16384 inancı artık sert değil
  })

  it('yol: VENTHUB_MEMORY_INDEX önce; olmayan dosya null (sayı uydurulmaz)', () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'hafiza-'))
    const dosya = path.join(gecici, 'MEMORY.md')
    fs.writeFileSync(dosya, '- a\n- b\n')
    expect(B.hafizaIndeksYolu(KOK, { VENTHUB_MEMORY_INDEX: dosya })).toBe(dosya)
    expect(B.hafizaIndeksi(KOK, { VENTHUB_MEMORY_INDEX: dosya })).toMatchObject({ satir: 2, bayt: 8, durum: 'tamam' })
    expect(B.hafizaIndeksYolu(KOK, { VENTHUB_MEMORY_INDEX: path.join(gecici, 'yok.md') })).toBeNull()
    expect(B.hafizaIndeksi(KOK, {}, gecici)).toBeNull() // proje klasörü de yok: ölçülemedi, uydurma yok
  })

  it('olc(): yol bulunamazsa olculmedi listesinde kalır', () => {
    const o = B.olc()
    if (o.hafizaIndeksi === null) expect(o.olculmedi).toContain('MEMORY.md satır/bayt')
    else expect(o.olculmedi).not.toContain('MEMORY.md satır/bayt')
  })
})

describe('INV-BELGE-1 · ayıklayıcı sınıfları', () => {
  it('yol, yer tutucu, glob, URL, depo dışı yol ayrı sınıflanır; komut atlanır', () => {
    const s = B.yollariAyikla(
      [
        'bkz. `docs/standards/x.md` ve [harita](standards/y.md)',
        '`<ingestor>/kaynak-dizini/sayfalar.jsonl` · `src/**` · `https://venthub.com.tr/a`',
        '`C:/Kok/depo/a.md` · `~/.claude/settings.json` · `pnpm test -- --run`',
      ].join('\n'),
    )
    expect(s.yol).toEqual(['docs/standards/x.md', 'standards/y.md'])
    expect(s.yerTutucu).toEqual(['<ingestor>/kaynak-dizini/sayfalar.jsonl'])
    expect(s.glob).toEqual(['src/**'])
    expect(s.url).toEqual(['https://venthub.com.tr/a'])
    expect(s.disYol).toEqual(['C:/Kok/depo/a.md', '~/.claude/settings.json'])
  })

  it('bölüm işareti ve satır numarası yoldan ayrılır', () => {
    const s = B.yollariAyikla('`docs/a.md` §6.3 · `docs/b.md§2` · `src/c.ts:42` · `docs/d.md#baslik`')
    expect(s.yol).toEqual(['docs/a.md', 'docs/b.md', 'src/c.ts', 'docs/d.md'])
  })
})

describe('INV-BELGE-1 · kırık yol ayırt ediciliği (fikstür)', () => {
  function fikstur(): string {
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-belge-1-'))
    fs.mkdirSync(path.join(kok, 'docs', 'standards'), { recursive: true })
    fs.writeFileSync(path.join(kok, 'docs', 'standards', 'var.md'), '# var\n')
    fs.writeFileSync(
      path.join(kok, 'docs', 'README.md'),
      [
        '| soru | `standards/var.md` |',
        '| soru | `standards/yok.md` |',
        '| yer tutucu | `<ingestor>/a.md` |',
        '| glob | `src/**` |',
        '| kısa ad | `middleware.ts` |',
        '| url | `https://example.com/x.md` |',
      ].join('\n'),
    )
    return kok
  }

  it('olmayan yol KIRIK; yer tutucu, glob, kısa ad, URL SESSİZ', () => {
    const kok = fikstur()
    const [r] = B.kirikYollar(kok, ['docs/README.md'])
    expect(r.kirik).toEqual(['standards/yok.md'])
    expect(r.yolSayisi).toBe(2)
  })

  it('SABOTAJ: var olan hedef silinince kırık listesine girer', () => {
    const kok = fikstur()
    fs.rmSync(path.join(kok, 'docs', 'standards', 'var.md'))
    const [r] = B.kirikYollar(kok, ['docs/README.md'])
    expect(r.kirik).toContain('standards/var.md')
  })

  it('belge yoksa sessiz geçmez, eksikBelge işaretlenir', () => {
    const kok = fikstur()
    const [r] = B.kirikYollar(kok, ['docs/OLMAYAN.md'])
    expect(r.eksikBelge).toBe(true)
  })
})

describe('INV-BELGE-1 · başlık bloğu ayrıştırma', () => {
  it('Son doğrulama ve Sahibi ilk 40 satırda okunur', () => {
    const m = '# X\n\n> **Sahibi:** HARİTA\n> **Son doğrulama:** 2026-09-27.\n'
    expect(B.sonDogrulama(m)).toBe('2026-09-27')
    expect(B.basliktaSahipVar(m)).toBe(true)
  })

  it('3.4-B: kısa yazım `Sahip:` da sahip sayılır; alansız metin sayılmaz', () => {
    expect(B.basliktaSahipVar('# X\n**Sahip:** ALTYAPI\n')).toBe(true)
    expect(B.basliktaSahipVar('# X\nSahibi: ADMIN\n')).toBe(true)
    expect(B.basliktaSahipVar('# X\nSahiplik konusu burada geçiyor ama alan değil\n')).toBe(false)
  })

  it('SABOTAJ: 40. satırdan sonraki alan sayılmaz', () => {
    const m = '# X\n' + '\n'.repeat(45) + 'Sahibi: A\nSon doğrulama: 2026-09-27\n'
    expect(B.sonDogrulama(m)).toBeNull()
    expect(B.basliktaSahipVar(m)).toBe(false)
  })
})

describe('INV-BELGE-1 · gerçek depo mandalı', () => {
  const o = B.olc(KOK)
  const taban = B.tabanOku(KOK)

  it('CLAUDE.md ve docs/README.md tabanın DIŞINDA kırık yol göstermiyor', () => {
    expect(o.kirikYeni, 'yeni kırık yol: yolu düzelt; kasıtlıysa tabanı gerekçeyle güncelle').toEqual([])
  })

  it('taban bayat değil: tabandaki her kırık yol hâlâ kırık', () => {
    for (const [belge, yollar] of Object.entries(taban.kirikYol)) {
      const simdi = o.kirikYol.find((k) => k.belge === belge)?.kirik ?? []
      for (const y of yollar) expect(simdi, `${belge}: ${y} düzelmiş → tabandan çıkar`).toContain(y)
    }
  })

  it('yeni ya da değişen cetvel Sahibi + Son doğrulama taşıyor (taban dışı eksik yok)', () => {
    const bilinen = new Set(taban.cetvelAlanEksik)
    const yeni = o.cetvel.alanEksik.filter((d) => !bilinen.has(d))
    expect(yeni, 'başlık bloğuna Sahibi ve Son doğrulama ekle (cetvel B3.3)').toEqual([])
  })

  it('taban bayat değil: tabandaki her cetvel hâlâ alan eksik', () => {
    const simdi = new Set(o.cetvel.alanEksik)
    for (const d of taban.cetvelAlanEksik) expect(simdi.has(d), `${d} alanları eklenmiş → tabandan çıkar`).toBe(true)
  })

  it('3.4: sahip eksik ve doğrulama eksik AYRI mandal — biri düzelince yalnız o tabandan çıkar', () => {
    const sahipBilinen = new Set(taban.cetvelSahipEksik)
    expect(o.cetvel.sahipEksik.filter((d) => !sahipBilinen.has(d)), 'yeni cetvel Sahibi alanı taşımıyor').toEqual([])
    const dogrBilinen = new Set(taban.cetvelDogrulamaEksik)
    expect(o.cetvel.dogrulamaEksik.filter((d) => !dogrBilinen.has(d)), 'yeni cetvel Son doğrulama taşımıyor').toEqual([])
    const sahipSimdi = new Set(o.cetvel.sahipEksik)
    for (const d of taban.cetvelSahipEksik) expect(sahipSimdi.has(d), `${d} Sahibi eklenmiş → cetvelSahipEksik tabanından çıkar`).toBe(true)
    const dogrSimdi = new Set(o.cetvel.dogrulamaEksik)
    for (const d of taban.cetvelDogrulamaEksik) expect(dogrSimdi.has(d), `${d} Son doğrulama eklenmiş → cetvelDogrulamaEksik tabanından çıkar`).toBe(true)
  })

  it('3.4: birleşim tutarlı — alanEksik = sahipEksik ∪ dogrulamaEksik', () => {
    const birlesim = new Set([...o.cetvel.sahipEksik, ...o.cetvel.dogrulamaEksik])
    expect(new Set(o.cetvel.alanEksik)).toEqual(birlesim)
  })

  it('iki çekirdek belge (CLAUDE.md, docs/README.md) ölçülüyor; emekli CONTEXT.md/DURUM-TAKIP.md ölçülmüyor', () => {
    expect(o.cekirdek.map((c: { belge: string }) => c.belge)).toEqual(['CLAUDE.md', 'docs/README.md'])
    for (const c of o.cekirdek) expect(c.tarih, `${c.belge} tarihi okunamadı`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
