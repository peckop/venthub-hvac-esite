'use client'

import { Crown, Eye, Package, Shield, Tag, Users } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

/**
 * TOPLU ROL DEĞİŞTİRME PANELİ
 *
 * `AdminUsersTableBody` içindeki yerel `UserBulkActionToolbar`'dan çıkarıldı: o
 * bileşen `BulkBar` ile MÜKERRERDİ (aynı işi yapan iki yapışkan toplu-işlem
 * çubuğu). Aynı işlemin sayfadan sayfaya farklı görünmesi cetvel §4'ün doğrudan
 * ihlaliydi. Artık tek bileşen (`BulkBar`), rol paneli `panel` render-prop'una
 * bağlandı.
 *
 * Panel MANTIĞI ve GÖRÜNÜMÜ bilerek OLDUĞU GİBİ taşındı — bu commit birleştirme
 * commit'i, giydirme değil.
 */

export type UserRoleCode = 'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer'

const ROLE_BUTTON_ICON: Record<UserRoleCode, React.ReactNode> = {
  super_admin: <Crown size={14} />,
  admin: <Shield size={14} />,
  warehouse: <Package size={14} />,
  sales: <Tag size={14} />,
  viewer: <Eye size={14} />,
  user: <Users size={14} />,
}

const ROLE_KEYS: UserRoleCode[] = ['super_admin', 'admin', 'warehouse', 'sales', 'viewer', 'user']

export interface BulkRolePanelProps {
  onRoleChange: (role: UserRoleCode) => void
  /** `BulkBar` panel render-prop'undan gelen kapatıcı. */
  onClose: () => void
}

export function BulkRolePanel({ onRoleChange, onClose }: BulkRolePanelProps): React.ReactNode {
  const { t } = useI18n()

  return (
    <div className="bg-admin-bg text-admin-fg rounded-admin-md shadow-admin-lg p-4 min-w-240px border border-admin-border bg-admin-surface">
      <div className="text-xs font-semibold mb-3 text-admin-accent">
        {t('admin.users.bulk.selectRole')}
      </div>
      <div className="flex flex-col gap-1.5">
        {ROLE_KEYS.map((targetRole) => (
          <button
            key={targetRole}
            type="button"
            onClick={() => {
              onRoleChange(targetRole)
              onClose()
            }}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-admin-fg rounded-admin-md hover:bg-admin-surface-2 hover:text-admin-fg text-left transition-colors"
          >
            <div className="text-admin-fg-muted shrink-0">{ROLE_BUTTON_ICON[targetRole]}</div>
            <span className="text-xs">{t(`roles.${targetRole}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default BulkRolePanel
