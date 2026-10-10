#!/usr/bin/env node
/**
 * ÜRÜN AÇIKLAMASI GERİ ALMA — `urun-aciklama-duzelt.mjs --yaz` kaydından `description_i18n`'yi eski haline döndürür (KTL-17)
 *
 * ── NİÇİN VAR
 * Ürün yazıcısı her yazımdan ÖNCE `--out` dizinine `aciklama-<damga>.json` yazar (eski metinler elde kalsın diye),
 * ama bu veriyi canlıya geri yazan araç yoktu: 254 alanlık ürün yazımında geri alma elle PATCH olurdu.
 *
 * ── KURU KOŞUM VARSAYILANDIR
 * Her satır için canlı description_i18n kayıttaki hallerle karşılaştırılır ve şu çıktı basılır:
 *   "ÖZET: N satır geri alınır · K zaten geri alınmış · M sonradan değişmiş (dokunulmaz) · B bulunamadı · Y yazılmamış"
 *   GERİ ALINIR          canlı == yazdığımız metin → onceki'ne döndürülür
 *   zaten geri alınmış   canlı == onceki
 *   SONRADAN DEĞİŞMİŞ    canlı ikisine de eşit değil → DOKUNULMAZ, hangi anahtarların farklı olduğu raporlanır
 *   BULUNAMADI           satır canlıda yok (silinmiş ya da kimlik yanlış) → dokunulmaz, raporlanır
 *   yazıcı yazmamış      onceki == sonraki (yarışta başkası aynı değişikliği yapmıştı) → atlanır
 * Yarışta araya girilen satırlar için geri alma değeri `yarislar[]` kaydıdır (yazıcının yazmadan hemen önce gördüğü TAZE hal);
 * `kayitlar[].onceki` yarıştan ÖNCEKİ halidir ve KULLANILMAZ (başka yazarın değişikliğini ezerdi).
 *
 * ── İKİ ANAHTAR
 * `--yaz` bayrağı VE `CANLI_YAZIM_ONAYI` ortam değişkeni birlikte gerekir. Biri eksikse kuru koşum.
 *
 * ── YAZIM
 * Yazmadan ÖNCE geri alınacak satırların CANLI hali `geri-alma-yedek-<damga>.json`'a yazılır (geri almayı geri almak için).
 * PATCH `updated_at=eq.<okunan>` koşulludur. 0 satır dönerse satır yeniden okunur: değişmişse araya girilmiştir →
 * DOKUNULMAZ ve raporlanır (yeniden DENENMEZ: geri alma başkasının yazdığını ezmemeli); değişmemişse yarış değil,
 * yetki/RLS şüphesi → çıkış 1. Yazdıktan sonra satır canlıdan geri okunur ve onceki ile kanonik JSON eşitliği aranır.
 *
 * KOŞUM: node urun-geri-al.mjs --kayit <aciklama-...json> --url <URL> --key <KEY> [--yaz] [--out <dizin>]
 * Çıkış: 0 tamam (kuru koşum dahil; kuru koşumda "değişmiş" satır bilgi içindir) · 1 yazımda eksik kalan satır
 *        (sonradan değişmiş/bulunamadı/araya girilmiş) ya da yazım/geri okuma hatası · 2 ÖLÇÜLEMEDİ (dosya, şema, ağ; fail-closed).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { kanonikEsit } from './aile-blok-duzelt-kurallar.mjs'
import { degisenAnahtarlar, geriAlmaHedefleri, kayitSemasi, satirDurumu } from './urun-geri-al-kurallar.mjs'

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const KAYIT = arg('kayit'), URL_ = arg('url'), KEY = arg('key'), OUT = arg('out', '.')
const YAZ = process.argv.includes('--yaz')
const ONAY = process.env.CANLI_YAZIM_ONAYI || ''

if (!KAYIT || !URL_ || !KEY) {
  console.error('kullanım: --kayit <aciklama-...json> --url <URL> --key <KEY> [--yaz] [--out <dizin>]')
  process.exit(2)
}
let ham
try { ham = JSON.parse(readFileSync(KAYIT, 'utf8')) } catch (e) {
  console.error(`ÖLÇÜLEMEDİ — kayıt dosyası okunamadı ya da JSON değil: ${KAYIT} (${e.message})`); process.exit(2)
}
const sema = kayitSemasi(ham)
if (sema.hatalar.length || !sema.kayit) {
  console.error('ÖLÇÜLEMEDİ — kayıt dosyası şeması geçersiz:')
  for (const h of sema.hatalar) console.error(`   ${h}`)
  process.exit(2)
}
const hedefler = geriAlmaHedefleri(sema.kayit)

const rest = async (p, method = 'GET', body) => {
  let r
  try {
    r = await fetch(`${URL_}/rest/v1/${p}`, {
      method,
      headers: { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    })
  } catch (e) {
    // Ağ yok / zaman aşımı: yakalanmamış hata değil, fail-closed ÖLÇÜLEMEDİ. PATCH'te yazım durumu BELİRSİZDİR.
    console.error(`ÖLÇÜLEMEDİ — ağ hatası ${method} ${p.slice(0, 70)}: ${e?.cause?.code ?? e?.name ?? 'bilinmiyor'}` +
      (method === 'PATCH' ? ' — YAZIM DURUMU BELİRSİZ: canlıyı oku, geri alma yedeğine bak' : ''))
    process.exit(2)
  }
  const t = await r.text()
  if (!r.ok) { console.error(`DB HATA ${r.status} ${method} ${p}: ${t.slice(0, 300)}`); process.exit(1) }
  return t ? JSON.parse(t) : []
}
const SECIM = 'id,sku,name,updated_at,description_i18n'
/** Koşullu PATCH yolu: updated_at KODLANIR ("+" kodlanmazsa PostgREST'te boşluk okunur ve eşleşme olmaz). */
const patchYolu = (id, updatedAt) => `products?id=eq.${id}&updated_at=eq.${encodeURIComponent(updatedAt)}`

const canliSatirlar = await rest(`products?id=in.(${hedefler.map(h => h.id).join(',')})&select=${SECIM}`)
const canli = new Map(canliSatirlar.map(r => [r.id, r]))

console.log(`KAYIT: ${KAYIT}  ·  ${hedefler.length} ürün (yarışta değişen: ${hedefler.filter(h => h.kaynak === 'yaris').length})\n`)
const geriAlinacak = []
const sayi = { geriAl: 0, zaten: 0, degismis: 0, bulunamadi: 0, yazilmamis: 0 }
for (const h of hedefler) {
  const satir = canli.get(h.id)
  console.log(`  ${h.sku}${satir?.name ? '  ' + satir.name : ''}${h.kaynak === 'yaris' ? '   [yarış kaydı kullanılıyor]' : ''}`)
  if (!satir) { console.log('      BULUNAMADI — satır canlıda yok (silinmiş ya da kimlik yanlış), dokunulmaz'); sayi.bulunamadi++; continue }
  const durum = satirDurumu(satir.description_i18n, h)
  if (durum === 'geri-al') { console.log('      GERİ ALINIR (canlı = yazdığımız metin)'); sayi.geriAl++; geriAlinacak.push({ h, satir }) }
  else if (durum === 'zaten-geri-alinmis') { console.log('      zaten geri alınmış (canlı = eski metin)'); sayi.zaten++ }
  else if (durum === 'yazilmamis') { console.log('      yazıcı bu satıra yazmamış (eski = yeni, yarışta başkası uygulamış) — atlanır'); sayi.yazilmamis++ }
  else {
    console.log(`      SONRADAN DEĞİŞMİŞ — DOKUNULMADI (canlı ne yazdığımıza ne eskiye eşit; farklı anahtarlar: ${degisenAnahtarlar(satir.description_i18n, h.sonraki).join(', ') || '-'})`)
    sayi.degismis++
  }
}
console.log(`\nÖZET: ${sayi.geriAl} satır geri alınır · ${sayi.zaten} zaten geri alınmış · ${sayi.degismis} sonradan değişmiş (dokunulmaz) · ${sayi.bulunamadi} bulunamadı · ${sayi.yazilmamis} yazılmamış`)

if (!geriAlinacak.length) {
  console.log('Geri alınacak satır yok — çıkılıyor.')
  process.exit(YAZ && ONAY && (sayi.degismis || sayi.bulunamadi) ? 1 : 0)
}
if (!YAZ || !ONAY) {
  console.log('\nKURU KOŞUM — hiçbir şey yazılmadı.')
  console.log(`  --yaz bayrağı: ${YAZ ? 'VAR' : 'YOK'} · CANLI_YAZIM_ONAYI: ${ONAY ? 'VAR' : 'YOK'}`)
  console.log('  İkisi de gerekli. Bu metin MÜŞTERİYE GÖRÜNÜR.')
  process.exit(0)
}

// Geri almayı geri alabilmek için: yazmadan ÖNCE geri alınacak satırların CANLI hali.
mkdirSync(OUT, { recursive: true })
const damga = new Date().toISOString().replace(/[:.]/g, '-')
const yedekYol = join(OUT, `geri-alma-yedek-${damga}.json`)
writeFileSync(yedekYol, JSON.stringify({
  onay: ONAY, kayitDosyasi: KAYIT,
  satirlar: geriAlinacak.map(({ h, satir }) => ({ id: h.id, sku: h.sku, updated_at: satir.updated_at, canli: satir.description_i18n })),
}, null, 2), 'utf8')
console.log(`\nGERİ ALMA YEDEĞİ: ${yedekYol}`)

let geriAlinan = 0
let arayaGirilen = 0
for (const { h, satir } of geriAlinacak) {
  const donen = await rest(patchYolu(h.id, satir.updated_at), 'PATCH', { description_i18n: h.onceki })
  if (donen.length === 0) {
    // 0 satır: ya okuma ile yazma arasında başkası satırı değiştirdi ya da yazma yetkisi yok (RLS yazmayı sessizce boşaltır).
    const taze = await rest(`products?id=eq.${h.id}&select=${SECIM}`)
    if (taze.length !== 1) { console.error(`⛔ KIRMIZI: ${h.sku} PATCH 0 satır güncelledi ve satır yeniden okunamadı.`); process.exit(1) }
    if (taze[0].updated_at === satir.updated_at) {
      console.error(`⛔ KIRMIZI: ${h.sku} PATCH 0 satır güncelledi ama satır DEĞİŞMEMİŞ — yarış değil, yetki/RLS şüphesi.`); process.exit(1)
    }
    console.log(`  ${h.sku}: okuma ile yazma arasında araya girilmiş — DOKUNULMADI (yeniden denenmez)`)
    arayaGirilen++
    continue
  }
  // Geri okuma: PATCH'in yanıtına DEĞİL, canlıdaki satıra bak (kanonik JSON eşitliği; jsonb anahtar sırasını bozabilir).
  const oku = await rest(`products?id=eq.${h.id}&select=sku,description_i18n`)
  if (oku.length !== 1 || !kanonikEsit(oku[0].description_i18n, h.onceki)) {
    console.error(`⛔ KIRMIZI: ${h.sku} geri okuma beklenenden FARKLI — geri alma kalıcı olmamış ya da başka yazar araya girmiş.`); process.exit(1)
  }
  geriAlinan++
}
console.log(`GERİ ALMA TAMAM: ${geriAlinan}/${geriAlinacak.length} satır · geri okuma: hepsi beklenen` +
  (arayaGirilen ? ` · araya girilen (dokunulmadı): ${arayaGirilen}` : '') +
  (sayi.degismis ? ` · sonradan değişmiş (dokunulmadı): ${sayi.degismis}` : '') +
  (sayi.bulunamadi ? ` · bulunamadı: ${sayi.bulunamadi}` : ''))
process.exit(arayaGirilen || sayi.degismis || sayi.bulunamadi ? 1 : 0)
