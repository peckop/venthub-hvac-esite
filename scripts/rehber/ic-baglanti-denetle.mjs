/**
 * REHBER İÇ BAĞLANTI DENETİMİ — ağlı yarı (rehber-yazisi-standard.md R3 "iç bağlantı kimlikle", R8).
 *
 * NİÇİN (2026-09-24): adres ağacı tek yayında değişecek (REC-300: ürün/aile/kategori önekleri
 * Türkçeleşiyor). Yazıdaki site içi bağlantı eski adrese giderse kırılmaz, 308 ile yönlenir — ama her
 * tıklama bir durak daha yapar ve yazı eski adresi kalıcı taşır. Ağsız yarı (`rehber-denetim.mjs`
 * → `icBaglantiDenetle`) metne düz adres yazılmasını engeller; bu betik YAYINDAKİ sayfanın ürettiği
 * bağlantıların bugün gerçekten doğrudan 200 döndüğünü ölçer. Yönlendirme İZLENMEZ: 3xx = KIRMIZI.
 *
 * ⚠Boş evren yeşil değildir: yayında rehber yazısı yoksa sonuç `EVREN-BOS` olur (çıkış 3), "temiz" değil
 * (rehber-yazisi-standard.md R8.1: site haritasından temsilci seçen kapı boş evrende sessiz yeşil verir).
 *
 * Kullanım:
 *   node scripts/rehber/ic-baglanti-denetle.mjs                      # site haritasındaki rehber yazıları
 *   node scripts/rehber/ic-baglanti-denetle.mjs --sayfa <adres> …    # belirli sayfalar
 *   node scripts/rehber/ic-baglanti-denetle.mjs --adres <adres> …    # sayfa açmadan bağlantı listesi
 * Çıkış: 0 temiz · 1 KIRMIZI · 3 EVREN-BOS (ölçülecek bağlantı yok).
 * Ağa çıkar; CI'daki ağsız `ci` işinde koşmaz. Kapıya bağlama ve zamanlama ALTYAPI'da.
 */

export const SITE_KOKU = 'https://venthub.com.tr'
export const REHBER_DESENI = /\/(?:tr\/bilgi-merkezi|en\/knowledge-hub)\/[^/?#]+\/?$/

/** Site haritası XML → rehber yazısı adresleri. */
export function haritadanYazilar(xml, desen = REHBER_DESENI) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => desen.test(new URL(u).pathname))
}

/**
 * Sayfa HTML'i → yazı gövdesindeki site içi bağlantılar (mutlak, tekil, çapasız).
 * Gövde = ilk `<article>`; yoksa `<main>`; o da yoksa tüm belge. Menü ve alt bilgi bağlantıları
 * yazının sorumluluğunda değildir, sayılmaz.
 */
export function sayfaBaglantilari(html, sayfaAdresi) {
  const govde = html.match(/<article[\s>][\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main[\s>][\s\S]*?<\/main>/i)?.[0] ?? html
  const taban = new URL(sayfaAdresi)
  const out = new Set()
  for (const m of govde.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)) {
    const ham = m[1].trim()
    if (/^(?:mailto:|tel:|javascript:|#)/i.test(ham)) continue
    let u
    try { u = new URL(ham, taban) } catch { continue }
    if (u.host.replace(/^www\./, '') !== taban.host.replace(/^www\./, '')) continue
    u.hash = ''
    out.add(u.toString())
  }
  return [...out]
}

/** HTTP durumu → sınıf. Yönlendirme izlenmediği için 3xx görülür ve KIRMIZI'dır. */
export function siniflandir(durum, konum) {
  if (durum === 200) return { sinif: 'TEMIZ' }
  if (durum >= 300 && durum < 400) return { sinif: 'YONLENDIRME', ayrinti: `${durum} → ${konum ?? '(konum yok)'}` }
  if (durum === 404 || durum === 410) return { sinif: 'YOK', ayrinti: String(durum) }
  return { sinif: 'HATA', ayrinti: String(durum) }
}

/**
 * Betiğin ağdan beklediği en dar biçim — global fetch bunu karşılar, test taklidi de.
 * @typedef {{ status: number, headers?: { get(ad: string): string | null }, text(): Promise<string> }} Cevap
 * @typedef {(adres: string, secenek?: { redirect?: 'manual' }) => Promise<Cevap>} Getir
 */
/**
 * @param {{ sayfalar?: string[], adresler?: string[], getir?: Getir }} p
 * `getir` testte taklit edilir; varsayılanı global fetch (redirect: 'manual').
 */
export async function denetle({ sayfalar = [], adresler = [], getir = fetch } = {}) {
  const kirmizi = []
  const hedefler = new Map() // bağlantı → onu taşıyan sayfalar
  for (const s of sayfalar) {
    let r
    try { r = await getir(s, { redirect: 'manual' }) } catch (e) {
      kirmizi.push({ sinif: 'SAYFA-ACILMADI', sayfa: s, ayrinti: String(e?.cause?.code || e?.message || e) }); continue
    }
    if (r.status !== 200) { kirmizi.push({ sinif: 'SAYFA-ACILMADI', sayfa: s, ayrinti: String(r.status) }); continue }
    for (const b of sayfaBaglantilari(await r.text(), s)) hedefler.set(b, [...(hedefler.get(b) || []), s])
  }
  for (const a of adresler) hedefler.set(a, [...(hedefler.get(a) || []), '(--adres)'])
  const sonuc = []
  for (const [b, kaynak] of hedefler) {
    let s
    try {
      // GET: bazı sunucular HEAD'e 405 döner; yanlış kırmızı olmasın
      const r = await getir(b, { redirect: 'manual' })
      s = siniflandir(r.status, r.headers?.get?.('location'))
    } catch (e) {
      s = { sinif: 'HATA', ayrinti: String(e?.cause?.code || e?.message || e) }
    }
    sonuc.push({ baglanti: b, sayfalar: kaynak, ...s })
    if (s.sinif !== 'TEMIZ') kirmizi.push({ sinif: s.sinif, baglanti: b, sayfalar: kaynak, ayrinti: s.ayrinti })
  }
  const durum = kirmizi.length ? 'KIRMIZI' : hedefler.size === 0 ? 'EVREN-BOS' : 'TEMIZ'
  return { durum, ozet: { sayfa: sayfalar.length, baglanti: hedefler.size, kirmizi: kirmizi.length }, kirmizi, sonuc }
}

// ─── komut satırı ──────────────────────────────────────────────────────────────
const buDosya = import.meta.url.replace(/\\/g, '/').toLowerCase()
const cagrilan = process.argv[1] ? `file:///${process.argv[1].replace(/\\/g, '/').replace(/^\//, '')}`.toLowerCase() : ''
if (buDosya === cagrilan) {
  const arg = process.argv.slice(2)
  const topla = (bayrak) => arg.flatMap((a, i) => (a === bayrak && arg[i + 1] ? [arg[i + 1]] : []))
  let sayfalar = topla('--sayfa')
  const adresler = topla('--adres')
  if (!sayfalar.length && !adresler.length) {
    const r = await fetch(`${SITE_KOKU}/sitemap.xml`)
    sayfalar = haritadanYazilar(await r.text())
  }
  const s = await denetle({ sayfalar, adresler })
  console.log(JSON.stringify({ durum: s.durum, ozet: s.ozet }))
  for (const k of s.kirmizi) console.log(`${k.sinif} | ${k.baglanti || k.sayfa} | ${k.ayrinti || ''}`)
  if (s.durum === 'EVREN-BOS') console.log('EVREN-BOS: ölçülecek bağlantı yok (yayında rehber yazısı yok) — bu TEMİZ demek değildir')
  process.exit(s.durum === 'KIRMIZI' ? 1 : s.durum === 'EVREN-BOS' ? 3 : 0)
}
