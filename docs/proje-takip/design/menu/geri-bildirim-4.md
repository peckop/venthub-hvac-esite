
# Geri bildirim 4 — Liste sayfaları MATRİS görünümü (2026-09-04 sabah, Recep kararı; veri canlı DB'den ölçüldü)

Kaynak: Linear "Kararlar — Vitrin 15A" K maddesi (Liste sayfaları matris görünümü, iki katlı). Sütunlar keyfe
göre değil DOLULUĞA göre seçildi: canlı `products.technical_specs` üzerinde salt-okuma sayım, 2026-09-04 ~09:35.
Bu belge Faz 3 (liste ve kartlar) işidir; v8 paketinin (geri-bildirim-3) DIŞINDADIR, v8 bitince çizilir.

## 42 — Karar: Kart / Tablo / Seri üç görünüm, varsayılan Tablo

- Tüm ürünler sayfası ve her dal/seri sayfası (ekran 05, 06) üç görünüm alır: **Kart** (bugünkü), **Tablo** (matris),
  **Seri** (seri satırları, açılınca modeller). Görünüm anahtarı süzgeç çubuğunun sağında, üç küçük simge; seçim
  cihazda hatırlanır. Varsayılan Tablo.
- İki kat: **katalog geneli** ortak sütunlar (Tüm ürünler sayfası); **grup içi** sütunlar (dal/seri sayfası).
  Kural: sütun, o kümedeki ürünlerin **≥%60**'ında doluysa görünür; **%30–60** gizlenebilir ikincil sütun
  ("Sütunlar ▾" menüsünden açılır, varsayılan kapalı); **<%30** matrise girmez, ürün sayfasında kalır.
- Tablo satırı: solda Karşılaştır kutusu (≤4, ekran 11), model kodu + ad (tıklanır), sütunlar, sağda çerçeveli
  "Teklif listesine ekle". Sütun başlığına dokununca sıralanır (ok işareti). Boş hücre "—" değil BOŞ bırakılır.
  Sayılar tabular, birim başlıkta (m³/h, Pa, W, dB(A), kg, mm), hücrede tekrar etmez.
- Mobil: tablo kendi kabında yana kayar, ilk sütun (model) sabit; sayfa gövdesi yana kaymaz. Alternatif olarak
  mobilde varsayılan Kart kalabilir — Design karar versin ve gerekçesini yazsın.
- **Tüm ürünler için ayrı ekran çizilmez:** ekran 06 şablonu, kategori süzgeci boş + üstte harita (43).

## 43 — Tüm ürünler sayfasının üstü: marka × kategori haritası

Satırlar marka, sütunlar ürünlü kategoriler, hücrede ürün sayısı; hücreye dokununca liste o kesite süzülür.
Boş hücre çizilmez (boş dal yasağı). Canlı veri (2026-09-04):

| Kategori | Ürün | Marka sayısı |
|---|---|---|
| Fanlar ve Aspiratörler | 295 | 4 |
| Kontrol ve Sürücüler | 37 | 2 |
| Hava Şartlandırma | 17 | 2 |
| Isı Geri Kazanım (VMC) | 16 | 2 |
| Hava Perdeleri | 8 | 1 |
| Aksesuarlar ve Bileşenler | 2 | 1 |
| **Toplam** | **375** | **5** |

Markalar: Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 · Danfoss 35.
**Olgu (karar değil), SON DÜZELTME 09-04 ~10:50 (URUN ölçtü, OPS'un iki önceki notu yanlıştı):** ağaç ataması
`subcategory_id` sütununda yaşıyor; 375 ürünün **365'i alt dala bağlı**, yetim referans 0, üst uyuşmazlığı 0.
Dolu dallar (ürün): Santrifüj/Radyal 83 · Asit Dayanımlı 81 · Kanal Tipi 36 · Frekans Konvertörleri 35 ·
Banyo-Tuvalet 31 · Aksiyel 30 · Çatı Tipi 13 · Duman Egzoz 10 · Kanallı Merkezi VMC 8 · Tekil Oda VMC 8 ·
Sulu Batarya 8 · Endüstriyel Tavan 7 · Elektrikli Kanal Isıtıcı 6 · Sığınak Havalandırma 3 · Nem Alma 3 ·
Hız Anahtarları 2 · Şömine-Baca 1. **Boş dallar (7):** Otopark Jet, Jet Fans, Ex-Proof (ATEX), Cam-Pencere Tipi,
Dikdörtgen Kanal Tipi, İklimlendirme Çözümleri, Kanal İçi Hayalet — boş dal yasağı bunlara uygulanır.
**Dalsız 10 ürün:** 8 Vortice hava perdesi (AD/H AD serisi; Hava Perdeleri kökünün alt dalı yok) + 2 AVenS
BVU-LS aksesuarı. Yani "Sığınak" DOLU (3), 44. maddedeki kök bazlı sayılar geçerli.

## 44 — Katalog geneli ortak sütunlar (Tüm ürünler, 375 ürün üzerinden)

| Sütun | Dolu | % | Sınıf |
|---|---|---|---|
| Faz | 297 | 79 | görünür |
| Güç (W, maks. çekilen) | 279 | 74 | görünür |
| Ağırlık (kg) | 278 | 74 | görünür |
| Gerilim (V) | 274 | 73 | görünür |
| Çap (mm) | 245 | 65 | görünür |
| Debi (m³/h, maks.) | 243 | 65 | görünür |
| IP sınıfı | 209 | 56 | ikincil |
| Devir (d/dk, maks.) | 198 | 53 | ikincil |
| Frekans (Hz) | 193 | 51 | ikincil |
| ErP uyumu | 187 | 50 | ikincil |
| Motor tipi | 180 | 48 | ikincil |
| Yalıtım sınıfı | 173 | 46 | ikincil |
| Statik basınç (Pa, maks.) | 160 | 43 | ikincil |
| Akım (A) | 163 | 43 | ikincil |
| Ses (dB(A)) | 142 | 38 | ikincil |
| Ölçüler A/B/C (mm) | 130 | 35 | ikincil |

Tüm ürünler tablosu varsayılan sütunları: Model · Marka · Kategori · Debi · Güç · Faz · Gerilim · Çap · Ağırlık.
(Debi/Güç/Faz sıralamada öne; Ağırlık sonda.)

## 45 — Grup içi sütunlar (dal/seri sayfaları)

**Fanlar ve Aspiratörler (295):** görünür → Güç 86 · Gerilim 83 · Faz 80 · Çap 79 · Ağırlık 75 · Debi 74 · Devir 67.
İkincil → ErP 55 · Frekans 55 · IP 55 · Debi (l/s) 54 · Motor tipi 54 · Yalıtım 52 · Statik basınç 50 · Akım 47 ·
Eğri 45 · Ses 40 · Ölçüler 40 · Kutup 39. NOT: Statik basınç (%50) ve Ses (%40) mühendisin ilk baktığı iki
değer ama yarıdan az dolu — ikincil ama "Sütunlar" menüsünde EN ÜSTTE dursun; veri hattı dolduğunda görünüre geçer.
Fan varsayılanı: Model · Debi · Statik basınç (ikincil-açık) · Güç · Faz · Çap · Devir · Ses (ikincil-açık).
Seri sayfasında (tek aile, ör. SEAT 40 model) doluluk daha yüksektir; aynı kural aile üzerinden yeniden sayılır.

**Kontrol ve Sürücüler (37):** hepsi %89 → Sürücü kodu · Anma gücü (W) · Anma çıkış akımı (A) · Gerilim aralığı
(min–maks V) · Faz · IP sınıfı · Gövde boyu · Gövde sınıfı · Ağırlık. Varsayılan: Model · Anma gücü · Çıkış akımı ·
Gerilim aralığı · Faz · IP · Gövde boyu.

**Isı Geri Kazanım (16):** hepsi %81 → Debi · Statik basınç · Isıl verim (%) · Filtre sınıfları · Bypass var/yok ·
Güç · Ses · Çap · Faz · Gerilim · IP · ErP · Ağırlık (+ eğriler ürün sayfasında). Varsayılan: Model · Debi ·
Isıl verim · Filtre · Bypass · Güç · Ses.

**Hava Perdeleri (8):** hepsi %100 → Debi · Hava hızı min–maks (m/s) · Devir kademesi · Güç · Ses · Ölçüler A/B/C ·
Faz · Gerilim · Ağırlık · ErP; Isıtma kapasitesi (kW) %50 ikincil. Varsayılan: Model · Genişlik (ölçü A) · Debi ·
Hava hızı maks · Kademe · Isıtma (ikincil-açık) · Ses.

**Hava Şartlandırma (17):** hiçbir sütun %60'ı geçmiyor (Frekans/Gerilim 53, Uyumlu model 47, Isıtma gücü 47,
Anma debi 47, Faz 35). Bu grupta Tablo görünümü ANLAMSIZ: varsayılan Kart, Tablo anahtarı gizli; veri
dolunca açılır. (Ölçüm bunu söylüyor; tahminle sütun uydurulmaz.)

**Aksesuarlar (2):** Uyumlu model %100. İki ürünle tablo çizilmez; Kart. Grup büyüyünce yeniden sayılır.

## 46 — Seri görünümü

Satır = seri/aile (canlıda 40 aile): Seri adı · Marka · Model sayısı · Debi aralığı (min–maks) · Güç aralığı ·
Ses aralığı · "Modelleri gör ▾". Açılınca o serinin Tablo görünümü satır altında açılır. Aralıklar sunucuda
hesaplanır; boş alanlı seride o hücre boş.

## Faz 4'e bırakılanlar (çizilmez)
- Debi/basınç iki uçlu aralık kaydırıcıları.
- Süzülmüş tabloyu CSV/PDF indir.
- Sütun sürükle-sırala.

