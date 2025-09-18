import React, { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

const ScrollLinkedProcess: React.FC = () => {
  const { t } = useI18n()
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const STEPS = [
    { key: 'need', title: t('homeProcess.steps.need.title'), desc: t('homeProcess.steps.need.desc') },
    { key: 'analysis', title: t('homeProcess.steps.analysis.title'), desc: t('homeProcess.steps.analysis.desc') },
    { key: 'proposal', title: t('homeProcess.steps.proposal.title'), desc: t('homeProcess.steps.proposal.desc') },
    { key: 'implementation', title: t('homeProcess.steps.implementation.title'), desc: t('homeProcess.steps.implementation.desc') },
    { key: 'support', title: t('homeProcess.steps.support.title'), desc: t('homeProcess.steps.support.desc') },
  ] as const

  useEffect(() => {
    const sections = refs.current.filter(Boolean) as HTMLDivElement[]
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = sections.findIndex(s => s === e.target)
          if (idx >= 0) setActive(idx)
        }
      })
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 })
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const scrollTo = (i: number) => {
    refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('homeProcess.title')}</h2>
          <p className="text-steel-gray">{t('homeProcess.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-2">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => scrollTo(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition ${i===active ? 'border-primary-navy bg-primary-navy/5 text-primary-navy' : 'border-light-gray bg-white text-industrial-gray hover:bg-gray-50'}`}
                >
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-steel-gray">{s.desc}</div>
                </button>
              ))}
            </div>
          </aside>
          <main className="lg:col-span-3 space-y-6">
            {STEPS.map((s, i) => (
              <div key={s.key} ref={el => refs.current[i] = el} className="rounded-2xl border border-light-gray bg-white p-6 shadow-sm">
                <div className="text-sm text-primary-navy font-semibold mb-1">{t('homeProcess.stepPrefix')} {i+1}</div>
                <h3 className="text-xl font-bold text-industrial-gray mb-2">{s.title}</h3>
                <p className="text-steel-gray">{s.desc}</p>
              </div>
            ))}
          </main>
        </div>
      </div>
    </section>
  )
}

export default ScrollLinkedProcess

