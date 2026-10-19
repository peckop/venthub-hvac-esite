#!/usr/bin/env node
'use strict'
/**
 * WORKTREE TEMİZLE — ARC-132 / OPS-179 (karar 364, 397). Cetvel: CLAUDE.md "Worktree node_modules (karar 88)".
 *
 * NİÇİN: C:/tmp ve .claude/worktrees altında 300'den fazla çalışma kopyası var; her biri kendi node_modules'ünü
 * taşıyor (~73 bin dosya) ve NTFS dosya kayıt önbelleğini şişiriyor (Metafile 14,6 GB, 19 Ekim ölçümü).
 *
 * KULLANIM (varsayılan KURU KOŞUM: hiçbir şeye dokunmaz):
 *   node tools/worktree-temizle.cjs --liste <silinecek.json> [--ilk N] [--kayit <dosya.jsonl>]
 *   node tools/worktree-temizle.cjs --liste <silinecek.json> --gercek --geri-alinamaz-onayladim [--ilk N] [--kayit <dosya.jsonl>]
 *
 * Liste: [{ yol, dal, head }]. Betik listeye GÜVENMEZ; her kopya için kontrolü yeniden yapar ve geçemeyeni ATLAR:
 *   1. yol ana depo, açık pencerenin çalışma dizini (claude agents) ya da bu betiği koşan dizin DEĞİL;
 *   2. yol `git worktree list`te kayıtlı, kilitli değil;
 *   3. `git status --porcelain` boş (kayıtsız değişiklik yok);
 *   4. HEAD listedeki head ile AYNI (liste çıkarıldıktan sonra commit gelmemiş);
 *   5. HEAD hiçbir remote ref'te olmayan commit taşımıyor (`rev-list HEAD --not --remotes` = 0).
 *
 * SİLME YÖNTEMİ (karar 88, 09-23 olayı: `git worktree remove` junction'dan geçip ana deponun node_modules'ünü sildi):
 *   a. kök ve node_modules üst düzeyinde bağlantı (junction/symlink) taranır; hedefi worktree DIŞINA düşen bağlantı
 *      YALNIZ bağlantı olarak kaldırılır (`cmd /c rmdir <bağlantı>`, `/s` YOK, hedefe dokunulmaz);
 *   b. ana deponun node_modules/.bin'i varlığı her kopyadan önce ve sonra doğrulanır; kaybolursa betik DURUR;
 *   c. `git worktree remove --force <yol>`; dal SİLİNMEZ (geri alma: `git worktree add <yol> <dal|head>`, sonra pnpm install);
 *   d. hepsinden sonra `git worktree prune`.
 * Hata olursa o kopya raporlanır ve betik DEVAM EDER (ana depo .bin kaybı hariç: durur).
 */
const { execFileSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const arg = (ad) => {
  const i = process.argv.indexOf(ad)
  return i > -1 ? process.argv[i + 1] : null
}
const bayrak = (ad) => process.argv.includes(ad)
const norm = (y) => path.resolve(String(y)).replace(/\\/g, '/').toLowerCase()

const LISTE = arg('--liste')
const ILK = Number(arg('--ilk') || 0)
const KAYIT = arg('--kayit')
const GERCEK = bayrak('--gercek') && bayrak('--geri-alinamaz-onayladim')
if (!LISTE) {
  console.error('kullanım: --liste <silinecek.json> [--ilk N] [--kayit dosya.jsonl] [--gercek --geri-alinamaz-onayladim]')
  process.exit(2)
}
if (bayrak('--gercek') && !GERCEK) {
  console.error('--gercek için --geri-alinamaz-onayladim de gerekir; kuru koşuma düşülmedi, durdu.')
  process.exit(2)
}

const git = (cwd, args, t = 120000) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: t, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }).trim()

const ana = path.dirname(git(process.cwd(), ['rev-parse', '--path-format=absolute', '--git-common-dir']))
const anaN = norm(ana)
const anaBin = path.join(ana, 'node_modules', '.bin')
const anaBinVardi = fs.existsSync(anaBin)

// Açık pencerelerin çalışma dizinleri (canlı kopya dokunulmaz)
let canli = []
try {
  const r = spawnSync('claude', ['agents', '--json'], { encoding: 'utf8', timeout: 30000, windowsHide: true, shell: true })
  canli = JSON.parse(r.stdout || '[]').map((p) => norm(p.cwd))
} catch {
  canli = null
}
if (canli === null || (canli.length === 0 && GERCEK)) {
  console.error('canlı pencere listesi ölçülemedi ya da boş; gerçek silme için güvenli değil, durdu.')
  process.exit(3)
}
canli.push(norm(process.cwd()))

const kayitliAgaclar = {}
for (const s of git(ana, ['worktree', 'list', '--porcelain']).split(/\r?\n/)) {
  if (s.startsWith('worktree ')) kayitliAgaclar[norm(s.slice(9))] = { kilitli: false }
}
let sonYol = null
for (const s of git(ana, ['worktree', 'list', '--porcelain']).split(/\r?\n/)) {
  if (s.startsWith('worktree ')) sonYol = norm(s.slice(9))
  else if (s.startsWith('locked') && sonYol) kayitliAgaclar[sonYol].kilitli = true
}

/** Kök ve node_modules üst düzeyinde, hedefi kopyanın DIŞINA düşen bağlantılar. */
function disaBaglantilar(yol) {
  const kok = norm(yol) + '/'
  const bul = []
  const tara = (dizin) => {
    let ad
    try {
      ad = fs.readdirSync(dizin)
    } catch {
      return
    }
    for (const a of ad) {
      const p = path.join(dizin, a)
      let st
      try {
        st = fs.lstatSync(p)
      } catch {
        continue
      }
      if (!st.isSymbolicLink()) continue
      let hedef
      try {
        hedef = fs.realpathSync(p)
      } catch {
        hedef = null // kırık bağlantı: dışa gitmez ama git'in takılmaması için kaldırılır
      }
      if (hedef === null || !(norm(hedef) + '/').startsWith(kok)) bul.push({ yol: p, hedef })
    }
  }
  tara(yol)
  // node_modules'ün KENDİSİ bağlantıysa (19 Ekim: vh-arac-87 → ana depo node_modules) içine GİRİLMEZ; yalnız o bağlantı
  // kaldırılır. Girilirse altındaki yollar hedefteki (ana depo) dosyalara çözülür ve yanlış nesne kaldırılır.
  const nmYol = path.join(yol, 'node_modules')
  let nmBaglanti = false
  try {
    nmBaglanti = fs.lstatSync(nmYol).isSymbolicLink()
  } catch {
    /* yok */
  }
  if (!nmBaglanti) tara(nmYol)
  return bul
}

const liste = JSON.parse(fs.readFileSync(LISTE, 'utf8'))
const hedefler = ILK > 0 ? liste.slice(0, ILK) : liste
const sayac = { silindi: 0, atlandi: 0, hata: 0, kuru: 0 }
const kayitYaz = (o) => {
  if (KAYIT) fs.appendFileSync(KAYIT, JSON.stringify({ t: new Date().toISOString(), gercek: GERCEK, ...o }) + '\n')
}
console.log(`${GERCEK ? 'GERÇEK SİLME' : 'KURU KOŞUM'} · ${hedefler.length} kopya · ana depo ${ana}`)

for (const h of hedefler) {
  const yol = path.resolve(h.yol)
  const yn = norm(yol)
  const atla = (sebep) => {
    sayac.atlandi++
    console.log(`ATLA  ${h.yol} — ${sebep}`)
    kayitYaz({ yol: h.yol, sonuc: 'atlandi', sebep })
  }
  if (yn === anaN) { atla('ana depo'); continue }
  if (canli.some((c) => c === yn || c.startsWith(yn + '/'))) { atla('açık pencere bu kopyada'); continue }
  if (!kayitliAgaclar[yn]) { atla('git worktree list kaydı yok'); continue }
  if (kayitliAgaclar[yn].kilitli) { atla('kilitli'); continue }
  if (!fs.existsSync(yol)) { atla('klasör yok'); continue }
  try {
    const durum = git(yol, ['status', '--porcelain'], 180000)
    if (durum) { atla('kayıtsız değişiklik var'); continue }
    const head = git(yol, ['rev-parse', 'HEAD'])
    if (h.head && head !== h.head) { atla('HEAD listeden sonra değişmiş'); continue }
    const uzaktaOlmayan = Number(git(yol, ['rev-list', '--count', 'HEAD', '--not', '--remotes']))
    if (uzaktaOlmayan > 0) { atla(`uzakta olmayan ${uzaktaOlmayan} commit`); continue }
    const baglantilar = disaBaglantilar(yol)
    if (!GERCEK) {
      sayac.kuru++
      console.log(`KURU  ${h.yol} · dal ${h.dal} · ${head.slice(0, 9)} · dışa bağlantı ${baglantilar.length}${baglantilar.length ? ' (önce yalnız bağlantı kaldırılacak: ' + baglantilar.map((b) => path.basename(b.yol)).join(', ') + ')' : ''}`)
      kayitYaz({ yol: h.yol, sonuc: 'kuru', dal: h.dal, head, disaBaglanti: baglantilar.length })
      continue
    }
    for (const b of baglantilar) {
      const r = spawnSync('cmd', ['/c', 'rmdir', b.yol], { encoding: 'utf8', windowsHide: true })
      kayitYaz({ yol: h.yol, adim: 'baglanti-kaldir', baglanti: b.yol, hedef: b.hedef, cikis: r.status })
      if (r.status !== 0) throw new Error('bağlantı kaldırılamadı: ' + b.yol)
    }
    if (anaBinVardi && !fs.existsSync(anaBin)) throw new Error('ANA DEPO node_modules/.bin KAYBOLDU — durduruldu')
    git(ana, ['worktree', 'remove', '--force', yol], 30 * 60 * 1000)
    if (anaBinVardi && !fs.existsSync(anaBin)) {
      console.error('ANA DEPO node_modules/.bin silme sonrası kayboldu — DURDU. Onarım: pnpm install (ana depo).')
      kayitYaz({ yol: h.yol, sonuc: 'ANA-DEPO-BIN-KAYIP' })
      process.exit(4)
    }
    sayac.silindi++
    console.log(`SİLİNDİ ${h.yol} (dal ${h.dal} duruyor; geri alma: git worktree add <yol> ${h.dal})`)
    kayitYaz({ yol: h.yol, sonuc: 'silindi', dal: h.dal, head })
  } catch (e) {
    sayac.hata++
    console.log(`HATA  ${h.yol} — ${String(e.message || e).split('\n')[0]}`)
    kayitYaz({ yol: h.yol, sonuc: 'hata', hata: String(e.message || e).split('\n')[0] })
    if (/ANA DEPO/.test(String(e.message))) process.exit(4)
  }
}
if (GERCEK) {
  try {
    git(ana, ['worktree', 'prune'])
    console.log('git worktree prune tamam')
  } catch (e) {
    console.log('prune hatası: ' + String(e.message).split('\n')[0])
  }
}
console.log(JSON.stringify(sayac))
