# VentHub Fiyatlandırma Standardı (Cetvel) — v1.1

> **Bu dosya nedir?** "Bir satış sitesinde fiyat nasıl kurulur?" sorusunun **karar veren cetveli.**
> Alış fiyatı + satıcı kârı; **üründe / markada / kategoride farklılaşan** marj; çoklu-para-birimi (USD/EUR/TRY)
> al-sat + ayarlanabilir parite + çapraz çevrim; KDV'li/KDV'siz satış — hepsi **admin-konfigüre.**
> Dünya-standardı e-ticaret platformlarının (Odoo, SAP, Salesforce CPQ, Magento, Shopify, BigCommerce)
> mekanikleri araştırılıp VentHub'ın **canlı şemasına** ve bayi yol haritasına (`dealer-module-blueprint.md`
> R0–R5→B1–B2) oturtuldu.
>
> **Neden var?** Bugün fiyat **amatör**: `product_prices` = 0 satır, çözücü bozuk (staff-rolünü segmente
> bağlıyor → her ürün düz `products.price`), currency/kur/KDV/kâr alanı yok. Bu cetvel, full ürün
> yüklemesinden **önce** kurulması gereken omurgayı tanımlar.
>
> ### ⚠️ v1.1 (2026-08-14) — çürüyen varsayım: "elimizde alış maliyeti var"
>
> v1.0 boyunca `products.purchase_price` **alış maliyeti** sanıldı. Kaynak doğrulandı: alan,
> **AVenS Ürün Fiyat Kataloğu 2026.1**'den geliyor — yani Avensair'in **müşteriye satış / liste**
> fiyatı (EUR, KDV hariç, depo teslim, *"TCMB Efektif Satış Kuru geçerlidir"*). Recep'in beyanı
> (2026-08-14): *"elimde alış fiyatları yok; o fiyatlar liste fiyatları yani iskontosuz; ben sonra
> o fiyatlardan iskonto alacağım."*
>
> **Sonuçlar (bu sürümün omurgası):**
> 1. Bugün sistemde **maliyet yok, LİSTE var** → §2 iki tabana bölündü (liste ≠ maliyet).
> 2. Liste EUR çapalı ve kur her gün değişiyor → `cost_in_base` **donmuş değil, türetilmiş**tir;
>    tazeleme sözleşmesi §8'de.
> 3. Geçiş kurulumu: **global kural = maliyet+marj %0** → vitrin fiyatı = katalog fiyatı + KDV.
>    Gerçek marj, gerçek alış maliyeti geldiğinde (**T010 satınalma**) anlam kazanır.
> 4. Maliyet-tabanlı her koruma (zarar eşiği, marj kelepçesi) bugün **ölçüsüzdür** — T010'a bağlıdır.

---

## 1. Temel model — üç katman (karıştırma)

Fiyat tek bir sayı değil, **üç katmanın** üst üste binmesidir. Hangi katmanda olduğunu bilmeden tartışma çıkmaz.

| # | Katman | Ne yapar | "Standart/sabit" mi? | Durum |
|---|---|---|---|---|
| **1** | **Maliyet-artı marj motoru** | Alış (orijinal para) × kur × (1+marj) [+KDV] → **liste/base satış fiyatı**. Marj ürün/marka/kategori/global önceliğiyle çözülür. | Otomatik (kur bile elle ezilebilir) | **YOK — bu cetvelle kurulacak** |
| **2** | **Segment overlay** (fiyat listesi) | Perakende/bayi/kurumsal **tier**'a göre farklı fiyat/iskonto. Mevcut `price_lists`/`product_prices`. | Admin kurar, kademeli | **VAR ama bozuk** → R0–R5 onarır |
| **3** | **Teklif (CPQ)** | B2B pazarlıklı satış: RFQ→Teklif→Sipariş, 8 fiyat kademesi, onay eşiği. | **Hayır — teklif başına karar** | YOK (dealer §5'te spec'li, gelecek faz) |

**Altın kural:** Fiyat **TÜRETİLİR, elle yazılmaz.** Maliyet-artı ürünlerde satış fiyatı motorun çıktısıdır;
saklanan değer bir **materialize cache**'tir (maliyet/kur/marj/KDV değişince yeniden hesaplanır). Bu, bugünkü
düz `products.price` (elle-yazılı tek TL) modelinin **tam tersi** ve Magento/Shopify/BigCommerce/Woo'nun
amatör tarafından ayrıldığımız nokta — onlarda maliyet pasif bir rapor alanı, fiyat elle yazılır.

---

## 2. Fiyat tabanı — İKİ ayrı taban (v1.1'de bölündü)

Motorun beslendiği taban tek değildir. **Liste fiyatı ile alış maliyeti aynı alan olamaz** — v1.0'ın
tek-alan varsayımı bugünkü sessiz yanlışın kaynağıydı.

| Taban | Nedir | Kur rolü | Bugünkü durum |
|---|---|---|---|
| **A · Liste fiyatı** (`list`) | Tedarikçinin/üreticinin **yayınlanmış satış fiyatı**, iskontosuz. Bizim iskontomuz da müşteri iskontosu da bunun üstünden konuşulur. | **Canlı** gösterim kuru — liste EUR çapalıysa TL her gün türetilir, DONMAZ | **VAR** — `products.purchase_price` + `purchase_currency` fiilen bunu taşıyor (AVenS Katalog 2026.1) |
| **B · Alış maliyeti** (`cost`) | Fiilen ödenen tutar = liste − alınan iskonto zinciri (ör. %30+%10). | **Donmuş** tedarik kuru — alış anında snapshot'lanır, sonradan oynamaz | **YOK** — satınalma modülü (**T010**) ile gelecek |

- **Bugünkü geçiş (dürüst kayıt):** `cost_in_base` alanı adı gereği maliyet der, **fiilen liste fiyatının
  TL karşılığını** taşır ve `refreshCostInBase` tarafından güncel TCMB kuruyla **her tazelemede yeniden
  hesaplanır**. Bu bilinçlidir (liste EUR çapalı); v1.0'ın "donmuş TL maliyet" ifadesi **geçersizdir**.
- **T010 geldiğinde:** `list_price_original`/`list_currency` (canlı kur) ile `purchase_cost`/
  `purchase_rate_to_base` (alış-anı snapshot) **ayrı alanlara** ayrılır; `cost_in_base` yalnız B tabanını
  taşır ve o zaman gerçekten donar. Bu ayrım yapılmadan marj/zarar korumaları ölçüsüzdür.
- **İki kur rolü asla birleşmez** (§4): *tedarik kuru* (alış→TL maliyet, alışta snapshot) ile *gösterim kuru*
  (TL base→USD/EUR vitrin, canlı) **farklı sayılardır.** ⚠️ **Bilinen sapma:** bugün `currency_rates` tek
  satır kümesiyle her iki rolü de besliyor (rol ayrımı kolonu yok) — T010 ile `rate_role` eklenecek.

---

## 3. Marj kuralı motoru + ÖNCELİK merdiveni ⭐ (cetvelin kalbi)

Senin sorunun cevabı: **"marj üründe/grupta/markada nasıl farklılaşır?"** → tek bir kural motoru + en-özel-kazanır merdiveni.

### 3.1 Öncelik (specificity) merdiveni — en özel kazanır
Bir ürüne birden çok kural uyduğunda **en özel olan kazanır, ilk eşleşmede durur** (Odoo `applied_on` +
SAP `Exclusive` stop-at-first-hit deseni):

```
scope 0  ürün varyantı     (en özel)
scope 1  ürün
scope 2  MARKA              ← HVAC için birinci sınıf (Vortice vb.); incumbent'lerde yok
scope 3  kategori/grup      (hiyerarşik — alt kategorilere CASCADE eder)
scope 4  global varsayılan  (en genel)
```

**Sıralama anahtarı:** `scope ASC, (dealer-kitabı önce), min_quantity DESC, priority DESC, id DESC` → ilk satır kazanır.

### 3.2 Bu merdiven "üründe/markada/kategoride farklılaşma"yı bedavaya çözer
- **"X kategorisindeki tüm ürünler %35 marj"** = TEK kural `{scope:3, category_id:X, margin_pct:35}`. Alt
  kategorilere materialized-path ile cascade eder. Ürün başına satır gerekmez.
- **"Y markası %40"** = TEK kural `{scope:2, brand_id:Y, margin_pct:40}`. X kategorisinde + Y markasında bir
  ürün → **marka (scope 2) kategoriyi (scope 3) yener** → otomatik %40.
- **Ürüne özel override** = `{scope:1, product_id:P, margin_pct:28}` → hem markayı hem kategoriyi yener,
  onlara dokunmadan. Silinince anında marka/kategori kuralına geri-cascade.
- **Admin UX:** ürün başına **etkin** marjı gösteren bir matris + hangi kuralın kazandığı rozeti
  ("kategori varsayılanı %35" vs "ürün override %28") → admin cascade'i görür, satır-içi ezer. Incumbent'lerin
  düz per-SKU editöründen ayıran enterprise fark budur.

### 3.3 Hesap modu (Odoo `compute_price`/`base` + Salesforce method)
Kural başına: `method ∈ {cost_plus, fixed, percent_off_list}`, `base ∈ {cost, list_price, parent_book}`,
`margin_pct` (cost-plus markup), `surcharge` (sabit ek), `fixed_price`, marj tavanı/tabanı (`min/max_margin`).

---

## 4. Para birimi + parite (çoklu-para, çapraz, ayarlanabilir)

- **Base (operasyon/muhasebe) para birimi = TRY.** Fatura, KDV, tahsilat TL; muhasebe gerçeği TL.
- **İki ayrı kur rolü (birleştirme):**
  1. **Tedarik kuru** (alış→TL maliyet): alış kaydedildiğinde **TCMB Efektif Satış** snapshot'lanır, donar.
     (Avensair fiyat listesi EUR'u **TCMB Efektif Satış Kuru** ile faturalar → maliyet bu kurla TL'ye sabitlenmeli;
     "Döviz Satış" DEĞİL — efektif=fiziki/banknot satış, Avensair'in ticari konvansiyonu.)
  2. **Gösterim kuru** (TL base→USD/EUR vitrin): canlı TCMB + admin **spread** (marka payı), yuvarlamadan önce.
- **Çapraz işlem** (EUR alış → TL veya USD satış): EUR maliyet → ×tedarik_kuru → TL maliyet → ×(1+marj) → TL net
  → vitrin için TL→USD canlı çevrim. **Marj TEK para biriminde (TL) bir kez hesaplanır** — EUR'da ve TL'de iki
  kere hesaplanırsa iki farklı cevap çıkar.
- **Kur kaynağı = TCMB** (`https://www.tcmb.gov.tr/kurlar/today.xml`): hafta sonu/tatil **404** döner → **son
  kuru taşı** (sıfırlama/hata yok); iş günü kuru **~15:30 sonrası** yayınlanır → cron 15:30 sonrası.
- **`currency_rates` tablosu append-only:** `(base_ccy, quote_ccy, rate, spread_pct, source, effective_date,
  fetched_at)`. **Elle ezme = yeni satır** (`source='manual'`, daha yüksek öncelik) — yerinde mutasyon YOK
  (denetim izi korunur). Bu, "ayarlanabilir parite" gereksinimini denetlenebilir kılar.
- **Sipariş anında kur DONDURULUR:** order satırına kullanılan **kur skaler olarak kopyalanır** (FK değil) →
  geçmiş sipariş toplamları sonradan kaymaz. (Tarihsel-kur yöntemi, evrensel muhasebe standardı.)

### 4.1 Çoklu-para birimi satış sözleşmesi (v1.1)

- **İşlem para birimi daima TRY.** Tahsilat (İyzico), fatura, KDV, iade TL üzerindendir. EUR/USD gösterimi
  **yalnız vitrin bilgilendirmesidir**; etikette bu açıkça belirtilir.
- **Sipariş satırı kur snapshot'ı ZORUNLU:** `display_currency` + `display_rate` + `rate_effective_date`
  sipariş kalemine kopyalanır. §13'teki snapshot listesi bu nedenle **6 → 9 alana** çıkarıldı.
  ✅ **W2b-2'de kapandı** (`20260815210000_pricing_w2b2_order_item_snapshots.sql`): üç alan eklendi,
  9 alanın 8'i **NOT NULL**'a çekildi (`price_list_id_snapshot` bilerek nullable — fiyat bir listeden
  değil kuraldan/tekliften gelebilir), bekçisi **INV-PRICE-3**.
  > **Niçin o gün yapıldı:** tablo o an BOŞTU (0 satır, 2026-08-15'te ölçüldü), yani geri-doldurma
  > gerekmedi ve kolonlar NOT NULL'a çekilebildi. İlk gerçek sipariş girdikten sonra aynı sertleştirme
  > migration + backfill + kesinti işine dönerdi. Zamanlama tesadüf değil, pencere buydu.
- ⚠️ Bu alanlar şu an **TRY/1.0/sipariş tarihi** ile yazılıyor: gösterim para birimi seçimi henüz
  hiçbir yüzeyde yok (W5). Alanların erken açılmasının sebebi, W5 geldiğinde geçmiş siparişlerin
  her kur hareketinde yeniden değerlenmesini önlemek.
- **İade daima orijinal TL tutarından** hesaplanır (gösterim para birimi iadeyi belirlemez).
- ⚠️ **Bilinen sapma (v1.1):** `spread_pct` üç yerde duruyor (`currency_rates.spread_pct`,
  `site_settings.pricing.display_spread_pct`, admin panelinde salt-okunur kart) ama **hiçbir hesaba girmiyor**
  — gösterim çevrimi ham `net / rate`. Ya uygulanır ya cetvelden düşer; "duran ama işlemeyen ayar" kabul edilemez.

---

## 5. KDV (%20) — net sakla, çift mod

- **Tek gerçek = NET (KDV-hariç) fiyat.** Marj net üzerine, KDV netin üstüne biner; net tek rate-stabil ve
  iade-edilebilir figür. Gross'tan net türetmek (`gross/1.20`) her okumada yuvarlama kaybı doğurur.
- Formüller (faktör 1.20): `gross = net × 1.20` · `net = gross / 1.20` · `kdv = net × 0.20`.
- **Sıra: maliyet → +marj → NET → +KDV → GROSS.** KDV asla marj hesabına girmez (devlete pass-through, gelir değil).
- **Çift mod (B2C vs B2B):**
  - **B2C (tüketici):** **KDV-dahil (gross)** göster (Türk perakende konvansiyonu + yasal "etiket = ödenecek").
  - **B2B (bayi/Avensair):** **KDV-hariç (net)** göster; KDV faturada **ayrı satır** (Türk yasası: ticari
    faturada KDV tutarı ayrı gösterilmek zorunda; e-Fatura/e-Arşiv XML toplamlarıyla **birebir** uyuşmalı).
  - Tek `display_tax_mode = inclusive|exclusive` bayrağı aynı saklanan net üzerinden audience'a göre render eder.
- **KDV ORANININ SSOT'u = ürün** (v1.1 kararı). Canlı şemada `products.tax_rate numeric NOT NULL DEFAULT 20.00`
  ve `products.is_taxable boolean NOT NULL DEFAULT true` **zaten var**; motor ise oranı `pricing_rule.vat_rate_pct`
  üzerinden okuyordu → **iki rakip KDV kaynağı**. Kural:
  1. Oran **üründen** okunur (`is_taxable = false` → KDV yok, gross = net).
  2. `pricing_rule.vat_rate_pct` **yalnız bilinçli override**tir; `NULL` = "üründen oku" (varsayılan).
  3. Tek oran varsayımı (%20) yasaktır: Türkiye'de %1/%10/%20 dilimleri var; bazı HVAC kalemleri %10 olabilir.
  - Zorlayan test: **INV-PRICE-5** (§14).

---

## 6. Yuvarlama (per-currency, en SON)

- **Para ondalık-kesin (`numeric`) saklanır; float (`real`/`double precision`) YASAK** — 0.1 binary'de temsil
  edilemez, hata birikir. Uygulanan biçim: DB'de `numeric(14,4)` (kur için `numeric(18,6)`), hesapta tek
  yuvarlama sınırı. *(v1.1 düzeltmesi: v1.0 "tamsayı-minor ×100 sakla" diyordu — ne şema ne kod böyleydi;
  cetvel hiçbir yerde geçerli olmayan bir kural yazıyordu. Tamsayı-minor göçü istenirse ayrı iş emri olur,
  "zaten kural" gibi davranılamaz.)* Precision ISO 4217'den (minor-unit exponent) türetilir, 2 sabitlenmez.
- **En son, her para sınırında bir kez yuvarla** (round-half-up). Tam precision'ı zincir boyunca taşı, yalnız
  saklanan/gösterilen para değerine inerken yuvarla.
- **Charm/yuvarlama per-kategori/per-tenant POLİTİKA** (global sabit değil): premium ürün yuvarlak (₺100),
  perakende `,90`/`,95`. Tüm maliyet/marj/iskonto matematiğinden **sonra** uygulanır.
- **e-Fatura mutabakatı:** `gross = net + yuvarlanmış_KDV` (gross'u bağımsız yuvarlama, yoksa net+kdv≠gross →
  XML reddi). Satır-bazında yuvarla, sonra topla; tolerans dokümante et.

---

## 7. Hesaplama hattı (kesin sıra — tek doğru)

```
1. purchase_price (EUR, minor int)                         [saklı, kesin]
2. × tedarik_kuru (EUR→TRY, snapshot, yüksek precision)    → cost_in_base (TL, yuvarlama YOK)
3. × (1 + margin_pct)   [marj kuralı motoru §3'ten]        → net_sale_base (TL, tam precision)
4. YUVARLA #1 → net_unit (TL kuruş)   [+ ops. charm snap]  ← ilk para sınırı
5. kdv = YUVARLA(net_unit × 0.20)  ;  gross = net_unit + kdv   (gross yeniden yuvarlanmaz)
6. Vitrin (USD/EUR): zaten-yuvarlanmış base'i çevir:
     net_present = YUVARLA(net_unit × gösterim_kuru × (1+spread))
7. Fatura toplamı = Σ yuvarlanmış satır net + Σ KDV + Σ gross.
```
TL faturası **yasal otorite**; USD/EUR açıkça "tahmini" gösterim.

---

## 8. Segment overlay — mevcut `price_lists`/`product_prices` (R0–R5 onarır)

- **Bu katman ZATEN VAR ama bozuk.** `price_lists` (3 satır, `user_type` segment) + `product_prices`
  (**0 satır**) + `organizations.tier_level`. Çözücü (= `getEffectivePriceInfo`/`getEffectiveUnitPrice` @
  `src/lib/services/pricing.service.ts`, DI-uyumlu) `user_profiles.role`'u (staff-yetkisi) segmente bağlıyor →
  asla tutmuyor → düz `products.price`. (Motor VAR; sale_price/discount_percentage/effective-dating dahil —
  yeniden yazma, tier_level'a çevir + §3–5 katmanlarını ekle.)
- **Doğru sözleşme:** segment = `organizations.tier_level` (role DEĞİL). `user → organization → tier_level →
  price_list → product_prices` → bulunamazsa maliyet-artı motor çıktısı (§3). (Karar: dealer-blueprint §2, B-minimal.)
- **`product_prices` = motor çıktısının materialize cache'i:** `(product, price_list, currency)` başına net+gross.
  Motor yazar, çözücü okur. Boş tablonun anlamı buydu — seed (B2) bu cache'i doldurur.

### 8.1 Cache sözleşmesi (v1.1 — seed'den ÖNCE uyulması zorunlu)

1. **Tekil anahtar para birimini İÇERİR:** `(product_id, price_list_id, currency, valid_from)`.
   ⚠️ Canlı indeks v1.1 öncesi `currency`'siz kuruldu (`product_prices_unique`) → aynı ürünün EUR ve TRY
   satırı fiziksel olarak yan yana duramıyordu. "Ürün/grup bazında para birimi" gereksiniminin ön koşulu budur;
   **tablo boşken düzeltilir**, dolduktan sonra göç acılıdır.
2. **Elle-ezme dokunulmazdır:** `is_derived = false` satırlar **motor tarafından ASLA üzerine yazılmaz/silinmez**.
   Materialize yalnız `is_derived = true` satırları tazeler. (Fiyat dondurmanın taşıyıcısı bu bayraktır — §8.2.)
3. **Tazelik sözleşmesi:** cache satırı `computed_at` taşır. TCMB senkronundan sonra zincir
   `refreshCostInBase → etkilenen ürünler için materialize` otomatik koşar; **elle tetiklemeye bırakılmaz**
   (bırakılırsa vitrin her gün dünkü kuru gösterir ve kimse fark etmez). N saatten bayat satır admin panelinde uyarı üretir.
4. **Cache adet-boyutsuzdur:** materialize `quantity = 1` ile koşar. Bu nedenle `min_quantity > 1` kuralı
   **sepet/checkout runtime `resolvePrice` yolunu çağırana kadar YAZILMAMALIDIR** — bugün girilirse hiçbir
   yüzeyde görünmez (sessiz ölü kural).

### 8.2 Fiyat kilidi (dondurma) — v1.1

Kur oynasa da fiyatın sabit kalması **birinci sınıf gereksinimdir** (Recep, 2026-08-14), yalnız gösterim
numarası değil:

- **Kilit = kapsam bazlı politika** (ürün / marka / kategori / global — §3 merdiveniyle aynı özgüllük sırası).
- Kilitli kapsam **hem `refreshCostInBase` hem materialize tarafından ATLANIR.** Yalnız gösterimi dondurup
  maliyet tazelemesini serbest bırakmak yetmez: ertesi gün marj kelepçesi fiyatı yine oynatır.
- Kilit kaydı **kimin, ne zaman, hangi kurdan** dondurduğunu taşır (`frozen_at`, `frozen_by`, `fx_frozen_rate`);
  kilit açma `admin_audit_log`'a yazılır.
- Uygulama biçimleri: (a) `method='fixed'` kural — hesaplanan fiyatı tek tıkla sabit kurala çevirir;
  (b) `is_derived=false` elle-ezme satırı — tek üründe nokta atışı.

✅ **W5'te CANLI** (`20260816120000_pricing_w5_policy_fx_lock.sql`, bekçi **INV-PRICE-7**):
`pricing_policy.fx_lock` + künye kolonları; kilit **zincirin iki halkasında da** uygulanıyor
(`refreshCostInBase` ve `materializePrices`, ayrı `skippedFxLocked` sayaçlarıyla).

> **En özel kazanır, kilidin VARLIĞI değil DEĞERİ belirler.** Daha özel bir `fx_lock=false`
> politikası, daha genel bir kilidi bozar — "global kilit ama şu ürün hariç" ifade edilebilmeli.
> Bu en kolay yanlış uygulanacak kural (`policies.some(p => p.fx_lock)` yazmak yeterli), o yüzden
> INV-PRICE-7'de ayrı bir davranış testi var.
>
> **Sessiz atlama yasak.** Dondurma bir KARARdır: "kur değişti ama 40 ürün güncellenmedi" panelde
> görünmezse "bu fiyat neden değişmedi" sorusu cevapsız kalır. İki özet de `skippedFxLocked` taşır.
>
> **Kilit künyesiz olamaz** — DB CHECK'i `fx_lock=true` iken `fx_frozen_rate` zorunlu kılar.

⏳ **Henüz yok:** kilit açma/kapama admin yüzeyi ve `admin_audit_log` kaydı (yüzey ADMIN
şeridinde). Bugün politika satırı yalnız DB'den girilebilir.

#### 8.2.1 Admin yüzeyi sözleşmesi (PRICING kararı, 2026-08-17)

Yüzeyi ADMIN şeridi yazar; **semantik burada tanımlıdır** ve UI ondan türetilir. Üç soru
ADMIN-CUSTOMER tarafından soruldu; cevapları bağlayıcıdır.

**[A] `fx_frozen_rate` ELLE GİRİLMEZ — UI kilit anındaki kuru ENSTANTANE alır.**
Kilit bir *zaman* kararıdır ("bu andaki kur sabitlensin"), fiyat pazarlığı değil. Elle
giriş yanlış-kur riskini ve denetlenemez bir serbestliği içeri sokar; sözleşmeli özel kur
ayrı bir özelliktir (v2) ve `fx_lock` ile karıştırılmamalıdır.

> **Kaynak sorgusu motorunkiyle BİREBİR aynı olmak zorundadır** — aksi hâlde kilit,
> motorun kullandığından *farklı* bir sayıya kilitler ve fiyat "kilitliyken" bile oynar.
> ✅ **2026-08-17'de YAPIYA ÇEVRİLDİ:** artık "dikkatli kopyala" talimatı yok — kur
> seçimi tek fonksiyondadır: `src/lib/services/fxRate.service.ts` →
> `resolveFxRate(supabase, quoteCcy, today)`. Motor, `resolvePrice` ve admin yüzeyi
> **üçü de onu çağırır**; bekçi **INV-PRICE-8** kopya sayısını 1'de tutar.
> Aşağıdaki sözleşme o fonksiyonun davranışıdır.
>
> Motorun seçimi (`pricingMaterialize.service.ts`, ölçüldü 2026-08-17):
> `currency_rates` → `base_ccy='TRY'` **(filtre ŞART)** + `quote_ccy=<ccy>` +
> `effective_date <= bugün(İstanbul)`, sıralama `effective_date DESC, fetched_at DESC`,
> `limit 1`, alan **`rate`**. **`spread_pct` OKUNMAZ** — UI da okumamalıdır.
> Enstantane alınan değer `fx_frozen_rate`'e yazılır; o anki `effective_date` künyeye not
> düşülür (`note` alanı yeterli, yeni kolon gerekmez).

**[B] Yüzey ham satırları değil ETKİN KİLİDİ gösterir** — ve mantığı yeniden yazmaz.
Merdiven "en özel kazanır" ilkesiyle çalışır ve **daha özel bir `fx_lock=false`, daha genel
bir kilidi bozar** (§8.3). Ham liste bu yüzden yanıltıcıdır: admin global kilit koyar, tek
ürünün oynadığını görür, sebebini bulamaz. Yüzey bir ürün/kapsam için
`resolveFxLockWithPolicies` (toplu: `resolveFxLocks`) **çağırarak** etkin sonucu gösterir ve
`FxLockDecision`'daki `policyId` + `scope` ile **hangi satırın kazandığını** yazar
("etkin: ürün düzeyi politika #… → kilit YOK").

> İkisi de `pricingPolicy.service.ts`'ten **zaten export edilmiştir**; ayrıca açmak
> gerekmez. Merdiveni UI'da tekrarlamak **INV-PRICE-7'nin tek-merdiven kuralını ihlal
> eder** (ikinci `switch (scope)` yasaktır) — yani kopya kapıdan geçmez.

**[C] `skippedFxLocked` sayacı yüzeyde GÖSTERİLİR.** Kilidi görünür kılan tek geri bildirim
odur: "son hesaplamada N ürün kilit yüzünden atlandı". Ayrıca sessiz-arıza kontrolüdür —
aktif kilit varken sayaç sürekli 0 ise kilit uygulanmıyor demektir.

**Migration gerekmez:** izin modeli bugün tutarlı (ADMIN-CUSTOMER ölçümü, 2026-08-17):
`pricing_policy` RLS = `super_admin|admin|moderator` + tenant-scoped; rbac'ta `pricing`
yazma izni admin+moderator → **UI izni ⊆ DB izni**. Satınalmada yaşanan "yetkisi var ama
verisi yok" tuzağı (purchasing-standard §8.1) burada YOK.

**W5 ile çakışma yok:** W5 TAMAMLANDI (`20260816120000_pricing_w5_policy_fx_lock.sql`
prod'da; `pricing_policy` tablosunu zaten o yarattı). Yüzey çalışması beklemez.

**[D] ÇOK PARA BİRİMLİ KAPSAMDA KİLİT ENGELLENİR** (ADMIN-CUSTOMER sorusu, 2026-08-17).

Kilit marka/kategori/global kapsamda birden çok para birimli ürünü kapsayabilir; tek bir
`fx_frozen_rate` o kapsamı **temsil edemez**. Kural:

1. Kilit kaydedilirken kapsamdaki ürünlerin `distinct purchase_currency` kümesi hesaplanır.
2. **Tek** para birimi → o para biriminin kuru `resolveFxRate` ile enstantane alınır.
3. **Birden çok** → kayıt **REDDEDİLİR**; admin'e kapsamı daraltması söylenir.

> **Niçin "uyar ama kaydet" değil.** `fx_frozen_rate` motorda hesaba **girmez** — ölçüldü
> (2026-08-17): `materialize` yalnız `locked` bayrağını okuyup ürünü atlar, `frozenRate`
> sadece `pricingPolicy.service` içinde taşınır. Yani alan **provenanstır**: "bu fiyat neden
> güncellenmedi" sorusunun tek cevabı. Provenans alanına kapsamı temsil etmeyen bir sayı
> yazmak, hesabı bozmaz ama **denetim kaydını yalanlar** — hesap hatasından daha sinsi,
> çünkü hiçbir yerde tutarsızlık üretmez, sadece geriye dönük soruyu cevapsız bırakır.
> "Baskın para biriminin kuru + not" alternatifi bu yüzden reddedildi: bulanık provenans,
> provenans değildir. Ayrıca uyarıp kaydetmek fail-open desenidir (yeni kapıya "uyar-geç"
> modu konmaz).
>
> **Bugün kimseyi bloklamaz:** ölçüm (ADMIN-CUSTOMER, 2026-08-17) 374 ürünün tamamının
> `purchase_currency = EUR` olduğunu, `pricing_policy`'nin 0 satır taşıdığını gösteriyor.
> Yani global kilit bugün tek para birimlidir ve kural sessizce geçer; koruma ilk USD
> ürün girildiği gün devreye girer.

**v1.1 yolu (migration → Recep paketi):** kapsam çok para birimliyken de kilitlenebilmesi
isteniyorsa doğru çözüm "bir sayı seç" değil, `pricing_policy`'ye **`quote_ccy` kolonu**
eklemektir — kilit satırı para birimi başına bir kayıt olur, merdiven aynen çalışır.
Bu, kolonu tüketicisiyle birlikte açma ilkesine de uyar (§8.3 kapsam kararı).

#### 8.2.2 `base_ccy` bütünlüğü — kalan DB adımı (PLAN, Recep paketinde)

Çözücü artık `base_ccy='TRY'` filtresini uyguluyor, yani **okuma tarafı güvende**. Ama
tablonun kendisi hâlâ TRY-dışı tabanlı satır kabul ediyor: `currency_rates.base_ccy`
üzerinde CHECK **yok** ve `source='manual'` serbest. Bugün zarar üretmiyor (2026-08-17
ölçümü: 6 satırın hepsi `base_ccy='TRY'`) — ama bu, kusurun *yokluğu* değil, verinin
şimdilik uyumlu olması.

**Planlanan (migration → kural 13, Recep onayı):**
1. `alter table public.currency_rates add constraint currency_rates_base_try check (base_ccy = 'TRY')`
   — v1'de motor yalnız TRY tabanlı çalışıyor; çoklu-taban gerçek bir ihtiyaç olduğunda
   kısıt gevşetilir ve **çözücü ile birlikte** tasarlanır.
2. Uygulamadan önce `select distinct base_ccy from currency_rates` ile **yeniden ölçüm**
   (bugünkü 6 satır ölçümü uygulama gününde bayat olabilir).
3. Kısıt eklenince `tcmb-rates-sync` yazma yolunun hâlâ geçtiği doğrulanır (pozitif çapa).

> Bu adım okuma kusurunu kapatmaz — **onu kod zaten kapattı**. Kısıtın işi, ileride
> yanlış tabanlı bir satırın tabloya *girmesini* engellemek.

### 8.3 Politika katmanı — kural ≠ politika (v1.1)

`pricing_rule` **nasıl hesaplanacağını** taşır; "bu markanın fiyatları EUR gösterilsin", "bu tedarikçi
kur değişiminden etkilenmesin", "bu kapsamda minimum marj %X" gibi **ayarlar** kuralın işi değildir.
Bunlar için aynı özgüllük merdivenini kullanan ikinci bir katman tanımlanır:

```
pricing_policy(scope, target_id, display_currency, fx_lock, min_margin_pct, ...)
```

- Merdiven §3.1 ile birebir aynıdır (en özel kazanır) — ikinci bir öncelik mantığı icat edilmez.
  ✅ **W5'te uygulandı ve KİLİTLENDİ:** hedef eşleşmesi tek bir fonksiyonda
  (`scopeMatchesProduct`, `pricing.service.ts`); hem `ruleMatchesProduct` hem politika çözücü
  onu çağırır. INV-PRICE-7 politika servisinin kendi `switch (x.scope)` bloğunu yazmasını
  **yasaklar** — iki kopya, bir gün ayrışacak iki mantıktır.

> **W5 KAPSAM KARARI — tablo bilerek DAR açıldı.** Yukarıdaki imzada `display_currency` ve
> `min_margin_pct` var; canlı tabloda **yok**, yalnız `fx_lock` ve künyesi var. Sebep: onları
> okuyan tüketici henüz yazılmadı. Bu depoda tam o hata tekrarlıyor — `venthub_order_items`
> snapshot kolonları bir yıl boş durdu (W2b-2) çünkü "kolon eklemek" ile "sözleşme kurmak"
> aynı sanıldı. **Alan, tüketicisiyle birlikte gelir.**
- **Tedarikçi boyutu:** şemada tedarikçi tablosu YOK (`products.supplier_name` serbest metinden ibaret).
  Tedarikçi-bazlı politika **T010 satınalma** ile gelir; o zamana kadar marka kapsamı vekildir.
- **Marka boyutu kırılgan:** `products.brand` TEXT, `pricing_rule.brand_id` ise `brands(id)` FK'si — köprü
  **isim eşleşmesi** üzerinden kuruluyor. İsim/boşluk/harf farkı = marka kuralı **sessizce eşleşmez**.
  `products.brand_id` FK'si marka-bazlı ayarların ön koşuludur; o gelene kadar materialize raporu
  "markası köprülenemeyen ürün" sayacını **göstermek zorundadır**.
- **RLS segment daraltması (R5, B2'den ÖNCE zorunlu):** `price_lists`/`product_prices` SELECT'ine segment
  koşulu; yoksa bayi fiyatı anon'a sızar.

---

## 9. Teklif (CPQ) katmanı — referans, gelecek faz

Asıl B2B satış burada (`dealer-network-standard.md §5/§6`): **RFQ → Teklif (temsilci pazarlık) → Sipariş.**
8 fiyat kademesi (Liste→Normal→Müşteri→Partner→Net), **onay eşiği** (marj/iskonto sınırını aşan teklif çok-seviyeli
onaya), monoton durum, proje/BOM (MTO→BOQ→BOM). **DB'de teklif tablosu YOK** → ayrı faz. Bu cetvelin katman 1–2'si
teklifin **girdi fiyatını** üretir; teklif onları pazarlıkla ezer.

---

## 10. Veri modeli (öneri — canlıya additive)

```sql
-- Maliyet (para-birimi-spesifik, zaman-versiyonlu). products genişletilir veya ayrı tablo:
ALTER TABLE products ADD COLUMN purchase_currency char(3);          -- 'EUR'|'USD'|'TRY'
ALTER TABLE products ADD COLUMN purchase_rate_to_base numeric(18,6);-- alışta snapshot TCMB
ALTER TABLE products ADD COLUMN cost_in_base numeric(14,4);         -- türetilmiş, donmuş TL
-- (margin_pct ürün-bazlı override pricing_rule scope:1 ile; products'a koyma — motor SSOT)

-- Marj kuralı motoru (Odoo pricelist.item + scope specificity + SAP exclusive)
CREATE TABLE pricing_rule (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL,
  price_book_id uuid NULL,           -- NULL=base kitap; dolu=bayi/segment overlay
  scope smallint NOT NULL,           -- 0 varyant 1 ürün 2 marka 3 kategori 4 global
  product_id uuid NULL, brand_id uuid NULL, category_id uuid NULL,
  method text NOT NULL,              -- 'cost_plus'|'fixed'|'percent_off_list'
  base text NOT NULL,                -- 'cost'|'list_price'|'parent_book'
  margin_pct numeric, surcharge numeric, fixed_price numeric,
  vat_rate_pct numeric DEFAULT 20, price_is_vat_inclusive boolean DEFAULT false,
  min_margin_abs numeric NULL, max_margin_abs numeric NULL,
  round_to numeric NULL, charm_ending numeric NULL,
  min_quantity numeric DEFAULT 1, priority int DEFAULT 0, is_exclusive boolean DEFAULT true,
  currency char(3) NULL,             -- NULL=tüm para birimleri
  valid_from date, valid_to date, updated_at timestamptz, updated_by uuid
);

-- Parite (append-only; elle ezme = yeni yüksek-öncelik satır)
CREATE TABLE currency_rates (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL,
  base_ccy char(3) DEFAULT 'TRY', quote_ccy char(3) NOT NULL,
  rate numeric(18,6) NOT NULL, spread_pct numeric DEFAULT 0,
  source text NOT NULL,              -- 'tcmb'|'manual'
  effective_date date NOT NULL, fetched_at timestamptz
);

-- Mevcut: price_lists (segment kitabı) + product_prices (materialize cache) — R0–R5 onarır, yeni kolon:
ALTER TABLE product_prices ADD COLUMN currency char(3) DEFAULT 'TRY';
ALTER TABLE product_prices ADD COLUMN net_price numeric, ADD COLUMN gross_price numeric, ADD COLUMN is_derived boolean DEFAULT true;
```
**Sabit kimlikler (blueprint §1):** tenant `d3b07384-…`; price_list individual/dealer/corporate `d9d138d8`/`d97fff9d`/`b3a14f1a`.

---

## 11. Çözümleme algoritması (deterministik, izlenebilir)

```
resolvePrice(supabase, product, qty, currency, userCtx):
  book = pickPriceBook(userCtx.tier_level)            # bayi kitabı varsa, yoksa base
  cost = lookupCost(product, currency)                # para-spesifik alış→TL maliyet
  rules = pricing_rule.where(tenant, book IN [book,BASE], currency IN [currency,NULL],
                             min_quantity<=qty, today IN [valid_from,valid_to], matchesScope(product))
  rules.sort(scope ASC, bookRank ASC, min_quantity DESC, priority DESC, id DESC)
  chosen = first exclusive match                      # SAP stop-at-first-hit
  p = computeBase(chosen, cost) + surcharge           # cost_plus: cost*(1+margin/100)
  p = clampMargin(p, cost, min/max_margin)
  (net, gross) = applyVat(p, vat_rate, inclusive?)
  return roundPerCurrency(net/gross, currency, round_to, charm)   # EN SON
# matchesScope: kategori → ürün.kategori veya path STARTSWITH (alt-cascade); marka → ürün.brand; vb.
```
**İzlenebilirlik zorunlu:** "hangi kural neden kazandı" trace'i (admin debug + güven).

---

## 12. Admin panel (B1 — `admin-standard.md` K1–K5'e uyar)

- **Ayarlar:** para birimleri, parite (oto TCMB + elle ezme + spread), KDV oranı + dahil/hariç modu, varsayılan
  yuvarlama/charm politikası.
- **Marj kuralları:** scope (ürün/marka/kategori/global) bazlı kural CRUD + **etkin-marj matris önizleme**.
- **Ürün başına:** alış + para birimi + (ops.) marj override + her para biriminde **canlı hesaplanan satış** önizleme.
- **K1–K5 zorunlu:** jenerik table-kit (K1), URL-state (K2), RBAC 3-katman + sunucu RLS (K3),
  `logAdminAction` gerçek-yazma (K4), 5 durum (K5). §8 skoru ≥20/24.

---

## 13. Zorunlu kurallar (CLAUDE.md + standartlar)

| Kural | Kaynak |
|---|---|
| `lib/services/*` ilk param `supabase: SupabaseClient<Database>` (DI) | CLAUDE.md §2 |
| `any` yasak, strict TS | §3 |
| Tüm okuma/yazma **tenant-scoped** (`tenant_id = jwt_tenant_id()`) | §12 |
| Yetki/segment **app_metadata**'dan (asla `user_profiles.role`/`raw_user_meta_data`) | §12 |
| Sipariş satırında **9 snapshot alanı** yazılır (unit/list_id/name/sku/tax_rate/product jsonb **+ display_currency/display_rate/rate_effective_date**). 8'i DB'de NOT NULL; **`price_list_id_snapshot` bilerek nullable** — fiyat bir listeden değil kuraldan/tekliften gelebilir, o durumda liste kimliği YOKTUR. Kodun alanı **yazması** yine zorunlu, değerin dolu olması değil | blueprint §R3 + §4.1 |
| Idempotent seed: sabit `valid_from` + `ON CONFLICT DO NOTHING` | blueprint §B2 |
| Materialize **`is_derived=false` satırı ezmez** (elle-ezme/dondurma dokunulmaz) | §8.1 |
| KDV oranı **üründen** (`products.tax_rate`/`is_taxable`); kural alanı yalnız override | §5 |
| Cache tekil anahtarı **currency içerir** | §8.1 |
| Fiyat kilidi kapsamı `refreshCostInBase` + materialize tarafından **atlanır** | §8.2 |
| Sipariş/teklif durumu **monoton** | §11 |
| Marj/iskonto eşiği aşımı → çok-seviyeli onay | dealer §5 |

---

## 14. Enforcement (cetvel + onu zorlayan test)

Standart-artı-zorlayan-test = kontrol. **Durum dürüstlüğü (v1.1):** cetvel "kilitli" dediği için kilitli
sanılan iki test aslında YOKTU. Gerçek durum:

| Test | Ne kilitler | Durum |
|---|---|---|
| **INV-PRICE-1** | `products.price` hiçbir müşteri-yüzeyi kod yolunda **doğrudan** okunmaz | ❌ **YOK** — üstelik çözücünün kendisi hâlâ `products.price`'a fallback ediyor (§8 borcu, W4b'de kapanır) |
| **INV-PRICE-2** | Çözücü segment için `user_profiles.role` okumaz (yalnız `app_metadata`) | ✅ VAR (`pricing-segment-source.test.ts`, ratchet 0, edge dahil) |
| **INV-PRICE-3** | Sipariş-item yazan her yol **9 snapshot alanını** doldurur (no-op = FAIL) | ✅ VAR (`pricing-order-snapshot-contract.test.ts`, W2b-2) — üç yönlü bağ: cetvel §13 ↔ migration NOT NULL ↔ yazma yolu. **Asıl fail-closed katman DB kısıtıdır** (8 alan NOT NULL); test onun da yerinde durduğunu doğrular |
| **INV-PRICE-4** | Para float saklanmaz; `currency_rates` append-only (UPDATE/DELETE policy yok) | ✅ VAR (`pricing-money-append-only.test.ts`) |
| **INV-PRICE-5** | KDV oranı üründen okunur; kuralda sabit oran varsayımı yok | ❌ YOK — §5 kararıyla birlikte yazılacak |
| **INV-PRICE-6** | Cache anahtarı currency içerir; `product_prices`'a yalnız materialize servisi yazar; `is_derived` ayrımı korunur | ✅ VAR (`pricing-cache-invariants.test.ts`) |
| **INV-PRICE-7** | Fiyat kilidi zincirin **iki halkasında** da uygulanır (`refreshCostInBase` + materialize, `skippedFxLocked` sayaçlı); merdiven **tek** fonksiyondadır (politika kendi `switch (scope)`'unu yazamaz); kilit **künyesiz** olamaz (DB CHECK) | ✅ VAR (`pricing-fx-lock-contract.test.ts`, W5) — davranış + yapı + şema üç katman; 6 merdiven senaryosu gerçekten koşturulur, iki bacaktan bilerek bozulup KIRMIZI görüldü |
| **INV-PRICE-8** | "Bugün geçerli kur hangisi?" sorusunun kopya sayısı **1**: yalnız `fxRate.service.resolveFxRate` seçer; motor + `resolvePrice` + admin yüzeyi onu **çağırır**; çözücü `base_ccy=TRY` filtresini uygular | ✅ VAR (`pricing-fx-rate-single-resolver.test.ts`, 2026-08-17) — kusurun kendisi (filtresiz ikinci kopya) sabotajla geri konup KIRMIZI görüldü; ayrıca filtre silme ve üçüncü okuyucu doğurma sabotajları |

> **Kural:** bu tabloda ❌ olan bir maddeyi "kilitli" varsayarak karar verme. Cetvelin kendisi de denetlenir.

### 14.1 INV-PRICE-3'ün bilinen sınırları (kapsamı dürüstçe yaz)

Bir kapının neyi **görmediğini** yazmamak, onu olduğundan güçlü göstermektir.

- **Eş-konumluluk şartı.** Tarayıcı statiktir: 9 alan adını, `insert`/POST'un yapıldığı **aynı
  dosyada** arar. Satır kurucusunu paylaşılan bir modüle taşımak (ör.
  `_shared/orderItemSnapshot.ts`) sözleşmeyi bozmaz — **ama testi kırar.** Böyle bir refactor
  meşrudur; doğru hamle önce tarayıcıyı yeni yapıya uyarlamaktır, alanları geri kopyalamak değil.
  Bu uyarı testin hata mesajına da gömülüdür (yanlış teşhis, sessiz-yeşilden hızlı güven kaybettirir).
- **Migration bacağı metinseldir.** Test tek bir migration dosyasının içeriğine bakar, **canlı
  şemaya değil**. Sonraki bir migration NOT NULL'ı düşürürse test bunu görmez.
- **Tarama kapsamı** `src/**` + `supabase/functions/**`. `scripts/**` dışarıdadır (bugün orada
  sipariş kalemi yazan yok).
- **Kasıtlı atlatma kapsam dışı** (tehdit modeli: drift dedektörü). Tablo adı bir sabite alınırsa
  (`.from(TABLE)`) yeni yol görünmez olur. Asıl fail-closed katman DB'deki NOT NULL kısıtlarıdır.
- ~~**`rate_effective_date` UTC tarihidir**~~ ✅ **W5'te KAPANDI.** `iyzico-payment` artık
  `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' })` ile **İstanbul günü** yazıyor.
  Eskiden TSİ 00:00–03:00 arası verilen sipariş bir önceki günü yazardı; `currency_rates`
  kayıtları TCMB işiyle İstanbul gününe göre düştüğü için bu, siparişi bir gün eski kura
  bağlar ve fark **kimseye görünmezdi**. ⚠️ DB varsayılanı (`current_date`) hâlâ sunucu/UTC
  günüdür — kod değeri **daima açıkça gönderdiği** için pratikte devreye girmez, ama başka bir
  yazar eklenirse aynı kaymayı geri getirir.
- **Okuma tarafı yarım.** Yalnız `account/OrderDetailPage` snapshot kolonlarına geçti;
  `views/OrdersPage.tsx`, `views/admin/OrdersTableBody.tsx`, `components/admin/orders/OrderFormModal.tsx`
  hâlâ `product_name`/`price_at_time` okuyor. Bugün kırılmaz (aynı INSERT ikisini de aynı kaynaktan
  yazar) ama blueprint §R3 "hiçbiri atlanmaz" diyor — ADMIN-UX şeridine devredildi.

---

## 15. Build sırası (R0–R5 ile entegre — Recep "önce temel onarım" seçti)

```
F0  Maliyet+parite temeli: products kolonları + currency_rates + TCMB günlük job (cron 15:30, 404-carry)
F1  Marj motoru: pricing_rule tablosu + resolvePrice() (DI, app_metadata) + materialize → product_prices
    ↳ bu, blueprint R2 (çözücü yeniden-yaz) ile aynı yere iner; ölü order-validate + çift-const + _text() onarılır
R0–R5 (blueprint): tablo versiyonla / kimlik (org-tier) / çözücü tek sözleşme / sipariş snapshot / tenant RLS / segment RLS
F2  Admin paneli (B1): ayarlar + marj matris + ürün fiyat önizleme (K1–K5)
F3  Seed (B2): product_prices'ı motorla doldur (idempotent); 29 borç-ürünü modele oturt (€ alış)
F4  Eski 359 ürünü modele geçir (alış+para+marj-kural); düz products.price emekli
F5  (Gelecek) Teklif/CPQ hattı: quotes/quote_items, RFQ→Teklif→Sipariş, 8 kademe, onay eşiği
```

---

## 16. Provenance

Araştırma: 3 paralel ajan — (1) cross-platform cost-plus mimarisi (Odoo `product_pricelist_item` formül motoru +
`applied_on` merdiveni, SAP condition-technique/Exclusive stop-at-first-hit, Salesforce CPQ `PricingMethod=Cost`,
Magento/Shopify/BigCommerce/Woo "native cost-plus YOK" boşluğu), (2) çoklu-para + KDV (base-TRY, iki kur rolü,
TCMB today.xml, net-sakla, e-Fatura yuvarlama), (3) VentHub canlı yer-gerçeği (`pricing.service.ts`,
`order-validate`/`iyzico-payment` bug'ları, `price_lists`/`product_prices`/`organizations` şema, R0–R5 roadmap,
admin K1–K5). Zemin: `dealer-network-standard.md`, `dealer-module-blueprint.md`, `admin-standard.md`,
memory `pricing-currency-requirements`. Kaynaklar ajan çıktılarında atıflı (Odoo 17 source, SAP Learning,
Salesforce Help, Adobe/Shopify/BigCommerce docs, TCMB, PwC Türkiye KDV, ISO 4217).

---

> v1.0 · 2026-06-19 · İlk sürüm (araştırma + sentez). Değişiklikte sürüm yükselt + provenance güncelle.
>
> v1.1 · 2026-08-14 · **Çürüyen varsayım düzeltmesi + esneklik maddeleri.** Kaynak: (a) veri doğrulaması —
> `purchase_price`'ın kaynağı AVenS Ürün Fiyat Kataloğu 2026.1 (liste fiyatı, alış değil); (b) Recep'in
> gereksinim beyanı (ürün/grup bazında para birimi · kur değişimine kapatma/dondurma · marka ve tedarikçi
> bazında ayar); (c) cetvel↔canlı-şema↔motor sapma denetimi (opus). Değişenler: §2 iki tabana bölündü ·
> §4.1 çoklu-para satış sözleşmesi + spread sapması · §5 KDV SSOT = ürün · §6 minor-int kuralı gerçeğe
> çekildi · §8.1 cache sözleşmesi · §8.2 fiyat kilidi · §8.3 politika katmanı · §13 snapshot 6→9 alan ·
> §14 test durum tablosu (dürüstlük). Açık borçlar cetvelde ⚠️ ile işaretli.
