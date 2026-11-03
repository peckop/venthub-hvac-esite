/**
 * Yönetici dışa aktarımının TEK belge üreticisi: CSV ve XLS (HTML tablo) — ADM-6, VULN-006 Faz 2.
 * Cetvel: docs/standards/csv-import-export-standard.md §1.1.
 *
 * NİÇİN: 16 yüzey belgeyi kendi içinde birleştiriyordu (başlık ayrı, gövde ayrı, BOM ayrı); üç
 * yüzey ayrıca XLS'i `<td>${deger}</td>` diye kaçışsız basıyordu. Excel HTML'i yorumladığı için
 * müşterinin ad alanına yazdığı etiket dosyayı açan yöneticinin makinesinde çalışırdı.
 * Burada başlık da gövde de AYNI hücre kapısından (`notrMetin`) geçer.
 */
import { type CsvDeger,csvSatir, notrMetin } from './hucre'

export type CsvAyrac = ',' | ';'
export type TabloSatiri = readonly CsvDeger[]

const BOM = '﻿'

/** UTF-8 BOM + başlık + gövde; her hücre `csvHucre`'den geçer. */
export function csvBelgesi(
  baslik: TabloSatiri,
  satirlar: readonly TabloSatiri[],
  ayrac: CsvAyrac = ',',
): string {
  return BOM + [csvSatir(baslik, ayrac), ...satirlar.map((s) => csvSatir(s, ayrac))].join('\n')
}

const HTML_KACIS: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

/**
 * HTML metin kaçışı. Değer yalnız öğe İÇERİĞİNE yazılır (öznitelik değil); bu yüzden `'`
 * kaçışlanmaz — formül öneki (`'=...`) Excel'de okunur kalır.
 */
export function htmlKacis(metin: string): string {
  return metin.replace(/[&<>"]/g, (k) => HTML_KACIS[k] ?? k)
}

/** XLS hücresi: önce formül nötrleme, sonra HTML kaçışı. */
export function xlsHucre(deger: CsvDeger): string {
  return htmlKacis(notrMetin(deger))
}

/** Excel'in açtığı HTML tablo belgesi (`application/vnd.ms-excel`). */
export function xlsBelgesi(baslik: TabloSatiri, satirlar: readonly TabloSatiri[]): string {
  const bas = baslik.map((h) => `<th>${xlsHucre(h)}</th>`).join('')
  const govde = satirlar.map((s) => `<tr>${s.map((h) => `<td>${xlsHucre(h)}</td>`).join('')}</tr>`).join('')
  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' +
    `<table border="1"><thead><tr>${bas}</tr></thead><tbody>${govde}</tbody></table>` +
    '</body></html>'
  )
}

const MIME = {
  csv: 'text/csv;charset=utf-8;',
  xls: 'application/vnd.ms-excel',
} as const

/** Tarayıcıda dosya indirir. Yalnız istemci bileşenlerinden çağrılır. */
export function tabloIndir(icerik: string, dosyaAdi: string, tur: keyof typeof MIME): void {
  const url = URL.createObjectURL(new Blob([icerik], { type: MIME[tur] }))
  const a = document.createElement('a')
  a.href = url
  a.download = dosyaAdi
  a.click()
  URL.revokeObjectURL(url)
}
