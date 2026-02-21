import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { listAddresses, UserAddress, supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDate } from '../../i18n/datetime'
import { MapPin, Package, Clock, CheckCircle, ArrowRight, ShieldCheck, CreditCard, Truck } from 'lucide-react'

interface OrderRecord {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_number: string
}

interface SupabaseError {
  code?: string
  status?: number
  message?: string
}

const StatusBadge = ({ status, t }: { status: string, t: any }) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Teslim Edildi</span>
    case 'shipped':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Truck className="w-3.5 h-3.5" /> Kargoya Verildi</span>
    case 'processing':
    case 'pending':
    default:
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Hazırlanıyor</span>
  }
}

export default function AccountOverviewPage() {
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [lastOrders, setLastOrders] = useState<OrderRecord[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await listAddresses()
        if (mounted) setAddresses(data)
      } catch {
        // noop
      }
      try {
        let { data: orders, error } = await supabase
          .from('venthub_orders')
          .select('id, created_at, total_amount, status, order_number')
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false })
          .limit(3)
        if (error && ((error as SupabaseError).code === '42703' || (error as SupabaseError).status === 400)) {
          const fb = await supabase
            .from('venthub_orders')
            .select('id, created_at, total_amount, status')
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false })
            .limit(3)
          orders = fb.data as OrderRecord[]
          error = fb.error
        }
        if (error) throw error
        if (mounted) setLastOrders((orders || []).map(o => ({
          id: o.id,
          created_at: o.created_at,
          total_amount: Number(o.total_amount) || 0,
          status: o.status || 'pending',
          order_number: o.order_number || o.id,
        })))
      } catch (e) {
        console.warn('Last orders load error', e)
      }
    }
    if (user) load()
    return () => { mounted = false }
  }, [user])

  const defaultShipping = addresses.find(a => a.is_default_shipping)
  const defaultBilling = addresses.find(a => a.is_default_billing)

  const fullName = user?.user_metadata?.full_name || 'Değerli Müşterimiz'

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-industrial-gray to-primary-navy rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Merhaba, {fullName}! 👋</h2>
          <p className="text-white/80 text-sm sm:text-base max-w-xl">
            VentHub kontrol paneline hoş geldiniz. Buradan siparişlerinizi takip edebilir, bakiye bilgilerinize ulaşabilir ve profilinizi güncelleyebilirsiniz.
          </p>
        </div>

        {/* Decorative element */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Column - Orders */}
        <section className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
                  <Package className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-industrial-gray">{t('orders.title') || 'Son Siparişler'}</h2>
              </div>
              <Link href="/account/orders" className="group flex items-center gap-1.5 text-sm font-medium text-primary-navy hover:text-industrial-gray transition-colors">
                {t('orders.viewAll') || 'Tümünü gör'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {lastOrders.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-sm text-steel-gray bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <Package className="w-8 h-8 text-gray-300 mb-2" />
                {t('orders.noOrdersTitle') || 'Henüz siparişiniz bulunmuyor.'}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lastOrders.map(o => (
                  <li key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex w-12 h-12 rounded-full bg-gray-50 items-center justify-center text-steel-gray group-hover:bg-primary-navy/5 group-hover:text-primary-navy transition-colors shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <Link href={`/account/orders/detail?id=${o.id}`} className="font-bold text-industrial-gray hover:text-primary-navy transition-colors">
                          {o.order_number ? `#${o.order_number.split('-')[1]}` : `#${o.id.slice(-8).toUpperCase()}`}
                        </Link>
                        <div className="text-sm text-steel-gray mt-1 flex items-center gap-2">
                          <span className="font-medium text-gray-900">{formatCurrency(o.total_amount, lang, { maximumFractionDigits: 0 })}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{formatDate(o.created_at, lang)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <StatusBadge status={o.status} t={t} />
                      <Link href={`/account/orders/detail?id=${o.id}`} className="p-2 text-gray-400 hover:text-primary-navy hover:bg-gray-50 rounded-lg transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Side Column - Addresses & Actions */}
        <section className="col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-industrial-gray">{t('account.overview.defaultAddressesTitle') || 'Adres Bilgileri'}</h2>
            </div>

            <div className="space-y-5">
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Truck className="w-3.5 h-3.5" />
                  {t('account.overview.shippingAddress')}
                </div>
                {defaultShipping ? (
                  <p className="text-sm text-industrial-gray font-medium leading-relaxed">{defaultShipping.full_address}</p>
                ) : (
                  <p className="text-sm text-steel-gray italic">{t('account.overview.notSetShipping')}</p>
                )}
              </div>

              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  {t('account.overview.billingAddress')}
                </div>
                {defaultBilling ? (
                  <p className="text-sm text-industrial-gray font-medium leading-relaxed">{defaultBilling.full_address}</p>
                ) : (
                  <p className="text-sm text-steel-gray italic">{t('account.overview.notSetBilling')}</p>
                )}
              </div>

              <Link href="/account/addresses" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-industrial-gray text-sm font-bold rounded-xl transition-colors border border-gray-200">
                {t('account.overview.manageAddresses') || 'Adresleri Yönet'}
              </Link>
            </div>
          </div>

          {/* Quick Actions / Sec */}
          <div className="bg-primary-navy text-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <ShieldCheck className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/5 pointer-events-none" />
            <h3 className="text-lg font-bold mb-2">Hesap Güvenliği</h3>
            <p className="text-sm text-white/80 mb-4">Şifrenizi ve oturum tercihlerinizi güvenlik ayarlarından kolayca yönetebilirsiniz.</p>
            <Link href="/account/security" className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
              Ayarlara Git <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}





