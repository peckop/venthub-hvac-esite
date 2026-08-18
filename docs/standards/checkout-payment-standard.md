# Checkout & Ödeme Cetveli

> **Durum:** TASLAK v0.1 · 2026-08-17 · Şerit: PRICING-STOK
> **Niçin var:** T080'de ölçüldü ki ödeme ekranı **boş açılıyor** ve bunu hiçbir kapı görmüyor.
> Sebep bir kod hatası değil, **cetvel boşluğu**: ödeme yüzeyinin neyi göstermek zorunda
> olduğunu söyleyen bir kural hiç yazılmamıştı.
> **A/B kararı beklemede** (§6) — §1-§5 karardan bağımsızdır ve şimdiden bağlayıcıdır.

## 1. Kapsam ve roller

Ödeme akışı dört parçadan oluşur; her birinin sorumluluğu ayrıdır ve **birbirinin işini
yapmaz**:

| Parça | Dosya | Sorumluluk | Sorumlu OLMADIĞI şey |
|---|---|---|---|
| Başlatıcı | `supabase/functions/iyzico-payment` | PSP'yi çağırır, dönen alanları **olduğu gibi** taşır | Hangi alanın kullanılacağına karar vermek |
| Taşıyıcı | `src/hooks/useCheckoutPayment.ts` | Yanıtı duruma çevirir, kalıcı iz bırakır | Render kararı |
| Yüzey | `src/views/checkout/PaymentIframeContainer.tsx` | Kullanıcının gördüğü şey | Ağ/iş mantığı |
| Kurtarıcı | `src/components/PaymentWatcher.tsx` | Kullanıcı akıştan düşerse siparişi bulur | Ödeme başlatmak |

**Karar noktası:** yeni bir alan mı geldi → Başlatıcı · yanıtın anlamı mı değişti → Taşıyıcı ·
kullanıcı ne görüyor mu → Yüzey.

## 2. Mevcut kapılar ve **ölçülmüş boşluk**

| Kapı | Neyi kilitler |
|---|---|
| `INV-PAY-1` (`payment-integrity.test.ts`) | Ön yüz yolu: doğrulama çağrısı, hata yutma, imkânsız durum karşılaştırması, test-kısa-devresi |
| `INV-PAY-2` (`payment-edge-integrity.test.ts`) | Edge yarısı (T041/T042/T043/T045) |
| `INV-PAY-3` (`payment-money-move.test.ts`) | Dış para hareketi: çağır-önce-talep-et, hatayı yutmama |

**Üçü de yolu ölçüyor, hiçbiri YÜZEYİ ölçmüyor.** T080'in bu kadar uzun yaşamasının sebebi
budur: yol boyunca her şey "başarılı"ydı, ekranda hiçbir şey yoktu. Kapı sayısı yanıltıcıdır —
**bir yüzeyi üç kez ölçmek, hiç ölçmemekten farksızdır eğer üçü de aynı katmana bakıyorsa.**

## 3. Bağlayıcı kurallar (A/B'den bağımsız)

### K1 — Her alanın bir tüketicisi olmalı
PSP'den dönen ve gövdeye konan **her alan** için istemcide bir tüketici bulunmalıdır.
Tüketicisi olmayan alan ya taşınmaktan çıkarılır ya da **eksikliği testle işaretlenir**.
*Niçin:* `checkoutFormContent` aylarca taşındı, hiç okunmadı; kimse fark etmedi çünkü
"fazladan alan taşımak" hiçbir yerde hata üretmez.

### K2 — Başarı yolu boş ekran üretemez
Ödeme yüzeyinde "başarı" dönen hiçbir dal **boş** render edemez. Her dalın çıktısı üç
kümeden birine düşmek zorundadır: (a) görünür ödeme içeriği, (b) açık ve okunabilir bir
hata, (c) **sonlu** bir bekleme göstergesi. Süresiz "hazırlanıyor" (c) değil (a)'nın
başarısızlığıdır ve yasaktır.
*Niçin:* T080'de kullanıcı sonsuza kadar boş kutuya bakıyordu ve sistem bunu başarı sayıyordu.

### K3 — Üçüncü taraf betiğine dayanan dal, betiği de ölçer
Bir render dalı harici bir betiğe dayanıyorsa, o dalın kapısı **betiğin yüklendiğini ve
CSP'den geçtiğini** ayrıca ölçmek zorundadır. Kod doğru olsa bile CSP dalı **sessizce**
öldürür — konsola hata düşer, kullanıcıya hiçbir şey düşmez.
*Niçin:* T080'de betik hiç yüklenmiyordu **ve** yüklense CSP üç ayrı direktiften geçirmezdi.
İki bağımsız ölüm sebebi; birini düzeltmek yetmezdi.

### K4 — `dangerouslySetInnerHTML` betik çalıştırmaz
PSP'den gelen içerik bir `<script>` ise, `innerHTML` yoluyla **asla** çalışmaz. Betik
içeriği açıkça düğüm kurularak eklenir. Bu, yanlış anlaşılması kolay bir tarayıcı kuralıdır;
bu yüzden cetvelde yazılıdır.

### K5 — Sessiz başarı yasağı
PSP "başarı" dedi ama istemci gösterecek bir şey bulamadıysa bu **hata olarak** raporlanır
(`client_errors`), sessizce yutulmaz. Ödeme yüzeyi, sessiz kesintinin en pahalı yeridir:
kullanıcı geri gelmez ve kimse haberdar olmaz.
Kardeş kural: `failclosed-seam-needs-alarm`.

### K6 — Kapı katmanı belirtir
Yeni bir `INV-PAY-*` kapısı yazılırken **hangi katmanı** ölçtüğü başlığında yazılır
(yol / yüzey / para hareketi). Katmanı yazılmayan kapı, var olan bir kapının kopyası
olma riski taşır — §2'deki boşluk tam olarak böyle oluştu.

## 4. Yüzey sözleşmesi (durum → görünen)

| Durum | Yüzey ne gösterir | Yasak |
|---|---|---|
| Ödeme başlatıldı, içerik henüz yok | Sonlu bekleme göstergesi | Süresiz bekleme |
| İçerik geldi | Ödeme formu / yönlendirme | Boş kap |
| PSP hata döndürdü | Okunabilir hata + yeniden deneme yolu | Ham hata metni |
| PSP başarı dedi, içerik yok | **Hata** + `client_errors` kaydı (K5) | Sessiz boş ekran |

## 5. INV-PAY-RENDER-1 — yazılacak kapı (§3'ün zorlayıcısı)

**Katman:** yüzey (§K6 gereği belirtildi).

Ölçeceği kurallar ve her biri için sabotaj:

| # | Kural | Sabotaj → beklenen |
|---|---|---|
| R1 | Yüzeyin her dalı görünür içerik veya hata üretir | Bir dalı boş kap yap → KIRMIZI |
| R2 | PSP alanlarının tümünün bir tüketicisi var | Bir alanın okunuşunu sil → KIRMIZI |
| R3 | Ölü state yasağı: `useState` ile kurulup **setter'ı olmayan** ödeme alanı yok | Setter'ı kaldır → KIRMIZI |
| R4 | Betiğe dayanan dal için yükleme kaynağı mevcut | Yükleyiciyi sil → KIRMIZI |
| R5 | CSP paritesi: betiğin alan adı ilgili direktifte | Alan adını CSP'den çıkar → KIRMIZI |
| R6 | Yanlış-pozitif kontrolü | Kuralı yorumda anlat → YEŞİL kalmalı |

> **R3 özel olarak önemlidir.** T080'de kusur "state yazılmıyor" değil, **setter'ın hiç
> var olmamasıydı** (`const [x] = useState('')`). Bir kapı "state güncelleniyor mu" diye
> sorarsa bunu göremez; **setter'ın varlığını** sormalıdır. Bu, `substring-assert-is-not-a-gate`
> ailesinin ödeme yüzeyindeki hâli: doğru soruyu bir katman yukarıdan sormak.

## 6. A/B'ye bağlı bölüm — **KARAR BEKLİYOR** (Recep)

Aşağıdaki iki varyanttan **yalnız biri** kalacak; karar gelince diğeri tek silmeyle gider.
§1-§5 her iki durumda da geçerlidir.

### Varyant A — Gömülü form (öneri)
- Yüzey PSP'nin form içeriğini sayfa içinde çalıştırır; kullanıcı siteden çıkmaz.
- **CSP genişletmesi zorunlu:** `script-src` (PSP betik alan adı) · `frame-src` (PSP çerçevesi)
  · `form-action` (PSP'ye POST). Üçü de eksikse dal sessizce ölür — K3.
- Cetvel eki gerekir: `csp-standard.md`'ye "üçüncü taraf ödeme sağlayıcısı" satırı
  (sahibi LEGAL-SEO).
- Ek kural adayı: PSP alan adları **tek yerde** listelenir; CSP ile yüzey aynı listeden beslenir
  (ikinci kopya = sessiz ayrışma).

### Varyant B — Barındırılan sayfaya yönlendirme
- Yüzey render etmez; tarayıcı PSP'nin sayfasına gider ve döner.
- **CSP'ye dokunulmaz** → K3/R4/R5 bu varyantta konusuz kalır.
- Yerine gelen kural: yönlendirme öncesi sipariş kimliğinin **kalıcı** yazıldığı doğrulanır
  (kullanıcı dönemezse `PaymentWatcher` tek kurtarma yoludur).
- Bedeli: mevcut gömülü yüzey (div, overlay adımları, ilerleme çubuğu) çöpe gider.

## 7. Değişiklik kaydı

- **v0.1 (2026-08-17)** — T080 ölçümünden türetilen ilk taslak. §1-§5 bağlayıcı, §6 karar
  bekliyor. Kapı henüz YAZILMADI (INV-PAY-RENDER-1, §5 şartnamesi hazır).
  Cetvel, kendisini doğuran kusurdan **daha geniştir**: T080 tek bir dalın hatasıydı,
  buradaki kurallar sınıfı kapatır.
