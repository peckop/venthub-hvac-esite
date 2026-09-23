/**
 * REC-172 karar 76 · deterministik okuyucu (`rec172-cikarim.py`). Ağa/DB'ye çıkmaz: sahte kaynak
 * dizini (`sayfalar.jsonl` + `manifest.json`) ve `--urunler` JSON'u geçici dizine yazılır.
 *
 * Kilitlenenler (plan v5.1 adım 2 — her kurala sabotaj):
 *   1. Casals satırı MODEL ADIYLA eşlenir; 400 V akımı, güç ×1000, ağırlık, kutup; ≤4 kW → 230 V,
 *      >4 kW → 690 V (`koşullu`). Kaynakta satırı olmayan ürün KIRMIZI.
 *   2. Enkelfan kol 2: tablo hücresi ↔ düz metin ayrışırsa KIRMIZI.
 *   3. CMS: eşleme boyut + T + kW (14/5 T2 föysüz kalır, 14/5 T4 föyüne yapışmaz); fan ≠ motor
 *      devrinde devir yazılmaz; tabloda bölüm sırası değişse de bölüm ETİKETİYLE okunur; düz metinde
 *      fan/motor devri yer değiştirirse KIRMIZI ("ilk RPM" kuralı bunu göremezdi).
 *   4. İki koşum bayt-eşit.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const BETIK = join(__dirname, '..', 'rec172-cikarim.py')
const PY = process.platform === 'win32' ? 'python' : 'python3'
let kok = ''

type Sayfa = { dosya: string; sayfa: number; metin: string; tablo?: { satirlar: (string | null)[][] }[] }
const F191 = 'web/www.casals.com__Casals_catalogue__flipbook__191.txt'
const F192 = 'web/www.casals.com__Casals_catalogue__flipbook__192.txt'
const ENK = 'pdf/82f7f-cata-logo-plug-fans_casals.pdf'
const CMS_A = 'pdf/aaa_VORTICENT-CMS-ATEX-14-5-T4-0-09kW.pdf'
const CMS_B = 'pdf/bbb_VORTICENT-CMS-ATEX-40-16-T4-7-5kW.pdf'

const casalsGenel = 'Squirrel cage standardized asynchronous IEC motor with IP-55 protection and class F electrical insulation. Standard voltages 230/400V 50Hz for threephase motors up to 4kW and 400/690V 50Hz, for higher powers.'
const casalsDeger = 'THREE PHASE RANGE / serie trifásica Code * Model R.P.M. Rated I (A) Rated Power kW Air flow m3/h Sound dB (A) Weight Kg Connect. diagram 230 V 400 V ' +
  'NS4012100 NIMUS 401 T2 4kW 2880 13,3 7,63 4,00 9.660 66 61,47 1 NS4512132 NIMUS 451 T2 7,5kW 2910 - 14,1 7,50 13.750 69 86,03 1'

const enkMetin = (rpm155 = '3950') => [
  'external rotor EC motor', 'Sin-', 'gle-phase 230V 50/60Hz power supply for models', '155 to 310 and three-phase 400V.',
  'IP54 motor and class B insulation.', 'Code', 'Model', 'R.P.M', 'Rated I (A)', '230V', 'Rated Power', 'kW',
  'ENKEC155', 'ENKELFAN 155 EEC', rpm155, '0,25', '0,06', '460', '46', '3', '1',
].join('\n')
const enkTablo = [{ satirlar: [
  ['Code', 'Model', 'R.P.M', 'Rated I (A)\n230V', 'Rated Power\nkW', 'Air flow\nm3/h', 'Sound\ndB (A)', 'Weight\nKg', 'Connection\ndiagram'],
  ['ENKEC155', 'ENKELFAN 155 EEC', '3950', '0,25', '0,06', '460', '46', '3', '1'],
] }]

const cmsS1 = (baslik: string) => `${baslik}\nGENERAL DATA\n• ATEX standard asynchronous motor. IP55\nprotection,  and class F insulation. Manufactured with standard voltages: 230V 50Hz for\nsingle phase motors, 230/400V 50Hz for three phase motors up to 4kW and 400/690V\n50Hz for higher powers.`
const cmsS2Metin = (fanRpm: string, motRpm: string, flow: string, guc: string, akim: string) =>
  ['TECHNICAL DATA', 'Fan', 'RPM', fanRpm, 'Approx. weight', '5 kg', 'Max. Flow', flow, 'Motor', 'Power', guc, 'RPM', motRpm,
    'I max. (400V)', akim, 'Size', '56', 'DIMENSIONS'].join('\n')
const cmsS2Tablo = (fanRpm: string, motRpm: string, flow: string, guc: string, akim: string, motorOnce = false) => {
  const fan = [['Fan', null, null, null, null, null], ['RPM', fanRpm, 'Approx. weight', '5 kg', 'Max. Flow', flow]]
  const mot = [['Motor', null, null, null, null, null], ['Power', guc, 'RPM', motRpm, 'I max. (400V)', akim]]
  return [{ satirlar: motorOnce ? [...mot, ...fan] : [...fan, ...mot] }]
}

const URUNLER = [
  { id: 'u1', sku: 'AVE-NS4012100', ad: 'NIMUS 401 T2 4kW', aile: 'avens-nimus' },
  { id: 'u2', sku: 'AVE-NS4512132', ad: 'NIMUS 451 T2 7,5kW', aile: 'avens-nimus' },
  { id: 'u3', sku: 'AVE-ENKEC155', ad: 'ENKELFAN 155 EEC', aile: 'avens-enkelfan-ec-plug' },
  { id: 'u4', sku: 'VRT-A', ad: 'VORTICENT CMS ATEX 14/5 T4 0,09kW', aile: 'vortice-vorticent-cms-atex' },
  { id: 'u5', sku: 'VRT-T2', ad: 'VORTICENT CMS ATEX 14/5 T2 0,25kW', aile: 'vortice-vorticent-cms-atex' },
  { id: 'u6', sku: 'VRT-B', ad: 'VORTICENT CMS ATEX 40/16 T4 7,5kW', aile: 'vortice-vorticent-cms-atex' },
]

const sayfalar = (o: { enkRpmMetin?: string; cmsBMotorOnce?: boolean; cmsBMetinTers?: boolean } = {}): Sayfa[] => [
  { dosya: F191, sayfa: 1, metin: casalsGenel },
  { dosya: F192, sayfa: 1, metin: casalsDeger },
  { dosya: ENK, sayfa: 16, metin: enkMetin(o.enkRpmMetin), tablo: enkTablo },
  { dosya: CMS_A, sayfa: 1, metin: cmsS1('VORTICENT CMS ATEX 14/5 T4 0,09kW Zone 1: FAN (Ex h\nIIB+H2 T4 Gb) + MOTOR (Ex eb IIC T4 Gb)') },
  { dosya: CMS_A, sayfa: 2, metin: cmsS2Metin('1450', '1346', '250 m³/h', '0,09 kW', '0,33 A'), tablo: cmsS2Tablo('1450', '1346', '250 m³/h', '0,09 kW', '0,33 A') },
  { dosya: CMS_B, sayfa: 1, metin: cmsS1('VORTICENT CMS ATEX 40/16 T4 7,5kW Zone 2: FAN (Ex h\nIIB T3 Gc) + MOTOR (Ex ec IIC T3 Gc)') },
  { dosya: CMS_B, sayfa: 2,
    metin: o.cmsBMetinTers ? cmsS2Metin('1440', '1448', '10570 m³/h', '7,5 kW', '15,6 A') : cmsS2Metin('1448', '1448', '10570 m³/h', '7,5 kW', '15,6 A'),
    tablo: o.cmsBMetinTers
      ? cmsS2Tablo('1448', '1440', '10570 m³/h', '7,5 kW', '15,6 A', o.cmsBMotorOnce)
      : cmsS2Tablo('1448', '1448', '10570 m³/h', '7,5 kW', '15,6 A', o.cmsBMotorOnce) },
]

const kos = (ad: string, s: Sayfa[], urunler = URUNLER) => {
  const d = join(kok, ad)
  mkdirSync(d, { recursive: true })
  writeFileSync(join(d, 'sayfalar.jsonl'), s.map((x) => JSON.stringify(x)).join('\n') + '\n')
  writeFileSync(join(d, 'manifest.json'), JSON.stringify({ sayfa_sayisi: s.length }))
  writeFileSync(join(d, 'urunler.json'), JSON.stringify(urunler))
  const cikti = join(d, 'cikti.csv')
  const r = spawnSync(PY, [BETIK, '--dizin', join(d, 'sayfalar.jsonl'), '--urunler', join(d, 'urunler.json'), '--cikti', cikti],
    { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
  let csv = ''
  try { csv = readFileSync(cikti, 'utf8') } catch { /* kırmızıda da yazılır; yoksa boş */ }
  return { ...r, csv }
}
const deger = (csv: string, sku: string, alan: string) => {
  const s = csv.split('\n').find((x) => x.startsWith(`${sku},`) && x.split(',')[2] === alan)
  return s ? s.split(',')[3] : undefined
}

beforeAll(() => { kok = mkdtempSync(join(tmpdir(), 'rec172-')) })
afterAll(() => rmSync(kok, { recursive: true, force: true }))

describe('REC-172 deterministik okuyucu', () => {
  it('temiz dizinde YEŞİL; değerler kaynaktaki sütundan', () => {
    const r = kos('iyi', sayfalar())
    expect(r.status, r.stdout + r.stderr).toBe(0)
    expect(deger(r.csv, 'AVE-NS4012100', 'absorbed_current_a')).toBe('7.63')   // 400 V sütunu, 230 V (13,3) değil
    expect(deger(r.csv, 'AVE-NS4012100', 'rated_power_w')).toBe('4000')
    expect(deger(r.csv, 'AVE-NS4012100', 'voltage_alt_v')).toBe('230')          // 4 kW dahil
    expect(deger(r.csv, 'AVE-NS4512132', 'voltage_alt_v')).toBe('690')
    expect(deger(r.csv, 'AVE-ENKEC155', 'phase')).toBe('1')
    expect(deger(r.csv, 'VRT-B', 'max_delivery_ls')).toBe('2936.11')
    expect(deger(r.csv, 'VRT-B', 'atex_zone')).toBe('Zone 2')
    expect(deger(r.csv, 'VRT-A', 'atex_zone')).toBe('Zone 1')
  })

  it('14/5 T2 föysüz kalır (14/5 T4 föyüne yapışmaz); fan ≠ motor devrinde devir yazılmaz', () => {
    const r = kos('cms', sayfalar())
    expect(r.csv).not.toMatch(/^VRT-T2,/m)
    expect(r.stdout).toMatch(/VRT-T2: FÖYSÜZ/)
    expect(deger(r.csv, 'VRT-A', 'rpm_max')).toBeUndefined()
    expect(deger(r.csv, 'VRT-B', 'rpm_max')).toBe('1448')
  })

  it('tabloda Motor bölümü önce gelse de bölüm etiketiyle okunur', () => {
    const r = kos('sira', sayfalar({ cmsBMotorOnce: true }))
    expect(r.status, r.stdout).toBe(0)
    expect(deger(r.csv, 'VRT-B', 'max_delivery_m3h')).toBe('10570')
  })

  it('düz metinde fan/motor devri yer değiştirince KOL 2 KIRMIZI', () => {
    const r = kos('ters', sayfalar({ cmsBMetinTers: true }))
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/VRT-B: KOL 2 AYRISTI Fan\/RPM/)
  })

  it('Enkelfan tablo ↔ düz metin ayrışırsa KIRMIZI', () => {
    const r = kos('enk', sayfalar({ enkRpmMetin: '3960' }))
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/AVE-ENKEC155: KOL 2 AYRISTI rpm/)
  })

  it('kaynakta satırı olmayan ürün KIRMIZI (sessizce atlanmaz)', () => {
    const r = kos('yok', sayfalar(), [...URUNLER, { id: 'u9', sku: 'AVE-NS999', ad: 'NIMUS 999 T2 9kW', aile: 'avens-nimus' }])
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/AVE-NS999: NIMUS deger satiri 0 kez/)
  })

  it('iki koşum bayt-eşit', () => {
    expect(kos('b1', sayfalar()).csv).toBe(kos('b2', sayfalar()).csv)
  })
})
