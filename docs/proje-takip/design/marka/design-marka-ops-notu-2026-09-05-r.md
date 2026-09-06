
# DESIGN-MARKA → OPS · 2026-09-05 · soluk işaret kaynağa yazıldı

`ops-emir-2026-09-05-2-marka.md` işi. DS aynı iki dosyayı kendi `assets/logo/`'suna üretmişti;
**kaynak `brand/logo/`** bende olduğu için emrin asıl hedefi burasıydı. Üretildi.

## İki yeni dosya

| Dosya | Renk | Kullanım |
|---|---|---|
| `brand/logo/venthub-isaret-soluk.svg` | `#7A8290` | Açık zemin, seçilmemiş/edilgen hâl |
| `brand/logo/venthub-isaret-soluk-koyu.svg` | `#8FA2BD` | Koyu zemin |

`#7A8290` DESIGN-MENU'nün soluk sekme metniyle aynı; `#8FA2BD` bizim
`--text-on-dark-muted` tokenı — yeni renk icat edilmedi.

**Geometri ana çizimin birebir aynısı**, üreteci de aynı: 200×200, `r=100` daire kırpması,
dört eğik dilim (`0,0 200,12.5 200,37.5 0,25` ritmi). Tek renk, yarıçap ve gölge yok.
`brand/logo/` **28 → 30**, işaret 7 → 9.

## Ölçülen kontrast

Soluk hâl bilgi taşımaz, o yüzden eşik aranmadı; sayılar kayıt için:

| Renk | Zemin | Kontrast |
|---|---|---|
| `#7A8290` | beyaz | **3.87:1** |
| `#7A8290` | sayfa `#F4F4F2` | **3.52:1** |
| `#8FA2BD` | bant `#1A2B4A` | **5.42:1** |
| `#8FA2BD` | utility `#0F1723` | **6.92:1** |

DS'in ölçtüğü 5.35 ile benim 5.42'im arasındaki fark yuvarlama; aynı çift.

## Kural olarak yazıldı

K23 maddesine eklendi: **sönükleştirme de dosyadan gelir** — `filter: grayscale()`, `opacity`
veya çalışma anında renk değişimi kullanılmaz. Bu K22'nin (alfa ile durum anlatma yasağı) ve
K23'ün (logo elle çizilmez) kesişimi; ikisi ayrı ayrı yazılıydı, bu hâl ikisine de giriyordu.
`brand/logo/README.md` işaret tablosuna iki satır ve ölçüm bloğu kondu.

## Senden bekleyen tek şey

**Yeniden yayın.** DS'te varlık (2 SVG) ve bileşen (`Kart`) değişti — Published'ı yeniden
işaretlemek Recep'te. DS notu da bunu yazmış.

DS'in kapanış turunda bulduğu iki kaynak kusuru (`Kart` kapsam dışı `opacity: 0.5` ve
`Kart`'ın hiç çizilmeyen üst kenarı) doğru düzeltmeler; ikincisi altı bileşenden birindeydi,
yani her tüketici düzenine taşınıyordu. Kaydıma ayrı kural olarak eklenmesi gerekmiyor —
K22 zaten kapsıyor, kenar kusuru ise bileşen hatasıydı, marka kuralı değil.

**Kullanılan `/` yeteneği:** bu turda yok (SVG üretimi ve ölçüm).

— DESIGN-MARKA (Opus) 2026-09-05

