import { translateSpecKey } from './productHelpers'

/**
 * F5-B W2.2 — Teknik özellik ETİKET çözümü (asla ham anahtar yolu render etme).
 *
 * PDP'de spec grup başlıkları ve alan adları dinamik anahtarlarla çözülür
 * (`pdp.specGroups.<group>` / `pdp.specs.<key>`). DB'den sözlükte karşılığı olmayan
 * yeni bir anahtar geldiğinde `t()` anahtarın KENDİSİNİ döndürür ve ekrana
 * "PDP.SPECS.MAX_DELIVERY_M3H" gibi ham yol basılır (prod'da görüldü).
 *
 * Buradaki yardımcılar zinciri kurar:
 *   1) sözlük (varsa) → 2) küratörlü TR etiket (translateSpecKey) →
 *   3) insancıl etiket (snake_case → Başlık Sözcükleri + parantezli birim)
 * ve HİÇBİR koşulda nokta içeren ham yol döndürmez.
 */

type TranslateFn = (key: string, paramsOrAlt?: Record<string, unknown> | string) => string

/** Anahtar sonundaki birim son-ekleri → görünen birim. */
const UNIT_SUFFIXES: Record<string, string> = {
  m3h: 'm³/h',
  m3s: 'm³/s',
  ls: 'l/s',
  ms: 'm/s',
  mm: 'mm',
  cm: 'cm',
  kg: 'kg',
  kw: 'kW',
  w: 'W',
  v: 'V',
  a: 'A',
  hz: 'Hz',
  rpm: 'rpm',
  db: 'dB',
  dba: 'dB(A)',
  pa: 'Pa',
  bar: 'bar',
  c: '°C',
  k: 'K',
  h: 'h',
  l: 'L',
  m: 'm',
}

function titleCaseWord(word: string): string {
  if (!word) return word
  return word.charAt(0).toLocaleUpperCase('en-US') + word.slice(1).toLocaleLowerCase('en-US')
}

/**
 * `max_delivery_m3h` → `Max Delivery (m³/h)`
 * `number_of_speeds` → `Number Of Speeds`
 * Birim eşleşmezse son-ek normal bir kelime olarak bırakılır.
 */
export function humanizeSpecKey(key: string): string {
  const parts = key.split(/[_\s]+/).filter(Boolean)
  if (parts.length === 0) return key

  const lastLower = parts[parts.length - 1].toLowerCase()
  const unit = parts.length > 1 ? UNIT_SUFFIXES[lastLower] : undefined
  const words = unit ? parts.slice(0, -1) : parts

  const label = words.map(titleCaseWord).join(' ')
  return unit ? `${label} (${unit})` : label
}

/** `t()` anahtarı çözemediğinde döndürdüğü değeri (ham yol) tespit eder. */
function isUnresolved(dictKey: string, translated: string): boolean {
  return translated === dictKey || translated.trim() === ''
}

/**
 * Spec ALAN adı: sözlük → küratörlü TR etiket → insancıl etiket.
 * Ham `pdp.specs.<key>` yolu ASLA dönmez.
 */
export function specFieldLabel(key: string, t: TranslateFn): string {
  const dictKey = `pdp.specs.${key}`
  const translated = t(dictKey)
  if (!isUnresolved(dictKey, translated)) return translated

  // translateSpecKey küratörlü bir eşleşme bulduysa onu kullan; bulamayınca kendi
  // jenerik Title Case fallback'ini döner — o durumda birim-farkındalı sürüme geç.
  const curated = translateSpecKey(key)
  const genericFallback = key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return curated === genericFallback ? humanizeSpecKey(key) : curated
}

/**
 * Spec GRUP başlığı: sözlük → gruplayıcının kendi etiketi → insancıl etiket.
 * Ham `pdp.specGroups.<group>` yolu ASLA dönmez.
 */
export function specGroupLabel(groupKey: string, t: TranslateFn, fallbackLabel?: string): string {
  const dictKey = `pdp.specGroups.${groupKey}`
  const translated = t(dictKey)
  if (!isUnresolved(dictKey, translated)) return translated
  return fallbackLabel?.trim() ? fallbackLabel : humanizeSpecKey(groupKey)
}
