'use client'
import Link from 'next/link'
import React from 'react'

import { useCategories } from '../contexts/CategoryContext'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'
import { bilgiMerkeziListeHref } from '../utils/bilgiMerkezi'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '../utils/categoryHelpers'
import BuildTag from './BuildTag'

// ADDRESS/PHONE ikon sabitleri, adres+telefon satırlarıyla birlikte kaldırıldı
// (2026-08-28) — kullanılmayan sabit bırakmak lint'i kırardı.
const FOOTER_ICON_MAIL = 'M'
const WEEKDAY_HOURS = '09:00 - 18:00'
const SATURDAY_HOURS = '09:00 - 14:00'
/** Telif satırında marka adından sonra gelen cümle sonu (JSX'te çıplak metin `jsx-no-literals` kuralına takılır). */
const TELIF_CUMLE_SONU = '.'
/** Altbilgide gösterilecek en çok kök kategori (bugün 7 ürünlü kök var; 8. kök gelirse tavan bilinçli kararla artar). */
const FOOTER_KATEGORI_TAVANI = 8

const Footer: React.FC = () => {
  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()
  const { categories: globalCategories } = useCategories()
  // Karar 92: Bilgi Merkezi adresi dile göre; EN kapalıyken bağlantı basılmaz.
  const bilgiMerkeziHref = bilgiMerkeziListeHref(lang)

  // OPS-51: Sığınak 7. KÖK oldu (ürünlü kök sayısı 6 → 7). Eskiden burada `.slice(0, 8)` ve aşağıda İKİNCİ bir
  // `.slice(0, 6)` vardı (ilk depo işlemi, gerekçe yorumu YOK): kategoriler `level, name` sırasıyla geldiği için 7. kök
  // ("Sığınak…", S > K) altbilgiden SESSİZCE düşerdi. Tek tavan kaldı (8); tüm ürünlü kökler görünür.
  // Kapı: src/components/__tests__/FooterKategoriler.test.tsx (7 kök → 7 bağlantı).
  const mainCategories = React.useMemo(() => {
    return globalCategories.filter(c => !c.parent_id).slice(0, FOOTER_KATEGORI_TAVANI);
  }, [globalCategories]);

  return (
    <footer className="bg-industrial-gray text-white selection:bg-white/20 selection:text-white min-h-hvac-section">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href={Routes.home()} className="flex items-center space-x-3">
              <div className="bg-primary-navy p-2 rounded-lg">
                <div className="text-white font-bold text-lg">VH</div>
              </div>
              <div>
                <div className="text-xl font-bold">{t('header.brandName')}</div>
                <div className="text-xs text-gray-300">{t('header.brandTagline')}</div>
              </div>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            {/* Sosyal bağlantılar YOK (REC-285, OPS hükmü 2026-09-24): dördü de bizim hesabımıza
                değil platformların ana sayfasına gidiyordu (facebook.com, twitter.com, linkedin.com,
                instagram.com) — sahte bağlantı, hiç olmamasından kötü (vaat-butunlugu-standard).
                Gerçek hesap adresleri gelince sözlükten değil tek bir yapılandırmadan geri eklenir. */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={Routes.home()} className="text-gray-300 hover:text-white transition-colors">
                  {t('common.homeLabel')}
                </Link>
              </li>
              <li>
                <Link href={Routes.products()} className="text-gray-300 hover:text-white transition-colors">
                  {t('common.products')}
                </Link>
              </li>
              <li>
                <Link href={Routes.brands()} className="text-gray-300 hover:text-white transition-colors">
                  {t('common.brands')}
                </Link>
              </li>
              <li>
                <Link href={Routes.about()} className="text-gray-300 hover:text-white transition-colors">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link href={Routes.contact()} className="text-gray-300 hover:text-white transition-colors">
                  {t('common.contact')}
                </Link>
              </li>
              {bilgiMerkeziHref && (
                <li>
                  <Link href={bilgiMerkeziHref} className="text-gray-300 hover:text-white transition-colors">
                    {t('common.knowledgeHub')}
                  </Link>
                </li>
              )}
              <li>
                <Link href={Routes.destek.sss()} className="text-gray-300 hover:text-white transition-colors text-sm">
                  • {t('support.links.faq')}
                </Link>
              </li>
              <li>
                <Link href={Routes.destek.iadeDegisim()} className="text-gray-300 hover:text-white transition-colors text-sm">
                  • {t('support.links.returns')}
                </Link>
              </li>
              <li>
                <Link href={Routes.destek.teslimatKargo()} className="text-gray-300 hover:text-white transition-colors text-sm">
                  • {t('support.links.shipping')}
                </Link>
              </li>
              <li>
                <Link href={Routes.destek.garantiServis()} className="text-gray-300 hover:text-white transition-colors text-sm">
                  • {t('support.links.warranty')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-2">
              {mainCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={Routes.category(getLocalizedCategorySlug(category, lang))}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {getCategoryDisplayName(category, t)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              {/* Adres/telefon satırları şirket kuruluşuna kadar bilinçli YOK — uydurma
                  değer basılmaz (2026-08-28 taraması); gerçek bilgi gelince geri eklenir. */}
              <div className="flex items-center space-x-3">
                <span className="text-secondary-blue flex-shrink-0">{FOOTER_ICON_MAIL}</span>
                <span className="text-gray-300 text-sm">{t('footer.email')}</span>
              </div>
            </div>

            {/* Working Hours */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{t('footer.workingHours')}</h4>
              <p className="text-gray-300 text-xs">
                {t('footer.weekdays')}: {WEEKDAY_HOURS}<br />
                {t('footer.saturday')}: {SATURDAY_HOURS}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-steel-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
              {/* URN-83: şirket kurulmadı — telif satırı yasal unvan / "HVAC." eki taşımaz; ad giriş sayfasıyla AYNI sözlük
                  anahtarından gelir (`common.brandLegalName`), unvan kesinleşince tek yerden değişir. */}
              © {new Date().getFullYear()} {t('common.brandLegalName')}{TELIF_CUMLE_SONU} {t('footer.rights')}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center md:justify-end">
              {/* Build meta tag */}
              <BuildTag />
              <Link href={Routes.legal.kvkk()} className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.kvkk')}
              </Link>
              <Link href={Routes.legal.mesafeliSatis()} className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.distanceSales')}
              </Link>
              <Link href={Routes.legal.onBilgilendirme()} className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.preInformation')}
              </Link>
              <Link href={Routes.legal.cerez()} className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.cookies')}
              </Link>
              <Link href={Routes.legal.gizlilik()} className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.privacy')}
              </Link>
              <Link href={Routes.legal.kullanimKosullari()} className="text-gray-300 hover:text-white transition-colors">
                {t('legalLinks.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
