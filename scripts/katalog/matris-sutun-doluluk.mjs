#!/usr/bin/env node
/**
 * MATRİS SÜTUN DOLULUK ÖLÇÜMÜ — REC-141 / URUN kalem 5
 *
 * NİÇİN VAR (Recep kararı K13, 2026-09-04): liste sayfaları MATRİS görünümü alacak ve
 * varsayılan görünüm Tablo olacak. Ama teknik alanlar üründen ürüne değişiyor: bir grupta
 * dolu olan sütun, başka grupta tamamen boş. Yarısı boş bir tablo çizilmez. Bu yüzden
 * Design'a gitmeden ÖNCE, hangi sütunun hangi grupta kaç üründe dolu olduğu CANLI VERİDEN
 * ölçülür.
 *
 * ⭐ÖLÇÜT (K13, OPS hükmü — burada YAZILI, çünkü kaydedilmeyen ölçüt yeniden üretilemez):
 *   · doluluk >= %60          → MATRİSE GİRER (ortak sütun)
 *   · %30 <= doluluk < %60    → GİZLENEBİLİR İKİNCİL sütun
 *   · doluluk < %30           → yalnız ÜRÜN SAYFASINDA
 * Sınırlar dahil/hariç kasıtlı: 60 dahil, 30 dahil. "Yaklaşık %60" diye bir şey yok.
 *
 * ⭐GRUP TANIMI (ölçümün evreni — yanlış evren, keskin ölçütü de çöpe atar):
 * Ürünün grubu = bulunduğu DAL (`products.subcategory_id`). Dalı yoksa üst kategori
 * (`products.category_id`). Sebep: liste sayfası dal/seri bazında çiziliyor (K13), üst
 * kategori sayfası da aynı şablonun bir modu. Silinmiş ürün (`deleted_at`) sayılmaz.
 *
 * ⭐DOLU SAYILMA KURALI: anahtar VAR + değeri null DEĞİL + boşluk kırpılınca boş dize DEĞİL.
 * "Anahtar var" tek başına yetmez — boş dize taşıyan alan tabloda boş hücre demektir.
 *
 * KULLANIM (iki kip — doğrudan DB bağlantısı bu makinede güvenilir değil, REC-124'te ölçüldü):
 *   node scripts/katalog/matris-sutun-doluluk.mjs --sql
 *       → çalıştırılacak SQL'i basar (deterministik, elle yazılmaz).
 *   node scripts/katalog/matris-sutun-doluluk.mjs --rapor olcum.json
 *       → o SQL'in JSON çıktısını okur, kovaları uygular, raporu üretir.
 *
 * FAIL-CLOSED: beklenmeyen şekil, sıfır ürünlü grup ya da eksik alan → çıkış 1, rapor YAZILMAZ.
 * Sessizce boş rapor üretmek, ölçüm yapmamaktan kötüdür: karar onun üzerine kurulur.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** K13 eşikleri — tek yer. */
export const ESIK_MATRIS = 60
export const ESIK_IKINCIL = 30

/** Doluluk yüzdesinden kova adı. Sınırlar dahil (>=). */
export function kova(yuzde) {
    if (yuzde >= ESIK_MATRIS) return 'matris'
    if (yuzde >= ESIK_IKINCIL) return 'ikincil'
    return 'urun-sayfasi'
}

const SQL = `-- MATRİS SÜTUN DOLULUK — grup x anahtar (REC-141, URUN kalem 5)
-- Grup = dal (subcategory_id), yoksa üst kategori (category_id). Silinmiş ürün sayılmaz.
with urun as (
  select p.id,
         coalesce(p.subcategory_id, p.category_id) as grup_id,
         p.technical_specs as spec
  from products p
  where p.deleted_at is null
),
grup as (
  select u.grup_id,
         c.name  as grup_ad,
         c.slug  as grup_slug,
         c.level as grup_seviye,
         c.is_active as grup_aktif,
         count(*) as urun_sayisi
  from urun u
  join categories c on c.id = u.grup_id
  group by u.grup_id, c.name, c.slug, c.level, c.is_active
),
dolu as (
  select u.grup_id,
         k.key as anahtar,
         count(*) as dolu_sayisi
  from urun u,
       lateral jsonb_object_keys(coalesce(u.spec, '{}'::jsonb)) as k(key)
  where u.spec -> k.key is not null
    and jsonb_typeof(u.spec -> k.key) <> 'null'
    and btrim(coalesce(u.spec ->> k.key, '')) <> ''
  group by u.grup_id, k.key
)
select g.grup_id, g.grup_ad, g.grup_slug, g.grup_seviye, g.grup_aktif,
       g.urun_sayisi, d.anahtar, d.dolu_sayisi
from grup g
left join dolu d on d.grup_id = g.grup_id
order by g.grup_ad, d.dolu_sayisi desc nulls last, d.anahtar;`

function hata(mesaj) {
    process.stderr.write(`HATA: ${mesaj}\n`)
    process.exit(1)
}

function raporUret(satirlar) {
    if (!Array.isArray(satirlar) || satirlar.length === 0) {
        hata('ölçüm boş — fail-closed. Boş rapor, ölçüm yapmamaktan KÖTÜDÜR.')
    }
    const gruplar = new Map()
    for (const s of satirlar) {
        for (const alan of ['grup_id', 'grup_ad', 'urun_sayisi']) {
            if (s[alan] === undefined) hata(`satırda "${alan}" alanı YOK — SQL çıktısı beklenen şekilde değil.`)
        }
        const n = Number(s.urun_sayisi)
        if (!Number.isFinite(n) || n <= 0) hata(`grup "${s.grup_ad}" ürün sayısı ${s.urun_sayisi} — sıfıra bölme riski, fail-closed.`)
        if (!gruplar.has(s.grup_id)) {
            gruplar.set(s.grup_id, {
                ad: s.grup_ad, slug: s.grup_slug, seviye: s.grup_seviye,
                aktif: s.grup_aktif, urun: n, anahtarlar: [],
            })
        }
        if (s.anahtar == null) continue
        const dolu = Number(s.dolu_sayisi)
        if (!Number.isFinite(dolu)) hata(`"${s.grup_ad}/${s.anahtar}" dolu sayısı sayı değil.`)
        if (dolu > n) hata(`"${s.grup_ad}/${s.anahtar}": dolu ${dolu} > ürün ${n}. İmkânsız — evren yanlış.`)
        const yuzde = (dolu / n) * 100
        gruplar.get(s.grup_id).anahtarlar.push({ anahtar: s.anahtar, dolu, yuzde, kova: kova(yuzde) })
    }

    const sirali = [...gruplar.values()].sort((a, b) => b.urun - a.urun)
    const yuzdeYaz = (y) => `%${y.toFixed(1).replace('.0', '')}`

    const satir = []
    satir.push('# Matris sütun doluluk ölçümü — 2026-09-05')
    satir.push('')
    satir.push('> **Üretilmiş belge.** Kaynak: `scripts/katalog/matris-sutun-doluluk.mjs`.')
    satir.push('> Elle düzenlenmez; sayı değişecekse betik yeniden koşulur.')
    satir.push('')
    satir.push('## Niçin ölçüldü')
    satir.push('')
    satir.push('Liste sayfaları matris (tablo) görünümü alacak (karar K13). Teknik alanlar aileye göre')
    satir.push('değiştiği için, bir grupta dolu olan sütun başka grupta tamamen boş olabilir. Yarısı boş')
    satir.push('tablo çizilmez — bu yüzden Design liste şablonunu çizmeden önce doluluk **canlı veriden**')
    satir.push('ölçülür.')
    satir.push('')
    satir.push('## Ölçüt (K13)')
    satir.push('')
    satir.push(`| Kova | Aralık | Anlamı |`)
    satir.push(`|---|---|---|`)
    satir.push(`| **matris** | doluluk ≥ %${ESIK_MATRIS} | Grubun matrisine sütun olarak girer |`)
    satir.push(`| **ikincil** | %${ESIK_IKINCIL} ≤ doluluk < %${ESIK_MATRIS} | Gizlenebilir ikincil sütun |`)
    satir.push(`| **ürün sayfası** | doluluk < %${ESIK_IKINCIL} | Matrise girmez, yalnız ürün sayfasında |`)
    satir.push('')
    satir.push('**Grup** = ürünün dalı (`subcategory_id`), dalı yoksa üst kategorisi (`category_id`).')
    satir.push('**Dolu** = anahtar var **ve** değeri null değil **ve** boşluk kırpılınca boş dize değil.')
    satir.push('Silinmiş ürün (`deleted_at`) sayılmaz.')
    satir.push('')

    const toplamUrun = sirali.reduce((n, g) => n + g.urun, 0)
    satir.push('## Özet')
    satir.push('')
    satir.push(`- Grup sayısı: **${sirali.length}**`)
    satir.push(`- Ölçülen ürün: **${toplamUrun}**`)
    satir.push(`- Matrise giren sütun taşıyan grup: **${sirali.filter(g => g.anahtarlar.some(a => a.kova === 'matris')).length}**`)
    satir.push(`- Hiç matris sütunu OLMAYAN grup: **${sirali.filter(g => !g.anahtarlar.some(a => a.kova === 'matris')).length}**`)
    satir.push('')

    satir.push('## Grup grup doluluk')
    satir.push('')
    for (const g of sirali) {
        const durum = g.aktif === false ? ' · ⚠pasif' : ''
        satir.push(`### ${g.ad} — ${g.urun} ürün${durum}`)
        satir.push('')
        satir.push(`\`${g.slug ?? '—'}\` · seviye ${g.seviye ?? '—'}`)
        satir.push('')
        const matris = g.anahtarlar.filter(a => a.kova === 'matris')
        const ikincil = g.anahtarlar.filter(a => a.kova === 'ikincil')
        const digerN = g.anahtarlar.filter(a => a.kova === 'urun-sayfasi').length
        if (matris.length === 0) {
            satir.push('⚠**Matrise girecek sütun YOK.** Bu grupta hiçbir alan %60 eşiğini geçmiyor;')
            satir.push('tablo görünümü bu grupta ya boş kalır ya da tek tük hücreyle çizilir.')
            satir.push('')
        } else {
            satir.push('| Sütun | Dolu | Doluluk |')
            satir.push('|---|---:|---:|')
            for (const a of matris) satir.push(`| \`${a.anahtar}\` | ${a.dolu}/${g.urun} | ${yuzdeYaz(a.yuzde)} |`)
            satir.push('')
        }
        if (ikincil.length > 0) {
            satir.push(`**İkincil (gizlenebilir):** ${ikincil.map(a => `\`${a.anahtar}\` ${yuzdeYaz(a.yuzde)}`).join(' · ')}`)
            satir.push('')
        }
        if (digerN > 0) {
            satir.push(`**Yalnız ürün sayfasında:** ${digerN} alan (%${ESIK_IKINCIL} altı).`)
            satir.push('')
        }
    }

    satir.push('## Katalog geneli ortak sütun adayları')
    satir.push('')
    satir.push('Bir sütunun "katalog geneli ortak" sayılabilmesi için **grupların çoğunda** matris kovasında')
    satir.push('olması gerekir. Aşağıdaki sayı, o anahtarın kaç grupta matris kovasına düştüğüdür.')
    satir.push('')
    const grupBasi = new Map()
    for (const g of sirali) {
        for (const a of g.anahtarlar) {
            if (a.kova !== 'matris') continue
            grupBasi.set(a.anahtar, (grupBasi.get(a.anahtar) ?? 0) + 1)
        }
    }
    const ortak = [...grupBasi.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    if (ortak.length === 0) {
        satir.push('⚠Hiçbir anahtar hiçbir grupta matris kovasına düşmedi.')
    } else {
        satir.push('| Sütun | Matris kovasında olduğu grup sayısı |')
        satir.push('|---|---:|')
        for (const [k, n] of ortak) satir.push(`| \`${k}\` | ${n} / ${sirali.length} |`)
    }
    satir.push('')

    return satir.join('\n') + '\n'
}

const argv = process.argv.slice(2)
if (argv[0] === '--sql') {
    process.stdout.write(SQL + '\n')
} else if (argv[0] === '--rapor') {
    if (!argv[1]) hata('--rapor için JSON dosya yolu gerekli.')
    let veri
    const ham = readFileSync(argv[1], 'utf8')
    /** Metin içindeki ilk JSON dizisini çıkar; bulamazsa null (çağıran fail-closed eder). */
    const diziCikar = (metin) => {
        const a = metin.indexOf('[')
        const b = metin.lastIndexOf(']')
        if (a < 0 || b < 0 || b < a) return null
        try { return JSON.parse(metin.slice(a, b + 1)) } catch { return null }
    }
    try {
        veri = JSON.parse(ham)
        // SQL istemcisi diziyi bir sarmalayıcı nesnenin metin alanına gömebiliyor
        // (MCP: {"result":"... <untrusted-data> [ ... ] ..."}). Dizi orada saklıysa çıkar.
        if (!Array.isArray(veri) && veri && typeof veri.result === 'string') {
            veri = diziCikar(veri.result) ?? veri
        }
    } catch {
        // SQL istemcisi çıktıyı açıklama metniyle sarmalayabiliyor (MCP "untrusted-data" bloğu).
        // O durumda diziyi metinden çıkarırız — ama SESSİZCE DEĞİL: bulamazsa fail-closed.
        const a = ham.indexOf('[')
        const b = ham.lastIndexOf(']')
        if (a < 0 || b < 0 || b < a) hata('girdi ne JSON ne de içinde JSON dizisi taşıyan metin.')
        try {
            veri = JSON.parse(ham.slice(a, b + 1))
        } catch (e) {
            hata(`gömülü JSON dizisi ayrıştırılamadı: ${e.message}`)
        }
    }
    const cikti = join(KOK, 'docs', 'audits', 'matris-sutun-doluluk-2026-09-05.md')
    writeFileSync(cikti, raporUret(veri), 'utf8')
    process.stdout.write(`RAPOR YAZILDI: ${cikti}\n`)
} else {
    process.stdout.write('kullanım: matris-sutun-doluluk.mjs --sql | --rapor <olcum.json>\n')
    process.exit(2)
}
