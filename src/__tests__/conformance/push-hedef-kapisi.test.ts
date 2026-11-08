// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-PUSH-HEDEF-1 · git pre-push katmanı: hedef master/main, silme ve hızlı ileri olmayan güncelleme reddi (ARC-277, MVZ-10).
 * Bash komut metnine bakan kanca (push-kapisi) node betiği içinden yapılan push'u görmez; bu kapı git'in kendi katmanıdır.
 * Sabotaj kolları: master için bypass yok; nesne yerelde yoksa ileri sayılmaz; kapı bozulursa gerçek git push geçer.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const BETIK = path.join(KOK, 'scripts', 'hijyen', 'push-hedef-kapisi.cjs')
const PRE_PUSH = path.join(KOK, '.githooks', 'pre-push')
const m = require_(BETIK) as {
  degerlendir: (s: string, o?: { izin?: boolean; ataMi?: (a: string, t: string) => string }) => { ret: string[]; uyari: string[] }
}

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SIFIR = '0'.repeat(40)
const satir = (yerelRef: string, yerelSha: string, uzakRef: string, uzakSha: string) => `${yerelRef} ${yerelSha} ${uzakRef} ${uzakSha}\n`
const ileri = () => 'ata'

describe('INV-PUSH-HEDEF-1 — saf karar', () => {
  it('master/main hedefi reddedilir (düz, refs/heads önekli, büyük harf); izin değişkeni de geçirmez', () => {
    for (const ref of ['refs/heads/master', 'refs/heads/main', 'refs/heads/Master', 'refs/heads/MAIN', 'heads/master']) {
      expect(m.degerlendir(satir('refs/heads/x', SHA_A, ref, SHA_B), { ataMi: ileri }).ret).toHaveLength(1)
      // ⛔SABOTAJ: bypass master/main için YOK
      expect(m.degerlendir(satir('refs/heads/x', SHA_A, ref, SHA_B), { izin: true, ataMi: ileri }).ret).toHaveLength(1)
    }
  })

  it('silme reddedilir; izin değişkeniyle uyarıyla geçer', () => {
    const s = satir('(delete)', SIFIR, 'refs/heads/arac/x', SHA_B)
    expect(m.degerlendir(s, { ataMi: ileri }).ret[0]).toContain('silinemez')
    const g = m.degerlendir(s, { izin: true, ataMi: ileri })
    expect(g.ret).toHaveLength(0)
    expect(g.uyari[0]).toContain('VH_PUSH_HEDEF_IZIN=1')
    expect(m.degerlendir(satir('refs/heads/x', SIFIR, 'refs/tags/v1', SHA_B), { ataMi: ileri }).ret).toHaveLength(1)
  })

  it('hızlı ileri olmayan güncelleme reddedilir; nesne yerelde yoksa da (ölçülemeyen ileri sayılmaz)', () => {
    const s = satir('refs/heads/x', SHA_A, 'refs/heads/arac/x', SHA_B)
    expect(m.degerlendir(s, { ataMi: () => 'degil' }).ret[0]).toContain('hızlı ileri değil')
    expect(m.degerlendir(s, { ataMi: () => 'nesne-yok' }).ret[0]).toContain('uzak nesne yerelde yok')
    expect(m.degerlendir(s, { izin: true, ataMi: () => 'degil' }).ret).toHaveLength(0)
  })

  it('geçenler: hızlı ileri, yeni dal, etiket oluşturma; git çalıştırılamazsa uyarıyla geçer', () => {
    expect(m.degerlendir(satir('refs/heads/x', SHA_A, 'refs/heads/arac/x', SHA_B), { ataMi: ileri }).ret).toHaveLength(0)
    expect(m.degerlendir(satir('refs/heads/x', SHA_A, 'refs/heads/yeni', SIFIR), { ataMi: () => 'degil' }).ret).toHaveLength(0)
    expect(m.degerlendir(satir('refs/tags/v1', SHA_A, 'refs/tags/v1', SIFIR), { ataMi: () => 'degil' }).ret).toHaveLength(0)
    const g = m.degerlendir(satir('refs/heads/x', SHA_A, 'refs/heads/arac/x', SHA_B), { ataMi: () => 'olculemedi' })
    expect(g.ret).toHaveLength(0)
    expect(g.uyari[0]).toContain('OLÇULEMEDİ')
    expect(m.degerlendir('', {}).ret).toHaveLength(0)
  })
})

describe('INV-PUSH-HEDEF-1 — pre-push dosyası', () => {
  it('üçüncü adım mevcut iki kapının SONUNDA; kapalı-dal çıkış kodu korunuyor', () => {
    const t = fs.readFileSync(PRE_PUSH, 'utf8')
    expect(t.indexOf('depo-dokum-kapisi.cjs')).toBeLessThan(t.indexOf('kapali-dal-push.cjs'))
    expect(t.indexOf('kapali-dal-push.cjs')).toBeLessThan(t.indexOf('push-hedef-kapisi.cjs'))
    expect(t).toMatch(/\| "\$NODE" "\$BETIK" \|\| exit \$\?/)
    expect(t).toMatch(/"\$NODE" "\$HEDEF" "\$@"/)
  })
})

describe('INV-PUSH-HEDEF-1 — gerçek git push (geçici uzak depo)', () => {
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'push-hedef-'))
  afterAll(() => fs.rmSync(gecici, { recursive: true, force: true }))
  const uzak = path.join(gecici, 'uzak.git')
  const klon = path.join(gecici, 'klon')
  const kancalar = path.join(gecici, 'kancalar')
  const git = (cwd: string, args: string[], env: Record<string, string> = {}) =>
    spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', `core.hooksPath=${kancalar.replace(/\\/g, '/')}`, ...args], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, VH_PUSH_HEDEF_IZIN: '', ...env },
    })

  it('hazırlık: uzak depo + klon + yalnız hedef kapısını çağıran pre-push', () => {
    fs.mkdirSync(kancalar, { recursive: true })
    fs.writeFileSync(path.join(kancalar, 'pre-push'), `#!/bin/sh\nexec "${process.execPath.replace(/\\/g, '/')}" "${BETIK.replace(/\\/g, '/')}" "$@"\n`, { mode: 0o755 })
    expect(spawnSync('git', ['init', '-q', '--bare', '-b', 'master', uzak]).status).toBe(0)
    expect(spawnSync('git', ['clone', '-q', uzak, klon]).status).toBe(0)
    fs.writeFileSync(path.join(klon, 'a.txt'), 'a')
    git(klon, ['add', '.'])
    expect(git(klon, ['commit', '-q', '-m', 'ilk']).status).toBe(0)
    git(klon, ['branch', '-M', 'ozellik'])
  })

  it('özellik dalına normal push geçer; master hedefi, silme ve force REDDEDİLİR', () => {
    expect(git(klon, ['push', '-q', 'origin', 'ozellik']).status).toBe(0)
    const master = git(klon, ['push', 'origin', 'ozellik:master'])
    expect(master.status).not.toBe(0)
    expect(master.stderr).toContain('[push-hedef]')
    expect(git(klon, ['push', 'origin', 'ozellik:master'], { VH_PUSH_HEDEF_IZIN: '1' }).status).not.toBe(0) // bypass master için yok
    const sil = git(klon, ['push', 'origin', '--delete', 'ozellik'])
    expect(sil.status).not.toBe(0)
    expect(sil.stderr).toContain('silinemez')
    // hızlı ileri olmayan: amend + force
    fs.writeFileSync(path.join(klon, 'b.txt'), 'b')
    git(klon, ['add', '.'])
    git(klon, ['commit', '-q', '--amend', '-m', 'degisti'])
    const force = git(klon, ['push', '--force', 'origin', 'ozellik'])
    expect(force.status).not.toBe(0)
    expect(force.stderr).toContain('hızlı ileri değil')
    // bilinçli geçiş: izin değişkeni silme/force için geçer
    expect(git(klon, ['push', '-q', '--force', 'origin', 'ozellik'], { VH_PUSH_HEDEF_IZIN: '1' }).status).toBe(0)
  })

  it('⛔SABOTAJ: kapı kaldırılırsa (pre-push yok) aynı master push GEÇER — testin kapıyı gerçekten ölçtüğünün kanıtı', () => {
    fs.rmSync(path.join(kancalar, 'pre-push'))
    expect(git(klon, ['push', '-q', 'origin', 'ozellik:master']).status).toBe(0)
  })
})
