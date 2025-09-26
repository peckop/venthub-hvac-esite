import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getSupabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

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
      const supabase = await getSupabase()
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName || undefined, phone: phone || undefined }
      })
      if (error) throw error
      // Auth context updated automatically via session
      toast.success('Profil güncellendi')
    } catch (e) {
      console.error(e)
      toast.error('Güncelleme sırasında hata')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-industrial-gray mb-3">Profil Bilgileri</h2>
      <form onSubmit={onSave} className="space-y-3">
        <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Ad Soyad" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <input value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9+\s-]/g,''))} placeholder="Telefon" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <button disabled={saving} className="bg-primary-navy text-white px-4 py-2 rounded-lg disabled:opacity-60">Kaydet</button>
      </form>
    </div>
  )
}

