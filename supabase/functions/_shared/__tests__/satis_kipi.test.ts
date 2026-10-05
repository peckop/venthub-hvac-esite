import { describe, expect, it } from 'vitest'

import {
  DENEME_ISARETI,
  denemeIsaretleriniOku,
  denemeIsaretleriSorgusu,
  denemeIzniHukmu,
  denemeKaydiGovdesi,
  denemeListesiniAyristir,
  denemeSiparisiKaydet,
  denemeSiparisleriniAyir,
  satisDurumuOku,
  satisKipiKarari,
  type FetchLike,
  type SatisKipiGirdi,
} from '../satis_kipi'

/**
 * `_shared/satis_kipi.ts` SÖZLEŞMESİNİN KİLİDİ (REC-355 alt işi · 2026-09-29).
 *
 * Kapatılan sınıf: **sunucu tarafında satış kipi kontrolü olmaması.** Kapı SAF fonksiyondur ve bu
 * testler onu GERÇEK `Response` nesneleriyle sınar. Asıl kilitlenen iki şey:
 *   1. Yalnız gerçek JSON boolean `true` açar; başka her biçim (string, sayı, dizi, null, HTTP
 *      hatası, zaman aşımı) satışı AÇMAZ.
 *   2. Deneme izni yalnız sandbox ortamında ve yalnız KESİN kapalı okumasında geçer; OKUNAMAYAN
 *      durumda izin ASLA geçmez.
 */

const SUPABASE = 'https://proje.supabase.co'
const ANAHTAR = 'service-role-anahtari'
const KULLANICI = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const BASKA = '11111111-2222-3333-4444-555555555555'
const SANDBOX = 'https://sandbox-api.iyzipay.com'
const PROD = 'https://api.iyzipay.com'
const CORS = { 'Access-Control-Allow-Origin': 'https://venthub.com.tr' }

interface Cagri {
  url: string
  method: string
  headers: Record<string, string>
  body: string
}

function sahte(davranis: (n: number) => Promise<Response>): { fetchImpl: FetchLike; cagrilar: Cagri[] } {
  const cagrilar: Cagri[] = []
  const fetchImpl: FetchLike = (url, init) => {
    cagrilar.push({ url, method: init.method, headers: init.headers, body: init.body ?? '' })
    return davranis(cagrilar.length)
  }
  return { fetchImpl, cagrilar }
}

function json(govde: unknown, status = 200): Promise<Response> {
  return Promise.resolve(new Response(typeof govde === 'string' ? govde : JSON.stringify(govde), { status }))
}

/** Sinyali YOK SAYAN, hiç dönmeyen fetch: zaman aşımı yarışının gerçekten çalıştığını kanıtlar. */
function asili(): Promise<Response> {
  return new Promise<Response>(() => undefined)
}

function girdi(fetchImpl: FetchLike, ek: Partial<SatisKipiGirdi> = {}): SatisKipiGirdi {
  return {
    supabaseUrl: SUPABASE,
    serviceRoleKey: ANAHTAR,
    tenantId: 'tenant-1',
    userId: KULLANICI,
    env: { IYZICO_BASE_URL: SANDBOX },
    fetchImpl,
    zamanAsimiMs: 25,
    requestId: 'req-1',
    corsHeaders: CORS,
    ...ek,
  }
}

async function govdeKodu(r: Response | null): Promise<string | undefined> {
  if (!r) return undefined
  const g: { error?: { code?: string } } = await r.json()
  return g.error?.code
}

describe('satisKipiKarari — RPC okuması: yalnız gerçek boolean true açar', () => {
  it('true → geçer, alarm yok', async () => {
    const { fetchImpl } = sahte(() => json({ acik: true, damga: null }))
    const s = await satisKipiKarari(girdi(fetchImpl))
    expect(s.engel).toBeNull()
    expect(s.neden).toBe('ACIK')
    expect(s.alarmlar).toEqual([])
  })

  it('false → 403 SALES_CLOSED, CORS ve X-Request-Id ile, alarm YOK', async () => {
    const { fetchImpl } = sahte(() => json({ acik: false, damga: null }))
    const s = await satisKipiKarari(girdi(fetchImpl))
    expect(s.engel?.status).toBe(403)
    expect(await govdeKodu(s.engel)).toBe('SALES_CLOSED')
    expect(s.engel?.headers.get('X-Request-Id')).toBe('req-1')
    expect(s.engel?.headers.get('Access-Control-Allow-Origin')).toBe('https://venthub.com.tr')
    expect(s.neden).toBe('KAPALI')
    expect(s.alarmlar).toEqual([])
  })

  it.each([
    ['string "true"', '{"acik":"true"}'],
    ['sayı 1', '{"acik":1}'],
    ['acik alanı yok', '{}'],
    ['dizi', '[]'],
    ['null', 'null'],
    ['JSON olmayan gövde', '<html>bad gateway</html>'],
  ])('bozuk cevap (%s) → 503 + alarm, ASLA geçmez', async (_ad, govde) => {
    const { fetchImpl } = sahte(() => json(govde))
    const s = await satisKipiKarari(girdi(fetchImpl))
    expect(s.engel).not.toBeNull()
    expect(s.engel?.status).toBe(503)
    expect(await govdeKodu(s.engel)).toBe('SALES_STATE_UNAVAILABLE')
    expect(s.engel?.headers.get('Retry-After')).toBe('30')
    expect(s.neden).toBe('BOZUK_CEVAP')
    expect(s.alarmlar.map((a) => a.code)).toEqual(['SALES_MODE_UNREADABLE'])
  })

  it.each([
    ['404 (RPC henüz yok)', 404, 'RPC_YOK'],
    ['401', 401, 'YETKI'],
    ['403', 403, 'YETKI'],
    ['500', 500, 'HATA'],
    ['502', 502, 'HATA'],
  ])('HTTP %s → 503 + alarm (%s)', async (_ad, status, neden) => {
    const { fetchImpl } = sahte(() => json({ message: 'x' }, status))
    const s = await satisKipiKarari(girdi(fetchImpl))
    expect(s.engel?.status).toBe(503)
    expect(s.neden).toBe(neden)
    expect(s.alarmlar[0]?.code).toBe('SALES_MODE_UNREADABLE')
    expect(s.alarmlar[0]?.extra.neden).toBe(neden)
  })

  it('fetch fırlatırsa (ağ yok) → 503 HATA, satış açılmaz', async () => {
    const { fetchImpl } = sahte(() => Promise.reject(new TypeError('network')))
    const s = await satisKipiKarari(girdi(fetchImpl))
    expect(s.engel?.status).toBe(503)
    expect(s.neden).toBe('HATA')
  })
})

describe('satisDurumuOku — izleme için: açık / kapalı / okunamadı (bilgisizlik "kapalı" değildir)', () => {
  const oku = (davranis: (n: number) => Promise<Response>, zamanAsimiMs?: number) => {
    const { fetchImpl } = sahte(davranis)
    return satisDurumuOku({ supabaseUrl: SUPABASE, serviceRoleKey: ANAHTAR, fetchImpl, zamanAsimiMs })
  }

  it('gerçek boolean true → acik, false → kapali', async () => {
    expect(await oku(() => json({ acik: true }))).toBe('acik')
    expect(await oku(() => json({ acik: false }))).toBe('kapali')
  })

  it('geri kalan HER biçim okunamadi (kapali sayılmaz; healthz istisnası açılmaz)', async () => {
    expect(await oku(() => json({ acik: 'true' }))).toBe('okunamadi')
    expect(await oku(() => json({ acik: 1 }))).toBe('okunamadi')
    expect(await oku(() => json('json degil'))).toBe('okunamadi')
    expect(await oku(() => json({}, 404))).toBe('okunamadi')
    expect(await oku(() => json({}, 401))).toBe('okunamadi')
    expect(await oku(() => json({}, 500))).toBe('okunamadi')
    expect(await oku(() => Promise.reject(new Error('ag yok')))).toBe('okunamadi')
  })

  it('zaman aşımı okunamadi (asılı fetch beklemeyi bitirir)', async () => {
    expect(await oku(() => asili(), 20)).toBe('okunamadi')
  })
})

describe('satisKipiKarari — zaman aşımı (sinyali yok sayan sahte fetch ile)', () => {
  it('iki deneme de asılırsa → 503 ZAMAN_ASIMI ve fetch TAM İKİ kez çağrılır', async () => {
    const { fetchImpl, cagrilar } = sahte(() => asili())
    const t0 = Date.now()
    const s = await satisKipiKarari(girdi(fetchImpl))
    expect(s.neden).toBe('ZAMAN_ASIMI')
    expect(s.engel?.status).toBe(503)
    expect(cagrilar).toHaveLength(2)
    expect(Date.now() - t0).toBeLessThan(1000)
  })

  it('ilk deneme asılır, ikincisi true dönerse → geçer (tek yeniden deneme)', async () => {
    const { fetchImpl, cagrilar } = sahte((n) => (n === 1 ? asili() : json({ acik: true })))
    const s = await satisKipiKarari(girdi(fetchImpl))
    expect(s.neden).toBe('ACIK')
    expect(cagrilar).toHaveLength(2)
  })

  it('HTTP hatası TEKRAR DENENMEZ (yalnız zaman aşımı idempotent okumada denenir)', async () => {
    const { fetchImpl, cagrilar } = sahte(() => json({}, 500))
    await satisKipiKarari(girdi(fetchImpl))
    expect(cagrilar).toHaveLength(1)
  })
})

describe('satisKipiKarari — istek sözleşmesi', () => {
  it('parametresiz RPC: POST, gövde {}, servis anahtarı; tenant gövdeye KONMAZ', async () => {
    const { fetchImpl, cagrilar } = sahte(() => json({ acik: true }))
    await satisKipiKarari(girdi(fetchImpl, { tenantId: 'tenant-XYZ' }))
    expect(cagrilar).toHaveLength(1)
    const c = cagrilar[0]
    expect(c.url).toBe(`${SUPABASE}/rest/v1/rpc/satis_kipi_oku`)
    expect(c.method).toBe('POST')
    expect(c.body).toBe('{}')
    expect(c.headers.Authorization).toBe(`Bearer ${ANAHTAR}`)
    expect(c.headers.apikey).toBe(ANAHTAR)
    expect(JSON.stringify(c)).not.toContain('tenant-XYZ')
  })
})

describe('deneme izni (B′) — yalnız sandbox VE listede VE kesin KAPALI', () => {
  const kapali = () => json({ acik: false })
  const liste = { SATIS_KIPI_DENEME_KULLANICILARI: KULLANICI }

  it('sandbox + listede + kapalı → geçer, neden DENEME_IZNI, alarm yok', async () => {
    const { fetchImpl } = sahte(kapali)
    const s = await satisKipiKarari(girdi(fetchImpl, { env: { IYZICO_BASE_URL: SANDBOX, ...liste } }))
    expect(s.engel).toBeNull()
    expect(s.neden).toBe('DENEME_IZNI')
    expect(s.alarmlar).toEqual([])
  })

  it('sandbox + listede DEĞİL → 403', async () => {
    const { fetchImpl } = sahte(kapali)
    const s = await satisKipiKarari(
      girdi(fetchImpl, { userId: BASKA, env: { IYZICO_BASE_URL: SANDBOX, ...liste } }),
    )
    expect(s.engel?.status).toBe(403)
    expect(s.neden).toBe('KAPALI')
  })

  it('CANLI ortam + listede → 403 + liste-unutuldu alarmı (izin ÖLÜR)', async () => {
    const { fetchImpl } = sahte(kapali)
    const s = await satisKipiKarari(girdi(fetchImpl, { env: { IYZICO_BASE_URL: PROD, ...liste } }))
    expect(s.engel?.status).toBe(403)
    expect(s.neden).toBe('KAPALI')
    expect(s.alarmlar.map((a) => a.code)).toEqual(['SALES_TRIAL_LIST_ON_NON_SANDBOX'])
    expect(s.alarmlar[0].extra.ortam).toBe('prod')
  })

  it('ortam BELİRLENEMEZ (IYZICO_BASE_URL yok) + listede → izin YOK + alarm', async () => {
    const { fetchImpl } = sahte(kapali)
    const s = await satisKipiKarari(girdi(fetchImpl, { env: { ...liste } }))
    expect(s.engel?.status).toBe(403)
    expect(s.alarmlar[0]?.code).toBe('SALES_TRIAL_LIST_ON_NON_SANDBOX')
    expect(s.alarmlar[0]?.extra.ortam).toBe('bilinmiyor')
  })

  it('OKUNAMAYAN durumda izin GEÇMEZ: sandbox + listede + 500 → 503', async () => {
    const { fetchImpl } = sahte(() => json({}, 500))
    const s = await satisKipiKarari(girdi(fetchImpl, { env: { IYZICO_BASE_URL: SANDBOX, ...liste } }))
    expect(s.engel?.status).toBe(503)
    expect(s.neden).toBe('HATA')
  })

  it('bozuk cevapta ve zaman aşımında da izin GEÇMEZ', async () => {
    const bozuk = sahte(() => json('{"acik":"true"}'))
    const s1 = await satisKipiKarari(girdi(bozuk.fetchImpl, { env: { IYZICO_BASE_URL: SANDBOX, ...liste } }))
    expect(s1.engel?.status).toBe(503)
    const asilan = sahte(() => asili())
    const s2 = await satisKipiKarari(girdi(asilan.fetchImpl, { env: { IYZICO_BASE_URL: SANDBOX, ...liste } }))
    expect(s2.engel?.status).toBe(503)
  })

  it('canlıya geçiş: satış AÇIK + liste dolu + canlı ortam → geçer AMA alarm yazılır (liste boşaltılmalı)', async () => {
    const { fetchImpl } = sahte(() => json({ acik: true }))
    const s = await satisKipiKarari(girdi(fetchImpl, { env: { IYZICO_BASE_URL: PROD, ...liste } }))
    expect(s.engel).toBeNull()
    expect(s.alarmlar.map((a) => a.code)).toEqual(['SALES_TRIAL_LIST_ON_NON_SANDBOX'])
  })

  it('liste BOŞ ya da yok → alarm yok, izin yok', async () => {
    const { fetchImpl } = sahte(kapali)
    const s = await satisKipiKarari(
      girdi(fetchImpl, { env: { IYZICO_BASE_URL: PROD, SATIS_KIPI_DENEME_KULLANICILARI: '  ' } }),
    )
    expect(s.engel?.status).toBe(403)
    expect(s.alarmlar).toEqual([])
  })
})

describe('deneme listesi ayrıştırma ve eşleşme', () => {
  it('virgül, noktalı virgül, boşluk ve satır sonu ayırır; büyük harf normalleşir; geçersiz girdi atılır', () => {
    const ham = `${KULLANICI.toUpperCase()}, ${BASKA};\nyanlis-kimlik  ${KULLANICI}`
    expect(denemeListesiniAyristir(ham)).toEqual([KULLANICI, BASKA, KULLANICI])
    expect(denemeListesiniAyristir(undefined)).toEqual([])
    expect(denemeListesiniAyristir('')).toEqual([])
  })

  it('eşleşme TAM kimliktir: önek ya da içerme eşleşmesi izin vermez', () => {
    const env = { IYZICO_BASE_URL: SANDBOX, SATIS_KIPI_DENEME_KULLANICILARI: KULLANICI }
    expect(denemeIzniHukmu(env, KULLANICI).var).toBe(true)
    expect(denemeIzniHukmu(env, KULLANICI.toUpperCase()).var).toBe(true)
    expect(denemeIzniHukmu(env, KULLANICI.slice(0, 8)).var).toBe(false)
    expect(denemeIzniHukmu(env, `${KULLANICI}-x`).var).toBe(false)
    expect(denemeIzniHukmu(env, '').var).toBe(false)
  })

  it('sandbox = belgelenmiş TAM konak: "sandbox" içeren benzer konaklar izin VERMEZ ve ortam belirsiz sayılır', () => {
    const liste = { SATIS_KIPI_DENEME_KULLANICILARI: KULLANICI }
    const benzerler = [
      'https://sandbox-proxy.ornek.com',
      'https://api.iyzipay.com.sandbox.ornek.com',
      'https://sandbox-api.iyzipay.com.ornek.com',
      'https://sandbox-api.iyzipay.co',
    ]
    for (const url of benzerler) {
      const h = denemeIzniHukmu({ IYZICO_BASE_URL: url, ...liste }, KULLANICI)
      expect(h.var, url).toBe(false)
      expect(h.ortam, url).toBe('bilinmiyor')
      expect(h.listeDolu, url).toBe(true)
    }
    // Yol ve kullanıcı-adı hileleri de sandbox sayılmaz (prod konağı).
    for (const url of ['https://api.iyzipay.com/sandbox', 'https://sandbox@api.iyzipay.com']) {
      expect(denemeIzniHukmu({ IYZICO_BASE_URL: url, ...liste }, KULLANICI).var, url).toBe(false)
    }
    // Gerçek sandbox konağı (sondaki eğik çizgi ve büyük harf dahil) hâlâ çalışır.
    expect(denemeIzniHukmu({ IYZICO_BASE_URL: 'https://SANDBOX-API.iyzipay.com/', ...liste }, KULLANICI).var).toBe(true)
  })

  it('atılan liste girdisi günlüğe SAYI olarak yazılır, kimlik değeri yazılmaz', () => {
    const uyari: string[] = []
    const asil = console.warn
    console.warn = (...a: unknown[]) => void uyari.push(a.join(' '))
    try {
      denemeIzniHukmu({ IYZICO_BASE_URL: SANDBOX, SATIS_KIPI_DENEME_KULLANICILARI: `kimlik-degil, ${KULLANICI}` }, KULLANICI)
    } finally {
      console.warn = asil
    }
    expect(uyari.join('|')).toContain('1 geçersiz girdi')
    expect(uyari.join('|')).not.toContain('kimlik-degil')
    expect(uyari.join('|')).not.toContain(KULLANICI)
  })

  it('yalnız geçersiz girdi içeren liste: izin yok AMA liste dolu sayılır (canlıda unutulmuş liste alarmı)', () => {
    const h = denemeIzniHukmu({ IYZICO_BASE_URL: PROD, SATIS_KIPI_DENEME_KULLANICILARI: 'kimlik-degil' }, KULLANICI)
    expect(h.var).toBe(false)
    expect(h.listeDolu).toBe(true)
  })
})

describe('denemeSiparisiKaydet — izinli sipariş siparişten ÖNCE denetim günlüğüne yazılır', () => {
  const g = (fetchImpl: FetchLike) => ({
    supabaseUrl: SUPABASE,
    serviceRoleKey: ANAHTAR,
    tenantId: 'tenant-1',
    orderId: 'order-uuid',
    userId: KULLANICI,
    requestId: 'req-1',
    ortam: 'sandbox' as const,
    fetchImpl,
  })

  it('admin_audit_log satırını doğru alanlarla yazar ve true döner', async () => {
    const { fetchImpl, cagrilar } = sahte(() => Promise.resolve(new Response(null, { status: 201 })))
    expect(await denemeSiparisiKaydet(g(fetchImpl))).toBe(true)
    expect(cagrilar[0].url).toBe(`${SUPABASE}/rest/v1/admin_audit_log`)
    const govde: Record<string, unknown> = JSON.parse(cagrilar[0].body)
    expect(govde.table_name).toBe('venthub_orders')
    expect(govde.row_pk).toBe('order-uuid')
    expect(govde.action).toBe('satis_kipi_deneme_izni')
    expect(govde.tenant_id).toBe('tenant-1')
    expect(govde.after).toEqual({ neden: 'DENEME_IZNI', user_id: KULLANICI, ortam: 'sandbox', request_id: 'req-1' })
  })

  it('yazılamazsa (HTTP hatası ya da ağ hatası) false döner: çağıran sipariş OLUŞTURMAZ', async () => {
    const hata = sahte(() => Promise.resolve(new Response('x', { status: 500 })))
    expect(await denemeSiparisiKaydet(g(hata.fetchImpl))).toBe(false)
    const ag = sahte(() => Promise.reject(new TypeError('network')))
    expect(await denemeSiparisiKaydet(g(ag.fetchImpl))).toBe(false)
  })
})

describe('deneme işareti — yazan ve okuyanlar TEK sabitten (OPS şartı, row_pk birleşimi)', () => {
  const ORDER_A = 'aaaa1111-0000-0000-0000-000000000001'
  const ORDER_B = 'bbbb2222-0000-0000-0000-000000000002'
  const ORDER_C = 'cccc3333-0000-0000-0000-000000000003'

  it('yazılan satır ile okuma sorgusu AYNI işaret sabitini kullanır (yazma/okuma kayması yakalanır)', () => {
    const govde = denemeKaydiGovdesi({ orderId: ORDER_A, userId: KULLANICI, ortam: 'sandbox', requestId: 'r', tenantId: 't1' })
    expect(govde.table_name).toBe(DENEME_ISARETI.table_name)
    expect(govde.action).toBe(DENEME_ISARETI.action)
    const sorgu = new URL(denemeIsaretleriSorgusu(SUPABASE, 't1'))
    expect(sorgu.pathname).toBe('/rest/v1/admin_audit_log')
    expect(sorgu.searchParams.get('table_name')).toBe(`eq.${govde.table_name}`)
    expect(sorgu.searchParams.get('action')).toBe(`eq.${govde.action}`)
    expect(sorgu.searchParams.get('select')).toBe('row_pk')
    expect(sorgu.searchParams.get('tenant_id')).toBe('eq.t1')
    expect(new URL(denemeIsaretleriSorgusu(`${SUPABASE}/`)).searchParams.has('tenant_id')).toBe(false)
  })

  it('ayırma: işaretli sipariş deneme, işaretsiz gerçek; büyük/küçük harf ve boşluk farkı eşleşmeyi bozmaz', () => {
    const siparisler = [{ id: ORDER_A }, { id: ORDER_B }, { id: ORDER_C }]
    const r = denemeSiparisleriniAyir(siparisler, [{ row_pk: ORDER_A.toUpperCase() }, { row_pk: ` ${ORDER_C} ` }, { row_pk: null }])
    expect(r.deneme.map((s) => s.id)).toEqual([ORDER_A, ORDER_C])
    expect(r.gercek.map((s) => s.id)).toEqual([ORDER_B])
    expect(r.belirsiz).toEqual([])
  })

  it('işaret listesi OKUNAMADIYSA (null) hiçbir sipariş "gerçek" sayılmaz: hepsi belirsiz', () => {
    const r = denemeSiparisleriniAyir([{ id: ORDER_A }, { id: ORDER_B }], null)
    expect(r.gercek).toEqual([])
    expect(r.deneme).toEqual([])
    expect(r.belirsiz).toHaveLength(2)
  })

  it('boş işaret listesi: hepsi gerçek (işaret yok = deneme yok)', () => {
    const r = denemeSiparisleriniAyir([{ id: ORDER_A }], [])
    expect(r.gercek).toHaveLength(1)
    expect(r.belirsiz).toEqual([])
  })

  it('denemeIsaretleriniOku: doğru URL ve servis anahtarıyla GET; satırları döner', async () => {
    const { fetchImpl, cagrilar } = sahte(() =>
      Promise.resolve(new Response(JSON.stringify([{ row_pk: ORDER_A }, { row_pk: 5 }, {}]), { status: 200 })),
    )
    const sonuc = await denemeIsaretleriniOku({ supabaseUrl: SUPABASE, serviceRoleKey: ANAHTAR, tenantId: 't1', fetchImpl })
    expect(sonuc).toEqual([{ row_pk: ORDER_A }, { row_pk: null }, { row_pk: null }])
    expect(cagrilar[0].url).toBe(denemeIsaretleriSorgusu(SUPABASE, 't1'))
    expect(cagrilar[0].method).toBe('GET')
  })

  it('denemeIsaretleriniOku: HTTP hatası, dizi olmayan gövde, ağ hatası ve bozuk JSON\'da null (fail-closed)', async () => {
    const oku = (fetchImpl: FetchLike) => denemeIsaretleriniOku({ supabaseUrl: SUPABASE, serviceRoleKey: ANAHTAR, fetchImpl })
    expect(await oku(sahte(() => Promise.resolve(new Response('x', { status: 500 }))).fetchImpl)).toBeNull()
    expect(await oku(sahte(() => Promise.resolve(new Response('{"hata":1}', { status: 200 }))).fetchImpl)).toBeNull()
    expect(await oku(sahte(() => Promise.reject(new TypeError('network'))).fetchImpl)).toBeNull()
    expect(await oku(sahte(() => Promise.resolve(new Response('{', { status: 200 }))).fetchImpl)).toBeNull()
  })
})
