import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { listAddresses, UserAddress, supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'

export default function AccountOverviewPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [lastOrders, setLastOrders] = useState<{ id: string; created_at: string; total_amount: number; status: string; order_number?: string|null }[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await listAddresses()
        if (mounted) setAddresses(data)
      } catch {
        // noop (liste boş olabilir)
      }
      try {
        let { data: orders, error } = await supabase
          .from('venthub_orders')
          .select('id, created_at, total_amount, status, order_number')
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false })
          .limit(3)
        if (error && ((error as any).code === '42703' || (error as any).status === 400)) {
          const fb = await supabase
            .from('venthub_orders')
            .select('id, created_at, total_amount, status')
            .eq('user_id', user?.id || '')
            .order('created_at', { ascending: false })
            .limit(3)
          orders = fb.data as any
          error = fb.error as any
        }
        if (error) throw error
        if (mounted) setLastOrders((orders || []).map(o => ({
          id: o.id,
          created_at: o.created_at as string,
          total_amount: Number((o as any).total_amount) || 0,
          status: (o as any).status || 'pending',
          order_number: (o as any).order_number || null,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-industrial-gray">{t('orders.title') || 'Son Siparişler'}</h2>
          <Link to="/account/orders" className="text-sm text-primary-navy hover:underline">{t('orders.viewAll') || 'Tümünü gör'}</Link>
        </div>
        {lastOrders.length === 0 ? (
          <div className="text-sm text-steel-gray">{t('orders.noOrdersTitle') || 'Henüz sipariş yok.'}</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {lastOrders.map(o => (
              <li key={o.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-industrial-gray">{o.order_number ? `#${o.order_number.split('-')[1]}` : `#${o.id.slice(-8).toUpperCase()}`}</div>
                  <div className="text-steel-gray">{new Date(o.created_at).toLocaleDateString('tr-TR')}</div>
                </div>
                <div className="text-right">
                  <div className="text-industrial-gray font-medium">{new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(o.total_amount)}</div>
                  <Link to={`/account/orders/${o.id}`} className="text-primary-navy hover:underline">{t('orders.details') || 'Detay'}</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-industrial-gray mb-3">Varsayılan Adresler</h2>
        <div className="space-y-3 text-sm text-steel-gray">
          <div>
            <div className="font-medium text-industrial-gray">Kargo Adresi</div>
            {defaultShipping ? (
              <div className="mt-1 whitespace-pre-line">{defaultShipping.full_address}</div>
            ) : (
              <div className="mt-1">Varsayılan kargo adresi ayarlanmamış.</div>
            )}
          </div>
          <div>
            <div className="font-medium text-industrial-gray">Fatura Adresi</div>
            {defaultBilling ? (
              <div className="mt-1 whitespace-pre-line">{defaultBilling.full_address}</div>
            ) : (
              <div className="mt-1">Varsayılan fatura adresi ayarlanmamış.</div>
            )}
          </div>
          <Link to="/account/addresses" className="inline-block mt-2 text-primary-navy hover:underline text-sm">Adresleri yönet</Link>
        </div>
      </section>
    </div>
  )
}

