import { describe, expect, it } from 'vitest'

/**
 * INV-CANONICAL-1 · Kanonik adres SSOT'u (kalıcı bekçi).
 *
 * CANLI ARIZA (2026-08-15, K8): `NEXT_PUBLIC_SITE_URL` prod'da set edilmediği için
 * `VERCEL_URL`'e düşülüyordu — o değer her deploy'da DEĞİŞİR. Sonuç: robots.txt her
 * deploy'da başka bir Sitemap adresi, sitemap ve hreflang alternatifleri geçici URL'ler,
 * canonical/OG metadata'sı geçici URL, hatta Mesafeli Satış Sözleşmesinde satıcının sitesi
 * olarak rastgele bir deploy adresi. Çözüm `src/config/siteUrl.ts` SSOT'uydu.
 *
 * AMA SSOT TEK BAŞINA KAPI DEĞİL. 2026-08-17'de ölçüldü: ürün detay sayfası kanonik adresi
 * `window.location.origin`'den kuruyordu (useState + useEffect). İki ayrı arıza üretiyordu —
 * ilk render'da değer boş olduğu için canonical HOST'SUZ çıkıyor, efekt koştuktan sonra da
 * ziyaret edilen host'u yazıyordu. Yani K8'in tam olarak aynı sınıfı, başka kılıkta geri
 * gelmişti ve HİÇBİR KAPI GÖRMÜYORDU: tsc, lint, build, mevcut conformance — hiçbiri
 * "canonical'ın host'u nereden geliyor" diye sormuyor.
 *
 * Bu bekçinin tek işi o soruyu her koşuda sormak.
 *
 * ── KAPSAM SINIRI (bilerek yazılı) ────────────────────────────────────────────────
 * Bu STATİK bir tarayıcıdır. Çalışma zamanında hangi değerin üretildiğini GÖRMEZ; yalnız
 * host'un hangi KAYNAKTAN türetildiğini görür. "Yeşil" = SSOT dışı bilinen bir host kaynağı
 * yok demektir; "prod'da canonical doğru" demek DEĞİLDİR. Gerçek adresin doğruluğu
 * `NEXT_PUBLIC_SITE_URL`'in prod'da set edilmesine bağlıdır ve o Recep tarafındadır.
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

/** SSOT'un kendisi. */
const SSOT_PATH = '/src/config/siteUrl.ts'

/**
 * Yorumları ayıklar.
 *
 * `[^\r\n]` KASITLI, `.` DEĞİL: bu depo dosyaları CRLF ile saklıyor ve JavaScript'te `.`
 * bir satır sonlandırıcı olan `\r` ile EŞLEŞMEZ — `/\/\/.*$/` deseni yorumun sonuna hiç
 * varamaz ve hiçbir şey temizlemez. Aynı hata 2026-08-16'da INV-LEGAL-3'te yaşandı ve
 * yalnız sabotaj turunda görüldü. Blok yorumlar da ayıklanır: bu dosyanın kendi açıklaması
 * gibi uzun gerekçe metinleri, aranan ifadeyi içerdiği için testi kendi kendine doğrulatabilir.
 */
function kod(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\r\n]*/g, '')
}

/** Yalnız uygulama kaynağı — testler ve companion belgeleri hariç. */
const UYGULAMA_KAYNAKLARI = Object.entries(SOURCES).filter(
  ([yol]) => !yol.includes('/__tests__/') && !yol.endsWith('.test.ts') && !yol.endsWith('.test.tsx'),
)

/** Tarayıcıdan host okuma — kanonik yüzeyde YASAK. */
const TARAYICI_HOST = /window\.location\.(origin|host|hostname)\b/

/**
 * "Kanonik yüzey" — arama motoruna adres BEYAN EDEN dosyalar.
 *
 * KURALIN KAPSAMI NEDEN DAR: ilk yazımda kural tüm `window.location.*` kullanımını yasaklıyordu
 * ve 8 dosyayı kırmızıya çevirdi. Ölçtüm, sekizi de MEŞRUYDU: paylaş butonu ziyaret edilen
 * adresi paylaşır (doğrusu budur), OAuth `redirectTo` kullanıcıyı geldiği yere döndürür,
 * `admin.ts` localhost kontrolü yapar, `useCheckoutPayment` sayfayı YÖNLENDİRİR (okuma değil
 * yazma), `AuthCallbackPage` mevcut URL'den `code` parametresini okur, `pdfAssets` istemci
 * tarafında varlık çeker. Bunları yasaklamak kapıyı gürültüye boğar ve ilk muafiyet
 * dalgasından sonra kimse ciddiye almaz.
 *
 * Yasak olan tek şey şu: **arama motoruna beyan edilen adresin** ziyaret edilen host'a göre
 * değişmesi. O yüzden kural, adres BEYAN EDEN yüzeyle sınırlı.
 */
function kanonikYuzeyMi(govde: string): boolean {
  return (
    /rel=["']canonical["']/.test(govde) ||
    (/alternates\s*:/.test(govde) && /canonical\s*:/.test(govde)) ||
    /["']og:url["']/.test(govde) ||
    /\bcanonical\s*=\s*\{/.test(govde)
  )
}

describe('INV-CANONICAL-1 · kanonik adres SSOT dışına çıkamaz', () => {
  it('SSOT ve taranan kaynaklar bulunabiliyor (stale-guard)', () => {
    // Dosya taşınırsa bu bekçi "0 dosya taradım, hepsi temiz" demesin.
    expect(SOURCES[SSOT_PATH], `${SSOT_PATH} bulunamadı — SSOT taşındıysa bekçi körleşir.`).toBeTypeOf(
      'string',
    )
    expect(UYGULAMA_KAYNAKLARI.length).toBeGreaterThan(200)
  })

  it('yorum ayıklayıcı gerçekten çalışıyor (aracın kendi kanıtı)', () => {
    // Ayıklayıcı bozulursa aşağıdaki kuralların HEPSİ sessizce körleşir. CRLF dahil sınanır.
    const crlfOrnek = '// window.location.origin\r\nconst a = 1\r\n'
    expect(kod(crlfOrnek)).not.toContain('window.location.origin')
    expect(kod(crlfOrnek)).toContain('const a = 1')

    const blokOrnek = '/* canonical = window.location.origin */\r\nconst b = 2'
    expect(kod(blokOrnek)).not.toContain('window.location.origin')
  })

  // ── Kural 1 ────────────────────────────────────────────────────────────────────
  it('kanonik yüzey tarayıcı host bilgisinden adres türetmiyor', () => {
    const yuzeyler = UYGULAMA_KAYNAKLARI.filter(([, src]) => kanonikYuzeyMi(kod(src)))

    expect(
      yuzeyler.length,
      'Hiç kanonik yüzey bulunamadı — desen değiştiyse bu kural sessizce körleşir.',
    ).toBeGreaterThan(0)

    const ihlaller = yuzeyler.filter(([, src]) => TARAYICI_HOST.test(kod(src))).map(([yol]) => yol)

    expect(
      ihlaller,
      'Adres BEYAN EDEN bir dosya host\'u tarayıcıdan okuyor. Kanonik adres ziyaret edilen ' +
        'host\'a göre değişirse önizleme/alias adresleri kanonik ilan edilir — 2026-08-15 K8 ' +
        `sınıfı. Doğrusu: SITE_URL (${SSOT_PATH}).\n` +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  // ── Kural 2 ────────────────────────────────────────────────────────────────────
  it('deploy-özel ortam değişkenleri yalnız SSOT içinde okunuyor', () => {
    // VERCEL_URL her deploy'da değişir; VERCEL_PROJECT_PRODUCTION_URL kalıcıdır ama ikisinin
    // de sırası SSOT'ta kurulur. Başka bir dosyanın bunları okuması, merdiveni ATLAMAKTIR.
    const YASAK = /process\.env\.(VERCEL_URL|VERCEL_PROJECT_PRODUCTION_URL|NEXT_PUBLIC_SITE_URL)/

    const ihlaller = UYGULAMA_KAYNAKLARI.filter(([yol, src]) => {
      if (yol === SSOT_PATH) return false
      return YASAK.test(kod(src))
    }).map(([yol]) => yol)

    expect(
      ihlaller,
      'Deploy-özel adres değişkeni SSOT dışında okunuyor — merdiven atlanıyor ve sıra ' +
        `bozulabilir. Doğrusu: SITE_URL'i ${SSOT_PATH} üzerinden al.\n` + ihlaller.join('\n'),
    ).toEqual([])
  })

  // ── Kural 3 ────────────────────────────────────────────────────────────────────
  it('kanonik adres üreten sayfalar SSOT okuyor', () => {
    // `alternates.canonical` yazan her rota, host'u SSOT'tan almalı. Bu kural "canonical
    // ÜRETEN ama SITE_URL'i HİÇ import etmeyen" dosyayı yakalar.
    const canonicalUretenler = UYGULAMA_KAYNAKLARI.filter(([, src]) => {
      const govde = kod(src)
      return /alternates\s*:/.test(govde) && /canonical\s*:/.test(govde)
    })

    expect(
      canonicalUretenler.length,
      'Hiç canonical üreten dosya bulunamadı — desen değiştiyse bu kural körleşir.',
    ).toBeGreaterThan(0)

    // ADIN GEÇMESİ DEĞİL, İMPORT ARANIR. İlk yazımı `/siteUrl|SITE_URL/` idi ve sabotaj
    // turunda KÖR çıktı: import'u silip yerine `const SITE_URL = 'https://sabit.example'`
    // yazınca test yeşil kaldı — çünkü identifier hâlâ metinde geçiyordu. Sabit bir adres
    // tanımlamak tam olarak engellemek istediğimiz şeydi ve kapı onu ödüllendiriyordu.
    const SSOT_IMPORTU = /from\s+['"][^'"]*config\/siteUrl['"]/

    const ssotsuz = canonicalUretenler
      .filter(([, src]) => !SSOT_IMPORTU.test(kod(src)))
      .map(([yol]) => yol)

    expect(
      ssotsuz,
      'canonical üretiyor ama SSOT modülünü import ETMİYOR. Adresi yerel bir sabitten ya da ' +
        `başka bir kaynaktan alıyor olabilir; doğrusu ${SSOT_PATH} import etmektir.\n` +
        ssotsuz.join('\n'),
    ).toEqual([])
  })

  // ── Dedektör sağlığı ───────────────────────────────────────────────────────────
  it('yüzey dedektörü hem pozitifi hem negatifi ayırt ediyor', () => {
    // Muafiyet listesi TUTMUYORUZ (kural 1 dar olduğu için gerek kalmadı). Ama o zaman
    // "hiç ihlal yok" ile "dedektör hiçbir şeyi tanımıyor" dışarıdan aynı görünür.
    // Bu yüzden dedektör sentetik örnekle sınanır — ADMIN-OPS'un 2026-08-17'de yaşadığı
    // ders: muafiyet listesi boşalınca kapı kendi başarı koşulunda kırılmamalı.
    const pozitif = 'const url = `${window.location.origin}/x`\nreturn <link rel="canonical" href={url} />'
    const negatif = 'await navigator.share({ url: window.location.href })'
    const ssotlu = 'const url = `${SITE_URL}/x`\nreturn <link rel="canonical" href={url} />'

    expect(kanonikYuzeyMi(pozitif) && TARAYICI_HOST.test(pozitif), 'gerçek ihlal yakalanmalı').toBe(true)
    expect(kanonikYuzeyMi(negatif), 'paylaş butonu kanonik yüzey DEĞİL').toBe(false)
    expect(kanonikYuzeyMi(ssotlu) && TARAYICI_HOST.test(ssotlu), 'SSOT kullanımı temiz olmalı').toBe(false)
  })
})
