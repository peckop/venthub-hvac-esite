// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SATIS-KIPI-8 — satış kipi tazeleme zinciri: tetik ⇄ handler dalı ⇄ kurulum betiği (REC-168 A).
 *
 * KORUDUĞU KUSUR: anahtar DB'de değişir ama vitrin/ödeme sayfası eski kalır (rendering-cache-standard §3'ün sınıfı):
 * (a) handler dalı yoksa tetik boşa atar; (b) dal `general`/`payment` değişimini de "kip değişti" sanırsa keşif/ana sayfa
 * önbelleği gereksiz thrash olur; (c) DELETE ya da anahtar yeniden adlandırma sayılmazsa "açık" önbellekte kalır;
 * (d) kurulum betiği (`webhook_setup.sql`) migration'dan ayrışırsa yeni ortamda zincir eksik kurulur.
 *
 * NE ÖLÇMEZ: tetiğin gerçek `handle_supabase_webhook` (Vault + pg_net) ile route'a ulaşması — Docker gölgesi kalemi
 * (cetvel satis-kipi-gecis-standard §11) ve canlıda `scripts/db/checks/satis-kipi-canli.mjs`.
 */
const KOK = path.resolve(__dirname, '../../..')
const oku = (p: string) => fs.readFileSync(path.join(KOK, p), 'utf8')
const ROTA = oku('src/app/api/webhook/supabase/route.ts')
const MIGRATION = oku('supabase/migrations/20260929150000_satis_kipi_anahtari.sql')
const KURULUM = oku('scripts/webhook_setup.sql')

/** Yorumları çıkarır (satır ve blok) — aranan şey KOD, yorumda geçmesi kanıt değil. */
const yorumsuz = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/--[^\n]*/g, '')

describe('INV-SATIS-KIPI-8: satış kipi tazeleme zinciri', () => {
  // Dosya CRLF olabilir: satır sonu `\r?\n` ile karşılanır; dal, girintisi 4 olan kapanış `}`'ye kadar.
  const dalMatch = ROTA.match(/else if \(table === 'site_settings'\) \{([\s\S]*?)\r?\n    \}(?=\r?\n)/)

  it("handler dalı TEK koşullu `table === 'site_settings'` (INV-RENDER-2 bileşik koşulu görmez)", () => {
    expect(dalMatch, 'site_settings dalı bulunamadı').not.toBeNull()
    expect([...ROTA.matchAll(/else if \(table === 'site_settings'\)/g)]).toHaveLength(1)
  })

  it('dal YALNIZ satis_kipi anahtarında SATIS_KIPI_TAG tazeler; eski adı da sayar (yeniden adlandırma)', () => {
    const dal = yorumsuz(dalMatch![1])
    expect(dal).toMatch(/anahtar === 'satis_kipi'/)
    expect(dal, 'eski anahtar (yeniden adlandırma/DELETE) sayılmıyor').toMatch(/eskiAnahtar === 'satis_kipi'/)
    expect(dal).toMatch(/revalidateTag\(SATIS_KIPI_TAG\)/)
  })

  it('dal keşif/ana sayfa etiketlerine DOKUNMAZ; ortak blok site_settings için keşfi kapatır', () => {
    const dal = yorumsuz(dalMatch![1])
    expect(dal).not.toMatch(/PRODUCTS_DISCOVERY_TAG|HOME_DATA_TAG|homeDataTag|discoveryTag/)
    expect(yorumsuz(ROTA)).toMatch(/table === 'inventory_movements' \|\| table === 'product_prices' \|\| table === 'site_settings'/)
  })

  it('migration: üç tetik, doğru WHEN koşullarıyla', () => {
    const m = yorumsuz(MIGRATION)
    expect(m).toMatch(/on_site_settings_satis_kipi_ins[\s\S]*?after insert[\s\S]*?when \(new\.key = 'satis_kipi'\)/)
    expect(m).toMatch(/on_site_settings_satis_kipi_upd[\s\S]*?after update[\s\S]*?when \(new\.key = 'satis_kipi' or old\.key = 'satis_kipi'\)/)
    expect(m).toMatch(/on_site_settings_satis_kipi_del[\s\S]*?after delete[\s\S]*?when \(old\.key = 'satis_kipi'\)/)
  })

  it('kurulum betiği (webhook_setup.sql) migration ile AYNI üç tetiği ve koşulları kurar', () => {
    const k = yorumsuz(KURULUM).replace(/\s+/g, ' ')
    expect(k).toMatch(/on_site_settings_satis_kipi_ins AFTER INSERT ON public\.site_settings FOR EACH ROW WHEN \(NEW\.key = 'satis_kipi'\)/i)
    expect(k).toMatch(/on_site_settings_satis_kipi_upd AFTER UPDATE ON public\.site_settings FOR EACH ROW WHEN \(NEW\.key = 'satis_kipi' OR OLD\.key = 'satis_kipi'\)/i)
    expect(k).toMatch(/on_site_settings_satis_kipi_del AFTER DELETE ON public\.site_settings FOR EACH ROW WHEN \(OLD\.key = 'satis_kipi'\)/i)
  })

  it("migration: panel yazma kilidi iki RESTRICTIVE politika, `satis_kipi`'yi `authenticated`'a kapatır", () => {
    const m = yorumsuz(MIGRATION)
    expect(m).toMatch(/site_settings_satis_kipi_yalniz_servis_ins[\s\S]*?as restrictive for insert to authenticated[\s\S]*?with check \(key <> 'satis_kipi'\)/)
    expect(m).toMatch(/site_settings_satis_kipi_yalniz_servis_upd[\s\S]*?as restrictive for update to authenticated[\s\S]*?using \(key <> 'satis_kipi'\)[\s\S]*?with check \(key <> 'satis_kipi'\)/)
  })

  it('migration: fonksiyon DEFINER + search_path kilitli + revoke önce, hedefli grant sonra; veri YAZMAZ', () => {
    const m = yorumsuz(MIGRATION)
    expect(m).toMatch(/security definer[\s\S]*?set search_path = ''/)
    expect(m.indexOf('revoke all on function public.satis_kipi_oku()')).toBeGreaterThan(-1)
    expect(m.indexOf('revoke all on function public.satis_kipi_oku()')).toBeLessThan(m.indexOf('grant execute on function public.satis_kipi_oku()'))
    expect(m, 'migration veri yazıyor: satır eklemek anahtarı AÇAR/KAPATIR, bu migration\'ın işi değil').not.toMatch(/insert into public\.site_settings|update public\.site_settings|delete from public\.site_settings/)
    expect(m).toMatch(/set lock_timeout = '5s'/)
    expect(m).toMatch(/set statement_timeout = '30s'/)
  })
})
