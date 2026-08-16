import React from 'react'

import { adminSectionTitleClass, adminSubtitleClass } from '../../../utils/adminUi'

/**
 * SAYFA BAŞLIĞI — tek uygulama.
 *
 * Neden bileşen: 20 admin sayfası aynı `<header><h1><p></header>` üçlüsünü ELLE
 * tekrarlıyordu. Bugün tutarlılar; sorun tutarsızlık değil, **sürüklenme riski** —
 * 20 kopyada bir kuralı (başlık ağırlığı, boşluk ritmi, aksiyonun yeri) değiştirmek
 * 20 ayrı düzenleme demektir ve pratikte biri daima atlanır. Kabuğun "Siteye dön"
 * linki ve footer'ı tam olarak böyle düşmüştü.
 *
 * Ayrıca sayfa-seviyesi birincil aksiyonun (ör. "Yeni ekle") **tanımlı bir yeri
 * yoktu**; sayfalar onu ya araç çubuğuna ya tablonun üstüne serpiştiriyordu.
 * `actions` yuvası o yeri sözleşmeye bağlar.
 *
 * `<h1>` bilerek: her sayfada tam bir üst-düzey başlık olmalı (SC 1.3.1 / 2.4.6).
 * Kabukta `<h1>` YOK — marka adı bir bağlantı — dolayısıyla çakışma olmaz.
 *
 * Cetvel: docs/standards/admin-design-standard.md §3.2, §3.6, §3.7
 */

interface AdminPageHeaderProps {
  /** Sözlükten çözülmüş başlık — ham literal geçme (kural 7). */
  title: string
  /** Sözlükten çözülmüş açıklama. Kısa sayfalarda atlanabilir. */
  description?: string
  /**
   * Sayfa-seviyesi aksiyonlar (birincil buton, dışa aktarma vb.).
   * Satır/seçim seviyesi aksiyonlar BURAYA GELMEZ — onların yeri araç çubuğu
   * ve toplu-işlem çubuğudur (cetvel §4.1).
   */
  actions?: React.ReactNode
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, description, actions }) => (
  <header className="flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0">
      <h1 className={adminSectionTitleClass}>{title}</h1>
      {description ? <p className={adminSubtitleClass}>{description}</p> : null}
    </div>
    {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
  </header>
)

export default AdminPageHeader
