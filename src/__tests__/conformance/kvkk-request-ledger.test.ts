import { describe, expect, it } from 'vitest'

import { computeDueState, isTerminalStatus, TERMINAL_STATUSES } from '@/lib/kvkk/dueState'
import { REQUEST_STATUSES, REQUEST_TYPES } from '@/lib/services/dataSubjectRequest.service'

/**
 * INV-KVKK-1 · Veri sahibi talep defteri conformance (kalıcı bekçi).
 *
 * 2026-08-17 ölçümü (T063): `data_subject_requests` tablosu ve `anonymize_user_personal_data`
 * prod'da CANLIYDI ama defteri BESLEYEN/GÖSTEREN arayüz yoktu. Cetvel
 * (`legal-compliance-standard.md §3.4`) şunu söylüyor: prosedürün elle işletilmesi meşrudur
 * ama **süre ve sonuç ispat yükü altındadır** — "30 gün içinde yanıtladık" demek yetmez,
 * gösterilebilmelidir. Bu bekçi o ispatı üreten zincirin kopmamasını sağlar.
 *
 * Zorlanan kurallar:
 *   R1: UI sözlüğü DB sözlüğünü AŞAMAZ — servis sabitleri (`REQUEST_TYPES`/`REQUEST_STATUSES`)
 *       migration'daki CHECK kısıtıyla BİREBİR aynı olmalı. (Kod-DB paritesi: fazladan değer
 *       seçilirse INSERT prod'da 400 döner, eksik değer varsa admin gerçek durumu göremez.)
 *   R2: 30 günlük son tarih UI'da YENİDEN HESAPLANMAZ — otorite DB `due_at` default'udur.
 *       Admin yüzeyinde/servis hesabında "30 gün" aritmetiği yasak (istemci saati ile
 *       sunucu saati ayrışırsa ispat çürür).
 *   R3: UI izni ⊆ DB izni — RLS `is_admin_user()` yalnız admin/super_admin kabul ettiği için
 *       `/admin/data-requests` rotası rbac'ta o iki role daraltılmış olmalı. Aksi hâlde
 *       moderator/viewer "kayıt yok" ekranı görür = SESSİZ-BOŞ (T062 warehouse dersi).
 *   R4: Gecikme GÖRÜNÜR olmalı — kanalın "gerçekten izlenen kutu" şartının UI karşılığı.
 *   R5: Sonuçlandırma sessiz olamaz — terminal statüde `outcome` zorunlu (cetvel §3.4/2).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const MIGRATIONS: Record<string, string> = import.meta.glob(
  '/supabase/migrations/*_kvkk_*.sql',
  { query: '?raw', import: 'default', eager: true },
)

const SOURCES: Record<string, string> = import.meta.glob(
  '/src/{views,lib,config}/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true },
)

/**
 * SQL yorumlarını sıyır. `[^\r\n]` ZORUNLU — bu depo CRLF ile saklıyor ve JS'te `.`
 * satır sonlandırıcı `\r` ile EŞLEŞMEZ, yani `/--.*$/` hiçbir şeyi temizlemez
 * (memory: crlf-blinds-conformance-regex; bugüne dek beş kez ısırdı).
 */
function stripSqlComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\r\n]*/g, '')
}

/** TS/TSX yorumlarını sıyır (aynı CRLF gerekçesi). */
function stripTsComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`])\/\/[^\r\n]*/g, '$1')
}

function source(path: string): string {
  const src = SOURCES[path]
  if (src === undefined) {
    throw new Error(`Kaynak bulunamadı: ${path} — dosya taşındıysa bu testi de güncelle.`)
  }
  return src
}

/**
 * `check (col in ('a','b'))` ve `check (col = any (array['a','b']))` biçimlerinin İKİSİNİ de
 * okur: kolon adı + kısıt anahtar sözcüğünden (`in` / `= any`) sonraki İLK değer listesini
 * alıp içindeki tırnaklı literalleri toplar. Kolon eşleşmesi `\b` ile TAM ADdır — `status`
 * araması `order_status`'u yakalamaz.
 */
export function parseCheckValues(sql: string, column: string): string[] {
  const clean = stripSqlComments(sql)
  const re = new RegExp(
    `\\b${column}\\b\\s*(?:in|=\\s*any)\\s*\\(?\\s*(?:array)?\\s*[([]([^)\\]]*)`,
    'i',
  )
  const m = clean.match(re)
  if (!m) return []
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1])
}

describe('INV-KVKK-1 · veri sahibi talep defteri', () => {
  it('R1: servis sözlükleri migration CHECK kısıtıyla BİREBİR (kod-DB paritesi)', () => {
    const migration = Object.values(MIGRATIONS)[0]
    expect(migration, 'KVKK migration dosyası bulunamadı — ad deseni mi değişti?').toBeTruthy()

    const dbTypes = parseCheckValues(migration!, 'request_type')
    const dbStatuses = parseCheckValues(migration!, 'status')

    expect(dbTypes.length, 'migration içinde request_type CHECK değerleri okunamadı').toBeGreaterThan(3)
    expect(dbStatuses.length, 'migration içinde status CHECK değerleri okunamadı').toBeGreaterThan(3)

    expect([...REQUEST_TYPES].sort()).toEqual([...dbTypes].sort())
    expect([...REQUEST_STATUSES].sort()).toEqual([...dbStatuses].sort())
  })

  it('R2: 30 günlük son tarih UI/servis tarafında yeniden hesaplanmaz (otorite DB due_at)', () => {
    const serviceSrc = stripTsComments(source('/src/lib/services/dataSubjectRequest.service.ts'))
    const bodySrc = stripTsComments(source('/src/views/admin/AdminDataRequestsTableBody.tsx'))

    // 30 gün aritmetiği: '30 *', '* 30', "days: 30", "addDays(..., 30)" vb.
    const thirtyDayMath = /\b30\b\s*[*+]|[*+]\s*\b30\b|days?\s*[:=]\s*30|addDays\([^)]*30/i
    expect(thirtyDayMath.test(serviceSrc), 'servis 30 günü kendisi hesaplıyor').toBe(false)
    expect(thirtyDayMath.test(bodySrc), 'admin yüzeyi 30 günü kendisi hesaplıyor').toBe(false)

    // due_at DB'den OKUNUYOR olmalı
    expect(serviceSrc).toContain('due_at')
    // insert payload'ında due_at YAZILMAMALI (DB default'u koyar)
    // Yalnız payload NESNESİ denetlenir — `TablesInsert` sözcüğünün ilk geçtiği yer IMPORT
    // satırıdır; oradan dilimlemek tüm dosyayı kapsar ve iddiayı körleştirir (ilk hâli öyleydi).
    const payloadMatch = serviceSrc.match(/const payload: TablesInsert<[^>]+> = \{([\s\S]*?)\n  \}/)
    expect(payloadMatch, 'insert payload nesnesi bulunamadı — desen mi değişti?').toBeTruthy()
    expect(
      payloadMatch![1].includes('due_at'),
      'insert payload due_at yazıyor — DB default ezilir, süre istemci saatine bağlanır',
    ).toBe(false)
  })

  it('R3: UI izni ⊆ DB izni — /admin/data-requests yalnız admin/super_admin', () => {
    const rbac = stripTsComments(source('/src/lib/rbac.ts'))
    const guard = /\/admin\/data-requests[\s\S]{0,220}?super_admin/
    expect(
      guard.test(rbac),
      "rbac'ta /admin/data-requests için admin/super_admin daraltması yok — moderator/viewer SESSİZ-BOŞ görür",
    ).toBe(true)
  })

  it('R4: gecikme UI\'da görünür (izlenen kutu şartı)', () => {
    const bodySrc = stripTsComments(source('/src/views/admin/AdminDataRequestsTableBody.tsx'))
    expect(bodySrc).toContain('computeDueState')
    expect(bodySrc).toMatch(/overdue/)
    // Gecikme görsel olarak ayrışmalı (hata rengi + uyarı ikonu)
    expect(bodySrc).toMatch(/text-error-red/)
  })

  it('R5: sonuçlandırmada outcome zorunlu — servis sessiz geçmez', () => {
    const serviceSrc = stripTsComments(source('/src/lib/services/dataSubjectRequest.service.ts'))
    expect(serviceSrc).toMatch(/(isTerminalStatus|TERMINAL_STATUSES)[\s\S]{0,200}?throw new Error/)
  })

  /* ---- saf fonksiyon davranışı (dedektör sağlığı: sentetik girdiler) ---- */

  it('computeDueState: gecikmiş / bugün / kalan / donmuş dört hâli ayırır', () => {
    const now = new Date('2026-08-17T12:00:00Z')

    const overdue = computeDueState(
      { due_at: '2026-08-10T12:00:00Z', status: 'in_progress', completed_at: null },
      now,
    )
    expect(overdue.overdue).toBe(true)
    expect(overdue.frozen).toBe(false)

    const remaining = computeDueState(
      { due_at: '2026-08-27T12:00:00Z', status: 'received', completed_at: null },
      now,
    )
    expect(remaining.overdue).toBe(false)
    expect(remaining.daysLeft).toBe(10)

    // Terminal statüde süre DURUR — gecikmiş görünmemeli
    const frozen = computeDueState(
      { due_at: '2026-08-10T12:00:00Z', status: 'completed', completed_at: '2026-08-09T12:00:00Z' },
      now,
    )
    expect(frozen.frozen).toBe(true)
    expect(frozen.overdue).toBe(false)
  })

  it('TERMINAL_STATUSES yalnız sonuçlanmış durumları içerir; guard onları tanır', () => {
    expect([...TERMINAL_STATUSES].sort()).toEqual(['completed', 'rejected'])
    expect(isTerminalStatus('completed')).toBe(true)
    expect(isTerminalStatus('rejected')).toBe(true)
    expect(isTerminalStatus('in_progress')).toBe(false)
  })

  it('parseCheckValues sağlığı: sentetik CHECK\'i okur, ilgisiz kolonu okumaz', () => {
    const sql = `create table t (
      status text not null check (status = any (array['a'::text, 'b'::text])),
      other text
    );`
    expect(parseCheckValues(sql, 'status')).toEqual(['a', 'b'])
    expect(parseCheckValues(sql, 'nonexistent_column')).toEqual([])
  })
})
