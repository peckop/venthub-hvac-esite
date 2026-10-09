/**
 * ADRES ÖNİZLEMESİ KİPİ — `node scripts/onizleme.mjs [dal] --adres` için yardımcılar (ALT-37c; Cuma 9 Ekim ADRES
 * önizlemesi, karar 68, adres planı rec-adres-agac-tek-yayin Faz 4).
 *
 * NİÇİN VAR: yeni adres şeması canlıda iki derleme sabiti arkasında KAPALI:
 *   · `ADRES_SEMASI_K3B` (src/config/features.ts) — eski ürün/kategori adresini yeni adrese çeviren harita kolu;
 *   · `NEXT_PUBLIC_ADRES_DILI=1` (derleme env'i) — rota dili tablosu (hakkimizda, sss, yasal/...).
 * K3B'yi açmak "geri dönüşsüz adım"dır (Faz 3-C; yalnız Recep "gördüm, tamam" dedikten sonra). Bu yüzden bayrak
 * HİÇBİR dalda değişmez: yalnız ön izleme ağacında (ayrık commit) yamalanır, derleme biter bitmez geri alınır.
 * Kimsenin çalışma kopyası, dalı ya da canlı ortam etkilenmez; iş sonunda ön izleme ağacı da temizdir.
 *
 * İÇİNDEKİLER: yama tablosu (YAMALAR) · yama uygula/geri al · tıklama listesi okuyucu · ön kontrol (17 adres) ·
 * tam tarama özeti · derleme izi (aynı commit + aynı kip yeniden derlenmez) · kaynak seçimi (yerel dal mı origin mi,
 * hangisi yeni).
 * Ağ, git ve dosya erişimi çağırandan ENJEKTE edilir ya da dar tutulur: testler gerçek sunucu istemez.
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import net from 'node:net'
import path from 'node:path'

const require = createRequire(import.meta.url)

/** Kipin sürümü: yama mantığı ya da derleme adımları değişince artır (eski derleme izi geçersiz sayılır). */
const KIP_SURUMU = 1

/** Üretilen harita çıktısı (haritaKaynagi.ts başlığındaki Faz 3-C yolu) ve içinde durduğu dizin. */
export const URETILEN_DIZIN = 'src/data/generated'
export const HARITA_DOSYASI = `${URETILEN_DIZIN}/eski-adres-haritasi.json`

/**
 * ÖN İZLEME AĞACINDA uygulanan yerel yamalar. Her yama TEK satırdır; `bul` kaynakta TAM BİR kez geçmelidir
 * (aksi durumda kaynak değişmiş demektir ve betik DURUR: sessizce yamasız derleme "bayrak açık" gibi görünmesin).
 * `yaz` zaten kaynaktaysa (Faz 3-C birleşti) yama atlanır. Bekçi: onizleme-adres-kipi.test.ts (hedefler gerçek
 * dosyada tam bir kez bulunur).
 */
export const YAMALAR = Object.freeze([
  Object.freeze({
    dosya: 'src/config/features.ts',
    bul: 'export const ADRES_SEMASI_K3B = false',
    yaz: 'export const ADRES_SEMASI_K3B = true',
  }),
  // haritaKaynagi.ts başlığında yazılı Faz 3-C biçimi; harita dosyası derlemeden hemen önce üretilir. İçe aktarma,
  // `next build`in ESLint kuralı (simple-import-sort) gereği göreli içe aktarmadan ÖNCE gelir (ölçüldü: sonra
  // gelirse derleme "Run autofix to sort these imports" ile düşer).
  Object.freeze({
    dosya: 'src/lib/adres/haritaKaynagi.ts',
    bul: "import type { EskiAdresHaritaDosyasi } from './haritaTipi'",
    yaz: "import uretilmis from '@/data/generated/eski-adres-haritasi.json'\n\nimport type { EskiAdresHaritaDosyasi } from './haritaTipi'",
  }),
  Object.freeze({
    dosya: 'src/lib/adres/haritaKaynagi.ts',
    bul: 'export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi | null = null',
    yaz: 'export const ESKI_ADRES_HARITASI: EskiAdresHaritaDosyasi | null = uretilmis as EskiAdresHaritaDosyasi',
  }),
])

/** Yama tablosunun parmak izi: tablo ya da kip sürümü değişirse eski derleme yeniden kullanılmaz. */
export function yamaOzeti() {
  return createHash('sha256').update(`${KIP_SURUMU}\n${JSON.stringify(YAMALAR)}`).digest('hex').slice(0, 16)
}

/** `parca`nın boş olmayan her satırı metinde TAM (kırpılmış) bir satır olarak var mı? Yorum satırları eşleşmez. */
function kodSatiriVar(metin, parca) {
  const satirlar = new Set(metin.split(/\r?\n/).map((s) => s.trim()))
  return parca
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .every((s) => satirlar.has(s))
}

/**
 * Bir yamayı metne uygular. Saf fonksiyon.
 * @returns {{metin: string, durum: 'uygulandi' | 'zaten'}}
 */
export function yamaUygula(metin, yama) {
  // ÖNCE "zaten uygulanmış mı": bazı yamaların `yaz` metni `bul`u da içerir (içe aktarma satırının önüne satır eklemek);
  // sırayı ters kurmak ikinci koşumda satırı ikinci kez eklerdi. Denetim SATIR düzeyindedir, alt dizgi değil:
  // haritaKaynagi.ts başlığındaki yorum `yaz` metnini aynen taşır (ölçüldü) ve alt dizgi denetimi yamayı
  // "zaten uygulanmış" sanıp atlatırdı = bayrak açık, harita bağlı DEĞİL, bütün eski adresler sessizce 404.
  if (kodSatiriVar(metin, yama.yaz)) return { metin, durum: 'zaten' }
  const bulunan = metin.split(yama.bul).length - 1
  // Dosya CRLF ise eklenen satır sonları da CRLF olur (karışık satır sonu bırakma).
  const yaz = metin.includes('\r\n') ? yama.yaz.replace(/\n/g, '\r\n') : yama.yaz
  if (bulunan === 1) return { metin: metin.replace(yama.bul, () => yaz), durum: 'uygulandi' }
  throw new Error(
    `${yama.dosya}: yama hedefi "${yama.bul}" ${bulunan} kez bulundu (tam 1 olmalı) — kaynak değişmiş; ` +
      'scripts/adres/onizleme-adres.mjs YAMALAR tablosunu güncelle'
  )
}

/**
 * Bütün yamaları ağaca uygular. İKİ AŞAMALI: önce hepsi hesaplanır (biri patlarsa hiçbir dosya yazılmaz), sonra yazılır.
 * @returns {{dosya: string, durum: 'uygulandi' | 'zaten'}[]}
 */
export function yamalariUygula(agac) {
  const dosyalar = [...new Set(YAMALAR.map((y) => y.dosya))]
  const hesaplanan = dosyalar.map((dosya) => {
    const yol = path.join(agac, dosya)
    let metin = fs.readFileSync(yol, 'utf8')
    const durumlar = []
    // Aynı dosyadaki yamalar tablo sırasıyla BELLEKTE art arda uygulanır, dosya bir kez yazılır.
    for (const yama of YAMALAR.filter((y) => y.dosya === dosya)) {
      const s = yamaUygula(metin, yama)
      metin = s.metin
      durumlar.push(s.durum)
    }
    return { dosya, yol, metin, durumlar }
  })
  for (const h of hesaplanan) if (h.durumlar.includes('uygulandi')) fs.writeFileSync(h.yol, h.metin)
  return hesaplanan.flatMap((h) => h.durumlar.map((durum) => ({ dosya: h.dosya, durum })))
}

/**
 * Önceki koşumdan kalan yamaları ve üretilen haritayı geri alır. İdempotent (temiz ağaçta hiçbir şey yapmaz).
 *
 * ⛔HEDEFE ÖNCE BAKILIR (geri alma ezme değildir):
 *   · bir kaynak dosyası YALNIZ içeriği tam "HEAD + yama tablosu" ise `git checkout` ile geri alınır; HEAD'e eşitse
 *     zaten temizdir; ikisinden de farklıysa (elle değişiklik) DOKUNULMAZ ve `atlanan`a yazılır — çağıranın "kirli"
 *     denetimi ağacı durdurur, elle yazılmış iş kaybolmaz.
 *   · üretilen harita dosyası YALNIZ git izlemiyorsa silinir (Faz 3-C birleşip dosya git'e girerse dokunulmaz);
 *     dizinin geri kalanına dokunulmaz, boş kalırsa kaldırılır.
 * @param {string} agac ön izleme ağacı
 * @param {(argumanlar: string[], cwd: string) => {kod: number | null, cikti: string, hata: string}} git
 * @returns {{geriAlinan: string[], atlanan: string[]}}
 */
export function yamalariGeriAl(agac, git) {
  const sonuc = { geriAlinan: [], atlanan: [] }
  if (!fs.existsSync(path.join(agac, '.git'))) return sonuc
  const norm = (s) => String(s).replace(/\r\n/g, '\n').trim()
  for (const dosya of new Set(YAMALAR.map((y) => y.dosya))) {
    const yol = path.join(agac, dosya)
    if (!fs.existsSync(yol)) continue
    const head = git(['show', `HEAD:${dosya}`], agac)
    if (head.kod !== 0) {
      sonuc.atlanan.push(dosya) // HEAD'de okunamadı: neyi geri alacağımızı bilmiyoruz
      continue
    }
    const mevcut = norm(fs.readFileSync(yol, 'utf8'))
    if (mevcut === norm(head.cikti)) continue // zaten temiz
    let yamali = null
    try {
      yamali = norm(YAMALAR.filter((y) => y.dosya === dosya).reduce((metin, y) => yamaUygula(metin, y).metin, head.cikti))
    } catch {
      // HEAD'de yama hedefi yok (Faz 3-C birleşik): yamalı hal tanımsız, dosya HEAD'den farklıysa elle değişiklik sayılır
    }
    if (mevcut !== yamali) {
      sonuc.atlanan.push(dosya)
      continue
    }
    const r = git(['checkout', '--', dosya], agac)
    if (r.kod !== 0) throw new Error(`yama geri alınamadı (${dosya}): ${r.hata}`)
    sonuc.geriAlinan.push(dosya)
  }
  const harita = path.join(agac, ...HARITA_DOSYASI.split('/'))
  if (fs.existsSync(harita) && git(['ls-files', '--', HARITA_DOSYASI], agac).cikti === '') fs.rmSync(harita, { force: true })
  const dizin = path.join(agac, ...URETILEN_DIZIN.split('/'))
  if (fs.existsSync(dizin) && fs.readdirSync(dizin).length === 0) fs.rmdirSync(dizin)
  return sonuc
}

// ── Tıklama listesi (Recep'in 17 adresi) ─────────────────────────────────────────────────────────

const TIKLAMA_LISTESI_DESENI = /^onizleme-tiklama-listesi-.*\.md$/

/** En yeni tıklama listesi belgesi (dosya adındaki tarih sıralar); yoksa null. */
export function tiklamaListesiBul(agac) {
  const dizin = path.join(agac, 'docs', 'plans')
  if (!fs.existsSync(dizin)) return null
  const adaylar = fs.readdirSync(dizin).filter((f) => TIKLAMA_LISTESI_DESENI.test(f)).sort()
  return adaylar.length > 0 ? path.join(dizin, adaylar[adaylar.length - 1]) : null
}

/**
 * Belgedeki tabloyu okur: `| no | \`eski\` | \`yeni\` | ne görmelisin |`. Yeni sütununda adres yoksa (bekleyen satır) `yeni`
 * null olur. Eski ile yeni AYNIYSA adres değişmemelidir (satır 9).
 * @returns {{no: number, eski: string, yeni: string | null}[]}
 */
export function tiklamaListesiOku(metin) {
  const liste = []
  const adres = (hucre) => {
    const m = /`([^`]+)`/.exec(hucre)
    return m && m[1].startsWith('/') ? m[1] : null
  }
  for (const satir of String(metin).split(/\r?\n/)) {
    const m = /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/.exec(satir)
    if (!m) continue
    const eski = adres(m[2])
    if (eski === null) continue
    liste.push({ no: Number(m[1]), eski, yeni: adres(m[3]) })
  }
  return liste
}

// ── Ön kontrol ───────────────────────────────────────────────────────────────────────────────────

const TEK_SICRAMA = new Set([307, 308])

function yolEs(a, b) {
  const duz = (s) => {
    try {
      return decodeURI(String(s)).replace(/\/+$/, '') || '/'
    } catch {
      return String(s)
    }
  }
  return duz(a) === duz(b)
}

function izOzeti(satir) {
  return `${satir.zincir.join('→')} ${satir.sonUrl}`
}

/**
 * Tek satırın ön kontrolü. `izle(adres)` → matris.cjs `adresiIzle` satırı (enjekte edilir).
 *  · yeni adres yok (bekleyen)  → BEKLIYOR (gerçek cevap yazılır, hata sayılmaz); ölçülemediyse HATA
 *  · eski == yeni (değişmez)    → yönlendirmesiz 200
 *  · taşınan adres              → eski adres TEK sıçrama (307/308) ile yeni adrese, orada 200; yeni adres de doğrudan 200
 * @returns {Promise<{no: number, eski: string, yeni: string | null, durum: 'TAMAM' | 'KIRMIZI' | 'HATA' | 'BEKLIYOR', ayrinti: string}>}
 */
export async function kontrolEt(k, izleTek) {
  // Soğuk sunucuda ilk istek zaman aşımına düşebilir (sayfa ilk istekte üretilir): ölçülemeyen adres BİR kez daha denenir.
  const izle = async (adres) => {
    const ilk = await izleTek(adres)
    return ilk.hata ? izleTek(adres) : ilk
  }
  const taban = { no: k.no, eski: k.eski, yeni: k.yeni }
  const eski = await izle(k.eski)
  if (eski.hata) return { ...taban, durum: 'HATA', ayrinti: `ölçülemedi (2 deneme): ${eski.hata}` }
  if (k.yeni === null) return { ...taban, durum: 'BEKLIYOR', ayrinti: `${izOzeti(eski)} (yeni ağaç #1352 bekliyor)` }
  if (k.yeni === k.eski) {
    const iyi = eski.hop === 0 && eski.sonDurum === 200
    return { ...taban, durum: iyi ? 'TAMAM' : 'KIRMIZI', ayrinti: `değişmemeli, yönlendirmesiz 200 beklenir; gerçek: ${izOzeti(eski)}` }
  }
  const yeni = await izle(k.yeni)
  if (yeni.hata) return { ...taban, durum: 'HATA', ayrinti: `yeni adres ölçülemedi (2 deneme): ${yeni.hata}` }
  const tekSicrama = eski.hop === 1 && eski.ilk !== null && TEK_SICRAMA.has(eski.ilk.durum) && yolEs(eski.sonUrl, k.yeni) && eski.sonDurum === 200
  const dogrudan = yeni.hop === 0 && yeni.sonDurum === 200
  if (tekSicrama && dogrudan) return { ...taban, durum: 'TAMAM', ayrinti: `${izOzeti(eski)}; yeni adres doğrudan ${yeni.sonDurum}` }
  const sorunlar = []
  if (!tekSicrama) sorunlar.push(`eski adres: tek sıçrama (307/308) → ${k.yeni} → 200 beklenir; gerçek: ${izOzeti(eski)}`)
  if (!dogrudan) sorunlar.push(`yeni adres: doğrudan 200 beklenir; gerçek: ${izOzeti(yeni)}`)
  return { ...taban, durum: 'KIRMIZI', ayrinti: sorunlar.join(' | ') }
}

/** Listedeki her adresi sırayla kontrol eder (17 adres: sıralı istek yeter, sunucuyu yormaz). */
export async function onKontrol(liste, izle) {
  const sonuclar = []
  for (const k of liste) sonuclar.push(await kontrolEt(k, izle))
  return sonuclar
}

export function onKontrolOzeti(sonuclar) {
  const say = (d) => sonuclar.filter((s) => s.durum === d).length
  return { toplam: sonuclar.length, tamam: say('TAMAM'), kirmizi: say('KIRMIZI'), hata: say('HATA'), bekliyor: say('BEKLIYOR') }
}

/** Terminale basılan tablo. */
export function onKontrolTablosu(sonuclar) {
  const o = onKontrolOzeti(sonuclar)
  const satirlar = sonuclar.map((s) => `${String(s.no).padStart(2)}  ${s.durum.padEnd(8)} ${s.eski}  →  ${s.ayrinti}`)
  return [
    `ÖN KONTROL (Recep'in tıklama listesi, ${o.toplam} adres, yerel sunucuya GET):`,
    ...satirlar,
    `ÖZET: ${o.tamam} tamam · ${o.kirmizi} kırmızı · ${o.hata} ölçülemedi · ${o.bekliyor} bekliyor (yeni kategori ağacı #1352)`,
  ].join('\n')
}

/**
 * Sunucu `/tr` isteğine cevap verene kadar bekler (en çok `sureMs`). `getir(url)` bağlantı reddedilirse atar.
 * @returns {Promise<boolean>}
 */
export async function hazirBekle(taban, { getir, uyu = (ms) => new Promise((r) => setTimeout(r, ms)), sureMs = 90_000, aralikMs = 1000 }) {
  const deneme = Math.max(1, Math.ceil(sureMs / aralikMs))
  for (let i = 0; i < deneme; i++) {
    try {
      const y = await getir(`${taban}/tr`)
      if (y.durum < 500) return true
    } catch {
      // sunucu henüz dinlemiyor
    }
    await uyu(aralikMs)
  }
  return false
}

/** matris.cjs'in gerçek ağ istemcisi ve izleyicisi (yalnız GET, elle yönlendirme, 10 sn zaman aşımı). */
export function gercekIzleyici(taban) {
  const { adresiIzle, ag } = require('./matris.cjs')
  return { ag, izle: (adres) => adresiIzle(adres, ag, taban) }
}

// ── Tam tarama özeti ─────────────────────────────────────────────────────────────────────────────

/** Tam tarama betiğinin (CommonJS) giriş fonksiyonu: `ana(argv, {yaz, hata}) → çıkış kodu`. */
export function gercekTarayici() {
  return require('./onizleme-tarama.cjs').ana
}

/**
 * Tam taramanın çıktısından tabloyu atar: tablodan türeyen yüzlerce adres terminali boğar ve 17 adreslik ön kontrol
 * tablosunu gömer. Kalan: PİLOT LİSTE satırı, varsa SORUNLU SATIRLAR bölümü ve TARAMA özeti.
 * @param {unknown[]} yazilanlar
 * @returns {string[]}
 */
export function taramaOzetiSatirlari(yazilanlar) {
  return yazilanlar.map(String).filter((s) => !s.startsWith('| Grup |'))
}

/**
 * Tam taramayı çalıştırır, basılacak özeti döndürür. `tara` enjekte edilir (testler ağ istemez). Tarama betiğinin hata
 * mesajları (girdi okunamadı vb.) da özete girer: sessizce yutulmaz.
 * @param {string} taban
 * @param {(argumanlar: string[], bag: {yaz: (m: string) => void, hata: (m: string) => void}) => Promise<number>} [tara]
 * @returns {Promise<{kod: number, satirlar: string[]}>}
 */
export async function tamTarama(taban, tara = gercekTarayici()) {
  const yazilan = []
  const kod = await tara(['--taban', taban], { yaz: (m) => yazilan.push(m), hata: (m) => yazilan.push(m) })
  return { kod, satirlar: taramaOzetiSatirlari(yazilan) }
}

// ── Derleme izi: aynı commit + aynı kip yeniden derlenmez ───────────────────────────────────────

/** İz `.next/` içinde durur (git'in yok saydığı dizin): ağacı kirletmez. */
export function izYolu(agac) {
  return path.join(agac, '.next', 'onizleme-iz.json')
}

export function izOku(agac) {
  try {
    const j = JSON.parse(fs.readFileSync(izYolu(agac), 'utf8'))
    return j !== null && typeof j === 'object' ? j : null
  } catch {
    return null
  }
}

export function izYaz(agac, iz) {
  fs.mkdirSync(path.dirname(izYolu(agac)), { recursive: true })
  fs.writeFileSync(izYolu(agac), JSON.stringify({ ...iz, zaman: new Date().toISOString() }, null, 2) + '\n')
}

/**
 * İz bu kadar eskiyse yeniden derlenir: statik sayfalar derleme anındaki canlı veriyi taşır; sabah derlenmiş bir
 * çıktıyla öğleden sonra "güncel veri" diye gezilmesin. (İki gün önceki derlemenin yeniden kullanılması da engellenir.)
 */
export const IZ_OMRU_MS = 12 * 60 * 60 * 1000

/**
 * Derleme gerekli mi? İz yoksa, derleme çıktısı yoksa, commit, kip ya da yama parmak izi farklıysa, iz çok eski ya da
 * geleceğe işaret ediyorsa (saat kayması/bozuk dosya) EVET.
 *
 * ⚠KİP, ize YAZILIR çünkü `.next` kipler arasında paylaşılır: adres kipinde derlenmiş `.next`'i sonraki NORMAL koşum
 * yeniden kullanırsa, "normal" diye açılan önizleme sessizce yeni adres şemasını gösterirdi (ve tersi).
 * @param {{commit: string, adres: boolean, yamaOzeti: string, zaman?: string} | null} iz
 * @param {{commit: string, adres: boolean, yamaOzeti: string}} beklenen
 * @param {boolean} derlemeVar `.next/BUILD_ID` var mı
 * @param {{simdi?: number, omurMs?: number}} [secenek]
 */
export function derlemeGerekli(iz, beklenen, derlemeVar, { simdi = Date.now(), omurMs = IZ_OMRU_MS } = {}) {
  if (!derlemeVar || !iz) return true
  if (iz.commit !== beklenen.commit || iz.adres !== beklenen.adres || iz.yamaOzeti !== beklenen.yamaOzeti) return true
  const an = Date.parse(iz.zaman ?? '')
  return !Number.isFinite(an) || simdi - an > omurMs || an > simdi + 60_000
}

/** İzi siler: derleme BAŞLAMADAN önce çağrılır, yarım kalan derleme "geçerli" sayılmasın (iz yalnız başarıdan sonra yazılır). */
export function izSil(agac) {
  fs.rmSync(izYolu(agac), { force: true })
}

// ── Kaynak seçimi: yerel dal mı, origin mi? ─────────────────────────────────────────────────────

/**
 * Ön izlenecek commit'i seçer. Ölçülmüş kusur: ana deponun yerel `master`'ı origin'in gerisinde kalabilir ve eski
 * kod ön izlenirdi. Kural: ikisi de varsa YENİ OLAN (geride kalan yerel dal origin'e yerini bırakır; push edilmemiş
 * yerel iş önde sayılır ve korunur; ayrışmışsa yerel + uyarı).
 * @param {{yerel: string | null, uzak: string | null, iliski?: 'yerel-geride' | 'yerel-onde' | 'ayrik'}} g
 * @returns {{commit: string, kaynak: 'yerel' | 'uzak', uyari: string | null} | null}
 */
export function kaynakSec({ yerel, uzak, iliski }) {
  if (!yerel && !uzak) return null
  if (!uzak) return { commit: yerel, kaynak: 'yerel', uyari: null }
  if (!yerel) return { commit: uzak, kaynak: 'uzak', uyari: null }
  if (yerel === uzak) return { commit: yerel, kaynak: 'yerel', uyari: null }
  if (iliski === 'yerel-geride') return { commit: uzak, kaynak: 'uzak', uyari: 'yerel dal origin\'in gerisinde; origin ön izleniyor' }
  if (iliski === 'yerel-onde') return { commit: yerel, kaynak: 'yerel', uyari: null }
  return { commit: yerel, kaynak: 'yerel', uyari: 'yerel dal ile origin AYRIŞMIŞ; yerel dal ön izleniyor' }
}

/**
 * Yerel ve uzak commit'in birbirine göre durumu (`git merge-base --is-ancestor`: çıkış 0 evet, 1 hayır, başkası hata).
 * Hata (nesne yok vb.) "ayrık" sayılır: muhafazakâr yön, yerel dal + uyarı.
 * @param {(argumanlar: string[], cwd: string) => {kod: number | null}} git
 * @returns {'yerel-geride' | 'yerel-onde' | 'ayrik'}
 */
export function iliskiBul(git, depo, yerel, uzak) {
  if (git(['merge-base', '--is-ancestor', yerel, uzak], depo).kod === 0) return 'yerel-geride'
  if (git(['merge-base', '--is-ancestor', uzak, yerel], depo).kod === 0) return 'yerel-onde'
  return 'ayrik'
}

// ── Derleme hatası özeti ────────────────────────────────────────────────────────────────────────

/**
 * `next build` günlüğü yüzlerce uyarı satırı taşır ve hata satırı arada kaybolur (ölçüldü: 1029 satırlık günlükte TEK
 * hata). Yalnız hata satırlarını ve hangi dosyada olduklarını çıkarır: ESLint `Error:`, `Type error:`, `Module not found:`.
 * Uyarılar (`Warning:`) atılır. Ayrıştırılabilir satır yoksa günlüğün son 15 satırı verilir (boş cevap vermez).
 * @param {string} metin derleme çıktısı
 * @param {number} [enCok] listelenecek en çok hata satırı
 */
export function derlemeHatasiOzetle(metin, enCok = 12) {
  const satirlar = String(metin).split(/\r?\n/)
  const bulgular = []
  let dosya = null
  for (const ham of satirlar) {
    const s = ham.trim()
    if (/^\.\/[^\s:]+(:\d+:\d+)?$/.test(s)) {
      dosya = s
      continue
    }
    if (/^\d+:\d+\s+Error:/.test(s) || /^(Type error:|Module not found:)/.test(s)) bulgular.push(`${dosya ?? '?'}  ${s}`)
  }
  if (bulgular.length === 0) {
    return `DERLEME HATASI (ayrıştırılabilir hata satırı yok); günlüğün son satırları:\n${satirlar.filter((s) => s.trim() !== '').slice(-15).join('\n')}`
  }
  const fazla = bulgular.length - enCok
  return [
    `DERLEME HATASI (${bulgular.length} hata satırı):`,
    ...bulgular.slice(0, enCok).map((b) => `  ${b}`),
    ...(fazla > 0 ? [`  … ve ${fazla} satır daha (tam günlük yukarıda)`] : []),
  ].join('\n')
}

// ── Port ve ağaç kilidi ─────────────────────────────────────────────────────────────────────────

/** Port boş mu? `next start` ile aynı biçimde (adres belirtmeden) dinlemeyi dener; derleme 5 dk sürer, çakışma sonda patlamasın. */
export function portMusait(port) {
  return new Promise((coz) => {
    const sunucu = net.createServer()
    sunucu.once('error', () => coz(false))
    sunucu.once('listening', () => sunucu.close(() => coz(true)))
    sunucu.listen(port)
  })
}

/** Süreç yaşıyor mu? (`kill -0`: sinyal göndermez; EPERM = var ama bize ait değil = yaşıyor.) */
export function pidCanliMi(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return e.code === 'EPERM'
  }
}

/**
 * Kilit dosyası ağacın YANINDA durur (`<ağaç>.kilit`): `next build` `.next` içindeki her şeyi temizler, orada kalamaz.
 * NİÇİN: iki ön izleme aynı ağacı aynı anda yamalar/derlerse yamalar diğerinin derlemesine sızar (bayrak yalnız birinde
 * açık olmalıyken ikisinde açık olur) ve `.next` karışır.
 */
export function kilitYolu(agac) {
  return `${agac}.kilit`
}

/**
 * Kilidi atomik alır (`wx`). Sahibi ölü ya da içerik bozuksa kilit bayattır: silinir, bir kez daha denenir.
 * @returns {{alindi: boolean, sahip: number | null}} alınamadıysa `sahip` kilidi tutan canlı süreç
 */
export function kilitAl(agac, { pid = process.pid, canliMi = pidCanliMi } = {}) {
  const yol = kilitYolu(agac)
  for (let deneme = 0; deneme < 2; deneme++) {
    try {
      fs.writeFileSync(yol, String(pid), { flag: 'wx' })
      return { alindi: true, sahip: pid }
    } catch (e) {
      if (e.code !== 'EEXIST') throw e
      const sahip = Number(fs.readFileSync(yol, 'utf8').trim())
      if (Number.isInteger(sahip) && sahip > 0 && sahip !== pid && canliMi(sahip)) return { alindi: false, sahip }
      fs.rmSync(yol, { force: true })
    }
  }
  return { alindi: false, sahip: null }
}

/** Kilidi yalnız SAHİBİ bırakır (başkasının kilidi silinmez). */
export function kilitBirak(agac, pid = process.pid) {
  const yol = kilitYolu(agac)
  try {
    if (Number(fs.readFileSync(yol, 'utf8').trim()) === pid) fs.rmSync(yol, { force: true })
  } catch {
    // kilit yok
  }
}
