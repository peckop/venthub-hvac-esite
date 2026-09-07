// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-DEFTER-BAYATLIK — `.claude/hooks/defter-bayatlik-olcumu.cjs`
 *
 * NİÇİN VAR: 2026-09-06'da proje takip defteri 8 saat bayat kaldı ve o süre boyunca
 * "konuşmuş muyduk" sorusuna YANLIŞ cevap verdi. Bayat defter, yalan söyleyen defterdir.
 *
 * ⛔KAPININ EN ÖNEMLİ KOLU BİR ŞEYİN OLMADIĞINI ölçer: kanca EŞİTLEME YAPMAZ.
 * Eşitleme dış servise (NotebookLM) yazar ve başka şeridin aracıdır; insan araya girmeden
 * dış yazma tetiklenmez (OPS hükmü 2026-09-07, ALTYAPI itirazı üzerine). Bu kol düşerse
 * kanca sessizce "otomatik yazan" bir şeye dönüşmüş demektir.
 */

const KOK = process.cwd()
const KANCA = path.join(KOK, '.claude', 'hooks', 'defter-bayatlik-olcumu.cjs')

function kostur(env: Record<string, string>, sid: string) {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-'))
  const r = execFileSync(process.execPath, [KANCA], {
    input: JSON.stringify({ session_id: sid }),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_BOARD_DIR: pano, ...env },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  return { stdout: r, pano }
}

/** stderr'i ayrı yakalar (uyarı oraya yazılır; stdout Stop kancasında konuşmaz). */
function hata(env: Record<string, string>, sid: string): string {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-'))
  try {
    const r = execFileSync(process.execPath, [KANCA], {
      input: JSON.stringify({ session_id: sid }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: pano, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    void r
    return ''
  } catch (e) {
    return String((e as { stderr?: string }).stderr ?? '')
  }
}

/**
 * Kanca DAİMA 0 ile çıkar, o yüzden stderr'i execFileSync'in hata yolundan alamayız.
 * Alt süreci doğrudan kurup stderr'i okuyoruz.
 */
function stderrOku(env: Record<string, string>, sid: string): string {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-'))
  const { execFileSync: e } = require('node:child_process') as typeof import('node:child_process')
  const cikti = e(process.execPath, ['-e', `
    const { spawnSync } = require('node:child_process')
    const r = spawnSync(process.execPath, [${JSON.stringify(KANCA)}], {
      input: JSON.stringify({ session_id: ${JSON.stringify(sid)} }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: ${JSON.stringify(pano)}, ...${JSON.stringify(env)} },
    })
    process.stdout.write(String(r.stderr || ''))
  `], { encoding: 'utf8' })
  return cikti
}

describe('INV-DEFTER-BAYATLIK: defter yaşı ÖLÇÜLÜR, eşitleme TETİKLENMEZ', () => {
  it('kanca dosyası VAR', () => {
    expect(fs.existsSync(KANCA)).toBe(true)
  })

  it('⛔EŞİTLEME YAPMAZ: kaynakta `esitle` fiilinin ÇAĞRILDIĞI yer yok', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    // `esitle` kelimesi metinde GEÇER (kullanıcıya komutu söyler) — yasak olan onu KOŞTURMAK.
    // Bu yüzden çalıştırma çağrılarının argümanlarına bakılır, çıplak kelimeye değil.
    // `s` bayrağı YOK ve gerekmiyor: `[^)]*` zaten satır sonlarını da yutar (nokta kullanılmıyor).
    // TS hedefi es2017 olduğu için `s` bayrağı TS1501 veriyordu — testler yeşilken tsc kırmızıydı,
    // yani "testler geçiyor" yine tip güvenliği kanıtı değildi (bugün ikinci kez).
    const kosturmalar = kaynak.match(/execFileSync\([^)]*\)/g) ?? []
    const esitleKosan = kosturmalar.filter((k) => /['"]esitle['"]/.test(k))
    expect(
      esitleKosan,
      'kanca eşitlemeyi KOŞTURUYOR — dış servise (NotebookLM) insan onayı olmadan yazma; OPS hükmü 2026-09-07 ihlali',
    ).toEqual([])
    // Salt-okuma fiili `olc` serbest.
    expect(kaynak, 'ölçüm fiili de yok — kanca hiçbir şey ölçmüyor olabilir').toMatch(/['"]olc['"]/)
  })

  it('EŞİK ALTINDA SESSİZ (gürültü yapmaz)', () => {
    const c = stderrOku({ VENTHUB_DEFTER_ESIK_SAAT: '99999' }, 'cccccccc-1111-4111-8111-111111111111')
    expect(c.trim(), 'eşik altında öttü — her turda öten uyarı üç günde görmezden gelinir').toBe('')
  })

  it('EŞİK ÜSTÜNDE UYARIR ve ÖLÇÜTÜNÜ SÖYLER', () => {
    const c = stderrOku({ VENTHUB_DEFTER_ESIK_SAAT: '0' }, 'dddddddd-1111-4111-8111-111111111111')
    expect(c, 'bayatlık uyarısı çıkmadı').toContain('DEFTER BAYAT')
    // ⭐Ölçüt yazılı olmalı: okuyan "bu sayı nereden" diye sormasın ve doğrulayabilsin.
    expect(c, 'ölçütü söylenmemiş — sayı kaynaksız kalır').toContain('git log origin/master')
    expect(c, 'eşitlemeyi kimin tetikleyeceği yazılmamış').toMatch(/ESITLEMEYI BU KANCA YAPMAZ/)
  })

  it('ÖLÇEMEDİĞİNDE SESSİZ KALMAZ: "ölçemedim" ≠ "taze"', () => {
    const c = stderrOku({ VENTHUB_REPO: 'C:/tmp/boyle-bir-depo-yok', VENTHUB_DEFTER_ESIK_SAAT: '0' }, 'eeeeeeee-1111-4111-8111-111111111111')
    expect(c, 'ölçüm başarısızken sessiz kaldı — bayatlık "yok" gösterilir').toContain('OLCULEMEDI')
    expect(c).toMatch(/AYNI SEY DEGIL/)
  })

  it('SOĞUMA: aynı oturumda arka arkaya iki kez ötmez', () => {
    const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-bayat-soguma-'))
    const sid = 'ffffffff-1111-4111-8111-111111111111'
    const calistir = () => {
      const { spawnSync } = require('node:child_process') as typeof import('node:child_process')
      const r = spawnSync(process.execPath, [KANCA], {
        input: JSON.stringify({ session_id: sid }),
        encoding: 'utf8',
        env: { ...process.env, VENTHUB_BOARD_DIR: pano, VENTHUB_DEFTER_ESIK_SAAT: '0' },
      })
      return String(r.stderr || '')
    }
    expect(calistir(), 'ilk uyarı çıkmadı').toContain('DEFTER BAYAT')
    expect(calistir().trim(), 'ikinci kez de öttü — soğuma penceresi çalışmıyor').toBe('')
  })

  it('TURU BLOKLAMAZ: daima çıkış 0', () => {
    // execFileSync sıfırdan farklı çıkışta fırlatır; buraya gelmek kanıttır.
    expect(() => kostur({ VENTHUB_DEFTER_ESIK_SAAT: '0' }, 'aaaaaaa0-1111-4111-8111-111111111111')).not.toThrow()
    void hata
  })
})
