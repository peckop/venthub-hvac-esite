---
name: venthub-supabase
description: VentHub'a özgü Supabase kuralları — istemci fabrikaları, servis DI, React.cache, önbellek
  anahtarı (tenant+lang), advisor kapsamı, psql ve kendi defterle migration. Servis yaz, supabase
  client, db query için KULLAN. Genel sorular supabase:supabase eklentisinde. Font, git, test için
  KULLANMA.
metadata:
  author: venthub
  version: 1.0.0
  triggers:
  - supabase client
  - servis yaz
  - db query
  inputs:
  - service code structure
  outputs:
  - DI-compliant supabase client usages
category: guards
depends_on: []
next_steps:
- supabase-security
run_last: false
exclusions: []
---

# VentHub Supabase — yalnız bu projeye özgü kurallar

## ⭐BU SKILL NİÇİN VAR, NE DEĞİL (2026-09-17)

Bu dosya eskiden `supabase` adını taşıyordu ve satıcının `supabase` skill'inin **çatalıydı**
(0.1.2 metni + bizim bölümlerimiz). Recep Supabase eklentisini kurdu (`supabase:supabase`,
kendini günceller) ve iki skill aynı işe yarışır hâle geldi. Ölçüldü: çatalın satıcı kısmı
**bayattı** — eklentinin yeni "bağımlılık ve tedarik zinciri güvenliği" maddesi bizde yoktu.

Karar (Recep karar 26'nın uygulaması): **satıcı metni eklentiye bırakıldı**, bu dosyada yalnız
satıcının BİLEMEYECEĞİ yerel kurallar kaldı. İki kaynak artık çakışmıyor:

| Soru | Kaynak |
|---|---|
| Supabase genel çalışma ilkeleri, güvenlik kontrol listesi (RLS, view, SECURITY DEFINER, Storage), CLI keşfi, MCP bağlantı sorunları, doküman erişimi | **`supabase:supabase`** (eklenti, güncel) |
| Postgres performans/indeks/sorgu en iyi pratikleri | **`supabase:supabase-postgres-best-practices`** (eklenti) |
| İstemci fabrikaları, DI, önbellek anahtarı, import hijyeni, advisor kapsamı, **bu projede migration yolu** | **bu dosya** |
| RLS/tenant denetimi, VentHub güvenlik taraması | `supabase-security` |
| Yeni migration dosyası açmak | `create-migration` |

⚠**Satıcı metni ile bu dosya çelişirse, YEREL OLGU konusunda bu dosya kazanır** (ör. migration
yolu). Genel Supabase davranışı konusunda eklenti kazanır. Cetvel: `docs/standards/ledger-ve-olu-migration-standard.md` §2.1.

## ⛔BU PROJEDE MİGRATION: SATICININ CLI AKIŞI KULLANILMAZ

Eklentinin "Making and Committing Schema Changes" bölümü `supabase migration new`,
`supabase db pull`, `supabase migration list` ve `apply_migration` önerir. **Bu projede o akış
YANLIŞ SONUÇ verir** ve niçin olduğu ölçüldü (2026-09-16):

- Migration'lar `psql` ile uygulanır ve **`public._migration_ledger`**'a kaydedilir; satıcının
  defteri (`supabase_migrations.schema_migrations`) bu projede **hiç tam olmadı**, Nisan'da
  donmuş (110 kayıt, bizimki 235, ortak 3). `migration list`, `migration repair`, `migration
  squash`, `db push` bu yüzden **bizim deftere bakmaz** — yanlış tabloyu okur.
- **Master'a merge = prod'a otomatik uygulama** (`supabase-migrate.yml`, CLAUDE.md kural 13).
- Dosya adı `YYYYMMDDHHMMSS_aciklama.sql` — **14 hane**; 8 haneli damga kapıda kırmızı verir
  ve aynı gün yazılan dosyaları tek kimliğe çöktürür (ölçüldü: 26 damga 138 dosyada paylaşılıyor).
- Yeni migration → **`create-migration` skill'i**. Plan → **`plan-challenger` zorunlu**.
- Test ortamı → `scripts/db/golge-kur.mjs` (Docker konteynerinde ayrı veritabanı).
  ⛔`supabase db reset` **kullanılmaz**: aynı kümedeki başka veritabanlarını da siler
  (2026-09-16'da bir akranın gölgesini uçurdu). Kendi gölgeni düşürmek için `--dusur`.
- Sıfırdan kurulum `migrations/` klasöründen **yapılmaz** (233 dosyanın 170'i boş veritabanında
  düşer); taban dökümünden yapılır: `supabase/baselines/README.md`.
- Prod'a okuma: MCP `execute_sql` (salt-okuma sorgu). **Tabloya hüküm vermeden önce şemayı oku**
  (`information_schema.columns`) — yanlış tabloya bakmak bu projede iki kez yanlış hüküm üretti.

Ayrıntı ve gerekçe: `docs/standards/ledger-ve-olu-migration-standard.md` §1.1.

## Next.js 15 SSR İstemci Mimarisi ve Fabrikalar

Next.js 15 App Router'da tekil (singleton) istemci yerine **isteğe bağlı fabrika** gerekir;
aksi hâlde bellek sızıntısı ve oturumların birbirine karışması (data bleeding) olur.

### 1. Tarayıcı istemcisi (`src/lib/supabase/client.ts`)
Yalnız Client Component'lerde (`'use client'`), `createBrowserClient` ile:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export const supabaseBrowserClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Sunucu istemcisi (`src/lib/supabase/server.ts`)
Server Component, Server Action ve Route Handler'larda **istek başına** üretilir, `cookies()` beklenir:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component içinden çağrıldıysa çerez yazılamaz; yok saymak güvenli
          }
        },
      },
    }
  )
}
```

### 3. Statik istemci (`src/lib/supabase/static.ts`)
SSG ya da derleme anında veri çekmede (istek çerezi yokken) `persistSession: false` ile:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export const supabaseStaticClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)
```
⚠Bu projede PPR **kullanılmıyor** (`next.config.mjs`'te `experimental.ppr` yok, 2026-08-15 ölçüldü).

### 4. RSC sorgu tekilleştirme (React.cache)
Server Component'ler bir render geçişinde birden çok kez render edilebilir; tekrarlanan
sorgular `React.cache()` ile sarılır (CLAUDE.md kural 6):
```typescript
import { cache } from 'react'

export const getProductBySlug = cache(async (slug: string) => {
  const supabase = supabaseStaticClient // ya da await createSupabaseServerClient()
  const { data } = await supabase.from('products').select('*').eq('slug', slug).single()
  return data
})
```

### 5. Çok kiracılı önbellek ayrımı (unstable_cache anahtarı)
`unstable_cache` / `revalidateTag` anahtarına **`tenantId` VE `lang`** girer; biri eksikse bir
kiracının önbelleği diğerine servis edilir (CLAUDE.md kural 12):
```typescript
const getCachedData = (tenantId: string, lang: string) =>
  unstable_cache(
    async () => fetchTenantData(tenantId),
    ['tenant-data-key', lang, tenantId],
    { revalidate: 3600 }
  )()
```

### 6. Bağımlılık enjeksiyonu (DI) ve tekil istemci import yasağı
Dosya düzeyindeki global istemci nesnelerinin (`supabaseBrowserClient`,
`createSupabaseServerClient`, `supabaseStaticClient`) servis ya da bileşen dosyalarına doğrudan
import edilip kullanılması **YASAKTIR** (CLAUDE.md kural 2; ESLint `no-restricted-imports` + AST
testi zorlar).
* **Kural:** `src/lib/services/` altındaki her veri servisi ilk parametre olarak
  `supabase: SupabaseClient<Database>` alır. Modül düzeyinde statik istemci import'u ya da
  varsayılan (fallback) istemci yoktur.
* **Örnek:**
  ```typescript
  import { SupabaseClient } from '@supabase/supabase-js'
  import { Database } from '@/types/database.types'

  export async function getProducts(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase.from('products').select('*')
    return { data, error }
  }
  ```
* **Çağıran tarafı:**
  - **İstemci tarafı:** bileşen, hook ya da context içinden → `supabaseBrowserClient` geçilir.
  - **Sunucu tarafı:** Server Component, Server Action, API rotası → `await createSupabaseServerClient()`
    (istek bazlı) ya da `supabaseStaticClient` (statik render).

### 7. Import hijyeni ve joker export yasağı
- **Yasak:** servis dosyalarından joker export (`export *`, ör. `src/lib/supabase.ts`) —
  döngüsel bağımlılık ve şişkin JS paketi üretir.
- **Doğru:** servisleri ve DB tiplerini kendi dosyalarından doğrudan import et
  (`{ Category }` → `@/types/database.types` ya da `@/lib/services/category`).

## Yetki: rol bilgisi ve Auth Hook

- Yetki kararları **`app_metadata`** üzerinden; `raw_user_meta_data` kullanıcı tarafından
  düzenlenebilir, **asla** yetki kararında kullanılmaz (CLAUDE.md kural 12).
- Rolü JWT'ye taşımak için tetikle `raw_app_meta_data` yazmak yerine Supabase'in resmi
  **Custom Access Token Auth Hook** mekanizması tercih edilir; her token yenilemede çalışır ve
  rol bilgisi güncel kalır. Kaynak: https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac

## MCP ile CLI: Advisor kapsam farkı

- **CLI** (`supabase db advisors`): yalnız temel lint kurallarını koşar (unused_index,
  extension_in_public, multiple_permissive, auth_rls_initplan, function_search_path_mutable).
- **MCP** (`get_advisors`): Supabase Management API üzerinden **tam** güvenlik taraması yapar;
  CLI'da görünmeyen şu kategorileri de kapsar:
  - `pg_graphql_anon_table_exposed` / `pg_graphql_authenticated_table_exposed`
  - `anon_security_definer_function_executable` / `authenticated_security_definer_function_executable`
  - `public_bucket_allows_listing`
  - `auth_leaked_password_protection`
- **Kural:** güvenlik denetiminde her zaman MCP `get_advisors`. CLI sonucu eksik kalır.

⚠Bu makinede Supabase MCP'si iki kaynaktan bağlı olabilir (claude.ai bağlayıcısı ve eklenti);
ikisi aynı projeye bakar. Bir araç görünmüyorsa önce hangisinin bağlı olduğunu ölç.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
