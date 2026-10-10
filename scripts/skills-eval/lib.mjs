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

/**
 * SKILL.md frontmatter'ından `name` ve `description` çıkarır (yaml bağımlılığı olmadan).
 *
 * ÖLÇÜLEN KUSUR (prompt denetimi 2026-09-25): eski okuyucu yalnız `description:` satırının
 * KENDİSİNİ alıyordu. `.claude/skills` ağacındaki 38 skill'in 33'ünde açıklama alt satırlara
 * taşıyor, 8'i `>-` blok biçiminde; yönlendirme kataloğuna bunların ya ilk satırı ya da düz
 * ">-" metni gidiyordu. Sınav, modelin gerçekte gördüğü kataloğu değil kırpık bir kopyayı
 * ölçüyordu.
 *
 * Desteklenen YAML alt kümesi (skill dosyalarında görülen biçimler):
 *   - düz değer, alt satırlara girintiyle taşabilir (satırlar boşlukla birleşir)
 *   - tırnaklı değer ("..." / '...'), birden fazla satıra yayılabilir
 *   - blok skaler: `>` `>-` `>+` (katlanır) ve `|` `|-` `|+` (satır sonu korunur)
 * Değerin sonu: girintisiz ilk dolu satır (bir sonraki anahtar).
 *
 * @param {string} ham SKILL.md içeriği
 * @returns {{ad: string, aciklama: string} | null} frontmatter yoksa null
 */
export function frontmatterCoz(ham) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(ham)
  if (!m) return null
  const satirlar = m[1].split(/\r?\n/)

  const al = (anahtar) => {
    const i = satirlar.findIndex((s) => s.startsWith(anahtar + ':'))
    if (i < 0) return ''
    const bas = satirlar[i].slice(anahtar.length + 1).trim()
    const devam = []
    for (let j = i + 1; j < satirlar.length; j++) {
      const s = satirlar[j]
      if (s.trim() !== '' && !/^\s/.test(s)) break
      devam.push(s)
    }
    while (devam.length && devam[devam.length - 1].trim() === '') devam.pop()

    const blok = /^([>|])([+-]?)\s*(?:#.*)?$/.exec(bas)
    if (blok) {
      const girinti = Math.min(...devam.filter((s) => s.trim()).map((s) => /^\s*/.exec(s)[0].length))
      const icerik = devam.map((s) => s.slice(Number.isFinite(girinti) ? girinti : 0))
      if (blok[1] === '|') return icerik.join('\n').trim()
      // Katlanır: boş satır paragraf sonudur, diğer satırlar boşlukla birleşir.
      return icerik
        .join('\n')
        .split(/\n\s*\n/)
        .map((p) => p.split('\n').map((s) => s.trim()).join(' '))
        .join('\n')
        .trim()
    }

    const birlesik = [bas, ...devam.map((s) => s.trim())].filter(Boolean).join(' ')
    const t = /^(["'])([\s\S]*)\1$/.exec(birlesik)
    if (t) return t[1] === "'" ? t[2].replace(/''/g, "'") : t[2].replace(/\\"/g, '"')
    return birlesik
  }

  return { ad: al('name'), aciklama: al('description') }
}

/**
 * Başsız `claude -p` için SADE bayrak seti (skill yönlendirme sınavı).
 *
 * ÖLÇÜLEN KUSUR (2026-09-25): bayraksız `claude -p --model <m>` her çağrıda TAM Claude Code
 * oturumu açar: bizim CLAUDE.md'ler, kancalar, MCP sunucuları ve Claude Code'un KENDİ skill
 * listesi. Yani model sınav kataloğunun yanında gerçek `.claude/skills` listesini de görüyordu;
 * `.agent/skills` sınavında iki katalog yarışıyordu. Her çağrı makinede ayrı bir oturum olarak
 * da göründü (ListAgents'ta "vh-arac-1-…"), kancalar her çağrıda koştu ve 120 sn'de üç skill
 * zaman aşımına düştü. Aynı bağlam ~257k jetona çıkıp "Prompt is too long" da verebiliyor
 * (REC-345, ALTYAPI ölçümü 2026-09-22).
 * `--bare` KULLANILMAZ: OAuth'u kapatır, yalnız API anahtarı kabul eder.
 */
export const CLI_SADE_BAYRAKLAR = [
  '--tools', '',
  '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
  '--disable-slash-commands',
  '--setting-sources', '',
  '--system-prompt', 'Sen bir yonlendirme siniflandiricisisin. Yalniz istenen bicimde cevap ver.',
]
