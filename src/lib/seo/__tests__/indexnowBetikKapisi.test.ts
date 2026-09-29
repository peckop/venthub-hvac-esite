import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { yayinKapisi } from '../../../../scripts/seo/yayin-kapisi.mjs'

/**
 * REC-405 / karar 164 A — toplu IndexNow betiği adres şeması bayrağı KAPALIYKEN koşmayı reddeder (K4).
 * Ölçüm 2026-09-29: canlı sitemap 87 adres, süzgeçsiz koşum 78'ini yayında değişecek adresle bildirirdi.
 */

const KOK = resolve(__dirname, '../../../..')

describe('REC-405 · toplu IndexNow yayın kapısı', () => {
  it('bayrak KAPALI → izin yok, sebep K4/164 A yazılı', () => {
    const k = yayinKapisi('export const ADRES_SEMASI_K3B = false\n')
    expect(k.izin).toBe(false)
    if (k.izin) return // tip daraltma: yukarıdaki beklenti zaten düşürür
    expect(k.sebep).toContain('ADRES_SEMASI_K3B')
    expect(k.sebep).toContain('K4')
  })

  it('bayrak AÇIK → izin var', () => {
    expect(yayinKapisi('export const ADRES_SEMASI_K3B = true\n')).toEqual({ izin: true })
  })

  it('bayrak satırı bulunamazsa SESSİZCE izin vermez, hata fırlatır', () => {
    expect(() => yayinKapisi('export const BASKA = true\n')).toThrow(/ADRES_SEMASI_K3B/)
  })

  it('betik bayrak kapalıyken ağa/anahtara bakmadan DURUR (gerçek dosya, çıkış kodu 1)', () => {
    const features = readFileSync(resolve(KOK, 'src/config/features.ts'), 'utf8')
    if (yayinKapisi(features).izin) return // bayrak açıldıysa bu kol geçerli değil (yayın günü)
    const r = spawnSync(process.execPath, ['scripts/seo/indexnow-bildir.mjs', '--kuru'], {
      cwd: KOK,
      encoding: 'utf8',
      env: { ...process.env, INDEXNOW_KEY: 'test-anahtar' },
      timeout: 20000,
    })
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('DURDU')
    expect(r.stderr).toContain('ADRES_SEMASI_K3B')
    // sitemap okunmadı: kapı ağdan ÖNCE
    expect(r.stdout).not.toContain('sitemap okunuyor')
  })
})
