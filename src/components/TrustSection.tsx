import React from 'react'
import { ShieldCheck, CreditCard, RotateCcw } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: <ShieldCheck size={22} className="text-success-green" />,
    title: 'KVKK Uyumlu',
    desc: 'Kişisel veriler güvenle saklanır, yalnızca gerekli süreçlerde kullanılır.',
  },
  {
    icon: <CreditCard size={22} className="text-primary-navy" />,
    title: 'Güvenli Ödeme (iyzico)',
    desc: '3D Secure ve ileri dolandırıcılık önleme kontrolleri.',
  },
  {
    icon: <RotateCcw size={22} className="text-warning-orange" />,
    title: 'İade/Değişim Kolaylığı',
    desc: 'Şeffaf prosedür ve hızlı sonuç odaklı destek.',
  },
] as const

const TrustSection: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">Güven ve Uygunluk</h2>
          <p className="text-steel-gray mt-1">Altyapı, güvenlik ve süreçlerimiz şeffaf ve standartlara uygundur.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-light-gray bg-white p-5 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="font-semibold text-industrial-gray">{item.title}</div>
                  <div className="text-sm text-steel-gray mt-1">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustSection

