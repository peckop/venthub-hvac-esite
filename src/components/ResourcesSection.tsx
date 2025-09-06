import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FileText } from 'lucide-react'
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
                {it.icon === 'book' ? <BookOpen size={20} /> : <FileText size={20} />}
              </div>
              <div>
                <div className="font-semibold text-industrial-gray group-hover:text-primary-navy">{it.title}</div>
                <div className="text-sm text-steel-gray">Hızlı başlangıç için pratik ipuçları</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResourcesSection

