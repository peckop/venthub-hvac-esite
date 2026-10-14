# Test haritası tazeleme ölçümü (ALT-83, 14 Ekim 2026)

Cetvel: `docs/standards/test-karnesi-standard.md` §6.3 (Test haritası) ve §6.6 (kapılar). Emir: OPS, 14 Ekim (ARAÇ ölçümü, #1934).

## Soru

`pnpm test:ilgili` (seçici: `scripts/ci/test-sec.cjs --yerel`) bir kanca PR'ı için 309/740 test seçiyordu ve bunun 231'i "her zaman koşan"dı.
Departmanlar bu yüzden yerelde koşturmuyor, kapılar CI'da yakalanıyor (#1932, #1934). Harita neden bayattı, nasıl tazelenir, bir daha bayatlamasın diye ne yapılır?

## Ölçüm (master `26c8a8c0c`, aynı ağaç, aynı yöntem)

| Büyüklük | Önce | Sonra |
|---|---|---|
| Test dosyası (vitest listesi) | 739 | 739 |
| Haritada kayıtlı | 640 | 737 |
| Bayat kayıt (test dosyası değişmiş) | 92 | 0 |
| Kayıtsız test (haritada yok) | 99 | 2 |
| Belirsiz (izlenemeyen alt süreç, ölçümde atlanan/kırmızı) | 50 | 55 |
| **Her zaman koşan** (bayat + kayıtsız + yalnız belirsiz olan) | **231** | **58** |

- "Önce" ARAÇ'ın ölçümüyle birebir tuttu (92 bayat, 99-100 kayıtsız): aynı sayıyı bu ağaçta yeniden üretmeden tazelemeye başlamadım.
- Kalan 2 kayıtsız test (`OrdersPage.test.tsx`, `OrderDetailPageTabs.test.tsx`) `VENTHUB_DUNYA_DURUMU=dislan` kipinde `skip` olan testlerdir; dosya okumadıkları için ham kayıt üretmezler ve maliyetleri sıfırdır.
- Belirsiz sayısı 50 → 55 arttı: yeni ölçülen testlerin bir kısmı repo içinde `git ls-files/log/show` ya da `python` çağırıyor (izlenemeyen alt süreç, §6.3). Bu ayrı bir azaltma fırsatıdır, bu işin kapsamı değil.

## Sebep

Bakım kuralı cetvelde yazılıydı (§6.3: "birleşmeden sonra `--yalniz` ile kaydedilir") ama onu tetikleyen hiçbir şey yoktu: haritayı 8 Ekim'de tam ölçülmüş, 10 Ekim'de
yalnız dört karne testi eklenmişti; sonra gelen test değişikliklerinin hiçbiri kaydedilmedi. Bayat kayıt kırmızı değildir (güvenli yön: o test her zaman koşar), bu yüzden
hiçbir kapı bunu görmedi; ceza yalnız yerel seçimin genişlemesi ve CI shard'larının gereksiz test koşmasıydı.

## Yapılan

1. Harita tazelendi: `--yalniz` ile 191 test (92 bayat + 99 kayıtsız) yeniden ölçüldü, iki işçiyle 13 dakika (12 parça); sonra `--bayat` ile bir test daha.
2. `scripts/ci/test-haritasi-uret.cjs`: `--bayat` (bayat ve kayıtsız testleri kendisi bulur ve yeniden ölçer) ve `--kontrol --esik N` (eşik aşılırsa çıkış 1 ve yenileme komutu).
3. `INV-TEST-HARITA-1`: depodaki harita için eşik kapısı: bayat + kayıtsız sayısı `git ls-files` test listesinin yüzde 20'sini (746 testte 149) aşarsa KIRMIZI.
   Üretici testine `argumanlariCoz` senaryosu ve dört sabotaj (her biri kırmızı veriyor) eklendi.
4. Cetvel §6.3: komut tablosu, bakım kuralları ve "Tazelik kapısı" paragrafı; §6.6 kapı satırı.

## Doğrulama (yerelde, tek tek, 14 Ekim)

- `scripts/ci/__tests__/test-haritasi-uret.test.ts`: 62/62 (yeni senaryo, sabotajlar, eşik kapısı dahil).
- Haritayı ya da cetveli okuyan on dosya (`test-haritasi-kaydedici`, `test-sec`, `ci-test-secimi*`, `test-shard-secim`, `test-karnesi-yapisi`, `taban-tazeligi*`): 385 geçti, 1 atlandı (önceden var).
- `node scripts/ci/test-haritasi-uret.cjs --kontrol --esik 20`: sorun 0, bayat 0, kayıtsız 2.
- ÖLÇÜLMEDİ: CI'da `test-shard` koşusunda seçilen test sayısının düşüşü (PR açılınca ve birleşince ilk PR'larda okunur); geriye dönük doğrulama (`test-sec-geriye.cjs --b4`) bu değişiklikte yeniden koşulmadı, çünkü seçici mantığı (`test-sec.cjs`) değişmedi, yalnız harita girdisi tazelendi; gevşeme yönünde bir değişiklik yok, ama harita girdisi değiştiği için PR'ın CI'ı `tam` koşacak (`scripts/ci/` küreseldir).

## Açık konu

- Eşik (yüzde 20) gözleme dayanır (191 test 4-6 günde birikti). Sıklığı gerçekte nasıl çıkacağı birleşmeden sonra ilk haftada ölçülür.
- Haritayı master'da otomatik tazeleyen bir iş (zamanlı ya da push sonrası) bu işte YAPILMADI: korunan master'a bot PR'ı `GITHUB_TOKEN` ile CI tetiklemez
  (zorunlu `ci` kontrolü hiç koşmaz), ayrı bir kimlik ya da OPS kararı gerekir.
