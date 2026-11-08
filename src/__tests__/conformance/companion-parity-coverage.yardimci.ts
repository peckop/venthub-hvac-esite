import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

/**
 * INV-DOC-2 · ORTAK YARDIMCI (ALT-38i parça 2). Test DEĞİLDİR (vitest yalnız `*.test.ts` toplar).
 *
 * `companion-parity-coverage.test.ts` iki dosyaya bölündü: PR kolu (o dosya, PR kapısında KALIR) ve dünya kolu
 * (`companion-parity-coverage-dunya.test.ts`, master push + zamanlı koşu). İki kol aynı ölçümü kullanır: tek kaynak
 * burasıdır, kopya yoktur. Burada yaşayanlar: sayaç modülü ve taşıyıcı anahtarı bağlantısı, eşik sabitleri, testin
 * KENDİ bağımsız (git tabanlı) hesabı, kolların ortak tutarlılık denetimleri ve PR'ın değiştirdiği kaynaklarla
 * sınırlı sayım (`prKisitliSayim`).
 *
 * Ortak dosya DEĞİLDİR: genel `_ortak/` yardımcısına dokunmaz; `prDegisenleri` ve `kapsamla` bu teste özgü sarmalayıcılardır
 * (okuyucu `scripts/ci/dunya-durumu.cjs` `degisenYollariniOku`dur, ikinci bir okuyucu yazılmadı).
 */

export interface Sayim {
  kaynakSayisi: number
  eksik: { yol: string; yasGun: number }[]
  bayat: string[]
  eksikTaze: number
  bayatTaze: number
  tarihselEksik: string[]
  tarihselBayat: string[]
  kapidakiKaynak: number
  enEskiYasGun: number
}

export interface YamlKapsam {
  koklerRecursive: string[]
  skipDirs: Set<string>
  skipBasenames: Set<string>
}

interface SayimModulu {
  olc: (o?: { kok?: string; bugun?: Date; yasEsigiGun?: number; kapiBaslangici?: string }) => Sayim
  sayimCekirdegi: (g: {
    izlenen: string[]
    kapsam: YamlKapsam
    tarihler: Map<string, string>
    bugun: Date
    yasEsigiGun: number
    kapiBaslangici: string
  }) => Sayim
  ozetSatiri: (b: Sayim) => string
  kapsamdaMi: (yol: string, k: YamlKapsam) => boolean
  YAS_ESIGI_GUN: number
  KAPI_BASLANGIC: string
}

interface AnahtarModulu {
  oku: (kok: string) => { durum: 'ACIK' | 'KAPALI'; yol: string; okundu: boolean; sebep: string }
  durumSatiri: (kok: string) => string
}

const require_ = createRequire(import.meta.url)
const SAYAC_YOLU = resolve(process.cwd(), 'scripts/hijyen/companion-sayim.cjs')
export const sayac = require_(SAYAC_YOLU) as SayimModulu

/** DEĞER modülden gelir (tek kaynak); gerekçe metni `companion-parity-coverage.test.ts` başlığında durur. */
export const YAS_ESIGI_GUN = sayac.YAS_ESIGI_GUN

/**
 * KAPI KAPSAMININ BAŞLANGIÇ TARİHİ — ölçülmüş bir kusurun düzeltmesi (2026-08-18).
 *
 * İLK TASARIM DRIFT EDİYORDU: borç "kaynak `YAS_ESIGI_GUN` günden eski + companion bayat"
 * diye sayılıyordu ve taban bir SAYI idi (C5=33). Sayı **takvim ilerledikçe kendiliğinden
 * büyüyor**: 2026-08-17'de 33 ölçüldü, ertesi gün hiçbir commit atılmadan 39 oldu. Ölçtüm —
 * fark tam 6 ve tam 6 dosyanın kaynak yaşı 8 gündü, yani 7 günlük eşiği O GECE geçmişlerdi.
 *
 * Yani kapı, kimse hiçbir şey yapmasa bile birkaç günde bir kırmızıya dönecekti. Bu bir
 * YANLIŞ-KIRMIZI ÜRETECİ ve tam olarak bu bekçinin cetvelinde uyardığım şey: "bekçi ilk
 * günden (ya da rastgele) kırmızı yanarsa görmezden gelinir" — bu depoda yaşandı, rastgele
 * patlayan `pre-commit` tüm filoda `--no-verify` alışkanlığı doğurdu (T033).
 *
 * ÇÖZÜM: eşiği "şimdi"ye değil KAPININ İNDİĞİ TARİHE demirle. Kapı yalnız **bu tarihten
 * sonra** dokunulan kaynakları denetler; daha eski borç TARİHSEL kabul edilir, kapsam
 * dışıdır ama GÖRÜNÜR kalır (dünya kolundaki tarihsel-borç testi sayıyı basar ve sıfırlanınca
 * demiri kaldırmaya zorlar). Böylece:
 *   · zaman geçmesi yeni ihlal ÜRETMEZ (drift kapandı)
 *   · yeni bir commit companion'ını bayat bırakırsa 7 gün sonra KIRMIZI (asıl amaç korundu)
 *   · tabanlar SIFIR olur — ratchet'in en güçlü hâli, sessiz bütçe yok
 *
 * DEĞER modülden gelir (tek kaynak); yukarıdaki gerekçe metni burada kalır.
 */
export const KAPI_BASLANGIC = sayac.KAPI_BASLANGIC

/**
 * C5 tabanı SIFIR: kapı yalnız KAPI_BASLANGIC sonrası dokunulan kaynakları denetliyor, yani
 * tarihsel borç kapsam dışı. Bu sayı HEDEF değil TAVAN ve YÜKSELTİLEMEZ — yükseltmek
 * "yeni borca izin ver" demektir. Tarihsel borç dünya kolundaki testte görünür kalıyor.
 * ⚠Taban yalnız taşıyıcı AÇIK iken hüküm kurar; uyku kipinde kol sayar ama bloklamaz.
 *
 * İki kol da (PR-kısıtlı ve TAM) bu TEK sabiti okur; ratchet testi (PR kolu) onun 0 kaldığını ölçer.
 */
export const C5_TABAN = 0

/**
 * ⭐UYKU KİPİ — TAŞIYICI ANAHTARI (REC-142, Recep kararı 2026-09-05).
 *
 * NİÇİN BU KOL ARTIK KOŞULLU: taşıyıcı 2026-08-28'de kapandı, ama companion'a bakan
 * kapılar açık kaldı. Aradaki çelişki her hafta başka bir koldan filoyu kilitledi
 * (09-03 C4, 09-04 INV-DOC-4b, 09-05 C5 — üçü de HİÇ COMMIT OLMADAN, yalnız takvim
 * ilerlediği için). Kök çözüm: davranış tek anahtardan TÜRESİN.
 *
 * ⚠NİÇİN "SİL" ÇÖZÜMÜ SEÇİLMEDİ — bu cetvelin eski hükmüydü ve ÖLÇÜMLE düştü:
 * cetvel "C5'in çaresi taşıyıcıya bağlı değil, companion silinebilir" diyordu. Tek
 * dosyada doğru. Ama 2026-09-05 ölçümü: bloklayan 8'in arkasında 7 günlük pencerede
 * **49** tane daha vardı — yani çare 57 belgeyi silmeye çıkıyordu ve ikizi o dosyalar
 * hakkında tamamen kör bırakacaktı. Bilgi yok ederek aynı "bloklamama" sonucuna varmak
 * olurdu. Recep kararı: belge üretimi bir süre durur, dönüşte KALDIĞIMIZ YERDEN devam
 * edilir — yani companion'lar YERİNDE KALIR.
 *
 * ⚠NİÇİN EŞİK UZATILMADI / KAPI SİLİNMEDİ: ikisi de bu dosyada zaten yazılı (7→30
 * ertelemedir; silinen kapı kapatılmış borç sanılır). Uyku kipi üçüncü yol: kapı yaşar,
 * sayar, adlarıyla raporlar — yalnız DURDURMAZ.
 *
 * ⭐C4_TABAN KALDIRILDI — C4 artık BLOKLAMIYOR (Recep kararı 2026-09-03).
 * NİÇİN: companion üretici taşıyıcının süresi 2026-08-28'de bitti ve Recep 08-31'de
 * "taşıyıcı KAPALI kalsın" dedi (abonelik maliyeti). Taşıyıcı kapalıyken C4 bir borcu
 * ÖNLEYEMEZ, yalnız CEZALANDIRIR: companion üretilemediği için her yeni kaynak dosya
 * 7 gün sonra tüm filoyu bloklar. Bu 2026-09-03'te ölçülerek yaşandı — bir dosya
 * (`DataTablePagination.tsx`) hiçbir commit olmadan, yalnız TAKVİM ilerlediği için
 * bütün açık PR'ları kırmızıya çevirdi.
 * ⚠NİÇİN EŞİK UZATILMADI: 7'yi 30'a çekmek aynı tuzağı ERTELER, kaldırmaz — 30. günde
 * aynı kilit gelir ve o gün sebebi hatırlayan kimse olmaz.
 * ⚠NİÇİN KAPI SİLİNMEDİ: borç GÖRÜNÜR kalmalı. Silinen kapı, kapatılmış borç sanılır.
 * Kalan biçim: SAY, ADLARIYLA RAPORLA, BLOKLAMA — "bilinen ve kabul edilmiş eksik".
 */
export const anahtar = require_(
  resolve(process.cwd(), 'scripts/hijyen/tasiyici-anahtari.cjs'),
) as AnahtarModulu
export const TASIYICI = anahtar.oku(process.cwd())
export const UYKUDA = TASIYICI.durum === 'KAPALI'

const KAYNAK_UZANTILARI = ['.ts', '.tsx', '.mjs', '.cjs']

export function git(args: string[]): string {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

/**
 * ⚠Bilinen sınır: `git ls-files` öntanımlı olarak ASCII dışı yolları tırnaklar (bugün 2 yol, ikisi de .png);
 * bir kaynak dosyanın adı ASCII dışı olursa hem sayaç modülünde hem burada kapsam dışı kalır ve PR'ın değişen
 * listesiyle eşleşmez. Bu davranış selefiyle AYNIDIR (kopya sayım ile modülün ayrışmaması için bilerek korunur).
 */
function izlenenDosyalar(): string[] {
  return git(['ls-files']).split('\n').map(s => s.trim()).filter(Boolean)
}

/**
 * Her izlenen dosyanın EN YENİ commit tarihini tek geçişte topla.
 *
 * Dosya başına `git log -1` çağırmak 600+ süreç doğurur ve testi dakikalara çıkarır
 * (ölçüldü: 2 dakikada bitmedi). `--name-only` tek geçişte aynı bilgiyi verir.
 */
function sonCommitTarihleri(): Map<string, string> {
  const ham = git(['log', '--format=@%cs', '--name-only', '--no-renames'])
  const harita = new Map<string, string>()
  let simdiki: string | null = null
  for (const satir of ham.split('\n')) {
    const s = satir.replace(/\r$/, '')
    if (s.startsWith('@')) {
      simdiki = s.slice(1)
    } else if (s.trim() && simdiki && !harita.has(s)) {
      harita.set(s, simdiki)
    }
  }
  return harita
}

/**
 * KAPSAM = `.cc_docs.yaml`'ın GERÇEK kapsamı (SSOT).
 * Bekçi kendi listesini uydurmaz; yaml'ın `source_dirs` + `extra_masters` −
 * `skip_dirs` − `skip_files` kümesini uygular. Niçin kritik: ilk ölçümümde `.agent/`
 * altındaki betikleri saydım ve 84/211 çıktı — oysa `.agent` yaml'da `skip_dirs`
 * içinde, yani doküman hattı oraya hiç bakmıyor. Bekçi üreticiden FARKLI kapsam
 * kullanırsa ölçtüğü şey gerçek değildir.
 */
function yamlKapsamiOku(): YamlKapsam {
  const metin = git(['show', 'HEAD:.cc_docs.yaml'])
  const liste = (anahtarAdi: string): string[] => {
    const m = new RegExp(`^${anahtarAdi}:\\s*\\[([^\\]]*)\\]`, 'm').exec(metin)
    if (!m) return []
    return m[1].split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
  }
  const sourceDirs = liste('source_dirs')
  // extra_masters girdileri tek satırlık obje listesi: {name: "...", source_dirs: "supabase/functions", ...}
  const extraKokler = [...metin.matchAll(/source_dirs:\s*"([^"]+)"/g)].map(m => m[1])

  return {
    koklerRecursive: [...sourceDirs.filter(d => d !== '.'), ...extraKokler],
    skipDirs: new Set(liste('skip_dirs')),
    skipBasenames: new Set(liste('skip_files').map(f => f.split('/').pop() as string)),
  }
}

function kapsamdaMi(yol: string, k: YamlKapsam): boolean {
  if (!KAYNAK_UZANTILARI.some(u => yol.endsWith(u))) return false
  if (yol.endsWith('.d.ts')) return false
  const parcalar = yol.split('/')
  const ad = parcalar[parcalar.length - 1]
  if (k.skipBasenames.has(ad)) return false
  if (parcalar.slice(0, -1).some(p => k.skipDirs.has(p))) return false
  if (k.koklerRecursive.some(kok => yol.startsWith(`${kok}/`))) return true
  return !yol.includes('/') // "." kökü: yalnız o seviye, recursive DEĞİL
}

function gunFarki(tarihISO: string, bugun: Date): number {
  const t = new Date(`${tarihISO}T00:00:00Z`).getTime()
  if (Number.isNaN(t)) return Number.MAX_SAFE_INTEGER
  return Math.floor((bugun.getTime() - t) / 86_400_000)
}

/** Kaynağın companion yolu: uzantı `.md` ile değişir (sayaç çekirdeğindeki dönüşümün aynısı). */
export function companionYolu(kaynak: string): string {
  return `${kaynak.replace(/\.[^./]+$/, '')}.md`
}

/** Testin KENDİ bağımsız hesabının girdileri: depodan (git) bir kez okunur. */
export interface Girdiler {
  izlenen: string[]
  tarihler: Map<string, string>
  kapsam: YamlKapsam
}

export function girdileriOku(): Girdiler {
  return { izlenen: izlenenDosyalar(), tarihler: sonCommitTarihleri(), kapsam: yamlKapsamiOku() }
}

export interface Bulgular {
  kaynakSayisi: number
  eksik: string[]
  bayat: string[]
  eksikTaze: number
  bayatTaze: number
  /** KAPI_BASLANGIC ONCESI borc: kapsam DISI ama gorunur tutuluyor. */
  tarihselEksik: string[]
  tarihselBayat: string[]
  /** Kapi kapsamindaki (demir sonrasi dokunulmus) kaynak sayisi. */
  kapidakiKaynak: number
}

/**
 * Testin BAĞIMSIZ sayımı: sayaç modülünün REFERANSI (§26'dan bilinçli sapma, gerekçe
 * `companion-parity-coverage.test.ts` başlığında). Modül bozulursa PR kolundaki "TEK KAYNAK" kolu kırmızı verir;
 * ikisi sessizce ayrışamaz. `bugun` DIŞARIDAN verilir: aynı dosyada iki hesap aynı saati kullanır (gece yarısı
 * sınırında iki ayrı `new Date()` bir kaynağı birinde eşik içi, ötekinde eşik dışı sayabilirdi).
 */
export function bagimsizOlc(g: Girdiler, bugun: Date): Bulgular {
  const mdSet = new Set(g.izlenen.filter(f => f.endsWith('.md')))
  const kaynaklar = g.izlenen.filter(f => kapsamdaMi(f, g.kapsam))
  const eksik: string[] = []
  const bayat: string[] = []
  const tarihselEksik: string[] = []
  const tarihselBayat: string[] = []
  let kapidakiKaynak = 0
  let eksikTaze = 0
  let bayatTaze = 0

  for (const kaynak of kaynaklar) {
    const companion = companionYolu(kaynak)
    const kaynakTarih = g.tarihler.get(kaynak) ?? ''
    const yas = kaynakTarih ? gunFarki(kaynakTarih, bugun) : Number.MAX_SAFE_INTEGER

    // Kapı kapsamı: KAPI_BASLANGIC sonrası dokunulmuş kaynaklar. Daha eskisi TARİHSEL borç
    // (kapsam dışı ama görünür) — bkz. KAPI_BASLANGIC yorumu, drift ölçümü orada.
    const kapidaMi = kaynakTarih >= KAPI_BASLANGIC
    if (kapidaMi) kapidakiKaynak++

    if (!mdSet.has(companion)) {
      if (yas <= YAS_ESIGI_GUN) eksikTaze++
      else if (kapidaMi) eksik.push(kaynak)
      else tarihselEksik.push(kaynak)
      continue
    }
    const companionTarih = g.tarihler.get(companion) ?? ''
    if (kaynakTarih && companionTarih && kaynakTarih > companionTarih) {
      if (yas <= YAS_ESIGI_GUN) bayatTaze++
      else if (kapidaMi) bayat.push(companion)
      else tarihselBayat.push(companion)
    }
  }

  return {
    kaynakSayisi: kaynaklar.length, eksik, bayat, eksikTaze, bayatTaze,
    tarihselEksik, tarihselBayat, kapidakiKaynak,
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// İki kolun ORTAK tutarlılık denetimleri. Hesabın kendi içinde bölüntü olup olmadığını ölçer (dünya durumuna bağlı değil);
// PR kolunda ayrı `it`ler olarak koşar, dünya kolunun uyku kipinde de koşar ki bloklamayan kol BOŞ kol olmasın.
// ---------------------------------------------------------------------------------------------------------------------

export const MESAJ = {
  c4EsikIci:
    `Listede eşik İÇİ (${YAS_ESIGI_GUN} gün ve altı) dosya var — taze pencere muafiyeti ` +
    'bozulmuş; sayaç asenkron üretim penceresini borç sayıyor.',
  c4EnEski: 'enEskiYasGun listeyle UYUŞMUYOR — rapor kendi verisiyle çelişiyor.',
  c5Kesisim:
    'Bir dosya hem C4 (eksik) hem C5 (bayat) sayılmış — sınıflandırma bölüntü değil, ' +
    'borç iki kez görünüyor.',
  c5MdDisi: 'C5 listesinde companion olmayan yol var — C4/C5 ayrımı bozulmuş.',
} as const

/** Modülün C4 listesinde eşik İÇİ (muaf olması gereken) dosyalar; boş = tutarlı. */
export function c4EsikIci(m: Sayim): string[] {
  return m.eksik.filter(e => e.yasGun <= YAS_ESIGI_GUN).map(e => e.yol)
}

/** `enEskiYasGun`un listeden beklenen değeri (liste yaşa göre azalan sıralıdır; boşsa 0). */
export function c4EnEskiBeklenen(m: Sayim): number {
  return m.eksik.length ? m.eksik[0].yasGun : 0
}

/**
 * Aynı dosya hem "eksik" hem "bayat" sayılamaz (sayılırsa borç iki kez raporlanır).
 * `b.eksik` KAYNAK yollarını, `b.bayat` COMPANION yollarını tutar — karşılaştırma için kaynak companion adına çevrilir.
 */
export function c5Kesisim(b: Bulgular): string[] {
  return b.bayat.filter(y => b.eksik.some(e => companionYolu(e) === y))
}

/** Listelenen her şey gerçekten bir companion (.md) olmalı; boş = tutarlı. */
export function c5MdDisi(b: Bulgular): string[] {
  return b.bayat.filter(y => !y.endsWith('.md'))
}

// ---------------------------------------------------------------------------------------------------------------------
// PR-KISITLI SAYIM
// ---------------------------------------------------------------------------------------------------------------------

/**
 * PR'ın değişen dosyaları: kanonik, POSIX, köke göreli yollar; okunamadıysa `null`.
 * Tek okuyucu `scripts/ci/dunya-durumu.cjs` `degisenYollariniOku`dur (CI'da `git diff --name-only -z --no-renames HEAD^1 HEAD`;
 * yerel kullanım ve testler `VENTHUB_DUNYA_DEGISEN_DOSYALAR=<dosya yolu>` ile elle verir; doluyken okunamıyorsa git'e DÜŞÜLMEZ).
 * Okuyucunun kendisi yüklenemese ya da fırlatsa da bu işlev FIRLATMAZ, `null` döner (yani çağıran TAM sayıma düşer).
 * ⚠Yerelde commit sonrası `HEAD^1..HEAD` yalnız SON commit'tir; çok commitli yerel dalda PR'ın tamamı için liste elle verilir.
 */
export function prDegisenleri(): string[] | null {
  try {
    const modul = require_(resolve(process.cwd(), 'scripts/ci/dunya-durumu.cjs')) as {
      degisenYollariniOku: () => string[] | null
    }
    const d = modul.degisenYollariniOku()
    return Array.isArray(d) ? d : null
  } catch {
    return null
  }
}

/**
 * `tumu` kümesini PR'ın değişen dosyalarına göre daraltır.
 * @param tumu     tam küme (taranabilecek her hedef)
 * @param anahtarFn  bir hedefin değişen listedeki yol karşılığı (kanonik, POSIX, köke göreli; ör. `(y) => y`)
 * @param degisen  verilmezse `prDegisenleri()` okunur. Açık `null` = "okunamadı" (varsayılan DEVREYE GİRMEZ).
 * @returns `degisen` okunamadıysa `{ liste: tumu (aynen), tam: true }`; okunduysa `{ liste: tumu ∩ değişen (tumu sırasında), tam: false }`.
 *   FAIL-CLOSED: "ölçemedim" asla boş kümeye çevrilmez; boş küme yalnız "liste okundu ve hiçbir hedefe dokunulmadı" iken olur.
 */
export function kapsamla<T>(
  tumu: T[],
  anahtarFn: (x: T) => string,
  degisen: string[] | null = prDegisenleri(),
): { liste: T[]; tam: boolean } {
  if (!Array.isArray(degisen)) return { liste: tumu, tam: true }
  const kume = new Set(degisen)
  return { liste: tumu.filter(x => kume.has(anahtarFn(x))), tam: false }
}

export interface PrKisitliSonuc {
  /** Modülün sayım çekirdeğinin çıktısı (PR'ın kaynaklarıyla sınırlı; `tam` ise tüm depo). */
  sayim: Sayim
  /** true = değişen liste okunamadı, daraltma YAPILMADI (tam sayım). */
  tam: boolean
  /** Daraltılan kümedeki kaynak sayısı (`tam` ise kapsamdaki TÜM kaynaklar). */
  prKaynak: number
}

/**
 * PR'IN DEĞİŞTİRDİĞİ KAYNAKLARLA SINIRLI SAYIM.
 *
 * SORU: "bu PR, companion'ı eksik/bayat bir kaynağı eşik yaşını aşana dek taşıdı mı?" Cevabı PR'ın dosyalarından doğar;
 * dokunulmamış kaynakların takvimle olgunlaşan borcu PR'ın değildir (o, dünya kolunda TAM sayımla görünür).
 * Sayım mantığı KOPYALANMAZ: girdi daraltılır ve modülün `sayimCekirdegi`si çağrılır (modül tek kaynak kalır).
 * Daraltma: izlenen kümeden kapsamdaki kaynaklar YALNIZ PR'ın dokunduklarına indirilir; `.md` dosyaları (companion varlığı
 * için) olduğu gibi kalır. Silinen kaynak izlenmediği için kendiliğinden düşer.
 *
 * FAIL-CLOSED: `degisen` null ise (okunamadı) daraltma YAPILMAZ, tüm depo sayılır (`tam: true`).
 */
export function prKisitliSayim(g: Girdiler & { degisen: string[] | null; bugun: Date }): PrKisitliSonuc {
  const kaynaklar = g.izlenen.filter(f => sayac.kapsamdaMi(f, g.kapsam))
  const { liste, tam } = kapsamla(kaynaklar, y => y, g.degisen)
  const secili = new Set(liste)
  const izlenen = tam ? g.izlenen : g.izlenen.filter(f => f.endsWith('.md') || secili.has(f))
  const sayim = sayac.sayimCekirdegi({
    izlenen,
    kapsam: g.kapsam,
    tarihler: g.tarihler,
    bugun: g.bugun,
    yasEsigiGun: YAS_ESIGI_GUN,
    kapiBaslangici: KAPI_BASLANGIC,
  })
  return { sayim, tam, prKaynak: liste.length }
}
