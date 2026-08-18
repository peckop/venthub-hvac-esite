import { describe, expect, it } from 'vitest'

/**
 * INV-SCRUB-1 — test takımının KENDİ yorum sıyırıcıları şema-güvenli olmalı.
 *
 * ÖLÇÜLEN KATMAN (K6): üretim kodu DEĞİL. Bu kapı yalnızca `src/` altındaki TEST dosyalarının
 * içindeki satır-yorumu sıyırıcı regexlerini ölçer. Yani "ürün doğru mu" değil,
 * **"ürünü ölçen aletler kör mü"** sorusunu sorar.
 *
 * NİÇİN VAR (T087-VH · 2026-08-18)
 * ---------------------------------
 * Bir satır-yorumu sıyırıcısı, satırdaki HER çift eğik çizgiyi yorum başı sayarsa bir URL'in
 * şemasını da yorum sanır ve satırın geri kalanını siler:
 *
 *   girdi : path: 'https://kotu-cdn.example.com/model.glb',
 *   sonuç : path: 'https:
 *
 * Geriye kalan metin hiçbir desene uymaz. Bunu kullanan bekçi **hiçbir şey bulamaz ve her
 * zaman yeşil kalır** — duruyor görünen, ölçmeyen bir kapı. Bu depoda üç kez ölçüldü
 * (`csp-origin-coverage`, `canonical-lang-segment`, `3d-csp`); üçüncüsünde negatif kontrol de
 * yapıldı: aynı sabotaj eski sıyırıcıyla YEŞİL, yenisiyle KIRMIZI kaldı.
 *
 * Bu kapının işi tek: **yirmincisi yarın eklenmesin.**
 *
 * GÜVENLİ SAYILAN ÜÇ BİÇİM
 *   1. `(?<!:)` ön-bakışı — iki noktadan hemen sonraki çift çizgiyi yorum saymaz (kanonik)
 *   2. `[^:…]` sınıfı     — aynı işi karakter tüketerek yapar (eski biçim, kabul edilir)
 *   3. satır-başı çapası  — yalnız satırın başındaki yorumu siler, ortadaki URL'e dokunmaz
 *
 * RATCHET: aşağıdaki taban liste ADIYLA yazılıdır ve YALNIZ KISALABİLİR. Yeni bir güvensiz
 * sıyırıcı eklenirse R1 kırmızı yanar; tabandaki bir dosya düzeltilirse R2 (stale-guard)
 * "beni listeden çıkar" diye kırmızı yanar. Liste ne sessizce genişleyebilir ne bayatlayabilir.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

/**
 * KAPSAM — bilerek `src/` altındaki TÜM test dosyaları.
 *
 * İlk sürüm yalnız `/src/__tests__/**` tarıyordu ve dedektör-sağlık testi bunu YAKALADI:
 * 154 test dosyasının 91'i (%59) o dizinin DIŞINDA yaşıyor (`src/lib/__tests__`,
 * `src/views/admin/__tests__`, bileşen yanı `*.test.tsx`…). Dar kapsam "ihlal yok" derdi ve
 * bu, ölçümden değil körlükten gelen bir yeşil olurdu — kapının kovaladığı kusurun ta kendisi.
 *
 * ÖLÇÜLMEYEN, ADIYLA: `scripts/**` (.cjs) ve `.github/workflows/**` (.yml) içindeki metin
 * sıyırıcıları bu kapının dışındadır — farklı dil, farklı yorum grameri. Oradaki aynı sınıf
 * için ayrı bir kapı gerekir; bu dosya onu ölçtüğünü İDDİA ETMEZ.
 */
const TEST_KAYNAKLARI: Record<string, string> = import.meta.glob(
  '/src/**/*.{test,spec}.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true },
)

/** Bu dosyanın kendisi — örnek desenleri METİN olarak taşıdığı için ölçüm dışı. */
const KENDIM = '/src/__tests__/conformance/comment-scrubber-scheme-safety.test.ts'

/** Tek ters eğik çizgi. Kaçış cehenneminden kaçmak için adlandırıldı. */
const TERS = '\\'

/** Bir regex KAYNAĞINDA yorum işareti bu dört karakterle yazılır. */
const YORUM_ISARETI = TERS + '/' + TERS + '/'

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
function guvensizSatirlar(kaynak: string): number[] {
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

function ihlalHaritasi(): Map<string, number[]> {
  const harita = new Map<string, number[]>()
  for (const [yol, kaynak] of Object.entries(TEST_KAYNAKLARI)) {
    if (yol === KENDIM) continue
    const satirlar = guvensizSatirlar(kaynak)
    if (satirlar.length > 0) harita.set(yol.replace(/^\//, ''), satirlar)
  }
  return harita
}

/**
 * TABAN (ratchet) — 2026-08-18'de ÖLÇÜLDÜ. Her satır bir borç, sahibi yorumda.
 *
 * Bu dosyalara BİLEREK dokunulmadı: başka şeritlerin mülkü ve tek bir PR'da üç şeridi birden
 * kırmızıya sokmak kapının kendisinden çok zarar verirdi. Sahibi sırası geldiğinde tek satırla
 * düzeltir ve kendini bu listeden ÇIKARIR — R2 bunu zorlar.
 */
const TABAN: readonly string[] = [
  'src/__tests__/conformance/admin-fx-lock-visibility.test.ts', // ADMIN-CUSTOMER
  'src/__tests__/conformance/admin-returns-concurrency.test.ts', // ADMIN-CUSTOMER
  'src/__tests__/conformance/canonical-url-ssot.test.ts', // LEGAL-SEO — en riskli: doğası gereği URL avlıyor
  'src/__tests__/conformance/legal-en-leftover.test.ts', // LEGAL-SEO
  'src/__tests__/conformance/pricing-fx-rate-single-resolver.test.ts', // PRICING
  'src/__tests__/conformance/purchasing-machine-and-evidence.test.ts', // PRICING
]

describe('INV-SCRUB-1 · test takımının kendi yorum sıyırıcıları şema-güvenli', () => {
  it('dedektör çalışıyor: taranan test dosyası sayısı makul', () => {
    // Boş/az tarama "temiz" demek değil, "dedektör kör" demektir.
    expect(Object.keys(TEST_KAYNAKLARI).length).toBeGreaterThan(140)
  })

  it('dedektör kendini doğrular: güvensizi yakalar, üç güvenli biçimi ve ilgisizi yakalamaz', () => {
    const ornek = (on: string, son: string) =>
      'x.replace(/' + on + YORUM_ISARETI + son + "/g, '')"

    // GÜVENSİZ — üç yazım da yakalanmalı.
    expect(guvensizSatirlar(ornek('', '[^' + TERS + 'n]*'))).toHaveLength(1)
    expect(guvensizSatirlar(ornek('', '[^' + TERS + 'r' + TERS + 'n]*'))).toHaveLength(1)
    expect(guvensizSatirlar(ornek('', '.*$'))).toHaveLength(1)

    // GÜVENLİ — üç biçimin hiçbiri yakalanmamalı.
    expect(guvensizSatirlar(ornek('(?<!:)', '[^' + TERS + 'n]*'))).toEqual([])
    expect(guvensizSatirlar(ornek('(^|[^:])', '[^' + TERS + 'n]*'))).toEqual([])
    expect(guvensizSatirlar(ornek('^' + TERS + 's*', '.*$'))).toEqual([])

    // İLGİSİZ — şema AYRIŞTIRAN regex satır yorumu değildir; yanlış-KIRMIZI da kusurdur.
    expect(guvensizSatirlar("u.replace(/^[a-z]+:" + YORUM_ISARETI + "/i, '')")).toEqual([])

    // ANIŞ — kuralı ANLATAN düzyazı ihlal değildir (`csp-origin-coverage` docstring'i).
    const anis = ' * (1) `/' + YORUM_ISARETI + '.*$/` bu repoda hiçbir şey sıyırmaz.'
    expect(guvensizSatirlar(anis)).toEqual([])

    // …ama aynı satırda ÇIPLAK biçim de geçiyorsa YİNE yakalanır (kapı zayıflamadı).
    expect(guvensizSatirlar(anis + ' ' + ornek('', '.*$'))).toEqual([1])

    // Satır numarası birebir doğru bildirilir (satır-satır ölçümün alt-sınırı).
    expect(guvensizSatirlar('bos\nbos\n' + ornek('', '[^' + TERS + 'n]*'))).toEqual([3])
  })

  it('R1 · tabanda olmayan yeni bir şema-güvensiz sıyırıcı YOK', () => {
    const yeni = [...ihlalHaritasi().entries()]
      .filter(([yol]) => !TABAN.includes(yol))
      .map(([yol, satirlar]) => yol + ':' + satirlar.join(','))

    expect(
      yeni.sort(),
      [
        'Şema-güvensiz satır-yorumu sıyırıcısı: URL taşıyan satırda şemayı yorum sanar,',
        'satırın geri kalanını siler ve bekçiyi SESSİZCE kör bırakır (hep yeşil kalır).',
        '',
        'Düzeltme (kanonik biçim): yorum işaretinin önüne (?<!:) ön-bakışını koy.',
        'Sonra sıyırıcının şemayı yemediğini KANITLAYAN bir alt-sınır testi ekle — yalnız',
        'sıyırmayı değil, o satırdan hedefin GERÇEKTEN toplandığını da ölç.',
        '',
        ...yeni,
      ].join('\n'),
    ).toEqual([])
  })

  it('R2 · stale-guard: taban BAYATLAMAZ — düzeltilen dosya listeden çıkarılır', () => {
    const halaIhlalli = new Set(ihlalHaritasi().keys())
    const bayat = TABAN.filter((yol) => !halaIhlalli.has(yol))

    expect(
      bayat,
      [
        'Bu dosya(lar) artık şema-güvensiz DEĞİL — TABAN listesinden ÇIKAR.',
        'Ratchet ancak kısaldığında ratchet olur: bayat taban, düzeltilmiş bir kusuru hâlâ',
        'borç gibi gösterir ve bir sonraki okuyanı yanlış yere bakmaya iter.',
        '',
        ...bayat,
      ].join('\n'),
    ).toEqual([])
  })
})
