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
import { GSC_ISTEK_PARCACIGI, BING_SERP_PARCACIGI, GOOGLE_SERP_PARCACIGI, PARCACIKLAR, dizinTakipBetigi, gscParcacigi, izinliCoz } from '../tarayici-parcaciklari.mjs'
import { kaydetArgumanlariCoz } from '../dizin-takip.mjs'
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { EOL, tmpdir } from 'node:os'
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

  it('başarısız zorla denemesi önceki başarılı isteğin kilidini silmez', async () => {
    const s = sahteSayfa()
    vm.runInNewContext(gscParcacigi(['https://a/']), s.baglam)
    expect((await s.baglam.window.__iste('https://a/', false)).sonuc).toBe('ISTENDI')
    // aynı pencere, kota dolu sayfa: zorla denemesi HATA alır
    const h = sahteSayfa('hata')
    h.baglam.window = s.baglam.window
    vm.runInNewContext(gscParcacigi(['https://a/']), h.baglam)
    expect((await h.baglam.window.__iste('https://a/', false, { zorla: true })).sonuc).toMatch(/^HATA:/)
    expect((await h.baglam.window.__iste('https://a/', false)).durum).toBe('TEKRAR RED')
  })

  it('ilk=true: sayfadaki adres istenenle birebir değilse (önek-slug) tıklamaz, kilidi bırakır', async () => {
    const { baglam, tiklamalar } = sahteSayfa()
    vm.runInNewContext(gscParcacigi(['https://a/x', 'https://a/x-uzun']), baglam)
    await baglam.window.__iste('https://a/x-uzun', false) // sayfada x-uzun açık
    expect((await baglam.window.__iste('https://a/x', true)).durum).toBe('DUGME YOK')
    expect(tiklamalar).toEqual(['https://a/x-uzun'])
    expect((await baglam.window.__iste('https://a/x', false)).sonuc).toBe('ISTENDI')
  })

  // INV-DIZIN-KAYDET-1 (SEO-127): ISTENDI sonucu hazır kayıt satırını taşır; kayıtsız eylem yapılmamış sayılır (D7 madde 2).
  it('ISTENDI sonucu kaydet alanı taşır; satır dizin-takip --kaydet çözümleyicisinden hatasız geçer', async () => {
    const { baglam } = sahteSayfa()
    const adres = 'https://venthub.com.tr/tr/bilgi-merkezi/yazi-a'
    vm.runInNewContext(gscParcacigi([adres]), baglam)
    const r = await baglam.window.__iste(adres, false)
    expect(r.sonuc).toBe('ISTENDI')
    expect(r.kaydet).toBe(`node scripts/seo/dizin-takip.mjs --kaydet google istek ${adres}`)
    const parcalar = (r.kaydet as string).split(' ')
    expect(kaydetArgumanlariCoz(parcalar.slice(2))).toMatchObject({ motor: 'google', eylem: 'istek', adresler: [adres] })
  })
  it('zorla ile ISTENDI: kaydet satırı --neden yer tutucusu taşır (gerekçesiz zorlama kaydı yapıştırılmaz)', async () => {
    const { baglam } = sahteSayfa()
    const adres = 'https://venthub.com.tr/tr/bilgi-merkezi/yazi-z'
    vm.runInNewContext(gscParcacigi([]), baglam)
    const r = await baglam.window.__iste(adres, false, { zorla: true })
    expect(r.sonuc).toBe('ISTENDI')
    expect(r.kaydet).toBe(`node scripts/seo/dizin-takip.mjs --kaydet google istek ${adres} --neden "<zorla gerekcesi>"`)
  })
  it('ISTENDI dışındaki her sonuçta kaydet alanı YOK (HATA, ZAMAN ASIMI, TABLODA YOK, TEKRAR RED)', async () => {
    const hata = sahteSayfa('hata')
    vm.runInNewContext(gscParcacigi(['https://a/']), hata.baglam)
    const h = await hata.baglam.window.__iste('https://a/', false)
    expect(h.sonuc).toMatch(/^HATA:/)
    expect('kaydet' in h).toBe(false)
    const sessiz = sahteSayfa('sessiz')
    vm.runInNewContext(gscParcacigi(['https://a/']), sessiz.baglam)
    const z = await sessiz.baglam.window.__iste('https://a/', false)
    expect(z.sonuc).toBe('ZAMAN ASIMI')
    expect('kaydet' in z).toBe(false)
    expect('kaydet' in (await sessiz.baglam.window.__iste('https://a/', false))).toBe(false) // TEKRAR RED
    expect('kaydet' in (await sessiz.baglam.window.__iste('https://b/', false))).toBe(false) // TABLODA YOK
  })
  it('kabuk için güvenli olmayan adreste kaydet satırı üretilmez (kopyalanınca komut enjekte olmasın)', async () => {
    for (const tehlikeli of ['https://a/x;rm', 'https://a/$(x)', 'https://a/x&y', 'https://a/x`y`']) {
      const { baglam } = sahteSayfa()
      vm.runInNewContext(gscParcacigi([tehlikeli]), baglam)
      const r = await baglam.window.__iste(tehlikeli, false)
      expect(r.sonuc, tehlikeli).toBe('ISTENDI')
      expect('kaydet' in r, tehlikeli).toBe(false)
    }
  })

  it('iç gövde pencereye açılmaz: kapı atlanamaz', () => {
    const { baglam } = sahteSayfa()
    vm.runInNewContext(gscParcacigi(['https://a/']), baglam)
    expect(Object.keys(baglam.window).sort()).toEqual(['__gonderildi', '__iste', '__izinli'])
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

// INV-DIZIN-KALAN-AKIS-1 (SEO-127, D7 madde 17): gsc --kalan google listeyi dizin-takip alt sürecinden alır; ağ yok (sahte betik).
describe('gsc --kalan google (SEO-127)', () => {
  const A = 'https://venthub.com.tr/tr/bilgi-merkezi/yazi-a'
  const B = 'https://venthub.com.tr/tr/bilgi-merkezi/yazi-b'
  /** Sahte dizin-takip: aldığı bağımsız değişkenleri ve ortamı iz dosyasına yazar, istenen kodla çıkar. */
  function sahte() {
    const d = mkdtempSync(join(tmpdir(), 'seo127-kalan-'))
    const betik = join(d, 'sahte-dizin-takip.mjs')
    const iz = join(d, 'iz.txt')
    writeFileSync(betik, [
      "import { appendFileSync } from 'node:fs'",
      "import { EOL } from 'node:os'",
      "appendFileSync(process.env.FAKE_IZ, [process.argv.slice(2).join(' '), process.env.FAKE_ORTAM ?? ''].join('|') + EOL)",
      'if (process.env.FAKE_STDERR) process.stderr.write(process.env.FAKE_STDERR + EOL)',
      'if (process.env.FAKE_STDOUT) process.stdout.write(process.env.FAKE_STDOUT)',
      'process.exitCode = Number(process.env.FAKE_KOD ?? 0)',
    ].join(EOL))
    const kos = (args: string[], env: Record<string, string> = {}) => spawnSync(process.execPath, [BETIK, 'gsc', ...args], {
      encoding: 'utf8',
      env: { ...process.env, DIZIN_TAKIP_BETIK: betik, FAKE_IZ: iz, FAKE_ORTAM: 'ayni-ortam', ...env },
    })
    return { kos, iz }
  }

  it('listeyi alt süreçten alır, --sinir ve ortamı iletir, parçacığa gömer; dosya gerekmez', () => {
    const { kos, iz } = sahte()
    const r = kos(['--kalan', 'google', '--sinir', '3'], { FAKE_STDOUT: `${A}\n${B}\n` })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain(`window.__izinli = new Set(${JSON.stringify([A, B])})`)
    expect(r.stderr).toContain('2 adres gömüldü')
    expect(readFileSync(iz, 'utf8').trim()).toBe('--kalan google --sinir 3|ayni-ortam')
  })
  it('--sinir verilmezse alt sürece de verilmez (tam liste), uyarı satırları listeye karışmaz', () => {
    const { kos, iz } = sahte()
    const r = kos(['--kalan', 'google'], { FAKE_STDOUT: `${A}\nUYARI: bir şey\n${B}\n` })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain(JSON.stringify([A, B]))
    expect(readFileSync(iz, 'utf8').trim()).toBe('--kalan google|ayni-ortam')
  })
  it('alt süreç 1 (OLCULEMEDI uyarısı): parçacık ÜRETİLMEZ, alt sürecin stderr\'i geçer, çıkış 1', () => {
    const { kos } = sahte()
    const r = kos(['--kalan', 'google', '--sinir', '3'], { FAKE_KOD: '1', FAKE_STDOUT: `${A}\n`, FAKE_STDERR: 'UYARI: google için 5/100 adreste durum okunamadı (OLCULEMEDI)' })
    expect(r.status).toBe(1)
    expect(r.stdout).toBe('')
    expect(r.stderr).toContain('UYARI: google için 5/100 adreste durum okunamadı (OLCULEMEDI)')
  })
  it('alt süreç 2 (araç koşmadı): parçacık ÜRETİLMEZ, stderr geçer, çıkış 2', () => {
    const { kos } = sahte()
    const r = kos(['--kalan', 'google'], { FAKE_KOD: '2', FAKE_STDERR: 'HATA: site haritası okunamadı' })
    expect(r.status).toBe(2)
    expect(r.stdout).toBe('')
    expect(r.stderr).toContain('HATA: site haritası okunamadı')
  })
  it('kalan yok (alt süreç 0, boş çıktı): parçacık yok, çıkış 1; tavan üstü liste çıkış 2', () => {
    const { kos } = sahte()
    const bos = kos(['--kalan', 'google'], { FAKE_STDERR: 'kalan yok: google için YAP/TEKRAR adres yok (ölçüm temiz)' })
    expect(bos.status).toBe(1)
    expect(bos.stdout).toBe('')
    expect(bos.stderr).toContain('kalan yok')
    const uzun = kos(['--kalan', 'google'], { FAKE_STDOUT: Array.from({ length: 16 }, (_, i) => `https://venthub.com.tr/tr/x${i}`).join('\n') })
    expect(uzun.status).toBe(2)
    expect(uzun.stdout).toBe('')
  })
  it('bozuk bağımsız değişken alt süreç çalışmadan çıkış 2: --kalan değeri, --sinir, --izinli/--zorla ile birlikte', () => {
    for (const args of [['--kalan'], ['--kalan', 'bing'], ['--kalan', '--sinir', '3'], ['--kalan', 'google', '--sinir', '0'], ['--kalan', 'google', '--sinir', 'x'], ['--kalan', 'google', '--sinir'], ['--kalan', 'google', '--izinli', 'f.txt'], ['--kalan', 'google', '--zorla']]) {
      const { kos, iz } = sahte()
      const r = kos(args, { FAKE_STDOUT: `${A}\n` })
      expect(r.status, args.join(' ')).toBe(2)
      expect(r.stdout, args.join(' ')).toBe('')
      expect(existsSync(iz), args.join(' ')).toBe(false)
    }
  })
  it('alt süreç betiği ortam değişkeniyle değişir; varsayılan komşu dizin-takip.mjs\'dir', () => {
    expect(dizinTakipBetigi({ DIZIN_TAKIP_BETIK: '/x/sahte.mjs' } as unknown as NodeJS.ProcessEnv)).toBe('/x/sahte.mjs')
    const varsayilan = dizinTakipBetigi({} as unknown as NodeJS.ProcessEnv)
    expect(varsayilan.replace(/\\/g, '/')).toMatch(/scripts\/seo\/dizin-takip\.mjs$/)
    expect(existsSync(varsayilan)).toBe(true)
  })
  it('--izinli yolu çalışır ama elle liste uyarısı verir; --zorla uyarısı gerekçenin --neden ile yazılacağını söyler', () => {
    const kl = mkdtempSync(join(tmpdir(), 'seo127-izinli-'))
    const dosya = join(kl, 'kalan.txt')
    writeFileSync(dosya, `${A}\n`)
    const r = spawnSync(process.execPath, [BETIK, 'gsc', '--izinli', dosya], { encoding: 'utf8' })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain(JSON.stringify([A]))
    expect(r.stderr).toContain('UYARI: elle liste; tercih --kalan')
    const z = spawnSync(process.execPath, [BETIK, 'gsc', '--zorla'], { encoding: 'utf8' })
    expect(z.status).toBe(0)
    expect(z.stderr).toContain('--neden')
  })
})
