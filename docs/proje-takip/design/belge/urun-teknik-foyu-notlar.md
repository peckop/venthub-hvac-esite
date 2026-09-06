
# Ürün Teknik Föyü + stres provası — teslim notları

**Tur:** OPS emri `ops-emir-2026-09-06-1-belge.md` (REC-153 cevapları + föy emri + stres provası)
**Teslim:** `Urun Teknik Foyu.dc.html` · kabukta dil yuvası · beş belgeye stres provası · numaralandırma kalıbı
**Kullanılan yetenek:** Document (doc-page A4) · Make tweakable
**İmza:** — DESIGN-BELGE (Opus) 2026-09-06

---

## 1 · Dil yuvası (153-6) — kurulu

Kabuğun bütün metni tek **sözlük nesnesinde** (`sozluk.tr` / `sozluk.en`), `dil` prop'u `tr` | `en`. Çevrilen beş dize: kapalı-bekler başlığı · kapalı-bekler açıklaması · "Sayfa" · kare kod etiketi · künye yer tutucusu. EN karşılıkları: "Sales mode · dormant" · "Page" · "Tax authority QR" vb.

**Kapı ölçüldü:** şablon gövdesinde görünen Türkçe metin **0** (kalan Türkçe karakterler yalnız bir CSS yorumunda). Props varsayılanları da **boşaltıldı** — daha önce dört Türkçe literal orada duruyordu ve `dil="en"` iken kabuğu Türkçeye çekebilirdi; artık sözlük tek kaynak (`p.x || s.x`, boş dize "verilmedi" sayılır).

**Çevrilmeyenler, bilerek:** yuva adları (`sayfaNo` · `toplamSayfa` · `nakliYekun` · `belge_no`). Onlar alan adı, metin değil; `alanAdlari` kipinde geliştiriciye aynen görünmeleri gerekir.

Satınalma seti (K10) aynı kabuktan `dil="en"` ile çizilecek; ikinci kabuk açılmayacak.

## 2 · Ürün teknik föyü

`Urun Teknik Foyu.dc.html` — A4, kabuk `Belge-Kabugu`, satış kipinden bağımsız (kapalı-bekler etiketi yok, fiyat yok).

Bölümler: kimlik şeridi (aile · ürün adı · model/marka çipleri · özet) + 190 px fotoğraf kutusu → dört teknik tablo → uygulama alanları (Source Serif 4, yalnız `description_i18n` doluysa) → belge kimliği + kare kod yuvası → sorumluluk notu.

**Ölçüm:** 16 alan → dört grupta 9 + 3 + 3 + 1 satır; sayfa **1,42** normal kipte, **1,28** `alanAdlari` kipinde (2 sayfa basar, emir 1–2 sayfa diyordu).

### Düzeltilen kusur — değer hücreleri anlam sütununun üstüne basıyordu

İlk teslimde bu bölüme "taşan hücre 0" yazdım. **Yanlıştı ve ölçmemiştim** — bu, aynı sınıftan üçüncü hatam (logo gri tonu, takip numarası boyu). Gerçek ölçüm:

`TeknikTablo.jsx` değer kolonunu **sabit 150 px** basıyor ve taşma görünür kalıyor; bileşenin `style` prop'u yalnız köke iniyor, satırlara değil — yani genişliği föyden ayarlamak mümkün değil. Benim yazdığım yer tutucular (`[sound_pressure_level_lp_db_a_2m_max] dB(A)` gibi) tek parça ve 300 px'e kadar çıkıyordu:

| Ölçüm | Değer |
|---|---|
| Taşan değer hücresi | **8 / 16** |
| Anlam metninin üstüne basan | **5** |
| En kötü örtüşme | 150 px (300 px dize, 150 px kutu) |

Çözüm: dize 150 px'e sığmak zorunda, ve anahtar adı **zaten `alan` kolonunda**. Değer kolonu normal kipte yalnız birimi taşıyor (`— m³/h`), `alanAdlari` kipinde tablo adını (`technical_specs`).

Aynı ölçümde ikinci taşma çıktı: `alanAdlari` kipinde üç uzun anahtar 190 px'lik alan kolonunu aşıyordu (238–242 px). Anahtar adı kısaltılamaz — bilgi o; alt çizgilerden sonra sıfır genişlikli boşluk kondu, tarayıcı kırıyor, ad aynen okunuyor.

**Yeniden ölçüldü, iki kipte de: taşan hücre 0, örtüşme 0.**

### Veri mantığı koddan alındı, uydurulmadı

`src/utils/productHelpers.ts` okundu ve dört tablo föye taşındı: `translateSpecKey` (Türkçe etiketler) · `formatSpecValue` birim sonekleri (**uzunluğa göre sıralı** — kodun kendi yorumunda anlattığı kusur: `_db_a` kontrolü `_a`'dan önce gelmezse 142 üründe ses seviyesi "58 A" basılıyordu) · `groupTechnicalSpecs` dört grubu · `SPEC_SORT_ORDER` satır sırası.

Kimlik kuralı da oradan: kanonik ad `products.name`, **ham SKU müşteriye gösterilmez** (`model_code` yoksa etiket hiç çizilmez). Föyde `sku` yalnız belge kimliği bloğunda arşiv amaçlı duruyor — bu bir sapma, OPS onaylarsa kalır, yoksa çıkar.

**Bayatlama riski:** bu dört tablo kopyadır; sahibi kod tarafıdır. Kodda birim ya da etiket değişirse föy sessizce eskir. Tek gerçek çözüm föyün veriyi üretimde alması; şablon tarafında bunun karşılığı yok, o yüzden kayda geçiyor.

### ⚠ Gerçek değerler yok — uydurmadım

Emir "LINEO 100 Q gerçek veri, uydurma yok" diyor. `technical_specs` değerlerine **erişimim yok**: Supabase bana kapalı, depoda da veri bulunamadı (arandı). İkisini birden yapamayacağım için uydurmadım — değer hücreleri **yuva adını** taşıyor: `[max_delivery_max_speed_m3h] m³/h`. Birim, sıra, satır sayısı, grup dağılımı ve tablo yüksekliği bu hâlde de ölçülebilir. Gerçek değerler gelince tek yerden dolar (`anahtarlar` dizisi + `formatSpecValue`).

Anahtar listesi uydurma değil: `translateSpecKey` sözlüğünde ve `SPEC_SORT_ORDER`'da adı geçen 16 anahtar.

### TeknikTablo mount'u (K17) — bir engel ve çözümü

Tablo DS'in `TeknikTablo` bileşeni; elle tablo yok. Ama `x-import component-from-global-scope="VentHubDesignSystem_31b082.TeknikTablo"` **DOM'a hiç düşmedi** — `sc-if` içinde de dışında da sıfır `x-import`, konsol sessiz, global ise mevcut (`typeof … === 'function'`). Bileşen bu yüzden logic tarafından mount ediliyor (`React.createElement(DS.TeknikTablo, { satirlar })`) ve şablona hole ile giriyor.

Render eden kod DS'in kendi bileşeni; ölçüldü: üç kolon `190px / 150px / 1fr`, değerler IBM Plex Mono + tabular-nums, K7 (boş satır çizilmez) bileşenin içinde çalışıyor. **Bedeli:** tablo gövdesi editörden tıklanamaz. Satır metni veriden üretildiği için elle düzenlenmemeli, ama kayda geçsin.

## 3 · Stres provası — beş belgeye yayıldı (153-11)

Aynı üretici altı belgede: 40 kalem · 8 grup · uzun ürün adları (en uzunu 62 karakter) · **17 nolu kalem KDV istisnalı** (`tax: 0` → toplamda ikinci KDV satırı) · iki grupta %5 iskonto.

| Belge | Kalem | Sayfa yüksekliği | Sayfa | Taşan hücre | KDV satırı |
|---|---|---|---|---|---|
| Teklif v2 | 40 | 5 201 px | **3,83** → 4 | 0 | 2 |
| E-Fatura Görünümü v2 | 40 | 4 086 px | **3,01** → 4 | 0 | 2 (+ toplam) |
| Proforma v2 | 40 | 3 414 px | **2,51** → 3 | 0 | 2 |
| Sipariş Onayı v2 | 40 | 3 272 px | **2,41** → 3 | 0 | 2 |
| Teklif Talebi Özeti v2 | 40 | 2 999 px | **2,21** → 3 | 0 | — (fiyat yok, ölçüldü) |
| Kargo Bildirimi v2 | 40 | 2 428 px | **1,79** → 2 | 0 | — (tutar yok, ölçüldü) |

A4 basılabilir kutu 1 358 px (16–18 mm kenar). Talep özetinde 8 grup ara başlığı sayılDI; iki fiyatsız belgede para birimi ifadesi **0** (E15 ve K2 hâlâ geçerli).

**Ölçülemeyen tek şey:** grup ara başlığının sayfa sonunda yalnız kalması. `break-after:avoid` kondu, Chrome tablo satırında kısmen destekliyor; tarayıcı sayfa sınırlarını DOM'a vermediği için ölçülemez. Kâğıt provasında görülecek (153-9).

## 4 · Numaralandırma kalıbı (153-7 taslak hükmü)

Örnekler kalıba çevrildi: teklif **TK-20260906-0007** · sipariş **VH-20260912-0018** · proforma **PF-20260914-0031**. Kargo bildirimi kendi numarasını taşımıyor, siparişe bağlı. E-fatura numarası GİB biçiminde kaldı (`VNT2026000000318`) ve `alanAdlari` kipinde "biçim GİB'den, biz üretmeyiz" notu düşüyor. `alanAdlari` kipinde teklif ve sipariş numaraları `→ belge_no` olarak işaretli.

Hüküm taslak olduğu için bu bir çizim tercihi; Recep itiraz ederse örnekler tek turda döner.

## 5 · OPS'un ölçemediği — e-posta gövdeleri

`email/` altında **beş dosya var**: `talep-alindi.html` · `teklif-yanitlandi.html` · `hesap-olusturuldu.html` · `siparis-onayi.html` · `kargo-bildirimi.html`. Son ikisi emir #5 turunda yazıldı ve prova sayfasında beşi birden görünüyor. OPS'un görememesi dosya listesi tazeliğiyle ilgili olabilir; dosyalar yerinde.

