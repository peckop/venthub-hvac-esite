
# Madde 82 · düğme denetimi (DESIGN-MENU, 2026-09-05)

Düğmeler: **DESIGN_VARIANCE 4 · MOTION_INTENSITY 3 · VISUAL_DENSITY 7** (B2B mühendis; düzen sakin, hareket az,
bilgi yoğun). Bundan sonra her turun başında yazılı. Anti-default listesi gözden geçirme ölçütü.

Denetlenen beş güncel dosya: `Menü Tasarımı v15` · `Venthub Ana Sayfa v9` · `Urun Sayfasi v2 Hikaye` ·
`Ürün Seçimi Alternatifleri v3` · `Ürün Seçici Karşılaştırma`. Yöntem: statik metin taraması, dosya başına sayı.

## Anti-default listesi — beşinde de temiz

| Ölçüt | v15 | v9 | Ürün v2 | Alt v3 | Karş. |
|---|---|---|---|---|---|
| Mor gradyan / herhangi gradyan | 0 | 0 | 0 | 0 | 0 |
| Cam efekti (`backdrop-filter`) | 0 | 0 | 0 | 0 | 0 |
| Sonsuz döngü animasyon (`infinite`) | 0 | 0 | 0 | 0 | 0 |
| Gölge (`box-shadow`, inset hariç) | 0 | 0 | 0 | 0 | 0 |
| Yarıçap (50% logo ve 8px panel hariç) | 0 | 0 | 0 | 0 | 0 |
| Inter + slate-900 | 0 | 0 | 0 | 0 | 0 |
| Ortalanmış kahraman | 0 | 0 | 0 | 0 | 0 |
| **K22** metinde alfa | 0 | 0 | 0 | 0 | 0 |
| `transition: all` | 0 | 0 | 0 | 0 | 0 |
| Vaat kutusu / "yakında" | 0 | 0 | 0 | 0 | 0 |
| K7 ihlali ("veri yok" satırı) | 0 | 0 | 0 | 0 | 0 |

**Beş yanlış pozitif elendi** (ölçüm betiği bunları yakalıyor, hepsi meşru):
`Inter` → `IntersectionObserver` / `isIntersecting` içinde · `slate` → `translateX` / `translateY` ·
`transition: all` → altyazıda kuralın kendisi yazıyor ("`transition: all` yok") · `veri yok` → altyazıda kural
açıklaması ("veri yoksa bölüm hiç görünmez") · `yakında` → dördü de "yakında yazılmaz/yok" cümlesi.
**Betik bundan sonra bu kalıpları hariç tutacak.**

`text-align:center` 51 kullanım (v15 42 · v9 5 · v3 4) — hepsi **düğme etiketi ortalaması**, ortalanmış metin
bloğu değil. Yasak olan ikincisi; ihlal yok.

## Dokunma hedefi

| Dosya | `min-height:44px` |
|---|---|
| Menü v15 | 322 |
| Alternatifler v3 | 172 |
| Ürün Sayfası v2 | 18 |
| Ana Sayfa v9 | 2 |
| Karşılaştırma | 0 |

Son iki satır kasıtlı: Ana Sayfa v9'un etkileşimli öğeleri çoğunlukla `padding` ile 44px'i aşıyor (52b şerit
turunda ölçülmüştü), Karşılaştırma sayfası ise **okunan bir sayfa** — tek etkileşimli öğe yok, hedef gerekmez.
Ürün Sayfası v2'nin 18'i çip, düğme ve mobil sekme; sayfanın geri kalanı okuma bölgesi.

## Tek açık kalem — em dash

Yasak listesinde **em dash** var; beş dosyada **157 kullanım** ölçüldü (v15 96 · Alt v3 35 · Karş. 12 · v9 9 ·
Ürün v2 5). Kaba ayrım: ~31'i kare altyazısı (Design'ın kendi notu), gerisi gerekçe ve açıklama cümleleri.
Gerçek ürün arayüz metninde (düğme etiketi, başlık, tablo alanı) em dash **yok** — hepsi anlatım metninde.

**Design görüşü:** yasak İngilizce yazı geleneğinden geliyor (em dash yapay metin işareti sayılıyor). Türkçede
uzun çizgi ara söz ve açıklama için standart noktalama; TDK kullanıyor. Ama 157 kullanım artık üslup alışkanlığı,
ve aynı işi iki nokta, virgül ya da ayrı cümle daha net yapıyor:

> "Faz seçici çizilmedi — ailenin tamamı monofaze 230 V"
> → "Faz seçici çizilmedi: ailenin tamamı monofaze 230 V"

**Önerim:** tam yasak değil, **oran kuralı** — bir kare altyazısında en çok bir uzun çizgi, arayüz metninde hiç.
Böylece Türkçe noktalama korunur, alışkanlık kırılır. Kabuk v2'de bu kuralla yazacağım; onaylanırsa mevcut
dosyalarda geçmişe dönük temizlik ayrı bir tur (157 geçişin çoğu tek cümlelik düzeltme).

## Kabuk v2 kontrol listesi (bu denetimden çıktı)

Her kare teslim edilmeden önce:
1. Gradyan · cam · gölge · yarıçap · sonsuz animasyon: **0** (yanlış pozitif kalıpları hariç tutan betikle).
2. **K22:** metinde `opacity` yok; durum soluk hex + zemin + rozet ile.
3. **K23:** logo `brand/logo/` SVG'sinden; `clip-path` çizim yok.
4. `min-height:44px` her etkileşimli öğede; etkileşimsiz rozet hariç.
5. Kontrast: küçük metin ≥4.5:1, başlık ölçeği ≥3:1 — soluk hex çiftleri ölçülerek.
6. **K7:** boş alan satır olmaz, "veri yok" ve "yakında" yazılmaz.
7. Uzun çizgi: altyazıda en çok bir, arayüzde hiç (onay beklemede).
8. Mobil: 390 karesi var, ilk çocuk koyu kabuk, alt çubuk 4 sekme, kaydırma dışı taşma sıfır.

— DESIGN-MENU (Fable) 2026-09-05

