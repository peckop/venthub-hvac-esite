import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { getProductModelLabel } from '../../utils/productHelpers'

/**
 * INV-IC-KOD-SIZINTISI-1 — müşteriye gösterilen "model kodu" alanı, kod yoksa
 * İÇ SKU'ya DÜŞEMEZ.
 *
 * CETVELİ KİM YAZDI: kural yeni değil; `productHelpers.getProductModelLabel`'ın kendi
 * belgesi aynen şöyle diyor: *"`model_code` yoksa null döner: etiketi hiç göstermemek,
 * müşteriye iç kod göstermekten iyidir. `sku`'ya düşmek YASAK."*
 *
 * ÖLÇÜLEN KUSUR (2026-09-07, REC-272): kural yazılıydı ama ÜÇ yüzey onu çiğniyordu —
 * `seo/jsonld.ts` (`mpn: model_code ?? sku`), `lib/pdfGenerator.ts` (föyde "Model Kodu")
 * ve `components/products/VariantSelector.tsx` (varyant etiketi). Üstelik `jsonld.test.ts`
 * içindeki bir test tam da bu davranışı DOĞRULUYORDU, yani kusuru sabitlemişti.
 *
 * NİÇİN KAPI GEREKTİ: 374 ürünün 374'ünde `model_code` DOLU. Yani bu yedek dal bugün
 * hiç çalışmıyor ve hiçbir gözle görülür belirti vermiyor — kaynağında kodu OLMAYAN ilk
 * ürün geldiği gün sessizce devreye girecekti. Nitekim REC-272'nin beş Vortice ürünü tam
 * o ürün. Uyuyan bir kusuru ancak statik bir kapı yakalar.
 *
 * KAPININ SINIRI, ADIYLA: bu kapı METİN okur, çalışma zamanını ölçmez. Deseni başka bir
 * yazılışla (ör. ara değişkene alarak) yeniden kurmak mümkündür; kapı onu görmez. Ölçtüğü
 * şey, kusurun BİLİNEN ve bugün üç kez tekrarlanmış yazılışının geri gelmemesidir.
 */

const KAYNAK_KOKU = join(process.cwd(), 'src')

/**
 * Yorum satırları AYIKLANIR: kuralı ANLATAN metin, kuralı ÇİĞNEYEN kod değildir.
 *
 * `(?<!:)` ön-bakışı ŞART (INV-SCRUB-1, bu kapı ilk yazıldığında tam bu hatayı verdi):
 * onsuz `https://…` içindeki `//` yorum sanılır, satırın geri kalanı silinir ve tarama
 * SESSİZCE kör kalır — hep yeşil veren bir kapı, kapı değildir. KOL 5 bunu ölçer.
 */
function koduSoyutla(icerik: string): string {
  return icerik
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(?<!:)\/\/[^\n]*/g, ' ')
}

function kaynakDosyalari(kok: string): string[] {
  const bulunan: string[] = []
  for (const ad of readdirSync(kok)) {
    const yol = join(kok, ad)
    if (statSync(yol).isDirectory()) {
      // Testler kapsam dışı: kusuru TARİF eden test metni ihlal değildir.
      if (ad === '__tests__') continue
      bulunan.push(...kaynakDosyalari(yol))
      continue
    }
    if (/\.(ts|tsx)$/.test(ad) && !/\.test\.tsx?$/.test(ad)) bulunan.push(yol)
  }
  return bulunan
}

/** `model_code` hemen ardından `??` ya da `||` ile `sku`'ya düşen yazılış. */
const SIZINTI_DESENI = /model_code\s*(\?\?|\|\|)\s*[A-Za-z_$][\w$.]*\.?sku\b/

describe('INV-IC-KOD-SIZINTISI-1 — iç SKU müşteri yüzeyine yedek olarak düşmez', () => {
  const dosyalar = kaynakDosyalari(KAYNAK_KOKU)

  // ── KOL 1 · ÖN KOŞUL — evren boş değil.
  // Kapı, taradığı ağaç boşalırsa (yeniden düzenleme, yol değişikliği) sessizce
  // "0 ihlal" deyip yeşil kalırdı. Bu kol, ölçümün gerçekten bir şeye baktığını kanıtlar.
  it('KOL 1 — taranan kaynak ağacı anlamlı büyüklükte', () => {
    expect(dosyalar.length).toBeGreaterThan(100)
  })

  // ── KOL 2 · ÖN KOŞUL — cetvelin kendisi ayakta.
  // Yasak, `getProductModelLabel`'ın davranışından doğuyor. O davranış değişirse
  // (ör. içeride sku'ya düşerse) bu kapının yasağı anlamsızlaşır; önce onu ölçüyoruz.
  it('KOL 2 — çözücü, kod yokken null döner (sku üretmez)', () => {
    expect(getProductModelLabel({ model_code: 'MC-1', sku: 'SKU-1' })).toBe('MC-1')
    expect(getProductModelLabel({ model_code: null, sku: 'SKU-1' })).toBeNull()
    expect(getProductModelLabel({ model_code: '   ', sku: 'SKU-1' })).toBeNull()
  })

  // ── KOL 3 · KURAL.
  it('KOL 3 — hiçbir kaynak dosyada model_code -> sku yedeği yok', () => {
    const ihlaller = dosyalar
      .filter((yol) => SIZINTI_DESENI.test(koduSoyutla(readFileSync(yol, 'utf8'))))
      .map((yol) => yol.slice(KAYNAK_KOKU.length + 1).replace(/\\/g, '/'))

    expect(
      ihlaller,
      'Model kodu yoksa iç SKU gösterilemez (productHelpers: "sku\'ya düşmek YASAK"). ' +
        'Kod yoksa alanı HİÇ yazma; eksik alan, yanlış alandan iyidir.',
    ).toEqual([])
  })

  // ── KOL 4 · AYIRT EDİCİLİK.
  // Desen, kusurun gerçek yazılışlarını yakalıyor mu ve masum metni yakalamıyor mu?
  // Bu kol olmadan KOL 3'ün yeşili "desen hiçbir şeyi eşleştiremiyor" demek olabilirdi.
  it('KOL 4 — desen kusuru yakalar, masum kullanımı yakalamaz', () => {
    expect(SIZINTI_DESENI.test('mpn: variant.model_code ?? variant.sku,')).toBe(true)
    expect(SIZINTI_DESENI.test('return v.model_code || v.sku')).toBe(true)
    expect(SIZINTI_DESENI.test('${product.model_code || product.sku}')).toBe(true)
    // Masum: arama süzgeci HER İKİ alanda da arar — bu gösterim değil, eşleştirmedir.
    expect(SIZINTI_DESENI.test('[v.sku, v.model_code, v.name]')).toBe(false)
    // Masum: kodun kendisi yazılıyor, yedek yok.
    expect(SIZINTI_DESENI.test('mpn: modelKodu')).toBe(false)
  })

  // ── KOL 5 · SIYIRICI ŞEMAYI YEMEZ (INV-SCRUB-1'in istediği alt-sınır ölçümü).
  // Yalnız "sıyırdı mı" değil, sıyırdıktan SONRA hedefin hâlâ TOPLANDIĞI ölçülüyor.
  // Bu kol olmadan `koduSoyutla` bir gün URL'li satırları yiyip kapıyı sessizce
  // kör edebilir ve KOL 3 sonsuza dek yeşil kalırdı.
  it('KOL 5 — yorum sıyırıcı URL şemasını yorum sanmaz', () => {
    const satir = 'const u = "https://ornek.tr"; mpn = v.model_code ?? v.sku'
    const soyut = koduSoyutla(satir)
    expect(soyut).toContain('https://ornek.tr')
    // Asıl kanıt: sıyırma sonrası ihlal HÂLÂ görülüyor.
    expect(SIZINTI_DESENI.test(soyut)).toBe(true)
    // Gerçek yorum ise silinmeye devam ediyor.
    expect(koduSoyutla('// mpn = v.model_code ?? v.sku')).not.toContain('model_code')
  })
})
