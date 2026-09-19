# REC-355 — VULN-001: ödeme sonucu ile sipariş EŞLEŞTİRİLMİYOR

> ⛔**BU PLAN ÇÜRÜTÜLDÜ VE UYGULANMADI (2026-09-16).** Bağımsız denetim BLOK verdi;
> bulguları yeniden ölçtüm ve hepsi doğru çıktı. Üç öncülü de yanlıştı ve ret dalı gerçek
> ödemeleri 15 dakikada iptal ettirecekti. **Geçerli kayıt:**
> `docs/audits/rec355-plan-curutuldu-2026-09-16.md` §6 (düzeltilmiş onarım şekli).
> Aşağıdaki metin, niçin yanlış olduğunun anlaşılması için OLDUĞU GİBİ bırakıldı.


**Uç:** `supabase/functions/iyzico-callback/index.ts` · **Cetvel:** `CLAUDE.md` §11 (webhook/durum
monotonluğu) + `docs/standards/denetim-izi-standard.md`. Bu plan bir cetvel değişikliği ÖNERMİYOR.

## 1. ZAFİYET — ölçülmüş zincir

Uç `verify_jwt = false` (herkese açık). Beş halka:

1. `orderId` ve `conversationId` **istekten** okunuyor: form, JSON ve URL query (satır 84-103).
2. Sipariş satırı o değerle bulunuyor; tenant satırdan TÜRETİLİYOR (satır 113-134).
3. `token` de istekten geliyor; İyzico'ya `retrieve` ile soruluyor (satır 216-230).
4. `paid = result.paymentStatus === "SUCCESS"` (satır 238) — **yalnız ödemenin başarılı olup
   olmadığına** bakıyor, **hangi siparişe ait olduğuna BAKMIYOR.**
5. `patchOrder({status:'confirmed', payment_status:'paid'})` `id=eq.${orderId}` ile ve
   `service_role` anahtarıyla yazıyor (satır 285-301). `service_role` `bypassrls = true`.

**Saldırı:** 1 TL'lik gerçek bir ödeme yap, `token`'ı yakala, callback'e o token ile ama
**başka bir `orderId`** ile POST et. Uç İyzico'ya sorar, "SUCCESS" alır ve **senin
göstermediğin siparişi ödenmiş işaretler.** Aynı yolla başka bir müşterinin siparişi de
ödenmiş yapılabilir.

⚠**Ayrıca doğrulamadan ÖNCE yazım var:** satır 205-219 `payment_token = token` yazıyor,
`retrieve` daha koşmadan. Yani saldırgan herhangi bir siparişe istediği token'ı damgalayabilir;
bu hem denetim izini kirletir hem de sonraki çağrıda token-fallback yolunu açar.

## 2. NİÇİN MEVCUT KORUMALAR YETMİYOR

- Tenant türetmesi **satırdan** yapılıyor, yani isteğin verdiği tenant sorgunun kapsamını
  belirlemiyor (bu daha önce onarılmış, doğru). Ama tenant türetmesi **hangi sipariş**
  sorusunu cevaplamıyor: saldırgan zaten o siparişin gerçek tenant'ını alıyor.
- `orderTenantFilter` aynı sebeple işe yaramıyor.
- Durum monotonluğu (§11) `pending → confirmed` geçişini meşru sayar; ihlal yok.
- Hiçbir yerde `result.conversationId` / `result.basketId` / `result.paidPrice` ile sipariş
  satırı KARŞILAŞTIRILMIYOR. Ölçtüm: dosyada `basketId` hiç geçmiyor, `conversationId`
  yalnız istek tarafında kullanılıyor.

## 3. ÖNERİLEN ONARIM — üç kol, tek ilke

⭐**İLKE: yazılacak sipariş, İyzico'nun DOĞRULADIĞI bir değerle eşleşmek zorundadır;
çağıranın verdiği değer yalnız satırı SEÇER, seçimi MEŞRULAŞTIRMAZ.**

### Kol 1 — KİMLİK KAPISI (asıl onarım)

`retrieve` döndükten sonra, herhangi bir yazımdan önce: sipariş satırının `conversation_id`
ya da `id` değeri, İyzico'nun döndürdüğü `conversationId` ya da `basketId` ile eşleşmeli.

- Ödeme kurulurken ikisi de İyzico'ya GÖNDERİLİYOR (ölçüldü: `iyzico-payment` satır 759
  `conversationId`, satır 762 `basketId: orderId`), dolayısıyla `retrieve` ikisini de
  ECHO etmeli.
- **İkisinden EN AZ BİRİ hem var hem eşleşiyorsa** kapı açılır. Niçin "en az biri" ve
  ikisi birden şart değil: `retrieveReq`'e `conversationId` yalnız istekte varsa
  konuyor (satır 202), yani her koşumda echo geleceğini VARSAYAMAM. İki alanın olması
  yanlış-red riskini düşürür.
- **İkisi de yoksa ya da ikisi de eşleşmiyorsa → YAZIM YOK.** Fail-closed.

Saldırı bu kolda ölür: saldırgan `orderId=X` verir ama token `Y` siparişine aittir;
İyzico `Y`'nin `conversationId`/`basketId`'sini döndürür, `X`'in satırıyla eşleşmez.

### Kol 2 — TUTAR KAPISI (derinlik)

`result.paidPrice`, sipariş satırının `total_amount` değeriyle **0,01 toleransla** eşleşmeli;
`result.currency` varsa `TRY` olmalı.

⚠**Tolerans TAHMİN DEĞİL, ölçüme dayanıyor:** iki değer AYNI şeyin İKİ AYRI türevi.
`total_amount = validation.totals.subtotal` (satır 380/472) iken `paidPrice` kuruş bazında
yeniden toplanıyor (`subtotalCents/100`, satır 730-732). `iyzico-payment` kendi içinde de
bu iki türevi 0,01 toleransla karşılaştırıyor (satır 393). Toleranssız bir kapı, bir
kuruşluk yuvarlama farkında **gerçek ödemeyi reddeder** — yani deliği kapatırken geliri keser.

Tutar okunamıyorsa (alan yok / sayıya çevrilemiyor) → **YAZIM YOK.**

### Kol 3 — `payment_token` YAZIMI DOĞRULAMADAN SONRAYA

Satır 205-219'daki erken PATCH kaldırılıp doğrulanmış yola taşınır. Denetim gerekçesi
("token'ı hemen yaz") korunur ama artık **doğrulanmış** token yazılır.

### Ret davranışı — SESSİZ DEĞİL, ama SİPARİŞE DOKUNMADAN

- Sipariş satırına **hiçbir şey** yazılmaz (`payment_debug` bile — o da o satıra gider).
- `raiseRevenueAlarm` (`_shared/revenue_alarm.ts`, DI'lı) ile `client_errors`'a yazılır:
  kod `PAYMENT_ORDER_MISMATCH`, `extra` içine eşleşmeyen alanlar (değerler değil, hangi
  alanın uyuşmadığı + siparişin id'si).
- Cevap: `wantsJson` ise `{status:'pending', reason:'verification_failed'}`, değilse
  mevcut pending yönlendirmesi. ⭐Saldırgana "neyin tutmadığı" söylenmez.
- ⚠`payment_status='failed'` YAZILMAZ: İyzico tarafında ödeme BAŞARILI; 'failed' yazmak
  yalan olur ve gerçek siparişin akışını bozabilir.

## 4. NE DEĞİŞMİYOR (kapsam sınırı)

- Migration YOK, şema değişikliği YOK.
- `iyzico-payment` ve `iyzico-refund` DOKUNULMUYOR.
- Deploy YOK: Edge fonksiyonu deploy'u prod'dur, Recep'in kapısıdır. Bu iş **PR açar.**
- VULN-002 (`orders_update_policy`) bu planın KAPSAMINDA DEĞİL, ayrı kayıt.

## 5. ÖLÇÜLMEYEN, ADIYLA

1. **Sömürülmüş mü?** Salt-okuma sorgusu bu oturumun izin katmanında iki kez reddedildi
   ("Production Reads"). Recep'e iletildi; onay gelirse ölçülecek.
2. **`retrieve` gerçekten `basketId` echo ediyor mu?** İyzico dokümanına göre evet, ama
   PROD'DA ÖLÇMEDİM. Kol 1'in "en az biri" tasarımı bu belirsizliğe karşı yazıldı; yine de
   canlıda ilk koşumda iki alanın da gelmediği bir vaka çıkarsa gerçek ödemeler pending'de
   kalır. ⭐Bu yüzden deploy öncesi bir `payment_debug` örneği okunmalı — yukarıdaki 1 numaralı
   iznin ikinci gerekçesi budur.
3. Testler `_shared/__tests__` kalıbıyla yazılacak; gerçek İyzico çağrısı yok, `retrieve`
   sahtelenecek. **Sahte gerçeği taklit etmiyorsa test kördür** — bu yüzden sahte yanıt
   alanları prod `payment_debug` biçiminden alınmalı (bkz. 2).
