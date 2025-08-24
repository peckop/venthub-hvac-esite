import React from 'react'
import legalConfig from '../../config/legal'

const PreInformationPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">Ön Bilgilendirme Formu (Taslak)</h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        Bu metin taslaktır ve test amaçlıdır. Canlıya çıkmadan önce şirketinizin gerçek bilgileri ile güncelleyiniz ve bir hukukçudan teyit alınız.
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 text-steel-gray space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Satıcı Bilgileri</h2>
          <p>
            Ünvan: <strong>{legalConfig.sellerTitle}</strong><br />
            Adres: <strong>{legalConfig.sellerAddress}</strong><br />
            E-posta: <strong>{legalConfig.sellerEmail}</strong> | Telefon: <strong>{legalConfig.sellerPhone}</strong><br />
            Vergi Dairesi/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Ürün/Hizmet Bilgileri</h2>
          <p>Ürün/hizmetin temel nitelikleri, satış fiyatı, vergiler dâhil toplam bedeli ve kargo masrafı sipariş özeti sayfasında ve ödeme adımında açıkça gösterilmektedir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Ödeme ve Teslimat</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ödeme Yöntemleri: Kredi/Banka kartı (iyzico altyapısı)</li>
            <li>Teslimat Süresi: <strong>{legalConfig.deliveryTime}</strong></li>
            <li>Kargo Ücreti: <strong>{legalConfig.shippingFee}</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Cayma Hakkı</h2>
          <p>Tüketici, teslimattan itibaren 14 gün içinde cayma hakkına sahiptir. Cayma hakkının istisnaları Mesafeli Sözleşmeler Yönetmeliği m.15'te sayılmıştır.</p>
          <p className="mt-2">Cayma bildirimi ve iade adresi: <strong>{legalConfig.sellerEmail}</strong> | <strong>{legalConfig.returnAddress}</strong></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Şikâyet ve Başvuru</h2>
          <p>Şikâyet ve başvurularınızı <strong>{legalConfig.sellerEmail}</strong> üzerinden Satıcıya iletebilir; ayrıca Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine başvurabilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Yürürlük</h2>
          <p>Bu Ön Bilgilendirme Formu <strong>{legalConfig.lastUpdated}</strong> tarihinde Tüketiciye sunulmuştur.</p>
        </section>
      </div>

      <p className="text-xs text-steel-gray mt-4">Bu metin hukuki danışmanlık niteliği taşımaz. Nihai metin için uzman görüşü almanız tavsiye edilir.</p>
    </div>
  )
}

export default PreInformationPage

