# Genel Vitrin Metni Standardı (Cetvel) — v0.2 TASLAK (OPS-29, BLG-1)

> **Sahibi:** BLOG (OPS kararı, 2026-10-09). M5 kapı kodu GEO-SEO'da (SEO-20); M6 beyan kaydı OPS'ta (REC-425).
> **Son doğrulama:** 2026-10-09. Envanter sayıları aynı gün canlı HTML (TR ve EN) ve master sözlüğü ile yeniden sayıldı; bkz. `ops29-site-metni-envanteri-2026-10-03.md` §3a–§3c.
> **Durum:** TASLAK, yürürlükte değil. Karar OPS'ta; `docs/README.md` satırı ve `cetvel-sahipligi.md` kaydı 11 Ekim'den sonra HARİTA ile yürürlüğe alınırken eklenir.
> **Ne yönetir:** müşterinin gördüğü, `vitrin-metni-standard.md` K1'in **sayamadığı** metinler: ana sayfa (sözlük `home`),
> sabit sayfalar (hakkımızda, iletişim, altbilgi), kategori açıklaması (`categories.metadata`), marka açıklaması (`brands.ts`),
> arama açıklamaları (`<meta name="description">`, ana sayfa, kategori, marka), Bilgi Merkezi liste metni.
> **Niçin var:** OPS-29 envanteri (`docs/audits/ops29-site-metni-envanteri-2026-10-03.md`): bu yüzeylerin hiçbirini yöneten cetvel yok;
> ana sayfa ve hakkımızda'da 16 bulgu satırı, kategori/aile/marka metinlerinde 9 gerçek üstünlük iddiası ölçüldü (10-03 ölçümü).
> 10-09 yeniden sayımda 16 satırın 13'ü olduğu gibi canlıda duruyor, 3'ü 10-08'de #1758 ile tamamen ya da kısmen kalktı; envanterde olmayan yeni uçlar ve İngilizce sayfalardaki sorunlar da bulundu.
> **Yeni şey icat edilmedi:** M1–M5 iki cetvelden genişletilir; M6–M7 YENİ ve ayrıca karar ister (aşağıda işaretli).

## M0 Kapsam genişletmesi

`vitrin-metni-standard.md` K1 tablosuna şu alanlar eklenir (aynı K2–K7 kuralları bunlara da uygulanır): `home.*` sözlük
anahtarları, `about.*`, altbilgi sözlük anahtarları, `categories.metadata` içindeki `description_i18n` ve benzeri metin alanları,
`brands.ts` `description`, meta açıklama üreten her şablon. Kural zinciri: bir metin hangi alana ait olursa olsun müşteriye gidiyorsa kapsamdadır.

## Kurallar (kaynak maddeye bağlı)

| Madde | Kural | Kaynağı |
|---|---|---|
| M1 | İç not, taslak, editör sesi ("…pasif logo vitrini olmaktan çıkarıp…" gibi iç hedef cümleleri) metinde bulunmaz | K2 |
| M2 | Olumsuz iddia ("…içermez", "…gerekmez") kaynakta aynen geçmiyorsa yazılmaz | K4.1, R4.5 |
| M3 | Birimi, kapsamı ya da doğruluğu belirsiz teknik değer yazılmaz; "ultra sessiz", "maksimum verim" gibi ölçüsüz üstlük de bu sınıftır | K6 |
| M4 | Metin yalnız sayfanın dilinde görünür; dil düşüşü yok. TR ve EN aynı şeyi söyler: yalnız bir dilde bulunan iddia ya da cümle yazılmaz (10-09 canlı okumada EN ana sayfanın güven bölümünde 14 anahtar TR ile aynı anlamı taşımıyordu ve çoğu editör notu gibi okunuyordu; hakkımızda başlığı kırıktı; envanter §3c) | K10 |
| M5 | **Üstünlük, kıyas, garanti ve vaat yasak** ("en iyi", "dünya lideri", "kusursuz", "kesintisiz", "sistemin ömrü boyunca yanınızdayız"). İstisna: kaynağı gösterilen ve sayıyla doğrulanabilir kıyas ("VentHub'ın en geniş kategorisi" → ürün sayısı yazılır ya da cümle kalkar) | R4.2; ortak liste `src/lib/seo/ovguAyikla.ts` |
| M6 **YENİ** (OPS 10-09, karar 317'nin yazıya geçmişi) | **İşletme beyanı** (deneyim yılı, stok, teslimat süresi, sertifika/yetki, garanti, çalışma saati, test sonucu, çalışan kadrosu, destek vaadi) kaynaksızsa **kalkar ve yerine doğru, somut bir cümle konur**; yalnız silmek yetmez. Kaldırmayı OPS onaylar, Recep'e bilgi verilir. Yeni bir işletme beyanı eklemek Recep kararıdır; toplu yazılı beyan istenmez | Envanter §3: bu türden 5 satır; §3b |
| M7 **YENİ** (ayrı madde, OPS 10-09) | **Süslü soyut ifade** ("mükemmeliyet", "estetik", "sanat eseri", "kürasyon", "deterministik", "katman", "geleceği") yerine her başlık ve ilk cümle somut bir ürün, ölçü ya da kullanım durumu söyler. Sayılabilir ölçüt: başlıkta ve ilk cümlede en az bir somut isim (ürün, ölçü, kullanım yeri) ve sıfat başına bir kanıt | Envanter §3 türü C: 5 satır |
| M8 **YENİ** (BLG-7, Recep 10-09: "doğrula, tam kapsamlı, tutarlı ve deterministik, uydurma yok, gerçek veri") | **Marka ve üretici olgusu** (menşei/ülke, kuruluş yılı, merkez ya da adres, web adresi, "grubun şirketi", üreticinin yıl ya da yüzde içeren beyanı) yalnız [marka-olgu-kaydi.json](marka-olgu-kaydi.json) kaydında **DOGRULANDI** (iki bağımsız yayında birebir alıntı) ya da **TEK_KAYNAK** (bir yayında birebir alıntı) olan hâliyle yazılır. **DOGRULANAMADI olgu vitrine ve `brands.ts`'e yazılamaz.** Kanıt, betiğin ham metinde bulduğu birebir alıntı ve sha256'dır; araştırma ajanının özeti, hafıza ve "bilinen bilgi" kanıt değildir. Olgu önce kayda (adres + alıntı), sonra betik koşusu, sonra metne girer; sıra tersine çevrilmez | R2.3, K4.1, karar 317 |

## M8 ayrıntısı — marka ve üretici olguları (BLG-7, 2026-10-09)

**Niçin var:** 10-09 incelemesinde marka kayıtlarında (`src/data/brands.ts`) kaynak satırı olmayan olgular bulundu. AVenS için başka bir şirketin sitesi (avens.com.tr, Ankara, bağlantı parçaları) ve 2010 kuruluş yılı yazılıydı; AVenS'in kendi sitesi 2017 diyor. Nicotra Gebhardt için 1959 yazılıydı; hiçbir resmî kaynakta yok, Gebhardt'ın kendi tarihi 1958. Vortice için "kuruluş 1954" yazılıydı; resmî metin "1954'ten beri" ve "1954-1955 Başlangıçlar" diyor, "kuruldu" demiyor. Olgunun kaynağı kodun dışında, bir araştırma özetinde duruyordu; hiçbir kapı göremedi (R2.3: özetleyici araç kanıt değildir).

**Kayıt ve durumlar.** Her (marka, alan) için tek karar satırı; kaynaklar `kaynaklar` listesindedir:

| Durum | Anlamı | Yazılabilir mi |
|---|---|---|
| DOGRULANDI | En az iki **bağımsız yayında** (marka sitesi ≠ üreticinin kendi PDF kataloğu ≠ firma fiyat listesi; aynı sitenin iki sayfası tek yayındır) birebir alıntı bulundu | Evet |
| TEK_KAYNAK | Bir yayında birebir alıntı bulundu | Evet, kaynağı kayıtta durur |
| DOGRULANAMADI | Alıntı yok ya da kaynaklar çelişiyor | **Hayır**; kayıtta `neden` yazılıdır |

**Kurallar:**

1. **Olgu türü kaydın alanıdır.** "Kuruldu" ile "…'ten beri" ayrı olgudur. Kaynak "Since 1954" diyorsa yalnız "1954'ten beri" yazılır (`faaliyetBaslangici`); "1954'te kuruldu" yazılmaz (`founded` satırı DOGRULANAMADI).
2. **Merkez.** Kaynakta headquarters ya da merkez sözcüğü geçiyorsa ya da kaynak tek tüzel kişinin firma adres bloğuysa "merkez" yazılabilir. Ülke ofisleri listesinden bir adres (Nicotra Gebhardt, Waldenburg) yalnız "Almanya'da Waldenburg adresli" der; "merkezli" demez.
3. **Ülke.** Kaynağın kendi adres bloğundaki ülke ya da şehir esastır. Kaynak iki ülkeli anlatıyorsa ("German and Italian", "Founding Years in Italy and Germany") tek ülke menşei yazılmaz; kaynağın kendi ifadesi yazılır. Şehirden çıkarım (`dogrudan:false`) tek başına olguyu doğrulamaz.
4. **Üretici beyanı** (yüzde, "öncü", "lider", "en geniş"): üstünlük ve kıyas ifadesi atıflı da yazılmaz (M5). Sayı içeren beyan ("enerji tüketiminde %80'e varan azalma") yalnız "Danfoss'a göre" ya da "Danfoss … belirtiyor" atfıyla ve kayıtta `sayilar` listesine girmiş olarak yazılır.
5. **Web adresi.** Markanın kendi alan adıdır; aynı adı taşıyan başka şirket olabilir (avens.com.tr ≠ avensair.com). Adresin o markanın şirketine ait olduğunu şirket unvanı ya da adres bloğu gösterir; alan adı benzerliği kanıt değildir. Yönlenen adres (vortice.it → vortice.com) `esdegerler` altında yazılır.
6. **Dağıtıcılık, yetki, kurumsal bağ.** Markanın resmî sayfasında yazılıysa o kaynakla, değilse işletme kararıyla (`ic-karar` + karar numarası) yazılır. Resmî sayfada ya da kararda olmayan "yetkili distribütör" ifadesi yazılmaz (M6).
7. **Bayat kaynak.** Betik her kaynağı ham çeker, yönlenmeyi ve sayfa değişimini (sha256) bildirir; alıntı yerindeyse `~ HASH-DEGISTI` bilgidir, alıntı yoksa KALDI olur ve kayıt güncellenmeden olgu kullanılamaz. Kayıt her çeyrekte ve bir marka sayfası değiştiğinde yeniden doğrulanır.
8. **Kapsam dışı:** ürün aileleri, model sayıları ve teknik değerler bu kaydın değil, katalog veritabanının ve kaynak dizininin işidir (`vitrin-metni-standard.md` K1/K6).

**Nasıl işler:** `node scripts/rehber/marka-olgu-dogrula.mjs cek --ham <dizin>` kayıttaki resmî adresleri ham çeker; `… dogrula --ham <dizin> --dizin <sayfalar.jsonl> --yaz` her alıntıyı ham metinde (ve katalog kaynaklarını kaynak dizininde) arar, bulgu alanlarını kayda yazar; `… kontrol` kaydı ağsız denetler. Ağa çıkan iki komut CI'da koşmaz.

**Yeni olgu eklemek:** (1) kayda satır: alan, `deger`, `kaynaklar` (adres + birebir alıntı, kataloğa dayanıyorsa `pdf_hash` + sayfa); (2) `dogrula --yaz`; (3) ancak sonra `brands.ts` ya da metin. Yeni markanın kayıtta karşılığı olmadan INV-MARKA-OLGU-1 kırmızıdır.

## "Yapay zekâ kokusu" kuralı var mı? (ölçüldü 2026-10-03)

İki cetvelde **yok**: `vitrin-metni-standard.md`'de hiç geçmiyor; `rehber-yazisi-standard.md` yalnız yazı için üstünlük vaadini (R4.2) ve "yapay zekâ notu konmaz" kararını (106) taşıyor. M7 bu boşluğu "koku" diye değil, **sayılabilir ölçüt** olarak kapatır; "kokuyor" hükmü kural olamaz, kanıt ister.

## Kapılar (öneri, yazılmadı)

- M5: `ovguAyikla.ts` kalıbına sözcük sınırı (`\b`) eklenmeden aile/kategori metnine uygulanmaz: envanterde 12 yanlış alarmın 3'ü "yerden yüksekliği", "üstünde", "en üstünden" sözcüklerinden. Kapı SEO'da (SEO-20), liste ortak.
- M6/M7: yeni kural; kapı ancak karardan sonra (envanter betiği taslağı `scripts/` altında, yazılmadı).
- **M8 (YAZILDI, 2026-10-09):** `INV-MARKA-OLGU-1` (`src/__tests__/conformance/marka-olgu-kaydi.test.ts`) `brands.ts` ile kaydı çapraz denetler: yazılı country/founded/headquarters/website kayıtla birebir, açıklamadaki yıl ve yüzde kayıtta, açıklamada övgü kalıbı yok. Ölçüm günü çatışan 9 olgu **kapalı ve kendi kendini temizleyen** `BILINEN_ACIK` listesindedir (Ürün işi, URN-82); yeni çatışma kırmızıdır, düzelen açık listeden silinmezse kırmızıdır. `INV-MARKA-OLGU-2` (`scripts/rehber/__tests__/marka-olgu-dogrula.test.ts`) kaydın şemasını ve kuralları sabotajla sınar. Taslak metin tablosu (anahtar | eski | yeni) için `scripts/rehber/vitrin-tablo-tara.mjs` aynı yasak kalıpları, uydurma sayı ve özel ad kapısını, İngilizce alt kategori terim kalıplarını (INV-EN-ALT-KATEGORI-TERIM-1) ve kayıt çaprazını teslimden ÖNCE koşar.
- Canlı metin değişikliği Recep sözüyle; bu taslak metne dokunmaz.

## Sorular ve OPS yanıtları (2026-10-09)

1. Cetvel sahibi: **BLOG**. M5 kapı kodu GEO-SEO'da (SEO-20); M6 beyan kaydı OPS'ta (REC-425).
2. M6'daki beyanları kim yazar? Kaynaksız beyan kalkar, OPS onaylar, Recep'e bilgi verilir; yeni beyan Recep kararıdır; toplu yazılı beyan istenmez.
3. M7 ayrı madde olarak kalır.
4. Yürürlüğe alma (README satırı, `cetvel-sahipligi` kaydı): 11 Ekim'den sonra HARİTA ile; bu belge o güne kadar TASLAK'tır.
