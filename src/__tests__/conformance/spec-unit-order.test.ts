import { describe, expect, it } from 'vitest'

import { formatSpecValue } from '../../utils/productHelpers'

/**
 * INV-SPEC-UNIT-1 — birim kuralları ALTIN DEĞERLE kilitlenir.
 *
 * NİÇİN DOĞDU (2026-08-22 ölçümü): `formatSpecValue` sıralı bir `if` zinciriydi ve
 * `endsWith('_a')` kontrolü `includes('db_a')` kontrolünden ÖNCE geliyordu.
 * `noise_level_db_a` anahtarının son iki karakteri `_a` olduğu için ilk kurala takılıyor,
 * dB(A) satırına HİÇ ULAŞMIYORDU → **142 üründe ses seviyesi "58 A" (amper) basıldı.**
 *
 * Kural KODDA VARDI. Erişilemezdi. Bu yüzden bu kapı kuralın VARLIĞINI değil ÇIKTISINI
 * ölçer — varlık testi bu hatayı yakalayamazdı, çünkü satır gerçekten oradaydı.
 */

/** [anahtar, ham değer, beklenen çıktı, niçin] */
const ALTIN: ReadonlyArray<readonly [string, unknown, string, string]> = [
  // ── GÖLGELENME: bunlar yanlıştı, artık doğru ────────────────────────────────
  ['noise_level_db_a', 58, '58 dB(A)', '142 üründe "58 A" (amper) basıyordu — _a, db_a\'yı gölgeliyordu'],
  ['max_static_pressure_pa', 300, '300 Pa', '160 üründe birimsizdi — _pa, endsWith(_a) ile eşleşmez'],
  ['nominal_static_pressure_pa', 188, '188 Pa', '78 üründe birimsizdi'],
  ['min_static_pressure_pa', 50, '50 Pa', '15 üründe birimsizdi'],
  ['max_delivery_ls', 180, '180 l/s', '180 üründe birimsizdi'],
  ['noise_lpa_3m_db', 66, '66 dB', '66 üründe birimsizdi'],
  ['thermal_efficiency_pct', 87, '87 %', '13 üründe birimsizdi'],
  ['heating_capacity_kw', 4, '4 kW', '_kw, _w tarafından gölgeleniyordu'],
  ['tank_capacity_l', 3, '3 L', 'birimsizdi'],
  ['humidity_removed_l_24h', 12, '12 L/24h', 'son-ek kuralına uymayan tekil anahtar'],

  // ── REGRESYON KORUMASI: bunlar zaten doğruydu, öyle KALMALI ─────────────────
  ['weight_kg', 10, '10 kg', 'zaten doğruydu'],
  ['voltage_v', 220, '220 V', 'zaten doğruydu'],
  ['frequency_hz', 50, '50 Hz', 'zaten doğruydu'],
  ['max_ambient_temp_c', 40, '40 °C', 'zaten doğruydu'],
  ['airflow_speed_max_ms', 5, '5 m / s', 'mevcut biçim KORUNDU (kapsam dışı değişiklik yapılmadı)'],
  ['absorbed_current_a', 2.5, '2.5 A', 'gerçek amper — _a kuralı hâlâ çalışmalı'],
  ['max_delivery_m3h', 648, '648 m³/h', 'zaten doğruydu'],
  ['max_absorbed_power_w', 180, '180 W', 'zaten doğruydu'],
  ['size_a_mm', 500, '500 mm', 'zaten doğruydu'],
  ['rpm_max', 2800, '2800 RPM', 'içerik kuralı, tablodan sonra'],
  ['sound_pressure_level_lp_db_a_2m_max', 50, '50 dB(A)', 'ölçüt ORTADA — içerik kuralı korunmalı'],

  // ── BİRİMİ OLMAYANLAR: sayıya birim UYDURULMAMALI ──────────────────────────
  ['motor_poles', 4, '4', 'kutup sayısı birimsizdir'],
  ['number_of_blades', 5, '5', 'adet birimsizdir'],
  ['number_of_speeds', 2, '2', 'adet birimsizdir'],
  ['custom_spec', 42, '42', 'bilinmeyen anahtara birim uydurulmaz'],
]

describe('INV-SPEC-UNIT-1 · birim kuralları erişilebilir ve doğru', () => {
  it('altın değerler: her anahtar BEKLENEN birimle basılır', () => {
    // KAPSAM KANARYASI: tablo boşalırsa döngü hiçbir şey doğrulamaz ve kapı sessizce yeşil kalır.
    expect(ALTIN.length, 'altın değer tablosu boşalmış').toBeGreaterThanOrEqual(20)

    const hatalar: string[] = []
    for (const [key, deger, beklenen, nicin] of ALTIN) {
      const cikti = formatSpecValue(key, deger)
      if (cikti !== beklenen) hatalar.push(`${key}: '${cikti}' != '${beklenen}'  (${nicin})`)
    }
    expect(
      hatalar,
      'Birim kuralı beklenen çıktıyı vermedi. En olası sebep SIRA: daha genel bir son-ek ' +
        '(_a, _w, _v) daha özel olanı (_db_a, _kw, _pa) gölgeliyor. Son-ek tablosu uzunluğa ' +
        'göre sıralanır; elle sıra vermeyin.',
    ).toEqual([])
  })

  it('HARF içeren değere birim eklenmez (değeri bozar), ama sayı-benzeri değere eklenir', () => {
    // Koruma HARF varlığına bakar, biçime değil. Bu ayrımı testi yazarken YANLIŞ
    // varsaymıştım: '230/400' harf içermediği için birim ALIR — ve bu DOĞRU davranış,
    // çift gerilimli bir motorun etiketi "230/400 V" diye okunur.
    expect(formatSpecValue('voltage_v', '230/400')).toBe('230/400 V')
    expect(formatSpecValue('insulation_class', 'Class F')).toBe('Class F')
    expect(formatSpecValue('motor_type', 'EC')).toBe('EC')
    expect(formatSpecValue('atex_marking', 'II 2G/D h T3')).toBe('II 2G/D h T3')
  })

  it('boş değer tire döner', () => {
    expect(formatSpecValue('weight_kg', null)).toBe('-')
    expect(formatSpecValue('weight_kg', undefined)).toBe('-')
  })
})
