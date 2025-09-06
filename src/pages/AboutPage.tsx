import React from 'react'
import { Link } from 'react-router-dom'

const AboutPage: React.FC = () => {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-industrial-gray">VentHub Hakkında</h1>
          <p className="text-steel-gray mt-2 max-w-2xl mx-auto">
            Premium HVAC çözümlerinde güvenilir iş ortağınız. Kurumsal tedarik, mühendislik destekli seçim ve
            hızlı teklif süreçleriyle yanınızdayız.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-light-gray p-6 bg-white text-center">
            <div className="text-3xl font-bold text-primary-navy">6+</div>
            <div className="text-sm text-steel-gray">Premium Marka</div>
          </div>
          <div className="rounded-xl border border-light-gray p-6 bg-white text-center">
            <div className="text-3xl font-bold text-primary-navy">50+</div>
            <div className="text-sm text-steel-gray">Ürün Çeşidi</div>
          </div>
          <div className="rounded-xl border border-light-gray p-6 bg-white text-center">
            <div className="text-3xl font-bold text-primary-navy">15+</div>
            <div className="text-sm text-steel-gray">Yıl Deneyim</div>
          </div>
        </div>

        <div className="rounded-xl border border-light-gray p-6 bg-gradient-to-br from-gray-50 to-white mb-8">
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">Neden VentHub?</h2>
          <ul className="list-disc list-inside text-steel-gray space-y-1">
            <li>Mühendislik odaklı seçim desteği ve doğru ürün yönlendirmesi</li>
            <li>Stok, teslimat ve satış sonrası süreçlerde şeffaf iletişim</li>
            <li>KVKK/iyzico uyumlu, güvenli ödeme ve veri koruması</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition"
          >
            Ürünleri keşfet
          </Link>
          <Link
            to="/support/sss#teklif"
            className="inline-flex items-center justify-center rounded-lg border border-primary-navy text-primary-navy px-5 py-2.5 font-semibold hover:bg-primary-navy hover:text-white transition"
          >
            Teklif Al
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AboutPage
