---
name: site-gorsel-inceleme
description: 'Önizleme sitesinin ve panelinin (Design Venthub New dışı) şablonlarını Chrome''da gezip hiyerarşi, boşluk, tutarlılık, kontrast, odak kusurlarını 1-5 puanlar, kareyle RAPORLAR; düzeltmez. Tetik: "siteyi kullanıcı gözüyle incele", "ilk bakışta ne anlaşılıyor", "görsel inceleme turu".'
category: research
metadata:
  kaynak: "TASARIM ihtiyaç metni (TSR-28, 20 Kasım 2026); denetim listeleri gstack design-review ve qa-only'den VentHub'a uyarlandı (arac-envanteri-standard dört kapı)"
  sahibi: "TASARIM kullanır (tasarim-dogrulayici); bakış listesini TASARIM besler, açıklama ve tetik YETENEK'te"
---

# Site görsel inceleme

Site ve kiracı panelinin her sayfa şablonunu, ilk kez gören bir kullanıcının gözüyle gezip **görsel tasarım ve UI/UX bulgularını** kanıtlı raporlar. Skill yalnız rapor yazar: düzeltme, commit ve Design'a yazma yoktur, çünkü tasarımın kaynağı Claude Design'dadır ve oraya giden paketi Recep onayından sonra TASARIM iletir.

İşlev ve ölçüm turları (metin, tıklama, px, taşma) başka skill'lerin işidir. Bu skill onların bakmadığı yere bakar: hiyerarşi, boşluk, hizalama, tutarlılık, fotoğraf üstü yazı kontrastı, odak halkası, klavye gezintisi ve "ilk 5 saniyede ne anlaşılıyor, nereye basılır belli mi" sorusu.

## Ne zaman

Bir sitenin ya da panelin şablonlarını tasarım gözüyle puanlamak, "ilk bakışta ne anlatıyor" sorusuna kanıtlı cevap vermek, mobil ve masaüstü yerleşimi karşılaştırmak, Design'a gidecek görsel bulguları toplamak gerektiğinde.

## Ne zaman DEĞİL

- Rengi, boşluğu ya da bir düğmeyi değiştirmek: düzeltme bu skill'de yok; istek TASARIM'dan Design'a gider.
- Formu doldurup göndermek, belge zinciri yürütmek, işlev ölçmek: `panel-gezinme` (panel) ya da site deneme turu.
- Gelen bir karenin K kurallarına uyup uymadığını söylemek: `venthub-tasarim-dili`.
- Yavaşlığın sebebini bulmak: `web-performance`. WCAG kural denetimi ve kod düzeltmesi: `accessibility`.
- Kırık bağlantı ve sağlık puanı avı: `qa`.
- Design'a emir yazmak: `venthub-tasarim-dili`.

## Kurulum

- Tarayıcı yalnız claude-in-chrome (`mcp__claude-in-chrome__*`). Aside, `$B`/browse, Playwright, başsız ve yerleşik tarayıcı kullanılmaz. Araçlar ertelenmişse hepsini tek bir ToolSearch çağrısında yükle.
- Sekme kuralları, iframe sınırları ve ESCAPE yasağı `panel-gezinme` skill'inde yazılı; onları oradan oku, burada tekrarlanmaz. Kısaca: önce `tabs_context_mcp`, başkasının sekmesine dokunma, kendi sekmeni aç ve bitince kapat.
- **Yüzeyler:** önizleme sitesi (onizleme.venthub.com.tr, `/onizleme/` Sayfalar listesi) ve panel ("Mağaza ayarları" kartından açılır). Design Venthub New'de ölçülmez. Görsel inceleme kayıt açmaz; test verisi gerekirse `DENEME-27` öneki.
- **İki genişlik:** 1568 px ve 390 px. Genişliği `resize_window` ile ya da panelde "Mobil 390" düğmesiyle değiştir; yatay kaymayı `javascript_tool` ile `document.documentElement.scrollWidth > innerWidth` karşılaştırarak doğrula. TR ve EN en az ana şablonlarda.
- Genişlik değişince sayfa yeniden yüklenir: 2-10 sn bekle, sonra ölç. Tıklama gecikmeyle yansır; her kritik adımdan önce yeni ekran görüntüsü al.

## Her şablonda sıra

Sıra önemlidir: ilk izlenim bozulmadan yazılır, çünkü sonradan gezen göz artık "ilk kez gören" değildir.

1. **İlk 5 saniye.** Sayfa yüklenir yüklenmez, hiçbir etkileşim yapmadan ekran görüntüsü al. İki cümle yaz: sayfa ne işe yarıyor, ilk basılacak yer nerede. Hedef eylem belli değilse bu bir bulgudur. (Kaynak: design-review ilk izlenim ve "trunk testi": site kimliği, sayfa adı, ana bölümler, seçenekler, konum, arama; 6 sorudan hangileri sayfadan cevaplanıyor, say.)
2. **Hiyerarşi.** Başlık, alt başlık ve gövde boyları ayrışıyor mu; göz önce hangi üç öğeye gidiyor; sayfada tek dolu kiremit düğme (K5) var mı.
3. **Boşluk ve hizalama.** Izgara, sütun hizası, kart boşlukları, kenar boşluğu; üst üste binme ve taşma.
4. **Tutarlılık.** Aynı iş her sayfada aynı yerde ve biçimde mi (düğme yeri, renk, yazı boyu, ürün kartı kalıbı, boş ve hata ekranı). Önceki şablonların karelerine bakarak kıyasla.
5. **Renk ve kontrast.** Metin ≥ 4,5:1; fotoğraf üstü yazı okunuyor mu; K22 (durum alfa ile anlatılmaz), K25 (turkuaz metin rengi değildir), K28 (token karşılığı olan ham hex). Ölçüyü `javascript_tool` ile `getComputedStyle` okuyarak al, gözle tahmin etme.
6. **Dokunma ve odak.** Basılan öğe ≥ 44 px (görünür boy küçük, basma alanı `::after` ile büyük olabilir: gerçek tıkla doğrula); Tab sırası mantıklı mı, odak halkası görünüyor mu (`focus-visible`), klavye tuzağı var mı.
7. **Duyarlılık.** 1568 ve 390 px'te aynı sayfa: yatay kayma, kırpılan ya da üst üste binen öğe, mobilde ilk ekranda ana eylem erişilebilir mi.
8. **Hareket ve durum.** Yükleme (ham anahtar parlaması, iskelet), boş durum, hata durumu, geçişte sıçrama. Hover ve `title` yazıları araçla görülemez: "denenemedi: araç sınırı" yaz.
9. **İçerik hissi** (yazım denetimi değil, yalnız gözlem): ham anahtar (`⟦…⟧`), dil karışması, K7 (boş alan "—" ile gösterilmez), K39 (fiyatsız ürün "Teklif iste").

Panelde 2. adım yerine masa/liste/belge sayfası yoğunluğuna bak: bilgi hiyerarşisi, tablo okunabilirliği, çekmece ve sekme davranışı.

### Denetim madde kodları

Her bulgu hangi maddenin yakaladığını kodla belirtir (rapor biçiminde "madde" alanı). Kodlar yukarıdaki sıraya göre H (hiyerarşi), B (boşluk), T (tutarlılık), R (renk), O (odak/dokunma), D (duyarlılık), M (hareket/durum), I (içerik), Y (ilk 5 saniye). Alt kırılım örnek: `R2` fotoğraf üstü yazı kontrastı, `O3` odak halkası yok, `D1` yatay kayma, `I1` ham anahtar. Gerekçe: aynı bulgunun hangi bakışla bulunduğunu bilmek, listenin hangi maddesinin işe yaradığını ölçmemizi sağlar. Madde kodu bulunamıyorsa `Y0` yaz ve bulguyu "listede olmayan" diye işaretle; TASARIM listeyi buradan besler.

gstack design-review'dan **alınan** boyutlar: hiyerarşi, tipografi, boşluk, renk, etkileşim durumları, duyarlılık, hareket, içerik, performans hissi (yalnız gözle: iskelet, kayma, font değişim flaşı), tutarlılık, trunk testi, bulgu başına kare. qa-only'den: konsol hatası bakışı (`read_console_messages`), kırık bağlantı gözlemi (yalnız önizleme sitesinde; uzak siteye istek atılmaz), durum eksikleri, bulguyu bir kez daha deneyerek doğrulama.

**Alınmayanlar:** harf notu ve 0-100 sağlık puanı, "AI izi" kalıp avı (yalnız K5, K22, K25, K7, K39, K28 ile örtüşenler), hoşnutluk rezervuarı puanı, DESIGN.md üretimi, düzeltme ve commit döngüsü, baseline ve proje dizin dosyaları, dış model oyu, Aside/browse komutları.

## Puanlama (TSR-23 ölçütü; site ve panel)

Her ekran grubu için dört soru, her biri 1-5 puan ve tek cümle gerekçe; gerekçe görülen bir öğeye dayanır (ekran adı, öğe, kare yolu). Puan şu anlama gelir: 5 = ilk kez açan takılmadan anlıyor ve yapıyor; 4 = küçük tereddüt, kendiliğinden çözülüyor; 3 = bir adımı fark etmek için araştırmak gerek; 2 = çoğu kullanıcı yolu bulamaz ya da yanlış anlar; 1 = çalışmıyor ya da yanıltıyor.

- **S1 Kabuk ve menü:** simgeler anlaşılır mı, aktif sayfa ve modül belli mi (sitede: üst menü, arama, alt bilgi, mobil alt sekme).
- **S2 Yerleşim:** başlık, eylem düğmesi, tablo ve kart sırası, boşluk, bilgi yoğunluğu.
- **S3 Tutarlılık:** aynı iş aynı yerde ve aynı biçimde mi.
- **S4 Kullanıcı kolaylığı:** sık iş için tık sayısı (hedef ≤ 4), hata mesajı yeri.
- **S5 İlk 5 saniye** (yalnız site): ne anlaşılıyor, nereye basılır; puansız tek cümle ya da 1-5 kısa.

3 ve altı puanlı yerler "Design'a çizimle seçenek için" listesine girer; seçim Recep'indir ve OPS sorar. Kendi başına seçim yapma.

## Şiddet ve bulgu biçimi

Şiddet üç sınıftır: **ağır** (iş yapılamıyor, ham anahtar, taşma, ana eylem yok), **orta** (tutarsızlık, 44 px altı, kontrast), **hafif** (kozmetik).

Her bulgu şu alanları taşır; biri eksikse bulgu yazılmaz:

| Alan | İçerik |
|---|---|
| Sayfa | şablon adı |
| Genişlik | 1568 ya da 390 |
| Madde | denetim kodu (yukarıdaki liste) |
| Gördüğüm | ham yazı ya da ölçü (px, oran) |
| Neden sorun | hangi K kuralı ya da kullanıcı etkisi |
| Kare | `C:\tmp\...\*.jpg` (ekran görüntüsünü `save_to_disk` ile kaydet; kare kimliği `ss_…` dosya adı değildir) |
| Şiddet | ağır / orta / hafif |

Kanıtsız bulgu yazılmaz. Ölçemediğine "ölçülemedi" yaz ve sebebini ekle; tahmin kanıt değildir. Gözlemi yorumdan ayır. Bir bulguyu raporlamadan önce bir kez daha dene: ilk yüklemedeki iskelet ekran ya da gecikmeli tıklama sahte bulgu üretir.

## Rapor

Dosya `C:\tmp\gorsel-inceleme-<yüzey>-<tarih>.md` (yüzey: `site` ya da `panel`); kareler `C:\tmp\gorsel-inceleme-kareler-<yüzey>-<tarih>\`. Üstte `KAPSAM: n/N şablon` satırı; sonra şablon başına bir blok: ilk 5 saniye cümlesi, S1-S4 puanları, bulgu tablosu, kare yolları. Sonda: puanı ≤ 3 olanların özet tablosu, ağır/orta/hafif sayısı, ölçülemeyenler (sebebiyle), listede olmayan bulgular.

Rapor önce OPS'a gider; onaydan sonra Design'a TASARIM tek paket olarak iletir. Skill Design'a yazmaz.

## Çalışan düzeni

Tamamı tek çalışana sığmaz (şablon sayısı büyük, ajan 8 şablondan sonra tahmine kayar). Müdür işi **≤ 8 şablonluk parçalara** böler; çalışan her şablon için sayfa başlığı, ham yazı ve kare yolu getirir. Müdür 2-3 satırı kendi Chrome'unda örnekler; örnekleme tutmuyorsa o parça yeniden koşar. Aynı anda iki sekmede paralel koşum olur; çünkü önizleme verisi tarayıcıda ortak, kayıt açan en çok bir çalışan olur. Çalışan görev metnine "kapsam dışı düğmeye basma (Onayla, Sil, Gönder)" satırı yazılır.

## Yasaklar

Kod, depo, Design projesi, kayıt silme, kimlik bilgisi girme yok. Düzeltme önerisi biçimi "şu CSS'i yaz" olmaz; bulgu ve kullanıcı etkisi yazılır, çözümü Design çizer. Yeni skill ya da kural uydurulmaz; denetim listesinde olmayan bakış `Y0` ile rapora girer.

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
