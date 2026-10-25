/**
 * META AÇIKLAMA KIRPICI (REC-497, GEO-SEO 2026-10-02).
 *
 * NİÇİN VAR: ürün ailesi sayfası açıklamayı `metin.substring(0, 160)` ile kesiyordu. Canlı ölçüm
 * (canlı kapı, 2026-10-02): 29 aile sayfasının açıklaması tam 160 karakterde ve cümle ortasında
 * bitiyordu ("... debili BVU 1000 modeli", "... dikdörtgen kanal tipi rady"). Google'ın belgesi
 * açıklamanın kesilebileceğini söyler; ama arama sonucunda yarım sözcükle biten bir cümle,
 * markanın gördüğü ilk metindir ve kusurdur. Kesme TEK yerde, sözcük ve cümle sınırına saygılı
 * yapılır; çağıran `.substring` yazamaz (INV-ACIKLAMA-KIRP-1 kaynağı tarar).
 *
 * KURAL (sırayla):
 *  1. Boşluk normalize edilir (art arda boşluk/satır sonu → tek boşluk), uçlar kırpılır.
 *  2. `azami` içinde sığıyorsa AYNEN döner.
 *  3. Sığmıyorsa `azami` içindeki SON CÜMLE SONUNDA biter; yalnız sonuç `ACIKLAMA_ASGARI`
 *     karakterden kısa değilse (tek kısa cümle arama sonucunu boş bırakır).
 *     Cümle sonu = `.` `!` `?` `…` + boşluk + BÜYÜK harf (ya da metnin kendi sonundaki aynı işaret).
 *     "maks. 1200 m³/h" ya da "yaklaşık 3 m. 5 kW" gibi kısaltma noktaları cümle sonu SAYILMAZ
 *     (sonraki harf büyük değil); "0.5 m³/h" gibi ondalık noktası da (nokta sonrası boşluk yok).
 *  3b. `azami` içinde uygun cümle sonu YOKSA (tek uzun cümle; URN-140 / SEO-61): `azami`yi aşan İLK TAM cümle
 *     `esnek` tavanına (`ACIKLAMA_ESNEK_AZAMI`) kadar kabul edilir. Cümle ortasında "…" ile kesmek yerine tam cümle
 *     verilir: Google gösterim sınırında kendi kesmesini yapar, bizim HTML'imiz ise yarım düşünce taşımaz.
 *  4. O da yoksa (ilk cümle `esnek` tavanını da aşıyor) son SÖZCÜK sınırında kesilir, sondaki ayraçlar
 *     (`,` `;` `:` `-` `(`) atılır, `…` eklenir. Yarım sözcük ASLA kalmaz; yalnız boşluksuz tek uzun parçada
 *     zorunlu kesim olur. Bu dal kaynak metnin kısaltılması gereken sayfalar içindir (dürüst kesik; sessiz sahte bitiş yok).
 *
 * Sonuç uzunluğu, 3b dalı dışında, HER ZAMAN `azami`'yi aşmaz; 3b dalında `esnek`'i aşmaz. `azami` özel verilirse
 * (varsayılan dışı) `esnek` de ona eşitlenir: çağıranın verdiği sınır sert kalır. Uzunluk UTF-16 birimiyle sayılır;
 * Türkçe harfler tek birimdir (canlı kapı da `[...d].length` ile aynı sonucu görür). Saf fonksiyon: ağ, DB, zaman yok.
 */

/** Arama sonucunda görünür kalan makul üst sınır (Google 150-160 civarında keser). */
export const ACIKLAMA_AZAMI = 155

/**
 * Tek uzun cümlede (azami içinde cümle sonu yok) tam cümleye tanınan üst tavan (URN-140, 25 Ekim ölçümü: 47 ailenin
 * 22'si, 6 markanın 3'ü azami içinde cümle sonu taşımıyordu). Ölçülen ilk cümle uzunlukları 157-284 arasında sürekli,
 * sonra 352'ye atlıyor (tek aile: vorticent-cms-atex); 300 bu boşluğun içinde. Google ve sosyal önizlemeler zaten
 * kendi kesmesini yapar, bizim HTML'imiz yarım düşünce taşımaz. Üstü KAYNAK METİN işidir (ilk cümle bölünür).
 */
export const ACIKLAMA_ESNEK_AZAMI = 300

/** Cümle sınırında bitirmek için asgari uzunluk: bundan kısa tek cümle yerine sözcük sınırı seçilir. */
export const ACIKLAMA_ASGARI = 70

const SONDA_ATILAN = /[\s,;:\-–—([/]+$/u
const CUMLE_BITISI = /[.!?…]$/
const YETIM_VEKIL = /[\uD800-\uDBFF]$/

/** Cümleyi başlatabilen karakter: büyük harf, rakam ya da açan tırnak/parantez. */
const CUMLE_BASI = /[A-ZÇĞİÖŞÜ0-9"'“‘«([]/
/** Cümle sonundan sonra gelebilen kapatan tırnak/parantez ("…çalışır.\" Yeni cümle"). */
const KAPATAN = /["'”’»)\]]/

/**
 * Sonuna nokta konunca cümle bitirmeyen kısaltmalar (küçük harfle, Türkçe kurala göre). Tek harfli belirteçler
 * (m. 5 kW, A. Yılmaz) de cümle sonu SAYILMAZ. Liste kasıtlı kısa: katalog metninde ölçülen kısaltmalar.
 */
const KISALTMALAR = new Set([
  'dr', 'prof', 'doç', 'maks', 'min', 'no', 'vb', 'vs', 'örn', 'ör', 'bkz', 'yak', 'sn', 'tel', 'adr',
  'ca', 'approx', 'ltd', 'şti', 'inc', 'fig', 'ref', 'nr', 'st', 'co', 'corp',
])

/** `i` konumundaki `.` önündeki sözcük kısaltma mı? (Cümle bölücü `ovguAyikla` ile ORTAK: tek kural, iki bölücü yok.) */
export function kisaltmaMi(t: string, i: number): boolean {
  let b = i
  while (b > 0 && /[\p{L}]/u.test(t[b - 1])) b--
  const sozcuk = t.slice(b, i).toLocaleLowerCase('tr')
  // Birim paydası ("m³/h." "km/h." "l/s.") tek harf olsa da kısaltma DEĞİL, cümle sonudur (URN-140: aile açıklaması
  // "… 1.200 m³/h ile 3.200 m³/h." cümle sonu sayılmayıp "…" ile kesiliyordu).
  if (sozcuk.length === 1 && t[b - 1] === '/') return false
  return sozcuk.length === 1 || KISALTMALAR.has(sozcuk)
}

/**
 * `i` konumundaki karakter cümleyi bitiriyor mu? `.` `!` `?` `…` (+ kapatan tırnak/parantez) + boşluk + cümle başı.
 * @returns cümlenin son karakterinin konumu (kapatan tırnak dahil) ya da -1
 */
export function cumleSonuKonumu(t: string, i: number): number {
  const c = t[i]
  if (c !== '.' && c !== '!' && c !== '?' && c !== '…') return -1
  let j = i
  while (KAPATAN.test(t[j + 1] ?? '')) j++
  if (t[j + 1] !== ' ' || !CUMLE_BASI.test(t[j + 2] ?? '')) return -1
  if (c === '.' && j === i && kisaltmaMi(t, i)) return -1
  return j
}

/** Metnin kendi sonu bir cümle sonu mu? (`.` `!` `?` `…` + isteğe bağlı kapatan tırnak/parantez; kısaltma noktası sayılmaz.) */
function metinSonuCumleMi(t: string): boolean {
  let son = t.length - 1
  while (son > 0 && KAPATAN.test(t[son])) son--
  const c = t[son]
  if (c !== '.' && c !== '!' && c !== '?' && c !== '…') return false
  return !(c === '.' && son === t.length - 1 && kisaltmaMi(t, son))
}

/**
 * `tavan` içinde biten cümle sonlarının UZUNLUKLARI (artan sırada; cümlenin son karakterinden sonraki konum).
 * Cümle sonu = `cumleSonuKonumu`; metnin kendi sonu da, tamamı `tavan`a sığıyorsa ve cümle işaretiyle bitiyorsa sayılır
 * (tek cümlelik açıklamada bu son cümledir, ardında büyük harfli devam olmadığı için ortadan görünmez).
 */
function cumleSonlari(t: string, tavan: number): number[] {
  const sonlar: number[] = []
  for (let i = 0; i < Math.min(t.length, tavan); i++) {
    const j = cumleSonuKonumu(t, i)
    if (j !== -1 && j < tavan) sonlar.push(j + 1)
  }
  if (t.length <= tavan && metinSonuCumleMi(t)) sonlar.push(t.length)
  return sonlar
}

export function aciklamaKirp(
  metin: string | null | undefined,
  azami: number = ACIKLAMA_AZAMI,
  esnek: number = azami === ACIKLAMA_AZAMI ? ACIKLAMA_ESNEK_AZAMI : azami,
): string {
  const t = (metin ?? '').replace(/\s+/g, ' ').trim()
  if (!t || azami <= 0) return ''
  if (t.length <= azami) return t

  const sonlar = cumleSonlari(t, Math.max(esnek, azami))

  // 3) azami içindeki son cümle sonu (kapatan tırnak dahil sonuç azami'yi aşmamalı)
  const azamiIcinde = sonlar.filter((uzunluk) => uzunluk <= azami && uzunluk >= ACIKLAMA_ASGARI)
  if (azamiIcinde.length > 0) return t.slice(0, azamiIcinde[azamiIcinde.length - 1])

  // 3b) azami içinde uygun cümle sonu yok (tek uzun cümle): azami'yi aşan İLK tam cümle, esnek tavan içinde
  const tasan = sonlar.find((uzunluk) => uzunluk > azami)
  if (tasan !== undefined) return t.slice(0, tasan)

  // 4) sözcük sınırı + "…" için bir karakter yer bırak
  const pencere = t.slice(0, azami - 1)
  const bosluk = pencere.lastIndexOf(' ')
  const kesik = (bosluk >= ACIKLAMA_ASGARI ? pencere.slice(0, bosluk) : pencere)
    .replace(YETIM_VEKIL, '')
    .replace(SONDA_ATILAN, '')
  // Kesim bir kısaltmanın noktasında bittiyse ("… maks.") cümle bitmiş sayılmaz: "…" eklenir.
  const gercekCumleSonu = CUMLE_BITISI.test(kesik) && !(kesik.endsWith('.') && kisaltmaMi(kesik, kesik.length - 1))
  return gercekCumleSonu ? kesik : `${kesik}…`
}
