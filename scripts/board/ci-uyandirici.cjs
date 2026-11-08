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
const TEYIT_MS = 10 * 1000
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
  const sha8 = pv && pv.headRefOid ? String(pv.headRefOid).slice(0, 8) : '?'
  const ek = (kanban ? ' (Kanban: ' + kanban + ')' : '') + ' sha ' + sha8
  let metin
  if (s.durum === 'eski') {
    metin = `PR ${no}${ek} CI SONUCU ESKİ COMMIT'E AİT: rollup yeşil ama bu sha'nın kendi check-runs'ı bitmedi ya da yok. Birleştirme; gh api repos/${REPO}/commits/${sha8}/check-runs ile baş sha'yı kendin doğrula. OPS'a tek satır SendMessage yaz.`
  } else if (s.durum === 'yesil') {
    metin = `PR ${no}${ek} CI YEŞİL (baş sha check-runs ile doğrulandı), mergeState=${s.mergeState || '?'}. Sırada: bağımsız denetçi hükmü varsa ritüelle birleştir, yoksa denetçiyi aç. OPS'a tek satır SendMessage yaz.`
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

/** Bu depo: gh çağrıları HER ZAMAN `--repo` ile gider (ek çalışma dizinlerindeki başka depoların PR'ı karışmasın). */
const REPO = 'peckop/venthub-hvac-esite'
const PR_URL = /github\.com\/([^/\s"']+\/[^/\s"']+)\/pull\/(\d+)/
const PUSH_KOMUT = /\bgit\s+push\b([^;&|<>\n]*)/

/**
 * `git push` argümanlarından dal: remote'tan (origin) sonraki ilk bayraksız argüman; `+ref`, `src:dst` (dst alınır) ve
 * `refs/heads/` öneki çözülür. `--delete`/`-d`, tırnak/kabuk karakteri ya da dal yoksa null. 'HEAD' olduğu gibi döner
 * (yerel dal adını çağıran çözer). SAF.
 */
function pushDali(argumanlar) {
  const t = String(argumanlar || '').trim().split(/\s+/).filter(Boolean)
  if (t.includes('--delete') || t.includes('-d')) return null
  const i = t.indexOf('origin')
  if (i < 0) return null
  const aday = t.slice(i + 1).find((x) => !x.startsWith('-'))
  if (!aday || /["'`$()]/.test(aday)) return null
  let dal = aday.replace(/^\+/, '')
  if (dal.includes(':')) dal = dal.split(':').pop()
  dal = dal.replace(/^refs\/heads\//, '')
  return dal || null
}

/**
 * Bash komutundan beklenecek PR: { pr } | { dal } | null. SAF; çıktı metni `gh pr create`in bastığı URL için.
 * `gh pr create` → çıktıdaki PR URL'si (YALNIZ bu depo). `git push origin <dal>` → dal; "Everything up-to-date" yeni itiş değildir.
 */
function tetik(komut, cikti) {
  const k = String(komut || '')
  if (/\bgh\s+pr\s+create\b/.test(k)) {
    const m = PR_URL.exec(String(cikti || ''))
    return m && m[1].toLowerCase() === REPO ? { pr: Number(m[2]) } : null
  }
  const p = PUSH_KOMUT.exec(k)
  if (p && !/Everything up-to-date/i.test(String(cikti || ''))) {
    const dal = pushDali(p[1])
    return dal ? { dal } : null
  }
  return null
}

function ghCalistir(args) {
  return execFileSync('gh', args, { encoding: 'utf8', timeout: GH_ZAMAN_ASIMI_MS, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] })
}

/**
 * Bir commit'in kapılarını REST ile (check-runs, o sha'ya bağlı) sınıflar. SAF karar kısmı: { durum: 'yesil'|'kirmizi'|'bekliyor', basarisiz }.
 * Kapı yok ya da tamamlanmamış kapı varsa 'bekliyor' (boş yeşil değildir). Rollup başka commit'in sonucunu taşıyabilir; bu sha'ya bağlıdır.
 */
function restSiniflandir(veri) {
  const kosular = veri && Array.isArray(veri.check_runs) ? veri.check_runs : null
  if (!kosular) return null
  const basarisiz = kosular.filter((k) => kapiDurumu({ conclusion: k.conclusion }) === 'basarisiz').map(kapiAdi)
  if (basarisiz.length) return { durum: 'kirmizi', basarisiz }
  const bekleyen = kosular.filter((k) => k.status !== 'completed' || kapiDurumu({ conclusion: k.conclusion }) === 'bekliyor').length
  if (!kosular.length || bekleyen) return { durum: 'bekliyor', basarisiz: [] }
  return { durum: 'yesil', basarisiz: [] }
}

/** Baş sha'nın REST sonucu; okunamazsa null (fail-open: rollup'a güvenilir). `calistir` test için enjekte edilir. */
function shaDogrula(sha, calistir = ghCalistir) {
  if (!/^[0-9a-f]{7,40}$/i.test(String(sha || ''))) return null
  try {
    return restSiniflandir(JSON.parse(calistir(['api', `repos/${REPO}/commits/${sha}/check-runs?per_page=100`])))
  } catch {
    return null
  }
}

/** Tek PR'ı okur; okunamazsa null (fail-open). `calistir` test için enjekte edilir. */
function prOku(pr, calistir = ghCalistir) {
  try {
    return JSON.parse(calistir(['pr', 'view', String(pr), '--repo', REPO, '--json', PR_ALANLARI]))
  } catch {
    return null
  }
}

/** Dalın AÇIK PR numarası; yoksa/okunamazsa null. */
function dalPr(dal, calistir = ghCalistir) {
  try {
    const liste = JSON.parse(calistir(['pr', 'list', '--repo', REPO, '--head', String(dal), '--state', 'open', '--json', 'number', '--limit', '1']))
    return Array.isArray(liste) && liste[0] && Number.isInteger(liste[0].number) ? liste[0].number : null
  } catch {
    return null
  }
}

/** Yerel dalın commit'i (itiş yarışı denetimi için); 'HEAD' verilirse geçerli dalın adı da döner. Okunamazsa null. */
function yerelDal(dal, git = (a) => execFileSync('git', a, { encoding: 'utf8', timeout: GH_ZAMAN_ASIMI_MS, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] })) {
  try {
    const ad = dal === 'HEAD' ? git(['rev-parse', '--abbrev-ref', 'HEAD']).trim() : dal
    if (!ad || ad === 'HEAD') return null
    return { ad, sha: git(['rev-parse', ad]).trim() }
  } catch {
    return null
  }
}

/**
 * İtişten sonra GitHub'ın PR başını güncellemesini bekler (en çok `tavan` ms): PR'ın headRefOid'i itilen commit'e eşit olunca
 * PR görünümünü döner; eşitlenmezse null. Eski commit'in eski yeşili "CI yeşil" diye yanlış haber olmasın.
 */
async function itisiBekle({ pr, sha, oku = prOku, uyu = (ms) => new Promise((r) => setTimeout(r, ms)), aralik = 5000, tavan = 120000, simdi = Date.now }) {
  const bas = simdi()
  for (;;) {
    const pv = oku(pr)
    if (pv && pv.headRefOid === sha) return pv
    if (simdi() - bas >= tavan) return null
    await uyu(aralik)
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
async function bekle({ pr, oku = prOku, uyu = (ms) => new Promise((r) => setTimeout(r, ms)), simdi = Date.now, aralik = ARALIK_MS, tavan = TAVAN_MS, ilkSha, teyit = TEYIT_MS, dogrula = shaDogrula }) {
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
      if (s.durum === 'yesil') {
        // YEŞİL TEYİDİ: GitHub itişten hemen sonra eski commit'in yeşilini ya da kısmen kayıtlı kapıları döndürebilir.
        // Tek okuma yetmez: aynı commit'te ikinci okuma da yeşil olmalı.
        await uyu(teyit)
        const ikinci = oku(pr)
        const s2 = ikinci ? siniflandir(ikinci) : null
        if (!ikinci || s2.durum !== 'yesil' || (ikinci.headRefOid && ikinci.headRefOid !== pv.headRefOid)) {
          if (simdi() - bas >= tavan) return { sonuc: 'zaman-asimi', pv, s: null }
          await uyu(aralik)
          continue
        }
        // SHA TEYİDİ (ARC-279): rollup yeşil olsa da baş commit'in KENDİ check-runs'ı yeşil olmalı. Bekliyor/yok → sonuç eski commit'e ait olabilir.
        const rest = ikinci.headRefOid ? dogrula(ikinci.headRefOid) : null
        if (rest && rest.durum === 'kirmizi') return { sonuc: 'kirmizi', pv: ikinci, s: { ...s2, durum: 'kirmizi', basarisiz: rest.basarisiz } }
        if (rest && rest.durum === 'bekliyor') {
          if (simdi() - bas >= tavan) return { sonuc: 'eski', pv: ikinci, s: { ...s2, durum: 'eski' } }
          await uyu(aralik)
          continue
        }
        return { sonuc: 'yesil', pv: ikinci, s: s2 }
      }
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
  let ilkTur = true
  for (;;) {
    try {
      const liste = JSON.parse(calistir(['pr', 'list', '--repo', REPO, '--state', 'open', '--limit', '50', '--json', PR_ALANLARI]))
      // gh geçici boş liste dönerse bütün PR'lar kaybolmuş sayılıp sonraki turda hepsi yeniden basılmasın.
      if (Array.isArray(liste) && !liste.length && Object.keys(onceki).length) throw new Error('bos liste')
      const { satirlar, yeni, kaybolan } = degisiklikler(liste, onceki)
      if (ilkTur) {
        // İLK TUR SESSİZ BASELINE: mevcut yeşil/kırmızılar "değişiklik" değildir (16 açık PR'da 13 satırlık sel ölçüldü).
        yaz('ILK-TARAMA acik=' + liste.length + ' yesil=' + satirlar.filter((x) => x.startsWith('CI-YESIL')).length + ' kirmizi=' + satirlar.filter((x) => x.startsWith('CI-KIRMIZI')).length)
        ilkTur = false
      } else {
        satirlar.forEach(yaz)
      }
      for (const n of kaybolan) {
        const satir = birlestiSatiri(prOku(n, calistir))
        if (satir) yaz(satir)
        else if (onceki[n]) yeni[n] = onceki[n] // PR okunamadı: sonraki turda yeniden sorulur, birleşme olayı kaybolmasın
      }
      onceki = yeni
    } catch {
      // gh anlık hata verdi: sonraki turda dener
    }
    await uyu(ARALIK_MS)
  }
}

module.exports = {
  kapiDurumu, siniflandir, restSiniflandir, shaDogrula, kanbanNo, mesaj, tetik, pushDali, prOku, dalPr, yerelDal, itisiBekle, kilitYolu, kilitAl, kilitBirak, bekle,
  degisiklikler, birlestiSatiri, hepsi,
  REPO, ARALIK_MS, TAVAN_MS, TEYIT_MS, MESAJ_TAVANI,
}

if (require.main === module) {
  if (process.argv.includes('--hepsi')) {
    hepsi().catch(() => process.exit(0))
  } else {
    process.stderr.write('KULLANIM: node scripts/board/ci-uyandirici.cjs --hepsi   (OPS Monitor persistent: durum değişince bir satır)\n')
    process.exit(1)
  }
}
