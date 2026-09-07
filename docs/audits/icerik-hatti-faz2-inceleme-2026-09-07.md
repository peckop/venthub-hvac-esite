# REC-172 Faz 2 — KATALOG incelemesi (ikinci göz)

**Tarih/damga (ölçüldü, `date -u`):** 2026-09-07T07:1xZ · **Şerit:** URUN-KATALOG (sid 3a7976a1)
**İncelenen:** `docs/audits/rec172-faz2-sonuc-2026-09-06.md` (OPS, dal `ops/rec172-faz2`) +
ingestor `staging/teknik-*-2026-09-06.csv` (16 dosya, 764 satır)
**YÖNTEM:** elle ölçüm — kaynak PDF'leri yeniden açarak (pymupdf), cetveli okuyarak, canlı DB'yi
sorgulayarak. Faz 2 doğrulama ajanının çıktısına **bakılmadı**; ikinci göz birinci gözün raporuna
değil **kaynağa** bakar. Cetvel: `docs/standards/product-schema-standard.md`, `catalog-ingestion-standard.md`.
**Canlıya yazım:** YOK ve bu incelemeyle açılmadı (§7 kapısı hâlâ kapalı).

## 0. Hüküm

Faz 2 çıktısı **denetimi geçti**: örneklediğim satırların hepsi kaynakta gerçekten var, çürütme
gerekçelerinin ikisini bağımsız olarak doğruladım, uydurma değer bulamadım. **Ama iki düzeltme
var** (§3, §4) ve biri OPS'un "doğrudan alınabilir" dediği KABUL dosyasını etkiliyor.

## 1. DD (hüküm KABUL) — örnekleme, 12/12 kaynakta doğrulandı

"Kabul" damgası otomatik geçiş değildir; kabul edilen küme de sınanır. 81 satırdan tohum 11 ile
12 satır örnekledim, `493-series-dd.pdf`'i **yeniden açıp** değerin verilen sayfada geçtiğini ölçtüm.

```
12/12 GECTI  (weight_kg, rpm_max, motor_poles, insulation_class, max_absorbed_power_w,
              ip_rating, phase · NIC-11902/11911/11916/11920/11921 · s.19/35/47)
```

**İkinci kat ölçüt — "değer sayfada geçiyor" tek başına ZAYIF.** Katalog sayfası bir tablodur ve
her sütun başka bir motordur; değerin sayfada bulunması onun *o ürüne* ait olduğunu kanıtlamaz.
(Aynı sebeple kendi kanıt tablomda 287 satırı "yabancı kaynakta geçen" diye kanıt saymıyorum.)
Bu yüzden alıntının işaret ettiği **sütun etiketiyle** (M922/M9G4/M955…) bağladım:

```
11/12 SUTUN-VAR   (etiket sayfada + değer etiketin 1–9 satır komşuluğunda)
 1/12 SUTUN-YOK   -> NIC-11921 phase=3
```

⚠**Tek "eksik" benim ölçütümün kusuruydu, satırın değil:** kaynakta `3~` yazıyor, CSV `3` diyor;
tam-kelime araması `3~`'ü kaçırdı. Alıntı zaten *"Phases satırında M955 sütunu = 3~"* diyor.
**Yani DD için 12/12 doğru.** Ölçütün kendi kusurunu satırın kusuru diye yazmamak için bunu
açıkça kaydediyorum.

**Kalan sınır:** 81 satırın 12'sini ölçtüm (%15). Kalan 69 satır için hükmüm "örnekleme temiz",
"hepsi doğrulandı" değil.

## 2. Çürütme gerekçeleri — ikisi bağımsız doğrulandı

| İddia | Benim ölçümüm | Sonuç |
|---|---|---|
| §3.3 "nominal noktanın `max_`/`min_` alanına yazılması yasak" | `product-schema-standard.md` **satır 299**: *"Nominal noktayı `max_` alanına yazmak yasak"*; satır 292/294 `max_` = aralığın üst sınırı, `nominal_` = eğri üzerinde belirli nokta | ÖNCÜL **DOĞRU** — 12 satırın çürütülmesi yerinde |
| §6-A "NIC-11921'in DB kodu `6N090P`, katalogda `61090P`" | Katalogda 6-ile-başlayan **66 kod** var, **6N ile başlayan 0**; `61090P` geçiyor, `6N090P` geçmiyor | Katalog tarafı **DOĞRU** — ama DB tarafı eksik anlatılmış, bkz. §3 |

## 3. ⚠DÜZELTME — "DB'deki yazım düzeltilmeli" hükmü olduğu gibi uygulanamaz

OPS §6-A: *"DB sipariş kodu `6N090P` … DB'deki yazım düzeltilmeli, satırlar doğru."*
**Canlı DB'yi ölçtüm** (`products`, NIC-11921):

```
model_code : 11921            <- SIPARIS KODU DEGIL
name       : DD 12/12 1500W 3F 4P 2V** - 6N090P
slug       : dd-12-12-1500w-3f-4p-2v-6n090p-11921
DB'de model_code=61090P olan ürün: YOK
```

`6N090P` **`model_code` alanında değil**; yalnız **ürün adında ve slug'da** yaşıyor. Sonuçları:

1. Düzeltme bir alan güncellemesi değil; **ad + slug** değişikliğidir.
2. **Slug değişimi URL değişimidir** → kanonik URL, yönlendirme ve SEO etkisi doğurur. Bu
   `src/app/[lang]/products/**` yüzeyi, yani **URUN şeridinin** işi ve tek başına sorulacak
   yapısal bir karardır ([[yapisal-karar-pakete-gomulmez]]) — teknik özellik yüklemesine
   iliştirilerek geçirilemez.
3. Teknik özellik yüklemesi bu düzeltmeyi **beklemez**: 81 satır `sku`/`model_code` ile bağlanıyor,
   ikisi de doğru. Kod yazımı ayrı kalemdir.

**Hükmüm:** DD'nin 81 satırı yüklenebilir (kapı açıldığında); kod yazımı **ayrı iş**, sahibi URUN,
kararı Recep'in. Bu incelemede düzeltilmedi.

## 4. Kabul edilen kümede kalan tek şüphem — `ip_rating=IP20` (NIC-11921)

Rapor STORM'da `IP20`'yi *"yalnız 'also available with external rotor' seçeneği için verilmiş"*
diye **çürütmüş** (§3.4). DD'de aynı değer **kabul** edilmiş. İki ürün farklı, ama şüphe aynı
sınıftan: değer motorun mu, seçeneğin mi? Örneklememde satır SUTUN-VAR çıktı (etiket M955, mesafe 1),
yani **koordinat düzeyinde sağlam**; ama "opsiyon mu standart mı" sorusu koordinatla çözülmez.
**Yüklemeden önce bu tek satır bağlamıyla okunmalı** — 81 satırın 80'i için itirazım yok.

## 5. Sınırlar (dürüstlük)

- 764 satırın 12'sini kaynağa karşı ölçtüm; kalan 752 için hükmüm **yok**, "temiz" demiyorum.
- Yalnız DD (KABUL) örneklendi. KISMEN/RET dosyalarının satır listelerini **okudum**, kaynağa karşı
  **ölçmedim** — onlar zaten onarım kuyruğunda.
- §5'teki 3 şema kararı (permissible_motor_power_w · max_static_pressure_pa toplam/statik ·
  atex_marking biçimi) **Recep'in**; OPS taşıyor, ben karar üretmedim.
- Faz 2'nin kendi doğrulama CSV'lerini kanıt olarak kullanmadım (aynı koşunun ürünü).

## 6. Yükleme kapısına eklediğim şart

OPS §7'de 6 şart var; **yedincisini ekliyorum** (kendi payım):

> **7. Yükleyici betik, kaynak dizini EVREN KAPISINDAN geçecek.** Bugün ölçüldü: `teknik_bosluk.py`
> ve `kanit-tablosu.py` dar/yanlış bir kaynak dizinine karşı sessizdi (KANITSIZ 208 → 909, çıkış 0).
> `_kaynak.taban_dogrula` eklendi (commit `7e3071c7`), altı hal borusuz ölçüldü. Yükleyici de aynı
> kapıyı kullanacak — yoksa eksik bir evrenle "bu alan boş" deyip **canlı veriyi yanlış doldurabilir**.

**Şu an kapı: 4/6 şart açık + benim 7. şartım karşılandı (betik tarafı hazır).**
