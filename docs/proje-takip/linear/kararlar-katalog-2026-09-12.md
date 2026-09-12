# Kararlar — Katalog ve Ürün Verisi (Linear belgesinin TAM dışa aktarımı · 2026-09-12 ayna: K1–K17)

<!-- kaynak_id: 935079bf-b265-49d2-854a-a334abea07af · kaynak_updatedAt: 2026-09-11T10:46:02.257Z · kopya: 2026-09-12T10:10Z -->
<!-- Tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->

> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır. Çelişkide Linear kazanır.

Tek kaynak; karar buraya yazılmadan verilmiş sayılmaz.

## K1 · Teknik alan hedefi (2026-09-03, Recep)

Her üründe teknik veri TAM olur; eksik "kabul edilen" değil "takip edilip tamamlanan" şeydir. İlk aşamada giriş eksik olabilir. Eksikler admin listesinde takip edilir; vitrinde eksik satır hiç görünmez.

## K2 · İkinci çıkarım turu (2026-09-03, Recep: zorunlu iş, zamanı Recep'te)

SEAT (basınç/IP/ErP/motor 0), Nicotra (yalnız debi), AVenS kataloglarından ikinci çıkarım. Malzeme, montaj, sertifika alanları şemada yok; şema genişletme migration'ı Recep kapısı.

## K3 · Markalar (2026-09-03 ölçüm)

Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 · Danfoss 35. Casals ve Storm marka DEĞİL (Storm bir SEAT serisi). Resmi logolar 15A projesinde brand/logos/.

## K4 · Kategori verisi göçü (2026-09-03, Recep)

Canlı ağaç 15A ağacına göçer: 7 boş eski üst kategori + boş alt dallar temizlenir; Sığınak üst kategori olur; ürün atamaları 15A'ya göre. Migration = prod (kural 13) → Recep kapısı.

## K5 · Görsel (kayıtlı kararlar)

Ürün fotoğrafı üretici kaynağından (Gemini ürün fotoğrafı ÜRETMEZ; REC-61 yalnız sayfa/kapak görselleri). 867 izole görsel Supabase storage'da; 35 ürün görselsiz (REC-44). Görsel hattı gerçek çözümü REC-91.

## K6 · Veri yazımı

Prod DB'ye ürün/kategori yazımı iki-göz + Recep kapısı; toplu yazım öncesi render/önbellek cetveli (rendering-cache-standard) uygulanır (2026-08-15 dersi: 1044 fiyat yazıldı, vitrin değişmedi).

## K7 · İçerik hattı — Recep kararları (2026-09-05, doğrudan Recep)

REC-146 Adım 1/1b/2a raporları sunuldu, Recep yedi maddelik sorun listesine karar verdi:

**K7.1 — Satmadığımız varyantların metni YAZILIR, YÜKLENMEZ.** IoT, EP, MONO 20 boy gibi katalogda olup bizde satılmayan varyantların metinleri **ön hazırlık olarak yazılır**, dosyada durur; DB'ye **yüklenmez**. (OPS/URUN-KATALOG önerisi "hiç yazılmasın" idi; Recep "yazılsın ama yüklemeyiz" dedi — hazır dursun, ürün açılırsa beklemeyelim.)

**K7.2 — Çeviri gerekiyorsa YAPILIR.** Kaynağın 22/24'ü İngilizce; çeviri işin parçası, ayrı onay gerekmez.

**K7.3 — Üretici web sitelerinden araştırma ve katalog çekme SERBEST.** Kaynağı olmayan aileler için marka ve ürün sitelerinde araştırma yapılır, ürün bilgileri ve oradaki kataloglar çekilir.

**K7.4 — Sessiz boşluklar ÖNCE RAPORLANIR, sonra doldurulur.** "Kaynağı var görünüp aslında olmayan" kalemler (ör. TIRACAMINO) tespit edilir; doldurulabiliyorsa doldurulur ama **rapor önce gelir**, sessizce kapatılmaz.

**K7.5 — Her tespit KAYIT ALTINA alınır.** Recep'in sözü: *"herşey kesinlikle kayıt altında olacak, yapılan tüm tespitler; sonra geri dönüp gelecekte bu neymiş dememeliyiz."* Ölçüm, sapma, çürütülen ölçüt, kaynak hatası — hepsi belgeye yazılır.

**K7.6 — AVenS kaynak hataları: kendimize doğrusunu yazarız, hatayı da raporlarız.** AVenS fiyat kataloğu 2026'da bulunan hatalar (s.41/s.43 aynı kimlik cümlesi; s.45 başlığı STORM/JET ATEX ama gövdesi "SEAT ATEX" diyor ve STORM'un aralığını veriyor) düzeltilmiş hâliyle bizim metnimize girer; **ayrı bir hata raporu** tutulur, **Recep AVenS'e kendisi iletir**.

---

*2026-09-04 ilk sürüm (OPS). 2026-09-05 K7 eklendi (URUN-KATALOG, Recep'in doğrudan kararı).*

## K7.10 · AVenS: kaynağı olmayan aileye satılabilir sayfa yazılmaz (2026-09-06 09:50Z, **Recep kararı**: "Avens için de onay verdim" — OPS önerisi kabul; kaynak: URUN-KATALOG üç bağımsız ajan ölçümü, dalga 3)

* **BVU-LS serisi + hız anahtarları:** kaynakta anlatım yok, yalnız kod + fiyat → **satılabilir sayfa YAZILMAZ**. AVenS'ten teknik föy istenir (K7.6 kanalıyla Recep iletir); gelene kadar sayfalar kod + fiyat kısa kimlik hâlinde kalır, tarama listesinden düşmez, satış anlatımı olmaz.
* **Sulu batarya:** yazılır.
* **Elektrikli ısıtıcı:** yalnız **aksesuar** olarak; bağımsız ürün sayfası değil.
* **HF/FW + HF/S:** sınırda — kaynak yetersizse yazılmaz; yazılırsa kapıdan GÜÇLÜ geçmeli (ZAYIF doğrulama yetmez).
* "Kendi markamız" uydurma izni **değildir** (K7 aynen). Dalga 4 diye iş yok; taslak işi 40/40 bitti (31 sayımdı, ölçüm 40).

## K8 · Aile föyü: her ürün ailesinin kendi belgesi olur, tablo esas (2026-09-06 23:15 TR, **Recep kararı**: "girsin evet"; OPS hükmü kabul)

* Okuduğumuz her üretici kaynağından **kendimize ait aile föyü** üretilir; ürün föyü onun içindeki satırdır. Yeri: ingestor deposunda aile klasörünün çıktı kademesi (`03-output/`), kaynak kademesindeki PDF/HTML'in yanında.
* **Biçim:** tek kaynak yapılandırılmış tablo (CSV; satır = ürün · alan · değer · birim · kaynak dosya · sayfa · birebir alıntı). Okunabilir föy (MD) **bu tablodan üretilir**, elle yazılmaz (üretilmiş artefakt kuralı). Veritabanına (Supabase ya da ileride başka bir DB) yükleme yalnız tablodan yapılır.
* **Güncelleme:** üretici yeni katalog çıkarınca yeni sürüm indirilir, sha256 ile eskisiyle karşılaştırılır, yalnız değişen sayfalar yeniden çıkarılır, fark staging'e düşer, Katalog kapısı + Recep onayıyla föy ve DB güncellenir. Excel fiyat listesi akışıyla aynı mantık.
* İlk uygulama: REC-172 faz 2 staging'i (8 aile, 764 satır) Katalog kabulünden sonra Nicotra/Danfoss/SEAT aile föylerine dönüşür. Cetvel: `catalog-ingestion-standard` §2 + faz 2'nin yazdığı web kaynağı cetvel eki taslağı (Katalog yazar).

## K9 · Kayışlı fanlarda "takılabilecek en büyük motor gücü" AYRI ALAN (2026-09-07 07:35Z, Recep KARARI; REC-172 faz 3 soru 1)

Kayış-kasnaklı ailelerde (Nicotra DD vb.) üreticinin verdiği motor gücü üst sınırı, takılı motor gücüyle karıştırılmaz; `technical_specs`'te ayrı alan (öneri: `max_motor_power_kw`) ve teknik tabloda ayrı satır ("En fazla motor gücü"). Açıklama cümlesine gömülmez. Gerekçe: tesisatçı "kaç kW'a kadar" diye arar; karşılaştırma tablosunda görünmeli.

## K10 · Nicotra toplam basınç AYRI ALAN, statik'e çevrilmez (2026-09-07 07:35Z, Recep KARARI; REC-172 faz 3 soru 2)

Katalog "toplam basınç" verdiğinde değer ayrı alana yazılır (öneri: `total_pressure_pa`); statik basınç sütununa dönüştürülerek YAZILMAZ (dönüşüm hız/çıkış alanına bağlı, kaynaklarda her zaman yok; yanlış hesap = müşteriye yanlış rakam). Vitrin iki alanı ayrı etiketle gösterir.

## K11 · ATEX: teknik tabloda KOD + açıklamada CÜMLE (2026-09-07 07:35Z, Recep KARARI; REC-172 faz 3 soru 3)

Sertifika kodu (ör. `II 2G Ex h IIB T4`) `technical_specs`'te olduğu gibi (alan önerisi `atex_marking`) ve teknik tabloda satır olarak; ürün anlatımında "patlayıcı ortamlar için uygundur (ATEX)" cümlesi. İkisi birlikte; biri diğerinin yerine geçmez.

## K12 · Yanlış ürün kodu ad+slug'da düzeltilir, eski slug 301 (2026-09-07 07:35Z, Recep KARARI; Katalog faz 2 incelemesi 6-A)

DD ailesinde ad ve slug'da `6N090P` yazan ürün (`model_code` 11921) kaynak kodu `61090P` ile düzeltilir; eski slug yeni slug'a 301 yönlendirilir; kanonik/sitemap etkisi PR'da ölçülür. Şerit: URUN. Teknik özellik yüklemesi (faz 4) bunu BEKLEMEZ (satırlar sku ile bağlı). Genel kural: vitrindeki kod kaynak koduyla çelişirse düzeltme ad+slug+301'dir, yalnız tabloya doğru kod eklemek yeterli değildir (vaat bütünlüğü).

## K11-a · ATEX iki eksen, iki alan: `atex_marking` (ekipman grubu kodu) + `atex_zone` (kullanım bölgesi) (2026-09-07 09:2xZ, Recep KARARI "A")

Kataloglar ATEX'i iki biçimde verir: ekipman grubu/kategori kodu (ör. `II 2G/D h T3/125C X Gb/Db`, Vortice 14 ürün) ve kullanım bölgesi beyanı (ör. `Zone 2, Category 3G`, JET 7 ürün; SEAT 12 satır aynı sınıf). İkisi farklı eksendir (K3 aynı eksen kıyas kuralı): aynı alana konmaz. Teknik tabloda iki ayrı satır: "ATEX sınıfı" ve "ATEX bölgesi"; hangisi varsa o görünür (K7 yoksa satır yok). Faset: bugün 375 üründe ~21 dolu (%6) → K13 gereği filtre olmaz, yalnız PDP tablosunda. K11 (kod + açıklama cümlesi) geçerli kalır; cümle her iki alan için de yazılır. Faz 4: 19 ATEX satırı yükleme listesine girer.

## K13 · ÖNCELİK = TAŞINABİLİR KATALOG PAKETİ; sıra PDF → paket (gözle kontrol) → DB (2026-09-09 11:1xZ, **Recep KARARI**, kendi sözleriyle)

*"Ben hiç DB'ye veri yüklememiş olsaydım elimde taşınabilir katalog paketinin olmasını istiyorum, bu kadar. Önceliğim bu. Alıp bu verileri girmek istediğimde önce açacağım, bakacağım, gözle kontrollerimi sağlayacağım; bunu yaparken PDF'ler referansım olacak. Sonrasında DB'ye yükleyeceğim. Önce CSV vs. tüm dokümanlardan emin oluruz, ondan sonra DB doğru mu değil mi bakarız."*

* **Ana kaynak = paket.** Onaylı paket gerçektir; DB paketten yüklenir ve pakete göre denetlenir (DB'deki fark = düzeltilecek kalem, paket kazanır). Bugüne kadarki "DB kimlik kazanır" yaklaşımı bu kararla değişti.
* **Paket insan okur:** açılır, bakılır; her değerin yanında PDF referansı (dosya + sayfa + alıntı). Biçim: tablo başına CSV + görsel klasörü + kaynak PDF referansı; jsonl yalnız makine kopyasıdır.
* **DB'deki mevcut veri atılmaz:** paket, canlı DB dışa aktarımıyla TOHUMLANIR (5165 teknik değer, 1042 görsel bağı, 187 açıklama), sonra PDF kaynak dizinine karşı işaretlenir (PDF'te var/yok/çelişiyor). Sıfırdan çıkarım YOK.
* **Sıra:** paket iskeleti + tohum → PDF referans eşleme → Recep gözle kontrol (aile aile) → onaylı paket → boş şemaya yükle → canlı DB ile fark raporu → farklar tek kararla.
* Belge / açıklama / İngilizce fazları bu paketin İÇİNDE yürür; paket bitmeden ayrı hat açılmaz.
* Kayıt: REC-212 (yeniden kapsamlandı). Yol haritası belgesi buna göre güncellendi.

## K14 · Katalog kaynakları için TEK NotebookLM defteri; defter = kaynak dizininin aynası (2026-09-09 11:3xZ, **Recep isteği**: "ya eldekiler ya da yeni bir taneye tümünü koyalım; hazırladıklarımızı da oraya sorabiliriz; iş yapılış yöntemine eklenmeli" — OPS hükmü: YENİ, tek defter)

* **Defter:** `VentHub Katalog Kaynaklari (kaynak dizini = defter)` — id `8bb600d9-4342-4a74-88f5-e4e47dbeebc9`. İçerik = kaynak dizini birebir: 60 kaynak (58 PDF: Vortice 22 · SEAT 17 · Nicotra 12 · Danfoss 6 · AVenS fiyat listesi 1; + 2 web metni: Nicotra ADH sayfası, SEAT Storm sayfası). 2026-09-09 11:3xZ ölçüm: defter 60 / tekil 60 / mükerrer 0 / dizin farkı 0 + hazırlanan paket çıktıları (aile föyleri, CSV'ler) eklendikçe.
* **Neden yeni:** ölçüldü — mevcut 4 defter parçalı ve bayat: ingestor defteri (06-21, 24 PDF, yalnız Vortice), REC-172 defteri (09-06, 26 PDF: SEAT/Nicotra/Danfoss), Vortice TR distribütör (24 PDF), Vortice Full (28 PDF + 8 web) + 6 ürün grubu defteri. Hiçbiri dizinle birebir değil; iki defteri birleştirmek yerine dizinden üretilen tek defter tutulur. Eskiler arşiv, silinmez.
* **Kural (cetvel eki, catalog-ingestion-standard §6.4):** defter SORU yüzeyidir, KANIT değil. "PDF'te ne yazıyor" cevabı defterden alınır, kaynak dizininde sayfa+alıntı ile doğrulanır; pakete yalnız dizin referansıyla girer. Dizine yeni belge girince deftere de eklenir (aynı liste, sha256 ile eşlenir); dizinde olmayan belge deftere konmaz.
* **Hedef cümlesi (Recep):** *"Katalogdaki önceliğim taşınabilir, güvenli, doğru veri kaynaklarını oluşturmak; bu iş böyle başladı, sonlandıralım artık."*

## K15 · PDF çıkarımı BİR KEZ yapılır, eşleştirilir, konu KAPANIR — PDF'e dönüş yok (2026-09-09 11:3xZ, **Recep KARARI**, kendi sözleriyle)

*"Sürekli PDF'ten arama istemiyorum. PDF çıkarımı bir kere yapılır ve bitirilir. Çıkarımlar yapılır, sonra eşleştirme yapılır ve konu kapanır. Aradan üç gün geçiyor, 'gözümle okumalıyım' diye süreç tekrar başlıyor; günlerdir böyle. Yazık, kayıp."*

* **Çıkarım bir kez:** kaynak dizini (60 kaynak, hash'li) o "bir kez"dir; **yapıldı**. Hiçbir iş PDF'i yeniden açmaz; soru varsa defter (K14), kanıt varsa dizin satırı.
* **Eşleştirme makine işidir:** paketteki her değer dizinle bir kez eşlenir (VAR/YOK/ÇELİŞİYOR), sonuç pakete yazılır, **konu kapanır**. Aynı eşleme ikinci kez koşulmaz; yeni kaynak gelirse yalnız fark eşlenir (K8 sürüm kuralı).
* **Recep'in gözle kontrolü TEK GEÇİŞ ve isteğe bağlıdır:** paket CSV'si üzerinde, PDF açmadan (referans kolonu yeter). "Gözle okumalısın" diye iş geri döndürülmez; şüpheli değer çelişki listesine gider, tek kararla kapanır.
* **Kapanış ölçütü:** paket bitince "PDF'e dön" isteyen her emir K15 ihlalidir; OPS reddeder.

## K16 · Katalog paketi için AYRI Design projesi: DESIGN-KATALOG (Opus) (2026-09-10 06:2xZ, **Recep kararı**: "Opus ile yeni proje açıyorum Design'da"; OPS'un 06:08Z "şimdilik ayrı proje yok" hükmü bu kararla geçersiz)

* Linear projesi: **Katalog Veri Sözleşmesi (DESIGN-KATALOG)** — ekran değil veri ürünü; Design tarafı yeni Claude Design projesi (model Opus), imza "— DESIGN-KATALOG (Opus) tarih".
* Nesne: paketin 8 CSV kolonu (ad · birim · tip · zorunlu · kaynak · hangi ekranda) + 2 gerçek satır + doluluk karnesi şablonu + `belgeler.csv` + alan-etiket sözlüğü. Kolon adları KATALOG paketinden (PR [peckop/venthub-hvac-esite#1158](https://linear.app/receps-workspace/review/rec-212-f1-tasinabilir-katalog-paketi-442-urun-7-csv-1146-gorsel-39-mb-6a3367c20ea9)/#1160); icat edilmez.
* Roller: DESIGN-KATALOG yazar · OPS çürütür/onaylar · KATALOG uygular. MENU yalnız alan↔ekran haritasını verir. K13/K14/K15 aynen geçerli (paket ana kaynak, tek defter, PDF'e dönüş yok).

**K16-a · Design ile defter AYRI kalır (2026-09-10 06:4xZ, Recep):** DESIGN-KATALOG NotebookLM defterine ve kaynak dizinine erişmez; Supabase SELECT ile doldurur. Defter + dizin kontrolü KATALOG/OPS'ta. Sebep: iki bağımsız ajan, iki bağımsız yol = sağlam kontrol (aynı kaynağı paylaşan iki ajan tek kontroldür).

**K16-b · Değer sorusunda ÖNCE DEFTER (2026-09-10, Recep; OPS ölçümü ile):** `notebooklm ask -n 8bb600d9` tek soruda 77 sn, atıflı, belge+sayfa, çelişkiyi kendisi işaretledi (SEAT 30 monofaze 1,10/1,50 kW). Çelişki 299 + "kaynakta yok" tepesi önce defterle ayıklanır; atıf sayfası dizin satırıyla otomatik eşlenir (kanıt). Alan-etiket sözlüğü gerekirse cevaplardan türer. PDF açılmaz.

## K17 · Casals markası açılır, 4 aile / 53 ürün bağlanır (2026-09-11, Recep KARARI, Design-Menü penceresi; OPS 10:3xZ yazdı)

Casals `brands` kaydı açılır; ENKELFAN (9) · KENTALFAN (14) · NIMAX (15) · NIMUS (15) aileleri AVenS'ten Casals'a bağlanır; aile slug'ları `casals-…` olur, eski 4 aile adresi 308. HF/S ve HF/FW AVenS'te KALIR; AVenS'te 53 ürün kalır. Flexiva: marka tanımlı, ürünü yok; gelirse katalog paketiyle girer. SQL hazırlığı Design-Menü'de (`kategori-agaci-sql-hazirligi-2026-09-11.md` §3.4 + 301 tablosu), UYGULAMA URUN şeridinde migration + PR, Recep merge (kural 13). Aynı dosyada kategori ağacı değişimi: 44 ürün dal değiştirir (plug 23 · hücreli 13 · perde 8), 4 yeni dal, ürün adresine etkisi 0 (dal adreste geçmez), toplam 308 = 5. **K17 EK (Recep 09-11, 10:38Z):** Plug Fanlar ve Hücreli Aspiratörler ayrı DAL olur: plug 23 ürün / 2 aile (Casals KENTALFAN + ENKELFAN), hücreli 13 / 2 (AVenS HF/S + HF/FW); Radyal 133 → 97 / 8. SQL §3.1–3.3 hazır, çalıştırılmadı. Adres şeması için bkz. Kararlar — SEO ve Yayın K3-b.
