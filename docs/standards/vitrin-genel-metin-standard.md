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

## "Yapay zekâ kokusu" kuralı var mı? (ölçüldü 2026-10-03)

İki cetvelde **yok**: `vitrin-metni-standard.md`'de hiç geçmiyor; `rehber-yazisi-standard.md` yalnız yazı için üstünlük vaadini (R4.2) ve "yapay zekâ notu konmaz" kararını (106) taşıyor. M7 bu boşluğu "koku" diye değil, **sayılabilir ölçüt** olarak kapatır; "kokuyor" hükmü kural olamaz, kanıt ister.

## Kapılar (öneri, yazılmadı)

- M5: `ovguAyikla.ts` kalıbına sözcük sınırı (`\b`) eklenmeden aile/kategori metnine uygulanmaz: envanterde 12 yanlış alarmın 3'ü "yerden yüksekliği", "üstünde", "en üstünden" sözcüklerinden. Kapı SEO'da (SEO-20), liste ortak.
- M6/M7: yeni kural; kapı ancak karardan sonra (envanter betiği taslağı `scripts/` altında, yazılmadı).
- Canlı metin değişikliği Recep sözüyle; bu taslak metne dokunmaz.

## Sorular ve OPS yanıtları (2026-10-09)

1. Cetvel sahibi: **BLOG**. M5 kapı kodu GEO-SEO'da (SEO-20); M6 beyan kaydı OPS'ta (REC-425).
2. M6'daki beyanları kim yazar? Kaynaksız beyan kalkar, OPS onaylar, Recep'e bilgi verilir; yeni beyan Recep kararıdır; toplu yazılı beyan istenmez.
3. M7 ayrı madde olarak kalır.
4. Yürürlüğe alma (README satırı, `cetvel-sahipligi` kaydı): 11 Ekim'den sonra HARİTA ile; bu belge o güne kadar TASLAK'tır.
