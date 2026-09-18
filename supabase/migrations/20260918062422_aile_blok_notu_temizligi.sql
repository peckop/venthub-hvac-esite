-- REC-206 / karar 45 - Vitrin aile BLOK metinlerindeki IC EDITOR NOTU temizligi (veri onarimi).
--
-- NICIN (canli olcum 2026-09-17/18): `product_families.description` jsonb'sinin `bloklar_tr` ve
--   `maddeler_tr` anahtarlari, icerik hattinda yazilirken editorun kendine dustugu hazirlik
--   notlarini tasiyor: "**Kaynakta yok**", "*Bu urun tipi icin gecersiz.*", "bos birakildi",
--   "[MANIFEST]" gibi. Bu anahtarlar bugun hicbir bilesende CIZILMIYOR (blok render REC-164'te
--   gelecek) ama anon rolu `get_family_detail` / `get_product_families_enriched` RPC'leriyle
--   okuyabiliyor; karar 42 bunu PR yorumuna yazip veri temizligini REC-164'un on sarti saymisti.
--   Bu dosya o on sarti kapatir.
--
-- EVREN (olculdu): 38 aile / 274 blok-madde parcasi. Uc bagimsiz salt-okuma alt ajani her parcayi
--   kaynak dizinine (sayfalar.jsonl) karsi dogruladi; PDF acilmadi. Siniflama:
--     TEMIZ                                      38 aile / 215 parca  -> dokunulmaz
--     not parcasi cikar (cumle kalir)            15 aile /  32 parca  -> CIKAR
--     metnin tamami not (blok anahtari kalkar)    3 aile /   5 parca  -> CIKAR
--     not cikinca cumle oznesiz kaliyor           2 aile /   2 parca  -> CIKAR (minimum yeniden yazim)
--     yalniz `---` / bos `>` artigi              14 aile /  16 parca  -> KALIR (bicim, dokunulmaz)
--     yapi hatasi (Kontrol icerigi Koruma'da)     3 aile /   3 parca  -> AYRI LISTE (i)
--     dogrulanmamis deger (birimsiz olcu)         1 aile /   1 parca  -> AYRI LISTE (ii)
--   Bu dosya yalniz CIKAR satirlarini uygular: 39 oge / 17 aile.
--
-- KAPSAM SINIRI: 45 = YALNIZ ic editor notu cikarma. Yapi hatasi, dogrulanmamis teknik deger ve
--   anlati cumlelerinin dogruluk duzeltmeleri KAPSAM DISI ve REC-206'da ayri liste olarak durur
--   (nicotra adh/rdh govde-eki yorumu, storm-serisi guc araligi, fc51 model kodu vb.).
--   `---` ve bos `>` isaretleri BICIMDIR: guard 3c bu 16 ogenin md5'inin DEGISMEDIGINI dogrular.
--
-- IKI YENIDEN YAZIM - kaynak dizininden dogrulandi:
--   * vortice-deumido-range / bloklar_tr.Motor
--     "220-240 V besleme, 260 W (NG 10) ile 500 W (NG 20) arasinda guc"
--     kanit: markalar/vortice/konut-fanlari/deumido-range/01-input/
--            Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf
--            s.7 -> "26020 DEUMIDO NG 10 ... 220 - 240 [V] 260 [W]"
--            s.9 -> "26022 DEUMIDO NG 20 ... 220 - 240 [V] 500 [W]" (NG 16 = 340 W, aralik ici)
--   * vortice-vortice-bravo-s / bloklar_tr.Motor -> "BRA.VO S bir sensordur; motor icermez."
--     kanit: markalar/vortice/isi-geri-kazanim/01-input/vort-hr-w-all-100-df.pdf s.12
--            -> "BRA.VO S1 Wireless remote sensor for monitoring temperature, relative humidity
--                and VOC concentration in the target room"
--            markalar/vortice/konut-fanlari/brochures/01-input/vortice-brochure-radon-en.pdf s.40
--            -> "Compatible with BRA.VO S, an air quality meter"
--
-- ELLE DEGISIKLIK KAPISI (42 yontemi, 39 ogeye uyarlandi): aile basina tek md5 yerine "maske md5"
--   kullanilir = description'dan bu dosyanin dokundugu yollar CIKARILDIKTAN sonra kalan jsonb'nin
--   md5'i. Bu deger migration oncesi ve sonrasi AYNIDIR: hem "biri elle degistirmis" hali yakalanir
--   hem dosya idempotent kalir. Ek olarak her oge kendi eski metniyle karsilastirilir - eski ise
--   uygulanir, zaten hedef ise NOTICE ile atlanir, baska bir sey ise EXCEPTION verir (bilinmeyen
--   metnin uzerine yazilmaz).
--
-- COK KIRACI (kural 12): benzersizlik (tenant_id, slug) uzerinde. Bir slug birden cok satir
--   dondururse hangi satirin kastedildigi belirsizdir -> DURUR, tahmin etmez.
--
-- BOS VERITABANI: aile yoksa NOTICE ile atlanir (kurulum/golge kosumu kirmizi yanmaz).
--
-- GERI ALMA: her ogenin eski metni asagidaki plan JSON'unda `eski` alaninda birebir durur; ayrica
--   `denetim_izi_product_families` tetigi degisikligin oncesini ve sonrasini admin_audit_log'a
--   kendiliginden yazar. Geri almak = plandaki her oge icin `eski` degerini geri yazmak.
--
-- TETIKLER (olculdu): denetim_izi (once/sonra kaydi) - on_product_families_change (Vercel'e sayfa
--   tazeleme bildirimi) - product_families_set_updated_at - single_level. arama_aile_kuyrukla
--   yalniz name/name_i18n degisince kosar, bu guncelleme arama kuyruguna is dusurmez.

set lock_timeout = '5s';
set statement_timeout = '60s';

begin;

-- ADIM 1 - plan butunlugu + aile kapilari. Hicbir yazma yapilmaz; bir kapi kirmizi yanarsa
-- islem tamamen geri alinir (tek transaction).
do $$
declare
  v_plan  jsonb := $plan$[
 {
  "slug": "avens-elektrikli-isiticilar",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Elektrikli ısıtıcı bir fan değildir; çarkı yoktur, havayı kendisi hareket ettirmez — bağlı olduğu ısı geri kazanım cihazının debisiyle eşleştirilir.",
  "yeni": "Elektrikli ısıtıcı bir fan değildir; çarkı yoktur, havayı kendisi hareket ettirmez — bağlı olduğu ısı geri kazanım cihazının debisiyle eşleştirilir."
 },
 {
  "slug": "avens-elektrikli-isiticilar",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "*Kaynakta montaj biçimi verilmemiştir.* Fiyat listesi yalnız **cihaz eşleşmesini** verir: her güç kademesinin karşısında uygun AVenS modeli yazılıdır, AVenS 750'den AVenS 5000'e. ---",
  "yeni": "Fiyat listesi yalnız **cihaz eşleşmesini** verir: her güç kademesinin karşısında uygun AVenS modeli yazılıdır, AVenS 750'den AVenS 5000'e. ---"
 },
 {
  "slug": "avens-elektrikli-isiticilar",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Isıtıcının motoru yoktur.",
  "yeni": "Isıtıcının motoru yoktur."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "Cihazlar plug fanlıdır. Fan adedi, çark çapı, kanat biçimi ve devir bilgisi kaynakta verilmemiştir.",
  "yeni": "Cihazlar plug fanlıdır."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "AVenS 750 ve AVenS 1000 gövde ölçüleri (L × W × H) 910 mm × 815 mm × 350 mm'dir. AVenS 2000 gövde ölçüsü 1400 mm × 1025 mm × 500 mm'dir. Gövde sacı, yalıtımı ve kapak düzeni kaynakta anlatılmamıştır.",
  "yeni": "AVenS 750 ve AVenS 1000 gövde ölçüleri (L × W × H) 910 mm × 815 mm × 350 mm'dir. AVenS 2000 gövde ölçüsü 1400 mm × 1025 mm × 500 mm'dir."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Kontrol"
  ],
  "eski": "Cihazlar dijital kontrol panosuyla birlikte sunulur. Panonun işlevleri, haberleşme protokolü, sensör donanımı ve kademe sayısı kaynakta anlatılmıyor.",
  "yeni": "Cihazlar dijital kontrol panosuyla birlikte sunulur."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Kanal bağlantı ağzı ölçüleri AVenS 750 için 250 mm × 250 mm, AVenS 1000 için 275 mm × 275 mm, AVenS 2000 için 300 mm × 300 mm'dir. Kanal tipi elektrikli ısıtıcı ve sulu batarya, bu üç model için ayrı ürün olarak listelenir ve kontrol paneliyle birlikte kullanılır. Cihazın montaj biçimi (tavana asma, döşemeye oturtma vb.) ve askı noktaları kaynakta belirtilmemiştir. ---",
  "yeni": "Kanal bağlantı ağzı ölçüleri AVenS 750 için 250 mm × 250 mm, AVenS 1000 için 275 mm × 275 mm, AVenS 2000 için 300 mm × 300 mm'dir. Kanal tipi elektrikli ısıtıcı ve sulu batarya, bu üç model için ayrı ürün olarak listelenir ve kontrol paneliyle birlikte kullanılır. ---"
 },
 {
  "slug": "avens-plug-fanlar",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "Geriye eğik kanatlı, tek emişli, yüksek performanslı çark. Seri KENTALFAN 315'ten KENTALFAN 630'a kadar boy numaralarıyla sunulur. Bu boy numaralarının \"nominal çap (mm)\" karşılığı fiyat listesinde açıkça yazmaz; canlı veride 315–630 mm nominal çap olarak kayıtlıdır. Kanat sayısı, çark malzemesi ve emiş ağzı ölçüsü kaynakta verilmemiştir.",
  "yeni": "Geriye eğik kanatlı, tek emişli, yüksek performanslı çark. Seri KENTALFAN 315'ten KENTALFAN 630'a kadar boy numaralarıyla sunulur."
 },
 {
  "slug": "avens-plug-fanlar",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Doğrudan tahrikli OEM fan olarak sunulur; uygulama alanları klima santralleri, ısı geri kazanım cihazları ve plenum kutularıdır. Montaj plakası, delik deseni, flanş ve gabari ölçüleri kaynakta verilmemiştir. ---",
  "yeni": "Doğrudan tahrikli OEM fan olarak sunulur; uygulama alanları klima santralleri, ısı geri kazanım cihazları ve plenum kutularıdır. ---"
 },
 {
  "slug": "avens-sulu-batarya",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Sulu batarya bir fan değildir; çarkı yoktur.",
  "yeni": "Sulu batarya bir fan değildir; çarkı yoktur."
 },
 {
  "slug": "avens-sulu-batarya",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Model adları bataryayı **kanal tipi** olarak tanımlar. Fiyat listesi bunun ötesinde montaj yönü, servis boşluğu veya kanal bağlantı ölçüsü vermez — *o kısım boş.* ---",
  "yeni": "Model adları bataryayı **kanal tipi** olarak tanımlar. ---"
 },
 {
  "slug": "avens-sulu-batarya",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Bataryanın motoru yoktur.",
  "yeni": "Bataryanın motoru yoktur."
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "**Bu ürün tipi için geçersiz.** Frekans konvertöründe çark yoktur; ürün hava taşımaz, hava taşıyan fanın motorunu sürer.",
  "yeni": "Frekans konvertöründe çark yoktur; ürün hava taşımaz, hava taşıyan fanın motorunu sürer."
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "AVenS kataloğunda bu aile için gövde, malzeme veya koruma sınıfı bilgisi **YOKTUR** — fiyat listesi yalnız kod, model, motor gücü ve fiyat sütunlarını taşır. Üretici föyünden gelen taban gövde bilgisi: IP20 / Open type, H1–H8 gövde boyları, 2,1–51 kg ağırlık aralığı — **taban (gövdesiz, panel-montaj) varyant varsayımıyla** [MANIFEST].",
  "yeni": "Üretici föyünden gelen taban gövde bilgisi: IP20 / Open type, H1–H8 gövde boyları, 2,1–51 kg ağırlık aralığı."
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Katalogda tesisat kısıtı olarak yalnız kablo mesafesi verilir: maksimum kablo mesafesi 50 metredir. Montaj biçimi, ağırlık ve delik ölçüleri **kaynakta yok** — blok bilinçli olarak boş bırakıldı. ---",
  "yeni": "Katalogda tesisat kısıtı olarak yalnız kablo mesafesi verilir: maksimum kablo mesafesi 50 metredir. ---"
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "**Bu ürün tipi için geçersiz.** Ürünün kendisi motor değil, motor **sürücüsüdür**; sürdüğü motorun gücü Kimlik bölümündeki kW aralığıyla karşılanır.",
  "yeni": "Ürünün kendisi motor değil, motor **sürücüsüdür**; sürdüğü motorun gücü Kimlik bölümündeki kW aralığıyla karşılanır."
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "**Bu ürün tipi için geçersiz** — FC101 ile aynı gerekçe.",
  "yeni": null
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "AVenS kataloğunda bu aile için de gövde, malzeme veya koruma sınıfı bilgisi **YOKTUR**. Üretici föyünden gelen taban gövde bilgisi: IP20 / Chassis, A2–C4 gövde boyları, 4,8–50 kg ağırlık aralığı — **taban varyant varsayımıyla** [MANIFEST].",
  "yeni": "Üretici föyünden gelen taban gövde bilgisi: IP20 / Chassis, A2–C4 gövde boyları, 4,8–50 kg ağırlık aralığı."
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Tesisat kısıtı olarak maksimum kablo mesafesi 150 metredir. Montaj biçimi ve ölçüler **kaynakta yok** — blok bilinçli olarak boş bırakıldı. ---",
  "yeni": "Tesisat kısıtı olarak maksimum kablo mesafesi 150 metredir. ---"
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "**Bu ürün tipi için geçersiz** — ürün motor değil, motor sürücüsüdür.",
  "yeni": "Ürün motor değil, motor sürücüsüdür."
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "**Bu ürün tipi için geçersiz.**",
  "yeni": null
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "**Kaynakta yok** — FC-51 için katalogda hiçbir gövde/malzeme/koruma bilgisi bulunmaz.",
  "yeni": null
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "**Kaynakta yok** — FC101/FC102'de verilen kablo mesafesi kısıtı FC-51 için verilmemiştir. ---",
  "yeni": null
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "**Bu ürün tipi için geçersiz** — ürün motor değil, motor sürücüsüdür.",
  "yeni": "Ürün motor değil, motor sürücüsüdür."
 },
 {
  "slug": "nicotra-gebhardt-adh",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri farklı gövde büyüklüğü gruplarını ayırır; **bu eklerin anlamı kaynakta açıklanmıyor.**",
  "yeni": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri farklı gövde büyüklüğü gruplarını ayırır."
 },
 {
  "slug": "nicotra-gebhardt-adh",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "Kayış kasnak tahriklidir. Motor verisi **kaynakta yok**.",
  "yeni": "Kayış kasnak tahriklidir."
 },
 {
  "slug": "nicotra-gebhardt-at",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "Kayış kasnak tahriklidir. Motor bir katalog kalemi olarak listelenmediği için güç, devir, kutup ve faz bilgisi **kaynakta yok**.",
  "yeni": "Kayış kasnak tahriklidir."
 },
 {
  "slug": "nicotra-gebhardt-at",
  "yol": [
   "maddeler_tr",
   "2"
  ],
  "eski": "Fiyat listesinde model adı yalnız çark ölçüsünü verir; motor gücü, devir ve faz bilgisi tabloda yer almaz.",
  "yeni": "Model adı yalnız çark ölçüsünü verir."
 },
 {
  "slug": "nicotra-gebhardt-dd",
  "yol": [
   "maddeler_tr",
   "0"
  ],
  "eski": "Fiyat listesi ikiye ayırır: standart DD serisi ve 3 hızlı DD 3V serisi; ikisinin de tanım cümlesi aynıdır.",
  "yeni": "Fiyat listesi ikiye ayırır: standart DD serisi ve 3 hızlı DD 3V serisi."
 },
 {
  "slug": "nicotra-gebhardt-rdh",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri ADH ile aynı biçimde kullanılır; anlamları **kaynakta açıklanmıyor.**",
  "yeni": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri ADH ile aynı biçimde kullanılır."
 },
 {
  "slug": "nicotra-gebhardt-rdh",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "Kayış kasnak tahriklidir. Motor verisi **kaynakta yok**.",
  "yeni": "Kayış kasnak tahriklidir."
 },
 {
  "slug": "vortice-deumido-range",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "*Kaynakta ayrı bir motor tanımı YOK* — föy motor tipini, kutup sayısını veya verim sınıfını vermez. Verilen tek elektriksel veri cihazın besleme ve tüketim değerleridir: 220–240 V besleme, 260 W (NG 10) ile 500 W (NG 20) arasında güç.",
  "yeni": "Cihazın besleme ve tüketim değerleri şöyledir: 220–240 V besleme, 260 W (NG 10) ile 500 W (NG 20) arasında güç."
 },
 {
  "slug": "vortice-h-ad-elektrikli",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Ortaktır: yatay duvar montajı, kapı üstü ya da açıklığa en yakın konum, asgari 2,3 metre montaj yüksekliği ve önerilen azami 4 metre. Ön emişli ızgara sayesinde tavanla arada boşluk gerekmez. Pratik duvar montaj braketiyle kurulur ve geniş açıklıklar için seri montaj mümkündür. Isıtıcılı modellerde hava hızı 8,5/9,5 m/s'dir; ısıtmasız ailenin 9/11 m/s değerinin altında kalır. Montaj yüksekliğinin bu farka göre nasıl seçileceği **kaynakta yazmıyor** — hesap yapılmadı, yorum eklenmedi. ---",
  "yeni": "Ortaktır: yatay duvar montajı, kapı üstü ya da açıklığa en yakın konum, asgari 2,3 metre montaj yüksekliği ve önerilen azami 4 metre. Ön emişli ızgara sayesinde tavanla arada boşluk gerekmez. Pratik duvar montaj braketiyle kurulur ve geniş açıklıklar için seri montaj mümkündür. Isıtıcılı modellerde hava hızı 8,5/9,5 m/s'dir; ısıtmasız ailenin 9/11 m/s değerinin altında kalır. ---"
 },
 {
  "slug": "vortice-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Kontrol"
  ],
  "eski": "Filtre değişim zamanını gösteren **görsel filtre uyarısı** bulunur. *(Kanal bağlantısı, debi kademeleri ve uzaktan kumanda seçenekleri modele göre değişir; kaynakta aile geneli için tek bir kontrol tanımı yok — bu blok bilerek KISA bırakıldı.)*",
  "yeni": "Filtre değişim zamanını gösteren **görsel filtre uyarısı** bulunur."
 },
 {
  "slug": "vortice-vort-commercial-in-line-circular",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "Dekapaj görmüş, fosfat kaplı çelik saç gövde; agresif hava koşullarına karşı polyester boya ile boyanmıştır. Şebeke bağlantı klemenslerini ve akış yönlendirici kanatçıkları barındıran motor yuvası, kendinden sönümlü plastik reçineden (V0) üretilmiştir. Fiyat listesindeki tanım: metal gövde, standart montaj ayağı. > *DB'deki bugünkü metin V0 sınıfını gövdeye atfediyor; kaynak bu sınıfı **motor yuvası ve klemens > kutusu** için kullanıyor, gövde boyalı çelik saçtır.*",
  "yeni": "Dekapaj görmüş, fosfat kaplı çelik saç gövde; agresif hava koşullarına karşı polyester boya ile boyanmıştır. Şebeke bağlantı klemenslerini ve akış yönlendirici kanatçıkları barındıran motor yuvası, kendinden sönümlü plastik reçineden (V0) üretilmiştir. Fiyat listesindeki tanım: metal gövde, standart montaj ayağı."
 },
 {
  "slug": "vortice-vort-commercial-in-line-circular",
  "yol": [
   "bloklar_tr",
   "Kontrol"
  ],
  "eski": "Fanlar çift hızlıdır; hız anahtarına ihtiyaç duymadan iki farklı hava debisi sağlanabilir, isteğe bağlı olarak hız anahtarı ile kontrol edilebilir. Hız anahtarları sıva üstü montajlı, sigorta korumalı, minimum hız ayarlı ve On/Off anahtarlıdır. Ürün, uzaktan ortam sıcaklığı, nem, duman ve varlık sensörlerine bağlanabilir (opsiyonel). > *Kaynak çelişkisi kayda geçirildi: İtalyan kataloğu aynı seriyi üç hızlı olarak tanımlar ve > opsiyonel TRIO-CA cihazıyla ayarlandığını söyler.*",
  "yeni": "Fanlar çift hızlıdır; hız anahtarına ihtiyaç duymadan iki farklı hava debisi sağlanabilir, isteğe bağlı olarak hız anahtarı ile kontrol edilebilir. Hız anahtarları sıva üstü montajlı, sigorta korumalı, minimum hız ayarlı ve On/Off anahtarlıdır. Ürün, uzaktan ortam sıcaklığı, nem, duman ve varlık sensörlerine bağlanabilir (opsiyonel)."
 },
 {
  "slug": "vortice-vort-mono",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "*(Kaynakta bu aile için çark yapısına dair cümle YOK — **boş bırakıldı**, K7.)*",
  "yeni": null
 },
 {
  "slug": "vortice-vortice-bravo-s",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "— **bu ürün tipi için geçersiz.** BRA.VO S bir sensördür; hava hareket ettirmez.",
  "yeni": "BRA.VO S bir sensördür; hava hareket ettirmez."
 },
 {
  "slug": "vortice-vortice-bravo-s",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "— **bu ürün tipi için geçersiz.** Aynı sebep.",
  "yeni": "BRA.VO S bir sensördür; motor içermez."
 }
]$plan$::jsonb;
  v_maske jsonb := $maske${
 "avens-elektrikli-isiticilar": "c3c43f9005e9e0e701e7e208bbd06e5c",
 "avens-isi-geri-kazanim": "400d7e600260d244e11a0f88d490272b",
 "avens-plug-fanlar": "c45ca1ca3e5f0512efff9444a800c22c",
 "avens-sulu-batarya": "899df24138962be49beaa0d931dad88b",
 "danfoss-fc101": "36e232d926b8440104ef45d976a78db4",
 "danfoss-fc102": "5820497027dd00a435a1204f5169b4e2",
 "danfoss-fc51": "d12118b77cb974c217a8ed945e5e155b",
 "nicotra-gebhardt-adh": "a63cfe5b23ed191cb192a83c80d7418a",
 "nicotra-gebhardt-at": "d8319b73e5d5874fe1c0bed42a40826f",
 "nicotra-gebhardt-dd": "acd7452c03f14bda12a6522445d009b4",
 "nicotra-gebhardt-rdh": "1164a9b2de6842b122facbd5de533eec",
 "vortice-deumido-range": "64e79ef15a208bcd888f856c9974e511",
 "vortice-h-ad-elektrikli": "712b95e59643db88f4934ceb78851bfd",
 "vortice-isi-geri-kazanim": "f3876c25283bc365a24f1d7fe628ab16",
 "vortice-vort-commercial-in-line-circular": "64ba5e451151b30be1ae3460c33e39ee",
 "vortice-vort-mono": "5eda313ceca0a94346445ee9db0a7843",
 "vortice-vortice-bravo-s": "aecd12f0900537fc5a13e7e08ad396a7"
}$maske$::jsonb;
  r       record;
  r2      record;
  v_adet  int;
  v_desc  jsonb;
  v_yok   int := 0;
begin
  if jsonb_array_length(v_plan) <> 39 then
    raise exception 'K45: plan 39 oge olmali, % geldi - dosya bozulmus', jsonb_array_length(v_plan);
  end if;
  if (select count(*) from jsonb_object_keys(v_maske)) <> 17 then
    raise exception 'K45: maske 17 aile olmali - dosya bozulmus';
  end if;
  if (select count(distinct p.value->>'slug') from jsonb_array_elements(v_plan) p) <> 17 then
    raise exception 'K45: plan icinde 17 ayri aile bekleniyor - dosya bozulmus';
  end if;
  if exists (select 1 from jsonb_array_elements(v_plan) p
              where not v_maske ? (p.value->>'slug')) then
    raise exception 'K45: planda maske karsiligi olmayan aile var - dosya bozulmus';
  end if;

  for r in select key as slug, value #>> '{}' as beklenen from jsonb_each(v_maske) loop
    select count(*) into v_adet from public.product_families where slug = r.slug;
    if v_adet = 0 then
      raise notice 'K45 ATLANDI - % ailesi yok (kurulum/golge kosumu).', r.slug;
      v_yok := v_yok + 1;
      continue;
    elsif v_adet > 1 then
      raise exception 'K45: % ailesi % satir dondurdu (birden cok kiraci?) - hedef belirsiz, YAZILMADI',
        r.slug, v_adet;
    end if;

    select description into v_desc from public.product_families where slug = r.slug;
    for r2 in select p.value->'yol' as yol from jsonb_array_elements(v_plan) p
               where p.value->>'slug' = r.slug loop
      v_desc := v_desc #- (select array_agg(t) from jsonb_array_elements_text(r2.yol) e(t));
    end loop;

    if md5(v_desc::text) <> r.beklenen then
      raise exception 'K45: % ailesinin DOKUNULMAYAN kismi canlida olculenden farkli (maske md5 % <> %) - metin elle degismis, YAZILMADI',
        r.slug, md5(v_desc::text), r.beklenen;
    end if;
  end loop;

  raise notice 'K45 KAPI 1 GECTI: % aile tek satir + maske md5 birebir (% aile bu veritabaninda yok).',
    17 - v_yok, v_yok;
end;
$$;

-- ADIM 2 - 39 ogenin uygulanmasi. Oge duzeyinde uc yol: eski ise yaz, hedef ise atla, baska ise DUR.
do $$
declare
  v_plan    jsonb := $plan$[
 {
  "slug": "avens-elektrikli-isiticilar",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Elektrikli ısıtıcı bir fan değildir; çarkı yoktur, havayı kendisi hareket ettirmez — bağlı olduğu ısı geri kazanım cihazının debisiyle eşleştirilir.",
  "yeni": "Elektrikli ısıtıcı bir fan değildir; çarkı yoktur, havayı kendisi hareket ettirmez — bağlı olduğu ısı geri kazanım cihazının debisiyle eşleştirilir."
 },
 {
  "slug": "avens-elektrikli-isiticilar",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "*Kaynakta montaj biçimi verilmemiştir.* Fiyat listesi yalnız **cihaz eşleşmesini** verir: her güç kademesinin karşısında uygun AVenS modeli yazılıdır, AVenS 750'den AVenS 5000'e. ---",
  "yeni": "Fiyat listesi yalnız **cihaz eşleşmesini** verir: her güç kademesinin karşısında uygun AVenS modeli yazılıdır, AVenS 750'den AVenS 5000'e. ---"
 },
 {
  "slug": "avens-elektrikli-isiticilar",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Isıtıcının motoru yoktur.",
  "yeni": "Isıtıcının motoru yoktur."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "Cihazlar plug fanlıdır. Fan adedi, çark çapı, kanat biçimi ve devir bilgisi kaynakta verilmemiştir.",
  "yeni": "Cihazlar plug fanlıdır."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "AVenS 750 ve AVenS 1000 gövde ölçüleri (L × W × H) 910 mm × 815 mm × 350 mm'dir. AVenS 2000 gövde ölçüsü 1400 mm × 1025 mm × 500 mm'dir. Gövde sacı, yalıtımı ve kapak düzeni kaynakta anlatılmamıştır.",
  "yeni": "AVenS 750 ve AVenS 1000 gövde ölçüleri (L × W × H) 910 mm × 815 mm × 350 mm'dir. AVenS 2000 gövde ölçüsü 1400 mm × 1025 mm × 500 mm'dir."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Kontrol"
  ],
  "eski": "Cihazlar dijital kontrol panosuyla birlikte sunulur. Panonun işlevleri, haberleşme protokolü, sensör donanımı ve kademe sayısı kaynakta anlatılmıyor.",
  "yeni": "Cihazlar dijital kontrol panosuyla birlikte sunulur."
 },
 {
  "slug": "avens-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Kanal bağlantı ağzı ölçüleri AVenS 750 için 250 mm × 250 mm, AVenS 1000 için 275 mm × 275 mm, AVenS 2000 için 300 mm × 300 mm'dir. Kanal tipi elektrikli ısıtıcı ve sulu batarya, bu üç model için ayrı ürün olarak listelenir ve kontrol paneliyle birlikte kullanılır. Cihazın montaj biçimi (tavana asma, döşemeye oturtma vb.) ve askı noktaları kaynakta belirtilmemiştir. ---",
  "yeni": "Kanal bağlantı ağzı ölçüleri AVenS 750 için 250 mm × 250 mm, AVenS 1000 için 275 mm × 275 mm, AVenS 2000 için 300 mm × 300 mm'dir. Kanal tipi elektrikli ısıtıcı ve sulu batarya, bu üç model için ayrı ürün olarak listelenir ve kontrol paneliyle birlikte kullanılır. ---"
 },
 {
  "slug": "avens-plug-fanlar",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "Geriye eğik kanatlı, tek emişli, yüksek performanslı çark. Seri KENTALFAN 315'ten KENTALFAN 630'a kadar boy numaralarıyla sunulur. Bu boy numaralarının \"nominal çap (mm)\" karşılığı fiyat listesinde açıkça yazmaz; canlı veride 315–630 mm nominal çap olarak kayıtlıdır. Kanat sayısı, çark malzemesi ve emiş ağzı ölçüsü kaynakta verilmemiştir.",
  "yeni": "Geriye eğik kanatlı, tek emişli, yüksek performanslı çark. Seri KENTALFAN 315'ten KENTALFAN 630'a kadar boy numaralarıyla sunulur."
 },
 {
  "slug": "avens-plug-fanlar",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Doğrudan tahrikli OEM fan olarak sunulur; uygulama alanları klima santralleri, ısı geri kazanım cihazları ve plenum kutularıdır. Montaj plakası, delik deseni, flanş ve gabari ölçüleri kaynakta verilmemiştir. ---",
  "yeni": "Doğrudan tahrikli OEM fan olarak sunulur; uygulama alanları klima santralleri, ısı geri kazanım cihazları ve plenum kutularıdır. ---"
 },
 {
  "slug": "avens-sulu-batarya",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Sulu batarya bir fan değildir; çarkı yoktur.",
  "yeni": "Sulu batarya bir fan değildir; çarkı yoktur."
 },
 {
  "slug": "avens-sulu-batarya",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Model adları bataryayı **kanal tipi** olarak tanımlar. Fiyat listesi bunun ötesinde montaj yönü, servis boşluğu veya kanal bağlantı ölçüsü vermez — *o kısım boş.* ---",
  "yeni": "Model adları bataryayı **kanal tipi** olarak tanımlar. ---"
 },
 {
  "slug": "avens-sulu-batarya",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "*Bu ürün tipi için geçersiz.* Bataryanın motoru yoktur.",
  "yeni": "Bataryanın motoru yoktur."
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "**Bu ürün tipi için geçersiz.** Frekans konvertöründe çark yoktur; ürün hava taşımaz, hava taşıyan fanın motorunu sürer.",
  "yeni": "Frekans konvertöründe çark yoktur; ürün hava taşımaz, hava taşıyan fanın motorunu sürer."
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "AVenS kataloğunda bu aile için gövde, malzeme veya koruma sınıfı bilgisi **YOKTUR** — fiyat listesi yalnız kod, model, motor gücü ve fiyat sütunlarını taşır. Üretici föyünden gelen taban gövde bilgisi: IP20 / Open type, H1–H8 gövde boyları, 2,1–51 kg ağırlık aralığı — **taban (gövdesiz, panel-montaj) varyant varsayımıyla** [MANIFEST].",
  "yeni": "Üretici föyünden gelen taban gövde bilgisi: IP20 / Open type, H1–H8 gövde boyları, 2,1–51 kg ağırlık aralığı."
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Katalogda tesisat kısıtı olarak yalnız kablo mesafesi verilir: maksimum kablo mesafesi 50 metredir. Montaj biçimi, ağırlık ve delik ölçüleri **kaynakta yok** — blok bilinçli olarak boş bırakıldı. ---",
  "yeni": "Katalogda tesisat kısıtı olarak yalnız kablo mesafesi verilir: maksimum kablo mesafesi 50 metredir. ---"
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "**Bu ürün tipi için geçersiz.** Ürünün kendisi motor değil, motor **sürücüsüdür**; sürdüğü motorun gücü Kimlik bölümündeki kW aralığıyla karşılanır.",
  "yeni": "Ürünün kendisi motor değil, motor **sürücüsüdür**; sürdüğü motorun gücü Kimlik bölümündeki kW aralığıyla karşılanır."
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "**Bu ürün tipi için geçersiz** — FC101 ile aynı gerekçe.",
  "yeni": null
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "AVenS kataloğunda bu aile için de gövde, malzeme veya koruma sınıfı bilgisi **YOKTUR**. Üretici föyünden gelen taban gövde bilgisi: IP20 / Chassis, A2–C4 gövde boyları, 4,8–50 kg ağırlık aralığı — **taban varyant varsayımıyla** [MANIFEST].",
  "yeni": "Üretici föyünden gelen taban gövde bilgisi: IP20 / Chassis, A2–C4 gövde boyları, 4,8–50 kg ağırlık aralığı."
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Tesisat kısıtı olarak maksimum kablo mesafesi 150 metredir. Montaj biçimi ve ölçüler **kaynakta yok** — blok bilinçli olarak boş bırakıldı. ---",
  "yeni": "Tesisat kısıtı olarak maksimum kablo mesafesi 150 metredir. ---"
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "**Bu ürün tipi için geçersiz** — ürün motor değil, motor sürücüsüdür.",
  "yeni": "Ürün motor değil, motor sürücüsüdür."
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "**Bu ürün tipi için geçersiz.**",
  "yeni": null
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "**Kaynakta yok** — FC-51 için katalogda hiçbir gövde/malzeme/koruma bilgisi bulunmaz.",
  "yeni": null
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "**Kaynakta yok** — FC101/FC102'de verilen kablo mesafesi kısıtı FC-51 için verilmemiştir. ---",
  "yeni": null
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "**Bu ürün tipi için geçersiz** — ürün motor değil, motor sürücüsüdür.",
  "yeni": "Ürün motor değil, motor sürücüsüdür."
 },
 {
  "slug": "nicotra-gebhardt-adh",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri farklı gövde büyüklüğü gruplarını ayırır; **bu eklerin anlamı kaynakta açıklanmıyor.**",
  "yeni": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri farklı gövde büyüklüğü gruplarını ayırır."
 },
 {
  "slug": "nicotra-gebhardt-adh",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "Kayış kasnak tahriklidir. Motor verisi **kaynakta yok**.",
  "yeni": "Kayış kasnak tahriklidir."
 },
 {
  "slug": "nicotra-gebhardt-at",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "Kayış kasnak tahriklidir. Motor bir katalog kalemi olarak listelenmediği için güç, devir, kutup ve faz bilgisi **kaynakta yok**.",
  "yeni": "Kayış kasnak tahriklidir."
 },
 {
  "slug": "nicotra-gebhardt-at",
  "yol": [
   "maddeler_tr",
   "2"
  ],
  "eski": "Fiyat listesinde model adı yalnız çark ölçüsünü verir; motor gücü, devir ve faz bilgisi tabloda yer almaz.",
  "yeni": "Model adı yalnız çark ölçüsünü verir."
 },
 {
  "slug": "nicotra-gebhardt-dd",
  "yol": [
   "maddeler_tr",
   "0"
  ],
  "eski": "Fiyat listesi ikiye ayırır: standart DD serisi ve 3 hızlı DD 3V serisi; ikisinin de tanım cümlesi aynıdır.",
  "yeni": "Fiyat listesi ikiye ayırır: standart DD serisi ve 3 hızlı DD 3V serisi."
 },
 {
  "slug": "nicotra-gebhardt-rdh",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri ADH ile aynı biçimde kullanılır; anlamları **kaynakta açıklanmıyor.**",
  "yeni": "Fanlar çift emişlidir. Model kodundaki E2, -R ve -K ekleri ADH ile aynı biçimde kullanılır."
 },
 {
  "slug": "nicotra-gebhardt-rdh",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "Kayış kasnak tahriklidir. Motor verisi **kaynakta yok**.",
  "yeni": "Kayış kasnak tahriklidir."
 },
 {
  "slug": "vortice-deumido-range",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "*Kaynakta ayrı bir motor tanımı YOK* — föy motor tipini, kutup sayısını veya verim sınıfını vermez. Verilen tek elektriksel veri cihazın besleme ve tüketim değerleridir: 220–240 V besleme, 260 W (NG 10) ile 500 W (NG 20) arasında güç.",
  "yeni": "Cihazın besleme ve tüketim değerleri şöyledir: 220–240 V besleme, 260 W (NG 10) ile 500 W (NG 20) arasında güç."
 },
 {
  "slug": "vortice-h-ad-elektrikli",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "eski": "Ortaktır: yatay duvar montajı, kapı üstü ya da açıklığa en yakın konum, asgari 2,3 metre montaj yüksekliği ve önerilen azami 4 metre. Ön emişli ızgara sayesinde tavanla arada boşluk gerekmez. Pratik duvar montaj braketiyle kurulur ve geniş açıklıklar için seri montaj mümkündür. Isıtıcılı modellerde hava hızı 8,5/9,5 m/s'dir; ısıtmasız ailenin 9/11 m/s değerinin altında kalır. Montaj yüksekliğinin bu farka göre nasıl seçileceği **kaynakta yazmıyor** — hesap yapılmadı, yorum eklenmedi. ---",
  "yeni": "Ortaktır: yatay duvar montajı, kapı üstü ya da açıklığa en yakın konum, asgari 2,3 metre montaj yüksekliği ve önerilen azami 4 metre. Ön emişli ızgara sayesinde tavanla arada boşluk gerekmez. Pratik duvar montaj braketiyle kurulur ve geniş açıklıklar için seri montaj mümkündür. Isıtıcılı modellerde hava hızı 8,5/9,5 m/s'dir; ısıtmasız ailenin 9/11 m/s değerinin altında kalır. ---"
 },
 {
  "slug": "vortice-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Kontrol"
  ],
  "eski": "Filtre değişim zamanını gösteren **görsel filtre uyarısı** bulunur. *(Kanal bağlantısı, debi kademeleri ve uzaktan kumanda seçenekleri modele göre değişir; kaynakta aile geneli için tek bir kontrol tanımı yok — bu blok bilerek KISA bırakıldı.)*",
  "yeni": "Filtre değişim zamanını gösteren **görsel filtre uyarısı** bulunur."
 },
 {
  "slug": "vortice-vort-commercial-in-line-circular",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "eski": "Dekapaj görmüş, fosfat kaplı çelik saç gövde; agresif hava koşullarına karşı polyester boya ile boyanmıştır. Şebeke bağlantı klemenslerini ve akış yönlendirici kanatçıkları barındıran motor yuvası, kendinden sönümlü plastik reçineden (V0) üretilmiştir. Fiyat listesindeki tanım: metal gövde, standart montaj ayağı. > *DB'deki bugünkü metin V0 sınıfını gövdeye atfediyor; kaynak bu sınıfı **motor yuvası ve klemens > kutusu** için kullanıyor, gövde boyalı çelik saçtır.*",
  "yeni": "Dekapaj görmüş, fosfat kaplı çelik saç gövde; agresif hava koşullarına karşı polyester boya ile boyanmıştır. Şebeke bağlantı klemenslerini ve akış yönlendirici kanatçıkları barındıran motor yuvası, kendinden sönümlü plastik reçineden (V0) üretilmiştir. Fiyat listesindeki tanım: metal gövde, standart montaj ayağı."
 },
 {
  "slug": "vortice-vort-commercial-in-line-circular",
  "yol": [
   "bloklar_tr",
   "Kontrol"
  ],
  "eski": "Fanlar çift hızlıdır; hız anahtarına ihtiyaç duymadan iki farklı hava debisi sağlanabilir, isteğe bağlı olarak hız anahtarı ile kontrol edilebilir. Hız anahtarları sıva üstü montajlı, sigorta korumalı, minimum hız ayarlı ve On/Off anahtarlıdır. Ürün, uzaktan ortam sıcaklığı, nem, duman ve varlık sensörlerine bağlanabilir (opsiyonel). > *Kaynak çelişkisi kayda geçirildi: İtalyan kataloğu aynı seriyi üç hızlı olarak tanımlar ve > opsiyonel TRIO-CA cihazıyla ayarlandığını söyler.*",
  "yeni": "Fanlar çift hızlıdır; hız anahtarına ihtiyaç duymadan iki farklı hava debisi sağlanabilir, isteğe bağlı olarak hız anahtarı ile kontrol edilebilir. Hız anahtarları sıva üstü montajlı, sigorta korumalı, minimum hız ayarlı ve On/Off anahtarlıdır. Ürün, uzaktan ortam sıcaklığı, nem, duman ve varlık sensörlerine bağlanabilir (opsiyonel)."
 },
 {
  "slug": "vortice-vort-mono",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "*(Kaynakta bu aile için çark yapısına dair cümle YOK — **boş bırakıldı**, K7.)*",
  "yeni": null
 },
 {
  "slug": "vortice-vortice-bravo-s",
  "yol": [
   "bloklar_tr",
   "Çark"
  ],
  "eski": "— **bu ürün tipi için geçersiz.** BRA.VO S bir sensördür; hava hareket ettirmez.",
  "yeni": "BRA.VO S bir sensördür; hava hareket ettirmez."
 },
 {
  "slug": "vortice-vortice-bravo-s",
  "yol": [
   "bloklar_tr",
   "Motor"
  ],
  "eski": "— **bu ürün tipi için geçersiz.** Aynı sebep.",
  "yeni": "BRA.VO S bir sensördür; motor içermez."
 }
]$plan$::jsonb;
  r         record;
  v_yol     text[];
  v_simdiki text;
  v_uyg     int := 0;
  v_atla    int := 0;
  v_yokaile int := 0;
  v_kalkan  int := 0;
begin
  for r in select p.value as o from jsonb_array_elements(v_plan) p loop
    if not exists (select 1 from public.product_families where slug = r.o->>'slug') then
      v_yokaile := v_yokaile + 1;
      continue;
    end if;

    v_yol := (select array_agg(t) from jsonb_array_elements_text(r.o->'yol') e(t));
    select description #>> v_yol into v_simdiki
      from public.product_families where slug = r.o->>'slug';

    if r.o->>'yeni' is null then
      -- metnin TAMAMI ic nottu -> blok anahtari kalkar
      if v_simdiki is null then
        raise notice 'K45: %/% anahtari zaten yok, dokunulmadi.', r.o->>'slug', array_to_string(v_yol,'.');
        v_atla := v_atla + 1;
      elsif v_simdiki = r.o->>'eski' then
        update public.product_families
           set description = description #- v_yol
         where slug = r.o->>'slug';
        v_uyg := v_uyg + 1;
        v_kalkan := v_kalkan + 1;
      else
        raise exception 'K45: %/% beklenmeyen deger tasiyor (md5 %) - elle degismis olabilir, uzerine YAZILMADI',
          r.o->>'slug', array_to_string(v_yol,'.'), md5(coalesce(v_simdiki,''));
      end if;
    else
      if v_simdiki = r.o->>'yeni' then
        v_atla := v_atla + 1;
      elsif v_simdiki = r.o->>'eski' then
        update public.product_families
           set description = jsonb_set(description, v_yol, to_jsonb(r.o->>'yeni'))
         where slug = r.o->>'slug';
        v_uyg := v_uyg + 1;
      else
        raise exception 'K45: %/% beklenmeyen deger tasiyor (md5 %) - elle degismis olabilir, uzerine YAZILMADI',
          r.o->>'slug', array_to_string(v_yol,'.'), md5(coalesce(v_simdiki,''));
      end if;
    end if;
  end loop;

  raise notice 'K45: % oge temizlendi (% blok anahtari kalkti), % oge zaten temizdi, % ogenin ailesi bu veritabaninda yok.',
    v_uyg, v_kalkan, v_atla, v_yokaile;
end;
$$;

-- GUARD - uc ayri iddia, ucu de ayri olculur.
do $$
declare
  -- Desen, bugun olculen hazirlik-notu biciminin genellemesidir. Iki bilincli daraltma:
  --   * "YOKTUR" tek basina olcut DEGIL: vortice-hava-perdesi / bloklar_tr.Kontrol blogundaki
  --     "Isitici ac/kapa komutu bu ailede YOKTUR - o islev yalniz AIR DOOR H modelleri icindir"
  --     cumlesi URUN BILGISIDIR (kaynagin eksigi degil, urunun ozelligi) ve musteriye anlamlidir
  --     -> KALIR. Bu yuzden YOKTUR yalniz kaynak/katalog gondermesiyle birlikte yakalanir.
  --   * "kaynak" kelimesi musteriye anlamli oldugunda (isi kaynagi, kaynak islemi) yakalanmaz;
  --     desen "kaynakta/katalogda + eksiklik fiili" kalibini arar.
  v_desen constant text :=
    '\*\(|\(\*|\[MANIFEST\]|\[DB\]|\[s\.\s*[0-9]|\mTODO\M'
    '|[Kk]aynakta yok|[Bb]u ürün tipi için geçersiz'
    '|[Kk]aynakta[^.]{0,80}YOKTUR|[Kk]atalo[^.]{0,80}YOKTUR|bilgisi \*\*YOKTUR\*\*'
    '|boş bırakıldı|tutarsızlık notu|[Bb]kz\. yukarı|kaynak başlığı|asıl bloğu|o kısım boş'
    '|birim yazmıyor|doğrulanmalı|tabloda yer almaz'
    '|[Kk]aynakta [^.]{0,80}(verilmem|anlatılm|yazm|açıklan|belirtilmem|bulunmaz)';
  v_muaf constant text[] := array['danfoss-fc101|bloklar_tr.Koruma', 'danfoss-fc102|bloklar_tr.Koruma', 'danfoss-fc51|bloklar_tr.Koruma', 'vortice-vort-industrial-ventilation-roof|bloklar_tr.Gövde'];
  v_dokunma jsonb := $dokunma$[
 {
  "slug": "vortice-hava-perdesi",
  "yol": [
   "bloklar_tr",
   "Kontrol"
  ],
  "md5": "0eafb2535d3551e905393c9410e74d3f"
 },
 {
  "slug": "vortice-hava-perdesi",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "b72813916f05ff3b86d44592a4736219"
 },
 {
  "slug": "vortice-isi-geri-kazanim",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "4c9d2feed5ee44c9b1c54371f86a15a1"
 },
 {
  "slug": "vortice-lineo",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "md5": "0148c4524038dfa86c81d92418f15eec"
 },
 {
  "slug": "vortice-lineo",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "40480363d5be6379d056c995fc73100a"
 },
 {
  "slug": "vortice-lineo-quiet",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "467cfd85f178c561a9c99375b4200720"
 },
 {
  "slug": "vortice-punto-evo-flexo",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "cfdf39453d76ef1ec8103c75f9e30b18"
 },
 {
  "slug": "vortice-radon-range-circular",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "9a85e90e9786ecc380c3e599c7f0b26d"
 },
 {
  "slug": "vortice-radon-range-roof",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "f7930dc2248ca54666a83774f2167eae"
 },
 {
  "slug": "vortice-vort-commercial-in-line-circular",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "e313c5a07c206d6c316414b94bdbfe24"
 },
 {
  "slug": "vortice-vort-e-atex",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "c4dc3357a278a0af5df7fde5f13292b1"
 },
 {
  "slug": "vortice-vort-heatmaster-slimroof-roof",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "3f7a7eb036f0c9cf975dae2f4d71949c"
 },
 {
  "slug": "vortice-vort-heatmaster-slimroof-smoke",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "b8d3640181f546afc24b5cbbb138f24e"
 },
 {
  "slug": "vortice-vort-industrial-ventilation-axial",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "6242180e3a70d93be67938eb4d08b192"
 },
 {
  "slug": "vortice-vort-mono",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "c646a82c10f4afb250ba0fb75d0c2272"
 },
 {
  "slug": "vortice-vort-quadro-evo",
  "yol": [
   "bloklar_tr",
   "Montaj"
  ],
  "md5": "d71091f54a50264483a6b9749211365c"
 },
 {
  "slug": "danfoss-fc101",
  "yol": [
   "bloklar_tr",
   "Koruma"
  ],
  "md5": "3c88f8e029eb7ccddcb60ebfcad2f1d6"
 },
 {
  "slug": "danfoss-fc102",
  "yol": [
   "bloklar_tr",
   "Koruma"
  ],
  "md5": "c3b897f3a23904dbaa19dc1c7b22cbd7"
 },
 {
  "slug": "danfoss-fc51",
  "yol": [
   "bloklar_tr",
   "Koruma"
  ],
  "md5": "5d923fac76e5a8bac0952e35eaefaba6"
 },
 {
  "slug": "vortice-vort-industrial-ventilation-roof",
  "yol": [
   "bloklar_tr",
   "Gövde"
  ],
  "md5": "947c8246d1c6f12080aadc4a12ab163f"
 }
]$dokunma$::jsonb;
  v_kalan int;
  v_ornek text;
  v_var   int;
  r       record;
  v_yol   text[];
  v_md5   text;
  v_bozuk int := 0;
begin
  -- 3a) Vitrinde CIZILEN alanlarda (karar 42 evreni) not deseni hala 0 olmali.
  select count(*), min(k) into v_kalan, v_ornek
    from (
      select f.slug || ':' || a.alan as k, a.metin
        from public.product_families f
        cross join lateral (values
          ('description.tr',      f.description->>'tr'),
          ('description.en',      f.description->>'en'),
          ('meta_title.tr',       f.meta_title->>'tr'),
          ('meta_title.en',       f.meta_title->>'en'),
          ('meta_description.tr', f.meta_description->>'tr'),
          ('meta_description.en', f.meta_description->>'en')
        ) as a(alan, metin)
       where f.deleted_at is null
    ) x
   where x.metin ~ v_desen;
  if v_kalan > 0 then
    raise exception 'K45 GUARD 3a: vitrinde cizilen aile metninde % editor notu var (ilk: %)', v_kalan, v_ornek;
  end if;

  -- 3b) bloklar_tr + maddeler_tr: hazirlik notu yalniz AYRI LISTE'ye alinan 4 ogede kalabilir.
  select count(*), min(k) into v_kalan, v_ornek
    from (
      select f.slug || '|bloklar_tr.' || e.k as k, e.v #>> '{}' as metin
        from public.product_families f,
             jsonb_each(coalesce(f.description->'bloklar_tr','{}'::jsonb)) as e(k,v)
       where f.deleted_at is null
      union all
      select f.slug || '|maddeler_tr[' || (e.i-1) || ']', e.v #>> '{}'
        from public.product_families f,
             jsonb_array_elements(coalesce(f.description->'maddeler_tr','[]'::jsonb))
               with ordinality as e(v,i)
       where f.deleted_at is null
    ) x
   where x.metin ~ v_desen
     and x.k <> all (v_muaf);
  if v_kalan > 0 then
    raise exception 'K45 GUARD 3b: blok/madde metninde % hazirlik notu kaldi (ilk: %)', v_kalan, v_ornek;
  end if;

  -- 3c) DOKUNULMAYACAK 20 oge (16 bicim + 4 ayri liste) yerinde ve md5'i degismemis olmali.
  --     Bu, "--- ve > isaretlerine dokunulmadi" ile "ayri liste ogeleri yanlislikla silinmedi"
  --     iddialarinin kanitidir.
  for r in select d.value->>'slug' as slug, d.value->'yol' as yol, d.value->>'md5' as md5
             from jsonb_array_elements(v_dokunma) d loop
    select count(*) into v_var from public.product_families where slug = r.slug;
    if v_var = 0 then
      continue;  -- bos veritabani / golge
    end if;
    v_yol := (select array_agg(t) from jsonb_array_elements_text(r.yol) e(t));
    select md5(description #>> v_yol) into v_md5
      from public.product_families where slug = r.slug;
    if v_md5 is null or v_md5 <> r.md5 then
      raise warning 'K45 GUARD 3c: %/% degismis veya silinmis (md5 % <> %)',
        r.slug, array_to_string(v_yol,'.'), coalesce(v_md5,'YOK'), r.md5;
      v_bozuk := v_bozuk + 1;
    end if;
  end loop;
  if v_bozuk > 0 then
    raise exception 'K45 GUARD 3c: dokunulmamasi gereken % oge degismis - ayrintilar yukaridaki uyarilarda', v_bozuk;
  end if;

  raise notice 'K45 GUARD GECTI: vitrin metni 0 not - blok/madde metninde muaf 4 oge disinda 0 not - dokunulmayan 20 oge birebir.';
end;
$$;

commit;
