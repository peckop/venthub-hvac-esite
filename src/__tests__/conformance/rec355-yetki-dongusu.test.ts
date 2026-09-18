// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-AUTH-YETKI-DONGUSU-1 — `user_profiles` politikaları TABLO OKUYAN bir yetki merciine
 * bağlanamaz (REC-355, karar 43).
 *
 * ⭐NİÇİN VAR (ölçüldü 2026-09-18, iki ortam): `is_admin_user()` SECURITY INVOKER'dır ve claim'siz
 * JWT'de yedek dalda `user_profiles` okur; `user_profiles` politikaları da onu çağırıyordu →
 * politika → fonksiyon → politika → **54001 stack depth**. Canlıda (salt-okuma, rollback'li)
 * claim'siz `authenticated` ile arama `display_price → is_user_admin → user_profiles politikası →
 * is_admin_user → …` zinciriyle 54001 verdi; gölgede claim'siz üç jeton şekli de 54001 verdi.
 * Sonuç KARARSIZ: aynı jeton canlıda super_admin için çalışıyor, normal kullanıcı için patlıyordu.
 *
 * ⭐NİÇİN METİN KOLU (veritabanı kolu değil): CI'da prod DB yok, gölge de her makinede ayakta
 * değil. Bu kapı migration metnini ve cetveli ölçer — yani kararın GERİ KAÇMASINI engeller.
 * Canlı davranışın bekçisi ayrı: `scripts/db/checks/arama-davranisi.mjs` `authenticated-iddiasiz`
 * kolu (aynı PR'da eklendi) ve migration'ın kendi `DO $guard$` bloğu.
 */
const KOK = process.cwd()
const MIGRATION = path.join(KOK, 'supabase', 'migrations', '20260918063600_yetki_dongusu_kesildi.sql')
const CETVEL = path.join(KOK, 'docs', 'standards', 'rls-yetki-karari-standard.md')
const KONTROL = path.join(KOK, 'scripts', 'db', 'checks', 'arama-davranisi.mjs')

const oku = (p: string) => fs.readFileSync(p, 'utf8')

describe('INV-AUTH-YETKI-DONGUSU-1 · user_profiles yetki mercii tablo okumaz', () => {
  it('migration var, damgasi 14 hane ve tek islem', () => {
    expect(fs.existsSync(MIGRATION), 'REC-355 migration dosyasi yok').toBe(true)
    const ad = path.basename(MIGRATION)
    expect(ad, 'damga 14 hane degil (INV-MIGRATION-2)').toMatch(/^\d{14}_/)
    const m = oku(MIGRATION)
    expect((m.match(/^BEGIN;$/gm) || []).length, 'tek BEGIN bekleniyor').toBe(1)
    expect((m.match(/^COMMIT;$/gm) || []).length, 'tek COMMIT bekleniyor').toBe(1)
  })

  it('is_admin_claim govdesi TABLO OKUMAZ ve uc deger dondurmez', () => {
    const m = oku(MIGRATION)
    const govde = /CREATE OR REPLACE FUNCTION public\.is_admin_claim\(\)[\s\S]*?\$function\$([\s\S]*?)\$function\$/.exec(m)
    expect(govde, 'is_admin_claim govdesi bulunamadi').not.toBeNull()
    // Yorumlar ayıklanır: gövde YORUMUNDA "user_metadata BİLEREK YOK" yazıyor ve naif bir
    // arama onu ihlal sanıp kolu yanlış kırmızıya çeviriyordu (2026-09-18 ölçüldü).
    const g = (govde as RegExpExecArray)[1]
      .split('\n')
      .filter((s) => !/^\s*--/.test(s))
      .join('\n')
    // Döngünün tek sebebi tablo okumasıydı: bu satır geri gelirse kusur da geri gelir.
    expect(g, 'is_admin_claim govdesinde user_profiles okumasi VAR — dongu geri gelir').not.toMatch(/user_profiles/i)
    expect(g, 'govdede FROM ile tablo okumasi var').not.toMatch(/\bFROM\s+public\./i)
    // `user_metadata` kullanıcı tarafından yazılabilir (CLAUDE.md kural 12).
    expect(g, 'user_metadata okunuyor — kural 12 ihlali').not.toMatch(/user_metadata/)
    expect(g, 'claim dallari eksik').toMatch(/claims ->> 'user_role'/)
    expect(g, 'app_metadata dali eksik').toMatch(/app_metadata' ->> 'user_role'/)
    // NULL IN (...) → NULL; karar mercii ucuncu deger dondurmez.
    expect(g, 'COALESCE yok — fonksiyon NULL dondurebilir').toMatch(/COALESCE\(user_role IN \('admin', 'super_admin'\), FALSE\)/)
    expect(g, 'SECURITY DEFINER govdeye sizmis').not.toMatch(/SECURITY DEFINER/i)
  })

  it('dort politika is_admin_claim cagirir, is_admin_user CAGIRMAZ, adlar korunur', () => {
    const m = oku(MIGRATION)
    for (const ad of ['select', 'insert', 'update', 'delete']) {
      const p = new RegExp(`CREATE POLICY user_profiles_${ad}_policy ON public\\.user_profiles[\\s\\S]*?;`, 'i').exec(m)
      expect(p, `user_profiles_${ad}_policy yeniden yazilmamis`).not.toBeNull()
      const govde = (p as RegExpExecArray)[0]
      expect(govde, `${ad} politikasi is_admin_claim cagirmiyor`).toMatch(/public\.is_admin_claim\(\)/)
      expect(govde, `${ad} politikasinda is_admin_user KALDI — dongu geri gelir`).not.toMatch(/is_admin_user/)
      expect(govde, `${ad} politikasi tenant kolunu kaybetmis (kural 12)`).toMatch(/tenant_id = /)
    }
    // SELECT/INSERT/UPDATE'te kendi satırı kolu durur; DELETE'te zaten yoktu ve eklenmedi.
    for (const ad of ['select', 'insert', 'update']) {
      const govde = new RegExp(`CREATE POLICY user_profiles_${ad}_policy[\\s\\S]*?;`, 'i').exec(m) as RegExpExecArray
      expect(govde[0], `${ad} politikasinda self kolu yok`).toMatch(/id = \(SELECT auth\.uid\(\)\)/)
    }
  })

  it('EXECUTE dar: PUBLIC ve anon geri alinir, yalniz authenticated + service_role', () => {
    const m = oku(MIGRATION)
    expect(m, 'PUBLIC EXECUTE geri alinmamis').toMatch(/REVOKE EXECUTE ON FUNCTION public\.is_admin_claim\(\) FROM PUBLIC;/)
    expect(m, 'anon EXECUTE geri alinmamis').toMatch(/REVOKE EXECUTE ON FUNCTION public\.is_admin_claim\(\) FROM anon;/)
    expect(m, 'grant satiri eksik/genis').toMatch(/GRANT EXECUTE ON FUNCTION public\.is_admin_claim\(\) TO authenticated, service_role;/)
    expect(m, 'anon a grant verilmis').not.toMatch(/GRANT EXECUTE ON FUNCTION public\.is_admin_claim\(\)[^;]*anon/)
  })

  it('migration kendi guard blogunu tasir (fail-closed) ve dort sarti olcer', () => {
    const m = oku(MIGRATION)
    const guard = /DO \$guard\$([\s\S]*?)\$guard\$;/.exec(m)
    expect(guard, 'guard blogu yok').not.toBeNull()
    const g = (guard as RegExpExecArray)[1]
    expect(g, 'guard eski merciyi aramiyor').toMatch(/is_admin_user/)
    expect(g, 'guard yeni merci sayisini olcmuyor').toMatch(/is_admin_claim/)
    expect(g, 'guard EXECUTE olcmuyor').toMatch(/has_function_privilege\('authenticated'/)
    expect(g, 'guard anon yuzeyini olcmuyor').toMatch(/has_function_privilege\('anon'/)
    expect((g.match(/RAISE EXCEPTION/g) || []).length, 'guard dort sarti da kirmizi vermiyor').toBeGreaterThanOrEqual(4)
  })

  it('canli bekci kolu duruyor: arama kontrolunde iddiasiz authenticated kolu', () => {
    const k = oku(KONTROL)
    expect(k, 'iddiasiz kol listede yok').toMatch(/'authenticated-iddiasiz'/)
    expect(k, 'iddiasiz kol icin iddia tanimi yok').toMatch(/'authenticated-iddiasiz': \{ role: 'authenticated' \}/)
    expect(k, 'kol adi dogrudan Postgres rolu olarak kullanilmis').toMatch(/set local role \$\{ROL_PG\[rol\]\}/)
  })

  it('cetvel guncellendi: karar mercii artik IKI fonksiyon ve niçini yazili', () => {
    const c = oku(CETVEL)
    expect(c, 'cetvel is_admin_claim i anmiyor').toMatch(/is_admin_claim/)
    expect(c, 'cetvelde user_profiles istisnasi yazili degil').toMatch(/user_profiles/)
    expect(c, 'cetvelde 54001 gerekcesi yok').toMatch(/54001/)
  })
})
