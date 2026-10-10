import Link from 'next/link'
import React from 'react'

import type { RehberBaglantisi } from '../../lib/bilgiMerkezi/tersDizin'

/**
 * İLGİLİ REHBERLER — kategori ve aile sayfasının altında, o konudaki rehber yazılarına bağlantı
 * (REC-452; rehber-yazisi-standard.md R3.1). Sunucuda çizilir: bağlantı ilk HTML'de durur, arama
 * motoru JS çalıştırmadan görür.
 *
 * Liste boşsa HİÇBİR ŞEY basılmaz (boş başlık yok — R0.1'deki eski kusur). Liste ve adresler
 * `ilgiliRehberler` (tersDizin.ts) ile hesaplanır; kapalı dil orada elenir.
 * Görünüm rehber sayfasındaki "İlgili yazılar" bölümüyle aynıdır (RehberYazisiSayfasi.tsx).
 */

const odakSinifi =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan-ink'

export interface IlgiliRehberlerProps {
  rehberler: readonly RehberBaglantisi[]
  baslik: string
}

export default function IlgiliRehberler({ rehberler, baslik }: IlgiliRehberlerProps) {
  if (rehberler.length === 0) return null
  return (
    <section aria-labelledby="ilgili-rehberler" className="content-auto mx-auto max-w-page px-4 py-12 sm:px-6 lg:px-8">
      <h2 id="ilgili-rehberler" className="text-2xl font-bold tracking-tight text-primary-navy">
        {baslik}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rehberler.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className={`block h-full rounded-hvac-sm border border-light-gray p-5 hover:border-brand-cyan-ink ${odakSinifi}`}
            >
              <span className="block font-semibold text-primary-navy">{r.baslik}</span>
              {/* Kart metni `kartOzeti`dir (meta açıklaması DEĞİL); boşsa çizilmez, yerine meta konmaz. */}
              {r.kartOzeti ? <span className="mt-2 block text-base text-industrial-gray">{r.kartOzeti}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
