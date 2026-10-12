#!/usr/bin/env node
'use strict'

/**
 * PreToolUse hook (matcher SendMessage) — KARTSIZ EMİR UYARISI (ARC-79, ARC-109 satır 6).
 *
 * NİÇİN: OPS'un departmana verdiği iş emri SendMessage ile gidiyor; kart numarası taşımıyorsa kart ya sonradan
 * açılıyor ya hiç açılmıyor ("emir = kart, mesaj değil", 9 Ekim). ARC-43 kapısı Recep'e giden BEKLENTİYİ kartlar;
 * bu kanca departmana giden EMİRDE kart numarası arar. İkisi aynı ailedendir, kapsamları ayrıdır.
 *
 * NE YAPAR: gönderen OPS ise (mesaj "OPS" ile başlar) ve metin bir EMİR gibi okunuyorsa (emir fiili ya da "emri")
 * ama bir pano kart numarası (URN-/ALT-/SEO-… ya da REC-nn) yoksa modele TEK satırlık uyarı verir. Onay, hüküm ve
 * bilgi mesajları (uygun, okundu, kabul, not …) emir sayılmaz. v1: yalnız UYARI; çıkış her zaman 0, mesaj gider.
 * v2 (durdur) ayrı karardır, bu dosyada YOK.
 *
 * SINIFLAMA bir sezgisel kuraldır, hüküm değildir: sınırı `siniflandir` testle sabitlenir (emir/onay/bilgi/kartlı).
 * Yanlış alarm pahalı değil (bir satır), kaçırılan emir de bloklanmaz; bu yüzden eşik cömert değil dardır.
 *
 * FAIL-OPEN VE SESSİZ: stdin bozuksa, mesaj metin değilse, her türlü hatada hiçbir şey basmaz.
 *
 * stdin: { tool_name, tool_input: { to, message, summary } }
 * Çıkış: DAİMA 0. Uyarı varsa stdout'a { hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext } }.
 */

const fs = require('fs')

// docs/standards/is-kayit-duzeni-standard.md'deki departman önekleri + Linear'dan taşınan REC.
const KART_NO = /\b(?:URN|ALT|SEO|KTL|BLG|HRT|TSR|ARC|OPS|STS|EDG|ADM|MVZ|TKP|YTN|REC|I18)-\d{1,5}\b/
// Başında gönderen adı: "OPS → ARAÇ:", "OPS emri", "OPS ek", "OPS:"
const OPS_BASI = /^\s*OPS\b/
// Onay / hüküm / bilgi işaretleri: bunlar emir değildir. (küçük harf, tr)
const EMIR_DISI = [
  'uygun',
  'okundu',
  'onay',
  'kabul',
  'hüküm',
  'hukum',
  'bilgi',
  'denetçi notu',
  'denetci notu',
  'teşekkür',
  'tesekkur',
  'alındı',
  'alindi',
]
// Emir göstergeleri: emir kipi fiilleri. Kısa fiiller TAM sözcük (başında/sonunda harf olmamalı), uzun gövdeler
// sözcük BAŞINDA aranır (başla → başlayın). JS `\b` Türkçe harfleri tanımadığı için harf sınıfı elle yazıldı.
const HARF = 'a-zçğıöşüâîû'
const TAM_FIILLER = ['yaz', 'aç', 'ac', 'kur', 'sil', 'ilet', 'ölç', 'olc', 'et', 'ekle', 'kapat', 'al', 'dön', 'don']
const GOVDE_FIILLER = [
  'başla',
  'basla',
  'uygula',
  'birleştir',
  'birlestir',
  'düzelt',
  'duzelt',
  'hazırla',
  'hazirla',
  'devral',
  'tamamla',
  'yükselt',
  'yukselt',
  'çalıştır',
  'calistir',
  'güncelle',
  'guncelle',
  'devreye',
]
const FIIL_KALIBI = new RegExp(
  `(?<![${HARF}])(?:(?:${TAM_FIILLER.join('|')})(?![${HARF}])|(?:${GOVDE_FIILLER.join('|')}))`,
)

/**
 * @param {string} metin SendMessage gövdesi
 * @returns {'kartli' | 'gonderen-degil' | 'emir-degil' | 'emir'}
 */
function siniflandir(metin) {
  if (typeof metin !== 'string' || !metin.trim()) return 'emir-degil'
  if (!OPS_BASI.test(metin)) return 'gonderen-degil'
  if (KART_NO.test(metin)) return 'kartli'
  const kucuk = metin.toLocaleLowerCase('tr')
  const acikEmir = /(?<![a-zçğıöşüâîû])emri(?![a-zçğıöşüâîû])|(?<![a-zçğıöşüâîû])emir:/.test(kucuk)
  if (acikEmir) return 'emir'
  if (EMIR_DISI.some((k) => kucuk.includes(k))) return 'emir-degil'
  return FIIL_KALIBI.test(kucuk) ? 'emir' : 'emir-degil'
}

const UYARI =
  'KARTSIZ EMİR: bu mesaj bir iş emri gibi okunuyor ama pano kart numarası yok. Emri göndermeden önce Kanban\'da ' +
  'kartı aç ve numarasını (ör. ARC-NN) mesaja yaz; kartı açan müdürdür ama numarasız emir kabul edilmiş sayılmaz ' +
  '(karar 219/220). Bu bir onay/hüküm/bilgi mesajıysa uyarıyı yok say.'

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  if (girdi.tool_name !== 'SendMessage') return
  const mesaj = girdi.tool_input && girdi.tool_input.message
  if (siniflandir(mesaj) !== 'emir') return
  try {
    fs.writeSync(1, JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: UYARI } }) + '\n')
  } catch {
    // stdout kapalı: uyarı verilemedi, mesaj yine gider
  }
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}

module.exports = { siniflandir, KART_NO, UYARI }
