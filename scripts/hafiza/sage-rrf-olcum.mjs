// REC-363 son ölçüm: sage GERÇEK sözcük sırası (sage-fts.json) + C1 (yerel e5) → RRF, 500 dosya, aynı 10 soru.
// sage ilk 100 dışında kalan belge sözcük teriminden 0 alır (sage de öyle: bulmadığını birleştiremez).
// KOŞUM: sage-sozcuk-sirasi.mjs'ten SONRA, aynı dizinde: HAFIZA_KOK=<hafıza dizini> node sage-rrf-olcum.mjs
// Sonuç (2026-09-22): sage sözcük tek başına ilk10 7/8 = RRF 7/8, ilk1 4 → 1 → kurulmadı (belge §7).
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from '@huggingface/transformers'

const HAFIZA = process.env.HAFIZA_KOK
const adlar = fs.readdirSync(HAFIZA).filter((f) => f.endsWith('.md') && f !== 'MEMORY.md').map((f) => f.slice(0, -3)).sort()
const metin = (d) => {
  const ham = fs.readFileSync(path.join(HAFIZA, `${d}.md`), 'utf8')
  const m = ham.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const desc = ((m ? m[1] : '').match(/^description:\s*(.*)$/m) || [, ''])[1].replace(/^["']|["']$/g, '')
  return `${desc}\n${m ? m[2] : ham}`.replace(/\[\[[^\]]+\]\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 1500)
}
const SORU = JSON.parse(fs.readFileSync('sage-fts.json', 'utf8'))
const Q = {
  S1: 'Haftalık kendiliğinden çalışan bir kontrol önermek istiyorum, buna izin var mı?',
  S2: 'Bir paketi tek sürüme çakmışız, sebebini kimse bilmiyor; ne yapılır?',
  S3: 'Testte sahte veritabanı yanıtı kullandım, test yeşil ama canlıda patladı.',
  S4: 'Bu tabloda kategori ilişkisi boş görünüyor, veri bozuk mu?',
  S5: 'Bizde zaten benzeri var, dış araca gerek yok diyebilir miyim?',
  S6: 'Komut 0 ile bitti, iş tamam sayılır mı?',
  S7: 'Koda baktım hiçbir yerde import edilmiyor, paketi sileyim mi?',
  S8: 'İki ayrı yöntemle ölçtüm ikisi de aynı sonucu verdi ama ikisi de aynı deseni arıyordu.',
  S9: 'Kargo firması API anahtarı nerede saklanıyor?',
  S10: "Tailwind 4'e geçiş kararı ne zaman alındı?",
}
const BEK = {
  S1: 'zamanlayici-yasagi-genelleme-degil', S2: 'surum-sabitleme-onculugu-ops', S3: 'stub-gercegi-taklit-etmiyorsa-test-kordur',
  S4: 'tabloya-hukum-once-sema-okunur', S5: 'sahiplik-olcut-degildir', S6: 'cikis-kodu-kanit-degil-sayilar-kanit',
  S7: 'statik-import-sifir-kullanilmiyor-demek-degil', S8: 'iki-olcum-ayni-kor-nokta-dogrulama-degil',
}
const ext = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', { dtype: 'fp32' })
const gom = async (t) => (await ext(t, { pooling: 'mean', normalize: true })).tolist()
const dv = []
const mt = adlar.map(metin)
for (let i = 0; i < mt.length; i += 16) dv.push(...(await gom(mt.slice(i, i + 16).map((t) => 'passage: ' + t))))
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0)

const sonuc = {}
let s1 = 0, s3 = 0, s10 = 0, l10 = 0, eslesmeyen = 0
for (const [id, q] of Object.entries(Q)) {
  const [qv] = await gom(['query: ' + q])
  const c1 = adlar.map((a, i) => [dot(qv, dv[i]), a]).sort((x, y) => y[0] - x[0]).map((x) => x[1])
  const lex = SORU[id]
  eslesmeyen += lex.filter((x) => x.startsWith('?')).length
  const rrf = new Map()
  c1.forEach((a, r) => rrf.set(a, 1 / (60 + r + 1)))
  lex.forEach((a, r) => { if (!a.startsWith('?')) rrf.set(a, (rrf.get(a) ?? 0) + 1 / (60 + r + 1)) })
  const sira = [...rrf.entries()].sort((x, y) => y[1] - x[1]).map((x) => x[0])
  const b = BEK[id]
  const r = b ? sira.indexOf(b) + 1 : null
  const lr = b ? lex.indexOf(b) + 1 || null : null
  if (b) { if (r === 1) s1++; if (r <= 3) s3++; if (r <= 10) s10++; if (lr && lr <= 10) l10++ }
  sonuc[id] = { beklenen: b ?? null, rrfSira: r, sageSozcukSira: lr, c1Sira: b ? c1.indexOf(b) + 1 : null, ilk10: sira.slice(0, 10) }
  console.log(id, 'RRF', r, '· sage sözcük', lr ?? '(ilk100 dışı)', '· C1', sonuc[id].c1Sira, '·', sira.slice(0, 3).join(' | '))
}
console.log(`ÖZET 500 dosya: sage-sözcük ilk10 ${l10}/8 · RRF(sage+C1) ilk1 ${s1}/8 · ilk3 ${s3}/8 · ilk10 ${s10}/8 · eşleşmeyen sözcük sonucu ${eslesmeyen}`)
fs.writeFileSync('rrf-sage.json', JSON.stringify(sonuc, null, 1))
