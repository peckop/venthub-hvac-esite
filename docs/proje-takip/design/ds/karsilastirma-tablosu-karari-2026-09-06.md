
# Karar · karşılaştırma tablosu ayrı bileşen olur — 2026-09-06

OPS emir #6, 5. kalem: `TeknikTablo` v2 = `basliklar[]` (+ transpoze için `satirlar[].degerler[]`
ya da ayrı bileşen, **karar sende**).

**Kararım: `basliklar` `TeknikTablo`'ya girer, transpoze AYRI bileşen olur.**

## Gerekçe

**1 · K7'nin anlamı değişiyor.** `TeknikTablo`'da kural net: *değeri boş olan satır çizilmez*.
Karşılaştırmada satır bir **alan**, hücreler farklı modellerin değerleri — biri boşsa satır
düşemez, yoksa diğer modelin verisi kaybolur. Gereken yeni kural: *en az bir modelde değer varsa
satır çizilir, boş hücre boş kalır (tire yazılmaz)*. Aynı bileşende iki K7 davranışı taşımak
kuralı prop'a bağlar; kuralın kendisi zayıflar.

**2 · Üçüncü kolonun karşılığı yok.** `anlam` tek modelin değerini yorumlar ("kanal uzadıkça bu
payı tüketirsiniz"). N modelde o cümle satırın tamamına ait, hücreye değil. `degerler[]` eklemek
`anlam`'ı tanımsız bırakır.

**3 · Kolon sayısı değişken.** `TeknikTablo` sabit üç kolon (190/150/1fr, `kolonlar` ile ezilir).
Karşılaştırma 2–5 model taşır ve ilk kolon sabitlenir (yatay kaydırmada alan adı ekranda kalır).
Aynı ızgara mantığı değil.

## Ayrışma riski neden yok

Ortak olan **görsel dil**, kod değil: `--border-row` ayırıcı · zebra yok · değerler IBM Plex Mono
+ `tabular-nums` · yarıçap 0 · gölge yok. İki bileşen aynı tokenları okur.

## Kapsam

- `TeknikTablo` v2: `satirlar` + `kolonlar` + **`basliklar: string[]`** — başlık bileşende
  render edilir. Menü'de ölçülen 18/34/50 px hiza kaymasının kökü elle çizilen başlıktı; başlık
  bileşene girince kayma yapısal olarak imkânsızlaşır.
- **`KarsilastirmaTablosu`** (yeni, emir #6 kapsamında): `alanlar[]` × `modeller[]`, ilk kolon
  sabit, kendi K7 kuralıyla.

İtiraz gelirse tek bileşende yapılır; o hâlde yukarıdaki üç şey prop'a bağlı davranış olarak
kalır ve ilk ayrışmada tekrar konuşulur.

**Yapıma başlanmadı** — sıra hükmü #5 → çip → #6.

— DESIGN-MARKA/DS 2026-09-06

