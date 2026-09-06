
# DESIGN-MARKA → OPS · 2026-09-06 · K25-b kaynağa yazıldı + kılavuzda iki ihlal düzeltildi

DS emir #1–#3'ü bitirmiş ve iki yeni token üretmiş. **Kaynak tarafı eksikti**, tamamladım.
Bir de kılavuzun kendi çizimlerinde iki ihlal buldum.

## 1 · Tek DEĞER dosyası kuralı ihlal edilmişti

DS yorumunda *"Yazıldığı yerler: `brand/tokens.css` (tek DEĞER dosyası) + `tokens/renk.css`"*
yazıyor. Ama `brand/tokens.css` **bu projede** ve iki token orada **yoktu** — DS kendi
projesindeki `brand/` kopyasına yazmış. Kural gereği kaynak burasıdır; türev kopya kaynaksız
kalmıştı.

Kaynağa yazıldı: `brand/tokens.css` · `brand/tailwind-brand.js` (Tailwind eşlemesi) ·
`brand/README.md` (palet tablosu + kural paragrafı) · `CLAUDE.md` (K25-b kaydı).

## 2 · DS'in beş sayısını bağımsız ölçtüm — hepsi doğru

| Ölçüm | DS | Ben |
|---|---|---|
| `#00708F` metin, beyaz | 5.65 | **5.65** ✓ |
| `#00708F` metin, `#F4F4F2` | 5.13 | **5.13** ✓ |
| `#00708F` zemin + beyaz metin | 5.65 | **5.65** ✓ |
| `#BF5309` zemin + beyaz metin | 4.71 | **4.71** ✓ |
| Ham `#D95D0E` + beyaz metin | 3.80 | **3.80** ✓ |
| `--text-body` / `#F4F4F2` | 6.83 | **6.83** ✓ |
| `--text-muted` / beyaz · `#F4F4F2` | 4.83 · 4.39 | **4.83 · 4.39** ✓ |

DS'in kendi düzeltmesi de yerinde: önce 7.26 ve 3.87 yazmış, sonra 6.83 ve 3.80'e çekmiş —
doğrusu ikincisi.

## 3 · Yeni sınır buldum: `--brand-cyan-ink` koyu zeminde de kullanılmaz

K25-b `--brand-cyan-ink`'i *"hem küçük metin hem sayaç zemini"* diye tanımlıyor. Küçük metin
şartı **yalnız açık zeminde** sağlanıyor. Koyu zeminde ölçtüm:

| Zemin | `#00708F` |
|---|---|
| `#1A2B4A` bant | **2.50** ✗ |
| `#0F1723` utility | **3.18** ✗ |

Ham turkuazdan (3.46 · 4.41) **daha kötü** — mürekkep tonu koyulaştığı için koyu zeminde
kaybediyor. Yani koyu bantta küçük metin hâlâ `--text-on-dark-muted` #8FA2BD'dir; cyan-ink
oraya girmez. Token yorumuna ve K25-b kaydına bu sınır yazıldı.

Bu bir çelişki değil, kapsam netleştirmesi: cyan-ink açık zemin mürekkebi + sayaç zemini.

## 4 · Kılavuzun kendi çizimlerinde iki ihlal — düzeltildi

Kaynak dosya kendi kuralını çiğniyordu:

- **10 yerde ham kiremit üstünde beyaz metin** (`background:#d95d0e;color:#ffffff`) = 3.80:1.
  `#BF5309`'a çevrildi → 4.71.
- **12 yerde "Teklif al"** yazıyordu. K5 ile bu yazım kalkmıştı; tek fiil "Teklif iste".
  Hepsi düzeltildi, kalan 0. Dördü düğme etiketi, ikisi açıklama metniydi.

İkincisi utandırıcı: K5'i kendi kaydıma 5 Eylül'de yazmışım, kılavuz çizimlerini
güncellememişim. Kural metni ile çizim ayrışmış, ölçüm bunu ancak bugün yakaladı.

Kalan 28 ham `#d95d0e` kullanımı yerinde: 23'ü **logo üst dilimi** (ham kiremit doğrusu),
5'i **palet swatch'ı** (rengi göstermek için ham olması gerekir). Metin zemini olarak kullanım
kalmadı.

## 5 · Kapsam dışı bıraktığım bir gözlem

Kılavuz logo örneklerini hâlâ **CSS `clip-path` ile çiziyor** (23 dilim). K23 *"logo elle
çizilmez, dosyadan gelir"* diyor ve kaydımda *"mevcut CSS çizimleri kendi turlarında SVG'ye
döner"* yazılı — ama o satır DESIGN-MENU kabuğu ve DESIGN-BELGE belge kabuğunu sayıyor,
kılavuzun kendisini saymıyor.

Kılavuz kimliğin **kaynağı**: örnekleri `brand/logo/` dosyalarına çevirmek doğru mu, yoksa
kaynak dosyanın çizimi taşıması mı gerekir? Bu bir karar sorusu, kendi başıma değiştirmedim.

## Recep'e

DS "üç tüketici projede çipi kaldır-yeniden seç" demişti; bu projede token ve kılavuz da
değişti. Yeniden bağlamadan sonra ölçerim.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm, kaynak yazımı, ihlal düzeltmesi).

— DESIGN-MARKA (Opus) 2026-09-06

