# T132-VH — Fatura v1 ölçümü ve tasarım kaydı (2026-08-20)

> Şerit: LEGAL-SEO · İş emri: OPS-AUDIT 07:23 (Recep onaylı, temiz pencere)
> **KAYNAK/CETVEL:** `docs/standards/legal-compliance-standard.md` §2.3 (köprü prosedürü) +
> T107 karar paketi. Cetvel **taze değildi** — §2.3'ün 5. adımı kaydı `payment_debug`'a
> yazmayı söylüyordu; karar değiştiği için cetvelin güncellenmesi bu işin kapsamındadır.
> Kapı: `src/__tests__/conformance/invoice-ledger-contract.test.ts` (INV-INVOICE-1)
> Migration: `supabase/migrations/20260820090000_order_invoices.sql` — **merge Recep kapısı**

## 1. Başlangıç ölçümü (prod, 2026-08-20)

| Ölçüm | Sonuç |
|---|---|
| `invoices` benzeri tablo | **yok** — yalnız `user_invoice_profiles` (müşterinin fatura kimliği) |
| `venthub_orders` fatura alanları | `invoice_type`, `invoice_info`, `invoice_profile` (jsonb) |
| Sipariş sayısı | 5 |
| `payment_status='paid'` | **0** |
| `payment_debug` dolu | **0** |
| `invoice_type` dolu | 5 |

İki sonucu önden yazıyorum ki sonradan "çalışıyor gibi görünen boşluk" olmasın:

1. **Defter boş başlayacak.** Faturalanabilir tek bir sipariş yok (tetik `paid`, ödenmiş sıfır).
   Dolayısıyla doğruluk **veriden kanıtlanamaz** — kanıt davranış testinden ve migration'ın
   kendi doğrulama bloğundan gelir.
2. **Ödeme kapısı bugün hiçbir şeyi bloklamıyor.** "Ödenmemiş siparişe fatura kesilemez"
   kuralı bedelsizce şimdi konur; sonra konursa mevcut kayıtlarla çatışma riski doğar.

## 2. Karar: kayıt nerede yaşar

§2.3 iki yol tanımlıyordu: köprü → `payment_debug` JSON, kalıcı → `invoices` tablosu.
**Recep kalıcı yolu seçti.** Gerekçe dörtlü:

1. **Paylaşılan yazıcı tehlikesi.** `payment_debug`'ı ödeme ve iade yolları da yazıyor
   (`iyzico-refund/index.ts:383`). Hukuki kaydı para yolunun yazdığı kolonda tutmak, bir gün
   önce T114-VH'de ölçtüğüm sessiz-ezme sınıfını davet eder: orada kısmi iade, koruması
   olmayan bir değeri ezip siparişi "tam ödendi" yapıyordu. Fatura kaydı ezilirse **yasal
   delil** kaybolur.
2. **Defterin ana sorusu.** "Hangi ödenmiş sipariş faturalanmadı" — JSON'da indekssiz tarama,
   tabloda tek `NOT EXISTS` sorgusu.
3. **Fatura numarası tekilliği.** JSON'da zorlanamaz. Aynı numaranın iki siparişe yazılması
   vergi hukukunda ciddi bir kusurdur; burada `UNIQUE` indeks zorluyor.
4. **KVKK.** Fatura kaydı kişisel veridir; ayrı tablo = ayrı RLS + ayrı denetim yüzeyi.

## 3. Tasarım kararları ve her birinin gerekçesi

**"Faturalandı" bir kolon değil.** Bilerek `is_invoiced` boolean'ı eklenmedi; işaret satırın
varlığından türetilir. Aksi hâlde iki doğruluk kaynağı olurdu ve ayrıştıkları gün hangisinin
doğru olduğu bilinemezdi. Bu depoda aynı sınıf yaşandı: `status` ile `payment_status`
karıştırıldı ve **satışta stok hiç düşmedi**. INV-INVOICE-1 R2 bu kolonun sonradan
eklenmesini engelliyor.

**Fatura numarası normalize edilerek tekil.** `lower(btrim(invoice_no))` üzerinde UNIQUE:
`"ABC-1"`, `"abc-1"` ve `" ABC-1 "` aynı numaradır. Ham kolonda tekillik, boşluk veya
büyük-küçük harf farkıyla delinirdi.

**Ödenmemiş siparişe fatura kesilemez.** Cetvelin tetiği (`payment_status='paid'`) bir DB
tetiğiyle zorlanıyor. Proforma/avans faturası v1 kapsamında değildir; gerekirse tetiğin
gevşetilmesi bilinçli bir karar olarak yapılır.

**Yasal kayıt değiştirilemez.** UPDATE/DELETE politikası **yok**. Düzeltme yolu iptal + yeni
satırdır; o geldiğinde tabloya `cancelled_at` + `cancel_reason` eklenir ve "faturalandı"
türetimi ona göre daralır. v1'de bu kapsam dışı ve **adıyla** dışarıda.

**Yetki modeli iki nesnede iki farklı sebeple farklı:**

| Nesne | Kapı | Ne yapıldı |
|---|---|---|
| `order_invoices` (tablo) | RLS | Supabase modeli: yetki geniş, kapı politika. Elle REVOKE yazılmadı — iki desen bırakmak okuyanı yanıltır (`db-grant-hygiene-standard` §3). |
| `view_admin_uninvoiced_orders` (view) | **GRANT** | View'in kendi RLS'i yoktur. Dört rolden REVOKE ALL + `SELECT` adıyla geri — INV-VIEW-GRANT-1 (T101-VH) bunu zorluyor. |

**View'in satır kapısı gövdede.** `security_invoker=true` altında müşteri kendi ödenmiş
siparişini "faturalanmamış" listesinde görürdü (kendi verisi olsa da **yanlış ekran**), çünkü
`order_invoices` RLS'i ona fatura satırını göstermez ve `NOT EXISTS` her zaman doğru çıkar.
Bu yüzden `is_admin_user()` view gövdesinde adıyla duruyor.

## 4. Kanıt katmanları

| Katman | Ne görür |
|---|---|
| Migration doğrulama bloğu | **canlı durum** — RLS açık mı, politika sayısı 2 mi, UPDATE/DELETE politikası var mı, tekil indeks, ödeme tetiği, view yetkileri; tutmazsa `RAISE EXCEPTION` |
| INV-INVOICE-1 (7 iddia) | metin sözleşmesi — tekillik normalize mi, bayrak kolonu eklenmiş mi, yasal kayıt değiştirilebilir mi, tetik duruyor mu, servis `payment_debug`'a dokunuyor mu, cetvel güncel mi |
| `orderInvoice.service.test.ts` (6 iddia) | davranış — eksik alanda **sessizce boş satır üretilmiyor**, numara kırpılıyor, boş numara DB'ye hiç gitmiyor, hata yutulmuyor |

Servis testinin asıl iddiası R3: tipler henüz üretilmediği için satırlar çalışma anında
okunuyor ve böyle bir yerde en sinsi kusur, alan kaybolduğunda satırın **boş dizelerle dolu
"başarıyla"** dönmesidir — ekran boş görünür, hata yoktur, kimse bakmaz.

## 5. Şerit sınırları (kendi başıma yapmadıklarım)

- `docs/standards/legal-compliance-standard.md` **AUTH şeridinde**; lane-guard beni doğru
  şekilde blokladı, Bash ile aşmadım. §2.3 güncellemesi için dar diff izni istendi.
  **INV-INVOICE-1 R6 bu izin gelene kadar KIRMIZI** — yani PR yeşillenemez. Kapı burada
  formalite değil, gerçek bir engel.
- `src/config/admin-resources.ts` **ADMIN-CUSTOMER şeridinde**; izin **verildi**, beş şartla
  (tek nesne, mevcut grup, ikon alfabetik import, `labelKey` iki sözlükte de var olacak,
  `route` gerçekten var olacak).

**ADMIN'in bildirdiği boşluk, kayda geçiyor:** `admin-resources.ts`'i koruyan **hiçbir kapı
yok** — `labelKey`in sözlükte var olduğunu ya da `route`un gerçek olduğunu ölçen conformance
testi bulunmuyor. Yani o beş şart bugün **insan disiplini**, mekanizma değil. Bu, dün
ölçtüğümüz "ham anahtar ekrana basılıyor" sınıfının açık kapısıdır. Kapının sahibi ADMIN
şerididir; yazmayı teklif ettim.

## 6. Açık kalan

- **Merge Recep kapısı** (kural 13: migration merge = prod'a otomatik uygulama). Kuyruk
  slotu OPS'tan; sıram #680'den sonra, #695'ten önce.
- FAZ-2 (admin defteri ekranı) bu PR'ın dışında: sayfa + i18n anahtarları + menü kaydı.
- Entegratör seçimi ve otomatik kesim **kapsam dışı** (§2.3'ün bitiş kriteri hâlâ açık).
