/**
 * INV-FOY-PARITE-1 — MÜŞTERİYE GİDEN FÖY, VİTRİNLE AYNI BİÇİMLENDİRİCİDEN GEÇER (REC-158 Faz 1).
 *
 * ⭐NİÇİN VAR — ölçülmüş vaka, 2026-09-06:
 * Föy `technical_specs`'i zaten okuyordu ama değeri **ham** basıyordu (`String(value)`);
 * vitrin ise `formatSpecValue`'dan geçiriyordu. O fonksiyon **birim ekler** (°C, dB(A), RPM, W).
 * Sonuç: aynı ürünün aynı alanı vitrinde `45 dB(A)`, **müşteriye giden föyde** `45`.
 * Bu, bu depoda ölçülmüş bir hata sınıfıdır — *"aynı ölçüt, iki uygulama"* — ve bu kez
 * teklif ekine giden bir BELGEDEYDİ.
 *
 * ⭐NİÇİN ÖLÇÜT "AYNI ÇIKTI", "AYNI IMPORT" DEĞİL:
 * `pdfGenerator`'ın `productHelpers`'ı *import ettiğini* denetlemek, ikinci bir biçimlendirme
 * yolunun (kopyalanmış bir `switch`, elle yazılmış bir birim tablosu) eklenmesini GÖREMEZ.
 * Bu yüzden kol, aynı fikstürü **iki yüzeye** verir ve **çıkan listeleri** karşılaştırır.
 *
 * ⚠KABUL EDİLEN SINIR — SESSİZ DEĞİL (§21): etiket paritesi `t` (i18n sözlüğü) ister ve `t`'yi
 * geçirecek satır `ProductDetailPageView`'da, yani **URUN şeridinin claim'inde**. Bu PR `t`
 * yolunu KURAR ve ölçer; `t` geçilmediğindeki ayrışma da ayrıca ölçülür ki boşluk kaybolmasın.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import { buildSpecGroupLabels,buildSpecRows } from '../../lib/pdfGenerator'
import { formatSpecValue, groupTechnicalSpecs, SPEC_SORT_ORDER } from '../../utils/productHelpers'
import { specFieldLabel, specGroupLabel } from '../../utils/specLabel'

/**
 * ÜÇ ALTIN ÜRÜN — ⭐değerler CANLI ŞEMADAN ölçüldü (2026-09-06), uydurulmadı.
 * `VRT-17160` (Vortice Lineo 100 Quiet) · `VRT-17143` (Lineo 100 Q) · `SEA-51203001` (SEAT 20).
 *
 * ⚠NİÇİN GERÇEK ANAHTARLAR: §25 — *"fikstür, biçimin sahada kullanılan varyantını üretmiyorsa
 * kol BOŞ KOŞAR."* İlk yazımda anahtarları tahmin etmiştim (`airflow_speed_max_ms`,
 * `atex_marking`…); canlı ölçüm bunların bu üründe HİÇ olmadığını gösterdi. Uydurma fikstür
 * yeşil yanar ve sahadaki hiçbir şeyi ölçmez.
 *
 * ⚠Fikstür ÜRETİLİR, DB'den OKUNMAZ: DB'ye bağlanan bir kol, DB'siz CI'da sessizce yeşil olur.
 */
const URUN_17160: Record<string, unknown> = {
  phase: 1, rpm_max: 2260, has_timer: false, ip_rating: 'IP44',
  size_a_mm: 210, size_b_mm: 294.5, size_c_mm: 639, voltage_v: 230,
  weight_kg: 3.8, motor_type: 'AC', diameter_mm: 100, motor_poles: 2,
  frequency_hz: 50, erp_compliant: true, has_humidistat: false,
  max_delivery_ls: 72.22, insulation_class: 'Class II', max_delivery_m3h: 260,
  noise_level_db_a: 26.1, absorbed_current_a: 0.13, max_absorbed_power_w: 27,
  max_static_pressure_pa: 147.1,
}
const URUN_17143: Record<string, unknown> = {
  phase: 1, rpm_max: 2450, ip_rating: 'IP44',
  size_a_mm: 156, size_b_mm: 174, size_c_mm: 231, voltage_v: 230,
  weight_kg: 1.25, motor_type: 'AC', diameter_mm: 100, motor_poles: 2,
  frequency_hz: 50, erp_compliant: true, max_delivery_ls: 55.56,
  insulation_class: 'Class II', max_delivery_m3h: 200, noise_level_db_a: 37.9,
  absorbed_current_a: 0.07, max_absorbed_power_w: 15, max_static_pressure_pa: 73.6,
}
const URUN_SEAT: Record<string, unknown> = {
  phase: 3, rpm_max: 2870, voltage_v: 400, weight_kg: 15.9,
  diameter_mm: 160, noise_lpa_3m_db: 70, max_absorbed_power_w: 1100,
  nominal_delivery_m3h: 1500, nominal_static_pressure_pa: 735,
  // ⬇Bu ikisi CANLI VERİDE YOK; boş-değer elemesini ölçmek için BİLEREK eklendi.
  bos_alan: '', yok_alan: null,
}
const ALTIN = { '17160': URUN_17160, '17143': URUN_17143, SEAT: URUN_SEAT }

/** Sahte sözlük: `pdp.specs.*` çözer, gerisini ÇÖZEMEZ (gerçek `t` gibi davranır). */
const SOZLUK: Record<string, string> = {
  'pdp.specs.max_delivery_m3h': 'Maks. Debi',
  'pdp.specs.noise_level_db_a': 'Ses Seviyesi',
  'pdp.specs.ip_rating': 'Koruma Sınıfı (IP)',
  'pdp.specs.max_absorbed_power_w': 'Maks. Çekilen Güç',
  'pdp.specGroups.performance': 'Performans',
  'pdp.specGroups.electrical': 'Elektrik',
  'pdp.specValues.yes': 'Var',
  'pdp.specValues.no': 'Yok',
}
const t = (key: string, alt?: Record<string, unknown> | string): string => {
  if (SOZLUK[key]) return SOZLUK[key]
  return typeof alt === 'string' ? alt : key
}

/** VİTRİNİN yolu — föyden BAĞIMSIZ olarak, vitrinin kullandığı fonksiyonlarla kurulur. */
function vitrinSatirlari(specs: Record<string, unknown>): string[][] {
  const gruplar = groupTechnicalSpecs(specs) || {}
  const satirlar: string[][] = []
  for (const [, group] of Object.entries(gruplar)) {
    const alanlar = Object.entries(group.specs || {})
    alanlar.sort(([a], [b]) => (SPEC_SORT_ORDER[a] ?? 99) - (SPEC_SORT_ORDER[b] ?? 99))
    for (const [key, value] of alanlar) {
      satirlar.push([specFieldLabel(key, t), formatSpecValue(key, value, t)])
    }
  }
  return satirlar
}

describe('INV-FOY-PARITE-1 · föy ile vitrin AYNI çıktıyı üretir', () => {
  it('⭐TAM PARİTE: `t` verildiğinde üç altın üründe de etiket+değer+sıra BİREBİR aynı', () => {
    for (const [ad, specs] of Object.entries(ALTIN)) {
      const foy = buildSpecRows(specs, { t })
      const vitrin = vitrinSatirlari(specs)
      expect(
        foy,
        `${ad}: föy ile vitrin AYRIŞIYOR — müşteriye giden belge vitrinle çelişir`,
      ).toEqual(vitrin)
      expect(foy.length, `${ad}: föy hiç satır üretmedi`).toBeGreaterThan(0)
    }
  })

  it('⭐AYIRT EDİCİ: birim eklemesi GERÇEKTEN uygulanıyor (eski ham çıktı kabul edilmez)', () => {
    const foy = buildSpecRows(URUN_17160, { t })
    const ses = foy.find(([label]) => label === 'Ses Seviyesi')
    expect(ses, 'ses seviyesi satırı üretilmemiş').toBeDefined()
    expect(
      ses?.[1],
      'değer HAM basılmış — eski String(value) davranışı geri gelmiş (müşteri föyünde birim kaybı)',
    ).toBe('26.1 dB(A)')
    // Ters yön: metin değerler bozulmamalı (birim eklenmemeli).
    const ip = foy.find(([label]) => label === 'Koruma Sınıfı (IP)')
    expect(ip?.[1], 'metin değere birim eklenmiş — formatSpecValue sözleşmesi bozulmuş').toBe('IP44')
  })

  it('⭐SIRA da paritenin parçası: aynı fikstürde satır SIRASI birebir eşleşir', () => {
    const foy = buildSpecRows(URUN_17143, { t }).map(([l]) => l)
    const vitrin = vitrinSatirlari(URUN_17143).map(([l]) => l)
    expect(foy, 'sıra ayrışıyor — aynı belge iki yüzeyde farklı okunur').toEqual(vitrin)
  })

  it('⚠KABUL EDİLEN SINIR ÖLÇÜLÜR: `t` YOKSA etiket ayrışır ve bu SESSİZ kalmaz', () => {
    const tsiz = buildSpecRows(URUN_17160, { translateKey: (k) => k })
    const tli = buildSpecRows(URUN_17160, { t })
    // Değer tarafı `t` GEREKTİRMEZ → `t`'siz hâlde de birimli olmalı.
    expect(
      tsiz.map(([, v]) => v),
      'değer paritesi `t`ye bağlanmış — oysa formatSpecValue sözlük istemez',
    ).toEqual(tli.map(([, v]) => v))
    // Etiket tarafı ayrışır — ve bu ayrışma BEKLENEN, çünkü `t`yi geçirecek satır URUN'da.
    expect(
      tsiz.map(([l]) => l),
      '`t` verilmediği hâlde etiketler vitrinle aynı çıktı — sınır ölçülemez hâle gelmiş',
    ).not.toEqual(tli.map(([l]) => l))
  })

  it('boş/null alanlar ELENİR (vitrin de eliyor) — föyde "-" satırı üretilmez', () => {
    const foy = buildSpecRows(URUN_SEAT, { t })
    const etiketler = foy.map(([l]) => l)
    expect(etiketler.some((l) => /bos_alan|yok_alan/.test(l)), 'boş alan föye girdi').toBe(false)
    expect(foy.every(([, v]) => v !== '-'), 'föyde boş değer satırı var').toBe(true)
  })

  /**
   * ⚠MANDAL — BENİM DÜZELTMEDİĞİM, AMA FÖYE YAYILAN BİR KUSUR (2026-09-06, URUN-KATALOG uyarısı).
   *
   * `formatSpecValue` metin değerleri `/[a-zA-Z]/` ile ayırıyor — **ASCII** harf arıyor.
   * Değer zaten birim taşıyorsa ama o birim ASCII harf İÇERMİYORSA (`25°`, `25º`), erken çıkış
   * TETİKLENMEZ ve birim **bir kez daha** eklenir → `25° °C`.
   *
   * ⭐İki ayrı karakter var ve gözle aynı görünüyorlar: `°` U+00B0 (derece) ile `º` U+00BA
   * (masculine ordinal). Kaynak PDF'lerde ikincisi de geçiyor (URUN-KATALOG ölçtü, kendi
   * kapısında yanlış kırmızı üretmiş).
   *
   * ⛔BU KOL DÜZELTMİYOR, SABİTLİYOR: `formatSpecValue` URUN şeridinin claim'inde, benim
   * düzeltme yetkim yok. Ama föy artık o fonksiyonu kullandığı için kusur **müşteri belgesine
   * de yayıldı** ve sessiz kalamaz (§21). Davranış düzeltilirse bu kol DÜŞER — düşmesi
   * "bozuldu" değil "borç ödendi" demektir; o zaman kol güncellenir.
   */
  it('⚠MANDAL: birim taşıyan ASCII-dışı değerde ÇİFT BİRİM üretiliyor — bugünkü davranış SABİTLENDİ', () => {
    const ciftBirim = buildSpecRows({ max_ambient_temp_c: '25°' }, { t })
    expect(
      ciftBirim[0]?.[1],
      'davranış DEĞİŞMİŞ — formatSpecValue artık ASCII-dışı birimi tanıyorsa bu kol güncellenmeli (borç ödendi)',
    ).toBe('25° °C')
    // Aynı tuzağın ikizi: gözle ayırt edilemeyen U+00BA.
    const ordinal = buildSpecRows({ max_ambient_temp_c: '25º' }, { t })
    expect(ordinal[0]?.[1], 'U+00BA U+00B0dan farklı işlenmiş — iki karakter ayrı davranıyor').toBe('25º °C')
    // ⭐PARİTE YİNE BOZULMUYOR: vitrin de aynı fonksiyonu kullandığı için iki yüzey EŞİT kalır.
    expect(
      ciftBirim,
      'kusur föy ile vitrini AYRIŞTIRIYOR — o zaman bu artık mandal değil, parite ihlalidir',
    ).toEqual(vitrinSatirlari({ max_ambient_temp_c: '25°' }))
  })

  /**
   * INV-FOY-NESNE-1 (URN-72, 2026-10-09). Müşterinin elindeki bir föyde ölçüler satırında "[object Object]"
   * görüldü (Katalog, 7 Haziran tarihli PDF). `formatSpecValue` `String(value)` kullandığı için nesne/dizi
   * değer ham makine metniyle basılıyordu. Canlı veritabanında bugün böyle değer yok (0 ürün); kapı, ilk
   * gelen değerin müşteri belgesine sızmasını ve föy ile vitrinin AYRIŞMASINI önler.
   */
  it('INV-FOY-NESNE-1: nesne ve dizi değer "[object Object]" basmaz; föy ile vitrin aynı metni üretir', () => {
    const girdi = { dimensions: { length: 120, width: 80 }, certificates: ['CE', 'ISO 9001'], bos_nesne: {}, bos_dizi: [] }
    const foy = buildSpecRows(girdi, { t })
    const metin = foy.map((s) => s.join(' = ')).join('\n')
    expect(metin, 'nesne/dizi değer ham makine metniyle basılıyor').not.toContain('[object')
    expect(foy, 'föy ile vitrin ayrışmış').toEqual(vitrinSatirlari(girdi))
    expect(formatSpecValue('dimensions', { length: 120, width: 80 }, t)).toBe('length: 120, width: 80')
    expect(formatSpecValue('certificates', ['CE', 'ISO 9001'], t)).toBe('CE, ISO 9001')
    expect(formatSpecValue('x', { ic: { daha_ic: { cok_ic: 1 } } }, t), 'derinlik sınırı').toBe('-')
    expect(formatSpecValue('x', {}, t)).toBe('-')
    expect(formatSpecValue('weight_kg', 10, t), 'tekil değerde birim eki korunur').toBe('10 kg')
  })

  /**
   * INV-SPEC-HAM-DEGER-1 (URN-58, karar 298). Canlıda Lineo Quiet ailesinin teknik tablosunda "Zamanlayıcı false",
   * "ErP Uyumlu true", "Higrostat false" görünüyordu (formatSpecValue `String(value)` basıyordu, gövde çift olduğu
   * için her biri iki kez); ses satırı da hangi koşulda ölçüldüğünü söylemeden "26.1 dB(A)" diyordu. Bu kol GERÇEK
   * sözlüklerle koşar (sahte `t` "Var/Yok" metninin sözlükte olduğunu ölçemez) ve föy ile vitrinin AYNI metni verdiğini
   * iki dilde de kanıtlar. Veri fikstürü canlı şemadan (VRT-17160) gelir: has_timer false, erp_compliant true,
   * has_humidistat false, noise_level_db_a 26.1.
   */
  describe('INV-SPEC-HAM-DEGER-1 · mantıksal değer ve ses etiketi (gerçek sözlükler)', () => {
    const SOZLUKLER = { tr, en } as const
    const gercekT = (lang: 'tr' | 'en') => (key: string, alt?: Record<string, unknown> | string): string => {
      const v = getDictValue(SOZLUKLER[lang], key)
      return v === key && typeof alt === 'string' ? alt : v
    }
    const vitrinGercek = (specs: Record<string, unknown>, lang: 'tr' | 'en'): string[][] => {
      const tl = gercekT(lang)
      const satirlar: string[][] = []
      for (const [, group] of Object.entries(groupTechnicalSpecs(specs) || {})) {
        const alanlar = Object.entries(group.specs || {})
        alanlar.sort(([a], [b]) => (SPEC_SORT_ORDER[a] ?? 99) - (SPEC_SORT_ORDER[b] ?? 99))
        for (const [key, value] of alanlar) satirlar.push([specFieldLabel(key, tl), formatSpecValue(key, value, tl)])
      }
      return satirlar
    }
    const deger = (satirlar: string[][], etiket: string): string | undefined => satirlar.find(([l]) => l === etiket)?.[1]

    const DILLER: Array<'tr' | 'en'> = ['tr', 'en']
    it.each(DILLER)('(%s) föy ile vitrin AYNI satırları üretir ve hiçbir hücre ham true/false değildir', (lang) => {
      for (const [ad, specs] of Object.entries(ALTIN)) {
        const foy = buildSpecRows(specs, { t: gercekT(lang), lang })
        expect(foy, `${ad}/${lang}: föy ile vitrin ayrışıyor`).toEqual(vitrinGercek(specs, lang))
        const ham = foy.filter(([, v]) => /^(true|false)$/.test(v))
        expect(ham, `${ad}/${lang}: ham makine değeri müşteriye gidiyor`).toEqual([])
      }
    })

    const LINEO_BOOLEAN: Array<['tr' | 'en', string, string]> = [
      ['tr', 'Zamanlayıcı', 'Yok'], ['tr', 'ErP Uyumlu', 'Var'], ['tr', 'Higrostat', 'Yok'],
      ['en', 'Timer', 'No'], ['en', 'ErP Compliant', 'Yes'], ['en', 'Humidistat', 'No'],
    ]
    it.each(LINEO_BOOLEAN)('(%s) Lineo 100 Quiet: "%s" satırı "%s" basar', (lang, etiket, beklenen) => {
      const foy = buildSpecRows(URUN_17160, { t: gercekT(lang), lang })
      expect(deger(foy, etiket), `${lang}/${etiket} satırı yok ya da yanlış`).toBe(beklenen)
      expect(deger(vitrinGercek(URUN_17160, lang), etiket), `${lang}/${etiket}: vitrin ayrışıyor`).toBe(beklenen)
    })

    it('ses satırı koşulsuz "Ses Seviyesi" demez: etiket "üretici beyanı" der, değer birimli kalır, MESAFE UYDURULMAZ', () => {
      const beklenen: Record<'tr' | 'en', string> = {
        tr: 'Ses seviyesi (üretici beyanı)',
        en: 'Sound level (manufacturer\'s declaration)',
      }
      for (const lang of DILLER) {
        const foy = buildSpecRows(URUN_17160, { t: gercekT(lang), lang })
        expect(deger(foy, beklenen[lang]), `${lang}: ses satırı beyan etiketiyle yok`).toBe('26.1 dB(A)')
        expect(
          foy.map(([l]) => l).filter((l) => /^(Ses Seviyesi|Noise Level)$/.test(l)),
          `${lang}: koşulsuz eski ses etiketi geri gelmiş`,
        ).toEqual([])
        // Mesafe/ölçüm koşulu üretici föyünden doğrulanmadan etikete yazılmaz: "(1 m)", "2 m", "3 metre" yok.
        expect(beklenen[lang], `${lang}: etikete doğrulanmamış mesafe yazılmış`).not.toMatch(/\d\s*(m\b|metre|meter|ft)/i)
      }
    })

    it('mesafeyi adında taşıyan kardeş alan (SEAT noise_lpa_3m_db) "(3 m)" etiketini KORUR — iki eksen birleştirilmez', () => {
      const foyTr = buildSpecRows(URUN_SEAT, { t: gercekT('tr'), lang: 'tr' })
      expect(deger(foyTr, 'Ses Basıncı (3 m)')).toBe('70 dB')
      const foyEn = buildSpecRows(URUN_SEAT, { t: gercekT('en'), lang: 'en' })
      expect(deger(foyEn, 'Sound Pressure (3 m)')).toBe('70 dB')
    })

    it('`t` verilmeyen föy çağrısı da ham true/false BASMAZ: sözlük `lang` ile okunur (lang yoksa föyün varsayılanı TR)', () => {
      const enSatirlar = buildSpecRows(URUN_17160, { translateKey: (k) => k, lang: 'en' })
      expect(enSatirlar.map(([, v]) => v), 'lang=en: değerler İngilizce olmalı').toEqual(expect.arrayContaining(['Yes', 'No']))
      const varsayilan = buildSpecRows(URUN_17160, { translateKey: (k) => k })
      expect(varsayilan.map(([, v]) => v)).toEqual(expect.arrayContaining(['Var', 'Yok']))
      for (const s of [...enSatirlar, ...varsayilan]) expect(s[1], `${s[0]}: ham makine değeri`).not.toMatch(/^(true|false)$/)
    })
  })

  /**
   * INV-FOY-ADRES-1 (URN-72). Föy TARAYICIDA üretilir; `SITE_URL` `process.env` okur ve tarayıcıda env
   * boştur → `http://localhost:3000`. Canlı pakette ölçüldü: indirilen her föyün alt bilgisi "localhost:3000"
   * basıyordu. Davranış testi `pdfGeneratorFallback.test.ts`'te; bu kol KAYNAĞI bekler ki aynı yola geri
   * dönülürse davranış testinin fikstürü atlatsa bile kırmızı olsun.
   */
  it('INV-FOY-ADRES-1: föy üreticisi SITE_URL kullanmaz (tarayıcıda localhost:3000 basar)', () => {
    const kaynak = readFileSync(join(process.cwd(), 'src', 'lib', 'pdfGenerator.ts'), 'utf8')
    expect(kaynak, 'pdfGenerator.ts SITE_URL kullanıyor; tarayıcıdaki alan adı için getPdfSiteHost() kullanılmalı').not.toMatch(
      /\bSITE_URL\b/,
    )
  })

  it('grup başlıkları da tek kaynaktan gelir (Faz 2 hazırlığı, bugünden ölçülür)', () => {
    const foyGruplar = buildSpecGroupLabels(URUN_17160, t)
    const gruplar = groupTechnicalSpecs(URUN_17160) || {}
    const vitrinGruplar = Object.entries(gruplar).map(([k, g]) => specGroupLabel(k, t, g.label))
    expect(foyGruplar, 'grup başlığı ayrı bir yoldan üretiliyor').toEqual(vitrinGruplar)
    expect(foyGruplar).toContain('Performans')
  })
})
