/**
 * REHBER YAZISI DENETİMİ — ağsız çekirdek (rehber-yazisi-standard.md R5.1 3b + R4 desenleri + R8.1).
 *
 * NİÇİN: Karar 62 "uydurma atıf = kırmızı" diyor ve R5 doğrulamayı ajanlara veriyor. v0.1 çürütmesi
 * (2026-09-24, iki kol) doğrulayıcının göremediği sınıfları ölçtü: iddia tablosuna girmeyen cümle hiç
 * denetlenmiyordu; K2 not deseni JS'e birebir taşınınca `\mTODO\M` sessizce ölüyordu (ölçüldü: false).
 * Bu modül LLM'e bırakılmaması gereken, belirlenimci kısmı yapar: numara ↔ kaynak listesi eşleşmesi,
 * numarasız iddia cümlesi, vaat/fiyat/not/rakip desenleri, olumsuz ve mevzuat cümlelerinin iddia
 * tablosunda türüyle yer alması, R3 kalıbının zorunlu bölümleri, site içi bağlantının kimlikle yazılması.
 *
 * Ağa, DB'ye, diske ÇIKMAZ (saf fonksiyonlar). CI kapısı yalnız bu modülü çalıştırır (ALTYAPI şartı,
 * 2026-09-24). Ağlı alıntı doğrulaması `alinti-dogrula.mjs`'tedir.
 *
 * Girdi biçimi (taslak yayından önce depoya GİRMEZ — R4.8; dosyalar depo dışındadır):
 *   yazı: markdown. İsteğe bağlı `---` ön bilgi bloğu (`baslik:`, `meta_aciklama:`). Gövdede atıf `[1]`,
 *         `[1, 3]`, `[2–4]`. Son bölüm `## Kaynaklar` ve altında numaralı liste `1. …`.
 *   iddialar: [{ metin, kaynak: [no…], alinti, tur: 'sayi'|'olumsuz'|'mevzuat'|'genel' }]
 */

// ─── yardımcılar ───────────────────────────────────────────────────────────────
/** Türkçe harfleri de kelime sayan sınır: JS `\b` yalnız ASCII'yi tanır ("güç" içinde \b yanılır). */
const S = '(?<![\\p{L}\\p{N}])'
const E = '(?![\\p{L}\\p{N}])'
const kelime = (govde) => new RegExp(`${S}(?:${govde})${E}`, 'iu')

export const KAYNAKLAR_BASLIGI = /^##\s+Kaynaklar\s*$/im

/**
 * Ön bilgi + gövde + kaynak listesi. Kaynak bölümü `## Kaynaklar` başlığından bir sonraki `## `
 * başlığına kadardır. ⚠O bölümün numaralı madde OLMAYAN satırları ve sonraki bölümler GÖVDEDİR:
 * ilk sürüm başlıktan sonrasının tamamını liste sayıyordu ve oraya yazılan fiyat/not denetimden
 * kaçıyordu (kendi testi yakaladı, 2026-09-24).
 */
export function bolumle(md) {
  let metin = md.replace(/\r\n/g, '\n')
  const onBilgi = {}
  const ob = metin.match(/^---\n([\s\S]*?)\n---\n/)
  if (ob) {
    for (const satir of ob[1].split('\n')) {
      const m = satir.match(/^([a-z_]+):\s*(.*)$/i)
      if (m) onBilgi[m[1]] = m[2].trim()
    }
    metin = metin.slice(ob[0].length)
  }
  const k = metin.search(KAYNAKLAR_BASLIGI)
  const kaynaklar = new Map()
  if (k === -1) return { onBilgi, govde: metin, kaynaklar, kaynakBolumuVar: false }
  const sonrasi = metin.slice(k).replace(KAYNAKLAR_BASLIGI, '')
  const sonrakiBaslik = sonrasi.search(/^##\s/m)
  const bolum = sonrakiBaslik === -1 ? sonrasi : sonrasi.slice(0, sonrakiBaslik)
  const kalan = sonrakiBaslik === -1 ? '' : sonrasi.slice(sonrakiBaslik)
  const serbest = []
  for (const satir of bolum.split('\n')) {
    const m = satir.match(/^\s*(\d+)\.\s+(.+)$/)
    if (m) kaynaklar.set(Number(m[1]), m[2].trim())
    else if (satir.trim()) serbest.push(satir)
  }
  const govde = [metin.slice(0, k), serbest.join('\n'), kalan].filter(Boolean).join('\n\n')
  return { onBilgi, govde, kaynaklar, kaynakBolumuVar: true }
}

/** `[1]`, `[1, 3]`, `[2–4]` → [1], [1,3], [2,3,4]. */
export function atifNumaralari(metin) {
  const out = []
  for (const m of metin.matchAll(/\[(\d+(?:\s*[,–-]\s*\d+)*)\]/g)) {
    for (const parca of m[1].split(',')) {
      const ar = parca.split(/[–-]/).map((x) => Number(x.trim()))
      if (ar.length === 2) for (let i = ar[0]; i <= ar[1]; i++) out.push(i)
      else out.push(ar[0])
    }
  }
  return out
}

const KISALTMA = /(?:^|\s)(?:s|ör|vb|vs|bkz|yak|no|şek|tab|sn|dk|min|maks|max|yy|ss|çev|ed)\.$/i
/** Cümlelere böl: başlıklar ve liste maddeleri ayrı birim; "s. 12", "ör." ve ondalık ayraç bölmez. */
export function cumleler(govde) {
  const birimler = []
  for (const blok of govde.split(/\n{2,}/)) {
    for (const satir of blok.split('\n')) {
      const t = satir.trim()
      if (!t || /^#{1,6}\s/.test(t) || /^\|?\s*-{3,}/.test(t)) continue
      // Tablo satırı: her hücre ayrı iddia birimidir (hücreler de iddiadır — R5.1)
      if (/^\|.*\|$/.test(t)) {
        for (const h of t.split('|').map((x) => x.trim()).filter(Boolean)) birimler.push(h)
        continue
      }
      const parcalar = t.replace(/^([-*]|\d+\.)\s+/, '').split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ"“(0-9])/u)
      let tampon = ''
      for (const p of parcalar) {
        tampon = tampon ? `${tampon} ${p}` : p
        if (KISALTMA.test(tampon)) continue
        birimler.push(tampon)
        tampon = ''
      }
      if (tampon) birimler.push(tampon)
    }
  }
  return birimler
}

// ─── desenler ──────────────────────────────────────────────────────────────────
const BIRIM = '(?:m³\\/h|m3\\/h|m³\\/s|l\\/s|kPa|Pa|kW|W|kVA|V|Hz|A|dB\\(A\\)|dB|°C|K|rpm|d\\/dk|dev\\/dk|mm|cm|m|m²|m³|N|kg|%|bar|ppm|ACH|saat|yıl)'
/** Sayı + birim ya da yüzde: kaynak ister (R2.2). Yıl ("2026") ve sıra ("3. adım") tek başına sayılmaz. */
export const SAYI_BIRIM = new RegExp(`(?:%\\s?\\d)|(?:\\d[\\d.,]*\\s?(?:[–-]\\s?\\d[\\d.,]*\\s?)?${BIRIM}${E})`, 'u')
export const OLUMSUZ = kelime('içermez|içermiyor|gerekmez|gerektirmez|yoktur|değildir|olmaz|bulunmaz|etmez|yapmaz|sağlamaz|gerek yoktur')
export const MEVZUAT = kelime('zorunlu(?:dur|luğu|luk)?|yasak(?:tır)?|yönetmelik\\p{L}*|mevzuat\\p{L}*|kanun\\p{L}*|tebliğ\\p{L}*')
const VARSAYIM = kelime('varsay\\p{L}*|örnek varsayım|diyelim')

/** R4.2 garanti ve üstünlük vaadi. */
export const VAAT = kelime('en iyi(?:si)?|en kaliteli|%\\s?100|yüzde yüz|kesin çözüm|garanti(?:li|dir|eder)?|tartışmasız|mükemmel|kusursuz|bir numara')
/** R3 fiyat rakamı: para birimi + rakam, her iki sırayla. */
export const FIYAT = /(?:[₺€$]\s?\d)|(?:\d[\d.,]*\s?(?:₺|TL|€|EUR|USD|\$|avro|euro|dolar)(?![\p{L}]))|(?:(?:TL|EUR|USD)\s?\d)/iu
/**
 * R4.4 iç not — vitrin-metni-standard.md K2'nin JS karşılığı. PostgreSQL `\m…\M` burada ÇALIŞMAZ
 * (ölçüldü 2026-09-24): kelime sınırı Unicode lookaround ile yazıldı. Rehbere özgü meşru biçim:
 * `> **Not:**` gibi okuyucuya yönelik not blok alıntısı KALIR (K5 mantığı), bu yüzden `\>\s*\*` kolu
 * bilerek alınmadı; yıldız-parantez ve kaynak eksikliği beyanları alındı. K2'nin "doğrulanmalı",
 * "Bkz. yukarı", "kaynak başlığı" kolları da ALINMADI: teknik yazıda meşru okuyucu cümlesidir
 * ("montajdan sonra debi doğrulanmalı", "bkz. yukarıdaki tablo") — v0.1 çürütmesinde (Fable) bu
 * kolların meşru rehber cümlesinde yanlış kırmızı verdiği ölçüldü. Bu sınıfı R5'in LLM adımı görür.
 */
export const IC_NOT = new RegExp(
  [
    '\\*\\(', '\\(\\*', '\\[MANIFEST\\]', '\\[DB\\]', '\\[s\\.\\s*[0-9]',
    `${S}TODO${E}`, `${S}FIXME${E}`, `${S}TBD${E}`,
    '[Kk]aynakta yok', '[Kk]aynakta[^.]{0,80}YOK', '[Kk]atalo[^.]{0,80}YOKTUR',
    '([Kk]aynak|[Kk]atalo|[Ff]iyat listesi|[Ff]öy)[^.]{0,80}(vermez|vermiyor|yazmaz|belirtmez|anlatmaz)',
    'boş bırakıldı', 'tutarsızlık notu', 'teyit edilecek', 'editör notu', 'taslak notu',
  ].join('|'),
  'u',
)

// ─── kalıp (R3) ────────────────────────────────────────────────────────────────
/**
 * R3 kalıbının ZORUNLU bölümleri — başlık metni sabittir, eşleşme birebir başlıkla yapılır.
 * NİÇİN (2026-09-24): ilk yazı iki doğrulama turundan geçti, onaya sunuldu; kalıptaki "fiyatı
 * belirleyen etkenler" ve "teknik sorumluluk notu" yoktu ve bunu hiçbir kontrol görmedi — doğrulama
 * iddiayı sınıyordu, kalıbı değil. Farkı OPS, emsal yazıyla (DEA) elle kıyaslarken buldu.
 * Konuya uyan gövde bölümleri (nedir, montaj, bakım…) serbesttir; burada yalnız her yazıda
 * bulunması gerekenler var.
 */
export const ZORUNLU_BOLUMLER = ['Fiyatı belirleyen etkenler', 'Sık sorulan sorular', 'Kaynaklar', 'Teknik sorumluluk notu']
/** R3: sorumluluk notunun ilk cümlesi her yazıda aynıdır; ardından yazıya özgü uyarılar gelebilir. */
export const SORUMLULUK_ILK_CUMLE =
  'Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz.'
export const SSS_ARALIGI = [5, 8]

/** `## Başlık` → o başlıktan bir sonraki `## ` (ya da `# `) başlığına kadar olan metin. Yoksa null. */
export function bolumMetni(md, baslik) {
  const satirlar = md.replace(/\r\n/g, '\n').split('\n')
  const i = satirlar.findIndex((s) => s.trim() === `## ${baslik}`)
  if (i === -1) return null
  const son = satirlar.findIndex((s, j) => j > i && /^#{1,2}\s/.test(s))
  return satirlar.slice(i + 1, son === -1 ? undefined : son).join('\n')
}

/** R3 kalıp denetimi: zorunlu bölüm, tek H1, en az bir tablo, SSS sayısı, sorumluluk notunun sabit ilk cümlesi. */
export function kalipDenetle(md) {
  const kirmizi = []
  const ekle = (sinif, ayrinti) => kirmizi.push({ sinif, ayrinti })
  const metin = md.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '')
  const h1 = metin.split('\n').filter((s) => /^#\s/.test(s)).length
  if (h1 !== 1) ekle('H1-SAYISI', `${h1} adet \`# \` başlığı (tam 1 olmalı)`)
  for (const b of ZORUNLU_BOLUMLER) if (bolumMetni(metin, b) === null) ekle('ZORUNLU-BOLUM-YOK', `\`## ${b}\``)
  if (!/^\|.*\|\s*\n\|?\s*:?-{3,}/m.test(metin)) ekle('TABLO-YOK', 'en az bir tablo (kıyas ya da boyutlandırma) zorunlu')
  const sss = bolumMetni(metin, 'Sık sorulan sorular')
  if (sss !== null) {
    const n = sss.split('\n').filter((s) => /^###\s/.test(s)).length
    if (n < SSS_ARALIGI[0] || n > SSS_ARALIGI[1]) ekle('SSS-SAYISI', `${n} soru (${SSS_ARALIGI[0]}–${SSS_ARALIGI[1]} olmalı)`)
  }
  const not = bolumMetni(metin, 'Teknik sorumluluk notu')
  if (not !== null && !not.replace(/\s+/g, ' ').trim().startsWith(SORUMLULUK_ILK_CUMLE)) {
    ekle('SORUMLULUK-NOTU-METNI', `ilk cümle sabit metin olmalı: "${SORUMLULUK_ILK_CUMLE}"`)
  }
  return kirmizi
}

// ─── iç bağlantı (R3) ──────────────────────────────────────────────────────────
/**
 * Site içi bağlantı metne düz adresle yazılmaz, KİMLİKLE yazılır: `[metin](vh:<tür>/<anahtar>)`.
 * Sayfa üretilirken kimlik güncel adrese çözülür (URUN rota işi, Routes yardımcıları).
 * NİÇİN (2026-09-24, Recep: "URL değişirse sorun olmaz mı?"): adres ağacı tek yayında değişecek
 * (ürün/aile/kategori önekleri Türkçeleşiyor). Düz adres yazan yazı kırılmaz — eski adres 308 verir —
 * ama her tıklama bir yönlendirme durağından geçer ve yazı eski adresi kalıcı taşır.
 * Anahtarlar: model = SKU (adreste kalıcı), kategori = kanonik EN slug (CLAUDE.md kural 7),
 * aile = URUN rota işinin belirleyeceği kalıcı kimlik (aile adres metni değişiyor, karar 86).
 */
export const KIMLIK_TURLERI = ['model', 'aile', 'kategori', 'marka', 'hesaplayici', 'sayfa']
const SITE = /^https?:\/\/(?:www\.)?venthub\.com\.tr(?:[/?#]|$)/i

export function icBaglantiDenetle(govde) {
  const kirmizi = []
  for (const m of govde.matchAll(/\]\(\s*([^)\s]+)[^)]*\)/g)) {
    const h = m[1]
    if (/^vh:/i.test(h)) {
      const k = h.match(/^vh:([a-z]+)\/([a-z0-9][a-z0-9._-]*)$/)
      if (!k || !KIMLIK_TURLERI.includes(k[1])) kirmizi.push({ sinif: 'IC-KIMLIK-BICIMI', ayrinti: `${h} (beklenen vh:<${KIMLIK_TURLERI.join('|')}>/<anahtar>)` })
    } else if (SITE.test(h) || !/^(?:https?:|mailto:|tel:|#)/i.test(h)) {
      kirmizi.push({ sinif: 'IC-ADRES-DUZ', ayrinti: `${h} → site içi bağlantı kimlikle yazılır: [metin](vh:<tür>/<anahtar>)` })
    }
  }
  // Köşeli parantezsiz çıplak site adresi de düz adrestir
  for (const m of govde.matchAll(/(?<!\]\()\bhttps?:\/\/(?:www\.)?venthub\.com\.tr[^\s)>\]]*/gi)) {
    kirmizi.push({ sinif: 'IC-ADRES-DUZ', ayrinti: m[0] })
  }
  return kirmizi
}

// ─── denetimler ────────────────────────────────────────────────────────────────
/**
 * Tek girişli denetim. Dönen `kirmizi` boşsa yazı bu modülün gördüğü her sınıfta temizdir —
 * "temiz" = "bu desenlerde eşleşme yok" demektir; desenin görmediği sınıf R5'in LLM adımındadır.
 *
 * @typedef {{ metin: string, kaynak?: number[], alinti?: string, tur?: 'sayi'|'olumsuz'|'mevzuat'|'genel'|string }} Iddia
 * @param {string} md
 * @param {{ iddialar?: Iddia[], rakipler?: string[] }} [secenek]
 * @returns {{ kirmizi: { sinif: string, ayrinti: string }[], ozet: { cumle: number, atif: number, kaynak: number, olumsuz: number, mevzuat: number } }}
 */
export function denetle(md, { iddialar = [], rakipler = [] } = {}) {
  const kirmizi = []
  const { onBilgi, govde, kaynaklar, kaynakBolumuVar } = bolumle(md)
  const ekle = (sinif, ayrinti) => kirmizi.push({ sinif, ayrinti })

  // 1. Atıf ↔ kaynak listesi
  if (!kaynakBolumuVar) ekle('KAYNAK-BOLUMU-YOK', '`## Kaynaklar` başlığı bulunamadı')
  else if (kaynaklar.size === 0) ekle('KAYNAK-LISTESI-BOS', '`## Kaynaklar` altında numaralı madde yok')
  const kullanilan = new Set(atifNumaralari(govde))
  for (const n of kullanilan) if (!kaynaklar.has(n)) ekle('ATIF-LISTEDE-YOK', `[${n}] metinde var, kaynak listesinde yok`)
  for (const n of kaynaklar.keys()) if (!kullanilan.has(n)) ekle('KAYNAK-KULLANILMAMIS', `${n}. kaynak metinde hiç anılmıyor`)

  // 2. Numarasız iddia cümlesi (ön bilgideki başlık ve meta açıklama da müşteri yüzeyidir — K1)
  const birimler = [...cumleler(govde), ...['baslik', 'meta_aciklama'].filter((k) => onBilgi[k]).map((k) => onBilgi[k])]
  const olumsuzlar = []
  const mevzuatlar = []
  for (const c of birimler) {
    const atifli = /\[\d/.test(c)
    const sayili = SAYI_BIRIM.test(c) && !VARSAYIM.test(c)
    if (OLUMSUZ.test(c)) olumsuzlar.push(c)
    if (MEVZUAT.test(c)) mevzuatlar.push(c)
    if (!atifli && (sayili || OLUMSUZ.test(c) || MEVZUAT.test(c))) ekle('ATIFSIZ-IDDIA', c)
  }

  // 3. Desenler (gövde + ön bilgi; kaynak listesi hariç — yayıncı adında "garanti" geçebilir)
  const taranan = [govde, onBilgi.baslik || '', onBilgi.meta_aciklama || ''].join('\n')
  for (const [sinif, re] of [['VAAT', VAAT], ['FIYAT', FIYAT], ['IC-NOT', IC_NOT]]) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    for (const m of taranan.matchAll(g)) ekle(sinif, m[0])
  }
  for (const r of rakipler.filter(Boolean)) {
    if (kelime(r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(taranan)) ekle('RAKIP-ADI', r)
  }

  // 4. Olumsuz / mevzuat cümlesi iddia tablosunda türüyle ve alıntısıyla yer almalı (R4.5, R4.6)
  const norm = (s) => s.replace(/\[[\d,\s–-]+\]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr')
  const tablo = iddialar.map((i) => ({ ...i, n: norm(i.metin || '') }))
  const eslesen = (c, tur) => tablo.find((i) => i.tur === tur && i.n && (norm(c).includes(i.n) || i.n.includes(norm(c))) && (i.alinti || '').trim())
  for (const c of olumsuzlar) if (!eslesen(c, 'olumsuz')) ekle('OLUMSUZ-IDDIA-TABLODA-YOK', c)
  for (const c of mevzuatlar) if (!eslesen(c, 'mevzuat')) ekle('MEVZUAT-IDDIA-TABLODA-YOK', c)
  for (const i of iddialar) for (const n of i.kaynak || []) if (!kaynaklar.has(n)) ekle('IDDIA-KAYNAGI-LISTEDE-YOK', `${i.metin} → [${n}]`)

  // 5. R3 kalıbı (zorunlu bölümler; Kaynaklar yoksa zaten 1. adımda kırmızı — tekrar yazılmaz)
  for (const k of kalipDenetle(md)) if (!(k.sinif === 'ZORUNLU-BOLUM-YOK' && k.ayrinti === '`## Kaynaklar`')) kirmizi.push(k)

  // 6. İç bağlantı kimlikle (R3; ağlı yarısı `ic-baglanti-denetle.mjs`)
  kirmizi.push(...icBaglantiDenetle(taranan))

  return { kirmizi, ozet: { cumle: birimler.length, atif: kullanilan.size, kaynak: kaynaklar.size, olumsuz: olumsuzlar.length, mevzuat: mevzuatlar.length } }
}
