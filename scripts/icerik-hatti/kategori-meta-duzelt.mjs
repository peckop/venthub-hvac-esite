#!/usr/bin/env node
/**
 * KATEGORİ META DÜZELTİCİ — KTL-11. Kategori açıklamasının TR ve EN'ini (metadata.description_i18n),
 * metadata.hero_description, metadata.marketing_title ve metadata.features[i].title/description alanlarını
 * TEK araçla, yedek + kuru koşum + koşullu yazım + geri okumayla düzeltir.
 *
 * NİÇİN BU ARAÇ: `kategori-metni-yaz.mjs` yalnız TR yazar (taslak markdown'dan, yedek/geri okuma yok);
 * `kategori-en-yaz.mjs` yalnız EN yazar (plan.json + tr_md5 ister). İkisi de hero/marketing/features'a dokunamaz.
 * Kurallar saf çekirdekte: `kategori-meta-duzelt-kurallar.mjs` (testli, `__tests__/kategori-meta-duzelt.test.ts`).
 *
 * PLAN (--plan <plan.json>):
 *   {"kalemler":[{"slug":"<kategori slug>","yol":["description_i18n","tr"],"eski":null,"yeni":"<metin>","tam":true}]}
 *   yol: ["description_i18n","tr"|"en"] · ["hero_description"] · ["marketing_title"] · ["features",<i>,"title"|"description"]
 *        KTL-21 arama sonucu alanları: ["@kolon","seo_title"|"seo_desc"] (categories KOLONLARI) ·
 *        ["seo_title_en"|"seo_desc_en"] (metadata). Uzunluk: başlık 20-50 (eksiz), açıklama 110-155.
 *   tam=true : alanın BÜTÜN değeri değişir; eski = şu anki tam değer (alan boş/yok ise eski=null).
 *   GERİ ALMA (KTL-21): yalnız arama alanlarında yeni=null "alanı boşalt" demektir (tam=true, eski = şu anki
 *   tam değer ZORUNLU; kör silme yok). Kolon null olur, metadata anahtarı silinir. Yazım planının tersi:
 *   her kalemde eski ↔ yeni yer değiştirir (yazımdan önce alan boştu → geri alma yeni=null).
 *   tam=false: eski = alanda TAM 1 kez geçen parça; yalnız o parça yeni ile değişir.
 *   Bir kategorinin birden çok kalemi SIRAYLA uygulanır, kategori başına TEK PATCH gider.
 *
 * GÜVENLİK (kategori-en-yaz.mjs deseni):
 *  - KURU KOŞUM varsayılan: her kalem için ESKİ→YENİ ve geçen/geçmeyen kural yazılır; sonda yazılacak/aynı/red sayısı.
 *  - İKİ ANAHTAR: `--yaz` bayrağı VE ortamda CANLI_YAZIM_ONAYI (değer komut satırına yazılmaz). `--yaz` ile
 *    CANLI_YAZIM_ONAYI yoksa YAZILMAZ ve çıkış 1 (sessizce kuru koşuma düşmek "yazıldı" sanılmasın diye yüksek sesle).
 *  - Herhangi bir kalem RED ise HİÇBİR ŞEY yazılmaz (kısmi yazım yok); kuru koşumda da çıkış 1.
 *  - `--yaz` ile `--yedek <dosya>` ZORUNLU: yazımdan ÖNCE canlıdan okunan satırlar (updated_at dahil) dosyaya yazılır
 *    ve dosyanın var olduğu/içeriğinin doğru olduğu okunarak doğrulanır; dosya zaten varsa EZİLMEZ (flag wx).
 *  - Alan düzeyinde değişiklik: metadata'nın geri kalanı (slug, hide_price, ...) AYNEN korunur.
 *  - KOŞULLU PATCH (yarış): süzgeç `id` + `tenant_id` + `updated_at=eq.<okunan>`. SEÇİM GEREKÇESİ: `categories`
 *    tablosunda `updated_at` sütunu var (src/types/database.types.ts: categories.Row.updated_at) ve `jsonb` içeriğine
 *    eşitlik süzgeci koymak yerine satır sürümünü kilit anahtarı yapar; aile yazıcısıyla (`patchYolu`) aynı desen.
 *    `+00:00`'daki `+` encodeURIComponent ile kodlanır (yoksa PostgREST onu boşluk okur, hiçbir satır eşleşmez).
 *    0 satır etkilenirse satır yeniden okunur, kalemler taze satıra yeniden uygulanır ve TEK kez denenir; yine 0 → hata.
 *    ⚠ 0 satır "yarış" ya da "yetki yok" olabilir (RLS yazmayı sessizce boşaltır); iletide ikisi de söylenir.
 *  - Yazımdan sonra GERİ OKUMA: her kalemin yeni değeri canlıda mı VE metadata'nın tamamı beklenenle (anahtar sırasından
 *    bağımsız) birebir mi; değilse çıkış 1.
 *
 * ÇIKIŞ KODLARI: 0 geçti (kuru koşum dahil) · 1 red / yazım hatası / geri okuma farklı · 2 ölçülemedi
 * (plan okunamadı, ortam anahtarı yok, ağ hatası, yetki 401/403 ile okuma, boş sonuç, eksik veri).
 *
 * KULLANIM:
 *   node scripts/icerik-hatti/kategori-meta-duzelt.mjs --plan <plan.json>                          # kuru koşum
 *   CANLI_YAZIM_ONAYI=... node scripts/icerik-hatti/kategori-meta-duzelt.mjs --plan <plan.json> --yaz --yedek <yedek.json>
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { kanon, kategoriPlani, alanOku, yolEtiketi, KOLON } from './kategori-meta-duzelt-kurallar.mjs'

/** @typedef {import('./kategori-meta-duzelt-kurallar.mjs').Kalem} Kalem */
/** @typedef {{ id: string, tenant_id: string, slug: string, metadata: Record<string, unknown> | null, updated_at: string, seo_title?: string | null, seo_desc?: string | null }} KategoriSatiri */

// KTL-21: seo_title / seo_desc ÜST DÜZEY kolonlar; satır, çekirdeğin tek belge kuralıyla çalışması için
// {...metadata, "@kolon": {seo_title, seo_desc}} belgesine çevrilir (belge()); yazımda geri bölünür (bol()).
const SECIM = 'id,tenant_id,slug,metadata,updated_at,seo_title,seo_desc'

/** Satır → çekirdek belgesi. "@kolon" anahtarı gerçek bir metadata anahtarı olamaz. */
const belge = (/** @type {KategoriSatiri} */ s) => ({ ...(s.metadata ?? {}), [KOLON]: { seo_title: s.seo_title ?? null, seo_desc: s.seo_desc ?? null } })

/** Belge → {metadata, kolon}. */
function bol(/** @type {Record<string, unknown>} */ b) {
  const { [KOLON]: kolon, ...metadata } = b
  return { metadata, kolon: /** @type {{ seo_title: string | null, seo_desc: string | null }} */ (kolon ?? { seo_title: null, seo_desc: null }) }
}
const ISTEK_SURESI_MS = 30000

/** Çıkış: mesajları yazıp kodla biter (process.exit çağrılmaz: çıktı kesilmesin). */
class Cikis extends Error {
  /** @param {number} kod @param {string[]} satirlar */
  constructor(kod, satirlar) { super(satirlar[0]); this.kod = kod; this.satirlar = satirlar }
}

const argv = process.argv.slice(2)
const arg = (/** @type {string} */ ad) => { const i = argv.indexOf(ad); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined }
const PLAN_YOL = arg('--plan')
const YEDEK = arg('--yedek')
const YAZ = argv.includes('--yaz')

function planOku() {
  if (!PLAN_YOL) throw new Cikis(2, ['⛔ --plan <plan.json> gerekli'])
  if (!existsSync(PLAN_YOL)) throw new Cikis(2, [`⛔ plan dosyası yok: ${PLAN_YOL}`])
  let plan
  try { plan = JSON.parse(readFileSync(PLAN_YOL, 'utf8')) } catch (e) {
    throw new Cikis(2, [`⛔ plan JSON'u okunamadı (${PLAN_YOL}): ${e instanceof Error ? e.message : String(e)}`])
  }
  if (!plan || typeof plan !== 'object' || !Array.isArray(plan.kalemler)) throw new Cikis(2, ['⛔ plan {"kalemler":[...]} biçiminde olmalı'])
  if (plan.kalemler.length === 0) throw new Cikis(2, ['⛔ planda kalem yok (boş plan)'])
  return /** @type {unknown[]} */ (plan.kalemler)
}

function ortamOku() {
  const dosya = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
  let ham
  try { ham = readFileSync(dosya, 'utf8') } catch { throw new Cikis(2, [`⛔ ortam dosyası okunamadı: ${dosya}`]) }
  const env = Object.fromEntries(
    ham.split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
      .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
  const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const K = env.SUPABASE_SERVICE_ROLE_KEY
  if (!U || !K) throw new Cikis(2, ['⛔ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok'])
  return { U, H: { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' } }
}

/** main() içinde ortamOku() ile doldurulur (yetki başlığı yalnız bellekte durur; hiçbir yere yazılmaz/basılmaz). */
let U = ''
/** @type {Record<string, string>} */
let H = {}

/** fetch + zaman aşımı; ağ hatası anlaşılır iletiyle fırlar. */
async function istek(/** @type {string} */ url, /** @type {RequestInit} */ secenek, /** @type {number} */ kod) {
  try {
    return await fetch(url, { ...secenek, signal: AbortSignal.timeout(ISTEK_SURESI_MS) })
  } catch (e) {
    throw new Cikis(kod, [`⛔ AĞ HATASI (${secenek.method ?? 'GET'} ${url.split('?')[0]}): ${e instanceof Error ? e.message : String(e)}`])
  }
}

async function durumKontrol(/** @type {Response} */ r, /** @type {string} */ ne, /** @type {number} */ kod) {
  if (r.ok) return
  const govde = (await r.text().catch(() => '')).slice(0, 200)
  if (r.status === 401 || r.status === 403) throw new Cikis(kod, [`⛔ YETKİ HATASI (${r.status}) ${ne}: servis anahtarı geçersiz ya da RLS reddetti. ${govde}`])
  throw new Cikis(kod, [`⛔ ${ne} başarısız: HTTP ${r.status} ${govde}`])
}

/** Tüm kategoriler; kesin sayı ile eksik veri kontrolü (kategori-en-yaz.mjs sözleşmesi). */
async function kategorileriOku() {
  const say = await istek(`${U}/rest/v1/categories?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } }, 2)
  await durumKontrol(say, 'kategori sayımı', 2)
  const kesin = Number((say.headers.get('content-range') || '').split('/')[1])
  if (!Number.isInteger(kesin)) throw new Cikis(2, ['⛔ KESİN SAYI ALINAMADI — fail-closed'])
  const r = await istek(`${U}/rest/v1/categories?select=${SECIM}&order=id`, { headers: H }, 2)
  await durumKontrol(r, 'kategori okuma', 2)
  /** @type {unknown} */
  let k
  try { k = await r.json() } catch { throw new Cikis(2, ['⛔ kategori yanıtı JSON değil']) }
  if (!Array.isArray(k)) throw new Cikis(2, ['⛔ kategori yanıtı dizi değil'])
  if (k.length === 0 || kesin === 0) throw new Cikis(2, ['⛔ BOŞ SONUÇ: canlıdan 0 kategori geldi — fail-closed'])
  if (k.length !== kesin) throw new Cikis(2, [`⛔ EKSİK VERİ: çekilen ${k.length}, sunucu ${kesin} — fail-closed`])
  return /** @type {KategoriSatiri[]} */ (k)
}

async function tekSatirOku(/** @type {string} */ id) {
  const r = await istek(`${U}/rest/v1/categories?id=eq.${encodeURIComponent(id)}&select=${SECIM}`, { headers: H }, 1)
  await durumKontrol(r, 'satır yeniden okuma', 1)
  const k = await r.json().catch(() => null)
  if (!Array.isArray(k) || k.length !== 1) throw new Cikis(1, [`⛔ yeniden okuma: ${id} için ${Array.isArray(k) ? k.length : '?'} satır döndü`])
  return /** @type {KategoriSatiri} */ (k[0])
}

const yedekSatiri = (/** @type {KategoriSatiri} */ s) => ({ id: s.id, tenant_id: s.tenant_id, slug: s.slug, updated_at: s.updated_at, metadata: s.metadata, seo_title: s.seo_title ?? null, seo_desc: s.seo_desc ?? null })

/** Yedek dosyasını yazar ve OKUYARAK doğrular (yazımdan ÖNCE). Var olan dosya ezilmez. */
function yedekYaz(/** @type {string} */ yol, /** @type {ReturnType<typeof yedekSatiri>[]} */ satirlar) {
  try {
    writeFileSync(yol, JSON.stringify({ damga: new Date().toISOString(), plan: PLAN_YOL, onay_var: true, satirlar, yeniden_okuma: [] }, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' })
  } catch (e) {
    const var_ = e && typeof e === 'object' && 'code' in e && e.code === 'EEXIST'
    throw new Cikis(1, [var_ ? `⛔ yedek dosyası zaten var, ezilmez: ${yol} (başka ad ver)` : `⛔ yedek yazılamadı: ${e instanceof Error ? e.message : String(e)}`])
  }
  yedekDogrula(yol, satirlar)
}

function yedekDogrula(/** @type {string} */ yol, /** @type {ReturnType<typeof yedekSatiri>[]} */ satirlar) {
  if (!existsSync(yol)) throw new Cikis(1, [`⛔ yedek dosyası yazıldı ama yok: ${yol} — YAZIM YAPILMADI`])
  let oku
  try { oku = JSON.parse(readFileSync(yol, 'utf8')) } catch { throw new Cikis(1, [`⛔ yedek dosyası okunamadı/bozuk: ${yol} — YAZIM YAPILMADI`]) }
  const tamam = Array.isArray(oku?.satirlar) && oku.satirlar.length === satirlar.length
    && satirlar.every((s, i) => oku.satirlar[i]?.id === s.id && kanon(oku.satirlar[i]?.metadata) === kanon(s.metadata)
      && (oku.satirlar[i]?.seo_title ?? null) === (s.seo_title ?? null) && (oku.satirlar[i]?.seo_desc ?? null) === (s.seo_desc ?? null))
  if (!tamam) throw new Cikis(1, [`⛔ yedek içeriği canlıyla uyuşmuyor: ${yol} — YAZIM YAPILMADI`])
}

function yedegeEkle(/** @type {string} */ yol, /** @type {KategoriSatiri} */ satir) {
  const oku = JSON.parse(readFileSync(yol, 'utf8'))
  oku.yeniden_okuma.push({ ...yedekSatiri(satir), damga: new Date().toISOString() })
  writeFileSync(yol, JSON.stringify(oku, null, 2) + '\n', 'utf8')
  const geri = JSON.parse(readFileSync(yol, 'utf8'))
  if (geri.yeniden_okuma.at(-1)?.id !== satir.id) throw new Cikis(1, [`⛔ yedeğe yeniden-okuma satırı eklenemedi: ${yol}`])
}

/** Bir kategorinin kalemlerini TEK koşullu PATCH ile yazar; 0 satırda tek yeniden deneme. */
async function kategoriyeYaz(/** @type {KategoriSatiri} */ ilk, /** @type {Kalem[]} */ kalemler) {
  let satir = ilk
  for (let deneme = 0; deneme < 2; deneme++) {
    const p = kategoriPlani(belge(satir), kalemler)
    if (p.red) throw new Cikis(1, [`⛔ ${satir.slug}: yeniden okunan satırda kalem RED (canlı bu arada değişmiş): ${p.sonuclar.filter(s => s.durum === 'red').map(s => `${yolEtiketi(s.kalem.yol)}: ${s.sebep}`).join('; ')}`])
    if (!p.degisen) return { yazildi: false, beklenen: belge(satir), sonuclar: p.sonuclar }
    // KTL-21: yalnız DEĞİŞEN parça gönderilir: metadata değiştiyse metadata, kolon değiştiyse o kolon.
    const yeniBelge = /** @type {Record<string, unknown>} */ (p.yeni_metadata)
    const { metadata: yeniMeta, kolon: yeniKolon } = bol(yeniBelge)
    /** @type {Record<string, unknown>} */
    const govdeNesnesi = {}
    if (kanon(yeniMeta) !== kanon(satir.metadata ?? {})) govdeNesnesi.metadata = yeniMeta
    if ((yeniKolon.seo_title ?? null) !== (satir.seo_title ?? null)) govdeNesnesi.seo_title = yeniKolon.seo_title
    if ((yeniKolon.seo_desc ?? null) !== (satir.seo_desc ?? null)) govdeNesnesi.seo_desc = yeniKolon.seo_desc
    const url = `${U}/rest/v1/categories?id=eq.${encodeURIComponent(satir.id)}&tenant_id=eq.${encodeURIComponent(satir.tenant_id)}&updated_at=eq.${encodeURIComponent(satir.updated_at)}&select=id`
    const r = await istek(url, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(govdeNesnesi) }, 1)
    await durumKontrol(r, `${satir.slug} yazımı`, 1)
    const govde = await r.json().catch(() => null)
    if (Array.isArray(govde) && govde.length === 1) return { yazildi: true, beklenen: yeniBelge, sonuclar: p.sonuclar }
    if (!Array.isArray(govde) || govde.length > 1) throw new Cikis(1, [`⛔ ${satir.slug}: PATCH yanıtı beklenmedik (${JSON.stringify(govde)?.slice(0, 120)})`])
    if (deneme === 1) throw new Cikis(1, [`⛔ ${satir.slug}: PATCH iki kez 0 satır etkiledi — satır sürekli değişiyor ya da yazma yetkisi yok (RLS yazmayı sessizce boşaltır). Yazılmadı.`])
    console.log(`  ↻ ${satir.slug}: 0 satır etkilendi (yarış ya da yetki); satır yeniden okunup kalemler yeniden uygulanacak (tek deneme)`)
    satir = await tekSatirOku(satir.id)
    if (YEDEK) yedegeEkle(YEDEK, satir)
  }
  throw new Cikis(1, ['⛔ erişilmemesi gereken yol'])
}

async function main() {
  const ham = planOku()
  ;({ U, H } = ortamOku())

  const kategoriler = await kategorileriOku()
  /** @type {Map<string, KategoriSatiri[]>} */
  const bySlug = new Map()
  for (const c of kategoriler) bySlug.set(c.slug, [...(bySlug.get(c.slug) ?? []), c])

  // Kalemleri kategoriye göre grupla (plan sırası korunur)
  /** @type {Map<string, Kalem[]>} */
  const gruplar = new Map()
  const bozuk = []
  for (const k of ham) {
    const slug = k && typeof k === 'object' && typeof (/** @type {Record<string, unknown>} */ (k)).slug === 'string' ? /** @type {string} */ ((/** @type {Record<string, unknown>} */ (k)).slug) : ''
    if (!slug) { bozuk.push(k); continue }
    gruplar.set(slug, [...(gruplar.get(slug) ?? []), /** @type {Kalem} */ (k)])
  }

  let yazilacak = 0, ayni = 0, red = bozuk.length
  /** @type {Array<{ satir: KategoriSatiri, kalemler: Kalem[] }>} */
  const yazimlar = []
  for (const b of bozuk) console.log(`  ⛔ slug'sız/bozuk kalem: ${JSON.stringify(b)?.slice(0, 120)}`)

  for (const [slug, ks] of gruplar) {
    const satirlar = bySlug.get(slug) ?? []
    console.log(`\n${slug}`)
    if (satirlar.length !== 1) {
      const sebep = satirlar.length === 0 ? 'R4 kategori canlıda yok' : `R4 aynı slug ${satirlar.length} satırda (belirsiz hedef)`
      for (const k of ks) { console.log(`  ⛔ ${yolEtiketi(Array.isArray(k.yol) ? k.yol : [])}: ${sebep}`); red++ }
      continue
    }
    // Aynı slug + aynı yol iki kalemde → belirsiz (hangisi geçerli?)
    const gorulen = new Map()
    for (const k of ks) { const a = kanon(k.yol); gorulen.set(a, (gorulen.get(a) ?? 0) + 1) }
    const tekrar = ks.filter(k => gorulen.get(kanon(k.yol)) > 1)
    if (tekrar.length) {
      for (const k of tekrar) { console.log(`  ⛔ ${yolEtiketi(Array.isArray(k.yol) ? k.yol : [])}: R4 aynı alan planda birden çok kalemde`); red++ }
      continue
    }
    const p = kategoriPlani(belge(satirlar[0]), ks)
    for (const s of p.sonuclar) {
      const etiket = yolEtiketi(Array.isArray(s.kalem?.yol) ? s.kalem.yol : [])
      const kurallar = s.kurallar.map(x => `${x.gecti ? '✓' : '✗'}${x.kural}${!x.gecti && x.ayrinti ? ` (${x.ayrinti})` : ''}`).join(' ')
      if (s.durum === 'red') { red++; console.log(`  ⛔ ${etiket}  RED: ${s.sebep}\n     kurallar: ${kurallar}`); continue }
      if (s.durum === 'ayni') { ayni++; console.log(`  = ${etiket}  zaten uygulanmış (atlanır)\n     kurallar: ${kurallar}`); continue }
      yazilacak++
      console.log(`  → ${etiket}${s.kalem.tam ? '' : '  (parça)'}\n     ESKİ: ${s.kalem.tam ? (s.once === undefined || s.once === null || s.once === '' ? '(boş)' : s.once) : s.kalem.eski}\n     YENİ: ${s.sonra === null ? '(boş — alan temizlenir)' : s.kalem.tam ? s.sonra : s.kalem.yeni}\n     kurallar: ${kurallar}`)
    }
    if (p.degisen && !p.red) yazimlar.push({ satir: satirlar[0], kalemler: ks })
  }

  console.log(`\nÖZET: yazılacak ${yazilacak} · zaten aynı ${ayni} · RED ${red}  (${yazimlar.length} kategori PATCH)`)
  if (red) throw new Cikis(1, ['⛔ RED var — hiçbir şey yazılmadı (kısmi yazım yok)'])
  if (!YAZ) { console.log('KURU KOŞUM — hiçbir şey yazılmadı. Canlıya yazım: --yaz --yedek <json> + CANLI_YAZIM_ONAYI'); return }
  if (!process.env.CANLI_YAZIM_ONAYI) throw new Cikis(1, ["⛔ --yaz verildi ama CANLI_YAZIM_ONAYI yok — YAZILMADI (Recep'in KENDİ sözü; akran aktarımı onay değildir)"])
  if (!YEDEK) throw new Cikis(1, ['⛔ --yaz için --yedek <dosya> zorunlu — YAZILMADI'])
  if (yazimlar.length === 0) { console.log('Yazılacak kalem yok (hepsi zaten uygulanmış). Yedek yazılmadı.'); return }

  yedekYaz(YEDEK, yazimlar.map(y => yedekSatiri(y.satir)))
  console.log(`YEDEK: ${YEDEK} (${yazimlar.length} satır, okunup doğrulandı)`)

  /** @type {Array<{ slug: string, id: string, beklenen: unknown, kalemler: Kalem[] }>} */
  const yazilan = []
  for (const y of yazimlar) {
    let s
    try { s = await kategoriyeYaz(y.satir, y.kalemler) } catch (e) {
      if (e instanceof Cikis) e.satirlar.push(`   yazılan: ${yazilan.map(z => z.slug).join(', ') || '(yok)'} · yazılmayan: ${yazimlar.filter(z => !yazilan.some(w => w.id === z.satir.id)).map(z => z.satir.slug).join(', ')} · geri dönüş: ${YEDEK}`)
      throw e
    }
    yazilan.push({ slug: y.satir.slug, id: y.satir.id, beklenen: s.beklenen, kalemler: y.kalemler })
    console.log(`  ✓ ${y.satir.slug}: ${s.yazildi ? 'yazıldı (tek PATCH)' : 'bu arada başkası uygulamış, yazılmadı'}`)
  }

  const sonra = new Map((await kategorileriOku()).map(c => [c.id, c]))
  const farkli = []
  for (const z of yazilan) {
    const satirSonra = sonra.get(z.id)
    const canli = satirSonra ? belge(satirSonra) : undefined
    if (kanon(canli) !== kanon(z.beklenen)) {
      farkli.push(`${z.slug}: ${z.kalemler.filter(k => kanon(alanOku(canli, k.yol)) !== kanon(alanOku(/** @type {Record<string, unknown>} */ (z.beklenen), k.yol))).map(k => yolEtiketi(k.yol)).join(', ') || 'diğer anahtarlar değişmiş'}`)
    }
  }
  console.log(`GERİ OKUMA: ${yazilan.length - farkli.length}/${yazilan.length} kategori birebir`)
  if (farkli.length) throw new Cikis(1, [`⛔ geri okuma farklı: ${farkli.join(' | ')} — yedekten geri dön: ${YEDEK}`])
}

main().catch((e) => {
  if (e instanceof Cikis) { for (const s of e.satirlar) console.error(s); process.exitCode = e.kod; return }
  console.error(`⛔ beklenmeyen hata: ${e instanceof Error ? e.stack : String(e)}`)
  process.exitCode = 2
})
