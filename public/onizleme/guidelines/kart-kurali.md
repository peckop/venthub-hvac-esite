# Venthub New · Kart kuralı (Recep 10-25)

## Tek kural
Sayfa açan her ürün grubu, ürün türü ya da seri kartı **CategoryCard** görünümündedir: fotoğraf · "ad →" · "n model"; kartın tamamı basılır.
- **Seri kartında ad:** "marka + kısa seri adı". Ayrı marka satırı ve "Aç →" düğmesi yok.
- **SeriesCard** yalnız veri çevirir; görünümü CategoryCard'dır. İkinci kopya yazılmaz (§1.1).
- **Model:** ProductCard (kart) ya da ModelRow (liste satırı). Ayrı iş gördükleri için ayrı görünümdedirler.

## Kart hizası (Recep 10-25 · DESIGN-MENU CLAUDE.md §4, birebir)
Bir satırdaki kartlar eşit boy (en uzun kart kadar); fotoğraf aynı yükseklikte, ad üstte aynı çizgiden başlar, "n model" en altta aynı hizada. Bütün kart dizilerinde (ana sayfa blokları, ürün türü, uygulama alanı, seri). Önceki "kartlar kendi boyunda, bloğun alt kenarına hizalı" (#13 B-2) geçersiz.

Uygulama (Venthub New):
- Kart hücreyi doldurur (`height: 100%`), alt satır `margin-top: auto`.
- Ad en çok 2 satır, en az 2 satır yer tutar.
- Parçalar: CategoryCard, SeriesCard, ProductCard, FamilyCard.

## Onaylı istisnalar (yalnız bunlar)
1. **Ürünler haritası tür kartı** (UrunHaritasi): küçük yatay kart. Harita 22 türü tek ekranda gösteren bir dizindir.
2. **Ana sayfa "Öne çıkan ürün aileleri"** büyük renkli kartı: ana sayfanın tek vitrini; sahneyle birlikte istisnadır.
3. **Uygulama alanı mobil paneli** satırları (fotoğraf · ad · n model · ›): panel bir listedir.

Yeni bir kart biçimi gerekirse önce bu listeye eklenir (Recep onayı), sonra yazılır.

— Venthub New 2026-10-25
