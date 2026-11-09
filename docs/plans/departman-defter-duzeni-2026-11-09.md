# Departman yaşayan defter düzeni — tasarım notu (TASLAK v0.1)

Sahibi: HARİTA (not ve defter biçimi); kanca bölümü ARAÇ, CI bölümü ALTYAPI · Son doğrulama: 2026-11-09 · Kaynak: OPS-258 (Recep kararı, 9 Kasım) · Kart: HRT-124 · Cetvel: yok; bu not onaylanırsa `docs/standards/` altında kısa bir cetvele dönüşür (§11, adım 1).

**Durum: yalnız tasarım.** Bu notla birlikte kod, kanca, iş akışı ya da rol kartı değişmez. Her değişiklik §11'deki sıraya göre ayrı kartla gelir.

## 0. Özet

Recep'in istediği şey şudur: her departman kendi alanının geçmişini, bugünkü hâlini ve sırasını tek yerde tutar; üç ay sonra aynı alanda yeni söz gelince departman önce deftere bakar, aynı işi yeniden yapmaz; Recep "göster" deyince hazır bir sayfa vardır. Bunun model inisiyatifine bırakılmaması istenmiştir.

Önerim şu beş cümledir.

1. Defter, alanın **bugünkü hâlini** tutar. İş geçmişi Kanban'da, dersler sage'de, nasıl yapılacağı cetvelde kalır; defter bunların hiçbirini kopyalamaz, onlara işaret eder.
2. Her defter beş parçalıdır: tek sahip, depoda tek yer, güncelleme tetiği, otomatik tutarlılık kontrolü, defterden üretilen Recep sayfası. Beşinden biri eksikse o dosya defter sayılmaz, düz belgedir.
3. Hangi dosyanın defter olduğunu tek bir liste (manifest) söyler. Açılış kancası, önceki-çalışma taraması ve PR kapısı aynı listeyi okur; ikinci bir liste tutulmaz.
4. Zorlama dört noktadan gelir: açılış satırı, önceki-çalışma taraması, PR kapısı, depo dışı kaynaklar için zamanlı ölçüm. Bunların hiçbiri modelin hatırlamasına dayanmaz.
5. Sıra: önce bu not ve manifest, sonra iki pilot (URUN adres, GEO-SEO dizin), sonra mevcut kaydı olan departmanlar, en sonda yeni yazılacaklar.

## 1. Ayrım: hangi bilgi nerede yaşar

Bugün aynı soruya beş yerde cevap aranıyor; mükerrer iş çıkmasının sebebi budur (8 Kasım, KTL-84 UnoPIM ölçümü: ölçüm defterinde vardı, emir yine de sıfırdan yazıldı). Ayrım şöyle:

| Katman | Sorduğu soru | Yaşadığı yer | Kim yazar | Kim zorlar |
|---|---|---|---|---|
| Kanban | "Bu iş yapıldı mı, kimde, hangi kanıtla?" | Departman panoları | Kartı açan müdür | `done-kanit-kapisi`, kart numarası kuralı |
| sage / hafıza | "Bu hatayı daha önce yaptık mı, ders ne?" | Depo dışı sage | Dersi çıkaran müdür | Düzeltme-dersi kapısı, hafıza enjeksiyonu |
| **Defter** | **"Bu alanın bugün durumu ne, elimizde ne var, sırada ne var?"** | `docs/defter/<ad>.md` | Alanın sahibi departman | **Bu notun konusu** |
| Cetvel | "Bu iş nasıl yapılır, hangi ölçüt geçerli?" | `docs/standards/` | Cetvel sahibi | Sahiplik kaydı, tazelik ölçümü |
| Ölçüm defteri | "Bu konu daha önce ölçüldü mü, sonuç ne?" | `docs/olcum/` | Ölçümü yapan | Önceki-çalışma kapısı |
| Zorlama | "Bu kural çiğnenirse ne olur?" | Kanca, CI, zamanlı görev | ARAÇ / ALTYAPI | Kendisi |

Üç sınır önemlidir:

- **Defter ölçüm defteri değildir.** `docs/olcum/` konu başına tek ölçümdür ("e-fatura zorunlu mu"), defter departman başına alan haritasıdır ("URUN'un elinde hangi adresler var"). Defter, ölçüm defterine bağlantı verir; ölçümü içine kopyalamaz.
- **Defter iş listesi değildir.** "Sırada" bölümü yalnız öncelik ve gerekçe taşır; iş durumu Kanban'dadır. Karta dönüşen madde kart numarası alır, durumunu Kanban'dan okur.
- **Defter ders listesi değildir.** Bir kural hata sonucu doğduysa sage'e ve rol kartının kurallar dosyasına gider; deftere "karar" olarak yalnız alanın şeklini değiştiren karar girer.

## 2. HRT-118'den ne kalıyor, ne değişiyor

HRT-118 (8 Kasım, PR #2377, OPS-254 daralınca kapatıldı; uzak dal `harita/hrt118-departman-defteri` duruyor) `docs/defter/README.md` ve bir Blog şablonu yazmıştı. Oradan alınanlar aynen kalır:

- Dosya yeri: `docs/defter/<departman>.md` (küçük harf). Bir departman birden çok defter tutacaksa `docs/defter/<departman>-<konu>.md`.
- Dört sabit bölüm, bu sırayla: 1 Ne yaptık · 2 Envanter · 3 Sırada ve yapılabilecekler · 4 Kararlar. Yeni satır bölüm başına en üste.
- İki kural: kart Done olurken defter güncellenir; yeni iş ya da emir önce deftere bakar.
- Başlık altında `Sahibi:` ve `Son doğrulama:` satırı; 14 günü aşan doğrulama belge-tazelik ölçümüne düşer.
- Arama verisi deftere yazılmaz; ölçümün durduğu yere işaret edilir.

HRT-118'de **eksik olan** ve bu notun eklediği şey zorlamadır. O sürümde "kanca ya da kapı yoktur" yazıyordu; sonuç, defterin hatırlamaya bağlı olmasıydı. Yeni sürümde:

- "Kart Done olurken defter güncellenir" kuralı PR kapısıyla ölçülür (§6.3).
- "Yeni iş önce deftere bakar" kuralı önceki-çalışma taramasıyla ve emir kapısıyla ölçülür (§6.2).
- Dört bölüme beş parçalı çerçeve (§3) ve manifest (§4) eklenir.
- Recep sayfası (§3.5) HRT-118'de yoktu.

Bölüm 2 (Envanter) için tek ek kural: her envanter satırı son doğrulama tarihini taşır ve satırın dayandığı **yolu ya da komutu** gösterir. Yolu ya da komutu olmayan satır "iddiadır", defter envanterinde yer almaz.

## 3. Defterin beş parçası

### 3.1 Tek sahip

Her defterin tek sahibi bir departmandır; manifestte `sahip` alanı vardır. Paylaşılan alan varsa (örnek: URUN adresleri, GEO-SEO ölçer, ALTYAPI rota dilini tutar) defteri **alanın ana sahibi** yazar, ötekiler "Sırada" bölümüne madde ekleyerek katkı verir, kendi defterlerini açmaz. Sahibi olmayan ya da iki sahipli defter manifest kontrolünde kırmızı olur.

### 3.2 Depoda tek yer

Defter `docs/defter/` altındadır; başka yerde kopyası olamaz. Mevcut kayıtların taşınması gerekmez: `docs/mevzuat/kayit.json` ya da `docs/olcum/wrongstack-ozellik-envanteri.md` gibi zaten yaşayan kayıtlar manifestte **olduğu yerde** defter olarak tanıtılabilir (`dosya` alanı o yolu gösterir). Kural "hepsi docs/defter/ altında" değil, "her alanın bir yeri vardır ve manifest o yeri söyler" olur. Aksi hâlde çalışan kayıtlar taşınır, bağlantıları kopar, eski kayıt ile yenisi yan yana bayatlar.

Depo herkese açıktır. Deftere ham arama verisi (sorgu, tıklama, sıra), maliyet ve tedarik verisi, sır, kişisel veri girmez. Depo dışı kaynaklı bilgi deftere **özet** olarak girer: sayı, tarih, ham dosyanın sha256'sı.

### 3.3 Güncelleme tetiği

Her defter şu üç tetikten en az ikisine bağlıdır; manifest hangilerini taşıdığını yazar.

| Tetik | Nasıl çalışır | Kim zorlar |
|---|---|---|
| Kart kapanışı | Defterin izlediği yolu değiştiren PR defter dosyasını da değiştirir (ya da gerekçeli istisna taşır) | PR kapısı (§6.3) |
| Süre | `Son doğrulama` 14 günü (varsayılan; manifestte defter başına değişebilir) aşarsa açılış satırı uyarır | Açılış satırı (§6.1) |
| Dış kaynak değişimi | Depo dışı kaynağın (Design, GSC, UnoPIM) günlük ölçümü defterdeki özetten saparsa uyarı | Zamanlı ölçüm (§6.4) |

### 3.4 Otomatik tutarlılık kontrolü

Defterin söylediği şey ile gerçek arasındaki farkı ölçen bir komut. Her defter için manifestte `olcum` alanı bulunur; komut salt okuma, ağsız (ya da ağı açıkça belirtir) ve çıkış koduyla konuşur: 0 tutarlı, 1 sapma, 2 ölçülemedi. "Ölçülemedi" asla "tutarlı" sayılmaz.

Örnekler (hepsi mevcut ya da yazılması küçük):

- URUN adres defteri: defterdeki adres sayısı ile `next.config.mjs` yönlendirme listesi ve site haritası sayısı eşleşiyor mu.
- GEO-SEO dizin defteri: `dizin-takip --durum` anlık görüntüsündeki adres sayısı ile defterin envanter sayısı eşleşiyor mu.
- BLOG yazı defteri: defterdeki yazı sayısı ile `yazilar.ts` kayıt sayısı eşleşiyor mu.
- MEVZUAT: kalem sayısı kaydın kendisinde zaten tutuluyor; kontrol "defterde elle yazılmış sayı yok" olur.

Kontrol yazılana kadar defter "kontrolsüz" damgalı olur ve "yarım defter" sayılır; yarım defter pilot aşamasında kabul edilir, yayılımda kabul edilmez.

### 3.5 Defterden üretilen Recep sayfası

Recep "göster" dediğinde hazır sayfa olması için sayfa **el ile yazılmaz**, defterden betikle üretilir. Önerim: `scripts/belge/defter-sayfa.cjs` manifestteki defterleri okur, her defter için dört satırlık bir kart çıkarır (alan ne, bugün durum, son doğrulama, sırada en önemli üç madde) ve tek bir HTML artifact olarak yayımlar. Emsal: `scripts/kanban/pano-sayfasi.cjs` (Kanban panosunun sayfası; "ikinci okuyucu yazılmaz" kuralını koyan betik). Defter sayfası Kanban'ı yeniden okumaz; yalnız defterde yazılı kart numaralarını gösterir.

Sayfa gerçek veriden üretilir, bu yüzden **sahte tazelik** riskine karşı her kartın üstünde defterin `Son doğrulama` tarihi görünür ve 14 günü aşan kart kırmızı çerçeveyle çıkar. Sayfa bayat defteri güzel göstermez.

## 4. Manifest ve rol kartı satırı

### 4.1 Manifest

Tek liste: `docs/defter/manifest.json`. Önerilen şema:

```json
{
  "defterler": [
    {
      "ad": "urun-adres",
      "dosya": "docs/defter/urun-adres.md",
      "sahip": "URUN",
      "izlenen": ["next.config.mjs", "src/config/markaYonlendirmeleri.mjs", "docs/standards/adres-semasi-standard.md"],
      "tazelikGun": 14,
      "tetik": ["kart-kapanisi", "sure"],
      "olcum": "node scripts/...",
      "disKaynak": null,
      "durum": "pilot"
    }
  ]
}
```

Alanlar: `izlenen` PR kapısının baktığı yollar (dar glob; geniş yol yorgunluk yaratır, §6.3); `olcum` §3.4 komutu ya da `null` (kontrolsüz); `disKaynak` depo dışı kaynak adı (`gsc`, `unopim`, `design`) ya da `null`; `durum` `pilot | aktif | kontrolsuz | emekli`.

Manifestin kendi kontrolü (rol kartı üreticisinin ve belge-tazelik ölçümünün yanına eklenen küçük bir test) şunları arar: her kaydın dosyası var, sahibi geçerli bir rol, `izlenen` yolların her biri depoda var, aynı dosya iki kayıtta geçmiyor, `durum: aktif` olan kaydın `olcum` alanı dolu.

### 4.2 Rol kartında "sürekli defterleri" satırı

Rol kartlarına tek satır eklenir: `Sürekli defterler: <ad> (docs/defter/<ad>.md), …`; defteri olmayan departmanda satır "yok" yazmaz, hiç çıkmaz. Veri kaynağı manifesttir; üretici (`scripts/belge/rol-karti-uret.cjs`) satırı oradan yazar, elle düzenlenmez. Bu, düzenli görevlerin `rol-gorevleri.json` → kart akışının aynısıdır.

**Bayt riski (ölçülmedi, ölçülecek):** kart fiilî tavanı 6.255 B, açılış özeti 2.048 B ve son ölçümde 2.044 B (dar). Satır yalnız defteri olan departmanın kartına girer ve en çok iki defter adı taşır; fazlası "…(+N, manifest)" olarak kısalır. Açılış özetine **girmez**; açılışta defter bilgisi §6.1'deki tek satırla gelir. Uygulama kartı, satırı eklemeden önce 18 kartın bayt payını ölçer (kural: ortak satır PR'ı, üç ölçüm PR'dan önce).

## 5. Pilotlar

### 5.1 URUN adres / yönlendirme defteri

Durum: URN-157 (eski→yeni adres eşleştirme tablosu ve 308) **geçişe bağlı ve beklemede**; kart "emir gelmeden başlanmaz" diyor ve geçiş tarihi belli değil (OPS-180 C aşaması). Bu notun önerisi, defteri kartın işinden **ayırmaktır**:

- Defter, **bugünkü canlı adres şemasını** tutar: kaç kanonik adres, kaç yönlendirme, hangi kural hangi cetvelde (`adres-semasi-standard.md` A6/A9, `canonical-url-standard.md`), SEO-76 ölçümünün son sonucu (canlı 94 adresin 93'ünün Design ara şema listesinde olmadığı, 6 çakışma). Bu bilgi bugün dört yerde dağınık.
- URN-157'nin üreteceği **geçiş tablosu** deftere "Sırada" bölümünde madde olarak girer ve kart açıldığında defterin 1. bölümüne taşınır. Defter tablonun kendisini içermez (tablo üretilmiş artefakttır), yalnız yerini ve kapısını gösterir.
- Böylece pilot, geçişi beklemeden başlayabilir; ALTYAPI görüşüne göre de defter kapısı (PR "defter güncellendi mi" kapısı) geçişten bağımsız UYARI kipinde açılabilir, içerik kapıları (ALT-177: A7, A9, A10) geçiş tarihine bağlı kalır (§7).
- İzlenen yollar önerisi: `next.config.mjs` (yönlendirme bloğu), `src/config/markaYonlendirmeleri.mjs`, `docs/standards/adres-semasi-standard.md`, rota dili ve middleware harita üreticisi (ALTYAPI'nın dosya listesi bekleniyor). Gerçek liste URUN ile teyit edilir; ben URUN'un dosya alanını (rol kartı) kaynak aldım, kartı okumadım.

### 5.2 GEO-SEO dizin defteri

Burada defterin **parçalarının çoğu zaten var**; eksik olan onları bir çatıya bağlamak:

| Defter parçası | Mevcut karşılığı |
|---|---|
| Cetvel (nasıl) | `docs/standards/dizin-sistemleri-standard.md` D1–D8 (sahip GEO-SEO) |
| Ölçüm betiği | `scripts/seo/dizin-takip.mjs` (SEO-100: tüm site haritasını kapsar, Google dizinde olmadan TAMAM vermez) |
| Günlük anlık görüntü | Depo dışı arşiv `dizin-takip-<gün>.json` |
| Açılış satırı | `scripts/seo/dizin-acilis.mjs` + `.claude/hooks/dizin-acilis.cjs` (SEO-98, ARC-282): GEO-SEO açılışında YAP/TEKRAR sayıları |
| Sorgu defteri | `scripts/seo/olcum-defteri.mjs` (D8, depo dışı `olcumler.jsonl`, SEO-87) |
| Düzenli görev | Haftalık veri incelemesi (`SEO haftalık: N gün`, `gorev-tazelik-satiri`) |

Eksik olan: **depo içi, depo-güvenli** bir özet. Defter şunu söyler: hangi adres kümeleri dizin takibinde, motor başına son YAP/TEKRAR/TAMAM sayıları (yalnız sayı, ham adres×motor tablosu değil), son anlık görüntünün tarihi ve sha256'sı, hangi motorun hangi nedenle ölçülemediği (Yandex Webmaster salt okunur arızası gibi), sırada bekleyen dizin işleri. Tutarlılık kontrolü: defterdeki sayılar ile arşivdeki en son anlık görüntü eşleşiyor mu (`dizin-acilis.mjs` `enSonAnlik` ve `sayilar` işlevleri zaten bu okumayı yapıyor).

Arama sorgusu, tıklama ve sıra verisi deftere girmez (GEO-SEO kuralı P6); defter bunları nerede durduğuna işaret eder. Bu pilot, "depo dışı ham veri + depo içi özet" ayrımının sınanacağı yerdir.

## 6. Dört bağlama noktası

### 6.1 Açılış kancası: departman başına tek satır tazelik

Mevcut kalıp: `gorev-tazelik-satiri.cjs` (pencerenin rolünü agent anahtarından çözer, eşiği aşan görev varsa tek satır basar, aşmadıysa sessiz) ve `uyari-susturma.cjs` (satır yalnız durum değişince basılır, ARC-220). Defter satırı aynı kalıpla yazılır:

```
⚠DEFTER (URUN): urun-adres 21 gün doğrulanmadı (eşik 14); izlenen yolda 3 commit defterden yeni
```

Kurallar: pencerenin rolünün defterlerinden **en kötüsü** tek satırda; hepsi tazeyse sessiz; kaynak okunamazsa "ölçülemedi (sebep)" (sessizlik "taze" demek değildir); çıkış her zaman 0; yerel git, ağ yok; vana ortam değişkeniyle kapatılır. Satır **departman başına bir tane**, tavan ~150 bayt.

Kimin işi: kanca dosyası ve test **ARAÇ'ın** alanıdır (`.claude/hooks/**`); mantık `scripts/belge/` altında HARİTA ya da `scripts/hijyen/` altında ARAÇ olabilir. Bölüm 6.1'in **uygulama kararı** (kanca nereye, hangi bütçe) ARAÇ görüşüne bırakılır (§8). Bedel sınırı OPS-258'de yazılı: açılışta departman başına tek satır; bu not o sınırı değiştirmez.

### 6.2 `onceki-calisma.cjs` defterleri de tarar

`scripts/arac/onceki-calisma.cjs` bugün beş kaynağı paralel tarıyor (dosya adı, git konu satırı, Kanban başlık ve etiket, sage, Linear arşivi) ve ilk satırda `BULUNDU n | YOK | ÖLÇÜLEMEDİ` veriyor. Defter, altıncı kaynak olarak eklenir:

- Kaynak: manifestteki defter dosyalarının **başlık, envanter ve "sırada" satırları** (tam metin değil; ifade eşleşmesi mevcut kimlik normalleştirmesini kullanır: `REC-300` = `rec300`).
- Bulgu satırı defter adını ve bölümü gösterir: `defter: urun-adres §2 "adres şeması"`.
- Yerel ve hızlı olduğu için (birkaç küçük dosya, ağ yok) kanca süresini zorlamaz; bu **ölçülecek**, ben ölçmedim.
- "YOK" hükmü: bugün yalnız çekirdek üç kaynak (dosya, git, kanban) tam ölçüldüyse "YOK" verilir. Defter ucuz ve yerel olduğu için **çekirdeğe eklenmesini** öneririm; böylece defter ölçülemeden "YOK" denmez. Karar ARAÇ'ındır.
- `onceki-calisma-adaylari.cjs` (ARC-215 kart açma kancası) aynı manifestten aday defteri de sayar; kart açılırken `ÖNCEKİ ÇALIŞMA:` satırı defteri anmıyorsa mevcut "aday anılmadı" uyarısı defter için de çıkar.

Yeni arama motoru yazılmaz; mevcut tarama bir kaynak kazanır (betiğin kendi kuralı).

### 6.3 PR kapısı

Kural: PR'ın değiştirdiği dosyalar bir defterin `izlenen` yollarıyla kesişiyor ve defter dosyası değişmemişse kırmızı. Kalıp `scripts/board/pr-kayit-kapisi.cjs` (saf mantık, CI yalnız girdiyi okur). Ayrıntılı yanlış-alarm değerlendirmesi ALTYAPI görüşünde (§7); özet kararlar:

- İzlenen yol **dar ve glob**, geniş (`docs/**`, `src/components/**`) olmaz; manifest kontrolü yüz dosyadan geniş glob'u reddeder.
- İstisna: PR gövdesinde `Defter-gerekmez: <sebep>` (en az 20 karakter), `Kayıtsız:` kalıbı gibi sayılır ve haftalık özette görünür.
- Bot PR'ları muaf; boş dokunuşa karşı defterin `Son doğrulama` tarihi PR gününden geri olamaz ve ilerlemiş olmalıdır.
- İlk iki hafta **UYARI** kipi, yanlış alarm oranı sayılır, düşükse kırmızıya çevrilir.

Defter olmayan departman (manifestte yok) bu kapıdan etkilenmez; kapı yalnız manifestteki kayıtları görür. Bu yüzden yayılım adım adım güvenlidir.

### 6.4 Depo dışı kaynaklar: günlük zamanlı ölçüm

Design (DesignSync), Search Console ve UnoPIM depoda değildir; defterdeki özetin gerçekle sapması yalnız bir ölçümle bulunur. Bu **zamanlı** bir iş olduğu için karar 53 gereği Recep onayı ister; bu not zamanlayıcı kurmaz, yalnız ihtiyacı ve emsali yazar. ALTYAPI görüşü (§7) kaynak başına uygunluğu söylüyor: GSC API ile mümkün (kimlik yöntemi CI'da ölçülmedi), UnoPIM REST ile mümkün (salt okuma jetonu), Design büyük olasılıkla CI'da koşmaz (ajan aracı), o kaynak ajan oturumunda ölçülür. GEO-SEO emsali zaten **açılış tetikli**: `dizin-acilis` günün ilk açılışında arka planda ölçümü başlatır, zamanlayıcı yok. Önerim, depo dışı kaynakta önce bu açılış tetikli kalıbı kullanmak; zamanlayıcıyı yalnız açılış tetiği yetmediğinde (kimse pencere açmıyorsa) ayrıca sormak.

## 7. ALTYAPI görüşü (CI bölümü)

Kaynak: ALTYAPI'nın ALT-178 kart notu (9 Kasım). Notu ben yazmadım; aşağıdaki özet onun hükümlerini taşır ve OPS aracılığıyla ALTYAPI'ya teyit ettirilir. ALTYAPI bu notun taslağını okumadan yazdığını belirtmiş (manifest şemasını, URN-157 kapsamını ve GSC/UnoPIM kimlik yöntemlerinin CI uyumunu **ölçmediğini** söylüyor).

- **(a) PR kapısı: evet**, `pr-kayit-kapisi` kalıbıyla: mantık `scripts/ci/` altında saf modül, LLM yok, yeni sır yok, değişen dosya okunamazsa fail-closed. Yanlış alarm riskleri ve karşılıkları: dar glob; `Defter-gerekmez:` istisnası; bot muafiyeti; defter tarihi ilerlemiş mi kontrolü; ilk iki hafta uyarı kipi. Sıkılaştırma, OPS onayı yeter. Kanıt: sabotaj (izlenen yol değişti, defter değişmedi → kırmızı; istisna satırı → yeşil).
- **(b) Depo dışı günlük ölçüm:** mevcut zamanlı kollar var (dunya-durumu altı saatte bir, katalog-sayim, canli-kapi, dizin-tetigi günlük); yenisi aynı kalıpla yazılır ama zamanlayıcı onayı OPS'tan sorulmalıdır. Sırlar yeni repo sırrıdır (öneri adlar `GSC_SERVICE_ACCOUNT_JSON`, `UNOPIM_READ_TOKEN`, yalnız okuma kapsamı); sırrı ALTYAPI eklemez, ekleme OPS/Recep işidir. Depo PUBLIC: fork PR'larına sır verilmez, zamanlı kol yalnız varsayılan dalda koşar, günlükte değer basılmaz. **Asıl risk:** depo ve Actions artefaktları herkese açıktır; GSC trafiği ve UnoPIM maliyet/tedarik verisi deftere ham yazılırsa sızar → defter yalnız depo-güvenli özet taşır. Zamanlı kol çökerse sessiz kalmasın: açılış satırında "defter bayat: N gün"; kimlik süresi dolması "ölçülemedi"dir, kırmızı değil.
- **(c) URN-157 adres defteri ve ALT-177 kapıları:** ikisi aynı manifesti okur, **ayrı kapı olarak kalır**. Defter kapısı "defter güncellendi mi" der; ALT-177 kapıları (A7 %90 ve 1 MB, zincir/çift hop/çakışma, A9 sıçrama bütçesi, A10 dil tespiti) "defterin söylediği doğru mu" der. Tek teste birleştirilirse yanlış alarmın kaynağı ayırt edilemez. Defter kapısı geçişten bağımsız UYARI kipinde açılabilir; ALT-177 içerik kapıları geçiş tarihine bağlı kalır.

Bu notun ALTYAPI görüşünden **farkı** yoktur; §6.3 ve §6.4 onu aynen alır. Tek ekleme: §6.4'te depo dışı kaynakta önce açılış tetikli kalıbı (GEO-SEO emsali) öneriyorum; ALTYAPI'nın zamanlı kol seçeneği yedek kalır.

## 8. ARAÇ görüşü (kanca bölümü)

**Bekleniyor** (OPS aracılığıyla istenecek). ARAÇ'tan beklenen kararlar: (1) §6.1 açılış satırı: kanca dosyası, bütçe (kanca bütçesi 300 ms; `belge-tazelik` önbelleği emsal), `uyari-susturma` ile uyum, tavan bayt; (2) §6.2 önceki-çalışma taramasına defter kaynağı: çekirdeğe mi eklensin, süre etkisi; (3) kanca ve ayar değişikliği olduğundan bağımsız denetçi okuması (rol kuralı). Görüş gelince bu bölüm ARAÇ'ın kendi metniyle doldurulur; ben yazmam.

## 9. Aday defter listesi (rol kartından, tahmin değil)

Kaynak: `docs/roller/DEPARTMAN-HARITASI.md` (rol kartlarının Görev ve Dosyalar bölümlerinden üretilmiş). Her aday kartın kendi cümlesine dayanır; "Hazır kayıt" sütunu depoda **zaten bulunan** ve defter olarak tanıtılabilecek yeri gösterir. Önceliği ben koydum (ölçüt: alan karmaşıklığı × mükerrer iş kanıtı), onay OPS'undur.

| Departman | Aday defter | Rol kartındaki dayanak | Hazır kayıt | Dalga |
|---|---|---|---|---|
| URUN | `urun-adres` (adres/yönlendirme) | "adres yönlendirmeleri, REC-300 adres paketi" | adres-semasi-standard, SEO-76 ölçümü | Pilot |
| GEO-SEO | `geo-seo-dizin` | "arama motoru ve yapay zekâ görünürlüğü ölçümü" | dizin-sistemleri-standard D7/D8, dizin-takip | Pilot |
| BLOG | `blog-yazilar` | "rehber yazıları: taslak, kaynak, yayın kalıbı" | HRT-118 şablonu, `yazilar.ts` | 1 |
| MEVZUAT | `mevzuat-kayit` | "ürün ailesi × hüküm paketi" | `docs/mevzuat/kayit.json` (zaten kayıt) | 1 |
| EDGE | `edge-fonksiyonlar` | "29 fonksiyon, her biri çağıran sınıfına bağlı" | `edge-function-security-standard.md` | 1 |
| ARAC | `arac-envanteri` (kanca/araç) | "araç envanteri" | `docs/audits/arac-envanteri-2026-09-07.md` | 1 |
| TAKIP | `takip-surum` | "Claude Code, WrongStack, notebooklm-py sürümleri" | `wrongstack-ozellik-envanteri.md` | 1 |
| YETENEK | `yetenek-skill-baglari` | "hangi departman hangi işte hangi skill" | `docs/audits/skill-*` | 1 |
| KATALOG | `katalog-kaynak` | "kaynak dizini, CSV, fiyat ve şema" | kaynak dizini `sayfalar.jsonl` (kardeş depo) | 2 |
| ADMIN | `admin-ekranlar` | "tablo, form, iş akışı ekranları" | `docs/olcum/admin-panel-altyapisi.md` | 2 |
| SATIS | `satis-kipi` | "satış kipi şirket kurulana dek kapalı-hazır" | `docs/olcum/satis-hazirligi.md` | 2 |
| TASARIM | `tasarim-design-eslemesi` | "Design kararlarını kayda geçirir, kareyle yan yana ölçer" | Design yorum kanalı + arşiv | 2 |
| I18N | `i18n-kapsam` | "literal→t() göçü, sözlük" | `i18n-localization-standard.md` | 2 |
| ALTYAPI | `altyapi-ci-bagimlilik` | "CI kapıları, bağımlılık ve güvenlik denetimi" | fleet-mechanism-standard | 2 |
| HARITA | `harita-belge-sahipligi` | "belge ve hafıza düzeni" | `cetvel-sahipligi.json`, belge-tazelik taban | 2 |
| MARKA | `marka-kimlik` | "logo, palet, yazı tipi, belge sistemi" | Design-MARKA çıktıları (depo dışı) | 3 |
| 3D | `3d-modeller` | "3D ürün modelleri, kalite ve performans bütçesi" | `3d-webgl-standard.md` | 3 |
| OPS | yok | "kod işi üstlenmez; Kanban gözler" | — | Kapsam dışı |
| MÜHENDİSLİK | yok | "planlı, kapalı" | — | Kapsam dışı |

Dalga 1 = hazır kaydı olan, defterleştirmesi ucuz olanlar (tanıtma + manifest satırı + kontrol). Dalga 2 = defter yazılması gereken, dış bağımlılığı az olanlar. Dalga 3 = depo dışı kaynağa bağlı olanlar (ALTYAPI görüşündeki sır ve zamanlı ölçüm kararına bağlıdır).

## 10. Riskler, bedel ve bu notun bilmediği şeyler

| Risk | Karşılık |
|---|---|
| Defter şişer, kimse okumaz | Bölüm başına satır tavanı (öneri 40); eski satırlar `docs/archive/` altına tarihçe olarak taşınır |
| Defter bayatlar ve yalan söyler | Süre tetiği + PR kapısı + tutarlılık kontrolü; Recep sayfası bayat defteri kırmızı gösterir |
| PR kapısı yanlış alarm verir, yorgunluk | Dar glob, istisna satırı, bot muafiyeti, iki hafta uyarı kipi (ALTYAPI) |
| Depo herkese açık; ham veri sızar | Defter yalnız özet taşır; manifest kontrolü sır ve arama verisi imzalarını tarar (öneri; ALTYAPI/ARAÇ teyidi) |
| Açılış satırı bağlamı şişirir | Departman başına tek satır, yalnız durum değişince (ARC-220 kalıbı), tavan ~150 B |
| Defter ile ölçüm defteri karışır | §1 ayrım tablosu; ölçüm defterine bağlantı, kopya yok |
| Pilotlar yayılımı gecikir | Pilot ölçütü açık (§11); ölçüt tutmazsa yayılım durur |

**Ölçülmedi, bu notta yok:** açılış satırının milisaniye maliyeti; önceki-çalışma taramasına altıncı kaynağın süresi; rol kartı satırının 18 kartta bayt etkisi; URN-157 kartının gerçek dosya listesi (kartı okudum, URUN ile teyit edilmedi); GSC/UnoPIM kimlik yöntemlerinin CI'da çalışıp çalışmadığı (ALTYAPI de ölçmedi). Bunların her biri ilgili uygulama kartının ilk adımıdır.

## 11. Uygulama sırası ve pilot başarı ölçütü

Bu not kart açmaz. Onaydan sonra önerim şu sıradır (her biri ayrı kart, ayrı PR, sahibi parantezde):

1. Kısa cetvel `docs/standards/departman-defter-standard.md` + `docs/defter/README.md` güncelleme + README satırı + sahiplik kaydı (HARİTA).
2. Manifest + manifest testi + rol kartı satırı üreticisi (HARİTA; kart baytı önce ölçülür).
3. PR kapısı, UYARI kipinde (ALTYAPI).
4. Açılış satırı + önceki-çalışma kaynağı (ARAÇ).
5. Pilot defterler: `geo-seo-dizin` (GEO-SEO), `urun-adres` (URUN).
6. `defter-sayfa.cjs` Recep sayfası (HARİTA).
7. Dalga 1, sonra dalga 2; dalga 3 zamanlı ölçüm kararından sonra.

**Pilot başarı ölçütü (iki hafta sonra, ölçülür, tahmin edilmez):** (a) iki defterin `olcum` komutu 0 verir ve en az bir gerçek sapmayı yakalamıştır; (b) PR kapısının uyarı kipinde yanlış alarm oranı kayda geçmiştir; (c) pilot departmanlardan birinde yeni gelen bir emrin `ÖNCEKİ ÇALIŞMA:` satırı defteri bulmuştur; (d) Recep sayfası iki defterden üretilmiştir. Dördü sağlanmadan yayılım başlamaz.

## 12. OPS'tan beklenen kararlar

1. Defter ile ölçüm defteri ayrımı (§1) ve "mevcut kayıt olduğu yerde defter olarak tanıtılır" ilkesi (§3.2) onaylı mı?
2. Pilot URUN defterinin URN-157'den ayrı yürümesi (§5.1) uygun mu, yoksa URN-157 açılana kadar bekleme mi?
3. §6.2: defter kaynağı önceki-çalışma çekirdeğine girsin mi (ARAÇ görüşüyle birlikte)?
4. §6.4: depo dışı kaynakta önce açılış tetikli kalıp, zamanlayıcı yalnız yedek olarak mı?
5. Dalga sırası (§9) ve OPS/MÜHENDİSLİK'in kapsam dışı olması.
