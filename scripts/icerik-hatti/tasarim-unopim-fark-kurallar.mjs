/**
 * TASARIM ↔ UNOPIM FARK — saf kurallar (ağ yok, DB yok, dosya yok). `tasarim-unopim-fark.mjs` bunları kullanır;
 * `__tests__/tasarim-unopim-fark.test.ts` kilitler (bozma testi dahil). (KTL-83, KTL-82 fark betiğinin depoya taşınması)
 *
 * NE: Design'ın anlık görüntülerinden beklenen değerleri hesaplar, UnoPIM'deki ürün değerleriyle karşılaştırır:
 * ad (tr), açıklama, kısa açıklama (tr+en), teknik değer, marka, kategori (iki ağaç). SALT OKUMA.
 * NİÇİN AYRI: karşılaştırma çekirdeği G/Ç'siz olursa "betik farkı gerçekten yakalıyor mu" sorusu vitest'te
 * her koşuda ölçülür (bozma testi); aksi halde fark 0 çıkması "temiz" mi "kör" mü ayırt edilemez.
 */

/** @param {unknown} s */
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** UnoPIM yazım kuralı: ADLAR alt çizgi (kategori kodu), tire alt çizgi olur. */
export const kod = (ad) => ad.replace(/-/g, '_')

export const OLCU = {
  max_delivery_m3h: 'debi_m3h', max_static_pressure_pa: 'basinc_pa', max_absorbed_power_w: 'guc_w', absorbed_current_a: 'akim_a',
  noise_level_db_a: 'ses_dba', diameter_mm: 'cap_mm', weight_kg: 'agirlik_kg',
}
export const MARKA_KOD = { Vortice: 'vortice', SEAT: 'seat', Casals: 'casals', 'Nicotra Gebhardt': 'nicotra_gebhardt', Danfoss: 'danfoss', AVenS: 'avens' }
export const ALANLAR = ['ad', 'aciklama', 'kisa_aciklama', 'teknik', 'marka', 'kategori']

/** Design aile dosyasında olmayan seri için SKU/seri önekinden marka. */
export function markaOnek(id) {
  return id.startsWith('danfoss') ? 'Danfoss' : id.startsWith('avens') ? 'AVenS' : id.startsWith('seat') || id.startsWith('storm') || id.startsWith('jet-serisi') ? 'SEAT' : 'Vortice'
}

/**
 * Seri metin özetinden beklenen açıklama + kısa açıklama (tek dil).
 * @param {Record<string, any>} ozet seri kimliği → Design seri kaydı özeti
 */
export function seriMetni(ozet, seri, dil) {
  const s = ozet[seri]
  if (!s) return null
  const govde = s.hangisi && s.hangisi.length
    ? s.hangisi.map((h) => `<h3>${esc(h.ad[dil])}</h3><p>${esc(h.ne[dil])}</p>`)
    : s.kullanimYeri?.[dil] ? [`<p>${esc(s.kullanimYeri[dil])}</p>`] : []
  return {
    description: [...govde, `<p><em>${esc(s.kaynak[dil])}</em></p>`].join(''),
    short_description: s.ozet.length ? `<ul>${s.ozet.map((o) => `<li>${esc(o.b[dil])}: ${esc(o.d[dil])}</li>`).join('')}</ul>` : '',
  }
}

/**
 * Girdinin BİLİNEN BOZUK kopyasını verir (bozma testi). Her bozma ayrı bir alanı hedefler; fark betiği hepsini yakalamalıdır.
 * Girdiyi DEĞİŞTİRMEZ (derin kopya).
 * @param {any} g farkHesapla girdisi
 * @param {string} [hangisi] ALANLAR'dan biri; yoksa hepsi
 */
export function bozmaUygula(g, hangisi) {
  const c = {
    ...g,
    ozet: JSON.parse(JSON.stringify(g.ozet)),
    adTr: new Map(g.adTr),
    degerCsv: new Map([...g.degerCsv].map(([k, v]) => [k, { ...v }])),
    skuSeri: new Map(g.skuSeri),
    seriAile: new Map(g.seriAile),
    urunler: g.urunler,
  }
  const hepsi = !hangisi
  if (hepsi || hangisi === 'ad') { const ilk = [...c.adTr.keys()][0]; if (ilk) c.adTr.set(ilk, `${c.adTr.get(ilk)} X`) }
  const s0 = Object.keys(c.ozet)[0]
  if (s0 && (hepsi || hangisi === 'aciklama')) c.ozet[s0].kaynak.tr += ' X'
  if (s0 && (hepsi || hangisi === 'kisa_aciklama') && c.ozet[s0].ozet.length) c.ozet[s0].ozet[0].d.tr += ' X'
  if (hepsi || hangisi === 'teknik') {
    const r = [...c.degerCsv.values()].find((x) => x.debi_m3h)
    if (r) r.debi_m3h = String(Number(r.debi_m3h) + 1)
  }
  // marka/kategori: UnoPIM tarafındaki ilk ürünün kopyası bozulur (Design eşlemesine dokunulmaz; yoksa metin karşılaştırması da düşer)
  if (c.urunler[0] && (hepsi || hangisi === 'marka' || hangisi === 'kategori')) {
    const u0 = JSON.parse(JSON.stringify(c.urunler[0]))
    if (hepsi || hangisi === 'marka') u0.v.common = { ...(u0.v.common || {}), brand: 'bozma-marka' }
    if (hepsi || hangisi === 'kategori') u0.v.categories = [...(u0.v.categories || []), 'bozma_kategori']
    c.urunler = [u0, ...c.urunler.slice(1)]
  }
  return c
}

/**
 * ANA KARŞILAŞTIRMA.
 * @param {{
 *   urunler: { sku: string, aile: string, status: string, v: any }[],
 *   ozet: Record<string, any>, skuSeri: Map<string, string>, seriAile: Map<string, string>, aileMarka: Map<string, string>,
 *   seriDugum: Map<string, string>, eksik60: Record<string, any>, adTr: Map<string, string>, degerCsv: Map<string, Record<string, string>>,
 * }} g
 */
export function farkHesapla(g) {
  const fark = Object.fromEntries(ALANLAR.map((k) => [k, []]))
  const kontrol = Object.fromEntries(ALANLAR.map((k) => [k, 0]))
  const atlanan = { tasarimdaMetinYok: [], adKaynagiYok: 0, teknikKaynagiDBde: 0 }
  for (const u of g.urunler) {
    const seri = g.skuSeri.get(u.sku) ?? u.aile.replace(/_/g, '-')
    const lo = u.v.channel_locale_specific?.default || {}
    const c = u.v.common || {}
    // metin: eksik60 (ürüne özel) öncelikli, yoksa seri metni
    let beklenen = null
    const e = g.eksik60[u.sku]
    if (e) {
      beklenen = {
        tr: { description: `<p>${esc(e.aciklama.tr)}</p><p><em>${esc(e.kaynak.tr)}</em></p>`, short_description: `<p>${esc(e.kisa.tr)}</p>` },
        en: { description: `<p>${esc(e.aciklama.en)}</p><p><em>${esc(e.kaynak.en)}</em></p>`, short_description: `<p>${esc(e.kisa.en)}</p>` },
      }
    } else if (g.ozet[seri]) beklenen = { tr: seriMetni(g.ozet, seri, 'tr'), en: seriMetni(g.ozet, seri, 'en') }
    if (beklenen) {
      for (const [dil, loc] of [['tr', 'tr_TR'], ['en', 'en_US']]) {
        for (const [alan, anahtar] of [['description', 'aciklama'], ['short_description', 'kisa_aciklama']]) {
          if (!beklenen[dil][alan]) continue // Design özeti boş: karşılaştırma yok
          kontrol[anahtar]++
          if ((lo[loc]?.[alan] ?? '') !== beklenen[dil][alan]) fark[anahtar].push({ sku: u.sku, dil, uno: String(lo[loc]?.[alan] ?? '').slice(0, 80) })
        }
      }
    } else atlanan.tasarimdaMetinYok.push(u.sku)
    // ad
    const ad = g.adTr.get(u.sku) || e?.ad?.tr
    if (ad) { kontrol.ad++; if ((lo.tr_TR?.name ?? '') !== ad) fark.ad.push({ sku: u.sku, design: ad, uno: lo.tr_TR?.name ?? null }) } else atlanan.adKaynagiYok++
    // teknik değer: yalnız Design liste dosyasındaki yeni modeller (eski değerlerin kaynağı DB'dir)
    const d = g.degerCsv.get(u.sku)
    if (d) {
      for (const [attr, col] of Object.entries(OLCU)) {
        if (d[col] === undefined || d[col] === '') continue
        kontrol.teknik++
        const gv = c[attr]
        const n = gv && typeof gv === 'object' ? Number(gv.amount) : Number(gv)
        if (!(Math.abs(n - Number(d[col])) < 1e-6)) fark.teknik.push({ sku: u.sku, alan: attr, design: d[col], uno: gv?.amount ?? gv ?? null })
      }
      if (d.devir_rpm) { kontrol.teknik++; if (String(c.rpm_max) !== String(d.devir_rpm)) fark.teknik.push({ sku: u.sku, alan: 'rpm_max', design: d.devir_rpm, uno: c.rpm_max ?? null }) }
    } else atlanan.teknikKaynagiDBde++
    // marka
    const ai = g.seriAile.get(seri)
    const marka = ai ? g.aileMarka.get(ai) : markaOnek(seri)
    kontrol.marka++
    if (c.brand !== MARKA_KOD[marka]) fark.marka.push({ sku: u.sku, design: MARKA_KOD[marka], uno: c.brand ?? null })
    // kategori (iki ağaç): menü yaprağı m_<düğüm> + seri s_<seri>
    const dg = g.seriDugum.get(seri)
    const bek = [dg ? `m_${kod(dg.split('/').pop())}` : null, `s_${kod(seri)}`].filter(Boolean).sort()
    const var_ = [...(u.v.categories || [])].sort()
    kontrol.kategori++
    if (JSON.stringify(bek) !== JSON.stringify(var_)) fark.kategori.push({ sku: u.sku, design: bek, uno: var_ })
  }
  const ozetSayi = Object.fromEntries(ALANLAR.map((k) => [k, { kontrol: kontrol[k], fark: fark[k].length }]))
  return { ozet: ozetSayi, fark, atlanan }
}

/**
 * Anlık görüntü tazeliği: dosya yaşı (gün) eşiği aşarsa liste döner. Eski görüntüyle "fark 0" yanıltıcıdır.
 * @param {{ ad: string, yasGun: number }[]} dosyalar
 * @param {number} esikGun
 */
export function eskiGoruntuler(dosyalar, esikGun) {
  return dosyalar.filter((d) => !(d.yasGun <= esikGun)).map((d) => `${d.ad} (${Number.isFinite(d.yasGun) ? Math.floor(d.yasGun) + ' gün' : 'yaş bilinmiyor'})`)
}

/**
 * Design-İÇERİK `seri-veri-dizin` ↔ UnoPIM SKU eşlemesi (KTL-87). İÇERİK her modele UnoPIM koduyla `sku` verir
 * (`seriler[<seri>].sku = { <katalog kodu>: <UnoPIM kodu> }`); eşleme bu alanla yapılır, `modeller`/`D` anahtarıyla değil.
 * Saf: ağ yok, dosya yok. Anahtarı `_` ile başlayan üst düzey alanlar (`_damga`) seri değildir.
 * @returns {{seri:number, model:number, tekil:number, cift:Array<{sku:string, seriler:string[]}>, unopimdeYok:string[], icerikteYok:string[]}}
 */
export function icerikSkuFarki(dizin, unopimSkular) {
  const bySku = new Map()
  let seri = 0
  let model = 0
  for (const [ad, v] of Object.entries(dizin || {})) {
    if (ad.startsWith('_') || !v || typeof v !== 'object') continue
    seri++
    for (const sku of Object.values(v.sku || {})) { model++; bySku.set(sku, [...(bySku.get(sku) || []), ad]) }
  }
  const u = new Set(unopimSkular)
  return {
    seri, model, tekil: bySku.size,
    cift: [...bySku].filter(([, a]) => a.length > 1).map(([sku, seriler]) => ({ sku, seriler })),
    unopimdeYok: [...bySku.keys()].filter((s) => !u.has(s)).sort(),
    icerikteYok: [...u].filter((s) => !bySku.has(s)).sort(),
  }
}
