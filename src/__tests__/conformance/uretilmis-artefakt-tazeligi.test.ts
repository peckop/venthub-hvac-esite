import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  ARTEFAKT_MANIFESTI,
  type ArtefaktManifesti,
  ayrisiyorMesaji,
  bagimsizBayatArtefaktlar,
  dondurulmusModSatirlari,
  girdiDegisti,
  headBlobHaritasi,
  icerikKapsamindakiler,
  ILAN_DOSYASI,
  ILAN_KANARYA_MESAJI,
  ILAN_TABANI,
  ilanEdilenArtefaktlar,
  izlenenDosyalar,
  kanarya,
  kapsamSatiri,
  kaynagiDegisenArtefaktlar,
  KAYNAK_HARITASI_KANARYA_MESAJI,
  KAYNAK_HARITASI_TABANI,
  kaynakHaritasiToplami,
  KENDI_GIRDILERI,
  type Kural,
  kuralIcerikOzeti,
  kuralIlanIzlenen,
  kuralIlanManifestAyni,
  kuralIzlenmeyenKaynak,
  kuralKayitEksiksiz,
  kuralManifestIzlenen,
  kuralManifestVar,
  MANIFEST_KANARYA_MESAJI,
  MANIFEST_TABANI,
  type ManifestKaydi,
  manifestOku,
  olculemediMesaji,
  prKapsami,
  sayimModulu,
  tasiyiciAcikBayatMesaji,
  UYKUDA,
} from './uretilmis-artefakt-tazeligi.yardimci'

/**
 * INV-DOC-3 · INV-DOC-4 — ÜRETİLEN ARTEFAKT DEPODA VAR VE TAZE Mİ (T021-OR) · PR KOLU
 *
 * NİÇİN VAR
 * =========
 * Boru hattı bir artefakt (master `.md`) ÜRETİR, DİSKE YAZAR ve gerisini insana
 * bırakır. "Üretildi mi, depoya girdi mi, kaynağıyla aynı sürümden mi" diye
 * soran bir kapı YOKTU. 2026-08-26'da ısırdı ve kusuru **kapı değil İNSAN**
 * buldu:
 *
 *   PR #821 `.cc_docs.yaml`'a iki küme master'ı TANIMLADI (40 satırlık ayar).
 *   Üretilen dosyalar geçici bir worktree'de doğdu, dijital ikize oradan
 *   yüklendi, worktree silinince yerel kopyalar öldü. Depoda HİÇ görünmediler.
 *   Yani TARİF depoya girdi, ÜRÜN girmedi — ve hiçbir test bunu sormadı.
 *
 * İKİ AYRI SORU, İKİ AYRI KAPI
 * ============================
 *   · INV-DOC-3 (Kapı C) — yaml'ın İLAN ETTİĞİ her artefakt depoda VAR MI?
 *   · INV-DOC-4 (Kapı A) — depodaki artefakt, manifestteki özetle EŞLEŞİYOR MU?
 *
 * Kapı C "ürün hiç gelmedi"yi, Kapı A "ürün geldi ama bozuldu"yu yakalar.
 * Birini diğerinin yerine koymak kör nokta bırakır: kaynak hiç değişmeden ürün
 * elle bozulursa (editörde açılıp kaydedilir, betik üstüne yazar, merge
 * çakışması yanlış çözülür) Kapı C yeşil kalır.
 *
 * ⭐CI GELİŞTİRİCİNİN DİSKİNİ GÖREMEZ
 * ===================================
 * "Üretildi ama commit'lenmedi" durumu tanım gereği yalnız yerel makinede
 * vardır — PR'a giren şey zaten commit'lenmiştir. O soruyu CI'da sormak, hiç
 * kırmızı yanmayacak bir kapı kurmak olurdu. O ayak YERELDE koşar
 * (`orion doc durum`, `pre-push`). Buradaki kapılar DEPO İÇİNİ ölçer ve
 * koşumun hangi ağaçta yapıldığından BAĞIMSIZDIR.
 *
 * ⭐İŞ AKIŞI BEDELİ AÇIKÇA YAZILIDIR (cetvel: `uretilmis-artefakt-standard.md`)
 * =============================================================================
 * Bu kapı bir bedel getirir: doküman kaynaklarına dokunan PR, `orion doc build`
 * çıktısını da AYNI PR'da taşımak zorundadır. Bedel kabul edilmiştir ama
 * YAZILI olmalıdır — yazılmayan bedel, kırmızıyı atlatma alışkanlığı doğurur
 * (T033: rastgele patlayan `pre-commit` tüm filoda `--no-verify` alışkanlığı
 * doğurdu). Bu yüzden her kırmızı mesaj KOŞULACAK TAM KOMUTU basar.
 *
 * ⭐BÖLME (ALT-38i parça 2, cetvel: `docs/standards/test-karnesi-standard.md` §3 ve §7.4)
 * =====================================================================================
 * Bu dosya PR KOLUDUR. Kuralların TAM denetimi `uretilmis-artefakt-tazeligi-dunya.test.ts`tedir (master push + zamanlı koşu,
 * `scripts/ci/dunya-durumu-testleri.json`); iki dosya AYNI kural kodunu (`uretilmis-artefakt-tazeligi.yardimci.ts`) çağırır, fark
 * yalnız KAPSAMDIR. Karne (docs/audits/test-karnesi-2026-10-09.json): 36 kırmızı koşu, 29 dal, 32'si dünya olayı kümesinde, PR'a ait 4.
 *   · FİKSTÜR ve KANARYA testleri her PR'da, tam veriyle koşar: sayım ayırt eder, ölçememek geçmek değildir, ilan/manifest/kaynak
 *     haritası boş olamaz, PR kapsamı kararının karar tablosu.
 *   · Veriyi ölçen kurallar yalnız GİRDİSİ bu PR'da değiştiyse koşar (yardımcının "PR KAPSAMI" bölümü): ilan yaml'ı, manifest ya da
 *     artefaktın kendisi. Elle düzenlenmiş artefakt, silinmiş artefakt, manifestten silinen kayıt, bozuk özet böylece PR kapısında kalır.
 *   · Liste okunamazsa ya da kontrolün kendi kodu değişirse HER kural eski haliyle, tam veriyle koşar (fail-closed).
 *   · Kapsam kararı günlükte tek satırla görünür; sessiz dışlama yoktur.
 */

const KAPSAM = prKapsami()
const MANIFEST = manifestOku()
const ILAN = ilanEdilenArtefaktlar()
const IZLENEN = izlenenDosyalar()
const BLOBLAR = headBlobHaritasi()
const ARTEFAKTLAR: ManifestKaydi[] = MANIFEST?.artefaktlar ?? []

/** Her kuralın GİRDİSİ: bunlardan biri PR'da değiştiyse (ya da kapsam tamsa) kural koşar. */
const ILAN_GIRDILERI = [ILAN_DOSYASI, ...ILAN]
const MANIFEST_GIRDISI = [ARTEFAKT_MANIFESTI]
const MANIFEST_VE_ARTEFAKTLAR = [ARTEFAKT_MANIFESTI, ...ARTEFAKTLAR.map((a) => a.yol)]
const YAML_VE_MANIFEST = [ILAN_DOSYASI, ARTEFAKT_MANIFESTI]

const ILAN_KOSTU = girdiDegisti(KAPSAM, ILAN_GIRDILERI)
const MANIFEST_KOSTU = girdiDegisti(KAPSAM, MANIFEST_VE_ARTEFAKTLAR)
const ICERIK_KAPSAMI = icerikKapsamindakiler(ARTEFAKTLAR, KAPSAM)
const BAYATLIK_KAPSAMI = kaynagiDegisenArtefaktlar(ARTEFAKTLAR, KAPSAM)

/** Girdisi değişmemiş kural için "tutuyor" sonucu; kural koşmaz (kapsam satırı bunu açıkça yazar). */
function kapsamliKos(girdiler: string[], kural: () => Kural): Kural {
  return girdiDegisti(KAPSAM, girdiler) ? kural() : { ihlaller: [], mesaj: '' }
}

describe('INV-DOC · PR kolu — kapsam kararı görünür ve karar tablosu doğru', () => {
  it('kapsam kararı günlüğe tek satırla yazılır (dışlama sessiz bir karar olamaz)', () => {
    const satir = kapsamSatiri(KAPSAM, {
      ilan: ILAN_KOSTU,
      manifest: MANIFEST_KOSTU,
      icerik: ICERIK_KAPSAMI.length,
      bayatlik: BAYATLIK_KAPSAMI.length,
      toplamArtefakt: ARTEFAKTLAR.length,
    })
    process.stdout.write(`${satir}\n`)
    expect(satir, 'kapsam satırı kararı ve sayıları taşımalı').toMatch(/kapsam=(TAM|DAR)/)
    expect(satir).toMatch(new RegExp(`içerik-özeti=${ICERIK_KAPSAMI.length}/${ARTEFAKTLAR.length}`))
  })

  // ⭐Aşağıdaki fikstürler karar mantığını ÜRETTİĞİ durumla sınar; depodaki gerçek diff'e GÜVENMEZ (§25).
  const kayit = (yol: string, kaynaklar: string[]): ManifestKaydi => ({
    ad: yol,
    yol,
    kaynak_kumesi: ['src'],
    kaynak_commit: 'c',
    icerik_sha256: 'h',
    kaynak: {
      ozet: 'o',
      dosya_sayisi: kaynaklar.length,
      izlenmeyen: [],
      dosyalar: Object.fromEntries(kaynaklar.map((k) => [k, 'sha'])),
    },
  })
  const a = kayit('docs/a_master.md', ['src/x.ts', 'src/ortak.ts'])
  const b = kayit('docs/b_master.md', ['src/y.ts', 'src/ortak.ts'])
  const hepsi = [a, b]

  it('FAIL-CLOSED: değişen liste okunamadıysa (null) her kural TAM veriyle koşar', () => {
    const k = prKapsami(null)
    expect(k.tam).toBe(true)
    expect(girdiDegisti(k, [ARTEFAKT_MANIFESTI])).toBe(true)
    expect(icerikKapsamindakiler(hepsi, k)).toEqual(hepsi)
    expect(kaynagiDegisenArtefaktlar(hepsi, k)).toEqual(hepsi)
  })

  it('ilgisiz dosya değişince kural girdisi DEĞİŞMEMİŞ sayılır, kapsam boşalır (ama null değil, okunmuş liste)', () => {
    const k = prKapsami(['README.md', 'src/baska.ts'])
    expect(k.tam).toBe(false)
    expect(girdiDegisti(k, [ILAN_DOSYASI])).toBe(false)
    expect(girdiDegisti(k, [ARTEFAKT_MANIFESTI, a.yol, b.yol])).toBe(false)
    expect(icerikKapsamindakiler(hepsi, k)).toEqual([])
    expect(kaynagiDegisenArtefaktlar(hepsi, k)).toEqual([])
  })

  it('artefaktın KENDİSİ değişince yalnız o artefaktın içerik özeti denetlenir; kaynak sayılmaz (parity boş)', () => {
    const k = prKapsami([b.yol])
    expect(girdiDegisti(k, [ARTEFAKT_MANIFESTI, a.yol, b.yol])).toBe(true)
    expect(girdiDegisti(k, [ARTEFAKT_MANIFESTI])).toBe(false)
    expect(icerikKapsamindakiler(hepsi, k)).toEqual([b])
    expect(kaynagiDegisenArtefaktlar(hepsi, k)).toEqual([])
  })

  it('MANİFEST değişince HEPSİ denetlenir (özet manifestte oynamış olabilir; artefakt diff’te görünmez)', () => {
    const k = prKapsami([ARTEFAKT_MANIFESTI])
    expect(icerikKapsamindakiler(hepsi, k)).toEqual(hepsi)
    expect(kaynagiDegisenArtefaktlar(hepsi, k)).toEqual(hepsi)
  })

  it('bir KAYNAK değişince yalnız o kaynağı taşıyan artefaktlar parity kapsamına girer', () => {
    expect(kaynagiDegisenArtefaktlar(hepsi, prKapsami(['src/x.ts']))).toEqual([a])
    expect(kaynagiDegisenArtefaktlar(hepsi, prKapsami(['src/y.ts']))).toEqual([b])
    expect(kaynagiDegisenArtefaktlar(hepsi, prKapsami(['src/ortak.ts']))).toEqual(hepsi)
    expect(kaynagiDegisenArtefaktlar(hepsi, prKapsami(['src/x.tsx']))).toEqual([])
  })

  it('kontrolün KENDİ girdisi değişince kapsam TAMdır (kuralın kendisi değişmişken “girdi değişmedi” denemez)', () => {
    for (const girdi of KENDI_GIRDILERI) {
      const k = prKapsami(['README.md', girdi])
      expect(k.tam, `${girdi} değişti ama kapsam dar kaldı`).toBe(true)
    }
    expect(prKapsami(['README.md']).tam).toBe(false)
  })

  it('yaml ya da ilan edilen artefakt değişince ilan kuralı koşar; ilgisiz değişimde koşmaz', () => {
    expect(girdiDegisti(prKapsami([ILAN_DOSYASI]), [ILAN_DOSYASI, a.yol])).toBe(true)
    expect(girdiDegisti(prKapsami([a.yol]), [ILAN_DOSYASI, a.yol])).toBe(true)
    expect(girdiDegisti(prKapsami(['README.md']), [ILAN_DOSYASI, a.yol])).toBe(false)
  })
})

describe('INV-DOC-3 · Kapı C — yaml ürünü ilan ediyorsa ürün DEPODA olmalı', () => {
  it('vacuous-guard: yaml okuması gerçekten artefakt buldu', () => {
    // ⭐EN SİNSİ ARIZA BİÇİMİ: yaml okuması bozulur, liste boşalır, ve aşağıdaki
    // iddia HİÇBİR ŞEY ölçmeden yeşil yanar. Kapsamı boşalan bir kapının
    // sessizce geçmesi, kapının hiç olmamasından KÖTÜDÜR: var sanılır.
    // KANARYA TAM VERİDEN hesaplanır, PR kapsamından bağımsızdır.
    const k = kanarya(ILAN.length, ILAN_TABANI, '.cc_docs.yaml ilanı', ILAN_KANARYA_MESAJI)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('ilan edilen her artefakt depoda İZLENEN bir dosya · PR kapsamı: yaml ya da ilan edilen artefakt değişince', () => {
    const k = kapsamliKos(ILAN_GIRDILERI, () => kuralIlanIzlenen(ILAN, IZLENEN))
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

describe('INV-DOC-4 · Kapı A — depodaki artefakt manifestle EŞLEŞİYOR mu', () => {
  it('artefakt manifesti depoda VAR (ölçülemedi ≠ geçti) · PR kapsamı: manifest değişince', () => {
    const k = kapsamliKos(MANIFEST_GIRDISI, () => kuralManifestVar(MANIFEST))
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('vacuous-guard: manifest gerçekten artefakt sayıyor', () => {
    const k = kanarya(ARTEFAKTLAR.length, MANIFEST_TABANI, 'manifest artefaktları', MANIFEST_KANARYA_MESAJI)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('manifestteki her artefakt depoda İZLENEN bir dosya · PR kapsamı: manifest ya da artefakt değişince', () => {
    const k = kapsamliKos(MANIFEST_VE_ARTEFAKTLAR, () => kuralManifestIzlenen(MANIFEST, IZLENEN))
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('⭐depodaki artefaktın içeriği manifestteki özetle AYNI · PR kapsamı: değişen artefakt (manifest değiştiyse hepsi)', () => {
    const k = kuralIcerikOzeti(ICERIK_KAPSAMI, IZLENEN)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('manifest kayıtları eksiksiz (alan atlanarak kapı köreltilemez) · PR kapsamı: manifest değişince', () => {
    const k = kapsamliKos(MANIFEST_GIRDISI, () => kuralKayitEksiksiz(MANIFEST))
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

describe('Kapı C ile Kapı A birbirini kapsamıyor — ikisi de gerekli', () => {
  it('yaml ilanı ile manifest kaydı AYNI kümeyi gösteriyor · PR kapsamı: yaml ya da manifest değişince', () => {
    const k = kapsamliKos(YAML_VE_MANIFEST, () => kuralIlanManifestAyni(ILAN, MANIFEST))
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

describe('INV-DOC-4b · Kapı A ikinci ayak — kaynak derlemeden sonra DEĞİŞTİ mi', () => {
  /**
   * ⭐DONDURULMUŞ MOD (REC-132 · D1, Recep/OPS kararı 2026-09-04) — BLOKLAMAZ, SAYAR.
   *
   * NİÇİN: bu kol her şeridin PR'ında üretilmiş toplamaların yol almasını zorunlu kılıyordu.
   * Ölçüldü (2026-09-03/04): **yedi** taban tazelemesi, her biri tam bir CI koşumu; ve İKİ
   * PR'da kapılar **hiç doğmadı**, çünkü çakışık PR'ın birleşme ref'i üretilemiyor. Yani
   * sınıf yalnız zaman yakmıyor, **sahte yeşil** de üretiyor.
   *
   * ⚠KAPI SİLİNMEDİ, EŞİK UZATILMADI. Ölçüm sürüyor; yalnız bloklamıyor. Bir kapıyı kapatmak
   * ölçümü susturmak değildir (§21: kabul edilen boşluk sessiz olamaz). C4'te (companion)
   * aynı biçim uygulandı.
   *
   * ⚠DONDURULAN KOL YALNIZ BU: "kaynak derlemeden sonra değişti mi" (parity). Bu describe'ın
   * DİĞER İKİ kolu (izlenmeyen kaynak + vacuous-guard) ve **AXIOM 3 kolu** — INV-DOC-4
   * içindeki *"depodaki artefaktın içeriği manifestteki özetle AYNI"* — **BLOKLAMAYA DEVAM
   * EDER.** Üretilmiş dosyayı elle düzenlemek hâlâ KIRMIZIDIR.
   *
   * (Bu ayrımı bir plan-challenger buldu: ilk planım "INV-DOC-4b'nin İKİ kolu var" diyordu;
   * ÜÇ kolu var ve üçü de kaynak tarafında, elle-düzenleme kolu başka bir değişmezin içinde.
   * Yanlış kolu dondurmak kapıyı SESSİZCE BOŞALTIRDI.)
   *
   * §26 TEK KAYNAK: sayı `scripts/hijyen/artefakt-bayatlik-sayim.cjs`ten gelir; bu kol onun
   * TÜKETİCİSİDİR ve kendi BAĞIMSIZ hesabıyla çapraz doğrular — paylaşılan tek uygulama iki
   * yönde birden yanılabilir.
   *
   * ⭐PR KOLU: yalnız KAYNAĞI bu PR'da değişen artefaktlar sayılır (manifest de değiştiyse hepsi); sayımın kendisi
   * `sayimModulu.sayimCekirdegi`dir, daraltılmış manifestle çağrılır (kopya mantık YOK). Taşıyıcı AÇIK iken bu kapsamdaki bayat
   * artefakt bloklar. Tam sayım ve AÇIK iken tam blok: dünya kolu (`uretilmis-artefakt-tazeligi-dunya.test.ts`).
   */
  it('⭐DONDURULMUŞ MOD: parity BLOKLAMAZ ama SAYAR, ve sayı MODÜLDEN gelir (§26) · PR kapsamı: kaynağı değişen artefaktlar', () => {
    const olcum = sayimModulu.sayimCekirdegi({
      manifest: MANIFEST === null ? null : ({ ...MANIFEST, artefaktlar: BAYATLIK_KAPSAMI } as ArtefaktManifesti),
      bloblar: BLOBLAR,
    })
    expect(olcum.olculdu, olculemediMesaji(undefined)).toBe(true)

    // BAĞIMSIZ HESAP — modülün dediğini tekrar etmek tautoloji olurdu.
    const bagimsiz = bagimsizBayatArtefaktlar(BAYATLIK_KAPSAMI, BLOBLAR)
    expect(olcum.artefaktSayisi, ayrisiyorMesaji(olcum.artefaktSayisi, bagimsiz.length)).toBe(bagimsiz.length)

    // Kabul edilen boşluk SESSİZ olamaz: sayım her koşuda görünür.
    process.stdout.write(dondurulmusModSatirlari(olcum))

    // ⭐TAŞIYICI AÇIKSA DONMA BİTER: üretim çalışıyorsa bayat artefakt gerçek bir ihmaldir
    // ve bloklar. Donmanın gerekçesi "üretemiyoruz" idi; o koşul kalkınca gerekçe de kalkar.
    if (!UYKUDA) {
      expect(
        olcum.artefaktSayisi,
        tasiyiciAcikBayatMesaji(olcum.artefaktSayisi, olcum.bayat.map((x) => x.artefakt)),
      ).toBe(0)
    }
  })

  it('⭐SAYIM AYIRT EDER: bayat kaynak eklenince sayı ARTAR (kelime değil SAYI ölçülür)', () => {
    // Saf çekirdek fikstürü — durumu ÜRETİR, depoda bayat dosya bulunmasına GÜVENMEZ (§25).
    const temizManifest = {
      artefaktlar: [{ yol: 'docs/a_master.md', kaynak: { dosyalar: { 'src/x.ts': 'aaa' } } }],
    }
    const temizBloblar = new Map([['src/x.ts', 'aaa']])
    const temiz = sayimModulu.sayimCekirdegi({ manifest: temizManifest, bloblar: temizBloblar })
    expect(temiz.artefaktSayisi, 'eşleşen kaynak bayat sayıldı — yanlış alarm').toBe(0)

    const bayatBloblar = new Map([['src/x.ts', 'bbb']])
    const bayatOlcum = sayimModulu.sayimCekirdegi({
      manifest: temizManifest, bloblar: bayatBloblar,
    })
    expect(bayatOlcum.artefaktSayisi, 'kaynak değişti ama sayı ARTMADI').toBe(1)
    expect(bayatOlcum.kaynakSayisi, 'kaynak sayısı taşınmıyor').toBe(1)

    // SİLİNEN kaynak da bayatlıktır — ayrı yön, ayrı ölçüm.
    const silinmis = sayimModulu.sayimCekirdegi({ manifest: temizManifest, bloblar: new Map() })
    expect(silinmis.artefaktSayisi, 'silinen kaynak bayatlık saymadı').toBe(1)

    // Özet satırı SAYIYI taşır — sabit metin sabotajı burada yakalanır.
    expect(
      sayimModulu.ozetSatiri(bayatOlcum),
      'Özet satırı sayıyı taşımıyor. Sabit metin, sayaç bozulsa bile aynı kalır ve ' +
        'ayırt etmeyen gösterge ölçüm değildir.',
    ).toMatch(/\b1 artefakt\b/)
    expect(sayimModulu.ozetSatiri(temiz), 'bayat YOK hâli ayrı yazılmıyor').toMatch(/YOK/)
  })

  it('ÖLÇEMEMEK GEÇMEK DEĞİL: manifest okunamazsa "bayat yok" DENMEZ', () => {
    const yok = sayimModulu.sayimCekirdegi({ manifest: null, bloblar: new Map() })
    expect(yok.olculdu, 'manifest yokken ölçülmüş gibi döndü').toBe(false)
    expect(
      sayimModulu.ozetSatiri(yok),
      '"ölçemedim" ile "bayat yok" aynı cümleye düşmüş — iki AYRI cevap',
    ).toMatch(/OLCULEMEDI/)
  })

  it('manifest derleme anında İZLENMEYEN kaynak taşımıyor · PR kapsamı: manifest değişince', () => {
    const k = kapsamliKos(MANIFEST_GIRDISI, () => kuralIzlenmeyenKaynak(MANIFEST))
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('vacuous-guard: kaynak haritası gerçekten dolu', () => {
    // Harita boşalırsa yukarıdaki iddia HİÇBİR ŞEY ölçmeden yeşil yanar.
    // KANARYA TAM VERİDEN hesaplanır, PR kapsamından bağımsızdır.
    const k = kanarya(
      kaynakHaritasiToplami(MANIFEST),
      KAYNAK_HARITASI_TABANI,
      'manifest kaynak haritası',
      KAYNAK_HARITASI_KANARYA_MESAJI,
    )
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

/**
 * KURAL İŞLEVLERİ İHLAL VEREBİLİR Mİ (denetçi önemli bulgusu, #2369)
 *
 * İki kol da aynı yedi `kural*` işlevini gerçek, TEMİZ veriyle çağırır. Bir işlev bozulup hep `[]` dönse iki kol da aynı anda
 * sessizce yeşil kalırdı. Burada her işleve bir İHLALLİ girdi verilir: boş dönmemeli ve ihlalin adını taşımalı.
 */
describe('INV-DOC · kural işlevleri ihlali yakalar (fikstür)', () => {
  const kayit = (yol: string, ozet: string, ek: Partial<ManifestKaydi> = {}): ManifestKaydi => ({
    ad: 'x',
    yol,
    kaynak_kumesi: ['a'],
    kaynak_commit: 'c',
    icerik_sha256: ozet,
    kaynak: { ozet: 'o', dosya_sayisi: 1, dosyalar: { 'docs/README.md': 'h' }, izlenmeyen: [] },
    ...ek,
  })
  const manifestOlustur = (...kayitlar: ManifestKaydi[]): ArtefaktManifesti => ({
    surum: 1,
    kaynak_commit: 'c',
    calisma_agaci: 'temiz',
    artefaktlar: kayitlar,
  })

  it('kuralIlanIzlenen: ilan edilen ama izlenmeyen artefakt ihlaldir', () => {
    expect(kuralIlanIzlenen(['docs/yok.md'], new Set(['docs/var.md'])).ihlaller).toEqual(['docs/yok.md'])
    expect(kuralIlanIzlenen(['docs/var.md'], new Set(['docs/var.md'])).ihlaller).toEqual([])
  })

  it('kuralManifestVar: manifest yoksa (null) ihlaldir', () => {
    expect(kuralManifestVar(null).ihlaller).toEqual([ARTEFAKT_MANIFESTI])
    expect(kuralManifestVar(manifestOlustur(kayit('docs/a.md', 'x'))).ihlaller).toEqual([])
  })

  it('kuralManifestIzlenen: manifestte olup izlenmeyen artefakt ihlaldir', () => {
    const m = manifestOlustur(kayit('docs/yok.md', 'x'), kayit('docs/var.md', 'x'))
    expect(kuralManifestIzlenen(m, new Set(['docs/var.md'])).ihlaller).toEqual(['docs/yok.md'])
  })

  it('kuralIcerikOzeti: manifestteki özet depodakiyle uyuşmuyorsa ihlaldir; izlenmeyen artefakt bu kuralın konusu değildir', () => {
    const yanlis = kayit('docs/README.md', '0'.repeat(64))
    const k = kuralIcerikOzeti([yanlis], new Set(['docs/README.md']))
    expect(k.ihlaller.length, 'yanlış özet yakalanmadı').toBe(1)
    expect(k.ihlaller[0]).toContain('docs/README.md')
    expect(kuralIcerikOzeti([yanlis], new Set()).ihlaller, 'izlenmeyen ayrı kuralın işi').toEqual([])
  })

  it('kuralKayitEksiksiz: özetsiz, yolsuz ya da kaynak kümesiz kayıt ihlaldir', () => {
    const m = manifestOlustur(
      kayit('docs/a.md', ''),
      kayit('', 'x'),
      kayit('docs/b.md', 'x', { kaynak_kumesi: [] }),
      kayit('docs/tam.md', 'x'),
    )
    expect(kuralKayitEksiksiz(m).ihlaller).toEqual(['docs/a.md', '(yolsuz kayıt)', 'docs/b.md'])
  })

  it('kuralIlanManifestAyni: yaml ilan eder ama manifest kaydetmemişse ihlaldir', () => {
    const m = manifestOlustur(kayit('docs/a.md', 'x'))
    expect(kuralIlanManifestAyni(['docs/a.md', 'docs/b.md'], m).ihlaller).toEqual(['docs/b.md'])
    expect(kuralIlanManifestAyni(['docs/a.md'], m).ihlaller).toEqual([])
  })

  it('kuralIzlenmeyenKaynak: derleme anında izlenmeyen kaynak taşıyan manifest ihlaldir', () => {
    const kirli = kayit('docs/a.md', 'x', {
      kaynak: { ozet: 'o', dosya_sayisi: 1, dosyalar: { 'docs/README.md': 'h' }, izlenmeyen: ['docs/yeni.md'] },
    })
    expect(kuralIzlenmeyenKaynak(manifestOlustur(kirli)).ihlaller.length).toBe(1)
    expect(kuralIzlenmeyenKaynak(manifestOlustur(kayit('docs/a.md', 'x'))).ihlaller).toEqual([])
  })

  it('KENDI_GIRDILERI: listedeki her yol depoda var (yazım hatası sessizce hiç tetiklenmezdi)', () => {
    const yok = KENDI_GIRDILERI.filter((y) => !existsSync(resolve(process.cwd(), y)))
    expect(yok, 'KENDI_GIRDILERI var olmayan yol içeriyor').toEqual([])
  })
})
