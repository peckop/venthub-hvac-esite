
# DESIGN-MARKA → OPS · 2026-09-06 · emir #7 KAPANDI — dokuz desenin kimlik kuralı yayında

Emir #7'nin açık kalan dört kalemi yazıldı. Kılavuza **Bölüm F** açıldı (F1–F8); her kural
ölçülmüş değerle, tahmin yok. Kaynak: `1 Venthub Marka Kilavuzu.dc.html` · karar kaydı
`CLAUDE.md` (K32–K35 eklendi) · `brand/README.md` (türev paket).

## Bu turda yayınlanan dört kural

**K32 · Ürün fotoğrafı kutusu → kılavuz F5** (17 + kart 83 kullanım)
Kutu beyaz yüzey, 1 px `--border-hairline`, yarıçap 0, gölge yok; fotoğraf beyaz fonlu, kutu
içinde ortalanır, **koyu zemine konmaz**. Fotoğraf yoksa **kutu kaldırılır**, kart 2 px lacivert
üst kural ile başlar — boş kutu, "görsel yok" yazısı, yer tutucu ikon yok (K7).
Yasak: filtre, gri-ton, hover dönüşümü, ölçek/parlaklık oyunu, alfa (K22).
**Fotoğrafın üstüne rozet/etiket/metin bindirilmez** — rozet kutunun altındaki metin bloğunda.
Kutu oranı ve kart ızgarası **yerleşimdir, sahibi DESIGN-MENU** (K11); kimlik tarafı kenar tonu,
beyaz zemin, boş kutu yasağı, üst kural. F5 kartında iki kart yan yana: fotoğraflı ve fotoğrafsız.

**K33 · Yarıçapın tek istisnasının sınırı → F6**
`--radius-panel` 8 px **yalnız yüzen panelin üst iki köşesi** (teklif paneli, mobil alt panel);
alt köşeler 0, panel ekran kenarına oturur. **Panelin içindeki hiçbir öğe yarıçap almaz** —
düğme, giriş, kart, rozet, çip 0 kalır. Gölge yok: yüzme 1 px kenar + `rgba(26,43,74,0.45)`
perde + perdenin altında **kısılmış gerçek kabuk** ile anlatılır, boş perde çizilmez.
Panelin içindeki tek dolu kiremit düğme sayfanın işini bitirir: "Teklif talebini gönder" (K5).
**İstisna genişletilmez** — yeni bir bileşen 8 px isterse ayrı karar turu.

**K34 · Mono bölüm etiketi → F7**
IBM Plex Mono, büyük harf, boy **9 · 11 · 12 px**, harf aralığı **0.08–0.14em** (boy küçüldükçe
artar), sayı taşıyorsa `tabular-nums`; etiket sarmaz, kısaltılır. Renk zemine göre:

| Zemin | Ton | Ölçüm |
|---|---|---|
| Kart/beyaz · turkuaz etiket | `--brand-cyan-ink` | 5.65 (ham #0088B0: 4.08 — kullanılmaz) |
| Kart/beyaz · ikincil etiket | `--text-muted` | 4.83 |
| Sayfa zemini #F4F4F2 | `--text-body` | 6.83 (muted orada 4.39) |
| Koyu bant | `--text-on-dark-muted` | 5.42 · 6.92 |
| `--surface-dark-inset` #24395C | beyaz | 11.57 (muted ink 4.45, eşiğin altında) |

Büyük harf **yalnız etiket ve rozete** aittir; marka ve ürün adı büyük harfe çevrilmez (E2).

**K35 · P-Q eğrisi çizim dili → F8**
Üç çizgi ağırlığı: ana eğri 2 px lacivert · ikincil seri 1.5 px turkuaz · ızgara 1 px
`--border-row`, eksen 1 px `--border-control`. Dördüncü seri gerekirse **kesikli lacivert**,
yeni renk eklenmez. **Çalışma noktası kiremittir:** 5 px dolu daire + 1 px düşey iniş + mono
etiket; grafikteki tek kiremit odur, **eğri asla kiremit çizilmez** (K5).
Yasak: alan dolgusu, gradyan, gölge, 3B, yuvarlatılmış uç, animasyonlu çizim, ok başı.
Birim etikette yazılır (m³/h · Pa), eksende tekrar edilmez.
**Ölçü: 520×260 masaüstü / 330×200 mobil** — DS'in `PQEgrisi` beklediği ölçü budur; ızgara dört
yatay + dört düşey, mobilde ikincil seri düşer, çalışma noktası düşmez. Verisi olmayan modelde
eğri çizilmez, hüküm de verilmez (K7). F8'deki çizim **yer tutucu değerlerle** gerçek ölçüde.

## Bölüm F · tamamı

| Kart | Kural | Karar |
|---|---|---|
| F1 | Kenar ve yüzey kademesi (dört ton, bozulmaz sıra) | K28 · emir #6 |
| F2 | Rozet yazımı, üç sınıf + çipten ayrım | K30 |
| F3 | İşlevsel renkler / hüküm kutusu | K31 |
| F4 | Mobil alt sekme çubuğu, hâl rengi | K31-a |
| F5 | Ürün fotoğrafı kutusu | **K32 (yeni)** |
| F6 | Yarıçapın tek istisnası, 8 px panel | **K33 (yeni)** |
| F7 | Mono bölüm etiketi | **K34 (yeni)** |
| F8 | P-Q eğrisi çizim dili | **K35 (yeni)** |

F4'teki sönük sekme işareti dosyadan geliyor (`venthub-isaret-soluk.svg`) — K23 gereği elle
çizim ve `filter` yok.

## Yol üstünde düzeltilen üç bayat satır (`brand/README.md`)

1. "26 dal için ikon çizilmez" → **dal sayısı yazılmaz** (ölçülmedi; sayı REC-135'te tartışmalı).
2. "Koyu zeminde lacivert dilimler beyaza döner" → **ikinci ve üçüncü dilim** beyaza döner
   (kiremit · beyaz · beyaz · turkuaz); dosya adı ve K23/K22 yasağı eklendi.
3. Depoya alma 5. madde: "deponun koyu-mod-birincil kurgusu vitrinde terk edilir" → **ölçülmedi**,
   iddia geri alındı (OPS 5 Eylül düzeltmesiyle aynı hizaya geldi).

## DS'e ne düşer

Yeni değer **yok** — dört kuralın hiçbiri token eklemiyor, hepsi mevcut tokenların kullanım
hükmü. DS tarafında etkilenen: `Kart` (fotoğraf kutusu + üst kural), `--radius-panel` kullanımı,
mono etiket tonu ve (varsa) `PQEgrisi` bileşeninin ölçüsü. `brand/` paketi tazelendi; DS'in
kendi kopyası **kaynaktan yeniden alınmalı**, ardından üç tüketici projede çip kaldır-yeniden seç.

## Açık kalan (bende iş yok)

- Menü'ye söylenecek ad değişikliği: `--border-input` → **`--border-control`** (emir #6, not j).
- K27 sırasının kalanı: DS bileşene çevirir → ekranlar o bileşenleri kullanmaya döner.
- Boşluk ölçeği tokenı hâlâ bilinçli eksik; ayrı karar turu bekliyor.

**Kullanılan `/` yeteneği:** bu turda yok (kılavuz yazımı, DC düzenlemesi).

— DESIGN-MARKA (Opus) 2026-09-06

