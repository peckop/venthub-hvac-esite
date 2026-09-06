
# Kabuk ekranı

**Türev.** Kaynak `templates/kabuk/Kabuk.dc.html` (OPS hükmü: şablon kaynak, kart türev).
Kabuk düzeni değişecekse önce şablon değişir, bu ekran ona göre güncellenir.

Sitenin taşıyıcı kabuğu: koyu utility şeridi + **74 px** koyu lacivert header + **aydınlık gövde**
+ koyu footer. İçerik alanı **bilinçli olarak boştur.**

**Neden boş:** ekran kaynağı DESIGN-MENU'dür (K11). Menü, ana sayfa, kategori, liste, ürün ve
teklif ekranları Vitrin 15A projesinde çizilir ve orada onaylanır. Buraya kopyalanması ikinci bir
kaynak yaratırdı. Bu sistem o ekranlara **malzeme** verir, kopyasını tutmaz.

Header sekiz kalem taşır (v17 ölçümü): Ürünler ▾ · Ürün Seçici · Bilgi Merkezi · arama · TR/EN ·
İletişim · Teklif sayaç rozeti · hesap ikonu. İlk kalem beyaz, 2–3 `--text-on-dark-muted`.
**İki arayüz ikonu** (İletişim, hesap) inline duruyor: set DS'e **kopyalanmaz**, sahibi MENU (K23-a).
**Arama alanı zemini** `--surface-dark-inset` `#24395C`, metni `--text-on-dark` (11.57). Bu zemin
lacivert banttan yalnız **1.22** ayrılır — kenar veya konum olmadan tek başına okunmaz, o yüzden
1 px `--surface-dark` kenar taşır. `--text-on-dark-muted` bu zeminde 4.45 ile eşiğin altında kalır,
placeholder muted yazılmaz.

Kullanılan bileşenler: `KabukBandi` · `CerceveliDugme`.
Logo dosyadan gelir (`assets/logo/venthub-kilit-yatay-tamrenk-koyu.svg`) — elle çizilmez (K23).

İçerik sütunu 1060 px, artboard 1440. Bant tam genişlikte, iç oluğu 40 px, yükseklik 74 px, öğe
arası 30 px (Menü v15 ekran 01 ölçümü).

**Geçerlilik aralığı:** bu ekran masaüstü artboard'udur; header satırı ölçülen içerikle
(logo · menü · arama · TR/EN · Teklif) yaklaşık **900 px'in altına sığmaz**. Daha darda arama
alanı sıkışır — kırılma noktası, aramanın gizlenmesi ya da satırın sarması **ölçülmedi**, o yüzden
uydurulmadı. Mobil kabuk (390 px: 60 px üst şerit + 44 px arama satırı + bağlam çipi şeridi +
4 sekmeli alt çubuk) DESIGN-MENU'nün; burada çizilmedi.

