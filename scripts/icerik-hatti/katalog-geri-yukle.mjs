#!/usr/bin/env node
/**
 * TAŞINABİLİR KATALOG — GERİ YÜKLEYİCİ (REC-212, ikinci yarı)
 *
 * NİÇİN VAR: dışa aktarıcı tek başına "taşınabilir katalog" değildir. Bir paket ancak
 * GERİ YÜKLENEBİLDİĞİ ölçüde taşınabilirdir; o yarısı ölçülmedikçe elimizde yalnız
 * "veriyi dosyaya yazabiliyoruz" iddiası olur — ki bu Recep'in sorduğu şey değildi.
 *
 * İKİ KİP:
 *   1) ÖLÇÜM (varsayılan, kuru): paketi bir DB ile satır satır VE kolon kümesiyle karşılaştırır.
 *      Hedef verilmezse canlı (VENTHUB_ENV). Paket canlıdan çıktıysa 0 fark beklenir;
 *      fark çıkıyorsa suçlu DIŞA AKTARICIDIR (bir kolonu/tabloyu pakete koymamış).
 *   2) YÜKLEME (`--yaz --hedef-env=<dosya>`): paketi BOŞ ve CANLI OLMAYAN bir DB'ye kurar,
 *      sonra aynı ölçümü o DB'de koşar (round-trip) ve bitiş sayılarını basar.
 *      Kilitler (katalog-yukle.mjs, sınavlı): hedef canlı projeyse RED; hedefte ürün varsa RED.
 *      Canlıya ya da dolu DB'ye yükleme bu betikte YOK — o, upsert/tenant eşleme kararı ister.
 *
 * SIRA: brands -> categories (ebeveyn önce) -> product_families -> price_lists -> products
 *       -> product_prices -> product_images.
 */
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { SIRA, hedefKilidi, tabloSirala, partiler, farkOlc, farkSifirMi, bitisSayilari, icerikTuru } from './katalog-yukle.mjs'
import { sha256 } from './paket-gorsel.mjs'

const KOVA = 'product-images'
const gorsel = { dogrulanan: 0, eksik: [], bozuk: [] }

const arg = (ad) => process.argv.find(a => a.startsWith(`--${ad}=`))?.slice(ad.length + 3)
const PAKET = arg('paket')
if (!PAKET) { console.error('⛔ --paket=<dizin> gerekli'); process.exit(1) }
if (!existsSync(join(PAKET, 'manifest.json'))) {
  console.error(`⛔ ${PAKET}/manifest.json YOK — bu bir katalog paketi değil (ya da yarım kalmış).`)
  console.error('   Manifest\'siz dizin yüklenmez: hangi tablodan kaç satır beklendiği bilinmeden')
  console.error('   eksik yükleme, tam yüklemeden ayırt edilemez.')
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(join(PAKET, 'manifest.json'), 'utf8'))

// JSONL YERİ: dışa aktarıcı 2026-09-09'dan beri tabloları `<paket>/ham/` altına yazıyor
// (insan-okur CSV'ler kökte). Bu betik kökte aradığı için round-trip sınaması 13 gün boyunca
// "brands.jsonl EKSİK" deyip DURUYORDU — hiç koşmadı, kimse görmedi (2026-09-22 ölçüldü).
// Önce ham/, yoksa kök (09-09 öncesi paketler). İkisi de yoksa aşağıdaki kontrol durdurur.
const HAM = existsSync(join(PAKET, 'ham')) ? join(PAKET, 'ham') : PAKET

const envOku = (yol) => Object.fromEntries(
  readFileSync(yol, 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const baglanti = (env) => {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  return { url, key, H: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' } }
}

const CANLI_ENV = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
const canli = baglanti(envOku(CANLI_ENV))
const HEDEF_ENV = arg('hedef-env')
if (HEDEF_ENV && !existsSync(HEDEF_ENV)) { console.error(`⛔ --hedef-env dosyası yok: ${HEDEF_ENV}`); process.exit(1) }
const hedef = HEDEF_ENV ? baglanti(envOku(HEDEF_ENV)) : canli
if (!hedef.url || !hedef.key) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(1) }
const yaz = process.argv.includes('--yaz')

// ---- 1) PAKET BÜTÜNLÜĞÜ: manifest hash'i tutmuyorsa yükleme YOK.
for (const t of SIRA) {
  const yol = join(HAM, `${t}.jsonl`)
  if (!existsSync(yol)) { console.error(`⛔ ${t}.jsonl paketten EKSİK — yarım paket, yükleme yapılmadı`); process.exit(1) }
  const govde = readFileSync(yol, 'utf8')
  const hash = createHash('sha256').update(govde).digest('hex')
  const beklenen = manifest.tablolar?.[t]?.sha256
  if (hash !== beklenen) {
    console.error(`⛔ ${t}.jsonl BOZUK ya da DEĞİŞTİRİLMİŞ — manifest ${String(beklenen).slice(0, 12)}, dosya ${hash.slice(0, 12)}`)
    process.exit(1)
  }
}
console.log(`✓ paket bütünlüğü: ${SIRA.length} tablo, sha256 hepsi tuttu\n`)

const oku = (t) => readFileSync(join(HAM, `${t}.jsonl`), 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s))

async function tabloOku(b, t) {
  let satir = []
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${b.url}/rest/v1/${t}?select=*&order=id&limit=1000&offset=${off}`, { headers: b.H })
    if (!r.ok) throw new Error(`${t} okunamadı: ${r.status}`)
    const g = await r.json()
    satir = satir.concat(g); if (g.length < 1000) break
  }
  return satir
}

async function urunSayisi(b) {
  let r
  try { r = await fetch(`${b.url}/rest/v1/products?select=id`, { headers: { ...b.H, Prefer: 'count=exact', Range: '0-0' } }) } catch { return null }
  if (!r.ok) return null
  const n = Number((r.headers.get('content-range') || '').split('/')[1])
  return Number.isInteger(n) ? n : null
}

// ---- 2) YÜKLEME (yalnız --yaz): kilit → tablo tablo, ebeveyn önce, 500'lük partiler.
if (yaz) {
  if (!HEDEF_ENV) {
    console.error('⛔ --yaz için --hedef-env=<dosya> ZORUNLU. Varsayılan hedef canlıdır ve bu kol canlıya yazmaz.')
    process.exit(1)
  }
  const kilit = hedefKilidi({ hedefAdres: hedef.url, canliAdres: canli.url, hedefUrunSayisi: await urunSayisi(hedef) })
  if (!kilit.izin) { console.error(`⛔ YÜKLEME REDDEDİLDİ: ${kilit.sebep}`); process.exit(1) }
  console.log(`YÜKLEME: ${kilit.sebep}`)
  for (const t of SIRA) {
    const satirlar = tabloSirala(t, oku(t))
    let yazilan = 0
    for (const parti of partiler(satirlar)) {
      const r = await fetch(`${hedef.url}/rest/v1/${t}`, {
        method: 'POST', headers: { ...hedef.H, Prefer: 'return=minimal' }, body: JSON.stringify(parti),
      })
      if (!r.ok) {
        console.error(`⛔ ${t}: ${yazilan}/${satirlar.length} satırdan sonra DURDU — ${r.status} ${(await r.text()).slice(0, 300)}`)
        console.error('   Hedef yarım kaldı; boş bir hedefle yeniden başlanır (bu kol dolu hedefe yazmaz).')
        process.exit(1)
      }
      yazilan += parti.length
    }
    console.log(`  ${t.padEnd(18)} yazıldı ${yazilan}`)
  }
  console.log('')

  // ---- 2b) GÖRSEL DOSYALARI: satır yetmez — dosyası olmayan satır yeni ortamda kırık resimdir.
  // Aynı kilidin arkasında (hedef boş, canlı değil). Yüklenen her dosya geri okunur, sha256 ile
  // paketteki kopyayla karşılaştırılır; tutmayan/eksik dosya round-trip'i KIRMIZI yapar.
  const yollar = [...new Set(oku('product_images').map(g => g.path).filter(Boolean))]
  for (const p of yollar) {
    const yerel = join(PAKET, 'gorseller', p)
    if (!existsSync(yerel)) { gorsel.eksik.push(p); continue }
    const tur = icerikTuru(p)
    if (!tur) { gorsel.eksik.push(`${p} (tanınmayan uzantı)`); continue }
    const govde = readFileSync(yerel)
    const r = await fetch(`${hedef.url}/storage/v1/object/${KOVA}/${p}`, {
      method: 'POST', headers: { apikey: hedef.key, authorization: `Bearer ${hedef.key}`, 'content-type': tur }, body: govde,
    })
    if (!r.ok) {
      console.error(`⛔ görsel ${p}: ${r.status} ${(await r.text()).slice(0, 200)}`)
      console.error(`   Hedefte "${KOVA}" kovası yoksa önce migration zinciri uygulanmalı (kova migration'la kurulur).`)
      process.exit(1)
    }
    const geri = await fetch(`${hedef.url}/storage/v1/object/public/${KOVA}/${p}`)
    const gb = geri.ok ? Buffer.from(await geri.arrayBuffer()) : null
    if (gb && sha256(gb) === sha256(govde)) gorsel.dogrulanan++
    else gorsel.bozuk.push(p)
  }
  console.log(`  görsel dosyası       ${yollar.length} yol · yüklenip sha256 ile geri okunan ${gorsel.dogrulanan} · eksik ${gorsel.eksik.length} · tutmayan ${gorsel.bozuk.length}\n`)
}

// ---- 3) FARK: paketteki her satır hedefte var mı, aynı mı; kolon kümesi aynı mı?
let toplam = { ayni: 0, degisik: 0, yeni: 0, fazla: 0, kolon: 0 }
const ornekler = []
const hedefUrun = [], hedefGorsel = []
for (const t of SIRA) {
  const paketSatir = oku(t)
  let hedefSatir
  try { hedefSatir = await tabloOku(hedef, t) } catch (e) { console.error(`⛔ ${e.message}`); process.exit(1) }
  if (t === 'products') hedefUrun.push(...hedefSatir)
  if (t === 'product_images') hedefGorsel.push(...hedefSatir)
  const f = farkOlc(paketSatir, hedefSatir)
  toplam.ayni += f.ayni; toplam.degisik += f.degisik; toplam.yeni += f.yeni; toplam.fazla += f.fazla
  toplam.kolon += f.eksikKolon.length + f.fazlaKolon.length
  for (const o of f.ornekler) if (ornekler.length < 20) ornekler.push(`${t}: ${o}`)
  if (f.eksikKolon.length) ornekler.push(`${t}: PAKETTE EKSİK KOLON ${f.eksikKolon.join(', ')}`)
  if (f.fazlaKolon.length) ornekler.push(`${t}: HEDEFTE OLMAYAN KOLON ${f.fazlaKolon.join(', ')}`)
  console.log(`  ${t.padEnd(18)} paket ${String(paketSatir.length).padStart(5)} · aynı ${String(f.ayni).padStart(5)} · değişik ${String(f.degisik).padStart(4)} · yeni ${String(f.yeni).padStart(4)} · hedefte fazla ${f.fazla} · kolon farkı ${f.eksikKolon.length + f.fazlaKolon.length}`)
  toplam.sifir = (toplam.sifir ?? true) && farkSifirMi(f)
}

console.log(`\nTOPLAM  aynı ${toplam.ayni} · değişik ${toplam.degisik} · yeni ${toplam.yeni} · hedefte fazla ${toplam.fazla} · kolon farkı ${toplam.kolon}`)
if (ornekler.length) { console.log('\nilk farklar:'); for (const d of ornekler.slice(0, 20)) console.log('  ' + d) }

const gorselTamam = !yaz || (gorsel.eksik.length === 0 && gorsel.bozuk.length === 0)
for (const p of [...gorsel.eksik, ...gorsel.bozuk].slice(0, 10)) console.log('  görsel dosyası SORUNLU: ' + p)
const roundTrip = toplam.sifir === true && gorselTamam
console.log(`\nROUND-TRIP: ${roundTrip ? '✓ SIFIR FARK — paket bu DB\'yi eksiksiz tarif ediyor (satır + kolon)' : '⚠ FARK VAR — paket bu DB\'yi tam tarif etmiyor ya da DB paket üretildikten sonra değişti'}`)

if (yaz) {
  const p = bitisSayilari(oku('products'), oku('product_images'))
  const h = bitisSayilari(hedefUrun, hedefGorsel)
  console.log('\nBİTİŞ SAYILARI (paket → hedef):')
  p.gorselDosya = new Set(oku('product_images').map(g => g.path).filter(Boolean)).size
  h.gorselDosya = gorsel.dogrulanan
  for (const k of Object.keys(p)) console.log(`  ${k.padEnd(12)} ${String(p[k]).padStart(6)} → ${String(h[k]).padStart(6)} ${p[k] === h[k] ? '✓' : '✗'}`)
} else {
  console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Boş hedefe kurmak için: --yaz --hedef-env=<dosya>')
}
process.exit(roundTrip ? 0 : 1)
