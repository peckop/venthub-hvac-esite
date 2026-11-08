/**
 * GENEL SEARCH CONSOLE SORGU OKUYUCU (Kanban SEO-97, OPS-256 adayı 1; cetveller
 * docs/standards/pazar-olcum-standard.md P2/P6 ve docs/standards/geo-olcum-standard.md).
 *
 * NİÇİN: GSC `searchAnalytics/query` çağrısı ölçüm başına yeniden yazılıyordu (sorgu, sayfa, süzgeç, sayfalama;
 * 10 ayrı betik, OPS-256 sayımı). Jeton zaten ortak (`scripts/gsc/gsc-token.cjs`); sorgu kısmı bu betikte tek yerde durur.
 * Tek sayfa için `gsc-sayfa-oku.mjs` (denetim + günlük seri), bütün site için `rehber/gsc-taban.mjs` var; bu betik
 * ikisinin arasındaki "şu sorgu/sayfa kümesini bana ver" işidir.
 *
 * KURALLAR (cetvel): son 3 gün ön veri olduğu için pencerenin dışındadır (P2; `--bitis` bugünden 3 gün öncesini aşamaz);
 * sorgu ve sayfa verisi PUBLIC depoya girmez (P6): `--cikti` ZORUNLU ve depo içindeyse git yok saymıyorsa betik DURUR;
 * ekrana yalnız ilk N satır yazılır. Hata yanıtı sessiz sıfıra çevrilmez: okunamayan sayfa "ÖLÇÜLEMEDİ" olarak yazılır
 * ve çıkış kodu 1 olur. Jeton ve anahtar hiçbir çıktıya yazılmaz.
 *
 * Kullanım: GSC_SA_ANAHTAR=<yol> node scripts/seo/gsc-sorgu-oku.mjs --cikti <depo-dışı-klasör> [seçenekler]
 *   --boyut query,page,date,device,country,searchAppearance   (varsayılan: query; birden çok olabilir)
 *   --sorgu-icerir <metin> | --sorgu-esit <metin> | --sorgu-regex <regex>   (regex istemci tarafında, büyük/küçük harf yok)
 *   --adres-icerir <metin> | --adres-esit <tam https adresi>
 *   --gun 28 (1-480) | --baslangic YYYY-MM-DD --bitis YYYY-MM-DD
 *   --satir 1000 (en çok 100000; sayfalar 25000'lik)   --en-az-gosterim N   --ilk 20 (ekrana)
 * Çıkış: 0 okundu · 1 okuma hatası (kısmi veri yazılmaz) · 2 araç koşmadı (argüman, jeton, çıktı yolu).
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MULK, donem, depoIcinde, ON_VERI_GUNU } from '../rehber/gsc-taban.mjs'
import { ciktiYoluKontrol } from './gsc-sayfa-oku.mjs'

export const BOYUTLAR = ['query', 'page', 'date', 'device', 'country', 'searchAppearance']
export const SAYFA_BOYUTU = 25000
export const EN_COK_SATIR = 100000
const TARIH = /^\d{4}-\d{2}-\d{2}$/

/** argv → {secenek} ya da {hata}. Saf; çevre ve ağ yok. */
export function argumanAyikla(argv, bugun = new Date()) {
  const deger = (b) => {
    const i = argv.indexOf(b)
    if (i < 0) return undefined
    const s = argv[i + 1]
    return s === undefined || s.startsWith('--') ? true : s
  }
  const metin = (b) => {
    const v = deger(b)
    if (v === undefined) return undefined
    if (v === true || String(v).trim() === '') throw new Error(`${b} bir değer ister`)
    return String(v)
  }
  try {
    const boyut = (metin('--boyut') ?? 'query').split(',').map((s) => s.trim()).filter(Boolean)
    const yanlis = boyut.filter((b) => !BOYUTLAR.includes(b))
    if (boyut.length === 0 || yanlis.length) throw new Error(`--boyut geçersiz: ${yanlis.join(',') || 'boş'} (izinli: ${BOYUTLAR.join(', ')})`)
    if (new Set(boyut).size !== boyut.length) throw new Error('--boyut yinelenen boyut içeriyor')

    const sorguIcerir = metin('--sorgu-icerir')
    const sorguEsit = metin('--sorgu-esit')
    const adresIcerir = metin('--adres-icerir')
    const adresEsit = metin('--adres-esit')
    const regexMetni = metin('--sorgu-regex')
    if (sorguIcerir && sorguEsit) throw new Error('--sorgu-icerir ile --sorgu-esit birlikte kullanılamaz')
    if (adresIcerir && adresEsit) throw new Error('--adres-icerir ile --adres-esit birlikte kullanılamaz')
    if (adresEsit && /^[A-Za-z]:[\\/]/.test(adresEsit)) throw new Error(`Windows yolu geldi (${adresEsit}): Git Bash "/tr/..." argümanını çevirmiş olabilir; tam https adresi ver`)
    let regex = null
    if (regexMetni) {
      try { regex = new RegExp(regexMetni, 'i') } catch (e) { throw new Error(`--sorgu-regex geçersiz: ${e.message}`) }
      if (!boyut.includes('query')) throw new Error('--sorgu-regex için --boyut içinde query olmalı')
    }

    const sayi = (b, varsayilan, alt, ust) => {
      const v = deger(b)
      if (v === undefined) return varsayilan
      const n = Number(v)
      if (!Number.isInteger(n) || n < alt || n > ust) throw new Error(`${b} ${alt}-${ust} arası tam sayı olmalı`)
      return n
    }
    const gun = sayi('--gun', 28, 1, 480)
    const satir = sayi('--satir', 1000, 1, EN_COK_SATIR)
    const enAzGosterim = sayi('--en-az-gosterim', 0, 0, 1_000_000)
    const ilk = sayi('--ilk', 20, 0, 1000)

    const baslangic = metin('--baslangic')
    const bitis = metin('--bitis')
    let d
    if (baslangic || bitis) {
      if (!baslangic || !bitis) throw new Error('--baslangic ve --bitis birlikte verilir')
      if (!TARIH.test(baslangic) || !TARIH.test(bitis) || Number.isNaN(Date.parse(baslangic)) || Number.isNaN(Date.parse(bitis))) throw new Error('--baslangic/--bitis YYYY-MM-DD biçiminde olmalı')
      if (baslangic > bitis) throw new Error('--baslangic, --bitis tarihinden sonra olamaz')
      const enGec = donem(bugun, 1).endDate
      if (bitis > enGec) throw new Error(`--bitis ${enGec} tarihini aşamaz (son ${ON_VERI_GUNU} gün ön veri; P2)`)
      d = { startDate: baslangic, endDate: bitis }
    } else {
      d = donem(bugun, gun)
    }
    return { secenek: { boyut, sorguIcerir, sorguEsit, adresIcerir, adresEsit, regex, satir, enAzGosterim, ilk, d, cikti: metin('--cikti') } }
  } catch (e) {
    return { hata: e.message }
  }
}

/** Seçenek → searchAnalytics dimensionFilterGroups (boş süzgeç yoksa undefined). */
export function suzgecler(s) {
  const f = []
  if (s.sorguIcerir) f.push({ dimension: 'query', operator: 'contains', expression: s.sorguIcerir })
  if (s.sorguEsit) f.push({ dimension: 'query', operator: 'equals', expression: s.sorguEsit })
  if (s.adresIcerir) f.push({ dimension: 'page', operator: 'contains', expression: s.adresIcerir })
  if (s.adresEsit) f.push({ dimension: 'page', operator: 'equals', expression: s.adresEsit })
  return f.length ? [{ groupType: 'and', filters: f }] : undefined
}

/** Tek istek gövdesi (sayfalama: startRow). */
export function govdeKur(s, startRow, rowLimit) {
  const govde = { startDate: s.d.startDate, endDate: s.d.endDate, dimensions: s.boyut, dataState: 'final', rowLimit, startRow }
  const g = suzgecler(s)
  if (g) govde.dimensionFilterGroups = g
  return govde
}

/** API satırı → anahtarlı satır. Boyut sayısı ile anahtar sayısı uyuşmazsa HATA (sessiz kayma yok). */
export function satirNormalle(r, boyutlar) {
  if (!Array.isArray(r?.keys) || r.keys.length !== boyutlar.length) throw new Error(`satır ${boyutlar.length} anahtar beklerken ${Array.isArray(r?.keys) ? r.keys.length : 'anahtarsız'} geldi`)
  return {
    anahtar: Object.fromEntries(boyutlar.map((b, i) => [b, r.keys[i]])),
    tik: r.clicks ?? 0,
    gosterim: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    sira: typeof r.position === 'number' ? Math.round(r.position * 10) / 10 : null,
  }
}

/** İstemci tarafı süzgeç: regex (sorgu) ve en az gösterim. */
export function suz(satirlar, s) {
  return satirlar.filter((r) => (!s.regex || s.regex.test(r.anahtar.query ?? '')) && r.gosterim >= s.enAzGosterim)
}

/** Toplamlar; ortalama sıra gösterim ağırlıklıdır. Satır yoksa sıra null (0 değil). */
export function toplam(satirlar) {
  let tik = 0, gosterim = 0, agirlik = 0
  for (const r of satirlar) {
    tik += r.tik
    gosterim += r.gosterim
    if (r.sira !== null) agirlik += r.sira * r.gosterim
  }
  return { satir: satirlar.length, tik, gosterim, ctr: gosterim ? Math.round((tik / gosterim) * 10000) / 10000 : null, ortSira: gosterim ? Math.round((agirlik / gosterim) * 10) / 10 : null }
}

/** Ekrana: gösterime göre azalan ilk N satır, tek satırda boyut değerleri. */
export function ekranSatirlari(satirlar, ilk) {
  return [...satirlar]
    .sort((a, b) => b.gosterim - a.gosterim || b.tik - a.tik)
    .slice(0, ilk)
    .map((r) => `${Object.values(r.anahtar).join(' | ')} | gösterim ${r.gosterim} · tık ${r.tik} · sıra ${r.sira ?? '-'}`)
}

/**
 * Sayfalı okuma. `fetchFn` enjekte edilebilir (ağsız test). Herhangi bir sayfa hata verirse {hata} döner ve o ana dek
 * toplanan satırlar KULLANILMAZ (kısmi veri tam veri gibi görünmesin).
 */
export async function okuSorgu(s, { site = MULK, jeton = '', fetchFn = fetch } = {}) {
  const yetki = { authorization: `Bearer ${jeton}`, 'content-type': 'application/json' }
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`
  const satirlar = []
  let startRow = 0
  while (startRow < s.satir) {
    const rowLimit = Math.min(SAYFA_BOYUTU, s.satir - startRow)
    let j
    try {
      const r = await fetchFn(url, { method: 'POST', headers: yetki, body: JSON.stringify(govdeKur(s, startRow, rowLimit)) })
      j = await r.json()
      if (r.ok === false || j?.error) return { hata: `${j?.error?.code ?? r.status} ${String(j?.error?.message ?? 'sorgu başarısız').slice(0, 160)}` }
    } catch (e) {
      return { hata: `ag ${String(e?.message ?? e).slice(0, 160)}` }
    }
    const gelen = j?.rows ?? []
    try { for (const r of gelen) satirlar.push(satirNormalle(r, s.boyut)) } catch (e) { return { hata: e.message } }
    if (gelen.length < rowLimit) break
    startRow += gelen.length
  }
  return { satirlar, kesildi: satirlar.length >= s.satir }
}

async function calistir() {
  const { secenek: s, hata } = argumanAyikla(process.argv.slice(2))
  if (hata) { console.error('HATA:', hata); process.exit(2) }
  if (!s.cikti) { console.error('HATA: --cikti <depo dışı klasör> zorunlu (P6: sorgu/sayfa verisi depoya girmez)'); process.exit(2) }
  if (!process.env.GSC_SA_ANAHTAR) { console.error('HATA: GSC_SA_ANAHTAR ortam değişkeni yok (hizmet hesabı JSON dosya yolu)'); process.exit(2) }

  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  let yokSayiliyor = false
  if (depoIcinde(s.cikti, kok)) {
    try { execFileSync('git', ['check-ignore', '-q', resolve(s.cikti)], { cwd: kok, stdio: 'ignore' }); yokSayiliyor = true } catch { yokSayiliyor = false }
  }
  const kontrol = ciktiYoluKontrol(s.cikti, kok, yokSayiliyor)
  if (!kontrol.gecerli) { console.error('HATA:', kontrol.neden); process.exit(2) }

  let jeton
  try { jeton = execFileSync('node', [join(kok, 'scripts/gsc/gsc-token.cjs')], { env: process.env }).toString().trim() } catch {
    console.error('HATA: jeton alınamadı (GSC_SA_ANAHTAR yolu geçerli mi?)'); process.exit(2)
  }

  const o = await okuSorgu(s, { jeton })
  if (o.hata) { console.error(`ÖLÇÜLEMEDİ: ${o.hata}`); process.exit(1) }
  const suzulmus = suz(o.satirlar, s)
  const t = toplam(suzulmus)
  console.log(`pencere ${s.d.startDate} → ${s.d.endDate} · boyut ${s.boyut.join(',')} · okunan ${o.satirlar.length} · süzülmüş ${t.satir}${o.kesildi ? ` · ⚠ --satir ${s.satir} sınırında kesildi` : ''}`)
  console.log(`toplam gösterim ${t.gosterim} · tık ${t.tik} · ort. sıra ${t.ortSira ?? 'yok'}`)
  for (const l of ekranSatirlari(suzulmus, s.ilk)) console.log(l)
  mkdirSync(s.cikti, { recursive: true })
  const dosya = join(resolve(s.cikti), `gsc-sorgu-oku-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`)
  writeFileSync(dosya, JSON.stringify({ alinma: new Date().toISOString(), site: MULK, donem: s.d, boyut: s.boyut, suzgec: { sorguIcerir: s.sorguIcerir, sorguEsit: s.sorguEsit, sorguRegex: s.regex?.source, adresIcerir: s.adresIcerir, adresEsit: s.adresEsit, enAzGosterim: s.enAzGosterim }, kesildi: o.kesildi, toplam: t, satirlar: suzulmus }, null, 1))
  console.log(`yazıldı: ${dosya}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await calistir()
