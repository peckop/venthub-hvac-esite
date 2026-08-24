/**
 * INV-DUCTFAN-SELECT-1 — kanal fanı seçim motorunun sözleşmesi.
 *
 * BU TESTİN ASIL İDDİASI:
 * Seçim, katalogdaki "maks. debi"ye DEĞİL, fanın kullanıcının tesisatındaki gerçek
 * çalışma noktasına dayanmalı. Katalog debisi serbest üflemede (0 Pa) ölçülür; direnç
 * varken fan o debiyi asla vermez. Bu ayrım kaybolursa motor yetersiz fanı "yeterli"
 * gösterir ve hiçbir tip hatası, hiçbir kırmızı test bunu göstermez — çünkü sonuç
 * hâlâ makul bir sayıdır. O yüzden aşağıda çalışma noktası ELLE doğrulanmış gerçek
 * bir ürün eğrisiyle sınanır.
 *
 * Fikstür kaynağı: canlı DB, `VRT-17162` (Vortice Lineo 150 Quiet),
 * `technical_specs.pq_curve` = "[[0, 210.9], [255, 105.5], [510, 0]]" (2026-08-23 ölçümü).
 */
import { describe, expect, it } from 'vitest'

import {
  calismaNoktasi,
  degerlendir,
  type FanAdayi,
  hesaplaTasarimDebisi,
  parsePQCurve,
  type SecimGirdisi,
  secimYap,
} from '../ductFanSelection'

/** Gerçek ürün: Lineo 150 Quiet. Katalog serbest debisi 510 m³/h. */
const LINEO_150_EGRI_HAM = '[[0, 210.9], [255, 105.5], [510, 0]]'

function aday(ustuneYaz: Partial<FanAdayi> = {}): FanAdayi {
  return {
    id: 'p-150',
    sku: 'VRT-17162',
    ad: 'Vortice Lineo 150 Quiet',
    slug: 'vortice-lineo-150-quiet',
    pqCurveHam: LINEO_150_EGRI_HAM,
    maksDebiM3h: 510,
    sesDbA: 30.7,
    gucW: 46,
    capMm: 150,
    ...ustuneYaz,
  }
}

const TEMEL_GIRDI: SecimGirdisi = {
  mahal: 'bathroom',
  alanM2: 10,
  tavanYuksekligiM: 2.5,
  guzergah: 'medium',
  sessizlik: 'normal',
  kanalCapiMm: null,
  malzeme: 'galvanized',
}

describe('parsePQCurve — canlıdaki veri şeklini tanır', () => {
  it('JSONB string olarak gelen eğriyi çözer (canlıdaki gerçek şekil)', () => {
    const noktalar = parsePQCurve(LINEO_150_EGRI_HAM)
    expect(noktalar).toHaveLength(3)
    expect(noktalar[0]).toEqual({ debiM3h: 0, basincPa: 210.9 })
    expect(noktalar[2]).toEqual({ debiM3h: 510, basincPa: 0 })
  })

  it('dizi olarak gelirse de çözer (şekil değişirse motor kör kalmasın)', () => {
    expect(parsePQCurve([[0, 100], [200, 0]])).toHaveLength(2)
  })

  it('debiye göre SIRALAR — kaynak sırasına güvenmez', () => {
    const noktalar = parsePQCurve([[510, 0], [0, 210.9], [255, 105.5]])
    expect(noktalar.map((n) => n.debiM3h)).toEqual([0, 255, 510])
  })

  it('bozuk girdide UYDURMAZ, boş döner', () => {
    expect(parsePQCurve('bu json degil')).toEqual([])
    expect(parsePQCurve(null)).toEqual([])
    expect(parsePQCurve([['a', 'b']])).toEqual([])
    expect(parsePQCurve([[1]])).toEqual([])
  })
})

describe('hesaplaTasarimDebisi — kullanıcı m³/h bilmez, motor hesaplar', () => {
  it('hacim × ACH uygular ve dökümünü verir', () => {
    const h = hesaplaTasarimDebisi('bathroom', 10, 2.5)
    expect(h.hacimM3).toBe(25)
    expect(h.ach).toBe(8)
    expect(h.hamDebiM3h).toBe(200)
    expect(h.tasarimDebiM3h).toBe(200)
    expect(h.minimumUygulandi).toBe(false)
  })

  it('küçük ıslak hacimde MUTLAK ALT SINIR devreye girer', () => {
    // 2 m² banyo × 2,5 m × 8 ACH = 40 m³/h; ASHRAE 62.2 aralıklı egzoz tabanı 85 m³/h
    // (50 CFM) devreye girer ve kazanır.
    const h = hesaplaTasarimDebisi('bathroom', 2, 2.5)
    expect(h.hamDebiM3h).toBe(40)
    expect(h.tasarimDebiM3h).toBe(85)
    expect(h.minimumUygulandi).toBe(true)
  })

  it('mutfak, aynı hacimde banyodan belirgin yüksek debi ister', () => {
    const banyo = hesaplaTasarimDebisi('bathroom', 10, 2.5)
    const mutfak = hesaplaTasarimDebisi('kitchen', 10, 2.5)
    expect(mutfak.tasarimDebiM3h).toBeGreaterThan(banyo.tasarimDebiM3h)
  })
})

describe('calismaNoktasi — motorun kalbi, elle doğrulanmış', () => {
  const egri = parsePQCurve(LINEO_150_EGRI_HAM)

  it('direnç yokken fan serbest üfler (katalog debisi)', () => {
    const n = calismaNoktasi(egri, 0)
    expect(n?.debiM3h).toBe(510)
  })

  it('ELLE HESAP: 200 m³/h tasarım + 100 Pa güzergâhta çalışma noktası ≈ 219,3 m³/h', () => {
    // k = 100 / 200² = 0,0025
    // Segment (0;210,9)→(255;105,5): eğim = -0,41333, sabit = 210,9
    // 0,0025·Q² + 0,41333·Q − 210,9 = 0  →  Q ≈ 219,3 ; P = 0,0025·219,3² ≈ 120,2
    // k'yi burada SABIT veriyoruz: bu test kesisim matematigini olcer, basinc
    // modelini degil. Basinc tarafi INV-DUCTPRESSURE-1'de fluids'e karsi olculuyor.
    const k = 0.0025
    const n = calismaNoktasi(egri, k)
    expect(n).not.toBeNull()
    expect(n?.debiM3h).toBeCloseTo(219.3, 0)
    expect(n?.basincPa).toBeCloseTo(120.2, 0)
  })

  it('kesişim noktası fan eğrisinin ÜZERİNDE durur (iç tutarlılık)', () => {
    const n = calismaNoktasi(egri, 0.0025)
    // Fan eğrisinde aynı debideki basınç, sistem eğrisininkiyle eşleşmeli.
    const fanBasinci = 210.9 + ((105.5 - 210.9) / 255) * (n as { debiM3h: number }).debiM3h
    expect(n?.basincPa).toBeCloseTo(fanBasinci, 1)
  })

  it('⭐DİRENÇ ARTTIKÇA DEBİ DÜŞER ve HER ZAMAN katalog debisinin ALTINDA kalır', () => {
    // Bu, motorun var oluş sebebi: katalog 510 der, gerçek tesisat daha azını verir.
    const kisa = calismaNoktasi(egri, 0.0012)
    const orta = calismaNoktasi(egri, 0.0025)
    const uzun = calismaNoktasi(egri, 0.0045)

    expect(kisa?.debiM3h).toBeGreaterThan(orta?.debiM3h as number)
    expect(orta?.debiM3h).toBeGreaterThan(uzun?.debiM3h as number)
    for (const n of [kisa, orta, uzun]) {
      expect(n?.debiM3h).toBeLessThan(510)
    }
  })

  it('altı noktalı eğriyi de çözer (canlıda 4 üründe 6 nokta var)', () => {
    const altiNokta = parsePQCurve(
      '[[0, 300], [100, 270], [200, 220], [300, 160], [400, 90], [500, 0]]',
    )
    const n = calismaNoktasi(altiNokta, 0.0016)
    expect(n).not.toBeNull()
    expect(n?.debiM3h).toBeGreaterThan(0)
    expect(n?.debiM3h).toBeLessThan(500)
  })

  it('eğri kullanılamazsa null döner — sahte sayı üretmez', () => {
    expect(calismaNoktasi([], 0.001)).toBeNull()
    expect(calismaNoktasi([{ debiM3h: 0, basincPa: 10 }], 0.001)).toBeNull()
  })
})

describe('degerlendir — yeterlilik ve elenme', () => {
  it('yeterli fan elenmez ve karşılama oranı 1 üstünde çıkar', () => {
    const hesap = hesaplaTasarimDebisi('bathroom', 10, 2.5)
    const s = degerlendir(aday(), hesap, TEMEL_GIRDI)

    expect(s.elenmeSebebi).toBeNull()
    expect(s.karsilamaOrani).toBeGreaterThan(1)
    expect(s.puan).toBeGreaterThan(0)
  })

  it('⭐yetersiz fan ELENIR — katalog debisi büyük olsa bile', () => {
    // Katalogda 510 m³/h yazan fan, 1000 m³/h isteyen bir mutfakta yetersizdir.
    const hesap = hesaplaTasarimDebisi('kitchen', 30, 2.5) // 1125 m³/h
    const s = degerlendir(aday(), hesap, { ...TEMEL_GIRDI, mahal: 'kitchen', alanM2: 30 })

    expect(s.elenmeSebebi).toBe('debi-yetersiz')
    expect(s.puan).toBe(0)
  })

  it('kullanıcı çapı biliyorsa uymayan model elenir', () => {
    const hesap = hesaplaTasarimDebisi('bathroom', 10, 2.5)
    const s = degerlendir(aday({ capMm: 125 }), hesap, { ...TEMEL_GIRDI, kanalCapiMm: 150 })

    expect(s.elenmeSebebi).toBe('cap-uyusmuyor')
  })

  it('çap bilinmiyorsa çap filtresi UYGULANMAZ', () => {
    const hesap = hesaplaTasarimDebisi('bathroom', 10, 2.5)
    const s = degerlendir(aday({ capMm: 125 }), hesap, { ...TEMEL_GIRDI, kanalCapiMm: null })

    expect(s.elenmeSebebi).toBeNull()
  })

  it('hiç veri yoksa "veri-yok" ile elenir — tahmin uydurulmaz', () => {
    const hesap = hesaplaTasarimDebisi('bathroom', 10, 2.5)
    const s = degerlendir(
      aday({ pqCurveHam: null, maksDebiM3h: null }),
      hesap,
      TEMEL_GIRDI,
    )

    expect(s.elenmeSebebi).toBe('veri-yok')
    expect(s.calismaDebisiM3h).toBe(0)
  })

  it('gereğinden ÇOK büyük fan ceza alır — "büyük = iyi" değildir', () => {
    const hesap = hesaplaTasarimDebisi('bedroom', 12, 2.5) // 120 m³/h
    const girdi: SecimGirdisi = { ...TEMEL_GIRDI, mahal: 'bedroom', alanM2: 12, guzergah: 'short' }

    // Ölçülü model: 120 m³/h tasarımda çalışma noktası ≈ 140,8 → karşılama ≈ 1,17 (ideal bant).
    const tamOlculu = degerlendir(
      aday({ pqCurveHam: '[[0, 150], [130, 75], [260, 0]]', sesDbA: 26, gucW: 14 }),
      hesap,
      girdi,
    )
    const asiriBuyuk = degerlendir(
      aday({ pqCurveHam: '[[0, 526], [1445, 260], [2890, 0]]', sesDbA: 26, gucW: 14 }),
      hesap,
      girdi,
    )

    expect(asiriBuyuk.karsilamaOrani).toBeGreaterThan(tamOlculu.karsilamaOrani)
    expect(asiriBuyuk.puan).toBeLessThan(tamOlculu.puan)
  })
})

describe('secimYap — üç ayrı öneri, çünkü öncelik tek boyutlu değil', () => {
  // Sessiz model: 200 m³/h tasarımda çalışma noktası ≈ 217,8 → yeterli ama güç/debi oranı yüksek.
  const sessizAmaZayif = aday({
    id: 'sessiz',
    sku: 'S-1',
    pqCurveHam: '[[0, 300], [180, 150], [360, 0]]',
    sesDbA: 25,
    gucW: 40,
  })
  const gucluAmaSesli = aday({
    id: 'guclu',
    sku: 'G-1',
    pqCurveHam: '[[0, 380], [700, 190], [1400, 0]]',
    sesDbA: 45,
    gucW: 120,
  })
  const verimli = aday({
    id: 'verimli',
    sku: 'V-1',
    pqCurveHam: '[[0, 250], [260, 125], [520, 0]]',
    sesDbA: 34,
    gucW: 20,
  })

  it('yeterli olanları puana göre sıralar, yetersizleri ayırır', () => {
    const zayif = aday({ id: 'cok-zayif', sku: 'Z-1', pqCurveHam: '[[0, 40], [30, 20], [60, 0]]' })
    const sonuc = secimYap([sessizAmaZayif, gucluAmaSesli, verimli, zayif], TEMEL_GIRDI)

    expect(sonuc.uygunlar.length).toBeGreaterThan(0)
    expect(sonuc.elenenler.map((e) => e.aday.id)).toContain('cok-zayif')
    for (let i = 1; i < sonuc.uygunlar.length; i++) {
      expect(sonuc.uygunlar[i - 1].puan).toBeGreaterThanOrEqual(sonuc.uygunlar[i].puan)
    }
  })

  it('en sessiz ve en verimli, YETERLİ olanlar arasından seçilir', () => {
    const sonuc = secimYap([sessizAmaZayif, gucluAmaSesli, verimli], TEMEL_GIRDI)

    expect(sonuc.enSessiz?.aday.id).toBe('sessiz')
    expect(sonuc.enVerimli?.aday.id).toBe('verimli')
    // Elenen bir aday asla öneri olarak dönmemeli.
    for (const oneri of [sonuc.enUygun, sonuc.enSessiz, sonuc.enVerimli]) {
      if (oneri) expect(oneri.elenmeSebebi).toBeNull()
    }
  })

  it('sessizlik KRİTİK seçilince sıralama sessiz modele kayar', () => {
    const normal = secimYap([sessizAmaZayif, gucluAmaSesli, verimli], {
      ...TEMEL_GIRDI,
      sessizlik: 'normal',
    })
    const kritik = secimYap([sessizAmaZayif, gucluAmaSesli, verimli], {
      ...TEMEL_GIRDI,
      sessizlik: 'critical',
    })

    const sesliPuanNormal = normal.uygunlar.find((s) => s.aday.id === 'guclu')?.puan ?? 0
    const sesliPuanKritik = kritik.uygunlar.find((s) => s.aday.id === 'guclu')?.puan ?? 0
    expect(sesliPuanKritik).toBeLessThan(sesliPuanNormal)
  })

  it('hiç aday yoksa çökmez, boş sonuç döner', () => {
    const sonuc = secimYap([], TEMEL_GIRDI)
    expect(sonuc.enUygun).toBeNull()
    expect(sonuc.uygunlar).toEqual([])
    expect(sonuc.hesap.tasarimDebiM3h).toBeGreaterThan(0)
  })

  it('kullanıcıya gösterilecek hesap dökümü sonuçta TAŞINIR', () => {
    // Arayüz "odanız 25 m³, 8 kez hava değişimi için 200 m³/h gerekiyor" diyebilmeli.
    const sonuc = secimYap([verimli], TEMEL_GIRDI)
    expect(sonuc.hesap.hacimM3).toBe(25)
    expect(sonuc.hesap.ach).toBe(8)
    expect(sonuc.hesap.tasarimDebiM3h).toBe(200)
    // Sistem basıncı artık SABİT DEĞİL, Colebrook + K katsayılarıyla hesaplanıyor.
    // 200 m³/h · 150 mm · 6 m galvaniz · 2×90°+1×45° + terminaller → onlarca Pa mertebesi.
    expect(sonuc.sistemBasinciPa).toBeGreaterThan(20)
    expect(sonuc.sistemBasinciPa).toBeLessThan(120)
  })
})
