import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const FAQPage: React.FC = () => {
  const faqs = [
    { q: 'Siparişim ne zaman kargoya verilir?', a: 'Genellikle ödeme onayından itibaren 1-5 iş günü içinde kargoya verilir.' },
    { q: 'Ödeme yöntemleri nelerdir?', a: 'Kredi/Banka kartıyla iyzico altyapısı üzerinden güvenli ödeme yapabilirsiniz.' },
    { q: 'Kurulum hizmeti sağlıyor musunuz?', a: 'Ürün bazında değişebilir. Destek ekibimizle iletişime geçin.' },
  ]
  const navigate = useNavigate()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-steel-gray hover:text-primary-navy transition-colors text-sm">
          <ArrowLeft size={18} className="mr-1" /> Geri
        </button>
      </div>
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">Sıkça Sorulan Sorular</h1>
      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <details key={idx} className="bg-white rounded-xl border border-light-gray p-4">
            <summary className="cursor-pointer font-medium text-industrial-gray">{item.q}</summary>
            <p className="text-steel-gray mt-2">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

export default FAQPage

