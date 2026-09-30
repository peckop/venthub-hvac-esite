#!/usr/bin/env node
/**
 * INV-SATIS-KIPI-2a/2b/2c/2d/2e — satış kipi anahtarının CANLI davranışı (REC-168, plan adım 4).
 * Cetvel: docs/standards/satis-kipi-gecis-standard.md §migration taslağı tablosu · plan: docs/plans/rec168-satis-kipi-db-plani-2026-09-29.md.
 *
 * NE ÖLÇER (hepsi TEK işlemde, SONUNDA ROLLBACK — kalıcı yan etki yok, webhook kuyruğuna kalıcı kayıt düşmez):
 *  2a  anon `site_settings` tablosunu DOĞRUDAN okuyamaz (RLS/GRANT reddi) — RPC tek yol.
 *  2b  `satis_kipi_oku()` anon çağrısında cevabın anahtarları YALNIZ {acik, damga}; metinde `iyzico` GEÇMEZ.
 *  2c  `payment` satırının güncellenmesi webhook ATMAZ (WHEN koşulu) — POZİTİF KONTROL: satis_kipi INSERT'i atar
 *      (ölçüm aracının çalıştığını kanıtlar; kontrol yoksa "0" hem doğru hem bozuk ölçümden çıkardı).
 *  2d  satır YOKKEN `{acik:false}` (satır işlem içinde silinir, ROLLBACK ile geri gelir).
 *  2e  panel kilidi: yönetici rolü `satis_kipi` INSERT/UPDATE edemez (RLS), `general` UPDATE geçer.
 *
 * ⛔FAIL-CLOSED: `SUPABASE_DB_URL` yoksa, RPC yoksa (migration inmemiş), pg_net kuyruğu okunamazsa, ölçülecek yönetici
 * bulunamazsa → ÖLÇEMEDİ = çıkış 1. Ölçememek geçmek DEĞİLDİR (anon-yazma-nobetcisi ile aynı ilke).
 * ⚠ÇALIŞMA ZAMANI: canlı DB'ye bağlanır; yalnız migration UYGULANDIKTAN SONRA (plan adım 4) koşulur ve içindeki yazmalar
 * ROLLBACK'lidir. Migration öncesi RPC yoktur → 2b/2d "ÖLÇÜLEMEDİ" verir; bu beklenen bir sonuçtur.
 * PGlite gölgesi (docs/audits/rec168-satis-kipi-golge-2026-09-29.mjs) aynı davranışları gerçek dosya üzerinde sınamıştır;
 * bu betik CANLIYI ölçer (canlı = gölge mi sorusu).
 */
import pg from 'pg'

import { resolveTls } from '../../katalog/katalog-sayim.mjs'

const yaz = (s) => process.stdout.write(`${s}\n`)
let basarisiz = 0
let olculemedi = 0
const kontrol = (ad, kosul, ayrinti = '') => {
  if (!kosul) basarisiz++
  yaz(`${kosul ? 'GECTI  ' : 'KALDI  '} ${ad}${ayrinti ? ' — ' + ayrinti : ''}`)
}
const olcemedim = (ad, neden) => {
  olculemedi++
  yaz(`OLCEMEDI ${ad} — ${neden}`)
}

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.error('::error title=satis-kipi-canli::SUPABASE_DB_URL yok — OLCEMEDI. Olcememek gecmek DEGILDIR.')
    process.exit(1)
  }
  // sslmode bağlantı dizesinden sökülür (kardeş kapılarla aynı gerekçe: depodaki doğrulanmış CA devre dışı kalmasın).
  const temizUrl = dbUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  const client = new pg.Client({ connectionString: temizUrl, ssl: resolveTls() })
  await client.connect()

  const dene = async (ad, sql) => {
    await client.query(`savepoint ${ad}`)
    try {
      const r = await client.query(sql)
      await client.query(`release savepoint ${ad}`)
      return { ok: true, r }
    } catch (e) {
      await client.query(`rollback to savepoint ${ad}`)
      return { ok: false, hata: String(e.message).slice(0, 120) }
    }
  }
  const rolAl = async (rol, sub) => {
    await client.query(`select set_config('request.jwt.claim.role', $1, true), set_config('request.jwt.claim.sub', $2, true)`, [rol, sub ?? ''])
    await client.query(`set local role ${rol}`)
  }
  const rolBirak = async () => client.query('reset role')

  try {
    await client.query('begin')
    await client.query(`set local lock_timeout = '3s'`)
    await client.query(`set local statement_timeout = '15s'`)

    // Ön koşul: RPC var mı (migration inmiş mi)?
    const rpc = await client.query(`select 1 from pg_proc where proname = 'satis_kipi_oku' and pronamespace = 'public'::regnamespace`)
    if (rpc.rowCount === 0) {
      olcemedim('ön koşul', 'satis_kipi_oku() canlıda YOK — migration inmemiş; bu betik migration SONRASI koşulur')
      olcemedim('2a-2e', 'ön koşul yok')
      return
    }

    // 2a — anon tabloyu doğrudan okuyamaz
    await rolAl('anon', null)
    const a = await dene('s2a', 'select count(*) from public.site_settings')
    await rolBirak()
    kontrol('2a anon site_settings tablosunu DOĞRUDAN okuyamaz', a.ok === false, a.ok ? 'OKUYABİLDİ' : a.hata)

    // 2b — RPC cevabı yalnız {acik, damga}
    await rolAl('anon', null)
    const b = await dene('s2b', 'select public.satis_kipi_oku() as k')
    await rolBirak()
    if (!b.ok) {
      kontrol('2b anon RPC çağırabilir', false, b.hata)
    } else {
      const cevap = b.r.rows[0].k
      const anahtarlar = Object.keys(cevap ?? {}).sort()
      kontrol('2b RPC cevabının anahtarları YALNIZ {acik, damga}', anahtarlar.join(',') === 'acik,damga', JSON.stringify(anahtarlar))
      kontrol("2b RPC cevabında 'iyzico' GEÇMEZ", !JSON.stringify(cevap).toLowerCase().includes('iyzico'))
      kontrol('2b acik bir boolean', typeof cevap?.acik === 'boolean', JSON.stringify(cevap))
    }

    // 2c — payment yazımı webhook atmaz; pozitif kontrol: satis_kipi yazımı atar (pg_net kuyruğu işlem içinde sayılır)
    const kuyruk = async () => (await client.query('select count(*)::int as n from net.http_request_queue')).rows[0].n
    let kuyrukOkunur = true
    let n0 = 0
    try {
      n0 = await kuyruk()
    } catch {
      kuyrukOkunur = false
    }
    if (!kuyrukOkunur) {
      olcemedim('2c', 'net.http_request_queue okunamadı (pg_net şeması/yetki) — webhook atımı ölçülemedi')
    } else {
      await client.query(`update public.site_settings set value = value where key = 'payment'`)
      const n1 = await kuyruk()
      kontrol('2c payment güncellemesi webhook ATMAZ', n1 === n0, `kuyruk ${n0} → ${n1}`)
      await client.query(`delete from public.site_settings where key = 'satis_kipi'`) // DELETE tetiği (varsa satır) — kuyruğa yazar
      await client.query(`insert into public.site_settings (key, value) values ('satis_kipi', '{"acik": false}')`)
      const n2 = await kuyruk()
      kontrol('2c POZİTİF KONTROL: satis_kipi yazımı webhook ATAR (ölçüm aracı çalışıyor)', n2 > n1, `kuyruk ${n1} → ${n2}`)
    }

    // 2d — satır YOKKEN {acik:false}
    await client.query(`delete from public.site_settings where key = 'satis_kipi'`)
    await rolAl('anon', null)
    const d = await dene('s2d', 'select public.satis_kipi_oku() as k')
    await rolBirak()
    kontrol('2d satır YOKKEN anon {acik:false, damga:null}', d.ok && d.r.rows[0].k?.acik === false && d.r.rows[0].k?.damga === null, d.ok ? JSON.stringify(d.r.rows[0].k) : d.hata)

    // 2e — panel kilidi
    const admin = await client.query(`select id from public.user_profiles where role in ('admin','super_admin') limit 1`)
    if (admin.rowCount === 0) {
      olcemedim('2e', 'ölçülecek admin/super_admin kullanıcı bulunamadı')
    } else {
      await rolAl('authenticated', admin.rows[0].id)
      const e1 = await dene('s2e1', `insert into public.site_settings (key, value) values ('satis_kipi', '{"acik": true}')`)
      const e2 = await dene('s2e2', `update public.site_settings set value = '{"acik": true}' where key = 'satis_kipi'`)
      const e3 = await dene('s2e3', `update public.site_settings set key = 'satis_kipi' where key = 'general'`)
      const e4 = await dene('s2e4', `update public.site_settings set value = value where key = 'general'`)
      await rolBirak()
      kontrol('2e yönetici satis_kipi INSERT edemez (RLS)', e1.ok === false, e1.ok ? 'YAZABİLDİ' : e1.hata)
      kontrol('2e yönetici satis_kipi UPDATE etkisiz (0 satır ya da RLS)', e2.ok === false || e2.r.rowCount === 0, e2.ok ? `rowCount=${e2.r.rowCount}` : e2.hata)
      kontrol("2e yönetici başka anahtarı 'satis_kipi'ne YENİDEN ADLANDIRAMAZ (WITH CHECK)", e3.ok === false, e3.ok ? 'YAPABİLDİ' : e3.hata)
      kontrol('2e yönetici general UPDATE GEÇER (panel kırılmadı)', e4.ok === true && e4.r.rowCount === 1, e4.ok ? `rowCount=${e4.r.rowCount}` : e4.hata)
    }
  } finally {
    try {
      await client.query('rollback')
    } catch {
      /* bağlantı zaten kopmuş olabilir; işlem açık kalmaz */
    }
    await client.end()
  }
}

main()
  .then(() => {
    yaz(`\nSONUÇ: ${basarisiz} KALDI · ${olculemedi} OLCEMEDI · (hepsi ROLLBACK'li)`)
    process.exit(basarisiz === 0 && olculemedi === 0 ? 0 : 1)
  })
  .catch((e) => {
    console.error(`satis-kipi-canli: ölçüm patladı — ${e.message}`)
    process.exit(1)
  })
