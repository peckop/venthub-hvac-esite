# REC-412 — Yönetici panelinde TEK ÜRÜNE fiyat girme yolu (PLAN, kod yok)

> **Ne bu?** `/admin/products`'ta bir ürünün satış fiyatını girmek/değiştirmek için yol kurma planı.
> Sahip: ADMIN · Oluşturma: 2026-09-29 · Durum: **PLAN — onay bekliyor, kod YAZILMADI.**
> Kayıt: Linear REC-412 (yan bağlam: #1391 emekli `products.price` yazımını kapattı; yerine yol konmadı).

**KAYNAK/CETVEL**
* `docs/standards/pricing-standard.md` — §1 altın kural (fiyat TÜRETİLİR, elle yazılmaz), §3.1 öncelik merdiveni
  (scope 1 = ürün), §8.1 cache sözleşmesi, §12 admin panel ("ürün başına … marj override + canlı satış önizleme").
* `docs/standards/rendering-cache-standard.md` — §2 (fiyat yalnız PDP'de görünür), §3 (`product_prices` tetik + webhook dalı).
* Karar 95/99 (moderatör maliyet ve liste fiyatını görmez) · `docs/standards/admin-design-standard.md` (yan panel/overlay kiti) ·
  `docs/standards/satis-kipi-gecis-standard.md` (satış kipi ayrı anahtar).
* **CETVEL BOŞLUĞU (dürüst kayıt):** pricing-standard §12 "ürün başına marj override" der ama **tek ürüne fiyat girişi** için sözleşme
  YOK. Kural 1 gereği bu işin kapsamı = cetvele **§12.1 "Tek ürün fiyat girişi sözleşmesi"** yazmak (Faz 2).

**YÖNTEM:** şerit ADMIN, elle; migration YOK beklenir → plan-challenger zorunlu değil, ama Faz 1 bittiğinde `security-reviewer`
(yazma yolu + rol ayrımı) ve `diff-review`. Migration çıkarsa plan-challenger + Recep kapısı (kural 13).

---

## 1. Ölçüm — ne biliyoruz (2026-09-29, kod + canlı salt okuma)

| Konu | Bulgu | Kanıt |
|---|---|---|
| Vitrin fiyatı nereden gelir | `product_prices` satış satırı (bireysel liste, TRY, `gross_price`); `products.price` EMEKLİ | `ProductsTableBody.tsx:40-49` |
| Canlı veri | 1044 türetilmiş satır (348 ürün × 3 liste), **elle ezilmiş (`is_derived=false`) satır 0** | `product_prices` sorgusu |
| Kural havuzu | `pricing_rule` **1 satır**: global (scope 4) `cost_plus`; **ürüne özel kural 0** | `pricing_rule` sorgusu |
| Tek ürün için mevcut yol | VAR ama görünmez: `/admin/pricing/rules` → kural formu **scope 1 (ürün) + method `fixed` + `fixed_price` (KDV dahil işaretiyle)** destekliyor | `PricingRuleFormModal.tsx:68-127`, `pricing.service.ts:361-384` |
| Kural kaydedince ne olur | **Vitrin DEĞİŞMEZ.** Kaydetme `pricing_rule`'a yazar; `product_prices` yalnız `materializePrices` (TÜM katalog, `MaterializePricesModal`) koşunca yazılır | `pricingMaterialize.service.ts:290` |
| Yetki | `pricing_rule` yazma: super_admin/admin/**moderator**; `product_prices` yazma: **yalnız admin** (`is_user_admin`) | `pg_policy` sorgusu |
| Satış kipi | Ayrı anahtar (`satis_kipi`, fail-closed). Fiyat yazmak satışı AÇMAZ | `src/lib/kip/satisKipi.ts` |

**Sonuç:** REC-412'nin "yol yok" varsayımı **yarı doğru.** Yol var (rules sayfası) ama (1) ürün satırından erişilmiyor, (2) üç ekranlık
bir iş (kural yaz → kataloğun TAMAMINI yeniden hesapla → vitrine bak), (3) yayın **kör**: kural yazıldı sanılır, vitrin eskiyle kalır —
2026-08-15 "1044 satır yazıldı, vitrin değişmedi" sınıfı.

## 2. Seçenekler

| | A · Ürün satırından "Fiyat" yan paneli (önerim) | B · Satırdan kural sayfasına derin bağlantı | C · Liste fiyatı (alış) alanını ürün satırında yazmak |
|---|---|---|---|
| Ne yapar | Panel: mevcut vitrin fiyatı + hangi kural kazandı + **sabit fiyat** gir → `pricing_rule` (scope 1) yaz → **yalnız o ürünü** yeniden hesapla → vitrin satırını **geri oku, doğrula** | Satırdan `/admin/pricing/rules?urun=<id>` (scope 1 önceden dolu) | `products.purchase_price/currency` yaz (tetikle `product_costs`'a akar) |
| Vitrin gerçekten değişti mi | **Ölçer ve gösterir** | Hayır (yine katalog çapında yeniden hesap gerekir) | Hayır |
| Maliyet gizliliği (karar 95) | Panelde maliyet/liste alanı YOK | Aynı kural formu | ⚠ Alış fiyatı = maliyet; moderatör göremez |
| Migration | Yok | Yok | Yok, ama REC-140 Faz 3 yazıcıyı `product_costs`'a taşıyor → çakışır, KATALOG hattının işi (REC-383) |
| Bedel | 2 PR (servis + panel) | ~yarım gün | — |
| Hüküm | **ÖNER** | Yalnız A onaylanmazsa asgari | **BU İŞTE YAPILMAZ** (ayrı kayıt, katalog hattı) |

## 3. Tasarım A (önerilen)

**Kapsam v1:** yalnız **sabit satış fiyatı** (+ "kuralı kaldır → genel kurala dön"). Marj override kural sayfasında kalır: `cost_plus`
maliyete dayanır → panel moderatör için maliyet okumak zorunda kalırdı ve REC-140 Faz 3'le çakışırdı.

1. **Servis (ilk PR, panelsiz):**
   * `materializePrices` seçeneğine `productIds?: string[]` (mevcut SAF çekirdek `resolvePriceWithRules` yeniden kullanılır; **ikinci hesap kopyası YOK**).
   * `pricingAdmin.service.ts`: `setProductFixedPrice(supabase, productId, {gross|net, vatIncluded})` (varsa scope 1 + `fixed` kuralı GÜNCELLER, yoksa oluşturur; **ürün başına tek kural**) ve `clearProductFixedPrice`.
   * `verifyProductStorefrontPrice(supabase, productId)`: bireysel liste, TRY, aktif `product_prices` satırını okur; beklenenle karşılaştırır.
2. **Panel (ikinci PR):** `ProductPricePanel.tsx` (`components/admin/products/`), AdminSidePanel kiti; `ProductsTableBody` satır eylemi "Fiyat" (yalnız `hasWriteAccess`).
   * Gösterir: vitrinde görünen fiyat (KDV dahil) · kazanan kural + izlenebilirlik satırı (`resolvePriceWithRules` trace) · giriş: tutar + "KDV dahil" işareti.
   * Kaydet = kural yaz → yalnız bu ürünü yeniden hesapla → vitrin satırını geri oku → **"Vitrinde görünen: ₺X (ölçüldü)"** ya da açık uyarı. Sessiz başarı YOK.
3. **Rol ayrımı (UI ⊆ DB):** admin = tam akış. **Moderatör** kural yazabilir ama `product_prices` yazamaz → panel "Kural kaydedildi; vitrine yansıtmak için yönetici yeniden hesaplamalı" der, yeniden hesap düğmesi kapalı. Moderatörde **hiçbir maliyet/liste alanı** çekilmez.
4. **Tazeleme:** yazılan satırlar mevcut `on_product_prices_ins_del/upd` tetikleri + webhook dalıyla yalnız o ürünün PDP yolunu tazeler (rendering-cache §3); yeni tetik gerekmez. Ürün başına 3 satır (3 liste) = 3 webhook.
5. **Hata yolları (kural 14):** ağ yok / yetki yok / veri boş / kural yazıldı-yeniden hesap düştü (kısmi başarı AÇIK yazılır, "tekrar dene") / `min_quantity>1` kural yasağı (§8.1.4) / fx kilidi (sabit fiyat kuru kullanmaz; yine de kilitli kapsamda uyarı satırı).
6. **i18n/token/a11y:** metin sözlükten (TR+EN parite), token sınıfları, odak halkası, Esc/odak tuzağı kit tarafından.
7. **Cetvel §12.1 (bu işin parçası):** sözleşme yazılır + kapı **INV-ADMIN-FIYAT-GIRISI-1**: (a) panel `products.price`'a YAZMAZ, (b) yazımdan sonra `product_prices` geri okuması vardır, (c) moderatör yolunda maliyet kolonu yoktur. Sabotajla kanıtlanır.

## 4. Fazlar ve kabul ölçütleri

| Faz | İş | Bitti sayılır |
|---|---|---|
| 0 | Bu plan → OPS onayı, aşağıdaki 3 soru cevabı | onay |
| 0.5 | **Fiyat değişiklik günlüğü** (§5b): migration (tetikler + `degisiklik_yontemi`) + kapı `INV-FIYAT-GUNLUGU-1`; plan-challenger + Recep kapısı | tablolarda tetik var, yazan her yol yöntem veriyor, kapı sabotajla kırmızı→yeşil; günlük satırı canlıda ölçülür |
| 1 | Servis PR'ı (tek ürün yeniden hesap + tek kural yazımı + geri okuma) | birim testler: fixed net/gross, güncelle-vs-oluştur, yetkisiz yol; `resolvePriceWithRules` tek kopya; CI yeşil |
| 2 | Panel PR'ı + cetvel §12.1 + kapı | bileşen testleri (yükleniyor/yetkisiz/kısmi başarı/doğrulandı), kapı sabotajla kırmızı→yeşil |
| 3 | **Canlı kanıt** | Recep onayıyla TEK test ürününde yaz → PDP'de gör → geri al (prod yazma kapısı); vitrin satırı geri okuma çıktısı rapora |

Geri alma: ürün kuralı silinir + o ürün yeniden hesaplanır (genel kurala döner); veri kaybı yok.

## 5. Kararlar (OPS hükmü, 2026-09-29 — plan A KABUL)

1. **KDV dahil/hariç girişi SEÇİMLİ (Recep 2026-09-29; OPS'un önceki "KDV dahil" hükmü GERİ ALINDI).** Panelde seçici (varsayılan = kullanıcının son seçimi, tarayıcıda saklanır); ikisi HER ZAMAN yan yana görünür: "KDV hariç ₺X · KDV dahil ₺Y · vitrinde ₺Z (ölçüldü)". Saklama cetveldeki gibi HARİÇ net; "dahil" girilirse kural `price_is_vat_inclusive=true` ile yazılır, çözücü net'e indirger.
1b. **Satır içi giriş (Recep 2026-09-29):** fiyat ürün LİSTESİNDEN, tablo satırında da girilebilir (mevcut `saveInlineEdit` deseni); yan panelle AYNI servis (`setProductFixedPrice`), aynı KDV seçici ve doğrulama; iki yüzey ayrı yazma yolu DEĞİL.
2. **Moderatör kural yazar, vitrine yansıtmayı admin yapar** (DB yetkisiyle uyumlu). Moderatör panelinde "yansıtma admin onayında" görünür; yeniden hesap düğmesi kapalı.
3. **Liste fiyatı (alış) girişi bu işin DIŞINDA**, ayrı kayıt (karar 95 + REC-140 Faz 3 / REC-383 bağımlılığı).
4. **Kod yazılırken plan-challenger önerisi (zorunlu değil, migration yok):** fiyat yazan kod ilk PR'da çalıştırılır, bulgular bu plana işlenir.
5. **Canlı kanıt (Faz 3) prod veri yazımıdır = Recep kapısı;** o adıma gelince OPS üzerinden onaya götürülür.

## 5b. Fiyat değişiklik günlüğü — ÖLÇÜM (2026-09-29, canlı salt okuma + kod) ve ZORUNLU parça

Recep sorusu: "sistem fiyat kayıtlarını/loglarını tutuyor mu? Kim, ne zaman, hangi yöntemle güncelledi?"

| Yol | Kim | Ne zaman | Eski→yeni | YÖNTEM | Kanıt |
|---|---|---|---|---|---|
| `products` (liste/alış fiyatı, maliyet, eski fiyat alanı; CSV içe aktarma, ürün formu, satır içi düzenleme, maliyet yenileme hepsi buraya yazar) | VAR (`auth.uid()`; servis rolüyle yazılırsa NULL) | VAR | VAR (yalnız değişen kolonlar, jsonb) | **YOK** (yalnız `comment`te `session_user`) | DML tetiği `denetim_izi_products`; 636 UPDATE satırı (2025-12-09 → 2026-09-26) |
| `pricing_rule` (fiyat/marj kuralı) | — | — | — | — | **Tetik YOK.** İstemci `mutateWithAudit` çağırıyor ama canlıda `pricing_rule` için **0 satır** |
| `product_prices` (vitrin fiyatı: yeniden hesap + elle ezme) | — | — | — | — | **Tetik YOK.** Tek satır (2026-08-15); 1044 satırlık yeniden hesap günlüğe DÜŞMÜYOR |
| `price_lists`, `currency_rates`, `pricing_policy` (kur kilidi) | — | — | — | — | Tetik YOK; istemci denetimi var, canlıda 0 satır |
| Ayrı fiyat geçmişi tablosu | — | — | — | — | **YOK** |

**Sonuç:** "Kim/ne zaman/eski→yeni" yalnız `products` için var; **vitrin fiyatını gerçekten belirleyen iki tablo (`pricing_rule`, `product_prices`) DB düzeyinde hiç izlenmiyor**, istemci denetimi de **yazımdan SONRA, hata olursa yutuluyor** (`mutateWithAudit` catch → `console.error`, "non-fatal") ve canlıda kanıt satırı yok. **"Hangi yöntemle" alanı hiçbir yolda yok** (panel / liste / CSV / yeniden hesap / maliyet yenileme ayırt edilemez).

**ZORUNLU parça (Faz 0.5 — migration → plan-challenger zorunlu + Recep kapısı, kural 13):**
1. `pricing_rule` ve `product_prices` (+ `price_lists`, `pricing_policy`, `currency_rates`) üzerine mevcut `denetim_izi_yaz()` tetiği (aynı fonksiyon, yeni tablo; no-op eleme ve fail-closed davranışı hazır). `product_prices` yeniden hesabı ~1044 satır: yalnız DEĞİŞEN kolon satırları yazılır (fonksiyon zaten eliyor) ama toplu gürültü için `is_derived=true` yazımları özet satırına indirgenir (karar Faz 0.5'te).
2. **YÖNTEM alanı:** iki tabloya `degisiklik_yontemi text` (CHECK: `panel | liste | csv | yeniden_hesap | maliyet_yenileme | sistem`); istemci yazım yükünde taşır, tetik `comment`e kopyalar. (PostgREST her istek ayrı işlemdir; oturum değişkeni istekler arası taşınmaz — satır alanı tek güvenilir taşıyıcıdır.)
3. **Kapı `INV-FIYAT-GUNLUGU-1`:** (a) fiyat yazan her kod yolu (`pricing_rule`, `product_prices`, `products.purchase_price/purchase_currency`) `degisiklik_yontemi` verir, vermeyen KIRMIZI; (b) migration'da bu tabloların her birinde denetim tetiği vardır. Sabotajla kanıtlanır.
4. Okuma yüzü: ürün panelinde "Fiyat geçmişi" (kim · ne zaman · eski→yeni · yöntem), `admin_audit_log` süzgeci; moderatör maliyet kolonlarını görmez (karar 95).

## 6. Yan bulgu (kapsam dışı, kayıt önerisi)

`pricing_rule` RLS politikaları yetkiyi `user_profiles.role`'den okuyor (CLAUDE.md kural 12: yetki `app_metadata`). Bu iş etkilemez ama REC-140 çizgisiyle birlikte ALTYAPI'ya bildirilmeli.

## 7. Riskler

* Kural sayfası listesi 500 satır tavanlı (`PRICING_RULE_LIST_LIMIT`); ürün başına kural çoğalırsa tavana yaklaşır → sayaç/uyarı Faz 2'de.
* Aynı ürüne iki yönetici aynı anda yazarsa: ürün başına tek kural + güncelle semantiği; son yazan kazanır, panel geri okumayla gösterir.
* "Vitrine yansıdı" ölçümü veritabanı satırını doğrular; sayfa önbelleğinin tazelendiğini ayrıca Faz 3 canlı kanıtı ölçer.
