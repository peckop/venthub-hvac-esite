'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { AlertCircle, Crown, Eye, Package, Receipt, SearchX, Shield, ShieldCheck, Tag, Users } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { type BulkAction, BulkBar } from '../../components/admin/data-table/BulkBar'
import BulkRolePanel from '../../components/admin/data-table/BulkRolePanel'
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
import { adminTableActionClass } from '../../utils/adminUi'

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
  super_admin: 'text-admin-warning hover:bg-admin-warning-weak hover:border-admin-warning/30',
  admin: 'text-admin-accent hover:bg-admin-accent-weak hover:border-admin-accent/30',
  warehouse: 'text-admin-warning hover:bg-admin-warning-weak hover:border-admin-warning/30',
  sales: 'text-admin-accent hover:bg-admin-accent-weak hover:border-admin-accent/30',
  viewer: 'text-admin-success hover:bg-admin-success-weak hover:border-admin-success/30',
  user: 'text-admin-fg-muted hover:bg-admin-surface-3 hover:border-admin-border',
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
        <div className="w-8 h-0.5 bg-admin-accent" />
        <h4 className="text-xs font-semibold text-admin-accent">
          {t('admin.users.expand.title')}
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-admin-surface p-4 rounded-admin-lg border border-admin-border hover:border-admin-border transition-colors group/spec">
          <div className="text-xs text-admin-fg-muted font-bold mb-1 group-hover/spec:text-admin-accent transition-colors">
            {t('admin.users.expand.id')}
          </div>
          <div className="text-xs font-mono text-admin-fg break-all select-all">{userRow.id}</div>
        </div>

        <div className="bg-admin-surface p-4 rounded-admin-lg border border-admin-border hover:border-admin-border transition-colors group/spec">
          <div className="text-xs text-admin-fg-muted font-bold mb-1 group-hover/spec:text-admin-accent transition-colors">
            {t('admin.users.expand.fullName')}
          </div>
          <div className="text-xs font-semibold text-admin-fg">{userRow.full_name || '—'}</div>
        </div>

        <div className="bg-admin-surface p-4 rounded-admin-lg border border-admin-border hover:border-admin-border transition-colors group/spec">
          <div className="text-xs text-admin-fg-muted font-bold mb-1 group-hover/spec:text-admin-accent transition-colors">
            {t('admin.users.expand.phone')}
          </div>
          <div className="text-xs font-semibold text-admin-fg">{profile?.phone || '—'}</div>
        </div>

        <div className="bg-admin-surface p-4 rounded-admin-lg border border-admin-border hover:border-admin-border transition-colors group/spec">
          <div className="text-xs text-admin-fg-muted font-bold mb-1 group-hover/spec:text-admin-accent transition-colors">
            {t('admin.users.expand.organizationId')}
          </div>
          <div className="text-xs font-semibold text-admin-fg">{profile?.organization_id || '—'}</div>
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

/** Sıralanabilir sütun → DB kolonu. Bilinmeyen anahtar `created_at`e düşer. */
const USER_SORT_COLUMNS: Record<string, string> = {
  created_at: 'created_at',
  role: 'role',
  full_name: 'full_name',
}

/** `admins` dalı için JS sıralaması — RPC sayfa/sıra parametresi almıyor. */
function sortUserRows(rows: UserRow[], sort: { key: string; dir: 'asc' | 'desc' } | null | undefined): UserRow[] {
  const key = sort?.key ?? 'created_at'
  const factor = sort?.dir === 'asc' ? 1 : -1
  /*
    Anahtar erişimi AÇIKÇA yazılıyor. Dinamik indeksleme için `as unknown as
    Record<string, unknown>` yazmak proje kuralınca yasak (ESLint `no-restricted-syntax`)
    ve haklı: cast, bilinmeyen bir sıralama anahtarını sessizce boş stringe çevirip
    "sıralandı ama sıra yanlış" durumu üretirdi. Switch, desteklenmeyen anahtarı
    varsayılana düşürdüğünü GÖRÜNÜR kılar.
  */
  const valueOf = (row: UserRow): string => {
    switch (key) {
      case 'full_name':
        return row.full_name ?? ''
      case 'role':
        return row.role
      case 'email':
        return row.email ?? ''
      default:
        return row.created_at
    }
  }

  return [...rows].sort((a, b) => valueOf(a).localeCompare(valueOf(b), 'tr') * factor)
}

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
        const allRows: UserRow[] = data.map((u) => ({
          id: u.id,
          email: u.email,
          full_name: profiles.find((p) => p.id === u.id)?.full_name ?? u.full_name ?? undefined,
          role: normalizeRole(u.role),
          created_at: u.created_at,
        }))

        /*
          `admin_list_users` RPC'si TAM listeyi döndürür (personel sayısı tanım gereği
          küçük), sayfa parametresi almaz. Sıralama ve dilimleme bu yüzden burada
          yapılıyor — ama tablo sözleşmesi ile AYNI kalıyor: `totalMatched` sayfa
          uzunluğu değil, kaynaktaki gerçek sayı. İki dal farklı yerden veri alsa da
          dışarıya tek davranış gösteriyor.
        */
        const term = _params.query.trim().toLocaleLowerCase('tr')
        const filtered = term
          ? allRows.filter(
              (r) =>
                (r.full_name ?? '').toLocaleLowerCase('tr').includes(term) ||
                (r.email ?? '').toLocaleLowerCase('tr').includes(term),
            )
          : allRows

        const sorted = sortUserRows(filtered, _params.sort)
        const offset = (_params.page - 1) * _params.pageSize
        return {
          rows: sorted.slice(offset, offset + _params.pageSize),
          totalMatched: filtered.length,
        }
      }

      // tab === 'all'
      await ensureSessionFresh()
      /*
        SESSİZ TAVAN ONARIMI (T059-VH). Eskiden sorguda ne `range` ne `limit` vardı ve
        tablo `paginationMode: 'none'` ile çalışıyordu. PostgREST kendi azami satır
        sınırını uygular (varsayılan 1000) ve BUNU HABER VERMEZ: 1001. kullanıcıdan
        sonrası listede hiç görünmez, toplam sayı da doğru sanılır. Yani hata
        "yavaşlama" olarak değil, VERİNİN YOKLUĞU olarak ortaya çıkardı.
        Artık sayfa aralığı açıkça isteniyor ve gerçek toplam `count: 'exact'`ten
        geliyor; `totalMatched` sayfa uzunluğu değil, kaynaktaki gerçek sayı.
      */
      const offset = (_params.page - 1) * _params.pageSize
      const sortColumn = USER_SORT_COLUMNS[_params.sort?.key ?? ''] ?? 'created_at'
      let allQuery = supabase
        .from('user_profiles')
        .select('id, role, created_at, full_name', { count: 'exact' })
        .order(sortColumn, { ascending: _params.sort?.dir === 'asc' })

      const term = _params.query.trim()
      if (term) allQuery = allQuery.ilike('full_name', `%${term}%`)

      const { data, error, count } = await allQuery.range(offset, offset + _params.pageSize - 1)
      if (error) throw error
      const rows: UserRow[] = ((data as AllProfileRow[]) || []).map((p) => ({
        id: p.id,
        email: undefined,
        full_name: p.full_name ?? undefined,
        role: normalizeRole(p.role),
        created_at: p.created_at,
      }))
      return { rows, totalMatched: typeof count === 'number' ? count : rows.length }
    },
    [],
  )

  const table = useAdminTable<UserRow>({
    resource: 'users',
    rowId: (r) => r.id,
    fetcher: usersFetcher,
    // Sayfalama ve sıralama SUNUCUDA: istemci sıralaması yalnız görünen sayfayı
    // sıralar ve kullanıcıya "en yenisi bu" diye yanlış bir liste gösterirdi.
    paginationMode: 'server',
    sortMode: 'server',
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

  /**
   * Toplu işlem eylemleri — ortak `BulkBar` sözleşmesi. Rol paneli `BulkRolePanel`
   * olarak çıkarıldı ve `panel` render-prop'una bağlandı (bkz. dosya üstü yorum).
   */
  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        key: 'role',
        label: t('admin.users.bulk.changeRole'),
        tone: 'default',
        panel: (close) => (
          <BulkRolePanel onRoleChange={(r) => void bulkRoleChange(r)} onClose={close} />
        ),
      },
    ],
    [t, bulkRoleChange],
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
        return <Crown className="text-admin-accent" size={14} />
      case 'admin':
        return <Shield className="text-admin-accent" size={14} />
      case 'warehouse':
      case 'sales':
        return <ShieldCheck className="text-admin-accent" size={14} />
      default:
        return <Users className="text-admin-fg-muted" size={14} />
    }
  }, [])

  const UserAvatar = useCallback(({ name, email }: { name?: string; email?: string }) => {
    const initial = (name || email || '?').charAt(0).toUpperCase()
    return (
      <div className="w-10 h-10 rounded-admin-md bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-admin-accent font-semibold border border-admin-border shadow-admin-md group-hover:scale-110 transition-transform duration-500 shrink-0">
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
        className={`w-8 h-8 rounded-admin-md bg-admin-surface border border-admin-border flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${ROLE_BUTTON_TONE[target]}`}
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
              <span className="font-semibold text-admin-fg truncate tracking-tight">
                {r.email ? r.email : t('admin.users.noEmail')}
              </span>
              {r.full_name && (
                <span className="text-xs text-admin-fg-muted font-bold truncate mt-0.5">
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-admin-md bg-admin-surface border border-admin-border text-xs font-semibold shadow-admin-md group-hover:border-admin-accent/30 transition-shadow duration-500">
            {getRoleIcon(r.role)}
            <span className="text-admin-fg group-hover:text-admin-accent transition-colors">
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
            <span className="text-admin-fg font-semibold text-xs tabular-nums tracking-tight">
              {r.created_at ? formatDate(r.created_at, lang as 'tr' | 'en') : t('admin.users.noEmail')}
            </span>
            <span className="text-xs text-admin-fg-subtle font-semibold mt-0.5">
              {t('admin.users.table.createdLabel')}
            </span>
          </div>
        ),
      },
      {
        /*
          "BU MÜŞTERİNİN SİPARİŞLERİ" — T059-VH.
          Ayrı bir sütun, aksiyonların İÇİNE konmadı: aksiyon kabı
          `opacity-0 group-hover:opacity-100` ile gizli ve klavye kullanıcısı onu
          keşfedemez. Bağlantı bir GEZİNME yolu, fareyle keşfedilen bir aksiyon değil.

          Ayrı bir "müşteri detayı" sayfası da açılmadı: sipariş tablosu zaten arama,
          sıralama, sayfalama, dışa aktarma ve satır aksiyonlarını taşıyor. İkinci bir
          ekran bunların hepsini yeniden (ve zamanla farklı) uygulamak olurdu.
        */
        key: 'orders',
        header: t('admin.users.table.orders'),
        align: 'center',
        hideable: true,
        cell: (r) => (
          <Link
            href={`/admin/orders?customer=${encodeURIComponent(r.id)}` as Route}
            className={`${adminTableActionClass} gap-1.5`}
            aria-label={t('admin.users.actions.viewOrdersFor', {
              user: r.full_name || r.email || r.id.slice(0, 8),
            })}
          >
            <Receipt size={12} aria-hidden="true" />
            {t('admin.users.actions.viewOrders')}
          </Link>
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
      <div className="p-6 bg-admin-danger-weak rounded-admin-lg border border-admin-danger/30 shadow-admin-lg shadow-red-500/5">
        <AlertCircle className="text-admin-danger" size={48} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-admin-fg tracking-tight">
          {t('admin.users.accessDeniedTitle')}
        </h2>
        <p className="text-admin-fg-muted mt-2 max-w-sm font-medium">{t('admin.users.accessDeniedDesc')}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* sekme pilleri — kit'in ÜSTÜNDE; sayaç yalnız AKTİF sekme için */}
      <div className="flex bg-admin-surface bg-admin-surface-2 p-1 rounded-admin-lg w-fit border border-admin-border shadow-admin-lg">
        <button
          type="button"
          onClick={() => switchTab('admins')}
          className={`px-6 py-2.5 rounded-admin-md text-xs font-semibold transition-colors duration-300 ${
            activeTab === 'admins'
              ? 'bg-admin-accent text-admin-accent-fg'
              : 'text-admin-fg-muted hover:text-admin-fg hover:bg-admin-surface-2'
          }`}
        >
          {t('admin.users.tabs.admins', { count: activeTab === 'admins' ? activeCount : 0 })}
        </button>
        <button
          type="button"
          onClick={() => switchTab('all')}
          className={`px-6 py-2.5 rounded-admin-md text-xs font-semibold transition-colors duration-300 ${
            activeTab === 'all'
              ? 'bg-admin-accent text-admin-accent-fg'
              : 'text-admin-fg-muted hover:text-admin-fg hover:bg-admin-surface-2'
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
            <BulkBar
              selectedCount={table.selection.selectedIds.length}
              selectedLabel={t('admin.dataTable.bulk.selectedCount', {
                count: table.selection.selectedIds.length,
              })}
              clearLabel={t('admin.dataTable.bulk.clear')}
              actions={bulkActions}
              onClear={table.selection.clear}
            />
          ) : null
        }
      />

      {/* Rol Yetkilendirme Rehberi — kit'in ALTINDA */}
      <div className="bg-admin-surface p-8 lg:p-10 rounded-admin-lg border border-admin-border shadow-admin-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-admin-accent-weak blur-120 rounded-full -mr-48 -mt-48 group-hover:bg-admin-accent-weak transition-colors duration-1000" />
        <div className="relative z-raised flex flex-col md:flex-row gap-8 items-start">
          <div className="w-16 h-16 rounded-admin-md bg-admin-surface border border-admin-border flex items-center justify-center text-admin-accent shrink-0 shadow-admin-lg group-hover:scale-110 transition-transform duration-700">
            <Shield size={32} />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-admin-fg text-xl tracking-tight">
              {t('admin.users.info.title')}
            </h2>
            <p className="text-admin-fg-muted text-sm mt-2 mb-8 font-bold">
              {t('admin.users.info.subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-admin-surface bg-admin-surface-2 border border-admin-border p-5 rounded-admin-lg hover:border-admin-accent/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-admin-md bg-admin-surface border border-admin-border flex items-center justify-center text-admin-warning group-hover/item:scale-110 transition-transform">
                    <Crown size={16} />
                  </div>
                  <span className="text-xs font-semibold text-admin-fg">
                    {t('roles.superadmin')}
                  </span>
                </div>
                <p className="text-xs text-admin-fg-muted font-bold leading-relaxed tracking-wide">
                  {t('admin.users.roles.superadmin')}
                </p>
              </div>
              <div className="bg-admin-surface bg-admin-surface-2 border border-admin-border p-5 rounded-admin-lg hover:border-admin-accent/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-admin-md bg-admin-surface border border-admin-border flex items-center justify-center text-admin-accent group-hover/item:scale-110 transition-transform">
                    <Shield size={16} />
                  </div>
                  <span className="text-xs font-semibold text-admin-fg">
                    {t('roles.admin')}
                  </span>
                </div>
                <p className="text-xs text-admin-fg-muted font-bold leading-relaxed tracking-wide">
                  {t('admin.users.roles.admin')}
                </p>
              </div>
              <div className="bg-admin-surface bg-admin-surface-2 border border-admin-border p-5 rounded-admin-lg hover:border-admin-accent/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-admin-md bg-admin-surface border border-admin-border flex items-center justify-center text-admin-warning group-hover/item:scale-110 transition-transform">
                    <Package size={16} />
                  </div>
                  <span className="text-xs font-semibold text-admin-fg">
                    {t('roles.warehouse')}
                  </span>
                </div>
                <p className="text-xs text-admin-fg-muted font-bold leading-relaxed tracking-wide">
                  {t('admin.users.roles.warehouse')}
                </p>
              </div>
              <div className="bg-admin-surface bg-admin-surface-2 border border-admin-border p-5 rounded-admin-lg hover:border-admin-accent/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-admin-md bg-admin-surface border border-admin-border flex items-center justify-center text-admin-accent group-hover/item:scale-110 transition-transform">
                    <Tag size={16} />
                  </div>
                  <span className="text-xs font-semibold text-admin-fg">
                    {t('roles.sales')}
                  </span>
                </div>
                <p className="text-xs text-admin-fg-muted font-bold leading-relaxed tracking-wide">
                  {t('admin.users.roles.sales')}
                </p>
              </div>
              <div className="bg-admin-surface bg-admin-surface-2 border border-admin-border p-5 rounded-admin-lg hover:border-admin-accent/30 transition-colors duration-500 group/item">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-admin-md bg-admin-surface border border-admin-border flex items-center justify-center text-admin-success group-hover/item:scale-110 transition-transform">
                    <Eye size={16} />
                  </div>
                  <span className="text-xs font-semibold text-admin-fg">
                    {t('roles.viewer')}
                  </span>
                </div>
                <p className="text-xs text-admin-fg-muted font-bold leading-relaxed tracking-wide">
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
