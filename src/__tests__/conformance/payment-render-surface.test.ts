/**
 * INV-PAY-RENDER-1 — ödeme YÜZEYİ kapısı.
 *
 * NİÇİN VAR (T080-VH · 2026-08-18)
 *
 * Ödeme yolunda zaten üç kapı vardı (`INV-PAY-1/2/3`) ve **üçü de YOLU** ölçüyordu:
 * doğrulama çağrıldı mı, hata yutuldu mu, para hareketi öncesi talep var mı. Hiçbiri
 * kullanıcının EKRANINDA ne olduğunu sormuyordu. Sonuç: yol boyunca her şey "başarılı"ydı,
 * ekran bomboştu ve bu **aylarca görülmedi** — prod'da sıfır sipariş olduğu için "kimse
 * alamıyor" ile "kimse almıyor" ayırt edilemedi.
 *
 * Cetvel: `docs/standards/checkout-payment-standard.md` §3 (bağlayıcı kurallar) ve §5
 * (bu kapının şartnamesi, R1-R6).
 *
 * ÖLÇÜM KAPSAMI (açıkça yazılır — ölçmediğim sınıfı adıyla söylüyorum):
 * bu kapı **statik** bir kapıdır; kaynak metnini okur. Formun tarayıcıda gerçekten
 * çizildiğini KANITLAMAZ — onu ancak çalışma zamanı (e2e) ölçebilir. Burada kilitlenen
 * şey, çizilmeme hâlinin **sessiz kalamayacağıdır**.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect,it } from 'vitest'

const ROOT = path.resolve(__dirname, '../../..')

const HOOK = 'src/hooks/useCheckoutPayment.ts'
const SURFACE = 'src/views/checkout/PaymentIframeContainer.tsx'
const INJECTOR = 'src/views/checkout/injectCheckoutForm.ts'
const PAGE = 'src/views/CheckoutPage.tsx'
const CSP = 'next.config.mjs'

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

/**
 * Yorumları ve dize sabitlerini ELER.
 *
 * NİÇİN: R6 (yanlış-pozitif kontrolü) bir kuralın YORUMDA anlatılmasının kapıyı tatmin
 * etmemesini şart koşar. Yorum sıyrılmazsa bu dosyanın kendi açıklamaları bile kuralı
 * "geçirir" — `substring-assert-is-not-a-gate` ailesinin klasik tuzağı.
 *
 * `[^\r\n]*` kullanılır, `.*` DEĞİL: CRLF'li dosyada `.` satır sonunu yemez ve sıyırıcı
 * sessizce hiç çalışmaz. `(?<!:)` ise `https://` içindeki `//`'ı yorum sanıp satırın
 * kalanını yutmasını engeller (ikisi de daha önce yaşanmış kusurlar).
 */
function stripCommentsAndStrings(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(?<!:)\/\/[^\r\n]*/g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
}

describe('INV-PAY-RENDER-1 — ödeme yüzeyi sözleşmesi', () => {
  /**
   * R3 — ÖLÜ STATE YASAĞI. Kapının en kritik maddesi.
   *
   * T080'in kök sebebi "state güncellenmiyor" değil, **setter'ın hiç var olmamasıydı**:
   * `const [paymentFrameContent] = useState('')`. Böyle bir alan sonsuza kadar başlangıç
   * değerinde kalır ve onu tüketen her dal ölü doğar. "Güncelleniyor mu" diye soran bir
   * kapı bunu GÖREMEZ; soru bir katman yukarıdan sorulmalı: **setter var mı?**
   */
  it('R3: ödeme hook\'unda setter\'ı olmayan useState yok', () => {
    const src = stripCommentsAndStrings(read(HOOK))
    const destructured = [...src.matchAll(/const\s*\[([^\]]+)\]\s*=\s*useState/g)]

    expect(destructured.length).toBeGreaterThan(0)

    const dead = destructured
      .map((m) => m[1].split(',').map((s) => s.trim()).filter(Boolean))
      .filter((parts) => parts.length < 2)
      .map((parts) => parts[0])

    expect(
      dead,
      `Ölü state: setter'ı olmayan useState alanı bulundu (${dead.join(', ')}). ` +
      'Bu alan sonsuza kadar başlangıç değerinde kalır ve tüketicisi ölü doğar — T080 tam olarak buydu.',
    ).toEqual([])
  })

  /**
   * R2 — PSP'nin döndürdüğü her alanın bir TÜKETİCİSİ olmalı.
   *
   * `checkoutFormContent` uç tarafından 2026-08-15'ten beri gönderiliyordu ve istemci onu
   * hiç okumuyordu. Uç ile istemci arasındaki bu sessiz kopukluk hiçbir testte görünmedi.
   */
  it('R2: uç yanıtındaki form alanları istemcide okunuyor', () => {
    const hook = stripCommentsAndStrings(read(HOOK))

    for (const field of ['checkoutFormContent', 'paymentPageUrl', 'token']) {
      // `includes` KULLANILMAZ: ilk yazımda öyleydi ve sabotaj testinde YEŞİL kaldı —
      // alanı `checkoutFormContentX` diye yeniden adlandırdığımda üst-dize hâlâ eşleşti,
      // yani kapı kördü (`substring-assert-is-not-a-gate` ailesi). Gerçek ÖZELLİK ERİŞİMİ
      // aranır ve sağına kelime sınırı konur; böylece yeniden adlandırma kırmızı verir.
      const accessed = new RegExp(String.raw`\bd\.${field}\b`).test(hook)

      expect(
        accessed,
        `PSP yanıtındaki "${field}" alanının istemcide tüketicisi yok. ` +
        'Uç bir alan gönderiyorsa onu ya okuyan bir dal olmalı ya da uç göndermeyi bırakmalı.',
      ).toBe(true)
    }
  })

  /**
   * R4 — Betiğe dayanan dal, betiği ÇALIŞTIRAN bir yükleyiciye sahip olmalı.
   *
   * `dangerouslySetInnerHTML` (ve `innerHTML`) ile eklenen `<script>` HTML standardı gereği
   * ASLA yürütülmez. Yüzey PSP parçasını böyle basarsa hiçbir hata çıkmaz, sadece boş kutu
   * kalır. Bu yüzden kapı iki şeyi birden ölçer: yükleyici VAR, ve yüzey o parçayı
   * `dangerouslySetInnerHTML` ile basmıyor.
   */
  it('R4: form parçası gerçek betik düğümüyle enjekte ediliyor', () => {
    const injector = stripCommentsAndStrings(read(INJECTOR))
    const surface = stripCommentsAndStrings(read(SURFACE))

    expect(
      /createElement\(\s*['"]script['"]\s*\)/.test(injector),
      'Enjektör gerçek bir <script> düğümü YARATMIYOR. innerHTML ile eklenen betik yürütülmez.',
    ).toBe(true)

    // ADIN GEÇMESİ YETMEZ, ÇAĞRI aranır. İlk yazımda `includes('injectCheckoutForm')`
    // vardı ve sabotajda YEŞİL kaldı: çağrıyı silsem bile `import` satırı adı taşıdığı için
    // iddia tatmin oluyordu (`substring-assert-is-not-a-gate` — "IMPORT tatmin eder" biçimi).
    // Açılış parantezi aranarak gerçek çağrı ölçülür.
    expect(
      /\binjectCheckoutForm\s*\(/.test(surface),
      'Yüzey enjektörü ÇAĞIRMIYOR (yalnız import etmiş olabilir) — form parçası çalıştırılmaz.',
    ).toBe(true)

    expect(
      surface.includes('dangerouslySetInnerHTML'),
      'Yüzey PSP parçasını dangerouslySetInnerHTML ile basıyor; içindeki betik ASLA çalışmaz (T080).',
    ).toBe(false)
  })

  /**
   * R1 — Yüzeyin her dalı görünür içerik ya da HATA üretir; sessiz bekleme yok.
   *
   * Eskiden hata dalı yalnız geçici bir toast atıyordu ve ekranda sonsuza kadar
   * "Güvenli form yükleniyor" yazan bir örtü kalıyordu — arıza ilerlemeden ayırt edilemiyordu.
   */
  it('R1: hata durumu kullanıcıya GÖRÜNÜR bir yüzey üretir', () => {
    const surface = stripCommentsAndStrings(read(SURFACE))

    expect(
      surface.includes("phase === 'error'"),
      'Yüzeyin hata dalı yok — hata hâli sessizce yükleniyor gibi görünür.',
    ).toBe(true)

    expect(
      surface.includes('role="alert"'),
      'Hata yüzeyi role="alert" taşımıyor; ekran okuyucu kullanıcı hatayı hiç duymaz.',
    ).toBe(true)
  })

  /**
   * R1b — Örtünün KAPANMA koşulu gerçek bir aşamaya bağlı olmalı.
   *
   * Eski koşul `!payment.formReady` idi ve `setFormReady` hiçbir yerde çağrılmıyordu:
   * örtünün kapanma koşulu **fiilen yoktu**. Form kusursuz çizilse bile üstünü örterdi.
   */
  it('R1b: örtü yalnız gerçekten beklenirken görünür', () => {
    const page = stripCommentsAndStrings(read(PAGE))

    expect(
      /overlayVisible=\{[^}]*phase[^}]*\}/.test(page),
      'Örtünün görünürlüğü ödeme AŞAMASINA bağlı değil. formReady gibi tek bir bayrağa ' +
      'bağlanırsa, o bayrağı kimse set etmediğinde örtü hiç kapanmaz (T080).',
    ).toBe(true)
  })

  /**
   * R5 — CSP PARİTESİ. Gömülü form (varyant A) üçüncü taraf betiği çalıştırır; o betiğin
   * alan adı CSP'de yoksa tarayıcı onu SESSİZCE engeller ve yine boş kutu kalır.
   *
   * `frame-src` ayrıca aranır: direktif hiç tanımlı değilse `default-src` devreye girer ve
   * PSP'nin iframe'i engellenir. "Yok" ile "kapalı" aynı sonucu verir.
   */
  it('R5: CSP, PSP alan adına dört direktifte birden izin veriyor', () => {
    const csp = read(CSP)

    // CSP değeri ÇİFT tırnaklı bir dizedir ve İÇİNDE `'self'` gibi TEK tırnaklar geçer.
    // Bu yüzden sınır yalnız `"` olabilir. İlk yazdığımda `[^"']*` kullanmıştım ve
    // sıyırma ilk `'self'`'te kesildiği için kapı `script-src`'i "DİREKTİF YOK" sanıyordu:
    // yani kapı KÖRDÜ ve yanlış sebep bildiriyordu. Ölçüm aracının kendisi de ölçülmeli.
    const policy = csp.match(/default-src[^"]*/)?.[0] ?? ''

    expect(policy.length, 'next.config.mjs içinde CSP dizesi bulunamadı.').toBeGreaterThan(0)

    // Kapının kör olmadığının POZİTİF kanıtı: hâlihazırda var olduğunu bildiğimiz bir
    // direktifi görebiliyor olmalı. Göremiyorsa aşağıdaki tüm iddialar anlamsızdır.
    expect(
      /script-src[^;]*'self'/.test(policy),
      'Kapı CSP dizesini doğru ayrıştıramıyor (script-src self bile görünmüyor) — ölçüm kör.',
    ).toBe(true)

    for (const directive of ['script-src', 'frame-src', 'form-action', 'connect-src']) {
      const section = policy.match(new RegExp(`${directive}[^;]*`))?.[0] ?? ''
      expect(
        section.includes('iyzipay.com'),
        `CSP "${directive}" direktifi PSP alan adına izin vermiyor (bulunan: "${section || 'DİREKTİF YOK'}"). ` +
        'Gömülü ödeme formu bu direktif olmadan sessizce engellenir.',
      ).toBe(true)
    }
  })

  /**
   * R6 — YANLIŞ-POZİTİF KONTROLÜ.
   *
   * Kapının kendisi de sınanmalı: bir kuralı yalnız YORUMDA anlatmak onu geçirmemeli.
   * Burada, yorumlarında yasaklı deseni açıkça barındıran bir metin sıyırıcıdan geçirilir;
   * sıyırma çalışıyorsa geriye o desen KALMAMALIDIR.
   */
  it('R6: yorumda geçen desen kuralı tatmin etmez', () => {
    const sample = [
      '// burada dangerouslySetInnerHTML kullanmıyoruz',
      '/* dangerouslySetInnerHTML yasak */',
      'const url = "https://static.iyzipay.com/x"',
      'const real = 1',
    ].join('\n')

    const stripped = stripCommentsAndStrings(sample)

    expect(
      (stripped.match(/dangerouslySetInnerHTML/g) ?? []).length,
      'Yorum sıyırıcı çalışmıyor: yorumdaki desen kuralı tatmin edebilir hâle gelir.',
    ).toBe(0)

    expect(
      stripped.includes('const real'),
      'Sıyırıcı fazla yiyor: yorum olmayan kod da siliniyor.',
    ).toBe(true)

    // URL içindeki // yutulmamalı — yutulursa dedektör körleşir ve SESSİZCE yeşil verir.
    expect(
      stripped.includes('iyzipay.com'),
      'Sıyırıcı https:// içindeki // işaretini yorum sanıp satırın kalanını yedi (körlük).',
    ).toBe(true)
  })
})
