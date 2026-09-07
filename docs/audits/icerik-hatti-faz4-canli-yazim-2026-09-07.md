# FAZ 4 canlı yazım — REC-172 (KOL 2)

**Damga:** 2026-09-07T12:00Z civarı (koşum) · **Şerit:** URUN-KATALOG · **Kayıt:** REC-172
**Yetki:** **Recep'in kendi sözü**, 2026-09-07: *"faz 4 yaabilirsin"*. Akran aktarımı (OPS notu)
tek başına yeterli sayılmadı ve o notla koşulmadı — bkz. "Yetki zinciri" bölümü.
**YÖNTEM:** elle betik (deterministik yükleme; emirdeki öneriyle aynı, sapma yok).

## Sonuç

**109 ürün güncellendi. 339 hücre. Kaybolan alan 0.**

| Ölçüt | Öncesi | Sonrası |
|---|---|---|
| Ürün | 375 | 375 |
| Toplam teknik alan | 4887 | **5165** (+278) |
| Ürün başına ortalama | 13.0 | **13.8** |
| Hiç teknik alanı olmayan ürün | 8 | **6** |
| Değişen ürün | — | **109** (beklenen 109 ✅) |
| Değişen hücre | — | **339** (beklenen 339 ✅) |
| **Kaybolan alan (regresyon)** | — | **0** ✅ |

+278 ile 339 arasındaki fark açıklanıyor: 339 hücrenin 278'i **yeni** alan, kalanı mevcut
alanın düzeltilmesi (birim gömülü metin → sayı; ör. `9800 m³/h` → `9800`).

## Kapılar — hepsi koşum sırasında ölçüldü

1. **Evren kapısı:** 8/8 dosya. Eksik dosyayla betik çıkış 1 verir (`⛔ EVREN EKSIK`).
2. **Kesin sayı kapısı:** canlıdan 375 ürün, sunucunun `count=exact` değeriyle doğrulandı.
3. **İki anahtarlı yazma kolu:** `--yaz` **ve** `CANLI_YAZIM_ONAYI` birlikte; biri eksikse yazım reddedilir.
   Onay damgası olarak Recep'in kendi cümlesi geçildi ve log'a yazıldı.
4. **İdempotency — kanıtlandı:** yazımdan sonra ikinci kuru koşum **0 hücre / 0 ürün**,
   725 değerin tamamı "zaten aynı" kovasına düştü.
5. **Regresyon kapısı:** öncesi/sonrası anlık görüntüler alan alan karşılaştırıldı —
   **hiçbir mevcut alan kaybolmadı** (0).

## Yüklenmeyen 16 satır — bilinçli

Bunlar hata değil, **karar bekleyen** satırlar; yüklemeye hiç girmediler:

| Kalem | Sayı | Sebep |
|---|---|---|
| Nicotra AT `weight_kg` | 8 | Sürüm belirsiz (S/SC); iki sürüm arası ağırlık %20-26 sapıyor |
| SEAT STORM `max_absorbed_power_w` | 4 | Aynı anahtara **çelişen** iki değer (180 / 250) |
| SEAT STORM `ip_rating` = IP20 | 2 | Dayanak tartışmalı; reçete tek satır dedi, ölçümde iki satır çıktı |
| Danfoss/AVenS `frequency_hz` = 50 | 2 | Kaynak "50/60 Hz" diyor; `min_`/`max_` alan kararı yok |

Toplam giren 764 → çıkan 725 (fark 39: çıkarılan + karar bekleyen + mükerrer).

## Yetki zinciri — niçin bir tur beklendi

FAZ 4 GO'su bana önce **OPS kanalından** ulaştı ("Recep'in kendi sözü" tırnak içinde aktarılmıştı).
Koşmadım. Sebep: bana **ulaşan** girdi OPS'un notuydu, Recep'in mesajı değil; ve aynı gün Recep'in
kendi ayrımı yürürlükteydi — *"canlıya dokunan iş bana söylenecek, OPS'a değil"*. 725 değerin canlı
DB'ye yazılmasında yanlış anlaşılma payı sıfır olmalıydı.

Bir tur sonra Recep doğrudan yazdı (*"faz 4 yaabilirsin"*) ve koşum o an başladı. Gecikme
bir turdu; alternatifi, aktarılmış bir cümleyle canlıya yazmaktı.

Aynı gerekçeyle REC-184 silmesi de o notla yapılmadı, Recep'in kendi cümlesiyle yapıldı.

## Çıktılar

* Yazım log'u: `faz4-yazim.log` (tam liste, 725 satır) — scratchpad, depoya girmiyor
* Kaynak CSV'ler: ingestor `staging/duzeltilmis/` (8 dosya)
* Betikler: `scripts/icerik-hatti/faz4-{etiket-duzelt,teknik-yukle}.py`
* Hazırlık belgesi: `docs/audits/icerik-hatti-faz4-hazirlik-2026-09-07.md`

## Kalan (REC-172 kapanmıyor)

* **16 karar satırı** yukarıda — dördü ayrı ayrı çözülecek.
* **Kanıtsız 205 değer** (bugün 299'du; kaynak dizini tazelenince düştü — REC-207).
* **38 hücre birim-gömülü metin** taşıyor (REC-190) — bu koşumda 61 tanesi düzeltildi, kalanı ayrı.
