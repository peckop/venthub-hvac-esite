# REC-409 — Canlı veritabanının tam, düzenli, şifreli yedeği + denenmiş geri yükleme (plan v1)

> **Durum:** v1 · 2026-10-01 · Sahip: ALTYAPI · **PARK: "ilk satıştan önce"** (Recep 10-01, karar 231 = hayır: "bugün tek seferlik yedeğe gerek yok, zaten sitede satış yok, şirket açılmadı henüz"). Kod yok.
> **Bağlam:** şirket henüz kurulmadı, sitede gerçek satış yok; canlıdaki sipariş ve kullanıcı verisi denemedir. Bu iş acil değildir; satış hazırlığı listesinde sırası gelince açılır.
> **Kararlar o zaman sorulacak (229, 230, 232 geri çekildi):** saklama yeri · gizli anahtar kimde, kaç kopya · zamanlanmış koşum izni.
> **Emsal (sıfırdan tasarlanmaz):** `scripts/pim/unopim-yedek.cjs` (REC-357, 2026-09-23): `al` / `dene` / `coz` komutları, makine dışına yalnız şifreli tek dosya, hedef dizin depo içinde olamaz kapısı, ayrı ortamda geri kurma denemesi ve sayım karşılaştırması. Canlı veritabanı yedeği aynı düzeni izler.
> §5 plan-challenger sonucu için ayrılmıştır; koşmadan uygulama başlamaz.

YÖNTEM: şerit; plan → plan-challenger (canlı veri) ZORUNLU → uygulayıcı (sonnet) → geri yükleme denemesi bağımsız doğrulayıcıyla.

## 1. Ölçüm (salt okuma, 10-01)

| Ölçü | Değer |
|---|---|
| Supabase planı | **FREE** → platformun kendi günlük yedeği ve zamana geri dönme (PITR) YOK |
| Veritabanı toplam | 252 MB (public şeması 13 MB, 60 tablo) |
| En büyük tablolar | product_search_index 5,0 MB · products 1,8 MB · admin_audit_log 1,3 MB · product_images 0,8 MB |
| Kullanıcı (auth.users) | 3 |
| Sipariş | 5 (hepsi ağustos denemesi) |
| Dosya deposu (Storage) | 1191 nesne, 37 MB, iki açık kova (product-images, category-images) |
| Vault sırrı | 5 (proje anahtarıyla şifreli; başka projeye geri yüklenemez) |
| Zamanlanmış iş (pg_cron) | 2 |
| Uzantılar | pgroonga, pg_cron, pg_net, pg_trgm, pgcrypto, supabase_vault, … (geri yükleme hedefinde aynıları gerekir) |
| Postgres sürümü | 17.6 → `pg_dump` 17 şart |
| Depoda yedek aracı | Tüm veriyi alan düzenli yedek YOK. Var olanlar: şema tabanı (veri yok), katalog paketi, UnoPim yedeği, 08-11 tek seferlik döküm (bayat) |
| Bağlantı | `SUPABASE_DB_URL` sırrı depoda kayıtlı (şema tabanı iş akışı kullanıyor) |

**Hüküm:** canlı veritabanının güncel ve düzenli yedeği yok; son tam kopya 2026-08-11 tarihli tek seferlik dökümdür. Katalog verisi katalog paketinden, PIM verisi PIM yedeğinden geri kurulabilir. Bugün canlıda gerçek müşteri ve sipariş verisi olmadığı için kayıp riski düşüktür; düzenli yedek ilk gerçek satıştan ÖNCE kurulmuş olmalıdır. Veri küçük (sıkıştırılmış döküm tahminen 10 MB altı; ölçülmedi), yani iş ucuz ve hızlı.

## 2. Tasarım taslağı

1. **Gece iş akışı** (`.github/workflows/canli-yedek.yml`, zamanlanmış + elle tetik; `permissions: contents: read`; self-hosted runner yok): `pg_dump -Fc` (public + auth + storage şemaları, cron işleri ayrıca metin olarak) → **şifrele** → sakla → doğrula (dosya boyutu > eşik, `pg_restore --list` satır sayısı) → başarısızsa kırmızı.
2. **Şifreleme: açık anahtarla (`age`).** Açık anahtar depoda durur; gizli anahtar depoya ve GitHub'a HİÇ girmez. İş akışı şifreler ama açamaz; sızan bir GitHub sırrı yedekleri okutmaz. Parola tabanlı şifreleme (sır GitHub'da) reddedildi: sır ve yedek aynı yerde olur.
3. **Saklama yeri (karar gerekli, §3).** Repo PUBLIC olduğu için iş akışı çıktısı (artifact) oturum açmış herkese indirilebilir; kişisel veri şifreli de olsa orada tutulmamalı.
4. **Dosya deposu** (37 MB görsel): haftalık ayrı kopya; görseller zaten katalog hattından yeniden üretilebilir (doğrulanacak), öncelik düşük.
5. **Saklama süresi:** 7 günlük + 4 haftalık + 3 aylık (KVKK saklama süresiyle çelişmemeli → MEVZUAT'a sorulacak).
6. **Geri yükleme denemesi:** Docker'da Postgres 17 + Supabase rolleri/uzantıları (`golge-kur.mjs` düzeni) → `pg_restore` → tablo başına satır sayısı canlıyla eşit + örnek sorgular. Deneme ayda bir tekrarlanır (denenmeyen yedek yedek değildir). Vault sırları geri yüklenmez: yeniden girilecek sırların listesi cetvele yazılır.
7. **Tazelik kapısı:** açılış satırına `YEDEK: son N saat` (TABAN satırı emsali); 36 saati geçerse uyarı. Kapı: `INV-YEDEK-TAZE-1`.
8. **Cetvel:** ne yedeklenir, nerede durur, kim açabilir, nasıl geri yüklenir (adım adım), ne geri yüklenemez.

## 3. Kararlar (OPS'a; hesap/para/anahtar olanlar Recep'e)

1. **Saklama yeri.** Seçenekler: (a) ayrı PRIVATE GitHub deposuna sürüm dosyası olarak (ücretsiz, hesap zaten var; yazma için dar yetkili yeni bir belirteç gerekir = sır yazımı, Recep kapısı); (b) Cloudflare R2 (hesap ve belirteç sırları depoda kayıtlı; R2 açık mı ve kart ister mi ÖLÇÜLMEDİ); (c) Recep'in Google Drive'ı (hizmet hesabı gerekir). Önerim (a): en az yeni hesap, sıfır maliyet.
2. **Gizli anahtar kimde, kaç kopya.** Önerim: Recep'in makinesinde + makine dışında ikinci kopya (parola yöneticisi ya da kâğıt). Anahtar kaybı = bütün yedeklerin kaybı.
3. **Supabase Pro'ya geçiş** ($25/ay; günlük platform yedeği 7 gün) ayrı karar: bu iş Pro olsa da gerekir (platform yedeği proje silinince gider), ama Pro ikinci bir kat ekler. Bilgi olarak.
4. İlk yedek elle mi alınsın (bugün, tek sefer, Recep'in makinesine şifreli)? Önerim evet: iş akışı kurulana kadar geçen günlerde de kopya olsun. Canlıdan okuma + yerel dosya; canlıya yazma yok.

## 4. Açık ölçümler (plan v1'den önce)
- Sıkıştırılmış döküm boyutu ve süresi (deneme dökümü; canlıya yük: Micro bilgi işlemde derleme sırasında statement timeout yaşandı → gece saati ve `--jobs 1`).
- `SUPABASE_DB_URL` doğrudan bağlantı mı havuz mu (pg_dump oturum kipli bağlantı ister).
- GitHub runner'da `pg_dump` 17 kurulumu.
- R2 durumu; KVKK saklama süresi (MEVZUAT).

## 3-ek. Plan v1'de eklenen karar
5. **Zamanlanmış koşum izni.** Depodaki emsal (`sema-tabani-uret.yml`) bilerek yalnız elle tetiklenir ("canlıya ne zaman bağlanıldığı insanın kararı olsun") ve zamanlayıcı kurmak karar 53/117 gereği önce Recep'le konuşulur. Gece yedeği doğası gereği zamanlanmış koşudur; düzenli yedek şartı (7 gün kesintisiz) elle tetikle sağlanamaz. Önerim: yalnız bu iş akışı için günde bir kez, gece 02:00 TSİ, salt okuma.

## 2-ek. Plan v1'de netleşen tasarım ayrıntıları
- **Artifact YASAK.** Emsal iş akışının kuralı aynen geçerli: müşteri verisi iş akışı çıktısına (artifact) inmez. Şifreli dosya doğrudan saklama yerine yüklenir; çalışma dizinindeki açık döküm şifrelemeden hemen sonra silinir ve günlük kayıtlarına boyut dışında hiçbir şey yazılmaz.
- **Sır varlığı uzunlukla ölçülür** (emsal adım aynen): bağlantı dizesi hiçbir günlüğe, mesaja, karta yazılmaz.
- **Boş yedeği reddet** (emsaldeki "döküm dolu mu" adımının veri karşılığı): `pg_restore --list` içindeki TABLE DATA girdisi sayısı ≥ canlıdaki tablo sayısının tabanı; dosya boyutu ≥ ölçülen ilk yedeğin yarısı. Eşikler taban, tavan değil.
- **Tazelik satırı kaynağı:** son BAŞARILI iş akışı koşusunun zamanı (`gh run list --workflow canli-yedek.yml --status success --limit 1`); saklama yerine erişim gerektirmez. 36 saati geçerse açılış satırında uyarı.
- **Geri yükleme denemesi adımları:** (1) saklama yerinden en yeni dosyayı indir; (2) gizli anahtarla aç (yalnız Recep'in makinesinde); (3) `golge-kur.mjs` düzeniyle boş Postgres 17 + roller + uzantılar; (4) `pg_restore --no-owner`; (5) şema başına tablo satır sayıları canlıyla karşılaştırılır (canlı sayım aynı saatte salt okuma); (6) üç örnek sorgu (ürün, sipariş, kullanıcı); (7) sonuç tablosu cetvele ve karta yazılır; (8) açılmış döküm ve gölge veritabanı silinir.
- **Elle tek seferlik yedek (karar 231 evet gelirse):** aynı komutlar yerelde; dosya yalnız şifreli hâliyle kalır; yolu ve boyutu karta yazılır; ardından geri yükleme denemesi aynı gün.

## 5. plan-challenger sonucu
**Hüküm: KOŞULLU** (2026-10-01, bağımsız çürütücü, salt okuma; Supabase/PostgreSQL davranışları "belgeye göre" işaretlidir, canlıda ölçülmedi). Bugün zarar yok (kod yok, gerçek müşteri verisi yok). Aşağıdaki değişiklikler işlenmeden uygulama BAŞLAMAZ; bu bölüm §2 ve §2-ek'teki çelişen cümlelerin ÜSTÜNDEDİR.

| No | Şiddet | Bulgu | Plana işlenen değişiklik |
|---|---|---|---|
| 1 | KRİTİK | Saklama yeri "yazan belirteç silebilir mi" sorusunu sormuyor; git deposu saklama süresini ve silme talebini uygulanamaz kılar. | Ölçüt: **yazan belirteç silemez.** Seçenekler: saklama kilitli kova + yalnız yazma yetkisi; ya da çekme modeli (yedeği Recep'in makinesi çeker, depoya yazma sırrı girmez). Git deposu seçeneği DÜŞTÜ. Saklama süresi temizlik adımı + belirteç bitiş uyarısı. |
| 2 | YÜKSEK | Runner'da `pg_dump` 16, sunucu 17.6: eski istemci yeni sunucuyu reddeder; apt kurulumu bu depoda 24 dk asılmıştı. | `docker run postgres:17` ile döküm (ya da sabit ikili); her adıma `timeout-minutes`. Şifreleme aracı sabit sürüm + sha256 doğrulamalı. |
| 3 | YÜKSEK | Geri yükleme hedefi `golge-kur.mjs` OLAMAZ (sahte `auth.users`, girişsiz roller, pg_cron yok; konteyner paylaşımlı). | Hedef: `supabase/postgres:17.x` imajı ya da boş yeni Supabase projesi; ayrı, damgalı ad; yalnız kendi adını düşürür. Önce küçük deneme dökümüyle "bu hedefe yüklenir" ölçülür. |
| 4 | YÜKSEK | "public + auth + storage" izin listesi sessizce eksik bırakır: `archive_pre_kademe2`, uzantılar, roller, yayın (publication), veritabanı ayarları; 252 MB'ın 239 MB'ı nerede bilinmiyor. | İzin listesi yerine DIŞLAMA listesi (tüm veritabanı, yönetilen şemalar hariç). Kapı: canlı şema listesi ile dökümdeki şema listesi karşılaştırılır, açıklanmamış şema kırmızı. Roller ve yayın ayrı adım. |
| 5 | YÜKSEK | `pipefail` yoksa yarıda ölen döküm "başarılı" şifreli parça üretir; açık dosya diskte kalabilir. | `pg_dump \| şifrele` borusu + `set -euo pipefail`; ad = UTC damga + koşu kimliği; `concurrency`; `if: always()` temizlik; tek yeniden deneme. |
| 6 | YÜKSEK | Depodaki açık anahtar değiştirilirse iş yeşil kalır, yedek okunamaz olur; tek anahtar kaybı = tüm yedekler. | Alıcı dosyası CODEOWNERS; iş akışı alıcı sha256'sını ortam değişkeniyle karşılaştırır; iki bağımsız alıcı; değişim prosedürü cetvelde. |
| 7 | YÜKSEK | Sır yüzeyi: bağlantı sırrı iş düzeyinde tüm adımlara açık. (Düzeltme: zamanlanmış ve canlıya bağlanan iş emsali ZATEN var: `katalog-sayim.yml`.) | GitHub Environment `yedek` + zorunlu onaylayıcı + yalnız master; sır yalnız döküm adımında; `pull_request*` tetik, artifact ve `set -x` yok; bunların conformance testi. |
| 8 | YÜKSEK | Tazelik yeşilken yedek boş ya da bozuk olabilir (liste girdisi satır sayısı vermez; taban ilk yedeğe bağlı). | Şifrelemeden ÖNCE runner'da boş hedefe geri yükle, kritik tablo sayıları aynı anlık görüntüden alınan manifestle karşılaştırılır; yükleme sonrası uzak nesnenin boyut/sha256'sı; "ölçülemedi" ayrı kırmızı. |
| 9 | YÜKSEK | Deneme "yalnız Recep'in makinesinde" ise düzenli deneme fiilen yapılmaz. | İki kademe: günlük otomatik yapısal deneme (yalnız şema, kişisel veri yok) + üç ayda bir veri denemesi; ikisi de tazelik satırında. |
| 10 | ORTA | `auth`/`storage` tam geri yüklemesi hedefte çakışır; oturum ve belirteç tabloları gereksiz ve hassas. | Bu şemalarda yalnız veri; oturum/belirteç tabloları dışlanır; iki geri yükleme yolu (yeni proje / düz Postgres) ayrı yazılır ve denenir. |
| 11 | ORTA | Vault sırları geri gelmezse bildirimler SESSİZCE durur (fonksiyonlar yalnız uyarı verir). | Cetvelde yeniden girilecek sır adları + deneme sonunda varlık kontrolü; zamanlanmış veritabanı işlerini yeniden kuran betik. |
| 12 | ORTA | KVKK: şifreli yurt dışı saklama aktarım mı; silinen kişinin yedekte kalma süresi. | MEVZUAT'a iki somut soru; geri yükleme sonrası silme listesinin yeniden uygulanması cetvelde. İlk satıştan önce şart. |
| 13 | ORTA | Satır sayısı eşitliği içerik, indeks, yetki ve sayaçları kanıtlamaz; "canlı aynı saatte" kıyası hareketli veride anlamsız. | Ölçüt listesi: geri yükleme hata sayısı, manifest sayıları, kritik tablolarda özet, politika/fonksiyon/tetik/indeks sayıları, bir arama sorgusu, sayaçlar, vault adları. |
| 14 | ORTA | Bağlantı türü (havuz / doğrudan), zaman aşımı ve kilit davranışı belirsiz; `--jobs` bu biçimde anlamsız. | §4'e bağlantı türü + TLS kök sertifikası ölçümü; `--jobs` kaldırıldı; zaman aşımı ve yeniden deneme politikası yazılır. |
| 15 | DÜŞÜK | "PIM düzenini izler" cümlesi eksik: manifest + sha256, anahtarsız başlamama, çözme hedefi depo dışı, deneme ortamı yalnız kendini siler. | §0 emsal cümlesi bu dört korumayı açıkça taşır. |

**Uygulama açılmadan önce ölçülecek üç şey:** bağlantı sırrı havuz mu doğrudan mı · `supabase/postgres:17` imajına küçük deneme dökümü yükleniyor mu · `archive_pre_kademe2` canlıda duruyor mu ve 239 MB'ın dağılımı.

**Kural 14 notu:** kapı ve hata yolları iş akışıyla AYNI işte yazılır; §6'daki sıra buna göre okunur (4. adım iş akışı + kapı + hata yolları + conformance testleri tek iştir).

## 6. Uygulama sırası
1. Kararlar (o gün yeniden sorulacak): saklama yeri (§5 bulgu 1 ölçütüyle), gizli anahtar, zamanlanmış koşum izni.
2. Açık ölçümler (§4 + §5'teki üç ölçüm).
3. Cetvel `docs/standards/yedek-geri-yukleme-standard.md` + `docs/README.md` satırı (HARİTA) + araç envanteri satırı.
4. İş akışı + boş yedek kapısı + tazelik satırı + `INV-YEDEK-TAZE-1`.
5. İlk koşu → geri yükleme denemesi → 7 gün izleme → kabul (kapı 1/4 devri OPS'ta, ayar değişikliği Recep onayıyla).
