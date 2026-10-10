// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { eskiAdresEsle } from '../eslestirici'
import { ESKI_ADRES_HARITASI } from '../haritaKaynagi'

/**
 * Faz 3-C kabul kapısı: COMMIT'Lİ eski adres haritası (`src/data/generated/eski-adres-haritasi.json`, ALTYAPI
 * `harita-uret.yml`, canlı DB'ye karşı salt-okuma) `next.config`'ten silinen 25 kuralın, 8 yeni kategori adının ve
 * `?sku=` adreslerinin YENİ karşılığını TEK 308 sıçramasıyla verir.
 *
 * BU TEST BİR ANLIK GÖRÜNTÜDÜR: bekleyen hedefler üretildiği günün veritabanından gelir. Katalog bir kategoriyi ya
 * da aileyi yeniden adlandırır ve harita yeniden üretilirse bu test KIRMIZI olur — bilerek: hangi eski adresin
 * nereye gittiğini bir insan görüp onaylamadan harita değişmez.
 */
const KIRACI = 'd3b07384-d113-495f-a558-8c38634e0000'
const harita = ESKI_ADRES_HARITASI?.kiracilar[KIRACI]

function coz(yol: string, sku: string | null = null) {
  return eskiAdresEsle(harita, { yol, sku, dilTespit: () => 'tr' })
}

describe('Faz 3-C: commit\'li eski adres haritası', () => {
  it('harita bağlı ve varsayılan kiracıyı taşır', () => {
    expect(ESKI_ADRES_HARITASI).not.toBeNull()
    expect(harita).toBeDefined()
    expect(harita?.urunSayisi ?? 0).toBeGreaterThan(0)
    expect(harita?.kategoriler.length ?? 0).toBeGreaterThan(0)
  })

  it.each([
    // 13 dilsiz kategori kuralı (config'ten silindi). Hedefi 404 olan dört ve pasif iki kategori /tr/urunler'e iner.
    ['fanlar', '/tr/kategori/fanlar'],
    ['hava-perdeleri', '/tr/kategori/hava-perdeleri'],
    ['isi-geri-kazanim-cihazlari', '/tr/kategori/isi-geri-kazanim'],
    ['hava-temizleyiciler-anti-viral-urunler', '/tr/urunler'],
    ['hiz-kontrolu-cihazlari', '/tr/kategori/kontrol-ve-suruculer/hiz-anahtarlari'],
    ['aksesuarlar', '/tr/kategori/aksesuarlar'],
    ['flexible-hava-kanallari', '/tr/urunler'],
    ['nem-alma-cihazlari', '/tr/kategori/hava-sartlandirma/nem-alma-cihazlari'],
    ['endustriyel-havalandirma', '/tr/urunler'],
    ['ticari-havalandirma', '/tr/urunler'],
    ['konut-tipi-havalandirma', '/tr/urunler'],
    ['duman-egzoz-fanlari', '/tr/kategori/fanlar/duman-egzoz-fanlari'],
    ['otopark-jet-fanlari', '/tr/kategori/fanlar'],
  ])('dilsiz /category/%s → tek 308 → %s', (eski, hedef) => {
    expect(coz(`/category/${eski}`)).toEqual({ hedef, durum: 308 })
  })

  it.each(['100', '125', '150', '200', '250', '315'])('Lineo çap adresi %s → tek 308 → tek aile sayfası', (cap) => {
    expect(coz(`/tr/products/vortice-lineo-${cap}-quiet`)).toEqual({
      hedef: '/tr/urun/vortice-lineo-quiet-sessiz-kanal-fanlari',
      durum: 308,
    })
  })

  it.each([
    ['dd-12-12-1500w-3f-4p-2v-6n090p-11921', '/tr/urun/nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar'],
    ['vortice-ca-il-4020-es-rect-16076', '/tr/urun/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'],
    ['vortice-ca-il-5035-es-rect-16077', '/tr/urun/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'],
    ['vortice-ca-il-6040-es-rect-16078', '/tr/urun/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'],
    ['vortice-ca-il-7050-es-rect-16079', '/tr/urun/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'],
    ['vortice-ca-il-8060-es-rect-16080', '/tr/urun/vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'],
  ])('eski ürün adresi %s → tek 308 → ailenin sayfası (modeller Pazar\'da kapalı)', (eski, hedef) => {
    expect(coz(`/tr/products/${eski}`)).toEqual({ hedef, durum: 308 })
  })

  // Sekiz kategorinin görünen TR adı Design CSV adına çekildi (20261010090000 veri migration'ı, #1802).
  it.each([
    ['control-systems', 'kontrol-sistemleri', 'kontrol-ve-suruculer'],
    ['air-treatment', 'iklimlendirme-ve-hava-sartlandirma', 'hava-sartlandirma'],
    ['water-coil-duct-heaters', 'sulu-batarya-kanal-tipi', 'sulu-bataryalar'],
    ['single-room-hrv', 'tekil-oda-uniteleri', 'tek-oda-uniteleri'],
    ['axial-industrial-fans', 'aksiyel-sanayi-fanlari', 'aksiyel-fanlar'],
    ['spare-parts-sensors', 'yedek-parca-ve-sensorler', 'yedek-parcalar-ve-sensorler'],
    ['bathroom-toilet-fans', 'banyo-ve-tuvalet-fanlari', 'banyo-tuvalet-fanlari'],
    ['industrial-ceiling-fans', 'endustriyel-tavan-vantilatorleri', 'tavan-vantilatorleri'],
  ])('%s: eski TR adres (%s) ve ara dönem adresi tek 308 ile yeni adrese (%s) gider', (_en, eskiTr, yeniTr) => {
    const eski = coz(`/tr/category/${eskiTr}`)
    expect(eski?.durum).toBe(308)
    expect(eski?.hedef.startsWith('/tr/kategori/')).toBe(true)
    expect(eski?.hedef.endsWith(`/${yeniTr}`)).toBe(true)
    // Cumartesi→Pazar arası yaşayan /tr/category/<yeni-ad> da aynı hedefe tek sıçrar.
    expect(coz(`/tr/category/${yeniTr}`)).toEqual(eski)
    // Hedef yeniden eşleşmez: çift sıçrama ve döngü yok.
    expect(coz(eski!.hedef)).toBeNull()
  })

  it('?sku= adresi (model kapalıyken): tek 308 → ailenin sayfası, SORGUSUZ', () => {
    const [sku, model] = Object.entries(harita!.modeller)[0]!
    const aile = harita!.aileler[model.aile]!
    const beklenen = { hedef: `/tr/urun/${aile}`, durum: 308 }
    expect(coz(`/tr/products/${aile}`, sku)).toEqual(beklenen)
    expect(coz(`/tr/products/${aile}`, sku.toLowerCase())).toEqual(beklenen)
    expect(beklenen.hedef).not.toContain('?')
  })

  it('haritadaki hiçbir kategori ya da aile adresi çift sıçrama üretmez (hedef yeniden eşleşmez)', () => {
    const cifte: string[] = []
    for (const slug of Object.keys(harita!.kategoriSluglari)) {
      const s = coz(`/tr/category/${slug}`)
      if (s && coz(s.hedef) !== null) cifte.push(`/tr/category/${slug} → ${s.hedef}`)
    }
    for (const slug of Object.keys(harita!.aileSluglari)) {
      const s = coz(`/tr/products/${slug}`)
      if (s && coz(s.hedef) !== null) cifte.push(`/tr/products/${slug} → ${s.hedef}`)
    }
    expect(cifte).toEqual([])
  })
})
