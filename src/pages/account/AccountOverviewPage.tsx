import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { listAddresses, UserAddress } from '../../lib/supabase'
import { Link } from 'react-router-dom'

export default function AccountOverviewPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<UserAddress[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await listAddresses()
        if (mounted) setAddresses(data)
      } catch {
        // noop (liste boş olabilir)
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
          <h2 className="text-lg font-semibold text-industrial-gray">Son Siparişler</h2>
          <Link to="/account/orders" className="text-sm text-primary-navy hover:underline">Tümünü gör</Link>
        </div>
        <div className="text-sm text-steel-gray">
          Siparişleriniz burada listelenecek. "Siparişler" sekmesine giderek detaylara ulaşabilirsiniz.
        </div>
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

