'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ExternalLink, MessageCircle } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import Seo from '../components/Seo'
import { WhatsAppIcon } from '../components/HVACIcons'
import { getSupportLink } from '../utils/whatsapp'

const ContactPage: React.FC = () => {
  const { t } = useI18n()
  const [formSubmitted, setFormSubmitted] = useState(false)
  const whatsappLink = getSupportLink('İletişim Sayfası')

  const contactCards = [
    {
      icon: Phone,
      title: 'Mühendislik Hattı',
      value: '+90 (544) 245 02 05',
      href: 'tel:+905442450205',
      label: 'Şimdi Ara'
    },
    {
      icon: Mail,
      title: 'Teknik Teklif',
      value: 'info@venthub-hvac.com',
      href: 'mailto:info@venthub-hvac.com',
      label: 'E-posta Gönder'
    },
    {
      icon: MapPin,
      title: 'Merkez Ofis',
      value: 'Teknopark İstanbul, Pendik',
      href: 'https://maps.google.com',
      label: 'Yol Tarifi Al'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic using supabase would go here
    setFormSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${t('contactPage.title')} | VentHub`}
        description={t('contactPage.subtitle')}
      />

      {/* Hero: Minimalist & Dramatic */}
      <section className="pt-32 pb-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">Global Connectivity</span>
          </motion.div>
          <h1 className="text-5xl lg:text-8xl font-extralight tracking-tighter text-slate-900 leading-[1.1] mb-10">
            Projenizi <span className="font-medium text-slate-950 italic">Birlikte Şekillendirelim</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-light leading-relaxed">
            Teknik dökümantasyon, ürün seçimi veya özel teklifler için uzman mühendislik kadromuzla doğrudan iletişime geçin.
          </p>
        </div>
      </section>

      {/* Quick Contact Grid */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {contactCards.map((card, i) => (
              <motion.a
                key={i}
                href={card.href}
                target={card.icon === MapPin ? "_blank" : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 hover:border-cyan-500/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                  <card.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{card.title}</h3>
                <div className="text-2xl font-medium text-slate-900 mb-6 tracking-tight">{card.value}</div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-600">
                  {card.label} <ArrowRight size={12} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Action Area */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8">Direct Access</div>
              <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter leading-[1.1] mb-8">
                Teknik Destek <br />
                <span className="font-medium text-cyan-400 italic">Her An Yanınızda</span>
              </h2>
              <p className="text-lg text-slate-400 font-light leading-relaxed mb-12 max-w-xl">
                Karmaşık HVAC projeleriniz için hızlı çözümler üretiyoruz. WhatsApp hattımız üzerinden teknik döküman isteyebilir veya anlık destek alabilirsiniz.
              </p>
              
              <div className="space-y-6">
                <a 
                  href={whatsappLink || undefined}
                  target="_blank"
                  className="inline-flex items-center gap-4 bg-white text-slate-950 px-10 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 transition-all active:scale-95 shadow-2xl shadow-cyan-500/20"
                >
                  <WhatsAppIcon size={20} />
                  WhatsApp Mühendislik Hattı
                </a>
                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2">
                  <Clock size={14} /> Ortalama Yanıt Süresi: 15 Dakika
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 lg:p-12 text-slate-900 shadow-2xl">
              {formSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-4">Mesajınız İletildi</h3>
                  <p className="text-slate-500 font-light">Mühendislik ekibimiz en kısa sürede size dönüş yapacaktır.</p>
                  <button 
                    onClick={() => setFormSubmitted(false)}
                    className="mt-10 text-[10px] font-black uppercase tracking-widest text-cyan-600 hover:underline"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ad Soyad</label>
                      <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">E-posta</label>
                      <input required type="email" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="name@company.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Konu / Proje Adı</label>
                    <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="Örn: Otopark Jet Fan Projesi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mesajınız</label>
                    <textarea required rows={4} className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-cyan-500 transition-all resize-none" placeholder="İhtiyaçlarınızı buraya yazın..." />
                  </div>
                  <button className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-cyan-600 transition-all shadow-xl active:scale-[0.98]">
                    Talebi Gönder
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
