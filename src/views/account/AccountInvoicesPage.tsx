'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { 
  createInvoiceProfile, 
  deleteInvoiceProfile, 
  listInvoiceProfiles, 
  setDefaultInvoiceProfile, 
  updateInvoiceProfile, 
  type InvoiceProfile
} from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'
import toast from 'react-hot-toast'
import { FileText, Plus, Trash2, Edit2, CheckCircle, User, Building2, Landmark, Loader2 } from 'lucide-react'

type InvoiceProfileType = 'individual' | 'corporate'

export default function AccountInvoicesPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [items, setItems] = useState<InvoiceProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [profileType, setProfileType] = useState<InvoiceProfileType>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await listInvoiceProfiles()
      setItems(data as InvoiceProfile[])
    } catch (e) {
      console.error(e)
      toast.error('Fatura profilleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setEditingId(null)
    setProfileType('individual')
    setFirstName('')
    setLastName('')
    setCompanyName('')
    setTaxNumber('')
    setTaxOffice('')
    setCity('')
    setDistrict('')
    setAddressLine('')
    setIsDefault(false)
  }

  const startEdit = (p: InvoiceProfile) => {
    setEditingId(p.id)
    setProfileType(p.profile_type as InvoiceProfileType)
    setFirstName(p.first_name || '')
    setLastName(p.last_name || '')
    setCompanyName(p.company_name || '')
    setTaxNumber(p.tax_number || '')
    setTaxOffice(p.tax_office || '')
    setCity(p.city)
    setDistrict(p.district)
    setAddressLine(p.address_line)
    setIsDefault(p.is_default)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addressLine || !city || !district || !taxNumber) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return
    }

    setSaving(true)
    try {
      if (!user) throw new Error('User not found')
      const payload = {
        user_id: user.id,
        profile_type: profileType,
        first_name: profileType === 'individual' ? firstName : null,
        last_name: profileType === 'individual' ? lastName : null,
        company_name: profileType === 'corporate' ? companyName : null,
        tax_number: taxNumber,
        tax_office: taxOffice,
        city,
        district,
        address_line: addressLine,
        is_default: isDefault,
        country: 'TR'
      }

      if (editingId) {
        await updateInvoiceProfile(editingId, payload)
        toast.success('Profil güncellendi')
      } else {
        await createInvoiceProfile(payload)
        toast.success('Profil oluşturuldu')
      }
      resetForm()
      await load()
    } catch (e) {
      console.error(e)
      toast.error('İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    try {
      await deleteInvoiceProfile(id)
      toast.success('Profil silindi')
      await load()
    } catch (e) {
      console.error(e)
      toast.error('Silme başarısız')
    }
  }

  const handleMakeDefault = async (id: string) => {
    try {
      await setDefaultInvoiceProfile(id)
      toast.success('Varsayılan profil yapıldı')
      await load()
    } catch (e) {
      console.error(e)
      toast.error('İşlem başarısız')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <section className="w-full lg:w-[400px] shrink-0 order-first lg:order-last">
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 sm:p-8 sticky top-[100px]">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? 'Profili Düzenle' : 'Yeni Fatura Profili'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/50">
              <button type="button" onClick={() => setProfileType('individual')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${profileType === 'individual' ? 'bg-white text-primary-navy shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}>
                <User className="w-4 h-4" /> Bireysel
              </button>
              <button type="button" onClick={() => setProfileType('corporate')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${profileType === 'corporate' ? 'bg-white text-primary-navy shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}>
                <Building2 className="w-4 h-4" /> Kurumsal
              </button>
            </div>

            {profileType === 'individual' ? (
              <div className="grid grid-cols-2 gap-3">
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ad" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Soyad" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
              </div>
            ) : (
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Firma Ünvanı" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
            )}

            <div className="grid grid-cols-2 gap-3">
              <input value={taxNumber} onChange={e => setTaxNumber(e.target.value)} placeholder={profileType === 'individual' ? 'TCKN' : 'VKN'} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
              <input value={taxOffice} onChange={e => setTaxOffice(e.target.value)} placeholder="Vergi Dairesi" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="İl" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
              <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="İlçe" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
            </div>

            <textarea value={addressLine} onChange={e => setAddressLine(e.target.value)} placeholder="Adres Detayı" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24" required />

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="w-4 h-4 rounded text-primary-navy" />
              <span className="text-sm font-medium text-slate-600">Varsayılan Profil Yap</span>
            </label>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              {editingId && <button type="button" onClick={resetForm} className="flex-1 h-10 border border-slate-200 rounded-lg font-bold text-slate-600">{t('common.cancel')}</button>}
              <button disabled={saving} className="flex-[2] h-10 bg-primary-navy text-white rounded-lg font-bold disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingId ? t('common.update') : t('common.save'))}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="flex-1 min-w-0">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fatura Profillerim</h1>
            <p className="text-sm text-slate-500 mt-1">Fatura bilgilerini burada yönetebilirsiniz.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-navy" /></div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center text-slate-400">Henüz profil eklenmemiş</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-primary-navy/40 transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${p.profile_type === 'individual' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    {p.profile_type === 'individual' ? <User size={20} /> : <Building2 size={20} />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-primary-navy transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-1">{p.profile_type === 'individual' ? `${p.first_name} ${p.last_name}` : p.company_name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  <Landmark size={12} /> {p.tax_office} / {p.tax_number}
                </div>

                <div className="text-sm text-slate-500 mb-6 line-clamp-2">{p.address_line} {p.district}/{p.city}</div>

                {p.is_default ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full"><CheckCircle size={10} /> Varsayılan</span>
                ) : (
                  <button onClick={() => handleMakeDefault(p.id)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary-navy transition-colors underline">Varsayılan Yap</button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
