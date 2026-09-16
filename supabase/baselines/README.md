# supabase/baselines

Bu klasör, production `public` şemasının **zaman damgalı tam anlık görüntülerini** (snapshot) tutar.
Bunlar **çalıştırılabilir migration DEĞİLDİR** — felaket-kurtarma referansı ve drift görünürlüğü içindir.

## Neden var?

5 tablo (`organizations`, `price_lists`, `product_prices`, `user_projects`, `project_items`)
Supabase panelinden **elle** kuruldu; hiçbir migration'da `CREATE TABLE`'ları yoktu. Ayrıca
`migrations/` zinciri ile canlı şema arasında drift birikmişti (ör. `price_list_id_snapshot`
migration'da `text`, canlıda `uuid`). Bu snapshot'lar **gerçeğin tek kaydını** git'e sokar.

## ⭐HANGİ DOSYA NEDİR — BU BÖLÜM BİR HATADAN DOĞDU (REC-336, 2026-09-15)

⛔**BU KLASÖRDEKİ HER `*_public_schema.sql` AYNI ŞEY DEĞİLDİR ve adları bunu SÖYLEMİYOR.**

2026-09-14'te bu klasörden **en yeni** dosyayı alıp "şema tabanı" saydım, gölgeye oynattım ve
*"elimizde anahtar/indeks/politika içermeyen bir taban var"* diye rapor ettim. **Yanlıştı** —
dosya bozuk değildi, **BAŞKA KAPSAMDAYDI** ve bunu kendi beşinci satırında yazıyordu:
`-- NOT: pg_dump degildir — PK/FK/index/trigger/RLS politikalari DAHIL DEGIL`.

⭐**DERS: "EN YENİ DOSYA" BİR SEÇİM KURALI DEĞİLDİR; artefaktın kapsamını KENDİ BAŞLIĞI
söyler.** Bu bölüm, o seçim kuralını klasörün kendisine yazmak için var — bilgi bir test
yorumunda duruyorsa kapıya bağlı değildir ve bir sonraki okuyucu onu görmez.

**Girdi olarak kullanmadan önce dosyanın ilk satırlarını OKU.** Aşağıdaki tablo hangisinin ne
olduğunu söyler; tablo ile dosya çelişirse **dosyanın kendi başlığı kazanır.**

## Nasıl üretilir?

### Yol A — CI iş akışı (ÖNERİLEN, 2026-09-15'ten beri)

```
.github/workflows/sema-tabani-uret.yml   →   elle tetiklenir (workflow_dispatch)
```

Salt-okuma `supabase db dump --schema-only`. Sır (`SUPABASE_DB_URL`) yalnız CI'da yaşar,
yerel makineye inmez ve log'a **basılmaz** (varlığı `${#DB_URL}` ile uzunlukla ölçülür).
Çıktıyı **artefakt** olarak bırakır; depoya **doğrudan commit etmez** — insan PR açar.
İçinde **boş dökümü reddeden beş eşik** var (tablo ≥ 50, PK ≥ 40, indeks ≥ 100, FK ≥ 80,
politika ≥ 100); niçin: 2026-08-13 dökümü tam böyle geçmişti ve aylarca taban sanıldı.

### Yol B — yerel `pg_dump` (tarihsel, artık tercih edilmiyor)

```bash
# .env içindeki DATABASE_URL (pooler) kullanılır; Docker GEREKMEZ
export DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '"'\''')
pg_dump "$DATABASE_URL" --schema-only --schema=public --no-owner \
  -f supabase/baselines/$(date +%Y-%m-%d)_public_schema.sql
```

⚠Yol B prod bağlantı dizesini **yerel makineye** indirir. Yol A bunu gerektirmiyor; yeni
döküm almanın **varsayılanı Yol A'dır.**

## migrations/ ile ilişki

- **baselines/** = "production ŞU AN tam olarak böyle görünüyor" (anlık görüntü).
- **migrations/** = ileriye dönük, idempotent, çalıştırılabilir değişiklik adımları (R0→B2 planı).

İkisi çelişirse **baseline (canlı gerçek) kazanır**; migration onu yakalayacak şekilde düzeltilir.

### ⛔"replay edilmez" İFADESİ KALDIRILDI — ÖLÇÜMLE YANLIŞ ÇIKTI (2026-09-15)

Bu bölüm önceden *"snapshot, replay edilmez"* diyordu. **Ölçüldü ve öyle değil:** boş bir
PostgreSQL 17.4 kümesine önce `00_golge_onsoz.sql`, sonra `2026-09-15_public_schema.sql`
uygulandı → **0 hata**, ve sonuç canlıyla **sekiz ölçütte birebir** parite verdi.

Yani tam döküm **replay EDİLİR**. Doğru cümle şudur: *baseline bir migration DEĞİLDİR
(defterde yer almaz, `supabase-migrate.yml` onu okumaz), ama sıfırdan kurulumun ilk adımı
olarak KOŞTURULABİLİR.* Eski ifade bir varsayımdı ve "felaket kurtarma yapılamaz" izlenimi
veriyordu. Önsöz niçin gerekli: döküm Supabase'in kendi iskelesini (auth/extensions şemaları,
dokuz rol, `auth.users`, `vault`, `net`, `cron`) **hazır varsayar**.

## ⏰TAZELİK ALARMI — INV-TABAN-TAZE-1 (2026-09-16, Recep sorusu)

Recep aynen: *"ben DB'de değişiklik yaptığım an senin kendi yedeğin bayat olacak; tekrardan
onu tazelemek yine 2 gün mü sürecek?"*

**Ölçülmüş cevap: tazelemek iki gün DEĞİL.** Döküm CI'da **57 saniyede** alınıyor (koşum
`34950954930`). İki gün süren şey **keşifti** — hangi dosyanın taban olduğunu bulmak, birinin
KISMİ olduğunu görmek, gölge kümeyi elle kurmak. O keşif bir kez yapıldı ve bu README'ye yazıldı.

⛔**Eksik olan şey ölçüm değil, ALARM'dı:** bugüne kadar tabanın bayatladığını söyleyen hiçbir
şey yoktu. Fark edildiği gün yeniden keşfe başlanır ve **o zaman** gerçekten iki gün gider.

**Alarm iki yerde konuşur, ikisi de aynı ölçütü kullanır:**

| Nerede | Ne zaman | Ne yapar |
|---|---|---|
| `src/__tests__/conformance/taban-tazeligi.test.ts` | her PR (CI) | taban geride kalmışsa **bloklar** |
| `.claude/hooks/defter-tazelik-satiri.cjs` (`TABAN:` satırı) | her turda, oturum içinde | **görünür** uyarı + onarım yolu |

İkincisi niçin şart: ölçen ama **kararın verildiği yerde görünmeyen** kapı, görünmeyen kapıdır
(REC-342'de ölçüldü — defter bayatlık kancası 7 gün doğru kırmızı verdi ve kimse görmedi).

**ÖLÇÜT — sır gerektirmez, ağ gerektirmez.** Recep'in kendi düzeltmesi bunu mümkün kıldı:
*"ben kendim bir müdahale ile yapmıyorum, size yaptırıyorum ve gerekirse migration onayı
veriyorum."* Yani DB'ye giden her değişiklik **onaylanmış bir migration dosyasıdır**; o zaman
soru tamamen dosya adlarından cevaplanır: **en yeni TAM taban tarihi ↔ en yeni migration damgası.**

Üç ayrıntı ölçümle geldi ve ikisi kapının kendi yazarını yakaladı:
1. **TAM/KISMİ ayrımı dosya adıyla değil İÇERİKLE yapılır** — tam döküm `create policy` taşır
   (06-12 → 101, 09-15 → 163), kısmi olan taşımaz (08-13 → 0). Yukarıdaki "en yeni dosya bir
   seçim kuralı değildir" dersinin makine karşılığı budur.
2. **Sahada ÜÇ damga biçimi var:** 14 hane (kanonik), **12 hane (13 dosya)**, 8 hane (tarihsel).
   Kapı ilk yazıldığında 12 haneliyi tanımıyordu ve o 13 dosya **sessizce karşılaştırmadan
   düşüyordu**. Biçim kuralı (14 hane zorunlu) ayrı kapıdadır: `INV-MIGRATION-2`.
3. **ÖLÇEMEDİ ≠ TAZE:** TAM taban bulunamazsa satır `⚠TABAN: OLCULEMEDI` basar ve sebebini yazar.

⚠**ALARMIN GÖRMEDİĞİ ŞEY, ADIYLA:** bir migration merge edilip **canlıya uygulanmamış** olabilir.
2026-09-15'te ölçüldü: `20250919_fts_search_products.sql` beş indeks yaratıyor, canlıda yalnız
**ikisi** var ve hiçbir kapı görmemişti. Yani **dosya tarihi "uygulandı" demek değildir.** O
eksiği ancak **sayarak doğrulama** kapatır (canlı sayım ↔ taban sayımı) ve o AYRI bir adımdır
(`db-advisor.yml` hattı, sır gerektirir). Bu alarm yalnız *"taban geride mi"* der.

## Geçmiş

| Tarih | Dosya | Kapsam | Not |
|---|---|---|---|
| 2026-06-12 | `2026-06-12_public_schema.sql` | **TAM** (pg_dump) | İlk tam baseline. 38 tablo, PK 39, 113 kısıt, 78 indeks, 61 FK, 101 politika, 237 GRANT. pg_dump 17.4 → server 17.6. |
| 2026-08-13 | `2026-08-13_public_schema.sql` | ⚠**KISMİ — TABAN DEĞİL** | **pg_dump DEĞİL.** orion belge üretimi için alınmış bir **kolon anlık görüntüsü**: 41 tablo listesi, ama PK 1, kısıt 0, indeks 0, FK 0, politika 0, GRANT 0. Dosya bunu kendi 5. satırında yazıyor. **Şema tabanı olarak KULLANILMAZ** — 2026-09-14'te tam bu hata yapıldı. |
| 2026-09-15 | `2026-09-15_public_schema.sql` | **TAM** (supabase db dump) | CI iş akışıyla (Yol A) alındı, koşum `34950954930`, 57 sn. 8616 satır / 340 KB. 66 `create table`, 56 PK, 113+11 indeks, 110 FK, 163 politika, 67 fonksiyon, 48 tetik, 379 GRANT. Gölgede **0 hata**, canlıyla **8/8 parite**. Sır taraması yapıldı: 13 imza, **hepsi 0** (depo PUBLIC). |
