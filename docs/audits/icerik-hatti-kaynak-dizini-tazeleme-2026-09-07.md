# Kaynak dizini tazeleme — REC-207 (KOL 1)

**Damga:** 2026-09-07T11:49:46Z (`date -u`) · **Şerit:** URUN-KATALOG · **Kayıt:** REC-207 (üst: REC-206)
**Yetki:** OPS GO (11:2xZ) — canlıya yazım yok, migration yok, yalnız yerel dizin üretimi.
**YÖNTEM:** elle betik (deterministik iş; emirdeki öneriyle aynı, sapma yok).

## Ne yapıldı

`scripts/kaynak_dizini/cikar.py` (ingestor deposu) tüm kök üzerinde koşuldu; `kaynak-dizini/sayfalar.jsonl`
ve `manifest.json` yeniden üretildi.

| Ölçüt | Önce (`f167289`, 09-06) | Sonra (09-07) |
|---|---|---|
| Belge | 23 | **58** |
| Dosya (takma ad dahil) | 24 | **59** |
| Sayfa | 1171 | **2127** |
| Tablolu sayfa | 580 | **1261** |
| Metinsiz sayfa | 12 | 16 |
| Araç sürümü | pymupdf 1.27.2.2 | pymupdf **1.27.2.3** |

**Tazelik kapısı** (`scripts/kaynak_dizini/tazelik.py`, borusuz ölçüldü): **YEŞİL, çıkış 0** —
"diskte 59 PDF · dizinde 58 belge · takma ad 1". Koşumdan önce aynı kapı **KIRMIZI, çıkış 1** veriyordu
ve 36 eksik dosyayı adıyla listeliyordu.

## Kanıt oranına etkisi (asıl kazanç)

`kanit-tablosu.py` yeni dizine karşı, canlı ürün verisiyle (375 ürün, salt okuma):

| | Önce | Sonra |
|---|---|---|
| ⛔ KANITSIZ KALAN | 299 | **205** |
| KENDİ kaynağında bulunan | — | 3238 / 3733 (%86) |
| ⚠ YABANCI kaynakta geçen | — | 290 |

**94 değer kanıtlandı** — tek yönlü mandal, yalnız küçülür. Bu, KOL 1'in KOL 2'yi açtığının sayısal kanıtı:
belgeler dizine girmeden bu 94 değerin hiçbiri kanıt satırına bağlanamıyordu.

## Üç bulgu (ölçülmüş, hiçbiri varsayım değil)

### 1. ⚠Kayıttaki teşhisim yanlıştı — kapı zaten vardı

REC-207'yi yazarken "küme farkını ölçen kapı gerekiyor, bugünkü `_kaynak.taban_dogrula` yalnız sayfa
sayısı ölçüyor" dedim. **Yanlış.** `tazelik.py` (REC-163 Adım 5) tam bunu ölçüyor: EKSİK / DEĞİŞMİŞ /
ARTIK üç sınıfı ayrı ayrı, takma adları eksik saymadan, fark listesini **adıyla** basarak, ve fail-closed
(borusuz ölçtüm: çıkış kodu 1).

Hatanın kaynağı: bir kapıya bakıp hükmü verdim, **ikinci kapıyı aramadım**. "Bir dosyaya bakıp yokluk
ilan etme" hatasının bu haftaki üçüncü örneği.

### 2. Gerçek boşluk: kapının tetiği yok

`tazelik.py` **hiçbir yerden çağrılmıyor** — ingestor deposunda CI yok (`.github/workflows` dizini
mevcut değil), git kancası yok; ana repoda da (`.github/`, `scripts/`, `.githooks/`) çağrı yok.
Tek geçtiği yer `scripts/icerik-hatti/kanit-tablosu.py:141`'deki hata mesajı — o da `cikar.py`'yi
işaret ediyor, tazelik kapısını değil.

Yani 36 belgenin bir gün görünmez kalmasının sebebi **kapının yokluğu değil, tetiğinin yokluğu**.
Yazılmış, doğru ölçen, fail-closed bir kapı hiç koşmuyorsa var olmayan kapıdan farkı yoktur.
REC-207'nin kalan işi budur.

### 3. 15 PDF versiyon kontrolünde değildi

Dün "36 belge indirildi" commit'i (`90bebe2`) 15 PDF'i dışarıda bırakmış: Nicotra ADH serisi ve
Danfoss frekans konvertörü kılavuzları diskte vardı, git'te yoktu (`git ls-files` 44 · diskte 59).
Bu dosyalar bu koşumda dizine girdi; commit'lenmezlerse dizin ile depo çelişir ve kapı başka bir
makinede haklı olarak kırmızı verir. Depo private, PDF'ler zaten versiyonlanıyor (44 tanesi) —
telif engeli yok. Bu koşumla birlikte commit'lendiler.

## Araç sürümü değişimi — ölçüldü, çıktı bozulmadı

Manifest `arac_surum` 1.27.2.2 → 1.27.2.3. Betiğin kendi kuralı "farklı PyMuPDF sürümü farklı çıktı
verebilir ve bu fark GÖRÜNÜR olmalı" diyor, bu yüzden varsaymak yerine ölçtüm: eski dizin (`HEAD`)
ile yeni dizin, **ortak 1171 sayfa** üzerinde karşılaştırıldı.

* Metin farkı: **0**
* Tablo farkı: **0**
* Eskide olup yenide olmayan kayıt: **0**

Mevcut kanıt satırları (sayfa/tablo referansları) geçerliliğini koruyor. Determinizm sözü sürüm
sıçramasına rağmen tutmuş — ama bu **ölçüldüğü için** biliniyor, garanti edildiği için değil.

## Bitti ölçütü — durum

| Ölçüt | Durum |
|---|---|
| dizindeki belge sayısı == ingestor'daki PDF sayısı | ✅ 58 + 1 takma ad = 59 = diskteki PDF |
| Kapı iki yönlü (bayatken kırmızı, tazeyken yeşil) | ✅ aynı kapı koşum öncesi KIRMIZI/çıkış 1, sonrası YEŞİL/çıkış 0 |
| Manifest damgası + `arac_surum` kayıtlı | ✅ (damga bilinçli olarak manifestte, dizin satırlarında değil — determinizm kuralı) |
| Kapı otomatik koşuyor | ❌ **AÇIK** — tetik yok, REC-207'nin kalan işi |

Determinizm sınavı (aynı PDF iki kez → byte-eşit) bu koşumda ayrıca koşulmadı; yerine daha güçlü bir
ölçüm yapıldı: **farklı araç sürümüyle** üretilen iki çıktı ortak sayfalarda byte düzeyinde eşit çıktı.
