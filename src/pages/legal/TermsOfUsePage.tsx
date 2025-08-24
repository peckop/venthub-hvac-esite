import React from 'react'
import legalConfig from '../../config/legal'

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">Kullanım Koşulları (Taslak)</h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        Bu metin taslaktır ve test amaçlıdır. Canlıya çıkmadan önce şirketinizin gerçek bilgileri ile güncelleyiniz ve bir hukukçudan teyit alınız.
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 text-steel-gray space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Taraflar ve Kabul</h2>
          <p>www.{legalConfig.websiteUrl} sitesini kullanarak bu koşulları kabul etmiş sayılırsınız.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Hizmet Kapsamı</h2>
          <p>Site üzerinden ürün bilgileri, sipariş işlemleri ve müşteri destek hizmetleri sunulur. Satış işlemleri Mesafeli Satış Sözleşmesi hükümlerine tabidir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Fikri Mülkiyet</h2>
          <p>Sitedeki tüm içerikler (metin, görsel, tasarım vb.) {legalConfig.sellerTitle} veya lisans verenlerine aittir; izinsiz kopyalanamaz.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Yasaklı Kullanım</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hukuka aykırı içerik paylaşımı veya güvenliği tehlikeye atacak eylemler</li>
            <li>Veri kazıma (scraping) ve yetkisiz otomasyon</li>
            <li>Spam ve kötüye kullanım</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Sorumluluk Reddi</h2>
          <p>Site "olduğu gibi" sunulur. Dolaylı/sonuçsal zararlardan {legalConfig.sellerTitle} sorumlu tutulamaz; zorunlu haller saklıdır.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Uyuşmazlık Çözümü</h2>
          <p>Uyuşmazlıklarda Türk hukuku uygulanır; yetkili merciler Tüketici Hakem Heyetleri/Tüketici Mahkemeleri veya genel mahkemelerdir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Değişiklikler</h2>
          <p>Bu koşullar <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir. Siteyi kullanmaya devam ederek değişiklikleri kabul etmiş sayılırsınız.</p>
        </section>
      </div>
    </div>
  )
}

export default TermsOfUsePage

