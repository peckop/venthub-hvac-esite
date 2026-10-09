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

/** anahtar → bunu kapatacak iş. Düzelen açık BURADAN SİLİNİR. */
const BILINEN_ACIK: Record<string, string> = {
  'vortice.founded': 'URN-82: brands.ts founded 1954 kalkar (resmî kaynak "kuruldu" demiyor; 1954 yalnız faaliyet başlangıcı)',
  'vortice.description': 'URN-82: "dünya lideri / standartları belirliyor" kalkar (BLG-6 tablosu brands.ts:vortice.description)',
  'avens.founded': 'URN-82: 2010 kalkar ya da 2017 yazılır (resmî site 2017)',
  'avens.website': 'URN-82: avens.com.tr (başka şirket) yerine avensair.com (BLG-6 tablosu brands.ts:avens.website)',
  'danfoss.description': "URN-82: \"öncüsüdür\" kalkar; \"1968'den beri üretiyor\" ve atıflı %80 (BLG-6 tablosu brands.ts:danfoss.description)",
  'nicotra-gebhardt.country': "URN-82: \"Almanya\" menşei yazılamaz; \"Almanya'da Waldenburg adresli\" (BLG-6 tablosu)",
  'nicotra-gebhardt.headquarters': 'URN-82: Waldenburg merkez değil Almanya adresi; headquarters alanı kalkar',
  'nicotra-gebhardt.founded': 'URN-82: 1959 kalkar (resmî sitede yok; Gebhardt 1958)',
  'nicotra-gebhardt.description': 'URN-82: "dünyanın en geniş" kalkar (BLG-6 tablosu brands.ts:nicotra-gebhardt.description)',
}

type Ihlal = { anahtar: string; ayrinti: string }
const ihlaller = (): Ihlal[] => markaDenetle(HVAC_BRANDS, kayit, { ovguVarMi })
const anahtarlar = (): string[] => [...new Set(ihlaller().map((i) => i.anahtar))].sort()

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

  it('⭐brands.ts × kayıt: yeni çatışma yok (bilinen açıklar hariç)', () => {
    const yeni = ihlaller().filter((i) => !(i.anahtar in BILINEN_ACIK))
    expect(yeni, `kayıtla çatışan yeni olgu:\n${yeni.map((i) => `  ${i.anahtar}: ${i.ayrinti}`).join('\n')}`).toEqual([])
  })

  it('bilinen açık listesi eskimedi: listedeki her açık hâlâ çatışıyor (düzelen satır silinmeli)', () => {
    const hala = new Set(anahtarlar())
    const eski = Object.keys(BILINEN_ACIK).filter((a) => !hala.has(a))
    expect(eski, `brands.ts düzelmiş, BILINEN_ACIK'tan sil: ${eski.join(', ')}`).toEqual([])
  })
})
