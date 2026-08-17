import { describe, expect, it } from 'vitest'

/**
 * INV-ORDER-DICT-1 — `venthub_orders`'a yazılan durum değerleri DB SÖZLÜĞÜNDEN gelir.
 *
 * NİÇİN VAR (M2 · 20-madde v2 · 2026-08-17)
 *
 * `order-housekeeping` ödenmemiş siparişi kapatırken `{ status: 'failed' }` yazıyordu.
 * Canlı kısıt (`venthub_orders_status_check`) bu değeri KABUL ETMEZ — `failed` bir
 * `payment_status` değeridir, `status` değeri değil. Yani PATCH daima 400 dönüyordu.
 * Tek başına bu bile bir hata; asıl zarar İKİNCİ kusurla birleşince çıktı:
 * `.catch(() => {})` hatayı yutuyordu ve sipariş id'si yine `failed[]` listesine
 * eklenip fonksiyon `{ ok: true }` raporluyordu.
 *
 * Sonuç: sipariş sonsuza kadar `pending` kalıyor, rapor ise her koşuda "başarıyla
 * sonlandırıldı" diyor. Hiçbir alarm çalmaz, çünkü çıktı BAŞARILI görünür. Bu, bu
 * depodaki en pahalı hata sınıfı: **sessiz sahte-başarı**.
 *
 * Bu kapı sınıfı kökten kapatır: DB'nin kabul etmediği bir durum değeri koda giremez.
 * (Kardeş kural: INV-EDGE-ROLE-1 — rol literali de DB sözlüğünden gelmek zorundadır.)
 *
 * ── DEDEKTÖR TASARIMI ───────────────────────────────────────────────────────────
 * Naif `status:\s*'x'` taraması ÇALIŞMAZ: edge fonksiyonları YANIT gövdelerinde de
 * `status` alanı kullanıyor (`status:'success'`, `status:'already_refunded'`,
 * `status:'yok'`) ve bunlar tablo değeri değildir — ölçüldü, 15 literalin çoğu bu sınıf.
 * Bu yüzden dedektör yalnız **venthub_orders'a YAZAN ifadeleri** hedefler:
 *   · supabase-js:  .from('venthub_orders') … .update({ … })
 *   · PostgREST:    venthub_orders?… PATCH … body: JSON.stringify({ … })
 * ve yalnız o nesne gövdesindeki literalleri toplar.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

// Negatif glob: e2e yardımcısı `_shared/` içine geçici `*.compiled.<rastgele>.ts` yazıp
// siler; eager glob onu okumadan kaybedip ENOENT ile patlıyordu (#571/#577 sınıfı).
const edgeSources = import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * 2026-08-17'de CANLI DB'den ölçüldü (pg_constraint):
 *   venthub_orders_status_check         → aşağıdaki DURUM_SOZLUGU
 *   venthub_orders_payment_status_check → aşağıdaki ODEME_SOZLUGU
 * Kısıt değişirse bu listeler elle güncellenir; o an testin kırmızı yanması İSTENEN
 * davranıştır (sözlük kodda sessizce genişlemesin).
 */
const DURUM_SOZLUGU = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
const ODEME_SOZLUGU = ['pending', 'paid', 'failed', 'refunded', 'partial_refunded'] as const

/** Yorumları boşlukla değiştirir; satır numaraları korunur. CRLF'e dayanıklı (`[^\n]*`). */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '))
}

type Yazim = { alan: 'status' | 'payment_status'; deger: string }

/** venthub_orders'a YAZAN ifadelerdeki durum literallerini toplar. */
function orderYazimlari(code: string): Yazim[] {
  const bulunan: Yazim[] = []
  const govdeler: string[] = []

  // supabase-js: .from('venthub_orders') ... .update({ ... })
  for (const m of code.matchAll(
    /\.from\(\s*['"]venthub_orders['"]\s*\)[\s\S]{0,300}?\.update\(\s*\{([\s\S]{0,400}?)\}/g,
  )) {
    govdeler.push(m[1])
  }
  // PostgREST: venthub_orders?... (PATCH) ... body: JSON.stringify({ ... })
  for (const m of code.matchAll(
    /venthub_orders\?[\s\S]{0,800}?body:\s*JSON\.stringify\(\s*\{([\s\S]{0,400}?)\}/g,
  )) {
    govdeler.push(m[1])
  }

  for (const g of govdeler) {
    for (const m of g.matchAll(/(^|[^_\w])(payment_status|status)\s*:\s*['"]([^'"]+)['"]/g)) {
      bulunan.push({ alan: m[2] as Yazim['alan'], deger: m[3] })
    }
  }
  return bulunan
}

const kaynaklar = Object.entries(edgeSources)
  .filter(([k]) => k.endsWith('/index.ts'))
  .map(([k, v]) => ({ path: k, code: stripComments(v) }))

describe('INV-ORDER-DICT-1 · sipariş durum değerleri DB sözlüğünden gelir', () => {
  it('dedektör çalışıyor: venthub_orders yazımı bulunabiliyor', () => {
    // Sıfır bulmak "temiz" değil, "dedektör kör" demektir — kuralın en olası sessiz ölümü.
    const yazanlar = kaynaklar.filter((s) => orderYazimlari(s.code).length > 0)
    expect(
      yazanlar.map((s) => s.path).sort(),
      'Hiçbir edge fonksiyonunda venthub_orders yazımı bulunamadı. Yazma biçimi ' +
        'değiştiyse `orderYazimlari` güncellenmeli — boş liste kapı kapandı DEMEK DEĞİLDİR.',
    ).not.toEqual([])
  })

  it('yazılan `status` değerleri sözlükte', () => {
    const ihlaller: string[] = []
    for (const s of kaynaklar) {
      for (const y of orderYazimlari(s.code)) {
        if (y.alan === 'status' && !(DURUM_SOZLUGU as readonly string[]).includes(y.deger)) {
          ihlaller.push(`${s.path}: status='${y.deger}'`)
        }
      }
    }
    expect(
      [...new Set(ihlaller)].sort(),
      [
        'venthub_orders.status alanına SÖZLÜK DIŞI bir değer yazılıyor.',
        '',
        'DB kısıtı bu değeri reddeder (PATCH 400) — ve hata yutulursa sipariş eski',
        'durumunda kalırken fonksiyon BAŞARILI raporlar. M2 tam olarak buydu:',
        "`status:'failed'` yazılıyordu ama `failed` bir payment_status değeridir.",
        '',
        `İzinli status: ${DURUM_SOZLUGU.join(', ')}`,
        `İzinli payment_status: ${ODEME_SOZLUGU.join(', ')}`,
        '',
        "Ödenmemiş siparişi sonlandırma deseni: { status:'cancelled', payment_status:'failed' }",
        ...new Set(ihlaller),
      ].join('\n'),
    ).toEqual([])
  })

  it('yazılan `payment_status` değerleri sözlükte', () => {
    const ihlaller: string[] = []
    for (const s of kaynaklar) {
      for (const y of orderYazimlari(s.code)) {
        if (y.alan === 'payment_status' && !(ODEME_SOZLUGU as readonly string[]).includes(y.deger)) {
          ihlaller.push(`${s.path}: payment_status='${y.deger}'`)
        }
      }
    }
    expect(
      [...new Set(ihlaller)].sort(),
      `venthub_orders.payment_status'a sözlük dışı değer. İzinli: ${ODEME_SOZLUGU.join(', ')}`,
    ).toEqual([])
  })

  it('kendi kendini doğrular: yanıt gövdesindeki `status` alanı YAZIM sayılmaz', () => {
    // Yanlış-pozitif kontrolü — bu ayrım kuralın kullanılabilirliğinin şartı.
    const yanit = "return json({ status: 'already_refunded', order_id: id }, 200)"
    expect(orderYazimlari(yanit)).toEqual([])

    // Gerçek yazımlar YAKALANMALI (iki biçim de).
    const restYazim =
      "fetch(`${u}/rest/v1/venthub_orders?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'failed' }) })"
    expect(orderYazimlari(restYazim)).toEqual([{ alan: 'status', deger: 'failed' }])

    const jsYazim = ".from('venthub_orders').update({ status: 'cancelled', payment_status: 'failed' })"
    expect(orderYazimlari(jsYazim)).toEqual([
      { alan: 'status', deger: 'cancelled' },
      { alan: 'payment_status', deger: 'failed' },
    ])
  })
})
