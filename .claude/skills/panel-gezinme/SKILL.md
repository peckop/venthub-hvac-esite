---
name: panel-gezinme
description: 'Kiracı panelini (ERP) Design Venthub New içinde gerçek Chrome ile kullanıcı gözüyle gezer ve ölçer: sunum modu, genişlik değişimi, DENEME kayıtlarıyla belge zinciri, rapor. Tetik: "paneli gez", "panel ölçümü", "Design düzeltmesini yeniden ölç". Kod yazmaz, kayıt silmez.'
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
- Cari seçici yerel bir select'tir: fareyle değil, klavyeyle (ok tuşları + Enter).
- Dosya yazma ve push yok; yalnız ölçüm.

## Tuzaklar

Bu liste her tur sonunda **TASARIM** tarafından beslenir; çalışan kendi başına tuzak eklemez, gördüğünü raporunda "şaşırılan yerler" altına yazar. TASARIM yeni tuzağı YETENEK'e iletir, YETENEK bu bölümü skill-creator ile günceller.

- İlk yükleme ve genişlik değişimi sonrası 2-10 sn siyah ya da iskelet ekran gelir; bekle, sonra ölç.
- Tıklama ekrana 2-3 sn gecikmeyle yansır; ilk ekran görüntüsü eski durumu gösterebilir.
- "Kaydet" düğmesi yalnız kirli formda alt çubukta çıkar.
- Aynı oturumda başka sekmeler aynı tasarım durumunu paylaşır; açılışta eski kayıt sekmeleri ("Diğer · 20") zaten vardır.
- "Başka pencerede de açık" uyarısını ikinci pencere varken ölç; genişlik değişiminden sonra tek pencerede de çıkabilir (sahte pozitif olabilir).
- Kırmızı hata satırı sayfayla kayar; alt koyu çubuktaki mesaj kayıtlı kalır.
- Sayfa yenilenince aynı kayıt değil Teklifler listesi açılır.
- Teklifteki Sorumlu sonraki belgelere taşınmaz; irsaliye ve faturaya elle yaz.

## Ölçüm sırası

1. İstek dosyasını (`surec/chrome-deneme-istek-<n>-...md`) DesignSync `get_file` ile oku; maddeleri sırayla yürüt.
2. Her madde için şunu yaz: genişlik · ekran · ne yaptın · ne gördün · geçti / kaldı / denenemedi. Gözlem ile yorumu ayır; emin değilsen "emin değilim" yaz, çünkü tahmin kanıt değildir.
3. Zincir turu: teklif → gönder → kabul → siparişe çevir → sevk (irsaliye) → faturala → tahsilat. Her belgede "Bağlı belgeler"e, ham `[xx.yy]` anahtara ve mükerrer kayda bak.
4. Kritik "kaldı" ve ham anahtar için ekran görüntüsünü `save_to_disk` ile kaydet, yolunu raporla.

## Rapor

Başlık, yöntem, özet (kaç geçti / kaldı / denenemedi), madde listesi, çalışanlar, denenemeyenler, şaşırılan yerler, açılan kayıtlar, bıraktığın durum. Rapor `surec/chrome-deneme-rapor-<n>-<tarih>.md`, görseller `surec/chrome-deneme-gorseller-<n>-<tarih>/`. Design'a yazma yalnız DesignSync ve Recep sözüyle, yeni dosya olarak; mevcut dosyaların üstüne yazılmaz.

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
