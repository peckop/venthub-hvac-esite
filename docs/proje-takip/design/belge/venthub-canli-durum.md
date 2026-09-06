

# VentHub — CANLI DURUM ve KAPALI KARARLAR (tek kaynak)

Bu dosyayı Claude Code (OPS orkestratör) yazar; her Design oturumu işe başlamadan ÖNCE okur.
Kaynak: canlı veritabanı ölçümü 2026-09-03 + Linear REC-129. Bu dosyadaki bilgiyi Recep'e
YENİDEN SORMA; çelişki görürsen dosyayı esas al, farkı bir satırla not düş.

## 1. Ticari model — KAPALI
- Site TEKLİF ODAKLIDIR. Fiyat, indirim, KDV, toplam, stok adedi, sepet, ödeme YOKTUR.
- Her üründe iki eylem: "Teklif iste" (birincil, kiremit; bu model için doğrudan talep) + "Teklif listesine ekle"
  (ikincil, çerçeveli). Tek fiil "Teklif iste"; "Teklif al" hiçbir yerde yok. HEADER (geri-bildirim-2 madde 24, en yeni karar): sağda TEK
  öğe "Teklif (n)" + hesap simgesi; ayrı "Teklif iste" ve "Teklif Listesi (n)" düğmeleri YOK. "Teklif (n)" Apple çanta
  paneli açar: liste (≤3 kalem) + tek kiremit düğme ("Teklif talebini gönder" / liste boşsa "Teklif iste") + sessiz
  bağlantılar (Teklif iste · Tekliflerim · Projelerim · Yeni proje · Favorilerim). Gövdedeki kiremit düğme sayfaya özel
  ve etiketi özel ("Bu model için teklif iste", "Projeniz için teklif iste"). Kural: sayfanın işini bitiren eylem kiremit,
  gerisi çerçeveli. Referans v11'deki fiyat/KDV/sepet dili Teklif kipinde ATILIR (kapalı karar §1), "sepet" → teklif
  listesi; fiyatlı hal geri-bildirim-2 madde 21'deki Satış kipi artboard'unda ARSIV olarak çizilir.
  (Düzeltme notu: önceki "listeye ekle birincil" satırı OPS eklemesiydi, Recep kararı değildi.)
- Bayi girişi / bayi fiyatı hiçbir ekranda geçmez.
- "Yakında", boş dal, boş kategori, vaat kutusu YOK. Vitrin yalnız var olanı gösterir.

## 2. Katalog gerçeği (canlı DB, 2026-09-03)
- 375 ürün, 40 seri/aile. Görsel: 867 beyaz fonlu izole ürün fotoğrafı. Kategori/dal/senaryo tanıtım görseli YOK.
- Markalar (ürün sayısıyla): Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 · Danfoss 35.
  Casals ve Storm MARKA DEĞİLDİR (Storm bir SEAT serisidir). Marka şeridinde bu beş marka vardır.
- Canlı üst kategoriler (ürün): Fanlar 295 · Kontrol Sistemleri 37 · İklimlendirme ve Hava Şartlandırma 17 ·
  Isı Geri Kazanım (VMC) 16 · Hava Perdeleri 8 · Aksesuarlar 2. Sığınak bugün Fanlar altında alt kategori (3 ürün).
- Canlıda 7 BOŞ eski üst kategori var (Summer Ventilation, Smart Home, Hygiene and Sanitizer, Commercial
  Ventilation, Residential Ventilation, Electric Heating, Air Conditioning) ve boş alt dallar (Otopark Jet,
  ATEX, Pencere, Dikdörtgen Kanal…). Bunlar tasarımda YER ALMAZ; üretimde temizlenecek.
- Hava Arıtma: ürün YOK. Kategori, yeşil vurgu ve ikonlar yalnız altyapı hazırlığıdır; tasarımda
  görünmez, menüde yer almaz. Ürün gelince açılır. Atıksu Arıtma senaryosu da gündemde DEĞİL:
  menüde/senaryo listesinde yer almaz (senaryo listesi 8), ikonu arşivde kalır (Recep kararı 2026-09-03).
- Kiremit #D95D0E KALIR (Recep teyit); kural: her sayfada tek dolu kiremit; kiremit üstünde beyaz yazı yalnız
  butonda, ≥15 px / 600; küçük metin kiremit üstüne konmaz.
- Canlı URL: /tr/category/<slug>, /tr/products/<seri-slug>, /tr/brands/<slug>; 192 URL (96 TR + 96 EN).

## 3. Kategori ağacı — KAPALI (Recep 2026-09-03): 15A menü projesinin ağacı
- 7 kategori · 26 dal · üçüncü seviye YOK (her ayrım faset). Sığınak ÜST kategori.
- Adlar ve slug'lar: "E-ticaret menü tasarımı" projesi README §3 tablosu esastır.
- Boş dallar (Plug Fanlar, Hücreli Aspiratörler) ürün atanana kadar görünmez.
- KATEGORİ ADRESLERİ DEĞİŞİR (Recep kararı 2026-09-03): 15A'nın kısa slug'ları, /category/ parçası kalkar
  (/tr/fanlar/korozyon-dayanimli). Eski adresler 301 ile yeni adrese gider, hepsi aynı yayında.
- ÜRÜN ADRESLERİ DEĞİŞMEZ: /tr/products/<seri> kalır; model seçimi seri sayfası içinde. 15A'daki
  "ürünü kategori altına model bazlı taşıma" uygulanmaz. Model bazlı ayrı sayfalar Faz 3 içinde ayrı
  kararla açılır (bkz. §7); açıldığında adres kaldırmaz, ekler. Marka ve statik sayfalar aynen kalır.
- KURAL: Design'ın her önerisi "Recep kararı" / "Design eklemesi" diye ayrılır; ekleme, Recep evet demeden
  karar sayılmaz ve bu dosyaya girmez.

## 4. Kimlik — KAPALI (Marka kılavuzu, "Venthub e-ticaret logo tasarımı" projesi)
- Logo 14A-3, wordmark "VentHub" (Archivo Bold 700, −0.03em). VENTHUB yazımı YASAK.
- Palet: lacivert #1A2B4A · turkuaz #0088B0 · kiremit #D95D0E (yalnız logo üst dilimi + birincil buton) ·
  amber #F59E0B yalnız arayüz uyarısı. Macenta YOK. Yeşil #3D7A1E yalnız Hava Arıtma sayfaları (bugün yok).
- Yazı tipi: Archivo (arayüzün tamamı: menü, buton, kart, tablo, filtre, başlık) · Source Serif 4 (yalnız uzun
  açıklama metni) · IBM Plex Mono (model kodu, teknik etiket). Dördüncü aile YOK.
- Kabuk: koyu lacivert header + footer, AYDINLIK gövde. Kiremit sayfada tek sıcak nokta.
- İkonlar: 16 ikon (7 kategori + 9 senaryo), brand/icons/ altında 96 SVG. 26 dal için ikon ÇİZİLMEZ.
  İkon yalnız kategori ve senaryoda; buton, marka, faset, kürasyonda ikon YOK.

## 5. Üretim düzeni (Claude Code tarafı)
- Tasarım Design'da tek parça biter; üretim 4 fazda, her faz Vercel preview ile onaylı; canlı site dokunulmaz.
- Faz 1 kabuk (renk değişkenleri, yazı tipi, logo, header/footer) · Faz 2 ana sayfa + kategori/menü + URL geçişi ·
  Faz 3 ürün sayfası + kartlar · Faz 4 teklif listesi / hesap.
- Ana sayfa blokları içeriğini veritabanından alır (Recep kararı); tasarım bunu "bölüm aç/kapa/sırala" olarak varsayar.

## 5b. Canlı sitenin ikiliği — KAPALI KARAR (Linear REC-106, Recep 2026-09-01)
- Bugün canlıda aynı iş iki kalıpla yapılıyor: sayfa-başına özel görünümler (CategoryLandingView,
  SeriesLandingView, CategoryMasterView…) ile normal kategori/ürün sayfaları; kategori adı 4 ayrı yoldan,
  kategori verisi 2 ayrı hattan geliyor; güven/emniyet blokları sayfalara gömülü.
- Karar: 15A üretimi "sayfa başına özel görünüm" olarak DEĞİL, AZ SAYIDA ŞABLON + VERİ olarak yapılır
  (kategori şablonu ×7, dal şablonu ×26, liste, ürün sayfası, senaryo, teklif listesi). İki kalıp teke iner;
  eski özel görünümler üretim fazlarında kapanır. Tasarım bu yüzden ekranları ŞABLON olarak çizer:
  bir kategori şablonu, veri değişir; yedi ayrı kategori sayfası çizilmez.

- Ölçüm 2026-09-03 (REC-106 envanteri): kategori adı bugün tek kaynaktan basılıyor (müşteri yüzeyinde ham ad yok);
  kategori verisi ise hâlâ 5 ayrı müşteri hattından okunuyor; ürün görseli için PDP galerisi ayrı yol kullanıyor.
  Kategori sayfası zaten tek şablon (üç görünüm modu). Üretimde tek sunucu hattı + tek görsel çözücü kalır.
  Tasarım için anlamı: kategori sayfası ŞABLON, üç mod (vitrin / anlatım / seri listesi) aynı kalıptan.

## 5c. 3D — KAPALI KARAR (Recep, 2026-09-01, "teklif modu tutarlılık paketi")
- Vitrindeki 3D ürün görüntüleyici TAMAMEN KAPATILIR (aynı paket: /products sadeleştirme, Hızlı Sipariş kaldırma,
  menü birleştirme, mutfak kartı kaldırma — mutfak kartı canlıda kaldırıldı).
- Tasarımda 3D thumbnail, "3D yakında", 3D sahne YOKTUR. Design'daki "3D Kanal tipi fan modeli" projesi kullanılmaz.

## 7. Teknik alan kuralı — KAPALI (Recep 2026-09-03)
- HEDEF: her üründe teknik veri TAM olur; eksik veri kabul edilen değil, takip edilip tamamlanan şeydir.
  İlk aşamada giriş eksik olabilir (Recep: "ilk anda giriş zorunlu olmayabilir").
- GÖRÜNTÜLEME: üründe varsa satır gösterilir; yoksa satır HİÇ görünmez. Boş kutu, "belirtilmemiş", "—" olmaz.
  Sonradan girilen alan kendiliğinden belirir. Eksik alanlar admin tarafında liste olarak takip edilir (vitrin değil).
- Doluluk bugün marka bazında farklı: Vortice tam; SEAT/AVenS/Nicotra kısmi; Danfoss sürücü (debi/basınç olmaz).
  Tasarım teknik tabloyu 3 satırla da 12 satırla da düzgün duracak şekilde kurar.
- Model bazlı ürün sayfası (her modele kendi adres) ayrı kararla, Faz 3 içinde açılır; bugün seri sayfası + model seçici.

## 8. Ürün sayfası mimarisi — KAPALI KARAR (Recep 2026-08-25, Linear REC-65; 2026-09-03'e kadar bu dosyaya yazılmamıştı — OPS kusuru)
- **GÜNCELLEME 2026-09-04 (Recep kararı, geri-bildirim-3 madde 35):** KABUK VARSAYILAN SAYFADIR (15A ekran 07c).
  Deneyim modülü sayfada KATLI PANELDİR: kapalı hâlde teknik tablonun üstünde tek çağrı satırı, dokununca aynı
  yerde açılır; seçici sayfasından ya da teklif listesi "Hesapla"dan gelen ziyaretçide açık ve dolu gelir.
  Aşağıdaki modül tanımı (iç mantık) aynen geçerli; "sayfanın ÜST yarısında" ifadesi artık "açık hâlde" demektir.
- Ürün sayfası = TEK ŞABLON (kabuk) + ürün grubuna göre DENEYİM MODÜLÜ. Kabuk: kimlik, breadcrumb, eylem bloğu,
  teknik veri, açıklama, aksesuar, seri kardeşleri (15A ekran 07c çizdi). Modül: açık hâlde çağrı satırının
  yerinde, kullanıcıyla mekaniğiyle konuşan blok (chat yok, AI yok).
- Kanal fanı modülü (referans: `referans-canli-urun-sayfasi-v11.html`, Recep'in seçtiği v2 yerleşimi, DOKUNULMAZ TEMEL):
  ① "Bu fanı nerede kullanacaksınız?" niyet çipleri (banyo/mutfak/ofis/restoran…) → ② oda girdileri (alan, yükseklik,
  kişi; ya da pro: debi + basınç) → ③ devir kaydırıcısı; debi çubuğunda İHTİYAÇ ÇİZGİSİ, hüküm kutusu anlık
  (YETER / SINIRDA / YETMEZ + sebep), varyant kartları ihtiyaca göre canlı boyanır + ÖNERİLEN rozeti,
  "konuşan" teknik tablo (değer ↔ anlam sütunu, Klasik/Konuşan anahtarı), standart rozeti (EN 16798-1, ISO 5801),
  göreli ses kıyası. Hiçbir adım beklemeden değer gösterir (genel varsayımla açılır).
- Hava perdesi modülü: kapı genişliği + montaj yüksekliği → zemindeki hız, gereken hız, kapsama, modül adedi, hüküm.
- Modülsüz gruplar (aksesuar, sürücü): yalnız kabuk.
- Eylem kaydı: "Teklif listesine ekle" seçimin KAYNAĞINI taşır (sistem önerisi / kullanıcı seçimi + girdiler +
  dayanak standart + zaman) — itiraz halinde ispat. Satış kipinde aynı kayıt sipariş satırına gider.
- Tasarım görevi: modülü 15A diline giydirmek (Archivo, palet, kiremit kuralı), yerleşimi ve özellik envanterini
  KORUMAK. Cetvel: docs/standards/mockup-gelisim-hatti-standardi.md — hiçbir özellik sessizce düşmez; düşen madde
  gerekçe + Recep onayı ister; onaylı envanter canlının kabul listesidir.

## 6. Çalışma protokolü
- ÜZERİNE YAZMA YASAK: mevcut bir .dc.html yeniden çizilecekse eski sürüm "<ad> vN ARSIV.dc.html" olarak
  projede KALIR; yeni sürüm ayrı dosya olur. Recep karşılaştırarak seçer. (09-03: Broadsheet menü v1
  üzerine yazıldı, Claude Code yedeğinden geri getirildi.)
- Karar ve veri bu dosyadan gelir; Claude Code günceller. Design bu dosyayı DEĞİŞTİRMEZ.
- Design kendi kararlarını projenin CLAUDE.md dosyasına yazar; Claude Code oradan okur ve Linear'a işler.
- SİTENİN TAMAMI "E-ticaret menü tasarımı" (15A) projesinde çizilir: menü, ana sayfa, kategori, ürün, teklif listesi.
  Marka projesi ("Venthub e-ticaret logo tasarımı") yalnız kimlik kaynağıdır; 15A ona referans bağlar, oraya ekran çizilmez.

## 2b. Güncelleme 2026-09-04 (canlı DB, betikle ölçüldü)
- 375 ürün · 40 aile · 13 kök kategori (7'si boş, temizlenecek) · 24 alt dal · 5 marka. Ağaç ürünlerde alt-dal düzeyinde: 365/375 ürün bir dalda; 10 ürün yalnız kökte (kökünde dal yok).
- Bugün 31 metin düzeltmesi canlıya yazıldı (23 ürün adı büyük harften düzeltildi, 1 çift boşluk, 7 ailenin Türkçe adı dolduruldu).
- Kodda ama kapalı bayrak arkasında: marka paleti, mobil alt sekme çubuğu, header Teklif paneli (Faz 1). Ziyaretçi eski siteyi görüyor.
- Sitemap 192 adres (23 kategori + 17 alt kategori + 40 ürün sayfası + sabit sayfalar, TR+EN). Canlı ana sayfa h1 sunucuda üretiliyor.


