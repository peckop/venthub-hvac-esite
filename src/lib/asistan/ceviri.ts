/**
 * ÜRÜN ASİSTANI — sözlükten metin çözücü (URN-171, adım 1).
 *
 * Şablon basıcı ve hata yolları görünen metni KENDİ yazmaz; çağırdığı `cevir` işlevinden alır. Bu dosya o
 * işlevi tek sözlük kaynağından (`tr.ts` / `en.ts`, `asistan.*` ağacı) kurar. `useI18n` kullanılmaz: asistan
 * sunucuda koşar, istemci bağlamı yoktur; sayfa kökleri de aynı deseni kullanır (`getDictValue` + `t`).
 *
 * Adı bilerek `t` DEĞİL `cevir`: `t(değişken)` çağrısı INV-6 (i18n ölü anahtar) kapısında "izlenemeyen çağrı"
 * sayılır. Anahtarlar bu modüllerde tırnaklı tam yol olarak yazılır, kapı onları tüketici sayar.
 */
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import type { AdresDili } from '@/utils/adresUret'

export type CeviriParametresi = Readonly<Record<string, string | number>>
export type Ceviri = (anahtar: string, parametre?: CeviriParametresi) => string

const SOZLUKLER: Readonly<Record<AdresDili, unknown>> = { tr, en }

export function asistanCevirisi(dil: AdresDili): Ceviri {
  const sozluk = SOZLUKLER[dil]
  return (anahtar, parametre) => {
    const metin = getDictValue(sozluk, anahtar)
    if (!parametre) return metin
    return metin.replace(/\{\{\s*(\w+)\s*\}\}/g, (_eslesme, ad: string) => {
      const deger = parametre[ad]
      return deger === undefined ? '' : String(deger)
    })
  }
}
