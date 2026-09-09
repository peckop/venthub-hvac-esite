# Red Team: AVenS CSV yeniden üretim planı (2026-09-09)

> Bağımsız denetim. Görev: planı **çürütmek**. Kod/veri ile çelişen her iddiada **KOD KAZANIR**.
> Salt-okuma; bu rapor dışında hiçbir dosya değiştirilmedi, DB'ye yazılmadı.

## 1. Metodoloji — ne ölçtüm, hangi evrende

| ne | değer | nasıl |
|---|---|---|
| `sayfalar.jsonl` toplam satır | **2127** | satır sayımı |
| dizindeki tekil belge | **58** | `dosya` alanı tekilleştirildi |
| AVenS fiyat listesi sayfası | **74** | `dosya` içinde `avens_fiyat_listesi_2026_HQ` |
| AVenS tablosu | **148** | `tablo` listesi uzunlukları toplamı |
| başlık **satır 0**'ında `KOD` geçen tablo | **79** | planın evreni |
| başlık satır 0'ında `KOD` geçmeyen tablo | **69** | iddia (1)'in evreni |
| CSV satır / tekil `model_code` / boş `model_code` | **484 / 484 / 0** | `csv.DictReader`, `;`, BOM |

Arama evreni her testte açıkça yazıldı. Kod arama **hem `metin` hem `tablo` hücrelerinde**,
alfanümerik sınır koruması ile ve ayrıca **sınırsız ham alt-dize** ile iki kez koşuldu.

**Ölçemediğim:** (a) prod DB'deki `VRT-16076…16080` kayıtlarının canlı durumu — plan DB'yi kapsam
dışı bırakıyor ve bu denetim salt-okuma; (b) görsel çoklu-ajan çıkarımının gerçek koşum davranışı —
`visual_ingest_page.py` reçetede "ölü anahtara bağlı" diye işaretli, koşturmadım.

---

## 2. Çürütmeler

### 2.1 "Kaynak eksik değil, ölçütüm dardı" — 69 başlıksız tablo ürün taşımıyor

* **İddia (plan §1b):** *"Başlığında `KOD` olmayan 69 tablo incelendi: **GİRİŞ, İÇİNDEKİLER** gibi
  düzen tabloları. **Ürün taşımıyorlar.**"*
* **Bulgu:** Bu bir **örneklemedir ve yanlıştır**. 69'un **hepsini** taradım (4'ünü değil).
  **12 tanesi** ürün+fiyat satırı taşıyor, toplam **103 satır**. Dahası bunların **3'ünde
  (s.42, s.43, s.18) `KOD` sütunu HİÇ YOKTUR** — yani "başlık kaymış" açıklaması da onları
  kurtarmıyor; bunlar tam ürün aileleridir (STORM, JET).
* **Somut kanıt:**

  | sayfa | tablo | satır | ürün/fiyat satırı | başlık durumu | örnek satır |
  |---|---|---|---|---|---|
  | 41 | t1 | 29 | **27** | başlık **1. satırda** | `51152010 \| SEAT 15 \| 8.3 \| 220 V \| 0,25 \| 1400 \| 828` |
  | **42** | t0 | 14 | **13** | `MODEL AĞIRLIK MOTOR kW RPM FİYAT (Euro)` — **KOD sütunu YOK** | `STORM 10 XRM (*) \| 2.10 \| 220 V \| 0,06 \| 1400 \| 1.025` |
  | **43** | t0 | 15 | **14** | `MODEL AĞIRLIK MOTOR kW RPM FİYAT (Euro)` — **KOD sütunu YOK** | `JET 20 \| 35.0 \| 220 V \| 0,18 \| 1400 \| 2.791` |
  | 48 | t1 | 17 | **15** | başlık 1. satırda | `NX313290 \| NIMAX 314 T2 1,5kW \| 5240 m³/h \| 1818` |
  | 68 | t1 | 11 | **9** | başlık 1. satırda | `13010 \| AVenS 750 ISI GERİ KAZANIM \| 750 m³/h \| 3kW \| 1838` |
  | 13 | t2,t3 | 5+11 | **6** | başlık 1./3. satırda | `11201 \| \| M 100/4" PUNTO \| \| 90 m3/h \| 32` |
  | 16,17,29,68t2 | — | — | 10 | ölçü/boyut tabloları — ürün **değil**, doğru elenir | `VORTICE 150/6" \| 215 \| 218 \| …` |

  Ölçüt genişletildiğinde (başlık satırını **ilk 4 satırda** ara) evren değişiyor:
  **tekil kaynak kodu 442 → 498**, **alfanümerik kod 35 → 50**,
  "CSV'de var kaynakta yok" **101 → 60**.
* **Hüküm:** ⛔**ÇÜRÜDÜ.** "Ürün taşımıyorlar" cümlesi ölçülmemiş bir genellemedir; 69'un 12'si
  ürün taşıyor. Planın §1b'deki *"kaynak eksik değil"* rahatlaması bu evrende geçersizdir —
  ölçüt gerçekten dardı, ama plan darlığın **boyutunu** ölçmeden "çözüldü, sorun değil" ilan etti.
* **Risk:** **Yüksek.** Plan bu satıra dayanarak kaynak tarafında iş kalmadığını varsayıyor; oysa
  çıkarım aracının **KOD sütunu olmayan tablolarda ne yapacağı** (s.42/43) tanımsız — ve bu tam
  olarak §1a'daki uydurma-kod kusurunu doğuran koşuldur.

---

### 2.2 "16076–16080 uydurma kod"

* **İddia (plan §1a):** Bu beş kod 58 belgenin hiçbirinde geçmiyor, ardışık, çıkarım aracı üretti.
* **Bulgu:** Çürütmeye çalıştım, **çürütemedim — iddia GÜÇLENDİ.** Dört testin dördü de doğruladı:
  * **(a) `metin` + `tablo` ikisi de tarandı:** 58 belge × iki alan → **0 isabet.**
  * **(b) Sınırsız ham alt-dize** (fiyat/debi/kcal içine gömülü geçme ihtimali):
    `16076`…`16080` için `str.count` toplamı = **0**. Başka bağlamda dahi geçmiyorlar.
  * **(c) 16xxx bloğu karşılaştırması — planın yapmadığı, iddiayı asıl sağlamlaştıran test:**
    CSV'de **18** adet `16\d{3}` kodu var. **13'ü kaynakta hem metinde hem tabloda mevcut**;
    yalnız **5'i (tam olarak 16076–16080) yok**. "Tüm blok başka kaynaktan geldi" alternatifi **elendi**.

    | kod | metin isabeti (58 belge) | tablo isabeti | AVenS sayfası |
    |---|---|---|---|
    | **16076–16080** | **0** | **0** | — |
    | 16100 | 2 | 2 | 33, 49 |
    | 16107 / 16108 / 16109 | 3 | 3 | 25 |
    | 16140 / 16141 / 16183 / 16185 / 16186 | 6 | 3 | 32 |
    | 16153 / 16155 / 16156 / 16157 | 7–8 | 6–7 | 25 |

  * **(d) İki yönlü kilit:** Tüm CSV'yi (484 kod) kaynağın **metin+tablo** birleşimine karşı taradım:
    kaynağın hiçbir yerinde geçmeyen CSV kodu sayısı **tam olarak 5** — ve bunlar aynı beş koddur.
    Karşı yönde, kaynakta kodu **hiçbir yerde bulunmayan** ürün satırı sayısı da **tam olarak 5**:
    s.26'nın `CA IL 4020/5035/6040/7050/8060 ES RECT` satırları. **1:1 örtüşüyor.**
  * s.26 ham veri iddiayı kelimesi kelimesine doğruluyor:
    başlık `['KOD','MODEL','DEBİ','HIZ ANAHTARI','FİYAT (Euro)']`,
    satır `['','CA IL 4020 ES RECT','715 m³/h','POT (REGC)','664']` — aynı tabloda
    `['12828','POT (REGC) Ec motor hız anahtarı','','','112']` var, yani kod sütunu çalışıyor,
    sadece bu beş satırda **boş**. Sayfanın `metin` alanında da bu beş ürünün yanında kod yok
    (s.26 metninde geçen 5–9 haneli tek sayılar: 12828, 12992, 12993, 12994, 12998, 12999).
* **Hüküm:** ✅**İDDİA AYAKTA** (planın verdiğinden daha güçlü kanıtla).
* **Risk:** **Kritik** (müşteriye görünen uydurma veri) — bu planın hatası değil, doğru teşhisi.
* **⚠Ek uyarı (planın kaçırdığı):** Bu beş, uydurma kodun **tek örneği** olduğu için değil,
  **tek YAKALANABİLEN örneği** olduğu için beştir. s.42/43'te tablo çıkarımı KOD sütununu tümüyle
  düşürmüş; oradaki 27 ürünün kodu (`61102000`, `71201000`…) CSV'ye **sayfa metninden** girmiş
  (ölçüldü: "sadece metinde var, tabloda yok" = **29 kod**). Aynı araç, aynı kataloğun bir
  sayfasında kodu metinden alabiliyorken s.26'da **üretmeyi** seçmiş. Planın kök-neden cümlesi
  *"boş sütunu görüp numara üretmiş"* eksiktir: araç **önce metne bakmayı denemedi**.
  Onarım bu ayrımı kapsamazsa aynı kusur başka sayfada tekrarlar.

---

### 2.3 Bitti ölçütü ULAŞILABİLİR Mİ? — Ulaşılabilir ama ANLAMSIZ

* **İddia (plan §2):** *"CSV kod kümesi == kaynak kod kümesi → fark 0 (iki yönde)"* — aynı planda
  *"kodsuz ürün KOD UYDURMAZ, `model_code` boş kalır"* (§2 madde 3).
* **Bulgu — üç ayrı kusur:**

  **(A) Ölçüt kendi hedefine kördür (sayı ile).** Kaynakta kodu hiçbir yerde bulunmayan ürün
  satırı = **5** (s.26 CA IL). Plan bunları boş `model_code` ile yazacak. Boş kod kümeye girmez →
  her iki tarafta da yoklar → **fark 0 hesaplanır**. Yani ölçüt, **planın var oluş sebebi olan
  5 ürünü ölçmez**. Bu 5 ürün CSV'den tamamen düşse de ölçüt yine **fark 0** verir.
  Bugünkü CSV'de boş `model_code` = **0/484** olduğundan bu, şu an görünmeyen ama plan uygulandığı
  anda açılacak bir deliktir.

  **(B) Ölçütün sağ tarafı ("kaynak kod kümesi") tanımsız bir büyüklüktür.** Aynı `sayfalar.jsonl`
  üzerinde yalnız başlık-arama penceresini değiştirdim:

  | evren | tekil kaynak kodu | alfanümerik | kaynak\CSV | CSV\kaynak |
  |---|---|---|---|---|
  | başlık = **satır 0** (planın / ölçüm belgesinin evreni) | **442** | 35 | 59 | 101 |
  | başlık = **ilk 4 satırda ara** | **498** | 50 | 74 | 60 |

  **56 kodluk fark, tek bir parametreden.** "Fark 0" ölçütü, karşılaştırdığı kümenin nasıl
  çıkarılacağını sabitlemedikçe **koşana göre değişen** bir sayıdır — kapı değil, görüştür.

  **(C) Plan kendi cetveliyle çelişiyor — KOD KAZANIR.** Plan çıkarım cetveli olarak
  `.agent/skills/venthub-catalog-importer/SKILL.md`'yi gösteriyor. O dosyanın "Kritik kurallar"
  bölümü, satır 97, aynen:

  > `❌ model_code boş bırakma (köprü); eksik/şüpheli = null + confidence != ok.`

  Planın 3. maddesi (`model_code` **boş kalır**) bu kuralı **doğrudan ihlal eder**. Cetvel boş
  bırakmayı değil `null + confidence` işaretlemesini emrediyor ve gerekçesini de veriyor:
  `model_code` **köprüdür** — spec↔ticaret birleştirmesinin join anahtarı (SKILL "Ticaret
  birleştirme" bölümü: *"model_code ile eşle"*). Ayrıca CSV şeması bunu **taşıyamaz**: mevcut
  sütunlar `model_code;model_name;price_eur;avensair_section;page_num` — **`confidence` sütunu
  YOK**, planın önerdiği `kod_kaynakta_yok: true` işaretinin gideceği **hiçbir alan yok**.
  Bu, planın §3'teki "A. Kodu boşalt, ürünü tut" seçeneğini de etkiler: boşaltılan alan bir köprüdür.

* **Somut kanıt:** 5 kodsuz ürün satırı (s.26); 442 vs 498 tekil kod (aynı dosya, tek parametre);
  CSV 5 sütun, `confidence` yok; `SKILL.md:97` yasak maddesi; boş `model_code` = 0/484.
* **Hüküm:** ⛔**ÇÜRÜDÜ.** Ölçüt ulaşılabilir ama anlamsız: sağlanması ürün kaybını dışlamıyor,
  ve ölçütü sağlamak için gereken davranış (boş kod) yürürlükteki cetvel tarafından yasaklanmış.
* **Risk:** **Yüksek.**

---

### 2.4 "Yeni çıktı ayrı dosyaya yazılır, ölçütler geçince yerine konur" — KAPI DEĞİL, NİYET

* **İddia (plan §4):** Veri kaybı riski bu usulle kapatıldı.
* **Bulgu:** Mekanizma **yok**. `cikti_tazelik.py`'nin (280 satır) `main()`'i tek bir şey ölçüyor:
  **çıktının son commit tarihi < en yeni girdinin son commit tarihi mi.** İçerikle ilgili tek
  denetim `damga_gecerli()`'deki sha256'dır ve o da başında şu satırla kapanıyor
  (`cikti_tazelik.py:129-130`):

  ```python
  if not kalem.get("determinist"):
      return False, "kalem determinist degil — damga kabul edilmez, arac kosulmali"
  ```

  `avensair-fiyat.csv` reçetede `"determinist": false` olduğundan **sha256 yolu hiç çalışmaz**.
  Geriye **saf tarih karşılaştırması** kalır. Sonuç: yeni CSV commit'lendiği **an** kapı YEŞİL olur —
  dosya boş, kırpılmış, 5 ürün eksik ya da 27 uydurma kodlu olsa bile. Bu, planın korkusunu
  duyurduğu *"dizin 2127→74"* kayıp sınıfının **tam olarak** kapının göremediği sınıftır.

  Üç ek delik ölçüldü:

  1. **Reçetenin girdileri yanlış yerde.** `ciktilar[0].girdiler` =
     `[".../01-input", ".agent/skills/venthub-catalog-importer/SKILL.md"]`.
     Planın *kaynağı* olan **`kaynak-dizini/sayfalar.jsonl` girdi listesinde YOK.** Dizin yeniden
     çıkarılıp içerik değişirse CSV bayat ilan **edilmez**.
  2. **Kardeş çıktılar kapısız.** `03-output/` altında **3 CSV** var
     (`avensair-fiyat.csv`, `avens_fiyat_listesi_2026_HQ.csv`, `avensair_ekstra_urunler_2026.csv`);
     reçetede tanımlı kalem sayısı **2** ve bunlardan biri `sayfalar.jsonl` — yani üç CSV'den
     **yalnız 1'i** kapı altında. Plan yalnız `avensair-fiyat.csv`'yi yeniliyor; diğer ikisi
     2026-06-22 tarihli ve hiçbir kapı onlara bakmıyor. `ekstra` dosyasının 204 kodunun **204'ü de**
     ana CSV'nin içinde (`ekstra\ana = 0`), yani plan sonrası bu iki dosya sessizce **eski kod
     evrenini** taşımaya devam eder.
  3. **Reçete metni de bayat.** `⛔acik_kalem_icerik_tazeligi` alanı hâlâ
     *"AVenS fiyat listesi PDF'i KAYNAK DIZININDE YOK"* diyor — ölçüm belgesi (§Hüküm 2) bunu
     **düzeltilmiş** ilan etti (74 sayfa dizinde). Kapının okuduğu belge, kapının gerekçesini
     yanlış anlatıyor.
* **Somut kanıt:** `scripts/kaynak_dizini/cikti_tazelik.py:129-130` ve `:186-240` (tarih
  karşılaştırması); `uretim-recetesi.json` → `ciktilar[0].girdiler` (2 kalem, `sayfalar.jsonl` yok),
  `determinist: false`; `ls 03-output/` = 3 dosya, reçetede 1; planın "ayrı dosya / ölçüt geçince
  yerine koy" kuralı için `.py`/`.yml`/`.yaml` içinde arama → **0 isabet.**
* **Hüküm:** ⛔**ÇÜRÜDÜ.** Plan "kural" yazmış, **mekanizma yazmamış**. Kuralı uygulayacak olan,
  kuralı yazan kişinin o günkü dikkatidir — bu bir kapı değildir.
* **Risk:** **Kritik.**

---

### 2.5 Determinist olmayan çıkarımda "kod kümesi eşitliği" — AYIRT ETMİYOR (ölçüldü)

* **İddia (plan §4):** *"Kabul ölçütü byte-eşitlik değil, **kod kümesi eşitliği**."*
* **Bulgu:** Bunu varsayımla değil, **elimdeki gerçek dosyalarla** gösterebiliyorum.
  `avensair-fiyat.csv` ↔ `avens_fiyat_listesi_2026_HQ.csv`:

  | ölçüt | sonuç |
  |---|---|
  | kod kümesi farkı (iki yönde) | **0 / 0** — planın ölçütü **YEŞİL** verir |
  | satır sayısı | 484 / 484 |
  | **sütun sayısı** | **5 / 12** — HQ'da `spec_airflow_m3h, spec_speed_controller, spec_rpm, spec_current_a, spec_power_kw, spec_voltage, spec_weight_kg` fazladan |
  | dosya boyutu | **33 701 B / 42 174 B** (fark 8 473 B) |

  İki dosya **7 sütunluk veri farkı** taşıyor ve planın kabul ölçütü ikisini **ayırt edemiyor**.
  Ölçüt `model_name` ve `price_eur` alanlarına **hiç bakmıyor**: 484 satır × 2 kritik alan =
  **968 hücre ölçütün kör noktasında**, ve `price_eur` doğrudan müşteriye giden fiyattır.
  İki koşum aynı kodları farklı fiyatla üretirse kapı yine YEŞİL verir — planın *kendi* uyarısı
  ("çıkarım deterministik değil") tam da bu senaryoyu olası kılıyor.
* **Planın "sabotaj kolu"nun da sınırı var:** *"kaynağa elle sahte bir kod eklenirse kapı kırmızı
  vermeli"* — bu yalnız **kod** eksenini sınar. Fiyat/ad sabotajını (bir rakamı değiştir) mevcut
  ölçüt **göremez**, çünkü ölçütte fiyat yok.
* **Hüküm:** ⛔**ÇÜRÜDÜ.** "Byte-eşitlik değil" doğru bir teşhis, ama yerine konan şey kapı değil.
* **Risk:** **Yüksek.**

---

## 3. Öneriler (somut, ölçülebilir)

1. **§1b'yi sil, yerine ölçülmüş envanter koy.** "69 tablo düzen tablosudur" yanlıştır. Yaz:
   *12 tablo ürün taşıyor (103 satır); 3'ünde (s.18/42/43) KOD sütunu HİÇ yok.*
   **Kabul:** plan, s.42 ve s.43'ün (STORM/JET, 27 ürün) hangi yolla çıkarılacağını **adıyla** söylesin.

2. **Bitti ölçütünü ÜRÜN sayısına bağla, koda değil.** Dört ölçüt birlikte, hepsi sayı:

   ```
   (a) kaynak ürün satırı sayısı  ==  CSV satır sayısı              → fark 0
   (b) kaynakta bulunmayan CSV kodu (metin+tablo, 58 belge)         == 0    [bugün 5]
   (c) alfanümerik kod sayısı                                       >= 50   [bugün 0; kaynakta 50]
   (d) kodsuz ürün: CSV'de satır VAR, model_code null,
       confidence != ok, kaynak sayfası yazılı                      == 5    [s.26 CA IL]
   ```

   (d) şıkkı ölçütün kör noktasını **sayıya çevirir**: 5 beklenip 5 bulunmalı; 0 bulunursa ürün düşmüştür.

3. **Sağ tarafı sabitle.** "Kaynak kod kümesi" bir betikle üretilsin (`scripts/kaynak_kod_kumesi.py`),
   çıktısı commit'lensin ve sürümlensin. Sabitlenmeden 442 mi 498 mi belli değildir — **56 kod farkı ölçüldü.**

4. **`SKILL.md:97` çelişkisini plan koşulmadan ÖNCE çöz.** Plan `model_code` **boş** diyor,
   SKILL boş bırakmayı **yasaklıyor** ve `null + confidence != ok` emrediyor. İkisinden biri
   değişmeli. **KOD KAZANIR → SKILL'in dediği yapılır.** Bu, CSV şemasına **`confidence` ve
   `kod_kaynakta_yok` sütunu eklemeyi** gerektirir (bugün 5 sütun var, ikisi de yok) →
   `csv-import-export-standard.md` + `product-schema-standard.md` şema değişikliği; planın
   kapsamında **görünmüyor**, kapsama alınmalı.

5. **§1a'nın kök-neden cümlesini düzelt.** "Boş sütunu görüp numara üretti" eksik. Ölçüm:
   **29 kod CSV'ye yalnız sayfa METNİNDEN girmiş** (s.42/43 dâhil). Araç metne bakabiliyor;
   s.26'da bakmadan üretti. §5'teki cetvel maddesi buna göre yazılsın:
   *"Tablo hücresinde kod yoksa ÖNCE sayfa metninde aranır; orada da yoksa ÜRETİLMEZ →
   `null` + `confidence != ok` + kaynak sayfası."*

6. **Kapıyı gerçekten kapı yap** (bunlar olmadan §4 bir niyettir):
   * `uretim-recetesi.json` → `ciktilar[0].girdiler` listesine **`kaynak-dizini/sayfalar.jsonl` ekle.**
   * `03-output/`'taki **3 CSV'nin üçünü de** reçeteye kalem olarak gir (bugün 1'i var).
   * `cikti_tazelik.py`'ye **içerik ölçütü** ekle: `determinist:false` kalemlerde tarih yerine
     yukarıdaki (a)–(d) sayılarını koştur, tutmuyorsa **kırmızı**. Bugün bu dosyada içerik ölçen
     tek satır yok — `determinist:false` dalı sha256'yı da reddediyor, yani o kalemde kapının
     içerik ayağı **hiç yok**.
   * Reçetedeki bayat `⛔acik_kalem_icerik_tazeligi` metnini ("PDF kaynak dizininde YOK") düzelt.

7. **Sabotaj kolunu iki eksene çıkar:** (i) kaynağa sahte **kod** ekle → kırmızı;
   (ii) üretilmiş CSV'de tek bir **`price_eur` rakamını** değiştir → kırmızı.
   (ii) bugünkü ölçütle **yeşil** kalır; kanıtı §2.5'teki iki gerçek dosyadır.

8. **Yer değiştirmeyi mekanikleştir:** yeni çıktı `03-output/_aday/` altına yazılsın; ölçüt betiği
   PASS dönmeden `mv` yapan komut **var olmasın**. "Ölçütler geçince yerine konur" bir insan
   talimatıdır; `--yerine-koy` bayrağı ölçüt betiğinin çıkış kodunu okumalıdır.

---

## 4. Sonuç: **BLOK**

Plan **teşhiste güçlü, kapıda boş**. Beş iddiadan biri ayakta, dördü çürüdü:

| # | iddia | hüküm | risk |
|---|---|---|---|
| 1 | 69 başlıksız tablo ürün taşımıyor | ⛔**ÇÜRÜDÜ** — 12'si taşıyor, 103 satır; 3'ünde KOD sütunu hiç yok | Yüksek |
| 2 | 16076–16080 uydurma | ✅**AYAKTA / GÜÇLENDİ** — 18 kodun 13'ü kaynakta, 5'i yok; iki yönde 1:1 örtüşme | Kritik (teşhis doğru) |
| 3 | "fark 0" bitti ölçütü | ⛔**ÇÜRÜDÜ** — kodsuz 5 ürüne kör; sağ taraf tanımsız (442 vs 498); `SKILL.md:97` ile çelişik | Yüksek |
| 4 | veri kaybı riski kapatıldı | ⛔**ÇÜRÜDÜ** — kapı saf tarih karşılaştırması; `determinist:false` sha256'yı reddediyor | **Kritik** |
| 5 | kod kümesi eşitliği yeterli kabul ölçütü | ⛔**ÇÜRÜDÜ** — iki gerçek dosya: kod farkı 0, sütun farkı 7, boyut farkı 8 473 B | Yüksek |

**Koşum ÖNCESİ kapatılması gereken üç kalem (bunlar olmadan koşma):**

1. **`SKILL.md:97` çelişkisi** (§2.3-C) — plan, yürürlükteki cetvelin yasakladığı davranışı emrediyor;
   CSV şemasında `confidence` sütunu yok. Cetvel ya da plan değişmeli; ikisi birden yürüyemez.
2. **İçerik kapısı** (§2.4) — `cikti_tazelik.py` içerik ölçmüyor; yeni CSV commit'lendiği an yeşil.
   Bu plan, kendisinin uyardığı kayıp sınıfına karşı **korumasız** koşulacak.
3. **s.42/43 (KOD sütunsuz, 27 ürün)** için çıkarım yolu tanımsız (§2.1) — uydurma-kod kusurunu
   doğuran koşul burada da mevcut, üstelik 5 değil 27 ürünle.

§2.2'nin bulgusu (5 uydurma kod, müşteriye görünüyor) **doğrudur ve aciliyeti gerçektir**; bu BLOK
hükmü o kalemin Recep kapısına gitmesini geciktirmemelidir — **teşhis sağlamdır, onarım yöntemi değildir.**
