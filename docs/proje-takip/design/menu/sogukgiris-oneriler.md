
# Soğuk giriş önerileri — DESIGN, 2026-09-04 (madde 67)

Kapsam: arama motorundan bağlamsız düşen ziyaretçi. Çizim yok. Kararlara aykırı öneri açıkça işaretli.
Ölçüm notu: site analitiği bugün kapalı; Vercel Web Analytics Hobby (50.000 olay/ay, 30 gün geçmiş, özel olay yok)
açılırsa aşağıdaki sayıların çoğu sayfa/yol düzeyinde okunur; özel olay gerektirenler ayrıca işaretli.

## (a) Ürün sayfasındaki katlı hesap paneli — kalsın mı?

**Seçenek 1 · Panel kalsın (K12 bugünkü hâl).**
ETKİ: kararsız ziyaretçi sayfadan çıkmadan "yeter mi" sorusuna cevap alır; mühendis çağrı satırını görmezden gelir, tablo ilk ekranda. Ürün sayfası tek başına iş görür — soğuk girişte en değerli özellik bu.
BEDEL: kod tarafında panel her ürün sayfasında yüklenir (modül ağır); tasarım tarafında bedel yok, çizili.
ÖLÇME: çağrı satırı tıklama oranı (panel açılma / ürün sayfası görüntüleme). Özel olay gerekir. Eşik: <%3 ise panel çoğu ziyaretçi için görünmez demek, seçenek 2'ye geçilir.

**Seçenek 2 · Bağlantı + dönüşte sonuç şeridi.**
Çağrı satırı yerine "Bu fan mahalinize yeter mi? → Ürün Seçici" bağlantısı; seçiciden dönen ziyaretçi ürün sayfasını üstte ince sonuç şeridiyle görür ("Kimya laboratuvarı · 90 m² · YETER, %77 devirde").
ETKİ: ürün sayfası hafifler; hesap tek yerde (K17 "tek motor, tek sayfa" ile uyumlu). Ama ziyaretçi sayfadan ayrılır; soğuk girişte ayrılan ziyaretçinin bir kısmı geri gelmez.
BEDEL: 07d yeniden çizilir (şerit hâli), 07/07b açık hâl artboard'ları arşive iner; kod: seçici ↔ ürün arası durum taşıma (`?hesap=1` zaten var).
ÖLÇME: seçiciye gidiş / ürün sayfasına dönüş oranı (yol düzeyi, özel olay gerekmez). Eşik: dönüş <%50 ise ziyaretçi kaybediliyor demek.

**Seçenek 3 · Üçüncü yol — panel kalır, ama "hafif" açılır.**
Çağrı satırına dokununca tam modül değil, üç girdi (mekân · alan · yükseklik) + tek hüküm satırı açılır; "ayrıntılı hesap" bağlantısı seçiciye götürür. Modülün tamamı yalnız seçiciden gelen dolu hâlde (07d) görünür.
ETKİ: soğuk ziyaretçi 10 saniyede hüküm alır, sayfadan çıkmaz; ayrıntı isteyen tek tıkla seçiciye gider.
BEDEL: 07 açık hâl için "hafif panel" karesi (1 artboard); kod: modülün ilk üç adımı ayrı bileşen olur (zaten sıralı).
ÖLÇME: hafif panel açılma oranı + "ayrıntılı hesap" tıklaması. Özel olay gerekir.

**Öneri: Seçenek 3.** Gerekçe: K12'nin sebebi ("mühendis tabloyu ister, modül kararsız içindir") duruyor; soğuk girişte kararsız ziyaretçinin sayfadan ayrılması riski seçenek 2'yi zayıflatıyor; seçenek 1'in bedeli ise her ürün sayfasına tam modül yükü. Hafif panel ikisinin ortası. K12 ile çelişmez (panel katlı, aynı yerde açılır), K17 ile uyumlu (tam hesap seçicide). Karar için canlı sayı: panel açılma oranı — Hobby analitikte özel olay yok; ilk ay yol düzeyinde "ürün sayfası → seçici" geçişi ölçülür, özel olay Pro'da ya da kendi kayıt satırıyla.

## (b) Bağlamsız düşen ziyaretçi — ilk 5 saniye

Soru üç: neredeyim, ne seçebilirim, kime sorabilirim.

1. **Breadcrumb ilk ekranda ve tıklanır; kategori adı kısa slug'la aynı.** "Anasayfa / Fanlar / Korozyon Dayanımlı / SEAT 30" — ziyaretçi bir üst düzeye tek dokunuşla çıkar. ETKİ: "neredeyim" 1 saniyede. BEDEL: yok, çizili; mobilde breadcrumb yalnız iki üst düzey (07c mobil böyle). Karar uyumu: K3.

2. **Kimlik bloğunda "kullanım alanları" çipleri senaryo sayfasına gider.** SEAT 30'da "Kimya laboratuvarı · Galvaniz · İlaç/kimya" çipleri var (07/07c). ETKİ: "bu ürün benim işim için mi" sorusu okunarak cevaplanır; çip senaryo sayfasına (09) götürür, oradan Ürün Seçici. BEDEL: yok, çizili; altyazıya "çip 09'a gider" yazılır. Uyum: K4 (8 senaryo).

3. **Seri kardeşleri şeridi ilk ekranın altına değil, teknik tablonun hemen altına.** Bugün 07c'de "SEAT serisindeki diğer modeller" sayfanın sonunda. Soğuk gelen ziyaretçi çoğu zaman yanlış boydadır (SEAT 30 yerine 35 gerekir); kardeşleri görmesi "ne seçebilirim" sorusunun cevabı. ETKİ: yanlış modele düşen ziyaretçi doğru modele 1 kaydırmada. BEDEL: 07c/07e'de şerit yukarı taşınır (1 artboard değişikliği). Uyum: K7, K9.

4. **Dal sayfasına düşen için: süzgeç sütununun üstünde "n model · şu an süzgeç yok" satırı + ilk süzgeç önerisi.** Ekran 06'da süzgeçler açık ama boş; ziyaretçi 34 kartla karşılaşır. Öneri: şeritte "Debi aralığı seçin" gibi tek soru çipi (en çok kullanılan faset). ETKİ: "ne seçebilirim" 34 karttan 1 soruya iner. BEDEL: 06 şeridine tek satır; hangi fasetin öne çıkacağı dala göre veri işi (K13 doluluk ölçümüyle aynı kaynak). **K9'a sınırda:** şeride bir öğe ekler; ≤9 sayımı 06 mobilde kontrol edilmeli.

5. **Arama sonucuna düşen için: sorgu şeritte kalır, "şunu mu demek istediniz" boş sonuçta değil dolu sonuçta da.** Google "seat 30 fan" ile 08'e düşen ziyaretçi tek ürün görmeli — K14 zaten "tam kod tek ürüne denk gelirse doğrudan ürün sayfası" der; eksik olan yaklaşık eşleşme ("seat30", "seat 30pp"). ETKİ: kod yazan ziyaretçi ara sayfa görmez. BEDEL: kod, normalizasyon kuralı; tasarımda değişiklik yok. Uyum: K14.

6. **"Kime sorabilirim" her sayfada aynı yerde: masaüstünde header "İletişim", mobilde alt çubuk — ve ürün sayfasında bağlam taşır.** Ürün sayfasından açılan İletişim yaprağı ürün kodunu mesajın içine koyar (madde 68 karesi). ETKİ: soğuk ziyaretçi "bu ürün için birine yazmak istiyorum" adımını 2 dokunuşta bitirir; satış tarafı bağlamı hazır alır. BEDEL: kod, mesaj şablonu; tasarım çizili. Uyum: K5 (kiremit yok, çerçeveli "Teknik destek iste").

**Karar dışı not (işaretli):** "Sayfanın üstüne 'Bu sayfaya arama motorundan geldiniz — kategoriye gidin' gibi bir şerit" önerisini bilerek yazmıyorum; K9 sadeliğine ve K1 "vitrin yalnız var olanı gösterir" ruhuna aykırı, breadcrumb aynı işi yapıyor.

**Ölçme özeti (Vercel Hobby ile bugün okunabilenler):** ürün sayfasına doğrudan giriş oranı (referrer), ürün → kategori/seri geçişi, ürün → seçici → ürün dönüşü, tek sayfa çıkış oranı ürün sayfalarında. Okunamayan: panel açılma, çip tıklaması, İletişim yaprağı açılma — özel olay ister.

