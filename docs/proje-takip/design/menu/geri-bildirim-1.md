
# GERİ BİLDİRİM 1 — Menü Tasarımı + Ana Sayfa (Claude Code / OPS, 2026-09-03, Recep onaylı)

Bu dosyadaki maddeler KARARDIR; uygula, soru sorma. Uygulayınca CLAUDE.md'ye "Geri bildirim 1 uygulandı" bloğu ekle.

## Design eklemelerine hüküm
1. **Kart içi eylem:** dolu buton YOK. Kartlarda "Teklif listesine ekle" ince çerçeveli (1px lacivert kenar, lacivert yazı,
   zemin beyaz). Dolu KİREMİT yalnız seri/ürün sayfası eylem bloğunda ve Teklif Listesi "Teklif talebini gönder"de.
   Lacivert dolu buton hiçbir yerde kullanılmaz.
2. **Atıksu Arıtma ve Hava Arıtma (Recep kararı):** ikisi de menüde, senaryo listesinde ve sayfalarda YER ALMAZ.
   Senaryo listesi 8 olur (Atıksu Arıtma çıkar). Çizilen Atıksu ikonu arşivde kalır, "İKON ONAY BEKLER" etiketi ve
   ekran 03'teki satır kalkar. Hava Arıtma ürünler gelince ayrı kararla açılır.
3. **Üst şerit tek kat:** ONAYLI, sıra: Ürünler ▾ · Hesaplayıcılar · Bilgi Merkezi · İletişim · arama · TR/EN ·
   Teklif Listesi · Teklif İste. "Markalar" üst şeritten çıkar, footer "Kurumsal" sütununda kalır.
4. **Sekizinci kutu "Tüm ürün ağacı":** ONAYLI.
5. **Kiremit kuralı (kesin):** her sayfada TEK dolu kiremit, o da sayfanın ana işi. Ana sayfada hero "Teklif al" kiremit;
   header "Teklif İste" ve alt "Teknik destek iste" ÇERÇEVELİ (beyaz zeminde lacivert kenar; koyu header'da beyaz kenar).
   Diğer ekranlarda ana iş: liste → yok (kartlar çerçeveli), seri/ürün → "Teklif listesine ekle",
   teklif listesi → "Teklif talebini gönder", senaryo → "Teknik destek iste".
   Kontrast: kiremit üstünde beyaz yazı yalnız butonda, en az 15 px ve 600 ağırlık; kiremit üstüne küçük metin konmaz.

## Ek düzeltmeler
6. **Hero fotoğrafı:** GERÇEK beyaz fonlu ürün fotoğrafı (867 var; depo `public/` / Supabase storage). Erişemiyorsan
   nötr fan silüeti + "[SEAT 30 fotoğrafı — Faz 1'de gerçek görsel]" etiketi. Ortam/stok/yapay görsel hero'da YOK.
   Hero B varyantı silinir; A (fotoğraf solda) kalır.
7. **Marka logoları:** resmi logolar projede `brand/logos/` altında (vortice.png, seat.png, avens.svg,
   nicotra-gebhardt.webp, danfoss.svg). Marka şeridinde bunları kullan; koyu zemine koyma (mono sürüm yok),
   beyaz kutu içinde, yükseklik 40 px, gri-tona çevirme yok.
8. **Kategori kartı ikonu:** masaüstü 64 px, mobil 48 px; kart başlığı 17 px / 600; "N dal" 13 px soluk.
9. **IBM Plex Mono:** yalnız model kodu, teknik değer ve bölüm etiketi (küçük caps). Köşeli parantezli yer tutucu
   metinler Archivo'ya döner (üretimde gerçek metin olacak). URL gösterimlerinde mono kalır.

10. **Ekran 6 ve 7 v1 kurgusuna DÖNER (Recep kararı):** Filtreli liste MODEL kartları gösterir (SEAT 30, STORM 40, JET 25…;
   her kartta debi / basınç / faz), seri kartı değil. Ürün sayfası TEK MODEL sayfasıdır (v1 ekran 7 aynen: kod, sertifika
   çipleri, teknik tablo, dönüş yönü/faz/versiyon seçici, debi-basınç eğrisi, ilgili aksesuarlar). "Seri sayfası + model
   seçici" kurgusu kaldırılır; seri yalnız breadcrumb'da ve sayfa altında "SEAT serisindeki diğer modeller" şeridinde görünür.
   ADRES ayrı konudur: bugün /tr/products/<seri>?sku=<model> ile açılır, Faz 3'te modele kendi adresi verilir; sayfa değişmez.
   Kart eylemi 1. maddeye göre çerçevelidir.

11. **Tipografik ton — v1'in dinginliği Archivo'ya taşınır (Recep + OPS):** yazı tipi aileleri DEĞİŞMEZ (Archivo arayüz,
   Source Serif 4 uzun açıklama, IBM Plex Mono kod). Ama v2 her şeyi kalın ve sıkışık çizdi. Kural: gövde, menü öğeleri,
   filtre seçenekleri, tablo değerleri Archivo 400; kart ve bölüm başlıkları 600; 700 yalnız logo wordmark ve h1.
   Satır aralığı gövdede ≥1.5, listelerde ≥1.45. Zemin kırık beyaz (#f4f4f2 kalır), kalın lacivert blok yalnız header/footer.
   Menü panelinde v1'deki boşluk ritmi (satır yüksekliği, grup başlıkları arası 22-26 px) korunur.
   Senaryo/kategori açıklamaları Source Serif 4, 16 px, satır aralığı 1.6, en fazla 66 karakter genişlik (v1 gibi).

## Değişmeyecekler (tekrar çizme)
Bilgi mimarisi, 10 ekran düzeni, kısa slug'lar, /products/<seri>, boş dal görünmez, teknik tablo dolu-satır kuralı,
palet (kiremit KALIR), yazı tipi aileleri, koyu header/footer + aydınlık gövde.

