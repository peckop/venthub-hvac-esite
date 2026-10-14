#!/usr/bin/env node
/**
 * SEARCH CONSOLE AYLIK ARŞİV — 16 ay dolmadan ham dışa aktarım (Kanban SEO-52; cetveller
 * docs/standards/pazar-olcum-standard.md P2/P6 ve docs/standards/yayin-gorunurluk-denetim-standard.md).
 *
 * NİÇİN: Search Console performans verisi yalnız ~16 ay saklanır; mülk 28 Ağustos 2026'da kuruldu, veri kaybı
 * 2027 Aralık'ta başlar ama arşiv alışkanlığı olmazsa o gün geri alınamaz. Supermetrics kalktı (karar 365):
 * bu betik aynı ham dışa aktarımı kendi hizmet hesabımızla yapar.
 *
 * NE YAPAR: 8 kırılımı (gün, gün×sayfa, gün×sorgu, sorgu×sayfa, gün×cihaz, gün×ülke, sayfa, sorgu) verilen tarih
 * aralığı için çeker (rowLimit 25000, startRow ile sayfalar), her kırılımı bir JSONL dosyasına, hepsinin özetini
 * `gsc-dizin.json`a (ne, aralık, satır sayısı, ilk/son gün) yazar. Hepsi `--cikti` altındaki
 * `gsc-arsiv-<bitis>/` klasörüne gider; aynı bitiş günüyle ikinci koşu klasörün ÜZERİNE yazar (sonuç aynıdır).
 *
 * KURALLAR (cetvel):
 * - P6: sayfa/sorgu verisi PUBLIC depoya girmez. `--cikti` depo içindeyse ve git yok saymıyorsa betik DURUR.
 * - P2: son 3 gün ön veridir (dataState `all` kararsızdır): varsayılan bitiş bugünden 3 gün önce, dataState `final`.
 * - Eksik veri sessizce atlanmaz: bir kırılımın herhangi bir sayfası hata verirse betik DURUR (çıkış 1), kısmi
 *   dosya "tamam" diye dizine yazılmaz.
 *
 * Kimlik: `scripts/gsc/gsc-token.cjs` (hizmet hesabı; `GSC_SA_ANAHTAR` ortam değişkeni, dosya YOLU). Jeton ve anahtar
 * hiçbir çıktıya yazılmaz.
 *
 * Kullanım: GSC_SA_ANAHTAR=<yol> node scripts/seo/gsc-arsiv.mjs --cikti <depo-dışı-klasör>
 *             [--baslangic YYYY-MM-DD] [--bitis YYYY-MM-DD] [--kuru]
 *   Varsayılan aralık: bugünden 3 gün önce biten, 16 aylık pencere (Search Console saklama sınırı).
 *   Aylık çekim: her ayın 1'i varsayılan pencereyle koşulur (16 ay bir önceki çekimi de kapsar).
 *   --kuru  Hiçbir şey çekmez/yazmaz; aralığı, kırılımları ve çıktı klasörünü basar.
 * Çıkış: 0 tamam · 1 çekim yarım kaldı (hata ya da sayfalama sınırı) · 2 araç koşmadı (argüman, jeton, çıktı yolu).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MULK, ON_VERI_GUNU, depoIcinde } from '../rehber/gsc-taban.mjs'
import { ciktiYoluKontrol } from './gsc-sayfa-oku.mjs'

export const SAYFA_BOYU = 25_000
export const SAYFA_AZAMI = 400 // 400 × 25000 = 10M satır: kontrolsüz döngüye karşı üst sınır (aşılırsa DUR)
export const ARSIV_AY = 16

/** Ad → boyutlar. Ad dosya adının parçasıdır (gsc-<ad>.jsonl) ve dizinde görünür; değiştirmek arşivi böler. */
export const KIRILIMLAR = Object.freeze({
  gun: ['date'],
  'gun-sayfa': ['date', 'page'],
  'gun-sorgu': ['date', 'query'],
  'sorgu-sayfa': ['query', 'page'],
  'gun-cihaz': ['date', 'device'],
  'gun-ulke': ['date', 'country'],
  sayfa: ['page'],
  sorgu: ['query'],
})

const GUN_MS = 24 * 3600 * 1000
const gunStr = (d) => d.toISOString().slice(0, 10)
const TARIH = /^\d{4}-\d{2}-\d{2}$/

/** `YYYY-MM-DD` geçerli bir takvim günü mü (2026-02-30 gibi taşan tarih reddedilir). */
export function tarihGecerli(s) {
  if (!TARIH.test(String(s ?? ''))) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && gunStr(d) === s
}

/** Bugün (UTC) için aralık: bitiş = bugün − ON_VERI_GUNU, başlangıç = bitişten `ay` ay önce + 1 gün. */
export function varsayilanAralik(bugun, ay = ARSIV_AY) {
  const bitis = new Date(Date.UTC(bugun.getUTCFullYear(), bugun.getUTCMonth(), bugun.getUTCDate()) - ON_VERI_GUNU * GUN_MS)
  const bas = new Date(Date.UTC(bitis.getUTCFullYear(), bitis.getUTCMonth() - ay, bitis.getUTCDate()))
  // Ay sonu taşması (31 Mart − 1 ay gibi): JS ileri taşır; geri sar ki pencere ay'dan UZUN kalmasın.
  if (bas.getUTCDate() !== bitis.getUTCDate()) bas.setUTCDate(0)
  return { baslangic: gunStr(new Date(bas.getTime() + GUN_MS)), bitis: gunStr(bitis) }
}

/** Argümanlardan aralık: ikisi de verilmezse varsayılan; biri verilmezse eksik olan varsayılandan gelir. */
export function aralikCoz({ baslangic, bitis }, bugun = new Date()) {
  const v = varsayilanAralik(bugun)
  const a = { baslangic: baslangic ?? v.baslangic, bitis: bitis ?? v.bitis }
  for (const [ad, deger] of Object.entries(a)) {
    if (!tarihGecerli(deger)) throw new Error(`--${ad} geçerli bir YYYY-MM-DD günü değil: ${deger}`)
  }
  if (a.baslangic > a.bitis) throw new Error(`başlangıç (${a.baslangic}) bitişten (${a.bitis}) sonra`)
  const sinir = gunStr(new Date(Date.UTC(bugun.getUTCFullYear(), bugun.getUTCMonth(), bugun.getUTCDate()) - ON_VERI_GUNU * GUN_MS))
  if (a.bitis > sinir) throw new Error(`bitiş (${a.bitis}) ön veri günlerine giriyor; en geç ${sinir} (P2: son ${ON_VERI_GUNU} gün kararsız)`)
  return a
}

/**
 * Bir kırılımı sayfalayarak çeker. `sorguFn(govde)` → { rows } ya da Hata fırlatır. Sayfa dolu geldiyse sonraki
 * `startRow` istenir; son sayfa kısa gelince biter. Üst sınır aşılırsa fırlatır (sessiz kesme yok).
 */
export async function sayfala(sorguFn, temelGovde, { sayfaBoyu = SAYFA_BOYU, sayfaAzami = SAYFA_AZAMI } = {}) {
  const satirlar = []
  let baslangicSatir = 0
  for (let sayfa = 1; ; sayfa++) {
    if (sayfa > sayfaAzami) throw new Error(`sayfalama sınırı aşıldı (${sayfaAzami} sayfa); kırılım tam alınamadı`)
    const y = await sorguFn({ ...temelGovde, rowLimit: sayfaBoyu, startRow: baslangicSatir })
    const rows = Array.isArray(y?.rows) ? y.rows : []
    satirlar.push(...rows)
    if (rows.length < sayfaBoyu) break
    baslangicSatir += rows.length
  }
  return satirlar
}

/** Ham API satırı → arşiv satırı (yalnız bilinen alanlar; anahtar sırası sabit). */
export function arsivSatiri(s) {
  return { keys: s.keys, clicks: s.clicks, impressions: s.impressions, ctr: s.ctr, position: s.position }
}

/** Satırlar → JSONL metni (boşsa boş dize; her satır \n ile biter). */
export function jsonlMetni(satirlar) {
  return satirlar.map((s) => JSON.stringify(arsivSatiri(s))).join('\n') + (satirlar.length ? '\n' : '')
}

/** Bir kırılımın dizin satırı. Gün boyutu varsa ilk/son gün ölçülür, yoksa null. */
export function dizinSatiri(ad, boyutlar, satirlar) {
  const gunIdx = boyutlar.indexOf('date')
  const gunler = gunIdx >= 0 ? satirlar.map((s) => s.keys[gunIdx]).sort() : []
  return {
    dosya: `gsc-${ad}.jsonl`, kirilim: boyutlar.join('×'), satir: satirlar.length,
    ilk: gunler[0] ?? null, son: gunler.at(-1) ?? null,
  }
}

/** Dizin dosyası içeriği. `alinma` çağıranın verdiği saat (testte sabit). */
export function dizinMetni({ site, aralik, dosyalar, alinma }) {
  return JSON.stringify({
    site, baslangic: aralik.baslangic, bitis: aralik.bitis, dataState: 'final', type: 'web', alinma, dosyalar,
  }, null, 1) + '\n'
}

/** Çıktı klasörü adı: aynı bitişle ikinci koşu aynı klasöre (üzerine yazar). */
export const arsivKlasoru = (cikti, bitis) => join(resolve(cikti), `gsc-arsiv-${bitis}`)

/**
 * Tüm kırılımları çeker ve `icerik` (dosya adı → metin) haritası döndürür; DİSKE YAZMAZ. Bir kırılım hata verirse
 * fırlatır ve hiçbir sonuç dönmez: çağıran kısmi arşivi diske hiç yazmaz (kısmi dizin "tamam" görünmez).
 * `sorguFn` enjekte edilir (ağsız test).
 */
export async function arsivle({ sorguFn, site = MULK, aralik, kirilimlar = KIRILIMLAR, alinma = new Date().toISOString(), log = () => {} }) {
  const dosyalar = []
  const icerik = new Map()
  for (const [ad, boyutlar] of Object.entries(kirilimlar)) {
    const satirlar = await sayfala(sorguFn, {
      startDate: aralik.baslangic, endDate: aralik.bitis, dimensions: boyutlar, dataState: 'final', type: 'web',
    })
    icerik.set(`gsc-${ad}.jsonl`, jsonlMetni(satirlar))
    const d = dizinSatiri(ad, boyutlar, satirlar)
    dosyalar.push(d)
    log(`gsc-${ad}: ${d.satir} satır${d.ilk ? ` · ${d.ilk} → ${d.son}` : ''}`)
  }
  icerik.set('gsc-dizin.json', dizinMetni({ site, aralik, dosyalar, alinma }))
  return { dosyalar, icerik }
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const kuru = arg.includes('--kuru')
  const cikti = deger('--cikti')

  let aralik
  try { aralik = aralikCoz({ baslangic: deger('--baslangic'), bitis: deger('--bitis') }) } catch (e) {
    console.error('HATA:', e.message); process.exit(2)
  }

  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  let yokSayiliyor = false
  if (cikti && depoIcinde(cikti, kok)) {
    try { execFileSync('git', ['check-ignore', '-q', resolve(cikti)], { cwd: kok, stdio: 'ignore' }); yokSayiliyor = true } catch { yokSayiliyor = false }
  }
  const kontrol = ciktiYoluKontrol(cikti, kok, yokSayiliyor)
  if (!kontrol.gecerli) { console.error('HATA:', kontrol.neden); process.exit(2) }

  const hedef = arsivKlasoru(cikti, aralik.bitis)
  if (kuru) {
    console.log(`KURU: ${MULK} · ${aralik.baslangic} → ${aralik.bitis} · ${Object.keys(KIRILIMLAR).length} kırılım · klasör ${hedef}`)
    console.log(Object.entries(KIRILIMLAR).map(([a, b]) => `  gsc-${a}.jsonl  ${b.join('×')}`).join('\n'))
    process.exit(0)
  }

  if (!process.env.GSC_SA_ANAHTAR) { console.error('HATA: GSC_SA_ANAHTAR ortam değişkeni yok (hizmet hesabı JSON dosya yolu)'); process.exit(2) }
  let jeton
  try { jeton = execFileSync('node', [join(kok, 'scripts/gsc/gsc-token.cjs')], { env: process.env }).toString().trim() } catch {
    console.error('HATA: jeton alınamadı (GSC_SA_ANAHTAR yolu geçerli mi?)'); process.exit(2)
  }

  const sorguFn = async (govde) => {
    const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`, {
      method: 'POST', headers: { authorization: `Bearer ${jeton}`, 'content-type': 'application/json' }, body: JSON.stringify(govde),
    })
    const t = await r.text()
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${t.slice(0, 160)}`)
    return JSON.parse(t)
  }

  // Önce belleğe topla, sonra yaz: yarıda hata klasörde kısmi arşiv bırakmaz.
  let sonuc
  try {
    sonuc = await arsivle({ sorguFn, aralik, log: (s) => console.log(s) })
  } catch (e) {
    console.error('HATA: çekim yarım kaldı, hiçbir dosya yazılmadı:', String(e?.message ?? e).slice(0, 200)); process.exit(1)
  }
  mkdirSync(hedef, { recursive: true })
  for (const [ad, metin] of sonuc.icerik) writeFileSync(join(hedef, ad), metin)
  console.log(`TAMAM: ${hedef}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', String(e?.message ?? e).slice(0, 160)); process.exitCode = 2 })
}
