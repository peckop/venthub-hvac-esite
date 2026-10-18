/**
 * INV-MARKA-OLGU-1 — MARKA OLGULARI KAYITLA BİREBİR UYUŞUR; DOĞRULANAMAYAN OLGU YAZILAMAZ (BLG-7).
 *
 * NİÇİN VAR (2026-10-09, Recep: "doğrula, tam kapsamlı, tutarlı ve deterministik, uydurma yok"):
 * `src/data/brands.ts` kaynak satırı olmayan olgular taşıyordu: AVenS için BAŞKA bir şirketin sitesi
 * (avens.com.tr, Ankara) ve 2010 kuruluş yılı (resmî site 2017), Nicotra Gebhardt için 1959 (resmî sitede yok;
 * Gebhardt 1958), Vortice için "kuruluş 1954" (resmî metin "1954'ten beri" diyor, "kuruldu" demiyor).
 * Hiçbir kapı bunu görmüyordu çünkü olgunun kaynağı kod dışında, bir araştırma özetinde duruyordu.
 *
 * NE ÖLÇER: `docs/standards/marka-olgu-kaydi.json` (kaynağı betikle ham metinden doğrulanmış tek kayıt) ile
 * `HVAC_BRANDS` çapraz denetlenir (mantık: scripts/rehber/marka-olgu-dogrula.mjs `markaDenetle`):
 *  (a) kayıt şeması ve durum tutarlılığı (DOGRULANDI = iki bağımsız yayın, TEK_KAYNAK = bir, ağsız hesap)
 *  (b) brands.ts'te YAZILI country/founded/headquarters/website kayıtta YAZILABİLİR bir olguyla birebir uyuşur
 *  (c) açıklamadaki yıl ve yüzde sayıları kayıttaki yazılabilir olguların `sayilar` listesindedir
 *  (d) açıklama üstünlük/övgü kalıbı taşımaz (M5; ortak liste src/lib/seo/ovguAyikla.ts)
 *
 * BİLİNEN AÇIKLAR: ölçüm günü (10-09) brands.ts'te kayıtla çatışan olgular VARDI. Düzeltme Ürün'ün işidir
 * (URN-82; BLG-6 tablosu 684 satır, brands.ts satırları dahil). Liste KAPALI ve KENDİ KENDİNİ TEMİZLER:
 * kayıtla çatışan yeni bir olgu eklenirse kırmızı, listedeki bir açık kapanınca (brands.ts düzelince) da
 * kırmızı — satır listeden SİLİNMELİ. Böylece liste büyüyemez, sessizce de eskimez.
 */
import { describe, expect, it } from 'vitest'

import { HVAC_BRANDS } from '@/data/brands'
import { ovguVarMi } from '@/lib/seo/ovguAyikla'

import kayit from '../../../docs/standards/marka-olgu-kaydi.json'
import { kayitDenetle, markaDenetle } from '../../../scripts/rehber/marka-olgu-dogrula.mjs'

/**
 * anahtar → { parca: ihlal metninde BEKLENEN parça, kapatan: bunu kapatacak iş }. Düzelen açık BURADAN SİLİNİR.
 * ⚠ANAHTAR + DEĞER (BLG-7 çürütme N): ilk sürümde süzme yalnız anahtara bakıyordu; 9 anahtarın altına her yeni
 * yanlış değer yeşil giriyordu. Şimdi ihlalin KENDİ metni de beklenen parçayı taşımalıdır: aynı anahtarda başka bir
 * yanlış değer (ör. avens.website başka bir adres) bilinen açık sayılmaz, kırmızı verir.
 */
const BILINEN_ACIK: Record<string, { parca: string; kapatan: string }> = {
  'vortice.founded': { parca: 'yazılamaz (DOGRULANAMADI)', kapatan: 'URN-82: brands.ts founded 1954 kalkar (resmî kaynak "kuruldu" demiyor; 1954 yalnız faaliyet başlangıcı)' },
  'avens.website': { parca: 'avens.com.tr', kapatan: 'URN-82: avens.com.tr (başka şirket) yerine avensair.com (BLG-6 tablosu brands.ts:avens.website)' },
  'nicotra-gebhardt.country': { parca: 'yazılamaz (DOGRULANAMADI)', kapatan: "URN-82: \"Almanya\" menşei yazılamaz; \"Almanya'da Waldenburg adresli\" (BLG-6 tablosu)" },
  'nicotra-gebhardt.headquarters': { parca: 'yazılamaz (DOGRULANAMADI)', kapatan: 'URN-82: Waldenburg merkez değil Almanya adresi; headquarters alanı kalkar' },
}
// Kapananlar (11 Ekim, URN-79/URN-82 #1793 brands.ts'i düzeltti, test kendiliğinden bildirdi): vortice.description,
// avens.founded, danfoss.description, nicotra-gebhardt.founded, nicotra-gebhardt.description.

type Ihlal = { anahtar: string; ayrinti: string }
const ihlaller = (): Ihlal[] => markaDenetle(HVAC_BRANDS, kayit, { ovguVarMi })
/** Bilinen açık yalnız anahtar VE beklenen değer parçası birlikte tutuyorsa sayılır. */
const bilinenMi = (i: Ihlal): boolean => BILINEN_ACIK[i.anahtar] !== undefined && i.ayrinti.includes(BILINEN_ACIK[i.anahtar].parca)
/** Bilinen açık süzmesinin sınanabilir hâli (testlenir: sahte ihlalle sabotaj). */
const yeniIhlaller = (liste: Ihlal[]): Ihlal[] => liste.filter((i) => !bilinenMi(i))

describe('INV-MARKA-OLGU-1 · marka olgu kaydı', () => {
  it('kayıt şeması ve durum tutarlılığı temiz', () => {
    expect(kayitDenetle(kayit)).toEqual([])
  })

  it('her vitrin markasının kayıtta karşılığı vardır', () => {
    for (const b of HVAC_BRANDS) expect(Object.keys(kayit.markalar), `${b.slug} kayıtta yok`).toContain(b.slug)
  })

  it('son doğrulama tarihi gelecekte değildir', () => {
    expect(new Date(kayit.sonDogrulama).getTime()).toBeLessThanOrEqual(Date.now() + 86_400_000)
  })

  it('⭐brands.ts × kayıt: yeni çatışma yok (bilinen açıklar hariç; anahtar VE değer parçası eşleşmeli)', () => {
    const yeni = yeniIhlaller(ihlaller())
    expect(yeni, `kayıtla çatışan yeni olgu:\n${yeni.map((i) => `  ${i.anahtar}: ${i.ayrinti}`).join('\n')}`).toEqual([])
  })

  it('bilinen açık listesi eskimedi: listedeki her açık hâlâ aynı değerle çatışıyor (düzelen satır silinmeli)', () => {
    const hala = ihlaller()
    const eski = Object.entries(BILINEN_ACIK).filter(([a, b]) => !hala.some((i) => i.anahtar === a && i.ayrinti.includes(b.parca))).map(([a]) => a)
    expect(eski, `brands.ts düzelmiş, BILINEN_ACIK'tan sil: ${eski.join(', ')}`).toEqual([])
  })

  it('sabotaj: bilinen anahtarın altına gelen YENİ yanlış değer bilinen açık sayılmaz', () => {
    const sahte: Ihlal[] = [
      { anahtar: 'avens.website', ayrinti: 'brands.ts https://www.baska-sirket.com ≠ kayıt https://avensair.com' },
      { anahtar: 'vortice.founded', ayrinti: 'brands.ts 1959 ≠ kayıt 1954' },
      { anahtar: 'avens.website', ayrinti: 'brands.ts https://avens.com.tr ≠ kayıt https://avensair.com' },
    ]
    expect(yeniIhlaller(sahte).map((i) => i.ayrinti)).toEqual([sahte[0].ayrinti, sahte[1].ayrinti])
  })
})
