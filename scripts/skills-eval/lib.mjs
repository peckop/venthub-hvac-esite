/**
 * SKILL YÖNLENDİRME SINAVI — SAF ÇEKİRDEK (ağ yok, dosya yazımı yok).
 *
 * NİÇİN AYRI MODÜL: koşucu ağa çıkar, bu dosya çıkmaz. Puanlama, eşik ve cevap çözümü
 * burada olduğu için testle ÖLÇÜLEBİLİR; ölçülemeyen puanlama, yeşil görünen ama bakmayan
 * kapı üretir (bu projede ölçülmüş kusur sınıfı: `skills-evaluator.py` sorguları SAYIYOR,
 * koşmuyor — REC-303'ün sebebi tam bu).
 *
 * ⭐ÜÇ SONUÇ, İKİSİ DEĞİL: GECTI · DUSTU · OLCEMEDI. "Ölçemedi" ile "ihlal" aynı kovaya
 * girerse iki farklı arıza tek sayıya çöker ve model cevabı bozulduğunda kapı "skill kötü"
 * der. Çıkış kodları da bunu izler: 0 geçti · 1 ihlal · 2 ölçemedi.
 */

/** Eşikler cetvelden gelir: iki yön de en az %90 doğru olmalı. */
export const ESIK = 0.9

/**
 * Modelin cevabını çözer. Beklenen biçim, her satırda `<sira>: <skill-adi|NONE>`.
 * Çözülemeyen satır SESSİZCE DOĞRU SAYILMAZ — `null` döner ve ölçemedi olarak sayılır.
 *
 * @param {string} metin modelin ham cevabı
 * @param {number} adet beklenen cevap sayısı
 * @returns {Array<string|null>} her sıra için skill adı, 'NONE', ya da null (çözülemedi)
 */
export function cevabiCoz(metin, adet) {
  const sonuc = new Array(adet).fill(null)
  if (typeof metin !== 'string') return sonuc
  for (const satir of metin.split(/\r?\n/)) {
    const m = /^\s*(\d+)\s*[:.\)]\s*([A-Za-z0-9._-]+)\s*$/.exec(satir)
    if (!m) continue
    const sira = Number(m[1]) - 1
    if (sira < 0 || sira >= adet) continue
    sonuc[sira] = m[2]
  }
  return sonuc
}

/**
 * Bir skill'in sınavını puanlar.
 *
 * @param {{ad: string, should_trigger: string[], should_not_trigger: string[]}} skill
 * @param {Array<string|null>} tetikCevaplari should_trigger sorgularının cevapları
 * @param {Array<string|null>} tetiklemezCevaplari should_not_trigger sorgularının cevapları
 */
export function puanla(skill, tetikCevaplari, tetiklemezCevaplari) {
  let dogru = 0
  let yanlis = 0
  let olcemedi = 0

  // should_trigger: cevap TAM bu skill olmalı.
  for (const c of tetikCevaplari) {
    if (c === null) olcemedi++
    else if (c === skill.ad) dogru++
    else yanlis++
  }
  const tetikDogru = dogru

  // should_not_trigger: cevap bu skill OLMAMALI — NONE da başka bir skill de doğrudur.
  let tetiklemezDogru = 0
  for (const c of tetiklemezCevaplari) {
    if (c === null) olcemedi++
    else if (c === skill.ad) yanlis++
    else tetiklemezDogru++
  }
  dogru += tetiklemezDogru

  const tetikToplam = tetikCevaplari.length
  const tetiklemezToplam = tetiklemezCevaplari.length
  const oran = (d, t) => (t === 0 ? 1 : d / t)

  const tetikOran = oran(tetikDogru, tetikToplam)
  const tetiklemezOran = oran(tetiklemezDogru, tetiklemezToplam)

  // ÖLÇEMEDİ ihlalden ÖNCE gelir: bozuk cevapla "skill düştü" demek yanlış suçlamadır.
  const durum = olcemedi > 0 ? 'OLCEMEDI' : tetikOran >= ESIK && tetiklemezOran >= ESIK ? 'GECTI' : 'DUSTU'

  return {
    ad: skill.ad,
    durum,
    tetik: { dogru: tetikDogru, toplam: tetikToplam, oran: Number(tetikOran.toFixed(3)) },
    tetiklemez: { dogru: tetiklemezDogru, toplam: tetiklemezToplam, oran: Number(tetiklemezOran.toFixed(3)) },
    olcemedi,
    yanlis,
    dogru,
  }
}

/** Tüm skill sonuçlarından filo özeti ve ÇIKIŞ KODU üretir. */
export function ozet(sonuclar) {
  const say = (d) => sonuclar.filter((s) => s.durum === d).length
  const gecti = say('GECTI')
  const dustu = say('DUSTU')
  const olcemedi = say('OLCEMEDI')
  // Sıra bilinçli: ölçemedi varsa önce o söylenir (2), yoksa ihlal (1), yoksa 0.
  const cikis = olcemedi > 0 ? 2 : dustu > 0 ? 1 : 0
  return { toplam: sonuclar.length, gecti, dustu, olcemedi, cikis }
}

/**
 * Sınav istemini kurar: yönlendirme kataloğu + numaralı sorgular.
 * Katalog ZORUNLU — model hangi skill'lerin var olduğunu bilmeden "hangisi devreye girmeli"
 * sorusunu cevaplayamaz; katalogsuz sınav skill'i değil modelin tahminini ölçer.
 */
export function istemKur(katalog, sorgular) {
  const katalogMetni = katalog.map((k) => `- ${k.ad}: ${k.aciklama}`).join('\n')
  const sorguMetni = sorgular.map((s, i) => `${i + 1}. ${s}`).join('\n')
  return (
    'Asagida bir projenin skill (yetenek) katalogu ve kullanici istekleri var.\n' +
    'Her istek icin HANGI skill devreye girmeli? Katalogda uygun skill yoksa NONE yaz.\n\n' +
    'KATALOG:\n' + katalogMetni + '\n\n' +
    'ISTEKLER:\n' + sorguMetni + '\n\n' +
    'CIKTI BICIMI: her satirda sadece "<sira>: <skill-adi>" ya da "<sira>: NONE".\n' +
    'Aciklama yazma, baska hicbir sey yazma.'
  )
}

/** Kaba jeton tahmini (ölçüm DEĞİL, tahmin): 4 karakter ~ 1 jeton. */
export function jetonTahmini(metin) {
  return Math.ceil(String(metin).length / 4)
}

/**
 * Maliyet TAHMİNİ. Fiyatlar çağıranın verdiği tabloya göre; varsayılan yok ki
 * "ölçtüm" ile "varsaydım" karışmasın.
 */
export function maliyetTahmini({ girisJetonu, cikisJetonu, girisUsdMilyon, cikisUsdMilyon }) {
  return Number(
    ((girisJetonu / 1_000_000) * girisUsdMilyon + (cikisJetonu / 1_000_000) * cikisUsdMilyon).toFixed(4),
  )
}
