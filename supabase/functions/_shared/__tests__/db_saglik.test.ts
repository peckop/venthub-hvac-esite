import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { DB_SAGLIK_TABLO, dbSaglikOlc, type FetchFn } from '../db_saglik'

/**
 * `healthz` DB ölçümünün SÖZLEŞMESİ (REC-355 alt işi · 2026-09-29).
 *
 * Kapatılan sınıf: **kör izleme**. Eski ölçüm `POST /rest/v1/rpc/now` idi; `now()` yalnız
 * `pg_catalog`'da, PostgREST yalnız `public` şemasını sunar → DB sağlam olsa da HER ZAMAN 404.
 * Uç canlıda hep "bozuk" göründüğü için gerçek bir DB arızası "her zamanki 404"ten ayırt
 * edilemiyordu.
 *
 * Aşağıdaki sahte ağ PostgREST'in şema görünürlüğünü modeller (yalnız public tablolar +
 * public fonksiyonlar). Böylece ÖNCE/SONRA aynı modelde ölçülür: eski çağrı modelde 404
 * verir (kör), yeni çağrı 200 verir; DB düşünce yeni çağrı da kırmızıya döner.
 */

const URL_ = 'https://proje.supabase.co'
const ANAHTAR = 'service-role-anahtari'

type Model = { publicTablolar: string[]; dbAyakta: boolean }

function postgrestModeli(m: Model): FetchFn {
  return async (girdi, init) => {
    if (!m.dbAyakta) return new Response(null, { status: 503 })
    const yol = new URL(girdi).pathname.replace('/rest/v1/', '')
    const yontem = init?.method ?? 'GET'
    // Fonksiyon çağrıları yalnız public şemadan sunulur; now() pg_catalog'da → PGRST202/404.
    if (yol.startsWith('rpc/')) return new Response('{"code":"PGRST202"}', { status: 404 })
    if (m.publicTablolar.includes(yol)) {
      return yontem === 'HEAD' ? new Response(null, { status: 200 }) : new Response('[]', { status: 200 })
    }
    return new Response('{"code":"PGRST205"}', { status: 404 })
  }
}

describe('dbSaglikOlc — ÖNCE/SONRA aynı PostgREST modelinde', () => {
  const saglam: Model = { publicTablolar: [DB_SAGLIK_TABLO], dbAyakta: true }

  it('ÖNCE: eski rpc/now çağrısı DB sağlamken bile 404 alır (izleme kördü)', async () => {
    const eski = await postgrestModeli(saglam)(`${URL_}/rest/v1/rpc/now`, { method: 'POST' })
    expect(eski.status).toBe(404)
  })

  it('SONRA: DB sağlamken ölçüm sağlıklı', async () => {
    expect(await dbSaglikOlc({ supabaseUrl: URL_, serviceKey: ANAHTAR, fetchImpl: postgrestModeli(saglam) })).toEqual({
      ok: true,
    })
  })

  it('DB gerçekten düşünce ölçüm bozuk döner (HTTP 503, durum taşınır)', async () => {
    const dusuk: Model = { ...saglam, dbAyakta: false }
    expect(await dbSaglikOlc({ supabaseUrl: URL_, serviceKey: ANAHTAR, fetchImpl: postgrestModeli(dusuk) })).toEqual({
      ok: false,
      neden: 'HTTP',
      status: 503,
    })
  })

  it('bilinen tablo yoksa (şema kaydı bozuldu) bozuk döner, sağlıklı değil', async () => {
    const tabloYok: Model = { publicTablolar: [], dbAyakta: true }
    expect(await dbSaglikOlc({ supabaseUrl: URL_, serviceKey: ANAHTAR, fetchImpl: postgrestModeli(tabloYok) })).toEqual({
      ok: false,
      neden: 'HTTP',
      status: 404,
    })
  })
})

describe('dbSaglikOlc — istek biçimi ve hata kolları', () => {
  it('HEAD atar, anahtarı başlıkta taşır (URL içinde değil), tek istek yapar', async () => {
    const cagrilar: { url: string; init: RequestInit | undefined }[] = []
    const izci: FetchFn = async (u, init) => {
      cagrilar.push({ url: u, init })
      return new Response(null, { status: 200 })
    }
    await dbSaglikOlc({ supabaseUrl: URL_, serviceKey: ANAHTAR, fetchImpl: izci })
    expect(cagrilar).toHaveLength(1)
    expect(cagrilar[0].init?.method).toBe('HEAD')
    expect(cagrilar[0].url).toBe(`${URL_}/rest/v1/${DB_SAGLIK_TABLO}?limit=1`)
    expect(cagrilar[0].url).not.toContain(ANAHTAR)
    const baslik = cagrilar[0].init?.headers as Record<string, string>
    expect(baslik.Authorization).toBe(`Bearer ${ANAHTAR}`)
    expect(baslik.apikey).toBe(ANAHTAR)
  })

  it('ağ hatası fırlatırsa bozuk (AG), sağlıklı DEĞİL', async () => {
    const kopuk: FetchFn = async () => {
      throw new TypeError('fetch failed')
    }
    expect(await dbSaglikOlc({ supabaseUrl: URL_, serviceKey: ANAHTAR, fetchImpl: kopuk })).toEqual({
      ok: false,
      neden: 'AG',
      status: null,
    })
  })

  it('sinyali yok sayan asılı fetch bile zaman aşımıyla biter (ölçüm asılı kalmaz)', async () => {
    const asili: FetchFn = () => new Promise<Response>(() => {})
    const t0 = Date.now()
    const s = await dbSaglikOlc({ supabaseUrl: URL_, serviceKey: ANAHTAR, fetchImpl: asili, zamanAsimiMs: 40 })
    expect(s).toEqual({ ok: false, neden: 'ZAMAN_ASIMI', status: null })
    expect(Date.now() - t0).toBeLessThan(2000)
  })
})

describe('healthz ucu — DB adımı kör çağrıya geri dönemez (SABOTAJ KOLU)', () => {
  // Kural: healthz DB'yi dbSaglikOlc ile ölçer; `rpc/now` (pg_catalog fonksiyonu) çağrılmaz.
  function kusurlar(kaynak: string): string[] {
    const bulgu: string[] = []
    // Yorum satırları (`//` ile başlayanlar) kod sayılmaz; satır tabanlı, çünkü kod satırındaki
    // `https://` şemasını yorum sanan bir sıyırıcı bekçiyi sessizce kör bırakır (INV-SCRUB-1).
    const kod = kaynak
      .split('\n')
      .filter((satir) => !satir.trimStart().startsWith('//'))
      .join('\n')
    if (/\/rest\/v1\/rpc\/now/.test(kod)) {
      bulgu.push('rpc/now: PostgREST public dışını sunmaz, hep 404')
    }
    if (!/dbSaglikOlc\s*\(/.test(kaynak)) bulgu.push('dbSaglikOlc çağrısı yok')
    if (!/from\s+'\.\.\/_shared\/db_saglik\.ts'/.test(kaynak)) bulgu.push('db_saglik.ts içe aktarılmıyor')
    return bulgu
  }
  const kaynak = readFileSync(join(__dirname, '..', '..', 'healthz', 'index.ts'), 'utf8')

  it('gerçek healthz temiz', () => {
    expect(kusurlar(kaynak)).toEqual([])
  })

  it('sabotaj: eski rpc/now çağrısı geri konursa kırmızı yanar', () => {
    const bozuk = kaynak.replace(
      /const db = await dbSaglikOlc\([^)]*\)/,
      'const db = await fetch(`${supabaseUrl}/rest/v1/rpc/now`, { method: "POST" })',
    )
    expect(bozuk).not.toBe(kaynak)
    expect(kusurlar(bozuk).length).toBeGreaterThan(0)
  })
})
