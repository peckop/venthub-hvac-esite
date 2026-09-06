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
* **Alt kategoriler** — 24 alt kategorinin **17'sinde ürün VAR** (365 ürün, `subcategory_id`
  sütunuyla; ilk ölçümüm yalnız `category_id`'ye baktığı için "hiçbirinde yok" demişti,
  yanlıştı). Dolayısıyla bu altı paragraf **kapsamın tamamı değil**: rehber paragrafının
  17 alt kategoriye de yazılıp yazılmayacağı kapsam kararıdır (6 → 23), OPS/Recep'te.
