# DEFTER: İKİ YOL ÖLÇÜLDÜ — `ask` mi, `data-table` mı? (REC-212, 2026-09-10)

**Soru:** Kaynak eşlemesinin bulamadığı değerler için defter (NotebookLM) hangi yolla
sorulmalı — serbest soru (`ask`) mı, kaynak-kısıtlı tablo üretimi (`generate data-table`) mı?
**Pilot aile:** STORM Serisi (pakette **20 ürün**, çözülmemiş **223** teknik değerle en tepede).
**PDF açılmadı** (K15). Canlı DB'ye yazım yok.

## Kapsam: `data-table` açık ara üstün

| ölçüt | `ask` (6 soru) | `data-table` (1 soru) |
|---|---|---|
| süre | 6 × ~50 sn = ~5 dk | **62 sn** |
| STORM ürünü kapsamı | **0 / 20** | **20 / 20** |
| ürün **kodu** verdi mi | hayır (yalnız "STORM 10" gibi model adı) | **evet, 21 kod** |
| çıktı biçimi | serbest metin (22.141 karakter) | **CSV, 21 satır × 13 kolon** |
| hücre doluluğu | — | 7 alanın 7'sinde **21/21** |

**Kodların doğrulaması — uydurma YOK:** data-table'ın verdiği **21 kodun 21'i** hem paketteki
ürünlerle hem **kaynak dizinindeki metinle** eşleşti. Defter kod uydurmadı.

## ⛔Ama DOLULUK KANIT DEĞİL — asıl ölçüm bu

"7 alanın hepsi 21/21 dolu" cümlesi tek başına yanıltıcıdır. Hücrelerin **ne** taşıdığını
ölçtüm:

| alan | tek değer | **ARALIK** |
|---|---|---|
| gerilim V | 3 | **18** |
| devir rpm | 4 | **17** |
| ağırlık kg | 6 | **15** |
| statik basınç Pa | 14 | 7 |
| güç kW | 14 | 7 |
| hava debisi m³/h | 13 | 8 |
| IP sınıfı | 21 | 0 |

**Sayfa atfı: 21 satırın 18'inde ÇOKLU** — örnek: `"4, 5, 7, 96, 33, 34, 35"`.
Yani "hangi sayfada yazıyor" sorusunun cevabı **verilmemiş**, yedi sayfa birden listelenmiş.

Bir ürünün ağırlığı `"2,10 - 4,33"` ise o ürünün ağırlığı **bilinmiyor** demektir; verilen şey
ürün değeri değil, **aile aralığıdır**. Dolu görünen hücre, boş hücreden daha tehlikelidir:
boş hücre kendini bildirir, aralık taşıyan hücre kesin değer gibi okunur.

*(Aynı ders sınıfı: 2026-09-09'da "VAR %56" rakamının üçte biri tesadüf çıkmıştı. Ölçüt
doluluk olduğunda, dolu olan her şey iyi görünür.)*

## ⭐ASIL BULGU: STORM'un değerleri kaynakta KESİN DEĞİL

İki yol da aynı yere çıktı ve **birbirini doğruladı**:
- `ask`, STORM/debi sorusuna *"model bazında net/sabit bir maksimum hava debisi tablo değeri
  verilmemiştir (kaynakta yok); debi yalnızca performans grafiklerinde **eğri** olarak var"*
  dedi ve seri geneli için `50–5.000 m³/h` aralığını `avens_fiyat_listesi` s.42 atfıyla verdi.
- `data-table`, aynı alanlarda **aralık** üretti — çünkü kaynakta okunacak tek sayı yok.

Yani STORM'un 223 çözülmemiş satırı bizim betiğimizin kusuru **değil**: kaynak o değerleri
**tablo olarak vermiyor, çizim olarak veriyor**. Metin arayan hiçbir araç orada sayı bulamaz.

**Bu bir soru doğurur (Recep'e değil, ölçüme):** DB'deki kesin STORM değerleri nereden geldi?
Kaynakta tek sayı yoksa, o sayılar ya eğriden okundu ya başka bir yerden. Adım 5'in fark
raporu bunu ayrıştırmalı.

## Hüküm: iki yol RAKİP DEĞİL, ZİNCİR

1. **`data-table` + `-s <kaynak id>`** → aile başına **tek** çağrı; **ürün kodlarını** ve alan
   çatısını getirir. Kod, dizinle **deterministik** eşleşmenin anahtarıdır.
2. **Kesin değer dizinden okunur** — defterin sayısı değil, dizin satırı kanıttır.
3. **`ask`** → "bu değer kaynakta var mı, yoksa nerede?" sorusunun cevabı için; tekil sayfa
   atfı verebiliyor ve **"kaynakta yok" diyebiliyor** — data-table bunu diyemez, aralık uydurur.
4. **ARALIK taşıyan hücre ürün değeri sayılmaz**, `aile araligi` olarak işaretlenir.

⚠**`-s` kaynak kısıtı zorunlu:** OPS ölçtü — kısıtsız çağrıda "JET" sorusuna Vortice VORT
JET-A cevabı geldi (yanlış aile). Kısıt, doğru evreni seçer.

---
> Ölçüm: 2026-09-10 · URUN-KATALOG · PDF açılmadı · prod DB yazımı yok
> Ham çıktılar pakette: `defter-cevaplari.jsonl` (12 ask cevabı) · data-table CSV
