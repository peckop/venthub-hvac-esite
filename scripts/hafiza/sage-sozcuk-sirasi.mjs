// REC-363 son ölçüm: sage'in GERÇEK sözcük araması (memory_search) — AYRI, geçici bir proje kökünde.
// Projenin sage'ine YAZILMAZ: kök C:/tmp/rec363-sage (git deposu değil). 501 hafıza metni `remember` ile
// yüklenir (dosya adı metne/etikete KATILMAZ — sorular adı bilerek kullanmıyor), sonra 10 soru sorulur.
// Çıktı: sage-fts.json = { soru: [dosya adı sırası] }. Ardından `sage-rrf-olcum.mjs` birleştirir.
// KOŞUM: HAFIZA_KOK=<hafıza dizini> SAGE_CLI=<ana ağaç>/tools/wrongstack-mcp/node_modules/@wrongstack/sage-mcp/dist/cli.js
//   node sage-sozcuk-sirasi.mjs   (gomme-kiyasi.mjs ile aynı ölçüm dizininde)
// ⚠SONRA TEMİZLE: geçici kökün daemon'u pencere kapanınca da ayakta kalır (README "kalıcı servis") —
//   komut satırında 'rec363-sage' geçen node sürecini durdur, C:/tmp/rec363-sage'i sil.
// Ölçülen cevap biçimi: memory_search TEK content parçası, içinde satır başına bir hafıza (NDJSON);
// sage metni saklarken küçük değişiklik yapabiliyor → eşleme ilk 40 karakterle.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const HAFIZA = process.env.HAFIZA_KOK
const CLI = process.env.SAGE_CLI
const KOK = 'C:/tmp/rec363-sage'
fs.mkdirSync(KOK, { recursive: true })

const adlar = fs.readdirSync(HAFIZA).filter((f) => f.endsWith('.md') && f !== 'MEMORY.md').map((f) => f.slice(0, -3)).sort()
const metin = (d) => {
  const ham = fs.readFileSync(path.join(HAFIZA, `${d}.md`), 'utf8')
  const m = ham.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const desc = ((m ? m[1] : '').match(/^description:\s*(.*)$/m) || [, ''])[1].replace(/^["']|["']$/g, '')
  return `${desc}\n${m ? m[2] : ham}`.replace(/\[\[[^\]]+\]\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 1500)
}
const metinler = adlar.map(metin)
const SORULAR = {
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

const p = spawn(process.execPath, [CLI, '--project-root', KOK, '--stdio', '--writable'], { stdio: ['pipe', 'pipe', 'inherit'] })
let tampon = ''
const bekleyen = new Map()
let sayac = 0
p.stdout.on('data', (d) => {
  tampon += d
  let i
  while ((i = tampon.indexOf('\n')) >= 0) {
    const satir = tampon.slice(0, i); tampon = tampon.slice(i + 1)
    if (!satir.trim()) continue
    let j; try { j = JSON.parse(satir) } catch { continue }
    if (j.id !== undefined && bekleyen.has(j.id)) { bekleyen.get(j.id)(j); bekleyen.delete(j.id) }
  }
})
const istek = (method, params) => new Promise((res) => { const id = ++sayac; bekleyen.set(id, res); p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n') })
const arac = async (name, args) => { const r = await istek('tools/call', { name, arguments: args }); if (r.error) throw new Error(JSON.stringify(r.error)); return r.result }

await istek('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'rec363', version: '1' } })
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')

const varMi = fs.existsSync('sage-fts-yuklendi')
if (!varMi) {
  let hata = 0
  for (let i = 0; i < metinler.length; i++) {
    const r = await arac('remember', { text: metinler[i], kind: 'fact', persistence: 'long_lived', no_auto_audience: true })
    if (r.isError) { hata++; if (hata < 3) console.error('remember hata', JSON.stringify(r).slice(0, 300)) }
  }
  fs.writeFileSync('sage-fts-yuklendi', String(metinler.length - hata))
  console.log('yuklendi', metinler.length - hata, '/', metinler.length)
}

const indeks = new Map(metinler.map((t, i) => [t, adlar[i]]))
// sage metni saklarken küçük değişiklik yapabiliyor (ölçüldü: birkaç sonuç birebir eşleşmedi) → ilk 40 karakterle eşle
const bas = (s) => String(s).normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 40)
const basIndeks = new Map(metinler.map((t, i) => [bas(t), adlar[i]]))
const cikti = {}
let ornek = true
for (const [id, q] of Object.entries(SORULAR)) {
  const r = await arac('memory_search', { query: q, limit: 100 })
  const govde = r.content?.map((c) => c.text).join('') ?? ''
  if (ornek) { fs.writeFileSync('sage-fts-ornek.json', govde.slice(0, 4000)); ornek = false }
  // Ölçüldü: her sonuç AYRI bir content parçası, her parça tek bir hafıza nesnesi (JSON).
  // Ölçüldü: tek parça, içinde satır başına bir hafıza nesnesi (NDJSON).
  const nesneler = (r.content ?? []).flatMap((c) => String(c.text).split('\n'))
    .map((s) => { try { return JSON.parse(s) } catch { return null } }).filter(Boolean)
  const liste = nesneler.map((x) => {
    const t = x.text ?? x.memory?.text ?? x.content ?? ''
    return indeks.get(t) ?? basIndeks.get(bas(t)) ?? `?${String(t).slice(0, 30)}`
  })
  cikti[id] = liste
  console.log(id, 'sonuc', liste.length, liste.slice(0, 3).join(' | '))
}
fs.writeFileSync('sage-fts.json', JSON.stringify(cikti, null, 1))
p.kill()
