# ATEX malzeme bilgisi — kanıt ölçümü

**Damga:** 2026-09-07 · **Şerit:** URUN-KATALOG · **Kayıt:** REC-95 / REC-172
**Yöntem:** elle (tek oturum, salt okuma) — canlı DB + kaynak dizini (58 belge / 2127 sayfa)

## Soruyu doğuran cümle

Recep, 2026-09-07:

> "atex sertifikası var ise kıvılcım önleyen sürtünmenin olabileceği alanlarda bakır gibi
> daha yumuşak malzeme kullanılmış demektir."

Soru: bu bilgi ürün kaydına bir **alan** olarak girer mi, girerse hangi ürünlere ve **hangi kaynağa** dayanarak?

## Ölçüm 1 — canlıda bugün ne var

375 ürün (kesin sayı ile doğrulandı), alan `products.technical_specs` (JSONB).

| Alan | Tüm ürün | Adında ATEX geçen (41) |
|---|---|---|
| `atex_marking` | 20 | 20 |
| `atex_zone` | 19 | 19 |
| `impeller_material` | **0** | 0 |
| `motor_protection` | **0** | 0 |
| `material` / `housing_material` | **0** | 0 |

**Malzeme bilgisi canlıda sıfır** — hiçbir üründe, ATEX'li ya da değil.

Adında ATEX geçip hiçbir ATEX alanı olmayan **2** ürün (bilinen açık, REC-172):
`SEA-51201003` (SEAT 20 ATEX) · `SEA-61183003` (STORM 18 ATEX).

## Ölçüm 2 — kaynakta ne yazıyor (aile aile)

41 ATEX ürünü dört aileye dağılmış. Her ailenin kaynak sayfalarında malzeme ifadesi arandı:

| Aile | Ürün | Kaynakta malzeme ifadesi | Kıvılcım/bakır ifadesi |
|---|---|---|---|
| `vortice-vort-e-atex` | 14 | **var** — "Aluminium made hubs. Stamped steel motor cover." (E_ATEX_Range s.6) | **yok** |
| `seat-serisi` | 13 | **var** — "Polipropilen gövde yapısı" (AvensAir 2026 s.41) | **yok** |
| `storm-serisi` | 7 | **var** — "Polipropilen gövde yapısı" (AvensAir 2026 s.42) | **yok** |
| `jet-serisi` | 7 | **YOK** (0 sayfa) | yok |

## Bulgu — Recep'in cümlesi kaynakta AYNEN var, ama başka bir ailede

AvensAir 2026 fiyat listesi **s.39, "CMS ATEX SANTRİFÜJ FANLAR"**:

> "Çelik sactan, tamamen birleştirilmiş veya kaynaklı gövde. Alüminyum sacdan yapılmış öne
> eğik pervane. **Bakır veya alüminyumdan yapılmış, kıvılcım önleyici giriş halkası**"

İngilizce karşılığı üç Nicotra-Gebhardt kataloğunda da geçiyor:
> "Inlet cone of copper or aluminium prevent the production of sparks during operation."

İki nokta:

1. **Kıvılcım önleyen parça pervane değil, GİRİŞ HALKASI** (inlet cone). Pervane alüminyum sac.
2. **Bu cümlenin ait olduğu 11 model katalogumuzda YOK.** Ölçüldü: adında `CMS` 0 ürün ·
   adında `VORTICENT` 0 ürün · SKU'su `253` ile başlayan 0 ürün.

Yani ilke doğru, kaynağı da var — ama **satmadığımız bir aileyi** tarif ediyor. Bizim 41 ATEX
ürünümüzün hiçbirinin kaynağında "kıvılcım önleyici / bakır" ifadesi geçmiyor.

## Hüküm — yeni alan AÇMIYORUZ, mevcut alanı ÇÖZÜYORUZ

Kıvılcım koruması zaten **ATEX işaretinin içinde kodlu**. AvensAir s.38 kod şemasını veriyor:

| Kod | Anlamı |
|---|---|
| `ec` | **kıvılcım çıkarmayan** |
| `eb` | gelişmiş koruma |
| `db` | aleve dayanıklı |
| `Ex h` | elektriksel olmayan ekipman koruması |
| `IIA/IIB/IIC` | gaz grubu (propan / etilen / hidrojen) |
| `Ga/Gb/Gc` | ekipman koruma sınıfı |

Yani `atex_marking` alanı (20 üründe dolu) bilgiyi **zaten taşıyor**; müşteri onu okuyamıyor.
`impeller_material` gibi bir alan açmak, kaynağı olmayan 41 satır uydurmak olurdu (K7 ihlali) —
kaynak yalnız hub/gövde malzemesini söylüyor, kıvılcım korumasını söylemiyor.

**Yapılacak iş budur:** ATEX işaret kodunu ürün sayfasında **çözen bir gösterim** (kod → anlam),
kaynağı AvensAir 2026 s.38 tablosu. Veri yazımı değil, sunum işi → ÜRÜN şeridinin konusu.

## Recep'e giden iki soru

1. **CMS ATEX santrifüj** ailesi (11 model, AvensAir listesinde fiyatlı) satılıyor mu?
   Katalogda hiç yok. — park jeti sorusuyla aynı sınıf.
2. `jet-serisi` (7 ürün) için elimizde **hiç malzeme kaynağı yok**. Tedarikçiden mi istenecek,
   yoksa aile metninde malzeme cümlesi hiç geçmeyecek mi?

## Sınırı — dürüstçe

* Ölçüm **kaynak dizininin** kapsamıdır (58 belge). Dizinde olmayan bir belgede malzeme yazıyor
  olabilir; bu ölçüm "kaynakta yok" değil, **"dizinde yok"** der.
* Ürün↔kaynak eşlemesi aile ve model adı üzerinden yapıldı, SKU üzerinden değil — bir ailenin
  sayfası bulunduğunda o ailenin tüm ürünlerine sayıldı.

---

## ⛔ DÜZELTME — "jet-serisi: malzeme kaynağı YOK" iddiası YANLIŞTI (aynı gün, 19:xxZ)

Yukarıdaki tabloda `jet-serisi` için **"kaynakta malzeme ifadesi YOK (0 sayfa)"** yazmıştım.
**Bu yanlış.** JET serisi, dört ailenin **en ayrıntılı malzeme kaydına sahip** olanıdır.

### Niçin kaçırdım — ölçütün kendisi dardı

İlk tarama şu kelimeleri aradı: *kıvılcım, spark, bakır, copper, alüminyum, alumini, pervane,
impeller material, polipropilen, polypropylene, gövde, malzeme*. Kaynak metin ise malzemeyi
**başka kelimelerle** yazıyor: `Housings:` · `Wheels:` · `PPH` · `stainless steel`.

Yani "0 sayfa" sonucu kaynağın değil, **sözlüğümün** ölçüsüydü. Yokluğu kanıtlamak varlığı
kanıtlamaktan zordur; dar bir sözlükle "yok" demek, ölçüm değil **varsayımdır**.

### Gerçek kayıt — `JET.pdf` s.1 ve `SEAT-CATALOGUE.pdf` s.20 (aynı metin)

> **Housings:** PP Single back strong high density UV treated and recyclable polypropylene
> (PPH) with no air leakage. All fan mounting hardware in **stainless steel**.
> **Wheels:** PP Forward curved centrifugal type impeller made of **injection molded PPH**.

Ayrıca `SEAT-CATALOGUE.pdf` s.4 (marka tarihçesi): *"1995: SEAT adds the **JET Series** inline
fans to its range of **PP fans**."* — JET, PP ailesinin parçası olarak doğmuş.

### Düzeltilmiş aile tablosu

| Aile | Ürün | Kaynakta malzeme |
|---|---|---|
| `vortice-vort-e-atex` | 14 | alüminyum göbek (hub), preslenmiş çelik motor kapağı |
| `seat-serisi` | 13 | polipropilen gövde |
| `storm-serisi` | 7 | polipropilen gövde |
| `jet-serisi` | 7 | **PPH gövde (UV işlemli, geri dönüştürülebilir) · paslanmaz çelik montaj donanımı · enjeksiyon kalıplı PPH pervane** |

**Dördünün de malzeme kaynağı var.** Eksik olan tek şey, bu bilginin ürün kaydına ve vitrine
hiç taşınmamış olması (`material` / `housing_material` alanları **0/375**).

### Değişmeyen hüküm

Kıvılcım/bakır cümlesi hâlâ yalnız **CMS ATEX santrifüj** ailesine ait ve o aile katalogda yok
(→ REC-226, 74 kayıp kalemin 11'i). Bu düzeltme malzeme **kapsamasını** genişletir, ATEX
kıvılcım hükmünü değiştirmez.

### Ders (kendi payıma, bugün üçüncü kez aynı sınıf)

Bir şeyin "yok" olduğunu ilan etmeden önce, **aramada kullandığım kelimelerin kaynağın
kelimeleri olup olmadığını** sormalıyım. Bugün Recep'e sorulmaması gereken bir soru sordum
("jet için malzeme kaynağı tedarikçiden istensin mi") — cevabı elimizdeki belgede duruyordu.
