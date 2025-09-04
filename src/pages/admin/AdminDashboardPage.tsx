import React from 'react'
import { adminSectionTitleClass, adminCardPaddedClass } from '../../utils/adminUi'

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <header>
        <h1 className={adminSectionTitleClass}>Dashboard</h1>
        <p className="text-industrial-gray text-sm">Hızlı bakış ve son hareketler</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Bugün alınan sipariş</div>
          <div className="text-2xl font-semibold">-</div>
        </div>
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Toplam satış (₺)</div>
          <div className="text-2xl font-semibold">-</div>
        </div>
        <div className={adminCardPaddedClass}>
          <div className="text-xs text-industrial-gray">Bekleyen iadeler</div>
          <div className="text-2xl font-semibold">-</div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-hvac-md p-4">
        <div className="text-sm text-industrial-gray">Bu alan, Sprint 2 kapsamında sipariş istatistikleri ve kısa raporlar için kullanılacak.</div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
