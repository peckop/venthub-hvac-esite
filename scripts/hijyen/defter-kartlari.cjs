#!/usr/bin/env node
'use strict'

/**
 * DEFTER KARTLARI — defterin iş bölümleri Kanban'dan üretilir (ARC-291, OPS emri).
 *
 * NİÇİN: defterlerin "1 Ne yaptık" ve "3 Sırada" bölümleri elle yazılınca Kanban'la ayrışıyordu (aynı iş iki yerde, biri bayat).
 * Tek kaynak Kanban: kartlar `defter:<ad>` etiketini taşır; bu betik etiketli kartlardan iki tabloyu üretir ve defterde
 * işaretli bir BLOK olarak durur. Elle kalan yalnız kapsam ve kararlar; eski elle yazılmış satırlara dokunulmaz (sahibi taşır/siler).
 *
 * Okuma: `scripts/board/kanban-anlik.cjs --label defter:<ad>` (salt-okuma, ana depodaki sqlite; yeni altyapı yok). Okunamazsa
 * "ölçülemedi" denir, tablo uydurulmaz, dosya yazılmaz.
 *
 * KULLANIM:
 *   node scripts/hijyen/defter-kartlari.cjs <ad>             # iki tabloyu stdout'a basar
 *   node scripts/hijyen/defter-kartlari.cjs <ad> --yaz       # defter dosyasındaki blokları günceller (yoksa bölüm başlığının altına ekler)
 *   node scripts/hijyen/defter-kartlari.cjs <ad> --kontrol   # defterdeki blok Kanban'la uyuşuyor mu (UYARI: çıkış hep 0; ölçülemedi ayrı satır)
 *   node scripts/hijyen/defter-kartlari.cjs --hepsi --kontrol
 *
 * CI Kanban'ı OKUYAMAZ (sqlite yerel, git dışı); bu yüzden uyuşmazlık uyarısı günlük "Sabah özeti" adımında ve elle koşar.
 * CI yalnız blokların biçimini ve `Üretildi:` damgasının varlığını ölçer (yaş eşiği yok; yaş `damgaYasi` ile okunur) (kanca-defter-kartlari.test.ts).
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const KOK = path.resolve(__dirname, '..', '..')
const BOLUMLER = {
  'ne-yaptik': { baslik: /^##\s*1[.\s]/, ad: '1 Ne yaptık' },
  sirada: { baslik: /^##\s*3[.\s]/, ad: '3 Sırada' },
}
const TAVAN = 30
const NO_RE = /^([A-Z]{2,5}-\d+)\s*[:·\-–—]?\s*/

/**
 * Kart başlığının KISA hâli (OPS, 9 Kasım): önek (kart no) atılır, ilk cümle/öbek (" — ", " - ", ". ", " (" ya da ":" öncesi)
 * alınır, ~80 karakterde sözcük sınırında "…" ile kesilir. Boş kalırsa tam başlık.
 */
function kisaBaslik(tam, sinir = 80) {
  const t = String(tam || '').replace(NO_RE, '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim()
  const kesim = t.search(/\s[—–-]\s|\.\s|\s\(|:\s/)
  let k = kesim >= 12 ? t.slice(0, kesim) : t
  if (k.length > sinir) {
    const son = k.lastIndexOf(' ', sinir)
    k = k.slice(0, son > 20 ? son : sinir).replace(/[\s,;:(]+$/, '') + '…'
  }
  // Önekten başka bir şey yoksa kart no korunur (başlık tamamen kaybolmasın).
  return k || t.slice(0, sinir) || String(tam || '').trim()
}

function yaniKartlar(ham) {
  return (ham || []).map((e) => {
    const t = e.task || {}
    const m = NO_RE.exec(String(t.title || ''))
    const pano = String((e.board && e.board.title) || '').replace(/^VentHub\s+/i, '')
    return {
      no: m ? m[1] : String(t.id || '').slice(0, 8),
      baslik: kisaBaslik(t.title),
      durum: String(t.sutun || t.status || ''),
      bitti: t.columnId === 'done' || t.status === 'completed',
      sahip: t.assignee || pano || '',
      kapanis: t.completedAt ? String(t.completedAt).slice(0, 10) : '',
    }
  })
}

/** Kanban'dan `defter:<ad>` etiketli kartlar. { durum:'tamam', kartlar } ya da { durum:'olculemedi', sebep }. */
function kartlariOku(ad, kaynaklar = {}) {
  try {
    const ham = (kaynaklar.oku || etiketOku)(ad)
    if (!Array.isArray(ham)) return { durum: 'olculemedi', sebep: 'Kanban okunamadı' }
    return { durum: 'tamam', kartlar: yaniKartlar(ham) }
  } catch (e) {
    return { durum: 'olculemedi', sebep: String((e && e.message) || e).slice(0, 120) }
  }
}

function etiketOku(ad) {
  const r = spawnSync(process.execPath, [path.join(KOK, 'scripts', 'board', 'kanban-anlik.cjs'), '--label', `defter:${ad}`], {
    encoding: 'utf8',
    timeout: 15000,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  })
  if (r.error || r.status !== 0) return null
  const j = JSON.parse(r.stdout)
  return j && j.ok === true && Array.isArray(j.tasks) ? j.tasks : null
}

/** Bölüm gövdesi (başlık satırı hariç, ham tablo metni). */
/** Bölüme girecek kartlar, TABLO ve KONTROL için tek sıralama (tavan kesimi aynı kartları seçsin). */
function secim(kip, kartlar) {
  const bitenler = kartlar.filter((k) => k.bitti).sort((a, b) => (b.kapanis || '').localeCompare(a.kapanis || '') || b.no.localeCompare(a.no, 'en', { numeric: true }))
  const acik = kartlar.filter((k) => !k.bitti).sort((a, b) => a.no.localeCompare(b.no, 'en', { numeric: true }))
  return kip === 'ne-yaptik' ? bitenler : acik
}

/** Aynı numara iki kartta geçerse ikincisi "NO#2" anahtarı alır (ayrışma gizlenmesin). */
function anahtarla(harita, no) {
  let a = no
  for (let i = 2; a in harita; i += 1) a = `${no}#${i}`
  return a
}

function tablo(kip, kartlar) {
  const liste = secim(kip, kartlar)
  const gosterilen = liste.slice(0, TAVAN)
  const bas = kip === 'ne-yaptik' ? ['| Kapanış | Kart | İş | Sahip |', '|---|---|---|---|'] : ['| Kart | İş | Durum | Sahip |', '|---|---|---|---|']
  const satirlar = gosterilen.map((k) => (kip === 'ne-yaptik' ? `| ${k.kapanis || '?'} | ${k.no} | ${k.baslik} | ${k.sahip} |` : `| ${k.no} | ${k.baslik} | ${k.durum} | ${k.sahip} |`))
  if (liste.length === 0) satirlar.push(kip === 'ne-yaptik' ? '| — | (etiketli biten kart yok) | | |' : '| (etiketli açık kart yok) | | | |')
  if (liste.length > TAVAN) satirlar.push(`| … | +${liste.length - TAVAN} kart daha (Kanban'da \`defter:\` etiketiyle ara) | | |`)
  return [...bas, ...satirlar].join('\n')
}

const bas = (kip, ad, tarih) => `<!-- DEFTER-KANBAN:${kip} BASLA — Kanban'dan üretilir (defter:${ad} etiketi), elle düzenleme; node scripts/hijyen/defter-kartlari.cjs ${ad} --yaz · Üretildi: ${tarih} -->`
const son = (kip) => `<!-- DEFTER-KANBAN:${kip} BITIS -->`
const BLOK_RE = (kip) => new RegExp(`<!-- DEFTER-KANBAN:${kip} BASLA[^\\n]*-->\\n([\\s\\S]*?)\\n<!-- DEFTER-KANBAN:${kip} BITIS -->`)

function blok(kip, ad, kartlar, tarih) {
  return `${bas(kip, ad, tarih)}\n${tablo(kip, kartlar)}\n${son(kip)}`
}

/** Metni günceller: blok varsa yerinde değişir, yoksa bölüm başlığının altına eklenir; bölüm başlığı yoksa null. */
function metniYaz(metin, ad, kartlar, tarih) {
  const eol = metin.includes('\r\n') ? '\r\n' : '\n'
  let cikti = metin.replace(/\r\n/g, '\n')
  for (const kip of Object.keys(BOLUMLER)) {
    const yeni = blok(kip, ad, kartlar, tarih)
    if (BLOK_RE(kip).test(cikti)) {
      cikti = cikti.replace(BLOK_RE(kip), () => yeni)
      continue
    }
    const satirlar = cikti.split('\n')
    const i = satirlar.findIndex((s) => BOLUMLER[kip].baslik.test(s))
    if (i === -1) return null
    satirlar.splice(i + 1, 0, '', yeni)
    cikti = satirlar.join('\n')
  }
  return cikti.replace(/\n/g, eol)
}

/** Defterdeki blok satırları → { no: 'durum|kapanis' }; blok yoksa null. */
function blokSatirlari(metin, kip) {
  const m = BLOK_RE(kip).exec(metin.replace(/\r\n/g, '\n'))
  if (!m) return null
  const harita = {}
  for (const s of m[1].split('\n')) {
    const h = s.replace(/^\||\|$/g, '').split('|').map((x) => x.trim())
    const no = kip === 'ne-yaptik' ? h[1] : h[0]
    if (no && /^[A-Z]{2,5}-\d+$|^[0-9a-f]{8}$/.test(no)) harita[anahtarla(harita, no)] = kip === 'ne-yaptik' ? h[0] : h[2]
  }
  return harita
}

/** Uyuşma ölçümü. { durum:'uyumlu'|'ayrisik'|'blok-yok', ayrik: string[] }. */
function kontrol(metin, kartlar) {
  const ayrik = []
  let bulunan = 0
  for (const kip of Object.keys(BOLUMLER)) {
    const eldeki = blokSatirlari(metin, kip)
    if (!eldeki) continue
    bulunan += 1
    const taze = {}
    for (const k of secim(kip, kartlar).slice(0, TAVAN)) taze[anahtarla(taze, k.no)] = kip === 'ne-yaptik' ? k.kapanis || '?' : k.durum
    for (const no of Object.keys(taze)) {
      if (!(no in eldeki)) ayrik.push(`${BOLUMLER[kip].ad}: ${no} Kanban'da var, defterde yok`)
      else if (eldeki[no] !== taze[no]) ayrik.push(`${BOLUMLER[kip].ad}: ${no} defterde "${eldeki[no]}", Kanban'da "${taze[no]}"`)
    }
    for (const no of Object.keys(eldeki)) if (!(no in taze)) ayrik.push(`${BOLUMLER[kip].ad}: ${no} defterde var, Kanban'da etiketli değil ya da bölüm değiştirdi`)
  }
  if (bulunan === 0) return { durum: 'blok-yok', ayrik: [] }
  return { durum: ayrik.length ? 'ayrisik' : 'uyumlu', ayrik }
}

/** Damga yaşı (gün); blok/damga yoksa null. CI'ın ölçtüğü tek şey. */
function damgaYasi(metin, bugun = new Date()) {
  const t = [...metin.matchAll(/DEFTER-KANBAN:[a-z-]+ BASLA[^\n]*Üretildi: (\d{4}-\d{2}-\d{2})/g)].map((m) => Date.parse(m[1]))
  if (!t.length || t.some((x) => !Number.isFinite(x))) return null
  return Math.floor((bugun.getTime() - Math.min(...t)) / 86400000)
}

function defterYolu(ad) {
  const m = JSON.parse(fs.readFileSync(path.join(KOK, 'docs', 'defter', 'manifest.json'), 'utf8'))
  const d = (m.defterler || []).find((x) => x.ad === ad)
  return d && typeof d.dosya === 'string' && !path.isAbsolute(d.dosya) && !d.dosya.includes('..') ? path.join(KOK, d.dosya) : null
}

function main(argv) {
  const hepsi = argv.includes('--hepsi')
  const adlar = hepsi
    ? JSON.parse(fs.readFileSync(path.join(KOK, 'docs', 'defter', 'manifest.json'), 'utf8')).defterler.filter((d) => d.durum !== 'emekli').map((d) => d.ad)
    : argv.filter((a) => !a.startsWith('--'))
  if (!adlar.length) {
    process.stdout.write('Kullanım: defter-kartlari.cjs <ad>|--hepsi [--yaz|--kontrol]\n')
    return
  }
  const bugun = new Date().toISOString().slice(0, 10)
  for (const ad of adlar) {
    const yol = defterYolu(ad)
    const oku = kartlariOku(ad)
    if (oku.durum !== 'tamam') {
      process.stdout.write(`⚠DEFTER-KANBAN ${ad}: ölçülemedi (${oku.sebep}); dosya yazılmadı\n`)
      continue
    }
    if (argv.includes('--kontrol')) {
      if (!yol || !fs.existsSync(yol)) {
        process.stdout.write(`⚠DEFTER-KANBAN ${ad}: defter dosyası yok (planlı olabilir); ${oku.kartlar.length} etiketli kart\n`)
        continue
      }
      const k = kontrol(fs.readFileSync(yol, 'utf8'), oku.kartlar)
      if (k.durum === 'uyumlu') process.stdout.write(`DEFTER-KANBAN ${ad}: uyumlu (${oku.kartlar.length} kart)\n`)
      else if (k.durum === 'blok-yok') process.stdout.write(`⚠DEFTER-KANBAN ${ad}: üretilmiş blok yok, ${oku.kartlar.length} etiketli kart; --yaz ile üret\n`)
      else process.stdout.write(`⚠DEFTER-KANBAN ${ad}: ${k.ayrik.length} ayrışma\n${k.ayrik.slice(0, 8).map((s) => '  ' + s).join('\n')}\n`)
    } else if (argv.includes('--yaz')) {
      if (!yol || !fs.existsSync(yol)) {
        process.stdout.write(`⚠DEFTER-KANBAN ${ad}: defter dosyası yok; yazılmadı\n`)
        continue
      }
      if (!oku.kartlar.length) {
        process.stdout.write(`⚠DEFTER-KANBAN ${ad}: etiketli kart 0 (etiket yazımı?); mevcut blok korunsun diye yazılmadı\n`)
        continue
      }
      const yeni = metniYaz(fs.readFileSync(yol, 'utf8'), ad, oku.kartlar, bugun)
      if (yeni === null) process.stdout.write(`⚠DEFTER-KANBAN ${ad}: "1 Ne yaptık" ya da "3 Sırada" başlığı bulunamadı; yazılmadı\n`)
      else {
        fs.writeFileSync(yol, yeni)
        process.stdout.write(`DEFTER-KANBAN ${ad}: ${oku.kartlar.length} kart, bloklar yazıldı (${path.relative(KOK, yol)})\n`)
      }
    } else {
      process.stdout.write(`## ${ad}\n\n${blok('ne-yaptik', ad, oku.kartlar, bugun)}\n\n${blok('sirada', ad, oku.kartlar, bugun)}\n`)
    }
  }
}

module.exports = { kisaBaslik, yaniKartlar, kartlariOku, tablo, blok, metniYaz, blokSatirlari, kontrol, damgaYasi, TAVAN, BOLUMLER }

if (require.main === module) {
  try {
    main(process.argv.slice(2))
  } catch (e) {
    process.stdout.write(`⚠DEFTER-KANBAN: ${String((e && e.message) || e).slice(0, 160)}\n`)
  }
  process.exit(0)
}
