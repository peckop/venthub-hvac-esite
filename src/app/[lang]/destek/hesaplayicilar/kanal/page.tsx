import type { Metadata } from 'next'

import { SITE_URL } from '@/config/siteUrl'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { localizedHref, Routes } from '@/utils/routes'

import PageComponent from '../../../../../views/calculators/DuctCalcPage'

/**
 * METADATA TEK YAZICIYA İNDİ — RSC `generateMetadata` (REC-150 PR-1 pilotu, 2026-09-05).
 *
 * NİÇİN: bu sayfa canlıda **iki** `<title>` ve **iki** `<meta name="description">`
 * yayınlıyordu — biri istemci `Seo` bileşeninden, diğeri App Router'ın kendi metadata
 * katmanından. Hangisinin kazandığı ORTAMA göre değişiyordu: canlıda `Seo`'nunki,
 * önizlemede kabuğunki. Yani sekme ve arama sonucu başlığı deterministik değildi.
 *
 * ÇÖZÜM tek yazıcıdır. Bu rota artık metadata'sını burada üretir; `DuctCalcPage`
 * layout'a `metadataRotadanMi` geçerek `<Seo>`'yu susturur. İkinci yazıcı kalmaz.
 *
 * ⚠`'use client'` KALKTI — mecburiyetten değil, ZORUNLULUKTAN: Next.js bir `'use client'`
 * dosyasından `generateMetadata` export edilmesine izin vermez. Bu aynı zamanda CLAUDE.md
 * **kural 4** borcunu (page.tsx varsayılan Server Component) bu rota için kapatır.
 *
 * ⭐SINIR AŞAĞI TAŞINDI, KALDIRILMADI: bu depoda istemci sınırını ROTALAR ilan ediyordu,
 * görünümler değil — dört hesaplayıcı görünümünün hiçbirinde `'use client'` yoktu, hepsi
 * rotadan miras alıyordu. Burayı sunucuya çevirmek o mirası kesti ve ilk denemede
 * `next build` patladı ("useState yalnız Client Component'te çalışır"). Bu yüzden sınır
 * artık `DuctCalcPage`'in kendi başında ilan ediliyor. Kalan üç rota göç ederken aynı
 * taşıma onların görünümlerinde de yapılmalı.
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

  const yol = Routes.destek.hesaplayicilar('kanal')
  const trUrl = `${SITE_URL}${localizedHref(yol, 'tr')}`
  const enUrl = `${SITE_URL}${localizedHref(yol, 'en')}`

  const baslik = `${dict.calculators.duct.title} | ${dict.urunSecici.ustBaslik} | VentHub`

  return {
    title: baslik,
    description: dict.calculators.duct.description,
    alternates: {
      canonical: lang === 'en' ? enUrl : trUrl,
      // hreflang: kök layout bir taban miras bırakıyor ama `canonical` yazan sayfa kendi
      // `languages` bloğunu da yazmalı — yoksa INV-CANONICAL-2 kırmızı verir ve daha
      // önemlisi iki dil birbirine bağlanmaz.
      languages: {
        tr: trUrl,
        en: enUrl,
        'x-default': trUrl,
      },
    },
    openGraph: {
      title: baslik,
      description: dict.calculators.duct.description,
      url: lang === 'en' ? enUrl : trUrl,
      siteName: 'VentHub',
    },
  }
}

export default function Page() {
  return <PageComponent />
}
