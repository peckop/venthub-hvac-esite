# REC-355 — İLK PLAN ÇÜRÜTÜLDÜ (BLOK), ölçümle. 2026-09-16

Bağımsız bir çürütme denetimi ilk onarım planına **BLOK** verdi. Bulguları **kendim yeniden
ölçtüm ve hepsi doğru çıktı.** Bu belge, onarımın niçin yeniden yazıldığının kaydıdır.

## 0. ⭐EN AĞIR BULGU BİR YÖNTEM HATASI: ÖLÇÜM REPODA DURUYORDU

Planım *"`retrieve` gerçekten `basketId` echo ediyor mu? PROD'DA ÖLÇMEDİM, izin reddedildi"*
diyordu ve **bütün tasarımı o belirsizliğin üzerine kurmuştu** ("en az biri eşleşsin").

Oysa ölçüm prod erişimi İSTEMİYORDU: `docs/archive/db-backup-pre-kademe2/venthub_orders.json`
içinde **13 gerçek İyzico `retrieve` yanıtı** `payment_debug.raw` olarak duruyor. Dosya
2026-09-06'dan beri depoda.

⭐**DERS: "izin reddedildi" cümlesi ölçümü bitirmez.** Reddedilen YOL bir tanesiydi; veri
çevrimdışı ve elin altındaydı. Belirsizliğe karşı tasarım yazmak yerine belirsizliği
ölçmeliydim — ölçünce tasarımın ÖNCÜLÜ çöktü.

## 1. KENDİ YENİDEN ÖLÇÜMÜM (13 gerçek yanıt, hepsi `payment_status='paid'`)

| Ölçüt | Sonuç |
|---|---|
| `raw` yanıt taşıyan satır | **13** |
| `raw.basketId` VAR | 13/13 |
| `raw.basketId`, siparişin `id` ya da `order_number` ile eşleşiyor | ⛔**0/13** |
| `raw.conversationId` VAR | **11/13** (2 satırda alan HİÇ YOK) |
| `raw.conversationId`, satırın `conversation_id` ile eşleşiyor | 11/13 |
| İki çapadan HİÇBİRİ kullanılabilir | ⛔**2/13** |
| `raw.signature` VAR | **13/13** |
| `raw.price` == `total_amount` | 13/13 (birebir) |
| `raw.paidPrice` == `total_amount` | 13/13 (birebir) |
| `installment` | 13/13 = 1 (taksitli koşum evrende YOK) |

Örnek satır: `order_number = VH-20250903-4973` · `conversation_id = CONV-1756904973154` ·
`raw.basketId = VH-1756904973154-a4bv8k`. Aynı epoch'u taşıyorlar ama **hiçbir kolonda o
dize yok.**

## 2. PLANIN ÜÇ ÖNCÜLÜ DE YANLIŞTI

### 2.1 `basketId` kolu ÖLÜ — hiçbir sipariş alanıyla eşleşemez

`iyzico-payment` İyzico'ya `basketId: orderId` gönderiyor, ama oradaki `orderId` DB kimliği
DEĞİL: aynı fonksiyonda üretilmiş `VH-${Date.now()}-${rnd}` biçiminde ve **hiçbir kolona
yazılmayan** bir dize. DB kimliği ayrı bir değişken (`dbGeneratedId`, UUID).
**Ölçüm: 0/13.** Yani planın "iki çapa" dediği şey tek çapaydı.

### 2.2 `conversationId` kolu TOTOLOJİ — saldırganın kontrolünde

Uç, **isteğin verdiği** `conversationId` değerini `retrieveReq` içine koyuyor ve İyzico onu
yanıtta GERİ VERİYOR. Echo semantiği ölçümle kanıtlı: gönderilen koşumlarda alan var,
gönderilmeyen 2 koşumda **hiç yok**. Yani İyzico kendi kayıtlı değerini döndürmüyor, bizim
verdiğimizi yansıtıyor.

⛔Sonuç: saldırgan `orderId=X` ile birlikte X'in `conversation_id` değerini de verir, İyzico
onu echo eder, kapı "eşleşti" der ve **AÇILIR.** Planın *"saldırı bu kolda ölür"* cümlesi
YANLIŞTI.

### 2.3 Tutar toleransı gerekçesi ÇÜRÜK, ama ASIL RİSK BAŞKA

`total_amount` ile `paidPrice` aynı formülün aynı girdilerle iki kez koşumu; ölçüm 13/13
birebir. Gerekçe gösterdiğim 0,01 toleransı ise İSTEMCİNİN tutarıyla sunucu toplamını
karşılaştıran ilgisiz bir satırdan ödünç alınmıştı.

⚠Asıl risk taksit: kodun kendi yorumu *"paidPrice >= price olabilir"* diyor ve taksit
`[1,2,3,6,9,12]` ile AÇIK. Ölçtüğüm 13 koşumun hepsi taksitsiz — yani sapma
**gözlenmedi, çürütülmedi de.** Vade farkı müşteriye yansıyan bir kurulumda planım
gerçek taksitli ödemeyi REDDEDERDİ.

## 3. ⛔EN CİDDİSİ: PLANIM GERÇEK ÖDEMELERİ 15 DAKİKADA İPTAL ETTİRİRDİ

Planım *"ret dalında sipariş satırına HİÇBİR ŞEY yazılmaz"* diyordu ve şunu taahhüt ediyordu:
*"`payment_status='failed'` YAZILMAZ — failed yazmak yalan olur."*

Bu taahhüt **planın dokunmadığı bir kod tarafından ihlal ediliyor.** Ölçtüm:

`order-housekeeping`, `status='pending'` ve `payment_token` dolu, 15 dakikadan eski
siparişleri alıp callback'i çağırıyor — ve çağrıyı **yalnız `{orderId}` ile** yapıyor,
`conversationId` GÖNDERMEDEN. Yanıt `status === 'success'` değilse siparişi
`{status:'cancelled', payment_status:'failed'}` yapıyor.

Zincir: `conversationId` gönderilmediği için echo yok → `basketId` zaten eşleşemiyor →
**planımın kapısı yapısal olarak reddeder** → yanıt `pending` → 15 dakika sonra
**parası çekilmiş sipariş `cancelled` + ödeme `failed` damgalanır.**

Ayrıca ikinci bir iptal yolu var: `release-expired-reservations`, `status='pending'` ve
`payment_status='pending'` satırları 24 saat sonra aynı şekilde iptal ediyor.

⭐**DERS: bir uca fail-closed eklemek, o ucun CEVABINI okuyan başka bir ucun kararını da
değiştirir.** Ret dalı yazarken "kim bu cevabı okuyor" sorusu kodla birlikte cevaplanmalıydı
(CLAUDE.md kural 14). Bir deliği kapatırken gelir yolunu kesmek, deliğin kendisinden pahalı
olabilir.

## 4. GÖZDEN KAÇIRDIĞIM İKİNCİ YAZMA YÜZEYİ

Bir DB tetiği (`sync_payment_status_with_status`) `status` değeri `confirmed` yapıldığında
`payment_status` değerini kendiliğinden `paid` yapıyor. Yani `status` değerini `confirmed`
yazan HER yol aynı zamanda bir ödeme beyanıdır — admin kargo ucu, admin sipariş panosu ve bir
SECURITY DEFINER fonksiyon dahil. Bu yüzeyler saldırgana doğrudan açık değil (admin ya da
`service_role` gerekiyor) ama *"delik kapandı"* beyanını geçersiz kılar.
Planım bir **yazma yüzeyi envanteri** çıkarmamıştı.

## 5. CLAUDE.md KURAL 11 İHLALİ — VE ÇÖZÜMÜN KENDİSİ ORADA

Kural 11 webhook'lar için **HMAC-SHA256 + replay guard** istiyor. Planım HMAC'ten hiç söz
etmiyordu. Oysa **İyzico'nun kendi imzası ölçülen 13 yanıtın 13'ünde geliyor** (`raw.signature`).

O imza `paymentId · currency · basketId · conversationId · paidPrice · price · token`
üzerinden gizli anahtarla üretiliyor. Yani elle kurmaya çalıştığım "hangi ödeme hangi
siparişe ait" bağını **sağlayıcı imzalı olarak veriyor** ve ben onu kullanmıyordum.
Replay guard da yoktu: aynı token sınırsız kez POST edilebilir.

## 6. DÜZELTİLMİŞ ONARIM ŞEKLİ — İKİ AŞAMA, SIRASI ZORUNLU

⚠Bu, ilk planın "tek uç, migration yok, tek PR" kapsamından DAHA GENİŞ. Kapsam değişikliği
Recep'e bildirilir (kural 14: kapsam dışı iş ayrı kayıt olarak açılır ve numarası geçer).

**Aşama 0 — `iyzico-payment`: `basketId` GERÇEK sipariş kimliğini taşısın.**
Bugün taşıdığı dize hiçbir kolonda yok (0/13). Bu düzeltilmeden imza doğrulaması bile
kimlik bağı KURMAZ — imza doğru olur ama imzaladığı `basketId` hiçbir şeye karşılık gelmez.
⚠Geçiş penceresi: deploy anında uçuşta olan ödemeler eski biçimi taşır; eski satırlar için
kimlik bağı KURULAMAZ ve bu adıyla yazılmalı.

**Aşama 1 — `iyzico-callback`:**

1. `result.signature` gizli anahtarla doğrulanır (kural 11'in istediği HMAC budur). Böylece
   `basketId`, `price`, `paidPrice`, `paymentId` GÜVENİLİR değer olur.
2. Kimlik: güvenilir `basketId` == siparişin `id` değeri. Tek çapa; ikinci çapa yok.
3. İsteğin verdiği `conversationId` değeri `retrieveReq` içinden **KALDIRILIR** — totolojiyi
   o üretiyor ve hiçbir şey kazandırmıyor.
4. Tutar çapası `result.price` (sepet toplamı) == `total_amount`; ikinci koşul
   `paidPrice >= price` — bu, kodun kendi yazdığı kuralın aynısı, yeni cetvel icat edilmiyor.
5. Replay guard: `paymentId` üzerinden idempotency.
6. Ret dalı `order-housekeeping` ucunun "sonlandır" kararını TETİKLEMEYEN ayrı bir cevap
   taşır ve `order-housekeeping` o cevabı sonlandırma sebebi saymaz. **Bu iki uç aynı işte
   değişir** — hata yolu kodla birlikte yazılır.
7. Müşteri yüzü: parası çekilmiş müşteriye "başarısız" gösterilmez; "ödemeniz alındı,
   doğrulama sürüyor" der ve ikinci ödemeyi engeller.

## 7. HÂLÂ ÖLÇÜLMEYEN, ADIYLA

1. **Taksitli bir koşumda `paidPrice` sepet toplamından sapıyor mu?** Evrende taksitli
   koşum YOK (13/13 `installment=1`). Sapma gözlenmedi, çürütülmedi de.
2. **Sömürülmüş mü?** Canlı salt-okuma izni bu oturumda iki kez reddedildi; Recep'e iletildi.
3. **İmzanın alan sırası** İyzico dokümanından alınacak ve 13 arşiv yanıtıyla ÇEVRİMDIŞI
   doğrulanacak — imza doğrulaması, doğruladığı 13 yanıtta yeşil vermeden yazılmış sayılmaz.
4. Tetik yüzeyi (§4) bu işin kapsamında DEĞİL; ayrı kayıt olarak açılacak.

## 8. AÇIK HÜKÜM

⛔**ZAFİYET AÇIK.** İlk planım uygulanmadı ve uygulanmaması doğru oldu: hem saldırıyı
geçiriyordu hem gerçek ödemeleri iptal ettiriyordu. Onarım §6'daki biçimde, iki aşamada
ve Recep'in kapsam onayıyla yazılacak.
