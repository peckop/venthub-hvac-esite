import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '../dictionaries/en'
import { tr } from '../dictionaries/tr'

/**
 * INV-SITE-BASLIGI-1 — kök layout'un varsayılan başlığı (başlık atamayan sayfalar, 404) ana sayfanın
 * yayındaki ve onaylı başlığıyla AYNI satırdır; "Premium HVAC" gibi kanıtsız bir sıfat taşımaz (URN-78).
 *
 * Niçin: `meta.siteTitle` iki yere gider (`<title>` ve og:title, `app/[lang]/layout.tsx`). Eski değer
 * "VentHub — Premium HVAC Çözümleri" idi; ana sayfa ise 09-07'den beri başka bir başlıkla yayındaydı, yani
 * aynı sitede iki farklı kimlik cümlesi vardı. Metin OPS onayıdır (10-09); değişecekse bu test ve
 * `scripts/seo/bot-karnesi.mjs` kalıbı (Geo-SEO) birlikte güncellenir.
 */
const TR_BASLIK = 'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri'
const EN_BASLIK = 'VentHub | Industrial Ventilation and HVAC Engineering Solutions'

describe('INV-SITE-BASLIGI-1 — varsayılan site başlığı', () => {
  it('TR ve EN başlık onaylı metindir', () => {
    expect(tr.meta.siteTitle).toBe(TR_BASLIK)
    expect(en.meta.siteTitle).toBe(EN_BASLIK)
  })

  it('başlıklarda "Premium" sıfatı yok', () => {
    expect(tr.meta.siteTitle).not.toMatch(/premium/i)
    expect(en.meta.siteTitle).not.toMatch(/premium/i)
  })

  it('Seo bileşeninin varsayılan açıklama yedeği kalktı (açıklama zorunlu prop)', () => {
    const kaynak = readFileSync(resolve(__dirname, '../../components/Seo.tsx'), 'utf8')
    expect(kaynak, 'Seo.tsx içinde "Premium HVAC" geri geldi').not.toMatch(/Premium HVAC/)
    expect(kaynak, 'description prop artık zorunlu olmalı (isteğe bağlı ? işareti geri geldi)').not.toMatch(/\bdescription\?:/)
  })
})
