/**
 * INV-TARAYICI-PARCACIK-1 · Tarayıcı parçacık setinin ağsız doğrulaması (Kanban SEO-98, OPS-256 2. dalga).
 *
 * Kilitlenenler: üç parçacık da söz dizimi olarak derlenir; GSC parçacığı doğru düğme/başarı ifadelerini taşır ve
 * girdi yoksa/düğme yoksa sessiz başarı vermez; Bing çıkarıcı sahte DOM'da alan adı verir (www'suz, /ck/a çözülür);
 * Google parçacığı captcha'yı atlatmaya çalışmaz, yalnız bildirir; CLI bilinmeyen adı reddeder (çıkış 2).
 */
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import vm from 'node:vm'
import { GSC_ISTEK_PARCACIGI, BING_SERP_PARCACIGI, GOOGLE_SERP_PARCACIGI, PARCACIKLAR } from '../tarayici-parcaciklari.mjs'

const BETIK = resolve(__dirname, '..', 'tarayici-parcaciklari.mjs')

describe('derleme', () => {
  it.each(Object.entries(PARCACIKLAR))('%s söz dizimi geçerli', (_ad, kaynak) => {
    expect(() => new vm.Script(kaynak as string)).not.toThrow()
  })
})

describe('gsc', () => {
  it('düğme ve başarı ifadelerini taşır, giriş/düğme yokluğunda ayrı durum döner', () => {
    expect(GSC_ISTEK_PARCACIGI).toContain('dizine eklenmesini iste')
    expect(GSC_ISTEK_PARCACIGI).toContain('Dizine eklenmesi istendi')
    expect(GSC_ISTEK_PARCACIGI).toContain("'GIRIS YOK'")
    expect(GSC_ISTEK_PARCACIGI).toContain("'DUGME YOK'")
    expect(GSC_ISTEK_PARCACIGI).toContain("'ZAMAN ASIMI'")
  })
  it('giriş alanı yoksa GIRIS YOK döner', async () => {
    const pencere: any = { window: {}, document: { querySelectorAll: () => [] } }
    vm.runInNewContext(GSC_ISTEK_PARCACIGI, pencere)
    expect(await pencere.window.__iste('https://x/', false)).toEqual({ url: 'https://x/', durum: 'GIRIS YOK' })
  })
})

describe('bing', () => {
  it('sonuç bağlantılarından www’suz alan adı çıkarır, /ck/a yönlendirmesini çözer', () => {
    const hedef = 'https://www.venthub.com.tr/tr/x'
    const b64 = 'a1' + Buffer.from(hedef).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    const baglantilar = [
      { href: 'https://www.ornek.com/a' },
      { href: `https://www.bing.com/ck/a?u=${b64}` },
    ]
    const sonuc = vm.runInNewContext(BING_SERP_PARCACIGI, {
      document: { querySelectorAll: () => baglantilar }, URL, atob,
    })
    expect(Array.from(sonuc)).toEqual(['ornek.com', 'venthub.com.tr'])
  })
})

describe('google', () => {
  it('captcha sayfasında atlatmaya çalışmaz, captcha:true bildirir', async () => {
    const pencere: any = {
      window: {},
      fetch: async () => ({ text: async () => 'Our systems have detected unusual traffic', url: 'https://www.google.com/sorry/index' }),
      encodeURIComponent, URL, DOMParser: class {},
    }
    vm.runInNewContext(GOOGLE_SERP_PARCACIGI, pencere)
    expect(await pencere.window.serp('deneme')).toEqual({ captcha: true })
  })
  it('çıktıya sorgu dizesi koymaz', () => {
    expect(GOOGLE_SERP_PARCACIGI).not.toMatch(/return\s+\{[^}]*\bq\b/)
  })
})

describe('CLI', () => {
  it('geçerli adı basar, bilinmeyeni 2 ile reddeder', () => {
    const iyi = spawnSync(process.execPath, [BETIK, 'bing'], { encoding: 'utf8' })
    expect(iyi.status).toBe(0)
    expect(iyi.stdout).toContain('b_algo')
    const kotu = spawnSync(process.execPath, [BETIK, 'yandex'], { encoding: 'utf8' })
    expect(kotu.status).toBe(2)
  })
})
