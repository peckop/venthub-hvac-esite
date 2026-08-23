#!/usr/bin/env node
/**
 * RBAC UI↔DB PARITE RAPORU — arayuzun VAAT ETTIGI sayfa, DB'nin SATIR VERDIGI yuzey mi?
 *
 * ══ BU KAPI DEGIL, RAPORDUR ══
 * Bilerek kapi yapilmadi ve gerekce olculmustur: CI'da veritabani kimligi YOK; olsaydi da
 * her PR'i canli DB'ye baglamak ag bagimliligi ve flake uretirdi. Bu yuzden ELLE kosulur,
 * ciktisi `docs/audits/` altina dusen bir OLCUMDUR. Yesil/kirmizi degil, KARNE verir.
 * (Karar: OPS-AUDIT, 2026-08-20.)
 *
 * ── SSOT — aile TANIMI burada DEGIL, cetvelde ──────────────────────────────────────
 * A/B/C aile ayriminin ANLAMI ve gerekcesi:
 *     docs/standards/db-grant-hygiene-standard.md §3.2  (LEGAL, PR #719)
 * Bu betik o cetvelin UYGULAMASIDIR: cetvel NIYE'yi tasir ve degismez; betik NASIL'i tasir
 * ve DB semasi degistikce degisir. Cetveldeki tablo listesi TARIHLI bir olcum fotografidir
 * (otorite degil ornek); GUNCEL siniflandirmanin kaynagi bu betiktir — cunku aileleri her
 * kosuda CANLI katalogdan turetir, sabit liste TUTMAZ.
 * Celiskide: aile TANIMI icin cetvel, bugunku aile DEGERI icin betik.
 *
 * ── KAPSAM AYRIMI — `rls-role-coverage.mjs` ile AYNI SEYI OLCMEZ ──────────────────────
 * Ayni seyi olcen iki sey ayrisir ve otorite belirsizlesir; o yuzden sinir burada YAZILI:
 *
 *   `rls-role-coverage.mjs` (LEGAL, INV-RLS-COVERAGE-1) → **DB ICI**
 *       Sordugu soru: kodun okudugu bir tabloda, okuyan POSTGRES rolunu (`authenticated`)
 *       kapsayan bir politika var mi? Olcum birimi TABLO; rol ekseni Postgres rolu.
 *       VentHub'in uygulama rolleri (moderator/warehouse/sales) politikanin ICINDE
 *       (`is_admin_user()`, `user_role IN (...)`) yasar — o betik oraya BAKMAZ, bakamaz.
 *
 *   bu betik → **DB ↔ UI**
 *       Sordugu soru: `ROLE_PAGE_ACCESS` bir role su rotayi VAAT EDIYOR; o rolun kimligiyle
 *       o rotanin okudugu tablolar gercekten SATIR veriyor mu? Olcum birimi ROTA; rol
 *       ekseni UYGULAMA rolu. Politikanin metnini degil DAVRANISINI olcer.
 *
 *   Kesisim yok: biri "politika var mi", oteki "satir geliyor mu". Bir tabloda politika
 *   OLABILIR ve yine de moderator sifir satir gorebilir — bugunku kusur tam olarak budur.
 *
 * ── NICIN VAR ────────────────────────────────────────────────────────────────────────
 * Rol sayfayi ACIYOR, RLS satir VERMIYOR, ekran "kayit yok" basiyor — *yetkin yok* DEMIYOR.
 * Buna **sessiz-bos** diyoruz. 2026-08-20'de `moderator` listesi 17 rotadan 6'ya indirildi;
 * o daraltma ELLE olculmustu. Elle olculen sey ay sonra bayatlar ve bayatladigini kimse
 * gormez — cunku bayatligin belirtisi de "bos ekran"dir. Bu betik o olcumu TEKRARLANABILIR
 * kilar. INV-RBAC-DRIFT-1 kapisi kod↔kod suruklenmesini tutar; DB↔UI tarafi BURASIDIR.
 *
 * ── NASIL OLCER (davranissal, metinsel DEGIL) ────────────────────────────────────────
 * Her (rol, rota, tablo) ucusu icin, islem icinde kimlik takarak satir sayar:
 *     begin;
 *       select set_config('request.jwt.claims', '{"sub":..,"user_role":"moderator",..}', true);
 *       set local role authenticated;      -- claim'den SONRA
 *       select count(*) from <tablo> limit 1;
 *     rollback;
 * Yalniz SELECT kosar; hicbir yazma yoktur ve her kol rollback ile kapanir.
 *
 * ⚠ KOR OLCUM KILIDI: ayni sayim `admin` kimligiyle de kosar (KABUL KOLU). Admin de sifir
 * goruyorsa sonda KORDUR (tablo bos, ad yanlis, ya da kimlik takma calismiyor) ve o ucus
 * **OLCULEMEDI** olarak isaretlenir — "gecti" DEMEZ. Tek basina RED gozlemi "kanal kapali"
 * ile ayirt edilemez; bu yuzden kabul kolu zorunludur.
 *
 * ── YUKLEM AILELERI — olcumun NEREDE gecerli oldugu (2026-08-20, AUTH tespiti) ───────
 * Kimlik takma her yuklemi sinayamaz. Aile METINDEN DEGIL DAVRANISTAN turetilir, cunku
 * metin yaniltiyor: `is_admin_user()` de govdesinde `user_profiles` okur ama JWT dali KISA
 * DEVRE yapar ve sahte uid ile `true` doner; `is_user_admin(uid)` ayni iddia altinda `false`
 * doner. Fark metinde YOK, davranista VAR — bu yuzden betik her yardimciyi admin iddiasi
 * altinda CAGIRIR ve sonuca gore siniflandirir.
 *   (A) JWT onurunu koruyan yuklem            → yontem GECERLI
 *   (B) Profil satirina bagimli yuklem        → yontem KOR; sahte uid'in satiri yok, yuklem
 *                                               tablo DOLU olsa bile her zaman false doner.
 *                                               (B)'deki her "0 satir" OLCUM DEGIL ARTIFAKTTIR.
 *   (C) Rol yuklemi hic yok (tenant_id = ...)  → rol SINANMIYOR; satir gormek yetkiyi
 *                                               KANITLAMAZ, yalnizca yuzeyin rolden bagimsiz
 *                                               acik oldugunu gosterir.
 * Hukum yalniz (A) tablolarindan kurulur; (B) hukme katilmaz, (C) ayrica isaretlenir.
 *
 * ⚠ NEGATIF KONTROL YETMEZ: kontrol kolumuz (`is_admin_user()` admin'de true, moderator'de
 * false) (A) ailesindendi ve GECTI — kor oldugumuz aile (B) idi. **Kontrol kolu, kor oldugun
 * aileden secilmezse korlugu gizler.**
 *
 * ── AILE SINIFLANDIRMASININ IKI SINIRI (LEGAL / #719 ile mutabik) ────────────────────
 *
 * 1. SINIF (TABLO, KOMUT) BASINADIR, TABLO BASINA DEGIL. Ayni tablo SELECT'te (C),
 *    yazmada (B) olabilir — `products` ve `categories` canli ornegidir: okuma yuklemi
 *    yalniz `tenant_id`, yazma yuklemi `user_profiles`'a JOIN eder. Bu betik YALNIZ SELECT
 *    olcer ve sorgusu `cmd in ('SELECT','ALL')` ile SINIRLIDIR; dolayisiyla urettigi harita
 *    "tablo → aile" degil **"(tablo, SELECT) → aile"** haritasidir. Ciktiyi yazma tarafina
 *    TASIMAK yaniltir.
 *
 * 2. ONKOSUL, ADIYLA TASINIYOR: (A)/(B) ayrimi **JWT icinde `user_role` claim'inin BULUNDUGU**
 *    varsayimina dayanir. Claim yoksa `is_admin_user()` yedek daline duser ve `user_profiles`
 *    okur — yani (A) ailesi FIILEN (B) gibi calisir ve bu betigin "olculebilir" dedigi
 *    tablolar da olculemez hale gelir.
 *    Bu varsayim **SQL'den dogrulanamaz**: custom access token hook'unun acik olup olmadigi
 *    veritabani katalogunda degil, projenin auth yapilandirmasinda yasar. Yani otorite burada
 *    DB DEGIL, Supabase auth ayaridir. Betik bunu OLCMEZ; **varsayim olarak beyan eder.**
 *    Yesil verirken neyi varsaydigini soylememis olmamak icin burada yazilidir.
 *
 * ── BU BETIGIN OLCMEDIGI ─────────────────────────────────────────────────────────────
 *  1. YAZMA yolunu olcmez — yalniz SELECT. `canWrite`/`ROLE_WRITE_ACCESS` ayri sorudur.
 *  2. Rota→tablo haritasini STATIK import yuruyusuyle cikarir. Kosul icinde secilen tablo
 *     adi, sablon dizgesiyle kurulan ad, ya da RPC arkasindaki tablo GORUNMEZ. Bu yuzden
 *     "tablo bulunamadi" sonucu OLCULEMEDI'dir, "temiz" degil.
 *  3. `sub` olarak SENTETIK bir UUID kullanir. "Kendi satirin VEYA admin" bicimli politikalar
 *     bu kimlige dogal olarak sifir satir verir — bu DOGRU semantiktir (yonetim ekrani olarak
 *     bos demektir), ama bir MUSTERI kimligiyle olculmus degildir ve oyle okunmamalidir.
 *  4. `super_admin`/`admin` gibi `'*'` tasiyan roller atlanir; onlarda vaat zaten "her sey".
 *
 * ── KOSTURMA ─────────────────────────────────────────────────────────────────────────
 *   SUPABASE_DB_URL=... node scripts/db/checks/rbac-ui-db-parity.mjs [--json] [--rol moderator]
 * Baglanti dizesi yoksa cikis kodu 2'dir ve "OLCULEMEDI" der — "gecti" DEMEZ.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KOK = path.resolve(__dirname, '../../..')
const CA_PATH = path.join(__dirname, 'supabase-root-2021-ca.pem')
const RBAC_PATH = path.join(KOK, 'src/lib/rbac.ts')
const ADMIN_ROTA_KOKU = path.join(KOK, 'src/app/admin')

/** Politikalarin `auth.uid()` dalina dusen sentetik kimlik. Gercek bir kullanici DEGIL. */
const SENTETIK_SUB = '00000000-0000-4000-8000-0000000d1f7a'

/** `'*'` tasidigi icin olculmesi anlamsiz olan roller. */
const ATLANAN_ROLLER = new Set(['super_admin', 'admin'])

// ─────────────────────────────────────────────────────────────────────────────
// 1) ROLE_PAGE_ACCESS'i oku
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `rbac.ts` bir TS modulu; node .mjs onu import EDEMEZ. Bu yuzden metinden okunur.
 * Ayristirma DAR tutuldu: yalniz `ROLE_PAGE_ACCESS` govdesi, yalniz `rol: [ '...' ]` bicimi.
 * Bicim degisirse sonuc BOSALIR — asagidaki saglik kilidi bunu kirmizi yapar, sessizce
 * "ihlal yok" demez.
 */
function rolSayfaMatrisi() {
    const metin = fs.readFileSync(RBAC_PATH, 'utf8')
    const bas = metin.indexOf('const ROLE_PAGE_ACCESS')
    if (bas < 0) return {}
    // Govdeyi ilk `};` ile sinirla — icerideki diziler `]` ile biter, `};` ile bitmez.
    const son = metin.indexOf('\n};', bas)
    const govde = metin.slice(bas, son < 0 ? metin.length : son)

    const cikti = {}
    for (const m of govde.matchAll(/^\s{4}([a-z_]+):\s*\[([^\]]*)\]/gm)) {
        const rol = m[1]
        const rotalar = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1])
        cikti[rol] = rotalar
    }
    return cikti
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Rota → tablolar (gecisli import yuruyusu)
// ─────────────────────────────────────────────────────────────────────────────

const UZANTILAR = ['.ts', '.tsx', '/index.ts', '/index.tsx']

/** `@/x` ve goreli yollari gercek dosyaya cozer; cozemezse null (harici paket). */
function dosyayaCoz(spec, kaynakDosya) {
    let taban
    if (spec.startsWith('@/')) taban = path.join(KOK, 'src', spec.slice(2))
    else if (spec.startsWith('.')) taban = path.resolve(path.dirname(kaynakDosya), spec)
    else return null
    for (const u of UZANTILAR) {
        const aday = taban + u
        if (fs.existsSync(aday) && fs.statSync(aday).isFile()) return aday
    }
    return fs.existsSync(taban) && fs.statSync(taban).isFile() ? taban : null
}

/**
 * Yorumlari cikar. GEREKCE olculdu: `ensureSessionFresh.ts` bir JSDoc ORNEGINDE
 * `supabase.from('table').select()` yaziyor ve ham tarama bunu GERCEK bir tablo sandi —
 * kuru kosuda `table` adli hayali bir tablo bes rotada birden gorundu. Ornek kod, kod
 * DEGILDIR. Blok yorumlar ve tam-satir `//` yorumlari dusuruluyor; satir ICI yorumlara
 * dokunulmuyor cunku dizgede gecen `//` (URL) dizisini yemek gercek cagriyi kaybettirirdi.
 */
function yorumsuz(metin) {
    return metin
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((s) => {
            const t = s.trim()
            return !t.startsWith('//') && !t.startsWith('*')
        })
        .join('\n')
}

/** Statik `import ... from '..'` VE dinamik `import('..')` — page.tsx ikincisini kullanir. */
function importSpecleri(metin) {
    const out = []
    for (const m of metin.matchAll(/from\s*'([^']+)'/g)) out.push(m[1])
    for (const m of metin.matchAll(/import\(\s*'([^']+)'\s*\)/g)) out.push(m[1])
    return out
}

/**
 * Rotanin okudugu tablolar. Yuruyu `src/` icinde kalir, her dosyayi bir kez gezer.
 * `.from('tablo')` disindaki erisim bicimleri (RPC, degisken tablo adi) GORUNMEZ — bu
 * betigin bilinen sinirlarindandir ve dosya basinda yazilidir.
 */
function rotaninTablolari(rota) {
    const segment = rota.replace(/^\/admin\/?/, '')
    const sayfa = segment
        ? path.join(ADMIN_ROTA_KOKU, segment, 'page.tsx')
        : path.join(ADMIN_ROTA_KOKU, 'page.tsx')
    if (!fs.existsSync(sayfa)) return { tablolar: [], dosyaSayisi: 0, sayfaVar: false }

    const gezilen = new Set()
    const tablolar = new Set()
    const kuyruk = [sayfa]
    while (kuyruk.length) {
        const dosya = kuyruk.shift()
        if (gezilen.has(dosya)) continue
        gezilen.add(dosya)
        let ham
        try {
            ham = fs.readFileSync(dosya, 'utf8')
        } catch {
            continue
        }
        const metin = yorumsuz(ham)
        for (const m of metin.matchAll(/\.from\(\s*'([a-z_][a-z0-9_]*)'/g)) tablolar.add(m[1])
        for (const spec of importSpecleri(metin)) {
            const hedef = dosyayaCoz(spec, dosya)
            if (hedef && hedef.startsWith(path.join(KOK, 'src'))) kuyruk.push(hedef)
        }
    }
    return { tablolar: [...tablolar].sort(), dosyaSayisi: gezilen.size, sayfaVar: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Canli olcum
// ─────────────────────────────────────────────────────────────────────────────

function tlsAyari() {
    if (!fs.existsSync(CA_PATH)) return { rejectUnauthorized: true }
    return { ca: fs.readFileSync(CA_PATH, 'utf8'), rejectUnauthorized: true }
}

function claimler(rol) {
    // `is_admin_user()` once JWT'ye bakar; iki alani da yaziyoruz cunku canli tanim
    // `user_role` VE `app_metadata.user_role` dallarini ayri ayri deniyor.
    return JSON.stringify({
        sub: SENTETIK_SUB,
        role: 'authenticated',
        user_role: rol,
        app_metadata: { user_role: rol },
    })
}

/**
 * Tek (rol, tablo) ucusu. Hata satir sayisi degil KANITTIR: RLS reddi ile "tablo yok"
 * ayri seylerdir ve ayri raporlanir.
 */
/**
 * YUKLEM AILESI — kimlik takma yonteminin O TABLODA gecerli olup olmadigini belirler.
 * AUTH'un 2026-08-20 tespiti; kendi tablolarimda `pg_policies` ile dogrulandi.
 *
 *   (A) JWT-OKUYAN  — `is_admin_user()`, `jwt_tenant_id()`. Sahte kimlik bunlari DOGRU sinar.
 *   (B) PROFIL-JOIN — `EXISTS (... FROM user_profiles up WHERE up.id = auth.uid() ...)`.
 *                     Sahte uid'in `user_profiles`'ta SATIRI YOK; yuklem HER ZAMAN false
 *                     doner, tablo dolu olsa ve rol dogru olsa bile. Yontem burada KORDUR.
 *   (C) ROL YUKLEMI YOK — yalniz `tenant_id = jwt_tenant_id()` gibi. Rol hic sorulmaz;
 *                     "rol satir goruyor" sonucu rolun YETKILI oldugunu KANITLAMAZ.
 *
 * NICIN ZORUNLU: negatif kontrolumuz (`is_admin_user()` admin'de true, moderator'de false)
 * (A) ailesindendi ve GECTI — kor oldugumuz aile (B) idi. **Kontrol kolu, kor oldugun
 * aileden secilmezse korlugu gizler.**
 */
async function yuklemAileleri(client, tablolar) {
    // 1) YALNIZ tarayicidan gecerli politikalar. `service_role` politikalari `qual = true`
    //    tasir ve rol suzgeci OLMADAN bakilirsa "rol yuklemi yok" gibi gorunur — kendi
    //    siniflandiricimda yakaladigim korluk buydu. Kisit `roles` sutunundadir, qual'de degil.
    const { rows } = await client.query(
        `select tablename, coalesce(qual,'') as qual
           from pg_policies
          where schemaname = 'public' and cmd in ('SELECT','ALL')
            and ('authenticated' = any(roles) or 'public' = any(roles))
            and tablename = any($1::text[])`,
        [tablolar],
    )

    // 2) Yuklemlerde gecen public fonksiyonlarini topla ve HER BIRINI DAVRANISSAL SINA.
    //    Metinle siniflandirmak YANLIS sonuc verir: `is_admin_user()` de govdesinde
    //    `user_profiles` okur, ama JWT dali KISA DEVRE yapar ve sahte uid ile true doner.
    //    `is_user_admin(uid)` ayni iddia altinda false doner. Fark metinde YOK, davranista VAR.
    const adaylar = new Set()
    for (const r of rows) for (const m of r.qual.matchAll(/([a-z_][a-z0-9_]*)\s*\(/g)) adaylar.add(m[1])

    const jwtOnuruKoruyan = new Set() // (A) — admin iddiasi sahte uid ile de gecer
    for (const fn of adaylar) {
        for (const cagri of [`public.${fn}()`, `public.${fn}((select auth.uid()))`]) {
            try {
                await client.query('begin')
                await client.query('select set_config($1,$2,true)', [
                    'request.jwt.claims',
                    claimler('admin'),
                ])
                await client.query('set local role authenticated')
                const { rows: r2 } = await client.query(`select ${cagri} as v`)
                if (r2[0].v === true) jwtOnuruKoruyan.add(fn)
            } catch {
                /* imza uymadi ya da fonksiyon degil — aday listesi zaten genis tutuldu */
            } finally {
                await client.query('rollback').catch(() => {})
            }
        }
    }

    // 3) Tablo bazinda hukum. Oncelik sirasi gerekcelidir:
    //    (C) once — rolden bagimsiz bir dal varsa satirlar ROLE RAGMEN gelir, olcum rolu sinamaz.
    //    (A) sonra — jwt onurunu koruyan bir yuklem varsa sahte kimlik DOGRU sinar.
    //    (B) en son — geriye kalan profil-bagimli yuklemlerde yontem KORDUR.
    const harita = {}
    for (const t of tablolar) {
        const q = rows.filter((r) => r.tablename === t).map((r) => r.qual)
        if (!q.length) {
            harita[t] = 'B' // politikasi yok ya da yalniz service_role — tarayici goremez
            continue
        }
        const fnleri = (x) => [...x.matchAll(/([a-z_][a-z0-9_]*)\s*\(/g)].map((m) => m[1])
        const rolsuz = q.some(
            (x) =>
                !x.includes('user_profiles') &&
                !x.includes('auth.uid()') &&
                !fnleri(x).some((f) => adaylar.has(f) && f !== 'jwt_tenant_id' && f !== 'select'),
        )
        if (rolsuz) harita[t] = 'C'
        else if (q.some((x) => fnleri(x).some((f) => jwtOnuruKoruyan.has(f)))) harita[t] = 'A'
        else if (q.some((x) => x.includes('user_profiles') || fnleri(x).some((f) => adaylar.has(f) && !jwtOnuruKoruyan.has(f) && f !== 'jwt_tenant_id')))
            harita[t] = 'B'
        else harita[t] = 'A' // yalniz `user_id = auth.uid()` — olculebilir, sonuc dogru semantiktir
    }
    return harita
}

async function satirSayisi(client, rol, tablo) {
    try {
        await client.query('begin')
        await client.query('select set_config($1, $2, true)', ['request.jwt.claims', claimler(rol)])
        await client.query('set local role authenticated')
        const { rows } = await client.query(`select count(*)::int as n from public.${tablo}`)
        return { n: rows[0].n, hata: null }
    } catch (e) {
        return { n: null, hata: `${e.code || '?'} ${e.message}` }
    } finally {
        await client.query('rollback').catch(() => {})
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) Ana akis
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    const asJson = process.argv.includes('--json')
    const rolIdx = process.argv.indexOf('--rol')
    const sadeceRol = rolIdx > -1 ? process.argv[rolIdx + 1] : null
    const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

    const matris = rolSayfaMatrisi()
    const roller = Object.keys(matris).filter(
        (r) => !ATLANAN_ROLLER.has(r) && (!sadeceRol || r === sadeceRol),
    )

    // DEDEKTOR SAGLIGI — ayristirma bosalirsa rapor "ihlal yok" der ve KOR kosar.
    if (Object.keys(matris).length < 4) {
        console.error(
            `rbac-ui-db-parity: OLCULEMEDI — ROLE_PAGE_ACCESS ayristirmasi bos/dar dondu ` +
                `(${Object.keys(matris).length} rol). rbac.ts bicimi degismis olabilir.`,
        )
        process.exit(2)
    }
    // KURU KOSU: statik yari (matris ayristirmasi + rota->tablo yuruyusu) DB olmadan
    // dogrulanabilsin. Betigin kendi gozunu sinamanin ucuz yolu budur; "tablo bulunamadi"
    // sonuclarinin gercek mi yoksa yuruyus kusuru mu oldugu ancak boyle ayirt edilir.
    if (process.argv.includes('--kuru')) {
        console.log('KURU KOSU — canli olcum YOK, yalniz statik yari\n')
        for (const rol of roller) {
            for (const rota of matris[rol]) {
                const { tablolar, dosyaSayisi, sayfaVar } = rotaninTablolari(rota)
                const durum = !sayfaVar
                    ? 'page.tsx YOK'
                    : tablolar.length
                      ? `${dosyaSayisi} dosya -> ${tablolar.join(', ')}`
                      : `${dosyaSayisi} dosya -> .from() BULUNAMADI`
                console.log(`${rol.padEnd(11)} ${rota.padEnd(30)} ${durum}`)
            }
        }
        return
    }
    if (!connectionString) {
        console.error(
            'rbac-ui-db-parity: OLCULEMEDI — SUPABASE_DB_URL yok. Bu "gecti" DEGILDIR; ' +
                'olcum hic kosmadi.',
        )
        process.exit(2)
    }

    const vardi = /[?&]sslmode=/.test(connectionString)
    const temiz = connectionString.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
    if (vardi) console.log('rbac-ui-db-parity: baglanti dizesindeki sslmode kaldirildi')

    // 'pg' BILEREK gec yukleniyor: kuru kosu (--kuru) bagimlilik kurulmamis bir agacta da
    // calisabilmeli, yoksa betigin statik yarisini dogrulamak icin once pnpm install gerekirdi.
    const { default: pg } = await import('pg')
    const client = new pg.Client({ connectionString: temiz, ssl: tlsAyari() })
    await client.connect()

    // Yuklem ailelerini TEK sorguda topla — her (rol,rota) icin tekrar sormak gereksiz
    // yuk olurdu ve ayni cevabi verirdi.
    const tumTablolar = [
        ...new Set(roller.flatMap((r) => matris[r].flatMap((rota) => rotaninTablolari(rota).tablolar))),
    ]
    const aileler = await yuklemAileleri(client, tumTablolar)

    const sonuc = []
    try {
        for (const rol of roller) {
            for (const rota of matris[rol]) {
                const { tablolar, dosyaSayisi, sayfaVar } = rotaninTablolari(rota)
                if (!sayfaVar) {
                    sonuc.push({ rol, rota, hukum: 'OLCULEMEDI', sebep: 'page.tsx bulunamadi' })
                    continue
                }
                if (tablolar.length === 0) {
                    sonuc.push({
                        rol,
                        rota,
                        hukum: 'OLCULEMEDI',
                        sebep: `import yuruyusu ${dosyaSayisi} dosya gezdi, .from() bulamadi`,
                    })
                    continue
                }
                const olcumler = []
                for (const tablo of tablolar) {
                    const rolSonuc = await satirSayisi(client, rol, tablo)
                    const adminSonuc = await satirSayisi(client, 'admin', tablo) // KABUL KOLU
                    olcumler.push({ tablo, rol: rolSonuc, admin: adminSonuc })
                }
                // Once YUKLEM AILESI, sonra sayi. Sayiyi aileden once okumak, bugun
                // dustugumuz tuzagin ta kendisi: (B) ailesinde 'sifir satir' bir OLCUM
                // degil YONTEM ARTIFAKTIDIR ve 'yetkisiz' diye okunur.
                const aile = (t) => aileler[t] || 'A'
                const kor = olcumler.filter((o) => aile(o.tablo) === 'B')
                const rolsuz = olcumler.filter((o) => aile(o.tablo) === 'C')
                const olculebilir = olcumler.filter((o) => aile(o.tablo) === 'A')
                // Kabul kolu: admin de goremiyorsa o tablo hakkinda hukum verilmez.
                const gorunur = olculebilir.filter((o) => (o.admin.n ?? 0) > 0)
                const rolGoren = gorunur.filter((o) => (o.rol.n ?? 0) > 0)
                let hukum, sebep
                if (gorunur.length === 0) {
                    hukum = 'OLCULEMEDI'
                    const parca = []
                    if (kor.length) parca.push(`${kor.length} tablo (B) ailesi — sahte uid ile YONTEM KOR`)
                    if (rolsuz.length) parca.push(`${rolsuz.length} tablo rol yuklemi TASIMIYOR`)
                    if (!parca.length) parca.push('admin kimligi de sifir satir gordu — sonda KOR')
                    sebep = parca.join('; ')
                } else if (rolGoren.length === 0) {
                    hukum = 'VAAT-BOS'
                    sebep = `admin ${gorunur.length} olculebilir tabloda satir goruyor, ${rol} HICBIRINDE gormuyor`
                } else if (rolGoren.length < gorunur.length) {
                    hukum = 'KISMI'
                    sebep = `${rolGoren.length}/${gorunur.length} olculebilir tabloda satir var`
                } else {
                    hukum = 'TUTARLI'
                    sebep = `${gorunur.length}/${gorunur.length} olculebilir tabloda satir var`
                }
                if (rolsuz.length) {
                    sebep += ` · ${rolsuz.length} tablo ROL-KAPISI YOK (satir gormek yetkiyi kanitlamaz)`
                }
                if (kor.length && hukum !== 'OLCULEMEDI') {
                    sebep += ` · ${kor.length} tablo (B) ailesi, hukme KATILMADI`
                }
                sonuc.push({ rol, rota, hukum, sebep, olcumler, aileler: Object.fromEntries(olcumler.map((o) => [o.tablo, aile(o.tablo)])) })
            }
        }
    } finally {
        await client.end()
    }

    if (asJson) {
        console.log(JSON.stringify({ uretildi: new Date().toISOString(), sonuc }, null, 2))
        return
    }

    const sayac = {}
    for (const s of sonuc) sayac[s.hukum] = (sayac[s.hukum] || 0) + 1
    console.log('\nRBAC UI<->DB PARITE KARNESI')
    console.log('='.repeat(72))
    for (const s of sonuc) {
        console.log(`${s.hukum.padEnd(12)} ${s.rol.padEnd(11)} ${s.rota.padEnd(30)} ${s.sebep}`)
        if (s.hukum === 'VAAT-BOS' || s.hukum === 'KISMI') {
            for (const o of s.olcumler) {
                const r = o.rol.hata ? `HATA ${o.rol.hata}` : `${o.rol.n} satir`
                const a = o.admin.hata ? `HATA ${o.admin.hata}` : `${o.admin.n} satir`
                console.log(`             · ${o.tablo.padEnd(28)} ${s.rol}=${r}  admin=${a}`)
            }
        }
    }
    console.log('='.repeat(72))
    console.log(
        Object.entries(sayac)
            .map(([k, v]) => `${k}=${v}`)
            .join('  '),
    )
    console.log(
        '\nNOT: bu bir KAPI DEGIL rapordur. VAAT-BOS = arayuz sayfayi vaat ediyor, DB satir ' +
            'vermiyor (sessiz-bos). OLCULEMEDI "temiz" DEGILDIR — neyin olculemedigi ' +
            'yukarida yazilidir.',
    )
}

main().catch((e) => {
    console.error('rbac-ui-db-parity: OLCULEMEDI —', e.message)
    process.exit(2)
})
