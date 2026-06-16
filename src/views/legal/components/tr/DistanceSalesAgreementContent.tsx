import React from 'react'

import legalConfig from '@/config/legal'

export const DistanceSalesAgreementContentTr: React.FC<{ lang: string }> = () => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Taraflar</h2>
        <p>
          İşbu sözleşme, <strong>{legalConfig.sellerTitle}</strong> ("Satıcı") ile www.<strong>{legalConfig.websiteUrl}</strong> alan adlı internet sitesinden alışveriş yapan <strong>Tüketici</strong> arasında, Tüketicinin elektronik ortamda onay vermesi ile kurulmuştur.
        </p>
        <p className="text-sm mt-2">
          Satıcı İletişim Bilgileri: Adres: <strong>{legalConfig.sellerAddress}</strong> | E-posta: <strong>{legalConfig.sellerEmail}</strong> | Telefon: <strong>{legalConfig.sellerPhone}</strong><br />
          Vergi Dairesi/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Tanımlar</h2>
        <p>Site: Satıcının e-ticaret faaliyetlerini yürüttüğü www.{legalConfig.websiteUrl} adresli platformu ifade eder.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Konu</h2>
        <p>İşbu sözleşmenin konusu, Tüketicinin Site üzerinden elektronik ortamda siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürün/hizmetin satışı ve teslimine ilişkin 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülükleridir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Sözleşmenin Kurulması</h2>
        <p>Tüketici, Site'de yer alan sözleşmeyi ve Ön Bilgilendirme Formu'nu okuyup onayladığını, siparişin ödeme onayı ile sözleşmenin kurulduğunu kabul eder.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Ürün/Bedel ve Ödeme Koşulları</h2>
        <p>Ürün/hizmetin cinsi ve türü, miktarı, tüm vergiler dâhil satış fiyatı ve ödeme bilgileri Tüketici tarafından onaylanan sipariş/ödeme sayfasında yer almaktadır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Teslimat</h2>
        <p>Teslimat adresi Tüketici tarafından belirtilen adrestir. Sipariş onayından itibaren <strong>{legalConfig.deliveryTime}</strong> içinde kargoya verilmesi öngörülür. Mücbir sebepler veya Tüketiciden kaynaklanan nedenlerle gecikme halinde Satıcı, Tüketiciyi bilgilendirir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Cayma Hakkı</h2>
        <p>Tüketici, malın tesliminden itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma hakkının istisnaları MSY m.15 kapsamındadır (ör. Tüketicinin istekleri doğrultusunda kişiselleştirilen ürünler, hızlı bozulan ürünler vb.).</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Cayma Hakkının Kullanımı ve İade</h2>
        <p>Cayma bildirimleri <strong>{legalConfig.sellerEmail}</strong> adresine iletilebilir. Ürün, faturası ve tüm aksesuarları ile birlikte, kullanılmamış ve yeniden satılabilir durumda <strong>{legalConfig.returnAddress}</strong> adresine gönderilmelidir. İade kargo firması: <strong>{legalConfig.cargoCompanies}</strong> (aksi belirtilmedikçe). Ücret iadesi, cayma bildiriminin ulaşmasını takiben en geç <strong>{legalConfig.refundTime}</strong> içinde yapılır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Ayıplı Mal ve Garanti</h2>
        <p>Ayıplı mal teslimi halinde Tüketici 6502 sayılı Kanun kapsamında seçimlik haklarını kullanabilir. Ürünler üretici/ithalatçı garantisi kapsamındaysa ilgili garanti şartları uygulanır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Mücbir Sebepler</h2>
        <p>Tarafların kontrolü dışında gelişen, önlenemeyen ve ifayı imkânsız kılan haller (doğal afet, yangın, savaş, salgın vb.) mücbir sebep sayılır. Mücbir sebep halinde tarafların yükümlülükleri askıya alınır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Uyuşmazlıkların Çözümü</h2>
        <p>Tüketici, şikâyet ve itirazlarını, Tüketicinin ikametgâhının bulunduğu yerdeki Tüketici Hakem Heyeti veya Tüketici Mahkemesine iletebilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Yürürlük</h2>
        <p>Tüketici, işbu sözleşmenin tüm koşullarını okuyup kabul ettiğini ve elektronik ortamda onayladığını kabul eder. Sözleşme <strong>{legalConfig.lastUpdated}</strong> tarihinde yürürlüğe girer.</p>
      </section>
    </>
  )
}
