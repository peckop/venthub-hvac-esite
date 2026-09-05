/**
 * INV-IC-NOT-1 — iç ingest notu müşteri yüzeyine ÇIKAMAZ.
 *
 * OLAY (canlı, ölçüldü 2026-09-05): müşteri ürün sayfasında "Ürün Açıklaması" başlığının
 * altında şunu okuyordu: *"Avensair 2026 fiyat listesinden aktarılan temel ürün (Tier C)."*
 * Bu bir ürün tanıtımı değil, içeri aktarma sırasında yazılmış **iç kayıt notumuz**.
 *
 * ÖLÇÜLEN YAYILIM (prod DB, SELECT): `products.description_i18n` **187/375** satır (tr ve en),
 * `product_families.description` **11/40**. Yani üç üründen birinden fazlası.
 *
 * ⚠NİÇİN HİÇBİR KAPI GÖRMEDİ — üç ayrı kör nokta üst üste geldi:
 *   1. Metin **veride** yaşıyor, kodda değil → statik kod kapıları veriye bakmaz.
 *   2. Ürün adresi aile sayfasına **yönleniyor** ve açıklama varyant seçildikten sonra
 *      **istemcide** çiziliyor → `curl` yanıtında metin YOK, ekranda VAR. ("Sunucu
 *      yanıtında yok" ≠ "ekranda yok"; tarayıcıyla doğrulandı.)
 *   3. i18n kapıları anahtar çözülüyor mu diye bakar; burada anahtar **doğru çözülüyordu** —
 *      sorun metnin İÇERİĞİydi.
 *
 * ⭐BU KAPININ ÖLÇTÜĞÜ ŞEY, AÇIKÇA: veriyi DEĞİL, **render yolunun süzgeçten geçtiğini**
 * ölçer. "Kapı yeşil" = "canlıda iç not yok" DEMEK DEĞİLDİR — veri temizliği ayrı iştir
 * (prod yazımı → Recep kapısı). Buranın işi, temizlikten sonra veri yeniden bozulursa
 * vitrinin yine korunmasıdır. İki katman birbirinin yerine geçmez.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { icIngestNotuMu, musteriyeGorunurAciklama } from '../../utils/icIngestNotu'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')
/** Yorum ANLATIR, kural UYGULAR — ölçüt daima gövdede koşar. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const PDP = ['src', 'app', '_components', 'ProductDetailPageView.tsx'] as const
const ROTA = ['src', 'app', '[lang]', 'products', '[slug]', 'page.tsx'] as const

/** Canlıda ölçülmüş GERÇEK metinler — uydurma değil, DB'den alındı. */
const GERCEK_IC_NOTLAR = [
  'Avensair 2026 fiyat listesinden aktarılan temel ürün (Tier C).',
  'Basic product imported from Avensair 2026 price list (Tier C).',
]

/** Gizlenmemesi gereken NORMAL ürün metinleri — yanlış-pozitif ölçümü. */
const NORMAL_METINLER = [
  'Kanal tipi elektrikli ısıtıcı; 12 kW kapasite, paslanmaz gövde.',
  'Fiyat listesi için bizimle iletişime geçin.', // "fiyat listesi" masum bağlamda
  'Tier 1 tedarikçi sertifikasına sahiptir.', // "Tier" var ama şablon damgası (Tier X) yok
  '',
]

describe('INV-IC-NOT-1 · iç ingest notu müşteriye çizilmez', () => {
  it('⭐ASIL İDDİA — gerçek iç notlar YAKALANIR', () => {
    for (const metin of GERCEK_IC_NOTLAR) {
      expect(icIngestNotuMu(metin), `Yakalanmadi: ${metin}`).toBe(true)
      expect(musteriyeGorunurAciklama(metin), 'Suzgec metni GECIRDI.').toBeNull()
    }
  })

  it('⭐⭐AYIRT EDİCİ — normal ürün metni GİZLENMEZ', () => {
    // En pahali hata bu yonde olurdu: asiri genis desen, gercek aciklamalari da siler ve
    // vitrin SESSIZCE bosalir. O yuzden iki isaret birden aranir (sablon ifadesi + Tier damgasi).
    for (const metin of NORMAL_METINLER) {
      expect(
        icIngestNotuMu(metin),
        `Normal metin IC NOT sanildi — desen fazla genis: "${metin}"`,
      ).toBe(false)
      if (metin) expect(musteriyeGorunurAciklama(metin)).toBe(metin)
    }
  })

  it('⭐RENDER YOLU SÜZGEÇTEN GEÇER — açıklama gövdesi', () => {
    const g = govde(oku(...PDP))
    expect(
      /musteriyeGorunurAciklama\s*\(\s*variantDescription\s*\)/.test(g),
      'PDP aciklamayi SUZMEDEN ciziyor — ic not "Urun Aciklamasi" basligi altinda musteriye ' +
        'gorunur (canlida olculdu, 2026-09-05).',
    ).toBe(true)
    expect(
      /const\s+aciklamaMetni\s*=\s*variantDescription\s*\|\|\s*null/.test(g),
      'Eski suzgecsiz atama GERI GELMIS.',
    ).toBe(false)
  })

  it('⭐RENDER YOLU SÜZGEÇTEN GEÇER — arama sonucu açıklaması', () => {
    // Ikinci sizinti yolu: aile aciklamasi meta-description zincirinin IKINCI halkasi.
    // Suzulmezse ayni ic not GOOGLE'a gider ve orada aylarca kalir.
    const g = govde(oku(...ROTA))
    expect(
      /musteriyeGorunurAciklama\s*\(\s*pickLang\s*\(\s*family\.description/.test(g),
      'Rota, aile aciklamasini SUZMEDEN meta description a koyuyor — ic not arama sonucuna cikar.',
    ).toBe(true)
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor', () => {
    expect(govde(oku(...PDP)).length, 'PDP bos okundu.').toBeGreaterThan(5000)
    expect(govde(oku(...ROTA)).length, 'Rota bos okundu.').toBeGreaterThan(2000)
  })
})
