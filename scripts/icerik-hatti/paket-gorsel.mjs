/**
 * TAŞINABİLİR KATALOG — GÖRSEL DOSYASI KİMLİĞİ (REC-212, OPS GO 2026-09-27). Ağa çıkmaz.
 *
 * NİÇİN: paket üretici görsel dosyası diskte VARSA indirmeyi atlıyordu ve hiçbir yerde
 * dosya parmak izi tutulmuyordu. Depoda aynı adla değiştirilen bir fotoğraf pakette sessizce
 * eski kalırdı; paketteki dosyanın bozulması da hiçbir kapıda görünmezdi. (09-27 ölçümü:
 * 1146/1146 dosya depoyla eşitti — ama bunu elle koşulan bir betik söyledi, kapı değil.)
 *
 * Bu modül üç şeyi tek yerde tanımlar: dosyanın kimliği (sha256), üretimde karar
 * (yeni / aynı / güncellendi), paketteki dosyaların gorseller.csv'ye karşı doğrulaması.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const sha256 = (tampon) => createHash('sha256').update(tampon).digest('hex')

/** Üretimde: diskteki kopya (yoksa null) ile depodan inen dosya karşılaştırılır. */
export function dosyaKarari(yerel, uzak) {
  if (!yerel) return 'yeni'
  return sha256(yerel) === sha256(uzak) ? 'ayni' : 'guncellendi'
}

/** Görsel kümesinin tek izi: yol + sha, yola göre sıralı. Sıra değişimi izi değiştirmez. */
export function gorselIzi(kayitlar) {
  const satirlar = kayitlar.map(k => `${k.yol}\t${k.sha256}`).sort()
  return sha256(satirlar.join('\n'))
}

/**
 * Paketteki dosyalar ↔ gorseller.csv. `paket_yolu` boş satır (dosyasız görsel kaydı) sayılmaz.
 * @returns {{tamam: number, eksik: string[], bozuk: string[], shasiz: string[]}}
 */
export function paketGorselDogrula(paketDizin, satirlar) {
  const sonuc = { tamam: 0, eksik: [], bozuk: [], shasiz: [] }
  for (const s of satirlar) {
    if (!s.paket_yolu) continue
    if (!s.sha256) { sonuc.shasiz.push(s.paket_yolu); continue }
    const yol = join(paketDizin, s.paket_yolu)
    if (!existsSync(yol)) { sonuc.eksik.push(s.paket_yolu); continue }
    if (sha256(readFileSync(yol)) !== s.sha256) sonuc.bozuk.push(s.paket_yolu)
    else sonuc.tamam++
  }
  return sonuc
}
