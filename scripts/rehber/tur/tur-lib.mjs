/**
 * REHBER DOĞRULAMA TURU BETİKLERİ — saf yardımcılar (rehber-yazisi-standard.md R5.1.2, OPS-255).
 *
 * NİÇİN: BLG-54/55 ölçümünde 20 turun 14'ünde bulgu sayısı kayıt olmadığı için ölçülemedi; tuzaklı kopya,
 * yama ve sürüm sha'ları her yazıda elle tek kullanımlık betiklerle üretiliyordu (v10-uygula.py, tuzak10-uret.py…).
 * Bu dosya o betiklerin ortak, sınanmış hâlidir. Ağsız, deterministiktir.
 *
 * ⚠KAPSAM SINIRI: bu takım YARGI vermez. Doğrulayıcı, çürütücü ve hüküm (engelleyici mi, küçük mü) elle kalır;
 * betik yalnız (a) iddia tablosu iskeleti, (b) yama ve sha, (c) değişen cümleler, (d) aynı-sayı ve kapsam
 * sözcüğü denetimi, (e) tuzaklı/temiz kopya, (f) tur kaydı dosyasını üretir. "Betik temiz" demek
 * "bu desenlerde eşleşme yok" demektir (rehber-denetim.mjs ile aynı sınır).
 */
import { createHash } from 'node:crypto'

import { bolumle, bolumMetni, cumleler, atifNumaralari, kisaKatmanAyir, SAYI_BIRIM, OLUMSUZ, MEVZUAT } from '../rehber-denetim.mjs'

const S = '(?<![\\p{L}\\p{N}])'
const E = '(?![\\p{L}\\p{N}])'

/**
 * Kapsam ve çoğulluk sözcükleri (R5.1.2 önlem 2): bu sözcüğü taşıyan cümle iddia tablosunda kaynak ve alıntıyla eşlenmelidir.
 * Kök listesi dardır (yalancı alarm yerine sessizlik tercih edilmez; sonuç UYARI'dır, kırmızı değil — aday K6).
 */
export const KAPSAM_SOZCUKLERI = new RegExp(
  `${S}(?:yalnız(?:ca)?|hiç(?:bir)?|iki|üç|tüm|bütün|hep|her|eski|yeni|aynı|ilk|tek|hepsi|tamamı|daima|asla|hiçbiri)${E}`,
  'iu',
)

/** Atıf işaretlerini ve çoklu boşluğu atıp küçük harfe çevirir (iddia eşlemesi için, rehber-denetim.mjs `norm` ile aynı). */
export const normalize = (s) => String(s).replace(/\[[\d,\s–-]+\]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr')

/** Metnin SHA-256'sının ilk 12 hanesi (CRLF → LF; önizleme ve kart notundaki sha ile aynı kural). */
export function sha12(metin) {
  return createHash('sha256').update(String(metin).replace(/\r\n/g, '\n'), 'utf8').digest('hex').slice(0, 12)
}

/** Cümlenin iddia türü: olumsuz > mevzuat > sayı > genel (denetle ile aynı desenler). */
function iddiaTuru(c) {
  if (OLUMSUZ.test(c)) return 'olumsuz'
  if (MEVZUAT.test(c)) return 'mevzuat'
  if (SAYI_BIRIM.test(c)) return 'sayi'
  return 'genel'
}

/**
 * (a) İDDİA İSKELETİ. Gövdedeki atıflı ya da iddia desenli (sayı, olumsuz, mevzuat, kapsam sözcüğü) her cümle için
 * satır üretir; mevcut tabloda aynı normalize metin varsa o satır KORUNUR (alıntı, kaynak elle doldurulmuştur).
 * Dönüş: { iddialar (birleşik), yeni (alıntısız boş satırlar), eslenen, kapsamAciklari }.
 *   kapsamAciklari: kapsam sözcüğü taşıyan ama tabloda alıntılı satırı OLMAYAN cümleler (önlem 2, aday K6, UYARI).
 */
export function iddiaIskeleti(md, mevcut = []) {
  const { govde } = bolumle(md)
  const tablo = new Map(mevcut.map((i) => [normalize(i.metin || ''), i]))
  const iddialar = []
  const yeni = []
  const kapsamAciklari = []
  let eslenen = 0
  const goruldu = new Set()
  for (const c of cumleler(govde)) {
    const kapsam = c.match(KAPSAM_SOZCUKLERI)
    const atifli = /\[\d/.test(c)
    const desenli = SAYI_BIRIM.test(c) || OLUMSUZ.test(c) || MEVZUAT.test(c)
    if (!atifli && !desenli && !kapsam) continue
    const n = normalize(c)
    if (!n || goruldu.has(n)) continue
    goruldu.add(n)
    const var_ = tablo.get(n)
    if (var_) {
      eslenen++
      iddialar.push(var_)
      if (kapsam && !(var_.alinti || '').trim()) kapsamAciklari.push({ cumle: c, sozcuk: kapsam[0] })
      continue
    }
    const satir = { metin: c.replace(/\s+/g, ' ').trim(), kaynak: [...new Set(atifNumaralari(c))], tur: iddiaTuru(c), alinti: '' }
    yeni.push(satir)
    iddialar.push(satir)
    if (kapsam) kapsamAciklari.push({ cumle: c, sozcuk: kapsam[0] })
  }
  return { iddialar, yeni, eslenen, kapsamAciklari }
}

/**
 * (b) YAMA. [{ eski, yeni, adet? }] listesini sırayla uygular; her `eski` tam `adet` (varsayılan 1) kez bulunmazsa FIRLATIR
 * (sessiz kısmi yama yok: tek karakter değişirse sha değişir, durum taslağa düşer — R5.1 adım 5).
 */
export function yamaUygula(metin, yamalar) {
  let t = metin
  for (const [i, y] of yamalar.entries()) {
    if (typeof y.eski !== 'string' || typeof y.yeni !== 'string' || y.eski === '') {
      throw new Error(`yama #${i + 1}: eski/yeni metin olmalı`)
    }
    const adet = y.adet ?? 1
    const bulunan = t.split(y.eski).length - 1
    if (bulunan !== adet) throw new Error(`yama #${i + 1}: "${y.eski.slice(0, 60)}" ${bulunan} kez bulundu (beklenen ${adet})`)
    t = t.split(y.eski).join(y.yeni)
  }
  return t
}

/**
 * (c) DEĞİŞEN CÜMLELER (R5.1.2 madde 2: yeni iddia eklemeyen değişiklikte yalnız değişen cümleler kontrol edilir).
 * Dönüş: { eklenen: sonrakide olup öncekinde olmayan, silinen: öncekinde olup sonrakinde olmayan, oncekiSha, sonrakiSha }.
 * Gövde + başlıklar + kaynak satırları karşılaştırılır (yalnız gövde değil: kaynak adresi değişikliği de sha'yı değiştirir).
 */
export function degisenCumleler(onceki, sonraki) {
  const birimler = (md) => {
    const { govde, kaynaklar } = bolumle(md)
    const basliklar = md.replace(/\r\n/g, '\n').split('\n').filter((s) => /^#{1,6}\s/.test(s)).map((s) => s.trim())
    return [...basliklar, ...cumleler(govde), ...[...kaynaklar.entries()].map(([n, s]) => `${n}. ${s}`)]
  }
  const a = birimler(onceki)
  const b = birimler(sonraki)
  const sa = new Set(a.map(normalize))
  const sb = new Set(b.map(normalize))
  return {
    eklenen: b.filter((x) => !sa.has(normalize(x))),
    silinen: a.filter((x) => !sb.has(normalize(x))),
    oncekiSha: sha12(onceki),
    sonrakiSha: sha12(sonraki),
  }
}

/**
 * (d1) AYNI SAYI HER YERDE AYNI (R5.1.2 önlem 3). Kısa katman maddelerindeki ve SSS cevaplarındaki her sayı+birim ifadesi,
 * kısa katman ve SSS DIŞINDAKİ gövdede (ana bölümler, tablolar) aynen geçmelidir; geçmeyen satır UYARI üretir
 * (anlam eşlemesi yapılmaz: aynı sayı başka bağlamda geçebilir, bu yüzden kırmızı değil).
 * Ayrıca gövdede aynı birimle yazılmış, aralarındaki yazım farkı yalnız ondalık ayraç/boşluk olan değerler (ör. "2,8 CFM/W" ↔ "2.8 CFM/W") işaretlenir.
 */
export function sayiTutarliligi(md) {
  const { govde } = bolumle(md)
  const sayilar = (t) => [...String(t).matchAll(new RegExp(SAYI_BIRIM.source, 'gu'))].map((m) => m[0].replace(/\s+/g, ' ').trim())
  const katman = kisaKatmanAyir(md)
  const kisaMetin = katman ? `${katman.cevap}\n${katman.maddeler.join('\n')}` : ''
  const sss = bolumMetni(md, 'Sık sorulan sorular') || ''
  let ana = govde
  // Kısa katman gövdede bitişik değildir (araya `Kısaca:` satırı girer): cevap ve her madde ayrı ayrı çıkarılır.
  const cikarilacak = [...(katman ? [katman.cevap, ...katman.maddeler.map((m) => m.trim())] : []), sss]
  for (const parca of cikarilacak) if (parca && parca.trim()) ana = ana.split(parca.trim()).join('')
  const anaSayilar = new Set(sayilar(ana))
  const uyari = []
  for (const [yer, metin] of [['kısa katman', kisaMetin], ['SSS', sss]]) {
    for (const s of new Set(sayilar(metin))) {
      if (!anaSayilar.has(s)) uyari.push({ sinif: 'SAYI-GOVDEDE-YOK', ayrinti: `${yer}: "${s}" ana gövdede ve tablolarda geçmiyor` })
    }
  }
  // Yazım farkı: ondalık virgül/nokta ve boşluk dışında aynı olan değerler
  const yazim = new Map()
  for (const s of new Set(sayilar(govde))) {
    const anahtar = s.replace(/[.,]/g, '.').replace(/\s/g, '')
    yazim.set(anahtar, [...(yazim.get(anahtar) || []), s])
  }
  for (const grup of yazim.values()) {
    if (grup.length > 1) uyari.push({ sinif: 'SAYI-YAZIM-FARKI', ayrinti: `aynı değer farklı yazılmış: ${grup.map((x) => `"${x}"`).join(' / ')}` })
  }
  return uyari
}

/**
 * (e) TUZAKLI/TEMİZ KOPYA. liste: [{ dogru, yanlis }]. `dogru` metinde en az bir kez geçmeli (yoksa FIRLATIR: sessiz atlanan tuzak,
 * "9/9 yakalandı" sayısını yanıltır). Dönüş: { temiz, tuzakli, tuzakSayisi, temizSha, tuzakliSha }.
 * Tuzaklı kopya her çifte İLK geçişi değil TÜM geçişleri yanlışlaştırır.
 */
export function tuzakliKopya(metin, liste) {
  let t = metin
  for (const [i, c] of liste.entries()) {
    if (!c.dogru || !c.yanlis || c.dogru === c.yanlis) throw new Error(`tuzak #${i + 1}: dogru/yanlis farklı ve dolu olmalı`)
    if (!t.includes(c.dogru)) throw new Error(`tuzak #${i + 1}: "${c.dogru.slice(0, 60)}" metinde yok`)
    t = t.split(c.dogru).join(c.yanlis)
  }
  return { temiz: metin, tuzakli: t, tuzakSayisi: liste.length, temizSha: sha12(metin), tuzakliSha: sha12(t) }
}

/**
 * (f) TUR KAYDI (R5.1.2 önlem 5). Girdi:
 *   { tur, surum, sha?, temiz: { engelleyici, kucuk }, tuzakli: { konan, yakalanan }, bulgular: [{ ad, sinif, tetik, engelleyici? }], not? }
 * sinif ∈ yazimdan | dogrulayici-titizligi | yapi-degisikligi | kaynak-paketi.
 * Eksik alan FIRLATIR: "veri yok" kaydı üretmek önlemin amacına aykırıdır.
 */
export const BULGU_SINIFLARI = ['yazimdan', 'dogrulayici-titizligi', 'yapi-degisikligi', 'kaynak-paketi']

export function turKaydiMetni(g) {
  const eksik = []
  for (const k of ['tur', 'surum']) if (g[k] === undefined || g[k] === '') eksik.push(k)
  if (!g.temiz || !Number.isInteger(g.temiz.engelleyici) || !Number.isInteger(g.temiz.kucuk)) eksik.push('temiz.engelleyici/kucuk')
  if (!g.tuzakli || !Number.isInteger(g.tuzakli.konan) || !Number.isInteger(g.tuzakli.yakalanan)) eksik.push('tuzakli.konan/yakalanan')
  if (!Array.isArray(g.bulgular)) eksik.push('bulgular')
  if (eksik.length) throw new Error(`tur kaydı eksik alan: ${eksik.join(', ')}`)
  for (const b of g.bulgular) {
    if (b.engelleyici && !BULGU_SINIFLARI.includes(b.sinif)) throw new Error(`bulgu "${b.ad}": sinif ${BULGU_SINIFLARI.join(' | ')} olmalı`)
    if (b.engelleyici && !b.tetik) throw new Error(`bulgu "${b.ad}": engelleyici bulguda tetik (hangi önlem/kapı yakalardı) yazılmalı`)
  }
  const engel = g.bulgular.filter((b) => b.engelleyici)
  const kucuk = g.bulgular.filter((b) => !b.engelleyici)
  const satirlar = [
    `# Tur ${g.tur} bulguları`,
    '',
    `- Okunan taslak: ${g.surum}${g.sha ? ` (sha ${g.sha})` : ''}`,
    `- Temiz kol: engelleyici ${g.temiz.engelleyici}, küçük ${g.temiz.kucuk}`,
    `- Tuzaklı kol: konan ${g.tuzakli.konan}, yakalanan ${g.tuzakli.yakalanan}${g.tuzakli.konan === g.tuzakli.yakalanan ? ' (tam)' : ' (EKSİK: kapı yetersiz, bkz. R5.3)'}`,
    `- Durma koşulu (R5.1.2 madde 1): ${g.temiz.engelleyici === 0 && g.tuzakli.konan === g.tuzakli.yakalanan ? 'SAĞLANDI (engelleyici 0, tuzaklı tam)' : 'sağlanmadı'}`,
    '',
    '## Engelleyici bulgular',
    ...(engel.length ? engel.map((b) => `- ${b.ad} | sınıf: ${b.sinif} | tetik: ${b.tetik}`) : ['- yok']),
    '',
    '## Küçük bulgular',
    ...(kucuk.length ? kucuk.map((b) => `- ${b.ad}${b.tetik ? ` | tetik: ${b.tetik}` : ''}`) : ['- yok']),
  ]
  if (g.not) satirlar.push('', '## Not', g.not)
  return `${satirlar.join('\n')}\n`
}

/**
 * (f) YAZI GÖVDESİ ÇIKAR / GÖM (BLG-69): 9 Kasım ölçümünde 12 tek seferlik betiğin ikisi buydu (gövdeyi yazilar.ts'ten çıkarma,
 * doğrulanan sürümü yazilar.ts'e gömme + guncellemeTarihi/yorum). Kayıt `kimlik: '<kimlik>'` ile başlar, sonraki `kimlik:` ile biter.
 * EOL korunur (CRLF dosya CRLF kalır). Gömme SESSİZ DEĞİLDİR: önceki gövde kayıttakiyle (sondaki satır sonu hariç) bire bir
 * aynı değilse, çapa tekil değilse, yeni gövde şablon sabiti için güvensizse (ters tırnak, ${) FIRLATIR.
 */
const sonSatirsiz = (s) => s.replace(/\n+$/, '')

function kayitAraligi(src, kimlik) {
  const idx = [...src.matchAll(/kimlik: '([^']+)'/g)]
  const i = idx.findIndex((m) => m[1] === kimlik)
  if (i < 0) throw new Error(`kimlik bulunamadı: ${kimlik}`)
  if (idx.filter((m) => m[1] === kimlik).length > 1) throw new Error(`kimlik birden çok kez geçiyor: ${kimlik}`)
  return { bas: idx[i].index, son: i + 1 < idx.length ? idx[i + 1].index : src.length }
}

function govdeSinirlari(blok) {
  const a = blok.indexOf('govde: `')
  if (a < 0) throw new Error('govde alanı bulunamadı')
  const bas = a + 'govde: `'.length
  const son = blok.indexOf('`,\n', bas)
  if (son < 0) throw new Error('govde kapanışı bulunamadı')
  return { bas, son }
}

export function govdeCikar(kaynak, kimlik) {
  const src = kaynak.replace(/\r\n/g, '\n')
  const { bas, son } = kayitAraligi(src, kimlik)
  const blok = src.slice(bas, son)
  const g = govdeSinirlari(blok)
  return blok.slice(g.bas, g.son)
}

export function govdeGom(kaynak, kimlik, onceki, yeni, secenek = {}) {
  const crlf = kaynak.includes('\r\n')
  const src = kaynak.replace(/\r\n/g, '\n')
  const o = sonSatirsiz(onceki.replace(/\r\n/g, '\n'))
  const y = sonSatirsiz(yeni.replace(/\r\n/g, '\n'))
  if (/`|\$\{/.test(y)) throw new Error('yeni gövdede ters tırnak ya da ${ var; şablon sabitinde güvenli değil')
  const { bas, son } = kayitAraligi(src, kimlik)
  let blok = src.slice(bas, son)
  const g = govdeSinirlari(blok)
  const mevcut = blok.slice(g.bas, g.son)
  if (sonSatirsiz(mevcut) !== o) throw new Error(`önceki gövde kayıttakiyle aynı değil (kayıt sha ${sha12(sonSatirsiz(mevcut))}, verilen ${sha12(o)})`)
  const sonEk = mevcut.slice(sonSatirsiz(mevcut).length)
  blok = blok.slice(0, g.bas) + y + sonEk + blok.slice(g.son)
  if (secenek.tarih) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(secenek.tarih)) throw new Error('tarih YYYY-AA-GG olmalı')
    const re = /(\n(\s*))guncellemeTarihi: '[^']*',/
    if (!re.test(blok)) throw new Error('guncellemeTarihi alanı bulunamadı')
    const yorumSatiri = secenek.yorum ? `// ${secenek.yorum.replace(/\s+/g, ' ')}` : ''
    blok = blok.replace(re, (_m, nl) => `${yorumSatiri ? `${nl}${yorumSatiri}` : ''}${nl}guncellemeTarihi: '${secenek.tarih}',`)
  }
  const cikti = src.slice(0, bas) + blok + src.slice(son)
  return crlf ? cikti.replace(/\n/g, '\r\n') : cikti
}

/**
 * (g) İDDİA TABLOSU YAMASI (BLG-69): satırları `ara` (metin başlangıcı, tek eşleşme zorunlu; adet verilirse o kadar) ile bulur,
 * `set` alanlarını yazar (metin, kaynak, tur, alinti); `ekle` yeni satır ekler. Bulunmayan/çok eşleşen `ara` FIRLATIR.
 */
export function iddiaYamaUygula(dosya, yamalar) {
  const iddialar = (dosya.iddialar || []).map((x) => ({ ...x }))
  for (const [i, y] of yamalar.entries()) {
    if (y.ekle) {
      if (typeof y.ekle.metin !== 'string' || !y.ekle.metin) throw new Error(`yama #${i + 1}: ekle.metin gerekli`)
      iddialar.push({ kaynak: [], tur: 'genel', alinti: '', ...y.ekle })
      continue
    }
    if (typeof y.ara !== 'string' || !y.ara || !y.set) throw new Error(`yama #${i + 1}: ara ve set gerekli (ya da ekle)`)
    const eslesen = iddialar.filter((x) => x.metin.startsWith(y.ara))
    const adet = y.adet ?? 1
    if (eslesen.length !== adet) throw new Error(`yama #${i + 1}: "${y.ara.slice(0, 60)}" ${eslesen.length} satıra uydu (beklenen ${adet})`)
    for (const x of eslesen) Object.assign(x, y.set)
  }
  return { ...dosya, iddialar }
}
