import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const DistanceSalesAgreementContentTr: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Taraflar</h2>
        <p>
          İşbu sözleşme, <strong>{legalConfig.sellerTitle}</strong> (&quot;Satıcı&quot;) ile www.<strong>{legalConfig.websiteUrl}</strong> alan adlı internet sitesinden alışveriş yapan <strong>Tüketici</strong> arasında, Tüketicinin elektronik ortamda onay vermesi ile kurulmuştur.
        </p>
        <p className="text-sm mt-2">
          Satıcı Bilgileri — Adres: <strong>{legalConfig.sellerAddress}</strong> | Telefon: <strong>{legalConfig.sellerPhone}</strong> | E-posta: <strong>{legalConfig.sellerEmail}</strong> | KEP: <strong>{legalConfig.kepAddress}</strong><br />
          MERSİS No: <strong>{legalConfig.mersis}</strong> | Ticaret Sicil No: <strong>{legalConfig.tradeRegistryNo}</strong> | Kayıtlı Olduğu Oda: <strong>{legalConfig.chamberOfCommerce}</strong><br />
          Vergi Dairesi/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong> | ETBİS Kayıt No: <strong>{legalConfig.etbisNo}</strong>
        </p>
        <p className="text-sm mt-2">Tüketicinin adı-soyadı, teslimat/fatura adresi ve iletişim bilgileri, Tüketicinin sipariş sırasında beyan ettiği bilgilerdir ve sipariş özetinin ayrılmaz parçasıdır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Tanımlar</h2>
        <p>Site: Satıcının e-ticaret faaliyetlerini yürüttüğü www.{legalConfig.websiteUrl} adresli platformu; Ön Bilgilendirme Formu: Tüketiciye sözleşme kurulmadan önce sunulan bilgilendirme metnini; Sipariş Özeti: ürün, adet, vergiler dâhil toplam bedel ve teslimat bilgilerini içeren ekranı ifade eder.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Konu</h2>
        <p>İşbu sözleşmenin konusu, Tüketicinin Site üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı Sipariş Özetinde belirtilen ürün/hizmetin satışı ve teslimine ilişkin, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülükleridir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Sözleşmenin Kurulması ve Saklanması</h2>
        <p>Tüketici, Site&apos;de yer alan işbu sözleşmeyi ve <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.onBilgilendirme(), lang)}>Ön Bilgilendirme Formu</Link>&apos;nu okuyup onayladığını; siparişin ödeme onayı ile sözleşmenin kurulduğunu kabul eder. Sözleşme metni Satıcı nezdinde saklanır ve Tüketici hesabının sipariş detay sayfasından erişilebilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Ürün/Bedel ve Ödeme Koşulları</h2>
        <p>Ürün/hizmetin cinsi ve türü, miktarı, tüm vergiler dâhil satış fiyatı ve ödeme bilgileri Tüketici tarafından onaylanan Sipariş Özetinde yer almaktadır. Ödemeler kredi/banka kartı ile <strong>iyzico</strong> ödeme altyapısı üzerinden alınır; kart bilgileri Satıcı tarafından saklanmaz.</p>
        <p className="text-sm mt-2"><strong>Fiyat/stok hatası:</strong> sistem, dizgi veya besleme kaynaklı bariz maddi hata sonucu gerçek değerinden açıkça farklı bir fiyatın gösterilmesi ya da ürünün stokta bulunmaması hâlinde Satıcı, Tüketiciyi derhâl bilgilendirerek siparişi iptal edebilir ve tahsil edilmiş bedeli <strong>{legalConfig.refundTime}</strong> içinde eksiksiz iade eder. Bu hâlde Tüketicinin ek bir talep hakkı doğmaz.</p>
        <p className="text-sm mt-2">Fatura, Tüketicinin beyan ettiği fatura bilgilerine göre düzenlenir ve elektronik ortamda (e-arşiv/e-fatura) iletilebilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Teslimat</h2>
        <p>Teslimat adresi Tüketici tarafından belirtilen adrestir. Sipariş onayından itibaren <strong>{legalConfig.deliveryTime}</strong> içinde kargoya verilmesi öngörülür; teslimat her hâlükârda yasal azami <strong>30 gün</strong> içinde tamamlanır. Taşıyıcı: <strong>{legalConfig.cargoCompanies}</strong>.</p>
        <p className="mt-2">Satıcının bu süre içinde edimini yerine getirmemesi hâlinde Tüketici sözleşmeyi feshedebilir; fesih hâlinde tahsil edilen tüm ödemeler <strong>14 gün</strong> içinde iade edilir. Mücbir sebep veya Tüketiciden kaynaklanan nedenlerle gecikme hâlinde Satıcı, Tüketiciyi gecikmeden bilgilendirir.</p>
        <p className="text-sm mt-2">Tüketici, teslim sırasında paketi kontrol etmekle; hasar tespit etmesi hâlinde ürünü teslim almayarak taşıyıcıya tutanak tutturmakla yükümlüdür.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Cayma Hakkı</h2>
        <p>Tüketici, malın kendisine veya gösterdiği kişiye teslim edildiği (birden fazla parça hâlinde teslimde son parçanın teslim edildiği) tarihten itibaren <strong>14 gün</strong> içinde, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı, sözleşmenin kurulduğu tarih ile teslim tarihi arasında da kullanılabilir.</p>
        <p className="text-sm mt-2">Cayma hakkının kullanımına ilişkin örnek form, <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.onBilgilendirme(), lang)}>Ön Bilgilendirme Formu</Link> §10&apos;da yer almaktadır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Cayma Hakkının Kullanımı, İade ve Masraflar</h2>
        <p>Cayma bildirimleri <strong>{legalConfig.sellerEmail}</strong> adresine iletilebilir; bildirimin süresi içinde gönderilmiş olması yeterlidir. Ürün, faturası ve tüm aksesuarlarıyla birlikte, kullanılmamış ve yeniden satılabilir durumda, bildirimden itibaren <strong>10 gün</strong> içinde <strong>{legalConfig.returnAddress}</strong> adresine gönderilmelidir.</p>
        <p className="mt-2">İade kargo masrafı: <strong>{legalConfig.returnShippingBearer}</strong>. İadenin anlaşmalı taşıyıcı (<strong>{legalConfig.cargoCompanies}</strong>) ile yapılması hâlinde Tüketici, Mesafeli Sözleşmeler Yönetmeliği m.12 uyarınca iade masrafından sorumlu tutulmaz.</p>
        <p className="mt-2">Ücret iadesi, cayma bildiriminin Satıcıya ulaşmasını takiben en geç <strong>{legalConfig.refundTime}</strong> içinde, teslimat masrafları dâhil olmak üzere ödemede kullanılan araca uygun şekilde yapılır.</p>
        <p className="text-sm mt-2">Tüketicinin, malın niteliğine ve işleyişine uygun kullanım dışındaki kullanımı sonucu üründe meydana gelen değer kaybından Tüketici sorumludur.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Cayma Hakkının İstisnaları</h2>
        <p>Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca; Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallar (projeye özel ölçüde üretilen hava kanalı, özel imalat damper/menfez, özel konfigürasyonlu fanlar), tesliminden sonra koruyucu unsurları açılmış ve iadesi hijyen açısından uygun olmayan mallar (açılmış filtreler), başka ürünlerle ayrılamayacak şekilde karışan mallar (uygulanmış izolasyon/sızdırmazlık malzemeleri) ve elektronik ortamda anında ifa edilen hizmetler bakımından cayma hakkı kullanılamaz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Ayıplı Mal, Garanti ve Satış Sonrası Hizmet</h2>
        <p>Ayıplı mal teslimi hâlinde Tüketici, 6502 sayılı Kanun m.11 kapsamındaki seçimlik haklarını (ücretsiz onarım, ayıpsız misli ile değişim, bedel indirimi, sözleşmeden dönme) kullanabilir.</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Garanti süresi: <strong>{legalConfig.warrantyPeriod}</strong> (üretici/ithalatçı garantisi saklıdır)</li>
          <li>Kullanım ömrü: <strong>{legalConfig.usefulLife}</strong></li>
          <li>Yetkili servis / satış sonrası hizmet: <strong>{legalConfig.afterSalesService}</strong></li>
        </ul>
        <p className="text-sm mt-2">Cihazların montaj, elektrik bağlantısı ve devreye alma işlemleri, üretici talimatlarına uygun şekilde yetkin kişilerce yapılmalıdır; usulüne aykırı montaj kaynaklı arızalar garanti kapsamı dışında kalabilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Mücbir Sebepler</h2>
        <p>Tarafların kontrolü dışında gelişen, önlenemeyen ve ifayı imkânsız kılan hâller (doğal afet, yangın, savaş, salgın, genel grev, altyapı kesintileri vb.) mücbir sebep sayılır. Mücbir sebep hâlinde tarafların yükümlülükleri, engel ortadan kalkana kadar askıya alınır; makul süre içinde ortadan kalkmazsa taraflar sözleşmeyi feshedebilir ve tahsil edilen bedel iade edilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Kişisel Verilerin Korunması</h2>
        <p>Sözleşmenin kurulması ve ifası kapsamında işlenen kişisel veriler hakkında ayrıntılı bilgi için <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>KVKK Aydınlatma Metni</Link>&apos;ni inceleyiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">13) Uyuşmazlıkların Çözümü</h2>
        <p>Tüketici, şikâyet ve itirazlarını, her takvim yılı başında Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar çerçevesinde, ikametgâhının veya işlemin yapıldığı yerin <strong>Tüketici Hakem Heyetine</strong> ya da <strong>Tüketici Mahkemesine</strong> iletebilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">14) Yürürlük</h2>
        <p>Tüketici, işbu sözleşmenin tüm koşullarını okuyup kabul ettiğini ve elektronik ortamda onayladığını kabul eder. Sözleşme, <strong>{legalConfig.lastUpdated}</strong> tarihli metin esas alınarak, siparişin ödeme onayı ile yürürlüğe girer.</p>
      </section>
    </>
  )
}
