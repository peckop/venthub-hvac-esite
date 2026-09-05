# İçerik hattı — 40 ailenin anlatım DERİNLİĞİ (REC-146 Adım 2b·1)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** OPS pano notu 2026-09-05 ("2b BAŞLA: derinlik ölçümü
40 aile — cümle/madde sayısı, dolu blok sayısı → tablo")
**Kapsam:** salt okuma · kod yok · prod yok · **DB'ye yazma yok** · sayılar betikten (PyMuPDF 1.27.2)
**Girdi:** 24 kaynak PDF + AVenS Ürün Fiyat Kataloğu 2026 + canlı DB `products` (40 aile, 375 model)

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok; kaynağı olmayan blok boş kalır.
* Kararlar — Katalog ve Ürün Verisi **K7.4** (boşluk önce raporlanır) · **K7.5** (her tespit kayıt altında).
* Kararlar — Vitrin 15A **K6** (ürün sayfası anlatımı) · **K7** (kaynak yoksa satır yok).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı yapısal blok: Gövde · Çark · Motor · Koruma · Kontrol · Montaj.
* Önceki adımlar: `icerik-hatti-pdf-yapisi-…` (1) · `…-sayfa-araliklari-…` (1b) · `…-bolum-aile-eslemesi-…` (2a)
  · `…-sessiz-bosluk-…` (2a·3). **Bu rapor, o raporun §5.4'te kendi üstüne yazdığı ölçüm borcunu kapatır:**
  *"bu rapor anlatımın **varlığını** ölçtü, **yeterliliğini** ölçmedi."*

---

## 0 · BAŞLIK: kaynak var, ama derinlik markaya göre uçurum

| Sınıf | Aile | Ne demek |
|---|---|---|
| **ZENGİN** | **15** | Altı bloğun 4–6'sı dolu, ≥12 birim. Sayfa bugün yazılabilir. |
| **YETERLİ** | **3** | 3 blok dolu, 5–11 birim. Sayfa yazılır ama yarısı boş kalır. |
| **ZAYIF** | **10** | 1–4 birim. Kimlik cümlesi çıkar, blok çıkmaz. |
| **ÖZEL YOK** | **12** | Kendine ait metni yok; anlatım komşu aileyle **aynı sayfada** — ayrıştırma insan işi. |

**Uçurum marka ekseninde:**

| Marka | Aile | ZENGİN | YETERLİ | ZAYIF | ÖZEL YOK |
|---|---|---|---|---|---|
| Vortice | 21 | **15** | — | 2 | 4 |
| AVenS *(kendi markamız)* | 9 | **0** | 2 | — | **7** |
| Nicotra Gebhardt | 4 | — | — | **4** | — |
| SEAT | 3 | — | 1 | 2 | — |
| Danfoss | 3 | — | — | 2 | 1 |

> **Karara giden cümle:** Vortice ailelerinin anlatımı hazır; **kendi markamız AVenS'in dokuz ailesinin
> yedisinde kendine ait tek cümle yok.** Vitrinde en çok anlatmak isteyeceğimiz ürünler, kaynağı en zayıf
> olanlar. Bu bir malzeme sorunu değil, **AVenS kataloğunun tablo ağırlıklı yazılmış olması**.

**15A çizimlerinin örnek ailesi en zayıf uçta:** SEAT YETERLİ (50 birim), STORM ZAYIF (18), **JET ZAYIF (4)**.

---

## 1 · Ölçüt tanımı (aynen uygulandı)

Metin **blok bazlı** okunur (`get_text("blocks")` = paragraf); blok içi satırlar birleştirilir, tireli
satır sonu onarılır, tablo/kod/altbilgi satırları elenir. Sonra:

* **BİRİM** = *cümle* (nokta/soru/ünlem ile biten, ≥5 kelime) **veya** *madde* (≥4 kelimelik özellik satırı).
* **KELİME** = birimlerin toplam kelime sayısı — derinliğin en az manipüle edilebilir ölçüsü.
* **DOLU BLOK** = altı bloktan birine malzeme veren **en az bir birim**. Tek kelime yetmez.
* Aynı birim birden çok yerde tekrarlıyorsa **bir kez** sayılır.

**İki kova karıştırılmaz:**

* **ÖZEL** — yalnızca bu aileye ait sayfa/bölümden gelen metin. **Sınıf buna göre verilir.**
* **PAYLAŞIK** — aynı sayfayı/bölümü başka aileyle paylaşan metin. Ailenin malı *olabilir*, ayrıştırması
  insan işi. Sınıfa katılmaz, ayrı kolonda gösterilir.

**Sınıf eşikleri:** ZENGİN = ≥12 birim **ve** ≥4 blok · YETERLİ = ≥5 birim **ve** ≥3 blok ·
ZAYIF = ≥1 birim · ÖZEL YOK = 0 birim. Eşikler Systemair kabuğundan türetildi (altı bloğun çoğunu
doldurmak için blok başına en az bir birim gerekir); **keyfîdir, tartışmaya açıktır** — ham sayılar
tabloda durduğu için eşik değişirse sınıf yeniden hesaplanabilir.

---

## 2 · Ölçüt ÜÇ kez düzeltildi — üçü de yayımlanmadan yakalandı

K7.5 gereği hatanın kendisi de kayıttır. Üçü de bugünkü **aynı sınıf**: *ölçüt keskin, evren yanlış.*

| # | Yanlış | Verdiği sonuç | Gerçek | Nasıl yakalandı |
|---|---|---|---|---|
| 1 | "Cümle" diye **PDF satırı** sayıldı | bir aile "515 cümle" | PDF bir cümleyi 5 satıra böler; gerçek ~60 | Çıktıdaki 20 satırı **okudum** |
| 2a | `temizle()` Türkçe **`ı ş ğ ç ö ü` harflerini SİLİYORDU** | `Isıtıcı` → `IS T C`; PDF'teki `ISITICI` ile eşleşmiyor | Türkçe adlı **her aile** etkilendi | "Elektrikli ısıtıcı 0 birim" — oysa s.69'da metni var |
| 2b | EN kanalı 24 PDF'in **yalnız 15'ini** okuyordu | 9 PDF hiç taranmadı | BRA.VO'nun föyü tam o 9'un içinde | "0 birim" çıkan aileyi tek tek açtım |
| 3 | Bölümsüz PDF'te **sayfa jetonu** ile atıf | BRA.VO'ya 16 birim | O metin komşu **aksesuar tablosunun**; BRA.VO'nun gerçek föyü 3 birim | Örneği okuyunca konu tutmadı |

**2a en tehlikelisiydi**, çünkü sessiz: hiçbir hata vermiyor, yalnızca Türkçe ürünler eşleşmiyordu — ve
sonuç "AVenS'in kaynağı yok" gibi görünüyordu. **Aynı `temizle()` fonksiyonu bugünkü önceki adımlarda da
kullanıldı**; o raporların Türkçe aile sayıları bu kusuru taşıyor olabilir (§5'te açık kalem).

**3 numaranın dersi:** dosya→aile bağını *tahmin eden* ölçüt (sayfada model kodu geçiyor mu) iki yönlü
yanılır — kod görselse kaynağı **kaybeder**, komşu tabloda geçiyorsa **yanlış aileye yazar**. Çözüm:
bölüm çıkarılamayan 8 PDF için **dosya düzeyinde hüküm + kanıt** yazıldı (§4).

---

## 3 · 40 ailenin derinlik tablosu

`ÖZEL` = kendine ait birim · `KELİME` = o birimlerin kelime toplamı · `BLOK` = altıdan kaçı dolu ·
`PAYLAŞIK` = komşu aileyle ortak havuzdaki birim (ailenin malı olabilir, ayrıştırılmadı).

| Sınıf | Marka | Aile | ÖZEL | KELİME | BLOK | Dolu bloklar | PAYLAŞIK |
|---|---|---|---|---|---|---|---|
| ZENGİN | Vortice | `vortice-vort-mono` | 729 | 9269 | 5/6 | Gövde·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-isi-geri-kazanim` | 533 | 6342 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-lineo` | 383 | 4657 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | 19 |
| ZENGİN | Vortice | `vortice-vort-quadro-evo` | 195 | 2609 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-vort-heatmaster-slimroof-smoke` | 182 | 2438 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | 19 |
| ZENGİN | Vortice | `vortice-vort-heatmaster-slimroof-roof` | 170 | 2391 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-vort-nordik-hvls` | 166 | 3172 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-vort-e-atex` | 165 | 2684 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | 23 |
| ZENGİN | Vortice | `vortice-vort-qbk-sal-kc-evo` | 160 | 2013 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | 20 |
| ZENGİN | Vortice | `vortice-lineo-quiet` | 131 | 1653 | 5/6 | Gövde·Çark·Motor·Kontrol·Montaj | 21 |
| ZENGİN | Vortice | `vortice-vort-commercial-in-line-circular` | 123 | 1346 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-vort-industrial-ventilation-axial` | 108 | 1969 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | 23 |
| ZENGİN | Vortice | `vortice-punto-evo-flexo` | 107 | 1262 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-vort-commercial-in-line-rectangular` | 90 | 1022 | 6/6 | Gövde·Çark·Motor·Koruma·Kontrol·Montaj | — |
| ZENGİN | Vortice | `vortice-deumido-range` | 60 | 749 | 4/6 | Gövde·Koruma·Kontrol·Montaj | — |
| YETERLİ | SEAT | `seat-serisi` | 50 | 436 | 3/6 | Gövde·Motor·Koruma | — |
| YETERLİ | AVenS | `avens-plug-fanlar` | 34 | 317 | 3/6 | Çark·Motor·Koruma | — |
| YETERLİ | AVenS | `avens-isi-geri-kazanim` | 22 | 231 | 3/6 | Gövde·Kontrol·Montaj | — |
| ZAYIF | SEAT | `storm-serisi` | 18 | 152 | 2/6 | Gövde·Koruma | 21 |
| ZAYIF | SEAT | `jet-serisi` | 4 | 28 | 1/6 | Montaj | 21 |
| ZAYIF | Danfoss | `danfoss-fc101` | 3 | 37 | 1/6 | Kontrol | 32 |
| ZAYIF | Nicotra Gebhardt | `nicotra-gebhardt-at` | 3 | 33 | 1/6 | Çark | — |
| ZAYIF | Vortice | `vortice-vort-industrial-ventilation-roof` | 3 | 28 | 0/6 | — | — |
| ZAYIF | Vortice | `vortice-vortice-bravo-s` | 3 | 32 | 0/6 | — | — |
| ZAYIF | Danfoss | `danfoss-fc102` | 2 | 31 | 0/6 | — | — |
| ZAYIF | Nicotra Gebhardt | `nicotra-gebhardt-adh` | 2 | 27 | 1/6 | Çark | — |
| ZAYIF | Nicotra Gebhardt | `nicotra-gebhardt-dd` | 2 | 33 | 2/6 | Çark·Motor | — |
| ZAYIF | Nicotra Gebhardt | `nicotra-gebhardt-rdh` | 2 | 29 | 1/6 | Çark | — |
| ÖZEL YOK | AVenS | `avens-bvu-ls` | 0 | 0 | 0/6 | — | 4 |
| ÖZEL YOK | AVenS | `avens-elektrikli-isiticilar` | 0 | 0 | 0/6 | — | 17 |
| ÖZEL YOK | AVenS | `avens-hiz-anahtarlari` | 0 | 0 | 0/6 | — | 32 |
| ÖZEL YOK | AVenS | `avens-hucreli-aspiratorler` | 0 | 0 | 0/6 | — | 17 |
| ÖZEL YOK | AVenS | `avens-hucreli-hf-s` | 0 | 0 | 0/6 | — | 17 |
| ÖZEL YOK | AVenS | `avens-siginak-havalandirma-uniteleri` | 0 | 0 | 0/6 | — | 4 |
| ÖZEL YOK | AVenS | `avens-sulu-batarya` | 0 | 0 | 0/6 | — | 17 |
| ÖZEL YOK | Danfoss | `danfoss-fc51` | 0 | 0 | 0/6 | — | 39 |
| ÖZEL YOK | Vortice | `vortice-h-ad-elektrikli` | 0 | 0 | 0/6 | — | 46 |
| ÖZEL YOK | Vortice | `vortice-hava-perdesi` | 0 | 0 | 0/6 | — | 46 |
| ÖZEL YOK | Vortice | `vortice-radon-range-circular` | 0 | 0 | 0/6 | — | 103 |
| ÖZEL YOK | Vortice | `vortice-radon-range-roof` | 0 | 0 | 0/6 | — | 103 |

**Toplam:** 3.450 özel birim / 44.990 kelime. ÖZEL YOK sınıfındaki 12 ailenin paylaşık havuzunda
**445 birim** bekliyor — hepsi kayıp değil, **sahibi belirsiz**.

---

## 4 · Bölüm çıkarılamayan 8 PDF: dosya→aile hükümleri

Adım 1b'de bu 8 PDF'ten yapısal bölüm çıkarılamamıştı ve "tek aileli oldukları için tüm belge o ailenindir"
**varsayılmış ama doğrulanmamıştı**. Doğrulandı:

| PDF | Hüküm | Kanıt |
|---|---|---|
| `nordik-hvls-industrial-ceiling-fans-181471.pdf` | → `vortice-vort-nordik-hvls` | kapak "NORDIK HVLS HYPERBLADE" = DB modelleri |
| `qbk-sal-kc-evo-en-yeni-2025.pdf` | → `vortice-vort-qbk-sal-kc-evo` | kapak "VORT QBK SAL-KC EVO" = DB modelleri |
| `vortice_vort_mono_range_new.pdf` | → `vortice-vort-mono` | içerikte HRW 30/40/60 MONO 55 kez |
| `vortice-brochure-mev.pdf` | **DIŞLANDI (mükerrer)** | üsttekiyle **birebir aynı dosya**, md5 `1722110df8` — adı yanıltıcı |
| `vortice-bravo-s.pdf` | → `vortice-vortice-bravo-s` | tek sayfalık föy; **model kodu metinde yok, görsel** |
| `nrg-range-175696-isi-geri-kazanim.pdf` | aile YOK | VORT NGR FLAT EVO/MEGA — DB'de NGR modeli yok |
| `vort-hr-w-all-100-df.pdf` | aile YOK | VORT HR W-ALL 100 DF — DB'de W-ALL modeli yok |
| `Why-Ventilate-Brochure.pdf` | aile YOK | ürün belgesi değil, genel tanıtım |

> **Kayıt altına alınan iki yan bulgu:**
> 1. **Mükerrer dosya:** `vortice-brochure-mev.pdf` = `vortice_vort_mono_range_new.pdf`. Adı "MEV" diyor,
>    içeriği VORT HRW MONO. Kim bakarsa MEV serisi sanır. Deponun temizliği bizim işimiz değil ama
>    **kaydı burada duruyor**.
> 2. **BRA.VO S bir fan değil, hava kalitesi sensörü** ("It is an air quality meter, capable to detect the
>    presence of pollutants in the environment"). Adım 2a·3'te not edilmişti; ölçümle doğrulandı.
>    Toplam kaynağı **3 birim / 32 kelime** — dört modelin farkını anlatan liste **görsel**, metinde yok.

---

## 5 · Adım 2b·2'ye (taslak yazımı) etkisi

1. **Bugün yazılabilir: 18 aile** (15 ZENGİN + 3 YETERLİ). Bunların 15'i Vortice, **EN kaynaklı → çeviri
   gerekir**; 3'ü (SEAT, AVenS plug fan, AVenS ısı geri kazanım) Türkçe kaynaklı.
2. **Ayrıştırma bekleyen 12 aile** (ÖZEL YOK). Bunlar için gereken şey **yeni kaynak değil**, komşu ailenin
   sayfasındaki metni doğru aileye bölmek. İnsan işi, ama küçük: ortalama 37 birim/aile.
   En büyük ikisi radon kanal/çatı (103 birim, sınırı Adım 2a·3'te s.23/s.24 diye çözülmüştü).
3. **K7.3 web araştırması: 10 ZAYIF aile için gerekli**, diğerleri için değil. Öncelik sırası bu rapora
   göre kurulmalı — özellikle **Nicotra Gebhardt'ın dördü** (aile başına 2–3 birim) ve **JET (4 birim)**.
4. **Çark ve Kontrol blokları** ZAYIF ailelerin hiçbirinde dolu değil; ZENGİN ailelerin 13'ünde dolu.
   Boşluk kaynakta, bizde değil.
5. **AVenS için ayrı karar gerekebilir:** kendi markamızın anlatımı kaynakta yok. Seçenekler — (a) AVenS'ten
   teknik föy istemek, (b) kendi metnimizi yazıp `is_description_manual` ile işaretlemek. **Bu bir ticari
   karar, ölçümle çözülmez; Recep'e gider.**

---

## 6 · Ölçülemeyenler (uydurulmadı)

* **Anlatımın DOĞRULUĞU ölçülmedi** — bu rapor hacim ölçtü. Kaynak yanlış olabilir (AVenS kataloğunda
  iki hata bulundu: `icerik-hatti-avens-katalog-hatalari-2026-09-05.md`).
* **Anlatımın GÜNCELLİĞİ ölçülmedi** — 2026 baskısı, ürün revizyonu olabilir.
* **Görsel içindeki metin okunmadı.** BRA.VO'nun dört modelini ayıran liste görsel olduğu için sayılamadı;
  aynı durum başka ailelerde de olabilir — **ölçülmedi**.
* **Blok eşleştirmesi anahtar kelimeye dayanır**, anlama değil. "panel" geçen bir cümle Kontrol'e sayılır;
  bağlamı kontrol paneli mi ön panel mi, ayırt edilmez. Blok sayıları **üst sınır** okunmalı.
* **Önceki adımların Türkçe sayıları** §2/2a'daki `temizle()` kusurundan etkilenmiş olabilir; bu raporun
  sayıları düzeltilmiş fonksiyonla üretildi, **öncekiler yeniden koşulmadı**.
* Paylaşık havuzdaki 445 birimin aileler arası dağılımı **ayrıştırılmadı**.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-05
