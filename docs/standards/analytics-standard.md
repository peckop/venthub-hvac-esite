# Analytics & Ölçüm Standardı — "Ne Ölçülür" Kontratı

> **Bu dosya nedir?** Ölçüm **motoru** zaten kurulu (`src/utils/analytics.ts::trackEvent` → GA4/GTM).
> Bu dosya motoru değil, **kontratı** tanımlar: hangi olaylar, hangi huni, nasıl isimlendirilir, nasıl
> raporlanır. `admin-standard.md` gibi sürekli uyulan bir **cetvel** → `docs/standards/`. Otorite: bu dosya.
> İlgili: [seo-transition-blueprint](../plans/seo-transition-blueprint.md) (Search Console ortak) · `legal/` (KVKK/çerez).

## Mevcut zemin (motor hazır, operasyonel değil)
- `src/utils/analytics.ts::trackEvent(name, params)` → `window.gtag` (GA4) veya `window.dataLayer`
  (GTM)'e olay iletir; servis yoksa **sessizce** geçer, dev'de `console`'a loglar.
- **Eksik:** (1) gerçek GA4/GTM **ID** (env), (2) hangi olay/huni ölçülecek **planı** (bu dosya),
  (3) **Search Console** bağlantısı, (4) **KVKK/çerez onayı** entegrasyonu.

## Karar: araç seti
- **GA4 + Google Tag Manager** — birincil (motor zaten `gtag`/`dataLayer`'a yazıyor; en az sürtünme).
- **Google Search Console** — **zorunlu** (SEO geçişinin #1 ölçüm aracı; bkz. seo-transition-blueprint).
- **Vercel Web Analytics / Speed Insights** — Core Web Vitals için düşük-efor tamamlayıcı (opsiyonel).
- Gizlilik-dostu alternatif (Plausible/Umami) gerekirse değerlendirilir; varsayılan GA4+GTM.

## Olay taksonomisi (e-ticaret hunisi — `snake_case`, sabit param şeması)
| Aşama | Olay | Zorunlu param |
|---|---|---|
| Görüntüleme | `view_item` | item_id, item_name, category, price |
| Liste | `view_item_list` | item_list_id, items[] |
| Sepet | `add_to_cart` / `remove_from_cart` | item_id, quantity, price |
| Checkout | `begin_checkout` | value, currency, items[] |
| **Dönüşüm** | `purchase` | transaction_id, value, currency, items[] |
| Arama | `search` | search_term |
| Mühendislik | `calculator_used` | calculator (jetfan/duct/hrv/aircurtain), inputs_summary |
| Lead | `lead_submit` / `whatsapp_click` | source, context |
| Gezinme | `nav_click` | target, mode |
| İçerik | `case_study_click` | title |

> **Kural:** olay adı boş string olamaz (`analytics.ts` Aksiyom 3 — anlamsız veri birikir). Param
> şeması sabit; yeni olay → bu tabloya eklenir (SSOT).

> **Bu tablo artık bir bekçiye bağlı: `INV-ANALYTICS-1`**
> (`src/__tests__/conformance/analytics-event-taxonomy.test.ts`). Kodda `trackEvent()` ile
> ateşlenen her olay adı bu tabloda **yazılı olmak zorundadır**; tabloda olmayan bir ad eklenirse
> kapı kırmızıya döner. Son iki satır (`nav_click`, `case_study_click`) tam olarak bu yüzden
> eklendi: kodda **zaten** ateşleniyorlardı ve tabloda yoktular — yani tablo, yazıldığı günden
> beri kodun gerisindeydi ve bunu kimse görmüyordu.

### Bugünkü kapsama (ölçüldü 2026-08-19, T021-VH)

Kodda `trackEvent()` çağrı yeri **üçtür** ve tamamı gezinme/içerik olayıdır:
`StickyHeader.tsx` (2) · `CaseStudySection.tsx` (1). Yukarıdaki **ticaret hunisinin on olayının
hiçbiri bağlı değildir** — `purchase` ve `lead_submit` dâhil.

Bunun pratik sonucu GA4 kimliği env'e konulduğu gün ortaya çıkar: ölçüm "açılmış" olur ama GA4'e
yalnızca menü tıklamaları akar, dönüşüm hunisi **boş** görünür. Boş huni "satış yok"tan ayırt
edilemez — ölçüm kurulmuş gibi dururken hiçbir ticari soruya cevap vermez.

Bu yüzden huninin bağlanması, kimliğin girilmesiyle **aynı işin parçasıdır** ve INV-ANALYTICS-1
içindeki `HENUZ_BAGLI_DEGIL` listesi bir geri sayımdır: bir olay koda bağlandığında listeden
düşürülmek **zorundadır**, yoksa kapı kırmızıya döner. Liste kısalır, uzamaz.

> **Şerit sınırı:** huni olaylarının çağrı yerleri sepet/ödeme/ürün yüzeyleridir ve o dosyalar
> başka şeritlerin sahasındadır. Bağlama işi tek bir şeridin kendi başına alacağı iş değildir;
> iş dağılımı OPS-AUDIT'e bırakıldı → `docs/audits/t021-analytics-coverage-2026-08-19.md`.

## Dönüşümler (GA4'te "conversion" işaretlenecek)
- Birincil: `purchase`, `lead_submit` (teklif/iletişim).
- İkincil: `add_to_cart`, `calculator_used` (niyet sinyali), `whatsapp_click`.

## Yapılandırma
- GA4/GTM ID → env (`NEXT_PUBLIC_GA_ID` / GTM container). Hard-code yasak.
- **Consent:** KVKK + çerez onayı **şart** — `CookieConsent` onayı verilmeden analytics olayları
  **ateşlenmez** (consent-mode). Çerez politikası sayfasıyla tutarlı.

### ✅ ÖN KOŞUL KAPANDI — `T020-VH` bitti (PR #524, 2026-08-15)

> Aşağıdaki bölüm **açığın tarihçesidir**, güncel durum değil. Silinmedi çünkü GA açan kişinin
> *neden* bir rıza kapısı olduğunu bilmesi gerekiyor. **Bugünkü durum:** `trackEvent()` gönderim
> öncesi `hasConsent('analytics')` soruyor; GA/GTM script'i yalnız `ConsentGatedAnalytics` içinden
> ve yalnız rıza varsa yükleniyor; rıza kategori bazlı, versiyonlu, geri alınabilir.
> Kalıcı bekçi: `src/__tests__/conformance/legal-consent-analytics.test.ts` (INV-LEGAL-2) —
> kapı sökülürse test kırmızıya döner.

<details>
<summary>Açığın kaydı (2026-08-15 öncesi durum) — tıkla</summary>

Yukarıdaki consent şartının **kodda karşılığı YOKTU**. Ölçüldü (2026-08-15, LAUNCH denetimi):

- `vh_cookie_consent` bayrağını **yalnız bandın kendisi** okuyor (`CookieConsent.tsx:17`), kendini
  gösterip göstermeyeceğine karar vermek için. **Başka hiçbir yer okumuyor** → "Reddet" hiçbir şeyi kapatmıyor.
- `trackEvent()` uygulamada **zaten 3 yerden çağrılıyor**: `StickyHeader.tsx:150`, `StickyHeader.tsx:275`,
  `CaseStudySection.tsx:56`.

Yani sistemin bugün sessiz olmasının tek sebebi **GA ID'nin yokluğu** — güvenlik değil tesadüf.
ID env'e konulduğu **an**, "Reddet" demiş kullanıcı dâhil herkesten olay akmaya başlar; bu hem KVKK
ihlali hem de **bu cetvelin kendi ihlali** olur.

**Bu yüzden GA4 kurulumu (`avensair-teslim-yol-haritasi` madde G) `T020-VH` bitmeden BAŞLAMAZ.**
`T020-VH` kapsamı: kategori bazlı rıza (zorunlu/işlevsel/analitik/pazarlama — bugünkü ikili
kabul-ret yetersiz) · rızayı okuyan tek merkezî gate · reddedilen kategorinin script'inin **hiç
yüklenmemesi** (olay bastırmak yetmez) · rızanın geri alınabilmesi · rıza kaydı (tarih/versiyon, ispat yükü).

İlgili: `docs/audits/canliya-alma-hazirlik-2026-08-15.md` §S6 · PR #512 (Çerez Politikası bugünün
gerçeğini yazıyor: *"Site hâlihazırda analitik/pazarlama çerezi kullanmamaktadır"* — bu cümle
GA açıldığı an YALAN olur, metin de güncellenmeli).

</details>

## Raporlama
- Mevcut sağlayıcının aylık raporunun **eşdeğeri/fazlası**: organik trafik (Search Console), dönüşüm
  hunisi (GA4), en çok gezilen/çıkılan sayfalar, kaynak/medya, cihaz.
- Sıklık: aylık özet + geçiş döneminde (cutover ilk 4-8 hafta) haftalık sıra-takibi.

## DoD (ne zaman "kurulu" sayılır)
- [x] **`T020-VH` rıza kapısı bitti** (ön koşul — bkz. §Yapılandırma). Kanıt: "Reddet" seçili
      tarayıcıda GA/GTM script'i **hiç yüklenmiyor** ve tek bir olay gitmiyor. *(PR #524)*
- [x] **CSP `script-src`'a GA alan adları eklendi** — `www.googletagmanager.com` `script-src`'e,
      `https://*.google-analytics.com` (olay ucu) `connect-src`'e girdi. *(2026-08-17)*
      **Bu madde artık bir bekçiye devredildi:** `INV-CSP-1`
      (`src/__tests__/conformance/csp-origin-coverage.test.ts`), cetvel `docs/standards/csp-standard.md`.
      Sebep: buradaki teşhis doğruydu ("kodu yazan ile CSP'yi enforce'a alan farklı zamanlarda
      çalışır, bağlantı kurulamaz") ama bir **kontrol listesi maddesi** tam olarak o zaman farkına
      dayanamaz — bekçi dayanır. Nitekim bekçinin ilk koşusunda GA dışında **dört origin daha**
      eksik çıktı (`api.pwnedpasswords.com`, `www.youtube.com`, `*.cloudflarestream.com`,
      `fonts.googleapis.com`); hiçbiri bu listede yazmıyordu. CSP'yi **enforce**'a alma kararı
      ayrıdır ve Recep kapısıdır → `csp-standard.md §5`.
- [ ] **Çerez Politikası metni güncellendi** — bugün *"Site hâlihazırda analitik/pazarlama çerezi
      kullanmamaktadır"* diyor (PR #512, o gün doğruydu). GA açıldığı an bu cümle yanlış beyan olur;
      çerez tablosuna `_ga`/`_ga_*` satırları + saklama süreleri girilmeli. Dosyalar:
      `src/views/legal/components/{tr,en}/CookiePolicyContent.tsx`.
- [ ] GA4 + GTM canlı, ID env'de, consent-mode bağlı.
- [ ] Huni olayları (en az view_item → add_to_cart → begin_checkout → purchase) akıyor.
      **Bu madde de bir bekçiye devredildi:** `INV-ANALYTICS-1` içindeki `HENUZ_BAGLI_DEGIL`
      listesi bugün on olayı sayıyor; liste boşaldığında bu kutu işaretlenebilir. Kutuyu listeden
      önce işaretlemek mümkün değil — kapı, listedeki bir olay koda bağlandığı anda düşürülmesini
      **zorunlu** kılar (bkz. §Bugünkü kapsama).
- [ ] Search Console bağlı + sitemap gönderildi.
- [ ] İlk aylık rapor üretilebiliyor.

> **Durum:** İskelet (v1). Motor (`analytics.ts`) hazır; bu kontrat doldukça olaylar koda bağlanır.
