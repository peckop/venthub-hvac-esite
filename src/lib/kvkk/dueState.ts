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
 * Checks if a given status represents a completed or rejected terminal state.
 * Acts as a TypeScript type guard to narrow string types into specific terminal status literals.
 *
 * @param status - The status string to evaluate
 * @returns True if the status is considered terminal, allowing type-narrowing to TerminalStatus
 *
 * @example
 * isTerminalStatus('completed') // returns true
 * isTerminalStatus('in_progress') // returns false
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

/**
 * Calculates the current state of a due date SLA, evaluating remaining days, overdue flags, and whether the timer has stopped.
 * If the row has reached a terminal status, the calculation freezes based on its completion timestamp.
 *
 * @param row - An object containing the due date, current status, and an optional completion timestamp
 * @param now - The reference date against which the SLA is measured (typically the current date)
 * @returns An object describing the SLA status including days remaining and overdue indicators
 *
 * @example
 * computeDueState({ due_at: '2025-05-15', status: 'pending', completed_at: null }, new Date('2025-05-10'))
 * // returns { daysLeft: 5, overdue: false, frozen: false }
 */
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
