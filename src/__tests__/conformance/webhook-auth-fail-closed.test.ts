import { describe, expect, it } from 'vitest'

/**
 * INV-WEBHOOK-1 · Supabase webhook kimlik doğrulaması FAIL-CLOSED olmalı.
 *
 * NİÇİN VAR: rota bir süre şu hâldeydi —
 *
 *     const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET
 *     if (expectedSecret && webhookSecret !== expectedSecret) { ...401... }
 *
 * `expectedSecret` tanımsızsa koşul hiç çalışmaz ve imza doğrulaması TAMAMEN atlanır:
 * yapılandırma eksikliği kapıyı sıkılaştırmak yerine SESSİZCE AÇAR. Repo public
 * olduğunda ve secret geçmişte düz metin bulunduğunda bunun bedeli doğrudan görünür
 * hâle geldi (kimliksiz çağrılarla sınırsız sayfa yenilemesi tetiklenebilir).
 *
 * Bu, projede bu hafta İKİ KEZ düzeltilen fail-open deseninin aynısı (shipping-webhook
 * replay guard'ı, T025-VH). Aynı hatanın üçüncü kez dönmemesi için kural artık test.
 *
 * Statik tarama tercih edildi: rotayı çağırmak `next/cache`, `next/server` ve Supabase
 * istemcisini ayağa kaldırmayı gerektirir; kilitlemek istediğimiz şey ise tek bir
 * KONTROL AKIŞI kararı — "env yoksa ne olur". Onu kaynakta görmek yeterli ve kırılgan değil.
 */

const ROUTE_PATH = '/src/app/api/webhook/supabase/route.ts'

const sources = import.meta.glob('/src/app/api/webhook/supabase/route.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * YORUMLARI ELE. Bu testin ilk sürümü kendi kırmızısını üretti: rotanın JSDoc'una yasak
 * deseni AÇIKLAMAK için `if (expectedSecret && …)` örneği yazılıydı ve tarama onu GERÇEK
 * kod sandı. Bu repoda benzeri yaşandı (companion `.md` içindeki `_shared/cors.ts` metni
 * edge deploy seçicisini yanıltmıştı). Statik tarayıcı, kodu AÇIKLAYAN metni koddan
 * ayırmak zorunda — yoksa iyi belgelenmiş kodu cezalandırır.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

describe('INV-WEBHOOK-1 · Supabase webhook fail-closed', () => {
  it('rota dosyası bulunabiliyor (stale-guard: yol değiştiyse test sessizce boşa düşmesin)', () => {
    expect(
      Object.keys(sources),
      `Webhook rotası ${ROUTE_PATH} yolunda bulunamadı — dosya taşındıysa bu testin globu da güncellenmeli, yoksa kural sessizce denetlenmez hâle gelir`,
    ).toContain(ROUTE_PATH)
  })

  it('secret env TANIMSIZSA istek reddedilir (fail-open geri gelmemeli)', () => {
    const src = stripComments(sources[ROUTE_PATH] ?? '')

    // Fail-open imzası: doğrulama, secret'ın VARLIĞINA koşullanmış.
    const failOpen = /if\s*\(\s*expectedSecret\s*&&/.test(src)
    expect(
      failOpen,
      'FAIL-OPEN GERİ GELDİ: doğrulama `if (expectedSecret && ...)` biçiminde secret\'ın varlığına koşullanmış. ' +
      'Env tanımsızsa koşul hiç çalışmaz ve imza denetimi TAMAMEN atlanır — yapılandırma eksikliği kapıyı açar. ' +
      'Doğrusu: önce `if (!expectedSecret) return 401`, sonra değer karşılaştırması.',
    ).toBe(false)

    // Fail-closed imzası: secret yoksa erken çıkış.
    const failClosed = /if\s*\(\s*!\s*expectedSecret\s*\)/.test(src)
    expect(
      failClosed,
      'Secret env tanımsızken erken-çıkış (`if (!expectedSecret)`) bulunamadı — env yokken isteğin reddedildiği garanti edilemiyor.',
    ).toBe(true)
  })

  it('yetkisiz istek 401 döner (200/sessiz-geçiş değil)', () => {
    const src = stripComments(sources[ROUTE_PATH] ?? '')
    expect(
      /status:\s*401/.test(src),
      'Yetkisiz istekte 401 dönüşü bulunamadı — doğrulama başarısız olduğunda istek REDDEDİLMELİ, sessizce işlenmemeli.',
    ).toBe(true)
  })
})
