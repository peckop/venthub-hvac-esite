import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { SITE_URL } from '../../config/siteUrl'
import { dildekiYazilar, type RehberYazisi, yaziBul, type YaziDili } from '../../data/bilgiMerkezi/yazilar'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import { jsonLdMetni, makaleJsonLd } from '../../lib/bilgiMerkezi/jsonld'
import { markdownAyristir } from '../../lib/bilgiMerkezi/markdown'
import { yaziSayfasiHazirla } from '../../lib/bilgiMerkezi/sayfa'
import { varsayilanKaynak } from '../../lib/data/bilgiMerkeziKaynak'
import { buildBreadcrumbJsonLd } from '../../lib/seo/jsonld'
import { sayfaUstVerisi } from '../../lib/seo/sayfaUstVerisi'
import { bilgiMerkeziDilAcik, bilgiMerkeziYaziHref } from '../../utils/bilgiMerkezi'
import { bilgiMerkeziRotalari } from '../../utils/bilgiMerkeziRotalari'
import BilgiMerkeziListe from './BilgiMerkeziListe'
import RehberYazisiSayfasi from './RehberYazisiSayfasi'

/**
 * Bilgi Merkezi rotalarının ORTAK gövdesi. İki bölüm aynı kodu kullanır:
 *   `src/app/[lang]/bilgi-merkezi/**`  → bölüm dili `tr`
 *   `src/app/[lang]/knowledge-hub/**`  → bölüm dili `en`
 * Rota dosyaları yalnız segment ilanlarını (dynamic, revalidate) ve bu fonksiyonları taşır —
 * Next bu ilanları her dosyada statik olarak okur, yeniden dışa aktarım kabul etmez.
 *
 * BÖLÜM ↔ DİL: `/en/bilgi-merkezi` ve `/tr/knowledge-hub` YOKTUR (404). EN bölümü ayrıca
 * `EN_YAYIN` kapalıyken üretilmez (rehber-yazisi-standard.md R3/R6) — `generateStaticParams` boş
 * döner, istek gelirse 404. Eski EN adresleri o süre `next.config` 308'iyle EN karşılığına gider.
 */

type Params = Promise<{ lang: string; yazi?: string }>

/** Bu bölüm bu dilde yayında mı? */
export function bolumAcik(lang: string, bolumDili: YaziDili): boolean {
  return lang === bolumDili && bilgiMerkeziDilAcik(lang) && dildekiYazilar(bolumDili).length > 0
}

/** Sunucu tarafı çeviri: anahtar yolu `t('…')` biçiminde (INV-5/INV-6 kapıları bu biçimi okur). */
const ceviri = (dil: YaziDili) => (anahtar: string) => getDictValue(dil === 'en' ? en : tr, anahtar)

/** Yazının var olan dil yolları (hreflang yalnız iki dil de yayındaysa yazılır). */
function yaziDilYollari(yazi: RehberYazisi): Partial<Record<YaziDili, string>> {
  const yollar: Partial<Record<YaziDili, string>> = {}
  for (const dil of ['tr', 'en'] as const) {
    const m = yazi.diller[dil]
    if (m && bilgiMerkeziDilAcik(dil)) yollar[dil] = bilgiMerkeziRotalari.yazi(m.slug, dil)
  }
  return yollar
}

function listeDilYollari(): Partial<Record<YaziDili, string>> {
  const yollar: Partial<Record<YaziDili, string>> = {}
  for (const dil of ['tr', 'en'] as const) {
    if (bilgiMerkeziDilAcik(dil) && dildekiYazilar(dil).length > 0) yollar[dil] = bilgiMerkeziRotalari.liste(dil)
  }
  return yollar
}

// ── LİSTE ────────────────────────────────────────────────────────────────────

export async function listeUstVerisi(params: Params, bolumDili: YaziDili): Promise<Metadata> {
  const { lang } = await params
  if (!bolumAcik(lang, bolumDili)) return {}
  const t = ceviri(bolumDili)
  return sayfaUstVerisi({
    lang,
    yol: bilgiMerkeziRotalari.liste(bolumDili),
    dilYollari: listeDilYollari(),
    baslik: t('bilgiMerkezi.liste.seoBaslik'),
    aciklama: t('bilgiMerkezi.liste.seoAciklama'),
  })
}

export async function ListeRotasi({ params, bolumDili }: { params: Params; bolumDili: YaziDili }) {
  const { lang } = await params
  if (!bolumAcik(lang, bolumDili)) notFound()
  const t = ceviri(bolumDili)
  const kirinti = buildBreadcrumbJsonLd({
    lang: bolumDili,
    baseUrl: SITE_URL,
    steps: [
      { name: t('bilgiMerkezi.anaSayfa'), path: '/' },
      { name: t('bilgiMerkezi.ad'), path: null },
    ],
  })
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdMetni(kirinti) }} />
      <BilgiMerkeziListe dil={bolumDili} />
    </>
  )
}

// ── YAZI ─────────────────────────────────────────────────────────────────────

/**
 * Üst segment (`[lang]` layout'u) her dil için bir kez çağırır; yalnız bölümün kendi dilinde ve
 * bölüm açıkken yazı üretilir. EN kapalıyken `/en/knowledge-hub/*` için sıfır sayfa.
 */
export function yaziParametreleri(lang: string, bolumDili: YaziDili): { yazi: string }[] {
  if (!bolumAcik(lang, bolumDili)) return []
  return dildekiYazilar(bolumDili).map((y) => ({ yazi: (y.diller[bolumDili] as { slug: string }).slug }))
}

function yaziSec(lang: string, slug: string | undefined, bolumDili: YaziDili): RehberYazisi | null {
  if (!slug || !bolumAcik(lang, bolumDili)) return null
  let cozulmus: string
  try {
    cozulmus = decodeURIComponent(slug)
  } catch {
    return null // bozuk yüzde kodlaması → 404 (500 değil)
  }
  return yaziBul(bolumDili, cozulmus)
}

export async function yaziUstVerisi(params: Params, bolumDili: YaziDili): Promise<Metadata> {
  const { lang, yazi: slug } = await params
  const yazi = yaziSec(lang, slug, bolumDili)
  const m = yazi?.diller[bolumDili]
  if (!yazi || !m) return {}
  return sayfaUstVerisi({
    lang,
    yol: bilgiMerkeziRotalari.yazi(m.slug, bolumDili),
    dilYollari: yaziDilYollari(yazi),
    baslik: `${markdownAyristir(m.govde).h1} | VentHub`,
    aciklama: m.ozet,
    ogTuru: 'article',
  })
}

export async function YaziRotasi({ params, bolumDili }: { params: Params; bolumDili: YaziDili }) {
  const { lang, yazi: slug } = await params
  const yazi = yaziSec(lang, slug, bolumDili)
  if (!yazi) notFound()

  // Çözülemeyen iç bağlantı burada ATAR → sayfa üretilmez (sessiz kırık bağlantı yok).
  const sayfa = await yaziSayfasiHazirla(yazi, bolumDili, varsayilanKaynak)
  const t = ceviri(bolumDili)

  const makale = makaleJsonLd({
    baseUrl: SITE_URL,
    yol: bilgiMerkeziYaziHref(sayfa.metin.slug, bolumDili),
    baslik: sayfa.ayrismis.h1,
    aciklama: sayfa.metin.ozet,
    dil: bolumDili,
    yayinTarihi: yazi.yayinTarihi,
    guncellemeTarihi: yazi.guncellemeTarihi,
  })
  const kirinti = buildBreadcrumbJsonLd({
    lang: bolumDili,
    baseUrl: SITE_URL,
    steps: [
      { name: t('bilgiMerkezi.anaSayfa'), path: '/' },
      { name: t('bilgiMerkezi.ad'), path: bilgiMerkeziRotalari.liste(bolumDili) },
      { name: sayfa.ayrismis.h1, path: null },
    ],
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdMetni(makale) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdMetni(kirinti) }} />
      <RehberYazisiSayfasi sayfa={sayfa} />
    </>
  )
}
