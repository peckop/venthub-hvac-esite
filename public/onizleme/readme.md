# VentHub Design System 2

Damga: `kaynak_updatedAt` 2026-10-21 · **Karar 405** · kuran DESIGN-MARKA.

VentHub (venthub.com.tr) HVAC havalandırma ürünlerinin e-ticaret sitesidir: fan, sığınak havalandırma, hava perdesi, hava şartlandırma, ısı geri kazanım, kontrol/sürücüler ve aksesuarlar. Site teklif kipinde ("Teklif iste") ve satış kipinde ("Sepete ekle") çalışır. Markalar, bu sıra ve yazımla: **Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva**.

Bu sistem Karar 405 dilini taşır: oval düğme ve çipler, 16 px kart köşesi, ölçülü gölge, iki sınıf hareket, tek petrol arayüz rengi, kiremit yalnız ana eylemde.

## Kaynaklar

- Marka projesi `670f9f75-9e90-499e-a6fe-a98139bb457a` ("VentHub marka"):
  - `brand/tokens.css` — tek değer dosyası (bu DS'in bütün token değerleri buradan birebir)
  - `brand/tailwind-brand.js` — Tailwind eşlemesi
  - `1 Venthub Marka Kilavuzu.dc.html` — kılavuz A–I (bu readme B–G'den türetildi)
  - `brand/logo/` (30 SVG) · `brand/icons/` (144 SVG)
  - `ds-devir/README.md` tur 3 — kurulum emri
- Eski DS `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7` — yalnız yapı örneği, değiştirilmedi (yedek).
- Kod deposu (marka paketinde anılan): `peckop/venthub-hvac-esite`. Bu kurulumda okunmadı.

> Not: `brand/` 22 Ekim'de marka projesinden yeniden kopyalandı: `README.md` Karar 405'e göre yenilenmiş, `tokens.css` `--weight-baslik` 600 + `--weight-h1` 800. `tokens/` ile birebir.

## Dizin

- `styles.css` — yalnız `@import`: fontlar + sekiz token dosyası
- `tokens/` — `fontlar.css` · `renk.css` · `yuzey.css` · `kenar.css` · `metin.css` · `bicim.css` (köşe + gölge) · `hareket.css` · `tipografi.css` · `olcu.css` (K37)
- `brand/` — marka projesinden birebir kopya (tokens.css, tailwind-brand.js, README.md, logo/, icons/)
- `assets/logo/` (30 SVG + README) · `assets/icons/` (144 SVG) — türev kopya, dosyalar değiştirilmez
- `components/` — on bir temel bileşen + yedi S5 parçası (aşağıda)
- `guidelines/` — temel kartları (Renk, Yazı, Biçim, Hareket, Ölçü, Marka)
- `templates/kabuk/` — Kabuk şablonu (açık header + aydınlık gövde + koyu alt bilgi)
- `SKILL.md` — Agent Skills uyumlu giriş
- `thumbnail.html` — proje kutucuğu

## Bileşenler

- `components/dugme/`
  - **AnaEylemDugmesi** — oval, #BF5309, sayfada tek dolu düğme
  - **CerceveliDugme** — oval; `ton="petrol"` 1.5 px petrol kenar · `ton="sade"` 1 px control kenar · üstüne gelince dolu petrol
  - **KatliCagriSatiri** — SSS satırı (S5): kapsız, numara · soru 17/600 · 36 px ok, 1 px hairline ayırıcı; gövde 280 ms açılır
- `components/yuzey/`
  - **Cip** — oval, 44 px; seçili hâl dolu petrol + ✓
  - **Kart** — 16 px köşe, üstüne gelince `--shadow-kart-hover` + 2 px kalkma; ürün kartı alanları
  - **HukumKutusu** — 4 px sol kural + etiket: yeter · sınırda · yetmez · bilgi
  - **Rozet** — tıklanmaz oval etiket: nesnel · hüküm · soluk
- `components/veri/`
  - **TeknikTablo** — alan · değer · anlam
  - **KarsilastirmaTablosu** — satır alan, kolon model
  - **AdetKontrolu** — oval, 44 px
  - **PQEgrisi** — petrol eğri + kiremit çalışma noktası
- `components/kabuk/`
  - **KabukBandi** — açık header + koyu alt bilgi
- `components/anasayfa/` (iş emri #6)
  - **AnaSayfaSahne** — ana sayfa üst sahnesi: ürün grupları döner, Teklif iste + İncele →; tonlar `tokens/sahne.css`
- `components/gezinti/` ek (iş emri #6)
  - **UrunHaritasi** — Ürünler sayfası ürün haritası (grup kutusu + ürün türü satırları)
- `components/liste/` ek (iş emri #6)
  - **UygulamaBolumu** — uygulama alanı bölümü: başlık + ürün türleri + SeriesCard ızgarası
- `components/form/` (iş emri #5)
  - **MetinGirisi** — etiketli metin kutusu, 44 px (çok satır en az 3 satır), köşe 12, odakta 2 px petrol halka, açıklama altta
- `components/aile/` (iş emri #2, 24 Ekim)
  - **SeriesPicker** — "Seri seçin · n seri" + çipler (✓), 36/44
  - **CutawayView** — kesit görseli + numaralı işaretler + açıklama listesi
  - **CatalogMode** — katalog kipi: ‹ s. n / N ›, atlama, katalog tablosu, Siteye dön

### S5 parçaları (DESIGN-MENU)

Kaynak: DESIGN-MENU projesi `be615496-25af-4630-aa2c-324c2cfc88e0`, `parca/` klasörü. Eşleşme: `parca-depo-eslesme-2026-10-21.md` (depo `peckop/venthub-hvac-esite`). Adlar parça ve depo dosyasıyla **aynı**. Parçalar `window.VH` veri katmanından okuyordu; DS bileşeninde veri props ile gelir, görünüm ve metin birebir.

- `components/liste/`
  - **ProductCard** — ürün kartı/satırı · depo `components/ProductCard.tsx` (quoteMode/showPrice)
  - **FamilyCard** — seri kartı/satırı · depo `components/products/FamilyCard.tsx`
  - **CategoryFilters** — süzgeç paneli + tek arama · depo `components/category/CategoryFilters.tsx`
  - **ListToolbar** — sayı, sırala, grupla, görünüm · yeni ad
  - **Pagination** — sayfalama · depo `components/ui/Pagination.tsx`
- `components/urun/`
  - **Performance** — debi/basınç girişi, kademe hükmü, P-Q, hidrolik veri · yeni ad
  - **PqEgriNotu** — eğri kaynağı notu · depo `components/products/PqEgriNotu.tsx`

### S5 parça listesi · 23 Ekim (DESIGN-MENU ds-parca-listesi-2026-10-23)

Kaynak: `ds-cevap-2026-10-22.md` (23 Ekim eki) · `ds-parca-listesi-2026-10-23.md` · `foto-ve-kart-kurali-2026-10-23.md` · `veri/token.css` · görsel referans `Foto Dili Akis.dc.html` (1–5, 5b) ve `Urun Sayfasi Alternatifler.dc.html` (5a, 6a, 6a-2, 9a, 10a–e) · ölçü S5 (`ds-paketi-s5` 6c). Ad İngilizce, depo adı kazanır.

| # | Parça | Yer |
|---|---|---|
| 1 | **PhotoStage** | `components/foto/` |
| 2 | **PageCover** | `components/kapak/` |
| 3 | **SeriesHeader** | `components/kapak/` |
| 4 | **ProductCover** | `components/kapak/` |
| 5 | **FeatureSlot** (SoundCard, WidthCard dolumları) | `components/urun/` |
| 6 | **VariantPicker** | `components/urun/` |
| 7 | **MobileBuyBar** | `components/urun/` |
| 8 | **ProductCard** (güncellendi: foto · ad · seri · fiyat) | `components/liste/` |
| 9 | **SeriesCard** | `components/liste/` |
| 10 | **CategoryCard** | `components/liste/` |
| 11 | **ModelRow** (= ProductCard `yerlesim="liste"`) | `components/liste/` |
| 12 | **ListToolbar** (arama + Sütunlar eklendi) | `components/liste/` |
| 13 | **TabbedPanel** | `components/urun/` |
| 14 | **CompareTable** | `components/veri/` |
| 15 | **SectionRail** | `components/kabuk/` |
| 16 | **QuoteRequestButton**, **CompareButton** | `components/dugme/` |
| 17 | **SoundTable** | `components/urun/` |
| 18 | **DutyPointGate** | `components/urun/` |
| 19 | **FAQ** (satır: KatliCagriSatiri; S5 SSS biçimi, kartsız, 760, iş emri #11) | `components/icerik/` |
| 20 | **HeaderTeklifPaneli** | `components/kabuk/` |

**S5 ile doğrulanmadı** (ds-cevap madde 2, damga .d.ts'te): FamilyCard, Performance, PqEgriNotu. DS Kontrol'de S5 ile yan yana ölçülecek. KarsilastirmaTablosu yerine CompareTable kullanılır.

**23 Ekim kararları (DESIGN-MENU onayı):**
- ~~Çip ve kapak çipleri 44 px~~ → 23 Ekim basma alanı kuralı: 36 px görünür / 44 px basılır.
- Fiyat Onest, ₺ önde (kaynak ekranlarda Schibsted ve ₺ sonda; liste kuralı kazandı).
- QuoteRequestButton ikon boyunda: teklif çerçeveli petrol, sepet dolu kiremit (S5 6c-3 + Foto Dili 4). Etiket boyunda iki kipte de dolu kiremit (5a).
- ProductCover 5b düzeni (seçim ve fiyat sol sütunda, fiyat ilk ekranda), foto 400, mobil 300.
- Kapak fotoğrafı: kategori ve ürün kapağında sağda; seri ve seri şablonlu alt kategori kapağında solda. Mobilde fotoğraf üstte, kapak zemini yalnız fotoğrafın arkasında. SeriesHeader logosu h1 içinde, marka metni ekranda gizli.
- SectionRail: dolgu yok; etkin petrol 700 + 2 px petrol alt çizgi, öteki petrol 600 çizgisiz; mobil listede etkin satır solda 2 px çizgi + kalın.
- Fiyat: teklif kipinde hiçbir ekranda yok (K1a); satış kipinde yalnız katalog kaydında fiyatı olan modelde, fiyatsızda "Teklif iste" (iş emri #5). "örnek" etiketli fiyat yok.
- Kabuk (S5): header açık, iki şerit (logo · arama · Bilgi Merkezi · İletişim · Teklif/Sepet · Giriş · menü / ürün grubu şeridi); **alt bilgi petrol `--primary-navy` #0B4F6C** (S5'te öyle; kılavuz F'deki `--surface-dark` #10242E değil). Üst menü S5 kararıdır (ds-cevap-2026-10-23 madde 1): "Ürünler" kalemi yok; İletişim sayfa değil panel açar (K37-c). Alt bilgi bağlantıları S5 `fSutunlar` (madde 3).
- Mekân çipleri ikonsuz (madde 5; 22 Ekim ikon istisnası geri alındı). "ÖNERİ" etiketi yok (madde 6). SoundTable'da mekân çipi yok; mekân DutyPointGate'te.
- Teklif/sepet simgesi: kart ve satırda artılı, header ve mobil alt çubukta artısız (madde 4).
- Ses kademeleri: `icerik-kaynak-2026-10-16/lineo-quiet-veri-2026-10-15.json` (Vortice LINEO range, Mayıs 2026); kart değeri her kademede emiş, üfleme, gövde Lp'nin en yükseği (madde 7).
- Gradyan istisnası: fotoğraf sahnesi zemini (`--foto-sahne-zemin`) ve FeatureSlot çizgisi (foto-ve-kart-kurali, Alternatifler 10). Kılavuzdaki "gradyan yalnız ana sayfa sahnesinde" kuralına 23 Ekim istisnası.

Yeni tokenlar: `--pq-ton-1…4`, `--pq-soluk` (veri/token.css) · `--foto-sahne-zemin`, `--shadow-foto`, `--shadow-foto-kucuk` (foto-ve-kart-kurali §1). Yeni varlıklar: `assets/marka-logolari/` (8 marka logosu, DESIGN-MENU `brand/logos/`) · `assets/icons/ui/` (A9 arayüz ikon seti, DESIGN-MENU `brand/icons/ui/`).

### Metin kuralı · 24 Ekim (ds-kural-metin-2026-10-24)

- **Parça metin tutmaz.** Bugün kurulan parçalar (SeriesPicker, CutawayView, CatalogMode, ModelListesi + FiltreGruplari, FamilyHeader, MobileTree, FloatingNav, SearchBox, SeviyeEtiketi; PageCover yalnız SeviyeEtiketi'ne geçirir) arayüz sözcüklerini `metin` girdisinden alır: sözlük anahtarı → yazı (DESIGN-MENU `veri/sozluk.<dil>.json`). Eksik anahtar `⟦anahtar⟧` çizilir; TR'ye düşülmez (ne gösterileceği Recep kararı).
- **Anahtarlar:** sözlükte olanlar birebir (`t.kapat`, `t.temizle`, `t.ara-2`…); olmayanlar `ds.` önekiyle önerildi (`ds.seri-secin-n`, `ds.katalog-sayfa-n`…; `{n}` yer tutucu). Liste: `assets/ornek/arayuz.tr.json` / `.en.json` (EN'de null = eksik).
- **Kart örnek verisi ayrı:** `assets/ornek/lineo.tr.json` / `lineo.en.json` (kesit, motor tipi, seri özeti, SSS, katalog metni). Kartlar `assets/ornek/kart-metin.js` ile yükler; sağ üstte TR/EN.
- **İş emri #3 (eski parçalar):** ModelRow, Pagination, CompareTable (metin yoktu), DutyPointGate, Performance, SoundTable, TabbedPanel (metin yoktu, `dil` kalktı), FAQ (metin yoktu), KabukBandi, PageCover, SeriesCard, CategoryCard dönüştü; zincirde CompareButton, QuoteRequestButton, PqEgriNotu, FotoNoktalari da. Sayı biçimi `yerel` girdisiyle (varsayılan 'tr-TR'). SeriesCard ad kısaltmaz; kısa ad veriden (`kisaAd`). DUTY_MEKANLAR artık `{ id, anahtar, db }`.
- **Sözlük:** kartlar `assets/ornek/sozluk-s5.<dil>.json` okur (DESIGN-MENU veri/sozluk-s5, birebir). Sözlükte olmayan 51 yeni anahtar: `assets/ornek/yeni-anahtarlar-is-emri-3.tr.json` (yalnız TR önizlemede eklenir). Kart örnek yazıları: `assets/ornek/kart.<dil>.json` (`K()`); kart başlıkları (.e) tasarım notu, TR kalır.
- **İş emri #4:** sözlük ve Lineo EN yeniden kopyalandı (sozluk-s5: 51 öneriden 34'ü girdi; lineo.en.json 55 alan dolu). **Mekân uygunluğu iptal** (Recep 10-24): DutyPointGate yalnız debi + basınç; SoundTable'da sınır çizgisi, C sınıfı, uyan sayısı, onay yok, altta `ds.ses-deger-notu`; ModelRow'da "dB(A) altı" kalktı; DUTY_MEKANLAR kaldırıldı. Kalan parçalar dönüştü: ProductCover, SeriesHeader (`sessiz` veriden; parça addan çıkarmaz), ProductCard, MobileBuyBar, ListToolbar, CategoryFilters, HeaderTeklifPaneli, SectionRail; VariantPicker'da metin yoktu. **FamilyCard kullanım dışı** (yerini SeriesCard + FamilyHeader aldı; dönüştürülmedi). Yeni öneri anahtarları (11): `assets/ornek/yeni-anahtarlar-is-emri-4.tr.json`. Kart EN eksik listesi (87): `assets/ornek/kart-en-eksik-is-emri-4.tr.json`.
- **İş emri #4 madde 5 · CatalogMode yeniden:** sayfa PDF görünümüyle — yazısız zemin (`assets/ornek/katalog/lineo/z<no>.jpg`, 17 sayfa) + konumlu gerçek metin katmanı (cqw, seçilebilir) + tıklanır model adları (`onModel`). 595×842 korunur; masaüstü en çok 820, mobil ekran genişliğinde. Çerçeve (petrol zemin, üst çubuk, atlama) bizim dilde. Katman verisi `assets/ornek/lineo-katalog.<dil>.json` (İçerik projesi veri-sayfalari.js, yalnız okundu; boyut nedeniyle ayrı dosya, şemadaki `katalog.sayfalar[]`). EN katman yok → ⟦…⟧. Katalog yazısı Archivo (kart Google Fonts'tan yükler; parça yazı tipi yüklemez).
- **ds-cevap 10-24e:** sözlük yeniden kopyalandı (11 anahtar girdi; öneri dosyası kalktı). kart.en.json DESIGN-MENU dosyasıyla birleşti (87 alan). `grup.kontrol` → "Kontrol Cihazları ve Sürücüler"; `faq.s2/c2` (teslim, stok) kartlardan çıktı.
- **ds-cevap 10-24f (madde 1–3):** şema `{no, zemin, alt, katman[]}` geçerli. EN katmanı yokken Katalog modu çipi çizilmez; parça ⟦…⟧ göstermez. Mobil üst çubuk tek satır (61 px); atlama çipleri "Bölümler" panelinde. Madde 4–5 (Recep onaylı): "Bu sayfadaki modeller" çip listesi (36/44; masaüstü sayfa altı, mobil Bölümler paneli) — yeni anahtar `ds.bu-sayfadaki-modeller` önerildi (`assets/ornek/yeni-anahtarlar-10-24f.tr.json`); Archivo 400–700 yalnız Katalog modunda, parça yükler.
- **ds-cevap 10-24g:** Lineo EN katalog katmanı İçerik projesinden kopyalandı (`assets/ornek/lineo-katalog.en.json`, 17 sayfa, 4 846 öğe; konum/boy/model işareti TR ile birebir). EN'de Katalog modu çipi çiziliyor. Tıklanır model adı TR ve EN'de 182 (50 ayrı model; önceki raporda yazılan 145 yanlıştı). `ds.bu-sayfadaki-modeller` sözlükte henüz yok → EN'de ⟦…⟧.
- **ds-cevap 10-24h:** sözlük yeniden kopyalandı (`ds.bu-sayfadaki-modeller` TR/EN geldi; öneri dosyası kalktı). Kart yükleyicisi `templates/_kart/kart-metin.js`'e taşındı — `_ds_bundle.js`'e girmesin, sayfalarda TR/EN düğmesi çıkmasın; 24 kart yeni yoldan yükler. ModelRow masaüstü: ad üstte (en çok 2 satır), altında kod · motor · seri ayrı satır; ızgara `72 · minmax(170,2fr) · değerler minmax(72,1fr) · 150 · 96`. Alt satır tek satır: kod ve motor kesilmez, yalnız seri adı "…" ile biter; satırın title'ı tam metin (masaüstü + mobil). Paket doğrulandı: `_ds_bundle.js`'te kart yükleyicisi yok.
- **İş emri #5:** ModelListesi 24 model/sayfa. "örnek" fiyat yok (teklifte fiyat yok; satışta fiyatsız modelde "Teklif iste"). PhotoStage: `src` değişince zemin kararı hemen o görselin okunmuş değerine döner, karar yokken görsel gizli (120 ms ile belirir); okuma başarısızsa multiply. **Parça sayfa geneline kural yazmaz:** etiket seçicili kural yalnız kökün `[data-vh-…]` seçicisine bağlı (Kabuk şablonu `[data-vh-kabuk]`, MetinGirisi `[data-vh-metin-girisi]`); kart önizleme belgelerindeki `html/body/a` kuralları yalnız o önizleme sayfasına aittir. Yeni parça MetinGirisi.
- **İş emri #6:** AnaSayfaSahne (kaynak Ana Sayfa Sahne S5; ham renkler token, sahne tonları `--sahne-ton-1…13`; üst etiket Onest; dönme yalnız burada, üstüne gelince durur, hareketi azalt'ta dönmez). Şablonlar `templates/uygulama-alani/` (PageCover `seviye: 'uygulama-alani'` → "UYGULAMA ALANI", simgesiz; `enCokCip`) ve `templates/urunler/` (ürün haritası). **Konum kapakta çizilmez** (madde 4): PageCover, ProductCover, SeriesHeader `konum` yok sayar; konum yalnız SectionRail'de (bölümsüz şerit de olur: masaüstü konum, mobil "‹ geri"); bütün kapak kartlarında şerit kapağın üstünde. Öneri anahtarları `assets/ornek/yeni-anahtarlar-is-emri-6.<dil>.json`.
- **İş emri #7 (kısmi):** Kombin farkları 1–13 parçalarda: PageCover kutu (köşe 24, hairline, zemin foto-sahne, 28/28, multiply, solma yok, `ozet`, `sade`); SectionRail (10/8, yan 0, çizgisiz, el imleci, mobil satır kapakla aynı hizada); ModelListesi `mobilUst` 61; SeriesCard "Aç →" çerçeveli. Sözlük = sozluk-s5 + sozluk-ek. Kalan: kabuk, ürün sayfası 14–18, dört şablon (`surec/ds-cevap-2026-10-24l.md`).
- **Ürün adları yalnız katalogdan (Recep 10-24):** ürün grubu, ürün türü ve seri adı ile model sayısı `assets/veri/katalog-2026-10-04.json`'dan (`templates/_kart/katalog.js` → `window.VHKatalog`; TR `ad`, EN `en`). Sözlük yalnız arayüz sözcükleri; `kart.json`'dan `kat.*`, `grup.*`, `suzgec.*` kaldırıldı. Uygulama alanı şablonu `alan` prop'u (`assets/veri/uygulama-alani.json`, DESIGN-MENU) + katalog; sabit liste ve `konut.*`/`urunler.*` örnek dosyaları kalktı. Marka görünen adı katalogda olmadığı için kart-dili-veri'den.
- **Dil açık (Recep 10-24):** büyük harfe dönüşen her öğe `lang` taşır; parçalar `dil` ('TR' | 'EN', varsayılan TR) alır ve içerdikleri parçalara aktarır (PageCover → SeviyeEtiketi, ProductCover/SeriesHeader → PageCover, ModelListesi → FiltreGruplari, UygulamaBolumu → SeriesCard). Bütün önizleme kartları `dil={window.KART_DIL}` verir; şablonlar kendi dilini aktarır. #7 şablonları (ürün grubu, ürün türü, seri, ürün) da aynı kuralla kurulacak.

### DESIGN-MENU iş emri #2 · 24 Ekim (ürün ailesi sayfası)

Kaynak: `ds-is-emri-2026-10-24-2.md` · `sayfa-sablonu-aile-2026-10-24.md` (13 blok) · `kart-dili-kararlar-2026-10-24.md`.
- **Yeni (components/aile):** SeriesPicker (seri seçimi, ✓, 36/44), CutawayView (kesit + numaralı işaret + liste; kapalı önizleme, tam ekran), CatalogMode (katalog kipi: ‹ s. n / N ›, atlama, katalog tablosu, Siteye dön; koyu zemin yalnız burada).
- **Kart:** `aile-sayfasi.card.html` — Lineo ailesi (Lineo · Lineo Quiet · Lineo Quiet ES; Lineo ES veride yok, çizilmez) mevcut parçalarla 1240 + 390, teklif + satış.
- **ModelRow mobil (ds-cevap 10-24c):** satır içi yatay kaydırma kalktı; değer bütün olarak alt satıra geçer, en çok 2 satır.
- **Örnek görsel:** `assets/ornek/lineo-quiet-yapi-kesit.png` (DESIGN-MENU gorsel/, birebir).
- **ds-cevap 10-24d:** İçerik projesi 7ac1dcef-7a24-4fe9-80f5-e90d50ebbf98 (`lineo-sayfa/icerik.js`, yalnız okundu): kesit 01–06 (KESIT), seri özeti + "ne zaman uygun değil" (SERILER), SSS, katalog atlamaları (Lineo 28/30 · Quiet 18/21 · Quiet ES 12/15) karta aynı bilgiyle, kaynak sayfasıyla. **FeatureSlot görsel varyantı** (`gorseller`, `baslik`, `atif`): blok 5 motor tipi (AC kırmızı / EC yeşil halka). Görseller `assets/ornek/lineo-quiet-ac.png`, `lineo-quiet-es-ec.png` (İçerik projesi img_p9_2, img_p9_8). Aksesuar: kaynakta yalnız metin ve konumlu ham tablo (s.37), kod/görsel yok → blok 11 çizilmedi (K7).

### DESIGN-MENU iş emri · 24 Ekim (kart dili dondu)

Kaynak: `ds-is-emri-2026-10-24.md` · tek kaynak `kart-dili-kararlar-2026-10-24.md` · görsel `Kart Dili Akis v2.dc.html` 3a.
- **CategoryCard:** sade — fotoğraf · ad → · "n model". Nokta, fotoğraf geçişi, marka, seri satırı kalktı (A+ iptal). Ad en az 2 satır yer tutar.
- **SeriesCard:** marka · kısa seri adı · "n model" · "Aç →" (petrol, 36/44; simge seri ya da ürün ailesi). Ailedeki seri aile sayfasını o seri seçili açar (href).
- **ModelRow:** masaüstü sütunları sabit (`MODEL_SATIR_SUTUN`: 72 · 1.5fr · değerler · fiyat 150 · eylem 96); satış kipinde "+ KDV %20" fiyatın altında, fiyatsızda "Fiyat için teklif isteyin".
- **Pagination:** `kisa` (mobil "‹ Sayfa 2 / 4 ›").
- **Yeni ModelListesi + FiltreGruplari:** 4c, filtre solda 240, 12 model/sayfa; mobil seri çip şeridi + alttan "Filtrele" paneli, liste altında 150 px.
- **PageCover:** `seviye` (simge + ÜRÜN GRUBU · ÜRÜN TÜRÜ · ÜRÜN AİLESİ · SERİ · MODEL, markalı), `cipBaslik`; 'urunler'de simge h1'de.
- **Yeni:** FamilyHeader, MobileTree, FloatingNav, SearchBox (components/gezinti), HiyerarsiSimgesi + SeviyeEtiketi (components/hiyerarsi).
- **Simgeler:** `venthub-ui-urun-grubu/urun-turu/urun-ailesi/seri/model-22.svg` DESIGN-MENU `brand/icons/ui`'dan `assets/icons/ui`'ya birebir; DESIGN-MARKA setine eklenecek.
- **Sözcük:** CategoryFilters arama sonucunda "Alt kategori" → "Ürün türü".
- **Örnek veri:** `assets/veri/kart-dili-modeller-2026-10-23.json` (DESIGN-MENU veri dosyası, birebir; yalnız kart önizlemesi).
- **Mobil kapak fotoğrafı (ds-cevap 10-24 madde 1):** iki parça, iki boy. **PageCover** (Ürünler, ürün grubu, ürün türü, ürün ailesi kapağı) mobilde **220 px** (3a). **ProductCover** (model sayfası) mobilde **300 px** (10-23 kararı yalnız bu parça için).
- **SearchBox sonuç satırı:** görünen 52 px (box-sizing eksikti, 60 çıkıyordu).
- **Hiyerarşi simgeleri:** DESIGN-MARKA kendi setine ekleyince oradan yeniden kopyalanacak.
- **ModelRow mobil (ds-cevap 10-24b):** satış kipinde fiyatlı satır iki katlı kalır (kopya-secimi madde 25), teklif kipinde tek kat. Foto 64×56; ad en çok 2 satır; kod · motor · seri tek satır; değerler 13 px, her değer bütün; sığmayan değer bütün olarak alt satıra geçer, en çok 2 satır; satır içi yatay kaydırma yok (ds-cevap 10-24c).
- Lineo aile sayfası ayrı iş emriyle gelecek; o gelene kadar yeni parça kurulmaz.

### DESIGN-MENU düzeltmeleri · 23 Ekim (ikinci tur)

Kaynak: `ds-cevap-2026-10-23.md` (madde 1 düzeltildi) · `ds-duzeltme-productcover-2026-10-23.md` · `ds-duzeltme-denetim-2026-10-23.md` · `ds-parca-listesi-2026-10-23.md` (basma alanı kuralı).
- **KabukBandi:** varsayılan header tek bant — logo · arama · İletişim (simge) · Teklif/Sepet (simge + yazı, sayaçlı) · Hesap (simge) · Menü (simge). Bilgi Merkezi ve "Ürünler" header'da yok. `ikiKat` seçeneği (varsayılan değil): ≥1180 px'te Bilgi Merkezi + yazılı İletişim/Giriş yap + ürün grubu şeridi. Simgeler `assets/icons/ui` çizimleri; menü S5 satır içi çizimi.
- **FeatureSlot / ProductCover:** ses değeri kutusuz, kapak zemininde; "27,4" bitişik (Schibsted 800 56, −0.02em, tabular yok); birim iki satır (kalın dB(A), altında açıklama, kırılmaz); ölçekte mekân yazısı ve sınır çizgisi yok; `sinir` ve `seri` props kaldırıldı.
- **Önizleme kartları:** "Fiyatlar örnek…" notu 16 karttan kalktı; urun-kapak ve yuva kartlarında yatak odası sınırı kalktı.
- **SectionRail:** konum satırı tam ve tek satır; sekmeler kalan genişliği ölçerek sığar, kalanlar "Diğer (n) ⌄".
- **HeaderTeklifPaneli:** adet düğmeleri 44×44, "Listeden çıkar" 44 px.
- **PhotoStage:** `urun` 400 (mobil 300); mobilde kapak boylarında fotoğraf alanı köşesi 16.
- **DutyPointGate:** mekân çipleri ikonsuz (ikon parametresi kaldırıldı).
- **Basma alanı kuralı (Recep 10-23):** görünen boy S5'teki gibi, basılan alan görünmez payla 44 px. Çip (Cip, PageCover, VariantPicker, DutyPointGate) 36 görünür / 44 basılır; SoundTable satırı 34 / 44. 22 Ekim'deki "çipler 44 px" kararı geri alındı.
- **ds-cevap 10-23b:** sayfa noktaları = fotoğraf noktaları → yeni `foto/FotoNoktalari.jsx` (6 px, seçili 18 px; düğme 22×32, basma 44; kendiliğinden dönmez, 280 ms geçiş); PageCover `gezinti`, CategoryCard `kategori.seriler`. Debi sütunu = süzgeç dağılım çubukları → CategoryFilters `grup.dagilim` (en az 3 px, üstte 44 px şeffaf pay). Pagination ve Performance değişmedi. Menü simgesi S5 çizimi (18 px, 1.6); DESIGN-MARKA `venthub-ui-menu-22.svg` ekleyecek.

**Yeni parça ekleme yolu:** DESIGN-MENU `parca/<Ad>.dc.html` okunur → `components/<grup>/<Ad>.jsx` + `.d.ts` + `.prompt.md` aynı adla yazılır; `window.VH` okumaları props'a çevrilir, stil satırları aynen kalır; grubun kartına örnek eklenir; bu listeye satır girer. Değerler `veri/token.css` = `tokens/`.

**Kaynaktan bilinçli sapmalar (kontrast ve opaklık kuralı):** CategoryFilters'ta sonucu kalmayan çip ve Pagination'da sınırdaki ok düğmesi kaynakta `opacity` 0.45 / 0.4 ile soluyordu; DS'te `--surface-inset` / `--border-hairline` + `--text-muted` ile çizildi.

**Karar 21 Ekim:** FamilyCard'daki model sayısı rozeti fotoğrafın üstünde kalır — kılavuz G'nin "fotoğrafa rozet bindirilmez" kuralına **tek istisna**. Hüküm kutusu sol kuralı her yerde 4 px.

**Token (karar 21 Ekim):** `--weight-baslik` 600 (S5); h1/h2 için `--weight-h1` 800. `brand/tokens.css` de 600 (22 Ekim). S5'in öteki ek adları (`--hedef-min`, `--size-h3`, `--weight-govde`, `--lh-editorial`, `--hareket-egri-gecis`) eklendi.

**Karar 21 Ekim ile eklenen:** Rozet bileşeni (emirdeki on bir bileşenin dışında, kullanıcı kararı).

---

## CONTENT FUNDAMENTALS (içerik)

- **Dil Türkçe.** Hitap "siz" ve ikinci çoğul çekim: *"Girdiğiniz değerlerle bu model mahalinizi karşılıyor."* · *"Kanal uzadıkça bu payı tüketirsiniz."* Biz ağzı az ve ölçülü.
- **Ton:** mühendis gibi sakin, gerekçeli, satış baskısı yok. Hüküm suçlamaz, gerekçe verir: *"Bu devirde yetmez, devri %77'ye çıkarın."* Verisi olmayanda: *"Değerlendirilemedi · bu model için mühendisimize sorun."*
- **Ürün metni (K63):** özellik → fayda → dayanak. Üretici beyanı atıfla. Bizim ağzımızdan "en / tek / lider" yok. En az bir sakındırma satırı. Uydurma sayı yok.
- **Yalnız dolu alan (K7):** "belirtilmemiş", tire, "yakında" yazılmaz; boş blok çizilmez. Bileşenler bunu kendisi uygular.
- **kWh/ay kutusu (K65):** süre kullanıcıdan alınır; sonuç "girdiğiniz değerlerle" diye kurulur; ₺ yazılmaz.
- **Fiiller:** teklif kipinde "Teklif iste", satış kipinde "Sepete ekle", panel fiili "Ödemeye geç". **"Teklif al" yazılmaz.** Öteki: "Teklif listesine ekle", "Karşılaştır", "Teknik belgeyi indir".
- **Büyük harf** yalnız etiket ve rozete aittir; marka ve ürün adı büyük harfe çevrilmez (AVenS, SEAT veriden gelir). Büyük harf dönüşümü olan her öğede `lang="tr"` zorunlu (yoksa "i" → "I").
- **Wordmark** her zaman **VentHub**; VENTHUB ve venthub yazılmaz.
- **Teknik değer:** birim boşlukla, ara nokta ile dizilir: *175 m³/h · 34 Pa · 25 dB(A)*. Binlik ayıracı boşluk: *2 400 m³/h*.
- **Emoji yok.** ✓ işareti yalnız seçili çipte ve hüküm metninde.

## VISUAL FOUNDATIONS (görsel temel)

**Renk (B).** Arayüzde tek petrol #0B4F6C: yapı, bağlantı, seçili hâl, sayaç ve rozet zemini. `--primary-navy`, `--brand-cyan`, `--brand-cyan-ink` üç eski ad, değer aynı. Kiremit üç yerde: logo üst dilimi (#D95D0E, dosyada), sayfanın tek dolu ana eylem düğmesi (#BF5309), P-Q çalışma noktası (#D95D0E). Kiremit metin rengi değildir; rozet ve etikette yoktur (tek istisna: hüküm kutusunda YETMEZ etiketi #BF5309, kılavuz G). Amber #F59E0B yalnız uyarı kutusunun kuralı; yeşil #3D7A1E yalnız Hava Arıtma sayfaları. Dördüncü arayüz rengi üretilmez. Logodaki lacivert #1A2B4A ve turkuaz #0088B0 dosyanın içinde kalır.

**Yüzey.** Sayfa #F2F7F9, kart ve header beyaz, kart içi ikincil bölge ve fotoğraf kutusu #F7FAFB, gömülü alan #EAF1F4, çip/rozet zemini #DDEBF1. Alt bilgi petrol `--primary-navy` (S5); `--surface-dark-inset` #155F7F petrol bantta ve tam ekran menüde gömülü alan. `--surface-dark` kaldırıldı.

**Metin.** Her zaman tam opak; soluk hâl ayrı tokendır, alfa değil. strong #10242E (15.98) · body #2F4652 (9.91) · muted #526772 (beyazda 5.93, sayfada 5.49). Koyu bantta beyaz ve #BFE0EC (11.48). 4.5'in altında metin yok.

**Kenar.** Dört kademe, beyaz üstünde: control #B8CDD6 (düğme, giriş) › hairline #D6E3E9 (kart) › row #E3EDF1 (satır) › inset #EAF1F4.

**Yazı (C).** Başlık Schibsted Grotesk; h1/h2 `--weight-h1` 800, −0.02…−0.03em (h1 56/1.02, h2 34); h3 ve kart başlıkları `--weight-baslik` 600. Arayüz, uzun metin ve teknik değer Onest; teknik değer `tabular-nums`, ayrı mono aile yok. Boylar: overline 12.5 (600 · 0.08em · büyük harf) · caption 14 · body-small 15 · body 16 · editorial 17 (satır 1.6, ölçü 66ch). Archivo yalnız 700 ağırlıkta, yalnız logo kilidinin `<text>`'i için yüklenir. **İstisna (Recep 10-24):** Katalog modunda katalog sayfasının metin katmanı Archivo 400–700; yazı tipi yalnız bu kip açılınca CatalogMode tarafından yüklenir.

**Biçim (D).** Köşe: düğme, çip, rozet, arama kutusu oval (999 px) · kart 16 · yüzen panel, yan panel, sahne, büyük blok 24 · giriş ve fotoğraf kutusu 12 · mobil alt panel üst köşe 8. Gölge yalnız dört yerde: `--shadow-ince` (seçili düğme/çip) · `--shadow-kart-hover` (kart üstüne gelince) · `--shadow-overlay` (açılır katman, yan panel, menü) · `--shadow-urun-gorsel` (filter, yalnız ürün fotoğrafı). Başka yerde derinlik yüzey tonu + 1 px kenarla kurulur.

**Gradyan, bulanıklık, saydamlık.** Arayüz yüzeyinde gradyan ve bulanıklık yasak; istisna yalnız ana sayfa sahnesinin derinlik zemini ve örtü perdesinin bulanıklığı. Opaklık durum anlatmaz; yalnız belirme/kaybolma geçişinde ve görsel katmanda (sahne, perde). Gölgedeki alfa serbest. Sahnedeki dört petrol tonu (#2F7F9F · #7FB0C6 · #08384D · #C5D6DE) henüz token değil, yalnız sahnede.

**Hareket (E).** İki sınıf. Arayüz tepkisi 120–280 ms: `--hareket-hizli` 120 (üstüne gelme, düğme) · `--hareket-normal` 200 · `--hareket-acilis` 280 (açılır bölüm, grid-template-rows) · eğri cubic-bezier(0.2, 0, 0, 1). Geçiş 500–800 ms: `--hareket-gecis` 600 · cubic-bezier(0.2, 0.9, 0.25, 1) — sayfa geçişi, ana sayfa sahnesi, teklif uçuşu. Hareket iş görür; kendi kendine tekrarlayan hareket yalnız ana sayfa sahnesinde. Hareketi azalt açıkken bütün süreler 0. Kartta fotoğraf değişimi ve 2 px kalkma serbest, ölçek yok.

**Üstüne gelme / basma.** Ana eylem: `--shadow-ince`, renk değişmez. Çerçeveli düğme: dolu petrol + beyaz etiket (S5 ikon düğmeleriyle aynı). Katlı satır: başlık petrole döner. Kart: `--shadow-kart-hover` + 2 px kalkma. Çip: seçili hâl dolu petrol + ✓ + ince gölge. Küçülme (scale) ve opaklık oyunu yok.

**Kabuk (F · S5 23 Ekim).** Header beyaz, altında 1 px hairline, logo `-tamrenk`, arama kutusu, Teklif/Sepet sayacı çerçeveli petrol; altında ürün grubu şeridi. Alt bilgi petrol `--primary-navy` (S5); logo `-tamrenk-koyu`, ikonlar `-koyu`. DESIGN-MARKA'ya not gitti (ds-cevap-2026-10-23): kılavuz F zemin petrol, yazı `--text-on-dark` / `--text-on-dark-muted`; #10242E koyu bant kaldırıldı. `--surface-dark` DS tokenlarından kaldırıldı (S5'te hiç kullanılmıyor); `--surface-dark-inset` #155F7F kalır (S5'te 20 yerde: ürün sayfası, tam ekran menü, makale, bildirim). `brand/tokens.css` kopyasında `--surface-dark` marka güncelleyene kadar duruyor. İçerik sütunu 1060 px; sayfa oluğu 40 px masaüstü, 18 px mobil. Etkileşimli her öğe en az 44 px. Menü kalemleri, sekmeler ve yerleşim DESIGN-MENU'nündür.

**Desenler (G).** Ürün kartı: fotoğraf kutusu 12 px, `--surface-subtle`, kenarsız; görselde `--shadow-urun-gorsel`. Fotoğraf yoksa kutu kalkar, kart 2 px petrol üst kuralla başlar. Fotoğrafa rozet ya da yazı bindirilmez. Rozet tıklanmaz, oval, üç sınıf: nesnel (p2-tint + body) · hüküm (petrol + beyaz) · soluk (inset + muted). Hüküm kutusu 4 px sol kural + etiket. İstisna: FamilyCard model sayısı rozeti fotoğrafın üstünde durur. Mobil alt çubuk: seçili `--text-strong` + 2 px petrol üst kural; seçilmemiş `--text-muted`. P-Q eğrisi: ana eğri 2 px petrol, ızgara row, eksen control, çalışma noktası kiremit; çizim animasyonu, gölge, yuvarlatılmış uç yok.

**Görsel dünya.** Ürün fotoğrafı beyaz fonlu, kutuda ortalı; filtre, gri ton, ölçek oyunu yok. Elle çizilmiş illüstrasyon, doku ya da desen yok. Bu kurulumda fotoğraf varlığı verilmedi.

**Boşluk (K37).** tight 5 · inline 7 · grid 10 · stack 14 · card 16 · page-mobile 18 · card-loose 20 · block 30 · page 40. Yuvarlama yok; tek sayılar bilinçli.

## ICONOGRAPHY (ikonlar)

- **Marka seti:** `assets/icons/` — 16 ikon (7 kategori + 9 senaryo) × 64/48/24 px × `tamrenk` / `lacivert` (tek renk) / `koyu` (koyu zemin) = 144 SVG. Ad: `venthub-[kat|sen]-[ad]-[px]-[surum].svg`. Dolu, iki renkli dil; ikonun lacivert ve turkuazı dosyanın içindedir, petrole çevrilmez.
- Koyu alt bilgide `-koyu` sürüm. Kiremit ikonlarda yok. Alt dallar için ikon çizilmez. Hava ok işaretiyle değil dilim/jet ritmiyle anlatılır.
- **Arayüz ikonları** (tek çizgi, currentColor, 1.5 stroke) DESIGN-MENU'nün A9 setidir; 23 Ekim'de `assets/icons/ui/`'a kopyalandı (durum: Recep onayı bekler). Kart teklif/sepet simgeleri `kart-teklif-22.svg`, `kart-sepet-22.svg`; QuoteRequestButton bunların çizimini taşır. Bu sistemde yer alan arayüz işaretleri yalnız Unicode: ✓ (seçili çip), ▾ (katlı satır), − / + (adet).
- **Emoji kullanılmaz.**
- **Logo:** `assets/logo/` — işaret (9 sürüm), yatay ve dikey kilit (7'şer), favicon (4), avatar (2), paylaşım görseli. Logo elle çizilmez, CSS ile dilim yapılmaz; sönük hâl `-soluk` dosyasından gelir. Koruma alanı işaret yüksekliğinin yarısı; en küçük ekranda 16 px işaret, 96 px kilit.

## Fontlar

Google Fonts'tan yüklenir (`tokens/fontlar.css`): Onest 400–800, Schibsted Grotesk 400–800, Archivo 700 (logo). Katalog modunda CatalogMode ayrıca Archivo 400–700 (genişlik 75–100) yükler. Yerel font dosyası yok.
