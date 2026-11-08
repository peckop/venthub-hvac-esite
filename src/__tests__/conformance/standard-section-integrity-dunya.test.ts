import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  bolumleriCikar,
  capaTara,
  cetvelDosyalari,
  KOK,
  MESAJ,
  mukerrerIhlalleri,
  olculenler,
  sahipsizIhlalleri,
} from './standard-section-integrity.yardimci'

/**
 * INV-CETVEL-YAPI · DÜNYA KOLU — `docs/standards/*.md` cetvellerinin TAM KLASÖR taraması.
 *
 * TETİK: docs/standards/, src/__tests__/conformance/standard-section-integrity.yardimci.ts
 * YER: zamanlı
 *
 * ⭐NİÇİN BU DOSYA AYRI (ALT-38i parça 2, OPS hükmü 2026-10-09): `standard-section-integrity.test.ts` bölündü.
 * Mükerrer numara, sahipsiz alt bölüm ve çapa tekrarı üç kuralı da DOSYA BAŞINADIR: bir cetvelin ihlali yalnız
 * o cetvelin içeriğinden doğar. Ama tam klasörü her PR'da taramak, dokunmadığı bir cetvelin kusuru yüzünden
 * suçsuz PR'ı kırmızıya çevirir. Karne ölçümü (docs/audits/test-karnesi-2026-10-09.json, CI geçmişi
 * 2026-07-06..10-07): 13 kırmızı koşu, 12 farklı dal; 11'i dünya olayı kümesinde (aynı test ≥3 farklı dalda
 * 12 saat içinde kırmızı), 2'si izole (sonraki koşuda düzeldi: PR'ın kendi hatası).
 *
 * Bu yüzden tam klasör taraması PR kapısından ÇIKARILDI (liste: `scripts/ci/dunya-durumu-testleri.json`):
 * master'a her push'ta (`ci` işi, tam paket) ve zamanlı iş akışında (`dunya-durumu.yml`) koşar; kırmızıyı her
 * mesajdaki `DUNYA:` kanca satırı gösterir. SİLİNMEDİ, GEVŞETİLMEDİ: aynı üç kural, aynı desen, aynı kod
 * (`standard-section-integrity.yardimci.ts`, iki kolun ortak yardımcısı); yalnız TAM klasör taramasının YERİ değişti.
 *
 * PR kapısında KALAN (`standard-section-integrity.test.ts`): fikstür ve ayıklayıcı testleri, ve aynı üç kuralın
 * PR'ın DEĞİŞTİRDİĞİ cetvellerdeki taraması (fail-closed: değişen liste okunamazsa ya da kontrolün kendi kodu
 * değişirse TAM klasör). Yani cetvelin ihlali, cetvele dokunan PR'ın kendi kapısında zaten kırmızı verir; bu dosya
 * "dokunulmamış cetvelde sonradan görülen" ihlali (başka dalın, eski bir kusurun, kapı gevşekken girenin) yakalar.
 *
 * Tasarım geçmişi (doğuş vakası `## D13`, REC-120 süsleme körlüğü, çapa kolunun üç ölçülmüş tasarımı) ortak
 * yardımcıda, ilgili desenin yanındadır.
 */

/** TAM klasör: kapsam kanaryasıyla birlikte. Her test kendi içinde BOŞ KÜMEDE geçemez (ayırt etmeyen gösterge ölçüm değildir). */
function tamKlasor(): { tum: string[]; olculen: ReturnType<typeof olculenler> } {
  const tum = cetvelDosyalari()
  const olculen = olculenler(tum)
  expect(tum.length, `${KOK} içinde .md cetvel bulunamadı ya da çok az: kök bozuk ya da çalışma dizini yanlış`).toBeGreaterThanOrEqual(10)
  expect(olculen.length, 'numaralı cetvel sayısı: sıfır/az çıkması desenin bozulduğunu gösterir').toBeGreaterThanOrEqual(10)
  return { tum, olculen }
}

describe('INV-CETVEL-YAPI · DÜNYA KOLU · cetvellerin bölüm yapısı (TAM klasör)', () => {
  it('aynı bölüm numarası bir cetvelde İKİ KEZ tanımlanmaz (tüm cetveller)', () => {
    const { olculen } = tamKlasor()
    expect(mukerrerIhlalleri(olculen), MESAJ.mukerrer).toEqual([])
  })

  it('her alt bölüm (X<n>.<m>) kendi ana bölümüne sahiptir (tüm cetveller)', () => {
    const { olculen } = tamKlasor()
    expect(sahipsizIhlalleri(olculen), MESAJ.sahipsiz).toEqual([])
  })

  it('kendi kapsamını ölçer: desen bozulursa tam klasör taraması sessizce yeşile dönmez', () => {
    const KANARYA = `${KOK}/deploy-build-skip-standard.md`
    const kanaryaBolumleri = bolumleriCikar(readFileSync(resolve(process.cwd(), KANARYA), 'utf8'))
    expect(
      kanaryaBolumleri.length,
      `${KANARYA} numaralı bölüm içerir; sıfır çıkması desenin bozulduğunu gösterir`,
    ).toBeGreaterThanOrEqual(5)
  })
})

describe('INV-CETVEL-YAPI · DÜNYA KOLU · aynı konunun İKİ TARİFİ (çapa kolu, TAM klasör)', () => {
  it('bir cetvelde aynı KOD KİMLİĞİ iki ayrı başlıkta anlatılmaz (tüm cetveller)', () => {
    const { tum } = tamKlasor()
    const { ihlaller, capaliBaslik } = capaTara(tum)

    // KAPSAM KANARYASI: hiç çapa bulunmadıysa karşılaştırma boş kümede yapılmıştır
    // ve kol sessizce yeşil kalır. Sıfırın "ihlal yok" mu "hiçbir yere bakmadım" mı
    // olduğunu ayıran tek şey bu satır.
    expect(capaliBaslik, MESAJ.capaKanarya).toBeGreaterThan(0)

    expect(ihlaller, MESAJ.capa).toEqual([])
  })
})
