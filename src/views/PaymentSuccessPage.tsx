'use client'

import { AlertCircle, CheckCircle, Loader, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useCart } from '../hooks/useCartHook'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { SYSTEM_CURRENCY } from '../i18n/currency'
import { formatDateTime } from '../i18n/datetime'
import { formatCurrency } from '../i18n/format'
import { useI18n } from '../i18n/I18nProvider'
import { reportError } from '../lib/errorReporter'
import { doluMu } from '../utils/bosDegerKorumasi'

/** `belirsiz`: ödeme alınmış olabilir ama doğrulanamadı (inceleme ekranı "alındı" demez, "başarısız" da demez). */
type PaymentInfo = { conversationId?: string; token?: string; errorMessage?: string; belirsiz?: boolean }

/**
 * URL'den gelen kimlik metni ekrana YALNIZ güvenli biçimdeyse basılır (harf, rakam, tire, alt çizgi; en çok 64).
 * Adres elle yazılabildiği için "numaranız: <her şey>" biçiminde bir cümle de ekrana basılabilirdi (güvenlik
 * incelemesi 10-10, bulgu 5). Biçime uymayan değer yok sayılır; numara satırı çıkmaz.
 */
function guvenliKimlik(deger: string | null | undefined): string | undefined {
  return deger && /^[A-Za-z0-9_-]{1,64}$/.test(deger) ? deger : undefined
}

/**
 * Sipariş satırı ÖDENMİŞ mi? `iyzico-callback` başarıda tek yazımla `status='confirmed'` + `payment_status='paid'`
 * yazar (iki ayrı sözlük: yaşam döngüsü / ödeme). Biri yeter; ikisi de yoksa ödeme doğrulanmış sayılmaz.
 * Yalnız OKUMA — bu sayfa sipariş durumu yazmaz (CLAUDE.md kural 11: durumlar monoton, yazan taraf callback).
 */
function siparisOdenmisMi(satir: { status?: string | null; payment_status?: string | null } | null | undefined): boolean {
  if (!satir) return false
  return satir.payment_status === 'paid' || satir.status === 'paid' || satir.status === 'confirmed'
}

const PaymentSuccessPage: React.FC = () => {
  const searchParams = useSearchParams()
  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()
  // URN-84: "3D Secure ile korundu" rozeti tabloda BOŞ (koşulsuz basılıyordu, ödemede uygulandığını gösteren veri okunmuyor);
  // metin boşken kalkan şey simgeyle birlikte rozetin kendisidir — yarım rozet (yalnız kalkan simgesi) basılmaz.
  const guvenRozeti = t('payment.securedBy3d')
  const { clearCart } = useCart()
  // 'inceleme' = iyzico-callback'in needs_review cevabi (REC-355 Faz 1): para CEKILMIS ama
  // odeme-siparis eslesmesi dogrulanamamis. 'error' ile birlestirilemez — o ekran tekrar
  // odemeye yonlendirir ve musteri ikinci kez oder.
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'inceleme'>('loading')
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [orderSummary, setOrderSummary] = useState<{ amount?: number, items?: number, createdAt?: string }>({})
  // URN-83: doğrulama artık başarı yolunda da bir `await` ile başlıyor (veritabanı okuması). Etki bağımlılıkları
  // (`clearCart` kimliği kullanıcı/sepet yüklenince değişir) bu bekleme sırasında etkiyi yeniden koşturabilir;
  // korumasız hâlde çift okuma, çift sepet temizliği ve çift bildirim olurdu. Doğrulama sayfa başına BİR KEZ koşar.
  const dogrulamaBasladi = useRef(false)
  // Başarı ekranındaki "sipariş detayı" bağlantısı YALNIZ veritabanında ödenmiş görünen siparişin kimliğine gider;
  // URL'deki `orderId` tek başına bağlantı hedefi olmaz (güvenlik incelemesi 10-10, bulgu 4/5).
  const [dogrulananSiparisId, setDogrulananSiparisId] = useState<string | undefined>(undefined)

  // Başarı teyit edilmeden sepeti temizleme! Yalnızca doğrulanmış başarıda temizlenecek.

  useEffect(() => {
    const conversationId = searchParams?.get('conversationId') || undefined
    const token = searchParams?.get('token') || undefined
    const errorMessage = searchParams?.get('errorMessage') || undefined
    const orderId = searchParams?.get('orderId') || undefined
    const statusParam = searchParams?.get('status') || undefined


    async function fetchOrderDetails(oid?: string) {
      try {
        if (!oid) return
        const { data, error } = await (supabase
          .from('venthub_orders'))
          .select('total_amount, created_at, venthub_order_items(quantity)')
          .eq('id', oid)
          .maybeSingle()
        if (!error && data) {
          const items = data.venthub_order_items;
          const count = Array.isArray(items) ? (items).reduce((s: number, it) => s + (Number(it?.quantity) || 0), 0) : undefined
          setOrderSummary({ amount: Number(data.total_amount) || undefined, createdAt: data.created_at, items: count })
        }
      } catch { }
    }

    // Sipariş veritabanında ödenmiş görünüyor mu? Yalnız okuma; hata/boş/yetkisiz okuma = DOĞRULANAMADI (false).
    async function siparisDogrulandiMi(oid: string): Promise<boolean> {
      try {
        const { data, error } = await (supabase
          .from('venthub_orders'))
          .select('status, payment_status')
          .eq('id', oid)
          .maybeSingle()
        if (error) return false
        return siparisOdenmisMi(data)
      } catch {
        return false
      }
    }

    // Sipariş satırı OKUNABİLİYOR mu (var ve bu ziyaretçiye görünür)? Yalnız varlık: ÖDENMİŞ olduğunu söylemez.
    async function siparisKaydiVarMi(oid: string): Promise<boolean> {
      try {
        const { data, error } = await (supabase
          .from('venthub_orders'))
          .select('id')
          .eq('id', oid)
          .maybeSingle()
        return !error && Boolean(data)
      } catch {
        return false
      }
    }

    // BELİRSİZ sonuç: ödeme alınmış olabilir ama doğrulanamadı (doğrulama hatası, ağ yok, "bekliyor"). Müşteriye
    // "Ödeme Başarısız / Tekrar Dene" DENMEZ: parası çekilmiş müşteri ikinci kez öder (çift tahsilat, güvenlik
    // incelemesi 10-10 bulgu 1). Sepet de silinmez (başarı kanıtlanmadı); yalnız "kontrol ediliyor" ekranı çıkar.
    function belirsizSonucuGoster() {
      setStatus('inceleme')
      setPaymentInfo({ conversationId: guvenliKimlik(orderId) || guvenliKimlik(conversationId), belirsiz: true })
    }

    async function verify() {
      try {
        // 1) Callback / yoklama `status=success` ile yönlendirdi. URN-83: bu URL parametresi TEK BAŞINA kanıt DEĞİLDİR —
        // adres elle yazılabilir; eskiden hiçbir doğrulama yapılmadan "Siparişiniz Tamamlandı" + DEMO-ORDER basılıyor ve
        // sepet siliniyordu. Başarı yalnız sipariş kimliği VARSA ve sipariş veritabanında ödenmiş görünüyorsa basılır.
        // Doğrulanamazsa aşağıdaki akış sürer (token → sipariş kimliği → hata): başarı basılmaz, sepet silinmez.
        if (statusParam === 'success' && orderId && (await siparisDogrulandiMi(orderId))) {
          setStatus('success')
          // Numara DOĞRULANMIŞ sipariş kimliğidir; URL'deki conversationId ikincildir ve yalnız güvenli biçimdeyse basılır.
          setPaymentInfo({ conversationId: guvenliKimlik(orderId) || guvenliKimlik(conversationId), token })
          setDogrulananSiparisId(orderId)
          clearCart({ silent: true })
          try {
            localStorage.removeItem('venthub-cart');
            localStorage.removeItem('venthub-cart-version');
            localStorage.removeItem('venthub-cart-owner');
            localStorage.removeItem('vh_pending_order');
            localStorage.setItem('vh_last_order_status', 'success');
            localStorage.setItem('vh_clear_server_cart_once', '1');
          } catch { }
          await fetchOrderDetails(orderId)
          toast.success(t('checkout.paymentSuccess'))
          return
        }

        // 1b) Callback eslesmeyi dogrulayamadiysa: para alindi, siparis beklemede.
        // Sepet temizlenir (odeme gerceklesti) ama tekrar odeme yolu KAPALI kalir.
        // URN-83 (güvenlik incelemesi 10-10, bulgu 3): bu URL parametresi de TEK BAŞINA kanıt DEĞİLDİR; elle yazılan
        // `?status=needs_review` ziyaretçinin sepetini siliyordu. Sepet yalnız sipariş kimliği VARSA ve o sipariş bu
        // ziyaretçiye görünüyorsa silinir; aksi hâlde inceleme ekranı çıkar ama hiçbir yazım yapılmaz.
        if (statusParam === 'needs_review') {
          const kayitVar = orderId ? await siparisKaydiVarMi(orderId) : false
          if (!kayitVar) {
            belirsizSonucuGoster()
            return
          }
          setStatus('inceleme')
          setPaymentInfo({ conversationId: guvenliKimlik(orderId) || guvenliKimlik(conversationId), token })
          clearCart({ silent: true })
          try {
            localStorage.removeItem('venthub-cart');
            localStorage.removeItem('venthub-cart-version');
            localStorage.removeItem('venthub-cart-owner');
            localStorage.removeItem('vh_pending_order');
            localStorage.setItem('vh_last_order_status', 'needs_review');
            localStorage.setItem('vh_clear_server_cart_once', '1');
          } catch { }
          await fetchOrderDetails(orderId)
          return
        }

        // 2) Token varsa, Functions üzerinden doğrula
        if (token) {
          const { data, error } = await supabase.functions.invoke('iyzico-callback', {
            body: { token, conversationId, orderId }
          })

          if (error) {
            // Doğrulama çağrısı düştü: ödemenin alınıp alınmadığı BİLİNMİYOR → belirsiz (başarısız DEĞİL).
            reportError(error, { context: 'Callback verify error' })
            belirsizSonucuGoster()
            toast.error(t('payment.verifyError'))
            return
          }

          if (data?.status === 'needs_review') {
            setStatus('inceleme')
            setPaymentInfo({ conversationId: guvenliKimlik(data?.iyzico?.conversationId) || guvenliKimlik(conversationId) || guvenliKimlik(orderId), token })
            clearCart({ silent: true })
            try {
              localStorage.removeItem('venthub-cart');
              localStorage.removeItem('venthub-cart-version');
              localStorage.removeItem('venthub-cart-owner');
              localStorage.removeItem('vh_pending_order');
              localStorage.setItem('vh_last_order_status', 'needs_review');
              localStorage.setItem('vh_clear_server_cart_once', '1');
            } catch { }
            await fetchOrderDetails(orderId)
            return
          }

          if (data?.status === 'success') {
            setStatus('success')
            // Numara SUNUCUDAN gelen değerdir (callback cevabı); URL'deki değerler ikincildir ve güvenli biçimdeyse basılır.
            setPaymentInfo({ conversationId: guvenliKimlik(data?.iyzico?.conversationId) || guvenliKimlik(conversationId) || guvenliKimlik(orderId), token })
            // Token ile gelen başarıyı URL'deki `orderId`'ye BAĞLAYAN bir alan callback cevabında yok (EDGE işi, ayrı
            // kart): bağlantı yalnız sipariş veritabanında ödenmiş görünüyorsa o kimliğe gider, yoksa sipariş listesine.
            if (orderId && (await siparisDogrulandiMi(orderId))) setDogrulananSiparisId(orderId)
            clearCart({ silent: true })
            try {
              localStorage.removeItem('venthub-cart');
              localStorage.removeItem('venthub-cart-version');
              localStorage.removeItem('venthub-cart-owner');
              localStorage.removeItem('vh_pending_order');
              localStorage.setItem('vh_last_order_status', 'success');
              localStorage.setItem('vh_clear_server_cart_once', '1');
            } catch { }
            await fetchOrderDetails(orderId)
            toast.success(t('checkout.paymentSuccess'))
            return
          }

          // `failure` cevabı ekranı "başarısız" yapar. NOT: iyzico-callback bugün `retrieve` null döndüğünde ve
          // catch yolunda da `failure` yönlendiriyor; bu dal kesin ret kanıtı DEĞİL, o yollar `pending` verene
          // kadar (URN-89, Pazar sonrası) çift tahsilat riski kısmen sürer. `pending` ya da tanınmayan bir cevap
          // "başarısız" demek değildir: ödeme alınmış olabilir → belirsiz.
          if (data?.status === 'failure') {
            setStatus('error')
            const msg = data?.iyzico?.errorMessage || t('payment.failedGeneric')
            setPaymentInfo({ errorMessage: msg })
            toast.error(t('payment.failedToast', { msg }))
            return
          }
          belirsizSonucuGoster()
          return
        }

        // 3) Token yoksa ama orderId varsa: callback'i orderId ile tetikle (token fallback), ardından veritabanından durumu kontrol et
        if (orderId) {
          try {
            await supabase.functions.invoke('iyzico-callback', { body: { orderId, conversationId } })
          } catch { }

          const { data, error } = await (supabase
            .from('venthub_orders'))
            .select('status, payment_status')
            .eq('id', orderId)
            .maybeSingle()

          if (error) {
            // Sipariş okunamadı: ödemenin durumu BİLİNMİYOR → belirsiz (başarısız DEĞİL).
            reportError(error, { context: 'Order fetch error' })
            belirsizSonucuGoster()
            toast.error(t('payment.verifyError'))
            return
          }

          if (siparisOdenmisMi(data)) {
            setStatus('success')
            setPaymentInfo({ conversationId: guvenliKimlik(orderId) || guvenliKimlik(conversationId), token })
            setDogrulananSiparisId(orderId)
            clearCart({ silent: true })
            try {
              localStorage.removeItem('venthub-cart');
              localStorage.removeItem('venthub-cart-version');
              localStorage.removeItem('venthub-cart-owner');
              localStorage.removeItem('vh_pending_order');
              localStorage.setItem('vh_last_order_status', 'success');
              localStorage.setItem('vh_clear_server_cart_once', '1');
            } catch { }
            await fetchOrderDetails(orderId)
            toast.success('🎉 Ödeme başarıyla tamamlandı!')
            return
          }
        }

        // 4) Buraya gelindiyse ödeme DOĞRULANMADI. "Ödeme Başarısız" ekranı yalnız callback'in `failure`
        // yönlendirmesi ya da bir `errorMessage` ile çıkar; callback `failure`'ı bugün `retrieve` null ve catch
        // yollarında da verdiği için bu kesin ret kanıtı sayılmaz (düzeltme URN-89). Geri kalan her durum
        // (`status=success` ama sipariş ödenmiş görünmüyor, sipariş bulunamadı, `pending`, parametresiz adres)
        // BELİRSİZDİR: ödeme alınmış olabilir, "Tekrar Dene" çift tahsilat demektir (güvenlik incelemesi 10-10).
        // URL'deki `errorMessage` ekrana BASILMAZ (adres elle yazılabilir; bulgu 5): sözlükteki genel metin çıkar.
        if (statusParam === 'failure' || errorMessage) {
          setStatus('error')
          setPaymentInfo({ errorMessage: t('payment.failedGeneric') })
          try { localStorage.setItem('vh_last_order_status', 'failure') } catch { }
          toast.error(t('payment.failedGeneric'))
        } else {
          belirsizSonucuGoster()
        }
      } catch (e: unknown) {
        // Beklenmeyen hata: ödemenin durumu BİLİNMİYOR → belirsiz (başarısız DEĞİL).
        reportError(e, { context: 'Verify catch error' })
        belirsizSonucuGoster()
        toast.error(t('payment.unexpected'))
      }
    }

    if (status === 'loading' && !dogrulamaBasladi.current) {
      dogrulamaBasladi.current = true
      verify()
    }
  }, [searchParams, clearCart, status, t])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Loader size={32} className="text-primary-navy animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            {t('payment.verifyingTitle')}
          </h2>
          <p className="text-steel-gray">
            {t('payment.verifyingDesc')}
          </p>
        </div>
      </div>
    )
  }

  // Para cekilmis, eslesme dogrulanmamis. Bu ekranda checkout'a giden HICBIR baglanti yok:
  // "tekrar dene" burada ikinci bir tahsilat demektir (REC-355 Faz 1).
  if (status === 'inceleme') {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        {/* Köşe yarıçapı tasarım ölçeğinden (`rounded-hvac-*`); ham `rounded-xl` INV-9
            stil sayacını artırır ve tavanı yükseltmek çözüm sayılmaz. */}
        <div className="bg-white rounded-hvac-md shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-warning-orange/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-warning-orange" />
          </div>
          {/* İki ayrı metin: `alındı, eşleştirme sürüyor` (callback needs_review dedi, para çekildi) ile `belirsiz`
              (doğrulanamadı: ödeme alınmış OLABİLİR). Belirsizde "alındı" DENMEZ, "başarısız" da denmez. */}
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            {paymentInfo?.belirsiz ? t('payment.pendingTitle') : t('payment.reviewTitle')}
          </h2>
          <p className="text-steel-gray mb-4">
            {paymentInfo?.belirsiz ? t('payment.pendingDesc') : t('payment.reviewDesc')}
          </p>
          <p className="text-industrial-gray font-semibold mb-6">
            {paymentInfo?.belirsiz ? t('payment.pendingWarning') : t('payment.reviewWarning')}
          </p>
          {paymentInfo?.conversationId && (
            <p className="text-sm text-steel-gray mb-6">
              {t('payment.orderNoLabel')}: <span className="font-mono">{paymentInfo.conversationId}</span>
            </p>
          )}
          {paymentInfo?.belirsiz && doluMu(t('footer.email')) && (
            <p className="text-sm text-steel-gray mb-6">
              {t('payment.pendingContactLabel')}:{' '}
              <a
                href={`mailto:${t('footer.email')}`}
                className="text-primary-navy underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-blue"
              >
                {t('footer.email')}
              </a>
            </p>
          )}
          <div className="space-y-3">
            <Link
              href={Routes.account.orders()}
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-blue"
            >
              {t('payment.viewOrderDetails')}
            </Link>
            <Link
              href={Routes.home()}
              className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-blue"
            >
              {t('payment.reviewBackHome')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            {t('payment.failedTitle')}
          </h2>
          <p className="text-steel-gray mb-6">
            {paymentInfo?.errorMessage || t('checkout.errors.paymentError')}
          </p>
          <div className="space-y-3">
            <Link
              href={Routes.checkout()}
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              {t('payment.retry')}
            </Link>
            <Link
              href={Routes.cart()}
              className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
            >
              {t('checkout.backToCart')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Bağlantı hedefi yalnız DOĞRULANMIŞ sipariş kimliğidir (veritabanında ödenmiş görünen); yoksa (ör. yalnız token ile
  // doğrulanan başarı) "sipariş detayı" boş ya da uydurma kimlikli adrese değil sipariş listesine gider.
  const siparisKimligi = dogrulananSiparisId

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="bg-success-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-success-green" />
        </div>
        <h2 className="text-2xl font-bold text-industrial-gray mb-4">
          {t('payment.orderCompletedTitle')}
        </h2>
        {/* URN-83: sipariş numarası yoksa satır HİÇ çıkmaz — eskiden burada sabit "DEMO-ORDER" yazıyordu. */}
        {paymentInfo?.conversationId && (
          <p className="text-steel-gray mb-6">
            {t('payment.orderNoLabel')}: <strong>{paymentInfo.conversationId}</strong>
          </p>
        )}
        <p className="text-steel-gray mb-8">
          {t('payment.orderCompletedDesc')}
        </p>
        {/* Order summary */}
        <div className="grid grid-cols-1 gap-3 mb-6 text-left">
          {orderSummary.createdAt && (
            <div className="flex justify-between text-sm text-steel-gray">
              <span>{t('payment.dateLabel')}</span>
              <span>{formatDateTime(orderSummary.createdAt, lang)}</span>
            </div>
          )}
          {typeof orderSummary.items === 'number' && (
            <div className="flex justify-between text-sm text-steel-gray">
              <span>{t('payment.itemsCountLabel')}</span>
              <span>{orderSummary.items}</span>
            </div>
          )}
          {typeof orderSummary.amount === 'number' && (
            <div className="flex justify-between text-sm font-semibold text-industrial-gray">
              <span>{t('orders.totalAmount')}</span>
              <span>{formatCurrency(orderSummary.amount, lang, { currency: SYSTEM_CURRENCY, maximumFractionDigits: 0 })}</span>
            </div>
          )}
        </div>
        {/* Trust badge */}
        {doluMu(guvenRozeti) && (
          <div className="flex items-center justify-center space-x-2 text-success-green mb-4">
            <ShieldCheck size={18} />
            <span className="text-sm font-medium">{guvenRozeti}</span>
          </div>
        )}
        <div className="space-y-3">
          <Link
            href={siparisKimligi ? Routes.account.orderDetail(siparisKimligi) : Routes.account.orders()}
            className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block text-center"
          >
            {t('payment.viewOrderDetails')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage



