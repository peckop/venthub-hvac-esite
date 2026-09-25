# Mevzuat Kaydı Standardı (Cetvel) — v0.1 TASLAK

> **Sahibi:** MEVZUAT şeridi. **Doğuran olay:** 2026-09-25, Recep'in sözü: *"mevzuatlar adında bir şerit
> gerekebilir; tüm konuları tarar, standartlar vs olur, tüm konulara ve ürünlere destek olur."*
> Aynı hafta BLOG şeridi, fan tüzüğü 327/2011'in yerini 2024/1834'e bıraktığını bir yazı hazırlarken
> tesadüfen buldu (REC-369). Katalogdaki hiçbir sayfa bunu bilmiyordu; bilginin tek bir yeri yoktu.
>
> **Durum:** TASLAK — OPS üzerinden Recep onayına gider. Onaysız hiçbir şerit bu dosyayı kural diye
> uygulamaz.

---

## M0 — Kapsam

**Kapsamda:** ürünlerimize dokunan teknik mevzuat ve standartlar.

| Tür | Örnek |
|---|---|
| AB tüzüğü / direktifi | 2019/1781 (motor), 2024/1834 (fan), 2014/34 (ATEX), 2014/30 (EMC) |
| TR yönetmelik / tebliğ | SGM tebliğleri, ATEX yönetmeliği, EMC yönetmeliği |
| Standart (EN / ISO / IEC / TS) | IEC 61800-3, EN 12101-3, EN ISO 80079-36 |

Konu ekseni: çevreye duyarlı tasarım (ErP) ve enerji etiketi, patlayıcı ortam (ATEX), CE ve uygunluk,
EMC ve alçak gerilim, makine emniyeti, yangın ve duman tahliyesi, F-gaz, yapı ürünleri.

**Kapsam dışı:** hukuki ticaret metinleri (KVKK, mesafeli satış, e-ticaret, fatura). Onlar
`legal-compliance-standard.md`'nin alanıdır ve şirket kuruluşuna bağlı bekleyen konudur.

---

## M1 — Kaydın yeri ve biçimi

| Ne | Yer | Niçin |
|---|---|---|
| Kurallar (bu dosya) | `docs/standards/mevzuat-kaydi-standard.md` | Diğer cetvellerle aynı yerde; README haritasına girer |
| Kayıt verisi | `docs/mevzuat/kayit.json` | Tek dosya, makinece okunur, diff'i okunur; betik ve ajan aynı dosyayı okur |
| Kaynak kanıtları | `docs/mevzuat/kanit/<kimlik>.json` | Her kaynağın ham çekim kaydı (M3); kayıt dosyasını şişirmez |

**Biçim JSON'dur**, YAML değil: depodaki doğrulama betikleri (`scripts/rehber/alinti-dogrula.mjs`)
JSON okuyor ve ikinci bir ayrıştırıcı gerekmiyor. Kayıt **PUBLIC depoya** girer; mevzuat zaten
herkese açık bilgidir. ⛔Pazar verisi, müşteri verisi, fiyat ve tedarikçi sözleşmesi bu dosyalara
**girmez** (repo 2026-08-15'ten beri public).

Tek dosya yeterlidir: kalem sayısı yüzleri geçmeden bölünmez. Bölmek gerekirse yetki alanına göre
bölünür (`kayit-ab.json`, `kayit-tr.json`), konuya göre değil; çünkü AB–TR karşılık bağı dosya
içinde kalmalıdır.

---

## M2 — Kalem alanları

Her kalem bir mevzuat metnidir. Bir AB tüzüğü ile onun TR karşılığı **iki ayrı kalemdir** ve
`karsilik` alanıyla birbirine bağlanır: tarihleri, numaraları ve durumları farklıdır.

| Alan | Zorunlu | Tür | Açıklama |
|---|---|---|---|
| `kimlik` | ✅ | metin | Kararlı anahtar. Biçim: `<YETKİ>-<numara>` → `AB-2024/1834`, `TR-SGM-2026/2`, `STD-IEC-61800-3`. Bir kez verilir, değişmez |
| `ad` | ✅ | metin | Resmî tam ad, kaynağın dilinde |
| `ad_tr` | — | metin | AB metni için Türkçe kısa ad (yazılarda kullanılan) |
| `tur` | ✅ | sabit | `tuzuk` · `direktif` · `uygulama-karari` · `yonetmelik` · `teblig` · `standart` · `rehber` |
| `yetki` | ✅ | sabit | `AB` · `TR` · `ULUSLARARASI` |
| `konu` | ✅ | liste | M0'daki eksenler: `erp` · `enerji-etiketi` · `atex` · `emc` · `alcak-gerilim` · `makine` · `yangin-duman` · `f-gaz` · `yapi-urunleri` · `cerceve` |
| `kapsam` | ✅ | metin | Kendi cümlemizle, Türkçe, en fazla üç cümle. Standart metninden kopya **yasak** (M4) |
| `tarihler` | ✅ | nesne | `kabul`, `yayim`, `yururluk` (ISO tarih) + `asamalar: [{tarih, ne}]`. Bilinmeyen alan `null`, tahmin yazılmaz |
| `yerini_aldigi` | — | liste | Bu metnin kaldırdığı kalemlerin `kimlik`leri |
| `yerine_gelen` | — | metin | Bu metin kaldırıldıysa yerine gelenin `kimlik`i |
| `degistirenler` | — | liste | Değişiklik metinleri (`AB-2021/341` gibi); ayrı kalem açılması şart değil |
| `karsilik` | — | liste | Öbür yetki alanındaki karşılığın `kimlik`i (AB ↔ TR) |
| `durum` | ✅ | sabit | `yururlukte` · `gecis-doneminde` · `kaldirildi` · `taslak` · `revizyonda` |
| `kaynaklar` | ✅ | liste | En az bir **resmî** kaynak: `{url, yayinci, erisim_sinifi, erisim_tarihi, kanit}`. `kanit` = `docs/mevzuat/kanit/…` yolu |
| `etkilenen_aileler` | ✅ | liste | `{slug, etki, neden}` — `slug` KATALOG'un aile slug'ı (`product_families.slug`); `etki` = `kapsamda` · `kapsam-disi` · `belirsiz` |
| `urun_sayfasi_sartlari` | — | liste | Metnin ürün sayfasına ya da teknik föye yüklediği bilgi şartları (etiket, föy, plaka bilgisi) |
| `yazi_konusu` | — | liste | BLOG için önerilen konu başlıkları |
| `son_kontrol` | ✅ | tarih | Kaynağın en son ham çekildiği gün (M5) |
| `notlar` | — | metin | Açık soru, çelişki, doğrulanamayan iddia |

**İlişki alanları** (`yerini_aldigi`, `degistirenler`, `karsilik`) yalnız kimlik taşır. Kaldırılmış
eski bir metne (ör. `AB-640/2009`) kayıtta ayrı kalem açmadan atıf yapılabilir; serbest metin ise
`iliski_notlari`na yazılır, kimlik alanına yazılmaz.

**Neden `kapsam-disi` de yazılır:** bir tüzüğün bir aileyi kapsamaması da sayfa bilgisidir. Duman
tahliye fanı fan tüzüğünden muaf ise bu, müşteriye verilen "ErP uyumlu" cümlesini değiştirir.

---

## M3 — Kaynak ve kanıt

Kaynak sınıfları ve doğrulama `rehber-yazisi-standard.md` R2 ile **aynıdır**; bu cetvel onları
yeniden tanımlamaz, uygular:

1. **Öncelik:** EUR-Lex, Resmî Gazete, mevzuat.gov.tr, bakanlık ve Komisyon siteleri. Standart için
   yalnız yayıncının (IEC, ISO, CEN/CENELEC, TSE) katalog/kapsam sayfası.
2. **Erişim sınıfı (R2.2):** tüzük ve yönetmelik `AÇIK`; standart tam metni `KAPALI` → yalnız ad ve
   kapsam, **sayı alınmaz**.
3. **Ham kanıt (R2.3):** `curl` ile ham çekim; kayıtta ilk ve son adres, HTTP durumu, yönlendirme
   zinciri, sayfanın durum satırı (EUR-Lex'te *"In force"* / *"No longer in force"*), etiketi soyulmuş
   metnin sha256'sı, birebir alıntı, erişim tarihi. Özetleyici araç (WebFetch) keşif içindir,
   kanıt değildir.
4. **robots.txt ve kullanım şartı önce okunur.** Otomatik okuma yasaksa o kaynak elle okunur ve
   kanıt dosyasına `robots: yasak — elle okundu` yazılır. (Niçin: 2026-09-24'te Google Trends'e
   bu kontrol yapılmadan otomatik erişildi.)
5. **EUR-Lex programla okunamaz** (ölçüldü 2026-09-25, altı ajanın altısında): robots.txt izin
   veriyor ama site güvenlik duvarı her `curl` isteğine boş gövdeli HTTP 202 döner. Aynı resmî metin
   AB Yayın Ofisi'nin veri servisinden alınır: `http://publications.europa.eu/resource/celex/<CELEX>`
   (`Accept: application/xhtml+xml`, `Accept-Language: eng`). Yedek yol web.archive.org kopyasıdır;
   kopyanın tarihi kanıta yazılır. ⚠Veri servisi EUR-Lex'in "In force / No longer in force" durum
   satırını vermez; durum, değişiklik zincirinden ve Komisyon sayfasından çıkarılır ve bu, kanıtta
   belirtilir. Tarayıcı otomasyonuyla EUR-Lex'e girmek yöntem sapmasıdır; yapıldıysa kanıta yazılır.
6. **Depo PUBLIC olduğu için kanıt dosyasına ne girer** (OPS notu, 2026-09-25):

   | Kaynak | `kanit/` dosyasına giren | Girmeyen |
   |---|---|---|
   | AB tüzük/direktif (EUR-Lex), TR yönetmelik/tebliğ (Resmî Gazete, mevzuat.gov.tr) | Kısa birebir alıntı (iki cümleyi geçmez) + durum satırı + hash | Uzun bölüm kopyası |
   | Standart (EN / ISO / IEC / TS) | Yalnız yayıncının **kapsam sayfasındaki açık metin**: ad, numara, baskı yılı, kapsam cümlesi | Standart **gövdesinden** tek cümle, tablo ya da sayı (telif) |

   Resmî metinler kamu malıdır ve kısa alıntı serbesttir; standart gövdesi satılan telifli üründür.
   Satın alınmış bir standart okunmuş olsa bile gövdesi depoya girmez.
7. Yapay zekâ cevabı, blog, üretici sitesi ve rakip sitesi **kaynak değildir**. Üretici belgesi
   ürünün kendisi hakkında kanıttır (kaynak dizini), mevzuatın içeriği hakkında değil.

---

## M4 — Yasaklar

- ⛔Standart metninden cümle, tablo ya da sayı kopyalanmaz (telif). Kapsam kendi cümlemizle yazılır.
- ⛔Kayıtta tarih tahmin edilmez. Bulunamayan tarih `null` ve `notlar`da "bulunamadı" olur.
- ⛔Kayıt canlı veriye yazmaz. Bir ürün sayfasının değişmesi gerekiyorsa MEVZUAT **liste** üretir,
  sayfayı KATALOG değiştirir (M6).
- ⛔Hukuki ticaret metinleri bu kayda girmez (M0).

---

## M5 — Tazelik

`son_kontrol` alanı kalemin ne kadar güvenilir olduğunu söyler. Kontrol, kaynağın ham yeniden
çekilip sha256'nın ve durum satırının öncekiyle karşılaştırılmasıdır; sayfaya bakıp "değişmemiş"
demek kontrol değildir.

| Kalem durumu | Kontrol sıklığı |
|---|---|
| `gecis-doneminde`, `taslak`, `revizyonda` | ayda bir |
| `yururlukte` | üç ayda bir |
| `kaldirildi` | kontrol edilmez (yalnız `yerine_gelen` izlenir) |

Takip betiği ve zamanlaması bu cetvelin **madde 4** işidir; zamanlayıcı kurulmadan önce Recep'e
sorulur (karar 53). O gelene kadar kontrol elle koşulur ve tarihi `son_kontrol`a yazılır.

---

## M6 — Çıktılar ve kullanıcıları

| Kullanıcı | Aldığı | Biçim |
|---|---|---|
| KATALOG | Sayfa bilgisi değişmesi gereken aileler | Aile slug'ı · hangi kalem · ne değişmeli · hangi tarihten itibaren |
| BLOG | Yazı olması gereken konular | Konu · dayandığı kalemler · zaman baskısı (yaklaşan uygulama tarihi) |
| SATIS | Müşteriye verilen bilginin güncelliği | Kalem · eski ifade · doğru ifade |

Bir kalem **durum değiştirdiğinde** (yeni aşama, kaldırılma, TR karşılığının yayımı) üç listenin
hangisini etkilediği aynı gün yazılır ve ilgili şeride iletilir.

---

## Ölçüm geçmişi

- 2026-09-25 — v0.1 taslak. Tohum: altı eksende (motor, fan, ATEX, EMC/alçak gerilim, havalandırma
  üniteleri/enerji etiketi, makine/duman/F-gaz) **42 kalem** (`docs/mevzuat/kayit.json`, kanıtlar
  `docs/mevzuat/kanit/`). Aile slug'larının 47/47'si KATALOG paketiyle eşleşti. Resmî ve doğrulanmış
  alıntısı olmayan tek kalem `STD-EN-12101-3` (CEN kataloğu HTTP 500 verdi). Bu sürümde `tarihler`
  alanları ajanların metin notlarını taşır; ISO tarihe çevrilmesi v0.2 işidir.
