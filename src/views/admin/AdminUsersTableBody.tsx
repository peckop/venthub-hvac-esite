'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { AlertCircle, Crown, Eye, Package, SearchX, Shield, ShieldCheck, Tag, Users } from 'lucide-react'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import { listAdminUsers, setUserAdminRole } from '../../config/admin'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { formatDate } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import type { Database } from '../../types/database.types'

/* ---- normalize edilmiş satır modeli (her iki sekme tek tipe inilir) ---- */
type UserRoleCode = 'user' | 'admin' | 'super_admin' | 'warehouse' | 'sales' | 'viewer'

interface UserRow {
  id: string
  email?: string
  full_name?: string
  role: string
  created_at: string
}

type UsersTab = 'admins' | 'all'

/** RPC profil satırı (full_name zenginleştirmesi için) */
interface ProfileLite {
  id: string
  full_name?: string | null
}

interface AllProfileRow {
  id: string
  role?: string | null
  created_at: string
  full_name?: string | null
}

/** rol kodunu normalize et — null/boş → 'user' */
function normalizeRole(raw: string | null | undefined): string {
  return raw && raw.length > 0 ? raw : 'user'
}

const ROLE_BUTTON_ICON: Record<UserRoleCode, React.ReactNode> = {
  super_admin: <Crown size={14} />,
  admin: <Shield size={14} />,
  warehouse: <Package size={14} />,
  sales: <Tag size={14} />,
  viewer: <Eye size={14} />,
  user: <Users size={14} />,
}

const ROLE_BUTTON_TONE: Record<UserRoleCode, string> = {
  super_admin: 'text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50',
  admin: 'text-indigo-400 hover:bg-indigo-400/10 hover:border-indigo-400/50',
  warehouse: 'text-orange-400 hover:bg-orange-400/10 hover:border-orange-400/50',
  sales: 'text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50',
  viewer: 'text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/50',
  user: 'text-slate-400 hover:bg-white/10 hover:border-white/20',
}

const AdminUsersTableBody: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const { role, canWrite } = useRole()
  const hasWriteAccess = canWrite('users')

  const [activeTab, setActiveTab] = useState<UsersTab>('admins')
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  // fetcher hangi sekmeyi okuyacağını ref'ten alır (tek table instance)
  const tabRef = useRef<UsersTab>('admins')

  /* ---- fetcher (DI: ilk param supabase) — sekmeye göre iki yol, tek UserRow'a normalize ---- */
  const usersFetcher = useCallback(
    async (supabase: SupabaseClient<Database>, _params: FetchParams): Promise<FetchResult<UserRow>> => {
      if (tabRef.current === 'admins') {
        await ensureSessionFresh()
        const data = await listAdminUsers()
        const ids = data.map((u) => u.id)
        let profiles: ProfileLite[] = []
        if (ids.length > 0) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', ids)
          profiles = (profileData as ProfileLite[]) || []
        }
        const rows: UserRow[] = data.map((u) => ({
          id: u.id,
          email: u.email,
          full_name: profiles.find((p) => p.id === u.id)?.full_name ?? u.full_name ?? undefined,
          role: normalizeRole(u.role),
          created_at: u.created_at,
        }))
        return { rows, totalMatched: rows.length }
      }

      // tab === 'all'
      await ensureSessionFresh()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, role, created_at, full_name')
      if (error) throw error
      const rows: UserRow[] = ((data as AllProfileRow[]) || []).map((p) => ({
        id: p.id,
        email: undefined,
        full_name: p.full_name ?? undefined,
        role: normalizeRole(p.role),
        created_at: p.created_at,
      }))
      return { rows, totalMatched: rows.length }
    },
    [],
  )

  const table = useAdminTable<UserRow>({
    resource: 'users',
    rowId: (r) => r.id,
    fetcher: usersFetcher,
    paginationMode: 'none',
    sortMode: 'client',
    initialSort: { key: 'created_at', dir: 'desc' },
    syncUrl: true,
  })

  const switchTab = useCallback(
    (next: UsersTab) => {
      if (tabRef.current === next) return
      tabRef.current = next
      setActiveTab(next)
      void table.reload()
    },
    [table],
  )

  /* ---- rol değişimi — K3+K4 mutateWithAudit kapısından ---- */
  const handleRoleChange = useCallback(
    async (row: UserRow, newRole: UserRoleCode) => {
      if (!hasWriteAccess) {
        toast.error(t('admin.users.toasts.noPermission'))
        return
      }
      try {
        setUpdatingRole(row.id)
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'users',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: row.id,
          before: { role: row.role },
          after: { role: newRole },
          auditedByEdge: false,
          fn: async () => {
            const success = await setUserAdminRole(row.id, newRole)
            if (!success) throw new Error('role_update_failed')
          },
        })
        toast.success(t('admin.users.toasts.roleUpdated', { role: t(`roles.${newRole}`) }))
        await table.reload()
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.users.toasts.noPermission')
            : t('admin.users.toasts.roleUpdateError'),
        )
      } finally {
        setUpdatingRole(null)
      }
    },
    [hasWriteAccess, t, table],
  )

  const getRoleIcon = useCallback((roleCode: string) => {
    switch (roleCode) {
      case 'super_admin':
        return <Crown className="text-purple-400" size={14} />
      case 'admin':
        return <Shield className="text-indigo-400" size={14} />
      case 'warehouse':
      case 'sales':
        return <ShieldCheck className="text-cyan-400" size={14} />
      default:
        return <Users className="text-slate-500" size={14} />
    }
  }, [])

  const UserAvatar = useCallback(({ name, email }: { name?: string; email?: string }) => {
    const initial = (name || email || '?').charAt(0).toUpperCase()
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-cyan-400 font-black border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0">
        {initial}
      </div>
    )
  }, [])

  /* ---- rol aksiyon butonu (6 kapılı buton bu yardımcıdan üretilir) ---- */
  const RoleButton = useCallback(
    ({ row, target, disabled }: { row: UserRow; target: UserRoleCode; disabled: boolean }) => (
      <button
        type="button"
        onClick={() => handleRoleChange(row, target)}
        disabled={disabled}
        className={`w-8 h-8 rounded-xl glass border border-white/5 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${ROLE_BUTTON_TONE[target]}`}
        title={t(`admin.users.actionTitles.${target}`)}
        aria-label={t(`admin.users.actionTitles.${target}`)}
      >
        {ROLE_BUTTON_ICON[target]}
      </button>
    ),
    [handleRoleChange, t],
  )

  /* ---- kolonlar (SSOT) ---- */
  const columns = useMemo<AdminColumn<UserRow>[]>(
    () => [
      {
        key: 'user',
        header: t('admin.users.table.user'),
        hideable: true,
        cell: (r) => (
          <div className="flex items-center gap-4">
            <UserAvatar name={r.full_name || undefined} email={r.email} />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-100 truncate uppercase tracking-tight">
                {r.email ? r.email : t('admin.users.noEmail')}
              </span>
              {r.full_name && (
                <span className="text-xs text-slate-500 font-bold truncate uppercase tracking-widest mt-0.5">
                  {r.full_name}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: t('admin.users.table.role'),
        hideable: true,
        cell: (r) => (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-white/5 text-xs font-black uppercase tracking-widest shadow-lg group-hover:border-cyan-400/30 transition-shadow duration-500">
            {getRoleIcon(r.role)}
            <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">
              {t(`roles.${r.role}`)}
            </span>
          </div>
        ),
      },
      {
        key: 'created_at',
        header: t('admin.users.table.created'),
        sortable: true,
        hideable: true,
        cell: (r) => (
          <div className="flex flex-col">
            <span className="text-slate-200 font-black text-xs tabular-nums tracking-tight">
              {r.created_at ? formatDate(r.created_at, lang as 'tr' | 'en') : t('admin.users.noEmail')}
            </span>
            <span className="text-xs text-slate-600 uppercase font-black tracking-widest mt-0.5">
              {t('admin.users.table.createdLabel')}
            </span>
          </div>
        ),
      },
      {
        key: 'actions',
        header: t('admin.users.table.actions'),
        align: 'center',
        hideable: true,
        cell: (r) => {
          const isActor = role === 'super_admin' || role === 'admin'
          const isSelf = r.id === user?.id
          // super_admin korumalı: yalnız super_admin başka bir super_admin'i değiştirebilir
          const targetProtected = r.role === 'super_admin' && role !== 'super_admin'
          const busy = updatingRole === r.id
          return (
            <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-transform duration-300 translate-x-2 group-hover:translate-x-0">
              {r.role !== 'super_admin' && role === 'super_admin' && (
                <RoleButton row={r} target="super_admin" disabled={busy || !hasWriteAccess} />
              )}
              {r.role !== 'admin' && isActor && (
                <RoleButton row={r} target="admin" disabled={busy || !hasWriteAccess || targetProtected} />
              )}
              {r.role !== 'warehouse' && isActor && (
                <RoleButton row={r} target="warehouse" disabled={busy || !hasWriteAccess || targetProtected} />
              )}
              {r.role !== 'sales' && isActor && (
                <RoleButton row={r} target="sales" disabled={busy || !hasWriteAccess || targetProtected} />
              )}
              {r.role !== 'viewer' && isActor && (
                <RoleButton row={r} target="viewer" disabled={busy || !hasWriteAccess || targetProtected} />
              )}
              {r.role !== 'user' && isActor && (
                <RoleButton row={r} target="user" disabled={busy || isSelf || !hasWriteAccess || targetProtected} />
              )}
            </div>
          )
        },
      },
    ],
    [t, lang, role, user?.id, updatingRole, hasWriteAccess, UserAvatar, getRoleIcon, RoleButton],
  )

  // Sayaç yalnız AKTİF sekme için (kit'in totalMatched'i = yüklü sekme).
  const activeCount = table.totalMatched

  const accessDenied = (
    <div className="flex flex-col items-center justify-center min-h-50vh space-y-4">
      <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 shadow-xl shadow-red-500/5">
        <AlertCircle className="text-red-500" size={48} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          {t('admin.users.accessDeniedTitle')}
        </h2>
        <p className="text-slate-500 mt-2 max-w-sm font-medium">{t('admin.users.accessDeniedDesc')}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* sekme pilleri — kit'in ÜSTÜNDE; sayaç yalnız AKTİF sekme için */}
      <div className="flex glass bg-white/5 p-1 rounded-2xl w-fit border border-white/10 shadow-2xl">
        <button
          type="button"
          onClick={() => switchTab('admins')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
            activeTab === 'admins'
              ? 'bg-cyan-400 text-surface-deep shadow-glow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {t('admin.users.tabs.admins', { count: activeTab === 'admins' ? activeCount : 0 })}
        </button>
        <button
          type="button"
          onClick={() => switchTab('all')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
            activeTab === 'all'
              ? 'bg-cyan-400 text-surface-deep shadow-glow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {t('admin.users.tabs.all', { count: activeTab === 'all' ? activeCount : 0 })}
        </button>
      </div>

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="users"
        hasWriteAccess={hasWriteAccess}
        hasReadAccess={isAdmin}
        accessDeniedState={accessDenied}
        emptyState={
          <AdminEmptyState
            icon={Users}
            title={t('admin.users.emptyTitle')}
            description={t('admin.users.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.users.emptyTitle')}
            description={t('admin.users.filterEmptyDescription')}
          />
        }
        columnsButtonLabel={t('admin.users.columnsButton')}
        toolbarSlot={
          <AdminToolbar
            storageKey="toolbar:users"
            sticky
            search={{
              value: table.filtering.query,
              onChange: table.filtering.setQuery,
              placeholder: t('admin.users.searchPlaceholder'),
              focusShortcut: '/',
            }}
            recordCount={table.totalMatched}
            onClear={table.filtering.clearAll}
          />
        }
      />

      {/* Rol Yetkilendirme Rehberi — kit'in ALTINDA */}
      <div className="glass-strong p-8 lg:p-10 rounded-hvac-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 blur-120 rounded-full -mr-48 -mt-48 group-hover:bg-cyan-400/10 transition-colors duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-16 h-16 rounded-hvac-lg glass-strong border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-700">
            <Shield size={32} />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-white text-xl uppercase tracking-tight tracking-widest">
              {t('admin.users.info.title')}
            </h2>
            <p className="text-slate-500 text-sm mt-2 mb-8 font-bold uppercase tracking-hvac-snug">
              {t('admin.users.info.subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-hvac-xl hover:border-cyan-400/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-amber-500 group-hover/item:scale-110 transition-transform">
                    <Crown size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-hvac-normal text-white">
                    {t('roles.superadmin')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                  {t('admin.users.roles.superadmin')}
                </p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-hvac-xl hover:border-cyan-400/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-indigo-400 group-hover/item:scale-110 transition-transform">
                    <Shield size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-hvac-normal text-white">
                    {t('roles.admin')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                  {t('admin.users.roles.admin')}
                </p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-hvac-xl hover:border-cyan-400/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-orange-400 group-hover/item:scale-110 transition-transform">
                    <Package size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-hvac-normal text-white">
                    {t('roles.warehouse')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                  {t('admin.users.roles.warehouse')}
                </p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-hvac-xl hover:border-cyan-400/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform">
                    <Tag size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-hvac-normal text-white">
                    {t('roles.sales')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                  {t('admin.users.roles.sales')}
                </p>
              </div>
              <div className="glass bg-white/5 border border-white/5 p-5 rounded-hvac-xl hover:border-cyan-400/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-emerald-400 group-hover/item:scale-110 transition-transform">
                    <Eye size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-hvac-normal text-white">
                    {t('roles.viewer')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                  {t('admin.users.roles.viewer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsersTableBody
