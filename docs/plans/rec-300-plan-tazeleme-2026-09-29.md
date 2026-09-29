# REC-300 — plan tazeleme (bugünkü master'a göre) · 2026-09-29

> **URUN · Bu belge PLAN'dır: kod yok, migration yok, prod yazımı yok.** Ana plan
> [rec-adres-agac-tek-yayin-2026-09-07.md](rec-adres-agac-tek-yayin-2026-09-07.md) (v5) yerinde durur;
> burası "v5'ten bu yana ne değişti, ne kaldı, yayın günü ne sırayla koşar" tazelemesidir.
> **Emir:** OPS 2026-09-29 (karar 165 istisnası: REC-300 için yalnız plan tazeleme, KOD YAYINI YOK).

**KAYNAK/CETVEL:** ana plan v5 · `canonical-url-standard.md` · `rendering-cache-standard.md` ·
`docs/standards/yayin-gorunurluk-denetim-standard.md` (GEO-SEO, IndexNow satırı) · Kararlar: K3-b, K4,
**157** (yayın katalog paketini BEKLEMEZ), **161** (Recep yeni adresleri önce yerel önizlemede görür),
**164 = A** (IndexNow yayınla AYNI yayında). **Ölçüm tazeliği:** master f89b5c9b5 + `gh pr view` 2026-09-29;
bayrak değerleri `src/config/features.ts` (`ADRES_SEMASI_K3B = false`, `EN_YAYIN = false`).
**YÖNTEM:** şerit (URUN), elle; kod yayını yok.

## 1. v5'ten bu yana ne değişti

| Karar / olay | Etkisi |
|---|---|
| **157** (Recep evet) | Yayın **REC-212 taşınabilir katalog paketini beklemez**; önce adres yayını, katalog paketi hemen ardından yeniden üretir. v5 Faz 5 "REC-212 bitti" ön koşulu **DÜŞER**. Migration içeren merge yine Recep'in ayrı "şimdi yap" onayıyla (kural 13). |
| **161** | Bayrağı canlıda açmadan önce Recep yeni adresleri **yerel önizlemede** görür: `node scripts/onizleme.mjs <dal>` → `http://localhost:3100/tr` (#1413). Faz 4 bu araçla koşar; canlı yayın onaydan SONRA. |
| **164 = A** | IndexNow anahtarı + doğrulama dosyası + bildirim **adres yayınıyla aynı yayında** başlar (K4'e sadık). #1459 o yayına kadar DONUK; yayın günü listesine adım olarak girer (§4). |
| **#1461 (REC-374)** birleşti 5eb8f45a8 | Marka listesi = DB'de aktif ürünü olan markalar (5); casals/flexiva/frekans-konvertoru bugün 308. Bayrak açılınca marka adresi `/tr/markalar/<slug>`; üç eski slug için açık-kip hedefleri kodda ve kapıda (INV-MARKA-KAYNAK-1). Yayın günü ek iş yok, yalnız ölçüm. |
| **#1455 (3d)** birleşti | Yüzeyler `adresUret`'e bağlı (bayrak arkasında). **REC-403** (bu belgeyle aynı gün PR): açık kipte tek slug'lu yüzeylerde fazla 308 sıçraması onarılıyor; **REC-434**: kategori sayfası hızlı seçim kartlarında DB'de olmayan iki slug (ayrı, küçük). |
| Bing Webmaster kurulu (29.08) | IndexNow sonrası izleme yeri hazır; **Recep'e adım verilmez**. |

## 2. Faz durumu (master'a göre)

| Faz | Durum | Kanıt |
|---|---|---|
| 0 cetvel | Bitti | #1339 |
| 1-A takma ad tablosu + okuyan kod | Bitti (canlıda görünmez) | #1338, #1346, #1341 |
| 1-B ağaç + Casals + 40 aile (migration) | **AÇIK PR, yayın sırasında** | #1352 (Recep onayı, kural 13) |
| 2 model adresleri | Liste hazır; slug verisi yayın paketinde | #1356 (442 adres) |
| 3a `adresUret` + bayrak (kapalı) | Bitti | #1395 |
| 3b aile/rota çekirdeği + 3b-2 yeni rotalar | Bitti (bayrak arkasında) | #1396, #1444 |
| 3c eski adres haritası + middleware eşleyicisi | Bitti (bayrak kapalı) | #1403 |
| 3d yüzeyler | Bitti; **artı REC-403 onarımı** | #1455 + REC-403 PR |
| **3e** site haritası (tip başına + 442 model, hreflang, x-default, `EN_YAYIN`'a bağlı) + sözlük "alt kategori/seri" + `features.ts` EN metni | **KALDI** | ana plan m.10, m.12 |
| **3f** arama RPC (adres yerine kimlik) | **KALDI — MIGRATION, Recep onayı** | ana plan m.8 |
| **3g** tazeleme (etiketli önbellek + webhook dalları) | **KALDI** | ana plan m.9 |
| 3-C bayrak `true` + harita + config'ten 19 satır silme | Yayın günü, tek geri dönüşsüz adım | ana plan Faz 3-C |
| 4 Recep önizleme | Araç hazır; gezinme listesi ana plan Faz 4 | karar 161 |
| 5 yayın | Aşağıdaki §3-4 | — |

## 3. Kalan iş sırası (kod hazırlığı; yayın YOK)

1. **REC-403** (PR yolda) → 2. **3e** (sitemap + sözlük + EN metni) → 3. **3g** (tazeleme) → 4. **3f** (arama RPC; migration,
Recep "şimdi yap") → 5. Faz 4 önizleme paketi (yerel, bayrak AÇIK; gezinme listesine **SEAT ATEX modeli JS-kapali** ve
"EN vitrin de açılsın mı?" sorusu eklenir — OPS'ta bekleyen karar 64 paragrafıyla birlikte) → 6. Recep onayı → yayın.

**Ön koşullar (ölçülecek, bugün DOĞRULANMADI):** 7 ailenin EN adı dolu mu · GSC taban ölçümü (karar 86 şartı; GEO-SEO
erişimi var, sonuç bu tazelemede aranmadı) · linkinator + unlighthouse yayın öncesi taraması · Faz 4 onayı.

## 4. YAYIN GÜNÜ listesi (sırayla)

1. **Faz 1-B merge** (#1352, Recep "şimdi yap") → canlı ölçüm: 40 eski aile adresi tek 308.
2. **Faz 3-C merge** (bayrak `true` + harita). Aralarındaki pencere dakikalarla sınırlı.
3. Deploy sonrası **yayın ölçümü** (ana plan §7): 5 örnek yeni adres 200, eski adresler **tek** 308, sitemap satır sayısı = beklenen,
   hreflang/canonical, linkinator kırık 0 / zincir 0.
4. **IndexNow adımı (karar 164 A) — yayınla AYNI yayında:**
   a. #1459 içeriği (anahtar `src/config/indexnow.ts`, `public/<anahtar>.txt`, yol süzgeci) 3-C ile birlikte ya da hemen önce iner;
      bayrak açık olduğundan süzgeç devre dışı, bildirim serbest.
   b. Canlıda `https://venthub.com.tr/<anahtar>.txt` **200, 32 bayt, içerik = anahtar** ölçülür.
   c. **Hangi adresler:** yeni sitemap'in TÜM adresleri (bugün 88; yayından sonra 442 model + aile + kategori + dal + marka + statik),
      tek toplu bildirim (tavan 10.000). **Eski adresler BİLDİRİLMEZ** (308). Site haritası kaynağı canlı `sitemap.xml`.
   d. **Sırası:** (1) dosya ölçümü → (2) `--kuru` sayısı beklenene eşit mi → (3) GEO-SEO toplu betiği bir kez (200/202 kaydı) →
      (4) Bing Webmaster Tools'ta gönderim izleme (kurulu; Recep'e adım yok).
   e. Sonrasında kural: **bilgi merkezi ya da blog yayınlandıktan sonra toplu betik bir kez** (kodda duran içerik, webhook dalı yok).
5. GSC: site haritası yeniden gönderilir (GEO-SEO API'si) + yayın günü URL denetimi (Googlebot gözüyle, GEO-SEO).
6. **KATALOG'a ve OPS'a haber** (karar 157): katalog paketi yeniden üretsin (tek kaynak canlı DB).
7. İki hafta izleme (ana plan §8).

## 5. Riskler / açık noktalar

* **#1459 dalı master'dan geride** (yayın günü güncellenir; süzgeç testleri yeniden koşar).
* **REC-403 bitmeden bayrak açılmaz**: aksi hâlde Orbital çift tık ve kategori menüsü dal için bir fazla 308 üretir (ölçüldü).
* **3f migration**: `get_search_suggestions` dönüş tipi değişiyor (DROP+CREATE aynı işlemde); tek tüketici aynı PR'da.
* **Marka adresleri** açık kipte `/tr/markalar/<slug>`; #1461 kapısı hem kapalı hem açık kipi ölçer, canlıda yalnız kapalı kip ölçülebilir.
* **REC-434** (ölü hızlı seçim slug'ları) yayını bloklamaz ama yayın öncesi kapanması beklenir (ziyaretçiye 404 gösteriyor olabilir; ölçüm kaydın içinde).
* Bu tazeleme **REC-406** (marka tek kaynak = DB, migration) ve **1-B** ile ilişkilidir: Casals ürünleri girince marka listesine geri eklenir.

## 6. OPS'tan beklenen

Yalnız onay: bu sıra ve §4 yayın günü listesi. Karar isteyen yeni soru yok (164 cevaplandı; karar 64 paragrafı zaten OPS'ta).
