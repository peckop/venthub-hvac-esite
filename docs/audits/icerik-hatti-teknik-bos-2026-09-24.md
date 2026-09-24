# Teknik özelliği HİÇ olmayan ürünler — liste ve doldurma planı (2026-09-24, KATALOG)

**Emir:** OPS 2026-09-24 (REC-357 §3.4 ölçümü: 442 üründen 73'ü teknik özelliksiz). **Cetvel:**
`product-schema-standard.md` (alan anlamı, türetilen değer), `catalog-ingestion-standard.md` §6.3 (kaynak dizini; PDF açılmaz).
**Durum:** PLAN — canlıya yazım yok. Yazım Recep'in sözüyle (iki anahtarlı teknik-duzelt kolu).

## 1. Ölçüm — 73 değil 24

Canlı salt okuma (service key, 2026-09-24 ~12:00Z): 442 ürün, `technical_specs` boş olan **24** (hepsi aktif).
73 → 24 farkı 09-22 ile bugün arasındaki onaylı yazımlardan: NIMUS 15 + NIMAX 15 artık 12'şer alanlı, ENKELFAN EC
PLUG ve CMS ATEX'in kalanı doldu. REC-172 tur 2 bu 24'ü **kapsamıyor**: tur 2 yalnız beş alana bakıyordu
(frekans, yalıtım, sıcaklıklar, IE) ve 17'si orada "kaynak yok" olarak düştü, 7'si hiç listede yok.

| Aile | Ürün | Kaynak (dizinde) | Kaynakta olan | Kardeşlerin kullandığı alan |
|---|---|---|---|---|
| `avens-qe-b-kasa` | 9 (AVE-11560…11568) | AVenS fiyat listesi s.21 — yalnız düz metin | ABS gövde, DIN 18017-3 uygunluğu, K90 yangın dayanımı (K90 varyantları), valf anma çapı 80 mm (bazıları) | Kardeşler FAN; bu ürünler **montaj kasası** (aksesuar) — fan alanları anlamsız |
| `avens-dikdortgen-kanal-radyal` | 7 (AVE-1200…1410) | fiyat listesi s.27 tablo | Hava debisi (1100…9500 m³/h); önerilen hız anahtarı/sürücü | `max_delivery_m3h` (36/36 kardeşte) |
| `avens-sulu-batarya` | 6 (AVE-13052…13057) | fiyat listesi s.69 tablo | Debi, ısıtıcı gücü (kcal/h), 90/70 °C, uygun model | `heating_power_w`, `compatible_model`, `nominal_delivery_m3h` (AVE-13050/13051) |
| `vortice-vorticent-cms-atex` | 1 (VRT-253100106XN, 14/5 T2 0,25 kW) | fiyat listesi s.39 satırı; **ürün föyü dizinde YOK** (dizinde 14/5'in yalnız T4 0,09 kW föyü var) | Güç 0,25 kW, debi 840 m³/h, Zone 2 ATEX işareti | Kardeş 16/6 T2: 12-13 alan föyden |
| `seat-atex-ptc-sensor` | 1 (SEA-810105) | fiyat listesi s.44/45 — yalnız ad | Hiçbir teknik değer | — |

## 2. Doldurma planı (aile aile)

1. **Dikdörtgen kanal radyal (7):** `max_delivery_m3h` fiyat listesi s.27'den. Tek alan; kalan (güç, akım, devir,
   ağırlık, IP) kaynakta yok → **park** (tedarikçiden föy). Model adındaki "40x20" kanal ağzı ölçüsüdür, kardeşlerin
   `size_a_mm/size_b_mm`'i cihaz dış ölçüsüdür — aynı anlam değil, TÜRETİLMEZ. Hız anahtarı önerisi teknik özellik
   değil, aksesuar ilişkisidir.
2. **Sulu batarya (6):** `compatible_model` ve `nominal_delivery_m3h` s.69'dan, çelişkisiz. **`heating_power_w` YAZILMAZ:**
   kaynak kendi içinde çelişiyor — adda "11 KW", güç sütununda 11 300 kcal/h (= 13,1 kW); "20 KW" ↔ 33 000 kcal/h
   (= 38,4 kW). Hangisinin doğru olduğu tedarikçi sorusudur → **park**. Aynı çelişki canlıdaki AVE-13050/13051'de
   de var ("7 KW" yazılmış, kaynak sütunu 4 700 kcal/h = 5,5 kW) → park kalemine eklenir; o iki değere dokunulmaz
   (canlı düzeltme ayrı Recep onayı).
3. **CMS ATEX 14/5 T2 (1):** önce föy edinilir — kardeşlerin föyleri avensair.com `uploads/` altından alınmış
   (`kaynak-dizini/edinme-2026-09-22.json`); 14/5 T2'nin adresi **sitenin ürün sayfasından ölçülür** (tahmin edilen URL
   yasak), dizine eklenir (`cikar.py` + `tazelik.py`), sonra kardeşleriyle aynı alan kümesi çıkarılır. Föy bulunamazsa
   fiyat listesinin üç değeri (`rated_power_w` 250, `max_delivery_m3h` 840, `atex_zone` Zone 2 + `atex_marking`) yazılır.
4. **QE-B kasa (9):** aksesuar; kaynakta sayısal performans değeri yok. Metindeki nitelikler (malzeme, standart
   uygunluğu, yangın dayanımı, valf anma çapı) için şemada alan YOK → önce `product-schema-standard.md`'ye aksesuar
   alan satırı (kural 1: cetvel yoksa iş cetveli de kapsar) + URUN'dan etiket; `diameter_mm` fan kanal çapı anlamındadır,
   valf çapı için KULLANILMAZ. Cetvel satırı gelene kadar bu 9 ürün "teknik özelliği yok" sayımında **aksesuar** diye ayrı
   raporlanır (karne satırı), sayıyı yapay küçültmek için alan uydurulmaz.
5. **PTC sensör (1):** kaynakta değer yok → **park** (SEAT föyü). Sayımda aksesuar olarak ayrılır.

**Yöntem (OPS emri):** çıkarım bir Sonnet alt ajanı, doğrulama ondan bağımsız ikinci ajan; ikisi yalnız
`kaynak-dizini/sayfalar.jsonl`'i okur. Çıktı teknik-duzelt girdisi (`duzeltme-*.json`) biçiminde; kuru koşum canlıya
karşı temizse Recep'e örnekli tek soru.

**Beklenen sonuç:** 24 → 9 aksesuar kasa + 1 sensör (cetvel/park) + 0 fan. Doldurulan: 7 + 6 + 1 = 14 ürün
(dikdörtgen 1 alan, sulu batarya 2 alan, CMS ATEX föyle 12-13 ya da föysüz 3-4 alan).

## 3. Park listesi (tedarikçi sorusu — Recep'e sorulmaz, AVenS paketine eklenir)

| Kalem | Soru |
|---|---|
| Sulu batarya ısıtıcı gücü | Adda yazan kW mı, güç sütunundaki kcal/h mı doğru? (8 ürün, 13050-13057) |
| Dikdörtgen kanal radyal föyü | 7 model için motor gücü, akım, devir, ağırlık, IP |
| QE-B kasa | (cetvel satırından sonra) valf çapı tüm varyantlarda 80 mm mi |
| SEAT PTC sensör | Föy: direnç eğrisi / tepki sıcaklığı / uyumlu motorlar |
