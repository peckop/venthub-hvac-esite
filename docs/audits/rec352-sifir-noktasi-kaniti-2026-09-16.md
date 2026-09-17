# REC-352 — SIFIR NOKTASI: gölgede ölçülmüş kanıt (2026-09-16)

**Soru:** sıfır noktası kurmak canlı şemaya dokunur mu?
**Cevap:** HAYIR. Gölgede ölçüldü, şema parmak izi **birebir aynı** kaldı.

Bu belge Recep'in şu itirazından doğdu: *"hem Docker'da zincir kırık diyorsun hem kendi
yaptığımızda kırılmıyor diyorsun... 2 farklı yerden bakınca ben sana güvenemiyorum."*
İtiraz yerindeydi — iki farklı artefakt aynı cümlede anlatılmıştı. Bu belge ikisini
ayırır ve iddiayı ÖLÇÜMLE kapatır.

## 1. İKİ AYRI ARTEFAKT (çelişki değil)

| | `supabase/migrations/` | `supabase/baselines/2026-09-15_public_schema.sql` |
|---|---|---|
| Ne | 233 ileri-yönlü talimat dosyası | canlı `public` şemasının tam anlık görüntüsü |
| Sıfırdan koşum | **170/233 DÜŞER** (63 OK) | **0 hata**, canlıyla 8/8 parite |
| Rolü | tarihsel kayıt | sıfır noktasının kendisi |

Canlı veritabanı hiçbir zaman bu 233 dosyayla kurulmadı; her dosya o günün şemasının
üzerine koştu ve arada beş tablo panelden ELLE kuruldu (`supabase/baselines/README.md`).
Kırık olan makine değil, DEFTER.

## 2. ⭐YENİ BULGU — DEFTER 233 DOSYAYI TEMSİL EDEMİYOR (bugün ölçüldü)

Supabase'in defteri (`supabase_migrations.schema_migrations`) `version` kolonuna göre
tekildir ve `version` = dosya adının damgası. 233 dosyanın damgaları ölçüldü:

- Damga uzunlukları: **158 dosya 8 hane**, 62 dosya 14 hane, 13 dosya 12 hane.
- **26 damga PAYLAŞILIYOR; toplam 138 dosya çakışıyor.** En kalabalığı `20250910` → **19 dosya**.
- Sonuç: 233 dosya deftere yazıldığında **121 satır** oluştu. 112 dosya adı temsil edilemedi.

Ölçüm: `insert ... on conflict (version) do nothing` ile 233 satır denendi, `count(*)` = **121**.

⭐**DERS:** 8 haneli `YYYYMMDD_` damga biçimi (CLAUDE.md'de zaten INV-MIGRATION-2 kapısında
KIRMIZI) yalnız bir biçim tercihi değil — **aynı gün yazılan dosyaları tek kimliğe
çöktürüyor.** Bu, sıfır noktasının tercih değil ZORUNLULUK olmasının İKİNCİ bağımsız
sebebidir (birincisi: 11 sert sözdizimi hatası + yaratıcı migration'ı olmayan beş tablo).

## 3. ÖLÇÜM — DEFTER YAZIMI ŞEMAYA DOKUNUYOR MU?

Gölge: `sifir_kanit` (paylaşılan kümede AYRI veritabanı; URUN'un `arama_golge`'sine
dokunulmadı, ölçüldü: 57 tablo / 164 politika işlem boyunca sabit).

Kurulum: `scripts/db/golge-kur.mjs --ad sifir_kanit` → önsöz + 2026-09-15 tabanı.
Sadakat: **55 tablo · 163 politika · 199 indeks · 67 fonksiyon · 48 tetik.**

**Parmak izi** = altı sorgunun birleşimi; kolon/tip/null/default, kısıt tanımları,
indeks DDL'i, politika `qual`/`with_check` metinleri, fonksiyon gövde md5'i, tetik md5'i.
Toplam **1404 satır** (786'sı kolon satırı, 163'ü politika).

| | md5 |
|---|---|
| Defter yazımı ÖNCESİ | `f787d59dd777b2b6e37fbc6ad81da6b8` |
| Defter yazımı SONRASI | `f787d59dd777b2b6e37fbc6ad81da6b8` |
| `diff` | **boş** |

Sayımlar sonrasında da aynı: 55 / 163 / 199 / 67 / 48.

**HÜKÜM:** defter yazımı `public` şemasında tek bir kolon, kısıt, indeks, politika,
fonksiyon ya da tetik değiştirmiyor. Sıfır noktası bir şema işlemi DEĞİL, bir
KAYIT işlemidir.

## 4. ⚠ÖLÇÜLEMEYEN — CANLI DEFTERİN ŞU ANKİ İÇERİĞİ

Canlı defterde bugün kaç satır olduğu **ölçülmedi**: salt-okuma sorgusu bu oturumun
izin katmanında ("Production Reads") reddedildi. Dolayısıyla şu soru AÇIK:
canlı defter 121 satırı mı, 233'ü mü, yoksa bambaşka bir kümeyi mi taşıyor.

Bu, hükmü değiştirmez (şemaya dokunmama ölçümü canlı defterin içeriğinden bağımsız),
ama uygulama planının İLK adımı bu okumadır. Adım atlanamaz: neyin üzerine yazdığını
bilmeden defter yazılmaz.

## 5. SINIRLAR, ADIYLA

1. Gölgede `auth.uid()` NULL — **yetki davranışı ölçülmedi**, yalnız şema/DDL.
2. Gölgede `pg_cron` yok (konteynerde yalnız `postgres` DB'sinde kurulabilir) — beklendi.
3. Parmak izi `public` şemasını kapsar; `auth`, `storage`, `net`, `vault` kapsam DIŞI.
4. Defter yazımı burada elle SQL ile benzetildi; `supabase migration squash --linked`
   komutunun kendisi canlıda koşmadı ve koşmayacak — **o adım Recep'in kapısı** (kural 13).
5. Merge edilmiş bir migration'ın canlıda uygulanmış olması bu ölçümle kanıtlanmaz
   (`supabase/baselines/README.md` tazelik alarmı bölümü aynı sınırı yazıyor).
6. Damga çakışması ölçümü DOSYA ADLARINDAN okundu; canlı defterin o damgaları nasıl
   taşıdığı §4 yüzünden bilinmiyor.

## 6. SIRADAKİ — TEK KARAR RECEP'TE

Uygulama planı, onay gelirse: (1) canlı defteri OKU, (2) tabanı tek sıfır noktası
migration'ı olarak ilan et, (3) taban sonrası dosyaları koru, (4) eski damgaları
"tabanda içeriliyor" diye kaydet, (5) tek PR. Adım 2-5 migration içerdiği için
merge = prod'a otomatik uygulama → kural 13, Recep onayı ZORUNLU.

Yöneten cetvel: `docs/standards/ledger-ve-olu-migration-standard.md` §2.1 (v1.2).
