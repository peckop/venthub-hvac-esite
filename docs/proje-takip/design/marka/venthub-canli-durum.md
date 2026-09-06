
# VentHub — CANLI DURUM ve KAPALI KARARLAR (tek kaynak)

Bu dosyayı Claude Code (OPS orkestratör) yazar; her Design oturumu işe başlamadan ÖNCE okur.
Kaynak: canlı veritabanı ölçümü 2026-09-03 + Linear REC-129. Bu dosyadaki bilgiyi Recep'e
YENİDEN SORMA; çelişki görürsen dosyayı esas al, farkı bir satırla not düş.

## 1. Ticari model — KAPALI
- Site TEKLİF ODAKLIDIR. Fiyat, indirim, KDV, toplam, stok adedi, sepet, ödeme YOKTUR.
- Her üründe iki eylem: "Teklif listesine ekle" (birincil, kiremit) + "Teklif iste" (ikincil).
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

## 6. Çalışma protokolü
- ÜZERİNE YAZMA YASAK: mevcut bir .dc.html yeniden çizilecekse eski sürüm "<ad> vN ARSIV.dc.html" olarak
  projede KALIR; yeni sürüm ayrı dosya olur. Recep karşılaştırarak seçer. (09-03: Broadsheet menü v1
  üzerine yazıldı, Claude Code yedeğinden geri getirildi.)
- Karar ve veri bu dosyadan gelir; Claude Code günceller. Design bu dosyayı DEĞİŞTİRMEZ.
- Design kendi kararlarını projenin CLAUDE.md dosyasına yazar; Claude Code oradan okur ve Linear'a işler.
- SİTENİN TAMAMI "E-ticaret menü tasarımı" (15A) projesinde çizilir: menü, ana sayfa, kategori, ürün, teklif listesi.
  Marka projesi ("Venthub e-ticaret logo tasarımı") yalnız kimlik kaynağıdır; 15A ona referans bağlar, oraya ekran çizilmez.

