import Link from 'next/link'
import React from 'react'

import { dildekiYazilar, type RehberYazisi, type YaziDili, YAZILAR } from '../../data/bilgiMerkezi/yazilar'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import { markdownAyristir } from '../../lib/bilgiMerkezi/markdown'
import { bilgiMerkeziYaziHref } from '../../utils/bilgiMerkezi'
import { localizedHref, Routes } from '../../utils/routes'
import BilgiMerkeziArama, { type ListeKarti } from './BilgiMerkeziArama'
import { tarihYaz } from './RehberYazisiSayfasi'

/**
 * BİLGİ MERKEZİ LİSTE SAYFASI — sunucu bileşeni (karar 92; rehber-yazisi-standard.md R3 "Liste
 * sayfası" satırı): tek H1, her yazı bir kart (konu · tarih · başlık · özet), yeniden eskiye, arama
 * kutusu (K37-a / U2). Görselsiz kart (tasarım ekran 14 ikinci kare). Kategori süzgeci yazı sayısı
 * artınca gelir. Ürün Seçici'ye gerçek bir kapı taşır (eski merkezdeki kapı kaybolmasın, K17).
 */
export function listeKartlari(dil: YaziDili, yazilar: readonly RehberYazisi[] = YAZILAR): ListeKarti[] {
  const dict = dil === 'en' ? en : tr
  return dildekiYazilar(dil, yazilar).map((y) => {
    const m = y.diller[dil]
    if (!m) throw new Error(`[bilgi merkezi] ${y.kimlik} ${dil} metni yok`)
    return {
      href: bilgiMerkeziYaziHref(m.slug, dil),
      baslik: markdownAyristir(m.govde).h1,
      ozet: m.ozet,
      konu: getDictValue(dict, `bilgiMerkezi.konular.${y.konu}`),
      tarih: tarihYaz(y.yayinTarihi, dil),
      tarihIso: y.yayinTarihi,
    }
  })
}

export default function BilgiMerkeziListe({ dil, yazilar = YAZILAR }: { dil: YaziDili; yazilar?: readonly RehberYazisi[] }) {
  const dict = dil === 'en' ? en : tr
  const t = (anahtar: string) => getDictValue(dict, anahtar)
  const kartlar = listeKartlari(dil, yazilar)

  return (
    <div className="bg-clean-white">
      <div className="mx-auto max-w-page px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <nav aria-label={t('bilgiMerkezi.ad')} className="mb-8 text-sm text-industrial-gray">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href={localizedHref(Routes.home(), dil)}
                className="hover:text-brand-cyan-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan-ink"
              >
                {t('bilgiMerkezi.anaSayfa')}
              </Link>
            </li>
            <li aria-hidden="true">{'/'}</li>
            <li aria-current="page" className="text-primary-navy">
              {t('bilgiMerkezi.ad')}
            </li>
          </ol>
        </nav>

        <header className="max-w-content">
          <h1 className="text-4xl font-bold tracking-tight text-primary-navy lg:text-5xl">{t('bilgiMerkezi.liste.baslik')}</h1>
          <p className="mt-4 text-lg text-industrial-gray">{t('bilgiMerkezi.liste.altBaslik')}</p>
        </header>

        {/* BOŞ DURUM (karar 121/c): yazı yokken arama kutusu ve boş ızgara basılmaz; "hazırlanıyor"
            mesajı ve Ürün Seçici kapısı kalır. Kapı: src/lib/bilgiMerkezi/__tests__/bosDurum.test.tsx. */}
        {kartlar.length === 0 ? (
          <section aria-labelledby="rehberler-hazirlaniyor" className="mt-10 max-w-content border-l-4 border-primary-navy bg-light-gray p-8">
            <h2 id="rehberler-hazirlaniyor" className="text-2xl font-bold tracking-tight text-primary-navy">
              {t('bilgiMerkezi.liste.bosBaslik')}
            </h2>
            <p className="mt-3 text-base text-industrial-gray">{t('bilgiMerkezi.liste.bosAciklama')}</p>
          </section>
        ) : (
          <div className="mt-10">
            <BilgiMerkeziArama
              kartlar={kartlar}
              dil={dil}
              metin={{
                aramaEtiketi: t('bilgiMerkezi.liste.aramaEtiketi'),
                aramaYerTutucu: t('bilgiMerkezi.liste.aramaYerTutucu'),
                sonucYok: t('bilgiMerkezi.liste.sonucYok'),
                oku: t('bilgiMerkezi.liste.oku'),
              }}
            />
          </div>
        )}

        <section aria-labelledby="urun-secici-kapisi" className="mt-16 max-w-content rounded-hvac-md border border-light-gray p-8">
          <h2 id="urun-secici-kapisi" className="text-2xl font-bold tracking-tight text-primary-navy">
            {t('bilgiMerkezi.liste.seciciBaslik')}
          </h2>
          <p className="mt-3 text-base text-industrial-gray">{t('bilgiMerkezi.liste.seciciAciklama')}</p>
          <Link
            href={localizedHref(Routes.urunSecici(), dil)}
            className="mt-6 inline-flex items-center rounded-hvac-sm border border-primary-navy px-6 py-3 font-semibold text-primary-navy hover:border-brand-cyan-ink hover:text-brand-cyan-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan-ink"
          >
            {t('bilgiMerkezi.liste.seciciDugme')}
          </Link>
        </section>
      </div>
    </div>
  )
}
