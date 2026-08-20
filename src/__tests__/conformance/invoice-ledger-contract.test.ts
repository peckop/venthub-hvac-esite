import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-INVOICE-1 — fatura defteri sözleşmesi (T132-VH · 2026-08-20).
 *
 * NİÇİN VAR
 *
 * `legal-compliance-standard.md` §2.3 köprü prosedürü, faturalandı kaydını uzun süre
 * `payment_debug` JSON'una yazmayı öneriyordu. Recep 08-20'de kalıcı yolu seçti:
 * kayıt `order_invoices` tablosunda yaşar. Bu kapı o kararın **geri kaymasını** engeller.
 *
 * Korunan dört şey ve her birinin bedeli:
 *
 *   R1 — fatura numarası TEKİL. Aynı numaranın iki siparişe yazılması vergi hukukunda
 *        ciddi bir kusurdur; JSON'da zorlanamazdı, kolonda zorlanır.
 *   R2 — `venthub_orders`'a "faturalandı" BOOLEAN kolonu eklenemez. İşaret satırın
 *        varlığından türetilir; bayrak eklenirse iki doğruluk kaynağı olur ve
 *        ayrıştıkları gün hangisinin doğru olduğunu kimse bilemez (bu depoda
 *        `status` ↔ `payment_status` karışımı satışta stoğun hiç düşmemesine yol açtı).
 *   R3 — yasal kayıt DEĞİŞTİRİLEMEZ: UPDATE/DELETE politikası yok, RLS açık.
 *   R4 — ödenmemiş siparişe fatura kesilemez (cetvelin tetiği: payment_status='paid').
 *
 * KAPININ GÖREMEDİĞİ (dürüst sınır): tarama STATİKTİR, canlı DB'yi görmez. Canlı
 * durumu migration'ın kendi doğrulama bloğu ölçer (RLS açık mı, politika sayısı,
 * tekil indeks, tetik, view yetkileri) ve tutmazsa migration çöker.
 *
 * Cetvel: docs/standards/legal-compliance-standard.md §2.3
 * Ölçüm:  docs/audits/t132-invoice-ledger-2026-08-20.md
 */

const KOK = path.resolve(__dirname, '../../..')
const MIGRATIONS = path.join(KOK, 'supabase/migrations')
const CETVEL = path.join(KOK, 'docs/standards/legal-compliance-standard.md')

/** SQL yorumlarını sil — bu migration'ın YORUMU eski deseni alıntılıyor. Depo CRLF. */
function yorumsuz(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\r\n]*/g, ' ')
}

function migrationlar(): Array<{ ad: string; sql: string; govde: string }> {
  return readdirSync(MIGRATIONS)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort()
    .map((ad) => {
      const sql = readFileSync(path.join(MIGRATIONS, ad), 'utf8')
      return { ad, sql, govde: yorumsuz(sql) }
    })
}

const DEFTER_RE = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.order_invoices/i

describe('INV-INVOICE-1 — fatura defteri sözleşmesi', () => {
  const hepsi = migrationlar()
  const defterDosyalari = hepsi.filter((d) => DEFTER_RE.test(d.govde))

  it('R0 — tarayıcı gerçekten dosya buluyor (sahte-yeşil kilidi)', () => {
    expect(hepsi.length, 'migration dizini boş okundu — yol yanlış olabilir').toBeGreaterThan(100)
    expect(
      defterDosyalari.length,
      'order_invoices tablosunu kuran migration bulunamadı — desen tutmuyor ya da dosya silinmiş',
    ).toBe(1)
  })

  it('R0b — dedektör sağlıklı: yorum içindeki SQL sayılmaz', () => {
    const yorumlu = '-- CREATE TABLE public.order_invoices (sahte)\nSELECT 1;'
    expect(DEFTER_RE.test(yorumsuz(yorumlu))).toBe(false)
    expect(DEFTER_RE.test(yorumsuz('CREATE TABLE public.order_invoices (id uuid);'))).toBe(true)
  })

  it('R1 — fatura numarası TEKİL ve normalize edilerek kilitlenmiş', () => {
    const d = defterDosyalari[0]
    expect(
      /CREATE\s+UNIQUE\s+INDEX[\s\S]*?ON\s+public\.order_invoices[\s\S]*?invoice_no/i.test(d.govde),
      `\n${d.ad}: fatura numarası için TEKİL indeks yok. Aynı numaranın iki siparişe ` +
        'yazılması vergi hukukunda ciddi kusurdur.',
    ).toBe(true)

    expect(
      /lower\s*\(\s*btrim\s*\(\s*invoice_no\s*\)\s*\)/i.test(d.govde),
      `\n${d.ad}: tekillik HAM invoice_no üzerinde. "ABC-1", "abc-1" ve " ABC-1 " aynı ` +
        'numaradır; normalize edilmezse tekillik boşluk/büyük-küçük farkıyla delinir.',
    ).toBe(true)
  })

  it('R2 — siparişe "faturalandı" bayrağı eklenmemiş (tek doğruluk kaynağı)', () => {
    const ihlaller: string[] = []
    const bayrak =
      /ALTER\s+TABLE\s+(?:public\.)?venthub_orders[\s\S]{0,200}?\b(is_invoiced|invoiced|invoice_issued|faturalandi)\b\s+boolean/i
    for (const d of hepsi) {
      if (bayrak.test(d.govde)) ihlaller.push(d.ad)
    }
    expect(
      ihlaller,
      '\nventhub_orders üzerine "faturalandı" BOOLEAN kolonu eklenmiş. İşaret ' +
        'order_invoices satırının VARLIĞINDAN türetilir; bayrak ikinci bir doğruluk ' +
        'kaynağı yaratır ve ayrıştığı gün hangisinin doğru olduğu bilinemez.',
    ).toEqual([])
  })

  it('R3 — yasal kayıt değiştirilemez: RLS açık, UPDATE/DELETE politikası yok', () => {
    const d = defterDosyalari[0]

    expect(
      /ALTER\s+TABLE\s+public\.order_invoices\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(d.govde),
      `\n${d.ad}: order_invoices üzerinde RLS açılmamış.`,
    ).toBe(true)

    const yazmaPolitikasi = d.govde.match(
      /CREATE\s+POLICY[^;]*ON\s+public\.order_invoices[^;]*FOR\s+(UPDATE|DELETE)[^;]*;/gi,
    )
    expect(
      yazmaPolitikasi ?? [],
      `\n${d.ad}: order_invoices için UPDATE/DELETE politikası eklenmiş. Fatura yasal ` +
        'kayıttır; düzeltme yolu iptal + yeni satırdır, mevcut satırın değiştirilmesi değil.',
    ).toEqual([])
  })

  it('R4 — ödenmemiş siparişe fatura kesilemez (cetvelin tetiği kodda)', () => {
    const d = defterDosyalari[0]
    expect(
      /CREATE\s+TRIGGER\s+trg_invoice_requires_paid_order/i.test(d.govde),
      `\n${d.ad}: ödeme kapısı tetiği yok. Cetvel §2.3 tetiği açık: ` +
        "faturalandırma payment_status='paid' olan sipariş içindir.",
    ).toBe(true)

    expect(
      /payment_status/i.test(d.govde),
      `\n${d.ad}: tetik payment_status'e hiç bakmıyor.`,
    ).toBe(true)
  })

  it('R5 — fatura kaydı payment_debug içine yazılmıyor', () => {
    const servis = readFileSync(path.join(KOK, 'src/lib/services/orderInvoice.service.ts'), 'utf8')
    expect(
      /payment_debug/.test(servis),
      '\norderInvoice.service.ts payment_debug alanına dokunuyor. Fatura kaydı ödeme/iade ' +
        'yolunun yazdığı kolonda yaşamaz (T114 dersi: paylaşılan yazıcı sessizce ezer).',
    ).toBe(false)
  })

  it('R6 — cetvel §2.3 yeni kaydı anlatıyor (doküman koddan geri kalmıyor)', () => {
    const cetvel = readFileSync(CETVEL, 'utf8')
    expect(
      cetvel.includes('order_invoices'),
      '\nlegal-compliance-standard §2.3 hâlâ eski kaydı anlatıyor: order_invoices geçmiyor. ' +
        'Karar değişti, cetvel kodun gerisinde kalamaz.',
    ).toBe(true)
    expect(cetvel).toContain('INV-INVOICE-1')
  })
})
