import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { baslikTuru, bilincliKurallar, enYayinOku, ornekTurleri, varsayilanBaslikMi } from '../bot-karnesi.mjs'

/**
 * INV-BOT-KARNESI-EN-YAYIN-1 · bot karnesi EN_YAYIN bayrağını KAYNAKTAN okur; bayrak kapalıyken hreflang
 * yokluğu BİLİNÇLİ sayılır (REC-439).
 *
 * ÖLÇÜLMÜŞ VAKA (2026-09-29, #1493 sonrası canlı): URUN EN_YAYIN kapalıyken hreflang beyanını kaldırdı;
 * betik bunu bilmiyordu ve 45/45 adresi "HREFLANG-YOK" kırmızısı saydı (TR sayfalar dahil) — yanlış alarm.
 * Çözümün ikinci yarısı: bayrak betiğe SABİT yazılmaz (EN_YAYIN açılınca unutulup gerçek hreflang eksiğini
 * gizlerdi); `src/config/features.ts`'ten okunur, okunamazsa HİÇBİR şey bilinçli sayılmaz.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: okuma, kural kapalıyken devreye girmesi, açıkken/belirsizken girmemesi
 * ayrı davranışlardır.
 */

function ozelDosya(icerik: string): string {
  const dizin = mkdtempSync(join(tmpdir(), 'vh-en-yayin-'))
  const yol = join(dizin, 'features.ts')
  writeFileSync(yol, icerik, 'utf8')
  return yol
}

const hreflangKurali = (acik: boolean | null) =>
  bilincliKurallar(acik as boolean).find((k: { sinif: string }) => k.sinif === 'HREFLANG-YOK')

describe('INV-BOT-KARNESI-EN-YAYIN-1 · EN_YAYIN kaynaktan okunur', () => {
  it('KOL 1 · `export const EN_YAYIN = false/true` doğru okunur', () => {
    expect(enYayinOku(ozelDosya('export const EN_YAYIN = false\n'))).toBe(false)
    expect(enYayinOku(ozelDosya('// x\nexport const EN_YAYIN = true // açık\n'))).toBe(true)
  })

  it('KOL 2 · dosya yok ya da bayrak bulunamıyor → null (belirsiz, bilinçli sayılmaz)', () => {
    expect(enYayinOku(join(tmpdir(), 'olmayan-features-dosyasi.ts'))).toBeNull()
    expect(enYayinOku(ozelDosya('export const BASKA = false\n'))).toBeNull()
  })

  it('KOL 3 · GERÇEK depo dosyası okunabiliyor (regex kaynak biçimiyle hâlâ eşleşiyor)', () => {
    expect(typeof enYayinOku(), 'src/config/features.ts EN_YAYIN biçimi değişti: regex artık eşleşmiyor').toBe('boolean')
  })
})

describe('INV-BOT-KARNESI-EN-YAYIN-1 · HREFLANG-YOK bilinçli kuralı', () => {
  it('KOL 4 · bayrak KAPALI → kural var ve HER sayfada koşul doğru (TR dahil)', () => {
    const k = hreflangKurali(false)
    expect(k, 'HREFLANG-YOK bilinçli kuralı yok').toBeDefined()
    expect(k?.kosul({ son: '/tr/products', tur: 'urun-listesi' })).toBe(true)
    expect(k?.kosul({ son: '/en', tur: 'ana' })).toBe(true)
  })

  it('KOL 5 · bayrak AÇIK → kural KOŞMAZ: hreflang eksiği kusur olarak KALIR', () => {
    expect(hreflangKurali(true)?.kosul({ son: '/tr/products' })).toBe(false)
  })

  it('KOL 6 · bayrak BELİRSİZ (null) → kural KOŞMAZ: belirsizlik kusuru gizlemez', () => {
    expect(hreflangKurali(null)?.kosul({ son: '/tr/products' })).toBe(false)
  })

  it('KOL 7 · mevcut /en kuralları bozulmadı (INDEKSE-KAPALI, HARITADA-YOK hâlâ /en için)', () => {
    const kurallar = bilincliKurallar(false) as Array<{ sinif: string; kosul: (s: unknown) => boolean }>
    expect(kurallar.find((k) => k.sinif === 'INDEKSE-KAPALI')?.kosul({ son: '/en/products' })).toBe(true)
    expect(kurallar.find((k) => k.sinif === 'INDEKSE-KAPALI')?.kosul({ son: '/tr/products' })).toBe(false)
  })
})

/**
 * INV-BOT-KARNESI-BASLIK-1 · bot karnesi layout varsayılan başlığını ESKİ ve YENİ biçimde tanır (SEO-25).
 *
 * ÖLÇÜLMÜŞ RİSK (2026-10-09, abartı taraması): `meta.siteTitle` "VentHub — Premium HVAC Çözümleri"nden ana sayfanın canlı başlığına
 * ("VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri") geçiyor. Karne kalıbı eski metne kilitliydi: yeni başlık dağılınca
 * "kendi title yok" (VARSAYILAN-BASLIK) kusurunu GÖRMEZ olurdu. Ters risk: yeni varsayılan ana sayfanın kendi başlığıyla AYNI metin;
 * naif bir kalıp ana sayfayı yanlış kusurlu sayardı.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: eski biçim, yeni biçim, ana sayfa istisnası, yanlış eşleşmeme ve kaynak bağı ayrı davranışlardır.
 */
const ESKI_BASLIK = ['VentHub — Premium HVAC Çözümleri', 'VentHub — Premium HVAC Solutions']
const YENI_BASLIK = [
  'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
  'VentHub | Industrial Ventilation and HVAC Engineering Solutions',
]

describe('INV-BOT-KARNESI-BASLIK-1 · varsayılan başlık tanıma', () => {
  it('KOL B1 · ESKİ biçim (TR/EN) her sayfa türünde varsayılan sayılır, ana sayfa dahil', () => {
    for (const b of ESKI_BASLIK) for (const tur of ['aile-urun', 'kategori', 'ana']) expect(varsayilanBaslikMi(b, tur), `${tur}: ${b}`).toBe(true)
  })

  it('KOL B2 · YENİ biçim (TR/EN) ana sayfa dışındaki sayfada varsayılan sayılır', () => {
    for (const b of YENI_BASLIK) for (const tur of ['aile-urun', 'kategori', 'marka']) expect(varsayilanBaslikMi(b, tur), `${tur}: ${b}`).toBe(true)
  })

  it('KOL B3 · ana sayfa YENİ biçimde kusur sayılmaz (kendi başlığı = site başlığı), ESKİ biçime düşerse sayılır', () => {
    for (const b of YENI_BASLIK) expect(varsayilanBaslikMi(b, 'ana'), b).toBe(false)
    for (const b of ESKI_BASLIK) expect(varsayilanBaslikMi(b, 'ana'), b).toBe(true)
  })

  it('KOL B4 · sayfaya özgü başlık ve yakın benzerleri varsayılan SAYILMAZ', () => {
    for (const b of [
      'Hakkımızda | VentHub',
      'Tüm Ürünler | Endüstriyel Havalandırma ve HVAC — VentHub',
      'VentHub | Endüstriyel Havalandırma',
      'VentHub — Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
      'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri ',
      'VentHub — Premium HVAC',
    ]) expect(varsayilanBaslikMi(b, 'kategori'), b).toBe(false)
  })
})

/**
 * INV-BOT-KARNESI-ORNEK-1 · karne site haritasından her dinamik türe örnek alır; İKİ adres şemasını tanır, örneksiz zorunlu tür
 * sessiz geçmez, EN karşılığı yokken hayalet "/" satırı üretmez (SEO-29).
 *
 * ÖLÇÜLMÜŞ VAKA (2026-10-09 19:05, canlı koşu): (1) hreflang'sız haritada EN karşılığı `yol('')` = "/" okunuyordu; kategori, aile ve
 * marka türlerine üç hayalet "/" satırı eklendi, her biri sahte YONLENDIRME ve VARSAYILAN-BASLIK saydı. (2) Desenler yalnız eski şemayı
 * (/tr/category, /tr/products, /tr/brands) tanıyordu; Pazar 11 Ekim'de harita /tr/kategori, /tr/urun, /tr/markalar olunca karne bu
 * türlerden HİÇ örnek almayacak ve bunu hata saymayacaktı (sessiz körlük). (3) Kök "/" → /tr satırı ana sayfanın kendi başlığı yüzünden
 * VARSAYILAN-BASLIK alıyordu; ana sayfa istisnası tür adına bakıyordu, yönlendirmenin sonundaki adrese değil.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: iki şema, EN eşleşmesi var/yok, model ayrımı, örneksiz tür, başlık türü ve adres geçişi ayrı davranışlardır.
 */
const KOK = 'https://venthub.com.tr'
type Satir = { loc: string; en?: string }
const harita = (satirlar: Satir[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${satirlar
    .map(
      (s) =>
        `<url><loc>${KOK}${s.loc}</loc>${s.en ? `<xhtml:link rel="alternate" hreflang="tr" href="${KOK}${s.loc}"/><xhtml:link rel="alternate" hreflang="en" href="${KOK}${s.en}"/>` : ''}</url>`,
    )
    .join('')}</urlset>`
const turAdresleri = (xml: string, tur: string): string[] => ornekTurleri(xml).turler.find(([ad]: [string, string[]]) => ad === tur)?.[1] ?? []
const tumAdresler = (xml: string): string[] => ornekTurleri(xml).turler.flatMap(([, a]: [string, string[]]) => a)

const ESKI_SEMA: Satir[] = [
  { loc: '/tr' },
  { loc: '/tr/products' },
  { loc: '/tr/category/aksesuarlar' },
  { loc: '/tr/category/fanlar' },
  { loc: '/tr/category/hava-perdeleri' },
  { loc: '/tr/products/avens-bvu' },
  { loc: '/tr/products/seat-serisi' },
  { loc: '/tr/products/vortice-lineo-quiet' },
  { loc: '/tr/products/casals-hep' },
  { loc: '/tr/brands/avens' },
  { loc: '/tr/brands/vortice' },
  { loc: '/tr/brands/seat' },
]
// SEO-26 simülasyonundan kısaltıldı (gerçek sitemap.ts, ADRES_SEMASI_K3B açık, NEXT_PUBLIC_ADRES_DILI=1): yeni şema adresleri.
const YENI_SEMA: Satir[] = [
  { loc: '/tr' },
  { loc: '/tr/urunler' },
  { loc: '/tr/brands' },
  { loc: '/tr/kategori/aksesuarlar' },
  { loc: '/tr/kategori/fanlar' },
  { loc: '/tr/kategori/fanlar/kanal-tipi-fanlar' },
  { loc: '/tr/kategori/fanlar/aksiyel-fanlar' },
  { loc: '/tr/kategori/hava-perdeleri' },
  { loc: '/tr/markalar/avens' },
  { loc: '/tr/markalar/vortice' },
  { loc: '/tr/urun/avens-bvu' },
  { loc: '/tr/urun/seat-serisi' },
  { loc: '/tr/urun/vortice-lineo-quiet' },
  { loc: '/tr/urun/casals-hep' },
]

describe('INV-BOT-KARNESI-ORNEK-1 · örnekleme iki şemayı tanır', () => {
  it('KOL O1 · hreflang\'sız ESKİ şema haritası: hiçbir türde hayalet "/" yok, TR örnekleri haritadaki ilk sırayla, eksik yok', () => {
    const xml = harita(ESKI_SEMA)
    expect(tumAdresler(xml), 'EN karşılığı yokken "/" eklendi (yol(\'\') düşmesi geri geldi)').not.toContain('/')
    expect(turAdresleri(xml, 'kategori')).toEqual(['/tr/category/aksesuarlar', '/tr/category/fanlar'])
    expect(turAdresleri(xml, 'aile-urun')).toEqual(['/tr/products/avens-bvu', '/tr/products/seat-serisi', '/tr/products/vortice-lineo-quiet'])
    expect(turAdresleri(xml, 'marka')).toEqual(['/tr/brands/avens', '/tr/brands/vortice'])
    expect(ornekTurleri(xml).eksik).toEqual([])
  })

  it('KOL O2 · hreflang\'lı haritada ilk örneğin GERÇEK EN karşılığı eklenir (EN yayını açıldığında davranış korunur)', () => {
    const xml = harita([{ loc: '/tr/category/aksesuarlar', en: '/en/category/accessories' }, ...ESKI_SEMA.slice(3)])
    expect(turAdresleri(xml, 'kategori')).toEqual(['/tr/category/aksesuarlar', '/en/category/accessories', '/tr/category/fanlar'])
  })

  it('KOL O3 · YENİ şema haritası: kategori, alt kategori, aile ve marka yeni adreslerden örneklenir, eksik yok', () => {
    const xml = harita(YENI_SEMA)
    expect(turAdresleri(xml, 'kategori')).toEqual(['/tr/kategori/aksesuarlar', '/tr/kategori/fanlar'])
    expect(turAdresleri(xml, 'alt-kategori')).toEqual(['/tr/kategori/fanlar/kanal-tipi-fanlar', '/tr/kategori/fanlar/aksiyel-fanlar'])
    expect(turAdresleri(xml, 'aile-urun')).toEqual(['/tr/urun/avens-bvu', '/tr/urun/seat-serisi', '/tr/urun/vortice-lineo-quiet'])
    expect(turAdresleri(xml, 'marka')).toEqual(['/tr/markalar/avens', '/tr/markalar/vortice'])
    expect(tumAdresler(xml)).not.toContain('/')
    expect(ornekTurleri(xml).eksik).toEqual([])
  })

  it('KOL O4 · yeni şemada model adresi (-p-<sku>) aile sayılmaz, model türüne düşer', () => {
    const model = '/tr/urun/seat-30-korozyon-dayanimli-radyal-fan-2476m3h-p-sea-51302000'
    const xml = harita([{ loc: model }, ...YENI_SEMA])
    expect(turAdresleri(xml, 'aile-urun')).not.toContain(model)
    expect(turAdresleri(xml, 'model')).toEqual([model])
  })

  it('KOL O5 · model türü isteğe bağlıdır: model adresi olmayan yeni şema haritası eksik saymaz (Pazar\'da model listesi boş, karar 327)', () => {
    expect(ornekTurleri(harita(YENI_SEMA)).eksik).not.toContain('model')
  })
})

describe('INV-BOT-KARNESI-ORNEK-1 · örneksiz zorunlu tür sessiz geçmez', () => {
  it('KOL O6 · yeni şema haritasında marka adresi yoksa eksik = [marka]', () => {
    expect(ornekTurleri(harita(YENI_SEMA.filter((s) => !s.loc.startsWith('/tr/markalar/')))).eksik).toEqual(['marka'])
  })

  it('KOL O7 · yeni şema haritasında alt kategori yoksa eksik = [alt-kategori] (eski şemada alt kategori tek seviyeli olduğu için zorunlu değil)', () => {
    expect(ornekTurleri(harita(YENI_SEMA.filter((s) => s.loc.split('/').length !== 5 || !s.loc.startsWith('/tr/kategori/')))).eksik).toEqual(['alt-kategori'])
    expect(ornekTurleri(harita(ESKI_SEMA)).eksik).not.toContain('alt-kategori')
  })

  it('KOL O8 · boş ya da tanınmayan harita: üç zorunlu tür de eksik', () => {
    expect(ornekTurleri(harita([])).eksik).toEqual(['kategori', 'aile-urun', 'marka'])
    expect(ornekTurleri(harita([{ loc: '/tr/bambaska/adres' }])).eksik).toEqual(['kategori', 'aile-urun', 'marka'])
  })
})

describe('INV-BOT-KARNESI-ORNEK-1 · başlık türü ve adres geçişi', () => {
  it('KOL O9 · ana sayfa istisnası yönlendirmenin SONUNA bakar: kök "/" → /tr satırı yeni varsayılan başlıkta kusur değil', () => {
    expect(baslikTuru('kok', '/tr')).toBe('ana')
    expect(baslikTuru('kok', '/en')).toBe('ana')
    for (const b of YENI_BASLIK) expect(varsayilanBaslikMi(b, baslikTuru('kok', '/tr')), b).toBe(false)
  })

  it('KOL O10 · ana sayfa dışındaki son adres tür adını korur ve yeni varsayılan başlık yine kusurdur', () => {
    expect(baslikTuru('kategori', '/tr/kategori/fanlar')).toBe('kategori')
    expect(baslikTuru('ana', '/tr')).toBe('ana')
    for (const b of YENI_BASLIK) expect(varsayilanBaslikMi(b, baslikTuru('kategori', '/tr/kategori/fanlar')), b).toBe(true)
  })

  const gecis = () =>
    (bilincliKurallar(false) as Array<{ sinif: string; kosul: (s: unknown) => boolean }>).find((k) => k.sinif === 'YONLENDIRME')

  it('KOL O11 · statik eski adres TEK 308 ile haritadaki yeni adrese gidiyorsa bilinçli adres geçişidir', () => {
    expect(gecis(), 'YONLENDIRME için adres geçişi bilinçli kuralı yok').toBeDefined()
    expect(gecis()?.kosul({ statik: true, zincir: '308→200', haritada: 'loc' })).toBe(true)
  })

  it('KOL O12 · geçici yönlendirme, zincir, haritada olmayan hedef ve haritadan örneklenen dinamik adres kusur KALIR', () => {
    const k = gecis()
    expect(k?.kosul({ statik: true, zincir: '307→200', haritada: 'loc' })).toBe(false)
    expect(k?.kosul({ statik: true, zincir: '308→308→200', haritada: 'loc' })).toBe(false)
    expect(k?.kosul({ statik: true, zincir: '308→200', haritada: 'yok' })).toBe(false)
    expect(k?.kosul({ statik: false, zincir: '308→200', haritada: 'loc' })).toBe(false)
  })
})

describe('INV-BOT-KARNESI-BASLIK-1 · kaynak bağı', () => {
  // import.meta.url test çalıştırıcıda `file:` olmayabilir (enYayinOku yedeğiyle aynı gerekçe): depo kökünden okunur.
  const sozluk = (dosya: string): string => readFileSync(join(process.cwd(), 'src', 'i18n', 'dictionaries', dosya), 'utf8')

  it.each(['tr.ts', 'en.ts'])('KOL B5 · %s içindeki meta.siteTitle bot karnesinin kalıbıyla eşleşir (başlık değişirse kalıp da güncellenir)', (dosya) => {
    const eslesme = [...sozluk(dosya).matchAll(/siteTitle:\s*'([^']+)'/g)]
    expect(eslesme, `${dosya}: siteTitle biçimi değişti, kaynak bağı kuramıyorum`).toHaveLength(1)
    const baslik = eslesme[0][1]
    expect(
      varsayilanBaslikMi(baslik, 'kategori'),
      `${dosya} meta.siteTitle (${baslik}) bot karnesinin varsayılan başlık kalıbıyla eşleşmiyor: scripts/seo/bot-karnesi.mjs içindeki ESKI/YENI_VARSAYILAN_BASLIK kalıbına yeni başlığı ekle (eski biçimi dağıtım bitene kadar tut)`,
    ).toBe(true)
  })
})
