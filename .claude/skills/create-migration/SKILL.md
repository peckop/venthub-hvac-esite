---
name: create-migration
description: VentHub'da yeni Supabase migration dosyası oluşturmanın güvenli yolu — adlandırma, kural-13 zinciri, plan-challenger zorunluluğu ve migration-safety kontrol listesiyle. Migration/DB şema değişikliği istendiğinde kullan.
---

# /create-migration — güvenli migration oluşturma

Bu depoda migration yazmak PROD'a dokunmaktır: migration içeren dal master'a merge edilince
`supabase-migrate.yml` prod DB'ye **OTOMATİK uygular** (Kural 13). Bu beceri o zincirin
başındaki adımları standartlaştırır.

## Akış (sırayla, atlama yok)

1. **Cetvel:** `docs/standards/migration-safety-standard.md` oku — plan bu cetvele atıf verir.
2. **Plan + plan-challenger:** migration/veri göçü için plan-challenger ZORUNLUDUR
   (execution-method-standard). Önce plan yaz, `/plan-challenger` ile çürüttür, sonra dosya.
3. **Adlandırma:** `supabase/migrations/YYYYMMDD_kisa_aciklama.sql` (bugünün tarihi; açıklama
   snake_case Türkçe/İngilizce kısa).
4. **İçerik kontrol listesi:**
   - İdempotent mi? (`IF NOT EXISTS` / `IF EXISTS`, tekrar koşulabilir)
   - RLS: yeni tabloya policy + **kolon grant'leri** birlikte (satır kapısı yetmez)
   - Mevcut satırları doğrulayan kısıt ekliyorsan: önce mevcut veriyi ÖLÇ (constraint
     mevcut satırlara da uygulanır — canlıda patlar)
   - Sır/duz-metin anahtar YOK (Vault kullan); repo PUBLIC
   - Geri alma notu: bu migration nasıl geri alınır, dosyanın başına yorum olarak yaz
5. **Yerel doğrulama:** mümkünse `supabase db diff` ile beklenen fark; testler
   (`pnpm test -- --run`) yeşil.
6. **PR ve kapanış uyarısı:** PR açıklamasına şu satır AYNEN girer:
   `⚠ MIGRATION İÇERİR — merge = prod'a otomatik uygulama. Yalnız Recep onayıyla merge.`
   PR'ı ASLA kendi kapınla merge etme; "sadece komutla uygulanacaksa" merge ETME.

## Hatırlatma

- `sensitive-path-guard` hook'u migration yazımında onay isteyecektir — bu beklenen davranış.
- İki defter vakası (T073): `supabase db push` YASAK — uygulama yalnız CI workflow'undan.
