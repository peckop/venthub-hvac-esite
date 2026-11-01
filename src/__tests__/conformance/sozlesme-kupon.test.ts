// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  anahtarFarki,
  KUPON_ALTYAPI_HATALARI,
  KUPON_ISTEGI_ALANLARI,
  KUPON_RED_SEBEPLERI,
  KUPON_YANITI_ALANLARI,
} from '@/lib/sozlesme/edgeSozlesmeleri'

/**
 * INV-SOZLESME-KUPON-1 · kupon sözleşmesi (ALT-126, OPS-180 §7 madde 4).
 *
 * Edge ayağı DAVRANIŞLA ölçülür: `supabase/functions/apply-coupon/index.ts` gerçek haliyle yüklenir,
 * `Deno.serve`'e verilen işleyici yakalanır, veritabanı ve hız limiti çağrıları sahte `fetch` ile
 * cevaplanır. Geçerli, süresi dolmuş, bulunamayan ve biçimsiz kod yolları uca gerçek istekle sorulur.
 * İstemci ayağı (`src/hooks/useCheckoutCoupon.ts`, vitrin değil) kaynak olarak okunur: gönderdiği gövde
 * ve okuduğu yanıt alanları şemadadır. Vitrin (src/views, src/components) import EDİLMEZ.
 */

const KOK = path.resolve(__dirname, '../../..')
const EDGE_YOLU = path.join(KOK, 'supabase/functions/apply-coupon/index.ts')
const EDGE = fs.readFileSync(EDGE_YOLU, 'utf8')
const HOOK = fs.readFileSync(path.join(KOK, 'src/hooks/useCheckoutCoupon.ts'), 'utf8')

type Isleyici = (req: Request) => Promise<Response>
type KuponSatiri = Record<string, unknown>

const GUN = 86_400_000
const KUPONLAR: Record<string, KuponSatiri> = {
  YUZDE10: {
    code: 'YUZDE10', discount_type: 'percentage', discount_value: 10, minimum_order_amount: null,
    valid_from: null, valid_until: new Date(Date.now() + GUN).toISOString(), is_active: true, usage_limit: null, used_count: 0,
  },
  ESKI10: {
    code: 'ESKI10', discount_type: 'percentage', discount_value: 10, minimum_order_amount: null,
    valid_from: null, valid_until: new Date(Date.now() - GUN).toISOString(), is_active: true, usage_limit: null, used_count: 0,
  },
}

/** PostgREST + hız limiti RPC taklidi. Yalnız apply-coupon'un çağırdığı iki adres cevaplanır. */
async function sahteFetch(girdi: RequestInfo | URL, secenek?: RequestInit): Promise<Response> {
  const url = new URL(typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.href : girdi.url)
  if (url.pathname.endsWith('/rpc/bump_rate_limit')) {
    return Response.json([{ allowed: true, remaining: 59, reset_at: new Date(Date.now() + 60_000).toISOString() }])
  }
  if (url.pathname.endsWith('/rest/v1/coupons')) {
    const kod = (url.searchParams.get('code') ?? '').replace(/^eq\./, '')
    const satir = KUPONLAR[kod]
    const basliklar = new Headers(secenek?.headers ?? (girdi instanceof Request ? girdi.headers : undefined))
    const tekNesne = (basliklar.get('accept') ?? '').includes('vnd.pgrst.object')
    if (tekNesne) {
      return satir
        ? Response.json(satir)
        : Response.json({ code: 'PGRST116', message: 'no rows' }, { status: 406 })
    }
    return Response.json(satir ? [satir] : [])
  }
  throw new Error(`beklenmeyen fetch: ${url.href}`)
}

/**
 * Edge kaynağını geçici dizine yazar; yalnız İKİ içe aktarma belirteci yerel dosyaya çevrilir
 * (esm.sh supabase-js → depodaki paket, `../_shared/rate_limit.ts` → depodaki dosya). Gövde
 * BAYT BAYT aynıdır. Niçin kopya: dinamik içe aktarmada vitest dönüşümü devreye girmiyor, modül
 * Node'a (tip ayıklamalı yerel TS) gidiyor ve https belirtecini çözemiyor — ilk yazışta ölçüldü.
 */
function nodeKopyasi(ad: string, metin: string): string {
  if (!tmp) tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kupon-sozlesme-'))
  const supabaseJs = pathToFileURL(createRequire(path.join(KOK, 'package.json')).resolve('@supabase/supabase-js')).href
  const rateLimit = pathToFileURL(path.join(KOK, 'supabase/functions/_shared/rate_limit.ts')).href
  const cevrilmis = metin
    .replace(/'https:\/\/esm\.sh\/@supabase\/supabase-js@[\d.]+'/, `'${supabaseJs}'`)
    .replace("'../_shared/rate_limit.ts'", `'${rateLimit}'`)
  if (cevrilmis.includes('esm.sh') || cevrilmis.includes("'../_shared/")) {
    throw new Error('apply-coupon yeni bir uzak/göreli içe aktarma eklemiş: nodeKopyasi güncellenmeli')
  }
  const yol = path.join(tmp, `${ad}.mts`)
  fs.writeFileSync(yol, cevrilmis)
  return yol
}

async function isleyiciYukle(dosya: string): Promise<Isleyici> {
  let yakalanan: Isleyici | null = null
  vi.stubGlobal('Deno', {
    serve: (f: Isleyici) => {
      yakalanan = f
    },
    env: {
      get: (k: string) =>
        ({ SUPABASE_URL: 'https://ornek.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-anahtari', ALLOWED_ORIGINS: '' })[k],
    },
  })
  await import(/* @vite-ignore */ pathToFileURL(dosya).href)
  if (!yakalanan) throw new Error('Deno.serve çağrılmadı')
  return yakalanan
}

const istek = (govde: unknown) =>
  new Request('https://ornek.supabase.co/functions/v1/apply-coupon', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://venthub.com.tr' },
    body: JSON.stringify(govde),
  })

async function sor(isleyici: Isleyici, govde: unknown) {
  const r = await isleyici(istek(govde))
  return { durum: r.status, govde: (await r.json()) as Record<string, unknown> }
}

const literaller = (kaynak: string, alan: string) =>
  [...new Set([...kaynak.matchAll(new RegExp(`${alan}:\\s*'(\\w+)'`, 'g'))].map((m) => m[1]))]

function edgeStatikFarklar(kaynak: string) {
  return {
    redSebepleri: anahtarFarki(literaller(kaynak, 'reason'), KUPON_RED_SEBEPLERI),
    altyapiHatalari: anahtarFarki(literaller(kaynak, 'error'), KUPON_ALTYAPI_HATALARI),
    okunanGovde: anahtarFarki([...new Set([...kaynak.matchAll(/\bbody\??\.(\w+)/g)].map((m) => m[1]))], KUPON_ISTEGI_ALANLARI),
    yanitTipi: anahtarFarki(
      [...(kaynak.match(/type ApplyCouponResp = \{([^}]*)\}/)?.[1] ?? '').matchAll(/(\w+)\??\s*:/g)].map((m) => m[1]),
      KUPON_YANITI_ALANLARI,
    ),
  }
}

const TEMIZ = { eksik: [], fazla: [] }
let gercek: Isleyici
let tmp = ''

beforeAll(async () => {
  vi.stubGlobal('fetch', sahteFetch)
  gercek = await isleyiciYukle(nodeKopyasi('gercek', EDGE))
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

describe('INV-SOZLESME-KUPON-1 · apply-coupon davranışı ortak şemaya uyar', () => {
  it('geçerli yüzde kupon: 200, valid=true, indirim ve son tutar doğru, alanlar şemada', async () => {
    const { durum, govde } = await sor(gercek, { code: 'YUZDE10', subtotal: 1000 })
    expect(durum).toBe(200)
    expect(govde).toEqual({ valid: true, discount_amount: 100, final_total: 900, normalized_code: 'YUZDE10' })
    expect(anahtarFarki(Object.keys(govde), KUPON_YANITI_ALANLARI).fazla).toEqual([])
  })

  it('süresi dolmuş kupon: 200, valid=false, reason=not_applicable (indirim alanı YOK)', async () => {
    const { durum, govde } = await sor(gercek, { code: 'ESKI10', subtotal: 1000 })
    expect(durum).toBe(200)
    expect(govde).toEqual({ valid: false, reason: 'not_applicable' })
  })

  it('bulunamayan kupon: 404, reason=not_found', async () => {
    const { durum, govde } = await sor(gercek, { code: 'YOKBOYLE', subtotal: 1000 })
    expect(durum).toBe(404)
    expect(govde).toEqual({ valid: false, reason: 'not_found' })
  })

  it('biçimsiz kod ve geçersiz ara toplam: 400, şemadaki sebeplerle', async () => {
    expect(await sor(gercek, { code: 'ab', subtotal: 1000 })).toEqual({ durum: 400, govde: { valid: false, reason: 'invalid_code' } })
    expect(await sor(gercek, { code: 'YUZDE10', subtotal: 0 })).toEqual({ durum: 400, govde: { valid: false, reason: 'invalid_subtotal' } })
  })

  it('Edge kaynağındaki her red sebebi ve altyapı hatası şemada, şemadaki her değer kaynakta', () => {
    expect(edgeStatikFarklar(EDGE)).toEqual({ redSebepleri: TEMIZ, altyapiHatalari: TEMIZ, okunanGovde: TEMIZ, yanitTipi: TEMIZ })
  })
})

describe('INV-SOZLESME-KUPON-2 · istemci (useCheckoutCoupon) şemaya uyar', () => {
  it('gönderdiği gövde = {code, subtotal}', () => {
    const m = HOOK.match(/body:\s*JSON\.stringify\(\{([^}]*)\}\)/)
    expect(m, 'istek gövdesi bulunamadı').not.toBeNull()
    const alanlar = m![1].split(',').map((p) => p.split(':')[0].trim()).filter(Boolean)
    expect(anahtarFarki(alanlar, KUPON_ISTEGI_ALANLARI)).toEqual(TEMIZ)
  })

  it('okuduğu yanıt alanları şemada (error = altyapı reddi gövdesi) ve başarıyı valid ile ölçer', () => {
    const okunan = [...new Set([...HOOK.matchAll(/\bjson\??\.(\w+)/g)].map((m) => m[1]))]
    expect(okunan.filter((a) => a !== 'error' && !(KUPON_YANITI_ALANLARI as readonly string[]).includes(a))).toEqual([])
    expect(HOOK).toMatch(/!resp\.ok \|\| !json\?\.valid/)
  })
})

describe('INV-SOZLESME-KUPON · sabotaj: bağ kopunca ölçüt KIRMIZI', () => {
  const boz = (eski: string, yeni: string) => {
    const b = EDGE.replace(eski, yeni)
    if (b === EDGE) throw new Error(`sabotaj hedefi bulunamadı: ${eski}`)
    return b
  }

  it('süre kontrolü kaldırılırsa süresi dolmuş kupon İNDİRİM verir (davranış kolu kırmızı)', async () => {
    const bozuk = await isleyiciYukle(nodeKopyasi('sabotaj-sure', boz('const endsOk = !row.valid_until ||', 'const endsOk = true ||')))
    const { govde } = await sor(bozuk, { code: 'ESKI10', subtotal: 1000 })
    expect(govde.valid).toBe(true)
  })

  it('Edge yeni bir red sebebi üretirse (şemada yok) statik kol kırmızı', () => {
    expect(edgeStatikFarklar(boz("reason: 'not_found'", "reason: 'yok'")).redSebepleri).toEqual({ eksik: ['not_found'], fazla: ['yok'] })
  })

  it('Edge gövdeden şemada olmayan alan okursa kırmızı', () => {
    expect(edgeStatikFarklar(boz('Number(body?.subtotal || 0)', 'Number(body?.total || 0)')).okunanGovde.fazla).toEqual(['total'])
  })
})
