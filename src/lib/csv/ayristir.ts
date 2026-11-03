/**
 * İçe aktarma CSV ayrıştırıcısı — ADM-6. Cetvel: csv-import-export-standard.md §1.2.
 *
 * NİÇİN: iki içe aktarıcı aynı kopyayı taşıyordu: metni `\n`'den bölüp her satıra
 * `split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)` uyguluyordu. Tırnak içindeki satır sonu kaydı ikiye
 * bölüyor, satır sayısı sınırı yok, kapanmamış tırnak sessizce yutuluyordu. Bu tek geçişli
 * durum makinesi RFC 4180'in temel kurallarını uygular ve sınırı AYRIŞTIRIRKEN denetler
 * (sınırı aşan dosya belleğe kayıt kayıt dolmadan durur).
 */

export type AyristirmaHatasi = 'bos' | 'cokSatir' | 'kapanmamisTirnak' | 'tekrarBaslik'

export type AyristirmaSonucu =
  | {
      ok: true
      /** Kırpılmış, küçük harfli başlıklar. */
      baslik: string[]
      /** Başlık adıyla anahtarlanmış veri satırları; eksik hücre boş metin. */
      satirlar: Record<string, string>[]
      /** Her veri satırının dosyadaki BAŞLANGIÇ satır numarası (1 tabanlı; başlık = 1). */
      satirNolari: number[]
    }
  | { ok: false; hata: AyristirmaHatasi }

export interface AyristirmaSecenegi {
  /** Veri satırı (başlık hariç) üst sınırı; aşılırsa dosyanın TAMAMI reddedilir. */
  maksSatir: number
  ayrac?: ',' | ';'
}

export function csvAyristir(metin: string, { maksSatir, ayrac = ',' }: AyristirmaSecenegi): AyristirmaSonucu {
  const kaynak = metin.replace(/^﻿/, '')
  const kayitlar: { hucreler: string[]; satir: number }[] = []

  let hucre = ''
  let hucreler: string[] = []
  let tirnakta = false
  let satir = 1
  let kayitBasi = 1

  const kayitBitir = (): boolean => {
    hucreler.push(hucre)
    hucre = ''
    if (hucreler.some((h) => h.trim() !== '')) {
      kayitlar.push({ hucreler, satir: kayitBasi })
      // başlık + maksSatir veri satırı
      if (kayitlar.length > maksSatir + 1) return false
    }
    hucreler = []
    return true
  }

  for (let i = 0; i < kaynak.length; i++) {
    const k = kaynak[i]
    if (tirnakta) {
      if (k === '"') {
        if (kaynak[i + 1] === '"') {
          hucre += '"'
          i++
        } else {
          tirnakta = false
        }
      } else {
        if (k === '\n') satir++
        hucre += k
      }
      continue
    }
    if (k === '"') {
      tirnakta = true
    } else if (k === ayrac) {
      hucreler.push(hucre)
      hucre = ''
    } else if (k === '\n' || k === '\r') {
      if (k === '\r' && kaynak[i + 1] === '\n') i++
      if (!kayitBitir()) return { ok: false, hata: 'cokSatir' }
      satir++
      kayitBasi = satir
    } else {
      hucre += k
    }
  }
  if (tirnakta) return { ok: false, hata: 'kapanmamisTirnak' }
  if (!kayitBitir()) return { ok: false, hata: 'cokSatir' }

  if (kayitlar.length < 2) return { ok: false, hata: 'bos' }

  const baslik = kayitlar[0].hucreler.map((h) => h.trim().toLowerCase())
  if (new Set(baslik).size !== baslik.length) return { ok: false, hata: 'tekrarBaslik' }

  const veri = kayitlar.slice(1)
  return {
    ok: true,
    baslik,
    satirlar: veri.map(({ hucreler: h }) => Object.fromEntries(baslik.map((b, j) => [b, h[j] ?? '']))),
    satirNolari: veri.map((k) => k.satir),
  }
}
