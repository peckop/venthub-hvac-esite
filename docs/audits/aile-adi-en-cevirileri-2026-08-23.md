# Ürün Ailesi Adları — Önerilen EN Karşılıkları (İNCELEME BEKLİYOR)

> **Ne bu?** `product_families.name_i18n` için 25 Türkçe aile adının **önerilen** İngilizce
> karşılıkları. Tarih: 2026-08-23 · Şerit: I18N · İlgili migration:
> `supabase/migrations/20260823120000_product_families_name_i18n.sql`
>
> **Bu liste HENÜZ YAZILMADI.** Migration yapıyı kurar ve dil-nötr 13 model adını doldurur;
> aşağıdaki 25 satır müşteri-görünür pazarlama metnidir ve **Recep'in onayı olmadan prod'a
> yazılmaz**. Onaylanan satırlar ayrı ve küçük bir veri migration'ıyla girer.

---

## 0. Neden ayrı duruyor

Migration'a gömseydim, 25 müşteri-görünür ad tek bir "onay" ile prod'a inerdi ve gözden
geçirme aşaması hiç yaşanmazdı. Ürün ailesi adı vitrinde başlık, arama sonucu, breadcrumb ve
SEO başlığı olarak görünür — yanlış bir terim kataloğun tamamına yayılır. Bu yüzden yapı ve
metin ayrıldı: yapı atarsız, metin incelenir.

## 1. Yüksek güvenli — düz terim karşılığı (23 satır)

| # | TR (bugünkü `name`) | Önerilen EN |
|---:|---|---|
| 1 | AVenS Davlumbaz Fanları | AVenS Range Hood Fans |
| 2 | AVenS Elektrikli Kanal Isıtıcıları | AVenS Electric Duct Heaters |
| 3 | AVenS Hücreli Aspiratörler | AVenS Box Extract Fans |
| 4 | AVenS Isı Geri Kazanım Cihazları | AVenS Heat Recovery Units |
| 5 | AVenS Sığınak Havalandırma Üniteleri | AVenS Shelter Ventilation Units |
| 6 | AVenS Plug Fanlar | AVenS Plug Fans |
| 7 | Nicotra Gebhardt AT Çift Emişli Radyal Fanlar | Nicotra Gebhardt AT Double-Inlet Centrifugal Fans |
| 8 | Nicotra Gebhardt DD Direkt Akuple Radyal Fanlar | Nicotra Gebhardt DD Direct-Driven Centrifugal Fans |
| 9 | SEAT Storm Jet Asit Dayanımlı Fanlar | SEAT Storm Jet Acid-Resistant Fans |
| 10 | Vortice Aksiyel Endüstriyel Fanlar | Vortice Axial Industrial Fans |
| 11 | Vortice Deumido Nem Alma Cihazları | Vortice Deumido Dehumidifiers |
| 12 | Vortice Endüstriyel Çatı Fanları | Vortice Industrial Roof Fans |
| 13 | Vortice Heatmaster Duman Egzoz Fanları | Vortice Heatmaster Smoke Extract Fans |
| 14 | Vortice Lineo Quiet Kanal Fanları | Vortice Lineo Quiet Inline Duct Fans |
| 15 | Vortice Punto Evo / Flexo Banyo Fanları | Vortice Punto Evo / Flexo Bathroom Fans |
| 16 | Vortice Radon Serisi Çatı Fanları | Vortice Radon Series Roof Fans |
| 17 | Vortice Radon Serisi Kanal Fanları | Vortice Radon Series Duct Fans |
| 18 | Vortice Slimroof Çatı Fanları | Vortice Slimroof Roof Fans |
| 19 | Vortice VORT Commercial In-Line Dikdörtgen Kanal Fanları | Vortice VORT Commercial In-Line Rectangular Duct Fans |
| 20 | Vortice VORT Commercial In-Line Yuvarlak Kanal Fanları | Vortice VORT Commercial In-Line Circular Duct Fans |
| 21 | Vortice VORT HR Isı Geri Kazanım | Vortice VORT HR Heat Recovery |
| 22 | Vortice AIR DOOR Hava Perdeleri | Vortice AIR DOOR Air Curtains |
| 23 | Vortice VORT-E ATEX Fanlar | Vortice VORT-E ATEX Fans |

Bu 23 satırda marka ve model kodu olduğu gibi korunur; yalnız tür adı çevrilir.

## 2. İKİ SATIR — OEM KAYNAĞINDAN ÖLÇÜLDÜ (Recep teyidi bekliyor)

İlk yazımda "domain doğrulaması gerekir" diye bırakmıştım. Sonra ölçtüm — üreticinin kendi
ürün sayfaları soruyu kapatıyor:

| # | TR | Önerilen EN | Kaynak |
|---:|---|---|---|
| 24 | Nicotra Gebhardt ADH Sık Kanatlı Radyal Fanlar | Nicotra Gebhardt ADH **Forward-Curved** Centrifugal Fans | nicotra-gebhardt.com/en → ADH: "double inlet … impeller with **forward curved** blades" |
| 25 | Nicotra Gebhardt RDH Seyrek Kanatlı Radyal Fanlar | Nicotra Gebhardt RDH **Backward-Inclined** Centrifugal Fans | nicotra-gebhardt.com/en → RDH: "impeller … 11 **backward inclined** blades" |

### ÖNEMLİ: ilk önerim RDH'de YANLIŞTI

Önce "Backward-**Curved**" önermiştim. Üretici kendi metninde "backward **inclined**" diyor —
ikisi aynı şey değil: *curved* kanat eğrisel, *inclined* kanat düz ama eğik durur. Bir satıcı
sitesi (mep-global) "backward-curved" yazıyor; çelişkide **OEM kazanır**, satıcı metni değil.
Eğer OEM'i okumasaydım makul görünen ama yanlış bir terimi 16 ürünlük aileye basacaktım.

Bu tam olarak `fidelity-is-not-correctness` sınıfı: satıcı metnine sadakat, OEM yanlış
kopyalanmışsa doğru sonuç vermez.

### Kapsam dışı gözlem (URUN/taksonomi kalemi, çözmüyorum)

ADH ve RDH'nin ikisi de üreticiye göre **çift emişli (double inlet)**. Ama katalogda "Çift
Emişli" adını taşıyan ayrı bir aile var: `Nicotra Gebhardt AT Çift Emişli Radyal Fanlar`.
Yani "çift emişlilik" AT'yi diğerlerinden AYIRMIYOR; ayırt edici özellik başka bir şey olmalı.
Bu bir adlandırma tutarsızlığı olabilir — i18n kusuru değil, taksonomi kalemi.

## 3. Yazılmayacaklar — dil-nötr 13 model adı

`Danfoss VLT HVAC Basic Drive FC 101` · `Danfoss VLT HVAC Drive FC 102` · `Vortice Bravo S` ·
`Vortice Lineo 100/125/150/200/250/315 Quiet` · `Vortice Nordik HVLS Hyperblade` ·
`Vortice VORT Mono` · `Vortice VORT QBK SAL KC Evo` · `Vortice VORT Quadro Evo`

Bunlarda EN = TR yazılır (migration adım 2 bunu yapar); çeviri **yanlış** olurdu.

## 4. Sonraki adımlar

1. Recep §1'i onaylar. §2 OEM kaynağından ÖLÇÜLDÜ — Recep'ten gereken karar değil TEYİT.
2. Onaylı 25 satır küçük bir veri migration'ıyla `name_i18n->'en'` alanına yazılır.
3. **Okuma yolu** bağlanır: `name_i18n[lang] → name` sırası. Bu `src/lib/services/
   family.service.ts` (+ görünüm katmanı) demektir ve **ÜRÜN şeridinin alanıdır** — I18N
   bağlamaz, OPS koordine eder. Okuma yolu bağlanana kadar bu kolon ekranda hiçbir şey
   değiştirmez.
4. Sertleştirme: yazma yolu `name_i18n`i doldurmaya başlayınca `CHECK (name_i18n ? 'tr')`
   ayrı migration'la eklenir. Şimdi eklenirse name_i18n vermeyen INSERT'ler patlar.
