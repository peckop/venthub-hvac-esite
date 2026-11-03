/**
 * İçe aktarma CSV ayrıştırıcısı — ADM-6. Cetvel: csv-import-export-standard.md §1.2.
 *
 * NİÇİN: iki içe aktarıcı aynı kopyayı taşıyordu: metni `\n`'den bölüp her satıra
 * `split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)` uyguluyordu. Tırnak içindeki satır sonu kaydı ikiye
 * bölüyor, satır sayısı sınırı yok, kapanmamış tırnak sessizce yutuluyordu. Bu tek geçişli
 * durum makinesi RFC 4180'in temel kurallarını uygular ve sınırı AYRIŞTIRIRKEN denetler
 * (sınırı aşan dosya belleğe kayıt kayıt dolmadan durur).
 *
 * DIŞA → İÇE DÖNGÜSÜ (ADM-7): dışa aktarma formül gibi başlayan metne `'` öneki koyar
 * (`hucre.ts`, §1.1). Veri hücreleri burada `notrlemeyiGeriAl`'dan geçer; yoksa adı `- Fan`
 * olan ürün dışa aktarılıp geri yüklenince `'- Fan` diye yazılırdı.
 */
import { notrlemeyiGeriAl } from './hucre'

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
  /** Hücreye henüz hiçbir karakter (tırnak dahil) okunmadı mı? */
  let hucreBasi = true
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
    if (k === '"' && hucreBasi) {
      // Tırnak YALNIZ hücre başında açılır (RFC 4180). Ortadaki `"` metindir: `Fan 5" çap`
      // eskiden tırnak modunu açıp sonraki satırları tek kayda yutuyordu (ADM-7).
      tirnakta = true
      hucreBasi = false
    } else if (k === ayrac) {
      hucreler.push(hucre)
      hucre = ''
      hucreBasi = true
    } else if (k === '\n' || k === '\r') {
      if (k === '\r' && kaynak[i + 1] === '\n') i++
      if (!kayitBitir()) return { ok: false, hata: 'cokSatir' }
      satir++
      kayitBasi = satir
      hucreBasi = true
    } else {
      hucre += k
      hucreBasi = false
    }
  }
  if (tirnakta) return { ok: false, hata: 'kapanmamisTirnak' }
  if (!kayitBitir()) return { ok: false, hata: 'cokSatir' }

  if (kayitlar.length < 2) return { ok: false, hata: 'bos' }

  const baslik = kayitlar[0].hucreler.map((h) => h.trim().toLowerCase())
  // Boş başlık (Excel'in sona eklediği `sku,name,,`) tekrar sayılmaz ve okunmaz (ADM-7):
  // adı olmayan sütunu hiçbir içe aktarıcı kullanmaz. Dolu başlık tekrarı yine reddedilir.
  const dolu = baslik.filter((b) => b !== '')
  if (new Set(dolu).size !== dolu.length) return { ok: false, hata: 'tekrarBaslik' }

  const veri = kayitlar.slice(1)
  return {
    ok: true,
    baslik,
    satirlar: veri.map(({ hucreler: h }) =>
      Object.fromEntries(
        baslik.flatMap((b, j) => (b === '' ? [] : [[b, notrlemeyiGeriAl(h[j] ?? '')] as const])),
      ),
    ),
    satirNolari: veri.map((k) => k.satir),
  }
}
