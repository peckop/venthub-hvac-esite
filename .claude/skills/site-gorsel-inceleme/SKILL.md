---
name: site-gorsel-inceleme
description: 'Önizleme sitesinin ve panel ekranlarının görsel tasarımını (hiyerarşi, boşluk, tutarlılık, kontrast, odak) Chrome''da gezip 1-5 puanlar, kareyle RAPORLAR; işlev yürütmez, düzeltmez. Tetik: "siteyi kullanıcı gözüyle incele", "ilk bakışta ne anlaşılıyor", "görsel inceleme turu".'
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

**Dış göz turu** (önizlemede ajanların kullanıcı gözüyle panel ve site ölçümü) iki bölümden oluşur ve sırası değişmez:

1. **Önce program gözü.** Her ekran profesyonel bir uygulama gibi bütün olarak değerlendirilir. Üç soru: ilk kez açan biri ne yapacağını anlıyor mu; ana iş kaç adımda bitiyor; aynı iş Logo, Paraşüt ve Odoo'da nasıl yapılıyor (sitede sektör rakipleri, görev metninden). Çıktı, önem sırasıyla "profesyonel görünmeyen yerler" listesidir. Bu bölüm üç ekseni birlikte ölçer: görsel ve yerleşim (aşağıdaki 1-9. adımlar, S1-S5), bağlam eylemi (10. adım) ve kurumsal kıyas (kendi bölümü; üçüncü sorunun cevabı oradan gelir).
2. **Sonra Design'ın "düzeltildi" maddelerinin tek tek kontrolü.** Maddeler görev metninde verilir, skill madde uydurmaz; her madde için geçti ya da kaldı, ölçü (px) ve tık sayısı yazılır.

Neden bu sıra: madde kontrolü tek başına hatayı yakalar, ama ürünün profesyonel bir program gibi çalışıp çalışmadığını göstermez; önce madde listesini okuyan göz de listede olmayan eksiği artık görmez. Bölümlerden biri koşulmadıysa tur "dış göz turu" diye raporlanmaz; koşulmayan bölüm ve eksen KAPSAM satırına yazılır.

## Ne zaman DEĞİL

- Rengi, boşluğu ya da bir düğmeyi değiştirmek: düzeltme bu skill'de yok; istek TASARIM'dan Design'a gider.
- Formu doldurup göndermek, belge zinciri yürütmek, işlev ölçmek: `panel-gezinme` (panel) ya da site deneme turu.
- Müşteri senaryosunu baştan sona yürütüp kaç tıkta bittiğini ölçmek: `site-yolculuk-denetimi`. Dış göz turunun 2. bölümündeki tık sayısı tek bir düzeltme maddesinin ölçüsüdür, senaryo değil.
- Gelen bir karenin K kurallarına uyup uymadığını söylemek: `venthub-tasarim-dili`.
- Yavaşlığın sebebini bulmak: `web-performance`. WCAG kural denetimi ve kod düzeltmesi: `accessibility`.
- Kırık bağlantı ve sağlık puanı avı: `qa`.
- Design'a emir yazmak: `venthub-tasarim-dili`.

## Kurulum

- Tarayıcı yalnız claude-in-chrome (`mcp__claude-in-chrome__*`). Aside, `$B`/browse, Playwright, başsız ve yerleşik tarayıcı kullanılmaz. Araçlar ertelenmişse hepsini tek bir ToolSearch çağrısında yükle.
- Sekme kuralları, iframe sınırları ve ESCAPE yasağı `panel-gezinme` skill'inde yazılı; onları oradan oku, burada tekrarlanmaz. Kısaca: önce `tabs_context_mcp`, başkasının sekmesine dokunma, kendi sekmeni aç ve bitince kapat.
- **Yüzeyler:** önizleme sitesi (onizleme.venthub.com.tr, `/onizleme/` Sayfalar listesi) ve panel ("Mağaza ayarları" kartından açılır). Design Venthub New'de ölçülmez. Görsel inceleme kayıt açmaz; test verisi gerekirse `DENEME-27` öneki.
- **İki genişlik:** 1568 px ve 390 px. Genişliği `resize_window` ile ya da panelde "Mobil 390" düğmesiyle değiştir; yatay kaymayı `javascript_tool` ile `document.documentElement.scrollWidth > innerWidth` karşılaştırarak doğrula. `resize_window` hedefi tutturmayabilir (pilotta 1568 istendi, `innerWidth` 1604 ölçüldü): genişliği ayarladıktan sonra `innerWidth` oku ve rapora **istenen ve ölçülen** değeri yaz. TR ve EN en az ana şablonlarda.
- **Önizleme sayfaları `iframe#cer` içindedir.** Ölçüm (`getComputedStyle`, `scrollWidth`, `getBoundingClientRect`), `content-visibility` enjeksiyonu ve kaydırma `document.querySelector('#cer').contentDocument` üzerinden yapılır; üst belgeyi ölçmek çerçevenin kendisini ölçer.
- Tam sayfa ekran görüntüsünde `content-visibility: auto` bölümleri boş çıkar (sayfa görünür alana inmeden çizilmez); yakalamadan önce `javascript_tool` ile (iframe ise `contentDocument` içinde) `content-visibility: visible` enjekte et, yoksa boş bölümü "içerik yok" diye bulgu yazarsın (TASARIM, 20 Kasım).
- `javascript_tool` çıktısına URL, `href` ya da `?` ve `&` içeren metin konursa araç çıktıyı `BLOCKED` diye keser: adres döndürme; sayı, boolean ya da kısa etiket döndür, bağlantıyı gerekiyorsa yalnız yol parçasıyla ver.
- **Kirli tarayıcı durumu.** Başlamadan önce önizleme durumuna bak (dolu teklif listesi, açık filtre, sepet). Kirliyse "ilk 5 saniye" geçersizdir: raporda `kirli durum: <ne>` yaz, Y bulgularını "durum kirli, geçersiz" işaretle. Durumu temizleme, kayıt silme; temiz görünüm gerekiyorsa müdürden yeni sekme ya da temiz tarayıcı iste.
- Genişlik değişince sayfa yeniden yüklenir: 2-10 sn bekle, sonra ölç. Tıklama gecikmeyle yansır; her kritik adımdan önce yeni ekran görüntüsü al.

## Her şablonda sıra

Sıra önemlidir: ilk izlenim bozulmadan yazılır, çünkü sonradan gezen göz artık "ilk kez gören" değildir.

1. **İlk 5 saniye.** Sayfa yüklenir yüklenmez, hiçbir etkileşim yapmadan ekran görüntüsü al. İki cümle yaz: sayfa ne işe yarıyor, ilk basılacak yer nerede. Hedef eylem belli değilse bu bir bulgudur. (Kaynak: design-review ilk izlenim ve "trunk testi": site kimliği, sayfa adı, ana bölümler, seçenekler, konum, arama; 6 sorudan hangileri sayfadan cevaplanıyor, say.)
2. **Hiyerarşi.** Başlık, alt başlık ve gövde boyları ayrışıyor mu; göz önce hangi üç öğeye gidiyor; sayfada tek dolu kiremit düğme (K5) var mı. Ürün kartı ızgarasındaki kart içi "Ekle" düğmeleri istisnadır, "tek düğme" sayısına girmez; sayfa başına ana eylem düğmesi sayılır.
3. **Boşluk ve hizalama.** Izgara, sütun hizası, kart boşlukları, kenar boşluğu; üst üste binme ve taşma.
4. **Tutarlılık.** Aynı iş her sayfada aynı yerde ve biçimde mi (düğme yeri, renk, yazı boyu, ürün kartı kalıbı, boş ve hata ekranı). Önceki şablonların karelerine bakarak kıyasla.
5. **Renk ve kontrast.** Metin ≥ 4,5:1; fotoğraf üstü yazı okunuyor mu; K22 (durum alfa ile anlatılmaz), K25 (turkuaz metin rengi değildir), K28 (token karşılığı olan ham hex). Ölçüyü `javascript_tool` ile `getComputedStyle` okuyarak al, gözle tahmin etme.
6. **Dokunma ve odak.** Basılan öğe ≥ 44 px (görünür boy küçük, basma alanı `::after` ile büyük olabilir: `getBoundingClientRect` ve `getComputedStyle(el, '::after')` ölçümü kabul edilir; "Ekle", "Sil", "Onayla" gibi eylem düğmesine yalnız ölçmek için basılmaz); Tab sırası mantıklı mı, odak halkası görünüyor mu (`focus-visible`), klavye tuzağı var mı.
7. **Duyarlılık.** 1568 ve 390 px'te aynı sayfa: yatay kayma, kırpılan ya da üst üste binen öğe, mobilde ilk ekranda ana eylem erişilebilir mi.
8. **Hareket ve durum.** Yükleme (ham anahtar parlaması, iskelet), boş durum, hata durumu, geçişte sıçrama. Hover ve `title` yazıları araçla görülemez: "denenemedi: araç sınırı" yaz.
9. **İçerik hissi** (yazım denetimi değil, yalnız gözlem): ham anahtar (`⟦…⟧`), dil karışması, K7 (boş alan "—" ile gösterilmez), K39 (fiyatsız ürün "Teklif iste").
10. **Bağlam eylemi.** Her alan, satır ya da kart için o an gereken eylem (ekle, ara, seç, kopyala, sil, ayrıntı, yeni oluştur) o öğenin hemen yanında mı (aynı satır, aynı kart, alan içi düğme), yoksa sayfa başında ya da sonunda uzak bir yerde mi. Uzak düğme işlev olarak çalışsa bile kullanıcıya "bunu nerede yaparım" sorusunu sordurur; 4. adımın tutarlılık bakışı bunu yakalamaz, çünkü düğme her sayfada aynı yerde olup yine de çalıştığı öğeden uzak olabilir. Ölç: öğenin ve eylem düğmesinin `getBoundingClientRect` değerinden aradaki mesafeyi px olarak yaz; eylemi bulmak için kaç kez kaydırdığını ya da gözün kaç kez sıçradığını say. Örnekler panelden: teklif satırında ürün ara ve sil, cari alanında "yeni cari" (başka sayfaya gitmeden yerinde oluşturulabiliyor mu), stok satırında hareket. Sitede de geçerli (ürün kartında ekle ve karşılaştır, filtre alanında temizle). Eşik uydurulmaz: mesafeyi, kaydırma sayısını ve gözlemi yaz, hükmü Puanlama'daki 1-5 anlamıyla ver. Eylem düğmesine yalnız ölçmek için basılmaz (6. adım kuralı); düğmenin çalışıp çalışmadığı bu skill'in işi değil, yeri bu skill'in işidir.

Panelde 2. adım yerine masa/liste/belge sayfası yoğunluğuna bak: bilgi hiyerarşisi, tablo okunabilirliği, çekmece ve sekme davranışı.

### Denetim madde kodları

Her bulgu hangi maddenin yakaladığını kodla belirtir (rapor biçiminde "madde" alanı). Harf grubu yukarıdaki sıraya göredir; kod harf + rakamdır ve tam liste şudur, listede olmayan kod yazılmaz:

| Kod | Madde |
|---|---|
| `H1` / `H2` / `H3` | başlık, alt başlık, gövde boyları ayrışmıyor / göz ilk üç öğeye gitmiyor / ana eylem düğmesi (K5) belli değil |
| `B1` / `B2` / `B3` | ızgara ve sütun hizası / kart ve kenar boşluğu / üst üste binme ve taşma |
| `T1` / `T2` / `T3` | düğme yeri ve biçimi tutarsız / ürün kartı kalıbı tutarsız / boş ve hata ekranı tutarsız |
| `R1` / `R2` / `R3` | metin kontrastı / fotoğraf üstü yazı kontrastı / K22, K25, K28 |
| `O1` / `O2` / `O3` | basma alanı 44 px altı / Tab sırası ve klavye tuzağı / odak halkası yok |
| `D1` / `D2` / `D3` | yatay kayma / kırpılan ya da üst üste binen öğe / mobilde ana eylem erişilemiyor |
| `M1` / `M2` / `M3` | yükleme durumu (iskelet, ham anahtar parlaması) / boş ve hata durumu / geçişte sıçrama |
| `I1` / `I2` / `I3` | ham anahtar / dil karışması / K7 ve K39 |
| `E1` / `E2` / `E3` | gereken eylem öğeden uzakta (sayfa başı ya da sonu) / yerinde eylem yok, başka sayfaya gitmek gerekiyor / eylemi bulmak için kaydırma ya da göz sıçraması gerekiyor |
| `Y1` / `Y2` / `Y3` | ilk 5 saniyede sayfanın işi anlaşılmıyor / ilk basılacak yer belli değil / trunk testinin 6 sorusundan eksik cevap |
| `Y0` | listede olmayan bakış |

Gerekçe: aynı bulgunun hangi bakışla bulunduğunu bilmek, listenin hangi maddesinin işe yaradığını ölçmemizi sağlar. Madde kodu bulunamıyorsa `Y0` yaz ve bulguyu "listede olmayan" diye işaretle; TASARIM listeyi buradan besler.

gstack design-review'dan **alınan** boyutlar: hiyerarşi, tipografi, boşluk, renk, etkileşim durumları, duyarlılık, hareket, içerik, performans hissi (yalnız gözle: iskelet, kayma, font değişim flaşı), tutarlılık, trunk testi, bulgu başına kare. qa-only'den: konsol hatası bakışı (`read_console_messages`), kırık bağlantı gözlemi (yalnız önizleme sitesinde; uzak siteye istek atılmaz), durum eksikleri, bulguyu bir kez daha deneyerek doğrulama.

**Alınmayanlar:** harf notu ve 0-100 sağlık puanı, "AI izi" kalıp avı (yalnız K5, K22, K25, K7, K39, K28 ile örtüşenler), hoşnutluk rezervuarı puanı, DESIGN.md üretimi, düzeltme ve commit döngüsü, baseline ve proje dizin dosyaları, dış model oyu, Aside/browse komutları.

## Puanlama (TSR-23 ölçütü; site ve panel)

Her ekran grubu için dört soru, her biri 1-5 puan ve tek cümle gerekçe; gerekçe görülen bir öğeye dayanır (ekran adı, öğe, kare yolu). Puan şu anlama gelir: 5 = ilk kez açan takılmadan anlıyor ve yapıyor; 4 = küçük tereddüt, kendiliğinden çözülüyor; 3 = bir adımı fark etmek için araştırmak gerek; 2 = çoğu kullanıcı yolu bulamaz ya da yanlış anlar; 1 = çalışmıyor ya da yanıltıyor.

- **S1 Kabuk ve menü:** simgeler anlaşılır mı, aktif sayfa ve modül belli mi (sitede: üst menü, arama, alt bilgi, mobil alt sekme).
- **S2 Yerleşim:** başlık, eylem düğmesi, tablo ve kart sırası, boşluk, bilgi yoğunluğu; bağlam eylemi (10. adım): o an gereken eylem öğenin yanında mı, uzaktaysa kaç px ve kaç kaydırma. Gerekçe `E` kodlu bulguya ve ölçüye dayanır.
- **S3 Tutarlılık:** aynı iş aynı yerde ve aynı biçimde mi.
- **S4 Kullanıcı kolaylığı:** sık iş için tık sayısı (hedef ≤ 4), hata mesajı yeri.
- **S5 İlk 5 saniye** (yalnız site): ne anlaşılıyor, nereye basılır; puansız tek cümle ya da 1-5 kısa.

3 ve altı puanlı yerler "Design'a çizimle seçenek için" listesine girer; seçim Recep'indir ve OPS sorar. Kendi başına seçim yapma.

## Kurumsal kıyas

Panelin bir ekranı "kötü" mü, yoksa iş zaten öyle mi yapılıyor sorusunu yalnız kendi karemize bakan puan cevaplayamaz; kıyas bu boşluğu kapatır. Aynı iş için Türkiye pazarındaki kurumsal ve profesyonel yazılımlara bakılır: panelde Logo, Mikro, Paraşüt ve Odoo; sitede sektör rakipleri görev metninden gelir, skill rakip adı uydurmaz.

- **Yalnız herkese açık kaynak:** resmi belge, yardım sayfası, tanıtım ekran görüntüsü, demo videosu. Hesap açılmaz, deneme kaydı yapılmaz, kimlik bilgisi girilmez.
- **Kaynaksız kıyas yazılmaz.** Her satır kaynak adresi taşır. Kaynakta görülmeyen şey yazılmaz: ekran görüntüsünde görünmeyen bir düğmeye "yok" demek yerine "kaynakta görünmüyor" yaz; görmediğin davranışı (tık sayısı, açılır pencere) tahminle doldurma.
- **Rakip daha iyiyse açıkça yaz.** VentHub'ı kayırma; hüküm somut bir öğeye (ekran, düğme, adım sayısı) dayanır.
- Kıyas bir hüküm değil bir girdidir: rakibin önde olduğu satırlar Design'a çizimle seçenek olarak gider, seçim Recep'indir (yukarıdaki puanlama kuralı).

Satır biçimi:

| Ekran/iş | VentHub (kare) | Rakip (kaynak) | Fark | Hangisi önde | Öneri |
|---|---|---|---|---|---|

"VentHub (kare)" hücresi aracın verdiği kare yolunu, "Rakip (kaynak)" hücresi rakip adını ve kaynak adresini taşır.

## Şiddet ve bulgu biçimi

Şiddet üç sınıftır: **ağır** (iş yapılamıyor, ham anahtar, taşma, ana eylem yok), **orta** (tutarsızlık, 44 px altı, kontrast), **hafif** (kozmetik). `E` kodlu bulguda gereken eylem hiç bulunamıyorsa ağır; bulunuyor ama uzak ya da kaydırma gerektiriyorsa orta.

Her bulgu şu alanları taşır; biri eksikse bulgu yazılmaz:

| Alan | İçerik |
|---|---|
| Sayfa | şablon adı |
| Genişlik | istenen ve ölçülen `innerWidth` (ör. `1568 → 1604`), ya da 390 |
| Madde | denetim kodu (yukarıdaki liste) |
| Gördüğüm | ham yazı ya da ölçü (px, oran) |
| Neden sorun | hangi K kuralı ya da kullanıcı etkisi |
| Kare | `save_to_disk` ile kaydedilen dosyanın **aracın verdiği yolu**, olduğu gibi (araç kendi dizinine yazar, istediğin yola yazamazsın; kare kimliği `ss_…` dosya adı değildir) |
| Şiddet | ağır / orta / hafif |

Kanıtsız bulgu yazılmaz. Ölçemediğine "ölçülemedi" yaz ve sebebini ekle; tahmin kanıt değildir. Gözlemi yorumdan ayır. Bir bulguyu raporlamadan önce bir kez daha dene: ilk yüklemedeki iskelet ekran ya da gecikmeli tıklama sahte bulgu üretir.

## Rapor

Dosya `C:\tmp\gorsel-inceleme-<yüzey>-<tarih>.md` (yüzey: `site` ya da `panel`); kareler aracın verdiği yollardadır; müdür onları `C:\tmp\gorsel-inceleme-kareler-<yüzey>-<tarih>\` altına kopyalar. Üstte `KAPSAM: n/N şablon` satırı; sonra şablon başına bir blok: ilk 5 saniye cümlesi, S1-S4 puanları, bulgu tablosu, kare yolları. Sonda: puanı ≤ 3 olanların özet tablosu, ağır/orta/hafif sayısı, ölçülemeyenler (sebebiyle), listede olmayan bulgular.

**Dış göz turu raporunun sırası** Ne zaman bölümündeki sıradır, karıştırılmaz:

1. KAPSAM satırı (hangi bölüm ve eksen koşuldu, hangisi koşulmadı).
2. **Bölüm 1, program gözü:** önem sırasıyla "profesyonel görünmeyen yerler" listesi (ağır, orta, hafif; her satırda madde kodu ve kare), ardından şablon blokları ve Kurumsal kıyas tablosu.
3. **Bölüm 2, düzeltme kontrolü:** Design'ın "düzeltildi" maddeleri için `| Madde | Beklenen | Ölçülen (px, tık) | Geçti / kaldı | Kare |` tablosu. Bölüm 1 yazılmadan bu tabloya başlanmaz.
4. Sonda ölçülemeyenler ve listede olmayan bulgular.

Rapor önce OPS'a gider; onaydan sonra Design'a TASARIM tek paket olarak iletir. Skill Design'a yazmaz.

## Çalışan düzeni

Tamamı tek çalışana sığmaz (şablon sayısı büyük, ajan 8 şablondan sonra tahmine kayar). Müdür işi **≤ 8 şablonluk parçalara** böler; çalışan her şablon için sayfa başlığı, ham yazı ve kare yolu getirir. Müdür 2-3 satırı kendi Chrome'unda örnekler; örnekleme tutmuyorsa o parça yeniden koşar. Aynı anda iki sekmede paralel koşum olur; çünkü önizleme verisi tarayıcıda ortak, kayıt açan en çok bir çalışan olur. Çalışan görev metnine "kapsam dışı düğmeye basma (Onayla, Sil, Gönder)" satırı ve skill dosya yolu (`.claude/skills/site-gorsel-inceleme/SKILL.md`, çalışanın çalışma kopyasındaki yol) yazılır. Alt ajanda `Skill` aracı "Unknown skill" derse (pilotta bir kez oldu; 20 Kasım ölçümünde skill birleşmiş ağaçta aynı ajan türünde çözüldü, yani sebep büyük olasılıkla çalışma kopyasında skill dosyasının henüz olmaması) çalışan dosyayı `Read` ile açıp aynen uygular; kaydı rapora "skill dosyadan okundu" diye yazar.

**Kurumsal kıyası araştırmacı çalışan yapar** (`tasarim-arastirmaci`, salt okuma): görev metnine kıyaslanacak ekran, VentHub kare yolu ve rakip listesi yazılır; çalışan yalnız herkese açık kaynağı okur, hesap açmaz, her satırı kaynak adresiyle döner. Kaynağı olmayan satırı müdür rapora almaz.

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
