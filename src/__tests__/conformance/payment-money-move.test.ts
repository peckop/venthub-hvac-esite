import { describe, expect, it } from 'vitest'

/**
 * INV-PAY-3 — dış para hareketi: çağır-önce-talep-et, ve para geçtikten sonra hiçbir
 * hata yutulmaz.
 *
 * NİÇİN VAR (T053-VH · cetvel §3.10 kural A–D)
 *
 * Cetvel 2026-08-16'ya kadar para hareketi hakkında **tek bir değişmez içermiyordu**:
 * webhook'ları (§3.5) ve yetkiyi (§3.2) düzenliyordu, ama "PSP'ye para gönderen bir
 * fonksiyon ne yapmalı" sorusunun yazılı bir cevabı yoktu. Boşluk ücretsiz değildi —
 * `iyzico-refund` iki yıl boyunca başlığında *"Idempotent"* yazarak durdu ve değildi.
 * Hiçbir kapı bunu göremedi, çünkü ölçecek kural yazılmamıştı.
 *
 * §3.10 yazıldığında kural A–D için kapı yoktu ve cetvele "açık borç" diye işlendi.
 * Bu dosya o borcu kapatır. Cetveli yazıp kapıyı yazmamak, aynı hatanın daha kibar
 * biçimidir (bkz. [[standard-plus-enforcing-test-is-control]]).
 *
 * Ölçtüğü üç şey:
 *   1. PSP çağrısı yapan her fonksiyon, çağrıdan ÖNCE bir talep defterine yazmalı.
 *   2. Para hareketinden SONRAKİ kod yolunda boş `catch {}` olmamalı.
 *   3. `refund-order-mock` prod yolunda canlı bir iade yolu OLMAMALI.
 */

const edgeSources = import.meta.glob('/supabase/functions/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Yorumları boşlukla değiştirir; satır numaraları korunur. */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, p1: string) => p1)
}

/**
 * PSP'ye para hareketi isteği gönderen fonksiyonlar.
 *
 * ⚠️ Dedektör YORUMLARI SIYIRIR. Sıyırmasaydı, "burada eskiden PSP çağrısı vardı" diyen
 * bir yorum dosyayı para-taşıyan sayardı; bugün `refund-order-mock` tam olarak öyle bir
 * dosya (baştan sona neyi yapmadığını anlatıyor). Aynı sınıf hata bu oturumda üç kez
 * çıktı — dedektörün düzyazıyı koddan ayırt etmesi tesadüf değil, gereklilik.
 */
const PSP_CALL_RE = /\bsdk\s*\.\s*(?:cancel|refund|payment)\s*\.\s*create\s*\(/
const CLAIM_RE = /\bclaimRefund\s*\(/
const EMPTY_CATCH_RE = /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g

const moneyMovers = Object.entries(edgeSources)
  .map(([path, src]) => ({ path, src, code: stripComments(src) }))
  .filter((f) => PSP_CALL_RE.test(f.code))

describe('INV-PAY-3 · dış para hareketi çağır-önce-talep-et ve hatayı yutmaz', () => {
  it('dedektör çalışıyor: en az bir PSP-çağıran fonksiyon bulunabiliyor', () => {
    // Sıfır bulmak "temiz" değil, "dedektör kör" demektir. `iyzico-refund` tanım gereği
    // PSP çağırır; görünmüyorsa tarayıcı ya da çağrı biçimi değişmiştir.
    expect(
      moneyMovers.map((f) => f.path),
      'Hiçbir dosyada PSP çağrısı bulunamadı. SDK çağrı biçimi değiştiyse PSP_CALL_RE ' +
        'güncellenmeli — sessizce boş liste, kapının kapandığı anlamına gelmez.',
    ).toContain('/supabase/functions/iyzico-refund/index.ts')
  })

  it('kural A — PSP çağrısı yapan her fonksiyon önce talep defterine yazar', () => {
    const ihlaller = moneyMovers.filter((f) => !CLAIM_RE.test(f.code)).map((f) => f.path)
    expect(
      ihlaller,
      [
        'Bir fonksiyon talep defteri yazmadan PSP çağırıyor.',
        '',
        'Sıra: (1) talebi YAZ — unique çakışırsa PSP\'ye GİTME · (2) PSP\'yi çağır ·',
        '(3) sonucu aynı satıra işle. Tersi (önce çağır, sonra yaz) yazma düştüğünde',
        'para hareketinin hiçbir izini bırakmaz ve bir sonraki çağrı parayı TEKRAR gönderir.',
        '',
        'Sözleşme: `_shared/refund_guard.ts::claimRefund` · cetvel §3.10-A',
        ...ihlaller,
      ].join('\n'),
    ).toEqual([])
  })

  it('kural D — para taşıyan fonksiyonlarda boş `catch {}` yok', () => {
    const ihlaller: string[] = []
    for (const f of moneyMovers) {
      for (const m of f.code.matchAll(EMPTY_CATCH_RE)) {
        const satir = f.code.slice(0, m.index ?? 0).split('\n').length
        ihlaller.push(`${f.path}:${satir}`)
      }
    }
    expect(
      ihlaller,
      [
        'Para taşıyan bir fonksiyonda boş `catch {}` var.',
        '',
        'Para hareketinden sonra yutulan her hata, bir sonraki çağrıda ikinci kez para',
        'göndermenin izinsiz kapısıdır. 2026-08-15\'te `iyzico-refund` tam bunu yapıyordu:',
        'PSP sonrası PATCH boş catch içindeydi ve fonksiyon yine 200 "refunded" dönüyordu.',
        '',
        'Doğrusu: 5xx + `raiseRevenueAlarm` · cetvel §3.10-D',
        ...ihlaller,
      ].join('\n'),
    ).toEqual([])
  })

  it('para taşıyan fonksiyon stoğu DOĞRUDAN yazmaz — RPC ÇAĞRILIR (INV-STOCK-1 takviyesi)', () => {
    // ⚠️ NİÇİN BURADA DA VAR: INV-STOCK-1 bu kuralı zaten koyuyor, ama kontrolü
    // `kaynak.includes('process_order_stock_restore')` biçiminde. Sabotaj turunda
    // (2026-08-16) RPC çağrısını devre dışı bırakıp yerine doğrudan stok yazımı koydum:
    // **kapı YEŞİL kaldı** — çünkü bu dosyanın başlık yorumu RPC'nin adını anlatıyor ve
    // alt-dize iddiası onunla tatmin oluyor. Delik PRICING-STOK şeridine bildirildi.
    //
    // Buradaki kontrol iki farkla daha dar: (1) yorumlar sıyrılır, (2) adın GEÇMESİ değil
    // ÇAĞRILMASI aranır (fetch URL'inde `rpc/<ad>`).
    const ihlaller: string[] = []
    for (const f of moneyMovers) {
      if (/\bstock_qty\s*:/.test(f.code)) ihlaller.push(`${f.path} → doğrudan stok yazımı`)
      if (!/rpc\/process_order_stock_restore/.test(f.code)) {
        ihlaller.push(`${f.path} → stok geri-verme RPC'si ÇAĞRILMIYOR`)
      }
    }
    expect(
      ihlaller,
      [
        'Para taşıyan bir fonksiyon stoğu doğrudan yazıyor ya da kanıta bağlı RPC\'yi çağırmıyor.',
        '',
        'T052 sonrası satışta stok GERÇEKTEN düşüyor; koşulsuz/doğrudan geri-ekleme artık',
        'çift geri-ekleme demektir. Tek doğru yol: rpc(\'process_order_stock_restore\',',
        "{ p_order_id, p_reason }) ve dönen jsonb'nin `success` alanını OKUMAK.",
        ...ihlaller,
      ].join('\n'),
    ).toEqual([])
  })

  it('`refund-order-mock` prod yolundan çıkarıldı (410 döner, DB yazmaz)', () => {
    const path = '/supabase/functions/refund-order-mock/index.ts'
    const src = edgeSources[path]
    expect(src, `${path} bulunamadı — silindiyse bu testi de kaldır.`).toBeTruthy()
    const code = stripComments(src)

    expect(
      /\b410\b/.test(code),
      'refund-order-mock 410 Gone dönmüyor. Bu uç sahte iade yapıp müşteriye "iadeniz ' +
        'tamamlandı" dedirtiyordu; emekliliği gürültülü olmalı.',
    ).toBe(true)

    const yazmaIzleri = [
      { ad: 'sipariş güncelleme', re: /venthub_orders/ },
      { ad: 'stok yazımı', re: /stock_qty/ },
      { ad: 'iade olayı kaydı', re: /order_refund_events/ },
    ].filter((k) => k.re.test(code))
    expect(
      yazmaIzleri.map((k) => k.ad),
      'refund-order-mock hâlâ veritabanına yazıyor. Emekli bir uç hiçbir şeye dokunmamalı — ' +
        'yoksa "kapattık" sanılan yol sessizce çalışmaya devam eder.',
    ).toEqual([])
  })

  /**
   * Kapının kendisini kanıtla — yeşil test, ölçtüğünü ölçtüğünü göstermez.
   * (bkz. memory `prove-the-gate-with-deliberate-failure`, `substring-assert-is-not-a-gate`)
   */
  it('kendi kendini doğrular: dedektör sentetik ihlalleri GÖRÜR, yorumları GÖRMEZ', () => {
    const pspOrnek = 'sdk.cancel.create({}, cb)'
    expect(PSP_CALL_RE.test(pspOrnek)).toBe(true)
    expect(CLAIM_RE.test('await claimRefund(ctx, {})')).toBe(true)

    // Boş catch'in üç biçimi de yakalanmalı.
    for (const ornek of ['try{}catch{}', 'try{}catch(e){}', 'try{}catch (err) {  }']) {
      expect([...ornek.matchAll(EMPTY_CATCH_RE)].length, ornek).toBeGreaterThan(0)
    }
    // Dolu catch YAKALANMAMALI (yanlış-KIRMIZI da kusurdur).
    expect([...'try{}catch{ log(e) }'.matchAll(EMPTY_CATCH_RE)].length).toBe(0)

    // Yorum sıyırma: PSP çağrısını ANLATAN bir yorum dosyayı para-taşıyan yapmamalı.
    expect(PSP_CALL_RE.test(stripComments('// eskiden sdk.refund.create( vardı\nconst a = 1'))).toBe(false)
    expect(PSP_CALL_RE.test(stripComments('/* sdk.cancel.create( */\nconst a = 1'))).toBe(false)
  })
})
