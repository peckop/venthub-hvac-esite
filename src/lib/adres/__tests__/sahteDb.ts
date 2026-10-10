/**
 * Test yardımcısı: GERÇEK supabase-js istemcisi + PostgREST'i taklit eden sahte `fetch` (cast'siz DI;
 * emsal `lib/services/__tests__/pricing.resolve.test.ts`). Taklit edilen süzgeçler üreticinin
 * kullandıklarıyla sınırlı: `eq.`, `is.null`, `offset`/`limit`. İstekler kaydedilir — kiracı
 * süzgecinin HER tablo sorgusunda gerçekten gönderildiği ölçülebilsin.
 *
 * ALT-37e (karar 310): `url_takma_adlari` anon'a kapalıdır; üretici onu `url_takma_adlari_listele()` işleviyle okur
 * (PostgREST `/rpc/<ad>`). Sahte DB bu işlevi de taklit eder: kiracıyı tablo süzgecinden DEĞİL, `jwtKiraci`
 * seçeneğinden (gerçekte `jwt_tenant_id()`) çözer, `(tur, dil, eski_slug)` sırasıyla ve YALNIZ beş kolonla
 * (tenant_id, tur, dil, eski_slug, hedef_id) döner; `sebep`/`created_at` dönmez (canlı işlevle aynı).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

import dbSatirlari from './fikstur/db-satirlari.json'

export type SahteTablolar = Record<string, Record<string, unknown>[]>

export interface SahteDbSecenekleri {
  tablolar?: SahteTablolar
  /** Sunucunun sayfa sınırı (PostgREST `max-rows`); istemci daha büyük istese de bu kadar döner. */
  sunucuSayfaSiniri?: number
  /** Bu tabloya (ya da `/rpc/` ise işleve) istek ağ hatasıyla düşer. */
  agHatasi?: string
  /** Bu tablo (ya da işlev) PostgREST yetki hatası döner (42501). */
  sunucuHatasi?: string
  /** Bu işlev şema önbelleğinde YOK (migration uygulanmamış): 404 PGRST202. */
  islevYok?: string
  /**
   * `jwt_tenant_id()` taklidi: liste işlevi bu kiracının satırlarını döner. Varsayılan `VARSAYILAN_KIRACI`:
   * canlıda anon da service-role da (app_metadata.tenant_id yok) varsayılan kiracıya çözülür.
   */
  jwtKiraci?: string
}

export interface SahteCagri {
  url: URL
  method: string
}

export interface SahteDb {
  istemci: SupabaseClient<Database>
  /** Her isteğin URL'i (eski kullanım; kiracı süzgeci denetimleri bunu okur). */
  istekler: URL[]
  /** Aynı istekler yöntemiyle: RPC çağrısının GET (salt-okunur işlem) olduğunu ölçmek için. */
  cagrilar: SahteCagri[]
}

export const FIKSTUR_TABLOLARI: SahteTablolar = {
  categories: dbSatirlari.categories,
  product_families: dbSatirlari.product_families,
  products: dbSatirlari.products,
  url_takma_adlari: dbSatirlari.url_takma_adlari,
}

export const VARSAYILAN_KIRACI = 'd3b07384-d113-495f-a558-8c38634e0000'
export const BASKA_KIRACI = '11111111-1111-4111-8111-111111111111'

/** Üreticinin çağırdığı tek liste işlevi. */
export const TAKMA_AD_ISLEVI = 'url_takma_adlari_listele'

function suz(satirlar: Record<string, unknown>[], url: URL): Record<string, unknown>[] {
  let sonuc = satirlar
  for (const [ad, deger] of url.searchParams) {
    if (['select', 'order', 'offset', 'limit'].includes(ad)) continue
    if (deger.startsWith('eq.')) {
      const beklenen = deger.slice(3)
      sonuc = sonuc.filter((s) => String(s[ad]) === beklenen)
    } else if (deger === 'is.null') {
      sonuc = sonuc.filter((s) => s[ad] === null || s[ad] === undefined)
    } else {
      throw new Error(`sahte DB: tanınmayan süzgeç ${ad}=${deger}`)
    }
  }
  const offset = Number(url.searchParams.get('offset') ?? '0')
  const limit = Number(url.searchParams.get('limit') ?? String(sonuc.length))
  return sonuc.slice(offset, offset + limit)
}

/** Kod noktası sırası (canlı işlevin `order by tur, dil, eski_slug` karşılığı; ASCII anahtarlar). */
function kodSirasi(a: unknown, b: unknown): number {
  const x = String(a)
  const y = String(b)
  return x < y ? -1 : x > y ? 1 : 0
}

/** `url_takma_adlari_listele()` taklidi: jwt kiracısının satırları, sıralı, beş kolon. */
function takmaAdListesi(tablolar: SahteTablolar, jwtKiraci: string): Record<string, unknown>[] {
  return (tablolar.url_takma_adlari ?? [])
    .filter((s) => s.tenant_id === jwtKiraci)
    .sort((a, b) => kodSirasi(a.tur, b.tur) || kodSirasi(a.dil, b.dil) || kodSirasi(a.eski_slug, b.eski_slug))
    .map((s) => ({ tenant_id: s.tenant_id, tur: s.tur, dil: s.dil, eski_slug: s.eski_slug, hedef_id: s.hedef_id }))
}

function jsonYanit(durum: number, govde: unknown): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(govde), { status: durum, headers: { 'Content-Type': 'application/json' } })
  )
}

export function sahteDb(secenek: SahteDbSecenekleri = {}): SahteDb {
  const tablolar = secenek.tablolar ?? FIKSTUR_TABLOLARI
  const istekler: URL[] = []
  const cagrilar: SahteCagri[] = []
  const sahteFetch: typeof fetch = (girdi, init) => {
    const href = typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.toString() : girdi.url
    const url = new URL(href)
    istekler.push(url)
    cagrilar.push({ url, method: (init?.method ?? 'GET').toUpperCase() })
    const rpc = /\/rpc\/([^/]+)$/.exec(url.pathname)
    const ad = rpc ? rpc[1] : (url.pathname.split('/').pop() ?? '')
    if (secenek.agHatasi === ad) return Promise.reject(new TypeError('fetch failed'))
    if (secenek.sunucuHatasi === ad) {
      return rpc
        ? jsonYanit(403, { message: 'permission denied for function ' + ad, code: '42501' })
        : jsonYanit(401, { message: 'permission denied for table ' + ad, code: '42501' })
    }
    if (rpc && (secenek.islevYok === ad || ad !== TAKMA_AD_ISLEVI)) {
      return jsonYanit(404, {
        code: 'PGRST202',
        message: `Could not find the function public.${ad} without parameters in the schema cache`,
        hint: null,
        details: null,
      })
    }
    const kaynak = rpc ? takmaAdListesi(tablolar, secenek.jwtKiraci ?? VARSAYILAN_KIRACI) : (tablolar[ad] ?? [])
    let satirlar = suz(kaynak, url)
    if (secenek.sunucuSayfaSiniri !== undefined) satirlar = satirlar.slice(0, secenek.sunucuSayfaSiniri)
    return jsonYanit(200, satirlar)
  }
  const istemci = createClient<Database>('http://sahte.local', 'sahte-anahtar', {
    global: { fetch: sahteFetch },
    auth: { persistSession: false, autoRefreshToken: false },
    // İstemcinin GET yeniden deneme politikası (ağ hatasında 1+2+4 sn bekleme) KAPALI: bu testler üreticinin hata
    // davranışını ölçer, istemci kütüphanesinin yeniden denemesini değil; açık olsa her ağ hatası testi 7 sn sürer.
    db: { retry: false },
  })
  return { istemci, istekler, cagrilar }
}
