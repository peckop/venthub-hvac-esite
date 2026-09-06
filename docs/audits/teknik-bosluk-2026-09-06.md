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

## 6 · Bu ölçümün kapatmadığı

* Hangi web kaynağının **kullanılabilir** olduğu (üretici sitesinde PDF var mı) — FAZ 2.
* `PDF_TEKNIK_VAR` sınıfındaki boşlukların **gerçekten** o PDF'te bulunup bulunmadığı — vekil, kanıt değil.
* Eşiğin (%60) kendisi bir **seçim**; daha yüksek eşik daha az ama daha kesin boşluk verir. Değiştirilirse sayı değişir, bu yüzden eşik raporda yazılı.
