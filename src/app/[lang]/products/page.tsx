import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { adresUret } from '@/utils/adresUret'

import { SITE_URL } from '../../../config/siteUrl'
import { UrunlerSayfasi, urunlerUstVerisiK3b } from '../../_components/urunlerSayfasi'

/**
 * `/[lang]/products` — tüm ürünler listesi.
 *
 * REC-300 Faz 3b-2: gövde (aile + kategori verisi, önbellekler, sayfa boyu) `app/_components/
 * urunlerSayfasi.tsx`'e taşındı (BİREBİR) — K3-b'nin `/tr/urunler` rotası aynı çekirdeği çağırır.
 * Bu dosyada rota sınıfı, bugünkü üst veri ve rota kararı kaldı.
 *
 * BAYRAK KAPALIYKEN davranış BİREBİR bugünkü. BAYRAK AÇIKKEN (plan §6 satır 6, madde 5):
 * `/tr/products` → `/tr/urunler` TEK 308 (sayfa katmanı; Faz 3-C'de `next.config` birebir kuralı
 * önüne geçer, bu dal ikinci ağdır). `/en/products` yerinde kalır, hreflang TR eşi yeni adres.
 */

/**
 * ⭐ROTA SINIFINI AÇIKÇA İLAN ET (REC-59). Kategori rotası aynı satırı taşıyor ve üretilen
 * HTML'inde CSR bailout işareti YOK (ölçüldü 2026-09-14: `about` 0, kategori 0, ilan
 * etmeyen ana sayfa 2, marka sayfası 2). `force-static` altında `useSearchParams()` boş
 * döner ve bailout üretmez — çatıdaki bilinçli adalar (Vercel Analytics, NavigationTracker)
 * sayfayı istemciye düşürmez.
 */
export const dynamic = 'force-static'

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3. */
export const revalidate = 3600

export async function generateStaticParams() {
  // K3-b açıkken TR adresi yalnız 308 verir → önceden üretilmez; içerik `/tr/urunler`'de.
  if (ADRES_SEMASI_K3B) return [{ lang: 'en' }]
  return [{ lang: 'tr' }, { lang: 'en' }]
}

/**
 * REC-338 — bu rotanın `generateMetadata`'sı HİÇ YOKTU.
 *
 * ÖLÇÜM (canlı, 2026-09-14): `/tr/products` ve `/en/products` HTML'inde `rel="canonical"`
 * SIFIR; `<title>` kök layout'un varsayılanıydı (`VentHub — Premium HVAC Çözümleri` /
 * `... Solutions`). Yani sitenin en büyük liste sayfasının kendi başlığı ve kanonik adresi
 * yoktu — arama motoru için bu sayfa ana sayfanın kopyası gibi görünüyordu.
 *
 * `?page=` kaldırılmasıyla aynı PR'da olmasının sebebi: sorgu parametreli adresler kanonik
 * koruması olmadan duruyordu; ikisi aynı kusurun iki ucu.
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (ADRES_SEMASI_K3B) {
    // TR bu adreste çizilmez (308); EN'in üst verisi yeni şemanın ortak kalıbından.
    return lang === 'en' ? urunlerUstVerisiK3b(lang) : {}
  }
  const dict = lang === 'en' ? en : tr

  const trUrl = `${SITE_URL}/tr/products`
  const enUrl = `${SITE_URL}/en/products`
  const canonicalUrl = lang === 'en' ? enUrl : trUrl

  const title = dict.products.discovery.seoTitle
  const description = dict.products.discovery.seoDesc

  return {
    title,
    description,
    // hreflang deseni site geneliyle AYNI: yalın `tr`/`en` + `x-default` = TR.
    // Bölge kodlu biçim (`tr-TR`) bilerek kullanılmıyor — aynı sitede iki biçim
    // tutarsız sinyal üretir (REC-127'de ana sayfada ölçülmüştü).
    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: trUrl,
        en: enUrl,
        'x-default': trUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'VentHub',
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export default async function Page({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (ADRES_SEMASI_K3B && lang === 'tr') permanentRedirect(adresUret({ tur: 'urunler' }, 'tr'))
  return <UrunlerSayfasi lang={lang} />
}
