/**
 * YAYINDAKİ MODELLER AĞ KAPISI — URN-31 (karar 259 kısa pilot mekanizması).
 *
 * NİÇİN: liste (`src/config/yayindaModeller.veri.json`) derleme sabitidir; DB ile ayrışırsa model sayfası ya 404
 * verir (SKU pasif/silinmiş) ya da yanlış ailenin altında açılır. Bu kapı canlı DB'yi YALNIZ OKUR (REST GET,
 * salt SELECT; anon anahtar — yazma, RPC, migration yok) ve her liste SKU'su için şunu doğrular:
 *   · `products`'ta var · `status` = active · `deleted_at` boş · `family_id` → aile slug'ı listedeki aile.
 *   · sürüm SKU'sunun ailesi temel modelinin ailesi.
 * Not (araştırma bulgusu): sayfa tarafı `getCachedModelBySku` status'a bakmaz, site haritası bakar — bu kapı
 * ikisinin ayrışmasını da yakalar (pasif SKU listede kalırsa kapı KIRMIZI).
 *
 * Kullanım:   node scripts/seo/yayinda-model-ag-kapisi.mjs
 *   Ortam: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (yalnız liste doluyken gerekir).
 * Çıkış: 0 temiz (BOŞ liste dahil: ağa çıkılmaz) · 1 KIRMIZI (DB ile ayrışma) · 2 ÖLÇÜLEMEDİ (ortam eksik / ağ hatası:
 *   "temiz" sayılmaz). Ağa çıkar (liste doluyken); `ci`'da koşmaz — açma PR'ı öncesi elle/denetimde.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const VERI_DOSYASI = join(KOK, 'src', 'config', 'yayindaModeller.veri.json')

/** Listedeki tüm SKU'lar ve beklenen aile slug'ları: [{ sku, aile, surum }]. */
export function beklenenler(veri) {
  const aileOf = new Map()
  const liste = []
  for (const [aile, grup] of Object.entries(veri.modeller ?? {})) {
    for (const sku of Object.keys(grup)) {
      aileOf.set(sku, aile)
      liste.push({ sku, aile, surum: false })
    }
  }
  for (const [sku, kayit] of Object.entries(veri.surumler ?? {})) {
    liste.push({ sku, aile: aileOf.get(kayit.temel) ?? null, surum: true })
  }
  return liste
}

/**
 * Saf karar: DB satırları (`products`: sku, status, deleted_at, family_id · `product_families`: id, slug) liste ile
 * uyumlu mu? Hata metinleri döner (boş = temiz).
 */
export function agKapisiDegerlendir(veri, urunler, aileler) {
  const urunOf = new Map(urunler.map((u) => [u.sku, u]))
  const aileSlug = new Map(aileler.map((a) => [a.id, a.slug]))
  const hatalar = []
  for (const { sku, aile, surum } of beklenenler(veri)) {
    const etiket = surum ? `${sku} (sürüm)` : sku
    const u = urunOf.get(sku)
    if (!u) {
      hatalar.push(`${etiket}: DB'de yok`)
      continue
    }
    if (u.status !== 'active') hatalar.push(`${etiket}: status "${u.status}" (active değil)`)
    if (u.deleted_at !== null && u.deleted_at !== undefined) hatalar.push(`${etiket}: silinmiş (deleted_at dolu)`)
    const gercek = u.family_id ? aileSlug.get(u.family_id) : undefined
    if (aile === null) hatalar.push(`${etiket}: temel modeli listede yok, aile beklenemiyor`)
    else if (gercek === undefined) hatalar.push(`${etiket}: ailesi yok ya da okunamadı`)
    else if (gercek !== aile) hatalar.push(`${etiket}: aile "${gercek}" ≠ listedeki "${aile}"`)
  }
  return hatalar
}

async function getir(taban, anahtar, yol) {
  const yanit = await fetch(`${taban}/rest/v1/${yol}`, { headers: { apikey: anahtar, Authorization: `Bearer ${anahtar}` } })
  if (!yanit.ok) throw new Error(`${yol.split('?')[0]} GET ${yanit.status}`)
  return yanit.json()
}

async function calistir() {
  const veri = JSON.parse(readFileSync(VERI_DOSYASI, 'utf8'))
  const beklenen = beklenenler(veri)
  if (beklenen.length === 0) {
    console.log('yayinda-model-ag-kapisi: liste BOŞ — kontrol edilecek model yok (ağa çıkılmadı). TEMİZ.')
    return 0
  }
  const taban = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anahtar = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!taban || !anahtar) {
    console.error('yayinda-model-ag-kapisi: ÖLÇÜLEMEDİ — NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY yok (temiz sayılmaz).')
    return 2
  }
  try {
    const skular = beklenen.map((b) => encodeURIComponent(b.sku)).join(',')
    const urunler = await getir(taban, anahtar, `products?select=sku,status,deleted_at,family_id&sku=in.(${skular})`)
    const aileIdleri = [...new Set(urunler.map((u) => u.family_id).filter(Boolean))].join(',')
    const aileler = aileIdleri ? await getir(taban, anahtar, `product_families?select=id,slug&id=in.(${aileIdleri})`) : []
    const hatalar = agKapisiDegerlendir(veri, urunler, aileler)
    if (hatalar.length > 0) {
      console.error(`yayinda-model-ag-kapisi: KIRMIZI (${hatalar.length}):\n- ${hatalar.join('\n- ')}`)
      return 1
    }
    console.log(`yayinda-model-ag-kapisi: ${beklenen.length} SKU aktif, silinmemiş, doğru ailede. TEMİZ.`)
    return 0
  } catch (hata) {
    console.error(`yayinda-model-ag-kapisi: ÖLÇÜLEMEDİ — ${hata instanceof Error ? hata.message : String(hata)}`)
    return 2
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(await calistir())
}
