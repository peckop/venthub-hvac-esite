import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-KAPALI-DAL-1 · Birleşmiş ve açık PR'ı olmayan dala push reddedilir.
 *
 * Cetvel: `docs/standards/collaboration-protocol.md` §1 (birleşmiş dal ölüdür).
 *
 * NİÇİN VAR (2026-09-22, #1305): #1162 squash-merge sonrası aynı dala 9 commit itildi; GitHub
 * silinmiş dalı sessizce yeniden açtı, PR yoktu, içerik 12 gün master'a girmedi.
 *
 * ⭐BETİK GERÇEK KOŞUMLA sınanır: alt süreç, git'in pre-push stdin biçimi ve sahte `gh`
 * (VH_GH_BIN). Çıkış KODU ölçülür — yeşil kapı ihlali gördüğünü ancak ret koluyla kanıtlar.
 */

const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts', 'hijyen', 'kapali-dal-push.cjs')
const KANCA = path.join(KOK, '.githooks', 'pre-push')
const GECICI = fs.mkdtempSync(path.join(os.tmpdir(), 'kapali-dal-'))
const SAHTE_GH = path.join(GECICI, 'gh.cjs')

fs.writeFileSync(
  SAHTE_GH,
  "if (process.env.SAHTE_GH_HATA) { process.stderr.write('ag yok'); process.exit(1) }\n" +
    "process.stdout.write(process.env.SAHTE_GH_CIKTI || '[]')\n",
)

afterAll(() => fs.rmSync(GECICI, { recursive: true, force: true }))

const SHA = 'a'.repeat(40)
const satir = (dal: string, yerel = SHA) => `refs/heads/${dal} ${yerel} refs/heads/${dal} ${'b'.repeat(40)}\n`

function kos(stdin: string, env: Record<string, string> = {}) {
  const r = spawnSync(process.execPath, [BETIK], {
    input: stdin,
    encoding: 'utf8',
    env: { ...process.env, VH_GH_BIN: SAHTE_GH, VH_KAPALI_DAL_IZIN: '', SAHTE_GH_HATA: '', ...env },
  })
  return { kod: r.status, err: r.stderr }
}

describe('INV-KAPALI-DAL-1: kapalı dala push bekçisi', () => {
  it('kanca var, betiği çağırıyor, README tablosunda', () => {
    const kanca = fs.readFileSync(KANCA, 'utf8')
    expect(kanca.startsWith('#!/bin/sh')).toBe(true)
    expect(kanca).toMatch(/scripts\/hijyen\/kapali-dal-push\.cjs/)
    expect(fs.readFileSync(path.join(KOK, '.githooks', 'README.md'), 'utf8')).toContain('`pre-push`')
  })

  it('RED: birleşmiş, açık PR yok → çıkış 1 ve yeni dal tarifi', () => {
    const r = kos(satir('urun-katalog/rec212'), { SAHTE_GH_CIKTI: '[{"number":1162,"state":"MERGED"}]' })
    expect(r.kod).toBe(1)
    expect(r.err).toContain('#1162')
    expect(r.err).toContain('git switch -c urun-katalog/rec212-2')
  })

  it('GEÇ: aynı ad için açık PR varsa (dal yaşıyor)', () => {
    const r = kos(satir('x'), { SAHTE_GH_CIKTI: '[{"number":1,"state":"MERGED"},{"number":2,"state":"OPEN"}]' })
    expect(r.kod).toBe(0)
  })

  it('GEÇ: hiç PR yok (yeni dal) ve yalnız kapatılmış (birleşmemiş) PR', () => {
    expect(kos(satir('yeni'), { SAHTE_GH_CIKTI: '[]' }).kod).toBe(0)
    expect(kos(satir('y'), { SAHTE_GH_CIKTI: '[{"number":3,"state":"CLOSED"}]' }).kod).toBe(0)
  })

  it('FAIL-OPEN GÖRÜNÜR: gh hata verirse geçer ama UYARI yazar', () => {
    const r = kos(satir('z'), { SAHTE_GH_HATA: '1' })
    expect(r.kod).toBe(0)
    expect(r.err).toMatch(/UYARI.*kontrol YAPILMADI/)
  })

  it('KAÇIŞ: VH_KAPALI_DAL_IZIN=1 geçirir ve uyarır', () => {
    const r = kos(satir('k'), { SAHTE_GH_CIKTI: '[{"number":9,"state":"MERGED"}]', VH_KAPALI_DAL_IZIN: '1' })
    expect(r.kod).toBe(0)
    expect(r.err).toContain('bilincli')
  })

  it('master, dal silme ve etiket push’u sorgulanmaz', () => {
    const birlesik = { SAHTE_GH_CIKTI: '[{"number":9,"state":"MERGED"}]' }
    expect(kos(satir('master'), birlesik).kod).toBe(0)
    expect(kos(satir('eski', '0'.repeat(40)), birlesik).kod).toBe(0)
    expect(kos(`refs/tags/v1 ${SHA} refs/tags/v1 ${'0'.repeat(40)}\n`, birlesik).kod).toBe(0)
  })
})
