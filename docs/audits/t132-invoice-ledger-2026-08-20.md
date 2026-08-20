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

## 5. Şerit sınırları — ve ölçülünce çöken premis

İlk hâlinde bu bölüm şunu söylüyordu: "cetvel AUTH şeridinde, lane-guard beni blokluyor,
izin bekliyorum." **O premis ölçülünce çöktü.** `board.cjs` içindeki `findConflict` okundu:
kıdem atlaması `if (mine && c.ts > mine.ts) continue` satırında yaşıyor.

Guard **simetrik değil**: yalnız senden **kıdemli** claim'ler bloklar. Benim claim'im
08-17T16:49Z, AUTH'unki 08-20T08:27Z — yani AUTH beni hiç bloklamıyordu. Kendi sid'imle
sekiz hedef yolu tek tek sordum: **hepsi serbest**. Dedektörün sağlığı da kanıtlandı
(aynı araç EDGE ve I18N-SWEEP yollarında BLOK üretti).

Daha tehlikeli ikinci yarısı: **kendi claim'in yoksa koruma tümüyle düşer.** Claim TTL ile
bayatlarsa herkes seni bloklar. Gördüğüm blokları açıklayabilecek tek kod yolu budur ve
sınıf olarak yenidir: kod değişmeden, yalnız kendi kaydın düştüğü için dünkü yazma bugün
reddedilir. Panoya yayınlandı; kalıcı çözüm ALTYAPI şeridinde.

**Ders:** sahiplik listesi kimin ne tuttuğunu gösterir, **kararı** kıdem verir. İzin
istemeden önce guard'a doğrudan sormak iki tur kazandırırdı.

## 6. Ölçerken çıkan CANLI kusur — ekran yetkisi DB yetkisini aşıyordu

Faz-2'yi yazarken `is_admin_user()`'ın canlı tanımı prod'dan okundu ve yalnız
`admin`/`super_admin` kabul ettiği görüldü. `order_invoices` politikaları buna bağlı.
Ama `rbac.ts` sayfa matrisinde **moderator ve viewer `*` taşıyor** — yani fatura defterini
AÇABİLİRLERDİ, RLS tek satır vermezdi ve ekranda "yetkin yok" değil **"kayıt yok"**
görünürdü. Sessiz-boş: hata yok, log yok, kimse bakmaz.

Bu sınıf bu depoda **iki kez** yaşandı (T062 warehouse/purchasing, T063 moderator/KVKK).
Üçüncüsü kapıda durduruldu: `rbac.ts`'e `/admin/invoices` kapısı eklendi ve
**INV-INVOICE-1 R7** kapının varlığını ölçüyor. R8 aynı simetriyi servis tarafında kuruyor:
DB'de UPDATE/DELETE politikası yoksa servis de öyle bir fonksiyon sunamaz — aksi hâlde
ekranda çalışmayan bir düğme doğar ve kusur ancak kullanıcıda görünür.

## 7. ADMIN'in bildirdiği boşluk KAPATILDI

`admin-resources.ts`'i koruyan hiçbir kapı yoktu: `labelKey`in sözlükte var olduğunu ya da
`route`un gerçek olduğunu ölçen test bulunmuyordu — beş şart **insan disiplini**ydi.
Yeni bekçi **INV-ADMIN-RESOURCE-1** (`admin-resource-integrity.test.ts`) bunları mekanik
yapıyor: R1 labelKey iki menü sözlüğünde de var (yoksa menüye ham anahtar basılır),
R2 route gerçek bir sayfaya gidiyor (yoksa menü 404'e götürür), R3 `requiredAccess`
rotayla tutarlı, R4 key tekil; R0/R0b ayrıştırıcının kör koşmasını engelliyor.

Üç iddia **bilerek kırılarak** kanıtlandı (kapıyı kaldır → R7 kırmızı · İngilizce etiketi
sil → R1 kırmızı · rotayı olmayan sayfaya çevir → R2 kırmızı), sonra geri yüklendi.

Dosya ADMIN-CUSTOMER şeridinin mülküdür; merge sonrası onlara geri döner.

## 8. Açık kalan

- **Merge Recep kapısı** (kural 13: migration merge = prod'a otomatik uygulama). Kuyruk
  slotu OPS'tan; sıram #680'den sonra, #695'ten önce.
- FAZ-2 (admin defteri ekranı) bu PR'ın dışında: sayfa + i18n anahtarları + menü kaydı.
- Entegratör seçimi ve otomatik kesim **kapsam dışı** (§2.3'ün bitiş kriteri hâlâ açık).
