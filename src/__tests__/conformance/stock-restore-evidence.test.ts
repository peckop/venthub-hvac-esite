/**
 * INV-STOCK-1 — Sipariş kaynaklı stok geri-vermesi KANITA bağlıdır
 *
 * KAYNAK: `docs/audits/operasyon-dongusu-denetimi-2026-08-15.md` §2 (T052-VH, CRITICAL).
 *
 * KURAL. Bir siparişin stoğu ancak **gerçekten düşülmüşse** geri verilebilir, ve bu yalnızca
 * `process_order_stock_restore` RPC'si üzerinden yapılır. Kanıt = `inventory_movements`
 * tablosundaki `order_sale` satırları. Sipariş KALEMLERİ kanıt değildir: "sipariş ne kadardı"
 * ile "stoktan ne kadar düşüldü" farklı sorulardır.
 *
 * NİÇİN BU TEST VAR. 2026-08-15'te ölçüldü: satışta stok **hiç** düşmüyordu. RPC'nin kapısı
 * `status IN ('paid','processing')` bekliyordu, ama `'paid'` sipariş statü sözlüğünde HİÇ YOK
 * (`venthub_orders_status_check`: pending/confirmed/processing/shipped/delivered/cancelled) ve
 * callback `'confirmed'` yazıyordu. Kapı hiç açılmadı. Buna karşılık **dört** ayrı yol stoğu
 * koşulsuz geri ekliyordu — düşülmüş mü diye bakmadan. Net sonuç: her iptal/iade/zaman aşımı
 * envanteri şişiriyordu, yani **hayalî stok**.
 *
 * TEHDİT MODELİ: drift dedektörü. Yakalaması gereken, yeni bir iptal/iade yolu yazan birinin
 * "stoğu geri ekleyeyim" deyip doğrudan `stock_qty`'ye dokunması. Asıl fail-closed katman
 * RPC'nin içindeki kanıt kapısıdır; bu test yalnızca RPC'nin ATLANMADIĞINI kontrol eder.
 */
import { describe, expect, it } from 'vitest'

// Interface-merge ile mevcut global bildirime dizi-desenli aşırı yükleme eklenir
// (negatif `!` desenleri yalnız dizi biçiminde ifade edilebiliyor).
declare global {
  interface ImportMeta {
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const RESTORE_RPC = 'process_order_stock_restore'

/**
 * RPC'yi tanımlayan migration SABİT DEĞİL — `create or replace` ile yeniden tanımlanabilir
 * ve son tanım kazanır. Tek bir dosya adına çivilemek, sonraki bir migration fonksiyonu
 * zayıflattığında testi kör bırakırdı: eski dosya hâlâ doğru görünür, canlı fonksiyon
 * değişmiştir. Bu yüzden aşağıda migration'lar CI'ın uyguladığı sırayla taranır ve
 * **en son tanım** doğrulanır.
 *
 * CI sırası bayt sırasıdır (`.github/workflows/supabase-migrate.yml` → `ls -1 | sort`),
 * o yüzden karşılaştırma da bayt sırasıyla yapılır — `localeCompare` DEĞİL.
 */
const RESTORE_FN_DECL = `create or replace function public.${RESTORE_RPC}`

function byteCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * ADLANDIRILMIŞ MUAFİYETLER — henüz göç etmemiş yollar.
 *
 * Bunlar "geçiş modu" DEĞİL: liste sabittir, yeni bir dosya sessizce katılamaz ve her satır
 * kimin şeridinde beklediğini söyler. Muafiyet ADLA verilir; "şimdilik uyar-geç" bir kapı
 * fail-open'dır. Bir satır çözüldüğünde listeden SİLİNİR — böylece liste yalnızca küçülür.
 */
const PENDING_MIGRATION: Record<string, string> = {
  // T053-VH (2026-08-16): iki EDGE-REFUND satırı SİLİNDİ — borç kapandı, liste küçüldü.
  //   · `iyzico-refund` artık `process_order_stock_restore` RPC'sini çağırıyor
  //     (kanıt = `order_sale` hareketleri, idempotenslik RPC'nin içinde hesaplanıyor).
  //   · `refund-order-mock` emekliye ayrıldı (410 Gone) ve hiçbir şeye yazmıyor;
  //     geçersiz `{"increment": N}` gövdesi de onunla birlikte gitti.
  // T052-VH (2026-08-16): ADMIN-OPS satırı da SİLİNDİ — borç kapandı, liste yine küçüldü.
  //   `restoreStockForOrder` artık ürün tablosuna hiç yazmıyor; tek yazıcı
  //   `process_order_stock_restore` RPC'si (kanıt = `order_sale` hareketleri).
  //   Ayrıca RPC'nin `success:false` zarfı okunuyor: HTTP 200 tek başına başarı sayılmıyor.
}

const appSources = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// `!` deseni ŞART (isExcluded yetmez): eager glob içeriği filtre çalışmadan okur.
// tests/e2e/helpers/denoRuntime.ts, _shared/ içine geçici `*.compiled.<rastgele>.ts`
// yazar ve siler; paralel koşuda glob o dosyayı görüp okuyamadan kaybediyordu (ENOENT).
const edgeSources = import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const migrationSql = import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function isExcluded(path: string): boolean {
  // Testler gerçek yol değil; `database.types.ts` üretilmiş şema tipi (kod yolu değil).
  return /__tests__|\.test\.|\.spec\.|\/tests?\//.test(path) || path.endsWith('/types/database.types.ts')
}

const productionSources: Record<string, string> = Object.fromEntries(
  [...Object.entries(appSources), ...Object.entries(edgeSources)].filter(([p]) => !isExcluded(p)),
)

/**
 * "Sipariş bağlamında stok yazan" dosya: hem bir siparişten söz eder hem de stoğa yazar.
 *
 * Sipariş bağlamı şartı bilinçli: admin panelindeki ELLE stok düzeltmesi
 * (`InventoryCsvImport`, `useInventoryDetail` → `adjust_stock`) meşrudur ve bu kuralın
 * konusu değildir. Kural yalnız SİPARİŞ kaynaklı geri-vermeyi bağlar.
 *
 * Stok yazımı iki biçimde tanınır:
 *   · `stock_qty:` — nesne anahtarı olarak, yani bir güncelleme gövdesinde. Salt-okuma
 *     kullanımları (`select=...,stock_qty,...` ya da `Number(p.stock_qty)`) bu desene UYMAZ.
 *   · `inventory_movements` + `.insert(` — hareket satırını elle yazmak.
 */
function isOrderScopedStockWriter(src: string): boolean {
  const mentionsOrder = /\border_id\b|venthub_order_items/.test(src)
  if (!mentionsOrder) return false

  if (/\bstock_qty\s*:/.test(src)) return true

  const movementInsert = /\.from\(\s*['"`]inventory_movements['"`]\s*\)/g
  for (const m of src.matchAll(movementInsert)) {
    const window = src.slice(m.index ?? 0, (m.index ?? 0) + 300)
    if (/\.(insert|upsert)\s*\(/.test(window)) return true
  }
  return false
}

const stockWriters = Object.entries(productionSources)
  .filter(([, src]) => isOrderScopedStockWriter(src))
  .map(([path]) => path)
  .sort()

/**
 * RPC'nin ADI GEÇİYOR MU değil, ÇAĞRILIYOR MU?
 *
 * ⭐ EDGE-REFUND bu kapıda kanıtlı bir delik buldu (2026-08-16, bilerek-bozarak): eski koşul
 * `src.includes(RESTORE_RPC)` idi. `iyzico-refund`'da RPC çağrısı `rpc/xx_disabled` yapılıp
 * yanına doğrudan `stock_qty` yazımı konuldu — **kapı YEŞİL kaldı.** Sebep: dosyanın başlık
 * yorumu RPC'nin adını açıklıyor ve alt-dize iddiası onunla tatmin oluyor.
 *
 * Yani **iyi belgelenmiş kod kapıyı kör ediyordu.** Yorum ne kadar açıklayıcıysa naif bir
 * ad-arama o kadar kolay tatmin olur. Aynı sınıf hatayı bugün üç kez daha yedik
 * (INV-RETURN-1'de import satırı, INV-STOCK-1'in kendi migration yorumu, `protect-config`
 * hook'unun benim yorumumu yasak kalıp sanması).
 *
 * Şimdi: önce yorumlar sıyrılır, sonra ÇAĞRI biçimi aranır — supabase-js `rpc('ad'` ya da
 * ham PostgREST `/rest/v1/rpc/ad`.
 */
function callsRestoreRpc(src: string): boolean {
  const kodsuz = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const jsRpc = new RegExp(String.raw`\.rpc\(\s*['"\`]` + RESTORE_RPC + String.raw`['"\`]`)
  const restRpc = new RegExp(String.raw`/rest/v1/rpc/` + RESTORE_RPC + String.raw`\b`)
  return jsRpc.test(kodsuz) || restRpc.test(kodsuz)
}

describe('INV-STOCK-1 — sipariş kaynaklı stok geri-vermesi kanıta bağlı', () => {
  /*
    PARSER SAĞLIĞI — SENTETİK ÖRNEKLE (2026-08-16'da düzeltildi).

    Önceki hâli, muafiyet listesindeki GERÇEK yolların dedektöre takılmasını şart
    koşuyordu. Bu, kapının kendi BAŞARI KOŞULUNDA kırılması demekti: liste sıfıra
    indiğinde — yani tam olarak hedefe ulaşıldığında — "hiçbiri takılmadı" diye
    KIRMIZI yanıyordu. Son borç kapanınca (ADMIN-OPS / T052) aynen bu oldu ve kapı
    doğru düzeltmeyi ihlal gibi gösterdi.

    Sağlık kontrolünün sorusu "dedektör hâlâ görüyor mu?"dur; bu soru gerçek
    ihlallerin VARLIĞINA bağlı olmamalı. Artık bilinen bir pozitif ve bilinen bir
    negatif örnekle ölçülüyor, dolayısıyla liste boşken de anlamlı kalıyor.
  */
  it('dedektör çalışıyor: sentetik pozitif/negatif ayırt ediliyor (parser sağlığı)', () => {
    const dogrudanYazan = [
      "const { data } = await supabase.from('venthub_order_items').select('quantity').eq('order_id', id)",
      "await supabase.from('products').update({ stock_qty: current + qty }).eq('id', pid)",
    ].join('\n')

    const hareketYazan = [
      "const oid = order_id",
      "await supabase.from('inventory_movements').insert([{ product_id: pid, delta: 3 }])",
    ].join('\n')

    const saltOkuma = [
      "const { data } = await supabase.from('products').select('id, stock_qty').eq('order_id', id)",
      "const kalan = Number(data?.stock_qty ?? 0)",
    ].join('\n')

    expect(isOrderScopedStockWriter(dogrudanYazan), 'stok gövdesi yazımı görülmeli').toBe(true)
    expect(isOrderScopedStockWriter(hareketYazan), 'elle hareket yazımı görülmeli').toBe(true)
    // Yanlış-POZİTİF kontrolü: salt-okuma ihlal sayılmamalı (yanlış-KIRMIZI da kusurdur).
    expect(isOrderScopedStockWriter(saltOkuma), 'salt-okuma ihlal sayılmamalı').toBe(false)
  })

  /**
   * ⭐EVREN MUHAFIZI (REC-189, kaynak REC-179 evren muhafızı sınavı).
   *
   * OPS'un 53 kapıyı sabotajla sınadığı ölçümde bu kapı **fail-open** çıktı ve sebebi
   * şuydu: aşağıdaki iki kol `stockWriters` üzerinde döner, ve o küme BOŞALIRSA ikisi de
   * "ihlal yok" der. Boş kümede dönen döngü hiçbir şey ölçmez ama yeşil yanar.
   *
   * Küme iki yoldan boşalabilir ve ikisi de sessizdir:
   *   · glob kökü kayar (`/src/**` → başka dizin, ya da `supabase/functions` kapsamdan düşer)
   *   · tanıma deseni (`stock_qty:` / `inventory_movements` + `.insert(`) kod biçimi
   *     değişince eşleşmez olur — ör. alan adı değişir, yazım bir yardımcıya taşınır.
   * İkisinde de kapı "sipariş kaynaklı stok yazan dosya YOK" der; oysa gerçek "artık
   * bakamıyorum"dur. *Ölçemediğini geçmiş sayan kapı, kapı değildir.*
   *
   * BU KOL EŞİĞİ ÖLÇÜLEN DEĞERİN BİR KADEME ALTINA KOYAR (emrin reçetesi): bugün ölçülen
   * sayı mesajda yazılıdır, eşik ondan küçüktür. Böylece meşru bir azalma (bir yazar RPC'ye
   * taşınınca kümeden düşer) kapıyı kızartmaz, ama kümenin ÇÖKMESİ yakalanır.
   */
  it('EVREN MUHAFIZI: tarama gerçekten dosya buldu — boş/dar küme KIRMIZI', () => {
    // Önce taramanın kendisi: kaynak havuzu okunamıyorsa sonraki her ölçüm anlamsız.
    expect(
      Object.keys(productionSources).length,
      'Kaynak havuzu şüpheli derecede küçük — glob kökü kaymış olabilir. ' +
        'Kapı KÖR koşmaktansa KIRMIZI döner.',
    ).toBeGreaterThan(200)

    // ⭐İKİ AYAK AYRI ÖLÇÜLÜR: `src` ve `supabase/functions`. Karma evrenin bir ayağı
    // sessizce düşerse toplam sayı hâlâ büyük kalır ve muhafız bunu GÖRMEZ — sipariş
    // kaynaklı stok yazımının ağırlığı Edge tarafındadır (iyzico-refund, order-housekeeping).
    expect(
      Object.keys(productionSources).filter((p) => p.startsWith('/supabase/functions/')).length,
      'Edge kaynakları evrende YOK — `supabase/functions` globu düşmüş. Sipariş kaynaklı ' +
        'stok yazımının ağırlığı orada; bu ayak olmadan kapı yarım evren ölçer.',
    ).toBeGreaterThan(10)
    expect(
      Object.keys(productionSources).filter((p) => p.startsWith('/src/')).length,
      'Uygulama kaynakları evrende YOK — `/src/**` globu düşmüş.',
    ).toBeGreaterThan(100)

    /**
     * ⭐İLK TASLAĞIM YANLIŞTI VE ÖLÇÜM DÜZELTTİ — bu, kolun en öğretici kısmı.
     * Önce `stockWriters.length > 0` yazmıştım (emrin "eşik" reçetesi böyle okunuyordu).
     * Koşturdum: sayı **0** çıktı. Sonra sebebini ölçtüm ve 0'ın ANLAMI şu:
     *   `process_order_stock_restore` RPC'si `src/lib/orderStatusService.ts:353` ve
     *   `supabase/functions/iyzico-refund/index.ts:442`'den ÇAĞRILIYOR;
     *   `release-expired-reservations` da stok geri-vermesini o RPC'ye devretmiş.
     * Yani sipariş bağlamında DOĞRUDAN stok yazan dosya kalmamış — göç TAMAMLANMIŞ.
     * `stockWriters === 0` bu kapının BAŞARI hâlidir.
     *
     * Dolayısıyla "küme boş olmasın" diye kol yazmak TERSİNE bir şey ister: *birileri hâlâ
     * doğrudan stok yazsın.* Kapı, korumaya çalıştığı kuralın ihlalini şart koşamaz.
     *
     * DOĞRU MUHAFIZ İHLALİN VARLIĞINI DEĞİL DEDEKTÖRÜN SAĞLIĞINI ÖLÇER: tanıyıcı, tanıması
     * gereken bir kaynağı HÂLÂ tanıyor mu (pozitif fikstür) ve tanımaması gerekeni reddediyor
     * mu (negatif fikstür). Küme meşru biçimde boşalabilir; tanıyıcının kör olması meşru değil.
     */
    /**
     * ⛔DEDEKTÖR SAĞLIĞINI BURADA TEKRAR ÖLÇMÜYORUM — YUKARIDAKİ KOL ZATEN ÖLÇÜYOR.
     * İlk yazımda pozitif/negatif fikstür kolları eklemiştim; sonra dosyayı okudum ve
     * "parser sağlığı" kolunun 2026-08-16'da tam bu iş için eklendiğini gördüm (hatta aynı
     * gerekçeyle: "liste sıfıra indiğinde kapı doğru düzeltmeyi ihlal gibi gösteriyordu").
     * Kolları SİLDİM. Aynı kuralı iki yere yazmak, ikisini ayrı ayrı bayatlatmaktır — bu
     * akşam URUN de aynı gerekçeyle ikinci bir `orphan` kapısı yazmayı reddetti ve haklıydı.
     *
     * ⭐BUNUN SONUCU EMRİ DE DARALTIYOR: REC-179 sınavı bu kapıyı "çalışma kümesi 0, vakumda
     * yeşil" diye fail-open saymıştı. Ölçtüm — dedektör körlüğü ZATEN kapılı; açık kalan
     * delik daha dar ve iki tane: (a) DOSYA EVRENİ (glob ayakları) hiç ölçülmüyordu,
     * (b) kapının KONUSUNUN yaşadığı (RPC çağrısı) hiç ölçülmüyordu. Aşağıdaki iki blok
     * yalnız o ikisini kapatır.
     *
     * TEK EKLEDİĞİM AYIRT ETME EKSENİ: sipariş bağlamı OLMAYAN yazım. Mevcut kolun negatifi
     * "sipariş bağlamı VAR + salt-okuma"; bu ise "yazım VAR + sipariş bağlamı YOK". İkisi
     * farklı yönde kayma ölçer ve mevcut kolda yoktu.
     */
    expect(
      isOrderScopedStockWriter(
        "await supabase.from('products').update({ stock_qty: 5 }).eq('id', 1)",
      ),
      'DEDEKTÖR AŞIRI GENİŞ: sipariş bağlamı OLMAYAN elle stok düzeltmesi yazım sayıldı — ' +
        'admin panelindeki meşru düzeltme (InventoryCsvImport, adjust_stock) bu kuralın ' +
        'konusu değil; ihlal listesi meşru işle dolar ve kapı gürültüye boğulur.',
    ).toBe(false)

    /**
     * ⭐KAPININ KONUSU HÂLÂ VAR MI: `stockWriters === 0` ancak RPC yolunun YAŞADIĞI sürece
     * "göç tamamlandı" demektir. RPC çağrısı sıfıra düşerse anlam tersine döner — o zaman
     * "kimse doğrudan yazmıyor" cümlesi "kimse stok geri vermiyor"a dönüşür ve kapı yine
     * boşluğu ölçer. Bugün ölçülen: iki üretim dosyası (orderStatusService, iyzico-refund).
     */
    const rpcCagiran = Object.entries(productionSources).filter(([, src]) => callsRestoreRpc(src))
    expect(
      rpcCagiran.length,
      'STOK GERİ-VERME RPC ÇAĞRISI KALMAMIŞ (' + RESTORE_RPC + '). `stockWriters === 0` artık ' +
        '"göç tamamlandı" DEĞİL "geri-verme yolu kayboldu" anlamına gelir; kapı yine boşluk ölçer.',
    ).toBeGreaterThan(1)
  })

  it('muafiyet listesi BAYAT değil: her satır hâlâ var ve hâlâ doğrudan yazıyor', () => {
    const bayat: string[] = []
    for (const [path, gerekce] of Object.entries(PENDING_MIGRATION)) {
      if (!(path in productionSources)) {
        bayat.push(`${path} → dosya YOK (taşındı/silindi). Muafiyeti kaldır. [${gerekce}]`)
        continue
      }
      if (!stockWriters.includes(path)) {
        bayat.push(`${path} → artık doğrudan yazmıyor. Muafiyeti KALDIR — borç kapandı.`)
      }
    }
    expect(
      bayat,
      ['Muafiyet listesi gerçeği yansıtmıyor. Liste yalnızca küçülmeli.', '', ...bayat].join('\n'),
    ).toEqual([])
  })

  it('muaf olmayan HER sipariş-stok yazarı RPC üzerinden gider', () => {
    const ihlaller: string[] = []
    for (const path of stockWriters) {
      if (path in PENDING_MIGRATION) continue
      if (!callsRestoreRpc(productionSources[path])) ihlaller.push(path)
    }

    expect(
      ihlaller,
      [
        'Bir kod yolu sipariş stoğunu DOĞRUDAN geri veriyor.',
        '',
        `Sipariş kaynaklı stok geri-vermesi yalnız \`${RESTORE_RPC}\` ile yapılır.`,
        'Kanıt = `inventory_movements`\'taki `order_sale` satırları; düşülmemişse geri',
        'verilecek bir şey yoktur. Doğrudan yazmak "hayalî stok" üretir — 2026-08-15\'te',
        'dört ayrı yol tam bunu yapıyordu ve satışta stok hiç düşmüyordu.',
        '',
        'Sözleşme: rpc(\'' + RESTORE_RPC + '\', { p_order_id, p_reason }) ·',
        "p_reason ∈ order_cancel | order_refund | order_expire",
        'Dönen jsonb\'nin `success` alanına BAK — HTTP 200 tek başına başarı değil.',
        '',
        'Cetvel: docs/audits/operasyon-dongusu-denetimi-2026-08-15.md §2 (T052-VH)',
        '',
        ...ihlaller,
      ].join('\n'),
    ).toEqual([])
  })

  /** RPC'yi tanımlayan SON migration — canlıda geçerli olan tanım budur. */
  function sonRpcTanimi(): { path: string; sql: string } {
    const adaylar = Object.entries(migrationSql)
      .filter(([, sql]) => sql.toLowerCase().includes(RESTORE_FN_DECL))
      .sort((a, b) => byteCompare(a[0], b[0]))
    const son = adaylar[adaylar.length - 1]
    expect(
      son,
      `Hiçbir migration \`${RESTORE_RPC}\` fonksiyonunu tanımlamıyor. Fonksiyon yeniden ` +
        'adlandırıldıysa bu testteki RESTORE_RPC sabitini güncelle.',
    ).toBeTruthy()
    return { path: son[0], sql: son[1] }
  }

  it('şema tarafı: RPC kanıta bağlı ve düşme kapısı gerçek statü sözlüğünü kullanıyor', () => {
    const { path, sql } = sonRpcTanimi()
    const n = sql.toLowerCase()

    // Kanıt kapısı: geri-verme hesabı `order_sale` hareketlerinden türemeli.
    expect(
      /reason\s*=\s*'order_sale'/.test(n),
      `${path}: geri-verme fonksiyonu \`order_sale\` kanıtına bakmıyor — sipariş kalemlerinden ` +
        'hesaplamak tam olarak hayalî stoğu üreten hatadır.',
    ).toBe(true)

    // "Daha önce geri verildi mi" hesabı, GÖÇ ETMEMİŞ yolların yazdığı legacy `'return'`
    // hareketlerini de saymalı. Saymazsa: eski yolla geri verilmiş bir sipariş için defter
    // "hiç geri verilmemiş" der ve RPC aynı miktarı BİR DAHA geri verir.
    //
    // DİKKAT — burada bir kez yanlış yazdım: koşul `/'return'/.test(n)` idi ve `'return'`
    // dosyanın YORUMUNDA da geçtiği için, sebep listesinden silsem bile test YEŞİL kalıyordu.
    // Bilerek-bozma turu bunu yakaladı. Şimdi iddia, `reason in (...)` listesinin KENDİSİNE
    // bakıyor: metinde geçmesi değil, hesaba girmesi aranıyor.
    const sebepListeleri = [...n.matchAll(/reason\s+in\s*\(([^)]*)\)/g)].map((m) => m[1])
    const geriVermeListesi = sebepListeleri.find((l) => l.includes("'order_cancel'"))
    expect(
      geriVermeListesi,
      `${path}: "daha önce geri verildi mi" hesabında \`reason in (...)\` listesi bulunamadı.`,
    ).toBeTruthy()
    expect(
      (geriVermeListesi ?? '').includes("'return'"),
      `${path}: "daha önce geri verildi mi" hesabı legacy \`'return'\` hareketlerini saymıyor ` +
        `(bulunan liste: ${geriVermeListesi?.trim()}). Göç etmemiş yollar (orderStatusService, ` +
        'iyzico-refund) stoğu deftere görünmez şekilde geri veriyor; bu olmadan çift ' +
        'geri-ekleme olur.',
    ).toBe(true)

    // Düşme kapısı: `'paid'` bir statü DEĞİLDİR (CHECK reddeder). Kapıda durması, kapının
    // açıldığı izlenimini vermekten başka bir işe yaramıyordu.
    const reductionSql = Object.entries(migrationSql)
      .filter(([, s]) => s.toLowerCase().includes('create or replace function public.process_order_stock_reduction'))
      .sort((a, b) => byteCompare(a[0], b[0]))
      .pop()
    expect(reductionSql, 'Hiçbir migration `process_order_stock_reduction` tanımlamıyor.').toBeTruthy()

    const rn = reductionSql![1].toLowerCase()
    const gate = rn.slice(rn.indexOf('from public.venthub_orders'))
    expect(
      /status in \([^)]*'confirmed'/.test(gate),
      "Düşme kapısı `'confirmed'` kabul etmiyor — callback başarılı ödemede bunu yazıyor.",
    ).toBe(true)
    expect(
      /status in \([^)]*'paid'/.test(gate),
      "Düşme kapısında hâlâ `'paid'` var. Bu değer `venthub_orders_status_check` sözlüğünde " +
        'YOK; hiçbir siparişte eşleşemez.',
    ).toBe(false)
  })

  it('migration dosya adı 14 haneli damga kuralına uyuyor', () => {
    const base = sonRpcTanimi().path.split('/').pop() ?? ''
    expect(base, `Migration adı YYYYMMDDHHMMSS_ ile başlamalı: ${base}`).toMatch(/^\d{14}_/)
  })
})
