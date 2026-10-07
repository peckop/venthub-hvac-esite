# CI Test Ölçümü — 2026-10-06

**Sürüm 1.0 · 2026-10-07 · Sahibi: ALTYAPI · Kaynak: Kanban ALT-38 (OPS emri, Recep kararları 296, 297 ve 308) · Cetvel: `docs/standards/test-karnesi-standard.md`**

> **Bu dosya niçin var.** "Hangi test ne kadar sürüyor, neyi okuyor, bir PR'da hangisi gerekli" sorusu her seferinde baştan ölçülüyordu ve ölçüm yalnız ALTYAPI çalışma
> dallarında ve CI kayıtlarında yaşıyordu. Bu belge ölçümü TEK yere koyar. Dosya başına süre ve sınıf tablosu `docs/audits/ci-test-olcum-2026-10-06.csv` dosyasındadır
> (605 satır); shard dengeleme ve test seçimi işleri o tabloyu OKUR, bu metin yalnız sonucu ve sınırlarını söyler.

## 1. Ne ölçüldü

| Ölçü | Değer |
|---|---|
| Vitest test dosyası | 605 |
| Test | 6.634 |
| Dosya sürelerinin toplamı | 873 sn (yerel tam koşu; dosyalar paralel koşar, duvar süresi değil) |
| Sınıf kaynağı | testin KAYNAĞINDAN statik çıkarım: dosyanın okuduğu yol dizgeleri (`okunan_yollar`) ve sınıfı |
| CI'da Test adımı | 6 dk 25 sn (master koşusu 2026-10-06, OPS ölçümü) |

⚠ Süreler yerel, filo yükü altında ölçüldü: **sıralama ve pay güvenilir, mutlak saniye değildir** (kanca testleri alt süreç açtığı için yükte şişer). Mutlak süre için
CI'daki Test adımı esas alınır.

## 2. Sınıflar (yol sınıfı = testin okuduğu yollar)

| Sınıf | Anlamı | Dosya | Süre payı |
|---|---|---|---|
| `belge-kanca-arac` | yalnız docs/, .claude/, .agent/, scripts/, tools/ okur | 94 | %21,6 |
| `karma` | hem kaynak kod (src/) hem belge/betik okur | 87 | %53,1 |
| `kod` | yalnız src/ okur | 100 | %3,1 |
| `yol-yok` | hiçbir yol dizgesi okumaz (içe aktarılan koda dayanır) | 324 | %22,2 |

Küme (klasör türü) gözüyle: conformance 345 dosya ve süre payı %89,4; birim 213 dosya ve %8,2. Dosya sistemi kullanan 299 dosya süre payının %90,4'ünü taşır:
**Test süresi dosya okuyan kapılardadır; saf kod testi payı %6,7'dir (yaklaşık 20 sn).** Bu yüzden `Build` atlamak (ALT-38c, cetvel §4.1) Test'i küçültmez; Test'i
küçültmek ya paralel bölmek (shard) ya da PR'da yalnız ilgili testleri koşmaktır (karar 308).

## 3. Yoğunlaşma (shard dengesi için)

| Ölçü | Değer |
|---|---|
| İlk 10 dosyanın payı | %56,0 |
| İlk 50 dosyanın payı | %85,6 |
| En uzun dosyalar | `sessionstart-tavan` 130 sn, `sessionstart-pencere-adi` 71 sn, `merge-sonrasi-ileri-sar` 67 sn, `departman-ac-kapat` 42 sn, `taban-tazele` 38 sn |

Sonuç: **shard'lar dosya SAYISINA göre değil SÜREYE göre dengelenmelidir** (`--shard=i/N` dosya sayısına böler; tek bir 130 sn'lik dosya bir shard'ın alt sınırını belirler).
Büyük dosyaların hepsi kanca/araç testidir (alt süreç açar); onların tetiği `.claude/hooks/` ve `scripts/` yollarıdır (karar 308 haritasının ilk adayları).

## 4. Sınırlar

- Sınıf statik çıkarımdır ve **kesin değildir**: dosyanın kaynakta adını andığı yol dizgelerine bakar; hesaplanan yolları (`path.join(kok, ad)`) göremez. Bu yüzden test seçimi
  (karar 308) bu tabloya tek başına dayanmaz: değişen dosya ∩ `okunan_yollar` seçer, ayrıca `vitest related` ve master push ile gece tam koşusu güvenlik ağıdır.
- `yol-yok` hiçbir şey okumadığı anlamına gelmez, "yol dizgesi bulunamadı" demektir; seçimde `related` ile birlikte kullanılır.
- Tablo bir anlık görüntüdür (2026-10-06); yeni test dosyası eklenince satırı yoktur: seçim ve shard betikleri satırı olmayan dosyayı HER ZAMAN koşar (güvenli yön).

## 5. İşler ve satırlar

| İş | Durum | Bu tabloya etkisi |
|---|---|---|
| ALT-38c-1 Build ve e2e atlama, iki önbellek | PR | ölçüm satırı: bu PR'ın canlı koşusu (aşağıda) |
| ALT-38c-2 shard (süreye göre dengeli) | sırada | `sure_sn` sütunu girdi |
| ALT-38c-3 `isolate: false` ölçümü (birleşme YOK) | sırada | ölçüm sonucu bu bölüme satır olarak eklenir |
| Karar 308 test seçimi | sırada | `okunan_yollar` sütunu girdi |

_Canlı ölçüm satırları (gerçek CI koşusundan) teslimlerle eklenir._
