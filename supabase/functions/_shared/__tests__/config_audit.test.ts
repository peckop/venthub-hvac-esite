import { describe, expect, it } from 'vitest'

import { auditConfig, resolveIyzicoBase } from '../config_audit'

/**
 * `_shared/config_audit.ts` SÖZLEŞMESİNİN KİLİDİ (T100-VH · 2026-08-19).
 *
 * Kapatılan sınıf: **yapılandırma boşluğunun sessizce davranış değiştirmesi.** Ölçülen hâl,
 * üç ödeme ucunda birden aynıydı — `IYZICO_BASE_URL` yoksa istek sandbox'a gidiyordu ve
 * hiçbir yere yazılmıyordu. Hemen alt satırda anahtarlar için fail-CLOSED kontrol vardı:
 * aynı yapılandırma ailesi için iki farklı politika.
 *
 * Aşağıdaki testler "mutlu yol"u değil, **geri dönmesi muhtemel biçimleri** kilitler:
 * biri buraya bir varsayılan geri koyarsa, ya da ilişki denetimini tek-tek kontrole
 * indirgerse, kırmızı yanar.
 */

const PROD_SITE = 'https://venthub.com.tr'
const PROD_IYZ = 'https://api.iyzipay.com'
const SANDBOX_IYZ = 'https://sandbox-api.iyzipay.com'

describe('resolveIyzicoBase — varsayilan YOK', () => {
  it('deger yoksa null doner (sandbox varsayilanina DUSMEZ)', () => {
    expect(resolveIyzicoBase({})).toBeNull()
    expect(resolveIyzicoBase({ IYZICO_BASE_URL: '' })).toBeNull()
    expect(resolveIyzicoBase({ IYZICO_BASE_URL: '   ' })).toBeNull()
  })

  it('ayristirilamayan ya da http(s) olmayan deger null doner', () => {
    expect(resolveIyzicoBase({ IYZICO_BASE_URL: 'api.iyzipay.com' })).toBeNull()
    expect(resolveIyzicoBase({ IYZICO_BASE_URL: 'javascript:alert(1)' })).toBeNull()
    expect(resolveIyzicoBase({ IYZICO_BASE_URL: 'ftp://api.iyzipay.com' })).toBeNull()
  })

  it('ortami konak adindan tanir ve sondaki egik cizgiyi kirpar', () => {
    expect(resolveIyzicoBase({ IYZICO_BASE_URL: PROD_IYZ })).toEqual({ base: PROD_IYZ, ortam: 'prod' })
    expect(resolveIyzicoBase({ IYZICO_BASE_URL: SANDBOX_IYZ + '/' })).toEqual({
      base: SANDBOX_IYZ,
      ortam: 'sandbox',
    })
  })

  /**
   * SABOTAJ SİGORTASI: bu testin tek işi, birinin buraya `?? 'https://sandbox...'` benzeri
   * bir varsayılan geri koymasını yakalamaktır. Sözleşme "boşta null" olduğu için, dönen
   * değerin null OLMADIĞI her durum burada kırmızı yanar.
   */
  it('bos ortamda ASLA bir adres uretmez', () => {
    const bosOrtamlar = [{}, { IYZICO_API_KEY: 'x', IYZICO_SECRET_KEY: 'y' }]
    for (const env of bosOrtamlar) expect(resolveIyzicoBase(env)).toBeNull()
  })
})

describe('auditConfig — hukum uretir, sir uretmez', () => {
  const tamOrtam = {
    IYZICO_BASE_URL: PROD_IYZ,
    IYZICO_API_KEY: 'gizli-anahtar-degeri',
    IYZICO_SECRET_KEY: 'gizli-sir-degeri',
    PUBLIC_SITE_URL: PROD_SITE,
    ALLOWED_ORIGINS: PROD_SITE,
  }

  it('tam ve tutarli ortamda saglikli doner', () => {
    const r = auditConfig(tamOrtam)
    expect(r.olculdu).toBe(true)
    expect(r.saglikli).toBe(true)
    expect(r.odemeOrtami).toBe('prod')
    expect(r.siteOrtami).toBe('prod')
    expect(r.bulgular.every((b) => b.hukum === 'ok')).toBe(true)
  })

  /**
   * ASIL MESELE: iki değer de TEK BAŞINA geçerli, ilişki bozuk. Tek-tek bakan bir denetim
   * bunu göremez — bu testin varlık sebebi tam olarak o körlüğü kalıcı kılmamaktır.
   */
  it('uretim sitesi + sandbox odeme ucu = TUTARSIZ', () => {
    const r = auditConfig({ ...tamOrtam, IYZICO_BASE_URL: SANDBOX_IYZ })
    expect(r.saglikli).toBe(false)
    expect(r.bulgular.some((b) => b.hukum === 'tutarsiz' && b.ad === 'IYZICO_BASE_URL')).toBe(true)
    // Tek tek bakıldığında ikisi de kusursuz görünüyor — kanıtı burada sabitliyoruz.
    expect(r.odemeOrtami).toBe('sandbox')
    expect(r.siteOrtami).toBe('prod')
  })

  it('yerel site + sandbox ucu tutarSIZ DEGILDIR (yanlis kirmizi uretmez)', () => {
    const r = auditConfig({
      ...tamOrtam,
      PUBLIC_SITE_URL: 'http://localhost:5173',
      ALLOWED_ORIGINS: 'http://localhost:5173',
      IYZICO_BASE_URL: SANDBOX_IYZ,
    })
    expect(r.siteOrtami).toBe('yerel')
    expect(r.bulgular.some((b) => b.hukum === 'tutarsiz')).toBe(false)
  })

  it('eksik ile gecersiz AYRI hukumlerdir', () => {
    expect(
      auditConfig({ ...tamOrtam, IYZICO_BASE_URL: '' }).bulgular.find((b) => b.ad === 'IYZICO_BASE_URL')?.hukum,
    ).toBe('eksik')
    expect(
      auditConfig({ ...tamOrtam, IYZICO_BASE_URL: 'bu-bir-url-degil' }).bulgular.find(
        (b) => b.ad === 'IYZICO_BASE_URL',
      )?.hukum,
    ).toBe('gecersiz')
  })

  it('site adresi ucu de bossa yonlendirme yapilamayacagini soyler', () => {
    const { PUBLIC_SITE_URL: _atildi, ALLOWED_ORIGINS: _atildi2, ...kalan } = tamOrtam
    const r = auditConfig(kalan)
    expect(r.siteOrtami).toBe('bilinmiyor')
    expect(r.bulgular.find((b) => b.ad === 'PUBLIC_SITE_URL')?.hukum).toBe('eksik')
    // ALLOWED_ORIGINS boş + kanonik adres yok → allowlist GERÇEKTEN boş.
    expect(r.bulgular.find((b) => b.ad === 'ALLOWED_ORIGINS')?.hukum).toBe('eksik')
  })

  it('ALLOWED_ORIGINS bos ama kanonik adres varsa kusur DEGIL', () => {
    const { ALLOWED_ORIGINS: _atildi, ...kalan } = tamOrtam
    const r = auditConfig(kalan)
    expect(r.bulgular.find((b) => b.ad === 'ALLOWED_ORIGINS')?.hukum).toBe('ok')
    expect(r.saglikli).toBe(true)
  })

  /**
   * SIR SIZDIRMAZLIK — raporun tamamı operatöre ve (healthz üzerinden) kimliksiz bir uca
   * gidiyor. Anahtar değerinin hiçbir parçası, uzunluğu dahil, gövdeye girmemeli.
   */
  it('rapor metninde hicbir anahtar DEGERI gecmez', () => {
    const r = auditConfig(tamOrtam)
    const metin = JSON.stringify(r)
    expect(metin).not.toContain('gizli-anahtar-degeri')
    expect(metin).not.toContain('gizli-sir-degeri')
    // Konak adı GEÇMELİ: teşhisin tamamı ona bağlı ve sır değil.
    expect(metin).toContain('venthub.com.tr')
  })
})
