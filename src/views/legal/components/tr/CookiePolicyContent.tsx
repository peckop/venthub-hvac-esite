import Link from 'next/link'
import React from 'react'

import CookiePreferencesButton from '@/components/consent/CookiePreferencesButton'
import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const CookiePolicyContentTr: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Çerez Nedir?</h2>
        <p>Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza veya cihazınıza yerleştirilen küçük metin dosyalarıdır. Sitenin temel işlevlerini sağlamak, tercihlerinizi hatırlamak ve güvenliği korumak için kullanılırlar. Bu Politika, çerezlerin yanı sıra tarayıcı yerel depolaması (localStorage) gibi benzer teknolojileri de kapsar.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Kullandığımız Çerezler</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-light-gray">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border-b border-light-gray">Tanımlayıcı</th>
                <th className="text-left p-2 border-b border-light-gray">Amaç</th>
                <th className="text-left p-2 border-b border-light-gray">Tür</th>
                <th className="text-left p-2 border-b border-light-gray">Süre</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-light-gray">Oturum çerezleri (<code>sb-*-auth-token</code>)</td>
                <td className="p-2 border-b border-light-gray">Üye girişinin sürdürülmesi, oturum yenileme</td>
                <td className="p-2 border-b border-light-gray">Zorunlu</td>
                <td className="p-2 border-b border-light-gray">Oturum süresi</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-light-gray">Yetki/kiracı çerezleri</td>
                <td className="p-2 border-b border-light-gray">Erişim yetkisinin ve ilgili mağaza kaydının doğrulanması</td>
                <td className="p-2 border-b border-light-gray">Zorunlu</td>
                <td className="p-2 border-b border-light-gray">Oturum süresi</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-light-gray"><code>NEXT_LOCALE</code></td>
                <td className="p-2 border-b border-light-gray">Seçtiğiniz dilin hatırlanması</td>
                <td className="p-2 border-b border-light-gray">İşlevsel</td>
                <td className="p-2 border-b border-light-gray">1 yıl</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-light-gray"><code>vh_consent</code> (localStorage)</td>
                <td className="p-2 border-b border-light-gray">Kategori bazlı çerez tercihinizin, karar tarihinin ve onayladığınız metin sürümünün saklanması</td>
                <td className="p-2 border-b border-light-gray">İşlevsel</td>
                <td className="p-2 border-b border-light-gray">Siz silene kadar</td>
              </tr>
              <tr>
                <td className="p-2">Sepet ve tercih verileri (localStorage)</td>
                <td className="p-2">Sepet içeriğinin ve görüntüleme tercihlerinin korunması</td>
                <td className="p-2">İşlevsel</td>
                <td className="p-2">Siz silene kadar</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm mt-3"><strong>Analitik ve pazarlama çerezleri:</strong> Site hâlihazırda analitik, reklam veya profilleme amaçlı çerez <strong>kullanmamaktadır</strong>. Bu tür çerezler ileride devreye alınırsa yalnızca <strong>açık rızanızla</strong> çalışır ve bu tablo güncellenir. Rıza vermediğiniz kategoriye ait etiket/script sayfaya <strong>hiç yüklenmez</strong> — yalnızca olay gönderimi değil, çerezi yazan kodun kendisi engellenir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Hukuki Dayanak ve Rıza</h2>
        <p>Sitenin çalışması için <strong>zorunlu</strong> olan çerezler, talep ettiğiniz hizmetin sunulabilmesi amacıyla rızanız aranmaksızın kullanılır. <strong>Zorunlu olmayan</strong> çerezler (analitik, pazarlama, profilleme) ise yalnızca <strong>açık rızanızla</strong> kullanılır; rıza vermemeniz sitenin temel işlevlerinden yararlanmanıza engel olmaz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Üçüncü Taraf Hizmetleri</h2>
        <p>Ödeme adımında <strong>iyzico</strong> altyapısı kullanılır ve ödeme sayfasında iyzico&apos;nun kendi çerezleri devreye girebilir; bu çerezler iyzico&apos;nun kendi politikalarına tabidir. Barındırma ve veritabanı altyapısı sağlayıcılarımız, hizmetin sunulması ve güvenliği için teknik nitelikte tanımlayıcılar kullanabilir.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Tercihlerinizi Nasıl Yönetirsiniz?</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Site ilk ziyaretinizde gösterilen çerez bandından <strong>kategori bazlı</strong> seçim yapabilirsiniz: tümünü kabul, yalnızca zorunlu, veya &quot;Tercihleri Yönet&quot; ile işlevsel/analitik/pazarlama kategorilerini tek tek açıp kapatabilirsiniz.</li>
          <li><strong>Rızanızı dilediğiniz an geri alabilirsiniz</strong> — aşağıdaki düğme kaydınızı siler ve seçim ekranını yeniden açar. Geri alma, rıza vermek kadar kolaydır.</li>
          <li>Tarayıcı ayarlarından çerezleri tümüyle engelleyebilir veya silebilirsiniz. Zorunlu çerezlerin engellenmesi hâlinde üye girişi ve sepet gibi işlevler çalışmayabilir.</li>
        </ul>
        <div className="mt-4">
          <CookiePreferencesButton />
        </div>
        <p className="text-xs text-steel-gray mt-3">Rızanız, verdiğiniz tarih ve onayladığınız metin sürümüyle birlikte tarayıcınızda saklanır. Bu Politika esaslı olarak değişirse rızanız geçersizleşir ve size yeniden sorulur.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Kişisel Verilerinizle İlişkisi</h2>
        <p>Çerezler aracılığıyla işlenen veriler bakımından haklarınız ve başvuru yöntemi için <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>KVKK Aydınlatma Metni</Link>&apos;ni inceleyiniz.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) İletişim</h2>
        <p>Çerez politikamız hakkında sorularınız için: <strong>{legalConfig.sellerEmail}</strong></p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Yürürlük</h2>
        <p>Bu Çerez Politikası <strong>{legalConfig.lastUpdated}</strong> tarihinde güncellenmiştir.</p>
      </section>
    </>
  )
}
