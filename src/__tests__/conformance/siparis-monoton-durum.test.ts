// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { odemeGecisiIzinliMi, siparisGecisiIzinliMi } from '../../../supabase/functions/_shared/siparis_gecis'
import {
  isOrderDbTransitionAllowed,
  isPaymentDbTransitionAllowed,
  ORDER_DB_STATUSES,
  PAYMENT_DB_STATUSES,
} from '../../lib/admin/orderStatusDomain'

/**
 * INV-SIPARIS-MONOTON-1 · sipariş ve ödeme durumu VERİTABANI katmanında monotondur (ALT-131 / ALT-133)
 *
 * NİÇİN: kural 11 ("sipariş durumları yalnız ileri") yalnız istemci makinesinde ve tek tek yazıcılarda
 * yaşıyordu; veritabanında geçiş kapısı yoktu (kargo iptali teslim edilmiş siparişi `confirmed`e geri
 * sarıyor, `sync_payment_status_with_status` parasız `paid` üretiyordu). Onarım migration
 * `20261103120000_venthub_orders_monoton_durum.sql`: BEFORE UPDATE tetiği + parasız-paid tetiğinin düşürülmesi.
 *
 * Bu kapı STATİKTİR: migration metnindeki izin tablolarını okur ve BU DOSYADA bağımsız yazılmış doğruluk
 * tablosuyla her çifti (6x6 durum, 5x5 ödeme) karşılaştırır; ayrıca migration ↔ edge ortak modülü ↔ src
 * etki alanı üç kopyasının ayrışmasını yakalar. Canlı davranışı migration'ın kendi doğrulama bloğu ölçer.
 * Sabotaj kolu: tablo bozulunca `ihlalleriBul` GERÇEKTEN dolu döner (aşağıda mutasyon testleri).
 */

const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const MIGRASYON = '20261103120000_venthub_orders_monoton_durum.sql'

const oku = (p: string): string => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
const yorumsuz = (s: string): string => s.replace(/--[^\n]*/g, '')

// ── Bağımsız doğruluk tablosu (kodun yaptığı gibi YENİDEN HESAPLANMAZ; elle yazılmış çiftler) ──
const DURUM_IZINLI_CIFTLER: ReadonlyArray<[string, string]> = [
  ['pending', 'confirmed'], ['pending', 'cancelled'],
  ['confirmed', 'processing'], ['confirmed', 'shipped'], ['confirmed', 'cancelled'],
  ['processing', 'shipped'], ['processing', 'cancelled'],
  ['shipped', 'delivered'], ['shipped', 'cancelled'],
]
const ODEME_IZINLI_CIFTLER: ReadonlyArray<[string, string]> = [
  ['pending', 'paid'], ['pending', 'failed'],
  ['failed', 'paid'],
  ['paid', 'partial_refunded'], ['paid', 'refunded'],
  ['partial_refunded', 'refunded'],
]

type Tablo = Record<string, string[]>

/** Migration metninden iki jsonb izin tablosunu çıkarır. Bulunamazsa null. */
function izinTablolariniCikar(sql: string): { durum: Tablo; odeme: Tablo } | null {
  const govde = yorumsuz(sql)
  const bul = (ad: string): Tablo | null => {
    const m = govde.match(new RegExp(`${ad}\\s+constant\\s+jsonb\\s*:=\\s*'(\\{[\\s\\S]*?\\})'\\s*::jsonb`, 'i'))
    if (!m) return null
    try {
      return JSON.parse(m[1]) as Tablo
    } catch {
      return null
    }
  }
  const durum = bul('v_durum_izin')
  const odeme = bul('v_odeme_izin')
  return durum && odeme ? { durum, odeme } : null
}

const izinli = (t: Tablo, a: string, b: string): boolean =>
  a === b ? Object.prototype.hasOwnProperty.call(t, a) : (t[a] ?? []).includes(b)

/** Tüm çiftleri doğruluk tablosuna karşı sınar; ihlal listesi döner (boş = temiz). */
function ihlalleriBul(sql: string): string[] {
  const t = izinTablolariniCikar(sql)
  if (!t) return ['izin tabloları migration metninde bulunamadı']
  const ihlal: string[] = []
  const beklenen = (liste: ReadonlyArray<[string, string]>, a: string, b: string): boolean =>
    a === b || liste.some(([x, y]) => x === a && y === b)
  for (const a of ORDER_DB_STATUSES)
    for (const b of ORDER_DB_STATUSES)
      if (izinli(t.durum, a, b) !== beklenen(DURUM_IZINLI_CIFTLER, a, b)) ihlal.push(`status ${a}->${b}`)
  for (const a of PAYMENT_DB_STATUSES)
    for (const b of PAYMENT_DB_STATUSES)
      if (izinli(t.odeme, a, b) !== beklenen(ODEME_IZINLI_CIFTLER, a, b)) ihlal.push(`payment ${a}->${b}`)
  return ihlal
}

const migrasyonSql = (): string => oku(path.join(MIG_DIZIN, MIGRASYON))

describe('INV-SIPARIS-MONOTON-1 — izin tabloları (migration)', () => {
  it('R0 — migration dosyası var ve izin tabloları çıkarılabiliyor (sahte-yeşil kilidi)', () => {
    expect(fs.existsSync(path.join(MIG_DIZIN, MIGRASYON))).toBe(true)
    const t = izinTablolariniCikar(migrasyonSql())
    expect(t, 'v_durum_izin / v_odeme_izin jsonb sabitleri bulunamadı — desen tutmuyor').not.toBeNull()
    expect(Object.keys(t!.durum).sort()).toEqual([...ORDER_DB_STATUSES].sort())
    expect(Object.keys(t!.odeme).sort()).toEqual([...PAYMENT_DB_STATUSES].sort())
  })

  it('R1 — 36 status çifti ve 25 ödeme çiftinin HEPSİ doğruluk tablosuyla aynı', () => {
    expect(ihlalleriBul(migrasyonSql())).toEqual([])
    // doğruluk tablosunun kendisi boş değil (kendini doğrulayan tablo kilidi)
    expect(DURUM_IZINLI_CIFTLER).toHaveLength(9)
    expect(ODEME_IZINLI_CIFTLER).toHaveLength(6)
  })

  it('R2 — OPS kararları: geri sarma yok, teslim/iptal çıkışsız, ödenmemişe iade yok, pending kargolanamaz', () => {
    const t = izinTablolariniCikar(migrasyonSql())!
    expect(izinli(t.durum, 'delivered', 'cancelled'), 'kargo iptali/iade teslimi geri alamaz').toBe(false)
    expect(izinli(t.durum, 'delivered', 'confirmed')).toBe(false)
    expect(izinli(t.durum, 'shipped', 'confirmed'), 'kargo iptali status geri sarmaz').toBe(false)
    expect(izinli(t.durum, 'cancelled', 'shipped')).toBe(false)
    expect(izinli(t.durum, 'cancelled', 'pending')).toBe(false)
    expect(izinli(t.durum, 'pending', 'shipped'), 'ödenmemiş sipariş kargoya verilemez').toBe(false)
    expect(izinli(t.odeme, 'pending', 'refunded'), 'ödenmemişe iade yazılamaz').toBe(false)
    expect(izinli(t.odeme, 'pending', 'partial_refunded')).toBe(false)
    expect(izinli(t.odeme, 'failed', 'refunded')).toBe(false)
    expect(izinli(t.odeme, 'refunded', 'paid')).toBe(false)
    expect(izinli(t.odeme, 'paid', 'refunded'), 'teslim sonrası iade: yalnız ödeme refunded olur').toBe(true)
  })

  it('R3 — üç kopya (migration ↔ edge ortak modül ↔ src etki alanı) her çiftte AYNI', () => {
    const t = izinTablolariniCikar(migrasyonSql())!
    for (const a of ORDER_DB_STATUSES)
      for (const b of ORDER_DB_STATUSES) {
        const sql = izinli(t.durum, a, b)
        expect(siparisGecisiIzinliMi(a, b), `edge modülü status ${a}->${b}`).toBe(sql)
        expect(isOrderDbTransitionAllowed(a, b), `src etki alanı status ${a}->${b}`).toBe(sql)
      }
    for (const a of PAYMENT_DB_STATUSES)
      for (const b of PAYMENT_DB_STATUSES) {
        const sql = izinli(t.odeme, a, b)
        expect(odemeGecisiIzinliMi(a, b), `edge modülü payment ${a}->${b}`).toBe(sql)
        expect(isPaymentDbTransitionAllowed(a, b), `src etki alanı payment ${a}->${b}`).toBe(sql)
      }
    // NULL ödeme durumu 'pending' sayılır — iki kopya da
    expect(odemeGecisiIzinliMi(null, 'paid')).toBe(true)
    expect(isPaymentDbTransitionAllowed(null, 'paid')).toBe(true)
    expect(odemeGecisiIzinliMi(null, 'refunded')).toBe(false)
  })
})

describe('INV-SIPARIS-MONOTON-1 — tetik biçimi ve ALT-133', () => {
  const sql = (): string => yorumsuz(migrasyonSql()).toLowerCase().replace(/\s+/g, ' ')

  it('R4 — tetik yalnız status/payment_status değişiminde, BEFORE UPDATE, satır bazlı', () => {
    const s = sql()
    expect(s).toMatch(/create trigger trg_orders_monoton_durum before update of status, payment_status on public\.venthub_orders for each row when \(old\.status is distinct from new\.status or old\.payment_status is distinct from new\.payment_status\) execute function public\.venthub_orders_monoton_durum\(\)/)
  })

  it('R5 — ihlal SQLSTATE VH409 ile düşer ve tetik fonksiyonu anon/oturumludan kapalı', () => {
    const s = sql()
    expect(s).toContain("errcode = 'vh409'")
    expect(s).toContain('alt131_monoton:')
    expect(s).toContain('revoke all on function public.venthub_orders_monoton_durum() from public, anon, authenticated')
  })

  it('R6 — migration kendi davranışını doğruluyor (VH409 beklenir, tutmazsa coker)', () => {
    const s = sql()
    expect(s).toMatch(/raise exception 'alt-131 davranis dogrulamasi basarisiz/)
    expect(s).toContain("if v_kod <> 'vh409'")
  })

  it('R7 — ALT-133: parasız paid tetikleri ve fonksiyonu düşürülüyor; zincirin SONUNDA fonksiyon yok', () => {
    const s = sql()
    expect(s).toContain('drop trigger if exists trg_sync_payment_status_ins on public.venthub_orders')
    expect(s).toContain('drop trigger if exists trg_sync_payment_status_upd on public.venthub_orders')

    // Zincirdeki SON olay: fonksiyonu yaratan migration'lardan sonra bir DROP gelmiş olmalı.
    const dosyalar = fs.readdirSync(MIG_DIZIN).filter((a) => a.endsWith('.sql')).sort()
    let son: 'create' | 'drop' | null = null
    for (const ad of dosyalar) {
      const g = yorumsuz(oku(path.join(MIG_DIZIN, ad)))
      for (const m of g.matchAll(/(create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?sync_payment_status_with_status\b)|(drop\s+function\s+(?:if\s+exists\s+)?(?:public\.)?sync_payment_status_with_status\b)/gi)) {
        son = m[1] ? 'create' : 'drop'
      }
    }
    expect(son, 'sync_payment_status_with_status zincirin sonunda geri yaratılmış (parasız paid kaynağı)').toBe('drop')

    // Zincirde bu fonksiyona bağlanan bir tetik, migration'dan SONRA yeniden yaratılmamış olmalı.
    const sonrasi = dosyalar.filter((a) => a > MIGRASYON)
    for (const ad of sonrasi) {
      expect(yorumsuz(oku(path.join(MIG_DIZIN, ad))), `${ad} parasız-paid tetiğini geri getiriyor`).not.toMatch(
        /execute\s+(?:function|procedure)\s+(?:public\.)?sync_payment_status_with_status/i,
      )
    }
  })
})

describe('INV-SIPARIS-MONOTON-1 — SABOTAJ kolu (kural sökülünce kapı KIRMIZI olmalı)', () => {
  const orijinal = (): string => migrasyonSql()

  it('temiz migration: ihlal yok (kontrol kolu)', () => {
    expect(ihlalleriBul(orijinal())).toEqual([])
  })

  it('delivered -> cancelled izni eklenirse yakalanır', () => {
    const bozuk = orijinal().replace(/"delivered":\s*\[\]/, '"delivered": ["cancelled"]')
    expect(bozuk).not.toBe(orijinal())
    expect(ihlalleriBul(bozuk)).toContain('status delivered->cancelled')
  })

  it('shipped -> confirmed (kargo iptali geri sarma) izni eklenirse yakalanır', () => {
    const bozuk = orijinal().replace(/"shipped":\s*\["delivered", "cancelled"\]/, '"shipped": ["delivered", "cancelled", "confirmed"]')
    expect(bozuk).not.toBe(orijinal())
    expect(ihlalleriBul(bozuk)).toContain('status shipped->confirmed')
  })

  it('pending -> refunded (ödenmemişe iade) izni eklenirse yakalanır', () => {
    const bozuk = orijinal().replace(/"pending":\s*\["paid", "failed"\]/, '"pending": ["paid", "failed", "refunded"]')
    expect(bozuk).not.toBe(orijinal())
    expect(ihlalleriBul(bozuk)).toContain('payment pending->refunded')
  })

  it('meşru bir geçiş (confirmed -> processing) silinirse yakalanır', () => {
    const bozuk = orijinal().replace('"confirmed":  ["processing", "shipped", "cancelled"]', '"confirmed":  ["shipped", "cancelled"]')
    expect(bozuk).not.toBe(orijinal())
    expect(ihlalleriBul(bozuk)).toContain('status confirmed->processing')
  })

  it('tablo metni hiç bulunamazsa sessiz yeşil DEĞİL, ihlal döner', () => {
    expect(ihlalleriBul('-- boş')).toEqual(['izin tabloları migration metninde bulunamadı'])
  })
})

describe('INV-SIPARIS-MONOTON-1 — yazıcılar kapıya uyuyor', () => {
  const fonk = (ad: string): string => yorumsuz(oku(path.join(KOK, 'supabase', 'functions', ad, 'index.ts')).replace(/\/\/[^\n]*/g, ''))

  it('admin-update-shipping: kargo iptali status GERİ SARMAZ ve ortak karar modülünü kullanır', () => {
    const s = fonk('admin-update-shipping')
    expect(s).toContain('kargoIptaliKarari')
    expect(s).toContain('kargolamaKarari')
    expect(s).toContain('monotonIhlaliMi')
    // eski geri sarma yazımı geri gelmesin
    expect(s).not.toMatch(/shipped_at:\s*null,\s*status:\s*'confirmed'/)
    expect(s).not.toMatch(/status:\s*'confirmed'/)
    // karar satırına bağlı koşullu yazım
    expect(s).toContain('status=eq.shipped')
    expect(s).toContain('status=in.(confirmed,processing)')
  })

  it('admin-update-order: varsayılan `paid` kalktı, sözlük doğrulaması ve 409 eşlemesi var', () => {
    const s = fonk('admin-update-order')
    expect(s).not.toMatch(/status\s*\|\|\s*'paid'/)
    expect(s).toContain('SIPARIS_DURUM_IZIN')
    expect(s).toContain('INVALID_TRANSITION')
  })
})
