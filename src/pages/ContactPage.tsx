import React from 'react'

const ContactPage: React.FC = () => {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-industrial-gray">İletişim</h1>
          <p className="text-steel-gray mt-2 max-w-2xl mx-auto">
            Projeniz veya ürünlerle ilgili sorularınız için bize ulaşın. En kısa sürede dönüş yaparız.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-light-gray p-6 bg-white">
            <h2 className="font-semibold text-industrial-gray mb-2">Adres</h2>
            <p className="text-steel-gray text-sm leading-relaxed">
              Teknokent Mah. Teknopark Blv.<br />
              No: 1/4A 34906 Pendik/İstanbul
            </p>
          </div>
          <div className="rounded-xl border border-light-gray p-6 bg-white">
            <h2 className="font-semibold text-industrial-gray mb-2">Telefon</h2>
            <p className="text-steel-gray text-sm">+90 (216) 123-45-67</p>
          </div>
          <div className="rounded-xl border border-light-gray p-6 bg-white">
            <h2 className="font-semibold text-industrial-gray mb-2">E‑posta</h2>
            <p className="text-steel-gray text-sm">info@venthub.com.tr</p>
          </div>
        </div>

        <div className="rounded-xl border border-light-gray p-6 bg-gradient-to-br from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">Teklif/İletişim Formu</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-light-gray rounded-lg p-3" placeholder="Ad Soyad" />
            <input className="border border-light-gray rounded-lg p-3" placeholder="E‑posta" type="email" />
            <input className="border border-light-gray rounded-lg p-3 md:col-span-2" placeholder="Konu" />
            <textarea className="border border-light-gray rounded-lg p-3 md:col-span-2" rows={5} placeholder="Mesajınız / Proje bilgileri" />
            <div className="md:col-span-2">
              <button type="button" className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition">
                Gönder
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
