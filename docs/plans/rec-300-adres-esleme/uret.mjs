/* eslint-disable no-console -- komut satırı üreticisi, çıktısı sayım ve rapordur */
// URN-157: eski site -> yeni site (Design) adres eşleştirme TABLOSU üreticisi. YALNIZ tablo üretir;
// yönlendirme yazmaz, canlıya hiçbir kural girmez (Recep kararı, 10 Kasım: tablo tamamlanmadan yönlendirme yok).
//
// Kullanım:  node docs/plans/rec-300-adres-esleme/uret.mjs --adres <Design adres.json> [--ek <ek eski adres listesi>] [--yaz]
//   --yaz      eski-yeni.csv ve eslesmeyen.txt dosyalarını bu klasöre yazar (yoksa yalnız sayım basar)
//   --ek       her satırı bir eski adres olan metin dosyası (ör. GEO-SEO dondurulmuş dizin listesi); tabloya `dizin-listesi` kaynağıyla girer
// Girdiler: canli-anlik.mjs (canlı DB anlık görüntüsü), canli-site-haritasi-*.txt, src/data/eski-adres-tohum.json, Design adres.json.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { AILE_SKU, BEKLENEN_AKTIF_URUN,KATEGORI, TAKMA_AILE, TAKMA_KATEGORI, TAKMA_URUN } from './canli-anlik.mjs'

const KLASOR = dirname(fileURLToPath(import.meta.url))
const arg = (ad) => {
  const i = process.argv.indexOf(ad)
  return i >= 0 ? process.argv[i + 1] : null
}
const adresYolu = arg('--adres')
if (!adresYolu) throw new Error('--adres <Design adres.json yolu> zorunlu')
const ekYolu = arg('--ek')
const YAZ = process.argv.includes('--yaz')
const L = ['tr', 'en']

const adresMetni = readFileSync(adresYolu, 'utf8')
const A = JSON.parse(adresMetni)
const tohum = JSON.parse(readFileSync(join(KLASOR, '../../../src/data/eski-adres-tohum.json'), 'utf8'))
const siteHaritasi = readFileSync(join(KLASOR, 'canli-site-haritasi-2026-11-10.txt'), 'utf8').split('\n').filter(Boolean)

// ── Canlı anlık görüntü sayımı (sessiz yarım okumaya karşı) ───────────────────────────────
const tumSku = Object.values(AILE_SKU).flat()
if (tumSku.length !== BEKLENEN_AKTIF_URUN || new Set(tumSku).size !== tumSku.length) throw new Error('canli-anlik: aktif ürün sayımı tutmuyor')
if (Object.keys(AILE_SKU).length !== 47) throw new Error('canli-anlik: aile sayısı 47 değil')
if (KATEGORI.length !== 36) throw new Error('canli-anlik: kategori sayısı 36 değil')
const skuAile = new Map()
for (const [aile, skular] of Object.entries(AILE_SKU)) for (const s of skular) skuAile.set(s, aile)

// ── Design adres evreni (yeni adres kaynağı) ─────────────────────────────────────────────────
const designAdresleri = new Set()
const topla = (o) => {
  if (typeof o === 'string') {
    if (o.startsWith('/')) designAdresleri.add(o.split('#')[0].split('?')[0])
  } else if (o && typeof o === 'object') for (const v of Object.values(o)) topla(v)
}
for (const k of ['kategori', 'aileSayfa', 'aile', 'model', 'uygulama', 'kok', 'marka', 'rehber', 'sabit']) topla(A[k])

const kok = (l) => A.kok.urunler[l]
const sabit = (anahtar, l) => A.sabit[anahtar][l]

// ── Kategori eşlemesi: canlı kanonik (EN) slug -> Design anahtarı | KOK | 410 ───────────────────
const KOK = Symbol('kok')
const KAT = {
  accessories: 'kontrol',
  'air-curtains': 'perde',
  'air-treatment': KOK,
  'axial-industrial-fans': 'axial-industrial-fans',
  'bathroom-toilet-fans': 'bathroom-toilet-fans',
  'cabinet-fans': 'cabinet-fans',
  'centrifugal-fans': 'centrifugal-fans',
  'chimney-fans': 'chimney-fans',
  'commercial-ventilation': 'ticari-fan',
  'control-systems': 'kontrol',
  'corrosion-and-acid-resistant-fans': 'acid-resistant-fans',
  dehumidifiers: 'dehumidifiers',
  'duct-fans': 'duct-fans',
  'ducted-central-hrv': 'ducted-central-hrv',
  'electric-duct-heaters': 'electric-duct-heaters',
  'electric-heated-air-curtains': 'electric-heated-air-curtains',
  'ex-proof-atex-fans': 'atex-fans',
  fans: KOK,
  'frequency-converters': 'frequency-converters',
  'heat-recovery-vmc': 'igk',
  'industrial-ceiling-fans': 'industrial-ceiling-fans',
  'inline-duct-fans': 'duct-fans',
  'jet-fans': 410,
  'mechanical-accessories': 'mekanik-aksesuar',
  'parking-jet-fan': 410,
  'plug-fans': 'plug-fans',
  'rectangular-duct-fans': 'duct-fans',
  'residential-ventilation': 'konut',
  'roof-fans': 'roof-fans',
  'shelter-ventilation': 'siginak',
  'single-room-hrv': 'single-room-hrv',
  'smoke-exhaust-fans': 'smoke-exhaust-fans',
  'spare-parts-sensors': 'spare-parts-sensors',
  'speed-controllers': 'speed-controllers',
  'unheated-air-curtains': 'unheated-air-curtains',
  'water-coil-duct-heaters': 'water-coil-duct-heaters',
}
const KAT_NOT = {
  fans: 'Kök kategori; Design\'da tek karşılığı yok (konut ve ticari fanlar ayrı gruplarda). Hedef ürünler kökü, yol haritası kararı (URN-157)',
  'air-treatment': 'Kök kategori; Design\'da tek karşılığı yok (kanal ısıtıcıları ve nem alma ayrı). Hedef ürünler kökü, yol haritası kararı (URN-157)',
  accessories: 'Eski aksesuarlar ve elektrik aksesuarları Design\'da tek grupta birleşiyor (kontrol-ve-aksesuarlar)',
  'control-systems': 'Eski elektrik aksesuarları Design\'da kontrol-ve-aksesuarlar grubuna birleşiyor',
  'shelter-ventilation': 'Sığınak: Design mekân yerine ürün grubuna bağlıyor (Recep 11-02)',
  'inline-duct-fans': 'Pasif kategori (dizinde değil); en yakın tür kanal tipi fanlar',
  'rectangular-duct-fans': 'Pasif kategori (dizinde değil); en yakın tür kanal tipi fanlar',
  'commercial-ventilation': 'Pasif kategori (dizinde değil); en yakın grup ticari ve endüstriyel fanlar',
  'residential-ventilation': 'Pasif kategori (dizinde değil); en yakın grup konut havalandırma ürünleri',
  'ex-proof-atex-fans': 'Pasif kategori (dizinde değil); Design ATEX fanları türü',
  'jet-fans': 'Pasif kategori, Design\'da karşılığı yok; aktif ürünü 0',
  'parking-jet-fan': 'Pasif kategori, Design\'da karşılığı yok; aktif ürünü 0',
}
const katIndeks = { tr: new Map(), en: new Map() }
for (const [en, tr, enSlug] of KATEGORI.map((k) => [k[0], k[1], k[2]])) {
  katIndeks.tr.set(tr, en)
  katIndeks.en.set(enSlug, en)
}
for (const [dil, eski, hedef] of TAKMA_KATEGORI) katIndeks[dil].set(eski, hedef)
for (const t of tohum.kategoriler) {
  if (t.hedef === null) katIndeks[t.bicim].set(t.eski, null) // hedefsiz tohum: tüm ürünler
  else katIndeks[t.bicim].set(t.eski, t.hedef)
}

function katYeni(canliEn, l) {
  if (canliEn === null) return { yeni: kok(l), kod: 308, not: 'Hedefsiz eski kategori adı (bugün 404); karşılığı olan grup yok, ürünler kökü' }
  const k = KAT[canliEn]
  if (k === undefined) throw new Error(`KAT eksik: ${canliEn}`)
  if (k === 410) return { yeni: '', kod: 410, not: KAT_NOT[canliEn] }
  const yeni = k === KOK ? kok(l) : A.kategori[k][l]
  if (!yeni) throw new Error(`Design kategori yok: ${canliEn} -> ${String(k)}`)
  return { yeni, kod: 308, not: KAT_NOT[canliEn] ?? '' }
}

// ── Aile eşlemesi: canlı aile -> Design seri (modellerinin Design serisine oyu) ─────────────────────
const aileOy = new Map()
for (const [aile, skular] of Object.entries(AILE_SKU)) {
  const oy = {}
  for (const s of skular) {
    const m = A.model[s]
    if (!m) throw new Error(`Design'da model yok: ${s}`)
    oy[m.aile] = (oy[m.aile] ?? 0) + 1
  }
  aileOy.set(aile, oy)
}
function aileYeni(canliAile, l) {
  const oy = aileOy.get(canliAile)
  const anahtarlar = Object.keys(oy)
  if (anahtarlar.length === 1) {
    const d = A.aile[anahtarlar[0]]
    if (!d) throw new Error(`Design aile yok: ${anahtarlar[0]}`)
    return { yeni: d[l], kod: 308, not: '' }
  }
  if (anahtarlar.length === 0) {
    return { yeni: '', kod: 410, not: 'Aktif modeli 0; bugün canlıda 404 (ölü yönlendirme); Design\'da karşılığı yok' }
  }
  // Birden çok Design serisine bölünen aile: tek hedef yok -> tür sayfası
  const k = canliAile === 'vortice-aksiyel-endustriyel-fanlar' ? 'axial-industrial-fans' : null
  if (!k) throw new Error(`bölünen aile için hedef tanımsız: ${canliAile}`)
  return { yeni: A.kategori[k][l], kod: 308, not: `Aile Design'da ${anahtarlar.length} seriye bölündü (${anahtarlar.join(', ')}); tek seri hedefi yok, tür sayfasına gider` }
}
const aileIndeks = new Map()
for (const a of Object.keys(AILE_SKU)) aileIndeks.set(a, a)
for (const [eski, hedef] of Object.entries(TAKMA_AILE)) aileIndeks.set(eski, hedef)
for (const t of tohum.aileler) aileIndeks.set(t.eski, t.hedef)

// ── Model ve eski SKU ────────────────────────────────────────────────────────────────────────────────
function modelYeni(sku, l) {
  const m = A.model[sku]
  return m ? { yeni: m[l], kod: 308, not: '' } : null
}
const urunSlugSku = new Map()
for (const [eski, sku] of TAKMA_URUN) urunSlugSku.set(eski, sku)
for (const u of tohum.urunler) urunSlugSku.set(u.eski, u.hedefSku)

// ── Sabit sayfalar, rehber ──────────────────────────────────────────────────────────────────────────
const YASAL = {
  '/legal/cerez-politikasi': 'yasal-cerez',
  '/legal/gizlilik-politikasi': 'yasal-gizlilik',
  '/legal/kullanim-kosullari': 'yasal-kullanim',
  '/legal/kvkk': 'yasal-kvkk',
  '/legal/mesafeli-satis-sozlesmesi': 'yasal-mesafeli',
  '/legal/on-bilgilendirme-formu': 'yasal-onbilgi',
  '/destek/iade-degisim': 'yasal-iade',
  '/destek/garanti-servis': 'yasal-garanti',
  '/destek/teslimat-kargo': 'yasal-teslimat',
}
const rehberTr = new Map()
for (const [k, v] of Object.entries(A.rehber)) if (k !== '_liste' && v.tr) rehberTr.set(v.tr.split('/').pop(), v)
const rehberListe = (l) => A.rehber._liste[l]
const BEKLIYOR = '[bekliyor] '
const GECICI = '[gecici] '

function coz(ham) {
  const u = new URL(ham, 'https://x')
  const p = u.pathname.replace(/\/+$/, '') || '/'
  const m = p.match(/^\/(tr|en)(\/.*)?$/)
  if (!m) return { hata: 'dilsiz adres (rota dili kuralı ALTYAPI\'da; önce dilli adrese gider)' }
  const l = m[1]
  const rest = m[2] ?? ''
  const sku = u.searchParams.get('sku')
  let s
  if (rest === '') return { tur: 'sabit', yeni: `/${l}`, kod: 200, not: 'Ana sayfa değişmez' }
  if (rest === '/products' && !sku) return { tur: 'kok', yeni: kok(l), not: '' }
  if (rest === '/brands') return { tur: 'marka-liste', yeni: A.marka._liste[l], not: '' }
  if (rest === '/contact') return { tur: 'sabit', yeni: sabit('iletisim', l), not: '' }
  if (rest === '/about') return { tur: 'sabit', yeni: sabit('hakkimizda', l), not: '' }
  if (rest === '/urun-secici') return { tur: 'sabit', yeni: kok(l), not: GECICI + 'Ürün seçici Design\'da var (eksik listesi madde 9) ama ayrı adresi yok; adres verilince güncellenir' }
  if (rest === '/destek') return { tur: 'sabit', yeni: sabit('destek', l), not: '' }
  if (rest === '/destek/sss') return { tur: 'sabit', yeni: sabit('destek', l), not: 'Design\'da SSS destek sayfasında (#sss)' }
  if (YASAL[rest]) return { tur: 'sabit', yeni: sabit(YASAL[rest], l), not: rest.startsWith('/destek') ? 'Destek alt sayfası Design\'da yasal sayfaya karşılık geliyor (içerik eşlemesi)' : '' }
  if (rest === '/destek/hesaplayicilar' || rest.startsWith('/destek/hesaplayicilar/')) {
    return { tur: 'sabit', yeni: sabit('hesapla', l), not: GECICI + 'Hesaplayıcılar Design\'da tek hesapla sayfasında; araç alt adresi Design\'da yok' }
  }
  if (rest === '/account') return { tur: 'oturum', yeni: sabit('hesap', l), not: 'noindex yüzey' }
  if (['/cart', '/checkout', '/payment-success'].includes(rest)) {
    return { tur: 'oturum', yeni: '', kod: 'bekliyor', not: BEKLIYOR + 'Sepet ve ödeme ekranlarını Design çizer (6 Kasım yol haritası, karar 4-5); adres verilince doldurulur. Bugün noindex' }
  }
  if (rest === '/auth/login' || rest === '/auth/register') {
    return { tur: 'oturum', yeni: '', kod: 'bekliyor', not: BEKLIYOR + 'Giriş ve kayıt Design\'da ayrı adres olarak çizilmedi; noindex yüzey' }
  }
  // Rehber ve bilgi merkezi
  if (rest === '/bilgi-merkezi' || rest === '/knowledge-hub' || rest === '/destek/merkez' || rest === '/destek/konular') {
    return { tur: 'rehber', yeni: rehberListe(l), not: '' }
  }
  if ((s = rest.match(/^\/bilgi-merkezi\/([^/]+)$/)) && l === 'tr') {
    const d = rehberTr.get(s[1])
    if (d) return { tur: 'rehber', yeni: d.tr, not: '' }
    return { tur: 'rehber', yeni: rehberListe('tr'), not: GECICI + 'Yazı Design\'da henüz yok (BLOG); yazı Design\'a girince kendi adresine güncellenir' }
  }
  if ((s = rest.match(/^\/destek\/konular\/([^/]+)$/))) {
    const konu = s[1]
    if (l === 'tr') {
      const hedef = { 'hava-perdesi': 'hava-perdesi', 'air-curtain': 'hava-perdesi', 'jet-fan': 'otopark-jet-fan', hrv: 'isi-geri-kazanim' }[konu]
      if (!hedef) return { tur: 'rehber', yeni: rehberListe('tr'), not: 'Bilinmeyen konu, liste' }
      const d = rehberTr.get(hedef)
      return d ? { tur: 'rehber', yeni: d.tr, not: '' } : { tur: 'rehber', yeni: rehberListe('tr'), not: GECICI + 'Yazı Design\'da henüz yok (BLOG)' }
    }
    const enHedef = { 'hava-perdesi': 'air-curtains', 'air-curtain': 'air-curtains', hrv: 'heat-recovery-vmc' }[konu]
    if (enHedef) return { tur: 'rehber', ...katYeni(enHedef, 'en') }
    if (konu === 'jet-fan') return { tur: 'rehber', yeni: sabit('hesapla', 'en'), not: GECICI + 'EN kapalıyken jet fan hesaplayıcısına gidiyordu; Design\'da hesapla sayfası' }
    return { tur: 'rehber', yeni: rehberListe('en'), not: 'Bilinmeyen konu, liste' }
  }
  // Marka
  if ((s = rest.match(/^\/brands\/([^/]+)$/))) {
    if (s[1] === 'frekans-konvertoru') return { tur: 'marka', ...katYeni('frequency-converters', l), not: 'Marka değil ürün türü; bugün de frekans konvertörleri kategorisine yönleniyor' }
    const d = A.marka[s[1]]
    if (d && s[1] !== '_liste') return { tur: 'marka', yeni: d[l], not: '' }
    return { hata: `marka Design'da yok: ${s[1]}` }
  }
  // Kategori
  if ((s = rest.match(/^\/category\/([^/]+)(?:\/([^/]+))?$/))) {
    const slug = s[2] ?? s[1]
    // Eski eşleyici iki dilin slug'ını da kabul ediyordu: yoksa öteki dilin slug'ına bak
    const diger = l === 'tr' ? 'en' : 'tr'
    const kaynakDil = katIndeks[l].has(slug) ? l : katIndeks[diger].has(slug) ? diger : null
    if (!kaynakDil) return { hata: `kategori slug tanınmadı: ${slug}` }
    const canli = katIndeks[kaynakDil].get(slug)
    return { tur: s[2] ? 'kategori-dal' : 'kategori', ent: `kat:${canli}`, ...katYeni(canli, l) }
  }
  // Ürün: aile / model / eski ürün adı
  if ((s = rest.match(/^\/products\/([^/]+)$/))) {
    const slug = s[1]
    if (sku) {
      const sk = sku.toUpperCase()
      const ana = skuAile.has(sku) ? sku : skuAile.has(sk) ? sk : null
      if (!ana) {
        // Eski (öneksiz) SKU biçimi: Design `cevir` tablosu eski -> güncel SKU; hedef canlıda aktifse eski-sku satırı
        const via = A.cevir?.[sku]
        if (via && skuAile.has(via)) return { tur: 'eski-sku', ...modelYeni(via, l), not: 'Eski SKU biçimi (Design cevir tablosu); dizinde olduğu GEO-SEO listesiyle doğrulanır' }
        return { hata: `sku canlıda aktif değil: ${sku}` }
      }
      return { tur: 'model', ...modelYeni(ana, l) }
    }
    if (aileIndeks.has(slug)) {
      const g = aileYeni(aileIndeks.get(slug), l)
      return { tur: 'aile', ent: `aile:${aileIndeks.get(slug)}`, ...g, not: [g.not, slug !== aileIndeks.get(slug) ? 'Eski aile adı (url_takma_adlari / tohum)' : ''].filter(Boolean).join('; ') }
    }
    if (urunSlugSku.has(slug)) return { tur: 'model', ...modelYeni(urunSlugSku.get(slug), l), not: 'Eski ürün adı (url_takma_adlari / next.config)' }
    return { hata: `ürün/aile slug tanınmadı: ${slug}` }
  }
  return { hata: `kalıp tanınmadı: ${rest}` }
}

// ── Satır üretimi ───────────────────────────────────────────────────────────────────────────────────
const satirlar = new Map() // eski -> satır
const hatalar = []
function ekle(eskiHam, kaynak) {
  // `?sku=` dışındaki sorgu parametreleri (?brand=, ?dept=) adresi değiştirmez: taban yola indirilir (kapı: `?` yalnız model ve eski-sku)
  const eski = eskiHam.includes('?') && !new URL(eskiHam, 'https://x').searchParams.has('sku') ? eskiHam.split('?')[0] : eskiHam
  const r = coz(eski)
  if (r.hata) {
    hatalar.push({ eski, kaynak, neden: r.hata })
    return
  }
  // Eski adres yeni sitede aynı yolla yaşıyorsa (ör. EN aile adı = Design seri adresi) yönlendirme yoktur: kod 200
  const kod = r.yeni && r.yeni === eski && !eski.includes('?') ? 200 : (r.kod ?? (r.yeni === '' ? 410 : 308))
  const satir = { eski, yeni: r.yeni, kod, tur: r.tur, kaynak, not: r.not ?? '', ent: r.ent ?? `${r.tur}:${eski.replace(/^\/(tr|en)/, '')}` }
  const var_ = satirlar.get(eski)
  if (var_) {
    if (var_.yeni !== satir.yeni) throw new Error(`aynı eski adres iki hedefe: ${eski} -> ${var_.yeni} / ${satir.yeni}`)
    return
  }
  satirlar.set(eski, satir)
}

for (const yol of siteHaritasi) ekle(yol, 'site-haritasi')
// EN karşılıkları: sitemap'te yok ama canlıda 200 (EN_YAYIN kapalı, noindex)
for (const yol of siteHaritasi) {
  if (yol === '/tr' || yol.startsWith('/tr/bilgi-merkezi') || yol === '/tr/urun-secici') continue
  const en = yol.replace(/^\/tr/, '/en')
  if (yol.startsWith('/tr/category/')) {
    const slug = yol.split('/').pop()
    ekle(`/en/category/${KATEGORI.find((k) => k[1] === slug)[2]}`, 'canli-rota-en')
  } else ekle(en, 'canli-rota-en')
}
ekle('/en', 'canli-rota-en')
ekle('/en/urun-secici', 'canli-rota-en')
// Kategoriler (DB): kök/dal, dil başına kanonik slug; iki seviyeli dal adresi
for (const [, tr, enSlug, ust] of KATEGORI) {
  ekle(`/tr/category/${tr}`, 'canli-db')
  ekle(`/en/category/${enSlug}`, 'canli-db')
  if (ust) {
    const u = KATEGORI.find((k) => k[0] === ust)
    ekle(`/tr/category/${u[1]}/${tr}`, 'canli-rota-dal')
    ekle(`/en/category/${u[2]}/${enSlug}`, 'canli-rota-dal')
  }
}
for (const [dil, eski] of TAKMA_KATEGORI) ekle(`/${dil}/category/${eski}`, 'takma-ad')
for (const t of tohum.kategoriler) ekle(`/${t.bicim}/category/${t.eski}`, 'tohum')
// Aileler (DB), takma adlar, tohum
for (const aile of Object.keys(AILE_SKU)) for (const l of L) ekle(`/${l}/products/${aile}`, 'canli-db')
for (const eski of Object.keys(TAKMA_AILE)) for (const l of L) ekle(`/${l}/products/${eski}`, 'takma-ad')
for (const t of tohum.aileler) for (const l of L) ekle(`/${l}/products/${t.eski}`, 'tohum')
// Modeller: canlıda model sayfası yok, model aile sayfasında ?sku=
for (const [aile, skular] of Object.entries(AILE_SKU)) for (const sku of skular) for (const l of L) ekle(`/${l}/products/${aile}?sku=${sku}`, 'canli-db')
for (const eski of urunSlugSku.keys()) for (const l of L) ekle(`/${l}/products/${eski}`, 'takma-ad')
// Markalar
for (const m of ['vortice', 'avens', 'casals', 'seat', 'danfoss', 'nicotra-gebhardt', 'flexiva', 'frekans-konvertoru']) for (const l of L) ekle(`/${l}/brands/${m}`, 'canli-rota')
// Rehber ve destek eski adresleri (next.config / bilgiMerkeziYonlendirmeleri)
for (const l of L) {
  ekle(`/${l}/destek/merkez`, 'next.config')
  ekle(`/${l}/destek/konular`, 'next.config')
  for (const konu of ['hava-perdesi', 'air-curtain', 'jet-fan', 'hrv']) ekle(`/${l}/destek/konular/${konu}`, 'next.config')
  ekle(`/${l}/destek/hesaplayicilar`, 'next.config')
  for (const arac of ['hava-perdesi', 'hrv', 'jet-fan', 'kanal']) ekle(`/${l}/destek/hesaplayicilar/${arac}`, 'canli-rota')
  for (const y of ['/destek', '/destek/sss', ...Object.keys(YASAL)]) ekle(`/${l}${y}`, 'canli-rota')
  ekle(`/${l}/account`, 'canli-rota')
  for (const y of ['/cart', '/checkout', '/payment-success', '/auth/login', '/auth/register']) ekle(`/${l}${y}`, 'canli-rota')
}
ekle('/tr/bilgi-merkezi/otopark-jet-fan', 'next.config')
ekle('/tr/bilgi-merkezi/isi-geri-kazanim', 'next.config')
// Design'ın kendi yönlendirme çiftleri (yonlenSabit): eski taraf eski sitede hiç var olmamış olabilir; yeni siteye hazır
for (const [eski, hedef] of A.yonlenSabit) {
  const r = satirlar.get(eski)
  if (!r) satirlar.set(eski, { eski, yeni: hedef.split('#')[0], kod: 308, tur: 'sabit', kaynak: 'design-yonlenSabit', not: hedef.includes('#') ? `Design hedefi ${hedef}` : '' })
}
// Ek liste (GEO-SEO dondurulmuş dizin listesi)
if (ekYolu) {
  for (const satir of readFileSync(ekYolu, 'utf8').split('\n').map((x) => x.trim()).filter(Boolean)) {
    let yol = satir
    try {
      const u = new URL(satir)
      yol = u.pathname + u.search
    } catch {
      /* göreli yol */
    }
    ekle(yol, 'dizin-listesi')
  }
}

// ── Doğrulama ve çıktı ─────────────────────────────────────────────────────────────────────────────
const tum = [...satirlar.values()]
const yeniDesignDisi = tum.filter((s) => s.yeni && s.kod !== 200 && !designAdresleri.has(s.yeni) && !['/tr', '/en'].includes(s.yeni))
if (yeniDesignDisi.length) {
  console.error('HATA: Design evreninde olmayan yeni adres:', yeniDesignDisi.slice(0, 10))
  process.exitCode = 1
}
const zincir = tum.filter((s) => s.yeni && satirlar.has(s.yeni) && satirlar.get(s.yeni).kod !== 200 && satirlar.get(s.yeni).yeni !== s.yeni)
if (zincir.length) {
  console.error('HATA: yeni adres başka bir eski adresin kaynağı (zincir):', zincir.slice(0, 10))
  process.exitCode = 1
}
const say = (f) => tum.reduce((a, s) => ((a[f(s)] = (a[f(s)] ?? 0) + 1), a), {})
const sirala = (a, b) => (a.tur === b.tur ? (a.eski < b.eski ? -1 : 1) : a.tur < b.tur ? -1 : 1)
tum.sort(sirala)
const cakisma = new Map()
for (const s of tum) if (s.yeni && s.kod === 308 && s.tur !== 'model' && s.eski.startsWith('/tr')) cakisma.set(s.yeni, [...(cakisma.get(s.yeni) ?? []), s])
const cakismalar = [...cakisma.entries()].filter(([, v]) => new Set(v.map((x) => x.ent)).size > 1)

console.log('Design adres.json sha256:', createHash('sha256').update(adresMetni).digest('hex'))
console.log('satır:', tum.length, '| tür:', JSON.stringify(say((s) => s.tur)))
console.log('kod:', JSON.stringify(say((s) => s.kod)), '| kaynak:', JSON.stringify(say((s) => s.kaynak)))
console.log('[gecici]:', tum.filter((s) => s.not.startsWith(GECICI)).length, '| [bekliyor]:', tum.filter((s) => s.not.startsWith(BEKLIYOR)).length)
console.log('eşleşmeyen (kalıp/sku/slug tanınmadı):', hatalar.length)
for (const h of hatalar.slice(0, 40)) console.log('  ', h.kaynak, h.eski, '-', h.neden)
const siteKapsam = siteHaritasi.filter((y) => satirlar.has(y)).length
console.log(`site haritası kapsamı: ${siteKapsam}/${siteHaritasi.length}`)
console.log('çakışan hedefler (aynı yeni adrese giden farklı eski kalıp):', cakismalar.length)
for (const [y, v] of cakismalar) console.log('  ', y, '<-', [...new Set(v.map((x) => x.ent))].join(' , '))
for (const s of tum.filter((x) => x.kod === 410)) console.log('410', s.eski, '-', s.not)
for (const s of tum.filter((x) => x.not.startsWith(GECICI) && x.eski.startsWith('/tr'))) console.log('gecici', s.eski, '->', s.yeni)
for (const s of tum.filter((x) => x.kod === 'bekliyor' && x.eski.startsWith('/tr'))) console.log('bekliyor', s.eski)

// ALTYAPI kapısının (ALT-177) şeması: tur = kategori|aile|model|marka|rehber|sabit|takma-ad|eski-sku;
// kaynak = site-haritasi|canli-db|takma-ad|dizin-listesi; kod = 308|410; eski=yeni, zincir ve '?' (model dışında) yok.
const KAYNAK_CIKIS = { 'site-haritasi': 'site-haritasi', 'canli-db': 'canli-db', 'canli-rota': 'canli-db', 'canli-rota-en': 'canli-db', 'canli-rota-dal': 'canli-db', 'takma-ad': 'takma-ad', tohum: 'takma-ad', 'next.config': 'takma-ad', 'design-yonlenSabit': 'takma-ad', 'dizin-listesi': 'dizin-listesi' }
const TUR_CIKIS = { kok: 'sabit', 'marka-liste': 'marka', 'kategori-dal': 'kategori', oturum: 'sabit' }
const cikis = (s) => {
  const kaynak = KAYNAK_CIKIS[s.kaynak]
  if (!kaynak) throw new Error(`kaynak eşlemesi yok: ${s.kaynak}`)
  const tur = kaynak === 'takma-ad' && ['aile', 'kategori', 'model'].includes(s.tur) ? 'takma-ad' : (TUR_CIKIS[s.tur] ?? s.tur)
  return { ...s, tur, kaynak }
}
const csvSatirlari = tum.filter((s) => s.kod === 308 || s.kod === 410).map(cikis)
const degismeyen = tum.filter((s) => s.kod === 200)
const bekleyen = tum.filter((s) => s.kod === 'bekliyor')
console.log(`CSV satırı: ${csvSatirlari.length} | değişmeyen (eski=yeni): ${degismeyen.length} | bekleyen: ${bekleyen.length} | eşleşmeyen: ${hatalar.length}`)
for (const s of csvSatirlari) if (s.yeni.includes('?') || s.yeni.includes('#')) console.error('UYARI: yeni adreste ?/# var', s.eski, s.yeni)

if (YAZ) {
  const kacis = (x) => (/[;"\n]/.test(x) ? `"${x.replaceAll('"', '""')}"` : x)
  const csv = ['eski;yeni;kod;tur;kaynak;not', ...csvSatirlari.map((s) => [s.eski, s.yeni, s.kod, s.tur, s.kaynak, s.not].map(kacis).join(';'))].join('\n') + '\n'
  writeFileSync(join(KLASOR, 'eski-yeni.csv'), csv)
  const eslesmeyen = [
    ...hatalar.map((h) => `${h.eski}\t${h.kaynak}\t${h.neden}`),
    ...bekleyen.map((s) => `${s.eski}\t${s.kaynak}\t${s.not}`),
  ].join('\n')
  writeFileSync(join(KLASOR, 'eslesmeyen.txt'), eslesmeyen ? eslesmeyen + '\n' : '')
  writeFileSync(join(KLASOR, 'degismeyen.txt'), degismeyen.map((s) => s.eski).join('\n') + '\n')
  writeFileSync(join(KLASOR, 'yeni-site-adresleri.txt'), [...new Set([...designAdresleri, '/tr', '/en'])].sort().join('\n') + '\n')
  console.log('yazıldı: eski-yeni.csv, eslesmeyen.txt, degismeyen.txt, yeni-site-adresleri.txt')
}
