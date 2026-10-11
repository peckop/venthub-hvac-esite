# KTL-7 — P-Q eğrisi: kitapçıkta ne var, veritabanında ne var, orta nokta nereden geldi (KATALOG, 2026-10-08)

**Tetik.** Seçim grafiği üretici (Systemair) eğrisiyle yan yana konunca bizim eğrilerin düz çizgi gibi
göründüğü fark edildi. **Cetvel:** `docs/standards/catalog-ingestion-standard.md §6.3` ("Eğri çizimi" alt bölümü
bu işle yazıldı) ve `docs/standards/spec-axis-standard.md §2.3` (`pq_curve_kaynak`).

**Yöntem.** Kaynak dizini (`sayfalar.jsonl`, 2211 sayfa / 86 dosya); PDF yalnız Faz 0'ın üç sayfasında, karar 318
onayıyla çizim katmanı için açıldı. Veritabanı: canlı, **yalnız okuma**. Yazma yok. Betikler yeniden koşulabilir
(KATALOG makinesinde `C:\tmp\ktl7\`: `olc.py` DB ölçümü, `kok.py` köken, `f0*.py` Faz 0).

## 1. Ana bulgu

Hiçbir kitapçıkta P-Q eğrisi **sayısal tablo** olarak verilmiyor; eğri her yerde yalnız grafik. Tabloda yalnız model
başına azami debi ve azami basınç (tek nokta) var. 8+ nokta ancak grafikten okuyarak girer; nokta uydurulmaz.

## 2. Veritabanı durumu (canlı ölçüm)

- `products.technical_specs.pq_curve`: 145 ürün, 15 aile. 141 ürün **tam 3 nokta**; yalnız Punto Evo/Flexo (4 ürün)
  6 nokta. 8+ nokta olan ürün yok.
- Eğrisi hiç olmayan aileler: SEAT 40, STORM 20, JET 21, Nicotra DD 13 / AT 8 / ADH 8 / RDH 6, Casals NIMUS 15 /
  NIMAX 15 / ENKELFAN 9, Vortice CMS ATEX 11, Slimroof 10, Heatmaster 10, Nordik HVLS 7, AVenS kendi aileleri.

## 3. Orta noktanın kökeni (betikle ölçüldü)

141 eğrinin ortadaki noktası **kitapçıktan okunmamış**. Orta debi hepsinde tam `Qmax/2`; orta basınç:

| Orta basınç | Ürün | Aileler | Nasıl kurulmuş |
|---|---|---|---|
| tam `%75·Pmax` | 58 | Commercial In-Line 19, Industrial Ventilation 17, E-ATEX 14 (biri yuvarlamayla %74), Radon 8 | Commercial ve Industrial betiğinde formül (`round(p_max * 0.75, 1)`, yorum "Construct PQ curve dynamically"); E-ATEX ve Radon'da formül çıktısı betiğe sabit yazılmış |
| tam `%50·Pmax` (düz çizgi) | 48 | Quadro Evo 23, Lineo Quiet 12, Mono 8, Isı GK 5 | Quadro ve Lineo Quiet betiğinde formül (yorum "Simplified 3-point PQ Curve"); Mono ve Isı GK'da sabit |
| `%56–%70`, formüle uymuyor | 35 | QBK 21, AVenS Plug 14 | betiğe elle yazılmış değerler; **gerçek mi uydurma mı BİLİNMİYOR** (kitapçık grafiğiyle kıyaslanmadan hüküm yok) |

Toplam 58 + 48 + 35 = 141; canlı ölçümle örtüşür (57 tam %75, 48 tam %50, kalan 36; fark E-ATEX'in yuvarlanan bir ürünü).

**Zincir.** (1) 21–23 Haziran 2026, `venthub-pdf-ingestor`, "Visual Multi-Agent Team" çıkarım hattı: her ailenin
`02-work/scratch_multiagent/final_visual_extraction.json` dosyasında eğri zaten üç nokta; `validate_and_generate.py`
bunu sabit yazmış ya da formülle yeniden kurmuş (commit e195767, e467a13, ec48c4e, 11895c0; yazar adı makinenin git
kimliğidir, insan-yazar kanıtı değil). (2) `walkthrough.md` satır 98: *"Basitleştirilmiş 3 noktalı PQ debi-basınç eğrisi
tüm modellere eklendi"* — bilinçli sadeleştirmeydi. (3) CSV `spec_pq_curve` sütunu `scripts/kademe2-load/planla.mjs`
(`spec_` önekini atıp değeri aynen `technical_specs`'e koyar) ile yüklendi; **"basitleştirilmiş" bilgisi DB'ye geçmedi,
kaynak/doğruluk etiketi hiç yoktu.** Seçici hepsini ölçüm sandı.

**Açık soru (bu işin dışı, MÜHENDİSLİK kapsamı):** Punto Evo/Flexo'daki 6 nokta hiçbir kitapçıktan çıkmıyor
(`walkthrough.md` satır 121 "seçim standardına göre" diyor; hangi standart belirsiz).

## 4. Aile başına durum

"Ölçülmedi" = bu turda betik ya da okumayla doğrulanmadı. Hız kademesi eğrisi (Systemair KD tipi, 5 kademe) kitapçıkta
**sayısal tablo olarak hiçbir yerde yok**; Vortice Commercial In-Line'da grafikte iki kademe (min ve maks hız) çizili.

| Aile | Kitapçıkta P-Q | Kaynak | Oktav ses tablosu |
|---|---|---|---|
| Nicotra ADH 8 · RDH 6 · AT 8 · DD 13 | yalnız grafik | 479 / 481 / 480 / 493 serisi PDF'leri | var (ADH/RDH/AT sayısal, 63–8000 Hz) |
| SEAT 40 | yalnız grafik | SEAT-CATALOGUE.pdf, seat-15…50 fişleri | fişlerde biçim ölçülmedi |
| STORM 20 | yalnız grafik | Storm_series.pdf s.3,5,7 | yok |
| JET 21 | grafik, **itme** verir (P-Q ile seçilmez) | JET.pdf, JET-20/25/30 föyleri | JET.pdf'te 3 sayfa |
| Casals KENTALFAN 14 · ENKELFAN 9 | yalnız grafik | cata-logo-plug-fans_casals.pdf | yok |
| Casals NIMUS 15 · NIMAX 15 | **kitapçık dizinde yok** (yalnız web metni) | — | — |
| AVenS kendi aileleri (≈40) | **kitapçık dizinde yok** (yalnız fiyat listesi, eğri yok) | avens_fiyat_listesi_2026_HQ.pdf | — |
| Vortice kanal/ATEX/konut (97 + 48 ürün) | yalnız grafik; tablo = azami debi/basınç | Commercial, E-ATEX, Industrial, Quadro, QBK, Lineo Quiet, Radon, VMC kitapçıkları | Radon, VMC, NRG'de var |
| Vortice CMS ATEX 11 · Slimroof 10 · Heatmaster 10 | yalnız grafik | tek-model dosyaları | yok |

## 5. Faz 0 (karar 318): grafikten okuma sınaması

Üç sayfa, yazma yok. Ayrıntı ve yöntem: `catalog-ingestion-standard.md §6.3 "Eğri çizimi"`.

| Sayfa | Yöntem | Sonuç |
|---|---|---|
| Vortice Commercial In-Line s.11–13 | vektör (0 görüntü) | **±%2 kapısı TUTTU**, en büyük sapma %0,2 |
| Nicotra ADH s.8 | vektör, log-log nomogram | çıkarım denenmedi (çok eğri, azami değer tablosu yok) → ayrı kart |
| SEAT 15 fişi s.2 | raster ≈180 dpi, yarı-log | 3 eğri çıktı (15 · 8 · 5 nokta); kapı çıpa yokluğundan sınanamadı → `cipasiz` |

## 6. Giriş planı (canlı yazma her fazda ayrı Recep onayı)

| Faz | İş | Ürün | Yazma |
|---|---|---|---|
| 1 | Vortice kanal/ATEX: Quadro 23, QBK 21, E-ATEX 14, Commercial 12, Lineo Quiet 12, Mono 8, Lineo 7 (3 nokta → 8+) | 97 | kuru koşu + döküm, sonra onay. **Mevcut 141 satırın `pq_curve_kaynak` etiketlemesi bu pakette** (karar 320) |
| 2 | Kalan eğrililer: Aksiyel Endüstriyel 16, KENTALFAN 14, Radon 8, VORT HR 5, Punto Evo 4, Tiracamino 1 | 48 | aynı |
| 3 | Eğrisi olmayan, grafiği olan: Nicotra 35, SEAT 40, STORM 20, ENKELFAN 9, CMS ATEX 11 | 115 | aynı |
| 4 | Kaynağı olmayanlar: NIMUS/NIMAX 30, AVenS ≈40: önce kaynak edinme; JET 21 alan kararı (itme) sonra | ≈90 | — |

Şema notu: kademe eğrileri (çok devirli) için `pq_curve` tek eğri tutar; `pq_curves[{kademe, noktalar}]` listesine
genişleme `product-schema-standard` ve Karar 316 çekirdeğinden bağımsız şema işidir.

## 7. Yöntem notu — Haiku araştırmacılar

Beş araştırmacı açıldı; rapor veren ikisi de **yanlış** çıktı (Nicotra raporu "sayısal tablo, ~12 nokta/model" dedi —
yok; dosya yolu dizinde yok; sayfa "280–340" iken dosya 90 sayfa. Vortice raporu "ölçülmedi" ile hüküm verdi).
Mekanik betikle yeniden ölçüldü, kalan üçü durduruldu. Kural (karar 314): sayı, varlık ve dosya yolu hükmü betikle ya da
kaynağa bakılarak doğrulanmadan rapora girmez.
