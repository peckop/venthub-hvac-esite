import { describe, expect, it } from 'vitest'

/**
 * INV-OPS-1 — operasyon uçlarında "sessiz sahte-başarı" yasağı.
 *
 * NİÇİN VAR (T058-VH + T061-VH · operasyon döngüsü denetimi 2026-08-15 §4-§5)
 *
 * Bu dosyanın koruduğu dört kural aynı aileden: hepsi, sistemin **bir iş yaptığını
 * söylerken yapmadığı** durumları engeller. Denetimin baş bulgusu buydu ve dördü de
 * ölçülerek bulundu, tahmin edilerek değil:
 *
 *   1. `shipping-notification` gövdesinde GÖMÜLÜ kişisel bir e-posta vardı ve env
 *      tanımlı değilken her kargo bildiriminin kopyası oraya gidiyordu. Dahası,
 *      müşteri e-postası yoksa o adres BİRİNCİL alıcıya terfi ediyordu — yani
 *      müşterinin bildirimi başkasının kutusuna, müşteriye yazılmış gibi.
 *   2. `shipping-status` kullanılmayan, kimliksiz erişime açık bir uçtu ve takip
 *      numarasını bilen herkese sipariş durumu döndürüyordu.
 *   3. `admin-update-shipping` aynı takip numarasını N siparişe yazmayı kabul ediyordu;
 *      istemci düzeltildi ama sunucu müsamahakâr kaldı — ve istemci düzeltmesi kapı
 *      değildir (curl aynı ucu çağırır).
 *   4. `stock-alert` alıcı bulamayınca var olmayan bir adrese "gönderiyor" ve başarı
 *      sayıyordu; ayrıca sabit `lte 10` ön-filtresi, eşiği 10'dan büyük ürünleri
 *      alarm kapsamının TAMAMEN dışında bırakıyordu.
 *
 * Sınır: bu test statiktir, uçları ÇAĞIRMAZ. Çalışma-zamanı davranışı cetvel §4'teki
 * curl protokolüyle doğrulanır. Buradaki iş, düzeltmelerin sessizce geri alınmasını
 * engellemek.
 */

// Dizi-desenli aşırı yükleme (negatif `!` desenleri yalnız dizi biçiminde ifade edilebilir).
declare global {
  interface ImportMeta {
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

// `!` deseni ŞART (filtre yetmez): eager glob içeriği filtre çalışmadan okur.
// tests/e2e/helpers/denoRuntime.ts, _shared/ içine geçici `*.compiled.<rastgele>.ts`
// yazıp siler; paralel vitest'te glob o dosyayı görüp okuyamadan kaybediyordu (ENOENT).
const edgeSources = import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const workflowFiles = import.meta.glob('/.github/workflows/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Yorumları boşlukla değiştirir (satır numaraları korunur).
 *
 * ⚠️ Bu adım pazarlık konusu değil. 2026-08-16'da aynı sınıf hata DÖRT kez çıktı:
 * bir dedektör, kaldırılan kusuru ANLATAN yorumu kusurun kendisi sandı ya da
 * tersine, açıklayıcı bir yorum naif bir "var mı" iddiasını tatmin etti. Aşağıdaki
 * dosyaların hepsi kaldırılan kusuru gerekçesiyle birlikte anlatıyor — yani yorum
 * sıyrılmazsa bu testin TAMAMI yanlış sonuç verir.
 */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, p1: string) => p1)
}

function kod(path: string): string {
  const src = edgeSources[path]
  expect(src, `${path} bulunamadı — taşındıysa bu testi güncelle, silme.`).toBeTruthy()
  return stripComments(src)
}

describe('INV-OPS-1 · operasyon uçları sessizce sahte-başarı üretmez', () => {
  it('kaynak taraması gerçekten dosya buluyor (dedektör sağlığı)', () => {
    // Boş glob "her şey temiz" gibi görünür; bu testin en olası kör kalma biçimi budur.
    expect(Object.keys(edgeSources).length).toBeGreaterThan(20)
    expect(Object.keys(workflowFiles).length).toBeGreaterThan(5)
  })

  it('T061 · bildirim uçlarında GÖMÜLÜ kişisel e-posta yok', () => {
    // Gerçek kişi adresi ya da ölü kurumsal kutu — ikisi de koda YAZILMAZ.
    // Repo PUBLIC: gömülü kişisel adres kalıcı bir sızıntıdır.
    const yasak = /(recep\.varlik@|stok@venthub\.com)/i
    const ihlaller = Object.entries(edgeSources)
      .filter(([, src]) => yasak.test(stripComments(src)))
      .map(([p]) => p)
    expect(
      ihlaller,
      'Bir edge fonksiyonunda gömülü kişisel/ölü e-posta adresi var. Alıcılar env ya da ' +
        'veritabanı ayarından gelir; koda yazılan alıcı, kimsenin ayarlamadığı bir kopya ' +
        'üretir (ve ölü bir kutu alarmı sessizce yutar).',
    ).toEqual([])
  })

  it('T061 · işletme kopyası (BCC) birincil alıcıya TERFİ ETMEZ', () => {
    const src = kod('/supabase/functions/shipping-notification/index.ts')
    // Eski dal: `toList.push(bcc[0])` — müşterinin bildirimini işletme adresine,
    // müşteriye yazılmış gibi gönderiyordu.
    expect(
      /toList\.push\(\s*bcc\s*\[/.test(src),
      'BCC adresi TO listesine terfi ettiriliyor. Müşteri e-postası yoksa bildirim ' +
        'GÖNDERİLMEZ; başka bir adrese yönlendirmek hem eksik veriyi gizler hem de ' +
        'müşteri verisini yanlış kutuya taşır.',
    ).toBe(false)
  })

  it('T058 · kullanılmayan public uç `shipping-status` emekli (410) ve veri okumuyor', () => {
    const src = kod('/supabase/functions/shipping-status/index.ts')
    expect(/\b410\b/.test(src), 'shipping-status 410 Gone dönmüyor.').toBe(true)
    const veriIzleri = [
      { ad: 'sipariş okuma', re: /venthub_orders/ },
      { ad: 'supabase istemcisi', re: /createClient\s*\(/ },
    ].filter((k) => k.re.test(src))
    expect(
      veriIzleri.map((k) => k.ad),
      'Emekli uç hâlâ veriye dokunuyor. Kimliksiz bir uçta bunun tek anlamı, takip ' +
        'numarasını tahmin eden herkesin sipariş verisi okuyabilmesidir.',
    ).toEqual([])
  })

  it('T058 · sunucu aynı takip numarasını ikinci siparişe SESSİZCE yazmaz', () => {
    const src = kod('/supabase/functions/admin-update-shipping/index.ts')
    expect(
      /tracking_number_in_use/.test(src),
      'admin-update-shipping mükerrer takip numarasını reddetmiyor. İstemci tarafındaki ' +
        'düzeltme kapı değildir — aynı ucu curl\'leyen ya da eski bir sekme kullanan ' +
        'aynı veri bozulmasını üretir (farklı müşterilere aynı takip linki).',
    ).toBe(true)
    expect(
      /allow_shared_tracking/.test(src),
      'Açık niyet beyanı (`allow_shared_tracking`) yok. Tek kolide birleştirme gerçek bir ' +
        'lojistik senaryosu; koşulsuz yasak yanlış olur. Doğru denge: varsayılan RED, ' +
        'açık beyanla izin.',
    ).toBe(true)
    // Kontrol koşulamazsa yazma da yapılmamalı (fail-closed).
    expect(
      /tracking_check_failed/.test(src),
      'Benzersizlik sorgusu başarısız olduğunda ne olacağı yazılmamış. "Sorguyu koşamadım, ' +
        'o hâlde geçireyim" kapıyı fail-open yapar.',
    ).toBe(true)
  })

  it('T061 · stok uyarısı ön-filtresi SABİT eşiğe dayanmıyor', () => {
    const src = kod('/supabase/functions/stock-alert/index.ts')
    // Eski hâli: `.filter('stock_qty', 'lte', 10)` — eşiği 10'dan büyük ürünler
    // (ör. low_stock_threshold = 40) alarm kapsamına HİÇ girmiyordu.
    expect(
      /filter\(\s*['"]stock_qty['"]\s*,\s*['"]lte['"]\s*,\s*\d/.test(src),
      'Ön-filtre sabit bir sayıya bağlanmış. `low_stock_threshold` bu sayıdan büyük olan ' +
        'ürünler için alarm HİÇ kurulmaz ve sessizlik "stok yeterli"den ayırt edilemez. ' +
        'Sınır veriden türetilmeli (en büyük eşik).',
    ).toBe(false)
  })

  it('T061 · stok uyarısının zamanlanmış bir tetikleyicisi VAR', () => {
    // Alarmın, kendisini gereksiz kılan olaya (satış) bağlı olması denetimin bulgusuydu:
    // `checkAllProducts` yalnızca `iyzico-callback` içinden ve yalnız o siparişin
    // ürünleri için çalışıyordu.
    const cronlar = Object.entries(workflowFiles).filter(([, y]) => /stock-alert/.test(y) && /schedule:/.test(y))
    expect(
      cronlar.map(([p]) => p),
      'stock-alert için zamanlanmış iş yok. Satış olmadan düşen stok (iade, sayım, fire) ' +
        'hiç fark edilmez.',
    ).not.toEqual([])
  })

  /**
   * Kapının kendisini kanıtla. (bkz. `prove-the-gate-with-deliberate-failure`)
   * Sabotaj turu ayrıca koşuldu; buradakiler dedektörün SÖZDİZİMSEL sağlığı.
   */
  it('kendi kendini doğrular: yorum sıyırıcı çalışıyor, dedektörler kör değil', () => {
    // Yorum içindeki yasak desen tetiklememeli (yanlış-KIRMIZI da kusurdur).
    expect(stripComments('// eskiden stok@venthub.com vardi\nconst a = 1')).not.toMatch(/stok@venthub/)
    expect(stripComments('/* recep.varlik@x */\nconst a = 1')).not.toMatch(/recep\.varlik/)
    // Ama koddaki gerçek geçiş GÖRÜLMELİ.
    expect(stripComments("const e = 'stok@venthub.com'")).toMatch(/stok@venthub/)
    // ⚠️ CRLF KONTROLÜ — LEGAL-OPS'un 2026-08-16 uyarısı. Onların yorum ayıklayıcısı
    // `/--.*$/` deseniyle HİÇBİR ŞEYİ temizlemiyordu: depo satırları CRLF ile saklıyor
    // (T017-VH fantomu) ve JS'te `.` bir satır sonlandırıcı olan `\r` ile EŞLEŞMEZ.
    // Bu dosyanın taradığı edge kaynakları GERÇEKTEN CRLF (ölçüldü) — yani buradaki
    // sıyırıcı `[^\n]*` kullanmasaydı bu testin TAMAMI sessizce kör olurdu.
    expect(stripComments('const a = 1\r\n// stok@venthub.com\r\nconst b = 2\r\n')).not.toMatch(/stok@venthub/)
    expect(stripComments('/* recep.varlik@x */\r\nconst a = 1\r\n')).not.toMatch(/recep\.varlik/)
    // CRLF'li kodda GERÇEK geçiş yine görülmeli (aşırı sıyırma da kusurdur).
    expect(stripComments("const e = 'stok@venthub.com'\r\n")).toMatch(/stok@venthub/)

    // Sabit eşik dedektörü gerçek biçimi tanımalı.
    expect(/filter\(\s*['"]stock_qty['"]\s*,\s*['"]lte['"]\s*,\s*\d/.test("filter('stock_qty', 'lte', 10)")).toBe(true)
    // Değişkenli hâli ihlal SAYILMAMALI.
    expect(/filter\(\s*['"]stock_qty['"]\s*,\s*['"]lte['"]\s*,\s*\d/.test("filter('stock_qty', 'lte', enBuyukEsik)")).toBe(false)
  })
})
