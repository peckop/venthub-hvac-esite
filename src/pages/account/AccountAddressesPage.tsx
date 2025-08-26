import React, { useEffect, useMemo, useState } from 'react'
import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress, UserAddress } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface FormState {
  id?: string
  label?: string
  full_name?: string
  phone?: string
  full_address: string
  city: string
  district: string
  postal_code?: string
  country?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

const emptyForm: FormState = {
  label: '',
  full_name: '',
  phone: '',
  full_address: '',
  city: '',
  district: '',
  postal_code: '',
  country: 'TR',
  is_default_shipping: false,
  is_default_billing: false,
}

export default function AccountAddressesPage() {
  const [items, setItems] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({ ...emptyForm })

  async function refresh() {
    try {
      setLoading(true)
      const data = await listAddresses()
      setItems(data)
    } catch (e) {
      console.error(e)
      toast.error('Adresler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const isEditing = useMemo(() => !!form.id, [form.id])

  function startEdit(a: UserAddress) {
    setForm({
      id: a.id,
      label: a.label || '',
      full_name: a.full_name || '',
      phone: a.phone || '',
      full_address: a.full_address,
      city: a.city,
      district: a.district,
      postal_code: a.postal_code || '',
      country: a.country || 'TR',
      is_default_shipping: a.is_default_shipping,
      is_default_billing: a.is_default_billing,
    })
  }

  function resetForm() {
    setForm({ ...emptyForm })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_address || !form.city || !form.district) {
      toast.error('Zorunlu alanları doldurun')
      return
    }

    try {
      setSaving(true)
      if (isEditing && form.id) {
        await updateAddress(form.id, {
          label: form.label,
          full_name: form.full_name,
          phone: form.phone,
          full_address: form.full_address,
          city: form.city,
          district: form.district,
          postal_code: form.postal_code,
          country: form.country,
          is_default_shipping: form.is_default_shipping,
          is_default_billing: form.is_default_billing,
        })
        toast.success('Adres güncellendi')
      } else {
        await createAddress({
          label: form.label,
          full_name: form.full_name,
          phone: form.phone,
          full_address: form.full_address,
          city: form.city,
          district: form.district,
          postal_code: form.postal_code,
          country: form.country,
          is_default_shipping: form.is_default_shipping,
          is_default_billing: form.is_default_billing,
        })
        toast.success('Adres eklendi')
      }
      resetForm()
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error('Kaydetme sırasında hata')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return
    try {
      await deleteAddress(id)
      toast.success('Adres silindi')
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error('Silme sırasında hata')
    }
  }

  async function makeDefault(id: string, kind: 'shipping' | 'billing') {
    try {
      await setDefaultAddress(kind, id)
      toast.success(kind === 'shipping' ? 'Varsayılan kargo adresi ayarlandı' : 'Varsayılan fatura adresi ayarlandı')
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error('Güncelleme sırasında hata')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-industrial-gray mb-3">Adreslerim</h2>

        {loading ? (
          <div className="text-sm text-steel-gray">Yükleniyor...</div>
        ) : (
          <ul className="space-y-3">
            {items.map((a) => (
              <li key={a.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-industrial-gray font-medium">
                      {a.label || 'Adres'}
                      {a.is_default_shipping && (
                        <span className="ml-2 text-xs text-primary-navy">(Kargo varsayılan)</span>
                      )}
                      {a.is_default_billing && (
                        <span className="ml-2 text-xs text-primary-navy">(Fatura varsayılan)</span>
                      )}
                    </div>
                    <div className="text-sm text-steel-gray whitespace-pre-line mt-1">{a.full_address}</div>
                    <div className="text-xs text-gray-500 mt-1">{a.district}, {a.city} {a.postal_code || ''} {a.country || ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(a)} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50">Düzenle</button>
                    <button onClick={() => handleDelete(a.id)} className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 text-red-600">Sil</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => makeDefault(a.id, 'shipping')} className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50">Kargoda varsayılan yap</button>
                  <button onClick={() => makeDefault(a.id, 'billing')} className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50">Faturada varsayılan yap</button>
                </div>
              </li>
            ))}
            {items.length === 0 && (
              <li className="text-sm text-steel-gray">Henüz adres eklenmemiş.</li>
            )}
          </ul>
        )}
      </section>

      <section className="bg-white border border-gray-100 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-industrial-gray mb-3">{isEditing ? 'Adresi Düzenle' : 'Yeni Adres'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.label || ''} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Etiket (Ev, Ofis)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
          <input value={form.full_name || ''} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Ad Soyad" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
          <input value={form.phone || ''} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Telefon" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
          <textarea value={form.full_address} onChange={(e) => setForm(f => ({ ...f, full_address: e.target.value }))} placeholder="Adres" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy min-h-24" required />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="İl" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" required />
            <input value={form.district} onChange={(e) => setForm(f => ({ ...f, district: e.target.value }))} placeholder="İlçe" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" required />
            <input value={form.postal_code || ''} onChange={(e) => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="Posta Kodu" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.is_default_shipping} onChange={(e) => setForm(f => ({ ...f, is_default_shipping: e.target.checked }))} />
              Kargoda varsayılan
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.is_default_billing} onChange={(e) => setForm(f => ({ ...f, is_default_billing: e.target.checked }))} />
              Faturada varsayılan
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={saving} className="bg-primary-navy text-white px-4 py-2 rounded-lg disabled:opacity-60">{isEditing ? 'Güncelle' : 'Ekle'}</button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border">İptal</button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

