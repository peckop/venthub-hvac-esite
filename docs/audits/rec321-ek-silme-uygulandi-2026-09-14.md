# REC-321 EK — silme UYGULANDI, canlıda ölçüldü (2026-09-14)

> **Ne bu:** `docs/audits/rec321-olu-migration-secenekleri-2026-09-14.md` dört seçenek
> ölçmüştü ve kararı Recep'e bırakmıştı. Recep kendi cümlesiyle onay verdi
> (*"silme için zaen onay vermedim mi sana?"*). Bu EK, seçilen yolun **uygulandıktan
> SONRAKİ** durumunu kaydeder.
>
> **Niçin ayrı bir EK:** *"bir düzeltmenin işe yaradığı, düzeltme SONRASI durum ölçülmeden
> söylenmez."* Ölçüm belgesi düzeltmeden önce yazıldı; sonrası ayrı ölçümdür.

## 1 · Ne yapıldı

PR **#1187**, `altyapi/rec321-olu-migration-sil` → master (`e80775fce`).

- **Beş geçersiz migration dosyası silindi:** `20250907_admin_audit_log.sql`,
  `20250908_client_errors.sql`, `20250908_error_groups.sql`,
  `20250908_error_groups_policies_fix.sql`, `20250909_fix_product_images_rls.sql`.
- **Bir migration eklendi:** `20260914090000_olu_migration_dosyalari_defterden_silinir.sql`
  — `public._migration_ledger`'dan tam bu beş adı düşürür, `get diagnostics` ile
  **tam 5 satır** silindiğini doğrular, sonra beşinin de kalmadığını ikinci kez ölçer;
  ikisinden biri tutmazsa `raise exception` ile **işlemi geri alır.**

Merge ritüeli madde 5'i (migration = Recep kapısı) `--onay` ile açtı; onay metni Recep'in
kendi sözü olarak PR'a yorum yazıldı. Kural 13 gevşetilmedi — değişen tek şey, onayın
**ağızdan değil yazıdan** sayılması.

## 2 · Canlıya uygulama koşumu

`supabase-migrate.yml` koşum **34836410555**, sha `e80775fc` → **completed / success.**

En kritik adım olan **"Ledger paritesi (dosya listesi == `_migration_ledger`)"** yeşil geçti.
Bu adım iki yönlü çalışır: depoda olup defterde olmayan da, defterde olup depoda olmayan da
hata verir. Yani paritenin yeşil olması, silmenin **iki tarafta birlikte** tamamlandığını
söyler.

## 3 · Bağımsız ikinci ölçüm (canlı, salt-okuma)

Koşumun kendi paritesine güvenmeyip canlıyı doğrudan sorguladım:

| Ölçüm | Beklenen | Bulunan |
|---|---|---|
| `_migration_ledger` satır sayısı | 233 | **233** |
| Silinmesi gereken beş addan kalan | 0 | **0** |
| Yeni migration'ın defter kaydı | 1 | **1** |
| `20250908_client_errors_admin_fallback.sql` (silinmemeli) | 1 | **1** |

Depo tarafı da ölçüldü: master'da `supabase/migrations/*.sql` sayısı **233**
(237 − 5 + 1). Aritmetik önceden yazılmıştı ve taban kaydıktan sonra (master `#1190` ile
`f220fb85f`'e taşındı) **yeniden ölçüldü**: `#1190` yalnız `src/types/database.types.ts`'e
dokunmuş, migration sayısı 237'de kalmıştı — yani aritmetik geçerliydi. (Cetvel §7.2:
*"taban kayarsa yeniden ölç."*)

## 4 · ⚠ÖLÇÜM SIRASINDA KENDİ KONTROLÜM YANLIŞ POZİTİF VERDİ

Silinen beş dosyanın master'da kalmadığını `grep -c <ad>` ile kontrol ettim ve
`20250908_client_errors` için **1** döndü — yani "dosya hâlâ duruyor" gibi göründü.

Sebep: eşleşen dosya **`20250908_client_errors_admin_fallback.sql`**, yani listede
**olmayan başka bir dosya.** Silme listesindeki `20250908_client_errors.sql` gerçekten
gitmişti.

**Ders:** bu, cetvelin *"aynı ad farklı tablo"* dersinin dosya adı tarafındaki ikizidir:
**ön-ek eşleşmesi kimlik değildir.** Doğru ölçüt tam addır; toplam sayı (233) hükmü
bağımsız olarak doğruladı. Aynı tuzağa bugün REC-335'te de düştüm (politika adı iki
tabloda) — yani bu bir dikkatsizlik değil, **bu depoda tekrarlayan bir sınıf.**

## 5 · İDDİA EDİLMEYEN ŞEY: DR / replay

⛔**Bu silme, migration geçmişinin sıfırdan tekrar oynatılabilmesini SAĞLAMADI.**
Ölçüm belgesinde bu iddia bir kez yazılmış, bağımsız çürütme tarafından **çürütülmüş** ve
düzeltilmişti; EK'te tekrar yazılıyor ki kayıt tek yerde tutarlı olsun:

- **Silmeden önce** replay `20250907_admin_audit_log.sql`'de ölüyordu.
- **Silmeden sonra** replay `20250908_enable_realtime_error_tables.sql`'de ölüyor.

Yani kırılma noktası **bir gün ileri kaydı**, ortadan kalkmadı. Silmenin gerekçesi
**ölülük değil, GEÇERSİZLİK + İŞLEVSİZLİK**tir (dosyalar hem çalışmaz hem hiçbir tablonun
tek yaratıcısı değil). DR başlığı **REC-336**'nın işidir: canlı şema, hayatta kalan
migration'lardan üretilemiyor (`client_errors`, `error_groups`, `user_invoice_profiles`
tablolarını hiçbir dosya yaratmıyor).

## 6 · Bu işten kalan kalıcı katman

- `docs/standards/ledger-ve-olu-migration-standard.md` — silmenin **iki taraflı** olduğu
  (dosya + defter satırı), reddedilen üç yol, DR bölümünün çürütülmüş hâli, silme
  gerekçesinin ölülük olmadığı, taban kayarsa yeniden ölçme kuralı.
- `INV-MIGRATION-3` / `UYUMSUZ_TABAN` 171'e çekildi; iki adımlı geçmişi ve "beş sekiz
  haneli, biri on iki haneli" düzeltmesi yorumlarda duruyor.
- Parite kapısının **glob'unun özyinelemeli olmadığı** ölçüldü: bir migration'ı alt dizine
  taşımak, kapı açısından **silmekle aynıdır.**
