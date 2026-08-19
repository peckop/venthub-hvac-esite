# T093 — Adres girişi: il/ilçe kontrollü seçim (PLAN)

> **Durum:** PLAN v1 · 2026-08-18 · Şerit: PRICING-STOK · Öncelik: HIGH
> **Yöneten cetvel:** henüz YOK → bu iş **cetveli yazmayı da kapsar**
> (`docs/standards/checkout-payment-standard.md` §1 kapsamı yalnız **ödeme yüzeyidir**;
> adres girişi hiçbir cetvelde tanımlı değil). CLAUDE.md kural 1 gereği bu açıkça belirtilir.
> **Tetikleyen:** Recep — "şehir ilçe seçimi gibi konularda eksik var sanırım, enterprise
> seviye olmalı". Ölçüm haklı çıkardı.

## 1. Ölçülen durum

**Dört yüzeyde de serbest metin girişi var; hiçbirinde doğrulama yok:**

| Yüzey | Alan | Biçim |
|---|---|---|
| `src/views/checkout/StepAddressInfo.tsx` | teslimat il/ilçe | serbest `<input>` |
| `src/views/checkout/StepAddressInfo.tsx` | fatura il/ilçe | serbest `<input>` |
| `src/views/checkout/AddressFormModal.tsx` | il/ilçe | serbest `<input required>` |
| `src/views/account/AccountAddressesPage.tsx` | il/ilçe | serbest `<input required>` |

Depoda **81 il / ilçe veri kümesi yok**. İl–ilçe tutarlılığı kontrol edilmiyor; posta kodu
ilçeden türetilmiyor.

## 2. ⭐ Ölçüm kapsamı DARALTTI: taşınacak veri YOK

Planı yazmadan önce prod ölçüldü:

| Kaynak | Satır | Bulgu |
|---|---|---|
| `user_addresses` | **0** | kayıtlı adres hiç yok |
| `venthub_orders` (JSONB gömülü adres) | **3** | üçü de test siparişi, üçü de `İSTANBUL / KÜÇÜKÇEKMECE` |

Yani **normalize edilecek gerçek müşteri verisi yoktur.** İlk kapsam önerimde bir
"normalizasyon migration'ı" alt-görevi vardı; **ölçüm onu düşürdü**. Yerine geçen iş:
sorunun hiç başlamamasını sağlayan kapı.

> Var olan 3 satır bile kusuru kanıtlıyor: hepsi **BÜYÜK HARF**. Kanonik biçim
> `İstanbul / Küçükçekmece`'dir. Serbest metin bugün ne yazılırsa onu saklıyor.

**Bu pencere kalıcı değildir** — ilk gerçek siparişten sonra taşınacak veri doğar.
Uygulamadan önce sayı **yeniden ölçülmelidir** (0 olmayabilir).

## 3. Niçin bu bir "güzelleştirme" değil, operasyonel altyapı

- **Kargo entegrasyonu** (Recep'in açık kalemi) tam ad eşleşmesi ister; yazım hatası =
  etiket üretilemez = sipariş takılır.
- **e-Fatura / vergi** tarafı doğru il/ilçe'ye bağlı.
- `İstanbul` / `Istanbul` / `İSTANBUL` / `ıstanbul` bugün **dört ayrı değer** olarak yazılır;
  admin'de şehre göre filtre ve rapor güvenilmez olur.
- `Kadıköy / Ankara` gibi **imkânsız kombinasyon** kabul edilir.

## 4. ⚠️ Türkçe büyük/küçük harf tuzağı (tasarımı belirler)

Türkçede `i`↔`İ` ve `ı`↔`I` çiftleri İngilizceden **farklıdır**. `'İSTANBUL'.toLowerCase()`
JavaScript'te varsayılan olarak yanlış sonuç üretir (`i̇stanbul`, birleşik nokta ile).
Bu yüzden:

- Karşılaştırma ve normalizasyon **daima** `toLocaleLowerCase('tr')` /
  `toLocaleUpperCase('tr')` ile yapılır.
- Daha iyisi: **serbest metinden hiç türetme.** Kullanıcı listeden seçtiği için kanonik
  ad zaten veri kümesinden gelir; karşılaştırmaya gerek kalmaz.

Bu, seçim bileşenini "kolaylık" olmaktan çıkarıp **doğruluk mekanizması** yapan asıl sebep.

## 5. İş kalemleri

### P1 — Veri kümesi (SSOT)
81 il + ilçeleri tek dosyada. **Kaynak cetvele YAZILIR**: hangi resmî liste, hangi tarih.
Kaynaksız SSOT bayatlar — ilçe listeleri değişir (yeni ilçe kurulur, ad değişir).
Kaynak adayı: T.C. İçişleri Bakanlığı / TÜİK idari birim listesi. **Kaynak seçimi ve
tarihi, uygulama PR'ında kanıtıyla birlikte belgelenecek.**

> **P1 DURUMU (2026-08-18, ölçüldü) — kaynak kararı BENDE, tıkanma veri EDİNİMİNDE.**
>
> Kaynak biçimi kararı bir mühendislik seçimidir, Recep'e havale edilmez:
> **(a) vendored veri** seçildi — resmî listeden bir kez alınır, depoya **kaynak + tarih +
> sağlama** ile konur. Gerekçe: SSOT depoda kalır, çevrimdışı çalışır, denetlenebilir ve
> yeni bir bağımlılık getirmez. (b) npm paketi elenmiştir: güncellemeyi devralır ama
> içeriği yine doğrulanmak zorundadır, yani asıl işi çözmez.
>
> **İLLER: ALINDI VE DOĞRULANDI.** 81 il + plaka kodları çekildi ve bütünlüğü
> **programla sınandı**: 81 satır · plaka kodları `1..81` **birebir örten** · tekrar eden
> ad yok · eksik kod yok. Bu sınav önemlidir çünkü veri kümesini "geldi" diye kabul etmek
> yerine **kanıtlanabilir bir değişmezle** kabul ediyoruz.
>
> **İLÇELER: HENÜZ ALINMADI — asıl tıkanma burada.** ~970 ilçe hafızadan yazılamaz ve
> uydurulamaz (CSP host listesi için reddettiğim şeyin aynısı olurdu). Üstelik ilçelerin
> plaka gibi **birebir örten bir değişmezi yoktur**, yani doğrulama da daha zayıftır:
> il başına sayı + toplam sayı + il-ilçe aidiyeti çapraz kontrol edilerek kabul edilecek.
> Toplu ve tek seferde indirilebilir bir kaynak gerekiyor; il başına ayrı çekim (81 istek)
> bu turda orantısız.
>
> **Recep'ten istenen tek şey** (karar değil, kaynak): elinde resmî bir il/ilçe listesi
> (CSV/XLSX) varsa vermesi — yoksa indirme adımı ayrı bir iş kalemi olarak yürütülecek.

> **ESKİ NOT (aşağıdaki karar maddesi yukarıdaki ölçümle kapandı):**
> Veri kümesi ne depoda ne `venthub-pdf-ingestor` veri deposunda var (ikisi de arandı).
> 81 il hafızadan yazılabilir ama **~970 ilçe yazılamaz** — ve uydurmak, CSP host listesi
> için reddettiğim şeyin aynısı olurdu: doğrulanmamış veriyi SSOT diye kaydetmek.
> İlçe listeleri ayrıca **zamanla değişir**, yani kaynaksız bir liste doğduğu gün bayattır.
>
> **Karar gereken:** veri nereden gelecek?
> - **(a) Vendored CSV/JSON** — resmî listeden (TÜİK / İçişleri) bir kez indirilir, depoya
>   kaynak + tarih + sağlama (checksum) ile konur. Bağımlılık yok, güncelleme elle.
>   *Önerim bu:* SSOT depoda kalır, denetlenebilir, çevrimdışı çalışır.
> - **(b) Bakımlı bir npm paketi** — güncellemeyi devralır ama bir bağımlılık daha ekler
>   ve içeriği yine doğrulanmalıdır.
>
> Hangisi seçilirse seçilsin **kaynak adı ve tarihi cetvele yazılacak** (P4 bunu kapı
> hâline getiriyor). Karar gelene kadar P1 durur; **P2/P3/P4 tasarımı P1'den bağımsız
> ilerleyebilir** çünkü bileşen sözleşmesi verinin İÇERİĞİNE değil ŞEKLİNE bağlıdır.

### P2 — Bağımlı seçim bileşeni
İl seçilir → ilçe listesi daralır. **Dört yüzey de aynı bileşenden beslenir** (ikinci kopya
= sessiz ayrışma). Erişilebilirlik: klavyeyle tam kullanılabilir, `label` bağlı,
`focus-visible` (CLAUDE.md kural 8).

### P3 — Cetvel
`checkout-payment-standard.md` **adres girişini kapsamıyor**. İki seçenek:
(a) cetveli `checkout-standard.md`'ye terfi ettirip adres bölümü eklemek,
(b) ayrı `address-standard.md`. **Öneri: (b)** — adres girişi hesap tarafında da kullanılıyor
(`AccountAddressesPage`), yani checkout'a ait değil, ondan geniş.

### P4 — Kapı (INV-ADDRESS-1)
- Serbest metin il/ilçe `<input>`'u **YASAK**; bileşen dışında `city`/`district` girişi
  eklenirse KIRMIZI.
- Veri kümesinin **kaynağı ve tarihi** dosyada mevcut olmalı.
- İl–ilçe tutarlılığı: bileşen, seçili ile ait olmayan ilçeyi kabul etmemeli.
- Her kural için **sabotaj** yazılacak ve kırmızı görüldüğü kanıtlanacak.

## 6. Şerit sahipliği — AÇIK

`src/views/account/AccountAddressesPage.tsx` **hiçbir claim'de değil**. OPS-AUDIT'in
talimatı: T093'e başlarken claim'ime UNION ile eklenecek, ADMIN-CUSTOMER'a bilgi notu
düşülecek.

## 7. Sıra

**T080-A merge edildikten SONRA** başlar (aynı checkout dosyalarına dokunuyor; paralel
yürütme çakışma üretir). T080-A `#661` ile master'a indi → **T093 başlayabilir.**
