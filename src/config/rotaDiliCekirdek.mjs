/**
 * ROTA DİLİ ÇEKİRDEĞİ — SAF, DİSKSİZ, ORTAMSIZ (OPS-52 PR-C0).
 *
 * NİÇİN AYRI DOSYA: `rotaDili.mjs` tabloyu `node:fs` ile diskten okur; bu yüzden Edge'de çalışan
 * `src/middleware.ts` ve tarayıcıya giden `src/utils/routes.ts` onu içe aktaramaz. Tablo mantığı burada,
 * hiçbir şeyi içe aktarmadan durur; tablo HER ZAMAN PARAMETREDİR (çekirdek tabloyu bilmez, varsayılanı yok).
 * `rotaDili.mjs` (next.config, node) tabloyu diskten yükleyen ince kabuktur; `src/lib/adres/rotaDiliTablo.ts`
 * (middleware/istemci) aynı tabloyu JSON içe aktarımıyla verir. İkisi de aynı `rotaDili.veri.json`'dan okur.
 *
 * ⛔EDGE GÜVENLİĞİ: bu dosyada `node:fs`, `node:path`, `process`, `require` YOKTUR ve olmayacaktır.
 * Kapı: src/lib/adres/__tests__/rotaDiliCekirdek.test.ts (kaynak taraması). Gerekçe: CLAUDE.md kural 12
 * (middleware'de DB/disk yok) ve Edge çalışma zamanının Node API'si olmaması.
 *
 * Anahtar, tablo ve kararlar için asıl açıklama: docs/standards/rota-dili-standard.md, rotaDili.mjs başlığı.
 */

/** Desteklenen diller; adres dilli kurallarda ikisi de üretilir. */
export const DILLER = /** @type {const} */ (['tr', 'en'])

/** Karar 270: Aşama 2 önekleri. Bu adres ağaçlarına rota dili uygulanmaz. */
export const ASAMA_2_ONEKLERI = /** @type {const} */ (['account', 'cart', 'checkout', 'auth', 'payment-success'])

/**
 * Middleware'in dil önekini hiç eklemediği/dokunmadığı ağaçlar (`middleware.ts` özel yollar). Dilsiz kol bunlara
 * yönlendirme kurmasın diye tabloya girmeleri doğrulayıcıda hatadır (PR-C2).
 */
export const DOKUNULMAZ_ONEKLER = /** @type {const} */ (['admin', 'api', '_next'])

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
      if (/** @type {readonly string[]} */ (DOKUNULMAZ_ONEKLER).includes(ilkParca)) {
        throw hata(`${ad}: "${alan}" middleware'in dokunmadığı bir önekle başlıyor ("${ilkParca}")`)
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

/** `altYollar` satırında kaynak/hedefe eklenen kuyruk. */
const kuyruk = (/** @type {RotaDiliSatiri} */ satir) => (satir.altYollar ? '/:path*' : '')

/**
 * Eski adres → yeni adres, kalıcı (308), tek hop. Bir dilde yeni yol klasörden FARKLIYSA kural üretilir;
 * aynıysa o dilde değişiklik yoktur, kural da yoktur.
 * @param {boolean} acik anahtar (`adresDiliOku` çıktısı); false → boş liste
 * @param {RotaDiliSatiri[]} tablo
 * @returns {Yonlendirme[]}
 */
export function rotaDiliYonlendirmeleri(acik, tablo) {
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
 * @param {RotaDiliSatiri[]} tablo
 * @returns {YenidenYazim[]}
 */
export function rotaDiliYenidenYazimlari(acik, tablo) {
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
 * `tablo` çağıran tarafından doğrulanmış varsayılır; istek başına yeniden doğrulanmaz.
 * @param {string} yol dil öneksiz yol (sorgu dizesiz), ör. `/about`
 * @param {RotaDiliSatiri[]} tablo
 * @param {boolean} [acik] anahtar; varsayılan kapalı
 * @returns {{ satirId: string, tr: string, en: string } | null}
 */
export function rotaDiliEsle(yol, tablo, acik = false) {
  if (!acik) return null
  if (typeof yol !== 'string' || !yol.startsWith('/')) return null
  const temiz = yol.length > 1 ? sondakiEgikCizgileriKirp(yol) : yol
  const bulunan = satirBul(temiz, tablo, 'klasor')
  if (bulunan === null) return null
  const { satir, kalan } = bulunan
  return { satirId: satir.id, tr: `/tr/${satir.tr}${kalan}`, en: `/en/${satir.en}${kalan}` }
}

/**
 * Dilsiz yolu tabloda `alan` (klasor | tr | en) üzerinden arar: tam eşleşme ya da (altYollar açıksa)
 * `alan/` ile başlayan alt yol. Birden çok satır uyarsa EN UZUN `alan` değeri kazanır.
 * @param {string} yol baştaki `/` var, sondaki `/` yok, sorgu/parça yok
 * @param {RotaDiliSatiri[]} tablo
 * @param {'klasor' | 'tr' | 'en'} alan
 * @returns {{ satir: RotaDiliSatiri, kalan: string } | null} `kalan`: eşleşen önekten sonra kalan yol (`''` ya da `/alt`)
 */
function satirBul(yol, tablo, alan) {
  /** @type {{ satir: RotaDiliSatiri, kalan: string } | null} */
  let enIyi = null
  for (const satir of tablo) {
    const taban = `/${satir[alan]}`
    let kalan = null
    if (yol === taban) kalan = ''
    else if (satir.altYollar && yol.startsWith(`${taban}/`)) kalan = yol.slice(taban.length)
    if (kalan === null) continue
    if (enIyi === null || satir[alan].length > enIyi.satir[alan].length) enIyi = { satir, kalan }
  }
  return enIyi
}

/**
 * URL'i yol / (sorgu + parça) olarak böler; sondaki `/`yi ayırır. Sorgu ve parça AYNEN `ek`te taşınır.
 * @param {string} url
 * @returns {{ yol: string, son: string, ek: string }}
 */
function urlBol(url) {
  const konum = url.search(/[?#]/)
  const yolKismi = konum === -1 ? url : url.slice(0, konum)
  const ek = konum === -1 ? '' : url.slice(konum)
  const temiz = yolKismi.length > 1 ? sondakiEgikCizgileriKirp(yolKismi) : yolKismi
  const son = yolKismi.length > 1 && yolKismi.endsWith('/') ? '/' : ''
  return { yol: temiz, son, ek }
}

/**
 * Sondaki tüm `/` karakterlerini kırpar. `replace(/\/+$/, '')` YERİNE doğrusal döngü: o desen, çok sayıda
 * ardışık `/` ve ardından başka karakter gelen istek yollarında ikinci dereceden yavaşlar (16.000 `/` ≈ 150 ms,
 * 32.000 ≈ 600 ms CPU; middleware her istekte çağırır). Girdi kullanıcıdan gelir, bu yüzden desen kullanılmaz.
 * @param {string} metin
 * @returns {string}
 */
function sondakiEgikCizgileriKirp(metin) {
  let son = metin.length
  while (son > 0 && metin.charCodeAt(son - 1) === 47) son--
  return metin.slice(0, son)
}

/**
 * Dilsiz KLASÖR yolunu verilen dildeki görünen yola çevirir (iç bağlantı üretimi, `localizedHref` için).
 * `url` sorgu (`?…`) ve parça (`#…`) içerebilir; yol kısmı çevrilir, sorgu/parça AYNEN sona eklenir, yoldaki
 * sondaki `/` korunur. Anahtar kapalıysa, yol bir satırın `klasor`'üyle (altYollar'da `klasor/` önekiyle)
 * eşleşmiyorsa, kök `/` ya da boş ya da `/` ile başlamayan girdi ise `url` AYNEN döner.
 * @param {string} url dilsiz klasör yolu, ör. `/about`, `/destek/sss?x=1#a`
 * @param {'tr' | 'en'} dil
 * @param {RotaDiliSatiri[]} tablo
 * @param {boolean} acik
 * @returns {string}
 */
export function rotaDiliYolu(url, dil, tablo, acik) {
  if (!acik || !DILLER.includes(dil) || typeof url !== 'string' || !url.startsWith('/')) return url
  const { yol, son, ek } = urlBol(url)
  if (yol === '/' || yol === '') return url
  const bulunan = satirBul(yol, tablo, 'klasor')
  if (bulunan === null) return url
  return `/${bulunan.satir[dil]}${bulunan.kalan}${son}${ek}`
}

/**
 * Dil değiştirirken: `eskiDil`'de GÖRÜNEN dilsiz yolu `yeniDil`'deki görünen yola çevirir. `yol` dil
 * öneksiz ama o dilin görünen adresidir (`/iletisim` TR'de, `/contact` EN'de). Eşleşme `satir[eskiDil]`
 * üzerindendir: açıkken TR'de `/about` görünen yol DEĞİLDİR (görünen `hakkimizda`), eşleşmez ve aynen
 * döner. Sorgu/parça ve sondaki `/` korunur; anahtar kapalıysa ya da eşleşme yoksa `yol` AYNEN döner.
 * @param {string} yol dil öneksiz, `eskiDil`'de görünen yol
 * @param {'tr' | 'en'} eskiDil
 * @param {'tr' | 'en'} yeniDil
 * @param {RotaDiliSatiri[]} tablo
 * @param {boolean} acik
 * @returns {string}
 */
export function rotaDiliCevir(yol, eskiDil, yeniDil, tablo, acik) {
  if (!acik || !DILLER.includes(eskiDil) || !DILLER.includes(yeniDil) || typeof yol !== 'string' || !yol.startsWith('/')) return yol
  const parcalar = urlBol(yol)
  if (parcalar.yol === '/' || parcalar.yol === '') return yol
  const bulunan = satirBul(parcalar.yol, tablo, eskiDil)
  if (bulunan === null) return yol
  return `/${bulunan.satir[yeniDil]}${bulunan.kalan}${parcalar.son}${parcalar.ek}`
}

/**
 * Yönlendirme hedefinin dilsiz kalan kısmını (`/urun-secici`, `/destek/:path*`) `dil`'de GÖRÜNEN yola çevirir.
 * `:ad*` kuyruğu yalnız `altYollar` satırında anlamlıdır (kuyruk bu satırın alt yollarını da kapsar); değilse
 * hedef satırın TAMAMINI kapsamadığı için çevrilmez (aynen döner). Eşleşme yoksa aynen döner.
 * @param {string} kalan dil önekinden sonraki kısım (`''` ya da `/…`), sorgu/parça yok, sondaki `/` yok
 * @param {'tr' | 'en'} dil
 * @param {RotaDiliSatiri[]} tablo
 * @returns {string}
 */
function hedefKalaniniCevir(kalan, dil, tablo) {
  if (kalan === '' || kalan === '/') return kalan
  const kuyrukKonumu = kalan.search(/\/:[A-Za-z]+\*$/)
  const taban = kuyrukKonumu === -1 ? kalan : kalan.slice(0, kuyrukKonumu)
  const kuyrukBelirteci = kuyrukKonumu === -1 ? '' : kalan.slice(kuyrukKonumu)
  const bulunan = satirBul(taban, tablo, 'klasor')
  if (bulunan === null) return kalan
  if (kuyrukBelirteci !== '' && !bulunan.satir.altYollar) return kalan
  return `/${bulunan.satir[dil]}${bulunan.kalan}${kuyrukBelirteci}`
}

/**
 * MEVCUT yönlendirme kurallarının HEDEFLERİNİ rota dili tablosuyla yeniler (R4: "mevcut kuralların hedefleri
 * tabloyla yeniden yazılır"). Neden: `/destek/hesaplayicilar → /:lang/urun-secici` gibi eski kurallar hedef olarak
 * ESKİ klasör adresini gösterir; tablo `urun-secici`yi `secici`ye çevirince adres iki sıçramayla çözülürdü.
 *
 *  · `acik` false → girdi dizisi AYNEN (aynı referans) döner: anahtar kapalıyken sıfır fark.
 *  · hedef `/:lang/…` ise iki dilin görünen yolu ayrı hesaplanır: aynıysa tek kural (`/:lang/…` korunur),
 *    farklıysa kaynak `/:lang(tr|en)` öneki `/tr` ve `/en` olarak İKİ kurala bölünür (tr önce). Bölünemeyen kaynak
 *    (`/:lang(tr|en)` ile başlamayan) ATAR: sessizce yanlış hedefte bırakılmaz.
 *  · hedef `/tr/…` ya da `/en/…` ise yalnız o dilin görünen yolu uygulanır.
 *  · dilsiz hedef (`/category/fans/:path*`), tablodaki klasörle eşleşmeyen hedef: kural nesnesi DEĞİŞMEZ
 *    (aynı referans). Sorgu dizesi ve parça hedefte AYNEN kalır; sondaki `/` korunur.
 *  · girdiyi değiştirmez, sıra deterministiktir, idempotenttir (yenilenmiş çıktı yeniden yenilenince aynı kalır).
 * @template {{ source: string, destination: string }} K
 * @param {K[]} kurallar
 * @param {boolean} acik anahtar
 * @param {RotaDiliSatiri[]} tablo
 * @returns {K[]}
 */
export function rotaDiliHedefleriniYenile(kurallar, acik, tablo) {
  if (!acik) return kurallar
  const dilKalibi = '/:lang(tr|en)'
  /** @type {K[]} */
  const sonuc = []
  for (const kural of kurallar) {
    const { yol, son, ek } = urlBol(kural.destination)
    const dilBelirteci = yol.split('/')[1]
    if (dilBelirteci !== ':lang' && dilBelirteci !== 'tr' && dilBelirteci !== 'en') {
      sonuc.push(kural)
      continue
    }
    const kalan = yol.slice(dilBelirteci.length + 1)
    const yaz = (/** @type {string} */ dil, /** @type {string} */ yeniKalan) => `/${dil}${yeniKalan}${son}${ek}`
    if (dilBelirteci === 'tr' || dilBelirteci === 'en') {
      const yeni = hedefKalaniniCevir(kalan, dilBelirteci, tablo)
      sonuc.push(yeni === kalan ? kural : { ...kural, destination: yaz(dilBelirteci, yeni) })
      continue
    }
    const trKalan = hedefKalaniniCevir(kalan, 'tr', tablo)
    const enKalan = hedefKalaniniCevir(kalan, 'en', tablo)
    if (trKalan === kalan && enKalan === kalan) {
      sonuc.push(kural)
    } else if (trKalan === enKalan) {
      sonuc.push({ ...kural, destination: yaz(':lang', trKalan) })
    } else {
      if (!kural.source.startsWith(dilKalibi)) {
        throw hata(`hedef yenileme: "${kural.source}" kuralının hedefi dile göre ayrışıyor ama kaynak "${dilKalibi}" ile başlamıyor, bölünemez`)
      }
      for (const [dil, dilKalani] of /** @type {const} */ ([['tr', trKalan], ['en', enKalan]])) {
        sonuc.push({ ...kural, source: `/${dil}${kural.source.slice(dilKalibi.length)}`, destination: yaz(dil, dilKalani) })
      }
    }
  }
  return sonuc
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
