/**
 * Dile duyarlı metin sıralaması.
 *
 * NİÇİN VAR: `String.prototype.localeCompare(b)` dil parametresi verilmezse
 * **çalışma ortamının VARSAYILAN yerelini** kullanır. Bu varsayılan sunucuda (Node) ve
 * istemcide (tarayıcı) AYNI OLMAK ZORUNDA DEĞİLDİR — hatta genelde değildir.
 *
 * Sonuç yalnız "yanlış sıra" değil, **hidrasyonda değişen sıra**dır: sunucu bir sırayla
 * HTML basar, istemci başka bir sırayla yeniden sıralar. Ölçüm (2026-08-23, aynı dizi):
 *
 *   varsayılan 'tr' : Cam · Çatı · Isıtıcı · İç Ortam · Sığınak · Sirkülasyon
 *   'en' ile        : Cam · Çatı · İç Ortam · Isıtıcı · Sirkülasyon · Sığınak
 *                                  ^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^
 *                                  iki çift yer değiştirdi
 *
 * Türk alfabesinde `ç > c`, `ğ > g`, `ı < i`, `ö > o`, `ş > s`, `ü > u`. Dil verilmezse
 * bu kuralın uygulanıp uygulanmaması **tesadüfe** kalır.
 *
 * Cetvel: docs/standards/i18n-localization-standard.md — eksen D
 */

/** `Intl.Collator` kurulumu pahalıdır; dil başına bir kez kurulur. */
const collatorlar = new Map<string, Intl.Collator>()

function collator(lang: string): Intl.Collator {
  let c = collatorlar.get(lang)
  if (!c) {
    // `numeric: true` → "Fan 2" < "Fan 10" (aksi halde metinsel sırada 10 önce gelir).
    // `sensitivity: 'variant'` → varsayılan; aksan ve kasa AYIRT EDİLİR (sıralama, arama değil).
    c = new Intl.Collator(lang, { numeric: true, sensitivity: 'variant' })
    collatorlar.set(lang, c)
  }
  return c
}

/**
 * İki metni dile göre karşılaştırır. `Array.prototype.sort` ile doğrudan kullanılır.
 *
 *   [...kategoriler].sort((a, b) => compareText(a.name, b.name, lang))
 */
export function compareText(a: string, b: string, lang: string): number {
  return collator(lang).compare(a, b)
}

/**
 * Bir alana göre sıralayan karşılaştırıcı üretir — çağrı yerinde daha az gürültü.
 *
 *   [...kategoriler].sort(byText((c) => c.name, lang))
 */
export function byText<T>(secici: (x: T) => string, lang: string): (a: T, b: T) => number {
  const c = collator(lang)
  return (a, b) => c.compare(secici(a), secici(b))
}

/**
 * Harmanlamanın gerçekten DİLE DUYARLI olup olmadığını ölçer.
 *
 * `Intl.Collator` ICU verisine dayanır. ICU'suz (small-icu) bir çalıştırmada sessizce
 * kök harmanlamaya düşer ve Türkçe sırası bozulur — hata FIRLATMAZ. Bu yüzden varsayım
 * bırakmıyoruz: kapı bunu çağırıp ölçer, düşerse KIRMIZI verir.
 *
 * Sınama: Türkçe'de `ı` harfi `i`'den ÖNCE gelir; kök harmanlamada gelmez.
 */
export function harmanlamaDileDuyarliMi(): boolean {
  return compareText('ı', 'i', 'tr') < 0 && compareText('c', 'ç', 'tr') < 0
}
