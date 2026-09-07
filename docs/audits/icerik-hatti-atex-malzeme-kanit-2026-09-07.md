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
