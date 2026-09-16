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

## Geçmiş

| Tarih | Dosya | Kapsam | Not |
|---|---|---|---|
| 2026-06-12 | `2026-06-12_public_schema.sql` | **TAM** (pg_dump) | İlk tam baseline. 38 tablo, PK 39, 113 kısıt, 78 indeks, 61 FK, 101 politika, 237 GRANT. pg_dump 17.4 → server 17.6. |
| 2026-08-13 | `2026-08-13_public_schema.sql` | ⚠**KISMİ — TABAN DEĞİL** | **pg_dump DEĞİL.** orion belge üretimi için alınmış bir **kolon anlık görüntüsü**: 41 tablo listesi, ama PK 1, kısıt 0, indeks 0, FK 0, politika 0, GRANT 0. Dosya bunu kendi 5. satırında yazıyor. **Şema tabanı olarak KULLANILMAZ** — 2026-09-14'te tam bu hata yapıldı. |
| 2026-09-15 | `2026-09-15_public_schema.sql` | **TAM** (supabase db dump) | CI iş akışıyla (Yol A) alındı, koşum `34950954930`, 57 sn. 8616 satır / 340 KB. 66 `create table`, 56 PK, 113+11 indeks, 110 FK, 163 politika, 67 fonksiyon, 48 tetik, 379 GRANT. Gölgede **0 hata**, canlıyla **8/8 parite**. Sır taraması yapıldı: 13 imza, **hepsi 0** (depo PUBLIC). |
| 2026-09-16 | `2026-09-16_public_schema.sql` | **TAM** (supabase db dump) | CI iş akışıyla (Yol A) alındı, koşum `35091853687`. 8910 satır / 344 KB. **57 tablo · 57 PK · 20 unique · 111 FK · 205 indeks · 164 politika · 72 fonksiyon**. Gölgede (`taban_0916`) **7 hata** — hepsi ortam/yetki (extension yalnız `postgres` DB'sinde, `supabase_realtime` publication yok, `secrets` zaten var, `net` şeması `pg_net` üyesi değil), **şema parçası kaybı YOK**. Canlıyla **4/4 parite**: tablo 57=57 · politika 164=164 · indeks 205=205 · FK 111=111. Sır taraması: 13 imza; `service_role` 203 eşleşme ama hepsi **rol ADI** (GRANT/`auth.role()` karşılaştırması), anahtar DEĞİL — önceki tabanda da 195 vardı, aynı sınıf. Diğer 12 imza **0**. |

## ⭐2026-09-16 TAZELEMESİ — NİÇİN VE FARKI (REC-340 Adım 2 sonrası)

Bu taban, arama gövdesi genişletmesi canlıya indiği için (#1221) alındı. Önceki tabana
göre fark ölçüldü ve **yalnız EKLEME çıktı, kayıp YOK** (`diff` ile, nesne adı düzeyinde):

| Sınıf | Eklenen |
|---|---|
| Tablo (2) | `product_search_index`, `search_reindex_queue` |
| Fonksiyon (5) | `arama_indeksi_tazele`, `arama_kuyrugu_bosalt`, `tg_arama_aile_kuyrukla`, `tg_arama_kategori_kuyrukla`, `tg_arama_urun_tazele` |
| Politika (1) | `product_search_index_tenant_read` |
| Sayılar | indeks 124 → 128 (dosyada), FK 110 → 111, politika 163 → 164 |

⭐**FARK ÖLÇÜMÜ "SAYI KARŞILAŞTIRMASI" DEĞİL, AD KARŞILAŞTIRMASIDIR.** Sayı eşitliği
bir şeyin gidip başka bir şeyin gelmesini gizler; `diff` ile ad listesi karşılaştırınca
kayıp olup olmadığı görünür. Bu tazelemede `<` işaretli (kaybolan) tek satır çıkmadı.

⚠**BİR ÖLÇÜM TUZAĞI, ADIYLA:** ilk farkı `diff A && diff B && diff C` diye zincirlemiştim;
`diff` fark bulduğunda **1 döndürdüğü için zincir ilk farkta KESİLDİ** ve fonksiyon/politika
farkları hiç koşmadı — ama ekranda hata da görünmedi. Farklar `;` ile ayrılıp yeniden
ölçüldü. ⭐Ders: `&&` ile zincirlenen ölçüm, başarısızlığı "fark" sayan bir araçla
kullanılamaz; sessiz eksik ölçüm üretir.
