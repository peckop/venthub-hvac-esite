
# Ürün sayfası v2 — hikâye akışı notları (DESIGN-MENU, 2026-09-05)

Brief: geri-bildirim-10 madde 81 (K20). Düğmeler: **VARIANCE 4 · MOTION 3 · DENSITY 7**.
Teslim: `Urun Sayfasi v2 Hikaye.dc.html` — masaüstü akan sayfa (1440) + mobil kompozisyon (390) + hareket anahtarı.
Örnek aile: **Vortice Lineo Quiet** (12 model, `vortice-lineo-quiet`), sayfanın ürünü **Lineo 250 Quiet ES / VRT-17175**.

## Kural 2 · İlk ekran değişmedi
07c kalıbı aynen: marka satırı → h1 34px → kod + üç çip (ErP · IP44 · Class II) → **dört kalın madde** → altı satırlık
teknik tablo → varyant seçici (Çap ×6 · Motor ×2) → eylem bloğu (tek kiremit + çerçeveli) → 44px hesap çağrı satırı.
Sağda 462px görsel kolonu. Hikâye bunun **altında**, yapışkan bölüm çubuğundan sonra başlıyor.

## Kural 3 · Altı bölüm, altı ayrı aile, ardışık tekrar yok

| # | Bölüm | Aile | Neden bu aile |
|---|---|---|---|
| 1 | **Gövde** | **pin** — sol sütun `position:sticky`, sağda numaralı satırlar tek tek oluşur | Gövde tek konu, dört ayrı olgu; başlık sabit kalırken maddeler geçmeli |
| 2 | **Çark ve akış** | **reveal** — metin + ölçülmüş P-Q eğrisi yan yana | Eğri konunun kanıtı; görsel ve metin aynı anda okunmalı |
| 3 | **Motor** | **sayı bloğu** — dört metrik kutusu (ES ↔ AC) | Dört ölçüm birbiriyle kıyaslanıyor; tablo fazla, cümle az |
| 4 | **Koruma** | **imza hareketi** — kesitin dört katmanı sırayla açılır (160ms kademe) | 3D yerine gelen hareket (kural 4); statik görsel + gecikmeli açılma, video değil |
| 5 | **Ses** | **veri grafiği** — altı çaplı yatay çubuk cetveli | Aile ölçeği ancak karşılaştırmalı grafikte görünür |
| 6 | **Montaj ve aile** | **tablo** — 12 model × 6 kolon | Envanterin tamamı; hikâyenin kapanışı |

Sıra: pin → reveal → sayı → katman → grafik → tablo. Hiçbir aile ardışık tekrar etmiyor.

## Systemair'ın altı bloğundan ikisi çizilmedi (K7)

- **Kontrol** — `has_timer: false`, `has_humidistat: false` (12 modelin tamamında); 0–10 V / kademe verisi şemada yok.
  Blok çizilmedi, yerine **Ses** bölümü kondu: `noise_level_db_a` 12/12 dolu ve ailenin gerçek ayırt edici ekseni
  (25 → 45,4 dB(A)). Gerekçe kayıtta; veri gelirse Kontrol bölümü Ses'ten sonra eklenir.
- **Belge ve indirme** — ölçüm raporu m.4: şemada belge tablosu yok, tek dosya tablosu `product_images`.
  Bölüm hiç çizilmedi, "yakında" yazılmadı. REC-145 ile açılır.

## Kural 4 · İmza hareketi
GLB modeli olan ürün **0/374** → 3D izleyici bloğu çizilmedi. Yerine kesit görselin kaydırmayla katman katman
açılması: dış gövde (IP44) → akustik katman → iç kanal + karma akışlı çark → EC motor (Class II). Dört `data-layer`
grubu 160ms kademeyle açılıyor. Statik SVG + gecikme; video, canvas, WebGL yok.

## Kural 5 · Yasaklar
"Kaydırarak keşfet" oku yok · bölüm sayacı (01/06) yok — numaralar yalnız Gövde bölümünün madde sırası ·
ortalanmış metin bloğu yok (hepsi sola hizalı) · görsele gömülü metin yok (SVG etiketleri veri etiketi) ·
video yok · uydurma istatistik yok · em dash yok.

## Kural 6 · Reduced motion ve hareketin garantisi
`hareket` prop'u (Tweaks'te anahtar). Kapalıyken: `transition: none`, `opacity: 1`, `transform: none` — bütün
bölümler ve dört katman birden görünür, içerik hiç eksilmez. `prefers-reduced-motion: reduce` sistem ayarı
anahtarı geçersiz kılar. Hareket **yalnız** `opacity` + `translateY(14px)` kullanıyor; `transition: all` yok.

**Hareket bir katkıdır, içeriğin koşulu değil.** İlk yazımda gizleme adımı koşulsuzdu ve içeriği geri getirmenin
tek yolu `IntersectionObserver`'a bırakılmıştı. Gözlemci tetiklenmediği ortamlarda (yüklenirken arka sekme,
ekran görüntüsü alma, PDF çıktısı, kısıtlı derleme) altı bölümün tamamı görünmez kalıyordu. Üç katmanlı emniyet
eklendi:
1. **Gizleme koşullu:** `IntersectionObserver` yoksa ya da `document.visibilityState !== 'visible'` ise hiç
   gizlenmez, içerik doğrudan açık çizilir.
2. **900 ms emniyet zamanlayıcısı:** gözlemci bu süre içinde tetiklenmezse hâlâ gizli olan her şey açılır.
3. **İlk `scroll` ve `visibilitychange` olayı** da aynı açma işini yapıyor (`once`).

JS hiç çalışmazsa içerik zaten tam görünür — gizleme JS ile yapılıyor, yazılı hâl açık.

## Kural 7 · Mobil ayrı kompozisyon
390 çerçeve ayrı çizildi, ölçek büyütmesi değil:
- Sabitlenen başlık **kalktı** (iki kolon yok); bölüm başlığı akışın içinde, Gövde'nin maddeleri 4 → **3**.
- Kesit **dikey dizildi**: masaüstünde katmanlar iç içe, telefonda alt alta dört şerit — aynı dört renk.
- Aile tablosu 6 → **3 kolon** (model · debi · ses), gerisi yana kaydırmada.
- Ses cetveli kısaldı, ölçek aynı; etiketler 120px → 62px.
- Yapışkan eylem çubuğu + **4 sekme** (K19: Ana sayfa · Ürünler · Teklif · Hesap), üst şeritte TR/EN + hesap.
- Dokunma hedefleri ≥44px; çap çipleri yatay kaydırma.

## Kural 8 · Doğrulama
Üç hâl tek dosyada: masaüstü (varsayılan) · mobil (aynı sayfanın alt bölümü, 390 çerçeve) ·
hareket kapalı (Tweaks anahtarı). Artboard yerine **akan sayfa** seçildi çünkü hareket gerçek kaydırmayla
çalışıyor; iki artboard yan yana konsa `IntersectionObserver` tetiklenmezdi. Mobil bu yüzden çerçeve içinde,
masaüstü sayfanın kendisi olarak akıyor.

## Kabuk satırı akıcı hâle getirildi
Sayfa akan bir sayfa olduğu için (artboard değil) 1440'tan dar ekranlarda 74px kabuk satırı taşıyordu:
924px genişlikte `scrollWidth` 1039px ölçüldü, "Teklif (2)" sayacının 72px'i ve hesap simgesinin tamamı
ekran dışında kalıyordu — yani K19'un yeni karara bağladığı iki öğe ilk kaybolan şeydi. Düzeltme: satır
`flex-wrap: wrap`, nav bloğu `flex: 0 1 auto; min-width: 0`, arama `flex: 1 1 140px; min-width: 0`
(eski `min-width: 200px` kalktı), sağ blok `flex: none` ve `white-space: nowrap` ile bölünmez. Dar ekranda
sağ blok ikinci satıra iniyor, hiçbir şey kırpılmıyor. 390 mobil çerçevesi zaten doğruydu, ona dokunulmadı.

## Logo SVG'den (K23, aynı turda)
İlk yazımda marka işareti CSS `clip-path` ile çizilmişti (masaüstü header 34px, mobil sekme 22px). OPS'un K23
kuralı geldi: logo elle çizilmez, yalnız `brand/logo/` SVG'lerinden. İkisi de `<img>` ile değiştirildi —
koyu header `venthub-isaret-tamrenk-koyu.svg`, mobil sekme `venthub-isaret-lacivert.svg`. Yedi logo dosyası
marka projesinden bu projeye kopyalandı.

## Sayı disiplini · her değer ölçüldü

Kaynak: `products.technical_specs` + `product_families.description` (Supabase SELECT, 09-05).

| Alan | VRT-17175 (ES) | VRT-17165 (AC) |
|---|---|---|
| Debi | 1.485 m³/h · 412,5 l/s | 1.550 m³/h |
| Statik basınç | 367,8 Pa | 339,3 Pa |
| Ses | 39,5 dB(A) | 40,1 dB(A) |
| Güç | 125 W · 0,97 A | 150 W |
| Motor | EC · 2 kutup · 2.680 d/dk | AC |
| Çap · ağırlık | 250 mm · 13,4 kg | 250 mm · 13,4 kg |
| Gövde | 318 × 411,9 × 751,5 mm | aynı |
| Koruma | IP44 · Class II · ErP | aynı |
| Eğri | `[[0, 367.8], [742.5, 183.9], [1485, 0]]` | var |

Eğrinin üç noktası da veriden; ara nokta uydurulmadı, çizgi bu üç nokta arasında geçiyor.
Ses cetvelinin altı değeri ES sürümlerinden; çubuk ölçeği ailenin gerçek aralığına (25–45,4 dB) göre.
Aile tablosunun 12 satırı × 5 değeri doğrudan SELECT çıktısı.

Çıkarım olan tek cümle: *"Kanal hattı uzunsa ES, hava miktarı öndeyse AC"* — dört ölçümün karşılaştırmasından
geliyor, veride yazılı değil. Notlarda işaretli.

## Anti-default listesi karşısında
Mor gradyan yok · üç eşit özellik kartı yok (dört metrik kutusu ayrı iş yapıyor, ES↔AC kıyası) · cam efekti yok ·
sonsuz döngü animasyon yok · Inter + slate-900 yok (Archivo + #1a2b4a) · ortalanmış kahraman yok (ilk ekran iki
kolon, sola hizalı). Hiçbiri gerekçe gerektirmedi.

## Yayın durumu
**Çizildi, yayına girmez** (brief kuralı): bölüm metinleri veriden çıkarılabilen cümlelerle yazıldı, ama
REC-146 içerik hattı ailenin gerçek anlatımını üretmeden bu sayfa canlıya alınmaz. Ölçüm raporu m.1 ve m.3
bunu sayıyla söylüyor: 40 ailenin 9'unda açıklama yok, 31'inde ortalama 130 karakter tek cümle.

— DESIGN-MENU (Fable) 2026-09-05

