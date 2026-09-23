/**
 * INV-DIL-DUSUSU-1 · vitrin metnini YALNIZ sayfanın dilinde çözer — başka dile DÜŞMEZ.
 *
 * NİÇİN (Recep 2026-09-22, karar 79 → onarım): üç ayrı `pickLang` kopyası "tercih edilen dil →
 * tr → en" sırasıyla çözüyordu; İngilizce metni olmayan 25 aile sayfası `/en/` altında Türkçe
 * gövde metni basıyordu (ölçüm: 47 ailenin 45'inde TR, 20'sinde EN açıklama). Yanlış dilde metin
 * bir kusurdur; metin yoksa o yüzey gizlenir (cetvel: vitrin-metni-standard.md "Dil kuralı").
 *
 * Aynı dosyada iki dil de dolu olabilir; dönen değer daima `lang` anahtarının değeridir.
 */
export type DilliMetin = { tr?: string | null; en?: string | null } | null | undefined

export function dildekiMetin(value: DilliMetin, lang: string): string | null {
  if (!value) return null
  const metin = lang === 'en' ? value.en : value.tr
  return typeof metin === 'string' && metin.trim().length > 0 ? metin : null
}

/**
 * Sunucudan istemciye giden {tr,en} metnini SAYFANIN DİLİNE indirir.
 *
 * NİÇİN (2026-09-22 ölçümü, yerel üretim paketi): ekranda düzeltme yetmiyordu — `/en/products/
 * avens-nimax` ve `/en/category/fans` HTML'inde Türkçe aile/kategori metni ekranda YOKTU ama
 * sayfaya gömülü veride (RSC akışı) VARDI; istemci bileşenine iki dilin metni birden gidiyordu.
 * Gömülü katman ekran katmanından ayrı ölçülür ve ayrı onarılır.
 */
export function metniIndir(value: unknown, lang: string): { tr?: string | null; en?: string | null } | null {
  if (!value || typeof value !== 'object') return null
  const v = value as { tr?: unknown; en?: unknown }
  const metin = lang === 'en' ? v.en : v.tr
  return typeof metin === 'string' ? (lang === 'en' ? { en: metin } : { tr: metin }) : null
}

/** Aile satırının dilli metin alanları (açıklama, meta başlık/açıklama) sayfanın diline iner. */
export function aileMetniniIndir<T extends { description?: unknown; meta_title?: unknown; meta_description?: unknown }>(
  aile: T,
  lang: string
): T {
  const cikti = { ...aile }
  for (const alan of ['description', 'meta_title', 'meta_description'] as const) {
    if (alan in cikti) (cikti as Record<string, unknown>)[alan] = metniIndir(cikti[alan], lang)
  }
  return cikti
}
