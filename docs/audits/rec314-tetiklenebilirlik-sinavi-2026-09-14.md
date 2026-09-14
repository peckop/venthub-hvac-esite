# REC-314 — tetiklenebilirlik sınavı: 13 kalem, hepsi KAL (2026-09-14)

> **Soru:** envanterde "çağıranı yok" görünen yetenek kalemleri gerçekten **erişilemez** mi,
> yoksa yalnız **o işler henüz gelmemiş** mi? Fark önemli: birincisi sökme gerekçesidir,
> ikincisi değildir.
>
> **Cevap: hiçbiri erişilemez değil. 13 kalemin 13'ü de tetiklendi — hüküm KAL.**
>
> Cetvel: `docs/standards/arac-envanteri-standard.md` (AXIOM 3) ·
> Envanter: `docs/audits/arac-envanteri-2026-09-07.md` §3.3

## 1 · Recep'in ilkesi ölçümle doğrulandı

Parti 1'in üç kalemi de "hiç çağrılmamış" listesindeydi ve **sökme sırasının başındaydı.**
Ölçüm üçünün de tetiklenebilir olduğunu gösterdi. Atıl liste bir sökme listesi olarak
kullanılsaydı **çalışan üç araç silinecekti.**

Bu, cetvelin AXIOM 3'ünün üç sorusunun bir sınırını gösterir: "çağıranı var mı" sorusu
**geçmişe** bakar, "çağrılabilir mi" sorusuna cevap vermez.

## 2 · Parti 1 — 3 kalem, 6/6 (ölçüm 2026-09-14)

| Kalem | Vaka | Skor | Süre |
|---|---|---|---|
| `ui-ux-pro-max` | 01 | 0.971 | 211 sn |
| `ui-ux-pro-max` | 02 | 0.819 | 112 sn |
| `supabase-security` | 01 | 0.943 | 157 sn |
| `supabase-security` | 02 | 0.911 | 148 sn |
| `to-prd` | 01 | 0.755 | 181 sn |
| `to-prd` | 02 | 0.762 | 176 sn |

Altısında da `without` kolu **0**, `partial` false.

## 3 · Parti 2 — 10 kalem, 20 vaka, 20/20 (ölçüm 2026-09-14)

Üç alt-ajan, üç ayrı çalışma kopyası:

| Parti | Kalemler | Vaka | Maliyet | Süre |
|---|---|---|---|---|
| 2A | `venthub-global-rontgen` · `threejs-webgl-performance` · `to-issues` · `venthub-architecture` | 6/6 | 2.40 USD | 491 sn |
| 2B | `venthub-tasarim-dili` · `venthub-auditor` · `venthub-enterprise-audit` | 6/6 | 1.80 USD | 393 sn |
| 2C | `vercel-composition-patterns` · `vercel-react-best-practices` · `web-design-guidelines` | 8/8 | 1.68 USD | 363 sn |

Hepsinde `with = 1.00` / `without = 0.00` / **Δ = +1.00**. Toplam **~5.88 USD**
(onaylanan bütçe 17.2 USD).

## 4 · ⚠SINAVIN KENDİ SINIRLARI — adıyla yazılı

Bunlar kalem kusuru **değil**, sınav yönteminin sınırıdır ve hükmü nitelendirir:

- **6 vakada koşum `Reached maximum number of turns (4)` ile bitti.** Yani
  **"tetikleniyor" KANITLI, "tetiklendikten sonra işi bitiriyor" ÖLÇÜLMEDİ.** Hüküm KAL
  kaldı çünkü sorulan soru tetiklenebilirlikti; bitirme ayrı bir sorudur ve ölçülmemiştir.
- **`--runs 1`** koşuldu (varsayılan 3 değil) — tek koşumun kararsızlığı ölçülmedi.
- **Örnek rastgele değil:** her kalemin **ilk iki** tetik vakası alındı. Bu bir örneklemdir,
  tam karne değildir.
- **`tool_used:Skill` hangi skill'in tetiklendiğini ayırt etmiyor.** `without = 0` olması bu
  riski azaltır, **kaldırmaz.**
- **"Tetiklenmemeli" kolu koşulmadı** — yani yanlış tetiklenme (false positive) ölçülmedi.

## 5 · ⚠MALİYET TABANI DÜZELTİLDİ: 0.28 USD/vaka (0.86 DEĞİL)

Parti 1'den çıkarılan 0.86 USD/vaka tabanı, o partinin **daha uzun** koşumlarından
geliyordu (112–211 sn); parti 2 koşumları 39–113 sn sürdü ve vaka başı **0.28 USD** ölçüldü.

Bu, aynı günün **dördüncü** "ölçüt doğru, evren yanlış" vakası — ve ilk kez **fazla**
tahmin yönünde. Fazla tahmin de bir hatadır: 13 kalemin tam kapsamı eski tabanla ~134 USD
görünüyordu ve örnekleme "mecburi" ilan edilmişti; doğru tabanla o karar farklı verilebilirdi.

## 6 · ⛔ÖN KOŞUL DERSİ (benim hatam)

`claude plugin eval` **bizim `evals/evals.json` biçimini tanımıyor.** Doğru zincir:

```
node scripts/skills-eval-convert.mjs --skill=<kalem>
claude plugin eval .claude --eval-dir evals-yerlesik --case <vaka> --no-publish --runs 1 --ablation with-without
```

`--eval-dir` **zorunludur** (varsayılan `evals/`). Üretilen ağaç `.gitignore`'da
(satır 134–139), yani **her taze ağaçta yeniden üretilir.**

Alt-ajanlara **komutu verdim, ön koşulunu vermedim.** Parti 1'in koşabilmesinin sebebi o
ağaçta ağacın **zaten üretilmiş** olmasıydı.

⭐**Ders: dün çalışan bir komut, o ağaçta `.gitignore`'da duran üretilmiş bir artefakt
sayesinde çalışmış olabilir.** *"Bende çalışıyordu"* taze bir ağaçta kanıt değildir.

## 7 · ⛔ÜÇ PARTİ RAPORU KAYBOLDU — kayıt olarak yazıyorum

Alt-ajanlar raporlarını kendi izole çalışma kopyalarına yazdı
(`docs/audits/rec314-parti2a/2b/2c-2026-09-14.md`). O kopyalar iş bitince **otomatik
temizlendi** ve raporlar onlarla gitti; görev çıktı dosyası da **0 bayt.**

Ölçüm sonuçları kaybolmadı — özet tablo aynı gün Linear'a ve şerit durum dosyasına
yazılmıştı, bu belge onlardan derlendi. Kaybolan şey **vaka düzeyindeki ayrıntı**
(her vakanın kendi skoru ve çıktısı) ve parti 2 için artık geri getirilemez.

⭐**Ders: izole çalışma kopyasına yazılan çıktı, ana ağaca taşınmadıkça TESLİM EDİLMİŞ
SAYILMAZ.** Alt-ajan briefine "raporu şu yola yaz" demek yetmez; brief "raporu ana ağaca
commit et **ya da** gövdesini dönüş mesajında ver" demelidir. Bu bir sonraki alt-ajan işinde
uygulanacak.

## 8 · ⭐YENİ SINIF: "ÇIKTISI REDDEDİLEN ARAÇ" — bu çerçeveye GİRMİYORDU

Aynı gün REC-333'te ölçülen bir vaka, AXIOM 3'ün üç sorusunun **dördüncüsünü** gerektirdi.

`ai-auto-repair.yml` üç sorudan **geçiyordu**: çağıranı vardı (`ci.yml:201`), koşum izi
vardı, Jules'a fiilen görev gidiyordu ve dal yaratıyordu. Ama ürettiği **10 PR'ın hepsi
CLOSED — 0/10 merge.**

Yani ne "KAL" (bir gün işe yarar) ne "ONAR" (zincir kırık) doğruydu: **araç çalışıyordu,
çıktısı kabul edilmiyordu.** Atıl araç **çağrılmaz**; bu araç **çağrılıyor ama çıktısı
kabul edilmiyor.**

→ Cetvele **dördüncü soru** olarak eklendi: *"Ürettiği çıktı kabul ediliyor mu?"*
(`docs/standards/arac-envanteri-standard.md` AXIOM 3, `cikti_kabul` alanı ve
`CIKTISI-REDDEDILDI` durumu).

## 9 · Envanterde nerede duruyor

13 kalemin **26 satırı** (her kalem `.claude` + `.agent` ağacında) §3.3'te; `kanıt`
hücrelerine sınav damgası elle yazıldı. **Üretici bu hücrelere dokunmuyor** — `--yaz`
sonrası fark **0 bayt** ölçüldü, `INV-ARAC-1..3` **19/19** yeşil.

⚠Bu, AXIOM 3'ün sınırının **öteki** yüzü: mevcut bir satırın insan hükmü kolonları
gerçekten insanındır; üreticinin yazdığı tek şey **YENİ** satır ve **KAYIP** satırın durum
sütunudur (bkz. envanter belgesi bölüm 0).
