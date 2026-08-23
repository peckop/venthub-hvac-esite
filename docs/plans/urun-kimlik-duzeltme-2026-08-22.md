# Kimlik Düzeltme Planı — yanlış kolondan doldurulmuş `model_code` / `name`

> ÜRÜN şeridi · 2026-08-22 · **karar bekliyor (Recep)** · prod yazımı içerir
> Cetvel: `docs/standards/product-schema-standard.md` (§11.5 model katmanı) +
> `docs/standards/catalog-ingestion-standard.md`. Bu plan **yeni bir cetvel yazmıyor**;
> mevcut kimlik alanlarının kaynağa uygunluğunu düzeltiyor.

## 1. Bulgu

İki markada, **aynı sınıf** bir ingestion kusuru ölçüldü: kimlik alanlarına kaynak
tablonun **yanlış sütunu** yazılmış.

### 1a. AVenS — 6 ürün (sistemik, tek desen)

Kaynak: AVenS 2026 Ürün Fiyat Kataloğu, **s.69 "SULU BATARYALAR"** tablosu.
Sütun düzeni: `KOD | MODEL | DEBİ | ISITICI GÜCÜ (Kcal/h) | UYGUN MODEL | FİYAT`

| Şu anki `sku` | Şu anki `model_code` | Şu anki `name` | Gerçek `KOD` | Gerçek ürün adı |
|---|---|---|---|---|
| AVE-11300 | 11300 | "AvenS 1500" | **13052** | SULU BATARYA 11 KW KANAL TİPİ |
| AVE-20700 | 20700 | "AvenS 2000" | **13053** | SULU BATARYA 14 KW KANAL TİPİ |
| AVE-33000 | 33000 | "AvenS 3000" | **13054** | SULU BATARYA 20 KW KANAL TİPİ |
| AVE-37400 | 37400 | "AvenS 4000" | **13055** | SULU BATARYA 28 KW KANAL TİPİ |
| AVE-42500 | 42500 | "AvenS 5000" | **13056** | SULU BATARYA 36 KW KANAL TİPİ |
| AVE-47300 | 47300 | "AvenS 5000" | **13057** | SULU BATARYA 40 KW KANAL TİPİ |

Ne olmuş: `model_code`'a **ısıtıcı gücü (Kcal/h)** değeri, `name`'e **uygun model**
(ürünün takılacağı ısı geri kazanım cihazının adı) yazılmış. Yani bugün vitrinde
"AvenS 5000" adıyla **iki ayrı ürün** duruyor ve ikisi de aslında sulu batarya.

Aynı tablonun ilk iki satırı (`13050`, `13051`) **doğru** eşleşmiş — yani kusur
tablonun tamamında değil, 8 satırın 6'sında.

### 1b. Danfoss — 1 ürün (kimlik çelişkisi, farklı sınıf)

`DAN-80101` · `name` = "FC-51 - 220V - 0,37kW Frekans İnventörü" · aile = `danfoss-fc101`.

Çelişkinin kanıtı:
- Danfoss **FC-51** ayrı bir seridir (genel amaçlı), FC-101 ise HVAC'a özeldir.
- FC-101 hattı **3×380-480 V**'tur; üründe "220 V" yazıyor.
- FC-101'in 0,37 kW modeli föyde **`PK37`** drive kodunu taşır, "FC-51" değil.

Bu **veri değil kimlik** sorusudur: ya `name` yanlış (ürün gerçekte FC-101'dir), ya da
ürün **yanlış aileye bağlı** (gerçekten FC-51'dir). İkisi farklı düzeltme gerektirir ve
kaynaktan tek başına çözülemez — satıcı tarafı bilgisi gerekir. Bu yüzden bu üründe
teknik veri de **yazılmadı** (33/34 yazıldı, bu boş bırakıldı).

## 2. Etki analizi (canlı DB'de ölçüldü, 2026-08-22)

| Ölçüm | Sonuç | Anlamı |
|---|---|---|
| 7 ürünün `venthub_order_items.product_sku` satırı | **0** | Hiçbiri sipariş edilmemiş |
| Aynı ürünlerin `product_sku_snapshot` satırı | **0** | Sipariş geçmişinde iz yok |
| `products`'a FK ile bağlı tablo sayısı | **12** | Hepsi `product_id` kullanıyor — SKU metnine bağlı değil |
| `?sku=` parametresi | canonical'a **girmiyor**, sitemap'e **girmiyor** | SEO etkisi yok; yalnız paylaşılmış/yer imi linkler |
| Ham SKU müşteriye gösteriliyor mu | **hayır** — varyant etiketi `model_code` | `model_code` değişimi **görünür**, `sku` değişimi görünmez |

### ⭐Ölçülen değişmez: `sku = <MARKA>-<model_code>`

| Marka | Kurala uyan | Toplam |
|---|---|---|
| AVenS | **51** | 51 |
| Danfoss | **34** | 34 |

Bu ilişki şu an **istisnasız** tutuyor. Dolayısıyla `model_code`'u düzeltip `sku`'yu
bırakmak, bugün geçerli olan bir değişmezi **kırar** (51/51 → 45/51). İki alan birlikte
hareket etmelidir — ya da değişmez bilinçli olarak terk edilmelidir.

## 3. Seçenekler

### A) Tam düzeltme — `sku` + `model_code` + `name` birlikte (ÖNERİLEN)
`AVE-42500` → `AVE-13056`, `model_code` 42500 → 13056, `name` → gerçek ürün adı.
- **Artı:** kimlik kaynakla birebir olur, değişmez korunur, iki ürünün aynı adı taşıması
  (`dup-name` taban satırı) **kaynağında** çözülür — taban satırı silinir, ratchet küçülür.
- **Eksi:** SKU metni değişir. Ölçüm bunun bugün kimseyi etkilemediğini gösteriyor
  (0 sipariş, FK'lar id tabanlı), ama **dış sistemlerde** (muhasebe, tedarikçi yazışması,
  basılı teklif) bu SKU'lar geçiyorsa orada karşılığı elle güncellenmelidir — bunu DB
  ölçemez, **Recep bilir.**

### B) Kısmi düzeltme — yalnız `name`
Yalnız görünen ad düzeltilir; `sku`/`model_code` bırakılır.
- **Artı:** en düşük risk; vitrindeki en görünür yanlış (iki ürünün "AvenS 5000" olması) biter.
- **Eksi:** `model_code` yanlış kalır ve o **müşteriye varyant etiketi olarak gösteriliyor**.
  Yani "düzelttik" denir ama yanlış kimlik ekranda kalmaya devam eder.

### C) Dokunma — denetim kalemi olarak beklet
- **Artı:** sıfır risk.
- **Eksi:** `dup-name` taban satırı kalıcılaşır; katalog büyüdükçe aynı desenin başka
  örnekleri bu satırın altına saklanabilir.

**Danfoss `DAN-80101` her üç seçenekte de ayrı kalır** — çözümü kaynakta değil, satıcı
bilgisindedir. Önerilen: Recep'e tek soru → "bu ürün gerçekte FC-51 mi FC-101 mi?"

## 4. Uygulama (A seçilirse)

1. Betik: `scripts/db/product-data/identity-fix.mjs` — `content-write.mjs` kalıbında.
   Dry-run varsayılan · **envanter önce** · `--rollback` · fail-closed ön koşullar.
2. **Ön koşullar (yazımdan önce, biri bile düşerse hiç yazmaz):**
   - Hedef `sku` değerleri DB'de **kullanılmıyor** olmalı (çakışma yok).
   - Her hedef satırın `venthub_order_items` sayısı **0** olmalı — ölçüm bayatlamış olabilir,
     yazım anında **yeniden** ölçülür.
   - Yazımdan sonra `sku = <MARKA>-<model_code>` değişmezi **51/51** kalmalı; bozulursa
     betik kendi yazdığını geri alır.
3. Yazım sonrası: `catalog-integrity` taban satırından `dup-name:AVenS...|AvenS 5000`
   **silinir** (ratchet yalnız küçülür kuralına uygun).
4. Kanıt: canlı sayfada varyant etiketinin yeni `model_code`'u göstermesi + eski `?sku=`
   linkinin davranışının ölçülmesi (404 mü, ilk varyanta mı düşüyor).

## 5. Açık soru — eski `?sku=` linkleri

SKU değişince `?sku=AVE-42500` taşıyan eski bir link ne yapmalı?
- Bugünkü davranış (ölçülmedi): parametre eşleşmezse muhtemelen **ilk varyant** seçilir.
- Sessizce yanlış varyantı göstermek, bulunamadı demekten kötüdür.
Bu, A seçilirse **uygulamadan önce ölçülecek** ve gerekiyorsa ayrı bir kalem açılacaktır.
