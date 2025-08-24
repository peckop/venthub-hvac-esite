import React from 'react'
import legalConfig from '../../config/legal'

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">Gizlilik Politikası (Taslak)</h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        Bu metin taslaktır ve test amaçlıdır. Canlıya çıkmadan önce şirketinizin gerçek bilgileri ile güncelleyiniz ve bir hukukçudan teyit alınız.
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 text-steel-gray space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Veri Sorumlusu</h2>
          <p>
            <strong>{legalConfig.sellerTitle}</strong><br />
            Adres: <strong>{legalConfig.sellerAddress}</strong><br />
            E-posta: <strong>{legalConfig.sellerEmail}</strong> | Telefon: <strong>{legalConfig.sellerPhone}</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Toplanan Veriler</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kimlik: Ad-Soyad, (bireysel fatura için) TCKN</li>
            <li>İletişim: E-posta, telefon, adresler</li>
            <li>Müşteri İşlem: Sipariş bilgileri, işlem geçmişi</li>
            <li>Finans: Ödeme tutarı, taksit, işlem sonucu (kart bilgileri iyzico tarafından işlenir)</li>
            <li>Teknik: IP, tarayıcı/cihaz bilgileri, oturum logları</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) İşleme Amaçları</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sözleşmenin kurulması ve ifası: Sipariş, ödeme, teslimat</li>
            <li>Hukuki yükümlülükler: Faturalandırma, vergi/muhasebe</li>
            <li>Güvenlik ve dolandırıcılık önleme</li>
            <li>Müşteri destek süreçleri</li>
            <li>Açık rıza ile pazarlama/ileti izinleri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Paylaşımlar</h2>
          <p>Ödeme kuruluşu (iyzico), bankalar, lojistik/kargo sağlayıcıları, barındırma ve teknik altyapı sağlayıcıları, destekleyici hizmet tedarikçileri ile paylaşım yapılabilir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Çerezler</h2>
          <p>Detaylar için <a className="text-primary-navy underline" href="/legal/cerez-politikasi">Çerez Politikası</a> sayfasını inceleyiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Saklama Süreleri</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sipariş ve faturalandırma: <strong>{legalConfig.retentionOrders}</strong></li>
            <li>Destek yazışmaları: <strong>{legalConfig.retentionSupport}</strong></li>
            <li>Pazarlama izin/verileri: <strong>{legalConfig.retentionMarketing}</strong></li>
            <li>Log ve güvenlik kayıtları: <strong>{legalConfig.retentionLogs}</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Haklarınız</h2>
          <p>KVKK m.11 kapsamındaki haklarınız için <strong>{legalConfig.applicationEmail}</strong> adresine başvurabilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Güncellemeler</h2>
          <p>Bu Gizlilik Politikası <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir.</p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage

