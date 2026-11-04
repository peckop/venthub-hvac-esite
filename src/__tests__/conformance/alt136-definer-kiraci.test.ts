// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-ALT136-1 — DEFINER fonksiyonlarına kiracı kapısı (ALT-136); url_takma_adlari_listele anon'a AÇIK KALIR.
 *
 * ⭐NİÇİN VAR: DEFINER fonksiyonun rol kapısı "çağıran admin mi" diye bakar, KİRACIYI bilmez; RLS sahip yetkisiyle
 * atlandığı için rolü uygun bir kullanıcı başka kiracının ürününe stok yazabilir, e-postalarını okuyabilir, siparişinin
 * stoğunu geri verebilir, kullanıcısının rolünü değiştirebilirdi (kural 12: data bleeding). Doğru desen
 * process_goods_receipt'te: service_role değilse hedef satırın tenant_id'si public.jwt_tenant_id()'ye eşit olmalı,
 * değilse RAISE. Bu kapı o desenin altı gövdede (adjust_stock x2, admin_list_all_users, admin_list_users,
 * process_order_stock_restore, set_user_admin_role) sökülmemesini ve iki kararın geri kaçmamasını ölçer:
 * moderator bu iki listenin ÇAĞIRAN kapısında yok; url_takma_adlari_listele anon'a AÇIK kalır.
 *
 * ⭐ANON NEDEN AÇIK (pinli): ilk taramada tek çağıran service_role'lü harita betiği sanılmıştı; scripts/onizleme.mjs
 * (satır 185 ve 313) anon anahtarı SUPABASE_SERVICE_ROLE_KEY değişken adıyla scripts/adres/harita-uret.ts'ye verir ve
 * üreteç bu RPC'yi ANON olarak çağırır (ön izleme: haritaUret(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, ...)). REVOKE edilirse
 * ön izlemenin ADRES kipi sessizce bozulur. Bu dosya anon'un açık kalmasını ve sebebinin (onizleme.mjs) hâlâ geçerli
 * olduğunu pinler; ön izleme düzeltilirse pin kırmızıya döner ve REVOKE yeniden değerlendirilebilir.
 *
 * KOLLAR
 *  A. STATİK — migration METNİ: zaman sınırları, damga sırası, başlık (imza, SECURITY DEFINER, search_path, dönüş tipi)
 *     tabanla AYNI, her gövdede kiracı kapısı, rol listeleri, anon'un açık kalışı, rollback dosyası.
 *  B. GÖVDE SADAKATİ — her gövde, 2026-11-03 şema tabanındaki gövdeye (admin_list_all_users için #2243 gövdesine)
 *     YALNIZ aşağıdaki DEGISIM çiftleriyle ayrışır; çiftler dışındaki her satır tabanla birebir aynıdır. Gövdeyi elle
 *     yeniden yazmak ya da sessizce değiştirmek (ör. sipariş durum mantığına dokunmak, kural 11) burada KIRMIZI verir.
 *  C. DAVRANIŞ (PGlite) — migration'ın KENDİ SQL'i iki kiracılı veride koşar: yabancı kiracı reddedilir, service_role
 *     muaf, kendi kiracı çalışır, atlanan ürün sessiz başarı vermez. PGlite depoya bağımlılık OLARAK EKLİ DEĞİL:
 *     yüklenemezse kol ATLANIR ve atlandığı görünür (vitest "skipped"); ATLANMIŞ KOL YEŞİL DEĞİLDİR. Yerelde:
 *       PGLITE_GIRIS=<klasör>/node_modules/@electric-sql/pglite/dist/index.js PGLITE_ZORUNLU=1 pnpm exec vitest run <bu dosya>
 *  D. AYIRT EDİCİLİK — her kol, bilerek bozulmuş migration kopyasında KIRMIZI verir (vakumda yeşil yok): süzgeç
 *     silinince, moderator eklenince, anon REVOKE gelince, profil-yok kapısı ve atlanan-ürün kapısı silinince ve diğerleri.
 *
 * ⚠ÖLÇMEDİĞİ (adıyla): canlıdaki GERÇEK jwt_tenant_id() (PGlite'ta aynı mantıkta bir taklit var), enforce_role_change
 * tetiği (set_user_admin_role davranışı tetiksiz ölçülür), canlı ACL ve canlı kiracı sayısı. Onları merge SONRASI
 * migration dosyasının sonundaki doğrulama sorguları ölçer. Kiracı kimlikleri BURADA SAHTEDİR.
 */
const KOK = process.cwd()
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const GERI_DIZIN = path.join(KOK, 'scripts', 'db', 'rollback')
const TABAN_YOLU = path.join(KOK, 'supabase', 'baselines', '2026-11-03_public_schema.sql')

const MIG_SONEK = '_alt136_definer_kiraci_kapisi.sql'
const GERI_SONEK = '_alt136_definer_kiraci_kapisi_geri_al.sql'
const ALT145_SONEK = '_alt145_yetki_y4_y5b_k5.sql'
const URL_TAKMA = 'url_takma_adlari_listele'

const oku = (p: string): string => fs.readFileSync(p, 'utf8').replace(/\r/g, '')

type Mig = { ad: string; sql: string }

const zincir: Mig[] = fs
  .readdirSync(MIG_DIZIN)
  .filter((a) => a.endsWith('.sql'))
  .sort()
  .map((ad) => ({ ad, sql: oku(path.join(MIG_DIZIN, ad)) }))

const migAdaylar = zincir.filter((m) => m.ad.endsWith(MIG_SONEK))
const alt145Adaylar = zincir.filter((m) => m.ad.endsWith(ALT145_SONEK))
const geriAdaylar = fs.existsSync(GERI_DIZIN) ? fs.readdirSync(GERI_DIZIN).filter((f) => f.endsWith(GERI_SONEK)) : []

const MIG_DOSYA: Mig | null = migAdaylar.length === 1 ? migAdaylar[0] : null
const MIG = MIG_DOSYA?.sql ?? ''
const MIG145 = alt145Adaylar.length === 1 ? alt145Adaylar[0].sql : ''
const GERI = geriAdaylar.length === 1 ? oku(path.join(GERI_DIZIN, geriAdaylar[0])) : ''
const TABAN = oku(TABAN_YOLU)

/** Yorumları siler, tırnaklı tanımlayıcıları açar, küçük harfe indirir, boşlukları tekler. */
function normalize(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/"([a-z_][a-z0-9_]*)"/gi, '$1')
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

interface Tanim {
  baslik: string
  govde: string
}

/** `create [or replace] function [public.]<ad>(` tanımları (aşırı yüklemeler dahil), normalize: başlık ve gövde ($$ ... $$). */
function tanimlar(sql: string, ad: string): Tanim[] {
  const n = normalize(sql)
  const re = new RegExp(`create (?:or replace )?function (?:public\\.)?${ad}\\(`, 'g')
  const sonuc: Tanim[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(n))) {
    const a = n.indexOf('$$', m.index)
    const b = a < 0 ? -1 : n.indexOf('$$', a + 2)
    if (a < 0 || b < 0) break
    sonuc.push({ baslik: n.slice(m.index, a), govde: n.slice(a + 2, b).trim() })
    re.lastIndex = b + 2
  }
  return sonuc
}

/** Altı tanım: adjust_stock x2 (3 ve 4 argüman), admin_list_all_users, admin_list_users, process_order_stock_restore, set_user_admin_role. */
const ETIKETLER = [
  'adjust_stock/3',
  'adjust_stock/4',
  'admin_list_all_users',
  'admin_list_users',
  'process_order_stock_restore',
  'set_user_admin_role',
] as const
type Etiket = (typeof ETIKETLER)[number]

function bul(sql: string, etiket: Etiket): Tanim | null {
  switch (etiket) {
    case 'adjust_stock/3':
      return tanimlar(sql, 'adjust_stock').find((t) => !t.baslik.includes('p_batch_id')) ?? null
    case 'adjust_stock/4':
      return tanimlar(sql, 'adjust_stock').find((t) => t.baslik.includes('p_batch_id')) ?? null
    default:
      return tanimlar(sql, etiket)[0] ?? null
  }
}

/** Başlık ve gövde için KARŞILAŞTIRMA kaynağı: admin_list_all_users #2243 (ALT-145) gövdesine, diğerleri tabana göre. */
function kaynak(etiket: Etiket): Tanim | null {
  return etiket === 'admin_list_all_users' ? bul(MIG145, etiket) : bul(TABAN, etiket)
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// KOL A · STATİK
// ─────────────────────────────────────────────────────────────────────────────────────────────────

const damgaOf = (ad: string): string => ad.slice(0, 14)

/** Damga 14 haneli ve ALT-145'ten SONRA (admin_list_all_users #2243 sürümünün üstüne kurulur). */
function siraIhlalleri(ad: string, ad145: string): string[] {
  const h: string[] = []
  if (!/^\d{14}_/.test(ad)) h.push('damga 14 haneli değil (INV-MIGRATION-2)')
  if (!(damgaOf(ad) > damgaOf(ad145))) h.push(`damga alt145'ten (${damgaOf(ad145)}) sonra değil: ${damgaOf(ad)}`)
  return h
}

/** begin; sonra lock_timeout ve statement_timeout, ilk DDL'den önce; commit; ile biter (Squawk INV-MIGRATION-3). */
function zamanSiniriIhlalleri(sql: string): string[] {
  const n = normalize(sql)
  const h: string[] = []
  const bas = n.indexOf('begin;')
  const lk = n.indexOf("set lock_timeout = '1s';")
  const st = n.indexOf("set statement_timeout = '5s';")
  const ddl = n.search(/create or replace function|revoke |grant /)
  if (bas < 0) h.push('begin; yok')
  if (lk < 0 || (bas >= 0 && lk < bas)) h.push("begin;'den sonra set lock_timeout = '1s' yok")
  if (st < 0 || (bas >= 0 && st < bas)) h.push("begin;'den sonra set statement_timeout = '5s' yok")
  if (ddl >= 0 && ((lk >= 0 && lk > ddl) || (st >= 0 && st > ddl))) h.push('zaman sınırları ilk DDL ifadesinden SONRA')
  if (!n.trim().endsWith('commit;')) h.push('commit; ile bitmiyor')
  return h
}

/** Başlık (imza, dönüş tipi, SECURITY DEFINER, search_path) kaynakla AYNI: CREATE OR REPLACE ACL'i yalnız bu durumda korur. */
function baslikIhlalleri(sql: string): string[] {
  const h: string[] = []
  for (const e of ETIKETLER) {
    const f = bul(sql, e)
    const k = kaynak(e)
    if (!f) h.push(`${e}: tanım bulunamadı`)
    else if (!k) h.push(`${e}: kaynak tanım bulunamadı (test girdisi bozuk)`)
    else if (f.baslik !== k.baslik) h.push(`${e}: başlık (imza, security definer, search_path, dönüş tipi) kaynaktan ayrışıyor`)
  }
  return h
}

const AUTH_ROLE = "coalesce(auth.role(), '')"

/** Her gövdede kiracı kapısı: service_role muaf, değilse hedef satırın kiracısı jwt_tenant_id() ile aynı olmalı. */
function kiraciIhlalleri(sql: string): string[] {
  const h: string[] = []
  const ara = (etiket: Etiket, ad: string, desen: RegExp): void => {
    const f = bul(sql, etiket)
    if (!f) h.push(`${etiket}: tanım bulunamadı`)
    else if (!desen.test(f.govde)) h.push(`${etiket}: ${ad} yok`)
  }
  for (const e of ['adjust_stock/3', 'adjust_stock/4'] as const) {
    ara(
      e,
      'ürün kiracısı + kiracı kapısı (service_role muaf) ya da rol kapısından sonra / UPDATE öncesi değil',
      /^declare v_tenant uuid; begin if not \(.*?\) then raise exception 'not authorized'; end if; select p\.tenant_id into v_tenant from public\.products p where p\.id = p_product_id; if coalesce\(auth\.role\(\), ''\) <> 'service_role' and v_tenant is distinct from public\.jwt_tenant_id\(\) then raise exception 'not authorized'; end if; update public\.products /,
    )
    ara(e, 'hareket satırında tenant_id = v_tenant (kiracı üründen alınır)', /insert into public\.inventory_movements \([^)]*, tenant_id\) values \(.*, v_tenant\);/)
  }
  ara(
    'admin_list_all_users',
    'kiracı süzgeci (where up.tenant_id = public.jwt_tenant_id())',
    /left join public\.user_profiles up on up\.id = u\.id where up\.tenant_id = public\.jwt_tenant_id\(\) order by/,
  )
  ara(
    'admin_list_users',
    'kiracı süzgeci (and up.tenant_id = public.jwt_tenant_id())',
    /where up\.role in \([^)]*\) and up\.tenant_id = public\.jwt_tenant_id\(\) order by up\.created_at desc;/,
  )
  ara(
    'process_order_stock_restore',
    'sipariş kiracısı okunuyor, yok/yabancı için RAISE (service_role muaf)',
    /select o\.tenant_id into v_order_tenant from public\.venthub_orders o where o\.id = v_order_uuid for update; if not found then if coalesce\(auth\.role\(\), ''\) <> 'service_role' then raise exception 'not authorized'; end if; return jsonb_build_object\('success', false, 'error', 'order not found', 'restored_count', 0\); end if; if coalesce\(auth\.role\(\), ''\) <> 'service_role' and v_order_tenant is distinct from public\.jwt_tenant_id\(\) then raise exception 'not authorized'; end if;/,
  )
  ara(
    'process_order_stock_restore',
    'ürün güncellemesinde tenant_id = v_order_tenant + atlanan ürünün sayılması + hareketin kiracısı',
    /update public\.products set stock_qty = coalesce\(stock_qty, 0\) \+ v_qty where id = v_item\.product_id and tenant_id = v_order_tenant; if not found then v_skipped := v_skipped \+ 1; continue; end if; insert into public\.inventory_movements \(product_id, order_id, delta, reason, tenant_id\) values \(v_item\.product_id, v_order_uuid, v_qty, p_reason, v_order_tenant\);/,
  )
  ara(
    'process_order_stock_restore',
    'atlanan ürün kapısı: skipped > 0 iken tarayıcıda RAISE, service_role success:false (skipped dönüşte)',
    /end loop; if v_skipped > 0 then if coalesce\(auth\.role\(\), ''\) <> 'service_role' then raise exception '[^']*', v_skipped; end if; return jsonb_build_object\( 'success', false, 'error', 'product tenant mismatch', [^;]*'skipped', v_skipped, [^;]*\); end if; return jsonb_build_object\( 'success', true, [^;]*'skipped', v_skipped, [^;]*\);/,
  )
  ara(
    'set_user_admin_role',
    'hedef profilin kiracı kapısı: profil YOKSA da RAISE (service_role muaf)',
    /if coalesce\(auth\.role\(\), ''\) <> 'service_role' then select up\.tenant_id into v_hedef_tenant from public\.user_profiles up where up\.id = user_id; if not found or v_hedef_tenant is distinct from public\.jwt_tenant_id\(\) then raise exception 'not authorized'; end if; end if;/,
  )
  ara(
    'set_user_admin_role',
    'upsert yeni satırda tenant_id = jwt_tenant_id() + DO UPDATE ... WHERE yarış kapısı + etkilenen 0 ise RAISE',
    /insert into public\.user_profiles as up \(id, role, tenant_id\) values \(user_id, new_role, public\.jwt_tenant_id\(\)\) on conflict \(id\) do update set role = excluded\.role, updated_at = now\(\) where coalesce\(auth\.role\(\), ''\) = 'service_role' or up\.tenant_id = public\.jwt_tenant_id\(\); get diagnostics v_etkilenen = row_count; if v_etkilenen = 0 then raise exception 'not authorized'; end if;/,
  )
  // Kapı gövde dışına taşınmamalı: her gövde jwt_tenant_id()'yi gerçekten çağırıyor.
  for (const e of ETIKETLER) {
    const f = bul(sql, e)
    if (f && !f.govde.includes('public.jwt_tenant_id()')) h.push(`${e}: gövdede public.jwt_tenant_id() çağrısı yok`)
  }
  if (!AUTH_ROLE) h.push('test girdisi bozuk')
  return h
}

/** admin_list_all_users ve admin_list_users: ÇAĞIRAN kapısı yalnız admin + super_admin, moderator YOK. */
function rolIhlalleri(sql: string): string[] {
  const h: string[] = []
  const KAPI =
    /if not exists \( select 1 from public\.user_profiles up where up\.id = auth\.uid\(\) and up\.role in \(([^)]*)\) \) then raise exception 'not authorized'/
  for (const e of ['admin_list_all_users', 'admin_list_users'] as const) {
    const f = bul(sql, e)
    if (!f) {
      h.push(`${e}: tanım bulunamadı`)
      continue
    }
    const m = KAPI.exec(f.govde)
    if (!m) {
      h.push(`${e}: çağıran rol kapısı bulunamadı`)
      continue
    }
    const roller = m[1]
      .split(',')
      .map((r) => r.trim().replace(/'/g, ''))
      .sort()
    if (roller.includes('moderator')) h.push(`${e}: çağıran kapısında moderator`)
    if (roller.join(',') !== 'admin,super_admin') h.push(`${e}: çağıran kapısı beklenenden farklı: ${roller.join(',')}`)
  }
  const tum = bul(sql, 'admin_list_all_users')
  if (tum && tum.govde.includes('moderator')) h.push('admin_list_all_users: gövdede moderator geçiyor')
  return h
}

/** Olay sırası: bir rol için url_takma_adlari_listele() üzerindeki SON grant/revoke (yalnız bu işlevi hedefleyenler). */
function sonYetki(z: Mig[], rol: string): 'grant' | 'revoke' | null {
  let son: 'grant' | 'revoke' | null = null
  const hedef = new RegExp(`\\bon function (?:public\\.)?${URL_TAKMA}(?![a-z0-9_])`)
  const rolDes = new RegExp(`\\b(?:to|from) (?:[a-z_]+ ?, ?)*${rol}\\b`)
  for (const m of z) {
    for (const ifade of normalize(m.sql).split(';')) {
      if (!hedef.test(ifade) || !rolDes.test(ifade)) continue
      if (/^\s*grant (?:execute|all)/.test(ifade)) son = 'grant'
      else if (/^\s*revoke (?:execute|all)/.test(ifade)) son = 'revoke'
    }
  }
  return son
}

/**
 * url_takma_adlari_listele: zincirin SON hâlinde anon, authenticated ve service_role AÇIK (kapatılmamış), PUBLIC kapalı.
 * Anon AÇIK KALIR: scripts/onizleme.mjs anon anahtarla harita üretecini koşturur (başlıktaki ANON NEDEN AÇIK notu).
 */
function anonAcikIhlalleri(z: Mig[]): string[] {
  const h: string[] = []
  for (const rol of ['anon', 'authenticated', 'service_role']) {
    if (sonYetki(z, rol) === 'revoke') {
      h.push(
        `${rol}: KAPANMIŞ — ${rol === 'anon' ? "scripts/onizleme.mjs anon anahtarla url_takma_adlari_listele'yi çağırıyor (ön izleme ADRES kipi bozulur)" : 'eski adres haritası üretilemez'}`,
      )
    }
  }
  if (sonYetki(z, 'public') !== 'revoke') h.push(`public: zincirin son olayı revoke değil (${sonYetki(z, 'public') ?? 'olay yok'}) — herkese açık`)
  return h
}

/** Anon'un açık kalma SEBEBİ hâlâ geçerli mi: ön izleme betiği anon anahtarı harita üretecine SERVICE_ROLE adıyla veriyor. */
const ONIZLEME_YOLU = path.join(KOK, 'scripts', 'onizleme.mjs')
const ONIZLEME_KODU: string | null = fs.existsSync(ONIZLEME_YOLU) ? oku(ONIZLEME_YOLU) : null
function onizlemeSebebiIhlalleri(kod: string | null): string[] {
  if (kod === null) return ['scripts/onizleme.mjs yok — anon açık kalma sebebi ölçülemedi, REVOKE kararını yeniden değerlendir']
  const h: string[] = []
  if (!/SUPABASE_SERVICE_ROLE_KEY:\s*anonAnahtar/.test(kod)) h.push('onizleme.mjs artık anon anahtarı harita-uret.ts\'ye SERVICE_ROLE adıyla vermiyor')
  if (!/haritaUret\(env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/.test(kod)) h.push('onizleme.mjs haritaUret\'i artık anon anahtarla çağırmıyor')
  return h.map((x) => `${x} — anon açık kalma sebebi ortadan kalkmış olabilir: REVOKE yeniden değerlendirilebilir, bu pini bilerek güncelle`)
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// KOL B · GÖVDE SADAKATİ
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/** adjust_stock iki aşırı yüklemesinde AYNI kiracı kapısı bloğu. */
const ADJ_KAPI =
  "select p.tenant_id into v_tenant from public.products p where p.id = p_product_id; if coalesce(auth.role(), '') <> 'service_role' and v_tenant is distinct from public.jwt_tenant_id() then raise exception 'not authorized'; end if;"

/**
 * [taban parçası, yeni parça] çiftleri, normalize (yorumsuz, küçük harf, tek boşluk) gövde üzerinde. Her `bul` tabanda
 * TAM BİR kez geçmeli. Çiftler tabana sırayla uygulanınca migration gövdesine BİREBİR eşit olmalı.
 */
const DEGISIM: Record<Etiket, Array<[string, string]>> = {
  'adjust_stock/3': [
    ['begin if not (', 'declare v_tenant uuid; begin if not ('],
    ['end if; update public.products', `end if; ${ADJ_KAPI} update public.products`],
    [
      "(product_id, delta, reason) values (p_product_id, p_delta, coalesce(p_reason, 'adjust'))",
      "(product_id, delta, reason, tenant_id) values (p_product_id, p_delta, coalesce(p_reason, 'adjust'), v_tenant)",
    ],
  ],
  'adjust_stock/4': [
    ['begin if not (', 'declare v_tenant uuid; begin if not ('],
    ['end if; update public.products', `end if; ${ADJ_KAPI} update public.products`],
    [
      "(product_id, delta, reason, batch_id) values (p_product_id, p_delta, coalesce(p_reason, 'adjust'), p_batch_id)",
      "(product_id, delta, reason, batch_id, tenant_id) values (p_product_id, p_delta, coalesce(p_reason, 'adjust'), p_batch_id, v_tenant)",
    ],
  ],
  admin_list_all_users: [
    [
      'left join public.user_profiles up on up.id = u.id order by',
      'left join public.user_profiles up on up.id = u.id where up.tenant_id = public.jwt_tenant_id() order by',
    ],
  ],
  admin_list_users: [
    [
      "up.id = auth.uid() and up.role in ('admin','moderator','super_admin') )",
      "up.id = auth.uid() and up.role in ('admin','super_admin') )",
    ],
    [
      "where up.role in ('admin','moderator','super_admin') order by",
      "where up.role in ('admin','moderator','super_admin') and up.tenant_id = public.jwt_tenant_id() order by",
    ],
  ],
  process_order_stock_restore: [
    ['v_order_uuid uuid;', 'v_order_uuid uuid; v_order_tenant uuid;'],
    ['v_restored_units int := 0;', 'v_restored_units int := 0; v_skipped int := 0;'],
    [
      "perform 1 from public.venthub_orders where id = v_order_uuid for update; if not found then return jsonb_build_object('success', false, 'error', 'order not found', 'restored_count', 0); end if;",
      "select o.tenant_id into v_order_tenant from public.venthub_orders o where o.id = v_order_uuid for update; if not found then if coalesce(auth.role(), '') <> 'service_role' then raise exception 'not authorized'; end if; return jsonb_build_object('success', false, 'error', 'order not found', 'restored_count', 0); end if; if coalesce(auth.role(), '') <> 'service_role' and v_order_tenant is distinct from public.jwt_tenant_id() then raise exception 'not authorized'; end if;",
    ],
    [
      'where id = v_item.product_id; insert into public.inventory_movements (product_id, order_id, delta, reason) values (v_item.product_id, v_order_uuid, v_qty, p_reason);',
      'where id = v_item.product_id and tenant_id = v_order_tenant; if not found then v_skipped := v_skipped + 1; continue; end if; insert into public.inventory_movements (product_id, order_id, delta, reason, tenant_id) values (v_item.product_id, v_order_uuid, v_qty, p_reason, v_order_tenant);',
    ],
    [
      "end loop; return jsonb_build_object( 'success', true, 'restored_count', v_restored_count, 'restored_units', v_restored_units, 'reason', p_reason, 'order_id', p_order_id );",
      "end loop; if v_skipped > 0 then if coalesce(auth.role(), '') <> 'service_role' then raise exception 'stock restore: % product(s) skipped (tenant mismatch)', v_skipped; end if; return jsonb_build_object( 'success', false, 'error', 'product tenant mismatch', 'restored_count', v_restored_count, 'restored_units', v_restored_units, 'skipped', v_skipped, 'reason', p_reason, 'order_id', p_order_id ); end if; return jsonb_build_object( 'success', true, 'restored_count', v_restored_count, 'restored_units', v_restored_units, 'skipped', v_skipped, 'reason', p_reason, 'order_id', p_order_id );",
    ],
  ],
  set_user_admin_role: [
    ['begin if not (', 'declare v_hedef_tenant uuid; v_etkilenen int; begin if not ('],
    [
      "raise exception 'invalid role: %', new_role; end if;",
      "raise exception 'invalid role: %', new_role; end if; if coalesce(auth.role(), '') <> 'service_role' then select up.tenant_id into v_hedef_tenant from public.user_profiles up where up.id = user_id; if not found or v_hedef_tenant is distinct from public.jwt_tenant_id() then raise exception 'not authorized'; end if; end if;",
    ],
    [
      'insert into public.user_profiles (id, role) values (user_id, new_role) on conflict (id) do update set role = excluded.role, updated_at = now();',
      "insert into public.user_profiles as up (id, role, tenant_id) values (user_id, new_role, public.jwt_tenant_id()) on conflict (id) do update set role = excluded.role, updated_at = now() where coalesce(auth.role(), '') = 'service_role' or up.tenant_id = public.jwt_tenant_id(); get diagnostics v_etkilenen = row_count; if v_etkilenen = 0 then raise exception 'not authorized'; end if;",
    ],
  ],
}

/** Çiftleri kaynağa uygular; bir `bul` tam bir kez geçmiyorsa null (test girdisi bozuk). */
function degisimUygula(govde: string, ciftler: Array<[string, string]>): string | null {
  let s = govde
  for (const [b, y] of ciftler) {
    if (s.split(b).length - 1 !== 1) return null
    s = s.replace(b, () => y)
  }
  return s
}

/** Her migration gövdesi = kaynak gövde + YALNIZ DEGISIM çiftleri. */
function sadakatIhlalleri(sql: string): string[] {
  const h: string[] = []
  for (const e of ETIKETLER) {
    const f = bul(sql, e)
    const k = kaynak(e)
    if (!f || !k) {
      h.push(`${e}: tanım ya da kaynak bulunamadı`)
      continue
    }
    const beklenen = degisimUygula(k.govde, DEGISIM[e])
    if (beklenen === null) h.push(`${e}: DEGISIM çiftlerinden biri kaynakta TAM BİR kez geçmiyor (test girdisi bozuk)`)
    else if (beklenen !== f.govde) h.push(`${e}: gövde kaynak + DEGISIM çiftlerinden ayrışıyor (elle yeniden yazılmış ya da sessizce değiştirilmiş)`)
  }
  return h
}

/** Rollback: gövdeler kaynağa döner, işlem sınırları var; url_takma_adlari_listele ACL'ine (migration gibi) dokunmaz. */
function geriIhlalleri(sql: string): string[] {
  const h: string[] = [...zamanSiniriIhlalleri(sql)]
  for (const e of ETIKETLER) {
    const f = bul(sql, e)
    const k = kaynak(e)
    if (!f || !k) h.push(`${e}: rollback'te tanım ya da kaynak bulunamadı`)
    else if (f.baslik !== k.baslik || f.govde !== k.govde) h.push(`${e}: rollback gövdesi kaynağa dönmüyor`)
  }
  if (normalize(sql).includes(URL_TAKMA)) h.push(`rollback ${URL_TAKMA} ACL'ine dokunuyor (migration dokunmadı)`)
  return h
}

/** Migration url_takma_adlari_listele ACL'ine dokunmaz (anon açık kalır). */
function urlAclDokunulmadiIhlalleri(sql: string): string[] {
  return normalize(sql).includes(URL_TAKMA) ? [`migration ${URL_TAKMA}'e dokunuyor — anon AÇIK kalmalı (scripts/onizleme.mjs)`] : []
}

const hepsi = (sql: string): string[] => [
  ...zamanSiniriIhlalleri(sql),
  ...baslikIhlalleri(sql),
  ...kiraciIhlalleri(sql),
  ...rolIhlalleri(sql),
  ...sadakatIhlalleri(sql),
  ...urlAclDokunulmadiIhlalleri(sql),
]

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// KOL C · DAVRANIŞ (PGlite)
// ─────────────────────────────────────────────────────────────────────────────────────────────────

interface PgliteDb {
  exec(sql: string): Promise<unknown>
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>
  close(): Promise<void>
}
type PgliteKurucu = new () => PgliteDb

/** PGlite'ı yükler; yoksa null. Depoya bağımlılık ekli değil: `PGLITE_GIRIS` (dist/index.js) ya da paket adı. */
async function pgliteYukle(): Promise<PgliteKurucu | null> {
  const giris = (process.env.PGLITE_GIRIS ?? '').trim()
  try {
    // INV-KAPI-IMPORT-1 (kapi-import-guvenligi.test.ts): `await import(` sonrası ya TIRNAKLI belirteç ya da pathToFileURL/.href
    // olmalı; ham değişken yol YASAK. Paket adı bu yüzden LİTERAL yazılır. Paket yokken (depoda bağımlılık değil) dinamik
    // import çalışma anında reddedilir ve aşağıdaki catch null döndürür; Vite SSR eksik paketi Node'a bırakır, dosya düşmez.
    // `as string`: paket depoda YOK, çıplak literal tsc'de TS2307 verir (CI "Type check"); tür iddiası belirteci çözülmez yapar.
    const modul: unknown = giris
      ? await import(/* @vite-ignore */ pathToFileURL(giris).href)
      : await import(/* @vite-ignore */ '@electric-sql/pglite' as string)
    const kurucu = (modul as { PGlite?: unknown }).PGlite
    return typeof kurucu === 'function' ? (kurucu as PgliteKurucu) : null
  } catch {
    return null
  }
}

/** SAHTE kimlikler: gerçek kiracı ya da kullanıcı kimliği hiçbir dosyaya yazılmaz. */
const K1 = '00000000-0000-4000-8000-0000000000d1'
const K2 = '00000000-0000-4000-8000-0000000000d2'
const U = {
  admin1: '00000000-0000-4000-8000-0000000000a1',
  admin2: '00000000-0000-4000-8000-0000000000a2',
  moderator1: '00000000-0000-4000-8000-0000000000a3',
  user1: '00000000-0000-4000-8000-0000000000a4',
  user2: '00000000-0000-4000-8000-0000000000a5',
  profilsiz: '00000000-0000-4000-8000-0000000000a6',
}
const URUN = {
  k1: '00000000-0000-4000-8000-0000000000c1',
  k2: '00000000-0000-4000-8000-0000000000c2',
  geriK1: '00000000-0000-4000-8000-0000000000c3',
  geriK2: '00000000-0000-4000-8000-0000000000c4',
  yok: '00000000-0000-4000-8000-0000000000cf',
  /** Anomali: K1 siparişinin kaleminde K2 ürünü (kiracısı uyuşmuyor) ve yanında sağlam bir K1 ürünü. */
  anomaliSaglam: '00000000-0000-4000-8000-0000000000c5',
  anomaliYabanci: '00000000-0000-4000-8000-0000000000c6',
}
const SIPARIS = {
  k1: '00000000-0000-4000-8000-0000000000e1',
  k2: '00000000-0000-4000-8000-0000000000e2',
  yok: '00000000-0000-4000-8000-0000000000ef',
  anomali: '00000000-0000-4000-8000-0000000000e3',
}

/** Roller, auth.uid()/auth.role() ve jwt_tenant_id() TAKLİTLERİ + işlevlerin dokunduğu tabloların asgari hâli + tohum. */
const KURULUM_SQL = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  grant usage on schema auth, public to anon, authenticated, service_role;
  -- Supabase varsayılanı: yeni public işleve anon, authenticated, service_role EXECUTE verilir.
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
  create function auth.uid() returns uuid language sql stable as
    $f$ select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid $f$;
  create function auth.role() returns text language sql stable as
    $f$ select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') $f$;
  grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;
  create function public.jwt_tenant_id() returns uuid language plpgsql set search_path to 'public', 'pg_catalog' as $f$
  declare claims_str text; kiraci text;
  begin
    claims_str := current_setting('request.jwt.claims', true);
    if claims_str is null or claims_str = '' then return '${K1}'::uuid; end if;
    kiraci := claims_str::jsonb -> 'app_metadata' ->> 'tenant_id';
    if kiraci is null or kiraci = '' then return '${K1}'::uuid; end if;
    return kiraci::uuid;
  exception when others then return '${K1}'::uuid;
  end;
  $f$;
  create table auth.users (id uuid primary key, email text, created_at timestamptz default now(), updated_at timestamptz default now());
  create table public.user_profiles (
    id uuid primary key references auth.users(id), role text not null default 'user', full_name text, phone text,
    tenant_id uuid not null default '${K1}', created_at timestamptz default now(), updated_at timestamptz default now());
  create table public.products (id uuid primary key, stock_qty int, tenant_id uuid not null default '${K1}');
  create table public.venthub_orders (id uuid primary key, tenant_id uuid not null default '${K1}');
  create table public.inventory_movements (
    id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id), order_id uuid,
    delta int not null, reason text not null, batch_id uuid, tenant_id uuid not null default '${K1}');
  -- url_takma_adlari_listele: taban ACL'i (REVOKE FROM PUBLIC; anon, authenticated, service_role AÇIK) taklidi.
  create function public.${URL_TAKMA}() returns table(tenant_id uuid) language sql security definer as $f$ select null::uuid where false $f$;
  revoke all on function public.${URL_TAKMA}() from public;

  insert into auth.users (id, email) values
    ('${U.admin1}', 'a1@ornek.test'), ('${U.admin2}', 'a2@ornek.test'), ('${U.moderator1}', 'm1@ornek.test'),
    ('${U.user1}', 'u1@ornek.test'), ('${U.user2}', 'u2@ornek.test'), ('${U.profilsiz}', 'profilsiz@ornek.test');
  insert into public.user_profiles (id, role, tenant_id) values
    ('${U.admin1}', 'admin', '${K1}'), ('${U.admin2}', 'admin', '${K2}'), ('${U.moderator1}', 'moderator', '${K1}'),
    ('${U.user1}', 'user', '${K1}'), ('${U.user2}', 'user', '${K2}');
  insert into public.products (id, stock_qty, tenant_id) values
    ('${URUN.k1}', 10, '${K1}'), ('${URUN.k2}', 10, '${K2}'), ('${URUN.geriK1}', 10, '${K1}'), ('${URUN.geriK2}', 10, '${K2}'),
    ('${URUN.anomaliSaglam}', 10, '${K1}'), ('${URUN.anomaliYabanci}', 10, '${K2}');
  insert into public.venthub_orders (id, tenant_id) values ('${SIPARIS.k1}', '${K1}'), ('${SIPARIS.k2}', '${K2}'), ('${SIPARIS.anomali}', '${K1}');
  insert into public.inventory_movements (product_id, order_id, delta, reason, tenant_id) values
    ('${URUN.geriK1}', '${SIPARIS.k1}', -3, 'order_sale', '${K1}'), ('${URUN.geriK2}', '${SIPARIS.k2}', -4, 'order_sale', '${K2}'),
    ('${URUN.anomaliSaglam}', '${SIPARIS.anomali}', -1, 'order_sale', '${K1}'), ('${URUN.anomaliYabanci}', '${SIPARIS.anomali}', -2, 'order_sale', '${K1}');`

async function kurDb(Pglite: PgliteKurucu, migrationSql: string): Promise<PgliteDb> {
  const db = new Pglite()
  try {
    await db.exec(KURULUM_SQL)
    await db.exec(migrationSql)
    return db
  } catch (e) {
    await db.close().catch(() => undefined)
    throw e
  }
}

type Sonuc = { ok: true; rows: Record<string, unknown>[] } | { ok: false; kod: string | undefined; mesaj: string }

/** `claims`: JWT gövdesi (request.jwt.claims). Kiracı ve rol buradan çözülür (auth.uid()/auth.role()/jwt_tenant_id()). */
async function olarak(db: PgliteDb, rol: string, claims: string, sorgu: string): Promise<Sonuc> {
  await db.exec('reset role')
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [claims])
  await db.exec(`set role ${rol}`)
  try {
    const r = await db.query(sorgu)
    return { ok: true, rows: r.rows }
  } catch (e) {
    const hata = e as { code?: string; message?: string }
    return { ok: false, kod: hata.code, mesaj: String(hata.message ?? e) }
  } finally {
    await db.exec('reset role')
  }
}

const jwt = (sub: string, kiraci: string): string => JSON.stringify({ role: 'authenticated', sub, app_metadata: { tenant_id: kiraci } })
const JWT_SERVICE = JSON.stringify({ role: 'service_role' })

/** Sahip yetkisiyle (RLS/rol yok) tek skaler okur. */
async function skaler(db: PgliteDb, sorgu: string): Promise<unknown> {
  await db.exec('reset role')
  const r = await db.query<{ v: unknown }>(sorgu)
  return r.rows[0]?.v
}

/**
 * Davranış ölçümü: her senaryo (ad, beklenen) çifti; sapma bir İHLAL satırıdır. YABANCI KİRACIYA ERİŞİM ayrı ve açık
 * mesajla yazılır. Senaryolar farklı satırlara dokunur (sıra bağımsız).
 */
async function davranisHatalari(db: PgliteDb): Promise<string[]> {
  const h: string[] = []
  const yetkisiz = (s: Sonuc): boolean => !s.ok && /not authorized/.test(s.mesaj)

  // ── adjust_stock (iki aşırı yükleme) ────────────────────────────────────────────────────────────
  const a1 = jwt(U.admin1, K1)
  for (const [ad, cagri] of [
    ['3 arg', (u: string) => `select public.adjust_stock('${u}'::uuid, 5, 'adjust')`],
    ['4 arg', (u: string) => `select public.adjust_stock('${u}'::uuid, 5, 'adjust', null::uuid)`],
  ] as const) {
    const once = Number(await skaler(db, `select stock_qty as v from public.products where id = '${URUN.k1}'`))
    const kendi = await olarak(db, 'authenticated', a1, cagri(URUN.k1))
    if (!kendi.ok) h.push(`(C) adjust_stock ${ad}: KENDİ kiracı ürünü reddedildi (${kendi.mesaj})`)
    const sonra = Number(await skaler(db, `select stock_qty as v from public.products where id = '${URUN.k1}'`))
    if (sonra !== once + 5) h.push(`(C) adjust_stock ${ad}: kendi ürün stoğu ${once} -> ${sonra} (beklenen ${once + 5})`)

    const k2Once = Number(await skaler(db, `select stock_qty as v from public.products where id = '${URUN.k2}'`))
    const yabanci = await olarak(db, 'authenticated', a1, cagri(URUN.k2))
    if (!yetkisiz(yabanci)) h.push(`(C) adjust_stock ${ad}: YABANCI KİRACI ÜRÜNÜ reddedilmedi`)
    const k2Sonra = Number(await skaler(db, `select stock_qty as v from public.products where id = '${URUN.k2}'`))
    if (k2Sonra !== k2Once) h.push(`(C) adjust_stock ${ad}: YABANCI KİRACI STOĞU DEĞİŞTİ ${k2Once} -> ${k2Sonra}`)

    const yok = await olarak(db, 'authenticated', a1, cagri(URUN.yok))
    if (!yetkisiz(yok)) h.push(`(C) adjust_stock ${ad}: olmayan ürün 'not authorized' vermedi (var olma sızıntısı)`)

    const servis = await olarak(db, 'service_role', JWT_SERVICE, cagri(URUN.k2))
    if (!servis.ok) h.push(`(C) adjust_stock ${ad}: service_role başka kiracı ürününde reddedildi (${servis.mesaj}) — muafiyet çalışmıyor`)

    const rolsuz = await olarak(db, 'authenticated', jwt(U.user1, K1), cagri(URUN.k1))
    if (!yetkisiz(rolsuz)) h.push(`(C) adjust_stock ${ad}: rol kapısı (role=user) reddetmedi — rol kapısı DEĞİŞMEMELİYDİ`)
    const mod = await olarak(db, 'authenticated', jwt(U.moderator1, K1), cagri(URUN.k1))
    if (!mod.ok) h.push(`(C) adjust_stock ${ad}: moderator reddedildi — adjust_stock rol kapısı AYNEN kalmalıydı (${mod.mesaj})`)
  }
  const hareketler = (await db.query<{ tenant_id: string; n: number }>(
    `select tenant_id, count(*)::int as n from public.inventory_movements where reason = 'adjust' and product_id = '${URUN.k2}' group by tenant_id`,
  )).rows
  if (hareketler.some((r) => r.tenant_id !== K2)) h.push(`(C) adjust_stock: hareket satırı ürünün kiracısını (${K2}) taşımıyor: ${JSON.stringify(hareketler)}`)
  if (hareketler.length === 0) h.push('(C) adjust_stock: service_role çağrısı hareket yazmadı (ölçüm kör)')
  const k1Hareket = (await db.query<{ tenant_id: string }>(
    `select distinct tenant_id from public.inventory_movements where reason = 'adjust' and product_id = '${URUN.k1}'`,
  )).rows
  if (k1Hareket.length !== 1 || k1Hareket[0].tenant_id !== K1) h.push(`(C) adjust_stock: K1 ürününün hareketi K1 taşımıyor: ${JSON.stringify(k1Hareket)}`)

  // ── admin_list_all_users / admin_list_users ─────────────────────────────────────────────────────
  const idler = (s: Sonuc): string => (s.ok ? s.rows.map((r) => String(r.id)).sort().join(',') : `HATA:${s.mesaj}`)
  const sirala = (...x: string[]): string => [...x].sort().join(',')
  const tum1 = await olarak(db, 'authenticated', a1, 'select id from public.admin_list_all_users()')
  if (idler(tum1) !== sirala(U.admin1, U.moderator1, U.user1)) {
    h.push(`(C) admin_list_all_users K1 yöneticisi: [${idler(tum1)}] — beklenen YALNIZ K1 profilleri (profilsiz auth.users satırı ve K2 satırları YOK)`)
  }
  const tum2 = await olarak(db, 'authenticated', jwt(U.admin2, K2), 'select id from public.admin_list_all_users()')
  if (idler(tum2) !== sirala(U.admin2, U.user2)) h.push(`(C) admin_list_all_users K2 yöneticisi: [${idler(tum2)}] — beklenen YALNIZ K2 profilleri`)
  for (const [ad, claims] of [
    ['moderator', jwt(U.moderator1, K1)],
    ['role=user', jwt(U.user1, K1)],
  ] as const) {
    const s = await olarak(db, 'authenticated', claims, 'select id from public.admin_list_all_users()')
    if (!yetkisiz(s)) h.push(`(C) admin_list_all_users ${ad}: çağırabildi (rol kapısı)`)
    const l = await olarak(db, 'authenticated', claims, 'select id from public.admin_list_users()')
    if (!yetkisiz(l)) h.push(`(C) admin_list_users ${ad}: çağırabildi (rol kapısı)`)
  }
  const per1 = await olarak(db, 'authenticated', a1, 'select id from public.admin_list_users()')
  if (idler(per1) !== sirala(U.admin1, U.moderator1)) h.push(`(C) admin_list_users K1 yöneticisi: [${idler(per1)}] — beklenen K1 personeli (admin + moderator hesabı)`)
  const per2 = await olarak(db, 'authenticated', jwt(U.admin2, K2), 'select id from public.admin_list_users()')
  if (idler(per2) !== U.admin2) h.push(`(C) admin_list_users K2 yöneticisi: [${idler(per2)}] — beklenen YALNIZ K2 personeli`)

  // ── process_order_stock_restore ────────────────────────────────────────────────────────────────
  const gec = (id: string): string => `select public.process_order_stock_restore('${id}', 'order_cancel') as v`
  const geriStok = async (u: string): Promise<number> => Number(await skaler(db, `select stock_qty as v from public.products where id = '${u}'`))
  const k2StokOnce = await geriStok(URUN.geriK2)
  const yabSip = await olarak(db, 'authenticated', a1, gec(SIPARIS.k2))
  if (!yetkisiz(yabSip)) h.push('(C) process_order_stock_restore: YABANCI KİRACI SİPARİŞİ reddedilmedi')
  if ((await geriStok(URUN.geriK2)) !== k2StokOnce) h.push('(C) process_order_stock_restore: YABANCI KİRACI STOĞU DEĞİŞTİ')
  const yokSip = await olarak(db, 'authenticated', a1, gec(SIPARIS.yok))
  if (!yetkisiz(yokSip)) h.push("(C) process_order_stock_restore: olmayan sipariş 'not authorized' vermedi (var olma sızıntısı)")
  const k1StokOnce = await geriStok(URUN.geriK1)
  const kendiSip = await olarak(db, 'authenticated', a1, gec(SIPARIS.k1))
  const kendiZarf = kendiSip.ok ? (kendiSip.rows[0]?.v as { success?: boolean; restored_units?: number; skipped?: number } | undefined) : undefined
  if (!kendiSip.ok || kendiZarf?.success !== true || kendiZarf?.restored_units !== 3 || kendiZarf?.skipped !== 0) {
    h.push(`(C) process_order_stock_restore: KENDİ kiracı siparişi beklenen zarfı vermedi: ${JSON.stringify(kendiSip.ok ? kendiSip.rows : kendiSip.mesaj)}`)
  }
  if ((await geriStok(URUN.geriK1)) !== k1StokOnce + 3) h.push('(C) process_order_stock_restore: kendi kiracı stoğu +3 artmadı')
  const tekrar = await olarak(db, 'authenticated', a1, gec(SIPARIS.k1))
  const tekrarZarf = tekrar.ok ? (tekrar.rows[0]?.v as { restored_count?: number } | undefined) : undefined
  if (!tekrar.ok || tekrarZarf?.restored_count !== 0) h.push('(C) process_order_stock_restore: ikinci çağrı no-op değil (idempotens bozuldu)')
  const servisSip = await olarak(db, 'service_role', JWT_SERVICE, gec(SIPARIS.k2))
  const servisZarf = servisSip.ok ? (servisSip.rows[0]?.v as { success?: boolean; restored_units?: number } | undefined) : undefined
  if (!servisSip.ok || servisZarf?.success !== true || servisZarf?.restored_units !== 4) {
    h.push(`(C) process_order_stock_restore: service_role başka kiracı siparişinde çalışmadı: ${JSON.stringify(servisSip.ok ? servisSip.rows : servisSip.mesaj)}`)
  }
  const servisYok = await olarak(db, 'service_role', JWT_SERVICE, gec(SIPARIS.yok))
  const yokZarf = servisYok.ok ? (servisYok.rows[0]?.v as { success?: boolean; error?: string } | undefined) : undefined
  if (!servisYok.ok || yokZarf?.success !== false || yokZarf?.error !== 'Order not found') {
    h.push('(C) process_order_stock_restore: service_role olmayan siparişte eski "Order not found" zarfını vermedi (edge yolu DEĞİŞMEMELİYDİ)')
  }
  const geriHareket = (await db.query<{ tenant_id: string }>(
    `select distinct tenant_id from public.inventory_movements where reason = 'order_cancel' and order_id = '${SIPARIS.k2}'`,
  )).rows
  if (geriHareket.length !== 1 || geriHareket[0].tenant_id !== K2) h.push(`(C) process_order_stock_restore: geri-verme hareketi siparişin kiracısını taşımıyor: ${JSON.stringify(geriHareket)}`)

  // Atlanan ürün (K1 siparişinin kaleminde K2 ürünü + yanında sağlam K1 ürünü): sessiz başarı YOK.
  const anSaglamOnce = await geriStok(URUN.anomaliSaglam)
  const anYabOnce = await geriStok(URUN.anomaliYabanci)
  const anTarayici = await olarak(db, 'authenticated', a1, gec(SIPARIS.anomali))
  if (anTarayici.ok || !/skipped/.test(anTarayici.mesaj)) {
    h.push(`(C) process_order_stock_restore: ATLANAN ÜRÜN tarayıcı oturumunda RAISE etmedi (sessiz başarı): ${JSON.stringify(anTarayici.ok ? anTarayici.rows : anTarayici.mesaj)}`)
  }
  if ((await geriStok(URUN.anomaliSaglam)) !== anSaglamOnce) h.push('(C) process_order_stock_restore: RAISE sonrası KISMİ geri-verme kaldı (işlem geri alınmadı)')
  const anHareket = Number(
    await skaler(db, `select count(*)::int as v from public.inventory_movements where reason = 'order_cancel' and order_id = '${SIPARIS.anomali}'`),
  )
  if (anHareket !== 0) h.push(`(C) process_order_stock_restore: RAISE sonrası ${anHareket} geri-verme hareketi kaldı`)
  const anServis = await olarak(db, 'service_role', JWT_SERVICE, gec(SIPARIS.anomali))
  const anZarf = anServis.ok
    ? (anServis.rows[0]?.v as { success?: boolean; skipped?: number; restored_count?: number; restored_units?: number; error?: string } | undefined)
    : undefined
  if (!anServis.ok || anZarf?.success !== false || anZarf?.skipped !== 1 || anZarf?.restored_count !== 1 || anZarf?.restored_units !== 1) {
    h.push(`(C) process_order_stock_restore: service_role atlanan ürün için success:false / skipped:1 / restored_count:1 zarfı vermedi (iade akışı bunu hata görmeli): ${JSON.stringify(anServis.ok ? anServis.rows : anServis.mesaj)}`)
  }
  if ((await geriStok(URUN.anomaliYabanci)) !== anYabOnce) h.push('(C) process_order_stock_restore: YABANCI KİRACI ürününün stoğu değişti')
  if ((await geriStok(URUN.anomaliSaglam)) !== anSaglamOnce + 1) h.push('(C) process_order_stock_restore: sağlam kalemin stoğu service_role çağrısında +1 artmadı')

  // ── set_user_admin_role ────────────────────────────────────────────────────────────────────────
  const rolYaz = (u: string, r: string): string => `select public.set_user_admin_role('${u}'::uuid, '${r}') as v`
  const kendiRol = await olarak(db, 'authenticated', a1, rolYaz(U.user1, 'warehouse'))
  if (!kendiRol.ok || kendiRol.rows[0]?.v !== true) h.push(`(C) set_user_admin_role: KENDİ kiracı kullanıcısı reddedildi (${kendiRol.ok ? 'false' : kendiRol.mesaj})`)
  if ((await skaler(db, `select role as v from public.user_profiles where id = '${U.user1}'`)) !== 'warehouse') h.push('(C) set_user_admin_role: kendi kiracı rolü yazılmadı')
  const yabRol = await olarak(db, 'authenticated', a1, rolYaz(U.user2, 'warehouse'))
  if (!yetkisiz(yabRol)) h.push('(C) set_user_admin_role: YABANCI KİRACI KULLANICISI reddedilmedi')
  if ((await skaler(db, `select role as v from public.user_profiles where id = '${U.user2}'`)) !== 'user') h.push('(C) set_user_admin_role: YABANCI KİRACI ROLÜ DEĞİŞTİ')
  const profilsiz = await olarak(db, 'authenticated', a1, rolYaz(U.profilsiz, 'viewer'))
  if (!yetkisiz(profilsiz)) h.push('(C) set_user_admin_role: PROFİLİ OLMAYAN kullanıcı için tarayıcı oturumu reddedilmedi (çağıranın kiracısında profil yaratıldı)')
  if (Number(await skaler(db, `select count(*)::int as v from public.user_profiles where id = '${U.profilsiz}'`)) !== 0) {
    h.push('(C) set_user_admin_role: reddedilen çağrı yine de PROFİL YARATTI')
  }
  const servisProfil = await olarak(db, 'service_role', JWT_SERVICE, rolYaz(U.profilsiz, 'viewer'))
  if (!servisProfil.ok) h.push(`(C) set_user_admin_role: service_role profilsiz kullanıcı için profil yaratamadı (${servisProfil.mesaj})`)
  if ((await skaler(db, `select tenant_id as v from public.user_profiles where id = '${U.profilsiz}'`)) !== K1) h.push('(C) set_user_admin_role: service_role yeni profili jwt_tenant_id() kiracısına yazmadı')
  const servisRol = await olarak(db, 'service_role', JWT_SERVICE, rolYaz(U.user2, 'sales'))
  if (!servisRol.ok) h.push(`(C) set_user_admin_role: service_role başka kiracı kullanıcısında reddedildi (${servisRol.mesaj})`)
  if ((await skaler(db, `select tenant_id as v from public.user_profiles where id = '${U.user2}'`)) !== K2) h.push('(C) set_user_admin_role: service_role güncellemesi kullanıcının kiracısını değiştirdi')
  const gecersiz = await olarak(db, 'authenticated', a1, rolYaz(U.user1, 'tanrisal'))
  if (gecersiz.ok || !/Invalid role/.test(gecersiz.mesaj)) h.push('(C) set_user_admin_role: geçersiz rol "Invalid role" vermedi (rol doğrulaması DEĞİŞMEMELİYDİ)')

  // ── url_takma_adlari_listele ───────────────────────────────────────────────────────────────────
  const liste = `select * from public.${URL_TAKMA}()`
  // ACL'e DOKUNULMADI: anon AÇIK kalır (scripts/onizleme.mjs anon anahtarla çağırır). Üç rol da çağırabilmeli.
  for (const [ad, rol, claims] of [
    ['anon', 'anon', '{"role":"anon"}'],
    ['authenticated', 'authenticated', jwt(U.admin1, K1)],
    ['service_role', 'service_role', JWT_SERVICE],
  ] as const) {
    const s = await olarak(db, rol, claims, liste)
    if (!s.ok) h.push(`(C) ${URL_TAKMA}: ${ad} KAPANMIŞ (${s.mesaj})`)
  }
  for (const [rol, beklenen] of [['anon', true], ['authenticated', true], ['service_role', true]] as const) {
    const v = await skaler(db, `select has_function_privilege('${rol}', 'public.${URL_TAKMA}()', 'EXECUTE') as v`)
    if (v !== beklenen) h.push(`(C) ${URL_TAKMA}: has_function_privilege(${rol}) = ${String(v)} (beklenen ${String(beklenen)})`)
  }
  return h
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// TESTLER
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/** `ad` fonksiyonunun HAM migration metnindeki n'inci `CREATE OR REPLACE FUNCTION ... $$;` bloğunu `donustur` ile değiştirir. */
function bloktaDegistir(sql: string, ad: string, donustur: (blok: string) => string, kacinci = 0): string {
  const re = new RegExp(`CREATE OR REPLACE FUNCTION "public"\\."${ad}"\\([\\s\\S]*?\\n\\$\\$;`, 'g')
  const bloklar = [...sql.matchAll(re)]
  const b = bloklar[kacinci]
  if (!b || b.index === undefined) throw new Error(`${ad} bloğu (${kacinci}) bulunamadı`)
  const yeni = donustur(b[0])
  if (yeni === b[0]) throw new Error(`${ad} bozma metni DEĞİŞTİRMEDİ — mutasyon etkisiz, test hiçbir şey ölçmüyor`)
  return sql.slice(0, b.index) + yeni + sql.slice(b.index + b[0].length)
}

/** Zincirde ALT-136 dosyasını bozulmuş metinle değiştirilmiş kopya. */
const zincirdeMig = (yeniSql: string): Mig[] => zincir.map((m) => (m.ad === MIG_DOSYA?.ad ? { ad: m.ad, sql: yeniSql } : m))

describe('INV-ALT136-1 · DEFINER fonksiyonlarına kiracı kapısı (url_takma_adlari_listele anon AÇIK kalır)', () => {
  it('BOŞLUK MUHAFIZI — migration, rollback, ALT-145, taban ve altı tanım gerçekten okunuyor', () => {
    expect(migAdaylar.length, 'ALT-136 migration dosyası tam bir tane olmalı').toBe(1)
    expect(geriAdaylar.length, 'ALT-136 rollback dosyası tam bir tane olmalı').toBe(1)
    expect(alt145Adaylar.length, 'ALT-145 migration dosyası (admin_list_all_users #2243 sürümü) zincirde olmalı').toBe(1)
    expect(zincir.length, 'migration zinciri okunamadı').toBeGreaterThan(50)
    expect(TABAN.length, 'taban okunamadı').toBeGreaterThan(100_000)
    for (const e of ETIKETLER) {
      expect(bul(MIG, e), `migration'da ${e} tanımı yok`).not.toBeNull()
      expect(kaynak(e), `${e} için kaynak (taban / #2243) tanımı yok — okuyucu kör`).not.toBeNull()
    }
    // Taban kendi başına temiz sayılmaz: süzgeçsiz hâlinin KIRMIZI olduğu (okuyucu vakumda yeşil vermiyor) kanıtlanır.
    expect(kiraciIhlalleri(TABAN).length, 'taban süzgeçsizdir; kiracı denetimi tabanda KIRMIZI olmalı').toBeGreaterThan(0)
  })

  it('damga 14 haneli ve ALT-145 (20261104100000) migration\'ından SONRA', () => {
    expect(MIG_DOSYA).not.toBeNull()
    expect(siraIhlalleri(MIG_DOSYA?.ad ?? '', alt145Adaylar[0]?.ad ?? '')).toEqual([])
  })

  it('⭐A+B · migration sözleşmeyi sağlıyor (zaman sınırı, başlık, kiracı kapısı, rol listeleri, gövde sadakati)', () => {
    expect(hepsi(MIG)).toEqual([])
  })

  it('⭐url_takma_adlari_listele: zincirin son hâlinde anon, authenticated ve service_role AÇIK, PUBLIC KAPALI (anon: scripts/onizleme.mjs çağırır)', () => {
    expect(anonAcikIhlalleri(zincir)).toEqual([])
  })

  it('⭐anon açık kalma SEBEBİ hâlâ geçerli: scripts/onizleme.mjs anon anahtarı harita üretecine SERVICE_ROLE adıyla veriyor', () => {
    expect(onizlemeSebebiIhlalleri(ONIZLEME_KODU)).toEqual([])
  })

  it("⭐geri alma dosyası: gövdeler kaynağa döner, işlem sınırları var, url_takma_adlari_listele ACL'ine dokunmaz", () => {
    expect(geriIhlalleri(GERI)).toEqual([])
  })

  it('moderator ÇAĞIRAN kapısında yok; satır öznesi (WHERE) listesi bilerek değişmedi (moderator hesapları personel listesinde kalır)', () => {
    expect(rolIhlalleri(MIG)).toEqual([])
    const f = bul(MIG, 'admin_list_users')
    expect(f?.govde).toMatch(/where up\.role in \('admin','moderator','super_admin'\) and up\.tenant_id/)
  })

  describe('D · AYIRT EDİCİLİK — statik kol her bozmada KIRMIZI (vakumda yeşil yok)', () => {
    it('taban (bozulmamış kopya) temiz — vakaların anlamlı olması için ön koşul', () => {
      expect(hepsi(MIG)).toEqual([])
      expect(anonAcikIhlalleri(zincir)).toEqual([])
      expect(onizlemeSebebiIhlalleri(ONIZLEME_KODU)).toEqual([])
    })

    const SUZGEC_ETIKET: Array<[Etiket, string, number]> = [
      ['adjust_stock/3', 'adjust_stock', 0],
      ['adjust_stock/4', 'adjust_stock', 1],
      ['admin_list_all_users', 'admin_list_all_users', 0],
      ['admin_list_users', 'admin_list_users', 0],
      ['process_order_stock_restore', 'process_order_stock_restore', 0],
      ['set_user_admin_role', 'set_user_admin_role', 0],
    ]
    it.each(SUZGEC_ETIKET)('%s: jwt_tenant_id() süzgeci silinince KIRMIZI', (etiket, ad, n) => {
      const bozuk = bloktaDegistir(MIG, ad, (b) => b.replace(/public\.jwt_tenant_id\(\)/g, 'null::uuid'), n)
      const hatalar = hepsi(bozuk).join('\n')
      expect(hatalar).toContain(etiket)
    })

    it.each([
      ['adjust_stock/3', 'adjust_stock', 0],
      ['adjust_stock/4', 'adjust_stock', 1],
      ['process_order_stock_restore', 'process_order_stock_restore', 0],
      ['set_user_admin_role', 'set_user_admin_role', 0],
    ] as Array<[Etiket, string, number]>)('%s: service_role muafiyeti kalkınca (edge yolu kırılırdı) KIRMIZI', (etiket, ad, n) => {
      const bozuk = bloktaDegistir(MIG, ad, (b) => b.replace(/COALESCE\(auth\.role\(\), ''\) <> 'service_role'/gi, 'true'), n)
      expect(hepsi(bozuk).join('\n')).toContain(etiket)
    })

    it('adjust_stock: hareket satırı kiracıyı üründen almazsa KIRMIZI', () => {
      const bozuk = bloktaDegistir(
        MIG,
        'adjust_stock',
        (b) => b.replace(/, tenant_id\)/, ')').replace(/, v_tenant\);/, ');'),
        0,
      )
      expect(hepsi(bozuk).join('\n')).toContain('adjust_stock/3: hareket satırında tenant_id = v_tenant')
    })

    it('process_order_stock_restore: ürün güncellemesindeki kiracı süzgeci silinirse KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'process_order_stock_restore', (b) => b.replace(/\n\s+and tenant_id = v_order_tenant/, ''))
      expect(hepsi(bozuk).join('\n')).toContain('process_order_stock_restore: ürün güncellemesinde tenant_id = v_order_tenant')
    })

    it('set_user_admin_role: DO UPDATE ... WHERE yarış kapısı silinirse KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'set_user_admin_role', (b) =>
        b.replace(/\n\s+where coalesce\(auth\.role\(\), ''\) = 'service_role' or up\.tenant_id = public\.jwt_tenant_id\(\);/, ';'),
      )
      expect(hepsi(bozuk).join('\n')).toContain('set_user_admin_role: upsert yeni satırda tenant_id')
    })

    it('admin_list_all_users: çağıran kapısına moderator eklenince KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'admin_list_all_users', (b) => b.replace("up.role IN ('admin','super_admin')", "up.role IN ('admin','moderator','super_admin')"))
      expect(rolIhlalleri(bozuk).join('\n')).toContain('admin_list_all_users: çağıran kapısında moderator')
      expect(hepsi(bozuk).join('\n')).toContain('admin_list_all_users')
    })

    it('admin_list_users: çağıran kapısına moderator geri eklenince KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'admin_list_users', (b) => b.replace("AND up.role IN ('admin','super_admin')", "AND up.role IN ('admin','moderator','super_admin')"))
      expect(rolIhlalleri(bozuk).join('\n')).toContain('admin_list_users: çağıran kapısında moderator')
    })

    it('admin_list_all_users: gövdeye moderator başka yoldan girerse KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'admin_list_all_users', (b) => b.replace("up.role IN ('admin','super_admin')", "up.role IN ('admin','super_admin') OR up.role = 'moderator'"))
      expect(rolIhlalleri(bozuk).join('\n')).toMatch(/admin_list_all_users: (çağıran kapısı beklenenden|gövdede moderator)/)
    })

    it('url_takma_adlari_listele: migration anon REVOKE eklerse KIRMIZI (ön izleme ADRES kipi bozulurdu)', () => {
      const bozuk = MIG.replace(/\ncommit;\n/, `\nrevoke execute on function public.${URL_TAKMA}() from anon;\ncommit;\n`)
      expect(bozuk).not.toBe(MIG)
      expect(anonAcikIhlalleri(zincirdeMig(bozuk)).join('\n')).toContain('anon: KAPANMIŞ — scripts/onizleme.mjs')
      expect(hepsi(bozuk).join('\n')).toContain(`migration ${URL_TAKMA}'e dokunuyor`)
    })

    it('url_takma_adlari_listele: anon REVOKE zincirin sonunda gelirse KIRMIZI', () => {
      const sonuna = [...zincir, { ad: 'zz_anon_kapat.sql', sql: `revoke execute on function public.${URL_TAKMA}() from anon;` }]
      expect(anonAcikIhlalleri(sonuna).join('\n')).toContain('anon: KAPANMIŞ — scripts/onizleme.mjs')
    })

    it('url_takma_adlari_listele: PUBLIC grant zincirin sonunda gelirse KIRMIZI', () => {
      const sonuna = [...zincir, { ad: 'zz_public.sql', sql: `grant execute on function public.${URL_TAKMA}() to public;` }]
      expect(anonAcikIhlalleri(sonuna).join('\n')).toContain('public: zincirin son olayı revoke değil')
    })

    it('url_takma_adlari_listele: authenticated kapatılırsa KIRMIZI (eski adres haritası üretilemez)', () => {
      const sonuna = [...zincir, { ad: 'zz_auth_kapat.sql', sql: `revoke execute on function public.${URL_TAKMA}() from authenticated;` }]
      expect(anonAcikIhlalleri(sonuna).join('\n')).toContain('authenticated: KAPANMIŞ')
    })

    it('anon sebebi pini: onizleme.mjs anon anahtarı artık vermiyorsa KIRMIZI (REVOKE yeniden değerlendirilsin)', () => {
      const duzeltilmis = (ONIZLEME_KODU ?? '').replace(/SUPABASE_SERVICE_ROLE_KEY:\s*anonAnahtar/, 'SUPABASE_SERVICE_ROLE_KEY: sunucuAnahtari')
      expect(duzeltilmis).not.toBe(ONIZLEME_KODU)
      expect(onizlemeSebebiIhlalleri(duzeltilmis).join('\n')).toContain('REVOKE yeniden değerlendirilebilir')
      expect(onizlemeSebebiIhlalleri(null).join('\n')).toContain('scripts/onizleme.mjs yok')
    })

    it('set_user_admin_role: profil YOKSA RAISE kapısı gevşetilirse (found and ...) KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'set_user_admin_role', (b) => b.replace('if not found or v_hedef_tenant', 'if found and v_hedef_tenant'))
      expect(hepsi(bozuk).join('\n')).toContain('set_user_admin_role: hedef profilin kiracı kapısı: profil YOKSA da RAISE')
    })

    it('process_order_stock_restore: atlanan ürün kapısı (skipped > 0) silinirse KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'process_order_stock_restore', (b) => b.replace('if v_skipped > 0 then', 'if false then'))
      expect(hepsi(bozuk).join('\n')).toContain('process_order_stock_restore: atlanan ürün kapısı')
    })

    it('process_order_stock_restore: başarı zarfından skipped alanı silinirse KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'process_order_stock_restore', (b) => {
        const ek = "    'skipped', v_skipped,\n"
        const i = b.lastIndexOf(ek)
        return i < 0 ? b : b.slice(0, i) + b.slice(i + ek.length)
      })
      expect(hepsi(bozuk).join('\n')).toContain('process_order_stock_restore: atlanan ürün kapısı')
    })

    it('process_order_stock_restore: atlanan ürün yine sessiz geçerse (continue when not found) KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'process_order_stock_restore', (b) =>
        b.replace(/if not found then\s+v_skipped := v_skipped \+ 1;\s+continue;\s+end if;/, 'continue when not found;'),
      )
      expect(hepsi(bozuk).join('\n')).toContain('process_order_stock_restore: ürün güncellemesinde tenant_id = v_order_tenant + atlanan ürünün sayılması')
    })

    it('gövde sadakati: rol kapısı sessizce gevşetilirse (adjust_stock\'a viewer) KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'adjust_stock', (b) => b.replace("'warehouse', 'moderator'", "'warehouse', 'viewer', 'moderator'"))
      expect(sadakatIhlalleri(bozuk).join('\n')).toContain('adjust_stock/3: gövde kaynak + DEGISIM çiftlerinden ayrışıyor')
    })

    it('gövde sadakati: sipariş durum mantığına (restore\'a status yazımı) dokunulursa KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'process_order_stock_restore', (b) => b.replace('v_restored_count := v_restored_count + 1;', "v_restored_count := v_restored_count + 1;\n    update public.venthub_orders set status = 'cancelled' where id = v_order_uuid;"))
      expect(sadakatIhlalleri(bozuk).join('\n')).toContain('process_order_stock_restore: gövde kaynak + DEGISIM çiftlerinden ayrışıyor')
    })

    it('başlık: SECURITY DEFINER SECURITY INVOKER yapılırsa KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'set_user_admin_role', (b) => b.replace('SECURITY DEFINER', 'SECURITY INVOKER'))
      expect(baslikIhlalleri(bozuk).join('\n')).toContain('set_user_admin_role: başlık')
    })

    it('başlık: search_path gevşetilirse KIRMIZI', () => {
      const bozuk = bloktaDegistir(MIG, 'admin_list_users', (b) => b.replace(`SET "search_path" TO 'public', 'pg_temp'`, `SET "search_path" TO 'public'`))
      expect(baslikIhlalleri(bozuk).join('\n')).toContain('admin_list_users: başlık')
    })

    it('zaman sınırları: lock_timeout silinirse KIRMIZI', () => {
      const bozuk = MIG.replace("set lock_timeout = '1s';", '')
      expect(bozuk).not.toBe(MIG)
      expect(zamanSiniriIhlalleri(bozuk).join('\n')).toContain('lock_timeout')
    })

    it("geri alma: url_takma_adlari_listele ACL'ine dokunursa KIRMIZI (migration dokunmadı)", () => {
      const bozuk = GERI.replace(/\ncommit;\n/, `\ngrant execute on function public.${URL_TAKMA}() to anon;\ncommit;\n`)
      expect(bozuk).not.toBe(GERI)
      expect(geriIhlalleri(bozuk).join('\n')).toContain("ACL'ine dokunuyor")
    })

    it('geri alma: bir gövde kaynağa dönmezse KIRMIZI', () => {
      const bozuk = GERI.replace(/COALESCE\(stock_qty, 0\) \+ p_delta/, 'COALESCE(stock_qty, 0) + p_delta + 1')
      expect(bozuk).not.toBe(GERI)
      expect(geriIhlalleri(bozuk).join('\n')).toContain('rollback gövdesi kaynağa dönmüyor')
    })
  })

  describe('C · DAVRANIŞ — migration\'ın kendi SQL\'i PGlite\'ta iki kiracılı veride koşar', () => {
    let Pglite: PgliteKurucu | null = null
    let db: PgliteDb | null = null
    /**
     * Kurulum hatası YUTULMAZ ve beforeAll'dan FIRLATILMAZ: vitest, fırlatılan beforeAll'da bütün testleri "skipped"
     * gösterir (atlanmış = yeşil gibi görünür). Hata burada tutulur, aşağıdaki testler açıkça KIRMIZI verir.
     */
    let kurulumHatasi: string | null = null

    beforeAll(async () => {
      Pglite = await pgliteYukle()
      if (!Pglite) return
      try {
        db = await kurDb(Pglite, MIG)
      } catch (e) {
        kurulumHatasi = String((e as { message?: string }).message ?? e)
      }
    }, 90_000)

    afterAll(async () => {
      await db?.close().catch(() => undefined)
    })

    /** PGlite YOKSA test atlanır (görünür "skipped"); PGlite VARSA ama migration uygulanamadıysa KIRMIZI. */
    const hazirDb = (ctx: { skip: () => never }): PgliteDb | null => {
      if (!Pglite) return ctx.skip()
      expect(kurulumHatasi, 'migration PGlite\'ta UYGULANAMADI (sözdizimi ya da yetki) — davranış ölçülemedi').toBeNull()
      expect(db, 'PGlite veritabanı kurulamadı').not.toBeNull()
      return db
    }

    it('PGlite kolu KOŞTU (PGLITE_ZORUNLU=1 iken yokluk KIRMIZIDIR; atlanmış kol yeşil değildir)', () => {
      if (process.env.PGLITE_ZORUNLU === '1') {
        expect(Pglite, 'PGlite yüklenemedi (PGLITE_GIRIS) — davranış kolu ÖLÇÜLEMEDİ').not.toBeNull()
      }
    })

    it('⭐migration iki kiracılı veride hatasız uygulanır', (ctx) => {
      expect(hazirDb(ctx)).not.toBeNull()
    })

    it('⭐yabancı kiracıya erişim reddedilir, service_role muaf, kendi kiracı çalışır, moderator kapıda, atlanan ürün sessiz geçmez, anon AÇIK', async (ctx) => {
      const d = hazirDb(ctx)
      expect(d).not.toBeNull()
      if (d) expect(await davranisHatalari(d)).toEqual([])
    })

    describe('D · AYIRT EDİCİLİK (davranış) — süzgeci sökülmüş migration davranışta KIRMIZI', () => {
      it('adjust_stock: kiracı koşulu v_tenant ile değiştirilirse (hiç reddetmez) yabancı ürün stoğu DEĞİŞİR → KIRMIZI', async (ctx) => {
        if (!Pglite) return ctx.skip()
        const bozuk = MIG.replace(/v_tenant IS DISTINCT FROM public\.jwt_tenant_id\(\)/g, 'v_tenant IS DISTINCT FROM v_tenant')
        expect(bozuk).not.toBe(MIG)
        const d = await kurDb(Pglite, bozuk)
        try {
          expect((await davranisHatalari(d)).join('\n')).toContain('YABANCI KİRACI')
        } finally {
          await d.close().catch(() => undefined)
        }
      }, 90_000)

      it('admin_list_all_users: kiracı süzgeci silinirse başka kiracının e-postası döner → KIRMIZI', async (ctx) => {
        if (!Pglite) return ctx.skip()
        const bozuk = bloktaDegistir(MIG, 'admin_list_all_users', (b) => b.replace(/\n\s+WHERE up\.tenant_id = public\.jwt_tenant_id\(\)/, ''))
        const d = await kurDb(Pglite, bozuk)
        try {
          expect((await davranisHatalari(d)).join('\n')).toContain('admin_list_all_users K1 yöneticisi')
        } finally {
          await d.close().catch(() => undefined)
        }
      }, 90_000)

      it('url_takma_adlari_listele: migration anon REVOKE ederse anon çağıramaz → KIRMIZI', async (ctx) => {
        if (!Pglite) return ctx.skip()
        const bozuk = MIG.replace(/\ncommit;\n/, `\nrevoke execute on function public.${URL_TAKMA}() from anon;\ncommit;\n`)
        expect(bozuk).not.toBe(MIG)
        const d = await kurDb(Pglite, bozuk)
        try {
          expect((await davranisHatalari(d)).join('\n')).toContain('anon KAPANMIŞ')
        } finally {
          await d.close().catch(() => undefined)
        }
      }, 90_000)

      it('process_order_stock_restore: atlanan ürün kapısı silinirse sessiz başarı döner → KIRMIZI', async (ctx) => {
        if (!Pglite) return ctx.skip()
        const bozuk = bloktaDegistir(MIG, 'process_order_stock_restore', (b) => b.replace('if v_skipped > 0 then', 'if false then'))
        const d = await kurDb(Pglite, bozuk)
        try {
          expect((await davranisHatalari(d)).join('\n')).toContain('ATLANAN ÜRÜN tarayıcı oturumunda RAISE etmedi')
        } finally {
          await d.close().catch(() => undefined)
        }
      }, 90_000)

      it('set_user_admin_role: profil-yok kapısı gevşetilirse çağıranın kiracısında profil yaratılır → KIRMIZI', async (ctx) => {
        if (!Pglite) return ctx.skip()
        const bozuk = bloktaDegistir(MIG, 'set_user_admin_role', (b) => b.replace('if not found or v_hedef_tenant', 'if found and v_hedef_tenant'))
        const d = await kurDb(Pglite, bozuk)
        try {
          expect((await davranisHatalari(d)).join('\n')).toContain('PROFİLİ OLMAYAN kullanıcı için tarayıcı oturumu reddedilmedi')
        } finally {
          await d.close().catch(() => undefined)
        }
      }, 90_000)
    })
  })
})
