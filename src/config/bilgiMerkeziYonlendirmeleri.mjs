/**
 * BİLGİ MERKEZİ ESKİ ADRESLERİ — kalıcı (308) yönlendirme listesinin TEK üreticisi (karar 92).
 *
 * NİÇİN .mjs: bu liste `next.config.mjs` içinden çağrılır ve o dosya TypeScript içe aktaramaz.
 * Aynı fonksiyonu testler de doğrudan çağırır; yani yayındaki kural ile test edilen kural aynı
 * koddur (kopya yok).
 *
 * KARAR 92 (Recep, 2026-09-24): rehber yazıları `/tr/bilgi-merkezi/<yazi>` ve
 * `/en/knowledge-hub/<article>` adresinde. `/destek/merkez` + `/destek/konular/*` (air-curtain
 * kopyası dahil 10 adres) kalıcı yönlendirmeyle taşınır; sss/iade/kargo/garanti `/destek`'te kalır.
 *
 * EN KURALI (rehber-yazisi-standard.md R3 + R6): `EN_YAYIN` kapalıyken `/en/knowledge-hub`
 * ÜRETİLMEZ; bugünkü EN adresleri o süre EN kategori/destek karşılığına gider. Bayrak açılınca
 * rota ve yönlendirme BİRLİKTE değişir — bu dosya bayrağı parametre olarak alır, iki yön de test
 * edilir (`src/__tests__/bilgiMerkezi/yonlendirmeler.test.ts`).
 *
 * TEK HOP: her hedef bugün doğrudan 200 veren bir adrestir (hedefin kendisi yönlendirme değil).
 * ⚠EN kategori hedefleri (`/en/category/<slug>`) REC-300 Faz 3-C adres şeması açılınca yeniden
 * ölçülmelidir: o gün kategori adresi değişirse bu satırlar iki hop olur. Kök kategori oldukları
 * için (üstleri yok) bugünkü plan §2'ye göre EN adresleri değişmiyor.
 *
 * ⚠ELLE HEDEF YAZILDI, ÇÜNKÜ: `adresUret`/`Routes` TypeScript'tir, buradan çağrılamaz. Hedeflerin
 * yazı listesiyle (src/data/bilgiMerkezi/yazilar.ts) ve `Routes.bilgiMerkezi` ile aynı kaldığını
 * test ölçer; ayrışırsa test kırmızı yanar.
 */

/** Bilgi Merkezi çatısının dile göre bölüm adı (karar 92). `Routes.bilgiMerkezi` ile aynı olmalı. */
export const BILGI_MERKEZI_BOLUMU = /** @type {const} */ ({ tr: 'bilgi-merkezi', en: 'knowledge-hub' })

/**
 * Eski konu slug'ı → yeni yazı slug'ı (dile göre) + EN kapalıyken EN karşılığı.
 * `air-curtain` ile `hava-perdesi` aynı metni taşıyordu (R1.3 ihlali) → ikisi tek yazıya gider.
 */
export const ESKI_KONULAR = /** @type {const} */ ({
  'hava-perdesi': { tr: 'hava-perdesi', en: 'air-curtain', enKapaliHedef: '/en/category/air-curtains' },
  'air-curtain': { tr: 'hava-perdesi', en: 'air-curtain', enKapaliHedef: '/en/category/air-curtains' },
  'jet-fan': {
    tr: 'otopark-jet-fan',
    en: 'car-park-jet-fan',
    // `jet-fans` kategorisi canlıda PASİF (2026-09-24 ölçüldü: is_active=false, aile 0) → kategori
    // 404 verirdi. Jet fan hesaplayıcısı EN'de canlı: konunun destek karşılığı o.
    enKapaliHedef: '/en/destek/hesaplayicilar/jet-fan',
  },
  hrv: { tr: 'isi-geri-kazanim', en: 'heat-recovery', enKapaliHedef: '/en/category/heat-recovery-vmc' },
})

/**
 * EN kapalıyken Bilgi Merkezi girişinin (liste ve çıplak `/destek/konular`) EN karşılığı:
 * Ürün Seçici — Bilgi Merkezi'nin EN'de canlı kalan tek teknik yüzeyi (dört hesaplayıcının kapısı).
 */
export const EN_KAPALI_LISTE_HEDEFI = '/en/urun-secici'

/**
 * `src/config/features.ts` metninden `EN_YAYIN` değerini okur. Metin beklenen biçimde değilse
 * ATAR: bayrak okunamadığında "kapalı" varsaymak, açık bayrakla yanlış yönlendirme üretirdi.
 * @param {string} kaynak
 * @returns {boolean}
 */
export function enYayinOku(kaynak) {
  const eslesmeler = [...kaynak.matchAll(/^export const EN_YAYIN = (true|false)\s*$/gm)]
  if (eslesmeler.length !== 1) {
    throw new Error(
      `bilgiMerkeziYonlendirmeleri: features.ts içinde tek bir "export const EN_YAYIN = true|false" satırı bekleniyordu, ${eslesmeler.length} bulundu`,
    )
  }
  return eslesmeler[0][1] === 'true'
}

/**
 * @typedef {{ source: string, destination: string, permanent: true }} Yonlendirme
 */

/**
 * Karar 92 yönlendirmeleri. Sıra önemli: özel kurallar önce, tümünü yakalayan en sonda.
 * @param {boolean} enYayin
 * @returns {Yonlendirme[]}
 */
export function bilgiMerkeziYonlendirmeleri(enYayin) {
  /** @type {Yonlendirme[]} */
  const liste = []
  const ekle = (source, destination) => liste.push({ source, destination, permanent: true })

  const trListe = `/tr/${BILGI_MERKEZI_BOLUMU.tr}`
  const enListe = enYayin ? `/en/${BILGI_MERKEZI_BOLUMU.en}` : EN_KAPALI_LISTE_HEDEFI

  // TR
  ekle('/tr/destek/merkez', trListe)
  for (const [eski, hedef] of Object.entries(ESKI_KONULAR)) {
    ekle(`/tr/destek/konular/${eski}`, `${trListe}/${hedef.tr}`)
  }
  ekle('/tr/destek/konular', trListe)
  // Eski rota `dynamicParams = false` idi: bilinmeyen konu zaten 404'tü. Yine de dışarıda
  // bilinmeyen bir eski bağlantı kalmışsa en yakın canlı adrese gitsin (hedefsiz adres 0).
  ekle('/tr/destek/konular/:eski*', trListe)

  // EN
  ekle('/en/destek/merkez', enListe)
  for (const [eski, hedef] of Object.entries(ESKI_KONULAR)) {
    ekle(`/en/destek/konular/${eski}`, enYayin ? `/en/${BILGI_MERKEZI_BOLUMU.en}/${hedef.en}` : hedef.enKapaliHedef)
  }
  ekle('/en/destek/konular', enListe)
  ekle('/en/destek/konular/:eski*', enListe)

  return liste
}
