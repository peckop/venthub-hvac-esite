#!/usr/bin/env node
/**
 * SKILL ATIF KAPISI (ARC-305, OPS 13 Kasım, YENETEK öz-değerlendirme önerisi 3): SKILL.md içinde geçen
 * `scripts/` yolları git ls-files'ta gerçekten var mı diye TAM YOL eşleşmesiyle bakar.
 *
 * NİÇİN: YTN-52 (8 Kasım) "kopuk atıf" alarmı yanlıştı: `.claude/skills/diff-review/scripts/x.py` içinden yalnız
 * `scripts/x.py` kısa adı çekilip kök dizinde aranmıştı. Burada jeton bütün yol olarak alınır; kısa ad eşleşmesi yok.
 *
 * KURAL: jeton = boşluk/tırnak/ters tırnak/parantez/| ile sınırlı yol benzeri dizge, içinde `scripts/` parçası olan.
 * Kontrol edilen aday yollar: jetonun kendisi (depo kökünden), skill klasörüne göreli ve skills/ üst klasörüne (.claude/.agent) göreli hali. Biri ls-files'ta dosya
 * ya da klasör öneki olarak varsa atıf sağlamdır. Joker (*), şablon (<..>, {..}, ${..}), `...` içeren jeton atlanır.
 *
 * KULLANIM: node scripts/arac/skill-atif-kapisi.cjs  → çıkış 1 = kopuk atıf (dosya:satır kopuk: yol), 0 = temiz.
 * FAIL-OPEN: git yok / liste okunamadı → uyarı, çıkış 0 (kontrol yapılmadı).
 * shortcut: yalnız .claude/skills ve .agent/skills altındaki SKILL.md; yan dosyalar (instructions/*.md) taranmaz, gerekirse genişlet.
 */
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const JETON = /[^\s`'"()<>|,;[\]]*scripts\/[^\s`'"()<>|,;[\]]*/g
const ATLA = /[*{}$]|\.\.\./

function temizle(j) {
  return j.replace(/[.:]+$/, '').replace(/^\.\//, '')
}

/** SKILL.md metninden [{no, yol}] atıfları. Jeton `scripts/` içermeyen önekleri de taşır (tam yol karşılaştırması için). */
function atiflar(metin) {
  const sonuc = []
  String(metin).split('\n').forEach((satir, i) => {
    for (const eslesme of satir.matchAll(JETON)) {
      const yol = temizle(eslesme[0])
      if (!yol.includes('scripts/') || ATLA.test(yol)) continue
      sonuc.push({ no: i + 1, yol })
    }
  })
  return sonuc
}

/** Atıf sağlam mı: tam yol (kökten ya da skill klasörüne göreli) dosya ya da klasör olarak izlenen dosyalarda var. */
function var_mi(yol, skillKlasoru, izlenen) {
  const adaylar = [yol, path.posix.join(skillKlasoru, yol), path.posix.join(path.posix.dirname(path.posix.dirname(skillKlasoru)), yol)]
  return adaylar.some((a) => {
    const duz = a.replace(/\/+$/, '')
    return izlenen.has(duz) || [...izlenen].some((f) => f.startsWith(duz + '/'))
  })
}

function kopuklar(skillDosyasi, metin, izlenen) {
  const klasor = path.posix.dirname(skillDosyasi)
  return atiflar(metin)
    .filter((a) => !var_mi(a.yol, klasor, izlenen))
    .map((a) => ({ dosya: skillDosyasi, no: a.no, yol: a.yol }))
}

function calistir(kok = process.cwd(), git = (a) => execFileSync('git', a, { cwd: kok, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true })) {
  let liste
  try {
    liste = git(['ls-files']).split('\n').filter(Boolean)
  } catch (hata) {
    return { kod: 0, mesaj: `[skill-atif] UYARI: git ls-files okunamadı (${(hata && (hata.code || hata.message)) || 'bilinmeyen'}); kontrol YAPILMADI.` }
  }
  const izlenen = new Set(liste)
  const skiller = liste.filter((f) => /^\.(claude|agent)\/skills\/[^/]+\/SKILL\.md$/.test(f))
  const bulunan = []
  for (const s of skiller) {
    let metin
    try {
      metin = fs.readFileSync(path.join(kok, s), 'utf8')
    } catch {
      continue // listede olup diskte olmayan (silinmiş, henüz commit edilmemiş) dosya
    }
    bulunan.push(...kopuklar(s, metin, izlenen))
  }
  if (bulunan.length === 0) return { kod: 0, mesaj: '' }
  const satirlar = bulunan.map((b) => `${b.dosya}:${b.no} kopuk: ${b.yol}`)
  return { kod: 1, mesaj: `[skill-atif] ${bulunan.length} kopuk scripts/ atıfı (git ls-files'ta tam yol karşılığı yok):\n${satirlar.join('\n')}` }
}

module.exports = { atiflar, var_mi, kopuklar, calistir }

if (require.main === module) {
  const { kod, mesaj } = calistir()
  if (mesaj) process.stderr.write(mesaj + '\n')
  process.exit(kod)
}
