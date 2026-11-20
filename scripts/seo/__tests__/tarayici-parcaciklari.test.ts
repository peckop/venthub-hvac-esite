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
import { GSC_ISTEK_PARCACIGI, BING_SERP_PARCACIGI, GOOGLE_SERP_PARCACIGI, PARCACIKLAR, gscParcacigi, izinliCoz } from '../tarayici-parcaciklari.mjs'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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
    vm.runInNewContext(gscParcacigi(['https://x/']), pencere)
    expect(await pencere.window.__iste('https://x/', false)).toEqual({ url: 'https://x/', durum: 'GIRIS YOK' })
  })
})

// INV-DIZIN-ISTEK-KAPI-1 (SEO-130, D4 "Google tek istek"): parçacık tablo dışı adrese ve aynı adrese ikinci kez TIKLAMAZ.
describe('gsc tablo kapısı', () => {
  /** Sahte GSC sayfası: girişe yazılan adres sayfa metnine düşer, düğmeye basınca "istendi" metni çıkar. */
  function sahteSayfa(mod: 'ok' | 'hata' | 'sessiz' = 'ok') {
    let deger = ''
    let istendi = false
    const sonucMetni = () => (!istendi ? '' : mod === 'ok' ? 'Dizine eklenmesi istendi' : mod === 'hata' ? 'Kota Aşıldı' : '')
    const tiklamalar: string[] = []
    const inp: any = {
      getAttribute: () => 'URL inceleyin', placeholder: '', focus() {}, dispatchEvent() {},
    }
    const dugme: any = {
      children: [], textContent: 'Dizine eklenmesini iste', scrollIntoView() {},
      closest: () => ({ click: () => { tiklamalar.push(deger); istendi = true } }),
    }
    class HTMLInputElement {}
    Object.defineProperty(HTMLInputElement.prototype, 'value', { set(v: string) { deger = v; istendi = false }, configurable: true })
    const document: any = {
      querySelectorAll: (s: string) => (s === 'input' ? [inp] : s === 'span' ? [dugme] : []),
      get body() { return { innerText: `URL Denetimi ${'x'.repeat(40)} ${deger} ${sonucMetni()}` } },
    }
    const baglam: any = {
      window: {}, document, HTMLInputElement, Event: class {}, KeyboardEvent: class {},
      setTimeout: (f: () => void) => f(), Promise,
    }
    return { baglam, tiklamalar }
  }

  it('listede olmayan adrese tıklamaz: TABLODA YOK', async () => {
    const { baglam, tiklamalar } = sahteSayfa()
    vm.runInNewContext(gscParcacigi(['https://a/']), baglam)
    expect(await baglam.window.__iste('https://b/', false)).toEqual({ url: 'https://b/', durum: 'TABLODA YOK' })
    expect(tiklamalar).toEqual([])
  })

  it('aynı adres ikinci kez reddedilir: TEKRAR RED, tek tıklama', async () => {
    const { baglam, tiklamalar } = sahteSayfa()
    vm.runInNewContext(gscParcacigi(['https://a/']), baglam)
    const ilk = await baglam.window.__iste('https://a/', false)
    expect(ilk.sonuc).toBe('ISTENDI')
    expect(await baglam.window.__iste('https://a/', false)).toEqual({ url: 'https://a/', durum: 'TEKRAR RED' })
    expect(tiklamalar).toEqual(['https://a/'])
  })

  it('zorla:true bilinçli istisnadır; zorla:"evet" gibi gevşek değer geçmez', async () => {
    const { baglam, tiklamalar } = sahteSayfa()
    vm.runInNewContext(GSC_ISTEK_PARCACIGI, baglam)
    expect((await baglam.window.__iste('https://c/', false, { zorla: 'evet' })).durum).toBe('TABLODA YOK')
    expect((await baglam.window.__iste('https://c/', false, { zorla: true })).sonuc).toBe('ISTENDI')
    expect(tiklamalar).toEqual(['https://c/'])
  })

  it('eşzamanlı iki çağrıda yalnız biri tıklar, öteki TEKRAR RED', async () => {
    const { baglam, tiklamalar } = sahteSayfa()
    vm.runInNewContext(gscParcacigi(['https://a/']), baglam)
    const [r1, r2] = await Promise.all([baglam.window.__iste('https://a/', false), baglam.window.__iste('https://a/', false)])
    expect([r1.durum, r2.durum]).toContain('TEKRAR RED')
    expect(tiklamalar).toEqual(['https://a/'])
  })

  it('sonucu belirsiz (ZAMAN ASIMI) istek kilitli kalır: ikinci çağrı TEKRAR RED', async () => {
    const { baglam, tiklamalar } = sahteSayfa('sessiz')
    vm.runInNewContext(gscParcacigi(['https://a/']), baglam)
    expect((await baglam.window.__iste('https://a/', false)).sonuc).toBe('ZAMAN ASIMI')
    expect((await baglam.window.__iste('https://a/', false)).durum).toBe('TEKRAR RED')
    expect(tiklamalar).toEqual(['https://a/'])
  })

  it('açık HATA (kota) kilidi kaldırır: aynı adres yeniden denenebilir', async () => {
    const { baglam, tiklamalar } = sahteSayfa('hata')
    vm.runInNewContext(gscParcacigi(['https://a/']), baglam)
    expect((await baglam.window.__iste('https://a/', false)).sonuc).toMatch(/^HATA:/)
    expect((await baglam.window.__iste('https://a/', false)).sonuc).toMatch(/^HATA:/)
    expect(tiklamalar).toEqual(['https://a/', 'https://a/'])
  })

  it('izinliCoz yalnız https satırlarını alır, uyarıyı ve tekrarı atar', () => {
    expect(izinliCoz('https://a/\nUYARI: x\n\nhttps://a/\r\nhttps://b/ \nkalan yok')).toEqual(['https://a/', 'https://b/'])
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
  it('gsc listesiz ve --zorla\'sız 2 ile reddedilir; --izinli dosyadaki adresleri gömer; boş liste 1', () => {
    expect(spawnSync(process.execPath, [BETIK, 'gsc'], { encoding: 'utf8' }).status).toBe(2)
    const kl = mkdtempSync(join(tmpdir(), 'seo130-'))
    const dolu = join(kl, 'kalan.txt'); writeFileSync(dolu, 'https://venthub.com.tr/tr/x\n')
    const iyi = spawnSync(process.execPath, [BETIK, 'gsc', '--izinli', dolu], { encoding: 'utf8' })
    expect(iyi.status).toBe(0)
    expect(iyi.stdout).toContain('"https://venthub.com.tr/tr/x"')
    const bos = join(kl, 'bos.txt'); writeFileSync(bos, 'kalan yok\n')
    expect(spawnSync(process.execPath, [BETIK, 'gsc', '--izinli', bos], { encoding: 'utf8' }).status).toBe(1)
    const uzun = join(kl, 'uzun.txt')
    writeFileSync(uzun, Array.from({ length: 16 }, (_, i) => `https://venthub.com.tr/tr/x${i}`).join('\n'))
    expect(spawnSync(process.execPath, [BETIK, 'gsc', '--izinli', uzun], { encoding: 'utf8' }).status).toBe(2)
    const stdin = spawnSync(process.execPath, [BETIK, 'gsc', '--izinli', '-'], { encoding: 'utf8', input: 'https://venthub.com.tr/tr/y\n' })
    expect(stdin.status).toBe(0)
    expect(stdin.stdout).toContain('"https://venthub.com.tr/tr/y"')
    const zorla = spawnSync(process.execPath, [BETIK, 'gsc', '--zorla'], { encoding: 'utf8' })
    expect(zorla.status).toBe(0)
    expect(zorla.stderr).toContain('UYARI')
  })
})
