# Seri açıklaması tek modelin verisini taşıyor — 10 aile / 109 ürün (canlı)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Bulundu:** REC-146 Adım 2b·2 sırasında, Heatmaster/Slimroof
taslağı için mevcut metinler okunurken
**Kapsam:** salt okuma · kod yok · prod yazımı yok · sayılar **canlı DB'den**, betikten değil elle SQL ile
(bu bir keşif ölçümüdür; karara giden sayı üretilirse betiğe bağlanmalı)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — ürün hakkında **yanlış kapsamlı** bilgi vermek de vaat ihlalidir.
* Kararlar — Katalog ve Ürün Verisi **K7.5** (her tespit kayıtta).
* `scripts/db/product-data/vortice-lineo-descriptions.json` `_kusur` alanı — **bu kusur 2026-08-21'de
  zaten tespit edilmiş**: *"T138 model bölme pilotunda model aileleri yaratılırken SERİ açıklaması
  olduğu gibi KOPYALANDI."* Düzeltme **yalnız Lineo ailesine** uygulanmış; bu rapor kalanını ölçüyor.

---

## 0 · BAŞLIK

Vitrinde **10 ürün ailesinin** açıklaması, o ailedeki **tek bir modelin** verisini serinin tamamıymış
gibi sunuyor. Metin yanlış değil — **kapsamı** yanlış. Bu, "Tier C" kusurundan daha sinsidir: o metin
bakınca anlamsız olduğu belliydi, bu metin **doğru görünüyor**.

| | |
|---|---|
| Etkilenen aile | **10** |
| Etkilenen ürün sayfası | **109** |
| Kusurun kaynağı | T138 model bölme pilotu (2026-08-21), seri açıklamasının modelden kopyalanması |
| Daha önce düzeltilen | yalnız `vortice-lineo-quiet` (T141/T149) |

**En ağır iki örnek — kendi ürünümüzü küçültüyoruz:**

| Aile | Metin ne diyor | DB'deki gerçek aralık | Kat |
|---|---|---|---|
| `vortice-vort-heatmaster-slimroof-roof` | "Nominal debisi **460 m³/h**" | 460 – **18.600** m³/h | **40,4×** |
| `vortice-vort-heatmaster-slimroof-smoke` | "**Maksimum** debisi **2580 m³/h**" | 2.580 – **22.550** m³/h | **8,7×** |

İkincisinde sözcük özellikle yanlış: metin **"maksimum"** diyor, oysa yazılan sayı serinin **en küçük**
modelinin debisi. Müşteri 22.550 m³/h'lik bir seriyi 2.580 m³/h sanıyor.

---

## 1 · Ölçüm: üç eksende tarandı

Ölçüt: ailenin açıklama metni, o ailede **birden çok değer varken tek bir değeri** anıyor mu.
`Tier C` şablonlu 11 aile bu taramanın **dışında** tutuldu (onlar ayrı kalem, REC-155).

| Aile | Ürün | Tek çap yazılı | Tek debi yazılı | Tek faz yazılı |
|---|---|---|---|---|
| `avens-plug-fanlar` | 14 | ✔ | | ✔ |
| `vortice-punto-evo-flexo` | 4 | ✔ | | |
| `vortice-vort-commercial-in-line-rectangular` | 5 | | | ✔ |
| `vortice-vort-e-atex` | 14 | ✔ | | ✔ |
| `vortice-vort-heatmaster-slimroof-roof` | 10 | | ✔ | ✔ |
| `vortice-vort-heatmaster-slimroof-smoke` | 10 | | ✔ | ✔ |
| `vortice-vort-industrial-ventilation-axial` | 16 | | | ✔ |
| `vortice-vort-mono` | 8 | | ✔ | |
| `vortice-vort-nordik-hvls` | 7 | | | ✔ |
| `vortice-vort-qbk-sal-kc-evo` | 21 | ✔ | | ✔ |
| **TOPLAM** | **109** | 4 | 3 | 8 |

### Örnekler

* **Çap:** `vortice-vort-qbk-sal-kc-evo` metni "315 mm nominal çaplı" diyor; seride **7 farklı çap** var,
  315 – 630 mm. Müşteri 630'luk ararken bu sayfayı eler.
* **Faz:** `vortice-vort-heatmaster-slimroof-smoke` metni "monofaze model" diyor; seride **3 monofaze
  ve 7 trifaze** model var — yani çoğunluk görünmez.
  Aynı kusur ters yönde de var: `vortice-vort-qbk-sal-kc-evo` "trifaze" diyor, 3 monofaze modeli gizliyor.
* **Ürün adı:** `vortice-isi-geri-kazanim` seri metni doğrudan **tek bir ürünün adıyla** başlıyor
  ("Vortice Vort Invisible Mini Top…"), oysa ailede 5 ürün var. *(Bu aile yukarıdaki tabloya girmedi —
  ölçütüm sayı arıyordu, ad aramıyordu; §4'te açık kalem.)*

---

## 2 · Niçin bu kusur "Tier C"den daha tehlikeli

| | "Tier C" (REC-155) | Bu kusur |
|---|---|---|
| Metin | anlamsız, bakınca belli | **anlamlı, doğru görünüyor** |
| Fark edilme | ilk bakışta | ancak veriyle karşılaştırınca |
| Zarar | müşteri hiçbir şey öğrenmiyor | müşteri **yanlış** şey öğreniyor |
| Arama motoru | boş içerik | **yanlış kapasiteyle** indeksleme |

Bir sayfanın "açıklaması var" olması, o açıklamanın **o sayfayı anlattığı** anlamına gelmiyor.
Derinlik ölçümüm (2b·1) bu kusuru **göremedi**, çünkü o ölçüm kaynağın hacmini ölçüyordu,
DB'ye yazılmış metnin kapsamını değil. **İki ayrı soru: "yazacak malzeme var mı" ve "yazılmış olan doğru mu".**

---

## 3 · Öneri (uygulanmadı — karar Recep'te)

1. **Bu 10 aile, REC-146 2b·2 taslak sırasında zaten yeniden yazılıyor.** Ayrı bir düzeltme turu
   açmaya gerek yok; taslaklar aralık vererek yazılıyor (Heatmaster/Slimroof taslağında uygulandı).
2. **Kalıcı çözüm bir kapıdır, metin düzeltmesi değil.** Öneri: aile açıklamasında geçen sayısal
   değer, ailenin ürünlerinden **türetilmiş bir aralık** değilse konformans testi KIRMIZI versin.
   Örnek kural: *"seri metni tek bir modelin çapını/debisini anıyorsa ve ailede birden çok değer varsa"*.
   Bu testin yeri `src/__tests__/conformance/` — **URUN şeridinin claim'i**, bu şerit yazamaz.
3. **Sıra:** Tier C temizliği (REC-155, onaylı) → 2b·2 taslakları → kapı. Kapı olmadan üçüncü kez
   aynı kusur doğar; T138'de doğdu, T141'de yarım düzeltildi, bugün kalanı bulundu.

---

## 4 · Ölçülemeyenler / ölçütümün sınırı (uydurulmadı)

* **Ölçüt sayı arıyor, ad aramıyor.** `vortice-isi-geri-kazanim` gibi seri metnini tek ürün **adıyla**
  başlatan aileler bu taramaya takılmadı; §1 tablosu **alt sınırdır**, gerçek sayı daha yüksek olabilir.
* **Yalnız üç eksen tarandı:** çap, debi, faz. Kutup sayısı, güç (kW), koruma sınıfı, ses seviyesi
  **taranmadı** — aynı kusur oralarda da olabilir.
* **`technical_specs` alanı kirli:** `max_delivery_m3h` bazı kayıtlarda sayı yerine metin taşıyor
  (`"6530 m³/h"`). Sorgu buna dayanıklı yazıldı ama **alan adı birimi taahhüt ederken değerin birim
  taşıması ayrı bir kusurdur** — kaç kayıtta olduğu **ölçülmedi**, ayrı iş.
* **EN metinler yalnız faz ekseninde tarandı**, çap/debi ekseninde taranmadı.
* Bu ölçüm **elle SQL** ile yapıldı; karara giden sayı üretilecekse betiğe bağlanmalı
  (→ `olcut-dogru-evren-yanlis-is-emri-dogurur`).

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
