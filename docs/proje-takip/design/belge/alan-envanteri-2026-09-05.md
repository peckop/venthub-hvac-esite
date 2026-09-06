
# Belge alan envanteri — Teklif Talebi Özeti · Teklif · satış kipi

Kaynak: peckop/venthub-hvac-esite @ master, okunan dosyalar:
`supabase/migrations/20260816125346_quotes_v1.sql` · `20260826233000_quote_v2_schema.sql` ·
`20260828120000_quote_admin_yazma_yolu.sql` · `20260820090000_order_invoices.sql` ·
`docs/database_schema_master.md` (2026-08-28 derlemesi; venthub_quotes'u içermiyor, project_items/orders/invoice_profiles buradan) ·
`docs/standards/quote-standard.md` (v2) · `src/lib/services/quoteService.ts`.

Okuma: 2026-09-05. Değer uydurulmadı; şemada karşılığı olmayan alan "KOLON YOK" ile işaretli.
Belge eşlemesi: Teklif Talebi Özeti = `venthub_quotes.status = 'requested'` · Teklif = `status = 'quoted'` (draft'ta önizleme) · satış kipi = `venthub_orders` + `order_invoices`.

İşaretler: ● belgede var · ○ belgede yok · ◐ yalnız değer varsa (satır yoksa görünmez, canlı-durum §7 kuralı)

## A. Başlık bloğu

| Alan | Kaynak tablo.kolon | Talep Özeti | Teklif | Satış kipi |
|---|---|---|---|---|
| Belge no | venthub_quotes.quote_no (text, tenant içinde tekil, NULLABLE — atanma anı şemada tanımsız) | ● "Talep no" | ● "Teklif no" | venthub_orders.order_number · order_invoices.invoice_no |
| Revizyon | venthub_quotes.revision_no (int, default 1) | ○ | ● "Rev." | ○ |
| Önceki revizyon | venthub_quotes.amended_from · root_quote_id · superseded_by | ○ | ◐ "yerine geçer: …" | ○ |
| Talep tarihi | venthub_quotes.created_at | ● | ● (referans satırı) | ○ |
| İletim tarihi | venthub_quotes.sent_at | ○ | ● "Tarih" | ○ |
| Geçerlilik | venthub_quotes.valid_until (quoted'a geçişte NOT NULL, gelecekte olmalı — admin_publish_quote) | ○ | ● | ○ |
| Para birimi | venthub_quotes.currency (char(3), ^[A-Z]{3}$; kalemdeki currency eski katman) | ○ | ● | venthub_orders — kolon yok, payment_transactions.currency |
| Durum | venthub_quotes.status | ● (requested) | ● (quoted; expired/superseded arşiv damgası) | venthub_orders.status · payment_status |
| Giriş kapısı | venthub_quotes.source (pdp / cart / project) | ● "Kaynak" | ◐ referans satırında | ○ |

## B. Muhatap ve proje

| Alan | Kaynak tablo.kolon | Talep Özeti | Teklif | Satış kipi |
|---|---|---|---|---|
| Ad | venthub_quotes.contact_name (NOT NULL) | ● | ● | venthub_orders.customer_name |
| E-posta | venthub_quotes.contact_email (NOT NULL) | ● | ● | venthub_orders.customer_email |
| Telefon | venthub_quotes.contact_phone (NOT NULL) | ● | ● | venthub_orders.customer_phone |
| Hesap bağı | venthub_quotes.user_id (NULLABLE; hesapsız teklif kabul edilemez, §2.5) | ○ | ◐ yalnız kabul kutusunda ("hesap gerekir" notu) | venthub_orders.user_id |
| Firma unvanı | KOLON YOK tekliflerde. Hesap varsa user_invoice_profiles.company_name (user_id üzerinden); cari kart T130 CRM işi | ◐ | ◐ | venthub_orders.invoice_profile / invoice_info (jsonb) |
| VKN / TCKN | user_invoice_profiles.tax_number · profile_type | ○ | ◐ | ● e-fatura zorunlu |
| Vergi dairesi | user_invoice_profiles.tax_office | ○ | ◐ | ● |
| Adres | user_invoice_profiles.address_line · district · city · postal_code · country | ○ | ◐ | ● venthub_orders.billing_address · shipping_address (jsonb) |
| Müşteri projesi (BOM listesi) | venthub_quotes.source_project_id → user_projects.name · description | ◐ yalnız source='project' | ◐ | ○ |
| Satış projesi / muhatap rolü | venthub_quotes.sales_project_id · party_role | ○ **müşteri yüzüne asla çıkmaz** (§2/3 RLS) | ○ | ○ |

## C. Kalem tablosu

| Alan | Kaynak tablo.kolon | Talep Özeti | Teklif | Satış kipi |
|---|---|---|---|---|
| Sıra | venthub_quote_items.line_no | ● | ● | ○ |
| Grup (bina/kat/faz) | venthub_quote_items.group_label | ◐ ara başlık | ◐ ara başlık | ○ |
| Ürün kodu | KOLON YOK kalemde (snapshot yalnız ad). products.model_code / products.sku (product_id üzerinden, NOT NULL) | ● (join) | ● (join) | venthub_order_items.product_sku_snapshot |
| Ürün adı | venthub_quote_items.product_name (snapshot, NOT NULL) | ● | ● | venthub_order_items.product_name_snapshot |
| Marka | products.brand (join) | ○ | ○ | venthub_order_items.product_brand |
| Adet | venthub_quote_items.qty (>0) · kaynak listede project_items.quantity | ● | ● | venthub_order_items.quantity |
| Not | venthub_quote_items.note · kaynak listede project_items.notes | ● | ◐ | ○ |
| Birim fiyat | venthub_quote_items.unit_price (yalnız admin yazar) | **○ YOK** | ● | venthub_order_items.unit_price_snapshot |
| İskonto % | venthub_quote_items.discount_rate | ○ | ◐ | ○ |
| KDV % | venthub_quote_items.tax_rate (pricing_rule varsayılanı 20) | ○ | ● | venthub_order_items.tax_rate_snapshot |
| Kalem tutarı | venthub_quote_items.line_total | **○ YOK** | ● | venthub_order_items.total_price |
| Seçim kaynağı (sistem önerisi / kullanıcı seçimi) | **KOLON YOK.** venthub_quote_items ve venthub_quotes'ta karşılığı yok; wizard_selections listede olmayan tablo, aranmadı | ● çizildi, kaynak boş | ● çizildi, kaynak boş | ○ |
| Girdiler + dayanak standart | **KOLON YOK** (aynı) | ● çizildi, kaynak boş | ● çizildi, kaynak boş | ○ |

## D. Toplamlar

| Alan | Kaynak tablo.kolon | Talep Özeti | Teklif | Satış kipi |
|---|---|---|---|---|
| Ara toplam | TÜRETİLİR: Σ line_total (kolon yok) | ○ | ● | venthub_orders.subtotal_snapshot |
| KDV toplamı / kırılımı | TÜRETİLİR: Σ line_total × tax_rate, tax_rate'e göre gruplu (kolon yok) | ○ | ● | ● e-fatura zorunlu |
| İskonto | venthub_orders.coupon_discount (yalnız sipariş) | ○ | ○ | ◐ |
| Genel toplam | venthub_quotes.total_amount (snapshot) | **○ YOK** | ● | venthub_orders.total_amount |

## E. Koşullar, kabul, imza

| Alan | Kaynak tablo.kolon | Talep Özeti | Teklif | Satış kipi |
|---|---|---|---|---|
| Koşullar metni (ödeme, teslim, fiyat esası) | **KOLON YOK.** Şablon metni; içerik ticari karar (Recep) | ○ (yalnız "fiyat içermez" notu) | ● yer tutucu | ○ |
| Kabul beyanı | quote-standard §7.1 sabit metin: "teklifi ve satış şartlarını kabul ediyorum." | ○ | ● | ○ |
| Kabul kanıtı | venthub_quotes.accepted_at · accept_channel (site/email/phone) · accepted_revision_no · accept_recorded_by | ○ | ◐ yalnız accepted belgede damga | ○ |
| Satıcı teyidi (eşik üstü) | venthub_quotes.accept_confirmed_at · accept_confirmed_by | ○ | ◐ | ○ |
| Satıcı imza | KOLON YOK — şablon alanı | ○ | ● | ○ |
| Şirket künyesi (unvan, adres, VKN, MERSİS) | KOLON YOK — şirket kurulunca; tenants.name yalnız kiracı adı | ● yer tutucu | ● yer tutucu | ● |

## F. Satış kipi belgelerine özgü (şimdi çizilmez, envanter için)

| Alan | Kaynak tablo.kolon | Sipariş onayı | Proforma | E-fatura görünümü | Kargo |
|---|---|---|---|---|---|
| Sipariş no | venthub_orders.order_number | ● | ● | ● | ● |
| Fatura no / tarih / tip | order_invoices.invoice_no · invoice_date · invoice_type (yalnız payment_status='paid') | ○ | ○ | ● | ○ |
| Fatura tipi (bireysel/kurumsal) | venthub_orders.invoice_type · invoice_info | ○ | ● | ● | ○ |
| Ödeme yöntemi / durumu | venthub_orders.payment_method · payment_status | ● | ● | ○ | ○ |
| Kargo firması / takip | venthub_orders.carrier · tracking_number · tracking_url · shipped_at | ○ | ○ | ○ | ● |
| Teklif bağı | venthub_quotes.converted_order_id (UNIQUE) | ◐ "Teklif … karşılığı" | ◐ | ○ | ○ |
| Yasal onaylar | venthub_orders.legal_consents (jsonb) | ◐ | ○ | ○ | ○ |

## Çelişki ve eksik notları (çizimden önce yazıldı)

1. Brief'te "projeye yüklü" denen `kararlar-vitrin-15a-2026-09-04.md` ve `anahtar-ve-kip-haritasi-2026-09-04.md` bu projede YOK; proje boştu. `venthub-canli-durum.md` yalnız marka projesinde (2026-09-03 sürümü) var, oradan okundu. Satış kipi anahtarı bu yüzden doğrulanamadı — "kapalı bekler" etiketi brief'e göre kondu.
2. "Seçim kaynağı satırı" (sistem önerisi / kullanıcı seçimi + girdiler + dayanak standart) için şemada kolon yok. Belgede çizildi, kaynak hücresi boş. OPS'a soru: bu bilgi hangi tabloya yazılacak (venthub_quote_items'a jsonb kolon mu, ayrı tablo mu)?
3. Kalem snapshot'ında ürün kodu yok; kod `products` join'inden gelir. product_id v2'de NOT NULL, ama FK `on delete set null` v1'den kalma — ürün silinirse kod belgeden düşer. OPS'a not.
4. Kılavuzda belge ızgarası, tablo stili ve 24 px belge ikonu yok. Burada icat edilmedi: tablo yalnız kılavuzun mevcut kenar rengi (#e2e2de) ve yazı rolleriyle (Archivo / IBM Plex Mono) çizildi. Marka projesine iş önerisi: "Belge sistemi — ızgara, tablo stili, belge başlığı kalıbı".
5. Brief "Tek fiil 'Teklif iste'" diyor; marka CLAUDE.md "Teklif al", canlı-durum "Teklif listesine ekle" + "Teklif iste" yazıyor. Belgelerde fiil geçmiyor, çelişki yalnız kayda alındı.
6. Şirket künyesi (unvan, adres, VKN) ve koşul metinleri yok — yer tutucu bırakıldı, uydurulmadı.

— DESIGN-BELGE (Fable) 2026-09-05


## F2. Proforma ve e-fatura görünümü — çizim sırasında bulunan eksikler (2026-09-05 akşam eki)

Belgeler çizildi: `Proforma v1.dc.html` · `E-Fatura Gorunumu v1.dc.html`. Aşağıdaki alanların şemada karşılığı yok; belgede yer tutucu olarak duruyor, uydurulmadı.

| Alan | Belge | Durum |
|---|---|---|
| ETTN (evrensel tekil tanımlama no) | E-fatura | KOLON YOK — entegratör üretir; `order_invoices`'ta karşılığı yok |
| E-fatura senaryosu (temel / ticari) | E-fatura | KOLON YOK — `order_invoices.invoice_type` yalnız fatura tipini taşır |
| Yazı ile tutar | E-fatura | KOLON YOK — türetilir ya da entegratör üretir |
| GİB kare kod | E-fatura | KOLON YOK — entegratör üretir; belgede 64 px yer ayrıldı |
| Proforma no | Proforma | KOLON YOK — `venthub_orders.order_number` türevi olarak çizildi (PF- öneki ÖRNEKTİR) |
| Proforma geçerlilik tarihi | Proforma | KOLON YOK |
| Kargo bedeli | Proforma | KOLON YOK — `venthub_orders.shipping_method` yalnız yöntemi taşır, tutar kolonu yok |
| Satıcı künyesi (unvan · adres · VKN · vergi dairesi · MERSİS · ticaret sicil) | İkisi de | K7: şirket kuruluşuyla gelir |
| Ödeme koşulu · banka hesabı · teslim süresi | Proforma | K7: şirket kuruluşuyla gelir |
| UBL-TR alan eşlemesi | E-fatura | Entegratör seçilmedi; eşleme tablosu sağlayıcı belli olunca eklenir |

Not: iki belge de `venthub_orders` + `venthub_order_items` snapshot alanlarından beslenir (`unit_price_snapshot`, `product_name_snapshot`, `product_sku_snapshot`, `tax_rate_snapshot`, `total_price`, `subtotal_snapshot`, `total_amount`); fiyat otoritesi kabul edilen tekliftir (quote-standard §10), fiyat listesinden yeniden çözülmez.

Örnek para birimi TL (K6/E6). Sipariş ve fatura numarası biçimleri ÖRNEKTİR; `generate_order_number()` çıktısı ölçülmedi.

— DESIGN-BELGE (Opus) 2026-09-05

