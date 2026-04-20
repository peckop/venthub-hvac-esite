/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HelpCircle, Package, Truck, ShieldCheck, ArrowLeft, BookOpen } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { Routes } from '../../utils/routes'
import { WhatsAppIcon } from '../../components/HVACIcons'
import { getSupportLink, isWhatsAppAvailable } from '../../utils/whatsapp'

const SupportHomePage: React.FC = () => {
  const { t } = useI18n()
  const cards = [
    { title: t('support.links.faq'), desc: t('support.home.faqDesc'), to: Routes.destek.sss(), icon: HelpCircle },
    { title: t('support.links.returns'), desc: t('support.home.returnsDesc'), to: Routes.destek.iadeDegisim(), icon: Package },
    { title: t('support.links.shipping'), desc: t('support.home.shippingDesc'), to: Routes.destek.teslimatKargo(), icon: Truck },
    { title: t('support.links.warranty'), desc: t('support.home.warrantyDesc'), to: Routes.destek.garantiServis(), icon: ShieldCheck },
    { title: t('common.knowledgeHub'), desc: t('support.home.knowledgeDesc'), to: '/destek/merkez', icon: BookOpen },
  ]

  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <button onClick={() => router.back()} className="inline-flex items-center text-steel-gray hover:text-primary-navy transition-colors text-sm">
          <ArrowLeft size={18} className="mr-1" /> {t('auth.back')}
        </button>
      </div>
      <h1 className="text-3xl font-bold text-industrial-gray mb-2">{t('common.supportCenter')}</h1>
      <p className="text-steel-gray mb-8">{t('support.home.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(({ title, desc, to, icon: Icon }) => (
          <Link key={to} href={to as import('next').Route} className="group block bg-white rounded-xl border border-light-gray p-6 hover:border-primary-navy/40 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary-navy/10 p-3 text-primary-navy">
                <Icon size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors">{title}</h2>
                <p className="text-sm text-steel-gray mt-1">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* WhatsApp Support */}
      {isWhatsAppAvailable() && (() => {
        const whatsappLink = getSupportLink('Destek talebi')
        if (!whatsappLink) return null

        return (
          <div className="mt-8 whatsapp-container">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <WhatsAppIcon size={48} className="" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold whatsapp-text mb-2">Hızlı WhatsApp Desteği</h2>
                <p className="whatsapp-subtext mb-4">Acil sorularınız için WhatsApp üzerinden anında destek alın.</p>
                <a
                  href={whatsappLink as import('next').Route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <WhatsAppIcon size={18} />
                  WhatsApp'tan Yaz
                </a>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}




