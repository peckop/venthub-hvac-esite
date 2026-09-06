
# VentHub — Design karar kaydı (15A projesi)

> **Yeni sohbete başlıyorsan önce `DEVIR.md` oku** — durum, açık iş listesi, tekrar eden hatalarım
> ve ilk hamle orada. Bu dosya kararların tam kaydıdır (uzun), `DEVIR.md` "şu an neredeyiz"dir.

Kaynaklar: `venthub-canli-durum.md` (kapalı kararlar, Claude Code yazar — Design değiştirmez) ·
`ana-sayfa-brief.md` · marka kılavuzu projesi "Venthub e-ticaret logo tasarımı"
(670f9f75-9e90-499e-a6fe-a98139bb457a) · depo `peckop/venthub-hvac-esite` (bkz. `github.md`).

Kural: her madde "Recep kararı" veya "Design eklemesi" diye ayrılır. Design eklemesi, Recep evet
demeden karar sayılmaz ve canlı durum dosyasına girmez.

## Dosyalar
**Adlandırma kuralı (Recep, 2026-09-05):** arşiv dosyalarında "ARSIV" adın BAŞINDA durur
(`ARSIV Menu Tasarimi v14.dc.html`). Sebep: sayfa listesi uzun adı kısaltınca sondaki etiket ilk kayboluyordu,
hangisinin güncel olduğu anlaşılmıyordu. Önekli olan arşiv, önek yoksa güncel. Türkçe karakterli ad yalnız
GÜNCEL dosyalarda; arşivler ASCII (araç kısıtı).

| Dosya | İçerik |
|---|---|
| `Menü Tasarımı v15.dc.html` | ARŞİVE ALINDI (`ARSIV Menu Tasarimi v15`). Yirmi dokuz kare; Kabuk v2'nin kaynak seti. |
| `Venthub Ana Sayfa v9.dc.html` | ARŞİVE ALINDI (`ARSIV Venthub Ana Sayfa v9`). |
| `Menü Tasarımı v17.dc.html` | GÜNCEL, **TEK DOSYA** (emir #6). **30 kare**: 27 ekran + ana sayfa (`02-ana`) + mobil kabuk M1–M9 + satış kipi S1–S6 (v15'in 26'sı + B4), Kabuk v2 tamamıyla uygulanmış. 55 header + 2 footer bandının hepsi DS `KabukBandi` mount'u, 26 `CerceveliDugme`, ham `#1a2b4a` 0, çözülmeyen token 0. K19 İletişim alt paneli üç niyet grubuyla. Ayrıntı `kabuk-v2-notlar.md`. |
| `Venthub Ana Sayfa v11.dc.html` | GÜNCEL. v17 ile birebir aynı kabuk (ölçüm tablosu notlarda). |
| `ARSIV Menu Tasarimi v16.dc.html` · `ARSIV Venthub Ana Sayfa v10.dc.html` | Kabuk v2'nin 9 kareli ilk hâli; Recep "yetmedi" dedi, kapsam 27 kareye çıktı. |
| `Ürün Seçimi Alternatifleri v3.dc.html` | GÜNCEL. Madde 69/69b/70 + **72–76 düzeltmeleri**: örnek açık ofis (90 m² × 3,2 m × 6/sa = 1.728 m³/h), ürün **Vortice Lineo 250 Quiet ES** (VRT-17175) — bütün sayılar `technical_specs`'ten, eğrisi olan aile; dördüncü hüküm “değerlendirilemedi”; footer marka logoları kalktı. Ayrıntı `v3-notlar.md`. |
| `ARSIV Urun Secimi Alternatifleri v2.dc.html` · `ARSIV Urun Secimi Alternatifleri v1.dc.html` | v2: SEAT/laboratuvar örneği, uydurma sayılar (GB8 m.73 ile düştü). v1: kabuk sıfırdan yazılmış, Recep reddetti. Arşiv. |
| `Ürün Seçici Karşılaştırma.dc.html` | **Yeni.** Kalıcı karar takip sayfası: A/B/C fark cetveli (11 ölçüt), üçünde ortak olanlar, Design görüşü, tarihli karar kaydı. Akıcı genişlik (mockup değil, okunan sayfa). Yeni karar geldikçe satır eklenir. |
| `Urun Sayfasi v2 Hikaye.dc.html` + `urun-sayfasi-v2-notlar.md` | **Yeni (madde 81 · K20).** Aile PDP hikâye akışı: ilk ekran 07c kalıbıyla aynı, altında altı bölüm altı ayrı aile (pin · reveal · sayı bloğu · katmanlı kesit = imza hareketi · veri grafiği · tablo). Örnek aile Vortice Lineo Quiet, 12 model, bütün sayılar `technical_specs`'ten. Mobil 390 ayrı kompozisyon, `hareket` anahtarı reduced-motion. Kontrol ve Belge bölümleri K7 gereği çizilmedi. Çizildi, yayına girmez (REC-146). |
| `brand/logo/` | **Yeni (K23).** Marka projesinden yedi logo SVG'si: işaret tamrenk / tamrenk-koyu / beyaz / lacivert + yatay kilit ×2 + README. Logo bundan sonra elle çizilmez. |
| `tasarim-sozlesmesi-v1.json` + `tasarim-sozlesmesi-notlar.md` | **Yeni (madde 80).** v15 + v9'dan ÖLÇÜLEN tasarım DNA'sı: 3 marka rengi + 15 nötr + 4 semantik, 8 tipografi kademesi, 22 boşluk değeri, yarıçap 0 (8px panel istisnası), gölge yok, 17 efekt kategorisi false. 27 alan null (hareket, breakpoint, hover) — ölçülemedi, uydurulmadı. Kural 8: tokens.js'i besler, yerine geçmez. |
| `systemair-olcum-raporu.md` | **Yeni.** OPS'un 7 maddelik ölçüm isteği (Linear 09-05): 40 aile, kategori başına `technical_specs` doluluk, açıklama uzunlukları, belge tablosu yokluğu, seri sayfası kodu, kategori rehber alanları. |
| `bosluk-listesi-v2.md` | **Yeni.** 47 yol × beş hâl (ÇİZİLDİ / ŞABLONLA KAPANIR / SATIŞ KİPİ / FAZ 4 / GERÇEKTEN YOK), iki kip çerçevesiyle. Bağımsız sayım OPS'la tutuyor (47). |
| `zorunlu-icerik-haritasi.md` | Madde 70: AFS kalemleri → VentHub'da yer (footer / Hesap / İletişim / ekran 14 / Bilgi Merkezi / YOK-K1 / hiç yok). |
| `v15-notlar.md` · `sogukgiris-oneriler.md` · `mobil-kisayol-oneriler.md` | Geri bildirim 6 durum; madde 67 ve 68 yazılı çıktıları. |
| `ARSIV Menu Tasarimi v14.dc.html` · `ARSIV Venthub Ana Sayfa v8.dc.html` · `ARSIV Menu Tasarimi v13.dc.html` · `ARSIV Venthub Ana Sayfa v7.dc.html` · `ARSIV Menu Tasarimi v12.dc.html` · `ARSIV Menu Tasarimi v11.dc.html` · `ARSIV Menu Tasarimi v10.dc.html` · `ARSIV Menu Tasarimi v9.dc.html` · `ARSIV Venthub Ana Sayfa v6.dc.html` · `ARSIV Menu Tasarimi v8.dc.html` · `ARSIV Menu Tasarimi v7.dc.html` · `ARSIV Venthub Ana Sayfa v5.dc.html` · `ARSIV Menu Tasarimi v6.dc.html` · `ARSIV Menu Tasarimi v5.dc.html` · `ARSIV Venthub Ana Sayfa v4.dc.html` · `ARSIV Menu Tasarimi v4.dc.html` · `ARSIV Venthub Ana Sayfa v3.dc.html` · `ARSIV Menu Tasarimi v3.dc.html` · `ARSIV Venthub Ana Sayfa v2.dc.html` · `ARSIV Menu Tasarimi v2.dc.html` · `ARSIV Venthub Ana Sayfa v1.dc.html` · `ARSIV Menu Tasarimi v1 Broadsheet.dc.html` | Arşiv; üzerine yazma yasağı gereği duruyor (canlı durum §6). |
| `referans-canli-urun-sayfasi-v11.html` | OPS'un gönderdiği referans: canlı ürün sayfası v11. Sonraki turun kaynağı; v2 yerleşimi ve özellik envanteri buradan birebir alınacak. |
| `design_handoff_venthub_menu/README.md` | Bilgi mimarisi spesifikasyonu: taksonomi, iki dilli slug tablosu, geçiş tablosu, faset envanteri. Görsel dil bölümleri (§8 Design Tokens, §9 ikon) artık marka kılavuzuna tabidir. |
| `brand/icons/` | Marka projesinden kopyalanan 16 ikon, 48 px tamrenk. |

## Dil — marka kılavuzundan aynen alındı
- Kabuk koyu lacivert `#1A2B4A` header (74 px) + footer, gövde aydınlık `#f4f4f2`.
- Kart `#ffffff`, kenar `#e2e2de`, ince kural `#eeeeea`, ikincil zemin `#fbfbf9`.
- Metin `#1a2b4a`, ikincil `#4a5568`, soluk `#8a8f94`, yer tutucu `#b9bcc0`.
- Turkuaz `#0088B0`: bölüm etiketi, bağlantı, aktif sekme alt çizgisi, teklif listesi sayacı, bağlam çipi.
- Kiremit `#D95D0E`: yalnız birincil eylem. Amber ve yeşil kullanılmadı (arayüz uyarısı ve Hava Arıtma yok).
- Archivo: arayüzün tamamı. Source Serif 4: yalnız açıklama paragrafları. IBM Plex Mono: model kodu,
  teknik değer, etiket, ölçü, URL, yer tutucu.
- Köşe yarıçapı yok (logo dairesi hariç). Gölge yok.
- Logo işareti 14A-3 CSS ile çizildi (4 dilim, `clip-path`); koyu zeminde dilimler kiremit/beyaz/beyaz/turkuaz.
  Üretimde `brand/` paketindeki SVG kullanılacak.

## Recep kararlarının tasarıma yansıması
- Fiyat, indirim, KDV, toplam, stok, sepet, ödeme, bayi: hiçbir ekranda yok.
- Ürün başına iki eylem: "Teklif listesine ekle" (birincil) + "Teklif iste" (ikincil).
- Teklif Listesi sepet değil: toplam/tutar/kargo yazmıyor; adet ve satır notu var.
- 3D yok: thumbnail, sahne, "yakında" hiçbir yerde yok. Depodaki `Category3DIcon` /
  `ProductModelRenderer` vitrinde kullanılmayacak.
- Kategori adresleri kısa slug, `/category/` yok: `/tr/fanlar/korozyon-dayanimli`.
- Ürün adresleri değişmiyor: `/tr/products/<seri>`. Ekran 07 seri sayfası + model seçici olarak çizildi;
  model seçimi teknik tabloyu değiştirir, adresi değiştirmez.
- Boş dal görünmez: Plug Fanlar ve Hücreli Aspiratörler menüde ve kategori sayfasında yok.
  Fanlar "6 dal" değil "4 dal görünür" olarak yazıldı.
- Teknik tablo yalnız dolu alanı satır yapar; "belirtilmemiş" ve tire yok. Tablo 3 satırla da 12 satırla da durur.
- Ekranlar şablon olarak çizildi: kategori şablonu ×7, dal şablonu ×26, liste, seri, senaryo, teklif listesi.
  Sayfa başına özel görünüm çizilmedi.
- İkon yalnız kategori ve senaryoda. Dal seviyesinde ikon yok; ayırt ediciliği öncü ürün fotoğrafı sağlar.

## Geri bildirim 1 uygulandı (2026-09-03, `geri-bildirim-1.md`)
On bir madde aynen uygulandı; dosyalar v3 / v2 olarak ayrı yazıldı, eskiler arşivde.

1. **Kart içi eylem çerçeveli.** Kartlarda “Teklif listesine ekle” = beyaz zemin + 1 px lacivert kenar + lacivert yazı. Lacivert dolu buton hiçbir yerde yok.
2. **Senaryo listesi 8.** Atıksu Arıtma menüden, senaryo listesinden ve ekran 03'ten çıktı; “İKON ONAY BEKLER” etiketi kalktı. Hava Arıtma yok. Çizilen Atıksu ikonu arşivde.
3. **Üst şerit tek kat:** Ürünler ▾ · Hesaplayıcılar · Bilgi Merkezi · İletişim · arama · TR/EN · Teklif Listesi · Teklif İste. Markalar footer “Kurumsal”da.
4. **Sekizinci kutu “Tüm ürün ağacı”** ana sayfada duruyor.
5. **Kiremit kuralı.** Sayfa başına tek dolu kiremit, o da sayfanın ana işi: ana sayfa → hero “Teklif al”; ürün → “Teklif listesine ekle”; teklif listesi → “Teklif talebini gönder”; senaryo → “Teknik destek iste”; kategori / dal / liste / arama → dolu kiremit yok. Header “Teklif İste” her ekranda beyaz konturlu; teklif listesi ekranında hiç yok. Arama sonucundaki “Tam kod eşleşmesi” etiketi kiremitten turkuaz tona döndü (kiremit üstüne küçük metin konmaz).
6. **Hero fotoğrafı.** Gerçek beyaz fonlu ürün fotoğrafı erişilemedi: depodaki `public/images/products/*` dosyaları ortam/render görselleri (gri stüdyo fonu, laboratuvar sahnesi), 867 izole görsel Supabase storage'da. Yedek yol uygulandı: nötr fan silueti + “[SEAT 30 fotoğrafı — Faz 1'de gerçek görsel]”. Hero B silindi, A kaldı.
7. **Marka logoları** `brand/logos/` altından gerçek dosyalarla: vortice.png · seat.png · avens.svg · nicotra-gebhardt.webp · danfoss.svg. Beyaz kutu, yükseklik 40 px (mobil 34), gri-ton yok, koyu zemine konmadı.
8. **Kategori kartı ikonu** masaüstü 64 px / mobil 48 px; başlık 17 px / 600; “N dal” 13 px soluk.
9. **IBM Plex Mono** yalnız model kodu, teknik değer, bölüm etiketi ve URL'de. Köşeli parantezli yer tutucular ve ürün/dal sayıları Archivo'ya döndü.
10. **Ekran 6–7 v1 kurgusu.** Filtreli liste model kartı gösterir (SEAT 30 / SEAT 35 / STORM 40 / JET 25 / SEAT 40 / JET 22; debi, basınç, güç, faz), seri kartı değil; seri artık sol sütunda faset. Ürün sayfası tek model: kod, sertifika çipleri, sekiz satırlık teknik tablo, dönüş yönü + faz + versiyon seçici, debi-basınç eğrisi (SVG, `data-om-raster`), ilgili aksesuarlar, altta “SEAT serisindeki diğer modeller” şeridi. Seri yalnız breadcrumb'da ve o şeritte. Adres `/tr/products/<seri>?sku=<model>`.
11. **Tipografik ton.** Archivo 400 gövde / menü / filtre / tablo etiketi; 600 kart ve bölüm başlığı; 700 yalnız logo wordmark ve h1. Gövde satır aralığı ≥1.5, listeler ≥1.45. Menü panelinde satır yüksekliği 51 px, grup başlıkları arası 24 px. Kategori ve senaryo açıklamaları Source Serif 4, 16 px, 1.6, ölçü 66 karakter.

## Geri bildirim 2 — 30 madde uygulandı (2026-09-04, dosyalar v5 / v4)
Dosya sonradan 4 maddeden 30 maddeye büyüdü; tamamı uygulandı. Ekran listesi 10 → 14 artboard.

**Kabuk.** Header sağında tek öğe: “Teklif (n)” + hesap simgesi (madde 24). Ayrı “Teklif iste” ve “Teklif
Listesi” düğmeleri kalktı; ikisi de panelin içinde. Panel 360 px, gölgesiz, 8 px köşeli, 200 ms; başlık +
≤3 kalem + tek kiremit düğme (“Teklif talebini gönder” / boşsa “Teklif iste”) + beş sessiz bağlantı
(Teklif iste · Tekliflerim · Projelerim · Yeni proje oluştur · Favorilerim). Girişsizde son üç satır tek
giriş satırına iner. Mobilde aynı sıra alttan yaprakta (madde 25).

**Mobil uygulama kabuğu (madde 27–30).** Alt sekme çubuğu her ekranda: Ana sayfa · Ürünler · Teklif (rozet) ·
Destek · Hesap; seçili sekme lacivert dolu ikon, kiremit yok. Üst şerit yalnız logo + tam genişlik arama;
ana sayfada altında yatay kaydırılan kategori çipleri. Destek yaprağı beş satır (WhatsApp · Ara · Teknik
destek iste · Kargo takibi · İletişim), Hesap yaprağı beş satır. Ürün sayfasında eylem çubuğu sekme
çubuğunun üstüne yapışır.

**Menü paneli Apple çizgisi (madde 23).** Masaüstü panel yedi büyük kategori kiremiti (ikon 48 px + ad +
tek satır tanım) + “Tüm ürün ağacı” kutusu = sekiz öğe; kürasyon sütunu, ürün sayısı ve dal fotoğrafı
panelden çıktı. Senaryo paneli aynı kalıpta sekiz satır. Mobil menü tam ekran örtü, 20 px tek sütun,
kategori → dal akordeon, altta iki çerçeveli düğme.

**Ekran 06 (madde 12–17, 22).** Sıralama yedi seçenekli açık liste; altta “Daha fazla göster” + sayfa
numaraları (`?page=2`); kartın tamamı tıklanır, düğmeler ayrı hedef; her kartta “Karşılaştır” + “Teklif
listesine ekle”, ikisi çerçeveli; altta yapışkan “2 modeli karşılaştır” çubuğu; süzgeçte yer tutucu satır
yok; mobil süzgeç yaprağı ayrı çerçeve, kapanışı “34 modeli göster”. Yeni **ekran 06b** boş sonuç.

**Ekran 07 (madde 5–11, 18, 20).** Kabuk + kanal fanı deneyim modülü: niyet çipleri → mahal girdileri
(alan, yükseklik, kişi; pro modu “değerleri kendim gireceğim”) → devir kaydırıcısı; debi çubuğunda kiremit
ihtiyaç çizgisi, dört metrik kutusu, anlık hüküm (YETER / SINIRDA / YETMEZ + sebep), varyant kartları canlı
boyanır + ÖNERİLEN rozeti, Klasik/Konuşan tablo anahtarı, EN 16798-1 · ISO 5801 rozeti, göreli ses kıyası,
kanıtlı teklif satırı. Yapışkan bölüm çubuğu; eğri, aksesuar, açıklama ikinci ekranda. Belge bağlantıları
çerçeveli düğme oldu; seçiciler kardeş modele geçirir ve “model değiştirici değildir” notu kalktı;
“ATEX opsiyonel” çipi kalktı; kullanım alanları çipleri eklendi; marka satırı + 20 px logo bağlanabilir;
breadcrumb “SEAT serisi” seri süzgeçli listeye gider.

**Yeni ekranlar.** 07b hava perdesi modülü (kapı genişliği + montaj yüksekliği → zemindeki hız, gereken hız,
kapsama, modül adedi, hüküm) · 11 karşılaştırma tablosu · 12 Teklif paneli + Destek/Hesap yaprakları + yeni
proje formu · eylem bloğu iki kip (Teklif kipi yürürlükte, Satış kipi ARŞİV etiketiyle).

### v11 envanteri → v5 ekran 07 (madde 18 cetveli)
| Özellik | Durum |
|---|---|
| Niyet çipleri (mekân seçimi) | **DEĞİŞTİ** — mekânlar VentHub senaryolarına döndü (kimya laboratuvarı, galvaniz, ilaç/kimya, atölye, ofis, endüstriyel mutfak). Hava değişimi katsayısı mantığı aynı. |
| Endüstriyel mutfak → davlumbaz yönlendirmesi | VAR |
| Oda girdileri (alan, yükseklik, kişi) | VAR — başlık “Mahaliniz” |
| Pro modu (debi + basınç, eğri düşümü) | VAR — “değerleri kendim gireceğim” anahtarı |
| Devir kaydırıcısı | VAR |
| İhtiyaç satırı (gerekçeli) | VAR |
| Debi çubuğunda ihtiyaç çizgisi | VAR — çizgi kiremit |
| Dört metrik kutusu (debi, ses, güç, aylık elektrik) | VAR — “aylık elektrik” işletme tahmini olarak etiketli, ürün fiyatı değil |
| Anlık hüküm kutusu + sebep + gerekli devir | VAR |
| Varyant kartları canlı boyama | VAR |
| ÖNERİLEN rozeti | VAR |
| Elle seçim / sistem önerisi ayrımı | VAR — kanıt satırında yazılı |
| Klasik / Konuşan tablo anahtarı | VAR |
| Değer ↔ anlam sütunu | VAR |
| Mekâna göre satır vurgusu | VAR — ilk satır parlak |
| Standart rozeti (EN 16798-1, ISO 5801) | VAR — tablo altında |
| Göreli ses kıyası (bu devirde / maks) + uyarı | VAR |
| Kanıtlı teklif satırı (kaynak + girdiler + dayanak + zaman) | VAR |
| Hava perdesi modülü | VAR — ayrı artboard 07b |
| Fiyat / KDV | **DÜŞTÜ** — kapalı karar §1; Satış kipi artboard'ında arşiv olarak duruyor |
| “Sepete ekle” | **DÜŞTÜ** — teklif listesi kurdu; Satış kipinde arşiv |
| Dönen fan animasyonu | **DÜŞTÜ** — Recep onayı: düştü (2026-09-04 15:45). Statik çizimde gösterilemez; üretimde devirle bağlı kalır. |
| Koyu mod | **DÜŞTÜ** — Recep onayı: düştü (2026-09-04 15:45). 15A kabuğu tek kip. |
| Yarıçap ve gölge (12 px köşe) | **DÜŞTÜ** — marka kılavuzu yarıçap ve gölge yasağı; tek istisna Teklif paneli 8 px (madde 24 açıkça istiyor) |

## Standart denetimi — tüm ekranlarda (2026-09-04, Recep uyarısı: "bir yerde var, başka sayfada yok")
Recep haklı: kararlar sayfa sayfa yamanıyordu. Dosyanın tamamı taranıp üç standart on altı ekranda tek tek
uygulandı. Bundan sonra her karar önce envanterle taranır, sonra yazılır.

**S1 · Mobilde dokunma hedefi ≥44 px (madde 30).** 19 mobil çerçevede etkileşimli 44 çip/düğme büyütüldü:
mekân çipleri, akıllı şerit dal çipleri, kürasyon çipleri, son baktıklarınız çipleri, niyet çipleri,
dönüş yönü / faz / versiyon seçicileri, model şeridi çipleri, kullanım alanları çipleri, süzgeç çipleri,
teklif formunun beş alanı. Etkileşimli olmayan etiketler (UL-94, ErP, ÖNERİLEN, YETERLİ, standart rozeti,
ARŞİV) küçük kaldı — onlar hedef değil.

**S2 · Eylem asla ince metin bağlantısı olmaz (madde 5).** Turkuaz metin olarak duran on iki eylem çerçeveli
düğmeye döndü: "Modelleri listele" (ekran 05 ×3), "81 modelin tamamını filtreyle listele" (05),
"81 modeli filtreyle listele" (05 mobil), "Filtreleri temizle" (06, 06b), "Temizle" (06 mobil süzgeç yaprağı),
"Seçimi temizle" (06), "Listele" (09 ×3), "Not ekle" / "Notu düzenle" (10), "Listeyi PDF indir" (10 ×2),
"Kaldır" (11 ×3), "Girdileri düzenle" (07d). Ekran 07 mobilinde "Değerleri kendim gireceğim" turkuaz metinken
masaüstüyle aynı segmented anahtar oldu. Gövde paragrafı içindeki turkuaz vurgular ve madde 24'ün panel
bağlantıları kapsam dışı — onlar eylem değil.

**S3 · Kart eylem seti tek.** Ekran 06'da "Ürünü incele" vardı, arama sonuçlarında (08) yoktu; eklendi —
masaüstünde "Ürünü incele" + "Teklif listesine ekle", mobil sonuç kartında tek "Ürünü incele".

**YENİ · Ürün hakkında soru sorma (Recep sorusu).** Yeni kanal açılmadı: belgeler kümesinin yanına çerçeveli
**"Bu model hakkında soru sor"** düğmesi kondu (07 ve 07c, masaüstü + mobil "Soru sor"). Aynı teklif formunu
"soru" kipiyle açar; model kodu ve panel açıksa hesap girdileri kendiliğinden eklenir. Gerekçe: eylem sözlüğü
iki fiille sınırlı, üçüncü bir kanal (canlı sohbet, ayrı form) hem sözlüğü hem gelen kutusunu böler; mobilde
Destek yaprağındaki "Teknik destek iste" zaten aynı yere düşüyor, bu düğme onun bağlamlı girişi.

## Panel geçişi ve logo düzeltmesi (2026-09-04, Recep gözlemi — v10 / v7)
- **Geçiş kontrolü küçüldü ve yer değiştirdi.** 35a'daki "tam genişlik 44 px çağrı bandı" sayfada çok yer
  kaplıyor ve iki hâl arasındaki ilişkiyi anlatmıyordu. Artık tek satır: soru düz metin (13,5 px), yanında
  küçük çerçeveli **"Hesapla ▾"** düğmesi (~110 px). Açık hâlde aynı satır "Hesap · açık — girdi değiştikçe
  hüküm anında güncellenir" + **"Kapat ▴"** olur. Band yok, ritim bozulmuyor.
- **Geçiş artboard başlıklarında yazılı:** 07c "VARSAYILAN (panel kapalı) · Hesapla ▾ → ekran 07" ·
  07 "panel AÇIK · 07c'deki Hesapla'dan gelinir, Kapat ▴ 07c'ye döner" · 07b aynı geçiş · 07d "panel DOLU
  açılıyor · seçiciden ya da teklif listesindeki Hesapla'dan".
- **Logo işareti yalnız mobil sekmede.** Masaüstü header'ında wordmark ile yan yana iki logo kötü
  duruyordu; "Ürünler ▾" önündeki 15 px işaret 16 header'dan ve ana sayfadan kaldırıldı. Madde 31'in
  mobil sekme ikonu aynen duruyor.

## Ekran 06 düzeltmesi (2026-09-04, Recep gözlemi — v9)
- **Ölü alan.** Sıralama listesi statik olarak açık çizilmişti ama normal akıştaydı; şeridi ~200 px'e
  şişirip "34 model" satırının yanında koca boşluk bırakıyordu. Liste artık `position:absolute` ile
  şeridin üstüne biniyor, şerit tek satır yüksekliğinde kalıyor.
- **Design eklemesi — onay bekler: kartta üçüncü hedef.** Kartta yalnız "Karşılaştır" ve "Teklif listesine
  ekle" vardı; ikisi de kullanıcıyı listede tutuyor, ürüne gitmenin görünür hedefi yoktu. Madde 14 "kartın
  tamamı tıklanır" diyor ama statik kartta bunu söyleyen işaret yok. Çerçeveli **"Ürünü incele"** eklendi;
  kart eylem seti üçe çıktı (Karşılaştır çipi + Ürünü incele + Teklif listesine ekle, üçü de çerçeveli,
  kiremit yok). Madde 22'nin iki eylemli setini genişletir — onaylanmazsa tek satır geri alınır.

## Geri bildirim 3 uygulandı (2026-09-04, dosyalar v8 / v6) — madde 35-41
- **35. Ürün sayfası mimarisi değişti (Recep kararı).** Modülsüz kabuk artık VARSAYILAN; deneyim modülü
  katlanabilir “Hesap” panelidir. Dört hâl çizildi: **07c** kapalı (teknik tablonun üstünde 44 px çerçeveli
  çağrı satırı, “Bu fan mahalinize yeter mi? Hesaplayın”, kiremit değil) · **07** kanal fanı açık ·
  **07b** hava perdesi açık (“Bu perde kapınıza yeter mi?”) · **07d** dışarıdan dolu geliş (seçici ya da
  teklif listesindeki “Hesapla”dan; üstte “Seçicideki girdilerinizle hesaplandı” bilgi satırı,
  adres `?sku=…&hesap=1`). Aksesuar ve sürücü gruplarında çağrı satırı hiç görünmez.
  07d'nin gövdesi 07 ile birebir aynı olduğu için o kısım tekrar çizilmedi, altyazıda yazılı.
- **36. Mobil menüdeki teklif düğmeleri kalktı.** Menü yön bulma yüzeyi; teklif işi alt sekme çubuğunda.
- **37. Menü alt bölgesi:** ince ayırıcı + “Tüm ürünler” (sağda 375) + “Markalar” (sağında beş markanın
  tek renk küçük logosu) + koşullu “Son baktıklarınız” (en çok 3 çip, kayıt yoksa satır hiç çizilmez).
  Hesaplayıcı, teklif, iletişim bu menüye girmiyor.
- **38. Kategori satırı:** satırın kendisi kategori sayfasını açar, sağdaki 44 px artı alt dalları; ikisi
  ayrı hedef, aralarında ince ayırıcı. Açık dal tek.
- **39. Metin:** “Bu fanı nerede kullanacaksınız?” · “Bu perdeyi nerede kullanacaksınız?”
- **40.** Dosyalar v8 / v6; v7 ve v5 arşive alındı. Eyebrow “on altı ekran · v8”.
- **41.** Design'ın iki eklemesi kabul edildi (Otopark çipi yok, mekân çiplerinde ikon yok) — kayda geçti.

**“Doğru fanı seçin” önerim reddedildi (madde 37).** Gerekçe: “hangi kategori” diye duraksayana fan seçici
göstermek cevabı peşin vermek olur; o tereddüdün yeri menünün üstündeki “Senaryoya göre” sekmesi. Seçicinin
giriş noktaları madde 32'deki üçtür. Kabul; menüye konmadı.

**Geri bildirim 4 (madde 42-46, liste sayfaları matris görünümü) BAŞLANMADI** — kendi belgesi Faz 3 işi
olduğunu ve v8 paketinin dışında olduğunu söylüyor. Bir sonraki tur: üç görünüm (Kart / Tablo / Seri,
varsayılan Tablo), doluluk eşikli sütun kuralı (≥%60 görünür, %30-60 ikincil, <%30 yok), marka × kategori
haritası, seri görünümü. Mobilde varsayılan görünüm kararı Design'a bırakılmış (madde 42) — gerekçeyle
yazılacak.

## Geri bildirim 2 · madde 31-33 uygulandı (2026-09-04, dosyalar v6 / v5)
- **31. Logo işareti menü ikonu.** Mobil alt sekme çubuğundaki “Ürünler” sekmesinin ikonu artık dört dilimli
  logo işareti (tek renk: seçilide lacivert, diğerinde gri — kiremit yok, madde 27 kuralı). Sekme menüyü
  ALTTAN yukarı tam ekran açar; üstteki tutamak bunu söyler, yandan çekmece yok. Üst şeritteki logo eve gider.
  Masaüstünde “Ürünler ▾” önünde aynı işaretin 15 px'lik tek renk (beyaz) hâli.
- **32. Seçim yardımcısı üç giriş, tek motor.** (a) Seçici sayfası: ana sayfadaki turkuaz “Hesaplayıcılar →”
  bağlantısı iki çerçeveli düğmeye döndü — “Doğru fanı seçin” ve “Hava perdesi seçici”; hero ikinci düğmesi de
  “Ürünleri keşfet” yerine “Doğru fanı seçin”. (b) Ürün sayfası modülü zaten madde 18 ile duruyor.
  (c) Teklif listesinde her kalemin yanında çerçeveli “Hesapla” düğmesi; sütun başlığı “Hesap / not”.
  Sepet/ödeme adımında hesap yok — Satış kipi artboard'ında da eklenmedi.
- **33. Akıllı şerit.** Mobil üst şerit sayfaya göre içerik değiştiriyor, bileşen tek. Ana sayfa: kategori
  çipleri kalktı, yerine “Nereye takacaksınız?” + mekân çipleri (Banyo · Mutfak · Ofis · Restoran ·
  Laboratuvar · Depo · Sığınak). Kategori sayfası (ekran 04): o kategorinin dört dalı, aktif olan vurgulu.
  Liste / ürün / teklif listesi varyantları Faz 3-4'te.
- **34 çizilmedi** (Faz 3 adayı, OPS talimatı).

### Ürün sayfası üç artboard oldu (2026-09-04, Recep isteği — v7)
v5'te ekran 07 deneyim modülüyle yeniden yazılınca v4'te geliştirdiğimiz kompakt kabuk kayboldu. Recep geri
istedi; §8 zaten "modülsüz gruplar (aksesuar, sürücü): yalnız kabuk" diyor. Şimdi üç artboard var, kabuk aynı:
- **07** kanal fanı deneyim modülü (SEAT 30)
- **07b** hava perdesi modülü (VH HP-100)
- **07c** yalnız kabuk — v4 yerleşimi, kabuk güncel dile taşındı (header "Teklif (3)" + hesap simgesi, mobil alt
  sekme çubuğu, kiremit etiketi "Bu model için teklif iste"). Masaüstü nav'ındaki logo işareti v10'da kaldırıldı.

### Şerit sorusu
Akıllı şerit başlığı "Nereye takacaksınız?" → **"Nerede kullanacaksınız?"** (Recep, 2026-09-04). Ürün sayfası
modülündeki "Bu fanı nereye takacaksınız?" v11 referansından geldiği için değiştirilmedi — Recep'e soruldu.

### Bu turda düzeltilen kusur
Ekran 02 ve 03'ün mobil menüleri karışmıştı: 02'nin mobilinde senaryo listesi görünüyordu (v5'te iki bölge
aynı çapa ile aranınca ikinci yazım birinciyi ezmiş). İkisi de doğru içerikle yeniden yazıldı — 02 “Ürüne
göre” akordeonu, 03 senaryo listesi.

### Design eklemesi — onay bekler
**Otopark çipi konmadı.** Madde 33 mekân listesinde “Otopark” var; Otopark Jet dalı canlıda ürünsüz ve
kapalı karar §1 boş dal göstermeyi yasaklıyor. Çip yedi mekânla çizildi. Ürün girilince eklenir.
**Mekân çiplerinde ikon yok:** Banyo, Mutfak, Depo marka ikon setinde yok; yarısı ikonlu şerit bozuk
duruyordu, hepsi metin çip oldu.

## Geri bildirim 2 uygulandı (2026-09-03, ilk dört madde) — dosyalar v4 / v3
1. **Tek fiil “Teklif iste”.** “Teklif al” hiçbir yerde yok; hero düğmesi “Teklif iste”.
2. **Header'da teklif düğmesi yok.** Sağda yalnız arama · TR/EN · çerçeveli “Teklif Listesi (n)” (beyaz kenar; teklif
   listesi ekranında hafif dolgulu aktif hâl). Mobilde sayaç da çerçeveli rozet. Ekran 01'deki mobil “Teklif İste” şeridi kalktı.
3. **Renk kuralı:** sayfanın işini BİTİREN eylem kiremit, diğer her düğme çerçeveli.
   Ana sayfa → hero “Teklif iste” · ürün → “Teklif iste” (“Teklif listesine ekle” çerçeveli, v3'ün tersi) ·
   teklif listesi → “Teklif talebini gönder” · senaryo → “Teknik destek iste” · kategori / dal / liste / arama → kiremit yok.
4. **Ürün sayfası sıkılaştı.** İlk ekranda (1440×900) görsel + ad + kod + sertifika çipleri + altı satırlık tablo +
   üç seçici + iki düğme. Görsel sütunu 600 → 462 px (%34), tablo satırı 44 → 36 px. Eğri, aksesuarlar ve
   “Açıklama” bölümü ikinci ekrana indi; açıklama artık tablonun yanında değil sayfa altında.

Bir önceki turda önerdiğim “iki ad, header'da kalıcı kontur düğme” standardı bu kararla değişti; geçerli olan yukarıdaki dört maddedir.

## Eylem standardı (2026-09-03, tur içi düzeltme — geri bildirim 2 ile güncellendi)
- **İki eylem adı var:** “Teklif listesine ekle” (ürünü listeye koyar) ve “Teklif iste” (teklif talebini açar).
  “Teklif al” hiçbir yerde yok. NOT: geri bildirim 2 madde 2 bu maddeyi güncelledi — gövdedeki kiremit düğme
  sayfaya özel etiket alır: “Bu model için teklif iste”, “Projeniz için teklif iste”, “Teklif talebini gönder”,
  “Teknik destek iste”. Yürürlükte olan o.
- **Üç görsel seviye:** dolu kiremit = sayfada bir tane, sayfanın ana işi · lacivert kontur (beyaz zemin) = ikincil
  buton ve kart içi eylem · turkuaz metin = üçüncül bağlantı.
- **Header “Teklif İste”** on ekranın hepsinde ve ana sayfada, her zaman beyaz kontur, asla dolu değil —
  kabuk sayfa sayfa şekil değiştirmez. Tek istisna teklif listesi ekranı (geri bildirim 1, madde 5):
  kullanıcı zaten talebin içinde, o slot aktif sekme olur. Kontur olduğu için kiremitle çakışmaz.
- Sayfa başına dolu kiremit: ana sayfa → hero “Teklif iste” · ürün → “Teklif listesine ekle” · senaryo → “Teklif iste”
  · teklif listesi → “Teklif iste” · kategori / dal / liste / arama → yok.
- Ürün sayfasında tek buton: “Teklif iste” bağlantıya indi (“Bu ürün için doğrudan teklif iste →”). Aynı boyda iki
  buton yan yana durunca yarışan iki iş gibi okunuyordu; ikisi de aynı teklif talebine çıkıyor.
- Ürün sayfası yerleşimi v1'e döndü: altı anahtar değer iki kolonda ekranda, üç seçici tek satırda yan yana,
  tam teknik tablo ve ürün anlatımı aşağıda.

## Design eklemeleri — onay bekler (geri bildirim 2 turu)
1. **Teklif paneli 8 px köşeli.** Madde 24 “8 px köşeli” diyor; marka kılavuzu “köşe yarıçapı yok (logo
   dairesi hariç)” diyor. Panel madde 24'e göre çizildi. Onaylanmazsa keskin köşeye döner, tek satır.
2. **“Aylık elektrik” kutusu kaldı.** v11 envanterinde var ama ₺ gösteriyor; §1 fiyatı yasaklıyor. Bunu ürün
   fiyatı değil işletme tahmini sayıp tuttum ve kutuda öyle yazdım (“temsilî işletme tahmini, ürün fiyatı
   değil”). Fiyat kokusu istenmiyorsa kutu “Güç payı” ile değiştirilir.
3. **Mobil menü örtüsünün altındaki iki düğme.** Madde 23 menü örtüsünün en altına “Teklif iste” +
   “Teklif Listesi” koyuyor; madde 27 aynı işi alt sekme çubuğuna veriyor. İkisi de çizildi, bir satır
   arayla tekrar ediyor. Öneri: örtüdeki iki düğme kalksın, sekme çubuğu yeter.
4. **Deneyim modülü SEAT 30 üstünde çalışıyor.** §8 modülü “kanal fanı” grubuna bağlıyor; akış (ekran 04-06)
   korozyon dayanımlı SEAT üzerinden gidiyor. Modülü SEAT'e giydirdim — hesap aynı, mekân listesi laboratuvar
   tarafına döndü. Vortice Lineo Q üzerinde ayrı bir artboard isteniyorsa eklenir.
5. **Karşılaştırma sayfası adresi** `/tr/karsilastir?sku=...` olarak yazıldı; canlı durumda bu adres yok.

## Önceki turun Design eklemeleri — hükme bağlandı
Maddeler 1–5 geri bildirim 1 ile karara döndü (1 → çerçeveli, 2 → ikon arşive, 3 → onaylı, 4 → onaylı, 5 → kiremit kuralı). Aşağıdaki liste tarihsel kayıt olarak duruyor.

## Design eklemeleri — onay bekler
1. **Kart içindeki birincil eylem lacivert, kiremit değil.** Canlı durum §1 "Teklif listesine ekle
   (birincil, kiremit)" diyor; marka kılavuzu "kiremit sayfada tek sıcak nokta" diyor. Liste sayfasında
   12 kart × kiremit buton ikisini birden karşılamıyor. Çözüm: kartlarda lacivert dolu buton, seri/ürün
   sayfasında kiremit. Onaylanmazsa kartlar kiremite döner, tek satır değişiklik.
2. **Atıksu Arıtma ikonu.** Marka setinin dokuz senaryo ikonundan biri "Hava Arıtma"; canlı durum ve
   README §3 dokuzuncu senaryoyu "Atıksu Arıtma" olarak veriyor. Hava Arıtma bugün ürünsüz olduğu için
   menüde yok. Eksik kalan Atıksu Arıtma ikonu ekran 03'te iki renkli marka dilinde çizildi ve
   "İKON ONAY BEKLER" etiketiyle işaretlendi. Onaylanırsa marka projesinde SVG'ye çevrilir.
3. **Utility bar kaldırıldı.** Eski Broadsheet düzeninde ikinci bir üst şerit vardı (Markalar / Bilgi
   Merkezi / Bayilik / İletişim). Kabuk tek koyu banda indi; o bağlantılar header nav'ına ve footer'a taşındı.
   Header: Ürünler ▾ · Hesaplayıcılar · Bilgi Merkezi · Markalar · arama · TR/EN · Teklif Listesi · Teklif İste.
4. **Ana sayfada sekizinci kategori kutusu "Tüm ürün ağacı".** Dört sütunlu gridin ikinci satırı yedi
   kategoriyle eksik kalıyor; sekizinci kutu bağlantı olarak grid'i tamamlıyor. Vaat kutusu değil, bağlantı.
5. **Kiremit çakışması.** Ana sayfa hero'sunda ve arama ekranında header butonu ile sayfa içi birincil eylem
   aynı anda kiremit görünüyor. Öneri: ana sayfada ve arama açıkken header "Teklif İste" butonu lacivert
   kontura döner. Ekranlarda not olarak yazıldı, çizim ikisini de kiremit gösteriyor.

## Ölçüler
- Header 74 px (mobil 60 px). Sayfa iç boşluğu 40 px (mobil 18 px).
- Menü paneli grid: 328 / 1fr / 268 (ürüne göre), 378 / 1fr / 268 (senaryoya göre).
- Filtre sütunu 262 px. Arama öneri sütunu 296 px. Teklif formu 400 px.
- Kategori ikonu: başlıkta 44, kartta 44, menüde 27, mobil menüde 24-26.
- Görsel kutusu: beyaz zemin + 1 px `#e2e2de` kenar. Fotoğraf yoksa kutu kaldırılır ve kart
  2 px lacivert üst kural çizgisiyle başlar; boş kutu bırakılmaz.
- Ana sayfa hero: fotoğraf 560×400, başlık 46 px / 1.14, ölçü 600 px.

## TAMAMLANDI (geri bildirim 3 ile, v8) — kayıt olarak duruyor: ürün sayfası mimarisi turu
Kaynak: `venthub-canli-durum.md` §8 (ürün sayfası mimarisi, REC-65) + `referans-canli-urun-sayfasi-v11.html`.

İş tek cümleyle: ürün sayfası **tek kabuk + ürün grubuna göre deneyim modülü** olacak; v11'deki v2
yerleşimi ve özellik envanteri birebir korunup 15A diline (lacivert kabuk, Archivo/Source Serif/Plex Mono,
yarıçap ve gölge yok) giydirilecek.

Kanal fanı modülünde korunacak envanter: niyet çipleri → oda girdileri (+ “değerleri kendim gireceğim” pro
modu: debi + basınç) → devir kaydırıcısı; debi çubuğunda ihtiyaç çizgisi, anlık hüküm kutusu
(YETER / SINIRDA / YETMEZ + sebep), ihtiyaca göre canlı boyanan varyant kartları + ÖNERİLEN rozeti,
Klasik/Konuşan teknik tablo anahtarı, standart rozeti (EN 16798-1 · ISO 5801), göreli ses kıyası,
kanıtlı teklif satırı (seçim kaynağı + girdiler + dayanak + zaman). Hava perdesi modülü ayrı ekran:
kapı genişliği + montaj yüksekliği → zemindeki hız, gereken hız, kapsama, modül adedi, hüküm.
Aksesuar ve sürücü gruplarında yalnız kabuk, deneyim modülü yok.

Çalışmaya başlarken Recep'ten alınacak iki karar:
1. **Header'daki teklif düğmesi.** Geri bildirim 2 madde 2 “header'dan çıkar” dedi ve çıkarıldı; canlı durum
   §1 şimdi “header'da her ekranda çerçeveli Teklif iste + Teklif Listesi (n) kalır” diyor. Canlı durum daha
   yeni ve tek kaynak olduğu için konturlu düğme geri konacak; gövdedeki kiremit düğme sayfaya özel etiket
   alacak (“Bu model için teklif iste”, “Projeniz için teklif iste”).
2. **Referanstaki fiyatlar.** v11'de ₺5.250, KDV dahil ve sepet dili var; §1 fiyatı yasaklıyor. Fiyat alanları
   atılacak, sepet yerine teklif listesi kurulacak — envanterden düşen özellik olarak değil, kapalı karar gereği.

## Madde 47 uygulandı — ekran 08 liste şablonuna geçti (2026-09-04, v12)
Design'ın tespiti onaylandı; arama sonucu ayrı bir sayfa değil.
- **Ekran 08 = ekran 06 şablonu + arama şeridi.** Aynı süzgeç sütunu (kategori ve marka faseti öne alındı,
  çünkü arama kategoriler arası), aynı sıralama şeridi (varsayılan İlgililik), aynı model kartı ve üçlü eylem
  seti, aynı sayfalama ve karşılaştırma çubuğu. Şerit: sorgu + sonuç sayısı + kaldırılabilir arama çipi.
- **Yazarken çıkan öneri ayrı artboard: 08c.** Panel arama alanının altına yapışıp sayfanın üstüne bindiği için
  08 içinde çizilince arama şeridini ve ilk kart satırını örtüyordu; kendi artboard'ına alındı. Sıra sabit
  (kod · ürün · seri · marka). Kod TEK ürüne denk gelirse Enter doğrudan ürün sayfasına gider; seri ya da çok
  varyant eşleşirse 08 listesi açılır.
- **Arama süzgeci:** 06'nın sütunu aynen duruyor (debi, statik basınç, seri, malzeme, sertifika, faz) ve
  başına iki kategoriler-arası faset ekleniyor: Kategori ve Marka (Vortice 173 · SEAT 81 · AVenS 51 ·
  Nicotra Gebhardt 35 · Danfoss 35). Faset düşürülmedi, eklendi.
- **Marka eşleşmesi ızgaraya karışmaz:** şeritte tek çip ("SEAT Ventilation marka sayfası →").
- **Bilgi Merkezi araması bu fazda yok** (Faz 4, kendi araması).
- **Yeni ekran 08b — boş sonuç:** üç çıkış yolu (şunu mu demek istediniz · süzgeçleri gevşetin, hangi süzgecin
  kaç modeli sakladığı yazılı · Doğru fanı seçin). Kiremit yok.

## Önceki tespit (kayıt) — ekran 08, Design 2026-09-04
Ekran 08 bugün otomatik tamamlama gösterimi; arama SONUÇ sayfası değil. Liste sayfasının (06) kararlarının
hiçbiri orada yok: süzgeç sütunu, sıralama (madde 15), sayfalama (madde 12), "Karşılaştır" (madde 22), boş
sonuç hâli (madde 13), bağlam çipi. Ürün dışı sonuçlar (marka, seri, Bilgi Merkezi) yalnız öneri listesinde
var, sonuç listesinde yok. Önerim: arama sonucu = liste şablonu + aramaya özel üst şerit; ayrıca 08b boş
sonuç artboard'ı ("SEAT-30-PP mi demek istediniz?" + süzgeç gevşetme). Bir de karar bekleyen davranış:
model kodu TAM eşleştiğinde arama sonucu göstermek yerine doğrudan ürün sayfasına gitmek (B2B'de kod yazan
kullanıcı o ürünü istiyor; ara sayfa fazladan tıklama). Recep'in onayı bekleniyor, çizilmedi.

## Gözden geçirme turu v1 (2026-09-04, `gozden-gecirme-brief.md`) — ÇİZİM YOK
Çıktı `gozden-gecirme-bulgular-v1.md`: 28 bulgu (8 AYKIRI · 9 BOŞLUK · 11 İYİLEŞTİRME), K1–K16'ya karşı, brief'in
sabit başlık düzeniyle. Boşluk doğrulaması bağımsız: depo `src/app/[lang]/**/page.tsx` 47 müşteri yolu (A 42/47
tutuyor), B 7/7, sitemap 192/192 (Kernel ile açılıp sayıldı; `/tr/cart` sitemap'te — K1'e aykırı, bulgu c.1).
Linear "Kararlar — Vitrin 15A" belgesi projedeki kopyadan iki madde ileride: erişim/yazma sınırı (Design okur,
yazmaz) ve **mobil header'a Hesap + dil, alt çubuk 4 sekme (Recep eğilimi, çizilip onaylanınca kesinleşir)** —
K9/K16 ile çelişecek, bulgu e.1. Öne çıkan: aylık elektrik ₺ kutusu K1'e aykırı (a.1); kategori sayfası "üç mod"
çizilmedi (b.1); Hesap yaprağı girişsiz hâl + "Siparişlerim" K1/K16'ya aykırı (e.2); seçici yeri önerisi tek
seçici sayfası + senaryoda kısayol (d.2). Linear'a tek yorum yazıldı ("Vitrin 15A Yeniden Tasarım" projesi).
Kabul edilen bulgular karar belgesine girer, sonra çizim — OPS yönlendirir.

## Erişim ve yazma kuralı (Recep, 2026-09-04 — Linear K "Design'ın erişim ve yazma sınırı")
Design GitHub'ı, canlı siteyi (Kernel), sitemap'i, Linear'ı ve Supabase'i OKUR. YAZMAZ: Supabase'e yazma, Linear'a
karar/iş/durum yazma, canlıda form/giriş/teklif gönderme yok. Linear'a yazılan tek şey brief'in izin verdiği
"tur bitti" yorumu. Bir yazma gerekiyorsa OPS yönlendirir, Recep kapısıyla olur.

## İletişim düzeni (Recep, 2026-09-04)
- Şerit adı **DESIGN**. Linear'a yazılan her yorum "— DESIGN (Fable) tarih" ile biter; OPS'unkiler "— OPS" ile.
- Her çıktı ÖNCE projeye dosya olarak yazılır; Linear yorumu yalnız duyurudur (OPS dosyayı gözcüyle görür).
- Kararlar belgesi Linear'dan okunur; projedeki kopya eskiyse fark yazılır.
- **Tetik cümlesi: "Linear'a bak"** → Linear "Kararlar — Vitrin 15A" belgesi + projedeki en son brief okunur, fark bildirilir.
  Çizim yalnız brief gelince; mobil üst şerit (a)/(b) hâlleri de brief'le birlikte, şimdi başlanmaz.

## Geri bildirim 7 uygulandı (2026-09-04 akşam) — madde 69–71, ayrı dosya
**Kural (Recep, v1 reddi):** alternatif çalışması bile mevcut kabuğun üzerine çizilir — v15'in gerçek kareleri alınır, yalnız değişen yer işlenir ve işaretlenir. Sıfırdan kabuk yazmak yok; “mobil” dense de masaüstü de çizilir. Logolar her yerde beyaz kutuda, filtresiz.
Kesinleşen: sekme adı **“İletişim”** (Recep 18:30, K9'a işlenir). Panel sorusu karar dışı; üç alternatif yan yana çizildi.
- **69.** `Ürün Seçimi Alternatifleri v1.dc.html`: A tek sayfa seçici + ürün sayfasında bağlantı (3 kare) · B hafif panel + dolu seçici (3 kare) · C rehberli “benim yerime seç” (4 kare). Aynı örnek (kimya lab., 90 m², 3,2 m, 8/sa → 2.304 m³/h). Her altyazıda kim için · dokunuş · risk nerede kapanır · kod bedeli (A küçük, B orta, C orta-büyük). Sorumluluk dili üçünde aynı: “ön seçim · proje verisiyle doğrulanır · Teknik destek iste”.
- **69b.** Kabuk motor-bağımsız: grup A'da üst sekme (ürün/kategori sayfasından gelince otomatik), B'de üründen belli, C'de ilk sorunun cevabı. Ortam koşulları her akışta katlı satır, varsayılan kapalı (C'de 5. soru, “bilmiyorum” seçilebilir). Katsayılar Design işi değil (`secim-motoru-kapsam-haritasi-taslak.md`).
- **Design görüşü:** A + C birlikte (seçici iki kipli açılır, ürün sayfasında A'nın tek satırı); B çizilmez, analitik sonrası yeniden bakılır. Karar Recep'in.
- **70.** `zorunlu-icerik-haritasi.md` + footer karesi (Ürünler · Şirket · Yasal + iletişim + markalar + dil; mobil akordeon). v15 footer'ı “Kurumsal · Yardım” düzeninde — Recep onayıyla taşınır. YOK (K1): mesafeli satış, iptal/iade, sipariş takip, havale. HİÇ YOK: özel kampanya. Soru: çerez şeridi çizilsin mi.
- **71.** Ana sayfa kategori kartları zaten var; öneri düştü.

## Mobil kare denetimi (2026-09-04 akşam, Recep gözlemi — v15 üzerine yazıldı, sürüm değişmedi)
Recep: “04 mobilde sorun, 14 mobil yok, 12'den sonra header sorunu.” Hata Design'ın, kasıtlı değil. DOM ölçümüyle 24 kare tarandı.
- **04 mobil:** üst şerit eski hamburger + arama ikonu kurgusundaydı (52b'ye geçmemiş) ve ilk dal çipi yanlışlıkla seçili çizilmişti. 52b'ye alındı (logo + hesap, altında 44 px arama); kategori sayfasında hiçbir dal seçili değil, dal sayfasında (05) o dal seçili.
- **Eksik mobil kareler eklendi:** 14 (uzun metin: içindekiler 44 px katlı satır, gövde 16,5 px) · 07e (kısa kabuk: 3 satır tablo, iki belge düğmesi, eylem çubuğu) · 04-mod2 (anlatım: tek dal, “24 modeli listele”) · 04-mod3 (seri listesi: 4 seri satırı).
- **Yaprak/örtü kareleri (02, 03, 06 süzgeç, 12, 52):** arkada yalnız %45 lacivert perde vardı, header gibi okunuyordu. Artık perdenin arkasında kısılmış gerçek kabuk (60 px koyu header + soluk içerik çizgileri). Yaprağın kendi header'ı yok — kasıtlı: yaprak sayfanın üstüne biner.
- **Mobil karesi olmayan iki kare gerekçeli:** 58 masaüstü İletişim paneli (mobil karşılığı ekran 12 yaprağı) · 13 eylem bloğu iki kip (şablon parçası, ekran değil).
- **Yatay çip şeritleri** (01 mekân, 04 dal, 13s) ölçümde “taşma” görünür; gerçek değil, `overflow-x:auto` kaydırma içeriği. Denetim betiği bunu ayırıyor.
**Kural (bundan sonra):** her sürümde teslim öncesi DOM denetimi: her ekranda 390 px kare var mı, ilk çocuk koyu kabuk mu, alt çubuk var mı, kaydırma dışı taşma sıfır mı. Recep'in tek tek bulması beklenmez.

## Geri bildirim 6 uygulandı (2026-09-04 akşam, v15 / v9) — madde 62–68
Özet `v15-notlar.md`. “Hesaplayıcılar” → “Ürün Seçici” her yerde (K17 girişi) · 52b seçildi (Recep 16:50), 52a arşiv, yeni kare akıllı dil çipi · mod kuralı ≥2/1/0 · seçici “Hesapla” kiremit · bayat metinler temiz · 67 `sogukgiris-oneriler.md` (öneri: hafif panel) · 68 `mobil-kisayol-oneriler.md` (öneri: sekme “İletişim”; yaprak WhatsApp · Ara · E-posta · Teknik destek iste + beklenti + bağlam; Karşılaştır çipi konsun, beşinci sekme konmaz). Çizimde sekme “İletişim” uygulandı — Recep kararı bekler.
**Design eklemesi — onay bekler:** sekme adı “İletişim”; 67 hafif panel önerisi (K12 ile uyumlu, çizilmedi).

## Geri bildirim 5 uygulandı (2026-09-04, v14 / v8) — madde 48–60
Kaynak: gözden geçirme v1 eleme + Linear K17. Ayrıntı `v14-notlar.md`. Özet: ekran 13 seçici (K17, tek sayfa, /tr/secici) · ₺ kalktı (kWh/ay + güç payı) · teklif listesi /tr/teklif-listesi · mobil şerit 52a/52b, tüm karelerde 52b varsayılan, alt çubuk 4 sekme · Hesap yaprağı girişsiz/girişli, Siparişlerim kalktı · kategori üç mod (dal sayısından) · 07e kısa kabuk · ekran 14 uzun metin + Bilgi Merkezi · 58 masaüstü Destek paneli · “Ürünü incele” kalktı (K5) · faset başlıkları Archivo. 56 ölçümü: çağrı satırı 07c'de ≈355–399 px, ilk ekranda; kaydırma gerekmedi.
**Açık sorular (notlarda):** mobil seçicide “Hesapla” kiremit mi; Hava Şartlandırma (2 dal) hangi mod.

## GB8 + GB9 uygulandı (2026-09-05) — sayım turu, çizim yok
K19 kabul edildi (Linear, Recep 09-05): alt çubuk 4 SAYFA sekmesi Ana sayfa · Ürünler · Teklif/Sepet · **Hesap**;
İletişim header sağında simge → alt panel, satırlar niyetle adlanır; header sağı TR/EN çipi (her zaman) + bildirim
rozeti (girişli) + İletişim; geri dönüş kuralı 2 hafta ölçüm. Terim: **alt panel**.

**Çıktılar:** `systemair-olcum-raporu.md` (7 madde) · `bosluk-listesi-v2.md` (47 yol × 5 hâl) ·
`Ürün Seçimi Alternatifleri v3.dc.html` + `v3-notlar.md` · `zorunlu-icerik-haritasi.md` güncel (madde 80).

**Ölçümden çıkan üç düzeltme (Design'ın Systemair raporundaki hatalar):**
1. **“Seri sayfası yok” yanlıştı.** PDP aile kanoniktir, `?sku=` varyant ön seçer, varyant slug'ı 308 ile aileye
   taşınır; `resolveProductRoute` dört sonuç verir ve **`SeriesLandingView` kodda VAR** (HTTP 200). Ama
   `parent_family_id` **0** — seri dalı bugün ölü. Gerçek boşluk sayfa tipi değil, ailenin ANLATIMI.
2. **Belge tablosu hiç yok.** Şemada `%document%/%file%/%catalog%` yok; tek dosya tablosu `product_images`
   (339/375 ürün görselli). Ürün sayfasının üç belge düğmesi bugün hiçbir dosyaya bağlanamıyor → Kataloglar
   sayfası çizilmez (%100 boş hücre).
3. **Kategori rehber metni için ayrılmış iki alan da boş** (`description` 0, `authority_content` 0). `display_mode`
   üç mod taşıyor (series 22 · showcase 11 · landing 4) ama adlar 15A ile eşlenmedi.

**Sayılar (09-05 SELECT):** 40 aile · 31'inde TR açıklama >40 karakter (ortalama **130**), **9 boş** (JET ve STORM dahil) ·
`is_description_manual` 40/40 **false** · 375 ürünün hepsi aileye bağlı · `description_i18n` 374/375 dolu, ortalama
**111 karakter** (tek cümle; altı blok yok) · ≥%70 dolu anahtar: Fanlar 6, Kontrol 10, VMC 20, Perde 19,
**İklimlendirme 0** (o kategoride dört madde bloğu çizilmez) · pq_curve 145 · ürünsüz dal 7 · `parent_id is null` 13
satır (15A 7 kategori diyor — fark kalem olarak yazıldı).

**Alternatifler v3:** örnek açık ofis (1.728 m³/h), ürün Vortice Lineo 250 Quiet ES (eğrisi olan aile), dört varyant
gerçek değerlerle, dördüncü hüküm “değerlendirilemedi” (örnek SEA-51352000, eğri yok), K7 gereği verisi olmayan
iki tablo satırı çizilmedi, footer marka logoları kalktı.

## Madde 80 uygulandı (2026-09-05) — tasarım sözleşmesi, çizim yok
`tasarim-sozlesmesi-v1.json` + notlar. Ölçüm yöntemi: statik CSS taraması, frekansla; baskın değer token, tek kullanım
varyant. Kanıt JSON içinde (`measured_frequency`, `dominant_gaps`). 13 çapa dosya + satır atfıyla.
**Ölçülemeyen 27 alan null:** hareket (0 transition/animation — tokens.js'in değerleri korunmalı), breakpoint (iki
sabit artboard), hover/loading (style-hover 0 kullanım). **Çelişki çözümü:** display 46px (hero) ile heading_1 34px
(sayfa başlığı) ayrı kademe; ana sayfanın 6 tek-kullanım hex'i nötr ölçeğe alınmadı.
**Design'ın üç uyarısı:** boşluk ölçeği 4'ün katına yuvarlanamaz (çizim değişir) · `radius-panel: 8px` ayrı token
olmalı · hareketin boş gelmesi karar, madde 81 ilk hareket kümesini getirecek.
K18-a ve K18-b karar satırları + dört fazlık plan `Ürün Seçici Karşılaştırma.dc.html`'e işlendi.

**Sıradaki (OPS onaylı):** emir #7 sırası — **1** Ürün Seçici A+C → v17'ye kare (K18 KARAR, A+C bir daha sorulmaz;
`Ürün Seçimi Alternatifleri v3` ARŞİV) · **2** hikâye sayfası v17'ye kare (K25-b tokenler, `TeknikTablo` v2 +
`KarsilastirmaTablosu` mount; adres hükmü: `/tr/products/<aile>` = hikâye hedef, 07/07b/07c/07d "BUGÜNKÜ (canlı)") ·
**3** 6 eksik ekran (404 · teklif teşekkür · nasıl teklif alınır · Hesap satış hâli · footer Yasal satış hâli ·
payment-success). Sıra 0 (token çevirisi) **bitti**: 679 ham hex → token, ham hex 0.
**Design önerisi (emir #8, karar OPS+Recep'te):** madde 1 **prototip** çizilsin (A/C dokunuş sayısı ancak
çalışan prototipte ölçülür; bugünkü "6–7 / 7–11" tahmin), madde 3 statik kalsın. Yetenek envanteri
`kabuk-v2-notlar.md` → "Yetenekler": 19 yetenek, fiilî kullanım **0/19**.
**Beklemede:** üç bileşen mount'u (`Cip` dört rol · `Kart.dolgu` 106 kart · `TeknikTablo.basliklar[]`) — kalıpla
değil kare bağlamıyla yapılacak, emir #7'nin 1→2→3 sırasında.

### Recep'in bulduğu UX iyileştirmeleri — emirde YOK, sıra dışı bekliyor (2026-09-06)
Recep sordu: "menü gösteriminde iyileştirme var mı, kullanıcı ürün detayında en iyi hâline mi bakıyor?"
Dürüst cevabım üç kusur çıkardı; **hiçbiri emir #7'de yok**, kayıt için buraya yazıldı. Bunlar bileşen adayı
olduğu için kimlik kuralı gerekiyor (desen envanterinde 9 desen "kimlik kuralı gerekli" işaretli).

| # | Kusur | Öneri |
|---|---|---|
| U1 | **Ekran 11 karşılaştırma statik tablo.** B2B'de gerçek ihtiyaç "farkı göster" | Aynı olan satırları katla, yalnız farklıları açık tut; seçili modeli sabitle (yatay kaydırmada kolon sabit kalsın) |
| U2 | **Bilgi Merkezi (ekran 14) en zayıf halka.** Uzun metin şablonu var, deneyimi yok | İçindekiler (44 px katlı satır var ama pasif) · arama · ilgili makale · "bu yazı hangi ürünü ilgilendiriyor" bağı |
| U3 | **Ekran 58 kendi tasarım kararını taşımıyor** — ekran 12'nin masaüstü yansıması | Masaüstünde panel yerine kalıcı sütun mu, yoksa 12'nin aynısı mı: karar gerekiyor |

**Ekran 12 iyi durumda** (K19 niyet grupları kurtardı) — ona dokunulmayacak.

### Dinamik ölçüm — 6 madde (Recep sordu, öneri Linear emir #8 yorumunda)
Recep: "karar verebilmem için tüm çalışmaları dinamik ölçmem lazım."

**KARAR (2026-09-06, Recep doğrudan): "statik istemiyorum, dinamik istiyorum ki doğru şekilde analiz
edebileyim."** Yöntem kararıdır — iş 1 (Ürün Seçici A+C) **çalışan prototip** olarak yapılır, statik
kare değil. Emrin kuralları aynı kalır, çıktı çalışır. Ayrıntı `DEVIR.md` §3b.

| # | Madde | Durum |
|---|---|---|
| D1 | **Çalışan prototip** — Ürün Seçici A+C gerçekten hesaplasın | emir #8'de OPS'a önerildi, karar OPS+Recep'te |
| D2 | **Gerçek veri JSON** — Supabase ölçümü projeye yazılır, prototip ondan okur (K18a: her sayı `technical_specs`'ten) | D1 ile birlikte |
| D3 | **Claude API prototipte** — serbest metin ("300 m² depo, koku problemi") → kanonik girdi kümesi; C kipinin gerçek hâli | D1'den sonra |
| D4 | **Oturum kaydı** (`localStorage`) — hangi adımda kaldı, kaç dokunuş; A/C karşılaştırması tahminden sayıya döner | D1'e eklenir |
| D5 | **Tweak anahtarları** v17'ye — kip (teklif ↔ satış), Hesap girişli/girişsiz, hareket. Kare sayısı düşer, iki hâl tek karede | bağımsız, ne zaman olsa |
| D6 | **Canlı site yanında ölçüm** — aynı akış prototipte ve venthub.com.tr'de: kaç tık, kaç saniye | D1 hazır olunca |

**Kritik kayıt:** `Ürün Seçici Karşılaştırma.dc.html`'deki "A 6–7 dokunuş · C 7–11 dokunuş" satırları
**tahmindir, ölçüm değildir.** Prototip yapılmadan o satırlara dayanarak karar verilmemeli — emir #8
yorumunda OPS'a bu cümleyle bildirildi.

**Eski sıra kaydı:** madde 81 (ürün sayfası v2 hikâye akışı) → 82 → Kabuk v2 dosyası — v15 kareleri üzerine, iki kip (satış kipi “kapalı bekler”, “ARŞİV”
etiketi kalkar), İletişim/Hesap iki hâl. Sonra Recep onayıyla Menü v16 + Ana Sayfa v10.
**Beklemede:** K13 matris sütun doluluk ölçümü depoda (`docs/audits/matris-sutun-doluluk-2026-09-05.md`, 19 grup;
Sulu Batarya grubunda matris sütunu yok → yalnız kart) — ekran 06 Tablo görünümü Faz 3'te o dosyadan okunur.

## Kabuk v2 teslim edildi (2026-09-05) — emir #1 + #2
`Menü Tasarımı v16.dc.html` (9 kare) + `Venthub Ana Sayfa v10.dc.html` + `kabuk-v2-notlar.md`. v15/v9 arşivde.
**Protokol v1.3:** emir artık dosya — "Linear" turunun ilk işi en yeni `ops-emir-*.md` + `bayat-*.md`; dosya kazanır,
Linear yorumu izdir.

**Çip GÖRÜLDÜ.** VentHub DS bağlı (`_ds/venthub-design-system-31b0824c…`): 4 token dosyası + styles + bundle ·
6 bileşen · 19 kart · 172 varlık · `templates/kabuk/`. İki dosyanın helmet'ine eklendi. **Broadsheet elle ezme bitti.**
Çip ↔ sözleşme çelişkisi yok; üç ekleme sözleşmeye yazıldı (muted token, arama alanı zemini, koyu bantta ikon sürümü).

**Sözleşme v1.2:** `spacing.shell_band` = 74 / 40 / 30 (`owns_its_gutter: true`; kök neden: eski oluk
`(genişlik−1060)/2`, 911 px'te 0) · `color.text_on_dark_muted` #8FA2BD 5,42:1 · `color.text_on_search_field`
beyaz / #24395C · `motion` ölçüldü ve **boş bırakıldı** (hover/focus/transition 0).

**Kabuk v2 değişiklikleri:** logo 19 CSS dilim çizimi → SVG (`clip-path` 0) · header sağı K19 (TR/EN çipi +
İletişim + Teklif + hesap; İletişim nav'dan çıktı) · alt çubuk 4. sekme **Hesap** · bant bileşenden 74 px (sarma davranışı mount içindeki sarmalayıcı çocukta),
`max-width` bant içinde yok · arama alanı #24395C + beyaz içerik · uzun çizgi oran kuralı (21 → 10, arayüzde 0).

**Çip BİLEŞENLERİYLE kuruldu (tur içi denetim düzeltmesi).** İlk teslimde bundle yüklüydü ama kullanılmıyordu
(`x-import` 0, `var(--*)` 0, 15 elle çizilmiş bant). Düzeltildi: **15 `KabukBandi` mount'u** · **11 `CerceveliDugme
koyu-zemin`** (TR/EN) · renk ve tipografi tokene çevrildi (v16 609 · v10 105 dönüşüm; `var(--*)` v16 647 · v10 113).
Canlı ölçüm: bant 74/40/30 artık bileşenden geliyor. **Kural: bundle yüklemek yetmez, bileşen mount edilir;**
`prompt.md`'den sayı kopyalamak bileşenin yerine geçmiyor. **İkinci kural: `<x-import>` üzerindeki `style` bileşene
GEÇMEZ** (mount sarmalayıcısı `display:contents`); yerleşim mount'un İÇİNE tek sarmalayıcı çocuk olarak yazılır —
`oluk`/`aralik`/`yukseklik` propları geçer, `style` geçmez.
`prompt.md`'den sayı kopyalamak bileşenin yerine geçmiyor. Bağlı `_ds` kopyasında `assets/` olmadığı için logo
türev kopya olarak `brand/logo/`'dan geliyor.

**Çip ↔ 15A iki sapma, ÇİZİLMEDİ (emir #2):** (a) DS Kabuk şablonu header'ın üstünde **30 px utility şeridi**
tutuyor (`utilityGoster`), 15A'da utility bar kaldırılmıştı — karar bekliyor · (b) DS şablonu header'daki Teklif'i
düğme yapıyor, K19 metin öğesi diyor — K19 uygulandı. Önceki "çelişki yok" iddiam bileşenleri okumadan
yazılmıştı, **yanlıştı**.

## DS çipi tazelendi + emir #4 envanteri (2026-09-06)
**Çip yeniden seçildi**, kılavuzda üç yeni kural vardı; ikisi zaten sağlanıyordu, biri ihlaldi.
- ✅ Koyu bantta `koyu` ikon sürümü: koyu zeminde kategori ikonu **0** (kural sağlanıyor)
- ✅ Turkuaz koyu zeminde küçük metin: `--brand-cyan` metin olarak **0**
- ❌ **Marka listesi yedi + "sayı yazılmaz"**: "5 marka" dört yerde yazılıydı. Kılavuz listeyi
  **yedi** marka olarak veriyor (Casals ve Flexiva dahil) ve gösterimde sayı yazılmasını yasaklıyor.
  Düzeltildi: giriş paragrafı "yedi marka", M2'deki "5 marka" sayısı kaldırıldı.
- ✅ **STORM** doğru kullanılmış: 14 kullanımın hepsi ürün serisi (STORM 40, STORM-40-PP, seri süzgeci),
  marka listesinde değil — kılavuzun "Storm marka değildir" kuralına uyuyor.

**Desen envanteri (K27):** `desen-envanteri-2026-09-06.md` + `.json`. Beş dosya tarandı, **24 desen**
ölçüldü: aday **17** (≥2 ekran), aday değil **7**. DS'te tam karşılığı olan 3, kısmi 4, **karşılığı hiç
olmayan aday 10**. Kimlik kuralı gerektiren 9; en acil üçü rozet yazımı (115 kullanım, 6 tür) · hüküm
kutusu tonları (39) · fotoğraf kutusu kuralı (17).
**Envanterden çıkan çelişki:** DS'te `Kart` · `Cip` · `TeknikTablo` **var** ama v17'de üçünün mount sayısı
**0** — tablolar, kartlar ve çipler elle çizili. K27'nin "ekranlar bileşene döner" adımı yalnız yeni
bileşenleri değil **mevcut üçünü de** kapsıyor. Önerim: yeni bileşen üretmeden önce mevcut üçü mount
edilsin — `TeknikTablo` 44 kullanımla en yüksek getirili, `Cip`'e varyant rolü eklenmesi 35 kullanımı
kapsıyor. Ölçüt: elle çizim 0.

## Emir #5 · bağımsız ölçüm uzlaştırması (2026-09-06)
OPS bağımsız ajana 13 iddiamı saydırdı: 7 tuttu, **3 tutmadı, 1 ölçülemedi** — dördü kapandı.
**(1)** Başlık "29" diyordu, ölçüm 30 etiket (2'si grup) / 28 tekil → tek tanım **"28 kare + 2 toplu bölüm"**.
**(2)** "opacity 0" yanlıştı, 2 etkisiz `opacity:1` vardı → kaldırıldı. **(3)** "ARŞİV · ÇİZİLMEZ (K24)"
`text-transform` ile render'da büyüktü ama **kaynak küçüktü** → kaynak büyük harfe çevrildi. **(4)** "83/88"
ölçüt hatasıydı: 88'in hepsi `KabukBandi`, elle bant 0 → **88/88**.
**Ek:** 21 `box-shadow:inset 0 -3px 0 #0088b0` (aktif sekme alt çizgisi) ham hex'ti → tokene döndü; marka
renklerinin ham kullanımı **0**.
**Ham hex beyanı** `ham-hex-beyani-2026-09-06.md`: ölçüt = ham hex ihlaldir **ancak DS'te yayınlanmış token
karşılığı varsa**. A kümesi 132 → **0**. Kalan 867 = B 676 (DS ölçtü, token yayınlamadı; `#d8d8d4` 426 DS'in
kendi `kenar.css` ölçüm bloğunda adı yazılı ama tokensiz) + C 64 (sözleşme v1.2) + D 125 (semantik kutular,
DS "bilinçli eksik"). **"Ham hex 0" imkânsız hedef; doğru beyan "A kümesi 0".** Marka'ya istek:
`--border-input` #D8D8D4 · `--border-row` #F2F2EE · `--surface-subtle` #FBFBF9 → B 676'dan 32'ye iner.
**Kontrol listesi 18. madde: sayı beyanı ölçütüyle yazılır** — ölçütsüz "0" bağımsız ölçümde çürür.

## K25-b uygulandı — Marka iki token yayınladı (2026-09-06)
DS'te **`--brand-cyan-ink`** (#00708F · beyazda 5,65 · sayfada 5,13 · "küçük metin, bağlantı ve sayaç/rozet
zemini") ve **`--action-terracotta-deep`** (#BF5309 · beyaz metinle 4,71 · "dolu kiremit düğme zemini") var;
`--action-terracotta` artık "metin zemini değil" diye işaretli.
**Bekleyen sorum kapandı ve cevabım yanlıştı:** "turkuaz zeminde AA imkânsız, zemin lacivert olmalı" demiştim;
Marka'nın cevabı **turkuazı koyulaştırmak** — rozet imzasını koruyor ve AA geçiyor.
Düzeltme: kiremit düğme zemini **36** → `-deep` (3,87 → 4,71) · sayaç/rozet zemini **73** → `-ink` (4,02 → 5,65) ·
mono bölüm etiketi **178** → `-ink` (geçici `--text-body` bitti, marka turkuaz imzası geri).
**Kendi tutarsızlığım:** `AnaEylemDugmesi` mount'u 6 yerde `-deep` render ediyordu, yanındaki **32 elle yazılmış
kiremit düğme** düz turkuaza dayanıyordu — bileşen doğruyu yapıyordu, elle yazdığım kardeşi yapmıyordu.
**Ölçüm:** `--brand-cyan` metin 0 · `--action-terracotta` metin 0 **ve zemin 0** · `-ink` 251 · `-deep` 36.
Kalan 57 turkuaz zemin metin taşımıyor (bildirim noktası, ilerleme/durum çizgisi) — 3:1 eşiği, 4,02 ✓.
**REC-152'nin beş maddesi de kapandı**, açık madde yok.
**Kontrol listesi 17. madde: DS token dosyası her turda yeniden okunur** (Marka bekleyen soruyu yeni token
yayınlayarak cevaplayabilir); ve bir DS bileşeni doğru değeri render ediyorsa elle yazılmış kardeşi aynı değeri
taşımak zorundadır — fark, bileşeni kullanmadığımın kanıtıdır.

## K24 + K25 uygulandı (emir 09-06 #2)
**K24 · B4 kapandı:** Ürün Seçici girişi **header**; ızgara alternatifi ARŞİV etiketiyle bırakıldı (karar kaydı
değeri). **Denetim düzeltmesi:** o etiketi ilk yazımda notta beyan edip **karede çizmemiştim** (`ARŞİV`/`SEÇİLDİ`
0 kullanım) — A bloğuna kesikli `ARŞİV · ÇİZİLMEZ (K24)`, B'ye `SEÇİLDİ · K24` eklendi, bayat meta
("karar Recep'in") ve "Design önerisi B" hüküm diline döndü. **Kontrol listesi 17. madde: bir karar notta
"uygulandı" yazılmadan önce karede ölçülür.** **K25 · dört renk:** mono bölüm etiketi → `--text-body` (geçici, `--brand-cyan-ink` bekliyor, 153) ·
koyu bantta "▼" beyaz 10 px (34) · artboard kare etiketi → `--text-body` (52) · bağlantı hover'ı renk yerine
alt çizgi. **`--brand-cyan` metin olarak 0 · `--action-terracotta` metin olarak 0** (hedef 0 ✔).
**Hükmün bir sayısı tutmadı:** "turkuaz üstüne lacivert ≥7:1" dendi, **ölçüm 3,47** — beyazdan (4,02) daha kötü.
Uygulayıp ölçtüm, geri aldım; sayaç beyaz kaldı. Turkuaz zeminde 11 px hiçbir metin AA geçmiyor; AA isteniyorsa
zemin lacivert olmalı (13,92) ama o turkuaz sayaç imzasını bitirir. Karar OPS'ta.
**Üç kendi hatam:** (1) değiştirme değerim `color:` önekini taşımıyordu → 205 geçersiz bildirim, onarıldı ·
(2) zemini stilden tahmin ettim → koyu bantta 25 öğe 1,85'e düştü, **bant bölgesine göre** yeniden yapıldı ·
(3) açık-katman muafiyetim yan yana bildirim arıyordu → 12 öğe beyazda 2,6, panel kalıplarıyla düzeltildi.
**Son hâl: benim tarafımda ihlal 0**; kalan 105 marka eşleşmesi (beyaz/turkuaz 4,02 × 72 · beyaz/kiremit 3,87 × 33).

## Emir #4–#8 KABUL (OPS, 2026-09-06) + sayım farkının cevabı
İki hüküm: **yeniden numaralandırma YOK**, `02-ana` kalır · Markalar satırındaki gri-ton kaldırma doğru.
**Sayım farkı (OPS sorusu 1):** v15 masthead'i "29 kare" diyor, dosya 26 `data-screen-label` taşıyor; fark
**3 kare, hepsi `52` bölümünün içinde** — o bölüm tek etiket altında dört adlı kare taşıyor (52a arşiv ·
52b seçildi · 52b dil çipi · **53 Hesap yaprağı**). 26 bölüm + 3 = 29. Kayıp kare yok, dördü de v17'de.
Benim "26 + B4 = 27" beyanım DOM etiketi sayımıydı; adlı kareyle 29 + B4 = 30.
**Kontrol listesi 16. madde: kare sayısı beyan edilirken sayım tanımı yazılır** (DOM etiketi / adlı kare).

## Denetim düzeltmesi (2026-09-06): S1–S5 mobil + hero arama alanı
**S1–S5'in 390 eşleri yoktu** (emir #8 "masaüstü + 390" diyordu, ilk teslimde yalnız S6'da vardı) — beş mobil
kare çizildi, M4 üst şeridi + dört sekmeli satış alt çubuğuyla; her biri ölçek büyütmesi değil ayrı kompozisyon.
**`02-ana`nın iki hero arama alanı 1,54:1** okunmuyordu: kanonikleştirme taramam kutuyu metninden buldu,
"koyu bandın soyundan mı" koşuluyla sınırlamadı → gövdedeki alana koyu bant zemini verdi. İmzadan tanınıp
(`#24395C` zemin + `solid #d8d8d4` açık-yüzey kenarı) açık yüzeye döndürüldü.
**Kontrol listesi 15. madde: kabuk öğesi taraması DOM konumuyla sınırlanır** (`closest('header')`), metin
eşleşmesiyle değil — metin öğeyi bulur, bağlamını bulmaz. (Aynı sınıf hata dördüncü kez.)
**Ölçüm:** 30 kare · S1–S5 1440+390 çifti · ham `x-import` 0 · 88 bant · kırık görsel 0 · benim tarafımda
kontrast ihlali **0** · 878 KB.

## Emir #6 · #7 · #8 uygulandı (2026-09-06) — tek dosya, soluk işaret, satış kipi
**#6 tek dosya:** Ana Sayfa ayrı dosya olmaktan çıktı → v17'nin `02-ana` karesi; `ARSIV Venthub Ana Sayfa v11`
arşivde. Emir "02 karesi" diyor ama 02 menü panelinde — görünen etiket "EKRAN 02 · ANA SAYFA", DOM etiketi
`02-ana`; yeniden numaralandırma istenirse ayrı tur.
**#7 soluk işaret (K23-b):** `venthub-isaret-soluk.svg` + `-soluk-koyu.svg` DS'ten türev kopya (`brand/logo/`,
2026-09-06). **`filter` 0 · `opacity` 0** — marka logolarındaki `grayscale+opacity` da kalktı (GB1 m.7).
**#8 satış kipi S1–S6:** Sepet · Ödeme (4 adım) · Sipariş onayı · Siparişlerim+takip · İade · Header/alt çubuk
satış hâli. Hepsi "KAPALI BEKLER · NEXT_PUBLIC_ODEME_ACIK". Alan adları **canlı şemadan** doğrulandı, uydurma
alan yok. REC-47 uygulandı: kargoda sabit "Ücretsiz" yazmıyor.
**Ölçüm:** 30 kare · şablon dışı 0 · ham `x-import` 0 · 83 bant hepsi `KabukBandi` · kırık görsel 0 · 830 KB.

## Kontrast turu 2 (denetim, 2026-09-05) — görünmez metin + atladığım kiremit
**Görünmez metin:** kare 08c'nin arama öneri paneli koyu bandın içine yazılmış, kendi metin rengi yok, rengi
banttan kalıtımla alıyordu; panel beyaz zemine binince **beyaz-üstüne-beyaz, 1:1** oldu (5 kullanım).
Düzeltme: koyu bandın içindeki açık katman kendi rengini taşır. **Ders: bileşen mount'u renk kalıtımı getirir.**
**Atladığım eşleşme:** beyaz / `--action-terracotta` = **3,87:1**, **30 kullanım**, sayfa başına tek ana eylem
("teklif iste" düğmeleri); ağırlık 600 olduğu için büyük-metin muafiyeti yok. Kendi betiğim 3,8 yazdırmıştı,
Marka setine yazmayı atlamıştım — eklendi.
**11 px:** `bas()` yardımcımın etiketleri 4,39'daydı; boy listesi yerine **kural** kondu (`--text-muted` +
boy<16px ya da kalıtımsal boy → `--text-body`; istisna mono olmayan 11 px sekme etiketi, kartta 4,83 ✔).
**Kendi semantik tonlarım:** #4C8BA1→#2C6B82 · #B4761F→#8A5A13 · #2E7D4F→#256540.
**Son hâl: benim tarafımda ihlal 0**; kalan 298 kullanım marka renk eşleşmesi, hepsi REC-152'de.
**Kontrol listesi 14. madde: kontrast denetimi iki kümeye ayrılır** (benim düzelteceğim / Marka kararı) ve
ikinci küme eksiksiz yazılır.

## Arama alanı düzeltmesi (denetim, 2026-09-05) — literal eşleştirme üçüncü kez atladı
**Kök neden:** arama alanını tek literal kalıpla dönüştürdüm, kaynakta üç genişlik varyantı vardı (408 · 409 · 354);
16 alan Kabuk v2 öncesi hâlde kaldı — zemin `rgba(255,255,255,0.07)`, metin `--text-on-dark-muted`, gerçek
kontrast **4,38:1**. Üç ihlal birlikte: emrin `#24395C` kuralı, K22 alfa yasağı, kontrast eşiği.
**Düzeltme yapısal:** alan biçiminden değil metninden ("Model kodu veya ürün adı") bulundu; 27 dönüşüm.
Ölçüm: 37 alanın **hepsi** `#24395C` + beyaz (≈6,9:1); 6 şeffaf kutu sarmalayıcı, kusur değil.
**Kalan alfa 7 × `rgba(26,43,74,0.45)`** = örtü perdesi, kasıtlı ve gerekçeli (K22 metin/token için).
**Kontrol listesi 13. madde: K22 denetimi `background` içindeki `rgba(` da sayar** (istisna: örtü perdesi).

## Açık zemin kontrast düzeltmesi (denetim, 2026-09-05)
K22 koyu zemini kurtarmıştı, **açık zemini hiç ölçmemişim** — aynı 11 px, aynı hata. Ölçüm: `#8A8F94` beyazda
**3,26** · sayfa zemininde **2,96** · `#B9BCC0` **1,91 / 1,73** · `--text-muted` beyazda 4,83 ama **sayfa
zemininde 4,39**. Düzeltme (765 dönüşüm): soluk tonlar → `--text-muted`, sayfa zeminindeki küçük metin →
`--text-body` (6,83). En kritiği alt çubuğun **99 sekme etiketi** 3,26 → **4,83**. Hiyerarşiyi artık boy ve
ağırlık taşıyor, üçüncü gri yok.
**Marka kararı bekleyen dört eşleşme çizimde değiştirilmedi** (hepsi DS tokeni): beyaz/turkuaz sayaç **4,02** (59×) ·
turkuaz/açık zemin mono etiket **3,61–4,02** (72×) · turkuaz/lacivert "▼" **3,47** (27×) · kiremit/sayfa kare
etiketi **3,52** (28×). Önceki "token boşluğu" bulgum yarımdı: istek "token ver" değil **"kontrast düzeltilmiş
token ver"**. **Kontrol listesi 12. madde: açık zemin küçük metni de renk/zemin/boy üçlüsüyle tek tek ölçülür.**

## Mobil kabuk M1–M9 çizildi (emir #5, 2026-09-05)
Recep "mobil menü yarım mı kaldı" dedi; haklıydı — kabuk iskeleti vardı, içi yoktu. Dokuz kare 390 olarak
`M1-M9` bölümüne çizildi: **M1** İletişim alt paneli üç niyet grubu · **M2** Ürünler sekmesi bir sayfa (örtü
değil; Ürün Seçici satırı, Teklif düğmesi yok) · **M3** Hesap iki hâl (girişsiz/girişli) · **M4** iç sayfa üst
şeridi "‹ geri · başlık · arama" dört bağlamda · **M5** girişli kısayol şeridi · **M6** Teklif sekmesi sayfası +
kapalı Sepet hâli yan yana · **M7** PDP yapışık çubuk + "soru sor" simgesi · **M8** bildirim rozeti girişli/girişsiz ·
**M9** geri dönüş hâli. Her altyazıda dayandığı karar (K9/K16/K19 madde no) yazılı. Ayrıntı ve M1–M9 tablosu
`kabuk-v2-notlar.md`'de.
**Ölçümde iki ihlal çıktı, düzeltildi:** M6 adet kontrolü 36 → 44 px · "Not ekle" ince metin bağlantısıydı (S2)
→ çerçeveli düğme.
**B4 kusuru:** kare `</x-dc>` dışına eklenmişti, DC işlemedi — bileşenler mount edilmemiş ham etiket kalıyordu,
metin açık zeminde 2,36:1 kontrastla okunmuyordu. Şablon içine alındı. **Kontrol listesi 11. madde: her karede
`querySelectorAll('header').length ≥ 1` ve belgede ham `x-import` 0.**

## Kabuk v2 · 27 kareye yayıldı (emir #4, 2026-09-05)
Recep "ana sayfa ile menü birbirini tutmuyor" dedi; kapsam 8 temsilî kareden **27 kareye** çıktı.
`Menü Tasarımı v17` (27 kare) + `Venthub Ana Sayfa v11`; v16/v10 arşivde.

**Ölçülen son hâl:** 55 header + 2 footer bandının **hepsi** DS `KabukBandi` mount'u (elle bant 0) · 26
`CerceveliDugme` · ham `#1a2b4a` **0** · `var(--*)` ~4.100, çözülmeyen **0** · 25 masaüstü bandin hepsinde İletişim
**tam bir kez** (sağda, nav'da 0) · 24 alt çubuğun hepsi **Ana sayfa · Ürünler · Teklif · Hesap** · "Destek"
sekme/yaprak adı olarak **0** · K19 niyet grubu **9** · kırık görsel 0 · bant taşması 0.

**K19 madde 3 uygulandı:** İletişim alt paneli kanal adıyla değil **niyetle** gruplandı — "Teklif ve sipariş"
(WhatsApp · Ara, müşteri temsilcisi) · "Ürün seçimi ve teknik soru" (teknik destek formu · e-posta, mühendis) ·
"Arıza ve garanti" (çizildi, **KAPALI BEKLER**, satış kipiyle açılır). İki panelde de.

**Yöntem düzeltmesi (10. madde uygulandı):** kalıp eşleştirme yerine **yapısal** dönüşüm — bant açıcısını bul,
dengeli kapanışını bul, mount'a çevir; sonra logo/nav/arama/sağ blok ayrı ayrı. Varyasyon (sayaç, aktif hâl)
artık dönüşümü engellemiyor.

**İki bulgu OPS'a yazıldı:** (a) emir #4'ün "v16'da KabukBandi 0" ölçümü **bayat kopyadan** — o an 15 mount vardı ·
(b) **DS token boşluğu:** sözleşme 15 nötr ölçtü, DS 4 yüzey + 1 kenar veriyor; tokensiz kalan ölçülmüş nötrler
#8A8F94 (313) · #B9BCC0 (167) · #D8D8D4 (325) · #FBFBF9 (62) hex olarak duruyor, Marka'dan istenmeli.
Ayrıca `#3F4A5A` (36 kullanım) token dönüşümünde `--text-body` ile birleşti — kayda geçti.

**Kabuk tutarlılık düzeltmesi (Recep gözlemi, 09-05).** K19'u kare kare kalıp eşleştirerek uygulamışım; 13 bandın
6'sında İletişim hem nav'da hem header sağındaydı, v16 kare 01'in mobil header'ı v15 hâlinde kalmıştı ve ana sayfa
(v10) ile menü (v16) aynı ekranı farklı çiziyordu. Düzeltildi: nav'dan beş İletişim kaldırıldı, v16 kare 01'in mobil
header'ı v10'daki satırın birebir kopyası oldu. **Kontrol listesi 10. madde: kabuk öğesi kanonik blok olarak
değiştirilir, teslim öncesi her bandın öğe listesi ölçülür ve iki dosya karşılaştırılır.**

**Kabuk v2 KABUL (OPS emri #3, 09-05).** Çip sayımı tuttu, çelişki 0, 8 madde dolu; kare-bazlı `</div>` dengesi
kontrol listesinin **9. maddesi** oldu. REC-152 cevapları: kategori ikonu zemin kuralı (açık → `tamrenk`, koyu
`#1A2B4A`/`#0F1723`/`#24395C` → `koyu`; ölçüldü, v16'da koyu zeminde ikon 0, değişiklik gerekmedi) · soluk sekme
filtresi geçici kabul (Marka `-soluk` dosyaları gelince filtre kalkar) · B4 Recep'te.
**Sıradaki, Recep "olur" demeden başlanmaz:** `Prototip Kabuk v2.dc.html` (Interactive prototype) — 8 karenin
akışı + B4'ün seçileni + Hesap iki hâl.

**B4 karesi:** Ürün Seçici menüde nerede — A senaryo ızgarasında sekizinci kutu / B header'da kendi girişi.
**Design önerisi B** (madde 37 gerekçesi; ızgaranın sekiz kutusu bozulmaz). K18-b grup sekmesi üç hâl aynı karede.

**Tur içinde bulunan kusur:** v15'in 12. karesinde fazla, 52. karesinde eksik bir `</div>` vardı; dosya toplamında
birbirlerini götürdüğü için görünmüyorlardı. **Bundan sonra denge kare bazında ölçülür.**

**REC-152'ye beş soru:** B4 kararı · koyu bantta kategori ikonu sürümü · **utility şeridi (DS'te var, 15A'da yok)** ·
**header'da Teklif düğme mi metin mi** · soluğan sekme için Marka'dan `-gri` sürüm istenmeli mi (şimdi `filter:grayscale`).

**Sıradaki:** Recep onayı → 29 kareye yayılma → ayrı turda tıklanabilir prototip (emir: bu turda prototip yok).

## K22 · K23 · madde 81 (2026-09-05)
**K22 · alfa yasağı.** Durum (çizilmez · arşiv · yetersiz · kapalı) `opacity` ile değil **soluk hex + zemin +
rozet** ile anlatılır. Yedi ihlal düzeltildi (Karşılaştırma B kartı 0.72 → rozet 2,6:1 ölçüldü; Alternatifler v3
C akışı 0.45; Menü v15'te varyant kartı 0.5 ×2, 52a 0.55, Hesap yaprağı 0.7 ×2, Satış kipi 0.62). Kalan 10
`opacity:0.5` yalnız marka logo şeridinde (`<img>`, metin değil).

**K23 · logo elle çizilmez.** Marka işareti yalnız `brand/logo/` SVG'lerinden. CSS `clip-path` çizimi yasak —
dilim dizilimi (kiremit · beyaz · **beyaz** · turkuaz) elde yazılınca hata çıkıyor. Madde 81'in iki çizimi aynı
turda SVG'ye çevrildi; **v15 ve v9'daki mevcut CSS çizimi Kabuk v2'de döner, geri gidilmez.**

**Sözleşme v1.1:** `iconography.stroke: 1.5` tek kaynak (Marka'nın 1.4'ü ve eski README'nin 1.6'sı bayat) +
`logo_rule` alanı + K22 cümlesi `contrast_strategy`'ye eklendi.

**Madde 81 teslimi:** `Urun Sayfasi v2 Hikaye.dc.html`. Altı bölüm altı ayrı aile, ardışık tekrar yok. Systemair'ın
altı bloğundan **Kontrol** çizilmedi (`has_timer`/`has_humidistat` 12/12 false, 0-10 V verisi yok) — yerine **Ses**
bölümü (12/12 dolu, 25–45,4 dB); **Belge** çizilmedi (şemada tablo yok). 3D imza hareketi yerine katmanlı kesit
(GLB 0/374). Hareket emniyeti: gözlemci tetiklenmezse 900 ms + ilk scroll/visibilitychange içeriği açar — hareket
bir katkı, içeriğin koşulu değil.

**Madde 82 uygulandı (2026-09-05):** `madde82-denetim-2026-09-05.md`. Düğmeler VARIANCE 4 · MOTION 3 · DENSITY 7
her turun başına. Beş güncel dosya anti-default listesine karşı ölçüldü: **11 ölçütte de 0 ihlal**. Beş yanlış
pozitif elendi (`Inter`→IntersectionObserver, `slate`→translateY, `transition:all`/`veri yok`/`yakında`→kural
metninin kendisi). Tek açık kalem **em dash 157 kullanım** — arayüz metninde hiç, hepsi altyazı/gerekçede;
Design önerisi tam yasak değil **oran kuralı** (altyazıda en çok bir, arayüzde hiç), OPS onayı bekler.
Sekiz maddelik Kabuk v2 kontrol listesi bu denetimden çıktı.

**Sıradaki (OPS emri):** **Kabuk v2**
(v15 kareleri, iki kip, İletişim/Hesap iki hâl, VentHub çipi; DS gelmezse elle ezilir) → teslimle **tıklanabilir
prototip** (ana sayfa → Ürünler → kategori → aile PDP → Teklif listesi → Hesap, 4 sekme, İletişim paneli, iki
alternatif Ürün Seçici menü yeri) → Recep onayıyla Menü v16 + Ana Sayfa v10.
**İçerik hattı bulgusu (OPS 09-05):** 24 marka PDF'i Systemair kalıbında başlık taşımıyor — altı bölüm kopyalanmaz,
derlenir. Aile kapsaması 19/40. **JET ve STORM'un Türkçe anlatımı AVenS fiyat listesi s.41–43 ve 45'te** — örnek
sayfa çizerken oradan ölçülebilir.

## Systemair incelemesi (2026-09-05) — `systemair-incelemesi-ve-kabuk-v2.md`, Linear'a yazıldı
Üç boşluk: **seri sayfası yok** (sku'suz adres ilk modele düşüyor) · ürün anlatımı serbest paragraf → **Gövde · Çark ·
Motor · Koruma · Kontrol · Montaj** sabit blokları (boş çizilmez) · **Kataloglar/İndirmeler sayfası yok**, belge tipleri
sayılmamış. Ek: kimlikte veriden 4 kalın madde; kategori anlatım moduna kısa rehber. Korunur: Konuşan tablo, tek sayfa
seçici, C kipi. **Kabuk v2 düzeltme:** dil Hesap'a gömülmez (OPS haklı) → mobil header sağı TR/EN + bildirim; Hesap
sekmesi uzlaşı; İletişim sekmesi Recep kararı, iki hâl çizilir. Terim: "yaprak" → "alt panel".

## Kabuk v2 önerisi — SUNULDU, çizilmedi (2026-09-05; Linear'a yazıldı, OPS gözden geçiriyor)
Referans sentezi: Trendyol omurga (Hesap sayfası: kimlik kartı → 4 kare → gruplar) · X liste disiplini · Ziraat “Öne
çıkanlar” katmanı. Öneri (K9/K16, m.23/31/37, 52b, m.24 mobil'i değiştirir, Recep onayı ister): alt çubuk 4 sayfa
sekmesi **Ana sayfa · Ürünler · Teklif/Sepet · Hesap** (alt panel yok; “İletişim” sekmesi kalkar → Hesap/Destek + header) ·
Ürünler örtüsü → sayfa · arama iç sayfalarda ‹ geri · başlık · ikon · header sağı bildirim rozeti · Hesap sayfası =
AccountLayout grupları · girişli ana sayfa kısayol şeridi. **Çerçeve (GB9 m.77): site İKİ KİPLİ** — satış kipi çizilir,
“kapalı bekler”; “ARŞİV” etiketi yanlıştı. Proje = klasör (kod: `project_items`, ad+açıklama+adet). Terim: “yaprak” yerine
**“alt panel”**. Sıra: (1) GB8+GB9 sayım/düzeltme → (2) kabuk v2 ayrı dosya, v15 kareleri, iki kip → (3) v16/v10.
GB8 ve GB9 okundu, UYGULANMADI — 1. adımda.

## Referans: Ziraat Mobil (Recep gönderdi, 2026-09-04) — Design değerlendirmesi
Alınabilir: tam menüde “Öne çıkanlar” katmanı (üstte iki kare kart, altta düz liste) → bizde Ürünler örtüsünün üstüne
Ürün Seçici + Son baktıklarınız (madde 37 yerini aşağı koyduğu için Recep kararı, çizilmedi) · Kısayollarım şeridi →
girişli kullanıcı için Faz 4 (mobil-kisayol-oneriler ile uyumlu). Alınmaz: yan yana iki dolu düğme (tek kiremit kuralı),
yarıçap + gölge (marka), 5. sekme “Tüm Menü” (7 kategoriye gerekmez), header'da kişisel selam, kampanya bandı (K1).

## Bekleyen / bir sonraki tur
- Recep 52a/52b seçimi; K9/K16 ona göre yazılır.
- K18 şablon tablosu (OPS).
- Hero ve kart görselleri: 867 beyaz fonlu görsel Supabase storage'da; Design'ın erişimi yok. Bir örnek set (10-15 görsel) projeye eklenirse hero ve kartlar gerçek fotoğrafla güncellenir.
- Ürün fotoğraflarının tamamının bağlanması Faz 3.
- Bilgi Merkezi başlıkları ve hero sayıları veritabanından; tasarımda köşeli parantez.
- Senaryo bölümü ana sayfada yok — ürünler senaryo etiketi aldığında ayrı turda eklenir.
- `brand/` paketi (tokens + 96 SVG + kısa kılavuz) marka projesinden depoya elle eklenecek.

