import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'

const PRODUCTS_QUERY: Record<string, string> = {
  'hava-perdesi': '/products?application=air-curtain',
  'jet-fan': '/products?application=jet-fan',
  'hrv': '/products?application=hrv'
}

const TopicPage: React.FC = () => {
  const { t } = useI18n()
  const { slug } = useParams<{ slug: string }>()
  const base = slug ? `knowledge.topics.${slug}` : ''

  const exists = slug && t(`${base}.title`) !== `${base}.title`

  if (!exists) {
    return (
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-industrial-gray mb-2">{t('knowledge.topic.notFoundTitle')}</h1>
          <p className="text-steel-gray mb-6">{t('knowledge.topic.notFoundDesc')}</p>
          <Link to="/destek/merkez" className="text-primary-navy hover:underline font-medium">{t('knowledge.topic.backToHub')} →</Link>
        </div>
      </section>
    )
  }

  const steps = (t(`${base}.steps`) as unknown as string[]) || []
  const pitfalls = (t(`${base}.pitfalls`) as unknown as string[]) || []

  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t(`${base}.title`)}</h1>
          <p className="text-steel-gray mt-2">{t(`${base}.summary`)}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl border border-light-gray p-5">
            <h2 className="font-semibold text-industrial-gray mb-2">{t('knowledge.topic.stepsTitle')}</h2>
            <ol className="list-decimal list-inside text-sm text-steel-gray space-y-1">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-light-gray p-5">
            <h2 className="font-semibold text-industrial-gray mb-2">{t('knowledge.topic.pitfallsTitle')}</h2>
            <ul className="list-disc list-inside text-sm text-steel-gray space-y-1">
              {pitfalls.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={slug ? PRODUCTS_QUERY[slug] : '/products'}
            className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition"
          >
            {t('knowledge.topic.toProducts')}
          </Link>
          <Link
            to="/support/sss#teklif"
            className="inline-flex items-center justify-center rounded-lg border border-primary-navy text-primary-navy px-5 py-2.5 font-semibold hover:bg-primary-navy hover:text-white transition"
          >
            {t('knowledge.topic.getQuote')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TopicPage
