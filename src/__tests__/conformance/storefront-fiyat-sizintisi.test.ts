/**
 * INV-FIYAT-SIZINTI-1 — satış modu BİLİNMEDEN fiyat basılmaz.
 *
 * NİÇİN VAR (ölçülmüş canlı sızıntı, 2026-08-31):
 * Teklif modu kararı `useCategories()` istemci bağlamından okunuyordu. Sunucu
 * render'ında o liste boş olduğu için kategori çözülemiyor, kural sessizce
 * "fiyatlı mod"a düşüyor ve GERÇEK FİYAT statik HTML'e basılıyordu. Hydration'dan
 * sonra istemci fiyatı gizliyordu — yani kusur ekranda bir an görünüp kayboluyor,
 * ama kaynak-görüntülemede ve önbellekte KALICI kalıyordu.
 *
 * CANLI ÖLÇÜM (kapının gerekçesi, hatırlanan değil ölçülen):
 *   · 40 aile sayfasının 36'sında statik HTML'de `₺` + rakam vardı
 *     (en yükseği seat-serisi 42 fiyat, vortice-vort-quadro-evo 25, jet-serisi 23)
 *   · 8 tekil ürün PDP'sinde 0 — sızıntı AİLE görünümündeydi
 *   · Temiz çıkan 4 aile KORUNDUĞU İÇİN DEĞİL, `product_prices` kaydı olmadığı için
 *     temizdi → koruma SIFIR, 40/40 korunmasız
 *   · 23 aktif kategorinin 23'ünde de `hide_price=true` — teklif modu istisna değil KURAL
 *
 * ⭐ÖLÇÜT NOTU: ilk ölçümümde HTML'de `₺` saydım ve 7/7 ürün sızdırıyor sandım.
 * Yanlıştı — o tek `₺` i18n sözlük metniydi (`₺{{amount}} tutarında sipariş alındı`).
 * Ayırt edici ölçüt `₺` değil **`₺` + rakam**. İlk ölçüt iki halde de aynı değeri
 * veriyordu, yani hiçbir şeyi ayırt etmiyordu. Bu kapının ölçütü de rakam şartlıdır.
 *
 * KAPSAM SINIRI (gizlenmiyor): bu kapı HÜKMÜ test eder, HTML çıktısını değil.
 * "Sunucu çıktısında ₺+rakam yok" iddiasının gerçek kanıtı bir e2e/SSR koşumudur;
 * o REC-97'nin kalıcı ayağına bırakıldı. Burada kapatılan şey, hükmün bilinmeyen
 * modda fiyat tarafına düşmesidir — sızıntının KÖKÜ buydu.
 */
import { describe, expect, it } from 'vitest'

import { quoteModeHesapla } from '../../app/_components/ProductDetailPageView'

const fiyatliVaryant = { price: 37773 }

describe('INV-FIYAT-SIZINTI-1 · mod bilinmeden fiyat basılmaz', () => {
  it('⭐SUNUCU DALI — kategori çözülemediğinde teklif modu (sızıntının kökü)', () => {
    // Sunucu render'ının fiili durumu: istemci bağlamı boş, kategori null.
    // Düzeltmeden ÖNCE bu çağrı false dönüyordu ve fiyat HTML'e basılıyordu.
    expect(quoteModeHesapla(null, fiyatliVaryant)).toBe(true)
    expect(quoteModeHesapla(undefined, fiyatliVaryant)).toBe(true)
  })

  it('AYIRT EDİCİ — kural körü körüne "her zaman true" DEĞİL', () => {
    // Bu kol olmadan kapı sahte-yeşil olurdu: `return true` yazsam da geçerdi.
    // Mod POZİTİF olarak "gösterilebilir" dediğinde fiyat çizilmeli.
    const acikKategori = { metadata: { hide_price: false } }
    expect(quoteModeHesapla(acikKategori, fiyatliVaryant)).toBe(false)

    const metadatasiz = { metadata: null }
    expect(quoteModeHesapla(metadatasiz, fiyatliVaryant)).toBe(false)
  })

  it('KATEGORİ GİZLİYORSA — teklif modu', () => {
    expect(quoteModeHesapla({ metadata: { hide_price: true } }, fiyatliVaryant)).toBe(true)
  })

  it('GEÇERSİZ FİYAT — teklif modu (null, 0, negatif, eksik varyant)', () => {
    const acik = { metadata: { hide_price: false } }
    expect(quoteModeHesapla(acik, null)).toBe(true)
    expect(quoteModeHesapla(acik, undefined)).toBe(true)
    expect(quoteModeHesapla(acik, { price: null })).toBe(true)
    expect(quoteModeHesapla(acik, { price: 0 })).toBe(true)
    expect(quoteModeHesapla(acik, { price: -1 })).toBe(true)
  })

  it('METİN FİYAT — sayıya çevrilip değerlendirilir (RPC dize dönebilir)', () => {
    const acik = { metadata: { hide_price: false } }
    expect(quoteModeHesapla(acik, { price: '37773' })).toBe(false)
    expect(quoteModeHesapla(acik, { price: '0' })).toBe(true)
  })
})
