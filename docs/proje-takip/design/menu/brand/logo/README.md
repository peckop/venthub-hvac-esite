
# VentHub işareti — 14A-3

Daire içinde **dört eğik kanatçık dilimi.** Açık zeminde: üst dilim kiremit, ikinci lacivert,
alt ikisi turkuaz. Geometri: her dilim kutunun 1/4'ü yüksekliğinde; dilim çokgeni
`(0,T) → (W,T+h/4) → (W,T+3h/4) → (0,T+h/2)`; tümü daireye kırpılır.

Kaynak: `1 Venthub Marka Kilavuzu.dc.html` Bölüm A. Bütün ölçüler kılavuzun kendi
çizimlerinden **ölçülerek** alındı, yeniden yorumlanmadı.

## Koyu zemin dizilimi — ölçülmüş

Koyu zeminde **ikinci VE üçüncü** dilim beyaza döner:

```
açık zemin : kiremit · lacivert · turkuaz · turkuaz
koyu zemin : kiremit · beyaz   · beyaz   · turkuaz
```

Kılavuz bu dizilimi 14 yerde kullanıyor (26 · 30 · 34 · 62 · 70 · 72 px header ve şerit
örnekleri). Yalnız lacivert dilimi beyaza çevirmek yetmiyor — üçüncü dilim de beyaz olmalı,
yoksa turkuaz çift sıra hâlinde ağırlaşıyor ve işaret dengesini kaybediyor.

## Dosyalar — 28

### İşaret (7)
`venthub-isaret-[surum].svg` · viewBox 200×200

| Sürüm | Kullanım |
|---|---|
| `tamrenk` | Varsayılan, açık zemin |
| `tamrenk-koyu` | Koyu zemin (kiremit · beyaz · beyaz · turkuaz) |
| `ikirenk` | İki renk baskı (lacivert + turkuaz) |
| `lacivert` | Tek renk baskı |
| `beyaz` | Koyu zemin, tek renk |
| `turkuaz` | Yalnız turkuaz |
| `siyah` | Faks, tek renk siyah |

### Kilit (14)
`venthub-kilit-yatay-[surum].svg` — işaret 40 · aralık 12 · wordmark 24 px / −0.03em
`venthub-kilit-dikey-[surum].svg` — işaret 40 · aralık 10 · wordmark 17 px / −0.02em

Yedi sürümün her ikisi için de var.

### Favicon ve uygulama simgesi (4)
| Dosya | Ne |
|---|---|
| `venthub-favicon-16.svg` | Düz dilim, piksel ızgarasına oturur (yükseklik 3 / adım 4) |
| `venthub-favicon-32.svg` | Düz dilim (yükseklik 6 / adım 8) |
| `venthub-favicon-180.svg` | Tam kanatçık profili |
| `venthub-favicon-180-zemin.svg` | Lacivert zemin, yarıçap 36, işaret kare alanın %69'u |

### Avatar (2)
`venthub-avatar-koyu.svg` · `venthub-avatar-acik.svg` — 512×512, işaret kare alanın **%58**'i.
Yalnız işaret bulunur. Yarıçap yok — kare, platformun kendi maskesine bırakılır.

### Paylaşım görseli (1)
`venthub-paylasim-1200x630.svg` — lacivert zemin, güvenli alan kenarlardan 81 px
(kılavuzun 1100×578 çiziminde 74 px, 1200'e ölçeklendi). Sağdaki kiremit şerit sabit öğedir,
genişliği güvenli alanla aynı. Kiremit yalnız bu şeritte kullanılır, metinde kullanılmaz.
Slogan ve alt satır **yer tutucudur**.

## Wordmark

**Yola çevrilmedi ve çevrilmez.** Kilit SVG'lerinde `<text>` öğesidir: **Archivo 700**,
harf aralığı **−0.03em** (dikeyde −0.02em), her zaman **VentHub** (camel case).
`VENTHUB` ve `venthub` yazımları yasak — büyük harfli etiketin içinde bile camel-case kalır.
İşaret harf ikame etmez.

Archivo yüklü olmayan ortamda yedek yazı tipine düşer; kilidi kullanan yer Archivo'yu da
yüklemek zorundadır. Gerekçe: yola çevirmek yazım kuralını denetlenemez hâle getirirdi.
Archivo SIL OFL lisanslıdır, ticari kullanım serbest.

## Kurallar

- **Koruma alanı:** işaret yüksekliğinin yarısı, her yönde.
- **En küçük:** ekranda 16 px işaret / 96 px kilit · baskıda 6 mm işaret / 25 mm kilit.
- **16 ve 32 px'te dilimler düz** ve piksel ızgarasına oturur — kanatçık profili düşer.
  Favicon dosyaları bunu zaten uygular. 180 px'te tam profil.
- **Koyu zeminde `tamrenk-koyu` sürümü kullanılır** (yukarıdaki ölçüm).
- **Hareket:** dilimlerin aşağı akışı; yalnız 48 px üstünde, tek 2–3 sn döngü, ilk görünümde.
  **Favicon, evrak ve baskı daima statik.**
- **Yanlış kullanım:** döndürme, renk değişimi, gövdeye fotoğraf, yazı tipi değişimi, kiremitin
  başka dilime kayması, gölge veya hacim, dilim sayısını değiştirme.

## Ölçülü bir fark — dilim aralığı

Ana çizimlerde (40 · 72 · 90 · 200 px) dilimler bitişiktir. Kılavuzun **16 ve 32 px**
örnekleri 1–2 px aralık bırakıyor. Favicon dosyaları bu aralığı uygular; işaret ve kilit
dosyaları ana çizimi izler (bitişik). Başka bir boyda aralık istenirse bu bir **karar
sorusu**dur, çizim hatası değil.

## Neden bu klasör var

DESIGN-BELGE logo dilimlerini kılavuzun CSS'inden kopyalamıştı (kendi kaydında yazılı,
referans verilmemiş). Bu klasör o kopyanın tek kaynağıdır: bundan sonra işaret gereken her yer
buradan alır, CSS'ten kopyalanmaz.

Prova: `3 Venthub Logo SVG Provasi.html` (proje kökü) — açık/koyu zemin, iki kilit dizilimi, favicon,
avatar, paylaşım görseli, ölçek satırı.

