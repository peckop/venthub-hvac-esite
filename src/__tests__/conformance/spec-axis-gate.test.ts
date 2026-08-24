/**
 * INV-SPEC-AXIS-1 — spec ekseni cetvelinin K1 kuralını UYGULAYAN kapının kapsam kanaryası.
 *
 * Cetvel: docs/standards/spec-axis-standard.md §K1 — "adı birim eki taşıyan alanın değeri
 * çıplak sayı olmalıdır". Kapı: scripts/db/checks/catalog-integrity.mjs içindeki `spec-type`
 * kuralı, anahtar adını bir sonek listesine karşı eler.
 *
 * NİÇİN BÖYLE BİR SINAV: kuralın VARLIĞI kapsamını kanıtlamaz. `spec-type` beş ay boyunca
 * vardı ve dokuz sonek tanıyordu; `_c`, `_l`, `_ms`, `_hz`, `_db`, `_kw`, `_24h` ile biten
 * alanlar kapının HİÇ bakmadığı yerdeydi. Kod okununca "birim kapısı var" görünüyordu.
 * (memory: rule-written-but-unreachable · substring-assert-is-not-a-gate)
 *
 * Sonek listesi betikten OKUNUR, buraya kopyalanmaz — kopya, betik daralınca sessizce
 * yeşil kalırdı. Kanarya iki yönlüdür: birim eki taşıyan ad YAKALANMALI, taşımayan ad
 * yakalanMAMALI. Tek yönlü kanarya, listeyi ".*" yaparak da geçilir.
 * (memory: invisible-char-makes-regex-silently-blind — desen kanaryası)
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const SCRIPT = path.join(process.cwd(), 'scripts', 'db', 'checks', 'catalog-integrity.mjs')

/** Betikteki `spec-type` kuralının sonek desenini kaynaktan söker. */
function sonekDeseni(): RegExp {
  const kaynak = fs.readFileSync(SCRIPT, 'utf8')
  const m = kaynak.match(/k\.key\s*~\s*'(_\([a-z0-9|]+\)\$)'/)
  if (!m) throw new Error('spec-type sonek deseni catalog-integrity.mjs icinde BULUNAMADI — kapi tasinmis olabilir')
  return new RegExp(m[1])
}

/**
 * Canlı DB'de (2026-08-23, 374 aktif ürün) ölçülmüş anahtar adları.
 * `yakalanmali: true`  → adı bir SI birimi ile biten, değeri sayı olması ZORUNLU alanlar.
 * `yakalanmali: false` → birim taşımayan alanlar; kapsama girerlerse kapı gürültüye boğulur.
 */
const KANARYA: ReadonlyArray<{ anahtar: string; yakalanmali: boolean }> = [
  { anahtar: 'voltage_v', yakalanmali: true },
  { anahtar: 'max_delivery_m3h', yakalanmali: true },
  { anahtar: 'max_absorbed_power_w', yakalanmali: true },
  { anahtar: 'max_static_pressure_pa', yakalanmali: true },
  { anahtar: 'weight_kg', yakalanmali: true },
  { anahtar: 'blade_diameter_mm', yakalanmali: true },
  { anahtar: 'absorbed_current_a', yakalanmali: true },
  { anahtar: 'max_delivery_ls', yakalanmali: true },
  { anahtar: 'thermal_efficiency_pct', yakalanmali: true },
  { anahtar: 'operating_temperature_c', yakalanmali: true },
  { anahtar: 'max_ambient_temp_c', yakalanmali: true },
  { anahtar: 'tank_capacity_l', yakalanmali: true },
  { anahtar: 'airflow_speed_max_ms', yakalanmali: true },
  { anahtar: 'frequency_hz', yakalanmali: true },
  { anahtar: 'noise_lpa_3m_db', yakalanmali: true },
  { anahtar: 'noise_level_db_a', yakalanmali: true },
  { anahtar: 'heating_capacity_kw', yakalanmali: true },
  { anahtar: 'humidity_removed_l_24h', yakalanmali: true },
  // Birim DEĞİL — kapsama alınırlarsa yanlış kırmızı üretirler.
  { anahtar: 'motor_type', yakalanmali: false },
  { anahtar: 'ip_rating', yakalanmali: false },
  { anahtar: 'co2_sensor', yakalanmali: false },
  { anahtar: 'pq_curve', yakalanmali: false },
  { anahtar: 'insulation_class', yakalanmali: false },
  { anahtar: 'filter_classes', yakalanmali: false },
  { anahtar: 'rpm_max', yakalanmali: false },
  { anahtar: 'drive_code', yakalanmali: false },
  { anahtar: 'has_timer', yakalanmali: false },
  { anahtar: 'number_of_blades', yakalanmali: false },
  { anahtar: 'erp_compliant', yakalanmali: false },
  { anahtar: 'enclosure_size', yakalanmali: false },
  { anahtar: 'compatible_model', yakalanmali: false },
  { anahtar: 'atex_marking', yakalanmali: false },
]

describe('INV-SPEC-AXIS-1 — K1 kapısının sonek kapsamı', () => {
  it('sonek deseni betikte DURUYOR (kapı taşınmamış)', () => {
    expect(() => sonekDeseni()).not.toThrow()
  })

  it('birim eki taşıyan HER alan adı kapsamda', () => {
    const desen = sonekDeseni()
    const kacanlar = KANARYA.filter((k) => k.yakalanmali && !desen.test(k.anahtar)).map((k) => k.anahtar)
    expect(kacanlar, 'bu alanlarin degeri sayi olmak ZORUNDA ama kapi onlara HIC bakmiyor').toEqual([])
  })

  it('birim taşımayan hiçbir alan adı kapsamda DEĞİL', () => {
    const desen = sonekDeseni()
    const fazlalar = KANARYA.filter((k) => !k.yakalanmali && desen.test(k.anahtar)).map((k) => k.anahtar)
    expect(fazlalar, 'bu alanlar birim tasimaz; kapsama girerlerse kapi yanlis kirmizi verir').toEqual([])
  })

  it('cetvel dosyası duruyor ve kapıyı ADIYLA gösteriyor', () => {
    const cetvel = path.join(process.cwd(), 'docs', 'standards', 'spec-axis-standard.md')
    expect(fs.existsSync(cetvel)).toBe(true)
    expect(fs.readFileSync(cetvel, 'utf8')).toContain('spec-type')
  })
})
