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
import { describe, expect, it } from 'vitest'

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
      satirlar.push([specFieldLabel(key, t), formatSpecValue(key, value)])
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

  it('grup başlıkları da tek kaynaktan gelir (Faz 2 hazırlığı, bugünden ölçülür)', () => {
    const foyGruplar = buildSpecGroupLabels(URUN_17160, t)
    const gruplar = groupTechnicalSpecs(URUN_17160) || {}
    const vitrinGruplar = Object.entries(gruplar).map(([k, g]) => specGroupLabel(k, t, g.label))
    expect(foyGruplar, 'grup başlığı ayrı bir yoldan üretiliyor').toEqual(vitrinGruplar)
    expect(foyGruplar).toContain('Performans')
  })
})
