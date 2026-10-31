#!/usr/bin/env node
// KTL-68 — Canlı yazım ÖN-KONTROLÜ: ürün/aile arşivleyen ya da silen yazım paketi rehber bağını kırıyor mu?
// Olay: REC-397 arşiv yazımı (31 Ekim 15:44-15:46Z) kanal tipi fan rehberini 500'e düşürdü; rehberin
// `vh:aile/<slug>` bağı arşivlenen (aktif ürünü 0 kalan) aileyi bulamadı.
//
// Saf: veritabanına gitmez, hiçbir şey yazmaz. `src/data/bilgiMerkezi/yazilar.ts` içindeki
// `vh:aile/…`, `vh:model/…`, `vh:kategori/…` kimliklerini toplar ve verilen etkilenen kimliklerle kesiştirir.
// Kesişim varsa çıkış kodu 1: YAZMA, önce rehber bağı değişir (BLOG/URUN; ayrı iş).
//
// KULLANIM (yazım bloğundan ÖNCE; paket şablonu 0. adım):
//   node scripts/db/product-data/rehber-bagi-onkontrol.mjs --aile slug1,slug2 [--model kod1,kod2] [--kategori slug]
//   --aile      yazımdan sonra AKTİF ÜRÜNÜ 0 KALACAK ailelerin slug'ı (paketin 0. SQL adımı listeler)
//   --model     arşivlenecek/silinecek modellerin model_code ya da slug'ı (rehber vh:model/ kullanıyorsa)
//   --kategori  yazımdan sonra boşalacak ya da adı/slug'ı değişecek kategori slug'ı
//   --yazilar   (opsiyonel) yazilar.ts yolu; varsayılan depo kökünden
// Çıkış: 0 kesişim yok; 1 kesişim var; 2 hatalı kullanım ya da dosya okunamadı.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

export function kimlikleriTopla(metin) {
  // satır satır: hangi satırda hangi kimlik (rapor için)
  const bulunan = []
  const satirlar = metin.split(/\r?\n/)
  const desen = /vh:(aile|model|kategori)\/([A-Za-z0-9._-]+)/g
  satirlar.forEach((satir, i) => {
    let m
    desen.lastIndex = 0
    while ((m = desen.exec(satir)) !== null) bulunan.push({ tur: m[1], slug: m[2], satir: i + 1 })
  })
  return bulunan
}

export function kesisim(bulunan, etkilenen) {
  const kume = {
    aile: new Set(etkilenen.aile),
    model: new Set(etkilenen.model),
    kategori: new Set(etkilenen.kategori),
  }
  return bulunan.filter((b) => kume[b.tur]?.has(b.slug))
}

function liste(v) {
  return (v ?? '').split(',').map((s) => s.trim()).filter(Boolean)
}

function bayrakOku(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) return null
    o[argv[i].slice(2)] = argv[i + 1]
    i++
  }
  return o
}

const bu = fileURLToPath(import.meta.url)
if (process.argv[1] && resolve(process.argv[1]) === bu) {
  const o = bayrakOku(process.argv.slice(2))
  const etkilenen = o
    ? { aile: liste(o.aile), model: liste(o.model), kategori: liste(o.kategori) }
    : null
  if (!etkilenen || etkilenen.aile.length + etkilenen.model.length + etkilenen.kategori.length === 0) {
    console.error('Kullanım: --aile a,b [--model x] [--kategori y]  (en az biri dolu olmalı)')
    process.exit(2)
  }
  const yol = o.yazilar ? resolve(o.yazilar) : resolve(kok, 'src/data/bilgiMerkezi/yazilar.ts')
  let metin
  try {
    metin = readFileSync(yol, 'utf8')
  } catch (e) {
    console.error(`yazilar.ts okunamadı (${yol}): ${e.message}`)
    process.exit(2)
  }
  const bulunan = kimlikleriTopla(metin)
  const vurulan = kesisim(bulunan, etkilenen)
  console.log(`taranan kimlik: ${bulunan.length} (aile ${bulunan.filter((b) => b.tur === 'aile').length}, kategori ${bulunan.filter((b) => b.tur === 'kategori').length}, model ${bulunan.filter((b) => b.tur === 'model').length})`)
  if (vurulan.length === 0) {
    console.log('ÖN-KONTROL TEMİZ: yazılacak satırların etkilediği hiçbir aile/model/kategori rehber bağında geçmiyor.')
    process.exit(0)
  }
  console.error('ÖN-KONTROL KIRMIZI: YAZMA. Rehber bağı bu kimlikleri kullanıyor; önce rehber güncellenir:')
  for (const v of vurulan) console.error(`  yazilar.ts:${v.satir}  vh:${v.tur}/${v.slug}`)
  process.exit(1)
}
