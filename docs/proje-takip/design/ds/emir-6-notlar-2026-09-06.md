
# Emir #6 — altı kalem bitti · 2026-09-06

OPS emir #6 (`ops-emir-2026-09-06-6-ds.md`, dört ekiyle). **Altı bileşen → on bileşen.**
Değer üretilmedi: her ölçü Menü envanterinden ya da `brand/`den geldi.

## 1 · `Cip` — iki yeni rol (yeni bileşen değil)

`varyant` (ürün sayfası seçicileri: Çap · Motor · Dönüş yönü · Faz · Versiyon; 3 ekran / 18) ve
`niyet` (niyet/mekân şeridi; 3 ekran / 17, yatay kaydırma, **ikon yok**).

Seçili hâl bu iki rolde **1.5 px lacivert kenar**, zemin beyaz kalır — dolu zemin süzgeç çipinin
hâlidir, varyant seçimi kenarla anlatılır. Ayrıca `kapsamDisi`: soluk zemin + `--text-body`,
tıklanmaz, **alfa yok** (K22). Kapsam dışı varyant silinmez — hangi seçeneğin var olduğunu da
anlatır.

## 2 · `Kart.dolgu` — dört ölçülmüş kademe

`yok` 0 · `kucuk` 14 · `orta` 16 (varsayılan) · `genis` 20 px. 204 kart kutusunun ölçümünden:
65 dolgusuz · 28 ×14 · 13 mevcut = **106 kart tek geçişte mount**. **Serbest string kabul
edilmiyor** — uydurma değer yolu açar (K28 mantığı). `genis` prop'u geriye dönük çalışıyor,
`dolgu` verilirse o kazanır.

## 3 · `TeknikTablo` v2 — `basliklar: string[]`

Başlık satırı artık **bileşende** çiziliyor (gömülü zemin + mono overline + `--border-row`
ayırıcı). Menü'nün ölçtüğü 18/34/50 px hiza kaymasının kökü elle çizilen başlıktı; başlık
bileşene girince kayma yapısal olarak imkânsız. Verilmezse satır çizilmez.

## 4 · `KarsilastirmaTablosu` — yeni bileşen (S4 onaylı)

Transpoze: satır = alan, kolon = model. Ölçüm (v17 kare 11): 11 satır, mobil 6,
`230px repeat(3,1fr)`. İlk kolon `position: sticky` — yatay kaydırmada alan adı ekranda kalır.

**Kendi K7 kuralı:** en az bir modelde değer varsa satır çizilir, boş hücre **boş kalır**
(tire/"belirtilmemiş" yazılmaz). Hiçbir modelde değer yoksa satır düşer; hiç satır kalmazsa
bileşen `null`. Ayrı bileşen olma gerekçesi `karsilastirma-tablosu-karari-2026-09-06.md`'de.

## 5 · `AdetKontrolu` — yeni bileşen

`− n +`, 2 ekran / 22 kullanım. Hücre 34–36 px görünür, **dokunma hedefi 44 px bileşende sabit,
prop'a bağlı değil** — S1 ihlali bu desenden çıkmıştı, 44 px'i tüketicinin eline bırakmak aynı
ihlali geri getirir. Değer mono + `tabular-nums`: 9 → 10 geçişinde genişlik oynamaz. Alt sınırda
`−` kapanır; satır silme ayrı eylemdir.

## 6 · `KatliCagriSatiri` — yeni bileşen

Kapalı ▼ / açık ▲ / dolu geliş; 2 ekran / 5. `CerceveliDugme` türevi: 1 px `--primary-navy`,
beyaz zemin, min 44 px. **Kiremit değil** (K5). Gövdesi olmayan satır gövde çizmez (K7).
Kontrolsüz ya da kontrollü (`acik` + `onDegisim`) çalışır.

## 7 · `PQEgrisi` — yeni bileşen

Tam **520×260** · kısa **330×200**, çalışma noktası işaretli. Tek çizgi `--primary-navy`,
çalışma noktası ve kesikli kılavuzlar `--brand-cyan-ink` (açık zemin — K25-b sınırı içinde).
Dolgu, gradyan, gölge yok. **İki noktadan az veri gelirse `null` döner** — boş eksen takımı
bırakılmaz (K7). İkinci eğri (sistem direnci) ölçüm gelmeden eklenmedi.

## Kartlar

- `components/veri/veri-2.card.html` (yeni) — karşılaştırma + adet + P-Q, üçü bir arada;
  karşılaştırmada dört satır verilip biri düşüyor, biri yarım hücreyle duruyor (kanıt).
- `components/dugme/katli.card.html` (yeni) — kapalı ve açık hâl, açık gövdede başlıklı
  `TeknikTablo`.
- `components/yuzey/yuzey.card.html` — dolgu kademeleri şeridi + varyant/niyet çip rolleri.
- `components/veri/veri.card.html` — `basliklar[]` kullanımı.

Kart sayısı 24 → **26**, bileşen 6 → **10**, token 57 (değişmedi).

## Ölçüm

26/26 kart kesik değil (harness). **Eksik teyit:** iki yeni kart ölçüm anında boş boyandı —
bileşenler `_ds_bundle.js`'e tur sonunda derleniyor. Yükseklikleri ve içerikleri sonraki turda
gözle teyit edilecek; gerekirse `viewport` düzeltilecek.

## Yapılmayan

Menü'nün isteyebileceği tablo varyantları (Klasik / Konuşan / aile) **kendiliğinden
genişletilmedi** — emir "kendiliğinden genişletme" diyor, istek gelirse ayrı iş.

— DESIGN-MARKA/DS 2026-09-06

