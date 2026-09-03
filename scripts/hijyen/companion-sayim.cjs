'use strict'
/**
 * COMPANION SAYIMI — TEK KAYNAK (§26).
 *
 * NİÇİN AYRI MODÜL: aynı sayı iki yerde gösterilecek (conformance kolu + `board.cjs yoklama`).
 * İki yere iki ayrı sayım yazmak §26'nın yasakladığı şeydir: kullanıcıya görünen metin
 * ölçütün adını TEKRAR ETMEZ, ondan ÜRETİLİR. İki kopya zamanla ayrışır ve hangisinin
 * doğru olduğu belirsizleşir — o an rapor bir ölçüm değil, bir iddia olur.
 *
 * KAPSAM SSOT'U `.cc_docs.yaml`'dır, bu dosya DEĞİL. Bekçi kendi dosya listesini uydurmaz
 * (companion-doc-standard §C5): ilk ölçümde `.agent/` altı sayılmış ve sonuç 84/211 çıkmıştı,
 * oysa `.agent` yaml'da `skip_dirs` içindeydi. Üreticiden farklı kapsam ölçen bekçinin
 * ölçtüğü şey gerçek değildir.
 */

const { execFileSync } = require('child_process')

const KAYNAK_UZANTILARI = ['.ts', '.tsx', '.mjs', '.cjs']

/**
 * EŞİKLER BURADA DURUR, ÇAĞIRANDA DEĞİL (§26).
 *
 * Conformance kolu da `board.cjs` de bu değerleri BURADAN okur. Eşiği iki yere yazmak,
 * düzeltmeye çalıştığımız kusurun ta kendisidir: iki kopya ayrışır ve hangisinin hüküm
 * olduğu belirsizleşir.
 */
const YAS_ESIGI_GUN = 7

/**
 * Kapı kapsamı bu tarihten SONRA dokunulmuş kaynaklardır; öncesi TARİHSEL borçtur
 * (kapsam dışı ama görünür tutulur — `companion-parity-coverage.test.ts` onu basar).
 */
const KAPI_BASLANGIC = '2026-08-18'

function git(args, kok) {
  return execFileSync('git', kok ? ['-C', kok, ...args] : args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

function izlenenDosyalar(kok) {
  return git(['ls-files'], kok).split('\n').map((s) => s.trim()).filter(Boolean)
}

/**
 * Her izlenen dosyanın EN YENİ commit tarihi, TEK geçişte.
 * Dosya başına `git log -1` 600+ süreç doğurur (ölçüldü: 2 dakikada bitmedi).
 */
function sonCommitTarihleri(kok) {
  const ham = git(['log', '--format=@%cs', '--name-only', '--no-renames'], kok)
  const harita = new Map()
  let simdiki = null
  for (const satir of ham.split('\n')) {
    const s = satir.replace(/\r$/, '')
    if (s.startsWith('@')) simdiki = s.slice(1)
    else if (s.trim() && simdiki && !harita.has(s)) harita.set(s, simdiki)
  }
  return harita
}

/** `.cc_docs.yaml` — kapsamın SSOT'u. HEAD'den okunur (disk değil): ikize giden depo hâlidir. */
function yamlKapsamiOku(kok) {
  const metin = git(['show', 'HEAD:.cc_docs.yaml'], kok)
  const liste = (anahtar) => {
    const m = new RegExp(`^${anahtar}:\\s*\\[([^\\]]*)\\]`, 'm').exec(metin)
    if (!m) return []
    return m[1].split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
  }
  const sourceDirs = liste('source_dirs')
  const extraKokler = [...metin.matchAll(/source_dirs:\s*"([^"]+)"/g)].map((m) => m[1])
  return {
    koklerRecursive: [...sourceDirs.filter((d) => d !== '.'), ...extraKokler],
    skipDirs: new Set(liste('skip_dirs')),
    skipBasenames: new Set(liste('skip_files').map((f) => f.split('/').pop())),
  }
}

function kapsamdaMi(yol, k) {
  if (!KAYNAK_UZANTILARI.some((u) => yol.endsWith(u))) return false
  if (yol.endsWith('.d.ts')) return false
  const parcalar = yol.split('/')
  const ad = parcalar[parcalar.length - 1]
  if (k.skipBasenames.has(ad)) return false
  if (parcalar.slice(0, -1).some((p) => k.skipDirs.has(p))) return false
  if (k.koklerRecursive.some((kkok) => yol.startsWith(`${kkok}/`))) return true
  return !yol.includes('/')
}

function gunFarki(tarihISO, bugun) {
  const t = new Date(`${tarihISO}T00:00:00Z`).getTime()
  if (Number.isNaN(t)) return Number.MAX_SAFE_INTEGER
  return Math.floor((bugun.getTime() - t) / 86400000)
}

/**
 * SAF ÇEKİRDEK — girdileri dışarıdan alır, git'e DOKUNMAZ.
 *
 * NİÇİN SAF: kapı artık BLOKLAMIYOR, SAYIYOR. Bloklamayan bir kolun tek gerçek kanıtı
 * sayımın AYIRT ETTİĞİDİR — companion'sız bir dosya eklendiğinde sayı artmalı. Bunu
 * ancak fikstür verilebilen saf bir fonksiyonda kanıtlayabilirsin; git okuyan bir
 * fonksiyona fikstür veremezsin, o hâlde kanıt da veremezsin.
 */
function sayimCekirdegi({ izlenen, kapsam, tarihler, bugun, yasEsigiGun, kapiBaslangici }) {
  const mdSet = new Set(izlenen.filter((f) => f.endsWith('.md')))
  const kaynaklar = izlenen.filter((f) => kapsamdaMi(f, kapsam))

  const eksik = []
  const bayat = []
  const tarihselEksik = []
  const tarihselBayat = []
  let kapidakiKaynak = 0
  let eksikTaze = 0
  let bayatTaze = 0

  for (const kaynak of kaynaklar) {
    const companion = `${kaynak.replace(/\.[^./]+$/, '')}.md`
    const kaynakTarih = tarihler.get(kaynak) ?? ''
    const yas = kaynakTarih ? gunFarki(kaynakTarih, bugun) : Number.MAX_SAFE_INTEGER
    const kapidaMi = kaynakTarih >= kapiBaslangici
    if (kapidaMi) kapidakiKaynak++

    if (!mdSet.has(companion)) {
      if (yas <= yasEsigiGun) eksikTaze++
      else if (kapidaMi) eksik.push({ yol: kaynak, yasGun: yas })
      else tarihselEksik.push(kaynak)
      continue
    }
    const companionTarih = tarihler.get(companion) ?? ''
    if (kaynakTarih && companionTarih && kaynakTarih > companionTarih) {
      if (yas <= yasEsigiGun) bayatTaze++
      else if (kapidaMi) bayat.push(companion)
      else tarihselBayat.push(companion)
    }
  }

  eksik.sort((a, b) => b.yasGun - a.yasGun)
  return {
    kaynakSayisi: kaynaklar.length,
    eksik,
    bayat,
    eksikTaze,
    bayatTaze,
    tarihselEksik,
    tarihselBayat,
    kapidakiKaynak,
    enEskiYasGun: eksik.length ? eksik[0].yasGun : 0,
  }
}

/** Depoyu okuyup çekirdeği besler. */
function olc({ kok, bugun, yasEsigiGun, kapiBaslangici } = {}) {
  return sayimCekirdegi({
    izlenen: izlenenDosyalar(kok),
    kapsam: yamlKapsamiOku(kok),
    tarihler: sonCommitTarihleri(kok),
    bugun: bugun ?? new Date(),
    yasEsigiGun: yasEsigiGun ?? YAS_ESIGI_GUN,
    kapiBaslangici: kapiBaslangici ?? KAPI_BASLANGIC,
  })
}

/**
 * TEK SATIRLIK ÖZET — `board.cjs yoklama` ve conformance kolu AYNI cümleyi buradan alır.
 * Metin burada üretilir; iki çağıran da onu tekrar YAZMAZ (§26).
 */
function ozetSatiri(b) {
  if (!b.eksik.length) return 'companion: eksik YOK (kapı kapsamında)'
  return (
    `companion'siz ${b.eksik.length} dosya, en eskisi ${b.enEskiYasGun} gun — ` +
    `BLOKLAMAZ, SAYAR (Recep karari 2026-08-31: uretici tasiyici KAPALI)`
  )
}

module.exports = {
  olc,
  sayimCekirdegi,
  ozetSatiri,
  kapsamdaMi,
  gunFarki,
  KAYNAK_UZANTILARI,
  YAS_ESIGI_GUN,
  KAPI_BASLANGIC,
}

if (require.main === module) {
  const b = olc()
  process.stdout.write(ozetSatiri(b) + '\n')
  for (const e of b.eksik) process.stdout.write(`  ${String(e.yasGun).padStart(5)} gun  ${e.yol}\n`)
}
