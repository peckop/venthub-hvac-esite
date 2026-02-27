import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { User, Phone, Check, Loader2 } from 'lucide-react'

interface UserMetadata {
  full_name?: string
  phone?: string
  [key: string]: unknown
}

export default function AccountProfilePage() {
  const { user } = useAuth()
  const [fullName, setFullName] = React.useState<string>('')
  const [phone, setPhone] = React.useState<string>('')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    const meta = (user?.user_metadata || {}) as UserMetadata
    setFullName(meta.full_name || '')
    setPhone(meta.phone || '')
  }, [user])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName || undefined, phone: phone || undefined }
      })
      if (error) throw error
      toast.success('Profil güncellendi')
    } catch (e) {
      console.error(e)
      toast.error('Güncelleme sırasında hata')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-primary-navy" />
          Profil Bilgileri
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Hesabınıza ait temel kişisel bilgileri buradan güncelleyebilirsiniz.
        </p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={onSave} className="space-y-6">
            <div className="space-y-5">
              {/* İsim Alanı */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                  />
                </div>
              </div>

              {/* Telefon Alanı */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                    placeholder="Örn: +90 555 123 4567"
                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end mt-2">
              <button
                disabled={saving}
                className="h-10 px-6 bg-primary-navy text-white rounded-lg text-sm font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-industrial-gray transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}




