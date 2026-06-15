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

## Raporlama
- Mevcut sağlayıcının aylık raporunun **eşdeğeri/fazlası**: organik trafik (Search Console), dönüşüm
  hunisi (GA4), en çok gezilen/çıkılan sayfalar, kaynak/medya, cihaz.
- Sıklık: aylık özet + geçiş döneminde (cutover ilk 4-8 hafta) haftalık sıra-takibi.

## DoD (ne zaman "kurulu" sayılır)
- [ ] GA4 + GTM canlı, ID env'de, consent-mode bağlı.
- [ ] Huni olayları (en az view_item → add_to_cart → begin_checkout → purchase) akıyor.
- [ ] Search Console bağlı + sitemap gönderildi.
- [ ] İlk aylık rapor üretilebiliyor.

> **Durum:** İskelet (v1). Motor (`analytics.ts`) hazır; bu kontrat doldukça olaylar koda bağlanır.
