import React from 'react'
import legalConfig from '../../config/legal'

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">Çerez Politikası (Taslak)</h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        Bu metin taslaktır ve test amaçlıdır. Canlıya çıkmadan önce şirketinizin gerçek bilgileri ile güncelleyiniz ve bir hukukçudan teyit alınız.
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 text-steel-gray space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Çerez Nedir?</h2>
          <p>Çerezler, web siteleri tarafından tarayıcınıza veya cihazınıza yerleştirilen küçük metin dosyalarıdır. Ziyaret deneyiminizi iyileştirmek, temel işlevleri sağlamak ve analiz yapmak için kullanılır.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Kullanılan Çerez Türleri</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Zorunlu Çerezler: Site temel işlevleri için gereklidir.</li>
            <li>Analitik/Performans Çerezleri: Site kullanımı ve performansı ölçmek için.</li>
            <li>İşlevsel Çerezler: Tercihlerinizi hatırlamak için.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Üçüncü Taraf Çerezleri</h2>
          <p>Site, üçüncü taraf hizmet sağlayıcıların çerezlerini kullanabilir. Bu çerezlerin yönetimi ilgili üçüncü tarafların politikalarına tabidir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p>Tarayıcı ayarları üzerinden çerezleri yönetebilir veya silebilirsiniz. Çerezlerin devre dışı bırakılması hâlinde sitenin bazı işlevleri kısıtlanabilir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) İletişim</h2>
          <p>Çerez politikamız hakkında sorular için: <strong>{legalConfig.sellerEmail}</strong></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Yürürlük</h2>
          <p>Bu Çerez Politikası <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir.</p>
        </section>
      </div>
    </div>
  )
}

export default CookiePolicyPage

