import React, { useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

const MagneticCTA: React.FC = () => {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement | null>(null)
  const [hover, setHover] = useState(false)

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!hover) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 12 // px
    const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 12
    el.style.setProperty('--dx', `${dx}px`)
    el.style.setProperty('--dy', `${dy}px`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--dx', `0px`)
    el.style.setProperty('--dy', `0px`)
    setHover(false)
  }

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-light-gray bg-gradient-to-r from-primary-navy to-secondary-blue p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">{t('homeCta.title')}</h3>
            <p className="text-white/90">{t('homeCta.subtitle')}</p>
          </div>
          <div
            ref={ref}
            onMouseEnter={() => setHover(true)}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="relative"
          >
            <button
              onClick={() => ((window as unknown) as { openLeadModal?: () => void }).openLeadModal?.()}
              className="inline-flex items-center justify-center rounded-xl bg-white text-primary-navy font-bold px-8 py-4 shadow-lg hover:shadow-xl transition-transform"
              style={{ transform: 'translate(var(--dx, 0px), var(--dy, 0px))' }}
            >
              {t('homeCta.button')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MagneticCTA

