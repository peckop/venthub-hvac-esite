# Adres şeması (K3-b) + kategori ağacı (K17) + Casals — TEK YAYIN planı · v2

> **REC-191 · URUN · v1 2026-09-07 · v2 2026-09-22**
> **Bu belge PLAN'dır. Kod YOK, migration YOK, prod yazımı YOK.** Uygulama REC-300 emriyle,
> REC-212 (katalog paketi) bittikten sonra ve **Recep ön izleme kapısından** geçerek koşar (karar 68).
> v1 (2026-09-07) eski **K3**'ü (öneksiz kısa adres) planlıyordu; K3 **2026-09-11'de iptal edildi**
> (K3-b). v1'in metni git geçmişindedir; v1'in bağımsız çürütmesinden hâlâ geçerli olan bulgular
> (yedi kaçak yüzey, hop bütçesi, ISR yolları, DB fonksiyonu) aşağıya taşındı.

**KAYNAK/CETVEL:**
- Kararlar — SEO ve Yayın **K3-b** (2026-09-11, Recep) · Kararlar — Katalog **K17 + K17 EK** (Casals,
  4 yeni dal) · Kararlar — Vitrin 15A K3-b notu (iki sayfa birimi, breadcrumb 5 seviye) · karar **68**
  (ağaç + adres TEK yayın, REC-212 sonrası, Recep ön izleme kapısı).
- Design-Menü teslimleri (2026-09-11, Claude Design "Venthub-Menü-Sayfalar", Recep izniyle salt
  okundu, bu PR'la depoya girdi): [adres şeması v3](rec300-design-adres-semasi-v3-2026-09-11.md) ·
  [slug üretim kuralı](rec300-design-slug-uretim-kurali-2026-09-11.md) ·
  [kategori ağacı SQL hazırlığı](rec300-design-kategori-agaci-sql-2026-09-11.md).
- Cetveller: `docs/standards/canonical-url-standard.md` · `docs/standards/category-taxonomy-standard.md`
  (§4.1 çözücü, §8 iki tablo kuralı, §9 döküm) · `docs/plans/slug-localization-2026-08-10.md`.
- **Adres şemasının kendi cetveli YOK** — `docs/standards/adres-semasi-standard.md` yazımı bu işin
  kapsamındadır (Faz 0).
- **Ölçüm tazeliği:** canlı site + canlı DB (yalnız SELECT), **2026-09-22 11:3x–11:5xZ**. Her sayı
  ölçümle işaretli; Design dosyalarındaki sayılar ölçümle karşılaştırıldı (§3).

**YÖNTEM:** şerit (URUN, günler süren prod-kapılı iş) · plan → plan-challenger (zorunlu: adres = SEO,
308 geri dönüşsüz) · her PR diff-review · migration'lı PR kural 13.

---

## 1. Ne değişiyor — tek cümle

TR yüzeyde önekler Türkçeleşir (`/tr/kategori/`, `/tr/urun/`, `/tr/markalar/`, `/tr/urunler`), her
model (442 ürün) kendi kanonik adresini alır (`/tr/urun/<uzun-slug>-p-<sku>`), `?sku=` kalkar;
aynı yayında ağaç 4 dal kazanır, 44 ürün dal değiştirir, 4 aile Casals markasına geçer.
EN yüzeyde önek değişmez ama **model adresleri EN'de de değişir** (§3, fark F4).

## 2. Hedef şema (K3-b + Design v3 §3)

| Nesne | TR | EN | Çözüm kuralı |
|---|---|---|---|
| Tüm ürünler | `/tr/urunler` | `/en/products` | — |
| Kategori | `/tr/kategori/<kök>` | `/en/category/<kök>` | slug çözücü (cetvel §4.1) |
| Dal | `/tr/kategori/<kök>/<dal>` | `/en/category/<kök>/<dal>` | iki seviye |
| Aile (seri) | `/tr/urun/<aile-slug>` | `/en/products/<aile-slug>` | son `-p-` **yok** → aile |
| **Model (kanonik)** | `/tr/urun/<slug_tr>-p-<sku>` | `/en/products/<slug_en>-p-<sku>` | son `-p-`'den böl, sağ = SKU (harf duyarsız), sol serbest |
| Marka | `/tr/markalar/<marka>` | `/en/brands/<marka>` | — |

Kurallar (Design slug kuralından, değiştirilmeden): SKU adreste küçük harf; büyük harfli gelen →
308 küçüğe · slug metni yanlışsa (eski metin, yanlış dil) → 308 kanoniğe, sayfa yine SKU'dan açılır ·
`-p-` dizisi slug metninde geçemez · slug ≤ 70 karakter, teknik değerler yalnız `technical_specs`'ten.

## 3. Bugünkü durum — ölçüm ve Design dosyalarıyla FARKLAR

### 3.1 Canlı ölçüm (2026-09-22)

| ölçüm | değer | nasıl |
|---|---|---|
| ürün (silinmemiş) | **442** (441 active, 1 archived) | DB |
| tekil `lower(sku)` | **442** — SKU'nun hepsi `^[A-Z0-9-]+$`, hiçbirinde `-p-` yok | DB |
| ürün slug'ı dolu / tekil | 442 / 442; aile slug'ıyla çakışan 0 | DB |
| aile | **47**, hepsi ürünlü; ailesiz ürün 0 | DB |
| aktif kök / aktif dal | **6 / 18** (hedef ağaç 7 / 26, §3.2 F2) | DB |
| `brands` tablosu | **5** marka (avens, danfoss, nicotra-gebhardt, seat, vortice); **casals yok** | DB |
| kiracı | 1 | DB |
| site haritası | kategori **24** (hepsi tek seviyeli `/tr/category/<slug>`) · ürün **48** (47 aile + dizin) · marka 7 | `sitemap.xml` |
| iki seviyeli dal adresi | `/tr/category/fanlar/radyal-fanlar` → **308** → `/tr/category/radyal-fanlar` | curl |
| `/tr/kategori/…` · `/tr/urun/…` · `/tr/markalar/…` · `/tr/urunler` | hepsi **404** (henüz yok) | curl |
| `/tr/products/<aile>?sku=VRT-17175` | 200 (aile sayfası, varyant seçili) | curl |
| `/tr/cart` · `/tr/checkout` | 200 | curl |
| adres dizesini **elle** kuran dosya (test hariç) | `/category/` **9 dosya, 22 satır** · `/products/` **9 dosya** · `/brands/` 2 | grep |
| adres üreten DB fonksiyonu | **1**: `get_search_suggestions` (`/category/` + `/products/`) | `pg_proc` taraması |
| `next.config.mjs` elle yazılmış ürün yönlendirmesi | **6**, hepsi hedefi `…?sku=` (NIC-11921 + 5 VRT-CA-IL RECT) | dosya |
| `<html lang>` | TR **ve EN** sayfada `lang="tr"` | curl |

### 3.2 Design dosyalarıyla farklar (plan ölçümü esas alır)

| # | Design dosyası ne diyor | ölçüm ne diyor | plandaki hüküm |
|---|---|---|---|
| **F1** | v3 §1: canlı site `/tr/urun/…`, `/tr/kategori/…` kullanıyor | canlıda ikisi de **404**; canlı `/tr/products/`, `/tr/category/` | Design §1 tablosu bayat; 308 kaynakları canlı adreslerdir |
| **F2** | v3 §5: 7 kategori · 26 dal, slug tablosu (`hava-sartlandirma`, `kontrol-ve-suruculer`, `aksiyel-fanlar`, `tek-oda-uniteleri`, `sulu-bataryalar`…) | canlıda 6 kök · 18 dal; **9 slug farklı** (`iklimlendirme-ve-hava-sartlandirma`, `kontrol-sistemleri`, `aksiyel-sanayi-fanlari`, `tekil-oda-uniteleri`, `sulu-batarya-kanal-tipi`, `banyo-ve-tuvalet-fanlari`, `yedek-parca-ve-sensorler`); `somine-ve-baca-fanlari` ve `endustriyel-tavan-vantilatorleri` tabloda **yok** | SQL hazırlığı yalnız +4 dal ve 1 slug (korozyon) değiştiriyor; slug kuralı §6 "kategori slug'ı zenginleşmez" diyor. **Plan canlı slug'ları korur**, yalnız korozyonu değiştirir. 26 dallık ağacın geri kalanı → **Recep sorusu R1** (§8) |
| **F3** | SQL hazırlığı §4 satır 1–2: `7 + 26` kategori adresi 308 | 308 kaynağı **canlıda var olan** adrestir: 6 kök + 18 dal = **24**; yeni dallar (4) eski adressizdir | satır sayısı 24 (+Sığınak, F6) |
| **F4** | 308 toplamı **534** satır (442 model dahil); EN "değişmez" | EN'de de model adresi doğar: `/en/products/<ürün-slug>` bugün 308 → `aile?sku=`; yeni hedef `/en/products/<slug_en>-p-<sku>` → **+442 EN** | model yönlendirmeleri **tablo değil kod**: çözücü eski ürün slug'ını SKU'ya çevirip 308 verir (§4 Faz 3). Tablo satırı yalnız kategori/aile/marka |
| **F5** | slug kuralı §1: `products.metadata.slug={tr,en}`, "şema değişmez" | `products` tablosunda **`metadata` sütunu YOK** (alan listesi okundu) | şema değişir: `products.slug_i18n jsonb` (mevcut `name_i18n`/`description_i18n` deseniyle) → **migration**, kural 13 |
| **F6** | v3 §5: Sığınak **kategori** (3 dal) | canlıda `shelter-ventilation` **dal** (level 1, Fanlar altında, 3 ürün); 09-04 kararı uygulanmamış | Sığınak'ın köke çıkması bu yayına girer (adres zaten değişiyor, ikinci taşınma olmasın); 3 alt dalı (`siginak-havalandirma-uniteleri`…) açılıp açılmayacağı R1 |
| **F7** | v3 §6: marka 308 **7** satır | DB'de 5 marka; site haritasındaki marka listesi statik dosyadan (`src/data/brands.ts`, 6 kayıt): **casals, flexiva, frekans-konvertoru** var, **seat, danfoss yok** — ama `/tr/brands/seat` 200 | marka yönlendirmesi **tek desen kuralı** (`/tr/brands/:slug*` → `/tr/markalar/:slug*`), satır sayısı önemsiz. Liste kusuru ayrı kayıt (§9 yan bulgu Y1) |
| **F8** | 308 tablosunda `/tr/products` dizini yok | `/tr/products` 200 ve site haritasında | +1 satır: `/tr/products` → `/tr/urunler` |

### 3.3 Planın konusu olan ek kusurlar (karar 68 notu)

- **REC-289 · Edge'de DB sorgusu:** `src/middleware.ts:123-156` `/products/<uuid>` için Supabase'e
  sorgu atıyor (kural 12 ihlali). Yeni çözücü bu işi **sayfa katmanına** alır; middleware'e hiçbir
  yeni DB sorgusu eklenmez, mevcut olan kalkar.
- **`<html lang="tr">` EN sayfada da:** kök `src/app/layout.tsx:41` dili sabit yazıyor. İki etkisi var:
  (a) EN kırıntı yolu CSS `uppercase` ile büyütülünce `i` → **`İ`** oluyor ("breadcrumb İ" kusuru);
  (b) arama motoru EN sayfayı Türkçe beyanıyla alıyor, hreflang ile çelişiyor. hreflang aynı yayında
  yenilendiği için düzeltme **bu yayına** girer.
- **AVenS name_en:** EN adı boş aile **7** (AVenS 5/14, SEAT 1, Vortice 1). EN model slug'ı ada
  dayandığı için bu boşluk kapanmadan EN slug üretilemez → **Faz 2 ön koşulu** (KATALOG/paket).

## 4. Fazlar

Sıra kasıtlı: veri → slug üretimi → kod → ön izleme → yayın. Faz 1–3 **canlı adresi değiştirmez**;
adres yalnız Faz 5'te, tek seferde değişir.

### Faz 0 — cetvel (kod yok)
`docs/standards/adres-semasi-standard.md`: §2 şeması, çözüm kuralı, rezerve kelimeler (Design v3 §4
listesi + `api`, `admin`, `_next`), hop bütçesi (v1 çürütmesinden: dil önekli adres **≤ 1 hop**, dil
öneksiz eski adres **≤ 3 hop**), yayın kontrol listesi. Kanonik-URL cetveline çapraz bağlantı.

### Faz 1 — veri (migration, Recep kapısı, kural 13)
Tek migration dosyası, SQL hazırlığı §3.1–3.4'ten; **canlı adres değişmez** (aile slug'ı değişen
4 Casals ailesi hariç — bkz. aşağı "zamanlama tuzağı").
1. `brands`'a Casals (`tenant_id` dahil, kural 12).
2. +4 dal (plug-fans, cabinet-fans, ambient-air-curtains, electric-heated-air-curtains); `level` ve
   `sort_order` komşu satırdan **ölçülerek** yazılır (Design ölçmemiş).
3. 6 aile + 44 ürün taşıma — **iki tablo birlikte** (cetvel §8).
4. Ad/kimlik: Radyal adı · Korozyon adı + `metadata.slug.tr` · `sub.spare-parts` translation_key ·
   4 Casals ailesi (`brand_id`, ad, slug `casals-…`).
5. Sığınak köke çıkar (F6) — R1 cevabına bağlı.
6. `products.slug_i18n jsonb` sütunu (F5), boş açılır.

Migration kalıbı karar 45'teki gibi: plan bütünlüğü kapısı (beklenen satır sayıları: aile 6+4,
ürün 44) · kiracı tek satır kapısı · her hedef satırın **eski değeri** doğrulanır (elle değişmişse
EXCEPTION) · idempotent. Gölgede en az 4 senaryo (temiz · ikinci koşum · hedef elle değişmiş ·
iki kiracı), çıkış kodlarıyla.

⚠**Zamanlama tuzağı:** 4 Casals ailesinin slug'ı veriyle birlikte değişir; migration Faz 5'ten önce
inerse eski aile adresi (`/tr/products/avens-nimax`) o gün kırılır. İki yol: (a) migration Faz 5
yayınıyla **aynı gün** iner ve eski 4 aile slug'ı için 308 aynı PR'da gelir; (b) slug değişimi
migration'dan çıkarılıp Faz 5'e bırakılır. **Öneri (a)** — tek yayın ilkesi zaten bunu ister.

### Faz 2 — slug üretimi (REC-212 paketi, KATALOG + DESIGN-KATALOG)
442 ürün için `slug_tr` · `slug_en` Design kuralıyla, paket CSV'sinde (`urunler.csv`). URUN yalnız
**doğrulayıcıyı** yazar: uzunluk ≤ 70 · `-p-` yok · rezerve kelime yok · `(dil, slug)` tekil ·
teknik değer `technical_specs`'te var (uydurma sayı yok) · EN slug'da Türkçe harf yok. Ön koşul:
7 ailenin EN adı (§3.3). Yazım `slug_i18n`'e ayrı veri migration'ıyla (kural 13).

### Faz 3 — kod (tek PR zinciri, bayrak arkasında, canlıda görünmez)
1. **Rota:** TR önekleri `next.config` **rewrite** ile mevcut sayfalara bağlanır
   (`/tr/kategori/*` → iç `/tr/category/*`); klasör kopyası açılmaz. Eski TR adreslere 308 **redirect**
   (Next'te redirect rewrite'tan önce değerlendirilir; döngü testi kapıya girer).
2. **Model çözücü** (`productRoute.ts` genişler, saf katman kalır): son `-p-` → SKU (harf duyarsız)
   → model sayfası; SKU büyük harfliyse, slug metni kanoniğe uymuyorsa ya da dil yanlışsa 308;
   `-p-` yoksa aile; eski ürün slug'ı (`/tr/products/<ürün-slug>`) → 308 model; `?sku=` → 308 model.
   Bugünkü "unavailable ≠ 404" ayrımı korunur.
3. **UUID yönlendirmesi** middleware'den çözücüye taşınır (REC-289).
4. **Elle adres kuran yüzeyler** (ölçülen 9+9+2 dosya) tek SSOT'a (`Routes` + `localizedHref`)
   bağlanır. v1 çürütmesinin listesi hâlâ geçerli: webhook ISR yolları (`api/webhook/supabase/route.ts`)
   · JSON-LD (`lib/seo/jsonld.ts`) · `config/applications.ts` · `utils/applicationLinks.ts` ·
   kategori `page.tsx`'leri · `Breadcrumb.tsx` · `ClientLayout.tsx` · `SearchOverlay.tsx`.
5. **`get_search_suggestions`** DB fonksiyonu yeni adresi üretir → **migration** (kural 13); Faz 5
   ile aynı gün.
6. **`next.config.mjs`'teki 6 elle yönlendirme** (hedefi `?sku=`) hedeflerini doğrudan
   `-p-<sku>` adresine yazar — zincir olmasın (tek hop). Aynı dosyadaki eski kategori
   yönlendirmelerinin hedefi de doğrudan `/tr/kategori/…` olur.
7. **Site haritası** tip başına ayrılır (Design v3 §6) + 442 model adresi girer; hreflang TR↔EN;
   `x-default`.
8. **`<html lang>`** dile göre (§3.3).
9. **Product JSON-LD** fiyatsız (K1): `sku`, `brand`, `additionalProperty[]`.

### Faz 4 — Recep ön izleme kapısı (karar 68 şartı)
Vercel önizlemesi (bayrak açık) ya da yerel üretim paketi; Recep'e **gezinme listesi** verilir:
menü → her kök kategori → yeni 4 dal → bir Casals ailesi → bir model sayfası (TR + EN) → eski adres
örnekleri (kategori, dal, aile, `?sku=`, eski ürün slug'ı, büyük harfli SKU) yeni adrese gidiyor mu →
arama önerisinden bir ürüne tık → kırıntı yolu (EN'de `İ` yok). **Recep "gördüm, tamam" demeden
merge yok.**

### Faz 5 — yayın (tek gün)
Sıra: Faz 1 migration + Faz 3 kod + arama fonksiyonu migration'ı aynı gün → bayrak açılır →
site haritası GSC'ye bildirilir + IndexNow (K4) → yayın ölçümü (aşağı).

## 5. Yönlendirme tablosu (config satırları; model yönlendirmeleri kodda)

| # | eski (canlı) | yeni | adet | nerede |
|---|---|---|---|---|
| 1 | `/tr/category/<kök>` | `/tr/kategori/<kök>` | 6 | config |
| 2 | `/tr/category/<dal>` | `/tr/kategori/<kök>/<dal>` | 18 (korozyon slug'ıyla) | config (dal→kök eşlemesi statik) |
| 3 | `/tr/category/<kök>/<dal>` (bugün zaten 308) | `/tr/kategori/<kök>/<dal>` | 18 | config — **hedef yeniden yazılır**, zincir yok |
| 4 | `/tr/category/siginak-havalandirma` | `/tr/kategori/siginak-havalandirma` | 1 | R1'e bağlı |
| 5 | `/tr/products` | `/tr/urunler` | 1 | config |
| 6 | `/tr/products/<aile>` | `/tr/urun/<aile>` | 47 | config (desen) |
| 7 | `/(tr\|en)/products/avens-{plug-fanlar,enkelfan-ec-plug,nimax,nimus}` | `casals-…` | 4 × 2 dil | config |
| 8 | `/tr/brands/*` | `/tr/markalar/*` | desen | config |
| 9 | `/(tr\|en)/products/<ürün-slug>` · `?sku=` · büyük harf SKU · yanlış slug metni | model kanoniği | 442 × 2 dil | **çözücü** |
| 10 | `next.config` 6 elle kural | doğrudan `-p-<sku>` | 6 | config |
| — | `/tr/cart` · `/tr/checkout` | **dokunulmaz** (OPS RED 11-09, K1) | 0 | — |

Design'ın 534'ünden fark: kategori 33 değil 24 (+18 hedefi yenilenen) · EN model 442 eklendi ·
model yönlendirmeleri tabloda değil çözücüde (Vercel yönlendirme sayısı sınırına takılmamak ve slug
her düzeltildiğinde config'e satır eklememek için).

## 6. Kapılar (uygulamayla birlikte yazılır)

- **INV-ADRES-SEMASI-1:** her iç bağlantı `Routes`/`localizedHref`'ten; `'/category/'`, `'/products/'`,
  `'/brands/'` dizesi SSOT dışında 0 (evren: `src/**` + `supabase/functions/**`, test hariç).
- **INV-ADRES-CAKISMA-1:** kategori/dal/aile slug'ları rezerve kelimelerle kesişmez; aile slug'ında
  `-p-` yok; `(dil, slug)` tekil. Rota listesi dosya sisteminden türetilir (elle liste bayatlar).
  Design "tek rota kütüğü tablosu" istiyor; önekler ad alanını zaten ayırdığı için **tablo yerine
  kapı** öneriyorum (sapma, OPS'a yazıldı).
- **INV-ADRES-COZUCU-1:** çözücünün 10 dalı (model · büyük harf · yanlış slug · yanlış dil · aile ·
  eski ürün slug · `?sku=` · UUID · yok → 404 · ağ hatası → unavailable) birim testte.
- **Yayın ölçüm betiği** (`docs/audits/rec300-*`): site haritasındaki her adres 200 · §5 tablosunun
  her satırı **tek hop** ve doğru hedef · 20 eski adres örneği · redirect↔rewrite döngüsü yok.
- `pnpm build` (prerender) + keycheck + Playwright smoke (kategori → dal → aile → model).

## 7. Yayın sonrası (iki hafta)

GSC kapsam raporunda "bulunamadı" birikimi 0 · eski adres örneklemi tek hop · trafik düşüşü beklenir,
kalıcı düşüş beklenmez. Site haritasında bugün 442 model adresi olmadığı için modellerin SEO kaybı
riski düşüktür; asıl risk 24 kategori + 47 aile adresindedir.

## 8. Recep'e gidecek karar (tek başına sorulur, pakete gömülmez)

- **R1 · hedef ağaç:** Design'ın 26 dallık tablosu mu uygulanacak (9 slug değişir, 2 dal düşer,
  Sığınak altında 3 yeni dal), yoksa bugünkü 18 dal + K17'nin 4 yeni dalı mı (yalnız korozyon slug'ı
  değişir)? Adres bu yayında zaten değiştiği için iki yolun 308 bedeli aynıdır; fark, 9 slug'ın
  **doğru adı taşıyıp taşımadığı** ve dal tanımlarının yeniden yazılmasıdır. **Öneri: bugünkü slug'lar
  + 4 yeni dal** (slug kuralı §6 da bunu söylüyor); 26 dallık tablo ayrı bir ağaç kararı olarak kalır.

Design dosyalarında açık kalan diğer kalemler (jet-fans TR slug'ı, pasif satırların silinmesi, ATEX
kürasyon karesi, aksesuar slug'ında teknik değer boş kalması) bu yayını **engellemez**; ayrı kalır.

## 9. Kapsam dışı ve yan bulgular

- Nitelik/faset katmanı (REC-95) — adres oturduktan sonra, yeni şemada doğar.
- **Y1 (ayrı kayıt açılacak):** `src/data/brands.ts` marka listesi DB ile uyumsuz — `frekans-konvertoru`
  marka değil, `flexiva`'nın ürünü yok, `seat`/`danfoss` site haritasında yok.
- Breadcrumb JSON-LD hidrasyon uyarısı ve `assertNoUuid` geliştirme 500'ü — ayrı (DILIM 46 yan bulgu).

## 10. Geri alma

İleri düzeltme: yayın öncesi tam eşleme dosyası (eski → yeni, config satırları + 884 model eşlemesi
betikle üretilmiş) commit'lenir; yanlış satır düzeltilir, şema geri alınmaz. Bayrak kapatılırsa
yeni adresler 404 olur ve eski adresler 308'le yeni adrese gider → **bayrak geri alma yolu DEĞİLDİR**;
geri alma yalnız kitlesel hata hâlinde, Recep kararıyla, ters 308 tablosuyla.

## 11. Neyi ölçmedim

GSC'de hangi adreslerin gerçekten dizinde olduğu (search-console erişimi bu oturumda denenmedi) ·
Vercel'in config yönlendirme sayısı sınırı (belgeden doğrulanacak; çözücü yolu bu sınırı zaten
aşmıyor) · EN kategori slug'larının Design EN tablosuyla farkı (yalnız TR karşılaştırıldı).

---


## 12. Bağımsız çürütme (plan-challenger, 2026-09-22) — sonuç: **BLOK**

Denetçi planı yazan bağlamdan ayrı koştu (kod + canlı DB SELECT + curl). Kritik iki iddia yazan şerit
tarafından ayrıca doğrulandı (işaretli ✔). **Plan v2 bu hâliyle uygulanamaz; v3 aşağıdaki
düzeltmelerle yazılacak.**

| # | bulgu | kanıt | derece | v3'te |
|---|---|---|---|---|
| 1 ✔ | Rewrite modeli **sonsuz 308 döngüsü** üretir: iki seviyeli dal rotası içerik üretmiyor, koşulsuz tek seviyeye `permanentRedirect` veriyor; plan tek seviyeyi iki seviyeye 308'liyor. Sayfalar canonical/hreflang/og:url'i `/category/` üzerinden kendileri kuruyor | `[subCategorySlug]/page.tsx:37-46` · `[categorySlug]/page.tsx:129-131,194` | KRİTİK | gerçek rotalar (`app/[lang]/kategori/…`, `app/[lang]/urun/…`) ya da iki seviyeli rota içerik üreten rotaya çevrilir; adres tek `adresUret(nesne, dil)` SSOT'undan; `next start` üstünde "tek hop + döngü yok" e2e |
| 2 ✔ | `?sku=` → 308 sayfada verilemez: ürün sayfası `force-static`, sorgu sunucuya gelmiyor (`?sku=` canlıda cache HIT). Aile desen kuralı eski ürün slug'ını da yakalayıp **2 hop** yapıyor | `products/[slug]/page.tsx:67` · `ProductDetailPageView.tsx` | KRİTİK | `has: query sku` config kuralı; slug metni yanlışsa 308 yerine 200 + doğru canonical; eski ürün slug'ı desen kuralından önce ayrı ele alınır |
| 3 | Yayın **atomik değil**: migration push anında Action'la, Vercel paralel; "aynı gün" sıra değil. Casals slug'ı iki sırada da kırılır; 44 ürün taşınınca yeni dallar eski şemayla doğar; depoda çalışma zamanı bayrağı yok | `supabase-migrate.yml` · webhook `PRODUCT_DISCOVERY_SENSITIVE_FIELDS` · `features.ts` sabit | KRİTİK | eski slug/SKU **takma ad** DB'de; sıra: (1) takma adı okuyan kod (2) veri (3) adres açılışı; "bayrak" = derleme sabiti olarak yazılır |
| 4 | Webhook ISR yolları public adrese bağlanırsa tazeleme kırılabilir; 884 model yolunun tazeleme dalı yok | `api/webhook/supabase/route.ts:130-185` | YÜKSEK | iç yollar korunur; model dalı eklenir; `revalidatePath` ölçülür |
| 5 | Yüzey sayımı eksik: `LanguageSwitcher` (ilk segmenti değiştiriyor → EN'de 404), `ClientLayout.tsx:77`, `MobilAltSekmeCubugu.tsx:128`, `Seo.tsx:52`, PDP'nin `?sku=` yazıcısı, `public/llms.txt`; `Routes` 90 çağrı noktası | dosyalar | YÜKSEK | liste genişler; mevcut `localized-route-ssot` + `canonical-url-ssot` kapıları genişletilir, evrene `public/` girer |
| 6 | `slug_i18n`: `get_family_detail` genişlemeli, tip üretimi, tekillik kiracılı olmalı; `lower(sku)` tekilliği ve `-p-` yasağı DB'de korunmuyor; SKU düzeltilince eski adres 404 | `pg_indexes`, `pg_proc` | YÜKSEK | `unique(tenant_id, lower(sku))` + check; SKU geçmişi |
| 7 | `get_search_suggestions(p_q, p_limit)` dil almıyor, iki dilin adresini üretemez | imza | YÜKSEK | RPC adres değil `sku` + `slug_i18n` + `family_slug` döndürür, adresi istemci kurar |
| 8 | Casals geçişi `products.brand` metin sütununu atlıyor (53 üründe "AVenS" kalır) | SELECT | ORTA | Faz 1'e eklenir |
| 9 | Dilsiz eski kuralın hedefini `/tr/`'ye sabitlemek `next.config`'in kendi yasağını çiğner | dosya yorumu | ORTA | dil eklemesi middleware 307'de kalır |
| 10 | `<html lang>` tek satır değil: çoklu kök layout ya da statikliği kıran `headers()` | `layout.tsx:41` | ORTA | **ayrı kayıt**, bu yayından çıkar |
| 11 | K3-b kendi içinde çelişik: TR listesi `/tr/urun/<aile>` diyor, "sayfa birimi" paragrafı aile adresi "DEĞİŞMEZ" diyor; `/tr/markalar/` K3-b'de yok (yalnız Design v3'te). EN bugün `EN_YAYIN=false` (noindex, site haritası dışı) | karar metni satır 22 | YÜKSEK | **Recep sorusu R2** |

Denetçinin doğruladıkları: 442/442 SKU tekil ve `-p-`'siz · aile–ürün slug çakışması 0 · 47 aile ·
site haritası sayıları · DB'de tek adres üretici · config satırları Vercel sınırına uzak.

**Ölçülmeyen:** rewrite kaynağına `revalidatePath` davranışı · migrate Action ile Vercel build'in
gerçek sırası · GSC dizin durumu.

*Yazan: URUN şeridi, v2 2026-09-22. v3, R1 + R2 cevabı ve yukarıdaki 11 düzeltmeyle yazılır.*
