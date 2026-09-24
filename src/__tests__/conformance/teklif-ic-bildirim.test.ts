/**
 * INV-TEKLIF-IC-BILDIRIM-1 (2026-09-23): yeni teklif talebi kiracının destek adresine bildirilir.
 *
 * Doğuran ölçüm: teklif formu TEK e-posta çıkarıyordu (müşteri onayı); info@'ya hiçbir şey gitmiyor,
 * talep yalnız panelde görünüyordu. Bu kapı (1) içerik kurucusunun kaçış/anahtar/link kurallarını,
 * (2) webhook'un iç bildirimi GERÇEKTEN gönderdiğini, alıcıyı kiracıdan çözdüğünü, iki gönderimde
 * de Idempotency-Key taşıdığını ve damgayı iç bildirimden SONRA bastığını kaynaktan doğrular.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  icBildirimAnahtari,
  icBildirimOlustur,
  musteriOnayAnahtari,
  panelLinki,
} from '../../../supabase/functions/quote-notification-webhook/ic_bildirim'

const KAYNAK = fs.readFileSync(
  path.resolve(__dirname, '../../../supabase/functions/quote-notification-webhook/index.ts'),
  'utf8',
)

const ornek = {
  quoteId: '9f2c1a7b-0000-4000-8000-000000000001',
  source: 'pdp',
  contactName: 'Ayşe <b>Yılmaz</b>',
  contactEmail: 'ayse@ornek.com',
  contactPhone: '+90 555 000 00 00',
  kalemler: [{ product_name: '<a href="https://evil.tld">Fan</a>', qty: 2, note: 'Acil <script>' }],
  panelTabanUrl: 'https://venthub.com.tr/',
}

describe('INV-TEKLIF-IC-BILDIRIM-1 — içerik kurucusu', () => {
  it('anahtar olayın kimliği: tür/varlık, zaman ya da rastgele değil (§B3.2)', () => {
    const b = icBildirimOlustur(ornek)
    expect(b.idempotencyKey).toBe(`teklif-ic/${ornek.quoteId}`)
    expect(icBildirimOlustur(ornek).idempotencyKey).toBe(b.idempotencyKey)
    expect(icBildirimAnahtari(ornek.quoteId)).not.toBe(musteriOnayAnahtari(ornek.quoteId))
  })

  it('kullanıcı girdisi HTML gövdesinde kaçışlı (kimlik avı bağlantısı üretilemez)', () => {
    const { html } = icBildirimOlustur(ornek)
    expect(html).not.toContain('<a href="https://evil.tld">')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<b>Yılmaz</b>')
    expect(html).toContain('&lt;a href=&quot;https://evil.tld&quot;&gt;')
  })

  it('talep no, iletişim, ürün, not ve panel bağlantısı gövdede', () => {
    const { html, text, subject } = icBildirimOlustur(ornek)
    expect(subject).toContain('#9F2C1A7B')
    for (const parca of ['ayse@ornek.com', '+90 555 000 00 00', '2 adet', 'Ürün sayfası', 'https://venthub.com.tr/admin/quotes']) {
      expect(html).toContain(parca)
      expect(text).toContain(parca)
    }
    expect(text).toContain('Not: Acil')
  })

  it('panel linki: yalnız http(s) taban, aksi hâlde güvenli varsayılan', () => {
    expect(panelLinki('https://ornek.com//')).toBe('https://ornek.com/admin/quotes')
    // Geçersiz/boş taban → bağlantı YOK (sabit adrese düşüş INV-CONFIG-1 ihlali olurdu)
    expect(panelLinki('javascript:alert(1)')).toBeNull()
    expect(panelLinki('')).toBeNull()
    const b = icBildirimOlustur({ ...ornek, panelTabanUrl: '' })
    expect(b.html).not.toContain('<a href=')
    expect(b.text).toContain('Panel: yönetim paneli')
  })

  it('konu satırı: kontrol karakteri atılır, ad 60 karakterle sınırlı (bulgu 5)', () => {
    const b = icBildirimOlustur({ ...ornek, contactName: `Ali\r\nBcc: x@y.z ${'a'.repeat(200)}` })
    expect(b.subject).not.toMatch(/[\r\n]/)
    expect(b.subject.length).toBeLessThanOrEqual('Yeni teklif talebi #9F2C1A7B — '.length + 60)
  })

  it('boş değerler: ad/telefon/kalem yoksa gövde yine kurulur', () => {
    const b = icBildirimOlustur({ ...ornek, contactName: null, contactPhone: null, kalemler: [] })
    expect(b.subject).toContain('Adsız')
    expect(b.html).toContain('Kalem bulunamadı')
  })
})

describe('INV-TEKLIF-IC-BILDIRIM-1 — webhook kablolaması (kaynak)', () => {
  it('iç bildirim kurucusu çağrılıyor ve alıcı kiracıdan çözülüyor (kural 12)', () => {
    expect(KAYNAK).toMatch(/icBildirimOlustur\(/)
    expect(KAYNAK).toMatch(/getTenantBranding\(quote\.tenant_id\)/)
    expect(KAYNAK).toMatch(/marka\.supportEmail/)
    expect(KAYNAK).not.toMatch(/to:\s*\[\s*['"]info@/)
  })

  it('iki gönderim de Idempotency-Key taşıyor (§B3.1 katman 1)', () => {
    expect(KAYNAK).toMatch(/'Idempotency-Key':\s*anahtar/)
    expect(KAYNAK).toMatch(/musteriOnayAnahtari\(quote\.id\)/)
    expect(KAYNAK).toMatch(/ic\.idempotencyKey/)
  })

  it('damga iç bildirimden SONRA basılıyor; iç bildirim düşerse damga yok, 502', () => {
    const icGonderim = KAYNAK.indexOf('ic.idempotencyKey')
    const damga = KAYNAK.indexOf('request_email_sent_at: new Date()')
    expect(icGonderim).toBeGreaterThan(0)
    expect(damga).toBeGreaterThan(icGonderim)
    expect(KAYNAK).toMatch(/internal_notify_failed[\s\S]{0,80}502/)
  })

  it('kiracı sızıntısı kapısı: varsayılan dışı kiracıda alıcı kendi config\'inden, okunamazsa 503 (bulgu 2)', () => {
    expect(KAYNAK).toMatch(/quote\.tenant_id === DEFAULT_TENANT_ID/)
    expect(KAYNAK).toMatch(/tenant_lookup_failed[\s\S]{0,40}503/)
  })

  it('Resend 409 (idempotent) hata sayılmaz — iki gönderimde de (bulgu 4)', () => {
    expect(KAYNAK).toMatch(/!resp\.ok && resp\.status !== 409/)
    expect(KAYNAK).toMatch(/!icResp\.ok && icResp\.status !== 409/)
  })

  it('kalem yarışı: kalemler boşsa bekleyip yeniden okunur (bulgu 4)', () => {
    expect(KAYNAK).toMatch(/for \(let deneme = 0; deneme < 4; deneme\+\+\)/)
  })

  it('REC-380 hız sınırı: oturumlu kullanıcı başına sayaç e-postalardan ÖNCE, kiracı iç bildirim tavanı', () => {
    const kullaniciSayac = KAYNAK.indexOf('quote-notify-user:')
    const musteriGonderim = KAYNAK.indexOf('musteriOnayAnahtari(quote.id)')
    expect(kullaniciSayac).toBeGreaterThan(0)
    expect(kullaniciSayac).toBeLessThan(musteriGonderim)
    expect(KAYNAK).toMatch(/rate_limited[\s\S]{0,40}429/)
    expect(KAYNAK).toMatch(/quote-notify-tenant:\$\{quote\.tenant_id\}/)
    expect(KAYNAK).toMatch(/if \(icIzinli\) \{/)
    expect(KAYNAK).toMatch(/const KULLANICI_SAATLIK = 5\b/)
  })

  it('yorumlar olmayan yeniden denemeye yaslanmıyor (pg_net tek atım, bulgu 3)', () => {
    expect(KAYNAK).not.toMatch(/pg_net tekrar dener/)
  })

  it('defter hem başarıda hem başarısızlıkta yazılıyor (§B3.3) ve yalnız izinli durumlar', () => {
    expect((KAYNAK.match(/status: 'sent'/g) ?? []).length).toBeGreaterThanOrEqual(2)
    expect((KAYNAK.match(/status: 'failed'/g) ?? []).length).toBeGreaterThanOrEqual(3)
  })
})
