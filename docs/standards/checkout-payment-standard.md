# Checkout & Ödeme Cetveli

> **Durum:** TASLAK v0.2 · 2026-08-17 (başlık düzeltmesi 2026-09-05) · Şerit: PRICING-STOK
> **Niçin var:** T080'de ölçüldü ki ödeme ekranı **boş açılıyor** ve bunu hiçbir kapı görmüyor.
> Sebep bir kod hatası değil, **cetvel boşluğu**: ödeme yüzeyinin neyi göstermek zorunda
> olduğunu söyleyen bir kural hiç yazılmamıştı.
> **A/B kararı VERİLDİ: A — Gömülü form** (Recep, 2026-08-18; gerekçesi §6). §1-§5 zaten
> karardan bağımsızdır ve bağlayıcıdır.
>
> ⚠ **Hâlâ TASLAK olmasının sebebi karar değil, KAPI:** §5'in şartnamesi hazır ama
> `INV-PAY-RENDER-1` **yazılmadı** — yani bu cetvelin merkezî iddiasını (ödeme yüzeyi boş
> açılamaz) bugün ölçen bir kapı yok. Bu satır, kapı inene kadar burada kalır.

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

## 6. Seçilen varyant — **A: Gömülü form** (karar: Recep, 2026-08-18)

Varyant B (barındırılan sayfaya yönlendirme) **elendi**. Karar ölçüme dayandı: arka uç zaten
uçtan uca çalışıyordu (üç sipariş, üçünde de `payment_token` dolu) ve kırık olan tek şey
yüzeydi; B'yi seçmek çalışan bir zinciri atıp yerine yönlendirme koymak olurdu.

**Kullanıcı gerekçesi:** her sayfa geçişi terk üretir ve sepetler yüksek tutarlı (B2B).
Kullanıcı siteden çıkmaz, marka sürekliliği ve sipariş özeti ekranda kalır.

**Abartılmayacak sınır:** 3D Secure adımında banka ekranı yine devreye girer; fark, o ekranın
PSP'nin çerçevesi içinde açılmasıdır. "Kullanıcı hiç çıkmaz" cümlesi yanlıştır.

**PCI kapsamı DEĞİŞMEZ:** kart alanları PSP'nin iframe'i içinde kaldığı sürece kart verisi bu
uygulamaya hiç değmez. A'nın uyum tarafında ek maliyeti yoktur.

### A1 — CSP genişletmesi (zorunlu, sahibi LEGAL-SEO)

`script-src` · `frame-src` · `form-action` · `connect-src` → PSP alan adına izin verir.
Dördünden biri eksikse dal **sessizce** ölür (K3). Zorlayıcı: `INV-PAY-RENDER-1` R5.

> **İKİ DÜZELTME (2026-08-18, LEGAL-SEO ölçümüyle).** Bu bölümün ilk hâlinde iki yanlış vardı
> ve ikisi de aynı kökten geliyordu — **bayat kaynaktan okumak**:
> 1. "`frame-src` hiç tanımlı değil" YANLIŞTI. Direktif `origin/master`'da **vardır**
>    (`'self'` + youtube + cloudflarestream, PR #630). Yanlış okuma, depoda `master`'ın
>    gerisinde park etmiş bir çalışma dizininden yapılmıştı.
> 2. Başlık **`Content-Security-Policy-Report-Only`**'dir — yani CSP bugün **hiçbir şeyi
>    engellemiyor**. Dolayısıyla ödeme formunun açılmaması **CSP kaynaklı değildi**; sebep
>    tamamen istemci kodudur (§6 girişindeki üç kusur).
>
> **Bunun R5'i geçersiz kılmadığı** özellikle not edilir: rapor-only rejimde eksik ya da
> yanlış bir liste **yeşil görünür** ve hata ancak `enforce` gününe saklanır — üstelik o gün
> ödeme yolunda patlar. R5 tam olarak bu gecikmiş patlamayı önlemek içindir.
> Ders kaydı: [[measurement-source-disk-vs-repo]] — otorite `origin/master`'dır, çalışma
> dizini değil.

### A2 — Enjeksiyon güvenliğinin sınırı **CSP'dir** (yeni kural, K7)

Gömülü form üçüncü taraf betiğini bu kaynağın (origin) içinde çalıştırır. Bu kabul edilmiş bir
takastır ama **bedava değildir** ve iki koşulu vardır:

1. **Kaynak kısıtı:** enjekte edilen içerik YALNIZ kendi edge fonksiyonumuzun döndürdüğü PSP
   yanıtından gelebilir. Kullanıcı girdisinden türeyen hiçbir şey bu yola giremez.
   İçeriği "sanitize etmek" çözüm DEĞİLDİR — amacı (PSP betiğini çalıştırmak) yok eder.
2. **Alan kısıtı:** CSP `script-src` PSP alan adıyla sınırlı tutulur. Genel bir gevşetme
   (ör. yeni bir `'unsafe-*'` ya da joker şema) bu maddeyi ihlal eder.

Yani enjeksiyonun güvenliği enjektörün kendisinde değil, **onu çevreleyen CSP'de** yaşar.

### A3 — PSP alan adları tek listeden beslenir

CSP ile yüzey aynı kaynaktan okur; ikinci kopya sessiz ayrışma üretir.

### A4 — Ölçülmemiş, açık risk

3DS'te banka ACS sayfası PSP'nin çerçevesi içinde mi yoksa üst çerçevede mi açılıyor, gerçek
bir sandbox ödemesiyle **henüz ölçülmedi**. Üst çerçeveye düşerse `form-action` genişler ve
banka alan adları sınırsız bir liste olduğundan CSP ile yönetilemez; o hâlde bu madde yeniden
açılır. **Ölçülene kadar bu satır cetvelde AÇIK kalır** — kapatılmış gibi davranılmaz.

## 7. Değişiklik kaydı

- **v0.1 (2026-08-17)** — T080 ölçümünden türetilen ilk taslak. §1-§5 bağlayıcı, §6 karar
  bekliyor. Kapı henüz YAZILMADI (INV-PAY-RENDER-1, §5 şartnamesi hazır).
  Cetvel, kendisini doğuran kusurdan **daha geniştir**: T080 tek bir dalın hatasıydı,
  buradaki kurallar sınıfı kapatır.
- **v0.2 (2026-09-05, ALTYAPI)** — **başlık düzeltmesi, hüküm değişikliği DEĞİL.** Başlık
  bloğu *"A/B kararı beklemede"* diyordu; oysa karar **2026-08-18'de verilmişti** ve §6
  gerekçesiyle birlikte 18 gündür belgede duruyordu. Yani cetvel **kendi kendisiyle**
  çelişiyordu: girişini okuyan "karar yok" der, gövdesini okuyan "karar var" derdi.
  ⭐**Niçin bu sınıf tehlikeli:** çelişki belgenin *en çok okunan* yerindeydi (ilk yedi
  satır). Bir cetvelin girişi, gövdesinden daha çok okunur; oradaki bayat cümle,
  gövdedeki doğru hükmü fiilen görünmez kılar.
  ⚠Aynı turda **"kapı hâlâ yok"** uyarısı başlığa **eklendi**: karar verilmiş olmasının
  cetveli yürürlüğe koyduğu sanılmasın — `INV-PAY-RENDER-1` yazılmadığı sürece bu cetvelin
  ana iddiasını ölçen bir şey yoktur. (Kaynak: REC-141 çelişki taraması, satır A6.)
