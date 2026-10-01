#!/usr/bin/env node
'use strict'

/**
 * ÇALIŞAN TANIMI ÜRETİCİ (REC-530 hattı, kart üreticisinin İKİNCİ ÇIKTISI; OPS emri 2026-09-30).
 *
 * NİÇİN VAR: müdür (departman penceresi) alt ajanı her seferinde elle yazdığı görev metniyle açıyordu;
 * hangi çalışan türünün hangi skill'le geldiği hiçbir yerde sabit değildi. YETENEK departmanı 15 departman ×
 * 4 çalışan türü için ön yükleme setlerini ölçtü (`docs/audits/skill-departman-setleri-2026-09-30.json`);
 * bu betik o tablodaki her `uret: true` satırı için `.claude/agents/<departman>-<tur>.md` çalışan tanımını üretir.
 *
 * ÜRETİM KURALLARI (kaynak: YETENEK belgesi §9, OPS ve YETENEK onayı 2026-10-01):
 *   - `skills:` alanına YALNIZ `onYukle[].ad` girer; `adiylaCagir` ve `bekleyen` GİRMEZ.
 *   - Gövde: kısa rol cümlesi + (varsa) tek satır "adıyla çağır" listesi. Ölçüm (HARİTA, 2026-10-01, Haiku, n=3,
 *     tek küçük görev): gövdedeki skill talimatı 3/3 uygulandı; boş gövde araç kullanımını ve rapor biçimini
 *     bozmadı ama skill çağrısı da üretmedi. Gövde, ÇALIŞAN tanımında ajanın sistem istemidir; PENCERE tanımı gövdesi
 *     boş kalır (bu betik pencere tanımı üretmez).
 *   - `model` AÇIKÇA yazılır (execution-method-standard §10.3): kullanıcı ayarındaki CLAUDE_CODE_SUBAGENT_MODEL=sonnet
 *     modelsiz tanımı sessizce Sonnet'e düşürür; burada aynı değer görünür kılınır, değiştirmek tek sabittir.
 *   - Araştırmacı, çürütücü, doğrulayıcı yazmaz: `disallowedTools: Edit, Write, NotebookEdit` (ölçüldü 2026-10-01:
 *     alan çalışıyor, çalışanın araç listesinde Write yok). Bash yolu açık kalır; bu bir kalite ağıdır, kilit değil.
 *     Uygulayıcıda kısıt yok (verilen dosyaları yazar).
 *
 * KULLANIM:
 *   node scripts/belge/ajan-tanimi-uret.cjs         → diskteki tanımlar üretimle aynı mı (fark varsa çıkış 1)
 *   node scripts/belge/ajan-tanimi-uret.cjs --yaz   → .claude/agents/<departman>-<tur>.md dosyalarını yazar
 *
 * ELLE DÜZENLEME YOK: üretilen dosyalar bu betiğin çıktısıdır; değişiklik setler JSON'unda ya da bu betikte yapılır.
 */

const fs = require('node:fs')
const path = require('node:path')

const SETLER_YOLU = path.join('docs', 'audits', 'skill-departman-setleri-2026-09-30.json')
const AJAN_DIZINI = path.join('.claude', 'agents')

/** Çalışan türü → model. Execution-method §10.3: model açık yazılır; kullanıcı ayarı modelsizi Sonnet'e düşürür. */
const TUR_MODEL = { arastirmaci: 'sonnet', uygulayici: 'sonnet', curutucu: 'sonnet', dogrulayici: 'sonnet' }

/** Çalışan türü → Türkçe ad ve görev cümlesi (execution-method §10.3 tablosundan). */
const TURLER = {
  arastirmaci: { ad: 'araştırmacı', gorev: 'Salt-okuma çalışırsın: kaynağı bulur, ölçer, taslak çıkarırsın; sonucu scratchpad\'e yazar ve açana dönersin.' },
  uygulayici: { ad: 'uygulayıcı', gorev: 'Müdürün verdiği dar ve adlı dosya kümesini yazar, ilgili kapıları koşar ve sonucu açana dönersin.' },
  curutucu: { ad: 'çürütücü', gorev: 'Planı ya da bulguyu çürütmeye çalışırsın; kanıtsız bulgu yazmaz, emin olmadığını işaretlersin. Dosya yazmazsın.' },
  dogrulayici: { ad: 'doğrulayıcı', gorev: 'İşi yapmamış bağımsız okuyucusun: atıfları ve sayıları yeniden ölçer, her iddiayı DOĞRULANDI / ÇELİŞİYOR / DESTEKSİZ / ÖLÇÜLEMEDİ diye işaretlersin. Dosya yazmazsın.' },
}

/** Yazmayan türler. */
const YAZMAYAN = new Set(['arastirmaci', 'curutucu', 'dogrulayici'])

function dosyaAdi(dept, tur) {
  return `${String(dept).toLowerCase()}-${tur}`
}

function aciklama(dept, tur) {
  const t = TURLER[tur]
  return `${dept} departmanının ${t.ad} çalışanı. Müdür (departman penceresi) konu başına açar; sonucu yalnız açana döner, Recep'e yazmaz.`
}

/** Tek satır tanım metni (LF). */
function tanim(satir) {
  const t = TURLER[satir.tur]
  const f = [
    '---',
    `name: ${dosyaAdi(satir.dept, satir.tur)}`,
    `description: ${aciklama(satir.dept, satir.tur)}`,
    `model: ${TUR_MODEL[satir.tur]}`,
  ]
  if (YAZMAYAN.has(satir.tur)) f.push('disallowedTools: Edit, Write, NotebookEdit')
  const skills = (satir.onYukle || []).map((o) => o.ad)
  if (skills.length) {
    f.push('skills:')
    for (const s of skills) f.push(`  - ${s}`)
  }
  f.push('---', '')
  const govde = [`Sen ${satir.dept} departmanının ${t.ad} çalışanısın. ${t.gorev}`]
  const adiyla = (satir.adiylaCagir || []).filter((a) => !a.uyari).map((a) => a.ad)
  if (adiyla.length) govde.push(`Gerektiğinde şu skill'leri Skill aracıyla adıyla çağır: ${adiyla.join(', ')}.`)
  return f.concat(govde).join('\n') + '\n'
}

function setleriOku(kok) {
  return JSON.parse(fs.readFileSync(path.join(kok, SETLER_YOLU), 'utf8'))
}

/** { dosyaAdi: metin } — yalnız `uret: true` satırları. */
function uret(setler) {
  const cikti = {}
  for (const s of setler.setler) {
    if (!s.uret) continue
    cikti[dosyaAdi(s.dept, s.tur) + '.md'] = tanim(s)
  }
  return cikti
}

/**
 * Üretim kuralı ihlalleri (yazım hatası ve sessiz sapma kapısı):
 *   - her `uret: true` satırının en az bir `onYukle` skill'i vardır (boş onYukle'li satır uret:false olmalıdır);
 *   - bir sette en çok `enFazlaOnYukle` skill ve `onYuklemeButceKB` KB (YETENEK ölçütü);
 *   - ön yüklenen skill adı etkin ağaçta (`.claude/skills/<ad>/SKILL.md`) ya da `kullaniciDuzeyi` listesinde vardır.
 * @param {object} setler
 * @param {(ad: string) => boolean} etkinMi `.claude/skills` altında var mı
 * @param {Set<string>} kullaniciDuzeyi etkin ağaç dışında bilinen skill adları (kullanıcı/eklenti düzeyi)
 */
function sorunlar(setler, etkinMi, kullaniciDuzeyi) {
  const s = []
  const sinir = setler.kural || {}
  const adlar = new Set()
  for (const x of setler.setler) {
    const ad = dosyaAdi(x.dept, x.tur)
    if (adlar.has(ad)) s.push(`yinelenen ajan adı: ${ad}`)
    adlar.add(ad)
    if (!TURLER[x.tur]) s.push(`${ad}: bilinmeyen tür ${x.tur}`)
    if (x.uret && !(x.onYukle || []).length) s.push(`${ad}: uret:true ama onYukle boş`)
    if (!x.uret && (x.onYukle || []).length) s.push(`${ad}: uret:false ama onYukle dolu`)
    if (x.uret && sinir.enFazlaOnYukle && x.onYukle.length > sinir.enFazlaOnYukle) s.push(`${ad}: ${x.onYukle.length} skill > ${sinir.enFazlaOnYukle}`)
    const kb = (x.onYukle || []).reduce((t, o) => t + (o.kb || 0), 0)
    if (x.uret && sinir.onYuklemeButceKB && kb > sinir.onYuklemeButceKB + 0.05) s.push(`${ad}: ${kb.toFixed(1)} KB > ${sinir.onYuklemeButceKB}`)
    for (const o of x.onYukle || []) if (!etkinMi(o.ad) && !kullaniciDuzeyi.has(o.ad)) s.push(`${ad}: ön yüklenen "${o.ad}" etkin ağaçta ve bilinen kullanıcı düzeyi listesinde yok`)
  }
  return s
}

/**
 * Etkin ağaçta bulunmayan ama YETENEK setinde ön yüklenen skill'ler: kullanıcı/eklenti düzeyinde var (bu oturumun
 * skill listesinde görülür). Mekanik doğrulama (alan geçerli mi, gövde bağlama giriyor mu) ARAÇ'ın işidir.
 */
const KULLANICI_DUZEYI = new Set(['webapp-testing', 'accessibility', 'search-console', 'pdf', 'supabase-postgres-best-practices'])

function main() {
  const kok = path.resolve(__dirname, '..', '..')
  const setler = setleriOku(kok)
  const dizin = path.join(kok, AJAN_DIZINI)
  const tanimlar = uret(setler)
  const yaz = process.argv.includes('--yaz')
  let fark = 0
  if (yaz) fs.mkdirSync(dizin, { recursive: true })
  for (const [ad, metin] of Object.entries(tanimlar)) {
    const yol = path.join(dizin, ad)
    if (yaz) fs.writeFileSync(yol, metin, 'utf8')
    else if (!fs.existsSync(yol) || fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n') !== metin) {
      fark++
      console.error(`FARK: ${AJAN_DIZINI.replace(/\\/g, '/')}/${ad}`)
    }
  }
  // Öksüz: uret:false (ya da silinmiş) satırın eski çıktısı diskte kaldıysa.
  const beklenen = new Set(Object.keys(tanimlar))
  const kalip = new RegExp(`^(${[...new Set(setler.setler.map((x) => String(x.dept).toLowerCase()))].map((d) => d.replace(/[-]/g, '\\-')).join('|')})-(arastirmaci|uygulayici|curutucu|dogrulayici)\\.md$`)
  if (fs.existsSync(dizin)) {
    for (const f of fs.readdirSync(dizin)) {
      if (kalip.test(f) && !beklenen.has(f)) {
        if (yaz) fs.unlinkSync(path.join(dizin, f))
        else {
          fark++
          console.error(`ÖKSÜZ: ${AJAN_DIZINI.replace(/\\/g, '/')}/${f}`)
        }
      }
    }
  }
  const etkinMi = (ad) => fs.existsSync(path.join(kok, '.claude', 'skills', ad, 'SKILL.md'))
  const s = sorunlar(setler, etkinMi, KULLANICI_DUZEYI)
  for (const x of s) console.error(`SORUN: ${x}`)
  if (yaz) console.log(`${Object.keys(tanimlar).length} çalışan tanımı yazıldı`)
  process.exit(fark || s.length ? 1 : 0)
}

module.exports = { uret, tanim, sorunlar, dosyaAdi, TURLER, TUR_MODEL, YAZMAYAN, KULLANICI_DUZEYI, SETLER_YOLU, AJAN_DIZINI }

if (require.main === module) main()
