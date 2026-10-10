/**
 * URN-84 · sözlükte BOŞ ('') bırakılan değer çizimde boş öğe ya da boş kutu üretmez.
 *
 * NİÇİN: Blog BLG-6 kesin metin tablosu bazı anahtarların yeni değerini BOŞ yazıyor ("kaldırma":
 * o öğe ekrandan kalkar). Sözlük anahtarı SİLİNMEZ — TR/EN parite testi anahtar kümesini ölçer —
 * kalkan şey ÇİZİMDİR. Bileşen '' değerini olduğu gibi basarsa ekranda boş madde işareti, boş
 * kart ya da boş etiket çıkar.
 *
 * KURAL (bileşenlerde):
 *  · liste öğesi boşsa o öğe çizilmez (`doluMetinler`);
 *  · kart/çip: değer VE etiket birlikte boşsa kart çizilmez; yalnız biri boşsa yalnız o alan basılmaz;
 *  · yalnız boşluk içeren dize de boş sayılır.
 */

/**
 * Dize ve en az bir boşluk-dışı karakter içeriyorsa true; `''`, yalnız boşluk, `null`, `undefined` → false.
 *
 * Parametre tipi bilerek dar (`unknown` değil): sayı ya da nesne geçilirse derleyici uyarır, "dolu mu" sorusu
 * yalnız metin için sorulur. Çalışma anında dize-olmayan değer yine false döner (savunma). Dönüş `boolean`:
 * tip koruyucu olsaydı yanlış dalda `string` daralıp `never` olurdu.
 */
export function doluMu(deger: string | null | undefined): boolean {
  return typeof deger === 'string' && deger.trim().length > 0
}

/** Listeden boş / yalnız-boşluk / dize-olmayan öğeleri atar; sırayı korur. Liste yoksa boş dizi. */
export function doluMetinler(liste: ReadonlyArray<string | null | undefined> | null | undefined): string[] {
  return (liste ?? []).filter((metin): metin is string => doluMu(metin))
}
