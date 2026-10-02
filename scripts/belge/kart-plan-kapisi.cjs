#!/usr/bin/env node
'use strict'

/**
 * KART-PLAN KAPISI (HRT-14, OPS-13 karar 241/243/244; cetvel: docs/standards/kart-plani-standard.md).
 *
 * NİÇİN VAR: plan karta, konuyu hiç bilmeyen birinin uygulayabileceği açıklıkta yazılmalı (karar 241); "yazıldı"
 * demek ölçü değildir, bu betik planın iskeletinin eksiksiz olduğunu ölçer (karar 244: kontrolü yazılamayan kural girmez).
 * Ölçtüğü şey İSKELETtir (yedi etiket, asgari uzunluk, numaralı adım, etki alanı); planın DOĞRU olduğunu ölçmez.
 *
 * KULLANIM (yerelde; CI'da KOŞMAZ: Kanban verisi git dışıdır, depo public):
 *   node scripts/belge/kart-plan-kapisi.cjs --kart HRT-14
 *   node scripts/belge/kart-plan-kapisi.cjs --dosya <aciklama.txt>
 *   node scripts/belge/kart-plan-kapisi.cjs --pr-govde-dosyasi <govde.md>     (gövdedeki "Kanban: <NO>" satırlarını okur)
 *
 * KANBAN VERİSİ (2026-10-02 ölçüldü): ana deponun `.wrongstack/kanbans/_kanban.sqlite` dosyası (ya da VENTHUB_KANBAN_DB),
 * tablo `kanban_boards(id, payload, revision, updated_at)`; `payload` bir pano JSON'u, kartlar `payload.tasks[]`
 * ({id, title, description, ...}). Dosya YALNIZ OKUNUR açılır; betik hiçbir şey yazmaz.
 *
 * ÇIKIŞ KODU: 0 geçti ya da plan-gerekmez · 1 eksik var (her eksik ayrı satırda) · 2 veri okunamadı ya da kart
 * bulunamadı/belirsiz (sessizlik "geçti" sayılmaz).
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const REPO = path.resolve(__dirname, '..', '..')

/** Yedi zorunlu etiket ve asgari uzunluk (boşluksuz karakter). Adımlar için ayrıca en az 2 numaralı adım aranır. */
const ETIKETLER = [
  { ad: 'Amaç', min: 20 },
  { ad: 'Adımlar', min: 40 },
  { ad: 'Dosyalar', min: 10 },
  { ad: 'Bitti ölçütü', min: 20 },
  { ad: 'Ölçülmeyenler', min: 3 },
  { ad: 'Sor-noktaları', min: 3 },
  { ad: 'Etki alanı', min: 1 },
]
const RECEP_OZETI = 'Recep özeti'
const MIN_ADIM = 2
const ETKI_DEGERLERI = ['yok', 'müşteriye-görünen', 'veritabanı', 'site-yapısı']
const MIN_ISTISNA_SEBEBI = 8

/** Kod çitleri ve HTML yorumlarındaki satırlar sayılmaz (şablon örneği kapıyı geçirmesin; scripts/board/pr-kayit-kapisi.cjs ile aynı mantık). */
function govdeyiTemizle(metin) {
  return String(metin || '')
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
}

function bosluksuz(s) {
  return String(s || '').replace(/\s+/g, '').length
}

function kacis(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Satır başındaki "<Etiket>:" kalıbı (büyük/küçük harf serbest; Markdown süsü `sus` ile önceden atılmış satırda aranır). */
function etiketKalibi(ad) {
  return new RegExp(`^${kacis(ad)}[ \\t]*:`, 'i')
}

/** Markdown süsünü tolere eder: `**`/`__` çiftleri silinir, baştaki `#`, `>`, `*`, `_`, `-` ve boşluklar atılır (`## PLAN`, `**Amaç:** x`, `- Amaç: x`). */
function sus(satir) {
  return satir.replace(/\*\*|__/g, '').replace(/^[ \t#>*_-]*/, '')
}

/**
 * Açıklamayı değerlendirir.
 * @returns {{gecti: boolean, tur: 'plan'|'plan-yok'|'plan-gerekmez', eksikler: string[]}}
 */
function degerlendir(aciklama) {
  const temiz = govdeyiTemizle(aciklama)
  const ham = temiz.split('\n')
  const susluSatirlar = ham.map(sus)

  // PLAN başlığı da varsa "PLAN: gerekmez" satırı yok sayılır (plan değerlendirilir).
  const baslikIdx = susluSatirlar.findIndex((s) => /^PLAN[ \t]*:?[ \t]*$/.test(s))
  if (baslikIdx < 0) {
    const istisna = susluSatirlar.map((s) => s.match(/^PLAN[ \t]*:[ \t]*gerekmez[ \t]*[—–-]+[ \t]*(.*)$/i)).find(Boolean)
    if (istisna) {
      const sebep = istisna[1].trim()
      if (bosluksuz(sebep) >= MIN_ISTISNA_SEBEBI) return { gecti: true, tur: 'plan-gerekmez', eksikler: [] }
      return {
        gecti: false,
        tur: 'plan-gerekmez',
        eksikler: [`"PLAN: gerekmez" sebebi çok kısa (${bosluksuz(sebep)}/${MIN_ISTISNA_SEBEBI} karakter)`],
      }
    }
    return {
      gecti: false,
      tur: 'plan-yok',
      eksikler: ['açıklamada satır başında "PLAN" başlığı yok (ya da "PLAN: gerekmez — <sebep>" satırı)'],
    }
  }

  // Başlıktan sonraki satırlar etiket bölümlerine ayrılır; bir bölüm sonraki etikete (Recep özeti dahil) kadar sürer.
  // Bölümde her satırın hem süssüz hali (değer/uzunluk için) hem ham hali (numaralı adım sayımı için) tutulur.
  const kalipler = [...ETIKETLER.map((e) => e.ad), RECEP_OZETI].map((ad) => ({ ad, kalip: etiketKalibi(ad) }))
  const bolumler = new Map()
  let akis = null
  for (let i = baslikIdx + 1; i < ham.length; i++) {
    const eslesen = kalipler.find((k) => k.kalip.test(susluSatirlar[i]))
    if (eslesen) {
      akis = bolumler.has(eslesen.ad) ? null : eslesen.ad // ikinci tekrar yok sayılır, ilk bölüm geçerli
      if (akis) bolumler.set(akis, [{ sus: susluSatirlar[i].replace(eslesen.kalip, ''), ham: '' }])
    } else if (akis) {
      bolumler.get(akis).push({ sus: susluSatirlar[i], ham: ham[i] })
    }
  }
  const degerOku = (ad) => bolumler.get(ad).map((s) => s.sus).join('\n')

  const eksikler = []
  for (const { ad, min } of ETIKETLER) {
    if (!bolumler.has(ad)) {
      eksikler.push(`${ad}: etiketi yok`)
      continue
    }
    if (ad === 'Etki alanı') continue // değer aşağıda ayrıca denetlenir
    const n = bosluksuz(degerOku(ad))
    if (n < min) eksikler.push(`${ad}: çok kısa (${n}/${min} karakter)`)
    if (ad === 'Adımlar') {
      const adim = bolumler.get(ad).filter((s) => /^[ \t]*\d+\.[ \t]+\S/.test(s.ham)).length
      if (adim < MIN_ADIM) eksikler.push(`Adımlar: en az ${MIN_ADIM} numaralı adım gerekir ("1." "2." ile başlayan satır; ${adim} bulundu)`)
    }
  }

  if (bolumler.has('Etki alanı')) {
    const deger = degerOku('Etki alanı').replace(/\s+/g, ' ').trim()
    if (!ETKI_DEGERLERI.includes(deger.toLowerCase())) {
      eksikler.push(`Etki alanı: değer "${deger}" geçersiz; yalnız ${ETKI_DEGERLERI.join(' | ')}`)
    } else if (deger.toLowerCase() !== 'yok') {
      if (!bolumler.has(RECEP_OZETI) || bosluksuz(degerOku(RECEP_OZETI)) === 0) {
        eksikler.push(`Recep özeti: Etki alanı "${deger}" iken dolu "Recep özeti:" satırı gerekir (karar 243)`)
      } else if (!/\d/.test(degerOku(RECEP_OZETI))) {
        eksikler.push('Recep özeti: karar numarası ya da tarih (en az bir rakam) gerekir')
      }
    }
  }

  return { gecti: eksikler.length === 0, tur: 'plan', eksikler }
}

/** PR gövdesindeki `Kanban: HRT-14` / `Kanban: ARC-3, HRT-12` satırlarından numaralar (kod çiti/yorum içindekiler sayılmaz). */
function prGovdesindenNumaralar(govde) {
  const temiz = govdeyiTemizle(govde)
  const numaralar = new Set()
  const satirKalibi = /^[ \t>*_-]*kanban[ \t]*:[ \t]*(.*)$/gim
  let e
  while ((e = satirKalibi.exec(temiz)) !== null) {
    for (const n of e[1].match(/\b[A-Z]{2,5}-\d+\b/g) || []) numaralar.add(n)
  }
  return [...numaralar]
}

/** --db > VENTHUB_KANBAN_DB > ana deponun .wrongstack/kanbans/_kanban.sqlite (worktree'den de ana depo; scripts/nlm/kanban_disa_aktar.py pano_dosyasi() mantığı). */
function panoDosyasi(ortam = process.env) {
  if (ortam.VENTHUB_KANBAN_DB) return ortam.VENTHUB_KANBAN_DB
  let kok = REPO
  const r = spawnSync('git', ['-C', REPO, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8', timeout: 10000 })
  if (r.status === 0 && r.stdout.trim()) kok = path.dirname(r.stdout.trim())
  return path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite')
}

/**
 * Kartı numarasıyla bulur. Aşama 1: başlığın BAŞI (`HRT-14 · …`); bulunamazsa aşama 2: başlığın ilk 60 karakterinde
 * `\bNO\b` ("URUN REC-411: …"). Her aşamada tek eşleşme gerekir; birden fazlası "belirsiz" (istisna).
 * Okunamazsa, bulunamazsa ya da belirsizse istisna fırlatır (mesaj aşamayı söyler).
 */
function kartiOku(no, yol) {
  if (!fs.existsSync(yol)) throw new Error(`Kanban veri dosyası yok: ${yol}`)
  // node:sqlite'ın deneysel uyarısı zararsız ama CLI çıktısını kirletiyor (stderr).
  process.removeAllListeners('warning')
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(yol, { readOnly: true })
  let satirlar
  try {
    satirlar = db.prepare('SELECT payload FROM kanban_boards').all()
  } finally {
    db.close()
  }
  const kartlar = []
  for (const { payload } of satirlar) {
    const pano = JSON.parse(payload)
    for (const kart of pano.tasks || []) kartlar.push({ pano: pano.title, baslik: String(kart.title || ''), aciklama: kart.description || '' })
  }
  const asamalar = [
    { ad: 'aşama 1: başlığın başı', kalip: new RegExp(`^${kacis(no)}(?![A-Za-z0-9-])`), kart: (k) => k.baslik },
    { ad: 'aşama 2: başlığın ilk 60 karakteri', kalip: new RegExp(`\\b${kacis(no)}\\b`), kart: (k) => k.baslik.slice(0, 60) },
  ]
  for (const asama of asamalar) {
    const bulunan = kartlar.filter((k) => asama.kalip.test(asama.kart(k)))
    if (bulunan.length === 1) return bulunan[0].aciklama
    if (bulunan.length > 1) throw new Error(`kart numarası belirsiz: ${no} ${bulunan.length} kartta geçiyor (${asama.ad}; ${bulunan.map((b) => b.pano).join('; ')})`)
  }
  throw new Error(`kart bulunamadı: ${no} (başlığın başında ya da ilk 60 karakterinde aranmıştı)`)
}

function argumanlar(argv) {
  const s = { kart: [], dosya: [], prGovde: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--kart') s.kart.push(argv[++i])
    else if (a === '--dosya') s.dosya.push(argv[++i])
    else if (a === '--pr-govde-dosyasi') s.prGovde.push(argv[++i])
    else throw new Error(`bilinmeyen argüman: ${a}`)
  }
  return s
}

function main(argv) {
  let girdiler
  try {
    girdiler = argumanlar(argv)
  } catch (e) {
    console.error(`HATA: ${e.message}`)
    return 2
  }
  const { kart, dosya, prGovde } = girdiler
  if (kart.some((k) => !k) || dosya.some((d) => !d) || prGovde.some((d) => !d) || kart.length + dosya.length + prGovde.length === 0) {
    console.error('Kullanım: kart-plan-kapisi.cjs --kart <NO> | --dosya <yol> | --pr-govde-dosyasi <yol>')
    return 2
  }

  const isler = [] // {ad, aciklama}
  let kod = 0
  const kartNolari = [...kart]
  try {
    for (const d of dosya) isler.push({ ad: d, aciklama: fs.readFileSync(d, 'utf8') })
    for (const d of prGovde) {
      const govde = fs.readFileSync(d, 'utf8')
      const numaralar = prGovdesindenNumaralar(govde)
      // Yalnız uyarı (çıkış kodu değişmez): `Fixes REC-nn` karar 187 ile geçiş döneminde kasıtlı olarak meşru olabilir.
      const linear = [...new Set(govdeyiTemizle(govde).match(/\bREC-\d+\b/g) || [])]
      if (linear.length > 0) {
        console.error(`UYARI: PR gövdesinde Linear numarası ${linear.join(', ')} var; kapanmaması gerekiyorsa sil, yalnız Kanban: <no> yaz`)
      }
      if (numaralar.length === 0) {
        console.log(`EKSİK ${d}: PR gövdesinde "Kanban: <NO>" satırı yok, kart okunamadı`)
        kod = Math.max(kod, 1)
      }
      kartNolari.push(...numaralar)
    }
    if (kartNolari.length > 0) {
      const yol = panoDosyasi()
      for (const no of [...new Set(kartNolari)]) isler.push({ ad: no, aciklama: kartiOku(no, yol) })
    }
  } catch (e) {
    console.error(`HATA: ${e.message}`)
    return 2
  }

  for (const { ad, aciklama } of isler) {
    const s = degerlendir(aciklama)
    if (s.gecti) {
      console.log(`GEÇTİ ${ad}: ${s.tur}`)
    } else {
      console.log(`EKSİK ${ad}: ${s.tur}`)
      for (const e of s.eksikler) console.log(`  - ${e}`)
      kod = Math.max(kod, 1)
    }
  }
  return kod
}

module.exports = { degerlendir, govdeyiTemizle, prGovdesindenNumaralar, panoDosyasi, kartiOku, ETIKETLER, ETKI_DEGERLERI }

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2))
}
