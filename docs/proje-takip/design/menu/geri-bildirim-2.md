
# GERİ BİLDİRİM 2 — Eylem sözlüğü ve renk kuralı (Claude Code / OPS, 2026-09-03, Recep onaylı)

Bu maddeler KARARDIR; uygula, soru sorma. Uygulayınca CLAUDE.md'ye "Geri bildirim 2 uygulandı" bloğu ekle.
Üzerine yazma yasak: Menü v3 ve Ana Sayfa v2 ARSIV olarak kalır, yeni sürümler v4 / v3 olur.

## Ölçülen karışıklık (v3 menü + v2 ana sayfa)
- "Teklif al" (hero, kiremit) ile "Teklif İste" (header, çerçeveli) aynı iş için iki fiil.
- Ürün sayfasında "Teklif listesine ekle" kiremit, "Teklif iste" çerçeveli; ana sayfada tersi mantık.
- Header'daki "Teklif İste" her ekranda duruyor; gövdedeki kiremit eylemle yan yana ikinci bir teklif düğmesi.

## 1. Tek fiil: "Teklif iste"
"Teklif al" hiçbir yerde kullanılmaz. Hero düğmesi "Teklif iste" olur. Sebep: "al" sonucu vaat eder,
"iste" kullanıcının yaptığı işi söyler; header zaten "Teklif İste" diyordu.

## 2. Header'daki "Teklif iste" KALIR (düzeltme, Recep 2026-09-03 23:25) — gövde düğmeleri ÖZELLEŞİR
Header sağında her ekranda: arama · TR/EN · "Teklif Listesi (n)" (düz) · "Teklif iste" (beyaz çerçeveli).
Header'daki "Teklif iste" GENEL formu açar (proje tarifi, isteğe bağlı ürün listesi); kategori, dal, liste ve
arama gibi kiremit düğmesi olmayan sayfalarda teklif yolu budur, kaldırılmaz.
Gövdedeki kiremit düğme sayfaya ÖZEL iştir ve etiketi bunu söyler, header'la aynı metin olmaz:
- Ana sayfa hero: "Projeniz için teklif iste" (kiremit)
- Ürün (tek model) sayfası: "Bu model için teklif iste" (kiremit) — form model koduyla dolu gelir
- Teklif Listesi: "Teklif talebini gönder" (kiremit)
- Senaryo: "Teknik destek iste" (kiremit)
Sebep: header genel yol, gövde o sayfanın işi; iki düğmenin metni farklı olunca iki iş olduğu anlaşılır,
renk de bunu destekler (genel = çerçeveli, sayfanın işi = kiremit).

## 3. Renk kuralı tek cümle
Sayfanın işini BİTİREN eylem kiremit, diğer her düğme çerçeveli. Ekran ekran:
- Ana sayfa: hero "Projeniz için teklif iste" KİREMİT · "Ürünleri keşfet", "Teknik destek iste", "Bize ulaşın" çerçeveli.
- Kategori / dal / filtreli liste / arama: kiremit YOK; kartlarda "Teklif listesine ekle" çerçeveli; teklif yolu
  header'daki çerçeveli "Teklif iste".
- Ürün (tek model) sayfası: "Bu model için teklif iste" KİREMİT (form model koduyla dolu gelir) ·
  "Teklif listesine ekle" çerçeveli. (v3'teki sıra ters çevrilir.)
- Teklif Listesi: "Teklif talebini gönder" KİREMİT.
- Senaryo: "Teknik destek iste" KİREMİT.
- Aksesuar satırlarındaki "Teklif listesine ekle" çerçeveli küçük düğme kalır.

## 4. Ürün sayfası sıkılaştırma (Recep: "sayfa kompakt değil")
Ekran 07'de ilk ekran (1440×900) içinde şunlar görünmeli: görsel, ad + kod, sertifika çipleri, teknik tablo
(en az 6 satır), seçiciler, iki eylem düğmesi. Debi-basınç eğrisi ve aksesuarlar ikinci ekrana iner.
Yol: görsel sütunu %40'tan %34'e, teknik tablo satır yüksekliği 44 → 36 px, açıklama paragrafı tabloya
değil sayfa altına ("Açıklama" bölümü). Boşluklar v1 ritmiyle kalır, yazı küçülmez.

## Ek maddeler — ekran 06 ve 07 kullanıcı gözüyle (Recep + OPS, 2026-09-03 23:35)

### Ürün sayfası (ekran 07)
5. **Okunmayan eylem bağlantıları.** "Bu ürün için doğrudan teklif iste →", "Teknik katalog (PDF)", "Performans eğrisi",
   "DXF çizim" ince turkuaz metin; Recep zor okudu. Kural: EYLEM asla ince metin bağlantısı olmaz. Madde 2 gereği teklif
   eylemi kiremit düğme; belge bağlantıları çerçeveli küçük düğme dizisi (lacivert kenar, 15 px / 600). Turkuaz yalnız
   gövde paragrafı içindeki bağlantıda kalır.
6. **Seçiciler kendiyle çelişiyor.** Altındaki not "model değiştirici değildir" diyor ama Monofaze ya da ATEX seçince motor
   gücü ve model kodu değişir; bunlar ayrı modellerdir. Kural: seçici = kardeş modele geçiş; seçince kod, teknik tablo ve
   adres (`?sku=`) değişir. O not cümlesi kalkar. Kardeş model yoksa seçici görünmez.
7. **Sertifika çipi ile seçici aynı şeyi iki kez söylüyor** ("ATEX opsiyonel" çipi + "Versiyon: ATEX" seçici). Çip yalnız
   BU modelin sahip olduğu sertifikayı gösterir; "opsiyonel" çipi olmaz.
8. **Kullanım alanları eksik.** Listede senaryo süzgeci var, ürün sayfasında hiç yok. Başlığın altına "Kullanım alanları"
   çipleri (Kimya laboratuvarı, Galvaniz…) eklenir, her biri senaryo sayfasına gider.
9. **Marka satırı tıklanmıyor.** "SEAT VENTILATION" üst etiketi marka sayfasına bağlanır; yanında küçük marka logosu
   (yükseklik 20 px, beyaz kutu gerekmez).
10. **Yazım tek düzen:** header "Teklif İste" ile gövde "teklif iste" farklı. Kural: düğme ve bağlantılarda cümle düzeni
    ("Teklif iste", "Teklif listesine ekle"); yalnız ana menü öğeleri baş harfli (Ürünler, Hesaplayıcılar…).
11. **Breadcrumb "SEAT serisi"** ayrı bir seri sayfasına gitmez (karar: seri sayfası yok); hedefi seri süzgeçli liste
    (`/tr/fanlar/korozyon-dayanimli?seri=seat`).

### Filtreli liste (ekran 06)
12. **Sayfalama yok.** 34 model yazıyor, 6 kart var, devamı yok. Alt kısımda "Daha fazla göster" + sayfa numaraları
    (`?page=2`, her sayfa kendi adresiyle; arama motoru ve geri tuşu için).
13. **Boş sonuç durumu yok.** Süzgeç 0 model verince: "Bu süzgeçlerle model yok" + "Süzgeçleri temizle" + "Projeniz için
    teklif iste" (çerçeveli). Ayrı küçük ekran olarak çizilir.
14. **Kartın tamamı tıklanır**, düğme ayrı hedef. Şu an yalnız başlık tıklanır görünüyor.
15. **Sıralama tek seçenekli** (Debi artan). Seçenekler: Debi ↑↓, Statik basınç ↑↓, Güç ↑↓, Ad A-Z.
16. **Mobil süzgeç paneli çizilmemiş:** "Filtrele" düğmesine basınca açılan alt panel (bottom sheet) ve "N modeli göster"
    düğmesi eklenir.
17. **Süzgeç yalnız dolu alanlardan** (teknik tablo kuralının aynısı): veri olmayan alan süzgeçte görünmez; "[sayı]" gibi
    yer tutucu kalmaz.

### Ürün sayfası — kayıtlı mimari (Recep 2026-08-25, REC-65) ekran 07'ye giriyor
18. **Deneyim modülü.** Ekran 07 kabuğu kalır; eylem bloğunun ÜSTÜNE kanal fanı deneyim modülü gelir. Kaynak:
    projedeki `referans-canli-urun-sayfasi-v11.html` (Recep'in seçtiği yerleşim, tarayıcıda aç ve çalıştır).
    Yerleşim ve özellik envanteri KORUNUR (canlı-durum §8'deki liste); yalnız 15A diline giydirilir: Archivo,
    palet, kiremit kuralı, çerçeveli düğmeler. Sürüm defteri: CLAUDE.md'ye "v11 envanteri → v4 ekran 07"
    tablosu (ÖZELLİK → VAR / DEĞİŞTİ / DÜŞTÜ+gerekçe). Düşen madde onaysız kalmaz.
19. **Hava perdesi modülü** ayrı artboard (ekran 07b): kapı genişliği + montaj yüksekliği → zemindeki hız,
    kapsama, modül adedi, hüküm. Aynı kabuk.
20. **Sayfa kompaktlığı (madde 4) modülle birlikte çözülür:** ilk ekranda niyet çipleri + hero (fan, devir,
    hüküm) + eylem; teknik tablo ve gerisi ikinci ekran, üstte yapışkan bölüm çubuğu.
21. **İki kip:** eylem bloğu Teklif kipi (bugün) ve Satış kipi (fiyat, adet, teslim, "Sepete ekle" kiremit,
    "Teklif iste" çerçeveli) olarak iki artboard; Satış kipi ARSIV etiketiyle durur.
22. **Kart eylemleri (ekran 06):** kartın tamamı tıklanır; "Karşılaştır" (en çok 4, altta yapışkan çubuk
    "N modeli karşılaştır") + "Teklif listesine ekle", ikisi çerçeveli. Yeni Ekran 11: karşılaştırma tablosu
    (satırlar teknik alan, sütunlar model, farklı değer vurgulu, her sütunda "Teklif listesine ekle").
23. **Apple çizgisi somutlaşıyor (Recep 08-30 kararı, ilk kez yazılıyor):** masaüstü menü paneli 7 kategori
    büyük kiremit (ikon 48 px + ad + tek satır), kürasyon sütunu ve sayı kalabalığı kalkar, panelde en çok 12
    öğe; mobil menü tam ekran örtü, 20 px tek sütun, kategori → dal akordeon, en altta "Teklif iste" + "Teklif
    Listesi", en çok 9 öğe; geçiş 200 ms, gölge ve çizgi yok, ayrım boşlukla.

### Header sağ üst — "Teklif" iç menüsü (Recep 2026-09-03 gece; madde 2'yi GÜNCELLER)
24. **İki düğme yerine tek öğe:** header sağında arama · TR/EN · **"Teklif" (rozet: n)** · hesap simgesi. "Teklif iste" ve
    "Teklif Listesi (n)" ayrı düğme olarak KALKAR; ikisi de bu öğenin açtığı küçük panelin içindedir. Apple'ın çanta
    paneli gibi: tıklayınca sağ üstten 360 px genişlikte, gölgesiz, 8 px köşeli, beyaz zemin, 200 ms açılan panel.
    Panel içeriği (yukarıdan aşağı, ≤ 8 öğe):
    - Başlık satırı: "Teklif listesi · 3 kalem" (boşsa "Teklif listesi boş" + tek satır "Ürünlerden ekleyin").
    - En çok 3 kalem: küçük görsel 40 px, model adı, kod (mono); fazlası "+2 kalem".
    - Kiremit düğme (panelin tek kiremiti): "Teklif talebini gönder" (liste doluysa) / "Teklif iste" (liste boşsa, genel form).
    - İnce ayrım boşluğu, sonra sessiz bağlantı listesi (Archivo 15 px / 400, satır 44 px, ok yok):
      Teklif iste (genel form) · Tekliflerim (`/account/quotes`) · Projelerim (`/account/projects`) · Yeni proje oluştur ·
      Favorilerim (`/account/favorites`).
    - Girişsiz kullanıcıda son üç satır yerine tek satır: "Tekliflerinizi ve projelerinizi görmek için giriş yapın" (bağlantı).
    Sebep: canlı sitede müşteri paneli (teklifler, projeler, favoriler) ZATEN var; header bunları göstermiyordu. Tek öğe +
    panel, madde 2'deki "iki düğme yan yana" karışıklığını da kökten kaldırır: kiremit sayfa gövdesinde, header sakin.
25. **Mobil:** aynı "Teklif (n)" simgesi üst şeritte; panel alttan açılan yaprak (bottom sheet), aynı sıra.
26. **Proje kavramı tasarımda tanımlanır:** proje = ad + mahal listesi + kalemler; "Yeni proje oluştur" iki alanlı küçük
    form (proje adı, açıklama), sonra teklif listesindeki kalemler projeye bağlanabilir ("Bu kalemleri projeye ekle").
    Projelerim sayfası (`/account/projects`) Faz 4 ekranı; şimdi yalnız panel bağlantısı ve form çizilir.

### Mobil kabuk — uygulama gibi (Recep 2026-09-04 gece, Trendyol örneği; Apple dili)
27. **Alt sekme çubuğu (sabit, her ekranda, 5 sekme, ikon + 11 px etiket):** Ana sayfa · Ürünler · Teklif (rozet n) ·
    Destek · Hesap. Bu, "kullanıcı ürüne de kendi işine de tek dokunuşla ulaşsın" sorusunun cevabı; iOS/Android
    standardı, öğrenme yok. Seçili sekme lacivert dolu ikon, diğerleri çizgi ikon; kiremit YOK (kiremit yalnız sayfa eylemi).
    - Ürünler: tam ekran menü örtüsü (madde 23).
    - Teklif: madde 25'teki alt yaprak (liste + gönder + Tekliflerim/Projelerim).
    - Destek: alt yaprak, 5 satır, ikonlu: WhatsApp ile yaz · Ara (tel) · Teknik destek iste (form) · Kargo takibi
      (sipariş no) · İletişim. Girişli kullanıcıda "Kargo takibi" doğrudan son sevkiyata gider.
    - Hesap: girişsiz → Giriş yap / Kayıt ol; girişli → Tekliflerim · Projelerim · Siparişlerim · Favorilerim · Profil.
28. **Üst şerit mobilde:** logo · arama (tam genişlik, ikinci satır) · başka hiçbir şey; "Teklif" ve "Menü" alt çubukta.
    Ana sayfada aramanın altında **yatay kaydırılan kategori çipleri** (7 kategori, ikon 24 px + ad, Trendyol'daki gibi
    tek satır); kategori ve liste sayfalarında aynı şerit o sayfanın dallarını gösterir.
29. **Ürün sayfası mobil:** alt sekme çubuğunun üstüne yapışan eylem çubuğu: "Teklif listesine ekle" (çerçeveli) +
    "Bu model için teklif iste" (kiremit). Kaydırınca çubuk kalır, sekme çubuğu kalır (toplam ≤ 120 px).
30. **Ölçüt:** başparmakla tek elde: ana eylemlerin hepsi ekranın alt 40 %'inde; her ekranda görünen etkileşimli
    öğe ≤ 9; dokunma hedefi ≥ 44 px.

### Eklemeler 2026-09-04 sabah (Recep + OPS; Design'ın "şerit ana sayfada tekrar" sorusunun cevabı dahil)
31. **Ürünler menüsü alttan açılır + logo işareti menü ikonu.** Alt sekme çubuğundaki "Ürünler" sekmesine basınca menü
    ALTTAN yukarı tam ekran kayar (yandan çekmece ya da yukarıdan açılma YOK; başparmak altta). İçerik: 7 kategori büyük
    satır → dokununca dallar; en altta "Teklif iste" + "Teklif Listesi". "Ürünler" sekmesinin İKONU bizim üç dilimli logo
    işaretidir (Recep fikri): işaret zaten "menü" okunur, marka her gün dokunulan yer olur. Üst şeritteki logo eve gider,
    menü açmaz. Masaüstünde "Ürünler ▾" öğesinin önünde aynı küçük işaret.
32. **Seçim yardımcısı ayrı sekme DEĞİL, üç giriş noktası, tek motor** (canlıdaki sessiz fan / hava perdesi sihirbazı yeni
    kabukta): (a) **Seçici sayfası** — kendi adresiyle, Hesaplayıcılar altında ("Doğru fanı seçin", "Hava perdesi seçici");
    ürünü bilmeyene giriş, arama motoruna gerçek sayfa. (b) **Ürün sayfası modülü** (madde 18) — "bu model odama yeter mi",
    tereddüt edene. (c) **Teklif listesinde kalem yanında "Hesapla"** — o model seçili gelir, oda girilir, YETER/YETMEZ
    hükmü kalemin yanına yazılır, talep kanıtlı gider. Ana sayfa hero ikinci düğmesi "Ürünleri keşfet" → "Doğru fanı seçin"
    (seçici sayfasına). **YASAK:** sepet ve ödeme adımında hesaplama; orada olsa olsa isteğe bağlı "uygunluğu kontrol et"
    bağlantısı. Satış kipine geçince yalnız düğmeler değişir, yerler değişmez.
33. **Mobil üst şerit "akıllı şerit" olur — Design'ın sorusunun cevabı.** Ana sayfada kategori çipleri kategori kartlarıyla
    tekrar ediyor; kaldırmak yerine şeridin içeriğini SAYFAYA GÖRE değiştiriyoruz, bileşen tek:
    - **Ana sayfa:** kategori değil **MEKÂN/SENARYO çipleri** ("Nereye takacaksınız?": Banyo · Mutfak · Ofis · Restoran ·
      Otopark · Sığınak · Laboratuvar · Depo). Dokununca o senaryonun süzgeçli listesi açılır, seçim yardımcısı o mekânla
      dolu gelir. Kullanıcı ürün ağacından değil kendi ihtiyacından başlar; farkımız bu, kategori gridi altta zaten var.
    - **Kategori sayfası:** o kategorinin dalları (Design'ın önerisi, aynen).
    - **Liste sayfası:** aktif süzgeçler çip olarak (kaldırılabilir) + "Süzgeç" düğmesi.
    - **Ürün sayfası:** aynı serinin kardeş modelleri (SEAT 25 · 30 · 35 · 40…), aktif olan vurgulu.
    - **Teklif listesi:** kalemler çip; dokununca kaleme kayar.
    Kural: şerit her sayfada "buradan sonra ne yaparım" sorusuna cevap verir; hiçbir sayfada alttaki içeriği tekrar
    etmez. Yatay kaydırma kalır (tam adlar), boşsa şerit hiç görünmez. Design: ana sayfa (senaryo çipleri) + kategori
    sayfası varyantını çiz; diğer üçü Faz 3-4'te.

34. **[FAZ 3 ADAYI — ŞİMDİ ÇİZME, OPS 06:20 düzeltmesi] Mobil "çekmece": alt sekme çubuğu, akıllı şerit ve menü TEK
    sürüklenebilir yaprakta birleşir (Recep fikri).** Faz 1-2'de mobil omurga madde 27 (alt sekme çubuğu) + madde 33
    (akıllı şerit); çekmece ancak bunlar canlıda ölçüldükten sonra, ayrı bir deneme turunda. Sebep: üç konumlu sürüklenebilir
    yaprak sayfa kaydırmasıyla çakışır, iOS Safari alt çubuğuyla kavga eder, erişilebilirliği zordur ve B2B kullanıcı
    hareketi keşfetmeyebilir; Faz 1'e alınması riski büyütür. Aşağıdaki tarif ileride geçerli olacak hâliyle duruyor:
    Ekranın altında her zaman duran bir yaprak, üstünde tutamaç çizgisi (36×4 px); parmakla yukarı çekilir ya da
    tutamaca dokunulur. Üç konum:
    - **Kapalı (varsayılan):** yalnız 5 sekme (madde 27) + tutamaç. Yükseklik ≤ 64 px, içerik görünür kalır.
    - **Yarım (ekranın %45'i):** o sayfanın AKILLI ŞERİDİ dikey liste olarak (madde 33: ana sayfada mekân/senaryo,
      kategoride dallar, üründe kardeş modeller) + teklif listesi özeti (n kalem, "Teklif talebini gönder" kiremit).
      Kullanıcı sayfadan ayrılmadan yön değiştirir; farkımız burası, Apple Haritalar / Google Haritalar yaprağı gibi
      ama ticaret sitesinde.
    - **Tam:** tam menü (madde 31 içeriği: 7 kategori → dallar, Hesaplayıcılar, Bilgi Merkezi, İletişim, en altta
      Teklif iste + Teklif Listesi, Hesap).
    Kurallar: yaprak açıkken arka plan hafif kararır, aşağı çekince kapanır; geçiş 200 ms; konumlar arası sürtünme
    (snap). "Ürünler" sekmesine dokunmak = tam konuma atlamak; "Teklif" sekmesi = yarım konumda teklif özeti.
    Erişilebilirlik: sürükleme yalnız kısayol; her konum dokunmayla da ulaşılır. Design: ana sayfa ve ürün sayfası için
    üç konumu çiz (6 artboard), diğer ekranlarda yalnız kapalı konum. Madde 25 ve 28'deki ayrı yapraklar bu çekmecenin
    içine taşınır (mükerrer yaprak yok).

### Veri notu (tasarım kararı değil, üretim sınırı)
Debi-basınç eğrisi verisi 145 modelde gerçek (eğri kalır, yoksa bölüm görünmez). DXF ve PDF dosyası bugün depoda 0;
"DXF çizim" ve "Teknik katalog" düğmeleri yalnız dosya bağlıysa görünür, yoksa satır yok.

## Değişmeyecekler
Geri bildirim 1'in 11 maddesi, bilgi mimarisi, palet, yazı tipleri, model kartları, tek model sayfası kurgusu.

