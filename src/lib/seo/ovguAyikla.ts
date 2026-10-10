/**
 * ÜSTÜNLÜK / ÖVGÜ CÜMLESİ AYIKLAMA (SEO-REC-497, çürütücü bulgusu 10).
 *
 * NİÇİN: marka kayıtlarındaki `description` üretici sitesinden alınmıştır ("dünya lideri", "dünyanın en geniş
 * ürün gamı", "öncüsüdür"). Bu cümleler üreticinin kendi iddiasıdır; arama sonucu açıklamasına girince VentHub'ın
 * cümlesi gibi görünür ve sitede DOĞRULANAMAZ. Cetvel (docs/standards/yayin-gorunurluk-denetim-standard.md) bu
 * metinleri açıklamadan çıkarır: doğrulanamayan övgü cümlesi kalkar, kalan cümleler aynen korunur.
 *
 * YÖN: kalıp bilerek GENİŞ tutulur ("dünya", "world" tek başına eşleşir). Fazla atmanın bedeli bilgi kaybıdır
 * (yerine doğrulanabilir yedek cümle gelir); kaçırmanın bedeli sitede doğrulanamayan iddiadır. İkisi eşit değil.
 *
 * KAPSAM: yalnız arama sonucu açıklaması. Sayfa gövdesindeki marka metni ve kayıt (`brands.ts`) DEĞİŞMEZ.
 */

import { cumleSonuKonumu } from './aciklamaKirp'

/** Üstünlük / kıyas / lider iddiası kalıpları (TR + EN). Küçük harfe çevrilmiş metne uygulanır (bkz. `ovguVarMi`). */
export const OVGU_KALIBI =
  /dünya|lider|en geniş|en büyük|en iyi|en kaliteli|en verimli|en yüksek|öncü|önde gelen|standart(?:ları)? belirl|avantajlı|ekonomik|bir numaralı|eşsiz|rakipsiz|üstün|\bworld|leader|leading|broadest|largest|\bbest\b|pioneer|set the standard|most advanced|most efficient|highest quality|most economical|competitive|number one|unmatched|top-of-the-line|superior/i

/**
 * Metinde üstünlük iddiası var mı? Türkçe büyük harf güvenli: "SEKTÖRÜN LİDERİ" → "sektörün lideri"; noktasız ı
 * da i'ye indirilip ikinci kez denenir ("LIDER" → "lıder" → "lider").
 */
export function ovguVarMi(metin: string): boolean {
  const kucuk = metin.toLocaleLowerCase('tr')
  return OVGU_KALIBI.test(kucuk) || OVGU_KALIBI.test(kucuk.replace(/ı/g, 'i'))
}

/**
 * Metni cümlelerine ayırır (boş cümleler atılır). Cümle sınırı kırpıcıyla (`aciklamaKirp`) ORTAK kuraldır:
 * "Dr.", "No.", "Ltd. Şti.", "3 m. 5 kW" bölmez; cümle sonundaki kapatan tırnak cümleyle kalır.
 */
export function cumleleriAyir(metin: string): string[] {
  const t = metin.replace(/\s+/g, ' ').trim()
  const cumleler: string[] = []
  let bas = 0
  for (let i = 0; i < t.length; i++) {
    const j = cumleSonuKonumu(t, i)
    if (j === -1) continue
    cumleler.push(t.slice(bas, j + 1))
    bas = j + 2
    i = j + 1
  }
  cumleler.push(t.slice(bas))
  return cumleler.map((c) => c.trim()).filter((c) => c.length > 0)
}

/**
 * Üstünlük iddiası taşıyan cümleleri atar, kalanı tek boşlukla birleştirir.
 * Hiç cümle kalmazsa '' döner (çağıran yedek metne düşer; uydurma metin ÜRETİLMEZ).
 */
export function ovguCumleleriniAt(metin: string | null | undefined): string {
  if (!metin) return ''
  return cumleleriAyir(metin)
    .filter((c) => !ovguVarMi(c))
    .join(' ')
}
