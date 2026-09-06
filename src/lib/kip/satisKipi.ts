import { unstable_cache } from 'next/cache'

/**
 * SATIŞ KİPİ ANAHTARI — tek okuma noktası (REC-168).
 * Cetvel: docs/standards/satis-kipi-gecis-standard.md §3 (arayüz sözleşmesi).
 *
 * NİÇİN ENV DEĞİL DB (öncül ölçümle düştü, 2026-09-06): `process.env.NEXT_PUBLIC_ODEME_ACIK`
 * derleme anında GÖMÜLÜR; vitrin sayfaları `generateStaticParams` ile statik üretilir. Env'i
 * çevirmek yeniden yayın ister — "tek tuş" olamaz. Kaynak artık `site_settings.satis_kipi`
 * satırı; RSC bunu `satis_kipi_oku()` RPC'siyle okur (anon'a YALNIZ boolean döner, tablo kapalı).
 *
 * NİÇİN DOĞRUDAN PostgREST (supabase-js `.rpc()` DEĞİL): `.rpc()`'nin ad birliği üretilmiş
 * `database.types.ts`'ten gelir; o dosya migration + `pnpm supabase:gen` sonrası güncellenir ve
 * ELLE YAZILMAZ (AXIOM 3). Kod migration'dan ÖNCE inebilsin diye çağrı tipe bağlanmadı; cevap
 * aşağıda ELLE doğrulanır — tip dökümüyle geçiştirilmez (kapı o kalıbı bloklar, haklı olarak).
 * BORÇ (cetvel §11): `supabase:gen` koşulunca bu çağrı tipli `.rpc('satis_kipi_oku')`'ya döner.
 *
 * NİÇİN unstable_cache + TAG: bu fonksiyonu çağıran her RSC `SATIS_KIPI_TAG`'e bağlanır.
 * DB satırı değişince tetik → webhook → `revalidateTag(SATIS_KIPI_TAG)` → tüketen HER sayfa
 * bir sonraki istekte yeniden üretilir. Yeni bir yüzey (PDP, sepet, sitemap) satış kipini
 * bilmek istiyorsa KENDİ okumasını yazmaz, bunu çağırır — hüküm tek yerde yaşar
 * (quoteMode.ts ile aynı ders: aynı hüküm iki yüzeyde ayrı yazılırsa biri sessizce eski kalır).
 *
 * FAIL-CLOSED: RPC yok / ağ hatası / bozuk cevap → KAPALI. "Bilinmemek" satış açmaz.
 * Migration inmeden bu kod canlıya çıkabilir; davranış bugünkünün aynısıdır.
 *
 * ÖNİZLEME ZORLAMASI: `SATIS_KIPI_ONIZLEME=1` YALNIZ `VERCEL_ENV === 'preview'` iken okunur —
 * K8 provası için (Recep açık hâli gözle görür). Prod'da bu değişken tanımlı olsa bile
 * YOK SAYILIR (kapı: INV-SATIS-KIPI-3). Preview aynı prod DB'yi okur; provayı DB'de açmak
 * prod'u da açardı — zorlama bu yüzden var.
 *
 * KURAL 12 NOTU: tag bugün tenant'sız (`satis-kipi`); Faz 2 açılırsa `satis-kipi-${tenantId}`
 * ve okuma tenant'a göre — bu dosya o gün değişir, çağıranlar değişmez.
 */
export const SATIS_KIPI_TAG = 'satis-kipi'

export type SatisKipiKaynak = 'db' | 'onizleme-zorlama' | 'kapali-varsayilan'

export interface SatisKipi {
  /** true = satış kipi (ödeme yolu açık, fiyatlar görünür). false = teklif kipi. */
  acik: boolean
  /** DB satırının updated_at damgası; db dışı kaynaklarda null. */
  damga: string | null
  kaynak: SatisKipiKaynak
}

const KAPALI: SatisKipi = { acik: false, damga: null, kaynak: 'kapali-varsayilan' }

/** Cevabı ELLE doğrular: yalnız `{ acik: boolean, damga?: string|null }` biçimi kabul edilir. */
function cevabiCoz(ham: unknown): SatisKipi {
  if (ham === null || typeof ham !== 'object') return KAPALI
  const acik = Reflect.get(ham, 'acik')
  if (acik !== true) return KAPALI // false, eksik, string 'true' → hepsi KAPALI
  const damga = Reflect.get(ham, 'damga')
  return { acik: true, damga: typeof damga === 'string' ? damga : null, kaynak: 'db' }
}

async function dbdenOku(): Promise<SatisKipi> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return KAPALI
  try {
    const yanit = await fetch(`${url}/rest/v1/rpc/satis_kipi_oku`, {
      method: 'POST',
      headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
      body: '{}',
      // Next fetch önbelleği DEĞİL, unstable_cache bu fonksiyonu sarar; iki katmanlı önbellek yanıltır.
      cache: 'no-store',
    })
    if (!yanit.ok) return KAPALI // 404 = RPC henüz yok (migration inmedi) → bugünkü davranış
    return cevabiCoz(await yanit.json())
  } catch {
    return KAPALI
  }
}

const onbellekli = unstable_cache(dbdenOku, ['satis-kipi'], { tags: [SATIS_KIPI_TAG] })

/** Satış kipini okur. RSC / route handler / sitemap içinden çağrılır; istemci bileşenine PROP ile geçilir. */
export async function satisKipiOku(): Promise<SatisKipi> {
  if (process.env.VERCEL_ENV === 'preview' && process.env.SATIS_KIPI_ONIZLEME === '1') {
    return { acik: true, damga: null, kaynak: 'onizleme-zorlama' }
  }
  return onbellekli()
}
