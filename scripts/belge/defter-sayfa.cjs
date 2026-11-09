#!/usr/bin/env node
'use strict'

/**
 * DEFTER SAYFASI — Recep'in "göster" dediği sayfa, defterlerden üretilir (HRT-127, OPS-258; cetvel
 * `docs/standards/departman-defter-standard.md` D2.5, tasarım notu §3.5).
 *
 * Kaynak TEK: `docs/defter/manifest.json` + manifestin gösterdiği defter dosyaları. Sayfa el ile yazılmaz; Kanban'ı yeniden
 * OKUMAZ (iş durumu `scripts/kanban/pano-sayfasi.cjs`'in işidir, ikinci okuyucu yazılmaz), kart numarasını defterde yazıldığı gibi gösterir.
 *
 * Her defter için bir kart: alan, durum, `Son doğrulama` (gün yaşıyla), son iş (1. bölümün ilk satırı), sırada ilk üç madde
 * (3. bölüm). Eşiği (`tazelikGun`) aşan defter KIRMIZI çıkar; `Son doğrulama` okunamayan defter "ölçülemedi" ve kırmızıdır
 * (sessizlik "taze" demek değildir); dosyası olmayan `planli` kayıt "planlı" olarak gri görünür.
 *
 * Güvenlik: sayfaya giren her metin HTML-kaçışlıdır, sayfa betik çalıştırmaz, dış kaynak yüklemez. Çıktı varsayılan olarak
 * depo DIŞINA yazılır (`~/.claude/venthub-defter/defter.html`); yayımlama (Artifact) Recep "göster" deyince OPS ya da müdür işidir.
 *
 * KULLANIM:
 *   node scripts/belge/defter-sayfa.cjs                       # varsayılan hedefe yazar, yolu basar
 *   node scripts/belge/defter-sayfa.cjs --hedef <dosya.html>  # başka hedef (depo içi reddedilir)
 *   node scripts/belge/defter-sayfa.cjs --stdout              # HTML'i stdout'a basar
 *   node scripts/belge/defter-sayfa.cjs --bugun 2026-11-09    # yaş hesabı için tarih (test)
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const manifestModulu = require('./defter-manifest.cjs')

const GUN_MS = 86400000
const SIRADA_EN_COK = 3

/** Markdown tablo satırını hücrelere böler (`\|` kaçışlı); ayraç satırı ve tablo olmayan satır için null. */
function satirHucreleri(satir) {
  const s = satir.trim()
  if (!s.startsWith('|')) return null
  const hucreler = s.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((h) => h.trim().replace(/\\\|/g, '|'))
  if (hucreler.every((h) => /^:?-{3,}:?$/.test(h))) return null
  return hucreler
}

/** Başlığı `## <no>` ile başlayan bölümün ilk tablosu: { baslik: string[], satirlar: string[][] } ya da null. */
function bolumTablosu(metin, no) {
  const satirlar = metin.split(/\r?\n/)
  const baslangic = satirlar.findIndex((s) => new RegExp(`^##\\s*${no}[.\\s]`).test(s))
  if (baslangic === -1) return null
  let bitis = satirlar.findIndex((s, i) => i > baslangic && /^##\s/.test(s))
  if (bitis === -1) bitis = satirlar.length
  const tablo = []
  let basladi = false
  for (const s of satirlar.slice(baslangic + 1, bitis)) {
    const h = satirHucreleri(s)
    if (h === null && /^\|?\s*:?-{3,}/.test(s.trim())) continue
    if (h) {
      tablo.push(h)
      basladi = true
    } else if (basladi) break
  }
  if (tablo.length < 1) return null
  const [baslik, ...govde] = tablo
  return { baslik, satirlar: govde.filter((r) => r.some((c) => c)) }
}

/** Defter metninden sayfa verisi. Hata fırlatmaz: bulunamayan alan null/boş. */
function ayikla(metin) {
  const dogrulama = /Son doğrulama:\s*(\d{4}-\d{2}-\d{2})/.exec(metin)
  const ne = bolumTablosu(metin, 1)
  const sirada = bolumTablosu(metin, 3)
  const sutun = (t, ad) => (t ? t.baslik.findIndex((b) => b.toLowerCase().startsWith(ad)) : -1)
  const oncelikIdx = sutun(sirada, 'öncelik')
  const kartIdx = sutun(sirada, 'kart')
  return {
    sonDogrulama: dogrulama ? dogrulama[1] : null,
    sonIs: ne && ne.satirlar[0] ? { tarih: ne.satirlar[0][0] || '', is: ne.satirlar[0][1] || '' } : null,
    siradaToplam: sirada ? sirada.satirlar.length : 0,
    sirada: sirada
      ? sirada.satirlar.slice(0, SIRADA_EN_COK).map((r) => ({
          madde: r[0] || '',
          oncelik: oncelikIdx >= 0 ? r[oncelikIdx] || '' : '',
          kart: kartIdx >= 0 ? r[kartIdx] || '' : '',
        }))
      : [],
  }
}

/** İki YYYY-MM-DD arasındaki tam gün (negatifse 0); geçersizse null. */
function gunFarki(dogrulama, bugun) {
  const a = Date.parse(`${dogrulama}T00:00:00Z`)
  const b = Date.parse(`${bugun}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.max(0, Math.round((b - a) / GUN_MS))
}

/** Bir manifest kaydının sayfa kartı verisi. `oku(dosya)`: metin ya da null (okunamadı). */
function kartVerisi(kayit, oku, bugun) {
  const temel = { ad: kayit.ad, sahip: kayit.sahip, ozet: kayit.ozet, durum: kayit.durum, tazelikGun: kayit.tazelikGun, dosya: kayit.dosya }
  // kaynakIzi yalnız hal kararında kullanılır.
  const metin = oku(kayit.dosya)
  // `planli` kayıt dosyasız kalır; dosyası varsa (manifest durumu geride) gerçek veri gösterilir, "planlı" diye gizlenmez.
  if (kayit.durum === 'planli' && metin === null) return { ...temel, hal: 'planli' }
  if (metin === null) return { ...temel, hal: 'olculemedi', sebep: 'defter dosyası okunamadı' }
  const v = ayikla(metin)
  if (!v.sonDogrulama) return { ...temel, ...v, hal: 'olculemedi', sebep: '"Son doğrulama" satırı yok ya da biçimsiz' }
  const yas = gunFarki(v.sonDogrulama, bugun)
  if (yas === null) return { ...temel, ...v, hal: 'olculemedi', sebep: '"Son doğrulama" tarihi geçersiz' }
  if (yas > kayit.tazelikGun && kayit.kaynakIzi && kaynakDegismedi(metin)) return { ...temel, ...v, yas, hal: 'kaynak-degismedi' }
  return { ...temel, ...v, yas, hal: yas > kayit.tazelikGun ? 'bayat' : 'taze' }
}

/**
 * ARC-291: `kaynakIzi` olan defterde, ölçüm bloğundaki HİÇBİR satır "bekliyor" ya da "ölçülemedi" değilse süre dolsa da bayat sayılmaz
 * (tazelik kaynağa bağlı). Ayrı hal olarak gösterilir, taze ile karışmaz; `Son doğrulama` günü yine görünür (sahte tazelik yasağı).
 */
function kaynakDegismedi(metin) {
  const m = /<!-- DEFTER-OLCUM:envanter BASLA[^\n]*-->\r?\n([\s\S]*?)\r?\n<!-- DEFTER-OLCUM:envanter BITIS -->/.exec(metin)
  if (!m) return false
  const satirlar = m[1].split(/\r?\n/).filter((s) => /^\|/.test(s) && !/^\|\s*(Ölçüm|---)/.test(s))
  return satirlar.length > 0 && satirlar.every((s) => !/bekliyor|ölçülemedi/.test(s))
}

function kac(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

const HAL_ETIKETI = { taze: 'taze', bayat: 'BAYAT', olculemedi: 'ölçülemedi', planli: 'planlı', 'kaynak-degismedi': 'kaynak değişmedi' }

function kartHtml(k) {
  const durumSatiri =
    k.hal === 'planli'
      ? 'Planlı: defter dosyası henüz yok.'
      : k.hal === 'olculemedi'
        ? `Ölçülemedi: ${kac(k.sebep)}.`
        : `Son doğrulama ${kac(k.sonDogrulama)} (${k.yas} gün önce, eşik ${k.tazelikGun} gün).`
  const sonIs = k.sonIs ? `<p class="son"><b>Son iş</b> ${kac(k.sonIs.tarih)}: ${kac(k.sonIs.is)}</p>` : ''
  const sirada =
    k.sirada && k.sirada.length
      ? `<p class="baslik">Sırada (${k.sirada.length}/${k.siradaToplam})</p><ol>${k.sirada
          .map((s) => `<li>${kac(s.madde)}${s.oncelik ? ` <span class="rozet">${kac(s.oncelik)}</span>` : ''}${s.kart ? ` <span class="kart">${kac(s.kart)}</span>` : ''}</li>`)
          .join('')}</ol>`
      : ''
  return `<article class="kart ${kac(k.hal)}"><header><h2>${kac(k.ad)}</h2><span class="hal">${kac(HAL_ETIKETI[k.hal])}</span></header><p class="sahip">${kac(k.sahip)} · ${kac(k.durum)}</p><p>${kac(k.ozet)}</p><p class="durum">${durumSatiri}</p>${sonIs}${sirada}<p class="dosya">${kac(k.dosya)}</p></article>`
}

const CSS = `:root{--zemin:#f7f7f5;--yuzey:#fff;--yazi:#1c1c1a;--soluk:#6b6b66;--cizgi:#d9d9d3;--taze:#2f7d4f;--bayat:#b3261e;--gri:#8a8a84}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--zemin:#161614;--yuzey:#1f1f1c;--yazi:#ecece8;--soluk:#a3a39c;--cizgi:#3a3a35;--taze:#5fbf86;--bayat:#ff8a80;--gri:#8a8a84}}
:root[data-theme="dark"]{--zemin:#161614;--yuzey:#1f1f1c;--yazi:#ecece8;--soluk:#a3a39c;--cizgi:#3a3a35;--taze:#5fbf86;--bayat:#ff8a80;--gri:#8a8a84}
*{box-sizing:border-box}body{margin:0;padding:24px 16px;background:var(--zemin);color:var(--yazi);font:16px/1.5 system-ui,sans-serif}
main{max-width:960px;margin:0 auto}h1{font-size:1.4rem;margin:0 0 4px}.alt{color:var(--soluk);margin:0 0 20px}
.izgara{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.kart{background:var(--yuzey);border:1px solid var(--cizgi);border-left:6px solid var(--taze);border-radius:8px;padding:14px 16px}
.kart.bayat,.kart.olculemedi{border-left-color:var(--bayat);border-color:var(--bayat)}.kart.planli,.kart.kaynak-degismedi{border-left-color:var(--gri)}
.kart header{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.kart h2{font-size:1.1rem;margin:0}
.hal{font-size:.8rem;font-weight:700;color:var(--taze)}.kart.bayat .hal,.kart.olculemedi .hal{color:var(--bayat)}.kart.planli .hal,.kart.kaynak-degismedi .hal{color:var(--gri)}
.kart p{margin:6px 0}.sahip,.dosya,.baslik{color:var(--soluk);font-size:.85rem}.baslik{margin-top:10px}.kart ol{margin:4px 0 0;padding-left:20px}
.rozet,.kart-no,.kart .kart{font-size:.75rem;border:1px solid var(--cizgi);border-radius:4px;padding:0 4px;color:var(--soluk)}`

/** Tüm sayfa: { html, kartlar }. */
function sayfaUret(manifest, oku, bugun) {
  const kayitlar = manifest && Array.isArray(manifest.defterler) ? manifest.defterler : []
  const kartlar = kayitlar.map((d) => kartVerisi(d, oku, bugun))
  const bayat = kartlar.filter((k) => k.hal === 'bayat' || k.hal === 'olculemedi').length
  const ozet = kartlar.length
    ? `${kartlar.length} defter · ${kartlar.filter((k) => k.hal === 'taze').length} taze · ${kartlar.filter((k) => k.hal === 'kaynak-degismedi').length} kaynak değişmedi · ${bayat} bayat ya da ölçülemedi · ${kartlar.filter((k) => k.hal === 'planli').length} planlı`
    : 'Manifest okunamadı ya da defter yok.'
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Departman Defterleri</title><style>${CSS}</style></head><body><main><h1>Departman defterleri</h1><p class="alt">${kac(bugun)} · ${kac(ozet)}</p><div class="izgara">${kartlar.map(kartHtml).join('')}</div></main></body></html>`
  return { html, kartlar }
}

/** Depo içi hedefi reddeder (sayfa depo dışı bir çıktıdır). */
function hedefDepoIcinde(hedef, kok) {
  const rel = path.relative(kok, path.resolve(hedef))
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel)
}

function calistir(argv, { kok = manifestModulu.KOK, bugun } = {}) {
  const arg = (ad) => {
    const i = argv.indexOf(ad)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const tarih = arg('--bugun') || bugun || new Date().toISOString().slice(0, 10)
  const manifest = manifestModulu.oku(kok)
  const oku = (dosya) => {
    try {
      return fs.readFileSync(path.join(kok, dosya), 'utf8')
    } catch {
      return null
    }
  }
  const { html, kartlar } = sayfaUret(manifest, oku, tarih)
  if (argv.includes('--stdout')) {
    process.stdout.write(html)
    return { kod: 0, kartlar }
  }
  const hedef = arg('--hedef') || path.join(os.homedir(), '.claude', 'venthub-defter', 'defter.html')
  if (hedefDepoIcinde(hedef, kok)) {
    process.stderr.write(`[defter-sayfa] hedef depo içinde, reddedildi: ${hedef}\n`)
    return { kod: 2, kartlar }
  }
  fs.mkdirSync(path.dirname(path.resolve(hedef)), { recursive: true })
  fs.writeFileSync(hedef, html, 'utf8')
  process.stdout.write(`${path.resolve(hedef)}\n`)
  return { kod: manifest ? 0 : 1, kartlar }
}

if (require.main === module) {
  process.exitCode = calistir(process.argv.slice(2)).kod
}

module.exports = { satirHucreleri, bolumTablosu, ayikla, gunFarki, kartVerisi, kac, sayfaUret, hedefDepoIcinde, calistir }
