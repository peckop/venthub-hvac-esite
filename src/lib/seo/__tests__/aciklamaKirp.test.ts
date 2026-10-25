import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ACIKLAMA_ASGARI, ACIKLAMA_AZAMI, ACIKLAMA_ESNEK_AZAMI, aciklamaKirp } from '../aciklamaKirp'

/**
 * INV-ACIKLAMA-KIRP-1 — meta açıklama TEK yerde, sözcük/cümle sınırına saygılı kesilir (REC-497).
 * Kaynak: canlı kapı 2026-10-02, 29 aile sayfası `substring(0, 160)` ile cümle ortasında bitiyordu.
 */
describe('aciklamaKirp', () => {
  const uzunCumle =
    'Basınç kaybı düşük, enerji verimli ve düşük sesli santrifüj fanlar; kanal tipi uygulamalarda yüksek debi ve geniş çalışma aralığı sunar, bakım gerektirmeyen motor yapısıyla uzun ömür sağlar'

  it('kısa metin aynen döner, boşluklar normalize edilir', () => {
    expect(aciklamaKirp('  Kısa   bir\nmetin. ')).toBe('Kısa bir metin.')
  })

  it('boş, null ve undefined boş dize verir', () => {
    expect(aciklamaKirp('')).toBe('')
    expect(aciklamaKirp('   ')).toBe('')
    expect(aciklamaKirp(null)).toBe('')
    expect(aciklamaKirp(undefined)).toBe('')
  })

  it('uzun metin azami uzunluğu aşmaz ve yarım sözcükle bitmez', () => {
    const sonuc = aciklamaKirp(uzunCumle)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('…')).toBe(true)
    const govde = sonuc.slice(0, -1)
    // Kesilen yerden sonra orijinalde boşluk gelmeli: sözcük bütün.
    expect(uzunCumle.startsWith(govde)).toBe(true)
    expect(uzunCumle[govde.length]).toBe(' ')
  })

  it('azami içindeki son cümle sonunda biter', () => {
    const s1 = 'Bu fan ailesi kanal hattına seri bağlanır ve asma tavan arasında görünmeden çalışır.'
    const s2 = 'Motor koruma sensörü standart gelir ve bakım gerektirmez, uzun ömürlüdür ve sessizdir.'
    const sonuc = aciklamaKirp(`${s1} ${s2}`)
    expect(sonuc).toBe(s1)
    expect(sonuc.length).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
  })

  it('kısaltma noktası cümle sonu sayılmaz', () => {
    const metin =
      'Pervane çapı 500 mm olan bu fan, maks. 12000 m³/h debiye ulaşır ve kanal hattında yüksek basınca dayanır, sessiz çalışır ve bakım gerektirmez'
    const sonuc = aciklamaKirp(metin)
    expect(sonuc.endsWith('maks.')).toBe(false)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
  })

  // ── URN-140 / SEO-61: azami içinde cümle sonu yoksa "…" yerine ilk TAM cümle (esnek tavana kadar) ──────────────
  describe('azami içinde cümle sonu yoksa ilk tam cümle (esnek tavan)', () => {
    // Canlıdan: danfoss-vlt-hvac-basic-drive-fc-101 açıklaması, 199 karakter, TEK cümle. Eskiden "…sunan bir…" diye kesiliyordu.
    const DANFOSS =
      'Danfoss VLT HVAC Basic Drive FC101, HVAC uygulamalarına özel fonksiyonlar, EMC filtre, otomatik enerji optimizasyonu ve akıllı logic kontrolör sunan bir frekans konvertörü (motor sürücüsü) serisidir.'

    it('tek uzun cümle (azami < uzunluk <= esnek tavan): cümle olduğu gibi döner, "…" yok', () => {
      expect(DANFOSS.length).toBeGreaterThan(ACIKLAMA_AZAMI)
      expect(DANFOSS.length).toBeLessThanOrEqual(ACIKLAMA_ESNEK_AZAMI)
      expect(aciklamaKirp(DANFOSS)).toBe(DANFOSS)
    })

    it('eski davranış: esnek tavan kapatılırsa (esnek = azami) aynı metin sözcük sınırında "…" ile biter', () => {
      const sonuc = aciklamaKirp(DANFOSS, ACIKLAMA_AZAMI, ACIKLAMA_AZAMI)
      expect(sonuc.endsWith('…')).toBe(true)
      expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    })

    it('tam cümle azami içine sığıyor: o cümlede biter (esnek tavan devreye girmez)', () => {
      const s1 = 'Bu fan ailesi kanal hattına seri bağlanır ve asma tavan arasında görünmeden çalışır.'
      const s2 = `${'Motor koruma sensörü standart gelir ve bakım gerektirmez, '.repeat(2)}uzun ömürlüdür ve sessizdir.`
      const sonuc = aciklamaKirp(`${s1} ${s2}`)
      expect(sonuc).toBe(s1)
    })

    it('iki cümleden biri sığıyor: sığan son tam cümle seçilir, ikinciye uzatılmaz', () => {
      const s1 = 'Bu fan ailesi kanal hattına seri bağlanır ve asma tavan arasında görünmeden çalışır, bakım istemez.'
      const s2 = 'İkinci cümle ise ayrıca bir motor koruma sensörü ve uzaktan okunabilir bir hata ekranı içerir ve uzun ömürlüdür.'
      expect(s1.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
      expect(s1.length + 1 + s2.length).toBeGreaterThan(ACIKLAMA_AZAMI)
      expect(aciklamaKirp(`${s1} ${s2}`)).toBe(s1)
    })

    it('azami içinde yalnız ASGARI altı kısa cümle var: azami aşan ilk tam cümle seçilir', () => {
      const kisa = 'Kısa giriş cümlesi.'
      const uzun =
        'Bu ikinci cümle katalogdaki tüm modelleri kapsar, kanal tipi uygulamalarda yüksek debi ve geniş çalışma aralığı sunar, bakım gerektirmeyen motor yapısıyla uzun ömür sağlar.'
      expect(kisa.length).toBeLessThan(ACIKLAMA_ASGARI)
      expect(kisa.length + 1 + uzun.length).toBeGreaterThan(ACIKLAMA_AZAMI)
      expect(aciklamaKirp(`${kisa} ${uzun}`)).toBe(`${kisa} ${uzun}`)
    })

    it('hiç nokta yok (cümle işareti yok): tam cümle sayılmaz, sözcük sınırı + "…"', () => {
      const sonuc = aciklamaKirp(uzunCumle)
      expect(uzunCumle.length).toBeLessThanOrEqual(ACIKLAMA_ESNEK_AZAMI)
      expect(sonuc.endsWith('…')).toBe(true)
      expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    })

    it('ilk cümle esnek tavanı da aşıyor: dürüst kesik (sözcük sınırı + "…"), azami içinde', () => {
      const cok = `${'Bu cümle kanal hattında yüksek verimle çalışan fan ailesini anlatır, '.repeat(6)}ve sonunda biter.`
      expect(cok.length).toBeGreaterThan(ACIKLAMA_ESNEK_AZAMI)
      const sonuc = aciklamaKirp(cok)
      expect(sonuc.endsWith('…')).toBe(true)
      expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    })

    it('ondalık sayı ("0.5 m³/h", "12,5 kW.") cümle sonu sayılmaz; cümle sonundaki sayı noktası sayılır', () => {
      // "0.5 m³/h" içindeki nokta: ardında boşluk yok. "12,5 kW. Sonraki": gerçek cümle sonu.
      const s1 = 'Bu fan ailesinin ses basınç seviyesi 0.5 m mesafede ölçülür ve nominal motor gücü 12,5 kW. '
      const s2 = 'Sonraki cümle ise bakım aralıklarını ve filtre değişim sürelerini ayrıntılı biçimde anlatır, uzun ömür sağlar.'
      const metin = `${s1}${s2}`
      expect(s1.trim().length).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
      expect(metin.length).toBeGreaterThan(ACIKLAMA_AZAMI)
      expect(aciklamaKirp(metin)).toBe(s1.trim())
    })

    it('birim paydasıyla biten cümle ("m³/h.") TAM cümledir: metin sonunda ve ortada', () => {
      // Canlıdan: avens-bvu-siginak-havalandirma-uniteleri EN, 284 karakter, "… 3,200 m³/h." ile biter. Tek harfli "h" kısaltma sayılıyor,
      // metin sonu cümle sonu görünmüyor ve açıklama "…" ile kesiliyordu.
      const bas = 'The unit is a shelter ventilation unit with a nuclear fallout filter and a carbon filter, and it offers a maximum airflow rate between 1,200 m³/h and 3,200 m³/h.'
      expect(bas.length).toBeGreaterThan(ACIKLAMA_AZAMI)
      expect(bas.length).toBeLessThanOrEqual(ACIKLAMA_ESNEK_AZAMI)
      expect(aciklamaKirp(bas)).toBe(bas)
      // Ortada: birim noktası + büyük harf = cümle sonu; azami içindeki son tam cümlede biter.
      const ilk = 'Bu sığınak ünitesi nükleer serpinti filtresi ve karbon filtresiyle gelir, debisi 1.200 m³/h ile 3.200 m³/h.'
      const ikinci = 'Ayrıca bakım aralığı uzundur ve filtre değişimi kolaydır, servis ömrü uzundur, montaj basittir.'
      expect(ilk.length).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
      expect(ilk.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
      expect(aciklamaKirp(`${ilk} ${ikinci}`)).toBe(ilk)
    })

    it('tek harfli kısaltma ("A. Yılmaz", "3 m. 5") hâlâ cümle sonu sayılmaz (birim paydası istisnası dar)', () => {
      const metin = `${'Tasarım A. Yılmaz imzalıdır ve kanal hattında sessiz çalışır, bakım gerektirmez, '.repeat(2)}uzun ömürlüdür ve geniş çalışma aralığı sunar, çok sağlamdır.`
      const sonuc = aciklamaKirp(metin, ACIKLAMA_AZAMI, ACIKLAMA_AZAMI)
      expect(sonuc.endsWith('A.')).toBe(false)
      expect(sonuc.endsWith('…')).toBe(true)
    })

    it('kısaltma ile biten metin (maks.) cümle sonu sayılmaz', () => {
      const metin = `${'Bu fan ailesi kanal hattında yüksek verimle çalışır ve sessizdir, debisi '.repeat(3)}maks.`
      expect(metin.length).toBeGreaterThan(ACIKLAMA_AZAMI)
      expect(metin.length).toBeLessThanOrEqual(ACIKLAMA_ESNEK_AZAMI)
      const sonuc = aciklamaKirp(metin)
      expect(sonuc.endsWith('maks.')).toBe(false)
      expect(sonuc.endsWith('…')).toBe(true)
    })

    it('kısa metin değişmez, çok boşluklu kısa metin yalnız normalize edilir', () => {
      expect(aciklamaKirp('Kısa bir açıklama.')).toBe('Kısa bir açıklama.')
      expect(aciklamaKirp('Kısa   bir\n açıklama.')).toBe('Kısa bir açıklama.')
    })

    it('tam cümle sonucu da idempotent (ikinci kırpma değiştirmez)', () => {
      const bir = aciklamaKirp(DANFOSS)
      expect(aciklamaKirp(bir)).toBe(bir)
    })

    it('özel azami verilirse esnek tavan ona eşitlenir (çağıranın sert sınırı korunur)', () => {
      expect(aciklamaKirp(DANFOSS, 100).length).toBeLessThanOrEqual(100)
    })

    it('kapatan tırnaklı son cümle de tam cümledir', () => {
      const metin =
        'Üretici bu fan ailesi için şöyle der: "kanala doğrudan bağlanır, sessiz çalışır ve bakım gerektirmez, uzun ömür sağlar, enerji tasarrufu verir, filtre değişimi kolaydır ve servis ömrü uzundur."'
      expect(metin.length).toBeGreaterThan(ACIKLAMA_AZAMI)
      expect(metin.length).toBeLessThanOrEqual(ACIKLAMA_ESNEK_AZAMI)
      expect(aciklamaKirp(metin)).toBe(metin)
    })
  })

  it('çok kısa ilk cümle yerine sözcük sınırı seçilir', () => {
    const metin = `Kısa giriş. ${uzunCumle}`
    const sonuc = aciklamaKirp(metin)
    expect(sonuc).not.toBe('Kısa giriş.')
    expect(sonuc.length).toBeGreaterThan(ACIKLAMA_ASGARI)
    expect(sonuc.endsWith('…')).toBe(true)
  })

  it('sondaki ayraçlar "…" öncesinde atılır', () => {
    const metin = `${'a'.repeat(100)} ${'b'.repeat(40)}, ${'c'.repeat(40)}`
    const sonuc = aciklamaKirp(metin)
    expect(sonuc).not.toMatch(/[,;:\-–—(]…$/u)
  })

  it('boşluksuz tek uzun parçada zorunlu kesim azami içinde kalır', () => {
    const sonuc = aciklamaKirp('x'.repeat(400))
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('…')).toBe(true)
  })

  it('azami parametresi uygulanır', () => {
    expect(aciklamaKirp(uzunCumle, 100).length).toBeLessThanOrEqual(100)
  })

  it('azami içindeki kısaltma noktası ("maks. 12000") cümle sonu sayılmaz', () => {
    const metin =
      'Bu fan ailesi kanal hattında yüksek basınca dayanır, sessiz çalışır ve bakım gerektirmez, debisi maks. 12000 m³/h değerine ulaşır ve geniş çalışma aralığı sunar, uzun ömürlüdür.'
    expect(metin.indexOf('maks.')).toBeGreaterThan(ACIKLAMA_ASGARI)
    // Esnek tavan kapalı (esnek = azami): azami içinde başka cümle sonu yok → sözcük sınırı + "…".
    const sonuc = aciklamaKirp(metin, ACIKLAMA_AZAMI, ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('maks.')).toBe(false)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('…')).toBe(true)
    // Varsayılan: metin tek ve tam bir cümle (esnek tavan içinde) → olduğu gibi döner, "maks." cümle sonu sayılmadan.
    expect(aciklamaKirp(metin)).toBe(metin)
  })

  it('tek harfli belirteç ("3 m. 5 kW") cümle sonu sayılmaz', () => {
    const metin =
      'Bu fan ailesi kanal hattında yüksek basınca dayanır, sessiz çalışır ve bakım gerektirmez, uzaklık yaklaşık 3 m. 5 kW motorla çalışır ve geniş çalışma aralığı sunar, uzun ömürlüdür.'
    const sonuc = aciklamaKirp(metin, ACIKLAMA_AZAMI, ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('3 m.')).toBe(false)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(aciklamaKirp(metin)).toBe(metin)
  })

  it('cümle sonundaki kapatan tırnak cümleyle birlikte kalır', () => {
    const s1 = 'Üretici bu fan ailesi için "kanala doğrudan bağlanır, sessiz ve bakım gerektirmez."'
    const s2 = 'Yeni cümle devam eder ve motor yapısı uzun ömür sağlar, geniş çalışma aralığı sunar ve bakım ister.'
    expect(s1.length).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
    expect(aciklamaKirp(`${s1} ${s2}`)).toBe(s1)
  })

  it('kesim vekil çiftinin ortasına denk gelirse yetim yarım karakter kalmaz', () => {
    const metin = `${'x'.repeat(ACIKLAMA_AZAMI - 2)}😀${'y'.repeat(20)}`
    const sonuc = aciklamaKirp(metin)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/)
    expect(sonuc).not.toMatch(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/)
  })

  it.each(['ca.', 'approx.', 'Ltd.', 'Şti.'])('azami sınırında biten "%s" cümle sonu sayılmaz, "…" eklenir', (kisaltma) => {
    // Kısaltma 154. karakterde biter; sonrasında büyük harfle başlayan metin gelir.
    const onek = `${'v'.repeat(ACIKLAMA_AZAMI - 1 - kisaltma.length - 1)} ${kisaltma}`
    const metin = `${onek} Devam eden metin burada sürer.`
    expect(onek.length).toBe(ACIKLAMA_AZAMI - 1)
    // Esnek tavan kapalı: kısaltma noktası cümle sonu sayılmaz → "…". (Varsayılanda metin tam cümle olarak döner.)
    const sonuc = aciklamaKirp(metin, ACIKLAMA_AZAMI, ACIKLAMA_AZAMI)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('…')).toBe(true)
    expect(aciklamaKirp(metin)).toBe(metin)
  })

  it('sözcük sınırı kesimi kısaltmada biterse "…" eklenir', () => {
    const metin = `${'ve '.repeat(30)}maks. ${'1'.repeat(80)} m³/h değerine ulaşır ve geniş çalışma aralığı sunar`
    const sonuc = aciklamaKirp(metin)
    expect(sonuc.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(sonuc.endsWith('…')).toBe(true)
  })

  it('azami sıfır ya da negatifse boş dize verir', () => {
    expect(aciklamaKirp('Yeterince uzun bir metin', 0)).toBe('')
    expect(aciklamaKirp('Yeterince uzun bir metin', -5)).toBe('')
  })

  it('ikinci kez kırpmak değiştirmez (idempotent)', () => {
    const bir = aciklamaKirp(uzunCumle)
    expect(aciklamaKirp(bir)).toBe(bir)
  })
})

/** Çağıran `.substring(0, 160)` ile açıklama kesemez: kırpma TEK modülden gelir. */
describe('INV-ACIKLAMA-KIRP-1 · kaynak taraması', () => {
  const kok = join(__dirname, '..', '..', '..', 'app', '_components')
  const dosyalar = readdirSync(kok).filter((f) => /^(aile|kategori|marka)Sayfasi\.tsx$/.test(f))

  it('aile/kategori/marka sayfa modülleri bulundu', () => {
    expect(dosyalar.sort()).toEqual(['aileSayfasi.tsx', 'kategoriSayfasi.tsx', 'markaSayfasi.tsx'])
  })

  for (const dosya of ['aileSayfasi.tsx', 'kategoriSayfasi.tsx', 'markaSayfasi.tsx']) {
    it(`${dosya}: açıklama .substring/.slice(0, 1xx) ile kesilmiyor`, () => {
      const yol = join(kok, dosya)
      expect(statSync(yol).isFile()).toBe(true)
      const kaynak = readFileSync(yol, 'utf8')
      expect(kaynak).not.toMatch(/\.(substring|slice)\(\s*0\s*,\s*1[0-9]{2}\s*\)/)
    })
  }
})
