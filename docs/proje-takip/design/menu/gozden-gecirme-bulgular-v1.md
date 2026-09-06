
# Gözden geçirme bulguları v1 — 2026-09-04

Kapsam: Menü Tasarımı v13 (18 ekran) + Ana Sayfa v7, `kararlar-vitrin-15a.md` K1–K16'ya karşı. Çizim yok.
Kaynak farkı: Linear'daki "Kararlar — Vitrin 15A" belgesi (08:46 güncel) projedeki 13:15 kopyasından iki madde
ileride — (i) "Design'ın erişim ve yazma sınırı" (okur, yazmaz; bu tur o kurala göre yürüdü) ve (ii) **"Mobil header:
Hesap ve dil sağ üste" (Recep eğilimi, 14:00; Design çizip onaylanınca kesinleşir)**. İkincisi K9 ve K16'yı değiştirir;
aşağıda K16b olarak anılır ve yalnız "çelişki/uygulanmamış" düzeyinde ele alınır.

## a. Ürün sayfası (07 / 07b / 07c / 07d)
1. [AYKIRI] K1 · ekran 07 ve 07d — "Aylık elektrik" metrik kutusu ₺ gösteriyor (271 ₺/ay, "~3 ₺/kWh"). Kutu "işletme tahmini, ürün fiyatı değil" diye etiketli ve CLAUDE.md'de onay bekleyen Design eklemesi olarak kayıtlı; ama K1 "fiyat … YOK" der ve para birimi ayrımı yapmaz. Karar: kutu kalksın ya da "Güç payı (%34)" gibi parasız bir ölçüye dönsün; ya da K1'e açık istisna yazılsın.
2. [BOŞLUK] 07d "seçici sayfasından ya da teklif listesindeki Hesapla'dan gelir" der; seçici sayfası çizilmedi (boşluk listesi A, "Hesaplayıcılar" satırı). Kodda `/destek/hesaplayicilar/{kanal, hava-perdesi, hrv, jet-fan}` dört ayrı yol var; K12'nin "seçici sayfası" bunlardan hangisi, tek sayfa mı dört mü, karar yok.
3. [BOŞLUK] Kararsız ziyaretçinin paneli BULMASI yalnız 07c'deki tek çerçeveli satıra bağlı; sayfa üstünden (kimlik bloğu, breadcrumb, eylem bloğu) panele hiçbir işaret yok. Listede yok. K12 satırın yerini sabitliyor, görünürlük eşiğini sabitlemiyor; ilk ekranda (1440×900) satır görünüyor mu ölçülmeli — 07c'de tablo üstünde, ilk ekranın alt sınırında.
4. [AYKIRI] K6 · ekran 07 — v11 envanterinden "dönen fan animasyonu" ve "koyu mod" düştü (CLAUDE.md cetveli "DÜŞTÜ" yazıyor, gerekçeli). K6 "hiçbir özellik sessizce düşmez; düşen madde gerekçe + Recep onayı ister" der; gerekçe var, **Recep onayı kaydı yok**. Onay alınmalı ya da envantere geri konmalı.
5. [İYİLEŞTİRME] 07c'de üç seçici (dönüş yönü · faz · versiyon) kardeş modele geçirir ama kardeş yoksa seçici görünmez (K7 ruhuna uygun). Danfoss sürücüde tablo 3 satıra iner, seçici yok, eğri yok, çağrı satırı yok: sayfa ilk ekranda büyük boşluk bırakır. ETKİ: sürücü sayfası "eksik" değil "kısa" okunur. BEDEL: 07c'nin "kısa kabuk" hâli (3 satır tablo, seçicisiz) bir artboard olarak çizilir.
6. [İYİLEŞTİRME] Mühendis model koduyla gelip 07c'ye düşüyor; "Bu model için teklif iste" kiremiti ilk ekranda ama "Teklif listesine ekle" çerçevelinin yanında aynı boyda. K5'e uygun; yine de model kodunu bilen kullanıcı için asıl iş çoğu zaman "listeye ekle, devam et". ETKİ: çok modelli teklif toplayan mühendis daha az tıklar. BEDEL: karar değil, ölçüm — Faz 3'te iki düğmenin tıklanma oranı izlenir; kural değişmez.
7. [İYİLEŞTİRME] 07 açık hâlde "Kapat ▴" ile 07c'ye dönüş var; ama panel açıkken girilen değerler kapatınca kaybolur mu, tekrar açınca durur mu, çizimde yazılı değil. ETKİ: ziyaretçi 5 girdi girip kapatıp tabloya bakınca değerleri kaybetmez. BEDEL: 07 altyazısına tek cümle ("değerler oturum boyu tutulur") + Faz 3 kod notu.

## b. Kategori ve dal sayfaları (04 / 05 / 06 / 06b)
1. [AYKIRI] K8 · ekran 04 — K8 "kategori sayfası tek şablon ÜÇ MOD (vitrin / anlatım / seri listesi)" der; 04'te tek hâl çizili, "mod" kelimesi ve mod ayrımı yok. Hangi kategorinin hangi modda açılacağı ve mod seçiminin neye bağlı olduğu (dal sayısı? ürün sayısı? DB bayrağı?) tasarımda yok.
2. [BOŞLUK] "Tüm ürünler" sayfası (kod `/products`, menü alt bölgesi "Tüm ürünler (375)") — boşluk listesi A "KISMEN, K13 Faz 3" der. Faz 1–2'de bu adres açık kalacak; Faz 3'e kadar hangi ekranla (06 boş süzgeç?) karşılanacağı yazılı değil.
3. [BOŞLUK] Ekran 05 dal şeridinde "ATEX versiyonu mevcut" çipi var; canlı durum §2 "ATEX" alt dalını BOŞ ve temizlenecek sayıyor. Çip dal değil faset ise (K3 "üçüncü seviye yok, faset") hangi teknik alandan beslendiği (sertifika alanı?) yazılmalı; boş faset K7'ye takılır. Listede yok.
4. [İYİLEŞTİRME] 06b boş sonuç "bir süzgeci kaldırırsanız 34 model görünür" der ama hangi süzgecin kaç modeli sakladığını 08b yazıyor, 06b yazmıyor. ETKİ: aynı hâl iki ekranda aynı dili konuşur. BEDEL: 06b'ye 08b'deki süzgeç başına sayı satırı taşınır (tek blok).
5. [İYİLEŞTİRME] Ekran 06 süzgeç sütunu 262 px, faset başlıkları IBM Plex Mono 10,5 px büyük harf; K2 Plex Mono'yu "kod/teknik değer" ile sınırlar, başlık kullanımı sınırda. ETKİ: tipografi disiplini (K9). BEDEL: bölüm etiketi Archivo 11 px 600 harf aralıklı; tek stil değişimi, tüm ekranlar.

## c. Sayfa mimarisi ve adresler
1. [AYKIRI] K1 · canlı sitemap — `/tr/cart` ve `/en/cart` sitemap'te yayında (192 adresin 2'si). K1 sepeti yasaklar; ekran 10 "teklif listesi sepet değildir". Adres kararı boşluk listesi C'de açık; sitemap'ten çıkarılması Faz 2 yayınına bağlanmalı.
2. [BOŞLUK] Teklif listesi (ekran 10) adressiz çizildi; senaryo `/tr/senaryo/<slug>`, arama `/tr/arama?q=`, karşılaştırma `/tr/karsilastir` yazılı. Boşluk listesi C "/cart'ın kaderi" der; öneri: `/tr/teklif-listesi` (kısa slug, K3 diliyle), `/cart` 301.
3. [BOŞLUK] K8 "hangi sayfa hangi şablondan üretilir" tablosu tasarımda hiçbir yerde tek liste hâlinde yok; CLAUDE.md'de dağınık ("kategori ×7, dal ×26, liste, seri, senaryo, teklif listesi"). Marka sayfası (`/brands/[slug]`, 5 sayfa) hangi şablondan? Boşluk listesi "liste şablonu + marka başlığı olabilir" der, karar değil.
4. [BOŞLUK] Kısa slug geçişi (K3): 15A README §3 tablosu 7 kategori + 26 dal için slug verir; sitemap'te 23 kategori + 17 alt dal adresi var (TR). 40 eski adresin 33 yeni adrese eşlemesi (hangi eski → hangi yeni, hangisi 410) yazılı değil; boşluk listesi B "301 + sitemap" der, eşleme tablosu yok.
5. [İYİLEŞTİRME] Ana sayfa v7 "Bilgi Merkezi" bölümü köşeli parantezli başlıklarla çizili; kodda `/destek/merkez` + `/destek/konular/[slug]` var ama Design'da yok (A). ETKİ: ana sayfadan Bilgi Merkezi'ne tıklayan ziyaretçi hedef sayfayı bulur. BEDEL: uzun-metin şablonu (Source Serif 4) tek artboard; hukuki sayfalar da aynı şablonu kullanır (A "Hukuki" satırını da kapatır).

## d. Cihaz/ürün seçiminin YERİ (K15 açık konu)
1. Üç seçenek, tek öneri:
   - **Seçici sayfası (Hesaplayıcılar altı, kodda 4 yol var).** ETKİ: kategori bilmeyen ziyaretçi tek yerden başlar; SEO'su var. BEDEL: dört yol tek sayfaya indirilir, sonuç 07d'ye `?hesap=1` ile düşer; yeni şablon (1 artboard), ana sayfada iki çerçeveli düğme zaten var.
   - **Üründeki panel tek giriş (07/07c).** ETKİ: hiçbir yeni sayfa yok, K12 zaten çizildi. BEDEL: ürünü bilmeyen ziyaretçi paneli bulamaz (a.3); menüden ürüne gidiş 3 tıklama.
   - **Senaryo sayfasından (09).** ETKİ: "hangi mahal" sorusu zaten senaryo seçimidir; 09 → süzgeçli liste → 07d doğal akış. BEDEL: 09'a girdi bloğu eklenir (alan/yükseklik/kişi), 8 senaryo × 1 blok; seçici sayfası çizilmez.
2. [İYİLEŞTİRME] **Öneri: seçici sayfası (tek sayfa) + senaryo sayfasına kısayol.** Gerekçe: K12 modülü "kararsız ziyaretçi için" diye tanımlar, kararsız ziyaretçinin ilk durağı ürün sayfası değildir; kodda dört hesaplayıcı yolu zaten yaşıyor ve 07d bu girişi bekliyor. Senaryo sayfasına yalnız "Bu senaryo için fan seçin →" çerçeveli düğme konur, girdi bloğu konmaz (09 anlatım sayfası kalır). ETKİ: üç giriş (ana sayfa düğmesi · senaryo düğmesi · teklif listesi "Hesapla") tek motora, tek sayfaya iner. BEDEL: 1 yeni artboard (seçici, masaüstü + mobil), 09'a 1 düğme, `/destek/hesaplayicilar/*` dört yol → tek yol + 301.

## e. Menü ve gezinme (01 / 02 / 03 / 12)
1. [AYKIRI] K16b (Linear 14:00) · tüm mobil çerçeveler — Recep eğilimi "Hesap ve dil sağ üste, alt çubuk 4 sekme"; v13'te 7 mobil header'ın hiçbirinde dil ve hesap yok, alt çubuk 5 sekme, Hesap yaprağında dil satırı yok. Henüz karar değil ("Design çizip onaylanınca kesinleşir"); ama K9 "üstte yalnız logo + arama" ile çelişecek — biri güncellenmeli. OPS notu doğru: 390 px'te logo · arama · dil · hesap, ≥44 px hedefle sığmaz; dil Hesap yaprağının ilk satırı olarak kalmalı (K16 hükmü).
2. [AYKIRI] K16 · ekran 12 Hesap yaprağı — K16 "girişsizken yaprak: dil · Giriş yapın · kilitli Tekliflerim/Projelerim" der; çizilen yaprak giriş yapmış hâl (Tekliflerim · Projelerim · Siparişlerim · Favorilerim · Profil), "Giriş yapın" yalnız masaüstü panelde, "kilitli" hâl ve dil satırı yok. Ayrıca "Siparişlerim" satırı K1 (sipariş yok) ile çelişir.
3. [AYKIRI] K5 · ekran 12 — "Yeni proje oluştur" formunda ikinci dolu kiremit ("Projeyi oluştur") aynı artboard'da Teklif panelinin kiremitiyle birlikte. Ayrı sayfa/yaprak sayılırsa kural tutar; artboard bunu söylemiyor. Altyazıya "ayrı yaprak" notu ya da düğme çerçeveli.
4. [BOŞLUK] Giriş / kayıt / şifre ekranları (kod 5 yol) ve hesap alanı (kod 14 yol) çizilmedi — K16 Design eksiği, boşluk listesi A. Teklif kipinde kalan altı bölüm (Tekliflerim · Projelerim · Favorilerim · Profil · Güvenlik · Veri talepleri) için tek "hesap kabuğu" şablonu + giriş şablonu yeter; Faz 4 kalemi olduğu K16'da yazılı, 15A'da artboard yok.
5. [BOŞLUK] Masaüstünde "Destek" girişi yok: mobil Destek yaprağı (WhatsApp · Ara · Teknik destek · Kargo takibi · İletişim) var, masaüstü header'da yalnız "İletişim" bağlantısı. WhatsApp ve Ara masaüstünde nereden? Listede yok (A "Kurumsal: İletişim = Destek yaprağının masaüstü karşılığı" der, ama İletişim sayfası da çizilmedi).
6. [İYİLEŞTİRME] Mobil ≤9 kuralı (K9): ana sayfa mobilde üst şerit (logo+arama = 2) + 7 mekân çipi + alt çubuk 5 = 14 etkileşimli öğe ilk ekranda; çipler kaydırmalı olduğu için görünen ~4, toplam sınırda. ETKİ: kural ölçülebilir olur. BEDEL: K9'a "≤9 = ekranda görünen, kaydırma dışı" tanımı yazılır; çizim değişmez.
7. [İYİLEŞTİRME] Menü paneli (02) kategori kiremitleri ürün sayısı taşımaz (K9 gereği); mobil menü alt bölgesinde "Tüm ürünler 375" sayı taşır. ETKİ: tutarlılık. BEDEL: ya 375 kalkar ya K9'a "toplam sayı istisna" eklenir; tek satır.

## f. Boşluk doğrulaması
A: 42/47 doğrulandı — depoda `src/app/[lang]/**/page.tsx` 47 müşteri yolu (73 page.tsx − 26 admin); OPS gruplaması birebir tutuyor. Tek not: A tablosu "Kurumsal" satırında `/about` ve `/contact`'ı sayar ama footer'da "Hakkımızda" hedefi de çizilmedi — satır doğru, not eksik.
B: 7/7 doğrulandı — `/tr/arama`, `/tr/senaryo`, `/tr/karsilastir` yolları depoda yok; `SearchOverlay` bileşeni var; kısa slug yolu yok (`/category/[categorySlug]/[subCategorySlug]` duruyor).
Sitemap: 192/192 doğrulandı (Kernel ile açıldı, HTTP 200) — 96 TR = 23 kategori + 17 alt dal + 40 ürün + 5 marka + `/brands` + 10 sabit (`/tr`, `/products`, `/contact`, `/about`, `/destek/merkez`, **`/cart`**, `/legal/kvkk`, `/legal/gizlilik-politikasi`, `/legal/cerez-politikasi`); 96 EN aynı. `/cart` bulgusu c.1'de.
Canlı h1 doğrulandı (Kernel): "Endüstriyel Havalandırma Katmanları", sunucuda üretiliyor.

## Karar dışı görüşler (en fazla 5 satır)
- K5 "kart eylemleri: Karşılaştır + Teklif listesine ekle" iki eylem der; v13 kartlarında üçüncü çerçeveli "Ürünü incele" var (Recep gözlemiyle eklendi, CLAUDE.md "onay bekler"). Ya K5 üçe çıkar ya düğme kalkar — bugün karar belgesiyle çizim ayrı düşüyor.
- K3 "sayfa MODEL bazlı" ile "adres seri bazlı" birlikte yaşıyor; 07c'de model seçicisi adresi `?sku=` ile değiştiriyor. Faz 3 model adresi kararı gelmeden `?sku=` paylaşılan bağlantı olarak davranacak; bunun sitemap/hreflang'a girmemesi yazılmalı.
- K13 mobilde varsayılan görünüm kararını Design'a bırakır; öneri şimdiden: mobilde varsayılan Kart, Tablo yatay kaydırmalı ikincil — 390 px'te ≥5 sütunlu matris okunmaz.

