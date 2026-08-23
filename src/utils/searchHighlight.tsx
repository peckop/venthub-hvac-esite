import React, { ReactNode } from 'react'

import { foldForSearch } from '../i18n/case'

/**
 * Belirli bir metin içinde aranan terimi bulup <mark> ile vurgular.
 *
 * Eşleştirme **dile duyarlı ve aksan duyarsızdır** (`foldForSearch`): kullanıcı
 * "siginak" yazdığında "Sığınak Fanı" içindeki terim de vurgulanır. Eski sürüm
 * `String.prototype.toLowerCase()` ve `RegExp` `i` bayrağı kullanıyordu; ikisi de
 * locale-bağımsızdır ve Türkçe'de `İ`/`ı` çiftini yanlış eşler.
 *
 * Cetvel: docs/standards/i18n-localization-standard.md — eksen C
 *
 * @param text Vurgulama yapılacak ana metin
 * @param query Aranan terim
 * @param lang Aktif dil (varsayılan 'tr' — vitrinin birincil dili)
 */
export function highlightMatch(text: string, query: string, lang: string = 'tr'): ReactNode {
    const aranan = query.trim()
    if (!aranan) return text

    const katliMetin = foldForSearch(text, lang)
    const katliAranan = foldForSearch(aranan, lang)

    // Katlama tek-tek harf eşlemesi kurar; kurmadığı bir girdide (ör. 'ß' → 'ss')
    // dizinler kayar ve yanlış aralık işaretlenirdi. O durumda vurgulamadan dön —
    // yanlış vurgu, vurgu yokluğundan kötüdür.
    if (katliMetin.length !== text.length || katliAranan.length !== aranan.length) return text
    if (!katliAranan) return text

    const parcalar: { metin: string; vurgulu: boolean }[] = []
    let imlec = 0
    for (;;) {
        const bulundu = katliMetin.indexOf(katliAranan, imlec)
        if (bulundu === -1) break
        if (bulundu > imlec) parcalar.push({ metin: text.slice(imlec, bulundu), vurgulu: false })
        parcalar.push({ metin: text.slice(bulundu, bulundu + katliAranan.length), vurgulu: true })
        imlec = bulundu + katliAranan.length
    }
    if (parcalar.length === 0) return text
    if (imlec < text.length) parcalar.push({ metin: text.slice(imlec), vurgulu: false })

    return (
        <span>
            {parcalar.map((p, i) =>
                p.vurgulu ? (
                    <mark key={i} className="bg-yellow-100 text-primary-navy font-semibold rounded-sm px-0.5">
                        {p.metin}
                    </mark>
                ) : (
                    <span key={i}>{p.metin}</span>
                )
            )}
        </span>
    )
}
