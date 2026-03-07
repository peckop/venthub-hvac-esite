import React, { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Building2, Wrench, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { WhatsAppIcon } from '../components/HVACIcons'
import { getSupportLink, isWhatsAppAvailable } from '../utils/whatsapp'
import { useI18n } from '../i18n/I18nProvider'
import { useScrollAnimation, scrollAnimationClasses } from '../hooks/useScrollAnimation'
import Seo from '../components/Seo'

/**
 * ContactPage - Premium "İletişim" sayfası
 * Department routing, premium form, çalışma saatleri
 */
const ContactPage: React.FC = () => {
  const { t } = useI18n()
  const [heroRef, heroVisible] = useScrollAnimation<HTMLElement>()
  const [formRef, formVisible] = useScrollAnimation<HTMLDivElement>()
  const [formSubmitted, setFormSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adres',
      content: 'Organize Sanayi Bölgesi,\nİstanbul, Türkiye',
      href: null,
      color: 'text-primary-navy',
      bgColor: 'bg-air-blue'
    },
    {
      icon: Phone,
      title: 'Telefon',
      content: '+90 (216) 123-45-67',
      href: 'tel:+902161234567',
      color: 'text-success-green',
      bgColor: 'bg-green-50'
    },
    {
      icon: Mail,
      title: 'E-posta',
      content: 'info@venthub.com.tr',
      href: 'mailto:info@venthub.com.tr',
      color: 'text-gold-accent',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      content: 'Pzt-Cuma: 09:00 - 18:00\nCmt: 09:00 - 14:00',
      href: null,
      color: 'text-secondary-blue',
      bgColor: 'bg-blue-50'
    }
  ]

  const departments = React.useMemo(() => [
    {
      id: 'sales',
      icon: Building2,
      title: 'Satış',
      description: 'Yeni projeler ve toplu siparişler',
      color: 'border-primary-navy text-primary-navy'
    },
    {
      id: 'support',
      icon: Wrench,
      title: 'Teknik Destek',
      description: 'Ürün kullanımı ve sorun giderme',
      color: 'border-success-green text-success-green'
    },
    {
      id: 'consulting',
      icon: MessageSquare,
      title: 'Proje Danışmanlığı',
      description: 'HVAC sistem planlama',
      color: 'border-gold-accent text-gold-accent'
    }
  ], [])

  // URL Params for Department Pre-selection
  const [selectedDept, setSelectedDept] = useState<string>('')

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const query = new URLSearchParams(window.location.search)
    const deptParam = query.get('dept')
    if (deptParam && departments.some(d => d.id === deptParam)) {
      setSelectedDept(deptParam)
    }
  }, [departments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    // Simple validation
    if (!selectedDept) {
      alert('Lütfen bir konu seçiniz.')
      return
    }

    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      department: selectedDept as 'sales' | 'support' | 'consulting',
      status: 'new'
    }

    try {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.from('contact_messages').insert(payload as import('../types/database.types').Database['public']['Tables']['contact_messages']['Insert'])
      if (error) throw error
      setFormSubmitted(true)
      window.scrollTo({ top: formRef.current?.offsetTop || 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Submission error:', err)
      alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="min-h-screen">
      <Seo
        title={`${t('contactPage.title')} | VentHub`}
        description="VentHub ile iletişime geçin. Satış, teknik destek ve proje danışmanlığı için 7/24 ulaşılabilir."
        canonical={typeof window !== 'undefined' ? `${window.location.origin}/contact` : ''}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-12 sm:py-16 bg-gradient-to-br from-primary-navy to-industrial-gray text-white overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-blue rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center max-w-2xl mx-auto ${scrollAnimationClasses.fadeUp(heroVisible)}`}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('contactPage.title')}
            </h1>
            <p className="text-lg text-white/70">
              Sorularınız için yanınızdayız. Size en uygun iletişim kanalını seçin.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              const content = (
                <div className={`h-full p-5 sm:p-6 rounded-2xl ${info.bgColor} border border-light-gray hover:shadow-hvac transition-all`}>
                  <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 ${info.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-industrial-gray mb-2">{info.title}</h3>
                  <p className="text-sm text-steel-gray whitespace-pre-line">{info.content}</p>
                </div>
              )

              if (info.href) {
                return (
                  <a key={index} href={info.href} className="block hover:scale-[1.02] transition-transform">
                    {content}
                  </a>
                )
              }
              return <div key={index}>{content}</div>
            })}
          </div>
        </div>
      </section>

      {/* WhatsApp Quick Contact */}
      {isWhatsAppAvailable() && (() => {
        const whatsappLink = getSupportLink('İletişim sayfası')
        if (!whatsappLink) return null

        return (
          <section className="py-8 bg-gradient-to-r from-green-50 to-green-100 border-y border-green-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-success-green flex items-center justify-center">
                    <WhatsAppIcon size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-industrial-gray">Hızlı Destek</h3>
                    <p className="text-steel-gray text-sm">WhatsApp üzerinden anında yanıt alın</p>
                  </div>
                </div>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-success-green hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  <WhatsAppIcon size={20} />
                  WhatsApp'tan Yaz
                </a>
              </div>
            </div>
          </section>
        )
      })()}

      {/* Department Selection + Form */}
      <section className="py-12 sm:py-16 bg-light-gray">
        <div ref={formRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Department Selection */}
            <div className={`lg:col-span-2 ${scrollAnimationClasses.fadeUp(formVisible)}`}>
              <h2 className="text-xl font-bold text-industrial-gray mb-4">
                Konu Seçin
              </h2>
              <p className="text-steel-gray text-sm mb-6">
                İlgili birime yönlendirilmeniz için konu seçin
              </p>
              <div className="space-y-3">
                {departments.map((dept) => {
                  const Icon = dept.icon
                  const isSelected = selectedDept === dept.id
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDept(dept.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected
                        ? `${dept.color} bg-white shadow-hvac`
                        : 'border-light-gray bg-white hover:border-steel-gray'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isSelected ? '' : 'text-steel-gray'} />
                        <div>
                          <div className={`font-semibold ${isSelected ? '' : 'text-industrial-gray'}`}>
                            {dept.title}
                          </div>
                          <div className="text-sm text-steel-gray">{dept.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contact Form */}
            <div className={`lg:col-span-3 ${scrollAnimationClasses.fadeUp(formVisible)}`} style={{ transitionDelay: '100ms' }}>
              {formSubmitted ? (
                <div className="h-full flex items-center justify-center bg-white rounded-2xl p-8 border border-light-gray">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-success-green/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-success-green" />
                    </div>
                    <h3 className="text-xl font-bold text-industrial-gray mb-2">Mesajınız Alındı!</h3>
                    <p className="text-steel-gray">En kısa sürede size dönüş yapacağız.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-light-gray">
                  <h2 className="text-xl font-bold text-industrial-gray mb-6">
                    Mesaj Gönderin
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        name="name"
                        type="text"
                        required
                        className="input-modern"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        E-posta *
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="input-modern"
                        placeholder="ornek@sirket.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        Telefon
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        className="input-modern"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-industrial-gray mb-2">
                        Şirket
                      </label>
                      <input
                        name="company"
                        type="text"
                        className="input-modern"
                        placeholder="Şirket Adı"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-industrial-gray mb-2">
                      Konu *
                    </label>
                    <input
                      name="subject"
                      type="text"
                      required
                      className="input-modern"
                      placeholder="Mesajınızın konusu"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-industrial-gray mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="input-modern resize-none"
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-navy text-white px-6 py-3 font-semibold shadow-lg hover:bg-secondary-blue transition-all hover:scale-[1.02]"
                  >
                    <Send size={18} />
                    Gönder
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-64 sm:h-80 bg-gradient-to-br from-light-gray to-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-steel-gray mx-auto mb-2" />
            <p className="text-steel-gray">İstanbul, Türkiye</p>
            <p className="text-sm text-steel-gray/60">Harita için Google Maps API gerekli</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage



