import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const KvkkContentTr: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Veri Sorumlusunun Kimliği</h2>
        <p>
          Veri Sorumlusu: <strong>{legalConfig.sellerTitle}</strong> (&quot;Şirket&quot;)<br />
          Adres: <strong>{legalConfig.sellerAddress}</strong><br />
          Telefon: <strong>{legalConfig.sellerPhone}</strong> | E-posta: <strong>{legalConfig.sellerEmail}</strong> | KEP: <strong>{legalConfig.kepAddress}</strong><br />
          MERSİS: <strong>{legalConfig.mersis}</strong> | Vergi Dairesi/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong><br />
          VERBİS Kayıt No: <strong>{legalConfig.verbisNo}</strong>
        </p>
        <p className="text-sm mt-2">Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) m.10 kapsamındaki aydınlatma yükümlülüğünü yerine getirmek üzere hazırlanmıştır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) İşlenen Kişisel Veri Kategorileri</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Kimlik: Ad-soyad, (fatura tipi bireysel ise) T.C. kimlik numarası; kurumsal faturada yetkili adı</li>
          <li>İletişim: E-posta, telefon, teslimat ve fatura adresi</li>
          <li>Müşteri İşlem: Sipariş numarası, sipariş içeriği, iade/talep kayıtları, işlem geçmişi</li>
          <li>Finans: Ödeme tutarı, taksit bilgisi, ödeme kuruluşundan dönen işlem sonuç verileri</li>
          <li>Çevrimiçi tanımlayıcılar ve işlem güvenliği: IP adresi, cihaz/tarayıcı bilgisi, oturum ve log kayıtları</li>
          <li>Pazarlama: İleti izinleri, izin kaynağı ve tarihi (verilmişse)</li>
        </ul>
        <p className="text-xs mt-2">Kart bilgileriniz Şirket tarafından görülmez ve saklanmaz; ödeme kuruluşu (iyzico) tarafından kendi altyapısında işlenir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Verilerin Toplanma Yöntemi</h2>
        <p>Kişisel verileriniz; Site üzerinden üyelik ve sipariş formlarını doldurmanız, müşteri destek kanallarımızla (e-posta, telefon) iletişime geçmeniz, ödeme kuruluşu ve kargo firmalarından dönen bilgiler ile çerezler ve benzeri teknolojiler aracılığıyla, <strong>otomatik ve kısmen otomatik yollarla</strong> elektronik ortamda toplanmaktadır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) İşleme Amaçları ve Hukuki Sebepler</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Sözleşmenin kurulması ve ifası</strong> (m.5/2-c): Siparişin alınması, ödemenin tahsili, teslimat, iade ve cayma süreçlerinin yürütülmesi.</li>
          <li><strong>Hukuki yükümlülük</strong> (m.5/2-ç): Faturalandırma, muhasebe, vergi ve tüketici mevzuatından doğan saklama/bildirim yükümlülükleri.</li>
          <li><strong>Hakların tesisi, kullanılması ve korunması</strong> (m.5/2-e): İhtilaf yönetimi, alacak takibi, delil temini.</li>
          <li><strong>Meşru menfaat</strong> (m.5/2-f): Dolandırıcılık önleme, sistem ve işlem güvenliği, hizmet kalitesinin ölçülmesi ve geliştirilmesi.</li>
          <li><strong>Açık rıza</strong> (m.5/1): Ticari elektronik ileti gönderimi ve zorunlu olmayan çerezlerin kullanımı.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Aktarım Yapılan Taraflar</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ödeme kuruluşu ve finansal kurumlar: <strong>iyzico</strong> ve ilgili bankalar</li>
          <li>Lojistik/kargo hizmet sağlayıcıları: <strong>{legalConfig.cargoCompanies}</strong></li>
          <li>Barındırma, veritabanı, e-posta/SMS ve teknik altyapı sağlayıcıları</li>
          <li>Muhasebe, hukuk, denetim ve danışmanlık hizmet sağlayıcıları</li>
          <li>Talep hâlinde yetkili kamu kurum ve kuruluşları</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Yurt Dışına Aktarım</h2>
        <p>Barındırma ve teknik altyapı sağlayıcılarımızın bir kısmının sunucuları yurt dışında bulunabilir. Bu hâllerde aktarım, KVKK m.9 çerçevesinde; Kurul tarafından hakkında <strong>yeterlilik kararı</strong> bulunan ülkelere aktarım yoluyla veya yeterlilik kararı yoksa <strong>uygun güvencelerden biri</strong> (Kurul izniyle taahhütname, standart sözleşme, bağlayıcı şirket kuralları) sağlanarak ya da kanunda öngörülen <strong>arızi hâllerin</strong> varlığı hâlinde gerçekleştirilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Saklama Süreleri</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Sipariş ve faturalandırma kayıtları: <strong>{legalConfig.retentionOrders}</strong></li>
          <li>Müşteri destek yazışmaları: <strong>{legalConfig.retentionSupport}</strong></li>
          <li>Pazarlama izin ve kayıtları: <strong>{legalConfig.retentionMarketing}</strong></li>
          <li>Log ve güvenlik kayıtları: <strong>{legalConfig.retentionLogs}</strong></li>
        </ul>
        <p className="text-sm mt-2">Süre sonunda kişisel veriler silinir, yok edilir veya anonim hâle getirilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Ticari Elektronik İleti ve İYS</h2>
        <p>Kampanya, tanıtım ve bilgilendirme içerikli ticari elektronik iletiler yalnızca <strong>onayınız</strong> varsa gönderilir. Onaylarınız, 6563 sayılı Kanun uyarınca <strong>İleti Yönetim Sistemi (İYS)</strong>&apos;ne kaydedilir (Marka Kodu: <strong>{legalConfig.iysBrandCode}</strong>). Onayınızı dilediğiniz an, ücretsiz olarak ve gerekçe göstermeksizin geri alabilirsiniz: iletilerdeki ret bağlantısını kullanabilir, İYS üzerinden ret hakkınızı işleyebilir veya <strong>{legalConfig.sellerEmail}</strong> adresine bildirebilirsiniz. Sipariş onayı, kargo takibi gibi <strong>işlemsel bildirimler</strong> ticari ileti kapsamında olmadığından bu retten etkilenmez.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) İlgili Kişi Hakları (KVKK m.11)</h2>
        <p>Şirketimize başvurarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini, şartları oluşmuşsa silinmesini/yok edilmesini, düzeltme ve silme işlemlerinin aktarım yapılan üçüncü kişilere bildirilmesini isteme, münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme ve kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Başvuru Yöntemi</h2>
        <p>Taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ uyarınca; kimliğinizi tevsik edici bilgilerle birlikte <strong>{legalConfig.applicationEmail}</strong> adresine (sistemimizde kayıtlı e-posta adresinizden), <strong>{legalConfig.kepAddress}</strong> KEP adresimize veya <strong>{legalConfig.sellerAddress}</strong> adresine ıslak imzalı yazılı olarak iletebilirsiniz.</p>
        <p className="mt-2">Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılır; işlemin ayrıca bir maliyet gerektirmesi hâlinde Kurulca belirlenen tarifedeki ücret alınabilir. Başvurunuzun reddi veya cevapsız kalması hâlinde <strong>Kişisel Verileri Koruma Kurulu</strong>&apos;na şikâyette bulunabilirsiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Veri Güvenliği</h2>
        <p>Şirket, kişisel verilerin hukuka aykırı işlenmesini ve erişilmesini önlemek ile muhafazasını sağlamak amacıyla; yetkilendirme ve rol bazlı erişim kontrolü, satır düzeyinde veri izolasyonu, aktarım ve saklamada şifreleme, erişim kayıtlarının tutulması ve tedarikçi denetimi dâhil olmak üzere uygun teknik ve idari tedbirleri uygular.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Çerezler</h2>
        <p>Çerezler ve benzer teknolojiler hakkında ayrıntılı bilgi için <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.cerez(), lang)}>Çerez Politikası</Link> metnimizi inceleyiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">13) Yürürlük</h2>
        <p>Bu aydınlatma metni <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir. Metnin güncel hâli her zaman bu sayfada yayımlanır.</p>
      </section>
    </>
  )
}
