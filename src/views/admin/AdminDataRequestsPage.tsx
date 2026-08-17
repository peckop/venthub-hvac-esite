'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import AdminDataRequestsTableBody from './AdminDataRequestsTableBody'

/**
 * KVKK veri sahibi talep defteri (T063).
 *
 * Cetvel `legal-compliance-standard.md §3.4`: prosedürün elle işletilmesi meşrudur ama
 * **süre ve sonuç ispat yükü altındadır** — "30 gün içinde yanıtladık" demek yetmez,
 * gösterilebilmelidir. Bu ekran o ispatı üreten defterin yüzü: başvuru kanalından
 * (kayıtlı e-posta / KEP) gelen talep buraya işlenir, 30 günlük sayaç izlenir,
 * sonuç ve saklanan-veri notu kaydedilir.
 *
 * Sayfa = başlık + Suspense; veri/URL/filtre state'i gövdede (useSearchParams → Kural 5).
 */
const AdminDataRequestsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.dataRequests.title')}
        description={t('admin.dataRequests.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={6} rows={6} />}>
        <AdminDataRequestsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminDataRequestsPage
