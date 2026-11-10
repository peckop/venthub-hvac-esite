import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-YONLENDIRME-TABLO-1 · YÖNLENDİRME TABLOSU KAPISI (scripts/ci/yonlendirme-kapisi.cjs, ALT-177).
 *
 * Kapı URUN'un eski -> yeni eşleştirme tablosunu (CSV `eski;yeni;kod;tur;kaynak;not`) ölçer: tek sıçrama (zincir yok),
 * çakışma/kopya yok, hedef biçimi (A7: sorgu yok), ?sku= yalnız model satırında, gzip bütçesi ve sağlayıcıya özgü kural
 * dosyası yok (A6). Bu dosya kapının neyi YAKALAYIP neyi GEÇİRDİĞİNİ sabitler; her yakalama bir SABOTAJ koluyla da kanıtlanır.
 *
 * Gerçek tablo henüz commit'li değil (URN-157, geçişe bağlı): testler FİKSTÜR kullanır. Tablo VARSAYILAN_YOL'da belirince
 * son blok onu da denetler (yoksa atlanır ve bu açıkça yazılıdır — kapı o zamana dek yalnız fikstürle sınanmıştır).
 */

const KOK = path.resolve(__dirname, '../../..')
const req = createRequire(import.meta.url)
const kapi = req('../yonlendirme-kapisi.cjs') as {
  BASLIK: string
  VARSAYILAN_YOL: string
  TABLO_BUTCESI_BAYT: number
  csvAyristir: (m: string) => { satirlar: Satir[]; hatalar: Ihlal[] }
  denetle: (s: Satir[], o?: { hedefler?: Set<string> | null; butceBayt?: number }) => { ihlaller: Ihlal[]; bayt: number }
  saglayiciOzguDenetle: (kok: string) => Ihlal[]
  main: (argv: string[], kok: string) => number
}
type Satir = { satir: number; eski: string; yeni: string; kod: string; tur: string; kaynak: string; not: string }
type Ihlal = { kural: string; satir: number; mesaj: string }

const gecici: string[] = []
afterAll(() => gecici.forEach((d) => rmSync(d, { recursive: true, force: true })))
function tmp(): string {
  const d = mkdtempSync(path.join(tmpdir(), 'yonl-'))
  gecici.push(d)
  return d
}

const TEMIZ = [
  kapi.BASLIK,
  '/tr/category/fanlar;/tr/urunler/fanlar;308;kategori;canli-db;',
  '/en/category/fans;/en/products/fans;308;kategori;canli-db;',
  '/tr/products/vortice-lineo;/tr/urunler/vortice-lineo;308;aile;canli-db;',
  '/tr/products/vortice-lineo?sku=LNQ-100;/tr/urunler/vortice-lineo-lnq-100;308;model;canli-db;',
  '/tr/about;/tr/hakkimizda;308;sabit;site-haritasi;',
  '/tr/eski-sayfa;;410;sabit;dizin-listesi;kaldirildi',
].join('\n')

function olc(csv: string, o?: Parameters<typeof kapi.denetle>[1]) {
  const { satirlar, hatalar } = kapi.csvAyristir(csv)
  const s = kapi.denetle(satirlar, o)
  return [...hatalar, ...s.ihlaller].map((i) => i.kural)
}

describe('INV-YONLENDIRME-TABLO-1 · temiz tablo', () => {
  it('geçerli fikstür sıfır ihlal verir (CRLF ve BOM tolere edilir)', () => {
    expect(olc(TEMIZ)).toEqual([])
    expect(olc('\uFEFF' + TEMIZ.replace(/\n/g, '\r\n') + '\r\n')).toEqual([])
  })
  it('birden çok eski adres tek hedefe gidebilir (kategori birleşmesi ihlal değil)', () => {
    const csv = [kapi.BASLIK, '/tr/category/a;/tr/urunler/x;308;kategori;canli-db;', '/tr/category/b;/tr/urunler/x;308;kategori;canli-db;'].join('\n')
    expect(olc(csv)).toEqual([])
  })
})

describe('INV-YONLENDIRME-TABLO-1 · yakalananlar', () => {
  const ekle = (...satir: string[]) => [TEMIZ, ...satir].join('\n')

  it('ZİNCİR: yeni adres başka satırın eski adresi', () => {
    expect(olc(ekle('/tr/urunler/fanlar;/tr/urunler;308;kategori;canli-db;'))).toContain('ZINCIR')
  })
  it('ÇAKIŞMA: aynı eski iki farklı hedef; büyük/küçük harf aynı sayılır', () => {
    expect(olc(ekle('/tr/about;/tr/baska;308;sabit;site-haritasi;'))).toContain('CAKISMA')
    expect(olc(ekle('/TR/ABOUT;/tr/hakkimizda;308;sabit;site-haritasi;'))).toContain('CAKISMA')
  })
  it('KOPYA: aynı satır iki kez de CAKISMA', () => {
    expect(olc(ekle('/tr/about;/tr/hakkimizda;308;sabit;site-haritasi;'))).toContain('CAKISMA')
  })
  it('KENDİNE: değişmeyen adres tabloda olamaz', () => {
    expect(olc(ekle('/en/products/fans;/en/products/fans;308;kategori;canli-db;'))).toContain('KENDINE')
  })
  it('ÖLÜ-HEDEF: yeni adres 410 veren bir eski adres', () => {
    expect(olc(ekle('/tr/x;/tr/eski-sayfa;308;sabit;site-haritasi;'))).toContain('OLU-HEDEF')
  })
  it('YENİ-BİÇİM: hedefte sorgu, sondaki /, dil değişimi, boş hedef, 410 + hedef', () => {
    expect(olc(ekle('/tr/y1;/tr/urunler?sku=1;308;sabit;site-haritasi;'))).toContain('YENI-BICIM')
    expect(olc(ekle('/tr/y2;/tr/urunler/;308;sabit;site-haritasi;'))).toContain('YENI-BICIM')
    expect(olc(ekle('/tr/y3;/en/products;308;sabit;site-haritasi;'))).toContain('YENI-BICIM')
    expect(olc(ekle('/tr/y4;;308;sabit;site-haritasi;'))).toContain('YENI-BICIM')
    expect(olc(ekle('/tr/y5;/tr/urunler;410;sabit;site-haritasi;'))).toContain('YENI-BICIM')
  })
  it('ESKİ-BİÇİM: önek yok, sondaki /, parça, ?sku= dışı sorgu, ?sku= model dışı', () => {
    expect(olc(ekle('/products/a;/tr/urunler;308;aile;canli-db;'))).toContain('ESKI-BICIM')
    expect(olc(ekle('/tr/z1/;/tr/urunler;308;aile;canli-db;'))).toContain('ESKI-BICIM')
    expect(olc(ekle('/tr/z2#a;/tr/urunler;308;aile;canli-db;'))).toContain('ESKI-BICIM')
    expect(olc(ekle('/tr/z3?page=2;/tr/urunler;308;aile;canli-db;'))).toContain('ESKI-BICIM')
    expect(olc(ekle('/tr/z4?sku=A;/tr/urunler;308;aile;canli-db;'))).toContain('ESKI-BICIM')
    expect(olc(ekle('/tr/z7?sku=A;/tr/urunler;308;eski-sku;canli-db;'))).toEqual([])
    expect(olc(ekle('/tr/y0;/tr/destek#sss;308;sabit;site-haritasi;'))).toEqual([]) // #parça serbest
    expect(olc(ekle('/tr/z5?sku=;/tr/urunler;308;model;canli-db;'))).toContain('ESKI-BICIM')
  })
  it('?sku= satırı kendi tabanından AYRI anahtardır (ihlal değil); aynı ?sku= iki kez çakışır', () => {
    expect(olc(ekle('/tr/products/vortice-lineo?sku=LNQ-200;/tr/urunler/vortice-lineo-lnq-200;308;model;canli-db;'))).toEqual([])
    expect(olc(ekle('/tr/products/vortice-lineo?sku=lnq-100;/tr/urunler/baska;308;model;canli-db;'))).toContain('CAKISMA')
  })
  it('ZİNCİR sorgulu eski adresi saymaz: hedef yalnız ?sku= satırının tabanıyla aynıysa zincir değildir', () => {
    const csv = [kapi.BASLIK, '/tr/a?sku=1;/tr/b;308;model;canli-db;', '/tr/b?sku=2;/tr/c;308;model;canli-db;'].join('\n')
    expect(olc(csv)).toEqual([])
  })
  it('SATIR: sütun sayısı, kod, tur, kaynak; BAŞLIK: şema dışı sütun (sağlayıcı alanı)', () => {
    expect(olc(ekle('/tr/q1;/tr/urunler;308;aile;canli-db'))).toContain('SATIR')
    expect(olc(ekle('/tr/q2;/tr/urunler;301;aile;canli-db;'))).toContain('SATIR')
    expect(olc(ekle('/tr/q3;/tr/urunler;308;yok;canli-db;'))).toContain('SATIR')
    expect(olc(ekle('/tr/q4;/tr/urunler;308;aile;baska;'))).toContain('SATIR')
    expect(olc(TEMIZ.replace(kapi.BASLIK, 'eski;yeni;kod;tur;kaynak;not;vercel'))).toContain('BASLIK')
  })
  it('HEDEF-YOK: yaşayan adres listesi verilince listede olmayan hedef; liste verilmezse ölçülmez', () => {
    const yasayan = new Set(['/tr/urunler/fanlar', '/en/products/fans', '/tr/urunler/vortice-lineo', '/tr/urunler/vortice-lineo-lnq-100'])
    expect(olc(TEMIZ, { hedefler: yasayan })).toEqual(['HEDEF-YOK']) // /tr/hakkimizda yok
    yasayan.add('/tr/hakkimizda')
    expect(olc(TEMIZ, { hedefler: yasayan })).toEqual([])
  })
  it('BÜTÇE: gzip sınırı aşılınca; sınırın altında geçer', () => {
    const rastgele = (n: number) => Array.from({ length: n }, (_, i) => `/tr/products/p${i}-${(i * 2654435761) % 99991};/tr/urunler/p${i}-${(i * 40503) % 77777};308;aile;canli-db;`)
    const csv = [kapi.BASLIK, ...rastgele(300)].join('\n')
    expect(olc(csv, { butceBayt: 200 })).toContain('BUTCE')
    expect(olc(csv)).toEqual([])
    expect(kapi.TABLO_BUTCESI_BAYT).toBeLessThanOrEqual(1024 * 1024) // A7 sınırını aşmaz
  })
  it('BÜTÇE gerçekçi ölçek: 5000 satır varsayılan bütçenin altında kalır', () => {
    const satir = Array.from({ length: 5000 }, (_, i) => `/tr/products/aile-${i}-ornek-ad;/tr/urunler/aile-${i}-ornek-ad;308;aile;canli-db;`)
    const { satirlar } = kapi.csvAyristir([kapi.BASLIK, ...satir].join('\n'))
    const s = kapi.denetle(satirlar)
    expect(s.ihlaller).toEqual([])
    expect(s.bayt).toBeLessThan(kapi.TABLO_BUTCESI_BAYT)
  })
})

describe('INV-YONLENDIRME-TABLO-1 · A6 sağlayıcıya özgü kural yok', () => {
  it('depo kökü: vercel.json redirects/routes ve public/_redirects 3xx satırı yok', () => {
    expect(kapi.saglayiciOzguDenetle(KOK)).toEqual([])
  })
  it('vercel.json redirects, vercel.json routes ve _redirects 301 yakalanır; 200 satırı geçer', () => {
    const d = tmp()
    mkdirSync(path.join(d, 'public'))
    writeFileSync(path.join(d, 'public/_redirects'), '/assets/*  /assets/:splat  200\n# yorum\n')
    expect(kapi.saglayiciOzguDenetle(d)).toEqual([])
    writeFileSync(path.join(d, 'public/_redirects'), '/a /b 301\n')
    expect(kapi.saglayiciOzguDenetle(d).map((i) => i.kural)).toEqual(['SAGLAYICI'])
    writeFileSync(path.join(d, 'public/_redirects'), '/a /b 308!\n')
    expect(kapi.saglayiciOzguDenetle(d)).toHaveLength(1)
    writeFileSync(path.join(d, 'public/_redirects'), '')
    writeFileSync(path.join(d, 'vercel.json'), JSON.stringify({ redirects: [{ source: '/a', destination: '/b' }] }))
    expect(kapi.saglayiciOzguDenetle(d)).toHaveLength(1)
    writeFileSync(path.join(d, 'vercel.json'), JSON.stringify({ routes: [] }))
    expect(kapi.saglayiciOzguDenetle(d)).toHaveLength(1)
    writeFileSync(path.join(d, 'vercel.json'), '{bozuk')
    expect(kapi.saglayiciOzguDenetle(d)).toHaveLength(1) // ölçülemedi = ihlal (fail-closed)
    writeFileSync(path.join(d, 'vercel.json'), JSON.stringify({ headers: [] }))
    expect(kapi.saglayiciOzguDenetle(d)).toEqual([])
  })
})

describe('INV-YONLENDIRME-TABLO-1 · CLI', () => {
  it('tablo yoksa tablo kapısı atlanır (0), tablo temizse 0, kirliyse 1', () => {
    const d = tmp()
    expect(kapi.main(['node', 'k', '--kok', d], d)).toBe(0)
    const temiz = path.join(d, 't.csv')
    writeFileSync(temiz, TEMIZ)
    expect(kapi.main(['node', 'k', temiz, '--kok', d], d)).toBe(0)
    const kirli = path.join(d, 'k.csv')
    writeFileSync(kirli, TEMIZ + '\n/tr/about;/tr/baska;308;sabit;site-haritasi;')
    expect(kapi.main(['node', 'k', kirli, '--kok', d], d)).toBe(1)
  })
  it('--hedefler dosyası verilince HEDEF-YOK kırar', () => {
    const d = tmp()
    const t = path.join(d, 't.csv')
    const h = path.join(d, 'h.txt')
    writeFileSync(t, TEMIZ)
    writeFileSync(h, '/tr/urunler/fanlar\n')
    expect(kapi.main(['node', 'k', t, '--hedefler', h, '--kok', d], d)).toBe(1)
  })
})

describe('INV-YONLENDIRME-TABLO-1 · SABOTAJ (kaynağa tek tek hata sokulur; her kopya en az bir kontrolü kırar)', () => {
  const kaynak = readFileSync(path.join(KOK, 'scripts/ci/yonlendirme-kapisi.cjs'), 'utf8')
  const calistir = (kod: string): string[] => {
    const d = tmp()
    const yol = path.join(d, 'k.cjs')
    writeFileSync(yol, kod)
    const m = req(yol) as typeof kapi
    const ciktilar: string[] = []
    const ekle = (...satir: string[]) => [TEMIZ, ...satir].join('\n')
    const dene = (csv: string) => {
      const { satirlar, hatalar } = m.csvAyristir(csv)
      return [...hatalar, ...m.denetle(satirlar).ihlaller].map((i) => i.kural)
    }
    if (dene(TEMIZ).length) ciktilar.push('temiz-kirildi')
    if (!dene(ekle('/tr/urunler/fanlar;/tr/urunler;308;kategori;canli-db;')).includes('ZINCIR')) ciktilar.push('zincir-kacti')
    if (!dene(ekle('/tr/about;/tr/baska;308;sabit;site-haritasi;')).includes('CAKISMA')) ciktilar.push('cakisma-kacti')
    if (!dene(ekle('/en/products/fans;/en/products/fans;308;kategori;canli-db;')).includes('KENDINE')) ciktilar.push('kendine-kacti')
    if (!dene(ekle('/tr/x;/tr/eski-sayfa;308;sabit;site-haritasi;')).includes('OLU-HEDEF')) ciktilar.push('olu-hedef-kacti')
    if (!dene(ekle('/tr/y1;/tr/urunler?sku=1;308;sabit;site-haritasi;')).includes('YENI-BICIM')) ciktilar.push('yeni-sorgu-kacti')
    if (!dene(ekle('/tr/y3;/en/products;308;sabit;site-haritasi;')).includes('YENI-BICIM')) ciktilar.push('dil-degisimi-kacti')
    if (!dene(ekle('/tr/z3?page=2;/tr/urunler;308;aile;canli-db;')).includes('ESKI-BICIM')) ciktilar.push('eski-sorgu-kacti')
    if (!dene(ekle('/tr/z6?page=2;/tr/urunler;308;model;canli-db;')).includes('ESKI-BICIM')) ciktilar.push('model-sorgu-kacti')
    if (!dene(ekle('/tr/z4?sku=A;/tr/urunler;308;aile;canli-db;')).includes('ESKI-BICIM')) ciktilar.push('sku-tur-kacti')
    if (!dene(ekle('/TR/ABOUT;/tr/hakkimizda;308;sabit;site-haritasi;')).includes('CAKISMA')) ciktilar.push('buyuk-harf-kacti')
    if (!dene(ekle('/tr/q2;/tr/urunler;301;aile;canli-db;')).includes('SATIR')) ciktilar.push('kod-kacti')
    const { satirlar } = m.csvAyristir(TEMIZ)
    if (!m.denetle(satirlar, { butceBayt: 5 }).ihlaller.some((i) => i.kural === 'BUTCE')) ciktilar.push('butce-kacti')
    if (!m.denetle(satirlar, { hedefler: new Set() }).ihlaller.some((i) => i.kural === 'HEDEF-YOK')) ciktilar.push('hedef-kacti')
    return ciktilar
  }

  const SABOTAJLAR: Array<[string, string, string]> = [
    ['zincir kontrolü kapalı', "if (y !== anahtar(s.eski) && eskiSorgusuz.has(y)) {", 'if (false) {'],
    ['çakışma kontrolü kapalı', 'if (gorulen.has(k)) {', 'if (false) {'],
    ['anahtar harf duyarlı', 'return adres.toLowerCase()', 'return adres'],
    ['kendine yönlendirme kapalı', "anahtar(s.yeni) === k) ihlal('KENDINE'", "anahtar(s.yeni) === '\\0') ihlal('KENDINE'"],
    ['ölü hedef kapalı', 'if (olu.has(y))', 'if (false)'],
    ['yeni sorgu serbest', "if (y.includes('?'))", 'if (false)'],
    ['dil değişimi serbest', 'dilE && dilY && dilE !== dilY', 'false'],
    ['eski sorgu serbest', "if (!/^sku=[^&=\\s]+$/i.test(sorgu))", 'if (false)'],
    ['sku her türde', 'else if (!SKU_TURLERI.includes(s.tur))', 'else if (false)'],
    ['kod 301 serbest', "const KODLAR = ['308', '410']", "const KODLAR = ['308', '410', '301']"],
    ['bütçe kapalı', 'if (bayt > butce)', 'if (false)'],
    ['hedef kontrolü kapalı', 'if (hedefler && !hedefler.has(y))', 'if (false)'],
  ]

  it('sağlam kaynak sabotaj sürücüsünden temiz çıkar (sürücü kendisi doğru çalışıyor)', () => {
    expect(calistir(kaynak)).toEqual([])
  })
  it.each(SABOTAJLAR)('%s -> en az bir kontrol kırmızı', (_ad, bul, degis) => {
    expect(kaynak.includes(bul), `sabotaj hedefi kaynakta yok: ${bul}`).toBe(true)
    const kirilan = calistir(kaynak.replace(bul, degis))
    expect(kirilan.length, `sabotaj yakalanmadı: ${_ad}`).toBeGreaterThan(0)
  })
})

describe('INV-YONLENDIRME-TABLO-1 · gerçek tablo (URN-157)', () => {
  it('tablo VARSAYILAN_YOL\'da varsa sıfır ihlal; yoksa atlanır (kapı yalnız fikstürle sınanmıştır)', () => {
    const yol = path.join(KOK, kapi.VARSAYILAN_YOL)
    let metin: string
    try {
      metin = readFileSync(yol, 'utf8')
    } catch {
      return // tablo henüz commit'li değil: geçişe bağlı, URN-157
    }
    const { satirlar, hatalar } = kapi.csvAyristir(metin)
    const s = kapi.denetle(satirlar)
    expect([...hatalar, ...s.ihlaller]).toEqual([])
  })
})
