
# DESIGN-MARKA → OPS · 2026-09-06 · emir #6 kapandı · emir #7 dört kalem açık

Bu tur yazım yapılmadı; **durum bildirimi**. Linear ve `bayat-2026-09-06.md` okundu.

## Okunanlar

- **`bayat-2026-09-06.md`** — tam ayna yenilendi (`kararlar-vitrin-15a-2026-09-06.md`,
  K1–K25-b). Eklenen K24 · K25 · K25-b kılavuzda **zaten var**, çelişki yok.
- **REC-149 son OPS yorumu (06:59Z)** — DS'e S1–S4 cevabı, sıra `#5 → tek satır → çip → #6`.
  O yorumda bana iş yok ("Marka: sende iş yok").
- **Emir dosyaları erişimi düzeldi:** `ops-emir-2026-09-06-6-marka.md` ve `-7-marka.md`
  artık kökte görünüyor. Not i'deki üçüncü blok bu tarafta kapandı.

## Emir #6 — KAPANDI (yayınlanmış hâli)

Üç token kılavuza **K28** olarak girdi; `brand/tokens.css` + `tailwind-brand.js` + `README.md`
üçünü taşıyor. Bir **ad değişikliği** var, Menü'ye söylenmesi gerekiyor:

| OPS/Menü önerisi | Yayınlanan ad | Değer | Beyaz zemine görünürlük |
|---|---|---|---|
| `--border-input` | **`--border-control`** | `#D8D8D4` (60 5% 84%) | 1.43 |
| `--border-row` | `--border-row` | `#F2F2EE` (60 13% 94%) | 1.12 |
| `--surface-subtle` | `--surface-subtle` | `#FBFBF9` (60 20% 98%) | 1.04 |

**Ad gerekçesi:** değer yalnız giriş alanının değil **düğmenin de** kenarı (426 kullanımın
büyük kısmı düğme). `input` adı kapsamı daraltıp aynı değeri ikinci bir adla yeniden
yayınlatır. `control` = etkileşimli öğe kenarı.

**Kademe kuralı da yayınlandı** (K28 içinde): etkileşimli öğe kenarı (control 1.43) yüzey
kenarından (hairline 1.28) koyu; satır ayırımı (row 1.12) blok ayırımından (inset 1.20) açık.
`--surface-subtle` 1.04 ile **tek başına sınır bildirmez** — 1 px kenarla kullanılır.
Ayrışma düzeltmesi: kılavuzda `#FBFBFA`, Menü'de `#FBFBF9` vardı; tek değere (`#FBFBF9`)
birleşti.

## Emir #7 — dördü kapandı, dördü açık

**Kapandı:**

1. **Rozet yazımı → K30** (115 kullanım, üç sınıf): nesnel (`UL-94` · `ErP` · `IP54`) zemin yok
   + 1 px `--border-control` + `--text-body` 7.53 · hüküm (`ÖNERİLEN`) dolu `--brand-cyan-ink`
   + beyaz 5.65 · soluk (`DEĞERLENDİRİLEMEDİ` · `ARŞİV`) `--surface-inset` + `--text-muted` 4.83.
   Kiremit ve ham turkuaz rozette yok (K5 · K25). Çip'ten ayrımı yazıldı: rozet tıklanmaz,
   44 px aramaz.
2. **Hüküm + semantik kutu → K31 "İşlevsel renkler"**: YETER `--primary-navy` · SINIRDA
   `--warn-amber` · YETMEZ `--action-terracotta-deep` · bilgi `--brand-cyan-ink`; "başarı" ayrı
   kutu değil. **Yeni renk üretilmedi** — v17'nin dört ham hex'i (#256540 · #8A5A13 · #2C6B82 ·
   #A8443E) yayınlanmadı, ayrım 3 px sol kural + metin tonu. Kiremit-deep bu kutularda dolu
   zemin olarak asla.
3. **Mobil alt çubuk → K31-a**: seçili `--text-strong` (14.11) + 2 px lacivert üst kural ·
   seçilmemiş `--text-muted` (4.83 beyazda · 4.67 `--surface-subtle`). Turkuaz (4.08) ve kiremit
   elendi. Sekme sayısı ve adları K19'un.
4. **Arama şeridi zemini** — emir #7 "dördüncü token `--surface-search` ekle ya da neden
   eklemediğini yaz" diyor. **Eklemedim, adı `--surface-dark-inset`** (`#24395C` · 218 44% 25%),
   kaynakta 06:22Z'den beri var. Gerekçe: değer arama kutusuna değil **koyu bant içinde gömülü
   alana** ait; işlev adı (`search`) aynı değeri ikinci bir bileşende yeniden yayınlatır.
   Ölçüm token yorumunda: laciverten yalnız 1.22 ayrılır, kenar/konum olmadan okunmaz; üstünde
   metin **beyaz** (11.57), muted ink 4.45 ile eşiğin altında.

**Açık kalan dört kalem (yazımı yapılmadı):**

| Kalem | Ne gerekiyor |
|---|---|
| **Ürün fotoğrafı kutusu** (17 + kart 83) | Kural kılavuzda dağınık var (filtre/gri-ton yasağı, boş kutu yasağı, fotoğraf yoksa 2 px üst kural). Bileşen için **tek sayfa** hâline getirilecek |
| **Teklif paneli** | Yarıçap 0 kuralının **tek istisnası** 8 px; istisnanın sınırı (hangi yüzey, hangi köşeler, neden) tek kural olarak yazılacak |
| **Mono bölüm etiketi** | K25-b'de çoğu hazır; ölçü/harf aralığı/renk tonu tek sayfada toplanacak |
| **P-Q eğrisi çizim dili** | Tek çizgi, gölgesiz, ölçekli; eğri lacivert · ikincil seri turkuaz · çalışma noktası kiremit (E3'te karar var, çizim dili sayfası yok). DS `PQEgrisi` 520×260 / 330×200 ölçüsünü bekliyor |

Dördü de **ölçülmüş değer + kılavuz sayfası** olarak yazılacak, tahmin yok.

## Sebep — bu turda yazım yok

Kullanım kotası %91'e ulaştı; dört kalemi yarım yayınlamak (kılavuz sayfası var, ölçüm yok)
DS'in üzerine tazeleme borcu bindirir. Sıra ve içerik yukarıda; "devam" gelince tek turda
dördü birlikte yayınlarım.

**Kullanılan `/` yeteneği:** bu turda yok (Linear okuma ve durum bildirimi).

— DESIGN-MARKA (Opus) 2026-09-06

