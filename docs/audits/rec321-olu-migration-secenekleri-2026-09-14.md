# REC-321 adım 3 — altı ölü migration dosyasının akıbeti: ÖLÇÜM + SEÇENEKLER

**Tarih:** 2026-09-14 · **Şerit:** ALTYAPI · **Durum:** KARAR BEKLİYOR (Recep'in kapısı)
**Bu belge bir karar değil, karar için ölçümdür.** Hiçbir dosya silinmedi, taşınmadı, değiştirilmedi.
Prod veritabanına yazılmadı; prod veritabanına **bağlanılmadı bile** (aşağıdaki defter kanıtı dolaylı).

## KAYNAK/CETVEL

- **Ölçüm kaynağı:** `docs/audits/rec315-squawk-ilk-tarama-2026-09-13.md` §4.3 (squawk-cli 2.65.0).
- **Yöneten cetveller:** `CLAUDE.md` kural 13 (migration merge = prod'a otomatik uygulama) ·
  `.github/workflows/supabase-migrate.yml` (ledger modeli + parite kapısı) ·
  `src/__tests__/conformance/migration-ledger-model.test.ts` (R1–R3) ·
  `INV-MIGRATION-2` (14 haneli damga) · `INV-MIGRATION-3` (PR kapısı, #1172).
- **Cetvel boşluğu:** "prod'a hiç uygulanmamış ama depoda duran migration dosyası ne olur"
  sorusunun yazılı cevabı **YOK**. Bu işin kapsamı o cevabı yazmayı da içeriyor — ama cevabın
  kendisi Recep'in kararı, çünkü üç seçenekten ikisi prod veritabanına dokunuyor.

## 1 · ÖLÇÜLEN GERÇEKLER

| Ne | Değer | Nasıl ölçüldü |
|---|---|---|
| Depodaki migration dosyası | **236** | `ls -1 supabase/migrations/*.sql \| wc -l` |
| Geçersiz SQL taşıyan ölü dosya | **6** | aşağıdaki tablo |
| `migrations/` altında alt dizin | **YOK** | `ls -d supabase/migrations/*/` boş |
| Son `supabase-migrate` koşumu | **2026-09-13 18:35Z, başarılı** | `gh run list --workflow=supabase-migrate.yml` |
| O koşumda **parite adımı** | **koştu ve GEÇTİ** | `gh run view 34775094857` adım listesi |
| Parite kapısının eklendiği tarih | **2026-08-17** (#598) | `git log -S"Ledger paritesi"` |
| O koşumun SHA'sında dosya sayısı | **236** | `git ls-tree -r 643c7089 -- supabase/migrations/` |
| Altı dosya o SHA'da mevcut muydu | **altısı da VAR** | `git cat-file -e` |

### Altı ölü dosya

| Dosya | geçersiz `IF NOT EXISTS` sayısı |
|---|---:|
| `202508261956_user_invoice_profiles.sql` | 8 |
| `20250907_admin_audit_log.sql` | 4 |
| `20250908_client_errors.sql` | 3 |
| `20250908_error_groups.sql` | 6 |
| `20250908_error_groups_policies_fix.sql` | 2 |
| `20250909_fix_product_images_rls.sql` | 3 |

PostgreSQL `CREATE POLICY` için `IF NOT EXISTS` sözdizimini **desteklemiyor**. Bu altı dosya
koşsaydı hata verirdi; koşmadılar çünkü ledger onları "görülmüş" sayıyor.

## 2 · ⭐BELİRLEYİCİ MEKANİZMA — LEDGER PARİTESİ KAPISI

Karar bu kapıya çarpıyor ve seçenekleri o daraltıyor. `supabase-migrate.yml`'ın son adımı şunu
iddia ediyor: **depodaki dosya adları listesi ile `public._migration_ledger` tablosundaki kayıt
listesi BİREBİR AYNI olmalı.** İki yön de hata sayılıyor ve koşu kırmızı yanıyor:

- dosya var, defterde yok → bir sonraki koşu onu **yeniden uygular**;
- defterde var, dosya yok → **uygulanmış bir migration depodan silinmiş**, DB ile depo ayrışmış.

**Çıkarım (dolaylı ama sağlam):** son koşum bu adımı geçtiğine göre, o an depodaki **236 dosyanın
hepsi** defterde kayıtlıydı — altı ölü dosya **dahil**. Bunu ölçmek için prod veritabanına
bağlanmaya gerek yoktu; yeşil geçen parite adımı bunu zaten söylüyor.

⚠**İstisna mekanizması YOK.** Parite adımında beyaz liste, atlama listesi ya da muafiyet
kavramı bulunmuyor (ölçüldü: `grep -n "istisna\|whitelist\|ignore" .github/workflows/supabase-migrate.yml`
bu adımda boş döner; çıkan `skipped` eşleşmeleri bir üstteki *uygulama* adımına ait).

⚠**Glob ÖZYİNELEMELİ DEĞİL.** Hem uygulama hem parite adımı `supabase/migrations/*.sql`
kullanıyor, yani bir alt dizin (`uygulanmaz/` gibi) **listeye girmez**. Dosyayı alt dizine taşımak,
parite açısından **silmekle aynı sonucu** verir.

## 3 · SEÇENEKLER — prod veritabanına dokunma sütunuyla

| # | Seçenek | Prod DB'ye dokunur mu | Ne olur | Bedeli |
|---|---|---|---|---|
| **1** | Dosyaları **sil** + defterdeki altı satırı **sil** | **EVET — prod DB'ye DELETE** | Parite yeniden kurulur, depo temizlenir, geçersiz SQL depodan çıkar | ⛔Kural 13'ün tam kapsamı: prod veritabanına yazma. **Recep'in kendi sözü, kendi penceresi.** Ayrıca silinen satırlar geri getirilemez; DR/yeniden kurulum senaryosunda bu dosyalar artık hiç yoktur |
| **2** | Dosyaları **yerinde tut**, başlarına **"ÖLÜ — hiç uygulanmadı"** bloğu yaz | **HAYIR** | Dosya adı ve glob değişmez → parite **yeşil kalır**; defter "görüldü" der, SQL **hiç koşmaz**; okuyan artık yanılmaz | Geçersiz SQL depoda kalır. Defter bir gün sıfırlanırsa bu dosyalar koşmaya kalkar ve koşu **kırmızı** yanar — sessiz boşluk değil, gürültülü hata (fail-closed) |
| **3** | Parite kapısına **istisna listesi** ekle, sonra dosyaları sil/taşı | **HAYIR** | Kapı yeşil kalır, dosyalar depodan çıkar | ⚠**Kapının amacını yok eder.** Defter, "atla" kararının **tek** dayanağı; istisna listesi o dayanağın kör bir sınıfını yaratır. Üstelik konformans kolu R3 parite adımının **varlığını** ölçüyor, **katılığını ölçmüyor** — istisna eklenince kapı yeşil görünmeye devam eder. Bu, bu projede adı konmuş bir kusur sınıfı: *yeşil kapı bakmadığı şeyi kanıtlamaz* |
| **4** | Dosya içeriğini **zararsız hâle getir** (geçersiz SQL yerine yorum) | **HAYIR** | Ad ve glob değişmez, parite yeşil; defter sıfırlanırsa dosya koşar ve **başarıyla hiçbir şey yapmaz** | ⚠En riskli görünmeyen seçenek: defter sıfırlanma senaryosunda **sessiz boşluk** üretir. Dosyanın vaat ettiği politika yine yazılmaz, ama artık kimse fark etmez. Seçenek 2'nin gürültülü kırmızısını sessizliğe çevirir |

## 4 · BENİM HÜKMÜM (sorulursa) — Seçenek 2

Üç gerekçe, sırayla:

1. **Tek başına yeterli olan gerekçe:** Seçenek 2, prod veritabanına dokunmayan **ve** parite
   kapısını zayıflatmayan **tek** seçenek. 1 prod'a yazıyor, 3 kapıyı körleştiriyor, 4 gürültüyü
   sessizliğe çeviriyor.
2. **Asıl sorun dosyaların varlığı değil, YANLIŞ İNANÇ.** Bu altı dosyanın gerçek zararı depoda
   yer kaplaması değil; adlarının *"bu tablolara RLS politikası yazıldı"* izlenimi vermesi. Başa
   yazılan bir blok bu inancı **tam olarak** ortadan kaldırır — silmek de kaldırır, ama bedeli
   prod'a yazmaktır.
3. **Fail-closed tercihi bilinçli.** Defter bir gün sıfırlanırsa Seçenek 2 kırmızı verir. Bu bir
   kusur değil, istenen davranıştır: o an gerçekten bakılması gereken bir durum vardır.

**Seçenek 1'i savunan tek ciddi argüman:** depoyu gerçekten temizler ve geçersiz SQL'i tamamen
ortadan kaldırır. Recep bunu tercih ederse ölçüm buna hazır — ama o zaman iş, prod veritabanında
altı satırlık bir silme demektir ve **onun kendi penceresinde, kendi sözüyle** yapılır; ben
hazırlarım, uygulamam.

## 5 · KARAR NE OLURSA OLSUN YAPILACAKLAR

1. **Cetvel yazılır.** "Prod'a hiç uygulanmamış ama depoda duran migration dosyası" için yazılı
   kural bugün **yok**; kararın kendisi o cetvelin ilk maddesi olur. Yeri:
   `docs/standards/` altında migration bölümü.
2. **Bir kapı kararı korur.** Seçenek 2 seçilirse: ölü dosyaların **ilan edilmiş bir listesi**
   (borç defteri kalıbı, `docs/skill-ad-cakismasi-ilani.json` ile aynı mantık) + bir konformans
   kolu — ilan edilen her dosya **hâlâ duruyor mu** ve **ÖLÜ bloğunu taşıyor mu**. Bu kol iki
   ihlali birden yakalar: dosyanın silinmesi (pariteyi kıracaktı) ve başlığın sıyrılması.
3. **Vaat edilen politikaların prod'da olup olmadığı AYRI KAYIT.** Adım 2'de zaten ayrıldı
   (PR #1173, `error_groups` yazma politikası taslağı, **merge edilmedi**). Bu belge o soruyu
   kapsamıyor ve kapsadığını iddia etmiyor.
4. **`create-migration` şablonuna squawk iki satırı** (`lock_timeout` + `statement_timeout`)
   eklenir — REC-315 EK'inde yazılı, bu işten bağımsız ve migration içermiyor.

## 6 · BU ÖLÇÜMÜN SINIRLARI (adıyla)

- **Defterin içeriğini doğrudan okumadım.** Kanıt dolaylı: parite adımının yeşil geçmesi.
  Bu, son koşum (2026-09-13 18:35Z) **anı** için geçerli. O andan bu yana prod veritabanında
  elle bir değişiklik yapıldıysa bu çıkarım bayattır. Doğrudan ölçüm prod DB bağlantısı ister;
  salt-okuma bile olsa bu belge için gerekli değildi ve yapılmadı.
- **Dosyaların vaat ettiği politikaların prod'da var olup olmadığı bu belgede ÖLÇÜLMEDİ.**
  Ayrı kayıt (§5.3).
- **Geçersiz SQL sayısı düz metin araması.** `grep -ci 'IF NOT EXISTS'` sayıyor; `CREATE POLICY`
  dışındaki bağlamlarda geçen `IF NOT EXISTS` (ör. `CREATE TABLE IF NOT EXISTS`, ki o **geçerli**)
  bu sayıya karışmış olabilir. §4.3'ün orijinal ölçümü squawk linter'ıyla yapıldı ve **11**
  geçersiz ifade dedi; benim 26'lık toplamım ondan büyük, yani fark tam olarak bu karışmadır.
  Kararı etkilemiyor (dosya kümesi aynı), ama sayı olarak squawk'ın 11'i doğru olan.
- **Seçenek 1'in bedeli tam ölçülmedi:** defterden satır silmenin DR/yeniden kurulum senaryosunda
  ne ürettiği ayrı bir ölçüm ister. Recep o seçeneğe yönelirse önce o ölçülür.

— ALTYAPI 2026-09-14, REC-321 adım 3
