# İçerik hattı — kategori rehber paragrafları ÖNCESİ ölçüm (REC-146 madde 3)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06 · **Durum:** ölçüm; hiçbir şey yazılmadı.

## KAYNAK / CETVEL

* `docs/standards/rendering-cache-standard.md` — statik vitrinde görünen her tablonun tazeleme dalı olmalı.
* Kararlar — Vitrin 15A **K8** (kategori üç mod) · **K1** (fiyat/vaat yok) · **K7** (kaynak yoksa satır yok).
* `CLAUDE.md` **kural 7** — DB çevirileri JSONB (`metadata->>lang`); kullanıcıya görünen metin dile bağlı.
* İş emri REC-146 madde 3: *"7 kategori × 1 paragraf … → `categories.description`;
  `display_mode` (series/showcase/landing) ↔ 15A üç mod eşlemesi yazılır."*

---

## 1 · Emrin "7 kategori"si BUGÜN karşılıksız — evren değişmiş

Emir 2026-09-05'te açıldı ve "7 kategori" dedi. Bugün canlıdan ölçtüm:

| Ölçüm | Sayı |
|---|---|
| Toplam kategori | **37** |
| `description` dolu olan | **0** |
| `authority_content` dolu olan | **0** |
| Üst seviye kategori | 13 |
| Alt kategori | 24 |
| **Doğrudan ürünü olan kategori** | **6** |

Doğrudan ürünü olan altı kategori:

| Kategori | slug | Ürün |
|---|---|---|
| Fanlar | `fans` | **295** |
| Kontrol Sistemleri | `control-systems` | 37 |
| İklimlendirme ve Hava Şartlandırma | `air-treatment` | 17 |
| Isı Geri Kazanım (VMC) | `heat-recovery-vmc` | 16 |
| Hava Perdeleri | `air-curtains` | 8 |
| Aksesuarlar | `accessories` | 2 |

**Yani "7" değil 6.** Emirdeki sayı bir öncül; ölçüm onu çürüttü. Sayıyı emirden değil
ölçümden alıyorum — aksi hâlde yedinci paragrafı hangi kategoriye yazacağımı **uydurmam**
gerekirdi.

## 2 · İki yapısal bulgu (ikisi de benim şeridimin dışında, ikisi de kayıtta — K7.5)

### 2.1 · Yedi üst kategori İNGİLİZCE adlı ve SIFIR ürünlü

`Air Conditioning` · `Commercial Ventilation` · `Electric Heating` · `Hygiene and Sanitizer`
· `Residential Ventilation` · `Smart Home` · `Summer Ventilation`

Hepsi üst seviye, hepsinin ürün sayısı 0, hepsinin adı İngilizce. Türkçe vitrinde
İngilizce kategori adı görünüyorsa bu bir i18n kusurudur (kural 7). **ÜRÜN şeridinin
alanı** (`kategori-adi-*` konformans testleri orada); ölçümü bildiriyorum, dokunmuyorum.

### 2.2 · ~~24 alt kategorinin hiçbirinde ürün yok~~ — **BU İDDİA YANLIŞTI, DÜZELTİLDİ**

İlk yazdığım hâli: *"24 alt kategorinin hiçbirinde doğrudan ürün yok."* **Yanlış.**
ÜRÜN şeridi ölçüp çürüttü, ben de kendim yeniden ölçüp doğruladım.

**Sebep ölçüt değil EVREN:** ürün ↔ kategori bağı **iki sütunla** kurulur —
`products.category_id` **ve** `products.subcategory_id`. Ben yalnız birincisine baktım;
o sütunda alt kategoriler gerçekten 0 çıkıyor. İkincisiyle ölçünce:

| Ölçüm (`subcategory_id` ile) | Sayı |
|---|---|
| Ürünü olan alt kategori | **17 / 24** |
| Alt kategoriye bağlı ürün | **365** |

Yani "24 boş sayfa" diye bir sorun **yok**; alt kategori ağacı çalışıyor.
→ [[olcut-keskin-ama-evren-yanlis]] — ölçüt keskindi, evren eksikti; keskin bir ölçüt
yanlış evrende **kendinden emin bir yanlış** üretir.

**Bunun kapsama etkisi (yeni soru):** alt kategoriler gerçekten dolu olduğuna göre, rehber
paragrafı yalnız 6 üst kategoriye mi yazılacak, yoksa ürünü olan 17 alt kategoriye de mi?
**6 → 23.** Bu bir kapsam kararıdır, tek başıma büyütmem; OPS/Recep'e sordum.

## 3 · ⛔ ASIL ENGEL: kategori açıklamasının BUGÜN i18n yolu YOK

Şema ölçümü:

```
categories.description        text      NULL yok, varsayilan yok   ← JSONB DEGIL
categories.metadata           jsonb     varsayilan '{}'
categories.authority_content  jsonb     NULL
categories.display_mode       text      varsayilan 'series'
```

Kod ölçümü — `src/utils/categoryHelpers.ts:143` `getCategoryDescription()`:

```ts
const meta = category.metadata
if (meta?.hero_description) return meta.hero_description as string
return category.description || ''
```

**İkisi de dile bakmıyor.** Ürün ailelerinde `description` jsonb `{tr,en}` iken kategoride
düz metin. Sonuç: TR paragrafı `description`'a yazarsak **İngilizce vitrinde de Türkçe
görünür**. Bu, kural 7'nin doğrudan ihlali ve düzeltmesi benim şeridimde değil.

**HÜKÜM (benim, ölçüme dayalı):** kategori paragrafı, i18n yolu açılmadan DB'ye
**yazılmaz**. Taslak yazılır, bekletilir. Önerilen yol — kararı ÜRÜN + Recep verir:

* **(a)** `metadata.description_i18n = {tr, en}` + `getCategoryDescription(category, lang)`
  — aile tarafındaki kalıbın aynısı, yeni sütun gerekmez, migration gerekmez.
* **(b)** `description` sütununu jsonb'ye çevirmek — migration demek, prod'a otomatik iner
  (kural 13), ve `description`'ı okuyan **yedi** ayrı yer var. Daha pahalı.

Önerim **(a)**: migration yok, mevcut `metadata` alanı zaten jsonb ve varsayılanı `'{}'`.

## 4 · Rehber paragrafının kaynağı, ürün metninden FARKLI bir sorun

Aile metinlerinde kaynak katalog PDF'iydi ve kapı sayıyı sayfada arıyordu. Rehber paragrafı
ise *seçim tavsiyesi* — emir "kaç hava değişimi, gürültü/yerleşim, seçiciye bağlantı" diyor.
**"Kaç hava değişimi" bir NORMDUR**, katalogda yazmaz; TS/EN veya ASHRAE gibi bir kaynağa
dayanmalıdır. Elimizde böyle bir kaynak **yok** (24 PDF üretici kataloğu).

**HÜKÜM:** ilk sürüm rehber paragrafları **sayısal norm iddiası taşımaz**. Ne yapar:
kategorinin ne işe yaradığını, hangi soruların ürünü belirlediğini (yerleşim, gürültü,
kanal/duvar/çatı, tek oda/merkezi) ve seçiciye/ilgili ailelere yönlendirmeyi anlatır.
Hava değişim sayısı gerekiyorsa **normatif kaynak temini ayrı bir iştir** — Recep'e sorulur.
Uydurma sayı, kapının ölçemeyeceği yerde en tehlikeli hâlini alır: kaynağı olmadığı için
kırmızı bile vermez.

## 5 · `display_mode` ↔ 15A üç mod eşlemesi (emrin ikinci teslimatı)

Bugün **37 kategorinin hepsi varsayılan `series`** (sütun varsayılanı `'series'`).
15A'nın üç modu (series / showcase / landing) hiçbir kategoriye bilinçli atanmamış.
Eşleme yazılmadan paragraf yazmak eksik iş olur: landing modundaki kategori paragrafı
başka yerde, başka uzunlukta görünür.

Bu eşleme **veri kararıdır** (hangi kategori hangi modda) ve vitrin görünümünü değiştirir
→ Recep'e tek başına sorulacak yapısal karar sınıfına girer.

## 6 · Bu ölçümün kapatmadığı

* **Kapsam:** paragraf 6 üst kategoriye mi, ürünü olan 17 alt kategoriye de mi (6 → 23)?
* 7 boş İngilizce kategori vitrinde görünüyor mu, silinecek mi (Recep kararı).
* `authority_content` neyi besliyor — 37/37 boş, hiç kullanılmamış olabilir.

## 7 · Sıradaki adım

1. Bu ölçüm panoya + Recep'e gider (i18n engeli ve "7 değil 6" düzeltmesi dahil).
2. i18n yolu kararı çıkana kadar **6 kategori taslağı** yazılır, DB'ye yazılmaz.
3. `display_mode` eşlemesi Recep kararı olarak ayrı sorulur.
