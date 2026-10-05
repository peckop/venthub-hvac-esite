'use client'

import Link from 'next/link'
import React, { useId, useMemo, useState } from 'react'

import { foldForSearch } from '../../i18n/case'

/**
 * Bilgi Merkezi listesinin ARAMA KUTUSU + kart ızgarası (tasarım kararı K37-a / U2).
 *
 * UÇ BİLEŞEN: yalnız süzme durumu istemcide. Kartların TAMAMI sunucu HTML'inde de basılır
 * (istemci bileşeni sunucuda ilk hâliyle render edilir, süzgeç boşken bütün kartlar görünür);
 * yani arama motoru ve JavaScript'siz ziyaretçi listenin tamamını alır. `useSearchParams`
 * KULLANILMAZ — arama adrese yazılmaz, rota statik kalır (kural 5 sınırı gerekmez).
 */

export interface ListeKarti {
  href: string
  baslik: string
  ozet: string
  konu: string
  tarih: string
  tarihIso: string
}

interface Props {
  kartlar: ListeKarti[]
  dil: string
  metin: { aramaEtiketi: string; aramaYerTutucu: string; sonucYok: string; oku: string }
}

const odakSinifi =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan-ink'

export default function BilgiMerkeziArama({ kartlar, dil, metin }: Props) {
  const [sorgu, setSorgu] = useState('')
  const aramaId = useId()

  const gorunen = useMemo(() => {
    const aranan = foldForSearch(sorgu.trim(), dil)
    if (!aranan) return kartlar
    return kartlar.filter((k) => foldForSearch(`${k.baslik} ${k.ozet} ${k.konu}`, dil).includes(aranan))
  }, [sorgu, kartlar, dil])

  return (
    <div>
      <div className="max-w-content">
        <label htmlFor={aramaId} className="block text-sm font-semibold text-primary-navy">
          {metin.aramaEtiketi}
        </label>
        <input
          id={aramaId}
          type="search"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          placeholder={metin.aramaYerTutucu}
          className={`mt-2 w-full rounded-hvac-sm border border-light-gray bg-clean-white px-4 py-3 text-base text-primary-navy ${odakSinifi}`}
        />
      </div>

      {gorunen.length === 0 ? (
        <p role="status" className="mt-10 text-base text-industrial-gray">
          {metin.sonucYok}
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gorunen.map((k) => (
            <li key={k.href}>
              <Link
                href={k.href as import('next').Route}
                className={`flex h-full flex-col rounded-hvac-sm border border-light-gray bg-clean-white p-6 transition-colors hover:border-brand-cyan-ink ${odakSinifi}`}
              >
                <span className="flex flex-wrap gap-x-2 text-sm text-industrial-gray">
                  <span className="font-semibold text-brand-cyan-ink">{k.konu}</span>
                  <span aria-hidden="true">{'·'}</span>
                  <time dateTime={k.tarihIso}>{k.tarih}</time>
                </span>
                <h2 className="mt-3 text-xl font-bold tracking-tight text-primary-navy">{k.baslik}</h2>
                <p className="mt-3 flex-1 text-base text-industrial-gray">{k.ozet}</p>
                <span className="mt-6 text-sm font-semibold text-brand-cyan-ink">{metin.oku}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
