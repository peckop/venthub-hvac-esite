'use client'

import { CheckCircle,Clock, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { WhatsAppIcon } from '../components/HVACIcons'
import Seo from '../components/Seo'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import useScrollAnimation, { scrollAnimationClasses } from '../hooks/useScrollAnimation'
import { useI18n } from '../i18n/I18nProvider'
import { reportError } from '../lib/errorReporter'
import { submitContactMessage } from '../lib/services/contactMessageService'
import { supabaseBrowserClient } from '../lib/supabase/client'
import { getSupportLink, getWhatsAppNumber } from '../utils/whatsapp'

const ContactPage: React.FC = () => {
  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()
  const [formSubmitted, setFormSubmitted] = useState(false)
  // Girdiler KONTROLLÜ olmak zorunda: eskiden hiçbir alanın değeri okunmuyordu, çünkü
  // gönderim zaten hiçbir yere yazmıyordu. Yazma gerçek olunca değer de gerçek olmalı.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const whatsappLink = getSupportLink(t('common.whatsapp.supportMessageDefault'), lang)
  const [heroBadgeRef, heroBadgeVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  const [contactGridRef, contactGridVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 })
  const [formSuccessRef, formSuccessVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })

  /**
   * ⚠️ UYDURMA İLETİŞİM BİLGİSİ BASILMAZ (2026-08-28, Recep talimatı — canlıya çıkış hazırlığı).
   *
   * Burada üç kusur vardı: sabit yazılmış bir telefon numarası, `venthub-hvac.com` gibi
   * sahip olunmayan bir e-posta alan adı, ve `maps.google.com`'a giden gerçek-dışı bir
   * ofis kartı. Müşteriye ulaşamayacağı bir numara göstermek, hiç göstermemekten kötüdür.
   *
   * KURAL: numara ENV'den gelir; ENV yoksa kart HİÇ ÜRETİLMEZ (boş/uydurma değer yerine
   * yokluk). Ofis kartı, gerçek adres olana kadar bilinçli olarak YOK.
   */
  const whatsappNumber = getWhatsAppNumber()

  const contactCards = [
    ...(whatsappNumber
      ? [{
          icon: Phone,
          title: t('contactPage.form.cardPhoneTitle'),
          value: `+${whatsappNumber}`,
          href: `tel:+${whatsappNumber}`,
          label: t('contactPage.form.cardPhoneLabel')
        }]
      : []),
    {
      icon: Mail,
      title: t('contactPage.form.cardEmailTitle'),
      value: 'info@venthub.com.tr',
      href: 'mailto:info@venthub.com.tr',
      label: t('contactPage.form.cardEmailLabel')
    }
  ]

  /**
   * NİÇİN BU HÂLE GELDİ — burada tek satır yorum vardı: *"Form submission logic using
   * supabase would go here"*. Yani iletişim formu müşteriye "iletildi" derken hiçbir yere
   * yazmıyordu. `form-submission-standard.md` §7 bunu adıyla yasaklıyor (yazma yerine
   * geçen yorum). Ölçüm: prod'da `contact_messages` tablosu 19 Ağustos'tan beri **boş**.
   *
   * KVKK RIZASI EKLENDİ, ZORUNLU OLDUĞU İÇİN: `submit_contact_message` `p_consent` true
   * değilse satır YAZMAZ. Rızayı sabit `true` göndermek hukuki bir kaydı uydurmak olurdu;
   * bu yüzden kutu forma eklendi ve değeri kullanıcıdan geliyor (cetvel §3).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!consent) {
      setFormError(t('contactPage.form.consentRequired'))
      return
    }
    setSubmitting(true)
    try {
      // Dönen kimlik, başarı ekranının TEK dayanağı (§1).
      await submitContactMessage(supabaseBrowserClient, {
        name,
        message,
        email,
        subject,
        consent,
      })
      setFormSubmitted(true)
    } catch (err) {
      // §2: form açık kalır, girdiler korunur, kullanıcıya insanca cümle çıkar.
      reportError(err, { source: 'ContactPage.handleSubmit' })
      setFormError(t('contactPage.form.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${t('contactPage.title')} | VentHub`}
        description={t('contactPage.subtitle')}
      />

      {/* Hero: Minimalist & Dramatic */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div ref={heroBadgeRef} className={scrollAnimationClasses.fadeUp(heroBadgeVisible) + " inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"}>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-hvac-loose text-cyan-600">{t('contactPage.form.heroBadge')}</span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-extralight tracking-tighter text-slate-900 leading-hvac-11 mb-10">
            {t('contactPage.form.heroTitle')} <span className="font-medium text-slate-950 italic">{t('contactPage.form.heroTitleAccent')}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-light leading-relaxed">
            {t('contactPage.form.heroDesc')}
          </p>
        </div>
      </section>

      {/* Quick Contact Grid */}
      <section className="py-24">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sütun sayısı 3'ten 2'ye indi: ofis kartı kaldırıldı (uydurma adres) ve
              telefon kartı ENV'e bağlandı; 3 sütunlu ızgara sağda boşluk bırakırdı. */}
          <div ref={contactGridRef} className="grid md:grid-cols-2 gap-8">
            {contactCards.map((card, i) => (
              <a
                key={i}
                href={card.href}
                className={scrollAnimationClasses.fadeUp(contactGridVisible) + " group p-10 rounded-hvac-2xl bg-white border border-slate-100 transition-colors duration-500 hover:border-cyan-500/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]"}
                style={scrollAnimationClasses.staggerChild(i)}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-500">
                  <card.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{card.title}</h3>
                <div className="text-2xl font-medium text-slate-900 mb-6 tracking-tight">{card.value}</div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-600">
                  {card.label} <ArrowRight size={12} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Action Area */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-500px h-500px bg-cyan-500/20 blur-120 rounded-full" />
          <div className="absolute bottom-0 left-0 w-500px h-500px bg-blue-500/10 blur-120 rounded-full" />
        </div>

        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="text-cyan-400 text-xs font-black uppercase tracking-hvac-wide mb-8">{t('contactPage.form.directAccessLabel')}</div>
              <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter leading-hvac-11 mb-8">
                {t('contactPage.form.supportTitle')} <br />
                <span className="font-medium text-cyan-400 italic">{t('contactPage.form.supportTitleAccent')}</span>
              </h2>
              <p className="text-lg text-slate-400 font-light leading-relaxed mb-12 max-w-xl">
                {t('contactPage.form.supportDesc')}
              </p>
              
              <div className="space-y-6">
                <a 
                  href={whatsappLink || '#'}
                  target="_blank"
                  className="inline-flex items-center gap-4 bg-white text-slate-950 px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-transform active:scale-95 shadow-2xl shadow-cyan-500/20"
                >
                  <WhatsAppIcon size={20} />
                  {t('contactPage.form.whatsappCta')}
                </a>
                <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest px-2">
                  <Clock size={14} /> {t('contactPage.form.responseTime')}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-hvac-3xl p-8 lg:p-12 text-slate-900 shadow-2xl">
              {formSubmitted ? (
                <div ref={formSuccessRef} className={scrollAnimationClasses.scaleIn(formSuccessVisible) + " text-center py-20"}>
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-4">{t('contactPage.form.successTitle')}</h3>
                  <p className="text-slate-500 font-light">{t('contactPage.form.successDesc')}</p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-10 text-xs font-black uppercase tracking-widest text-cyan-600 hover:underline"
                  >
                    {t('contactPage.form.newMessage')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">{t('contactPage.form.labelName')}</label>
                      <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">{t('contactPage.form.labelEmail')}</label>
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors" placeholder="name@company.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">{t('contactPage.form.labelSubject')}</label>
                    <input required type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors" placeholder={t('contactPage.form.subjectPlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">{t('contactPage.form.labelMessage')}</label>
                    <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors resize-none" placeholder={t('contactPage.form.messagePlaceholder')} />
                  </div>

                  {/* KVKK rızası — RPC `p_consent` true değilse satır YAZMIYOR (cetvel §3).
                      Kutu yoktu; sabit `true` göndermek hukuki kaydı uydurmak olurdu. */}
                  <div className="flex items-start gap-3">
                    <input
                      id="contact-consent" type="checkbox" checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500"
                    />
                    <label htmlFor="contact-consent" className="text-xs text-steel-gray leading-relaxed cursor-pointer">
                      <Link href={Routes.legal.kvkk()} className="text-cyan-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                        {t('legalLinks.kvkk')}
                      </Link>{' '}
                      {t('contactPage.form.consentText')}
                    </label>
                  </div>

                  {/* Yazma hatası — cetvel §2: form açık kalır, girdiler korunur. */}
                  {formError && (
                    <div role="alert" className="rounded-hvac-md border border-red-200 bg-red-50 px-5 py-4">
                      <p className="text-xs text-red-600">{formError}</p>
                    </div>
                  )}

                  <button type="submit" disabled={submitting} className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-600 transition-transform shadow-xl active:scale-98 disabled:opacity-60">
                    {t('contactPage.form.submitButton')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const ArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export default ContactPage
