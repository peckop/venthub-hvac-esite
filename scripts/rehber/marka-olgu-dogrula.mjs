/**
 * MARKA OLGU DOĞRULAMA — marka/üretici olgusu YALNIZ resmî kaynaktan, HAM metinden, birebir alıntıyla
 * yazılır (BLG-7; docs/standards/vitrin-genel-metin-standard.md M8; rehber-yazisi-standard.md R2.3).
 *
 * NİÇİN: 2026-10-09'da vitrin metinleri incelenirken marka kayıtlarında (`src/data/brands.ts`) kaynak
 * satırı olmayan olgular bulundu: AVenS için başka bir şirketin sitesi ve 2010 kuruluş yılı (resmî sitede
 * 2017), Nicotra Gebhardt için 1959 (resmî sitede yok; Gebhardt 1958), Vortice için "kuruluş 1954" (resmî
 * metin "1954'ten beri" ve "1954-1955 Başlangıçlar" diyor, "kuruldu" demiyor). Bir araştırma ajanının özeti
 * kanıt değildir (R2.3): kanıt, betiğin çektiği ham metindeki birebir alıntıdır.
 *
 * KAYIT: docs/standards/marka-olgu-kaydi.json. Her olgu = (marka, alan) için TEK karar satırı:
 *   DOGRULANDI     en az iki BAĞIMSIZ yayında (farklı `yayin`) birebir alıntı bulundu, biri doğrudan
 *   TEK_KAYNAK     tek yayında birebir alıntı bulundu
 *   DOGRULANAMADI  alıntı yok ya da kaynaklar çelişiyor → brands.ts'e ve vitrin metnine YAZILAMAZ
 * "Bağımsız" = farklı yayın: marka sitesi ≠ üreticinin kendi kataloğu (PDF) ≠ firma fiyat listesi. Aynı
 * sitenin iki sayfası tek yayındır. Şehirden ülke çıkarımı `dogrudan:false` işaretlenir ve tek başına
 * olguyu doğrulamaz.
 *
 * Kullanım:
 *   node scripts/rehber/marka-olgu-dogrula.mjs kontrol                              (ağsız; CI'daki test de aynısını yapar)
 *   node scripts/rehber/marka-olgu-dogrula.mjs cek --ham <dizin>                      ⚠AĞA ÇIKAR: kayıttaki web adreslerini ham çeker
 *   node scripts/rehber/marka-olgu-dogrula.mjs dogrula --ham <dizin> --dizin <sayfalar.jsonl> [--yaz]
 *        --yaz: bulunan alıntıların bulundu/sha256/cekim alanlarını kayda yazar (deterministik anahtar sırası)
 * Çıkış: her kaynak alıntısı bulunduysa ve kayıt tutarlıysa 0; aksi hâlde 1.
 * ⚠CI kapısı yalnız `kontrol` mantığını (saf işlevler) çalıştırır; ağ ve kaynak dizini testlerde yoktur.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { htmlMetin, alintiBul, sha256, yolDegisti } from './alinti-dogrula.mjs'

// ─── sabitler ──────────────────────────────────────────────────────────────────
export const DURUMLAR = ['DOGRULANDI', 'TEK_KAYNAK', 'DOGRULANAMADI']
/** brands.ts ya da vitrin metnine yazılabilen durumlar. */
export const YAZILABILIR = ['DOGRULANDI', 'TEK_KAYNAK']
export const YAYINLAR = ['marka-sitesi', 'uretici-katalogu', 'firma-yayini', 'ic-karar']
export const KAYIT_YOLU = 'docs/standards/marka-olgu-kaydi.json'
export const TARIH = /^\d{4}-\d{2}-\d{2}$/
const SHA = /^[0-9a-f]{64}$/

// ─── saf işlevler (testlenir) ──────────────────────────────────────────────────
const ISIMLI_VARLIK = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  uuml: 'ü', Uuml: 'Ü', ouml: 'ö', Ouml: 'Ö', ccedil: 'ç', Ccedil: 'Ç', iacute: 'í', Iacute: 'Í',
  eacute: 'é', Eacute: 'É', egrave: 'è', agrave: 'à', aacute: 'á', oacute: 'ó', Oacute: 'Ó', uacute: 'ú',
  ntilde: 'ñ', Ntilde: 'Ñ', acirc: 'â', ecirc: 'ê', ocirc: 'ô', ucirc: 'û', icirc: 'î', auml: 'ä', Auml: 'Ä',
  szlig: 'ß', rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', ndash: '–', mdash: '—', hellip: '…', reg: '®', copy: '©',
}

/** HTML varlıklarını çöz (`&uuml;` → ü, `&#305;` → ı). htmlMetin yalnız beş varlığı çözüyordu; ham sitelerde Türkçe harfler `&uuml;` geliyordu. */
export function varlikCoz(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([A-Za-z]+);/g, (m, ad) => ISIMLI_VARLIK[ad] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}

/** Ham HTML → karşılaştırma ve sha256 için tek metin biçimi. */
export const webMetni = (html) => varlikCoz(htmlMetin(html))

/** Kaynak dizini sayfası → düz metin (alinti-dogrula.mjs ile aynı birleştirme). */
export function dizinSayfaMetni(sayfa) {
  return [sayfa.metin || '', ...(sayfa.tablo || []).flatMap((t) => (t.satirlar || []).map((s) => s.join(' ')))].join(' ')
}

/**
 * Kayıttaki kaynaklardan durum hesapla. Yalnız `bulundu === true` kaynaklar sayılır; `yayin` değeri
 * bağımsızlık ölçüsüdür. En az bir doğrudan kaynak şart: yalnız çıkarımla olgu doğrulanmış sayılmaz.
 */
export function durumHesapla(kaynaklar) {
  const dogrudan = (kaynaklar || []).filter((k) => k.bulundu === true && k.dogrudan !== false)
  if (dogrudan.length === 0) return 'DOGRULANAMADI'
  return new Set(dogrudan.map((k) => k.yayin)).size >= 2 ? 'DOGRULANDI' : 'TEK_KAYNAK'
}

/** Kaydı şema ve tutarlılık için denetle; hata dizeleri döner (boşsa temiz). */
export function kayitDenetle(kayit) {
  const h = []
  if (!kayit || typeof kayit !== 'object') return ['kayıt nesne değil']
  if (kayit.surum !== 1) h.push('surum 1 olmalı')
  if (!TARIH.test(kayit.sonDogrulama || '')) h.push('sonDogrulama YYYY-AA-GG olmalı')
  if (!kayit.markalar || typeof kayit.markalar !== 'object') return [...h, 'markalar yok']
  const idler = new Set()
  for (const [slug, m] of Object.entries(kayit.markalar)) {
    if (!m.ad) h.push(`${slug}: ad yok`)
    if (!Array.isArray(m.olgular) || m.olgular.length === 0) h.push(`${slug}: olgular boş`)
    for (const o of m.olgular || []) {
      const k = `${slug}/${o.alan}`
      if (!o.alan) h.push(`${slug}: alan yok`)
      if (idler.has(k)) h.push(`${k}: aynı (marka, alan) iki kez`)
      idler.add(k)
      if (!DURUMLAR.includes(o.durum)) h.push(`${k}: durum geçersiz (${o.durum})`)
      if (YAZILABILIR.includes(o.durum) && (o.deger === undefined || o.deger === null || o.deger === '')) h.push(`${k}: ${o.durum} ama deger yok`)
      if (YAZILABILIR.includes(o.durum) && ['country', 'headquarters'].includes(o.alan) && !o.degerEn) h.push(`${k}: ${o.durum} ama degerEn yok (iki dil zorunlu)`)
      if (o.durum === 'DOGRULANAMADI' && !o.neden) h.push(`${k}: DOGRULANAMADI ama neden yazılmamış`)
      const hesap = durumHesapla(o.kaynaklar)
      if (YAZILABILIR.includes(o.durum) && hesap !== o.durum) h.push(`${k}: kayıtta ${o.durum} ama kaynaklardan hesaplanan ${hesap}`)
      if (o.durum === 'DOGRULANAMADI' && hesap !== 'DOGRULANAMADI') h.push(`${k}: DOGRULANAMADI ama kaynaklar ${hesap} diyor; durumu düzelt ya da çelişkiyi 'neden'e yaz ve kaynağı celiski:true işaretle`)
      for (const [i, s] of (o.kaynaklar || []).entries()) {
        const ad = `${k} kaynak#${i + 1}`
        if (!YAYINLAR.includes(s.yayin)) h.push(`${ad}: yayin geçersiz (${s.yayin})`)
        if (!s.alinti || s.alinti.length < 8) h.push(`${ad}: alinti yok/çok kısa`)
        if (s.yayin === 'ic-karar') {
          if (!s.karar) h.push(`${ad}: ic-karar için karar numarası şart`)
          continue
        }
        if (s.tur === 'web') {
          if (!/^https:\/\//.test(s.url || '')) h.push(`${ad}: web kaynağı https url ister`)
        } else if (s.tur === 'dizin') {
          if (!/^[0-9a-f]{16,}$/.test(s.pdf_hash || '') || !Number.isInteger(s.sayfa)) h.push(`${ad}: dizin kaynağı pdf_hash+sayfa ister`)
        } else h.push(`${ad}: tur web ya da dizin olmalı`)
        if (s.bulundu === true) {
          if (!SHA.test(s.sha256 || '')) h.push(`${ad}: bulundu ama sha256 yok`)
          if (!TARIH.test(s.cekim || '')) h.push(`${ad}: bulundu ama cekim tarihi yok`)
        }
      }
    }
  }
  return h
}

/** Kayıttan marka+alan için olgu. */
export function olguBul(kayit, slug, alan) {
  return kayit.markalar?.[slug]?.olgular?.find((o) => o.alan === alan) ?? null
}

/** Marka için vitrin metninde geçebilecek sayılar (yıl ve yüzde): yalnız yazılabilir olguların `sayilar` listesi. */
export function izinliSayilar(kayit, slug) {
  const s = new Set()
  for (const o of kayit.markalar?.[slug]?.olgular ?? []) {
    if (!YAZILABILIR.includes(o.durum)) continue
    for (const n of o.sayilar ?? []) s.add(String(n))
  }
  return s
}

/** Metindeki yıl (19xx/20xx) ve yüzde sayıları. */
export function metindekiSayilar(metin) {
  const sonuc = new Set()
  for (const m of metin.matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)) sonuc.add(m[1])
  for (const m of metin.matchAll(/(?:%\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*%)/g)) sonuc.add(`%${m[1] ?? m[2]}`)
  return sonuc
}

const kes = (u) => String(u ?? '').replace(/\/+$/, '').toLowerCase()

/**
 * brands.ts (HVAC_BRANDS) × kayıt çapraz denetimi. Her ihlal {anahtar, ayrinti}; `anahtar` = "<slug>.<alan>".
 *  · brands.ts'te yazılı country / founded / headquarters / website, kayıtta YAZILABİLİR bir olguyla birebir uyuşmalı
 *  · description'daki yıl ve yüzde sayıları kayıttaki yazılabilir olguların `sayilar` listesinde olmalı
 *  · description üstünlük/övgü kalıbı taşımamalı (M5; ortak liste `ovguVarMi` dışarıdan verilir — TS dosyası)
 * brands.ts'te OLMAYAN alan denetlenmez: yazılmayan olgu yalan olamaz (DOGRULANAMADI olguların çıkış yolu).
 */
export function markaDenetle(markalar, kayit, { ovguVarMi }) {
  const ihlal = []
  const ekle = (anahtar, ayrinti) => ihlal.push({ anahtar, ayrinti })
  for (const b of markalar) {
    if (!kayit.markalar?.[b.slug]) { ekle(b.slug, 'marka kayıtta yok'); continue }
    const olgu = (alan) => {
      const o = olguBul(kayit, b.slug, alan)
      const ad = `${b.slug}.${alan}`
      if (!o) { ekle(ad, 'kayıtta olgu yok'); return null }
      if (!YAZILABILIR.includes(o.durum)) { ekle(ad, `yazılamaz (${o.durum}): ${o.neden ?? ''}`); return null }
      return o
    }
    for (const alan of ['country', 'headquarters']) {
      if (!b[alan]) continue
      const o = olgu(alan)
      if (o && (b[alan].tr?.trim() !== o.deger || b[alan].en?.trim() !== o.degerEn)) ekle(`${b.slug}.${alan}`, `brands.ts "${b[alan].tr}" / "${b[alan].en}" ≠ kayıt "${o.deger}" / "${o.degerEn}"`)
    }
    if (b.founded !== undefined) {
      const o = olgu('founded')
      if (o && String(b.founded) !== String(o.deger)) ekle(`${b.slug}.founded`, `brands.ts ${b.founded} ≠ kayıt ${o.deger}`)
    }
    if (b.website) {
      const o = olgu('website')
      if (o && ![o.deger, ...(o.esdegerler ?? [])].some((d) => kes(d) === kes(b.website))) ekle(`${b.slug}.website`, `brands.ts ${b.website} ≠ kayıt ${o.deger}`)
    }
    const izinli = izinliSayilar(kayit, b.slug)
    for (const dil of ['tr', 'en']) {
      const metin = b.description?.[dil] ?? ''
      for (const s of metindekiSayilar(metin)) if (!izinli.has(s)) ekle(`${b.slug}.description`, `${dil}: "${s}" kayıtta yazılabilir bir olgunun sayısı değil`)
      if (ovguVarMi(metin)) ekle(`${b.slug}.description`, `${dil}: üstünlük/övgü kalıbı (M5)`)
    }
  }
  return ihlal
}

// ─── ağ ve dizin (yalnız CLI) ──────────────────────────────────────────────────
async function hamGetir(url, azami = 6) {
  const zincir = []
  let u = url
  for (let i = 0; i < azami; i++) {
    const r = await fetch(u, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (compatible; VentHubRehberDogrulama/1.0)', 'accept-language': 'en-US,en;q=0.9,tr;q=0.8' } })
    zincir.push(`${r.status} ${u}`)
    const konum = r.headers.get('location')
    if (r.status >= 300 && r.status < 400 && konum) { u = new URL(konum, u).href; continue }
    return { durum: r.status, sonAdres: u, zincir, govde: await r.text() }
  }
  return { durum: 'COK-YONLENDIRME', sonAdres: u, zincir, govde: '' }
}

const dosyaAdi = (url) => `${sha256(url).slice(0, 12)}.txt`

export function webAdresleri(kayit) {
  const adres = new Set()
  for (const m of Object.values(kayit.markalar)) for (const o of m.olgular) for (const k of o.kaynaklar || []) if (k.tur === 'web') adres.add(k.url)
  return [...adres].sort()
}

async function cek(kayit, ham) {
  mkdirSync(ham, { recursive: true })
  const indeks = {}
  for (const url of webAdresleri(kayit)) {
    try {
      const g = await hamGetir(url)
      const metin = webMetni(g.govde)
      writeFileSync(join(ham, dosyaAdi(url)), `URL: ${url}\nSON: ${g.sonAdres}\nDURUM: ${g.durum}\nSHA256: ${sha256(metin)}\n\n${metin}\n`)
      indeks[url] = { durum: g.durum, sonAdres: g.sonAdres, yonlendi: yolDegisti(url, g.sonAdres), zincir: g.zincir, uzunluk: metin.length, sha256: sha256(metin), cekim: new Date().toISOString() }
      console.log(`${g.durum} ${indeks[url].yonlendi ? `(YOL DEĞİŞTİ→ ${g.sonAdres}) ` : ''}${url} [${metin.length} krk]`)
    } catch (e) {
      indeks[url] = { durum: `HATA ${e.cause?.code || e.message}` }
      console.log(`HATA ${e.cause?.code || e.message} ${url}`)
    }
  }
  writeFileSync(join(ham, 'indeks.json'), JSON.stringify(indeks, null, 1))
}

function webMetniOku(ham, url) {
  const yol = join(ham, dosyaAdi(url))
  if (!existsSync(yol)) return null
  const t = readFileSync(yol, 'utf8')
  return t.slice(t.indexOf('\n\n') + 2)
}

function dogrula(kayit, ham, dizinYolu, yaz) {
  const indeks = existsSync(join(ham, 'indeks.json')) ? JSON.parse(readFileSync(join(ham, 'indeks.json'), 'utf8')) : {}
  const dizin = dizinYolu ? readFileSync(dizinYolu, 'utf8').split('\n').filter(Boolean).map((s) => JSON.parse(s)) : null
  const bugun = new Date().toISOString().slice(0, 10)
  let kalan = 0
  let toplam = 0
  for (const [slug, m] of Object.entries(kayit.markalar)) {
    for (const o of m.olgular) {
      for (const [i, k] of (o.kaynaklar || []).entries()) {
        if (k.yayin === 'ic-karar') continue
        toplam++
        const ad = `${slug}/${o.alan}#${i + 1}`
        let metin = null
        let uyari = ''
        if (k.tur === 'web') {
          metin = webMetniOku(ham, k.url)
          const ix = indeks[k.url]
          if (ix && ix.durum !== 200) uyari = ` (HTTP ${ix.durum})`
          else if (ix?.yonlendi) uyari = ` (yol değişti → ${ix.sonAdres})`
        } else if (dizin) {
          const sayfa = dizin.find((r) => r.pdf_hash.startsWith(k.pdf_hash) && Number(r.sayfa) === k.sayfa)
          metin = sayfa ? dizinSayfaMetni(sayfa) : null
        }
        if (metin === null) { console.log(`✗ YOK-KAYNAK ${ad} ${k.url || k.pdf_hash}`); k.bulundu = false; kalan++; continue }
        const r = alintiBul(metin, k.alinti)
        k.bulundu = r.bulundu === true && !(k.tur === 'web' && indeks[k.url] && indeks[k.url].durum !== 200)
        if (k.bulundu) {
          const yeniSha = sha256(metin)
          if (k.sha256 && k.sha256 !== yeniSha) console.log(`~ HASH-DEGISTI ${ad} (alıntı yerinde; kaynak sayfa değişmiş)`)
          k.sha256 = yeniSha
          k.cekim = bugun
          console.log(`✓ ${ad}${uyari}${r.bayatlikIsareti ? ` · bayatlık işareti "${r.bayatlikIsareti}" — çevreyi oku` : ''}`)
        } else { console.log(`✗ ALINTI-YOK ${ad}${uyari}: ${r.sebep || ''} ${k.alinti.slice(0, 70)}`); kalan++ }
      }
      const hesap = durumHesapla(o.kaynaklar)
      if (YAZILABILIR.includes(o.durum) && hesap !== o.durum) { console.log(`✗ DURUM-UYUMSUZ ${slug}/${o.alan}: kayıt ${o.durum}, hesaplanan ${hesap}`); kalan++ }
    }
  }
  console.log(`kaynak ${toplam} · bulunamayan ${kalan}`)
  if (yaz) { kayit.sonDogrulama = bugun; writeFileSync(KAYIT_YOLU, `${JSON.stringify(kayit, null, 2)}\n`); console.log(`kayıt yazıldı: ${KAYIT_YOLU}`) }
  return kalan === 0
}

async function main(argv) {
  const komut = argv[0]
  const arg = (ad) => (argv.includes(ad) ? argv[argv.indexOf(ad) + 1] : null)
  const kayit = JSON.parse(readFileSync(KAYIT_YOLU, 'utf8'))
  const hatalar = kayitDenetle(kayit)
  if (komut === 'kontrol') {
    for (const e of hatalar) console.log(`✗ ${e}`)
    console.log(hatalar.length ? `kayıt denetimi: ${hatalar.length} hata` : 'kayıt denetimi: temiz')
    process.exitCode = hatalar.length ? 1 : 0
  } else if (komut === 'cek') {
    const ham = arg('--ham')
    if (!ham) { console.error('kullanım: cek --ham <dizin>'); process.exitCode = 1; return }
    await cek(kayit, ham)
  } else if (komut === 'dogrula') {
    const ham = arg('--ham')
    if (!ham) { console.error('kullanım: dogrula --ham <dizin> [--dizin sayfalar.jsonl] [--yaz]'); process.exitCode = 1; return }
    const temiz = dogrula(kayit, ham, arg('--dizin'), argv.includes('--yaz'))
    process.exitCode = temiz && hatalar.length === 0 ? 0 : 1
  } else {
    console.error('kullanım: marka-olgu-dogrula.mjs kontrol | cek --ham <dizin> | dogrula --ham <dizin> [--dizin <jsonl>] [--yaz]')
    process.exitCode = 1
  }
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/rehber/marka-olgu-dogrula.mjs')) main(process.argv.slice(2)).catch((e) => { console.error('HATA', e.message); process.exitCode = 1 })
