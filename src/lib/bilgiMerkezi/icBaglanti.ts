import type { Route } from 'next'

import { type AdresDili,adresUret } from '../../utils/adresUret'
import { getLocalizedCategorySlug } from '../../utils/categoryHelpers'
import { localizedHref, Routes } from '../../utils/routes'
import { KIMLIK_DESENI, type KimlikTuru } from './markdown'

/**
 * İÇ BAĞLANTI ÇÖZÜCÜSÜ — `vh:<tür>/<anahtar>` → bugünkü adres (rehber-yazisi-standard.md R3).
 *
 * NİÇİN KİMLİK: yazı adres değil nesne kimliği taşır; adres ağacı değişince (REC-300 K3-b, aile
 * adresleri Faz 1-B) yazı eski adresi kalıcı taşımasın ve her tıklama bir 308 durağı yapmasın.
 * Çözüm sayfa ÜRETİLİRKEN sunucuda yapılır; adres `adresUret(nesne, dil)` ile üretilir — bayrak
 * (`ADRES_SEMASI_K3B`) ne olursa olsun o günün kanonik adresi.
 *
 * ESKİ ADI BİLİNEN NESNE: anahtar bugün bulunamazsa `url_takma_adlari` (REC-300 Faz 1-A, DB tetiği
 * doldurur) sorulur; nesne yeniden adlandırıldıysa YENİ adresine çözülür.
 *
 * ⛔ÇÖZÜLEMEYEN BAĞLANTI SESSİZ GEÇMEZ: `IcBaglantiHatasi` ATAR → sayfa üretimi, dolayısıyla
 * derleme durur. Kırık bağlantıyla yayına çıkmaktansa yayına çıkmamak (kırık iç bağlantı = müşteri
 * 404'e düşer ve hiçbir kapı görmez). Veri kaynağı erişilemezse de ATAR: "bulunamadı" ile
 * "soramadım" aynı şey değildir, ikisi de sessizce geçmez.
 *
 * SAF: DB'ye kendisi gitmez, `IcBaglantiKaynagi` enjekte edilir (DI, kural 2). Gerçek kaynak
 * `src/lib/data/bilgiMerkeziKaynak.ts`; testler sahte kaynakla koşar.
 */

export interface KategoriKaynagi {
  slug: string
  metadata: unknown
  /** Üst kategori (yoksa null) — yeni adres şemasında kök/dal adresi için. */
  ust: { slug: string; metadata: unknown } | null
}

export interface IcBaglantiKaynagi {
  /** SKU (DB biçimi, büyük harf) → aile slug'ı. Silinmiş/pasif ürün `null`. */
  model(sku: string): Promise<{ sku: string; aileSlug: string } | null>
  /** Aile slug'ı → var mı. */
  aile(slug: string): Promise<{ slug: string } | null>
  /** Kanonik EN slug → etkin kategori. Pasif kategori `null` (sayfası 404 verir). */
  kategori(slug: string): Promise<KategoriKaynagi | null>
  /** Eski slug → bugünkü slug (`url_takma_adlari`). Yoksa `null`. */
  takmaAd(tur: 'aile' | 'kategori' | 'sku', slug: string): Promise<string | null>
  /** Marka slug'ı var mı (vitrin marka listesi). */
  marka(slug: string): boolean
}

export class IcBaglantiHatasi extends Error {
  constructor(public readonly kimlik: string, sebep: string) {
    super(`[bilgi merkezi] iç bağlantı çözülemedi: ${kimlik} — ${sebep}`)
    this.name = 'IcBaglantiHatasi'
  }
}

/** Hesaplayıcı anahtarları — `src/app/[lang]/destek/hesaplayicilar/*` ile aynı. */
export const HESAPLAYICILAR = ['kanal', 'hrv', 'hava-perdesi', 'jet-fan'] as const

/** `vh:sayfa/<anahtar>` için izinli sayfalar (dilsiz yol üreticileri). */
const SAYFALAR: Record<string, () => string> = {
  iletisim: () => Routes.contact(),
  teklif: () => Routes.contact(),
  'urun-secici': () => Routes.urunSecici(),
  urunler: () => Routes.products(),
  markalar: () => Routes.brands(),
  sss: () => Routes.destek.sss(),
}

export function kimlikAyristir(kimlik: string): { tur: KimlikTuru; anahtar: string } {
  const m = kimlik.match(KIMLIK_DESENI)
  if (!m) throw new IcBaglantiHatasi(kimlik, 'biçim vh:<tür>/<anahtar> değil')
  return { tur: m[1] as KimlikTuru, anahtar: m[2] }
}

function kategoriAdresi(k: KategoriKaynagi, dil: AdresDili): Route {
  const kendi = getLocalizedCategorySlug(k, dil)
  const ust = k.ust ? getLocalizedCategorySlug(k.ust, dil) : null
  return adresUret(ust ? { tur: 'kategori', kok: ust, dal: kendi } : { tur: 'kategori', kok: kendi }, dil)
}

/** Tek kimliği bugünkü dil önekli adrese çözer; çözemezse ATAR. */
export async function icBaglantiCoz(kimlik: string, dil: AdresDili, kaynak: IcBaglantiKaynagi): Promise<Route> {
  const { tur, anahtar } = kimlikAyristir(kimlik)
  switch (tur) {
    case 'model': {
      const sku = anahtar.toUpperCase()
      let bulunan = await kaynak.model(sku)
      if (!bulunan) {
        const yeni = await kaynak.takmaAd('sku', anahtar.toLowerCase())
        if (yeni) bulunan = await kaynak.model(yeni.toUpperCase())
      }
      if (!bulunan) throw new IcBaglantiHatasi(kimlik, 'SKU katalogda yok (takma ad da yok)')
      return adresUret({ tur: 'model', aileSlug: bulunan.aileSlug, sku: bulunan.sku }, dil)
    }
    case 'aile': {
      let bulunan = await kaynak.aile(anahtar)
      if (!bulunan) {
        const yeni = await kaynak.takmaAd('aile', anahtar.toLowerCase())
        if (yeni) bulunan = await kaynak.aile(yeni)
      }
      if (!bulunan) throw new IcBaglantiHatasi(kimlik, 'aile katalogda yok (takma ad da yok)')
      return adresUret({ tur: 'aile', slug: bulunan.slug }, dil)
    }
    case 'kategori': {
      let bulunan = await kaynak.kategori(anahtar)
      if (!bulunan) {
        const yeni = await kaynak.takmaAd('kategori', anahtar.toLowerCase())
        if (yeni) bulunan = await kaynak.kategori(yeni)
      }
      if (!bulunan) throw new IcBaglantiHatasi(kimlik, 'etkin kategori yok (kanonik EN slug bekleniyor; takma ad da yok)')
      return kategoriAdresi(bulunan, dil)
    }
    case 'marka': {
      if (!kaynak.marka(anahtar)) throw new IcBaglantiHatasi(kimlik, 'marka listesinde yok')
      return adresUret({ tur: 'marka', slug: anahtar }, dil)
    }
    case 'hesaplayici': {
      if (!(HESAPLAYICILAR as readonly string[]).includes(anahtar)) {
        throw new IcBaglantiHatasi(kimlik, `hesaplayıcı yok (izinli: ${HESAPLAYICILAR.join(', ')})`)
      }
      return localizedHref(Routes.destek.hesaplayicilar(anahtar), dil)
    }
    case 'sayfa': {
      const uret = SAYFALAR[anahtar]
      if (!uret) throw new IcBaglantiHatasi(kimlik, `sayfa yok (izinli: ${Object.keys(SAYFALAR).join(', ')})`)
      return localizedHref(uret(), dil)
    }
  }
}

/**
 * Bir yazının bütün kimliklerini çözer. Hatalar TOPLANIR ve TEK hatada raporlanır — yazar kırık
 * bağlantıları tek tek değil hepsini birden görsün.
 */
export async function icBaglantilariCoz(
  kimlikler: readonly string[],
  dil: AdresDili,
  kaynak: IcBaglantiKaynagi,
): Promise<Map<string, Route>> {
  const sonuc = new Map<string, Route>()
  const hatalar: string[] = []
  for (const k of new Set(kimlikler)) {
    try {
      sonuc.set(k, await icBaglantiCoz(k, dil, kaynak))
    } catch (e) {
      hatalar.push(e instanceof Error ? e.message : String(e))
    }
  }
  if (hatalar.length > 0) {
    const hata = new IcBaglantiHatasi(`${hatalar.length} kimlik`, `\n  ${hatalar.join('\n  ')}`)
    throw hata
  }
  return sonuc
}
