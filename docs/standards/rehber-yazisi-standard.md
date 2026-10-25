# Rehber Yazısı Standardı (Cetvel) — v0.11 TASLAK

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

**Durum:** TASLAK v0.3. v0.1'e iki bağımsız çürütme koşuldu (Fable 5.1 ve Opus 5.5, 2026-09-24; ikisi de
BLOK), v0.2'ye dar ikinci tur (Opus; hüküm KOŞULLU: 35 kalemden 20 karşılandı, 14 kısmen, 1 bilinçli ret).
İkinci turun yüksek bulguları (T2-1…T2-4) bu sürümde; orta bulgular ilgili PR'ların kabul ölçütüne
bağlandı (Ölçüm geçmişi). Yayın, R8'deki kapılar kendi PR'larında doğmadan yapılmaz.
**v0.4 (2026-09-24):** ilk yazı iki doğrulama turundan geçip onaya sunulduktan sonra kalıbın iki zorunlu
bölümü (fiyatı belirleyen etkenler, teknik sorumluluk notu) eksik çıktı; hiçbir kontrol görmedi, OPS emsal
yazıyla elle kıyaslarken buldu. Recep "görmeden onay yok" dedi. Değişenler: R3 zorunlu bölümler + kalıp
kapısı (R8), sorumluluk notunun sabit ilk cümlesi, R5 girişi ve R5.4 (önizleme şart), R5.7 ara önizleme.
**v0.5 (2026-09-25):** karar 121 (içerik stratejisi) kalıcı kural oldu: R1.4 konu sırası ve içerik türleri;
R2.1'de eski destek sayfası içerikleri kaynak değildir; R0.1 ve R9'da taşınan eski konular yayından kalkar,
sırası gelince sıfırdan yazılır.
**v0.6 (2026-09-25):** MEVZUAT şeridiyle iş bölümü (OPS): R2.6 mevzuat paketi, R5.1 3g mevzuat kontrolü,
AB/TR tarih kuralı.
**2026-09-29 (REC-452, GEO-SEO):** R3.2 ters bağlantı — kategori, aile ve ana sayfadan rehbere yol;
INV-REHBER-TERS-BAGLANTI-1.
**2026-10-11 (BLG-3, OPS hükmü):** R5.7 — onay ara önizlemeyle sorulur, gerçek sayfa yayından sonra
gösterilir (frekans emsali, karar 120/135); "yayına giremeyecek metnin onayı sorulmaz" sınırı korunur ve
ölçülebilir hâle geldi: kimlikler güncel slug'a çözülmeli. Tetik ölçüm: sıra 2 yazısında dört aile kimliği
6 Ekim yeniden adlandırması öncesi slug'la duruyordu (sha256 değişir, R5.5).
**v0.8 (2026-10-13, BLG-11):** R10 yayın akışı — fikirden 14. gün ölçümüne tek şema; her basamakta sahibi,
kapısı ve kaydı; BLG-10 bulgularından çıkan kapı adayları (K0–K5) şemadaki yerleriyle. Yeni kural
getirmez, mevcut R1–R9 ve `yayin-gorunurluk-denetim-standard.md` Y2'yi sıraya dizer; R7'ye bağ eklendi.
Tetik ölçüm: radyal/aksiyel yazısında Google dizin isteği yapıldı, IndexNow yapılmadı (anahtar depoda ve
canlıda 200 iken "yok" sanıldı).
**v0.9 (2026-10-14, BLG-12, OPS emri):** R11 — başlık ve içerik yapısı: Google'ın resmî belgelerinden
derlenen 13 satır (adresli, belge tarihli, ham HTML'de doğrulanmış alıntı), Google'ın YAZMADIĞI şeyler
(alt başlıkta konu ifadesi şartı ve sayısal eşik yok) ve bunların üstüne kurulan İLKE sınıfı kurallar;
R3'e alt başlık satırı; kapıya `baslikDenetle` UYARI kolu. Kırmızı kural getirmez.
**v0.10 (2026-10-25, BLG-17, OPS onayı O1):** üçüncü yazının (BLG-15) yedi doğrulama turundan ölçülen dersler: R2.6'ya
MEVZUAT penceresi kapalıyken üç şartlı birincil metin hükmü ve madde/ek numarası ile değiştirici yönetmelik ölçümü;
R5.1.1 tur klasörü bağımsızlığı, başlıkların bağımsız okunması ve atıf kümesi ↔ kaynak alanı ölçümü; R5.5'e düzeltme
türüne göre tur ve başlık-yalnız revizyon; R10.3'e ölçülen tur sayısı (hedef karşılanmadı); R10.5 ders listesi.
Kırmızı kural getirmez; yeni kapı yazmaz (K0–K5 hâlâ aday).
**v0.11 (2026-10-25, BLG-19, OPS emri):** dördüncü yazının (BLG-18) beş doğrulama turundan ve yayın öncesi ölçümden
çıkan dersler: R10.5'e rehber kartı meta kopyası (sessiz fan, BLG-15), katalog-canlı sayı karşılaştırması (bölünmüş aile,
olmayan seri adı), `hide_price` kategorisinde RSC fiyatı, DOE/Vortice künye dersleri, tuzaklı + temiz kopya zorunluluğu,
ana sayfa blok adedi ve site haritası fikstürleri; yeni **R10.6 yayın öncesi kontrol listesi** (sekiz madde, her madde
kanıtlı, B8 PR gövdesinde doldurulur) ve hangi maddenin kapıya çevrilebileceği önerisi. Kırmızı kural ve kapı getirmez
(kapıyı ARAÇ yazar). Tetik: Recep "bu dersler neden departmanın kendi kuralında yok" diye sordu; sessiz fan dersi
cetvelde hiç yoktu.

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

### R0.1 Bugünkü 4 konu bu cetveli çiğniyor — onarım, karar değil

Sözlükteki dört konu kaynaksız teknik sayı **taşıyor** ("çıkış hızı 7–9 m/s", "itme kuvveti 50–100 N",
"%70–85 verim"; `hrv` debi adımı ücretli bir standarda — "EN 16798-1/ASHRAE 62.1 aralıkları" — yaslanıyor,
R2.2'nin KAPALI sınıfından sayı alınamaz). `air-curtain` ile `hava-perdesi` aynı adım/tuzak metnini
taşıyor ve ikisi de kendini kanonik ilan ediyor (R1.3 ihlali).

⚠**v0.2 bu sayıların müşteriye "basıldığını" yazıyordu; YANLIŞ** (ikinci tur denetçisi ölçtü, BLOG kodda
doğruladı: [TopicPage.tsx:55-59](../../src/views/knowledge/TopicPage.tsx#L55) çeviri dönüşü dizi değilse
listeyi `[]` yapıyor). Sayılar bugün ne sunucu HTML'inde ne tarayıcıda görünüyor. Müşterinin gördüğü
kusur başka: **iki boş bölüm başlığı** (adımlar, sık hatalar) ve yüklemeden sonra site varsayılanına dönen
sekme başlığı. ⚠**Gizli risk:** listeler onarılırsa kaynaksız sayılar canlıya **ilk kez** çıkar.

Onarım iki adımdır, ikisi de seçenek değildir:
1. **Hemen (taşımayı beklemez, URUN):** kaynaksız sayılar sözlükten silinir; boş bölüm başlıkları
   gizlenir; `air-curtain` → `hava-perdesi` kalıcı yönlendirme.
2. **Karar 92 taşımasında (URUN rota + BLOG içerik):** konular yeni adrese **kaldırılıp yönlendirilir**;
   yeniden yazım R9 ritmine girer (R8.1 sayacı). **10 canlı adresin her biri için hedef yazılır, 404'e
   düşen adres 0.**
3. **Karar 121c (2026-09-25):** Bilgi Merkezi'ne taşınan üç konu da yayından kalkar (URUN); konu sırası
   (R1.4) gelince aynı adreste sıfırdan, kaynaklı yazıyla döner. Taşınan metin yeniden yazımda kaynak
   olarak kullanılmaz (R2.1).

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
listesi eski Linear REC-369 BLOG F1 yorumunda; güncel yer Kanban kartı/depo dışı dosya (PUBLIC depoya girmez).

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

### R1.4 Konu sırası ve içerik türleri (karar 121, Recep 2026-09-24/25)

**Konu sırası** (kayıt: REC-369 yorumu 2026-09-24):

| Sıra | Konu | Durum 2026-09-25 |
|---|---|---|
| 1 | Frekans konvertörü | doğrulandı; yerel önizlemede Recep'e gösterilecek (karar 120) |
| 2 | Radyal fan mı aksiyel fan mı, fan nasıl seçilir | üç doğrulama turu bitti |
| 3 | Vortice sessiz fanlar | sırada |
| 4 | Korozyona dayanıklı (asit) fanlar | sırada |
| 5 | Isı geri kazanım | sırada; REC-392 (enerji etiketi) bu konuya değer |
| 6 | Çatı fanları | sırada |
| 7 | Banyo fanları | sırada |

Sırayı **yalnız Recep** değiştirir. Hacim ve mevsim verisi (pazar ölçüm düzeni kol 2) geldiğinde BLOG
ölçer, öneriyi OPS götürür; öneri sırayı kendiliğinden değiştirmez. Blog üretimi durmaz.

**İçerik türleri:**

| Tür | Durum | Not |
|---|---|---|
| "Doğrusu ve yanlışı" dizisi (yaygın yanlış + kaynaklı doğrusu) | EVET | yanlış da doğru da kaynağa bağlanır; kaynaksız "yaygın yanlış" yazılmaz |
| Mevzuatı ilk anlatan yazı | EVET | konu listesi MEVZUAT şeridinden gelir; resmî metin R2.1/2'dir, BLOG kendi indirdiği ham metinle doğrular |
| Hesaplayıcıyla birleşen yazı | EVET | R2.5: hesap örneğinin sonucu hesaplayıcıyla aynıdır, bağlantı `vh:hesaplayici/…` |
| Saha deneyimi yazıları, Türkçe iklimlendirme terimleri sözlüğü | SONRA | sözlük Bilgi Merkezi alt kırılımı; bilgi mimarisi kararı TASARIM'dan sonra |
| Tedarikçi yazıları | ŞİMDİLİK YOK | |
| ESP yazısı | MÜMKÜN | üçüncü bir firmanın iç bilgisi ve o firma için yazılmış metin kullanılmaz; farklı açı (ayrıntı Kararlar belgesinde, PUBLIC depoya girmez) |

**Eski içerik** (karar 121c): Bilgi Merkezi'ne taşınan üç eski konu (hava perdesi, otopark jet fan, ısı
geri kazanım) yayından kalkar (URUN); konu sırası geldiğinde aynı adreste **sıfırdan, kaynaklı** yeni
yazıyla döner. Eski metin kaynak değildir (R2.1).

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
kaynağı gösterilmeyen blog, **sitenin eski destek sayfası içerikleri** (karar 121c: sözlükteki
`knowledge.topics` metinleri ve onlardan Bilgi Merkezi'ne taşınan yazılar; Recep 2026-09-25: "çok kaba
bilgiler, faydası yok bize"). Eski metinden cümle, sayı ya da yapı alınmaz; aynı konu yeniden
yazılırken araştırma sıfırdan yapılır.

### R2.2 Erişim sınıfı — açılamayan kaynak atıf alamaz

| Sınıf | Tanım | Ne alınabilir |
|---|---|---|
| **AÇIK** | Tam metin herkese açık | İddia + sayı |
| **ÖZET** | Yalnız özet açık (ör. dergi özeti) | Yalnız özette geçen ifade, atıf özete yapılır |
| **KAPALI** | Ücretli (EN, ISO standart metni, ücretli makale) | Yalnız adı ve kapsamı; **sayı yok** |
| **İÇ-DİZİN** | Üretici teknik belgesi, kaynak dizininde var, herkese açık adresi yok | İddia + sayı; kanıt iç kayıtta (`pdf_hash` + sayfa + alıntı); müşteriye R2.4 biçimiyle |

Metindeki her sayı, birim, oran ve teknik iddia en az bir AÇIK ya da İÇ-DİZİN kaynağa (ya da ÖZET'in kendi
ifadesine) bağlıdır. **Açılmamış kaynak atıf alamaz.** (v0.2'de İÇ-DİZİN sınıfı yoktu; 1. öncelikli
kaynak kendi tanımına girmiyordu — ikinci tur T2-2.)

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
   tarihi · **etiketi soyulmuş metnin** sha256'sı (ham HTML'in hash'i her çekimde değişir — ikinci tur
   ölçtü) · birebir alıntı · erişim tarihi.
3. Alıntının **çevresi** okunur: tarih, "deprecated/removed/no longer" notu, daha yeni bir girdi.
   **Adres başka bir yola taşındıysa** bu en güvenilir bayatlık işaretidir (SSS vakası).
4. Kaynak dizini atfında: `pdf_hash` + sayfa + alıntı (dizin zaten belirlenimci).
5. **Tek kaynak betiktir:** [alinti-dogrula.mjs](../../scripts/rehber/alinti-dogrula.mjs) (normalize tanımı,
   hash, yönlendirme ve bayatlık işareti orada). Sonuç `GECTI` / `INCELE` / `KALDI`; `INCELE` alıntıyı
   düşürmez, çevre metni R5.1 3d'ye gider — kelime sezgisi ayırt etmez (ölçüldü: olağan "pages are added
   or removed" cümlesi de işaret verdi).

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

### R2.6 Mevzuat iddiası MEVZUAT şeridinin paketinden gelir (OPS iş bölümü, 2026-09-25)

Teknik mevzuat ve standart kaydının sahibi MEVZUAT şerididir. BLOG yönetmelik yorumlamaz.

| # | Adım | Sahibi |
|---|---|---|
| 1 | Her yazıdan **önce** konu ve ürün aileleri MEVZUAT'a bildirilir; MEVZUAT **mevzuat paketi** verir: yürürlükteki metin, AB/TR farkı, geçiş tarihleri, birebir alıntı | BLOG ister, MEVZUAT verir |
| 2 | Yazıdaki her mevzuat iddiası (`tur: mevzuat`) yalnız paketten yazılır; pakette olmayan önce MEVZUAT'a sorulur. Araştırma ajanları mevzuat eksenini ayrıca araştırmaz | BLOG |
| 3 | Yazı bitince mevzuat cümlelerini MEVZUAT kontrol eder; bu, R5.1 akışının bir adımıdır (3d'ye ek, onun yerine geçmez) | MEVZUAT |
| 4 | Kayıtta değişiklik olunca MEVZUAT yayındaki yazı için "güncelle" bildirir → R5.5 revizyonu | MEVZUAT bildirir, BLOG yazar |
| 5 | "Mevzuatı ilk anlatan" yazı adaylarını MEVZUAT önerir; sırayı Recep belirler (R1.4) | MEVZUAT / Recep |

**Tarih kuralı:** AB ile TR ayrı takvimdedir (ör. fan tebliği TR'de 24.7.2027'de yürürlüğe girer, o güne
kadar eski tebliğ geçerli). Bir TR tebliğinin kendi metninde basılı AB tarihi AB metniyle çelişirse AB
tarihi AB metninden yazılır; çelişki MEVZUAT paketinde belirtilir (MEVZUAT bulgusu, SGM 2021/16).

**MEVZUAT penceresi kapalıyken (OPS hükmü, BLG-14 ve BLG-15, 2026-10-16).** Paket verilemiyorsa mevzuat cümlesi yalnız şu
üç şartla yazılır; biri eksikse cümle yazıdan çıkar:

1. Her mevzuat cümlesi için iddia tablosunda birincil kaynak satırı: Resmî Gazete bağlantısı + ek PDF sayfa ya da tablo
   numarası + birebir alıntı.
2. Bağımsız doğrulayıcı aynı satırları birincil metinden ikinci kez okur; eşleşmeyen satır yazıdan çıkar.
3. İddia tablosunda şu not kalır: "MEVZUAT kontrolü yapılmadı (pencere kapalı), birincil metin BLOG + doğrulayıcı".

**Madde, ek numarası ve değiştirici yönetmelik özetten alınmaz, ham metinden ölçülür.** Tetik ölçüm: BLG-15'te
tanımlar maddesi "md. 3" yazılmıştı, doğrusu md. 4; 2018 değişikliği (RG 30437) atıfsız kalmıştı. Künyede, atıf yapılan
maddeleri değiştiren yönetmelik olup olmadığı yazılır ("bu atıf maddelerine dokunmaz" de bir ölçüm sonucudur).
Taranmış ek PDF'in metin katmanı yoksa değer sayfa görüntüsünden okunur ve iddia satırında `gorsel` diye işaretlenir.
EUR-Lex bot doğrulaması isterse ham metin Cellar adresinden (`publications.europa.eu/resource/celex/<CELEX>`,
`Accept: application/xhtml+xml`, `Accept-Language: en`) alınır.

## R3 — Yazı kalıbı

Kalıp rakip ölçümünden (n = 1) çıkarıldı; bu yüzden **sayı hedefi değil ölçüttür**: konunun yan
soruları (R1'deki arama önerileri + SSS) cevaplandı mı. Kelime sayısı ve H2 sayısı hedef değildir.

**Zorunlu bölümler (kapı: `scripts/rehber/rehber-denetim.mjs` → `kalipDenetle`, R8.1):** tek H1 · en az
bir tablo · başlığı birebir `## Fiyatı belirleyen etkenler`, `## Sık sorulan sorular` (5–8 `###` soru),
`## Kaynaklar`, `## Teknik sorumluluk notu`. Başlık metni sabittir çünkü kapı başlığı birebir arar;
"Fiyatı neler belirler?" gibi bir varyant kırmızı verir. Gövdenin geri kalanı konuya göre serbesttir.
⚠**Niçin kapı (2026-09-24):** ilk yazı bu iki bölüm olmadan iki doğrulama turundan geçti ve onaya
sunuldu. Doğrulama iddiaları sınar, kalıbı sınamaz; eksik bölüm doğrulayıcının göreceği bir iddia
değildir. Fark ancak emsal yazıyla elle kıyasla bulundu (OPS).

| Bölüm | Kural |
|---|---|
| H1 | Aranan soru ya da konu adı |
| Alt başlıklar (H2, H3) | Tek başına okunduğunda anlamlı; konu terimi doğal yerinde; aynı ifade her H2'de tekrarlanmaz. **R11** (resmî dayanak ve İLKE sınıfı; kapı UYARI verir, kırmızı değil). Zorunlu bölüm başlıkları sabittir, bu satırdan muaftır |
| Doğrudan cevap | İlk 2–3 cümle sorunun cevabı; giriş cümlesi yok |
| Gövde | Konuya uyan bölümler: nedir / nasıl çalışır · türleri · uygulamalar · seçim ve boyutlandırma · hesap örneği (R2.5 + hesaplayıcı bağlantısı) · alternatiflerle kıyas · montaj · bakım · güvenlik ve mevzuat · fiyatı belirleyen etkenler · izlenecek yol. Her yan soru bir bölüme bağlanır |
| Tablo | En az bir (kıyas ya da boyutlandırma); hücreler de iddiadır (R5.1) |
| Fiyat | **Rakam yok.** "Fiyatı belirleyen etkenler" bölümü etkenleri anlatır; fiyat yalnız ürün sayfasında görünür (`rendering-cache-standard.md` §2) |
| SSS | 5–8 soru; her cevap tek başına anlamlı (okuyucu için; işaretleme için değil — R6) |
| İç bağlantı | İlgili ürün aileleri (kart, fiyatsız) · ana kategori · varsa hesaplayıcı. Ters yön (kategoriden ve aileden yazıya, ana sayfadan en yeni yazılara) **R3.2**'dedir. **Adres değil kimlik yazılır** (v0.4, Recep 2026-09-24: "URL değişirse sorun olmaz mı?"): metinde `[metin](vh:<tür>/<anahtar>)`, tür ∈ model · aile · kategori · marka · hesaplayici · sayfa; anahtar (URUN ile kesinleşti, 2026-09-24) model için **SKU** (harf duyarsız), kategori için **kanonik EN slug** (CLAUDE.md kural 7), aile için **aile slug'ı** — slug Faz 1-B'de değişirse çözücü `url_takma_adlari` tablosuna bakar. Sayfa üretilirken kimlik `adresUret` ile **güncel** adrese çözülür; **çözülemeyen bağlantı derlemeyi düşürür** (URUN). Metne düz site adresi (`/tr/…`, `https://venthub.com.tr/…`) yazılmaz. Niçin: adres ağacı tek yayında değişecek (`docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md`); eski adres kırılmaz, 308 verir, ama her tıklama bir durak daha yapar ve yazı eski adresi kalıcı taşır. Şablonun kendi kartları ve teklif bağlantısı da aynı çözücüyü kullanır |
| Kaynaklar | R2.4 |
| Teknik sorumluluk notu | `## Teknik sorumluluk notu`, Kaynaklar'dan sonra, yazının içinde (doğrulamadan ve sha256'dan geçsin diye sözlükte değil). İlk cümle her yazıda aynıdır: *"Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz."* Ardından yazıya özgü uyarılar gelir: örnek oranlar kendi sisteminde farklı çıkabilir, kurulum yetkili personelle, yasal bilgi yayın tarihindekidir. Emsal yazının "…garantisi içermez" biçimi alınmaz (ölçüldü): "garanti içermez" vaat desenine takılır; "garantisi içermez" takılmaz ama "içermez" olumsuz iddia sınıfına girer ve kaynaksız cümle kırmızı verir. Aynı koruma "yerini tutmaz", "farklı olabilir" biçimiyle yazılır |
| Tarih | Yayın ve güncelleme tarihi görünür |
| Künye satırı (şablon, URUN) | Başlığın altında: yazar (Kurum: VentHub — kişi adı R3 açık sorusuna bağlı), yayın tarihi, okuma süresi (kelime ÷ 200, yukarı yuvarlanmış dakika). Emsal: "DEA Enerji · 21 Eylül 2026 · 12 dakika okuma" |
| İçindekiler (şablon, URUN) | H2'lerden otomatik, sayfa içi çapalı; "Kaynaklar" ve "Teknik sorumluluk notu" hariç. Metne yazılmaz. İki sütunlu masaüstünde yapışkan, dar ekranda açılır kutu (`<details>`) — emsalin bir şablonu ve bizim önizleme böyle; tek sütunlu emsal şablonunda yapışkan değil (ölçüldü 2026-09-24) |
| Liste sayfası (URUN) | `/tr/bilgi-merkezi`: tek H1, her yazı bir kart (görsel · kategori · tarih · başlık · özet), yeniden eskiye; **arama kutusu** (tasarım kararı K37-a / U2); kategori süzgeci yazı sayısı artınca. Kendi `<title>`/meta/canonical; JSON-LD en az `BreadcrumbList` (emsal liste sayfasında yok — kopyalanmaz). Mobilde yatay taşma 0 (emsalin yazı şablonunda sayfa geneli ~380 px taşma ölçüldü — kopyalanmaz) |
| İlgili yazılar (şablon, URUN) | Yazının altında aynı kategoriden ya da aynı ürün ailesine bağlı diğer rehber yazıları (kimlikle, iç bağlantı kuralı). **Kaynak: tasarım kararı K37-a / U2** (Linear P-REC-4, 2026-09-06: "Bilgi Merkezi iç tasarımı (içindekiler · arama · ilgili makale · ürün bağı; uydurma başlık yok)"). Emsal yazıların üçünde de yok (2026-09-24 şablon ölçümü); karar bizim tasarımımızdan gelir. İlk yazıda ilgili yazı olmadığı için blok görünmez (boş başlık basılmaz) |
| Teklif çağrısı (şablon, URUN) | Yazının altında tek kutu: iletişim/teklif sayfasına bağlantı, bir cümlelik açıklama. Ürün övgüsü ve vaat yok (R4.2). Emsalde var, v0.3'te kural yoktu (2026-09-24 kıyası) |
| Görsel | **R3.1** (v0.7 taslak): kapak her yazıda; şema metnin anlattığı yapı ya da eğri için; hak, kaynak, alt metin ve doğrulama kuralları orada |

### R3.1 Görsel — kapak ve şema (v0.7 TASLAK; karar 134 ve 135 verildi)

**Tetik (2026-09-25):** Recep ilk yazının ön izlemesini gördü: *"blog gibi, daha kaliteli görünmeli,
kapak resmi bile yok"* (OPS aktarımı). Eleştiri metne değil sunuma. v0.6'da görsel "isteğe bağlı" idi;
emsal yazıların hepsinde kapak var (2026-09-24 şablon ölçümü). Yazı başına ihtiyaç listesi:
`docs/plans/rec369-gorsel-ihtiyac-2026-09-25.md`.

**Ölçülen kısıt (BLOG, 2026-09-25):** `src/lib/bilgiMerkezi/markdown.ts` görsel sözdizimini reddeder
(satır 93, `görsel sözdizimi desteklenmiyor` → derleme düşer); yazı kaydında kapak alanı yok. Aşağıdaki
kurallar şablon desteği gelince (URUN) uygulanır; o güne kadar görsel metne yazılmaz.

| Kural | İçerik |
|---|---|
| **Kapak — KARAR 134 (Recep, 2026-09-25, OPS aktarımı)** | *"Kapak = yazının konusuyla ilgili KENDİ ürün görselimiz (DB `product_images`); konuyla ilgili ürünümüz yoksa kapağı Recep verir (bulunan foto ya da Gemini üretimi)."* Her yazıda bir kapak. Aday seçilirken görsel **açılıp bakılır**: üzerinde yazıyla ilgisiz rozet/damga ya da yazı (ör. sertifika rozeti, "photo non contractuelle") olan görsel kırpılmadan kullanılmaz; eğri/tablo görseli kapak olmaz. Yazıya özgüdür: aynı görsel iki yazıda kullanılmaz. Liste kartında ve `Article` JSON-LD `image` alanında aynı görsel (R6). **KARAR 135 (Recep, 2026-09-25):** yazılar mevcut şablonla yayına girer, görsel yükseltme sonra gelir |
| **Şema** | Metnin anlattığı bir yapı (bölümler, kesit, hava yolu) ya da ilişki (eğri, kıyas) okuru metinden daha hızlı taşıyorsa çizilir. Süs şeması yok: her şema bir bölüme bağlıdır ve o bölümde anılır |
| **Şemadaki her sayı ve etiket iddiadır** | İddia tablosuna satır olarak girer (R5.1); doğrulayıcı şemayı da görür; tuzak şemaya da konabilir. Grafik verisi yazıdaki tablo ya da kaynak sayfasındaki değerle birebir aynıdır; okunan eğriden "göz kararı" değer alınmaz |
| **Kaynak gösterimi** | Şemanın altında tek satır: *"VentHub çizimi; veriler: [n]"* ya da *"Temsilî çizim; ölçekli değildir"*. `[n]` yazının kaynak listesindeki numaradır (R2.4) |
| **Hak (telif)** | Hakkı belgelenmemiş görsel kullanılmaz. Üretici kataloğundaki çizim ya da grafik **birebir kopyalanmaz**; gerekiyorsa verisi kaynaktan alınıp yeniden çizilir ve kaynak gösterilir. Ürün fotoğrafı yalnız sitede o ürün için zaten kullanılan medyadan (hakkı ürün kaydıyla aynı). Başka sitelerden görsel alınmaz. Kapak kaynağı **karar 134** (yukarıda); şemalar VentHub çizimidir |
| **Alt metin** | Zorunlu; görselin **ne gösterdiğini** anlatır (süs kelimesi değil): *"Frekans konvertörünün dört bölümü: doğrultucu, DC ara devre, evirici, kontrol birimi"*. Temsilî görselde alt metin bunu söyler; emsal biçim: *"temsili görsel; ölçekli teknik çizim veya belirli bir ürün modeli değildir"* (DEA, 2026-09-24). Şemadaki yazılar Türkçe, SI birimi, ondalık virgül (R3 üslup) |
| **Teknik** | `<Image>` genişlik/yükseklik (CLAUDE.md kural 10); ekranın üst kısmındaki kapak dışında tembel yükleme; açık ve koyu temada okunur (renk token'ları, kural 8); dar ekranda yatay taşma 0 |
| **Ürün kartı ve iç bağlantı** | Görsel değil ama aynı derste doğdu (2026-09-25): ön izleme betiği önceki yazının elle yazılmış ürün kartlarını taşıdı. Kart ve kategori yalnız yazının `vh:` bağlantılarından türetilir; bağlantı seçilmeden önce kategorideki tüm aileler veritabanından ve katalogdan okunur (R3 "İç bağlantı") |

**Kapı (şablon desteğiyle aynı PR'da, R8.1):** her görselin alt metni dolu · kapak var · şema altı kaynak
satırı var · aynı görsel dosyası iki yazıda yok.

**Emsalden bilerek alınmayanlar (2026-09-24 kıyası):** `TechArticle` türü (Google'ın Article listesinde
yok, R6) · `FAQPage` işaretlemesi (zengin sonuç 2026-05-07'de kalktı, R6) · numarasız, bölüm sonu
"Kaynaklar: …" atıf biçimi (R2.4 cümle düzeyinde numara ister) · cümle düzeyinde kaynağı olmayan
koruyucu olumsuz cümleler (kıyas raporu emsalde 15 koruyucu ifade saydı, B sınıfı: alt ajan; emsalde
metin içi atıf numarası hiç olmadığı için hiçbiri cümle düzeyinde kaynaklı değil; R4.5 olumsuz iddiayı
açık kaynak olmadan yasaklar). Aynı koruma bizde kaynaklı sınırlama cümleleriyle (ör. statik basma
yüksekliği uyarısı) ve teknik sorumluluk notuyla sağlanır.

**Üslup:** sade Türkçe; SI birimleri (m³/h, Pa, kW); ondalık virgül; kısaltma ilk geçişte açılır.
**Dil:** TR önce. `EN_YAYIN` kapalıyken (bugün `false`, EN ağacı `noindex`) **EN yazılmaz ve
`/en/knowledge-hub` rotası üretilmez**: arama getirisi 0, doğrulama maliyeti tam. Bugünkü 5 EN bilgi
merkezi adresi o süre EN kategori/destek karşılığına kalıcı yönlendirilir (R6). Bayrak açılınca EN ayrı yazılır, aynı doğrulamadan geçer; EN yoksa
EN sayfa **yoktur** (başka dile düşme yasak, `vitrin-metni-standard.md` K10).
**Yazar ve yapay zekâ açıklaması — KARAR 106 (Recep, 2026-09-24): yapay zekâ notu KONMAZ.** İmza Kurum
(VentHub); okuyucuyu koruyan şey kaynak beyanıdır: cümle düzeyinde `[n]`, kaynak listesi, teknik
sorumluluk notu. Recep'in gerekçesi: bir çalışmayı mühendise yaptırınca da sayfaya onun kimliğini
yazmıyoruz. Google açıklamayı zorunlu tutmuyor: *"Consider adding these when it would be reasonably
expected"* (developers.google.com/search/docs/fundamentals/creating-helpful-content, ham HTML, erişim
2026-09-24). Emsal ölçümü (BLOG, 2026-09-24, A sınıfı: tarayıcıda işlenmiş sayfa, metin + HTML +
JSON-LD taranarak): emsal yazıda yapay zekâ açıklaması **yok**; yazar `Organization` (şirket adı), tarih
görünür, "gözden geçiren" satırı yok. Sitede geçen tek "yapay zeka" ifadesi alt menüdeki sohbet asistanı
bağlantısıdır, yazıyla ilgili değildir.

### R3.2 Ters bağlantı — yazıya site içinden gelen yol (REC-452, 2026-09-29)

Yayındaki her rehber, bağlandığı her kategori ve aile sayfasından **geri bağlantı** alır; ana sayfa en
yeni rehberlere (en çok 3) doğrudan bağlanır. Bağlantı sunucuda çizilir (ilk HTML'de durur).

| Kural | Nasıl |
|---|---|
| Dizin elle tutulmaz | Kategori/aile → yazı eşlemesi yazının KENDİ kimliklerinden türer: gövdedeki `vh:kategori/…`, `vh:aile/…` + `urunler`. Kod: `src/lib/bilgiMerkezi/tersDizin.ts`. Yeni yazı eklenince bağlantı kendiliğinden gelir |
| Boş blok basılmaz | O konuda yazı yoksa ya da Bilgi Merkezi o dilde kapalıysa (EN, R6) blok hiç çıkmaz |
| Anahtar | Kimliğin yazıldığı slug (kategori = kanonik EN slug, aile = aile slug'ı). Yazı takma adlı eski slug taşırsa ters dizin eşleşmez; yeniden yazımda kimlik güncel slug'la yazılır |
| Kapı | INV-REHBER-TERS-BAGLANTI-1 (`src/lib/bilgiMerkezi/__tests__/tersDizin.test.ts`) — yayındaki frekans konvertörü yazısının kategorisine ve üç Danfoss ailesine döndüğünü de ölçer |

**Niçin (ölçüm, 2026-09-29, A sınıfı):** frekans konvertörü rehberi 09-25'te yayına girdi; 09-27'de
Search Console "Google tarafından bilinmiyor" dedi, 09-29'da aramada yazı değil yalnız liste sayfası
çıktı. Yazıya sitenin içinden bağlanan TEK sayfa listeydi (ana sayfa 0, kategori 0, aileler 0). Bu satır
v0.4'ten beri "URUN'un sayfa işi" diye yazılıydı ama emre bağlanmamıştı — yapılmadı.

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
   doğrulama kaydı yayından önce depoya girmez (veritabanının iç tablosu ya da Kanban kartı/depo dışı dosya).
9. **Google Indexing API kullanılmaz.** Google: *"The Indexing API can only be used to crawl pages with
   either JobPosting or BroadcastEvent embedded in a VideoObject."*
   (developers.google.com/search/apis/indexing-api/v3/quickstart, ham HTML, "Last updated 2026-07-16",
   erişim 2026-09-24). Yazılar site haritası + tazeleme ile duyurulur.
10. **Şirket iddiası ve reklam dili yok** (HRT-46): yazıda firma, kurum, ekip, kuruluş yılı, referans ya da "biz"
    dili ve reklam dili kullanılmaz; tek istisna marka adı VentHub'dır. Aynı kural sözlük metni için
    `i18n-localization-standard.md` §4'te de yazılıdır.

## R5 — Doğrulama (ajanlarda)

Doğruluğu ajan düzeni taşır; Recep'in işi satır satır iddia denetimi değildir. Ama **Recep yazıyı
görmeden onay vermez** (Recep, 2026-09-24: "blog yazısını görmedim, nasıl onay vereceğim, görmeden olmaz").
v0.3'teki "Recep metni satır satır okumaz; özet gider" kuralı bu sözle düzeltildi: özet kalır, yanına
yazının sitedeki görünüşüne yakın önizleme eklenir (R5.4).

### R5.1 Akış

| Adım | Kim | Çıktı |
|---|---|---|
| 1. Araştırma | Sonnet alt ajan × N (konu eksenlerine bölünür) | Kaynak listesi + her kaynaktan ham alıntı + R2.3 kaydı. Alıntı **tek parça ve birebir**; tablo değeri **hücre hücre** (not: satır/sütun başlığı). ⚠Ölçüldü (F4, 2026-09-24): ajanlar parçaları "[...]", " / ", " — " ile birleştirip tablo hücrelerini kendi biçiminde yeniden yazdı — ilk taramada 53 alıntının 22'si kaynakta birebir yoktu. Araştırma çıktısı 3c betiğinden KALDI 0 çıkmadan yazıma geçilmez |
| 2. Yazım | BLOG | Taslak + **iddia tablosu** (her iddia → kaynak no + birebir alıntı + tür: sayı / olumsuz / mevzuat / genel) |
| 3a. Kapsam çıkarımı | Doğrulayıcı, **iddia tablosunu görmeden** | Metnin TAMAMINDAN kendi iddia listesi: gövde, tablo hücreleri, SSS, `<title>`, meta açıklama, JSON-LD `headline`, görsel alt metni, hesap örneği. Yazarın tablosuyla eşlenir; **eşlenmeyen iddia = 0** olmadıkça tur geçersiz |
| 3b. Atıf betiği | belirlenimci betik (BLOG) | Sayı, birim, yüzde, "zorunlu", olumsuz fiil taşıyan her cümlede `[n]` var mı; listede olmayan `[n]` ya da kullanılmayan liste maddesi var mı |
| 3c. Alıntı betiği | belirlenimci betik (BLOG) | Her alıntı ham kaynakta (R2.3) normalize edilerek aranır; bulunamayan = DESTEKSİZ. LLM bu adımı yapmaz |
| 3d. Sınıflama | Doğrulayıcı alt ajan | Her iddia için öneri sınıfı: DOĞRULANDI / DESTEKSİZ / ÇELİŞİYOR / BAYAT (alıntı var ama güncel değil) + gerekçe. Birim/dönüşüm, sayının bağlamı (model mi seri mi), cümle içindeki **her iddia ayrı** (K4.1 vakası), olumsuz iddia için açık ifade, 3c'nin `INCELE` çevreleri. **Hüküm BLOG'dadır** (`execution-method-standard.md` §4: alt ajan yargı vermez) |
| 3e. Sabotaj kolu | BLOG, doğrulayıcı bilmeden | Tuzaklar **metnin KOPYASINA** konur (asıl metin tuzaksız kalır; kopya ile asıl arasındaki farkın yalnız tuzak satırları olduğu betikle gösterilir). Her turda **en az 3 tuzak**; **en az biri** betiklerin yakalayamayacağı türden: alıntısı kaynakta birebir geçen ama bağlamı ya da güncelliği yanlış iddia (SSS vakası gibi). Hepsi yakalanmadıkça tur **geçersiz** (emsal: `vitrin-metni-standard.md` K9.7) |
| 3f. Örnekleme | BLOG | DOĞRULANDI satırlarından en az 3'ü BLOG tarafından ham kaynaktan yeniden açılır. **Örneklenen satırlardan biri yanlışsa tur geçersizdir** |
| 3g. Mevzuat kontrolü | MEVZUAT şeridi (R2.6) | `tur: mevzuat` satırlarının her biri yürürlükteki metne karşı: yürürlük, değişiklik, AB/TR takvimi. MEVZUAT "yanlış" ya da "bayat" derse tur geçersizdir |
| 4. Düzeltme | BLOG | DESTEKSİZ / ÇELİŞİYOR / BAYAT satırlar düzeltilir ya da silinir; tuzaklar çıkarılır |
| 5. İkinci tur | aynı doğrulayıcı | **Tüm metin** 3a'dan yeniden geçer (yalnız değişen satırlar değil: düzeltmede eklenen yeni iddia tabloya girmemiş olabilir) |

### R5.1.1 Tur düzeni (BLG-15, yedi turdan ölçülen; kural değil KAYIT DİSİPLİNİ)

1. **Tur klasörü.** Bağımsız doğrulamaya giden klasöre yalnız o turun kopyası (taslak + iddia tablosu + satır listesi)
   konur. Dayanak: BLG-15 tur 1 klasöründe tuzaksız temiz kopya kalmıştı, bağımsızlık bozulmuştu.
2. **Başlıklar içerikten ayrı okunur.** Sahte hatalı kopya yazarın yeni başlıklarını sınamaz; başlıklar ve H3'ler
   bağımsız bir okumadan geçer (BLG-13 tur 2: üç zayıf başlık; BLG-15: sekiz zayıf başlık, ikisi içerik riski).
3. **Yeni başlık eklenince altındaki paragraf yeniden okunur.** Başlık ekleme ya da taşıma, paragrafın zamirini
   ("Bu sınırlar" gibi) başka cümleye bağlayabilir (BLG-15 tur 6: iki yerleşim hatası).
4. **Atıf kümesi ↔ kaynak alanı betikle ölçülür.** İddia tablosunda `kaynak` alanı cümledeki atıf kümesinden üretilir ve
   aralarındaki fark betikle gösterilir; elle okuma yetmez (BLG-15 tur 4: doğrulayıcı iki satır buldu, betik toplam yedi
   satırda eksik gösterdi).

### R5.2 Model ve bağımsızlık

Doğrulayıcı **Opus** alt ajanıdır (`execution-method-standard.md` §5.2: çürütme → opus). Ölçüm
(2026-09-24, bu cetvelin v0.1 çürütmesi, aynı talimat iki kol): birleşik 29 gerçek bulgudan Opus 26,
Fable 18; Fable bir bayat alıntıyı "birebir doğru" onayladı; Fable'ın birim fiyatı 2,5 kat (girdi/çıktı
10/50 $'a 4/20 $ /MTok, platform.claude.com fiyat sayfası ham HTML, BLOG ölçümü 2026-09-24). Fable yalnız
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

İki parça birlikte gider; biri eksikse sunum yapılmamış sayılır:
1. **Önizleme:** yazının sitedeki görünüşüne yakın, okunabilir sayfa: başlık, tarih satırı, bölümler,
   tablolar, SSS, kaynaklar ve teknik sorumluluk notu yerinde (yapay zekâ notu yok — karar 106).
   Sayfa metnin sha256'sının ilk 12 hanesini gösterir; önizlemedeki metin doğrulanan metinle aynıdır.
   Yer: R5.6 rotası; o gelene kadar R5.7.
2. **Özet**, BLOG penceresinde, düz cümleyle: konu ve neden bu konu (R1.2 tablosu), kaynak sayısı ve
   türleri (adresi olmayan üretici belgesi atfı ayrıca), iddia sayısı ve doğrulanan, sabotaj sonucu,
   bağlanan ürün aileleri, emsal yazıyla kıyasta bilerek alınmayanlar ve gerekçesi, tek soru:
   **"yayınlayalım mı?"**
Onay Recep'in kendi sözüyle ve bu pencerede alınır; başka pencereden aktarılan söz onay sayılmaz.

### R5.5 Durum metne bağlıdır; yayındaki yazı revizyonla güncellenir

| Durum | Geçiş şartı | Kayıt |
|---|---|---|
| taslak | — | — |
| doğrulandı | R5.3 tam **ve** 3b/3c betik çıktıları kayıtlı (tablo gelince geçiş DB kısıtıyla bu kayda bağlanır — kapı yayın geçişindedir, yalnız CI'da değil) | **tuzaksız asıl** metnin sha256'sı + doğrulama raporu + betik çıktıları |
| onaylı | Recep sözü; metnin sha256'sı doğrulananla **aynı** | onay kaydı (kim, ne zaman, hangi sha256) + `admin_audit_log` |
| yayında | onaylı sha256 = yayına giden sha256 | `admin_audit_log` |

Metin doğrulamadan sonra **tek karakter** değişirse durum taslağa düşer. Yayındaki yazı güncellenecekse
canlı satır ezilmez, taslağa da çekilmez: güncelleme **ayrı revizyon** olarak aynı akıştan geçer, onaylanınca
yayındaki sürümün yerine geçer; o ana kadar eski sürüm yayında kalır.

**Düzeltme türüne göre tur (BLG-15, sha üç kez değişti).** Doğrulanmış metinde tek karakter değişince sha256 yenilenir ve
durum taslağa düşer; hangi turun koşacağı düzeltmenin türüne bağlıdır:

| Düzeltme | Tur |
|---|---|
| Yalnız doğrulayıcının önerisiyle yapılan düzeltme | değişen satırlar + tam okuma teyit turu |
| Başlık ya da anlam değişikliği | bağımsız TAM okuma |

**Başlık-yalnız revizyon.** Yayındaki yazıda yalnız başlıklar değişecekse: (a) fark kanıtı: eski ve yeni gövde arasındaki
farkın yalnız başlık satırları olduğu betikle gösterilir; (b) `rehber-denetim.mjs` çıktısında eski ve yeni iddia kümesi
aynıdır; (c) iki bağımsız tur (başlıkların okunması + tam okuma). İçerik cümlesi değişiyorsa bu madde uygulanmaz, tam
revizyon (R5.1) gerekir. Dayanak: BLG-13. **Yayın ya da revizyon PR'ında** yazı kaydındaki güncelleme tarihi aynı PR'da
değişir; birleşmeden sonra canlı site haritası `lastmod` değeri ölçülür (BLG-13'te eski kalmıştı, ayrı PR gerekti).

### R5.6 Önizleme

Recep'e giden önizleme yalnız yönetici oturumuyla açılan, `force-dynamic` + `noindex` **ayrı bir
rota**dır. Vitrin rotasına sorgu parametresi (`?onizleme=`) eklenmez: `searchParams` alan sayfa
sessizce dinamikleşir (`rendering-cache-standard.md` §1.1). Dal önizlemeleri kapalıdır ve içerik
zaten veritabanındadır; önizleme için ayrı dağıtım açılmaz. Önizleme **revizyon kimliğini** ve metnin
sha256'sının ilk 12 hanesini gösterir; Recep'in onayladığı metin doğrulananla aynı olmalıdır.

### R5.7 Ara düzen — tablo ve rota gelene kadar (F4)

Bugün prod'da rehber tablosu ve önizleme rotası **yok** (ikinci tur ölçtü). İlk yazı beklemez; yayın bekler:
- Taslak, iddia tablosu, betik çıktıları ve tuzaksız metnin sha256'sı **Kanban kartında (not + depo dışı dosya yolu; eski kayıt Linear REC-369)** tutulur
  (özel; PUBLIC depo değil — R4.8).
- **Onay ara önizlemeyle sorulur; gerçek sayfa yayından sonra gösterilir** (OPS hükmü 2026-10-11; emsal:
  frekans konvertörü yazısı, karar 120 ve 135). Yayın yolu çalışır (`yazilar.ts` → `[yazi]` rotası; frekans
  yazısı canlıda), ama R5.6 önizleme rotası yoktur ve dal önizlemeleri kapalıdır: gerçek sayfa yayından
  önce görülemez. Bu yüzden onay sorusu ara önizleme (aşağıdaki claude.ai sayfası) ve R5.4'ün özetiyle gider;
  önizleme sayfa kabuğunu temsil eder, metin birebirdir. Recep'in "evet"i yayına girme iznidir; yayından
  sonra gerçek sayfa Recep'e ayrıca gösterilir, kabuk ya da görsel farkı varsa ayrı iş olur.
- ⛔**Sınır aynıdır: yayına giremeyecek metnin onayı sorulmaz** (Recep, 2026-09-24: "sayfa yapılmadı, ürün
  bekliyor, hem de 105 bir karar; ya verin ya doğru anlatın" → karar 105 geri çekildi); "senden beklenen"
  diye sunulamaz. Soru gitmeden önce yayın yolunun BU metin için çalıştığı ölçülmüş olmalıdır: bağlantı
  kimlikleri güncel slug'a çözülür (kimlik eskiyse derleme durur; ölçü: son aile/kategori yeniden adlandırma
  migration'ının eski-yeni çiftleri), yayını bloke eden açık karar yoktur ya da tarihi OPS'ta yazılıdır.
  Doğrulanmış metnin sha256'sı soru ile yayın arasında değişirse (bağlantı kimliği güncellemesi dahil) yeni
  sha256 ve fark soruda gösterilir; R5.5 uyarınca durum taslağa düşer, bağımsız tur yeniden koşar.
- Ara önizleme rota gelene kadar **özel bir claude.ai sayfasıdır** (Artifact; varsayılan olarak
  yalnız sahibine açık, arama motoruna kapalı — R4.8'i çiğnemez). Sayfa doğrulanan markdown'dan üretilir,
  sha256'nın ilk 12 hanesini gösterir; metin değişirse sayfa aynı adreste yeniden yayınlanır.
  ⚠Sitenin kendi bileşenleri değildir: yazı düzeni ve metin birebirdir, sayfa kabuğu (menü, alt bilgi,
  ürün kartı) temsilîdir ve sayfada bu yazılır.
- Onaylanan sha256, tablo geldiğinde yazının ilk revizyonu olarak yazılır; farklıysa akış baştan.
- Bağımlı işler (sırasıyla, URUN): karar 92 rotası + rehber tablosu migration'ı (kural 13) → önizleme
  rotası. Hepsi REC-369 (Linear, donuk arşiv) altında izlenmişti; yeni izleme BLOG'un Kanban kartında (karar 219; kart numarası BLOG kartı açınca buraya yazılır).

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
| JSON-LD: `Article` + `BreadcrumbList`; BreadcrumbList **tek kaynaktan** (`buildBreadcrumbJsonLd`) | Google: *"Article objects must be based on one of the following schema.org types: Article, NewsArticle, BlogPosting."* (ham HTML, "Last updated 2026-09-08"). `TechArticle` bu listede yok; schema.org'da Article'ın alt türüdür ve Google'ın alt türü kabul edip etmediği **ölçülmedi** — bu yüzden `Article`. Önerilen alanlar: `author` (`author.name` + `author.url` dahil), `dateModified`, `datePublished`, `headline`, `image` |
| **`FAQPage` işaretlemesi konmaz** | Google SSS zengin sonucunu kaldırdı: *"This feature will no longer appear in Google Search starting May 7, 2026."* (developers.google.com/search/updates, ham HTML). SSS bölümü okuyucu için kalır |
| Site haritasında her yayındaki yazı; `lastmod` = güncelleme tarihi; `alternates` yalnız iki dil de yayındaysa | Bugünkü `sitemap.ts` her satıra koşulsuz tr+en alternates yazıyor |
| `hreflang` yalnız iki dil de varsa; kanonik adres tek | `canonical-url-standard.md` |
| `EN_YAYIN` kapalıyken `/en/knowledge-hub` rotası üretilmez; bugünkü 5 EN bilgi merkezi adresi EN karşılığına kalıcı yönlendirilir; bayrak açılınca rota ve yönlendirme birlikte değişir | R3 dil kuralı; "404'e düşen adres 0" (R0.1) EN tarafında da geçerli |
| Bağlantılar `useLocalizedRoutes` ile (`Routes`'a `bilgiMerkezi` girişi); elle `/tr/` eklenmez | CLAUDE.md kural 7 |
| **Kiracı:** rota kiracıyı `DEFAULT_TENANT_ID`'den çözer (`headers()` değil); önbellek anahtarı `lang` **ve** `tenantId`; `UNIQUE (tenant_id, dil, slug)`; servis DI (kural 2) + `React.cache` (kural 6) | Kural 12; `headers()` rotayı sessizce dinamikleştirir (`rendering-cache-standard.md` §1.1) |
| **Veri ve yetki:** yayındaki metin ile iç veri (iddia tablosu, doğrulama raporu, dizin kanıtı, onay kaydı) **ayrı tablolarda**; ziyaretçi rolü yalnız yayındaki metin tablosunu, yalnız `yayında` satırları okur; durum **dil başına**; yeni tablolarda `anon`/`authenticated` yazma yetkisi REVOKE; ziyaretçi rolüyle üç kollu test (yayındaki okunur · taslak okunmaz · yazma reddedilir) | RLS satırı süzer, sütunu süzmez (`vitrin-metni-standard.md` K1 dersi). Prod `public` şemasında yeni tablonun varsayılan yetkisi `anon=arwdDxtm` (BLOG ölçümü, `pg_default_acl`, 2026-09-24). ⚠**Kural 7 sapması, bilerek:** kural 7 DB çevirilerini JSONB ister; dil başına durum gerektiği için (TR yayındayken EN taslağı sızmasın) metin **dil başına satır** tutulur. Sapma migration PR'ında gerekçesiyle yazılır |
| **Tazeleme, aynı PR'da:** `rendering-cache-standard.md` §3 **ana** tablosuna satır (INV-RENDER-2 §3'ü ilk alt başlıkta keser) + tetik (migration **ve** `scripts/webhook_setup.sql`) + handler dalı + `revalidatePath('/sitemap.xml')`. **Ters yön:** yazıda görünen aile/kategori değişince yazı yolu da tazelenir (§3.1 sorusu) | INV-RENDER-2 tablo listesini §3 tablosundan okur; satırı olmayan yeni tabloyu **görmez** — "tablo gelince otomatik" DEĞİL |
| Migration kural 13 (Recep onayı, URUN penceresi) | Migration merge = prod |

## R7 — Ölçüm (yayından sonra)

Yayın günü ve sonrasındaki sıra, sahip ve kapılar **R10'dadır** (B10–B16); bu bölüm ölçülecek şeyleri
tanımlar. Gün sayıları: 3. gün (B13), 7. gün (B14, aşağıdaki "1. hafta"), 14. gün (B15; ilk gösterim ve sıra).

- **1. hafta:** indekslendi mi (Search Console URL denetimi) + bot karnesi (`scripts/seo/bot-karnesi.mjs`)
  yazı adresinde temiz mi.
- **4 hafta, haftalık:** sayfa bazında gösterim, tık, ortalama sıra; hedef küme sorguları.
- **Aylık kaynak bakımı:** her yayındaki yazının kaynakları R2.3 betiğiyle yeniden çekilir; son adres,
  durum ya da sha256 değişen kaynak → yazı "gözden geçir" listesine; ölü kaynağın iddiası yeni kaynağa
  bağlanır ya da kalkar.
- **Taban:** F1 küme rakamları (Ölçüm geçmişi, A sınıfı). Kıyas aynı sorgu ve aynı gün sayısıyla yapılır.
- Sayısal hedef yazılmadı: 25 günlük, 448 gösterimlik tabanla hedef koymak tahmin olurdu. İlk dört
  yazının ölçümü tabanı oluşturur.
- Sorgu listeleri PUBLIC depoya girmez; depoya yalnız özet sayılar, sorgular Kanban kartına (depo dışı dosya yolu).

## R8 — Kapılar

### R8.1 Her kapı onu gerektiren PR'da doğar

Kapılar "ilk yazıdan önce bir gün" kurulmaz: her kapı, koruduğu şeyi getiren PR'ın içinde doğar
(kural 14) ve en az bir sabotaj koluyla kırmızı yandığı gösterilmeden kapı sayılmaz
(`rendering-cache-standard.md` §3 dersi). Bugün var olanlar: INV-REHBER-DENETIM-1 ve INV-REHBER-ALINTI-1
(`scripts/rehber/__tests__/`, vitest `ci` işinde; betiklerin **kendi** doğruluğunu sınar).
⚠**Betik testleri yazıyı denetlemez.** Yazının kendisi ancak yayın geçişi betik çıktısına bağlanınca
(R5.5, tablo kısıtı) kapı altına girer; o güne kadar ara düzende (R5.7) betikler elle koşar ve çıktıları
Kanban kartına not + depo dışı dosya yolu olarak girer.
⚠**Kapının koştuğu ortam:** DB kapıları (ziyaretçi rolü, durum ↔ sha256) prod'a değil **Supabase dalına**
karşı koşar — tablo ancak merge'ten sonra prod'da olur. SSR kapısı yayında yazı yokken **fikstür yazıyla**
koşar; site haritasından temsilci seçen kapı boş evrende sessiz yeşil verir.

| Kapı | Ne ölçer | Hangi PR'da doğar | Sahip |
|---|---|---|---|
| Atıf betiği (R5.1 3b) | numarasız iddia cümlesi 0; metin ↔ liste birebir | BLOG doğrulama betikleri PR'ı | BLOG |
| Kalıp (R3 zorunlu bölümler) | tek H1; en az bir tablo; `## Fiyatı belirleyen etkenler`, `## Sık sorulan sorular` (5–8 soru), `## Kaynaklar`, `## Teknik sorumluluk notu` var; not sabit cümleyle başlar. **Var** (v0.4, `kalipDenetle`); sabotaj kolu: 09-24 vakasının birebir benzeri iki kırmızı verir, onaya sunulmuş ilk metin (sha f29ab1c35e26) gerçek çalıştırmada aynı iki kırmızıyı verdi | BLOG kalıp kapısı PR'ı | BLOG |
| İç bağlantı — metin (R3) | metinde düz site adresi 0 (mutlak, göreli, çıplak); kimlik biçimi `vh:<tür>/<anahtar>`. **Var** (v0.4, `icBaglantiDenetle`, `denetle` içinde; INV-REHBER-IC-BAGLANTI-1) | BLOG kalıp kapısı PR'ı | BLOG |
| İç bağlantı — canlı (R3) | yayındaki her rehber yazısının gövdesindeki site içi bağlantı **doğrudan 200**; 3xx ve 404 KIRMIZI (yönlendirme izlenmez); yayında yazı yoksa `EVREN-BOS` (çıkış 3), temiz değil. **Betik var** (`scripts/rehber/ic-baglanti-denetle.mjs`, ağlı); ölçüldü 2026-09-24: site haritasında yazı 0 → EVREN-BOS; önizlemenin 5 bağlantısı 200; sabotaj: kök adres 308 → KIRMIZI. **Zamanlı koşu ve adres yayınından (REC-300) sonra koşturma ALTYAPI'da** | BLOG kalıp kapısı PR'ı (betik) · ALTYAPI (bağlama) | BLOG + ALTYAPI |
| Başlık yapısı (R11) | zorunlu bölümler hariç H2'lerin yarısından azı konu terimi taşıyorsa `BASLIK-KONU-ORANI`, %60'ından fazlası konu terimlerinin tamamını taşıyorsa `BASLIK-TEKRAR`; **UYARI, kırmızı değil** (eşikler bizimdir, resmî eşik yok: R11.2). **Var** (v0.9, `baslikDenetle`, `denetle` çıktısında `uyari` dizisi); sabotaj kolu her sınıfı bilerek bozulmuş örnekte yakalar | BLOG başlık kuralı PR'ı (BLG-12) | BLOG |
| Alıntı betiği (R5.1 3c) | alıntı ham kaynakta; son adres/durum/sha256 kaydı | BLOG doğrulama betikleri PR'ı | BLOG |
| Not deseni (R4.4) | K2 sınıfı not 0 (R8.2) | BLOG doğrulama betikleri PR'ı ya da tablo kısıtı (migration PR'ı) | BLOG + URUN |
| Vaat / rakip / fiyat deseni (R4.2, R4.3, R3) | "en iyi", "%100", "garanti"; rakip ad listesi (Kanban kartı/depo dışı dosyadan, depoya girmez); `₺ TL € EUR USD` + rakam = 0 | BLOG doğrulama betikleri PR'ı | BLOG |
| Olumsuz iddia (R4.5) | olumsuz fiilli her cümle iddia tablosunda `tur = olumsuz` + açık alıntı | BLOG doğrulama betikleri PR'ı | BLOG |
| Mevzuat (R4.6) | "zorunlu/yasaktır/yönetmelik" cümlesi → resmî kaynak + yürürlük tarihi | BLOG doğrulama betikleri PR'ı | BLOG |
| Toplu üretim (R4.1) | 7 günde yayına geçen **yeni** yazı sayısı > eşik → KIRMIZI (revizyon sayılmaz; eşik Recep'in ritim tercihidir, öneri 2); her yayında doğrulama + onay kaydı | migration PR'ı (onay kaydı) | URUN + BLOG |
| Durum ↔ sha256 (R5.5) | onaylı/yayında sha256 = doğrulanan sha256 | migration PR'ı | URUN |
| Ziyaretçi rolü (R6) | yayındaki okunur · taslak okunmaz · yazma reddedilir · iç tablo okunmaz | migration PR'ı | URUN |
| Sunucu HTML (R6) | bailout 0; gövde ifadeleri sunucu HTML'inde | rota PR'ı (`ssr-kurallari.ts`) | URUN |
| JSON-LD + site haritası (R6) | `Article` + `BreadcrumbList` tek; haritada; FAQPage yok | rota PR'ı | URUN |
| Tazeleme (R6) | §3 satırı + tetik + handler; **site haritası dalı için INV-RENDER-2'de ayrı kol** (bugün testte "sitemap" 0 kez geçiyor — ikinci tur ölçtü) | migration PR'ı | URUN (+ ALTYAPI kol) |
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
kadar; sonra ölçüme göre artırılır. Üst sınır R8.1'deki toplu üretim kapısıdır (önerilen eşik 7 günde
2 yeni yazı; revizyon sayılmaz). Karar 92 taşımasında eski konular **kaldırılıp yönlendirilir**, yeniden
yazımları bu ritme ve R1.4 sırasına girer (karar 121: eski metinden alıntı yok, sıfırdan). Ritim ve eşik Recep'in tercihidir; bu satır öneridir.

## R10 — Yayın akışı: yazı fikrinden 14. gün ölçümüne tek şema (BLG-11, 2026-10-13)

**Niçin var.** Yayından önceki kurallar R5.1, R5.7 ve R8.1'de, yayından sonrakiler R7'de ve
`yayin-gorunurluk-denetim-standard.md` Y2'de duruyordu; yayın anından canlı doğrulamaya, dizin isteğine
ve IndexNow'a kadar uzanan halkaları sıraya koyan **tek yer yoktu**. Ölçülen sonucu: ilk iki yazıda zincir elle
kuruldu; radyal/aksiyel yazısında Google isteği yapıldı, Bing/IndexNow yapılmadı ("anahtar yok" sanıldı;
anahtar dosyası `public/` altında, depoda ve canlıda 200 idi). Bu bölüm yeni kural koymaz, **mevcut kuralları
tek sıraya dizer, her basamağa sahibini ve kapısını yazar, eksik halkayı ADIYLA gösterir**.
Çelişirse ilgili R maddesi kazanır (burası haritadır); çelişki bu bölüme düzeltme olarak yazılır.

**Okuma kuralı.** Her basamakta üç şey yazılıdır: kim yapar (SAHİBİ), neyle ölçülür (KAPI) ve nereye
kaydedilir (KAYIT). Kapısı olmayan basamak "kapı yok" diye açıkça yazılır, boş bırakılmaz. **Aday** kapı
yazılmamış kapıdır; var sayılmaz (R8.1).

### R10.1 Şema

```mermaid
flowchart TD
  subgraph ONCE["Yayından önce (BLOG)"]
    B1["B1 Konu seçimi<br/>R1"] --> B2["B2 Kaynak ve mevzuat paketi<br/>R2, R2.6"]
    B2 --> B3["B3 Taslak + iddia tablosu<br/>R3, R5.1 adım 2"]
    B3 --> B4["B4 Yayın yolu ölçümü<br/>R5.7"]
    B4 --> B5["B5 Doğrulama turu<br/>R5.1 3a–3g"]
    B5 -->|"R5.3 kırmızı"| B6["B6 Düzeltme + tam yeniden tur<br/>R5.1 adım 4–5"]
    B6 --> B5
    B5 -->|"R5.3 temiz"| B7["B7 Önizleme + onay<br/>R5.4, R5.7"]
  end
  B7 -->|"onay"| B8["B8 Yazı kaydı + PR + kapılar<br/>R6, R8"]
  B7 -->|"değişiklik"| B3
  B8 --> B9["B9 OPS'a göster, birleşme"]
  B9 --> B10["B10 Canlı doğrulama<br/>200, harita, liste kartı"]
  B10 --> B11["B11 Google dizin isteği<br/>GEO-SEO"]
  B10 --> B12["B12 IndexNow (Bing)<br/>GEO-SEO"]
  B11 --> B13["B13 3. gün ölçüm"]
  B12 --> B13
  B13 --> B14["B14 7. gün ölçüm"]
  B14 --> B15["B15 14. gün ölçüm"]
  B15 --> B16["B16 Aylık kaynak bakımı<br/>R7"]
  B16 -.->|"değişen kaynak"| REV["Revizyon R5.5 → B5"]
```

| Basamak | Ne yapılır | Sahibi | Kapı (neyle ölçülür) | Olmazsa | Kayıt |
|---|---|---|---|---|---|
| **B1** Konu seçimi | R1.2 ölçüt tablosu; konu başına tek yazı (R1.3); sıra R1.4 | BLOG önerir, Recep sırayı belirler | R1.3 tek yazı/konu. Toplu üretim kapısı (R4.1, R8.1) henüz yok; ritim R9 | konu elenir ya da başka yazıyla birleşir | Kanban kartı (BLG-n) + R1.2 tablosu karta not |
| **B2** Kaynak ve mevzuat paketi | Araştırmacı alt ajan (salt-okuma) kaynakları açar: erişim sınıfı (R2.2), ham alıntı (R2.3); mevzuat iddiası MEVZUAT paketinden (R2.6 adım 1) | BLOG + MEVZUAT | `alinti-dogrula.mjs` KALDI 0; açılamayan kaynak 0 (R5.3) | kaynak elenir, iddia düşer; kaynak yoksa yazı yazılmaz | depo dışı klasör + karta not (R5.7) |
| **B3** Taslak + iddia tablosu | R3 kalıbı; her iddia → kaynak no + birebir alıntı + tür; mevzuat yalnız paketten (R2.6 adım 2) | BLOG | `rehber-denetim.mjs` kırmızı 0 (kalıp, atıf, iç bağlantı-metin, vaat, olumsuz iddia, mevzuat). Adaylar: K0, K0b, K1, K3, K4, K5 (R10.2) | kırmızı 0 olmadan B5'e gidilmez | depo dışı taslak + iddia tablosu + betik çıktısı |
| **B4** Yayın yolu ölçümü | Bağlanan aile ve kategori kimlikleri güncel slug'a çözülür (son yeniden adlandırma migration'ının eski-yeni çiftleri); site içi bağlantı hedefleri canlıda 200; yayını bloke eden açık karar yok | BLOG | R5.7 kimlik şartı; `ic-baglanti-denetle.mjs` (hedefler); açık karar yok | derleme durur; onay sorulmaz (R5.7 sınırı) | karta not: komut + çıktı |
| **B5** Doğrulama turu | 3a kapsam çıkarımı (tabloyu görmeden), 3b atıf betiği, 3c alıntı betiği, 3d sınıflama, 3e sabotaj kolu (tuzak yalnız kopyada), 3f örnekleme, 3g MEVZUAT kontrolü | BLOG (doğrulayıcı alt ajanlar bağımsız; hüküm BLOG'da); 3g MEVZUAT | R5.3: eşlenmeyen 0 · DESTEKSİZ 0 · ÇELİŞİYOR 0 · BAYAT 0 · açılamayan 0 · sabotaj N/N (N ≥ 3) | B6 | karta tur notu: tur no, kırmızı sayısı, tuzak sayısı ve yakalanan |
| **B6** Düzeltme + tam yeniden tur | R5.1 adım 4–5: düzelt, tuzakları çıkar, **tüm metin** yeniden 3a'dan geçer | BLOG | R5.1 adım 5 ("tüm metin"); tur sayacı (R10.3) | tur sayısı 3'ü aşarsa kök sebep notu: her bulgunun hangi aday kapıyla yakalanacağı (R10.2) | karta tur notu |
| **B7** Önizleme + onay | R5.4 iki parça: önizleme (sha256 ilk 12 hane) + düz cümle özet; tek soru "yayınlayalım mı?" | BLOG sunar, Recep onaylar (kendi sözü, bu pencerede) | sha256 doğrulananla aynı; yayına giremeyecek metnin onayı sorulmaz (R5.7) | metin değişirse durum taslak, B5 | durum dosyası + karta onay kaydı (kim, ne zaman, sha256) |
| **B8** Yazı kaydı + PR | Yazı `src/data/bilgiMerkezi/yazilar.ts` kaydına girer (kimlik, konu, `yayinTarihi`, `guncellemeTarihi`, ürün bağları; dil başına slug, özet, `kartOzeti`, gövde); ters bağlantı (R3.2); PR gövdesinde `Kanban:` satırı **ve R10.6 yayın öncesi kontrol tablosu (sekiz madde, her madde kanıtlı; kanıtsız madde AÇIK, yayın çıkmaz)**; **PR açılınca yazı adresi GEO-SEO'ya SendMessage ile verilir** (yayın öncesi taban B9'dan önce GEO-SEO'da alınır) | BLOG; şablon ya da rota değişirse URUN | PR kapıları (`ci`, `admin-smoke`…); `pnpm test:ilgili`; INV-REHBER-* testleri; migration varsa Recep onayı | kırmızı kapı BLOG yüzeyindeyse düzeltilir; değilse 10 dakika sınırı sonra OPS'a yazılır | PR + karta not |
| **B9** Birleşme | PR birleşmeden önce OPS'a gösterilir; `scripts/hijyen/merge-ritueli.cjs <PR> <dal> --agac=<yol> --merge` | OPS onaylar; ritüeli emri veren pencere koşar | ritüel çıkış 0; `mergeStateStatus` CLEAN; `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge` 204; karta "GEO-SEO taban aldı" notu (ne zaman gerektiği ve kip: Y2.1) | birleşme yapılmaz; kırmızı kapı B8'e döner | karta PR no + birleşme ölçümü |
| **B10** Canlı doğrulama | Dağıtım bitince: yazı adresi **200**; site haritasında adres, `lastmod` = yayın tarihi; bilgi merkezi liste kartı **tarayıcı bölmesiyle** görülür (ham HTML yetmez); ters bağlantı yerinde; iç bağlantılar doğrudan 200 | BLOG | `curl` 200; harita satırı; `ic-baglanti-denetle.mjs`; `bot-karnesi.mjs` yazı adresinde temiz | düzeltme R5.5 revizyonu; B11–B12 başlamaz | karta not: adres, 200, `lastmod`, liste kartı (tarayıcı). ⚠Kart doğrulayıcısı `curl` ve kabuk operatörünü reddeder: "canlı 200" ölçütü elle işaretlenir, kanıt kart notundadır |
| **B11** Google dizin isteği | B10'dan sonra **aynı tur**. Metin, kapı, komut ve süre sınırı **tek kaynakta**: `yayin-gorunurluk-denetim-standard.md` Y2 ("her yeni yazı ya da düzeltilmiş sayfa yayını" satırı; genişletme Y2.1, GEO-SEO'nun SEO-45 PR'ı). R10 yalnız sırayı gösterir, burada yeniden yazılmaz | GEO-SEO (Recep'ten ayrıca onay istenmez) | Y2 | Y2 | Y2'nin kayıt kuralı; kart notunda B11 kaydı aranır (R10.3) |
| **B12** IndexNow ve Bing | B11 ile aynı tur. Aynı kaynak: Y2 (IndexNow, Bing Webmaster, kip ve günlük sınır). R10'da komut satırı, kip ya da anahtar dosyası yolu yazılmaz | GEO-SEO | Y2 | Y2 | Y2'nin kayıt kuralı; kart notunda B12 kaydı aranır (R10.3) |
| **B13** 3. gün | Ölçüm içeriği Y2'de (gün sayıları ve evren orada) | GEO-SEO | Y2; kıyas ölçütü R7 | Y2; düzeltme gerekirse BLOG'a SendMessage | karta tek satır + sayı; satır biçimi Y2.1 |
| **B14** 7. gün | R7 "1. hafta" ölçütleri; ölçüm koşusu Y2'de | GEO-SEO ölçer, BLOG yorumlar | R7 | sorun varsa R5.5 revizyonu | karta tek satır + sayı; satır biçimi Y2.1 |
| **B15** 14. gün | R7 taban kıyası ve "4 hafta" ölçümü; koşu Y2'de | GEO-SEO | R7 taban kıyası (aynı sorgu, aynı gün sayısı) | konu kümesi tekrar değerlendirilir (R1) | karta özet sayı; ham çıktı depo dışı, yolu satırda |
| **B16** Aylık kaynak bakımı | Yayındaki her yazının kaynakları R2.3 betiğiyle yeniden çekilir | BLOG | `alinti-dogrula.mjs`: son adres, durum, sha256 değişti mi | "gözden geçir" listesi → R5.5 revizyonu | karta not |

### R10.2 BLG-10 bulgularından çıkan kapılar şemada nerede durur

Kaynak: `docs/audits/blg3-bulgu-tablosu-2026-10.md` (59 bulgu; mevcut kapı hiçbirine hüküm vermedi). Aşağıdaki
adayların **hiçbiri yazılmadı**; "Nerede doğar" sütunu R8.1'e göredir (kapı, koruduğu şeyi getiren PR'da doğar
ve sabotajla kırmızı yanmadan kapı sayılmaz).

| Aday | Ne ölçer | Basamak | Durum | Nerede doğar |
|---|---|---|---|---|
| K0 | Her turda `rehber-denetim.mjs` çıktısı tur kaydına yazılır; uzun mevzuat cümlesinin tabloda parça parça girilmesi alt dizi eşleşmesi nedeniyle yanlış kırmızı vermez | B3, B5 | aday | BLG-7 onarımı (#1791) ya da ayrı kapı PR'ı |
| K0b | `MEVZUAT` deseni tüzük, direktif ve karar numarası kalıplarını (2024/1834, 2014/34/AB) kapsar | B3 | aday (desen bugün "tüzük" ve "direktif" içermiyor, ölçüldü) | BLG-7 |
| K1 | İddia tablosunda zorunlu `kapsam` alanı (seri, model, ortam, uygulama noktası); niceleyici cümlede alıntının aynı kapsamı söylediği gösterilmezse kırmızı | B3, B5 | aday | iddia şeması değişikliği (BLG-10 adım 2 cetvel maddesiyle birlikte) |
| K2 | Mevzuat cümlesinde AB ve TR takvimi ayrı alan; değiştiren tüzük no ve 3g sonucu zorunlu | B3, B5 | aday | `tur: mevzuat` şeması (MEVZUAT ile) |
| K3 | Künye alanları (başlık, yıl, sayfa, madde no, erişim tarihi) kaynak dizini manifestosundan doldurulur; yazı listesi ↔ manifest farkı betikle ölçülür | B3 | aday | BLOG betik PR'ı |
| K4 | Alıntıdaki kesinlik sözcüğü (suggest, can, may, widely, must) Türkçe karşılığıyla sözlükte eşlenir; kesinlik değişimi `INCELE` | B3, B5 | aday | `alinti-dogrula.mjs` INCELE kolu; yanlış pozitif ölçümüyle |
| K5 | `genel` tür yalnız tanım ve akıl yürütme taşır; site kapsamı ve canlı olgu iddiasında `canli_olcum` alanı; öneri fiilinde yan cümle atfı | B3, B5 | aday | iddia şeması + `rehber-denetim.mjs` |

K0–K5'in etiketli satır sayıları yakalayacakları sayı değildir (BLG-10 §6): kapı yazılıp sabotajla sınanana
kadar bu bölümde sayı iddia edilmez. Cetvel maddeleri (R5.1 3d'ye "kapsam" ve "aralık mı ayrık mı" alt
maddeleri, R2.4'e yıl ve madde numarası, R2.6 paketine "kapsam dışı koşulları", R4'e site kapsamı iddiasının
canlı ölçülmesi, R5.1 adım 2'de `genel` türün sınırı) BLG-10 adım 2'de bu cetvele girer; burada tekrar yazılmaz.

### R10.3 Ölçütler

- **Tur sayısı:** üçüncü yazıda B5–B6 toplamı ≤ 3 tur (BLG-3'te 10 tur sürdü). Ölçü, her turun karttaki
  tur notundan okunur. Hangi adayların yazıldığına bağlıdır; yazılmayan aday için ölçü verilmez.
  **ÖLÇÜLDÜ (BLG-15, 2026-10-18): B5–B6 toplamı 7 tur, hedef (≤3) KARŞILANMADI.** Hiçbir aday kapı (K0–K5) yazılmamıştı,
  bu yüzden ölçü kapıların etkisini göstermez; ayrıca BLG-15 mevzuat ağırdı (116 iddia satırı, Yönetmelik ek tabloları
  görüntüden okundu, AB dar ek). Turlarda bulunan gerçek hata kalıpları R5.1.1 ve R2.6'ya yazıldı.
  Hedef kalkmadı: R5.1.1 ve R2.6 maddeleri sonraki yazıda sınanır.
- **Yazı kartının kapanışı:** yazı kartı Done'a B10, B11 ve B12 kayıtları kartta olmadan taşınmaz
  (kanıt: kart notunda canlı 200, Search Console isteği, IndexNow yanıtı). Frekans yazısında bu halka
  eksik kaldığı için bu madde var.
- **Skill:** bu akış `.claude/skills/rehber-yayin` ile yönlendirilir (BLG-11 adım 3); tetiği Türkçe doğal
  ifadelerdir ("yeni yazı", "blog yazısı", "rehber yazısı", "yazı yayınlandı", "yazı yayına çıkıyor",
  "dizine ekle"). Tetiğin gerçekten çalıştığı OPS-124 pilotunda ölçülür; ölçülmeden "çalışıyor" yazılmaz.

### R10.4 Açık noktalar (sahibi belli)

| Nokta | Sahibi | Durum |
|---|---|---|
| B11–B15 metni, kapıları ve komutları | GEO-SEO (Y2'nin sahibi) | **ONAYLANDI (GEO-SEO, 13 Ekim): şema doğru, kapı komutları betiklerle uyuşuyor.** Tek kaynak `yayin-gorunurluk-denetim-standard.md` Y2 (genişletme Y2.1: aynı tur, Bing Webmaster, IndexNow kipi, günlük sınır, öncelik, satır biçimi). R10 yalnız sıra, sahip ve bağlantı taşır; Y2'yi BLOG değiştirmez |
| Y2.1'den R10'a bağ | GEO-SEO | Kabul edildi; Y2.1 PR'ında (SEO-45, OPS onayı ve #1917 birleşmesi sonrası) konur. Numara kesinleşince bu satır numarayla güncellenir |
| EN yayını (`EN_YAYIN`) açılınca B10–B12 EN adresleri için tekrarlanır | GEO-SEO + URUN | bayrak kapalı, kapsam dışı |

### R10.5 Önceki yazıların ders listesi (yeni yazı başlarken OKUNUR)

Yeni bir rehber yazısına başlarken işbaşı notuna bu listenin okunduğu yazılır. Her satır ölçülmüş bir olaya dayanır;
kapıya dönen ders yoktur (K0–K5 aday); hangisinin kapıya çevrilebileceği R10.6'da önerilir. Her ders "Yer" sütunundaki
basamakta uygulanır; uygulandığı B8 öncesinde R10.6 tablosuyla kanıtlanır.

| Ders | Yer | Dayanak |
|---|---|---|
| Ürün/kategori sayfası yalnız durum koduyla değil **içeriğiyle** ölçülür; sayfadaki sayılar yazıdaki tabloyla karşılaştırılır, fark KATALOG/ÜRÜN'e kartla gider | B4, B10 | BLG-15: ürün sayfası AC modellerde 26,1/25/30,7/40,2/40,1/45,4 dB(A) verirken katalog farklıydı |
| Yazının canlıdan ölçümü sırasında yan dosya yolu: Git Bash `/tmp` ile Node `/tmp` AYNI klasör DEĞİL; ölçüm dosyası scratchpad'e yazılır | B10 | BLG-15: Node başka oturumun eski dosyasını okudu |
| Birleşmeden sonra `verify_completion` kanıt komutu ana dizindeki dosyaya bakar; ana dizin master'ı almadan kırmızı verir | B10, kart kapanışı | BLG-15 kapanışı |
| Yeni yazı ana sayfa kartını artırırsa axe belirsiz-kontrast tavanı etkilenir (ana sayfa son 3 rehber kartını basar; BLG-15 ile 19 → 21, OPS 16 Ekim); PR'dan ÖNCE tavan etkisi ölçülür | B8 | BLG-3 (17 → 19), BLG-15 (19 → 21) |
| Test fikstürleri yeni yazıyla değişir: sahte katalog (aile, kategori), site haritası altın dosyası (`src/app/__tests__/fixtures/sitemapAltin.json`) ve `sitemapAdresUret.test.ts` satır sayıları, rota-dili conformance fikstürü (`rota-dili-kapali-2-oncesi.json`); geri bağlantı testi "rehber yok → null" notu | B8 | BLG-15 PR'ı ilk çalıştırmada üç yerde kırmızıydı; BLG-18'de site haritası testleri (24 → 25, 44 → 45) ve rota-dili fikstürü yeniden kırmızıydı |
| Ana sayfa Bilgi bloğu yalnız en yeni 3 rehberi basar (`enYeniRehberler` adet = 3): dördüncü yazıyla en eski rehber bloktan çıkar; bloğun tüm yazıları basmasını bekleyen testler (`kartOzetiYuzeyler`, `kartNosnippet`) bloğun gösterdiği kümeye göre yazılır, yazı sayısına göre değil | B8 | BLG-18: dördüncü yazı eklenince iki test kırıldı (frekans rehberi bloktan çıktı) |
| **Rehber kartı yazının meta açıklamasını kopyalamaz.** Kategori, aile ve ana sayfa kartı `kartOzeti` basar (ayrı, kısa yönlendirme cümlesi, `data-nosnippet` içinde); meta açıklaması (`ozet`) kartta ve rehber kutusunda görünmez. Başlık, meta açıklaması ve `kartOzeti` yazıyı gösterecek kategori ve aile sayfalarının metniyle çakışmaz (3'lü kelime dizilimi ortak sayısı canlı sayfadan ölçülür) | B3, B4, B8 | Sessiz fan rehberi (BLG-15): 18–22 Ekim ölçümünde rehber 0 gösterim aldı; rehber kutusu yazının meta açıklamasını kopyaladığı için Google kategori ve ürün sayfasını rehber başlığıyla gösterdi. Düzeltme URN-140: `kartOzeti` alanı, `data-nosnippet`, INV-BILGI-MERKEZI-KART-3 (PR #2043). BLG-18'de ölçüm: kartOzeti ve başlık canlı kategori ve üç aile sayfasıyla ortak 3'lü dizilim 0/9 (başlıkta yalnız konu terimi) |
| Katalog sayısı ile canlı ürün sayfası sayısı karşılaştırılırken **ailenin bölünüp bölünmediği** de bakılır; katalogdaki seri adı (ör. CA V0) canlıda hangi ailede olduğu ölçülür, olmayan seri adı yazıdaki sayıyla sitedeki sayfayı eşleştirmez | B4, B10 | BLG-18: radon "8 model" (katalog [6] s.8) ile canlı "5 model" ilk okumada fark sanıldı; canlıda iki aile var: kanal 5 (CA-RM ES) + çatı 3 (CA-RM RF ES) = 8. Gerçek fark: sitede CA V0 yok, In-Line yuvarlak aile CA MD (7 model; katalogda CA MD 8) |
| Kategori `hide_price` ise aile sayfasında görünür fiyat yoktur ("Teklif İste"), ama gömülü RSC verisinde ürün fiyatı bulunabilir; "fiyat yalnız ürün sayfasında görünür" (R3) varsayımı bu kategoride YANLIŞTIR. Yazıda fiyat cümlesi yazılmadan önce canlı aile sayfasında ölçülür (₺/TL sayısı, "Teklif" sayısı) | B3, B4 | BLG-18: kanal-tipi-fanlar altında 6 aile sayfasında görünür metinde ₺/TL 0, "Teklif" 12 (curl, script/style çıkarılmış, 25 Ekim); Lineo ve In-Line aile sayfalarının gömülü RSC verisinde fiyat var, radon sayfalarında yok. Yazı "Bu yazıda fiyat verilmez; teklif isteyin" der. RSC fiyatı için karar KATALOG/ÜRÜN'de |
| Üretici/DOE belgesi sayfa künyesi **sayfada yazılı numaradan** ölçülür: DOE sourcebook'ta basılı numara = PDF indeksi − 3 (ilk varsayım −4 künyeyi kaydırdı); belgede basılı numara yoksa (radon belgesi) PDF sırası yazılır ve künye notuna eklenir; Vortice CA katalog başlığı "centrifugal", gövde metni "mixed flow" olabilir, akış türü seri adından çıkarılmaz | B2, B3, B5 | BLG-18 tur 1 ve tur 2 temiz kopya bulguları |
| **Tuzaklı kopya yanında temiz kopya zorunludur.** Tuzaklı kopya doğrulayıcının çalıştığını gösterir (BLG-18'de beş turun beşinde 4/4–5/5 tuzak yakalandı); yazının gerçek hatalarını (örtük fiyat nedenselliği, kaynak kapsamını aşan "ölçüt" çerçevesi, olumsuz iddia, "aynı seri") temiz kopyayı okuyan doğrulayıcı buldu. Zorunlu başlık `## Fiyatı belirleyen etkenler` birebir kalır; kaynaklar fiyatı anlatmıyorsa altı bunu dürüstçe söyler | B5 | BLG-18: 5 tur, hedef ≤ 3 karşılanmadı (BLG-15: 7) |

### R10.6 Yayın öncesi kontrol listesi (B8'den önce, her madde kanıtlı)

**Tetik (OPS, 25 Ekim 2026):** sessiz fan dersi (R10.5, rehber kutusu meta kopyası) cetvelde yoktu ve kontrol edilmeden
dördüncü yazı yayına gidiyordu; Recep "geçen hatalar tekrar etmesin" dedi. Aşağıdaki sekiz madde her yeni yazının B8
PR'ında **PR gövdesinde** tablo olarak doldurulur: her satırda durum (UYGULANDI / AÇIK) ve kanıt (dosya:satır, komut
çıktısı ya da canlı ölçüm). **Kanıtı olmayan madde AÇIK sayılır ve yayın çıkmaz.** B7 onayı bu tablodan önce alınabilir;
tablo OPS'a B8 PR'ıyla birlikte gider, OPS bağımsız doğrulayıcıyla ayrıca ölçer, yayın iki taraf da yeşilken çıkar.

| # | Madde | Kanıt biçimi | Kapıya çevrilebilir mi (öneri; kapıyı ARAÇ yazar, HRT-70) |
|---|---|---|---|
| 1 | Rehber kartı meta açıklamasını kopyalamıyor; `data-nosnippet` ve INV-BILGI-MERKEZI-KART-3 bu yazı için de yeşil; yazıyı gösterecek kategori ve aile sayfaları listelenir | `kartOzeti`, `kartOzetiYuzeyler`, `kartNosnippet` testleri; yazıyı gösterecek sayfa listesi (ters dizin); kartOzeti ve başlığın canlı kategori/aile metniyle 3'lü dizilim çakışması | **Evet, zaten kapı:** INV-BILGI-MERKEZI-KART-3 testi yeni yazıyı kendiliğinden kapsar. Eksik: canlı sayfa çakışması ölçümü betiği (`rehber-denetim` ağlı kol) |
| 2 | Yazıdaki her sayı katalog ve canlı ürün sayfasıyla aynı; katalog-canlı fark KATALOG/ÜRÜN'e kartla gider; bölünmüş ailede toplam alınır | iddia tablosu (ham alıntı), 3f örnekleme, canlı aile sayfası sayıları | **Kısmen:** iddia tablosundaki sayı iddialarını canlı aile sayfasıyla karşılaştıran ağlı betik; seri adının canlıda var olup olmadığı |
| 3 | Yazıda fiyat ya da fiyat ima eden cümle yok (`hide_price` kategoride fiyat cümlesi yazılmaz) | gövde taraması (₺, TL, fiyat sözcükleri) ve canlı aile sayfası ölçümü | **Kısmen kapı var:** `FIYAT` deseni (para birimi + rakam) kalıp kapısında KIRMIZI verir; eksik olan fiyat ima eden cümle UYARI kolu ve canlı aile sayfası ölçümü (₺/TL sayısı, "Teklif" sayısı) |
| 4 | R10.5 beş madde: axe kontrast tavanı PR'dan ÖNCE ölçüldü; fikstürler (sahte katalog, site haritası altın dosyası ve satır sayıları, rota-dili conformance) güncellendi; ölçüm dosyası depo dışı (`/tmp` değil) | axe e2e sonucu (CI), fikstür testlerinin yeşil çıktısı | **Kısmen:** fikstür kırıklarını yeni yazı kaydı eklendiğinde yerelde koşan tek `test:ilgili` kümesi; axe e2e CI'da zaten kapı |
| 5 | R11 başlık kuralı: her H2 tek başına aranınca konuyu söylüyor | `baslikDenetle` çıktısı (H2 sayısı, konulu oran, uyarı) | **Evet, kapı var:** `baslikDenetle` UYARI kolu (zorunlu başlıklar muaf) |
| 6 | Site haritasında yeni adres var; canonical ve hreflang doğru; noindex yok | `sitemapAltin.json` ve `ustVeriHarita` testi (yerel); birleşmeden sonra canlı `curl` (B10) | **Evet:** B10 canlı ölçüm betiği (200, haritada adres + `lastmod`, canonical, noindex yok) |
| 7 | İç bağlantılar: `vh:yazi` kimlikleri çözülüyor, 404 bağlantı 0; ön koşul PR'lar (ör. çözücü) birleşmiş | `icBaglanti.test` (derleme), `ic-baglanti-denetle.mjs` (canlı), ağsız kapı çıktısı | **Evet:** `ic-baglanti-denetle.mjs` B10 sonrası otomatik; ağsız yarı `yazi` türünü tanır (PR #2053) |
| 8 | Marka, sertifika ve performans iddiaları resmî kaynakta birebir var | iddia tablosunda sınıf ve ham alıntı; sertifika/ödül/üstünlük deseni taraması | **Kısmen:** sertifika ve üstünlük sözcük deseni UYARI kolu; "kaynakta birebir var" kısmı doğrulayıcıda kalır |

**Kapı önerisi özeti (OPS'a, BLG-19):** tamamen kapıya çevrilebilen üç iş vardır: (a) ağlı `rehber-denetim` kolu
(madde 1 canlı kategori/aile çakışması + madde 2 canlı sayı karşılaştırması + madde 3 canlı fiyat deseni), (b) B10 canlı
ölçüm betiği (madde 6 ve 7, tek komut), (c) `test:ilgili` ön kontrolü (madde 4 fikstür kırıkları). Madde 8'in
"birebir var" yarısı ve axe ölçümü insan ya da CI'da kalır. Kapıyı ARAÇ yazar; bu cetvel kapı yazmaz (K0–K5 aday kalır).

## R11 — Başlık ve içerik yapısı: Google'ın resmî belgelerine dayanan kural (BLG-12, 2026-10-14)

**Tetik ölçüm (OPS, 14 Ekim):** R3 zorunlu bölümleri ve "H2 sayısı hedef değildir"i söylüyordu; alt başlığın
metninin nasıl yazılacağına dair kural yoktu. Frekans konvertörü yazısında "Nasıl çalışır?", "Yumuşak kalkış",
"Seçim: neye bakılır?", "İzlenecek yol" başlıkları konu ifadesi taşımıyor; tek başına aranınca eşleşmiyor.

**Sınıf işareti (bu bölümde her satır birini taşır):**

- **RESMÎ:** Google'ın kendi belgesinde yazıyor; adresi, belge tarihi ve alıntısı satırda.
- **İLKE:** bizim kararımız. Resmî bir kural değildir; dayanağı hangi resmî satıra yaslandığıyla yazılır.
  Resmî şart gibi sunulmaz (R2.3'ün aynı ruhu: yazılı olmayan şeyi Google'a atfetmek yanlış beyandır).
- **GÖRÜŞ:** Google çalışanının açıklaması ya da ikincil kaynak; kural değil, yön gösterir.

### R11.1 Resmî dayanak (BLOG ölçümü, 2026-10-14, A sınıfı)

Beş belgenin ham HTML'i `curl` ile çekildi (durum 200, yönlendirme yok); alıntılar sayfa metninde birebir
arandı, özetleyici araç kanıt sayılmadı (R2.3). Türkçe arayüzlü sürümleri (`hl=tr`) de açılıyor; alıntılar
İngilizce özgün metinden. Belge tarihi sayfadaki "Last updated" satırıdır. Adresler
`https://developers.google.com/search/docs/` altındadır.

| # | Ne söylüyor | Alıntı (özgün) | Belge | Belge tarihi |
|---|---|---|---|---|
| 1 | Ana başlık içeriği betimleyici, yararlı bir özetle anlatmalı | "Does the main heading or page title provide a descriptive, helpful summary of the content?" | `fundamentals/creating-helpful-content` | 2026-10-05 |
| 2 | Ana başlık abartılı ya da şok edici olmamalı | "Does the main heading or page title avoid exaggerating or being shocking in nature?" | `fundamentals/creating-helpful-content` | 2026-10-05 |
| 3 | İyi başlık sayfaya özgü, açık, kısa ve içeriği doğru anlatan başlıktır | "a good title is unique to the page, clear and concise, and accurately describes the contents of the page." | `fundamentals/seo-starter-guide` | 2025-12-10 |
| 4 | Ana başlık sayfadaki en belirgin metin olmalı; yoksa Google yanlış metni başlık bağlantısı yapabilir | "Consider ensuring that your main title is distinctive from other text on a page and stands out as being the most prominent on the page" | `appearance/title-link` | 2025-12-10 |
| 5 | Uzun içerik bölümlere ayrılır, başlıklar gezinmeye yardım eder | "Break up long content into paragraphs and sections, and provide headings to help users navigate your pages." | `fundamentals/seo-starter-guide` | 2025-12-10 |
| 6 | Başlıkların sırası Google Arama için önemli değildir | "from Google Search perspective, it doesn't matter if you're using them out of order." | `fundamentals/seo-starter-guide` | 2025-12-10 |
| 7 | İdeal başlık sayısı yoktur; fazla geliyorsa fazladır | "There's also no magical, ideal amount of headings a given page should have. However, if you think it's too much, then it probably is." | `fundamentals/seo-starter-guide` | 2025-12-10 |
| 8 | Bağlantı metni, bağlanılan sayfanın içeriğini önceden anlatmalı | "users and search engines can easily understand what your linked pages contain before they visit." | `fundamentals/seo-starter-guide` | 2025-12-10 |
| 9 | Başlık bağlantısı, `<h1>` gibi başlık öğelerinden de üretilebilir | "Heading elements, such as <h1> elements" | `appearance/title-link` | 2025-12-10 |
| 10 | Anahtar kelime doldurma spamdir (tanım) | "Keyword stuffing refers to the practice of filling a web page with keywords or numbers in an attempt to manipulate rankings in Google Search results." | `essentials/spam-policies` | 2026-08-28 |
| 11 | Doldurmanın biçimi: doğal olmayacak sıklıkta tekrar | "Repeating the same words or phrases so often that it sounds unnatural." | `essentials/spam-policies` | 2026-08-28 |
| 12 | **Yan dayanak** (meta açıklama kuralıdır, başlık kuralı değil): anahtar kelime dizisi kullanıcıya sayfa hakkında net fikir vermez | "meta descriptions comprised of long strings of keywords don't give users a clear idea of the page's content" | `appearance/snippet` | 2026-04-20 |
| 13 | Bölüme giden "Read more" derin bağlantısı için içerik insana hemen görünür olmalı, kaydırma JS ile kontrol edilmemeli, adres çubuğundaki hash silinmemeli; bu bir olasılık artırma önerisidir, garanti değildir | "A "Read more" deep link is a link within a snippet that leads users to a specific section on that page." ve "Make sure content is immediately visible on the page to a human (and not hidden behind an expandable section or tabbed interface, for example)." | `appearance/snippet` | 2026-04-20 |

**GÖRÜŞ:** Google Arama sözcüsü John Mueller (2019, haber metni üzerinden ikincil kaynak; birincil kayıt
aranmadı): bir sayfada H1 sayısının alt ya da üst sınırı yoktur ("There's no limit, neither upper or lower
bound"). Kaynak: `https://www.searchenginejournal.com/google-h1-headings-seo/328459/` (2019-09-30; Search
Engine Land makalesi 403 verdi, iki ikincil kaynak karşılaştırılamadı).

### R11.2 Google'ın YAZMADIĞI şeyler (ölçüldü; kuralları bunların üstüne kurmayız)

- **H2/H3 başlığının konu ifadesi taşıması resmî şart değildir.** Yararlı içerik belgesindeki başlık sorusu
  yalnız "ana başlık ya da sayfa başlığı" içindir (satır 1–2). Alt başlıklar için belgelerde yazan tek şey
  "gezinmeye yardım" (satır 5); alt başlık metni için ayrı bir kural yok.
- **Başlıkta anahtar kelime tekrarı için sayısal eşik yok.** Beş belgenin gövde metninde "keyword density",
  yüzde ve eşik terimleri arandı; bulunmadı. Spam tanımı niteliksel ("unnatural", "out of context").
  Taranmadı: Search Central blogu ve Search Off the Record kayıtları (bu yüzden "yok" hükmü yalnız beş
  belge için ölçüldü).
- **Başlık sırası ve sayısı Google Arama için ölçüt değil** (satır 6–7). Sıra kuralımız erişilebilirlik
  ve içindekiler içindir (R3 şablonu), Google'a atfedilmez.
- **"Tek H1" Google'ın kuralı değildir** (GÖRÜŞ: sınır yok). R3'teki tek H1 şartı şablon ve belge
  yapısı için **iç kuraldır**; gerekçesi Google değil, tek başlıklı bir belge şablonudur. Bu bölüm o
  kuralı değiştirmez; yalnız gerekçesinin kaynağını doğru yere yazar.
- **Sayfa içi anahtar anlar (key moments)** yalnız video işaretlemesi içindir; yazıya uygulanmaz.
- **"Read more" derin bağlantısı başlık metnine bağlanmaz** (satır 13). Belge bu bölüm bağlantısı için başlığın
  metnini değil içeriğin görünürlüğünü, kaydırmanın JS ile yönetilmemesini ve hash'in korunmasını şart koşar. Yani
  alt başlığı yeniden yazmak bu bağlantıların görünme olasılığını artırdığı için DEĞİL, okuyucu için yapılır.
- **Bu sitenin şablonunda gövde ve SSS cevapları daraltılabilir (accordion) değildir** (ölçüldü 2026-10-14:
  `src/lib/bilgiMerkezi/markdown.ts` ve `RehberYazisiSayfasi.tsx`'te `<details>` yalnız dar ekrandaki İçindekiler
  için var). 13. satırın birinci şartı bu yüzden bugün karşılanıyor; şablon değişirse yeniden ölçülür (Y8).

**Sonuç:** alt başlık kuralı "Google şöyle istiyor" diye yazılmaz. Aşağıdaki kurallar İLKE sınıfındadır;
resmî satırlara yaslanır ama onları aşar, bu yüzden aşağıdaki uyarı kolu **KIRMIZI değil UYARIDIR**.

### R11.3 Kurallar (İLKE; dayanak sütunu hangi resmî satıra yaslandığını söyler)

| # | Kural | Dayanak | Sınıf |
|---|---|---|---|
| Y1 | H1 aranan soru ya da konu adıdır, içeriği betimler; abartı, ünlem ve vaat yok | 1, 2, 3 (+ R4.2) | RESMÎ |
| Y2 | Her H2 ve H3 **tek başına okunduğunda** neyi anlattığı anlaşılır: içindekiler ve sayfa içi bağlantı başlığı bağlamsız gösterir. Konu terimi başlığın **doğal** yerinde geçer ("Nasıl çalışır?" yerine "Frekans konvertörü nasıl çalışır?"). Konu başka bir adla zaten anlaşılıyorsa (marka ya da model adı, "Danfoss FC 51…" gibi) o başlık yeterlidir | 3, 5, 8 | İLKE |
| Y3 | **Doldurma yasağı:** aynı tam ifade H2'lerin çoğunda tekrarlanmaz; her H2 farklı bir yan soruyu anlatır, başlıkları doğal olmayacak sıklıkta aynı sözcüklerle bitirmek yasaktır | 10, 11 | RESMÎ (tanım) · İLKE (eşik) |
| Y4 | Zorunlu bölüm başlıkları sabittir (R3; kapı birebir arar) ve Y2'den muaftır | R3 | İLKE |
| Y5 | SSS soruları tam soru cümlesidir ve konuyu adıyla anar ("Fan eğrisindeki verim her devirde geçerli mi?" iyi; "Peki ya verim?" kötü) | 3, 8 | İLKE |
| Y6 | H2 sayısı ve kelime sayısı hedef değildir (R3'ün mevcut cümlesi); bölüm sayısı yan soruların sayısından gelir | 7 | RESMÎ |
| Y7 | Başlığın metni değişirse içindekinin çapası da değişir; dışarıdan o çapaya bağlantı varsa eski çapa kırılır (R10 B9 ölçümünde çapa bağlantısı sorulur) | R6 | İLKE |
| Y8 | Gövde ve SSS cevapları daraltılabilir (accordion, sekme) yapılmaz; bölüm içeriği sayfa yüklenirken görünür kalır ve sayfa yüklenirken kaydırma konumu JS ile değiştirilmez, adresteki hash silinmez. Şablon kararıdır (URUN); değişirse bu satır yeniden ölçülür | 13 | RESMÎ (öneri, garanti değil) |

### R11.4 Denetim kolu (`baslikDenetle`, UYARI)

`scripts/rehber/rehber-denetim.mjs` içinde `baslikDenetle(md)`; `denetle()` çıktısına **`uyari`** dizisi olarak
girer ve `kirmizi` dizisini değiştirmez. Konu terimleri, H1 metninden (ve varsa ön bilgideki `konu_terimleri:`
satırından) çıkarılır: 4 harften uzun, bağlaç ve soru kelimesi olmayan sözcüklerin ilk beş harfi (Türkçe
ek yüzünden kök eşleşmesi; eşik ölçüm sonrası ayarlanır).

| Sınıf | Ne zaman uyarır | Dayanak |
|---|---|---|
| `BASLIK-KONU-ORANI` | Zorunlu bölümler hariç H2'lerin **yarısından azı** bir konu terimi taşıyor (en az 4 H2 olan yazıda) | Y2 |
| `BASLIK-TEKRAR` | H2'lerin **%60'ından fazlası** konu terimlerinin **tamamını** taşıyor (en az 4 H2) | Y3 |

⚠**Eşikler bizimdir** (yarım ve %60); resmî eşik yoktur (R11.2). İki yayındaki yazıda ölçüldü (R11.5); eşik
oradaki yanlış pozitiflere göre ayarlanır, kırmızıya terfi ettirilmez: kırmızı yapılırsa ürün adı taşıyan
meşru başlıklar ("Danfoss FC 51, FC 101 ve FC 102 karşılaştırması") sebepsiz yere düşer.

### R11.5 Ölçüm ve açık noktalar

İki yayındaki yazının başlık önerisi `docs/audits/blg12-baslik-oneri-tablosu-2026-10-14.md`'dedir: şimdiki ·
önerilen · gerekçe. **Başlık değişikliği yayına yalnız Recep onayından sonra OPS üzerinden girer**; metin
değişeceği için R5.5 gereği sha256 değişir ve doğrulama turu yeniden koşar (maliyeti tablonun altında).

| Nokta | Sahibi | Durum |
|---|---|---|
| Zorunlu başlıklara ("Fiyatı belirleyen etkenler" vb.) konu teriminin eklenmesi: kapı başlığı birebir arıyor, değişirse `ZORUNLU_BOLUMLER` ve `kalipDenetle` birlikte değişir | BLOG + OPS kararı | AÇIK: Y4 şimdilik muaf tutar; değişiklik ayrı karar (R3 kalıbını etkiler) |
| Search Central blogu ve Search Off the Record taraması (H2/H3 için resmî ek kanıt) | BLOG | YAPILMADI, ayrı iş |
| Mueller açıklamasının birincil kaydı | BLOG | YAPILMADI; satır GÖRÜŞ olarak kalır |
| Uyarı eşiklerinin üçüncü yazıda yeniden ayarı | BLOG | üçüncü yazıdan sonra |
| "Hız sürücüsü" ile "frekans konvertörü" sözcüklerinin arama talebi (başlıkta hangisinin geçeceği) | GEO-SEO (SEO-50) | ÖLÇÜLDÜ 14 Ekim, Google Trends TR, 12 ay, 6 çağrı, **düşük güvenilirlik**: iki sözcük aynı büyüklük sınıfında; talep ikisi arasında seçim yapmıyor, seçimi tekrar kuralı (Y3) ve yazının kendi sözcüğü belirler. "Sürücü" tek başına ölçülemez (genel sözcük). Düşük hacimli terimler iki gün arayla tutarsız çıktı, bu yüzden frekans ailesi içinde sıra iddia edilmez |
| Yazıdaki "invertör" yazımı ile arama dilindeki "inverter" yazımı | BLOG + Recep | AÇIK: Trends'te "inverter" en yüksek hacimli terim, "invertör" yaklaşık onda biri (SEO-50, düşük güvenilirlik); başlığa yansıtılıp yansıtılmayacağı ayrı karar, bu PR başlıkta "inverter" önermez |

---

## Ölçüm geçmişi

Kaynak sınıfı (`hukum-kaynak-standard.md`): **A** = BLOG'un kendi ölçümü · **B** = başkasının ölçümü, okundu.

| Tarih | Ölçüm | Sınıf | Sonuç |
|---|---|---|---|
| 2026-09-24 | Rakip yazı (OPS) | B | 2.561 kelime · 15 H2 · 8 SSS · 17 kaynak; Türkçe rakipler 433–1.565 kelime, 0 kaynak (REC-369 OPS yorumu) |
| 2026-09-24 | F1 Search Console (BLOG) | A | Veri 2026-08-28'de başlıyor (25 gün): 34 tık · 448 gösterim · ort. sıra 28,0 · sorguda görünen gösterim %50, tık %26 · bilgi niyetli sorgu 2 gösterim |
| 2026-09-24 | F1 konu kümeleri (BLOG) | A | 11 küme; en büyük marka dışı küme 57 gösterim / 0 tık / sıra 44. Küme adları ve sorgular REC-369'da (depoya yalnız özet) |
| 2026-09-25 | Bilgi Merkezi ayrıştırıcısında görsel desteği (BLOG) | A | `src/lib/bilgiMerkezi/markdown.ts` satır 93 görsel sözdizimini reddediyor; yazı kaydında kapak alanı yok (R3.1) |
| 2026-09-24 | F1 arama önerisi (BLOG, 16 tohum × 6 ek) | A | 93 bilgi niyetli öneri; en geniş tohum 16 öneri |
| 2026-09-24 | F1b bot karnesi (BLOG, 45 adres × 5 kimlik) | A | 45/45 adreste beş kimlik aynı HTML; 32 adreste sorun (hreflang düşüşü 28, iki title 15, varsayılan başlık + canonical yok 13) |
| 2026-09-24 | Google belgeleri, ham HTML (BLOG) | A | Article türleri Article/NewsArticle/BlogPosting · SSS zengin sonucu 2026-05-07'de kaldırıldı · spam politikası alıntıları birebir · Indexing API yalnız JobPosting/BroadcastEvent |
| 2026-09-24 | v0.1 çürütmesi, iki kol (Fable 5.1 / Opus 5.5) | A | Birleşik 29 gerçek bulgu: Fable 18, Opus 26, ortak 15; Fable 1 bayat alıntı onayı. v0.2'ye işlendi. Raporlar `docs/audits/rec369-rehber-cetveli-red-team-2026-09-24.md` ve `…-opus-2026-09-24.md` |
| 2026-09-24 | v0.2 dar ikinci tur (Opus) | A | KOŞULLU: 35 kalem → 20 karşılandı, 14 kısmen, 1 bilinçli ret; yeni 4 yüksek (tuzak ↔ sha256, İÇ-DİZİN sınıfı, kapı yayın geçişinde değil, F4 ara düzeni yok) v0.3'e işlendi; v0.2'nin R0.1 olgusu yanlıştı (sayılar görünmüyor, listeler boş). Rapor `…-tur2-2026-09-24.md` |
| 2026-09-24 | Emsal yazı yeniden, tarayıcıda işlenmiş (BLOG) | A | Normal istemci ve Googlebot kimliği aynı 9 kelimelik kabuğu alıyor (dolu hâl yalnız JS sonrası); işlenmiş sayfa 2.561 kelime · 15 H2 · 8 SSS · 2 tablo · 1 görsel · 17 kaynak (EPA, DOE, 2 üretici); JSON-LD TechArticle + FAQPage + BreadcrumbList; yazar Organization; teknik sorumluluk notu var ("…performans, emisyon veya tasarruf garantisi içermez…"); **yapay zekâ açıklaması yok** |
| 2026-09-24 | Emsal blog liste + 3 yazı şablonu, Playwright 1280/390 (BLOG, Sonnet alt ajan) | B | İki ayrı site (deaboyler.com / deaenerji.com), yönlendirme yok; üç yazı üç farklı şablon (JSON-LD Article / TechArticle / BlogPosting, üçünde FAQPage). İçindekiler üçünde var (biri yapışkan); ilerleme çubuğu, paylaşım, yazar kutusu, ilgili yazılar yok; iki yazıda mobil sayfa taşması (scrollWidth 770 / 391); hiçbirinde erişim tarihi ve yapay zekâ notu yok. Tasarım kararı K37-a/U2 bulundu (ilgili makale + arama). Rapor Linear REC-369 |
| 2026-09-24 | Kalıp kapısı ilk yazıya karşı (BLOG) | A | Onaya sunulmuş metin (sha f29ab1c35e26): ZORUNLU-BOLUM-YOK × 2 (fiyat etkenleri, sorumluluk notu); tamamlanmış metin: 0 |
| 2026-10-13 | BLG-3 + frekans yazısı bulgu tablosu, kapı koşusu (BLOG, çürütme turlu) | A | 59 gerçek bulgu; `rehber-denetim.mjs` tur 4–10 taslaklarına koşuldu: 0 bulguya hüküm; `alinti-dogrula.mjs` fonksiyon düzeyi: tur 4 GECTI 114 · INCELE 7 · KALDI 0; tur 4–9'un 41 bulgusundan 35'i 25 Eylül'de doğrulanmış metinde vardı. Rapor `docs/audits/blg3-bulgu-tablosu-2026-10.md` (BLG-10 PR'ı) |
| 2026-09-24 | Alıntı betiği canlı (BLOG) | A | Cetvelin 5 Google alıntısı: GECTI 2 · INCELE 3 · KALDI 0; bayat SSS alıntısı yol değişikliğiyle yakalandı; bayatlık kelimesi olağan cümlede de işaret verdi (ayırt etmez) |
| 2026-10-14 | Google başlık ve içerik yapısı belgeleri, ham HTML (BLOG, blog-arastirmaci + müdür doğrulaması) | A | 5 belge 200; 13 resmî alıntının 13'ü belge metninde birebir bulundu (GEO-SEO bağımsız olarak 12'sini aynı sonuçla doğruladı, 13. satırı BLOG ekledi ve doğruladı); H2/H3 için konu ifadesi şartı ve başlıkta sayısal eşik YOK; tek H1 sınırı yok (GÖRÜŞ, ikincil kaynak). Search Central blogu ve Search Off the Record taranmadı |

⚠**v0.1'de bu cetvelin kendisi R2'yi çiğnedi:** SSS alıntısı özetleyici araçla "ölçüldü" diye yazıldı ve
bayattı (R2.3 vakası). Kuralı yazmak onu uygulamak değildir; bu sürümün de her olgusal cümlesi aynı
kurala karşı tarandı ve ölçüm geçmişine sınıfıyla yazıldı.
