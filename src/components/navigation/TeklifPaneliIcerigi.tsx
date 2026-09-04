/**
 * Teklif panelinin İÇERİĞİ — tek kaynak (REC-129 Faz 1c düzeltmesi).
 *
 * ⚠`'use client'` DİREKTİFİ BİLEREK YOK — ve bu bir unutma değil:
 * Bu bileşen yalnız istemci bileşenlerinden (HeaderTeklifPaneli, MobilAltSekmeCubugu)
 * import edilir; Next.js'te istemci grafiğine giren modülün ayrıca direktif taşıması
 * gerekmez. Direktif konsaydı dosya bir "client entry" sayılır ve `kapat` gibi FONKSİYON
 * prop'ları "serileştirilebilir olmalı / Server Action gibi adlandır" kuralına takılırdı —
 * oysa burada kapatma geri-çağrısı tam olarak doğru arayüz. Sunucu bileşeninden import
 * EDİLMEMELİDİR (hook kullanıyor); tek girişi yukarıdaki iki istemci bileşenidir.
 *
 * ⭐NİÇİN AYRI BİLEŞEN OLDU (ölçüme dayanan sebep, kozmetik değil):
 * İlk hâlde panel yalnız header'daydı. Bayrak açık hâliyle GÖRÜNTÜLENDİĞİNDE ölçüldü ki
 * mobilde **aynı iş iki kez sunuluyordu**: header'daki "Teklif" bir panel açıyor, alt
 * çubuğun "Teklif" sekmesi ise doğrudan `/cart`'a gidiyordu — aynı ad, aynı iş, iki
 * farklı davranış. Tasarım (v13 / K5-K9) header'daki Teklif öğesini **masaüstü** kuralı
 * sayıyor; mobilde üstte yalnız logo + arama kalmalı.
 *
 * Düzeltme iki taraflı: header öğesi mobilde gizlendi, panel de alt çubuğun Teklif
 * sekmesinden açılır oldu. İçerik İKİ YERDE ÇİZİLDİĞİ için buraya taşındı —
 * kopyalansaydı ikisi zamanla ayrışırdı ve hiçbir kapı bunu görmezdi.
 *
 * ⭐KAPSAYICIYI BİLMEZ: masaüstünde açılır kutunun, mobilde alt yaprağın içine giriyor.
 * Konum/gölge/yuvarlaklık KAPSAYICININ işi; burası yalnız içeriği çizer. Bu ayrım
 * bilerek: aynı içeriğin iki farklı yüzeyde farklı çerçevesi olur.
 *
 * ÜÇ HÂL — üçü de tasarımda ayrı çizildi ve üçü de burada var:
 *  1. DOLU     — "Teklif listesi · N kalem", en fazla 3 satır, teklif talebi düğmesi, kısayollar.
 *  2. BOŞ      — "Teklif listesi boş / Ürünlerden ekleyin" + tek çıkış.
 *  3. GİRİŞSİZ — liste + talep düğmesi, ama hesaba bağlı kısayollar YOK; yerine giriş daveti.
 *
 * ⭐NİÇİN GİRİŞSİZDE "Tekliflerim / Projelerim / Favorilerim" GİZLİ:
 * Üçü de `/account/**` altına gider; girişsiz ziyaretçi tıklarsa giriş duvarına çarpar.
 * Görünen ama çalışmayan kapı, olmayan kapıdan kötüdür. (Tasarımın girişsiz bloğunda
 * kısayolların tekrar görünüp görünmediği METİN OLARAK BELİRSİZDİ; "ölü kapı açma"
 * ilkesine göre karar verildi ve karar burada YAZILI.)
 *
 * ⛔TASARIMDAKİ "[foto]" YOK — VE UYDURULMADI:
 * Ekran 12 her satırda ürün fotoğrafı gösteriyor. Ölçüldü: `image_url` kolonu DB'den
 * DROP edilmiş ve tipte de `Omit`'lenmiş (`src/types/db-rows.ts`, "DroppedLegacyProductColumns").
 * Yani bugün bu satırlar için fotoğraf KAYNAĞI yok. Sepet sayfası da bu yüzden fotoğraf
 * değil marka ikonu kullanıyor; aynı desen burada da kullanıldı.
 *
 * ⭐"TEKLİF İSTE" NİÇİN BURADA MEŞRU (geri-bildirim §36 ile çelişmiyor):
 * §36, mobil MENÜDEN "Teklif iste"yi kaldırdı çünkü orada NESNESİZDİ ("hangi ürün?").
 * Buradaki panel zaten teklif listesini gösteriyor; düğmenin nesnesi LİSTENİN KENDİSİ.
 */
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCartHook'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import QuoteRequestButton from '../quotes/QuoteRequestButton'

/** Panelde en fazla kaç kalem gösterilir — tasarım v13 ekran 12. */
export const GOSTERILEN_KALEM = 3

type Props = {
  /** Panel kapatma — bir bağlantıya gidilince kapsayıcı kapanmalı. */
  kapat: () => void
  /** Başlık öğesinin id'si; kapsayıcı `aria-labelledby` ile buna bağlanır. */
  baslikId: string
}

export default function TeklifPaneliIcerigi({ kapat, baslikId }: Props) {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  const { items, getCartCount } = useCart()
  const { user } = useAuth()

  // Sayı SUNUCUDA çizilmez: sepet istemci durumudur, sunucu HTML'ine yazılırsa
  // hidrasyon uyuşmazlığı olur (StickyHeader'daki `isMounted` deseninin aynısı).
  const [gomulu, setGomulu] = useState(false)
  useEffect(() => setGomulu(true), [])

  const sayi = gomulu ? getCartCount() : 0
  const gosterilen = gomulu ? items.slice(0, GOSTERILEN_KALEM) : []
  const bos = gomulu && sayi === 0

  const kisayol =
    'block rounded-lg px-3 py-2 min-h-11 text-sm text-industrial-gray ' +
    'hover:bg-light-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy'

  return (
    <>
      <h2 id={baslikId} className="mb-3 text-sm font-semibold text-primary-navy">
        {bos ? t('teklifPaneli.bosBaslik') : t('teklifPaneli.baslik').replace('{n}', String(sayi))}
      </h2>

      {bos ? (
        <>
          <p className="mb-3 text-sm text-steel-gray">{t('teklifPaneli.bosAciklama')}</p>
          <Link href={Routes.products()} onClick={kapat} className={kisayol}>
            {t('teklifPaneli.urunlereGit')}
          </Link>
        </>
      ) : (
        <>
          <ul className="mb-3 flex flex-col gap-2">
            {gosterilen.map((k) => (
              <li key={k.id} className="flex flex-col">
                <span className="text-sm text-industrial-gray">{k.product.name}</span>
                {/* Marka + SKU: fotoğraf kaynağı olmadığı için ayırt edici bilgi
                    bunlar (sepet sayfasıyla aynı desen). */}
                <span className="text-xs text-steel-gray">
                  {k.product.brand}
                  {k.product.sku ? ` · ${k.product.sku}` : ''}
                </span>
              </li>
            ))}
          </ul>

          {sayi > GOSTERILEN_KALEM && (
            <Link href={Routes.cart()} onClick={kapat} className={kisayol}>
              {t('teklifPaneli.tumListe').replace('{n}', String(sayi))}
            </Link>
          )}

          <div className="mb-3">
            <QuoteRequestButton
              source="cart"
              items={items.map((k) => ({
                productId: k.product.id,
                productName: k.product.name,
                qty: k.quantity,
              }))}
            />
          </div>
        </>
      )}

      <nav className="flex flex-col gap-1 border-t border-light-gray pt-3">
        {user ? (
          <>
            <Link href={Routes.account.quotes()} onClick={kapat} className={kisayol}>
              {t('teklifPaneli.tekliflerim')}
            </Link>
            <Link href={Routes.account.projects()} onClick={kapat} className={kisayol}>
              {t('teklifPaneli.projelerim')}
            </Link>
            <Link href={Routes.account.favorites()} onClick={kapat} className={kisayol}>
              {t('teklifPaneli.favorilerim')}
            </Link>
          </>
        ) : (
          // Girişsizde hesaba bağlı kısayol GÖSTERİLMEZ: görünen ama giriş duvarına
          // çarpan kapı, olmayan kapıdan kötüdür.
          <Link href={Routes.auth.login()} onClick={kapat} className={kisayol}>
            {t('teklifPaneli.girisDaveti')}
          </Link>
        )}
      </nav>
    </>
  )
}
