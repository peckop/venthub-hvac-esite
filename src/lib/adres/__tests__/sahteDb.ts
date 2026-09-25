/**
 * Test yardımcısı: GERÇEK supabase-js istemcisi + PostgREST'i taklit eden sahte `fetch` (cast'siz DI;
 * emsal `lib/services/__tests__/pricing.resolve.test.ts`). Taklit edilen süzgeçler üreticinin
 * kullandıklarıyla sınırlı: `eq.`, `is.null`, `offset`/`limit`. İstekler kaydedilir — kiracı
 * süzgecinin HER sorguda gerçekten gönderildiği ölçülebilsin.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

import dbSatirlari from './fikstur/db-satirlari.json'

export type SahteTablolar = Record<string, Record<string, unknown>[]>

export interface SahteDbSecenekleri {
  tablolar?: SahteTablolar
  /** Sunucunun sayfa sınırı (PostgREST `max-rows`); istemci daha büyük istese de bu kadar döner. */
  sunucuSayfaSiniri?: number
  /** Bu tabloya istek ağ hatasıyla düşer. */
  agHatasi?: string
  /** Bu tablo PostgREST hatası döner. */
  sunucuHatasi?: string
}

export interface SahteDb {
  istemci: SupabaseClient<Database>
  istekler: URL[]
}

export const FIKSTUR_TABLOLARI: SahteTablolar = {
  categories: dbSatirlari.categories,
  product_families: dbSatirlari.product_families,
  products: dbSatirlari.products,
  url_takma_adlari: dbSatirlari.url_takma_adlari,
}

export const VARSAYILAN_KIRACI = 'd3b07384-d113-495f-a558-8c38634e0000'
export const BASKA_KIRACI = '11111111-1111-4111-8111-111111111111'

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

export function sahteDb(secenek: SahteDbSecenekleri = {}): SahteDb {
  const tablolar = secenek.tablolar ?? FIKSTUR_TABLOLARI
  const istekler: URL[] = []
  const sahteFetch: typeof fetch = (girdi) => {
    const href = typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.toString() : girdi.url
    const url = new URL(href)
    istekler.push(url)
    const tablo = url.pathname.split('/').pop() ?? ''
    if (secenek.agHatasi === tablo) return Promise.reject(new TypeError('fetch failed'))
    if (secenek.sunucuHatasi === tablo) {
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'permission denied for table ' + tablo, code: '42501' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    }
    let satirlar = suz(tablolar[tablo] ?? [], url)
    if (secenek.sunucuSayfaSiniri !== undefined) satirlar = satirlar.slice(0, secenek.sunucuSayfaSiniri)
    return Promise.resolve(
      new Response(JSON.stringify(satirlar), { status: 200, headers: { 'Content-Type': 'application/json' } })
    )
  }
  const istemci = createClient<Database>('http://sahte.local', 'sahte-anahtar', {
    global: { fetch: sahteFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return { istemci, istekler }
}
