import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-HOME-1 (ARC-129): testler GERÇEK ~/.claude altına yazamaz.
 *
 * Olay: 14 Ekim'de `yeni-duzen-kimlik` testi kancayı `VH_OPS_OTURUMU_DOSYASI` vermeden koşturdu ve gerçek
 * `~/.claude/mod-durum/ops-oturumu.json` içine sahte kimlik yazdı; kokpit OPS'u tanımadı. Aynı sınıf 13 Ekim'de
 * `venthub-sid` dosyasında olmuştu. Koruma tek tek testlerin env vermesine bağlı olmamalı: `vitest.global-setup.ts`
 * koşum başına HOME/USERPROFILE'ı geçici dizine yönlendirir (`scripts/board/vitest-home-ortami.cjs`).
 *
 * Bu dosya (1) yönlendirmenin worker'da görünür olduğunu, (2) HOME'a bağlı yolu kullanan GERÇEK betiğin
 * (ops-oturumu.cjs) env vermeden bile gerçek dosyaya değil yalıtılmış dizine yazdığını, (3) ayrı süreçte
 * os.homedir()'in yalıtılmış dizini gösterdiğini ölçer. Koruma söküldüğünde (global-setup'ta homeHazirla çağrısı
 * silinince) üçü de kırmızıdır.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const OPS = path.join(KOK, 'scripts', 'board', 'ops-oturumu.cjs')
const { hazirla } = require_(path.join(KOK, 'scripts', 'board', 'vitest-home-ortami.cjs')) as {
  hazirla: (env?: Record<string, string | undefined>, tmp?: string, gercek?: string) => {
    home: string | null
    sahip: boolean
    temizle: () => void
  }
}

const SAHTE_SID = 'c0ffee00-1111-4222-8333-444455556666'
const yalitim = process.env.VENTHUB_HOME_YALITIMI_KAPALI !== '1'

describe.skipIf(!yalitim)('INV-TEST-HOME-1 · testler gerçek HOME altına yazamaz', () => {
  it('worker HOME ve USERPROFILE geçici dizinde; gerçek HOME ayrı saklı', () => {
    const tmp = fs.realpathSync(os.tmpdir())
    const home = fs.realpathSync(process.env.HOME as string)
    expect(home.startsWith(tmp), `HOME geçici dizin altında değil: ${home}`).toBe(true)
    expect(path.basename(home)).toMatch(/^vitest-home-/)
    expect(fs.realpathSync(process.env.USERPROFILE as string)).toBe(home)
    expect(fs.realpathSync(os.homedir())).toBe(home)
    const gercek = process.env.VENTHUB_GERCEK_HOME
    expect(gercek, 'gerçek HOME kaydı yok').toBeTruthy()
    expect(path.resolve(gercek as string)).not.toBe(path.resolve(home))
  })

  it('env vermeden ops-oturumu.acilistaYaz gerçek mod-durum dosyasına değil yalıtılmış HOME altına yazar', () => {
    const gercek = process.env.VENTHUB_GERCEK_HOME as string
    // Yalıtım yoksa (koruma sökülmüş) bu test gerçek dosyaya YAZMADAN düşer: ölçümün kendisi hatayı tekrarlamaz.
    if (!gercek || path.resolve(process.env.HOME as string) === path.resolve(gercek)) {
      throw new Error('HOME yalıtılmamış: gerçek HOME üzerinde ops-oturumu.cjs koşturulmaz')
    }
    const gercekDosya = path.join(gercek, '.claude', 'mod-durum', 'ops-oturumu.json')
    const once = fs.existsSync(gercekDosya) ? fs.readFileSync(gercekDosya, 'utf8') : null

    // Kasıtlı: VH_OPS_OTURUMU_DOSYASI VERİLMEZ; yol os.homedir()'e düşer (olayın birebir kolu).
    const env = { ...process.env }
    delete env.VH_OPS_OTURUMU_DOSYASI
    const r = spawnSync(
      process.execPath,
      [
        '-e',
        `const o=require(${JSON.stringify(OPS)});` +
          `const s=o.acilistaYaz({sid:${JSON.stringify(SAHTE_SID)},kaynak:'startup',agentType:'ops-pencere'});` +
          `process.stdout.write(JSON.stringify(s))`,
      ],
      { env, encoding: 'utf8', windowsHide: true, timeout: 30_000 },
    )
    expect(r.status, r.stderr).toBe(0)
    expect(JSON.parse(r.stdout)).toMatchObject({ yazildi: true })

    const yalitilmis = path.join(process.env.HOME as string, '.claude', 'mod-durum', 'ops-oturumu.json')
    expect(fs.readFileSync(yalitilmis, 'utf8')).toContain(SAHTE_SID)

    const sonra = fs.existsSync(gercekDosya) ? fs.readFileSync(gercekDosya, 'utf8') : null
    expect(sonra, 'gerçek ops-oturumu.json DEĞİŞTİ: test gerçek HOME altına yazdı').toBe(once)
    if (sonra !== null) expect(sonra).not.toContain(SAHTE_SID)
  })

  it('ayrı süreçte os.homedir() yalıtılmış dizini gösterir (kanca/betik süreçleri ortamı miras alır)', () => {
    const r = spawnSync(process.execPath, ['-e', "process.stdout.write(require('os').homedir())"], {
      env: process.env,
      encoding: 'utf8',
      windowsHide: true,
      timeout: 30_000,
    })
    expect(fs.realpathSync(r.stdout)).toBe(fs.realpathSync(process.env.HOME as string))
  })
})

describe('vitest-home-ortami.hazirla: davranış', () => {
  it('HOME ve USERPROFILE\'ı benzersiz dizine yönlendirir, gerçek HOME\'u saklar, temizle siler', () => {
    const env: Record<string, string | undefined> = { HOME: '/gercek', USERPROFILE: '/gercek' }
    const o = hazirla(env, os.tmpdir(), '/gercek')
    try {
      expect(o.sahip).toBe(true)
      expect(env.HOME).toBe(o.home)
      expect(env.USERPROFILE).toBe(o.home)
      expect(env.VENTHUB_GERCEK_HOME).toBe('/gercek')
      expect(fs.existsSync(o.home as string)).toBe(true)
    } finally {
      o.temizle()
    }
    expect(fs.existsSync(o.home as string)).toBe(false)
  })

  it('zaten yalıtılmış ortamda (iç içe koşum) yeniden yalıtmaz; kapatma değişkeni uyulur', () => {
    const icice: Record<string, string | undefined> = { HOME: '/x', VENTHUB_HOME_YALITIMI_DIZINI: '/zaten' }
    const a = hazirla(icice, os.tmpdir(), '/gercek')
    expect(a.sahip).toBe(false)
    expect(icice.HOME).toBe('/x')

    const kapali: Record<string, string | undefined> = { HOME: '/y', VENTHUB_HOME_YALITIMI_KAPALI: '1' }
    const b = hazirla(kapali, os.tmpdir(), '/gercek')
    expect(b.sahip).toBe(false)
    expect(kapali.HOME).toBe('/y')
  })
})
