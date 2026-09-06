/**
 * INV-SIPARIS-NO-1 — sipariş numarası müşteriye TEK ve TAM biçimde gösterilir.
 *
 * OLAY (ölçülmüş, 2026-09-06 · REC-156):
 *
 * 1) **ÜRETİM bozuktu.** `generate_order_number()` son dört haneyi
 *    `EXTRACT(EPOCH FROM NOW())::BIGINT % 10000` ile üretiyordu — sayaç değil SAAT.
 *    Prod'da salt-okuma kanıt (hiçbir şey yazılmadan):
 *      `SELECT generate_order_number(), generate_order_number(), generate_order_number();`
 *      → `VH-20260906-9343` × 3 — **üçü de AYNI**.
 *    `venthub_orders_order_number_key` UNIQUE olduğu için çakışma mükerrer kayıt değil
 *    **INSERT HATASI** üretirdi → müşterinin siparişi patlardı.
 *
 * 2) **GÖSTERİM çelişkiliydi.** 14 çağrı yeri, iki yöntem:
 *      `split('-')[1]`   → `VH-20260818-4215` içinden **20260818** = TARİH
 *                          (aynı gün sipariş veren HERKES aynı "numarayı" görüyordu)
 *      `split('-').pop()` → **4215**
 *    `AccountOverviewPage` içinde **ikisi birden** vardı (satır 233 ↔ 315).
 *
 * ⭐BU KAPININ ÖLÇTÜĞÜ ŞEY, AÇIKÇA: **kodda kesme kalmadığını** ölçer. Üretimin
 * doğruluğunu ölçemez — o, migration uygulandıktan sonra SQL ile kanıtlanır
 * (`supabase/migrations/20260906043551_…sql` içindeki KANIT bloğu). "Kapı yeşil" =
 * "numaralar tekil" DEMEK DEĞİLDİR; iki katman ayrıdır ve birbirinin yerine geçmez.
 *
 * KAPSAM: müşteri yüzeyi = `src/views/**` + `src/app/**` + `supabase/functions/**`.
 * `src/views/admin/**` HARİÇ — ADMIN şeridinin dosyası; aynı kusur orada da var,
 * OPS kayda aldı, bu kapı ona hüküm VERMEZ (dokunulmadı).
 */
import { readdirSync,readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { siparisNoGoster } from '../../utils/siparisNo'

const KOK = process.cwd()
/** Yorum ANLATIR, kural UYGULAR — ölçüt daima gövdede koşar. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** `order_number` üzerinde ELLE kesme: bu kusurun imzası. */
const KESME = /order_number[^\n]{0,40}\.split\(\s*['"]-['"]\s*\)/g

function dosyalar(dizin: string, biriktir: string[] = []): string[] {
  for (const e of readdirSync(dizin, { withFileTypes: true })) {
    const tam = join(dizin, e.name)
    if (e.isDirectory()) {
      // admin = BAŞKA ŞERİT · __tests__ = kapının kendi gövdesi
      if (e.name !== 'admin' && e.name !== '__tests__' && e.name !== 'node_modules') {
        dosyalar(tam, biriktir)
      }
    } else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) {
      biriktir.push(tam)
    }
  }
  return biriktir
}

const MUSTERI_YUZEYI = [
  join(KOK, 'src', 'views'),
  join(KOK, 'src', 'app'),
  join(KOK, 'supabase', 'functions'),
]

describe('INV-SIPARIS-NO-1 · sipariş numarası kesilmez, tam gösterilir', () => {
  const kaynaklar = MUSTERI_YUZEYI.flatMap((d) => dosyalar(d)).map((yol) => ({
    yol: yol.replace(KOK, '').replace(/\\/g, '/'),
    kod: govde(readFileSync(yol, 'utf8')),
  }))

  it('⭐ASIL İDDİA — müşteri yüzeyinde `order_number.split("-")` YOK', () => {
    const isabetler: string[] = []
    for (const { yol, kod } of kaynaklar) {
      for (const m of kod.matchAll(KESME)) isabetler.push(`${yol}: ${m[0]}`)
    }
    expect(
      isabetler,
      'Siparis numarasi ELLE kesiliyor. split("-")[1] TARIHI basar (ayni gun herkes ayni),\n' +
        'split("-").pop() kimligin yarisini atar. Musteri yuzeyinde TAM numara gosterilir;\n' +
        'vitrin tarafinda `siparisNoGoster` kullan.\nIsabetler:\n  ' + isabetler.join('\n  '),
    ).toEqual([])
  })

  it('⭐YARDIMCI TAM NUMARAYI DÖNDÜRÜR — kısaltmaz, `#` eklemez', () => {
    expect(siparisNoGoster('VH-20260818-4215', 'abc-def-12345678')).toBe('VH-20260818-4215')
    // Bosluklu deger temizlenir ama KISALTILMAZ.
    expect(siparisNoGoster('  VH-20260818-4215  ', null)).toBe('VH-20260818-4215')
    // `#` onegi EKLENMEZ: tam numara zaten VH- ile baslar.
    expect(siparisNoGoster('VH-20260818-4215', null).startsWith('#')).toBe(false)
  })

  it('⭐YEDEK YOL — numara yoksa kimliğin son 8 hanesi, boş etiket DEĞİL', () => {
    expect(siparisNoGoster(null, 'abcdef-0123456789abcdef')).toBe('89ABCDEF')
    expect(siparisNoGoster('', 'abcdef-0123456789abcdef')).toBe('89ABCDEF')
    // Ikisi de yoksa bos doner — cagiran taraf satiri hic cizmemeli.
    expect(siparisNoGoster(null, null)).toBe('')
  })

  it('⭐SÖZLÜKTE GÖMÜLÜ `#` KALMADI — "#VH-2026…" gibi okunmasın', () => {
    for (const dil of ['tr', 'en']) {
      const sozluk = readFileSync(join(KOK, 'src', 'i18n', 'dictionaries', `${dil}.ts`), 'utf8')
      for (const anahtar of ['orderNoSuffix', 'orderHash']) {
        const satir = sozluk.split('\n').find((s) => s.includes(`${anahtar}:`)) ?? ''
        expect(
          /#\{\{code\}\}/.test(satir),
          `${dil}.${anahtar}: '#' gomulu kalmis — tam numarayla "#VH-2026…" diye okunur.`,
        ).toBe(false)
      }
    }
  })

  it('⭐DÖRT E-POSTA İŞLEVİ AYNI BİÇİMİ KULLANIR (Deno import edemez, kopya kaçınılmaz)', () => {
    // Edge islevleri src/ ten import EDEMEZ (ayri Deno bundle). Kopya kacinilmaz;
    // o yuzden kopyalarin AYNI kaldigi OLCULUR — yoksa biri sessizce geride kalir.
    const islevler = ['delivery-notification', 'order-confirmation', 'return-status-notification', 'shipping-notification']
    for (const islev of islevler) {
      const kod = govde(readFileSync(join(KOK, 'supabase', 'functions', islev, 'index.ts'), 'utf8'))
      expect(
        /const\s+siparisNo\s*=\s*order_number\s*\?\s*String\(order_number\)\.trim\(\)/.test(kod),
        `${islev}: TAM numara bicimi yok — e-postada yanlis/kesik numara gider.`,
      ).toBe(true)
      expect(
        /prettyOrderNo/.test(kod),
        `${islev}: yaniltici eski ad 'prettyOrderNo' geri gelmis (deger artik TAM numara).`,
      ).toBe(false)
    }
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor', () => {
    expect(kaynaklar.length, 'Musteri yuzeyi hic okunmadi.').toBeGreaterThan(100)
    expect(
      kaynaklar.some((k) => /order_number/.test(k.kod)),
      'Hicbir dosyada order_number gorunmuyor — evren yanlis.',
    ).toBe(true)
  })
})
