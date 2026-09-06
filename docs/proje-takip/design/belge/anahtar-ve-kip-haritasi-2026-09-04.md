
# Linear dışa aktarımı — Anahtar ve Kip Haritası + Kararlar 2026-09-04 ekleri + iş kayıtları anlık görüntüsü

Kaynak: Linear "receps-workspace" (2026-09-04 akşam). Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri için kopyadır.
Projeler: Vitrin 15A Yeniden Tasarım · Katalog ve Ürün Verisi · Altyapı, Kapılar ve Belge Hattı · Teklif Akışı ve Müşteri Paneli · SEO ve Yayın.

## A. Kararlar — Vitrin 15A: 2026-09-04 ekleri (K1–K16 ayrı dosyada)

- **K1a · Doğru okunuş (Recep, 09-04 akşam):** "YOK" değil, KAPALI. Site iki kipli tek sitedir: teklif kipi açık; satış kipi (sepet · ödeme · sipariş · fatura · iade · kargo · mesafeli satış/iade metinleri) kodda var, tek anahtarla kapalı, şirket kurulunca AÇILIR. Satış kipi ekranları yeni tasarım diline ŞİMDİ çizilir ve kabukla birlikte kodlanır; şirket açılış günü yeni tur değil, anahtar. Hiçbir brief/belge "K1 gereği yok" yazmaz.
- **K · Cihaz/ürün seçiminin yeri: AYRI SEÇİCİ SAYFASI (15:30).** Tek sayfa; diğer yüzeyler bağlantı verir.
- **K · Gözden geçirme v1 kararları (15:45):** ₺ kalkar (kWh/ay kalır); animasyon ve koyu mod düştü; teklif listesi adresi EKLE `/tr/teklif-listesi`, `/cart` silinmez, satış kipinde geri gelir.
- **K · "Ürün Seçici" kalıcı girişi (16:10):** menüde "Hesaplayıcılar" → "Ürün Seçici".
- **K · Mobil üst şerit (16:50):** logo satırında sağ üstte yalnız hesap simgesi; arama alt satırda; alt çubuk 4 sekme; akıllı dil çipi yalnız dil uyuşmazlığında belirir.
- **K · "İletişim" sekmesi (18:30):** sekme ve yaprak adı "İletişim"; yaprak: WhatsApp · Ara · E-posta · Teknik destek iste. Ürün seçimi için A/B/C alternatif çalışması istendi.
- **AÇIK → çözüm yolu:** Ürün sayfası paneli. Recep (akşam): seçici TEK SAYFADA, motorlar ürün grubuna göre PEYDERPEY (ilk kanal fanı), ürün sayfasına entegrasyon EN SON. = Design'ın A akışı; C (rehberli sorular) kural tablosu sonrası; B (hafif panel) çizilmez. (K18 başlığı istişare olarak duruyor; Recep "karar" deyince kesinleşir.)
- **Logolar:** ana sayfa marka bloğu kalır; footer'dan marka logoları kalkar, "Markalar" metin bağlantısı yeter (Recep + Design + OPS).
- **Çerez şeridi:** çizilmez; canlıda çerez onayı bileşeni zaten var, Vercel Web Analytics çerezsiz.
- **Design erişimi (13:45):** GitHub, canlı site, sitemap, Linear, Supabase OKUR; YAZMAZ. Şerit adı DESIGN, imza `— DESIGN (model) tarih`.

## B. Anahtar ve Kip Haritası — aç/kapa envanteri (Linear belgesi, 09-04)

Niçin: "Lego gibi modüler, aç/kapa dedik; Linear'da bir sürü kayıt var, ayrı ayrı mı işleyecek?" Hayır. Her yetenek kodda bir ANAHTAR arkasında; bu tablo anahtarların tek listesi. Şirket açıldığı gün ya da kiracı eklendiği gün iş = listeyi işaretlemek.

| Yetenek | Anahtar | Bugün | Ne açar | Tasarım | Açılış / sahibi |
|---|---|---|---|---|---|
| Satış kipi (ödeme) | `NEXT_PUBLIC_ODEME_ACIK` | KAPALI | sepet · ödeme · sipariş · fatura · iade · kargo | ÇİZİLECEK (satış kipi turu) | Şirket kuruluşu / Recep |
| Teklif kipi (fiyat gizli) | `hide_price` (veri) | AÇIK | fiyat gizli, teklif akışı | v15 çizili | satış kipiyle kapanır |
| Yeni kabuk gezinmesi | `YENI_KABUK_GEZINMESI` (#981) | KAPALI | yeni header, Teklif paneli, yapraklar | v15 çizili | Faz 2 sonu, Recep önizleme |
| Mobil alt sekme çubuğu | `MOBIL_ALT_SEKME_CUBUGU` | KAPALI | 4 sekme | 52b çizili | yeni kabukla tek seferde |
| 3D ürün görünümü | `UC_BOYUT_MUSTERI_YUZEYINDE` | KAPALI | ürün sayfasında 3D | yeni tasarımda yok | ayrı karar |
| Sepet sunucu eşitleme | `NEXT_PUBLIC_CART_SERVER_SYNC` | ölçülecek | sepetin hesapla eşlenmesi | — | satış kipiyle |
| Çok kiracılı (SaaS) | `tenantResolver` (derleme anında sabit) | PARK (REC-88) | kiracıya göre tema/katalog/alan adı, kiracı ekle-çıkar (admin) | ÇİZİLMEDİ | önce kendi şirket; Recep |
| Ürün Seçici motorları | grup başına motor (kanal fanı VAR) | kanal fanı | seçici grup sekmeleri | A çizildi | grup grup, Recep kural tablosu |
| Analitik | `@vercel/analytics` + GA | AÇIK | yol düzeyi ölçüm | — | — |

Şirket açılış günü kontrol listesi: satış kipi ekranları çizildi+kodlandı · yasal metinler (mesafeli satış, ön bilgilendirme, iptal/iade) · İyzico canlı anahtarları + webhook (Recep kapısı) · `hide_price` kapat, `ODEME_ACIK` aç, tek yayın · hesap alanı satış hâli · sitemap'e satış sayfaları · admin sipariş/fatura/iade ekranları yeniden ölçülür.
Çok kiracılı açılış listesi (park): kiracı ekle/çıkar (admin), kiracıya göre tema ve ana sayfa blokları, alan adı eşlemesi, tenant-scoped RLS (kural 12), cache anahtarlarında tenantId.

## C. İş kayıtları anlık görüntüsü (100 kayıt, updatedAt sırası; devamı Linear'da)

| Kayıt | Durum | Proje | Başlık |
|---|---|---|---|
| REC-124 | In Progress→Done (09-04) | Katalog | Katalog veri kusurları paketi (31 satır canlıya yazıldı) |
| REC-138 | In Progress→Done (#985) | Altyapı | SSR duman kilidi PR kapısı, gerçek Supabase okuma |
| REC-140 | Backlog | Altyapı | anon rolü tablo düzeyi yazma GRANT'ları REVOKE (migration, Recep kapısı; ertelendi) |
| REC-132 | In Progress | Altyapı | Üretilmiş toplamalar özellik PR'larında yol almasın |
| REC-134 | In Progress→Done (#982) | Altyapı | SSR boş-kabuk kilidi CI'da koşmuyordu |
| REC-102 | In Progress | Altyapı | Orion companion üreteci 3 kalem |
| REC-139 | Backlog | Katalog | Katalog metin hijyeni ingest kapısı |
| REC-59 | In Progress | Vitrin 15A | SSG/ISR Dalga-2: 4 ana rota statik + SSR kapısı (Adım B: kiracı sabit + sayfalama) |
| REC-130 | In Progress | Altyapı | Ölçüm komutları çalışma dizinini beyan eder (CWD kayması) |
| REC-137 | Backlog | Altyapı | İlan edilmemiş kaynak hiçbir kapının evreninde değil |
| REC-136 | In Progress | Katalog | Katalog sayımı tek kaynak betik |
| REC-135 | In Progress | Katalog | Kategori ağacı boşlukları (10 dalsız ürün + 7 boş dal) |
| REC-60 | Todo | Katalog | Kapsama: ~210 eksik kod + sürekli sayım kapısı |
| REC-129 | In Progress | Vitrin 15A | PROGRAM: kimlik + vitrin yeniden tasarımı, fazlı üretim |
| REC-56 | In Progress | Katalog | Ürün-katalog hattı — içerik/derinlik işleri açık |
| REC-131 | In Progress | Altyapı | Merge ritüeli betiği depoya (5 ölçüm) |
| REC-133 | Backlog | Altyapı | Ölü anahtar kapısı: devredilen sözlük alt ağacı |
| REC-121 | Todo | Altyapı | Tip-drift kapısı (database.types.ts) |
| REC-120 | In Progress | Altyapı | INV-CETVEL-YAPI iki kapsam kusuru |
| REC-75 | In Progress | Teklif Akışı | ERP & Admin açık işleri |
| REC-55 | Todo | Teklif Akışı | Satınalma modülü v1 tamam, v2 açık |
| REC-49 | Backlog | Teklif Akışı | Admin UX elden geçirme, kalan fazlar |
| REC-73 | Todo | Teklif Akışı | Ödeme & Finans açık işleri |
| REC-47 | Todo | Teklif Akışı | Kargo ücreti: sepet+checkout sabit "Ücretsiz" (SATIŞ KİPİ) |
| REC-48 | Todo | Teklif Akışı | Fatura belgesi üretilmiyor, e-arşiv (SATIŞ KİPİ) |
| REC-57 | Todo (Urgent) | Teklif Akışı | LANSMAN ENGELİ: iyzico-refund müşteri self-iadesi (SATIŞ KİPİ) |
| REC-88 | Todo | Teklif Akışı | Açık kaynak CRM/ERP taraması, karar bekliyor; SaaS Faz 2 PARK kararı da burada (08-28) |
| REC-62 | Todo | Teklif Akışı | ERP çalışma alanı + CRM nesne katmanı, cetveller yazılı, kod sıfır |
| REC-45 | Backlog | Teklif Akışı | Teklif→Sipariş dönüşüm köprüsü |
| REC-46 | Backlog | Teklif Akışı | Bayi segment-atama ekranı |
| REC-128 | Todo | Vitrin 15A | Ana sayfa dinamik render sebebi ölçülecek |
| REC-77 | Todo | Teklif Akışı | applicationEmail + kepAddress yer tutucu |
| REC-43 | Todo | Teklif Akışı | KVKK hesap silme + veri sahibi talep akışı |
| REC-117 | Todo | Teklif Akışı | Misafir teklif akışı (anon INSERT/RLS = migration) |
| REC-126 | Todo | Altyapı | Jules önerileri fikir kaydı |
| REC-107 | Backlog | Altyapı | Hijyen: 36 worktree + 83 stash |
| REC-76 | In Progress | Altyapı | Altyapı & Araç açık işleri |
| REC-86 | In Progress | Altyapı | Ajan hafıza sistemi (PreCompact kapısı) |
| REC-82 | Backlog | Altyapı | Pano v2 adresli görünürlük |
| REC-70/71/78 | Todo | Altyapı | T019 zaman aşımı bütçesi · T018 köprü açıklığı · sayaç üçlüsü |
| REC-64 | Todo | Altyapı | İkiz taraması: 20 aday eksik |
| REC-67 | In Progress | Altyapı | Companion üreteci taşıyıcısı (Haiku) |
| REC-69 / REC-84 | In Progress | Altyapı | Üretilen belge tazelik kapıları · Belge tazeleme (companion + master + NLM ikizi) |
| REC-74 | In Progress | Altyapı | Güvenlik açık işleri |
| REC-51 | Todo | Altyapı | Supabase leaked password protection AÇ (Recep, panel) |
| REC-52 | Todo | Altyapı | webhook secret rotasyonu (repo PUBLIC) |
| REC-58 | Todo (Urgent) | Altyapı | Onaysız tehlikeli butonlar: tekil iade + rol değişikliği |
| REC-118 | Todo | Altyapı | PR #640 bilinçli kırmızı, parkta |
| REC-119 | Todo | Altyapı | Ölü kod temizliği (knip + CodeGraph) |
| REC-50 | Todo | SEO | venthub.com.tr DNS + kanonik SITE_URL (canlıda tamam; kayıt kapanmalı) |
| REC-127 | In Progress | SEO | Bing kökü: / → /tr kalıcı yönlendirme + x-default |
| REC-96 / REC-91 / REC-44 | Backlog/Todo | Katalog | depo adresi tek kaynak · görsel hattı ön-üretilmiş boyutlar · ürün görseli 35 kaldı |
| REC-122 / REC-109 | Todo | Katalog | EN marka şeridi kusuru · 16 ailenin EN adı eksik |
| REC-116 | Todo | Vitrin 15A | Kayıt sayfası revizyonu (Google ile kayıt) |
| REC-125 | Todo | Vitrin 15A | Hardcoded TR literal → sözlük (4 görünüm) |
| REC-89 | In Progress | Vitrin 15A | Mobil vitrin kusurları (hero metin, PDP binişme) |
| REC-123 | Todo | Vitrin 15A | Arama/filtre eşleşmesi ham TR ad |
| REC-72 | In Progress | Vitrin 15A | Vitrin & Ürün açık işleri |
| REC-61 | Todo | Vitrin 15A | Sayfa görselleri Gemini üretim hattı |
| REC-99 | Backlog | Vitrin 15A | Sayfa iki aşamada yükleniyor |
| Done (09-03/04) | — | — | REC-110, 101, 40, 36, 112, 54, 42, 53, 63, 38, 35, 34, 37, 87, 83, 41, 66, 68, 111, 90, 100, 39, 104, 114, 98, 115, 113, 108, 103, 85, 81, 79, 80 |

Açık PR'lar (09-04 akşam): #981 Faz 1c header paneli (bayrak kapalı; Recep sözü bekler). Bugün inen: #977 #982 #983 #984 #985 #986 #987 #988 #989 #990.

— OPS 2026-09-04

