import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const PrivacyPolicyContentTr: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Veri Sorumlusu</h2>
        <p>
          <strong>{legalConfig.sellerTitle}</strong><br />
          Adres: <strong>{legalConfig.sellerAddress}</strong><br />
          Telefon: <strong>{legalConfig.sellerPhone}</strong> | E-posta: <strong>{legalConfig.sellerEmail}</strong>
        </p>
        <p className="text-sm mt-2">Bu Politika, www.{legalConfig.websiteUrl} üzerinden sunulan hizmetlerde kişisel verilerin nasıl işlendiğini özetler. Kanuni aydınlatma yükümlülüğünün tam metni için <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>KVKK Aydınlatma Metni</Link>&apos;ni inceleyiniz; iki metin arasında farklılık olması hâlinde KVKK Aydınlatma Metni esas alınır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Toplanan Veriler</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Kimlik: Ad-soyad, (bireysel fatura için) T.C. kimlik numarası</li>
          <li>İletişim: E-posta, telefon, teslimat ve fatura adresleri</li>
          <li>Müşteri İşlem: Sipariş bilgileri, iade/talep kayıtları, işlem geçmişi</li>
          <li>Finans: Ödeme tutarı, taksit, işlem sonucu (kart bilgileri iyzico tarafından işlenir; Şirket bu bilgileri görmez ve saklamaz)</li>
          <li>Teknik: IP adresi, tarayıcı/cihaz bilgileri, oturum ve log kayıtları</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) İşleme Amaçları</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sözleşmenin kurulması ve ifası: Sipariş, ödeme, teslimat, iade ve cayma süreçleri</li>
          <li>Hukuki yükümlülükler: Faturalandırma, vergi ve muhasebe kayıtları</li>
          <li>Güvenlik: Dolandırıcılık önleme, hesap ve işlem güvenliği</li>
          <li>Müşteri destek süreçlerinin yürütülmesi</li>
          <li>Açık rızaya dayalı pazarlama ve ileti gönderimi</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Paylaşımlar</h2>
        <p>Verileriniz; ödeme kuruluşu (iyzico) ve bankalar, lojistik/kargo sağlayıcıları (<strong>{legalConfig.cargoCompanies}</strong>), barındırma ve teknik altyapı sağlayıcıları, e-posta/SMS gönderim sağlayıcıları, muhasebe ve hukuk danışmanları ile talep hâlinde yetkili kamu kurumlarıyla, yalnızca ilgili amaçla sınırlı olarak paylaşılır. Verileriniz hiçbir şekilde pazarlama amacıyla üçüncü kişilere <strong>satılmaz</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Yurt Dışına Aktarım</h2>
        <p>Teknik altyapı sağlayıcılarımızın sunucuları yurt dışında bulunabilir. Bu aktarımlar KVKK m.9 kapsamında; yeterlilik kararı, uygun güvenceler (standart sözleşme, taahhütname, bağlayıcı şirket kuralları) veya kanunda öngörülen arızi hâller çerçevesinde gerçekleştirilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Çerezler</h2>
        <p>Kullanılan çerez türleri, süreleri ve rızanızı yönetme yöntemleri için <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.cerez(), lang)}>Çerez Politikası</Link> sayfasını inceleyiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Saklama Süreleri</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sipariş ve faturalandırma: <strong>{legalConfig.retentionOrders}</strong></li>
          <li>Destek yazışmaları: <strong>{legalConfig.retentionSupport}</strong></li>
          <li>Pazarlama izin/verileri: <strong>{legalConfig.retentionMarketing}</strong></li>
          <li>Log ve güvenlik kayıtları: <strong>{legalConfig.retentionLogs}</strong></li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Veri Güvenliği</h2>
        <p>Rol bazlı erişim kontrolü, satır düzeyinde veri izolasyonu, aktarım ve saklamada şifreleme, erişim kayıtlarının tutulması ve düzenli tedarikçi denetimi dâhil uygun teknik ve idari tedbirler uygulanır. Hesabınızın güvenliği için güçlü ve size özel bir parola kullanmanızı öneririz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Çocukların Verileri</h2>
        <p>Site, 18 yaşından küçüklere yönelik değildir ve bilerek çocuklardan kişisel veri toplamaz. Bir çocuğa ait verinin işlendiğini fark etmemiz veya bize bildirilmesi hâlinde ilgili veri gecikmeksizin silinir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Haklarınız</h2>
        <p>KVKK m.11 kapsamındaki haklarınızı kullanmak için <strong>{legalConfig.applicationEmail}</strong> adresine başvurabilirsiniz. Başvuru usulünün ayrıntısı <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>KVKK Aydınlatma Metni</Link> §10&apos;da yer alır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Güncellemeler</h2>
        <p>Bu Gizlilik Politikası <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir. Politikada esaslı bir değişiklik yapılması hâlinde Site üzerinden bilgilendirme yapılır.</p>
      </section>
    </>
  )
}
