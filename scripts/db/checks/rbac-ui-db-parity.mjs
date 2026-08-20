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
                // Kor sonda: admin de goremiyorsa o tablo hakkinda hukum verilmez.
                const gorunur = olcumler.filter((o) => (o.admin.n ?? 0) > 0)
                const rolGoren = gorunur.filter((o) => (o.rol.n ?? 0) > 0)
                let hukum, sebep
                if (gorunur.length === 0) {
                    hukum = 'OLCULEMEDI'
                    sebep = 'admin kimligi de sifir satir gordu — sonda KOR'
                } else if (rolGoren.length === 0) {
                    hukum = 'VAAT-BOS'
                    sebep = `admin ${gorunur.length} tabloda satir goruyor, ${rol} HICBIRINDE gormuyor`
                } else if (rolGoren.length < gorunur.length) {
                    hukum = 'KISMI'
                    sebep = `${rolGoren.length}/${gorunur.length} tabloda satir var`
                } else {
                    hukum = 'TUTARLI'
                    sebep = `${gorunur.length}/${gorunur.length} tabloda satir var`
                }
                sonuc.push({ rol, rota, hukum, sebep, olcumler })
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
