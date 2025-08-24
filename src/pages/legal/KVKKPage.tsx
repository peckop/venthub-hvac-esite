import React from 'react'
import legalConfig from '../../config/legal'

const KVKKPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">KVKK Aydınlatma Metni (Taslak)</h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        Bu metin taslaktır ve test amaçlıdır. Canlıya çıkmadan önce şirketinizin gerçek bilgileri ile güncelleyiniz ve bir hukukçudan teyit alınız.
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 space-y-6 text-steel-gray">
        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Veri Sorumlusunun Kimliği</h2>
          <p>
            Veri Sorumlusu: <strong>{legalConfig.sellerTitle}</strong> ("Şirket")<br />
            Adres: <strong>{legalConfig.sellerAddress}</strong><br />
            E-posta: <strong>{legalConfig.sellerEmail}</strong> | Telefon: <strong>{legalConfig.sellerPhone}</strong><br />
            Vergi Dairesi/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong> | MERSİS: <strong>{legalConfig.mersis}</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) İşlenen Kişisel Veri Kategorileri</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Kimlik: Ad-Soyad, (fatura tipi bireysel ise) TCKN</li>
            <li>İletişim: E-posta, telefon, teslimat/fatura adresi</li>
            <li>Müşteri İşlem: Sipariş numarası, sipariş içeriği, işlem geçmişi</li>
            <li>Finans: Ödeme tutarı, taksit bilgisi, (ödeme sağlayıcıdan gelen) işlem sonuç verileri</li>
            <li>Çevrimiçi Tanımlayıcılar ve Log verileri: IP, cihaz/oturum bilgileri</li>
          </ul>
          <p className="text-xs mt-2">Not: Kart bilgileriniz Şirket tarafından tutulmaz; ödeme kuruluşu (iyzico) tarafından güvenli şekilde işlenir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepler</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sözleşmenin kurulması ve ifası (KVKK m.5/2-c): Siparişin alınması, ödemelerin alınması, teslimatın sağlanması.</li>
            <li>Hukuki yükümlülük (m.5/2-ç): Faturalandırma, muhasebe ve vergi mevzuatı.</li>
            <li>Hakların tesisi, kullanılması ve korunması (m.5/2-e): İhtilaf yönetimi, alacak takibi.</li>
            <li>Meşru menfaat (m.5/2-f): Dolandırıcılık önleme, sistem güvenliği, operasyonların geliştirilmesi.</li>
            <li>Açık rıza (m.5/1) gerekli haller: Pazarlama/ileti izinleri, ticari elektronik iletiler.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Aktarımlar ve Yurt Dışına Aktarım</h2>
          <p>Verileriniz aşağıdaki taraflarla paylaşılabilir:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ödeme kuruluşu ve finansal kurumlar: <strong>iyzico</strong> ve bankalar</li>
            <li>Lojistik/kargo hizmet sağlayıcıları</li>
            <li>Barındırma, veritabanı ve teknik altyapı sağlayıcıları (örn. bulut hizmetleri)</li>
            <li>Hukuk, denetim, danışmanlık hizmet sağlayıcıları</li>
          </ul>
          <p className="mt-2">Altyapı sağlayıcılarının bir kısmı yurt dışında bulunabilir. Bu hallerde, KVKK m.9 uyarınca yeterli korumanın bulunduğu ülkelere aktarım veya Kurul tarafından belirlenen taahhütname/mekanizmalarla aktarım gerçekleştirilecektir.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Saklama Süreleri</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sipariş ve faturalandırma kayıtları: <strong>{legalConfig.retentionOrders}</strong></li>
            <li>Müşteri destek yazışmaları: <strong>{legalConfig.retentionSupport}</strong></li>
            <li>Pazarlama izin ve kayıtları: <strong>{legalConfig.retentionMarketing}</strong></li>
            <li>Log ve güvenlik kayıtları: <strong>{legalConfig.retentionLogs}</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) İlgili Kişi Hakları (KVKK m.11)</h2>
          <p>Şirketimize başvurarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işleme amaçlarını, aktarıldığı üçüncü kişileri, eksik/yanlış işlendiyse düzeltilmesini, silinmesini/yok edilmesini, aktarıldığı üçüncü kişilere bildirilmesini, otomatik sistemlerle analiz sonucu aleyhinize bir sonucun oluşmasına itirazı talep etme ve zarara uğramanız hâlinde giderilmesini talep etme haklarına sahipsiniz.</p>
          <p className="mt-2">Başvurularınızı <strong>{legalConfig.applicationEmail}</strong> adresine e-posta ile veya <strong>{legalConfig.sellerAddress}</strong> fiziki adresine yazılı olarak iletebilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Çerezler</h2>
          <p>Çerezler ve benzer teknolojiler hakkında detaylı bilgi için <a className="text-primary-navy underline" href="/legal/cerez-politikasi">Çerez Politikası</a> metnimizi inceleyiniz.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Yürürlük</h2>
          <p>Bu aydınlatma metni <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir.</p>
        </section>
      </div>

      <p className="text-xs text-steel-gray mt-4">Bu metin hukuki danışmanlık niteliği taşımaz. Nihai metin için uzman görüşü almanız tavsiye edilir.</p>
    </div>
  )
}

export default KVKKPage

