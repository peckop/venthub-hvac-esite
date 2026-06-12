# VentHub — Vizyon & Ticari Niyet

> **Not:** Bu dosya kurucunun **vizyonunu ve ticari niyetini** kaydeder (11 Haziran 2026'da
> sözlü anlatımdan derlendi). Burada yazılanlar **hedef/niyet**tir — *gerçekte kurulu olan*
> değil. Ticari hazırlık ("umut var mı") ayrıca, **kod tabanının gerçek durumuna** (CodeGraph)
> karşı değerlendirilir; vizyon yön verir, kanıt sayılmaz. Verdict için → bu dosyanın sonu / `RECOMMENDATIONS.md`.

## 1. Kurucu & Sektör Otoritesi (asıl varlık)

- **14 yıllık HVAC / hava arıtma mühendisi** — tamamı filtrasyon/havalandırma üzerine:
  endüstriyel mutfaklar, oteller, AVM'ler, restoranlar.
- Filtre teknolojileri: **elektrostatik (ESP)**, aktif karbon, UV, ozon, plazma, mekanik gruplar.
- **2014–2016 TÜBİTAK projesi:** Türkiye'de elektrostatik filtrenin millileştirilmesini yürüttü — başarılı.
- **Otomatik kendini-temizleyen ESP tasarımı kurucuya ait** (know-how/fikri sermaye).
- Eski firmasından ~1 yıldır bağımsız; VentHub'ı kendi girişimi olarak kuruyor.
- **Tez:** VentHub'ın asıl farklılaştırıcısı yazılım değil, kurucunun sektör otoritesi + mühendislik bilgisi.

## 2. Ürün Vizyonu

### 2.0 Ürün Özü: Dünya-standardı **modüler ticaret platformu** (HVAC = beachhead)

> **Reframe (11 Haziran 2026):** Ürünün özü "bir HVAC sitesi" değil — **dünya standardında ticaret
> altyapısı**. "İster HVAC ister buğday, konu **ticaret**." HVAC bu altyapının **giriş pazarı**
> (beachhead): kurucunun domain'i + yazılımda en geri kalmış, en az hizmet alan dikey.

- **Çekirdek = kapsamlı ama MODÜLER ticaret platformu** (katalog, fiyat, sepet, sipariş, stok, B2B hesap,
  teklif/CPQ, ödeme...). 3D vitrin, LLM danışman ve mühendislik araçları (§2.1–2.3) bu çekirdeğin üstündeki
  **farklılaştırıcı katmanlardır** — çekirdeğin kendisi değil.
- **Neden ürün? (ihtiyaç):** Hedef pazar — Türkiye'deki orta/küçük HVAC firmaları — yazılımda **Excel
  seviyesinde**: teklifler Excel'den hazırlanıp gönderiliyor, stok takibi Excel'le (bazen o bile yok). Kendi
  IT altyapıları yok; sektörü bilmeyen yazılımcılar da belirli seviyenin üstüne çıkamıyor. Bu boşluğu dolduran
  bir ürün **yok**.
- **Amaç (ürün hedefi):** Bu pazara, hiç sahip olmadığı **dünya-standardı ticaret altyapısını**, sektörü
  gerçekten anlayan biri eliyle ve **modüler** biçimde (her firma ihtiyacına göre modül açar) getirmek.

### 2.1 3D Ürün Konsepti (görsel etki)
- Türkiye'de **3D ürün konseptli HVAC sitesi bilinmiyor** (kurucunun bilgisi dahilinde) — fark yaratma iddiası.
- Hedefler: ürünü çevirip inceleme; **"deneme" deneyimi** — devir arttıkça **dinamik basınç–debi ilişkisi**,
  **fan sesi simülasyonu** (gerçeğe yakın işitsel), **sanal montaj**.

### 2.2 LLM Danışman (kurucuya göre en büyük etki)
- Site içi **sohbet LLM** + **ürün seçici / önerici / danışmanlık** hizmeti.
- Kurucu, bu katmanın 3D'den bile daha büyük etki yapacağına inanıyor.

### 2.3 Sektöre Özel Mühendislik Araçları (IP avantajı)
- ESP/filtre **seçim kriterlerine göre ürün seçimi**.
- **DW172**'ye göre mutfak havalandırma hesapları.
- Muhtemel ileri hedef: kendi sunucusunda **CFD analizleri** (pişirme ekipmanı ısıl yükleri,
  taze hava/egzoz dengelemesi). — *Yüksek kapsam/efor riski; v1 dışı aday.*

### 2.4 Modüler Mimari (composable commerce → modüler monolit)

- Dünya-standardı adı **Composable Commerce / MACH**. Tek geliştirici için tam mikroservis fazla yük; doğru
  yorum **modüler monolit** — tek kod tabanı/dağıtım, ama içeride **katı modül sınırları + temiz kontratlar**
  ("tasarımda composable, dağıtımda monolit"). Headless/API-öncelikli ilkeler şimdi; mikroservis ileride gerekirse.
- **Kazanç:** her modül tek tek geliştirilebilir VE ileride tek tek **SaaS olarak satılabilir** → çok-kiracı köprüsü.
- **Modül haritası (platform iskeleti):** Katalog/PIM · Arama · CMS · Fiyat · Promosyon · Sepet · Checkout ·
  **Teklif/CPQ** · Sipariş (OMS) · Stok · Kargo · İade · Hesaplar · **B2B Şirket** · **Bayi** · Ödeme · Vergi ·
  Bildirim · Analitik · Çok-kiracı. *(Mühendislik foundation'ı: `docs/standards/admin-standard.md` = her
  modülün admin'i NASIL kurulur; `dealer-network-standard.md` = B2B/Bayi domain standardı.)*

### 2.5 B2B Bayi-Ağı Modülü (farklılaştırıcının kalbi)

Hedef pazarın asıl derdi: bayi/distribütör ağ yönetimi mail/Excel'de, şeffaflıktan uzak. Dünya-standardı
çözüm (PRM + B2B commerce) bu platforma gömülünce kopyalanması zor bir değer doğar:

- **Bayi ≠ kullanıcı** — şirket hesabı + çok kullanıcı + roller + hiyerarşi.
- **Bayiye özel fiyat listesi** + cari/limit + **teklif → sipariş (CPQ)** hattı.
- **Deal Registration:** bayi bir işi/projeyi *kaydeder*, sistem sahipliği mühürler; çakışma ("bayilerin
  birbirine girmesi") otomatik tespit edilir → **şeffaflık + ölçülebilirlik**. (Kanal yönetiminin kanıtlanmış
  mekanizması; e-ticarete + HVAC'a gömülü hâli nadir.)
- **Ortak proje havuzu** — mekanik/proje firmaları aynı havuzda; adil alacaklandırma (split).

> **Dürüst durum (vizyon ≠ kurulu):** Kodda **tohumlar var** (`priceListId` + `getEffectiveUnitPrice` =
> bayiye-özel fiyat; `user_projects` = proje/BOM + "teklif iste"; fatura profilleri = B2B faturalama).
> **Bayi katmanının kendisi (org/tier/deal-registration/pipeline) henüz kurulmadı.** Yani: temel atılmış, kat çıkılacak.

## 3. Pazar Bağlamı & Sinyaller

- **Avensair** (Vortice TR distribütörü, kurucunun arkadaşı; kurucu onun bayisi):
  Kurucunun sitesi Avensair'inkini amatör gösterecek seviyede. Arkadaşı **"yap bana sat o zaman"**
  dedi → gerçek bir **gelen-talep (inbound) sinyali**.
- Kurucunun çevresinde görüşebileceği **küçük ve orta ölçekli firmalar** var.
- Site **e-ticaret tarafı olmadan da** (kurumsal/platform sitesi olarak) satılabilir.
- Olası iş modelleri: (a) tek-seferlik **site satışı**, (b) **kiralama/SaaS** (recurring),
  (c) kendi markasıyla **dikey e-ticaret**.

### 3.1 Pazar Boşluğu (araştırmayla doğrulandı, 11 Haziran 2026)

- **"Herkeste *selection* var, hiç kimsede *commerce* yok."** HVAC liderleri (Systemair, Daikin, Grundfos,
  Belimo, Trox) spec-driven seçim + CAD/BIM araçlarına sahip — ama seçimi **işleme** (teklif→sipariş)
  bağlamıyor; çoğu "BOM oluştur / temsilciyle görüş" çıkmazında. Yalnızca Belimo/Grundfos seçimi gerçekten
  siparişe bağlamış. Üretici seviyesinde gerçek bayi portalı **yok** (gerçek B2B ticaret distribütörlerde — Watsco).
- HVAC dağıtım satışının yalnızca **~%7,9'u** e-ticaretten geçiyor (Watsco istisna: 51.000+ yüklenici).
- **Whitespace = VentHub'ın hedefi:** entegre, web/mobil, çok-kiracılı, **bayiye-özel fiyatlı
  seçim→teklif→sipariş hattı** — uçtan uca **tek lider bile** kurmamış. Kurucunun domain anlayışı, sektörü
  bilmeyen yazılımcının kuramadığı **seçim+ticaret köprüsünü** kurmaya izin veriyor. Asıl, kopyalanamaz fark budur.

## 4. Bilinen Riskler (kurucunun kendi tespiti)

- **Mükemmeliyetçilik:** "İçine sinmeden" yayınlayamama; aylarca tek konuya gömülme.
- **Kapsam genişlemesi (scope creep):** CFD, ses simülasyonu, sanal montaj → bitmez kuyu riski.
- **3D bağımlılığı:** Kurucu "3D'yi çözmeden satışa geçmeme" eğiliminde — bu inancın kendisi
  bir ship tuzağı olabilir (analizde sorgulanıyor).
- **Solo bant genişliği:** Tüm yük tek kişide.

## 5. Gerçek Durum — Vizyon vs. Kurulu Kod (CodeGraph kanıtı, 2026-06-11)

> Çok-ajanlı analiz (4 perspektif + sentez). Verdict **kurulu koda** dayanır, vizyona değil.

| Vizyon özelliği | Durum | Kanıt |
|---|---|---|
| 3D ürünü çevirme/inceleme | **[VAR]** | 36 dosya, 30+ prosedürel model, `Product3DViewer` + `ModelRotator`, OrbitControls/Gizmo, gerçek `useFrame` animasyon |
| 3D parça patlatma/izolasyon | **[VAR]** | `FanRenderer`: `explode`, `isolatedPart`, `onPartClick` |
| Görsel hava akışı animasyonu | **[KISMEN]** | `AirCurtainModel` 28-dilim akış sim.; pervane spin |
| E-ticaret/admin/ödeme çekirdeği | **[OLGUN]** | ~27 üretim Edge Function (İyzico, sipariş, kargo/iade), RBAC, audit log |
| 4 HVAC hesaplayıcı (Duct/JetFan/AirCurtain/HRV) | **[VAR ama TESTSİZ]** | `hvacCalculations.ts` 629 satır gerçek motor; **"no covering tests found"** |
| Dinamik basınç-debi / fan sesi / sanal montaj | **[YOK]** | 3D'de eğri yok, Web Audio yok, sahne/AR yok |
| LLM danışman / ürün seçici | **[YOK]** | `chat`/`recommend` 0 eşleşme |
| **ESP/filtre seçim aracı** (asıl IP!) | **[YOK]** | hvacCalculations'ta ESP/filtre fonksiyonu yok |
| DW172 mutfak havalandırma | **[YOK]** | `DW172\|mutfak\|davlumbaz` 0 eşleşme |
| CFD analizleri | **[YOK]** | İz yok — aylar + altyapı maliyeti, kapsam tuzağı |
| Çoklu-kiracı veri izolasyonu | **[STUB/SAHTE]** | `tenantResolver.ts:44-47` hep `DEFAULT_TENANT_ID`; `tenant_id` ~28 tabloda **0 kez** → izolasyon yok, sadece tema/feature kabuğu |

## 6. VERDICT: **Koşullu var.**

Bugün **satılabilir** bir varlık var: olgun e-ticaret/kurumsal platform + Türkiye'de eşi görülmemiş
etkileşimli 3D vitrin + 4 çalışan hesaplayıcı + **parayla satın alınamayan 14 yıllık ESP/filtrasyon
otoritesi** + Avensair inbound sinyali. Bu kesişim nadir (çoğu yazılımcının sektör güveni yok, çoğu
HVAC uzmanının yazılımı yok). **Koşul:** umut teknik mükemmellikten değil, **teslim etmekten** gelir.
Gerçek risk pazar/rakip/kod değil — **bitirip teslim edememe** (mükemmeliyetçilik × scope creep).
İlk ödeyen müşteriyi 90 günde kapatırsan → var. Kapatamazsan → hobi projesi olarak ölür.

## 7. ODAK KARARI: Önce **ESP/DW172 seçim motoru** (IP'nin koda dökülmüş hali)

3D zaten kazanılmış (yeni efor verme). Generic LLM kopyalanır. **Tek kopyalanamaz moat'ın: ESP/DW172
seçim mantığı** — formüller standart, calc UI kiti kurulu, bilgi kafanda (1-2 hafta). Bu hem tek başına
satılabilir mühendislik aracı, hem LLM danışmanın kopyalanamaz beslemesi. Sıra: **IP aracı → LLM danışman
(IP'yle besli) → 3D minimal vitrin.** CFD/ses/montaj: ödeyen müşteri isteyene kadar **tek satır kod yok**.

> **Köprü farkı (§3.1 ile bağ):** ESP/DW172 seçim mantığı tek başına değerli; ama asıl kopyalanamaz olan,
> onu **doğrudan teklife/siparişe ve bayiye-özel fiyata** bağlayan hat — *seçim → commerce köprüsü*. Liderler
> bile bunu uçtan uca kuramamış. Moat = IP (seçim) **×** dünya-standardı ticaret altyapısı (modüler platform).

## 8. ACIMASIZ v1 (filtre: "Avensair'in EVET'ini yakınlaştırıyor mu?")

**IN:** (1) Dolu katalog sitesi [VAR, yeni kod yok] · (2) 3-5 ürün 3D vitrin (çevir+yakınlaş, fizik yok)
· (3) **ESP/DW172 seçim aracı (statik MVP)** · (4) hesaplayıcılara test (3-5 gün) · (5) basit LLM danışman
(tek edge fn + system prompt + katalog context, RAG yok) · (6) white-label SADECE kabuk (logo/renk/domain,
Avensair tenant'ı elle kurulur).
**OUT (v2+):** CFD · fan sesi sim · sanal montaj · basınç-debi fizik motoru · tam multi-tenant izolasyon
· RAG · self-service onboarding · 50 ürünün hepsinin 3D'si.

## 9. 90 GÜNLÜK YOL HARİTASI (time-box: kutu taşarsa İYİLEŞTİRME, KIRP)

- **Gün 1:** Avensair'i ARA, T+3 hafta tarih koy (dış deadline = scope creep'in panzehiri). 8 dk demo script yaz.
- **Gün 2-6:** İçerik doldur + 3D vitrin (3-5 ürün, 3 gün time-box).
- **Gün 7-9:** ESP/DW172 seçim aracı + hesaplayıcı testleri (moat — buraya odaklan).
- **Hafta 3:** Basit LLM danışman (2-3 gün) + white-label kabuk → **Avensair görüşmesi.**
- **Hafta 4:** Sözlü "evet" → yazılı pilot anlaşma (yeni özellik yok).
- **Ay 2:** Avensair canlı (gerçek tenant/domain), ilk MRR (aylık bakım).
- **Ay 3:** 2-3 sıcak referansla aynı demo → 2. ödeyen tenant. CFD/ses/montaj'a kod **ancak** ödeyen müşteri isterse.
- **De-risk sırası:** Pazar (satılır mı?) > Teslim (biter mi?) > Teknik (3D mükemmel mi?). Mükemmeliyetçi bunu tersten yaşar; strateji zorla düzeltir.

## 10. AVENSAIR → İLK MÜŞTERİ

Model: **hibrit** (tek-sefer kurulum/proje bedeli + küçük aylık bakım) — saf SaaS aboneliği DEĞİL (henüz
tek başına SLA veremezsin). "Pilot fiyat" ama **sıfır değil** (ödenmemiş referans, referans değildir).
Çerçeve: *"Kurulumu pilot fiyatla yapayım; referansım ol, çevrene tavsiye et; aylık küçük bakımla canlı
tutarım."* Kapsamı **sözleşmede dondur**. Dikey e-ticarete ŞİMDİ girme (Avensair'in bayisisin → kanal çatışması).

## 11. MÜKEMMELİYETÇİLİK PANZEHİRİ (niyet değil, sistem)

1. **Dış deadline** = Avensair görüşme tarihi (bir insana verilen söz ertelenemez).
2. **Time-box + "taşarsa kırp"**; "%90 yeterli" yazılı kural.
3. **Yazılı Definition of Done** her özellik için, önceden sabit; DoD dışı = otomatik OUT.
4. **Günlük filtre:** "Bu Avensair'in EVET'ini mi yakınlaştırıyor, mühendis egomu mu tatmin ediyor?" Enerjini
   cilaya değil içeriğe (LinkedIn'de ESP/DW172 teknik yazıları) kanalize et — orada "yeterince iyi" kolay + inbound üretir.

## 12. KUZEY YILDIZI — Tam Yaşam Döngüsü Vizyonu (3-5 yıl, v1 DEĞİL)

> Bu, kurucunun uçtan uca hedefi: **tasarım → projelendirme → ürün satışı → şantiye süreci → IoT takibi**,
> + ürün/PIM yönetimi, filtre sistemleri, ekoloji üniteleri. **Bu bir SATIŞ HİKÂYESİ ve kuzey yıldızıdır
> (anlatılır), bir İNŞA planı DEĞİLDİR (hepsi aynı anda kodlanmaz).** Moat'ı tam da bu uçtan-uca kapsam:
> her aşamada saha deneyimi gerektirir → ne saf yazılımcı ne distribütör ne ajans kopyalayabilir.

| Faz | Dilim | Sıra gerekçesi |
|---|---|---|
| **0 (v1)** | Katalog [var] + 3D vitrin + **filtre/ekoloji seçim aracı** | IP + gelire en yakın + Avensair'i kapatır |
| **1** | Projelendirme çıktısı (seçim → spec/teklif/proje dokümanı) | Seçim aracının doğal uzantısı; mühendisliği paraya çevirir |
| **2** | Satış/e-ticaret + sipariş→şantiye devri | Müşteri tabanı oluşunca |
| **3** | Şantiye süreç takibi (B2B iş akışı) | Kurulu müşteri + gerçek talep gelince |
| **4 (en son)** | **IoT takip** (kendini-temizleyen ESP doluluk/temizlik telemetrisi ile birebir) | Donanım+firmware+telemetri ops = en ağır; kurulu cihaz tabanı olmadan anlamsız (monetizasyon finali, giriş değil) |

**Demir kural:** Kuzey yıldızını ANLAT (pitch'te, içerikte), ama her seferinde TEK dilim İNŞA et, gelir-önce.
Bir sonraki dilime ancak öncekini ödeyen müşteri kullanırken geç.
