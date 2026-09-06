# E-posta Şablonu Cetveli — Email Template Standard v1.0

> **KAYNAK/CETVEL**
> - **Bu belge bir CETVELDİR.** Yazılma sebebi: REC-154 kapsamında "şablon motoruna döngü
>   (`each`) eklensin mi" sorusu soruldu; cevap **HAYIR** oldu ve gerekçesinin bir yerde
>   yazılı durması gerekiyordu. CLAUDE.md Mutlak Kural 1: cetvel yoksa yazmak işin parçasıdır.
> - **Üst cetvel:** `docs/standards/notification-standard.md` (bildirimin *tetiklenmesi* ve
>   *tekrarlanmaması*). Bu belge onun yerine geçmez; **gövdenin nasıl kurulduğu** eksenini ekler.
>   Ölçüldü: `notification-standard.md` içinde "şablon"/"template" kelimesi **0 kez** geçiyor.
> - **Komşu cetveller:** `docs/standards/document-numbering-standard.md` (§3 gösterim kuralı),
>   `docs/standards/edge-function-security-standard.md`, `docs/standards/i18n-localization-standard.md`.
> - **Ölçüm tabanı:** `origin/master` = `a068470a` (2026-09-06), çalışma ağacı `C:/tmp/vh-a154`.
> - **Zorlayan kapı:** `src/__tests__/conformance/eposta-sablon-alanlari.test.ts`
>   (**INV-EPOSTA-SABLON-1**).

---

## 1. Kapsam

`supabase/functions/*/templates/email/*.html` altındaki HTML şablonları ve onları basan
Edge işlevleri. Bugünkü yüzey (ÖLÇÜLDÜ):

| İşlev | Şablon dosyası | Gövde nasıl kuruluyor |
|---|---|---|
| `order-confirmation` | `templates/email/order_confirmation.html` | şablon + satır-içi yedek |
| `shipping-notification` | `templates/email/shipping.html` | şablon + satır-içi yedek |
| `delivery-notification` | `templates/email/delivered.html` | şablon + satır-içi yedek |
| `return-status-notification` | **YOK** | yalnız satır-içi şablon değişmezi |

Kapsam dışı: SMS/WhatsApp gövdeleri (`_shared/notify.ts`) ve `notification-service`'in
jenerik gövdesi — onlar `notification-standard.md`'nin alanıdır.

---

## 2. ⛔ MOTOR DÖNGÜ İÇERMEZ (asıl kural)

Şablon motoru **tam olarak iki şey** yapar:

```
{{alan}}                       →  değeri basar (yoksa boş dizge)
{{#if alan}} … {{/if}}         →  değer doğruysa bloğu tutar, değilse siler
```

**Döngü (`{{#each}}`) YOKTUR ve EKLENMEYECEKTİR.**
**Liste gerekiyorsa HTML'i ÇAĞIRAN TARAF hazırlar** ve tek bir `{{alan}}` olarak geçer:

```ts
// DOĞRU — satırlar TypeScript'te kurulur, şablon tek delik görür
const kalem_satirlari = items
  .map((k) => `<tr><td>${esc(k.ad)}</td><td>${esc(k.adet)}</td></tr>`)
  .join('')
html = renderTemplate(tpl, { /* … */, kalem_satirlari })
```

```html
<!-- DOĞRU — şablonda tek delik -->
<table>{{kalem_satirlari}}</table>
```

### Niçin döngü eklenmiyor — bedeli adıyla

1. **Motor dört yerde KOPYALIDIR.** Edge işlevleri ayrı Deno bundle'larıdır ve `src/`'den
   import edemezler; `_shared`'a çıkarılmadıkça her `each` eklemesi **dört dosyada** aynı
   regex'i tutturmak demektir. REC-154'te ölçüldü: `delivery-notification`'ın motoru
   `{{#if}}`'i **hiç desteklemiyordu** — yani kopyalar zaten sessizce ayrışmıştı.
2. **Regex ile döngü = iç içe geçme tuzağı.** `{{#each}}` içinde `{{#if}}`, non-greedy
   `[\s\S]*?` ile doğru eşleşmez; ilk `{{/if}}`'te kapanır ve **sessizce yanlış HTML** üretir.
   Yanlış HTML müşteriye gider ve geri alınamaz (`notification-standard.md` B1).
3. **Kaçış (escaping) sorumluluğu belirsizleşir.** Bugün her değer `String(v)` ile basılır
   ve kaçış çağıranın işidir. Döngü, kaçışı motorun içine iter; motor da kaçış yapmadığı
   için ürün adındaki bir `<` HTML'i bozar.
4. **İhtiyaç ÖLÇÜLMEDİ.** Bugün hiçbir şablonda liste yoktur (`{{#each` isabeti: **0**).
   Kullanılmayan bir yetenek, bakımı olan ama kanıtı olmayan koddur.

⚖**Ne zaman yeniden açılır:** aynı listeyi **üçten fazla** yer basmaya başladığında.
O gün doğru hamle motoru büyütmek değil, motoru `_shared/email_template.ts`'e **taşımak**
ve döngüyü orada TEK yerde yazmaktır. Bu paragraf o kararın kapısıdır.

---

## 3. ALAN SÖZLEŞMESİ — iki yönlü, tek ölçüt

**Kural:** şablondaki her `{{alan}}` render çağrısında geçilmeli, **VE** render çağrısında
geçilen her alan şablonda kullanılmalı. Tek yön yetmez:

- **Şablon → çağrı eksikse:** delik boş basar. Ölçülen örnek yok, ama sınıf gerçektir.
- **Çağrı → şablon eksikse:** değer SESSİZCE ÇÖPE GİDER. REC-154'te ölçüldü:
  `delivered.html` marka adını `VentHub`, marka rengini `#2563eb` olarak **sabit kodluyordu**;
  `index.ts` ise `brand_name`, `brand_primary_color`, `brand_logo_url` alanlarını geçiyordu.
  **Üç alan da kullanılmıyordu.** Marka değişse e-posta değişmezdi ve hiçbir test görmezdi.

Bu yüzden kapı **iki yönü birden** ölçer.

---

## 4. ZORUNLU ALANLAR

Müşteriye giden her e-posta gövdesi şunları taşır:

| Alan | Kaynak | Yokluğunda ne olur |
|---|---|---|
| `brand_name`, `brand_primary_color`, `brand_logo_url` | `getTenantBranding()` | marka sapması |
| `order_number` | **TAM numara** — `document-numbering-standard.md` §3 | destek müşteriyi ayırt edemez |
| `support_email` | `getTenantBranding().supportEmail` | "yanıtlamayın" der, adres vermez → **çıkmaz sokak** |
| `company_footer` | `getTenantBranding().companyFooter` | ticari e-postada kimlik satırı eksik |

**`support_email` niçin `emailFrom`'un yerine geçmez:** gönderim adresi domain doğrulaması
başarısız olduğunda `onboarding@resend.dev`'e düşer (`order-confirmation/index.ts` yedek yolu)
ve o kutu okunmaz. Altbilgi "yanıtlamayın" diyorsa, nereye yazılacağını da **söylemek zorundadır**.

### `company_footer` bugün BOŞ — ve bu kasıtlı

Kaynağı `src/config/legal.ts`'tir. Orada `sellerTitle`, `sellerAddress`, `taxNumber` dahil
**19 alan** hâlâ `'[SATICI_UNVAN]'` biçiminde doldurulmamıştır (2026-09-06 ölçümü) ve o
dosyanın kendi kuralı nettir: *"Gerçekmiş gibi duran sahte değer KOYMA."*

Müşteriye giden e-postada uydurma bir ticaret unvanı basmak, boş bırakmaktan **kötüdür**.
Bu yüzden:

- `companyFooter` varsayılanı **boş dizgedir**;
- şablon onu `{{#if company_footer}}` ile sarar → değer yoksa altbilgi **hiç çizilmez**;
- ⚠**`[SATICI_UNVAN]` gibi köşeli-parantez yer tutucusu e-postaya BASILMAZ.** O konvansiyon
  Recep'in gördüğü site sayfaları içindir; müşterinin gelen kutusu için değildir.

**Recep bilgileri verdiği gün:** `COMPANY_FOOTER` ortam değişkeni ya da tenant
`config.company_footer` doldurulur. **Kod değişmez** — zincir zaten hazırdır.

---

## 5. DEĞER ZİNCİRİ — yeni yol açma

Her marka/iletişim değeri `_shared/tenant_config.ts` → `getTenantBranding()` üzerinden
ve **tek bir zincirle** gelir:

```
tenant config (DB)  →  Deno ortam değişkeni  →  sistem varsayılanı
```

- ⛔İşlev içinde `Deno.env.get('…')` ile **ikinci bir yol açma**: ayrı yol = ayrı bayatlama
  noktası; biri güncellenir, diğeri geride kalır.
- ⛔Şablon dosyasına marka/iletişim değeri **sabit kodlama** — §3'teki ölçülmüş kusur budur.
- Sistem varsayılanı **uydurulmaz, ÖLÇÜLÜR.** `supportEmail` varsayılanı
  `info@venthub.com.tr`'dir çünkü vitrinde **7 dosyada 9 kez** geçen ilan edilmiş iletişim
  adresi odur (i18n `contact.email` tr/en, `ContactPage`, `LeadModal`, `AccountOverviewPage`,
  `OdemeKapaliBilgi`, ana sayfa JSON-LD). Ölçülemeyen bir varsayılan **boş bırakılır**.

---

## 6. Kapının SINIRI (adıyla)

**INV-EPOSTA-SABLON-1** — `src/__tests__/conformance/eposta-sablon-alanlari.test.ts`

| Ne ÖLÇER | Ne ÖLÇMEZ |
|---|---|
| Şablondaki her `{{alan}}`ın render çağrısında geçtiğini | E-postanın **gönderildiğini** — o çalışma zamanıdır |
| Render çağrısında geçilen her alanın şablonda kullanıldığını | Üretilen HTML'in **doğru göründüğünü** (görsel/istemci uyumu) |
| Dört işlevin de `supportEmail`/`companyFooter` okuduğunu | `companyFooter`'ın **dolu** olduğunu — bugün bilerek boş (§4) |
| Şablonlarda sabit `VentHub` metni / `#2563eb` HEX'i kalmadığını | `_shared` dışındaki bildirim uçlarını (`notification-service` vb.) |
| Hiçbir motorda/şablonda `each` olmadığını (§2) | Motorun **doğru çalıştığını** — o ayrı bir birim testi işidir |
| `{{order_number}}`ın tam numarayla beslendiğini | Numaranın **tekil üretildiğini** → INV-SIPARIS-NO-1 + SQL kanıtı |

⚠**"Kapı yeşil" ≠ "e-posta doğru görünüyor".** Kapı statiktir; alan sözleşmesini ölçer,
render çıktısını değil.
