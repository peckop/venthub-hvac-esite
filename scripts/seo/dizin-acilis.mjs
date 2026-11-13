#!/usr/bin/env node
/**
 * DİZİN AÇILIŞ SATIRI (Kanban SEO-98, OPS-256; kalıp ARC-280 donum-tara): GEO-SEO penceresi açılışında TEK satır.
 *
 * Neden: dizin isteği listenin en önündedir (Recep 8 Kasım) ama günün ilk işi olan `dizin-takip --durum`
 * elle hatırlanıyordu. `--durum` her adresi Google/Bing'den ölçer (dakikalar sürer), açılış kancasının 15 sn
 * tavanına sığmaz. Bu yüzden iki parça:
 *   1) ANLIK satır: depo dışı arşivdeki en son `dizin-takip-<gün>.json` anlık görüntüsünden YAP/TEKRAR sayıları
 *      (Google, Bing, IndexNow; Yandex IndexNow ile karşılanır, D7 madde 11).
 *   2) Bugün anlık görüntü yoksa `dizin-takip --durum` ARKA PLANDA başlatılır (ayrık süreç, tek koşu kilidi);
 *      sonuç sonraki açılışta/aynı gün satıra yansır. Zamanlayıcı yok (karar 53): tetik açılıştır.
 *   3) GÖRÜNME VADESİ (SEO-114): yayından 3./7./14. gün vadesi gelen ama canlı arama (`gorunme` eylemi) kaydı olmayan yazı sayısı
 *      (Y2.1 madde 6); yalnız `gorunme` sayılır, URL denetimi/gösterim/istek saymaz.
 * SALT-OKUMA (yalnız arşive anlık görüntü ve kilit yazar), fail-open (her hata çıkış 0, sessiz), vana
 * `VENTHUB_DIZIN_ACILIS_KAPAT=1`. İstek ATMAZ; istek kararı hâlâ `dizin-takip` tablosundan okunur.
 *
 * Kullanım: node scripts/seo/dizin-acilis.mjs [--sadece-satir]   (--sadece-satir: arka plan başlatma)
 * Cetvel: docs/standards/dizin-sistemleri-standard.md D7.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const BU_DIZIN = dirname(fileURLToPath(import.meta.url))
// `detached: true` yalnız merkezî başlatıcıda yazılır (INV-KOPUK-1, REC-415): kopuk çocuk konsol penceresi açmasın.
const { kopukBaslat } = createRequire(import.meta.url)('../board/kopuk-baslat.cjs')
export const KILIT_OMRU_MS = 30 * 60 * 1000
/** Türkiye günü (UTC+3, yaz saati yok): gece yarısından sonra UTC bir önceki günü yazmasın. */
export const trGun = (ms) => new Date(ms + 3 * 3600 * 1000).toISOString().slice(0, 10)
const ISTEK_KARARLARI = new Set(['YAP', 'TEKRAR'])
const MOTORLAR = [['google', 'Google'], ['bing', 'Bing'], ['indexnow', 'IndexNow']]

export function arsivKlasoru(env = process.env) {
  return env.VENTHUB_DIZIN_ARSIV || join(homedir(), 'VentHub-Olcum-Arsiv', 'geo-seo', 'dizin-takip')
}

/** Klasördeki en son anlık görüntü dosyası (dizin-takip-YYYY-MM-DD.json) ya da null. */
export function enSonAnlik(klasor) {
  let adlar
  try { adlar = readdirSync(klasor) } catch { return null }
  const adaylar = adlar.filter((a) => /^dizin-takip-\d{4}-\d{2}-\d{2}\.json$/.test(a)).sort().reverse()
  for (const ad of adaylar) {
    try {
      const j = JSON.parse(readFileSync(join(klasor, ad), 'utf8'))
      if (j && Array.isArray(j.tablo)) {
        const alinma = j.alinma || null
        const t = alinma ? Date.parse(alinma) : NaN
        return { gun: Number.isFinite(t) ? trGun(t) : ad.slice(12, 22), alinma, tablo: j.tablo }
      }
    } catch { /* bozuk dosya: bir öncekine bak */ }
  }
  return null
}

/** Motor başına YAP/TEKRAR sayısı. */
export function sayilar(tablo) {
  const s = Object.fromEntries(MOTORLAR.map(([k]) => [k, 0]))
  for (const satir of tablo) for (const [k] of MOTORLAR) if (ISTEK_KARARLARI.has(satir?.[k]?.durum)) s[k]++
  return s
}

/** SEO-114: yayından sonra görünme ölçümü günleri (Y2.1 Görünme kuralı) ve izlenen pencere (14. gün + 7 gün). */
export const GORUNME_GUNLERI = [3, 7, 14]
export const GORUNME_PENCERE_GUN = 21
const GUN_MS = 24 * 3600 * 1000
const gunEkle = (gun, n) => new Date(Date.parse(`${gun}T00:00:00Z`) + n * GUN_MS).toISOString().slice(0, 10)

/** Yazı kaydı metninden (src/data/bilgiMerkezi/yazilar.ts) [{slug, yayin}]: her yayinTarihi'nden sonraki ilk `slug:` yazının kendi TR adresidir. */
export function yayinTarihleri(metin) {
  const sonuc = []
  const re = /yayinTarihi:\s*'(\d{4}-\d{2}-\d{2})'/g
  let m
  while ((m = re.exec(metin))) {
    const slug = /slug:\s*'([a-z0-9-]+)'/.exec(metin.slice(re.lastIndex))
    if (slug) sonuc.push({ slug: slug[1], yayin: m[1] })
  }
  return sonuc
}

/** Depo dışı hareketler.jsonl (dizin-takip klasörü): bozuk satır atlanır, dosya yoksa []. */
export function hareketOku(klasor) {
  try {
    return readFileSync(join(klasor, 'hareketler.jsonl'), 'utf8').split('\n').filter(Boolean).flatMap((s) => { try { return [JSON.parse(s)] } catch { return [] } })
  } catch { return [] }
}

/**
 * SEO-114 (SEO-113 önerisi B): vadesi gelen ama CANLI ARAMA ölçümü (gorunme eylemi) olmayan yazılar. Yalnız 'gorunme' sayılır; URL denetimi,
 * Search Console gösterimi ve dizin isteği sayılmaz (hava perdesi 11 gün fark edilmedi: o ölçüm Search Console'a bağlıydı).
 * Yazı için en son vadesi gelen gün (3/7/14) alınır; o günden sonra (dahil) bir gorunme kaydı yoksa vadesi geçmiştir. Yayından 21 gün sonra izlenmez.
 */
export function gorunmeVadesi({ yazilar, hareketler, bugun }) {
  const kirilim = { 3: 0, 7: 0, 14: 0 }
  const adlar = []
  for (const { slug, yayin } of yazilar) {
    if (bugun > gunEkle(yayin, GORUNME_PENCERE_GUN)) continue
    const vadeler = GORUNME_GUNLERI.filter((n) => gunEkle(yayin, n) <= bugun)
    if (!vadeler.length) continue
    const n = vadeler[vadeler.length - 1]
    const esik = gunEkle(yayin, n)
    const var_ = hareketler.some((h) => h?.motor === 'google' && h?.eylem === 'gorunme' && typeof h.adres === 'string' && h.adres.endsWith(`/bilgi-merkezi/${slug}`) && typeof h.tarih === 'string' && trGun(Date.parse(h.tarih)) >= esik)
    if (!var_) { kirilim[n]++; adlar.push(slug) }
  }
  return { toplam: adlar.length, kirilim, adlar }
}

function vadeParcasi(vade) {
  if (!vade) return ''
  if (!vade.toplam) return ' | görünme vadesi: yok'
  const k = GORUNME_GUNLERI.filter((n) => vade.kirilim[n]).map((n) => `${n}. gün ${vade.kirilim[n]}`).join(', ')
  return ` | GÖRÜNME VADESİ: ${vade.toplam} yazı canlı aramayla ölçülmedi (${k})`
}

/** Tek satır. anlik null ise "anlık görüntü yok"; bugünden eskiyse "bayat" diye işaretlenir. vade (isteğe bağlı) görünme vadesi parçasını ekler. */
export function satirUret(anlik, bugun, vade = null) {
  if (!anlik) return `DİZİN ${bugun}: anlık görüntü yok; dizin-takip --durum arka planda başlatıldı, istekten önce tabloyu oku${vadeParcasi(vade)}`
  const s = sayilar(anlik.tablo)
  const parca = MOTORLAR.map(([k, ad]) => `${ad} ${s[k]}`).join(', ')
  const bayat = anlik.gun < bugun ? ` — BAYAT (${anlik.gun}); güncel ölçüm arka planda` : ''
  const toplam = Object.values(s).reduce((a, b) => a + b, 0)
  const sonuc = toplam ? 'önce bunlar (kota artığı, sonra yeni yazı)' : 'bekleyen istek yok'
  return `DİZİN ${bugun}: YAP/TEKRAR ${parca} — ${sonuc}${bayat}${vadeParcasi(vade)}`
}

/** Yazı kaydı + defterden vade özeti; kaynak okunamazsa null (satır vade parçasız kalır, fail-open). */
export function vadeOku({ klasor, bugun, yazilarYolu = join(BU_DIZIN, '..', '..', 'src', 'data', 'bilgiMerkezi', 'yazilar.ts') }) {
  try {
    const yazilar = yayinTarihleri(readFileSync(yazilarYolu, 'utf8'))
    if (!yazilar.length) return null
    return gorunmeVadesi({ yazilar, hareketler: hareketOku(klasor), bugun })
  } catch { return null }
}

export function kilitTaze(klasor, simdi) {
  try { return simdi - statSync(join(klasor, '.durum-kilit')).mtimeMs < KILIT_OMRU_MS } catch { return false }
}

function arkaPlanBaslat(klasor, env) {
  mkdirSync(klasor, { recursive: true })
  writeFileSync(join(klasor, '.durum-kilit'), String(Date.now()))
  const anahtar = env.GSC_SA_ANAHTAR || join(homedir(), '.claude', 'gsc-anahtar.json')
  const cocuk = kopukBaslat(join(BU_DIZIN, 'dizin-takip.mjs'), ['--durum', '--cikti', klasor], { env: { ...env, GSC_SA_ANAHTAR: anahtar } })
  cocuk.on('error', () => {})
}

/**
 * Çekirdek: satırı döndürür; gerekirse arka plan ölçümü başlatır. Hiçbir koşulda fırlatmaz.
 * @param {{klasor?: string, simdi?: number, env?: Record<string, string | undefined>, baslat?: boolean, baslatici?: (klasor: string, env: Record<string, string | undefined>) => void}} [secenek]
 */
export function calistir({ klasor = arsivKlasoru(), simdi = Date.now(), env = process.env, baslat = true, baslatici = arkaPlanBaslat } = {}) {
  if (env.VENTHUB_DIZIN_ACILIS_KAPAT === '1') return ''
  try {
    const bugun = trGun(simdi)
    const anlik = enSonAnlik(klasor)
    const taze = anlik && anlik.gun >= bugun
    let baslatildi = false
    if (!taze && baslat && !kilitTaze(klasor, simdi)) {
      try { baslatici(klasor, env); baslatildi = true } catch { /* sessiz */ }
    }
    const satir = satirUret(anlik, bugun, vadeOku({ klasor, bugun }))
    return !taze && !baslatildi && !anlik ? satir.replace('arka planda başlatıldı', 'ölçüm sürüyor ya da başlatılamadı') : satir
  } catch {
    return ''
  }
}

/**
 * Sabah özeti için TEK satır (SEO-103, OPS): Google dizin isteği kuyruğunda bekleyen adres sayısı. Kaynak: arşivdeki en son
 * anlık görüntü (Google'ın kendi ölçümü: YAP + TEKRAR). Kuyruk boşalana kadar sayı görünür, 0 olunca "boş" der.
 * Anlık görüntü yoksa "ölçülemedi" (asla "boş" değil); bugünden eskiyse BAYAT notu düşer. Ham adres basılmaz. SALT-OKUMA.
 */
export function kuyrukSatiri({ klasor = arsivKlasoru(), simdi = Date.now() } = {}) {
  try {
    const anlik = enSonAnlik(klasor)
    if (!anlik) return 'Google dizin kuyruğu ölçülemedi: arşivde anlık görüntü yok'
    const n = sayilar(anlik.tablo).google
    const gun = anlik.gun.slice(5).split('-').reverse().join('.')
    const bayat = anlik.gun < trGun(simdi) ? `, BAYAT: ${gun} ölçümü` : `, ölçüm ${gun}`
    return n > 0 ? `Google dizin kuyruğunda ${n} adres bekliyor${bayat}` : `Google dizin kuyruğu boş${bayat}`
  } catch {
    return 'Google dizin kuyruğu ölçülemedi'
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--kuyruk')) {
    console.log(kuyrukSatiri())
    process.exit(0)
  }
  try {
    const satir = calistir({ baslat: !process.argv.includes('--sadece-satir') })
    if (satir) console.log(satir)
  } catch { /* fail-open */ }
  process.exit(0)
}
