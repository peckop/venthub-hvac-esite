import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-DOC-3 v2 · KÜME MASTER TAZELİK PARİTESİ (REC-144).
 *
 * NİÇİN VAR — selefinin ÖLÜM RAPORU: INV-DOC-3 v1 (PR #640, 2026-08-17'den beri bilinçli
 * kırmızı) *ad paritesi* ölçüyordu: yaml'daki her dosya adı defterde AYRI kaynak olarak var
 * mı? O evren 2026-08-26'da öldü — `.cc_docs.yaml` kendi içinde yazıyor ("KÜME MASTER'LARI,
 * T020-OR"): defter tekil dosyadan TOPLAYICI master'a geçti (96 kaynak → 20).
 * 2026-09-05'te ölçüldü: silahlandırılsaydı **76 sahte kırmızı** verirdi, hiçbiri gerçek
 * bir eksiklik olmazdı. Ölçüt keskindi; EVREN yanlıştı.
 *
 * Gerçek parite aynı gün ağsız ölçüldü: beklenen 85 belgenin **84'ü** küme master'lar
 * içinde kapsanıyordu. Tek gerçek açık `work-tracking-ssot-standard.md`'ydi — ve eksik
 * değil, **BAYAT**: `standards_master.md` 09-03'te derlenmiş, cetvel 09-04'te değişmişti
 * (#991, YÜRÜRLÜK NOTU: *"registry değil, LINEAR"*). Yani ikiz o cetveli hâlâ eski hâliyle
 * görüyor. **Ad paritesi bunu göremez, çünkü ad EŞLEŞİYOR.**
 *
 * ⛔BU KAPI BLOKLAMAZ — sayar ve bayat master'ları ADIYLA raporlar.
 * Gerekçe: K8 "toplamalar donduruldu". Üretici durmuşken bloklayan bir tazelik kapısı,
 * kimsenin ödeyemeyeceği bir borç için filoyu kilitler — bu tam olarak 2026-09-05 sabahı
 * yaşanan ve #997 ile onarılan arızadır. Aynı hatayı ters yönden tekrar etmiyoruz.
 *
 * ⭐AMA "BLOKLAMAZ" ≠ "HİÇBİR ŞEY ÖLÇMEZ". Bloklamayan bir kolun tek gerçek kanıtı
 * MEKANİZMANIN ayakta olmasıdır. Bu yüzden aşağıdaki kollar KIRMIZI YANAR:
 *   · bildirim ayrıştırılamazsa (biçim değişimi → kapı sessizce körleşirdi)
 *   · hiç küme master bulunamazsa (vacuous-guard)
 *   · ayırt edicilik kaybolursa (bayat çift verildiği hâlde görünmüyorsa)
 * Bayatlığın KENDİSİ raporlanır, iddia edilmez — çünkü bugün ödenemez.
 *
 * ⚠ÖLÇEMEDİ ≠ GEÇTİ: ölçüm hata verirse modül BOŞ SONUÇ DÖNMEZ, fırlatır. "Bayat yok"
 * diyen boş bir cevap, "her şey taze" yalanıdır.
 */

interface Bayat { master: string; uretildi: string; bayatlatan: string[] }
interface Taze { master: string; uretildi: string }
interface Bildirim { ad: string; cikti: string | null; kaynakDizinleri: string[]; ekDosyalar: string[] }
interface Sonuc {
  toplam: number
  taze: Taze[]
  bayat: Bayat[]
  ciktisiYok: string[]
  bildirilen: Bildirim[]
}

const require_ = createRequire(import.meta.url)
const tazelik = require_('../../../scripts/hijyen/kume-master-tazeligi.cjs') as {
  bildirimiOku: (metin: string) => { masterlar: Bildirim[]; anaMaster: Bildirim | null }
  tazelikCekirdegi: (g: {
    masterlar: Bildirim[]
    masterTarihi: Map<string, string>
    sonrakiKaynaklar: Map<string, string[]>
  }) => Omit<Sonuc, 'bildirilen'>
  olc: (g: { kok: string; ref?: string }) => Sonuc
  rapor: (s: Omit<Sonuc, 'bildirilen'>) => string
}

const KOK = process.cwd()

describe('INV-DOC-3 v2 · küme master tazelik paritesi', () => {
  it('bildirim AYRIŞTIRILIYOR ve boş değil — vacuous-guard', () => {
    const s = tazelik.olc({ kok: KOK })

    expect(
      s.toplam,
      'Hiç küme master bulunamadı. `.cc_docs.yaml` biçimi değişmiş olabilir ve bu ' +
        'kapı SESSİZCE körleşir: "bayat master yok" cevabı, ölçmediği için verilmiş ' +
        'olur. Selefi (INV-DOC-3 v1) tam olarak yanlış evren yüzünden öldü.',
    ).toBeGreaterThanOrEqual(2)

    for (const m of s.bildirilen) {
      expect(m.cikti, `Bildirilen master'ın çıktı yolu yok: ${m.ad}`).toBeTruthy()
      expect(
        m.kaynakDizinleri.length + m.ekDosyalar.length,
        `"${m.ad}" hiçbir kaynağı emmiyor görünüyor — eşleme çürümüş olabilir.`,
      ).toBeGreaterThan(0)
    }
  })

  it('⭐AYIRT EDİYOR — bayat çift GÖRÜNÜR, taze çift GÖRÜNMEZ (fikstür)', () => {
    // Saf çekirdek fikstürle beslenir: git okuyan bir fonksiyona fikstür veremezsin,
    // yani ayırt ediciliğini de kanıtlayamazsın.
    const masterlar: Bildirim[] = [
      { ad: 'bayat_master.md', cikti: 'docs/bayat_master.md', kaynakDizinleri: ['docs/a'], ekDosyalar: [] },
      { ad: 'taze_master.md', cikti: 'docs/taze_master.md', kaynakDizinleri: ['docs/b'], ekDosyalar: [] },
    ]
    const masterTarihi = new Map([
      ['docs/bayat_master.md', '2026-09-03T00:00:00Z'],
      ['docs/taze_master.md', '2026-09-05T00:00:00Z'],
    ])
    const sonrakiKaynaklar = new Map([
      ['docs/bayat_master.md', ['docs/a/work-tracking-ssot-standard.md']],
      ['docs/taze_master.md', []],
    ])

    const s = tazelik.tazelikCekirdegi({ masterlar, masterTarihi, sonrakiKaynaklar })

    expect(s.bayat.map((b) => b.master)).toEqual(['docs/bayat_master.md'])
    expect(s.taze.map((t) => t.master)).toEqual(['docs/taze_master.md'])

    // SABOTAJ: bayatlatan kaynağı listeden çıkar → master TAZE sayılmalı.
    // Bu kol olmasaydı, "her şeyi bayat sayan" bozuk bir çekirdek de yeşil geçerdi.
    const sabote = tazelik.tazelikCekirdegi({
      masterlar,
      masterTarihi,
      sonrakiKaynaklar: new Map([['docs/bayat_master.md', []], ['docs/taze_master.md', []]]),
    })
    expect(
      sabote.bayat,
      'Bayatlatan kaynak kalmadığı hâlde hâlâ BAYAT diyor — çekirdek ayırt etmiyor.',
    ).toHaveLength(0)
  })

  it('rapor bayat master’ı ve onu BAYATLATANI adıyla yazar — sayı tek başına iş emri değildir', () => {
    const metin = tazelik.rapor({
      toplam: 2,
      taze: [{ master: 'docs/taze_master.md', uretildi: '2026-09-05T00:00:00Z' }],
      bayat: [{
        master: 'docs/standards_master.md',
        uretildi: '2026-09-03T00:00:00Z',
        bayatlatan: ['docs/standards/work-tracking-ssot-standard.md'],
      }],
      ciktisiYok: [],
    })

    expect(metin).toContain('docs/standards_master.md')
    expect(
      metin,
      'Rapor yalnız SAYI basıyor. Uyandırma günü lazım olan şey sayı değil, HANGİ belgenin ' +
        'ikizde eski kaldığıdır: sayı "ne kadar" der, liste "ne yapacağım" der.',
    ).toContain('work-tracking-ssot-standard.md')
  })

  it('ölçüm hatası SESSİZ GEÇMEZ — boş bildirim "bayat yok" DEMEZ', () => {
    const bos = tazelik.bildirimiOku('# hicbir sey\n')
    expect(bos.masterlar).toHaveLength(0)
    expect(bos.anaMaster).toBeNull()
    // Ve `olc()` bu hâlde fırlatır (vacuous-guard) — yukarıdaki ilk kol onu kanıtlar.
  })

  it('CANLI DURUM — raporlanır, iddia EDİLMEZ (K8: toplamalar donduruldu)', () => {
    const s = tazelik.olc({ kok: KOK })

    // NİÇİN `process.stdout.write`: bu dosyada `no-console` yalnız warn/error'a izin verir;
    // kardeş kapılar (companion-parity-coverage) da aynı yolu kullanır. Kuralı inline
    // kapatmak yerine kuralı SAĞLAYAN yolu yazmak — bugünün cetvel maddesiyle aynı ilke.
    process.stdout.write(
      '\n' + tazelik.rapor(s) + '\n' +
      '[kume-master] ⛔BU KOL BLOKLAMAZ. Bayat master, ikizin o belgeleri ESKI haliyle\n' +
      '[kume-master]   gordugu anlamina gelir. 2026-09-05\'te olculdu: ayni gun ikizden\n' +
      '[kume-master]   uretilen celiski raporunda IKI yanlis pozitif (C9, A8) vardi.\n' +
      '[kume-master]   Toplamalar cozuldugunde bu kolun BLOKLAYAN hale gelmesi AYRI bir\n' +
      '[kume-master]   karardir (REC-144 devami) — kapi silinmez, SARTA baglanir.\n',
    )

    // Tek gerçek iddia: ölçüm KOŞTU ve bir cevap üretti.
    expect(s.toplam).toBeGreaterThan(0)
    expect(Array.isArray(s.bayat)).toBe(true)
  })
})
