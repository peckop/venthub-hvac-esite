/**
 * İçe aktarılan satırların ŞEMA DOĞRULAMASI (zod) — ADM-6. Cetvel: csv-import-export-standard.md §1.2.
 *
 * NİÇİN: ürün içe aktarımı `status` hücresini `as` ile türe zorluyordu, `stock_qty`'yi
 * `Number()` ile NaN/negatif bırakabiliyordu; stok içe aktarımı negatif miktarı sessizce 0'a,
 * ondalığı sessizce tamsayıya kırpıyordu; SKU biçimi hiç denetlenmiyordu. Geçersiz değer ya
 * veritabanında reddedilip "başarısız satır" sayısına karışıyor ya da sessizce değişip yazılıyordu.
 *
 * SKU biçimi veritabanı kısıtıyla AYNIDIR (`products_sku_format_check`: `^[A-Z0-9-]+$`).
 */
import { z } from 'zod'

const SKU_DESENI = /^[A-Z0-9-]+$/
/** Tek satırdaki tamsayı alanlarının üst sınırı (stok, eşik). */
const MAKS_ADET = 1_000_000

/** Boş / yalnız boşluk hücre "verilmemiş" sayılır. */
const bosIseYok = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)

const metin = (maks: number) => z.preprocess(bosIseYok, z.string().trim().max(maks).optional())
const adet = z.preprocess(
  bosIseYok,
  z
    .string()
    .trim()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n <= MAKS_ADET)
    .optional(),
)

const skuSemasi = z.string().trim().min(1).max(64).regex(SKU_DESENI)

/** `products` yazımına giden CSV satırı. Bilinmeyen sütunlar yok sayılır. */
const urunSatiri = z.object({
  sku: skuSemasi,
  name: z.string().trim().min(1).max(300),
  brand: metin(100),
  model_code: metin(100),
  model: metin(100),
  status: z.preprocess(bosIseYok, z.enum(['active', 'draft', 'archived']).optional()),
  stock_qty: adet,
  low_stock_threshold: adet,
  category_id: metin(64),
  category_slug: metin(200),
  category: metin(200),
})

export type UrunSatiri = z.infer<typeof urunSatiri>

export type DogrulamaSonucu<T> = { ok: true; veri: T } | { ok: false; alan: string }

/** Satırı doğrular; geçersizse İLK hatalı alanın adını döner (kullanıcıya gösterilir). */
export function urunSatiriDogrula(satir: Readonly<Record<string, string>>): DogrulamaSonucu<UrunSatiri> {
  const s = urunSatiri.safeParse(satir)
  if (s.success) return { ok: true, veri: s.data }
  return { ok: false, alan: String(s.error.issues[0]?.path[0] ?? '?') }
}

/* ── Stok içe aktarımı ─────────────────────────────────────────────────── */

const MIKTAR_SUTUNLARI = ['qty', 'quantity', 'stock', 'new_stock'] as const

/** Hata kodu = `admin.inventory.import.errors.<kod>` sözlük anahtarı. */
export type StokHataKodu = 'missingSku' | 'invalidSku' | 'qtyMustBeNumber' | 'qtyOutOfRange'

export interface StokSatiri {
  line: number
  sku: string
  newQty: number
}

export type StokHazirlamaSonucu =
  | { ok: true; satirlar: StokSatiri[]; hatalar: { line: number; sku: string; kod: StokHataKodu }[] }
  | { ok: false; hata: 'eksikSutun' }

export function stokSatirlariniHazirla(
  baslik: readonly string[],
  satirlar: readonly Readonly<Record<string, string>>[],
  satirNolari: readonly number[],
): StokHazirlamaSonucu {
  const miktarSutunu = MIKTAR_SUTUNLARI.find((s) => baslik.includes(s))
  if (!baslik.includes('sku') || !miktarSutunu) return { ok: false, hata: 'eksikSutun' }

  const sonuc: StokSatiri[] = []
  const hatalar: { line: number; sku: string; kod: StokHataKodu }[] = []

  satirlar.forEach((r, i) => {
    const line = satirNolari[i] ?? i + 2
    const sku = (r.sku ?? '').trim()
    const miktar = (r[miktarSutunu] ?? '').trim()
    if (!sku) return void hatalar.push({ line, sku, kod: 'missingSku' })
    if (!skuSemasi.safeParse(sku).success) return void hatalar.push({ line, sku, kod: 'invalidSku' })
    if (miktar === '' || !Number.isFinite(Number(miktar))) {
      return void hatalar.push({ line, sku, kod: 'qtyMustBeNumber' })
    }
    const n = Number(miktar)
    if (!Number.isInteger(n) || n < 0 || n > MAKS_ADET) return void hatalar.push({ line, sku, kod: 'qtyOutOfRange' })
    sonuc.push({ line, sku, newQty: n })
  })

  return { ok: true, satirlar: sonuc, hatalar }
}
