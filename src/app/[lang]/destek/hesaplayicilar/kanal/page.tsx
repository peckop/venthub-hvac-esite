import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../../views/calculators/DuctCalcPage'

/**
 * METADATA TEK YAZICIYA İNDİ — RSC `generateMetadata` (REC-150 PR-1 pilotu, 2026-09-05).
 *
 * NİÇİN: bu sayfa canlıda **iki** `<title>` ve **iki** `<meta name="description">`
 * yayınlıyordu — biri istemci `Seo` bileşeninden, diğeri App Router'ın kendi metadata
 * katmanından. Hangisinin kazandığı ORTAMA göre değişiyordu: canlıda `Seo`'nunki,
 * önizlemede kabuğunki. Yani sekme ve arama sonucu başlığı deterministik değildi.
 *
 * ÇÖZÜM tek yazıcıdır. Bu rota artık metadata'sını burada üretir (`sayfaUstVerisi`).
 * REC-150 Adım 5 (2026-09-24): dört hesaplayıcı da göç etti; `CalculatorLayout`'tan `<Seo>`
 * ve geçici `metadataRotadanMi` bayrağı SİLİNDİ. İkinci yazıcı yapısal olarak yok.
 *
 * ⚠`'use client'` KALKTI — mecburiyetten değil, ZORUNLULUKTAN: Next.js bir `'use client'`
 * dosyasından `generateMetadata` export edilmesine izin vermez. Bu aynı zamanda CLAUDE.md
 * **kural 4** borcunu (page.tsx varsayılan Server Component) bu rota için kapatır.
 *
 * ⭐SINIR AŞAĞI TAŞINDI, KALDIRILMADI: bu depoda istemci sınırını ROTALAR ilan ediyordu,
 * görünümler değil — dört hesaplayıcı görünümünün hiçbirinde `'use client'` yoktu, hepsi
 * rotadan miras alıyordu. Burayı sunucuya çevirmek o mirası kesti ve ilk denemede
 * `next build` patladı ("useState yalnız Client Component'te çalışır"). Bu yüzden sınır
 * artık `DuctCalcPage`'in kendi başında ilan ediliyor. Aynı taşıma Adım 5'te kalan üç
 * görünüme de yapıldı (HRV, hava perdesi, jet fan).
 *
 * ⭐BAŞLIK BİÇİMİ BİLEREK AYNI BIRAKILDI: canlı bugün
 * "Kanal Basınç Kaybı Hesaplayıcı | Ürün Seçici | VentHub" basıyor. Göç bir SEO
 * değişikliği DEĞİL, mükerrerlik temizliğidir; biçimi burada değiştirmek sessiz bir
 * SEO değişikliği olurdu ve bu PR'ın iddiasının dışına çıkardı.
 *
 * Adresler SSOT'tan: taban `SITE_URL` (INV-CANONICAL-1), dil öneki `localizedHref`
 * (INV-2 / kural 7 — elle `/tr/` birleştirme yasak).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr

  // REC-150 Adım 5 (2026-09-24): pilotun elle yazdığı blok ortak yardımcıya taşındı
  // (`sayfaUstVerisi` — canonical + tr/en/x-default + EN dizin dışılığı); dört hesaplayıcı aynı kalıp.
  return sayfaUstVerisi({
    lang,
    yol: Routes.destek.hesaplayicilar('kanal'),
    baslik: `${dict.calculators.duct.title} | ${dict.urunSecici.ustBaslik} | VentHub`,
    aciklama: dict.calculators.duct.description,
  })
}

export default function Page() {
  return <PageComponent />
}
