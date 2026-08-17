import { describe, expect, it } from 'vitest'

import { checkInvoiceIdentity } from '../invoiceIdentity'

/**
 * Bu testin asıl işi EŞİĞİN İKİ YÖNÜNÜ de tutmak. 2026-08-16'da kural önce koşulsuz
 * yazıldı (TCKN her siparişte zorunlu) — mevzuat araştırması bunun kanunun istediğinden
 * SIKI olduğunu gösterdi. Eşik gevşerse (herkesten istenir) dönüşüm kaybı, sıkılaşırsa
 * (kimseden istenmez) haddin üstünde eksik kimlikli fatura doğar. İkisi de kırmızı olmalı.
 */

const HAD = 12_000

describe('checkInvoiceIdentity · bireysel', () => {
  it('haddin ALTINDA TCKN istemez — GİB 11111111111 dolgusunu kabul ediyor', () => {
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '' }, 4_500, HAD)).toBeNull()
  })

  it('haddin ÜSTÜNDE TCKN zorunlu', () => {
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '' }, 12_001, HAD)).toBe('tcknRequired')
  })

  it('tam haddin kendisi zorunluluk doğurmaz (aşma şartı)', () => {
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '' }, HAD, HAD)).toBeNull()
  })

  it('girilen TCKN tutar ne olursa olsun geçerli olmalı', () => {
    // Haddin ÇOK altında bile: yanlış numara, boş numaradan kötüdür.
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '11111111111' }, 100, HAD)).toBe('tcknFormat')
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '10000000146' }, 100, HAD)).toBeNull()
  })

  it('eşik 0 ise her siparişte zorunlu (hep-topla tercihi)', () => {
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '' }, 1, 0)).toBe('tcknRequired')
  })

  it('tutar bilinmiyorsa kimlik istenir (karar verilemiyorsa sor)', () => {
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '' }, Number.NaN, HAD)).toBe('tcknRequired')
  })

  it('sadece boşluktan ibaret TCKN boş sayılır', () => {
    expect(checkInvoiceIdentity({ type: 'individual', tckn: '   ' }, 50_000, HAD)).toBe('tcknRequired')
  })
})

describe('checkInvoiceIdentity · kurumsal', () => {
  const tam = { type: 'corporate' as const, companyName: 'Acme A.Ş.', vkn: '1234567890', taxOffice: 'Kadıköy' }

  it('eksiksizse geçer', () => {
    expect(checkInvoiceIdentity(tam, 100, HAD)).toBeNull()
  })

  it('EŞİKTEN BAĞIMSIZ — en küçük tutarda bile VKN zorunlu', () => {
    // Bireyseldeki gevşeme kurumsala SIZMAMALI: VKN'siz kurumsal fatura kesilemez.
    expect(checkInvoiceIdentity({ ...tam, vkn: '' }, 1, HAD)).toBe('vknRequired')
    expect(checkInvoiceIdentity({ ...tam, vkn: '' }, 1, 999_999)).toBe('vknRequired')
  })

  it('her eksik alan kendi hatasını verir', () => {
    expect(checkInvoiceIdentity({ ...tam, companyName: '' }, 100, HAD)).toBe('companyRequired')
    expect(checkInvoiceIdentity({ ...tam, taxOffice: '' }, 100, HAD)).toBe('taxOfficeRequired')
  })

  it('geçersiz VKN sağlaması reddedilir', () => {
    expect(checkInvoiceIdentity({ ...tam, vkn: '1111111111' }, 100, HAD)).toBe('vknFormat')
  })

  it('unvan eksikse önce onu söyler — kullanıcı tek tek düzeltsin', () => {
    expect(checkInvoiceIdentity({ type: 'corporate', companyName: '', vkn: '', taxOffice: '' }, 100, HAD)).toBe(
      'companyRequired',
    )
  })
})
