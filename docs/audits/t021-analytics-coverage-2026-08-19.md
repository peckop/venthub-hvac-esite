# T021-VH — Analitik olay kapsaması ölçümü (2026-08-19)

> Şerit: LEGAL-SEO · Cetvel: `docs/standards/analytics-standard.md`
> Kapı: `src/__tests__/conformance/analytics-event-taxonomy.test.ts` (INV-ANALYTICS-1)
> İlgili: T020-VH (rıza kapısı, PR #524 — **kapandı**) · INV-CSP-1 (GA origin'leri)

## 1. Soru

T021 "GA4 kurulumu" olarak duruyor ve tıkanığı `NEXT_PUBLIC_GA_ID` — Recep'te. Sorulan:
kimlik geldiği gün ölçüm gerçekten çalışır mı, yoksa kimlik yalnızca **görünür** bir eksik mi?

## 2. Ölçüm

`src/` altında `trackEvent()` çağrı yerleri (motorun kendisi ve testler hariç):

| Dosya | Olay |
|---|---|
| `src/components/StickyHeader.tsx` | `nav_click` (target: categories) |
| `src/components/StickyHeader.tsx` | `nav_click` (target: menu) |
| `src/components/CaseStudySection.tsx` | `case_study_click` |

**Toplam üç çağrı, iki farklı olay adı.** İkisi de gezinme/içerik olayı.

Cetvelin taksonomi tablosunda tanımlı ticaret hunisi ise on olaydan oluşuyor:
`view_item` · `view_item_list` · `add_to_cart` · `remove_from_cart` · `begin_checkout` ·
`purchase` · `search` · `calculator_used` · `lead_submit` · `whatsapp_click`.

**Bu onun hiçbiri koda bağlı değil** — birincil dönüşümler `purchase` ve `lead_submit` dâhil.

Ters yönde de kayma var: ateşlenen iki ad (`nav_click`, `case_study_click`) cetvelin
tablosunda **yazmıyordu**. Yani tablo kodun gerisinde, kod da tablonun gerisindeydi; iki
yönlü ve kimse bakmıyordu.

Motor tarafı sağlam (T020'de kapandı, yeniden ölçüldü): `trackEvent` gönderimden önce
`hasConsent('analytics')` soruyor, GA/GTM etiketi yalnız `ConsentGatedAnalytics` içinden ve
yalnız rıza varsa yükleniyor, `NEXT_PUBLIC_GA_ID` yokken bileşen hiçbir şey render etmiyor.

## 3. Sonuç: kimlik tek başına ölçümü açmaz

`NEXT_PUBLIC_GA_ID` env'e konulduğu gün olan şudur: GA4 hesabı veri almaya başlar ve gelen
veri **menü tıklamalarından ibarettir**. Dönüşüm hunisi boş görünür.

Tehlike, eksikliğin kendisinden çok **görünüşünden** gelir: boş huni ile "satış yok" ekranda
aynı görünür. Ölçüm kurulmuş sayılır, panolara bakılır, hiçbir ticari soruya cevap alınamaz ve
sebebin veri yokluğu mu yoksa iş yokluğu mu olduğu ayırt edilemez.

Bu yüzden **huninin bağlanması, kimliğin girilmesiyle aynı işin parçasıdır.** İkisi ayrı
sırada beklerse, arada geçen sürede toplanan veri de yorumlanamaz.

## 4. Yapılan (bu PR)

1. **Cetvel gerçeğe getirildi.** `nav_click` ve `case_study_click` taksonomi tablosuna
   eklendi (kodda zaten vardılar). "Bugünkü kapsama" bölümü, on olayın bağlı olmadığını ve
   bunun GA4 açıldığı gün ne anlama geleceğini adıyla yazıyor.
2. **Kapı kuruldu — INV-ANALYTICS-1.** İki yönlü:
   - **R1 (koddan cetvele):** ateşlenen bir olay adı tabloda yazmıyorsa kırmızı. Yeni olay
     sessizce doğamaz; önce SSOT'a girer.
   - **R2 (cetvelden koda):** bağlanmamış olaylar test içinde `HENUZ_BAGLI_DEGIL` listesinde
     adıyla duruyor. Bir olay koda bağlandığı anda listeden **düşürülmek zorunda** — aksi
     hâlde kapı kırmızı. Liste bir geri sayımdır: kısalır, uzamaz.
   - **R3 (körlük yasağı):** `trackEvent()` ilk argümanı düz metin olmalı. Tek bir
     `trackEvent(ad, …)` satırı statik tarayıcıyı topluca kör ederdi.
   - **R0/R0b:** sahte-yeşil kilidi (tarayıcı gerçekten dosya/çağrı buluyor mu) ve dedektör
     sağlığı (yorum içindeki çağrı sayılmaz, URL'deki çift-bölü yorum sanılmaz).
3. **DoD kutusu bekçiye devredildi.** "Huni olayları akıyor" kutusu, `HENUZ_BAGLI_DEGIL`
   listesi boşalmadan işaretlenemez hâle geldi. Cetvelin kendi tespiti uygulandı: bir kontrol
   listesi maddesi zaman farkına dayanamaz, bekçi dayanır.

Kapı üç kasıtlı sabotajla sınandı, üçü de kırmızı verdi ve temizlikten sonra yeşile döndü:
cetvelde olmayan ad ateşlendi (R1) · listedeki bir olay bağlandı ama listede bırakıldı (R2) ·
olay adı değişkene çevrildi (R3).

## 5. Yapılmayan ve niçin

Huni olaylarının **koda bağlanması** bu PR'da yok. Çağrı yerleri sepet, ödeme, ürün ve
hesaplayıcı yüzeyleridir; bu dosyalar I18N-SWEEP, PRICING-STOK ve ADMIN şeritlerinin
sahasındadır. Tek şeridin kendi başına gireceği bir iş değil — şerit sahipliği kuralı gereği
iş dağılımı OPS-AUDIT'e bırakıldı.

Önerilen bölüm (ölçüme dayalı, bağlayıcı değil):

| Olay | Yüzey | Şerit |
|---|---|---|
| `view_item`, `view_item_list` | ürün/kategori sayfaları | I18N-SWEEP (ürün sayfası sahibi) |
| `add_to_cart`, `remove_from_cart` | sepet | I18N-SWEEP (`CartPage.tsx`) |
| `begin_checkout`, `purchase` | ödeme akışı | PRICING-STOK (checkout/iyzico) |
| `search` | arama kutusu | ADMIN/vitrin araması — sahibi netleşmeli |
| `calculator_used` | hesaplayıcılar | LEGAL-SEO alabilir (`views/calculators/`) |
| `lead_submit`, `whatsapp_click` | LeadModal, WhatsAppFloat | I18N-SWEEP |

## 6. Açık kalan (Recep)

- `NEXT_PUBLIC_GA_ID` (ve varsa GTM container) — env'e girecek.
- Search Console bağlantısı + sitemap gönderimi.
- **Çerez Politikası metni:** bugün "Site hâlihazırda analitik/pazarlama çerezi
  kullanmamaktadır" diyor. GA açıldığı an bu cümle yanlış beyan olur; `_ga`/`_ga_*` satırları
  ve saklama süreleri girilmeli (`src/views/legal/components/{tr,en}/CookiePolicyContent.tsx`).
  Bu madde cetvelin DoD'sinde zaten açık duruyor — GA kimliğiyle **aynı gün** kapanmalı.
