import Link from 'next/link'
import React from 'react'

import { formatDate } from '../../i18n/datetime'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import type { YaziSayfasi } from '../../lib/bilgiMerkezi/sayfa'
import { bilgiMerkeziListeHref } from '../../utils/bilgiMerkezi'
import { localizedHref, Routes } from '../../utils/routes'
import RehberGovdesi from './RehberGovdesi'

/**
 * REHBER YAZISI SAYFASI — sunucu bileşeni (karar 92; rehber-yazisi-standard.md R3 şablon satırları).
 *
 * Sıra: kırıntı · H1 · künye (yazar, yayın tarihi, okuma süresi) · içindekiler · gövde · ürün
 * kartları · teklif çağrısı · ilgili yazılar. Boş liste GÖRÜNMEZ: ürün kartı / ilgili yazı / içindekiler
 * yoksa o blok ve başlığı hiç basılmaz (eski konu sayfasının boş "adımlar/sık hatalar" başlıkları
 * kusuru taşınmadı).
 *
 * İçindekiler masaüstünde solda yapışkan sütun, dar ekranda açılır kutu (`<details>`) — tasarım
 * ekran 14 (uzun-metin şablonu) ve R3. JavaScript gerektirmez.
 */

const odakSinifi =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan-ink'

/** Künye tarihi — biçim SSOT'u `formatDate` (INV-3); UTC gece yarısı, sunucu saat diliminden bağımsız. */
export function tarihYaz(iso: string, dil: string): string {
  return formatDate(`${iso}T00:00:00Z`, dil === 'en' ? 'en' : 'tr', { timeZone: 'UTC' })
}

function Icindekiler({ ogeler, baslik }: { ogeler: YaziSayfasi['icindekiler']; baslik: string }) {
  return (
    <nav aria-label={baslik}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-hvac-tight text-primary-navy">{baslik}</p>
      <ol className="space-y-2 text-base">
        {ogeler.map((o) => (
          <li key={o.id}>
            <a href={`#${o.id}`} className={`text-industrial-gray hover:text-brand-cyan-ink ${odakSinifi}`}>
              {o.metin}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function RehberYazisiSayfasi({ sayfa }: { sayfa: YaziSayfasi }) {
  const { dil, yazi, ayrismis, hrefler, icindekiler, okumaSuresi, urunKartlari, ilgiliYazilar } = sayfa
  const dict = dil === 'en' ? en : tr
  const t = (anahtar: string) => getDictValue(dict, anahtar)
  const listeHref = bilgiMerkeziListeHref(dil)
  const yayin = tarihYaz(yazi.yayinTarihi, dil)
  const guncellendi = yazi.guncellemeTarihi !== yazi.yayinTarihi ? tarihYaz(yazi.guncellemeTarihi, dil) : null
  const icindekilerBasligi = t('bilgiMerkezi.yazi.icindekiler')

  return (
    <div className="bg-clean-white">
      <article className="mx-auto max-w-page px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <nav aria-label={t('bilgiMerkezi.ad')} className="mb-8 text-sm text-industrial-gray">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={localizedHref(Routes.home(), dil)} className={`hover:text-brand-cyan-ink ${odakSinifi}`}>
                {t('bilgiMerkezi.anaSayfa')}
              </Link>
            </li>
            <li aria-hidden="true">{'/'}</li>
            {listeHref && (
              <>
                <li>
                  <Link href={listeHref} className={`hover:text-brand-cyan-ink ${odakSinifi}`}>
                    {t('bilgiMerkezi.ad')}
                  </Link>
                </li>
                <li aria-hidden="true">{'/'}</li>
              </>
            )}
            <li aria-current="page" className="text-primary-navy">
              {ayrismis.h1}
            </li>
          </ol>
        </nav>

        <header className="max-w-content">
          <h1 className="text-4xl font-bold tracking-tight text-primary-navy lg:text-5xl">{ayrismis.h1}</h1>
          <p className="mt-4 flex flex-wrap gap-x-2 text-base text-industrial-gray">
            <span>{t('bilgiMerkezi.yazi.yazar')}</span>
            <span aria-hidden="true">{'·'}</span>
            <time dateTime={yazi.yayinTarihi}>{yayin}</time>
            <span aria-hidden="true">{'·'}</span>
            <span>{t('bilgiMerkezi.yazi.okumaSuresi').replace('{{count}}', String(okumaSuresi))}</span>
            {guncellendi && (
              <>
                <span aria-hidden="true">{'·'}</span>
                <span>
                  {t('bilgiMerkezi.yazi.guncelleme')} <time dateTime={yazi.guncellemeTarihi}>{guncellendi}</time>
                </span>
              </>
            )}
          </p>
        </header>

        {icindekiler.length > 0 && (
          <details className="mt-8 rounded-hvac-sm border border-light-gray p-4 lg:hidden">
            <summary className={`cursor-pointer font-semibold text-primary-navy ${odakSinifi}`}>{icindekilerBasligi}</summary>
            <div className="mt-4">
              <Icindekiler ogeler={icindekiler} baslik={icindekilerBasligi} />
            </div>
          </details>
        )}

        <div className="mt-10 lg:grid lg:grid-cols-4 lg:gap-12">
          {icindekiler.length > 0 && (
            <aside className="hidden lg:col-span-1 lg:block">
              <div className="sticky top-24">
                <Icindekiler ogeler={icindekiler} baslik={icindekilerBasligi} />
              </div>
            </aside>
          )}

          <div className={`min-w-0 max-w-content ${icindekiler.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <RehberGovdesi bloklar={ayrismis.bloklar} hrefler={hrefler} />

            {urunKartlari.length > 0 && (
              <section aria-labelledby="ilgili-urunler" className="mt-16">
                <h2 id="ilgili-urunler" className="text-2xl font-bold tracking-tight text-primary-navy">
                  {t('bilgiMerkezi.yazi.urunlerBaslik')}
                </h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {urunKartlari.map((k) => (
                    <li key={k.href}>
                      <Link
                        href={k.href}
                        className={`block h-full rounded-hvac-sm border border-light-gray p-5 transition-colors hover:border-brand-cyan-ink ${odakSinifi}`}
                      >
                        <span className="block font-semibold text-primary-navy">{k.ad}</span>
                        <span className="mt-2 block text-sm text-brand-cyan-ink">{t('bilgiMerkezi.yazi.urunDugme')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="teklif-cagrisi" className="mt-16 rounded-hvac-md bg-primary-navy p-8 text-clean-white">
              <h2 id="teklif-cagrisi" className="text-2xl font-bold tracking-tight">
                {t('bilgiMerkezi.yazi.teklifBaslik')}
              </h2>
              <p className="mt-3 text-clean-white/80">{t('bilgiMerkezi.yazi.teklifAciklama')}</p>
              <Link
                href={localizedHref(Routes.contact(), dil)}
                className="mt-6 inline-flex items-center rounded-hvac-sm bg-clean-white px-6 py-3 font-semibold text-primary-navy hover:bg-light-gray focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clean-white"
              >
                {t('bilgiMerkezi.yazi.teklifDugme')}
              </Link>
            </section>

            {ilgiliYazilar.length > 0 && (
              <section aria-labelledby="ilgili-yazilar" className="mt-16">
                <h2 id="ilgili-yazilar" className="text-2xl font-bold tracking-tight text-primary-navy">
                  {t('bilgiMerkezi.yazi.ilgiliBaslik')}
                </h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {ilgiliYazilar.map((y) => (
                    <li key={y.href}>
                      <Link
                        href={y.href}
                        className={`block h-full rounded-hvac-sm border border-light-gray p-5 hover:border-brand-cyan-ink ${odakSinifi}`}
                      >
                        <span className="block font-semibold text-primary-navy">{y.baslik}</span>
                        <span className="mt-2 block text-base text-industrial-gray">{y.ozet}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {listeHref && (
              <p className="mt-16">
                <Link href={listeHref} className={`font-semibold text-brand-cyan-ink hover:text-primary-navy ${odakSinifi}`}>
                  {t('bilgiMerkezi.yazi.listeyeDon')}
                </Link>
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
