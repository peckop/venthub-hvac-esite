import type { Metadata } from 'next'

import { EN_YAYIN } from '@/config/features'
import { SITE_URL } from '@/config/siteUrl'
import { localizedHref } from '@/utils/routes'

/**
 * SAYFA ÜST VERİSİ — tek yazıcının ortak kalıbı (REC-150 Adım 5, bot karnesi 2026-09-24).
 *
 * NİÇİN VAR: kanal hesaplayıcısı "tek yazıcı" pilotunu elle yazmıştı (canonical + tr/en/x-default
 * + openGraph). Aynı blok 20'den fazla rotaya kopyalanırsa her kopya kendi başına bayatlar. Bot
 * karnesinin ölçtüğü üç kusur tam bu boşlukta yaşıyordu:
 *  1. Kendi `alternates`'ını yazmayan 28 adres, dil layout'unun varsayılanını miras alıyordu:
 *     `/tr/destek/sss` için hreflang tr=/tr, en=/en — yani "bu sayfanın İngilizcesi ana sayfa".
 *     Yanlış hreflang, hiç olmamasından kötüdür; layout varsayılanı kaldırıldı, her rota kendi
 *     yolunu buradan yazar.
 *  2. 15 adreste iki `<title>` (istemci `Seo` bileşeni + App Router metadata).
 *  3. 13 adreste varsayılan başlık ve canonical yok.
 *
 * ADRESLER SSOT'TAN: taban `SITE_URL` (INV-CANONICAL-1), dil öneki `localizedHref` (kural 7 —
 * elle `/tr/` birleştirme yasak). `yol` dilsiz verilir (`Routes.*` çıktısı).
 *
 * ⚠EN DİZİN DIŞILIĞI BURADA DA HESAPLANIR: dil layout'u `EN_YAYIN` kapalıyken `/en` ağacına
 * `noindex, follow` basar (REC-204). Sayfa kendi `robots`unu yazarsa layout'unkini EZER; bu
 * yüzden yardımcı aynı kuralı kendisi uygular — `robots` alanını yalnız gerektiğinde doldurur,
 * TR'de dokunmaz (INV-EN-YAYIN-1 bunu ölçer).
 */
export interface SayfaUstVerisiGirdisi {
  lang: string
  /** Dilsiz yol, `Routes.*` çıktısı (ör. `/destek/sss`). */
  yol: string
  /** Tam başlık, site adı DAHİL (ör. "Sık Sorulan Sorular | VentHub"). */
  baslik: string
  aciklama: string
  /**
   * Sayfa dizine girmesin (ödeme, sepet, giriş gibi işlem yüzeyleri). Dil eşleri yazılmaz:
   * dizine girmeyen sayfa için hreflang bir şey ifade etmez.
   */
  dizinDisi?: boolean
  /**
   * DİLE GÖRE FARKLI YOL (karar 92, Bilgi Merkezi): `/bilgi-merkezi/x` ↔ `/knowledge-hub/y`.
   * Verilirse `yol` yerine bu kullanılır ve **yalnız var olan diller** yazılır: eşi olmayan
   * sayfa hreflang taşımaz (rehber-yazisi-standard R6 — "hreflang yalnız iki dil de varsa";
   * yanlış hreflang hiç olmamasından kötüdür). Bulunulan dilin yolu verilmemişse ATAR.
   */
  dilYollari?: Partial<Record<'tr' | 'en', string>>
  /** OpenGraph türü; rehber yazısında `article`. Varsayılan `website`. */
  ogTuru?: 'website' | 'article'
}

export function sayfaUstVerisi({
  lang,
  yol,
  baslik,
  aciklama,
  dizinDisi = false,
  dilYollari,
  ogTuru = 'website',
}: SayfaUstVerisiGirdisi): Metadata {
  const trYol = dilYollari ? dilYollari.tr : yol
  const enYol = dilYollari ? dilYollari.en : yol
  const trUrl = trYol ? `${SITE_URL}${localizedHref(trYol, 'tr')}` : null
  const enUrl = enYol ? `${SITE_URL}${localizedHref(enYol, 'en')}` : null
  const url = lang === 'en' ? enUrl : trUrl
  if (!url) {
    throw new Error(`sayfaUstVerisi: "${lang}" dili için yol verilmedi (dilYollari)`)
  }
  const enKapali = lang === 'en' && !EN_YAYIN

  return {
    title: baslik,
    description: aciklama,
    ...(dizinDisi || enKapali ? { robots: { index: false, follow: true } } : {}),
    alternates:
      dizinDisi || !trUrl || !enUrl
        ? { canonical: url }
        : {
            canonical: url,
            languages: {
              tr: trUrl,
              en: enUrl,
              'x-default': trUrl,
            },
          },
    openGraph: {
      title: baslik,
      description: aciklama,
      url,
      siteName: 'VentHub',
      type: ogTuru,
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
    },
  }
}
