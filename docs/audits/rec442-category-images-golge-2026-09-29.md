# REC-442 alt işi — category-images yazma politikalarının kaldırılması: gölge kanıtı

**Tarih:** 2026-09-29 · **Sahip:** ALTYAPI · **Plan:** `docs/plans/rec442-category-images-yazma-kapatma-2026-09-29.md`
**Betik:** `docs/audits/rec442-category-images-golge-2026-09-29.mjs` (bellek-içi PGlite; depoya bağımlılık eklenmez)
**Migration:** `supabase/migrations/20260929104500_rec442_category_images_yazma_kapat.sql`

## Düzenek

| Ne | Nasıl |
|---|---|
| Veritabanı | bellek-içi PGlite (gerçek Postgres motoru, WASM). `storage.objects`/`storage.buckets` iskeleti, `anon` / `authenticated` / `service_role` rolleri, `auth.role()` JWT talebinden, RLS açık, tablo düzeyinde geniş GRANT (canlıdaki gibi) |
| Politikalar | ELLE YAZILMADI: canlıdaki 10 politika `pg_get_expr` çıktısından aynen (plan-challenger F4, döngüsellik) |
| Migration | gerçek dosya çalıştırıldı, taklit değil |
| Sınır (adıyla) | ölçülen şey RLS KARARIDIR. Gerçek Storage API'nin HTTP kodu ve `RETURNING` kullanımı SİMÜLE EDİLMEZ |

## Sonuç (18 kontrol geçti + 3 bilgi ölçümü)

| Aşama | Ölçüt | Sonuç |
|---|---|---|
| ÖNCE (negatif kontrol: test dişli) | sade kullanıcı category-images'a `INSERT` (RETURNING'siz) | **İZİN VERİLDİ** (açık gerçek) |
| ÖNCE | anon `INSERT` | reddedildi |
| ÖNCE | sade kullanıcı `INSERT … RETURNING` | **reddedildi**: kovada SELECT politikası yok |
| ÖNCE | sade kullanıcı `UPDATE` / `DELETE` etkilenen satır | 0 / 0 (SELECT politikası yok) |
| SONRA | migration temiz koştu, 3 politika kalktı, 7 `product-images` politikası yerinde | evet |
| SONRA | sade kullanıcı `INSERT` (RETURNING'li ve RETURNING'siz), anon `INSERT` | hepsi reddedildi |
| SONRA | sade kullanıcı `UPDATE` / `DELETE` | 0 satır |
| SONRA | `service_role` `INSERT` | geçer (betikler etkilenmez) |
| SONRA | mevcut 3 nesne | yerinde |
| REGRESYON | yönetici kendi tenant yoluna `product-images` yazar / sade kullanıcı yazamaz | evet / evet |
| F1 ters fikstür | aynı ad + başka kova | ÖN-GUARD raise eder, üç `Auth *` politikası yerinde (atomik) |
| F2 fikstür | kovaya bağlanmamış kapısız `with check (true)` politikası | SON-GUARD raise eder, eski üç politika yerinde (atomik) |
| İdempotans | migration ikinci kez | sorunsuz |

## Ne öğrendik (planı değiştiren)

`INSERT … RETURNING`, kovada SELECT politikası olmadığı için kaldırmadan ÖNCE de reddediliyor. Yani açığın gerçekte
sömürülüp sömürülemediği, Storage API'nin yüklemeyi hangi SQL biçimiyle yaptığına bağlı. Bu **ölçülmedi** (prod'da yazma yasak,
gölgede gerçek API yok). Karar (kaldırma) buna bağlı değil: meşru kullanıcısı olmayan yazma yolu her hâlükârda kapanır;
yalnız "açık fiilen sömürülüyordu" iddiası kanıtsız kalır, kayıtlarda böyle yazılır.

## Merge sonrası canlı doğrulama (salt okuma, bu belgeye eklenecek)

1. `pg_policy`: `storage.objects` üzerinde 3 politika yok, 7 `product-images` politikası var.
2. `storage.objects`: `category-images` 3 nesne yerinde.
3. Bir nesnenin herkese açık URL'sine HTTP GET: migration ÖNCESİ ve SONRASI 200 (okuma etkilenmedi, uçtan uca).
4. Migration sonrası ilk `supabase-migrate.yml` koşusu yeşil, ledger'a yazıldı.
