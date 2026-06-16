import React from 'react'

import legalConfig from '@/config/legal'

export const CookiePolicyContentTr: React.FC<{ lang: string }> = () => {
  return (
    <>
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
    </>
  )
}
