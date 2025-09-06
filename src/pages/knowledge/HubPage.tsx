import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'

const TOPIC_SLUGS = ['hava-perdesi', 'jet-fan', 'hrv'] as const

type TopicSlug = typeof TOPIC_SLUGS[number]

const TAGS: { key: TopicSlug; labelKey: string }[] = [
  { key: 'hava-perdesi', labelKey: 'knowledge.tags.havaPerdesi' },
  { key: 'jet-fan', labelKey: 'knowledge.tags.jetFan' },
  { key: 'hrv', labelKey: 'knowledge.tags.hrv' },
]

const HubPage: React.FC = () => {
  const { t } = useI18n()
  const [q, setQ] = React.useState('')
  const [activeTag, setActiveTag] = React.useState<TopicSlug | 'all'>('all')

  const topics = React.useMemo(() => TOPIC_SLUGS.map((slug) => ({
    slug,
    title: t(`knowledge.topics.${slug}.title`),
    summary: t(`knowledge.topics.${slug}.summary`)
  })), [t])

  const filtered = React.useMemo(() => {
    const text = q.trim().toLowerCase()
    return topics.filter((tpc) => {
      const matchesText = !text || `${tpc.title} ${tpc.summary}`.toLowerCase().includes(text)
      const matchesTag = activeTag === 'all' || tpc.slug === activeTag
      return matchesText && matchesTag
    })
  }, [q, topics, activeTag])

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('knowledge.hub.title')}</h1>
          <p className="text-steel-gray mt-2 max-w-3xl">{t('knowledge.hub.subtitle')}</p>
        </header>

        {/* Arama ve etiketler */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('knowledge.hub.searchPlaceholder')}
            className="w-full md:w-96 border border-light-gray rounded-lg p-3 text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`px-3 py-1.5 text-sm rounded-full border ${activeTag==='all' ? 'bg-primary-navy text-white border-primary-navy' : 'border-light-gray text-industrial-gray hover:bg-gray-50'}`}
              onClick={() => setActiveTag('all')}
            >
              {t('knowledge.tags.all')}
            </button>
            {TAGS.map(tag => (
              <button
                key={tag.key}
                className={`px-3 py-1.5 text-sm rounded-full border ${activeTag===tag.key ? 'bg-primary-navy text-white border-primary-navy' : 'border-light-gray text-industrial-gray hover:bg-gray-50'}`}
                onClick={() => setActiveTag(tag.key)}
              >
                {t(tag.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {filtered.map((tpc) => (
            <Link
              key={tpc.slug}
              to={`/destek/konular/${tpc.slug}`}
              className="group block rounded-xl border border-light-gray p-5 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-industrial-gray group-hover:text-primary-navy">{tpc.title}</h2>
              <p className="text-sm text-steel-gray mt-2">{tpc.summary}</p>
              <div className="mt-4 text-sm font-medium text-primary-navy">{t('knowledge.hub.readMore')} →</div>
            </Link>
          ))}
        </div>

        {/* Placeholder alanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-dashed border-light-gray p-5 bg-white">
            <h3 className="font-semibold text-industrial-gray">{t('knowledge.hub.calculatorsSoon')}</h3>
            <p className="text-sm text-steel-gray mt-1">{t('knowledge.hub.calculatorsSoonDesc')}</p>
          </div>
          <div className="rounded-xl border border-dashed border-light-gray p-5 bg-white">
            <h3 className="font-semibold text-industrial-gray">{t('knowledge.hub.selectorSoon')}</h3>
            <p className="text-sm text-steel-gray mt-1">{t('knowledge.hub.selectorSoonDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HubPage
