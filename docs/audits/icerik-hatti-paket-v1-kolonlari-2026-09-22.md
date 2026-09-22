# Taşınabilir katalog paketi — sözleşme v1'in 8 kolonu + CSV katmanı round-trip (2026-09-22)

**Şerit:** URUN-KATALOG · **İş:** REC-212 · **Karar:** 66 (Recep EVET, OPS hükmü 2026-09-22: K3-b yayın
şartı = 8 kolon + CSV katmanı round-trip sıfır fark; yazma kolu şart değil).
**Cetvel:** `catalog-ingestion-standard.md` (K13 paket ana kaynak, K7 boş hücre beyanı) · kolon kaynağı
DESIGN-KATALOG sözleşme v1 (Linear P-REC-11 yorumları 2026-09-10 07:11Z / 07:43Z / 07:54Z, 09-11 10:46Z).

## 1 · Sekiz kolon — nereden, kaç dolu

Ölçüm: canlıdan dışa aktarım 2026-09-22 (442 ürün), `paket-csv-dogrula.mjs` doluluk satırı.

| kolon | dosya | kaynak | dolu |
|---|---|---|---|
| `alt_metin` | gorseller.csv | `product_images.alt` | **1146 / 1146** |
| `fiyat` | fiyatlar.csv | `product_prices.net_price` (KDV hariç) | **1044 / 1044** |
| `brut_fiyat` | fiyatlar.csv | `product_prices.gross_price` (KDV dahil) | **1044 / 1044** |
| `kdv` | fiyatlar.csv | kaynak fiyat sayfasının beyanı — **kaynak dizininden** | **0 / 1044** |
| `ust_kategori` | urunler.csv | `category_id` → ad | **442 / 442** |
| `alt_kategori` | urunler.csv | `subcategory_id` → ad; yoksa BOŞ (köke düşmez) | **434 / 442** |
| `birim` | teknik-ozellikler.csv | `alan-etiket-sozlugu.json` | **3311 / 5168** |
| `baslik_tr` | teknik-ozellikler.csv | `tr.ts` → `pdp.specs` (müşterinin ürün sayfasında gördüğü ad) | **5119 / 5168** |

Aynı PR'da açılan ek iki kolon: `kaynak_fiyat_eur`, `fiyat_kaynak_sayfa` — ikisi de **0 / 1044**.

⚠`birim` / `baslik_tr`'nin dosyası Design yorumunda açık yazmıyor; "teknik-ozellikler 9+2" sayımından
okundu. Design'a tek soru soruldu (P-REC-11, 2026-09-22 10:29Z).

**Boş kalan üç fiyat kolonu (`kdv` · `kaynak_fiyat_eur` · `fiyat_kaynak_sayfa`) neden boş:** DB'de
karşılıkları yok; kaynak fiyat listesinin kendi sayfasından gelirler. Ingestor CSV'lerinde
`purchase_price_eur` var ama **sayfa numarası ve KDV beyanı yok** (2026-09-22 ölçüldü) — yani bugün
sayfaya bağlanamaz. Fiyatın kaynak eşlemesi ayrı adımdır; uydurma değer yazılmadı (K7).

## 2 · Düzeltilen dört kusur (sözleşme v1 bulguları, 2026-09-10)

| kusur | önce | sonra |
|---|---|---|
| fiyat kaynağı | `f.price ?? f.amount` — iki kolon da YOK → 1044/1044 BOŞ | `net_price` + ayrı `brut_fiyat`; `base_price` kullanılmaz (listeye göre bir satırda KDV dahil, bir satırda hariç) |
| görsel alt metni | pakette yok | `alt_metin` kolonu |
| kategori | tek `kategori` kolonu; alt kademe yoksa KÖKÜ yazıyordu (8 ürün) | `ust_kategori` + `alt_kategori` ayrı |
| marka | `u.brand ?? markaAdi.get(u.brand_id)` — `brand_id` kolonu YOK, dal ölü | yalnız `products.brand` |

## 3 · Bulunan iki ek kusur

1. **Geri yükleyici 13 gündür koşamıyordu.** Dışa aktarıcı 09-09'dan beri tabloları `ham/` altına yazıyor;
   `katalog-geri-yukle.mjs` kökte arıyordu → olduğu gibi koşunca "brands.jsonl EKSİK" deyip duruyordu.
   Düzeltme: önce `ham/`, yoksa kök. Test: dosyayı `ham/` altında bulduğu kilitlendi.
2. **Adım 3 teknik dosyayı sabit başlıkla yeniden yazıyordu.** Üreticiye eklenen `birim`/`baslik_tr`
   `kaynak-eslemesi.mjs --yaz` koşumunda **sessizce silinirdi**. Başlık listeleri tek modüle taşındı
   (`paket-sozlesme.mjs`); üç betik oradan okur.

Ayrıca dışa aktarıcının kapanış satırı "geri yükleyici henüz yok" diyordu (09-07'den beri var) — düzeltildi.

## 4 · Round-trip — iki katman

| katman | araç | evren | sonuç |
|---|---|---|---|
| ham (jsonl ↔ canlı) | `katalog-geri-yukle.mjs` (kuru koşum) | 7 tablo · 2718 satır | aynı 2718 · değişik 0 · yeni 0 · canlıda fazla 0 |
| CSV (CSV ↔ ham) | `paket-csv-dogrula.mjs` (YENİ) | 4 dosya · 7800 satır · **17 522 hücre** | **fark 0** |
| CSV, adım 3'ten sonra | aynı | teknik başlık 11 kolon | fark 0; adım 3 sayıları değişmedi (VAR 2223 · TÜREV 655 · DEĞER YOK 1551 · ÇELİŞİYOR 739) |

**Sabotaj:** aynı ham üzerinde **eski** üreticinin (master 3c82309e5) CSV'leri kapıya verildi → **çıkış 1,
3200'ü aşkın fark** (boş fiyat, eksik `alt_metin`, başlık farkları). Kapı kör değil.

Kapının karşılaştırmadığı kolonlar iki sınıftır ve bilerek dışarıdadır: **türetilmiş** (aile/kategori adı,
dosya adı — okuma kolaylığı, kimlik değil) ve **pakete özgü** (`kdv`, kaynak üçlüsü, `birim`, `baslik_tr` —
DB'de karşılığı yok). Pakete özgü kolonların doluluğu kapının çıktısında her koşumda sayıyla yazılır.

## 5 · PIM (UnoPim) eşlemesi

Pilot CSV (`scripts/pim/unopim.cjs`, REC-357 §3.2): `sku · locale · channel · type · parent ·
variant_structure · attribute_family · status · name · url_key` + teknik `<kod>` / `<kod>(unit)`.
Yerel ayar yalnız `en_US`; `tr_TR` kurulumda kapalı (plan §3.2 madde 3).

| paket kolonu | UnoPim karşılığı | durum |
|---|---|---|
| `sku`, `ad`, `slug` | `sku`, `name`, `url_key` | **ÖLÇÜLDÜ** — pilot 12 ürün fark 0 |
| `alan` + `deger` + `birim` | `<kod>` + `<kod>(unit)` (INV-PIM-UNOPIM-1) | **ÖLÇÜLDÜ** — 22 öznitelik; birim adı eşlemesi (m³/h → `CUBIC_METER_PER_HOUR`) pilot betiğinde |
| `baslik_tr` | öznitelik etiketi `tr_TR` | **DENENMEDİ** — tr_TR kapalı |
| `ust_kategori`, `alt_kategori` | ürün kategori sütunu | **DENENMEDİ** — ALTYAPI'ya soruldu |
| `fiyat`, `brut_fiyat` | fiyat tipi öznitelik | **DENENMEDİ** — ALTYAPI'ya soruldu |
| `alt_metin` | görsel özniteliğinin alt metni / ayrı metin özniteliği | **DENENMEDİ** — ALTYAPI'ya soruldu |
| `kdv`, `kaynak_fiyat_eur`, `fiyat_kaynak_sayfa`, kaynak üçlüsü | karşılığı yok (paket = kaynak kaydı) | pakete özgü |

**Hüküm (OPS'a iletildi):** kolon adları değişmedi; PIM geçerse paket → UnoPim dönüşümü bu tabloya göre
yazılır. Denenmemiş satırlar ALTYAPI ölçümüyle güncellenir.

## 6 · Açık kalan

- `kdv` · `kaynak_fiyat_eur` · `fiyat_kaynak_sayfa` doldurma = fiyatın kaynak eşlemesi (ayrı adım).
- Yazma kolu (upsert / sil-yaz, `tenant_id` eşleme) = karar 36 ile birlikte Recep'e (OPS hükmü); PIM geçerse
  yazma yönü PIM köprüsü olur, iki yazıcı olmaz.
- Görsel DOSYALARI bu ölçümde indirilmedi (`--gorsel-atla`); görsel bağı (1146 satır) ölçüldü.
