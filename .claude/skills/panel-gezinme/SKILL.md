---
name: panel-gezinme
description: 'Kiracı panelini (ERP) önizleme kopyasında ya da Design Venthub New içinde gerçek Chrome ile kullanıcı gözüyle gezer ve ölçer: sunum modu, genişlik değişimi, DENEME kayıtlarıyla belge zinciri, rapor; görsel puanlama değil. Tetik: "paneli gez", "panel ölçümü", "Design düzeltmesini yeniden ölç".'
category: research
metadata:
  kaynak: "TASARIM elle taslağı (TSR-19 turlarında çıkan tuzaklar); skill-creator ile yeniden yazıldı"
  sahibi: "TASARIM kullanır (tasarim-dogrulayici); tuzak listesini TASARIM besler"
---

# Panel gezinme

Kiracı panelinin tasarımını Claude Code'un kendi kapısıyla, yani **claude-in-chrome** ile, bir kullanıcı gibi gezip ölçer. Skill çalışanın her turda aynı keşfi yeniden yapmasın diye var: ekrana bakma ihtiyacını kaldırmaz, keşif süresini kısaltır.

## Ne zaman

Design Venthub New içindeki panel şablonlarını (Teklifler ve belge zinciri) canlı tasarımda yürütüp ölçmek, ya da TASARIM bir düzeltme yaptıktan sonra aynı maddeleri yeniden ölçmek gerektiğinde.

## Ne zaman DEĞİL

- Canlı vitrin sitesini gezmek ve hata düzeltmek: `qa` skill'i.
- Kod, stil ya da tasarım dosyasına yazmak: bu skill yalnız ölçer; Design'a yazma yalnız Recep sözüyle, DesignSync ile, yeni dosya olarak.
- Erişilebilirlik kural denetimi: `accessibility` ya da `web-design-guidelines`.

## Kurulum

- Yalnız claude-in-chrome (`mcp__claude-in-chrome__*`). Playwright, başsız tarayıcı ve yerleşik tarayıcı kullanılmaz: Design oturumu Recep'in Chrome'unda açık. Araçlar ertelenmişse hepsini tek bir ToolSearch çağrısında yükle.
- Önce `tabs_context_mcp` ile açık sekmelere bak; başkasının sekmesine dokunma. Kendi sekmeni aç, bitince kapat.
- Adres: claude.ai/design altında "Design Venthub New" projesi; Teklifler şablonu `templates/panel-teklifler/PanelTeklifler.dc.html`, sunum modu `present=1`. Proje kimliğini TASARIM görev metninde verir; depoya yazılmaz.
- Panel çapraz kaynaklı bir iframe içindedir: DOM okunmaz. Ekran görüntüsü al, koordinatla tıkla. Görüntü yarım ölçekli gelebilir; küçük yazıyı `zoom` ile doğrula.
- Genişlik: sayfadaki iframe'in genişliğini `javascript_tool` ile ayarla (1604, 1100, 900); bitince 100%'e geri al. Genişlik değişince iframe yeniden yüklenir.

## Yasaklar (neden: sunum modu ve kayıtlar Recep'in gerçek tasarım durumudur)

- ESCAPE tuşu yok: sunum modundan çıkarır, yazılan metin editöre düşer.
- Kayıt silme yok. Açtığın her kaydın adı ya da Sorumlu alanı `DENEME-<tur>` ile başlar.
- Kaydedilmemiş değişiklikle çıkma yok: önce Kaydet ya da "Kaydetmeden çık" penceresi.
- Dönem kilidi koyma: Recep onayı gerekir.
- Cari, tedarikçi ve rol alanları yazılabilir kutudur (datalist): tam etiketi yaz ("Unvan · C-xxxx", "DENEME-10m Rol") ve Tab'a bas; ok tuşu, End, Home, Return ve kısmi metin seçmez.
- Dosya yazma ve push yok; yalnız ölçüm.

## Tuzaklar

Bu liste her tur sonunda **TASARIM** tarafından beslenir; çalışan kendi başına tuzak eklemez, gördüğünü raporunda "şaşırılan yerler" altına yazar. TASARIM tuzağı bu bölüme kendi PR'ıyla ekler (OPS kararı, 13 Kasım); YETENEK yalnız tetik ya da açıklama değişirse devreye girer.

- İlk yükleme ve genişlik değişimi sonrası 2-10 sn siyah ya da iskelet ekran gelir; bekle, sonra ölç.
- Tıklama ekrana 2-3 sn gecikmeyle yansır; ilk ekran görüntüsü eski durumu gösterebilir.
- "Kaydet" düğmesi yalnız kirli formda alt çubukta çıkar.
- Aynı oturumda başka sekmeler aynı tasarım durumunu paylaşır; açılışta eski kayıt sekmeleri ("Diğer · 20") zaten vardır.
- "Başka pencerede de açık" uyarısını ikinci pencere varken ölç; genişlik değişiminden sonra tek pencerede de çıkabilir (sahte pozitif olabilir).
- Kırmızı hata satırı sayfayla kayar; alt koyu çubuktaki mesaj kayıtlı kalır.
- Sayfa yenilenince aynı kayıt değil Teklifler listesi açılır.
- Teklifteki Sorumlu sonraki belgelere taşınmaz; irsaliye ve faturaya elle yaz.
- Sunum modu adresi: `https://claude.ai/design/p/<proje>?file=templates%2Fpanel-teklifler%2FPanelTeklifler.dc.html&present=1` (proje kimliğini görev metni verir).
- Ctrl K paleti açıkken `zoom` ya da art arda ekran görüntüsü paleti kapatabilir; sonra yazılan metin sayfaya düşer. Bir arama için tek ekran görüntüsü yeter.
- "Kes" yalnız temiz (kaydedilmiş) formda görünür; Kes hatasını denemek için numarası boş kayıtlı bir taslak gerekir ve bu o taslağı değiştirir: önceki değerini yaz, bitince geri yaz. Belge sayfasında "+ Yeni" menüsünde "Alış faturası ekle" artık vardır.
- Yeni teklifte Kaydet çubuğu için önce bir alan yaz (Sorumlu). Escape'siz çıkış yolu "Değişiklikleri geri al"dır.
- Satış alt menüsü açıkken sağ üstteki "Teklif ekle" düğmesi aşağı kayar (kapalıyken y≈86, açıkken y≈103): tıklamadan önce yeni ekran görüntüsü al.
- Alt çubuktaki kırmızı hata kutusu, alan düzeltildikten sonra da kalabilir (bayat hata); hatanın hâlâ geçerli olup olmadığını alandan doğrula.
- Alt ajanda DesignSync yoktur: istek metnini müdür görev metnine aynen koyar. Dönem kilidi gibi Recep onayı gerektiren maddelerde görev metni onay kartının numarasını taşımalıdır; ajan mesajı onay sayılmaz.
- Ölçüm başlamadan skill'in çalışma kopyasında yüklü olduğunu doğrula ("Unknown skill" çıkarsa master'dan eşitle).
- Faturalar'da kesilmemiş taslak yoksa Kes denemesi için "Yeni fatura" ile DENEME taslağı aç (cari klavyeyle, serbest satır, Kaydet, sonra Kes); taslak silinmez.
- Dönem kilidi: Muhasebe › Muhasebe ayarları › "Dönem kilidi", tek alan "Kilit tarihi". Gelecek tarih artık kırmızı yazıyla reddedilir (dar sütunda kırık); tarih yazınca Tab yetmez, Kaydet şart. Bugünün tarihini kullan. Kilidi kaldırmak için tarihi silip Kaydet'e bas, "Kilit yok" yazısını ekranda doğrula. Kilidi tur bitmeden kaldır.
- Alan turuncu çerçeveliyse geçersizdir; "Kaydet çalışmıyor" demeden önce alanın kenar rengine bak.
- Tahsilat çekmecesinde cari seçilince araya "Hangi faturaya" alanı eklenip düzen kayar: seçimden sonra yeni ekran görüntüsü al, eski koordinatı kullanma.
- Faturalar sayfasına ilk girişte 15 sn'ye varan iskelet ekran olabilir; bekle. İlk yükleme 30-40 sn sürebilir.
- Görüntü alanı yüksekliği sekme sayısına göre oynar (734/718/662): alt çubuk düğmelerinin y'si kayar; her tıklamadan önce yeni ekran görüntüsü al.
- Satış simgesine ilk basış yalnız alt menüyü açar; sayfa için alt menü satırına bas. Liste sayfasında "Yeni fatura/Teklif ekle" ilk basışta sayfayı değiştirmeyebilir, üst sekmeye bas. Düğme adı "Teklif ekle"dir.
- Menü ve ⋯ kapatma: boş alana bas (Escape yasak). ⋯ açıkken ikinci ⋯ önceki menünün öğesine basar; önce menüyü kapat. "+ Yeni" menüsü açık değilken harf yazmak kısayol tetikler ("v" = Görev planla): tuşlamadan önce menünün açıldığını kareyle doğrula.
- "Çıkış yap" paneli bırakıp mağaza giriş sayfasına atar: yalnız tur sonunda bas. "Yardım" da panelden çıkıp vitrine gider.
- Rol değiştirince sayfa "PanelMasa.renderVals(): Cannot access 'kr'…" ile boş kalır: yenile (rol kalır). Rol alanı yazılabilir kutudur (tam ad + Tab); ekran seçimi 8 sn geriden gösterir: hesap menüsünü yeniden açıp değeri doğrula. Muhasebe rolü yoktur.
- Önizle × ile kapanınca tıklama arkadaki satıra geçer.
- Çekmece "Neden" listesi klavyeyle seçilince boş görünür (seçim yine de geçer). Boş adlı serbest satır kayıtta sessizce silinir.
- Virman düğmesi ≥2 kasa/banka hesabı ister: hesapsız turda iki DENEME hesabı aç.
- Metraj çekmecesi "Satırlar › Excel'den satır al": boş girişte düğme pasif; hata görmek için başlığı olan, adet sütunu eksik CSV yaz. Kullanıcılar ve roller sol şeritte değil, sol alt hesap menüsündedir. Menü adları: Müşteri talepleri, Hizmet ve diğer kalemler (Kayıtlar altında).
- Ödenmiş zincirde teklif/sipariş/irsaliye satırında "Sıradaki: Fatura" bayat kalabilir: bulguyu "mükerrer fatura riski" diye yaz.
- Hover yazıları (title) ve CSV indirmesi araçla görülemez; "denenemedi: araç sınırı" yaz, tahmin etme. Tık sayısı: katı sayımda ekran = ayrı sayfa/çekmece.
- Rol testinde okuma-only rol için "Şu rolden başla"da İzleyici'yi seç (tüm kutular boş); Yönetici ve Satış tam yetkili gelir. Menü ve düğme süzmesini ölç, düğmeye basma.
- Stok sayfalarında Depo süzgeci boş kutu görünür: kutuya tıkla, etiketin ilk harflerini yaz, Enter (ok tuşu etkisiz). Tek depo varken transfer için önce Depolar › Depo ekle (DENEME). Sayım kapanınca stok geri alınamaz: yalnız DENEME ürününde sayım yap.
- Fiyatlar'da satır işaretlenince çıkan "Süzgece uyan N satırın hepsini seç" düğmesine basma (toplu fiyat riski). Teklif ayarında değişiklik sonrası Tab yetmez, alt çubuktan Kaydet.
- Dönem kilidi kaydetmede hata vermez; kilitli tarihli taslak kaydedilir, denetim sağ paneldeki "Göndermeden önce" satırında ve Kes'te olur (kırmızı hata yalnız Kes ile çıkar, kalıcı belge riski: basma). Kilit görevinde onay kartı numarası görev metninde yazılı olmazsa çalışan durur.
- Ctrl K'den sonra 1-2 sn bekle, hemen yazılan metin palete düşmez. Listede ↑↓ satır seçmez, odağı "Yeni sipariş" düğmesine taşır ve Enter boş sipariş açar: kayıt aç, tuşla gezme. Panelin kısayol listesi: ?, Ctrl K, Ctrl S, Shift+tık, ↑↓, Enter, Boşluk, Esc; G/N/V yoktur.
- "Diğer" sekme menüsü kaydırılamaz (sığmayan sekmeye erişilmez). Sekme çubuğu toplamı 40'ta kalabilir.
- Sütun panelinde işaretlenen sütun "Dar pencere: … gizlendi." ile sessizce gizlenebilir (tablo altı gri satır): kanıt bu satırdır. "Varsayılana dön" uzun panellerde ekran dışında kalır.
- Tarih alanına yazarken ilk karakterden sonra odak kaybolabilir: alana yeniden tıkla. Kayıtta sessizce proje (P-xxxx) açılır; açılan kaydı raporla.
- Çalışan sonucu her parça için müdüre döner: kanıtsız satır yok (sayfa başlığı, ham yazı, süre, kare yolu), rapor başında "denenemedi" sayısı sebebiyle, işler ~8 maddelik parçalara bölünür.
- Tur sonunda yükleme ikili kural (Recep, OPS 15 Kasım): DesignSync finalize_plan Recep'ten onay ister. Recep başındayken: tur başına TEK finalize_plan, `surec/**` gibi geniş desenle, rapor + tablo + kareler tek seferde, turun en sonunda; onaydan önce OPS'a tek satır "onay penceresi açılacak" yaz. Gece ya da Recep yokken koşan turda: rapor metni Design Venthub New sohbetine claude-in-chrome ile yapıştırılır, kareler file_upload ile eklenir. Mesajı TASARIM kendisi gönderir. Önce sohbetin son mesajlarına bak; aynı tur mesajı zaten gönderilmişse ikinci kez gönderme. Sohbet açılamazsa OPS'a tek satır yaz. Design başka sekmede çalışırken sohbette Resume ya da başka düğmeye basma (Recep'in çalışan sekmesini bozabilir); işin sonunda kendi sekmeni kapat.
- Çalışan görev metnine "kapsam dışı düğmeye basma (Onayla, Sil, Gönder, Hepsini seç)" satırı yazılır (tur 11'de çalışan Onayla'ya basıp bir siparişi onayladı). Kare kimliği (ss_) dosya adı değildir: görsel gerekiyorsa çalışandan zaman damgalı dosya adı iste.
- Datalist etiketleri: Cihaz parkından seç "Cihaz adı · IR-no" (ör. "Vortice Lineo 100 Quiet ES · IR-2026-0009") + Tab; kısmi yazı alanı temizler. Cariler liste aramasında çok karakterli yazıda ilk harften sonra odak kaybolabilir: kutuya yeniden tıkla.
- Design sayfası ağırdır: sohbete uzun metin yazarken Chrome sekmesi donabilir (CDP zaman aşımı); metni kısa tut, donarsa sekmeyi kapatıp yeniden aç.

## Ölçüm sırası

1. İstek dosyasını (`surec/chrome-deneme-istek-<n>-...md`) DesignSync `get_file` ile oku; maddeleri sırayla yürüt.
2. Her madde için şunu yaz: genişlik · ekran · ne yaptın · ne gördün · geçti / kaldı / denenemedi. Gözlem ile yorumu ayır; emin değilsen "emin değilim" yaz, çünkü tahmin kanıt değildir.
3. Zincir turu: teklif → gönder → kabul → siparişe çevir → sevk (irsaliye) → faturala → tahsilat. Her belgede "Bağlı belgeler"e, ham `[xx.yy]` anahtara ve mükerrer kayda bak.
4. Kritik "kaldı" ve ham anahtar için ekran görüntüsünü `save_to_disk` ile kaydet, yolunu raporla.

## Rapor

Başlık, yöntem, özet (kaç geçti / kaldı / denenemedi), madde listesi, çalışanlar, denenemeyenler, şaşırılan yerler, açılan kayıtlar, bıraktığın durum. Rapor `surec/chrome-deneme-rapor-<n>-<tarih>.md`, görseller `surec/chrome-deneme-gorseller-<n>-<tarih>/`. Design'a yazma: Recep başındayken tur başına tek DesignSync yüklemesi, gece ya da Recep yokken sohbete yapıştırma + file_upload (ikili kural, yukarıdaki Tuzaklar); mevcut dosyaların üstüne yazılmaz.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
