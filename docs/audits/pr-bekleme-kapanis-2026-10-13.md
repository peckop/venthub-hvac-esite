# ALT-38 Kapanış Raporu — PR bekleme süresi ve test düzeni (2026-10-13)

**Sürüm 1.0 · 2026-10-13 · Sahibi: ALTYAPI · Kaynak: Kanban ALT-38 (BİTİŞ: 13 Ekim 18:00; ham ölçüm verisi depo dışında) · Cetvel: `docs/standards/test-karnesi-standard.md`, `docs/standards/execution-method-standard.md`**

> **Bu dosya niçin var.** ALT-38 (test çalıştırma düzeni ve test karnesi) için söz verilmiş kapanış raporu. Okuyan iki şeyi öğrenir: PR bekleme süresi hedefe ulaştı mı, ve işin ne kadarı master'da. Her sayının yanında nereden geldiği ve neyin ölçülmediği yazılıdır.

## 1. Kısa cevap

- **İki süre hedefi de tutmadı.** Belge PR medyanı 1:46 (hedef ≤1:00), kod PR medyanı 4:35 (hedef ≤4:00). Kod PR'ında fark 35 sn.
- **Teslim edilen parçalar master'da** (§2): testlerin dünya durumundan ayrılması, siteye dokunmayan PR'da Build ve e2e'nin atlanması, test seçimi, test karnesi. Süreyi en çok kısaltan iş e2e-smoke süresiydi (#1742).
- **Kalan en büyük kaldıraç `ci` işinin içinde:** Lint (yaklaşık 42 sn) ile Build (yaklaşık 178 sn) ardışık koşuyor. Paralel koşturmak kod PR medyanını yaklaşık 3:53'e çekmesi beklenir (TAHMİN, ölçülmedi). Bu iş ALT-80 olarak ayrı kartta.
- **Belge PR'ını 1:00'in altına indirmek bir kapı gevşetmesidir**; karar Recep'te (§6).

## 2. Master'a giren teslimler

| Dilim | PR | Ne yaptı |
|---|---|---|
| 38a | #1729 | Dış duruma (dünya durumu) bağlı testler PR kapısından çıktı; `edited` tetiği yalnız PR kayıt kapısını koşar |
| 38c | #1739 | Siteye dokunmayan PR'da Build ve e2e atlanır; INV-CI-SINIF-1/2 |
| 38c-2 | #1741 | Testler 4 paralel işe bölündü; `ci` aynı koşunun tüm dilimlerini bekler |
| 38c ölçüm | #1740 | 605 test dosyasının süre, sınıf ve okunan yol ölçümü |
| 38d | #1747 | Ölçümlü test haritası + seçici + geriye dönük doğrulama (gerçek kaçırma 0) |
| 38e | #1756 | Seçici CI'a bağlandı + belge hızlı yolu |
| 38f | #1742 | e2e-smoke: Build'de tip/lint kapalı, apt paralel; admin-smoke medyanı 285 → 187 sn (önceki 88 koşu, sonrası 7 koşu) |
| 38b | #1790 | Test karnesi: cetvel §7, INV-TEST-KARNE-1..4, 654 dosyalık karne |
| 38l | #1803 | Haritaya 4 karne testinin kaydı |
| — | #1818 | `portMusait` testi paralel port yarışına dayanıklı (CI'da kesintili kırmızıydı) |

## 3. PR bekleme süresi

Yöntem: birleşen PR'ın son uç SHA'sındaki her kontrolün son koşusu; bekleme = ilk başlama → son bitiş, Vercel hariç; gh API salt okuma. **Sınıf dosya yolundan yaklaşıktır** (hepsi `docs/` ya da `.md` ise belge, değilse kod); CI'ın kendi sınıflayıcısı değildir. 15 dk üstü uç değerler ayrı sayılır.

| Ölçüm | Belge PR | Kod PR | Not |
|---|---|---|---|
| 7 Ekim (tek koşu) | 3:17 | 4:56 | OPS aktarımı, yöntem aynı değil |
| 9-11 Ekim (80 PR) | medyan 1:30, p90 2:05 (n=16) | medyan 4:29, p90 5:19 (n=60) | 4 uç değer ayrı: #1779 65:51, #1803 44:37, #1815 22:24, #1782 17:40 |
| 11 Ekim 21:13 (TR) sonrası, 13 Ekim ölçümü (37 PR) | medyan 1:46, p90 1:59 (n=9) | medyan 4:35, p90 4:56 (n=27) | 1 uç değer ayrı: #1902 39:45 (`ci`) |
| **Hedef** | **1:00** | **4:00** | |

- **En uzun iş:** belge PR'ında 9/9 `ci`; kod PR'ında 24/27 `ci`, 3/27 `admin-smoke`.
- **Ölçüm penceresi boşluğu:** önceki ölçüm 11 Ekim 18:13 (TR) ile bitti, bu ölçümün başlangıcı 11 Ekim 21:13 (TR) girildi; aradaki üç saatin PR'ları iki ölçümde de yok (Pazar akşamı, sayısı ölçülmedi).
- **Küçük örnek:** belge PR'ında n=9; 1:30 → 1:46 farkı (16 sn) bu örnekle anlamlı sayılmaz.

## 4. Neden hedef tutmadı

Ölçülen:

- **Bekleme `ci` işine bağlı, testlere değil.** Karne özeti §1: testlerin PR bekleme süresine etkisi yaklaşık 0 dk.
- **Kod PR'ı:** `ci` içinde Lint (satır 256) ve Build (satır 366) aynı iş içinde ardışık; 7 Ekim adım ölçümü Build ≈ 178 sn, Lint ≈ 42 sn.
- **Belge PR'ı:** 4 test dilimi hâlâ koşuyor (1:13-1:23, 11 Ekim #1862 ölçümü) ve `ci` kapanış adımı onları bekliyor.

Ölçülmedi:

- Lint∥Build paralel koşunun gerçek kazancı (42 sn yalnız adım süresinden çıkarım).
- #1902'nin neden 39:45 sürdüğü (sonradan yeniden koşan kontrol olabilir).
- Belge PR'ında testler atlanırsa `ci` süresinin kaç sn olacağı (atlanmış koşu yok).

## 5. Test karnesi (654 dosya, 7.271 test)

Kaynak: `docs/audits/test-karnesi-2026-10-09.md` ve `test-karnesi-ozet-recep-2026-10-09.md`; bu raporda yeniden hesaplanmadı.

| Hüküm | Dosya |
|---|---|
| Kalır, tam koruma | 117 |
| Kalır, güçlendirilecek (denenen en az bir bozmaya yeşil kalıyor) | 218 |
| Bozma ölçümüne girmemiş (birim, e2e, edge, betik) | 306 |
| Birleşir | 3 |
| Zorunlu olmayan işe taşınır | 2 |
| Dünya durumu kolu ayrılacak | 4 |
| Yeniden ölçülecek (instruction-surface-ppr) / ortam sorunu (Windows satır sonu) | 1 / 1 |
| Silinir | **0** |

Satırlar karne özetindeki sınıflardır; toplamı 654'e tam tamamlanmaz (ayrıntı karne JSON'unda, bu raporda yeniden toplanmadı).

Bozma ölçümü: 709 bozma denendi, 306'sı yakalanmadı; 347 dosyanın 345'i en az bir bozmayı yakaladı. (Önceki özette "558'in 345'i, %62" yazılmıştı; koşucu ilk yakalanışta durduğu için bu oran yanlıştı, 10 Ekim'de düzeltildi.)

## 6. Karar gerektiren: belge PR hedefi (Recep'in kararı)

| Seçenek | Etki | Risk |
|---|---|---|
| **A. Hedefi ≤2:00'a çek, kapılar aynen kalır** (önerim) | Ölçülen medyan 1:46 ve p90 1:59 zaten bu sınırın içinde; hiçbir kapı gevşemez | "1 dk" sözü değişir |
| B. Hedefi 1:00 tut, belge PR'ında test dilimlerini atla | Belge PR'ı hedefe iner (TAHMİN, atlanmış koşu ölçülmedi); kazanç yaklaşık 46 sn | Belge PR'ı cetvel yapısı ve kart-plan gibi belge kapılarına dokunan PR'dır; atlamak o kapıları PR'da gevşetir (cetvel: kabul edilmiş sapma) |

Önerim A: kazanç küçük (46 sn), gevşeyen koruma belge kapılarının tamamı.

**Sonuç (13 Ekim 2026): karar 351, seçenek A.** Belge PR hedefi ≤2:00; kapılar gevşemedi. Hedef `docs/standards/test-karnesi-standard.md` §8'e yazıldı (cetvel 1.3). Kod PR hedefi ≤4:00 aynen kalır, ALT-80 sürer.

## 7. Açık işler (hepsi kartlı)

| Kart | İş | Durum |
|---|---|---|
| ALT-80 | `ci` içinde Lint ∥ Build + önce/sonra ölçüm (hedef kod PR ≤4:00) | Başlamadı |
| ALT-72 | Test haritası yaşlandı: küçük PR'da 180/704 test seçiyor; yenileme OPS tetiğini bekliyor | Backlog |
| ALT-38g | Yerel `pnpm test:ilgili` yalnız betik/belge değişen PR'da 156/605 test dosyası seçiyor ve 10 dakikada bitmiyor | Backlog |
| ALT-38h | Seçicide "belirsiz" 41-43 test her PR'da koşuyor | Backlog |
| ALT-38i | 2 testin PR kapısı dışına alınması (OPS onayı) + 4 testin dünya kolu ayrımı | Backlog |
| ALT-38j | 3 test birleştirme adayı | Backlog |
| ALT-38k | 218 testin güçlendirilmesi + bozma ölçümü yapılmamış 306 dosya | Backlog |
| ALT-38l | Karne araç borçları (sabotaj `--onceki`, `beyan.cjs` birim testi, haritaya kaydın ikinci yarısı) | Backlog |

## 8. Sınır

- Hiçbir test silinmedi; çıkarılan her kapı başka yerde (master / zamanlı) koşuyor ve karnede gösteriliyor.
- Bu rapor yeni test koşturmadan, gh API okumasıyla üretildi (ham veri: depo dışı JSON, `pr-bekleme-olcum.py`).
