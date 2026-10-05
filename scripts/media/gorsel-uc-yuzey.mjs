/**
 * INV-IMG-2 — ÜÇ YÜZEY SINAVI, saf parça (SQL üretimi + sonuç değerlendirmesi). CLI: gorsel-uc-yuzey-sinavi.mjs
 *
 * ── NE KANITLAR (product-image-standard §7)
 * `product_images`'a eklenen satır üç yüzeyde GÖRÜNÜR, görünmemesi gereken yerde GÖRÜNMEZ:
 *   A · keşif listesi   get_product_families_enriched → aile kapağı (anon)
 *   B · aile sayfası    get_family_detail → varyant görselleri, sort_order sırasıyla (anon)
 *   C · yönetim paneli  product_images doğrudan select (ProductsTableBody.attachCovers'ın sorgusu, authenticated)
 * Negatif kollar: taslak ürünün görseli vitrinde (A, B) YOK ama panelde (C) VAR; BAŞKA KİRACININ görsel satırı
 * hiçbir yüzeyde YOK. Kiracı satırının sort_order'ı bilerek en küçüktür: sızarsa KAPAK olur, gözden kaçmaz.
 *
 * ── NİÇİN GÖLGEDE ve NİÇİN ROLLBACK
 * Davranış sınavıdır, veritabanı ister; CI'da veritabanı yok (conformance'a konmaz). Her koşum tek işlemdir ve
 * ROLLBACK ile biter: gölgeye bile iz bırakmaz, tekrar koşulabilir. Webhook tetikleri (vault ister) YALNIZ bu
 * işlem içinde kapatılır; auth şeması kullanımı da yalnız işlem içinde verilir (ALTYAPI, 2026-09-24).
 *
 * ── SABOTAJ (kural: sınav kendi kırmızısını göstermeden yeşili kanıt sayılmaz)
 * Her sabotaj bir yüzeyi İŞLEM İÇİNDE bozar; sınav o koşumda KIRMIZI vermek zorundadır.
 */

export const T = 'd3b07384-d113-495f-a558-8c38634e0000'
export const T2 = '00000000-0000-4000-8000-0000000000b2'
const MARKA = '00000000-0000-4000-8000-00000000b001'
const AILE = '00000000-0000-4000-8000-00000000a001'
export const PA = '00000000-0000-4000-8000-00000000c00a'
export const PB = '00000000-0000-4000-8000-00000000c00b'
export const AILE_SLUG = 'img2-sinav-aile'

export const YOL = {
  kapak: `${T}/${PA}/0.webp`,
  ikinci: `${T}/${PA}/1.webp`,
  taslak: `${T}/${PB}/0.webp`,
  kiraci: `${T2}/${PA}/9.webp`,
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`

/** Fonksiyon gövdesinde tek metin değişikliği; değişmezse sabotaj BOŞTUR → işlem düşer (sessiz yeşil yok). */
const govdeBoz = (imza, eski, yeni) => `
do $s$ declare d text; y text; begin
  d := pg_get_functiondef(${q(imza)}::regprocedure);
  y := replace(d, ${q(eski)}, ${q(yeni)});
  if y = d then raise exception 'SABOTAJ_BOS: % icinde metin bulunamadi', ${q(imza)}; end if;
  execute y;
end $s$;`

export const SABOTAJLAR = {
  'aile-detay': {
    ne: 'aile sayfası varyant görsellerini göstermez',
    sql: govdeBoz('public.get_family_detail(text,text)', 'where pi.product_id = p.id', 'where pi.product_id = p.id and false'),
  },
  kapak: {
    ne: 'keşif listesi aile kapağını göstermez',
    sql: govdeBoz('public.get_product_families_enriched(uuid[],integer,integer,text,text)',
      'where pv.family_id = fam.id', 'where pv.family_id = fam.id and false'),
  },
  kiracisiz: {
    ne: 'görsel okuma politikası kiracı koşulunu kaybeder',
    sql: `drop policy product_images_select_all on public.product_images;
create policy product_images_select_all on public.product_images for select using (true);`,
  },
  'panel-yok': {
    ne: 'panel rolü görsel tablosunu okuyamaz',
    sql: 'revoke select on public.product_images from authenticated;',
  },
}

const ANON = `reset role; set local role anon; set local request.jwt.claims = '';`
const ADMIN = `reset role; set local role authenticated; set local request.jwt.claims = ${q(JSON.stringify({
  sub: '00000000-0000-4000-8000-00000000d001', role: 'authenticated', app_metadata: { tenant_id: T, role: 'admin' },
}))};`

/** Yüzey sondaları. Her satır `S|anahtar|değer` basar; başka çıktı yok sayılır. */
function sondalar(on) {
  return `
${ANON}
select 'S|${on}A_kapak|' || coalesce((select cover_image_path from public.get_product_families_enriched(null, 96, 0, null, null) where slug = ${q(AILE_SLUG)}), '∅');
select 'S|${on}A_aile|' || (select count(*) from public.get_product_families_enriched(null, 96, 0, null, null) where slug = ${q(AILE_SLUG)});
select 'S|${on}B_varyant|' || coalesce((select jsonb_agg(v->>'sku' order by v->>'sku') from jsonb_array_elements(public.get_family_detail(${q(AILE_SLUG)}, 'tr')->'variants') v)::text, '∅');
select 'S|${on}B_yollar|' || coalesce((select jsonb_agg(i->>'path') from jsonb_array_elements(public.get_family_detail(${q(AILE_SLUG)}, 'tr')->'variants') v, jsonb_array_elements(v->'images') i where v->>'sku' = 'IMG2-A')::text, '[]');
${ADMIN}
select 'S|${on}C_yollar|' || coalesce((select jsonb_agg(path order by path) from public.product_images where product_id in (${q(PA)}, ${q(PB)}))::text, '[]');
select 'S|${on}C_kapak|' || coalesce((select path from public.product_images where product_id = ${q(PA)} order by sort_order limit 1), '∅');
reset role;`
}

/**
 * @param {{ sabotaj?: string | null }} [secenek]
 * @returns {string} tek işlem: kurulum → kurulum sondası → görsel ekleme → (sabotaj) → sonda → ROLLBACK
 */
export function sinavSql({ sabotaj = null } = {}) {
  if (sabotaj && !SABOTAJLAR[sabotaj]) throw new Error(`bilinmeyen sabotaj: ${sabotaj}`)
  return `
begin;
-- Webhook tetikleri vault ister; YALNIZ bu işlemde kapalı (ROLLBACK geri açar).
do $w$ declare r record; begin
  for r in select c.relname, t.tgname from pg_trigger t join pg_class c on c.oid = t.tgrelid
            join pg_proc p on p.oid = t.tgfoid join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and p.proname = 'handle_supabase_webhook' and not t.tgisinternal
  loop execute format('alter table public.%I disable trigger %I', r.relname, r.tgname); end loop;
end $w$;
grant usage on schema auth to authenticated;

insert into public.tenants (id, name) values (${q(T)}, 'img2-sinav-t1') on conflict (id) do nothing;
insert into public.tenants (id, name) values (${q(T2)}, 'img2-sinav-t2') on conflict (id) do nothing;
insert into public.brands (id, tenant_id, name, slug) values (${q(MARKA)}, ${q(T)}, 'IMG2 Sınav Marka', 'img2-sinav-marka');
insert into public.product_families (id, tenant_id, name, slug, brand_id) values (${q(AILE)}, ${q(T)}, 'IMG2 Sınav Aile', ${q(AILE_SLUG)}, ${q(MARKA)});
insert into public.products (id, tenant_id, family_id, name, brand, sku, status) values
  (${q(PA)}, ${q(T)}, ${q(AILE)}, 'IMG2 Sınav Aktif', 'IMG2 Sınav Marka', 'IMG2-A', 'active'),
  (${q(PB)}, ${q(T)}, ${q(AILE)}, 'IMG2 Sınav Taslak', 'IMG2 Sınav Marka', 'IMG2-B', 'draft');
select 'S|K_kiraci|' || (select count(*) from public.tenants where id in (${q(T)}, ${q(T2)}));
select 'S|K_urun|' || (select count(*) from public.products where id in (${q(PA)}, ${q(PB)}));
${sondalar('once_')}

insert into public.product_images (tenant_id, product_id, path, alt, sort_order) values
  (${q(T)}, ${q(PA)}, ${q(YOL.kapak)}, 'IMG2 kapak', 0),
  (${q(T)}, ${q(PA)}, ${q(YOL.ikinci)}, 'IMG2 ikinci', 1),
  (${q(T)}, ${q(PB)}, ${q(YOL.taslak)}, 'IMG2 taslak', 0),
  (${q(T2)}, ${q(PA)}, ${q(YOL.kiraci)}, 'IMG2 baska kiraci', -1);
${sabotaj ? `-- SABOTAJ: ${sabotaj}\n${SABOTAJLAR[sabotaj].sql}` : ''}
${sondalar('')}
rollback;
`
}

/** psql çıktısından `S|anahtar|değer` satırlarını toplar. */
export function ayristir(cikti) {
  const s = {}
  for (const satir of String(cikti).split(/\r?\n/)) {
    const m = /^S\|([^|]+)\|(.*)$/.exec(satir)
    if (m) s[m[1]] = m[2]
  }
  return s
}

const js = (v) => { try { return JSON.parse(v) } catch { return undefined } }
/** Mesajda uzun kimlik yerine adı: "kiraci" görünürse sızıntı tek bakışta okunur. */
const adla = (v) => Object.entries(YOL).reduce((m, [ad, yol]) => m.split(yol).join(ad), String(v ?? '(yok)'))
const esit = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * @param {Record<string, string>} s ayristir() çıktısı
 * @returns {{ kurulum: string[], ihlal: string[] }} kurulum boş değilse sonuç OKUNMAZ (çıkış 2)
 */
export function degerlendir(s) {
  const kurulum = []
  const bekle = (liste, kosul, mesaj) => { if (!kosul) liste.push(mesaj) }

  // Ön koşul: veri kuruldu mu ve görselsiz hâl temiz mi — ayrı sorguyla (senaryo kurulumu doğrulanmadan sonuç okunmaz)
  bekle(kurulum, s.K_kiraci === '2', `iki kiracı kurulmadı (K_kiraci=${s.K_kiraci})`)
  bekle(kurulum, s.K_urun === '2', `iki ürün kurulmadı (K_urun=${s.K_urun})`)
  bekle(kurulum, s.once_A_aile === '1', `aile görselsizken keşif listesinde yok (once_A_aile=${s.once_A_aile}) — sonda yanlış yere bakıyor`)
  bekle(kurulum, s.once_A_kapak === '∅', `görsel eklenmeden kapak dolu (once_A_kapak=${s.once_A_kapak})`)
  bekle(kurulum, esit(js(s.once_B_varyant), ['IMG2-A']), `aile sayfası varyantları beklenmedik (once_B_varyant=${s.once_B_varyant})`)
  bekle(kurulum, s.once_B_yollar === '[]', `görsel eklenmeden aile sayfasında görsel var (${s.once_B_yollar})`)
  bekle(kurulum, s.once_C_yollar === '[]', `görsel eklenmeden panelde görsel var (${s.once_C_yollar})`)

  const ihlal = []
  bekle(ihlal, s.A_kapak === YOL.kapak, `A keşif kapağı ${adla(s.A_kapak)} — beklenen kapak`)
  bekle(ihlal, esit(js(s.B_yollar), [YOL.kapak, YOL.ikinci]), `B aile sayfası görselleri ${adla(s.B_yollar)} — beklenen [kapak, ikinci] bu sırayla`)
  bekle(ihlal, esit(js(s.B_varyant), ['IMG2-A']), `B taslak ürün vitrine çıktı (${s.B_varyant})`)
  bekle(ihlal, esit(js(s.C_yollar), [YOL.kapak, YOL.ikinci, YOL.taslak].sort()), `C panel görselleri ${adla(s.C_yollar)} — beklenen kapak + ikinci + taslak (başka kiracı YOK)`)
  bekle(ihlal, s.C_kapak === YOL.kapak, `C panel kapağı ${adla(s.C_kapak)} — beklenen kapak`)
  for (const [k, v] of Object.entries(s)) {
    if (!k.startsWith('once_') && String(v).includes(T2)) ihlal.push(`KİRACI SIZINTISI: ${k} başka kiracının görselini gösteriyor`)
  }
  return { kurulum, ihlal: [...new Set(ihlal)] }
}
