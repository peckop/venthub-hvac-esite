import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * T014-VH — BU TESTİN GEREKSİNİMİ BİLEREK DEĞİŞTİ.
 *
 * Eski hâlinde burada `it('should not warn in production mode ...')` diye bir test vardı
 * ve `reportError`'ın production'da HİÇBİR ŞEY yapmamasını "doğru davranış" olarak
 * kilitliyordu. Bu yanlış bir gereksinimdi: prod'daki ödeme akışı hataları (ve
 * ErrorBoundary'ye düşen çökmeler) hiçbir yere gitmiyordu, üstelik `log-client-error`
 * edge fonksiyonu (client_errors + error_groups + Slack + admin ekranı) canlı ve hazır
 * beklerken. Yeni gereksinim: production'da GERÇEKTEN gönderir; dev'de yalnız uyarır.
 * Aşağıdaki testler ağ çağrısı YAPMAZ — `fetch` ve supabase client mock'lanmıştır.
 */

vi.mock('../supabase/client', () => ({
  supabaseBrowserClient: {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: { access_token: 'user-access-token' } },
        error: null,
      })),
    },
  },
}))

const SUPABASE_URL = 'https://project.supabase.co'
const ANON_KEY = 'anon-key'
const ENDPOINT = `${SUPABASE_URL}/functions/v1/log-client-error`

/** Modül düzeyindeki de-dup durumunu her testte sıfırlamak için taze import. */
async function loadReporter() {
  vi.resetModules()
  const mod = await import('../errorReporter')
  return mod.reportError
}

function parseBody(call: unknown[]): Record<string, unknown> {
  const init = call[1] as RequestInit
  return JSON.parse(String(init.body)) as Record<string, unknown>
}

describe('reportError', () => {
  let consoleWarnMock: ReturnType<typeof vi.spyOn>
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock = vi.fn(async () => new Response('ok', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ANON_KEY)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  describe('development davranışı', () => {
    it('window tanımlıysa uyarır ve ağa hiçbir şey göndermez', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubGlobal('window', {})
      const reportError = await loadReporter()

      const error = new Error('Test error')
      const context = { context: 'unit test' }

      reportError(error, context)

      expect(consoleWarnMock).toHaveBeenCalledWith('[errorReporter]', error, context)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('window tanımsızsa (SSR/RSC) hiçbir şey yapmaz', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubGlobal('window', undefined)
      const reportError = await loadReporter()

      reportError(new Error('Test error'))

      expect(consoleWarnMock).not.toHaveBeenCalled()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('Error olmayan değerleri throw etmeden işler', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubGlobal('window', {})
      const reportError = await loadReporter()

      expect(() => reportError('Just a string', { id: 1 })).not.toThrow()
      expect(consoleWarnMock).toHaveBeenCalledWith('[errorReporter]', 'Just a string', { id: 1 })
    })
  })

  describe('production davranışı (gerçek gönderim)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubGlobal('window', {
        location: { origin: 'https://venthub.example', pathname: '/tr/odeme/basarili' },
      })
    })

    it('log-client-error uç noktasına sözleşmeye uygun POST atar', async () => {
      const reportError = await loadReporter()

      reportError(new Error('Callback verify failed'), { context: 'Callback verify error' })

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

      const call = fetchMock.mock.calls[0]
      expect(call[0]).toBe(ENDPOINT)

      const init = call[1] as RequestInit
      expect(init.method).toBe('POST')
      expect(init.keepalive).toBe(true)
      expect(init.headers).toMatchObject({
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        // Oturum varsa kullanıcı token'ı gider (edge fonksiyonu getUser ile doğruluyor)
        Authorization: 'Bearer user-access-token',
      })

      const body = parseBody(call)
      // log-client-error zod şemasının alanları — uydurma alan YOK
      expect(Object.keys(body).sort()).toEqual(
        ['env', 'extra', 'level', 'msg', 'release', 'stack', 'ua', 'url'].sort()
      )
      expect(body.msg).toBe('Callback verify failed')
      expect(body.level).toBe('error')
      expect(body.env).toBe('production')
      expect(String(body.stack)).toContain('Error')
      expect(body.extra).toEqual({ context: 'Callback verify error' })
    })

    it('URL query/hash göndermez, hassas context anahtarlarını eler', async () => {
      vi.stubGlobal('window', {
        location: {
          origin: 'https://venthub.example',
          pathname: '/tr/hesabim',
          search: '?token=super-secret&email=a@b.com',
          hash: '#gizli',
        },
      })
      const reportError = await loadReporter()

      reportError(new Error('boom'), {
        accessToken: 'super-secret',
        email: 'a@b.com',
        cardNumber: '4111111111111111',
        source: 'unit-test',
        attempt: 2,
      })

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
      const body = parseBody(fetchMock.mock.calls[0])

      expect(body.url).toBe('https://venthub.example/tr/hesabim')
      expect(JSON.stringify(body)).not.toContain('super-secret')
      expect(JSON.stringify(body)).not.toContain('a@b.com')
      expect(JSON.stringify(body)).not.toContain('4111111111111111')
      expect(body.extra).toEqual({ source: 'unit-test', attempt: 2 })
    })

    it('gönderim patlarsa çağıran etkilenmez (throw etmez)', async () => {
      fetchMock.mockRejectedValue(new Error('network down'))
      const unhandled = vi.fn()
      process.on('unhandledRejection', unhandled)
      const reportError = await loadReporter()

      expect(() => reportError(new Error('boom'))).not.toThrow()

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(unhandled).not.toHaveBeenCalled()
      process.off('unhandledRejection', unhandled)
    })

    it('aynı hata tekrar edilirse yalnız bir kez gönderilir (de-dup), farklı hata gönderilir', async () => {
      const reportError = await loadReporter()

      const error = new Error('Loop error')
      reportError(error)
      reportError(error)
      reportError(error)

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

      reportError(new Error('Different error'))
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    })

    it('sayfa başına gönderim üst sınırını aşmaz', async () => {
      const reportError = await loadReporter()

      for (let i = 0; i < 50; i += 1) {
        reportError(new Error(`Unique error ${i}`))
      }

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(20))
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(fetchMock).toHaveBeenCalledTimes(20)
    })

    it('Supabase env değişkenleri yoksa sessizce vazgeçer', async () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
      const reportError = await loadReporter()

      expect(() => reportError(new Error('boom'))).not.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
