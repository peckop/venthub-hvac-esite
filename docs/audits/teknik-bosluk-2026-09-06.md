# Teknik boşluk matrisi — hangi alan eksik, kim doldurabilir? (FAZ 1)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06 · **Durum:** SALT OKUMA; canlıya hiçbir şey yazılmadı.

## KAYNAK / CETVEL

* `docs/standards/product-schema-standard.md` — alan adı → anlam sözleşmesi.
* `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini; **PDF doğrudan taranmaz, dizin okunur**.
* Emir: OPS → KATALOG, Recep girdisi *"teknik özellikler tamamlanmadı, markaların sitelerinden **kanıtlı** alalım"*. **YÖNTEM:** şerit, alt ajan yok. Sapma yok.

---

## 0 · Soru nasıl kuruldu (ve niçin böyle)

"Üründe alan boş" tek başına bir şey söylemez: bazı alanlar o aile için **zaten anlamsızdır** — hız anahtarında debi aranmaz. Anlamlı soru şu:

> Ailenin ürünlerinin **çoğunda dolu** olan bir alan, bazı kardeşlerinde **boş** mu?

Çünkü o zaman alan o aile için **bekleniyor** demektir. Eşik (K13): bir alan ailenin ürünlerinin **≥%60**'ında doluysa beklenen sayılır; beklenen ama boş hücre = **BOŞLUK**.

## 1 · Ölçüm

| Ölçüt | Sayı |
|---|---|
| Canlı ürün | 375 |
| Aile | 40 |
| **Boşluk hücresi** | **74** |
| — ailenin teknik PDF'i dizinde **var** (bizden çıkarım) | 0 |
| — **web kaynağı gerekir** | **74** |

**74 = 0 + 74**

## 2 · ⛔EMİRDEN SAPMA — K13 tek başına YETMEZ, ikinci ölçüt eklendi

Emir K13 eşiğini tarif etti (aile içi: ≥%60 dolu = beklenen, beklenen ama boş = boşluk). Uyguladım ve **kör noktası çıktı**:

| Aile | Ort. dolu alan | K13 boşluğu |
|---|---|---|
| `danfoss-fc51` | **0.0** | **0** |
| `avens-sulu-batarya` | **0.8** | **0** |
| `nicotra-gebhardt-*` (4 aile) | **1.0** | **0** |

Bir ailede alan **hiç kimsede** yoksa o alan "beklenen" sayılmaz ve boşluk doğmaz. Sonuç: **kataloğun en boş aileleri kusursuz görünür.** K13 tek başına yayımlansaydı rapor "sorun SEAT'te" derdi; oysa asıl sorun Nicotra'da — 35 üründe fiilen veri yok.

**Sapma:** ikinci, bağımsız ölçüt eklendi — *aile yoksulluğu*: ailenin ortalama dolu alan sayısı, katalog ortancasının (**13**) yarısından az mı (eşik **6.5**). K13 *tutarsızlığı*, bu *yetersizliği* ölçer; ikisi farklı sorular ve biri ötekinin yerine geçmez.

**Ölçülen: 12 yoksul aile, 71 ürün (18%).**

| Aile | Marka | Ürün | Ort. dolu alan |
|---|---|---|---|
| `danfoss-fc51` | Danfoss | 2 | **0.0** |
| `avens-sulu-batarya` | AVenS | 8 | **0.8** |
| `avens-bvu-ls` | AVenS | 2 | **1.0** |
| `avens-hiz-anahtarlari` | AVenS | 2 | **1.0** |
| `nicotra-gebhardt-adh` | Nicotra Gebhardt | 8 | **1.0** |
| `nicotra-gebhardt-at` | Nicotra Gebhardt | 8 | **1.0** |
| `nicotra-gebhardt-dd` | Nicotra Gebhardt | 13 | **1.0** |
| `nicotra-gebhardt-rdh` | Nicotra Gebhardt | 6 | **1.0** |
| `avens-siginak-havalandirma-uniteleri` | AVenS | 3 | **2.0** |
| `avens-hucreli-aspiratorler` | AVenS | 6 | **2.7** |
| `avens-hucreli-hf-s` | AVenS | 7 | **4.0** |
| `avens-elektrikli-isiticilar` | AVenS | 6 | **6.0** |

**Karar için anlamı:** yoksul ailelerde kardeşlerden çıkarım YAPILAMAZ — alınacak bir şey yok. Bunlar doğrudan **web kaynağı** sınıfıdır.

## 3 · Aile tablosu

| Aile | Marka | Ürün | Ort. dolu alan | Beklenen alan | Boşluk hücresi | Kaynak sınıfı |
|---|---|---|---|---|---|---|
| `seat-serisi` | SEAT | 40 | 8.9 | 9 | 31 | **SADECE_FIYAT_LISTESI** |
| `storm-serisi` | SEAT | 20 | 11.6 | 13 | 28 | **SADECE_FIYAT_LISTESI** |
| `jet-serisi` | SEAT | 21 | 8.4 | 9 | 12 | **SADECE_FIYAT_LISTESI** |
| `avens-hucreli-aspiratorler` | AVenS | 6 | 2.7 | 3 | 3 | **SADECE_FIYAT_LISTESI** |
| `avens-bvu-ls` | AVenS | 2 | 1.0 | 1 | 0 | **SADECE_FIYAT_LISTESI** |
| `avens-elektrikli-isiticilar` | AVenS | 6 | 6.0 | 6 | 0 | **SADECE_FIYAT_LISTESI** |
| `avens-hiz-anahtarlari` | AVenS | 2 | 1.0 | 1 | 0 | **SADECE_FIYAT_LISTESI** |
| `avens-hucreli-hf-s` | AVenS | 7 | 4.0 | 4 | 0 | **SADECE_FIYAT_LISTESI** |
| `avens-isi-geri-kazanim` | AVenS | 3 | 7.0 | 7 | 0 | **SADECE_FIYAT_LISTESI** |
| `avens-plug-fanlar` | AVenS | 14 | 17.0 | 17 | 0 | **SADECE_FIYAT_LISTESI** |
| `avens-siginak-havalandirma-uniteleri` | AVenS | 3 | 2.0 | 2 | 0 | **SADECE_FIYAT_LISTESI** |
| `avens-sulu-batarya` | AVenS | 8 | 0.8 | 0 | 0 | **SADECE_FIYAT_LISTESI** |
| `danfoss-fc101` | Danfoss | 16 | 10.0 | 10 | 0 | **SADECE_FIYAT_LISTESI** |
| `danfoss-fc102` | Danfoss | 17 | 10.0 | 10 | 0 | **SADECE_FIYAT_LISTESI** |
| `danfoss-fc51` | Danfoss | 2 | 0.0 | 0 | 0 | **SADECE_FIYAT_LISTESI** |
| `nicotra-gebhardt-adh` | Nicotra Gebhardt | 8 | 1.0 | 1 | 0 | **SADECE_FIYAT_LISTESI** |
| `nicotra-gebhardt-at` | Nicotra Gebhardt | 8 | 1.0 | 1 | 0 | **SADECE_FIYAT_LISTESI** |
| `nicotra-gebhardt-dd` | Nicotra Gebhardt | 13 | 1.0 | 1 | 0 | **SADECE_FIYAT_LISTESI** |
| `nicotra-gebhardt-rdh` | Nicotra Gebhardt | 6 | 1.0 | 1 | 0 | **SADECE_FIYAT_LISTESI** |
| `vortice-deumido-range` | Vortice | 3 | 16.0 | 16 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-h-ad-elektrikli` | Vortice | 4 | 20.0 | 20 | 0 | **SADECE_FIYAT_LISTESI** |
| `vortice-hava-perdesi` | Vortice | 4 | 19.0 | 19 | 0 | **SADECE_FIYAT_LISTESI** |
| `vortice-isi-geri-kazanim` | Vortice | 5 | 20.2 | 20 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-lineo` | Vortice | 7 | 21.0 | 21 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-lineo-quiet` | Vortice | 12 | 23.0 | 23 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-punto-evo-flexo` | Vortice | 4 | 23.0 | 23 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-radon-range-circular` | Vortice | 5 | 21.0 | 21 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-radon-range-roof` | Vortice | 3 | 22.0 | 22 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-commercial-in-line-circular` | Vortice | 7 | 21.0 | 21 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-commercial-in-line-rectangular` | Vortice | 5 | 18.0 | 18 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-e-atex` | Vortice | 14 | 22.0 | 22 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-heatmaster-slimroof-roof` | Vortice | 10 | 17.0 | 17 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-heatmaster-slimroof-smoke` | Vortice | 10 | 19.0 | 19 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-industrial-ventilation-axial` | Vortice | 16 | 21.0 | 21 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-industrial-ventilation-roof` | Vortice | 1 | 22.0 | 22 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-mono` | Vortice | 8 | 20.0 | 20 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-nordik-hvls` | Vortice | 7 | 15.0 | 15 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-qbk-sal-kc-evo` | Vortice | 21 | 21.0 | 21 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vort-quadro-evo` | Vortice | 23 | 17.0 | 17 | 0 | **PDF_TEKNIK_VAR** |
| `vortice-vortice-bravo-s` | Vortice | 4 | 13.0 | 13 | 0 | **PDF_TEKNIK_VAR** |

## 4 · Boşluk sınıfı ne demek

| Sınıf | Anlamı | Kimin işi |
|---|---|---|
| `PDF_TEKNIK_VAR` | ailenin **teknik** kaynağı dizinde duruyor | bizden çıkarım yeter |
| `SADECE_FIYAT_LISTESI` | tek kaynağı AVenS fiyat listesi — orada **spec yok** | web kaynağı gerekir |
| `KAYNAK_YOK` | dizinde hiçbir kaynağı yok | web kaynağı gerekir |

⚠**Sınıf bir VEKİLDİR, kanıt değil.** "Ailenin teknik PDF'i var" demek "o değer o PDF'te yazıyor" demek **değildir**; iddia "bakılacak bir yer var"dır. Ters yön güçlü: kaynağı **yoksa** bizden çıkarım mümkün değildir.

## 5 · OPS'un "alan adı ikiliği" sorusu — ÖNCÜLÜ YANLIŞ

Soru şöyle geldi: *"`max_delivery_m3h` 243 vs `nominal_delivery_m3h` 89 — hangisi kanonik?"* **İkisi de kanonik; mükerrer değiller.** `product-schema-standard.md` "Ön ek → anlam" tablosu bunu açıkça ayırıyor:

| Ön ek | Anlamı |
|---|---|
| `max_…` | üreticinin verdiği çalışma aralığının **üst sınırı** (serbest hava) |
| `nominal_…` | eğri üzerinde **belirli bir çalışma noktası** (devir + karşı basınç) |

Cetvel ayrıca **yasak** koyuyor: *"Nominal noktayı `max_` alanına yazmak yasak."* Gerekçesi ölçülmüş (2026-08-21, SEAT föyleri): nominal değeri `max_` alanına yazmak **birim hatasını kapatırken semantik hata üretiyordu**. Yani ikisini birleştirmek düzeltme değil, **bozma** olurdu.

## 6 · FAZ 2 arama listesi — ajanlar koddan başlasın

Yoksul ailelerin **model kodları**. Arama bunlarla başlar; kod üreticinin kendi kataloğunda birebir geçer ve marka adıyla arama yapmaktan çok daha kesindir.

⚠**Marka sitesi adayı UYDURMUYORUM.** Doğrulamadığım bir adresi rapora koymak, bütün bu hattın kurulma sebebine aykırı olurdu: uydurulmuş bir kaynak, kaynaksızlıktan daha tehlikelidir çünkü kanıtlıymış gibi görünür. Aşağıdaki yönlendirme **ölçülmüş** kayıtlardan geliyor ve her satır kaynağını ve sınırını taşıyor.

### 6.0 · Kaynak yönlendirmesi — üç marka, üç farklı yol

ÜRÜN şeridinin **2026-08-21 tarihli ölçülmüş marka-kaynak haritası** (`brand-image-sources.md`) planımdaki bir varsayımı çürüttü; kendi kayıtlarımızla doğruladım (`catalog-ingestion-standard.md` satır 94: *"avens/ — AVenS kendi üretimi"*; K7.10'da iki AVenS ailesi zaten Recep'ten föy bekliyordu).

| Marka | Ürün | Kaynak nerede | Kim getirir | Bilinen tuzak |
|---|---|---|---|---|
| **AVenS** | 34 | **Web'de YOK** — bizim markamız; kaynak Recep'in arşivi/föyleri | **Recep** | ajanı web'e gönderirsen 34 üründe sıfır sonuç alır ve bunu "bulunamadı" diye raporlar — oysa aranacak yer yok |
| **Nicotra Gebhardt** | 35 | `avensair.com/nicotra-gebhardt` (ÜRÜN 08-21: 28/35 eşleşti); resmî site yalnız AT serisi | FAZ 2 ajanı (ya da Recep'in katalog PDF'i varsa o, daha iyi) | **koda değil MODEL TANIMLAYICIYA** eşle — sipariş kodu iki kaynakta farklı yazılıyor, 7 ürün kodla düştü; site araması sorgu başına sonuç sınırlıyor (1000 satır tavanının web kardeşi) |
| **Danfoss** | 2 | `danfoss.com` FC-51 sayfası (ÜRÜN 08-21) | FAZ 2 ajanı | — |

**Sınır (ÜRÜN'ün kendi ifadesiyle):** bu harita **görsel** kaynağı için çıkarıldı, teknik özellik için değil; bir sayfanın görseli taşıması teknik tabloyu da taşıdığını kanıtlamaz; ölçüm 16 gün önce. Yani "kaynak listesi" değil, **"aranacak yer + bilinen tuzaklar"**.

**Bunun karar için anlamı:** 71 ürünün **34'ü (yaklaşık yarısı) web fazına hiç girmez.** O 34 için tek yol Recep'in AVenS föylerini teslim etmesi. FAZ 2 ajan kotası yalnız Nicotra + Danfoss'a (37 ürün) harcanmalı.

### `avens-bvu-ls` — AVenS · 2 ürün · ort. 1.0 alan

```
30110  30111
```

### `avens-elektrikli-isiticilar` — AVenS · 6 ürün · ort. 6.0 alan

```
13032  13033  13034  13037  13038  13039
```

### `avens-hiz-anahtarlari` — AVenS · 2 ürün · ort. 1.0 alan

```
01801  60006
```

### `avens-hucreli-aspiratorler` — AVenS · 6 ürün · ort. 2.7 alan

```
20100  20110  20120  20130  20140  20150
```

### `avens-hucreli-hf-s` — AVenS · 7 ürün · ort. 4.0 alan

```
20200  20210  20220  20230  20240  20250
20260
```

### `avens-siginak-havalandirma-uniteleri` — AVenS · 3 ürün · ort. 2.0 alan

```
30100  30101  30102
```

### `avens-sulu-batarya` — AVenS · 8 ürün · ort. 0.8 alan

```
13050  13051  13052  13053  13054  13055
13056  13057
```

### `danfoss-fc51` — Danfoss · 2 ürün · ort. 0.0 alan

```
80101  80141
```

### `nicotra-gebhardt-adh` — Nicotra Gebhardt · 8 ürün · ort. 1.0 alan

```
11942  11943  11947  11948  11949  11950
11951  11956
```

### `nicotra-gebhardt-at` — Nicotra Gebhardt · 8 ürün · ort. 1.0 alan

```
11930  11931  11932  11933  11934  11935
11938  11939
```

### `nicotra-gebhardt-dd` — Nicotra Gebhardt · 13 ürün · ort. 1.0 alan

```
11901  11902  11905  11907  11908  11909
11910  11911  11912  11913  11916  11920
11921
```

### `nicotra-gebhardt-rdh` — Nicotra Gebhardt · 6 ürün · ort. 1.0 alan

```
11960  11961  11962  11963  11964  11969
```

## 7 · Bu ölçümün kapatmadığı

* Hangi web kaynağının **kullanılabilir** olduğu (üretici sitesinde PDF var mı) — FAZ 2.
* `PDF_TEKNIK_VAR` sınıfındaki boşlukların **gerçekten** o PDF'te bulunup bulunmadığı — vekil, kanıt değil.
* Eşiğin (%60) kendisi bir **seçim**; daha yüksek eşik daha az ama daha kesin boşluk verir. Değiştirilirse sayı değişir, bu yüzden eşik raporda yazılı.
