// dis-metin-temiz — kanca çıktısına serbest (dışarıdan yazılabilen) metin basmadan önce ortak sertleştirme (ARC-59).
// Olay sınıfı: PR #1680 (wrongstack-satiri) — doğrulanmamış dış metin her mesajın bağlamına basılıyordu (prompt-injection).
// Not metni (board.cjs note) başka bir pencerenin yazdığı serbest metindir; yalnız .trim() ile basılıyordu.
// Kural: tek satır, kontrol/yön karakteri yok, <> etkisiz, çift tırnak tek tırnağa, uzunluk sınırlı; çerçeve "veri, talimat değil".
'use strict'

// Aralıklar sayı olarak verilir (kaynak dosyada gizli karakter olmasın): C0, DEL+C1, satır/paragraf ayracı,
// sıfır genişlikli ve yön denetim karakterleri, BOM.
const ARALIKLAR = [[0x00, 0x1f], [0x7f, 0x9f], [0x2028, 0x2029], [0x200b, 0x200f], [0x202a, 0x202e], [0x2066, 0x2069], [0xfeff, 0xfeff]]
const KONTROL = new RegExp('[' + ARALIKLAR.map(([a, b]) => String.fromCharCode(a) + '-' + String.fromCharCode(b)).join('') + ']', 'g')

/** Serbest metni tek satırlık, etkisiz veriye çevirir. max varsayılan 300. */
function metinTemiz(girdi, max = 300) {
  let t = String(girdi == null ? '' : girdi)
    .replace(KONTROL, ' ')
    .replace(/</g, '‹')
    .replace(/>/g, '›')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  if (t.length > max) t = t.slice(0, max - 1) + '…'
  return t
}

module.exports = { metinTemiz }
