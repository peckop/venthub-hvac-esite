import { describe, expect, it } from 'vitest'

import {
  guvensizSatirlar,
  KANARYA_ESIGI,
  ornekSatir,
  r1YeniIhlaller,
  r2BayatTaban,
  TABAN,
  TERS,
} from './comment-scrubber-scheme-safety.yardimci'

/**
 * INV-SCRUB-1 — ölçüm ve otomasyon araçlarının yorum sıyırıcıları şema-güvenli olmalı. (DÜNYA kolu = TAM AĞAÇ)
 *
 * TETİK: src/, scripts/, supabase/functions/, scripts/ci/dunya-durumu-testleri.json
 * YER: zamanlı
 *
 * ⭐NİÇİN BU DOSYA AYRI (ALT-38i parça 2, 2026-11-08): bu dosya R1 ve R2'nin TAM ağaç hâlini taşır (tüm `src/` test
 * dosyaları, `scripts/` betikleri, `supabase/functions/` edge kodu). Sonuç, PR'ın değiştirdiği dosyalardan çok ağacın o
 * anki durumuna bağlıdır: suçsuz bir PR'ın yazarı, dokunmadığı bir dosyadaki kusuru düzeltemez. Karne ölçümü
 * (`docs/audits/test-karnesi-2026-10-09.json`, CI geçmişi 2026-07-06..10-07): PR kolunun da bulunduğu kapı 11 kırmızı
 * koşuda, 6 farklı dalda kırmızı verdi; 7'si tek dünya olayı kümesinde. Bu yüzden dosya PR kapısından ÇIKARILDI (liste:
 * `scripts/ci/dunya-durumu-testleri.json`): master'a her push'ta (`ci` işi, tam paket) ve zamanlı iş akışında
 * (`dunya-durumu.yml`) koşar; kırmızıyı her mesajdaki `DUNYA:` kanca satırı gösterir. Silinmedi, gevşetilmedi: aynı
 * ölçüt, aynı taban, aynı dedektör (hepsi `comment-scrubber-scheme-safety.yardimci.ts`'te TEK yerde); yalnız YERİ değişti
 * (cetvel: `docs/standards/test-karnesi-standard.md` §3).
 *
 * PR kapısında KALAN kol: `comment-scrubber-scheme-safety.test.ts`. Dedektörün kanaryasını ve kendini doğrulamasını taşır;
 * R1/R2'yi yalnız PR'ın DEĞİŞTİRDİĞİ dosyalarda koşar (değişen liste okunamazsa ya da kontrolün kendi kodu değişirse tam ağaç:
 * fail-closed). PR'ın eklediği şema-güvensiz sıyırıcı orada yakalanır.
 *
 * Bu kol HİÇBİR koşulda daralmaz: değişen listeyi OKUMAZ, kapsamı ortam değişkeniyle değişmez. Tam taramanın yapıldığı her
 * koşuda ayrıca ölçülür (`tam` bayrağı ve taranan dosya sayısı iddia edilir): kol sessizce daralırsa kırmızı verir.
 *
 * ÖLÇÜLEN KATMAN ve NİÇİN VAR: PR kolunun dosyasındaki başlıkta (T087-VH, 2026-08-18: satır-yorumu sıyırıcısı URL'in
 * şemasını yorum sanıp bekçiyi kör bırakır). Burada yinelenmez.
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


describe('INV-SCRUB-1 · ölçüm ve otomasyon araçlarının yorum sıyırıcıları şema-güvenli (DÜNYA kolu: tam ağaç)', () => {
  it('kanarya: taranan dosya sayısı makul (test + betik + edge)', () => {
    // Boş/az tarama "temiz" demek değil, "dedektör kör" demektir. PR kolundaki kanaryanın aynısı; bu kol tek başına
    // koşabildiği için (zamanlı iş akışı yalnız bu dosyayı koşar) kendi kanaryasını taşır.
    expect(Object.keys(KAYNAKLAR).length).toBeGreaterThan(KANARYA_ESIGI)
  })

  it('kanarya: dedektör canlı — şema-güvensiz biçimi yakalar, kanonik güvenli biçimi yakalamaz', () => {
    // Dedektör kör olursa R1 her ağaçta "temiz" döner; o yüzden tam taramadan ÖNCE canlı olduğu bu kolda da ölçülür.
    expect(guvensizSatirlar(ornekSatir('', '[^' + TERS + 'n]*'))).toHaveLength(1)
    expect(guvensizSatirlar(ornekSatir('(?<!:)', '[^' + TERS + 'n]*'))).toEqual([])
  })

  it('R1 · TAM ağaç: tabanda olmayan yeni bir şema-güvensiz sıyırıcı YOK', () => {
    // `null` = tam ağaç: bu kol değişen listeyi OKUMAZ, ortam değişkeni kapsamı daraltamaz.
    const { yeni, tam, taranan } = r1YeniIhlaller(KAYNAKLAR, null)

    expect(tam, 'dünya kolu daralmış tarama yapıyor: kapsam kararı bozuldu').toBe(true)
    expect(taranan, 'dünya kolu tüm kaynakları taramadı').toBe(Object.keys(KAYNAKLAR).length)
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
        ...yeni,
      ].join('\n'),
    ).toEqual([])
  })

  it('R2 · TAM ağaç stale-guard: taban BAYATLAMAZ — düzeltilen dosya listeden çıkarılır', () => {
    const { bayat, tam, denetlenen } = r2BayatTaban(KAYNAKLAR, null)

    expect(tam, 'dünya kolu daralmış tarama yapıyor: kapsam kararı bozuldu').toBe(true)
    expect(denetlenen, 'dünya kolu TABAN listesinin tamamını denetlemedi').toBe(TABAN.length)
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
