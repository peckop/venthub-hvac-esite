/**
 * ALINTI DOĞRULAMA — ham kaynaktan, özetleyici araç olmadan (rehber-yazisi-standard.md R2.3 + R5.1 3c).
 *
 * NİÇİN: 2026-09-24'te cetvelin v0.1'i Google'ın SSS kuralını bir özetleyici araçla (WebFetch) "birebir
 * var" diye doğruladı. Gerçekte belge adresi 301 ile güncellemeler sayfasına gidiyordu, alıntı 2023
 * kaydındaydı ve aynı sayfada özelliğin 2026-05-07'de kaldırıldığı yazıyordu. Alıntının kaynakta geçmesi
 * iddianın GÜNCEL olduğunu göstermez. Bu betik her kaynağı ham çeker, yönlendirme zincirini, son
 * güncelleme tarihini ve metnin sha256'sını kaydeder, alıntıyı normalize ederek arar ve alıntının
 * çevresinde "kaldırıldı / no longer / deprecated" gibi bayatlık işaretlerine bakar.
 *
 * Kullanım:
 *   node scripts/rehber/alinti-dogrula.mjs <kaynaklar.json> [--dizin <sayfalar.jsonl>] [--cikti <dosya.json>]
 *   kaynaklar.json: [{ no, url?, pdf_hash?, sayfa?, alinti }]  — web kaynağı `url`, kaynak dizini `pdf_hash`+`sayfa`.
 * Çıkış: her kaynak BULUNDU ve bayatlık işareti yoksa 0; aksi hâlde 1 (ağ hatası da 1).
 * ⚠AĞA ÇIKAR. CI kapısı bu dosyayı çalıştırmaz (ALTYAPI şartı); testler yalnız saf yardımcıları sınar.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

// ─── saf yardımcılar (testlenir) ───────────────────────────────────────────────
/** HTML → görünür metin (script/style atılır, etiket soyulur, varlıklar çözülür). */
export function htmlMetin(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Karşılaştırma için normalize: tırnak/tire birleştirilir, boşluk tekleşir, küçük harf (tr).
 * ⚠Etiket soyma, bağlantı içindeki kelimeden sonra noktalamanın önüne boşluk koyar
 * (`<a>VideoObject</a>.` → "VideoObject ."); ölçüldü 2026-09-24, Indexing API alıntısı bu yüzden
 * "yok" çıkıyordu. Noktalama önündeki boşluk silinir.
 */
export function normalize(s) {
  return s
    .replace(/[“”„"]/g, '"').replace(/[‘’']/g, "'").replace(/[–—‑]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?)])/g, '$1').replace(/([(])\s+/g, '$1')
    .trim()
    .toLocaleLowerCase('tr')
}

/** Bayatlık işaretleri — alıntının çevresinde geçiyorsa alıntı "var" ama güncel olmayabilir. */
export const BAYATLIK = /\b(no longer|deprecat\w*|removed|retired|sunset|superseded|withdrawn|replaced by|obsolete)\b|kaldırıl\p{L}*|yürürlükten|mülga|iptal edil\p{L}*/iu

/**
 * Alıntıyı metinde ara; bulunursa alıntının ÇEVRESİNDE (alıntının kendisi hariç) bayatlık işareti ve
 * yıl ara, çevre metnini yargı adımına ver.
 *
 * ⚠DÜRÜST SINIR — işaret AYIRT ETMEZ (ölçüldü 2026-09-24, beş gerçek Google alıntısı): bayat SSS
 * alıntısında "removed" doğru uyarıydı; Indexing API sayfasında "pages are added or removed" olağan
 * cümleydi ve aynı uyarıyı verdi. Bu yüzden işaret alıntıyı DÜŞÜRMEZ: sonuç `INCELE` olur ve `baglam`
 * R5.1 3d yargısına (doğrulayıcı) gider. Kelime sezgisi yargının yerini tutmaz, yalnız dikkat çeker.
 */
export function alintiBul(metin, alinti, pencere = 400) {
  const m = normalize(metin)
  const a = normalize(alinti)
  if (!a) return { bulundu: false, sebep: 'ALINTI-BOS' }
  const i = m.indexOf(a)
  if (i === -1) return { bulundu: false, sebep: 'ALINTI-YOK' }
  const once = m.slice(Math.max(0, i - pencere), i)
  const sonra = m.slice(i + a.length, i + a.length + pencere)
  const cevre = `${once} ${sonra}`
  const bayat = cevre.match(BAYATLIK)
  const tarihler = [...new Set(cevre.match(/\b(19|20)\d{2}\b/g) || [])]
  return { bulundu: true, konum: i, bayatlikIsareti: bayat ? bayat[0] : null, baglamYillari: tarihler, baglam: `…${once.slice(-200)} ⟦ALINTI⟧ ${sonra.slice(0, 200)}…` }
}

/**
 * Kaynak adresi başka bir YOLA taşındı mı (sorgu ve # hariç)? SSS vakasında asıl güvenilir işaret buydu:
 * `…/structured-data/faqpage` → 301 → `…/search/updates#removing-faq-rich-result`. Kelime sezgisi o vakayı
 * yalnız tesadüfen yakaladı (çevredeki "removed" başka bir özelliğe aitti — ölçüldü 2026-09-24).
 */
export function yolDegisti(ilk, son) {
  try {
    const a = new URL(ilk)
    const b = new URL(son)
    return a.host !== b.host || a.pathname.replace(/\/$/, '') !== b.pathname.replace(/\/$/, '')
  } catch {
    return false
  }
}

/**
 * Kayıt → GECTI (bulundu, 200, işaret yok) · INCELE (bulundu, 200; bayatlık kelimesi ya da yol değişikliği
 * var → çevre metni yargıya) · KALDI (bulunamadı / HTTP hatası).
 */
export function hukum(kayit) {
  if (kayit.bulundu !== true || (kayit.durum !== undefined && kayit.durum !== 200)) return 'KALDI'
  return kayit.bayatlikIsareti || kayit.yonlendi ? 'INCELE' : 'GECTI'
}

/** Sayfanın kendi "son güncelleme" beyanı (Google belgeleri "Last updated YYYY-MM-DD UTC" yazar). */
export function sonGuncelleme(html) {
  const m = html.match(/Last updated\s+(\d{4}-\d{2}-\d{2})/i) || html.match(/(?:Son güncelleme|Güncellenme)[^0-9]{0,20}(\d{2}[./]\d{2}[./]\d{4}|\d{4}-\d{2}-\d{2})/i)
  return m ? m[1] : null
}

export const sha256 = (s) => createHash('sha256').update(s).digest('hex')

// ─── ağ ────────────────────────────────────────────────────────────────────────
async function hamGetir(url, azami = 6) {
  const zincir = []
  let u = url
  for (let i = 0; i < azami; i++) {
    // ⚠accept-language ZORUNLU: Node fetch varsayılanı `*`; Google belgeleri buna rastgele dil
    // yönlendirmesiyle cevap verdi (?hl=zh-tw, ?hl=pl — ölçüldü 2026-09-24) ve alıntı "yok" çıktı.
    const r = await fetch(u, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (compatible; VentHubRehberDogrulama/1.0)', 'accept-language': 'en-US,en;q=0.9,tr;q=0.8' } })
    zincir.push(`${r.status} ${u}`)
    const konum = r.headers.get('location')
    if (r.status >= 300 && r.status < 400 && konum) { u = new URL(konum, u).href; continue }
    return { durum: r.status, sonAdres: u, zincir, govde: await r.text() }
  }
  return { durum: 'COK-YONLENDIRME', sonAdres: u, zincir, govde: '' }
}

async function main(argv) {
  const dosya = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--dizin' && argv[argv.indexOf(a) - 1] !== '--cikti')
  if (!dosya) { console.error('kullanım: alinti-dogrula.mjs <kaynaklar.json> [--dizin sayfalar.jsonl] [--cikti out.json]'); process.exitCode = 1; return }
  const arg = (ad) => (argv.includes(ad) ? argv[argv.indexOf(ad) + 1] : null)
  const kaynaklar = JSON.parse(readFileSync(dosya, 'utf8'))
  const dizinYolu = arg('--dizin')
  let dizin = null
  const sonuc = []
  for (const k of kaynaklar) {
    const kayit = { no: k.no, erisim: new Date().toISOString().slice(0, 10) }
    try {
      if (k.url) {
        const g = await hamGetir(k.url)
        const metin = htmlMetin(g.govde)
        Object.assign(kayit, { ilkAdres: k.url, sonAdres: g.sonAdres, yonlendi: yolDegisti(k.url, g.sonAdres), durum: g.durum, zincir: g.zincir, sonGuncelleme: sonGuncelleme(g.govde), sha256: sha256(metin) }, alintiBul(metin, k.alinti || ''))
        if (g.durum !== 200) kayit.sebep = `DURUM-${g.durum}`
      } else if (k.pdf_hash) {
        if (!dizinYolu) throw new Error('kaynak dizini atfı var ama --dizin verilmedi')
        dizin ??= readFileSync(dizinYolu, 'utf8').split('\n').filter(Boolean).map((s) => JSON.parse(s))
        const sayfa = dizin.find((r) => r.pdf_hash === k.pdf_hash && Number(r.sayfa) === Number(k.sayfa))
        if (!sayfa) Object.assign(kayit, { bulundu: false, sebep: 'DIZIN-SAYFASI-YOK' })
        else {
          const metin = [sayfa.metin || '', ...(sayfa.tablo || []).flatMap((t) => (t.satirlar || []).map((s) => s.join(' ')))].join(' ')
          Object.assign(kayit, { dosya: sayfa.dosya, sayfa: sayfa.sayfa, sha256: sha256(metin) }, alintiBul(metin, k.alinti || ''))
        }
      } else Object.assign(kayit, { bulundu: false, sebep: 'URL-YA-DA-PDF_HASH-YOK' })
    } catch (e) {
      Object.assign(kayit, { bulundu: false, sebep: `HATA ${e.cause?.code || e.message}` })
    }
    kayit.hukum = hukum(kayit)
    sonuc.push(kayit)
    const isaret = { GECTI: '✓', INCELE: '?', KALDI: '✗' }[kayit.hukum]
    console.log(`${isaret} ${kayit.hukum} [${k.no}] ${kayit.sebep || 'bulundu'} ${kayit.sonAdres || kayit.dosya || ''}`)
    if (kayit.hukum === 'INCELE') console.log(`    ${kayit.yonlendi ? `⚠YOL DEĞİŞTİ ${kayit.zincir.join(' → ')} · ` : ''}işaret "${kayit.bayatlikIsareti || '-'}" · çevre yılları ${kayit.baglamYillari.join(',') || '-'} · ${kayit.baglam}`)
  }
  const cikti = arg('--cikti')
  if (cikti) writeFileSync(cikti, JSON.stringify(sonuc, null, 1))
  const say = (h) => sonuc.filter((s) => s.hukum === h).length
  console.log(`kaynak ${sonuc.length} · GECTI ${say('GECTI')} · INCELE ${say('INCELE')} (yargıya gider) · KALDI ${say('KALDI')}`)
  if (say('KALDI')) process.exitCode = 1
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/rehber/alinti-dogrula.mjs')) main(process.argv.slice(2)).catch((e) => { console.error('HATA', e.message); process.exitCode = 1 })
