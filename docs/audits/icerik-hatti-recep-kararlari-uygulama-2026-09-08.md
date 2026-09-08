# Recep'in altı kararı — uygulama ve kanıt (2026-09-08, URUN-KATALOG)

**Niçin:** 2026-09-08 sabahı Recep'e altı karar sunuldu (hepsi canlı veri yazımı, hepsi ölçülmüş
ve hazır, hiçbiri ilerlemiyordu). Recep altısını da tek mesajda cevapladı; bu belge **ne
uygulandığını ve neyle kanıtlandığını** yazar.

**YÖNTEM:** elle (canlı DB + ölçüm). Sapma yok.
**CETVEL:** `category-taxonomy-standard.md` (kategori/aile bağı) · `product-image-standard.md`
(görsel) · `rendering-cache-standard.md` (vitrin doğrulaması).
⛔**Canlı yazım yetkisi:** Recep'in **kendi sözü**, aşağıda lafzıyla. Akran aktarımı onay değildir.

**Recep'in cevabı, lafzıyla:**
> *"1. taşı. 2. het fan kalsıon diğerleri silinsin. 3.bunlar aksiyel fan çatısında olmalı 4.koy
> 5. vortice sitesinden al ve koy. sonra taşınabilir kategoride de olsun. 6. ben de bimiyorum bu
> ürünlerin kaynağı blli değilş mi? ürün koduna göre sana bişey diyemem ürünün adı yok mu avens
> ise kalsın vortice ise zaten ürünler var demektir."*

---

## Uygulanan — beş madde

| # | karar | uygulama | kanıt |
|---|---|---|---|
| 1 | taşı | 7 AVenS ürünü + **aile kaydı** → `fans > duct-fans` | DB 7/7 · **vitrin 5→6 ürün ailesi** |
| 2 | jet fan kalsın, diğerleri silinsin | **7** boş kategori silindi | silinen sorgusu **0** · jet fan kategorisi **2** duruyor |
| 3 | aksiyel fan çatısına | **11** VORTICENT CMS ATEX → `axial-industrial-fans` | DB 11 |
| 4 | koy | NORDIK HVLS görseli 7 ürüne + kategoriye | storage **HTTP 200 · 71210 bayt** · sayfada **7** referans |
| 6 | Vortice ise kalsın | `VRT-16076…16080` = **Vortice CA IL … ES RECT** → dokunulmadı | ailesi vitrinde, erişilebilir |

**Madde 2 — tek netleştirme, güvenli tarafta karar:** Recep tekil *"jet fan"* dedi ama bu adda
**iki** kategori var (`jet-fans`, `parking-jet-fan`). Silme geri dönüşsüz olduğu için **ikisi de
tutuldu**; ikisi de pasif, vitrinde görünmüyor, tutmanın maliyeti yok. Aksi karar tek komutluk iş.

**Silme öncesi bağımlılık kapısı:** yedi kategorinin her biri için ürün **0**, alt kategori **0**,
aile **0** ölçüldü. Ölçmeden silinmedi.

---

## ⛔İKİ HATA — ikisi de aynı turda yakalandı ve onarıldı

### 1. Sayıya güvenip içeriğe bakmamak (madde 3)
`ex-proof-atex-fans` altındaki **"12 ürün"** toplu taşındı. On ikinin biri
**`SEA-810105 PTC SENSOR`** — fan değil, **sensör**. Aksiyel fanlara girmişti; aynı turda geri
alındı, eski yerinde. Gerçek ATEX fanı sayısı **11**.

⭐**Ders:** *sayı eleme ölçütü, içerik karar ölçütüdür.* Bugün ikinci kez aynı sınıf: kategori
sayısına bakıp satırların **adına** bakmadım.

### 2. ⭐"Taşıdım" beyanı vitrinde ölçülünce YARIM çıktı (madde 1)
Madde 1 "bitti" diye raporlandıktan **sonra** canlı vitrin ölçüldü: taşınan 7 ürün kategori
sayfasında **YOKTU**.

**Sebep — bugüne kadar yazılı olmayan yapısal kural:**
> **Kategori vitrini ÜRÜN değil AİLE listeler** (sayfa metni: *"5 ürün ailesi"*).
> `products.subcategory_id` taşımak **yetmez**; `product_families.subcategory_id` de taşınmalıdır.

Aile taşınırken yalnız `category_id` güncellenmişti; `subcategory_id` pasif
`rectangular-duct-fans`'ta kalmıştı → aile listeye hiç girmiyordu.

**Onarım + kanıt:** aile `subcategory_id → duct-fans`; vitrin **5 → 6 ürün ailesi**,
`/tr/products/avens-dikdortgen-kanal-radyal` sayfada, "AVenS" 12 kez. Ölçüm **hiç sorulmamış**
adresle (`?v=<damga>`), `X-Vercel-Cache: MISS`, `Age: 0`.

⛔**CETVELE GİRMESİ GEREKEN:** *ürün taşıma işi İKİ TABLODUR.* Yalnız `products` güncellenirse
veri doğru, **vitrin sessizce yanlış** kalır ve **hiçbir kapı bunu görmez** — "veri değişti,
sayfa değişmedi" deseninin yeni örneği.

---

## ⛔Madde 5 — UYGULANMADI, Recep kapısında

Recep: *"vortice sitesinden al ve koy."* Ölçüldü:

| kaynak | sonuç |
|---|---|
| `vortice.com/.../wall/40320` (E 254 M **ATEX**) | ⛔fotoğraf **YOK** — `fakeImg.png` placeholder + performans eğrisi |
| `vortice.com/.../wall/40303` (E 254 M, **ATEX'siz kardeş**) | ✅gerçek ürün fotoğrafı var |

⭐**Kusurun kaynağı bulundu:** bizdeki 14 ATEX ürününün "görseli" olan performans grafiği tam
olarak Vortice'nin kendi sayfasından geliyor. **Vortice ATEX modelleri için fotoğraf yayınlamıyor.**

Kardeş modelin fotoğrafı, Recep'in `fans` kategorisi için seçtiği **turuncu aksiyel fanın
kendisi** — yani Recep onu zaten "aksiyel fan" temsilcisi olarak onaylamış durumda.

**Karar Recep'te:** kardeş modelin fotoğrafı ATEX ürünlerine konsun mu?
**REC-282'den farkı:** orada ısı geri kazanım cihazı ≠ sulu batarya (tamamen başka ürün);
burada **aynı fan gövdesinin sertifikalı varyantı**. Yine de "bu ürünün fotoğrafı" iddiası
taşıdığı için tek başına karar verilmedi.

Madde 5'in ikinci yarısı (*"sonra taşınabilir kategoride de olsun"*) → REC-212, görsellerin
taşınabilir katalog dışa aktarımına dahil edilmesi; bu belgenin kapsamı dışında.
