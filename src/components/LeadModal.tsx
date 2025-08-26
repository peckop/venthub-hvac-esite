import React, { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

interface LeadModalProps {
  open: boolean
  onClose: () => void
  productName?: string
  productId?: string
}

const applicationAreas = [
  'Otopark Havalandırma',
  'Endüstriyel Mutfak',
  'Hastane/Temiz Oda',
  'AVM/Perakende',
  'Ofis/Plaza',
  'Depo/Üretim Tesisi',
  'Diğer'
]

const budgetRanges = ['Belirsiz', '≤ 50.000 ₺', '50.000–250.000 ₺', '250.000–1.000.000 ₺', '≥ 1.000.000 ₺']
const timeframes = ['Acil (0–2 hafta)', 'Kısa (≤ 1 ay)', 'Orta (1–3 ay)', 'Uzun (3+ ay)']

const LeadModal: React.FC<LeadModalProps> = ({ open, onClose, productName, productId }) => {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [quantity, setQuantity] = useState<string>('1')
  const [appArea, setAppArea] = useState('')
  const [budget, setBudget] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [contactPref, setContactPref] = useState<'email' | 'phone' | ''>('')
  const [contactTime, setContactTime] = useState('')
  const [consent, setConsent] = useState(false)
  const [message, setMessage] = useState(productName ? `${productName} için teknik teklif talep ediyorum.` : '')
  const [submitted, setSubmitted] = useState(false)
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

    // payload örneği (ileride API'ye post edilebilir)
    const _payload = {
      name,
      company,
      email,
      phone,
      city,
      quantity: Number(quantity) || 1,
      applicationArea: appArea,
      budget,
      timeframe,
      contactPreference: contactPref,
      contactTime,
      message,
      product: { id: productId, name: productName },
      pageUrl: window.location.href,
    }

    // Geçici çözüm: mailto ile e-posta istemcisini aç
    const receiver = 'recep.varlik@gmail.com'
    const subject = `${t('lead.title')} - ${productName || 'General'}`
    const lines = [
      `${t('lead.product')}: ${productName || '-'} (${productId || '-'})`,
      `${t('lead.name')}: ${name}`,
      `${t('lead.company')}: ${company || '-'}`,
      `${t('lead.email')}: ${email || '-'}`,
      `${t('lead.phone')}: ${phone || '-'}`,
      `${t('lead.city')}: ${city || '-'}`,
      `${t('lead.applicationArea')}: ${appArea || '-'}`,
      `${t('lead.quantity')}: ${quantity || '1'}`,
      `${t('lead.budgetRange')}: ${budget || '-'}`,
      `${t('lead.timeframe')}: ${timeframe || '-'}`,
      `${t('lead.contactPref')}: ${contactPref || '-'}`,
      `${t('lead.contactTime')}: ${contactTime || '-'}`,
      '',
      `${t('lead.message')}:`,
      message || '-',
      '',
      `Sayfa: ${window.location.href}`,
    ]
    const body = encodeURIComponent(lines.join('\n'))
    const mailto = `mailto:${receiver}?subject=${encodeURIComponent(subject)}&body=${body}`

    setSubmitted(true)
    // Yeni sekmeye açmayı deneyebiliriz; olmazsa mevcut sayfada
    try {
      window.location.href = mailto
    } catch {
      // yedek
      window.open(mailto, '_blank')
    }

    setTimeout(() => {
      onClose()
      setSubmitted(false)
      // reset
      setName(''); setCompany(''); setEmail(''); setPhone(''); setCity(''); setQuantity('1'); setAppArea(''); setBudget(''); setTimeframe(''); setContactPref(''); setContactTime(''); setConsent(false)
      setMessage(productName ? `${productName} için teknik teklif talep ediyorum.` : '')
      setErrors({})
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col mx-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-white z-10">
          <h3 id="lead-modal-title" className="text-lg sm:text-xl font-bold text-industrial-gray">{t('lead.title')}</h3>
          {productName && (
            <p className="text-sm text-steel-gray mt-1">{t('lead.product')}: <span className="font-medium text-industrial-gray">{productName}</span></p>
          )}
        </div>
        <form onSubmit={submit} className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* İletişim Bilgileri */}
          <div>
            <h4 className="text-industrial-gray font-semibold mb-3">{t('lead.contactInfo')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.name')}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full border ${errors.name ? 'border-red-400' : 'border-light-gray'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.company')}</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
              </div>
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
              </div>
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.phone')}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
              </div>
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.city')}</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
              </div>
            </div>
            {errors.contact && <p className="text-xs text-red-500 mt-2">{errors.contact}</p>}
          </div>

          {/* Proje/İhtiyaç Bilgileri */}
          <div>
            <h4 className="text-industrial-gray font-semibold mb-3">{t('lead.projectNeed')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.applicationArea')}</label>
                <select value={appArea} onChange={(e)=>setAppArea(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy">
                  <option value="">{t('lead.select')}</option>
                  {applicationAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.quantity')}</label>
                <input type="number" min={1} value={quantity} onChange={(e)=>setQuantity(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
              </div>
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.budgetRange')}</label>
                <select value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy">
                  <option value="">{t('lead.select')}</option>
                  {budgetRanges.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-steel-gray mb-1">{t('lead.timeframe')}</label>
                <select value={timeframe} onChange={(e)=>setTimeframe(e.target.value)} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy">
                  <option value="">{t('lead.select')}</option>
                  {timeframes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* İletişim Tercihi */}
          <div>
            <h4 className="text-industrial-gray font-semibold mb-3">{t('lead.contactPref')}</h4>
            <div className="flex flex-wrap gap-4 text-sm text-steel-gray">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="radio" name="contactPref" checked={contactPref==='email'} onChange={()=>setContactPref('email')} className="accent-primary-navy" />
                {t('lead.email')}
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="radio" name="contactPref" checked={contactPref==='phone'} onChange={()=>setContactPref('phone')} className="accent-primary-navy" />
                {t('lead.phone')}
              </label>
              <input
                placeholder={t('lead.contactTime')}
                value={contactTime}
                onChange={(e)=>setContactTime(e.target.value)}
                className="flex-1 min-w-[200px] border border-light-gray rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          {/* Mesaj */}
          <div>
            <h4 className="text-industrial-gray font-semibold mb-2">{t('lead.message')}</h4>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full border border-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy" />
          </div>

          {/* KVKK Onay */}
          <div className="flex items-start gap-2">
            <input id="consent" type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)} className="mt-1 accent-primary-navy" />
            <label htmlFor="consent" className="text-xs text-steel-gray">{t('lead.consent')}<a href="/legal/kvkk" className="text-primary-navy underline" target="_blank" rel="noopener">KVKK</a></label>
          </div>
          {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-light-gray text-steel-gray hover:bg-light-gray">{t('lead.cancel')}</button>
            <button type="submit" disabled={submitted} className="px-4 py-2 rounded-lg bg-primary-navy hover:bg-secondary-blue text-white disabled:opacity-60">
              {submitted ? t('lead.submitting') : t('lead.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeadModal
