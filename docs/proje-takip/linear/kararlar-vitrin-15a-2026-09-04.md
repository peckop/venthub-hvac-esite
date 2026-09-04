# Kararlar — Vitrin 15A Yeniden Tasarım (Linear belgesinin TAM dışa aktarımı)

<!-- kaynak_id: 061e6113-0f57-4296-a327-4e0f1a07cd76 · kaynak_updatedAt: 2026-09-04T12:25:35.219Z · kopya: 2026-09-04T13:30:00Z
     Bayatlık ölçütü METİN değil KARŞILAŞTIRMA: Linear updatedAt bu damgadan büyükse bu dosya BAYATTIR (ALTYAPI gözlemi, 09-04). -->

> KOPYA. Kaynak: Linear belgesi `Kararlar — Vitrin 15A` (id 061e6113…, slug kararlar-vitrin-15a-df573c7c8148).
> Kopya tarihi: **2026-09-04 16:30 (+03) = 13:30Z** (Linear updatedAt 12:25Z). Damga daima Z (UTC) yazılır; +03:00 ofsetli alana yerel saat yazılınca değer üç saat kaydı ve dosya doğduğu anda "bayat" çıktı (ALTYAPI ölçtü, 09-04). v1.1: damgayı betik üretir, elle yazılmaz. Çelişkide Linear kazanır. Bu dosya OPS tarafından
> karar belgesi her değiştiğinde yenilenir (proje-takip-defteri-standard §2); başka kopya tutulmaz — 09-04'te
> `design-15a/kararlar-vitrin-15a.md` (13:15 sürümü, K1–K16) URUN'u yanılttı ve kaldırıldı.

**Tek kaynak.** Bir karar buraya yazılmadan verilmiş sayılmaz. Design'a giden `venthub-canli-durum.md` bu belgenin dışa aktarımıdır; çelişirse bu belge kazanır. Her madde: tarih · karar · kaynak. "Design eklemesi" karar değildir; Recep evet demeden bu belgeye girmez.

## K1 · Ticari model (2026-08-31, Recep)
Site TEKLİF ODAKLIDIR. Fiyat, KDV, sepet, ödeme, stok YOK. Sepet ve satış kipi şirket kurulunca açılır (bkz. Teklif Akışı projesi). Bayi fiyatı hiçbir ekranda geçmez. "Yakında", boş dal, vaat kutusu yok; vitrin yalnız var olanı gösterir.

**K1a · Doğru okunuş (Recep, 2026-09-04 akşam):** "YOK" değil, **KAPALI**. Site iki kipli tek sitedir: teklif kipi açık, satış kipi (sepet · ödeme · sipariş · fatura · iade · kargo · mesafeli satış/iade metinleri) kodda var, tek anahtarla kapalı, şirket kurulunca AÇILIR. Satış kipi ekranları yeni tasarım diline ŞİMDİ çizilir ve kabukla birlikte kodlanır; şirket açılış günü yeni tur değil, anahtar. Hiçbir brief/belge "K1 gereği yok" yazmaz. Anahtar envanteri: "Anahtar ve Kip Haritası" belgesi. (OPS bunu 09-04'te üç kez "yok" diye okudu; düzeltildi.)

## K2 · Kimlik (2026-09-02, Marka Kılavuzu projesi)
Logo 14A-3, wordmark "VentHub" (Archivo 700). Palet: lacivert #1A2B4A · turkuaz #0088B0 · kiremit #D95D0E · amber yalnız uyarı. Yazı tipleri: Archivo (arayüz) · Source Serif 4 (uzun metin) · IBM Plex Mono (kod/teknik değer). Koyu header + footer, aydınlık gövde. 16 ikon (7 kategori + 9 senaryo); dal ikonu çizilmez.

## K3 · Kategori ağacı ve adresler (2026-09-03, Recep)
Ağaç = 15A: 7 kategori · 26 dal · üçüncü seviye yok (faset). Sığınak üst kategori. Boş dal görünmez. Kategori adresleri ŞİMDİ kısa slug'a geçer, `/category/` kalkar; eski adresler 301, hreflang + sitemap + GSC aynı yayında. Ürün adresi `/tr/products/<seri>` kalır; sayfa MODEL bazlı (v1 ekran 6-7); model adresleri 15A-F3'te ayrı kararla.

## K4 · Menüde olmayanlar (2026-09-03, Recep)
Atıksu Arıtma ve Hava Arıtma menüde, senaryo listesinde ve sayfalarda yer almaz (senaryo listesi 8). Hava Arıtma ürün gelince ayrı kararla açılır.

## K5 · Kiremit ve düğme kuralı (2026-09-03 → 09-04, Recep)
Her sayfada TEK dolu kiremit, o da sayfanın işini bitiren eylem; diğer her düğme çerçeveli. Tek fiil "Teklif iste" ("Teklif al" yok). Header sağında tek öğe "Teklif (n)" → Apple çanta paneli (liste + gönder + Teklif iste / Tekliflerim / Projelerim / Yeni proje / Favorilerim). Gövde düğmeleri özel etiketli: "Projeniz için teklif iste" (hero), "Bu model için teklif iste" (ürün), "Teklif talebini gönder" (liste), "Teknik destek iste" (senaryo). Kart eylemleri çerçeveli: Karşılaştır + Teklif listesine ekle. Eylem asla ince metin bağlantısı olmaz.

## K6 · Ürün sayfası mimarisi (2026-08-25 REC-65; 09-04'te bu belgeye taşındı)
Ürün sayfası = TEK ŞABLON (kabuk) + ürün grubuna göre DENEYİM MODÜLÜ. Kanal fanı modülü: niyet çipleri → oda girdileri → devir kaydırıcısı; ihtiyaç çizgisi, YETER/SINIRDA/YETMEZ hükmü, ihtiyaca göre boyanan varyantlar, konuşan teknik tablo, standart rozeti, göreli ses kıyası. Referans: v11 mockup (projede `referans-canli-urun-sayfasi-v11.html`), yerleşim DOKUNULMAZ; cetvel: mockup-gelisim-hatti-standardi (hiçbir özellik sessizce düşmez). Hava perdesi modülü ayrı. Eylem bloğu iki kip: Teklif (bugün) / Satış (şirket sonrası). Teklif kaydı seçimin kaynağını (sistem önerisi / kullanıcı) ve girdileri taşır.

## K7 · Teknik alan (2026-09-03, Recep)
Hedef tam veri; ilk aşamada eksik olabilir, eksik admin listesinde takip edilir. Görüntüleme: varsa satır, yoksa satır hiç yok ("—", "belirtilmemiş" yok). Süzgeçler de yalnız dolu alanlardan. Belge düğmeleri (PDF, DXF) yalnız dosya bağlıysa görünür.

## K8 · Sayfa üretim düzeni (2026-09-01 REC-106 + 09-03)
Az sayıda ŞABLON + veri; sayfa başına özel görünüm yok. Kategori sayfası tek şablon üç mod. Ana sayfa blokları içeriğini DB'den alır. 3D vitrinde tamamen kapalı (09-01 teklif-modu paketi). Üretim 4 faz (15A-F1..F4), her faz Vercel preview onayı; canlı dokunulmaz.

## K9 · Apple çizgisi (2026-08-30 Faz B; 09-04 somutlaştı)
Nefes alanı, disiplinli tipografi, az/kusursuz öğe, ürün kahraman. Masaüstü menü paneli: 7 büyük kategori kiremiti, kürasyon sütunu yok, ≤12 öğe. **Mobil (09-04 güncel):** alt sekme çubuğu 4 sekme (Ana sayfa · Ürünler · Teklif · İletişim), İletişim yaprağı (WhatsApp ile yaz · Ara · E-posta gönder · Teknik destek iste; Kargo takibi satış kipinde), üst şeritte logo + sağ üstte hesap simgesi (+ yalnız dil uyuşmazlığında EN/TR çipi), arama alt satırda tam genişlik [eski metin "5 sekme / Destek yaprağı / üstte yalnız logo + arama" 09-04 16:50 ve 18:30 kararlarıyla değişti], yatay kategori çipleri, ürün sayfasında yapışık eylem çubuğu; ekranda ≤9 etkileşimli öğe, dokunma hedefi ≥44 px.

## K10 · Liste ve karşılaştırma (2026-09-04)
Filtreli liste model kartları gösterir (seri fasette). Sayfalama `?page=`, boş sonuç ekranı, sıralama debi/basınç/güç/ad. Karşılaştırma ekranı (≤4 model, farklı değer vurgulu) yeni Ekran 11.

## K11 · Çalışma protokolü (2026-09-03)
Design mevcut dosyanın üzerine yazmaz; eski sürüm "vN ARSIV" olarak kalır. Sitenin tamamı 15A projesinde çizilir; marka projesi yalnız kimlik kaynağı. Her ekran brief'inden önce bu belge ve Vizyon belgesi taranır.

*Değişiklik günlüğü:* 2026-09-04 ilk sürüm (OPS; kaynak: canlı-durum dosyası + REC-129 yorumları + REC-65).

## K12 — Ürün sayfası: kabuk varsayılan, deneyim modülü katlı panel (Recep, 2026-09-04 sabah)
**Karar:** Modülsüz kabuk (15A ekran 07c) her ürünün varsayılan sayfasıdır. Deneyim modülü (REC-65 v11 iç mantığı) sayfada katlanabilir bir paneldir: kapalı hâlde teknik tablonun üstünde tek çağrı satırı ("Bu fan mahalinize yeter mi? Hesaplayın"), dokununca aynı yerde açılır; seçici sayfasından ya da teklif listesindeki "Hesapla"dan gelen ziyaretçide açık ve dolu gelir. Aksesuar/sürücü gruplarında çağrı satırı hiç görünmez.
Değiştirdiği karar: REC-65 / venthub-canli-durum §8 "modül sayfanın üst yarısını doldurur". Modülün iç mantığı ve özellik envanteri aynen korunur, yalnız yerleşim değişir.
**Sebep:** Gelen mühendislerin çoğu model kodunu bilerek gelir ve tabloyu ister; modül kararsız ziyaretçi içindir.
**Aynı turda verilen düzen hükümleri (OPS, Recep gördü):** mobil Ürünler menüsünden "Teklif iste" ve "Teklif listesi" düğmeleri kalkar; menü alt bölgesi = "Tüm ürünler" + "Markalar" + koşullu "Son baktıklarınız" (≤3 çip); kategori satırına dokun = kategori sayfası, artı = alt dallar; modül metni "nerede kullanacaksınız"; Otopark çipi yok ve mekân çiplerinde ikon yok.
**Kaynak:** Design 15A projesi geri-bildirim-3.md madde 35–41.

## K13 — Liste sayfaları MATRİS görünümü, iki katlı (Recep, 2026-09-04 sabah) — 15A-F3
**Karar:** Tüm ürünler sayfası ve her dal/seri sayfası Kart / Tablo / Seri üç görünüm alır, varsayılan Tablo (matris). İki kat: katalog geneli ORTAK sütunlar; her ürün grubu KENDİ sütunlarıyla kendi içinde matrislenir. Tüm ürünler sayfasının üstünde marka × kategori haritası. Aralık süzgeçleri ve tablo indirme (CSV/PDF) 15A-F4.
**Sütun seçim kuralı (OPS):** sütun, gruptaki ürünlerin ≥%60'ında doluysa matrise girer; %30–60 gizlenebilir ikincil; <%30 yalnız ürün sayfasında. Liste Design'a verilmeden önce canlı veriden ölçülür (docs/audits/matris-sutun-doluluk-2026-09-04.md).
**Design'a etkisi:** ekran 06 şablonuna Tablo görünümü eklenir; Tüm ürünler için ayrı ekran çizilmez.

## K14 — Arama sonucu sayfası (ekran 08) = liste şablonu + arama şeridi (Recep sordu, OPS hükmü, 2026-09-04 öğle)
* Arama sonucu ayrı sayfa değil: ekran 06 liste şablonu + aramaya özel üst şerit (sorgu, sonuç sayısı, bağlam çipi).
* 08b boş sonuç: "şunu mu demek istediniz", "süzgeçleri gevşetin", "Doğru fanı seçin" çıkışı.
* Tam model kodu eşleşmesi YALNIZ TEK ürüne denk geliyorsa doğrudan ürün sayfası; seri adı / çok varyant ise liste.
* Ürün dışı sonuç ızgaraya karışmaz: marka eşleşmesi üst şeritte tek çip; Bilgi Merkezi makaleleri bu fazda aramada yok (15A-F4).

## K15 — TASARIM ONAYI: Menü Tasarımı v13 + Ana Sayfa v7 = 15A-F1 kabuk referansı (Recep, 2026-09-04 akşamüstü)
* OPS ölçtü (18 ekran): geri-bildirim-3 madde 35–41 ve 47 uygulanmış; fiil tek, fiyat yalnız arşiv bloğunda, kiremit disiplini tutuyor. Recep: "sorun yok, tüm sayfalar var".
* Bu sürüm 15A-F1 (kabuk) ve 15A-F2 (ana sayfa/menü/adresler) uygulamasının referansıdır. (Sonra v15 / v9 geldi; 09-04 kararlarıyla güncel referans v15+v9.)
* Matris görünümü 15A-F3'te çizilir; çekmece (madde 34) F3 adayı.

## K — Recep kararları 2026-09-04 10:40 (OPS listesi, tek mesajla)
* EVET · Ana sayfa hızı (REC-59 Adım B/1): kiracı çözümü derleme anında sabit; `getTenantConfig` istek başlığı okumaz; çok kiracılı yetenek kodda kalır, kapalı.
* EVET · Ürün listesi sayfalama (REC-59 Adım B/2): 1. sayfa statik, `?page=N` ayrı dinamik yol, adres değişmez.
* EVET · REC-138: CI'ye gerçek Supabase SALT-OKUMA erişimi (anon key). Preview koruması/bypass ayarı ayrı Recep kapısı.
* EVET · REC-124: 31 satır katalog metin düzeltmesi canlıya betikle yazılır (yazıldı, kapandı).
* EVET · `.claude/settings.json` enabledPlugins (supabase) satırı depoya girer (#984 indi).
* BEKLİYOR · #981 (15A-F1c header paneli) merge: Recep sözü.
* BEKLİYOR · YENI_KABUK_GEZINMESI bayrağının açılması: önce Recep'e önizleme; ayrı karar.
* Araç kararları: claude-mem KURULMAZ; eski stdio Supabase MCP kaldırıldı, plugin tek; vercel eklentisi KAPALI, claude.ai Vercel MCP açık; frontend-design / coderabbit / claude-code-setup kapalı; gitmcp, markitdown, sequential-thinking, Three.js, Google Drive devre dışı.

## K16 — 15A-F1 kabuk önizlemesi (Recep, 2026-09-04 12:30)
* Parça parça koda alıp bayrak arkasında ilerleme yöntemi ONAYLI; görünüm Design fazında gelir.
* Mobil alt sekme çubuğu kod olarak kabul.
* Teklif: mobilde header'da Teklif yok, alt sekme paneli açar; masaüstünde header "Teklif (n)" + panel (K5).
* Dil seçici KALIR, yüzen/hareketli OLMAZ. OPS hükmü: masaüstü header sağ (arama · TR/EN · Teklif(n) · hesap); mobilde Hesap yaprağının en üstünde + yalnız dil uyuşmazlığında üst şeritte çip (16:50 kararı bu maddeyi günceller).
* Hesap sekmesi girişsizken ölü kapı değil: yaprak (dil · Giriş yapın · kilitli Tekliflerim/Projelerim).
* Design eksiği (Recep fark etti): giriş / hesap / Tekliflerim / Projelerim ekranları 15A'da çizilmedi → 15A-F4 Design kalemi.
* #981 merge: OPS'un 4 düzeltmesi sonrası yeni görsel, sonra Recep kararı.

## K — Design'ın erişim ve yazma sınırı (Recep, 2026-09-04 13:45)
* Design (15A projesi) GitHub'ı, canlı siteyi (Kernel tarayıcı), sitemap'i, Linear'ı ve Supabase'i OKUR (09-04 ölçüldü).
* YAZMAZ. Supabase'e yazma, Linear'a karar/iş/durum yazma, canlıda form/giriş/teklif gönderme YOK.
* Orkestratör OPS'tur; bir yazma gerekiyorsa yalnız OPS'un yönlendirmesiyle ve Recep kapısıyla olur. Her Design brief'inde "Erişim ve yazma kuralları" bloğu bulunur.
* Kalıcı hedef: Design'a salt-okuma yetkili ayrı Supabase bağlantısı (REC-140 ile birlikte).
* Gözden geçirme turu v1: çıktı yazılı bulgu, çizim yok; etiketli (AYKIRI / BOŞLUK / İYİLEŞTİRME), ≤ 40 bulgu.

## K — Mobil header: Hesap ve dil sağ üste (Recep eğilimi, 2026-09-04 14:00) → 16:50'de KARAR oldu
* Recep: mobilde sağ alttaki Hesap sekmesi header'ın sağ üstüne taşınır; dil seçimi de sağ üstte olur.
* Etkisi: K9 "üstte yalnız logo + arama" maddesi değişir; alt sekme çubuğu 5'ten 4'e iner. K16'daki "dil Hesap yaprağının üstünde" hükmü bununla yer değiştirir.
* Kod: #981 olduğu gibi kalır (bayrak kapalı); header düzeni Design çizip Recep onayladıktan sonra tek seferde kodlanır.
* OPS düzeltmesi (14:15): v13 mobil üst şeritte arama kutusu logonun ALTINDA ayrı satırdır; logonun sağı boş. Hesap simgesi + dil sığar. Dokunma hedefi ≥ 44 px.

## K — DESIGN şerit adı ve iletişim kanalı (Recep, 2026-09-04 14:50)
* Design bu sistemde bir şerittir, adı DESIGN. Linear yorumu imzası: `— DESIGN (model adı) YYYY-MM-DD`. OPS yorumları `— OPS`.
* Kanal: DESIGN → OPS otomatik (OPS gözcüsü Design projesindeki yeni/değişen dosyayı görür; DESIGN her çıktıyı DOSYA olarak yazar). OPS → DESIGN: brief projeye dosya olarak; tetik Recep.
* DESIGN okur: GitHub, canlı site, sitemap, Linear, Supabase (yalnız SELECT). Yazar: yalnız kendi projesindeki dosyalar + tur sonu tek Linear yorumu. Karar belgesine yazmaz.

## K17 — Cihaz/ürün seçiminin yeri: AYRI SEÇİCİ SAYFASI (Recep, 2026-09-04 15:30)
* Seçici tek sayfadır (koddaki dört hesaplayıcı yolu tek yola iner, eskiler 301). Diğer yüzeyler ona BAĞLANTI verir: ana sayfa düğmesi, senaryo sayfasında "Bu senaryo için fan seçin", teklif listesindeki "Hesapla". Ürün sayfasındaki katlı panel (K12) kalır; seçiciden gelen ziyaretçide dolu açılır.
* Sebep (Recep): seçimi her sayfaya gömmek yönetilebilirlik açısından ağır; tek motor, tek sayfa.

## K — Gözden geçirme v1 kararları (Recep, 2026-09-04 15:45)
* Ürün sayfası "aylık elektrik" kutusu: para birimi KALKAR; kWh/ay + güç payı % kalır.
* v11'den düşen "dönen fan animasyonu" ve "koyu mod": DÜŞTÜ.
* Mobil üst şerit: DESIGN iki hâli çizer; Recep seçer (16:50'de seçti); alt çubuk 4 sekme.
* **Teklif listesi adresi (Recep, 15:55): EKLE, KALDIRMA.** Teklif listesi yeni adres alır: `/tr/teklif-listesi` (EN `/en/quote-list`). Sepet kodu ve `/cart` adresi SİLİNMEZ; satış kipi açılınca kendi sayfası olarak geri gelir. O güne kadar `/cart` sitemap'ten çıkar ve teklif listesine yönlenir. Kod: 15A-F2 (URUN).

## K — "Ürün Seçici" kalıcı girişi (Recep, 2026-09-04 16:10)
* Seçici sayfasının kalıcı girişi "Ürün Seçici" (fan demez). Masaüstü header'da "Hesaplayıcılar" → "Ürün Seçici"; mobil Ürünler menüsü alt bölgesine satır; ana sayfa düğmesi aynı ad.

## K — Mobil üst şerit KARARI: 52b + akıllı dil çipi (Recep, 2026-09-04 16:50)
* Mobil üst şerit: logo satırında sağ üstte YALNIZ hesap simgesi; arama alt satırda tam genişlik; dil seçimi hesap yaprağının ilk satırı. Alt çubuk 4 sekme. K9 ve K16 böyle güncellendi.
* Akıllı dil çipi: tarayıcı dili sayfa diline uymuyorsa hesap simgesinin solunda çerçeveli "EN"/"TR" çipi belirir; dokununca aynı sayfanın diğer dili. Uyuşan ziyaretçi görmez. Kod: 15A-F3 (URUN).

## AÇIK — Ürün sayfasındaki hesap paneli (Recep, 2026-09-04 17:10) → akşam yol çizildi (K18)
* K12 (katlı panel) geçerli kalır; K17 ile birlikte yaşıyor. Panel kalsın mı sorusu: Recep canlı veri görmeden karar vermiyor; DESIGN'dan yazılı görüş istendi; kod sırası önce seçici, panel ikinci.

## K — "İletişim" sekmesi + ürün seçimi alternatif çalışması (Recep, 2026-09-04 18:30)
* Mobil alt çubuk sekmesi ve yaprak adı "İletişim" (Destek değil). Yaprak: WhatsApp ile yaz · Ara · E-posta gönder · [çerçeveli] Teknik destek iste. YZ asistanı ve kargo takibi teklif kipinde yok (satış kipinde kargo takibi gelir).
* Ürün sayfası paneli / seçici: üç alternatif (A tek sayfa seçici + bağlantı · B hafif panel · C rehberli) ayrı akış olarak çizilir; Recep yan yana görüp seçer. (Akşam: Recep "tek sayfa, grup grup, ürün sayfası en son" dedi = A; C kural tablosu sonrası; B çizilmez.)
* AFS mobil arayüzü esinlenme kaynağı: zorunlu içerik haritası DESIGN'a (madde 70).

## K18 (İSTİŞARE — KARAR DEĞİL; Recep "karar" deyince başlık düzelir) — Ürün Seçici: tek sayfa, grup grup, ürün sayfası en son
* Yol: (1) Seçici TEK SAYFADA yaşar; ürün sayfasında hesaplama YOK. (2) Motorlar ürün grubuna göre PEYDERPEY eklenir; ilk grup kanal fanı (mevcut motor, 6 mahal, ASHRAE 62.2 / EN 16798-1 atıflı). (3) Ürün sayfasına entegrasyon EN SON.
* OPS eklemesi (hüküm, geri alınabilir; Recep'le istişarede): motoru OLAN grubun ürünlerinde tek satır bağlantı ilk günden durur. Recep'in eğilimi: ilk aşamada ürün sayfasına hiç dokunmamak.
* Veri kuralı (K18a): sonuç kartında yazan her sayı `technical_specs`'ten gelir; eğrisi/verisi olmayan ürün "değerlendirilemedi" hükmüyle görünür, gizlenmez, "uymaz" denmez. Eğri doldurma (295 fanın 145'inde var) katalog veri işi.
* Örnek/ölçüm: Design v1 örneği (laboratuvar) motorda yok, kart sayıları uydurmaydı → geri-bildirim-8 ile düzeltme istendi. Logolar: ana sayfa marka bloğu kalır; footer'dan marka logoları kalkar. Çerez şeridi çizilmez (canlıda var).
