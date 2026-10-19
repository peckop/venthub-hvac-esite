#!/usr/bin/env node
'use strict'
/**
 * WORKTREE ARTIK SİL — ARC-132 / OPS-179 (karar 364, 397; cetvel karar 88). Windows.
 *
 * ── NİÇİN ──
 * `tools/worktree-temizle.cjs` 19 Ekim koşumunda 165 kopyadan 33'ünü sildi, 129'unda `git worktree remove --force`
 * git KAYDINI sildi ama KLASÖRÜ silemedi. Kök sebep (ölçüldü): 129/129 hatalı kopyada node_modules var, 33/33 başarılı
 * kopyada yok. node_modules içinde kopya başına ~3.200 junction (pnpm, Mount Point 0xa0000003); git bu bağlantıları
 * dizin gibi geçip silemiyor. Uzun yol (en uzun 237 karakter) ve salt-okunur dosya YOK. git'in kendi hata metni
 * yutulmuştu; bu betik robocopy çıktısını ve kalan dosyaları kayda yazar.
 *
 * ── ÇÖZÜM (karar 88: junction'dan geçen özyinelemeli silme YASAK) ──
 *   1. Güvenlik: yol izinli kalıpta (C:/tmp/<ad>, <ana>/.claude/worktrees/<ad>, <ev>/vh-wt/<ad>, <ev>/venthub-wt-*, <ev>/venthub-harita-*;
 *      venthub-hvac*, venthub-pdf-ingestor ve diğer depolar REDDEDİLİR), ana depo/içi değil, açık pencerenin çalışma dizini değil,
 *      git `worktree list`te KAYIT YOK, `.git` DİZİN DEĞİL (dizin = gerçek depo, reddedilir; okunamayan = durur) ve varsa
 *      gitdir hedefi YOK (kayıt gerçekten silinmiş); `.git` hiç yoksa artık klasördür (ölçüm: 22'nin 20'si);
 *   2. derinlik SINIRSIZ tarama: bağlantılara (junction/symlink) GİRİLMEZ; hepsi listelenir, hedefi kopya DIŞINA düşen
 *      ya da çözülemeyenler ayrıca raporlanır (ana depoya düşen vurgulanır);
 *   3. TÜM bağlantılar yalnız bağlantı olarak kaldırılır (`fs.rmdirSync`, Windows'ta RemoveDirectoryW: bağlantının
 *      kendisini siler, hedefe dokunmaz; olmazsa `cmd /c rmdir`, `/s` YOK);
 *   4. bağlantı kalmadığı DOĞRULANINCA içerik robocopy /MIR /XJ ile boş klasöre eşlenerek silinir (uzun yola dayanıklı,
 *      hızlı), sonra boş kök `fs.rmdirSync`; `rmdir /s` ve `rm -rf` kullanılmaz;
 *   5. ana deponun node_modules/.bin'i her kopyadan önce ve sonra doğrulanır; kaybolursa betik DURUR.
 * Varsayılan KURU KOŞUM (hiçbir şeye dokunmaz). Gerçek: `--gercek --geri-alinamaz-onayladim`.
 *
 * KULLANIM: node tools/worktree-artik-sil.cjs --liste <yollar.json> [--ilk N] [--kayit k.jsonl] [--gercek --geri-alinamaz-onayladim]
 * Liste: ["C:/tmp/x", ...] ya da [{ yol }].
 */
const { execFileSync, spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const norm = (y) => path.resolve(String(y)).replace(/\\/g, '/').toLowerCase()

/** Kopyayı tarar; bağlantılara girmez. { girdi, baglantilar:[{yol, hedef|null, disarida}] } */
function tara(kok) {
  const kokN = norm(kok) + '/'
  const baglantilar = []
  let girdi = 0
  const yig = [kok]
  while (yig.length) {
    const d = yig.pop()
    let adlar
    try {
      adlar = fs.readdirSync(d)
    } catch {
      continue
    }
    for (const a of adlar) {
      const p = path.join(d, a)
      let st
      try {
        st = fs.lstatSync(p)
      } catch {
        continue
      }
      girdi++
      if (st.isSymbolicLink()) {
        let hedef = null
        try {
          hedef = fs.realpathSync(p)
        } catch {
          /* kırık bağlantı */
        }
        baglantilar.push({ yol: p, hedef, disarida: hedef === null || !(norm(hedef) + '/').startsWith(kokN) })
        continue
      }
      if (st.isDirectory()) yig.push(p)
    }
  }
  return { girdi, baglantilar }
}

/** Bağlantıyı YALNIZ bağlantı olarak kaldırır. */
function baglantiKaldir(p) {
  try {
    fs.rmdirSync(p)
    return true
  } catch {
    const r = spawnSync('cmd', ['/c', 'rmdir', p], { encoding: 'utf8', windowsHide: true })
    return r.status === 0
  }
}

/** Yol izinli kalıpta mı (ana depo ve ev dizini bağlamında). */
function izinliYolMu(yol, ana, ev) {
  const y = norm(yol)
  const ust = path.posix.dirname(y)
  const ad = path.posix.basename(y)
  if (ust === 'c:/tmp') return true
  if (ust === norm(path.join(ana, '.claude', 'worktrees'))) return true
  if (ust === norm(path.join(ev, 'vh-wt'))) return true
  // Ev dizini altında YALNIZ açık liste: venthub-wt-*, venthub-harita-*. venthub-hvac*, venthub-pdf-ingestor ve
  // diğer gerçek depolar bu kalıba UYMAZ (bağımsız doğrulama 19 Ekim: önceki olumsuz-ileri kalıp kardeş depoları kabul ediyordu).
  return ust === norm(ev) && /^venthub-(wt|harita)-[a-z0-9._-]+$/.test(ad)
}

/**
 * `.git` denetimi. Dönüş: { ok, sebep, artik }.
 *   - `.git` bir DİZİN → gerçek bir depo (ingestor gibi): REDDEDİLİR.
 *   - `.git` okunamıyor (ENOENT dışı hata) ya da gitdir satırı yok → REDDEDİLİR (hata yutulmaz, durulur).
 *   - `.git` dosyası ve gitdir hedefi hâlâ var → git kaydı silinmemiş: REDDEDİLİR.
 *   - `.git` dosyası ve gitdir hedefi YOK → kayıt gerçekten silinmiş: kabul.
 *   - `.git` HİÇ YOK (ENOENT) → kabul, `artik: true`. Ölçüm (19 Ekim): `git worktree remove --force` takılınca önce `.git`
 *     dosyasını siliyor; kalan 22 klasörün 20'sinde `.git` yok. Depo olamaz (depoda `.git` dizini vardır); yine de yol kalıbı
 *     ve git kaydı yok denetimi ayrıca şart.
 */
function gitDosyasiKontrol(yol) {
  const g = path.join(yol, '.git')
  let st
  try {
    st = fs.lstatSync(g)
  } catch (e) {
    if (e && e.code === 'ENOENT') return { ok: true, sebep: '.git yok (artık klasör)', artik: true }
    return { ok: false, sebep: '.git denetlenemedi: ' + String((e && e.code) || e) }
  }
  if (!st.isFile()) return { ok: false, sebep: '.git bir DİZİN: gerçek bir depo, silinmez' }
  let icerik
  try {
    icerik = fs.readFileSync(g, 'utf8')
  } catch (e) {
    return { ok: false, sebep: '.git okunamadı: ' + String((e && e.code) || e) }
  }
  const m = /^gitdir:\s*(.+)$/m.exec(icerik)
  if (!m) return { ok: false, sebep: '.git dosyasında gitdir satırı yok' }
  if (fs.existsSync(m[1].trim())) return { ok: false, sebep: '.git gitdir hedefi hâlâ var (git kaydı silinmemiş)' }
  return { ok: true, sebep: '' }
}

function main() {
  const arg = (ad) => {
    const i = process.argv.indexOf(ad)
    return i > -1 ? process.argv[i + 1] : null
  }
  const LISTE = arg('--liste')
  const ILK = Number(arg('--ilk') || 0)
  const KAYIT = arg('--kayit')
  const GERCEK = process.argv.includes('--gercek') && process.argv.includes('--geri-alinamaz-onayladim')
  if (!LISTE) {
    console.error('kullanım: --liste <yollar.json> [--ilk N] [--kayit k.jsonl] [--gercek --geri-alinamaz-onayladim]')
    process.exit(2)
  }
  if (process.argv.includes('--gercek') && !GERCEK) {
    console.error('--gercek için --geri-alinamaz-onayladim de gerekir; durdu.')
    process.exit(2)
  }
  const git = (cwd, a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }).trim()
  const ana = path.dirname(git(process.cwd(), ['rev-parse', '--path-format=absolute', '--git-common-dir']))
  const anaN = norm(ana)
  const anaBin = path.join(ana, 'node_modules', '.bin')
  const anaBinVardi = fs.existsSync(anaBin)
  if (GERCEK && !anaBinVardi) {
    console.error('ana deponun node_modules/.bin yok: bozulma sonrası doğrulanamaz, gerçek silme için güvenli değil, durdu. (pnpm install)')
    process.exit(5)
  }
  let canli = []
  try {
    canli = JSON.parse(spawnSync('claude', ['agents', '--json'], { encoding: 'utf8', timeout: 30000, windowsHide: true, shell: true }).stdout || '[]').map((p) => norm(p.cwd))
  } catch {
    canli = []
  }
  if (canli.length === 0) {
    console.error('canlı pencere listesi ölçülemedi ya da boş; güvenli değil, durdu.')
    process.exit(3)
  }
  canli.push(norm(process.cwd()))
  const kayitliAgaclar = new Set(
    git(ana, ['worktree', 'list', '--porcelain'])
      .split(/\r?\n/)
      .filter((s) => s.startsWith('worktree '))
      .map((s) => norm(s.slice(9))),
  )
  const liste = JSON.parse(fs.readFileSync(LISTE, 'utf8')).map((x) => (typeof x === 'string' ? x : x.yol))
  const yollar = ILK > 0 ? liste.slice(0, ILK) : liste
  const sayac = { silindi: 0, atlandi: 0, hata: 0, kuru: 0 }
  const kayitYaz = (o) => KAYIT && fs.appendFileSync(KAYIT, JSON.stringify({ t: new Date().toISOString(), gercek: GERCEK, ...o }) + '\n')
  const ev = os.homedir()
  console.log(`${GERCEK ? 'GERÇEK SİLME' : 'KURU KOŞUM'} · ${yollar.length} klasör · ana depo ${ana}`)

  for (const yol of yollar) {
    const yn = norm(yol)
    const atla = (sebep) => {
      sayac.atlandi++
      console.log(`ATLA  ${yol} — ${sebep}`)
      kayitYaz({ yol, sonuc: 'atlandi', sebep })
    }
    try {
      fs.lstatSync(yol)
    } catch {
      atla('klasör yok (zaten silinmiş)')
      continue
    }
    if (yn === anaN || (yn.startsWith(anaN + '/') && !izinliYolMu(yol, ana, ev))) { atla('ana depo ya da içi'); continue }
    if (!izinliYolMu(yol, ana, ev)) { atla('izinli kalıpta değil'); continue }
    if (canli.some((c) => c === yn || c.startsWith(yn + '/'))) { atla('açık pencere bu klasörde'); continue }
    if (kayitliAgaclar.has(yn)) { atla('git worktree kaydı HÂLÂ var (önce worktree-temizle)'); continue }
    const gk = gitDosyasiKontrol(yol)
    if (!gk.ok) { atla(gk.sebep); continue }
    try {
      const kokSt = fs.lstatSync(yol)
      if (kokSt.isSymbolicLink()) {
        // kopyanın kendisi bağlantı: yalnız bağlantıyı kaldır
        if (GERCEK) {
          if (!baglantiKaldir(yol)) throw new Error('kök bağlantı kaldırılamadı')
          sayac.silindi++
          console.log(`SİLİNDİ (kök bağlantı) ${yol}`)
          kayitYaz({ yol, sonuc: 'silindi', not: 'kok-baglanti' })
        } else {
          sayac.kuru++
          console.log(`KURU  ${yol} · KÖK BAĞLANTI → yalnız bağlantı kaldırılacak`)
          kayitYaz({ yol, sonuc: 'kuru', kokBaglanti: true })
        }
        continue
      }
      const { girdi, baglantilar } = tara(yol)
      const disari = baglantilar.filter((b) => b.disarida)
      const anayaDusen = disari.filter((b) => b.hedef && (norm(b.hedef) + '/').startsWith(anaN + '/'))
      if (!GERCEK) {
        sayac.kuru++
        console.log(`KURU  ${yol} · ${girdi} girdi · ${baglantilar.length} bağlantı (dışa ${disari.length}${anayaDusen.length ? `, ANA DEPOYA ${anayaDusen.length}` : ''})`)
        kayitYaz({ yol, sonuc: 'kuru', girdi, baglanti: baglantilar.length, disari: disari.length, anaDepoya: anayaDusen.length })
        continue
      }
      if (anaBinVardi && !fs.existsSync(anaBin)) throw new Error('ANA DEPO node_modules/.bin KAYBOLDU — durduruldu')
      for (const b of baglantilar) {
        if (!baglantiKaldir(b.yol)) throw new Error('bağlantı kaldırılamadı: ' + b.yol)
      }
      kayitYaz({ yol, adim: 'baglantilar-kaldirildi', adet: baglantilar.length, disari: disari.length })
      if (tara(yol).baglantilar.length > 0) throw new Error('bağlantı hâlâ var; özyinelemeli silme YAPILMADI')
      if (anaBinVardi && !fs.existsSync(anaBin)) throw new Error('ANA DEPO node_modules/.bin KAYBOLDU — durduruldu')
      const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-bos-'))
      try {
        const r = spawnSync('robocopy', [bos, yol, '/MIR', '/XJ', '/R:0', '/W:0', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/MT:16'], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 })
        kayitYaz({ yol, adim: 'robocopy', cikis: r.status, ozet: String(r.stdout || '').split(/\r?\n/).filter((s) => /ERROR|Error/.test(s)).slice(0, 5) })
        if (r.status === null || r.status >= 8) throw new Error('robocopy hatası, çıkış ' + r.status)
      } finally {
        fs.rmdirSync(bos)
      }
      fs.rmdirSync(yol)
      if (anaBinVardi && !fs.existsSync(anaBin)) {
        console.error('ANA DEPO node_modules/.bin silme sonrası kayboldu — DURDU. Onarım: pnpm install (ana depo).')
        kayitYaz({ yol, sonuc: 'ANA-DEPO-BIN-KAYIP' })
        process.exit(4)
      }
      sayac.silindi++
      console.log(`SİLİNDİ ${yol} (${baglantilar.length} bağlantı yalnız bağlantı olarak kaldırıldı)`)
      kayitYaz({ yol, sonuc: 'silindi', baglanti: baglantilar.length })
    } catch (e) {
      sayac.hata++
      const m = String((e && e.message) || e).split('\n')[0]
      let kalan = []
      try {
        kalan = fs.readdirSync(yol).slice(0, 5)
      } catch {
        /* klasör gitmiş olabilir */
      }
      console.log(`HATA  ${yol} — ${m}`)
      kayitYaz({ yol, sonuc: 'hata', hata: m, kalanIlk5: kalan })
      if (/ANA DEPO/.test(m)) process.exit(4)
    }
  }
  console.log(JSON.stringify(sayac))
}

module.exports = { tara, baglantiKaldir, izinliYolMu, gitDosyasiKontrol, norm }
if (require.main === module) main()
