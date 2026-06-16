import React from 'react'

import legalConfig from '@/config/legal'

export const TermsOfUseContentTr: React.FC<{ lang: string }> = () => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Taraflar ve Kabul</h2>
        <p>www.{legalConfig.websiteUrl} sitesini kullanarak bu koşulları kabul etmiş sayılırsınız.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Hizmet Kapsamı</h2>
        <p>Site üzerinden ürün bilgileri, sipariş işlemleri ve müşteri destek hizmetleri sunulur. Satış işlemleri Mesafeli Satış Sözleşmesi hükümlerine tabidir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Fikri Mülkiyet</h2>
        <p>Sitedeki tüm içerikler (metin, görsel, tasarım vb.) {legalConfig.sellerTitle} veya lisans verenlerine aittir; izinsiz kopyalanamaz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Yasaklı Kullanım</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Hukuka aykırı içerik paylaşımı veya güvenliği tehlikeye atacak eylemler</li>
          <li>Veri kazıma (scraping) ve yetkisiz otomasyon</li>
          <li>Spam ve kötüye kullanım</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Sorumluluk Reddi</h2>
        <p>Site "olduğu gibi" sunulur. Dolaylı/sonuçsal zararlardan {legalConfig.sellerTitle} sorumlu tutulamaz; zorunlu haller saklıdır.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Uyuşmazlık Çözümü</h2>
        <p>Uyuşmazlıklarda Türk hukuku uygulanır; yetkili merciler Tüketici Hakem Heyetleri/Tüketici Mahkemeleri veya genel mahkemelerdir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Değişiklikler</h2>
        <p>Bu koşullar <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir. Siteyi kullanmaya devam ederek değişiklikleri kabul etmiş sayılırsınız.</p>
      </section>
    </>
  )
}
