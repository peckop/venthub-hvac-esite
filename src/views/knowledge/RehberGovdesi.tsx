import Link from 'next/link'
import React from 'react'

import type { Blok, Satirici } from '../../lib/bilgiMerkezi/markdown'

/**
 * Rehber yazısı gövdesi — SUNUCU bileşeni (rehber-yazisi-standard.md R6: gövdenin tamamı sunucu
 * HTML'inde, istemci bailout 0). Ayrıştırılmış ağacı izin listeli etiketlerle basar; ham HTML
 * yolu yok (`dangerouslySetInnerHTML` kullanılmaz). Site içi bağlantı (`vh:`) sayfa üretilirken
 * çözülmüş adresle gelir; haritada yoksa ATAR (sessiz kırık bağlantı yok).
 */

const baglantiSinifi =
  'text-brand-cyan-ink underline underline-offset-2 hover:text-primary-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan-ink'

function Satirlar({ icerik, hrefler }: { icerik: Satirici[]; hrefler: Map<string, string> }) {
  return (
    <>
      {icerik.map((s, i) => {
        switch (s.tur) {
          case 'metin':
            return <React.Fragment key={i}>{s.metin}</React.Fragment>
          case 'kod':
            return <code key={i}>{s.metin}</code>
          case 'kalin':
            return (
              <strong key={i} className="font-semibold text-primary-navy">
                <Satirlar icerik={s.icerik} hrefler={hrefler} />
              </strong>
            )
          case 'egik':
            return (
              <em key={i}>
                <Satirlar icerik={s.icerik} hrefler={hrefler} />
              </em>
            )
          case 'baglanti': {
            if (s.hedef.startsWith('vh:')) {
              const href = hrefler.get(s.hedef)
              if (!href) throw new Error(`[bilgi merkezi] çözülmemiş iç bağlantı: ${s.hedef}`)
              return (
                <Link key={i} href={href as import('next').Route} className={baglantiSinifi}>
                  <Satirlar icerik={s.icerik} hrefler={hrefler} />
                </Link>
              )
            }
            const dis = /^https?:\/\//i.test(s.hedef)
            return (
              <a
                key={i}
                href={s.hedef}
                className={baglantiSinifi}
                {...(dis ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Satirlar icerik={s.icerik} hrefler={hrefler} />
              </a>
            )
          }
        }
      })}
    </>
  )
}

export default function RehberGovdesi({ bloklar, hrefler }: { bloklar: Blok[]; hrefler: Map<string, string> }) {
  return (
    <div className="space-y-6 text-lg leading-relaxed text-industrial-gray">
      {bloklar.map((b, i) => {
        switch (b.tur) {
          case 'baslik':
            return b.duzey === 2 ? (
              <h2 key={i} id={b.id} className="scroll-mt-24 pt-6 text-2xl font-bold tracking-tight text-primary-navy">
                <Satirlar icerik={b.icerik} hrefler={hrefler} />
              </h2>
            ) : (
              <h3 key={i} id={b.id} className="scroll-mt-24 pt-2 text-xl font-semibold text-primary-navy">
                <Satirlar icerik={b.icerik} hrefler={hrefler} />
              </h3>
            )
          case 'paragraf':
            return (
              <p key={i}>
                <Satirlar icerik={b.icerik} hrefler={hrefler} />
              </p>
            )
          case 'alinti':
            return (
              <blockquote key={i} className="border-l-4 border-light-gray pl-4 italic">
                <Satirlar icerik={b.icerik} hrefler={hrefler} />
              </blockquote>
            )
          case 'liste': {
            const Etiket = b.sirali ? 'ol' : 'ul'
            return (
              <Etiket key={i} className={`space-y-2 pl-6 ${b.sirali ? 'list-decimal' : 'list-disc'}`}>
                {b.maddeler.map((m, j) => (
                  <li key={j}>
                    <Satirlar icerik={m} hrefler={hrefler} />
                  </li>
                ))}
              </Etiket>
            )
          }
          case 'tablo':
            // Tablo KENDİ kutusunda kayar; sayfa geneli yatay taşma 0 (R3, emsaldeki taşma alınmadı).
            return (
              <div key={i} className="overflow-x-auto rounded-hvac-sm border border-light-gray">
                <table className="w-full border-collapse text-base">
                  <thead className="bg-light-gray/40 text-left text-primary-navy">
                    <tr>
                      {b.basliklar.map((h, j) => (
                        <th key={j} scope="col" className="border-b border-light-gray px-4 py-3 font-semibold">
                          <Satirlar icerik={h} hrefler={hrefler} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.satirlar.map((satir, j) => (
                      <tr key={j} className="border-b border-light-gray last:border-b-0">
                        {satir.map((h, k) => (
                          <td key={k} className="px-4 py-3 align-top">
                            <Satirlar icerik={h} hrefler={hrefler} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      })}
    </div>
  )
}
