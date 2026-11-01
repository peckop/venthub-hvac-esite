#!/usr/bin/env node
/**
 * YEŞİL PR TARAYICI (ARC-170, ARC-167 bulgusu, OPS hükmü 16 Ekim) — salt okuma.
 *
 * NİÇİN VAR: auto_fix yalnız kırmızı CI, çakışma ya da yorumda pencereyi uyandırır; CI'ın YEŞİL
 * bitmesi bir olay değildir. 16 Ekim'de 4 yeşil PR 3 saat birleşmeyi bekledi, kimse bilmedi.
 * Bu betik açık PR'ları gezer, her birini tek kovaya koyar ve sahibine gidecek mesajı önerir.
 * OPS açılış ve tur sonu rutininden çağrılır; kanca bütçesine girmez.
 *
 * KOVALAR (ilk tutan kazanır, sıra önemlidir):
 *   taslak       draft PR (yalnız sayılır)
 *   bekletilen   bilerek bekletilen PR: `bekletiliyor` etiketi ya da gövdede tarihi geçmemiş
 *                `bekle: <YYYY-MM-DD> <engel>` satırı (sahipsiz-pr.cjs ile aynı ayrıştırıcı); hazır sayılmaz
 *   kirmizi      en az bir kapı `fail` kovasında
 *   cakisma      mergeStateStatus DIRTY
 *   olculemedi   kapılar okunamadı ya da mergeStateStatus UNKNOWN (GitHub hesaplıyor)
 *   ci-suruyor   zorunlu çekirdekten biri bekliyor ya da hiç doğmamış, ya da bir kapı pending
 *   eski-taban   mergeStateStatus BEHIND (master'a eşitlenmeli)
 *   recep-onayi  yeşil, ama supabase/migrations/ değişiyor (kural 13: Recep onayı)
 *   ops-onayi    yeşil, ama kanca/ayar/MCP/scripts/board değişiyor ve PR'da OPS UYGUN yorumu yok
 *   hazir        yeşil ve birleşmeye hazır
 *
 * Zorunlu çekirdek ve okuma sınıfı ritüelden (merge-ritueli.cjs) okunur: ikinci tanım yok.
 * Sahip departman dal adının ilk parçasıdır (`arac/arc170-...` → ARAC).
 *
 * KULLANIM  node scripts/hijyen/yesil-pr.cjs [--json]
 * ÇIKIŞ     0 = ölçüm tamam, 2 = açık PR listesi okunamadı.
 */
'use strict'

const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const ritu = require('./merge-ritueli.cjs')
const { bekleMuaf } = require('./sahipsiz-pr.cjs')

const execFileAsync = promisify(execFile)
const KOVA_SIRASI = ['hazir', 'ops-onayi', 'recep-onayi', 'eski-taban', 'kirmizi', 'cakisma', 'ci-suruyor', 'olculemedi', 'bekletilen', 'taslak']
const KOVA_ADI = {
  hazir: 'yesil ve birlesmeye hazir',
  'ops-onayi': 'OPS fark okumasi bekliyor',
  'recep-onayi': 'migration: Recep onayi bekliyor',
  'eski-taban': "master'a esitlenmeli",
  kirmizi: 'kirmizi',
  cakisma: 'cakisma',
  'ci-suruyor': 'CI suruyor',
  olculemedi: 'olculemedi',
  bekletilen: 'bilerek bekletiliyor',
  taslak: 'taslak',
}
const BEKLET_ETIKETI = 'bekletiliyor'
const OPS_UYGUN = /\bOPS\b[^\n]{0,80}\bUYGUN\b/

function sahip(dal) {
  const ilk = String(dal || '').split('/')[0]
  return ilk && ilk !== dal ? ilk.toUpperCase() : '?'
}

/**
 * Saf karar. pr: {number,title,headRefName,isDraft,mergeStateStatus,dosyalar:string[]|null,
 * yorumlar:string[], kapilar:[{name,bucket}]|null, etiketler?:string[], govde?:string};
 * cekirdek: zorunlu kapı adları.
 */
function siniflandir(pr, cekirdek, simdi = Date.now()) {
  if (pr.isDraft) return { kova: 'taslak', sebep: '' }
  if ((pr.etiketler || []).includes(BEKLET_ETIKETI)) return { kova: 'bekletilen', sebep: 'etiket ' + BEKLET_ETIKETI }
  if (bekleMuaf(pr.govde, simdi)) return { kova: 'bekletilen', sebep: 'bekle: satiri' }
  const kapilar = pr.kapilar
  if (!Array.isArray(kapilar)) return { kova: 'olculemedi', sebep: 'kapilar okunamadi' }
  const dusen = kapilar.filter((k) => ritu.DUSEN_KOVALARI.includes(k.bucket)).map((k) => k.name)
  if (dusen.length) return { kova: 'kirmizi', sebep: dusen.slice(0, 3).join(', ') }
  const durum = String(pr.mergeStateStatus || '').toUpperCase()
  if (durum === 'DIRTY') return { kova: 'cakisma', sebep: '' }
  if (durum === 'UNKNOWN' || !durum) return { kova: 'olculemedi', sebep: 'mergeStateStatus ' + (durum || 'yok') }
  const gorulen = new Set(kapilar.filter((k) => !ritu.BEKLEYEN_KOVALARI.includes(k.bucket)).map((k) => k.name))
  const eksik = (cekirdek || []).filter((c) => !gorulen.has(c))
  const bekleyen = kapilar.filter((k) => ritu.BEKLEYEN_KOVALARI.includes(k.bucket)).map((k) => k.name)
  if (eksik.length || bekleyen.length) {
    return { kova: 'ci-suruyor', sebep: [...new Set([...eksik, ...bekleyen])].slice(0, 3).join(', ') }
  }
  if (durum === 'BEHIND') return { kova: 'eski-taban', sebep: '' }
  const dosyalar = Array.isArray(pr.dosyalar) ? pr.dosyalar : []
  if (dosyalar.some((d) => String(d).replace(/\\/g, '/').startsWith('supabase/migrations/'))) {
    return { kova: 'recep-onayi', sebep: 'migration (kural 13)' }
  }
  if (ritu.okumaSorusuGerekli(dosyalar) && !(pr.yorumlar || []).some((y) => OPS_UYGUN.test(String(y)))) {
    return { kova: 'ops-onayi', sebep: 'kanca/ayar farki' }
  }
  return { kova: 'hazir', sebep: durum === 'CLEAN' ? '' : 'mergeStateStatus ' + durum }
}

/** Saf: PR'ları kovalara dağıtır, sahibe mesaj önerisini ekler. */
function tara(prler, cekirdek, simdi = Date.now()) {
  const satirlar = (Array.isArray(prler) ? prler : []).map((pr) => {
    const s = siniflandir(pr, cekirdek, simdi)
    const kim = sahip(pr.headRefName)
    let oneri = ''
    if (s.kova === 'hazir') oneri = `${kim}: #${pr.number} yesil, ritüelle birlestir`
    else if (s.kova === 'kirmizi') oneri = `${kim}: #${pr.number} kirmizi (${s.sebep}), duzelt`
    else if (s.kova === 'cakisma' || s.kova === 'eski-taban') oneri = `${kim}: #${pr.number} master'a esitle`
    else if (s.kova === 'ops-onayi') oneri = `OPS: #${pr.number} tam farki oku (${kim})`
    else if (s.kova === 'recep-onayi') oneri = `OPS: #${pr.number} migration, Recep onayi gerekir (${kim})`
    return { no: pr.number, baslik: String(pr.title || '').slice(0, 70), sahip: kim, ...s, oneri }
  })
  satirlar.sort((a, b) => KOVA_SIRASI.indexOf(a.kova) - KOVA_SIRASI.indexOf(b.kova) || a.no - b.no)
  const sayim = {}
  for (const k of KOVA_SIRASI) sayim[k] = satirlar.filter((s) => s.kova === k).length
  return { satirlar, sayim }
}

async function gh(args, ms = 20000) {
  const r = await execFileAsync('gh', args, { timeout: ms, maxBuffer: 64 * 1024 * 1024, windowsHide: true, encoding: 'utf8' })
  return JSON.parse(r.stdout)
}

async function olc(kok = path.join(__dirname, '..', '..')) {
  const liste = await gh(['pr', 'list', '--state', 'open', '--limit', '100', '--json',
    'number,title,headRefName,isDraft,mergeStateStatus,files,comments,labels,body'])
  const prler = await Promise.all(liste.map(async (p) => {
    let kapilar = null
    try { kapilar = await gh(['pr', 'checks', String(p.number), '--json', 'name,bucket']) } catch { kapilar = null }
    return {
      number: p.number, title: p.title, headRefName: p.headRefName, isDraft: p.isDraft,
      mergeStateStatus: p.mergeStateStatus,
      dosyalar: (p.files || []).map((f) => f.path),
      yorumlar: (p.comments || []).map((c) => c.body),
      etiketler: (p.labels || []).map((l) => l.name),
      govde: p.body || '',
      kapilar,
    }
  }))
  const { kapilar: cekirdek, sinirlar } = ritu.turetCekirdek(kok)
  return { ...tara(prler, cekirdek), cekirdek, sinirlar, olculdu: new Date().toISOString() }
}

module.exports = { siniflandir, tara, sahip, KOVA_SIRASI, KOVA_ADI, BEKLET_ETIKETI }

if (require.main === module) {
  olc().then((s) => {
    if (process.argv.includes('--json')) {
      process.stdout.write(JSON.stringify(s, null, 2) + '\n')
    } else {
      const ozet = KOVA_SIRASI.filter((k) => s.sayim[k]).map((k) => `${KOVA_ADI[k]} ${s.sayim[k]}`).join(' · ')
      process.stdout.write(`YESIL PR TARAYICI: ${s.satirlar.length} acik PR · ${ozet || 'yok'}\n`)
      if (!s.cekirdek.length) process.stdout.write('  ⚠zorunlu cekirdek BOS: ci-suruyor kovasi yalniz pending kapilara bakti\n')
      for (const r of s.satirlar.filter((x) => x.kova !== 'taslak')) {
        process.stdout.write(`  #${r.no} · ${r.sahip} · ${KOVA_ADI[r.kova]}${r.sebep ? ' (' + r.sebep + ')' : ''}${r.oneri ? ' → ' + r.oneri : ''}\n`)
      }
    }
    process.exit(0)
  }).catch((e) => {
    process.stderr.write('yesil-pr: OLCULEMEDI — ' + String((e && e.message) || e).split('\n')[0].slice(0, 160) + '\n')
    process.exit(2)
  })
}
