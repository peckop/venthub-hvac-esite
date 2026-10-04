/**
 * ROTA DİLİ — sayfa adreslerinin dile göre yazımı: TEK tablo, üç çıktı (OPS-52, kararlar 267/269/270).
 *
 * NİÇİN: `about`/`contact` gibi klasör adları iki dilde ortaktı; Türkçe ziyaretçi `/tr/about` görüyordu.
 * Karar 267 (hakkımızda) ve 269 (iletişim) ile adres dile göre yazılır: `/tr/hakkimizda`, `/en/about`.
 * Klasörler DEĞİŞMEZ (sayfa kopyası yok): yeni adres iç yeniden yazımla eski klasöre iner, eski adres
 * kalıcı yönlendirmeyle yeniye gider. Üç çıktı aynı tablodan üretilir, ayrışamaz:
 *  · `rotaDiliYonlendirmeleri` — eski adres → yeni adres, TEK hop 308 (adres-semasi-standard.md A9).
 *  · `rotaDiliYenidenYazimlari` — yeni adres → mevcut klasör (kullanıcı adresi değişmez, sayfa aynı).
 *  · `rotaDiliEsle` — dilsiz eski adres (`/about`) için saf arama; middleware'in dilsiz kolu içindir.
 *
 * NİÇİN .mjs: bu liste `next.config.mjs` içinden çağrılır ve o dosya TypeScript içe aktaramaz
 * (aynı gerekçe: bilgiMerkeziYonlendirmeleri.mjs). Testler de aynı fonksiyonları doğrudan çağırır;
 * yayındaki kural ile test edilen kural aynı koddur.
 *
 * ANAHTAR (plan §2.3): `NEXT_PUBLIC_ADRES_DILI`, derleme anında okunur; YALNIZ tam `1` açar. Yok, boş,
 * `true`, `0` ya da bozuk değer = KAPALI (güvenli yön). Kapalıyken üç çıktı da BOŞTUR → hiçbir adres
 * değişmez (kapı: INV-ROTA-DILI-KAPALI-1, src/__tests__/conformance/rota-dili-kapali-sifir-fark.test.ts).
 * K3B (`ADRES_SEMASI_K3B`) ile BAĞLANMAZ: iki ayrı anahtardır, biri tek başına geri alınabilir.
 *
 * VERİ ayrı dosyada (`rotaDili.veri.json`): mekanizma veriden bağımsızdır, Design'ın sayfa listesi
 * yalnız o dosyayı doldurur. Tablo YÜKLENİRKEN doğrulanır; bozuk tablo derlemeyi düşürür, sessizce
 * yutulmaz (kapı yeşilken yanlış yönlendirme canlıya çıkmasın).
 *
 * KAPSAM SINIRI (karar 270): Aşama 2 yüzeyleri (`account`, `cart`, `checkout`, `auth`, `payment-success`)
 * tabloya GİREMEZ. Bu adresler `next.config` noindex başlığına ve ödeme akışına bağlı; dil değişikliği
 * ayrı aşama ve ayrı karardır.
 */

import { readFileSync } from 'node:fs'

/** Desteklenen diller; adres dilli kurallarda ikisi de üretilir. */
export const DILLER = /** @type {const} */ (['tr', 'en'])

/** Karar 270: Aşama 2 önekleri. Bu adres ağaçlarına rota dili uygulanmaz. */
export const ASAMA_2_ONEKLERI = /** @type {const} */ (['account', 'cart', 'checkout', 'auth', 'payment-success'])

/**
 * @typedef {{ id: string, klasor: string, tr: string, en: string, altYollar?: boolean }} RotaDiliSatiri
 * `klasor`: bugünkü dilden bağımsız klasör/yol (`/` içerebilir). `tr`/`en`: o dildeki yeni genel yol;
 * klasörle aynıysa o dilde değişiklik yoktur. `altYollar`: true ise `/:path*` kuyruğu da eşlenir.
 */

/**
 * @typedef {{ source: string, destination: string, permanent: boolean }} Yonlendirme
 * @typedef {{ source: string, destination: string }} YenidenYazim
 */

/**
 * Yol parçası: küçük harf/rakam, tire; `/` ile bölümlenebilir. Next'in desen karakterleri (`:`, `*`, `(`)
 * ve baştaki/sondaki `/` BİLİNÇLİ dışarıda: tablodaki bir yazım hatası desen enjeksiyonuna dönmesin.
 */
const YOL_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/

const SATIR_ANAHTARLARI = new Set(['id', 'klasor', 'tr', 'en', 'altYollar'])

/** @param {string} mesaj */
function hata(mesaj) {
  return new Error(`rotaDili: ${mesaj}`)
}

/**
 * Ortam değişkeni değerinden anahtarı okur. YALNIZ tam `'1'` açar; başka her şey kapalı.
 * (`true`, `on`, ` 1`, `01` bilerek kapalı: yanlış yazılmış bir anahtar canlıda adres değiştirmesin.)
 * @param {string | undefined} deger
 * @returns {boolean}
 */
export function adresDiliOku(deger) {
  return deger === '1'
}

/**
 * Tabloyu doğrular ve aynen döndürür; ihlalde ATAR (sessiz yutma yok).
 *  · biçim: bilinmeyen anahtar yok (yazım hatası `altYolar` sessizce yok sayılmasın), yollar `YOL_DESENI`'ne uyar
 *  · `id` ve `klasor` tekil
 *  · Aşama 2 önekleri ve dil kodları (`tr`/`en`) hiçbir alanın ilk parçası olamaz
 *  · bir dilde iki satır aynı yeni yola gidemez; yeni yol başka satırın klasörüyle çakışamaz
 *    (biri yönlendirme kaynağı, öteki yeniden yazım kaynağı olur → belirsiz adres)
 *  · `altYollar` açıkken yeni yol kendi klasörünün altında olamaz (sonsuz yönlendirme döngüsü)
 * @param {unknown} tablo
 * @returns {RotaDiliSatiri[]}
 */
export function rotaDiliTablosuDogrula(tablo) {
  if (!Array.isArray(tablo)) throw hata('tablo bir dizi olmalı')
  const idler = new Set()
  const klasorler = new Set()
  /** @type {Record<'tr' | 'en', Map<string, string>>} */
  const yeniYollar = { tr: new Map(), en: new Map() }

  tablo.forEach((satir, sira) => {
    const ad = `satır ${sira}${satir && typeof satir.id === 'string' ? ` (${satir.id})` : ''}`
    if (satir === null || typeof satir !== 'object' || Array.isArray(satir)) throw hata(`${ad}: nesne olmalı`)
    for (const anahtar of Object.keys(satir)) {
      if (!SATIR_ANAHTARLARI.has(anahtar)) throw hata(`${ad}: bilinmeyen anahtar "${anahtar}"`)
    }
    if (typeof satir.id !== 'string' || satir.id === '') throw hata(`${ad}: id boş olamaz`)
    if (idler.has(satir.id)) throw hata(`${ad}: id tekrar ediyor`)
    idler.add(satir.id)

    for (const alan of /** @type {const} */ (['klasor', 'tr', 'en'])) {
      const deger = satir[alan]
      if (typeof deger !== 'string' || !YOL_DESENI.test(deger)) {
        throw hata(`${ad}: "${alan}" geçerli bir yol parçası değil (${JSON.stringify(deger)})`)
      }
      const ilkParca = deger.split('/')[0]
      if (/** @type {readonly string[]} */ (ASAMA_2_ONEKLERI).includes(ilkParca)) {
        throw hata(`${ad}: "${alan}" Aşama 2 önekiyle başlıyor ("${ilkParca}"); karar 270 gereği tabloya girmez`)
      }
      if (/** @type {readonly string[]} */ (DILLER).includes(ilkParca)) {
        throw hata(`${ad}: "${alan}" dil koduyla başlıyor ("${ilkParca}"); dil öneki ile karışır`)
      }
    }
    if (satir.altYollar !== undefined && typeof satir.altYollar !== 'boolean') {
      throw hata(`${ad}: altYollar boolean olmalı`)
    }

    if (klasorler.has(satir.klasor)) throw hata(`${ad}: klasor "${satir.klasor}" başka satırda da var`)
    klasorler.add(satir.klasor)

    for (const dil of DILLER) {
      const onceki = yeniYollar[dil].get(satir[dil])
      if (onceki !== undefined) {
        throw hata(`${ad}: ${dil} yolu "${satir[dil]}" "${onceki}" satırıyla çakışıyor`)
      }
      yeniYollar[dil].set(satir[dil], satir.id)
      if (satir.altYollar && satir[dil].startsWith(`${satir.klasor}/`)) {
        throw hata(`${ad}: ${dil} yolu kendi klasörünün altında ve altYollar açık (sonsuz döngü)`)
      }
    }
  })

  for (const satir of tablo) {
    for (const dil of DILLER) {
      for (const diger of tablo) {
        if (diger !== satir && satir[dil] === diger.klasor) {
          throw hata(`${satir.id}: ${dil} yolu "${satir[dil]}" "${diger.id}" satırının klasörüyle çakışıyor`)
        }
      }
    }
  }
  // Önek zinciri: bir satırın HEDEFİ (yeni yol), başka satırın kaynağının (eski klasör ya da yeni yol) altına
  // düşerse adres iki sıçramayla çözülür ya da yeniden yazılır. `zincirVarMi` kural listesini tarar ama burada
  // kural üreticileri çağrılamaz (üreticiler bu doğrulayıcıyı çağırır), bu yüzden tablonun kendi alanlarından hesaplanır.
  for (const satir of tablo) {
    for (const dil of DILLER) {
      if (satir[dil] === satir.klasor) continue
      const hedef = { taban: satir[dil], alt: Boolean(satir.altYollar) }
      for (const diger of tablo) {
        if (diger === satir || diger[dil] === diger.klasor) continue
        for (const kaynakYol of [diger.klasor, diger[dil]]) {
          if (kesisir(hedef, { taban: kaynakYol, alt: Boolean(diger.altYollar) })) {
            throw hata(`${satir.id}: ${dil} hedefi "${satir[dil]}" "${diger.id}" satırının "${kaynakYol}" yoluyla kesişiyor (zincir)`)
          }
        }
      }
    }
  }
  return /** @type {RotaDiliSatiri[]} */ (tablo)
}

/** Varsayılan tablo: veri dosyasından okunur ve yüklemede doğrulanır. */
export const ROTA_DILI = rotaDiliTablosuDogrula(
  JSON.parse(readFileSync(new URL('./rotaDili.veri.json', import.meta.url), 'utf8')),
)

/** `altYollar` satırında kaynak/hedefe eklenen kuyruk. */
const kuyruk = (/** @type {RotaDiliSatiri} */ satir) => (satir.altYollar ? '/:path*' : '')

/**
 * Eski adres → yeni adres, kalıcı (308), tek hop. Bir dilde yeni yol klasörden FARKLIYSA kural üretilir;
 * aynıysa o dilde değişiklik yoktur, kural da yoktur.
 * @param {boolean} acik anahtar (`adresDiliOku` çıktısı); false → boş liste
 * @param {RotaDiliSatiri[]} [tablo]
 * @returns {Yonlendirme[]}
 */
export function rotaDiliYonlendirmeleri(acik, tablo = ROTA_DILI) {
  if (!acik) return []
  rotaDiliTablosuDogrula(tablo)
  /** @type {Yonlendirme[]} */
  const liste = []
  for (const satir of tablo) {
    for (const dil of DILLER) {
      if (satir[dil] === satir.klasor) continue
      liste.push({
        source: `/${dil}/${satir.klasor}${kuyruk(satir)}`,
        destination: `/${dil}/${satir[dil]}${kuyruk(satir)}`,
        permanent: true,
      })
    }
  }
  return liste
}

/**
 * Yeni adres → mevcut klasör (iç yeniden yazım; tarayıcıda adres yeni kalır, sayfayı klasör üretir).
 * `beforeFiles` aşamasında kullanılır: sayfa dosyası aranmadan önce eşlenmeli.
 * @param {boolean} acik anahtar; false → boş liste
 * @param {RotaDiliSatiri[]} [tablo]
 * @returns {YenidenYazim[]}
 */
export function rotaDiliYenidenYazimlari(acik, tablo = ROTA_DILI) {
  if (!acik) return []
  rotaDiliTablosuDogrula(tablo)
  /** @type {YenidenYazim[]} */
  const liste = []
  for (const satir of tablo) {
    for (const dil of DILLER) {
      if (satir[dil] === satir.klasor) continue
      liste.push({
        source: `/${dil}/${satir[dil]}${kuyruk(satir)}`,
        destination: `/${dil}/${satir.klasor}${kuyruk(satir)}`,
      })
    }
  }
  return liste
}

/**
 * Dilsiz eski adresi (`/about`, `/about/ekip`) tablodan eşler; middleware'in dilsiz kolu içindir (saf,
 * DB yok — CLAUDE.md kural 12). Dil kararı çağıranındır (çerez / Accept-Language, standard A10): bu
 * fonksiyon iki dildeki hedefi de verir. Eşleşme yoksa ya da anahtar kapalıysa `null`.
 * Birden çok satır uyarsa EN UZUN klasör kazanır (özel kural genel kuralın önünde).
 * `tablo` çağıran tarafından doğrulanmış varsayılır (`ROTA_DILI` yüklemede doğrulanır); istek başına
 * yeniden doğrulanmaz.
 * @param {string} yol dil öneksiz yol (sorgu dizesiz), ör. `/about`
 * @param {RotaDiliSatiri[]} [tablo]
 * @param {boolean} [acik] anahtar; varsayılan kapalı
 * @returns {{ satirId: string, tr: string, en: string } | null}
 */
export function rotaDiliEsle(yol, tablo = ROTA_DILI, acik = false) {
  if (!acik) return null
  if (typeof yol !== 'string' || !yol.startsWith('/')) return null
  const temiz = yol.length > 1 ? yol.replace(/\/+$/, '') : yol
  /** @type {{ satir: RotaDiliSatiri, kalan: string } | null} */
  let enIyi = null
  for (const satir of tablo) {
    const taban = `/${satir.klasor}`
    let kalan = null
    if (temiz === taban) kalan = ''
    else if (satir.altYollar && temiz.startsWith(`${taban}/`)) kalan = temiz.slice(taban.length)
    if (kalan === null) continue
    if (enIyi === null || satir.klasor.length > enIyi.satir.klasor.length) enIyi = { satir, kalan }
  }
  if (enIyi === null) return null
  const { satir, kalan } = enIyi
  return { satirId: satir.id, tr: `/tr/${satir.tr}${kalan}`, en: `/en/${satir.en}${kalan}` }
}

/**
 * Next desen kuralını (`/:lang(tr|en)/…`) iki dile açar. Dilsiz ve dilli açık kurallar olduğu gibi kalır.
 * @param {Yonlendirme | YenidenYazim} kural
 * @returns {{ source: string, destination: string, orijinal: Yonlendirme | YenidenYazim }[]}
 */
function kuralAc(kural) {
  const dilKalibi = '/:lang(tr|en)'
  if (!kural.source.startsWith(dilKalibi)) {
    return [{ source: kural.source, destination: kural.destination, orijinal: kural }]
  }
  return DILLER.map((dil) => ({
    source: kural.source.replace(dilKalibi, `/${dil}`),
    destination: kural.destination.replace(/^\/:lang(?=\/|$)/, `/${dil}`),
    orijinal: kural,
  }))
}

/**
 * Bir desenin kapsadığı adres kümesi: sorgu dizesi atılır, sondaki `/:ad*` kuyruğu "alt yollar da" demektir.
 * @param {string} desen
 * @returns {{ taban: string, alt: boolean }}
 */
function adresKumesi(desen) {
  const yol = desen.split('?')[0]
  const eslesme = yol.match(/^(.*)\/:[A-Za-z]+\*$/)
  return eslesme ? { taban: eslesme[1], alt: true } : { taban: yol, alt: false }
}

/** İki adres kümesi ortak bir adres içeriyor mu? */
function kesisir(a, b) {
  if (a.taban === b.taban) return true
  if (a.alt && b.taban.startsWith(`${a.taban}/`)) return true
  if (b.alt && a.taban.startsWith(`${b.taban}/`)) return true
  return false
}

/**
 * Zincir/döngü avcısı: bir kuralın HEDEFİ başka (ya da aynı) kuralın KAYNAĞINA düşüyorsa o çifti döndürür.
 * Sorgu dizesi hedefte yok sayılır; `:path*` kuyruğu "ve altı" olarak kesişim sayılır; `/:lang(tr|en)`
 * kuralları iki dile açılır. Zincir yoksa `null`. Tek hop kuralı (A9) bu fonksiyonla ölçülür: sonuç
 * `null` değilse bir adres iki sıçramayla çözülür ya da sonsuza döner.
 * @param {(Yonlendirme | YenidenYazim)[]} kurallar
 * @returns {{ kaynak: Yonlendirme | YenidenYazim, hedef: Yonlendirme | YenidenYazim } | null}
 */
export function zincirVarMi(kurallar) {
  const acik = kurallar.flatMap(kuralAc)
  for (const a of acik) {
    const hedefKumesi = adresKumesi(a.destination)
    for (const b of acik) {
      if (kesisir(hedefKumesi, adresKumesi(b.source))) return { kaynak: a.orijinal, hedef: b.orijinal }
    }
  }
  return null
}
