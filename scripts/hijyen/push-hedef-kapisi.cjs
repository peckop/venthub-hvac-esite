#!/usr/bin/env node
/**
 * PUSH HEDEF KAPISI — `.githooks/pre-push` üçüncü adımı (ARC-277, MVZ-10 bulgusu; OPS onaylı).
 *
 * NİÇİN VAR: `.claude/hooks/push-kapisi.cjs` yalnız Bash komut METNİNİ görür. Bir node/python betiği içinden `git push` yapılırsa
 * (Mevzuat, 5 PR) komut metni `node gonder-x.cjs`dir ve kanca hiç değerlendirmez. Bu kapı GİT'in kendi pre-push katmanında koşar:
 * push'u hangi süreç yaparsa yapsın çalışır.
 *
 * REDDEDİLEN (çıkış 1):
 *  · uzak ref master/main (büyük-küçük harf duyarsız; refs/heads/ önekli ya da düz). BYPASS YOK.
 *  · silme (yerel sha tamamen sıfır): uzak dal/etiket silinmez.
 *  · hızlı ileri OLMAYAN güncelleme (refs/heads/*): uzak sha, yerel sha'nın atası değil (force, rebase sonrası itme) ya da uzak nesne
 *    yerelde yok (ölçülemeyen = ileri sayılmaz).
 * Bilinçli geçiş (silme ve hızlı-ileri-değil için, master/main için DEĞİL): VH_PUSH_HEDEF_IZIN=1 git push ... (uyarı basılır).
 *
 * DÜRÜST SINIR: `git push --no-verify` pre-push'u atlar. `.claude/hooks/push-kapisi.cjs` agent komutlarında `--no-verify`'i reddeder
 * (15 Ekim sonrası meşru kullanım ölçüldü: 0); komut metnine girmeyen yol (betik içinden `--no-verify`) bu kapıyla da kapanmaz.
 * GitHub master koruması esas güvence, bu kapı ikinci katmandır.
 *
 * Girdi: git'in pre-push stdin'i — satır başına "<yerel ref> <yerel sha> <uzak ref> <uzak sha>"; argümanlar: <uzak ad> <uzak adres>.
 * Güvenlik: salt-okuma (yalnız `git merge-base --is-ancestor`), ağa gitmez. Git çalıştırılamazsa ileri-olmama sorusu ölçülemedi sayılır
 * ve UYARIYLA geçer (master/main ve silme kuralları git gerektirmez, her zaman uygulanır).
 */
'use strict'
const { spawnSync } = require('node:child_process')

const SIFIR = /^0+$/
const KORUNAN = new Set(['master', 'main'])

/** git ata sorusu: 'ata' | 'degil' | 'nesne-yok' | 'olculemedi'. */
function ataMi(ata, torun, calistir) {
  const r = (calistir || ((a) => spawnSync('git', a, { encoding: 'utf8', timeout: 15000, windowsHide: true })))(['merge-base', '--is-ancestor', ata, torun])
  if (r.error) return 'olculemedi'
  if (r.status === 0) return 'ata'
  if (r.status === 1) return 'degil'
  return 'nesne-yok' // 128 ve diğerleri: nesne yerelde yok / geçersiz
}

/**
 * Saf karar. satirlar: pre-push stdin metni. o: { izin: boolean (VH_PUSH_HEDEF_IZIN), ataMi(ata, torun) }.
 * Dönüş: { ret: string[], uyari: string[] }.
 */
function degerlendir(stdin, o = {}) {
  const ret = []
  const uyari = []
  const ata = o.ataMi || ((a, t) => ataMi(a, t))
  for (const satir of String(stdin || '').split(/\r?\n/)) {
    const p = satir.trim().split(/\s+/)
    if (p.length < 4) continue
    const [yerelRef, yerelSha, uzakRef, uzakSha] = p
    const dal = uzakRef.replace(/^refs\/heads\//, '').replace(/^heads\//, '').toLowerCase()
    if (KORUNAN.has(dal)) {
      ret.push(`${uzakRef}: master/main'e doğrudan push yok (PR ile birleşir); bypass yoktur`)
      continue
    }
    const silme = SIFIR.test(yerelSha) || yerelRef === '(delete)'
    if (silme) {
      const m = `${uzakRef}: uzak ref silinemez (git push --delete / :ref)`
      ;(o.izin ? uyari : ret).push(o.izin ? `VH_PUSH_HEDEF_IZIN=1 ile GEÇİLİYOR — ${m}` : m)
      continue
    }
    if (!/^refs\/heads\//.test(uzakRef) || SIFIR.test(uzakSha)) continue // etiket, yeni dal: hızlı-ileri sorusu yok
    const d = ata(uzakSha, yerelSha)
    if (d === 'ata') continue
    if (d === 'olculemedi') {
      uyari.push(`${uzakRef}: git çalıştırılamadı, hızlı-ileri OLÇULEMEDİ (geçiriliyor)`)
      continue
    }
    const m = `${uzakRef}: hızlı ileri değil (${d === 'nesne-yok' ? 'uzak nesne yerelde yok' : 'uzak sha yerel sha\'nın atası değil'}; force ya da rebase sonrası itme)`
    ;(o.izin ? uyari : ret).push(o.izin ? `VH_PUSH_HEDEF_IZIN=1 ile GEÇİLİYOR — ${m}` : m)
  }
  return { ret, uyari }
}

function main() {
  let raw = ''
  process.stdin.on('data', (c) => (raw += c))
  process.stdin.on('end', () => {
    const { ret, uyari } = degerlendir(raw, { izin: process.env.VH_PUSH_HEDEF_IZIN === '1' })
    for (const u of uyari) process.stderr.write(`[push-hedef] !!! UYARI !!! ${u}\n`)
    if (ret.length) {
      for (const r of ret) process.stderr.write(`[push-hedef] PUSH ENGELLENDI: ${r}\n`)
      process.stderr.write('[push-hedef] Silme ve hızlı-ileri-değil için BİLİNÇLİ geçiş: VH_PUSH_HEDEF_IZIN=1 git push ...  (master/main için geçiş YOK)\n')
      process.exit(1)
    }
    process.exit(0)
  })
}

module.exports = { degerlendir, ataMi }

if (require.main === module) main()
