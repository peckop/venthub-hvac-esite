import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database, Tables, TablesInsert, TablesUpdate } from '../../types/database.types'
import { isTerminalStatus } from '../kvkk/dueState'

export type DataSubjectRequest = Tables<'data_subject_requests'>

/**
 * KVKK veri sahibi talep defteri — servis katmanı (DI: ilk parametre supabase, kural 2).
 *
 * Cetvel: `legal-compliance-standard.md §3` — prosedürün elle işletilmesi meşrudur, ama
 * **süre ve sonuç ispat yükü altındadır**: "30 gün içinde yanıtladık" demek yetmez,
 * gösterilebilmelidir. Bu servis o ispatı üreten defterin okuma/yazma yolu.
 *
 * SÖZLÜKLER DB'DEN GELİR (aşağıdaki sabitler CHECK kısıtlarının birebir kopyasıdır;
 * 2026-08-17'de prod'dan okundu). Yeni değer eklemek migration ister — UI sözlüğü
 * DB sözlüğünü AŞAMAZ (INV-KVKK-1 R1 bunu kilitler).
 */
export const REQUEST_TYPES = [
  'access',
  'rectification',
  'erasure',
  'portability',
  'objection',
  'restriction',
] as const

export const REQUEST_STATUSES = [
  'received',
  'identity_pending',
  'in_progress',
  'completed',
  'rejected',
] as const

export type RequestType = (typeof REQUEST_TYPES)[number]
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

/**
 * Defteri okur. RLS `p_dsr_admin_all` gereği yalnız admin rolleri satır görür —
 * yetkisiz çağrı BOŞ küme döner (hata değil), çağıran yüzey bunu "kayıt yok" diye
 * göstermemeli (UI izni ⊆ DB izni dersi).
 */
export async function listDataSubjectRequests(
  supabase: SupabaseClient<Database>,
): Promise<DataSubjectRequest[]> {
  const { data, error } = await supabase
    .from('data_subject_requests')
    .select('*')
    .order('due_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Yeni talep kaydı açar (e-posta/KEP ile GELEN talebin deftere işlenmesi — cetvel §3.3/3).
 * `due_at` BİLİNÇLİ olarak gönderilmez: 30 günlük son tarihi DB default'u koyar, böylece
 * süre istemci saatine bağlı olmaz.
 */
export async function createDataSubjectRequest(
  supabase: SupabaseClient<Database>,
  input: {
    applicant_email: string
    request_type: RequestType
    user_id?: string | null
    identity_verified_at?: string | null
  },
): Promise<DataSubjectRequest> {
  const payload: TablesInsert<'data_subject_requests'> = {
    applicant_email: input.applicant_email,
    request_type: input.request_type,
    user_id: input.user_id ?? null,
    identity_verified_at: input.identity_verified_at ?? null,
  }

  const { data, error } = await supabase
    .from('data_subject_requests')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Talebi ilerletir. Sonuçlandırmada (`completed`/`rejected`) `completed_at` yazılır ve
 * `outcome` ZORUNLUDUR — sonucun ispatı yükümüzdür. Kısmi ret sessiz olamaz: saklanan
 * kayıt varsa `retained_data_note` doldurulur (cetvel §3.4 tasarım kararı 2).
 */
export async function updateDataSubjectRequest(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: {
    status?: RequestStatus
    outcome?: string | null
    retained_data_note?: string | null
    identity_verified_at?: string | null
  },
): Promise<void> {
  const next: TablesUpdate<'data_subject_requests'> = { ...patch }

  if (patch.status && isTerminalStatus(patch.status)) {
    if (!patch.outcome || !patch.outcome.trim()) {
      throw new Error('outcome_required_on_terminal_status')
    }
    next.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('data_subject_requests')
    .update(next)
    .eq('id', id)

  if (error) throw error
}
