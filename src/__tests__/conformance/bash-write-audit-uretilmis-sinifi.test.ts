import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn).
 * Gerekçe ve ölçülmüş amplifikasyon: `docs/standards/fleet-mechanism-standard.md` §13.
 * Bu dosya her kolda gerçek bir depo + worktree kurar (alt süreç ağırlıklı).
 */
vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-BASH-WRITE-4 · ÜRETİLMİŞ artefakt ihlali DİKİŞ YERİ ihlali DEĞİLDİR.
 *
 * ÖLÇÜLMÜŞ VAKA (2026-08-30): kanca üç ayrı turda öttü ve üçünde de bulduğu şey
 * `post-commit` üretecinin arka planda yazdığı companion `.md`'lerdi
 * (`bash-write-audit.md`, `lane-precommit.md`, `AboutPage.md`, `board.md`). Hiçbiri elle
 * yazılmadı, hiçbiri bir şeridin işine dokunmadı — ama alarm "başka şeridin dosyasına SEN
 * yazdın" deyip `exit 2` ile döndü ve karşı şeride pano notu düştü.
 *
 * NİÇİN ONARILDI: yanlış alarm bedavaya gelmez. Sürekli öten kapı görmezden gelinir —
 * gürültü, kapıyı KÖR ETMENİN yavaş yoludur. Bu depoda aynı hüküm defalarca yazıldı.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ. Yalnız "companion susuyor" kolu yeşilse, kapının
 * TAMAMEN sökülmüş olması da aynı yeşili verir. Bu yüzden ilk kol mekanizmanın canlı
 * olduğunu, KARIŞIK kol da süzgecin gerçek ihlali hâlâ geçirmediğini kanıtlar.
 *
 * ⚠ ASIL ZARAR MESAJ DEĞİL, PANOYA DÜŞEN NOT SAYISIDIR — o yüzden sayılıyor.
 */

const require = createRequire(import.meta.url)
const KAPI = require.resolve('../../../.claude/hooks/bash-write-audit.cjs')
const BEN = 'inv-bw4-ben'
const BASKASI = 'inv-bw4-baskasi'

interface Sonuc {
  kod: number
  cikti: string
  /** Panoya düşen `note` olayı sayısı — asıl zarar bu. */
  notSayisi: number
}

/**
 * @param yazilacaklar worktree'ye SONRADAN yazılacak dosyalar (yol -> içerik).
 * @param manifestVar manifest yazılsın mı (fail-closed kolunu ölçmek için).
 */
function kos(yazilacaklar: Record<string, string>, manifestVar = true): Sonuc {
  const betik = `
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process')
const ana = fs.mkdtempSync(path.join(os.tmpdir(), 'bw4-ana-'))
const wtKok = fs.mkdtempSync(path.join(os.tmpdir(), 'bw4-wt-'))
const wt = path.join(wtKok, 'agac')
const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'bw4-pano-'))
const g = (a, c) => cp.execFileSync('git', a, { cwd: c || ana, encoding: 'utf8' })
g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't'])

// KORUMALI alan BASKA seridin. Icine hem gercek kaynak hem companion cifti konur:
// companion siniflandirmasi "yaninda ayni adli KAYNAK dosya var mi" diye sorar.
fs.mkdirSync(path.join(ana, 'korumali'), { recursive: true })
fs.writeFileSync(path.join(ana, 'korumali', 'ilk.txt'), 'ilk')
fs.writeFileSync(path.join(ana, 'korumali', 'Bilesen.ts'), 'export const x = 1\\n')
fs.mkdirSync(path.join(ana, 'docs'), { recursive: true })
if (${JSON.stringify(manifestVar)}) {
  fs.writeFileSync(path.join(ana, 'docs', 'artefakt_manifest.json'), JSON.stringify({
    surum: 1,
    artefaktlar: [
      // ⚠ 'ad' = URUN. 'kaynak.dosyalar' KASTEN dolduruldu: siniflandirma oraya
      // BAKMAMALI (AXIOM 8 dersi — kaynak listesine bakan suzgec kaynagi urun sanar).
      { ad: 'korumali_master.md', kaynak: { dosyalar: { 'korumali/Bilesen.ts': 'aaa' } } },
    ],
  }))
}
g(['add', '-A']); g(['-c', 'core.hooksPath=', 'commit', '-q', '-m', 'ilk'])
g(['worktree', 'add', '-q', wt, '-b', 'dal'])

const wtGitDir = cp.execFileSync('git', ['rev-parse', '--absolute-git-dir'],
  { cwd: wt, encoding: 'utf8' }).trim()
fs.writeFileSync(path.join(wtGitDir, 'venthub-sid'), ${JSON.stringify(BEN)} + '\\n')

fs.writeFileSync(
  path.join(pano, 'events.' + ${JSON.stringify(BASKASI)} + '.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), sid: ${JSON.stringify(BASKASI)},
    type: 'claim', lane: 'BASKA', globs: ['korumali/**', 'docs/**'] }) + '\\n',
)

const env = Object.assign({}, process.env, { VENTHUB_BOARD_DIR: pano })
const yuk = JSON.stringify({ session_id: ${JSON.stringify(BEN)}, tool_name: 'Bash',
  tool_input: { command: 'echo x' }, cwd: wt })
const tur = () => {
  const r = cp.spawnSync(process.execPath, [${JSON.stringify(KAPI)}], { input: yuk, env, encoding: 'utf8' })
  return { kod: r.status, cikti: (r.stdout || '') + (r.stderr || '') }
}

// TABAN turu: mevcut kirlilik taban olur (delta modeli), alarm otmez.
tur()

// Olculen tur: hedef dosyalar yazilir.
const yazilacaklar = ${JSON.stringify(yazilacaklar)}
for (const [bagil, icerik] of Object.entries(yazilacaklar)) {
  const tam = path.join(wt, bagil)
  fs.mkdirSync(path.dirname(tam), { recursive: true })
  fs.writeFileSync(tam, icerik)
}
const olculen = tur()

let notSayisi = 0
try {
  const dosya = path.join(pano, 'events.' + ${JSON.stringify(BEN)} + '.jsonl')
  if (fs.existsSync(dosya)) {
    for (const satir of fs.readFileSync(dosya, 'utf8').split('\\n')) {
      if (!satir.trim()) continue
      try { if (JSON.parse(satir).type === 'note') notSayisi++ } catch { /* yoksay */ }
    }
  }
} catch { /* yoksay */ }

console.log(JSON.stringify({ kod: olculen.kod, cikti: olculen.cikti, notSayisi }))
`
  const ham = execFileSync(process.execPath, ['-e', betik], { encoding: 'utf8', timeout: 90_000 })
  const satirlar = ham.trim().split('\n')
  return JSON.parse(satirlar[satirlar.length - 1]) as Sonuc
}

describe('INV-BASH-WRITE-4 · uretilmis artefakt ihlali dikis yeri ihlali degildir', () => {
  it('MEKANİZMA CANLI — GERÇEK dosya başka şeridin globunda değişince alarm ÖTER', () => {
    const r = kos({ 'korumali/yabanci.txt': 'elle yazdim' })

    expect(r.kod, 'kapı ötmedi — aşağıdaki susma kolları hiçbir şey kanıtlamaz').toBe(2)
    expect(r.cikti).toContain('DIKIS YERI ALARMI')
    expect(r.notSayisi, 'şerit sahibine not GİTMELİ').toBe(1)
  })

  it('COMPANION .md SUSAR — üreteç çıktısı bloklamaz ve panoya NOT DÜŞMEZ', () => {
    // korumali/Bilesen.ts fikstürde VAR; yani Bilesen.md bir companion'dir.
    const r = kos({ 'korumali/Bilesen.md': '# uretilmis companion' })

    expect(r.kod, 'companion bloklamaya devam ediyor — gürültü kapıyı körleştirir').toBe(0)
    expect(r.notSayisi, '⭐ASIL ZARAR: karşı şeridin dikkati boşa harcanıyor').toBe(0)
    // Susmak YETMEZ: "sustu" ile "böyle sınıflandırdı" ayırt edilebilir olmalı.
    expect(r.cikti, 'sınıflandırma GÖRÜNÜR değil — sessiz muafiyet, sessiz ezme kadar kötüdür')
      .toContain('DUSUK SIDDET')
    expect(r.cikti).toContain('companion')
  })

  it('MANİFESTTE ÜRÜN olan dosya da SUSAR (docs/*_master.md sınıfı)', () => {
    const r = kos({ 'docs/korumali_master.md': '# uretilmis master' })

    expect(r.kod).toBe(0)
    expect(r.notSayisi).toBe(0)
    expect(r.cikti).toContain('manifestte URUN')
  })

  it('⭐KARIŞIK — gerçek + üretilmiş birlikteyse alarm ÖTER ama not YALNIZ gerçeği anlatır', () => {
    const r = kos({
      'korumali/yabanci.txt': 'elle yazdim',
      'korumali/Bilesen.md': '# uretilmis companion',
    })

    expect(r.kod, 'gerçek ihlal varken susmak süzgecin FAZLA GENİŞ olduğu anlamına gelir').toBe(2)
    expect(
      r.notSayisi,
      'not sayısı 1 olmalı: üretilmiş olan için ayrı not düşerse gürültü geri gelir',
    ).toBe(1)
    // Gercek ihlal alarm satirinda olmali, uretilmis olan DUSUK SIDDET satirinda.
    expect(r.cikti).toContain('yabanci.txt')
    expect(r.cikti).toContain('DUSUK SIDDET')
  })

  it('SÜZGEÇ DAR — kardeş kaynağı OLMAYAN .md üretilmiş SAYILMAZ (elle yazılmış belge)', () => {
    // korumali/ELKITABI.ts YOK -> ELKITABI.md companion degildir, GERCEK ihlaldir.
    const r = kos({ 'korumali/ELKITABI.md': 'elle yazilmis belge' })

    expect(r.kod, 'her .md üretilmiş sayılıyor — süzgeç fazla geniş, gerçek belgeler korumasız').toBe(2)
    expect(r.notSayisi).toBe(1)
  })

  it('FAIL-CLOSED — manifest OKUNAMAZSA sınıf ölçülemez ve ihlal GERÇEK sayılır', () => {
    // Companion olsa bile: "olcemedim" ile "uretilmis" ayni kefeye konmaz (cetvel s5).
    const r = kos({ 'korumali/Bilesen.md': '# companion ama manifest yok' }, false)

    expect(r.kod, 'ölçülemeyen sınıf sessizce muaf tutuldu — fail-OPEN').toBe(2)
    expect(r.cikti, 'ölçülemezlik SESSİZ kalmamalı').toContain('OLCULEMEDI')
  })
})
