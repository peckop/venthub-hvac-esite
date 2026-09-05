import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * SAYAÇ MODÜLÜ — kullanıcıya görünen METİN ve panonun SAYISI buradan gelir (§26).
 *
 * NİÇİN AYRI MODÜL: C4 artık BLOKLAMIYOR, SAYIYOR (Recep kararı 2026-08-31: companion
 * üretici taşıyıcı KAPALI kalır). Sayı iki yerde gösterilecek — bu kolun çıktısında ve
 * `board.cjs yoklama` satırında. İki yere iki ayrı sayım yazmak §26'nın yasağıdır:
 * kullanıcıya görünen metin ölçütü TEKRAR ETMEZ, ondan ÜRETİLİR.
 *
 * ⭐NİÇİN TESTİN KENDİ HESABI YİNE DURUYOR (emirden bilinçli SAPMA, gerekçesi burada):
 * Emir "test ve board modülü çağırsın" diyordu; saf devretme tek uygulama bırakırdı ve
 * modül yanlış sayarsa kapı ile pano BİRLİKTE ve SESSİZCE yanlış olurdu — çapraz kontrol
 * kalmazdı. Bu depoda ölçülmüş ders şudur: paylaşılan tek ölçüt İKİ YÖNLÜ yanıltır
 * (dört ajan aynı ölçütü benimsedi, günde dört kez düzeltildi). Bu yüzden testin
 * bağımsız hesabı REFERANS olarak korunuyor ve modülle UYUŞTUĞU ölçülüyor. Modül
 * bozulursa bu kol kırmızı verir; ikisi sessizce ayrışamaz.
 * Eşik DEĞERLERİ tek kaynaktır (modülden okunur) — ayrışabilecek şey sayı değil, hesap.
 */
interface Sayim {
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

interface SayimModulu {
  olc: (o?: { kok?: string; bugun?: Date; yasEsigiGun?: number; kapiBaslangici?: string }) => Sayim
  sayimCekirdegi: (g: {
    izlenen: string[]
    kapsam: { koklerRecursive: string[]; skipDirs: Set<string>; skipBasenames: Set<string> }
    tarihler: Map<string, string>
    bugun: Date
    yasEsigiGun: number
    kapiBaslangici: string
  }) => Sayim
  ozetSatiri: (b: Sayim) => string
  YAS_ESIGI_GUN: number
  KAPI_BASLANGIC: string
}

const require_ = createRequire(import.meta.url)
const SAYAC_YOLU = resolve(process.cwd(), 'scripts/hijyen/companion-sayim.cjs')
const sayac = require_(SAYAC_YOLU) as SayimModulu

/**
 * INV-DOC-2 · Companion KAPSAM paritesi — eksik ve bayat companion birikmesin.
 *
 * INV-DOC-1 (companion-doc-parity.test.ts) ters yönü kapatıyor: kaynağı olmayan
 * companion = ikize giden AKTİF YANLIŞ BİLGİ. Bu bekçi bu yönü kapatıyor:
 *   • C4 — kaynağı var, companion'ı YOK  → ikiz o dosyayı hiç bilmez (bilgi boşluğu)
 *   • C5 — companion var ama kaynaktan ESKİ → ikiz dosyanın eski hâlini bilir
 *
 * NİÇİN AYRI BEKÇİ VE NİÇİN ŞİMDİ MÜMKÜN:
 * Cetvelin §C3'ü bu yönü bilerek kapsam dışı bırakmıştı ve gerekçesi SAĞLAMDI:
 * companion üretimi `post-commit`te ASENKRON, dolayısıyla "her kaynağın companion'ı
 * olmalı" kuralı taze commit'lerde yanlış-kırmızı üretir. Gerekçeyi çürütmüyoruz,
 * ÖLÇTÜK (2026-08-17) ve tasarımla aşıyoruz:
 *
 *   C4 eksik companion : 36 toplam →  1 tanesi 7 günden eski
 *   C5 bayat companion : 189 toplam → 34 tanesi 7 günden eski (34'ü 30 günden de eski)
 *
 * Yani gürültünün tamamı taze pencerede. YAŞ EŞİĞİ (7 gün) asenkron üretim penceresini
 * muaf tutar; eşiğin ötesinde kalan şey artık "henüz üretilmedi" değil, GERÇEK borçtur.
 * 34 dosyanın 30 günden eski olması bunu doğruluyor — o companion'lar üretilmeyi
 * beklemiyor, unutulmuş.
 *
 * NİÇİN RATCHET (sıfır değil):
 * Mevcut borç kapatılmadan kural tam-kapalı kurulamaz; tam-kapalı kurmak bekçiyi
 * ilk günden kırmızı bırakır ve kırmızı bekçi görmezden gelinir (bu depoda yaşandı:
 * rastgele patlayan pre-commit `--no-verify` alışkanlığı doğurdu). Ratchet borcu
 * DONDURUR: yeni borç eklenemez, azalınca taban düşürülür (stale-guard bunu zorlar).
 *
 * ÖLÇÜM KAYNAĞI = GIT, disk DEĞİL.
 * INV-DOC-1'in dersi burada da geçerli: "diskten sildim/ürettim ama commit etmedim"
 * durumunda disk taraması yanlış cevap verir; ikize giden şey DEPO hâlidir. Ayrıca
 * bugün ölçüldü: 17 companion diskte güncel ama git'te eskiydi. Bu AYRIŞMA kendisi
 * bir bulgu — ama bu bekçinin sorusu değil; bu bekçi depoyu ölçer.
 *
 * KAPSAM = `.cc_docs.yaml`'ın GERÇEK kapsamı (SSOT).
 * Bekçi kendi listesini uydurmaz; yaml'ın `source_dirs` + `extra_masters` −
 * `skip_dirs` − `skip_files` kümesini uygular. Niçin kritik: ilk ölçümümde `.agent/`
 * altındaki betikleri saydım ve 84/211 çıktı — oysa `.agent` yaml'da `skip_dirs`
 * içinde, yani doküman hattı oraya hiç bakmıyor. Bekçi üreticiden FARKLI kapsam
 * kullanırsa ölçtüğü şey gerçek değildir.
 */

/** DEĞER modülden gelir (tek kaynak); aşağıdaki gerekçe metni burada kalır. */
const YAS_ESIGI_GUN = sayac.YAS_ESIGI_GUN

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
 * dışıdır ama GÖRÜNÜR kalır (aşağıdaki tarihsel-borç testi sayıyı basar ve sıfırlanınca
 * demiri kaldırmaya zorlar). Böylece:
 *   · zaman geçmesi yeni ihlal ÜRETMEZ (drift kapandı)
 *   · yeni bir commit companion'ını bayat bırakırsa 7 gün sonra KIRMIZI (asıl amaç korundu)
 *   · tabanlar SIFIR olur — ratchet'in en güçlü hâli, sessiz bütçe yok
 */
/** DEĞER modülden gelir (tek kaynak); yukarıdaki gerekçe metni burada kalır. */
const KAPI_BASLANGIC = sayac.KAPI_BASLANGIC

// C5 tabanı SIFIR: kapı yalnız KAPI_BASLANGIC sonrası dokunulan kaynakları denetliyor, yani
// tarihsel borç kapsam dışı. Bu sayı HEDEF değil TAVAN ve YÜKSELTİLEMEZ — yükseltmek
// "yeni borca izin ver" demektir. Tarihsel borç ayrı testte görünür kalıyor.
// ⚠Taban yalnız taşıyıcı AÇIK iken hüküm kurar; uyku kipinde kol sayar ama bloklamaz.
const C5_TABAN = 0

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
 */
interface AnahtarModulu {
  oku: (kok: string) => { durum: 'ACIK' | 'KAPALI'; yol: string; okundu: boolean; sebep: string }
  durumSatiri: (kok: string) => string
}
const anahtar = require_(
  resolve(process.cwd(), 'scripts/hijyen/tasiyici-anahtari.cjs'),
) as AnahtarModulu
const TASIYICI = anahtar.oku(process.cwd())
const UYKUDA = TASIYICI.durum === 'KAPALI'

/**
 * ⭐C4_TABAN KALDIRILDI — C4 artık BLOKLAMIYOR (Recep kararı 2026-09-03).
 *
 * NİÇİN: companion üretici taşıyıcının süresi 2026-08-28'de bitti ve Recep 08-31'de
 * "taşıyıcı KAPALI kalsın" dedi (abonelik maliyeti). Taşıyıcı kapalıyken C4 bir borcu
 * ÖNLEYEMEZ, yalnız CEZALANDIRIR: companion üretilemediği için her yeni kaynak dosya
 * 7 gün sonra tüm filoyu bloklar. Bu 2026-09-03'te ölçülerek yaşandı — bir dosya
 * (`DataTablePagination.tsx`) hiçbir commit olmadan, yalnız TAKVİM ilerlediği için
 * bütün açık PR'ları kırmızıya çevirdi.
 *
 * ⚠NİÇİN EŞİK UZATILMADI: 7'yi 30'a çekmek aynı tuzağı ERTELER, kaldırmaz — 30. günde
 * aynı kilit gelir ve o gün sebebi hatırlayan kimse olmaz.
 * ⚠NİÇİN KAPI SİLİNMEDİ: borç GÖRÜNÜR kalmalı. Silinen kapı, kapatılmış borç sanılır.
 * Kalan biçim: SAY, ADLARIYLA RAPORLA, BLOKLAMA — "bilinen ve kabul edilmiş eksik".
 */

/**
 * ÖLÇÜM ÖNKOŞULU: TAM GİT GEÇMİŞİ.
 *
 * Bu bekçi yaşı `git log` üzerinden hesaplıyor. Sığ (shallow) bir klonda `git log`
 * yalnız son commit(ler)i görür, tarih haritası boşalır ve bekçi SESSİZCE yanlış
 * ölçer. 2026-08-17'de tam bu yaşandı: `actions/checkout@v4` `fetch-depth`
 * belirtilmediği için varsayılan **1** ile çalışıyor: CI'da C4 borcu **0** göründü,
 * oysa tam geçmişte **1**. Kapı yeşil kalsaydı hiç ölçmediği hâlde "geçti" derdi —
 * kendi stale-guard'ı yakaladığı için fark edildi.
 *
 * AYNI TUZAĞA BEN DE DÜŞTÜM: ara ölçümde `git merge --no-commit` ile ağacı birleştirip
 * C4=8 okudum ve bunu gerçek sandım. Ağaç birleşmişti ama GEÇMİŞ birleşmemişti, yani
 * master'ın commit tarihleri haritada yoktu ve o 7 taze dosya "tarihsiz = çok eski"
 * sayıldı. Gerçek merge sonrası sayı 1'e döndü. Ders: yaş ölçen bir bekçi için
 * "hangi dosyalar var" ile "hangi commit'ler görünüyor" AYRI sorulardır.
 *
 * Bu yüzden önkoşul AÇIKÇA doğrulanıyor ve karşılanmıyorsa test KIRMIZI olur.
 * "Ölçemedim, o hâlde geçtim" (fail-open / uyar-geç modu) bu depoda yasak: yeni
 * kapıya muafiyet tanımak kapıyı dekoratif yapar. Çözüm testte değil CI'da:
 * checkout adımına `fetch-depth: 0`.
 */
const ASGARI_COMMIT_SAYISI = 50

const KAYNAK_UZANTILARI = ['.ts', '.tsx', '.mjs', '.cjs']

function git(args: string[]): string {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

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

interface YamlKapsam {
  koklerRecursive: string[]
  skipDirs: Set<string>
  skipBasenames: Set<string>
}

/** `.cc_docs.yaml`'ı oku — kapsamın SSOT'u orası. */
function yamlKapsamiOku(): YamlKapsam {
  const metin = git(['show', 'HEAD:.cc_docs.yaml'])
  const liste = (anahtar: string): string[] => {
    const m = new RegExp(`^${anahtar}:\\s*\\[([^\\]]*)\\]`, 'm').exec(metin)
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

interface Bulgular {
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

function olc(): Bulgular {
  const kapsam = yamlKapsamiOku()
  const izlenen = izlenenDosyalar()
  const tarihler = sonCommitTarihleri()
  const mdSet = new Set(izlenen.filter(f => f.endsWith('.md')))
  const bugun = new Date()

  const kaynaklar = izlenen.filter(f => kapsamdaMi(f, kapsam))
  const eksik: string[] = []
  const bayat: string[] = []
  const tarihselEksik: string[] = []
  const tarihselBayat: string[] = []
  let kapidakiKaynak = 0
  let eksikTaze = 0
  let bayatTaze = 0

  for (const kaynak of kaynaklar) {
    const companion = `${kaynak.replace(/\.[^./]+$/, '')}.md`
    const kaynakTarih = tarihler.get(kaynak) ?? ''
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
    const companionTarih = tarihler.get(companion) ?? ''
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

describe('INV-DOC-2 · companion kapsam paritesi', () => {
  const b = olc()

  it('ÖNKOŞUL: git geçmişi TAM (sığ klonda bu bekçi ölçemez, o hâlde geçmiş de sayılmaz)', () => {
    const sigMi = git(['rev-parse', '--is-shallow-repository']).trim() === 'true'
    const commitSayisi = git(['rev-list', '--count', 'HEAD']).trim()

    expect(
      sigMi,
      'Depo SIĞ klonlanmış (shallow). Bu bekçi yaşı `git log` ile hesaplıyor; sığ klonda ' +
      'tarih haritası boşalır ve bekçi SESSİZCE yanlış ölçer — 2026-08-17\'de yerelde 8 ' +
      'ölçülen borç CI\'da 0 göründü. ÇÖZÜM TESTTE DEĞİL CI\'DA: checkout adımına ' +
      '`fetch-depth: 0` ekle (.github/workflows/ci.yml). "Ölçemedim ama geçtim" kabul edilmez.',
    ).toBe(false)

    expect(
      Number(commitSayisi),
      `Git geçmişinde yalnız ${commitSayisi} commit görünüyor (asgari ${ASGARI_COMMIT_SAYISI}). ` +
      'Geçmiş budanmışsa yaş hesabı anlamsızdır; `fetch-depth: 0` gerekli.',
    ).toBeGreaterThan(ASGARI_COMMIT_SAYISI)
  })

  it('C4 — companion\'ı olmayan ESKİ kaynak: taşıyıcı AÇIK ise bloklar, UYKUDA ise sayar', () => {
    const m = sayac.olc()
    // NİÇİN `process.stdout.write`: bu dosyada `no-console` yalnız `warn`/`error`a izin
    // veriyor ve rapor bir uyarı değil. Kuralı inline kapatmak yerine gerçek mekanizma
    // kullanıldı — kural bükülmedi.
    process.stdout.write(
      `[INV-DOC-2 · C4] ${sayac.ozetSatiri(m)}\n` +
      (m.eksik.length
        ? m.eksik.map(e => `  ${String(e.yasGun).padStart(5)} gün  ${e.yol}\n`).join('')
        : '') +
      `[INV-DOC-2 · C4] ${anahtar.durumSatiri(process.cwd())}\n` +
      `[INV-DOC-2 · C4] Bu sayı ${UYKUDA ? 'BLOKLAMAZ' : 'BLOKLAR'}. Taşıyıcı kapalıyken ` +
      `kapı borcu ÖNLEYEMEZ, yalnız cezalandırırdı (09-03'te ölçüldü: bir dosya hiçbir ` +
      `commit olmadan tüm PR'ları kırmızıya çevirdi). Sayı büyüyorsa "bilinen ve kabul ` +
      `edilmiş eksik" büyüyor demektir; ikiz bu dosyaları HİÇ bilmez, "o kod nasıl ` +
      `çalışıyor" sorusuna eksik cevap verir.\n`,
    )

    /**
     * ⭐TAŞIYICI AÇIKSA C4 YENİDEN BLOKLAR (REC-142).
     *
     * NİÇİN: `C4_TABAN` 2026-09-03'te kaldırıldı ve gerekçesi TEK BİR ŞEYDİ — taşıyıcı
     * kapalıydı, yani borç ödenemezdi. O koşul ortadan kalktığında (taşıyıcı AÇIK)
     * gerekçe de kalkar; kapıyı kalıcı olarak susturmak, geçici bir sebeple kalıcı bir
     * yetenek kaybetmek olurdu. Uyku kipi tam da bunu önlemek için var: kapı silinmedi,
     * ŞARTA bağlandı ve şart TEK ANAHTARDAN okunuyor.
     */
    if (!UYKUDA) {
      expect(
        m.eksik.length,
        `Companion'ı olmayan ${m.eksik.length} kaynak var ve taşıyıcı AÇIK — companion ` +
        `üretilebiliyor, yani bu borç ÖDENEBİLİR ve bloklar.\nDosyalar:\n  ` +
        `${m.eksik.map(e => e.yol).join('\n  ')}`,
      ).toBe(0)
    }

    // BLOKLAMAYAN KOL, BOŞ KOL DEĞİLDİR: sayının kendi içinde tutarlı olduğu ölçülür.
    // Assert'i tümden silip yerine yalnız bir yazdırma koymak, kolu ÖLÇMEYEN bir şeye
    // çevirir ve biz "kapı var" sanardık — bu depoda adı konmuş sınıf.
    expect(
      m.eksik.filter(e => e.yasGun <= YAS_ESIGI_GUN).map(e => e.yol),
      `Listede eşik İÇİ (${YAS_ESIGI_GUN} gün ve altı) dosya var — taze pencere muafiyeti ` +
      'bozulmuş; sayaç asenkron üretim penceresini borç sayıyor.',
    ).toEqual([])
    expect(
      m.enEskiYasGun,
      'enEskiYasGun listeyle UYUŞMUYOR — rapor kendi verisiyle çelişiyor.',
    ).toBe(m.eksik.length ? m.eksik[0].yasGun : 0)
  })

  it('⭐SAYIM AYIRT EDER: companion\'sız dosya eklenince sayı ARTAR ve ad listeye girer', () => {
    // Bloklamayan bir kolun tek gerçek kanıtı budur. Fikstür ŞART: gerçek depoya dayanan
    // ölçüm "bugün sıfır" olduğunda sayacın ÇALIŞTIĞINI kanıtlamaz — sıfır, hem "borç yok"un
    // hem "sayaç ölü"nün cevabıdır. Ayırt etmeyen gösterge ölçüm değildir.
    const kapsam = {
      koklerRecursive: ['src'],
      skipDirs: new Set<string>(),
      skipBasenames: new Set<string>(),
    }
    const bugun = new Date('2026-09-03T00:00:00Z')
    const eski = '2026-08-20' // demir sonrası VE eşiği aşmış (14 gün)

    const taban = sayac.sayimCekirdegi({
      izlenen: ['src/a/Var.tsx', 'src/a/Var.md'],
      kapsam,
      tarihler: new Map([['src/a/Var.tsx', eski], ['src/a/Var.md', eski]]),
      bugun,
      yasEsigiGun: YAS_ESIGI_GUN,
      kapiBaslangici: KAPI_BASLANGIC,
    })
    expect(taban.eksik.length, 'FİKSTÜR ÖNKOŞULU: companion\'ı OLAN dosya borç sayılmamalı').toBe(0)

    const sonra = sayac.sayimCekirdegi({
      izlenen: ['src/a/Var.tsx', 'src/a/Var.md', 'src/a/Yok.tsx'],
      kapsam,
      tarihler: new Map([
        ['src/a/Var.tsx', eski], ['src/a/Var.md', eski], ['src/a/Yok.tsx', eski],
      ]),
      bugun,
      yasEsigiGun: YAS_ESIGI_GUN,
      kapiBaslangici: KAPI_BASLANGIC,
    })
    expect(
      sonra.eksik.length,
      'Companion\'sız ESKİ dosya eklendi ama sayı ARTMADI — sayaç ölü. Bloklamayan kolun tüm ' +
      'değeri sayının ayırt etmesindedir; ayırt etmeyen sayı rapor değil dekordur.',
    ).toBe(taban.eksik.length + 1)
    expect(
      sonra.eksik.map(e => e.yol),
      'Sayı arttı ama AD listede yok — "N dosya" demek ama hangileri olduğunu söylememek ' +
      'borcu kapatılamaz kılar.',
    ).toContain('src/a/Yok.tsx')
    expect(sonra.enEskiYasGun, 'en eski yaş hesaplanmadı').toBe(14)

    // TERS YÖN — muafiyet CANLI mı: eşik İÇİ (taze) companion'sız dosya borç SAYILMAZ.
    // Bu kol olmasa "her şeyi borç sayan" bir sayaç da yukarıdaki iddiaları geçerdi.
    const taze = sayac.sayimCekirdegi({
      izlenen: ['src/a/Yeni.tsx'],
      kapsam,
      tarihler: new Map([['src/a/Yeni.tsx', '2026-09-01']]), // 2 gün
      bugun,
      yasEsigiGun: YAS_ESIGI_GUN,
      kapiBaslangici: KAPI_BASLANGIC,
    })
    expect(
      taze.eksik.length,
      'Taze (eşik içi) dosya borç SAYILDI — asenkron üretim penceresi muafiyeti ölmüş; bu, ' +
      'kapının ilk günden yanlış-kırmızı üretmesine geri dönerdi.',
    ).toBe(0)
    expect(taze.eksikTaze, 'taze sayaç dolmadı — muafiyet görünmez oldu').toBe(1)
  })

  it('⭐TEK KAYNAK (§26): modülün sayısı, testin BAĞIMSIZ hesabıyla uyuşur', () => {
    // Emirdeki "test modülü çağırsın" saf devretmesinden bilinçli SAPMA (gerekçe dosya
    // başında): testin kendi hesabı REFERANS olarak duruyor. Modül bozulursa burası kırmızı
    // verir; paylaşılan TEK ölçüt iki yönlü yanıltır (bu depoda ölçülmüş ders).
    const m = sayac.olc()
    expect(
      m.eksik.map(e => e.yol).sort(),
      'Modülün C4 listesi, testin BAĞIMSIZ hesabıyla AYRIŞTI. İkisi de aynı kapsamı ' +
      '(.cc_docs.yaml SSOT) ve aynı eşiği ölçmek zorunda; ayrışma ya kapsam süzgecinde ya ' +
      'yaş hesabında kusur demektir.',
    ).toEqual([...b.eksik].sort())
    expect(
      m.bayat.slice().sort(),
      'Modülün C5 listesi testin bağımsız hesabıyla ayrıştı',
    ).toEqual([...b.bayat].sort())
    expect(
      m.kaynakSayisi,
      'Modülün kapsam EVRENİ testin evreninden farklı — biri yaml\'ı yanlış okuyor',
    ).toBe(b.kaynakSayisi)
  })

  it('⭐panodaki satır MODÜLDEN gelir, board.cjs onu YENİDEN YAZMAZ (§26)', () => {
    const kok = process.cwd()
    const board = resolve(kok, 'scripts/board/board.cjs')
    const beklenen = sayac.ozetSatiri(sayac.olc())

    /**
     * FİKSTÜR, ÖLÇÜLEN DURUMU ÜRETMEK ZORUNDA (§25 — bu tuzağa bir kez düşüldü).
     * `yoklama` panoda TALEP YOKSA "panoda talep yok" deyip ERKEN DÖNER ve alt satırların
     * hiçbirini basmaz. Gerçek panoya bakmak da olmaz: CI'da o dizin yoktur, yerelde ise
     * başka şeritlerin verisi teste sızar. Bu yüzden İZOLE bir pano dizini kurulur ve
     * içine gerçek `claim` fiiliyle bir talep yazılır.
     */
    const tmp = (
      process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
    ).replace(/\\/g, '/').replace(/\/$/, '')
    const boardDir = `${tmp}/companion-sayim-yoklama-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const env = { ...process.env, VENTHUB_BOARD_DIR: boardDir }
    // Sabit ve GEÇERLİ uuid: board.cjs kimliğin BİÇİMİNİ doğruluyor (INV-BOARD-3).
    const sid = '5a1c0000-1111-4222-8333-444455556666'

    const talep = spawnSync(
      process.execPath,
      [board, 'claim', '--sid', sid, '--lane', 'SAYIM-SINAMA', '--globs', 'src/sayim-sinama/**'],
      { encoding: 'utf8', cwd: kok, env, timeout: 120_000 },
    )
    expect(
      talep.status,
      `FİKSTÜR ÖNKOŞULU: claim yazılamadı (${talep.stderr || talep.stdout || talep.error?.message})`,
    ).toBe(0)

    const r = spawnSync(process.execPath, [board, 'yoklama'], {
      encoding: 'utf8', cwd: kok, env, timeout: 120_000,
    })
    expect(r.error, `board.cjs yoklama koşturulamadı: ${r.error?.message ?? ''}`).toBeUndefined()
    expect(
      r.stdout.includes('panoda talep yok'),
      'FİKSTÜR ÖNKOŞULU: yoklama erken döndü — talep yazılmamış, alt satırlar hiç basılmadı.',
    ).toBe(false)
    expect(
      r.stdout,
      'Yoklama çıktısı, sayaç modülünün ÜRETTİĞİ cümleyi birebir içermiyor. §26: kullanıcıya ' +
      'görünen metin ölçütü TEKRAR ETMEZ, ondan ÜRETİLİR. Pano kendi cümlesini yazarsa iki ' +
      'metin ayrışır ve hangisinin hüküm olduğu belirsizleşir.',
    ).toContain(beklenen)
  })

  it('C5 — kaynağından ESKİ companion: taşıyıcı AÇIK ise bloklar, UYKUDA ise sayar', () => {
    // BORÇ LİSTESİ — uyku kipinde de HER KOŞUMDA basılır (URUN isteği, REC-142).
    // NİÇİN `process.stdout.write`: bu dosyada `no-console` yalnız warn/error'a izin
    // veriyor ve bu bir uyarı değil, rapor. Kuralı inline kapatmak yerine gerçek
    // mekanizma kullanıldı — C4 kolundaki ile aynı biçim.
    process.stdout.write(
      `[INV-DOC-2 · C5] ${anahtar.durumSatiri(process.cwd())}\n` +
      `[INV-DOC-2 · C5] bayat companion: ${b.bayat.length} (eşik dışı) + ${b.bayatTaze} ` +
      `(${YAS_ESIGI_GUN} gün penceresinde, sıradaki borç)\n` +
      (b.bayat.length ? b.bayat.map(y => `  ${y}\n`).join('') : '') +
      `[INV-DOC-2 · C5] Bu sayı ${UYKUDA ? 'BLOKLAMAZ' : 'BLOKLAR'} — kaynak: ` +
      `${TASIYICI.yol}\n`,
    )

    if (!UYKUDA) {
      // TAŞIYICI AÇIK: eski davranış AYNEN. Companion üretilebiliyorsa bayat companion
      // gerçek bir ihmaldir ve ikize EMİN BİÇİMDE YANLIŞ cevap verdirir.
      expect(
        b.bayat.length,
        `Kaynağından eski companion sayısı ${b.bayat.length}, taban ${C5_TABAN}. ` +
        `Taşıyıcı AÇIK (${TASIYICI.yol}) — companion üretilebilir, yani bu borç ÖDENEBİLİR ` +
        `ve bloklar.\nDosyalar:\n  ${b.bayat.join('\n  ')}`,
      ).toBeLessThanOrEqual(C5_TABAN)
      return
    }

    // UYKU KİPİ — BLOKLAMAYAN KOL, BOŞ KOL DEĞİLDİR.
    // Assert'i tümden silip yerine yalnız bir yazdırma koymak, kolu ÖLÇMEYEN bir şeye
    // çevirir ve biz "kapı var" sanardık — bu depoda adı konmuş sınıf. Bloklamayan bir
    // kolun tek değeri, SAYININ AYIRT ETTİĞİdir; onu ölçüyoruz:
    //   (1) sınıflandırma bir BÖLÜNTÜ olmalı — aynı dosya hem "eksik" hem "bayat" sayılamaz
    //       (sayılırsa borç iki kez raporlanır ve sayı gerçeği anlatmaz),
    //   (2) listelenen her şey gerçekten bir companion (.md) olmalı — C4/C5 karışırsa
    //       "eksik" borcu "bayat" gibi görünür ve uyanışta yanlış iş üretilir.
    // `b.eksik` KAYNAK yollarını, `b.bayat` COMPANION yollarını tutar — karşılaştırma
    // için kaynak, companion adına çevrilir (sayaç çekirdeğindeki dönüşümün aynısı).
    const kesisim = b.bayat.filter(y => b.eksik.some(e => `${e.replace(/\.[^./]+$/, '')}.md` === y))
    expect(
      kesisim,
      'Bir dosya hem C4 (eksik) hem C5 (bayat) sayılmış — sınıflandırma bölüntü değil, ' +
      'borç iki kez görünüyor.',
    ).toEqual([])
    expect(
      b.bayat.filter(y => !y.endsWith('.md')),
      'C5 listesinde companion olmayan yol var — C4/C5 ayrımı bozulmuş.',
    ).toEqual([])
  })

  it('TARİHSEL borç GÖRÜNÜR kalır (kapsam dışı ≠ yok sayıldı)', () => {
    // Kapsamı KAPI_BASLANGIC ile daraltmak drift'i kapattı ama yeni bir tehlike doğurdu:
    // eski borç sessizce yok sayılabilir. Bu yüzden sayı BASILIYOR ve sıfırlandığında test
    // KIRMIZI yanıp demiri kaldırmaya zorluyor — gerekçesiz kapsam daraltması taşınmasın.
    const toplam = b.tarihselEksik.length + b.tarihselBayat.length
    // eslint-disable-next-line no-console
    console.info(
      `[INV-DOC-2] TARİHSEL companion borcu (KAPI_BASLANGIC=${KAPI_BASLANGIC} öncesi, kapı ` +
      `kapsamı DIŞINDA): ${b.tarihselEksik.length} eksik + ${b.tarihselBayat.length} bayat ` +
      `= ${toplam}. Kapı yalnız yeni borcu engelliyor; bu yığın ayrı bir iş emri konusudur.
` +
      `[INV-DOC-2] Kapı kapsamındaki kaynak: ${b.kapidakiKaynak} · bunlardan ihlal: ` +
      `${b.eksik.length} eksik + ${b.bayat.length} bayat. DÜRÜST NOT: KAPI_BASLANGIC'tan ` +
      `sonra dokunulan bir dosya ${YAS_ESIGI_GUN} günü doldurmadıkça ihlal ÜRETEMEZ — yani ` +
      `kapı ilk ${YAS_ESIGI_GUN} gün yapısal olarak sessizdir. Bu YEŞİLİ "borç yok" diye ` +
      `okuma; "yeni borç henüz olgunlaşmadı" diye oku.`,
    )
    expect(
      toplam,
      'İYİ HABER olabilir: tarihsel companion borcu SIFIRA düştü. Öyleyse KAPI_BASLANGIC ' +
      'demiri gereksizleşti — kaldır (ya da bugüne çek) ve bu testi sil, yoksa kapı geçmişi ' +
      'gerekçesiz biçimde kapsam dışı tutmaya devam eder.',
    ).toBeGreaterThan(0)
  })

  it('ratchet geri kaymasın: tabanlar SIFIR kalmalı (yükseltmek yeni borca izin verir)', () => {
    // Sayı-tabanlı ratchet'in yerini bu aldı. Eski sürümde "borç azaldıysa tabanı düşür"
    // diyordu; taban artık 0 olduğu için düşürülecek bir şey yok — korunması gereken şey
    // tabanın YÜKSELTİLMEMESİ. Biri kırmızıyı susturmak için sayıyı büyütürse burası yanar.
    // C4_TABAN kaldırıldı (C4 artık bloklamıyor, sayıyor — gerekçe dosya başında). C4'ün
    // ratchet'inin yerini "SAYIM AYIRT EDER" kolu aldı: taban yerine sayacın canlılığı
    // korunuyor.
    //
    // ⭐C5 ARTIK KOŞULLU BLOKLAR (REC-142, Recep kararı 2026-09-05). Eski hüküm şuydu:
    // "C5 bloklamaya devam eder, çünkü çaresi taşıyıcıya bağlı değil — companion
    // silinebilir." Tek dosyada doğruydu; ÖLÇEKTE düştü: 09-05'te bloklayan 8'in
    // arkasında 7 gün penceresinde 49 tane daha vardı, yani "çare" 57 belgeyi silmek ve
    // ikizi o dosyalarda tamamen kör bırakmaktı. Recep kararı: üretim bir süre durur,
    // dönüşte kaldığımız yerden devam edilir → companion'lar YERİNDE KALIR.
    //
    // ⚠TABAN YİNE 0 VE YÜKSELTİLEMEZ: uyku kipi tabanı gevşetmez, tabanın ne zaman
    // HÜKÜM KURDUĞUNU değiştirir. Taşıyıcı açıldığı an sıfır tavan geri gelir; biri
    // uyku kipini fırsat bilip tabanı büyütürse burası yanar.
    expect(C5_TABAN, 'C5_TABAN yükseltilmiş — kırmızıyı susturmak için taban büyütmek, kapıyı sökmektir').toBe(0)
  })

  it('uyku kipi ANAHTARDAN türer: kolun davranışı sabit kodlanmamış', () => {
    /**
     * NİÇİN BU KOL: asıl kusur "C5 blokluyordu" değildi — davranışın koda GÖMÜLÜ
     * olmasıydı. Taşıyıcı kapandığında kimse kapıyı çeviremedi, çünkü çevrilecek bir
     * şey yoktu; durum beş dosyada düz metindi. Bu kol, o kusurun geri gelmesini
     * engeller: davranış tek anahtardan OKUNMALI.
     */
    expect(
      TASIYICI.okundu,
      `Taşıyıcı anahtarı okunamadı (${TASIYICI.sebep}). Fail-closed davrandık (AÇIK ` +
      `varsayıldı, kapılar blokluyor) — ama anahtarın kendisi onarılmalı: ${TASIYICI.yol}`,
    ).toBe(true)
    expect(
      ['ACIK', 'KAPALI'],
      'Anahtar tanınmayan bir durum taşıyor.',
    ).toContain(TASIYICI.durum)
    // Anahtar dosyası GERÇEKTEN bu kolun okuduğu yer mi: yolu depo kökünde ve kanonik adda.
    expect(TASIYICI.yol.endsWith('.companion-tasiyici.json')).toBe(true)
  })

  it('vacuous-guard: kapsam gerçekten dolu (yaml/kapsam bozulunca test sessizce yeşile kaçmasın)', () => {
    // En sinsi arıza biçimi: yaml okuması bozulur, kapsam boşalır, iki iddia da
    // "0 <= taban" ile YEŞİL kalır ve bekçi ölür. Bu iddia o yolu kapatır.
    expect(
      b.kaynakSayisi,
      `Kapsamda yalnız ${b.kaynakSayisi} kaynak dosya bulundu — .cc_docs.yaml okuması ` +
      `ya da kapsam süzgeci bozulmuş olabilir (2026-08-17'de 606 ölçüldü).`,
    ).toBeGreaterThan(400)
  })

  it('yaş eşiği gerçekten iş görüyor: taze gürültü ayrı sayılıyor', () => {
    // Eşik olmasa C4 36, C5 189 olurdu ve bekçi ilk günden kırmızı yanardı.
    // Taze sayaçların dolu olması, eşiğin canlı olarak gürültü kestiğini gösterir.
    expect(
      b.eksikTaze + b.bayatTaze,
      'Taze (eşik içi) bulgu sayısı 0 — companion üretimi durmuş olabilir ya da ' +
      'yaş hesabı bozulmuştur; eşiğin gürültü kestiğini bu sayaç kanıtlar.',
    ).toBeGreaterThan(0)
  })
})
