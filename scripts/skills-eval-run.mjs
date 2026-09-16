#!/usr/bin/env node
/**
 * SKILL YÖNLENDİRME SINAVINI KOŞAR (REC-303).
 *
 * ÖLÇÜLEN KUSUR: `.claude/skills` 25/36 ve `.agent/skills` 35/35 dizininde `evals/evals.json`
 * var (12 should_trigger / 8 should_not_trigger) ama `skills-evaluator.py` bu sorguları yalnız
 * SAYIYOR — hiçbirini bir yönlendiriciye SORMUYOR. `pnpm skills:verify` de hiçbir workflow
 * dosyasında değildi. Yani 60 dosyalık yatırım kâğıt üstündeydi: yeşil görünen, bakmayan kapı.
 *
 * BU BETİK NE YAPAR: her skill için TEK istek atar — o ağacın tam kataloğu + o skill'in 20
 * sorgusu — ve modelden her sorgu için "hangi skill devreye girmeli" cevabını ister. Puanlama
 * ve eşik `scripts/skills-eval/lib.mjs` içinde SAF olarak durur (testle ölçülür, ağ gerekmez).
 *
 * ⭐NİÇİN SKILL BAŞINA TEK İSTEK: sorgu başına bir istek 60 x 20 = 1200 çağrı demekti; hem
 * pahalı hem hız sınırına takılır. Katalog zaten istemin büyük kısmı, sorgular ucuz.
 *
 * ÇIKIŞ KODLARI (cetvel: ölçemedi ile ihlal ayrı): 0 geçti · 1 ihlal (eşiğin altı) ·
 * 2 ölçemedi (model cevabı çözülemedi / ağ) · anahtar yoksa ATLANDI ve 0 (SARI, kırmızı değil).
 *
 * KULLANIM
 *   node scripts/skills-eval-run.mjs            # gerçek koşu (ANTHROPIC_API_KEY gerekir)
 *   node scripts/skills-eval-run.mjs --kuru     # ağa ÇIKMAZ: istem sayısı + maliyet TAHMİNİ
 *   node scripts/skills-eval-run.mjs --agac=.claude/skills
 *
 * ⛔Anahtar ortam değişkeninden okunur ve HİÇBİR YERE basılmaz (repo PUBLIC).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { cevabiCoz, istemKur, jetonTahmini, maliyetTahmini, ozet, puanla } from './skills-eval/lib.mjs'

const MODEL = 'claude-haiku-4-5-20251001'
// Fiyat tablosu burada AÇIK durur ki maliyet satırı "nereden çıktı" sorusuna cevap verebilsin.
const FIYAT = { girisUsdMilyon: 1, cikisUsdMilyon: 5 }
const AGACLAR = ['.claude/skills', '.agent/skills']

const bayraklar = process.argv.slice(2)
const kuru = bayraklar.includes('--kuru')
const agacBayragi = bayraklar.find((b) => b.startsWith('--agac='))
const ornekBayragi = bayraklar.find((b) => b.startsWith('--ornek='))
const depoKoku = path.resolve(import.meta.dirname, '..')

/**
 * İKİ ARKA UÇ, SIRAYLA (OPS hükmü 2026-09-12):
 *   1. `api` — ANTHROPIC_API_KEY varsa doğrudan Messages API. CI'da kullanılabilir tek yol;
 *      jeton kullanımını API kendisi bildirir, yani maliyet ÖLÇÜLÜR.
 *   2. `cli` — anahtar yoksa ve `claude` PATH'te ise yerel alt süreç (`claude -p`). Anahtar
 *      gerektirmez, mevcut abonelikten gider. ⚠Jeton kullanımı bu yolda OKUNAMAZ: maliyet
 *      satırı "ölçülmedi" der, uydurulmaz. CI'da yoktur (orada `claude` kurulu değil).
 *   3. yoksa ATLANDI ve çıkış 0 — SARI, kırmızı değil: anahtarın yokluğu skill kusuru değil.
 */
function arkaUcSec() {
  if (process.env.ANTHROPIC_API_KEY) return 'api'
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['claude'], { encoding: 'utf8' })
  if (r.status === 0 && String(r.stdout || '').trim()) return 'cli'
  return 'yok'
}

/** SKILL.md frontmatter'ından ad ve açıklamayı çıkarır (yaml bağımlılığı olmadan). */
function frontmatter(dosya) {
  const ham = fs.readFileSync(dosya, 'utf8')
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(ham)
  if (!m) return null
  const al = (anahtar) => {
    const r = new RegExp('^' + anahtar + ':\\s*(.+)$', 'm').exec(m[1])
    return r ? r[1].trim().replace(/^["']|["']$/g, '') : ''
  }
  return { ad: al('name'), aciklama: al('description') }
}

/** Bir skill ağacını okur: katalog (hepsi) + sınavı olanlar (evals.json). */
function agaciOku(agac) {
  const kok = path.join(depoKoku, agac)
  if (!fs.existsSync(kok)) return { agac, katalog: [], sinavlilar: [], eksik: [] }
  const katalog = []
  const sinavlilar = []
  const eksik = []
  for (const giris of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!giris.isDirectory()) continue
    const skillDosyasi = path.join(kok, giris.name, 'SKILL.md')
    if (!fs.existsSync(skillDosyasi)) continue
    const fm = frontmatter(skillDosyasi)
    const ad = (fm && fm.ad) || giris.name
    katalog.push({ ad, aciklama: (fm && fm.aciklama) || '(açıklama yok)' })

    const evalsDosyasi = path.join(kok, giris.name, 'evals', 'evals.json')
    if (!fs.existsSync(evalsDosyasi)) {
      eksik.push(ad)
      continue
    }
    try {
      const e = JSON.parse(fs.readFileSync(evalsDosyasi, 'utf8'))
      const tetik = Array.isArray(e.should_trigger) ? e.should_trigger : []
      const tetiklemez = Array.isArray(e.should_not_trigger) ? e.should_not_trigger : []
      if (tetik.length === 0 && tetiklemez.length === 0) {
        eksik.push(ad + ' (evals boş)')
        continue
      }
      sinavlilar.push({ ad, dizin: giris.name, should_trigger: tetik, should_not_trigger: tetiklemez })
    } catch (e) {
      // Bozuk evals.json SESSİZ kalmaz: sınavsız sayılır ve adı raporda geçer.
      eksik.push(ad + ' (evals bozuk: ' + (e && e.message) + ')')
    }
  }
  return { agac, katalog, sinavlilar, eksik }
}

/**
 * Yerel `claude -p` alt süreciyle tek istek. Jeton kullanımı okunamaz (kullanim: null).
 * Zaman aşımı ZORUNLU: takılan bir alt süreç sınavı sonsuza kilitler.
 */
function cliyeSor(istem) {
  const r = spawnSync('claude', ['-p', '--model', MODEL], {
    input: istem,
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 8 * 1024 * 1024,
  })
  if (r.error) return { hata: 'CLI: ' + r.error.message, metin: null, kullanim: null }
  if (r.status !== 0) {
    return { hata: 'CLI cikis ' + r.status + ': ' + String(r.stderr || '').slice(0, 200), metin: null, kullanim: null }
  }
  return { hata: null, metin: String(r.stdout || ''), kullanim: null }
}

/** Modele tek istek; ağ/oran hatasında bir kez yeniden dener, sonra ölçemedi der. */
async function modeleSor(anahtar, istem) {
  for (let deneme = 1; deneme <= 2; deneme++) {
    try {
      const y = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': anahtar,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          messages: [{ role: 'user', content: istem }],
        }),
      })
      if (!y.ok) {
        // 4xx yeniden denemeyi hak etmez (anahtar/istem hatası); 5xx ve 429 dener.
        if (deneme === 2 || (y.status < 500 && y.status !== 429)) {
          return { hata: 'HTTP ' + y.status, metin: null, kullanim: null }
        }
        continue
      }
      const j = await y.json()
      const metin = Array.isArray(j.content) ? j.content.map((b) => b.text || '').join('\n') : ''
      return { hata: null, metin, kullanim: j.usage || null }
    } catch (e) {
      if (deneme === 2) return { hata: 'AG: ' + (e && e.message), metin: null, kullanim: null }
    }
  }
  return { hata: 'bilinmeyen', metin: null, kullanim: null }
}

async function main() {
  const anahtar = process.env.ANTHROPIC_API_KEY || ''
  const agaclar = (agacBayragi ? [agacBayragi.split('=')[1]] : AGACLAR).map(agaciOku)

  const isler = []
  for (const a of agaclar) {
    for (const s of a.sinavlilar) {
      const sorgular = [...s.should_trigger, ...s.should_not_trigger]
      isler.push({ agac: a.agac, skill: s, sorgular, istem: istemKur(a.katalog, sorgular) })
    }
  }

  // ÖRNEKLEM: kota darken 71 skill yerine ilk N ile koş. Kesilen kısım SESSİZ kalmaz —
  // rapora `ornek` ve `atlanan` sayısı yazılır, yoksa "hepsi ölçüldü" sanılır.
  const tumIsSayisi = isler.length
  const ornek = ornekBayragi ? Math.max(1, Number(ornekBayragi.split('=')[1]) || 0) : 0
  const kosacak = ornek > 0 ? isler.slice(0, ornek) : isler

  const arkaUc = arkaUcSec()
  const damga = new Date().toISOString()
  const tarih = damga.slice(0, 10)
  const cikti = {
    damga,
    model: MODEL,
    arkaUc,
    kuru,
    ornek: ornek > 0 ? { kosan: kosacak.length, toplam: tumIsSayisi, atlanan: tumIsSayisi - kosacak.length } : null,
    agaclar: agaclar.map((a) => ({
      agac: a.agac,
      skill: a.katalog.length,
      sinavli: a.sinavlilar.length,
      sinavsiz: a.eksik,
    })),
    istek: isler.length,
    sonuclar: [],
  }

  if (isler.length === 0) {
    console.error('[skills-eval] SINAVLI SKILL YOK — ölçülecek bir şey bulunamadı.')
    yaz(cikti, tarih)
    process.exit(2)
  }

  if (kuru || arkaUc === 'yok') {
    const girisJetonu = kosacak.reduce((t, i) => t + jetonTahmini(i.istem), 0)
    const cikisJetonu = kosacak.reduce((t, i) => t + i.sorgular.length * 8, 0)
    cikti.tahmin = {
      istek: kosacak.length,
      girisJetonu,
      cikisJetonu,
      usd: maliyetTahmini({ girisJetonu, cikisJetonu, ...FIYAT }),
      not: 'TAHMIN (4 karakter ~ 1 jeton), olcum DEGIL',
    }
    const sebep = kuru ? 'KURU KOSU (--kuru)' : 'ATLANDI: ne ANTHROPIC_API_KEY var ne claude PATH te'
    cikti.atlandi = !kuru
    console.log(`[skills-eval] ${sebep}`)
    console.log(`  istek: ${kosacak.length} · giris jetonu ~${girisJetonu} · cikis ~${cikisJetonu}`)
    console.log(`  maliyet TAHMINI: ~$${cikti.tahmin.usd} / kosu (${MODEL})`)
    for (const a of cikti.agaclar) {
      console.log(`  ${a.agac}: skill ${a.skill} · sinavli ${a.sinavli} · sinavsiz ${a.sinavsiz.length}`)
    }
    yaz(cikti, tarih)
    // Anahtar yoksa SARI: kirmizi vermez (OPS hukmu 2026-09-12).
    process.exit(0)
  }

  let girisJetonu = 0
  let cikisJetonu = 0
  const basladi = Date.now()
  console.log(`[skills-eval] arka uc: ${arkaUc} · istek: ${kosacak.length}/${tumIsSayisi} · model: ${MODEL}`)
  for (const is of kosacak) {
    const y = arkaUc === 'api' ? await modeleSor(anahtar, is.istem) : cliyeSor(is.istem)
    if (y.kullanim) {
      girisJetonu += y.kullanim.input_tokens || 0
      cikisJetonu += y.kullanim.output_tokens || 0
    }
    const cevaplar = cevabiCoz(y.metin, is.sorgular.length)
    const n = is.skill.should_trigger.length
    const sonuc = puanla(is.skill, cevaplar.slice(0, n), cevaplar.slice(n))
    if (y.hata) sonuc.hata = y.hata
    sonuc.agac = is.agac
    cikti.sonuclar.push(sonuc)
    console.log(
      `  ${sonuc.durum.padEnd(9)} ${sonuc.ad} · tetik ${sonuc.tetik.dogru}/${sonuc.tetik.toplam} · ` +
        `tetiklemez ${sonuc.tetiklemez.dogru}/${sonuc.tetiklemez.toplam}` +
        (sonuc.olcemedi ? ` · OLCEMEDI ${sonuc.olcemedi}` : '') +
        (y.hata ? ` · ${y.hata}` : ''),
    )
  }

  const o = ozet(cikti.sonuclar)
  cikti.ozet = o
  cikti.sureSaniye = Number(((Date.now() - basladi) / 1000).toFixed(1))
  cikti.maliyet =
    arkaUc === 'api'
      ? {
          girisJetonu,
          cikisJetonu,
          usd: maliyetTahmini({ girisJetonu, cikisJetonu, ...FIYAT }),
          not: 'API usage alanlarindan OLCULDU',
        }
      : {
          girisJetonu: null,
          cikisJetonu: null,
          usd: null,
          // Uydurmak yerine "okunamadi" demek: CLI jeton kullanimini bildirmiyor.
          not: 'CLI arka ucu jeton kullanimini bildirmez -> OLCULEMEDI (abonelikten gider)',
        }
  console.log(
    `[skills-eval] toplam ${o.toplam} · gecti ${o.gecti} · dustu ${o.dustu} · olcemedi ${o.olcemedi} · ` +
      `sure ${cikti.sureSaniye}s · maliyet ${cikti.maliyet.usd === null ? 'olculemedi (CLI)' : '$' + cikti.maliyet.usd}`,
  )
  yaz(cikti, tarih)
  process.exit(o.cikis)
}

function yaz(cikti, tarih) {
  const dizin = path.join(depoKoku, 'docs', 'audits')
  fs.mkdirSync(dizin, { recursive: true })
  const yol = path.join(dizin, `skills-eval-${tarih}.json`)
  fs.writeFileSync(yol, JSON.stringify(cikti, null, 2) + '\n', 'utf8')
  console.log(`  rapor: docs/audits/skills-eval-${tarih}.json`)
}

main().catch((e) => {
  console.error('[skills-eval] BEKLENMEYEN: ' + (e && e.message))
  process.exit(2)
})
