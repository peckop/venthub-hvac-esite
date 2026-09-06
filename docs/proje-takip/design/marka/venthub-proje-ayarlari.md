
# VentHub — projeler arası ayar eşitleme notu

Bu not, VentHub adı altındaki bütün proje sayfalarında aynı görsel kararların geçerli
olması için yapılması gerekenleri sıralar. Yeni bir projede sohbete bunu yapıştır.

## 1. Design system çipi

Şu an çip **Broadsheet** gösteriyor (menü projesinin sistemi). VentHub işlerinde bu yanlış
varsayılan: her dosyada marka elle yeniden kurulmak zorunda kalıyor.

**Yapılacak:** VentHub bir design system olarak üretilecek ("Create design system").
Üretildiğinde çip listesine girer ve **bütün projelerde** seçilebilir olur. Ondan sonra
her projede çip = VentHub. Tek kaynak, tek yer.

Çip VentHub olana kadar her yeni sohbette şunu söyle:
> Marka kararları CLAUDE.md'de. Broadsheet düzeni kullanılmaz, VentHub paleti ve yazı
> tipleri geçerli.

## 2. Her projede geçerli sabitler

Palet
- Lacivert `#1A2B4A` — yapı, wordmark, header/footer
- Turkuaz `#0088B0` — hava, vurgu
- Kiremit `#D95D0E` — yalnız logo üst dilimi + ana eylem butonu. Metin rengi değil.
- Yeşil `#3D7A1E` — yalnız Hava Arıtma kategori sayfaları. Palete dahil değil, logoya girmez.
- Amber `#F59E0B` — markaya ait değil, yalnız arayüz uyarı kutusu.
- Macenta `#D6006C` kaldırıldı.

Yazı tipi (üç aile, rol ayrımı katı)
- **Archivo** — wordmark, menü, buton, ürün kartı, teknik tablo, filtre, form
- **Source Serif 4** — yalnız uzun açıklama metni (kategori ve senaryo yazıları)
- **IBM Plex Mono** — model kodu, etiket, teknik değer
- Dördüncü aile eklenmez. Inter kullanılmaz.

Logo
- **Elle çizilmez (K23):** tek kaynak `brand/logo/` (28 SVG). Koyu zeminde
  `venthub-isaret-tamrenk-koyu.svg` — kiremit · beyaz · beyaz · turkuaz.
- İşaret 14A-3. Wordmark her zaman **VentHub** (camel case). VENTHUB / venthub yasak.
- Koruma alanı: işaret yüksekliğinin yarısı.
- En küçük: ekranda 16 px işaret / 96 px kilit; baskıda 6 mm işaret / 25 mm kilit.
- Hareket yalnız 48 px üstü, tek 2–3 sn döngü. Favicon, evrak, baskı daima statik.

Kabuk
- Tek koyu ton lacivert. Header ve footer koyu, sayfa gövdesi aydınlık.
- Kiremit sayfada tek sıcak nokta.

İkon
- 16 ikon: 7 kategori + 9 senaryo. `brand/icons/` içinde 144 SVG (**64/48/24 px** × üç sürüm).
- 26 dal için ikon yok — dal ayrımını ürün fotoğrafı sağlar.
- Koyu zeminde **koyu** sürüm kullanılır; tamrenk sürüm lacivert üstünde 1.31:1 kalır.
- Kiremit ikonlarda yok. Hava anlatımı okla değil dilim/jet ritmiyle.

## 3. Proje bazında ek kural

### Menü projesi (ana sayfa ve menü tasarımları)
- Bilgi mimarisi menü projesinin: 7 kategori · 9 senaryo · 375 ürün. Dal sayısı ölçülmemiş,
  burada yazılmaz (REC-135'te tartışmalı).
- Akış teklif odaklı: fiyat, stok, sepet yok. Header sağında eylem öğesi tek: "Teklif (n)" (K5).
  Sepet, favoriler ve hızlı sipariş yoktur; Favorilerim teklif panelinin içindedir.
- Kabuk VentHub'ın: koyu lacivert band, işaret 14A-3 + Archivo wordmark.
  Broadsheet'in açık zemin + kural çizgisi düzeni kullanılmaz.
- Marka listesi (7, sıra ve yazım aynen): Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva.
  İlk beşinin ürünü var; Casals ve Flexiva temsil edilen, ürünü 0. Storm marka değil (SEAT serisi).
- Grafiklerde: eğri lacivert, ikincil seri turkuaz, çalışma noktası kiremit.

### Kurumsal belgeler projesi (teklif, sipariş, e-fatura)
- Baskı işi: logo **statik**, animasyon yok.
- En küçük ölçü baskı değerleri geçerli: 6 mm işaret / 25 mm kilit.
- Baskıda **kategori vurgu rengi kullanılmaz** (yeşil ve turkuaz gri dönüşümde
  1.29 kat ayrı, tek renkte vurgu zayıflar). Tek renk lacivert sürüm kullanılır.
- Rakam ve model kodu IBM Plex Mono; tablo başlıkları Archivo; açıklama metni yok denecek
  kadar az olduğu için Source Serif 4 gerekmez.
- Metin en küçük 12 pt.

## 4. Kaynak dosyalar (marka projesi)

- `CLAUDE.md` — bütün kararların kaydı, tek doğru kaynak
- `1 Venthub Marka Kilavuzu.dc.html` — teslim dosyası, Bölüm A–E
- `brand/icons/` — 96 SVG, geçerli set (`ARSIV svg eski/` klasörü eski, kullanılmaz)
- `tools/icons-to-svg.js` — ikon değişince SVG'leri yeniden üreten dönüştürücü
- `github.md` — `peckop/venthub-hvac-esite` bağlantı kaydı

## 5. Depo (peckop/venthub-hvac-esite) için ÖNERİLER

Bunlar karar değil öneri; kod tarafı REC-147 fark dosyasıyla karar alır (OPS, 5 Eylül).

- `--brand-cyan` → `#0088B0`, `--primary-navy` → `#1A2B4A` (eski değerler değişir)
- Vitrin aydınlık gövde + koyu header/footer; deponun bugünkü kurgusu ÖLÇÜLECEK
- `layout.tsx` içindeki `next/font/google` Inter tanımı Archivo'ya çevrilir,
  `--font-sans` değişken adı korunur
- Yeni `--action-terracotta` `#D95D0E` eklenir; mevcut `gold-accent` `#D97706` dokunulmaz
- Renkler `src/index.css`'te HSL üçlüsü, `tailwind.config.js`'te
  `hsl(var(--x) / <alpha-value>)` eşlemesi; renk dışı tokenlar `src/design-system/tokens.js`

