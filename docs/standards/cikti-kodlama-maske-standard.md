# Edge Çıktı Kodlama ve Kişisel Veri Maskesi — Cetvel v1.0

> **Kapsam:** `supabase/functions/**` içinde güvenilmeyen metnin (müşteri adı, iade sebebi, istemci hata
> mesajı, sağlayıcı/DB hata metni) dört çıkışı: **HTML e-posta**, **log**, **Slack**, **HTTP yanıt gövdesi**.
> **Zorlayan kapı:** `INV-CIKTI-KODLAMA-1` → `src/__tests__/conformance/edge-cikti-kodlama-maske.test.ts` (uçlar
> yardımcıdan geçiyor mu) + `supabase/functions/_shared/__tests__/kodlama_maske.test.ts` (yardımcının davranışı).
> **Yardımcılar:** `supabase/functions/_shared/kodlama.ts` (kaçış, adres süzgeci, şablon motoru) ve
> `supabase/functions/_shared/maske.ts` (e-posta/telefon/ad maskesi, serbest metin ve nesne maskesi, sır durumu,
> hata ayıklama bayrağı).
> **Sahibi:** EDGE · **Son doğrulama:** 2026-11-04.
> **Kayıt:** Kanban: OPS-211, OPS-213 (güvenlik incelemesi takipleri: K1 üçlü dal, K7 düğüm bütçesi + gövde sınırı + TCKN,
> K8 kapısı, K9) · **Doğuş:** `docs/audits/guvenlik-karnesi-2026-11.md` §2 kök 3, §9 madde 3
> (bulgular G1, S1, S2, S4, S5, S6) · **İlk yazım:** 2026-11-03.
> **Komşu cetveller:** `email-template-standard.md` (şablon alan sözleşmesi), `edge-function-security-standard.md`
> (yetki, CORS, webhook), `depoya-giremeyecek-veri-standard.md` (depoya giren veri).

## 1. Niçin

Karne 34 bulgunun altısını tek köke bağladı: kaçış (`kacir`) yalnız teklif bildiriminde vardı, maskeleme üç uçta üç
farklı biçimde yazılmıştı, `_shared`'de ikisi de yoktu. Ölçülen sonuçlar:

- **G1:** sipariş, kargo, teslimat ve iade e-postaları müşteri adını, iade sebebini ve açıklamasını HTML'e ham basıyordu.
  Ödeme yapan biri kurbanın adresiyle VentHub göndericisinden (SPF/DKIM geçerli) oltalama HTML'i gönderebiliyordu.
- **S1:** `iyzico-payment` hata ayıklama bayrağı istekten (`?debug=1`, `x-debug: 1`) açılıyordu; açıkken API ve SECRET
  anahtarının ilk 6 + son 4 karakteri ve ad/soyad maskesiz loglanıyordu.
- **S2:** dört uçta alıcı e-postası/telefonu koşulsuz loglanıyordu.
- **S4, S5:** kimliksiz (`tcmb-rates-sync`) ve oturumlu müşteri uçları (`iyzico-payment`, `log-client-error`) DB/ayrıştırıcı
  hata metnini yanıt gövdesinde dönüyordu.
- **S6:** `log-client-error` istemci mesajını ve adresini Slack'e maskesiz, `extra` alanını DB'ye hiç dokunmadan yazıyordu.

## 2. Kurallar

**K1 · HTML'e giren her değer kaçar.** Şablon dosyası olan uçta motor `_shared/kodlama.ts` `renderTemplate`'tir ve her
`{{alan}}` değerini `kacir`dan geçirir. Satır içi HTML'de her `${…}` tek bir `kacir(…)` çağrısıdır (ardından yalnız sabit
dizgeli `.replace(/…/g, '<br>')` zinciri gelebilir; `kacir(a) + b` güvenli değildir). İki istisna: üçlü ifade
(`${x ? `…` : ''}`) — **iki dal da** dizge değişmezi, içi kaçışlı şablon değişmezi ya da yine bu kurallara uyan ifade olmalı
(`${x ? 'a' : ad}` ihlaldir) — ve adı `…Html` ile biten, kaçışla kurulmuş hazır parça (`kalemlerHtml`).
Motor ya da `kacir` uçta yeniden yazılmaz.

**K2 · `href`/`src` yalnız `http(s)`, `style` içi renk yalnız hex.** Adres değerleri `guvenliUrl` süzgecinden geçer; geçmeyen
değer boş dizge olur ve şablondaki `{{#if}}` bloğu silinir. `style="color: …"` içine giren marka rengi `guvenliRenk`ten geçer
(`#rgb`/`#rrggbb`, değilse sistem varsayılanı): `kacir` tırnaktan çıkmayı engeller ama `red;background-image:url(…)` gibi CSS
bildirimi enjeksiyonunu engellemez. Süzgeçler kaçışın yerine geçmez, ikisi birlikte uygulanır.

**K3 · Logda alıcı yok, maskesi var.** `console.*` çağrısında alıcı değişkeni (`to`, `toList`, `customer_email`, `phone`,
`customer_name` vb.) yalnız `maskEposta` / `maskTelefon` / `maskAd` / `mask` içinde geçer. Sipariş numarası, iade kimliği
gibi iş kimlikleri serbesttir.

**K4 · Sırrın logu yalnız durumudur.** Sır değişkeni (`*ApiKey`, `*SecretKey`, `serviceKey`, `SERVICE_ROLE_KEY`) loga
yalnız `sirDurumu(…)` (`tanimli` / `eksik`) ile girer; karakter dilimi (ilk N, son N) yasaktır.

**K5 · Hata ayıklama bayrağı yalnız ortamdan.** `hataAyiklamaAcik(Deno.env.get('…'))`. İstek başlığı ya da sorgu
dizgesiyle açılan bayrak yasaktır: isteyen her çağıran sunucu loguna ayrıntı döktürebilir.

**K6 · İç hata metni yanıta dönmez.** `new Response(JSON.stringify(…))` gövdesinde `.message`, `String(e)` ya da onlardan
türetilmiş değişken yer almaz. Yanıtta sabit hata kodu (ve gerekirse `request_id` / Postgres hata kodu) bulunur; ayrıntı
`console.error` ile loga yazılır. Bugün bu kuralı çiğneyen 15 uç kapı dosyasında **adıyla taban** olarak duruyor (çoğu
admin/service_role çağıranlı); taban yalnız küçülür, yeni uç eklenemez.

**K7 · İstemcinin gönderdiği alan tek yerde maskelenir.** İstemci hata kaydı gibi serbest metin alan uçlarda her alan girişte
bir kez `metniMaskele` (nesne için `nesneyiMaskele`) ile temizlenir; aşağıdaki DB, gruplama ve Slack yolları yalnız temiz
değeri kullanır. `metniMaskele` yüzde-kodlu `@`'yi çözer, telefon olarak yalnız TR mobil biçimini (5xx…) sayar (sipariş
numarası ve zaman damgası korunur), T.C. kimlik numarasını (11 hane, sağlaması tutan) `***` yapar; `nesneyiMaskele` toplam
bütçelidir (1000 düğüm — nesne, dizi ve `null` dahil —, 200 yaprak, 16 000 karakter). Gövde ayrıştırmadan önce boyutla
sınırlanır: `log-client-error` gövdeyi `_shared/govde_siniri.ts` `govdeyiSinirliOku` ile en çok 64 KB okur (aşılırsa 413);
`Content-Length` yalan söyleyebileceği için akış da sayılır.

**K8 · Sağlayıcı/DB hata metni de serbest metindir.** Twilio, Resend, İyzico ya da PostgREST hata metni alıcı numarasını,
adresini ya da satır değerini taşıyabilir. `const v = await resp.text()` ile okunan dış yanıt metninin her kullanımı
(log, `throw`, denetim kaydı, yanıt, Slack) `metniMaskele(v, N)` içindedir; ham metin yalnız sınıflandırmada
(`v.toLowerCase()`, `/…/.test(v)`, `…Mi(v)` yüklemi) ve başarılı gövdeyi `JSON.parse` ile ayrıştırmada kullanılır. Sentry
olay mesajı `_shared/sentry.ts` içinde merkezde maskelenir; geniş `catch` hata nesnesini loga ham koymaz.

**K9 · Slack'e giden metin mrkdwn kaçışından geçer.** `_shared/notify.ts` Slack yükündeki metni, alan başlığını ve değerini
`slackKacir` ile çevirir (`&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`): dışarıdan gelen `<!channel>` ya da
`<https://kotu|venthub.com.tr>` dizisi kanal çağrısı ya da sahte bağlantı olarak işlenmez. E-posta yolu düz metindir, kaçış
orada uygulanmaz.

## 3. Kapının sınırı (adıyla)

| Ölçer | Ölçmez |
|---|---|
| E-posta HTML satırlarında kaçışsız `${…}` (yedi dosya, evren boş kalırsa kırmızı) | Şablon dosyasının içinde ham HTML basan yeni bir motor sözdizimi (motor `_shared`'de tek; `{{{…}}}` yok) |
| `_shared/kodlama.ts` dışında `renderTemplate`/`kacir` tanımı | `<script>` bağlamı (bugün yok); CSS bağlamı yalnız `brandPrimary` tanımı üzerinden ölçülür, başka bir değer `style` içine girerse görülmez |
| Üçlü ifadenin İKİ dalını (iç içe üçlü ve şablon dalı dahil); çok satırlı ifadede etiket ifadenin içindeyse de | HTML etiketi ne `${` satırında ne ifadenin içinde olan `${…}` (ör. etiketi başka satırda kalan değişmezin etiketsiz satırı) |
| Dış yanıt metninin (`const`/`let v = await x.text()`, `.text().then(…)`) maskesiz kullanımı, `v.toLowerCase()` takma adı dahil (taban: `iyzico-callback`) | Metni `.text()` dışında okuyan yol (`res.json()` sonrası hata alanı), `JSON.parse(v)` sonucunun dışarı çıkması, değişkeni düz atamayla başka ada kopyalayan kod |
| `log-client-error` gövde sınırı, `notify` Slack kaçışı, Sentry mesaj maskesi | Diğer uçların gövde sınırı (çoğu `verify_jwt=true` ya da imzalı) |
| `console.*` içinde alıcı değişkeni ve sır değişkeni | Değişken adı farklı olan kişisel veri (ör. `x = customer.email; console.log(x)`) |
| Yanıt gövdesinde `.message` / `String(e)` / türetilmiş değişken | Hata metnini başka yolla (ör. `JSON.stringify(err)`) dönen gövde |
| `log-client-error`'da her `payload.*` kullanımının maskeden geçtiği | Sentry `beforeSend` temizleyicisi (karne §6, ayrı ölçüm) |

## 4. Bu cetvelin dışında kalan (karne eşlemesi)

- `iyzico-callback` yanıt gövdesi (S4'ün kalan kolu): sipariş durum makinesi PR'ında ele alınır; K6 tabanında adıyla.
- `iyzico-callback` RPC hata metni (K8): aynı PR'da; K8 tabanında adıyla.
