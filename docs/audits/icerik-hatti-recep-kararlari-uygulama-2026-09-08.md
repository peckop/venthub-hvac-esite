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

---

## ⭐EK — KAPI İLK KOŞUŞUNDA İKİNCİ YARIM TAŞIMAYI YAKALADI

OPS emriyle (`category-taxonomy-standard §8`) ayrışma ölçümü kuruldu:

```sql
select count(*) from products p join product_families f on f.id = p.family_id
where f.deleted_at is null
  and (p.subcategory_id is distinct from f.subcategory_id
    or p.category_id   is distinct from f.category_id);
```

**İlk koşum: 0 değil, `11`.** On birinin hepsi **az önce "taşındı" diye raporladığım**
VORTICENT CMS ATEX ürünleriydi — ailesi (`vortice-vorticent-cms-atex`) hâlâ pasif
`ex-proof-atex-fans` altındaydı. **Madde 3 de madde 1 ile aynı sebeple yarım kalmış.**

| adım | ölçüm |
|---|---|
| önce | **11** ayrışan satır |
| onarım | aile → `fans > axial-industrial-fans` |
| sonra | **0** |
| vitrin | `aksiyel-sanayi-fanlari` **3 ürün ailesi**, VORTICENT sayfada |

⭐**Kaydedilmeye değer:** kapı, kurulduğu günün ilk koşumunda **kendi yazarının** hatasını buldu.
Vitrin ölçümü olmasaydı madde 1, SQL ölçümü olmasaydı madde 3 sessizce yarım kalacaktı — ve
ikisi de "bitti" diye raporlanmıştı.

## ⛔YENİ AÇIK KONU — Recep'e sorulacak (madde 3'ün yan bulgusu)

Aile kaydının tam adı: **"Vortice VORTICENT CMS ATEX *Santrifüj* Fanlar."**
Recep'in emri *"bunlar aksiyel fan çatısında olmalı"* idi ve uygulandı — ama ürünün kendi adı
**santrifüj** diyor. Santrifüj ve aksiyel **farklı fan tipleridir**.

Emir uygulandı (Recep kararı ezer), fakat bu bir **teknik çelişki** ve kayda geçirilir:
ya aile adı yanlış, ya hedef kategori. Karar Recep'in; ölçüm ve soru burada durur.

---

## ✅MADDE 5 KAPANDI — 25 ürüne gerçek fotoğraf (Recep adres verdi)

**Karar sorusu geri geldi, ama cevap "evet/hayır" değil KAYNAK oldu.** Recep üç adres iletti ve
"kaynak yok" hükmümün yanlış olduğunu gösterdi.

| küme | ürün | kaynak | görsel |
|---|---|---|---|
| Vortice E … ATEX | **14** | `climavents.com.tr` (TR bayi) | Ex etiketli siyah duvar fanı, 840×630 |
| VORTICENT CMS ATEX | **11** | `avensair.com` → orijinali `fanselectionpro.vortice.com` (S3) | mavi santrifüj gövde, 230×230 |

**Mevcut performans grafikleri SİLİNMEDİ**, `sort_order` bir sıra itildi — fotoğraf öne geçti,
grafik teknik bilgi olarak kaldı. Kanıt: E ATEX ürün sayfasında `foto.webp` **51** kez,
VORTICENT sayfasında **42**, aksiyel kategori kartlarında **4**.

**VORTICENT çözünürlüğü:** bayideki 230×230'un orijinali arandı ve bulundu — Vortice'nin kendi
seçim aracındaki dosya da **230×230**. Yani sınır bizde değil kaynakta; ürün kartı 166px
olduğundan yeterli, detay sayfasında sınırlı.

### ⛔BUGÜNÜN YEDİNCİ HATASI — "kaynak yok" hükmünü DAR EVRENDE verdim
Aramayı `site:vortice.com` ile **kısıtladım**. Üreticinin sayfasında fotoğraf yoktu ve
**"kaynak yok, karar Recep'te"** dedim. Recep saniyeler içinde iki TR bayi adresi buldu.

⭐**Sebep, adıyla:** üreticinin kurumsal sitesi ürünü **satmaz**, katalog yayınlar — ATEX gibi
niş seride fotoğraf koymayabilir. **Ürünü satan bayi koymak ZORUNDA**, çünkü müşteri görmeden
almaz. Fotoğrafın en olası yeri üretici değil **satıcıdır**.

**Kural (hafızaya da yazıldı):** görsel/belge ararken `site:` kısıtı KOYULMAZ; sırayla üretici →
**TR distribütör/bayi** (`climavents.com.tr`, `avensair.com`) → üreticinin **seçim/konfigüratör
aracı** → katalog PDF'i. **En az iki bayi araması yapılmadan "kaynak yok" beyan edilmez.**
Bu, `yoklugu-kanitlamak-varligi-kanitlamaktan-zordur` dersinin aynısı: yokluk, aradığım **dar
evrenin** yokluğuydu.

⚠**Aynı hükmü AVenS için de vermiştim** (78 ürün "kaynak yok"). O ölçüm de dar evrende yapıldı
(katalog PDF'i + avensair.com); TR bayi taraması yapılmadı → **yeniden ölçülmeli**, bu belge
onu açık borç olarak kaydeder.

## ⛔SANTRİFÜJ/AKSİYEL — üç bağımsız kaynak SANTRİFÜJ diyor
| kaynak | ifade |
|---|---|
| `fanselectionpro.vortice.com` | *"centrifugal medium pressure ATEX fan"* |
| `avensair.com` | *"santrifüj çark"* |
| ürün fotoğrafı | salyangoz gövde = santrifüj |
| bizim aile adımız | *"VORTICENT CMS ATEX **Santrifüj** Fanlar"* |

Recep emri *"aksiyel fan çatısında olmalı"* uygulandı ve 11 ürün `axial-industrial-fans`'ta.
**Teknik olarak yanlış raf.** Karar Recep'te: aksiyelde mi kalsın, santrifüj/radyal tarafa mı taşınsın.
