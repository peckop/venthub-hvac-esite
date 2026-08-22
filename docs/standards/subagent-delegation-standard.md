# Alt-Ajan Devri Cetveli (Subagent Delegation Standard)

> **Bu cetvel şu soruyu cevaplar:** bir işi kendim mi yapayım, alt-ajana mı devredeyim;
> devredeceksem kaç tanesine, hangi modelle, neyi yasaklayarak ve sonucu neye göre kabul ederek?
>
> Kapsam: Claude Code oturumlarının açtığı alt-ajanlar (Agent aracı). Oturumlar-arası
> koordinasyon (eş-Controller / şerit sahipliği / pano) bu cetvelin konusu **değildir** —
> o `collaboration-protocol.md` içindedir.
>
> Durum: v1.0 · 2026-08-22 · ÜRÜN şeridi · dayanak: aşağıdaki her kural yaşanmış bir olaydan damıtıldı.

---

## 1. Önce karar: devretmeli mi?

Alt-ajan **bedava değildir**. Maliyeti üç kalemdir: görev tarifini yazma emeği, sonucu
doğrulama emeği, ve yanlış sonucun sessizce kabul edilme riski. Devir, ancak bu üçünün
toplamı işi kendin yapmaktan **ucuzsa** kârlıdır.

**Devret** — iş şu üç özellikten en az ikisini taşıyorsa:
- **Geniş tarama:** cevap çok sayıda dosya/kayıt/sayfa arasına dağılmış, sen yalnız sonucu istiyorsun.
- **Bağımsız:** başka bir işin çıktısını beklemiyor, başka işin girdisini bozmuyor.
- **Doğrulanabilir:** sonucun doğru olup olmadığını, ajanın anlatısına bakmadan, kendi
  ölçtüğün bir sayı/dosya/HTTP cevabı ile sınayabiliyorsun.

**Devretme** — şu durumlarda kendin yap:
- **Tek dosyada tek gerçek** aranıyor (nerede olduğunu zaten biliyorsun) → doğrudan oku.
- İş **karar** üretiyor, veri değil. Karar senin ve kullanıcının; ajan karar veremez.
- İş **geri alınamaz** bir eylem içeriyor (§3).
- Sonucu doğrulamanın maliyeti işi yapmanın maliyetine yakın. O zaman devir yalnız
  **risk taşımış** olur, iş azaltmaz.

---

## 2. Karar tablosu: iş türü → araç

| İş türü | Araç | Model | Paralel? |
|---|---|---|---|
| "Ne çağırıyor / neyi etkiler / nerede tanımlı" | **CodeGraph** (ajan değil) | — | — |
| "Bu kural neden böyle / mimari karar" | **NotebookLM ikizi** veya `CONTEXT.md` | — | — |
| Bilinen dosyada bilinen sembol | Doğrudan `Read` | — | — |
| Geniş kod taraması, konum bulma | `Explore` ajanı | Sonnet | Evet |
| Belge/PDF/web'den veri çıkarma, katalog eşleme | `general-purpose` | **Sonnet** | Evet |
| Salt-okuma DB denetimi, hipotez ölçme | `general-purpose` | **Sonnet** | Evet |
| Kod yazma + test koşturma | **Kendin** (veya TEK ajan) | — | **HAYIR** (§4) |
| Prod veri yazımı, migration, PR merge | **Kendin, kullanıcı GO'su ile** | — | — |

**Mekanik okuma Sonnet'e gider.** Föy okuma, tablo çıkarma, kod tarama, sayım — bunlar
muhakeme değil, dikkat işidir; daha büyük model buna harcanmaz.

---

## 3. Alt-ajana MUTLAK YASAKLAR

Her görev tarifine **kelimesi kelimesine** yazılır. Yazılmamış yasak, yasak değildir:
ajan varsayılan olarak yardımsever davranır ve boşluğu doldurur.

1. **Veritabanına yazma YASAK.** Yalnız `SELECT`/`GET`. `--apply`, `PATCH`, `INSERT`,
   `UPDATE` hiçbir koşulda yok.
   *Niçin:* bir alt-ajan bir kez kendiliğinden prod'a yazdı. Okuma ile yazma **ayrı**
   yetkidir; ajanın eline yalnız okuma verilir.
2. **PR açma YASAK.** Ajan dal push edebilir; PR'ı açan ve merge eden oturumdur.
   *Niçin:* PR bir beyandır — "bu iş bitti, incelenebilir". Beyanı, sonucu doğrulayan taraf verir.
3. **Değer uydurma YASAK.** Bulunamayan veri **boş bırakılır** ve "KAYNAK YOK" yazılır.
   *Niçin:* zorunlu görünen bir alan uydurmaya basınç uygular; bir kez boş hücreler ardışık
   sayılarla dolduruldu ve dördü kaynakta hiç yoktu.
4. **Geri alınamaz kabuk komutu YASAK** (`push --force`, `reset --hard`, dosya silme,
   dağıtım tetikleme).
5. **Kapsam dışı dosyaya dokunma YASAK.** Ajanın yazabileceği yollar tarifte **adıyla** sayılır.
6. **Sistem değişikliği YASAK.** Paket kurulumu (`winget install`, `npm i -g`, `pip install`,
   `apt`, `brew`), PATH değişikliği, servis/daemon başlatma, global yapılandırma yazımı.
   İhtiyaç duyduğu araç yoksa ajan bunu **rapor eder, kurmaz.**
   *Niçin:* 2026-08-22'de bir ajan PDF sayfalarını görüntüye çevirmek için `winget` ile
   poppler kurdu. Araç zararsızdı ve iş doğru çıktı — ama karar bana ait değildi ve ben
   ancak iş bittikten sonra öğrendim. Sistem değişikliği **oturumdan uzun yaşar**: ajan
   biter, kurulum kalır. Devrin sınırı ajanın ömrüyle bitmeli.

   **Yasak olan kurulumun kendisi değil, izinsiz kurulumdur.** Kapı iki kademelidir
   (kullanıcı onayı 2026-08-22):
   - **Düşük riskli, geri alınabilir, yerel** araç (PDF aracı, geliştirme bağımlılığı) →
     **lider onayı yeterlidir.** Ajan "şu lazım, kurayım mı?" diye sorar; lider onaylar,
     kayda geçirir ve kullanıcıya **bildirir** (görünürlük onayın parçasıdır).
   - **Geri alınamaz / prod veri yazımı / migration / silme / güvenlik-hassas** →
     **yalnız kullanıcı.** Bu kademe devredilemez.
   - **Emin değilsen üst kademeyi say.** Varsayılan sıkı taraftır.

---

## 4. Paralellik kuralı: çakışma yüzeyine göre

Paralelliğin sınırı model değil, **paylaşılan yazılabilir yüzeydir**.

- **Salt-okuma ajanları:** serbestçe paralel. Ortak yüzey yok, çakışma yok.
- **Aynı worktree'de dosya yazan ajanlar:** **paralel çalıştırılmaz.** Aynı çalışma
  ağacında ikinci bir ajanın `checkout`'u, birincinin commit'lenmemiş işini yer.
  Ya tek ajan, ya her birine ayrı worktree izolasyonu.
- **Kod yazan iş + kod okuyan iş:** aynı anda olur, yazan **tek** olduğu sürece.

Pratik dizilim: **okuma işlerini fan-out et, yazma işini kendinde tut.** Bu, kazancın
büyük kısmını çakışma riski almadan verir.

---

## 5. Görev tarifi şablonu

Zayıf tarif, zayıf sonucun **asıl** sebebidir; ajanın yeteneği değil. Bir tarifte şu altı
blok bulunur:

1. **Rol ve mod:** "SALT-OKUMA araştırma ajanısın."
2. **Mutlak yasaklar:** §3'ten ilgili maddeler, kelimesi kelimesine.
3. **Bağlam ve cetvel:** hangi kural dosyası geçerli — **yolu ver, özetini de ver.**
   Ajan dosyayı okumazsa diye özet; okursa diye yol.
4. **Eşleme/karar kuralı:** belirsizlik nasıl çözülecek. Örn: *"Ada göre eşleme YAPMA;
   referans kodu ↔ `model_code` birebir eşleşmesi kur. Eşleşmeyeni EŞLEŞMEDİ diye ayır."*
   *Niçin:* eşleme kuralı verilmezse ajan en yakın benzerliği seçer ve bunu bulgu diye sunar.
5. **Ölçülecek şey, hipotez biçiminde:** "H1 … H4; her birine DOĞRULANDI / ÇÜRÜTÜLDÜ /
   ÖLÇEMEDİM ver." Serbest "araştır" tarifi anlatı üretir, ölçüm üretmez.
6. **Çıktı şeması:** başlıklar tek tek sayılır — envanter, kaynak (URL/yol), eşleme tablosu,
   **eşleşmeyenler**, çelişkiler, risk notu.

**"ÖLÇEMEDİM" seçeneğini daima tarifte sun.** Sunulmazsa ajan boşluğu tahminle doldurur ve
tahmin, ölçümden ayırt edilemez biçimde raporlanır.

---

## 6. Sonucu kabul etme kuralı

Ajanın raporu **iddiadır, kanıt değildir.** Kabul etmeden önce:

- **Bir örneği kendin ölç.** Rapordaki bir satırı seç, kaynağına git. Tutmuyorsa raporun
  tamamı şüphelidir — çünkü aynı yöntem tüm satırları üretti.
- **Sayıyı değil mekanizmayı iste.** "26 kayıt düzeltilebilir" bir sayıdır; hangi kaynağın
  hangi satırının bunu söylediği mekanizmadır. Sayı doğrulanamaz, mekanizma doğrulanır.
- **Negatif kanıta bak.** "Eşleşmeyenler" bölümü boşsa bu iyi haber değil, **şüphe**
  sebebidir: gerçek veride her zaman artık kalır.
- **Ajanın hatasını peşinen kabul etme, peşinen reddetme de.** Ajan bir keresinde benim
  verdiğim zayıf eşleme kuralını kendiliğinden daha sağlamıyla değiştirdi ve haklıydı.
- **Yalnız çıktıyı değil, ajanın NE YAPTIĞINI da denetle.** Rapor "şu değeri buldum" der;
  o değeri bulmak için makinede ne değiştirdiğini söylemeyebilir. Sistem durumunu
  (kurulu paket, yeni dosya, değişen yapılandırma) ayrıca ölç — özellikle ajan bir
  aracın eksik olduğundan söz ediyorsa.
- **Fiziksel/mantıksal tutarlılığı ücretsiz bir kapı olarak kullan.** Sayılar monoton mu,
  büyüklükler makul mü, birimler birbirini tutuyor mu — bu kontrol kaynağa gitmeden
  yapılır ve uydurma değerlerin çoğunu tek başına eler.

---

## 7. Kendi teşhisini çürüt

Buraya kadarki bölümler ajanın çıktısını denetlemeyi anlatıyor. Bu bölüm **kendi
çıktını** denetlemeyi anlatıyor ve daha önemlidir: ajanın hatasını yakalamak için zaten
şüpheci bakıyorsun, kendi teşhisine bakmıyorsun.

**Damıtıldığı olay (2026-08-22):** "Ürün sayfasının etiketleri koda gömülü bir haritadan
geliyor" diye teşhis koydum ve kullanıcıya ilettim. Yanlıştı — sayfa zaten sözlükten okuyan
doğru katmanı kullanıyordu, koda gömülü harita başka bir yüzeye (PDF üretimi) gidiyordu.
Hatayı ben bulmadım; başka bir şerit ölçüp düzeltti. **Tek şerit olsaydım yanlış teşhis
işe dönüşecekti.**

Beni yanıltan üç adım, sırayla:
1. Dosyayı arama ile buldum, içindeki fonksiyonu gördüm, **çağıranın onu kullandığını
   varsaydım** — çağrı zincirini okumadım.
2. Canlı sayfada o dizeyi **aradım ve bulamadım.** Yani teşhisi çürüten bir ölçüm elime
   geçti.
3. O ölçümü "araç kör olabilir" diye **geçtim** ve teşhisi değiştirmedim.

Üçüncüsü asıl hatadır. Araç gerçekten kör olabilir — ama körlük iddiası, teşhisi ayakta
tutmanın bedava yolu değildir: **körlüğü ayrıca kanıtlaman gerekir.**

### Uygulama

- **Teşhis ≠ ölçüm.** "Şu dosyada şu fonksiyon var" bir ölçümdür. "Sayfa onu kullanıyor"
  bir teşhistir ve ayrı ölçüm ister (çağrı zinciri, import, canlı çıktı).
- **Çürüten ölçüm gelirse teşhis değişir.** Aracı suçlamadan önce aracın kör olduğunu
  kanıtla; kanıtlayamıyorsan ölçüm haklıdır.
- **"Ölçtüm" ile "ölçebildim" ayrıdır.** Aracın göremediği yeri **adıyla** yaz:
  *"curl sunucu HTML'ini görür; varyant seçimi tarayıcıda olduğu için bu soruya kördür."*
  Bunu yazmayan bir ölçüm, cevabı "sorun yok" sanılır.
- **Çürütücü ajan koş.** Şu üç eşikte, kendi işini **yıkmakla görevli** bir ajan aç:
  (a) prod yazımından önce, (b) plan sunmadan önce, (c) kullanıcıya teşhis iletmeden önce.
  Tarifi doğrulama değil **çürütme** olmalı: iddiaları tek tek say, her birine
  ÇÜRÜTÜLDÜ / AYAKTA / ÖLÇEMEDİM dedirt, ve **"emin değilsen plan sahibinin aleyhine
  karar ver"** de. "Planı gözden geçir" diyen bir tarif, onay üretir.
- **"Bulamadım" ile "yok" ayrıdır.** Çürütücünün "ÖLÇEMEDİM"i bir başarı raporu değil,
  açık bir risktir; kullanıcıya öyle taşınır.
- Çok şeritli çalışmada başka bir şeridin seni düzeltmesi **şans**tır, mekanizma değil.
  Mekanizma, kendi kurduğun çürütmedir.

## 8. Devredilemez olanlar

Şunlar hiçbir koşulda alt-ajana geçmez:

- **Kullanıcı kapısı gerektiren her şey:** prod veri yazımı, migration merge, geri alınamaz eylem.
- **Kapsam kararı:** neyin yapılıp neyin bırakılacağı.
- **Sıra kararının kullanıcıya sunulması.**
- **Engellenmiş işin başkasına yaptırılması.** Bir izin/kapı seni durdurduysa çözüm
  yapılandırmayı düzeltmektir; işi engellenmemiş bir tarafa devretmek **izin aklamasıdır**.

---

## 9. Bu cetvelin kapısı

Bu cetvel bir **süreç** cetvelidir; kodu değil davranışı yönetir, bu yüzden onu zorlayan
otomatik test **yoktur** ve olmaması bilinçlidir. Uygulanmasının tek ölçüsü, devredilen her
işin §5 şablonuna ve §6 kabul kuralına göre denetlenebilmesidir. Bir devir bu cetvele
uymuyorsa, sonucu **ölçülmemiş** sayılır.
