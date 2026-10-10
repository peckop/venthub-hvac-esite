# Test Seçimi Ölçümü — 2026-10-07

> Kayıt: Kanban ALT-38d (karar 308, OPS-91) · Sahibi: ALTYAPI · Ölçüm: 2026-10-07, dal `altyapi/alt38d-test-secimi` (taban master 2b0e252db),
> Windows, Node 22.16, vitest 4.1.11 · Cetvel: `docs/standards/test-karnesi-standard.md` §6 · Ham veri: `docs/audits/test-secimi-olcum-2026-10-07.csv`
> (353 satır: `bolum=pr` 94 PR, `bolum=b4` 259 CI koşusu) · Araç: `scripts/ci/test-sec-geriye.cjs` (`--pr-olc`, `--b4`).

## 1 · Özet

| Ölçü | Değer |
|---|---|
| Test evreni (PR kapısı, `vitest list`, dünya durumu dışarıda) | 624 dosya, 7571 test; conformance 345 dosya |
| Harita kapsamı | conformance **345/345** kayıtlı: 312 kesin eşlenmiş + 33 `belirsiz` (her zaman koşar). Tümü 622/624 (kalan 2 dosya tümüyle `describe.skip`, her zaman koşar) |
| Belge-yalnız PR (12 gerçek PR) | ort. **833 test (%11,0)**, 48 dosya (%7,7); CI-model Test süresi %12,8 (medyan %11,8) |
| Kod PR (64 gerçek PR) | ort. **1803 test (%23,8)**, 157 dosya (%25,1); süre %26,2 (medyan %22,5); 1/64 TAM |
| Küresel girdi değiştiren PR | 13/94 (%14): hepsi TAM |
| PR karışımı (94 PR, #1628..#1736) | ort. test %32,1, ort. süre %34,0 (medyan %22,4): tam paketin yaklaşık üçte biri |
| Geriye dönük doğrulama (259 kırmızı koşu, 09-07..10-07) | 171 değerlendirilebilir: 100 seçildi, 28 TAM, 43 ham kaçırma; 43'ünün 43'ü açıklandı: **gerçek kaçırma 0** |
| Hedef (belge PR'ında Test ≤40 sn) | **tutmuyor**: belge PR'ında Test tam paketin %12,8'i; sebep §3 ve §4'te |
| Seçimin kendi maliyeti (yerel ölçüm, 16 çekirdek) | belge PR'ında 0,5-1,4 sn; kod PR'ında vitest grafiği tek süreçte 41-57 sn, 4 işçide 26 sn. Test adımı shard başına tahmin: belge ≈68 sn → ≈10 sn, kod (medyan) ≈68 sn → ≈41-60 sn |

Okuma notu: "süre" sütunları duvar saati değil, CI günlüğünden kurulan işlemci-saniye modelidir (§3); yüzdeler oransaldır.

## 2 · Harita kapsamı ve her zaman koşanlar

| Küme | Dosya | Anlamı |
|---|---|---|
| Evren | 624 | PR kapısındaki test dosyaları |
| Kayıtlı (ölçülmüş) | 622 | koşarken okuduğu dosya/dizin/alt ağaç kaydı var |
| Kesin eşlenmiş | 581 | değişen yol okunanlarla eşleşmedikçe seçilmez |
| `belirsiz` | 41 | izlenemeyen alt süreç ya da ölçümde kırmızı/atlanan: HER PR'da koşar |
| Haritada yok | 2 | `OrdersPage.test.tsx`, `OrderDetailPageTabs.test.tsx` (tümüyle `describe.skip`): HER PR'da seçilir (maliyeti yok) |
| **Her zaman koşan** | **43** | belirsiz + haritada olmayan (ve bayat kayıt, şimdi 0) |

`belirsiz` nedenleri (bir test birden çok nedene sahip olabilir): `git` repo içinde, dosyaya bağlı alt komut 23 (`ls-files`, `log`, `show`, `check-ignore`...),
python 12, powershell 2, esbuild 2, sh 1, cmd 1, ölçümde kırmızı 3, ölçümde atlanan test 2. "Haritada olmayanlar için her zaman koşar kanıtı":
`INV-TEST-SEC-1` senaryoları ("haritada kaydı OLMAYAN test HER ZAMAN seçilir", "kaynağı ölçümden sonra DEĞİŞMİŞ test HER ZAMAN seçilir", "belirsiz işaretli test HER ZAMAN
seçilir") ve sabotaj tablosu ("haritada kaydı olmayan test seçilmez", "belirsiz test seçilmez" bozmaları kırmızı verir); ölçüm tarafında 94 PR satırının TAM olmayanlarının
hepsinde `belirsiz_dosya` 41'dir (CSV).

## 3 · PR örnekleri (94 gerçek PR, bu ağacın atası olan son 100 birleşmiş PR)

Yöntem: `gh pr list --state merged` (en yeni 100) ∩ bu ağacın atası olanlar; her PR'ın dosya listesi `gh api pulls/N/files` ile, her biri için seçici BUGÜNKÜ harita ve ağaçla
koşar. Tür: belge-yalnız (tüm yollar `docs/`, `.claude/`, `.agent/` ya da kök `*.md`), küresel (§6.2 girdisi var), kod (`src/` var), diğer.
Süre modeli: bir CI koşusunun (2026-10-07 09:05, 622 dosya, Test adımı duvar 270 sn) günlüğünden her dosyanın test süresi + dosya başı ortak yük
(transform+setup+import+environment ÷ dosya = 0,74 sn); tam paket 756 işlemci-sn. Yerel Windows süreleri CI'dan 10-40 kat uzundur (`taban-tazele` yerelde 150 sn, CI'da 3 sn),
bu yüzden süre yüzdesi CI günlüğünden hesaplanır.

| PR türü | PR | ort. dosya (/624) | ort. test (/7571) | test % | CI-model süre % (ort · medyan) | TAM |
|---|---|---|---|---|---|---|
| belge-yalnız | 12 | 48,3 (%7,7) | 833 | %11,0 | %12,8 · %11,8 | 0/12 |
| kod (`src/`) | 64 | 156,5 (%25,1) | 1803 | %23,8 | %26,2 · %22,5 | 1/64 |
| diğer (betik, edge, kök dosya) | 5 | 51,2 (%8,2) | 867 | %11,5 | %12,4 · %12,3 | 0/5 |
| küresel girdi | 13 | 624,0 (%100,0) | 7571 | %100,0 | %100,0 · %100,0 | 13/13 |
| **PR karışımı (hepsi)** | 94 | 201,7 | 2427 | %32,1 | %34,0 · %22,4 | 14/94 |

En kötü 3 belge PR'ı: #1677 (58 dosya, 1033 test, süre %20,8: `.claude/settings.json` değişti, `.claude` alt ağacını okuyan testleri çeker) · #1667 (58 dosya, 951 test, %14,7) · #1648 (52 dosya, 902 test, %12,9).
En kötü 3 kod PR'ı: #1733 (TAM, %100: taşınmış/silinmiş kod dosyası kuralı) · #1686 (252 dosya, 2504 test, %39,3) · #1661 (246 dosya, 2433 test, %38,6).
İstenen asgari örnek (belge ≥10, kod ≥10) karşılandı; ilk koşuda (en yeni 14 belge + 14 kod PR'ı) belge aynı çıktı (835 test, %11,0), kod daha ağır çıktı (2191 test, %29,0; süre %30,0): kod sonucu
dönemin PR'larına duyarlıdır, bu tablo 64 PR'a dayanır.

**Belge PR'ının maliyeti nereden geliyor.** Belge PR'ında seçilen ortalama 97 işlemci-sn'nin 83'ü `belirsiz` kümesindendir (41 dosya, süre %11,0); `belirsiz` HARİÇ belge PR'ı %1,8'e iner.
Hedef (belge PR'ında Test birkaç sn) bu yüzden tutmaz: seçim hiçbir belge PR'ında boş değildir (en az 43 test), kurulum atlanamaz, `test-shard` boş seçim yoluna girmez.
`belirsiz` kümesini belge PR'ında atlamanın bedeli §4'te ölçüldü: atlanmamalı.

## 4 · Geriye dönük doğrulama (B4): seçim, tam pakette kırmızı veren testi kaçırır mıydı?

Girdi: `ci.yml` kırmızı koşuları 2026-09-07..10-07 (259 koşu, 153 farklı PR; her koşu için değişen dosyalar, kırılan test dosyaları ve vitest günlüğünden kırılan başlıklar). Her koşu için seçici
BUGÜNKÜ harita ve ağaçla koşar ve kırılan test seçilmiş mi bakılır. Pencere bir aydır: `ci.yml` koşu kayıtları ve günlükleri bu aralıkta toplandı; `karne.json`un üç aylık `ci` özeti koşu başına değişen dosya taşımaz.

| Kategori | Koşu | Sonuç |
|---|---|---|
| ASIL (PR olayı, Test adımı kırılan, kırılan test dosyası biliniyor) | 171 | 100 SEÇİLDİ · 28 TAM (küresel dosya) · 43 ham KACIRILDI |
| TEST-YOK (kırmızı adım Test değil: Lint, Install, Build, kayıt kapısı...) | 73 | değerlendirilecek test yok |
| PR-DISI (master push; seçici yalnız PR'da, master TAM koşar) | 15 | bilgi: 8'inde seçici olsaydı kaçırırdı, master TAM gerçekte koştu |

Ham 43 kaçırma, günlükten çıkarılan kırık BAŞLIKLARLA sınıflanır (`kacirilanlariAcikla`; açıklanamayan = GERÇEK, başlık bilinmiyorsa açıklanmış sayılmaz):

| Sınıf | Koşu | Test | Kanıt |
|---|---|---|---|
| DUNYA-KOLU-TASINDI | 34 | `taban-tazeligi.test.ts` (TAZELIK kolu) | kırık başlık bugünkü dosyada YOK, `taban-tazeligi-dunya.test.ts`te var; o dosya dünya durumu listesinde (ALT-38a), PR kapısında koşmaz: bugünkü kapı bu kırmızıyı üretmez |
| DEVRALINAN | 10 | `standard-section-integrity.test.ts` (7), `sessionstart-tavan.test.ts` (3, her biri iki başlık) | aynı test+başlık 12 saat içinde başka dalda zaten kırmızıydı; zincir kökü master push (TAM koşar: 34132568389) ve seçilmiş PR koşusu (#1506, testin kendisini değiştirdi) |
| GERÇEK kaçırma | **0** | | PR'ın kendi diff'inden gelen ve seçicinin kaçırdığı kırmızı yok |

(43 koşu = 33 yalnız dünya kolu + 9 yalnız devralınan + 1 ikisi.) Sınıflama kuralları ve her birinin sabotajı `INV-TEST-SEC-GERIYE-1`dedir: kök seçilmediyse devralınan GERÇEK sayılır, aynı dalın kendi tekrarı devralınan sayılmaz,
12 saat penceresi aşılırsa yeni zincir, farklı başlık aynı zincir sayılmaz, yer tutuculu başlık "bugünkü kapıda var" kabul edilir (güvenli yön).

**`belirsiz` kümesinin gerekçesi (ölçülmüş).** SEÇİLDİ diye sayılan 100 koşuda kırılan 116 (koşu, test) çiftinin 53'ü `belirsiz` testtir (`arac-envanteri` 26, `mutlak-yol-sizintisi` 19, `belge-tazelik` 2, 6 diğer);
45 koşuda kırılan testlerin HEPSİ `belirsiz` kümesindedir (harita onları tek başına seçmezdi, "her zaman koşan" kuralı yakaladı). Belge-yalnız PR kırmızısı 17'dir ve **10'unda kırılan test `belirsiz`dir**
(README/standart/audit belgesi eklenince envanter ya da mutlak yol kapısı kırılıyor). Belirsizi belge PR'ında atlamak son ayda belge PR kırmızılarının %59'unu PR'da göstermez, master'a taşırdı.

## 5 · Güvenlik ağı (seçimin ASLA gözden kaçıramayacağı durumlar)

| Durum | Davranış | Kanıt |
|---|---|---|
| Küresel dosya (`.github/`, `package.json`, `pnpm-lock.yaml`, `vitest*`, `tsconfig*`, `next.config.*`, `scripts/ci/`, `supabase/migrations/`...) | TAM | `INV-TEST-SEC-1` küresel girdi tablosu; B4'te 28 koşu TAM |
| Bilinmeyen dosya: haritanın bilmediği kök ad, silinmiş/taşınmış kod dosyası | TAM | `INV-TEST-SEC-1` ("bilmediği KÖK ad", "SİLİNMİŞ kod dosyası"); #1733 bu yüzden TAM |
| Harita bayat/bozuk/sürüm farklı; ölçüm aracı değişti | TAM | `INV-TEST-SEC-1`, `INV-TEST-HARITA-1` blok 6 (depodaki harita canonical ve güncel araç özetiyle) |
| Haritada olmayan (yeni) test, bayat kayıt, `belirsiz` test | her zaman SEÇİLİR | `INV-TEST-SEC-1` senaryoları + sabotaj |
| Boş değişen liste, 2000+ dosya, git/harita/vitest hatası | TAM (`sec` fırlatmaz) | `INV-TEST-SEC-1` |
| master push, `workflow_dispatch`, `schedule`, yerel `pnpm test` | seçim uygulanmaz, TAM | cetvel §6.5 |

## 6 · Sapmalar ve sınırlar (dürüstçe)

1. **Harita ölçümle üretildi, kaynaktan statik çıkarımla değil** (emir sonradan değişti): hesaplanan yol, döngüyle gezilen dizin ve alt süreç statik çıkarımda sessizce kaçıyordu. Bedeli: harita bir ölçümdür (tam yenileme yaklaşık 20 dk, 6 işçi) ve ölçüm Windows/Node 22'de yapıldı.
2. **"Depodaki harita == üretici çıktısı" kapısı** tam yeniden ölçüm değil, ölçümün canonical baytları + GÜNCEL ölçüm aracı özeti + biçim kontrolüdür (CI'da yeniden ölçüm 20 dk sürer). Yeni/bayat/hayalet kayıt kırmızı vermez, seçicide güvenli yöne (her zaman koşar) düşer.
3. **337 yerine 345**: conformance dosya sayısı bugünkü ağaçta 345 (sabah ölçümünden sonra eklenen testler).
4. **Hedef tutmuyor** (§1, §3): belge PR'ında Test tam paketin %12,8'i, kod PR'ında %26,2. Hedefe giden yol `belirsiz` kümesini ölçümle küçültmektir (cetvel §6.7), gevşetmekle değil.
5. **Geriye dönük pencere bir ay**; harita ve içe aktarma grafiği bugünkü ağaçtandır, koşudan sonra silinen/değişen testler `kapsamDisi` sayılır (bu veride 0). `DEVRALINAN` sınıfı "kök PR veri penceresinin dışında olabilir" riskini taşır: kök master push ya da seçilmiş PR olmadıkça GERÇEK sayılır.
6. **Süre modeli CI günlüğünden** tek bir koşudan (09:05) kurulur; paralel iş sayısına bölünmemiş işlemci-saniyedir. `test-shard` (4 iş) ile duvar süresi ≈ model ÷ (4 × işçi paralelliği) + sabit kurulum.
7. **ESLint** `scripts/ci/**` yollarını yok sayar (yapılandırma); bu dosyalarda eslint çıktısı boştur, denetim `tsc` ve testlerdendir.
8. Test dosyası `test-sec.test.ts` (gerçek git kullanan bir senaryo) ve `test-haritasi-kaydedici.test.ts` (kaydedici kaydediciyi sınar: ölçüm altında kırmızı) `belirsiz` sınıfındadır; ikisi her PR'da koşar (yaklaşık 10 işlemci-sn).
9. **Seçimin kendi maliyeti ölçüldü** (Windows, 16 çekirdek; CI'da ölçülmedi): belge PR'ında 0,5 sn (`--vitestsiz`) ile 1,4 sn; kod PR'ında `vitest` içe aktarma grafiği kurulduğu için tek süreçte
   41-57 sn. Grafik 4 işçi sürecinde paralel kurulur (`grafikKur`: her işçi sıra % n kuralıyla ayrık parça alır; işçi hatasında ya da tutarsız çıktıda sıralıya düşer): 26 sn (2 işçi 31 sn, 8 işçi 22 sn);
   sonuç sıralıyla bayt bayt aynıdır (10 dosya ve toplu sorgu, doğrulandı). `test-shard` her shard'da seçimi ayrı hesapladığından kod PR'ında shard başına duvar süresi tahmini: ≈15 sn test +
   ≈26-45 sn seçim (4 çekirdekli CI'da yerelden uzun olabilir): tam paketin ≈68 sn'siyle aynı mertebede ya da biraz altında; belge PR'ında ≈10 sn. Kod PR'ının asıl kazancı için grafiğin haritada
   doğrulamalı önbelleğe alınması gerekir (cetvel §6.7 madde 5).
10. **Koşum kapanımı boşluğu kapatıldı** (alt38e bulgusu, doğrulandı): `vitest.global-setup.ts` ana süreçte `scripts/board/vitest-defter-ortami.cjs`i yükler; kaydedici worker'da çalıştığı için
    harita bunu yalnız kendi testine bağlıyordu (`kuresel` boş) ve dosya değişince her koşum etkilenirken seçim o testle sınırlı kalıyordu. Dosya küresel listeye eklendi (değişirse TAM) ve
    `INV-TEST-SEC-1` blok 7 `vitest*` kök dosyalarının yerel yükleme kapanımını kaynaktan çıkarıp küresel listede OLMAYANI kırmızı yapar (sentetik ağaç senaryoları + gerçek ağaçta kapanım:
    `vitest.config.ts`, `vitest.global-setup.ts`, `vitest.setup.ts`, `vitest-setup.tsx`, `vitest.smoke.config.ts`, `scripts/ci/dunya-durumu.cjs`, `scripts/board/vitest-defter-ortami.cjs`). PR örnek ölçümü
    değişmedi: son 100 birleşmiş PR'da bu dosyaya dokunan tek PR zaten küresel girdili (#1652). Aynı mesajdaki ikinci not (sınıflayıcı önce seçicinin yanından yüklenir) bozulmadı ve bir testle sabitlendi.

## 7 · Birleşme sonrası güncelleme (master #1741 dahil, 16:25)

Dalın ucuna master birleştirildi (#1728, #1737, #1739-#1741: sınıflayıcı, shard, ölçüm belgesi). Ağaç 632 test dosyasına çıktı (8 yeni master testi); harita aynı ağaçta yenilendi
(`--yalniz` ile 13 dosya: 8 yeni + 5 bayat): **630/632 kayıtlı**, `belirsiz` 41 → **45** (yeni dört: `ci-degisiklik-sinifi` bash, `ci-test-shard` esbuild, `depo-dokum-kapisi` ve
`depo-dokum-kapisi-uctan-uca` git), haritada olmayan 2 (tümüyle `describe.skip`), **her zaman koşan 47 (%7,4)**. `--kontrol`: sorun 0, bayat 0. B4 yeniden koşuldu: 171 değerlendirilebilir koşuda
ham 43 aynı, **gerçek kaçırma 0** (ASIL koşularda ortalama seçilen dosya 194,0 → 198,7: yeni testler). PR örnek ölçümü (§3) yeniden koşulmadı; yöntem aynı, belge PR'ında seçilen dosya yaklaşık +4.
Yukarıdaki sayılar (§1-§6) 2b0e252db tabanındaki 624 dosyalık ağacın ölçümüdür ve bu haliyle bırakıldı.

## 8 · Yeniden üretme

```
# PR örnekleri (CI süre modeliyle)
node scripts/ci/test-sec-geriye.cjs --pr-olc --sure <ham-klasör>/vitest-*.json --ci-log <ci-test-günlüğü> --belge 99 --kod 99 --limit 100 --cikti pr.jsonl
# Geriye dönük doğrulama (günlük dizini: <runId>-<jobId>.txt)
node scripts/ci/test-sec-geriye.cjs --b4 kirmizi-kosular.json --log-dizini <günlükler> --cikti b4.jsonl
node scripts/ci/test-sec-geriye.cjs --ozet b4.jsonl     # gercekKacirilan BOŞ olmalı
```
