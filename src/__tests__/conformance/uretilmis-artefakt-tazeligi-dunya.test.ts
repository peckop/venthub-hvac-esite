import { describe, expect, it } from 'vitest'

import {
  ayrisiyorMesaji,
  bagimsizBayatArtefaktlar,
  bayatlikDokumu,
  bayatlikDokumuMetni,
  dondurulmusModSatirlari,
  headBlobHaritasi,
  ILAN_KANARYA_MESAJI,
  ILAN_TABANI,
  ilanEdilenArtefaktlar,
  izlenenDosyalar,
  kanarya,
  KAYNAK_HARITASI_KANARYA_MESAJI,
  KAYNAK_HARITASI_TABANI,
  kaynakHaritasiToplami,
  kuralIcerikOzeti,
  kuralIlanIzlenen,
  kuralIlanManifestAyni,
  kuralIzlenmeyenKaynak,
  kuralKayitEksiksiz,
  kuralManifestIzlenen,
  kuralManifestVar,
  MANIFEST_KANARYA_MESAJI,
  MANIFEST_TABANI,
  manifestOku,
  olculemediMesaji,
  repoKoku,
  sayimModulu,
  tasiyiciAcikBayatMesaji,
  UYKUDA,
} from './uretilmis-artefakt-tazeligi.yardimci'

/**
 * INV-DOC-3 · INV-DOC-4 · INV-DOC-4b — ÜRETİLEN ARTEFAKT DEPODA VAR VE TAZE Mİ · DÜNYA KOLU (TAM DENETİM)
 *
 * ⭐NİÇİN BU DOSYA AYRI (ALT-38i parça 2, cetvel: `docs/standards/test-karnesi-standard.md` §3 ve §7.4):
 * `uretilmis-artefakt-tazeligi.test.ts` PR kapısında KALDI ve kuralları yalnız PR'ın dokunduğu girdiler için koşar. Bu dosya AYNI
 * kuralları HER ZAMAN depodaki TÜM veriyle koşar ve PR kapısından ÇIKARILDI (liste: `scripts/ci/dunya-durumu-testleri.json`):
 * master'a her push'ta (`ci` işi, tam paket) ve zamanlı iş akışında (`dunya-durumu.yml`) koşar; kırmızıyı her mesajdaki `DUNYA:`
 * kanca satırı gösterir. Silinmedi, gevşetilmedi: aynı kural kodu (`uretilmis-artefakt-tazeligi.yardimci.ts`), aynı eşikler,
 * yalnız YERİ ve KAPSAMI değişti.
 *
 * KARNE (docs/audits/test-karnesi-2026-10-09.json, pencere 2026-07-06..10-07): bu test 36 kırmızı koşu verdi, 29 farklı dalda;
 * 32'si dünya olayı kümesinde (3 küme), master push 1, PR'a ait yalnız 4 (hepsi sonraki koşuda düzeldi). Kırmızıların çoğu PR'ın
 * kodundan değil, master'daki kaynak/manifest durumunun PR'dan bağımsız kaymasındandı: bir kaynağı değiştiren HER master
 * birleşmesinden sonra açık PR'ların hepsi, kendi dosyasına dokunmadan kırmızıya dönüyordu.
 *
 * Fixture ve kanarya kolları PR kolunda da koşar (sayım ayırt eder, ölçememek geçmek değil, kapsam kararı); burada yalnız
 * KANARYALAR ayrıca tekrarlanır ki bu dosya "ölçecek veri yok" iken sessizce yeşil kalmasın (zamanlı koşuda yalnız bu dosya koşar).
 * Taşıyıcı anahtarı (`.companion-tasiyici.json`) AÇIK iken parity kolu BLOKLAR: üretim çalışıyorsa bayat artefakt ödenebilir bir borçtur.
 */

const MANIFEST = manifestOku()
const ILAN = ilanEdilenArtefaktlar()
const IZLENEN = izlenenDosyalar()
const BLOBLAR = headBlobHaritasi()
const ARTEFAKTLAR = MANIFEST?.artefaktlar ?? []

describe('DÜNYA · kanaryalar — tam veri boş değil (zamanlı koşuda yalnız bu dosya koşar)', () => {
  it('yaml okuması gerçekten artefakt buldu', () => {
    const k = kanarya(ILAN.length, ILAN_TABANI, '.cc_docs.yaml ilanı', ILAN_KANARYA_MESAJI)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('manifest gerçekten artefakt sayıyor', () => {
    const k = kanarya(ARTEFAKTLAR.length, MANIFEST_TABANI, 'manifest artefaktları', MANIFEST_KANARYA_MESAJI)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('kaynak haritası gerçekten dolu', () => {
    const k = kanarya(
      kaynakHaritasiToplami(MANIFEST),
      KAYNAK_HARITASI_TABANI,
      'manifest kaynak haritası',
      KAYNAK_HARITASI_KANARYA_MESAJI,
    )
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

describe('INV-DOC-3 · Kapı C — yaml ürünü ilan ediyorsa ürün DEPODA olmalı · DÜNYA (tam)', () => {
  it('ilan edilen her artefakt depoda İZLENEN bir dosya', () => {
    const k = kuralIlanIzlenen(ILAN, IZLENEN)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

describe('INV-DOC-4 · Kapı A — depodaki artefakt manifestle EŞLEŞİYOR mu · DÜNYA (tam)', () => {
  it('artefakt manifesti depoda VAR (ölçülemedi ≠ geçti)', () => {
    const k = kuralManifestVar(MANIFEST)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('manifestteki her artefakt depoda İZLENEN bir dosya', () => {
    const k = kuralManifestIzlenen(MANIFEST, IZLENEN)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('⭐depodaki artefaktın içeriği manifestteki özetle AYNI (HER artefakt)', () => {
    const k = kuralIcerikOzeti(ARTEFAKTLAR, IZLENEN)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })

  it('manifest kayıtları eksiksiz (alan atlanarak kapı köreltilemez)', () => {
    const k = kuralKayitEksiksiz(MANIFEST)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

describe('Kapı C ile Kapı A birbirini kapsamıyor — ikisi de gerekli · DÜNYA (tam)', () => {
  it('yaml ilanı ile manifest kaydı AYNI kümeyi gösteriyor', () => {
    const k = kuralIlanManifestAyni(ILAN, MANIFEST)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})

describe('INV-DOC-4b · Kapı A ikinci ayak — kaynak derlemeden sonra DEĞİŞTİ mi · DÜNYA (tam sayım)', () => {
  /**
   * ⭐DONDURULMUŞ MOD (REC-132 · D1, Recep/OPS kararı 2026-09-04) — taşıyıcı KAPALI iken BLOKLAMAZ, SAYAR; AÇIK iken BLOKLAR.
   * Sayı `scripts/hijyen/artefakt-bayatlik-sayim.cjs`ten gelir (§26 tek kaynak) ve bu dosyanın bağımsız hesabıyla çapraz doğrulanır.
   * Modül kendi okuyucularıyla (manifest ve HEAD blob'ları) ölçer; test AYRI okuyucularla: iki yoldan aynı sayı beklenir.
   * AXIOM 3 (içerik özeti) bu kolun dışındadır ve üstte HER ZAMAN bloklar.
   */
  it('⭐DONDURULMUŞ MOD: parity BLOKLAMAZ ama SAYAR, ve sayı MODÜLDEN gelir (§26) · TAM: bütün artefaktlar', () => {
    const olcum = sayimModulu.olc({ kok: repoKoku() })
    expect(olcum.olculdu, olculemediMesaji(olcum.sebep)).toBe(true)

    // BAĞIMSIZ HESAP — modülün dediğini tekrar etmek tautoloji olurdu.
    const bagimsiz = bagimsizBayatArtefaktlar(ARTEFAKTLAR, BLOBLAR)
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

  it('kaynak parity dökümü (bilgi — dondurulmuş modda bloklamaz)', () => {
    const bayat = bayatlikDokumu(ARTEFAKTLAR, BLOBLAR)
    // ⚠BLOKLAMAZ (dondurulmuş mod). Döküm yine BASILIR: kabul edilen boşluk sessiz olamaz.
    // Sayının kendisi ve ayırt ediciliği üstteki kolda ve PR kolundaki fikstürde ölçülüyor; bu kol yalnız İNSANA
    // hangi dosyaların bayat olduğunu gösterir.
    if (bayat.length) process.stdout.write(bayatlikDokumuMetni(bayat))
    // Kolun kendisi bir şey İDDİA ETMELİ, yoksa boş bir `it` olur ve sessizce ölür.
    expect(Array.isArray(bayat), 'döküm üretilemedi — kol hiçbir şey ölçmüyor').toBe(true)
  })

  it('manifest derleme anında İZLENMEYEN kaynak taşımıyor', () => {
    const k = kuralIzlenmeyenKaynak(MANIFEST)
    expect(k.ihlaller, k.mesaj).toEqual([])
  })
})
