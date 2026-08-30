import { execFileSync } from 'node:child_process'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BASH-WRITE-2 — GERİ ALMA MUAFİYETİ.
 *
 * ⭐NİÇİN VAR (2026-08-28, ölçülmüş vaka): `bash-write-audit` doğru bir dikiş-yeri alarmı verdi
 * ve çözümünü de yazdı — *"değişikliği geri al: `git checkout -- <yol>`"*. Geri almaya
 * kalkıldığında `bash-write-guard` **bloklad**. Bir kapının ÖNERDİĞİ düzeltmeyi öteki kapı
 * yasaklıyordu; guard "yazma"yı görür, NİYETİ görmez — geri alma da bir yazmadır. Düzeltme yolu
 * kapalı bir alarm, alarm olmaktan çıkar.
 *
 * Muafiyet DAR ve İKİ ŞARTLI, ve bu testin işi tam olarak o iki şartı ayırt etmektir:
 *   1. komutun TÜM hedefleri geri-alma sebepli olacak (karışık komut muafiyet almaz),
 *   2. ağaç İZOLE WORKTREE olacak — ANA DEPODA muafiyet YOK (orada `checkout` başkasının
 *      commit'siz ara işini sessizce siler; bu depo o dersi 2026-08-20'de yaşadı).
 *
 * `git restore --staged` kapsam dışıdır: index'i değiştirir, HEAD'e döndürme değildir.
 *
 * ⭐BİÇİM KASITLI — kaynak metni taranmıyor, kapı GERÇEKTEN koşturuluyor: her kol geçici bir
 * ana depo + gerçek `git worktree` kurar, panoyu `VENTHUB_BOARD_DIR` ile İZOLE eder ve guard'a
 * gerçek PreToolUse yükü verip ÇIKIŞ KODUNU ölçer. Bu depoda dize araması bir sabotajı kaçırdı;
 * ölçüt davranış olmalı.
 */

const KAPI = path.resolve(__dirname, '../../../.claude/hooks/bash-write-guard.cjs')
const BEN = 'aaaaaaaa-1111-2222-3333-444444444444'
const BASKASI = 'bbbbbbbb-9999-8888-7777-666666666666'

interface Sonuc {
  kod: number
  ciktilar: string
}

/**
 * Fikstür: ana depo + gerçek worktree + izole pano + BAŞKA şeridin claim'i.
 * `nerede` kapının hangi ağaçta koştuğunu belirler — muafiyetin ikinci şartı budur.
 */
function kapiyiKos(komut: string, nerede: 'worktree' | 'ana', gitYok = false): Sonuc {
  const betik = `
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process')
const ana = fs.mkdtempSync(path.join(os.tmpdir(), 'gm-ana-'))
const wtKok = fs.mkdtempSync(path.join(os.tmpdir(), 'gm-wt-'))
const wt = path.join(wtKok, 'agac')
const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'gm-pano-'))
const g = (a, c) => cp.execFileSync('git', a, { cwd: c || ana, encoding: 'utf8' })
g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't'])
fs.mkdirSync(path.join(ana, 'korumali'), { recursive: true })
fs.writeFileSync(path.join(ana, 'korumali', 'x.md'), 'ilk')
g(['add', '-A']); g(['-c', 'core.hooksPath=', 'commit', '-q', '-m', 'ilk'])
g(['worktree', 'add', '-q', wt, '-b', 'dal'])

// BASKA seridin canli claim'i — korumali/** onun.
fs.writeFileSync(
  path.join(pano, 'events.' + ${JSON.stringify(BASKASI)} + '.jsonl'),
  JSON.stringify({ ts: new Date().toISOString(), sid: ${JSON.stringify(BASKASI)},
    type: 'claim', lane: 'BASKA', globs: ['korumali/**'] }) + '\\n',
)

const kok = ${JSON.stringify(nerede)} === 'ana' ? ana : wt
const yuk = JSON.stringify({
  session_id: ${JSON.stringify(BEN)},
  tool_name: 'Bash',
  tool_input: { command: ${JSON.stringify(komut)} },
  cwd: kok,
})
const env = Object.assign({}, process.env, { VENTHUB_BOARD_DIR: pano })
if (${JSON.stringify(gitYok)}) { env.PATH = ''; env.Path = '' }
const r = cp.spawnSync(process.execPath, [${JSON.stringify(KAPI)}], { input: yuk, env, encoding: 'utf8' })
console.log(JSON.stringify({ kod: r.status, ciktilar: (r.stdout || '') + (r.stderr || '') }))
`
  const ham = execFileSync(process.execPath, ['-e', betik], { encoding: 'utf8', timeout: 90000 })
  const satirlar = ham.trim().split('\n')
  return JSON.parse(satirlar[satirlar.length - 1]) as Sonuc
}

describe('INV-BASH-WRITE-2 · geri alma muafiyeti — dar ve iki şartlı', () => {
  it('MEKANİZMA CANLI — bu fikstürde kapı gerçekten BLOKLUYOR (sessizliği kanıt yapan kol)', () => {
    // Bu kol olmadan aşağıdaki "muafiyet geçti" sonuçları hiçbir şey kanıtlamaz: hiç koşmayan
    // kapı da 0 döner. Önce kapının bu fikstürde karar verdiğini kanıtlıyoruz.
    const r = kapiyiKos('echo bozuk > korumali/x.md', 'worktree')
    expect(r.ciktilar).toMatch(/BAŞKA bir oturumun şeridinde/)
    expect(r.kod).toBe(2)
  })

  it('ŞART 1 — izole worktree\'de `git checkout --` GEÇER ve muafiyeti SÖYLER', () => {
    const r = kapiyiKos('git checkout -- korumali/x.md', 'worktree')
    expect(r.ciktilar).toMatch(/GERI ALMA MUAFIYETI/)
    expect(r.kod).toBe(0)
  })

  it('ŞART 2 — AYNI komut ANA DEPODA bloklanır (muafiyet orada YOK)', () => {
    // Ana depoda `checkout` başkasının commit'siz ara işini sessizce siler.
    const r = kapiyiKos('git checkout -- korumali/x.md', 'ana')
    expect(r.ciktilar).toMatch(/BAŞKA bir oturumun şeridinde/)
    expect(r.ciktilar).not.toMatch(/GERI ALMA MUAFIYETI/)
    expect(r.kod).toBe(2)
  })

  it('`git restore` de aynı sınıf — izole ağaçta geçer', () => {
    const r = kapiyiKos('git restore korumali/x.md', 'worktree')
    expect(r.ciktilar).toMatch(/GERI ALMA MUAFIYETI/)
    expect(r.kod).toBe(0)
  })

  it('`git restore --staged` KAPSAM DIŞI — index\'i değiştirir, muafiyet almaz', () => {
    const r = kapiyiKos('git restore --staged korumali/x.md', 'worktree')
    expect(r.ciktilar).not.toMatch(/GERI ALMA MUAFIYETI/)
    expect(r.kod).toBe(2)
  })

  it('KARIŞIK KOMUT muafiyet almaz — tek yabancı yazma bütün komutu kapatır', () => {
    const r = kapiyiKos('git checkout -- korumali/x.md && echo ek >> korumali/x.md', 'worktree')
    expect(r.ciktilar).not.toMatch(/GERI ALMA MUAFIYETI/)
    expect(r.kod).toBe(2)
  })

  it('FAIL-CLOSED — ağaç türü ÖLÇÜLEMEZSE muafiyet AÇILMAZ', () => {
    // ⭐Sabotaj bu kolu kör yakaladı: `anaDepoMu`'nun catch dalını `false` yapınca (yani ölçüm
    // hatasında muafiyet AÇILINCA) test yeşil kalıyordu — çünkü fikstürde ölçüm hep başarılıydı
    // ve catch dalına hiç girilmiyordu. Bir kolu test etmek için o kola GİRDİRMEK gerekir.
    // PATH boşaltılınca guard `git`i çalıştıramaz; muafiyet ölçülemez, dolayısıyla açılmamalı.
    const r = kapiyiKos('git checkout -- korumali/x.md', 'worktree', true)
    expect(r.ciktilar).not.toMatch(/GERI ALMA MUAFIYETI/)
    expect(r.kod).toBe(2)
  })

  it('NEGATİF KONTROL — kendi claim\'indeki dosyada muafiyet mesajı ÜRETİLMEZ (gürültü yok)', () => {
    // Çakışma yoksa muafiyet kolu hiç çalışmamalı: kapı zaten sessizce geçirir.
    const r = kapiyiKos('git checkout -- serbest.md', 'worktree')
    expect(r.ciktilar).not.toMatch(/GERI ALMA MUAFIYETI/)
    expect(r.kod).toBe(0)
  })
})
