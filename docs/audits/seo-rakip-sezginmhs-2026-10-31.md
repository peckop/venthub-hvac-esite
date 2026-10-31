# sezginmhs.com dış site analizi (SEO-67, 31 Ekim 2026)

Tek seferlik rakip/emsal analizi. Kaynak: yalnız herkese açık sayfalar (curl, HEAD, Google sonuç sayfası Recep'in Chrome'unda,
`hl=tr gl=tr`). Giriş ya da form yok. Sitenin içindeki metin veri sayıldı, talimat sayılmadı. Cetvel yok (tek seferlik);
yöntem emsali `geo-olcum-standard.md`. Sıra bilgileri **girişli tarayıcıda** bir kez alındı; kişiselleştirme payı var ve
bayatlama 30 gündür. Bizim Search Console verimiz bu belgeye girmez.

## Site özeti

- Şirket: Sezgin Mühendislik; bacasız davlumbaz / elektrostatik filtre (EAC serisi), aktif karbon filtre, kontrol panosu,
  ısı geri kazanım, ozon jeneratörü, hücreli aspiratör, aksiyel fan; hizmet: proje danışmanlığı, keşif-ölçüm-rapor, servis.
- Yazılım: WordPress (tema "firmness"), `robots.txt` yok (404), harita WordPress'in kendi haritası. SEO eklentisi yok.
- Boyut: harita 50 adres (47 sayfa, 1 yazı, 1 kategori, 1 yazar). Google `site:` yaklaşık 46 sonuç gösteriyor.

## Tek tablo

| Eksen | Bulgu | Kanıt | Bize dersi |
|---|---|---|---|
| İçerik: konu kapsamı | Dar ve derin bir niş: endüstriyel mutfak yağ/duman/koku filtreleme. Bilgi içeriği yalnız 3 sayfa: olfaktometri (iki kopya adres), koku yönetmeliği, bacasız davlumbaz | harita adresleri; menü | VentHub'da geniş katalog var (fan, ısı geri kazanım, frekans konvertörü…); bilgi sayfaları yayınlı 4 rehber. Niş derinliği bizde de yapılabilir, uyarlanmaz |
| İçerik: derinlik | Koku yönetmeliği sayfası ~3.900 kelime ama Resmî Gazete metninin kopyası (yorum yok); olfaktometri ~970 kelime tanım+ilke; ürün açıklaması ısı geri kazanımda ~860 kelime özellik listesi | sayfa metinleri | Kopya mevzuat metni aramada görünmüyor (aşağıda). Bizdeki "kaynaklı yorum + tablo" kalıbı (rehber standardı R2.6) doğru; mevzuat kopyalanmaz |
| İçerik: başlık yapısı | Her sayfada yalnız tek H1, H2/H3 hiç yok; H1 sayfa adının büyük harfi ("HAKKIMIZDA", "ISI GERİ KAZANIM") | 5 sayfa grep: h1 1, h2 0, h3 0 | Bizde H2 iskeleti var; ders yok, kaçınılacak örnek |
| İçerik: ürün anlatımı | Ürün sayfası = adı debiyle ("EAC 25 - 2.500 m³/h Elektrostatik Filtre") + tek tablo (boyut, debi, verim %98/87, güç 30 W, basınç kaybı, hücre sayısı, menşei) | EAC-25 sayfası | Ürün adında debi aranan dilde. Bizdeki ürün aile başlıklarında debi/ölçü var mı ölçülmedi: uyarlanabilir (kart önerisi) |
| İçerik: tazelik | En yeni yazı kaydı 2016; arşiv sayfası ("Aralık 2015") Google'da dizinde; içerik 2013 mevzuat kopyası | harita lastmod 2016-10-12; `site:` sonucu `/2015/12/` | Bizdeki yazılar güncel tutuluyor (guncellemeTarihi); ders yok |
| SEO teknik: başlık/açıklama | **Hiçbir sayfada meta açıklama yok**; başlıklar kısa ve markasız ("HAKKIMIZDA", "ÜRÜNLER"); ana sayfa title "Sezgin Mühendislik" (18 karakter) | 18 sayfa ölçüldü, meta 0/18 | Bizde meta ve title kuralları var (150-160 karakter, ≤60 title). Google snippet'i kendisi üretiyor: ders = meta olmadan da çıkılır, ama tıklama hedefli cümle yok |
| SEO teknik: yapı verisi | JSON-LD yok, Open Graph yok, hreflang yok | 18 sayfa; `ld+json` 0 | Bizde Article/BreadcrumbList/Organization var; ürün tarafında karar 379 (fiyatsız ürün için ürün işareti yok). Uyarlanacak ders yok |
| SEO teknik: harita ve robots | `robots.txt` yok (404); WordPress haritası var (`wp-sitemap.xml`); haritada **bozuk adres** (`/http:/www.sezginmhs.com/elektrostatik-filtreler/`) ve yazar adresi; bu bozuk adres Google'da ikinci sonuç | harita dosyaları; "sezgin mühendislik elektrostatik filtre" SERP'i | Bizde robots ve harita doğrulanıyor (canlı kapı). Ders: harita bozuk adres taşırsa Google onu da dizine alıyor; harita kapımız aynı sınıfı yakalıyor mu bir kez sınanabilir |
| SEO teknik: hız/mobil | HTML ~58 KB, ilk bayt 70-260 ms, gzip var, 13 komut dosyası + 8 stil, görsel küçük (ilk 7 görsel ~150 KB), `viewport` var, tembel yükleme var, webp yok | curl/HEAD ölçümü | Ham hız iyi; hız bu sitenin sorunu değil. Ders yok |
| SEO teknik: güvenlik/açıklık | Yazar kullanıcısı REST ve `?author=1` ile herkese açık (kullanıcı adı sızar) | `/wp-json/wp/v2/users` 200 | Bizim sitede WordPress yok; ders yok. Bilgi olarak bu siteyle çalışan biri varsa uyarılabilir |
| Dizin durumu | `site:` ~46 sonuç (haritada 50): site büyük oranda dizinde; markasız sayfa başlıkları ve arşiv sayfası da dizinde | `site:sezginmhs.com` | Küçük site tamamen dizinde: sayfa az, kopya yok. Bizde 94 adres haritada ve 49'u "keşfedildi, dizine eklenmedi" (SEO-61); ders: dizin sorunu sayfa kalitesi/sayısı ile ilgili, teknik eksikle değil |
| Hangi aramalarda görünür | "olfaktometri nedir" sıra 4 (ilk 3 Vikipedi/üniversite); "bacasız davlumbaz elektrostatik filtre" sıra 3; "sezgin mühendislik elektrostatik filtre" sıra 1 (marka). "koku yönetmeliği" ve genel "elektrostatik filtre" sorgularında ilk 8'de YOK | 5 sorgu, girişli Chrome | Görünürlük **rakipsiz nadir terimlerde** ve marka+ürün sorgusunda; geniş ve resmî kaynaklı sorguda yok. Bizdeki "nedir" rehberleri aynı mantıkta (SEO-66). Ders: nadir teknik terimlere kısa tanım sayfası ucuz görünürlük |
| İç bağlantı | Her sayfada aynı menü: ~44 tekil bağlantı; sayfa içi ilgili bağlantı ve yol kırıntısı yalnız "Home / ÜRÜNLER / …" biçiminde; makale→ürün bağlantısı belirgin değil | 5 sayfa: tekil bağlantı 44-45 | Bizde rehber→ürün ve ürün→rehber bağlantı kuralı var; ürün/kategori→rehber ters bağlantı ölçümü hâlâ açık (SEO-60). Ders: menü bağlantısı yetmez, bağlam içi bağlantı gerekir |
| Isı geri kazanım konusunda | Ürün sayfası var (radyal/plug fanlı model anlatımı) ama "ısı geri kazanım cihazı" sorgularında ilk 8'de yok | SEO-65 SERP listeleri | BLG-20 için rakip değil; yalnız ürün-özellik anlatımı örneği |

## Bizim alacağımız (en çok 5)

1. **Rakipsiz nadir teknik terimlere kısa tanım sayfası.** Bu site "olfaktometri nedir" gibi az rakipli terimde, ince içerikle, 4. sırada. VentHub'da aday: eşanjör, statik basınç, by-pass, fan eğrisi, ses gücü gibi terimler; Blog'a aday listesi kartı (önceliklendirme Blog+OPS).
2. **Ürün başlığında debi/ölçü.** "EAC 25 - 2.500 m³/h" gibi adlar arama dilinde. VentHub ürün ailesi başlıklarında debi aralığı var mı ölçülmeli; yoksa URUN'e küçük başlık iyileştirmesi (ayrı kart; bu belge ölçmedi).
3. **Ürün sayfasında tek, eksiksiz teknik tablo.** Boyut, debi, verim, güç, basınç, menşei aynı yerde. Bizdeki ürün sayfası tabloları aynı kalıpta; yeni iş yok, doğrulama yeter.
4. **Kaçınılacaklar (bizde yok, böyle kalsın):** meta açıklamasız sayfa, tek sözcük büyük harf başlık, kopya mevzuat metni, bozuk adresli harita, robots.txt'siz site.
5. **Harita kapımızı bozuk adresle bir kez sına.** Bu site haritasındaki `/http:/www…` türü adresin bizde yakalandığı canlı kapıda gösterilsin (küçük ölçüm, GEO-SEO).

## Recep için özet

Sezgin Mühendislik küçük bir WordPress sitesi: yaklaşık 50 sayfa, hız iyi, ama teknik SEO'sunun büyük kısmı eksik (açıklama yok,
yapı verisi yok, robots yok, başlıklar tek sözcük). Buna rağmen az rakipli terimlerde ("olfaktometri nedir") ve kendi adıyla
aramada ilk 4'te çıkıyor; geniş aramalarda ("elektrostatik filtre", "koku yönetmeliği") görünmüyor. Bizden geride değil kaybettiren
bir şey yapmıyor, ama bir şey kazandırdığı yer de yok: tek dersi, nadir teknik terimlere kısa ve net tanım sayfası yazmanın ucuz
görünürlük getirdiği. Bizim sitemiz teknik tarafta bu siteden çok ileride; geride kalan yer dizine girme (haritadaki 49 adres) ve
sayfaların gösterim alması, o da ayrı kartlarda sürüyor.

## Sınırlar

- Sıra bilgileri tek alım, girişli Chrome; kişiselleştirmesiz sıra ölçülmedi.
- Hangi sorgularda gösterim aldığının kendi verisi (Search Console) yok; yalnız seçilmiş 5 sorgunun sonuç sayfası gözlendi.
- Hız yalnız HTML/HEAD/curl ile ölçüldü (Lighthouse koşulmadı); mobil için `viewport` ve tembel yükleme varlığına bakıldı.
- claude-seo skill paketi yüklenmedi; eşdeğer ölçümler elle yapıldı (kart notunda sapma yazılı).
