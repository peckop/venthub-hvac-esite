# Kararlar — Vitrin 15A Yeniden Tasarım (Linear belgesinin TAM dışa aktarımı · 2026-09-06 ayna: K1–K25-b)

<!-- kaynak_id: 061e6113-0f57-4296-a327-4e0f1a07cd76 · kaynak_updatedAt: 2026-09-05T22:09:37.981Z · kopya: 2026-09-06T04:50Z -->
<!-- Dosya adındaki 2026-09-04 ilk dışa aktarım günüdür, kopyanın tarihi DEĞİLDİR; tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->

> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır. Çelişkide Linear kazanır.

# Kararlar — Vitrin 15A Yeniden Tasarım

**Tek kaynak.** Bir karar buraya yazılmadan verilmiş sayılmaz. Design'a giden `venthub-canli-durum.md` bu belgenin dışa aktarımıdır; çelişirse bu belge kazanır. Her madde: tarih · karar · kaynak. "Design eklemesi" karar değildir; Recep evet demeden bu belgeye girmez.

> ⚠ **Saat etiketleri düzeltmesi (OPS, 2026-09-04):** Bu belgedeki 2026-09-04 tarihli "10:40 / 12:30 / 13:45 / 14:00 / 14:50 / 15:30 / 15:45 / 16:10 / 16:50 / 17:10 / 18:30" etiketleri OPS'un o gün YANLIŞ saat varsayımıyla yazıldı (gerçek yerel saatten yaklaşık 5 saat ileri; ölçüm: belgenin updatedAt değeri 12:25Z = 15:25 TR iken içinde "18:30" etiketi var — URUN yakaladı). Etiketler SIRA belirtir, duvar saati değil; güven updatedAt'tadır. Bundan sonra karar etiketi "tarih + sıra no" (ör. 09-04 #7) ile yazılır, saatle değil.

## K1 · Ticari model (2026-08-31, Recep)

Site TEKLİF ODAKLIDIR. Fiyat, KDV, sepet, ödeme, stok YOK. Sepet ve satış kipi şirket kurulunca açılır (bkz. Teklif Akışı projesi). Bayi fiyatı hiçbir ekranda geçmez. "Yakında", boş dal, vaat kutusu yok; vitrin yalnız var olanı gösterir.

**K1a · Doğru okunuş (Recep, 2026-09-04 akşam):** "YOK" değil, **KAPALI**. Site iki kipli tek sitedir: teklif kipi açık, satış kipi (sepet · ödeme · sipariş · fatura · iade · kargo · mesafeli satış/iade metinleri) kodda var, tek anahtarla kapalı, şirket kurulunca AÇILIR. Satış kipi ekranları yeni tasarım diline ŞİMDİ çizilir ve kabukla birlikte kodlanır; şirket açılış günü yeni tur değil, anahtar. Hiçbir brief/belge "K1 gereği yok" yazmaz. Anahtar envanteri: "Anahtar ve Kip Haritası" belgesi. (OPS bunu 09-04'te üç kez "yok" diye okudu; düzeltildi.)

## K2 · Kimlik (2026-09-02, Marka Kılavuzu projesi)

Logo 14A-3, wordmark "VentHub" (Archivo 700). Palet: lacivert #1A2B4A · turkuaz #0088B0 · kiremit #D95D0E · amber yalnız uyarı. Yazı tipleri: Archivo (arayüz) · Source Serif 4 (uzun metin) · IBM Plex Mono (kod/teknik değer). Koyu header + footer, aydınlık gövde. 16 ikon (7 kategori + 9 senaryo); dal ikonu çizilmez.

## K3 · Kategori ağacı ve adresler (2026-09-03, Recep)

Ağaç = 15A: 7 kategori · 26 dal · üçüncü seviye yok (faset). Sığınak üst kategori. Boş dal görünmez. Kategori adresleri ŞİMDİ kısa slug'a geçer, `/category/` kalkar; eski adresler 301, hreflang + sitemap + GSC aynı yayında. Ürün adresi `/tr/products/<seri>` kalır; sayfa MODEL bazlı (v1 ekran 6-7); model adresleri Faz 3'te ayrı kararla.

## K4 · Menüde olmayanlar (2026-09-03, Recep)

Atıksu Arıtma ve Hava Arıtma menüde, senaryo listesinde ve sayfalarda yer almaz (senaryo listesi 8). Hava Arıtma ürün gelince ayrı kararla açılır.

## K5 · Kiremit ve düğme kuralı (2026-09-03 → 09-04, Recep)

Her sayfada TEK dolu kiremit, o da sayfanın işini bitiren eylem; diğer her düğme çerçeveli. Tek fiil "Teklif iste" ("Teklif al" yok). Header sağında tek öğe "Teklif (n)" → Apple çanta paneli (liste + gönder + Teklif iste / Tekliflerim / Projelerim / Yeni proje / Favorilerim). Gövde düğmeleri özel etiketli: "Projeniz için teklif iste" (hero), "Bu model için teklif iste" (ürün), "Teklif talebini gönder" (liste), "Teknik destek iste" (senaryo). Kart eylemleri çerçeveli: Karşılaştır + Teklif listesine ekle. Eylem asla ince metin bağlantısı olmaz.

## K6 · Ürün sayfası mimarisi (2026-08-25 REC-65; 09-04'te bu belgeye taşındı)

Ürün sayfası = TEK ŞABLON (kabuk) + ürün grubuna göre DENEYİM MODÜLÜ. Kanal fanı modülü: niyet çipleri → oda girdileri → devir kaydırıcısı; ihtiyaç çizgisi, YETER/SINIRDA/YETMEZ hükmü, ihtiyaca göre boyanan varyantlar, konuşan teknik tablo, standart rozeti, göreli ses kıyası. Referans: v11 mockup (artifact cd004ee0, projede `referans-canli-urun-sayfasi-v11.html`), yerleşim DOKUNULMAZ; cetvel: mockup-gelisim-hatti-standardi (hiçbir özellik sessizce düşmez). Hava perdesi modülü ayrı. Eylem bloğu iki kip: Teklif (bugün) / Satış (şirket sonrası). Teklif kaydı seçimin kaynağını (sistem önerisi / kullanıcı) ve girdileri taşır.

## K7 · Teknik alan (2026-09-03, Recep)

Hedef tam veri; ilk aşamada eksik olabilir, eksik admin listesinde takip edilir. Görüntüleme: varsa satır, yoksa satır hiç yok ("—", "belirtilmemiş" yok). Süzgeçler de yalnız dolu alanlardan. Belge düğmeleri (PDF, DXF) yalnız dosya bağlıysa görünür.

## K8 · Sayfa üretim düzeni (2026-09-01 REC-106 + 09-03)

Az sayıda ŞABLON + veri; sayfa başına özel görünüm yok. Kategori sayfası tek şablon üç mod. Ana sayfa blokları içeriğini DB'den alır. 3D vitrinde tamamen kapalı (09-01 teklif-modu paketi). Üretim 4 faz, her faz Vercel preview onayı; canlı dokunulmaz.

## K9 · Apple çizgisi (2026-08-30 Faz B; 09-04 somutlaştı) — mobil sekme/header maddeleri K19 ile GÜNCELLENDİ

Nefes alanı, disiplinli tipografi, az/kusursuz öğe, ürün kahraman. Masaüstü menü paneli: 7 büyük kategori kiremiti, kürasyon sütunu yok, ≤12 öğe. Mobil (09-04 güncel): alt sekme çubuğu 4 sekme (Ana sayfa · Ürünler · Teklif · İletişim), İletişim yaprağı (WhatsApp ile yaz · Ara · E-posta gönder · Teknik destek iste; Kargo takibi satış kipinde), üst şeritte logo + sağ üstte hesap simgesi (+ yalnız dil uyuşmazlığında EN/TR çipi), arama alt satırda tam genişlik [eski metin "5 sekme / Destek yaprağı / üstte yalnız logo + arama" 09-04 16:50 ve 18:30 kararlarıyla değişti], yatay kategori çipleri, ürün sayfasında yapışık eylem çubuğu; ekranda ≤9 etkileşimli öğe, dokunma hedefi ≥44 px. **→ 09-05 K19: dördüncü sekme Hesap, İletişim header'da yaprak, TR/EN çipi her zaman.**

## K10 · Liste ve karşılaştırma (2026-09-04)

Filtreli liste model kartları gösterir (seri fasette). Sayfalama `?page=`, boş sonuç ekranı, sıralama debi/basınç/güç/ad. Karşılaştırma ekranı (≤4 model, farklı değer vurgulu) yeni Ekran 11.

## K11 · Çalışma protokolü (2026-09-03)

Design mevcut dosyanın üzerine yazmaz; eski sürüm "vN ARSIV" olarak kalır. Sitenin tamamı 15A projesinde çizilir; marka projesi yalnız kimlik kaynağı. Her ekran brief'inden önce bu belge ve Vizyon belgesi taranır.

---

*Değişiklik günlüğü:* 2026-09-04 ilk sürüm (OPS; kaynak: canlı-durum dosyası + REC-129 yorumları + REC-65).

## K12 — Ürün sayfası: kabuk varsayılan, deneyim modülü katlı panel (Recep, 2026-09-04 sabah)

**Karar:** Modülsüz kabuk (15A ekran 07c) her ürünün varsayılan sayfasıdır. Deneyim modülü (REC-65 v11 iç mantığı) sayfada katlanabilir bir paneldir: kapalı hâlde teknik tablonun üstünde tek çağrı satırı ("Bu fan mahalinize yeter mi? Hesaplayın"), dokununca aynı yerde açılır; seçici sayfasından ya da teklif listesindeki "Hesapla"dan gelen ziyaretçide açık ve dolu gelir. Aksesuar/sürücü gruplarında çağrı satırı hiç görünmez.

Değiştirdiği karar: REC-65 / venthub-canli-durum §8 "modül sayfanın üst yarısını doldurur". Modülün iç mantığı ve özellik envanteri aynen korunur, yalnız yerleşim değişir.

**Sebep:** Gelen mühendislerin çoğu model kodunu bilerek gelir ve tabloyu ister; modül kararsız ziyaretçi içindir. İkisi korunur, hiçbiri ötekini ezmez.

**Aynı turda verilen düzen hükümleri (OPS, Recep gördü):** mobil Ürünler menüsünden "Teklif iste" ve "Teklif listesi" düğmeleri kalkar (alt çubukta Teklif sekmesi var); menü alt bölgesi = "Tüm ürünler" + "Markalar" + koşullu "Son baktıklarınız" (≤3 çip); kategori satırına dokun = kategori sayfası, artı = alt dallar; modül metni "nerede kullanacaksınız"; Otopark çipi yok ve mekân çiplerinde ikon yok (Design eklemeleri kabul).

**Kaynak:** Design 15A projesi geri-bildirim-3.md madde 35–41; Menü v8 / Ana Sayfa v6 bekleniyor.

## K13 — Liste sayfaları MATRİS görünümü, iki katlı (Recep, 2026-09-04 sabah) — 15A-F3

**Karar:** Tüm ürünler sayfası ve her dal/seri sayfası Kart / Tablo / Seri üç görünüm alır, varsayılan Tablo (matris). İki kat: katalog geneli ORTAK sütunlar; her ürün grubu KENDİ sütunlarıyla kendi içinde matrislenir. Tüm ürünler sayfasının üstünde marka × kategori haritası (hücrede sayı, dokununca süzer). Aralık süzgeçleri ve tablo indirme (CSV/PDF) Faz 4.

**Sütun seçim kuralı (OPS):** sütun, gruptaki ürünlerin ≥%60'ında doluysa matrise girer; %30–60 gizlenebilir ikincil sütun; <%30 yalnız ürün sayfasında. Liste Design'a verilmeden önce canlı veriden ölçülür (URUN kalem 5: docs/audits/matris-sutun-doluluk-2026-09-04.md). Sebep: teknik alanlar aileye göre değişir (faz 297, IP 209, eğri 145 üründe); yarısı boş tablo çizilmez.

**Design'a etkisi:** ekran 06 şablonuna Tablo görünümü eklenir; Tüm ürünler için ayrı ekran çizilmez (ekran 06, kategori süzgeci boş + harita). Faz 3 işi; geri-bildirim-4 ile gider, v8 paketi dışında.

## K14 — Arama sonucu sayfası (ekran 08) = liste şablonu + arama şeridi (Recep sordu, OPS hükmü, 2026-09-04 öğle)

* Arama sonucu ayrı sayfa değil: ekran 06 liste şablonu (süzgeç, sıralama, sayfalama, kart, üçlü eylem) + aramaya özel üst şerit (sorgu, sonuç sayısı, bağlam çipi).
* 08b boş sonuç: "şunu mu demek istediniz", "süzgeçleri gevşetin", "Doğru fanı seçin" çıkışı.
* Tam model kodu eşleşmesi YALNIZ TEK ürüne denk geliyorsa doğrudan ürün sayfası; seri adı / çok varyant ise liste.
* Ürün dışı sonuç ızgaraya karışmaz: marka eşleşmesi üst şeritte tek çip; Bilgi Merkezi makaleleri bu fazda aramada yok (Faz 4, kendi araması).
* Kaynak: Design'ın 08 analizi + OPS eklemeleri; Recep Design'a "uygula" dediğinde yürürlük.

## K15 — TASARIM ONAYI: Menü Tasarımı v13 + Ana Sayfa v7 Faz 1 kabuk referansı (Recep, 2026-09-04 akşamüstü)

* OPS ölçtü (tam dosya, 449.767 bayt, 18 ekran): geri-bildirim-3 madde 35–41 ve 47 uygulanmış; fiil tek, fiyat yalnız arşiv bloğunda, kiremit disiplini tutuyor. Recep baktı: "sorun yok, tüm sayfalar var".
* Bu sürüm Faz 1 (kabuk) ve Faz 2 (ana sayfa/menü/adresler) uygulamasının referansıdır. Kalıcı kopya: C:/tmp/venthub-design/2026-09-03/menu-v13.dc.html, anasayfa-v7.dc.html.
* Matris görünümü (geri-bildirim-4) Faz 3'te çizilir; çekmece (madde 34) Faz 3 adayı.
* Açık konuşmalar (Faz 4 öncesi): cihaz/ürün seçiminin yeri, proje katmanı (klasör mü kapı mı).

## K — Recep kararları 2026-09-04 #1 (OPS listesi, tek mesajla)

* EVET · Ana sayfa hızı (REC-59 **Adım B/1):** kiracı çözümü derleme anında sabit; `getTenantConfig` istek başlığı okumaz; çok kiracılı yetenek kodda kalır, kapalı. Hedef: ana sayfa önceden üretilir.
* EVET · Ürün listesi sayfalama (REC-59 **Adım B/2):** 1. sayfa statik, `?page=N` ayrı dinamik yol, adres değişmez.
* EVET · REC-138: CI'ye gerçek Supabase SALT-OKUMA erişimi (anon key). Preview koruması/bypass ayarı ayrı Recep kapısı.
* EVET · REC-124: 31 satır katalog metin düzeltmesi (23 ad + 1 boşluk + 7 aile TR) canlıya betikle yazılır; liste docs/audits/rec124-katalog-veri-kusurlari-2026-09-04.md.
* EVET · `.claude/settings.json` **enabledPlugins (supabase) satırı depoya girer** (OPS PR).
* **#981 (Faz 1c header paneli) merge:** 09-04 akşam Recep "insin" dedi → MERGED e390fa99, bayrak kapalı.
* **BEKLİYOR · YENI_KABUK_GEZINMESI bayrağının açılması:** önce Recep'e önizleme, mobilde alt çubuk + header çakışması gözle; sonra ayrı karar.
* Araç kararları (aynı gün): claude-mem KURULMAZ; eski stdio Supabase MCP kaldırıldı, plugin tek; vercel eklentisi KAPALI, claude.ai Vercel MCP açık; frontend-design / coderabbit / claude-code-setup kapalı; gitmcp, markitdown, sequential-thinking, Three.js, Google Drive devre dışı.

## K16 — 15A-F1 kabuk önizlemesi (Recep, 2026-09-04 #2) — header/dil maddeleri K19 ile GÜNCELLENDİ

* Parça parça koda alıp bayrak arkasında ilerleme yöntemi ONAYLI; görünüm Design fazında gelir, şimdiki iş altyapı.
* Mobil alt sekme çubuğu kod olarak kabul.
* Teklif: Design'a göre — mobilde header'da Teklif yok, alt sekme paneli açar; masaüstünde header "Teklif (n)" + panel (K5).
* Dil seçici KALIR, yüzen/hareketli OLMAZ. OPS hükmü: masaüstü header sağ (arama · TR/EN · Teklif(n) · hesap); mobilde Hesap yaprağının en üstünde + yalnız dil uyuşmazlığında üst şeritte çip (16:50 kararı bu maddeyi günceller; 09-05 K19: çip her zaman görünür).
* Hesap sekmesi girişsizken ölü kapı değil: yaprak (dil · Giriş yapın · kilitli Tekliflerim/Projelerim). (09-05 K19: Hesap sayfadır; girişsiz ilk blok Destek.)
* **Design eksiği (Recep fark etti):** giriş / hesap / Tekliflerim / Projelerim ekranları 15A'da çizilmedi → Faz 4 Design kalemi.
* #981 merge: OPS'un 4 düzeltmesi (çift Teklif, sekme davranışı, Hesap ölü kapı, TR/EN) sonrası yeni görsel, sonra Recep kararı → 09-04 akşam indi.

## K — Design'ın erişim ve yazma sınırı (Recep, 2026-09-04 #3)

* Design (15A projesi) GitHub'ı, canlı siteyi (Kernel tarayıcı), sitemap'i, Linear'ı ve Supabase'i OKUR (09-04 ölçüldü).
* **YAZMAZ.** Supabase'e yazma, Linear'a karar/iş/durum yazma, canlıda form/giriş/teklif gönderme YOK. Recep Design'a bunu söyledi.
* Orkestratör OPS'tur; bir yazma gerekiyorsa yalnız OPS'un yönlendirmesiyle ve Recep kapısıyla olur. Her Design brief'inde "Erişim ve yazma kuralları" bloğu bulunur.
* Kalıcı hedef: Design'a salt-okuma yetkili ayrı Supabase bağlantısı (REC-140 ile birlikte değerlendirilir).
* Gözden geçirme turu v1 (Fable): brief `gozden-gecirme-brief.md`; çıktı yazılı bulgu, çizim yok; etiketli (AYKIRI / BOŞLUK / İYİLEŞTİRME), ≤ 40 bulgu; kabul edilen bulgu bu belgeye girer, sonra çizim.

## K — Mobil header: Hesap ve dil sağ üste (Recep eğilimi, 2026-09-04 #4 — 16:50'de karar oldu; 09-05 K19 ile yeniden değişti)

* Recep: mobilde sağ alttaki **Hesap** sekmesi header'ın sağ üstüne taşınır; **dil seçimi** de sağ üstte olur.
* Etkisi: K9 "üstte yalnız logo + arama" maddesi değişir (logo · arama · dil · hesap); alt sekme çubuğu 5'ten 4'e iner (Ana sayfa · Ürünler · Teklif · Destek). K16'daki "dil Hesap yaprağının üstünde" hükmü bununla yer değiştirir.
* Kod: #981 olduğu gibi kalır (bayrak kapalı); header düzeni Design çizip Recep onayladıktan sonra tek seferde kodlanır, ara sürüm yazılmaz.
* OPS düzeltmesi: v13 mobil üst şeritte arama kutusu logonun ALTINDA ayrı satırdır; logonun sağı boş. Hesap simgesi + dil seçimi oraya sığar, arama daralmaz. Design'dan istenen: dokunma hedefi ≥ 44 px (K9).

## K — DESIGN şerit adı ve iletişim kanalı (Recep, 2026-09-04 #5) — 09-05: üç Design şeridi

* Design bu sistemde bir şerittir. 09-05'ten itibaren üç şerit: **DESIGN-MENU** (Vitrin 15A), **DESIGN-MARKA** (kimlik), **DESIGN-BELGE** (Kurumsal Belgeler). Linear'a yazdığı her yorumun sonunda imza: `— DESIGN-<ŞERİT> (model adı) YYYY-MM-DD`. OPS yorumları `— OPS` ile biter; hepsi Recep hesabıyla düştüğü için imza zorunlu. Her şerit yalnız kendi Linear projesine yazar.
* Kanal: DESIGN → OPS otomatik (OPS'un gözcüsü Design projesindeki yeni/değişen dosyayı 5 dk içinde görür; bu yüzden DESIGN her çıktıyı DOSYA olarak yazar, Linear yorumu ikincil). OPS → DESIGN: brief projeye dosya olarak bırakılır; tetik Recep'tir ("Linear'a bak" / "brief'i uygula").
* DESIGN okur: GitHub, canlı site (Kernel), sitemap, Linear, Supabase (yalnız SELECT). Yazar: yalnız kendi projesindeki dosyalar + tur sonu tek Linear yorumu. Karar belgesine yazmaz.

## K17 — Cihaz/ürün seçiminin yeri: AYRI SEÇİCİ SAYFASI (Recep, 2026-09-04 #6)

* Seçici tek sayfadır (Hesaplayıcılar altı; koddaki dört hesaplayıcı yolu tek yola iner, eskiler 301). Diğer yüzeyler ona BAĞLANTI verir: ana sayfa düğmesi, senaryo sayfasında "Bu senaryo için fan seçin" (çerçeveli), teklif listesindeki "Hesapla". Ürün sayfasındaki katlı panel (K12) kalır; seçiciden gelen ziyaretçide dolu açılır (07d).
* Sebep (Recep): seçimi her sayfaya gömmek yönetilebilirlik açısından ağır olurdu; tek motor, tek sayfa.
* Kaynak: DESIGN gözden geçirme v1 bulgu d.2 + OPS eleme; K15'teki açık konu KAPANDI.

## K — Gözden geçirme v1 kararları (Recep, 2026-09-04 #7)

* **Ürün sayfası "aylık elektrik" kutusu:** para birimi KALKAR; kutu kWh/ay + güç payı % ile kalır (K1 korunur).
* **v11'den düşen "dönen fan animasyonu" ve "koyu mod":** DÜŞTÜ, Recep onayı kayıtlı (K6 gereği).
* **Mobil üst şerit:** DESIGN iki hâli çizer; Recep seçer; alt çubuk 4 sekme.
* Kalan 23 bulgu OPS hükmüyle geri-bildirim-5 brief'ine girdi (K8 üç mod = dal sayısından; K9 ≤ 9 = görünen öğe; "Ürünü incele" kalkar; marka sayfası = liste şablonu).
* **Teklif listesi adresi (Recep, #7b): EKLE, KALDIRMA.** Teklif listesi yeni adres alır: `/tr/teklif-listesi` (EN `/en/quote-list`). Sepet kodu ve `/cart` adresi SİLİNMEZ; satış kipi açılınca kendi sayfası olarak geri gelir. O güne kadar `/cart` sitemap'ten çıkar ve teklif listesine yönlenir. Kod: Faz 2 (URUN).

## K — "Ürün Seçici" kalıcı girişi (Recep, 2026-09-04 #8)

* Seçici sayfasının kalıcı bir girişi olur, adı **"Ürün Seçici"** (fan demez). Masaüstü header'da "Hesaplayıcılar" öğesi "Ürün Seçici" olur; mobil Ürünler menüsü alt bölgesine "Ürün Seçici" satırı; ana sayfa düğmesi aynı ad. Tek ad, tek hedef.
* Geri-bildirim-3 madde 37 bu kararla güncellenir: konmayan fan seçiciydi, konan ürün seçicidir. Brief: geri-bildirim-5 madde 61.

## K — Mobil üst şerit KARARI: 52b + akıllı dil çipi (Recep, 2026-09-04 #9) — 09-05 K19 ile GÜNCELLENDİ

* Mobil üst şerit: logo satırında sağ üstte YALNIZ hesap simgesi; arama alt satırda tam genişlik; dil seçimi hesap yaprağının ilk satırı. Alt çubuk 4 sekme (Ana sayfa · Ürünler · Teklif · Destek).
* **Akıllı dil çipi:** tarayıcı dili sayfa diline uymuyorsa çerçeveli "EN"/"TR" çipi belirir. **→ 09-05 K19: çip HER ZAMAN görünür (girişsiz ziyaretçi için), hesap simgesi header'dan kalkar.**
* Sebep: yer işgali sıfır (şerit sade kalır), yabancı ziyaretçinin dil arayışı kapanır.

## AÇIK — Ürün sayfasındaki hesap paneli (Recep, 2026-09-04 #10) → yol K18

* K12 (katlı panel) geçerli kalır; K17 (ayrı seçici) ile birlikte yaşıyor. Panel kalsın mı / bağlantı+sonuç şeridi mi sorusu AÇIK: Recep canlı veri görmeden karar vermiyor. OPS görüşü 60/40 kaldırma; karşı görüş Google'dan düşen ziyaretçinin sayfada cevap alması.
* DESIGN'dan yazılı görüş istendi (geri-bildirim-6 madde 67). Kod sırası: önce seçici, panel ikinci; kararı canlı ölçüm verir.

## K — "İletişim" sekmesi + ürün seçimi alternatif çalışması (Recep, 2026-09-04 #11) — sekme maddesi K19 ile DEĞİŞTİ

* Mobil alt çubuk sekmesi ve yaprak adı **"İletişim"** (Destek değil). Yaprak: WhatsApp ile yaz · Ara · E-posta gönder · [çerçeveli] Teknik destek iste; beklenti satırları; ürün sayfasından açılınca bağlam satırı. YZ asistanı ve kargo takibi K1 gereği yok. **→ 09-05 K19: sekme Hesap oldu; İletişim yaprağı header'a taşındı, satırlar niyetle adlandı.**
* Ürün sayfası paneli / seçici sorusu: üç alternatif (A tek sayfa seçici + bağlantı · B hafif panel · C rehberli "benim yerime seç") AYRI AYRI akış olarak çizilir; Recep yan yana görüp seçer (geri-bildirim-7 madde 69). K12 o güne kadar değişmez.
* AFS mobil arayüzü esinlenme kaynağı (kopya değil): zorunlu içerik haritası DESIGN'a (madde 70). OPS'un "ana sayfaya kategori kartları" önerisi düştü: v9'da zaten var.

## K18 (İSTİŞARE — KARAR DEĞİL; Recep "karar" deyince başlık düzelir) — Ürün Seçici: tek sayfa, grup grup, ürün sayfası en son

* **Yol:** (1) Seçici TEK SAYFADA yaşar (`/secici`); ürün sayfasında hesaplama YOK. (2) Motorlar ürün grubuna göre PEYDERPEY eklenir; ilk grup kanal fanı (mevcut motor, 6 mahal, ASHRAE 62.2 / EN 16798-1 atıflı). Diğer grupların kural tabloları Recep'in zamanı geldiğinde yazılır; baskı yok. (3) Ürün sayfasına entegrasyon (hafif panel ya da tam hesap) EN SON, gruplar tamamlanınca. Design A/B/C çalışması: A'nın seçici sayfası temel; C ("sorularla başla") kural tablosu sonrası; B çizilmez.
* **OPS eklemesi (hüküm, geri alınabilir):** Ürün sayfasında hesaplama olmasa da, motoru OLAN grubun ürünlerinde tek satır bağlantı ("Bu ürün mahalinize uyar mı? → Ürün Seçici") ilk günden durur; motoru olmayan grupta satır görünmez.
* **Veri kuralı (K18a):** sonuç kartında yazan her sayı `technical_specs`'ten gelir; eğrisi/verisi olmayan ürün "değerlendirilemedi" hükmüyle görünür, gizlenmez, "uymaz" denmez. Eğri doldurma (295 fanın 145'inde var) katalog veri işi, PDF ingestor hattı; seçicinin tavanı budur.
* **Örnek/ölçüm:** Design v1 örneği (laboratuvar) motorda yok, kart sayıları uydurmaydı (SEAT 35 gerçek: 5.880 m³/h, 69 dB, eğri yok) → geri-bildirim-8 ile düzeltme istendi.

## K19 · Mobil kabuk v2: Hesap sekmesi, İletişim header'da yaprak (Recep, 2026-09-05 sabah — "önerinle yöneteceğim"; OPS önerisi kabul)

K9 ve K16'nın mobil sekme ve header maddelerini GÜNCELLER (Design Kabuk v2 + Systemair incelemesi + Recep'in Ziraat/X/Trendyol referansları üzerine ortak karar):

1. **Alt çubuk dört sekme, dördü SAYFA:** Ana sayfa · Ürünler · Teklif (satış kipinde Sepet, aynı yuva) · Hesap. Sekmeden yaprak açılmaz. "İletişim" sekmesi (09-04 #11) kalkar.
2. **İletişim = header'ın sağında yeşil simge**, dokununca yaprak. Yaprak satırları unvanla değil NİYETLE adlanır: "Teklif ve sipariş" (WhatsApp · Ara; alt yazı: müşteri temsilcisi) · "Ürün seçimi ve teknik soru" (teknik destek formu / e-posta) · "Arıza ve garanti" (satış kipiyle açılır; şimdi çizilir, kapalı bekler). Canlı sohbet gelirse yeni satır olur (müsait saatte üstte, mesai dışı "mesaj bırak"); yüzen balon o günün kararıdır, bugün yüzen düğme ve kenar kulakçığı ÇİZİLMEZ (K5 tek ana düğme; alt bölge zaten kalabalık).
3. **Header sağı:** TR/EN çipi HER ZAMAN görünür (girişsiz ziyaretçi için; K16'daki "yalnız uyuşmazlıkta" hükmü kalkar) · bildirim rozeti (teklif yanıtlandı) yalnız girişliyken · İletişim simgesi. Hesap simgesi header'dan kalkar (sekmeye gitti). Ürün sayfasında "Teklif iste" satırının yanında küçük "soru sor" simgesi. Girişsiz Hesap sayfasının ilk bloğu Destek (giriş/kayıt + kanallar).
4. **Geri dönüş kuralı (ölçüm):** yeni kabuk açıldıktan 2 hafta sonra WhatsApp ve arama tıklaması bugünkü seviyenin altına düşerse İletişim alt çubuğa döner, Hesap header'a çıkar; Design iki hâli de çizer (tek kare farkı).
5. **Design'ın Kabuk v2 diğer maddeleri KABUL:** Ürünler örtüsü → Ürünler sayfası (öne çıkanlar → 7 kategori → senaryolar → tüm ürünler/markalar) · iç sayfalarda "‹ geri · başlık · arama" · Hesap sayfası = AccountLayout gruplarının yeniden dizilişi (Özet · Tekliflerim · Sipariş & Kargo [satış kipi] · Listeler · Hesap yönetimi) · girişli ana sayfa kısayol şeridi.

*Kaynak: OPS–Recep konuşması 09-05 sabah; Design dosyası `systemair-incelemesi-ve-kabuk-v2.md`. Geri alınabilir: itirazda bu madde silinir, K9/K16 eski hâliyle yürür.*

---
— OPS dışa aktarımı 2026-09-05 (kopya damgası dosya başında)

## K20 · Aile anlatımı = ürün sayfasının kendisi, hikâye akışı (Recep 2026-09-05, "sen yönet" — OPS önerisi kabul; geri alınabilir)

* Aile anlatımı için **ayrı seri sayfası ÇİZİLMEZ**; aile ürün sayfası (07c kalıbı) ilk ekranın altında **bölümlü editoryal** hikâye olarak akar. İlk ekran (ad · 2-4 kalın madde · teknik tablo · eylem bloğu · varyant seçici) değişmez (K12).
* Bölümler = Systemair ölçüm raporundaki 6 yapısal blok; metin **içerik hattından** (REC-146) gelir; içerik yoksa sayfa çizilir, **yayına girmez**.
* **İmza hareketi = 3D ürün**, yalnız GLB modeli olan üründe (bugün 0/374). Model yoksa blok çizilmez, "yakında" yazılmaz (vaat kuralı).
* Yasak: "kaydırarak keşfet" oku · bölüm sayacı · uydurma sayı/sayaç · görsele gömülü metin · yapay video · her bölümde ortalanmış metin.
* Reduced-motion'da aynı içerik statik ve tam; 390 ayrı kompozisyon; teslimle 3 ekran görüntüsü.
* Brief: geri-bildirim-10 m.81 (DESIGN-MENU). Kaynak kurallar: scroll-craft (kural alındı, motor alınmadı), REC-147.

## K21 · Ürün değişirse her şey veriden (DESIGN-MENU v3 öz-düzeltmesinden, OPS kabul 2026-09-05)

Çizimde örnek ürün değişirse aynı turda kimlik satırı + sertifika çipleri + açıklama + hesap gerekçesi + seçici eksenleri `technical_specs` ve `description_i18n`'den yeniden yazılır. Anahtarı olmayan hiçbir eksen ve tek değerli hiçbir alan seçici olarak çizilmez (K7 uzantısı).

## K18 eki · Ürün Seçici kademeli açılış önkoşulları (DESIGN-MENU önerisi, OPS kabul 2026-09-05 12:42 TR [Linear damgası 09:42Z]; Recep K18 "önce A, geliştiğiçe C" kapsamında)

* **K18-a Kanonik girdi kümesi:** A'nın alanları (mahal · alan · yükseklik · kişi · devir · ortam koşulları) tek gerçek girdi modelidir. C (rehberli sorular) bu alanlara yazan bir kabuktur, kip anahtarıdır, ikinci motor değildir. Çizimde "Sorularla seçelim / Değerleri kendim gireceğim" tek satır, aynı sonuç bölgesi.
* **K18-b Grup sekmesi üç hâl:** **açık** (motoru var) · **soluk** (motoru yok; "yakında" YAZMAZ, "bu grup için teknik destek iste" der) · **yok** (ürünsüz grup görünmez, K3). Motor eklendikçe tek satır değişir, kabuk değişmez.
* **Faz sırası:** Faz 1 A + kanal fanı · Faz 2 motor eklenir, sekme soluktan açığa · Faz 3 C kipi (kural tablosu sonrası) · Faz 4 ürün sayfası paneli (K12 + canlı ölçüm).
* Kaynak: DESIGN-MENU proje yorumu 09-05 12:28 TR (09:28Z); kalıcı sayfa `Ürün Seçici Karşılaştırma.dc.html`.

## K22 · Durum alfa ile anlatılmaz (DESIGN-MENU ölçümü, OPS kabul 2026-09-05 14:00 TR [Linear damgası 11:00Z])

Çizilmez · arşiv · yetersiz · kapalı gibi durumlar `opacity` ile değil **soluk hex + zemin + rozet** ile gösterilir. Metin her zaman tam opaklık (sözleşme `color.contrast_strategy`). Tek istisna: görsel (`<img>`) şeritleri. Sebep: alfa kenarı ve rozeti de soluklatıp durumu zayıflatır, kontrastı düşürür (ölçüm: 2,6:1 → 7,4:1). Üç dosyada 7 ihlal aynı gün düzeltildi.

## K23 · Logo elle çizilmez (OPS, 2026-09-05; DESIGN-MARKA bulgusu)

Yeni yazılan hiçbir kare/belge/kodda marka işareti CSS ya da elle çizilmez. Tek kaynak: Marka Kılavuzu projesi `brand/logo/` (28 SVG: işaret 7 · yatay kilit 7 · dikey kilit 7 · favicon 4 · avatar 2 · paylaşım 1). Koyu zemin = `venthub-isaret-tamrenk-koyu.svg` (dizilim kiremit · beyaz · beyaz · turkuaz). Mevcut CSS çizimleri (Menü v15, Ana Sayfa v9, altı belge) Kabuk v2 / Belge Kabuğu turunda SVG'ye döner. Kod tarafı: `public/brand/` altından okunur (REC-147 ile). Sebep: iki şerit aynı logoyu elle çizdi, koyu zemin dizilimi farklı çıktı.

## K23-a · Arayüz ikonu kontur kalınlığı = sözleşme (OPS, 2026-09-05)

Arayüz ikonlarının konturu **1.5** (tasarım sözleşmesi v1 ölçümü, 128 kullanım); sahibi DESIGN-MENU, sözleşme JSON'unda tutulur. Marka kılavuzu bu değeri taşımaz (1.4 ve 1.6 bayat). Kategori/senaryo ikonları dolu iki renkli, kontur kuralı onları kapsamaz.

## K23-b · Sönükleştirme de dosyadan gelir (OPS, 2026-09-05 gece; DESIGN-MARKA bulgusu, K22 ∩ K23)

Seçilmemiş/edilgen hâldeki marka işareti `filter: grayscale()`, `opacity` ya da çalışma anında renk değişimiyle ÜRETİLMEZ; kaynak dosyadan gelir: `brand/logo/venthub-isaret-soluk.svg` (#7A8290, açık zemin) · `venthub-isaret-soluk-koyu.svg` (#8FA2BD = `--text-on-dark-muted`, koyu zemin). Logo seti 28 → **30**. Soluk hâl bilgi taşımaz, kontrast eşiği aranmaz; ölçülen sayılar Marka README'sinde (3.87 / 3.52 / 5.42 / 6.92). DESIGN-MENU'nün v16'daki `grayscale` filtresi v17'de dosyaya döner. DS `assets/logo/` +2 → yeniden yayın (Recep).

## Tasarım Programı Haritası (OPS, 2026-09-05 gece)

Parçaların tek çatıda birleşme yolu ayrı belgede: **"Tasarım Programı Haritası — parçalar, roller, birleşme yolu"** (bu proje; id fd4ab9f6-889b-41f9-b090-187cae35c647). Özü: tek çatı = DS + Kararlar; her parça Menü v17'ye kare olarak akar (Ana Sayfa = kare 02-ana, hikâye 07c altı, Ürün Seçici B4); Recep tek dosyada gezer → prototip → kod 4 faz.

## K1a uygulama notu · Satış kipi ekranları Menü v17'de (OPS, 2026-09-05 gece; Recep: "sepet açılınca sayfalar hazır olacaktı, hiçbir yerde yok")

Ölçüm: Menü v16'da Ödeme 0 · Sipariş 0 · İade 0; Anahtar ve Kip Haritası satırı "ÇİZİLECEK (satış kipi turu)" diyordu, tur planlanmamıştı. Kapanış: v17'ye altı kare **S1 Sepet · S2 ödeme adımları · S3 sipariş onayı · S4 Siparişlerim + takip · S5 iade · S6 header/alt çubuk satış hâli**, "kapalı bekler" etiketiyle (Belge E8 dili), teklif kipi karelerinin eşleniği (K16 mantığı). Kargo satırı sabit "Ücretsiz" yazılmaz (REC-47). Kod: Faz 2 kabukla birlikte, bayrak `NEXT_PUBLIC_ODEME_ACIK` arkasında. *(Uygulandı 2026-09-06: v17'de S1–S6 + 390 eşleri çizildi.)*

## K24 · Ürün Seçici girişi = header (2026-09-06)

Recep kararı OPS'a devretti; OPS hükmü: Ürün Seçici'nin menüdeki girişi **header'da kendi öğesi** (bugünkü hâl). "Izgara" alternatifi (senaryo ızgarasında 8. kutu) çizilmez, B4 karesindeki ızgara alternatifi ARSIV. Mobil karşılığı M2 Ürünler sayfasındaki Ürün Seçici satırı. Yöntem kararı değişmedi (K18: A şimdi, C kural tablosu gelince, B çizilmez). Recep itiraz ederse tek satırla döner.

## K25 · Turkuaz metin rengi değildir; `--brand-cyan-ink` (2026-09-06)

Menü ölçtü: `--brand-cyan` (#0088B0) küçük metin olarak beyazda 4,02 · sayfa zemininde 3,70 (AA altı; 72 + 59 kullanım). Hüküm: turkuaz zemin/kenar rengidir; küçük metin ve bağlantı için Marka yeni token üretir `--brand-cyan-ink` (beyaz ve #F4F4F2 üstünde ≥4,5:1, hedef ≈#00708F, sayı Marka'nın). Teklif sayacı: *(K25-b ile değişti)*. Nav "▼" beyaz, 10 px. Artboard etiketleri kiremit değil `--text-body`. `--text-muted` değişmez; kural: yalnız kart/beyaz yüzeyde, sayfa zemininde küçük metin `--text-body`; üçüncü gri üretilmez.

## K25-b · Sayaç ve kiremit düğme zemini koyulaşır (2026-09-06, K25'in düzeltmesi)

OPS'un "turkuaz üstüne lacivert" hükmü ölçümsüzdü; Menü ölçtü: 3,47 (beyazdan kötü), geri alındı. Doğru yol zemini koyulaştırmak: Teklif/Sepet sayacı zemini `--brand-cyan-ink` (beyaz metinle ≥4,5:1, hedef ≈#00708F), metin beyaz. Kiremit düğme zemini `--action-terracotta-deep` (beyaz metinle ≥4,5:1; bugünkü kiremit 3,87), `AnaEylemDugmesi` bu tokene geçer; görünür sonuç: kiremit düğme bir ton koyu. Sayılar Marka'nın; token yayınlanıp çip yeniden seçilince Menü tek turda uygular.
