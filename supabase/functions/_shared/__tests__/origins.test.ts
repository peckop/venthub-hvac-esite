import { describe, expect, it } from 'vitest'

import {
  buildAllowedOrigins,
  isAllowedRedirectTarget,
  isOriginAccepted,
  normalizeOrigin,
  pickRedirectOrigin,
} from '../origins'

/**
 * `_shared/origins.ts` SÖZLEŞMESİNİN KİLİDİ (T043-VH).
 *
 * Kapatılan açık, ödeme sonrası **açık yönlendirme** idi: saldırgan `Origin: https://evil.tld`
 * ile ödeme başlatıyor, bu değer doğrulanmadan `successUrl` olarak İyzico'ya gidiyor, callback
 * de onu kontrolsüz açıyordu — yani müşteri parasını verdikten hemen sonra saldırganın
 * sayfasına düşüyordu.
 *
 * Aşağıdaki testlerin çoğu "mutlu yol"u değil, **saldırganın deneyeceği biçimleri** kilitler:
 * alt alan adı, önek/sonek benzerliği, farklı port, `javascript:` şeması, yol eklenmiş URL.
 * Bir sonraki geliştirici allowlist kontrolünü `includes`/`startsWith` gibi bir dize
 * karşılaştırmasına çevirirse bu testler kırmızı yanar.
 */

const SITE = 'https://venthub.com.tr'
const EVIL = 'https://evil.example'

describe('normalizeOrigin — köken kanonikleştirme', () => {
  it('yol/query/fragment atılır, yalnız köken kalır', () => {
    expect(normalizeOrigin('https://venthub.com.tr/payment-success?x=1#y')).toBe(SITE)
  })

  it('sondaki eğik çizgi fark yaratmaz', () => {
    expect(normalizeOrigin('https://venthub.com.tr/')).toBe(SITE)
  })

  it('port kökenin parçasıdır (farklı port = farklı köken)', () => {
    expect(normalizeOrigin('http://localhost:3000')).toBe('http://localhost:3000')
    expect(normalizeOrigin('http://localhost:3001')).not.toBe('http://localhost:3000')
  })

  it('http/https dışındaki şemalar REDDEDİLİR', () => {
    // `javascript:` bir yönlendirme hedefi olarak kabul edilirse XSS'e döner.
    expect(normalizeOrigin('javascript:alert(1)')).toBeNull()
    expect(normalizeOrigin('data:text/html,<script>')).toBeNull()
    expect(normalizeOrigin('file:///etc/passwd')).toBeNull()
  })

  it('boş/bozuk girdi null döner', () => {
    expect(normalizeOrigin('')).toBeNull()
    expect(normalizeOrigin(null)).toBeNull()
    expect(normalizeOrigin(undefined)).toBeNull()
    expect(normalizeOrigin('venthub.com.tr')).toBeNull() // şemasız = köken değil
  })
})

describe('buildAllowedOrigins — liste kaynakları', () => {
  it('site adresi değişkeni TEK BAŞINA denetimi silahlandırır', () => {
    // Eski fail-open'ın kökü buydu: yalnız ALLOWED_ORIGINS'e bakılıyordu.
    const list = buildAllowedOrigins({ SITE_URL: SITE })
    expect(list).toEqual([SITE])
  })

  it('kanonik adres listenin BAŞINDA olur (yönlendirme varsayılanı odur)', () => {
    const list = buildAllowedOrigins({
      PUBLIC_SITE_URL: SITE,
      ALLOWED_ORIGINS: 'https://a.example,https://b.example',
    })
    expect(list[0]).toBe(SITE)
    expect(list).toContain('https://a.example')
  })

  it('virgüllü liste ayrıştırılır, boşluklar ve mükerrerler temizlenir', () => {
    const list = buildAllowedOrigins({
      ALLOWED_ORIGINS: ` ${SITE} , ${SITE}/ ,, https://a.example `,
    })
    expect(list).toEqual([SITE, 'https://a.example'])
  })

  it('bozuk girdiler listeyi kirletmez', () => {
    const list = buildAllowedOrigins({ ALLOWED_ORIGINS: 'javascript:alert(1),not-a-url,' })
    expect(list).toEqual([])
  })

  it('hiç değişken yoksa liste boştur', () => {
    expect(buildAllowedOrigins({})).toEqual([])
  })
})

describe('isOriginAccepted — erişim kapısı', () => {
  it('listedeki köken kabul edilir, dışındaki reddedilir', () => {
    const list = [SITE]
    expect(isOriginAccepted(list, SITE)).toBe(true)
    expect(isOriginAccepted(list, EVIL)).toBe(false)
  })

  it('alt alan adı ve önek/sonek benzerliği GEÇEMEZ', () => {
    const list = [SITE]
    expect(isOriginAccepted(list, 'https://evil.venthub.com.tr')).toBe(false)
    expect(isOriginAccepted(list, 'https://venthub.com.tr.evil.example')).toBe(false)
    expect(isOriginAccepted(list, 'https://venthub.com.tr:8443')).toBe(false)
    expect(isOriginAccepted(list, 'http://venthub.com.tr')).toBe(false) // şema önemli
  })

  it('liste boşsa erişim engellenmez (yapılandırılmamış kurulum kırılmasın)', () => {
    expect(isOriginAccepted([], EVIL)).toBe(true)
  })
})

describe('pickRedirectOrigin — YÖNLENDİRME hedefi (asıl güvenlik yüzeyi)', () => {
  it('istekten gelen köken listedeyse kullanılır (çok-alanlı kurulum)', () => {
    const list = [SITE, 'https://a.example']
    expect(pickRedirectOrigin(list, 'https://a.example')).toBe('https://a.example')
  })

  it('liste dışı köken ASLA sonuca sızmaz — kanoniğe düşülür', () => {
    const list = [SITE]
    expect(pickRedirectOrigin(list, EVIL)).toBe(SITE)
    expect(pickRedirectOrigin(list, 'https://evil.venthub.com.tr')).toBe(SITE)
  })

  it('LİSTE BOŞKEN BİLE saldırganın kökeni kullanılmaz', () => {
    // Kritik ayrım: `isOriginAccepted` boş listede toleranslıdır, burası DEĞİLDİR.
    // Erişime izin vermek başka, kullanıcıyı saldırganın adresine göndermek başkadır.
    expect(pickRedirectOrigin([], EVIL)).toBeNull()
  })

  it('köken yoksa kanonik kullanılır', () => {
    expect(pickRedirectOrigin([SITE], null)).toBe(SITE)
    expect(pickRedirectOrigin([SITE], '')).toBe(SITE)
  })
})

describe('isAllowedRedirectTarget — callback tarafındaki kapı', () => {
  it('izinli kökendeki tam URL kabul edilir (yol serbest)', () => {
    expect(isAllowedRedirectTarget([SITE], `${SITE}/payment-success?orderId=1`)).toBe(true)
  })

  it('saldırganın URL biçimleri reddedilir', () => {
    const list = [SITE]
    for (const bad of [
      `${EVIL}/payment-success`,
      'https://evil.venthub.com.tr/payment-success',
      'javascript:alert(1)',
      '//evil.example/payment-success', // şemasız protokol-göreli
      '/payment-success', // göreli yol = köken çözülemez
      '',
      null,
      undefined,
    ]) {
      expect(isAllowedRedirectTarget(list, bad), `kabul edilmemeliydi: ${String(bad)}`).toBe(false)
    }
  })

  it('liste boşsa HİÇBİR hedef kabul edilmez (fail-closed)', () => {
    // Yapılandırma olmasa bile açık yönlendirme kapalıdır: callback bu durumda
    // parametreyi yok sayıp ortamdan türetilen kanonik adrese düşer.
    expect(isAllowedRedirectTarget([], `${SITE}/payment-success`)).toBe(false)
    expect(isAllowedRedirectTarget([], `${EVIL}/payment-success`)).toBe(false)
  })
})
