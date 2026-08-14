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

> **Kural:** olay adı boş string olamaz (`analytics.ts` Aksiyom 3 — anlamsız veri birikir). Param
> şeması sabit; yeni olay → bu tabloya eklenir (SSOT).

## Dönüşümler (GA4'te "conversion" işaretlenecek)
- Birincil: `purchase`, `lead_submit` (teklif/iletişim).
- İkincil: `add_to_cart`, `calculator_used` (niyet sinyali), `whatsapp_click`.

## Yapılandırma
- GA4/GTM ID → env (`NEXT_PUBLIC_GA_ID` / GTM container). Hard-code yasak.
- **Consent:** KVKK + çerez onayı **şart** — `CookieConsent` onayı verilmeden analytics olayları
  **ateşlenmez** (consent-mode). Çerez politikası sayfasıyla tutarlı.

### ⛔ ÖN KOŞUL — `NEXT_PUBLIC_GA_ID`'yi env'e KOYMADAN önce oku (`T020-VH`)

Yukarıdaki consent şartının **kodda karşılığı YOK**. Ölçüldü (2026-08-15, LAUNCH denetimi):

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

## Raporlama
- Mevcut sağlayıcının aylık raporunun **eşdeğeri/fazlası**: organik trafik (Search Console), dönüşüm
  hunisi (GA4), en çok gezilen/çıkılan sayfalar, kaynak/medya, cihaz.
- Sıklık: aylık özet + geçiş döneminde (cutover ilk 4-8 hafta) haftalık sıra-takibi.

## DoD (ne zaman "kurulu" sayılır)
- [ ] **`T020-VH` rıza kapısı bitti** (ön koşul — bkz. §Yapılandırma ⛔). Kanıt: "Reddet" seçili
      tarayıcıda GA/GTM script'i **hiç yüklenmiyor** ve tek bir olay gitmiyor.
- [ ] GA4 + GTM canlı, ID env'de, consent-mode bağlı.
- [ ] Huni olayları (en az view_item → add_to_cart → begin_checkout → purchase) akıyor.
- [ ] Search Console bağlı + sitemap gönderildi.
- [ ] İlk aylık rapor üretilebiliyor.

> **Durum:** İskelet (v1). Motor (`analytics.ts`) hazır; bu kontrat doldukça olaylar koda bağlanır.
