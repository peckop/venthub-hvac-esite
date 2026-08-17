'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { AlertTriangle, CheckCircle2, Clock, Plus, SearchX, ShieldCheck, ShieldQuestion } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { computeDueState, isTerminalStatus } from '@/lib/kvkk/dueState'
import {
  createDataSubjectRequest,
  type DataSubjectRequest,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  type RequestStatus,
  type RequestType,
  updateDataSubjectRequest,
} from '@/lib/services/dataSubjectRequest.service'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { DataTableKit } from '../../components/admin/data-table/DataTableKit'
import type { AdminColumn } from '../../components/admin/data-table/types'
import { AdminModal } from '../../components/admin/overlay/AdminModal'
import { type FetchParams, type FetchResult, useAdminTable } from '../../hooks/useAdminTable'
import { useRole } from '../../hooks/useRole'
import { formatDate } from '../../i18n/datetime'
import { useI18n } from '../../i18n/I18nProvider'
import type { Database } from '../../types/database.types'
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminInputClass,
  adminSelectClass,
  adminSelectStyle,
  adminTableActionPrimaryClass,
} from '../../utils/adminUi'

/**
 * KVKK talep defteri gövdesi — client-mode (kayıt hacmi düşük, süre sıralaması kritik).
 *
 * Varsayılan sıralama `due_at` ARTAN: en yakın son tarih üstte. Gecikme durumu
 * `computeDueState` saf fonksiyonundan gelir ve `due_at`'ı DB'den okur — 30 gün
 * burada YENİDEN HESAPLANMAZ (INV-KVKK-1 R2).
 *
 * AUDIT'TE VERİ MİNİMİZASYONU: `before`/`after` payload'ına başvuran e-postası
 * YAZILMAZ. Talebin kendisi zaten defterde; denetim izine kişisel veriyi ikinci kez
 * kopyalamak KVKK veri minimizasyonuna aykırı olurdu (cetvel §3.5).
 */
const AdminDataRequestsTableBody: React.FC = () => {
  const { t, lang } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('data_requests')

  const fetcher = useCallback(
    async (
      supabase: SupabaseClient<Database>,
      _params: FetchParams,
    ): Promise<FetchResult<DataSubjectRequest>> => {
      const { data, error } = await supabase
        .from('data_subject_requests')
        .select('*')
        .order('due_at', { ascending: true })
      if (error) throw error
      const rows = data ?? []
      return { rows, totalMatched: rows.length }
    },
    [],
  )

  const table = useAdminTable<DataSubjectRequest>({
    resource: 'data-requests',
    rowId: (r) => r.id,
    fetcher,
    paginationMode: 'client',
    sortMode: 'client',
    pageSize: 50,
    initialSort: { key: 'due_at', dir: 'asc' },
    syncUrl: true,
  })

  /* ---- kayıt açma ---- */
  const [createOpen, setCreateOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [reqType, setReqType] = useState<RequestType>('access')
  const [identityVerified, setIdentityVerified] = useState(false)
  const [saving, setSaving] = useState(false)

  /* ---- ilerletme ---- */
  const [advanceRow, setAdvanceRow] = useState<DataSubjectRequest | null>(null)
  const [nextStatus, setNextStatus] = useState<RequestStatus>('in_progress')
  const [outcome, setOutcome] = useState('')
  const [retainedNote, setRetainedNote] = useState('')

  const now = useMemo(() => new Date(), [])

  const handleCreate = async () => {
    if (!email.trim() || saving) return
    setSaving(true)
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'data_requests',
        action: 'INSERT',
        rowPk: null,
        canWrite: hasWriteAccess,
        before: null,
        after: null,
        // Denetim izi: talep TÜRÜ ve kimlik-tevsik durumu yeter; e-posta YAZILMAZ.
        afterFrom: (row) => ({
          id: row.id,
          request_type: row.request_type,
          identity_verified: row.identity_verified_at !== null,
          due_at: row.due_at,
        }),
        // INV-6: servise-delege yazımda `await` ZORUNLU — bekçi gerçek-etkiyi ondan tanır.
        fn: async () =>
          await createDataSubjectRequest(supabaseBrowserClient, {
            applicant_email: email.trim(),
            request_type: reqType,
            identity_verified_at: identityVerified ? new Date().toISOString() : null,
          }),
      })
      toast.success(t('admin.dataRequests.toasts.created'))
      setCreateOpen(false)
      setEmail('')
      setIdentityVerified(false)
      await table.reload()
    } catch (err) {
      console.error('[data-requests] create failed:', err)
      toast.error(t('admin.dataRequests.toasts.createError'))
    } finally {
      setSaving(false)
    }
  }

  const handleAdvance = async () => {
    if (!advanceRow || saving) return
    const finalizing = isTerminalStatus(nextStatus)
    if (finalizing && !outcome.trim()) {
      toast.error(t('admin.dataRequests.toasts.outcomeRequired'))
      return
    }
    const target = advanceRow
    setSaving(true)
    try {
      await mutateWithAudit(supabaseBrowserClient, {
        resource: 'data_requests',
        action: 'UPDATE',
        rowPk: target.id,
        canWrite: hasWriteAccess,
        before: {
          status: target.status,
          outcome: target.outcome,
          retained_data_note: target.retained_data_note,
        },
        after: {
          status: nextStatus,
          outcome: outcome.trim() || null,
          retained_data_note: retainedNote.trim() || null,
        },
        fn: async () =>
          await updateDataSubjectRequest(supabaseBrowserClient, target.id, {
            status: nextStatus,
            outcome: outcome.trim() || null,
            retained_data_note: retainedNote.trim() || null,
          }),
      })
      toast.success(t('admin.dataRequests.toasts.updated'))
      setAdvanceRow(null)
      setOutcome('')
      setRetainedNote('')
      await table.reload()
    } catch (err) {
      console.error('[data-requests] update failed:', err)
      toast.error(t('admin.dataRequests.toasts.updateError'))
    } finally {
      setSaving(false)
    }
  }

  const columns: AdminColumn<DataSubjectRequest>[] = useMemo(
    () => [
      {
        key: 'applicant_email',
        header: t('admin.dataRequests.table.applicant'),
        sortable: true,
        cell: (r) => <span className="font-medium text-admin-fg">{r.applicant_email}</span>,
      },
      {
        key: 'request_type',
        header: t('admin.dataRequests.table.type'),
        sortable: true,
        facetAccessor: (r) => r.request_type,
        cell: (r) => <span>{t(`admin.dataRequests.types.${r.request_type}`)}</span>,
      },
      {
        key: 'status',
        header: t('admin.dataRequests.table.status'),
        sortable: true,
        facetAccessor: (r) => r.status,
        cell: (r) => <span>{t(`admin.dataRequests.statuses.${r.status}`)}</span>,
      },
      {
        key: 'identity_verified_at',
        header: t('admin.dataRequests.table.identity'),
        cell: (r) =>
          r.identity_verified_at ? (
            <span className="inline-flex items-center gap-1.5 text-success-green">
              <ShieldCheck size={14} /> {t('admin.dataRequests.identityVerified')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-admin-fg-muted">
              <ShieldQuestion size={14} /> {t('admin.dataRequests.identityMissing')}
            </span>
          ),
      },
      {
        key: 'received_at',
        header: t('admin.dataRequests.table.receivedAt'),
        sortable: true,
        cell: (r) => <span>{formatDate(r.received_at, lang)}</span>,
      },
      {
        key: 'due_at',
        header: t('admin.dataRequests.table.dueAt'),
        sortable: true,
        cell: (r) => <span>{formatDate(r.due_at, lang)}</span>,
      },
      {
        // Kanalın "izlenen kutu" şartı: gecikme GÖRÜNÜR olmak zorunda (INV-KVKK-1 R4).
        key: 'daysLeft',
        header: t('admin.dataRequests.table.daysLeft'),
        cell: (r) => {
          const due = computeDueState(r, now)
          if (due.frozen) {
            return (
              <span className="inline-flex items-center gap-1.5 text-admin-fg-muted">
                <CheckCircle2 size={14} /> {t('admin.dataRequests.due.frozen')}
              </span>
            )
          }
          if (due.overdue) {
            return (
              <span className="inline-flex items-center gap-1.5 font-semibold text-error-red">
                <AlertTriangle size={14} />
                {t('admin.dataRequests.due.overdue', { days: String(Math.abs(due.daysLeft)) })}
              </span>
            )
          }
          if (due.daysLeft <= 0) {
            return (
              <span className="inline-flex items-center gap-1.5 font-semibold text-warning-orange">
                <Clock size={14} /> {t('admin.dataRequests.due.today')}
              </span>
            )
          }
          return (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} />
              {t('admin.dataRequests.due.remaining', { days: String(due.daysLeft) })}
            </span>
          )
        },
      },
      {
        key: 'outcome',
        header: t('admin.dataRequests.table.outcome'),
        hideable: true,
        defaultHidden: true,
        cell: (r) => <span className="text-admin-fg-muted">{r.outcome ?? '—'}</span>,
      },
      {
        key: 'actions',
        header: '',
        cell: (r) =>
          hasWriteAccess ? (
            <button
              type="button"
              className={adminTableActionPrimaryClass}
              onClick={() => {
                setAdvanceRow(r)
                setNextStatus(r.status as RequestStatus)
                setOutcome(r.outcome ?? '')
                setRetainedNote(r.retained_data_note ?? '')
              }}
            >
              {t('admin.dataRequests.advance.title')}
            </button>
          ) : null,
      },
    ],
    [t, lang, now, hasWriteAccess],
  )

  return (
    <div className="space-y-4">
      {hasWriteAccess && (
        <div className="flex justify-end">
          <button type="button" className={adminButtonPrimaryClass} onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-1.5 inline" />
            {t('admin.dataRequests.newRequest')}
          </button>
        </div>
      )}

      <DataTableKit
        columns={columns}
        table={table}
        rowId={(r) => r.id}
        persistKey="data-requests"
        hasWriteAccess={hasWriteAccess}
        emptyState={
          <AdminEmptyState
            icon={ShieldCheck}
            title={t('admin.dataRequests.emptyTitle')}
            description={t('admin.dataRequests.emptyDescription')}
          />
        }
        filterEmptyState={
          <AdminEmptyState
            icon={SearchX}
            title={t('admin.dataRequests.emptyTitle')}
            description={t('admin.dataRequests.filterEmptyDescription')}
          />
        }
      />

      {/* Talep kaydı açma — kanal e-posta/KEP'tir, kayıt buraya işlenir (cetvel §3.3/3) */}
      <AdminModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t('admin.dataRequests.newRequest')}
        description={t('admin.dataRequests.form.dueNote')}
        closeLabel={t('admin.dataRequests.form.cancel')}
        footer={
          <>
            <button type="button" className={adminButtonSecondaryClass} onClick={() => setCreateOpen(false)}>
              {t('admin.dataRequests.form.cancel')}
            </button>
            <button
              type="button"
              className={adminButtonPrimaryClass}
              disabled={saving || !email.trim()}
              onClick={handleCreate}
            >
              {t('admin.dataRequests.form.submit')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="dsr-email" className="block text-sm font-medium text-admin-fg mb-1.5">
              {t('admin.dataRequests.form.applicantEmail')}
            </label>
            <input
              id="dsr-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={adminInputClass}
            />
            <p className="mt-1.5 text-xs text-admin-fg-muted">
              {t('admin.dataRequests.form.applicantEmailHint')}
            </p>
          </div>

          <div>
            <label htmlFor="dsr-type" className="block text-sm font-medium text-admin-fg mb-1.5">
              {t('admin.dataRequests.form.requestType')}
            </label>
            <select
              id="dsr-type"
              value={reqType}
              onChange={(e) => setReqType(e.target.value as RequestType)}
              className={adminSelectClass}
              style={adminSelectStyle}
            >
              {REQUEST_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`admin.dataRequests.types.${value}`)}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-admin-fg">
            <input
              type="checkbox"
              checked={identityVerified}
              onChange={(e) => setIdentityVerified(e.target.checked)}
            />
            {t('admin.dataRequests.form.identityVerified')}
          </label>
        </div>
      </AdminModal>

      {/* İlerletme — sonuçlandırmada outcome ZORUNLU; kısmi ret notu ayrı alan (§3.4/2) */}
      <AdminModal
        open={advanceRow !== null}
        onOpenChange={(open) => { if (!open) setAdvanceRow(null) }}
        title={t('admin.dataRequests.advance.title')}
        description={t('admin.dataRequests.advance.outcomeHint')}
        closeLabel={t('admin.dataRequests.form.cancel')}
        footer={
          <>
            <button type="button" className={adminButtonSecondaryClass} onClick={() => setAdvanceRow(null)}>
              {t('admin.dataRequests.form.cancel')}
            </button>
            <button type="button" className={adminButtonPrimaryClass} disabled={saving} onClick={handleAdvance}>
              {t('admin.dataRequests.advance.submit')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="dsr-status" className="block text-sm font-medium text-admin-fg mb-1.5">
              {t('admin.dataRequests.advance.status')}
            </label>
            <select
              id="dsr-status"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as RequestStatus)}
              className={adminSelectClass}
              style={adminSelectStyle}
            >
              {REQUEST_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(`admin.dataRequests.statuses.${value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dsr-outcome" className="block text-sm font-medium text-admin-fg mb-1.5">
              {t('admin.dataRequests.advance.outcome')}
            </label>
            <textarea
              id="dsr-outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={3}
              className={adminInputClass}
            />
          </div>

          <div>
            <label htmlFor="dsr-retained" className="block text-sm font-medium text-admin-fg mb-1.5">
              {t('admin.dataRequests.advance.retainedNote')}
            </label>
            <textarea
              id="dsr-retained"
              value={retainedNote}
              onChange={(e) => setRetainedNote(e.target.value)}
              rows={2}
              className={adminInputClass}
            />
            <p className="mt-1.5 text-xs text-admin-fg-muted">
              {t('admin.dataRequests.advance.retainedNoteHint')}
            </p>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}

export default AdminDataRequestsTableBody
