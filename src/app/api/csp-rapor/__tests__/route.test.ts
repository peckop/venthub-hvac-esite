// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  belgeYolunuAyikla,
  CSP_RAPOR_GOVDE_TAVANI,
  CSP_RAPOR_ORAN,
  cspRaporlariniAyikla,
  engelleneniAyikla,
  oranSinirlayiciKur,
} from '@/lib/security/cspRapor'

/**
 * INV-CSP-RAPOR-1 (davranış kolu) · güvenlik karnesi 2026-11 C1, OPS-211 · cetvel csp-standard.md §9.
 *
 * Korunan kusur sınıfları:
 *  (a) uç kişisel veri loglar: belge adresinin sorgu dizesi, e-posta/UUID yol parçası, betik örneği, IP;
 *  (b) uç sınırsız gövde kabul eder (bellek/log taşırma);
 *  (c) uç oran sınırsızdır (log seli);
 *  (d) iki rapor biçiminden biri (report-uri / report-to) sessizce düşer.
 */

const URL_ = 'https://venthub.com.tr/api/csp-rapor'

function istek(govde: string, tur = 'application/csp-report', ip = '203.0.113.7', ekBaslik: Record<string, string> = {}) {
  return new NextRequest(URL_, {
    method: 'POST',
    body: govde,
    headers: { 'content-type': tur, 'x-real-ip': ip, ...ekBaslik },
  })
}

const ESKI = JSON.stringify({
  'csp-report': {
    'document-uri': 'https://venthub.com.tr/tr/account/orders/3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab?email=ali@ornek.com',
    referrer: 'https://venthub.com.tr/tr/auth/login?next=/tr/account',
    'violated-directive': 'script-src-elem',
    'effective-directive': 'script-src-elem',
    'blocked-uri': 'https://kotu.example.com/izle.js?uid=12345',
    'script-sample': 'ali@ornek.com gizli metin',
    'source-file': 'https://venthub.com.tr/_next/static/chunks/app.js?token=abc',
    disposition: 'report',
    'status-code': 200,
  },
})

const YENI = JSON.stringify([
  {
    type: 'csp-violation',
    age: 1,
    url: 'https://venthub.com.tr/tr/cart?kupon=GIZLI',
    user_agent: 'Mozilla/5.0 ozel',
    body: {
      documentURL: 'https://venthub.com.tr/tr/cart?kupon=GIZLI',
      effectiveDirective: 'connect-src',
      blockedURL: 'wss://bilinmeyen.example.net/socket/abc',
      disposition: 'report',
      sample: 'gizli',
      statusCode: 200,
    },
  },
  { type: 'deprecation', body: { id: 'x' } },
])

describe('INV-CSP-RAPOR-1: CSP rapor ucu', () => {
  let uyari: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    uyari = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    uyari.mockRestore()
  })

  const rota = async () => (await import('../route')).POST

  it('eski biçim (report-uri) 204 döner ve tek ayıklanmış satır loglar', async () => {
    const POST = await rota()
    const yanit = await POST(istek(ESKI))
    expect(yanit.status).toBe(204)
    expect(uyari).toHaveBeenCalledTimes(1)
    const satir = JSON.parse(String(uyari.mock.calls[0]?.[0]))
    expect(satir).toEqual({
      tur: 'csp-ihlali',
      direktif: 'script-src-elem',
      engellenen: 'https://kotu.example.com',
      belge: '/tr/account/orders/:id',
      kip: 'report',
      durum: 200,
    })
  })

  it('yeni biçim (report-to) yalnız csp-violation raporlarını sayar', async () => {
    const POST = await rota()
    const yanit = await POST(istek(YENI, 'application/reports+json'))
    expect(yanit.status).toBe(204)
    expect(uyari).toHaveBeenCalledTimes(1)
    const satir = JSON.parse(String(uyari.mock.calls[0]?.[0]))
    expect(satir.direktif).toBe('connect-src')
    expect(satir.engellenen).toBe('wss://bilinmeyen.example.net')
    expect(satir.belge).toBe('/tr/cart')
  })

  it('KİŞİSEL VERİ LOGLANMAZ: sorgu, e-posta, UUID, betik örneği, IP, kullanıcı aracısı, yönlendiren', async () => {
    const POST = await rota()
    await POST(istek(ESKI))
    await POST(istek(YENI, 'application/reports+json'))
    const tumu = uyari.mock.calls.map((c: unknown[]) => String(c[0])).join('\n')
    for (const yasak of [
      'ali@ornek.com',
      '3f2b8c1e',
      'email=',
      'uid=',
      'token=',
      'kupon',
      'GIZLI',
      'gizli',
      '203.0.113.7',
      'Mozilla',
      'auth/login',
      'chunks/app.js',
    ]) {
      expect(tumu, `log satırında "${yasak}" var`).not.toContain(yasak)
    }
  })

  it('gövde tavanı: Content-Length beyanı aşınca 413, hiçbir şey loglanmaz', async () => {
    const POST = await rota()
    const yanit = await POST(istek(ESKI, 'application/csp-report', '203.0.113.8', { 'content-length': String(CSP_RAPOR_GOVDE_TAVANI + 1) }))
    expect(yanit.status).toBe(413)
    expect(uyari).not.toHaveBeenCalled()
  })

  it('gövde tavanı: beyan yoksa da akış sayılır, büyük gövde 413', async () => {
    const POST = await rota()
    const buyuk = JSON.stringify({ 'csp-report': { 'blocked-uri': 'x'.repeat(CSP_RAPOR_GOVDE_TAVANI) } })
    const yanit = await POST(istek(buyuk, 'application/csp-report', '203.0.113.9'))
    expect(yanit.status).toBe(413)
  })

  it('yanlış içerik türü 415, bozuk JSON 400, tanınmayan biçim 204 ve log yok', async () => {
    const POST = await rota()
    expect((await POST(istek(ESKI, 'text/plain', '198.51.100.1'))).status).toBe(415)
    expect((await POST(istek('{bozuk', 'application/csp-report', '198.51.100.2'))).status).toBe(400)
    expect((await POST(istek('{"baska":1}', 'application/json', '198.51.100.3'))).status).toBe(204)
    expect(uyari).not.toHaveBeenCalled()
  })

  it('oran sınırı: aynı istemci pencere içinde tavanı aşınca 429', async () => {
    const POST = await rota()
    const durumlar: number[] = []
    for (let i = 0; i < CSP_RAPOR_ORAN.istemciBasina + 2; i++) {
      durumlar.push((await POST(istek(ESKI, 'application/csp-report', '192.0.2.50'))).status)
    }
    expect(durumlar.slice(0, CSP_RAPOR_ORAN.istemciBasina).every((d) => d === 204)).toBe(true)
    expect(durumlar.slice(CSP_RAPOR_ORAN.istemciBasina)).toEqual([429, 429])
    // Başka istemci etkilenmez.
    expect((await POST(istek(ESKI, 'application/csp-report', '192.0.2.51'))).status).toBe(204)
  })
})

describe('INV-CSP-RAPOR-1: ayıklayıcı ve sınırlayıcı birimleri', () => {
  it('engellenen kaynak yalnız köken ya da anahtar sözcük olur', () => {
    expect(engelleneniAyikla('https://a.example.com/yol?q=1')).toBe('https://a.example.com')
    expect(engelleneniAyikla('inline')).toBe('inline')
    expect(engelleneniAyikla('eval')).toBe('eval')
    expect(engelleneniAyikla('data:text/html;base64,AAAA')).toBe('data')
    expect(engelleneniAyikla('chrome-extension://abcdef/x.js')).toBe('chrome-extension')
    expect(engelleneniAyikla(42)).toBe('bilinmiyor')
    expect(engelleneniAyikla('yol/degil url')).toBe('gecersiz')
  })

  it('belge yolu: sorgu atılır, kimlik biçimli parçalar maskelenir', () => {
    expect(belgeYolunuAyikla('https://x.com/tr/siparis/123456?a=b#c')).toBe('/tr/siparis/:id')
    expect(belgeYolunuAyikla('https://x.com/tr/u/ali%40ornek.com')).toBe('/tr/u/:id')
    expect(belgeYolunuAyikla('https://x.com/tr/sifirla/' + 'a'.repeat(40))).toBe('/tr/sifirla/:id')
    expect(belgeYolunuAyikla('https://x.com/tr/urunler/kanal-fani')).toBe('/tr/urunler/kanal-fani')
  })

  it('toplu gönderim tavanı: en çok 20 rapor işlenir', () => {
    const cok = Array.from({ length: 50 }, () => ({ type: 'csp-violation', body: { effectiveDirective: 'img-src' } }))
    expect(cspRaporlariniAyikla(cok)).toHaveLength(20)
  })

  it('sınırlayıcı: pencere dolunca sıfırlanır, toplam ve anahtar tavanı uygulanır', () => {
    let t = 0
    const izin = oranSinirlayiciKur({ pencereMs: 1000, istemciBasina: 2, toplam: 3, anahtarTavani: 2 }, () => t)
    expect([izin('a'), izin('a'), izin('a')]).toEqual([true, true, false])
    expect(izin('b')).toBe(true)
    expect(izin('b')).toBe(false) // toplam tavan (3) doldu
    t = 1000
    expect(izin('a')).toBe(true)
    expect(izin('b')).toBe(true)
    expect(izin('c')).toBe(false) // anahtar tavanı (2) doldu
  })
})
