/**
 * DEPO DÖKÜM KAPISI — veritabanı dökümü, kişisel veri ve ödeme parçası HERKESE AÇIK depoya girmesin
 * (INV-DEPO-DOKUM-1, ALT-39). Cetvel: `docs/standards/depoya-giremeyecek-veri-standard.md`.
 *
 * NİÇİN VAR: geçmişte depoya bir veri dökümü girmişti ve depo sonradan herkese açık oldu. Hiçbir kapı
 * görmedi: `secret-scan.py` anahtar ve belirteç İMZALARINA bakar, kişisel veri ve tablo imzasına bakmaz.
 *
 * ⭐DÜRÜST SINIR (bulgu 1): bu kapı iki yerde koşar ve ikisi aynı şeyi söylemez.
 *   · CI: master'a BİRLEŞMEYİ durdurur. Veri, dal itildiği an zaten herkese açık olabilir.
 *   · `.githooks/pre-push`: AĞA ÇIKIŞI durdurur (itilecek TÜM nesneleri, sonradan silinenler dahil, tarar) —
 *     ama `git push --no-verify` ile atlanabilir. Kapı ölçemezse (çıkış 2) kanca yüksek sesle uyarır ve
 *     izin verir; kesin kapı CI'dır.
 *
 * TETİK: izlenen json/jsonl/ndjson/csv/tsv/sql dosyaları ve izlenen yollar (ağaç kipi); itilecek nesneler
 *        (`--yeni-nesneler`, `--pre-push`); GitHub Actions `pull_request` ve tam geçmiş varsa PR'ın ara
 *        commit'leri de (ara commit taraması `fetch-depth: 0` ister).
 * YER:   PR + master push (`ci` işi, Install adımından ÖNCE) ve `.githooks/pre-push`.
 *        ⚠CI'da önceki bir adım kırmızıysa bu adım koşmaz: "her koşuda" DEĞİL, "bağımlılıksız, erken" koşar.
 *
 * KURALLAR — her biri DEĞERE değil ŞEKLE bakar (değer taşıyan hiçbir şey basılmaz):
 *   R1  kişisel alan adı DOLU değerle (json/jsonl/ndjson/csv/tsv). Sözlük iki katmanlıdır: KISISEL_ALANLAR
 *       (belirgin adlar, ≥1 dolu satır) ve KISISEL_GENEL_ALANLAR (email, full_name, phone… ≥3 dolu satır;
 *       i18n/şema dosyalarında tek tük geçen etiketler yanlış alarm olmasın). Sözlük şema tabanından
 *       türetilmiştir ve testi tabanı OKUYARAK kapsamı doğrular.
 *   R2  .sql veri ifadesi (INSERT … VALUES / COPY … FROM stdin) içinde kişisel alan; kolon listesiz
 *       INSERT/COPY'nin hassas tabloya yazması. CREATE/ALTER/politika/`$$` gövdeleri MASUMDUR.
 *   R3  fiyat/maliyet dökümü: ≥5 satırda kimlik + pozitif fiyat/maliyet (JSON, JSONL, CSV, SQL kolon listesi).
 *       Eşleşme önek/sonek toleranslıdır (purchase/cost/alış/maliyet, para birimi eki; model_code, *_kod).
 *   R4  yol kuralı: db-backup, pg_dump, .dump*, sıkıştırılmış/arşiv/ikili uzantılar, toc.dat.
 *   R5  ödeme parçası: binNumber VE lastFourDigits birlikte ve değerler sıfır sayacı DEĞİL.
 *   R6  izlenen ikili veritabanı (.db/.sqlite/.sqlite3 ya da SQLite imzası): içine bakılamaz.
 *   Ölçülemedi (çıkış 2): başlıksız CSV/TSV, ayrıştırılamayan veri dosyası, NUL baytlı veri dosyası.
 *   R3, R6 ve (tek kanıtlı sandbox-kart örneği için) R5 dosya bazlı İZİN LİSTESİ alır (gerekçe + kanıt); R1/R2/R4 ASLA.
 *
 * KİPLER
 *   (varsayılan)                  izlenen AĞAÇ taraması (+ GitHub Actions PR ise ara commit'ler)
 *   --yeni-nesneler <uç> [--haric <ref>]  `git rev-list --objects <uç> --not --remotes` ya da `--not <ref>`
 *   --pre-push                    git'in pre-push stdin'ini okur, itilecek uçları tarar
 *   --kok <dizin>                 depo kökü
 *
 * ÇIKIŞ KODU: 0 temiz · 1 ihlal · 2 ölçülemedi (git yok, depo değil, dosya okunamadı, tavan aşıldı,
 * başlıksız/ayrıştırılamayan veri dosyası, argüman bilinmiyor, boş evren). ⭐2 de KIRMIZIDIR: ölçemeyen
 * kapı yeşil vermez. ⚠Ölçemedim ile ihlal AYRI sonuçlardır.
 *
 * ⛔DEĞER BASMAZ: çıktıda yalnız DOSYA ADI, KURAL ADI, ALAN ADI ve SAYI vardır.
 *
 * ⚠KAPSAM DIŞI (insan incelemesi): sütun/satır biçimli JSON, SKU anahtarlı fiyat haritası, uzantı
 * değiştirme (`.bak`, `.md`), base64, dosyayı parçalara bölme. Cetvel §8 bunları adıyla yazar.
 * ⚠Bu kapı GEÇMİŞİ temizlemez; geçmiş temizliği ayrı iştir (ALT-41).
 */
'use strict'

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

// ── Ayarlar (testler bunları okur; sayılar bedava değişmesin diye adlı) ─────────────────────────

/** İçeriği taranan uzantılar. Yol kuralları (R4/R6) uzantıdan bağımsız, her izlenen yola uygulanır. */
const VERI_UZANTILARI = Object.freeze(['json', 'jsonl', 'ndjson', 'csv', 'tsv', 'sql'])

/** Bundan büyük veri dosyası TARANAMAZ → ölçülemedi (fail-closed). */
const BUYUK_DOSYA_SINIRI = 64 * 1024 * 1024

/** Yeni nesneler kipi tavanları: aşılırsa ölçülemedi (çıkış 2). */
const NESNE_TAVANI = 200000
const OKUMA_TAVANI = 512 * 1024 * 1024

/** R1 belirgin kişisel alanlar (≥1 dolu satır). İlk beşi sipariş tablosunun kolonlarıdır. */
const KISISEL_ALANLAR = Object.freeze([
  'customer_email',
  'customer_phone',
  'customer_name',
  'billing_address',
  'shipping_address',
  'invoice_info',
  'tckn',
  'card_number',
  'card_token',
  'card_user_key',
  'cvc',
])

/** R1 genel kişisel alanlar (≥KISISEL_ESIK dolu satır): şema tabanındaki kişisel kolonlar, `name` hariç (aşırı genel). */
const KISISEL_GENEL_ALANLAR = Object.freeze([
  'email',
  'e_mail',
  'full_name',
  'phone',
  'phone_number',
  'first_name',
  'last_name',
  'contact_name',
  'contact_email',
  'contact_phone',
  'address_line',
  'full_address',
  'street_address',
  'postal_code',
  'tax_no',
  'tax_number',
  'tax_office',
  'ip_address',
])

/** Genel kişisel alanda en az bu kadar dolu satır varsa dökümdür. */
const KISISEL_ESIK = 3

/** R2: kolon listesiz INSERT/COPY bu tablolara yazıyorsa ihlal (şema tabanından: kişisel kolon taşıyan tablolar + maliyet). */
const HASSAS_TABLOLAR = Object.freeze([
  'user_profiles',
  'contact_messages',
  'suppliers',
  'user_addresses',
  'user_invoice_profiles',
  'venthub_orders',
  'product_costs',
])

/** R3 kimlik yarısı: tam ad kümesi + `*_kod` soneki. */
const KIMLIK_ANAHTARLARI = Object.freeze(['id', 'sku', 'slug', 'product_id', 'product_sku', 'model_code'])
const KIMLIK_SONEKLERI = Object.freeze(['kod'])

/** R3 fiyat yarısı: anahtar adı bu kökleri İÇERİYORSA (önek/sonek/para birimi eki tolere edilir). */
const FIYAT_KOKLERI = Object.freeze(['price', 'cost', 'fiyat', 'maliyet', 'alis'])

/** R3: bir dizide/dosyada/SQL ifadesinde en az bu kadar "kimlik + pozitif fiyat" satırı varsa döküm sayılır. */
const FIYAT_ESIGI = 5

/** R5: sıfır sayacı biçimi (arındırılmış fikstürün BIN ve son dört hanesi). Bunlar dışındaki değer gerçek sayılır. */
const BIN_SAYACI = /^0{5}\d$/
const SON_DORT_SAYACI = /^0{3}\d$/

/** Kural kimliği → ad (çıktıda ve testte aynı sözlük). */
const KURALLAR = Object.freeze({
  R1: 'kisisel-alan-dolu',
  R2: 'sql-veri-ifadesi-kisisel-alan',
  R3: 'fiyat-dokumu',
  R4: 'dokum-yolu',
  R5: 'odeme-parcasi',
  R6: 'ikili-veritabani',
})

/** R4 uzantı kalıpları (sıkıştırılmış, arşiv, ikili döküm, tablo). */
const R4_UZANTILARI = Object.freeze([
  'gz',
  'zip',
  'tar',
  'tgz',
  'zst',
  'xz',
  'bz2',
  '7z',
  'rar',
  'backup',
  'pgdump',
  'xlsx',
  'xls',
  'har',
])

/** R4: yol kalıpları. Ad, çıktıda gösterilen kalıptır. */
const YOL_KURALLARI = Object.freeze([
  { ad: 'db-backup', eslesir: (k) => k.includes('db-backup') },
  { ad: 'pg_dump', eslesir: (k) => k.includes('pg_dump') },
  { ad: '.dump', eslesir: (k) => /\.dump(\.[a-z0-9]+)?$/.test(k) },
  { ad: '.sql.gz', eslesir: (k) => k.endsWith('.sql.gz') },
  { ad: '.sql.dump', eslesir: (k) => k.endsWith('.sql.dump') },
  ...R4_UZANTILARI.map((u) => ({ ad: `.${u}`, eslesir: (k) => k.endsWith(`.${u}`) })),
  { ad: 'toc.dat', eslesir: (k) => k === 'toc.dat' || k.endsWith('/toc.dat') },
])

/** R6: ikili veritabanı uzantıları ve SQLite imzası. */
const R6_UZANTILARI = Object.freeze(['db', 'sqlite', 'sqlite3'])
const SQLITE_IMZASI = 'SQLite format 3'
/** İmzaya yalnız bu uzantılı (ya da uzantısız) izlenen dosyalarda bakılır: uzantı değiştirme kasıtlı kapsam dışıdır. */
const R6_IMZA_UZANTILARI = Object.freeze(['', 'bak', 'bin', 'dat', 'data', 'old', 'tmp'])

/** İzin listesi hangi kurallara açık: R1/R2/R4 ASLA. R5 yalnız kanıtlı sandbox-kart örneği için (tek dosya). */
const IZIN_KURALLARI = Object.freeze(['R3', 'R5', 'R6'])

/**
 * İZİN LİSTESİ — DOSYA BAZLI. Her satır: { yol, kural, neden, kanit }.
 *   R3: `kanit` "fiyat sahte/örnek" olduğunu GÖSTERMELİ.
 *   R6: `kanit` içerik taramasının SAYILARINI taşımalı ve "ayrı kayıt: numara OPS'tan" demeli.
 * Sınırını `depo-dokum-kapisi.test.ts` koyar: tavan, yetim satır yasağı, glob yasağı, kural kümesi.
 */
const IZIN_LISTESI = Object.freeze([
  {
    yol: 'support/iyzico_support_payload.json',
    kural: 'R5',
    neden:
      'iyzico destek talebine eklenen örnek yük: kart parçaları sandbox test kartı biçiminde, müşteri kartı değil. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'kart parçası taraması (sayı): 5 örnek, 5/5 son dört hane 000d biçimli (sandbox test kartı biçimi), metinde "sandbox" geçiyor; yayımlanmış test kartı listesine karşı doğrulama ağ ister ve YAPILMADI; ayrı kayıt: numara OPS\'tan',
  },
  {
    yol: 'memory.db',
    kural: 'R6',
    neden: 'Kök dizindeki boş yerel hafıza veritabanı izleniyor; içerik taraması boş çıktı. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'içerik taraması (salt okuma, 2026-10-06): 4096 bayt, 0 tablo, e-posta/telefon/UUID/TCKN deseni 0; ayrı kayıt: numara OPS\'tan',
  },
  {
    yol: 'registry/registry.db',
    kural: 'R6',
    neden: 'Kayıt defteri (registry) SQLite dosyası izleniyor; içerik taraması kişisel veri bulmadı. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'içerik taraması (salt okuma, 2026-10-06): 49152 bayt, 2 tablo (projects 11 satır, tasks 77 satır), e-posta/telefon/UUID/TCKN deseni 0; ayrı kayıt: numara OPS\'tan',
  },
  {
    yol: 'registry/_legacy/registry.db',
    kural: 'R6',
    neden: 'Eski kayıt defteri SQLite dosyası izleniyor; içerik taraması kişisel veri bulmadı. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'içerik taraması (salt okuma, 2026-10-06): 61440 bayt, 3 tablo (agent_memory 4, projects 8, tasks 77 satır), e-posta/telefon/UUID/TCKN deseni 0; ayrı kayıt: numara OPS\'tan',
  },
])

// ── Yardımcılar ──────────────────────────────────────────────────────────────────────────────────

const TR_HARF = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u' }

/** Anahtar/başlık karşılaştırması: Türkçe harf, büyük-küçük harf, `_`, `-` ve boşluk fark etmez (customerEmail = customer_email). */
const norm = (s) =>
  String(s)
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TR_HARF[c])
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const KISISEL_NORM = new Set(KISISEL_ALANLAR.map(norm))
const GENEL_NORM = new Set(KISISEL_GENEL_ALANLAR.map(norm))
const KIMLIK_NORM = new Set(KIMLIK_ANAHTARLARI.map(norm))
const HASSAS_TABLO_NORM = new Set(HASSAS_TABLOLAR.map(norm))

const kimlikAnahtariMi = (nk) => KIMLIK_NORM.has(nk) || KIMLIK_SONEKLERI.some((s) => nk.length > s.length && nk.endsWith(s))
const fiyatAnahtariMi = (nk) => FIYAT_KOKLERI.some((k) => nk.includes(k))

const EPOSTA_DESENI = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const UUID_DESENI = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
const SAF_SAYI_DESENI = /^[+-]?\d+(?:[.,]\d+)?$/

/** Dosya uzantısı (küçük harf, noktasız); yoksa ''. */
function uzanti(yol) {
  const ad = yol.slice(yol.lastIndexOf('/') + 1)
  const i = ad.lastIndexOf('.')
  return i < 0 ? '' : ad.slice(i + 1).toLowerCase()
}

/** Boş olmayan değer mi? (boş dize, null, [], {}, yalnız boş yapraklar = boş) */
function doluMu(v) {
  if (v === null || v === undefined) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'number') return Number.isFinite(v)
  if (Array.isArray(v)) return v.some(doluMu)
  if (typeof v === 'object') return Object.values(v).some(doluMu)
  return false // boolean bayrak kişisel veri değildir
}

/** "1.299,90" · "1,299.90" · "1299,90" · "1299.90" → sayı; sayı değilse NaN. */
function sayiyaCevir(s) {
  let t = String(s).trim().replace(/\s|₺|TL|TRY|\$|€|EUR|USD/gi, '')
  if (t === '') return NaN
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '')
  else if (/^\d+,\d+$/.test(t)) t = t.replace(',', '.')
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN
}

/** Fiyat "dolu sayısal" mı: sonlu ve > 0 (0 fiyat bir fiyat bilgisi taşımaz). */
function pozitifSayi(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0
  if (typeof v === 'string') {
    const n = sayiyaCevir(v)
    return Number.isFinite(n) && n > 0
  }
  return false
}

/** Yol → R4 kalıp adları (boşsa temiz). */
function yolIhlali(yol) {
  const k = yol.toLowerCase()
  return YOL_KURALLARI.filter((r) => r.eslesir(k)).map((r) => r.ad)
}

/** Yol → R6 (ikili veritabanı uzantısı) mı? */
function ikiliUzantiMi(yol) {
  return R6_UZANTILARI.includes(uzanti(yol))
}

/** BOM'u (U+FEFF) atar. Kaynakta kaçış dizisi yazmamak için kod noktasıyla karşılaştırılır. */
function bomSil(metin) {
  return metin.length > 0 && metin.charCodeAt(0) === 0xfeff ? metin.slice(1) : metin
}

/**
 * Bayt dizisini metne çevirir: UTF-16 LE/BE BOM'u çözülür (PowerShell 5.1 `>` varsayılanı UTF-16LE'dir; çözülmezse
 * desenler NUL baytlarına takılır ve kapı sessizce "temiz" der), UTF-8 BOM'u atılır.
 */
function metneCevir(tampon) {
  if (tampon.length >= 2 && tampon[0] === 0xff && tampon[1] === 0xfe) return tampon.subarray(2).toString('utf16le')
  if (tampon.length >= 2 && tampon[0] === 0xfe && tampon[1] === 0xff) {
    const govde = Buffer.from(tampon.subarray(2, 2 + Math.floor((tampon.length - 2) / 2) * 2))
    govde.swap16()
    return govde.toString('utf16le')
  }
  return bomSil(tampon.toString('utf8'))
}

// ── JSON / JSONL ────────────────────────────────────────────────────────────────────────────────

function satirBelgeleri(metin) {
  const belgeler = []
  let basarisiz = 0
  for (const satir of metin.split(/\r?\n/)) {
    if (satir.trim() === '') continue
    try {
      belgeler.push(JSON.parse(satir))
    } catch {
      basarisiz++
    }
  }
  return { belgeler, basarisiz }
}

/** JSONC'yi (// ve blok yorum, sondaki virgül) düz JSON'a çevirir; dize içeriğine dokunmaz. */
function jsonYorumTemizle(t) {
  let o = ''
  let i = 0
  const n = t.length
  while (i < n) {
    const c = t[i]
    const d = t[i + 1]
    if (c === '"') {
      let j = i + 1
      while (j < n) {
        if (t[j] === '\\') {
          j += 2
          continue
        }
        if (t[j] === '"') {
          j++
          break
        }
        j++
      }
      o += t.slice(i, j)
      i = j
      continue
    }
    if (c === '/' && d === '/') {
      while (i < n && t[i] !== '\n') i++
      continue
    }
    if (c === '/' && d === '*') {
      i += 2
      while (i < n && !(t[i] === '*' && t[i + 1] === '/')) i++
      i += 2
      continue
    }
    o += c
    i++
  }
  // sondaki virgüller (dizeler dışında)
  let s = ''
  i = 0
  const m = o.length
  while (i < m) {
    const c = o[i]
    if (c === '"') {
      let j = i + 1
      while (j < m) {
        if (o[j] === '\\') {
          j += 2
          continue
        }
        if (o[j] === '"') {
          j++
          break
        }
        j++
      }
      s += o.slice(i, j)
      i = j
      continue
    }
    if (c === ',') {
      let j = i + 1
      while (j < m && /\s/.test(o[j])) j++
      if (o[j] === '}' || o[j] === ']') {
        i++
        continue
      }
    }
    s += c
    i++
  }
  return s
}

/**
 * Metni JSON belgelerine çevirir. Sıra: düz JSON → JSONC (yorum, sondaki virgül) → satır satır NDJSON.
 * Hiçbiri olmazsa `ayristirilamadi: true`: çağıran HAM METİN taramasına düşer ve temiz çıksa bile
 * "ölçülemedi" (çıkış 2) üretir — ayrıştırılamayan dosya kapıdan "temiz" diye geçmez.
 */
function jsonBelgeleri(metin, uz) {
  const t = bomSil(metin)
  if (uz === 'jsonl' || uz === 'ndjson') {
    const s = satirBelgeleri(t)
    return { belgeler: s.belgeler, satirlar: true, ayristirilamadi: s.basarisiz > 0 }
  }
  try {
    return { belgeler: [JSON.parse(t)], satirlar: false, ayristirilamadi: false }
  } catch {
    // devam
  }
  try {
    return { belgeler: [JSON.parse(jsonYorumTemizle(t))], satirlar: false, ayristirilamadi: false }
  } catch {
    // devam
  }
  const s = satirBelgeleri(t)
  if (s.belgeler.length > 0 && s.basarisiz === 0) return { belgeler: s.belgeler, satirlar: true, ayristirilamadi: false }
  // Karışık kodlama / başta ya da sonda çöp (ör. UTF-16 gövde + tek baytlık CRLF): ilk `{`/`[` ile son `}`/`]` arası.
  const baslar = [t.indexOf('{'), t.indexOf('[')].filter((i) => i >= 0)
  const bas = baslar.length > 0 ? Math.min(...baslar) : -1
  const son = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'))
  if (bas >= 0 && son > bas) {
    try {
      return { belgeler: [JSON.parse(jsonYorumTemizle(t.slice(bas, son + 1)))], satirlar: false, ayristirilamadi: false }
    } catch {
      // devam
    }
  }
  return { belgeler: [], satirlar: false, ayristirilamadi: true }
}

/** Bir nesne "kimlik + pozitif fiyat/maliyet" taşıyan DB satırı imzası mı? */
function fiyatSatiriMi(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false
  let kimlik = false
  let fiyat = false
  for (const [k, v] of Object.entries(o)) {
    const nk = norm(k)
    if (kimlikAnahtariMi(nk) && (typeof v === 'string' ? v.trim() !== '' : typeof v === 'number')) kimlik = true
    if (fiyatAnahtariMi(nk) && pozitifSayi(v)) fiyat = true
  }
  return kimlik && fiyat
}

/** Kart parçası çifti gerçek mi (sıfır sayacı değil mi)? İkisi de dolu olmalı. */
function kartParcasiGercekMi(bin, sonDort) {
  if (!doluMu(bin) || !doluMu(sonDort)) return false
  return !(BIN_SAYACI.test(String(bin)) && SON_DORT_SAYACI.test(String(sonDort)))
}

/**
 * JSON belgelerini gezer (yığınla, özyinelemesiz): belirgin kişisel alan adları, genel alanların dolu
 * nesne sayıları, kart parçası çifti (R5) ve en kalabalık "fiyat satırı" dizisinin eleman sayısı.
 */
function jsonGez(belgeler, satirDizisi) {
  const alanlar = new Set()
  const genel = new Map() // norm -> { ad, sayi }
  let r5 = false
  let enCok = satirDizisi ? belgeler.filter(fiyatSatiriMi).length : 0
  const kisiselSay = (k, v) => {
    const nk = norm(k)
    if (KISISEL_NORM.has(nk) && doluMu(v)) alanlar.add(k)
    if (GENEL_NORM.has(nk) && doluMu(v)) {
      const g = genel.get(nk) || { ad: k, sayi: 0 }
      g.sayi++
      genel.set(nk, g)
    }
  }
  const yigin = [...belgeler]
  while (yigin.length > 0) {
    const d = yigin.pop()
    if (Array.isArray(d)) {
      const n = d.filter(fiyatSatiriMi).length
      if (n > enCok) enCok = n
      // jq --stream biçimi: [["yol","alan"], değer] — son yol öğesi alan adıdır
      if (d.length === 2 && Array.isArray(d[0]) && d[0].length > 0 && typeof d[0][d[0].length - 1] === 'string') {
        kisiselSay(d[0][d[0].length - 1], d[1])
      }
      for (const e of d) if (e && typeof e === 'object') yigin.push(e)
    } else if (d && typeof d === 'object') {
      let bin
      let sonDort
      for (const [k, v] of Object.entries(d)) {
        const nk = norm(k)
        kisiselSay(k, v)
        if (nk === 'binnumber') bin = v
        if (nk === 'lastfourdigits') sonDort = v
        if (v && typeof v === 'object') yigin.push(v)
      }
      if (kartParcasiGercekMi(bin, sonDort)) r5 = true
    }
  }
  const genelHit = [...genel.values()].filter((g) => g.sayi >= KISISEL_ESIK).map((g) => g.ad)
  return { alanlar: [...alanlar].sort(), genel: genelHit.sort(), r5, enCok }
}

/** Ham metinde alan adını her tırnak/büyük-küçük/ayraç biçimiyle arayan desen (alan adı → RegExp kaynağı). */
function alanDeseni(ad) {
  return ad
    .split('_')
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[_\\-\\s]?')
}

/**
 * Ayrıştırılamayan JSON/JSONL için ham metin taraması: alan adı her tırnak (`"` `'` ya da yok), her
 * büyük-küçük harf ve ayraç biçimiyle, değer dolu görünüyorsa sayılır. jq akış biçimi (`["alan"],"değer"`) dahil.
 * Satır satır değil TÜM metin üzerinde çalışır: çok satırlı nesneler de yakalanır.
 */
function hamTara(metin) {
  const dolu = '(?:"[^"\\s][^"]*"|\'[^\'\\s][^\']*\'|-?\\d|\\{\\s*["\'\\w]|\\[\\s*["\'\\w{])'
  const say = (ad) => {
    const p = alanDeseni(ad)
    const duz = new RegExp(`["']?${p}["']?\\s*[:=]\\s*${dolu}`, 'gi')
    const akis = new RegExp(`["']${p}["']\\s*\\]\\s*,\\s*${dolu}`, 'gi')
    return (metin.match(duz) || []).length + (metin.match(akis) || []).length
  }
  const alanlar = KISISEL_ALANLAR.filter((a) => say(a) >= 1).sort()
  const genel = KISISEL_GENEL_ALANLAR.filter((a) => say(a) >= KISISEL_ESIK).sort()
  const binler = [...metin.matchAll(new RegExp(`["']?${alanDeseni('bin_number')}["']?\\s*[:=]\\s*["']?(\\d{6})`, 'gi'))].map((m) => m[1])
  const sonDortVar = new RegExp(`["']?${alanDeseni('last_four_digits')}["']?\\s*[:=]`, 'i').test(metin)
  const r5 = sonDortVar && binler.some((b) => !BIN_SAYACI.test(b))
  const fiyat = (
    metin.match(/["']?[A-Za-z_]*(?:price|cost|fiyat|maliyet|alis)[A-Za-z_]*["']?\s*[:=]\s*["']?[1-9]\d*(?:[.,]\d+)?/gi) || []
  ).length
  const kimlik = (metin.match(/["'](?:id|sku|slug|product_id|product_sku|model_code|[A-Za-z_]*kod)["']\s*[:=]/gi) || []).length
  return { alanlar, genel, r5, r3: fiyat >= FIYAT_ESIGI && kimlik >= FIYAT_ESIGI }
}

// ── CSV / TSV ───────────────────────────────────────────────────────────────────────────────────

/** İlk boş olmayan satır (ayraç tespiti için). */
function ilkSatir(metin) {
  for (const s of bomSil(metin).split(/\r?\n/)) if (s.trim() !== '') return s
  return ''
}

function ayracBul(uz, ilk) {
  if (uz === 'tsv') return '\t'
  const say = (c) => ilk.split(c).length - 1
  const adaylar = [
    [',', say(',')],
    [';', say(';')],
    ['\t', say('\t')],
  ].sort((a, b) => b[1] - a[1])
  return adaylar[0][1] > 0 ? adaylar[0][0] : ','
}

/** Asgari RFC 4180 ayrıştırıcı: tırnaklı hücre, `""` kaçışı, hücre içi satır sonu, CRLF/LF. */
function csvAyristir(metin, ayrac) {
  const t = bomSil(metin)
  const satirlar = []
  let satir = []
  let hucre = ''
  let tirnakta = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (tirnakta) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          hucre += '"'
          i++
        } else tirnakta = false
      } else hucre += c
      continue
    }
    if (c === '"' && hucre === '') {
      tirnakta = true
      continue
    }
    if (c === ayrac) {
      satir.push(hucre)
      hucre = ''
      continue
    }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      satir.push(hucre)
      hucre = ''
      if (!(satir.length === 1 && satir[0] === '')) satirlar.push(satir)
      satir = []
      continue
    }
    hucre += c
  }
  if (hucre !== '' || satir.length > 0) {
    satir.push(hucre)
    satirlar.push(satir)
  }
  return satirlar
}

/** İlk satır başlık gibi mi yoksa VERİ gibi mi (e-posta, UUID, saf sayı)? Veri gibiyse dosya başlıksızdır. */
function satirVeriGibiMi(hucreler) {
  return hucreler.some((h) => {
    const t = String(h).trim()
    return t !== '' && (EPOSTA_DESENI.test(t) || UUID_DESENI.test(t) || SAF_SAYI_DESENI.test(t))
  })
}

/** CSV'yi bir kez ayrıştırır: { baslik, govde, basliksiz }. */
function csvTablo(metin, uz) {
  const satirlar = csvAyristir(metin, ayracBul(uz, ilkSatir(metin)))
  if (satirlar.length === 0) return { baslik: [], govde: [], basliksiz: false }
  return { baslik: satirlar[0], govde: satirlar.slice(1), basliksiz: satirVeriGibiMi(satirlar[0]) }
}

function csvKisisel({ baslik, govde }) {
  const alanlar = new Set()
  const genel = new Set()
  baslik.forEach((b, i) => {
    const nb = norm(b)
    const dolu = govde.filter((r) => (r[i] || '').trim() !== '').length
    if (KISISEL_NORM.has(nb) && dolu >= 1) alanlar.add(String(b).trim())
    if (GENEL_NORM.has(nb) && dolu >= KISISEL_ESIK) genel.add(String(b).trim())
  })
  return { alanlar: [...alanlar].sort(), genel: [...genel].sort() }
}

function csvKartParcasi({ baslik, govde }) {
  const bin = baslik.findIndex((b) => norm(b) === 'binnumber')
  const son = baslik.findIndex((b) => norm(b) === 'lastfourdigits')
  if (bin < 0 || son < 0) return false
  return govde.some((r) => kartParcasiGercekMi(r[bin], r[son]))
}

function csvFiyatSatiri({ baslik, govde }) {
  const kimlik = []
  const fiyat = []
  baslik.forEach((b, i) => {
    const nb = norm(b)
    if (kimlikAnahtariMi(nb)) kimlik.push(i)
    if (fiyatAnahtariMi(nb)) fiyat.push(i)
  })
  if (kimlik.length === 0 || fiyat.length === 0) return 0
  let n = 0
  for (const r of govde) {
    if (kimlik.some((i) => (r[i] || '').trim() !== '') && fiyat.some((i) => pozitifSayi(r[i]))) n++
  }
  return n
}

// ── SQL ──────────────────────────────────────────────────────────────────────────────────────────

const COPY_STDIN = /^\s*copy\b[\s\S]*?\bfrom\s+stdin\b/i
const COPY_BASLIK = /^\s*copy\s+(\S+?)\s*(?:\(([^)]*)\))?\s*from\s+stdin\b/i
const INSERT_INTO = /^\s*insert\s+into\b/i
const INSERT_BASLIK = /^\s*insert\s+into\s+(\S+?)\s*(?:\(([^)]*)\))?\s*(?:overriding\s+\w+\s+value\s+)?values\b/i
const KISISEL_SQL = new RegExp(`\\b(${KISISEL_ALANLAR.join('|')})\\b`, 'gi')
/** Dollar-quote etiketi: ASCII harf/rakam/alt çizgi ve Latin-1 üstü harfler (\x80-\xff). */
const DOLAR_ETIKETI = /^\$([A-Za-z_\x80-\xff][A-Za-z0-9_\x80-\xff]*)?\$/

/**
 * SQL metnini üst düzey ifadelere böler. Yorumlar atılır; `$$ ... $$` (ve `$etiket$`) gövdeleri
 * BOŞALTILIR (fonksiyon gövdesindeki INSERT veri değildir); dize ve tırnaklı tanımlayıcı içeriği
 * korunur (içindeki `;` ifadeyi bölmez). `COPY ... FROM stdin;` sonrası veri bloğu `\.` satırına
 * kadar atlanır (veri satırındaki kesme işareti ayrıştırıcıyı bozmasın) ve satır sayısı tutulur.
 * `bozuk: true` → dize/yorum/dollar-quote kapanmadan metin bitti (ayrıştırma güvenilmez).
 * @returns {{ifadeler: Array<{metin: string, veriSatiri: number}>, bozuk: boolean}}
 */
function sqlBol(sql) {
  const ifadeler = []
  const n = sql.length
  let i = 0
  let cur = ''
  let bozuk = false
  while (i < n) {
    const c = sql[i]
    const d = sql[i + 1]
    if (c === '-' && d === '-') {
      const j = sql.indexOf('\n', i)
      i = j < 0 ? n : j
      continue
    }
    if (c === '/' && d === '*') {
      let derin = 1
      i += 2
      while (i < n && derin > 0) {
        if (sql[i] === '/' && sql[i + 1] === '*') {
          derin++
          i += 2
        } else if (sql[i] === '*' && sql[i + 1] === '/') {
          derin--
          i += 2
        } else i++
      }
      if (derin > 0) bozuk = true
      cur += ' '
      continue
    }
    if (c === "'") {
      const onceki = sql[i - 1]
      const kacisli = (onceki === 'E' || onceki === 'e') && !/[A-Za-z0-9_]/.test(sql[i - 2] || ' ')
      let s = "'"
      let j = i + 1
      let kapandi = false
      while (j < n) {
        const ch = sql[j]
        if (kacisli && ch === '\\') {
          s += ch + (sql[j + 1] || '')
          j += 2
          continue
        }
        if (ch === "'") {
          if (sql[j + 1] === "'") {
            s += "''"
            j += 2
            continue
          }
          s += "'"
          j++
          kapandi = true
          break
        }
        s += ch
        j++
      }
      if (!kapandi) bozuk = true
      cur += s
      i = j
      continue
    }
    if (c === '"') {
      let s = '"'
      let j = i + 1
      let kapandi = false
      while (j < n) {
        if (sql[j] === '"') {
          if (sql[j + 1] === '"') {
            s += '""'
            j += 2
            continue
          }
          s += '"'
          j++
          kapandi = true
          break
        }
        s += sql[j]
        j++
      }
      if (!kapandi) bozuk = true
      cur += s
      i = j
      continue
    }
    if (c === '$') {
      const m = DOLAR_ETIKETI.exec(sql.slice(i, i + 80))
      if (m) {
        const etiket = m[0]
        const son = sql.indexOf(etiket, i + etiket.length)
        if (son < 0) bozuk = true
        cur += `${etiket} ${etiket}`
        i = son < 0 ? n : son + etiket.length
        continue
      }
    }
    if (c === ';') {
      const ifade = cur
      cur = ''
      i++
      let veriSatiri = 0
      if (COPY_STDIN.test(ifade)) {
        const k = sql.indexOf('\n\\.', i)
        const veri = sql.slice(i, k < 0 ? n : k)
        veriSatiri = veri.split('\n').filter((l) => l.trim() !== '').length
        i = k < 0 ? n : k + 3
      }
      if (ifade.trim() !== '') ifadeler.push({ metin: ifade, veriSatiri })
      continue
    }
    cur += c
    i++
  }
  if (cur.trim() !== '') ifadeler.push({ metin: cur, veriSatiri: 0 })
  return { ifadeler, bozuk }
}

/** Geriye uyumlu: yalnız ifade metinleri. */
function sqlIfadeleri(sql) {
  return sqlBol(sql).ifadeler.map((x) => x.metin)
}

/** `VALUES` sonrası üst düzey değer demeti sayısı (dize içindeki parantezler sayılmaz). */
function demetSayisi(govde) {
  let n = 0
  let derin = 0
  for (let i = 0; i < govde.length; i++) {
    const c = govde[i]
    if (c === "'") {
      i++
      while (i < govde.length) {
        if (govde[i] === "'") {
          if (govde[i + 1] === "'") {
            i += 2
            continue
          }
          break
        }
        i++
      }
      continue
    }
    if (c === '(') {
      if (derin === 0) n++
      derin++
    } else if (c === ')') derin--
  }
  return n
}

const kolonAdlari = (liste) =>
  liste
    ? liste
        .split(',')
        .map((k) => k.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
    : null
const tabloAdi = (ham) => ham.replace(/"/g, '').split('.').pop()

/**
 * Bir SQL ifadesinin VERİ ifadesi olup olmadığı ve ayrıntısı. `INSERT ... SELECT` ve tanımlar veri DEĞİLDİR.
 * @returns {null | {tur: 'COPY'|'INSERT', tablo: string, kolonlar: string[]|null, satir: number}}
 */
function veriIfadesiAyrinti(ifade) {
  const metin = ifade.metin
  if (COPY_STDIN.test(metin)) {
    const m = COPY_BASLIK.exec(metin)
    return { tur: 'COPY', tablo: m ? tabloAdi(m[1]) : '', kolonlar: m ? kolonAdlari(m[2]) : null, satir: ifade.veriSatiri }
  }
  if (INSERT_INTO.test(metin) && /\bvalues\b/i.test(metin.replace(/'(?:[^']|'')*'/g, "''"))) {
    const m = INSERT_BASLIK.exec(metin.replace(/'(?:[^']|'')*'/g, "''"))
    const idx = metin.search(/\bvalues\b/i)
    return {
      tur: 'INSERT',
      tablo: m ? tabloAdi(m[1]) : '',
      kolonlar: m ? kolonAdlari(m[2]) : null,
      satir: idx < 0 ? 0 : demetSayisi(metin.slice(idx + 6)),
    }
  }
  return null
}

/** Geriye uyumlu: yalnız tür. */
function veriIfadesiTuru(ifade) {
  const a = veriIfadesiAyrinti({ metin: ifade, veriSatiri: 0 })
  return a ? a.tur : null
}

/**
 * SQL veri ifadelerinin bulguları: R2 (kişisel alan; kolon listesiz hassas tablo), R3 (kolon listesinde kimlik + fiyat, ≥eşik
 * satır), R5 (kart parçası çifti). Ayrıca `bozuk` bayrağı (ayrıştırma güvenilmez → ölçülemedi).
 */
function sqlDegerlendir(sql) {
  const { ifadeler, bozuk } = sqlBol(sql)
  const bulgular = []
  for (const ifade of ifadeler) {
    const a = veriIfadesiAyrinti(ifade)
    if (!a) continue
    const alanlar = new Set((ifade.metin.match(KISISEL_SQL) || []).map((x) => x.toLowerCase()))
    const kol = a.kolonlar ? a.kolonlar.map(norm) : []
    for (const k of a.kolonlar || []) {
      const nk = norm(k)
      if (KISISEL_NORM.has(nk)) alanlar.add(k.toLowerCase())
      if (GENEL_NORM.has(nk) && a.satir >= KISISEL_ESIK) alanlar.add(k.toLowerCase())
    }
    if (alanlar.size > 0) bulgular.push({ kural: 'R2', ayrinti: `${a.tur} ifadesi, alan: ${[...alanlar].sort().join(', ')}` })
    if (a.kolonlar === null && HASSAS_TABLO_NORM.has(norm(a.tablo))) {
      bulgular.push({ kural: 'R2', ayrinti: `${a.tur} ifadesi kolon listesiz, hassas tablo: ${a.tablo}` })
    }
    if (kol.some(kimlikAnahtariMi) && kol.some(fiyatAnahtariMi) && a.satir >= FIYAT_ESIGI) {
      bulgular.push({ kural: 'R3', ayrinti: `${a.tur} ifadesi, ${a.satir} satır (kimlik + fiyat kolonu)` })
    }
    if (kol.includes('binnumber') && kol.includes('lastfourdigits')) {
      bulgular.push({ kural: 'R5', ayrinti: `${a.tur} ifadesi: binNumber + lastFourDigits kolonları` })
    }
  }
  return { bulgular, bozuk }
}

/** Geriye uyumlu: SQL veri ifadelerinde geçen kişisel alan adları ve ifade türleri. */
function sqlKisisel(sql) {
  return sqlDegerlendir(sql)
    .bulgular.filter((b) => b.kural === 'R2')
    .map((b) => {
      const [tur, alanlar] = b.ayrinti.split(' ifadesi')
      return { tur, alanlar: (alanlar || '').replace(/^,\s*alan:\s*/, '').split(', ') }
    })
}

// ── Tek dosya ve tüm ağaç ────────────────────────────────────────────────────────────────────────

/**
 * Bir veri dosyasının içeriğini kurallara göre değerlendirir. SAF: dosya sistemine dokunmaz.
 * @returns {{bulgular: Array<{kural:string, ayrinti:string}>, olculemedi: string[]}} — ayrıntıda DEĞER YOKTUR.
 */
function dosyaDegerlendir(yol, metin) {
  const uz = uzanti(yol)
  const bulgular = []
  const olculemedi = []
  const kisiselEkle = (alanlar, genel) => {
    if (alanlar.length > 0) bulgular.push({ kural: 'R1', ayrinti: `alan: ${alanlar.join(', ')}` })
    if (genel.length > 0) bulgular.push({ kural: 'R1', ayrinti: `genel alan (≥${KISISEL_ESIK} dolu satır): ${genel.join(', ')}` })
  }
  if (uz === 'json' || uz === 'jsonl' || uz === 'ndjson') {
    const j = jsonBelgeleri(metin, uz)
    if (j.ayristirilamadi) {
      const h = hamTara(metin)
      kisiselEkle(h.alanlar, h.genel)
      if (h.r5) bulgular.push({ kural: 'R5', ayrinti: 'binNumber + lastFourDigits (ham metin taraması)' })
      if (h.r3) bulgular.push({ kural: 'R3', ayrinti: `≥${FIYAT_ESIGI} kimlik + fiyat/maliyet anahtarı (ham metin taraması)` })
      olculemedi.push('veri dosyası ayrıştırılamadı (JSON/JSONC/NDJSON değil); yalnız ham metin taraması yapıldı')
    } else {
      const { alanlar, genel, r5, enCok } = jsonGez(j.belgeler, j.satirlar)
      kisiselEkle(alanlar, genel)
      if (r5) bulgular.push({ kural: 'R5', ayrinti: 'binNumber + lastFourDigits (sıfır sayacı değil)' })
      if (enCok >= FIYAT_ESIGI) bulgular.push({ kural: 'R3', ayrinti: `${enCok} satır (kimlik + fiyat)` })
    }
  } else if (uz === 'csv' || uz === 'tsv') {
    const tablo = csvTablo(metin, uz)
    if (tablo.basliksiz) {
      olculemedi.push('başlıksız CSV/TSV (ilk satır veri gibi: e-posta, UUID ya da saf sayı); başlık yoksa alan adı bilinemez')
    } else {
      const k = csvKisisel(tablo)
      kisiselEkle(k.alanlar, k.genel)
      if (csvKartParcasi(tablo)) bulgular.push({ kural: 'R5', ayrinti: 'binNumber + lastFourDigits (sıfır sayacı değil)' })
      const n = csvFiyatSatiri(tablo)
      if (n >= FIYAT_ESIGI) bulgular.push({ kural: 'R3', ayrinti: `${n} satır (kimlik + fiyat)` })
    }
  } else if (uz === 'sql') {
    const s = sqlDegerlendir(metin)
    bulgular.push(...s.bulgular)
    if (s.bozuk) olculemedi.push('SQL ayrıştırılamadı (kapanmayan dize, yorum ya da dollar-quote)')
  }
  return { bulgular, olculemedi }
}

/** Geriye uyumlu: yalnız bulgular. */
function dosyaTara(yol, metin) {
  return dosyaDegerlendir(yol, metin).bulgular
}

/** İzin listesi bu dosya + kural için geçerli mi? YALNIZ IZIN_KURALLARI. */
function izinliMi(yol, kural, izin) {
  return IZIN_KURALLARI.includes(kural) && izin.some((e) => e.yol === yol && e.kural === kural)
}

/**
 * Tüm ağacı tarar.
 * @param {{dosyalar:string[], oku:(yol:string)=>string|null, izin?:ReadonlyArray<{yol:string,kural:string}>, ikili?:(yol:string)=>boolean}} g
 *   `oku`: içerik döner; dosya diskte yoksa `null` (atlanır); okunamıyorsa FIRLATIR (çağıran 2 döner).
 *   `ikili`: yolu SQLite imzasına karşı denetler (uzantısı R6 olmayan adaylar için).
 */
function tara({ dosyalar, oku, izin = IZIN_LISTESI, ikili }) {
  const ihlaller = []
  const izinliler = []
  const olculemedi = []
  let veriDosyasi = 0
  const kaydet = (kayit) => (izinliMi(kayit.dosya, kayit.kural, izin) ? izinliler : ihlaller).push(kayit)
  for (const yol of dosyalar) {
    for (const ad of yolIhlali(yol)) ihlaller.push({ kural: 'R4', ad: KURALLAR.R4, dosya: yol, ayrinti: `kalıp: ${ad}` })
    const uz = uzanti(yol)
    if (ikiliUzantiMi(yol)) {
      kaydet({ kural: 'R6', ad: KURALLAR.R6, dosya: yol, ayrinti: `izlenen ikili veritabanı (.${uz})` })
    } else if (ikili && R6_IMZA_UZANTILARI.includes(uz) && ikili(yol)) {
      kaydet({ kural: 'R6', ad: KURALLAR.R6, dosya: yol, ayrinti: 'izlenen ikili veritabanı (SQLite imzası)' })
    }
    if (!VERI_UZANTILARI.includes(uz)) continue
    const metin = oku(yol)
    if (metin === null) continue
    veriDosyasi++
    if (metin.includes(String.fromCharCode(0))) {
      olculemedi.push({ dosya: yol, ayrinti: 'veri dosyasında NUL baytı (BOM\'suz UTF-16 ya da ikili içerik); okunamadı' })
      continue
    }
    const d = dosyaDegerlendir(yol, metin)
    for (const b of d.bulgular) kaydet({ kural: b.kural, ad: KURALLAR[b.kural], dosya: yol, ayrinti: b.ayrinti })
    for (const o of d.olculemedi) olculemedi.push({ dosya: yol, ayrinti: o })
  }
  return { ihlaller, izinliler, olculemedi, taranan: { dosya: dosyalar.length, veri: veriDosyasi } }
}

// ── Git ─────────────────────────────────────────────────────────────────────────────────────────

/** `git` ortamı: üst süreçten gelen GIT_* değişkenleri (kanca içinde GIT_DIR gibi) başka depoya sızmasın. */
function temizOrtam(env) {
  const o = {}
  for (const [k, v] of Object.entries(env)) if (!k.startsWith('GIT_')) o[k] = v
  return o
}

function git(kok, env, args, girdi) {
  return execFileSync('git', args, {
    cwd: kok,
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: temizOrtam(env),
    input: girdi,
  })
}

function gitDosyalari(kok, env) {
  return git(kok, env, ['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean)
}

/** Diskten okur: yoksa null; sembolik bağ/dizin atlanır (null); `sinir` bayttan büyükse FIRLATIR. UTF-16 BOM çözülür. */
function diskOkuyucu(kok, sinir = BUYUK_DOSYA_SINIRI) {
  return (yol) => {
    const mutlak = path.join(kok, yol)
    let st
    try {
      st = fs.lstatSync(mutlak)
    } catch (e) {
      if (e && e.code === 'ENOENT') return null
      throw e
    }
    if (!st.isFile()) return null
    if (st.size > sinir) {
      throw new Error(`dosya çok büyük, taranamadı (${st.size} bayt > ${sinir}): ${yol}`)
    }
    return metneCevir(fs.readFileSync(mutlak))
  }
}

/** Yolun ilk 16 baytı SQLite imzası mı? (yalnız R6 aday uzantıları için çağrılır) */
function sqliteImzasiMi(kok) {
  return (yol) => {
    try {
      const fd = fs.openSync(path.join(kok, yol), 'r')
      try {
        const tampon = Buffer.alloc(16)
        const n = fs.readSync(fd, tampon, 0, 16, 0)
        return n >= SQLITE_IMZASI.length && tampon.toString('latin1', 0, SQLITE_IMZASI.length) === SQLITE_IMZASI
      } finally {
        fs.closeSync(fd)
      }
    } catch {
      return false
    }
  }
}

// ── Yeni nesneler (itilecek / PR'a giren TÜM blob'lar) ──────────────────────────────────────────

/**
 * `git rev-list --objects <uç>... --not (--remotes | <haric>...)` ile erişilen TÜM blob'ları tarar:
 * sonradan silinmiş dosyalar dahil. Yol kuralları (R4/R6) her yola, içerik kuralları veri uzantılı blob'lara.
 * Tavan aşılırsa ya da bir blob okunamazsa FIRLATIR (çağıran 2 döner).
 */
function yeniNesneleriTara({ kok, ucler, haric = [], env = process.env, izin = IZIN_LISTESI, nesneTavani = NESNE_TAVANI, okumaTavani = OKUMA_TAVANI }) {
  const args = ['rev-list', '--objects', ...ucler, '--not', ...(haric.length > 0 ? haric : ['--remotes'])]
  const satirlar = git(kok, env, args).toString('utf8').split('\n').filter((s) => s.trim() !== '')
  if (satirlar.length > nesneTavani) {
    throw new Error(`yeni nesne sayısı tavanı aştı (${satirlar.length} > ${nesneTavani}); taranamadı`)
  }
  const yollar = new Map() // sha -> Set(yol)
  const tumSha = []
  for (const s of satirlar) {
    const i = s.indexOf(' ')
    const sha = i < 0 ? s : s.slice(0, i)
    tumSha.push(sha)
    if (i > 0) {
      if (!yollar.has(sha)) yollar.set(sha, new Set())
      yollar.get(sha).add(s.slice(i + 1))
    }
  }
  const bilgi = new Map() // sha -> {tur, boyut}
  if (tumSha.length > 0) {
    const cikti = git(kok, env, ['cat-file', '--batch-check'], `${tumSha.join('\n')}\n`).toString('utf8')
    for (const s of cikti.split('\n')) {
      const p = s.split(' ')
      if (p.length === 3) bilgi.set(p[0], { tur: p[1], boyut: Number(p[2]) })
    }
  }
  const ihlaller = []
  const izinliler = []
  const olculemedi = []
  const kaydet = (kayit) => (izinliMi(kayit.dosya, kayit.kural, izin) ? izinliler : ihlaller).push(kayit)
  const okunacak = []
  let blobSayisi = 0
  const goruldu = new Set()
  for (const [sha, kumeler] of yollar) {
    const b = bilgi.get(sha)
    if (!b || b.tur !== 'blob') continue
    blobSayisi++
    for (const yol of kumeler) {
      for (const ad of yolIhlali(yol)) {
        const anahtar = `R4\0${yol}\0${ad}`
        if (!goruldu.has(anahtar)) {
          goruldu.add(anahtar)
          ihlaller.push({ kural: 'R4', ad: KURALLAR.R4, dosya: yol, ayrinti: `kalıp: ${ad}` })
        }
      }
      if (ikiliUzantiMi(yol)) {
        const anahtar = `R6\0${yol}`
        if (!goruldu.has(anahtar)) {
          goruldu.add(anahtar)
          kaydet({ kural: 'R6', ad: KURALLAR.R6, dosya: yol, ayrinti: `izlenen ikili veritabanı (.${uzanti(yol)})` })
        }
      }
    }
    const veriYolu = [...kumeler].find((y) => VERI_UZANTILARI.includes(uzanti(y)))
    if (veriYolu) {
      if (b.boyut > BUYUK_DOSYA_SINIRI) olculemedi.push({ dosya: veriYolu, ayrinti: `veri blob'u çok büyük (${b.boyut} bayt); taranamadı` })
      else okunacak.push({ sha, yol: veriYolu, boyut: b.boyut })
    }
  }
  let toplam = 0
  for (const o of okunacak) toplam += o.boyut
  if (toplam > okumaTavani) throw new Error(`okunacak veri blob'ları tavanı aştı (${toplam} > ${okumaTavani} bayt); taranamadı`)
  let veriBlob = 0
  // 64 MB'lık gruplar halinde oku
  for (let bas = 0; bas < okunacak.length; ) {
    let grupBayt = 0
    const grup = []
    while (bas < okunacak.length && (grup.length === 0 || grupBayt + okunacak[bas].boyut <= 64 * 1024 * 1024)) {
      grup.push(okunacak[bas])
      grupBayt += okunacak[bas].boyut
      bas++
    }
    const cikti = git(kok, env, ['cat-file', '--batch'], `${grup.map((g) => g.sha).join('\n')}\n`)
    let konum = 0
    for (const g of grup) {
      const nl = cikti.indexOf(0x0a, konum)
      const baslik = cikti.toString('utf8', konum, nl).split(' ')
      const boyut = Number(baslik[2])
      if (baslik[1] !== 'blob' || !Number.isFinite(boyut)) throw new Error(`blob okunamadı: ${g.yol}`)
      const icerik = metneCevir(cikti.subarray(nl + 1, nl + 1 + boyut))
      konum = nl + 1 + boyut + 1
      veriBlob++
      if (icerik.includes(String.fromCharCode(0))) {
        olculemedi.push({ dosya: g.yol, ayrinti: "veri blob'unda NUL baytı (BOM'suz UTF-16 ya da ikili içerik); okunamadı" })
        continue
      }
      const d = dosyaDegerlendir(g.yol, icerik)
      for (const x of d.bulgular) kaydet({ kural: x.kural, ad: KURALLAR[x.kural], dosya: g.yol, ayrinti: x.ayrinti })
      for (const o of d.olculemedi) olculemedi.push({ dosya: g.yol, ayrinti: o })
    }
  }
  return { ihlaller, izinliler, olculemedi, taranan: { dosya: tumSha.length, veri: veriBlob, blob: blobSayisi } }
}

// ── Komut satırı ────────────────────────────────────────────────────────────────────────────────

/** GitHub Actions ek açıklaması için özellik değeri kaçışı. */
const kacis = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A').replace(/:/g, '%3A').replace(/,/g, '%2C')

/** pre-push stdin'inden itilecek yerel uçlar (silme satırları `0000…` atlanır). */
function itilecekUclar(stdin) {
  const uclar = new Set()
  for (const satir of String(stdin || '').split(/\r?\n/)) {
    const p = satir.trim().split(/\s+/)
    if (p.length >= 2 && /^[0-9a-f]{40,64}$/.test(p[1]) && !/^0+$/.test(p[1])) uclar.add(p[1])
  }
  return [...uclar]
}

/**
 * CLI gövdesi. Süreci sonlandırmaz, çıkış kodunu döner (test edilebilir).
 * @param {string[]} argv @param {{cwd?:string, env?:object, yaz?:(s:string)=>void, hata?:(s:string)=>void, izin?:ReadonlyArray<object>, stdin?:string}} [ortam]
 */
function calistir(argv, ortam = {}) {
  const cwd = ortam.cwd || process.cwd()
  const env = ortam.env || process.env
  const yaz = ortam.yaz || ((s) => process.stdout.write(`${s}\n`))
  const hata = ortam.hata || ((s) => process.stderr.write(`${s}\n`))
  const izin = ortam.izin || IZIN_LISTESI
  let kok = cwd
  let yeniUc = null
  let haric = []
  let prePush = false
  const kullanim = '(kullanım: node scripts/security/depo-dokum-kapisi.cjs [--kok <dizin>] [--yeni-nesneler <uç> [--haric <ref>]] [--pre-push])'
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--kok') {
      if (!argv[i + 1]) {
        hata('Çalıştırma hatası: --kok bir dizin ister.')
        return 2
      }
      kok = path.resolve(cwd, argv[++i])
    } else if (argv[i] === '--yeni-nesneler') {
      if (!argv[i + 1]) {
        hata('Çalıştırma hatası: --yeni-nesneler bir uç (commit/ref) ister.')
        return 2
      }
      yeniUc = argv[++i]
    } else if (argv[i] === '--haric') {
      if (!argv[i + 1]) {
        hata('Çalıştırma hatası: --haric bir ref ister.')
        return 2
      }
      haric.push(argv[++i])
    } else if (argv[i] === '--pre-push') {
      prePush = true
    } else {
      hata(`Çalıştırma hatası: bilinmeyen argüman: ${argv[i]}  ${kullanim}`)
      return 2
    }
  }
  if (haric.length > 0 && !yeniUc) {
    hata('Çalıştırma hatası: --haric yalnız --yeni-nesneler ile kullanılır.')
    return 2
  }

  const sonuclar = []
  let etiket = 'ağaç'
  try {
    if (prePush) {
      etiket = 'itilecek nesneler'
      const stdin = ortam.stdin !== undefined ? ortam.stdin : fs.readFileSync(0, 'utf8')
      const uclar = itilecekUclar(stdin)
      if (uclar.length === 0) {
        yaz('Depo döküm kapısı (pre-push): itilecek yeni uç yok (silme ya da boş girdi); taranacak şey yok.')
        return 0
      }
      sonuclar.push(yeniNesneleriTara({ kok, ucler: uclar, env, izin }))
    } else if (yeniUc) {
      etiket = 'yeni nesneler'
      sonuclar.push(yeniNesneleriTara({ kok, ucler: [yeniUc], haric, env, izin }))
    } else {
      const dosyalar = gitDosyalari(kok, env)
      if (dosyalar.length === 0) {
        hata('Çalıştırma hatası: git ls-files hiç dosya döndürmedi (boş evren ölçüm değildir). Kapı YEŞİL VERMEZ.')
        return 2
      }
      sonuclar.push(tara({ dosyalar, oku: diskOkuyucu(kok), izin, ikili: sqliteImzasiMi(kok) }))
      // GitHub Actions pull_request + tam geçmiş: PR'ın ara commit'lerindeki (sonradan silinenler dahil) nesneler de taranır.
      if (env.GITHUB_EVENT_NAME === 'pull_request') {
        const sig = git(kok, env, ['rev-parse', '--is-shallow-repository']).toString('utf8').trim()
        let ebeveyn2 = false
        try {
          git(kok, env, ['rev-parse', '--verify', '--quiet', 'HEAD^2'])
          ebeveyn2 = true
        } catch {
          ebeveyn2 = false
        }
        if (sig === 'false' && ebeveyn2) {
          sonuclar.push(yeniNesneleriTara({ kok, ucler: ['HEAD'], haric: ['HEAD^1'], env, izin }))
          etiket = 'ağaç + PR ara commit\'leri'
        } else {
          yaz('Not: PR ara commit taraması atlandı (depo sığ ya da birleşme commit\'i değil); `fetch-depth: 0` ister. Yalnız ağaç tarandı.')
        }
      }
    }
  } catch (e) {
    hata(`Çalıştırma hatası (ölçülemedi — bu ihlal DEĞİL, kapı yeşil de vermez): ${e && e.message ? e.message : e}`)
    return 2
  }

  const toplam = { ihlaller: [], izinliler: [], olculemedi: [], dosya: 0, veri: 0 }
  for (const s of sonuclar) {
    toplam.ihlaller.push(...s.ihlaller)
    toplam.izinliler.push(...s.izinliler)
    toplam.olculemedi.push(...s.olculemedi)
    toplam.dosya += s.taranan.dosya
    toplam.veri += s.taranan.veri
  }
  const actions = env.GITHUB_ACTIONS === 'true'
  for (const z of toplam.izinliler) yaz(`IZINLI ${z.kural} ${z.ad}  ${z.dosya}  [${z.ayrinti}]`)
  for (const v of toplam.ihlaller) {
    if (actions) yaz(`::error file=${kacis(v.dosya)},title=Depo döküm kapısı::${v.kural} ${v.ad} — ${kacis(v.ayrinti)}`)
    else yaz(`IHLAL ${v.kural} ${v.ad}  ${v.dosya}  [${v.ayrinti}]`)
  }
  for (const o of toplam.olculemedi) {
    if (actions) yaz(`::error file=${kacis(o.dosya)},title=Depo döküm kapısı::OLCULEMEDI — ${kacis(o.ayrinti)}`)
    else yaz(`OLCULEMEDI  ${o.dosya}  [${o.ayrinti}]`)
  }
  yaz(
    `Depo döküm kapısı (${etiket}): ${toplam.dosya} ${prePush || yeniUc ? 'nesne' : 'izlenen dosya'}, ${toplam.veri} veri dosyası tarandı; ` +
      `ihlal ${toplam.ihlaller.length}, izinli ${toplam.izinliler.length}, ölçülemedi ${toplam.olculemedi.length}.`,
  )
  if (toplam.ihlaller.length > 0) {
    yaz('')
    yaz('Bu dosyalar herkese açık depoya giremez (kişisel veri, ödeme parçası, fiyat/maliyet dökümü, ikili veritabanı). Ne yapılır:')
    yaz("  1) İzlemeyi bırak, yerel kopya kalsın:  git rm --cached -- '<dosya>'  ve  .gitignore'a kalıp ekle.")
    yaz('  2) Test verisi gerekiyorsa GERÇEK dökümün ARINDIRILMIŞ kopyasını kullan (her satır bağımsız sentetik değer, yapı aynı).')
    yaz('  3) Dosya GİT GEÇMİŞİNDE ya da itilecek commit\'lerde zaten varsa silmek ayrı iştir: ALT-41 (Recep teyidiyle). Burada geçmiş yeniden yazılmaz.')
    yaz('  Cetvel: docs/standards/depoya-giremeyecek-veri-standard.md')
    return 1
  }
  if (toplam.olculemedi.length > 0) {
    yaz('')
    yaz('Ölçülemeyen dosya var: bu İHLAL DEĞİL ama kapı yeşil de vermez (başlıksız/ayrıştırılamayan veri dosyası). Dosyayı gözle incele;')
    yaz('başlık ekle ya da dosyayı veri uzantısından çıkar. Cetvel: docs/standards/depoya-giremeyecek-veri-standard.md')
    return 2
  }
  return 0
}

module.exports = {
  VERI_UZANTILARI,
  BUYUK_DOSYA_SINIRI,
  NESNE_TAVANI,
  OKUMA_TAVANI,
  KISISEL_ALANLAR,
  KISISEL_GENEL_ALANLAR,
  KISISEL_ESIK,
  HASSAS_TABLOLAR,
  KIMLIK_ANAHTARLARI,
  FIYAT_KOKLERI,
  FIYAT_ESIGI,
  KURALLAR,
  YOL_KURALLARI,
  R6_UZANTILARI,
  IZIN_KURALLARI,
  IZIN_LISTESI,
  norm,
  yolIhlali,
  sayiyaCevir,
  pozitifSayi,
  doluMu,
  metneCevir,
  csvAyristir,
  sqlIfadeleri,
  sqlBol,
  veriIfadesiTuru,
  dosyaTara,
  dosyaDegerlendir,
  tara,
  yeniNesneleriTara,
  itilecekUclar,
  diskOkuyucu,
  calistir,
}

if (require.main === module) {
  process.exitCode = calistir(process.argv.slice(2))
}
