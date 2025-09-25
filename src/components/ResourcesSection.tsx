import React from 'react'
import { Link } from 'react-router-dom'
import { trackEvent } from '../utils/analytics'
import { useI18n } from '../i18n/I18nProvider'

const ResourcesSection: React.FC = () => {
  const { t } = useI18n()
  const items = [
    { title: t('resources.items.jetFan'), href: '/destek/konular/jet-fan', icon: 'book' },
    { title: t('resources.items.airCurtain'), href: '/destek/konular/hava-perdesi', icon: 'file' },
    { title: t('resources.items.hrv'), href: '/destek/konular/hrv', icon: 'book' },
  ] as const

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('resources.title')}</h2>
          <Link to="/destek/merkez" className="text-primary-navy hover:underline text-sm font-medium">{t('resources.allGuides')} →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((it) => (
            <Link
              key={it.title}
              to={it.href}
              onClick={() => trackEvent('resources_click', { title: it.title, href: it.href })}
              className="group rounded-xl border border-light-gray bg-white p-5 hover:shadow-md transition flex items-start gap-3"
            >
              <div className="mt-0.5 text-primary-navy">
                {it.icon === 'book' ? <BookOpenIcon size={20} /> : <FileTextIcon size={20} />}
              </div>
              <div>
                <div className="font-semibold text-industrial-gray group-hover:text-primary-navy">{it.title}</div>
                <div className="text-sm text-steel-gray">{t('resources.teaser')}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResourcesSection

function BookOpenIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M20 2H6.5A2.5 2.5 0 0 0 4 4.5v15"/>
      <path d="M20 2a2.5 2.5 0 0 0-2.5 2.5V20"/>
    </svg>
  )
}
function FileTextIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M16 13H8"/>
      <path d="M16 17H8"/>
    </svg>
  )
}

