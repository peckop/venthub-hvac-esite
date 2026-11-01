'use strict'
/**
 * KART KAPAT — birleşen PR'ın kartını hatırlat / birleşmiş PR'li açık kartı bul (ARC-235, OPS 1 Kasım A+B).
 *
 * ── NİÇİN VAR ──
 * Done kapısı (done-kanit-kapisi) yanlış kapanmayı engelliyordu ama PR birleşince kartı kapatmayı TETİKLEYEN
 * hiçbir adım yoktu: REC-376 #1334 ile Eylül'de bitti, kart ay sonra hâlâ To Do'ydu (1 Kasım ayıklamada 117 açık
 * kartın 33'ü böyle çıktı). Bu dosya iki şeyi tek yerde tanımlar, ritüel/kanca/karne aynısını kullanır:
 *   A) `kartKapatSatirlari`  — birleşme anında PR gövdesindeki `Kanban: <no>` satırından "KART KAPAT" satırı.
 *   B) `birlesmisPrliAcikKartlar` — açık kartlardan, gövdesinde kendi numarası olan BİRLEŞMİŞ PR'i olanları bulur.
 *
 * ── SINIRLAR (bilerek) ──
 *  - Otomatik Done YOK: yalnız hatırlatma/ölçüm. Kartı kapatmak kanıtlı iştir (add_check + verify_completion).
 *  - Çok kartlı PR ve çok PR'li kart: karar verilmez, "değerlendir" denir (bir PR kartın yalnız bir parçası olabilir).
 *  - `Fixes REC-nn` / Linear numarası SAYILMAZ: tek geçerli kapanış satırı `Kanban: <no>` (filo-ortak.md).
 */

const NO = /^[A-Za-zÇĞİÖŞÜçğıöşü]{2,6}-\d{1,5}$/

/** PR gövdesindeki `Kanban: A-1, B-2` satırlarından kart numaraları (büyük harf, tekrarsız, sıra korunur). */
function kanbanNumaralari(govde) {
  const sonuc = []
  for (const m of String(govde || '').matchAll(/^[ \t>*-]*Kanban:[ \t]*(.+)$/gim)) {
    for (const parca of m[1].split(/[\s,;]+/)) {
      const no = parca.replace(/[`*_.]/g, '').toLocaleUpperCase('tr')
      if (NO.test(no) && !sonuc.includes(no)) sonuc.push(no)
    }
  }
  return sonuc
}

/** Birleşme anında pencereye basılacak satırlar. `depo` = "sahip/ad" (kanıt komutu için). */
function kartKapatSatirlari(pr, govde, depo = 'peckop/venthub-hvac-esite') {
  const nolar = kanbanNumaralari(govde)
  if (nolar.length === 0) {
    return [`KART KAPAT: bulunamadi — PR #${pr} govdesinde "Kanban: <no>" satiri yok; kart varsa elle kapat (kanit: gh api repos/${depo}/pulls/${pr}/merge).`]
  }
  if (nolar.length > 1) {
    return [`KART KAPAT: ${nolar.join(', ')} — PR #${pr} BIRDEN COK karta bagli; otomatik karar yok, her kartin BITIS maddesini ayri degerlendir.`]
  }
  return [
    `KART KAPAT: ${nolar[0]} — PR #${pr} birlesti. Kartin BITIS maddesi bu PR ile tamamsa: add_check (command: gh api repos/${depo}/pulls/${pr}/merge) → verify_completion → move_task done.`,
    `          Kartin baska acik PR'i/isi varsa KAPATMA; karta "PR #${pr} birlesti" notu dus.`,
  ]
}

/**
 * Açık kartlardan birleşmiş PR'i olanlar.
 * @param kartlar [{ no, columnId, status }]  (no: kart numarası)
 * @param prler   [{ number, body, mergedAt }] yalnız birleşmiş PR'ler
 * @returns { tek: [{no, prler:[n]}], cok: [{no, prler:[n,n]}] }  tek = kapatılmalı, cok = değerlendirilmeli
 */
function birlesmisPrliAcikKartlar(kartlar, prler) {
  const kartPr = new Map()
  for (const p of prler || []) {
    if (!p || !p.mergedAt) continue
    for (const no of kanbanNumaralari(p.body)) {
      if (!kartPr.has(no)) kartPr.set(no, [])
      kartPr.get(no).push(p.number)
    }
  }
  const tek = []
  const cok = []
  for (const k of kartlar || []) {
    if (!k || !k.no) continue
    if (k.columnId === 'done' || k.status === 'completed' || k.status === 'archived') continue
    const liste = kartPr.get(String(k.no).toLocaleUpperCase('tr'))
    if (!liste) continue
    ;(liste.length === 1 ? tek : cok).push({ no: k.no, prler: liste })
  }
  return { tek, cok }
}

module.exports = { kanbanNumaralari, kartKapatSatirlari, birlesmisPrliAcikKartlar }
