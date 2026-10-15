/**
 * TEK SAYFA OKUMA — Search Console'dan az sayıda adres için hızlı okuma (Kanban SEO-41; OPS-123 ihtiyaç analizi;
 * cetveller docs/standards/yayin-gorunurluk-denetim-standard.md ve docs/standards/pazar-olcum-standard.md).
 *
 * NİÇİN: yayın sonrası 3/7/14. gün okumasında (yeni yazı, kategori başlığı) iki elle iş tekrarlanıyordu:
 * URL denetimi için bölmede tıklama, günlük gösterim için ayrı sorgu. `gsc-url-denetim.mjs` bütün haritayı
 * (92 adres, ~10 dk) gezer, `gsc-taban.mjs` bütün siteyi 90 günlük çeker; ikisi de 1-3 adres için ağır.
 *
 * NE YAPAR: her adres için (a) Googlebot gözüyle URL denetimi satırı (karar, kapsam, getirme, robots, son tarama,
 * Google'ın seçtiği kanonik) ve (b) page×date günlük tık/gösterim/sıra dizisi (veri olmayan gün 0 ile DOLDURULUR,
 * ilk ve son gösterim günü, pencere bitişi). İkisi tek JSON'a depo dışına yazılır; ekrana adres başına tek satır.
 *
 * KURALLAR (cetvel): son 3 gün ön veri olduğu için pencerenin dışındadır (P2); sorgu/sayfa verisi PUBLIC depoya
 * girmez (P6): `--cikti` depo içindeyse ve git yok saymıyorsa betik DURUR; ölçülemeyen "ölçülemedi" olarak
 * yazılır, sıfıra çevrilmez (hata yanıtı satırda `hata` alanıdır).
 *
 * Kimlik: `scripts/gsc/gsc-token.cjs` (hizmet hesabı; `GSC_SA_ANAHTAR` ortam değişkeni, dosya YOLU). Jeton ve
 * anahtar hiçbir çıktıya yazılmaz.
 * Kullanım: GSC_SA_ANAHTAR=<yol> node scripts/seo/gsc-sayfa-oku.mjs --adres /tr/bilgi-merkezi/x,https://venthub.com.tr/tr/y
 *           --cikti <depo-dışı-klasör> [--gun 28] [--taban https://venthub.com.tr]
 * Çıkış: 0 hepsi okundu · 1 en az bir adres denetlenemedi / gösterim okunamadı · 2 araç koşmadı (argüman, jeton, çıktı yolu).
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { satirCikar } from './gsc-url-denetim.mjs'
import { MULK, donem, depoIcinde } from '../rehber/gsc-taban.mjs'

export const VARSAYILAN_TABAN = 'https://venthub.com.tr'
const GUN_MS = 24 * 3600 * 1000

/** Yol ya da tam adres → kanonik taban altında tam adres. Taban dışı alan adı REDDEDİLİR (başka siteyi okumayız). */
export function adresNormalle(girdi, taban = VARSAYILAN_TABAN) {
  const t = String(girdi ?? '').trim()
  if (!t) throw new Error('boş adres')
  // Git Bash (MSYS) "/tr/x" argümanını "C:/Program Files/Git/tr/x" yapar; sessizce yanlış adres okumak yerine ipucuyla dur.
  if (/^[A-Za-z]:[\\/]/.test(t)) {
    throw new Error(`Windows yolu geldi (${t}): Git Bash "/tr/..." argümanını çevirmiş olabilir; tam adres (https://...) ya da MSYS_NO_PATHCONV=1 kullan`)
  }
  const kok = new URL(taban)
  const u = t.startsWith('/') ? new URL(t, kok) : new URL(t)
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error(`desteklenmeyen adres: ${t}`)
  if (u.host !== kok.host) throw new Error(`taban dışı adres reddedildi: ${u.host} (beklenen ${kok.host})`)
  u.hash = ''
  u.protocol = kok.protocol
  return u.toString()
}

/** `--adres a,b` → normalleşmiş, tekilleştirilmiş liste (sıra korunur). */
export function adresListesi(deger, taban = VARSAYILAN_TABAN) {
  if (!deger) return []
  const gorulen = new Set()
  const cikti = []
  for (const parca of String(deger).split(',')) {
    if (!parca.trim()) continue
    const a = adresNormalle(parca, taban)
    if (!gorulen.has(a)) { gorulen.add(a); cikti.push(a) }
  }
  return cikti
}

const gunStr = (ms) => new Date(ms).toISOString().slice(0, 10)

/**
 * page×date satırları → pencere boyunca eksiksiz günlük dizi. API veri olmayan günü hiç döndürmez; boş günü 0
 * yazmak ile "o gün veri YOK" demek farklıdır, bu yüzden dizi pencereyi tam doldurur ama `veriGunu` (satırın
 * geldiği gün sayısı) ayrıca verilir.
 */
export function gunlukSeri(satirlar, d) {
  const harita = new Map()
  for (const r of satirlar || []) {
    const tarih = Array.isArray(r.keys) ? r.keys[r.keys.length - 1] : null
    if (tarih) harita.set(tarih, r)
  }
  const baslangic = Date.parse(`${d.startDate}T00:00:00Z`)
  const bitis = Date.parse(`${d.endDate}T00:00:00Z`)
  const gunler = []
  let tik = 0, gosterim = 0, siraAgirlik = 0, ilkGosterim = null, sonGosterim = null, gosterimGunu = 0
  for (let ms = baslangic; ms <= bitis; ms += GUN_MS) {
    const tarih = gunStr(ms)
    const r = harita.get(tarih)
    const g = { tarih, tik: r?.clicks ?? 0, gosterim: r?.impressions ?? 0, sira: r?.position ?? null }
    gunler.push(g)
    tik += g.tik
    gosterim += g.gosterim
    if (g.gosterim > 0) {
      gosterimGunu++
      if (!ilkGosterim) ilkGosterim = tarih
      sonGosterim = tarih
      siraAgirlik += (g.sira ?? 0) * g.gosterim
    }
  }
  return {
    pencere: { baslangic: d.startDate, bitis: d.endDate }, gunler,
    toplam: { tik, gosterim, ortSira: gosterim ? Math.round((siraAgirlik / gosterim) * 10) / 10 : null },
    ilkGosterim, sonGosterim, gosterimGunu, veriGunu: harita.size,
  }
}

/** Denetim satırı + günlük seri → tek adres kaydı. Seri okunamadıysa `seri.hata` taşır ve toplamlar YOK sayılır. */
export function sayfaSatiri(adres, denetim, seri) {
  return { adres, denetim, seri }
}

/** Adres kaydı → ekrana tek satır. Ölçülemeyen parça "ölçülemedi" yazar, 0 yazmaz. */
export function ozetSatir(k) {
  const den = k.denetim?.hata
    ? `denetim ölçülemedi (${k.denetim.hata})`
    : `${k.denetim?.karar ?? '?'} · ${k.denetim?.kapsam ?? '?'} · son tarama ${k.denetim?.sonTarama ? String(k.denetim.sonTarama).slice(0, 10) : 'yok'}`
  const s = k.seri
  const gos = s?.hata
    ? `gösterim ölçülemedi (${s.hata})`
    : `gösterim ${s.toplam.gosterim} (${s.gosterimGunu} gün) · tık ${s.toplam.tik} · ilk ${s.ilkGosterim ?? '-'} · son ${s.sonGosterim ?? '-'} · pencere ${s.pencere.baslangic}→${s.pencere.bitis}`
  const kanonik = k.denetim?.googleKanonik && k.denetim.googleKanonik !== k.adres ? ` · Google kanoniği BAŞKA: ${k.denetim.googleKanonik}` : ''
  return `${k.adres} | ${den} | ${gos}${kanonik}`
}

/** Kayıt "sorunlu" mu: denetlenemedi ya da gösterim okunamadı (sessiz sıfır yok). */
export const sorunlu = (k) => Boolean(k.denetim?.hata || k.seri?.hata)

/**
 * Çıktı yolu kuralı (P6): depo içindeyse yalnız git yok sayıyorsa izinli. `yokSayiliyor` çağıran tarafından
 * `git check-ignore` ile ölçülür; saf fonksiyon test edilebilsin diye dışarıdan alınır.
 */
export function ciktiYoluKontrol(cikti, depoKoku, yokSayiliyor) {
  if (!cikti) return { gecerli: false, neden: '--cikti zorunlu (depo dışı klasör)' }
  if (depoIcinde(cikti, depoKoku) && !yokSayiliyor) {
    return { gecerli: false, neden: `${cikti} depo içinde ve git yok saymıyor — sayfa verisi PUBLIC depoya girer; depo dışı klasör ver` }
  }
  return { gecerli: true, neden: null }
}

/**
 * Tek adres: URL denetimi + günlük seri. `fetchFn` enjekte edilebilir (ağsız test). Hata yanıtı satırda
 * `hata` olarak kalır; hiçbir hata sıfıra çevrilmez.
 */
export async function okuSayfa(adres, { site = MULK, jeton = '', d = donem(new Date(), 28), fetchFn = fetch } = {}) {
  const yetki = { authorization: `Bearer ${jeton}`, 'content-type': 'application/json' }
  let denetimYanit
  try {
    const r = await fetchFn('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST', headers: yetki, body: JSON.stringify({ inspectionUrl: adres, siteUrl: site, languageCode: 'tr' }),
    })
    denetimYanit = await r.json()
  } catch (e) { denetimYanit = { error: { code: 'ag', message: String(e?.message ?? e) } } }
  const denetim = satirCikar(adres, denetimYanit)

  let seri
  try {
    const r = await fetchFn(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: 'POST', headers: yetki,
      body: JSON.stringify({
        startDate: d.startDate, endDate: d.endDate, dimensions: ['page', 'date'], dataState: 'final', rowLimit: 1000,
        dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: adres }] }],
      }),
    })
    const j = await r.json()
    seri = r.ok === false || j?.error
      ? { hata: `${j?.error?.code ?? r.status} ${String(j?.error?.message ?? 'sorgu başarısız').slice(0, 120)}` }
      : gunlukSeri(j.rows || [], d)
  } catch (e) { seri = { hata: `ag ${String(e?.message ?? e).slice(0, 120)}` } }
  return sayfaSatiri(adres, denetim, seri)
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const taban = (deger('--taban') || VARSAYILAN_TABAN).replace(/\/$/, '')
  const cikti = deger('--cikti')
  const gun = Number(deger('--gun') || 28)
  if (!Number.isInteger(gun) || gun < 1 || gun > 480) { console.error('HATA: --gun 1-480 arası tam sayı olmalı'); process.exit(2) }
  let adresler
  try { adresler = adresListesi(deger('--adres'), taban) } catch (e) { console.error('HATA:', e.message); process.exit(2) }
  if (!adresler.length) { console.error('HATA: --adres <yol ya da tam adres>[,...] zorunlu'); process.exit(2) }
  if (!process.env.GSC_SA_ANAHTAR) { console.error('HATA: GSC_SA_ANAHTAR ortam değişkeni yok (hizmet hesabı JSON dosya yolu)'); process.exit(2) }

  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  let yokSayiliyor = false
  if (cikti && depoIcinde(cikti, kok)) {
    try { execFileSync('git', ['check-ignore', '-q', resolve(cikti)], { cwd: kok, stdio: 'ignore' }); yokSayiliyor = true } catch { yokSayiliyor = false }
  }
  const kontrol = ciktiYoluKontrol(cikti, kok, yokSayiliyor)
  if (!kontrol.gecerli) { console.error('HATA:', kontrol.neden); process.exit(2) }

  let jeton
  try { jeton = execFileSync('node', [join(kok, 'scripts/gsc/gsc-token.cjs')], { env: process.env }).toString().trim() } catch (e) {
    console.error('HATA: jeton alınamadı (GSC_SA_ANAHTAR yolu geçerli mi?)'); process.exit(2)
  }

  const d = donem(new Date(), gun)
  const kayitlar = []
  for (const adres of adresler) {
    kayitlar.push(await okuSayfa(adres, { site: MULK, jeton, d }))
    console.log(ozetSatir(kayitlar[kayitlar.length - 1]))
    await new Promise((r) => setTimeout(r, 150))
  }
  mkdirSync(cikti, { recursive: true })
  const dosya = join(resolve(cikti), `gsc-sayfa-oku-${new Date().toISOString().slice(0, 10)}.json`)
  writeFileSync(dosya, JSON.stringify({ alinma: new Date().toISOString(), site: MULK, taban, donem: d, kayitlar }, null, 1))
  console.log(dosya)
  process.exit(kayitlar.some(sorunlu) ? 1 : 0)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', String(e?.message ?? e).slice(0, 160)); process.exitCode = 2 })
}
