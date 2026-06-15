/**
 * Sözlükte nokta-yollu (ör. "common.categoryList.ac") bir anahtarı güvenle çözer.
 * Anahtar bulunamazsa path'in KENDİSİNİ döndürür (i18n "ham anahtar" semantiği —
 * çağıran taraf "çözülemedi"yi `sonuç === path` ile anlar).
 *
 * Saf fonksiyon, 'use client' YOK: hem Server Component'larda (ör. app/[lang]/page.tsx)
 * hem de I18nProvider (client) tarafından paylaşılır. Tek kopya = drift yok.
 */
export function getDictValue(obj: unknown, path: string): string {
  try {
    const keys = path.split('.')
    let current: unknown = obj
    for (const k of keys) {
      if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k]
      } else {
        return path
      }
    }
    if (typeof current === 'string') return current
    if (typeof current === 'number' || typeof current === 'boolean') return String(current)
    return path
  } catch {
    return path
  }
}
