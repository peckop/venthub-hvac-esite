
# E-posta şablonları — teslim notları

**Tur:** OPS emri `ops-emir-2026-09-05-3-belge.md` · Karar **K14** (gönderime hazır HTML e-posta).
**Teslim:** `email/talep-alindi.html` · `email/teklif-yanitlandi.html` · `email/hesap-olusturuldu.html` · prova sayfası `E-Posta Provasi.dc.html`
**Kullanılan yetenek:** HTML email · Make tweakable (`alanAdlari`, K12)
**İmza:** — DESIGN-BELGE (Opus) 2026-09-05

---

## 1 · Neyin yerine geçiyor

Kodda bugün tek e-posta şablonu var: `supabase/functions/order-confirmation/templates/email/order_confirmation.html`. Okundu ve ölçüldü:

| Ölçüm | Bugünkü hâli |
|---|---|
| Genişlik / yapı | 600 px, `<div>` tabanlı, `<style>` bloğu `<head>`'de |
| Yazı | Arial |
| Marka | yalnız başlık renginde (`{{brand_primary_color}}`) ve logo `<img>`'inde |
| Alanlar | `brand_name` · `brand_primary_color` · `brand_logo_url` · `customer_name` · `order_number` |
| Yedek | şablon okunamazsa koda gömülü HTML basılıyor — **marka yok**, düz Arial |

Yeni şablonlar bunun yerine geçer: aynı alan adları, aynı motor, ama tablo tabanlı yapı, inline stil, kalıplaşmış marka bandı ve footer.

## 2 · Motorun ölçülmüş sınırı — döngü yok

`index.ts` → `renderTemplate` iki şey biliyor:

```
{{#if alan}} … {{/if}}      → alan doluysa içeriği bırak
{{alan}}                    → değeri yaz
```

**`each` / döngü yok.** Sonuç: e-postada kalem listesi çizilemez. Bu bir tasarım tercihi değil, motorun sınırı. Şablonlar buna göre kurgulandı — **e-posta sayı ve numara taşır, kalemler ekteki belgede kalır**. Zaten doğru iş bölümü: e-posta bildirimdir, belge kayıttır.

Liste gerekirse motora `each` eklenmeli; o bir kod işidir (Teklif Akışı), belge işi değil.

## 3 · Kalıp

Beş şablonda da aynı: gizli önizleme satırı (~85 karakter, konu satırının yanında görünür) · marka bandı (logo alanı + marka adı, zemin `brand_primary_color`) · başlık · selamlama · gövde (bilgi kutusu ve/veya paragraf) · varsa **tek** kiremit düğme · imza · ayırıcı · footer (otomatik e-posta notu + destek adresi + şirket künyesi).

Değişen yalnız gövde. Kiremit düğme kuralı belgeden geliyor: sayfada tek ana eylem.

### İki zorunlu sapma, gerekçesiyle

**Arial, Archivo değil.** E-posta istemcilerinde web fontu güvenilir değil; Outlook'un Word motoru çoğunu yok sayar. Marka yazı ailesi taşınamıyor, marka **rengi** ve **düzeni** taşınıyor. Belge tarafındaki Archivo/Plex Mono ayrımının e-posta karşılığı: mono etiketler `'Courier New'` ile yazıldı (bilgi kutusu satır başlıkları).

**Ham hex, token değil.** E-posta istemcisi CSS değişkeni okumaz; `hsl(var(--primary-navy))` çözülmez. Renkler kalıpta sabit yazıldı. Marka rengi tek yerden geliyor:

```html
style="background-color:#1A2B4A;background-color:{{brand_primary_color}}"
```

İkinci bildirim geçerli bir değer taşırsa kazanır; alan boş gelirse geçersiz olur ve ilki kalır. Yani **marka rengi gelmezse bant beyaz kalıp metni okunmaz yapmaz** — VentHub lacivertine düşer.

## 4 · Alanlar

Ortak (beşinde de): `brand_name` · `brand_primary_color` · `brand_logo_url` · `customer_name` · `support_email` · `company_footer`.
İlk dördü kodun bugün doldurduğu alanlar. Son ikisinin **karşılığı yok**, gönderim tarafında açılmalı (`company_footer` zaten K7: şirket kuruluşuyla gelir).

Şablona özgü, ilk üç gövde: `quote_no` · `request_date` · `item_count` · `revision_no` · `valid_until` · `total_amount` · `quote_url` · `customer_email` · `account_url`.
Kapalı bekleyen iki gövdenin alanları §7'de (sipariş ve sevkiyat, 14 alan). Tam liste ve kaynakları prova sayfasının alan tablosunda.

## 5 · Ölçülen bir tutarsızlık — sipariş numarası biçimi

`order-confirmation` şablona `order_number`'ı ham hâliyle geçmiyor:

```js
const prettyOrderNo = order_number ? `#${String(order_number).split('-')[1]}` : …
```

Yani `2026-000318` e-postada **`#000318`** olarak görünüyor; belgelerde ve konu satırında ise tam numara. Müşteri e-postadaki numarayı arattığında belgede bulamayabilir. Bu bir kod kararı, düzeltmesi de kod tarafında — belge şerididen çözülmez. OPS'a bildirildi.

## 6 · Prova sayfası

`E-Posta Provasi.dc.html` şablonun kopyası **değil**: `email/*.html` dosyalarını okuyup motorun kurallarıyla doldurur ve blob olarak gösterir. Kaynak tek. Altı belgede ödenen kopya bedelini burada tekrarlamamak için böyle kuruldu.

`alanAdlari` tweak'i (K12) değerleri alan adlarıyla değiştirir — hangi hücrenin hangi alandan geldiği tek tıkla görünür.

**Ölçülen iki runtime sınırı.** (1) Süslü parantez şablon metnine yazılamıyor: `<code>` içine düz metin olarak koyduğum `{{alan}}` ve `{{#if alan}}…{{/if}}` örneklerini runtime hole sanıp **boşalttı** — cümle "iki şey biliyor: ve …" hâline düşmüştü, yani sayfanın merkezî teknik bulgusu adını söylemiyordu. HTML entity kaçışı da kurtarmadı (entity çözülüp yine hole olarak yorumlanıyor). Örnekler logic tarafından adla geçiriliyor. (2) Tek iframe + sekme; iframe'in `srcDoc` niteliği güncellendiği hâlde iç DOM yenilenmiyordu (nitelik doğru, içerik eski — ölçüldü). Şablon başına ayrı iframe + blob `src` bu sınıfı tümüyle atlıyor, sekme kaldırıldı. **Beş şablon aynı anda görünüyor**, karşılaştırma da kolaylaştı.

**Düzen:** her şablon satırı sarmalı (`flex-wrap`) — önizleme `flex:0 1 600px`, alan tablosu `flex:1 1 320px`. Izgara denemesinde 600 px'lik sabit önizleme sütunu ile tablonun min-content genişliği (414 px) toplamı önizleme penceresini aşıyordu: sayfa 1064 px'e taşıyor ve alan tabloları ekran dışında kalıyordu (ölçüldü). Sarma ile tablo e-postanın altına iniyor; uzun mono dizeler (`getTenantBranding()…`) `overflow-wrap:anywhere` ile kırılıyor. **600 px önizleme ölçüsü teslimin belirtimi olduğu için küçültülmedi** — sarma satır düzeyinde.

Ölçülen içerik yükseklikleri (beşi): hesap oluşturuldu 616 · talep alındı 665 · teklif yanıtlandı 776 · sipariş onayı 803 · kargo bildirimi 825 px. Dosyalar 5–9 KB — beşi de Gmail'in ~100 KB kırpma eşiğinin çok altında.

## 7 · Kapalı bekleyen iki gövde — kurulu

`email/siparis-onayi.html` · `email/kargo-bildirimi.html`. Beş şablon tamam.

**Sipariş onayı**, belgedeki E13 "Bundan sonra" bloğunun e-posta karşılığını taşıyor: fatura ne zaman düzenlenir, sevkiyat nasıl bildirilir, onay kaydı nerede. **Ödeme iki hâli `{{#if}}` ile** (K16): `payment_received` doluysa "ödemeniz alındı, hazırlanmaya başlandı"; `payment_pending` doluysa "ödeme tamamlanana kadar sevk edilmez". İki kapı da gönderim tarafında doldurulur — motor yalnız doluluk bakıyor, karşılaştırma yapamıyor.

**Kargo bildirimi**, E15'i e-postaya taşıyor: **takip numarası en büyük ikinci öğe** (19 px mono bold, harf aralığı 1,5 px, gömülü zeminli kutu içinde), **tutar ve fiyat yok**.

**Ölçümle yakalanan bir tutarsızlık, düzeltildi:** ilk yazdığımda takip numarası 24 px'ti ve marka bandındaki wordmark'ı (20 px) geçiyordu — yani "en büyük **ikinci**" diye rapor ettiğim öğe aslında **en büyüğüydü**. Hüküm net olduğu için hükme uydum: 19 px'e indi, wordmark'ın altında kaldı. Vurguyu boyut değil mono + harf aralığı + gömülü kutu taşıyor. Belge sürümünde oran zaten doğruydu (18 px takip / 24 px başlık).
Ölçülen sıra şimdi: wordmark 20 px → takip no ve başlık 19 px. Sevk/teslim iki hâli yine `{{#if}}` (`is_shipped` / `is_delivered`); tarih etiketi hâlle birlikte değişiyor. E17 uyarısı OPS düzeltmesiyle geldi: üçüncü taraf adına iddia cümlesi çıkarıldı, kalan metin yalnız davranış tavsiyesi — aynı düzeltme `Kargo Bildirimi v2.dc.html`'e de uygulandı.

**"Kapalı bekler" e-postada görünmüyor.** Gerekçe OPS'tan: e-posta gönderilmiyorsa etiketi de yoktur. Rozet yalnız prova sayfasında; gövdelerin içinde satış kipine dair hiçbir işaret yok. Belgelerde şerit var çünkü belge bugün basılabiliyor; e-posta bugün gönderilmiyor.

Yeni alanlar: `order_number` · `order_date` · `total_amount` · `order_url` · `payment_received` · `payment_pending` · `tracking_number` · `carrier` · `tracking_url` · `shipping_method` · `shipped_date` · `delivered_date` · `is_shipped` · `is_delivered`. Kaynakları prova tablosunda.

Ölçülen içerik yükseklikleri: sipariş onayı 803 px · kargo 825 px (takip numarası 19 px'e indikten sonra). Beş dosya 5–9 KB.

## 8 · Sırada

Ürün teknik föyü şablonu — **emir bekliyor** (OPS: emir gelmeden başlanmaz).

