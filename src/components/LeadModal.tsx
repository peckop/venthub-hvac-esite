import { Briefcase,Building2, CheckCircle2, ChevronRight, Mail, MapPin, Phone, X } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'

const CONTACT_EMAIL = 'info@venthub.com.tr'

interface LeadModalProps {
  open: boolean
  onClose: () => void
  productName?: string
  _productId?: string
}

const LeadModal: React.FC<LeadModalProps> = ({ open, onClose, productName, _productId: __productId }) => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()

  const applicationAreas = [
    t('lead.appAreas.parking'),
    t('lead.appAreas.kitchen'),
    t('lead.appAreas.cleanroom'),
    t('lead.appAreas.retail'),
    t('lead.appAreas.office'),
    t('lead.appAreas.warehouse'),
    t('lead.appAreas.other')
  ]

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [appArea, setAppArea] = useState('')
  const [message, setMessage] = useState(productName ? t('lead.defaultMessage', { productName }) : '')
  const [consent, setConsent] = useState(false)

  const [submitted, setSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!open) return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = t('lead.errors.name')
    if (!email.trim() && !phone.trim()) e.contact = t('lead.errors.contact')
    if (!consent) e.consent = t('lead.errors.consent')
    return e
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitted(true)

    // Simulate API Call for better UX instead of "mailto"
    setTimeout(() => {
      setIsSuccess(true)
      setSubmitted(false)

      // Auto close after success
      setTimeout(() => {
        handleClose()
      }, 3000)
    }, 1200)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setIsSuccess(false)
      setName(''); setCompany(''); setEmail(''); setPhone(''); setCity(''); setAppArea(''); setConsent(false)
      setMessage(productName ? t('lead.defaultMessage', { productName }) : '')
      setErrors({})
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-0 sm:p-4 perspective-1000">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary-blue/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
        role="presentation"
      />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="relative w-full max-w-5xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-screen sm:max-h-85vh transform transition-colors animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Close Button Mobile */}
        <button
          onClick={handleClose}
          aria-label={t('common.close')}
          className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-gray-100 rounded-full text-gray-500 sm:hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="w-full p-8 sm:p-16 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-primary-navy mb-2">{t('lead.success.title')}</h3>
            <p className="text-steel-gray max-w-md">
              {t('lead.success.description')}
            </p>
          </div>
        ) : (
          /* Form State */
          <>
            {/* Left Side - Value Prop (Hidden on small screens) */}
            <div className="hidden sm:flex w-2/5 bg-primary-navy text-white p-10 flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8 opacity-80">
                  <Building2 className="w-6 h-6" />
                  <span className="font-bold tracking-wider text-sm">{t('lead.valueProp.badge')}</span>
                </div>

                <h3 className="text-3xl font-bold leading-tight mb-4 whitespace-pre-line">
                  {t('lead.valueProp.title')}
                </h3>
                <p className="text-blue-100/80 mb-8 max-w-sm text-sm leading-relaxed">
                  {t('lead.valueProp.description')}
                </p>

                <div className="space-y-4 text-sm text-blue-100/80">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-blue" />
                    <span>{t('lead.valueProp.feature1')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-blue" />
                    <span>{t('lead.valueProp.feature2')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-blue" />
                    <span>{t('lead.valueProp.feature3')}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 block mt-12 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
                <h4 className="font-semibold text-white mb-2">{t('lead.form.corporateContact')}</h4>
                <a href="mailto:info@venthub.com.tr" className="text-blue-200 hover:text-white flex items-center gap-2 text-sm transition-colors">
                  <Mail className="w-4 h-4" /> {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full sm:w-3/5 p-6 sm:p-10 overflow-y-auto bg-white flex flex-col">
              <div className="flex justify-between items-start mb-6 hidden sm:flex">
                <div>
                  <h2 id="lead-modal-title" className="text-2xl font-bold text-primary-navy">{t('lead.form.title')}</h2>
                  {productName && (
                    <p className="text-sm text-steel-gray mt-1 flex items-center gap-1">
                      <span className="px-2 py-1 bg-gray-100 rounded-md font-medium text-xs text-industrial-gray">{productName}</span>
                      {t('lead.form.productContext')}
                    </p>
                  )}
                </div>
                <button onClick={handleClose} aria-label={t('common.close')} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Head */}
              <div className="sm:hidden mb-6 mt-4">
                <h2 className="text-2xl font-bold text-primary-navy">{t('lead.form.title')}</h2>
                {productName && (
                  <p className="text-sm text-steel-gray mt-1 flex items-center gap-1">
                    {t('lead.form.productLabel')} <span className="font-semibold">{productName}</span>
                  </p>
                )}
              </div>

              <form onSubmit={submit} className="space-y-5 flex-1 flex flex-col">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-industrial-gray uppercase tracking-wider">{t('lead.form.nameLabel')}</label>
                    <div className="relative">
                      <input
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className={`w-full bg-gray-50 border ${errors.name ? 'border-red-400 focus:bg-red-50' : 'border-gray-200'} rounded-lg px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  {/* Company */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-industrial-gray uppercase tracking-wider">{t('lead.form.companyLabel')}</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                      <input
                        value={company} onChange={(e) => setCompany(e.target.value)}
                        placeholder={t('lead.companyPlaceholder')}
                        className="w-full bg-gray-50 border border-gray-200 pl-10 rounded-lg pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-industrial-gray uppercase tracking-wider">{t('lead.form.emailLabel')}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@sirket.com"
                        className="w-full bg-gray-50 border border-gray-200 pl-10 rounded-lg pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-industrial-gray uppercase tracking-wider">{t('lead.form.phoneLabel')}</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                      <input
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full bg-gray-50 border border-gray-200 pl-10 rounded-lg pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {errors.contact && <p className="text-xs text-red-500 -mt-2">{errors.contact}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-industrial-gray uppercase tracking-wider">{t('lead.form.cityLabel')}</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                      <input
                        value={city} onChange={(e) => setCity(e.target.value)}
                        placeholder={t('lead.cityPlaceholder')}
                        className="w-full bg-gray-50 border border-gray-200 pl-10 rounded-lg pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                      />
                    </div>
                  </div>

                  {/* App Area */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-industrial-gray uppercase tracking-wider">{t('lead.form.appAreaLabel')}</label>
                    <select
                      value={appArea} onChange={(e) => setAppArea(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                    >
                      <option value="">{t('lead.form.selectPlaceholder')}</option>
                      {applicationAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-semibold text-industrial-gray uppercase tracking-wider">{t('lead.form.messageLabel')}</label>
                  <textarea
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder={t('lead.form.messagePlaceholder')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors h-32"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                  {/* KVKK Onay */}
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    <div className="flex items-center h-5">
                      <input
                        id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                        className="w-4 h-4 text-primary-navy bg-gray-100 border-gray-300 rounded focus-visible:ring-primary-navy focus-visible:ring-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="consent" className="text-xs text-steel-gray leading-tight cursor-pointer">
                        <Link href={Routes.legal.kvkk()} className="text-primary-navy hover:underline font-medium" target="_blank" rel="noopener">{t('legalLinks.kvkk')}</Link> {t('lead.consent.text')}
                      </label>
                      {errors.consent && <p className="text-xs text-red-500 mt-0.5">{errors.consent}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitted}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-navy hover:bg-secondary-blue text-white px-8 py-3 rounded-lg font-bold transition-shadow disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-blue-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-navy"
                  >
                    {submitted ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t('lead.form.submit')}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default React.memo(LeadModal)



