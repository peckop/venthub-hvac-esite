#!/usr/bin/env node
'use strict'
/**
 * CI UYANDIRICI (ARC-263, OPS emri 6 Kasım): PR'ın CI'ı bitince sahibi pencere insan tetiği olmadan haber alır.
 *
 * SORUN (ölçüldü): CI yeşili hiçbir pencereyi uyandırmıyor; departman CI beklerken boşta kalıyor, akış Recep'in elle
 * tetiğine bağlı (6 Kasım #2319/#2320/#2322). Boşta pencereyi uyandıran tek şey `asyncRewake` kancası (çıkış 2 + stderr,
 * ARC-214 duzenleme-ani-lint ile ölçülmüş kalıp) ve SendMessage.
 *
 * İKİ KİP
 *  1. SAHİP: `.claude/hooks/ci-uyandirici.cjs` (PostToolUse · Bash · asyncRewake) `gh pr create` / `git push origin <dal>`
 *     sonrası bu modülün `bekle`sini arka planda koşar; CI bitince tek satırla pencereyi uyandırır.
 *  2. OPS: `node scripts/board/ci-uyandirici.cjs --hepsi` (Monitor persistent): tüm açık PR'ları tarar, YALNIZ durum
 *     değişince bir satır basar. Süreci OPS kurar; bu betik kendi kendine süreç, cron ya da zamanlayıcı KURMAZ (karar 53).
 *
 * GÜVENLİK: salt-okuma (`gh pr view` / `gh pr list`), fail-open (her hata sessiz), gh çağrısı 15 sn tavanlı, sır yok,
 * yazma yalnız pano dizinindeki kilit dosyası. VANA: VENTHUB_CI_UYANDIRICI=0.
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const ARALIK_MS = 30 * 1000
const TAVAN_MS = 40 * 60 * 1000
const MESAJ_TAVANI = 500
const GH_ZAMAN_ASIMI_MS = 15 * 1000
const PR_ALANLARI = 'number,state,mergeStateStatus,statusCheckRollup,body,headRefOid,headRefName,title'

const BASARISIZ = new Set(['FAILURE', 'CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED', 'STARTUP_FAILURE', 'ERROR'])
const GECTI = new Set(['SUCCESS', 'SKIPPED', 'NEUTRAL'])

/** Tek kapının durumu: 'gecti' | 'basarisiz' | 'bekliyor'. CheckRun (conclusion) ve StatusContext (state) birlikte. */
function kapiDurumu(k) {
  if (!k || typeof k !== 'object') return 'bekliyor'
  const ham = String(k.conclusion || k.state || '').toUpperCase()
  if (!ham) return 'bekliyor'
  if (BASARISIZ.has(ham)) return 'basarisiz'
  if (GECTI.has(ham)) return 'gecti'
  return 'bekliyor'
}

const kapiAdi = (k) => String((k && (k.name || k.context)) || '?')

/**
 * PR görünümünü sınıflar. SAF.
 * durum: 'birlesti' | 'kapandi' | 'kirmizi' | 'yesil' | 'bekliyor'
 * Kural: bir kapı bile başarısızsa KIRMIZI (erken haber); kapı listesi boşsa ya da bekleyen varsa BEKLİYOR (itişten hemen sonra
 * rollup boş gelir; boşu yeşil saymak sahte yeşildir).
 */
function siniflandir(pv) {
  if (!pv || typeof pv !== 'object') return { durum: 'bekliyor', basarisiz: [], bekleyen: 0, mergeState: '' }
  const mergeState = String(pv.mergeStateStatus || '')
  if (pv.state === 'MERGED') return { durum: 'birlesti', basarisiz: [], bekleyen: 0, mergeState }
  if (pv.state === 'CLOSED') return { durum: 'kapandi', basarisiz: [], bekleyen: 0, mergeState }
  const kapilar = Array.isArray(pv.statusCheckRollup) ? pv.statusCheckRollup : []
  const basarisiz = kapilar.filter((k) => kapiDurumu(k) === 'basarisiz').map(kapiAdi)
  const bekleyen = kapilar.filter((k) => kapiDurumu(k) === 'bekliyor').length
  if (basarisiz.length) return { durum: 'kirmizi', basarisiz, bekleyen, mergeState }
  if (!kapilar.length || bekleyen) return { durum: 'bekliyor', basarisiz: [], bekleyen: bekleyen || 0, mergeState }
  return { durum: 'yesil', basarisiz: [], bekleyen: 0, mergeState }
}

/** PR gövdesindeki `Kanban: ARC-262` (virgülle birden çok olabilir) → 'ARC-262' ya da ''. */
function kanbanNo(body) {
  const m = /^\s*Kanban:\s*([A-Z]{2,4}-\d+(?:\s*,\s*[A-Z]{2,4}-\d+)*)/m.exec(String(body || ''))
  return m ? m[1].replace(/\s+/g, '') : ''
}

/** Pencereye giden tek satır (≤ MESAJ_TAVANI). */
function mesaj(pv, s) {
  const no = pv && pv.number ? '#' + pv.number : '#?'
  const kanban = kanbanNo(pv && pv.body)
  const ek = kanban ? ' (Kanban: ' + kanban + ')' : ''
  let metin
  if (s.durum === 'yesil') {
    metin = `PR ${no}${ek} CI YEŞİL, mergeState=${s.mergeState || '?'}. Sırada: bağımsız denetçi hükmü varsa ritüelle birleştir, yoksa denetçiyi aç. OPS'a tek satır SendMessage yaz.`
  } else if (s.durum === 'kirmizi') {
    metin = `PR ${no}${ek} CI KIRMIZI: ${s.basarisiz.slice(0, 4).join(', ')}${s.basarisiz.length > 4 ? ' …' : ''}. gh run view --log-failed ile sebebi oku, düzelt (ilgisiz kırmızıda en çok 10 dk, sonra OPS'a yaz). OPS'a tek satır SendMessage yaz.`
  } else if (s.durum === 'birlesti') {
    metin = `PR ${no}${ek} BİRLEŞTİ. Kartı kapat (add_check checkType command → verify_completion → move_task done). OPS'a tek satır SendMessage yaz.`
  } else {
    metin = `PR ${no}${ek} birleştirilmeden KAPANDI. Kartı ve dalı kontrol et; OPS'a tek satır SendMessage yaz.`
  }
  const tam = '[ci-uyandirici] ' + metin
  return tam.length > MESAJ_TAVANI ? tam.slice(0, MESAJ_TAVANI - 1) + '…' : tam
}

const PR_URL = /github\.com\/[^/\s"']+\/[^/\s"']+\/pull\/(\d+)/
const PUSH = /\bgit\s+push\s+(?:-\S+\s+)*origin\s+([^\s;&|<>]+)/
const PUSH_YASAK = /--delete|\s-d\s|--force-with-lease=|:\s*$/

/**
 * Bash komutundan beklenecek PR: { pr } | { dal } | null. SAF; çıktı metni `gh pr create`in bastığı URL için.
 * `gh pr create` → çıktıdaki PR URL'si. `git push origin <dal>` → dal (PR numarası dalın açık PR'ından çözülür).
 */
function tetik(komut, cikti) {
  const k = String(komut || '')
  if (/\bgh\s+pr\s+create\b/.test(k)) {
    const m = PR_URL.exec(String(cikti || ''))
    return m ? { pr: Number(m[1]) } : null
  }
  const p = PUSH.exec(k)
  if (p && !PUSH_YASAK.test(k)) {
    const dal = p[1].includes(':') ? p[1].split(':').pop() : p[1]
    return dal ? { dal } : null
  }
  return null
}

function ghCalistir(args) {
  return execFileSync('gh', args, { encoding: 'utf8', timeout: GH_ZAMAN_ASIMI_MS, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] })
}

/** Tek PR'ı okur; okunamazsa null (fail-open). `calistir` test için enjekte edilir. */
function prOku(pr, calistir = ghCalistir) {
  try {
    return JSON.parse(calistir(['pr', 'view', String(pr), '--json', PR_ALANLARI]))
  } catch {
    return null
  }
}

/** Dalın AÇIK PR numarası; yoksa/okunamazsa null. */
function dalPr(dal, calistir = ghCalistir) {
  try {
    const liste = JSON.parse(calistir(['pr', 'list', '--head', String(dal), '--state', 'open', '--json', 'number', '--limit', '1']))
    return Array.isArray(liste) && liste[0] && Number.isInteger(liste[0].number) ? liste[0].number : null
  } catch {
    return null
  }
}

/** Kilit dosyası: aynı PR+sha için tek bekleyici. */
function kilitYolu(dizin, pr) {
  return path.join(dizin, 'ci-uyandirici', String(pr) + '.lock')
}

function pidYasiyor(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return e && e.code === 'EPERM'
  }
}

/** Kilidi almaya çalışır; başka canlı bekleyici aynı sha'yı bekliyorsa false. Yazılamazsa true (fail-open: çift uyanma, sessizlikten iyi). */
function kilitAl(dizin, pr, sha, simdi = Date.now(), yasiyor = pidYasiyor) {
  const yol = kilitYolu(dizin, pr)
  try {
    const eski = JSON.parse(fs.readFileSync(yol, 'utf8'))
    if (eski && eski.sha === sha && simdi - eski.t < TAVAN_MS && yasiyor(eski.pid)) return false
  } catch {
    // kilit yok ya da bozuk: al
  }
  try {
    fs.mkdirSync(path.dirname(yol), { recursive: true })
    fs.writeFileSync(yol, JSON.stringify({ pid: process.pid, sha, t: simdi }))
  } catch {
    // yazılamadı: devam
  }
  return true
}

function kilitBirak(dizin, pr, sha) {
  try {
    const yol = kilitYolu(dizin, pr)
    const k = JSON.parse(fs.readFileSync(yol, 'utf8'))
    if (k && k.pid === process.pid && k.sha === sha) fs.unlinkSync(yol)
  } catch {
    // zaten yok
  }
}

/**
 * PR'ın CI'ı bitene kadar bekler. Döner: { sonuc: 'yesil'|'kirmizi'|'birlesti'|'kapandi'|'yenilendi'|'zaman-asimi'|'okunamadi', pv, s }.
 * 'yenilendi' = bekleme sırasında dal yeni commit aldı (yeni itişin kendi bekleyicisi var; bu sessiz biter).
 * Enjekte edilenler (`oku`, `uyu`, `simdi`) testte bekleme süresini sıfırlar.
 */
async function bekle({ pr, oku = prOku, uyu = (ms) => new Promise((r) => setTimeout(r, ms)), simdi = Date.now, aralik = ARALIK_MS, tavan = TAVAN_MS, ilkSha }) {
  const bas = simdi()
  let sha = ilkSha || ''
  let hata = 0
  for (;;) {
    const pv = oku(pr)
    if (!pv) {
      hata += 1
      if (hata >= 5) return { sonuc: 'okunamadi', pv: null, s: null }
    } else {
      hata = 0
      if (!sha) sha = pv.headRefOid || ''
      else if (pv.headRefOid && pv.headRefOid !== sha && pv.state === 'OPEN') return { sonuc: 'yenilendi', pv, s: null }
      const s = siniflandir(pv)
      if (s.durum !== 'bekliyor') return { sonuc: s.durum, pv, s }
    }
    if (simdi() - bas >= tavan) return { sonuc: 'zaman-asimi', pv, s: null }
    await uyu(aralik)
  }
}

/**
 * --hepsi kipinin çekirdeği: açık PR listesi + önceki durum → basılacak satırlar ve yeni durum. SAF.
 * Bir PR için aynı (durum, sha) ikinci kez basılmaz; yeni commit durumu sıfırlar. Açıktan kaybolan PR `birlesti` olarak sorulur
 * (çağıran PR'ı okuyup 'MERGED'/'CLOSED' ile `birlestiSatiri`ni üretir).
 */
function degisiklikler(prler, onceki) {
  const yeni = {}
  const satirlar = []
  for (const pv of Array.isArray(prler) ? prler : []) {
    const s = siniflandir(pv)
    const anahtar = s.durum + ':' + (pv.headRefOid || '')
    yeni[pv.number] = anahtar
    if ((s.durum === 'yesil' || s.durum === 'kirmizi') && onceki[pv.number] !== anahtar) {
      const kanban = kanbanNo(pv.body)
      satirlar.push(
        (s.durum === 'yesil' ? 'CI-YESIL' : 'CI-KIRMIZI') + ' #' + pv.number + (kanban ? ' ' + kanban : '') +
          (s.durum === 'yesil' ? ' mergeState=' + (s.mergeState || '?') : ' basarisiz=' + s.basarisiz.slice(0, 4).join(',')),
      )
    }
  }
  const kaybolan = Object.keys(onceki).filter((n) => !(n in yeni)).map(Number)
  return { satirlar, yeni, kaybolan }
}

function birlestiSatiri(pv) {
  const s = siniflandir(pv)
  if (s.durum !== 'birlesti' && s.durum !== 'kapandi') return null
  const kanban = kanbanNo(pv.body)
  return (s.durum === 'birlesti' ? 'BIRLESTI' : 'KAPANDI') + ' #' + pv.number + (kanban ? ' ' + kanban : '')
}

async function hepsi(yaz = (x) => process.stdout.write(x + '\n'), calistir = ghCalistir, uyu = (ms) => new Promise((r) => setTimeout(r, ms))) {
  let onceki = {}
  for (;;) {
    try {
      const liste = JSON.parse(calistir(['pr', 'list', '--state', 'open', '--limit', '50', '--json', PR_ALANLARI]))
      const { satirlar, yeni, kaybolan } = degisiklikler(liste, onceki)
      satirlar.forEach(yaz)
      for (const n of kaybolan) {
        const satir = birlestiSatiri(prOku(n, calistir))
        if (satir) yaz(satir)
      }
      onceki = yeni
    } catch {
      // gh anlık hata verdi: sonraki turda dener
    }
    await uyu(ARALIK_MS)
  }
}

module.exports = {
  kapiDurumu, siniflandir, kanbanNo, mesaj, tetik, prOku, dalPr, kilitYolu, kilitAl, kilitBirak, bekle, degisiklikler, birlestiSatiri, hepsi,
  ARALIK_MS, TAVAN_MS, MESAJ_TAVANI,
}

if (require.main === module) {
  if (process.argv.includes('--hepsi')) {
    hepsi().catch(() => process.exit(0))
  } else {
    process.stderr.write('KULLANIM: node scripts/board/ci-uyandirici.cjs --hepsi   (OPS Monitor persistent: durum değişince bir satır)\n')
    process.exit(1)
  }
}
