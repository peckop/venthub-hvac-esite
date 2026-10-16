/**
 * INV-DEGISEN-ADRES-1 · Değişen adres bildiricinin çekirdeği (Kanban SEO-55 Parça B; ölçüm ve tasarım:
 * docs/audits/geo-dizin-tetigi-olcum-2026-10-16.md).
 *
 * Kilitlenenler: özet yalnız title/description/H1'e bakar; ilk koşuda taban yoksa hiçbir şey bildirilmez; K4 kapalıyken
 * ürün/kategori/marka adresi IndexNow'a GİTMEZ ama Google kuyruğuna girer ve tabanı eski kalır (kapı açılınca gider);
 * IndexNow reddederse taban ilerlemez; okunamayan adres "kalktı" sayılmaz; çok adres okunamazsa koşu durur ve hiçbir
 * şey yazmaz; kuru koşuda ağa POST ve dosyaya yazım yoktur; taban/kuyruk depo içine yazılamaz.
 */
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  calistir,
  depoIciMi,
  farkHesapla,
  indexNowPlani,
  jsonlOku,
  kuyrukBirlestir,
  ozetHash,
  sayfaOzeti,
  sitemapOku,
  yeniTaban,
} from '../degisen-adres-bildir.mjs'

const SITE = 'https://venthub.com.tr'
const ANAHTAR = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
const BILGI = `${SITE}/tr/bilgi-merkezi/rehber-1`
const URUN = `${SITE}/tr/products/aile-1`
const KATEGORI = `${SITE}/tr/category/fan`

const kayit = (hash: string, lastmod: string | null = null) => ({ hash, lastmod })

describe('INV-DEGISEN-ADRES-1 · saf çekirdek', () => {
  it('(a) sayfaOzeti: title, description (öznitelik sırası serbest), ilk h1; varlıklar çözülür; yorum içi yok sayılır', () => {
    const html = `<!-- <title>yorum</title> --><title> Fan &amp; Aksesuar </title>
      <meta content='Kısa &quot;açıklama&quot;' name="description"><h1 class="x">Birinci <b>başlık</b></h1><h1>ikinci</h1>`
    expect(sayfaOzeti(html)).toEqual({ baslik: 'Fan & Aksesuar', aciklama: 'Kısa "açıklama"', h1: 'Birinci başlık' })
  })

  it('(b) sayfaOzeti: eksik alan boş metindir; alan kaybolunca hash DEĞİŞİR', () => {
    const tam = sayfaOzeti('<title>A</title><meta name="description" content="B"><h1>C</h1>')
    const eksik = sayfaOzeti('<title>A</title><h1>C</h1>')
    expect(eksik.aciklama).toBe('')
    expect(ozetHash(tam)).not.toBe(ozetHash(eksik))
    expect(ozetHash(tam)).toBe(ozetHash({ ...tam }))
  })

  it('(c) sitemapOku: lastmod okunur, yinelenen atılır; sitemapindex ve boş harita HATA', () => {
    const xml = `<urlset><url><loc>${BILGI}</loc><lastmod>2026-10-09T16:35:00Z</lastmod></url><url><loc>${URUN}</loc></url><url><loc>${URUN}</loc></url></urlset>`
    expect(sitemapOku(xml)).toEqual([
      { adres: BILGI, lastmod: '2026-10-09T16:35:00Z' },
      { adres: URUN, lastmod: null },
    ])
    expect(() => sitemapOku('<sitemapindex><sitemap><loc>x</loc></sitemap></sitemapindex>')).toThrow(/DİZİN/)
    expect(() => sitemapOku('<urlset></urlset>')).toThrow(/boş/)
  })

  it('(d) farkHesapla: yeni, metin, lastmod, aynı, kalkan; sıra yeni > metin > lastmod', () => {
    const taban = { a: kayit('1'), b: kayit('2'), c: kayit('3', 'x'), d: kayit('4'), eski: kayit('9') }
    const simdi = { a: kayit('1'), b: kayit('2b'), c: kayit('3', 'y'), d: kayit('4'), z: kayit('5') }
    const f = farkHesapla(taban, simdi)
    expect(f.degisimler).toEqual([
      { adres: 'z', tur: 'yeni' },
      { adres: 'b', tur: 'metin' },
      { adres: 'c', tur: 'lastmod' },
    ])
    expect(f.ayni).toBe(2)
    expect(f.kalkan).toEqual(['eski'])
  })

  it('(e) indexNowPlani: K4 kapalı → yalnız değişmeyen tür gider; bayrak açık ya da gevşek → hepsi', () => {
    const d = [BILGI, URUN, KATEGORI].map((adres) => ({ adres, tur: 'metin' }))
    expect(indexNowPlani(d, { k3bAcik: false, k4Gevsek: false })).toEqual({ gidecek: [BILGI], bekleyen: [URUN, KATEGORI] })
    expect(indexNowPlani(d, { k3bAcik: true, k4Gevsek: false }).gidecek).toHaveLength(3)
    expect(indexNowPlani(d, { k3bAcik: false, k4Gevsek: true }).bekleyen).toHaveLength(0)
  })

  it('(f) yeniTaban: bekleyenin eski kaydı kalır, eski kaydı olmayan bekleyen hiç girmez, okunamayan korunur, kalkan düşer', () => {
    const taban = { bekleyen: kayit('eski'), okunamayan: kayit('o'), kalkan: kayit('k'), ayni: kayit('s') }
    const simdi = { bekleyen: kayit('yeni'), ayni: kayit('s'), yeniAdres: kayit('n'), bekleyenYeni: kayit('b') }
    const haritada = new Set(['bekleyen', 'okunamayan', 'ayni', 'yeniAdres', 'bekleyenYeni'])
    const t = yeniTaban(taban, simdi, new Set(['bekleyen', 'bekleyenYeni']), haritada)
    expect(t.bekleyen).toEqual(kayit('eski'))
    expect(t.okunamayan).toEqual(kayit('o'))
    expect(t.yeniAdres).toEqual(kayit('n'))
    expect('bekleyenYeni' in t).toBe(false)
    expect('kalkan' in t).toBe(false)
  })

  it('(g) kuyrukBirlestir: yinelenen tek satır, tür yükselir, ilk görülme korunur, sıra öncelik sonra zaman', () => {
    const mevcut = [{ adres: 'a', tur: 'lastmod', gorulme: '2026-10-10' }, { adres: 'b', tur: 'metin', gorulme: '2026-10-11' }]
    const k = kuyrukBirlestir(mevcut, [{ adres: 'a', tur: 'yeni' }, { adres: 'c', tur: 'lastmod' }, { adres: 'b', tur: 'lastmod' }], '2026-10-16')
    expect(k).toEqual([
      { adres: 'a', tur: 'yeni', gorulme: '2026-10-10' },
      { adres: 'b', tur: 'metin', gorulme: '2026-10-11' },
      { adres: 'c', tur: 'lastmod', gorulme: '2026-10-16' },
    ])
  })

  it('(h) depoIciMi: depo içi yol true, dışı false, kardeş klasör (ön ek benzeri) false', () => {
    expect(depoIciMi('/depo/docs/x.json', '/depo')).toBe(true)
    expect(depoIciMi('/depo', '/depo')).toBe(true)
    expect(depoIciMi('/depo-yedek/x.json', '/depo')).toBe(false)
    expect(depoIciMi(resolve(tmpdir(), 'x.json'))).toBe(false)
  })
})

// ─────────────────────────────── sahte ağ ile uçtan uca ───────────────────────────────

type Sayfa = { baslik: string; durum?: number; kanonik?: string }

/** Sahte site: sitemap + sayfalar + IndexNow uç noktası. */
function sahteSite(sayfalar: Record<string, Sayfa>, lastmodlar: Record<string, string> = {}, indexNowDurum = 200) {
  const postlar: { url: string; govde: any }[] = []
  const fetchFn = (async (url: string, init: { method?: string; body?: string } = {}) => {
    if (url === `${SITE}/sitemap.xml`) {
      const xml = `<urlset>${Object.keys(sayfalar).map((a) => `<url><loc>${a}</loc>${lastmodlar[a] ? `<lastmod>${lastmodlar[a]}</lastmod>` : ''}</url>`).join('')}</urlset>`
      return new Response(xml, { status: 200 })
    }
    if (init.method === 'POST') {
      postlar.push({ url, govde: JSON.parse(init.body ?? '{}') })
      return new Response('', { status: indexNowDurum })
    }
    const s = sayfalar[url]
    if (!s) return new Response('', { status: 404 })
    if (s.durum === 503) throw new Error('baglanti koptu')
    return new Response(`<title>${s.baslik}</title><link rel="canonical" href="${s.kanonik ?? url}"><h1>${s.baslik}</h1>`, { status: s.durum ?? 200 })
  }) as unknown as typeof fetch
  return { fetchFn, postlar }
}

function dizin() {
  const d = mkdtempSync(join(tmpdir(), 'degisen-adres-'))
  return { tabanYolu: join(d, 'taban.json'), kuyrukYolu: join(d, 'kuyruk.jsonl') }
}

const sayfalar = (): Record<string, Sayfa> => ({ [BILGI]: { baslik: 'Rehber' }, [URUN]: { baslik: 'Ürün' }, [KATEGORI]: { baslik: 'Kategori' } })

async function kos(fetchFn: typeof fetch, y: ReturnType<typeof dizin>, kip: 'kuru' | 'taban-kur' | 'uygula', k3bAcik = false) {
  const satirlar: string[] = []
  const s = await calistir({ fetchFn, site: SITE, ...y, kip, k3bAcik, anahtar: ANAHTAR, zaman: '2026-10-16T09:00:00Z', cikti: (m: string) => satirlar.push(m) })
  return { ...s, satirlar: satirlar.join('\n') }
}

describe('INV-DEGISEN-ADRES-1 · uçtan uca', () => {
  it('(i) taban yokken --uygula exit 2 ve hiçbir şey yazılmaz/gönderilmez', async () => {
    const y = dizin()
    const { fetchFn, postlar } = sahteSite(sayfalar())
    const s = await kos(fetchFn, y, 'uygula')
    expect(s.cikis).toBe(2)
    expect(postlar).toHaveLength(0)
    expect(existsSync(y.tabanYolu) || existsSync(y.kuyrukYolu)).toBe(false)
  })

  it('(j) --taban-kur tabanı yazar, hiçbir şey bildirmez; taban ham metin içermez', async () => {
    const y = dizin()
    const { fetchFn, postlar } = sahteSite(sayfalar())
    const s = await kos(fetchFn, y, 'taban-kur')
    expect(s.cikis).toBe(0)
    expect(postlar).toHaveLength(0)
    const ham = readFileSync(y.tabanYolu, 'utf8')
    expect(Object.keys(JSON.parse(ham).adresler)).toHaveLength(3)
    expect(ham).not.toContain('Rehber')
  })

  it('(k) kuru koşum: fark basılır, ağa POST yok, dosya değişmez', async () => {
    const y = dizin()
    await kos(sahteSite(sayfalar()).fetchFn, y, 'taban-kur')
    const once = readFileSync(y.tabanYolu, 'utf8')
    const degisen = { ...sayfalar(), [BILGI]: { baslik: 'Rehber v2' } }
    const { fetchFn, postlar } = sahteSite(degisen)
    const s = await kos(fetchFn, y, 'kuru')
    expect(s.cikis).toBe(0)
    expect(s.satirlar).toContain('metin')
    expect(postlar).toHaveLength(0)
    expect(readFileSync(y.tabanYolu, 'utf8')).toBe(once)
    expect(existsSync(y.kuyrukYolu)).toBe(false)
  })

  it('(l) K4 kapalı: değişmeyen tür IndexNow\'a gider; ürün gitmez, kuyruğa girer, tabanı eski kalır; sonraki koşuda yeniden görünür', async () => {
    const y = dizin()
    await kos(sahteSite(sayfalar()).fetchFn, y, 'taban-kur')
    const degisen = { ...sayfalar(), [BILGI]: { baslik: 'Rehber v2' }, [URUN]: { baslik: 'Ürün v2' } }
    const a = sahteSite(degisen)
    const s = await kos(a.fetchFn, y, 'uygula')
    expect(s.cikis).toBe(0)
    expect(a.postlar).toHaveLength(1)
    expect(a.postlar[0].govde.urlList).toEqual([BILGI])
    expect(a.postlar[0].govde.keyLocation).toBe(`${SITE}/${ANAHTAR}.txt`)
    expect(jsonlOku(readFileSync(y.kuyrukYolu, 'utf8')).map((q: any) => q.adres).sort()).toEqual([BILGI, URUN].sort())
    // İkinci koşu: rehber artık tabanda (gönderildi), ürün hâlâ "metin" farkı (K4 bekliyor), tekrar POST yok.
    const b = sahteSite(degisen)
    const s2 = await kos(b.fetchFn, y, 'uygula')
    expect(s2.satirlar).toMatch(/metin\s+https:\/\/venthub\.com\.tr\/tr\/products\/aile-1/)
    expect(s2.satirlar).not.toContain(BILGI)
    expect(b.postlar).toHaveLength(0)
  })

  it('(m) bayrak açıkken ürün de IndexNow\'a gider', async () => {
    const y = dizin()
    await kos(sahteSite(sayfalar()).fetchFn, y, 'taban-kur')
    const a = sahteSite({ ...sayfalar(), [URUN]: { baslik: 'Ürün v2' } })
    const s = await kos(a.fetchFn, y, 'uygula', true)
    expect(s.cikis).toBe(0)
    expect(a.postlar[0].govde.urlList).toEqual([URUN])
  })

  it('(n) IndexNow reddederse exit 1 ve taban ilerlemez (yeniden denenir); kuyruk yine yazılır', async () => {
    const y = dizin()
    await kos(sahteSite(sayfalar()).fetchFn, y, 'taban-kur')
    const once = readFileSync(y.tabanYolu, 'utf8')
    const a = sahteSite({ ...sayfalar(), [BILGI]: { baslik: 'Rehber v2' } }, {}, 429)
    const s = await kos(a.fetchFn, y, 'uygula')
    expect(s.cikis).toBe(1)
    expect(JSON.parse(readFileSync(y.tabanYolu, 'utf8')).adresler).toEqual(JSON.parse(once).adresler)
    expect(existsSync(y.kuyrukYolu)).toBe(true)
  })

  it('(o) okunamayan oranı azami değeri aşarsa (3 adresin 1\'i) koşu DURUR: exit 1, POST yok', async () => {
    const y = dizin()
    await kos(sahteSite(sayfalar()).fetchFn, y, 'taban-kur')
    const bos = { ...sayfalar(), [URUN]: { baslik: 'Ürün', durum: 503 }, [KATEGORI]: { baslik: 'Kategori v2', kanonik: `${SITE}/tr/baska` } }
    const a = sahteSite(bos)
    const s = await kos(a.fetchFn, y, 'uygula')
    expect(s.cikis).toBe(1)
    expect(a.postlar).toHaveLength(0)
  })

  it('(p) küçük oranlı okunamayan: taban korunur, sorunlu adres bildirilmez', async () => {
    const y = dizin()
    const cok: Record<string, Sayfa> = {}
    for (let i = 1; i <= 10; i++) cok[`${SITE}/tr/bilgi-merkezi/y-${i}`] = { baslik: `Y${i}` }
    await kos(sahteSite(cok).fetchFn, y, 'taban-kur')
    const yeni = { ...cok, [`${SITE}/tr/bilgi-merkezi/y-1`]: { baslik: 'Y1', durum: 503 }, [`${SITE}/tr/bilgi-merkezi/y-2`]: { baslik: 'Y2 v2', kanonik: `${SITE}/tr/baska` } }
    const a = sahteSite(yeni)
    const s = await kos(a.fetchFn, y, 'uygula')
    expect(s.cikis).toBe(0)
    expect(a.postlar).toHaveLength(0)
    const taban = JSON.parse(readFileSync(y.tabanYolu, 'utf8')).adresler
    expect(Object.keys(taban)).toHaveLength(10)
    expect(s.satirlar).toContain('SORUNLU')
    expect(s.satirlar).toContain('OKUNAMADI')
  })

  it('(q) yalnız lastmod değişimi: IndexNow\'a gider (K4 değişmeyen tür), türü lastmod olarak kuyruğa girer', async () => {
    const y = dizin()
    await kos(sahteSite(sayfalar(), { [BILGI]: '2026-10-09T00:00:00Z' }).fetchFn, y, 'taban-kur')
    const a = sahteSite(sayfalar(), { [BILGI]: '2026-10-15T00:00:00Z' })
    const s = await kos(a.fetchFn, y, 'uygula')
    expect(s.cikis).toBe(0)
    expect(a.postlar[0].govde.urlList).toEqual([BILGI])
    expect(jsonlOku(readFileSync(y.kuyrukYolu, 'utf8'))[0].tur).toBe('lastmod')
  })

  it('(r) CLI: depo içi --taban exit 2; --kuyruk yok exit 2', async () => {
    const { spawnSync } = await import('node:child_process')
    const betik = resolve(__dirname, '..', 'degisen-adres-bildir.mjs')
    const depoIci = spawnSync(process.execPath, [betik, '--taban', resolve(__dirname, 'x.json'), '--kuyruk', join(tmpdir(), 'k.jsonl')], { encoding: 'utf8' })
    expect(depoIci.status).toBe(2)
    expect(depoIci.stderr).toMatch(/depo içinde/)
    const kuyruksuz = spawnSync(process.execPath, [betik, '--taban', join(tmpdir(), 't.json')], { encoding: 'utf8' })
    expect(kuyruksuz.status).toBe(2)
  })
})
