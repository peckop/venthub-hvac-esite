// tcmb-rates-sync cooldown kararı — SAF ve importsuz (hem Deno ucu hem vitest import eder; OPS-293 D5).
//
// Neden "son satır 30 dk'dan yeni" yetmedi (security-reviewer, 15 Kasım): `fetched_at` yalnız EKLEMEDE
// ilerler; günlük bülten yazıldıktan sonra yeni satır gelmediği için o ölçüt günün ~23,5 saati ölüdür.
// Ölçüt bu yüzden "BUGÜNÜN bülteni zaten yazıldı mı" (İstanbul günü, effective_date). Ayrıca kimliksiz bir çağrı
// 12:45 cron'unu bastırmasın diye bellek damgası yalnız BAŞARILI ve BUGÜNE ait bülten sonrasında (ya da hafta
// sonu, TCMB son iş gününü döndürdüğünde) kurulur; eşzamanlı çağrılar `surenIstek` ile tek uçuşa indirilir.

export const COOLDOWN_MS = 30 * 60 * 1000
const IST_OFFSET_MS = 3 * 60 * 60 * 1000

/** İstanbul takvim günü (yyyy-mm-dd). */
export function istanbulBugun(simdiMs: number): string {
  return new Date(simdiMs + IST_OFFSET_MS).toISOString().slice(0, 10)
}

/** İstanbul'da Cumartesi/Pazar mı (TCMB today.xml son iş gününü döndürür). */
export function haftaSonuMu(simdiMs: number): boolean {
  const gun = new Date(simdiMs + IST_OFFSET_MS).getUTCDay()
  return gun === 0 || gun === 6
}

export interface CooldownGirdisi {
  simdiMs: number
  /** Bu isolate'ın son BAŞARILI TCMB isteği (0 = hiç). */
  sonBasariMs: number
  /** Bu isolate'ta TCMB isteği şu an sürüyor mu. */
  surenIstek: boolean
  /** DB'de bugünün (İstanbul) TCMB bülteni var mı; null = okunamadı (fail-open). */
  bugununBulteniVar: boolean | null
}

/** 'cooldown' → TCMB'ye gitmeden carried:true; 'devam' → normal akış. */
export function cooldownKarari(g: CooldownGirdisi): 'devam' | 'cooldown' {
  if (g.surenIstek) return 'cooldown'
  if (g.sonBasariMs > 0 && g.simdiMs - g.sonBasariMs < COOLDOWN_MS) return 'cooldown'
  if (g.bugununBulteniVar === true) return 'cooldown'
  return 'devam'
}

/** Bellek damgası yalnız bugüne ait bültenle (ya da hafta sonu) kurulur: dünkü bülten cron'u bastırmasın. */
export function damgaAtilsinMi(bultenTarihi: string, simdiMs: number): boolean {
  return bultenTarihi === istanbulBugun(simdiMs) || haftaSonuMu(simdiMs)
}
