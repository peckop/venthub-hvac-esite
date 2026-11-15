// tcmb-rates-sync cooldown kararı — SAF ve importsuz (hem Deno ucu hem vitest import eder; OPS-293 D5).
//
// Neden "son satır 30 dk'dan yeni" yetmedi (security-reviewer, 15 Kasım): `fetched_at` yalnız EKLEMEDE
// ilerler; günlük bülten yazıldıktan sonra yeni satır gelmediği için o ölçüt günün ~23,5 saati ölüdür.
// Ölçüt bu yüzden "BUGÜNÜN bülteni TAM yazıldı mı" (İstanbul günü; her kiracı × her kur). "Herhangi bir satır"
// yetmez: EUR yazılıp USD düşerse kapı kapanır ve eksik yazımı onarmak kilitlenir (ikinci okuma, bulgu 1).
// Bellek damgası yalnız yazım TAM başarılıysa ve cron anını gölgelemiyorsa kurulur; eşzamanlı çağrılar
// `surenIstek` ile tek uçuşa iner.

export const COOLDOWN_MS = 30 * 60 * 1000
const IST_OFFSET_MS = 3 * 60 * 60 * 1000
/** pg_cron 'tcmb-rates-sync-daily' 12:45 UTC (dakika cinsinden günün saati). */
export const CRON_DAKIKA_UTC = 12 * 60 + 45

/** İstanbul takvim günü (yyyy-mm-dd). */
export function istanbulBugun(simdiMs: number): string {
  return new Date(simdiMs + IST_OFFSET_MS).toISOString().slice(0, 10)
}

/** İstanbul'da Cumartesi/Pazar mı (TCMB today.xml son iş gününü döndürür). */
export function haftaSonuMu(simdiMs: number): boolean {
  const gun = new Date(simdiMs + IST_OFFSET_MS).getUTCDay()
  return gun === 0 || gun === 6
}

export type CooldownNedeni = 'cooldown-inflight' | 'cooldown-memory' | 'cooldown-db'

export interface CooldownGirdisi {
  simdiMs: number
  /** Bu isolate'ın son BAŞARILI (tam yazılmış) TCMB isteği (0 = hiç). */
  sonBasariMs: number
  /** Bu isolate'ta TCMB isteği şu an sürüyor mu. */
  surenIstek: boolean
  /** DB'de bugünün (İstanbul) bülteni HER kiracı × HER kur için tam mı; null = okunamadı (fail-open). */
  bugununBultenTam: boolean | null
}

/** Cooldown nedeni ya da 'devam' (normal akış). Neden ayrı: cron sessizce kaçarsa hangi kapı olduğu görünsün. */
export function cooldownKarari(g: CooldownGirdisi): 'devam' | CooldownNedeni {
  if (g.surenIstek) return 'cooldown-inflight'
  if (g.sonBasariMs > 0 && g.simdiMs - g.sonBasariMs < COOLDOWN_MS) return 'cooldown-memory'
  if (g.bugununBultenTam === true) return 'cooldown-db'
  return 'devam'
}

/** Beklenen (kiracı × kur) çiftlerinin hepsi mevcut satırlarda var mı. Boş beklenti TAM sayılmaz. */
export function bultenTamMi(
  kiracilar: readonly string[],
  kurlar: readonly string[],
  satirlar: ReadonlyArray<{ tenant_id: string; quote_ccy: string }>,
): boolean {
  if (kiracilar.length === 0 || kurlar.length === 0) return false
  const var_ = new Set(satirlar.map((s) => `${s.tenant_id}|${s.quote_ccy.trim()}`))
  return kiracilar.every((t) => kurlar.every((k) => var_.has(`${t}|${k}`)))
}

/** Şimdiden itibaren COOLDOWN penceresi günlük 12:45 UTC cron anını kapsıyor mu (cron bastırılmasın). */
export function cronPenceresiniKapsarMi(simdiMs: number): boolean {
  const dakika = Math.floor(simdiMs / 60000) % 1440
  const fark = (CRON_DAKIKA_UTC - dakika + 1440) % 1440
  return fark <= COOLDOWN_MS / 60000
}

/**
 * Bellek damgası kurulsun mu (yalnız YAZIM TAM BAŞARILIYSA çağrılır). Bugüne ait bülten ya da hafta sonu: evet.
 * Bülten bugüne ait değilse (hafta içi yayın öncesi, resmî tatil) yalnız pencere cron anını GÖLGELEMİYORSA:
 * böylece throttle günün tamamına yayılır ama 12:45 cron'u kimliksiz bir çağrıyla bastırılamaz.
 */
export function damgaAtilsinMi(bultenTarihi: string, simdiMs: number): boolean {
  if (bultenTarihi === istanbulBugun(simdiMs) || haftaSonuMu(simdiMs)) return true
  return !cronPenceresiniKapsarMi(simdiMs)
}
