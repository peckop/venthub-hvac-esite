import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

const AccessDenied: React.FC = () => {
    const { t } = useI18n()

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    Yetkisiz Erişim
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    Bu sayfayı görüntülemek veya bu işlemi yapmak için gerekli yetkilere sahip değilsiniz. Lütfen sistem yöneticinizle iletişime geçin.
                </p>

                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t('admin.ui.backToDashboard') || 'Dashboard\'a Dön'}
                </Link>
            </div>
        </div>
    )
}

export default AccessDenied
