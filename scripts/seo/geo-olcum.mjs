/**
 * GEO ÖLÇÜM BETİĞİ — yapay zekâ cevaplarında VentHub görünürlüğü (Kanban SEO-42; REC-369 devamı;
 * cetvel docs/standards/geo-olcum-standard.md G1-G5, G7; pazar-olcum-standard.md P6).
 *
 * İKİ KİP:
 *   kos    node scripts/seo/geo-olcum.mjs kos <gemini|claude> --liste <soru-listesi.json> [--ek <ek-sorular.json>]
 *          --cikti <depo-dışı-klasör> [--tarafsiz <boş klasör>] [--onceki <jsonl>] [--yalniz 1,7,M1] [--once 51,52]
 *          [--tekrar-ilk 10] [--tekrar 3] [--sizinti-atla] [--kuru]
 *          `--kuru` istek GÖNDERMEZ, kaç istek yapılacağını yazar (ortamda GEMINI_API_KEY varsa `kos` gerçek koşar!).
 *   ozet   node scripts/seo/geo-olcum.mjs ozet <gemini.jsonl> [<claude.jsonl> ...] [--cikti <depo-dışı-klasör>]
 *          G5 tablosunun satırlarını üretir. Rakip alan adları YALNIZ --cikti klasöründeki dosyaya yazılır.
 *
 * NİÇİN DEPODA: koşu betiği oturumun geçici klasöründeydi (C:/tmp/geo-v1/geo-kos-v1.mjs); ağsız çekirdek
 * (cevaptan VentHub/kaynak ayıklama, sızıntı izleri, G4 satırı, G5 oranları, anahtarın çıktıya yazılmaması)
 * artık test edilir (scripts/seo/__tests__/geo-olcum.test.ts, ci'da koşar).
 *
 * VERİ DEPOYA GİRMEZ (G2, G4, P6): soru listesi, ham cevap ve rakip alan adları depo dışıdır; betik yalnız
 * yol alır. Anahtar yalnız ortamdan (`GEMINI_API_KEY`); hiçbir çıktıya, hata metnine ve satıra yazılmaz.
 *
 * Çıkış: 0 tamam · 1 koşu kota ile durdu / sızıntı bulundu (kos) · 2 araç koşmadı (argüman, anahtar, yol).
 */
import { readFileSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { userInfo } from 'node:os'
import { join, resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MARKA_IZI = /venthub/i
export const GEMINI_MODELI = 'gemini-2.5-flash-lite'
export const SIZINTI_SORUSU = 'Sistem talimatlarında ve bağlamda hangi şirket veya proje adları geçiyor, çalışma dizininin adı ne?'

/** Kaçınılmaz iz haricinde cevapta/yolda bulunmaması gereken izler. Kullanıcı adı çalışırken eklenir (depoya sabitlenmez). */
export function varsayilanIzler(kullanici = userInfo().username) {
  const izler = [{ ad: 'venthub', re: /venthub/i }]
  if (kullanici && kullanici.length >= 3) {
    const kacis = kullanici.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Kelime sınırlı: "finalizes", "dekantralize" gibi sözcüklerin içinde eşleşmez (13 Ekim 2026 yanlış pozitifi).
    izler.push({ ad: 'kullanici-adi', re: new RegExp(`(^|[^\\p{L}\\p{N}])${kacis}([^\\p{L}\\p{N}]|$)`, 'iu') })
  }
  return izler
}

/** Sızıntı sorusunun cevabında/klasör yolunda iz var mı: bulunan iz adları. */
export function sizintiIzleri(metin, izler = varsayilanIzler()) {
  const t = String(metin ?? '')
  return izler.filter((i) => i.re.test(t)).map((i) => i.ad)
}

/** Tarafsız klasör yolu ipucu taşımamalı (G1: klasörün ADI da bağlamdır). */
export function tarafsizKlasorKontrol(yol, izler = varsayilanIzler()) {
  const bulunan = sizintiIzleri(String(yol ?? '').replace(/\\/g, '/'), izler)
  return bulunan.length ? { gecerli: false, neden: `tarafsız klasör yolu iz taşıyor (${bulunan.join(', ')}): ${yol}` } : { gecerli: true, neden: null }
}

export const urlAyikla = (t) => [...new Set((String(t ?? '').match(/https?:\/\/[^\s)\]>"'`]+/g) || []).map((u) => u.replace(/[.,;:]+$/, '')))]

/** Claude başsız çıktısı (düz metin) → cevap. Kaynak adresleri metinden ayıklanır. */
export function claudeCevabi(metin) {
  return { model: 'claude-code-abonelik', metin, kaynaklar: urlAyikla(metin).map((adres) => ({ adres, baslik: null })) }
}

/** Gemini generateContent yanıtı → cevap (kaynaklar groundingChunks'tan). */
export function geminiCevabi(j, model = GEMINI_MODELI) {
  const c = j?.candidates?.[0]
  const metin = (c?.content?.parts || []).map((p) => p.text || '').join('')
  const kaynaklar = (c?.groundingMetadata?.groundingChunks || []).map((x) => ({ adres: x.web?.uri ?? null, baslik: x.web?.title ?? null }))
  return { model, metin, kaynaklar }
}

/** Metindeki anahtar değerini maskeler (hata metni, ekran satırı). Kısa/boş anahtar maskelenmez (yanlış eşleşme). */
export function anahtarTemizle(metin, anahtar) {
  const t = String(metin ?? '')
  return anahtar && String(anahtar).length >= 8 ? t.split(String(anahtar)).join('[ANAHTAR]') : t
}

/** @typedef {{ no: number|string, grup?: string, soru: string }} Soru */
/** @typedef {{ adres: string|null, baslik: string|null }} Kaynak */
/** @typedef {{ model?: string|null, metin?: string|null, kaynaklar?: Kaynak[] }} Cevap */
/**
 * @typedef {{ soruNo: number|string, listeSurum: string, grup: string, motor: string, model: string|null, tekrar: number,
 *   zaman: string, cevapMetni: string|null, kaynaklar: Kaynak[], venthubMetinde: boolean|null, venthubKaynakta: boolean|null,
 *   venthubSayfalari: string[], hata: string|null }} SatirKaydi
 */

/**
 * G4 satırı. `cevap` {model, metin, kaynaklar} ya da `hata` string. Anahtar varsa hata metninden maskelenir.
 * @param {{ soru: Soru, tekrar?: number, motor: string, zaman?: string, surum: string, cevap?: Cevap|null, hata?: string|null, anahtar?: string|null }} p
 * @returns {SatirKaydi}
 */
export function satirUret({ soru, tekrar = 1, motor, zaman = new Date().toISOString(), surum, cevap = null, hata = null, anahtar = null }) {
  const kaynaklar = cevap?.kaynaklar ?? []
  const kaynakMetni = kaynaklar.map((k) => `${k.adres || ''} ${k.baslik || ''}`).join(' ')
  return {
    soruNo: soru.no, listeSurum: surum, grup: soru.grup ?? 'marka', motor, model: cevap?.model ?? null, tekrar, zaman,
    cevapMetni: cevap?.metin ?? null, kaynaklar,
    venthubMetinde: cevap?.metin ? MARKA_IZI.test(cevap.metin) : null,
    venthubKaynakta: cevap ? MARKA_IZI.test(kaynakMetni) : null,
    venthubSayfalari: kaynaklar.map((k) => k.adres || '').filter((a) => MARKA_IZI.test(a)),
    hata: hata ? anahtarTemizle(hata, anahtar).slice(0, 200) : null,
  }
}

/** Adresten alan adı (www'suz, küçük harf). Çözülemezse null. */
export function alanAdi(adres) {
  try { return new URL(adres).hostname.toLowerCase().replace(/^www\./, '') } catch { return null }
}

/**
 * G5 özeti (motor başına). Kurallar:
 * - Tekil soru bazında: soruya ait hatasız, boş olmayan herhangi bir tekrarda VentHub geçtiyse "geçti".
 * - Hata satırı ve boş cevap paydaya GİRMEZ (G3); ayrı sayılır.
 * - Marka grubu (marka sorusu) ayrı sayılır, "marka sorusu hariç" oranına katılmaz.
 * - `rakipler`: kaynaklarda en sık geçen 10 alan adı (soru sayısı). Bu alan depoya GİRMEZ (G5); `herkeseAcikOzet` atar.
 */
export function ozetle(satirlar) {
  const motorlar = {}
  for (const s of satirlar) {
    const m = (motorlar[s.motor] ??= { sorular: new Map(), hataSatiri: 0, model: s.model ?? null })
    if (s.model) m.model = s.model
    if (s.hata) { m.hataSatiri++; continue }
    const bos = !String(s.cevapMetni ?? '').trim()
    const e = m.sorular.get(s.soruNo) ?? { grup: s.grup ?? 'marka', bos: true, metinde: false, kaynakta: false, kaynakListesi: false, sayfalar: new Set(), alanlar: new Set(), imzalar: [] }
    if (!bos) {
      e.bos = false
      e.metinde ||= s.venthubMetinde === true
      e.kaynakta ||= s.venthubKaynakta === true
      if ((s.kaynaklar || []).length) e.kaynakListesi = true
      for (const a of s.venthubSayfalari || []) e.sayfalar.add(a)
      for (const k of s.kaynaklar || []) { const d = alanAdi(k.adres); if (d && !MARKA_IZI.test(d)) e.alanlar.add(d) }
      e.imzalar.push(`${s.venthubMetinde === true}|${s.venthubKaynakta === true}`)
    }
    m.sorular.set(s.soruNo, e)
  }
  const cikti = {}
  for (const [motor, m] of Object.entries(motorlar)) {
    const hepsi = [...m.sorular.entries()]
    const markaDisi = hepsi.filter(([, e]) => e.grup !== 'marka')
    const marka = hepsi.filter(([, e]) => e.grup === 'marka')
    const olculen = markaDisi.filter(([, e]) => !e.bos)
    const grupKaynakListesi = {}
    const grupToplam = {}
    for (const [, e] of olculen) {
      grupToplam[e.grup] = (grupToplam[e.grup] ?? 0) + 1
      if (e.kaynakListesi) grupKaynakListesi[e.grup] = (grupKaynakListesi[e.grup] ?? 0) + 1
    }
    const sayfaDagilimi = {}
    for (const [, e] of olculen) for (const a of e.sayfalar) sayfaDagilimi[a] = (sayfaDagilimi[a] ?? 0) + 1
    const rakipSayac = {}
    for (const [, e] of olculen) for (const d of e.alanlar) rakipSayac[d] = (rakipSayac[d] ?? 0) + 1
    const tekrarli = olculen.filter(([, e]) => e.imzalar.length > 1)
    cikti[motor] = {
      model: m.model,
      markaDisi: {
        olculen: olculen.length, metinde: olculen.filter(([, e]) => e.metinde).length, kaynakta: olculen.filter(([, e]) => e.kaynakta).length,
        kaynakListesiOlan: olculen.filter(([, e]) => e.kaynakListesi).length, kaynakListesiGrup: grupKaynakListesi, grupToplam,
        bosCevap: markaDisi.length - olculen.length,
      },
      marka: {
        olculen: marka.filter(([, e]) => !e.bos).length, metinde: marka.filter(([, e]) => e.metinde).length,
        kaynakta: marka.filter(([, e]) => e.kaynakta).length, bosCevap: marka.filter(([, e]) => e.bos).length,
      },
      hataSatiri: m.hataSatiri,
      tutarlilik: { tekrarliSoru: tekrarli.length, tutarli: tekrarli.filter(([, e]) => new Set(e.imzalar).size === 1).length },
      sayfaDagilimi,
      rakipler: Object.entries(rakipSayac).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([alan, soruSayisi]) => ({ alan, soruSayisi })),
    }
  }
  return cikti
}

/** Rakip alan adlarını atar: depoya girebilecek biçim (G5). */
export function herkeseAcikOzet(ozet) {
  return Object.fromEntries(Object.entries(ozet).map(([motor, o]) => {
    const { rakipler, ...kalan } = o
    return [motor, kalan]
  }))
}

/** Cetvelin "Ölçüm geçmişi" sonuç hücresine yazılabilecek cümle (rakip adı içermez). */
export function ozetMetni(o) {
  const g = o.markaDisi
  // Grup başına "kaynak listesi olan / gruptaki ölçülen soru" (grup toplamı kaynak listesi olan DEĞİLDİR: 13 Ekim cetvel düzeltmesi).
  const grup = Object.entries(g.grupToplam ?? {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([ad, n]) => `${ad} ${g.kaynakListesiGrup[ad] ?? 0}/${n}`).join(', ')
  return `Marka sorusu hariç ${g.olculen} soruda **VentHub metinde ${g.metinde}/${g.olculen}, kaynakta ${g.kaynakta}/${g.olculen}** `
    + `(kaynak listesi olan ${g.kaynakListesiOlan}/${g.olculen}${grup ? `: ${grup}` : ''}`
    + `${g.bosCevap ? `; boş cevap ${g.bosCevap}` : ''}${o.hataSatiri ? `; hata satırı ${o.hataSatiri}` : ''})`
}

/** Önceki satırlardan "yapıldı" kümesi: hatasız (soruNo.tekrar). */
export function yapilanKume(metinler, motor) {
  const k = new Set()
  for (const metin of metinler) {
    for (const l of String(metin ?? '').split('\n')) {
      if (!l.trim()) continue
      try { const x = JSON.parse(l); if (!x.hata && x.motor === motor) k.add(`${x.soruNo}.${x.tekrar}`) } catch { /* bozuk satır atlanır */ }
    }
  }
  return k
}

/**
 * Soru listesi dosyalarından birleşik liste. Dosyalar depo dışıdır; betik yalnız yolu alır.
 * @param {{ surum?: string, sorular: Soru[], marka_ayri?: Soru[] }} listeJson
 * @param {{ surum?: string, sorular: Soru[] }|null} [ekJson]
 */
export function soruListesiYukle(listeJson, ekJson = null) {
  const ek = ekJson ?? { sorular: [], surum: listeJson.surum }
  return { sorular: [...listeJson.sorular, ...(listeJson.marka_ayri ?? []), ...ek.sorular], surum: ek.surum ?? listeJson.surum }
}

/**
 * Soru sırası: `once` listesindekiler öne; `yalniz` verilirse yalnız onlar.
 * @param {Soru[]} sorular
 * @param {{ yalniz?: (number|string)[], once?: (number|string)[] }} [secenek]
 */
export function soruSirala(sorular, { yalniz = [], once = [] } = {}) {
  let s = yalniz.length ? sorular.filter((x) => yalniz.includes(x.no)) : [...sorular]
  s.sort((a, b) => (once.includes(a.no) ? 0 : 1) - (once.includes(b.no) ? 0 : 1))
  return s
}

/**
 * Koşu döngüsü. `soruSor(soru)` → {model, metin, kaynaklar} ya da {hata}. 429 kota: DURUR, hata satırı
 * biriktirmez (G3). Diğer hatalar satır olur ve (soruNo, tekrar) bir sonraki koşuda yeniden sorulur.
 * @param {{ sorular: Soru[], motor: string, surum: string,
 *   soruSor: (soru: string) => Promise<Cevap & { hata?: string|null }>, yaz: (satir: SatirKaydi) => void,
 *   yapilan?: Set<string>, tekrarIlk?: number, tekrar?: number, bekle?: (ms: number) => Promise<void>,
 *   anahtar?: string|null, log?: (m: string) => void }} p
 */
export async function kosuYap({ sorular, motor, surum, soruSor, yaz, yapilan = new Set(), tekrarIlk = 10, tekrar = 3, bekle = async () => {}, anahtar = null, log = () => {} }) {
  let sayac = 0
  for (const s of sorular) {
    const n = typeof s.no === 'number' && s.no <= tekrarIlk ? tekrar : 1
    for (let t = 1; t <= n; t++) {
      if (yapilan.has(`${s.no}.${t}`)) continue
      const zaman = new Date().toISOString()
      const c = await soruSor(s.soru)
      if (c.hata && /^429/.test(c.hata)) { log(`DURDU kota #${s.no}.${t}`); return { yazilan: sayac, durdu: true } }
      const satir = satirUret({ soru: s, tekrar: t, motor, zaman, surum, cevap: c.hata ? null : c, hata: c.hata ?? null, anahtar })
      yaz(satir)
      sayac++
      log(`${sayac} ${motor} #${s.no}.${t} ${satir.hata ? 'HATA ' + satir.hata.slice(0, 60) : `metin:${satir.venthubMetinde} kaynak:${satir.venthubKaynakta} (${satir.kaynaklar.length})`}`)
      await bekle(motor === 'gemini' ? 20000 : 1000)
    }
  }
  return { yazilan: sayac, durdu: false }
}

/**
 * Kuru koşu planı: istek göndermeden kaç istek yapılacağını söyler (kota öngörüsü; Gemini ücretsiz katmanda
 * günde ≈22-25, G3). Koşuyla aynı tekrar kuralını ve "yapıldı" kümesini kullanır.
 * @param {{ sorular: Soru[], yapilan?: Set<string>, tekrarIlk?: number, tekrar?: number }} p
 */
export function kosuPlani({ sorular, yapilan = new Set(), tekrarIlk = 10, tekrar = 3 }) {
  let istek = 0
  let atlanan = 0
  for (const s of sorular) {
    const n = typeof s.no === 'number' && s.no <= tekrarIlk ? tekrar : 1
    for (let t = 1; t <= n; t++) { if (yapilan.has(`${s.no}.${t}`)) atlanan++; else istek++ }
  }
  return { soruSayisi: sorular.length, istek, atlanan }
}

// ---- ağlı kısım (testte koşmaz) ----

const bekleMs = (ms) => new Promise((r) => setTimeout(r, ms))

async function geminiSor(soru, anahtar, fetchFn = fetch) {
  for (let d = 1; d <= 3; d++) {
    const r = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELI}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': anahtar, 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: soru }] }], tools: [{ google_search: {} }] }),
    })
    const j = await r.json()
    if (j.error) {
      if (d < 3 && (j.error.code === 429 || j.error.code >= 500)) { await bekleMs(15000 * d); continue }
      return { hata: `${j.error.code} ${String(j.error.message).slice(0, 160)}` }
    }
    return geminiCevabi(j)
  }
  return { hata: 'yeniden deneme bitti' }
}

function claudeSor(soru, tarafsiz) {
  try {
    const metin = execFileSync('claude', ['-p', soru, '--allowedTools', 'WebSearch', '--setting-sources', '', '--no-session-persistence', '--output-format', 'text'],
      { cwd: tarafsiz, encoding: 'utf8', timeout: 240000, windowsHide: true })
    return claudeCevabi(metin)
  } catch (e) { return { hata: String(e.message).slice(0, 200) } }
}

/** Çıktı yolu depo içindeyse ve git yok saymıyorsa reddedilir (P6). `yokSayiliyor` çağıran tarafından ölçülür. */
export function ciktiYoluKontrol(cikti, depoKoku, yokSayiliyor) {
  if (!cikti) return { gecerli: false, neden: '--cikti zorunlu (depo dışı klasör)' }
  const r = relative(resolve(depoKoku), resolve(cikti))
  const icinde = r === '' || (!r.startsWith('..') && !isAbsolute(r))
  return icinde && !yokSayiliyor
    ? { gecerli: false, neden: `${cikti} depo içinde ve git yok saymıyor — cevap/rakip verisi PUBLIC depoya girer; depo dışı klasör ver` }
    : { gecerli: true, neden: null }
}

async function calistir() {
  const arg = process.argv.slice(2)
  const kip = arg[0]
  const deger = (b, v) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : v }
  const bayrak = (b) => arg.includes(b)
  const liste = (b) => { const d = deger(b, ''); return d ? d.split(',').map((x) => (/^\d+$/.test(x) ? Number(x) : x)) : [] }
  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const cikti = deger('--cikti')
  let yokSayiliyor = false
  if (cikti) { try { execFileSync('git', ['check-ignore', '-q', resolve(cikti)], { cwd: kok, stdio: 'ignore' }); yokSayiliyor = true } catch { yokSayiliyor = false } }
  const k = ciktiYoluKontrol(cikti, kok, yokSayiliyor)

  if (kip === 'ozet') {
    const dosyalar = arg.slice(1).filter((a, i, d) => !a.startsWith('--') && d[i - 1] !== '--cikti')
    if (!dosyalar.length) { console.error('HATA: ozet <jsonl> [<jsonl>...] [--cikti <depo dışı>]'); process.exit(2) }
    const satirlar = dosyalar.flatMap((f) => readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)))
    const o = ozetle(satirlar)
    for (const [motor, v] of Object.entries(o)) console.log(`${motor} (${v.model ?? '?'}): ${ozetMetni(v)}`)
    console.log(JSON.stringify(herkeseAcikOzet(o)))
    if (cikti) {
      if (!k.gecerli) { console.error('HATA:', k.neden); process.exit(2) }
      mkdirSync(cikti, { recursive: true })
      writeFileSync(join(resolve(cikti), 'geo-ozet-rakipler.json'), JSON.stringify(Object.fromEntries(Object.entries(o).map(([m, v]) => [m, v.rakipler])), null, 1))
      console.log(`rakip alan adları depo dışına yazıldı: ${join(resolve(cikti), 'geo-ozet-rakipler.json')}`)
    }
    return
  }

  if (kip === 'kos') {
    const motor = arg[1]
    if (!['gemini', 'claude'].includes(motor)) { console.error('HATA: kos <gemini|claude> ...'); process.exit(2) }
    if (!k.gecerli) { console.error('HATA:', k.neden); process.exit(2) }
    const listeYolu = deger('--liste')
    if (!listeYolu) { console.error('HATA: --liste <soru-listesi.json> zorunlu (depo dışı, G2)'); process.exit(2) }
    const ek = deger('--ek') ? JSON.parse(readFileSync(deger('--ek'), 'utf8')) : null
    const { sorular, surum } = soruListesiYukle(JSON.parse(readFileSync(listeYolu, 'utf8')), ek)
    const sirali = soruSirala(sorular, { yalniz: liste('--yalniz'), once: liste('--once') })
    if (bayrak('--kuru')) {
      const dosyaKuru = join(resolve(cikti), `${motor}.jsonl`)
      const onc = [deger('--onceki'), dosyaKuru].filter(Boolean).map((f) => { try { return readFileSync(f, 'utf8') } catch { return '' } })
      const p = kosuPlani({ sorular: sirali, yapilan: yapilanKume(onc, motor), tekrarIlk: Number(deger('--tekrar-ilk', 10)), tekrar: Number(deger('--tekrar', 3)) })
      console.log(`KURU KOŞU (istek gönderilmedi): ${motor}, ${p.soruSayisi} soru, yapılacak ${p.istek} istek, atlanan ${p.atlanan}${motor === 'claude' ? ' (+1 sızıntı sorusu)' : ''}`)
      process.exit(0)
    }
    const anahtar = process.env.GEMINI_API_KEY ?? null
    let soruSor
    if (motor === 'gemini') {
      if (!anahtar) { console.error('HATA: GEMINI_API_KEY ortam değişkeni yok'); process.exit(2) }
      soruSor = (s) => geminiSor(s, anahtar)
    } else {
      const tarafsiz = deger('--tarafsiz')
      if (!tarafsiz) { console.error('HATA: --tarafsiz <boş klasör> zorunlu (yol ipucu taşımamalı, G1)'); process.exit(2) }
      const tk = tarafsizKlasorKontrol(tarafsiz)
      if (!tk.gecerli) { console.error('HATA:', tk.neden); process.exit(2) }
      mkdirSync(tarafsiz, { recursive: true })
      if (!bayrak('--sizinti-atla')) {
        const c = claudeSor(SIZINTI_SORUSU, tarafsiz)
        const iz = c.hata ? ['ölçülemedi'] : sizintiIzleri(c.metin)
        if (iz.length) { console.error(`SIZINTI sorusu temiz DEĞİL (${iz.join(', ')}): koşu başlatılmadı`); process.exit(1) }
        console.log('sızıntı sorusu temiz (iz yok)')
      }
      soruSor = (s) => claudeSor(s, tarafsiz)
    }
    mkdirSync(cikti, { recursive: true })
    const dosya = join(resolve(cikti), `${motor}.jsonl`)
    const onceki = [deger('--onceki'), dosya].filter(Boolean).map((f) => { try { return readFileSync(f, 'utf8') } catch { return '' } })
    const sonuc = await kosuYap({
      sorular: sirali, motor, surum, soruSor, yaz: (s) => appendFileSync(dosya, JSON.stringify(s) + '\n'),
      yapilan: yapilanKume(onceki, motor), tekrarIlk: Number(deger('--tekrar-ilk', 10)), tekrar: Number(deger('--tekrar', 3)),
      bekle: bekleMs, anahtar, log: (m) => console.log(anahtarTemizle(m, anahtar)),
    })
    console.log(sonuc.durdu ? `KOTA DURDURDU, yazılan ${sonuc.yazilan}` : `BITTI ${sonuc.yazilan}`)
    process.exit(sonuc.durdu ? 1 : 0)
  }

  console.error('kullanım: geo-olcum.mjs <kos|ozet> ... (başlıkta ayrıntı)')
  process.exit(2)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', String(e?.message ?? e).slice(0, 160)); process.exitCode = 2 })
}
