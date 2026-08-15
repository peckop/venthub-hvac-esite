'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { AlertCircle, Crown, Eye, Package, SearchX, Shield, ShieldCheck, Tag, Users } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import ExportMenu from '../../components/admin/ExportMenu'
import { useConfirm } from '../../components/admin/overlay/ConfirmProvider'
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

const ROLE_KEYS: UserRoleCode[] = ['super_admin', 'admin', 'warehouse', 'sales', 'viewer', 'user']

/* ---- lazy genişleyen satır ---- */
interface UserSpecsRowProps {
  userRow: UserRow
}

const UserSpecsRow: React.FC<UserSpecsRowProps> = ({ userRow }) => {
  const { t } = useI18n()
  const [profile, setProfile] = useState<{
    phone?: string | null
    organization_id?: string | null
    updated_at?: string | null
  } | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      const { data } = await supabaseBrowserClient
        .from('user_profiles')
        .select('phone, organization_id, updated_at')
        .eq('id', userRow.id)
        .maybeSingle()
      if (!active) return
      if (data) {
        setProfile(data)
      } else {
        setProfile({})
      }
    })()
    return () => {
      active = false
    }
  }, [userRow.id])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-0.5 bg-cyan-400" />
        <h4 className="text-xs font-black text-cyan-400 uppercase tracking-hvac-relaxed">
          {t('admin.users.expand.title')}
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/spec">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/spec:text-cyan-400/70 transition-colors">
            {t('admin.users.expand.id')}
          </div>
          <div className="text-xs font-mono text-slate-200 break-all select-all">{userRow.id}</div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/spec">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/spec:text-cyan-400/70 transition-colors">
            {t('admin.users.expand.fullName')}
          </div>
          <div className="text-xs font-black text-slate-200 uppercase">{userRow.full_name || '—'}</div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/spec">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/spec:text-cyan-400/70 transition-colors">
            {t('admin.users.expand.phone')}
          </div>
          <div className="text-xs font-black text-slate-200">{profile?.phone || '—'}</div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/spec">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/spec:text-cyan-400/70 transition-colors">
            {t('admin.users.expand.organizationId')}
          </div>
          <div className="text-xs font-black text-slate-200">{profile?.organization_id || '—'}</div>
        </div>
      </div>
    </div>
  )
}

/* ---- toplu işlem araç çubuğu ---- */
interface UserBulkActionToolbarProps {
  selectedCount: number
  onRoleChange: (role: UserRoleCode) => void
  onClearSelection: () => void
}

const UserBulkActionToolbar: React.FC<UserBulkActionToolbarProps> = ({
  selectedCount,
  onRoleChange,
  onClearSelection,
}) => {
  const { t } = useI18n()
  const [showRolePanel, setShowRolePanel] = useState(false)

  if (selectedCount === 0) return null

  return (
    <div className="sticky bottom-4 z-40 mx-auto max-w-4xl animate-slide-up">
      <div className="bg-primary-navy text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-3 flex-wrap">
        {/* Selection Info */}
        <div className="flex items-center gap-2 mr-2">
          <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">{t('admin.toolbar.itemsSelected')}</span>
          <button onClick={onClearSelection} className="text-white/60 hover:text-white text-xs ml-1 underline">
            {t('admin.toolbar.clear')}
          </button>
        </div>

        <div className="h-6 w-px bg-white/20" />

        {/* Change Role Button & Dropdown/Panel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRolePanel(!showRolePanel)}
            className="px-4 py-2 rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <span>{t('admin.users.bulk.changeRole')}</span>
          </button>
          {showRolePanel && (
            <div className="absolute bottom-full mb-2 left-0 bg-surface-deep text-slate-200 rounded-xl shadow-2xl p-4 min-w-240px border border-white/10 glass-strong">
              <div className="text-xs font-black uppercase tracking-widest mb-3 text-cyan-400">
                {t('admin.users.bulk.selectRole')}
              </div>
              <div className="flex flex-col gap-1.5">
                {ROLE_KEYS.map((targetRole) => (
                  <button
                    key={targetRole}
                    type="button"
                    onClick={() => {
                      onRoleChange(targetRole)
                      setShowRolePanel(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-300 rounded-xl hover:bg-white/5 hover:text-white text-left transition-colors"
                  >
                    <div className="text-slate-400 shrink-0">
                      {ROLE_BUTTON_ICON[targetRole]}
                    </div>
                    <span className="uppercase tracking-widest text-xs">
                      {t(`roles.${targetRole}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const AdminUsersTableBody: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const { t, lang } = useI18n()
  const confirm = useConfirm()
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

  const { setFilter } = table.filtering
  const filters = table.filtering.filters
  const activeRoles = useMemo(() => filters.role ?? [], [filters.role])

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

  /* ---- (b) toplu rol değişimi — UPDATE, mutateWithAudit kapısından ---- */
  const bulkRoleChange = useCallback(
    async (newRole: UserRoleCode) => {
      if (!hasWriteAccess) {
        toast.error(t('admin.users.toasts.noPermission'))
        return
      }
      const ids = table.selection.selectedIds
      if (ids.length === 0) return
      const ok = await confirm({
        description: t('admin.users.bulk.confirm', { count: String(ids.length), role: t(`roles.${newRole}`) }),
      })
      if (!ok) return
      try {
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'users',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: null,
          before: null,
          after: { role: newRole, ids },
          auditedByEdge: false,
          fn: async () => {
            const results = await Promise.all(
              ids.map((id) => setUserAdminRole(id, newRole))
            )
            const failedIdx = results.findIndex((success) => !success)
            if (failedIdx !== -1) {
              throw new Error(`role_update_failed_for_${ids[failedIdx]}`)
            }
          },
        })
        table.selection.clear()
        await table.reload()
        toast.success(t('admin.users.toasts.bulkRoleUpdated', { count: String(ids.length), role: t(`roles.${newRole}`) }))
      } catch (e) {
        toast.error(
          e instanceof AdminPermissionError
            ? t('admin.users.toasts.noPermission')
            : t('admin.users.toasts.roleUpdateError'),
        )
      }
    },
    [confirm, hasWriteAccess, t, table],
  )

  /* ---- export (CSV, tüm filtreli sonuç fetchAllForExport) ---- */
  const exportCsv = useCallback(async () => {
    const rows = await table.fetchAllForExport()
    const cols = ['id', 'email', 'full_name', 'role', 'created_at']
    const header = cols.join(',')
    const lines = rows.map((r) =>
      [
        r.id,
        r.email ? `"${r.email.replace(/"/g, '""')}"` : '',
        r.full_name ? `"${r.full_name.replace(/"/g, '""')}"` : '',
        r.role,
        r.created_at || '',
      ].join(','),
    )
    const csv = '\uFEFF' + [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [table])

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

  const roleChips = useMemo(
    () =>
      ROLE_KEYS.map((r) => ({
        key: r,
        label: t(`roles.${r}`),
        active: activeRoles.includes(r),
        onToggle: () => {
          const next = activeRoles.includes(r)
            ? activeRoles.filter((x) => x !== r)
            : [...activeRoles, r]
          setFilter('role', next)
        },
      })),
    [t, activeRoles, setFilter],
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
        expandLabel={t('admin.ui.details')}
        renderExpandedRow={(r) => <UserSpecsRow userRow={r} />}
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
            chips={roleChips}
            recordCount={table.totalMatched}
            onClear={table.filtering.clearAll}
            rightExtra={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <ExportMenu
                  items={[
                    { key: 'csv', label: t('admin.users.export.csvLabel'), onSelect: () => void exportCsv() },
                  ]}
                />
              </div>
            }
          />
        }
        bulkBarSlot={
          hasWriteAccess ? (
            <UserBulkActionToolbar
              selectedCount={table.selection.selectedIds.length}
              onRoleChange={(targetRole) => void bulkRoleChange(targetRole)}
              onClearSelection={table.selection.clear}
            />
          ) : null
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
