
# Desen envanteri — beş ekran dosyası (DESIGN-MENU, 2026-09-06)

Emir #4 · K27. **Ölçüm turu, çizim yok.** Eşik: **≥2 ekranda geçen desen = bileşen ADAYI**; 1 ekranda geçen
ekranın kendi işi.

Taranan beş dosya: `Menü Tasarımı v17` (28 kare + 2 toplu bölüm) · `ARSIV Venthub Ana Sayfa v11` ·
`Urun Sayfasi v2 Hikaye` · `Ürün Seçici Karşılaştırma` · `Ürün Seçimi Alternatifleri v3`.

Yöntem: her desen için ayırt edici DOM/metin imzası yazıldı, beş dosyada ayrı ayrı sayıldı. **Sayılamayan
sütun boş bırakıldı** — özellikle "kimlik kuralı gerektiriyor mu" sütunu benim değil Marka'nın hükmü, ben
yalnız *gerekip gerekmediğini* işaretliyorum.

Sayım notu: imza sayısı kullanım sayısıdır, kare sayısı değil (bir karede aynı desen 12 kez geçebilir).

---

## A · Bileşen adayı (≥2 ekranda) — 17 desen

| # | Desen | Ekran | Kullanım | Varyantlar (ölçülen) | Ölçüler | DS'te karşılığı | Kimlik kuralı (Marka) | Yerleşim kuralı (Design) |
|---|---|---|---|---|---|---|---|---|
| 1 | **Kabuk bandı** | 2 | **92** | rol header 84 / footer 4 · yükseklik 74 (41) · 121 (9) · 60 (32) · 56 (2) | 74 px · oluk 40 · aralık 30 | ✅ **`KabukBandi`** | — | tam genişlik, oluk bileşenden |
| 2 | **Rozet** (mono büyük harf) | 4 | **115** | ARŞİV 3 · KAPALI BEKLER 19 · TWEAK 2 · UL-94 11 · ErP 6 · IP44 1 · ÖNERİLEN 5 | 10–10,5 px mono · `letter-spacing:.1em` · padding 3–5/7–9 | ❌ yok | **gerekiyor** — yazım (büyük harf, kısa), hangi rozet hangi tonda | çip değil rozet: tıklanmaz, 44 px aramaz |
| 3 | **Teklif paneli / alt panel** | 3 | **86** | masaüstü panel (360 px, 8 px köşe) · mobil alt panel · İletişim üç niyet grubu | `--radius-panel` 8 px · satır 44–60 px | ❌ yok | **gerekiyor** — 8 px köşe tek istisna, panel dili | niyetle gruplama (K19 m.3) |
| 4 | **Ürün kartı** (model kartı) | 3 | **83** | fotoğraflı 54 · fotoğrafsız 2 px üst kural 3 · ÖNERİLEN rozetli 5 · seçili 2 px kenar 27 | foto kutusu 1 px `--border-hairline` · kart 1 px | ❌ (`Kart` var ama ürün kartı değil) | **gerekiyor** — fotoğraf kutusu kuralı, boş kutu yasağı | eylem seti (Karşılaştır + Teklif listesine ekle), hepsi çerçeveli |
| 5 | **Mono bölüm etiketi** (eyebrow) | **5** | 70 | tek varyant | 11 px mono · `.14em` · uppercase · `--brand-cyan-ink` | ❌ yok | **gerekiyor** — turkuaz mürekkep kuralı (K25-b) | bölüm başlığının üstünde, tek satır |
| 6 | **Arama şeridi** | 4 | **63** | masaüstü 408 px · mobil tam genişlik 354 · iç sayfa 60 px bant | zemin `#24395C` · beyaz metin · min 40–44 px | ❌ yok | **gerekiyor** — zemin rengi tokensiz (sözleşme v1.2) | bant içinde tam genişlik; gövdede açık yüzey |
| 7 | **Çerçeveli düğme** | 2 | **57** | açık zemin · `koyuZemin` · tam genişlik | 1 px `--primary-navy` · min 44 px | ✅ **`CerceveliDugme`** | — | kiremit dışı her eylem (K5) |
| 8 | **Mobil alt sekme çubuğu** | 3 | **48** | 4 sekme 40 · 5 sekme **0** (K19 sonrası) · satış kipi (Sepet) · geri dönüş (İletişim) | `repeat(4,1fr)` · 22 px ikon · 11 px etiket | ❌ yok | **gerekiyor** — hangi dört sekme, seçili hâl rengi | seçili lacivert dolu, kiremit yok |
| 9 | **Matris / teknik tablo** | 3 | **44** | Klasik · Konuşan (değer↔anlam) · aile tablosu (12 satır) · karşılaştırma | `190px 150px 1fr` · satır 36–44 px · Plex Mono tabular | ✅ **`TeknikTablo`** | — | K7 gömülü: boş satır çizilmez |
| 10 | **Hüküm kutusu** | 2 | **39** | YETERLİ 12 · YETER 6 · YETMEZ 5 · SINIRDA 2 · DEĞERLENDİRİLEMEDİ | 3 px sol kural · semantik zemin+ton | ❌ (DS "bilinçli eksik") | **gerekiyor** — dört semantik çift, ton değerleri | sebep + gerekli değer aynı kutuda |
| 11 | **Semantik kutu** (3 px sol kural) | 4 | **31** | bilgi (turkuaz) · başarı (yeşil) · hata (kırmızı) · uyarı (amber) | 3 px sol kural · padding 10–14/14–18 | ❌ (aynı eksik) | **gerekiyor** — dört çift | yalnız semantik içerik; süs değil |
| 12 | **Adet kontrolü** (− n +) | 2 | **22** | teklif listesi · sepet · iade kalemi | 34–36 px hücre · min 44 px · 1 px kenar | ❌ yok | — | 44 px zorunlu (S1 ihlali buradan çıktı) |
| 13 | **Varyant/seçici çipi** | 3 | **18** | Çap · Motor · Dönüş yönü · Faz · Versiyon | min 44 px · seçili 1,5 px kenar | ⚠️ **`Cip`** kısmen (faset/bağlam rolü var, varyant rolü yok) | — | seçim adresi değiştirir (`?sku=`) |
| 14 | **Niyet/mekân çipi şeridi** | 3 | **17** | mekân (7 çip) · niyet (6) · giriş sınıfı (3) | yatay kaydırma · min 44 px · ikon yok | ⚠️ **`Cip`** kısmen | — | ikon yok (kabul edilmiş Design eklemesi) |
| 15 | **Ürün fotoğrafı kutusu** | 2 | **17** | 300×132 · 462×340 · 64 px liste · 52–56 px kalem | beyaz + 1 px `--border-hairline` | ⚠️ `Kart` yakın ama fotoğraf kuralı yok | **gerekiyor** — filtre/gri-ton yasağı, boş kutu yasağı | fotoğraf yoksa kutu kalkar, 2 px üst kural |
| 16 | **P-Q eğrisi** (SVG grafik) | 3 | **6** | tam (masaüstü) · kısa (mobil) · çalışma noktası işaretli | 520×260 / 330×200 | ❌ yok | **gerekiyor** — çizim dili (tek çizgi, gölgesiz) | veri yoksa bölüm hiç çizilmez |
| 17 | **Katlı çağrı satırı** (44 px) | 2 | **5** | kapalı (▼) · açık (▲) · dolu geliş | min 44 px · 1 px `--primary-navy` | ⚠️ `CerceveliDugme` yakın | — | kiremit değil çerçeveli (madde 35) |

## B · Aday değil (1 ekranda) — 7 desen

| Desen | Kullanım | Neden ekranın kendi işi |
|---|---|---|
| **Ana eylem düğmesi** (kiremit) | 42 | DS'te **`AnaEylemDugmesi`** var; tek ekranda görünmesi K5'in sonucu (sayfada tek) |
| **İlerleme/durum çizgisi** | 20 | Yalnız satış kipi (ödeme adımları, kargo durumu, iade durumu) |
| **KAPALI BEKLER rozeti** | 19 | Satış kipine özel; rozet deseninin (2) bir üyesi |
| **Süzgeç paneli** | 16 | Yalnız liste ekranları (06 · 06b · 08); tek dosyada |
| **Açılır kategori paneli** | 15 | Yalnız menü ekranı (02 · 03) |
| **Boş sonuç ekranı** | 8 | Yalnız 06b · 08b |
| **Kanıt/gerekçe satırı** | 8 | Yalnız ürün sayfası hesap paneli |

---

## Özet ve okuma

- **Ölçülen desen: 24.** Aday **17**, aday değil **7**.
- **DS'te tam karşılığı olan: 3** (`KabukBandi` 92 · `CerceveliDugme` 57 · `TeknikTablo` 44 — ama
  `TeknikTablo` **hiç mount edilmiyor**, tablolar elle çizili).
- **Kısmi karşılık: 4** (`Cip` iki desende rol eksiği ile, `Kart` iki desende).
- **Karşılığı hiç olmayan aday: 10** — rozet · teklif paneli · ürün kartı · mono etiket · arama şeridi ·
  mobil alt çubuk · hüküm kutusu · semantik kutu · adet kontrolü · P-Q eğrisi.
- **Kimlik kuralı gerektiren (Marka): 9** desen işaretli. En acil üçü: **rozet yazımı** (115 kullanım,
  6 tür) · **hüküm kutusu tonları** (DS'in "bilinçli eksik"i, 39 kullanım, dört semantik çift) ·
  **fotoğraf kutusu kuralı** (17 kullanım, boş kutu yasağı zaten kılavuzda ama bileşen yok).

**Kendi ölçümümden çıkan bir çelişki:** DS'te `Kart`, `Cip` ve `TeknikTablo` **var** ama v17'de üçünün
mount sayısı **0**. Yani K27'nin "ekranlar bileşene döner" adımı yalnız yeni bileşenleri değil, **mevcut üç
bileşeni de** kapsıyor. Bu, "bundle yüklemek yetmez, bileşen mount edilir" kuralının üçüncü tekrarı olur.

**Öneri (sıra, K27'nin adımına ek):** yeni bileşen üretmeden önce mevcut üçü mount edilsin — `TeknikTablo`
44 kullanımla en yüksek getirili, `Cip`'in varyant rolü eklenmesi 35 kullanımı (13+14) kapsıyor. Ölçüt:
elle çizim 0.

— DESIGN-MENU (Fable) 2026-09-06

