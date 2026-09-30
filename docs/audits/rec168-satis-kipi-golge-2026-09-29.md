# REC-168 A — gölge kanıtı çıktısı (PGlite, 2026-09-29)

Komut: geçici klasörde `npm i @electric-sql/pglite`, sonra `node rec168-satis-kipi-golge-2026-09-29.mjs supabase/migrations/20260929150000_satis_kipi_anahtari.sql`. Çıkış kodu 0, 41 kontrol GEÇTİ.

Kapsam ve sınırlar betiğin başlık yorumunda: gerçek `handle_supabase_webhook()` (Vault + pg_net), gerçek JWT ve `denetim_izi_site_settings` tetiği ÖLÇÜLMEDİ (Docker gölgesi gerektiren kalan).

```

=== FAZ 1: migration ÖNCESİ ===
GECTI   ÖNCE satis_kipi_oku yok (anon çağrısı düşer) — kod 404→KAPALI ile bugünkü davranış — {"ok":false,"hata":"function public.satis_kipi_oku() does not exist"}
GECTI   ÖNCE yönetici (moderator dahil) satis_kipi satırını YAZABİLİR (Ç3 açığı: kilit yok) — {"ok":true,"satir":1,"rows":[]}

=== FAZ 2: migration SONRASI (gerçek dosya çalıştırıldı) ===
GECTI   migration temiz koştu (lock/statement timeout + guard geçti)
GECTI   satır YOKKEN anon: {acik:false, damga:null} (vitrin bugünkü gibi KAPALI) — {"acik":false,"damga":null}
GECTI   satır YOKKEN authenticated: {acik:false} — {"acik":false,"damga":null}
GECTI   anon tabloyu DOĞRUDAN okuyamaz (SELECT GRANT yok) — RPC tek yol — {"ok":false,"hata":"permission denied for table site_settings"}
GECTI   EXECUTE hedefli: PUBLIC yok, anon+authenticated+service_role var — {postgres=X/postgres,service_role=X/postgres,anon=X/postgres,authenticated=X/postgres}
GECTI   DEFINER ve search_path kilitli — {"prosecdef":true,"cfg":"{\"search_path=\\\"\\\"\"}"}
GECTI   service_role satis_kipi INSERT geçer — {"ok":true,"satir":1,"rows":[]}
GECTI   geçerli {acik:true} → anon acik=true, damga dolu — {"acik":true,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   INSERT tetiği ateşlendi (1 kayıt: INSERT/satis_kipi) — [{"olay":"INSERT","anahtar":"satis_kipi"}]
GECTI   bozuk değer (dize "true") → KAPALI — {"acik":false,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   bozuk değer (sayı 1) → KAPALI — {"acik":false,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   bozuk değer (acik yok) → KAPALI — {"acik":false,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   bozuk değer (null) → KAPALI — {"acik":false,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   bozuk değer (skalar) → KAPALI — {"acik":false,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   bozuk değer (dizi) → KAPALI — {"acik":false,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   geçerli {acik:false} → KAPALI — {"acik":false,"damga":"2026-09-29T15:07:34.803+03:00"}
GECTI   anahtar YENİDEN ADLANDIRILINCA satır kaybolur → KAPALI — {"acik":false,"damga":null}
GECTI   DELETE sonrası KAPALI — {"acik":false,"damga":null}
GECTI   tetikler: UPDATE(değer) · UPDATE(yeniden adlandırma, old.key) · UPDATE(geri adlandırma, new.key) · DELETE hepsi ateşlendi — [{"olay":"UPDATE","anahtar":"satis_kipi"},{"olay":"UPDATE","anahtar":"satis_kipi_eski"},{"olay":"UPDATE","anahtar":"satis_kipi"},{"olay":"DELETE","anahtar":"satis_kipi"}]
GECTI   payment/general/başka anahtar yazımı webhook ATMAZ (WHEN koşulu) — 0 kayıt
GECTI   admin: satis_kipi INSERT RLS ile REDDEDİLİR (zaten var → unique da olsa politika önce) — {"ok":false,"hata":"new row violates row-level security policy \"site_settings_satis_kipi_yalniz_servis_ins\" for table \"s"}
GECTI   admin: satis_kipi UPDATE 0 satır etkiler (satır görünmez) — {"ok":true,"satir":0,"rows":[]}
GECTI   admin: başka anahtarı 'satis_kipi'ne YENİDEN ADLANDIRMA reddedilir (WITH CHECK) — {"ok":false,"hata":"new row violates row-level security policy \"site_settings_satis_kipi_yalniz_servis_upd\" for table \"s"}
GECTI   admin: general UPDATE GEÇER (panel kırılmaz) — {"ok":true,"satir":1,"rows":[]}
GECTI   admin: başka anahtar INSERT GEÇER — {"ok":true,"satir":1,"rows":[]}
GECTI   moderator: satis_kipi INSERT RLS ile REDDEDİLİR (zaten var → unique da olsa politika önce) — {"ok":false,"hata":"new row violates row-level security policy \"site_settings_satis_kipi_yalniz_servis_ins\" for table \"s"}
GECTI   moderator: satis_kipi UPDATE 0 satır etkiler (satır görünmez) — {"ok":true,"satir":0,"rows":[]}
GECTI   moderator: başka anahtarı 'satis_kipi'ne YENİDEN ADLANDIRMA reddedilir (WITH CHECK) — {"ok":false,"hata":"new row violates row-level security policy \"site_settings_satis_kipi_yalniz_servis_upd\" for table \"s"}
GECTI   moderator: general UPDATE GEÇER (panel kırılmaz) — {"ok":true,"satir":1,"rows":[]}
GECTI   moderator: başka anahtar INSERT GEÇER — {"ok":true,"satir":1,"rows":[]}
GECTI   panel denemelerinden sonra satır DEĞİŞMEDİ (acik=true kaldı) — {"acik":true,"damga":"2026-09-29T15:07:34.856+03:00"}
GECTI   sade kullanıcı general UPDATE 0 satır (mevcut politika bozulmadı) — {"ok":true,"satir":0,"rows":[]}
GECTI   service_role (betik) satis_kipi UPDATE GEÇER — {"ok":true,"satir":1,"rows":[]}
BİLGİ   moderator payment (İyzico) satırını yazabilir → {"ok":true,"satir":1,"rows":[]} (bu migration'ın kapsamı DIŞI; ayrı kayıt, plan "Ayrı kayıtlar")

=== FAZ 3: guard fikstürleri ===
GECTI   fikstür "anon EXECUTE eksik": EXCEPTION verdi — REC-168 guard: satis_kipi_oku() yok / DEFINER değil / anon EXECUTE yok
GECTI   fikstür "anon EXECUTE eksik": TAM geri alındı (fonksiyon 0, tetik 0) — fonksiyon=0 tetik=0
GECTI   fikstür "DELETE tetiği eksik": EXCEPTION verdi — REC-168 guard: 3 satis_kipi tetiği (ins/upd/del) etkin değil
GECTI   fikstür "DELETE tetiği eksik": TAM geri alındı (fonksiyon 0, tetik 0) — fonksiyon=0 tetik=0
GECTI   fikstür "bir RESTRICTIVE politika eksik": EXCEPTION verdi — REC-168 guard: 2 RESTRICTIVE politika yok
GECTI   fikstür "bir RESTRICTIVE politika eksik": TAM geri alındı (fonksiyon 0, tetik 0) — fonksiyon=0 tetik=0

SONUÇ: TÜM KONTROLLER GEÇTİ
```
