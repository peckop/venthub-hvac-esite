#!/usr/bin/env node
/**
 * SKILL LISTESI KESIN SAYIMI (REC-519, 2026-10-01) — bir pencerede kac skill ACIKLAMASIZ gorunuyor?
 *
 * NICIN: skill listesi bir bute ile kirpilir; kirpilan skill yalniz ADIYLA gorunur ve yonlendirme onu
 * secemez. "Modele sor, kendi listesini saysin" yolu YANLIS cikti (Sonnet icin "3 adsiz" dedi, gercek 43;
 * Haiku icin 109-116 dedi, gercek 129). Kesin yol: oturum dokumundeki `skill_listing` eki satir satir sayilir.
 *
 * KULLANIM (ELLE; zamanlayici/cron YOK — karar 53)
 *   node scripts/hijyen/skill-listesi-say.cjs --model claude-haiku-4-5-20251001
 *   node scripts/hijyen/skill-listesi-say.cjs --model claude-sonnet-5-5 --depo <yol>   # depo = proje skill'lerinin kokte oldugu dizin
 *   node scripts/hijyen/skill-listesi-say.cjs --dokum <jsonl> [--depo <yol>]            # hazir dokumu say, claude CAGIRMAZ
 *
 * ⚠ BEDEL: --model verilirse bir `claude -p` turu (kucuk, ~1 istek) kosar ve ~/.claude/projects/<dizin>/<sid>.jsonl
 *   uretir. Betik YALNIZ KENDI URETTIGI bu dokumu siler (baska dosyaya dokunmaz). Giris noktasi `sdk-cli`
 *   (Desktop oturum listesinde gorunmez).
 * ⚠ SINIR: sayilan, BU makinenin BU anki listesidir (eklentiler, kullanici skill'leri dahil); proje skill'leri
 *   `<depo>/.claude/skills/*` adlarindan taninir.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const crypto = require('node:crypto')

/** `- ad: aciklama` aciklamali; `- ad` (iki nokta ustu yok) adsiz. Ad icinde `:` olabilir (eklenti:skill). */
function satirAciklamali(satir) {
  const govde = satir.slice(2)
  // eklenti on eki `a:b` icerir; aciklama ayraci ": " (iki nokta + bosluk)
  return /: /.test(govde)
}

function adOku(satir) {
  const govde = satir.slice(2)
  const i = govde.indexOf(': ')
  return (i === -1 ? govde : govde.slice(0, i)).trim()
}

/** Saf islev: skill_listing metni + proje skill adlari -> sayilar. */
function say(listingMetni, projeAdlari) {
  const satirlar = String(listingMetni)
    .split('\n')
    .filter((s) => s.startsWith('- '))
  const adsiz = satirlar.filter((s) => !satirAciklamali(s))
  const proje = new Set(projeAdlari)
  const projeSatirlari = satirlar.filter((s) => proje.has(adOku(s)))
  return {
    toplam: satirlar.length,
    adsiz: adsiz.length,
    proje: projeSatirlari.length,
    projeToplam: proje.size,
    projeAdsiz: projeSatirlari.filter((s) => !satirAciklamali(s)).length,
  }
}

/** Dokum jsonl metninden ILK `skill_listing` ekinin icerigini cikarir; yoksa null. */
function listingCikar(jsonlMetni) {
  for (const satir of jsonlMetni.split('\n')) {
    if (!satir) continue
    try {
      const o = JSON.parse(satir)
      const a = o.attachment || o
      if (a && a.type === 'skill_listing' && typeof a.content === 'string') return a.content
    } catch {
      /* bozuk satir: atla */
    }
  }
  return null
}

function projeAdlari(depo) {
  const dizin = path.join(depo, '.claude', 'skills')
  return fs.readdirSync(dizin).filter((n) => !n.startsWith('_') && fs.existsSync(path.join(dizin, n, 'SKILL.md')))
}

function arg(ad) {
  const i = process.argv.indexOf(ad)
  return i === -1 ? null : process.argv[i + 1]
}

function main() {
  const depo = path.resolve(arg('--depo') || process.cwd())
  const hazirDokum = arg('--dokum')
  const model = arg('--model')
  if (!hazirDokum && !model) {
    console.error('KULLANIM: --model <ad> | --dokum <jsonl>  [--depo <yol>]')
    process.exit(2)
  }
  let dokum = hazirDokum
  let kendiUrettigi = null
  if (!dokum) {
    const sid = crypto.randomUUID()
    const r = spawnSync('claude', ['-p', '--model', model, '--session-id', sid], {
      cwd: depo,
      input: 'tamam de',
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: 'sdk-cli' },
      timeout: 180000,
      shell: process.platform === 'win32',
    })
    const kok = path.join(os.homedir(), '.claude', 'projects')
    for (const d of fs.readdirSync(kok)) {
      const aday = path.join(kok, d, `${sid}.jsonl`)
      if (fs.existsSync(aday)) kendiUrettigi = aday
    }
    if (!kendiUrettigi) {
      console.error(`OLCULEMEDI: dokum bulunamadi (claude cikis ${r.status}). ${String(r.stderr || '').slice(0, 200)}`)
      process.exit(1)
    }
    dokum = kendiUrettigi
  }
  const listing = listingCikar(fs.readFileSync(dokum, 'utf8'))
  if (kendiUrettigi) fs.unlinkSync(kendiUrettigi) // yalniz kendi urettigi dosya
  if (!listing) {
    console.error('OLCULEMEDI: dokumde skill_listing eki yok')
    process.exit(1)
  }
  const s = say(listing, projeAdlari(depo))
  console.log(
    `model=${model || '(hazir dokum)'} TOPLAM ${s.toplam} | ADSIZ ${s.adsiz} | PROJE ${s.proje}/${s.projeToplam} | PROJE ADSIZ ${s.projeAdsiz}`,
  )
}

module.exports = { say, listingCikar, satirAciklamali, adOku }
if (require.main === module) main()
