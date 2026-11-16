/**
 * INV-DEGISEN-ADRES-2 · --eski-adres: adresi değişmiş sayfanın ESKİ adresi IndexNow'a gider (SEO-112, OPS-313 onayı 2026-11-16).
 *
 * Dayanak: IndexNow SSS "yönlendirilen ve 404/410 veren adresleri de gönderin" (okundu 2026-11-16). K4 değişmezi (200 vermeyen adres
 * gitmez) YALNIZ bu kip için delinir; delik kapılıdır: adres site alan adında, site haritasında DEĞİL, zincir ≤ 3 adım ve HER adım
 * kalıcı (301/308), zincir site içinde, son durak 200 + kanonik kendisi + site haritasında. Taban ve Google kuyruğuna yazılmaz.
 * Veri sahtedir (P6: gerçek arama verisi yok).
 */
import { mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { calistir, eskiAdresZinciri, ESKI_ADRES_AZAMI_ADIM } from '../degisen-adres-bildir.mjs'

const SITE = 'https://venthub.com.tr'
const HOST = 'venthub.com.tr'
const ANAHTAR = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
const BILGI = `${SITE}/tr/bilgi-merkezi/rehber-1`
const ESKI = `${SITE}/tr/destek/konular/ornek`
const ESKI_ONEKSIZ = `${SITE}/destek/konular/ornek`

type Adim = { durum: number; konum?: string }

/**
 * Sahte site. `sayfalar`: haritada olan 200 sayfalar (kanonik kendisi; `kanonik` ile değiştirilebilir). `adimlar`: yönlendirme tablosu
 * (redirect: 'manual' gibi tek adım döner). IndexNow POST'ları `postlar`a düşer.
 */
function sahte(adimlar: Record<string, Adim>, indexNowDurum = 200, kanonikler: Record<string, string> = {}) {
  const haritada = [BILGI]
  const postlar: { url: string; govde: { urlList: string[] } }[] = []
  const fetchFn = (async (url: string, init: { method?: string; body?: string } = {}) => {
    if (url === `${SITE}/sitemap.xml`) return new Response(`<urlset>${haritada.map((a) => `<url><loc>${a}</loc></url>`).join('')}</urlset>`, { status: 200 })
    if (init.method === 'POST') {
      postlar.push({ url, govde: JSON.parse(init.body ?? '{}') })
      return new Response('', { status: indexNowDurum })
    }
    const a = adimlar[url]
    if (a) {
      if (a.durum === 503) throw new Error('baglanti koptu')
      return new Response('', { status: a.durum, headers: a.konum ? { location: a.konum } : {} })
    }
    if (haritada.includes(url) || url in kanonikler) return new Response(`<title>X</title><link rel="canonical" href="${kanonikler[url] ?? url}"><h1>X</h1>`, { status: 200 })
    return new Response('', { status: 404 })
  }) as unknown as typeof fetch
  return { fetchFn, postlar }
}

async function eskiKos(fetchFn: typeof fetch, adresler: string[], kip: 'kuru' | 'uygula' = 'uygula') {
  const satirlar: string[] = []
  const d = mkdtempSync(join(tmpdir(), 'degisen-eski-'))
  const y = { tabanYolu: join(d, 'taban.json'), kuyrukYolu: join(d, 'kuyruk.jsonl') }
  const s = await calistir({ fetchFn, site: SITE, ...y, kip, k3bAcik: false, anahtar: ANAHTAR, zaman: '2026-11-16T09:00:00Z', cikti: (m: string) => satirlar.push(m), eskiAdresler: adresler })
  return { ...s, satirlar: satirlar.join('\n'), y }
}

describe('INV-DEGISEN-ADRES-2 · eskiAdresZinciri (saf kapı)', () => {
  it('(a) tek 308 → 200 kanonik kendisi: tamam, 1 adım', async () => {
    const { fetchFn } = sahte({ [ESKI]: { durum: 308, konum: '/tr/bilgi-merkezi/rehber-1' } })
    expect(await eskiAdresZinciri(fetchFn, ESKI, HOST)).toEqual({ durum: 'tamam', hedef: BILGI, adim: 1 })
  })
  it('(b) 301 de kalıcıdır; 302, 303, 307 geçicidir ve reddedilir', async () => {
    expect((await eskiAdresZinciri(sahte({ [ESKI]: { durum: 301, konum: BILGI } }).fetchFn, ESKI, HOST)).durum).toBe('tamam')
    for (const d of [302, 303, 307]) {
      const z = await eskiAdresZinciri(sahte({ [ESKI]: { durum: d, konum: BILGI } }).fetchFn, ESKI, HOST)
      expect(z.durum).toBe('sorunlu')
      expect(z.neden).toContain('kalıcı yönlendirme değil')
    }
  })
  it('(c) 200 veren adres yönlendirmiyor: eski adres değil', async () => {
    const z = await eskiAdresZinciri(sahte({}).fetchFn, BILGI, HOST)
    expect(z.durum).toBe('sorunlu')
    expect(z.neden).toContain('eski adres değil')
  })
  it('(d) zincir azami adımı aşarsa reddedilir; sınırda kabul', async () => {
    expect(ESKI_ADRES_AZAMI_ADIM).toBe(3)
    const d = (n: number) => `${SITE}/eski-${n}`
    const uc = sahte({ [d(1)]: { durum: 308, konum: d(2) }, [d(2)]: { durum: 308, konum: d(3) }, [d(3)]: { durum: 308, konum: BILGI } })
    expect(await eskiAdresZinciri(uc.fetchFn, d(1), HOST)).toEqual({ durum: 'tamam', hedef: BILGI, adim: 3 })
    const dort = sahte({ [d(1)]: { durum: 308, konum: d(2) }, [d(2)]: { durum: 308, konum: d(3) }, [d(3)]: { durum: 308, konum: d(4) }, [d(4)]: { durum: 308, konum: BILGI } })
    const z = await eskiAdresZinciri(dort.fetchFn, d(1), HOST)
    expect(z.durum).toBe('sorunlu')
    expect(z.neden).toContain('adımdan uzun')
  })
  it('(e) dış alan adı, döngü, Location yok, hedef 404, hedef kanoniği başka: sorunlu', async () => {
    const olaylar: [string, Record<string, Adim>, Record<string, string>][] = [
      ['dış alan adı', { [ESKI]: { durum: 308, konum: 'https://baska.example/x' } }, {}],
      ['döngü', { [ESKI]: { durum: 308, konum: ESKI_ONEKSIZ }, [ESKI_ONEKSIZ]: { durum: 308, konum: ESKI } }, {}],
      ['Location yok', { [ESKI]: { durum: 308 } }, {}],
      ['hedef 404', { [ESKI]: { durum: 308, konum: `${SITE}/tr/yok-sayfa` } }, {}],
      ['kanonik başka', { [ESKI]: { durum: 308, konum: `${SITE}/tr/ara` } }, { [`${SITE}/tr/ara`]: BILGI }],
    ]
    for (const [ad, adimlar, kan] of olaylar) {
      const z = await eskiAdresZinciri(sahte(adimlar, 200, kan).fetchFn, ESKI, HOST)
      expect(z.durum, ad).toBe('sorunlu')
    }
  })
  it('(f) 5xx ve ağ hatası okunamadi sayılır (sorunlu değil, "kaldırıldı" da değil)', async () => {
    expect((await eskiAdresZinciri(sahte({ [ESKI]: { durum: 503 } }).fetchFn, ESKI, HOST)).durum).toBe('okunamadi')
  })
})

describe('INV-DEGISEN-ADRES-2 · --eski-adres kipi (uçtan uca, sahte ağ)', () => {
  it('(g) kapıdan geçen eski adres IndexNow\'a gider; taban ve Google kuyruğu yazılmaz', async () => {
    const a = sahte({ [ESKI]: { durum: 308, konum: '/tr/bilgi-merkezi/rehber-1' } })
    const s = await eskiKos(a.fetchFn, [ESKI])
    expect(s.cikis).toBe(0)
    expect(a.postlar).toHaveLength(1)
    expect(a.postlar[0].govde.urlList).toEqual([ESKI])
    expect(s.satirlar).toContain('KABUL')
    expect(existsSync(s.y.tabanYolu)).toBe(false)
    expect(existsSync(s.y.kuyrukYolu)).toBe(false)
  })
  it('(h) kuru koşum ağa POST etmez', async () => {
    const a = sahte({ [ESKI]: { durum: 308, konum: BILGI } })
    const s = await eskiKos(a.fetchFn, [ESKI], 'kuru')
    expect(s.cikis).toBe(0)
    expect(a.postlar).toHaveLength(0)
    expect(s.satirlar).toContain('KURU KOŞUM')
  })
  it('(i) geçici adım içeren zincir hiçbir şey göndermez', async () => {
    const a = sahte({ [ESKI_ONEKSIZ]: { durum: 307, konum: ESKI }, [ESKI]: { durum: 308, konum: BILGI } })
    const s = await eskiKos(a.fetchFn, [ESKI_ONEKSIZ])
    expect(s.cikis).toBe(1)
    expect(a.postlar).toHaveLength(0)
  })
  it('(j) haritada olan, yönlendirmeyen ve dış alan adlı adres kapıdan geçmez; boş liste exit 2', async () => {
    const a = sahte({})
    const s = await eskiKos(a.fetchFn, [BILGI, `${SITE}/tr/yok-eski`, 'https://baska.example/x'])
    expect(s.cikis).toBe(1)
    expect(a.postlar).toHaveLength(0)
    expect(s.satirlar).toContain('site haritasında: eski adres değil')
    expect(s.satirlar).toContain('dışında ya da geçersiz')
    expect((await eskiKos(sahte({}).fetchFn, [' ', ''])).cikis).toBe(2)
  })
  it('(k) IndexNow reddederse çıkış 1; hedef site haritasında değilse gönderilmez', async () => {
    expect((await eskiKos(sahte({ [ESKI]: { durum: 308, konum: BILGI } }, 403).fetchFn, [ESKI])).cikis).toBe(1)
    const haritaDisi = sahte({ [ESKI]: { durum: 308, konum: `${SITE}/tr/harita-disi` } }, 200, { [`${SITE}/tr/harita-disi`]: `${SITE}/tr/harita-disi` })
    const s = await eskiKos(haritaDisi.fetchFn, [ESKI])
    expect(s.cikis).toBe(1)
    expect(haritaDisi.postlar).toHaveLength(0)
    expect(s.satirlar).toContain('site haritasında yok')
  })
  it('(l) --eski-adres ile --adres ya da --taban-kur birlikte kullanılamaz (exit 2)', async () => {
    const a = sahte({ [ESKI]: { durum: 308, konum: BILGI } })
    const d = mkdtempSync(join(tmpdir(), 'degisen-eski-'))
    const ortak = { fetchFn: a.fetchFn, site: SITE, tabanYolu: join(d, 't.json'), kuyrukYolu: join(d, 'k.jsonl'), k3bAcik: false, anahtar: ANAHTAR, zaman: '2026-11-16T09:00:00Z', cikti: () => {}, eskiAdresler: [ESKI] }
    expect((await calistir({ ...ortak, kip: 'uygula', adresler: [BILGI] })).cikis).toBe(2)
    expect((await calistir({ ...ortak, kip: 'taban-kur' })).cikis).toBe(2)
    expect(a.postlar).toHaveLength(0)
  })
})
