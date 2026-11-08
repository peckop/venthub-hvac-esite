import { createRequire } from 'node:module'
import { resolve } from 'node:path'

/**
 * INV-SCRUB-1 · ORTAK YARDIMCI (ALT-38i parça 2: kapı PR kolu ve DÜNYA kolu olarak ikiye bölündü).
 *
 * Test DEĞİLDİR (vitest yalnız `*.test.ts` toplar; aynı desen: `ci-test-secimi.yardimci.ts`,
 * `depo-dokum-kapisi.yardimci.ts`). İki kol bu dosyayı içe aktarır:
 *   · `comment-scrubber-scheme-safety.test.ts`        PR kolu: dedektör kanaryası + kendini doğrulama + R1/R2'nin
 *                                                      DEĞİŞEN dosyalarla sınırlı hâli,
 *   · `comment-scrubber-scheme-safety-dunya.test.ts`  dünya kolu: R1/R2'nin TAM ağaç hâli (master push + zamanlı koşu).
 *
 * Bu dosya YALNIZ bu teste özgüdür: dedektör (`guvensizSatirlar`), TABAN listesi ve iki kolun paylaştığı kapsam kararı.
 * TABAN listesi ve dedektör TEK yerde yaşar; iki kolun ayrışması mümkün değildir.
 *
 * ⚠`import.meta.glob` BURADA DEĞİL, iki test dosyasında yazılıdır (ve bir kayma testi ikisinin aynı kalmasını ölçer).
 * NİÇİN: test haritası (`scripts/ci/test-haritasi-uret.cjs`) test DIŞI kodda bulduğu her `import.meta.glob` desenini
 * KÜRESEL desen sayar; küresel desene uyan her değişen yol seçiciyi `tam`a düşürür (`test-sec.cjs`, "test dışı kodun
 * import.meta.glob deseni kapsıyor"). Glob buraya taşınsaydı `scripts/**` ya da `src/**` altındaki her test/betik
 * değişikliği PR kapısında TAM paketi koşturur, ALT-38 kazancı geri giderdi. Test dosyasının kendi kaynağındaki desen ise
 * yalnız o testin bağımlılığıdır (seçici testi ancak ilgili yol değişince seçer: tam beklenen davranış).
 *
 * PR'IN DEĞİŞEN DOSYALARI (`prDegisenleri`, `kapsamla`): dosya başına çalışan bir kuralın ihlali yalnız o dosyanın
 * içeriğinden doğar. Bu yüzden PR kapısında yalnız PR'ın DEĞİŞTİRDİĞİ dosyalar taranır; tam ağaç dünya durumu koluna
 * (`scripts/ci/dunya-durumu-testleri.json`) gider. Üç sertlik, hepsi fail-closed:
 *   1. değişen liste okunamazsa (`null`) daraltma YAPILMAZ: tam ağaç taranır. Boş küme "ölçemedim" anlamına HİÇ gelmez;
 *      yalnız "liste okundu ve taranacak kaynağa dokunulmadı" iken boştur,
 *   2. dedektörün, TABAN'ın ya da iki kolun KENDİ kodu değişmişse (`KONTROL_KODU`) tam ağaç taranır: dedektörü gevşeten
 *      bir PR hiçbir dosyaya dokunmadan tüm ağaçta yeni ihlal doğurabilir ve daralmış kapı onu görmezdi,
 *   3. kanarya (taranan dosya sayısı) HER ZAMAN tam ağaçtan hesaplanır; daralma yalnız R1/R2'nin girdisidir.
 */

/**
 * PR kolunun dosyası — örnek desenleri METİN olarak taşıdığı için ölçüm dışı.
 * Dünya kolu (`-dunya.test.ts`) ÖLÇÜLÜR: desen taşımaz, bu yüzden kendi kendini de denetler.
 */
const KENDIM ='/src/__tests__/conformance/comment-scrubber-scheme-safety.test.ts'

/** Tek ters eğik çizgi. Kaçış cehenneminden kaçmak için adlandırıldı. */
export const TERS = '\\'

/** Bir regex KAYNAĞINDA yorum işareti bu dört karakterle yazılır. */
export const YORUM_ISARETI = TERS + '/' + TERS + '/'

/**
 * Kaçış karakterlerini atar.
 *
 * Regex KAYNAĞINI regex'le aramak kaçış cehennemidir ve körlük tam orada doğar. Bunun yerine
 * incelenen pencereden ters eğik çizgiler atılır ve düz metin karşılaştırılır: dört karakterlik
 * yorum işareti sadeleşir, aranan kalıplar okunur hâle gelir.
 */
function kacissiz(s: string): string {
  return s.split(TERS).join('')
}

/** Yorum işaretinden SONRA satır sonuna kadar yiyen biçimler. */
function satirSonunaKadarYiyor(sonrasi: string): boolean {
  const s = kacissiz(sonrasi)
  return s.startsWith('[^n]') || s.startsWith('[^rn]') || s.startsWith('.*')
}

/**
 * Yorum işaretinden ÖNCE gelen üç güvenli biçimden biri var mı?
 *
 * BİLİNEN SINIR: pencere 30 karakter. Aynı pencerede ilgisiz bir sebeple `[^:` geçen bir
 * regex yanlışlıkla güvenli sayılabilir (yanlış-NEGATİF). Ters yönü — güvenliyi güvensiz
 * saymak — daha zararlı olurdu; bu yüzden şüphede güvenli tarafa düşülüyor.
 */
function semaKorumasiVar(oncesi: string): boolean {
  const s = kacissiz(oncesi)
  if (s.endsWith('(?<!:)')) return true // 1. ön-bakış (kanonik)
  if (s.includes('[^:')) return true // 2. iki nokta içeren negatif sınıf
  if (s.endsWith('^s*')) return true // 3. satır-başı çapası (`^\s*` sadeleşmiş hâli)
  return false
}

/**
 * KULLANIM mı, yoksa desenden SÖZ ETME mi?
 *
 * Bu ayrım kapının kullanılabilir olmasının şartı — ve ilk koşuda CANLI yakalandı:
 * `csp-origin-coverage` bekçisi, kendi docstring'inde tam olarak bu anti-deseni ANLATIYOR
 * ("`/\/\/.*$/` bu repoda hiçbir şey sıyırmaz"). İlk sürüm o cümleyi ihlal saydı; yani kuralı
 * ÖĞRETEN metin kuralı çiğniyor göründü. Aynı aile bu depoda daha önce de yaşandı
 * (INV-MIGRATION-LEDGER-1 kendi yasak-uyarısına takılmıştı).
 *
 * Ayrım: satır-içi backtick'e alınmış desen bir ANIŞTIR (düzyazı); çıplak yazılmış desen
 * KULLANIMDIR (çalışan kod). Ölçümden önce satır-içi kod parçaları sıyrılır. Kapı zayıflamaz:
 * tehlikeli olan biçim — çalışan regex literali — hâlâ yakalanır.
 */
function anisSiyir(satir: string): string {
  return satir.replace(/`[^`]*`/g, ' ')
}

/**
 * Bir dosyadaki şema-güvensiz sıyırıcıların satır numaraları.
 *
 * Ölçüm SATIR SATIR yapılır: bir regex literali hiçbir zaman satır aşmaz, ve böylece hem
 * anış-sıyırma satıra uygulanabilir hem de bildirilen satır numarası birebir doğru olur.
 */
export function guvensizSatirlar(kaynak: string): number[] {
  const bulunan: number[] = []
  kaynak.split('\n').forEach((hamSatir, indeks) => {
    const satir = anisSiyir(hamSatir)
    let i = satir.indexOf(YORUM_ISARETI)
    while (i !== -1) {
      const sonrasi = satir.slice(i + YORUM_ISARETI.length, i + YORUM_ISARETI.length + 12)
      const oncesi = satir.slice(Math.max(0, i - 30), i)
      if (satirSonunaKadarYiyor(sonrasi) && !semaKorumasiVar(oncesi)) {
        bulunan.push(indeks + 1)
        return
      }
      i = satir.indexOf(YORUM_ISARETI, i + 1)
    }
  })
  return bulunan
}

/**
 * TABAN (ratchet) — 2026-08-18'de ÖLÇÜLDÜ. Her satır bir borç, sahibi yorumda.
 *
 * Bu dosyalara BİLEREK dokunulmadı: başka şeritlerin mülkü ve tek bir PR'da üç şeridi birden
 * kırmızıya sokmak kapının kendisinden çok zarar verirdi. Sahibi sırası geldiğinde tek satırla
 * düzeltir ve kendini bu listeden ÇIKARIR — R2 bunu zorlar.
 */
export const TABAN: readonly string[] = [
  'src/__tests__/conformance/admin-fx-lock-visibility.test.ts', // ADMIN-CUSTOMER
  'src/__tests__/conformance/admin-returns-concurrency.test.ts', // ADMIN-CUSTOMER
  'src/__tests__/conformance/canonical-url-ssot.test.ts', // LEGAL-SEO — en riskli: doğası gereği URL avlıyor
  'src/__tests__/conformance/legal-en-leftover.test.ts', // LEGAL-SEO
  'src/__tests__/conformance/pricing-fx-rate-single-resolver.test.ts', // PRICING
  'src/__tests__/conformance/purchasing-machine-and-evidence.test.ts', // PRICING
]

/** Taranan dosya sayısının altına inmemesi gereken eşik (iki kolun kanaryası): boş/az tarama "temiz" değil "kör"dür. */
export const KANARYA_ESIGI = 220

/**
 * Dedektörün, TABAN'ın ve iki kolun KENDİ dosyaları. Bunlardan biri değişmişse ölçütün kendisi değişmiş olabilir:
 * PR kolu daralmaz, tam ağacı tarar (yukarıdaki sertlik 2).
 */
export const KONTROL_KODU: readonly string[] = [
  'src/__tests__/conformance/comment-scrubber-scheme-safety.test.ts',
  'src/__tests__/conformance/comment-scrubber-scheme-safety-dunya.test.ts',
  'src/__tests__/conformance/comment-scrubber-scheme-safety.yardimci.ts',
]

/** Dedektör denemeleri için tek satırlık regex kaynağı kurar: `x.replace(/<on><yorum işareti><son>/g, '')`. */
export const ornekSatir = (on: string, son: string): string =>
  'x.replace(/' + on + YORUM_ISARETI + son + "/g, '')"

/** Glob anahtarı (`/src/…`) → depo göreli yol (`src/…`): değişen dosya listesindeki yazım. */
const goreli =(globYolu: string): string => globYolu.replace(/^\//, '')

/**
 * PR'ın değişen dosyaları: kanonik, POSIX, köke göreli yollar; okunamadıysa `null`.
 * Tek okuyucu `scripts/ci/dunya-durumu.cjs` `degisenYollariniOku`dur (CI'da `git diff --name-only -z --no-renames HEAD^1 HEAD`;
 * yerel kullanım ve testler `VENTHUB_DUNYA_DEGISEN_DOSYALAR=<dosya yolu>` ile elle verir; doluyken okunamıyorsa git'e DÜŞÜLMEZ).
 * Okuyucunun kendisi yüklenemese ya da fırlatsa da bu işlev FIRLATMAZ, `null` döner (yani çağıran TAM taramaya düşer).
 * ⚠Yerelde commit sonrası `HEAD^1..HEAD` yalnız SON commit'tir; çok commitli yerel dalda PR'ın tamamı için liste elle verilir.
 */
export function prDegisenleri(): string[] | null {
  try {
    const modul = createRequire(import.meta.url)(
      resolve(__dirname, '../../../scripts/ci/dunya-durumu.cjs'),
    ) as { degisenYollariniOku: () => string[] | null }
    const d = modul.degisenYollariniOku()
    return Array.isArray(d) ? d : null
  } catch {
    return null
  }
}

/**
 * `tumu` kümesini PR'ın değişen dosyalarına göre daraltır.
 * @param tumu     tam küme (taranabilecek her hedef)
 * @param anahtar  bir hedefin değişen listedeki yol karşılığı (kanonik, POSIX, köke göreli)
 * @param degisen  testler için enjeksiyon; verilmezse `prDegisenleri()` okunur. Açık `null` = "okunamadı" (varsayılan DEVREYE GİRMEZ).
 * @returns `degisen` okunamadıysa `{ liste: tumu (aynen), tam: true }`; okunduysa `{ liste: tumu ∩ değişen (tumu sırasında), tam: false }`
 */
export function kapsamla<T>(
  tumu: T[],
  anahtar: (x: T) => string,
  degisen: string[] | null = prDegisenleri(),
): { liste: T[]; tam: boolean } {
  if (!Array.isArray(degisen)) return { liste: tumu, tam: true }
  const kume = new Set(degisen)
  return { liste: tumu.filter((x) => kume.has(anahtar(x))), tam: false }
}

/** Kontrol kodu değişmişse daraltma kalkar: `null` (= tam tarama) döner; aksi hâlde liste aynen. */
function kontrolKoduDegistiyseTam(degisen: string[] | null): string[] | null {
  return Array.isArray(degisen) && degisen.some((y) => KONTROL_KODU.includes(y)) ? null : degisen
}

/** Verilen kaynakların (`[glob yolu, metin]`) ihlal haritası: depo göreli yol → satır numaraları. KENDIM ölçüm dışıdır. */
function ihlalHaritasi(girdiler: ReadonlyArray<readonly [string, string]>): Map<string, number[]> {
  const harita = new Map<string, number[]>()
  for (const [yol, kaynak] of girdiler) {
    if (yol === KENDIM) continue
    const satirlar = guvensizSatirlar(kaynak)
    if (satirlar.length > 0) harita.set(goreli(yol), satirlar)
  }
  return harita
}

/**
 * R1 · tabanda olmayan yeni bir şema-güvensiz sıyırıcı var mı?
 * @param kaynaklar `import.meta.glob` çıktısı (TAM ağaç; kanarya bunun üzerinden sayılır, bu işlev yalnız taranacak alt kümeyi seçer)
 * @param degisen   `null` = tam ağaç (dünya kolu bunu AÇIKÇA verir); verilmezse PR'ın değişen dosyaları okunur
 * @returns `yeni`: `yol:satır,satır` (sıralı); `tam`: tam ağaç mı tarandı; `taranan`: taranan dosya sayısı
 */
export function r1YeniIhlaller(
  kaynaklar: Record<string, string>,
  degisen: string[] | null = prDegisenleri(),
  taban: readonly string[] = TABAN,
): { yeni: string[]; tam: boolean; taranan: number } {
  const { liste, tam } = kapsamla(
    Object.entries(kaynaklar),
    ([yol]) => goreli(yol),
    kontrolKoduDegistiyseTam(degisen),
  )
  const yeni = [...ihlalHaritasi(liste).entries()]
    .filter(([yol]) => !taban.includes(yol))
    .map(([yol, satirlar]) => yol + ':' + satirlar.join(','))
    .sort()
  return { yeni, tam, taranan: liste.length }
}

/**
 * R2 · stale-guard: TABAN'daki her dosya hâlâ ihlalli mi? (düzelmiş ama listeden çıkarılmamış = bayat)
 * Dosya silinmişse de bayattır (haritada yok). PR kolunda yalnız DEĞİŞEN TABAN dosyaları denetlenir: bir dosya ancak
 * değişerek düzelir (silmek de değişmektir ve değişen listede görünür).
 * @returns `bayat`: listeden çıkarılması gereken yollar; `tam`: tüm TABAN mı denetlendi; `denetlenen`: denetlenen TABAN dosyası sayısı
 */
export function r2BayatTaban(
  kaynaklar: Record<string, string>,
  degisen: string[] | null = prDegisenleri(),
  taban: readonly string[] = TABAN,
): { bayat: string[]; tam: boolean; denetlenen: number } {
  const { liste: denetlenen, tam } = kapsamla([...taban], (yol) => yol, kontrolKoduDegistiyseTam(degisen))
  const denetimKumesi = new Set(denetlenen)
  const girdiler = Object.entries(kaynaklar).filter(([yol]) => denetimKumesi.has(goreli(yol)))
  const halaIhlalli = new Set(ihlalHaritasi(girdiler).keys())
  return {
    bayat: denetlenen.filter((yol) => !halaIhlalli.has(yol)),
    tam,
    denetlenen: denetlenen.length,
  }
}
