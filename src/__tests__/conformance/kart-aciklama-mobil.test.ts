import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KART-ACIKLAMA-MOBIL-1 — hover'a bağlı içerik, hover'ı OLMAYAN cihazda da görünür.
 *
 * RECEP KARARI (2026-09-07, lafzıyla): *"görünmeyen açıklamalar mobilde görünmesi lazım,
 * bunu da çözün"*. (Karar bana OPS aktarımıyla ulaştı — kaynağı adıyla yazıyorum ki
 * yarın okuyan "kim dedi" diye aramasın.)
 *
 * ÖLÇÜLMÜŞ KUSUR (yerel tarayıcı, 390×844): kategori kartındaki açıklama kutusu
 * `max-h-0 opacity-0` ile başlayıp yalnız `group-hover` ile açılıyordu. Dokunmatik cihazda
 * hover YOKTUR; altı kartın altısında da max-height 0px, opacity 0 ölçüldü. Yani paragraf
 * mobil ziyaretçide HİÇ açılmıyordu — anasayfada da, ve anasayfa CANLI.
 *
 * ETKİSİ SOMUTTU: URUN-KATALOG aynı gün 23 kategori paragrafını canlı DB'ye yazdı
 * (REC-146, 0/37 → 23/37). Bu yüzeyde hiçbiri mobilde görünmüyordu. Metin DOM'daydı —
 * arama motoru görüyor, insan görmüyordu.
 *
 * KAPININ SINIRI, ADIYLA: bu kapı STATİKTİR — sınıf dizesini okur, PİKSEL ÖLÇMEZ.
 * Gerçek görünürlük kanıtı tarayıcı ölçümüdür (aynı gün: 390px'te /products 6/6 ve
 * anasayfa 8/8 opaklık 1; 846px'te 0/6 = masaüstü hover davranışı korunuyor).
 * Bu kapı yalnız kusur SINIFININ sessizce geri gelmesini engeller: biri `md:` ön ekini
 * silip mobili yeniden kapatırsa kırmızı verir.
 */

const DOSYA = join(process.cwd(), 'src', 'components', 'home', 'GuidedCategoryDiscovery.tsx')
const kaynak = readFileSync(DOSYA, 'utf8')

/** Açıklama kutusunun sınıf dizesi — `max-h`/`opacity` taşıyan tek sarmal. */
function aciklamaSarmaliniBul(): string {
  const satirlar = kaynak.split('\n')
  const satir = satirlar.find(
    (s) => s.includes('max-h-') && s.includes('opacity-') && s.includes('<div'),
  )
  if (!satir) throw new Error('Açıklama sarmalı bulunamadı — bileşenin yapısı değişmiş olabilir.')
  return satir
}

describe('INV-KART-ACIKLAMA-MOBIL-1 — kart açıklaması dokunmatikte görünür', () => {
  it('K1 (ön-koşul) — ölçtüğüm yapı GERÇEKTEN duruyor (evren boş değil)', () => {
    // Bileşen yeniden yazılırsa bu kapı sessizce anlamsızlaşır; önce varlığını kanıtlar.
    expect(kaynak).toContain('group-hover')
    expect(() => aciklamaSarmaliniBul()).not.toThrow()
  })

  it('K2 — varsayılan (mobil) hâl AÇIK: koşulsuz max-h-0 / opacity-0 YOK', () => {
    const sarmal = aciklamaSarmaliniBul()

    // Ön eksiz `max-h-0` ve `opacity-0` = her genişlikte kapalı = bugünkü kusur.
    // Ön ekli (`md:max-h-0`) hâller SERBEST: masaüstünde hover davranışı korunmalı.
    const kosulsuzKapali = /(^|\s)(max-h-0|opacity-0)(\s|"|$)/.test(sarmal)

    expect(
      kosulsuzKapali,
      'Açıklama kutusu ön eksiz `max-h-0`/`opacity-0` taşıyor: bu, HER genişlikte kapalı ' +
        'demektir ve dokunmatik cihazda paragraf hiç açılmaz (2026-09-07 ölçümü: 390px, ' +
        '6/6 kart opaklık 0). Kapatma kuralı `md:` gibi bir ekranı ön ekiyle sınırlanmalı.\n' +
        'Bulunan sınıf: ' + sarmal.trim(),
    ).toBe(false)
  })

  it('K3 — masaüstü hover davranışı KORUNUYOR (onarım, silme değil)', () => {
    const sarmal = aciklamaSarmaliniBul()
    // Kusuru "hover'ı tamamen kaldırarak" da çözebilirdik; çözmedik. Bu kol o sapmayı yakalar:
    // masaüstünde açılma yine hover'a bağlı kalmalı, yoksa tasarım sessizce değişmiş olur.
    expect(sarmal).toMatch(/md:group-hover:(max-h|opacity)/)
    expect(sarmal).toMatch(/md:(max-h-0|opacity-0)/)
  })

  it('K4 (ayırt edicilik) — eski hâl bu kapıdan GEÇEMEZ', () => {
    // Kapının gerçekten ölçtüğünü kanıtlar: bugünkü kusurlu sınıf dizesi kırmızı vermeli.
    const eskiHal = 'mt-6 max-h-0 group-hover:max-h-24 opacity-0 group-hover:opacity-100'
    const yeniHal = 'mt-6 max-h-24 opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100'
    const kosulsuzKapali = (s: string) => /(^|\s)(max-h-0|opacity-0)(\s|"|$)/.test(s)

    expect(kosulsuzKapali(eskiHal)).toBe(true)   // eski hâl → yakalanır
    expect(kosulsuzKapali(yeniHal)).toBe(false)  // yeni hâl → geçer
  })
})
