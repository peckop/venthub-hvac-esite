# Vaat Bütünlüğü Standardı — vitrin neyi vaat edebilir

**Kapsam:** müşteriye görünen vitrin yüzeylerinde (ürün, kategori, seri, sepet, destek,
ana sayfa) yazılı **ticari vaatler** — ödeme, taksit, kargo, teslim süresi, iade, garanti,
sertifika. **Kapsam dışı:** admin, hesap/sipariş geçmişi, hukuki metinler (KVKK, mesafeli
satış), ödeme akışının kendi içi.

**Kapı:** `INV-VAAT-SIZINTI-1` → `src/__tests__/conformance/vaat-sizintisi.test.ts`

---

## 0) Niçin var — ölçülmüş olay (2026-09-01, REC-104)

Site **teklif modundaydı** ve bunu kendi de söylüyordu: `/checkout` canlıda *"Ödeme yakında
açılıyor — Mağazamız kuruluş aşamasında"* basıyordu. Aynı anda:

- Her ürün sayfasında tek CTA **"TEKNİK TEKLİF İSTE"** iken, hemen altında
  **"ÜCRETSİZ KARGO · GÜVENLİ ÖDEME · GARANTİ"** rozetleri duruyordu.
- Hava perdeleri iniş sayfasında **"Taksit İmkanı — 12 aya varan taksit"** ve
  **"Güvenli Ödeme — SSL şifreli işlem"** yazıyordu.
- `/destek/sss` *"iyzico aracılığıyla kredi/banka kartları ile güvenli ödeme
  yapabilirsiniz"* diyordu.
- `/destek/teslimat-kargo` *"Kargo ücreti/firması **ödeme adımında** gösterilir"* diyerek
  var olmayan bir adıma atıf yapıyordu.

Dayanak ölçümü: **23 aktif kategorinin 23'ünde `hide_price=true`**; çevrimiçi ödeme
`NEXT_PUBLIC_ODEME_ACIK` ile kapalı. Yani vaatlerin hiçbirinin arkasında yetenek yoktu.

**Sınıf:** kusur tek bir metinde değil, **iki yüzeyin birbirinden habersiz konuşmasında**.
Ödemeyi kapatan değişiklik `checkout/` içinde doğru davrandı; vitrin metinleri hiç
haber almadı. Hiçbir tip, lint ya da test bunu görmedi — çünkü hepsi **tek dosyaya** bakar,
vaat ise **dosyalar arası bir tutarlılık** iddiasıdır.

---

## 1) Kural

> **Bir vitrin yüzeyi, arkasında bugün çalışan bir yetenek olmayan hiçbir ticari vaadi
> yazamaz.** Yetenek kapalıysa vaat de kapanır; vaat yetenekten önce açılamaz.

Uygulaması üç maddede:

1. **Ödeme/taksit/ödeme-güvenliği vaadi** yalnız ödeme akışının kendi ağacında
   (`views/checkout/**`, `PaymentSuccessPage`) yazılabilir — orası zaten
   `NEXT_PUBLIC_ODEME_ACIK` kapısının arkasındadır. Vitrinde yazılamaz.
2. **Kargo ücreti / teslim vaadi** ancak siparişin oluştuğu kanalın dilinde yazılır.
   Teklif modunda doğru cümle "teklifinizde belirtilir"dir, "ödeme adımında gösterilir"
   değil.
3. **Sertifika ve garanti** iddiaları markaya bağlıdır; "tüm kategorilerde" basılan
   marka-özel bir iddia (ör. tek markanın Compasso d'Oro ödülü) vaat sızıntısıdır.
   Bu sınıf **karar gerektirir** — kapı onu kırmızı yapmaz, envantere yazar.

## 1.6) ZAMAN vaadi — üçüncü kardeş (REC-148, 2026-09-05)

Ticari vaat bir **yetenek** iddia eder, yetenek vaadi bir **özellik**. Üçüncü sınıf bir
**tarih** iddia eder ve en sinsisi odur:

> **Hiçbir yüzey "yakında" diyemez.** Bir şeyin ne zaman geleceği bilinmiyorsa, vitrin
> onun YOKLUĞUNU söyler; gelme sözü vermez.

Niçin ayrı bir madde: "yakında eklenecektir" cümlesi yazıldığı gün **yanlış değildir** —
o yüzden hiçbir inceleme onu yakalamaz. Yalan olması zaman alır. Ürün açıklaması altı ay
boş kalırsa, o cümle altı aydır ziyaretçiye söylenen bir sözdür ve tutulmamıştır. Kimse
fark etmez, çünkü ortada hata yoktur — yalnızca eskimiş bir vaat vardır.

Doğru iki cevap vardır, üçüncüsü yoktur:

1. **Olgu dili** — "Bu markanın ürünleri henüz katalogda değil." Durumu söyler, söz vermez.
2. **Satırın hiç basılmaması** (K7: *varsa satır, yoksa satır hiç yok*) — açıklaması olmayan
   ürünün açıklama kartı çizilmez. Yer boş kalacaksa düzen de kapanır (§2).

**Ödeme akışı bu maddede MUAF DEĞİLDİR.** Ticari vaat orada meşrudur ("güvenli ödeme"
doğrudur, çünkü orası ödeme yapar); zaman vaadi hiçbir yerde meşru değildir. Nitekim
REC-148'de yakalanan dört cümleden biri tam oradaydı: *"Ödeme yakında açılıyor."*
Yerine K1a dili geldi: **"Şu an teklif kipindeyiz; sipariş ve ödeme kapalı."**

Kapı: **INV-VAAT-SIZINTI-2** (`src/__tests__/conformance/vaat-sizintisi.test.ts`).
Kardeşiyle aynı dosyada durur ama **muafiyeti farklıdır** — tek kapıya sıkıştırmak,
ikisinden birini gevşetmek olurdu.

## 1.4) YETENEK vaadi — ticari vaadin kardeşi (REC-94, 2026-09-04)

Yukarıdaki üç madde **ticari** vaadi yönetir (ödeme, taksit, kargo). 2026-09-04'te aynı
sınıfın ikinci yüzü ölçüldü: **yetenek vaadi.**

> **Bir vitrin yüzeyi, arkasında bugün çalışan bir yetenek olmayan hiçbir EYLEM ya da
> ÖZELLİK iddiasını gösteremez.**

Ölçülmüş iki örnek:

- **"Hızlı Sipariş" düğmesi** site kabuğunda duruyordu — sipariş verilemeyen bir sitede.
  Üstelik gittiği yer `?sort=bestsellers`, yani REC-92'de **veri-dayanaksız** bulunan
  sıralama. Tek düğme, iki kusur.
- **"Etkileşimli 3D" rozeti ve 3D galeri düğmesi.** *"Tıklanmadıkça yüklenmiyor"*
  savunması müşteri tarafında **geçersizdir**: müşteri düğmeyi görür ve tıklar.
  Bir **tetikleyici de vaattir.**

**Uygulama:** böyle bir yetenek kapatılırken tetikleyicisi, rozeti ve sözlük metni
**birlikte** kapanır; hepsi **tek bayrağa** bağlanır ki yüzeyler ayrı ayrı karar veremesin
(bugünkü kusurun kök sebebi tam olarak yüzeylerin birbirinden habersiz olmasıydı).

**Kapsam sınırı:** bayrak **müşteri** yüzeyini yönetir. Admin editörleri (ör. kategori
kurucusunun 3D önizlemesi) buna **bağlanmaz** — orası bir vaat değil, bir çalışma aracıdır.

**Kapı:** `INV-UCBOYUT-KAPALI-1` → `src/__tests__/conformance/uc-boyut-musteri-yuzeyi.test.ts`
Kapı bayrağın **değerini** değil **bağını** ölçer; açma kararı insana aittir ve §4.5
tablosuyla birlikte verilir.

## 2) Vaat kapatılırken düzen de kapatılır

Rozet/kart listesinden kalem silmek **ızgarayı sessizce bozar** (2026-08-31'de ana
sayfada ölçüldü: 6 sütunluk şeritten kalem silinince yarısı boş satır kaldı). Bu yüzden:

- Rozet listeleri **veri-güdümlü** olur; sütun sınıfı kalem sayısından türetilir.
- Tailwind sınıfları **statik** yazılır (`grid-cols-3`), şablonla üretilmez —
  `grid-cols-${n}` üretim CSS'ine hiç girmez ve ızgara tek sütuna düşer.

## 3) Sözlük anahtarı da vaadin parçasıdır

Bir vaat kaldırılınca sözlükteki anahtarı da kaldırılır. Bırakılan anahtar
`INV-6` (ölü anahtar) kapısını kırmızı yapar — ve daha kötüsü, bir sonraki geliştirici
için "bu vaat hâlâ geçerli" sinyali olur. Geri gelmesi muhtemel anahtar için doğru yol
anahtarı bırakmak değil, **niçin kaldırıldığını yorumda yazmaktır**.

## 4) Kapının sınırı (gizlenmiyor)

`INV-VAAT-SIZINTI-1` **kaynak metni** ölçer: vitrin ağacındaki bileşenlerin çağırdığı
sözlük anahtarlarının değerlerinde vaat terimi arar. Ölçmediği iki şey var:

- **DB'den gelen içerik** (kategori `hero_description`, ürün açıklaması). Oraya yazılmış
  bir taksit vaadini bu kapı görmez; o katmanın kapısı katalog tarafındadır.
- **Yeteneğin gerçekten kapalı olduğu.** Kapı "vitrin ödeme vaadi yazmaz" kuralını
  test eder, `NEXT_PUBLIC_ODEME_ACIK`'ın değerini değil. Ödeme açıldığında kural
  gevşetilmez; vaat, ödeme akışının ağacından vitrine **açıkça taşınarak** açılır.

Terim listesi **ayırt edici** olmak zorundadır. Tek kelime `ödeme` ile taranmaz —
"ödeme" kelimesi hukuki metinlerde ve admin'de meşru olarak geçer ve ölçüt hiçbir şeyi
ayırt etmez. Liste, vaadi tek başına taşıyan öbeklerden kurulur ("taksit", "ücretsiz
kargo", "güvenli ödeme", "SSL", "3D Secure", "PCI DSS").

## 4.5) GERİ DÖNÜŞ LİSTESİ — satış modu açıldığında ne geri gelmeli

Bu bölüm bir soruya cevap veriyor: *"fiyatlı hâle dönüş yolculuğunda aynı sorunları
yaşayacak mıyız?"*

**Kapının göremediği tek yön budur.** Mod-bağımlı kapılar iki yönlü yazılır (kapalıyken
yok, açıkken var) ve bir DAVRANIŞIN dönüşünü güvenceye alır. Ama REC-104'te bazı vaatler
davranış değil **içerik**ti ve sözlükten SİLİNDİ. Silinmiş bir metnin yokluğunu hiçbir
kapı gösteremez — gösterecek bir şey kalmamıştır. Bu yüzden liste **elle** tutulur:

| Kaldırılan | Neredeydi | Dönüşte ne gerekir |
|---|---|---|
| `cart.securePayment` | Sepet özeti | Metin yeniden yazılır (anahtar silindi) |
| `category.trustSignals.securePayment*` | Kategori güven şeridi | Başlık + açıklama yeniden yazılır |
| `category.trustSignals.fastShipping*` | Kategori güven şeridi | Kargo vaadi **ölçülmüş** teslim süresiyle yazılır |
| `category.trustSignals.installment*` | Kategori güven şeridi | Taksit vaadi **anlaşmadaki** vade ile yazılır |
| `pdp.trust.freeShipping` | PDP rozet ızgarası | Ücretsiz kargo eşiği varsa eşikle birlikte |
| `pdp.trust.securePayment` | PDP rozet ızgarası | Sağlayıcı adıyla |
| `SecurityRibbon` (bileşen) | Sepet | **Silinmedi** — `CheckoutProgress`'te duruyor, sepete geri konur |
| `support.faq.q1/a1`, `a2` | /destek/sss | Sipariş/ödeme diline döndürülür |
| `support.shipping.desc2` | /destek/teslimat-kargo | "teklifinizde" → "ödeme adımında" |
| `support.returns.onlineKapaliNotu` | /destek/iade-degisim | **Kaldırılır** (koşullar artık koşulsuz geçerli) |

Izgara sütun sayıları da geri alınır: PDP rozet listesi 1 → 3 (`SUTUN_SINIFI` tablosu),
güven şeridi `lg:grid-cols-3` → `lg:grid-cols-6`.

### 4.5.c — ZAMAN vaatleri (REC-148, 2026-09-05)

⚠Bu tablo diğer ikisinden **farklı okunur**: buradaki kalemler satış modu açılınca geri
GELMEZ. Zaman vaadi hiçbir modda doğru değildir; liste, silinen metnin ne olduğunu ve
yerine ne konduğunu kayda geçirmek için vardır — yarın "burada bir cümle vardı" diye
eskisinin geri konmasını engellemek üzere.

| Kaldırılan | Neredeydi | Yerine ne kondu |
|---|---|---|
| `pdp.descFallback` | Ürün detayı, açıklama kartı | **Anahtar SİLİNDİ** — açıklama yoksa kart hiç çizilmez; yandaki "hızlı detaylar" paneli tam genişliğe geçer (yoksa 12'lik ızgarada 7-8 sütun ölü alan kalırdı) |
| `quickView.descFallback` | Hızlı önizleme | **Anahtar SİLİNDİ** — açıklama yoksa paragraf çizilmez |
| `brands.detail.noProducts` | Marka detayı, boş durum | Olgu dili: "Bu markanın ürünleri henüz katalogda değil." (anahtar DURUYOR) |
| `checkout.kapali.baslik` | Ödeme kapalı ekranı | K1a dili: "Şu an teklif kipindeyiz; sipariş ve ödeme kapalı." (anahtar DURUYOR). ⚠Bu metin WhatsApp ön-doldurmasına konu olarak gidiyordu; konu `common.requestQuote`'a ayrıldı — tam cümle konu satırında saçmalıyordu |

### 4.5.b — YETENEK vaatleri (REC-94, 2026-09-04)

| Kaldırılan | Neredeydi | Dönüşte ne gerekir |
|---|---|---|
| `header.quickOrder` | Site kabuğu (`StickyHeader`) | **Anahtar SİLİNDİ** — metin yeniden yazılır. ⚠Eski hedefi `?sort=bestsellers` idi; o sıralama REC-92'de veri-dayanaksız bulundu, **aynı hedefle geri konmaz** |
| PDP "Etkileşimli 3D" rozeti | Ürün sayfası galeri üstü | Bayrak `true` — rozet kendiliğinden döner |
| Galeri 3D düğmesi | `ImageGallery` | Bayrak `true` |
| Kategori paneli 3D ikon sahnesi | `CategoryHubOverlay` | Bayrak `true` |
| Mega menü 3D arkaplanı | `EliteMegaMenu` | Bayrak `true` |
| `/products` orbital 3D şerit | `ProductsDiscoveryView` | Bayrak `true`. ⚠Şerit dönerse `tests/smoke/ssr-html.spec.ts`'te `/tr/products` **`maxBailouts` 0 → 1** geri alınır |
| `common.view3D` · `pdp.threeDAuthority.*` · `home.hero` içindeki "3D keşif" ifadeleri | Sözlük | **Anahtarlar SİLİNMEDİ** — bileşenler bayrağın arkasında duruyor, metin onlarla birlikte döner. ⚠Ama bayrak kapalıyken bu metinler **hiçbir yerde görünmüyor**; ölü-anahtar kapısı onları borç olarak sayabilir |

⛔**Karıştırılmayacak:** `securedBy3d`, `bank3d`, `paymentLoading` içindeki "3D" **3D
Secure**'dür — ödeme doğrulaması, görsel yetenek değil. Bu satırlara dokunulmaz.

**Bayrak:** `src/config/features.ts` → `UC_BOYUT_MUSTERI_YUZEYINDE`.
Derleme-zamanı sabittir (env değil), gerekçesi dosyanın kendi başlığında yazılı.

**Bu tablo kapıya bağlıdır:** `INV-VAAT-SIZINTI-1` bölümün varlığını ve boş olmadığını
ölçer. Liste silinirse kapı kırmızı verir — çünkü listenin kaybolması, dönüş yolculuğunda
sessiz eksik demektir.

## 5) İlgili

- `docs/standards/quote-standard.md` — teklif modunun kendi semantiği
- `docs/standards/checkout-payment-standard.md` — ödeme akışı
- `src/__tests__/conformance/storefront-fiyat-sizintisi.test.ts` — **kardeş kapı**:
  fiyat sızıntısı. Bu kapı vaadi, o kapı rakamı korur; ikisi aynı ailedendir.
- `src/__tests__/conformance/promise-backing-behavior.test.tsx` (INV-PROMISE-1) +
  `docs/audits/t104-vaat-dayanagi-olcumu-2026-08-20.md` — **ayrı eksen, karıştırılmasın.**
  Orada soru "bu EYLEM vaadi gerçekten çalışıyor mu" (davranışsal ölçüm zorunlu);
  burada soru "bu YETENEK iddiası yazılabilir mi" (metin ölçümü yeterli).
