import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  guvensizSatirlar,
  KANARYA_ESIGI,
  kapsamla,
  KONTROL_KODU,
  ornekSatir,
  prDegisenleri,
  r1YeniIhlaller,
  r2BayatTaban,
  TERS,
  YORUM_ISARETI,
} from './comment-scrubber-scheme-safety.yardimci'

/**
 * INV-SCRUB-1 — ölçüm ve otomasyon araçlarının yorum sıyırıcıları şema-güvenli olmalı.
 *
 * ÖLÇÜLEN KATMAN (K6): `src/` altındaki TEST dosyaları + `scripts/` altındaki betikler +
 * `supabase/functions/` altındaki edge fonksiyonları. Sorulan soru "ürün doğru mu" değil,
 * **"ürünü ölçen ve işleten aletler kör mü"**.
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

/**
 * ⭐BU DOSYA PR KOLUDUR (ALT-38i parça 2, 2026-11-08). Kapı ikiye bölündü:
 *
 *   · BU DOSYA (PR kapısında KALIR): dedektör kanaryası, dedektörün kendini doğrulaması ve R1/R2'nin DEĞİŞEN dosyalarla
 *     sınırlı hâli. PR'ın değiştirdiği bir dosyaya şema-güvensiz sıyırıcı eklenirse (ya da tabandaki bir dosya düzelip
 *     listeden çıkarılmazsa) burası KIRMIZI yanar.
 *   · `comment-scrubber-scheme-safety-dunya.test.ts` (PR kapısından ÇIKAR; master push + zamanlı koşu,
 *     `scripts/ci/dunya-durumu-testleri.json`): R1/R2'nin TAM ağaç hâli ve kendi kanaryası.
 *
 * NİÇİN: karne ölçümü (`docs/audits/test-karnesi-2026-10-09.json`, CI geçmişi 2026-07-06..10-07): bu dosya 11 kırmızı koşuda,
 * 6 farklı dalda kırmızı verdi; 7'si tek dünya olayı kümesinde (aynı test ≥3 dalda 12 saat içinde kırmızı: PR'ların kendi
 * kodundan bağımsız ortak neden), 4'ü izole (3'ü sonraki koşuda düzeldi; cetvel §7.4 bunları PR'ın KENDİ hatası olarak okur).
 * Kolu ayırmak ikisini de korur: PR'ın değiştirdiği dosyadaki ihlal burada yakalanır, suçsuz PR'ı bekleten tam ağaç taraması
 * zamanlı kolda kalır. Dosya tümden taşınsaydı PR'ın gerçek hatasını yakalayan kol da kaçardı (cetvel:
 * `docs/standards/test-karnesi-standard.md` §3 ve §7.4).
 *
 * KAPSAM KARARI (yardımcı dosyada, iki kolun paylaştığı tek kod): değişen liste okunamazsa ya da kontrolün KENDİ kodu
 * (dedektör, TABAN, iki kol) değişmişse TAM ağaç taranır (fail-closed); boş küme yalnız "liste okundu, kaynağa dokunulmadı"
 * iken geçerlidir. Kanarya (taranan dosya sayısı) her zaman tam ağaçtan sayılır.
 *
 * ⚠YEREL KULLANIM: değişen liste `git diff HEAD^1 HEAD` ile (PR'ın birleştirme commit'i) okunur; yerelde dalın SON commit'i
 * demektir. Çok commitli bir dalın tamamı için liste elle verilir: `VENTHUB_DUNYA_DEGISEN_DOSYALAR=<dosya yolu>`.
 *
 * KAYNAKLAR (aşağıdaki `import.meta.glob` bloğu) dünya kolundaki blokla BAYT BAYT aynı kalmak ZORUNDADIR; ikisi ayrı dosya
 * olduğu için kopyadır (glob'un yardımcı dosyaya taşınamama nedeni yardımcının başlığında). Ayrışırlarsa son testteki kayma
 * testi KIRMIZI verir.
 */

// KAYNAK-BLOK-BASLA
declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

/**
 * KAPSAM — üç kök: `src/` test dosyaları, `scripts/` betikleri, `supabase/functions/` edge kodu.
 * Kapsam iki kez genişletildi ve HER İKİSİNİ DE ölçüm zorladı, tahmin değil.
 *
 * İlk sürüm yalnız `/src/__tests__/**` tarıyordu ve dedektör-sağlık testi bunu YAKALADI:
 * 154 test dosyasının 91'i (%59) o dizinin DIŞINDA yaşıyor (`src/lib/__tests__`,
 * `src/views/admin/__tests__`, bileşen yanı `*.test.tsx`…). Dar kapsam "ihlal yok" derdi ve
 * bu, ölçümden değil körlükten gelen bir yeşil olurdu — kapının kovaladığı kusurun ta kendisi.
 *
 * İKİNCİ GENİŞLETME (aynı gün): ilk sürüm "`scripts/**` ve `supabase/functions/**` ölçülmüyor"
 * diye kendi kör noktasını adıyla yazmıştı. O boşluk ÖLÇÜLDÜ: üç kökte de (`scripts` 43 dosya,
 * `.github` 24, `supabase` 40) ihlal **sıfır** çıktı — yani orada bugün borç YOK. Borç
 * olmadığı için kapsamı oraya açmak bedava: taban boş kalır, kimse kırmızıya girmez, ama
 * yarın oraya yazılacak güvensiz bir sıyırıcı ARTIK kapıya takılır.
 *
 * O ölçüm önce SAHTE-TEMİZ verdi: probu `printf` ile yazınca `\n` gerçek satır sonuna dönüşüp
 * deseni bozdu ve üç kökün üçü de "temiz" göründü. Bilerek-boz adımı olmasa "ihlal yok" diye
 * rapor edilecekti. Prob `node` ile birebir yazıldığında üç kök de ihlali GÖRDÜ. Yani buradaki
 * sıfır, ölçülmüş bir sıfırdır — ölçülmemiş bir sessizlik değil.
 *
 * HÂLÂ ÖLÇÜLMEYEN, ADIYLA: `.github/workflows/**` (.yml). Dedektör orada da çalışıyor (probla
 * doğrulandı) ama YAML'de bu desen ancak gömülü kabuk/JS içinde geçer; ayrı bir gramer olduğu
 * için kapsama alınmadı. Bu dosya orayı ölçtüğünü İDDİA ETMEZ.
 */
const KAYNAKLAR: Record<string, string> = {
  ...import.meta.glob('/src/**/*.{test,spec}.{ts,tsx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
  ...import.meta.glob('/scripts/**/*.{cjs,mjs,js,ts}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
  /**
   * `!` deseni ŞART — ve niçin, ölçülmüş vakayla (2026-08-30):
   *
   * `tests/e2e/helpers/denoRuntime.ts`, `supabase/functions/_shared/` içine geçici
   * `*.compiled.<rastgele>.ts` dosyaları yazıp siler. Paralel vitest koşumunda bu glob o
   * dosyayı LİSTELEYİP okuyamadan kaybediyordu:
   *   `ENOENT: … supabase/functions/_shared/caller.compiled.8r1lgetw.ts`
   * Sonuç, dosya düzeyinde bir çökmedir (assertion değil) — özet satırında **kırmızı test
   * görünmez**, yalnız çıkış kodu 1 olur. Yani bu arıza "yeşil gibi" okunur; ayırt eden
   * ölçüt çıkış kodudur.
   *
   * Eager glob içeriği **filtre çalışmadan** okur; bu yüzden `Object.keys().filter(...)`
   * ya da bir `isExcluded` kontrolü YETMEZ — dışlama glob'un KENDİSİNDE olmalıdır.
   *
   * Bu çözüm depoda zaten kanıtlıydı: `edge-security.test.ts` aynı dizini aynı negatif
   * desenle okuyor. Kusur teşhis edilmiş ama onarım yalnız oraya uygulanmıştı; kardeş
   * dosyaya taşınmadığı için arıza burada yaşamaya devam etti.
   */
  ...import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
}
// KAYNAK-BLOK-BITIS

const kapsamMetni = (tam: boolean, taranan: number): string =>
  tam
    ? `TAM ağaç (${taranan} dosya): değişen liste okunamadı ya da kontrolün kendi kodu değişti`
    : `PR'ın DEĞİŞEN dosyaları (${taranan} dosya); tam ağaç dünya kolunda (comment-scrubber-scheme-safety-dunya.test.ts)`

describe('INV-SCRUB-1 · ölçüm ve otomasyon araçlarının yorum sıyırıcıları şema-güvenli (PR kolu)', () => {
  it('dedektör çalışıyor: taranan dosya sayısı makul (test + betik + edge)', () => {
    // Boş/az tarama "temiz" demek değil, "dedektör kör" demektir. Kanarya R1/R2 daralsa da HER ZAMAN tam ağaçtan sayılır.
    expect(Object.keys(KAYNAKLAR).length).toBeGreaterThan(KANARYA_ESIGI)
  })

  it('dedektör kendini doğrular: güvensizi yakalar, üç güvenli biçimi ve ilgisizi yakalamaz', () => {
    const ornek = ornekSatir

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

  it('R1 · PR kolu: değişen dosyalarda tabanda olmayan yeni bir şema-güvensiz sıyırıcı YOK', () => {
    const { yeni, tam, taranan } = r1YeniIhlaller(KAYNAKLAR, prDegisenleri())

    expect(
      yeni,
      [
        'Şema-güvensiz satır-yorumu sıyırıcısı: URL taşıyan satırda şemayı yorum sanar,',
        'satırın geri kalanını siler ve bekçiyi SESSİZCE kör bırakır (hep yeşil kalır).',
        '',
        'Düzeltme (kanonik biçim): yorum işaretinin önüne (?<!:) ön-bakışını koy.',
        'Sonra sıyırıcının şemayı yemediğini KANITLAYAN bir alt-sınır testi ekle — yalnız',
        'sıyırmayı değil, o satırdan hedefin GERÇEKTEN toplandığını da ölç.',
        '',
        `Kapsam: ${kapsamMetni(tam, taranan)}`,
        '',
        ...yeni,
      ].join('\n'),
    ).toEqual([])
  })

  it('R2 · PR kolu stale-guard: değişen TABAN dosyaları hâlâ ihlalli — düzeltilen dosya listeden çıkarılır', () => {
    const { bayat, tam, denetlenen } = r2BayatTaban(KAYNAKLAR, prDegisenleri())

    expect(
      bayat,
      [
        'Bu dosya(lar) artık şema-güvensiz DEĞİL — TABAN listesinden ÇIKAR.',
        'Ratchet ancak kısaldığında ratchet olur: bayat taban, düzeltilmiş bir kusuru hâlâ',
        'borç gibi gösterir ve bir sonraki okuyanı yanlış yere bakmaya iter.',
        '',
        `Kapsam: ${kapsamMetni(tam, denetlenen)} (denetlenen TABAN dosyası)`,
        '',
        ...bayat,
      ].join('\n'),
    ).toEqual([])
  })
})

/**
 * PR KOLUNUN KAPSAM KARARI — SENTETİK KAYNAK KÜMESİYLE (dosya sistemine ve git'e bağlı değil).
 *
 * Bu bloğun varlık sebebi: bölme, PR kolundan tam ağaç kontrolünü ÇIKARDI; geriye kalan güvence "değişen dosya listesi
 * doğru okunuyor ve belirsizlikte tam ağaca düşülüyor" cümlesidir. O cümle burada kollarıyla sabitlenir. Bir kol bozulursa
 * (daralma yanlış yönde çalışır, `null` boş kümeye çevrilir, kontrol kodu değişince tam tarama kalkar) ilgili `it` kırmızı verir.
 */
describe('INV-SCRUB-1 · PR kolunun kapsam kararı (sentetik kümeyle)', () => {
  const KOTU = ornekSatir('', '[^' + TERS + 'n]*') // şema-güvensiz sıyırıcı
  const TEMIZ = 'export const a = 1'
  const KUME: Record<string, string> = {
    '/scripts/kotu.cjs': KOTU,
    '/scripts/temiz.cjs': TEMIZ,
    '/src/lib/__tests__/duzelmis.test.ts': TEMIZ,
  }

  it('R1: ihlalli dosya DEĞİŞEN listedeyse PR kolu görür', () => {
    expect(r1YeniIhlaller(KUME, ['scripts/kotu.cjs'], [])).toEqual({
      yeni: ['scripts/kotu.cjs:1'],
      tam: false,
      taranan: 1,
    })
  })

  it('R1: ihlalli dosya değişmediyse PR kolu görmez, tam ağaç (dünya kolu) görür', () => {
    expect(r1YeniIhlaller(KUME, ['scripts/temiz.cjs'], [])).toEqual({ yeni: [], tam: false, taranan: 1 })
    expect(r1YeniIhlaller(KUME, null, [])).toEqual({ yeni: ['scripts/kotu.cjs:1'], tam: true, taranan: 3 })
  })

  it('R1: değişen liste OKUNAMADIYSA (null) boş küme DEĞİL, tam ağaç taranır (fail-closed)', () => {
    const r = r1YeniIhlaller(KUME, null, [])
    expect(r.tam).toBe(true)
    expect(r.taranan).toBe(Object.keys(KUME).length)
    expect(r.yeni).toEqual(['scripts/kotu.cjs:1'])
  })

  it('R1: liste OKUNDU ve kaynağa dokunulmadı (boş liste) ise boş küme taranır', () => {
    expect(r1YeniIhlaller(KUME, [], [])).toEqual({ yeni: [], tam: false, taranan: 0 })
  })

  it('R1: silinen dosya (değişen listede, kümede yok) taranacak kaynak sayılmaz', () => {
    expect(r1YeniIhlaller(KUME, ['scripts/silinmis.cjs'], [])).toEqual({ yeni: [], tam: false, taranan: 0 })
  })

  it('R1: kontrolün KENDİ kodu değiştiyse (dedektör, TABAN, iki kol) daralma kalkar, tam ağaç taranır', () => {
    for (const kod of KONTROL_KODU) {
      expect(r1YeniIhlaller(KUME, [kod], []), kod).toEqual({
        yeni: ['scripts/kotu.cjs:1'],
        tam: true,
        taranan: 3,
      })
    }
  })

  it('R1: tabandaki ihlalli dosya yeni sayılmaz', () => {
    expect(r1YeniIhlaller(KUME, ['scripts/kotu.cjs'], ['scripts/kotu.cjs']).yeni).toEqual([])
  })

  describe('R2', () => {
    const TABAN_DENEME = ['scripts/kotu.cjs', 'src/lib/__tests__/duzelmis.test.ts', 'scripts/silinmis.cjs']

    it('değişen TABAN dosyası düzelmişse (artık ihlalli değil) bayat sayılır', () => {
      expect(r2BayatTaban(KUME, ['src/lib/__tests__/duzelmis.test.ts'], TABAN_DENEME)).toEqual({
        bayat: ['src/lib/__tests__/duzelmis.test.ts'],
        tam: false,
        denetlenen: 1,
      })
    })

    it('değişen TABAN dosyası hâlâ ihlalliyse bayat DEĞİL', () => {
      expect(r2BayatTaban(KUME, ['scripts/kotu.cjs'], TABAN_DENEME)).toEqual({ bayat: [], tam: false, denetlenen: 1 })
    })

    it('TABAN dosyası silinmişse (değişen listede, kümede yok) bayattır: listeden çıkarılmalı', () => {
      expect(r2BayatTaban(KUME, ['scripts/silinmis.cjs'], TABAN_DENEME).bayat).toEqual(['scripts/silinmis.cjs'])
    })

    it('TABAN dosyasına dokunulmadıysa PR kolu denetlemez (bayatlık dünya kolunda görünür)', () => {
      expect(r2BayatTaban(KUME, ['scripts/temiz.cjs'], TABAN_DENEME)).toEqual({ bayat: [], tam: false, denetlenen: 0 })
    })

    it('değişen liste okunamadıysa (null) TÜM TABAN denetlenir (fail-closed)', () => {
      expect(r2BayatTaban(KUME, null, TABAN_DENEME)).toEqual({
        bayat: ['src/lib/__tests__/duzelmis.test.ts', 'scripts/silinmis.cjs'],
        tam: true,
        denetlenen: 3,
      })
    })

    it('kontrolün KENDİ kodu değiştiyse tüm TABAN denetlenir', () => {
      for (const kod of KONTROL_KODU) {
        const r = r2BayatTaban(KUME, [kod], TABAN_DENEME)
        expect(r.tam, kod).toBe(true)
        expect(r.denetlenen, kod).toBe(3)
      }
    })
  })

  it('kapsamla: okunamadı (null) tam küme aynen döner; okundu ise kesişim, tumu sırasında', () => {
    const tumu = ['b', 'a', 'c']
    expect(kapsamla(tumu, (x) => x, null)).toEqual({ liste: tumu, tam: true })
    expect(kapsamla(tumu, (x) => x, null).liste).toBe(tumu)
    expect(kapsamla(tumu, (x) => x, ['c', 'b', 'z'])).toEqual({ liste: ['b', 'c'], tam: false })
    expect(kapsamla(tumu, (x) => x, [])).toEqual({ liste: [], tam: false })
  })

  it('prDegisenleri: ortam dosyasındaki liste okunur; okunamayan ortam dosyası null döner, git denenmez', () => {
    const onceki = process.env.VENTHUB_DUNYA_DEGISEN_DOSYALAR
    const dizin = mkdtempSync(join(tmpdir(), 'cs-degisen-'))
    try {
      const dosya = join(dizin, 'degisen.txt')
      writeFileSync(dosya, 'scripts/a.cjs\nsrc/b.test.ts\n')
      process.env.VENTHUB_DUNYA_DEGISEN_DOSYALAR = dosya
      expect(prDegisenleri()).toEqual(['scripts/a.cjs', 'src/b.test.ts'])

      writeFileSync(dosya, '') // boş ortam dosyası = "değişiklik yok" (git'in boş çıktısı ise "ölçülemedi")
      expect(prDegisenleri()).toEqual([])

      process.env.VENTHUB_DUNYA_DEGISEN_DOSYALAR = join(dizin, 'yok.txt') // okunamıyor → git'e DÜŞÜLMEZ
      expect(prDegisenleri()).toBeNull()
    } finally {
      if (onceki === undefined) delete process.env.VENTHUB_DUNYA_DEGISEN_DOSYALAR
      else process.env.VENTHUB_DUNYA_DEGISEN_DOSYALAR = onceki
      rmSync(dizin, { recursive: true, force: true })
    }
  })
})

/**
 * KAYMA TESTİ — `import.meta.glob` bloğu iki kolda BAYT BAYT aynı mı?
 *
 * Dünya kolu bu dosyanın bloğunu kopyalar; kopya ayrışırsa iki kol FARKLI dosya kümelerini tararsa kapı hangi kümeyi
 * tarıyorsa onu sessizce daraltabilir (ör. dünya kolu `scripts/**` desenini kaybeder, PR kolu yeşil kalır).
 * İşaretler birleştirilerek yazıldı: bu kodun kaynağı işaretin kendisini TAŞIMAZ, yalnız gerçek blok taşır.
 */
const BLOK_BASI = '// KAYNAK-BLOK-' + 'BASLA'
const BLOK_SONU = '// KAYNAK-BLOK-' + 'BITIS'

function kaynakBlogu(metin: string): string | null {
  const duz = metin.replace(/\r\n/g, '\n')
  if (duz.split(BLOK_BASI).length !== 2 || duz.split(BLOK_SONU).length !== 2) return null
  const bas = duz.indexOf(BLOK_BASI)
  const son = duz.indexOf(BLOK_SONU)
  return son > bas ? duz.slice(bas, son + BLOK_SONU.length) : null
}

describe('INV-SCRUB-1 · KAYNAKLAR glob bloğu PR kolu ve dünya kolunda aynı (kayma testi)', () => {
  const PR_KOLU = resolve(__dirname, 'comment-scrubber-scheme-safety.test.ts')
  const DUNYA_KOLU = resolve(__dirname, 'comment-scrubber-scheme-safety-dunya.test.ts')

  it('iki dosyada da tam BİR blok var ve içerikleri aynı', () => {
    const pr = kaynakBlogu(readFileSync(PR_KOLU, 'utf8'))
    const dunya = kaynakBlogu(readFileSync(DUNYA_KOLU, 'utf8'))
    expect(pr, 'PR kolunda işaretli blok yok ya da birden çok').not.toBeNull()
    expect(dunya, 'dünya kolunda işaretli blok yok ya da birden çok').not.toBeNull()
    // Boş/kısa blok eşitliği anlamsızlaştırır (iki boş metin eşittir): glob çağrısının KENDİSİ blokta olmalı.
    expect(pr).toContain('import.meta.glob(')
    expect(pr).toContain('const KAYNAKLAR')
    expect(dunya).toBe(pr)
  })

  it('kayma testinin kendi mantığı: işaretsiz ya da çift işaretli kaynak null döner, farklı blok farklı çıkar', () => {
    expect(kaynakBlogu('işaretsiz')).toBeNull()
    expect(kaynakBlogu([BLOK_BASI, 'a', BLOK_BASI, 'b', BLOK_SONU].join('\n'))).toBeNull()
    expect(kaynakBlogu([BLOK_BASI, 'a', BLOK_SONU].join('\n'))).not.toBe(
      kaynakBlogu([BLOK_BASI, 'b', BLOK_SONU].join('\n')),
    )
    expect(kaynakBlogu(['x', BLOK_BASI, 'a', BLOK_SONU, 'y'].join('\n'))).toBe(
      kaynakBlogu([BLOK_BASI, 'a', BLOK_SONU].join('\n')),
    )
  })
})
