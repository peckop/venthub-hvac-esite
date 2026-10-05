#!/usr/bin/env node
'use strict'

/**
 * KONU YÖNLENDİRİCİ — `docs/standards/belge-yonetimi-standard.md` §B6 (yönlendirici), REC-400 D4.
 *
 * NİÇİN VAR: mesajda "migration" geçince ilgili cetvelin (`create-migration`, kural 13) kendiliğinden
 * gelmesi gerekir; bugün ancak ajan kendi kendine hatırlarsa gelir. Hatırlatmak Recep'e kalıyordu.
 *
 * SÖZLEŞME (ARAÇ kancası bunu çağırır; `.claude/hooks/hafiza-sorusu-yonlendirme.cjs`):
 *   - SAF: girdi metin, çıktı dizi. Dosya, ağ, saat, ortam DEĞİŞKENİ okumaz; yan etkisi yoktur.
 *   - Oturum başına "aynı cetvel 1 kez", çıktı bütçesi ve claude-mem çağrısı KANCANIN işidir
 *     (IO ve zaman sınırı kancada, içerik kuralı burada).
 *   - Belirsizlikte SESSİZ kalır: eşiği geçmeyen istem için boş dizi döner (uyarı gürültüsü üretmez).
 *
 * İMZA:
 *   satirlariCikar(readmeMetni: string) → Array<{ soru: string, yol: string }>
 *   konuYonlendir({ istem, satirlar, maks?, esik? }) → Array<{ yol: string, puan: number, ortak: string[] }>
 *
 * EŞLEŞME KURALI (bilerek basit, ölçülebilir): istemdeki anlamlı sözcükler (≥4 harf, Türkçe harfleri
 * katlanmış, çekim eki için 5 harfli önek karşılaştırılır) ile belge haritası satırının SORU hücresi
 * kesişir; kesişen sözcük sayısı ≥ `esik` (varsayılan 2) olan satırlar puanla sıralanır, en çok `maks` (2).
 */

const ETKISIZ = new Set([
  'nasil', 'neden', 'nerede', 'hangi', 'icin', 'olan', 'olur', 'gibi', 'daha', 'ama', 'veya',
  'bunu', 'sunu', 'onun', 'bize', 'bana', 'sana', 'mesaj', 'yapmak', 'yapilir', 'yapilacak',
  'lutfen', 'simdi', 'sonra', 'ondan', 'bunun', 'diye', 'kadar', 'hakkinda', 'ilgili',
])

/** Türkçe harfleri katlar, küçültür (ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c). */
function katla(metin) {
  return String(metin)
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

/** Anlamlı sözcükler: ≥4 harf, etkisiz sözcük değil; kök karşılaştırma için ilk 5 harf. */
function anahtarlar(metin) {
  const kok = new Map()
  for (const s of katla(metin).split(/[^a-z0-9]+/)) {
    if (s.length < 4 || ETKISIZ.has(s)) continue
    const k = s.slice(0, 5)
    if (!kok.has(k)) kok.set(k, s)
  }
  return kok
}

/**
 * docs/README.md içindeki `| Soru | Otorite |` (ve `| Soru | Harita / araç | Not |`) tablolarından
 * satırları çıkarır. Yol = satırdaki ilk ters tırnaklı `.md` yolu ya da klasör.
 */
function satirlariCikar(readmeMetni) {
  const cikti = []
  let tabloda = false
  for (const ham of String(readmeMetni).split(/\r?\n/)) {
    const satir = ham.trim()
    if (/^\|\s*Soru\s*\|/i.test(satir)) { tabloda = true; continue }
    if (!tabloda) continue
    if (!satir.startsWith('|')) { tabloda = false; continue }
    if (/^\|[-\s|:]+\|?$/.test(satir)) continue
    const hucreler = satir.split('|').slice(1, -1).map((h) => h.trim())
    if (hucreler.length < 2) continue
    const yol = /`([^`\s]+\.(?:md|json|cjs)|[^`\s]+\/)`/.exec(hucreler.slice(1).join(' '))
    if (!yol) continue
    cikti.push({ soru: hucreler[0].replace(/\*\*/g, ''), yol: yol[1] })
  }
  return cikti
}

function konuYonlendir({ istem, satirlar, maks = 2, esik = 2 }) {
  if (typeof istem !== 'string' || !Array.isArray(satirlar) || satirlar.length === 0) return []
  const istemAnahtar = anahtarlar(istem)
  if (istemAnahtar.size < esik) return []
  const adaylar = []
  for (const { soru, yol } of satirlar) {
    const soruAnahtar = anahtarlar(soru)
    const ortak = []
    for (const [k, s] of soruAnahtar) if (istemAnahtar.has(k)) ortak.push(s)
    if (ortak.length >= esik) adaylar.push({ yol, puan: ortak.length, ortak })
  }
  adaylar.sort((a, b) => b.puan - a.puan)
  const goruldu = new Set()
  const sonuc = []
  for (const a of adaylar) {
    if (goruldu.has(a.yol)) continue
    goruldu.add(a.yol)
    sonuc.push(a)
    if (sonuc.length >= maks) break
  }
  return sonuc
}

module.exports = { satirlariCikar, konuYonlendir, katla, anahtarlar }
