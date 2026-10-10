#!/usr/bin/env node
/**
 * AILE BLOK DUZELTICI — ailenin description JSON'unda TEK alandaki bir parcayi degistirir
 * (abarti cumlesi vb.). `aile-metni-yaz.mjs` description.tr/en'i yazar ve bloklari aynen tasir;
 * bu betik onayli metinde cerrahi duzeltme icindir. Kurallar: `aile-blok-duzelt-kurallar.mjs`
 * (saf, testli). Ortak-brif-v2 §4 icerik kurallari K3/K4'te kodlanmistir.
 *
 * PLAN: {"kalemler":[{"slug":"<aile>","yol":["tr"]|["en"]|["bloklar_tr","Motor"]|["maddeler_tr",1],
 *        "eski":"<alanda tam 1 kez gecen dizge>","yeni":"<yerine konan dizge>"}]}
 *   Ayni ailenin birden cok kalemi olabilir: aile basina TEK PATCH gider (govde {description,
 *   is_description_manual:true}). Sira: once degisiklikler (plan sirasiyla), sonra silmeler (azalan indeks).
 *   OGE SILME: {"slug","yol":["maddeler_tr",i],"eski":"<ogenin TAM degeri>","yeni":null}; yeni "" ise
 *   tr/en/bloklar_tr/maddeler_tr'de PARCA silinir (eski tam 1 eslesme, sonuc alan bos olamaz).
 *
 * VARSAYILAN KURU KOSUM: her kalem icin ESKI→YENI farki ve hangi kuralin gectigi/gecmedigi yazilir.
 * Prod'a yalniz IKI ANAHTARLA dokunur: `--yaz` bayragi VE ortamda `CANLI_YAZIM_ONAYI=evet`
 * (degeri komut satirina yazilmaz, ortamdan okunur). Herhangi bir kalem RED ise `--yaz` bile
 * reddedilir; hicbir aile yazilmaz (kismi yazim yok). "Zaten uygulanmis" kalem (K5) hata degildir.
 *
 * ⚠ ANON ANAHTAR KULLANILMAZ: RLS yazmayi sessizce bosaltir, "0 satir" basari gibi gorunur.
 * ⚠ DENETIM IZI TETIKTE: `denetim_izi_product_families` UPDATE'te admin_audit_log'a yazar;
 *   bu betik ikinci audit satiri YAZMAZ (PATCH basina 1 satir).
 * ⚠ YARIS: PATCH `updated_at=eq.<okunan>` kosulludur (`patchYolu`); 0 satir donerse aile yeniden
 *   okunur, kalemler taze satira yeniden uygulanir ve 1 kez denenir; yine 0 → KIRMIZI.
 * YEDEK: yazmadan ONCE canlidan okunan satirlar (updated_at dahil) --yedek dosyasina yazilir
 *   (kuru kosuda yazilmaz; varsayilan ad zaman damgali, eski yedegi ezmez). YAZDIKTAN SONRA canlidan
 *   geri okunur ve beklenen JSON ile anahtar sirasindan bagimsiz karsilastirilir.
 *
 * CIKIS KODLARI: 0 = tamam (kuru kosum dahil) · 1 = kural/veri/ag/yetki/yazim hatasi · 2 = onkosul/plan hatasi.
 *
 * KULLANIM:
 *   node scripts/icerik-hatti/aile-blok-duzelt.mjs --plan <plan.json> [--yedek <yol>] [--yaz]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { ailePlani, aileyeGore, kalanKaliplar, kanonikEsit, planDogrula, yolEtiketi } from './aile-blok-duzelt-kurallar.mjs'
import { OKUMA_SECIMI,patchYolu } from './aile-metni-kurallar.mjs'

/** @typedef {import('./aile-blok-duzelt-kurallar.mjs').Kalem} Kalem */
/** @typedef {{ id: string, tenant_id: string, slug: string, description: unknown, is_description_manual: boolean | null, updated_at: string }} AileSatiri */

/** Cikis: mesajlari yazip verilen kodla biter (process.exit kullanilmaz: cikti kesilmesin). */
class Cikis extends Error {
  /** @param {number} kod @param {string[]} satirlar */
  constructor(kod, satirlar) {
    super(satirlar[0])
    this.kod = kod
    this.satirlar = satirlar
  }
}

const argv = process.argv.slice(2)
const deger = (/** @type {string} */ ad, /** @type {string | null} */ vars) => {
  const i = argv.indexOf(ad)
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : vars
}
const PLAN_YOL = deger('--plan', null)
const zamanDamgasi = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)
const YEDEK_YOL = /** @type {string} */ (deger('--yedek', `aile-blok-yedek-${zamanDamgasi}.json`))
const YAZ = argv.includes('--yaz')
const ISTEK_SURESI_MS = 30000

/** Ortam dosyasi (aile-metni-yaz.mjs ile ayni bicim). */
function ortamOku() {
  const ENV_YOL = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
  let ortam
  try {
    ortam = Object.fromEntries(
      readFileSync(ENV_YOL, 'utf8')
        .split(/\r?\n/)
        .filter((s) => s && !s.startsWith('#') && s.includes('='))
        .map((s) => {
          const i = s.indexOf('=')
          return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
        }),
    )
  } catch {
    throw new Cikis(2, [`ONKOSUL: ortam dosyasi okunamadi: ${ENV_YOL}`])
  }
  const url = ortam.SUPABASE_URL || ortam.NEXT_PUBLIC_SUPABASE_URL
  const anahtar = ortam.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anahtar) throw new Cikis(2, [`ONKOSUL: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok: ${ENV_YOL}`])
  return { url: String(url).replace(/\/+$/, ''), anahtar: String(anahtar) }
}

/** @param {string} ad */
const planOku = (ad) => {
  let ham
  try {
    ham = readFileSync(ad, 'utf8')
  } catch (e) {
    throw new Cikis(2, [`ONKOSUL: plan dosyasi okunamadi: ${ad} (${/** @type {Error} */ (e).message})`])
  }
  let plan
  try {
    plan = JSON.parse(ham)
  } catch (e) {
    throw new Cikis(2, [`ONKOSUL: plan dosyasi gecerli JSON degil: ${ad} (${/** @type {Error} */ (e).message})`])
  }
  const { hatalar, kalemler } = planDogrula(plan)
  if (hatalar.length) throw new Cikis(2, ['ONKOSUL: plan gecersiz:', ...hatalar.map((h) => '   ' + h)])
  return kalemler
}

const ETIKET = { gecti: 'GECTI ', gecmedi: 'GECMEDI', yok: '  -   ' }
/** Kuru kosum / yazim oncesi rapor: kalem basina ESKI→YENI ve kural sonuclari. */
function kalemRaporu(/** @type {import('./aile-blok-duzelt-kurallar.mjs').KalemSonucu} */ s, /** @type {number} */ no, /** @type {number} */ toplam) {
  console.log(`[${no}/${toplam}] ${s.kalem.slug} · ${yolEtiketi(s.kalem.yol)}`)
  console.log(`   ESKI: ${JSON.stringify(s.kalem.eski)}`)
  console.log(`   YENI: ${s.kalem.yeni === null ? 'null (maddeler_tr ogesi SILINIR)' : JSON.stringify(s.kalem.yeni)}`)
  for (const k of s.kurallar) {
    const e = k.ok === true ? ETIKET.gecti : k.ok === false ? ETIKET.gecmedi : ETIKET.yok
    console.log(`   ${k.kural} ${k.ad.padEnd(14)} ${e} ${k.ayrinti}`.trimEnd())
  }
  console.log(`   => ${s.durum === 'uygula' ? 'UYGULANIR' : s.durum === 'atla' ? 'ATLANIR (zaten uygulanmis)' : 'RED'}`)
}

async function main() {
  let yazimBasladi = false
  try {
    if (!PLAN_YOL) throw new Cikis(2, ['ONKOSUL: --plan zorunlu (plan.json: {"kalemler":[{"slug","yol","eski","yeni"}]}).'])
    const kalemler = planOku(PLAN_YOL)
    const { url: URL_, anahtar: ANAHTAR } = ortamOku()
    const basliklar = { apikey: ANAHTAR, Authorization: `Bearer ${ANAHTAR}`, 'Content-Type': 'application/json' }
    return await calis(kalemler, URL_, basliklar, () => { yazimBasladi = true })
  } catch (e) {
    if (e instanceof Cikis) {
      for (const s of e.satirlar) console.error((s.startsWith('   ') ? '' : '⛔ ') + s)
      if (!yazimBasladi) console.error('   Hicbir aile yazilmadi.')
      return e.kod
    }
    throw e
  }
}

/**
 * @param {Kalem[]} kalemler
 * @param {string} URL_
 * @param {Record<string, string>} basliklar
 * @param {() => void} yazimBasladiIsaretle
 */
async function calis(kalemler, URL_, basliklar, yazimBasladiIsaretle) {
  /** Ham istek: hic atmaz; ag hatasi `ag` alaninda doner. */
  const ham = async (/** @type {string} */ yol, /** @type {RequestInit} */ secenek) => {
    try {
      const r = await fetch(`${URL_}/rest/v1/${yol}`, { ...secenek, signal: AbortSignal.timeout(ISTEK_SURESI_MS) })
      return { durum: r.status, ok: r.ok, metin: await r.text() }
    } catch (e) {
      const h = /** @type {{ cause?: { code?: string }, message?: string }} */ (e)
      return { ag: h?.cause?.code || h?.message || String(e) }
    }
  }
  const hataMetni = (/** @type {Awaited<ReturnType<typeof ham>>} */ h, /** @type {string} */ ne) => {
    if ('ag' in h) return `ag hatasi (${ne}): ${URL_} adresine ulasilamadi — ${h.ag}`
    if (h.durum === 401 || h.durum === 403) return `yetki hatasi (${h.durum}, ${ne}): SUPABASE_SERVICE_ROLE_KEY gecersiz ya da bu tabloya erisim yetkisi yok`
    return `${ne} basarisiz: ${h.durum} ${h.metin.slice(0, 300)}`
  }
  /** @returns {Promise<AileSatiri[]>} */
  const oku = async (/** @type {string} */ filtre) => {
    const h = await ham(`product_families?select=${OKUMA_SECIMI}&${filtre}`, { headers: basliklar })
    if ('ag' in h || !h.ok) throw new Cikis(1, [hataMetni(h, 'aile sorgusu')])
    let d
    try {
      d = JSON.parse(h.metin)
    } catch {
      throw new Cikis(1, ['aile sorgusu: yanit JSON degil'])
    }
    if (!Array.isArray(d)) throw new Cikis(1, ['aile sorgusu: yanit dizi degil'])
    return d
  }

  const gruplar = aileyeGore(kalemler)
  const sluglar = [...gruplar.keys()]
  console.log(`PLAN: ${kalemler.length} kalem · ${sluglar.length} aile`)

  // ---- OKUMA: her aile DB'de var mi (bos sonuc = RED)
  const mevcut = await oku(`slug=in.(${sluglar.map(encodeURIComponent).join(',')})`)
  const bulunan = new Map(mevcut.map((a) => [a.slug, a]))
  const eksik = sluglar.filter((s) => !bulunan.has(s))
  if (eksik.length) throw new Cikis(1, ['aile bulunamadi (DB\'de yok ya da sorgu bos dondu) KIRMIZI', `   bulunamayan: ${eksik.join(', ')}`])
  if (mevcut.length !== new Set(mevcut.map((a) => a.slug)).size) throw new Cikis(1, ['aile ayni slug ile birden cok kiracida — kiraci belirsiz KIRMIZI'])
  console.log(`  ${bulunan.size}/${sluglar.length} aile DB'de`)

  // ---- DEGERLENDIRME: butun kalemler raporlanir, sonra karar
  let no = 0
  let kirmizi = 0
  let uygulanir = 0
  let atlanir = 0
  /** @type {{ slug: string, a: AileSatiri, kalemler: Kalem[], plan: ReturnType<typeof ailePlani> }[]} */
  const yazilacak = []
  for (const [slug, kl] of gruplar) {
    const a = /** @type {AileSatiri} */ (bulunan.get(slug))
    const plan = ailePlani(a.description, kl)
    for (const s of plan.sonuclar) {
      kalemRaporu(s, ++no, kalemler.length)
      if (s.durum === 'red') kirmizi++
      else if (s.durum === 'uygula') uygulanir++
      else atlanir++
    }
    if (!plan.red && plan.degisti) {
      yazilacak.push({ slug, a, kalemler: kl, plan })
      const kalan = kalanKaliplar(plan.aciklama)
      console.log(`   BILGI ${slug}: uygulama sonrasi description'da kalan abarti kalibi ${kalan.length}${kalan.length ? ' (' + kalan.map((k) => `${k.yol}:${k.ad}`).join(', ') + ')' : ''}`)
    }
  }
  console.log('')
  console.log(`OZET: ${kalemler.length} kalem · uygulanir ${uygulanir} · atlanir ${atlanir} · red ${kirmizi} · yazilacak aile ${yazilacak.length}`)
  if (kirmizi) throw new Cikis(1, [`${kirmizi} kalem RED — yukaridaki kural satirlarina bak (KIRMIZI)`])
  if (!yazilacak.length) {
    console.log('Yazilacak degisiklik yok (tum kalemler zaten uygulanmis).')
    return 0
  }

  const onay = process.env.CANLI_YAZIM_ONAYI === 'evet'
  if (!YAZ || !onay) {
    console.log('')
    console.log('KURU KOSUM — hicbir sey yazilmadi. Yazim icin iki anahtar: --yaz VE CANLI_YAZIM_ONAYI=evet' +
      (YAZ && !onay ? ' (--yaz var, ortam anahtari YOK)' : onay && !YAZ ? ' (ortam anahtari var, --yaz YOK)' : ''))
    return 0
  }

  // ---- YEDEK (yazmadan once; yazilamazsa PATCH'e gidilmez)
  /** @type {AileSatiri[]} */
  const yedek = [...mevcut]
  const yedekYaz = () => {
    try {
      writeFileSync(YEDEK_YOL, JSON.stringify(yedek, null, 2) + '\n', 'utf8')
    } catch (e) {
      throw new Cikis(1, [`yedek dosyasi yazilamadi: ${YEDEK_YOL} (${/** @type {Error} */ (e).message})`])
    }
  }
  yedekYaz()
  console.log(`  YEDEK: ${YEDEK_YOL} (${yedek.length} kayit, updated_at dahil)`)

  // ---- YAZIM (aile basina tek, atomik kosullu PATCH; 0 satirda 1 yeniden deneme)
  yazimBasladiIsaretle()
  const patch = async (/** @type {AileSatiri} */ a, /** @type {unknown} */ govde) => {
    const h = await ham(patchYolu(a), {
      method: 'PATCH',
      headers: { ...basliklar, Prefer: 'return=representation' },
      body: JSON.stringify(govde),
    })
    if ('ag' in h || !h.ok) return { hata: hataMetni(h, 'PATCH') }
    try {
      const d = JSON.parse(h.metin)
      return { satir: Array.isArray(d) ? d.length : -1 }
    } catch {
      return { hata: 'PATCH yaniti JSON degil' }
    }
  }
  const govdeOlustur = (/** @type {unknown} */ aciklama) => ({ description: aciklama, is_description_manual: true })
  let basarili = 0
  /** @type {string[]} */
  const hatalar = []
  /** @type {Map<string, unknown>} slug → son PATCH'lenen description (geri okuma beklentisi) */
  const beklenen = new Map()
  for (const { slug, a: ilk, kalemler: kl, plan } of yazilacak) {
    try {
      let a = ilk
      let govde = govdeOlustur(plan.aciklama)
      let s = await patch(a, govde)
      if (!('hata' in s) && s.satir === 0) {
        // yaris: aile okunmasindan sonra degismis. Yeniden oku, kalemleri taze satira yeniden uygula, 1 kez dene.
        const [taze] = await oku(`id=eq.${a.id}&tenant_id=eq.${a.tenant_id}`)
        const p2 = taze ? ailePlani(taze.description, kl) : null
        if (!taze || !p2 || p2.red || !p2.degisti) {
          hatalar.push(`${slug}: yeniden okumada yazilamaz — ${!taze ? 'aile artik yok' : p2?.red ? p2.sonuclar.filter((x) => x.durum === 'red').map((x) => x.neden).join(' | ') : 'uygulanacak kalem kalmadi'}`)
          continue
        }
        yedek.push(taze)
        yedekYaz()
        a = taze
        govde = govdeOlustur(p2.aciklama)
        s = await patch(a, govde)
      }
      if ('hata' in s) hatalar.push(`${slug}: ${s.hata}`)
      else if (s.satir === 1) {
        basarili++
        beklenen.set(slug, /** @type {{ description: unknown }} */ (govde).description)
      } else hatalar.push(`${slug}: donen satir ${s.satir} (yaris ikinci denemede de surdu ya da yazma yetkisi yok: RLS yazmayi sessizce bosaltir)`)
    } catch (e) {
      hatalar.push(`${slug}: ${e instanceof Cikis ? e.satirlar[0] : /** @type {Error} */ (e).message}`)
    }
  }
  console.log('')
  console.log(`YAZILAN: ${basarili}/${yazilacak.length}`)

  // ---- YAZIM SONRASI DOGRULAMA (beyan degil, olcum): canlidan geri oku, kanonik esitlik
  if (beklenen.size) {
    try {
      const son = new Map((await oku(`slug=in.(${[...beklenen.keys()].map(encodeURIComponent).join(',')})`)).map((a) => [a.slug, a]))
      const uymayan = [...beklenen].filter(([slug, d]) => {
        const c = son.get(slug)
        return !c || !kanonikEsit(c.description, d) || c.is_description_manual !== true
      }).map(([slug]) => slug)
      console.log(`DOGRULAMA (canlidan okundu): beklenenle kanonik esit ${beklenen.size - uymayan.length}/${beklenen.size}`)
      if (uymayan.length) hatalar.push(`canlida beklenenle uymayan: ${uymayan.join(', ')}`)
    } catch (e) {
      hatalar.push(`geri okuma basarisiz: ${e instanceof Cikis ? e.satirlar[0] : /** @type {Error} */ (e).message}`)
    }
  }
  if (hatalar.length) throw new Cikis(1, [`HATA ${hatalar.length}:`, ...hatalar.map((h) => '   ' + h)])
  return 0
}

main().then(
  (kod) => { process.exitCode = kod },
  (e) => {
    console.error('⛔ beklenmeyen hata:', /** @type {Error} */ (e)?.message ?? e)
    process.exitCode = 1
  },
)
