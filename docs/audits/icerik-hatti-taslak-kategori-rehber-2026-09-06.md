# İçerik hattı — TR taslak: kategori rehber paragrafları (REC-146 madde 3)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06
**Durum:** **TASLAK — DB'ye YAZILMADI ve şu hâliyle YAZILAMAZ.**
Kategori açıklamasının i18n yolu yok (ölçüm: `icerik-hatti-kategori-olcumu-2026-09-06.md` §3);
yazım, o yol açıldıktan **ve** Recep onayından sonra.

## KAYNAK / CETVEL

* Kararlar — Vitrin 15A **K8** (kategori üç mod) · **K1** (fiyat/vaat metni yok) · **K7** (kaynak yoksa satır yok).
* `docs/standards/vaat-butunlugu-standard.md` — yanlış kapsamlı bilgi de vaat ihlalidir.
* Ölçüm: `docs/audits/icerik-hatti-kategori-olcumu-2026-09-06.md`.

## Bu metinlerin kaynağı NEDIR, ne DEĞİLDİR

Aile metinlerinin kaynağı üretici kataloğuydu ve her sayı kapıyla ölçüldü. **Kategori
rehber paragrafı farklı bir şeydir:** üreticinin sözü değil, bizim seçim tavsiyemiz.
Dayanağı iki yerdedir ve ikisi de ölçülebilir:

1. **Kategorinin içinde gerçekten ne var** — DB'den ölçüldü, aşağıda her paragrafın altında
   aile listesi var. Paragrafta adı geçen her ürün tipi o kategoride **vardır**.
2. **Onaylanmış aile metinleri** — paragraflardaki nitelemeler (kanal tipi, çatı tipi, EC
   motor, duman egzozu…) aile metinlerinden gelir, uydurulmaz.

**Sayısal norm iddiası YOKTUR.** Emir "kaç hava değişimi" diyor; bu bir normdur (TS/EN,
ASHRAE) ve elimizde normatif kaynak yok — 24 PDF üretici kataloğudur. Uydurma sayı burada
en tehlikeli hâline gelir: kaynağı olmadığı için kapı **kırmızı bile veremez**.
Norm gerekiyorsa kaynak temini ayrı iştir (Recep kararı).

---

## 1 · Fanlar (`fans`) — 295 ürün, 27 aile

> VentHub'ın en geniş kategorisi: havayı bir yerden alıp başka bir yere taşıyan bütün
> cihazlar burada. Seçimi belirleyen ilk soru cihazın **nereye monte edileceğidir** —
> kanal içine, çatıya, duvara ya da pencereye. İkinci soru havanın **ne taşıdığıdır**:
> normal ortam havası, yangın hâlinde duman, patlayıcı ortam gazı ya da radon.
> Üçüncüsü sessizliktir; yaşam alanına yakın montajlarda sessiz seriler ayrı bir aile
> olarak sunulur. Kanal tipi, çatı tipi, aksiyel, radyal (santrifüj), jet, sığınak,
> hücreli ve plug fan aileleri bu kategorinin altındadır; ihtiyacınızı tarif ederseniz
> seçiciyi kullanmadan da doğru aileye yönlendirilirsiniz.

**Kapsadığı aileler (DB'den ölçüldü):** seat-serisi (40) · vortice-vort-quadro-evo (23) ·
vortice-vort-qbk-sal-kc-evo (21) · jet-serisi (21) · storm-serisi (20) ·
vortice-vort-industrial-ventilation-axial (16) · vortice-vort-e-atex (14) ·
avens-plug-fanlar (14) · nicotra-gebhardt-dd (13) · vortice-lineo-quiet (12) ·
heatmaster-slimroof roof/smoke (10+10) · nicotra at/adh (8+8) · vortice-vort-nordik-hvls (7) ·
vortice-lineo (7) · commercial-in-line circular/rectangular (7+5) · avens-hucreli-hf-s (7) ·
nicotra-gebhardt-rdh (6) · avens-hucreli-aspiratorler (6) · radon circular/roof (5+3) ·
vortice-punto-evo-flexo (4) · vortice-vortice-bravo-s (4) ·
avens-siginak-havalandirma-uniteleri (3) · vortice-vort-industrial-ventilation-roof (1)

**Denetim notu:** sığınak havalandırma üniteleri bugün `fans` altında duruyor; ayrı bir
sığınak kategorisi olsa daha bulunur olurdu. **Kategorizasyon ÜRÜN'ün alanı** — bulgu kayıtta.

---

## 2 · Kontrol Sistemleri (`control-systems`) — 37 ürün, 4 aile

> Fanı çalıştırmak yetmez; ne zaman ve hangi hızda çalışacağına karar veren katman bu
> kategoridedir. İki farklı ihtiyaç vardır. Küçük tesisatlarda **hız anahtarı** yeterlidir:
> kademeli, basit, panoya ya da duvara monte edilir. Değişken debi, yumuşak kalkış, enerji
> tasarrufu ya da bina otomasyonuna bağlanma gerekiyorsa **frekans konvertörü** gerekir;
> HVAC uygulamalarına özel seriler ile genel amaçlı seriler ayrı ailelerde sunulur.
> Seçimi belirleyen sorular: sürülecek motorun gücü, besleme gerilimi (tek faz / üç faz)
> ve cihazın bir otomasyon sistemiyle haberleşmesinin gerekip gerekmediğidir.

**Kapsadığı aileler:** danfoss-fc102 (17) · danfoss-fc101 (16) · danfoss-fc51 (2) ·
avens-hiz-anahtarlari (2)

---

## 3 · İklimlendirme ve Hava Şartlandırma (`air-treatment`) — 17 ürün, 3 aile

> Havayı yalnızca taşımak değil, **taşırken değiştirmek** gerektiğinde bu kategoriye
> bakılır: ısıtmak, ya da nemini almak. Kanala giren havayı ısıtmak için iki yol vardır —
> elektrikli kanal ısıtıcısı ve sulu batarya; birincisi bağımsız çalışır, ikincisi tesisatta
> sıcak su kaynağı bulunmasını gerektirir ama işletme maliyeti düşüktür. Nem tarafında ise
> bağımsız nem alma cihazları yer alır; bodrum, çamaşırlık, depo gibi nemin yoğuştuğu
> hacimler için kullanılır. Seçimi belirleyen sorular: ısıtılacak hava debisi, kanal kesiti
> ve tesisatta sıcak su devresi olup olmadığıdır.

**Kapsadığı aileler:** avens-sulu-batarya (8) · avens-elektrikli-isiticilar (6) ·
vortice-deumido-range (3)

---

## 4 · Isı Geri Kazanım — VMC (`heat-recovery-vmc`) — 16 ürün, 3 aile

> Havalandırma yaparken ısıtma masrafını dışarı atmamanın yolu ısı geri kazanımıdır:
> dışarı atılan havanın ısısı, içeri alınan taze havaya bir eşanjör üzerinden aktarılır.
> İki farklı kurulum vardır ve seçim büyük ölçüde binanın durumuna bağlıdır. **Tekil oda
> üniteleri** duvara açılan tek bir delikle çalışır; mevcut binada, kanal çekmeden,
> oda oda uygulanır. **Kanallı merkezi üniteler** ise tüm daireyi ya da katı tek cihazdan
> havalandırır; kanal geçişi gerektirdiği için yeni yapıda veya kapsamlı tadilatta tercih
> edilir. Seçimi belirleyen sorular: kanal çekilebiliyor mu, havalandırılacak alan ne kadar,
> cihaz nereye (zemin, duvar, asma tavan) monte edilecek.

**Kapsadığı aileler:** vortice-vort-mono (8) · vortice-isi-geri-kazanim (5) ·
avens-isi-geri-kazanim (3)

---

## 5 · Hava Perdeleri (`air-curtains`) — 8 ürün, 2 aile

> Açık kalması gereken kapılarda içerideki havayı dışarıdan ayıran görünmez bir sınır
> oluşturur: kapı boyunca aşağı doğru üflenen hava, dışarıdaki soğuk (ya da sıcak) havanın
> ve tozun içeri girmesini engeller. Mağaza, market girişi, restoran ve depo kapıları
> tipik uygulama alanıdır. İki seçenek vardır: **ısıtmasız** modeller yalnızca hava akımı
> oluşturur; **elektrikli ısıtıcılı** modeller aynı zamanda giriş bölgesini ısıtır.
> Seçimi belirleyen sorular: kapı genişliği, kapının yerden yüksekliği, montajın kapı
> üstüne yapılıp yapılamayacağı ve girişte ısıtma isteyip istemediğinizdir.

**Kapsadığı aileler:** vortice-hava-perdesi (4) · vortice-h-ad-elektrikli (4)

---

## 6 · Aksesuarlar (`accessories`) — 2 ürün, 1 aile

> Ana cihazın kendisi değil, onu tamamlayan parçalar bu kategoridedir. Bugün burada
> sığınak havalandırma sistemlerinin tamamlayıcı ekipmanı yer alıyor.

**Kapsadığı aileler:** avens-bvu-ls (2)

**⛔ DENETİM NOTU — bu paragraf bilerek kısa:** kategoride tek aile ve 2 ürün var, o ailenin
de kaynakta anlatımı **yok** (Recep kararı bekleyen iki aileden biri). Kategoriyi olduğundan
zengin göstermek vaat ihlali olur. Aksesuar yelpazesi genişlediğinde paragraf yeniden yazılır.

---

## Bu taslağın kapatmadığı

* **i18n yolu** — açılmadan hiçbiri DB'ye yazılamaz (ölçüm §3).
* **EN çevirileri** — TR onayından sonra, `i18n-conventions` cetveli okunarak.
* **`display_mode` eşlemesi** — 37 kategorinin hepsi bugün varsayılan `series`;
  hangi kategorinin landing/showcase olacağı **Recep'in yapısal kararı** (ölçüm §5).
* **EN çevirileri** — TR onayından sonra, `i18n-conventions` cetveli okunarak.
* **`display_mode` eşlemesi** — 37 kategorinin hepsi bugün varsayılan `series`.

---

# BÖLÜM II — 17 ALT KATEGORİ (OPS kapsam hükmü, 2026-09-06)

Kapsam **6 → 23** oldu: ürünü olan her kategoriye paragraf. Sıra ürün sayısına göre azalan.
Aile listeleri `subcategory_id` sütunuyla canlıdan ölçüldü.

**YÖNTEM notu:** bu 17 paragrafı **kendim yazdım**, alt ajana vermedim. Cetvel "aynı kalıp
× N hedef" için alt ajan/maestro önerir; sapmanın sebebi: girdiler zaten damıtılmış
(doğruladığım 40 aile metni) ve bu metinlerde **ölçebileceğim bir kapı yok** — sayı/kod
taşımayan editoryal cümlede alt-ajan çıktısını doğrulayacak makine yok, denetim tamamen
bana düşerdi. Küçük N'de denetim maliyeti yazma maliyetini geçiyor.

## 7 · Santrifüj / Radyal Fanlar (`centrifugal-fans`) — 83 ürün

> Havayı eksen boyunca değil, çarkın çevresine doğru fırlatarak basan fanlar bu başlıktadır.
> Aksiyel fanlara göre **daha yüksek basınç** üretirler; uzun kanal hatları, filtreli
> sistemler ve hücreli tesisatlar için tercih edilir. Üç farklı yapı sunulur: **hücreli**
> üniteler (çift cidarlı gövde içinde, kayış-kasnak tahrikli), **plug fanlar** (gövdesiz,
> doğrudan santral içine yerleşen) ve **serbest çarklı radyal fanlar**. Seçimi belirleyen
> sorular: gereken basınç, fanın bir hücre içine mi yoksa doğrudan santrale mi gireceği ve
> kanat yönü (öne/geriye eğimli).

**Aileler:** avens-hucreli-aspiratorler · avens-hucreli-hf-s · avens-plug-fanlar ·
nicotra-gebhardt-dd/at/adh/rdh · vortice-vort-qbk-sal-kc-evo

## 8 · Asit Dayanımlı Fanlar (`acid-resistant-fans`) — 81 ürün

> Kimyasal buhar, asit ve korozif ortam taşıyan havalandırmalarda metal gövde ömrünü
> kısaltır. Bu kategorideki fanların gövdesi **polipropilendir** ve asitlere ve korozyona
> karşı üstün dayanım sağlar. Laboratuvar, kimya tesisi, galvaniz ve atık su uygulamalarında
> kullanılır. Seçimi belirleyen sorular: gereken debi ve statik basınç, çatı mı kanal mı
> montajı ve ortamın taşıdığı kimyasalın türüdür.

**Aileler:** seat-serisi · storm-serisi · jet-serisi
**Kaynak dayanağı:** kategori adının iddia ettiği özellik ölçüldü — polipropilen gövde,
asit ve korozyona karşı üstün dayanım [AVenS s.41, s.42]. **Uydurma değil, kaynakta var.**

## 9 · Kanal Tipi Fanlar (`duct-fans`) — 36 ürün

> Havayı kanal hattının **içinde** taşıyan, kanala seri bağlanan fanlar. Cihaz görünmez;
> asma tavan arasında ya da tesisat şaftında durur. Yuvarlak ve dikdörtgen kesitli modeller
> vardır ve seçim kanalın kesitine göre yapılır. Yaşam alanına yakın hatlarda **sessiz**
> seriler ayrıca sunulur. Seçimi belirleyen sorular: kanal çapı/kesiti, gereken debi,
> gürültü hassasiyeti ve hattın radon gibi özel bir tahliye görevi olup olmadığıdır.

**Aileler:** vortice-lineo · vortice-lineo-quiet · vortice-radon-range-circular ·
vortice-vort-commercial-in-line-circular · vortice-vort-commercial-in-line-rectangular

## 10 · Frekans Konvertörleri (`frequency-converters`) — 35 ürün

> Motorun devrini besleme frekansını değiştirerek ayarlayan sürücüler. Fanı tam hızda değil
> **ihtiyaç kadar** çalıştırmak enerji tüketimini doğrudan düşürür; ayrıca yumuşak kalkış
> mekanik yükü azaltır. HVAC uygulamalarına özel seriler ile genel amaçlı seriler ayrı
> ailelerde toplanmıştır. Seçimi belirleyen sorular: motor gücü, besleme gerilimi
> (tek faz / üç faz) ve bina otomasyonuyla haberleşme gerekip gerekmediğidir.

**Aileler:** danfoss-fc101 · danfoss-fc102 · danfoss-fc51

## 11 · Banyo ve Tuvalet Fanları (`bathroom-toilet-fans`) — 31 ürün

> Nemin ve kokunun kaynağında alındığı küçük hacim fanları. Duvara, tavana ya da kanala
> bağlanabilir; kimi modeller nem ve hareket sensörüyle kendi kendine çalışır. Konutta
> seçimi belirleyen ilk konu **gürültüdür** — yatak odasına komşu banyoda sessiz model
> gerekir. Diğer sorular: montaj yüzeyi (duvar/tavan), atık havanın dışarı mı yoksa şafta
> mı verileceği ve otomatik çalışma isteyip istemediğinizdir.

**Aileler:** vortice-vort-quadro-evo · vortice-punto-evo-flexo · vortice-vortice-bravo-s

## 12 · Aksiyel Fanlar (`axial-industrial-fans`) — 30 ürün

> Havayı milin ekseni boyunca iten fanlar: **yüksek debi, düşük basınç**. Duvar açıklığı,
> depo ve atölye havalandırması gibi kanal direncinin düşük olduğu yerlerde en verimli
> çözümdür. Patlayıcı ortam (ATEX) gerektiren uygulamalar için ayrı bir aile vardır ve
> bu ürünler sertifikalı yapıdadır. Seçimi belirleyen sorular: gereken debi, açıklığın
> çapı ve ortamın patlayıcı sınıflandırma taşıyıp taşımadığıdır.

**Aileler:** vortice-vort-industrial-ventilation-axial · vortice-vort-e-atex

## 13 · Çatı Tipi Fanlar (`roof-fans`) — 13 ürün

> Havayı binanın en üstünden dışarı atan, çatıya oturan fanlar. Kanal hattını kısaltır ve
> egzoz havasını yaşam kotunun üzerinde bırakır. Yatay ya da dikey atışlı modeller vardır;
> radon tahliyesi gibi özel görevler için ayrı aileler bulunur. Seçimi belirleyen sorular:
> çatı tipi ve eğimi, atış yönü, gereken debi ve tahliye edilen havanın niteliğidir.

**Aileler:** vortice-vort-heatmaster-slimroof-roof · vortice-radon-range-roof

## 14 · Duman Egzoz Fanları (`smoke-exhaust-fans`) — 10 ürün

> Yangın hâlinde dumanı tahliye etmek üzere, **yüksek sıcaklıkta çalışmaya sertifikalı**
> fanlar. Normal havalandırma fanından farkı budur: sıcak duman içinde belirli bir süre
> çalışmayı sürdürmesi gerekir. Kaçış yollarının duman kontrolünde kullanılır ve seçimi
> **projedeki yangın senaryosu** belirler — sıcaklık/süre sınıfı, gereken debi ve montaj
> yeri projeden gelir. Bu ürünlerde sınıf bilgisi ürün sayfasında kaynağıyla verilir.

**Aileler:** vortice-vort-heatmaster-slimroof-smoke

## 15 · Sulu Batarya Kanal Tipi (`water-coil-duct-heaters`) — 8 ürün

> Kanaldan geçen havayı, içinden sıcak su dolaşan bir serpantinle ısıtan bataryalar.
> Elektrikli ısıtıcıya göre kurulumu daha çok tesisat ister ama **işletme maliyeti
> düşüktür**; binada zaten bir sıcak su kaynağı (kazan, ısı pompası) varsa doğru seçimdir.
> Seçimi belirleyen sorular: kanal kesiti, hava debisi ve tesisatın su sıcaklığı/rejimidir.

**Aileler:** avens-sulu-batarya

## 16 · Kanallı Merkezi Üniteler (`ducted-central-hrv`) — 8 ürün

> Tüm daireyi veya katı tek cihazdan havalandıran ısı geri kazanım üniteleri. Kirli hava
> dışarı atılırken ısısı, içeri alınan taze havaya aktarılır. Kanal geçişi gerektirdiği
> için **yeni yapıda ya da kapsamlı tadilatta** tercih edilir. Seçimi belirleyen sorular:
> havalandırılacak alan, cihazın nereye (zemin, duvar, asma tavan) monte edileceği ve
> yalnız sıcaklığın mı yoksa nemin de geri kazanılmasının istendiğidir.

**Aileler:** vortice-isi-geri-kazanim · avens-isi-geri-kazanim

## 17 · Tekil Oda Üniteleri (`single-room-hrv`) — 8 ürün

> Duvara açılan **tek bir delikle** çalışan ısı geri kazanım üniteleri. Kanal çekmek
> gerekmediği için mevcut binada oda oda uygulanabilir; tadilat yükü en düşük çözümdür.
> Birden fazla ünite birlikte çalışacaksa kimi modeller kendi aralarında haberleşir.
> Seçimi belirleyen sorular: odanın büyüklüğü, dış duvara erişim ve uzaktan kumanda /
> sensörlü çalışma isteyip istemediğinizdir.

**Aileler:** vortice-vort-mono

## 18 · Endüstriyel Tavan Vantilatörleri (`industrial-ceiling-fans`) — 7 ürün

> Büyük hacimlerde havayı **yavaş ama çok geniş** bir alanda hareket ettiren büyük çaplı
> tavan vantilatörleri. Havayı dışarı atmazlar; içerideki havayı karıştırarak yazın serinlik
> hissi, kışın tavanda biriken sıcak havanın aşağı indirilmesini sağlarlar. Depo, spor
> salonu, fabrika ve showroom tipik uygulamadır. Seçimi belirleyen sorular: tavan yüksekliği,
> kapsanacak alan ve asma noktasının taşıma kapasitesidir.

**Aileler:** vortice-vort-nordik-hvls

## 19 · Elektrikli Kanal Isıtıcıları (`electric-duct-heaters`) — 6 ürün

> Kanaldan geçen havayı elektrikli rezistansla ısıtan **tesisat aksesuarıdır**. Sıcak su
> devresi bulunmayan ya da yalnız belirli bir hatta ısıtma gereken yerlerde kullanılır;
> bağımsız bir ısıtma cihazı değil, havalandırma hattını tamamlayan bir elemandır.
> Seçimi belirleyen sorular: kanal kesiti, hava debisi ve elektrik tesisatının kapasitesidir.

**Aileler:** avens-elektrikli-isiticilar
**K7.10:** Recep kararı — bu ürünler **yalnız aksesuar olarak** sunulur; paragraf bu
çerçeveyi bilinçli olarak aşmıyor.

## 20 · Sığınak Havalandırma Fanları (`shelter-ventilation`) — 3 ürün

> Sığınak havalandırma sistemlerinin hava hareketini sağlayan üniteler. Bu ürünlerde seçim
> ticari değil **mevzuata bağlıdır**: sığınak hacmi ve ilgili yönetmeliğin öngördüğü
> havalandırma düzeni belirleyicidir. Projeyle birlikte değerlendirilmesi gerekir.

**Aileler:** avens-siginak-havalandirma-uniteleri
**Denetim notu:** bu aile bugün `fans` üst kategorisi altında duruyor; sığınak ürünleri
kendi başlığında toplansa daha bulunur olurdu. **Kategorizasyon ÜRÜN'ün alanı**, bulgu kayıtta.

## 21 · Nem Alma Cihazları (`dehumidifiers`) — 3 ürün

> Havayı taşımak yerine **nemini alan** bağımsız cihazlar. Bodrum, çamaşırlık, depo ve
> havuz çevresi gibi nemin yoğuştuğu, küf ve koku riski taşıyan hacimler için kullanılır.
> Havalandırmanın tek başına çözemediği durumlarda havalandırmayı tamamlar. Seçimi
> belirleyen sorular: hacmin büyüklüğü, nem yükünün sürekli mi mevsimlik mi olduğu ve
> cihazın sabit mi taşınabilir mi kullanılacağıdır.

**Aileler:** vortice-deumido-range

## 22 · Hız Anahtarları (`speed-controllers`) — 2 ürün

> Fanın devrini kademeli olarak ayarlayan basit kumanda elemanları. Frekans konvertörüne
> göre çok daha yalındır: küçük tesisatlarda, tek bir fanın hızını elle düşürüp yükseltmek
> için kullanılır. Seçimi belirleyen sorular: sürülecek fanın gücü ve besleme tipidir.

**Aileler:** avens-hiz-anahtarlari
**⛔ K7.10:** Recep kararı — bu ailenin **satılabilir ürün sayfası YAZILMAYACAK** (kaynakta
anlatım yok, yalnız kod ve fiyat); AVenS'ten teknik föy istenecek, gelene kadar ürün sayfası
kısa kimlik hâlinde kalır. **Yukarıdaki kategori paragrafı ürün metni değildir** — kategorinin
ne olduğunu anlatır ve ürüne dair hiçbir teknik iddia taşımaz.

## 23 · Şömine ve Baca Fanları (`chimney-fans`) — 1 ürün

> Bacanın çekişini mekanik olarak destekleyen fanlar. Doğal çekişin yetmediği, dumanın
> içeri vurduğu şömine ve baca hatlarında kullanılır. Tek ürünlük bir başlık olduğu için
> bu kategori bugün dar bir seçim sunar. Seçimi belirleyen sorular: baca kesiti, baca
> malzemesi ve yakıt türüdür.

**Aileler:** vortice-vort-industrial-ventilation-roof (ürün: TIRACAMINO)
**Denetim notu:** aile slug'ı `industrial-ventilation-roof` — yanıltıcı; ürün bir baca
fanıdır, endüstriyel çatı fanı değil. Kaynakta da karışıklık vardı ve taslakta kayıtlı.
**Slug ÜRÜN'ün alanı**, dokunulmadı.

---

## Bölüm II'nin kapatmadığı

* **22 numaralı kategori (Hız Anahtarları)** — kategori paragrafı yazıldı, ürün metni
  YAZILMADI (K7.10). İkisi ayrı şeydir; karıştırılmamalı.
* **Boş 7 alt kategori** — ürünü olmayan 7 alt kategoriye paragraf YAZILMADI. Boş sayfaya
  rehber yazmak, olmayan bir yelpazeyi varmış gibi gösterir (vaat bütünlüğü).
