#!/usr/bin/env node
'use strict'
/**
 * BAYAT KARAR DENETİMİ (ARC-274, OPS emri 8 Kasım): `karar-bekliyor` etiketli açık kartlarda işin zaten bittiğini yakalar.
 *
 * NİÇİN VAR (ölçülmüş olay, 8 Kasım): OPS, Recep'e onay listesinde üç bayat kart sundu: OPS-235 (PR'lar zaten kapalı/birleşmiş),
 * OPS-193 (iş 27 Ekim'de yapılmış), OPS-165 (kanca 16 Ekim'den beri çalışıyor). Recep bayat bir şeye "evet" derse boşuna karar harcanır.
 *
 * NE YAPAR (yalnız UYARIR, hiçbir şeyi engellemez, çıkış kodu hep 0):
 *   1. Kart metninde `#NNNN` geçiyorsa o PR'ın durumunu GitHub'dan okur; HEPSİ MERGED/CLOSED ise "BAYAT olabilir", bir kısmı ise "KISMEN bayat olabilir".
 *   2. Kartın bağımlılıkları (dependsOn) Done'daysa ya da metinde anılan diğer kartların HEPSİ Done'daysa "bağlı iş Done" der.
 * OPS onay listesini çıkarmadan önce koşar:  node scripts/board/bayat-karar-denetimi.cjs [--label karar-bekliyor] [--json]
 *
 * ⚠YÖNTEM SAPMASI (OPS "kanban-anlik'e ek bayrak tercih" demişti): ayrı betik. `kanban-anlik.cjs` modların HER turda koştuğu hızlı, salt-okur,
 * ağsız kaynaktır; ona `gh` ağ çağrısı eklemek her modu yavaşlatırdı. Bu betik kartları o betikten OKUR (tek kaynak), ağı yalnız burada kullanır.
 *
 * FAIL-OPEN AMA GÖRÜNÜR: `gh` ya da pano okunamazsa "ölçülemedi: <sebep>" satırı basılır (sessiz "bayat yok" demez).
 * ⛔ Hiçbir şey yazmaz; anahtar/sır kullanmaz (`gh` kendi oturumunu kullanır).
 */

const { execFileSync } = require('node:child_process')
const path = require('node:path')

const DEPO_PR = 'peckop/venthub-hvac-esite'
const PR_AZAMI = 30
const KART_NO = /\b([A-Z]{2,5}\d{0,2}-\d{1,5})\b/g
const PR_NO = /(?:^|[^\w&])#(\d{3,5})\b/g

/** Metindeki benzersiz PR numaraları (sayı olarak). Saf. */
function prNumaralari(metin) {
  const bulunan = new Set()
  for (const m of String(metin || '').matchAll(PR_NO)) bulunan.add(Number(m[1]))
  return [...bulunan]
}

/** Metindeki benzersiz kart numaraları (büyük harf), `haric` hariç. Saf. */
function kartNumaralari(metin, haric) {
  const bulunan = new Set()
  for (const m of String(metin || '').matchAll(KART_NO)) {
    if (m[1] !== haric) bulunan.add(m[1])
  }
  return [...bulunan]
}

function kartNoBasliktan(baslik) {
  const m = /^\s*([A-Za-z0-9]{2,5}-\d{1,5})(?!\d)/.exec(String(baslik || ''))
  return m ? m[1].toUpperCase() : null
}

/**
 * Bir kartın bayatlık nedenleri. Saf (ağ yok): `prDurum` {numara: 'MERGED'|'CLOSED'|'OPEN'|null}, `kartDurum` {KARTNO: sutun}.
 * Dönüş: {neden: string[], guc: 'bayat'|'kismen'|null, olculemedi: string[]}.
 */
function degerlendir(kart, prDurum, kartDurum) {
  const metin = `${kart.title || ''}\n${kart.description || ''}`
  const kendi = kartNoBasliktan(kart.title)
  const nedenler = []
  const olculemedi = []
  let guc = null

  const prler = prNumaralari(metin)
  if (prler.length > 0) {
    const kapali = []
    const acik = []
    for (const n of prler) {
      const d = prDurum[n]
      if (d === 'MERGED' || d === 'CLOSED') kapali.push(`#${n} ${d}`)
      else if (d === 'OPEN') acik.push(n)
      else olculemedi.push(`#${n}`)
    }
    if (kapali.length > 0 && acik.length === 0 && olculemedi.length === 0) {
      guc = 'bayat'
      nedenler.push(`anılan PR'ların hepsi kapalı: ${kapali.join(', ')}`)
    } else if (kapali.length > 0) {
      guc = guc || 'kismen'
      nedenler.push(`anılan PR'lardan bir kısmı kapalı: ${kapali.join(', ')}${acik.length ? ` (açık: ${acik.map((n) => '#' + n).join(', ')})` : ''}`)
    }
  }

  const bagli = (kart.bagimliliklar || []).filter((b) => b && String(b.status || '').toLowerCase() === 'completed')
  if (bagli.length > 0 && bagli.length === (kart.bagimliliklar || []).length) {
    guc = 'bayat'
    nedenler.push(`bağımlılıkların hepsi tamamlanmış (${bagli.length})`)
  }

  const anilan = kartNumaralari(metin, kendi)
  const bilinen = anilan.filter((k) => kartDurum[k] !== undefined)
  if (bilinen.length > 0 && bilinen.every((k) => String(kartDurum[k]).toLowerCase() === 'done')) {
    guc = guc || 'kismen'
    nedenler.push(`anılan kartların hepsi Done: ${bilinen.join(', ')}`)
  }

  return { neden: nedenler, guc, olculemedi }
}

/** Satır biçimi. Saf. */
function satirYaz(kartNo, baslik, sonuc) {
  const onek = sonuc.guc === 'bayat' ? 'BAYAT olabilir' : 'KISMEN bayat olabilir'
  const kisa = String(baslik || '').replace(/\s+/g, ' ').slice(0, 90)
  return `${onek}: ${kartNo || '?'} — ${sonuc.neden.join('; ')} · "${kisa}"`
}

function ghPrDurumu(n, calistir = execFileSync) {
  try {
    const cikti = String(
      calistir('gh', ['api', `repos/${DEPO_PR}/pulls/${Number(n)}`, '--jq', '[.state, (.merged|tostring)] | join(" ")'], {
        encoding: 'utf8',
        timeout: 15000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    ).trim()
    if (cikti === 'closed true') return 'MERGED'
    if (cikti.startsWith('closed')) return 'CLOSED'
    if (cikti.startsWith('open')) return 'OPEN'
    return null
  } catch {
    return null
  }
}

function anlikOku(arg, calistir = execFileSync) {
  const betik = path.join(__dirname, 'kanban-anlik.cjs')
  const ham = calistir(process.execPath, [betik, ...arg], { encoding: 'utf8', timeout: 20000, maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
  const veri = JSON.parse(String(ham).trim().split('\n').pop())
  if (!veri.ok) throw new Error(veri.hata || 'pano okunamadı')
  return veri.tasks
}

/** Uçtan uca (ağ ve pano enjekte edilebilir). Dönüş: {satirlar, taranan, uyari}. */
function tara({ etiket = 'karar-bekliyor', oku = anlikOku, prOku = ghPrDurumu } = {}) {
  let adaylar
  let hepsi
  try {
    adaylar = oku(['--label', etiket, '--acik', '--detay'])
    hepsi = oku(['--kisa'])
  } catch (e) {
    return { satirlar: [`ölçülemedi: pano okunamadı (${String((e && e.message) || e).slice(0, 80)})`], taranan: 0, uyari: 0, olculemedi: true }
  }
  const kartDurum = {}
  for (const t of hepsi) {
    const no = kartNoBasliktan(t.task.title)
    if (no) kartDurum[no] = t.task.sutun ? String(t.task.sutun).toLowerCase().replace(/\s+/g, '') : ''
  }
  // sütun adı "Done" → 'done'
  const prler = new Set()
  for (const t of adaylar) for (const n of prNumaralari(`${t.task.title}\n${t.task.description || ''}`)) prler.add(n)
  const prDurum = {}
  const sirali = [...prler].sort((a, b) => b - a).slice(0, PR_AZAMI)
  for (const n of sirali) prDurum[n] = prOku(n)
  const satirlar = []
  const olculemeyenPr = new Set()
  for (const t of adaylar) {
    const s = degerlendir(t.task, prDurum, kartDurum)
    s.olculemedi.forEach((x) => olculemeyenPr.add(x))
    if (s.guc) satirlar.push(satirYaz(kartNoBasliktan(t.task.title), t.task.title, s))
  }
  if (olculemeyenPr.size > 0) satirlar.push(`ölçülemedi: PR durumu okunamadı (${[...olculemeyenPr].slice(0, 8).join(', ')}) — o PR'lar bayatlık hükmüne katılmadı`)
  if (prler.size > PR_AZAMI) satirlar.push(`ölçülemedi: ${prler.size - PR_AZAMI} PR sınır nedeniyle bakılmadı (üst sınır ${PR_AZAMI})`)
  return { satirlar, taranan: adaylar.length, uyari: satirlar.filter((l) => l.startsWith('BAYAT') || l.startsWith('KISMEN')).length, olculemedi: olculemeyenPr.size > 0 }
}

module.exports = { prNumaralari, kartNumaralari, degerlendir, satirYaz, ghPrDurumu, tara, kartNoBasliktan }

if (require.main === module) {
  const argv = process.argv.slice(2)
  const bilinen = new Set(['--json', '--label'])
  let etiket = 'karar-bekliyor'
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--label') etiket = String(argv[++i] || etiket)
    else if (!bilinen.has(argv[i])) {
      console.log('kullanim: node scripts/board/bayat-karar-denetimi.cjs [--label karar-bekliyor] [--json]  (yalniz okur ve uyarir)')
      process.exit(0)
    }
  }
  const s = tara({ etiket })
  if (argv.includes('--json')) console.log(JSON.stringify(s))
  else {
    for (const l of s.satirlar) console.log(l)
    console.log(`bayat-denetimi: ${s.taranan} ${etiket} kartı tarandı, ${s.uyari} uyarı${s.olculemedi ? ' (bazı ölçümler eksik)' : ''}`)
  }
}
