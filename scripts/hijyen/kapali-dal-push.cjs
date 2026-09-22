#!/usr/bin/env node
/**
 * KAPALI DALA PUSH BEKÇİSİ — `.githooks/pre-push` çağırır (INV-KAPALI-DAL-1).
 *
 * NİÇİN VAR (2026-09-22, #1305): #1162 squash-merge edildi, ritüel uzak dalı sildi; ardından AYNI
 * dala 9 commit daha itildi. GitHub silinmiş dala gelen push'u SESSİZCE yeni dal olarak açar —
 * açık PR yok, kimse görmez; içerik 12 gün master'a girmedi. `delete_branch_on_merge` bunu
 * önlemez (dal zaten siliniyordu). Sunucu tarafı ret ücretsiz planda yok → ret yerelde.
 *
 * KURAL: itilen her dal (master hariç) için PR geçmişine bakılır.
 *   açık PR var            → GEÇ (dal yaşıyor)
 *   açık yok, birleşmiş var → RED (çıkış 1): "bu dal #N ile birleşti, yeni dal aç"
 *   hiç PR yok             → GEÇ (yeni dal)
 *   gh yok / ağ yok / hata → UYAR ve GEÇ (fail-open, GÖRÜNÜR) — kanca push'u kilitlememeli
 *   VH_KAPALI_DAL_IZIN=1   → UYAR ve GEÇ (bilinçli yeniden kullanım)
 *
 * Girdi: git'in pre-push stdin'i — satır başına "<yerel ref> <yerel sha> <uzak ref> <uzak sha>".
 * Test için: VH_GH_BIN gerçek `gh` yerine sahte bir çalıştırılabilir gösterir.
 */
'use strict'
const { execFileSync } = require('node:child_process')

const SIFIR = /^0+$/
const KORUNAN = new Set(['master', 'main'])

function prGecmisi(dal) {
  const bin = process.env.VH_GH_BIN || 'gh'
  const cikti = execFileSync(
    bin.endsWith('.cjs') || bin.endsWith('.js') ? process.execPath : bin,
    [
      ...(bin.endsWith('.cjs') || bin.endsWith('.js') ? [bin] : []),
      'pr', 'list', '--head', dal, '--state', 'all', '--limit', '20', '--json', 'number,state',
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000 },
  )
  const liste = JSON.parse(cikti)
  if (!Array.isArray(liste)) throw new Error('gh cikti dizi degil')
  return liste
}

function karar(gecmis) {
  if (gecmis.some((p) => p.state === 'OPEN')) return { gec: true }
  const birlesik = gecmis.filter((p) => p.state === 'MERGED').map((p) => p.number)
  if (birlesik.length) return { gec: false, pr: Math.max(...birlesik) }
  return { gec: true }
}

function main(stdin) {
  let ret = 0
  for (const satir of stdin.split(/\r?\n/)) {
    const [, yerelSha, uzakRef] = satir.trim().split(/\s+/)
    if (!uzakRef || !uzakRef.startsWith('refs/heads/')) continue
    if (SIFIR.test(yerelSha || '')) continue // dal silme push'u
    const dal = uzakRef.slice('refs/heads/'.length)
    if (KORUNAN.has(dal)) continue

    let gecmis
    try {
      gecmis = prGecmisi(dal)
    } catch (e) {
      console.error(`[kapali-dal] UYARI: "${dal}" icin PR gecmisi okunamadi (${e.code || String(e.message).split('\n')[0]}) — push GECIRILDI, kontrol YAPILMADI.`)
      continue
    }
    const k = karar(gecmis)
    if (k.gec) continue
    if (process.env.VH_KAPALI_DAL_IZIN === '1') {
      console.error(`[kapali-dal] UYARI: "${dal}" #${k.pr} ile birlesmis; VH_KAPALI_DAL_IZIN=1 ile bilincli GECIRILDI.`)
      continue
    }
    console.error(
      `[kapali-dal] RED: "${dal}" dali #${k.pr} ile BIRLESTI ve acik PR'i yok.\n` +
        `  Bu dala itilen commit master'a GIRMEZ ve kimse gormez (2026-09-22 #1305: 9 commit 12 gun kayboldu).\n` +
        `  Yeni dal ac:  git switch -c ${dal}-2   (sonra push + yeni PR)\n` +
        `  Bilincli yeniden kullanim: VH_KAPALI_DAL_IZIN=1 git push ...`,
    )
    ret = 1
  }
  return ret
}

module.exports = { karar, main }

if (require.main === module) {
  let girdi = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (d) => (girdi += d))
  process.stdin.on('end', () => process.exit(main(girdi)))
}
