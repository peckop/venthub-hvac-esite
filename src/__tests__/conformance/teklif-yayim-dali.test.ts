/**
 * INV-TEKLIF-YAYIM-1 (REC-384 + REC-389, 2026-09-25): teklif yayımı müşteriye "Teklifiniz hazır"
 * e-postası olarak gider — DB tetiği `{"event":"quote_published","quote_id":…}` ile webhook'u çağırır.
 *
 * Doğuran ölçüm: 89024b5f yayımlandı, e-posta tarayıcıdan ateşlendiği için hiç gitmedi. Bu kapı
 * (1) yayım dalını SAHTE PORTLARLA uçtan uca koşar (talep damgası/hız sınırı/iç bildirim yok,
 * 409 yalnız defter kanıtıyla "gitti", yanıt adresi fail-closed), (2) içerik kurucusunu (numara
 * yedeği, kaçış, KDV hariç, portal bağlantısı) ve (3) index.ts kablolamasını kaynaktan doğrular.
 * (Ad `teklif-*`: `quote-*` konformans deseni SATIS şeridinin; bu webhook'un kapısı
 * teklif-ic-bildirim.test.ts ile yan yana durur.)
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { musteriOnayAnahtari } from '../../../supabase/functions/quote-notification-webhook/ic_bildirim'
import {
  belgeNumarasi,
  type DefterSatiri,
  kararVer409,
  olayCoz,
  portalLinki,
  type ResendYaniti,
  YANIT_METNI,
  yayimAnahtari,
  yayimDaliniIsle,
  yayimIcerigiOlustur,
  type YayimKalemi,
  yayimKonusu,
  type YayimPortlari,
  type YayimTeklif,
} from '../../../supabase/functions/quote-notification-webhook/yayim'

const KAYNAK = fs.readFileSync(
  path.resolve(__dirname, '../../../supabase/functions/quote-notification-webhook/index.ts'),
  'utf8',
)
const YAYIM_KAYNAK = fs.readFileSync(
  path.resolve(__dirname, '../../../supabase/functions/quote-notification-webhook/yayim.ts'),
  'utf8',
)

const VARSAYILAN = 'd3b07384-d113-495f-a558-8c38634e0000'
const ID = '9f2c1a7b-0000-4000-8000-00000000abcd'

const teklif = (ek: Partial<YayimTeklif> = {}): YayimTeklif => ({
  id: ID,
  tenant_id: VARSAYILAN,
  user_id: 'u-1',
  status: 'quoted',
  quote_no: 'TK-20260925-0001',
  total_amount: 1250.5,
  currency: 'TRY',
  valid_until: '2026-10-25T12:00:00Z',
  contact_email: 'musteri@ornek.com',
  published_email_sent_at: null,
  ...ek,
})

const kalemler: YayimKalemi[] = [
  { product_name: '<a href="https://evil.tld">Fan</a>', qty: 2, unit_price: 500 },
  { product_name: 'Menfez', qty: 1, unit_price: 250.5 },
]

const yanit = (status: number, govde: unknown = { id: 'msg_1' }): ResendYaniti => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(govde),
  json: async () => govde,
})

interface Sahne {
  q?: YayimTeklif | null
  qErr?: string | null
  authEposta?: string | null
  resend?: ResendYaniti
  defterdeSent?: boolean
  defterHata?: string | null
  damgaHata?: string | null
  kiraciAdres?: string | null
  kiraciErr?: string | null
  supportEmail?: string
}

function kur(s: Sahne = {}) {
  const defter: DefterSatiri[] = []
  const gonderimler: Array<{ govde: Record<string, unknown>; anahtar: string }> = []
  const damgalar: string[] = []
  const p: YayimPortlari = {
    teklifOku: vi.fn(async () => ({ data: s.q === undefined ? teklif() : s.q, error: s.qErr ?? null })),
    kalemleriOku: vi.fn(async () => ({ data: kalemler, error: null })),
    authEpostasi: vi.fn(async () => (s.authEposta === undefined ? 'musteri@ornek.com' : s.authEposta)),
    kiraciDestekAdresi: vi.fn(async () => ({ adres: s.kiraciAdres ?? null, error: s.kiraciErr ?? null })),
    marka: vi.fn(async () => ({ emailFrom: 'VentHub <info@venthub.com.tr>', supportEmail: s.supportEmail ?? 'info@venthub.com.tr' })),
    deftereYaz: vi.fn(async (_id: string, satir: DefterSatiri) => {
      defter.push(satir)
      return s.defterHata ?? null
    }),
    gonderimSatiriVarMi: vi.fn(async () => ({ var: Boolean(s.defterdeSent), error: null })),
    damgala: vi.fn(async (id: string) => {
      damgalar.push(id)
      return s.damgaHata ?? null
    }),
    resendGonder: vi.fn(async (govde: Record<string, unknown>, anahtar: string) => {
      gonderimler.push({ govde, anahtar })
      return s.resend ?? yanit(200)
    }),
  }
  const calistir = () => yayimDaliniIsle(ID, p, { varsayilanKiraciId: VARSAYILAN, siteUrl: 'https://venthub.com.tr' })
  return { p, defter, gonderimler, damgalar, calistir }
}

describe('INV-TEKLIF-YAYIM-1 — olay ayrımı', () => {
  it('event yok → talep dalı (geriye uyum); quote_published → yayım; başka değer → bilinmeyen', () => {
    expect(olayCoz({})).toBe('talep')
    expect(olayCoz({ event: undefined })).toBe('talep')
    expect(olayCoz({ event: 'quote_published' })).toBe('yayim')
    expect(olayCoz({ event: 'request_created' })).toBe('bilinmeyen')
    expect(olayCoz({ event: null })).toBe('bilinmeyen')
    expect(olayCoz({ event: '' })).toBe('bilinmeyen')
  })

  it('index.ts: bilinmeyen olay 400 unknown_event, ayrım kimlik/replay kapısından SONRA ve DB istemcisinden ÖNCE', () => {
    expect(KAYNAK).toMatch(/olay === 'bilinmeyen'\) return json\(\{ error: 'unknown_event' \}, 400\)/)
    const ayrim = KAYNAK.indexOf('olayCoz(payload)')
    expect(ayrim).toBeGreaterThan(KAYNAK.indexOf("json({ error: 'unauthorized' }, 401)"))
    expect(ayrim).toBeGreaterThan(KAYNAK.indexOf("json({ error: 'stale_timestamp' }, 401)"))
    expect(ayrim).toBeLessThan(KAYNAK.indexOf('createClient(supabaseUrl'))
  })

  it('index.ts: yayım dalı talep dalının kapılarından ÖNCE döner (talep damgası/hız sınırı/iç bildirim görülmez)', () => {
    const dalDonus = KAYNAK.indexOf('return json(sonuc.govde, sonuc.durum)')
    expect(dalDonus).toBeGreaterThan(0)
    for (const talepKapisi of [
      'if (quote.request_email_sent_at)',
      'quote-notify-user:',
      'icBildirimOlustur(',
      'request_email_sent_at: new Date()',
    ]) {
      expect(KAYNAK.indexOf(talepKapisi)).toBeGreaterThan(dalDonus)
    }
    // Yeni kolon talep dalının SELECT'ine girmez (migration'dan önce inen deploy talep yolunu kırmasın).
    expect(KAYNAK).toMatch(/select\('id, tenant_id, user_id, status, created_at, request_email_sent_at, contact_email, contact_name, contact_phone, source'\)/)
    expect(YAYIM_KAYNAK).not.toMatch(/request_email_sent_at\s*[:=]/)
    // Yorumlar talep dalının adlarını anar; kapı KODU tarar: import satırı ve çağrılar.
    const importlar = YAYIM_KAYNAK.match(/^import .*$/gm) ?? []
    expect(importlar.join('\n')).not.toMatch(/checkRateLimit|icBildirimOlustur|musteriOnayAnahtari|rate_limit/)
    expect(YAYIM_KAYNAK).not.toMatch(/(checkRateLimit|icBildirimOlustur|musteriOnayAnahtari)\(/)
  })

  it('index.ts: defter satırı event=quote_published ile, 409 kanıtı event+status=sent ile, damga yalnız boşsa', () => {
    expect(KAYNAK).toMatch(/insert\(\{ quote_id: id, event: YAYIM_OLAYI, \.\.\.satir \}\)/)
    expect(KAYNAK).toMatch(/\.eq\('event', YAYIM_OLAYI\)\s*\.eq\('status', 'sent'\)/)
    expect(KAYNAK).toMatch(/published_email_sent_at: new Date\(\)\.toISOString\(\) \}\)\s*\.eq\('id', id\)\s*\.is\('published_email_sent_at', null\)/)
  })
})

describe('INV-TEKLIF-YAYIM-1 — dal akışı (sahte portlar)', () => {
  it('mutlu yol: yayım anahtarı, gönderen marka, reply_to destek, sent satırı DAMGADAN önce, damga basılır', async () => {
    const h = kur()
    const r = await h.calistir()
    expect(r.durum).toBe(200)
    expect(h.gonderimler).toHaveLength(1)
    expect(h.gonderimler[0].anahtar).toBe(`teklif-yayim/${ID}`)
    expect(h.gonderimler[0].govde).toMatchObject({
      from: 'VentHub <info@venthub.com.tr>',
      to: ['musteri@ornek.com'],
      reply_to: 'info@venthub.com.tr',
      subject: 'Teklifiniz hazır: TK-20260925-0001',
    })
    expect(h.defter).toEqual([expect.objectContaining({ status: 'sent', provider: 'resend', provider_message_id: 'msg_1' })])
    expect(h.damgalar).toEqual([ID])
    const defterSira = vi.mocked(h.p.deftereYaz).mock.invocationCallOrder[0]
    const damgaSira = vi.mocked(h.p.damgala).mock.invocationCallOrder[0]
    expect(defterSira).toBeLessThan(damgaSira)
  })

  it('yayım anahtarı talep anahtarından FARKLI (aynı anahtar = Resend 24 saat 409)', () => {
    expect(yayimAnahtari(ID)).not.toBe(musteriOnayAnahtari(ID))
  })

  it('published_email_sent_at dolu → already_sent 200, gönderim/defter/damga YOK', async () => {
    const h = kur({ q: teklif({ published_email_sent_at: '2026-09-25T08:00:00Z' }) })
    const r = await h.calistir()
    expect(r).toEqual({ durum: 200, govde: { ok: true, skipped: 'already_sent', quote_id: ID } })
    expect(h.gonderimler).toHaveLength(0)
    expect(h.defter).toHaveLength(0)
    expect(h.damgalar).toHaveLength(0)
  })

  it('409 + defterde sent YOK → failed satırı (409 notlu), damga YOK, 502', async () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const h = kur({ resend: yanit(409, { name: 'invalid_idempotent_request' }), defterdeSent: false })
    const r = await h.calistir()
    expect(r.durum).toBe(502)
    expect(r.govde).toMatchObject({ error: 'send_conflict_unverified' })
    expect(h.defter).toHaveLength(1)
    expect(h.defter[0].status).toBe('failed')
    expect(h.defter[0].error).toMatch(/409/)
    expect(h.damgalar).toHaveLength(0)
    hata.mockRestore()
  })

  it('409 + defterde sent VAR → gitti sayılır, damga basılır, ikinci sent satırı YAZILMAZ', async () => {
    const h = kur({ resend: yanit(409), defterdeSent: true })
    const r = await h.calistir()
    expect(r.durum).toBe(200)
    expect(r.govde).toMatchObject({ idempotent: true })
    expect(h.defter).toHaveLength(0)
    expect(h.damgalar).toEqual([ID])
  })

  it('kararVer409: yalnız defter kanıtı "gönderildi" der', () => {
    expect(kararVer409(true)).toBe('gonderildi_say')
    expect(kararVer409(false)).toBe('basarisiz')
  })

  it('Resend 5xx → failed satırı, damga YOK, 502', async () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const h = kur({ resend: yanit(500, { message: 'boom' }) })
    const r = await h.calistir()
    expect(r.durum).toBe(502)
    expect(h.defter[0].status).toBe('failed')
    expect(h.damgalar).toHaveLength(0)
    hata.mockRestore()
  })

  it('damga düşerse yutulmaz: 500 stamp_failed_email_sent (sent satırı zaten yazıldı → 409 kurtarır)', async () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const h = kur({ damgaHata: 'db down' })
    const r = await h.calistir()
    expect(r).toEqual({ durum: 500, govde: { error: 'stamp_failed_email_sent', quote_id: ID } })
    expect(h.defter[0].status).toBe('sent')
    hata.mockRestore()
  })

  it('defter yazımı düşerse log + yanıtta işaret (yutulmaz)', async () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const h = kur({ defterHata: 'check violation' })
    const r = await h.calistir()
    expect(r.durum).toBe(200)
    expect(r.govde).toMatchObject({ ledger_write_failed: true })
    expect(hata).toHaveBeenCalled()
    hata.mockRestore()
  })

  it('yanıt adresi fail-closed: varsayılan dışı kiracıda config boşsa GÖNDERİLMEZ, failed satırı', async () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const h = kur({ q: teklif({ tenant_id: 'baska-kiraci' }), kiraciAdres: null })
    const r = await h.calistir()
    expect(r.durum).toBe(500)
    expect(r.govde).toMatchObject({ error: 'reply_to_missing' })
    expect(h.gonderimler).toHaveLength(0)
    expect(h.defter[h.defter.length - 1]).toMatchObject({ status: 'failed' })
    expect(h.damgalar).toHaveLength(0)
    hata.mockRestore()
  })

  it('varsayılan kiracıda supportEmail boşsa da GÖNDERİLMEZ', async () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const h = kur({ supportEmail: '  ' })
    const r = await h.calistir()
    expect(r.durum).toBe(500)
    expect(h.gonderimler).toHaveLength(0)
    hata.mockRestore()
  })

  it('varsayılan dışı kiracı okuması düşerse 503, VentHub adresine düşülmez', async () => {
    const h = kur({ q: teklif({ tenant_id: 'baska-kiraci' }), kiraciErr: 'timeout' })
    const r = await h.calistir()
    expect(r.durum).toBe(503)
    expect(h.gonderimler).toHaveLength(0)
  })

  it('varsayılan dışı kiracı: kendi reply_to, portal bağlantısı YOK', async () => {
    const h = kur({ q: teklif({ tenant_id: 'baska-kiraci' }), kiraciAdres: 'destek@baska.com' })
    await h.calistir()
    expect(h.gonderimler[0].govde.reply_to).toBe('destek@baska.com')
    expect(String(h.gonderimler[0].govde.html)).not.toContain('/account/quotes')
  })

  it('bulgu 7: contact_email auth e-postasından ayrışırsa mismatch satırı (engelleme yok)', async () => {
    const h = kur({ authEposta: 'baska@ornek.com' })
    const r = await h.calistir()
    expect(r.durum).toBe(200)
    expect(h.defter[0]).toMatchObject({ status: 'mismatch', provider: 'guard' })
    expect(h.defter[1]).toMatchObject({ status: 'sent' })
  })

  it('bulgu 7 defter yazımı düşerse log’a çıkar (yutulmaz), gönderim sürer', async () => {
    const hata = vi.spyOn(console, 'error').mockImplementation(() => {})
    const h = kur({ authEposta: 'baska@ornek.com', defterHata: 'check violation' })
    const r = await h.calistir()
    expect(r.durum).toBe(200)
    expect(hata.mock.calls.some((c) => String(c[0]).includes('defter yazilamadi') && JSON.stringify(c[1]).includes('mismatch'))).toBe(true)
    hata.mockRestore()
  })

  it('yayımlanmamış teklif (status≠quoted) → 409 not_published, gönderim YOK', async () => {
    const uyari = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const h = kur({ q: teklif({ status: 'draft' }) })
    const r = await h.calistir()
    expect(r.durum).toBe(409)
    expect(h.gonderimler).toHaveLength(0)
    uyari.mockRestore()
  })

  it('okuma düştü → 503, yok → 404', async () => {
    expect((await kur({ qErr: 'x' }).calistir()).durum).toBe(503)
    expect((await kur({ q: null }).calistir()).durum).toBe(404)
  })
})

describe('INV-TEKLIF-YAYIM-1 — içerik', () => {
  const temel = {
    quoteId: ID,
    quoteNo: 'TK-20260925-0001',
    kalemler,
    toplam: 1250.5,
    paraBirimi: 'TRY',
    gecerlilik: '2026-10-25T12:00:00Z',
    portalLinki: null,
    hesapli: false,
  }

  it('konu: "Teklifiniz hazır: TK-…", # YOK', () => {
    expect(yayimKonusu(ID, 'TK-20260925-0001')).toBe('Teklifiniz hazır: TK-20260925-0001')
    expect(yayimKonusu(ID, 'TK-20260925-0001')).not.toContain('#')
  })

  it("quote_no NULL → id'nin SON 8 hanesi", () => {
    expect(belgeNumarasi(ID, null)).toBe('0000ABCD')
    expect(yayimKonusu(ID, null)).toBe('Teklifiniz hazır: 0000ABCD')
    expect(yayimKonusu(ID, '  ')).toBe('Teklifiniz hazır: 0000ABCD')
  })

  it('kalem satırları kaçışlı; ad, adet, birim fiyat, satır tutarı; toplam + KDV hariç; geçerlilik', () => {
    const { html, text } = yayimIcerigiOlustur(temel)
    expect(html).not.toContain('<a href="https://evil.tld">')
    expect(html).toContain('&lt;a href=&quot;https://evil.tld&quot;&gt;')
    expect(html).toContain('Menfez')
    expect(html).toMatch(/1\.000,00/) // 2 × 500 satır tutarı
    expect(html).toMatch(/1\.250,50/) // toplam
    expect(html).toContain('KDV hariç')
    expect(text).toContain('KDV hariç')
    expect(html).toContain('25 Ekim 2026')
    expect(text).toContain('25 Ekim 2026')
  })

  it('hesapsız müşteri: bağlantı YOK, "yanıtlayın ya da arayın" metni', () => {
    const { html, text } = yayimIcerigiOlustur(temel)
    expect(html).not.toContain('<a href=')
    expect(html).toContain(YANIT_METNI)
    expect(text).toContain(YANIT_METNI)
  })

  it('hesaplı müşteri + varsayılan kiracı: portal bağlantısı /tr/account/quotes/detail?id=', async () => {
    const h = kur()
    await h.calistir()
    expect(String(h.gonderimler[0].govde.html)).toContain(
      `href="https://venthub.com.tr/tr/account/quotes/detail?id=${ID}"`,
    )
  })

  it('misafir (user_id NULL): bağlantı yok, yanıt metni var, auth sorgusu yok', async () => {
    const h = kur({ q: teklif({ user_id: null }) })
    await h.calistir()
    const html = String(h.gonderimler[0].govde.html)
    expect(html).not.toContain('/account/quotes')
    expect(html).toContain(YANIT_METNI)
    expect(h.p.authEpostasi).not.toHaveBeenCalled()
  })

  it('portalLinki: yalnız http(s) taban', () => {
    expect(portalLinki('https://venthub.com.tr//', ID)).toBe(`https://venthub.com.tr/tr/account/quotes/detail?id=${ID}`)
    expect(portalLinki('javascript:alert(1)', ID)).toBeNull()
    expect(portalLinki(null, ID)).toBeNull()
  })
})

describe('REC-389 — talep e-postası numarası: İLK 8 hane + #', () => {
  it('talep dalı konusu `#<ilk 8>` biçiminde', () => {
    expect(KAYNAK).toMatch(/const kisaId = quote\.id\.slice\(0, 8\)\.toUpperCase\(\)/)
    expect(KAYNAK).toMatch(/Teklif talebiniz alındı \(#\$\{kisaId\}\)/)
  })
})
