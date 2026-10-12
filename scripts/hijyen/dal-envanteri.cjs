#!/usr/bin/env node
'use strict'

/**
 * dal-envanteri.cjs — uzak dal envanteri (ALT-62, OPS-104 K-488). SALT OKUMA.
 *
 * NE YAPAR: `origin` üzerindeki canlı dal başlarını (git ls-remote) ve GitHub PR kayıtlarını
 * (gh pr list) birleştirip her dalı TEK sınıfa koyar; sınıf toplamı canlı dal sayısına
 * (master hariç) eşitse ölçüm tutarlıdır:
 *
 *   ACIK_PR               en az bir AÇIK PR bu dalın adını taşır
 *   BIRLESMIS_UC_ESLESIR  birleşmiş PR var ve PR'ın uç SHA'sı dalın ucuyla BİREBİR aynı
 *   BIRLESMIS_UC_FARKLI   birleşmiş PR var ama dalın ucu PR'dan sonra ilerlemiş (içerik taşıyabilir)
 *   PRSIZ                 açık ya da birleşmiş PR yok (kapatılmış-birleşmemiş PR'lar `kapaliPr` ile işaretlenir)
 *
 * Üstüne iki bilgi biner (sınıfı değiştirmez): `masterAtasi` (uç master'ın atası mı; nesne yerelde
 * yoksa null) ve `--migration` ile supabase/migrations'a dosya EKLEYEN dallar.
 *
 * NE YAPMAZ: dal silmez, itme yapmaz, fetch yapmaz, hiçbir şeyi yazmaz. Silme kararı OPS'tur.
 *
 * KULLANIM:
 *   node scripts/hijyen/dal-envanteri.cjs                  özet (insan okur)
 *   node scripts/hijyen/dal-envanteri.cjs --json           tüm satırlar JSON
 *   node scripts/hijyen/dal-envanteri.cjs --liste PRSIZ    o sınıftaki dal adları
 *   node scripts/hijyen/dal-envanteri.cjs --migration      migration ekleyen, master'ın atası olmayan dallar
 *   --depo <sahip/ad>   PR kaynağı (varsayılan peckop/venthub-hvac-esite)
 *   --uzak <ad>         git uzak adı (varsayılan origin)
 *
 * ÇIKIŞ: 0 tutarlı · 2 sınıf toplamı dal sayısına eşit değil (ölçüm şüpheli) · 1 araç hatası.
 * CETVEL: docs/standards/collaboration-protocol.md (bir-iş-bir-dal) · kart ALT-62.
 */

const { execFileSync } = require('node:child_process')

const VARSAYILAN_DEPO = 'peckop/venthub-hvac-esite'
const SINIFLAR = ['ACIK_PR', 'BIRLESMIS_UC_ESLESIR', 'BIRLESMIS_UC_FARKLI', 'PRSIZ']

/** `git ls-remote --heads` çıktısını [{ ad, sha }] listesine çevirir. */
function lsRemoteAyristir(metin) {
  const cikti = []
  for (const satir of String(metin).split(/\r?\n/)) {
    const m = /^([0-9a-f]{40})\s+refs\/heads\/(.+)$/.exec(satir.trim())
    if (m) cikti.push({ ad: m[2], sha: m[1] })
  }
  return cikti
}

/**
 * Saf sınıflayıcı (ağ ve git çağırmaz; test edilebilir).
 * @param {{ad:string, sha:string}[]} dallar
 * @param {{number:number, state:string, headRefName:string, headRefOid?:string, isCrossRepository?:boolean}[]} prler
 * @param {{ master?:string, atasi?:(sha:string)=>(boolean|null) }} [secenek]
 */
function dallariSinifla(dallar, prler, secenek = {}) {
  const master = secenek.master || 'master'
  const atasi = secenek.atasi || (() => null)

  /** @type {Map<string, any[]>} */
  const prAda = new Map()
  for (const pr of prler) {
    if (!pr || pr.isCrossRepository) continue // fork PR'ı aynı adı taşısa da bu dalın PR'ı değildir
    if (!prAda.has(pr.headRefName)) prAda.set(pr.headRefName, [])
    prAda.get(pr.headRefName).push(pr)
  }

  const satirlar = []
  for (const dal of dallar) {
    if (dal.ad === master) continue
    const kayitlar = prAda.get(dal.ad) || []
    const acik = kayitlar.filter((p) => p.state === 'OPEN')
    const birlesmis = kayitlar.filter((p) => p.state === 'MERGED')
    const kapali = kayitlar.filter((p) => p.state === 'CLOSED')

    let sinif
    let prNo = null
    if (acik.length > 0) {
      sinif = 'ACIK_PR'
      prNo = acik[0].number
    } else if (birlesmis.some((p) => p.headRefOid === dal.sha)) {
      sinif = 'BIRLESMIS_UC_ESLESIR'
      prNo = birlesmis.find((p) => p.headRefOid === dal.sha).number
    } else if (birlesmis.length > 0) {
      sinif = 'BIRLESMIS_UC_FARKLI'
      prNo = birlesmis[birlesmis.length - 1].number
    } else {
      sinif = 'PRSIZ'
    }
    satirlar.push({
      ad: dal.ad,
      sha: dal.sha,
      sinif,
      prNo,
      kapaliPr: sinif === 'PRSIZ' && kapali.length > 0,
      masterAtasi: atasi(dal.sha),
    })
  }

  const sayim = Object.fromEntries(SINIFLAR.map((s) => [s, 0]))
  for (const s of satirlar) sayim[s.sinif] += 1
  const toplam = satirlar.length
  const sinifToplami = SINIFLAR.reduce((a, s) => a + sayim[s], 0)
  return { satirlar, sayim, toplam, tutarli: sinifToplami === toplam }
}

function git(args, secenek = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], ...secenek })
}

function nesneVar(sha) {
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function masterAtasiMi(sha, masterRef) {
  if (!nesneVar(sha)) return null
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', sha, masterRef], { stdio: 'ignore' })
    return true
  } catch (e) {
    return e && e.status === 1 ? false : null
  }
}

function migrationEkleyenler(satirlar, masterRef) {
  const sonuc = []
  let nesneYok = 0
  for (const s of satirlar) {
    if (s.masterAtasi === true) continue
    if (!nesneVar(s.sha)) {
      nesneYok += 1
      continue
    }
    let dosyalar = ''
    try {
      dosyalar = git(['diff', '--name-only', '--diff-filter=A', `${masterRef}...${s.sha}`, '--', 'supabase/migrations'])
    } catch {
      continue
    }
    const liste = dosyalar.split(/\r?\n/).filter((x) => x.endsWith('.sql'))
    if (liste.length > 0) sonuc.push({ ad: s.ad, sha: s.sha, sinif: s.sinif, dosyalar: liste })
  }
  return { sonuc, nesneYok }
}

function bayrak(argv, ad) {
  const i = argv.indexOf(ad)
  return i === -1 ? null : argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[i + 1]
}

function main(argv) {
  const uzak = bayrak(argv, '--uzak') || 'origin'
  const depo = bayrak(argv, '--depo') || VARSAYILAN_DEPO
  const jsonCikti = argv.includes('--json')
  const liste = bayrak(argv, '--liste')
  const migration = argv.includes('--migration')

  let dallar
  try {
    dallar = lsRemoteAyristir(git(['ls-remote', '--heads', uzak]))
  } catch (e) {
    process.stderr.write(`dal-envanteri: git ls-remote başarısız: ${e.message}\n`)
    return 1
  }

  let prler
  try {
    const ham = execFileSync(
      'gh',
      ['pr', 'list', '--repo', depo, '--state', 'all', '--limit', '5000', '--json', 'number,state,headRefName,headRefOid,isCrossRepository'],
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    prler = JSON.parse(ham)
  } catch (e) {
    process.stderr.write(`dal-envanteri: gh pr list başarısız: ${e.message}\n`)
    return 1
  }

  const masterBas = dallar.find((d) => d.ad === 'master')
  const masterRef = masterBas && nesneVar(masterBas.sha) ? masterBas.sha : `${uzak}/master`
  const sonuc = dallariSinifla(dallar, prler, { atasi: (sha) => masterAtasiMi(sha, masterRef) })

  if (liste) {
    const secilen = sonuc.satirlar.filter((s) => s.sinif === liste).map((s) => s.ad)
    process.stdout.write(secilen.join('\n') + (secilen.length ? '\n' : ''))
    return sonuc.tutarli ? 0 : 2
  }

  const mig = migration ? migrationEkleyenler(sonuc.satirlar, masterRef) : null

  if (jsonCikti) {
    process.stdout.write(JSON.stringify({ ...sonuc, migration: mig }, null, 2) + '\n')
    return sonuc.tutarli ? 0 : 2
  }

  const atasi = sonuc.satirlar.filter((s) => s.masterAtasi === true).length
  const atasiBilinmeyen = sonuc.satirlar.filter((s) => s.masterAtasi === null).length
  const kapaliPr = sonuc.satirlar.filter((s) => s.kapaliPr).length
  const satirlar = [
    `uzak dal (master hariç): ${sonuc.toplam}  [git ls-remote --heads ${uzak} → ${dallar.length} baş]`,
    ...SINIFLAR.map((s) => `  ${s.padEnd(22)} ${String(sonuc.sayim[s]).padStart(5)}`),
    `  ${'-'.repeat(28)}`,
    `  sınıf toplamı          ${String(SINIFLAR.reduce((a, s) => a + sonuc.sayim[s], 0)).padStart(5)}  → ${sonuc.tutarli ? 'TUTARLI' : 'TUTARSIZ (ölçüm şüpheli)'}`,
    `  üst bilgi: master'ın atası ${atasi} · ata durumu bilinmeyen (nesne yerelde yok) ${atasiBilinmeyen} · PRSIZ içinde kapatılmış PR'lı ${kapaliPr}`,
  ]
  if (mig) {
    satirlar.push(`  migration ekleyen, master'ın atası olmayan dal: ${mig.sonuc.length} (nesnesi yerelde olmayan atlandı: ${mig.nesneYok})`)
    for (const m of mig.sonuc) satirlar.push(`    ${m.ad}  [${m.sinif}]  ${m.dosyalar.join(', ')}`)
  } else {
    satirlar.push('  migration ekleyen dallar için: --migration')
  }
  process.stdout.write(satirlar.join('\n') + '\n')
  return sonuc.tutarli ? 0 : 2
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2))
}

module.exports = { lsRemoteAyristir, dallariSinifla, SINIFLAR }
