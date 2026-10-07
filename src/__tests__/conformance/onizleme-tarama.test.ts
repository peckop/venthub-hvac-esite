// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-ONIZLEME-TARAMA-1 — önizleme adres tarama betiği (ALT-37b; Cuma 9 Ekim ADRES önizlemesi, karar 68).
 *
 * Betik (`scripts/adres/onizleme-tarama.cjs`) açık kipte derlenmiş sunucuya YALNIZ GET atar ve her adresin
 * beklenen cevabı verip vermediğini yazar: rota dili tablosu (yeni 200 / eski tek 308 / dilsiz tek sıçrama),
 * model adres listesi (aile başına en az 1 model), eski kategori adresleri (#1352'ye bağlı: BEKLİYOR).
 *
 * Bu dosya betiğin KENDİSİNİN doğru ölçtüğünü sınar. Sekiz bölüm:
 *  1-4. Saf parçalar: csvOku (BOM, CRLF), modelOrnekle, beklentileriUret, degerlendir (her durum kararı).
 *  5.   Sahte sunucu: kusursuz sunucuda çıkış 0 ve kırmızı 0; zincir, yanlış hedef, hata, bekliyor vakaları.
 *       "Kusursuz sunucu" beklenti listesinden DEĞİL doğrudan tablo ve CSV'den kurulur (aynı kaynaktan iki
 *       bağımsız yorum: biri yanlış anlarsa kırmızı çıkar).
 *  6.   Komut satırı ve girdi hataları: çıkış 2, boş evren yeşil sayılmaz.
 *  7.   Gerçek depo: tablo ve model listesi betiğin okuduğu sütunlarla sağlam.
 *  8.   Kapı: yalnız GET (yerel node:http sunucusu gelen istek yöntemlerini kaydeder). Canlıya ve dış ağa
 *       istek ATILMAZ.
 *
 * ⚠KAPSAM SINIRI: bu test sunucunun GERÇEKTEN ne cevap verdiğini ölçmez (o iş önizleme koşusunda). Ölçülmeyen:
 * dilsiz adreslerin (`/legal/kvkk`) gerçek sunucuda tek sıçramayla yeni adrese gitmesi.
 */

const KOK = path.resolve(__dirname, '../../..')
const BETIK_YOLU = path.join(KOK, 'scripts', 'adres', 'onizleme-tarama.cjs')
const MODEL_CSV = path.join(KOK, 'docs', 'plans', 'rec300-model-adres-listesi-2026-09-23.csv')
const TABAN = 'https://onizleme.test'

type Baslik = (ad: string) => string | null
type Yanit = { durum: number; baslik: Baslik }
type Getir = (url: string) => Promise<Yanit>
type Cevaplar = Map<string, [number, string?]>
interface TabloSatiri {
  id: string
  klasor: string
  tr: string
  en: string
}
interface Model {
  sku: string
  aile_yeni: string
  slug_bugun: string
  adres_tr: string
  adres_en: string
}
interface Tohum {
  kategoriler?: { eski: string }[]
}
interface Girdi {
  tablo: TabloSatiri[]
  modeller: Model[]
  tohum: Tohum | null
}
interface Beklenti {
  grup: string
  adres: string
  ilkDurum: number | number[] | null
  hop: number
  sonUrl: string | null
  sonDurum: number | null
  bekliyor?: string
}
interface Izlenen {
  adres: string
  ilk: { durum: number } | null
  hop: number
  sonDurum: number | null
  sonUrl: string
  hata: string | null
}
interface Karar {
  durum: string
  gercek: string
}
interface Bag {
  girdi?: Girdi
  getir?: Getir
  yaz?: (m: string) => void
  hata?: (m: string) => void
}
interface Betik {
  csvOku: (metin: string) => Record<string, string>[]
  modelOrnekle: (modeller: Model[], ek?: number) => Model[]
  beklentileriUret: (girdi: Girdi & { ek?: number }) => Beklenti[]
  degerlendir: (beklenti: Beklenti, satir: Izlenen) => Karar
  ozetle: (sonuclar: { durum: string }[]) => { toplam: number; ok: number; kirmizi: number; hata: number; bekliyor: number }
  argumanlariOku: (argv: string[]) => Record<string, unknown>
  girdileriOku: (sec: Record<string, unknown>) => Promise<Girdi>
  ana: (argv: string[], bag?: Bag) => Promise<number>
}

const betik = createRequire(import.meta.url)(BETIK_YOLU) as Betik
const TABLO = JSON.parse(fs.readFileSync(path.join(KOK, 'src', 'config', 'rotaDili.veri.json'), 'utf8')) as TabloSatiri[]
const TOHUM = JSON.parse(fs.readFileSync(path.join(KOK, 'src', 'data', 'eski-adres-tohum.json'), 'utf8')) as Tohum
const HAM_MODELLER = betik.csvOku(fs.readFileSync(MODEL_CSV, 'utf8'))
const MODELLER: Model[] = HAM_MODELLER.map((s) => ({
  sku: s.sku,
  aile_yeni: s.aile_yeni,
  slug_bugun: s.slug_bugun,
  adres_tr: s.adres_tr,
  adres_en: s.adres_en,
}))
const KATEGORI_SAYISI = (TOHUM.kategoriler ?? []).length

// ── Yardımcılar ──────────────────────────────────────────────────────────────

const model = (sku: string, aile: string): Model => ({
  sku,
  aile_yeni: aile,
  slug_bugun: `${sku.toLowerCase()}-eski`,
  adres_tr: `/tr/urun/${sku.toLowerCase()}-p`,
  adres_en: `/en/products/${sku.toLowerCase()}-en-p`,
})

/** Küçük, elle okunabilir girdi: 2 tablo satırı (biri EN adresi değişmeyen), 2 aile / 3 model, 2 kategori. */
const KUCUK: Girdi = {
  tablo: [
    { id: 'hakkimizda', klasor: 'about', tr: 'hakkimizda', en: 'about' },
    { id: 'sss', klasor: 'destek/sss', tr: 'sss', en: 'faq' },
  ],
  modeller: [model('B-2', 'aile-b'), model('A-9', 'aile-a'), model('A-1', 'aile-a')],
  tohum: { kategoriler: [{ eski: 'fanlar' }, { eski: 'hava-perdeleri' }] },
}
/** KUCUK için: 9 rota dili + 8 model (2 aile × 4) + 2 kategori. */
const KUCUK_TOPLAM = 19
const KUCUK_BEKLIYOR = 2

/**
 * Kusursuz sunucu cevapları: BEKLENTİ LİSTESİNDEN DEĞİL, doğrudan tablo ve CSV'den kurulur.
 * Yeni adres 200; eski dilli adres tek 308; dilsiz eski adres tek 307 → TR yeni adres; model eski adres tek 308.
 * Kategori adresleri BİLEREK yok (canlıda hedef ağaç yok → 404): satırlar BEKLİYOR kalmalı.
 */
function kusursuzCevaplar(girdi: Pick<Girdi, 'tablo' | 'modeller'>): Cevaplar {
  const c: Cevaplar = new Map()
  for (const s of girdi.tablo) {
    for (const dil of ['tr', 'en'] as const) {
      c.set(`/${dil}/${s[dil]}`, [200])
      if (s[dil] !== s.klasor) c.set(`/${dil}/${s.klasor}`, [308, `/${dil}/${s[dil]}`])
    }
    c.set(`/${s.klasor}`, [307, `/tr/${s.tr}`])
  }
  for (const m of girdi.modeller) {
    c.set(m.adres_tr, [200])
    c.set(m.adres_en, [200])
    c.set(`/tr/products/${m.slug_bugun}`, [308, m.adres_tr])
    c.set(`/en/products/${m.slug_bugun}`, [308, m.adres_en])
  }
  return c
}

function sahteGetir(cevaplar: Cevaplar, istekler: string[] = []): Getir {
  return async (url) => {
    const yol = new URL(url).pathname
    istekler.push(yol)
    const kayit = cevaplar.get(yol)
    if (!kayit) return { durum: 404, baslik: () => null }
    const [durum, konum] = kayit
    return { durum, baslik: (ad) => (ad === 'location' ? (konum ?? null) : null) }
  }
}

interface Cikti {
  kod: number
  yazilan: string[]
  hatalar: string[]
}

async function calistir(argv: string[], bag: Bag = {}): Promise<Cikti> {
  const yazilan: string[] = []
  const hatalar: string[] = []
  const kod = await betik.ana(argv, { ...bag, yaz: (m) => yazilan.push(m), hata: (m) => hatalar.push(m) })
  return { kod, yazilan, hatalar }
}

const ozetSatiri = (c: Cikti): string => c.yazilan.find((s) => s.includes('TARAMA ')) ?? ''
const ozetSayilari = (c: Cikti): { toplam: number; ok: number; kirmizi: number; hata: number; bekliyor: number } => {
  const e = /(\d+) beklenti · OK (\d+) · KIRMIZI (\d+) · HATA (\d+) · BEKLİYOR (\d+)/.exec(ozetSatiri(c))
  if (!e) throw new Error(`özet satırı okunamadı: "${ozetSatiri(c)}"`)
  return { toplam: Number(e[1]), ok: Number(e[2]), kirmizi: Number(e[3]), hata: Number(e[4]), bekliyor: Number(e[5]) }
}

const gecici: string[] = []
function geciciDizin(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'onizleme-tarama-'))
  gecici.push(d)
  return d
}
afterAll(() => {
  for (const d of gecici) fs.rmSync(d, { recursive: true, force: true })
})

// ── 1. csvOku ────────────────────────────────────────────────────────────────

describe('csvOku', () => {
  it('BOM + CRLF + boş satır: ilk sütun adı BOM taşımaz, satırlar nesne olur', () => {
    const r = betik.csvOku(String.fromCharCode(0xfeff) + 'sku;ad;not\r\nA-1;Bir;\r\n\r\nB-2;İki;x\r\n')
    expect(Object.keys(r[0])).toEqual(['sku', 'ad', 'not'])
    expect(r).toEqual([
      { sku: 'A-1', ad: 'Bir', not: '' },
      { sku: 'B-2', ad: 'İki', not: 'x' },
    ])
  })

  it('eksik hücre boş metin olur (undefined değil)', () => {
    expect(betik.csvOku('a;b;c\n1;2')).toEqual([{ a: '1', b: '2', c: '' }])
  })

  it('yalnız başlık, boş metin ve yalnız boş satırlar ATAR (boş evren yeşil sayılmaz)', () => {
    expect(() => betik.csvOku('a;b\n')).toThrow(/CSV boş/)
    expect(() => betik.csvOku('')).toThrow(/CSV boş/)
    expect(() => betik.csvOku('\r\n\r\n   \n')).toThrow(/CSV boş/)
  })
})

// ── 2. modelOrnekle ──────────────────────────────────────────────────────────

describe('modelOrnekle', () => {
  /** Her test KENDİ kopyasını alır: ortak dizi, yerinde sıralayan bir hatayı sonraki testlerde gizlerdi (mutasyon M07). */
  const girdiYap = (): Model[] => [model('B-1', 'aile-a'), model('A-1', 'aile-b'), model('A-2', 'aile-b'), model('B-0', 'aile-a')]

  it('her aileden SKU sırasıyla ilk model; aileler alfabetik', () => {
    // SKU sırası A-1(aile-b) A-2(aile-b) B-0(aile-a) B-1(aile-a): ilk görülen aile aile-b, ama sonuç aile-a ile başlar.
    expect(betik.modelOrnekle(girdiYap()).map((m) => m.sku)).toEqual(['B-0', 'A-1'])
  })

  it('ek örnek: aile başına 1 + ek model; aile boyunu aşan ek hepsini verir', () => {
    expect(betik.modelOrnekle(girdiYap(), 1).map((m) => m.sku)).toEqual(['B-0', 'B-1', 'A-1', 'A-2'])
    expect(betik.modelOrnekle(girdiYap(), 9)).toHaveLength(4)
  })

  it('girdi sırasından bağımsız ve girdiyi DEĞİŞTİRMEZ', () => {
    const girdi = girdiYap()
    const kopya = structuredClone(girdi)
    const ilk = betik.modelOrnekle(girdi, 1)
    expect(girdi).toEqual(kopya)
    expect(betik.modelOrnekle([...girdi].reverse(), 1)).toEqual(ilk)
  })

  it('boş liste boş örnek verir (atmaz)', () => {
    expect(betik.modelOrnekle([])).toEqual([])
  })
})

// ── 3. beklentileriUret ──────────────────────────────────────────────────────

describe('beklentileriUret', () => {
  const uret = (g: Partial<Girdi> & { ek?: number } = {}) => betik.beklentileriUret({ ...KUCUK, ...g })
  const adresler = (b: Beklenti[], grup: string) => b.filter((x) => x.grup === grup).map((x) => x.adres)
  const bul = (b: Beklenti[], grup: string, adres: string) => b.find((x) => x.grup === grup && x.adres === adres)

  it('tablo: dil başına yeni + eski; EN adresi değişmeyen satır "ayni"; satır başına 1 dilsiz eski adres', () => {
    const b = uret({ modeller: [], tohum: null })
    expect(adresler(b, 'rota-dili-yeni')).toEqual(['/tr/hakkimizda', '/tr/sss', '/en/faq'])
    expect(adresler(b, 'rota-dili-eski')).toEqual(['/tr/about', '/tr/destek/sss', '/en/destek/sss'])
    expect(adresler(b, 'rota-dili-ayni')).toEqual(['/en/about'])
    expect(adresler(b, 'rota-dili-dilsiz')).toEqual(['/about', '/destek/sss'])
    expect(b).toHaveLength(9)
  })

  it('tablo beklentileri: yeni 200; eski dilli TEK 308 → yeni adres; dilsiz 307/308 → TR yeni adres', () => {
    const b = uret({ modeller: [], tohum: null })
    expect(bul(b, 'rota-dili-yeni', '/en/faq')).toMatchObject({ ilkDurum: 200, hop: 0, sonUrl: '/en/faq', sonDurum: 200 })
    expect(bul(b, 'rota-dili-ayni', '/en/about')).toMatchObject({ ilkDurum: 200, hop: 0, sonUrl: '/en/about', sonDurum: 200 })
    expect(bul(b, 'rota-dili-eski', '/tr/about')).toMatchObject({ ilkDurum: 308, hop: 1, sonUrl: '/tr/hakkimizda', sonDurum: 200 })
    expect(bul(b, 'rota-dili-eski', '/en/destek/sss')).toMatchObject({ ilkDurum: 308, hop: 1, sonUrl: '/en/faq', sonDurum: 200 })
    expect(bul(b, 'rota-dili-dilsiz', '/about')).toMatchObject({ ilkDurum: [307, 308], hop: 1, sonUrl: '/tr/hakkimizda', sonDurum: 200 })
    expect(bul(b, 'rota-dili-dilsiz', '/destek/sss')).toMatchObject({ sonUrl: '/tr/sss' })
  })

  it('model: aile örneği başına yeni TR/EN 200 + bugünkü TR/EN adres TEK 308 → CSV hedefi', () => {
    const b = uret({ tablo: [], tohum: null })
    // aile-a → A-1 (SKU sırası), aile-b → B-2
    expect(adresler(b, 'model-yeni')).toEqual(['/tr/urun/a-1-p', '/en/products/a-1-en-p', '/tr/urun/b-2-p', '/en/products/b-2-en-p'])
    expect(adresler(b, 'model-eski')).toEqual(['/tr/products/a-1-eski', '/en/products/a-1-eski', '/tr/products/b-2-eski', '/en/products/b-2-eski'])
    expect(bul(b, 'model-eski', '/tr/products/a-1-eski')).toMatchObject({ ilkDurum: 308, hop: 1, sonUrl: '/tr/urun/a-1-p', sonDurum: 200 })
    expect(bul(b, 'model-eski', '/en/products/a-1-eski')).toMatchObject({ ilkDurum: 308, hop: 1, sonUrl: '/en/products/a-1-en-p', sonDurum: 200 })
    expect(bul(b, 'model-yeni', '/tr/urun/b-2-p')).toMatchObject({ ilkDurum: 200, hop: 0, sonUrl: '/tr/urun/b-2-p', sonDurum: 200 })
  })

  it('--ornek (ek): aile başına ek model gelir (3 model × TR/EN)', () => {
    const b = uret({ tablo: [], tohum: null, ek: 1 })
    expect(adresler(b, 'model-yeni')).toHaveLength(6)
    expect(adresler(b, 'model-eski')).toHaveLength(6)
  })

  it('tekrarsız: aynı grup+adres iki kez yazılmaz', () => {
    const ikiz = { ...model('Z-1', 'aile-z'), adres_tr: '/tr/urun/a-1-p', adres_en: '/en/products/a-1-en-p' }
    const b = uret({ tablo: [], tohum: null, modeller: [model('A-1', 'aile-a'), ikiz] })
    expect(adresler(b, 'model-yeni')).toEqual(['/tr/urun/a-1-p', '/en/products/a-1-en-p'])
    expect(adresler(b, 'model-eski')).toHaveLength(4) // eski adresler farklı slug: tekrar değil
  })

  it('kategori: yalnız ilk 6 eski adres; hepsi BEKLİYOR (#1352), hedef belirsiz', () => {
    const tohum = { kategoriler: Array.from({ length: 8 }, (_, i) => ({ eski: `k${i}` })) }
    const b = uret({ tablo: [], modeller: [], tohum })
    expect(adresler(b, 'kategori-eski')).toEqual(['/category/k0', '/category/k1', '/category/k2', '/category/k3', '/category/k4', '/category/k5'])
    for (const x of b) {
      expect(x.bekliyor, 'bekliyor gerekçesi yok').toContain('#1352')
      expect(x).toMatchObject({ ilkDurum: null, sonUrl: null })
    }
  })

  it('tohum yok ya da kategorisiz: kategori beklentisi üretilmez, atmaz', () => {
    expect(adresler(uret({ tohum: null }), 'kategori-eski')).toEqual([])
    expect(adresler(uret({ tohum: { kategoriler: [] } }), 'kategori-eski')).toEqual([])
    expect(adresler(uret({ tohum: {} }), 'kategori-eski')).toEqual([])
  })

  it('kararlı: aynı girdi → aynı liste', () => {
    expect(uret()).toEqual(uret())
    expect(uret()).toHaveLength(KUCUK_TOPLAM)
  })
})

// ── 4. degerlendir ───────────────────────────────────────────────────────────

describe('degerlendir', () => {
  const izle = (ek: Partial<Izlenen> = {}): Izlenen => ({ adres: '/x', ilk: { durum: 200 }, hop: 0, sonDurum: 200, sonUrl: '/x', hata: null, ...ek })
  const b200: Beklenti = { grup: 'g', adres: '/x', ilkDurum: 200, hop: 0, sonUrl: '/x', sonDurum: 200 }
  const b308: Beklenti = { grup: 'g', adres: '/eski', ilkDurum: 308, hop: 1, sonUrl: '/yeni', sonDurum: 200 }
  const bDilsiz: Beklenti = { grup: 'g', adres: '/eski', ilkDurum: [307, 308], hop: 1, sonUrl: '/tr/yeni', sonDurum: 200 }
  const bBekliyor: Beklenti = { grup: 'g', adres: '/c', ilkDurum: null, hop: 1, sonUrl: null, sonDurum: 200, bekliyor: 'x' }
  const tek308 = (ek: Partial<Izlenen> = {}) => izle({ ilk: { durum: 308 }, hop: 1, sonUrl: '/yeni', ...ek })

  const vakalar: [string, Beklenti, Izlenen, string][] = [
    ['200 beklenen 200', b200, izle(), 'OK'],
    ['tek 308, doğru hedef, hedef 200', b308, tek308(), 'OK'],
    ['hedefteki sorgu dizesi hedef yolunu bozmaz', b308, tek308({ sonUrl: '/yeni?x=1' }), 'OK'],
    ['dilsiz 307 kabul', bDilsiz, izle({ ilk: { durum: 307 }, hop: 1, sonUrl: '/tr/yeni' }), 'OK'],
    ['dilsiz 308 kabul', bDilsiz, izle({ ilk: { durum: 308 }, hop: 1, sonUrl: '/tr/yeni' }), 'OK'],
    ['dilsiz 302 KIRMIZI', bDilsiz, izle({ ilk: { durum: 302 }, hop: 1, sonUrl: '/tr/yeni' }), 'KIRMIZI'],
    ['308 beklerken 307 KIRMIZI', b308, tek308({ ilk: { durum: 307 } }), 'KIRMIZI'],
    ['yanlış hedef KIRMIZI', b308, tek308({ sonUrl: '/baska' }), 'KIRMIZI'],
    ['hedef 404 KIRMIZI', b308, tek308({ sonDurum: 404 }), 'KIRMIZI'],
    ['hedef dış origin KIRMIZI', b308, tek308({ sonUrl: 'https://baska.test/yeni' }), 'KIRMIZI'],
    ['200 beklerken yönlendirme KIRMIZI', b200, izle({ ilk: { durum: 308 }, hop: 1, sonUrl: '/y' }), 'KIRMIZI'],
    ['200 beklerken 404 KIRMIZI', b200, izle({ ilk: { durum: 404 }, sonDurum: 404 }), 'KIRMIZI'],
    ['308 beklerken yönlendirme yok KIRMIZI', b308, izle(), 'KIRMIZI'],
    ['zincir (2 sıçrama) KIRMIZI, son hedef doğru olsa bile', b308, tek308({ hop: 2 }), 'KIRMIZI'],
    ['sıçrama sayısı beklenenden farklıysa KIRMIZI (ilk durum ve hedef doğru olsa bile; sözleşme vakası, mutasyon M27)', b200, izle({ hop: 1 }), 'KIRMIZI'],
    ['döngü KIRMIZI (ölçüm hatası değil)', b308, tek308({ hata: 'dongu' }), 'KIRMIZI'],
    ['sıçrama sınırı aşımı KIRMIZI', b308, tek308({ hata: 'hop-siniri', hop: 6 }), 'KIRMIZI'],
    ['zaman aşımı HATA', b308, izle({ ilk: null, sonDurum: null, hata: 'zaman-asimi' }), 'HATA'],
    ['5xx HATA', b200, izle({ ilk: { durum: 503 }, sonDurum: 503, hata: 'http-503' }), 'HATA'],
    ['ağ hatası HATA', b200, izle({ ilk: null, sonDurum: null, hata: 'ag: ECONNREFUSED' }), 'HATA'],
    ['bekliyor + yönlendirme → BEKLİYOR', bBekliyor, tek308(), 'BEKLİYOR'],
    ['bekliyor + 404 → BEKLİYOR', bBekliyor, izle({ ilk: { durum: 404 }, sonDurum: 404 }), 'BEKLİYOR'],
    ['bekliyor + hata → BEKLİYOR (bilgi satırı, ne kırmızı ne hata)', bBekliyor, izle({ ilk: null, hata: 'zaman-asimi' }), 'BEKLİYOR'],
  ]
  it.each(vakalar)('%s', (_ad, beklenti, satir, durum) => {
    expect(betik.degerlendir(beklenti, satir).durum).toBe(durum)
  })

  it('zincir ve döngü satırında SEBEP yazılır (okuyan neyin kırıldığını görür)', () => {
    expect(betik.degerlendir(b308, tek308({ hop: 2 })).gercek).toContain('ZİNCİR')
    const dongu = betik.degerlendir(b308, tek308({ hata: 'dongu' })).gercek
    expect(dongu).toContain('ZİNCİR')
    expect(dongu).toContain('DÖNGÜ')
    expect(betik.degerlendir(b308, tek308({ hata: 'hop-siniri', hop: 6 })).gercek).toContain('SIÇRAMA SINIRI')
  })

  it('gerçek metin ilk durumu, hedefi ve sıçrama sayısını taşır; hata satırında HATA nedeni yazılır', () => {
    expect(betik.degerlendir(b308, tek308()).gercek).toBe('308 → /yeni (son 200, sıçrama 1)')
    expect(betik.degerlendir(b200, izle()).gercek).toBe('200 (son 200, sıçrama 0)')
    expect(betik.degerlendir(b200, izle({ hata: 'http-503' })).gercek).toBe('HATA http-503')
  })

  it('ozetle: her durum kendi sayacına yazılır', () => {
    const s = ['OK', 'OK', 'KIRMIZI', 'HATA', 'BEKLİYOR', 'BEKLİYOR', 'BEKLİYOR'].map((durum) => ({ durum }))
    expect(betik.ozetle(s)).toEqual({ toplam: 7, ok: 2, kirmizi: 1, hata: 1, bekliyor: 3 })
  })
})

// ── 5. ana — sahte sunucuyla tarama ──────────────────────────────────────────

describe('tarama (ana) — sahte getir', () => {
  const taban = ['--taban', TABAN]

  it('⭐KUSURSUZ SUNUCU: çıkış 0, kırmızı 0, hata 0; kategori satırları BEKLİYOR; SORUNLU bölümü yok', async () => {
    const c = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(kusursuzCevaplar(KUCUK)) })
    expect(c.kod).toBe(0)
    expect(ozetSayilari(c)).toEqual({ toplam: KUCUK_TOPLAM, ok: KUCUK_TOPLAM - KUCUK_BEKLIYOR, kirmizi: 0, hata: 0, bekliyor: KUCUK_BEKLIYOR })
    expect(c.yazilan.join('\n')).not.toContain('SORUNLU')
    expect(c.hatalar).toEqual([])
  })

  it('tablo çıktısı: başlık + her beklenti için 1 satır (adres · beklenen · gerçek · durum)', async () => {
    const c = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(kusursuzCevaplar(KUCUK)) })
    const tablo = c.yazilan[0].split('\n')
    expect(tablo[0]).toBe('| Grup | Adres | Beklenen | Gerçek | Durum |')
    expect(tablo).toHaveLength(2 + KUCUK_TOPLAM)
    expect(tablo).toContain('| rota-dili-eski | `/tr/about` | 308 → /tr/hakkimizda (son 200) | 308 → /tr/hakkimizda (son 200, sıçrama 1) | OK |')
    expect(tablo.some((s) => s.startsWith('| kategori-eski | `/category/fanlar` |') && s.endsWith('| BEKLİYOR |'))).toBe(true)
  })

  it('⭐ZİNCİR: eski adres iki sıçramayla yeni adrese giderse KIRMIZI (çıkış 1), sebep ve adres yazılır', async () => {
    const c0 = kusursuzCevaplar(KUCUK)
    c0.set('/tr/about', [308, '/tr/ara'])
    c0.set('/tr/ara', [308, '/tr/hakkimizda'])
    const c = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(c0) })
    expect(c.kod).toBe(1)
    expect(ozetSayilari(c)).toMatchObject({ toplam: KUCUK_TOPLAM, kirmizi: 1, hata: 0 })
    const metin = c.yazilan.join('\n')
    expect(metin).toContain('SORUNLU SATIRLAR')
    expect(metin).toMatch(/KIRMIZI \/tr\/about · beklenen: 308 → \/tr\/hakkimizda \(son 200\) · gerçek: .*ZİNCİR/)
  })

  it('⭐YANLIŞ HEDEF: tek 308 ama başka sayfaya giderse KIRMIZI', async () => {
    const c0 = kusursuzCevaplar(KUCUK)
    c0.set('/tr/destek/sss', [308, '/tr/baska-sayfa'])
    c0.set('/tr/baska-sayfa', [200])
    const c = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(c0) })
    expect(c.kod).toBe(1)
    expect(ozetSayilari(c)).toMatchObject({ kirmizi: 1, hata: 0 })
    expect(c.yazilan.join('\n')).toContain('KIRMIZI /tr/destek/sss')
  })

  it('hedef sayfa yoksa (404): yeni adres, ona giden eski adres ve dilsiz eski adres kırmızı', async () => {
    const c0 = kusursuzCevaplar(KUCUK)
    c0.delete('/tr/sss')
    const c = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(c0) })
    expect(c.kod).toBe(1)
    const metin = c.yazilan.join('\n')
    expect(metin).toContain('KIRMIZI /tr/sss')
    expect(metin).toContain('KIRMIZI /tr/destek/sss')
    expect(metin).toContain('KIRMIZI /destek/sss')
    expect(ozetSayilari(c).kirmizi).toBe(3)
  })

  it('kalıcı yönlendirme yerine geçici (307) KIRMIZI: eski dilli adres 308 olmalı', async () => {
    const c0 = kusursuzCevaplar(KUCUK)
    c0.set('/en/destek/sss', [307, '/en/faq'])
    const c = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(c0) })
    expect(c.kod).toBe(1)
    expect(ozetSayilari(c).kirmizi).toBe(1)
    expect(c.yazilan.join('\n')).toContain('KIRMIZI /en/destek/sss')
  })

  it('dilsiz eski adreste 308 de 307 de kabul; 302 KIRMIZI', async () => {
    const c308 = kusursuzCevaplar(KUCUK)
    c308.set('/about', [308, '/tr/hakkimizda'])
    expect((await calistir(taban, { girdi: KUCUK, getir: sahteGetir(c308) })).kod).toBe(0)
    const c302 = kusursuzCevaplar(KUCUK)
    c302.set('/about', [302, '/tr/hakkimizda'])
    const r = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(c302) })
    expect(r.kod).toBe(1)
    expect(r.yazilan.join('\n')).toContain('KIRMIZI /about')
  })

  it('⭐HATA: ağ hatası o satırları HATA yapar, tarama DÜŞMEZ (19 beklentinin hepsi yazılır), çıkış 1', async () => {
    const asil = sahteGetir(kusursuzCevaplar(KUCUK))
    const getir: Getir = async (url) => {
      if (new URL(url).pathname === '/tr/hakkimizda') throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } })
      return asil(url)
    }
    const c = await calistir(taban, { girdi: KUCUK, getir })
    expect(c.kod).toBe(1)
    // /tr/hakkimizda, ona giden /tr/about ve dilsiz /about: üç satır ölçülemedi
    expect(ozetSayilari(c)).toMatchObject({ toplam: KUCUK_TOPLAM, kirmizi: 0, hata: 3 })
    expect(c.yazilan.join('\n')).toContain('HATA ag: ECONNREFUSED')
  })

  it('HATA: zaman aşımı ve 5xx ayrı ayrı HATA (kırmızıya karışmaz)', async () => {
    const asil = sahteGetir(kusursuzCevaplar(KUCUK))
    const getir: Getir = async (url) => {
      const yol = new URL(url).pathname
      if (yol === '/en/faq') throw new DOMException('zaman', 'TimeoutError')
      if (yol === '/tr/sss') return { durum: 503, baslik: () => null }
      return asil(url)
    }
    const c = await calistir(taban, { girdi: KUCUK, getir })
    expect(c.kod).toBe(1)
    const sayi = ozetSayilari(c)
    expect(sayi.kirmizi).toBe(0)
    // /en/faq ve ona giden /en/destek/sss (zaman aşımı) · /tr/sss, /tr/destek/sss ve dilsiz /destek/sss (503)
    expect(sayi.hata).toBe(5)
    const metin = c.yazilan.join('\n')
    expect(metin).toContain('HATA zaman-asimi')
    expect(metin).toContain('HATA http-503')
  })

  it('döngü: eski adres kendine dönerse KIRMIZI (ölçüm hatası değil), çıkış 1', async () => {
    const c0 = kusursuzCevaplar(KUCUK)
    c0.set('/tr/about', [308, '/tr/about'])
    const c = await calistir(taban, { girdi: KUCUK, getir: sahteGetir(c0) })
    expect(c.kod).toBe(1)
    expect(ozetSayilari(c)).toMatchObject({ kirmizi: 1, hata: 0 })
    expect(c.yazilan.join('\n')).toContain('DÖNGÜ')
  })

  it('⭐BEKLİYOR kırmızı sayılmaz: kategori adresi 500 de, yönlendirme de olsa çıkış 0 ve satırlar BEKLİYOR', async () => {
    const c0 = kusursuzCevaplar(KUCUK)
    c0.set('/category/hava-perdeleri', [308, '/tr/kategori/yeni-agac'])
    c0.set('/tr/kategori/yeni-agac', [200])
    const asil = sahteGetir(c0)
    const getir: Getir = async (url) => (new URL(url).pathname === '/category/fanlar' ? { durum: 500, baslik: () => null } : asil(url))
    const c = await calistir(taban, { girdi: KUCUK, getir })
    expect(c.kod).toBe(0)
    expect(ozetSayilari(c)).toMatchObject({ kirmizi: 0, hata: 0, bekliyor: KUCUK_BEKLIYOR })
  })

  it('kararlılık: istek gecikmesi sonucun SIRASINI değiştirmez (aynı girdi, aynı tablo)', async () => {
    const asil = sahteGetir(kusursuzCevaplar(KUCUK))
    const a = await calistir(taban, { girdi: KUCUK, getir: asil })
    const gecikmeli: Getir = async (url) => {
      await new Promise((coz) => setTimeout(coz, 25 - (new URL(url).pathname.length % 25)))
      return asil(url)
    }
    const b = await calistir(taban, { girdi: KUCUK, getir: gecikmeli })
    expect(b.yazilan).toEqual(a.yazilan)
  })

  it('eşzamanlılık sınırı: aynı anda en çok 4 istek (ve gerçekten paralel)', async () => {
    const girdi: Girdi = { tablo: TABLO, modeller: MODELLER, tohum: TOHUM }
    const asil = sahteGetir(kusursuzCevaplar(girdi))
    let anlik = 0
    let enCok = 0
    const getir: Getir = async (url) => {
      anlik += 1
      enCok = Math.max(enCok, anlik)
      await new Promise((coz) => setTimeout(coz, 2))
      anlik -= 1
      return asil(url)
    }
    const c = await calistir(taban, { girdi, getir })
    expect(c.kod).toBe(0)
    expect(enCok).toBeLessThanOrEqual(4)
    expect(enCok).toBeGreaterThan(1)
  })

  it('--liste AĞSIZ: getir hiç çağrılmaz, her beklenti 1 satır, bekliyor işaretli', async () => {
    let cagri = 0
    const getir: Getir = async () => {
      cagri += 1
      throw new Error('ağa çıkılmamalıydı')
    }
    const c = await calistir(['--liste', ...taban], { girdi: KUCUK, getir })
    expect(c.kod).toBe(0)
    expect(cagri).toBe(0)
    expect(c.yazilan).toHaveLength(KUCUK_TOPLAM)
    expect(c.yazilan).toContain('rota-dili-eski\t/tr/about\t308 → /tr/hakkimizda (son 200)')
    expect(c.yazilan.filter((s) => s.endsWith('\t(bekliyor)'))).toHaveLength(KUCUK_BEKLIYOR)
  })

  it('--ornek 1: aile başına ek model beklentisi gelir (--liste ile sayılır)', async () => {
    const c = await calistir(['--liste', '--ornek', '1'], { girdi: KUCUK })
    // 9 rota dili + 3 model × 4 + 2 kategori
    expect(c.yazilan).toHaveLength(9 + 12 + 2)
  })

  it("--cikti: JSON dosyası (surum, taban, ozet, sonuclar) yazılır; tablo yine stdout'a gider", async () => {
    const dosya = path.join(geciciDizin(), 'tarama.json')
    const c = await calistir(['--taban', `${TABAN}/`, '--cikti', dosya], { girdi: KUCUK, getir: sahteGetir(kusursuzCevaplar(KUCUK)) })
    expect(c.kod).toBe(0)
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8')) as { surum: number; taban: string; ozet: { toplam: number; bekliyor: number }; sonuclar: unknown[] }
    expect(j).toMatchObject({ surum: 1, taban: TABAN, ozet: { toplam: KUCUK_TOPLAM, bekliyor: KUCUK_BEKLIYOR } })
    expect(j.sonuclar).toHaveLength(KUCUK_TOPLAM)
    expect(c.yazilan[0]).toContain('| Grup | Adres |')
  })
})

// ── 6. Komut satırı, girdi hataları, fail-closed ─────────────────────────────

describe('komut satırı ve girdi hataları (çıkış 2)', () => {
  const kotuArgumanlar: [string, string[], RegExp][] = [
    ['bilinmeyen bayrak', ['--bilinmeyen'], /bilinmeyen bayrak/],
    ['--taban değersiz', ['--taban'], /bir değer ister/],
    ['--taban adres değil', ['--taban', 'localhost 3000'], /geçerli bir adres değil/],
    ['--taban http/https dışı', ['--taban', 'ftp://x.test'], /yalnız http ya da https/],
    ['--ornek sayı değil', ['--ornek', 'x'], /0-20 arası/],
    ['--ornek negatif', ['--ornek', '-1'], /0-20 arası/],
    ['--ornek 21', ['--ornek', '21'], /0-20 arası/],
    ['--ornek ondalık', ['--ornek', '1.5'], /0-20 arası/],
  ]
  it.each(kotuArgumanlar)('%s → çıkış 2, açıklayıcı mesaj', async (_ad, argv, mesaj) => {
    const c = await calistir(argv, { girdi: KUCUK })
    expect(c.kod).toBe(2)
    expect(c.hatalar.join('\n')).toMatch(mesaj)
    expect(c.hatalar[0]).toMatch(/^onizleme-tarama: /)
  })

  it('--ornek sınırları: 0 ve 20 geçerli', () => {
    expect(betik.argumanlariOku(['--ornek', '0']).ek).toBe(0)
    expect(betik.argumanlariOku(['--ornek', '20']).ek).toBe(20)
  })

  it('--taban sondaki eğik çizgiler atılır; varsayılan yerel adres', () => {
    expect(betik.argumanlariOku(['--taban', 'http://x.test///']).taban).toBe('http://x.test')
    expect(betik.argumanlariOku([]).taban).toBe('http://localhost:3000')
  })

  it('⭐FAIL-CLOSED: beklenti listesi BOŞSA çıkış 2 (hiçbir şey taranmadan yeşil çıkılmaz), --liste dahil', async () => {
    const bos: Girdi = { tablo: [], modeller: [], tohum: null }
    for (const argv of [[], ['--liste']]) {
      const c = await calistir(argv, { girdi: bos })
      expect(c.kod, argv.join(' ')).toBe(2)
      expect(c.hatalar.join('\n')).toContain('beklenti listesi boş')
    }
  })

  it('model listesi okunamazsa çıkış 2 (sessizce atlanmaz)', async () => {
    const c = await calistir(['--liste', '--model-listesi', path.join(geciciDizin(), 'yok.csv')])
    expect(c.kod).toBe(2)
    expect(c.hatalar.join('\n')).toMatch(/ENOENT|no such file/i)
  })

  it('⭐bozuk rota dili tablosu tarama BAŞLAMADAN reddedilir (çekirdek doğrulayıcı çağrılıyor)', async () => {
    const bozuk = path.join(geciciDizin(), 'tablo.json')
    // iki satır AYNI klasör: tablonun kendi kuralı ("klasör başka satırda da var") bunu reddeder
    fs.writeFileSync(
      bozuk,
      JSON.stringify([
        { id: 'a', klasor: 'x', tr: 'a', en: 'a' },
        { id: 'b', klasor: 'x', tr: 'b', en: 'b' },
      ]),
    )
    await expect(betik.girdileriOku({ ...betik.argumanlariOku([]), tablo: bozuk })).rejects.toThrow(/klasor/)
  })

  it('--cikti yazılamazsa (dizin yok) çıkış 2 ve sebep yazılır; tablo yine de basılmış olur', async () => {
    const dosya = path.join(geciciDizin(), 'yok-dizin', 'tarama.json')
    const c = await calistir(['--taban', TABAN, '--cikti', dosya], { girdi: KUCUK, getir: sahteGetir(kusursuzCevaplar(KUCUK)) })
    expect(c.kod).toBe(2)
    expect(c.hatalar.join('\n')).toContain('çıktı yazılamadı')
    expect(ozetSatiri(c)).toContain('TARAMA')
  })

  it('CLI süreci: --liste çıkış 0 ve stderr boş; bilinmeyen bayrak çıkış 2', () => {
    const kos = (args: string[]): { kod: number; stdout: string; stderr: string } => {
      try {
        const stdout = execFileSync(process.execPath, [BETIK_YOLU, ...args], { cwd: KOK, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
        return { kod: 0, stdout, stderr: '' }
      } catch (e) {
        const h = e as { status?: number; stdout?: string; stderr?: string }
        return { kod: h.status ?? -1, stdout: String(h.stdout ?? ''), stderr: String(h.stderr ?? '') }
      }
    }
    const liste = kos(['--liste'])
    expect(liste.kod).toBe(0)
    expect(liste.stderr).toBe('')
    expect(liste.stdout.trim().split('\n').length).toBeGreaterThan(150)
    const kotu = kos(['--bilinmeyen'])
    expect(kotu.kod).toBe(2)
    expect(kotu.stderr).toContain('bilinmeyen bayrak')
  })
})

// ── 7. Gerçek depo ───────────────────────────────────────────────────────────

describe('⭐GERÇEK DEPO', () => {
  it('model listesi betiğin okuduğu sütunlarla sağlam: BOM ilk sütuna yapışmamış, hiçbir satırda boş sku/aile/slug/adres yok', () => {
    expect(Object.keys(HAM_MODELLER[0])[0], 'BOM ilk sütun adına yapışmış').toBe('sku')
    expect(MODELLER.length).toBeGreaterThan(100)
    const bozuk = MODELLER.filter((m) => !m.sku || !m.aile_yeni || !m.slug_bugun || !m.adres_tr.startsWith('/tr/') || !m.adres_en.startsWith('/en/')).map((m) => m.sku)
    expect(bozuk).toEqual([])
  })

  it('beklenti sayıları tablo ve model listesinden TÜRER (sabit sayı değil, ilişki); hiçbir adres iki beklenti taşımaz', () => {
    const b = betik.beklentileriUret({ tablo: TABLO, modeller: MODELLER, tohum: TOHUM })
    const say = (g: string) => b.filter((x) => x.grup === g).length
    const aile = new Set(MODELLER.map((m) => m.aile_yeni)).size
    expect(say('rota-dili-dilsiz')).toBe(TABLO.length)
    expect(say('rota-dili-yeni') + say('rota-dili-ayni')).toBe(TABLO.length * 2)
    expect(say('rota-dili-eski')).toBe(say('rota-dili-yeni'))
    expect(say('model-yeni')).toBe(aile * 2)
    expect(say('model-eski')).toBe(aile * 2)
    expect(say('kategori-eski')).toBe(Math.min(6, KATEGORI_SAYISI))
    expect(b.length, 'boş evren: beklenti listesi neredeyse boş').toBeGreaterThan(150)
    expect(new Set(b.map((x) => x.adres)).size, 'bir adres iki beklenti taşıyor (çelişki olabilir)').toBe(b.length)
  })

  it('⭐GERÇEK DEPO + kusursuz sahte sunucu: çıkış 0, kırmızı 0, hata 0; yalnız kategori satırları BEKLİYOR', async () => {
    const girdi: Girdi = { tablo: TABLO, modeller: MODELLER, tohum: TOHUM }
    const istekler: string[] = []
    // `girdi` ENJEKTE EDİLMEZ: betik tabloyu, CSV'yi ve tohumu kendi okur (varsayılan yollar + çekirdek doğrulayıcı)
    const c = await calistir(['--taban', TABAN], { getir: sahteGetir(kusursuzCevaplar(girdi), istekler) })
    const beklenen = betik.beklentileriUret(girdi)
    const bekliyor = beklenen.filter((x) => x.bekliyor).length
    expect(c.kod, c.yazilan.filter((s) => s.startsWith('  ')).join('\n')).toBe(0)
    expect(ozetSayilari(c)).toEqual({ toplam: beklenen.length, ok: beklenen.length - bekliyor, kirmizi: 0, hata: 0, bekliyor })
    expect(bekliyor).toBe(Math.min(6, KATEGORI_SAYISI))
    expect(istekler.length).toBeGreaterThan(beklenen.length) // yönlendirmeler izlendi
  })

  it('--liste gerçek depoda ağsız çalışır ve her satır en az 3 sütunlu (grup, adres, beklenen)', async () => {
    const c = await calistir(['--liste'])
    expect(c.kod).toBe(0)
    expect(c.yazilan.length).toBeGreaterThan(150)
    for (const s of c.yazilan) expect(s.split('\t').length, s).toBeGreaterThanOrEqual(3)
  })
})

// ── 8. Kapı: YALNIZ GET ──────────────────────────────────────────────────────

describe('⛔KAPI: yalnız GET, dış ağ yok', () => {
  it('kaynak tarama: kodda yazma yöntemi, fetch, ortam değişkeni ve yerel olmayan adres YOK', () => {
    const kod = fs
      .readFileSync(BETIK_YOLU, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(kod, 'betik yazma yöntemi içeriyor').not.toMatch(/\b(POST|PUT|PATCH|DELETE)\b/)
    expect(kod, 'betik doğrudan fetch/http çağırıyor (tek ağ kapısı matris.cjs ag olmalı)').not.toMatch(/\bfetch\s*\(|node:https?['"]/)
    expect(kod, 'betik ortam değişkeni (anahtar) okuyor').not.toMatch(/process\.env/)
    const dis = (kod.match(/https?:\/\/[^\s'"`)]+/g) ?? []).filter((a) => !a.startsWith('http://localhost'))
    expect(dis, 'yerel olmayan adres').toEqual([])
  })

  describe('gerçek istemci (ag) yerel sunucuya', () => {
    const metotlar: string[] = []
    let sunucu: http.Server
    let taban = ''

    beforeAll(async () => {
      const cevaplar = kusursuzCevaplar(KUCUK)
      sunucu = http.createServer((istek, yanit) => {
        metotlar.push(String(istek.method))
        const kayit = cevaplar.get(String(istek.url))
        if (!kayit) {
          yanit.writeHead(404)
          yanit.end()
          return
        }
        const [durum, konum] = kayit
        yanit.writeHead(durum, konum ? { location: konum } : {})
        yanit.end()
      })
      await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', coz))
      taban = `http://127.0.0.1:${(sunucu.address() as AddressInfo).port}`
    })

    afterAll(async () => {
      sunucu.closeAllConnections()
      await new Promise<void>((coz) => sunucu.close(() => coz()))
    })

    it('varsayılan istemciyle uçtan uca: çıkış 0 ve sunucuya gelen HER istek GET', async () => {
      const c = await calistir(['--taban', taban], { girdi: KUCUK })
      expect(c.kod, c.yazilan.join('\n')).toBe(0)
      expect(ozetSayilari(c)).toEqual({ toplam: KUCUK_TOPLAM, ok: KUCUK_TOPLAM - KUCUK_BEKLIYOR, kirmizi: 0, hata: 0, bekliyor: KUCUK_BEKLIYOR })
      expect(metotlar.length).toBeGreaterThan(KUCUK_TOPLAM)
      expect([...new Set(metotlar)]).toEqual(['GET'])
    })
  })
})
