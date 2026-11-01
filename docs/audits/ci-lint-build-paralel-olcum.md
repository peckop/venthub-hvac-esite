# ci işinde Lint ∥ Build paralelliği: önce/sonra ölçümü (ALT-80)

Ölçüm tarihi: 2026-10-27. Kaynak: `gh api` ile `ci.yml` pull_request koşuları ve `ci` işinin adım süreleri. Cetvel: `docs/standards/test-karnesi-standard.md`, önceki ölçüm: `docs/audits/pr-bekleme-kapanis-2026-10-13.md` (kod PR bekleme medyanı 4:35).

## Ne değişti

PR #1920 (merge 8796c0d73, 14 Ekim 2026 09:49Z) Lint adımını arka plana aldı ("Lint (arka planda başlat)"); kapı, Build sonrasındaki "Lint sonucu (bekle, blocking)" adımında duruyor. Lint ve Build artık aynı anda koşuyor; ikisi de zorunlu, kapı gevşemedi (`|| true` ve `continue-on-error` yok).

## Yöntem

- Yalnız başarılı, ilk denemeli `ci.yml` pull_request koşuları; Build adımı gerçekten koşmuş olanlar (belge PR'larında Build atlanır, onlar dışarıda).
- ÖNCE: #1920'den önceki son 10 kod PR koşusu (12-13 Ekim). SONRA: #1920'den sonraki ilk 10 (14-15 Ekim). SON: en yeni 10 (26-27 Ekim).
- Ölçü: `ci` işinin başlangıç-bitiş süresi (saniye). Tüm koşu süresi (test dilimleri dahil) ci işinden en çok 5 sn farklı çıktı; bu yüzden yalnız ci işi verildi.

## Sonuç

| Küme | n | ci işi medyan | ci işi ortalama | Build medyan |
|---|---|---|---|---|
| ÖNCE | 10 | 272 sn (4:32) | 285 sn | 137 sn |
| SONRA | 10 | 239 sn (3:59) | 243 sn | 138 sn |
| SON | 10 | 240 sn (4:00) | 238 sn | 140 sn |

- Kazanç: medyanda 33 sn (%12), ortalamada 42 sn. OPS'un eşiği 20 sn; aşıldı, **geri alma önerisi yok**.
- Build süresi değişmedi (137 → 138 sn): kazanç Lint'in Build'in arkasında beklememesinden geliyor, Build'in hızlanmasından değil.
- SON küme SONRA ile aynı: kazanç kalıcı, bozulma yok.

## Sınırlar (dürüstçe ölçülmeyenler)

- PR açılışından yeşile toplam bekleme, kuyruk süresini (runner'ın boşa çıkmasını) da içerir; burada yalnız koşu süresi ölçüldü. Kuyruk payı ayrı ölçülmedi.
- ÖNCE ve SONRA arasında `ci.yml`'e başka küçük değişiklikler de girdi (aksiyon sürüm artışları); etkileri ayrıştırılmadı. Build süresinin sabit kalması, kazancın asıl kaynağının #1920 olduğunu destekliyor.
- Runner varyansı: tek kümede en küçük ile en büyük koşu arasında iki kata yakın fark var (181-425 sn); bu yüzden ortalamadan çok medyana güvenilir.
- Hedef kod PR ≤4:00: SONRA ve SON medyanları 3:59 ve 4:00 ile sınırda. Tam altına inmek için sıradaki kaldıraç Build'in kendisi (137 sn, adımın yarısından fazlası).
