import { describe, expect, it } from 'vitest'

/**
 * ALT-142 · Performance Advisor migration'ı — politika birleştirme, initplan, dizin
 *
 * KORUNAN DEĞİŞMEZLER (kaynak: supabase/migrations/20261103160000_alt142_perf_advisor_politika_dizin.sql):
 *   1. 14 yabancı anahtar dizini var ve yalnız o 14 (idx_<tablo>_<sütun>).
 *   2. Taban (2026-11-01) + bu migration uygulanınca hedef tablolarda tablo × komut × rol başına EN ÇOK BİR
 *      permissive politika kalır (anon ve authenticated için); eski adlar DROP edilmiştir, taban dışı ad düşmez.
 *   3. Her tabloda yeni politikalar ESKİLERDEN ÖNCE oluşturulur (arada koruma boşluğu yok).
 *   4. Çıplak auth.uid() / auth.jwt() yok; hepsi (select ...) ile sarılı.
 *   5. Birleşik politikalar eskilerin VEYA'sını taşır (yetki eşdeğerliği): metin kontrolü.
 *   6. Admin kaynağı değişmedi: brands/product_families user_profiles, diğerleri is_admin_user().
 *   7. p_dsr_owner_insert COMMENT metni birleşik INSERT politikasına aynen taşındı.
 *
 * SINIR (bilerek yazılı): kaynak metni okur, canlı veritabanını değil. Birleşik politikanın DAVRANIŞ eşdeğerliği
 * metin kontrolüdür (hangi koşul var); satır düzeyi kanıt gölge DB'de ayrı koşulur.
 *
 * SABOTAJ KOLU: aşağıdaki "sabotaj" testleri migration'ın kasıtlı bozulmuş kopyalarını kapıya verir; kapı kırmızı
 * vermezse test kırmızıya düşer (yeşil kapı kendi başına kanıt değildir).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const MIGRATION_YOLU = '/supabase/migrations/20261103160000_alt142_perf_advisor_politika_dizin.sql'
const DSR_ESKI_YOLU = '/supabase/migrations/20260817143000_dsr_customer_channel.sql'
const TABAN_YOLU = '/supabase/baselines/2026-11-01_public_schema.sql'

const MIGRATION_DOSYASI: Record<string, string> = import.meta.glob(
  '/supabase/migrations/20261103160000_alt142_perf_advisor_politika_dizin.sql',
  { query: '?raw', import: 'default', eager: true },
)
const DSR_ESKI_DOSYASI: Record<string, string> = import.meta.glob(
  '/supabase/migrations/20260817143000_dsr_customer_channel.sql',
  { query: '?raw', import: 'default', eager: true },
)
const TABAN_DOSYASI: Record<string, string> = import.meta.glob(
  '/supabase/baselines/2026-11-01_public_schema.sql',
  { query: '?raw', import: 'default', eager: true },
)

const MIGRATION = MIGRATION_DOSYASI[MIGRATION_YOLU] ?? ''
const DSR_ESKI = DSR_ESKI_DOSYASI[DSR_ESKI_YOLU] ?? ''
const TABAN = TABAN_DOSYASI[TABAN_YOLU] ?? ''

const BEKLENEN_DIZINLER: ReadonlyArray<readonly [string, string]> = [
  ['data_subject_requests', 'handled_by'],
  ['goods_receipts', 'tenant_id'],
  ['order_invoices', 'issued_by'],
  ['pricing_rule', 'price_book_id'],
  ['product_families', 'subcategory_id'],
  ['purchase_order_items', 'tenant_id'],
  ['refund_attempts', 'tenant_id'],
  ['venthub_quote_items', 'product_id'],
  ['venthub_quote_items', 'tenant_id'],
  ['venthub_quotes', 'accept_confirmed_by'],
  ['venthub_quotes', 'accept_recorded_by'],
  ['venthub_quotes', 'amended_from'],
  ['venthub_quotes', 'source_project_id'],
  ['venthub_quotes', 'superseded_by'],
]

const HEDEF_TABLOLAR = [
  'brands',
  'product_families',
  'data_subject_requests',
  'venthub_quotes',
  'venthub_quote_items',
] as const

const ESKI_ADLAR: ReadonlyArray<readonly [string, string]> = [
  ['brands', 'brands_admin_write'],
  ['brands', 'brands_tenant_select'],
  ['brands', 'merged_brands_authenticated_select'],
  ['product_families', 'product_families_admin_write'],
  ['product_families', 'product_families_tenant_select'],
  ['product_families', 'merged_product_families_authenticated_select'],
  ['data_subject_requests', 'p_dsr_admin_all'],
  ['data_subject_requests', 'p_dsr_owner_insert'],
  ['data_subject_requests', 'p_dsr_owner_select'],
  ['venthub_quote_items', 'quote_items_insert_admin'],
  ['venthub_quote_items', 'quote_items_insert_own_requested'],
  ['venthub_quotes', 'quotes_insert_admin_draft'],
  ['venthub_quotes', 'quotes_insert_own_requested'],
  ['venthub_quotes', 'quotes_update_admin'],
  ['venthub_quotes', 'quotes_update_customer_decision'],
]

type Komut = 'select' | 'insert' | 'update' | 'delete'
const KOMUTLAR: readonly Komut[] = ['select', 'insert', 'update', 'delete']
const ROLLER = ['anon', 'authenticated'] as const

/**
 * SQL'i ifadelere böler: satır (--) ve blok yorumları atılır, tek tırnaklı dizgeler ve $tag$ gövdeleri
 * olduğu gibi korunur (dizge içindeki `--` ve `;` yorum/ayraç sayılmaz). Boşluklar tek boşluğa iner.
 */
function ifadelereBol(sql: string): string[] {
  const out: string[] = []
  let cur = ''
  let i = 0
  const n = sql.length
  while (i < n) {
    const c = sql[i]
    const c2 = sql.slice(i, i + 2)
    if (c2 === '--') {
      while (i < n && sql[i] !== '\n') i++
      cur += ' '
    } else if (c2 === '/*') {
      const son = sql.indexOf('*/', i + 2)
      i = son === -1 ? n : son + 2
      cur += ' '
    } else if (c === "'") {
      let j = i + 1
      while (j < n) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2
        else if (sql[j] === "'") break
        else j++
      }
      cur += sql.slice(i, j + 1)
      i = j + 1
    } else if (c === '$') {
      const etiket = /^\$[A-Za-z_]*\$/.exec(sql.slice(i, i + 40))
      if (etiket) {
        const son = sql.indexOf(etiket[0], i + etiket[0].length)
        const bitis = son === -1 ? n : son + etiket[0].length
        cur += sql.slice(i, bitis)
        i = bitis
      } else {
        cur += c
        i++
      }
    } else if (c === ';') {
      const t = cur.replace(/\s+/g, ' ').trim()
      if (t) out.push(t)
      cur = ''
      i++
    } else {
      cur += c
      i++
    }
  }
  const t = cur.replace(/\s+/g, ' ').trim()
  if (t) out.push(t)
  return out
}

interface Politika {
  ad: string
  tablo: string
  komutlar: Set<Komut>
  roller: Set<string>
  permissive: boolean
  ifade: string
}

function politikaCoz(ifade: string): Politika | null {
  const t = ifade.replace(/"/g, '')
  const m =
    /^create policy (\w+) on public\.(\w+) (?:as (permissive|restrictive) )?(?:for (all|select|insert|update|delete) )?(?:to ([\w, ]+?) )?(?:using|with check)\b/i.exec(
      t,
    )
  if (!m) return null
  const komut = (m[4] ?? 'all').toLowerCase()
  return {
    ad: m[1],
    tablo: m[2],
    komutlar: new Set<Komut>(komut === 'all' ? KOMUTLAR : [komut as Komut]),
    roller: new Set((m[5] ?? 'public').split(',').map((r) => r.trim().toLowerCase())),
    permissive: (m[3] ?? 'permissive').toLowerCase() === 'permissive',
    ifade: t,
  }
}

function tabanPolitikalari(): Map<string, Politika> {
  const harita = new Map<string, Politika>()
  for (const s of ifadelereBol(TABAN)) {
    if (!/^create policy /i.test(s)) continue
    const p = politikaCoz(s)
    if (p) harita.set(`${p.tablo}.${p.ad}`, p)
  }
  return harita
}

function yorumMetni(ifadeler: string[], politikaAdi: string): string | null {
  const re = new RegExp(`^comment on policy ${politikaAdi} on public\\.\\w+ is (.*)$`, 'i')
  for (const s of ifadeler) {
    const m = re.exec(s)
    if (m) {
      const parcalar = [...m[1].matchAll(/'((?:[^']|'')*)'/g)].map((x) => x[1])
      return parcalar.join('')
    }
  }
  return null
}

function politikaBlogu(ifadeler: string[], ad: string): string {
  return ifadeler.find((s) => new RegExp(`^create policy ${ad} on `, 'i').test(s)) ?? ''
}

const BIRLESIK_ICERIK: ReadonlyArray<{ ad: string; var: RegExp[]; yok?: RegExp[] }> = [
  { ad: 'brands_select_anon', var: [/jwt_tenant_id/], yok: [/user_profiles/] },
  {
    ad: 'brands_select_authenticated',
    var: [/jwt_tenant_id/, /user_profiles/, /'admin'/, /'super_admin'/, / or exists/],
  },
  { ad: 'product_families_select_anon', var: [/jwt_tenant_id/, /deleted_at is null/], yok: [/user_profiles/] },
  {
    ad: 'product_families_select_authenticated',
    var: [/jwt_tenant_id/, /deleted_at is null/, /user_profiles/, /'super_admin'/, / or exists/],
  },
  { ad: 'p_dsr_select', var: [/is_admin_user/, /user_id = \(select auth\.uid\(\)\)/, / or /] },
  {
    ad: 'p_dsr_insert',
    var: [
      /is_admin_user/,
      /user_id = \(select auth\.uid\(\)\)/,
      /applicant_email = \(select auth\.jwt\(\) ->> 'email'\)/,
      /status = 'received'/,
      /30 days/,
      /outcome is null/,
      /completed_at is null/,
      /identity_verified_at is null/,
      /handled_by is null/,
      /retained_data_note is null/,
    ],
  },
  {
    ad: 'quote_items_insert',
    var: [/is_admin_user/, /status = 'draft'/, /status = 'requested'/, /q\.user_id = \(select auth\.uid\(\)\)/],
  },
  {
    ad: 'quotes_insert',
    var: [/is_admin_user/, /status = 'draft'/, /status = 'requested'/, /user_id = \(select auth\.uid\(\)\)/],
  },
  {
    ad: 'quotes_update',
    var: [
      /is_admin_user/,
      /status = 'quoted'/,
      /status = 'rejected'/,
      /status = 'accepted'/,
      /accepted_revision_no = revision_no/,
      /accept_channel = 'site'/,
    ],
  },
]

// Admin kaynağı DEĞİŞMEZ: brands/product_families → user_profiles alt sorgusu; diğerleri → is_admin_user().
const PROFIL_ADMIN = [
  'brands_select_authenticated',
  'brands_admin_insert',
  'brands_admin_update',
  'brands_admin_delete',
  'product_families_select_authenticated',
  'product_families_admin_insert',
  'product_families_admin_update',
  'product_families_admin_delete',
]
const FONKSIYON_ADMIN = [
  'p_dsr_select',
  'p_dsr_insert',
  'p_dsr_admin_update',
  'p_dsr_admin_delete',
  'quote_items_insert',
  'quotes_insert',
  'quotes_update',
]

/** Migration metnini kapıdan geçirir; ihlal listesi döner (boş = temiz). */
function denetle(sql: string): string[] {
  const ihlal: string[] = []
  const ifadeler = ifadelereBol(sql)

  // 1) dizinler
  const dizinler = ifadeler
    .map((s) => /^create index if not exists (idx_\w+) on public\.(\w+) \((\w+)\)$/i.exec(s))
    .filter((m): m is RegExpExecArray => m !== null)
  const beklenen = BEKLENEN_DIZINLER.map(([t, c]) => `idx_${t}_${c}|${t}|${c}`).sort()
  const bulunan = dizinler.map((m) => `${m[1]}|${m[2]}|${m[3]}`).sort()
  for (const b of beklenen) if (!bulunan.includes(b)) ihlal.push(`dizin eksik: ${b}`)
  for (const b of bulunan) if (!beklenen.includes(b)) ihlal.push(`beklenmeyen dizin: ${b}`)
  if (ifadeler.filter((s) => /^create (unique )?index /i.test(s)).length !== dizinler.length) {
    ihlal.push('create index ifadesi beklenen biçimde değil (if not exists + tek sütun)')
  }

  // 2) taban + migration benzetimi: tablo × komut × rol başına en çok bir permissive
  const durum = tabanPolitikalari()
  const sira = new Map<string, { create: number[]; drop: number[] }>()
  const kaydet = (tablo: string, tur: 'create' | 'drop', idx: number): void => {
    const k = sira.get(tablo) ?? { create: [], drop: [] }
    k[tur].push(idx)
    sira.set(tablo, k)
  }
  ifadeler.forEach((s, idx) => {
    if (/^create policy /i.test(s)) {
      const p = politikaCoz(s)
      if (!p) {
        ihlal.push(`politika çözülemedi: ${s.slice(0, 80)}`)
        return
      }
      if (durum.has(`${p.tablo}.${p.ad}`)) ihlal.push(`politika zaten var: ${p.tablo}.${p.ad}`)
      durum.set(`${p.tablo}.${p.ad}`, p)
      kaydet(p.tablo, 'create', idx)
    } else {
      const d = /^drop policy (?:if exists )?(\w+) on public\.(\w+)$/i.exec(s)
      if (d) {
        if (!durum.has(`${d[2]}.${d[1]}`)) ihlal.push(`olmayan politika düşürülüyor: ${d[2]}.${d[1]}`)
        durum.delete(`${d[2]}.${d[1]}`)
        kaydet(d[2], 'drop', idx)
      }
    }
  })
  for (const [tablo, ad] of ESKI_ADLAR) {
    if (durum.has(`${tablo}.${ad}`)) ihlal.push(`eski politika düşmedi: ${tablo}.${ad}`)
  }
  for (const tablo of HEDEF_TABLOLAR) {
    for (const rol of ROLLER) {
      for (const komut of KOMUTLAR) {
        const uyan = [...durum.values()].filter(
          (p) =>
            p.tablo === tablo &&
            p.permissive &&
            p.komutlar.has(komut) &&
            (p.roller.has(rol) || p.roller.has('public')),
        )
        if (uyan.length > 1) {
          ihlal.push(`çakışma: ${tablo} × ${komut} × ${rol}: ${uyan.map((p) => p.ad).join(', ')}`)
        }
      }
    }
  }

  // 3) sıra: her tabloda tüm CREATE'ler tüm DROP'lardan önce
  for (const [tablo, k] of sira) {
    if (k.create.length && k.drop.length && Math.max(...k.create) > Math.min(...k.drop)) {
      ihlal.push(`sıra: ${tablo} için bir DROP, bir CREATE'ten önce geliyor`)
    }
  }

  // 4) çıplak auth çağrısı (yorumlar ve dizgeler dışında zaten ifadelerde; dizge içeriği de taranır)
  const tumu = ifadeler.join(' ; ')
  const cipak = tumu.match(/(?<!\bselect\s+)auth\.(?:uid|jwt)\(\)/gi)
  if (cipak) ihlal.push(`çıplak auth çağrısı: ${cipak.length} adet`)

  // 5) birleşik politikaların içeriği (eskilerin VEYA'sı)
  for (const k of BIRLESIK_ICERIK) {
    const blok = politikaBlogu(ifadeler, k.ad)
    if (!blok) {
      ihlal.push(`birleşik politika yok: ${k.ad}`)
      continue
    }
    for (const r of k.var) if (!r.test(blok)) ihlal.push(`${k.ad}: eksik koşul ${r}`)
    for (const r of k.yok ?? []) if (r.test(blok)) ihlal.push(`${k.ad}: olmaması gereken ${r}`)
  }

  // 6) admin kaynağı değişmedi
  for (const ad of PROFIL_ADMIN) {
    const blok = politikaBlogu(ifadeler, ad)
    if (!/user_profiles/.test(blok) || /is_admin_user/.test(blok)) ihlal.push(`${ad}: admin kaynağı user_profiles olmalı`)
  }
  for (const ad of FONKSIYON_ADMIN) {
    const blok = politikaBlogu(ifadeler, ad)
    if (!/is_admin_user/.test(blok) || /user_profiles/.test(blok)) ihlal.push(`${ad}: admin kaynağı is_admin_user() olmalı`)
  }

  // A) quote_email_events
  const alter = ifadeler.find((s) => /^alter policy quote_email_events_admin_read on public\.quote_email_events /i.test(s)) ?? ''
  if (!/up\.id = \(select auth\.uid\(\)\)/.test(alter)) ihlal.push('quote_email_events_admin_read: (select auth.uid()) yok')

  // 7) COMMENT taşıması
  const eski = yorumMetni(ifadelereBol(DSR_ESKI), 'p_dsr_owner_insert')
  const yeni = yorumMetni(ifadeler, 'p_dsr_insert')
  if (!eski) ihlal.push('kaynak: 20260817143000 içinde p_dsr_owner_insert yorumu okunamadı')
  else if (yeni !== eski) ihlal.push('p_dsr_insert yorumu p_dsr_owner_insert yorumuyla aynı değil')

  return ihlal
}

/** Sabotaj yardımcıları: kopyada tek bir kasıtlı bozulma. */
function degistir(sql: string, bul: string | RegExp, yerine: string): string {
  const sonuc = sql.replace(bul, yerine)
  if (sonuc === sql) throw new Error(`sabotaj uygulanamadı (kalıp bulunamadı): ${String(bul)}`)
  return sonuc
}

describe('ALT-142 · Performance Advisor migration kapısı', () => {
  it('boş evren koruması: migration, taban ve eski DSR migration okundu', () => {
    expect(MIGRATION.length, 'alt142 migration dosyası okunamadı').toBeGreaterThan(1000)
    expect(TABAN.length, '2026-11-01 şema tabanı okunamadı').toBeGreaterThan(100000)
    expect(DSR_ESKI.length, '20260817143000 okunamadı').toBeGreaterThan(500)
    expect(tabanPolitikalari().size, 'tabandan politika çıkarılamadı').toBeGreaterThan(100)
  })

  it('migration kapıdan temiz geçer (14 dizin, tek politika, sıra, sarma, eşdeğerlik, yorum)', () => {
    expect(denetle(MIGRATION)).toEqual([])
  })

  it('(a) tam olarak 14 dizin ve hepsi idx_<tablo>_<sütun>', () => {
    const dizinler = ifadelereBol(MIGRATION).filter((s) => /^create index /i.test(s))
    expect(dizinler).toHaveLength(14)
    for (const [t, c] of BEKLENEN_DIZINLER) {
      expect(dizinler).toContain(`create index if not exists idx_${t}_${c} on public.${t} (${c})`)
    }
  })

  it('(b) hedef tablolarda çakışma kalmadı: eski adlar düştü, yeni adlar tekil', () => {
    const ifadeler = ifadelereBol(MIGRATION)
    const dusenler = ifadeler
      .map((s) => /^drop policy (\w+) on public\.(\w+)$/i.exec(s))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => `${m[2]}.${m[1]}`)
      .sort()
    expect(dusenler).toEqual(ESKI_ADLAR.map(([t, a]) => `${t}.${a}`).sort())
  })

  it('(c) çıplak auth.uid() / auth.jwt() yok', () => {
    const ifadeler = ifadelereBol(MIGRATION).join(' ; ')
    expect(ifadeler.match(/(?<!\bselect\s+)auth\.(?:uid|jwt)\(\)/gi)).toBeNull()
    // Dolu evren: sarılı çağrılar gerçekten var (regex boş ölçmesin).
    expect((ifadeler.match(/\(select auth\.(?:uid|jwt)\(\)/gi) ?? []).length).toBeGreaterThan(10)
  })

  it('(d) birleşik politikalar eski politikaların VEYA içeriğini taşır', () => {
    const ifadeler = ifadelereBol(MIGRATION)
    for (const k of BIRLESIK_ICERIK) {
      const blok = politikaBlogu(ifadeler, k.ad)
      expect(blok, `${k.ad} bulunamadı`).not.toBe('')
      for (const r of k.var) expect(blok, `${k.ad} ${r}`).toMatch(r)
      for (const r of k.yok ?? []) expect(blok, `${k.ad} ${r}`).not.toMatch(r)
    }
    // brands_select (authenticated) hem kiracı hem user_profiles; dsr insert hem is_admin_user hem 'received'.
    const brands = politikaBlogu(ifadeler, 'brands_select_authenticated')
    expect(brands).toMatch(/jwt_tenant_id/)
    expect(brands).toMatch(/user_profiles/)
    const dsr = politikaBlogu(ifadeler, 'p_dsr_insert')
    expect(dsr).toMatch(/is_admin_user/)
    expect(dsr).toMatch(/'received'/)
  })

  it('p_dsr_owner_insert yorumu aynen taşındı (kaynaktan okunan metinle bayt eşit)', () => {
    const eski = yorumMetni(ifadelereBol(DSR_ESKI), 'p_dsr_owner_insert')
    const yeni = yorumMetni(ifadelereBol(MIGRATION), 'p_dsr_insert')
    expect(eski).toContain('Veri sahibi kendi talebini acar')
    expect(yeni).toBe(eski)
  })

  describe('sabotaj: kasıtlı bozuk kopyada kapı KIRMIZI verir', () => {
    it('çıplak auth.uid()', () => {
      const bozuk = degistir(MIGRATION, '(select auth.uid())', 'auth.uid()')
      expect(denetle(bozuk).join('\n')).toMatch(/çıplak auth çağrısı/)
    })

    it('eski politika DROP edilmemiş', () => {
      const bozuk = degistir(MIGRATION, 'drop policy brands_admin_write on public.brands;', '')
      expect(denetle(bozuk).join('\n')).toMatch(/eski politika düşmedi: brands\.brands_admin_write/)
    })

    it('DROP, CREATE\'ten önce (koruma boşluğu)', () => {
      const dusur = 'drop policy p_dsr_admin_all on public.data_subject_requests;'
      const bozuk = degistir(
        degistir(MIGRATION, dusur, ''),
        'create policy p_dsr_select ',
        `${dusur}\ncreate policy p_dsr_select `,
      )
      expect(denetle(bozuk).join('\n')).toMatch(/sıra: data_subject_requests/)
    })

    it("dsr insert 'received' koşulunu kaybetmiş", () => {
      const bozuk = degistir(MIGRATION, "and status = 'received'::text", '')
      expect(denetle(bozuk).join('\n')).toMatch(/p_dsr_insert: eksik koşul/)
    })

    it('brands authenticated select admin koluna user_profiles taşımıyor', () => {
      const bas = MIGRATION.indexOf('create policy brands_select_authenticated')
      const son = MIGRATION.indexOf('create policy brands_admin_insert')
      const blok = MIGRATION.slice(bas, son).replace(/user_profiles/g, 'profiles_x')
      const bozuk = MIGRATION.slice(0, bas) + blok + MIGRATION.slice(son)
      expect(denetle(bozuk).join('\n')).toMatch(/brands_select_authenticated: eksik koşul/)
    })

    it('admin kaynağı değiştirilmiş (brands is_admin_user kullanıyor)', () => {
      const bozuk = degistir(
        MIGRATION,
        /create policy brands_admin_delete on public\.brands\s+for delete to authenticated\s+using \([\s\S]*?\);\n/,
        'create policy brands_admin_delete on public.brands for delete to authenticated using ((select public.is_admin_user()));\n',
      )
      expect(denetle(bozuk).join('\n')).toMatch(/brands_admin_delete: admin kaynağı user_profiles olmalı/)
    })

    it('bir dizin eksik', () => {
      const bozuk = degistir(
        MIGRATION,
        'create index if not exists idx_refund_attempts_tenant_id on public.refund_attempts (tenant_id);',
        '',
      )
      expect(denetle(bozuk).join('\n')).toMatch(/dizin eksik: idx_refund_attempts_tenant_id/)
    })

    it('hedef tabloda ikinci permissive politika kalmış', () => {
      const bozuk = degistir(
        MIGRATION,
        /\bcommit;\s*$/,
        'create policy sizinti on public.brands for select to authenticated using (true);\ncommit;',
      )
      expect(denetle(bozuk).join('\n')).toMatch(/çakışma: brands × select × authenticated/)
    })

    it('p_dsr_insert yorumu değiştirilmiş', () => {
      const bozuk = degistir(MIGRATION, 'Veri sahibi kendi talebini acar.', 'Veri sahibi talep acar.')
      expect(denetle(bozuk).join('\n')).toMatch(/yorumu p_dsr_owner_insert yorumuyla aynı değil/)
    })

    it('quote_email_events politikası sarılmamış', () => {
      const bozuk = degistir(MIGRATION, 'up.id = (select auth.uid())', 'up.id = auth.uid()')
      expect(denetle(bozuk).join('\n')).toMatch(/çıplak auth çağrısı|quote_email_events_admin_read/)
    })
  })
})
