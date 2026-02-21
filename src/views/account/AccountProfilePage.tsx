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
        <h2 className="text-xl font-bold text-industrial-gray">Profil Bilgileri</h2>
        <p className="text-sm text-steel-gray mt-1">
          Hesabınıza ait temel kişisel bilgileri buradan güncelleyebilirsiniz.
        </p>
      </div>

      <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={onSave} className="space-y-6">
            <div className="space-y-5">
              {/* İsim Alanı */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-industrial-gray flex items-center gap-2">
                  <User className="w-4 h-4 text-steel-gray" />
                  Ad Soyad
                </label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white"
                />
              </div>

              {/* Telefon Alanı */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-industrial-gray flex items-center gap-2">
                  <Phone className="w-4 h-4 text-steel-gray" />
                  Telefon Numarası
                </label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                  placeholder="Örn: +90 555 123 4567"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                disabled={saving}
                className="bg-primary-navy text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-industrial-gray transition-colors flex items-center gap-2"
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




