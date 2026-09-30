// Satış kipi geçiş betiği — TEK KOMUTLA aç/kapat, yedekli, geri alınabilir (REC-168).
// Cetvel: docs/standards/satis-kipi-gecis-standard.md §6
//
// Kullanım:
//   node scripts/kip/satis-kipine-gec.mjs --yon ac                   # KURU KOŞUM (varsayılan): ölçer, planı ve yedeği yazar, CANLIYA YAZMAZ
//   node scripts/kip/satis-kipine-gec.mjs --yon kapat                 # aynı, ters yön
//   node scripts/kip/satis-kipine-gec.mjs --yon ac --uygula --onay "Recep 2026-09-xx"   # canlıya yazar (Recep kapısı)
//   node scripts/kip/satis-kipine-gec.mjs --geri-al <yedek.json> [--uygula --onay "..."] # yedekteki hâle döndürür
//   node scripts/kip/satis-kipine-gec.mjs --dogrula                   # yalnız ölçer ve tutarlılık hükmü verir (çıkış 0/2)
//   node scripts/kip/satis-kipine-gec.mjs --onkosul                   # yalnız AÇILIŞ ÖNKOŞULLARI tablosu (salt okuma; çıkış 0 = hepsi geçti, 2 = geçmeyen var)
//   ... --yon ac --uygula --onay "..." [--fatura-beyani "<Recep sözü · tarih>"] [--muaf K1 --muaf-gerekce "<≥20 karakter>"]
//
// AÇILIŞ ÖNKOŞULLARI (INV-SATIS-KIPI-7, acilis-onkosullari.mjs): yönü AÇ olan her koşum (kuru koşum dahil) önkoşul
// tablosunu ölçer ve basar; `--uygula` bir kalem GEÇTİ değilse (ölçülemedi dahil) canlıya HİÇBİR ŞEY yazmadan çıkış 1 verir.
// Kapatmak (`--yon kapat`, hedefi kapalı `--geri-al`) önkoşula tabi DEĞİLDİR. Genel atlama bayrağı YOK; yalnız K1/K6 için
// gerekçeli damgalı muafiyet. Sıra: önkoşul → taze ölçüm → yedek → K2/K4/K5 yeniden ölçüm → yazma.
//
// NİÇİN VARSAYILAN KURU KOŞUM: bu betik canlı vitrinin fiyat görünürlüğünü ve ödeme yolunu çevirir.
// Yanlış yönde bir koşum müşteriye fiyat/ödeme gösterir ya da satışı keser. `--uygula` olmadan
// hiçbir yazma çağrısı yapılmaz (kapı bunu mock istemciyle ölçer: INV-SATIS-KIPI-4).
//
// NİÇİN --onay METNİ: canlı yazım Recep kapısıdır (CLAUDE.md kural 13 ruhu: prod'a yazan şey
// onayla gider). Metin rapora ve site_settings satırına damgayla yazılır — "kim, ne zaman, kimin
// sözüyle" sonradan okunabilir. Betik onayı DOĞRULAYAMAZ, yalnız KAYDEDER; kapı olan Recep'tir.
//
// NE ÇEVİRİR (iki yer, aynı komut — cetvel §5: hide_price anahtardan TÜREMEZ, birlikte çevrilir):
//   1. site_settings key='satis_kipi' value.acik  (anahtarın tek kaynağı; RSC `satisKipiOku()` okur)
//   2. categories.metadata.hide_price              (37 kategori; quoteMode.ts dal 2 okur)
// SIRA fail-safe: AÇARKEN önce kategoriler sonra anahtar (yarım kalırsa fiyat görünür ama ödeme kapalı —
// ilan, satış değil); KAPATIRKEN önce anahtar sonra kategoriler (yarım kalırsa ödeme kapalı, fiyat
// bir süre görünür — güvenli taraf yine ödemesizlik).
//
// NE ÇEVİRMEZ: fiyatı olmayan ürünler (K39, Recep 2026-09-06): satış kipinde TEKLİF İSTE olarak
// görünürler, gizlenmezler. Bu betik onlara DOKUNMAZ; davranış kodda (quoteMode.ts dal 3: fiyat yok →
// teklif modu) zaten var. Betik yalnız SAYAR ve raporlar.
//
// YEDEK: repo DIŞINA yazılır (~/venthub-hvac-kip-yedek/ ya da VENTHUB_KIP_YEDEK_DIR) — repo PUBLIC,
// yedek canlı veri taşır. Kuru koşumda da yazılır: geri alma dosyası her zaman koşumdan ÖNCEKİ hâldir.
import { createClient } from '@supabase/supabase-js'

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { acilisKapisi, degerlendir, izinliEnvAl, MUAFIYET_GEREKCE_ASGARI, onkosulOlc, suz, tabloYaz } from './acilis-onkosullari.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')

// ---------- argümanlar ----------
const argv = process.argv.slice(2)
const arg = (ad) => {
  const i = argv.indexOf(ad)
  return i >= 0 ? argv[i + 1] : undefined
}
const bayrak = (ad) => argv.includes(ad)
const hepsi = (ad) => argv.flatMap((a, i) => (a === ad && argv[i + 1] !== undefined ? [argv[i + 1]] : []))

const UYGULA = bayrak('--uygula')
const DOGRULA = bayrak('--dogrula')
const ONKOSUL = bayrak('--onkosul')
const GERI_AL = arg('--geri-al')
const YON = arg('--yon')
const ONAY = arg('--onay')
const MUAF = hepsi('--muaf')
const MUAF_GEREKCE = arg('--muaf-gerekce')
const FATURA_BEYANI = arg('--fatura-beyani')

const ANAHTAR_KEY = 'satis_kipi'
const HIDE_PRICE = 'hide_price'

function hata(mesaj) {
  process.stderr.write('HATA: ' + mesaj + '\n')
  process.exit(1)
}

// Argüman/env/yedek-dizini kontrolleri IMPORT ANINDA DEĞİL, main() içinde koşar: kapı (INV-SATIS-KIPI-4)
// bu modülü import edip olc/hepsiniCek'i sahte istemciyle çağırır; import anında process.exit olsaydı
// hiçbir test yazılamazdı (ilk sürümde öyleydi — ölçüldü, düzeltildi).
function argumanlariDogrula() {
  if (!DOGRULA && !ONKOSUL && !GERI_AL && YON !== 'ac' && YON !== 'kapat') {
    hata("--yon ac | --yon kapat zorunlu (ya da --dogrula / --onkosul / --geri-al <dosya>). Yön verilmeden hiçbir şey planlanmaz.")
  }
  if (MUAF.length > 0 && (typeof MUAF_GEREKCE !== 'string' || MUAF_GEREKCE.trim().length < MUAFIYET_GEREKCE_ASGARI)) {
    hata(`--muaf için --muaf-gerekce "<asgari ${MUAFIYET_GEREKCE_ASGARI} karakter>" zorunlu; gerekçe rapora ve DB satırına damgalanır.`)
  }
  if (UYGULA && !ONAY) {
    hata('--uygula için --onay "<kim, tarih>" zorunlu. Canlı yazım Recep kapısıdır; onay metni rapora ve DB satırına damgalanır.')
  }
  if (GERI_AL && !existsSync(GERI_AL)) hata('geri alma dosyası yok: ' + GERI_AL)
}

// ---------- env ----------
// .env sırası: VENTHUB_ENV_PATH → repo kökü → ev dizinindeki ana çalışma ağacı (worktree'lerde .env yok).
// Sabit kullanıcı yolu YOK (REC-102; repo public, homedir() aynı yolu çözer). Değerler hiçbir yere basılmaz.
function envYukle() {
  const ENV_PATH =
    process.env.VENTHUB_ENV_PATH ??
    (existsSync(join(REPO, '.env')) ? join(REPO, '.env') : join(homedir(), 'venthub-hvac', '.env'))
  if (!existsSync(ENV_PATH)) hata('.env bulunamadı: ' + ENV_PATH + ' (VENTHUB_ENV_PATH ile ver)')
  const env = Object.fromEntries(
    readFileSync(ENV_PATH, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  )
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) hata('.env içinde SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli (değerler basılmaz)')
  // Önkoşul ölçücülerine YALNIZ izin listesindeki adlar geçer (service-role anahtarı onlara verilmez).
  return { url, key, izinli: izinliEnvAl({ ...env, ...process.env }) }
}

// Kapı (INV-SATIS-KIPI-4) istemciyi enjekte edebilsin diye tek fabrika.
export function istemciKur() {
  const { url, key } = envYukle()
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * DB sorgusu (K4/K5 için `pg_*` kataloğu; PostgREST'ten okunamaz). `SUPABASE_DB_URL` yoksa `null`; bağlanılamazsa
 * sorgu çağrıldığında FIRLATIR → ilgili kalem ÖLÇÜLEMEDİ = RET (bağlantı hatası metni süzülür, dize basılmaz).
 */
async function dbKur(dbUrl) {
  if (!dbUrl) return { sorgu: null, kapat: async () => {} }
  try {
    const { default: pg } = await import('pg')
    const { resolveTls } = await import('../katalog/katalog-sayim.mjs')
    const temiz = dbUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
    const client = new pg.Client({ connectionString: temiz, ssl: resolveTls() })
    await client.connect()
    return { sorgu: async (sql, p) => (await client.query(sql, p)).rows, kapat: () => client.end().catch(() => {}) }
  } catch (e) {
    const neden = suz(e?.message ?? e)
    return {
      sorgu: async () => {
        throw new Error('DB bağlantısı kurulamadı: ' + neden)
      },
      kapat: async () => {},
    }
  }
}

/** K8 için: koşumun HEDEF durumu (şimdiki durum DEĞİL — yarım kalmış açılış onarılabilsin). */
function hedefDurum(d, yon, yedek) {
  if (yedek) {
    const toplam = yedek.kategoriler.length
    return { acik: Boolean(yedek.anahtar?.acik), toplam, hidePriceTrue: yedek.kategoriler.filter((c) => Boolean(c.metadata?.[HIDE_PRICE])).length }
  }
  return { acik: yon === 'ac', toplam: d.kategori.toplam, hidePriceTrue: yon === 'ac' ? 0 : d.kategori.toplam }
}

/**
 * Açılış önkoşul kapısı (INV-SATIS-KIPI-7). Tabloyu basar. `uygula` doğruysa `acilisKapisi` (ilk ölçüm → hazırlık →
 * K2/K4/K5 yeniden ölçüm) ile hüküm verir ve `izin` döner; değilse yalnız ölçer (`izin: null`).
 */
async function onkosulKapisi({ ortam, once, hedef, uygula, hazirlik }) {
  const db = await dbKur(ortam.izinli.SUPABASE_DB_URL)
  const ctx = {
    env: ortam.izinli,
    fetch: globalThis.fetch,
    dbSorgu: db.sorgu,
    anahtarAcik: once.anahtar.acik,
    faturaBeyani: FATURA_BEYANI,
    hedef,
    tutarliMi,
  }
  const muaf = Object.fromEntries(MUAF.map((id) => [id, MUAF_GEREKCE]))
  try {
    yaz('')
    yaz('## açılış önkoşulları (INV-SATIS-KIPI-7)')
    if (uygula) {
      const kapi = await acilisKapisi(ctx, { muaf, hazirlik })
      yaz(tabloYaz(kapi.hukum))
      return { izin: kapi.izin, asama: kapi.asama, hukum: kapi.hukum, muaf }
    }
    const hukum = degerlendir(await onkosulOlc(ctx), { muaf })
    yaz(tabloYaz(hukum))
    return { izin: null, asama: 'olcum', hukum, muaf }
  } finally {
    await db.kapat()
  }
}

// ---------- yedek dizini (repo DIŞI) ----------
function yedekDizini() {
  const d = process.env.VENTHUB_KIP_YEDEK_DIR ?? join(homedir(), 'venthub-hvac-kip-yedek')
  mkdirSync(d, { recursive: true })
  return d
}
const DAMGA = new Date().toISOString().replace(/[:.]/g, '-')

// ---------- ölçüm ----------
/**
 * Tabloyu SAYFALAYARAK tamamen çeker ve ÇEKTİĞİNİ SUNUCUNUN KESİN SAYISIYLA DOĞRULAR.
 *
 * NİÇİN: supabase-js/PostgREST tek çağrıda EN ÇOK 1000 satır döndürür ve fazlasını SESSİZCE keser;
 * `limit=2000` yazmak da işe yaramaz (Katalog ölçtü, 2026-09-06). İlk kuru koşumda 1044 fiyat satırının
 * 44'ü düştü, 14 ürün "fiyatsız" sayıldı (334/41 yerine 348/27). Ölçüt doğruydu, evren eksikti.
 *
 * NİÇİN SAYFALAMAK YETMEZ (Katalog reçetesi): sayfalamanın DOĞRU çalıştığı da ölçülmeli — döngü bittikten
 * sonra aynı filtrelerle `count=exact` (HEAD) istenir; çekilen ≠ kesin ise KIRMIZI ve ÇIK, rapor ÜRETME.
 * Sessiz olduğu için en tehlikeli sınıf: sayım küçük çıkar, hiçbir kapı kırmızı vermez.
 * `kur` her sayfada YENİ sorgu üretir (PostgREST builder tek kullanımlık).
 */
/**
 * `kur(secenek)`: AYNI filtrelerle sorgu üretir; `secenek` `.select()`'in ikinci argümanına geçer.
 * Kesin sayı için `{ count: 'exact', head: true }` ile çağrılır — filtreler TEK yerde tanımlıdır.
 * (İlk sürüm sayıyı filtre zincirinin SONUNA `.select()` ekleyerek istiyordu; supabase-js o seçeneği
 * yutuyor, Content-Range gelmiyor → "her zaman kırmızı", ayırt etmiyor. Ölçüldü, düzeltildi.)
 * Sayı ÖNCE alınır: döngü ona kadar koşar; boş sayfa gelirse durur → uyuşmazlık KIRMIZI. Döngü sınırsız değil
 * (ilk sabotaj taklidi sonsuz döngüye girip belleği doldurdu — tavan bu yüzden var).
 */
export async function hepsiniCek(ad, kur, sayfa = 1000) {
  const { count, error: sayimHatasi } = await kur({ count: 'exact', head: true })
  if (sayimHatasi) throw new Error(ad + ' kesin sayı alınamadı: ' + sayimHatasi.message)
  if (typeof count !== 'number') throw new Error(ad + ' kesin sayı gelmedi (Content-Range yok) — ölçüm GÜVENİLİR DEĞİL')
  const hepsi = []
  for (let baslangic = 0; hepsi.length < count; baslangic += sayfa) {
    const { data, error } = await kur().range(baslangic, baslangic + sayfa - 1)
    if (error) throw new Error(ad + ' okunamadı: ' + error.message)
    if (!data || data.length === 0) break // sunucu daha fazla vermiyor → aşağıda uyuşmazlık yakalanır
    hepsi.push(...data)
  }
  if (count !== hepsi.length) {
    throw new Error(`⛔ EKSİK VERİ: ${ad} — çekilen ${hepsi.length}, sunucu ${count}. Rapor üretilmedi.`)
  }
  return hepsi
}

/**
 * Canlı durumu ölçer. SALT OKUMA. Sayılar cetvel §1 ile aynı evrende: silinmemiş ürünler,
 * aktif fiyat satırı ve gross/net > 0 olan ürün "fiyatlı".
 */
export async function olc(sb) {
  const [kategoriler, ayar, urunler, fiyatlar, aileler] = await Promise.all([
    hepsiniCek('categories', (o) => sb.from('categories').select('id, slug, is_active, metadata', o).order('slug')),
    sb.from('site_settings').select('id, key, value, updated_at').eq('key', ANAHTAR_KEY).maybeSingle(),
    hepsiniCek('products', (o) => sb.from('products').select('id, family_id', o).is('deleted_at', null).order('id')),
    hepsiniCek('product_prices', (o) => sb.from('product_prices').select('product_id, is_active, gross_price, net_price', o).eq('is_active', true).order('id')),
    hepsiniCek('product_families', (o) => sb.from('product_families').select('id, slug', o).order('id')),
  ])
  if (ayar.error) throw new Error('site_settings okunamadı: ' + ayar.error.message)
  const fiyatliUrunIdleri = new Set(
    fiyatlar.filter((p) => Number(p.gross_price ?? 0) > 0 || Number(p.net_price ?? 0) > 0).map((p) => p.product_id)
  )
  const aileSlug = new Map(aileler.map((a) => [a.id, a.slug]))
  const aileSayac = new Map() // family_id → { toplam, fiyatsiz }
  for (const u of urunler) {
    if (!u.family_id) continue
    const s = aileSayac.get(u.family_id) ?? { toplam: 0, fiyatsiz: 0 }
    s.toplam += 1
    if (!fiyatliUrunIdleri.has(u.id)) s.fiyatsiz += 1
    aileSayac.set(u.family_id, s)
  }
  const tamamenFiyatsizAileler = [...aileSayac.entries()]
    .filter(([, s]) => s.toplam > 0 && s.fiyatsiz === s.toplam)
    .map(([id, s]) => ({ slug: aileSlug.get(id) ?? id, urun: s.toplam }))
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const gizli = kategoriler.filter((c) => Boolean(c.metadata?.[HIDE_PRICE]))
  return {
    damga: new Date().toISOString(),
    anahtar: ayar.data
      ? { var: true, acik: Boolean(ayar.data.value?.acik), updated_at: ayar.data.updated_at, id: ayar.data.id }
      : { var: false, acik: false, updated_at: null, id: null }, // satır yoksa KAPALI varsayılır (fail-closed, RSC ile aynı)
    kategori: {
      toplam: kategoriler.length,
      aktif: kategoriler.filter((c) => c.is_active).length,
      hidePriceTrue: gizli.length,
      hidePriceTrueAktif: gizli.filter((c) => c.is_active).length,
    },
    urun: {
      toplam: urunler.length,
      fiyatli: urunler.filter((u) => fiyatliUrunIdleri.has(u.id)).length,
      fiyatsiz: urunler.filter((u) => !fiyatliUrunIdleri.has(u.id)).length,
      tamamenFiyatsizAileler,
    },
    _kategoriler: kategoriler,
  }
}

/** Tutarlılık hükmü — anahtar ile hide_price aynı şeyi söylüyor mu? */
export function tutarliMi(d) {
  const acik = d.anahtar.acik
  // Açıkken hiçbir kategori fiyat gizlemez; kapalıyken hepsi gizler. Ara hâl = TUTARSIZ.
  if (acik) return { tutarli: d.kategori.hidePriceTrue === 0, beklenen: 'acik → hide_price=true sayısı 0' }
  return { tutarli: d.kategori.hidePriceTrue === d.kategori.toplam, beklenen: 'kapalı → hide_price=true sayısı ' + d.kategori.toplam }
}

// ---------- plan ----------
function planla(d, yon) {
  const hedefHide = yon === 'kapat' // aç → hide_price=false, kapat → true
  const degisecek = d._kategoriler.filter((c) => Boolean(c.metadata?.[HIDE_PRICE]) !== hedefHide)
  const anahtarDegisiyor = d.anahtar.acik !== (yon === 'ac')
  return {
    yon,
    kategori: { hedefHidePrice: hedefHide, degisecek: degisecek.length, degismeyecek: d._kategoriler.length - degisecek.length, idler: degisecek.map((c) => c.slug) },
    anahtar: { degisiyor: anahtarDegisiyor, satirVar: d.anahtar.var, hedef: yon === 'ac' },
    // Tazeleme: kim neyi tazeler — cetvel §4. "Zincirsiz" satırlar DÜRÜSTÇE yazılır; betik onları
    // tazeleyemez, sahibi adıyla yazılıdır.
    tazeleme: {
      zincirli: [
        `categories tetiği (on_categories_change) → ${degisecek.length} kategori yolu + home-data + products-discovery tag + /sitemap.xml (route.ts categories dalı)`,
        'site_settings tetiği (WHEN key=satis_kipi, MIGRATION inince) → route.ts satis_kipi dalı (URUN, REC-169 ilk kalem) → revalidateTag(satis-kipi)',
      ],
      zincirsiz: [
        'ÜRÜN sayfaları (PDP): categories dalı PDP tazelemiyor (route.ts:337-368 ölçüldü) → hide_price çevrilince PDP 3600 sn eski kalır. Kapanış: PDP satis-kipi tag tüketir (REC-169).',
      ],
    },
  }
}

// ---------- yedek ----------
function yedekYaz(d, etiket) {
  const yol = join(yedekDizini(), `${DAMGA}-${etiket}.json`)
  const icerik = {
    damga: d.damga,
    etiket,
    anahtar: d.anahtar,
    kategoriler: d._kategoriler.map((c) => ({ id: c.id, slug: c.slug, metadata: c.metadata })),
  }
  writeFileSync(yol, JSON.stringify(icerik, null, 2))
  return yol
}

// ---------- uygulama ----------
async function kategorileriYaz(sb, kategoriler, hedefHide) {
  // 37 ayrı UPDATE — atomik DEĞİL (supabase-js'te transaction yok). Yarım kalırsa yedekten --geri-al.
  // Metadata MERGE edilir; diğer anahtarlar (slug çevirileri vb.) korunur.
  let yazilan = 0
  for (const c of kategoriler) {
    const { error } = await sb.from('categories').update({ metadata: { ...(c.metadata ?? {}), [HIDE_PRICE]: hedefHide } }).eq('id', c.id)
    if (error) throw new Error(`categories ${c.slug} yazılamadı (${yazilan} yazıldı, YARIM): ` + error.message)
    yazilan += 1
  }
  return yazilan
}

async function anahtariYaz(sb, d, acik, onay, kaynak, ek = {}) {
  // `ek`: açılışta önkoşul damgası (muafiyet + fatura beyanı). RPC yalnız {acik, damga} okur; ek alanlar sızmaz.
  const value = { acik, degistiren: 'scripts/kip/satis-kipine-gec.mjs', onay, damga: new Date().toISOString(), kaynak, ...ek }
  if (d.anahtar.var) {
    const { error } = await sb.from('site_settings').update({ value, updated_at: new Date().toISOString() }).eq('id', d.anahtar.id)
    if (error) throw new Error('site_settings güncellenemedi: ' + error.message)
  } else {
    const { error } = await sb.from('site_settings').insert({ key: ANAHTAR_KEY, value, description: 'Satış kipi anahtarı (REC-168) — tek kaynak; RSC satisKipiOku() okur' })
    if (error) throw new Error('site_settings eklenemedi: ' + error.message)
  }
}

// ---------- ana akış ----------
function yaz(s) { process.stdout.write(s + '\n') }

async function main() {
  argumanlariDogrula()
  const ortam = envYukle()
  const sb = createClient(ortam.url, ortam.key, { auth: { persistSession: false } })
  let once = await olc(sb)
  const kip = UYGULA ? 'UYGULA' : 'KURU KOŞUM'

  yaz(`# satış kipi geçişi — ${kip} — ${once.damga}`)
  yaz(`anahtar (site_settings.${ANAHTAR_KEY}): ${once.anahtar.var ? (once.anahtar.acik ? 'AÇIK' : 'KAPALI') : 'SATIR YOK → KAPALI varsayılan'}`)
  yaz(`kategori: ${once.kategori.toplam} toplam · ${once.kategori.aktif} aktif · hide_price=true ${once.kategori.hidePriceTrue} (aktif ${once.kategori.hidePriceTrueAktif})`)
  yaz(`ürün: ${once.urun.toplam} canlı · ${once.urun.fiyatli} fiyatlı · ${once.urun.fiyatsiz} fiyatsız (K39: teklif iste, dokunulmaz)`)
  yaz(`tamamen fiyatsız aile: ${once.urun.tamamenFiyatsizAileler.length} → ${once.urun.tamamenFiyatsizAileler.map((a) => `${a.slug} ${a.urun}/${a.urun}`).join(' · ') || '-'}`)
  const t0 = tutarliMi(once)
  yaz(`tutarlılık (önce): ${t0.tutarli ? 'TUTARLI' : 'TUTARSIZ'} — ${t0.beklenen}`)

  if (DOGRULA) {
    process.exit(t0.tutarli ? 0 : 2)
  }

  // Yalnız önkoşul tablosu (salt okuma): `satis-hazirligi.md` yeniden ölçme tetikleyicisi bunu çağırır.
  if (ONKOSUL) {
    const k = await onkosulKapisi({ ortam, once, hedef: hedefDurum(once, 'ac'), uygula: false })
    process.exit(k.hukum.acilabilir ? 0 : 2)
  }

  // Geri alma: yedekteki hâle döndür (yön yedeğin kendisinden okunur)
  if (GERI_AL) {
    const yedek = JSON.parse(readFileSync(GERI_AL, 'utf8'))
    const hedefAcik = Boolean(yedek.anahtar?.acik)
    // Hedefi AÇIK olan geri alma bir AÇMADIR (anahtar şu an kapalıysa): önkoşula tabi. Kapatmak serbest.
    let onkosulEk = {}
    if (hedefAcik && !once.anahtar.acik) {
      const k = await onkosulKapisi({ ortam, once, hedef: hedefDurum(once, 'ac', yedek), uygula: UYGULA, hazirlik: async () => {} })
      if (UYGULA && !k.izin) {
        yaz(`⛔ önkoşul (${k.asama}): canlıya HİÇBİR ŞEY yazılmadı, çıkış 1. Düzeltip yeniden koş; muafiyet yalnız K1/K6 için gerekçeli.`)
        process.exit(1)
      }
      onkosulEk = { onkosul: { muaf: k.muaf, faturaBeyani: FATURA_BEYANI ?? null } }
    }
    const yol = yedekYaz(once, 'geri-al-oncesi')
    yaz(`geri alma hedefi: anahtar ${hedefAcik ? 'AÇIK' : 'KAPALI'} · ${yedek.kategoriler.length} kategori metadata'sı yedekten · şimdiki hâlin yedeği: ${yol}`)
    if (!UYGULA) { yaz('KURU KOŞUM — canlıya yazılmadı. Uygulamak için --uygula --onay "..."'); return }
    // Kapatma yönü güvenli sıra: önce anahtar
    if (!hedefAcik) await anahtariYaz(sb, once, false, ONAY, 'geri-al:' + GERI_AL)
    let n = 0
    for (const c of yedek.kategoriler) {
      const { error } = await sb.from('categories').update({ metadata: c.metadata }).eq('id', c.id)
      if (error) throw new Error(`geri alma ${c.slug} (${n} yazıldı, YARIM): ` + error.message)
      n += 1
    }
    if (hedefAcik) await anahtariYaz(sb, once, true, ONAY, 'geri-al:' + GERI_AL, onkosulEk)
    const sonra = await olc(sb)
    const t1 = tutarliMi(sonra)
    yaz(`geri alındı: ${n} kategori · tutarlılık (sonra): ${t1.tutarli ? 'TUTARLI' : 'TUTARSIZ'}`)
    process.exit(t1.tutarli ? 0 : 2)
  }

  // AÇMA: önkoşul kapısı. Sıra: önkoşul → taze ölçüm → yedek → K2/K4/K5 yeniden ölçüm → yazma (yazmayı bu fonksiyon değil, aşağısı yapar).
  // KAPATMA önkoşula tabi DEĞİL. Kuru koşumda tablo basılır ama hiçbir şey engellenmez; `--uygula` ret alırsa YEDEK dahi yazılmaz.
  let yedekYolu
  let onkosulSonuc = null
  if (YON === 'ac') {
    onkosulSonuc = await onkosulKapisi({
      ortam,
      once,
      hedef: hedefDurum(once, 'ac'),
      uygula: UYGULA,
      hazirlik: async () => {
        once = await olc(sb) // taze ölçüm: önkoşul ölçümü ile yazma arasındaki bayat veri (TOCTOU) kalmasın
        yedekYolu = yedekYaz(once, `${YON}-oncesi`)
      },
    })
    if (UYGULA && !onkosulSonuc.izin) {
      yaz('')
      yaz(`⛔ önkoşul (${onkosulSonuc.asama}): canlıya HİÇBİR ŞEY yazılmadı, çıkış 1. Düzeltip yeniden koş; muafiyet yalnız K1/K6 için gerekçeli.`)
      process.exit(1)
    }
  }
  const plan = planla(once, YON)
  yedekYolu ??= yedekYaz(once, `${YON}-oncesi`)
  yaz('')
  yaz(`## plan (--yon ${YON})`)
  yaz(`kategori: ${plan.kategori.degisecek} satır hide_price=${plan.kategori.hedefHidePrice} olacak, ${plan.kategori.degismeyecek} zaten öyle`)
  yaz(`anahtar: ${plan.anahtar.degisiyor ? `→ ${plan.anahtar.hedef ? 'AÇIK' : 'KAPALI'} (${plan.anahtar.satirVar ? 'UPDATE' : 'INSERT'})` : 'zaten hedefte, yazılmaz'}`)
  yaz('tazeleme (zincirli):'); for (const s of plan.tazeleme.zincirli) yaz('  · ' + s)
  yaz('tazeleme (ZİNCİRSİZ — betik tazeleyemez, sahibi yazılı):'); for (const s of plan.tazeleme.zincirsiz) yaz('  ⚠ ' + s)
  yaz(`yedek: ${yedekYolu}`)

  const rapor = { kip, yon: YON, onay: ONAY ?? null, once: { ...once, _kategoriler: undefined }, plan, yedek: yedekYolu }

  if (!UYGULA) {
    yaz('')
    yaz('KURU KOŞUM — canlıya HİÇBİR ŞEY yazılmadı. Uygulamak için: --uygula --onay "<kim, tarih>"')
    if (onkosulSonuc && !onkosulSonuc.hukum.acilabilir) yaz(`⚠ bugün --uygula ÇALIŞMAZ: ${onkosulSonuc.hukum.neden}`)
    if (onkosulSonuc) rapor.onkosul = { acilabilir: onkosulSonuc.hukum.acilabilir, gecmeyen: onkosulSonuc.hukum.gecmeyen }
    writeFileSync(join(yedekDizini(), `rapor-${DAMGA}-kuru.json`), JSON.stringify(rapor, null, 2))
    return
  }

  // UYGULA — fail-safe sıra (bkz. başlık)
  const hedefKategoriler = once._kategoriler.filter((c) => Boolean(c.metadata?.[HIDE_PRICE]) !== plan.kategori.hedefHidePrice)
  if (YON === 'kapat' && plan.anahtar.degisiyor) await anahtariYaz(sb, once, false, ONAY, 'yon:kapat')
  const n = await kategorileriYaz(sb, hedefKategoriler, plan.kategori.hedefHidePrice)
  if (YON === 'ac' && plan.anahtar.degisiyor) {
    await anahtariYaz(sb, once, true, ONAY, 'yon:ac', { onkosul: { muaf: onkosulSonuc?.muaf ?? {}, faturaBeyani: FATURA_BEYANI ?? null } })
  }

  const sonra = await olc(sb)
  const t1 = tutarliMi(sonra)
  yaz('')
  yaz(`## uygulandı: ${n} kategori yazıldı · anahtar ${sonra.anahtar.acik ? 'AÇIK' : 'KAPALI'} · tutarlılık (sonra): ${t1.tutarli ? 'TUTARLI' : 'TUTARSIZ — yedekten geri al: --geri-al ' + yedekYolu}`)
  yaz(`fiyat görünür ürün (veri): ${sonra.anahtar.acik ? sonra.urun.fiyatli : 0} / ${sonra.urun.toplam} — canlı sayfa ölçümü ayrı (K8 prova, son READY master SHA ile)`)
  rapor.sonra = { ...sonra, _kategoriler: undefined }
  rapor.tutarli = t1.tutarli
  writeFileSync(join(yedekDizini(), `rapor-${DAMGA}-uygula.json`), JSON.stringify(rapor, null, 2))
  process.exit(t1.tutarli ? 0 : 2)
}

// Kapı import ettiğinde main koşmasın (INV-SATIS-KIPI-4 mock istemciyle olc/planla'yı çağırır).
const dogrudanKosuldu = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (dogrudanKosuldu) {
  main().catch((e) => { process.stderr.write('HATA: ' + (e?.message ?? e) + '\n'); process.exit(1) })
}
