import { describe, expect, it } from 'vitest'

import {
  anahtar,
  bagimsizOlc,
  c4EnEskiBeklenen,
  c4EsikIci,
  C5_TABAN,
  c5Kesisim,
  c5MdDisi,
  girdileriOku,
  KAPI_BASLANGIC,
  MESAJ,
  sayac,
  TASIYICI,
  UYKUDA,
  YAS_ESIGI_GUN,
} from './companion-parity-coverage.yardimci'

/**
 * INV-DOC-2 · DÜNYA KOLU — companion kapsam paritesinin TAM sayımı ve takvime bağlı kolları.
 *
 * TETİK: .companion-tasiyici.json, scripts/hijyen/tasiyici-anahtari.cjs, scripts/hijyen/companion-sayim.cjs, .cc_docs.yaml, src/__tests__/conformance/companion-parity-coverage.yardimci.ts
 * YER: zamanlı
 *
 * ⭐NİÇİN BU DOSYA AYRI (ALT-38i parça 2, OPS hükmü 2026-10-09): `companion-parity-coverage.test.ts` bölündü.
 * Karne ölçümü (docs/audits/test-karnesi-2026-10-09.json, CI geçmişi 2026-07-06..10-07): o dosya 13 kırmızı koşuda,
 * 10 farklı dalda kırmızı verdi; 7'si dünya olayı kümesinde (aynı test ≥3 farklı dalda 12 saat içinde kırmızı),
 * 6'sı izole (PR'ın kendi hatası). Bu dosyadaki beş kol PR'ın dosyalarından değil DÜNYADAN etkilenir:
 *   · C4 ve C5 TAM blok: tüm depodaki companion borcu, dokunulmamış kaynakların TAKVİMLE olgunlaşması (taşıyıcı
 *     AÇIK iken 7 günü dolduran her kaynak, hiçbir commit olmadan, bütün açık PR'ları kırmızıya çevirir; 09-03,
 *     09-05'te ölçülerek yaşandı),
 *   · TARİHSEL borç görünürlüğü ve "yaş eşiği iş görüyor": ikisi de SAATE ve son 7 günde kaç kaynağa dokunulduğuna
 *     bağlı (karne q4: "taze bulgu > 0" ve "tarihsel borç > 0" kolları takvime bağlı),
 *   · uyku kipi anahtarı: taşıyıcı dosyasının o anki durumu.
 *
 * Bu yüzden bu kollar PR kapısından ÇIKARILDI (liste: `scripts/ci/dunya-durumu-testleri.json`): master'a her push'ta
 * (`ci` işi, tam paket) ve zamanlı iş akışında (`dunya-durumu.yml`) koşar; kırmızıyı her mesajdaki `DUNYA:` kanca satırı
 * gösterir. SİLİNMEDİ, GEVŞETİLMEDİ: aynı ölçüm, aynı eşikler, aynı kod (`companion-parity-coverage.yardimci.ts`,
 * iki kolun ortak yardımcısı).
 *
 * ⭐YOL SÜZGECİ: kayıt `yolFiltresi` taşır. Taşıyıcıyı açıp kapatan (`.companion-tasiyici.json`), onu okuyan
 * (`scripts/hijyen/tasiyici-anahtari.cjs`), sayaç modülünü ya da kapsamı (`.cc_docs.yaml`) değiştiren PR'da bu dosya
 * PR kapısında KALIR: o PR, TAM kolların hükmünü değiştirebilir (örnek: taşıyıcıyı AÇAN PR, borç ödenmeden tam
 * blokla karşılaşmalıdır) ve bunu kendi kapısında görmelidir. Süzgeç tabandan okunur (PR kendi süzgecini genişletemez).
 *
 * PR kapısında KALAN (`companion-parity-coverage.test.ts`, kimlik INV-DOC-2 aynı): ÖNKOŞUL, sayaç tutarlılığı,
 * SAYIM AYIRT EDER, TEK KAYNAK, pano satırı, ratchet, vacuous kapsam ve ⭐PR-KISITLI C4/C5 BLOK: yalnız PR'ın
 * DEĞİŞTİRDİĞİ kaynaklar sayılır (fail-closed: değişen liste okunamazsa TAM sayım). Yani PR'ın kendi bıraktığı
 * eksik/bayat companion kendi kapısında kırmızı verir; bu dosya "dokunulmamış kaynakta sonradan olgunlaşan" borcu görür.
 */

describe('INV-DOC-2 · DÜNYA KOLU · companion kapsam paritesi (TAM sayım, takvim)', () => {
  const b = bagimsizOlc(girdileriOku(), new Date())

  it('C4 — companion\'ı olmayan ESKİ kaynak (TAM): taşıyıcı AÇIK ise bloklar, UYKUDA ise sayar', () => {
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

    // BLOKLAMAYAN KOL, BOŞ KOL DEĞİLDİR: sayının kendi içinde tutarlı olduğu ölçülür (tutarlılık denetimi
    // PR kolunda ayrı `it` olarak da koşar; ortak işlevleri kullanırız, mantık kopyalanmaz). Assert'i tümden
    // silip yerine yalnız bir yazdırma koymak, kolu ÖLÇMEYEN bir şeye çevirir ve biz "kapı var" sanardık —
    // bu depoda adı konmuş sınıf.
    expect(c4EsikIci(m), MESAJ.c4EsikIci).toEqual([])
    expect(m.enEskiYasGun, MESAJ.c4EnEski).toBe(c4EnEskiBeklenen(m))
  })

  it('C5 — kaynağından ESKİ companion (TAM): taşıyıcı AÇIK ise bloklar, UYKUDA ise sayar', () => {
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
    // kolun tek değeri, SAYININ AYIRT ETTİĞİDİR; onu ölçüyoruz:
    //   (1) sınıflandırma bir BÖLÜNTÜ olmalı — aynı dosya hem "eksik" hem "bayat" sayılamaz
    //       (sayılırsa borç iki kez raporlanır ve sayı gerçeği anlatmaz),
    //   (2) listelenen her şey gerçekten bir companion (.md) olmalı — C4/C5 karışırsa
    //       "eksik" borcu "bayat" gibi görünür ve uyanışta yanlış iş üretilir.
    expect(c5Kesisim(b), MESAJ.c5Kesisim).toEqual([])
    expect(c5MdDisi(b), MESAJ.c5MdDisi).toEqual([])
  })

  it('TARİHSEL borç GÖRÜNÜR kalır (kapsam dışı ≠ yok sayıldı)', () => {
    // Kapsamı KAPI_BASLANGIC ile daraltmak drift'i kapattı ama yeni bir tehlike doğurdu:
    // eski borç sessizce yok sayılabilir. Bu yüzden sayı BASILIYOR ve sıfırlandığında test
    // KIRMIZI yanıp demiri kaldırmaya zorluyor — gerekçesiz kapsam daraltması taşınmasın.
    const toplam = b.tarihselEksik.length + b.tarihselBayat.length
    // `process.stdout.write`: `no-console` yalnız warn/error'a izin verir; rapor bir uyarı değil
    // (C4/C5 kollarındaki ile aynı mekanizma, kural inline kapatılmadı).
    process.stdout.write(
      `[INV-DOC-2] TARİHSEL companion borcu (KAPI_BASLANGIC=${KAPI_BASLANGIC} öncesi, kapı ` +
      `kapsamı DIŞINDA): ${b.tarihselEksik.length} eksik + ${b.tarihselBayat.length} bayat ` +
      `= ${toplam}. Kapı yalnız yeni borcu engelliyor; bu yığın ayrı bir iş emri konusudur.\n` +
      `[INV-DOC-2] Kapı kapsamındaki kaynak: ${b.kapidakiKaynak} · bunlardan ihlal: ` +
      `${b.eksik.length} eksik + ${b.bayat.length} bayat. DÜRÜST NOT: KAPI_BASLANGIC'tan ` +
      `sonra dokunulan bir dosya ${YAS_ESIGI_GUN} günü doldurmadıkça ihlal ÜRETEMEZ — yani ` +
      `kapı ilk ${YAS_ESIGI_GUN} gün yapısal olarak sessizdir. Bu YEŞİLİ "borç yok" diye ` +
      `okuma; "yeni borç henüz olgunlaşmadı" diye oku.\n`,
    )
    expect(
      toplam,
      'İYİ HABER olabilir: tarihsel companion borcu SIFIRA düştü. Öyleyse KAPI_BASLANGIC ' +
      'demiri gereksizleşti — kaldır (ya da bugüne çek) ve bu testi sil, yoksa kapı geçmişi ' +
      'gerekçesiz biçimde kapsam dışı tutmaya devam eder.',
    ).toBeGreaterThan(0)
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
