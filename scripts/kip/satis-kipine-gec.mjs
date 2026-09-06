// Satış kipi geçiş betiği — TEK KOMUTLA aç/kapat, yedekli, geri alınabilir (REC-168).
// Cetvel: docs/standards/satis-kipi-gecis-standard.md §6
//
// Kullanım:
//   node scripts/kip/satis-kipine-gec.mjs --yon ac                   # KURU KOŞUM (varsayılan): ölçer, planı ve yedeği yazar, CANLIYA YAZMAZ
//   node scripts/kip/satis-kipine-gec.mjs --yon kapat                 # aynı, ters yön
//   node scripts/kip/satis-kipine-gec.mjs --yon ac --uygula --onay "Recep 2026-09-xx"   # canlıya yazar (Recep kapısı)
//   node scripts/kip/satis-kipine-gec.mjs --geri-al <yedek.json> [--uygula --onay "..."] # yedekteki hâle döndürür
//   node scripts/kip/satis-kipine-gec.mjs --dogrula                   # yalnız ölçer ve tutarlılık hükmü verir (çıkış 0/2)
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

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')

// ---------- argümanlar ----------
const argv = process.argv.slice(2)
const arg = (ad) => {
  const i = argv.indexOf(ad)
  return i >= 0 ? argv[i + 1] : undefined
}
const bayrak = (ad) => argv.includes(ad)

const UYGULA = bayrak('--uygula')
const DOGRULA = bayrak('--dogrula')
const GERI_AL = arg('--geri-al')
const YON = arg('--yon')
const ONAY = arg('--onay')

const ANAHTAR_KEY = 'satis_kipi'
const HIDE_PRICE = 'hide_price'

function hata(mesaj) {
  process.stderr.write('HATA: ' + mesaj + '\n')
  process.exit(1)
}

if (!DOGRULA && !GERI_AL && YON !== 'ac' && YON !== 'kapat') {
  hata("--yon ac | --yon kapat zorunlu (ya da --dogrula / --geri-al <dosya>). Yön verilmeden hiçbir şey planlanmaz.")
}
if (UYGULA && !ONAY) {
  hata('--uygula için --onay "<kim, tarih>" zorunlu. Canlı yazım Recep kapısıdır; onay metni rapora ve DB satırına damgalanır.')
}
if (GERI_AL && !existsSync(GERI_AL)) hata('geri alma dosyası yok: ' + GERI_AL)

// ---------- env ----------
// .env sırası: VENTHUB_ENV_PATH → repo kökü → ev dizinindeki ana çalışma ağacı (worktree'lerde .env yok).
// Sabit kullanıcı yolu YOK (REC-102; repo public, homedir() aynı yolu çözer).
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
const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) hata('.env içinde SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli (değerler basılmaz)')

// Kapı (INV-SATIS-KIPI-4) istemciyi enjekte edebilsin diye tek fabrika. Değer hiçbir yere basılmaz.
export function istemciKur() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
}

// ---------- yedek dizini (repo DIŞI) ----------
const YEDEK_DIR = process.env.VENTHUB_KIP_YEDEK_DIR ?? join(homedir(), 'venthub-hvac-kip-yedek')
mkdirSync(YEDEK_DIR, { recursive: true })
const DAMGA = new Date().toISOString().replace(/[:.]/g, '-')

// ---------- ölçüm ----------
/**
 * Tabloyu SAYFALAYARAK tamamen çeker. supabase-js varsayılan olarak 1000 satır döndürür ve
 * fazlasını SESSİZCE keser — ilk kuru koşumda (2026-09-06) 1044 fiyat satırının 44'ü düştü, 14 ürün
 * "fiyatsız" sayıldı (334/41 yerine 348/27). Ölçüt doğruydu, evren eksikti; bu yardımcı o yüzden var.
 * `kur` her sayfada YENİ sorgu üretir (PostgREST builder tek kullanımlık).
 */
async function hepsiniCek(ad, kur, sayfa = 1000) {
  const hepsi = []
  for (let baslangic = 0; ; baslangic += sayfa) {
    const { data, error } = await kur().range(baslangic, baslangic + sayfa - 1)
    if (error) throw new Error(ad + ' okunamadı: ' + error.message)
    hepsi.push(...(data ?? []))
    if (!data || data.length < sayfa) break
  }
  return hepsi
}

/**
 * Canlı durumu ölçer. SALT OKUMA. Sayılar cetvel §1 ile aynı evrende: silinmemiş ürünler,
 * aktif fiyat satırı ve gross/net > 0 olan ürün "fiyatlı".
 */
export async function olc(sb) {
  const [kategoriler, ayar, urunler, fiyatlar, aileler] = await Promise.all([
    hepsiniCek('categories', () => sb.from('categories').select('id, slug, is_active, metadata').order('slug')),
    sb.from('site_settings').select('id, key, value, updated_at').eq('key', ANAHTAR_KEY).maybeSingle(),
    hepsiniCek('products', () => sb.from('products').select('id, family_id').is('deleted_at', null).order('id')),
    hepsiniCek('product_prices', () => sb.from('product_prices').select('product_id, is_active, gross_price, net_price').eq('is_active', true).order('id')),
    hepsiniCek('product_families', () => sb.from('product_families').select('id, slug').order('id')),
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
  const yol = join(YEDEK_DIR, `${DAMGA}-${etiket}.json`)
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

async function anahtariYaz(sb, d, acik, onay, kaynak) {
  const value = { acik, degistiren: 'scripts/kip/satis-kipine-gec.mjs', onay, damga: new Date().toISOString(), kaynak }
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
  const sb = istemciKur()
  const once = await olc(sb)
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

  // Geri alma: yedekteki hâle döndür (yön yedeğin kendisinden okunur)
  if (GERI_AL) {
    const yedek = JSON.parse(readFileSync(GERI_AL, 'utf8'))
    const hedefAcik = Boolean(yedek.anahtar?.acik)
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
    if (hedefAcik) await anahtariYaz(sb, once, true, ONAY, 'geri-al:' + GERI_AL)
    const sonra = await olc(sb)
    const t1 = tutarliMi(sonra)
    yaz(`geri alındı: ${n} kategori · tutarlılık (sonra): ${t1.tutarli ? 'TUTARLI' : 'TUTARSIZ'}`)
    process.exit(t1.tutarli ? 0 : 2)
  }

  const plan = planla(once, YON)
  const yedekYolu = yedekYaz(once, `${YON}-oncesi`)
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
    writeFileSync(join(YEDEK_DIR, `rapor-${DAMGA}-kuru.json`), JSON.stringify(rapor, null, 2))
    return
  }

  // UYGULA — fail-safe sıra (bkz. başlık)
  const hedefKategoriler = once._kategoriler.filter((c) => Boolean(c.metadata?.[HIDE_PRICE]) !== plan.kategori.hedefHidePrice)
  if (YON === 'kapat' && plan.anahtar.degisiyor) await anahtariYaz(sb, once, false, ONAY, 'yon:kapat')
  const n = await kategorileriYaz(sb, hedefKategoriler, plan.kategori.hedefHidePrice)
  if (YON === 'ac' && plan.anahtar.degisiyor) await anahtariYaz(sb, once, true, ONAY, 'yon:ac')

  const sonra = await olc(sb)
  const t1 = tutarliMi(sonra)
  yaz('')
  yaz(`## uygulandı: ${n} kategori yazıldı · anahtar ${sonra.anahtar.acik ? 'AÇIK' : 'KAPALI'} · tutarlılık (sonra): ${t1.tutarli ? 'TUTARLI' : 'TUTARSIZ — yedekten geri al: --geri-al ' + yedekYolu}`)
  yaz(`fiyat görünür ürün (veri): ${sonra.anahtar.acik ? sonra.urun.fiyatli : 0} / ${sonra.urun.toplam} — canlı sayfa ölçümü ayrı (K8 prova, son READY master SHA ile)`)
  rapor.sonra = { ...sonra, _kategoriler: undefined }
  rapor.tutarli = t1.tutarli
  writeFileSync(join(YEDEK_DIR, `rapor-${DAMGA}-uygula.json`), JSON.stringify(rapor, null, 2))
  process.exit(t1.tutarli ? 0 : 2)
}

// Kapı import ettiğinde main koşmasın (INV-SATIS-KIPI-4 mock istemciyle olc/planla'yı çağırır).
const dogrudanKosuldu = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (dogrudanKosuldu) {
  main().catch((e) => { process.stderr.write('HATA: ' + (e?.message ?? e) + '\n'); process.exit(1) })
}
