/**
 * INV-GSC-SORGU-OKU-1 · Genel Search Console sorgu okuyucunun ağsız parçaları (Kanban SEO-97, OPS-256 adayı 1;
 * cetveller docs/standards/pazar-olcum-standard.md P2/P6).
 *
 * Kilitlenenler: bitiş tarihi son 3 gün ön veriyi aşamaz; geçersiz boyut/süzgeç/aralık reddedilir (çıkış 2 yolu);
 * süzgeçler API gövdesine doğru yazılır; sayfalama startRow ile ilerler ve eksik sayfa tam veri gibi dönmez; hata
 * yanıtı sessiz sıfır olmaz; ortalama sıra gösterim ağırlıklıdır; --cikti olmadan CLI koşmaz.
 */
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import {
  argumanAyikla, suzgecler, govdeKur, satirNormalle, suz, toplam, ekranSatirlari, okuSorgu, SAYFA_BOYUTU,
} from '../gsc-sorgu-oku.mjs'

const BUGUN = new Date('2026-11-09T09:00:00Z')
// Dönüş tipi {secenek}|{hata} birleşimi; testte iki alan da okunur.
const ayikla = (...a: string[]) => argumanAyikla(a, BUGUN) as { secenek: any; hata?: string }

const yanit = (govde: unknown, ok = true) => ({ ok, status: ok ? 200 : 403, json: async () => govde })
const satir = (keys: string[], gos = 10, tik = 1, pos = 5.04) => ({ keys, clicks: tik, impressions: gos, ctr: tik / gos, position: pos })

describe('INV-GSC-SORGU-OKU-1 · argüman', () => {
  it('(a) varsayılanlar: boyut query, 28 gün, bitiş bugünden 3 gün önce, satır 1000', () => {
    const r = ayikla('--cikti', 'x')
    expect(r.hata).toBeUndefined()
    expect(r.secenek.boyut).toEqual(['query'])
    expect(r.secenek.d).toEqual({ startDate: '2026-10-10', endDate: '2026-11-06' }) // 28 gün, uçlar dahil
    expect(r.secenek.satir).toBe(1000)
  })

  it('(b) geçersiz boyut, yinelenen boyut, çakışan süzgeç ve bozuk regex reddedilir', () => {
    expect(ayikla('--boyut', 'query,kedi').hata).toMatch(/geçersiz/)
    expect(ayikla('--boyut', 'query,query').hata).toMatch(/yinelenen/)
    expect(ayikla('--sorgu-icerir', 'a', '--sorgu-esit', 'b').hata).toMatch(/birlikte/)
    expect(ayikla('--adres-icerir', 'a', '--adres-esit', 'https://x').hata).toMatch(/birlikte/)
    expect(ayikla('--sorgu-regex', '(').hata).toMatch(/regex/)
    expect(ayikla('--boyut', 'page', '--sorgu-regex', 'fan').hata).toMatch(/query/)
    expect(ayikla('--sorgu-icerir').hata).toMatch(/değer ister/)
  })

  it('(c) tarih aralığı: ön veri günleri reddedilir, ters aralık ve tek uç reddedilir, geçerli aralık alınır', () => {
    expect(ayikla('--baslangic', '2026-10-01', '--bitis', '2026-11-08').hata).toMatch(/aşamaz/)
    expect(ayikla('--baslangic', '2026-11-05', '--bitis', '2026-11-01').hata).toMatch(/sonra/)
    expect(ayikla('--baslangic', '2026-10-01').hata).toMatch(/birlikte/)
    expect(ayikla('--baslangic', '2026/10/01', '--bitis', '2026-10-05').hata).toMatch(/YYYY-MM-DD/)
    const r = ayikla('--baslangic', '2026-10-01', '--bitis', '2026-11-06')
    expect(r.secenek.d).toEqual({ startDate: '2026-10-01', endDate: '2026-11-06' })
  })

  it('(d) sayısal sınırlar: gün 1-480, satır en çok 100000; Windows yolu adres olarak reddedilir', () => {
    expect(ayikla('--gun', '0').hata).toMatch(/1-480/)
    expect(ayikla('--gun', '481').hata).toMatch(/1-480/)
    expect(ayikla('--satir', '100001').hata).toMatch(/100000/)
    expect(ayikla('--adres-esit', 'C:/Program Files/Git/tr/x').hata).toMatch(/Git Bash/)
  })
})

describe('INV-GSC-SORGU-OKU-1 · gövde ve satır', () => {
  it('(e) süzgeçler gövdeye yazılır; süzgeç yoksa dimensionFilterGroups hiç yoktur', () => {
    const s = ayikla('--boyut', 'query,page', '--sorgu-icerir', 'fan', '--adres-icerir', '/bilgi-merkezi/').secenek
    expect(suzgecler(s)).toEqual([{ groupType: 'and', filters: [
      { dimension: 'query', operator: 'contains', expression: 'fan' },
      { dimension: 'page', operator: 'contains', expression: '/bilgi-merkezi/' },
    ] }])
    const govde = govdeKur(s, 25000, 1000)
    expect(govde).toMatchObject({ dimensions: ['query', 'page'], startRow: 25000, rowLimit: 1000, dataState: 'final' })
    expect('dimensionFilterGroups' in govdeKur(ayikla().secenek, 0, 10)).toBe(false)
  })

  it('(f) satirNormalle: anahtarlar boyuta bağlanır; sıra 1 ondalığa yuvarlanır; anahtar sayısı uyuşmazsa HATA', () => {
    const r = satirNormalle(satir(['kanal fanı', 'https://x/y'], 20, 2, 7.26), ['query', 'page'])
    expect(r.anahtar).toEqual({ query: 'kanal fanı', page: 'https://x/y' })
    expect(r.sira).toBe(7.3)
    expect(() => satirNormalle(satir(['a']), ['query', 'page'])).toThrow(/2 anahtar/)
    expect(() => satirNormalle({ clicks: 1 }, ['query'])).toThrow(/anahtarsız/)
  })

  it('(g) suz: regex büyük/küçük harf duyarsız, en az gösterim; toplam sıra gösterim ağırlıklı, boş küme sıra null', () => {
    const s = ayikla('--sorgu-regex', '^kanal', '--en-az-gosterim', '5').secenek
    const hepsi = [
      satirNormalle(satir(['Kanal fanı'], 10, 1, 4), ['query']),
      satirNormalle(satir(['kanal tipi'], 30, 3, 8), ['query']),
      satirNormalle(satir(['kanal x'], 2, 0, 1), ['query']),
      satirNormalle(satir(['radyal'], 99, 9, 1), ['query']),
    ]
    const sonuc = suz(hepsi, s)
    expect(sonuc.map((r: { anahtar: { query: string } }) => r.anahtar.query)).toEqual(['Kanal fanı', 'kanal tipi'])
    expect(toplam(sonuc)).toMatchObject({ satir: 2, tik: 4, gosterim: 40, ortSira: 7 })
    expect(toplam([]).ortSira).toBeNull()
  })

  it('(h) ekranSatirlari: gösterime göre azalan, ilk N', () => {
    const sat = [satirNormalle(satir(['a'], 5), ['query']), satirNormalle(satir(['b'], 50), ['query']), satirNormalle(satir(['c'], 20), ['query'])]
    const e = ekranSatirlari(sat, 2)
    expect(e).toHaveLength(2)
    expect(e[0]).toMatch(/^b \| gösterim 50/)
    expect(e[1]).toMatch(/^c \| gösterim 20/)
  })
})

describe('INV-GSC-SORGU-OKU-1 · okuma', () => {
  it('(i) sayfalama: dolu sayfadan sonra startRow ilerler, eksik sayfada durur, kesildi bayrağı --satir sınırına bağlı', async () => {
    const s = { ...ayikla('--satir', String(SAYFA_BOYUTU + 3)).secenek }
    const gelen: number[] = []
    const fetchFn = (async (_u: string, init: { body: string }) => {
      const g = JSON.parse(init.body)
      gelen.push(g.startRow)
      const adet = g.startRow === 0 ? SAYFA_BOYUTU : 3
      return yanit({ rows: Array.from({ length: adet }, (_, i) => satir([`q${g.startRow + i}`])) })
    }) as unknown as typeof fetch
    const o = await okuSorgu(s, { jeton: 'j', fetchFn })
    expect(gelen).toEqual([0, SAYFA_BOYUTU])
    expect(o.satirlar).toHaveLength(SAYFA_BOYUTU + 3)
    expect(o.kesildi).toBe(true)
  })

  it('(j) ikinci sayfa hata verirse ilk sayfanın satırları DÖNMEZ: {hata}; ağ hatası da hata', async () => {
    const s = ayikla('--satir', String(SAYFA_BOYUTU + 10)).secenek
    let n = 0
    const f1 = (async () => (n++ === 0 ? yanit({ rows: Array.from({ length: SAYFA_BOYUTU }, (_, i) => satir([`q${i}`])) }) : yanit({ error: { code: 429, message: 'kota' } }, false))) as unknown as typeof fetch
    const o1 = await okuSorgu(s, { fetchFn: f1 })
    expect(o1.satirlar).toBeUndefined()
    expect(o1.hata).toMatch(/429 kota/)
    const f2 = (async () => { throw new Error('baglanti koptu') }) as unknown as typeof fetch
    expect((await okuSorgu(s, { fetchFn: f2 })).hata).toMatch(/ag baglanti koptu/)
  })

  it('(k) boş yanıt hata değildir ama satır sayısı 0 ve sıra null: sessiz sıfır ortalama üretilmez', async () => {
    const o = await okuSorgu(ayikla().secenek, { fetchFn: (async () => yanit({})) as unknown as typeof fetch })
    expect(o.satirlar).toEqual([])
    expect(o.kesildi).toBe(false)
    expect(toplam(o.satirlar).ortSira).toBeNull()
  })
})

describe('INV-GSC-SORGU-OKU-1 · CLI', () => {
  it('(l) --cikti yoksa, boyut geçersizse ya da anahtar yoksa çıkış 2 (ağa çıkmadan)', () => {
    const betik = resolve(__dirname, '..', 'gsc-sorgu-oku.mjs')
    const kos = (...a: string[]) => spawnSync(process.execPath, [betik, ...a], { encoding: 'utf8', env: { ...process.env, GSC_SA_ANAHTAR: '' } })
    const ciktisiz = kos()
    expect(ciktisiz.status).toBe(2)
    expect(ciktisiz.stderr).toMatch(/--cikti/)
    const kotu = kos('--boyut', 'kedi', '--cikti', 'x')
    expect(kotu.status).toBe(2)
    expect(kotu.stderr).toMatch(/geçersiz/)
    const anahtarsiz = kos('--cikti', resolve(__dirname, '..', '..', '..', '..', 'gsc-sorgu-oku-test-cikti'))
    expect(anahtarsiz.status).toBe(2)
  })
})
