import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-AYAR-DEGISTI-1..3 (ARC-118, REC-529 madde 1) — ConfigChange olayı oturum içinde değişen ayar dosyasını kaydeder,
 * her-mesaj satırı bunu oturuma BİR KEZ söyler.
 *
 * Belge sınırı: ConfigChange kancası mesaj gösteremez (systemMessage/continue atılır); bu yüzden kayıt + satır iki parça.
 * Koruma söküldüğünde (kayıt yazılmıyor ya da satır basılmıyor) testler kırmızıdır.
 */
const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude/hooks/ayar-degisti-bekci.cjs')
const SATIR_KANCASI = path.join(KOK, '.claude/hooks/defter-tazelik-satiri.cjs')

interface Bekci {
  kaydet: (girdi: unknown, simdi?: number) => { ts: number; source: string; file: string | null } | null
  satir: (sid: string, simdi?: number) => string
  jsonlDosyasi: () => string
}
const bekci = require_(KANCA) as Bekci

const SID_A = 'aaaaaaaa-0000-4000-8000-000000000001'
const SID_B = 'bbbbbbbb-0000-4000-8000-000000000002'
const SIMDI = Date.UTC(2026, 9, 14, 10, 30, 0)

let tmp = ''
let dosya = ''
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'arc118-'))
  dosya = path.join(tmp, 'ayar-degisti.jsonl')
  process.env.VH_AYAR_DEGISTI_DOSYASI = dosya
})
afterEach(() => {
  delete process.env.VH_AYAR_DEGISTI_DOSYASI
  fs.rmSync(tmp, { recursive: true, force: true })
})

const olay = (ek: Record<string, unknown> = {}) => ({
  session_id: SID_A,
  hook_event_name: 'ConfigChange',
  source: 'project_settings',
  file_path: 'C:\\repo\\.claude\\settings.json',
  ...ek,
})

describe('INV-AYAR-DEGISTI-1 · ConfigChange olayı kayıt bırakır, asla engellemez', () => {
  it('kanca SÜRECİ: olay kaydedilir, çıktı yok, çıkış 0', () => {
    const r = spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify(olay()),
      encoding: 'utf8',
      env: { ...process.env, VH_AYAR_DEGISTI_DOSYASI: dosya },
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
    const satirlar = fs.readFileSync(dosya, 'utf8').trim().split('\n')
    expect(satirlar).toHaveLength(1)
    expect(JSON.parse(satirlar[0])).toMatchObject({ source: 'project_settings', file: 'C:/repo/.claude/settings.json', sid: SID_A })
  })

  it('bozuk girdi ve başka olay: çıkış 0, kayıt yok', () => {
    const kos = (girdi: string) =>
      spawnSync(process.execPath, [KANCA], { input: girdi, encoding: 'utf8', env: { ...process.env, VH_AYAR_DEGISTI_DOSYASI: dosya } })
    expect(kos('{bozuk').status).toBe(0)
    expect(kos(JSON.stringify({ hook_event_name: 'PostToolUse', source: 'x' })).status).toBe(0)
    expect(fs.existsSync(dosya)).toBe(false)
  })

  it('kayıt dosyası şişmez: en çok 200 satır tutulur', () => {
    for (let i = 0; i < 230; i += 1) bekci.kaydet(olay({ file_path: `/a/${i}.json` }), SIMDI + i)
    expect(fs.readFileSync(dosya, 'utf8').trim().split('\n')).toHaveLength(200)
  })
})

describe('INV-AYAR-DEGISTI-2 · satır: oturuma bir kez, tekilleştirilmiş, 30 dakika sonra susar', () => {
  it('kayıt yoksa susar; kayıt varsa söyler, aynı oturuma ikinci kez söylemez, başka oturuma söyler', () => {
    expect(bekci.satir(SID_A, SIMDI)).toBe('')
    bekci.kaydet(olay(), SIMDI)
    const ilk = bekci.satir(SID_A, SIMDI + 60_000)
    expect(ilk).toContain('AYAR DEGISTI')
    expect(ilk).toContain('project_settings')
    expect(ilk).toContain('settings.json')
    expect(bekci.satir(SID_A, SIMDI + 120_000), 'aynı oturuma tekrar söyledi').toBe('')
    expect(bekci.satir(SID_B, SIMDI + 120_000), 'başka oturum görmedi').toContain('AYAR DEGISTI')
  })

  it('aynı değişiklik her pencerede ayrı olay üretir: tek değişiklik olarak sayılır', () => {
    bekci.kaydet(olay({ session_id: SID_A }), SIMDI)
    bekci.kaydet(olay({ session_id: SID_B }), SIMDI + 2_000)
    const s = bekci.satir('cccccccc-0000-4000-8000-000000000003', SIMDI + 5_000)
    expect(s).not.toContain('+')
    expect(s.match(/settings\.json/g)).toHaveLength(1)
  })

  it('30 dakikadan eski kayıt susar; yeni değişiklik yeniden söyletir', () => {
    bekci.kaydet(olay(), SIMDI)
    expect(bekci.satir(SID_A, SIMDI + 31 * 60_000)).toBe('')
    bekci.kaydet(olay({ source: 'user_settings', file_path: 'D:/ayarlar/.claude/settings.json' }), SIMDI + 40 * 60_000)
    expect(bekci.satir(SID_A, SIMDI + 41 * 60_000)).toContain('user_settings')
  })
})

describe('INV-AYAR-DEGISTI-3 · her-mesaj satırına bağlı (sökülürse haber verilmez)', () => {
  it('defter-tazelik-satiri.cjs ayar-degisti-bekci satırını çağırır ve hata durumunda OLCULEMEDI der', () => {
    const kaynak = fs.readFileSync(SATIR_KANCASI, 'utf8')
    expect(kaynak).toMatch(/require\(path\.join\(__dirname, 'ayar-degisti-bekci\.cjs'\)\)/)
    expect(kaynak).toContain('AYAR DEGISTI: OLCULEMEDI')
  })
})
