// Sessiz fan metnindeki ses sayılarını sözlük şablonuna yerleştirir (URN-135, U3).
// Kural: ses sayısını basan TEK üretici `sesEtiketi`dir (3 m, yer ve kademe koşuluyla); bu dosya yalnız onun
// çıktısını `{{ad}}` yer tutucularına koyar. Sayı yazılı metinden gelmez: `SesOzeti` sunucuda, sitede canlı model
// kodlarıyla ses veri modülünün kesişiminden hesaplanır. Özet yoksa (kesişim boş / kod listesi okunamadı) yer
// tutucusu dolmayan `{ ses: … }` CÜMLESİ hiç çizilmez; cümlenin yarısı ya da ham `{{ad}}` ekrana çıkmaz (fail-closed).

// DİKKAT: `sesVerisi.ts` DEĞİL `sesEtiketi.ts`: bu dosya istemci demetine girer, ham ses verisi (JSON) girmemeli.
import { type SesDegeri, sesEtiketi, type SesEtiketSozlugu } from '@/data/sessizFan/sesEtiketi'
import type { SesOzeti } from '@/data/sessizFan/sesOzeti'

type Dil = 'tr' | 'en'

/** Sözlüğün `categorySilentFan.ses` bloğundan gereken kısım. */
export type SesSozlukBlogu = Readonly<{
  yer: Readonly<{ emis: string; ufleme: string; govde: string }>
  metre: string
  kademe: Readonly<{ enDusuk: string; orta: string; enYuksek: string }>
}>

/** Sözlük bloğunu `sesEtiketi`nin beklediği biçime çevirir (veri kademe adları: 'en düşük' / 'orta' / 'en yüksek'). */
export function sesEtiketSozlugu(blok: SesSozlukBlogu): SesEtiketSozlugu {
  return {
    yer: { emis: blok.yer.emis, ufleme: blok.yer.ufleme, govde: blok.yer.govde },
    metre: blok.metre,
    kademe: { 'en düşük': blok.kademe.enDusuk, orta: blok.kademe.orta, 'en yüksek': blok.kademe.enYuksek },
  }
}

const YER_TUTUCU = /\{\{\s*(\w+)\s*\}\}/g

/**
 * Özetten yer tutucu değerleri. Özet yoksa boş nesne; bir değer kurulamıyorsa (örn. Ø200 AC modeli canlı değil)
 * o ad hiç eklenmez, onu isteyen cümle çizilmez.
 */
export function sesYerTutucular(
  ozet: SesOzeti | null | undefined,
  lang: Dil,
  etiket: SesEtiketSozlugu,
): Record<string, string> {
  if (!ozet) return {}
  const yaz = (d: SesDegeri | null | undefined): string => (d ? sesEtiketi(d, lang, etiket) : '')
  const tum: Record<string, string> = {
    govdeMin: yaz(ozet.seri.enDusukGovde),
    govdeMinModel: ozet.adlar.enDusukGovde,
    govdeMax: yaz(ozet.seri.enYuksekGovde),
    govdeMaxModel: ozet.adlar.enYuksekGovde,
    emisMin: yaz(ozet.seri.enDusukEmis),
    emisMax: yaz(ozet.seri.enYuksekEmis),
    emisMaxModel: ozet.adlar.enYuksekEmis,
    q200Govde: yaz(ozet.q200?.govde),
    q200Emis: yaz(ozet.q200?.emis),
    es150Govde4V: yaz(ozet.es150Govde4V),
  }
  return Object.fromEntries(Object.entries(tum).filter(([, deger]) => deger !== ''))
}

/**
 * Sözlük cümlesi: düz dize HER ZAMAN çizilir; `{ ses: '…{{ad}}…' }` veriden gelen ses sayısı taşır ve yalnız tüm yer
 * tutucuları dolduysa çizilir. İşaret sözlükte görünür olsun diye nesne biçimindedir (hangi cümlenin koşullu olduğu
 * metinden okunur); işaretsiz dizede `{{…}}` bulunamaz (test).
 */
export type SesCumlesi = string | Readonly<{ ses: string }>

/**
 * Cümle dizisini doldurur. Dönen dizi çizilecek cümlelerdir (boş olabilir): düz dize olduğu gibi, `ses` cümlesi
 * yalnız yer tutucularının TAMAMI doluysa; aksi halde atılır (yarım cümle ya da ham `{{ad}}` çıkmaz).
 */
export function cumleleriDoldur(cumleler: readonly SesCumlesi[], degerler: Readonly<Record<string, string>>): string[] {
  const cikti: string[] = []
  for (const cumle of cumleler) {
    if (typeof cumle === 'string') {
      cikti.push(cumle)
      continue
    }
    let eksik = false
    const dolu = cumle.ses.replace(YER_TUTUCU, (_eslesme, ad: string) => {
      const deger = Object.prototype.hasOwnProperty.call(degerler, ad) ? degerler[ad] : undefined
      if (!deger) {
        eksik = true
        return ''
      }
      return deger
    })
    if (!eksik) cikti.push(dolu)
  }
  return cikti
}
