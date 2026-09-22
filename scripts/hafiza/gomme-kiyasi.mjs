// REC-363 kıyas: aynı 20 ders + OPS'un 10 sorusu (Linear yorum b2a66181) → taşıyıcı başına
// doğruluk · gecikme · bedel · tutarlılık. Sonuç belgesi: docs/audits/rec363-gomme-kiyasi-2026-09-22.md
//
// KOŞUM (depo bağımlılığı DEĞİL — ölçüm aracı): kısa yollu boş bir dizinde
//   npm init -y && npm install @huggingface/transformers@3
//   HAFIZA_KOK=<hafıza dizini> node <bu dosya> [C0,C1,B1,A,H ...]   (argümansız = hepsi)
// Sır: NVIDIA_API_KEY ortamdan; basılmaz. Çıktı: çalışma dizininde sonuc.json (+ özet stdout).
// Güvenlik: fikstür OPS'un seçtiği 20 ders, güvenlik etiketli ders YOK (B kolu metni dışarı gönderir).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const KOK = process.env.HAFIZA_KOK
if (!KOK) { console.error('HAFIZA_KOK tanimli degil'); process.exit(2) }
const FIKSTUR = ['zamanlayici-yasagi-genelleme-degil', 'surum-sabitleme-onculugu-ops', 'hukum-soylemek-yazmak-degildir',
  'stub-gercegi-taklit-etmiyorsa-test-kordur', 'kurali-yazmak-uygulamak-degildir', 'senaryo-kurulumu-dogrulanmadan-sonuc-okunmaz',
  'sahiplik-olcut-degildir', 'arac-atil-kalmaz-kullanim-yeri-yazilir', 'hazir-acik-kaynak-once-aranir',
  'migration-kontrol-listesi-hatirlanmaz-yazilir', 'rapor-kategori-basina-tek-konu', 'yama-degil-profesyonel-arac',
  'tabloya-hukum-once-sema-okunur', 'olcut-dogru-evren-yanlis-is-emri-dogurur', 'compact-is-not-a-wake-trigger',
  'karar-sorusu-duz-konusma', 'cikis-kodu-kanit-degil-sayilar-kanit', 'yesil-kapi-gorundugunu-kanitlamaz',
  'iki-olcum-ayni-kor-nokta-dogrulama-degil', 'statik-import-sifir-kullanilmiyor-demek-degil']
const SORULAR = [
  ['S1', 'Haftalık kendiliğinden çalışan bir kontrol önermek istiyorum, buna izin var mı?', 1],
  ['S2', 'Bir paketi tek sürüme çakmışız, sebebini kimse bilmiyor; ne yapılır?', 2],
  ['S3', 'Testte sahte veritabanı yanıtı kullandım, test yeşil ama canlıda patladı.', 4],
  ['S4', 'Bu tabloda kategori ilişkisi boş görünüyor, veri bozuk mu?', 13],
  ['S5', 'Bizde zaten benzeri var, dış araca gerek yok diyebilir miyim?', 7],
  ['S6', 'Komut 0 ile bitti, iş tamam sayılır mı?', 17],
  ['S7', 'Koda baktım hiçbir yerde import edilmiyor, paketi sileyim mi?', 20],
  ['S8', 'İki ayrı yöntemle ölçtüm ikisi de aynı sonucu verdi ama ikisi de aynı deseni arıyordu.', 19],
  ['S9', 'Kargo firması API anahtarı nerede saklanıyor?', null],
  ['S10', 'Tailwind 4\'e geçiş kararı ne zaman alındı?', null],
]
// EVREN=tum (REC-363 ön şartı, OPS 09-22): aynı sorular BÜTÜN hafıza dizininde (~500 dosya) sorulur —
// beklenen ders artık 20 değil ~500 aday arasında aranır. Yalnız yerel kollar anlamlıdır (A/H bütün
// hafızayı istemine sığdıramaz, B veriyi dışarı çıkarır). Çıktı ayrı dosyaya: sonuc-tum.json.
const TUM = process.env.EVREN === 'tum'
const DERSLER = TUM
  ? fs.readdirSync(KOK).filter((f) => f.endsWith('.md') && f !== 'MEMORY.md').map((f) => f.slice(0, -3)).sort()
  : FIKSTUR
/** Sorudaki beklenen numara FIKSTUR'a göredir; evrendeki sırasına çevrilir (1 tabanlı). */
const bek = (n) => (n ? DERSLER.indexOf(FIKSTUR[n - 1]) + 1 : null)
if (FIKSTUR.some((d) => !DERSLER.includes(d))) { console.error('fikstur dersi evrende yok'); process.exit(2) }
const CIKTI = TUM ? 'sonuc-tum.json' : 'sonuc.json'
const TEKRAR = TUM ? 1 : 3 // gömme kolları 3 turda birebir aynı ölçüldü (10/10) — tekrar bilgi taşımıyor
const MAKS = 1500 // karakter — küçük modellerin 512 jeton sınırına sığsın, hepsine aynı kesim

// Ders metni = frontmatter description + gövde; dosya adı (slug) METNE KATILMAZ (sorular adı bilerek kullanmıyor).
const dersMetni = DERSLER.map((d) => {
  const ham = fs.readFileSync(path.join(KOK, `${d}.md`), 'utf8')
  const m = ham.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const fm = m ? m[1] : ''
  const desc = (fm.match(/^description:\s*(.*)$/m) || [, ''])[1].replace(/^["']|["']$/g, '')
  const govde = m ? m[2] : ham
  return `${desc}\n${govde}`.replace(/\[\[[^\]]+\]\]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAKS)
})

const kos = (a, b) => { let s = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { s += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] } return s / Math.sqrt(na * nb) }

// ---- C: yerel ONNX (transformers.js) ----
async function yerel(model, onek) {
  const { pipeline } = await import('@huggingface/transformers')
  const t0 = Date.now()
  const ext = await pipeline('feature-extraction', model, { dtype: 'fp32' })
  const yukleme = Date.now() - t0
  const gom = async (metinler) => (await ext(metinler, { pooling: 'mean', normalize: true })).tolist()
  const dv = []
  for (let i = 0; i < dersMetni.length; i += 16) dv.push(...(await gom(dersMetni.slice(i, i + 16).map((t) => onek.p + t))))
  return { yukleme, sorgu: async (q) => { const [v] = await gom([onek.q + q]); return dv.map((d) => kos(v, d)) }, bedel: () => 0 }
}

// ---- B: NVIDIA OpenAI-uyumlu gömme ucu ----
async function nvidia(model, turlu) {
  const anahtar = process.env.NVIDIA_API_KEY
  if (!anahtar) throw new Error('NVIDIA_API_KEY yok')
  const gom = async (metinler, tur) => {
    const govde = { model, input: metinler, encoding_format: 'float' }
    if (turlu) Object.assign(govde, { input_type: tur, truncate: 'END' })
    const r = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST', headers: { authorization: `Bearer ${anahtar}`, 'content-type': 'application/json' }, body: JSON.stringify(govde),
    })
    if (!r.ok) throw new Error(`nvidia ${model} ${r.status} ${(await r.text()).slice(0, 200)}`)
    return (await r.json()).data.map((x) => x.embedding)
  }
  const dv = []
  for (let i = 0; i < dersMetni.length; i += 10) dv.push(...(await gom(dersMetni.slice(i, i + 10), 'passage')))
  return { yukleme: 0, sorgu: async (q) => { const [v] = await gom([q], 'query'); return dv.map((d) => kos(v, d)) }, bedel: () => 0 }
}

// ---- A: başsız Haiku, 20 dersin kısa özetine göre sıralama ----
function haiku(aday = null) {
  let toplam = 0
  return {
    yukleme: 0,
    bedel: () => toplam,
    sorgu: async (q) => {
      // aday verilirse (hibrit): yalnız ön süzgecin ilk K dersi Haiku'ya gider; ötekiler 0 puan.
      const secili = aday ? await aday(q) : DERSLER.map((_, i) => i)
      const katalog = secili.map((i) => `${i + 1}. ${dersMetni[i].slice(0, 400)}`).join('\n')
      const istem = `Aşağıda numaralı ${secili.length} proje dersi var. Soru için en ilgili dersleri puanla.\n` +
        `Yalnız JSON döndür: {"puan":{"<no>":<0-100>, ...}} — listedeki dersin HEPSİ için puan ver; ilgisizse 0-10.\n\nDERSLER:\n${katalog}\n\nSORU: ${q}`
      // ⚠Sade bayraklar ZORUNLU (ölçüldü 09-22): bayraksız `claude -p` bu makinede ~257k jeton bağlam taşıyıp
      // "Prompt is too long" veriyor (eklenti/MCP/skill tanımları). --bare OAuth'u kapatıyor (API anahtarı ister).
      const cikti = execFileSync('claude', ['-p', '--model', 'haiku', '--output-format', 'json', '--max-turns', '1', '--tools', '',
        '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--disable-slash-commands', '--setting-sources', '',
        '--system-prompt', 'Sen bir sıralama aracısın. Yalnız istenen JSON\'u döndür.'], {
        input: istem, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 180000,
      })
      const j = JSON.parse(cikti)
      toplam += j.total_cost_usd ?? 0
      const m = String(j.result).match(/\{[\s\S]*\}/)
      const p = m ? JSON.parse(m[0]).puan : {}
      return DERSLER.map((_, i) => Number(p[String(i + 1)] ?? 0) / 100)
    },
  }
}

// ---- L: sözcük araması (BM25) — sage'in kelime yolunun YAKLAŞIĞI (sage FTS5 kullanıyor; burada aynı
// sınıf: kök bulma yok, Türkçe küçük harf, harf dışı ayraç). Sage'in kendi sıralaması DEĞİL — belgede yazılı.
function bm25() {
  const tok = (s) => s.toLocaleLowerCase('tr').split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1)
  const belgeler = dersMetni.map(tok)
  const N = belgeler.length
  const ort = belgeler.reduce((a, b) => a + b.length, 0) / N
  const df = new Map()
  for (const b of belgeler) for (const w of new Set(b)) df.set(w, (df.get(w) ?? 0) + 1)
  const tf = belgeler.map((b) => { const m = new Map(); for (const w of b) m.set(w, (m.get(w) ?? 0) + 1); return m })
  const k1 = 1.2, bb = 0.75
  return {
    yukleme: 0, bedel: () => 0,
    sorgu: async (q) => {
      const qs = [...new Set(tok(q))]
      return tf.map((m, i) => qs.reduce((s, w) => {
        const f = m.get(w) ?? 0
        if (!f) return s
        const idf = Math.log(1 + (N - df.get(w) + 0.5) / (df.get(w) + 0.5))
        return s + idf * (f * (k1 + 1)) / (f + k1 * (1 - bb + bb * belgeler[i].length / ort))
      }, 0))
    },
  }
}

// ---- R: RRF birleşimi (sage'in vectorRecall'u sözcük sonucu ile böyle birleştiriyor, project-server.js RRF).
// Puan = Σ 1/(60 + sıra). Mutlak eşik anlamlı değil — yalnız sıra ölçütleri okunur.
async function rrf() {
  const c1 = await yerel('Xenova/multilingual-e5-small', { q: 'query: ', p: 'passage: ' })
  const l = bm25()
  const sira = (p) => { const r = new Array(p.length); p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).forEach(([, i], s) => { r[i] = s + 1 }); return r }
  return {
    yukleme: c1.yukleme, bedel: () => 0,
    sorgu: async (q) => { const a = sira(await c1.sorgu(q)); const b = sira(await l.sorgu(q)); return a.map((x, i) => 1 / (60 + x) + 1 / (60 + b[i])) },
  }
}

async function hibrit(k) {
  const c1 = await yerel('Xenova/multilingual-e5-small', { q: 'query: ', p: 'passage: ' })
  const h = haiku(async (q) => (await c1.sorgu(q)).map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).slice(0, k).map((x) => x[1]))
  return { ...h, yukleme: c1.yukleme }
}

const KOLLAR = [
  ['C0 yerel all-MiniLM-L6-v2 (İngilizce, vector-memory varsayılanı)', () => yerel('Xenova/all-MiniLM-L6-v2', { q: '', p: '' })],
  ['C1 yerel multilingual-e5-small', () => yerel('Xenova/multilingual-e5-small', { q: 'query: ', p: 'passage: ' })],
  ['C2 yerel paraphrase-multilingual-MiniLM-L12-v2', () => yerel('Xenova/paraphrase-multilingual-MiniLM-L12-v2', { q: '', p: '' })],
  // REC-363'ün adadığı iki model (llama-3.2-nv-embedqa-1b-v2, baai/bge-m3) 410 GONE — EOL 2026-05-18 / 2026-08-25
  // (2026-09-22 ölçüldü). Yerlerine /v1/models listesindeki çok dilli iki güncel model:
  ['B1 NVIDIA nemotron-3-embed-1b', () => nvidia('nvidia/nemotron-3-embed-1b', true)],
  // llama-3.2-nv-embedqa-1b-v1 listede ama bu hesaba 404 (ölçüldü) → mistral-7b-v2
  ['B2 NVIDIA nv-embedqa-mistral-7b-v2', () => nvidia('nvidia/nv-embedqa-mistral-7b-v2', true)],
  ['A  başsız Haiku (claude -p)', async () => haiku()],
  ['H  hibrit: C1 ilk 10 → Haiku sıralar', async () => hibrit(10)],
  // EVREN=tum ölçümü (09-22): C1'in beklenen dersi ~500 içinde en kötü 31. sırada → ön süzgeç 50.
  ['H50 hibrit: C1 ilk 50 → Haiku sıralar', async () => hibrit(50)],
  ['L  sözcük BM25 (sage kelime yolu yaklaşığı)', async () => bm25()],
  ['R  RRF: C1 + BM25', async () => rrf()],
]

const secim = process.argv[2] ? process.argv[2].split(',') : null
const sonuc = fs.existsSync(CIKTI) ? JSON.parse(fs.readFileSync(CIKTI, 'utf8')) : {}
const EOL = { 'B1 NVIDIA llama-3.2-nv-embedqa-1b-v2': 1, 'B2 NVIDIA baai/bge-m3': 1 }
for (const k of Object.keys(sonuc)) if (EOL[k]) { sonuc[`${k} — EOL (410)`] = sonuc[k]; delete sonuc[k] }
for (const [ad, kur] of KOLLAR) {
  if (secim && !secim.some((s) => ad.startsWith(s))) continue
  let kol
  try { kol = await kur() } catch (e) { sonuc[ad] = { hata: String(e).slice(0, 300) }; console.log(ad, 'HATA', String(e).slice(0, 200)); continue }
  const kayit = { yukleme_ms: kol.yukleme, sorular: {} }
  for (const [id, q, fikstNo] of SORULAR) {
    const beklenen = bek(fikstNo)
    const turlar = []
    for (let t = 0; t < TEKRAR; t++) {
      const t0 = performance.now()
      const puan = await kol.sorgu(q)
      const ms = performance.now() - t0
      const sira = puan.map((p, i) => [p, i + 1]).sort((a, b) => b[0] - a[0])
      turlar.push({ ms: Math.round(ms), ilk3: sira.slice(0, 3).map((x) => x[1]), ilk10: sira.slice(0, 10).map((x) => DERSLER[x[1] - 1]), enYuksek: sira[0][0],
        beklenenSira: beklenen ? sira.findIndex((x) => x[1] === beklenen) + 1 : null,
        beklenenPuan: beklenen ? puan[beklenen - 1] : null })
    }
    kayit.sorular[id] = { beklenen, turlar }
  }
  kayit.bedel_usd = kol.bedel()
  sonuc[ad] = kayit
  fs.writeFileSync(CIKTI, JSON.stringify(sonuc, null, 1))
  console.log(ad, 'bitti')
}

// ---- özet ----
const medyan = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN }
for (const [ad, k] of Object.entries(sonuc)) {
  if (k.hata) { console.log(`${ad} | HATA ${k.hata}`); continue }
  const poz = Object.values(k.sorular).filter((s) => s.beklenen)
  const neg = Object.values(k.sorular).filter((s) => !s.beklenen)
  const t1 = poz.filter((s) => s.turlar[0].beklenenSira === 1).length
  const t3 = poz.filter((s) => s.turlar[0].beklenenSira <= 3).length
  const t10 = poz.filter((s) => s.turlar[0].beklenenSira <= 10).length
  const pozPuan = medyan(poz.map((s) => s.turlar[0].beklenenPuan))
  const negMaks = Math.max(...neg.map((s) => s.turlar[0].enYuksek))
  const pozEnDusuk = Math.min(...poz.map((s) => s.turlar[0].beklenenPuan))
  const tutarli = Object.values(k.sorular).filter((s) => s.turlar.every((t) => t.ilk3.join() === s.turlar[0].ilk3.join())).length
  const ms = medyan(Object.values(k.sorular).flatMap((s) => s.turlar.map((t) => t.ms)))
  console.log(`${ad} | ilk1 ${t1}/8 | ilk3 ${t3}/8 | ilk10 ${t10}/8 | poz medyan ${pozPuan.toFixed(3)} en düşük ${pozEnDusuk.toFixed(3)} | neg maks ${negMaks.toFixed(3)} | tutarlı ${tutarli}/10 | sorgu ${Math.round(ms)} ms | yükleme ${k.yukleme_ms} ms | bedel $${(k.bedel_usd ?? 0).toFixed(4)}`)
}
