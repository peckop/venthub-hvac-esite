import { execFileSync } from 'node:child_process'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BASH-WRITE-3 — BİRLEŞTİRME MUAFİYETİ (`bash-write-audit`).
 *
 * ⭐NİÇİN VAR (2026-08-28, ölçülmüş vaka — aynı gün ÜÇ kez ötdü):
 * `git merge origin/master` çalışma ağacına BAŞKA ŞERİTLERİN master'a inmiş dosyalarını
 * getirir. Denetim "sonuca bakar" (ne değişti?) ve bu dosyaları bu şeridin YAZDIĞI iş
 * sanıyordu. Sonuç: içeriği YAZAN değil TAŞIYAN cezalanıyordu, üstelik ilgisiz şerit
 * sahibine otomatik "senin dosyanı değiştirdim" notu düşüyordu.
 *
 * `lane-precommit.cjs`'te bu muafiyet ZATEN VARDI (MERGE_HEAD/CHERRY_PICK_HEAD/REVERT_HEAD),
 * `bash-write-audit.cjs`'te YOKTU. İki kapının aynı olguya zıt hüküm vermesi, §12'de
 * adlandırdığımız "düzeltme yolu kapalı alarm" sınıfının kardeşidir: normal iş akışını ihlal
 * sayan alarm, birkaç gün içinde görmezden gelinir ve GERÇEK sinyal onunla birlikte ölür.
 *
 * ⭐BİÇİM KASITLI — kaynak metni taranmıyor, kanca GERÇEKTEN koşturuluyor: her kol geçici bir
 * ana depo + gerçek `git worktree` kurar, kimlik dosyasını yazar (denetim ağacı kimlikten
 * çözer), panoyu `VENTHUB_BOARD_DIR` ile İZOLE eder, önce TABAN turunu koşturur, sonra
 * kirletir ve ÇIKIŞ KODUNU ölçer. Bu depoda dize araması bir sabotajı kaçırdı; ölçüt
 * davranış olmalı.
 *
 * ⚠ ÖLÇÜLEMEYEN SINIR — dürüstçe yazılıyor: kancadaki `!olculdu` (fail-closed) kolu bu
 * fikstürde GİRDİRİLEMİYOR. Sebep sırada: `git status` bütün ağaçlar için başarısız olursa
 * denetim daha yukarıda `okunanAgac === 0` ile sessizce çıkar; yani `git`in ölü olduğu her
 * senaryoda birleştirme ölçümüne HİÇ GELİNMEZ. Guard testindeki "PATH'i boşalt" tekniği bu
 * yüzden burada işe yaramaz. Kol kodda savunma olarak duruyor ama KANITLANMADI — "ölçemedim"
 * ile "geçti" ayrı şeylerdir ve bu satır o ayrımı korumak için var.
 */

const KAPI = path.resolve(__dirname, '../../../.claude/hooks/bash-write-audit.cjs')
const BEN = 'aaaaaaaa-1111-2222-3333-444444444444'
const BASKASI = 'bbbbbbbb-9999-8888-7777-666666666666'

type Isaret = 'MERGE_HEAD' | 'CHERRY_PICK_HEAD' | 'REVERT_HEAD' | null

interface Tur {
  kod: number
  ciktilar: string
}

interface Sonuc {
  taban: Tur
  olculen: Tur
  /** İşaret silindikten sonra YENİ bir yabancı dosyayla koşulan tur (muafiyet kapandı mı?). */
  ucuncu: Tur | null
  /** Panoya düşen `note` olayı sayısı — asıl zarar bu; mesaj değil SAYI ölçülür. */
  notSayisi: number
}

/**
 * Fikstür: ana depo + gerçek worktree + kimlik dosyası + izole pano + BAŞKA şeridin claim'i.
 *
 * `isaret` worktree'nin git dizinine yazılır — `git rev-parse --absolute-git-dir` worktree'de
 * tam o dizini döndürür, yani kanca ile fikstür AYNI yeri konuşur.
 */
function kos(opts: { isaret: Isaret; kirlet: boolean; ucuncuTur?: boolean }): Sonuc {
  const betik = `
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process')
const ana = fs.mkdtempSync(path.join(os.tmpdir(), 'am-ana-'))
const wtKok = fs.mkdtempSync(path.join(os.tmpdir(), 'am-wt-'))
const wt = path.join(wtKok, 'agac')
const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'am-pano-'))
const g = (a, c) => cp.execFileSync('git', a, { cwd: c || ana, encoding: 'utf8' })
g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't'])
fs.mkdirSync(path.join(ana, 'korumali'), { recursive: true })
fs.writeFileSync(path.join(ana, 'korumali', 'x.md'), 'ilk')
g(['add', '-A']); g(['-c', 'core.hooksPath=', 'commit', '-q', '-m', 'ilk'])
g(['worktree', 'add', '-q', wt, '-b', 'dal'])

// KIMLIK: denetim agaci cwd'den DEGIL kimlik dosyasindan cozer (s9 dersi).
const wtGitDir = cp.execFileSync('git', ['rev-parse', '--absolute-git-dir'],
  { cwd: wt, encoding: 'utf8' }).trim()
fs.writeFileSync(path.join(wtGitDir, 'venthub-sid'), ${JSON.stringify(BEN)} + '\\n')

// BASKA seridin canli claim'i — korumali/** onun.
fs.writeFileSync(
  path.join(pano, 'events.' + ${JSON.stringify(BASKASI)} + '.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), sid: ${JSON.stringify(BASKASI)},
    type: 'claim', lane: 'BASKA', globs: ['korumali/**'] }) + '\\n',
)

const env = Object.assign({}, process.env, { VENTHUB_BOARD_DIR: pano })
const yuk = JSON.stringify({ session_id: ${JSON.stringify(BEN)}, tool_name: 'Bash',
  tool_input: { command: 'echo x' }, cwd: wt })
const tur = () => {
  const r = cp.spawnSync(process.execPath, [${JSON.stringify(KAPI)}], { input: yuk, env, encoding: 'utf8' })
  return { kod: r.status, ciktilar: (r.stdout || '') + (r.stderr || '') }
}

// 1) TABAN turu: mevcut kirlilik taban olur, alarm otmez.
const taban = tur()

// 2) Olculen tur: once isaret + kirlilik, sonra kosum.
const isaret = ${JSON.stringify(opts.isaret)}
if (isaret) fs.writeFileSync(path.join(wtGitDir, isaret), '0'.repeat(40) + '\\n')
if (${JSON.stringify(opts.kirlet)}) fs.writeFileSync(path.join(wt, 'korumali', 'y.md'), 'yabanci')
const olculen = tur()

// 3) Ucuncu tur: isaret silinir, YENI bir yabanci dosya kirletilir -> muafiyet kapandi mi?
let ucuncu = null
if (${JSON.stringify(!!opts.ucuncuTur)}) {
  if (isaret) fs.unlinkSync(path.join(wtGitDir, isaret))
  fs.writeFileSync(path.join(wt, 'korumali', 'z.md'), 'ikinci yabanci')
  ucuncu = tur()
}

// Panoya dusen not SAYISI — asil zarar bu.
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

console.log(JSON.stringify({ taban, olculen, ucuncu, notSayisi }))
`
  const ham = execFileSync(process.execPath, ['-e', betik], { encoding: 'utf8', timeout: 90000 })
  const satirlar = ham.trim().split('\n')
  return JSON.parse(satirlar[satirlar.length - 1]) as Sonuc
}

describe('INV-BASH-WRITE-3 · birleştirme muafiyeti — dar, sesli, fail-closed', () => {
  it('MEKANİZMA CANLI — birleştirme YOKKEN kapı gerçekten ÖTÜYOR (sessizliği kanıt yapan kol)', () => {
    // Bu kol olmadan aşağıdaki "muafiyet geçti" sonuçları hiçbir şey kanıtlamaz: hiç koşmayan
    // kanca da 0 döner. Önce alarmın bu fikstürde GERÇEKTEN kurulduğunu kanıtlıyoruz.
    const r = kos({ isaret: null, kirlet: true })
    expect(r.taban.kod).toBe(0)
    expect(r.olculen.ciktilar).toMatch(/DIKIS YERI ALARMI/)
    expect(r.olculen.kod).toBe(2)
  })

  it('MERGE_HEAD — entegre edilen içerik muaf, alarm ÖTMEZ', () => {
    const r = kos({ isaret: 'MERGE_HEAD', kirlet: true })
    expect(r.olculen.ciktilar).toMatch(/BIRLESTIRME MUAFIYETI/)
    expect(r.olculen.ciktilar).not.toMatch(/DIKIS YERI ALARMI/)
    expect(r.olculen.kod).toBe(0)
  })

  it('CHERRY_PICK_HEAD ve REVERT_HEAD de aynı sınıf', () => {
    for (const isaret of ['CHERRY_PICK_HEAD', 'REVERT_HEAD'] as const) {
      const r = kos({ isaret, kirlet: true })
      expect(r.olculen.ciktilar, isaret).toMatch(/BIRLESTIRME MUAFIYETI/)
      expect(r.olculen.kod, isaret).toBe(0)
    }
  })

  it('MUAFİYET SESLİ — hâli ve muaf tutulan yol SAYISINI basar', () => {
    // Sessiz muafiyet ile kancanın hiç koşmaması aynı görünür (§12.2).
    const r = kos({ isaret: 'MERGE_HEAD', kirlet: true })
    expect(r.olculen.ciktilar).toMatch(/MERGE_HEAD halinde/)
    expect(r.olculen.ciktilar).toMatch(/1 yeni yol ENTEGRE EDILEN icerik sayildi/)
  })

  it('⭐ASIL ZARAR ÖLÇÜLÜYOR — muafiyet varken şerit sahibine YANLIŞ NOT düşmez', () => {
    // Alarmın stderr kolu yalnız bu oturuma döner; panoya düşen not BAŞKASINI meşgul eder.
    // Bugünkü vakada zarar tam buydu. Ölçüt mesaj değil, panodaki not SAYISI.
    const muaf = kos({ isaret: 'MERGE_HEAD', kirlet: true })
    expect(muaf.notSayisi).toBe(0)

    // AYIRT EDİCİ: aynı fikstür, işaret YOK -> not DÜŞER. Sıfır, mekanizmanın çalışmamasından
    // değil muafiyetten geliyor.
    const muafDegil = kos({ isaret: null, kirlet: true })
    expect(muafDegil.notSayisi).toBe(1)
  })

  it('MUAFİYET KALICI DEĞİL — işaret kalkınca alarm geri gelir', () => {
    // Muafiyet bir KÖR NOKTA bırakmamalı: merge bitince hâl biter, kapı yine ötmeli.
    const r = kos({ isaret: 'MERGE_HEAD', kirlet: true, ucuncuTur: true })
    expect(r.olculen.kod).toBe(0)
    expect(r.ucuncu?.ciktilar).toMatch(/DIKIS YERI ALARMI/)
    expect(r.ucuncu?.kod).toBe(2)
  })

  it('NEGATİF KONTROL — yeni kirli yol yokken muafiyet mesajı ÜRETİLMEZ (gürültü yok)', () => {
    const r = kos({ isaret: 'MERGE_HEAD', kirlet: false })
    expect(r.olculen.ciktilar).not.toMatch(/BIRLESTIRME MUAFIYETI/)
    expect(r.olculen.kod).toBe(0)
  })
})
