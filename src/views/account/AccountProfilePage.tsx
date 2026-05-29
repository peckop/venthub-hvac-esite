import React from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { User, Phone, Check, Loader2 } from 'lucide-react'

interface UserMetadata {
  full_name?: string
  phone?: string
  [key: string]: unknown
}

export default function AccountProfilePage() {
  const { t } = useI18n()
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
      toast.success(t('account.profile.toastSuccess'))
    } catch (e) {
      console.error(e)
      toast.error(t('account.profile.toastError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-primary-navy" />
          {t('account.profile.title')}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t('account.profile.subtitle')}
        </p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={onSave} className="space-y-6">
            <div className="space-y-5">
              {/* İsim Alanı */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                  {t('account.profile.fullName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={t('account.profile.fullNamePlaceholder')}
                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                  />
                </div>
              </div>

              {/* Telefon Alanı */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                  {t('account.profile.phone')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                    placeholder={t('account.profile.phonePlaceholder')}
                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:border-primary-navy transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end mt-2">
              <button
                disabled={saving}
                className="h-10 px-6 bg-primary-navy text-white rounded-lg text-sm font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-industrial-gray transition-transform hover:scale-102 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('account.profile.saving')}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> {t('account.profile.save')}
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




