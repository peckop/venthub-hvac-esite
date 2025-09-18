import React, { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'

const SpotlightList: React.FC = () => {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement | null>(null)
  const ITEMS = [
    { title: t('homeSpotlight.items.parkingJetFan.title'), desc: t('homeSpotlight.items.parkingJetFan.desc'), href: '/products?all=1' },
    { title: t('homeSpotlight.items.airCurtain.title'), desc: t('homeSpotlight.items.airCurtain.desc'), href: '/products?all=1' },
    { title: t('homeSpotlight.items.hrv.title'), desc: t('homeSpotlight.items.hrv.desc'), href: '/products?all=1' },
    { title: t('homeSpotlight.items.smokeExhaust.title'), desc: t('homeSpotlight.items.smokeExhaust.desc'), href: '/products?all=1' },
  ] as const

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--sx', `${x}%`)
    el.style.setProperty('--sy', `${y}%`)
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('homeSpotlight.title')}</h2>
          <p className="text-steel-gray">{t('homeSpotlight.subtitle')}</p>
        </div>
        <div
          ref={ref}
          onMouseMove={onMove}
          className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {/* Overlay: spotlight */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: 'radial-gradient(180px at var(--sx,50%) var(--sy,50%), rgba(255,255,255,0) 0%, rgba(0,0,0,0.06) 65%)' }}
          />
          {ITEMS.map((it) => (
            <a key={it.title} href={it.href} className="relative rounded-xl border border-light-gray bg-white p-4 hover:shadow-md transition">
              <div className="text-sm font-semibold text-industrial-gray">{it.title}</div>
              <div className="text-xs text-steel-gray mt-1">{it.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpotlightList

