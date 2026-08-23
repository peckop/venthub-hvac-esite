import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-LEDGER-1 — Ödeme defteri SÖZLÜĞÜ ile DB KISITI birebir aynı olmalı.
 *
 * NİÇİN VAR (T116-VH · 2026-08-23)
 *
 * Cetvel (`docs/standards/payment-ledger-standard.md` §2) defterin sözlüğünü PSP olay
 * ekseninde tanımlar: `authorized · captured · failed · voided · refunded ·
 * partial_refunded`. Bu sözlük DB'de bir CHECK kısıtı olarak yaşar. İkisi ayrışırsa
 * cetvel **yalnız metindir**: kod, kısıtın kabul etmediği bir değeri yazmaya çalışır ve
 * yazma 400 ile düşer — ya da tersi, kısıt cetvelde olmayan bir değeri kabul eder ve
 * defterde tanımsız bir olay birikir.
 *
 * Bu kapı, cetvelin kendi §5 kuralının gereğidir: *"kapı, zorladığı gerçek aynı anda
 * inmelidir."* Sözlük kısıtı ADIM-1 migration'ıyla indiği için kapısı da orada iner.
 *
 * ── ÖLÇÜM YÖNTEMİ, ADIYLA ───────────────────────────────────────────────────────
 * Bu test **canlı DB'ye SORMAZ**. İki metni karşılaştırır: cetvelin §2 tablosu ve
 * migration dosyalarındaki **son** `payment_transactions_status_check` tanımı.
 * "Son" olması kasıtlı: kısıt birden çok migration'da yeniden tanımlanabilir ve
 * canlıda geçerli olan **en son uygulanandır**. Böylece kapı CI'da deterministiktir
 * (ağ yok, sır yok, sıra yok) ama yine de "bugün hangi kısıt geçerli" sorusunu yanıtlar.
 *
 * Ölçtüğü şey: **repo ne diyor.** Ölçmediği şey: **prod'da gerçekten ne var** — migration
 * uygulanmadıysa bu test yine yeşildir. O yüzden ADIM-2'nin kanıt tanımı (cetvel §6.2)
 * ayrıca DB'ye sorar; bu kapı onun yerine geçmez.
 */

const REPO = process.cwd()
const CETVEL = path.join(REPO, 'docs/standards/payment-ledger-standard.md')
const MIGRATIONS = path.join(REPO, 'supabase/migrations')

/** Cetvel §2 tablosunun İLK kolonundaki backtick'li olay adları. */
function cetveldenSozluk(): string[] {
  const metin = readFileSync(CETVEL, 'utf8')
  const bolum = metin.split(/^## 2\. /m)[1]?.split(/^### 2\.1 /m)[0]
  if (!bolum) throw new Error('INV-LEDGER-1: cetvelde §2 bölümü bulunamadı')
  const olaylar: string[] = []
  for (const satir of bolum.split(/\r?\n/)) {
    if (!satir.startsWith('|')) continue
    const ilkHucre = satir.split('|')[1] ?? ''
    const m = ilkHucre.match(/`([a-z_]+)`/)
    if (m) olaylar.push(m[1])
  }
  return [...new Set(olaylar)].sort()
}

/** Migration'lardaki SON payment_transactions_status_check tanımının değer listesi. */
function migrationdanSozluk(): { degerler: string[]; dosya: string } {
  const dosyalar = readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()
  let sonuc: { degerler: string[]; dosya: string } | null = null
  for (const dosya of dosyalar) {
    const sql = readFileSync(path.join(MIGRATIONS, dosya), 'utf8')
    const kisit = sql.match(
      /ADD\s+CONSTRAINT\s+payment_transactions_status_check\s+CHECK\s*\(([\s\S]*?)\)\s*;/i,
    )
    if (!kisit) continue
    const degerler = [...kisit[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1])
    sonuc = { degerler: [...new Set(degerler)].sort(), dosya }
  }
  if (!sonuc) throw new Error('INV-LEDGER-1: hiçbir migration payment_transactions_status_check tanımlamıyor')
  return sonuc
}

describe('INV-LEDGER-1 · ödeme defteri sözlüğü ile DB kısıtı aynı olmalı', () => {
  it('cetvel §2 tablosundan sözlük ayıklanabiliyor (boş küme SAHTE YEŞİL sayılır)', () => {
    const sozluk = cetveldenSozluk()
    // NEGATİF KONTROL: ayıklayıcı bozulursa boş küme döner ve "boş == boş" karşılaştırması
    // vacuous olarak geçerdi. Uzunluğu ADIYLA sabitliyoruz.
    expect(sozluk.length).toBeGreaterThanOrEqual(6)
    expect(sozluk).toContain('captured')
    expect(sozluk).toContain('partial_refunded')
  })

  it('migration kısıtından sözlük ayıklanabiliyor (boş küme SAHTE YEŞİL sayılır)', () => {
    const { degerler, dosya } = migrationdanSozluk()
    expect(dosya).toMatch(/\.sql$/)
    expect(degerler.length).toBeGreaterThanOrEqual(6)
  })

  it('iki sözlük BİREBİR aynı', () => {
    const cetvel = cetveldenSozluk()
    const { degerler, dosya } = migrationdanSozluk()
    const cetveldeVarKisittaYok = cetvel.filter((d) => !degerler.includes(d))
    const kisittaVarCetveldeYok = degerler.filter((d) => !cetvel.includes(d))
    expect(
      { cetveldeVarKisittaYok, kisittaVarCetveldeYok, kisitDosyasi: dosya },
    ).toEqual({ cetveldeVarKisittaYok: [], kisittaVarCetveldeYok: [], kisitDosyasi: dosya })
  })
})
