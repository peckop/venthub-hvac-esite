import { AlertTriangle, ArrowRight, Calendar, CheckCircle, Clock, CreditCard, MapPin, MapPin as MapPinIcon,Package, ShieldCheck, TrendingUp, Truck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { listAddresses } from '@/lib/services/address.service'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import type { UserAddress } from '@/types/ui-models'

import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { Routes } from '../../utils/routes';


interface OrderRecord {
  id: string
  created_at: string
  total_amount: number | string
  status: string
  order_number: string
}

interface ShipmentRecord extends OrderRecord {
  carrier: string | null
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
}

export default function AccountOverviewPage() {
  const { user } = useAuth()
  const { lang, t } = useI18n()
  const router = useRouter()

  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [orders, setOrders] = useState<ShipmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user) return
      try {
        setLoading(true)

        // 1. Adresler
        try {
          const addrData = await listAddresses(supabase)
          if (mounted) setAddresses(addrData)
        } catch { }

        // 2. Tüm Siparişler (İstatistik ve Son Siparişler için daha geniş data çekiyoruz)
        let orderData: ShipmentRecord[] = []
        try {
          const { data, error } = await supabase
            .from('venthub_orders')
            .select('id, created_at, total_amount, status, order_number, carrier, tracking_number, shipped_at, delivered_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)


          if (error && (error as { code: string }).code === 'PGRST100') throw error 

          if (data) orderData = data as ShipmentRecord[]
        } catch {
          const fallback = await supabase
            .from('venthub_orders')
            .select('id, created_at, total_amount, status, order_number')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)
          if (fallback.data) {

            orderData = (fallback.data as Record<string, unknown>[]).map(d => ({
              ...d,
              carrier: null,
              tracking_number: null,
              shipped_at: null,
              delivered_at: null
            })) as ShipmentRecord[]
          }
        }

        if (mounted) setOrders(orderData)

      } catch (e) {
        console.error('Overview load error', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  const defaultShipping = addresses.find(a => a.is_default_shipping)
  const defaultBilling = addresses.find(a => a.is_default_billing)
  const fullName = user?.user_metadata?.full_name || 'Değerli İş Ortağımız'

  // İstatistik Hesaplamaları
  const totalVolume = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  const activeOrders = orders.filter(o => !['delivered', 'cancelled', 'refunded', 'rejected'].includes(o.status.toLowerCase()))
  const completedOrdersCount = orders.filter(o => o.status.toLowerCase() === 'delivered').length

  // Aktif Sipariş için Kargo Durumu Bulma (En son verilen, bitmemiş sipariş)
  const activeShipment = activeOrders[0] // created_at DESC geldiği için ilk eleman en yenisi

  const getShipStatus = (row?: ShipmentRecord): 'delivered' | 'shipped' | 'preparing' => {
    if (!row) return 'preparing'
    if (row.delivered_at || row.status.toLowerCase() === 'delivered') return 'delivered'
    if (row.shipped_at || row.tracking_number || row.status.toLowerCase() === 'shipped') return 'shipped'
    return 'preparing'
  }
  const activeShipStatus = getShipStatus(activeShipment)

  const activeShipStatusBadge = (status: 'delivered' | 'shipped' | 'preparing') => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-700 border border-green-500/20"><CheckCircle className="w-3.5 h-3.5" /> Teslim Edildi</span>
      case 'shipped':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 border border-purple-500/20"><Truck className="w-3.5 h-3.5" /> Kargoda</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Hazırlanıyor</span>
    }
  }

  const shipSteps = [
    { key: 'preparing', label: 'Hazırlandı', icon: Package },
    { key: 'shipped', label: 'Kargoda', icon: Truck },
    { key: 'delivered', label: 'Teslim Edildi', icon: CheckCircle },
  ]

  const getStepIndex = (status: 'delivered' | 'shipped' | 'preparing') => {
    if (status === 'delivered') return 2
    if (status === 'shipped') return 1
    return 0
  }
  const activeStepIdx = getStepIndex(activeShipStatus)

  if (loading) {
    return (
      <div className="min-h-50vh flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary-navy animate-spin"></div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider animate-pulse">Dashboard Hazırlanıyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 relative">

      {/* Background Mesh (Sadece üst kısım için dekoratif) */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden -z-10 bg-slate-50/50 rounded-3xl pointer-events-none">
        <div className="absolute -top-20% -left-10% w-1/2 h-150% bg-primary-navy/5 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-10% -right-10% w-2/5 h-120% bg-blue-400/5 rounded-full blur-3xl opacity-70"></div>
      </div>

      {/* Dynamic Welcome & Top Metrics */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Welcome Box */}
        <div className="lg:w-1/3 relative overflow-hidden bg-primary-navy text-white rounded-3xl p-8 shadow-xl shadow-primary-navy/10 flex flex-col justify-end min-h-220px">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">{t('account.overview.greeting')}<br />{fullName} 👋</h2>
            <p className="text-white/80 text-sm font-medium">{t('account.overview.welcomeMessage')}</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-transform hover:-translate-y-1">
            <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4 shadow-sm border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{activeOrders.length}</div>
            <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{t('account.overview.activeOrders')}</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-transform hover:-translate-y-1">
            <CheckCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm border border-emerald-100">
              <Package className="w-6 h-6" />
            </div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{completedOrdersCount}</div>
            <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{t('account.overview.completedOrders')}</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-transform hover:-translate-y-1">
            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight trunc">{totalVolume > 0 ? formatCurrency(totalVolume, lang, { maximumFractionDigits: 0 }) : '0 ₺'}</div>
            <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Toplam Hacim</div>
          </div>
        </div>

      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* C1: Kargo Takibi & Son Siparişler (Spans 2 cols on XL) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Smart Shipping Widget */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden relative group hover:shadow-md transition-shadow">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-navy/5 flex items-center justify-center text-primary-navy">
                    <Truck className="w-4 h-4" />
                  </div>
                  Canlı Kargo Takibi
                </h3>
                {activeShipment ? (
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Sipariş <span className="font-bold text-slate-900">#{activeShipment.order_number?.split('-').pop() || activeShipment.id.slice(-8).toUpperCase()}</span> yolda.
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-500 mt-1">Şu anda yolda olan aktif bir siparişiniz bulunmuyor.</p>
                )}
              </div>

              {activeShipment && (
                <div className="self-start sm:self-auto">
                  {activeShipStatusBadge(activeShipStatus)}
                </div>
              )}
            </div>

            {activeShipment ? (
              <div className="p-6 sm:p-8 bg-slate-50/50">
                <div className="flex items-center justify-between max-w-2xl mx-auto relative z-10">
                  {shipSteps.map((step, idx) => {
                    const active = idx <= activeStepIdx
                    const StepIcon = step.icon
                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-300 ${active ? 'bg-primary-navy text-white scale-110 shadow-primary-navy/20' : 'bg-white border-2 border-slate-200 text-slate-400'
                            }`}>
                            <StepIcon size={20} />
                          </div>
                          <span className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors ${active ? 'text-primary-navy' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        {idx < shipSteps.length - 1 && (
                          <div className={`flex-1 h-1.5 rounded-full mx-2 sm:mx-6 transition-colors duration-500 ${activeStepIdx >= idx + 1 ? 'bg-primary-navy shadow-sm' : 'bg-slate-200'}`} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>

                <div className="mt-8 flex justify-center">
                  <button onClick={() => router.push(Routes.account.shipments())} className="h-10 px-6 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-primary-navy hover:text-primary-navy transition-shadow shadow-sm">
                    Tüm Kargoları Görüntüle
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                  <MapPin size={32} />
                </div>
                <p className="text-sm font-medium text-slate-500 max-w-sm">
                  Aktif bir teslimatınız yok. Yeni bir sipariş verdiğinizde kargo süreçlerini buradan canlı olarak izleyebilirsiniz.
                </p>
                <button onClick={() => router.push(Routes.products())} className="mt-6 h-10 px-6 rounded-xl bg-primary-navy text-white text-sm font-bold hover:bg-industrial-gray transition-colors shadow-sm shadow-primary-navy/20">
                  Kataloğu İncele
                </button>
              </div>
            )}
          </div>

          {/* Recent Orders List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Clock className="w-4 h-4" />
                </div>
                Son Siparişleriniz
              </h3>
              <Link href={Routes.account.orders()} className="text-sm font-bold text-primary-navy hover:underline inline-flex items-center gap-1">
                Tümünü Gör <ArrowRight size={14} />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">
                Henüz geçmiş bir siparişiniz bulunmuyor.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((o) => {
                  const isDelivered = o.status.toLowerCase() === 'delivered'
                  const code = o.order_number ? `#${o.order_number.split('-')[1]}` : `#${o.id.slice(-8).toUpperCase()}`
                  return (
                    <div key={o.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${isDelivered ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-slate-400 border-slate-200'}`}>
                          <Package size={20} />
                        </div>
                        <div>
                          <Link href={Routes.account.orderDetail(o.id)} className="text-base font-bold text-slate-900 hover:text-primary-navy transition-colors">
                            Sipariş {code}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-slate-700">{formatCurrency(Number(o.total_amount), lang, { maximumFractionDigits: 0 })}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Calendar size={12} /> {formatDate(o.created_at, lang)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto ml-16 sm:ml-0">
                        {activeShipStatusBadge(getShipStatus(o))}
                        <button onClick={() => router.push(Routes.account.orderDetail(o.id))} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary-navy hover:border-primary-navy transition-colors shadow-sm">
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* C2: Adres, Güvenlik, Hızlı İşlemler */}
        <div className="xl:col-span-1 space-y-6">

          {/* Adres Kartı */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md transition-shadow">
            <MapPinIcon className="absolute -right-6 -top-6 w-32 h-32 text-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <MapPinIcon className="w-4 h-4" />
                  </div>
                  Teslimat & Fatura
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Truck size={12} /> Varsayılan Teslimat</div>
                  {defaultShipping ? (
                    <div className="text-sm font-bold text-slate-700 leading-relaxed border-l-2 border-primary-navy pl-3 py-0.5">{defaultShipping.full_address}</div>
                  ) : (
                    <div className="text-sm font-medium text-slate-400 italic">Tanımlı teslimat adresi yok.</div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CreditCard size={12} /> Varsayılan Fatura</div>
                  {defaultBilling ? (
                    <div className="text-sm font-bold text-slate-700 leading-relaxed border-l-2 border-emerald-500 pl-3 py-0.5">{defaultBilling.full_address}</div>
                  ) : (
                    <div className="text-sm font-medium text-slate-400 italic">Tanımlı fatura adresi yok.</div>
                  )}
                </div>
              </div>

              <button onClick={() => router.push(Routes.account.addresses())} className="w-full mt-6 h-10 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:text-primary-navy hover:border-primary-navy transition-shadow shadow-sm">
                Adresleri Yönet
              </button>
            </div>
          </div>

          {/* Güvenlik & Profil Kısa Yolları */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute -top-1/2 -right-20% w-150% h-150% bg-gradient-to-br from-primary-navy/40 to-transparent rounded-full blur-3xl pointer-events-none" />
            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Güvenlik Merkezi</h3>
              <p className="text-sm text-slate-300 font-medium mb-8 leading-relaxed">
                Şifrenizi, 2FA ayarlarınızı ve oturum bilgilerinizi güvenli bir şekilde yönetin.
              </p>

              <button onClick={() => router.push(Routes.account.security())} className="w-full h-11 rounded-xl bg-white text-slate-900 border border-transparent hover:bg-slate-100 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                Göz At <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Support Card */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-200/60 text-center flex flex-col items-center justify-center group hover:bg-white transition-colors">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Desteğe mi ihtiyacınız var?</h3>
            <p className="text-xs font-medium text-slate-500 mb-4">Sipariş, iade veya bakiye konularında anında yardım alın.</p>
            <a href="mailto:support@venthub.com" className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:text-primary-navy hover:border-primary-navy transition-shadow shadow-sm flex items-center justify-center">
              Müşteri Hizmetleri
            </a>
          </div>

        </div>

      </div>
    </div>
  )
}
