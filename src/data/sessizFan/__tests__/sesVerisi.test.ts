/**
 * URN-135 (U1) — Lineo Quiet ses/eğri veri modülü kapıları.
 *
 * NİÇİN: ses değeri koşulsuz tek sayı olarak yazılırsa yanıltır (OPS kuralı 10-16): her değer
 * "3 m, serbest alan, yer, kademe" koşuluyla birlikte basılır ve bunu yapan TEK üretici `sesEtiketi`dir.
 * Veri depoda sürümlüdür (DB'ye yazılmaz); kod başına kademe sayıları, eğri ve ses dizileri birbirini tutmalıdır.
 *
 *  (a) sesEtiketi biçimi ve ondalık ayırıcı (TR virgül, EN nokta)
 *  (b) 19 kod: kademe sayısı = lw/lp = D.lp = eğri kademesi; AC 3, ES 4; en düşük kademe = en düşük gövde Lp
 *  (c) kalite B ise EGRI_GRAFIKTEN_OKUNDU true
 *  (d) seriOzeti yalnız verilen kodlardan hesaplanır (12 DB kodu pinli)
 *  (e) veri olmayan kod: null / false (fail-closed), bozuk girdi istisna fırlatmaz
 *  (f) YAPISAL KAPI: SesDegeri nesnesi sesVerisi.ts dışında kurulamaz (kaynak taraması)
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

import ham from '../lineoQuiet.veri.json'
import {
  EGRI_GRAFIKTEN_OKUNDU,
  egriNoktalari,
  enDusukKademeGovdeLp,
  kademeAdlari,
  kademeSesTablosu,
  kontrolTuru,
  modelAdi,
  modelleriDogrula,
  seriOzeti,
  type SesDegeri,
  sesEtiketi,
  type SesEtiketSozlugu,
  veriVarMi,
} from '../sesVerisi'

const KODLAR = [
  '17160', '17161', '17162', '17163', '17164', '17165', '17166',
  '17170', '17171', '17172', '17173', '17174', '17175', '17176',
  '17190', '17191', '17192', '17193', '17194',
]
const DB_KODLARI = [
  '17160', '17161', '17162', '17164', '17165', '17166',
  '17170', '17171', '17172', '17174', '17175', '17176',
]
const DB_DISI_KODLAR = ['17163', '17173', '17190', '17191', '17192', '17193', '17194']

const TR: SesEtiketSozlugu = {
  yer: { emis: 'emiş', ufleme: 'üfleme', govde: 'gövde' },
  metre: 'm',
  kademe: { 'en düşük': 'en düşük hız', orta: 'orta hız', 'en yüksek': 'en yüksek hız' },
}
const EN: SesEtiketSozlugu = {
  yer: { emis: 'intake', ufleme: 'discharge', govde: 'casing' },
  metre: 'm',
  kademe: { 'en düşük': 'minimum speed', orta: 'medium speed', 'en yüksek': 'maximum speed' },
}

function deger(dbA: number, yer: 'emis' | 'ufleme' | 'govde', kademe: string): SesDegeri {
  return { dbA, kosul: { mesafeM: 3, yer, kademe } }
}

describe('(a) sesEtiketi biçimi', () => {
  it('TR ondalık virgül, EN ondalık nokta; koşul her zaman yazılır', () => {
    const d = deger(9.9, 'govde', '4 V')
    expect(sesEtiketi(d, 'tr', TR)).toBe('9,9 dB(A) · 4 V · gövde, 3 m')
    expect(sesEtiketi(d, 'en', EN)).toBe('9.9 dB(A) · 4 V · casing, 3 m')
  })

  it('tam sayı değerde ondalık eklenmez; kademe sözlükten çevrilir', () => {
    const d = deger(16, 'govde', 'en düşük')
    expect(sesEtiketi(d, 'tr', TR)).toBe('16 dB(A) · en düşük hız · gövde, 3 m')
    expect(sesEtiketi(d, 'en', EN)).toBe('16 dB(A) · minimum speed · casing, 3 m')
  })

  it('kademe sözlükte yoksa veri adı aynen yazılır (prototip anahtarı dahil)', () => {
    expect(sesEtiketi(deger(20.2, 'emis', '6 V'), 'tr', TR)).toBe('20,2 dB(A) · 6 V · emiş, 3 m')
    expect(sesEtiketi(deger(20.2, 'ufleme', 'constructor'), 'en', EN)).toBe(
      '20.2 dB(A) · constructor · discharge, 3 m',
    )
  })

  it('sonlu olmayan değer boş metin döner (çağıran boş kutuyu çizmez)', () => {
    expect(sesEtiketi(deger(Number.NaN, 'govde', '4 V'), 'tr', TR)).toBe('')
    expect(sesEtiketi(deger(Number.POSITIVE_INFINITY, 'govde', '4 V'), 'en', EN)).toBe('')
  })

  it('veriden gelen her değer koşulludur: 3 m, geçerli yer, dolu kademe', () => {
    for (const kod of KODLAR) {
      const tablo = kademeSesTablosu(kod)
      expect(tablo).not.toBeNull()
      for (const satir of tablo ?? []) {
        const gruplar = [
          ['emis', satir.emisLp],
          ['ufleme', satir.uflemeLp],
          ['govde', satir.govdeLp],
        ] as const
        for (const [yer, d] of gruplar) {
          expect(d.kosul.mesafeM).toBe(3)
          expect(d.kosul.yer).toBe(yer)
          expect(d.kosul.kademe).toBe(satir.kademe)
          expect(sesEtiketi(d, 'tr', TR)).toMatch(/^\d+(,\d+)? dB\(A\) · .+ · (emiş|üfleme|gövde), 3 m$/)
        }
      }
    }
  })
})

describe('(b) 19 kod: kademe sayıları ve diziler tutarlı', () => {
  const dogrulanan = modelleriDogrula(ham)

  it('19 kodun hepsi geçerli (doğrulayıcı sessizce kod düşürmedi)', () => {
    expect(dogrulanan.size).toBe(19)
    expect([...dogrulanan.keys()].sort()).toEqual([...KODLAR].sort())
    for (const kod of KODLAR) expect(veriVarMi(kod)).toBe(true)
  })

  it.each(KODLAR)('%s: kademe = lw = lp = D.lp = eğri kademesi; AC 3, ES 4', (kod) => {
    const m = dogrulanan.get(kod)
    expect(m).toBeDefined()
    if (!m) return
    const n = m.kademeler.length
    expect(m.lpEmis).toHaveLength(n)
    for (const yer of ['emis', 'ufleme', 'govde'] as const) {
      expect(m.lw[yer]).toHaveLength(n)
      expect(m.lp[yer]).toHaveLength(n)
    }
    expect(m.egri).toHaveLength(n)
    expect(egriNoktalari(kod)).toHaveLength(n)
    expect(kademeSesTablosu(kod)).toHaveLength(n)
    expect(kademeAdlari(kod)).toEqual(m.kademeler)
    // D.lp emiş tarafı Lp'dir: ses.lp.emis ile aynı olmalı
    expect(m.lpEmis).toEqual(m.lp.emis)
    // kontrol türü kademe sayısını ve adlarını belirler
    const kademeli = kontrolTuru(kod) === 'kademeli'
    expect(n).toBe(kademeli ? 3 : 4)
    expect(m.kademeler).toEqual(kademeli ? ['en düşük', 'orta', 'en yüksek'] : ['4 V', '6 V', '8 V', '10 V'])
    // eğri noktaları: kademe başına 15 basınç, 6 güç noktası
    for (const k of egriNoktalari(kod) ?? []) {
      expect(k.pq).toHaveLength(15)
      expect(k.pw).toHaveLength(6)
    }
    expect(modelAdi(kod)).toMatch(/^LINEO \d+ (T )?QUIET( ES)?$/)
  })

  it('17170-17176 ES (ec), geri kalan AC (kademeli)', () => {
    for (const kod of KODLAR) {
      expect(kontrolTuru(kod)).toBe(kod.startsWith('1717') ? 'ec' : 'kademeli')
    }
  })

  it('kademeler artan hız sırasındadır: en düşük kademe gövde Lp tüm kademelerin en küçüğü', () => {
    for (const kod of KODLAR) {
      const tablo = kademeSesTablosu(kod) ?? []
      const govde = tablo.map((s) => s.govdeLp.dbA)
      expect(enDusukKademeGovdeLp(kod)?.dbA).toBe(Math.min(...govde))
      expect(enDusukKademeGovdeLp(kod)?.kosul.kademe).toBe(tablo[0]?.kademe)
      expect([...govde].sort((a, b) => a - b)).toEqual(govde)
    }
  })

  it('tek ses değeri örneği: 17170 en düşük kademe gövde Lp', () => {
    const d = enDusukKademeGovdeLp('17170')
    expect(d).not.toBeNull()
    if (!d) return
    expect(sesEtiketi(d, 'tr', TR)).toBe('9,9 dB(A) · 4 V · gövde, 3 m')
    expect(sesEtiketi(d, 'en', EN)).toBe('9.9 dB(A) · 4 V · casing, 3 m')
  })
})

describe('(c) eğri grafikten okundu etiketi', () => {
  it('kalite B olan her kod için EGRI_GRAFIKTEN_OKUNDU true', () => {
    const dogrulanan = modelleriDogrula(ham)
    for (const kod of KODLAR) {
      expect(dogrulanan.get(kod)?.kalite).toBe('B')
      expect(EGRI_GRAFIKTEN_OKUNDU(kod)).toBe(true)
    }
  })
})

describe('(d) seriOzeti yalnız verilen kodlardan', () => {
  it('12 DB kodu: gövde 9,9 (4 V) – 48,3 (10 V), emiş 20,2 – 58,4 (en yüksek)', () => {
    const s = seriOzeti(DB_KODLARI)
    expect(s).not.toBeNull()
    if (!s) return
    expect(s.enDusukGovde).toEqual(deger(9.9, 'govde', '4 V'))
    expect(s.enYuksekGovde).toEqual(deger(48.3, 'govde', '10 V'))
    expect(s.enDusukEmis.dbA).toBe(20.2)
    expect(s.enYuksekEmis).toEqual(deger(58.4, 'emis', 'en yüksek'))
    // değerler kodlara geri izlenir
    expect(s.enDusukGovde).toEqual(enDusukKademeGovdeLp('17170'))
    expect(s.enYuksekGovde).toEqual(kademeSesTablosu('17176')?.at(-1)?.govdeLp)
    expect(s.enYuksekEmis).toEqual(kademeSesTablosu('17166')?.at(-1)?.emisLp)
    expect(s.enDusukEmis).toEqual(kademeSesTablosu('17170')?.[0]?.emisLp)
  })

  it('verisiz kod atlanır; 12 ve 7 kodluk sonuçların birleşimi 19 kodluk sonuca eşit', () => {
    const on12 = seriOzeti(DB_KODLARI)
    const dis7 = seriOzeti(DB_DISI_KODLAR)
    const hepsi = seriOzeti(KODLAR)
    expect(on12).not.toBeNull()
    expect(dis7).not.toBeNull()
    expect(hepsi).not.toBeNull()
    if (!on12 || !dis7 || !hepsi) return
    expect(seriOzeti([...DB_KODLARI, '99999', 'yok'])).toEqual(on12)
    expect(hepsi.enDusukGovde.dbA).toBe(Math.min(on12.enDusukGovde.dbA, dis7.enDusukGovde.dbA))
    expect(hepsi.enYuksekGovde.dbA).toBe(Math.max(on12.enYuksekGovde.dbA, dis7.enYuksekGovde.dbA))
    expect(hepsi.enDusukEmis.dbA).toBe(Math.min(on12.enDusukEmis.dbA, dis7.enDusukEmis.dbA))
    expect(hepsi.enYuksekEmis.dbA).toBe(Math.max(on12.enYuksekEmis.dbA, dis7.enYuksekEmis.dbA))
  })

  it('tek kod: yalnız o kodun aralığı', () => {
    const s = seriOzeti(['17160'])
    const tablo = kademeSesTablosu('17160') ?? []
    expect(s?.enDusukGovde).toEqual(tablo[0]?.govdeLp)
    expect(s?.enYuksekGovde).toEqual(tablo.at(-1)?.govdeLp)
  })
})

describe('(e) veri olmayan kod ve bozuk girdi: fail-closed', () => {
  it('olmayan kod için null / false, istisna yok', () => {
    for (const kod of ['99999', '', 'constructor', '__proto__']) {
      expect(veriVarMi(kod)).toBe(false)
      expect(modelAdi(kod)).toBeNull()
      expect(kontrolTuru(kod)).toBeNull()
      expect(kademeAdlari(kod)).toBeNull()
      expect(egriNoktalari(kod)).toBeNull()
      expect(enDusukKademeGovdeLp(kod)).toBeNull()
      expect(kademeSesTablosu(kod)).toBeNull()
      expect(EGRI_GRAFIKTEN_OKUNDU(kod)).toBe(false)
    }
    expect(seriOzeti(['99999'])).toBeNull()
    expect(seriOzeti([])).toBeNull()
  })

  it('bozuk ham girdi istisna fırlatmaz; yalnız bozuk kod düşer', () => {
    const bozukGirdiler: unknown[] = [
      null,
      undefined,
      42,
      'x',
      [],
      {},
      { D: 1 },
      { D: {}, ses: {}, egri: {}, kontrol: {}, kalite: {} },
    ]
    for (const bozuk of bozukGirdiler) {
      expect(modelleriDogrula(bozuk).size).toBe(0)
    }
    const sesGrubu = (n: number) => ({
      emis: Array.from({ length: n }, (_, i) => i + 1),
      ufleme: Array.from({ length: n }, (_, i) => i + 1),
      govde: Array.from({ length: n }, (_, i) => i + 1),
    })
    const egriKademesi = { pq: [[0, 1], [1, 0]], pw: [[0, 1], [1, 2]] }
    const iyi = {
      D: {
        A: { ad: 'A', lp: [1, 2] },
        B: { ad: 'B', lp: [1, 2] },
        C: { ad: 'C', lp: [1] },
        E: { ad: 'E', lp: [1, Number.NaN] },
      },
      ses: {
        A: { kademe: ['k1', 'k2'], lw: sesGrubu(2), lp: sesGrubu(2) },
        // B: lp.govde uzunluğu kademe sayısına uymuyor
        B: { kademe: ['k1', 'k2'], lw: sesGrubu(2), lp: { ...sesGrubu(2), govde: [1] } },
        C: { kademe: ['k1'], lw: sesGrubu(1), lp: sesGrubu(1) },
        E: { kademe: ['k1', 'k2'], lw: sesGrubu(2), lp: sesGrubu(2) },
      },
      egri: {
        A: [egriKademesi, egriKademesi],
        B: [egriKademesi, egriKademesi],
        // C: eğri kademesi yok
        C: [],
        E: [egriKademesi, egriKademesi],
      },
      kontrol: { A: 'kademeli', B: 'kademeli', C: 'kademeli', E: 'kademeli' },
      kalite: { A: 'B', B: 'B', C: 'B', E: 'B' },
    }
    // A geçerli; B uzunluk uyumsuz, C eğri yok, E sayı sonlu değil: üçü de düşer
    expect([...modelleriDogrula(iyi).keys()]).toEqual(['A'])
    // kontrol türü bilinmeyen kod düşer
    expect(modelleriDogrula({ ...iyi, kontrol: { A: 'x' } }).size).toBe(0)
    // kalite eksikse düşer
    expect(modelleriDogrula({ ...iyi, kalite: {} }).size).toBe(0)
  })
})

// --- (f) yapısal kapı -------------------------------------------------------------------------
// Tip düzeyinde "SesDegeri yalnız şuradan kurulur" demek, derleyiciye hata susturma yönergesi
// vermeyi gerektirir (yasak); bu yüzden kaynak taranır. Tarama benzersiz tanımlayıcılara bakar
// (`dbA:`, `mesafeM:`, `as SesDegeri`), böylece sözlük anahtarlarıyla yanlış alarm vermez.
// Sınır: `.dbA` okumasını ve yayılım (spread) ile kurmayı yakalamaz; bunlar kod incelemesi konusudur.
// Kural saf fonksiyondur ve iyi/kötü sentetik girdiyle sınanır; tarama boş kalırsa kapı kırmızı verir.

const IHLAL_KALIPLARI: readonly RegExp[] = [/\bdbA\s*:/, /\bmesafeM\s*:/, /\bas\s+SesDegeri\b/]

function ihlalSatirlari(metin: string): string[] {
  return metin
    .split(/\r?\n/)
    .filter((satir) => !/^\s*(\/\/|\*|\/\*)/.test(satir))
    .filter((satir) => IHLAL_KALIPLARI.some((kalip) => kalip.test(satir)))
}

function kaynakDosyalari(kok: string): string[] {
  const sonuc: string[] = []
  for (const girdi of readdirSync(kok, { withFileTypes: true })) {
    const yol = join(kok, girdi.name)
    if (girdi.isDirectory()) {
      if (girdi.name === '__tests__' || girdi.name === 'node_modules') continue
      sonuc.push(...kaynakDosyalari(yol))
    } else if (/\.(ts|tsx)$/.test(girdi.name) && !/\.(test|spec)\.(ts|tsx)$/.test(girdi.name)) {
      sonuc.push(yol)
    }
  }
  return sonuc
}

describe('(f) yapısal kapı: SesDegeri yalnız sesVerisi.ts içinde kurulur', () => {
  const SRC = join(process.cwd(), 'src')
  const MODUL = join(SRC, 'data', 'sessizFan', 'sesVerisi.ts')

  it('kural: kötü örnekler yakalanır, iyi örnekler geçer', () => {
    expect(ihlalSatirlari('const x = { dbA: 12, kosul: k }')).toHaveLength(1)
    expect(ihlalSatirlari('const k = { mesafeM: 3, yer, kademe }')).toHaveLength(1)
    expect(ihlalSatirlari('const d = girdi as SesDegeri')).toHaveLength(1)
    expect(ihlalSatirlari('const { dbA } = d\nconst y = d.dbA\nsesEtiketi(d, lang, etiket)')).toHaveLength(0)
    expect(ihlalSatirlari('// örnek: { dbA: 12 }\n * mesafeM: 3')).toHaveLength(0)
  })

  it('tarama boş değil: kök src, modül bulundu, yüzlerce dosya tarandı', () => {
    const dosyalar = kaynakDosyalari(SRC)
    expect(dosyalar).toContain(MODUL)
    expect(dosyalar.length).toBeGreaterThan(100)
  })

  it('sesVerisi.ts dışında hiçbir üretim dosyası SesDegeri kurmaz', () => {
    const ihlaller: string[] = []
    for (const dosya of kaynakDosyalari(SRC)) {
      if (dosya === MODUL) continue
      for (const satir of ihlalSatirlari(readFileSync(dosya, 'utf8'))) {
        ihlaller.push(`${dosya.split(sep).slice(-3).join('/')}: ${satir.trim()}`)
      }
    }
    expect(ihlaller).toEqual([])
  })

  it('modül içinde de tek kurucu var: koşul yalnız `degerKur` içinde mesafeM ile kurulur', () => {
    const metin = readFileSync(MODUL, 'utf8')
    expect(metin.match(/\bmesafeM\s*:\s*MESAFE_M\b/g)).toHaveLength(1)
    expect(metin.match(/\bas\s+SesDegeri\b/g)).toBeNull()
  })
})
