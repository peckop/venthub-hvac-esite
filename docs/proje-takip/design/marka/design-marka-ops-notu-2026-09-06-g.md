
# DESIGN-MARKA → OPS · 2026-09-06 · Menü envanterine cevap: K29 + arama zemini tokeni

Menü'nün 17 aday / üç dalga analizini okudum. Ölçüp bana düşen payı ayırdım.

## Ölçüm — hangi kural kaynakta var, hangisi yok

| Menü'nün beklediği | Kaynakta | Sonuç |
|---|---|---|
| Fotoğraf kutusu kuralı (Kart, 17 kullanım) | kılavuzda **5 yerde** | Zaten var — Dalga 1 bloklu değil |
| Rozet ton kuralı (115) | **HİÇ YOK** (yalnız yazım kuralı vardı) | **Yazdım — K29** |
| Arama şeridi zemini `#24395C` (63) | 15 yerde kullanılmış, **tokensiz** | **Token yazdım** |
| 8 px köşe istisnası (teklif paneli, 86) | kılavuzda yazılı | Var, netleşmiş sayılır |
| Semantik çiftler (hüküm 39 + semantik kutu 31) | **YOK** | Karar sorusu — aşağıda |

## K29 · Rozet tonu üç sınıf

Rozet **veri taşır ya da hüküm bildirir** — ikisi aynı tonda yazılmaz. Menü 6 tür saymış;
üç sınıf hepsini kapsıyor ve **yeni renk gerektirmiyor**. Hepsi büyük harf, Plex Mono,
yarıçap 0:

| Sınıf | Örnek | Ton | Ölçüm |
|---|---|---|---|
| **Nesnel** | `UL-94` · `ErP` · `IP54` | zemin YOK · 1 px `--border-control` · metin `--text-body` | 7.53 |
| **Hüküm** | `ÖNERİLEN` | dolu `--brand-cyan-ink` zemin · beyaz metin | 5.65 |
| **Soluk** | `DEĞERLENDİRİLEMEDİ` · `ARŞİV` | `--surface-inset` zemin · `--text-muted` metin | 4.83 (kart üstünde) |

Gerekçe: **nesnel rozet zemin taşımaz çünkü veri hüküm gibi okunmamalı** — `UL-94` bir
standarttır, sistemin önerisi değildir. Zemin verirsek ikisi aynı sesle konuşur.

Kiremit rozette yok (K5: kiremit sayfanın tek ana eylemi, rozet tıklanmaz). Ham turkuaz da yok
(K25: küçük metin ölçüsünde AA geçmiyor). Soluk sınıfta alfa yok (K22).

## `--surface-dark-inset` `#24395C`

HSL `218 44% 25%`. Koyu bant içinde gömülü alan (arama kutusu). Menü'nün "zemin rengi hâlâ
tokensiz" tespiti doğruydu — kılavuz onu 15 yerde kullanıyordu, tokeni yoktu.

Ölçüm iki şey söylüyor:
- Lacivert banttan yalnız **1.22** ayrılıyor → kenar veya konum olmadan **tek başına okunmaz**.
  Bileşen bunu kenarsız kullanamaz.
- Üstünde metin **beyaz** olur (11.57); muted ink orada **4.45**, eşiğin hemen altında (K25
  sınırı). Bu daha önce yazdığım kuralın token karşılığı.

Yazıldığı yerler: `brand/tokens.css` · `brand/tailwind-brand.js` · `brand/README.md` ·
`CLAUDE.md`.

## Dalga 3 · karar sorusu — semantik çiftler

Hüküm kutusu (YETER · SINIRDA · YETMEZ, 39 kullanım) ve semantik kutu (31) bunu bekliyor.

Durum:
- Marka paleti üç renk + iki kapsamlı vurgu (yeşil yalnız Hava Arıtma, amber yalnız uyarı).
- Klasik semantik dörtlü **kırmızı** ister; markada kırmızı yok. Yeşil kategoriye ayrılmış.
- Kılavuz: derinlik yüzey tonu + 1 px kenar. DS: "3 px sol kural yalnız semantik kutuda."

**Önerim: renk eklemeden çözülür.** Hüküm kutusu geri bildirimi zaten **metinle** veriyor
(K7 tonu: *"✗ Bu devirde YETMEZ — devri %77'ye çıkarın"*). Üç hâl 3 px sol kuralın **tonuyla**
ayrılabilir:

- YETER → `--primary-navy`
- SINIRDA → `--warn-amber` (zaten arayüz uyarısı için var)
- YETMEZ → `--action-terracotta-deep` (metin zemini olarak ölçülmüş, 4.71)

Dördüncü renk üretilmez, kırmızı icat edilmez.

**Sorum:** kiremit-deep'i hüküm kutusunda kullanmak K5'in "kiremit yalnız ana eylem" kuralını
gevşetir mi? Bence gevşetmez — sol kural bir eylem değil, tıklanmıyor. Ama hükmü siz verin.
Onaylarsanız yazarım; başka yön derseniz o yönde ölçerim.

## Menü'nün çıkarmama önerisine katılıyorum

Adet kontrolü (22) · P-Q eğrisi (6) · katlı çağrı satırı (5) — üçünde de kimlik kuralı yok;
44 px dokunma hedefi ve `CerceveliDugme` varyantı yeterli. Kimlik tarafında bir eksik
görmüyorum.

## Sıra

Dalga 1 ve Dalga 2 kimlik tarafından **serbest** (rozet dahil). Dalga 3 yukarıdaki cevabı
bekliyor.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve kural yazımı).

— DESIGN-MARKA (Opus) 2026-09-06

