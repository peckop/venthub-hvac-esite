import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const PreInformationContentTr: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Satıcı Bilgileri</h2>
        <p>
          Ünvan: <strong>{legalConfig.sellerTitle}</strong><br />
          Adres: <strong>{legalConfig.sellerAddress}</strong><br />
          Telefon: <strong>{legalConfig.sellerPhone}</strong> | E-posta: <strong>{legalConfig.sellerEmail}</strong><br />
          KEP Adresi: <strong>{legalConfig.kepAddress}</strong><br />
          MERSİS No: <strong>{legalConfig.mersis}</strong> | Ticaret Sicil No: <strong>{legalConfig.tradeRegistryNo}</strong><br />
          Kayıtlı Olduğu Oda: <strong>{legalConfig.chamberOfCommerce}</strong><br />
          Vergi Dairesi/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong><br />
          ETBİS Kayıt No: <strong>{legalConfig.etbisNo}</strong>
        </p>
        <p className="text-sm mt-2">Site: www.{legalConfig.websiteUrl}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Şikâyet ve Başvuru İçin İletişim</h2>
        <p>Sipariş, teslimat, iade ve her türlü talebinizi <strong>{legalConfig.sellerEmail}</strong> adresine veya <strong>{legalConfig.sellerPhone}</strong> numarasına iletebilirsiniz. Yazılı tebligat için KEP adresimiz: <strong>{legalConfig.kepAddress}</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Ürün/Hizmetin Temel Nitelikleri</h2>
        <p>Sipariş konusu ürünün markası, modeli, teknik özellikleri (debi, basınç, ses seviyesi, güç, bağlantı ölçüleri vb.), adedi ve varsa aksesuarları, ürün detay sayfasında ve onayladığınız sipariş özetinde gösterilir. Bu Form, ilgili sipariş özetiyle birlikte bir bütün oluşturur.</p>
        <p className="text-sm mt-2">Ürün görselleri tanıtım amaçlıdır; üretici kaynaklı revizyonlar nedeniyle görsel ile teslim edilen ürün arasında renk/detay farkı olabilir. Bağlayıcı olan, sipariş özetindeki marka-model-teknik veri bilgisidir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Toplam Bedel ve Ek Masraflar</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Tüm vergiler dâhil toplam satış bedeli sipariş özetinde ve ödeme adımında açıkça gösterilir.</li>
          <li>Kargo/teslimat ücreti: <strong>{legalConfig.shippingFee}</strong></li>
          <li>Gösterilen toplam bedel dışında Tüketiciden herhangi bir ek masraf talep edilmez.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Ödeme Yöntemi</h2>
        <p>Ödemeler, kredi/banka kartı ile <strong>iyzico</strong> ödeme altyapısı üzerinden alınır. Kart bilgileriniz Satıcı tarafından görülmez ve saklanmaz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Teslimat</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Teslim yeri: Tüketicinin sipariş sırasında bildirdiği adres.</li>
          <li>Öngörülen teslim süresi: <strong>{legalConfig.deliveryTime}</strong> (kargoya veriliş süresi).</li>
          <li>Teslimat, her hâlükârda siparişin Satıcıya ulaşmasından itibaren yasal azami <strong>30 gün</strong> içinde yapılır.</li>
          <li>Taşıyıcı: <strong>{legalConfig.cargoCompanies}</strong></li>
        </ul>
        <p className="text-sm mt-2">Ürünü teslim alırken paketi kontrol ediniz; hasarlı paketi kabul etmeyerek taşıyıcıya tutanak tutturunuz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Cayma Hakkı</h2>
        <p>Tüketici, malı teslim aldığı (birden fazla parça hâlinde teslimde son parçanın teslim edildiği) tarihten itibaren <strong>14 gün</strong> içinde, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı, sözleşmenin kurulduğu tarih ile teslim tarihi arasında da kullanılabilir.</p>
        <p className="mt-2">Cayma bildirimini aşağıdaki §10&apos;da yer alan örnek formu kullanarak veya açık bir beyanla <strong>{legalConfig.sellerEmail}</strong> adresine iletebilirsiniz. Bildirimin süresi içinde gönderilmiş olması yeterlidir.</p>
        <p className="mt-2">Cayma bildirimi ulaştıktan sonra ürün, faturası ve tüm aksesuarlarıyla birlikte, kullanılmamış ve yeniden satılabilir durumda <strong>{legalConfig.returnAddress}</strong> adresine <strong>10 gün</strong> içinde gönderilmelidir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) İade Masrafı ve Bedel İadesi</h2>
        <p>Cayma hakkının kullanılması hâlinde iade kargo masrafı: <strong>{legalConfig.returnShippingBearer}</strong>.</p>
        <p className="text-sm mt-2">Ürünü, yukarıda belirtilen anlaşmalı taşıyıcı (<strong>{legalConfig.cargoCompanies}</strong>) ile iade ettiğiniz takdirde, Mesafeli Sözleşmeler Yönetmeliği m.12 uyarınca iade masrafından sorumlu tutulmazsınız. Anlaşmalı taşıyıcı dışında bir firmayla gönderim yapmanız hâlinde aradaki fark tarafınıza ait olabilir.</p>
        <p className="mt-2">Cayma bildiriminin Satıcıya ulaşmasından itibaren <strong>{legalConfig.refundTime}</strong> içinde, teslimat masrafları da dâhil olmak üzere tahsil edilen tüm ödemeler, ödemede kullanılan araca uygun şekilde ve Tüketiciye ek bir masraf yüklenmeksizin iade edilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Cayma Hakkının Kullanılamayacağı Hâller</h2>
        <p>Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca, özellikle aşağıdaki ürünlerde cayma hakkı kullanılamaz:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallar — <em>projeye özel ölçüde üretilen hava kanalı, özel imalat damper/menfez, özel renk veya özel motor konfigürasyonuyla sipariş edilen fanlar</em> bu kapsamdadır.</li>
          <li>Tesliminden sonra ambalaj, bant, mühür gibi koruyucu unsurları açılmış olan ve iadesi sağlık/hijyen açısından uygun olmayan mallar — <em>açılmış filtre ve filtre kartuşları</em> bu kapsamdadır.</li>
          <li>Tesliminden sonra başka ürünlerle ayrılamayacak şekilde karışan mallar — <em>uygulanmış izolasyon ve sızdırmazlık malzemeleri</em> gibi.</li>
          <li>Elektronik ortamda anında ifa edilen hizmetler ve Tüketiciye anında teslim edilen gayrimaddi mallar.</li>
        </ul>
        <p className="text-sm mt-2">Kurulumu/montajı Satıcı veya yetkili servis tarafından yapılmış cihazlarda, cayma hâlinde ürünün sökülmesi ve kullanılmamış-yeniden satılabilir durumda iadesi gerekir; Tüketicinin ürünü niteliğine ve işleyişine uygun kullanım dışında kullanması sonucu oluşan değer kaybından Tüketici sorumludur.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Örnek Cayma Formu</h2>
        <p className="text-sm mb-2">(Bu formu yalnızca sözleşmeden caymak istediğinizde doldurup gönderiniz.)</p>
        <div className="bg-gray-50 border border-light-gray rounded-lg p-4 text-sm space-y-1">
          <p>Kime: <strong>{legalConfig.sellerTitle}</strong> — {legalConfig.sellerAddress} — {legalConfig.sellerEmail}</p>
          <p>Bu formla, aşağıdaki mallara ilişkin sözleşmeden caydığımı bildiririm:</p>
          <p>Sipariş tarihi / Teslim tarihi: ____________________</p>
          <p>Sipariş numarası: ____________________</p>
          <p>Ürün(ler): ____________________</p>
          <p>Tüketicinin adı-soyadı: ____________________</p>
          <p>Tüketicinin adresi: ____________________</p>
          <p>İade edilecek tutarın gönderileceği hesap/kart: ____________________</p>
          <p>Tüketicinin imzası (yalnızca kâğıt üzerinde gönderiliyorsa): ____________________</p>
          <p>Tarih: ____________________</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Garanti ve Satış Sonrası Hizmet</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Garanti süresi: <strong>{legalConfig.warrantyPeriod}</strong> (üretici/ithalatçı garantisi saklıdır).</li>
          <li>Bakanlıkça belirlenen kullanım ömrü: <strong>{legalConfig.usefulLife}</strong>.</li>
          <li>Yetkili servis / satış sonrası hizmet: <strong>{legalConfig.afterSalesService}</strong>.</li>
        </ul>
        <p className="text-sm mt-2">Ayıplı mal hâlinde 6502 sayılı Kanun m.11 kapsamındaki seçimlik haklarınız (ücretsiz onarım, ayıpsız misli ile değişim, bedel indirimi, sözleşmeden dönme) saklıdır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Uyuşmazlıkların Çözümü</h2>
        <p>Şikâyet ve itirazlarınızı, her takvim yılı başında Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar çerçevesinde, ikametgâhınızın veya işlemin yapıldığı yerin <strong>Tüketici Hakem Heyetine</strong> ya da <strong>Tüketici Mahkemesine</strong> iletebilirsiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">13) Sözleşmenin Saklanması</h2>
        <p>Onayladığınız Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi, siparişinize bağlı olarak Satıcı nezdinde saklanır; hesabınızın sipariş detay sayfasından erişebilir ve <strong>{legalConfig.sellerEmail}</strong> adresine talep göndererek bir kopyasını isteyebilirsiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">14) Kişisel Verileriniz</h2>
        <p>Sipariş sürecinde işlenen kişisel verileriniz hakkında ayrıntılı bilgi için <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>KVKK Aydınlatma Metni</Link> ve <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.gizlilik(), lang)}>Gizlilik Politikası</Link> metinlerimizi inceleyiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">15) Yürürlük</h2>
        <p>Bu Ön Bilgilendirme Formu <strong>{legalConfig.lastUpdated}</strong> tarihli olup, siparişinizin onaylanmasından önce Tüketiciye sunulmuştur. Tüketici, bu Formu okuyup bilgi sahibi olduğunu elektronik ortamda teyit eder.</p>
      </section>
    </>
  )
}
