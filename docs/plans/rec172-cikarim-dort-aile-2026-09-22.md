# REC-172 — 4 ailenin teknik veri çıkarımı (NIMUS · NIMAX · Enkelfan EEC · Vorticent CMS ATEX)

> Durum: **PLAN v3** (2026-09-22). v1 çürütmede **BLOK** (9 bulgu), v2 **KOŞULLU** (4 kısmen +
> 6 yeni bulgu, 8 ek madde); v3 hepsini işler — belgenin sonunda "v1 → v2" ve "v2 → v3" tabloları.
> Çıkarım koşumu Recep "başla" demeden AÇILMAZ (karar 76). Canlıya yazım ayrıca Recep'in kendi
> sözüyle (iki anahtar: `--yaz` + `CANLI_YAZIM_ONAYI`).

## KAYNAK/CETVEL

- `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini tek kaynak, PDF açılmaz.
  Tazelik YEŞİL 2026-09-22 (70 PDF + 17 web, 2211 sayfa; ingestor `c9a5e58`).
- `docs/standards/product-schema-standard.md` — bu planı yöneten cetvel: §11.7 semantik sözleşme
  (`max_` = kaynağın verdiği üst sınır; nominal nokta `max_`'a yazılmaz; ölçüt ADA girer),
  §Gerilim (`voltage_v` · `voltage_alt_v` · `wiring` · `phase`), §ATEX (K11-a), §Ses, K9 güç.
  **Akım için cetvel satırı YOK** → yazımı bu işin kapsamında (adım 1).
- INV-PIM-UNOPIM-1 — `scripts/pim/unopim.cjs` (22/12, kilit `src/__tests__/conformance/pim-unopim-csv.test.ts:46-47`).
- Fark tablosu `scripts/icerik-hatti/uretici-fark-tablosu.mjs` (REC-370).
- Canlı ölçüm 2026-09-22: 4 ailenin 50 ürününde `technical_specs` NULL; `products.updated_at` var,
  `products_set_updated_at` BEFORE UPDATE tetiği her güncellemede `now()` basar; `denetim_izi_products_upd`
  tetiği UPDATE'te `admin_audit_log`'a before/after yazar (REC-292).

## YÖNTEM

**Çıkarım: deterministik okuyucu** — dil modeli değer OKUMAZ; iki koşum bayt-eşit.
**Doğrulama: ZORUNLU ve çıkarımdan farklı yöntemle.** Kaynak yapısına göre dürüst dağılım:

| Kaynak | Dizindeki yapı | Doğrulama yolu |
|---|---|---|
| Casals flipbook 191/192/199/200 (NIMUS/NIMAX) | **yalnız metin** (`tablo: 0`) | **Ajan zorunlu** (kol 1) |
| CMS föy s.1 (zone, marking, gerilim, IP) | yalnız metin | **Ajan zorunlu** (kol 1) |
| CMS föy s.2 "TECHNICAL DATA" | metin + tablo | kol 1 ya da kol 2 (metin ↔ tablo hücresi) |
| Enkelfan s.16 | metin + tablo | kol 1 ya da kol 2 |

- **Kol 1 (karar 76):** bağımsız ajanlar çıkarım CSV'sini sayfa metninden okuyarak çürütür.
- **Kol 2:** ikinci okuyucu düz metinden, birincisi tablo hücresinden; ayrışırsa KIRMIZI.
- **Karar 76 HAYIR olursa:** NIMUS/NIMAX'ın tüm alanları ve CMS s.1 alanları **yazılmaz** (ikinci
  yolları yok); iş Enkelfan + CMS s.2 alanlarıyla daralır (489 → 109) — durmaz, ama kapsam düşer.

### Yöntem kıyası (OPS isteği, karar 76 girdisi)

| Yöntem | Ne okur | Güçlü olduğu belge tipi | Zayıf yanı | Bu hatta daha önce |
|---|---|---|---|---|
| **`cikar.py`** (PyMuPDF, deterministik) → kaynak dizini `metin` + `tablo.satirlar` | PDF'i BİR KEZ | **Düzenli tablo** | Grafik tablo, bölünmüş hücre ("K"+"OD", REC-146 09-09); okuyucu belgeye özel | Dizin 09-06'dan beri tek kaynak (K15); fark tablosu okuyucuları (REC-370) |
| **markitdown MCP** (PDF → Markdown) | PDF'i yeniden açar | Serbest metin | **K15 ihlali** (ikinci metin kaynağı), tablo sadakati ölçülmedi, tazelik kapısı yok | Çıkarımda kullanılmadı |
| **Alt ajan okuma** | Sayfa metni/görüntü | Serbest metin, görsel tablo, bağlam yorumu | Uydurma/yanlış sütun riski; tekrarlanamaz | **Faz 2 (09-06): 764 satır → doğrulanan 659 · çürütülen 62 · belirsiz 43** (`rec172-faz2-sonuc-2026-09-06.md`, dal `ops/rec172-faz2`); T119 (08-20) 25 Sonnet ajanı |

**Hüküm:** çıkarım deterministik (faz 2'den farklı; ajan çıkarımının %14'ü kabul görmedi),
doğrulama ajan (metin-yalnız kaynaklarda tek bağımsız yol). markitdown kullanılmaz.

## Aile → belge/sayfa

Eşleme **model ADIYLA** (AVenS kodu ≠ Casals kodu, 15/30 — REC-370).

| Aile | Ürün | Değer satırı | Genel özellik metni |
|---|---|---|---|
| NIMUS | 15/15 | Casals flipbook 192 | flipbook 191 |
| NIMAX | 15/15 | Casals flipbook 200 | flipbook 199 |
| Enkelfan EEC | 9/9 | plug-fans PDF s.16 tablo | s.16 metni |
| CMS ATEX | **10** (11 − 14/5 T2 föysüz; 35/14 karar 75 ile 12:44Z'den beri "3kW", föyü tam) | föy s.2 | föy s.1 |

## Hedef alanlar (cetvele uygun)

| Kaynak | Anahtar | NIMUS/NIMAX | Enkelfan | CMS ATEX |
|---|---|---|---|---|
| R.P.M. | `rpm_max` | ✓ | ✓ | ✓ — 12/5, 14/5 **✗** (fan 1450 ↔ motor 1346) |
| Rated I (anma) | `absorbed_current_a` (anma yükünde çekilen akım) | ✓ 400V sütunu | ✓ | — |
| I max. (400V) | **`max_current_a`** (canlıda 2 üründe var) | — | — | ✓ |
| Rated Power / Motor Power | `rated_power_w` (kW×1000) | ✓ | ✓ | ✓ |
| Air flow | — | **✗** (kaynak üst sınır mı nominal mi SÖYLEMİYOR — §11.7; dizinde tanım yok, 191-205 + plug-fans tarandı) | **✗** (aynı) | — |
| Max. Flow | `max_delivery_m3h` + türetilen `max_delivery_ls` | — | — | ✓ (kaynak "Max." diyor) |
| Weight Kg | `weight_kg` | ✓ | ✓ | **✗** (fan 63 + motor 23 kg) |
| T2/T4/T6 | `motor_poles` | ✓ | — | ✓ |
| gerilim cümlesi | `voltage_v` | 400 | 230 (155-310) · **✗** (355-630: s.16 "400V" ↔ s.17 şema "AC380V") | 400 |
| gerilim cümlesi | `voltage_alt_v` | 230 (≤4 kW, "up to 4kW" dahil) · 690 (>4 kW) | — | 230 (≤4 kW) · 690 (>4 kW) |
| faz | `phase` | 3 ("THREE PHASE RANGE") | 1 (155-310) · **✗** (355-630, gerilimle birlikte) | 3 — **gerilimle AYNI kanıt**: s.1 "230/400V … for three phase motors" + s.2 "I max. (400V)"; biri yazılırsa ikisi, biri düşerse ikisi |
| — | `wiring` | ✗ (kaynak yazmıyor; TÜRETİLMEZ — SEAT'te dolu olması tutarsız görünür, bilerek) | ✗ | ✗ |
| IP / yalıtım | `ip_rating`, `insulation_class` | IP55 · Class F (191/199) | IP54 · Class B | IP55 · Class F |
| motor tipi | `motor_type` | — | EC | — |
| s.1 başlık | `atex_zone` | — | — | kanonik biçim (adım 1): `Zone 2` / `Zone 1` — föy kategori vermiyor, uydurulmaz |
| s.1 başlık | `atex_marking` | — | — | `Fan: Ex h IIB T3 Gc · Motor: Ex ec IIC T3 Gc` (grup/kategori yok → yalnız Ex kodu; cetvele not) |
| Sound dB(A) · Model A B C | — | ✗ | ✗ | — |

## Beklenen satır sayısı

| Aile | Ürün | Alıntılı alan/ürün | Alıntılı | Türetilen |
|---|---|---|---|---|
| NIMUS | 15 | 10 (rpm, akım, güç, ağırlık, kutup, faz, gerilim, alt gerilim, IP, yalıtım) | 150 | 0 |
| NIMAX | 15 | 10 | 150 | 0 |
| Enkelfan EEC | 9 | 7 (rpm, akım, güç, ağırlık, IP, yalıtım, motor tipi) + 155-310'da (4 ürün) gerilim+faz | 63 + 8 = **71** | 0 |
| CMS ATEX | 10 | 12 (rpm, I max, güç, max debi, kutup, faz, gerilim, alt gerilim, IP, yalıtım, zone, marking) | 120 − 2 = **118** | 10 |
| **Toplam** | **49** | | **489** | **10** |

Karar 76 hayır → NIMUS/NIMAX 300 + CMS s.1 alanları (kutup, faz, gerilim, alt gerilim, IP,
yalıtım, zone, marking: 8×10 = 80) düşer; kalan Enkelfan 71 + CMS s.2 (rpm, I max, güç, max debi:
4×10 − 2 = 38) = **109 + 10**.
Kesin sayı kuru koşumda basılır; sapma sebebiyle yazılır.

## Kabul ölçütü

1. Alıntılı her değerin atfı var (belge + sayfa + alıntı); alıntı dizinde yeniden aranır —
   **boşluk/satır sonu normalize edilerek** ("Ex h\nIIB"). Türetilen (`max_delivery_ls`) muaf, satırda
   `kaynak=türetildi`.
2. **Bağımsız doğrulama** YÖNTEM tablosuna göre: metin-yalnız kaynaklar kol 1 ile, tablolu kaynaklar
   kol 1 ya da 2 ile; ayrışma 0. Doğrulanamayan değer yazılmaz.
3. Fark tablosu yeniden koşulur (tutarlılık ölçüsü; tek başına kanıt değil).
4. İki koşum bayt-eşit.
5. Birim sözlükteki birim; PIM kolonu `<kod>(unit)` — PIM paketi ALTYAPI öznitelikleri ekledikten sonra.
6. Uydurma yok: ✗ satırları boş.
7. **Yazım tek atomik koşullu PATCH:** `products?id=eq.<id>&technical_specs=is.null&updated_at=eq.<okunan>`
   (`prefer: return=representation`); 0 satır dönerse KIRMIZI (okuma–yazma yarışı kapanır).
   Denetim kaydı **tetiğe bırakılır** (`denetim_izi_products_upd`); yükleyici ikinci audit satırı
   YAZMAZ. İkinci koşum 0 değişiklik.

## Adımlar (hepsi bu işin kapsamında — kural 14)

1. **Cetvel** (`product-schema-standard.md`): akım satırı (`absorbed_current_a` = anma yükünde çekilen
   akım · `max_current_a` = kaynağın "I max" değeri · ölçüt ADA girer); `atex_zone` kanonik biçimi
   (`Zone <n>[, Category <k>]`; kaynak kategori vermiyorsa yazılmaz); `atex_marking` için "grup/kategori
   yoksa yalnız Ex kodu, `Fan: … · Motor: …`" notu.
2. **Okuyucular** tüm alanlara + ikinci (tablo) okuyucu Enkelfan/CMS s.2 için; test + sabotaj.
   Okuyucu sütunu doğrudan eşler — `alan-etiket-sozlugu.json`'a dayanmaz (sözlükte "power" →
   `max_absorbed_power_w`, "rated current" → `rated_output_current_a` eşlemeleri bu kaynaklar için
   yanlış; sözlük düzeltmesi ayrı iş olarak REC-172'ye yazılır).
3. **Yükleyici:** `faz4-teknik-yukle.py --girdi <csv>` (sabit 8-dosya evreni yalnız eski kipte) +
   kabul 7'deki atomik koşullu PATCH + test (sabotaj: dolu `technical_specs`'e yazmaz, `updated_at`
   değişince yazmaz).
4. **Kuru koşum** → `paket/rec172-cikarim-<damga>.csv` + sayılar.
5. **Doğrulama** (karar 76'ya göre).
6. **Recep'e sunum** (tek tablo) → "yaz" → iki anahtarlı yazım.
7. **Canlı ölçüm:** 49 ürün sayfası, fark raporu yeniden, paket CSV round-trip.

## Sıra ve başka şeritler

| Parça | Sahibi | Yazımdan önce mi? |
|---|---|---|
| `atex_zone` TR/EN etiket + `spec-keys.manifest.json` | URUN | **ÖNCE** — yoksa vitrinde ham anahtar görünür (canlıda 19 üründe bugün de etiketsiz) |
| `max_current_a` etiketi var mı | URUN | **ÖNCE** — adım 1'de ölçülür |
| PIM öznitelikleri `rated_power_w(W)`, `voltage_alt_v(V)`, `max_current_a(A)`, `atex_marking`, `atex_zone` (22/12 → 27/15) | ALTYAPI | **SONRA olabilir** — DB yazımı PIM'e bağlı değil; PIM paketi öznitelikler eklenince üretilir |

## Açık sorular

| # | Soru | Kime | Plan ne yapıyor |
|---|---|---|---|
| 1 | Casals/Enkelfan "Air flow" üst sınır mı nominal mi | AVenS (71b listesine eklenir) | debi yazılmaz |
| 2 | CMS ağırlığı fan mı toplam mı | AVenS | boş |
| 3 | CMS 12/5, 14/5 fan 1450 / motor 1346 d/dk | AVenS | devir boş |
| 4 | Enkelfan 355-630 gerilimi 400 V mı 380 V mı | AVenS | gerilim + faz boş |
| 5 | Casals ses LwA mı LpA mı | AVenS | boş |
| 6 | Canlıda `atex_marking` alanında bölge taşıyan 6 ürün (K11-a ihlali) | ayrı iş (Linear sınırı dolu → REC-172 yorumu) | bu plan dokunmaz |
| 7 | QE-B (9 ürün) | — | kapsam dışı, sonraki okuyucu |
| — | NIMAX 314 T2 debi (karar 75: 5.500) | — | debi bu turda ✗ (soru 1) → karar 75 debi kısmı soru 1 cevabına kadar bekler |

## v1 → v2 (1. çürütme, BLOK)

| v1 bulgusu (risk) | v2 |
|---|---|
| ATEX bölge `atex_marking`'e (Kritik) | `atex_zone` / `atex_marking` ayrı |
| Gerilim tek sayı, yanlış atıf (Yüksek) | `voltage_v` + `voltage_alt_v`; atıf 191/199 |
| IP-55 / Class F eksik (Orta) | eklendi |
| Akım cetvelsiz; devir çelişkisi (Orta) | cetvel satırı; devir boş |
| Enkelfan A/B/C (Orta) | çıkarılmaz |
| Sayılar (Orta) | yeniden hesaplandı |
| Kabul döngüsel (Yüksek) | bağımsız doğrulama zorunlu |
| Yükleyici audit'siz, sabit evren (Kritik) | yükleyici kapsamda |
| PIM eksik; l/s; NULL (Orta/Düşük) | koordinasyon; l/s muaf; NULL |

## v2 → v3 (2. çürütme, KOŞULLU)

| v2 bulgusu | v3 |
|---|---|
| "Rated I" ve "I max" aynı alana; sözlük eşlemeleri yanlış | `absorbed_current_a` / `max_current_a` ayrı; okuyucu sözlüğe dayanmaz, sözlük düzeltmesi ayrı iş |
| Kol 2 flipbook ve CMS s.1'de yok (tablo 0) | YÖNTEM tablosu: metin-yalnız kaynakta ajan zorunlu; 76 hayır → o alanlar yazılmaz, sayı 109+10 |
| Çift audit; TOCTOU; tüm-JSON PATCH | audit tetiğe bırakıldı; atomik koşullu PATCH (`is.null` + `updated_at=eq`) |
| Sayılar bayat (35/14 canlıda 3kW) | 49 ürün; CMS 10 |
| CMS faz boş ama gerilim yazılıyor (aynı kanıt) | faz + gerilim birlikte, aynı atıfla |
| `atex_zone` biçimi 3. biçim; 6 üründe marking'de bölge | kanonik biçim cetvele; 6 ürün ayrı iş |
| `atex_marking` "Fan/Motor" anlam farkı; satır kırılımı | cetvel notu; alıntı araması normalize |
| "Air flow" `max_` değil (§11.7) | Casals/Enkelfan debisi ✗ + AVenS sorusu; CMS "Max. Flow" yazılır |
| Enkelfan 400V ↔ AC380V | 355-630 gerilim + faz ✗ |
| Yazım ↔ PIM/etiket sırası belirsiz | sıra tablosu |
