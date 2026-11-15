import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { erisimBelirteciCikar, type OturumSayfasi, oturumuKapat } from './oturum-kapat'

// ALT-189: E2E oturum kapatıcının sözleşmesi. Asıl tehlike `scope=local` yerine varsayılan (global)
// çıkış çağırmak: aynı hesabın tüm oturumlarını, yani gerçek kişinin açık panelini de kapatır.

const BELIRTEC = 'aaa.bbb.ccc'
const OTURUM_JSON = JSON.stringify({ access_token: BELIRTEC, refresh_token: 'r', user: { ad: 'Çağrı' } })

type Gonder = (url: string, secenek: { headers: Record<string, string>; timeout: number }) => Promise<{ ok(): boolean }>

function kodla(json: string): string {
  return `base64-${Buffer.from(json, 'utf8').toString('base64url')}`
}

function sahteSayfa(cerezler: Array<{ name: string; value: string }>, post: Gonder): OturumSayfasi {
  return { context: () => ({ cookies: async () => cerezler, request: { post } }) }
}

describe('erisimBelirteciCikar', () => {
  it('base64- önekli tek parça çerezden access_token çıkarır', () => {
    expect(erisimBelirteciCikar([{ name: 'sb-abc-auth-token', value: kodla(OTURUM_JSON) }])).toBe(BELIRTEC)
  })

  it('parçalı çerezi (.0, .1) sıraya koyup birleştirir; Türkçe karakter bozulmaz', () => {
    const tam = kodla(OTURUM_JSON)
    const yarim = Math.floor(tam.length / 2)
    const cerezler = [
      { name: 'sb-abc-auth-token.1', value: encodeURIComponent(tam.slice(yarim)) },
      { name: 'sb-abc-auth-token.0', value: encodeURIComponent(tam.slice(0, yarim)) },
    ]
    expect(erisimBelirteciCikar(cerezler)).toBe(BELIRTEC)
  })

  it('düz JSON çerezi (base64- öneki yok) da çözer', () => {
    expect(erisimBelirteciCikar([{ name: 'sb-abc-auth-token', value: encodeURIComponent(OTURUM_JSON) }])).toBe(
      BELIRTEC,
    )
  })

  it('çerez yoksa, bozuksa ya da access_token yoksa null döner (fırlatmaz)', () => {
    expect(erisimBelirteciCikar([])).toBeNull()
    expect(erisimBelirteciCikar([{ name: 'baska', value: kodla(OTURUM_JSON) }])).toBeNull()
    expect(erisimBelirteciCikar([{ name: 'sb-abc-auth-token', value: 'base64-%%%' }])).toBeNull()
    expect(erisimBelirteciCikar([{ name: 'sb-abc-auth-token', value: kodla('{"x":1}') }])).toBeNull()
  })
})

describe('oturumuKapat', () => {
  const ESKI_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const ESKI_ANAHTAR = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cerez = [{ name: 'sb-abc-auth-token', value: kodla(OTURUM_JSON) }]

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ornek.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-anahtar'
  })

  afterEach(() => {
    if (ESKI_URL === undefined) Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL')
    else process.env.NEXT_PUBLIC_SUPABASE_URL = ESKI_URL
    if (ESKI_ANAHTAR === undefined) Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ESKI_ANAHTAR
  })

  it('çıkışı YALNIZ scope=local ile, kendi belirteciyle çağırır', async () => {
    const post = vi.fn<Gonder>().mockResolvedValue({ ok: () => true })

    expect(await oturumuKapat(sahteSayfa(cerez, post))).toBe(true)

    expect(post).toHaveBeenCalledTimes(1)
    const [adres, secenek] = post.mock.calls[0]
    expect(adres).toBe('https://ornek.supabase.co/auth/v1/logout?scope=local')
    expect(adres).not.toMatch(/scope=(global|others)/)
    expect(secenek.headers.Authorization).toBe(`Bearer ${BELIRTEC}`)
    expect(secenek.headers.apikey).toBe('anon-anahtar')
  })

  it('ortam değişkeni yoksa hiç istek atmaz', async () => {
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL')
    const post = vi.fn<Gonder>()
    expect(await oturumuKapat(sahteSayfa(cerez, post))).toBe(false)
    expect(post).not.toHaveBeenCalled()
  })

  it('oturum çerezi yoksa hiç istek atmaz', async () => {
    const post = vi.fn<Gonder>()
    expect(await oturumuKapat(sahteSayfa([], post))).toBe(false)
    expect(post).not.toHaveBeenCalled()
  })

  it('ağ hatasında ya da 2xx dışı yanıtta testi kırmadan false döner', async () => {
    const agHatasi = vi.fn<Gonder>().mockRejectedValue(new Error('ağ yok'))
    expect(await oturumuKapat(sahteSayfa(cerez, agHatasi))).toBe(false)
    const yetkisiz = vi.fn<Gonder>().mockResolvedValue({ ok: () => false })
    expect(await oturumuKapat(sahteSayfa(cerez, yetkisiz))).toBe(false)
  })
})
