// Çağıran sınıfı: yardımcı modül (uç değil) — `healthz` ucunun "veritabanı ayakta mı" ölçümü.
//
// NİÇİN VAR (REC-355 alt işi · 2026-09-29)
//
// `healthz` veritabanına `POST /rest/v1/rpc/now` ile bakıyordu. `now()` yalnız `pg_catalog`
// şemasında var; PostgREST yalnız `public` şemasını sunar → o çağrı DB sağlam olsa bile
// HER ZAMAN 404 döndü ve uç canlıda her zaman `bozuk` göründü. İzleme kör: gerçek bir DB
// arızası ile "her zamanki 404" ayırt edilemiyordu (canlıda 2026-09-29'da ölçüldü:
// `db_status: 404`, `odeme_ortami: sandbox` bloğu doğru).
//
// ŞİMDİ: bilinen bir `public` tabloya HEAD sorgusu. HEAD gövde döndürmez (veri sızmaz),
// service_role RLS'i aşar (satır sayısından bağımsız), tablo yoksa ya da DB düşükse yanıt
// 2xx değildir → `bozuk`. Tek istek, zaman aşımı zorunlu (asılı DB uç isteğini askıda bırakmasın).
//
// `fetchImpl` çağırandan verilir (DI): gerçek ağ olmadan PostgREST davranışı sınanabilsin.

export type DbSaglik =
  | { ok: true }
  | { ok: false; neden: 'HTTP' | 'ZAMAN_ASIMI' | 'AG'; status: number | null }

/** `fetch`'in bu modülün kullandığı dar imzası: sahte ağ tip delmeden yazılabilsin. */
export type FetchFn = (girdi: string, init?: RequestInit) => Promise<Response>

export type DbSaglikGirdi = {
  supabaseUrl: string
  serviceKey: string
  fetchImpl?: FetchFn
  zamanAsimiMs?: number
  /** Bilinen, kalıcı bir `public` tablo. */
  tablo?: string
}

export const DB_SAGLIK_TABLO = 'site_settings'

export async function dbSaglikOlc(girdi: DbSaglikGirdi): Promise<DbSaglik> {
  const fetchImpl: FetchFn = girdi.fetchImpl ?? ((u, i) => fetch(u, i))
  const zamanAsimiMs = girdi.zamanAsimiMs ?? 4000
  const tablo = girdi.tablo ?? DB_SAGLIK_TABLO
  const url = `${girdi.supabaseUrl}/rest/v1/${encodeURIComponent(tablo)}?limit=1`

  const kontrol = new AbortController()
  let zamanlayici: ReturnType<typeof setTimeout> | undefined
  const zamanAsimi = new Promise<'ZAMAN_ASIMI'>((coz) => {
    zamanlayici = setTimeout(() => {
      kontrol.abort()
      coz('ZAMAN_ASIMI')
    }, zamanAsimiMs)
  })

  try {
    const istek = fetchImpl(url, {
      method: 'HEAD',
      headers: { Authorization: `Bearer ${girdi.serviceKey}`, apikey: girdi.serviceKey },
      signal: kontrol.signal,
    })
    // Kendi yarışımız: sahte/eski bir fetch `signal`'i yok sayarsa da ölçüm asılı kalmaz.
    const sonuc = await Promise.race([istek, zamanAsimi])
    if (sonuc === 'ZAMAN_ASIMI') return { ok: false, neden: 'ZAMAN_ASIMI', status: null }
    if (!sonuc.ok) return { ok: false, neden: 'HTTP', status: sonuc.status }
    return { ok: true }
  } catch {
    // Ağ hatası ve iptal: ölçüm başarısız, sağlıklı DEĞİL.
    return { ok: false, neden: 'AG', status: null }
  } finally {
    if (zamanlayici) clearTimeout(zamanlayici)
  }
}
