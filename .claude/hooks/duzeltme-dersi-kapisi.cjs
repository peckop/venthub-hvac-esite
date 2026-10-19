#!/usr/bin/env node
'use strict'

/**
 * KANCA — düzeltme algılayıcı, kapı tarafı (ARC-202). Olay: Stop.
 * stdin: { session_id, transcript_path, stop_hook_active }.
 * İşaret varsa turun konuşma kaydında işaretten SONRA audience.roles dolu bir sage `remember` çağrısı
 * aranır: bulunursa işaret ve borç silinir; bulunamazsa DERS BORCU yazılır. Varsayılan kip UYARI:
 * tur bloklanmaz, borç sonraki istemde görünür. `VENTHUB_DUZELTME_KAPISI=blok` kipinde tur bir kez
 * bloklanır (exit 2). Karar ve gerekçe: scripts/hijyen/duzeltme-borcu.cjs başlığı.
 * Transkript yalnız kuyruk yardımcısıyla okunur (INV-KANCA-KUYRUK-3).
 */
const fs = require('fs')
const path = require('path')

let girdi = {}
try {
  girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
} catch {
  process.exit(0)
}

let cikis = 0
try {
  const hij = path.join(__dirname, '..', '..', 'scripts', 'hijyen')
  const borc = require(path.join(hij, 'duzeltme-borcu.cjs'))
  const { kuyrukSatirlari } = require(path.join(__dirname, 'transkript-kuyrugu.cjs'))
  const sid = girdi.session_id
  const mod = borc.kip()
  const isaret = sid && mod !== 'kapali' ? borc.oku(borc.isaretYolu(sid)) : null
  if (isaret && Number.isFinite(isaret.ts)) {
    let satirlar = []
    let olculdu = true
    try {
      satirlar = kuyrukSatirlari(girdi.transcript_path)
    } catch {
      olculdu = false
    }
    if (!olculdu) {
      process.stderr.write('[duzeltme-dersi] ölçülemedi (konuşma kaydı okunamadı); işaret korunuyor\n')
    } else if (borc.dersYazildiMi(satirlar, isaret.ts)) {
      borc.sil(borc.isaretYolu(sid))
      borc.sil(borc.borcYolu(sid))
    } else {
      borc.yaz(borc.borcYolu(sid), { ts: isaret.ts, kaliplar: isaret.kaliplar })
      borc.sil(borc.isaretYolu(sid))
      if (mod === 'blok' && !girdi.stop_hook_active) {
        process.stderr.write(
          `Recep bu turda düzeltme/tekrar uyarısı yazdı (${(isaret.kaliplar || []).join(', ')}) ama sage'e davranış dersi yazılmadı. ` +
            'wrongstack-sage remember ile dersi yaz (audience.roles=[<ROL>] dolu), sonra turu bitir.\n',
        )
        cikis = 2
      }
    }
  }
} catch {
  /* fail-open: beklenmeyen hata turu bloklamaz (ölçülemeyen okuma yukarıda stderr'e yazılır) */
}
process.exit(cikis)
