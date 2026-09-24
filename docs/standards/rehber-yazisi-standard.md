# Rehber Yazısı Standardı (Cetvel) — v0.2 TASLAK

> **Ne yönetir:** Bilgi niyetli teknik yazının (rehber) konusu nasıl seçilir, hangi kaynaktan
> araştırılır, nasıl yazılır, nasıl doğrulanır, Recep'e nasıl sunulur, nerede ve nasıl yayınlanır,
> yayından sonra nasıl ölçülür.
> **Niçin var:** Karar 62 (2026-09-22, ORTA YOL): planlı üretim + Recep onayıyla yayın; akademik ve
> resmî kaynaklı teknik yazılar kapsamda; **kaynak gösterimi zorunlu, uydurma atıf = kırmızı.**
> Tetik ölçüm (OPS, 2026-09-24; bu cetvel için B sınıfı — başkasının ölçümü): bir rakibin tek yazısı
> ("elektrostatik filtre nedir", 2.561 kelime, 17 kaynak) üç günde birinci sayfaya çıktı. VentHub'da
> bugün bilgi yazısı yok ve Search Console'da bilgi niyetli arama **2 gösterim** (R1, A sınıfı).
> **Doğrulama gerekçesi sıralama DEĞİL doğruluktur:** biz sattığımız ürünü anlatıyoruz; yanlış değer
> yanlış satıştır (2026-09-06 vitrin emsali → `vitrin-metni-standard.md`).
> **Sahibi:** BLOG şeridi (karar 93: yazı + arama görünürlüğü). Sayfa, tablo, adres, JSON-LD: URUN
> şeridi. Araç kurulumu ve kapıya bağlama: ALTYAPI. Sıra ve Recep'e götürme: OPS.
> **Kayıt:** REC-369 (F0–F5 iş sırası OPS yorumunda, 2026-09-24).
> **İlgili cetveller:** `vitrin-metni-standard.md` (K1 alan evreni, K2 not deseni, K4.1 olumsuz iddia,
> K10 dil) · `catalog-ingestion-standard.md` §6.3–6.5 (kaynak dizini; PDF açılmaz) ·
> `rendering-cache-standard.md` (§1.1 sessiz dinamikleşme, §2 fiyat yüzeyi, §3 tazeleme) ·
> `canonical-url-standard.md` · `execution-method-standard.md` §5.2 (model seçimi) ·
> `denetim-izi-standard.md` · `db-grant-hygiene-standard.md` · `hukum-kaynak-standard.md` (A/B/C
> kaynak sınıfı) · `adres-semasi-standard.md` (⚠**master'da henüz yok**, açık PR #1339; karar 92
> satırı o cetvele eklenecek).

**Ad notu:** kayıttaki ilk ad `icerik-hatti-standard.md` idi, kullanılmadı. "İçerik hattı" KATALOG'un
aile açıklaması hattının adıdır (`scripts/icerik-hatti/**`, REC-146); iki ayrı iş aynı adı taşımasın.

**Durum:** TASLAK v0.2. v0.1'e iki bağımsız çürütme koşuldu (Fable 5.1 ve Opus 5.5, 2026-09-24; ikisi de
BLOK). Birleşik 29 gerçek bulgu bu sürüme işlendi (Ölçüm geçmişi). Yayın, R8'deki kapılar kendi
PR'larında doğmadan yapılmaz.

---

## R0 — Kapsam

| Metin | Yöneten cetvel |
|---|---|
| Rehber yazısı: "nedir, nasıl çalışır, nasıl seçilir, nasıl hesaplanır" sorusuna cevap veren, tek konulu, kaynaklı yazı | **bu dosya** |
| **Bugünkü 4 bilgi merkezi konusu** (`air-curtain`, `hava-perdesi`, `hrv`, `jet-fan`; sözlükte `knowledge.topics`, TR+EN 8 adres + merkez 2 adres = 10 canlı adres) | **bu dosya** (R0.1) |
| Ürün/aile açıklaması, blok metinleri, meta alanları | `vitrin-metni-standard.md` |
| Destek süreç sayfaları (SSS, iade, kargo, garanti) | kapsam dışı (süreç metni, teknik yazı değil) |

Rehber yazısı ürün satmaz, soruyu cevaplar; ürüne **bağlantı** verir (R3). Vitrin-metni cetvelinin
K2 (iç not yasağı), K4.1 (olumsuz iddia) ve K10 (dil) maddeleri rehber yazısına uygulanır; K2'nin
**deseni** ise rehbere birebir taşınmaz (R8.2).

### R0.1 Bugünkü 4 konu bu cetveli bugün çiğniyor — onarım, karar değil

Ölçüldü (2026-09-24, kod + canlı): dört konu kaynaksız teknik sayı basıyor ("çıkış hızı 7–9 m/s",
"itme kuvveti 50–100 N", "%70–85 verim"; `hrv` debi adımı ücretli bir standarda — "EN 16798-1/ASHRAE
62.1 aralıkları" — yaslanıyor, R2.2'nin KAPALI sınıfından sayı alınamaz). `air-curtain` ile `hava-perdesi` aynı adım/tuzak metnini taşıyor ve ikisi de kendini kanonik
ilan ediyor (R1.3 ihlali). Adım ve sık hata listeleri sunucu HTML'inde **boş** (R6, istemci bailout).

Müşteriye görünen kusurdur, **seçenek sunulmaz, onarılır**. Onarım karar 92 taşımasıyla aynı işte
yapılır (URUN rota + BLOG içerik): her konu ya R3/R5'ten geçerek yeni adreste yeniden yazılır ya da
kaldırılıp en yakın yazıya/kategoriye kalıcı yönlendirilir; `air-curtain` → `hava-perdesi`. Kaynağa
bağlanamayan sayı kalkar. **10 canlı adresin her biri için hedef yazılır, 404'e düşen adres 0.**

## R1 — Konu seçimi

### R1.1 Kaynaklar ve neyi gösterip neyi göstermedikleri

| Kaynak | Ne söyler | Neyi söyleyemez | Durum 2026-09-24 |
|---|---|---|---|
| Search Console (hizmet hesabı, `scripts/gsc/gsc-token.cjs`) | Google'ın bizi **zaten gösterdiği** aramalar, sıra, tık | Göstermediği aramalar — bilgi yazısı olmayan sitede bilgi talebi **görünmez** | ÇALIŞIYOR; veri 2026-08-28'de başlıyor |
| Google arama önerisi (`suggestqueries.google.com`, ücretsiz) | İnsanların yazdığı sorgular | **Hacim** (sıra hacim değildir) | ÇALIŞIYOR |
| Ads Anahtar Kelime Planlayıcı | Aylık arama hacmi | — | YOK (pazar ölçüm düzeni kol 2) |
| Site içi sonuçsuz arama günlüğü (karar 87) | Sitemizde aranıp bulunamayan | Site dışı talep | URUN kuruyor (henüz depoda yok) |
| Teklif kayıtları, müşteri soruları, Recep'in saha bilgisi | Gerçek alıcının sorusu | Hacim | elle |

⚠**Yokluk kanıt değildir.** F1'de (2026-09-24, A sınıfı) Search Console'da bilgi niyetli sorgu 2
gösterim verdi. Bu "talep yok" demek değil; aynı konular için Google arama önerisi 16 tohumda toplam
93 bilgi niyetli öneri döndürdü (ör. "hava perdesi" tek başına 16). Search Console, yazı yayımlanana
kadar bilgi talebini ölçemez; konu seçimi en az bir **dış** kaynağa dayanır. Sorgu dökümü ve tohum
listesi REC-369 BLOG F1 yorumunda (PUBLIC depoya girmez).

### R1.2 Ölçütler (konu başına tablo, Recep'e özetle gider)

| # | Ölçüt | Nereden |
|---|---|---|
| a | Google bizi o konuda zaten gösteriyor mu (küme gösterimi, sıra) | Search Console, sorgu+sayfa |
| b | Dış bilgi talebi (öneri sayısı; kol 2 gelince hacim) | arama önerisi / Ads |
| c | Katalogda o konuda satılan aile sayısı | DB: `product_families` × `categories` — aile `category_id` **veya** `subcategory_id` ile bağlanır; yalnız etkin kategoriler |
| d | Sitede ilgili hesaplayıcı var mı | `/destek/hesaplayicilar/*` (bugün: kanal, hrv, hava-perdesi, jet-fan) |
| e | Kaynak dizininde üretici belgesi var mı (belge × sayfa) | `sayfalar.jsonl` — yalnız **üretici teknik belgesi** sayılır (R2.1) |

Satılan ailesi olmayan konu (c = 0) yasak değildir ama sıranın sonuna gider: iç bağlantı ve satış
karşılığı yoktur. Bu, rakip emsaliyle bilerek ayrışan bir tercihtir.

### R1.3 Konu başına TEK yazı

Aynı sorguya iki yazı yarışmaz. Yeni konu açılmadan önce Search Console'da sorgu+sayfa kırılımıyla o
küme için mevcut sayfa aranır; varsa yeni yazı değil **o yazının genişletilmesi** (R5.5 revizyonu)
yapılır. Bugünkü ihlal: `air-curtain` ↔ `hava-perdesi` (R0.1).

## R2 — Kaynak

### R2.1 Öncelik sırası

1. **Üretici teknik belgesi** — kaynak dizininden okunur (`<ingestor>/kaynak-dizini/sayfalar.jsonl`).
   ⛔PDF doğrudan açılmaz; dizinde yoksa önce dizine eklenir (`catalog-ingestion-standard.md` §6.3, §6.5).
   ⛔**Bayi/ticari belge** (fiyat listesi, teklif, sözleşme) kaynak dizininde dursa da atıf **olamaz**:
   dizinde `ticaret/avensair-fiyat-listesi-2026/…` gibi belgeler var.
2. **Resmî kurum ve mevzuat** — Resmî Gazete, bakanlık, TSE; uluslararası: EPA, DOE, AB mevzuatı.
3. **Akademik ve meslek kuruluşu** — hakemli yayın, üniversite, ASHRAE, REHVA.
4. **Diğer** — sektör yayını. Yalnız bağlam için; **sayı bu sınıftan alınmaz**.

**Kaynak olmayanlar:** rakip sitesi, forum, yapay zekâ cevabı (ChatGPT, Gemini, Perplexity dahil),
kaynağı gösterilmeyen blog.

### R2.2 Erişim sınıfı — açılamayan kaynak atıf alamaz

| Sınıf | Tanım | Ne alınabilir |
|---|---|---|
| **AÇIK** | Tam metin herkese açık | İddia + sayı |
| **ÖZET** | Yalnız özet açık (ör. dergi özeti) | Yalnız özette geçen ifade, atıf özete yapılır |
| **KAPALI** | Ücretli (EN, ISO standart metni, ücretli makale) | Yalnız adı ve kapsamı; **sayı yok** |

Metindeki her sayı, birim, oran ve teknik iddia en az bir AÇIK kaynağa (ya da ÖZET'in kendi ifadesine)
bağlıdır. **Açılmamış kaynak atıf alamaz.**

### R2.3 Alıntı HAM kaynaktan doğrulanır — özetleyici araç kanıt değildir

⛔Ölçülmüş vaka (2026-09-24, bu cetvelin v0.1'i): Google'ın SSS zengin sonucu için "yalnız resmî ve
sağlık sitelerinde gösterilir" alıntısı bir özetleyici araçla (WebFetch — sayfayı küçük bir modelle
özetler) "birebir var" diye doğrulandı. Gerçekte belge adresi **301** ile güncellemeler sayfasına
gidiyordu; alıntı 2023 kaydındaydı ve aynı sayfada *"This feature will no longer appear in Google Search
starting May 7, 2026."* yazıyordu. Bağımsız denetçilerden biri (Fable) de aynı yoldan yanıldı; ham
HTML'i `curl` ile çeken denetçi (Opus) yakaladı.

**Kural:** **alıntının kaynakta geçmesi iddianın doğru ve güncel olduğunu göstermez.** Her atıf için:
1. Ham kaynak çekilir: `curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}"` (yönlendirme) →
   `curl -sSL` (ham HTML). Özetleyici araçlar keşif içindir, kanıt değildir.
2. Kayıt: ilk adres · son adres · HTTP durumu · yönlendirme zinciri · sayfanın "son güncelleme"
   tarihi · ham metnin sha256'sı · birebir alıntı · erişim tarihi.
3. Alıntının **çevresi** okunur: tarih, "deprecated/removed/no longer" notu, daha yeni bir girdi.
4. Kaynak dizini atfında: `pdf_hash` + sayfa + alıntı (dizin zaten belirlenimci).

### R2.4 Müşteriye görünen atıf biçimi

- Metin içinde numara: `[1]`. Yazının sonunda "Kaynaklar" listesi: yayıncı · başlık · (belge sayfası) ·
  adres · erişim tarihi.
- Üretici belgesi müşteriye **belgenin adı ve sayfasıyla** görünür (ör. "Vortice, AIR DOOR kataloğu,
  s. 12"). Üreticinin herkese açık adresi varsa verilir ve **tercih edilir**. Adresi yoksa atıf yine
  yapılabilir; doğrulanabilirlik iç kayıttadır (R2.3/4) ve bu atıf türü yazı başına sayılıp Recep'e
  giden özette ayrıca belirtilir.
- Dizin yolu, hash ve `[s.41]`, `[DB]`, `[MANIFEST]` biçimleri iç kayıttır, vitrine girmez
  (`vitrin-metni-standard.md` K2/5).

### R2.5 Hesap örneği — girdiler varsayımdır, sonuç hesaplayıcıyla aynıdır

Hesap örneği "kaynaksız sayı yok" kuralıyla çelişmez, çünkü girdiler iddia değil **varsayımdır**:
metinde "örnek varsayım" diye işaretlenir (ör. "7.200 m³'lük bir otopark varsayalım"). Formül ve
katsayılar kaynaklıdır (R2.2). Sonuç sitedeki ilgili hesaplayıcının aynı girdiyle verdiği sonuçla
**aynı** çıkmalıdır; farklıysa ya yazı ya hesaplayıcı yanlıştır ve yayın durur.

## R3 — Yazı kalıbı

Kalıp rakip ölçümünden (n = 1) çıkarıldı; bu yüzden **sayı hedefi değil ölçüttür**: konunun yan
soruları (R1'deki arama önerileri + SSS) cevaplandı mı. Kelime sayısı ve H2 sayısı hedef değildir.

| Bölüm | Kural |
|---|---|
| H1 | Aranan soru ya da konu adı |
| Doğrudan cevap | İlk 2–3 cümle sorunun cevabı; giriş cümlesi yok |
| Gövde | Konuya uyan bölümler: nedir / nasıl çalışır · türleri · uygulamalar · seçim ve boyutlandırma · hesap örneği (R2.5 + hesaplayıcı bağlantısı) · alternatiflerle kıyas · montaj · bakım · güvenlik ve mevzuat · fiyatı belirleyen etkenler · izlenecek yol. Her yan soru bir bölüme bağlanır |
| Tablo | En az bir (kıyas ya da boyutlandırma); hücreler de iddiadır (R5.1) |
| Fiyat | **Rakam yok.** "Fiyatı belirleyen etkenler" bölümü etkenleri anlatır; fiyat yalnız ürün sayfasında görünür (`rendering-cache-standard.md` §2) |
| SSS | 5–8 soru; her cevap tek başına anlamlı (okuyucu için; işaretleme için değil — R6) |
| İç bağlantı | İlgili ürün aileleri (kart, fiyatsız) · ana kategori · varsa hesaplayıcı. Ters yön (kategoriden yazıya) URUN'un sayfa işi |
| Kaynaklar | R2.4 |
| Teknik sorumluluk notu | Sabit metin, sözlükten: yazı genel bilgidir, proje hesabının yerini tutmaz |
| Tarih | Yayın ve güncelleme tarihi görünür |
| Görsel (isteğe bağlı) | Yazıya özgü (bugünkü konular genel kurulum görseli kullanıyor, ikisi aynı dosya — tekrar edilmez); hakkı belli (Design System varlığı ya da üretici görseli); alt metin zorunlu; `<Image>` genişlik/yükseklik (kural 10) |

**Üslup:** sade Türkçe; SI birimleri (m³/h, Pa, kW); ondalık virgül; kısaltma ilk geçişte açılır.
**Dil:** TR önce. `EN_YAYIN` kapalıyken (bugün `false`, EN ağacı `noindex`) **EN yazılmaz**: arama
getirisi 0, doğrulama maliyeti tam. Bayrak açılınca EN ayrı yazılır, aynı doğrulamadan geçer; EN yoksa
EN sayfa **yoktur** (başka dile düşme yasak, `vitrin-metni-standard.md` K10).
**Yazar ve yapay zekâ açıklaması — AÇIK SORU (Recep):** yazı imzası Kurum (VentHub) + teknik sorumluluk
notu olarak öneriliyor. Google'ın faydalı içerik rehberi "otomasyon/yapay zekâ kullanımı ziyaretçiye
açık mı" diye soruyor; açıklamanın biçimi bir yayın kararıdır ve ilk yazının onay özetinde tek soru
olarak Recep'e gider.

## R4 — Yasaklar

1. **Toplu üretim yok.** Google spam politikası: *"Scaled content abuse is when many pages are generated
   for the primary purpose of manipulating search rankings and not helping users."* Örnekleri arasında:
   *"Using generative AI tools or other similar tools to generate many pages without adding value for
   users"* (developers.google.com/search/docs/essentials/spam-policies, ham HTML, "Last updated
   2026-08-28", erişim 2026-09-24). Yazılar tek tek, konu başına araştırılarak üretilir; R5 atlanamaz.
2. **Garanti ve üstünlük vaadi yok** ("en iyi", "%100", "kesin çözüm", "garantili").
3. **Rakip adı ve kötüleme yok.** Kıyas ürün tipleri arasında yapılır, firmalar arasında değil.
4. **Taslak ve editör notu vitrine girmez** (K2 sınıfı; kapı R8.2).
5. **Olumsuz iddia kaynakta açıkça yoksa yazılmaz** ("içermez", "gerekmez"; K4.1). Kaynağın sessizliği kanıt değildir.
6. **Mevzuat hükmü** ("zorunludur", "yasaktır") yalnız resmî metne atıfla ve yürürlük tarihiyle yazılır.
7. **Kişi ve proje adı yok** (müşteri, şantiye, teklif).
8. **Yayından önce metin herkese açık başka bir adreste durmaz.** Depo PUBLIC; taslak, iddia tablosu ve
   doğrulama kaydı yayından önce depoya girmez (veritabanının iç tablosu ya da Linear kaydı).
9. **Google Indexing API kullanılmaz.** Google: *"The Indexing API can only be used to crawl pages with
   either JobPosting or BroadcastEvent embedded in a VideoObject."*
   (developers.google.com/search/apis/indexing-api/v3/quickstart, ham HTML, "Last updated 2026-07-16",
   erişim 2026-09-24). Yazılar site haritası + tazeleme ile duyurulur.

## R5 — Doğrulama (ajanlarda)

Recep metni satır satır okumaz. Doğruluğu ajan düzeni taşır; Recep'e özet gider (R5.4).

### R5.1 Akış

| Adım | Kim | Çıktı |
|---|---|---|
| 1. Araştırma | Sonnet alt ajan × N (konu eksenlerine bölünür) | Kaynak listesi + her kaynaktan ham alıntı + R2.3 kaydı |
| 2. Yazım | BLOG | Taslak + **iddia tablosu** (her iddia → kaynak no + birebir alıntı + tür: sayı / olumsuz / mevzuat / genel) |
| 3a. Kapsam çıkarımı | Doğrulayıcı, **iddia tablosunu görmeden** | Metnin TAMAMINDAN kendi iddia listesi: gövde, tablo hücreleri, SSS, `<title>`, meta açıklama, JSON-LD `headline`, görsel alt metni, hesap örneği. Yazarın tablosuyla eşlenir; **eşlenmeyen iddia = 0** olmadıkça tur geçersiz |
| 3b. Atıf betiği | belirlenimci betik (BLOG) | Sayı, birim, yüzde, "zorunlu", olumsuz fiil taşıyan her cümlede `[n]` var mı; listede olmayan `[n]` ya da kullanılmayan liste maddesi var mı |
| 3c. Alıntı betiği | belirlenimci betik (BLOG) | Her alıntı ham kaynakta (R2.3) normalize edilerek aranır; bulunamayan = DESTEKSİZ. LLM bu adımı yapmaz |
| 3d. Yargı | Doğrulayıcı alt ajan | Her iddia: DOĞRULANDI / DESTEKSİZ / ÇELİŞİYOR / BAYAT (alıntı var ama güncel değil). Birim/dönüşüm, sayının bağlamı (model mi seri mi), cümle içindeki **her iddia ayrı** (K4.1 vakası), olumsuz iddia için açık ifade |
| 3e. Sabotaj kolu | BLOG, doğrulayıcı bilmeden | Her turda **en az 3 tuzak** eklenir (yanlış sayı, yanlış kaynak sayfası, bayat alıntı, desteksiz olumsuz iddia). Hepsi yakalanmadıkça tur **geçersiz** (emsal: `vitrin-metni-standard.md` K9.7) |
| 3f. Örnekleme | BLOG | DOĞRULANDI satırlarından en az 3'ü BLOG tarafından ham kaynaktan yeniden açılır (`execution-method-standard.md` §4: alt ajan yargı vermez, örneklenir) |
| 4. Düzeltme | BLOG | DESTEKSİZ / ÇELİŞİYOR / BAYAT satırlar düzeltilir ya da silinir; tuzaklar çıkarılır |
| 5. İkinci tur | aynı doğrulayıcı | **Tüm metin** 3a'dan yeniden geçer (yalnız değişen satırlar değil: düzeltmede eklenen yeni iddia tabloya girmemiş olabilir) |

### R5.2 Model ve bağımsızlık

Doğrulayıcı **Opus** alt ajanıdır (`execution-method-standard.md` §5.2: çürütme → opus). Ölçüm
(2026-09-24, bu cetvelin v0.1 çürütmesi, aynı talimat iki kol): birleşik 29 gerçek bulgudan Opus 26,
Fable 18; Fable bir bayat alıntıyı "birebir doğru" onayladı; Fable'ın birim fiyatı 2,5 kat. Fable yalnız
ölçülmüş bir kaçırmadan sonra, gerekçesi yazılarak kullanılır.
⚠**Bağımsızlık model farkıyla değil yöntemle sağlanır:** aynı ölçümde farklı model (Fable) yazarla
(Opus) **aynı** hatayı yaptı; farkı ham kaynağı kendisi çekmek yarattı. Bağımsızlık = ayrı bağlam +
3a kapsam çıkarımı + 3c betik + 3e sabotaj kolu. Tek örneklem; ilk iki yazıda kıyas tekrar edilebilir.

### R5.3 Kabul

- Eşlenmeyen iddia = 0 · DESTEKSİZ = 0 · ÇELİŞİYOR = 0 · BAYAT = 0 · açılamayan kaynak = 0.
- Sabotaj kolu N / N yakalandı (N ≥ 3).
- Atıf betiği: numarasız iddia cümlesi 0; metin ↔ liste numaraları birebir.
- K2 sınıfı not 0 (R8.2).

### R5.4 Recep'e sunum

Metin değil özet, BLOG penceresinde, düz cümleyle: konu ve neden bu konu (R1.2 tablosu), kaynak sayısı
ve türleri (adresi olmayan üretici belgesi atfı ayrıca), iddia sayısı ve doğrulanan, sabotaj sonucu,
bağlanan ürün aileleri, önizleme bağlantısı (R5.6), tek soru: **"yayınlayalım mı?"** Onay Recep'in kendi
sözüyle ve bu pencerede alınır; başka pencereden aktarılan söz onay sayılmaz.

### R5.5 Durum metne bağlıdır; yayındaki yazı revizyonla güncellenir

| Durum | Geçiş şartı | Kayıt |
|---|---|---|
| taslak | — | — |
| doğrulandı | R5.3 tam | doğrulanan metnin **sha256**'sı + doğrulama raporu |
| onaylı | Recep sözü; metnin sha256'sı doğrulananla **aynı** | onay kaydı (kim, ne zaman, hangi sha256) + `admin_audit_log` |
| yayında | onaylı sha256 = yayına giden sha256 | `admin_audit_log` |

Metin doğrulamadan sonra **tek karakter** değişirse durum taslağa düşer. Yayındaki yazı güncellenecekse
canlı satır ezilmez, taslağa da çekilmez: güncelleme **ayrı revizyon** olarak aynı akıştan geçer, onaylanınca
yayındaki sürümün yerine geçer; o ana kadar eski sürüm yayında kalır.

### R5.6 Önizleme

Recep'e giden önizleme yalnız yönetici oturumuyla açılan, `force-dynamic` + `noindex` **ayrı bir
rota**dır. Vitrin rotasına sorgu parametresi (`?onizleme=`) eklenmez: `searchParams` alan sayfa
sessizce dinamikleşir (`rendering-cache-standard.md` §1.1). Dal önizlemeleri kapalıdır ve içerik
zaten veritabanındadır; önizleme için ayrı dağıtım açılmaz.

## R6 — Yer ve teknik gereklilikler (uygulayan URUN)

**Yer — karar 92 (Recep, 2026-09-24):** yazılar `/tr/bilgi-merkezi/<yazi>` ve
`/en/knowledge-hub/<article>` adresinde; çatı `/tr/bilgi-merkezi` · `/en/knowledge-hub`. Taşıma ve sayfa
URUN'da. Adres satırı ve rezerve kelimeler (`bilgi-merkezi`, `knowledge-hub`) `adres-semasi-standard.md`'ye
girer. Bugünkü 10 adres (R0.1) kalıcı yönlendirmeyle taşınır; hedefsiz adres 0.

| Şart | Gerekçe / ölçüm |
|---|---|
| **Rota sınıfı:** `page.tsx` RSC; `force-static` + `generateStaticParams` + `revalidate` yedeği; **`dynamicParams = false` kullanılmaz** (yeni yazı derlemeye kadar 404 verir) | Bugünkü konu rotası `dynamicParams = false` ve sözlükten üretiyor (ölçüldü) |
| **Gövdenin tamamı sunucu HTML'inde** — istemci bailout işareti 0; mevcut `'use client'` `TopicPage` yeniden kullanılmaz; `tests/smoke/ssr-kurallari.ts`'e rehber kuralı | Bugünkü konu sayfalarında adım/hata listeleri sunucu HTML'inde boş, 2 bailout işareti (ölçüldü). "Bot ve ziyaretçi aynı HTML'i alır" ölçütü tek başına yetmez: ikisi de aynı eksik HTML'i alabilir |
| Kanonik ve başlık yalnız RSC `generateMetadata`'dan; **tek** `<title>`; kendi `alternates`'ı (layout varsayılanına düşmez) | Bot karnesi (F1b, 2026-09-24): 28 adreste hreflang ana sayfaya düşüyor, 15 adreste iki `<title>` |
| Gövde markdown; sunucuda, izin listeli etiketlerle render; ayrıştırıcı bağımlılığı `bagimlilik-kararlari.md`'ye satır; biçim tasarım token'larıyla (kural 8) | URUN ile netleşti; ayrıştırıcı bugün depoda yok |
| JSON-LD: `Article` + `BreadcrumbList`; BreadcrumbList **tek kaynaktan** (`buildBreadcrumbJsonLd`) | Google: *"Article objects must be based on one of the following schema.org types: Article, NewsArticle, BlogPosting."* (ham HTML, "Last updated 2026-09-08"). `TechArticle` bu listede yok; schema.org'da Article'ın alt türüdür ve Google'ın alt türü kabul edip etmediği **ölçülmedi** — bu yüzden `Article`. Önerilen alanlar: `author`, `dateModified`, `datePublished`, `headline`, `image` |
| **`FAQPage` işaretlemesi konmaz** | Google SSS zengin sonucunu kaldırdı: *"This feature will no longer appear in Google Search starting May 7, 2026."* (developers.google.com/search/updates, ham HTML). SSS bölümü okuyucu için kalır |
| Site haritasında her yayındaki yazı; `lastmod` = güncelleme tarihi; `alternates` yalnız iki dil de yayındaysa | Bugünkü `sitemap.ts` her satıra koşulsuz tr+en alternates yazıyor |
| `hreflang` yalnız iki dil de varsa; kanonik adres tek | `canonical-url-standard.md` |
| **Kiracı:** rota kiracıyı `DEFAULT_TENANT_ID`'den çözer (`headers()` değil); önbellek anahtarı `lang` **ve** `tenantId`; `UNIQUE (tenant_id, dil, slug)`; servis DI (kural 2) + `React.cache` (kural 6) | Kural 12; `headers()` rotayı sessizce dinamikleştirir (`rendering-cache-standard.md` §1.1) |
| **Veri ve yetki:** yayındaki metin ile iç veri (iddia tablosu, doğrulama raporu, dizin kanıtı, onay kaydı) **ayrı tablolarda**; ziyaretçi rolü yalnız yayındaki metin tablosunu, yalnız `yayında` satırları okur; durum **dil başına**; yeni tablolarda `anon`/`authenticated` yazma yetkisi REVOKE; ziyaretçi rolüyle üç kollu test (yayındaki okunur · taslak okunmaz · yazma reddedilir) | RLS satırı süzer, sütunu süzmez (`vitrin-metni-standard.md` K1 dersi). Prod `public` şemasında yeni tablonun varsayılan yetkisi `anon=arwdDxtm` (ölçüldü, `pg_default_acl`) |
| **Tazeleme, aynı PR'da:** `rendering-cache-standard.md` §3 tablosuna satır + tetik (`scripts/webhook_setup.sql`) + handler dalı + `revalidatePath('/sitemap.xml')`. **Ters yön:** yazıda görünen aile/kategori değişince yazı yolu da tazelenir (§3.1 sorusu) | INV-RENDER-2 tablo listesini §3 tablosundan okur; satırı olmayan yeni tabloyu **görmez** — "tablo gelince otomatik" DEĞİL |
| Migration kural 13 (Recep onayı, URUN penceresi) | Migration merge = prod |

## R7 — Ölçüm (yayından sonra)

- **1. hafta:** indekslendi mi (Search Console URL denetimi) + bot karnesi (`scripts/seo/bot-karnesi.mjs`)
  yazı adresinde temiz mi.
- **4 hafta, haftalık:** sayfa bazında gösterim, tık, ortalama sıra; hedef küme sorguları.
- **Aylık kaynak bakımı:** her yayındaki yazının kaynakları R2.3 betiğiyle yeniden çekilir; son adres,
  durum ya da sha256 değişen kaynak → yazı "gözden geçir" listesine; ölü kaynağın iddiası yeni kaynağa
  bağlanır ya da kalkar.
- **Taban:** F1 küme rakamları (Ölçüm geçmişi, A sınıfı). Kıyas aynı sorgu ve aynı gün sayısıyla yapılır.
- Sayısal hedef yazılmadı: 25 günlük, 448 gösterimlik tabanla hedef koymak tahmin olurdu. İlk dört
  yazının ölçümü tabanı oluşturur.
- Sorgu listeleri PUBLIC depoya girmez; depoya yalnız özet sayılar, sorgular Linear kaydına.

## R8 — Kapılar

### R8.1 Her kapı onu gerektiren PR'da doğar

⚠Bugün bu cetveli zorlayan otomatik kapı **yok**. Kapılar "ilk yazıdan önce bir gün" kurulmaz: her kapı,
koruduğu şeyi getiren PR'ın içinde doğar (kural 14) ve en az bir sabotaj koluyla kırmızı yandığı
gösterilmeden kapı sayılmaz (`rendering-cache-standard.md` §3 dersi).

| Kapı | Ne ölçer | Hangi PR'da doğar | Sahip |
|---|---|---|---|
| Atıf betiği (R5.1 3b) | numarasız iddia cümlesi 0; metin ↔ liste birebir | BLOG doğrulama betikleri PR'ı | BLOG |
| Alıntı betiği (R5.1 3c) | alıntı ham kaynakta; son adres/durum/sha256 kaydı | BLOG doğrulama betikleri PR'ı | BLOG |
| Not deseni (R4.4) | K2 sınıfı not 0 (R8.2) | BLOG doğrulama betikleri PR'ı ya da tablo kısıtı (migration PR'ı) | BLOG + URUN |
| Vaat / rakip / fiyat deseni (R4.2, R4.3, R3) | "en iyi", "%100", "garanti"; rakip ad listesi (Linear'dan, depoya girmez); `₺ TL € EUR USD` + rakam = 0 | BLOG doğrulama betikleri PR'ı | BLOG |
| Olumsuz iddia (R4.5) | olumsuz fiilli her cümle iddia tablosunda `tur = olumsuz` + açık alıntı | BLOG doğrulama betikleri PR'ı | BLOG |
| Mevzuat (R4.6) | "zorunlu/yasaktır/yönetmelik" cümlesi → resmî kaynak + yürürlük tarihi | BLOG doğrulama betikleri PR'ı | BLOG |
| Toplu üretim (R4.1) | 7 günde yayına geçen yazı sayısı > 2 → KIRMIZI; her yayında doğrulama + onay kaydı | migration PR'ı (onay kaydı) | URUN + BLOG |
| Durum ↔ sha256 (R5.5) | onaylı/yayında sha256 = doğrulanan sha256 | migration PR'ı | URUN |
| Ziyaretçi rolü (R6) | yayındaki okunur · taslak okunmaz · yazma reddedilir · iç tablo okunmaz | migration PR'ı | URUN |
| Sunucu HTML (R6) | bailout 0; gövde ifadeleri sunucu HTML'inde | rota PR'ı (`ssr-kurallari.ts`) | URUN |
| JSON-LD + site haritası (R6) | `Article` + `BreadcrumbList` tek; haritada; FAQPage yok | rota PR'ı | URUN |
| Tazeleme (R6) | §3 satırı + tetik + handler + sitemap dalı | migration PR'ı (INV-RENDER-2 satırı okur) | URUN |
| Önizleme (R5.6) | ziyaretçi rolüyle 401/404; `noindex` | rota PR'ı | URUN |
| Bot karnesi | yazı adreslerinde hreflang/title/canonical/harita temiz | ALTYAPI kapıya bağlar | ALTYAPI |

### R8.2 K2 deseni rehbere birebir taşınmaz

K2 deseni PostgreSQL sözdizimiyle yazılı (`\m`, `\M` kelime sınırı). JS'e birebir taşınırsa `TODO`
kolu **sessizce ölür** — ölçüldü: `/\mTODO\M/.test('bir TODO var')` → `false`. Ayrıca gövde markdown
olduğu için `> *…*` ve `*(…)*` gibi meşru biçimler K2'de not sayılır (Fable çürütücüsü: 8 örnek
cümlenin 6'sında kırmızı, en az 3'ü meşru — B sınıfı, BLOG yeniden ölçmedi; kapı kurulurken ölçülür). Kapı ya DB kısıtı olarak PostgreSQL sözdizimiyle kalır ya da
JS'e `\b` ile taşınıp **sabotaj koluyla** (bilerek konmuş not kırmızı yanmalı) ve rehbere özgü meşru
biçim listesinin **yanlış pozitif ölçümüyle** birlikte kurulur.

## R9 — Ritim

Orta yol: planlı üretim. Başlangıç önerisi **haftada bir yazı**, ilk dört yazının R7 ölçümü bitene
kadar; sonra ölçüme göre artırılır. Üst sınır R8.1'deki toplu üretim kapısıdır (7 günde en fazla 2).
Ritim Recep'in tercihidir; bu satır öneridir.

---

## Ölçüm geçmişi

Kaynak sınıfı (`hukum-kaynak-standard.md`): **A** = BLOG'un kendi ölçümü · **B** = başkasının ölçümü, okundu.

| Tarih | Ölçüm | Sınıf | Sonuç |
|---|---|---|---|
| 2026-09-24 | Rakip yazı (OPS) | B | 2.561 kelime · 15 H2 · 8 SSS · 17 kaynak; Türkçe rakipler 433–1.565 kelime, 0 kaynak (REC-369 OPS yorumu) |
| 2026-09-24 | F1 Search Console (BLOG) | A | Veri 2026-08-28'de başlıyor (25 gün): 34 tık · 448 gösterim · ort. sıra 28,0 · sorguda görünen gösterim %50, tık %26 · bilgi niyetli sorgu 2 gösterim |
| 2026-09-24 | F1 konu kümeleri (BLOG) | A | 11 küme; en büyük marka dışı küme 57 gösterim / 0 tık / sıra 44. Küme adları ve sorgular REC-369'da (depoya yalnız özet) |
| 2026-09-24 | F1 arama önerisi (BLOG, 16 tohum × 6 ek) | A | 93 bilgi niyetli öneri; en geniş tohum 16 öneri |
| 2026-09-24 | F1b bot karnesi (BLOG, 45 adres × 5 kimlik) | A | 45/45 adreste beş kimlik aynı HTML; 32 adreste sorun (hreflang düşüşü 28, iki title 15, varsayılan başlık + canonical yok 13) |
| 2026-09-24 | Google belgeleri, ham HTML (BLOG) | A | Article türleri Article/NewsArticle/BlogPosting · SSS zengin sonucu 2026-05-07'de kaldırıldı · spam politikası alıntıları birebir · Indexing API yalnız JobPosting/BroadcastEvent |
| 2026-09-24 | v0.1 çürütmesi, iki kol (Fable 5.1 / Opus 5.5) | A | Birleşik 29 gerçek bulgu: Fable 18, Opus 26, ortak 15; Fable 1 bayat alıntı onayı. v0.2'ye işlendi. Raporlar `docs/audits/rec369-rehber-cetveli-red-team-2026-09-24.md` ve `…-opus-2026-09-24.md` |

⚠**v0.1'de bu cetvelin kendisi R2'yi çiğnedi:** SSS alıntısı özetleyici araçla "ölçüldü" diye yazıldı ve
bayattı (R2.3 vakası). Kuralı yazmak onu uygulamak değildir; bu sürümün de her olgusal cümlesi aynı
kurala karşı tarandı ve ölçüm geçmişine sınıfıyla yazıldı.
