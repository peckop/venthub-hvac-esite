/**
 * KVKK talep süresi — SAF hesap (DB/istemci çağrısı YOK).
 *
 * Servis dosyasından bilerek AYRI: `lib/services/*` sözleşmesi her export'un ilk
 * parametresinin `supabase` olmasını şart koşar (CLAUDE.md kural 2, `diSignature` bekçisi).
 * Bu fonksiyon veri çekmez, yalnız DB'den gelen `due_at`'ı yorumlar — o yüzden servis
 * katmanına değil saf yardımcıya aittir.
 *
 * 30 GÜN BURADA YOK: son tarih otoritesi DB `due_at` default'udur (cetvel §3.5/2).
 * Buraya gün aritmetiği eklemek, ispat edilebilir süreyi istemci saatine bağlar.
 */

/** Süreci bitmiş sayılan durumlar — gecikme sayacı bunlarda DURUR. */
export const TERMINAL_STATUSES = ['completed', 'rejected'] as const

export type TerminalStatus = (typeof TERMINAL_STATUSES)[number]

/**
 * Statü sonuçlanmış mı? Tip-tahmini (type guard) olarak yazıldı: `TERMINAL_STATUSES.includes(x)`
 * doğrudan çağrılamaz — `as const` dizinin `includes` imzası yalnız kendi iki literalini kabul
 * eder, geniş `status` değeri tip hatası verir. Kontrolü tek yerde tutmak ayrıca sözlüğün
 * genişlemesini de tek noktadan yönetir.
 */
export function isTerminalStatus(status: string): status is TerminalStatus {
  return (TERMINAL_STATUSES as readonly string[]).includes(status)
}

export interface DueStateInput {
  due_at: string
  status: string
  completed_at: string | null
}

export interface DueState {
  /** Son tarihe kalan gün (negatifse gecikme). */
  daysLeft: number
  /** Terminal olmayan ve son tarihi geçmiş talep. */
  overdue: boolean
  /** Talep sonuçlandı — süre işlemiyor. */
  frozen: boolean
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function computeDueState(row: DueStateInput, now: Date): DueState {
  const due = new Date(row.due_at).getTime()
  const isTerminal = (TERMINAL_STATUSES as readonly string[]).includes(row.status)
  // Sonuçlanmışsa süre sonuçlanma anında durur; yoksa "şimdi"ye göre bakılır.
  const reference = isTerminal && row.completed_at ? new Date(row.completed_at).getTime() : now.getTime()

  return {
    daysLeft: Math.ceil((due - reference) / MS_PER_DAY),
    overdue: !isTerminal && due < now.getTime(),
    frozen: isTerminal,
  }
}
