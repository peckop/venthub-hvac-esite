import { describe, expect, it } from 'vitest'

/**
 * INV-PERMISSIONS-POLICY-1 · Permissions-Policy başlığı (kalıcı bekçi) — cetvel:
 * `docs/standards/csp-standard.md` §8 (ALT-57, OPS-104 K-038).
 *
 * KORUDUĞU KUSUR SINIFI (iki yönlü):
 *  (a) başlık sessizce düşer: `next.config.mjs` `headers()` içinden satır silinir ya da
 *      `camera/microphone/geolocation` bir daha açılır, hiçbir test görmez; tarayıcı yine
 *      çalışır ve ZAP/OWASP taraması "başlık YOK" der (REC-337 bulgusu, düzeltmesi açılmamıştı).
 *  (b) kod kapatılmış bir özelliğe bağlanır: biri `navigator.geolocation` ya da bir iframe'e
 *      `allow="camera"` yazar, başlık o özelliği kapattığı için tarayıcı isteği SESSİZCE reddeder
 *      ve sebep ancak canlıda görünür. Bu dosya o noktada kırmızı yanıp başlığın da kararla
 *      güncellenmesini ister.
 *
 * `payment` direktifi BİLEREK başlıkta yok (next.config.mjs yorumu): İyzico formu çapraz kaynaklı
 * iframe'de açılıyor ve gerçek host'u secret'ten kurulur. Biri `payment=(self)` yazarsa bu bekçi
 * kırmızı verir (aşağıdaki üçüncü madde); ölçülüp yazılacaksa en az bir açık origin içermelidir.
 *
 * TARAMANIN KAPSAMI — ölçmediğim sınıfı adıyla yazıyorum:
 *  KAPSAR   : `src/**` altındaki `.ts/.tsx` (test dosyaları ve satır/blok yorumları hariç) içinde
 *             `getUserMedia`, `mediaDevices`, `BarcodeDetector`, `navigator.geolocation`,
 *             `watchPosition`, `getCurrentPosition` ve `allow="..."` değerinde camera/microphone/geolocation.
 *  KAPSAMAZ : üçüncü parti betiğin KENDİ açtığı iframe'ler ve çalışma anında dizeyle kurulan
 *             `allow` değerleri; tırnak içindeki `//` sonrası aynı satırda kalan kod (yorum ayıklama
 *             kaba); `public/**` ve `supabase/functions/**` (sunucu tarafı).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// TAM literal yol şart: `/next.config.*` Orion'un ürettiği `next.config.md` companion'ını da yakalar.
const CONFIG_FILES: Record<string, string> = import.meta.glob('/next.config.mjs', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const CONFIG: string = CONFIG_FILES['/next.config.mjs'] ?? ''

/** Başlık değerini `direktif → izin listesi` haritasına çevirir; başlık yoksa null. */
function parsePermissionsPolicy(config: string): Record<string, string> | null {
  const m = config.match(/key:\s*'Permissions-Policy'[\s\S]{0,600}?value:\s*'([^']+)'/)
  if (!m) return null
  const out: Record<string, string> = {}
  for (const part of m[1].split(',')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

/** Kaba yorum ayıklama: satır yorumu ve blok yorumu. Kod satırının sonuna sığan `//` URL'leri aşağıdaki sınırdır. */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

const KAPALI = ['camera', 'microphone', 'geolocation'] as const

describe('INV-PERMISSIONS-POLICY-1 · Permissions-Policy başlığı', () => {
  const policy = parsePermissionsPolicy(CONFIG)

  it('next.config.mjs bir Permissions-Policy başlığı gönderiyor', () => {
    expect(
      policy,
      "next.config.mjs `headers()` içinde key: 'Permissions-Policy' satırı yok (ALT-57, cetvel csp-standard.md §8)",
    ).not.toBeNull()
  })

  it.each(KAPALI)('%s kapalı: izin listesi boş `()`', (ozellik) => {
    expect(
      policy?.[ozellik],
      `Permissions-Policy içinde ${ozellik}=() olmalı; bugünkü değer: ${String(policy?.[ozellik])}`,
    ).toBe('()')
  })

  it('payment varsa yalnız (self) olamaz: İyzico iframe\'inin devrini kapatır (ALT-63 ölçümü olmadan yazılmaz)', () => {
    const odeme = policy?.payment
    if (odeme === undefined) return
    expect(
      odeme,
      "payment=(self) İyzico'nun çapraz kaynaklı iframe'ine ödeme yetkisinin devrini kapatır; en az bir açık origin yazılmalı",
    ).toMatch(/"https:\/\/[^"]+"/)
  })

  it('kaynakta kapatılan özellikleri kullanan kod yok (kullanılırsa başlık da kararla güncellenir)', () => {
    const KULLANIM = /getUserMedia|mediaDevices|BarcodeDetector|navigator\.geolocation|watchPosition|getCurrentPosition/
    const ALLOW = /allow=["'{`][^"'`}]*\b(camera|microphone|geolocation)\b/
    const ihlaller: string[] = []
    for (const [yol, kaynak] of Object.entries(SOURCES)) {
      if (yol.includes('/__tests__/') || /\.(test|spec)\.tsx?$/.test(yol)) continue
      const temiz = yorumsuz(kaynak)
      if (KULLANIM.test(temiz)) ihlaller.push(`${yol}: kapalı özellik API'si`)
      if (ALLOW.test(temiz)) ihlaller.push(`${yol}: iframe allow= camera/microphone/geolocation`)
    }
    expect(
      ihlaller,
      'Bu özellikler Permissions-Policy ile kapalı; kullanılacaksa önce next.config.mjs başlığı ve csp-standard.md §8 kararla güncellenir',
    ).toEqual([])
  })
})
