# REC-172 — 4 ailenin teknik veri çıkarımı (NIMUS · NIMAX · Enkelfan EEC · Vorticent CMS ATEX)

> Durum: **PLAN v2** (2026-09-22). v1 bağımsız çürütmede **BLOK** aldı (9 bulgu, aşağıda
> "v1 → v2" tablosu); v2 hepsini işler. Çıkarım koşumu Recep "başla" demeden AÇILMAZ (karar 76).
> Canlıya yazım ayrıca Recep'in kendi sözüyle (iki anahtar: `--yaz` + `CANLI_YAZIM_ONAYI`).

## KAYNAK/CETVEL

- `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini tek kaynak, PDF açılmaz.
  Tazelik YEŞİL 2026-09-22 (70 PDF + 17 web, 2211 sayfa; 26 dosya bugün girdi, ingestor `c9a5e58`).
- `docs/standards/product-schema-standard.md` — bu planı yöneten cetvel. Özellikle: §Gerilim
  ("bir alan bir bilgi": `voltage_v` · `voltage_alt_v` · `wiring` · `phase`), §ATEX (K11-a:
  `atex_marking` ≠ `atex_zone`), §Ses (`noise_level_db_a` legacy), K9 güç ayrımı
  (`rated_power_w` = motor gücü, `max_absorbed_power_w` = çekilen güç).
  **Akım için cetvel satırı YOK** → yazımı bu işin kapsamında (adım 1).
- INV-PIM-UNOPIM-1 — PIM kolonu `<kod>` + `<kod>(unit)`; pilot listesi `scripts/pim/unopim.cjs`
  (22 öznitelik / 12 ölçülü, kilit `src/__tests__/conformance/pim-unopim-csv.test.ts:46-47`).
- Fark tablosu `scripts/icerik-hatti/uretici-fark-tablosu.mjs` (REC-370).
- Tazelik: canlı ölçüm 2026-09-22 — 4 ailenin 50 ürününde `technical_specs` **NULL**.

## YÖNTEM

**Çıkarım: deterministik okuyucu** (regex/tablo) — dil modeli değer OKUMAZ; her değer kaynaktaki
satırın kendisidir, iki koşum bayt-eşit. Dört kaynak da düzenli tablo (ölçüldü).
**Doğrulama: ZORUNLU ve farklı yöntemle** — okuyucu hem çıkarıp hem doğrularsa kendi hatasını
göremez (v1'in kabul 2'si döngüseldi). İki bağımsız kol:
1. **Workflow (karar 76, OPS önerisi):** bağımsız ajanlar çıkarım CSV'sini sayfa METNİNDEN
   (regex'in okuduğu yapıdan değil) okuyarak çürütür; her aile en az 1 ajan, her alan örneklenir.
2. Karar 76 hayır olursa yedek: ikinci okuyucu aynı değeri **düz metinden** (`metin`) okur,
   birincisi **tablo hücresinden** (`tablo.satirlar`) ya da tersi; iki yol ayrışırsa KIRMIZI.
   Bu, v1'deki "aynı okuyucu iki kez" değil, iki ayrı çıkarım yoludur.

### Yöntem kıyası (OPS isteği, karar 76 girdisi)

| Yöntem | Ne okur | Güçlü olduğu belge tipi | Zayıf yanı | Bu hatta daha önce |
|---|---|---|---|---|
| **`cikar.py`** (PyMuPDF, deterministik) → kaynak dizini `metin` + `tablo.satirlar` | PDF'i BİR KEZ; sayfa metni + tablo hücreleri | **Düzenli tablo** (föy "TECHNICAL DATA", katalog model satırı) | Grafik/görsel tablo ve bölünmüş hücre (ör. "K"+"OD", REC-146 09-09); okuyucu belge tipine özel yazılır | Dizin 09-06'dan beri tek kaynak (K15); fark tablosu okuyucuları (REC-370, 09-22) |
| **markitdown MCP** (PDF → Markdown) | PDF'i yeniden açar, Markdown'a çevirir | Serbest metin, başlık yapısı | **K15 ihlali** (PDF ikinci kez açılır; dizinde olmayan ikinci bir metin kaynağı doğar), tablo sadakati ölçülmedi, hash/tazelik kapısı yok | Çıkarımda kullanılmadı (7 günde 1 çağrı, `mcp-bellek-2026-09-22.md`) |
| **Alt ajan okuma** (dil modeli) | Sayfa metni ya da görüntü | **Serbest metin, görsel tablo**, bağlam gerektiren yorum (ör. "absorbed power" dipnotu) | Değer uydurma/yanlış sütun riski; tekrarlanabilir değil | **Faz 2 (09-06, OPS): çıkarım + doğrulama ajanları, 8 aile · 764 satır → doğrulanan 659 · çürütülen 62 · belirsiz 43** (`rec172-faz2-sonuc-2026-09-06.md`, dal `ops/rec172-faz2`). T119 (08-20): 25 Sonnet ajanı 74 sayfayı görsel okudu. |

**Hüküm:** bu 4 ailenin dördü de düzenli tablo → **çıkarım `cikar.py` dizini + deterministik okuyucu**
(faz 2'den FARKLI; sebep: faz 2'de ajan çıkarımının %14'ü kabul görmedi — 105/764 — ve o kaynakların
bir kısmı serbest metin/grafikti; burada değil). **Doğrulama ajan ile** (faz 2'deki doğrulama
kolunun aynısı, ama bu kez çıkarımdan farklı yöntemle — döngü kırılır). markitdown kullanılmaz (K15).
Serbest metin/grafik kaynaklı aileler (QE-B, dikdörtgen kanal, sulu batarya föyü gelince) için
faz 2 kalıbı (ajan çıkarım + ajan doğrulama) geçerli kalır.

## Aile → belge/sayfa

Eşleme **model ADIYLA** (AVenS kodu ≠ Casals kodu, 15/30 — REC-370).

| Aile | Ürün | Değer tablosu | Genel özellik metni |
|---|---|---|---|
| NIMUS | 15/15 (ölçüldü) | Casals flipbook 192 | flipbook 191 ("IP-55 protection and class F", gerilim cümlesi) |
| NIMAX | 15/15 (ölçüldü) | Casals flipbook 200 | flipbook 199 (aynı cümleler) |
| Enkelfan EEC | 9/9 | plug-fans PDF s.16 tablo | s.16 metni ("Single-phase 230V … 155 to 310 … three-phase 400V … 355 to 630. IP54 motor and class B insulation", "external rotor EC motor") |
| CMS ATEX | **9** (11 ürün − 14/5 T2 föysüz − 35/14 karar 75'e bağlı) | föy s.2 "TECHNICAL DATA" | föy s.1 başlık (zone + kodlar) ve gerilim cümlesi |

## Hedef alanlar (cetvele uygun)

| Kaynak | Anahtar | NIMUS/NIMAX | Enkelfan | CMS ATEX |
|---|---|---|---|---|
| R.P.M. | `rpm_max` | ✓ | ✓ | ✓ — **12/5 ve 14/5 HARİÇ** (fan 1450 ↔ motor 1346 çelişkisi, boş + AVenS sorusu) |
| Rated I / I max. | `absorbed_current_a` | ✓ 400V sütunu | ✓ | ✓ I max. (400V) |
| Rated Power kW / Motor Power | `rated_power_w` (kW×1000) | ✓ | ✓ | ✓ |
| Air flow / Max. Flow | `max_delivery_m3h` | ✓ | ✓ | ✓ |
| türetilen | `max_delivery_ls` = round(m³/h ÷ 3,6; 2) | türetilir | türetilir | türetilir |
| Weight Kg | `weight_kg` | ✓ | ✓ | **✗** (fan 63 + motor 23 kg — anlamı belirsiz, AVenS sorusu) |
| T2/T4/T6 | `motor_poles` | ✓ | — | ✓ |
| gerilim cümlesi | `voltage_v` | 400 | 230 (155-310) · 400 (355-630) | 400 |
| gerilim cümlesi | `voltage_alt_v` | 230 (≤4 kW) · 690 (>4 kW) | — | 230 (≤4 kW) · 690 (>4 kW) |
| gerilim cümlesi | `phase` | 3 ("THREE PHASE RANGE") | 1 · 3 (kaynak cümlesi) | **✗** (föy tek/üç fazı model başına söylemiyor) |
| — | `wiring` | **✗** (kaynak bağlantı tipini yazmıyor; gerilimden TÜRETİLMEZ) | ✗ | ✗ |
| IP / yalıtım | `ip_rating`, `insulation_class` | IP55 · Class F (191/199) | IP54 · Class B | IP55 · Class F |
| motor tipi | `motor_type` | — | EC | — |
| s.1 başlık | `atex_zone` | — | — | `Zone 2` (8 föy) · `Zone 1` (12/5, 14/5) |
| s.1 başlık | `atex_marking` | — | — | FAN + MOTOR kodları (ör. `Fan: Ex h IIB T3 Gc · Motor: Ex ec IIC T3 Gc`) — bölge YAZILMAZ (K11-a) |
| Sound dB(A) | — | **✗** | ✗ | — |
| Model A B C | — | — | **✗** (dizinde ölçü çizimi yok; tr.ts "Genişlik/Derinlik/Yükseklik" anlamı doğrulanmadı) | — |

- **Ses:** "dizinde tanımı yok" (Casals 191-205 tarandı; katalog giriş sayfası dizinde değil).
  Ölçütü belirsiz değer `noise_level_db_a`'ya (legacy) da yazılmaz.
- **ATEX biçim birliği:** canlıdaki 14 Vortice ürünü `atex_marking`'i tek dize (`II 2G/D h T3/125°C
  X Gb/Db`) taşıyor; CMS föyü fan ve motor için AYRI kod veriyor. Yazım biçimi: `Fan: … · Motor: …`
  (kaynağın ayrımı korunur). Bu biçim cetvelin ATEX bölümüne örnek olarak eklenir (adım 1).

## Beklenen satır sayısı

| Aile | Ürün | Alıntılı alan/ürün | Alıntılı | Türetilen (l/s) |
|---|---|---|---|---|
| NIMUS | 15 | 11 | 165 | 15 |
| NIMAX | 15 | 11 | 165 | 15 |
| Enkelfan EEC | 9 | 9 (rpm, akım, güç, debi, ağırlık, gerilim, faz, IP, yalıtım) + motor tipi = 10 | 90 | 9 |
| CMS ATEX | 9 | 11 (rpm, akım, güç, debi, kutup, gerilim, alt gerilim, IP, yalıtım, zone, marking) | 99 − 2 (12/5, 14/5 rpm) = **97** | 9 |
| **Toplam** | **48** | | **517** | **48** |

Kesin sayı kuru koşumda basılır; sapma varsa sebebi yazılır, sessizce kabul edilmez.

## Kabul ölçütü

1. **Alıntılı her değerin atfı var** (belge + sayfa + alıntı); alıntı dizinde yeniden aranır,
   bulunamazsa KIRMIZI. **Türetilen değerler** (`max_delivery_ls`) bu kapıdan muaf, satırda
   `kaynak=türetildi (max_delivery_m3h ÷ 3,6)` yazar.
2. **Bağımsız doğrulama zorunlu** (YÖNTEM kol 1 ya da 2): 517 alıntılı değerin tamamı ikinci
   yoldan okunur; ayrışma 0.
3. Fark tablosu yeniden koşulur: 48 ürün için canlı ↔ üretici `aynı` (bu tek başına kanıt DEĞİL,
   yalnız yükleme sonrası tutarlılık ölçüsü).
4. İki koşum bayt-eşit.
5. Birim: sözlükteki birim; PIM kolonu `<kod>(unit)`.
6. Uydurma yok: kaynakta olmayan / çelişkili alan boş kalır (✗ satırları).
7. Yükleme idempotent (ikinci koşum 0 değişiklik), yalnız boş (NULL) `technical_specs`'e yazar;
   dolu bir anahtarın üstüne YAZMAZ; her ürün için `admin_audit_log` satırı (before/after).

## Adımlar (hepsi bu işin kapsamında — kural 14)

1. **Cetvel:** `product-schema-standard.md`'ye akım satırı (`absorbed_current_a` = kaynaktaki
   anma/I max akımı, `voltage_v` gerilimindeki; hangisi olduğu satırın `alinti`sında) + ATEX
   `Fan: … · Motor: …` biçim örneği.
2. **Okuyucular:** fark tablosu okuyucularını tüm alanlara genişlet + ikinci (düz metin) okuyucu;
   test + sabotaj (bir hücre bozulunca KIRMIZI).
3. **Yükleyici:** `faz4-teknik-yukle.py` parametrelenir (`--girdi <csv>`, sabit 8-dosya evreni
   yalnız eski kipte), `admin_audit_log` yazımı, NULL-yalnız yazım, `updated_at` ile eşzamanlılık
   kontrolü (okuduktan sonra değiştiyse yazmaz) — test dahil.
4. **Kuru koşum** → `paket/rec172-cikarim-<damga>.csv` (sku, alan, deger, birim, belge, sayfa,
   alinti, kaynak_turu) + satır sayısı.
5. **Bağımsız doğrulama** (karar 76 → Workflow; hayır → ikinci okuyucu).
6. **Recep'e sunum:** 517+48 değer, 3 örnek ürün, ✗ listesi → "yaz" sözü → iki anahtarlı yükleme.
7. **Canlı ölçüm:** 48 ürün sayfası, fark tablosu, paket CSV round-trip.

## Başka şeritlere düşen parçalar (koordinasyon, bu planın bağımlılığı)

| Parça | Sahibi | Ne |
|---|---|---|
| PIM öznitelikleri | ALTYAPI | `rated_power_w(W)`, `voltage_alt_v(V)`, `atex_marking`, `atex_zone` eklenir; kilit 22/12 → 26/14 |
| Vitrin etiketi | URUN | `atex_zone` için TR/EN etiket + `spec-keys.manifest.json` kaydı (canlıda 19 üründe zaten var, INV-SPEC-LABEL-1 görmüyor) |

## Açık sorular

| # | Soru | Kime | Plan ne yapıyor |
|---|---|---|---|
| 1 | CMS ATEX 35/14: 3 kW mı 4 kW mı | Recep — **karar 75 EVET: üreticiye göre (3 kW), ad+slug düzeltilir** (OPS aktarımı 2026-09-22; canlı yazım Recep'in KATALOG penceresindeki sözüyle) | ad düzeltmesi canlıya yazılınca çıkarıma girer: +1 ürün, +11 değer (toplam 49 ürün · 528 + 49) |
| 2 | NIMAX 314 T2 debi 5.500 / 5.240 | Recep — **karar 75 EVET: 5.500** | 5.500 yazılır |
| 3 | CMS ağırlığı fan mı toplam mı | AVenS | alan boş |
| 4 | CMS 12/5, 14/5 fan 1450 / motor 1346 d/dk | AVenS | devir boş |
| 5 | Casals ses değeri LwA mı LpA mı, mesafe | AVenS / katalog giriş sayfası | alan boş |
| 6 | QE-B (9 ürün) kaynağı dizinde | — | kapsam dışı, sonraki okuyucu |

## v1 → v2 (çürütme bulguları ve karşılığı)

| v1 bulgusu (risk) | v2 |
|---|---|
| ATEX bölge `atex_marking`'e yazılıyordu; 12/5, 14/5 Zone 1 (Kritik) | `atex_zone` / `atex_marking` ayrı; föy başına okunur |
| Gerilim tek sayı, 230/690 atılıyor, atıf yanlış sayfa (Yüksek) | `voltage_v` + `voltage_alt_v`; atıf 191/199; `wiring` türetilmez |
| NIMUS/NIMAX IP-55 / Class F eksik (Orta) | eklendi |
| Akım anlamı cetvelsiz; 12/5-14/5 devir çelişkisi (Orta) | cetvel satırı adım 1; devir boş |
| Enkelfan A/B/C anlamı doğrulanmadı (Orta) | çıkarılmaz |
| Sayılar tutarsız (Orta) | yeniden hesaplandı: 48 ürün, 517 + 48 |
| Kabul 2 döngüsel (Yüksek) | bağımsız doğrulama ZORUNLU, farklı yol |
| Yükleyici bu işi yapamaz, audit yok (Kritik) | adım 3: parametre + audit + NULL-yalnız + eşzamanlılık + test |
| PIM'de eksik öznitelikler; l/s alıntı kapısında; `{}` ≠ NULL (Orta/Düşük) | koordinasyon tablosu; l/s muaf; NULL düzeltildi |
