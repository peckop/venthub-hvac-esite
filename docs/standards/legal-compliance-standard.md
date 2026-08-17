# Hukuki Uyum Cetveli

> **Sürüm:** v1.0 · **Yürürlük:** 2026-08-16 · **Sahip:** LEGAL-OPS şeridi
> **Kapsam:** yasal metinler (`src/views/legal/**`), hukuki konfigürasyon (`src/config/legal.ts`),
> fatura hattı, KVKK veri sahibi talepleri.
> **Bekçi:** `src/__tests__/conformance/legal-promise-backing.test.ts` (INV-LEGAL-3)
> **Kardeş cetveller:** INV-LEGAL-1 (onay kapısı) · INV-LEGAL-2 (analitik rızası)

---

## 0) Bu cetvel niçin var

VentHub'ın yasal metinleri, kullanıcıya **taahhüt** verir: "fatura düzenlenir",
"başvurunuz 30 gün içinde sonuçlandırılır", "bedel 14 gün içinde iade edilir".
Bu cümleler pazarlama metni değil, **sözleşme hükmüdür** — ve her biri, arkasında
gerçekten çalışan bir mekanizma olduğunu varsayar.

2026-08-16 operasyon denetimi, bu varsayımın üç yerde tutmadığını ölçtü:

| Metindeki taahhüt | Gerçek |
|---|---|
| "Fatura … düzenlenir" (Mesafeli Satış Sözl. §5) | Hiçbir fatura belgesi üretilmiyor; kodda tek bir entegratör izi yok |
| "Talepleriniz … 30 gün içinde sonuçlandırılır" (KVKK §…) | Başvuru e-postası yer tutucu; talebi alan/kaydeden/süreyi işleten mekanizma yok |
| "iadeniz tamamlandı" (iade e-postası) | Gerçek para iadesi yapılmıyordu — mock çağrılıyordu (T053-VH) |

Üçünün ortak sınıfı şudur: **metin doğru yazılmış, mekanizma hiç yazılmamış.** Hiçbir
test, hiçbir lint, hiçbir derleme bunu göremez — çünkü ortada bozuk kod yoktur, *olmayan*
kod vardır. Bu cetvelin tek işi o boşluğu görünür kılmak ve kapıya bağlamak.

### Çekirdek kural

> **Yasal bir metinde verilen her taahhüdün, kodda veya konfigürasyonda adı konmuş bir
> karşılığı olmalıdır.** Karşılığı yoksa ya taahhüt metinden çıkar, ya mekanizma yazılır.
> Üçüncü bir seçenek — "şimdilik öyle yazalım" — yoktur; bu, tüketiciye yanlış beyandır.

Karşılık üç biçimden biri olabilir ve **hangisi olduğu §1 tablosunda yazılı olmalıdır**:

1. **Kod** — taahhüdü yerine getiren bir fonksiyon/uç/tetikleyici.
2. **Konfigürasyon** — `legal.ts` içindeki doldurulmuş bir alan (yer tutucu değil).
3. **Yazılı manuel prosedür** — insanın işlettiği, bu cetvelde adım adım tarif edilmiş,
   sorumlusu ve süresi belli bir akış. **Sözlü/örtük prosedür karşılık sayılmaz.**

Üçüncü biçim meşrudur ve küçümsenmemelidir: düşük hacimde manuel fatura kesmek hukuken
tamamen geçerlidir. Meşru olmayan, prosedürün **yazılı olmamasıdır** — çünkü yazılı
olmayan prosedür, devredilemez, denetlenemez ve unutulduğunda hiçbir iz bırakmaz.

---

## 1) Taahhüt ↔ mekanizma sicili

Bu tablo cetvelin kalbidir. **Yasal metne yeni bir taahhüt eklenirse buraya satır eklenir.**
INV-LEGAL-3 tabloyu değil, tablonun işaret ettiği konfigürasyon alanlarını denetler; satırın
kendisini eklemek insanın işidir ve PR incelemesinde aranır.

| # | Taahhüt | Metin | Karşılık | Biçim | Durum |
|---|---|---|---|---|---|
| 1 | Zorunlu yasal onaylar alınmadan ödeme başlamaz | Mesafeli Satış Sözl. §4 | `validateLegalConsents` + INV-LEGAL-1 | Kod | ✅ |
| 2 | Analitik/pazarlama çerezleri yalnız açık rızayla | Çerez Politikası | Rıza kapısı + INV-LEGAL-2 | Kod | ✅ |
| 3 | Fatura, beyan edilen bilgilere göre düzenlenir | Mesafeli Satış Sözl. §5 | §2 köprü prosedürü | Manuel | 🟡 köprü |
| 4 | KVKK talepleri 30 gün içinde ücretsiz sonuçlandırılır | KVKK Aydınlatma | §3 prosedürü + `/admin/data-requests` defteri (T063) | Kod + Manuel | 🟡 kanal adresi Recep'te |
| 5 | Cayma hâlinde bedel 14 gün içinde iade edilir | Mesafeli Satış Sözl. §7 | `iyzico-refund` (T053-VH) | Kod | 🔴 EDGE-REFUND şeridinde |
| 6 | Teslimat süresi / kargo firması / iade adresi | Sözl. §6, §7 | `legal.ts` alanları | Konfigürasyon | 🔴 yer tutucu |
| 7 | Kişisel veri saklama süreleri | KVKK §…, Gizlilik | `legal.ts` retention* | Konfigürasyon | ✅ |
| 8 | Bireysel faturada alıcı kimliği (TCKN) | — (mevzuat gereği) | `invoiceIdentity.ts` + `invoiceIdentityThreshold` | Kod + Konfig. | ✅ |
| 9 | Analitik/pazarlama etiketi rıza olmadan yüklenmez | Çerez Politikası | `ConsentGatedAnalytics` + `trackEvent` kapısı | Kod | ✅ |
| 10 | Veri sahibi talebi 30 gün içinde sonuçlandırılır | KVKK Aydınlatma | `data_subject_requests` + admin defteri + süre sayacı (INV-KVKK-1) | Kod | ✅ mekanizma · 🟡 adres |
| 11 | Silme talebinde saklama yükümlülüğü olan veri korunur | KVKK m.7 / VUK | `anonymize_user_personal_data()` | Kod | ✅ prod'da canlı (08-17 ölçüldü) |

**8 numaralı satırın gerekçesi (karar kaydı).** TCKN başta koşulsuz zorunlu tutuldu; mevzuat
araştırması (2026-08-16) bunun kanunun istediğinden sıkı olduğunu gösterdi. GİB, nihai
tüketici numarasını vermediğinde `11111111111` dolgusunu kabul eder. **Çözüm "kullanıcıya
`11111111111` yazdırmak" DEĞİL**, alanı boş bırakılabilir kılmaktır: dolgu değeri belge
üretiminin işidir, kullanıcı girdisinin değil. Doldurulursa sağlama çalışmaya devam eder.
Ayrıntı ve kademeler → §4.1.

**Durum sözlüğü:** ✅ karşılık var ve çalışıyor · 🟡 karşılık var ama manuel/geçici, bitiş
kriteri tanımlı · 🔴 karşılık YOK — bu satır kırmızıyken **satış açılamaz**.

---

## 2) Fatura hattı

### 2.1 Hukuki zemin

Fatura düzenleme yükümlülüğü **sözleşmeden değil kanundan** doğar (VUK m.229 vd.).
Sözleşme metnini değiştirmek yükümlülüğü ortadan kaldırmaz. Dolayısıyla:

> **Fatura kesilemeyen bir kurulumda B2C satış açılmaz.** Bu, metin düzeltmesiyle
> aşılabilecek bir eksik değildir.

Sözleşmedeki mevcut ifade ("elektronik ortamda … **iletilebilir**") elektronik iletimi
*izin* olarak kurar, taahhüt olarak değil — yani e-arşiv otomasyonu sözleşmeden doğan bir
borç değildir. Yanlış olan kısım, aynı cümlenin ilk yarısıdır: **"Fatura … düzenlenir."**
Bugün düzenlenmiyor.

### 2.2 Ön koşul zinciri (kod işi DEĞİL, sırayla ilerler)

Aşağıdaki zincir tamamlanmadan hiçbir kod işi anlam taşımaz. Her halka bir öncekine bağlıdır:

1. **Mükellefiyet** — şirket kuruluşu / vergi mükellefiyeti tesisi.
2. **Muhasebeci** — beyanname yükümlülüğü için zaten zorunlu; e-arşiv başvurusunu da o yürütür.
3. **e-Arşiv aktivasyonu** — GİB nezdinde, entegratör + muhasebeci eliyle.
4. **Özel entegratör hesabı** — API'si olan bir sağlayıcı (Paraşüt / BizimHesap / eLogo vb.).
   GİB portalı manuel çalışır, API sunmaz; doğrudan entegratörlük ise ayrı ve ağır bir eşiktir.

**3. adım tamamlandığı gün satış hukuken mümkündür** — otomasyon şart değildir. Köprü tam
olarak bu pencereyi tarif eder.

### 2.3 Köprü prosedürü (otomasyon gelene kadar)

Amaç: düşük hacimde, entegratör panelinden **elle** fatura keserek yasal yükümlülüğü
karşılamak ve bu sırada satışı bloke etmemek.

**Tetik:** `venthub_orders.payment_status = 'paid'` olan her yeni sipariş.

**Adımlar:**

1. **Tespit (günde en az bir kez, iş günü).** Admin panelindeki sipariş listesinden
   `payment_status='paid'` ve henüz faturalanmamış siparişler okunur.
2. **Fatura kimliği kontrolü.** Siparişin `invoice_type` ve `invoice_info` alanları
   dolu ve geçerli mi? Değilse → adım 6.
3. **Kesim.** Entegratör panelinde e-arşiv faturası düzenlenir. Kalemler, birim fiyatlar
   ve toplam **siparişin snapshot alanlarından** okunur — vitrindeki güncel fiyattan değil
   (fiyat değişmiş olabilir; fatura sipariş anındaki bedeli gösterir).
4. **İletim.** Fatura PDF'i müşterinin sipariş e-postasına gönderilir.
5. **Kayıt.** Sipariş, faturalandı olarak işaretlenir (köprü döneminde `payment_debug`
   içine `invoice_no` + `invoice_date`; kalıcı çözümde `invoices` tablosu).
6. **Eksik kimlik hâli.** Fatura bilgisi eksik/geçersizse müşteriye e-posta ile sorulur;
   yanıt gelene kadar sipariş **kargolanmaz**. (Bu hâlin hiç oluşmaması için §4'teki
   doğrulama zorunludur — köprünün en kırılgan yeri burasıdır.)

**Süre taahhüdü.** Sözleşme metninde faturanın hangi süre içinde iletileceği yazılıdır ve
bu süre `legal.ts → invoiceDeliveryTime` alanından gelir. Köprü döneminde bu süre, manuel
kesimin gerçekçi ritmine göre belirlenir; **metne yazılan süre, prosedürün taşıyabileceğinden
kısa olamaz.**

**İade/iptal.** İade edilen siparişte iade faturası veya iptal işlemi aynı panelden yapılır;
iade e-postası müşteriye gitmeden ÖNCE yapılır (aksi hâlde müşteri elinde geçerli bir
faturayla, iadesi işlenmemiş bir kayıt kalır).

**Bitiş kriteri (köprü ne zaman kapanır).** Aşağıdakilerin üçü birden sağlandığında:
(a) `invoices` tablosu + `payment_status='paid'` dalından tetiklenen otomatik kesim canlı,
(b) başarısız kesimler için yeniden deneme kuyruğu var ve gözlemlenebilir,
(c) fatura bağlantısı müşteri e-postasında ve hesap sayfasında görünüyor.
Üçü sağlanana kadar §1 tablosundaki 3 numaralı satır 🟡 kalır.

### 2.4 Sözleşme ifadesi kuralı

Sözleşmedeki fatura cümlesi, **o an yürürlükte olan mekanizmayı** anlatmalıdır:

- Köprü döneminde: faturanın düzenlendiğini ve **hangi kanalla, hangi süre içinde**
  iletileceğini söyler. "Anında", "otomatik", "sipariş onayıyla birlikte" gibi
  ifadeler kullanılamaz.
- Otomasyon açıldığında: cümle güncellenir ve §1 tablosundaki biçim `Manuel` → `Kod` olur.

---

## 3) KVKK — veri sahibi talepleri

### 3.1 Mevzuatın gerçekten istediği

KVKK m.11 ve *Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ* şunları ister:

- **İşleyen bir başvuru kanalı** (kayıtlı e-posta, KEP veya ıslak imzalı yazılı başvuru),
- **kimlik tevsiki**,
- **en geç 30 gün** içinde, kural olarak **ücretsiz** yanıt.

**İstemediği:** self-servis "hesabımı sil" düğmesi. Böyle bir düğme iyi bir ürün
davranışıdır ve güven verir, ancak **hukuki zorunluluk değildir** ve yokluğu satışı
engellemez. Bu ayrım önemlidir: aksi hâlde canlıya çıkış, gereksiz yere bir ürün
özelliğinin arkasında bekletilir.

> **Canlıya çıkış engeli:** çalışan kanal + yazılı prosedür.
> **Ürün işi (engel değil):** self-servis silme/anonimleştirme akışı.

### 3.2 Silme talebi ≠ kaydın silinmesi

Bir müşterinin "verilerimi silin" talebi, **sipariş ve fatura kayıtlarını kapsamaz.**
Bu kayıtlar VUK/TTK gereği saklanmak zorundadır ve sitenin kendi metni de bunu
`retentionOrders` süresi boyunca saklayacağını beyan eder. KVKK m.7, saklama yükümlülüğü
bulunan verinin silinmeyeceğini kabul eder.

Doğru davranış:

| Veri | Talep üzerine yapılacak |
|---|---|
| Hesap/profil, adres defteri, pazarlama izinleri, sepet | **Silinir** |
| Sipariş ve fatura kayıtları | **Anonimleştirilir** — kayıt kalır, kişiyle bağı koparılır |
| Destek yazışmaları | Saklama süresi dolduysa silinir, dolmadıysa anonimleştirilir |

Bu yüzden ileride yazılacak "hesabımı sil" akışı, teknik olarak **silme değil
anonimleştirme** akışıdır. Bunu bilmeden yazılmış bir silme düğmesi, ilk kullanımında
mevzuata aykırı bir kayıt imhası üretir.

### 3.3 Başvuru prosedürü

1. **Alım.** Talep, `legal.ts → applicationEmail` adresine veya KEP'e ulaşır. Bu adres
   **gerçekten izlenen** bir kutu olmalıdır; kimsenin bakmadığı bir adres, kanalın hiç
   olmamasından farksızdır.
2. **Kimlik tevsiki.** Başvuru, sistemde kayıtlı e-posta adresinden geldiyse bu yeterlidir;
   gelmediyse kimlik tevsik edici belge istenir. **Doğrulanmamış talebe veri verilmez** —
   yanlış kişiye veri açmak, talebi hiç yanıtlamamaktan daha ağır bir ihlaldir.
3. **Kayıt.** Talep; tarih, talep sahibi, talep türü (öğrenme / düzeltme / silme /
   aktarım / itiraz) ve 30 günlük son tarihle birlikte kaydedilir. Köprü döneminde bu
   kayıt elle tutulur; kalıcı çözümde `data_subject_requests` tablosu.
4. **Yerine getirme.** §3.2 tablosuna göre uygulanır.
5. **Yanıt.** 30 gün dolmadan yazılı yanıt verilir. Reddedilen talepte gerekçe yazılır ve
   Kurul'a şikâyet hakkı hatırlatılır.

**Süre sayacı en geç 30 gündür ve uzatılamaz.** Talep karmaşıksa bile süre işler; bu
yüzden alım kutusunun izlenmesi prosedürün en kritik adımıdır.

### 3.4 Mekanizma — talep defteri ve anonimleştirme

Prosedürün elle işletilmesi meşrudur (§0), ama **süre ve sonuç ispat yükü altındadır**:
"30 gün içinde yanıtladık" demek yetmez, gösterilebilmelidir. Bu yüzden defter koda alındı.

**`data_subject_requests`** — her talep; başvuran adresi, talep türü, alınma anı, **otomatik
30 günlük son tarih**, kimlik tevsik anı, sonuç ve *saklanan veri notu*. Kullanıcı silinirse
talep kaydı `user_id` boşalarak KALIR: sürenin ve sonucun ispatı bizim yükümüzdür.

**`anonymize_user_personal_data(user_id, request_id, dry_run)`** — üç ayrı davranış:

| Veri | Davranış | Gerekçe |
|---|---|---|
| Adres defteri, fatura profilleri, sepet, projeler, sihirbaz kayıtları | **Silinir** | Saklama yükümlülüğü yok |
| Profil (ad, telefon), iletişim mesajları | **Anonimleştirilir** | Kayıt kalır, kişiyle bağı kopar |
| Sipariş/fatura — saklama süresi **dolmamış** | **ELLENMEZ** | VUK/TTK yükümlülüğü; KVKK m.7 istisnası |
| Sipariş/fatura — saklama süresi **dolmuş** | Kişisel alanlar anonimleştirilir; **tutar, tarih ve kalemler korunur** | Muhasebe gerçeği silinmez |

İki tasarım kararı ayrıca yazılıdır:

1. **Varsayılan kuru çalışmadır** (`dry_run = true`). Geri alınamaz bir işlemin yanlışlıkla
   tetiklenmesi, tetiklenmemesinden pahalıdır; çağıran niyetini açıkça belirtmelidir. Kuru
   çalışma gerçek çalışmayla **birebir aynı raporu** üretir — yoksa önizleme işe yaramaz.
2. **Kısmi ret bildirilir.** Saklanan kayıt varsa `retained_data_note` doldurulur ve veri
   sahibine gerekçesiyle yazılır. KVKK'da kısmi ret meşrudur; **sessiz kısmi ret değildir.**

> ⚠️ **Saklama süresi içindeki siparişin kişisel alanları anonimleştirilmez.** Bu, "silme
> talebini yerine getirmedik" demek değildir — kanunun saklamayı emrettiği veriyi silmek
> KVKK'ya uygunluk değil, başka bir ihlaldir. Sınırın tam yeri (faturanın hangi alanı
> belge, hangisi operasyonel veri) **muhasebeci/hukukçu şeridine** aittir; kod bu yüzden
> muhafazakâr davranır ve süre dolmadan sipariş kaydına dokunmaz.

### 3.5 Defterin yüzü — `/admin/data-requests` (T063, 2026-08-17)

Defter tablosu vardı ama **onu besleyen/gösteren arayüz yoktu**: talep kaydı elle SQL
gerektiriyordu ve süre hiçbir yerde görünmüyordu, yani §3.4'ün "süre ve sonuç ispat
yükü altındadır" şartı pratikte karşılanamıyordu. Kurulan ekranın bağlayıcı kuralları
(bekçi: `kvkk-request-ledger.test.ts` · INV-KVKK-1):

1. **Kanal e-postadır, form değil.** Talep `applicationEmail`/KEP'e ulaşır; admin onu
   deftere işler. §3.1'in ayrımı korunur: self-servis "hesabımı sil" düğmesi hukuki
   zorunluluk DEĞİL, ürün işidir — bu ekran onun yerine geçmez, onu **gerektirmez** de.
   ⚠️ Kanalın çalışması `legal.ts → applicationEmail` değerinin **gerçek ve izlenen** bir
   adres olmasına bağlıdır; değer yer tutucu kaldığı sürece 4/10 numaralı satırlar 🟡 kalır.
2. **Süre otoritesi DB'dir.** 30 günlük son tarihi `due_at` DB default'u koyar; UI ve
   servis bunu **yeniden hesaplamaz** (INV-KVKK-1 R2). Gerekçe: istemci saati ile sunucu
   saati ayrışırsa "30 gün içinde yanıtladık" ispatı çürür.
3. **Gecikme görünür olmak zorundadır.** Liste `due_at` artan sıralıdır; gecikmiş talep
   hata rengi + uyarı ikonuyla ayrışır. Süre terminal statüde (`completed`/`rejected`)
   DURUR — sonuçlanmış talep sonsuza dek "gecikmiş" görünmez.
4. **UI izni ⊆ DB izni.** RLS kapısı `is_admin_user()` yalnız `admin`/`super_admin` kabul
   eder; bu yüzden rota rbac'ta o iki role daraltıldı. Aksi hâlde moderator/viewer sayfayı
   açar, RLS satır vermez ve ekran "kayıt yok" der — *yetkisi yok* yerine *veri yok*
   yanılgısı (T062'de warehouse'ta yaşanan sessiz-boş sınıfı).
5. **Sonuçlandırma sessiz olamaz.** `completed`/`rejected` statüsüne geçiş `outcome`
   olmadan REDDEDİLİR (servis katmanında `throw`); saklanan veri varsa
   `retained_data_note` doldurulur (§3.4/2'nin UI karşılığı).
6. **Denetim izinde veri minimizasyonu.** `admin_audit_log` payload'ına başvuranın
   e-postası YAZILMAZ; talep türü, kimlik-tevsik durumu ve son tarih yeterlidir. Kişisel
   veriyi ikinci bir tabloya kopyalamak, KVKK talebini yönetirken KVKK ilkesini çiğnemek olurdu.
7. **Sözlük DB'den gelir.** `request_type`/`status` değerleri migration'daki CHECK
   kısıtının birebir kopyasıdır ve bekçi ikisini karşılaştırır: kodda fazladan değer
   seçilirse prod INSERT'i 400 döner, eksik değer varsa admin gerçek durumu göremez.

**Kapsam dışı (bilinçli):** müşteri-tarafı web başvuru formu. Gerekçe iki katmanlı —
(a) §3.1'e göre hukuki zorunluluk değil, (b) tablonun RLS'i yalnız admin'e açık olduğundan
müşteri INSERT'i migration gerektirir; migration Recep kapısıdır ve zorunlu olmayan bir
ürün özelliği için açılmaz. Anonim (hesapsız) başvuru ayrıca e-posta doğrulama akışı ister.

---

## 4) Fatura verisi kalitesi

Fatura, siparişin `invoice_type` + `invoice_info` alanlarından kesilir. Bu alanlar bozuksa
fatura kesilemez — köprü döneminde bu, siparişin **kargolanamaması** demektir.

### 4.1 TCKN koşulsuz zorunlu DEĞİLDİR — eşiklidir

Bu bölüm 2026-08-16'da **düzeltildi.** İlk yazımı "bireysel faturada TCKN boş bırakılarak
ödeme adımına geçilemez" diyordu; mevzuat araştırması bunun **kanunun istediğinden sıkı**
olduğunu gösterdi. Kural, ölçülmeden yazılmış bir varsayımdı ve dönüşüm maliyeti üretiyordu.

GİB, nihai tüketici numarasını vermek istemediğinde alıcı kimlik alanına **`11111111111`**
yazılmasını kabul eder. Zorunluluk tutara bağlı olarak doğar:

| Fatura tutarı (KDV dahil) | Zorunlu olan |
|---|---|
| ≤ 500 TL | Ad bile yazılmayabilir — "NİHAİ TÜKETİCİ" ibaresi yeterli (515 SN VUK GT) |
| 500 TL – fatura düzenleme haddi | Ad-soyad + adres zorunlu; **TCKN zorunlu değil** |
| Haddin üzeri | Ad-soyad **ve TCKN zorunlu** (509 SN VUK GT, asgari bilgiler) |

**2026 fatura düzenleme haddi: 12.000 TL** (588 SN VUK GT, 31.12.2025 RG; 2025: 9.900 TL).

**Karıştırılmaması gereken ikinci eşik:** 2026'dan itibaren nihai tüketiciye e-arşiv
faturası **tutara bakılmaksızın** zorunludur. Yani "küçük satışta fatura kesmeyiz" diye bir
seçenek yoktur. Yukarıdaki eşik *fatura kesilir mi*nin değil, *alıcı kimliği zorunlu mu*nun
eşiğidir.

**Güven sınırı:** kademelerin varlığı ve `11111111111` uygulaması birden çok bağımsız
kaynakta aynıdır; **eşiğin o yılki tam değeri muhasebeci şeridine aittir** (§2.1). Bu yüzden
değer koda değil `legal.ts → invoiceIdentityThreshold` alanına yazılır — muhasebeci
düzelttiğinde tek satır değişir.

### 4.2 Kurallar

1. **Bireysel — eşikli.** TCKN, sipariş toplamı (KDV dahil) eşiği **aşıyorsa** zorunludur.
   Aşmıyorsa boş bırakılabilir; fatura `11111111111` ile kesilir.
2. **Bireysel — girilmişse geçerli olmalı.** Tutar ne olursa olsun: yanlış numara, boş
   numaradan kötüdür (fatura yanlış kişiye kesilir ve hata sessiz kalır).
3. **Kurumsal — eşikten bağımsız.** VKN + unvan + vergi dairesi her tutarda zorunludur;
   VKN'siz kurumsal fatura hiçbir tutarda kesilemez ve müşteri "kurumsal"ı bilerek seçmiştir.
   **Bireyseldeki gevşeme kurumsala sızmamalıdır.**
4. **Sağlama (checksum).** TCKN ve VKN kendi algoritmalarıyla doğrulanır. Uzunluk kontrolü
   yetmez: `11111111111` on bir hanedir ve eski kontrolden geçiyordu.
5. **Tutar bilinemiyorsa kimlik istenir.** Eşik kararı verilemeyen bir siparişte, eksik
   kimlikli fatura riskini almaktansa sorulur.
6. **Sunucu tarafı.** İstemci doğrulaması kolaylıktır, kapı değildir; aynı kurallar sipariş
   yazılmadan önce sunucuda da uygulanır.

### 4.3 ⚠️ Tuzak — `11111111111` iki farklı şey

`isValidTckn` bu değeri **reddeder** ve bu **müşteri girdisi için doğrudur**: numarayı
doğrudan kişiden istiyoruz, dolgu değerini kullanıcıya yazdırmıyoruz.

Ama aynı değer **GİB'in kendi dolgu değeridir.** Bu doğrulayıcıyı ileride *giden fatura
verisine* uygulayan biri, GİB'in kabul ettiği değeri reddetmiş olur ve fatura üretimi
sebepsiz durur. Fatura kesme yolu yazıldığında bu ayrım korunmalıdır:
**içeri gelen kullanıcı girdisi ≠ dışarı giden belge alanı.**

---

## 5) Bekçi — INV-LEGAL-3

Statik bir test "fatura kesiliyor mu" diye soramaz. Sorabileceği şey şudur: **metin bir
şey vaat ediyorsa, o vaadin dayandığı konfigürasyon gerçekten dolu mu.**

Kurallar:

1. **Yer tutucu yayına çıkamaz.** `legalConfig` içinde `[BUYUK_HARF]` biçiminde kalmış
   bir alan varken `legalReviewCompleted` **true** olamaz.
2. **Metinde geçen alan tanımlı olmalı.** Yasal metinlerde `legalConfig.X` biçiminde
   okunan her `X`, `LegalConfig` tipinde var olmalıdır (yoksa metin `undefined` render eder).
3. **Sicil güncel olmalı.** §1 tablosunda 🔴 durumundaki bir satır varken
   `legalReviewCompleted` true olamaz.
4. **Fatura süresi tutarlılığı.** Sözleşme metni fatura iletim süresinden bahsediyorsa,
   süre `legal.ts` alanından gelmelidir — metne gömülü sabit süre yazılamaz.

Bekçinin kendisi, eklendiği gün **bilerek bozularak** kırmızı görülür; geçmesi çalıştığını
kanıtlamaz.

---

## 6) Değişiklik kuralı

- Yasal metne **yeni bir taahhüt** eklenirse → §1 sicile satır eklenir, karşılığı yazılır.
- Bir mekanizma **kaldırılırsa** → sicildeki satır 🔴 olur ve metin aynı PR'da düzeltilir.
- Köprü prosedürü **bittiğinde** → biçim `Manuel` → `Kod`, durum 🟡 → ✅.
- Bu cetvel, hukukçu görüşünün yerine geçmez. Hukukçu metni değiştirirse **sicil de
  değişir** — metin ile mekanizma arasındaki bağ, metnin kimin yazdığından bağımsızdır.

---

## İlgili

- `docs/audits/operasyon-dongusu-denetimi-2026-08-15.md` §5-6 (kaynak ölçüm)
- `docs/standards/pricing-standard.md` (fatura kalemleri fiyat snapshot'larından okunur)
- `docs/standards/edge-function-security-standard.md` (iade uçları)
- İş emirleri: T055-VH (fatura) · T061-VH (KVKK ops) · T053-VH (gerçek iade)
