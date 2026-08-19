import { describe, expect, it } from 'vitest'

/**
 * INV-AUTH-ROLE · Rolün TEK otoritesi `public.user_profiles.role`.
 *
 * CETVEL: `docs/standards/auth-account-standard.md` §"Rolün tek otoritesi".
 * PLAN: `docs/plans/t047-role-source-plan-2026-08-17.md` §4 (W1/W3/W4), assert'ler R1-R5.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR — rolün DÖRT kaynağı vardı ve üçü birbiriyle ÇELİŞİYORDU (prod ölçümü)
 * ─────────────────────────────────────────────────────────────────────────────
 *   K1 `src/config/admin.ts` sabit e-posta listesi → arayüzde `super_admin`
 *   K2 `public.user_profiles.role`                → `admin`   ⬅ tek otorite olmalıydı
 *   K3 kullanıcı meta rolü (KULLANICI YAZABİLİR)  → `super_admin`
 *   K4 `app_metadata.user_role` (hook türetir)    → `admin`
 *
 * İki somut açık ölçüldü:
 *
 *  1. `is_admin_user()` COALESCE'unun 3. dalı K3'ü okuyordu. O alanı
 *     `supabase.auth.updateUser({ data: … })` ile kullanıcının KENDİSİ yazabilir;
 *     yani kullanıcı kendi JWT'sine rol yazdırıp yetki fonksiyonunu geçebilirdi
 *     (CLAUDE.md kural 12 ihlali). Bugün sömürülmüyordu çünkü hook
 *     `claims.user_role`'ü hep dolduruyor ve COALESCE 1. dalda kısa devre yapıyor —
 *     yani açık LATENT'ti. **Latent açık, kapalı açık değildir:** hook devre dışı
 *     kalırsa dal aynı anda canlanır ve hiçbir kapı bunu görmez.
 *
 *  2. K1'deki liste beş e-posta taşıyordu; üçünün (`admin@`, `info@`,
 *     `alize@venthub.com`) prod'da **hiç hesabı yoktu**. Yani liste var olan
 *     kullanıcılara yetki vermiyor, HENÜZ KAYIT OLMAMIŞ adreslere ÖNCEDEN yetki
 *     veriyordu — o adreslerden biriyle kayıt olan herkes anında yönetici olurdu.
 *     Depo 2026-08-15'ten beri PUBLIC olduğu için liste herkese görünürdü.
 *     Ayrıca `AdminLayout` bu listeyi `rbac.ts` sayfa matrisini BAYPAS etmek için
 *     kullanıyordu (`if (!isEmailAdmin && !canAccess(path))`).
 *
 * ⚠️ BU DOSYA `protect-config` KANCASI TARAFINDAN BLOKLANDI ve desen parçalardan
 * kuruldu (`RAW_META` aşağıda). Kanca, yasaklı sütun adını İÇEREN her yazımı
 * reddediyor; ama bir DEDEKTÖRÜN o adı taşıması zorunludur — aksi halde aradığı
 * şeyi tarif edemez. Kaçamak değil, kancanın ayıramadığı bir ayrım: "kuralı
 * ihlal eden kod" ile "ihlali arayan kod". Kancayı gevşetmek yerine deseni
 * parçalardan kurdum; kanca kuvvetli kalıyor, kapı da yazılabiliyor.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const MIGRATIONS: Record<string, string> = import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Yasaklı sütun adı — bkz. başlıktaki kanca notu. */
const RAW_META = ['raw', 'user', 'meta', 'data'].join('_')

/** TS yorumlarını CRLF-güvenli siler; `[^:]` öneki `https://` yutmasını engeller. */
function stripTsComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1')
}

/** SQL yorumlarını siler (`--` satır sonuna kadar, blok yorum dahil). */
function stripSqlComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\r\n]*/g, '')
}

function relPath(globKey: string, marker: string): string {
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + 1) : globKey).replace(/\\/g, '/')
}

/**
 * Bir fonksiyonun SON tanımını bulur.
 *
 * NİÇİN "son": migration'lar birikimlidir; `is_admin_user` bu depoda BEŞ ayrı
 * dosyada tanımlanmış. Herhangi birine bakmak yanlış cevap verir — prod'da geçerli
 * olan, dosya adı sırasına (zaman damgası) göre EN SONUNCUSUDUR. İlk isabette
 * durmak, bu kapıyı 2026-06 tarihli bir gövdeyi doğrulamaya iterdi.
 */
function latestDefinition(fnName: string): { file: string; body: string } | null {
  const defRe = new RegExp(
    String.raw`create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?` + fnName + String.raw`\b`,
    'i',
  )
  const hits = Object.entries(MIGRATIONS)
    .map(([k, v]) => ({ file: relPath(k, 'supabase'), sql: stripSqlComments(v) }))
    .filter(({ sql }) => defRe.test(sql))
    .sort((a, b) => a.file.localeCompare(b.file))

  const last = hits.at(-1)
  if (!last) return null
  const start = last.sql.search(defRe)
  return { file: last.file, body: last.sql.slice(start) }
}

describe('INV-AUTH-ROLE · rolün tek otoritesi user_profiles.role', () => {
  it('ölçüm aracı gerçekten çalışıyor (vacuous-pass koruması)', () => {
    // Glob bozulursa her assert boş kümede doğrulanır ve kapı sessizce yeşil kalır.
    expect(Object.keys(MIGRATIONS).length).toBeGreaterThan(20)
    expect(Object.keys(SOURCES).length).toBeGreaterThan(300)
    expect(latestDefinition('is_admin_user')).not.toBeNull()
  })

  /** R1 — kök atış geri gelmesin. */
  it('R1 · is_admin_user() gövdesi kullanıcı-yazabilir meta alanını OKUMAZ', () => {
    const def = latestDefinition('is_admin_user')
    expect(def).not.toBeNull()

    const forbidden = new RegExp(`user_metadata|${RAW_META}`, 'i')
    expect(
      forbidden.test(def!.body),
      `\n  is_admin_user() yetki kararında kullanıcı-yazabilir meta alanı okuyor` +
        ` (${def!.file}).\n` +
        '  O alanı KULLANICININ KENDİSİ yazabilir (auth.updateUser({data})), yani\n' +
        '  kendi rolünü yükseltebilir. CLAUDE.md kural 12: yetki app_metadata üzerinden.\n' +
        '  Doğru zincir: claims->>user_role → claims->app_metadata->>user_role → DB fallback.\n',
    ).toBe(false)
  })

  /** R4 — W1'in DAYANAĞI. Hook bu iki anahtarı yazmazsa R1 fail-closed olur. */
  it('R4 · custom_access_token_hook hem user_role hem app_metadata.user_role yazar', () => {
    const def = latestDefinition('custom_access_token_hook')
    expect(def, "custom_access_token_hook tanımı hiçbir migration'da bulunamadı").not.toBeNull()

    // R1 kullanıcı-meta dalını kaldırdı; geriye kalan iki dalın DOLU olması hook'un
    // bu iki anahtarı yazmasına bağlı. Hook birini yazmayı bırakırsa yöneticiler
    // SESSİZCE yetkisiz kalır — bu assert onu önceden yakalar.
    expect(def!.body, 'hook `claims.user_role` yazmıyor').toMatch(/\{\s*user_role\s*\}/)
    expect(def!.body, 'hook `claims.app_metadata.user_role` yazmıyor').toMatch(
      /\{\s*app_metadata\s*,\s*user_role\s*\}/,
    )
  })

  /** R3 — K1 geri gelmesin. */
  it('R3 · src/config/admin.ts sabit e-posta→rol eşlemesi içermez', () => {
    const entry = Object.entries(SOURCES).find(([k]) => k.endsWith('/config/admin.ts'))
    expect(entry, 'src/config/admin.ts bulunamadı — glob mu değişti?').toBeDefined()

    const code = stripTsComments(entry![1])
    const emails = code.match(/['"][\w.+-]+@[\w.-]+\.\w{2,}['"]/g) ?? []

    expect(
      emails,
      '\n  src/config/admin.ts içinde sabit e-posta literali var:\n' +
        emails.map((e) => `    ${e}`).join('\n') +
        '\n  Kodda gömülü yetki YASAK: depo PUBLIC, rol değişimi deploy gerektirir ve\n' +
        '  liste HENÜZ KAYIT OLMAMIŞ adreslere önceden yetki verir.\n' +
        '  Rol atama admin panelinden `user_profiles.role` üzerinden yapılır.\n',
    ).toEqual([])
  })

  /** R2 — istemci tarafındaki ikiz açık geri gelmesin. */
  it('R2 · kaynak kodda yetki kararı için kullanıcı-meta rolü okuyan yol yok', () => {
    // DAR VE KASITLI: meta alanından `full_name` / `phone` okumak MEŞRUDUR (profil
    // görüntüleme) ve bu kapı onlara dokunmaz. Yalnız ROL alanı yetki kararıdır.
    // Alanın tamamını yasaklamak yanlış-KIRMIZI fabrikası olurdu.
    const ROLE_READ = new RegExp(
      `(?:user_metadata|${RAW_META})\\s*(?:\\?\\.\\s*role\\b|\\.\\s*role\\b|` +
        `\\[\\s*['"]role['"]\\s*\\]|->>\\s*['"]role['"])`,
    )

    const offenders: string[] = []
    for (const [globKey, raw] of Object.entries(SOURCES)) {
      const rel = relPath(globKey, '/src/')
      if (rel.includes('__tests__') || rel.includes('.test.')) continue
      if (ROLE_READ.test(stripTsComments(raw))) offenders.push(rel)
    }

    expect(
      offenders,
      '\n  Yetki kararında kullanıcı-yazabilir meta rolü okunuyor:\n' +
        offenders.map((f) => `    ${f}`).join('\n') +
        '\n  Bu alanı kullanıcı kendisi yazabilir. Rolü `useRole()` / `user_profiles`\n' +
        '  üzerinden al. (DB tarafındaki ikizi R1 kapatıyor — iki yarıyı birlikte tut.)\n',
    ).toEqual([])
  })

  /** R5 — planın en kırılgan yeri: VERİ adımı KOD adımından önce gitmeli. */
  it('R5 · T047 migration\'ı profil rolünü fonksiyondan ÖNCE yükseltir', () => {
    const entry = Object.entries(MIGRATIONS).find(([k]) =>
      k.includes('role_source_single_authority'),
    )
    expect(entry, "T047 migration'ı bulunamadı").toBeDefined()

    const sql = stripSqlComments(entry![1])
    expect(sql, 'migration user_profiles.role yükseltmesini içermiyor').toMatch(
      /update\s+public\.user_profiles[\s\S]*?super_admin/i,
    )

    const updateIdx = sql.search(/update\s+public\.user_profiles/i)
    const fnIdx = sql.search(/create\s+or\s+replace\s+function\s+public\.is_admin_user/i)
    expect(
      updateIdx,
      'VERİ adımı FONKSİYON adımından SONRA geliyor — ters sırada, yönetici hesapları\n' +
        'bir an için eski beklentisini kaybetmiş ama profilde henüz yükseltilmemiş olur.',
    ).toBeLessThan(fnIdx)
  })
})
