import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const TermsOfUseContentTr: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Hizmet Sağlayıcı ve Kabul</h2>
        <p>www.{legalConfig.websiteUrl} sitesi <strong>{legalConfig.sellerTitle}</strong> tarafından işletilmektedir. Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.</p>
        <p className="text-sm mt-2">
          Adres: <strong>{legalConfig.sellerAddress}</strong> | E-posta: <strong>{legalConfig.sellerEmail}</strong> | Telefon: <strong>{legalConfig.sellerPhone}</strong><br />
          MERSİS: <strong>{legalConfig.mersis}</strong> | Ticaret Sicil No: <strong>{legalConfig.tradeRegistryNo}</strong> | ETBİS Kayıt No: <strong>{legalConfig.etbisNo}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Hizmet Kapsamı</h2>
        <p>Site üzerinden ürün bilgileri, teknik hesaplama araçları, sipariş işlemleri ve müşteri destek hizmetleri sunulur. Satış işlemleri <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.mesafeliSatis(), lang)}>Mesafeli Satış Sözleşmesi</Link> ve <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.onBilgilendirme(), lang)}>Ön Bilgilendirme Formu</Link> hükümlerine tabidir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Üyelik ve Hesap Güvenliği</h2>
        <p>Üyelik sırasında verdiğiniz bilgilerin doğru ve güncel olmasından siz sorumlusunuz. Hesap parolanızın gizliliğini korumak ve hesabınız üzerinden yapılan işlemlerden sorumlu olmak kullanıcıya aittir. Yetkisiz bir kullanım fark ettiğinizde derhâl <strong>{legalConfig.sellerEmail}</strong> adresine bildiriniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Ürün Bilgileri ve Teknik Araçlar</h2>
        <p>Ürün görselleri tanıtım amaçlıdır; üretici kaynaklı revizyonlar nedeniyle görsel ile teslim edilen ürün arasında renk/detay farkı bulunabilir. Bağlayıcı olan, sipariş özetindeki marka-model-teknik veri bilgisidir.</p>
        <p className="mt-2">Site&apos;de sunulan hesaplama araçları (debi, kanal, ısı geri kazanım vb.) <strong>ön boyutlandırma</strong> amaçlıdır; proje hesabı, uygulama uygunluğu ve mevzuata uyum sorumluluğu kullanıcıya/proje müellifine aittir. Kesin hesaplar için bir HVAC mühendisine danışınız.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Fiyat ve Stok</h2>
        <p>Fiyatlar ve stok bilgileri güncel tutulmaya çalışılır; ancak sistem veya besleme kaynaklı bariz maddi hata hâlinde Satıcı, siparişi iptal ederek tahsil edilmiş bedeli eksiksiz iade etme hakkını saklı tutar. Ayrıntı için Mesafeli Satış Sözleşmesi §5&apos;e bakınız.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Fikri Mülkiyet</h2>
        <p>Sitedeki tüm içerikler (metin, görsel, tasarım, yazılım, veri tabanı vb.) {legalConfig.sellerTitle} veya lisans verenlerine aittir; izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz veya türev çalışma üretiminde kullanılamaz. Ürün marka ve model adları ilgili hak sahiplerine aittir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Yasaklı Kullanım</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Hukuka aykırı içerik paylaşımı veya sistem güvenliğini tehlikeye atacak eylemler</li>
          <li>Veri kazıma (scraping), otomatik toplu erişim ve yetkisiz otomasyon</li>
          <li>Tersine mühendislik, güvenlik önlemlerini aşma girişimleri</li>
          <li>Spam, yanıltıcı içerik ve kötüye kullanım</li>
        </ul>
        <p className="text-sm mt-2">Bu koşulların ihlali hâlinde Şirket, hesabı geçici olarak askıya alabilir veya kapatabilir ve gerekli hukuki yollara başvurabilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Sorumluluk Reddi</h2>
        <p>Site &quot;olduğu gibi&quot; sunulur; kesintisiz veya hatasız çalışacağı taahhüt edilmez. Dolaylı ve sonuçsal zararlardan {legalConfig.sellerTitle} sorumlu tutulamaz. Tüketici mevzuatından doğan haklarınız ile Şirketin kast ve ağır ihmalinden doğan sorumluluğu saklıdır; bu bölüm söz konusu hakları sınırlandıracak şekilde yorumlanamaz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Kişisel Veriler</h2>
        <p>Kişisel verilerinizin işlenmesine ilişkin bilgi için <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>KVKK Aydınlatma Metni</Link> ve <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.gizlilik(), lang)}>Gizlilik Politikası</Link> metinlerimizi inceleyiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Uyuşmazlık Çözümü</h2>
        <p>Uyuşmazlıklarda Türk hukuku uygulanır. Tüketici sıfatına sahip kullanıcılar, ilan edilen parasal sınırlar çerçevesinde Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine başvurabilir; diğer hâllerde Satıcının merkezinin bulunduğu yer mahkemeleri ve icra daireleri yetkilidir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Değişiklikler</h2>
        <p>Bu koşullar <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir. Siteyi kullanmaya devam ederek güncel koşulları kabul etmiş sayılırsınız.</p>
      </section>
    </>
  )
}
